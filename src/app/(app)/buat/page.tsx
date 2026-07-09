import { requireUser } from "@/lib/auth";
import { getActiveUsers } from "@/lib/data/users";
import { getAllPositions } from "@/lib/data/positions";
import { CreateForm } from "@/components/create-form";

export default async function BuatPage() {
  const me = await requireUser();
  const users = await getActiveUsers();
  const positions = await getAllPositions();

  const usersLite = users.map((u) => ({
    id: u.id,
    name: u.name,
    positionId: u.positionId,
    positionName: u.position.name,
    positionSort: u.position.sort,
  }));
  const positionsLite = positions.map((p) => ({
    id: p.id,
    parentId: p.parentId,
    name: p.name,
    sort: p.sort,
  }));

  return (
    <div className="space-y-4 pb-4 lg:mx-auto lg:max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Buat Tugas</h1>
        <p className="text-sm text-slate-500">
          Pilih orangnya, sistem otomatis menentukan langsung jadi tugas atau perlu persetujuan.
        </p>
      </div>
      <CreateForm me={{ id: me.id, positionId: me.positionId }} users={usersLite} positions={positionsLite} />
    </div>
  );
}
