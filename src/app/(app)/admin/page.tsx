import Link from "next/link";
import { UserPlus, CheckCircle2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAllUsers } from "@/lib/data/users";
import { buttonClass } from "@/components/ui/button";
import { UserList } from "@/components/admin/user-list";

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

      <UserList users={sorted} />
    </div>
  );
}
