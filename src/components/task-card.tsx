import Link from "next/link";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS, formatDeadline, isOverdue, type TaskStatus } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TaskWithParties } from "@/lib/data/tasks";

export function TaskCard({
  task,
  perspective,
}: {
  task: TaskWithParties;
  perspective?: "assignee" | "giver";
}) {
  const st = TASK_STATUS[task.status as TaskStatus];
  const overdue = isOverdue(task.deadline, task.status as TaskStatus);

  return (
    <Link
      href={`/tugas/${task.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors active:bg-slate-50"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold leading-snug text-slate-900">{task.title}</p>
        <Badge className={cn("shrink-0", st.badge)}>
          {st.emoji} {st.short}
        </Badge>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-500">
        {perspective !== "giver" && (
          <span>
            Dari <b className="font-medium text-slate-700">{task.giver.name}</b>
          </span>
        )}
        {perspective !== "assignee" && (
          <span>
            Untuk <b className="font-medium text-slate-700">{task.assignee.name}</b>
          </span>
        )}
      </div>

      <div
        className={cn(
          "mt-2 inline-flex items-center gap-1.5 text-sm",
          overdue ? "font-semibold text-red-600" : "text-slate-500",
        )}
      >
        {overdue ? <AlertTriangle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
        {formatDeadline(task.deadline)}
        {overdue && " · Lewat waktu"}
      </div>
    </Link>
  );
}
