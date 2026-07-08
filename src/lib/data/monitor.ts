import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { getPositionMap } from "@/lib/data/positions";
import { getUsersInPositions } from "@/lib/data/users";
import { getDescendantIds } from "@/lib/permissions";
import { isOverdue, type TaskStatus } from "@/lib/format";
import type { CurrentUser } from "@/lib/auth";

export type MonitorActive = {
  id: string;
  title: string;
  status: TaskStatus;
  deadline: Date | null;
};

export async function getMonitorData(user: CurrentUser) {
  const map = await getPositionMap();
  const scopePosIds = getDescendantIds(map, user.positionId);
  const people = await getUsersInPositions(scopePosIds);
  const userIds = people.map((u) => u.id);
  const all = userIds.length
    ? await db.query.tasks.findMany({ where: inArray(tasks.assigneeId, userIds) })
    : [];

  const byAssignee = new Map<string, typeof all>();
  for (const t of all) {
    const a = byAssignee.get(t.assigneeId) ?? [];
    a.push(t);
    byAssignee.set(t.assigneeId, a);
  }

  const totals = { belum: 0, dikerjakan: 0, menunggu_acc: 0, selesai: 0, overdue: 0 };

  const rows = people.map((u) => {
    const list = byAssignee.get(u.id) ?? [];
    const summary = { belum: 0, dikerjakan: 0, menunggu_acc: 0, selesai: 0 };
    let overdue = 0;
    const active: MonitorActive[] = [];
    for (const t of list) {
      const s = t.status as TaskStatus;
      summary[s]++;
      if (isOverdue(t.deadline, s)) overdue++;
      if (s === "dikerjakan" || s === "belum") {
        active.push({ id: t.id, title: t.title, status: s, deadline: t.deadline });
      }
    }
    totals.belum += summary.belum;
    totals.dikerjakan += summary.dikerjakan;
    totals.menunggu_acc += summary.menunggu_acc;
    totals.selesai += summary.selesai;
    totals.overdue += overdue;
    active.sort((a, b) => (a.status === b.status ? 0 : a.status === "dikerjakan" ? -1 : 1));
    return {
      user: u,
      summary,
      overdue,
      activeCount: summary.belum + summary.dikerjakan + summary.menunggu_acc,
      active,
    };
  });

  rows.sort(
    (a, b) => a.user.position.sort - b.user.position.sort || a.user.name.localeCompare(b.user.name),
  );

  return { totals, rows };
}
