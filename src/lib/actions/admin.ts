"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, positions } from "@/db/schema";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { newId } from "@/lib/utils";

export type AdminFormState = { error?: string; ok?: boolean };

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function createUserAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const positionId = String(formData.get("positionId") ?? "");
  const password = String(formData.get("password") ?? "");
  const isAdmin = formData.get("isAdmin") === "on";

  if (!name || !username || !positionId || !password) return { error: "Lengkapi semua kolom." };
  if (!USERNAME_RE.test(username))
    return { error: "Username 3–20 karakter: huruf kecil, angka, atau garis bawah." };
  if (password.length < 4) return { error: "Password minimal 4 karakter." };

  const exists = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (exists) return { error: "Username sudah dipakai." };
  const pos = await db.query.positions.findFirst({ where: eq(positions.id, positionId) });
  if (!pos) return { error: "Jabatan tidak valid." };

  await db.insert(users).values({
    id: newId(),
    name,
    username,
    positionId,
    passwordHash: await hashPassword(password),
    isAdmin,
  });
  revalidatePath("/admin");
  redirect("/admin?ok=tambah");
}

export async function updateUserAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const me = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const positionId = String(formData.get("positionId") ?? "");
  const isAdmin = formData.get("isAdmin") === "on";
  const isActive = formData.get("isActive") === "on";

  if (!userId || !name || !positionId) return { error: "Lengkapi semua kolom." };

  // Cegah admin mengunci diri sendiri.
  const finalActive = userId === me.id ? true : isActive;
  const finalAdmin = userId === me.id ? true : isAdmin;

  await db
    .update(users)
    .set({ name, positionId, isAdmin: finalAdmin, isActive: finalActive })
    .where(eq(users.id, userId));
  revalidatePath("/admin");
  revalidatePath(`/admin/${userId}`);
  return { ok: true };
}

export async function resetUserPasswordAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 4) return { error: "Password minimal 4 karakter." };

  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, userId));
  return { ok: true };
}
