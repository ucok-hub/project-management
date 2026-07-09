import { cache } from "react";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { tasks, requests, requestApprovals, notifications } from "@/db/schema";
import type { CurrentUser } from "@/lib/auth";

/** Jumlah lonceng: notifikasi belum dibaca & hal yang perlu ACC saya. Di-cache per-request + 3 query dijalankan paralel. */
export const getInboxCounts = cache(async (user: CurrentUser) => {
  const [completions, reqSlots, unread] = await Promise.all([
    // Tugas yang menunggu ACC saya (sebagai pemberi tugas).
    db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.giverId, user.id), eq(tasks.status, "menunggu_acc"))),

    // Slot persetujuan permintaan yang bisa saya tindak.
    db
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
      ),

    db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false))),
  ]);

  const pendingApprovals = completions.length + new Set(reqSlots.map((r) => r.reqId)).size;
  return { pendingApprovals, unreadNotifications: unread.length };
});
