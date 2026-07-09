import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { canMonitor } from "@/lib/roles";
import { getMonitorData } from "@/lib/data/monitor";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { TASK_STATUS } from "@/lib/format";
import { cn } from "@/lib/utils";

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
        <>
          {/* Kartu — HP & tablet */}
          <div className="space-y-2.5 lg:hidden">
            {rows.map(({ user, summary, overdue, activeCount, active }) => (
              <div key={user.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.position.name}</p>
                  </div>
                  {overdue > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5" /> {overdue}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                  <span>🔴 {summary.belum}</span>
                  <span>🟡 {summary.dikerjakan}</span>
                  <span>⏳ {summary.menunggu_acc}</span>
                  <span>🟢 {summary.selesai}</span>
                </div>

                {activeCount === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">Tidak ada tugas aktif</p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {active.slice(0, 3).map((t) => (
                      <li key={t.id}>
                        <Link
                          href={`/tugas/${t.id}`}
                          className="flex items-center gap-1.5 text-sm text-slate-700 hover:text-teal-700"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${TASK_STATUS[t.status].dot}`} />
                          <span className="truncate">{t.title}</span>
                        </Link>
                      </li>
                    ))}
                    {active.length > 3 && (
                      <li className="text-xs text-slate-400">+{active.length - 3} lagi</li>
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Tabel — desktop */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Jabatan</th>
                  <th className="px-3 py-3 text-center">🔴</th>
                  <th className="px-3 py-3 text-center">🟡</th>
                  <th className="px-3 py-3 text-center">⏳</th>
                  <th className="px-3 py-3 text-center">🟢</th>
                  <th className="px-4 py-3">Tugas aktif</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ user, summary, overdue, activeCount, active }, i) => (
                  <tr
                    key={user.id}
                    className={cn(
                      "align-top",
                      i !== rows.length - 1 && "border-b border-slate-100",
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={user.name} size="sm" />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate font-semibold text-slate-900">
                            {user.name}
                            {overdue > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                                <AlertTriangle className="h-3 w-3" /> {overdue}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.position.name}</td>
                    <td className="px-3 py-3 text-center font-semibold text-slate-700">{summary.belum}</td>
                    <td className="px-3 py-3 text-center font-semibold text-slate-700">{summary.dikerjakan}</td>
                    <td className="px-3 py-3 text-center font-semibold text-slate-700">{summary.menunggu_acc}</td>
                    <td className="px-3 py-3 text-center font-semibold text-slate-700">{summary.selesai}</td>
                    <td className="px-4 py-3">
                      {activeCount === 0 ? (
                        <span className="text-slate-400">Tidak ada</span>
                      ) : (
                        <ul className="space-y-1">
                          {active.slice(0, 2).map((t) => (
                            <li key={t.id}>
                              <Link
                                href={`/tugas/${t.id}`}
                                className="flex items-center gap-1.5 text-slate-700 hover:text-teal-700"
                              >
                                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TASK_STATUS[t.status].dot}`} />
                                <span className="max-w-xs truncate">{t.title}</span>
                              </Link>
                            </li>
                          ))}
                          {active.length > 2 && (
                            <li className="text-xs text-slate-400">+{active.length - 2} lagi</li>
                          )}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
