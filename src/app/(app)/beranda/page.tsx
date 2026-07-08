import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Plus, ArrowRight, BadgeCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getInboxCounts } from "@/lib/data/inbox";
import {
  getTasksAssignedTo,
  summarizeByStatus,
  sortTasksForDisplay,
} from "@/lib/data/tasks";
import { TaskCard } from "@/components/task-card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClass } from "@/components/ui/button";
import { TASK_STATUS } from "@/lib/format";

export default async function BerandaPage() {
  const user = await requireUser();
  const myTasks = await getTasksAssignedTo(user.id);
  const counts = await getInboxCounts(user);
  const summary = summarizeByStatus(myTasks);

  const active = sortTasksForDisplay(
    myTasks.filter((t) => t.status === "belum" || t.status === "dikerjakan"),
  ).slice(0, 4);

  const tiles = [
    { key: "belum", value: summary.belum },
    { key: "dikerjakan", value: summary.dikerjakan },
    { key: "menunggu_acc", value: summary.menunggu_acc },
  ] as const;

  return (
    <div className="space-y-5 pb-4">
      <p className="text-sm capitalize text-slate-500">
        {format(new Date(), "EEEE, d MMMM yyyy", { locale: id })}
      </p>

      {/* Ringkasan tugas saya */}
      <div className="grid grid-cols-3 gap-2.5">
        {tiles.map(({ key, value }) => {
          const st = TASK_STATUS[key];
          return (
            <div
              key={key}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm"
            >
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {st.emoji} {st.short}
              </p>
            </div>
          );
        })}
      </div>

      {/* Perlu persetujuan */}
      {counts.pendingApprovals > 0 && (
        <Link
          href="/persetujuan"
          className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm active:bg-blue-100"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
            <BadgeCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-blue-900">
              {counts.pendingApprovals} hal menunggu persetujuan Anda
            </p>
            <p className="text-sm text-blue-700">Ketuk untuk meninjau</p>
          </div>
          <ArrowRight className="h-5 w-5 text-blue-700" />
        </Link>
      )}

      {/* Tugas terdekat */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Tugas terdekat</h2>
          <Link href="/tugas-saya" className="text-sm font-semibold text-teal-700">
            Lihat semua
          </Link>
        </div>

        {active.length === 0 ? (
          <EmptyState
            title="Tidak ada tugas aktif 🎉"
            description="Semua tugas Anda sudah beres atau belum ada tugas baru."
            action={
              <Link href="/buat" className={buttonClass("primary", "md")}>
                <Plus className="h-5 w-5" /> Buat Tugas
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {active.map((t) => (
              <TaskCard key={t.id} task={t} perspective="assignee" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
