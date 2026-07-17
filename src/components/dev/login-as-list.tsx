import { loginAsUser } from "@/lib/actions/dev";
import { Avatar } from "@/components/ui/avatar";
import { SubmitButton } from "@/components/ui/submit-button";

type Row = { id: string; name: string; username: string; position: { name: string } };

export function LoginAsList({ users }: { users: Row[] }) {
  if (users.length === 0) {
    return <p className="text-sm text-slate-400">Tidak ada pengguna.</p>;
  }
  return (
    <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {users.map((u) => (
        <form key={u.id} action={loginAsUser} className="flex items-center gap-3 px-4 py-2.5">
          <input type="hidden" name="userId" value={u.id} />
          <Avatar name={u.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{u.name}</p>
            <p className="truncate text-xs text-slate-400">
              @{u.username} · {u.position.name}
            </p>
          </div>
          <SubmitButton
            variant="secondary"
            size="sm"
            pendingText="…"
            confirm={`Login sebagai ${u.name}? Anda akan meninggalkan sesi dev — untuk kembali, logout lalu login lagi sebagai "dev".`}
          >
            Login sebagai
          </SubmitButton>
        </form>
      ))}
    </div>
  );
}
