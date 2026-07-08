import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTasksAssignedTo, sortTasksForDisplay } from "@/lib/data/tasks";
import { TaskCard } from "@/components/task-card";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClass } from "@/components/ui/button";

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

      {list.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title={f === "selesai" ? "Belum ada tugas selesai" : "Tidak ada tugas aktif 🎉"}
          description={
            f === "selesai"
              ? "Tugas yang sudah selesai akan muncul di sini."
              : "Semua tugas Anda beres. Santai dulu!"
          }
          action={
            f !== "selesai" ? (
              <Link href="/buat" className={buttonClass("primary", "md")}>
                <Plus className="h-5 w-5" /> Buat Tugas
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((t) => (
            <TaskCard key={t.id} task={t} perspective="assignee" />
          ))}
        </div>
      )}
    </div>
  );
}
