"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { createUserAction, type AdminFormState } from "@/lib/actions/admin";
import { Field, Input, Select } from "@/components/ui/form";
import { buttonClass } from "@/components/ui/button";

export function UserCreateForm({ positions }: { positions: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(createUserAction, {});

  return (
    <form action={action} className="space-y-4">
      <Field label="Nama lengkap" htmlFor="name" required>
        <Input id="name" name="name" required maxLength={60} placeholder="mis. Budi Santoso" />
      </Field>
      <Field label="Username" htmlFor="username" hint="Huruf kecil, angka, atau garis bawah." required>
        <Input id="username" name="username" required autoCapitalize="none" placeholder="mis. budi" />
      </Field>
      <Field label="Jabatan" htmlFor="positionId" required>
        <Select id="positionId" name="positionId" required defaultValue="">
          <option value="" disabled>
            — Pilih jabatan —
          </option>
          {positions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Password awal" htmlFor="password" hint="Minimal 4 karakter." required>
        <Input id="password" name="password" required placeholder="mis. 12345" />
      </Field>
      <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
        <input type="checkbox" name="isAdmin" className="h-5 w-5 rounded border-slate-300" />
        Jadikan admin (bisa kelola pengguna)
      </label>

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-full")}>
        <UserPlus className="h-5 w-5" /> {pending ? "Menyimpan…" : "Tambah Pengguna"}
      </button>
    </form>
  );
}
