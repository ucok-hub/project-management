"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { presence } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { getPresenceForUsers } from "@/lib/data/presence";
import type { PresenceStatus } from "@/lib/presence";

export async function heartbeatAction(clientStatus: "online" | "idle"): Promise<void> {
  const me = await requireUser();
  if (clientStatus !== "online" && clientStatus !== "idle") {
    throw new Error("Status presence tidak valid.");
  }

  const now = new Date();
  await db
    .insert(presence)
    .values({ userId: me.id, status: clientStatus, lastSeenAt: now })
    .onConflictDoUpdate({
      target: presence.userId,
      set: { status: clientStatus, lastSeenAt: now },
    });
}

export async function getPresenceStatusesAction(
  userIds: string[],
): Promise<Record<string, PresenceStatus>> {
  await requireUser();
  if (!Array.isArray(userIds)) return {};
  const ids = [...new Set(userIds)]
    .filter((id) => typeof id === "string" && id.length > 0 && id.length <= 200)
    .slice(0, 100);
  const info = await getPresenceForUsers(ids);
  return Object.fromEntries(ids.map((id) => [id, info[id]?.status ?? "offline"]));
}

/** Hapus hanya presence milik sesi pemanggil. Aman dipanggil dari logout. */
export async function clearPresenceAction(): Promise<void> {
  const me = await getCurrentUser();
  if (me) await db.delete(presence).where(eq(presence.userId, me.id));
}
