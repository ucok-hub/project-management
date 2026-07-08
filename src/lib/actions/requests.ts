"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { requests } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getRequestById } from "@/lib/data/requests";
import { decideRequestCore } from "@/lib/core/engine";
import { notify } from "@/lib/notify";

function refreshRequestViews(requestId: string) {
  revalidatePath(`/permintaan/${requestId}`);
  revalidatePath("/permintaan");
  revalidatePath("/persetujuan");
  revalidatePath("/beranda");
  revalidatePath("/tugas-saya");
  revalidatePath("/saya-beri");
}

/** ACC atau tolak sebuah permintaan (slot yang menjadi hak user ini). */
export async function decideRequest(formData: FormData): Promise<void> {
  const me = await requireUser();
  const requestId = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (decision !== "setuju" && decision !== "tolak") return;

  const before = await getRequestById(requestId);
  if (!before) return;

  const result = await decideRequestCore(
    db,
    requestId,
    { id: me.id, positionId: me.positionId },
    decision,
  );

  if (result.outcome === "ditolak") {
    await notify(result.requesterId, {
      type: "permintaan_ditolak",
      title: "Permintaan ditolak",
      body: `${me.name} menolak: ${before.title}`,
      link: `/permintaan/${requestId}`,
    });
  } else if (result.outcome === "disetujui") {
    await notify(result.targetId, {
      type: "tugas_baru",
      title: "Permintaan disetujui — tugas baru untuk Anda",
      body: before.title,
      link: `/tugas/${result.taskId}`,
    });
    await notify(result.requesterId, {
      type: "permintaan_disetujui",
      title: "Permintaan Anda disetujui 🎉",
      body: before.title,
      link: `/tugas/${result.taskId}`,
    });
  }

  refreshRequestViews(requestId);
}

/** Peminta membatalkan permintaannya sendiri. */
export async function cancelRequest(formData: FormData): Promise<void> {
  const me = await requireUser();
  const requestId = String(formData.get("requestId") ?? "");
  const req = await db.query.requests.findFirst({ where: eq(requests.id, requestId) });
  if (!req || req.requesterId !== me.id || req.status !== "menunggu") return;

  await db.update(requests).set({ status: "dibatalkan", resolvedAt: new Date() }).where(eq(requests.id, requestId));
  refreshRequestViews(requestId);
  redirect("/permintaan");
}
