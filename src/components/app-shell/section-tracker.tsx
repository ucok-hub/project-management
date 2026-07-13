"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { HAS_NAVIGATED_KEY, LAST_SECTION_COOKIE, matchHubHref } from "@/lib/section-tracker";

const COOKIE_MAX_AGE = 60 * 60 * 24;

/** Tidak merender apa pun; mencatat hub terakhir dan histori navigasi tab. */
export function SectionTracker() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      sessionStorage.setItem(HAS_NAVIGATED_KEY, "1");
      previousPathname.current = pathname;
    }

    const hub = matchHubHref(pathname);
    if (!hub) return;
    document.cookie = `${LAST_SECTION_COOKIE}=${encodeURIComponent(hub)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }, [pathname]);

  return null;
}
