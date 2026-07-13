import { LogOut, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { ChangePasswordForm } from "@/components/change-password-form";
import { Avatar } from "@/components/ui/avatar";
import { SubmitButton } from "@/components/ui/submit-button";
import { AvatarActions } from "@/components/avatar-upload/avatar-actions";

export default async function ProfilPage() {
  const me = await requireUser();

  return (
    <div className="space-y-5 pb-4 lg:mx-auto lg:max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Profil</h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar name={me.name} src={me.avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-900">{me.name}</p>
            <p className="text-sm text-slate-500">{me.position.name}</p>
            <p className="mt-1 text-xs text-slate-400">@{me.username}</p>
            {me.isAdmin && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 border-t border-slate-100 pt-4">
          <AvatarActions hasAvatar={!!me.avatarUrl} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-slate-900">Ganti Password</h2>
        <ChangePasswordForm />
      </div>

      <form action={logoutAction}>
        <SubmitButton variant="secondary" size="lg" className="w-full text-red-600" pendingText="Keluar…">
          <LogOut className="h-5 w-5" /> Keluar
        </SubmitButton>
      </form>
    </div>
  );
}
