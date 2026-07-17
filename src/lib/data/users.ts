import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

/** Semua query di file ini mengecualikan akun tersembunyi (mis. akun developer). */

export async function getActiveUsers() {
  return db.query.users.findMany({
    where: and(eq(users.isActive, true), eq(users.isHidden, false)),
    with: { position: true },
    orderBy: [asc(users.name)],
  });
}

export async function getAllUsers() {
  return db.query.users.findMany({
    where: eq(users.isHidden, false),
    with: { position: true },
    orderBy: [asc(users.name)],
  });
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({ where: eq(users.id, id), with: { position: true } });
}

export async function getUsersInPositions(positionIds: string[]) {
  if (positionIds.length === 0) return [];
  return db.query.users.findMany({
    where: and(
      eq(users.isActive, true),
      eq(users.isHidden, false),
      inArray(users.positionId, positionIds),
    ),
    with: { position: true },
  });
}

export async function getUsersByPosition(positionId: string) {
  return db.query.users.findMany({
    where: and(
      eq(users.isActive, true),
      eq(users.isHidden, false),
      eq(users.positionId, positionId),
    ),
    with: { position: true },
  });
}

export type UserWithPosition = Awaited<ReturnType<typeof getUserById>>;
