"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { markAllNotificationsRead } from "@/lib/data/notifications";

export async function markAllReadAction(): Promise<void> {
  const me = await requireUser();
  await markAllNotificationsRead(me.id);
  revalidatePath("/notifikasi");
  revalidatePath("/beranda");
}
