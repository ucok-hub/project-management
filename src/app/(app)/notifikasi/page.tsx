import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/lib/data/notifications";
import { markAllReadAction } from "@/lib/actions/notifications";
import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/ui/submit-button";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const TYPE_STYLE: Record<string, string> = {
  tugas_baru: "bg-teal-100 text-teal-700",
  permintaan_baru: "bg-blue-100 text-blue-700",
  perlu_acc: "bg-blue-100 text-blue-700",
  permintaan_disetujui: "bg-emerald-100 text-emerald-700",
  permintaan_ditolak: "bg-red-100 text-red-700",
  tugas_menunggu_acc: "bg-blue-100 text-blue-700",
  tugas_disetujui: "bg-emerald-100 text-emerald-700",
  tugas_dikembalikan: "bg-amber-100 text-amber-700",
  komentar_baru: "bg-violet-100 text-violet-700",
};

export default async function NotifikasiPage() {
  const me = await requireUser();
  const items = await getNotifications(me.id);
  const hasUnread = items.some((n) => !n.isRead);

  return (
    <div className="space-y-4 pb-4 lg:mx-auto lg:max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Notifikasi</h1>
        {hasUnread && (
          <form action={markAllReadAction}>
            <SubmitButton variant="secondary" size="sm" pendingText="…">
              <CheckCheck className="h-4 w-4" /> Tandai dibaca
            </SubmitButton>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-10 w-10" />}
          title="Belum ada notifikasi"
          description="Pemberitahuan tugas & permintaan akan muncul di sini."
        />
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Inner = (
              <div
                className={cn(
                  "flex gap-3 rounded-2xl border p-3.5",
                  n.isRead ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/60",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    TYPE_STYLE[n.type] ?? "bg-slate-100 text-slate-600",
                  )}
                >
                  <Bell className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  {n.body && <p className="text-sm text-slate-600">{n.body}</p>}
                  <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />}
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} className="block active:opacity-80">
                {Inner}
              </Link>
            ) : (
              <div key={n.id}>{Inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
