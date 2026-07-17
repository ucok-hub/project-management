"use client";

import { useActionState } from "react";
import { publishChangelog, type PublishChangelogState } from "@/lib/actions/changelogs";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

export function ChangelogPublishForm() {
  const [state, formAction] = useActionState<PublishChangelogState, FormData>(publishChangelog, {});

  return (
    <form action={formAction} className="space-y-3">
      <Field label="Versi (opsional)" htmlFor="version">
        <Input id="version" name="version" placeholder="mis. 1.4" />
      </Field>
      <Field label="Judul" htmlFor="title" required>
        <Input id="title" name="title" required placeholder="mis. Deadline sekarang bisa pakai jam" />
      </Field>
      <Field label="Isi" htmlFor="body" required hint="Semua pengguna aktif akan dapat notifikasi + pop-up.">
        <Textarea id="body" name="body" required rows={5} placeholder="Jelaskan pembaruannya..." />
      </Field>

      {state.error && <p className="text-sm font-medium text-red-700">{state.error}</p>}
      {state.success && (
        <p className="text-sm font-medium text-emerald-700">
          ✅ Diterbitkan — semua pengguna aktif diberi notifikasi.
        </p>
      )}

      <SubmitButton pendingText="Menerbitkan…">Terbitkan Pembaruan</SubmitButton>
    </form>
  );
}
