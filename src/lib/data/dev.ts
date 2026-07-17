import { sql } from "drizzle-orm";
import { db } from "@/db";
import { users, tasks, requests, comments, notifications, changelogs } from "@/db/schema";
import { formatDateTime } from "@/lib/format";

export async function getSystemInfo() {
  const started = Date.now();
  let dbOk = true;
  let dbError: string | null = null;
  try {
    await db.execute(sql`select 1`);
  } catch (e) {
    dbOk = false;
    dbError = e instanceof Error ? e.message : String(e);
  }
  const dbLatencyMs = Date.now() - started;

  return {
    env: process.env.VERCEL_ENV ?? (process.env.NODE_ENV === "production" ? "production (bukan Vercel)" : "development"),
    region: process.env.VERCEL_REGION ?? "lokal (tanpa info region)",
    gitCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "tidak tersedia",
    gitBranch: process.env.VERCEL_GIT_COMMIT_REF ?? "tidak tersedia",
    nodeVersion: process.version,
    dbOk,
    dbError,
    dbLatencyMs,
    usingSupabase: !!process.env.DATABASE_URL,
    serverTimeRaw: new Date().toISOString() + " (mentah, apa adanya server)",
    wibTimeNow: formatDateTime(new Date()) + " (dikonversi via timezone.ts)",
  };
}

export async function getRowCounts() {
  const [u, t, r, c, n, cl] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(users),
    db.select({ count: sql<number>`count(*)::int` }).from(tasks),
    db.select({ count: sql<number>`count(*)::int` }).from(requests),
    db.select({ count: sql<number>`count(*)::int` }).from(comments),
    db.select({ count: sql<number>`count(*)::int` }).from(notifications),
    db.select({ count: sql<number>`count(*)::int` }).from(changelogs),
  ]);
  return {
    users: u[0].count,
    tasks: t[0].count,
    requests: r[0].count,
    comments: c[0].count,
    notifications: n[0].count,
    changelogs: cl[0].count,
  };
}
