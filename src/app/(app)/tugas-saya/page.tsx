import { requireUser } from "@/lib/auth";
import { getTasksAssignedTo, sortTasksForDisplay } from "@/lib/data/tasks";
import { Tabs } from "@/components/ui/tabs";
import { TaskList } from "@/components/task-list";

export default async function TugasSayaPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const me = await requireUser();
  const f = (await searchParams).f ?? "aktif";
  const all = sortTasksForDisplay(await getTasksAssignedTo(me.id));

  const aktif = all.filter((t) => t.status !== "selesai");
  const selesai = all.filter((t) => t.status === "selesai");
  const list = f === "selesai" ? selesai : aktif;

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold text-slate-900">Tugas Saya</h1>

      <Tabs
        active={f}
        items={[
          { key: "aktif", label: "Aktif", href: "/tugas-saya?f=aktif", count: aktif.length },
          { key: "selesai", label: "Selesai", href: "/tugas-saya?f=selesai", count: selesai.length },
        ]}
      />

      <TaskList
        tasks={list}
        perspective="assignee"
        emptyTitle={f === "selesai" ? "Belum ada tugas selesai" : "Tidak ada tugas aktif 🎉"}
        emptyDescription={
          f === "selesai"
            ? "Tugas yang sudah selesai akan muncul di sini."
            : "Semua tugas Anda beres. Santai dulu!"
        }
        showCreateCta={f !== "selesai"}
      />
    </div>
  );
}
