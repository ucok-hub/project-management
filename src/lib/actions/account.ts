"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser, hashPassword } from "@/lib/auth";

export type PasswordState = { error?: string; ok?: boolean };

export async function changePasswordAction(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const me = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!current || !next) return { error: "Lengkapi semua kolom." };
  if (next.length < 4) return { error: "Password baru minimal 4 karakter." };
  if (next !== confirm) return { error: "Konfirmasi password tidak sama." };

  const ok = await bcrypt.compare(current, me.passwordHash);
  if (!ok) return { error: "Password lama salah." };

  await db.update(users).set({ passwordHash: await hashPassword(next) }).where(eq(users.id, me.id));
  return { ok: true };
}
