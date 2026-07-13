import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTaskById } from "@/lib/data/tasks";
import { getCommentsForTask } from "@/lib/data/comments";
import { TaskActions } from "@/components/task-actions";
import { CommentForm } from "@/components/comment-form";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SetHeaderBack } from "@/components/app-shell/header-back";
import {
  TASK_STATUS,
  formatDeadline,
  formatDateTime,
  isOverdue,
  type TaskStatus,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { resolveTaskDefaultSection } from "@/lib/task-section";

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ baru?: string }>;
}) {
  const { id } = await params;
  const { baru } = await searchParams;
  const me = await requireUser();
  const [task, taskComments] = await Promise.all([getTaskById(id), getCommentsForTask(id)]);
  if (!task) notFound();

  const status = task.status as TaskStatus;
  const st = TASK_STATUS[status];
  const isAssignee = task.assigneeId === me.id;
  const isGiver = task.giverId === me.id;
  const isSelf = task.giverId === task.assigneeId;
  const overdue = isOverdue(task.deadline, status);
  const backHref = resolveTaskDefaultSection(me, task);

  return (
    <div className="space-y-4 pb-4 lg:mx-auto lg:max-w-xl">
      <SetHeaderBack title="Detail Tugas" fallbackHref={backHref} />

      {baru === "1" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5" /> Tugas berhasil dibuat.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <Badge className={cn("text-sm", st.badge)}>
            {st.emoji} {st.label}
          </Badge>
          <Badge className="border-slate-200 bg-slate-50 text-slate-500">
            {task.origin === "permintaan" ? "Dari permintaan" : "Tugas langsung"}
          </Badge>
        </div>

        <h1 className="mt-3 text-xl font-bold leading-snug text-slate-900">{task.title}</h1>

        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 text-sm",
            overdue ? "font-semibold text-red-600" : "text-slate-500",
          )}
        >
          {overdue ? <AlertTriangle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
          Batas waktu: {formatDeadline(task.deadline)}
          {overdue && " · Lewat waktu"}
        </div>

        {/* Pihak */}
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <PartyRow label="Dari" name={task.giver.name} sub={task.giver.position.name} />
          <PartyRow label="Untuk" name={task.assignee.name} sub={task.assignee.position.name} />
        </div>

        {task.note && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            <p className="mb-1 flex items-center gap-1.5 font-semibold text-slate-500">
              <FileText className="h-4 w-4" /> Catatan
            </p>
            <p className="whitespace-pre-wrap">{task.note}</p>
          </div>
        )}

        {task.returnNote && status === "dikerjakan" && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="mb-1 font-semibold">↩️ Dikembalikan untuk diperbaiki:</p>
            <p className="whitespace-pre-wrap">{task.returnNote}</p>
          </div>
        )}

        {task.origin === "permintaan" && task.requestId && (
          <Link
            href={`/permintaan/${task.requestId}`}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700"
          >
            Lihat permintaan asal <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}

        <p className="mt-4 text-xs text-slate-400">Dibuat {formatDateTime(task.createdAt)}</p>
      </div>

      <TaskActions
        taskId={task.id}
        status={status}
        isAssignee={isAssignee}
        isGiver={isGiver}
        isSelf={isSelf}
        giverName={task.giver.name}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-1.5 font-bold text-slate-900">
          <MessageSquare className="h-4 w-4" /> Komentar
          {taskComments.length > 0 && (
            <span className="font-normal text-slate-400">({taskComments.length})</span>
          )}
        </h2>

        {(isGiver || isAssignee) && <CommentForm taskId={task.id} />}

        {taskComments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Belum ada komentar.</p>
        ) : (
          <ul className="mt-4 space-y-3.5">
            {taskComments.map((c) => (
              <li key={c.id} className="flex items-start gap-2.5">
                <Avatar name={c.author.name} size="sm" />
                <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3.5 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">{c.author.name}</p>
                    <p className="shrink-0 text-xs text-slate-400">{formatDateTime(c.createdAt)}</p>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">{c.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PartyRow({ label, name, sub }: { label: string; name: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} size="sm" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate font-semibold text-slate-800">
          {name} <span className="font-normal text-slate-400">· {sub}</span>
        </p>
      </div>
    </div>
  );
}
