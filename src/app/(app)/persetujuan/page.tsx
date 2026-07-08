import { BadgeCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTasksGivenBy, sortTasksForDisplay } from "@/lib/data/tasks";
import { getRequestsNeedingUser } from "@/lib/data/requests";
import { TaskCard } from "@/components/task-card";
import { RequestCard } from "@/components/request-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PersetujuanPage() {
  const me = await requireUser();

  const given = await getTasksGivenBy(me.id);
  const awaiting = sortTasksForDisplay(given.filter((t) => t.status === "menunggu_acc"));
  const requests = await getRequestsNeedingUser(me);

  const empty = awaiting.length === 0 && requests.length === 0;

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Perlu Persetujuan Anda</h1>
        <p className="text-sm text-slate-500">Tinjau dan setujui di sini.</p>
      </div>

      {empty && (
        <EmptyState
          icon={<BadgeCheck className="h-10 w-10" />}
          title="Tidak ada yang perlu disetujui 🎉"
          description="Semua permintaan dan pengajuan selesai sudah Anda tinjau."
        />
      )}

      {requests.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Permintaan ({requests.length})
          </h2>
          {requests.map((r) => (
            <RequestCard key={r.id} req={r} needsMe />
          ))}
        </section>
      )}

      {awaiting.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Tugas menunggu ACC selesai ({awaiting.length})
          </h2>
          {awaiting.map((t) => (
            <TaskCard key={t.id} task={t} perspective="giver" />
          ))}
        </section>
      )}
    </div>
  );
}
