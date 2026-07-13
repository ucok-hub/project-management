"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { getAllUsers } from "@/lib/data/users";

type UserRow = Awaited<ReturnType<typeof getAllUsers>>[number];

export function UserList({ users }: { users: UserRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.position.name.toLowerCase().includes(q),
    );
  }, [users, query]);

  return (
    <div className="space-y-3">
      <SearchInput value={query} onChange={setQuery} placeholder="Cari nama, username, atau jabatan..." />

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ditemukan"
          description={`Tidak ada pengguna yang cocok dengan "${query}".`}
        />
      ) : (
        <>
          {/* Daftar — HP & tablet */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden">
            {filtered.map((u, i) => (
              <Link
                key={u.id}
                href={`/admin/${u.id}`}
                className={`flex items-center gap-3 px-4 py-3 active:bg-slate-50 ${
                  i === filtered.length - 1 ? "" : "border-b border-slate-100"
                }`}
              >
                <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <span className="truncate">{u.name}</span>
                    {!u.isActive && (
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        NONAKTIF
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {u.position.name} · @{u.username}
                  </p>
                </div>
                {u.isAdmin && <ShieldCheck className="h-4 w-4 shrink-0 text-teal-600" />}
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>

          {/* Tabel — desktop */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Jabatan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Admin</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className={cn(i !== filtered.length - 1 && "border-b border-slate-100")}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/${u.id}`} className="flex items-center gap-2.5 hover:text-teal-700">
                        <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                        <span className="truncate font-semibold text-slate-900">{u.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">@{u.username}</td>
                    <td className="px-4 py-3 text-slate-500">{u.position.name}</td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-500">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.isAdmin && <ShieldCheck className="mx-auto h-4 w-4 text-teal-600" />}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/${u.id}`} aria-label={`Kelola ${u.name}`}>
                        <ChevronRight className="h-5 w-5 text-slate-300 hover:text-teal-600" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
