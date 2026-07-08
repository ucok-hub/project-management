import Link from "next/link";
import { UserPlus, ShieldCheck, ChevronRight, CheckCircle2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAllUsers } from "@/lib/data/users";
import { Avatar } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requireAdmin();
  const ok = (await searchParams).ok;
  const users = await getAllUsers();
  const sorted = [...users].sort(
    (a, b) => a.position.sort - b.position.sort || a.name.localeCompare(b.name),
  );

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Kelola Pengguna</h1>
        <Link href="/admin/baru" className={buttonClass("primary", "sm")}>
          <UserPlus className="h-4 w-4" /> Tambah
        </Link>
      </div>

      {ok === "tambah" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5" /> Pengguna baru berhasil ditambahkan.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {sorted.map((u, i) => (
          <Link
            key={u.id}
            href={`/admin/${u.id}`}
            className={`flex items-center gap-3 px-4 py-3 active:bg-slate-50 ${
              i === sorted.length - 1 ? "" : "border-b border-slate-100"
            }`}
          >
            <Avatar name={u.name} size="sm" />
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
    </div>
  );
}
