"use client";

import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import { RequestCard } from "@/components/request-card";
import { CardGrid } from "@/components/ui/card-grid";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import type { RequestFull } from "@/lib/data/requests";

export function RequestList({
  requests,
  needsMeIds,
  emptyTitle,
  emptyDescription,
}: {
  requests: RequestFull[];
  needsMeIds: Set<string>;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.requester.name.toLowerCase().includes(q) ||
        r.target.name.toLowerCase().includes(q),
    );
  }, [requests, query]);

  return (
    <div className="space-y-3">
      {requests.length > 0 && (
        <SearchInput value={query} onChange={setQuery} placeholder="Cari judul atau nama orang..." />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-10 w-10" />}
          title={query ? "Tidak ditemukan" : emptyTitle}
          description={
            query ? `Tidak ada permintaan yang cocok dengan "${query}".` : emptyDescription
          }
        />
      ) : (
        <CardGrid>
          {filtered.map((r) => (
            <RequestCard key={r.id} req={r} needsMe={needsMeIds.has(r.id)} />
          ))}
        </CardGrid>
      )}
    </div>
  );
}
