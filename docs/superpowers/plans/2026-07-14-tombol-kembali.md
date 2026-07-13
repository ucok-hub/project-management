# Tombol Kembali (Header Back Button) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ad-hoc `BackLink` (always a fixed href) with a real back
button integrated into the sticky `Header`, that returns the user to the
exact previous view via `router.back()` when in-app history exists, falling
back to a sensible static href otherwise. Applies to all 6 non-hub pages:
`/tugas/[id]`, `/permintaan/[id]`, `/admin/[id]`, `/admin/baru`,
`/notifikasi`, `/buat`.

**Architecture:** `Header` becomes a client component that reads a small
React Context (`HeaderBackProvider`, mounted once in the `(app)` layout).
Each non-hub page renders an invisible `<SetHeaderBack title fallbackHref />`
that registers its back-button config into that context via an effect; when
the page unmounts (user navigates elsewhere), the effect's cleanup clears it
and `Header` reverts to the normal greeting. A `hasNavigatedInApp()` helper
(sessionStorage flag, set by the same `SectionTracker` from
[Fitur 1](2026-07-14-nav-highlighting.md)) tells the button whether
`router.back()` is safe to call or whether to fall back to a static href.

**Tech Stack:** Next.js 16 App Router, React 19 Context, TypeScript.

**Depends on:** [Fitur 1 — Nav Highlighting plan](2026-07-14-nav-highlighting.md)
must be implemented first (this plan extends `src/lib/section-tracker.ts`
and `src/components/app-shell/section-tracker.tsx` from that plan).

## Global Constraints

- No new dependencies.
- `hasNavigatedInApp` state key: sessionStorage key `dil_has_navigated`
  (`"1"` once any in-app client-side navigation has happened this tab
  session; absent/anything else means "no").
