import { requireAdmin } from "@/lib/auth";
import { getAllPositions } from "@/lib/data/positions";
import { UserCreateForm } from "@/components/admin/user-create-form";
import { BackLink } from "@/components/ui/back-link";

export default async function AdminBaruPage() {
  await requireAdmin();
  const positions = [...(await getAllPositions())]
    .sort((a, b) => a.sort - b.sort)
    .map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="space-y-4 pb-4">
      <BackLink href="/admin" label="Kelola Pengguna" />
      <h1 className="text-xl font-bold text-slate-900">Tambah Pengguna</h1>
      <UserCreateForm positions={positions} />
    </div>
  );
}
