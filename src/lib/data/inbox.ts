import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { tasks, requests, requestApprovals, notifications } from "@/db/schema";
import type { CurrentUser } from "@/lib/auth";

/** Jumlah lonceng: notifikasi belum dibaca & hal yang perlu ACC saya. */
export async function getInboxCounts(user: CurrentUser) {
  // Tugas yang menunggu ACC saya (sebagai pemberi tugas).
  const completions = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.giverId, user.id), eq(tasks.status, "menunggu_acc")));

  // Slot persetujuan permintaan yang bisa saya tindak.
  const reqSlots = await db
    .select({ reqId: requestApprovals.requestId })
    .from(requestApprovals)
    .innerJoin(requests, eq(requests.id, requestApprovals.requestId))
    .where(
      and(
        eq(requests.status, "menunggu"),
        eq(requestApprovals.decision, "menunggu"),
        or(
          and(eq(requestApprovals.role, "diminta"), eq(requestApprovals.userId, user.id)),
          and(eq(requestApprovals.role, "atasan"), eq(requestApprovals.positionId, user.positionId)),
        ),
      ),
    );

  const unread = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

  const pendingApprovals = completions.length + new Set(reqSlots.map((r) => r.reqId)).size;
  return { pendingApprovals, unreadNotifications: unread.length };
}
