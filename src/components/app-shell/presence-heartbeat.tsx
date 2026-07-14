"use client";

import { useEffect, useRef } from "react";
import { heartbeatAction } from "@/lib/actions/presence";
import { HEARTBEAT_INTERVAL_MS, IDLE_AFTER_MS } from "@/lib/presence";

const ACTIVITY_EVENTS = ["mousemove", "keydown", "touchstart", "scroll"] as const;

/** Tidak merender apa pun; mengirim heartbeat presence selama aplikasi terbuka. */
export function PresenceHeartbeat() {
  const lastActivityRef = useRef(0);

  useEffect(() => {
    lastActivityRef.current = Date.now();
    function markActive() {
      lastActivityRef.current = Date.now();
    }
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, markActive, { passive: true });
    }

    async function sendHeartbeat() {
      const idleFor = Date.now() - lastActivityRef.current;
      try {
        await heartbeatAction(idleFor >= IDLE_AFTER_MS ? "idle" : "online");
      } catch {
        // Gangguan jaringan sementara akan dicoba lagi pada interval berikutnya.
      }
    }

    void sendHeartbeat();
    const interval = window.setInterval(() => void sendHeartbeat(), HEARTBEAT_INTERVAL_MS);

    function handleVisibility() {
      if (document.visibilityState === "visible") void sendHeartbeat();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, markActive);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
