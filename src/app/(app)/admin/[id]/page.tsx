import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getUserById } from "@/lib/data/users";
import { getPresenceForUsers } from "@/lib/data/presence";
import { timeAgo } from "@/lib/format";
import { getAllPositions } from "@/lib/data/positions";
import { UserEditForm, PasswordResetForm } from "@/components/admin/user-edit-form";
import { SetHeaderBack } from "@/components/app-shell/header-back";
import { PresenceAvatar } from "@/components/presence/presence-avatar";

export default async function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  const { status, lastSeenAt } = (await getPresenceForUsers([user.id]))[user.id];
  const positions = [...(await getAllPositions())]
    .sort((a, b) => a.sort - b.sort)
    .map((p) => ({ id: p.id, name: p.name }));
  const isSelf = user.id === me.id;

  return (
    <div className="space-y-4 pb-4 lg:mx-auto lg:max-w-xl">
      <SetHeaderBack title="Kelola Pengguna" fallbackHref="/admin" />

      <div className="flex items-center gap-3">
          <p className="mt-1 text-sm font-medium">
            {status === "online" && <span className="text-emerald-600">Online sekarang</span>}
            {status === "idle" && <span className="text-amber-600">Idle</span>}
            {status === "offline" && (
              <span className="text-slate-500">
                {lastSeenAt ? `Terakhir dilihat: ${timeAgo(lastSeenAt)}` : "Belum pernah online"}
              </span>
            )}
          </p>
        <PresenceAvatar userId={user.id} name={user.name} src={user.avatarUrl} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500">@{user.username}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-slate-900">Data Pengguna</h2>
        <UserEditForm
          user={{
            id: user.id,
            name: user.name,
            positionId: user.positionId,
            isAdmin: user.isAdmin,
            isActive: user.isActive,
          }}
          positions={positions}
          isSelf={isSelf}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-slate-900">Reset Password</h2>
        <PasswordResetForm userId={user.id} />
      </div>
    </div>
  );
}
