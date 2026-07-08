"use client";

import { useActionState } from "react";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { changePasswordAction, type PasswordState } from "@/lib/actions/account";
import { Field, Input } from "@/components/ui/form";
import { buttonClass } from "@/components/ui/button";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<PasswordState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <Field label="Password lama" htmlFor="current">
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="Password baru" htmlFor="next" hint="Minimal 4 karakter.">
        <Input id="next" name="next" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Ulangi password baru" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-5 w-5" /> Password berhasil diganti.
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClass("primary", "md", "w-full")}>
        <KeyRound className="h-5 w-5" /> {pending ? "Menyimpan…" : "Ganti Password"}
      </button>
    </form>
  );
}
