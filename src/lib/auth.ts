import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { User, Position } from "@/db/schema";

const COOKIE_NAME = "sesi";
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari — kotak "ingat saya" dicentang
const SESSION_MAX_AGE = 60 * 60 * 24; // 1 hari — jaring pengaman bila browser tak hapus cookie sesi

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET belum diset di .env");
  return new TextEncoder().encode(secret);
}

export type CurrentUser = User & { position: Position };

/**
 * Buat sesi login (menyimpan cookie JWT).
 * `remember=true` (default, kotak "ingat saya" dicentang) -> sesi bertahan 30 hari.
 * `remember=false` -> cookie sesi (hilang saat browser ditutup) + token kedaluwarsa
 * 1 hari sebagai jaring pengaman kalau browser tak benar-benar menghapusnya.
 */
export async function createSession(userId: string, remember: boolean = true): Promise<void> {
  const maxAge = remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE;
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge } : {}),
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Ambil user yang sedang login (beserta jabatannya), atau null. Di-cache per-request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { position: true },
  });
  if (!user || !user.isActive) return null;
  return user as CurrentUser;
});

/** Wajib login; kalau tidak, alihkan ke halaman masuk. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  return user;
}

/** Wajib admin; kalau bukan, alihkan ke beranda. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.isAdmin) redirect("/beranda");
  return user;
}

/** Verifikasi username + password. */
export async function verifyCredentials(
  username: string,
  password: string,
): Promise<User | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.username, username.toLowerCase().trim()),
  });
  if (!user || !user.isActive) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
