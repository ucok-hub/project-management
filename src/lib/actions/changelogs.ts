"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { changelogs, users } from "@/db/schema";
import { requireDev, requireUser } from "@/lib/auth";
import { markChangelogSeenNow } from "@/lib/data/changelogs";
import { notifyMany } from "@/lib/notify";
import { newId } from "@/lib/utils";

export type PublishChangelogState = { error?: string; success?: boolean };

/** Terbitkan catatan pembaruan baru. Hanya akun developer. Broadcast ke semua user aktif & tidak tersembunyi. */
export async function publishChangelog(
  _prev: PublishChangelogState,
  formData: FormData,
): Promise<PublishChangelogState> {
  const me = await requireDev();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const version = String(formData.get("version") ?? "").trim() || null;
  if (!title || !body) return { error: "Judul dan isi wajib diisi." };

  await db.insert(changelogs).values({ id: newId(), version, title, body, publishedById: me.id });

  const recipients = await db.query.users.findMany({
    where: and(eq(users.isActive, true), eq(users.isHidden, false)),
  });
  await notifyMany(
    recipients.map((u) => u.id),
    {
      type: "pembaruan_baru",
      title: "Ada pembaruan aplikasi",
      body: title,
      link: "/pembaruan",
    },
  );

  revalidatePath("/", "layout");
  revalidatePath("/dev");
  return { success: true };
}

/** Dipanggil saat popup pembaruan ditutup — tandai terlihat & bersihkan cache layout global. */
export async function dismissChangelogPopup(): Promise<void> {
  const me = await requireUser();
  await markChangelogSeenNow(me.id);
  revalidatePath("/", "layout");
}
