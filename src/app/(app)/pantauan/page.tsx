import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { canMonitor } from "@/lib/roles";
import { getMonitorData } from "@/lib/data/monitor";
import { EmptyState } from "@/components/ui/empty-state";
import { MonitorList } from "@/components/monitor-list";
import { TASK_STATUS } from "@/lib/format";

export default async function PantauanPage() {
  const me = await requireUser();
  if (!(await canMonitor(me))) redirect("/beranda");

  const { totals, rows } = await getMonitorData(me);
  const scopeLabel = me.positionId === "dirut" ? "Seluruh perusahaan" : "Tim di bawah Anda";

  const tiles = [
    { key: "belum", value: totals.belum },
    { key: "dikerjakan", value: totals.dikerjakan },
    { key: "menunggu_acc", value: totals.menunggu_acc },
    { key: "selesai", value: totals.selesai },
  ] as const;

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pantauan</h1>
        <p className="text-sm text-slate-500">{scopeLabel} · {rows.length} orang</p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-4 gap-2 lg:max-w-xl">
        {tiles.map(({ key, value }) => {
          const st = TASK_STATUS[key];
          return (
            <div key={key} className="rounded-xl border border-slate-200 bg-white p-2 text-center shadow-sm">
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="mt-0.5 text-[10px] font-medium leading-tight text-slate-500">
                {st.emoji} {st.short}
              </p>
            </div>
          );
        })}
      </div>

      {totals.overdue > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertTriangle className="h-5 w-5" /> {totals.overdue} tugas lewat batas waktu
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState title="Belum ada anggota tim" description="Tidak ada bawahan untuk dipantau." />
      ) : (
        <MonitorList rows={rows} />
      )}
    </div>
  );
}
