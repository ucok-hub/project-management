"use client";

import { useActionState } from "react";
import { Save, KeyRound, CheckCircle2 } from "lucide-react";
import {
  updateUserAction,
  resetUserPasswordAction,
  type AdminFormState,
} from "@/lib/actions/admin";
import { Field, Input, Select } from "@/components/ui/form";
import { buttonClass } from "@/components/ui/button";

type UserData = {
  id: string;
  name: string;
  positionId: string;
  isAdmin: boolean;
  isActive: boolean;
};

export function UserEditForm({
  user,
  positions,
  isSelf,
}: {
  user: UserData;
  positions: { id: string; name: string }[];
  isSelf: boolean;
}) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(updateUserAction, {});

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={user.id} />
      <Field label="Nama lengkap" htmlFor="name" required>
        <Input id="name" name="name" defaultValue={user.name} required maxLength={60} />
      </Field>
      <Field label="Jabatan" htmlFor="positionId" required>
        <Select id="positionId" name="positionId" defaultValue={user.positionId}>
          {positions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>

      <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          name="isAdmin"
          defaultChecked={user.isAdmin}
          disabled={isSelf}
          className="h-5 w-5 rounded border-slate-300"
        />
        Admin (bisa kelola pengguna)
      </label>
      <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={user.isActive}
          disabled={isSelf}
          className="h-5 w-5 rounded border-slate-300"
        />
        Akun aktif (bisa login)
      </label>
      {isSelf && (
        <p className="text-xs text-slate-400">
          Anda tidak bisa menonaktifkan atau menurunkan akun sendiri.
        </p>
      )}

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-5 w-5" /> Perubahan tersimpan.
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClass("primary", "md", "w-full")}>
        <Save className="h-5 w-5" /> {pending ? "Menyimpan…" : "Simpan Perubahan"}
      </button>
    </form>
  );
}

export function PasswordResetForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    resetUserPasswordAction,
    {},
  );

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />
      <Field label="Password baru" htmlFor="reset-password" hint="Minimal 4 karakter.">
        <Input id="reset-password" name="password" required placeholder="mis. 12345" />
      </Field>
      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-5 w-5" /> Password berhasil direset.
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClass("secondary", "md", "w-full")}>
        <KeyRound className="h-5 w-5" /> {pending ? "Menyimpan…" : "Reset Password"}
      </button>
    </form>
  );
}
