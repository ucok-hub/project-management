import { db } from "@/db";
import { notifications } from "@/db/schema";
import { newId } from "@/lib/utils";

type NotifInput = { type: string; title: string; body?: string | null; link?: string | null };

export async function notify(userId: string, n: NotifInput): Promise<void> {
  await db.insert(notifications).values({
    id: newId(),
    userId,
    type: n.type,
    title: n.title,
    body: n.body ?? null,
    link: n.link ?? null,
  });
}

export async function notifyMany(userIds: string[], n: NotifInput): Promise<void> {
  const unique = [...new Set(userIds)];
  if (unique.length === 0) return;
  await db.insert(notifications).values(
    unique.map((userId) => ({
      id: newId(),
      userId,
      type: n.type,
      title: n.title,
      body: n.body ?? null,
      link: n.link ?? null,
    })),
  );
}
