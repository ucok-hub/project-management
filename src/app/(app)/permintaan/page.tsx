import { Inbox } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getAllRequests, getRequestsNeedingUser } from "@/lib/data/requests";
import { RequestCard } from "@/components/request-card";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PermintaanPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const me = await requireUser();
  const tab = (await searchParams).f ?? "menunggu";
  const all = await getAllRequests();
  const needs = new Set((await getRequestsNeedingUser(me)).map((r) => r.id));

  const menunggu = all.filter((r) => r.status === "menunggu");
  const riwayat = all.filter((r) => r.status !== "menunggu");
  const list = tab === "riwayat" ? riwayat : menunggu;

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Papan Permintaan</h1>
        <p className="text-sm text-slate-500">Terbuka & transparan — semua orang bisa melihat.</p>
      </div>

      <Tabs
        active={tab}
        items={[
          { key: "menunggu", label: "Menunggu", href: "/permintaan?f=menunggu", count: menunggu.length },
          { key: "riwayat", label: "Riwayat", href: "/permintaan?f=riwayat", count: riwayat.length },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-10 w-10" />}
          title={tab === "riwayat" ? "Belum ada riwayat" : "Tidak ada permintaan menunggu"}
          description="Permintaan muncul saat seseorang menugaskan ke rekan sejajar, atasan, atau lintas divisi."
        />
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <RequestCard key={r.id} req={r} needsMe={needs.has(r.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
