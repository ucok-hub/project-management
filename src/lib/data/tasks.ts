import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import type { TaskStatus } from "@/lib/format";

const withParties = { giver: true, assignee: true } as const;

export async function getTasksAssignedTo(userId: string) {
  return db.query.tasks.findMany({ where: eq(tasks.assigneeId, userId), with: withParties });
}

export async function getTasksGivenBy(userId: string) {
  return db.query.tasks.findMany({ where: eq(tasks.giverId, userId), with: withParties });
}

export async function getTaskById(id: string) {
  return db.query.tasks.findFirst({
    where: eq(tasks.id, id),
    with: {
      giver: { with: { position: true } },
      assignee: { with: { position: true } },
      request: true,
    },
  });
}

export type TaskWithParties = Awaited<ReturnType<typeof getTasksAssignedTo>>[number];

const STATUS_ORDER: Record<TaskStatus, number> = {
  belum: 0,
  dikerjakan: 1,
  menunggu_acc: 2,
  selesai: 3,
};

/** Urutkan untuk tampilan: aktif dulu, lalu berdasarkan deadline terdekat. */
export function sortTasksForDisplay<T extends { status: string; deadline: Date | null; createdAt: Date }>(
  list: T[],
): T[] {
  return [...list].sort((a, b) => {
    const so = STATUS_ORDER[a.status as TaskStatus] - STATUS_ORDER[b.status as TaskStatus];
    if (so !== 0) return so;
    if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime();
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function summarizeByStatus(list: { status: string }[]) {
  const s = { belum: 0, dikerjakan: 0, menunggu_acc: 0, selesai: 0 };
  for (const t of list) {
    if (t.status in s) s[t.status as TaskStatus]++;
  }
  return s;
}
