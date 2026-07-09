import Link from "next/link";
import { Send, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTasksGivenBy, sortTasksForDisplay } from "@/lib/data/tasks";
import { TaskCard } from "@/components/task-card";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClass } from "@/components/ui/button";
import { CardGrid } from "@/components/ui/card-grid";

export default async function SayaBeriPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const me = await requireUser();
  const f = (await searchParams).f ?? "aktif";
  const all = sortTasksForDisplay(await getTasksGivenBy(me.id));

  const aktif = all.filter((t) => t.status !== "selesai");
  const selesai = all.filter((t) => t.status === "selesai");
  const list = f === "selesai" ? selesai : aktif;

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Tugas yang Saya Beri</h1>
        <Link href="/buat" className={buttonClass("primary", "sm")}>
          <Plus className="h-4 w-4" /> Buat
        </Link>
      </div>

      <Tabs
        active={f}
        items={[
          { key: "aktif", label: "Aktif", href: "/saya-beri?f=aktif", count: aktif.length },
          { key: "selesai", label: "Selesai", href: "/saya-beri?f=selesai", count: selesai.length },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Send className="h-10 w-10" />}
          title={f === "selesai" ? "Belum ada yang selesai" : "Belum memberi tugas"}
          description="Tugas yang Anda berikan ke orang lain akan muncul di sini."
          action={
            <Link href="/buat" className={buttonClass("primary", "md")}>
              <Plus className="h-5 w-5" /> Buat Tugas
            </Link>
          }
        />
      ) : (
        <CardGrid>
          {list.map((t) => (
            <TaskCard key={t.id} task={t} perspective="giver" />
          ))}
        </CardGrid>
      )}
    </div>
  );
}
