import "server-only";

import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { presence } from "@/db/schema";
import { resolvePresenceStatus, type PresenceStatus } from "@/lib/presence";

export type PresenceInfo = { status: PresenceStatus; lastSeenAt: Date | null };

export async function getPresenceForUsers(
  userIds: string[],
): Promise<Record<string, PresenceInfo>> {
  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) return {};

  const rows = await db.query.presence.findMany({
    where: inArray(presence.userId, uniqueIds),
  });
  const byId = new Map(rows.map((row) => [row.userId, row]));
  const now = new Date();
  const result: Record<string, PresenceInfo> = {};

  for (const id of uniqueIds) {
    const row = byId.get(id);
    result[id] = {
      status: resolvePresenceStatus(row?.lastSeenAt ?? null, row?.status ?? null, now),
      lastSeenAt: row?.lastSeenAt ?? null,
    };
  }

  return result;
}
