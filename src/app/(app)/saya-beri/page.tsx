import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTasksGivenBy, sortTasksForDisplay } from "@/lib/data/tasks";
import { Tabs } from "@/components/ui/tabs";
import { TaskList } from "@/components/task-list";
import { buttonClass } from "@/components/ui/button";

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

      <TaskList
        tasks={list}
        perspective="giver"
        emptyTitle={f === "selesai" ? "Belum ada yang selesai" : "Belum memberi tugas"}
        emptyDescription="Tugas yang Anda berikan ke orang lain akan muncul di sini."
        showCreateCta
      />
    </div>
  );
}
