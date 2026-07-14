import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getUserById } from "@/lib/data/users";
import { getPresenceForUsers } from "@/lib/data/presence";
import { PresenceAvatar } from "@/components/presence/presence-avatar";
import { SetHeaderBack } from "@/components/app-shell/header-back";
import { timeAgo } from "@/lib/format";

export default async function PenggunaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  const { status, lastSeenAt } = (await getPresenceForUsers([id]))[id];

  return (
    <div className="space-y-4 pb-4 lg:mx-auto lg:max-w-xl">
      <SetHeaderBack title="Profil Pengguna" fallbackHref="/beranda" />
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <PresenceAvatar userId={user.id} name={user.name} src={user.avatarUrl} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-900">{user.name}</p>
          <p className="text-sm text-slate-500">{user.position.name}</p>
          <p className="mt-1.5 text-sm font-medium">
            {status === "online" && <span className="text-emerald-600">Online sekarang</span>}
            {status === "idle" && <span className="text-amber-600">Idle</span>}
            {status === "offline" && (
              <span className="text-slate-500">
                {lastSeenAt ? `Terakhir dilihat: ${timeAgo(lastSeenAt)}` : "Belum pernah online"}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
