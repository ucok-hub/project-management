import Link from "next/link";
import { UserPlus, ShieldCheck, ChevronRight, CheckCircle2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAllUsers } from "@/lib/data/users";
import { Avatar } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

      {/* Daftar — HP & tablet */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden">
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
            {sorted.map((u, i) => (
              <tr key={u.id} className={cn(i !== sorted.length - 1 && "border-b border-slate-100")}>
                <td className="px-4 py-3">
                  <Link href={`/admin/${u.id}`} className="flex items-center gap-2.5 hover:text-teal-700">
                    <Avatar name={u.name} size="sm" />
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
    </div>
  );
}
