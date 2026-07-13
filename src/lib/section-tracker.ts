export const TRACKED_HUB_HREFS = [
  "/beranda",
  "/tugas-saya",
  "/saya-beri",
  "/persetujuan",
  "/pantauan",
] as const;

export type TrackedHubHref = (typeof TRACKED_HUB_HREFS)[number];

export const LAST_SECTION_COOKIE = "dil_last_section";
export const HAS_NAVIGATED_KEY = "dil_has_navigated";

const TASK_DETAIL_PREFIX = "/tugas/";
const TASK_DETAIL_FALLBACK: TrackedHubHref = "/tugas-saya";

export function isTrackedHubHref(value: string | null | undefined): value is TrackedHubHref {
  return !!value && (TRACKED_HUB_HREFS as readonly string[]).includes(value);
}

function hrefMatches(href: string, pathname: string): boolean {
  return href === "/beranda" ? pathname === href : pathname.startsWith(href);
}

export function matchHubHref(pathname: string): TrackedHubHref | null {
  return TRACKED_HUB_HREFS.find((href) => hrefMatches(href, pathname)) ?? null;
}

/** Ambil section terakhir dari string document.cookie tanpa bergantung pada DOM. */
export function readLastSectionCookie(cookieString: string): TrackedHubHref | null {
  const encoded = cookieString
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LAST_SECTION_COOKIE}=`))
    ?.slice(LAST_SECTION_COOKIE.length + 1);
  if (!encoded) return null;
  try {
    const value = decodeURIComponent(encoded);
    return isTrackedHubHref(value) ? value : null;
  } catch {
    return null;
  }
}

export function resolveEffectivePathname(
  pathname: string,
  lastSection: TrackedHubHref | null,
): string {
  if (pathname.startsWith(TASK_DETAIL_PREFIX)) return lastSection ?? TASK_DETAIL_FALLBACK;
  return pathname;
}

export function isNavItemActive(href: string, effectivePathname: string): boolean {
  return hrefMatches(href, effectivePathname);
}

export function hasNavigatedInApp(): boolean {
  return sessionStorage.getItem(HAS_NAVIGATED_KEY) === "1";
}
