"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, ClipboardList, Send } from "lucide-react";
import { TaskCard } from "@/components/task-card";
import { CardGrid } from "@/components/ui/card-grid";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClass } from "@/components/ui/button";
import type { TaskWithParties } from "@/lib/data/tasks";

export function TaskList({
  tasks,
  perspective,
  emptyTitle,
  emptyDescription,
  showCreateCta,
}: {
  tasks: TaskWithParties[];
  perspective: "assignee" | "giver";
  emptyTitle: string;
  emptyDescription: string;
  showCreateCta?: boolean;
}) {
  const [query, setQuery] = useState("");
  const Icon = perspective === "assignee" ? ClipboardList : Send;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.giver.name.toLowerCase().includes(q) ||
        t.assignee.name.toLowerCase().includes(q),
    );
  }, [tasks, query]);

  const createCta = (
    <Link href="/buat" className={buttonClass("primary", "md")}>
      <Plus className="h-5 w-5" /> Buat Tugas
    </Link>
  );

  return (
    <div className="space-y-3">
      {tasks.length > 0 && (
        <SearchInput value={query} onChange={setQuery} placeholder="Cari judul tugas atau nama..." />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Icon className="h-10 w-10" />}
          title={query ? "Tidak ditemukan" : emptyTitle}
          description={
            query ? `Tidak ada tugas yang cocok dengan "${query}".` : emptyDescription
          }
          action={!query && showCreateCta ? createCta : undefined}
        />
      ) : (
        <CardGrid>
          {filtered.map((t) => (
            <TaskCard key={t.id} task={t} perspective={perspective} />
          ))}
        </CardGrid>
      )}
    </div>
  );
}
