import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { changelogs, users } from "@/db/schema";

export async function getChangelogs() {
  return db.query.changelogs.findMany({ orderBy: [desc(changelogs.publishedAt)] });
}

export async function getLatestChangelog() {
  const rows = await db.query.changelogs.findMany({
    orderBy: [desc(changelogs.publishedAt)],
    limit: 1,
  });
  return rows[0] ?? null;
}

/** Changelog terbaru yang BELUM dilihat user ini, atau null kalau sudah/tak ada. */
export async function getUnseenChangelog(user: { lastSeenChangelogAt: Date | null; createdAt: Date }) {
  const latest = await getLatestChangelog();
  if (!latest) return null;
  const seenSince = user.lastSeenChangelogAt ?? user.createdAt;
  return latest.publishedAt > seenSince ? latest : null;
}

/** Tulis langsung (aman dipanggil saat render halaman) -- TANPA revalidatePath. */
export async function markChangelogSeenNow(userId: string): Promise<void> {
  await db.update(users).set({ lastSeenChangelogAt: new Date() }).where(eq(users.id, userId));
}
