"use client";

import { useEffect, useState } from "react";
import { getPresenceStatusesAction } from "@/lib/actions/presence";
import { HEARTBEAT_INTERVAL_MS, type PresenceStatus } from "@/lib/presence";

/** Polling presence terbatched untuk user yang sedang ditampilkan. */
export function usePresence(userIds: string[]): Record<string, PresenceStatus> {
  const key = [...new Set(userIds)].sort().join(",");
  const [statuses, setStatuses] = useState<Record<string, PresenceStatus>>({});

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    async function poll() {
      try {
        const result = await getPresenceStatusesAction(key.split(","));
        if (!cancelled) setStatuses(result);
      } catch {
        // Pertahankan hasil terakhir ketika polling sementara gagal.
      }
    }

    void poll();
    const interval = window.setInterval(() => void poll(), HEARTBEAT_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [key]);

  return statuses;
}
