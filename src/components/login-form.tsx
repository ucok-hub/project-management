"use client";

import { useActionState } from "react";
import { LogIn, AlertCircle } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/actions/auth";
import { Field, Input } from "@/components/ui/form";
import { buttonClass } from "@/components/ui/button";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Username" htmlFor="username">
        <Input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          placeholder="Username Anda"
          required
          autoFocus
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Masukkan password"
          required
        />
      </Field>

      <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          name="remember"
          defaultChecked
          className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500/30"
        />
        Klik di sini biar nggak perlu login-login lagi
      </label>

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className={buttonClass("primary", "lg", "w-full")}
      >
        <LogIn className="h-5 w-5" />
        {pending ? "Sedang masuk…" : "Masuk"}
      </button>
    </form>
  );
}
