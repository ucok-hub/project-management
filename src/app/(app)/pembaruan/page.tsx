import { Megaphone } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getChangelogs, markChangelogSeenNow } from "@/lib/data/changelogs";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/format";

export default async function PembaruanPage() {
  const me = await requireUser();
  const items = await getChangelogs();
  await markChangelogSeenNow(me.id);

  return (
    <div className="space-y-4 pb-4 lg:mx-auto lg:max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Riwayat Pembaruan</h1>
        <p className="text-sm text-slate-500">Catatan pembaruan aplikasi, dari yang terbaru.</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-10 w-10" />}
          title="Belum ada catatan pembaruan"
          description="Pembaruan aplikasi akan muncul di sini."
        />
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-bold text-slate-900">{c.title}</h2>
                {c.version && (
                  <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                    v{c.version}
                  </span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{c.body}</p>
              <p className="mt-3 text-xs text-slate-400">{formatDateTime(c.publishedAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
