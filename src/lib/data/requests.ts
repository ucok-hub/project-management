import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { requests } from "@/db/schema";
import type { CurrentUser } from "@/lib/auth";

const withAll = {
  requester: { with: { position: true } },
  target: { with: { position: true } },
  approvals: { with: { position: true, user: true } },
} as const;

export async function getRequestById(id: string) {
  return db.query.requests.findFirst({ where: eq(requests.id, id), with: withAll });
}

export async function getAllRequests() {
  return db.query.requests.findMany({ with: withAll, orderBy: [desc(requests.createdAt)] });
}

export async function getRequestsByRequester(userId: string) {
  return db.query.requests.findMany({
    where: eq(requests.requesterId, userId),
    with: withAll,
    orderBy: [desc(requests.createdAt)],
  });
}

export type RequestFull = NonNullable<Awaited<ReturnType<typeof getRequestById>>>;

/** Apakah user boleh menindak (ACC/tolak) sebuah slot yang masih menunggu? */
export function userCanActOnRequest(req: RequestFull, user: CurrentUser): boolean {
  if (req.status !== "menunggu") return false;
  return req.approvals.some(
    (a) =>
      a.decision === "menunggu" &&
      ((a.role === "diminta" && a.userId === user.id) ||
        (a.role === "atasan" && a.positionId === user.positionId)),
  );
}

/** Permintaan (status menunggu) yang butuh tindakan user ini. */
export async function getRequestsNeedingUser(user: CurrentUser) {
  const all = await db.query.requests.findMany({
    where: eq(requests.status, "menunggu"),
    with: withAll,
    orderBy: [desc(requests.createdAt)],
  });
  return all.filter((r) => userCanActOnRequest(r, user));
}
