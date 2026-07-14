export type PresenceStatus = "online" | "idle" | "offline";

export const HEARTBEAT_INTERVAL_MS = 25_000;
export const IDLE_AFTER_MS = 5 * 60 * 1000;
const STALE_AFTER_MS = HEARTBEAT_INTERVAL_MS * 3;

/** Ubah heartbeat tersimpan menjadi status yang layak ditampilkan. */
export function resolvePresenceStatus(
  lastSeenAt: Date | null,
  reportedStatus: string | null,
  now: Date = new Date(),
): PresenceStatus {
  if (!lastSeenAt) return "offline";
  const age = now.getTime() - lastSeenAt.getTime();
  if (age > STALE_AFTER_MS) return "offline";
  return reportedStatus === "idle" ? "idle" : "online";
}