- Fallback hrefs (used only when there's no in-app history to go back to):
  `/permintaan/[id]` → `/permintaan`; `/admin/[id]` and `/admin/baru` →
  `/admin`; `/notifikasi` and `/buat` → `/beranda`; `/tugas/[id]` →
  `resolveTaskDefaultSection(me, task)` (from Fitur 1's
  `src/lib/task-section.ts` — this page has the real task data, so it can
  use the precise role-based fallback rather than the fixed one the global
  layout uses for nav highlighting).
- `src/components/ui/back-link.tsx` is deleted once all 3 of its current
  usages are migrated (Task 12) — confirmed via grep first, not deleted
  preventively.

---

### Task 1: Extend `section-tracker` with the has-navigated flag

**Files:**
- Modify: `src/lib/section-tracker.ts`
- Modify: `src/lib/section-tracker.test.ts`
- Modify: `src/components/app-shell/section-tracker.tsx`

**Interfaces:**
- Produces: `HAS_NAVIGATED_KEY` (string constant `"dil_has_navigated"`),
  `hasNavigatedInApp(): boolean`. Consumed by `BackButton` (Task 3).

- [ ] **Step 1: Write the failing test for the new pure export**

Add to `src/lib/section-tracker.test.ts` (append at the end):

```ts
import { HAS_NAVIGATED_KEY } from "./section-tracker";

test("HAS_NAVIGATED_KEY: konstanta nama key sessionStorage", () => {
  assert.equal(HAS_NAVIGATED_KEY, "dil_has_navigated");
});
```

(`hasNavigatedInApp()` itself reads the global `sessionStorage`, which does
not exist under plain `node:test` — like `SectionTracker`'s `document.cookie`
write, it's DOM-dependent glue verified manually in Task 13, not unit
tested. Only the constant is asserted here.)

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/section-tracker.test.ts`
Expected: FAIL — `HAS_NAVIGATED_KEY` is not exported yet.

- [ ] **Step 3: Add the constant and helper**

In `src/lib/section-tracker.ts`, add near `LAST_SECTION_COOKIE`:

```ts
export const HAS_NAVIGATED_KEY = "dil_has_navigated";

/** True kalau sudah ada navigasi client-side dalam app ini di tab ini. */
export function hasNavigatedInApp(): boolean {
  return sessionStorage.getItem(HAS_NAVIGATED_KEY) === "1";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/section-tracker.test.ts`
Expected: PASS (all previous tests + the new one).

- [ ] **Step 5: Set the flag from `SectionTracker`**

Replace the full contents of `src/components/app-shell/section-tracker.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { matchHubHref, LAST_SECTION_COOKIE, HAS_NAVIGATED_KEY } from "@/lib/section-tracker";

const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 hari

/** Tidak merender apa pun — mencatat hub terakhir & histori navigasi dalam-app. */
export function SectionTracker() {
  const pathname = usePathname();
  const mountedOnce = useRef(false);

  useEffect(() => {
    if (mountedOnce.current) {
      sessionStorage.setItem(HAS_NAVIGATED_KEY, "1");
    } else {
      mountedOnce.current = true;
    }

    const hub = matchHubHref(pathname);
    if (!hub) return;
    document.cookie = `${LAST_SECTION_COOKIE}=${encodeURIComponent(hub)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }, [pathname]);

  return null;
}
```

The only change from Fitur 1's version is the `mountedOnce` ref: the first
effect run (initial page load) just marks itself as having happened;
every subsequent run (a real client-side pathname change) sets the
sessionStorage flag.

- [ ] **Step 6: Run full test suite and typecheck**

Run: `npm test && npm run typecheck`
Expected: all PASS, no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/section-tracker.ts src/lib/section-tracker.test.ts src/components/app-shell/section-tracker.tsx
git commit -m "feat: track in-app navigation history for back-button fallback"
```

---

### Task 2: `HeaderBackProvider` context + `SetHeaderBack`

**Files:**
- Create: `src/components/app-shell/header-back.tsx`

**Interfaces:**
- Produces: `HeaderBackProvider` (wraps children, Task 5 consumes),
  `useHeaderBackContext(): { back: { title: string; fallbackHref: string } | null }`
  (Task 4 consumes), `SetHeaderBack({ title, fallbackHref }): null` (Tasks
  6-11 consume).

- [ ] **Step 1: Write the component**

Create `src/components/app-shell/header-back.tsx`:

```tsx
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type BackConfig = { title: string; fallbackHref: string } | null;

const HeaderBackContext = createContext<{
  back: BackConfig;
  setBack: (back: BackConfig) => void;
} | null>(null);

/** Dipasang sekali di (app)/layout.tsx, membungkus seluruh isi halaman. */
export function HeaderBackProvider({ children }: { children: ReactNode }) {
  const [back, setBack] = useState<BackConfig>(null);
  return (
    <HeaderBackContext.Provider value={{ back, setBack }}>{children}</HeaderBackContext.Provider>
  );
}

/** Dipakai oleh Header untuk tahu apakah harus tampil mode back-button. */
export function useHeaderBackContext() {
  const ctx = useContext(HeaderBackContext);
  if (!ctx) throw new Error("useHeaderBackContext dipakai di luar HeaderBackProvider");
  return ctx;
}

/**
 * Dipasang di halaman non-hub (detail tugas, detail permintaan, dst) untuk
 * memberi tahu Header agar tampil sebagai tombol kembali, bukan sapaan biasa.
 * Tidak merender apa pun sendiri.
 */
export function SetHeaderBack({ title, fallbackHref }: { title: string; fallbackHref: string }) {
  const { setBack } = useHeaderBackContext();

  useEffect(() => {
    setBack({ title, fallbackHref });
    return () => setBack(null);
  }, [title, fallbackHref, setBack]);

  return null;
}
```

- [ ] **Step 2: Commit**

No automated test — this is a thin React Context wrapper with no pure logic
to extract; verified end-to-end in Task 13.

```bash
git add src/components/app-shell/header-back.tsx
git commit -m "feat: add HeaderBackProvider context for page-driven back button"
```

---

### Task 3: `BackButton` component

**Files:**
- Create: `src/components/app-shell/back-button.tsx`

**Interfaces:**
- Consumes: `hasNavigatedInApp` (Task 1).
- Produces: `BackButton({ title, fallbackHref })` (Task 4 consumes).

- [ ] **Step 1: Write the component**

Create `src/components/app-shell/back-button.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { hasNavigatedInApp } from "@/lib/section-tracker";

export function BackButton({ title, fallbackHref }: { title: string; fallbackHref: string }) {
  const router = useRouter();

  function handleClick() {
    if (hasNavigatedInApp()) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex min-w-0 items-center gap-1.5 text-left"
    >
      <ChevronLeft className="h-5 w-5 shrink-0 text-slate-500" />
      <span className="truncate text-base font-bold text-slate-900">{title}</span>
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/app-shell/back-button.tsx
git commit -m "feat: add BackButton (router.back with static fallback)"
```

---

### Task 4: Make `Header` render the back button when active

**Files:**
- Modify: `src/components/app-shell/header.tsx`

**Interfaces:**
- Consumes: `useHeaderBackContext` (Task 2), `BackButton` (Task 3).

- [ ] **Step 1: Update the component**

Replace the full contents of `src/components/app-shell/header.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { FeatureSearch } from "@/components/app-shell/feature-search";
import { BackButton } from "@/components/app-shell/back-button";
import { useHeaderBackContext } from "@/components/app-shell/header-back";
import type { CurrentUser } from "@/lib/auth";

function firstName(name: string): string {
  return name.replace(/^(Pak|Bu|Ibu|Bpk)\s+/i, "").split(/\s+/)[0];
}

export function Header({
  user,
  unread,
  canMonitor,
}: {
  user: CurrentUser;
  unread: number;
  canMonitor: boolean;
}) {
  const { back } = useHeaderBackContext();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        {back ? (
          <BackButton title={back.title} fallbackHref={back.fallbackHref} />
        ) : (
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Halo,</p>
            <p className="truncate text-base font-bold text-slate-900">
              {firstName(user.name)}{" "}
              <span className="font-medium text-slate-400">· {user.position.name}</span>
            </p>
          </div>
        )}
        <div className="flex items-center gap-1">
          <FeatureSearch canMonitor={canMonitor} isAdmin={user.isAdmin} />
          <Link
            href="/notifikasi"
            aria-label="Notifikasi"
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <Bell className="h-6 w-6" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <Link href="/profil" aria-label="Profil" className="rounded-full">
            <Avatar name={user.name} />
          </Link>
        </div>
      </div>
    </header>
  );
}
```

The only changes from the original: added `"use client"`, the two new
imports, the `useHeaderBackContext()` call, and the `{back ? ... : ...}`
conditional replacing the unconditional greeting block. The right-side
icons are untouched.

- [ ] **Step 2: Commit**

```bash
git add src/components/app-shell/header.tsx
git commit -m "feat: render back button in Header when a page registers one"
```

---

### Task 5: Wrap the `(app)` layout in `HeaderBackProvider`

**Files:**
- Modify: `src/app/(app)/layout.tsx`

**Interfaces:**
- Consumes: `HeaderBackProvider` (Task 2).

- [ ] **Step 1: Update the layout**

Replace the full contents of `src/app/(app)/layout.tsx` (building on
[Fitur 1's version](2026-07-14-nav-highlighting.md#task-4-wire-the-cookie-into-the-app-layout)):

```tsx
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { getInboxCounts } from "@/lib/data/inbox";
import { canMonitor } from "@/lib/roles";
import { Header } from "@/components/app-shell/header";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { Sidebar } from "@/components/app-shell/sidebar";
import { SectionTracker } from "@/components/app-shell/section-tracker";
import { HeaderBackProvider } from "@/components/app-shell/header-back";
import { isTrackedHubHref, LAST_SECTION_COOKIE } from "@/lib/section-tracker";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [counts, showMonitor, cookieStore] = await Promise.all([
    getInboxCounts(user),
    canMonitor(user),
    cookies(),
  ]);
  const rawLastSection = cookieStore.get(LAST_SECTION_COOKIE)?.value;
  const lastSection = isTrackedHubHref(rawLastSection) ? rawLastSection : null;

  return (
    <HeaderBackProvider>
      <div className="min-h-dvh bg-slate-100 lg:flex">
        <SectionTracker />
        <Sidebar
          user={user}
          pendingApprovals={counts.pendingApprovals}
          canMonitor={showMonitor}
          lastSection={lastSection}
        />

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col lg:mx-0 lg:max-w-none">
          <Header user={user} unread={counts.unreadNotifications} canMonitor={showMonitor} />
          <main className="flex-1 px-4 pt-4 pb-safe lg:px-10 lg:pt-8">
            <div className="lg:mx-auto lg:max-w-6xl">{children}</div>
          </main>
          <BottomNav pendingApprovals={counts.pendingApprovals} lastSection={lastSection} />
        </div>
      </div>
    </HeaderBackProvider>
  );
}
```

`HeaderBackProvider` must wrap `{children}` (the page content) too, not just
`Header` — pages call `SetHeaderBack` from inside `{children}`, so they need
to be inside the same provider.

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/layout.tsx"
git commit -m "feat: wrap app layout in HeaderBackProvider"
```

---

### Task 6: Migrate `/tugas/[id]`

**Files:**
- Modify: `src/app/(app)/tugas/[id]/page.tsx`

- [ ] **Step 1: Swap `BackLink` for `SetHeaderBack`**

Replace the import on line 18:
```ts
import { BackLink } from "@/components/ui/back-link";
```
with:
```ts
import { SetHeaderBack } from "@/components/app-shell/header-back";
```

Replace line 51:
```tsx
      <BackLink href={backHref} />
```
with:
```tsx
      <SetHeaderBack title="Detail Tugas" fallbackHref={backHref} />
```

(`backHref` is unchanged — still `resolveTaskDefaultSection(me, task)` from
Fitur 1's Task 2.)

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/tugas/[id]/page.tsx"
git commit -m "feat: use header back button on task detail page"
```

---

### Task 7: Migrate `/permintaan/[id]`

**Files:**
- Modify: `src/app/(app)/permintaan/[id]/page.tsx`

- [ ] **Step 1: Swap `BackLink` for `SetHeaderBack`**

Replace the import on line 10:
```ts
import { BackLink } from "@/components/ui/back-link";
```
with:
```ts
import { SetHeaderBack } from "@/components/app-shell/header-back";
```

Replace line 56:
```tsx
      <BackLink href="/permintaan" label="Papan Permintaan" />
```
with:
```tsx
      <SetHeaderBack title="Detail Permintaan" fallbackHref="/permintaan" />
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/permintaan/[id]/page.tsx"
git commit -m "feat: use header back button on request detail page"
```

---

### Task 8: Migrate `/admin/[id]`

**Files:**
- Modify: `src/app/(app)/admin/[id]/page.tsx`

- [ ] **Step 1: Swap `BackLink` for `SetHeaderBack`**

Replace the import on line 6:
```ts
import { BackLink } from "@/components/ui/back-link";
```
with:
```ts
import { SetHeaderBack } from "@/components/app-shell/header-back";
```

Replace line 22:
```tsx
      <BackLink href="/admin" label="Kelola Pengguna" />
```
with:
```tsx
      <SetHeaderBack title="Kelola Pengguna" fallbackHref="/admin" />
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/admin/[id]/page.tsx"
git commit -m "feat: use header back button on admin user detail page"
```

---

### Task 9: Migrate `/admin/baru`

**Files:**
- Modify: `src/app/(app)/admin/baru/page.tsx`

- [ ] **Step 1: Swap `BackLink` for `SetHeaderBack`**

Replace the import on line 4:
```ts
import { BackLink } from "@/components/ui/back-link";
```
with:
```ts
import { SetHeaderBack } from "@/components/app-shell/header-back";
```

Replace line 14:
```tsx
      <BackLink href="/admin" label="Kelola Pengguna" />
```
with:
```tsx
      <SetHeaderBack title="Tambah Pengguna" fallbackHref="/admin" />
```

The page's own `<h1>Tambah Pengguna</h1>` (line 15) stays — unlike
Notifikasi/Buat (Tasks 10-11), there's no earlier duplicate heading issue
here since this page never had one before.

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/admin/baru/page.tsx"
git commit -m "feat: add header back button on add-user page"
```

---

### Task 10: Add back button to `/notifikasi`

**Files:**
- Modify: `src/app/(app)/notifikasi/page.tsx`

**Note:** this page never had a `BackLink` before. It also has its own
`<h1>Notifikasi</h1>` which would now duplicate the header's new title, so
it's removed (the "Tandai dibaca" button becomes the sole item in that row).

- [ ] **Step 1: Add the import**

Add near the other imports (after line 7, `SubmitButton`):
```ts
import { SetHeaderBack } from "@/components/app-shell/header-back";
```

- [ ] **Step 2: Add `SetHeaderBack` and remove the duplicate heading**

Replace lines 29-39:
```tsx
    <div className="space-y-4 pb-4 lg:mx-auto lg:max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Notifikasi</h1>
        {hasUnread && (
          <form action={markAllReadAction}>
            <SubmitButton variant="secondary" size="sm" pendingText="…">
              <CheckCheck className="h-4 w-4" /> Tandai dibaca
            </SubmitButton>
          </form>
        )}
      </div>
```
with:
```tsx
    <div className="space-y-4 pb-4 lg:mx-auto lg:max-w-2xl">
      <SetHeaderBack title="Notifikasi" fallbackHref="/beranda" />
      <div className="flex items-center justify-end">
        {hasUnread && (
          <form action={markAllReadAction}>
            <SubmitButton variant="secondary" size="sm" pendingText="…">
              <CheckCheck className="h-4 w-4" /> Tandai dibaca
            </SubmitButton>
          </form>
        )}
      </div>
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/notifikasi/page.tsx"
git commit -m "feat: add header back button on notifications page"
```

---

### Task 11: Add back button to `/buat`

**Files:**
- Modify: `src/app/(app)/buat/page.tsx`

**Note:** same duplicate-heading situation as Task 10 — the page's own
`<h1>Buat Tugas</h1>` is removed since the header now shows that title.

- [ ] **Step 1: Add the import**

Add near the other imports (after line 4, `CreateForm`):
```ts
import { SetHeaderBack } from "@/components/app-shell/header-back";
```

- [ ] **Step 2: Add `SetHeaderBack` and remove the duplicate heading**

Replace lines 25-32:
```tsx
    <div className="space-y-4 pb-4 lg:mx-auto lg:max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Buat Tugas</h1>
        <p className="text-sm text-slate-500">
          Pilih orangnya, sistem otomatis menentukan langsung jadi tugas atau perlu persetujuan.
        </p>
      </div>
      <CreateForm me={{ id: me.id, positionId: me.positionId }} users={usersLite} positions={positionsLite} />
```
with:
```tsx
    <div className="space-y-4 pb-4 lg:mx-auto lg:max-w-xl">
      <SetHeaderBack title="Buat Tugas" fallbackHref="/beranda" />
      <p className="text-sm text-slate-500">
        Pilih orangnya, sistem otomatis menentukan langsung jadi tugas atau perlu persetujuan.
      </p>
      <CreateForm me={{ id: me.id, positionId: me.positionId }} users={usersLite} positions={positionsLite} />
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/buat/page.tsx"
git commit -m "feat: add header back button on create-task page"
```

---

### Task 12: Remove `BackLink` and verify

**Files:**
- Delete: `src/components/ui/back-link.tsx`

- [ ] **Step 1: Confirm no remaining references**

Run: `grep -rn "back-link\|BackLink" src/ --include="*.tsx" --include="*.ts"`
Expected: no output (all 3 original usages were migrated in Tasks 6-8; the
component was never used anywhere else per the codebase survey).

- [ ] **Step 2: Delete the file**

```bash
git rm src/components/ui/back-link.tsx
```

- [ ] **Step 3: Run full test suite and typecheck**

Run: `npm test && npm run typecheck`
Expected: all PASS, no type errors (this also confirms every page compiles
with its new `SetHeaderBack` usage and no dangling `BackLink` import
remains).

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove unused BackLink component"
```

---

### Task 13: Manual end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify "exact previous view" on task detail**

Go to **Tugas yang Saya Beri**, filter/search for something, then click into
a task. Click the back button in the header. Confirm you land back on
**Tugas yang Saya Beri** with your search text and Aktif/Selesai tab
selection still exactly as you left it (this is `router.back()`'s router
cache doing its job, not custom code).

- [ ] **Step 3: Verify multi-hub back targets**

Repeat from **Perlu Persetujuan** and **Pantauan** — confirm the back
button returns to that same hub each time, not always to Tugas Saya.

- [ ] **Step 4: Verify the other 5 pages get a working back button**

Visit `/permintaan/[id]`, `/admin/[id]`, `/admin/baru`, `/notifikasi`
(via the bell icon), and `/buat` (via "+ Buat Tugas") — each should show a
back button + title in the header (replacing the greeting), and clicking it
should return you to wherever you came from.

- [ ] **Step 5: Verify the fresh-tab fallback**

Open dev tools → Application → Session Storage, delete `dil_has_navigated`.
Paste a `/notifikasi` URL directly into the address bar (simulating a fresh
tab with no in-app history). Click the back button — confirm it navigates
to `/beranda` (the static fallback) instead of erroring or leaving the app.

- [ ] **Step 6: Verify the greeting still shows on hub pages**

Visit Beranda, Tugas Saya, Papan Permintaan, etc. — confirm the header
still shows "Halo, {nama}" as before (unchanged for all 8 hub pages).

- [ ] **Step 7: Repeat steps 2-4 at mobile width**

Resize to mobile width and repeat the task-detail and admin/baru checks —
confirm the back button renders and works identically (Header is shared
across breakpoints, so this should need no separate code path, but verify
visually there's no layout overlap with the search/bell/avatar icons on a
narrow screen).
