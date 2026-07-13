# Nav Highlighting (Section-Aware Active State) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the sidebar (desktop) and bottom nav (mobile) keep the correct
nav item highlighted while viewing a task detail page (`/tugas/[id]`),
whichever of the 5 hubs (Beranda, Tugas Saya, Tugas yang Saya Beri, Perlu
Persetujuan, Pantauan) the user actually navigated in from.

**Architecture:** A tiny client component writes a cookie (`dil_last_section`)
every time the user visits one of the 5 tracked hub routes. The `(app)`
layout (a server component) reads that cookie and passes it down to
`Sidebar`/`BottomNav`, which use it to compute an "effective pathname" for
`/tugas/[id]` (falling back to `/tugas-saya` if the cookie is missing/invalid)
before running the existing active-state check.

**Tech Stack:** Next.js 16 App Router (Server Components + `"use client"`),
TypeScript, `node:test`/`node:assert` for pure-function unit tests (existing
convention — see `src/lib/permissions.test.ts`).

## Global Constraints

- No new dependencies.
- Cookie name: `dil_last_section`. Path `/`, `SameSite=Lax`, max-age 1 day
  (86400s). Written via plain `document.cookie` (browser API) — not the
  Next.js `cookies()` function, which cannot set cookies during Server
  Component rendering.
- `/permintaan/[id]` and `/admin/[id]` are NOT touched — their existing
  `pathname.startsWith(href)` match is already correct (single-hub routes).
- Fallback when the cookie is absent/invalid on `/tugas/[id]`: fixed
  `/tugas-saya` (a simplification — see Task 2 note; the more precise
  role-based fallback is used by the actual "Kembali" button in
  [Fitur 2's plan](2026-07-14-tombol-kembali.md), which has the task's
  `giverId`/`assigneeId` on hand; the global layout does not).
- All new pure logic lives in `src/lib/*.ts` and must have `node:test`
  coverage added to the `test` script in `package.json`.

---

### Task 1: Section-tracker pure utilities

**Files:**
- Create: `src/lib/section-tracker.ts`
- Test: `src/lib/section-tracker.test.ts`
- Modify: `package.json:11` (test script)

**Interfaces:**
- Produces: `TRACKED_HUB_HREFS`, `TrackedHubHref` (type), `LAST_SECTION_COOKIE`
  (string constant `"dil_last_section"`), `isTrackedHubHref(value): value is TrackedHubHref`,
  `matchHubHref(pathname: string): TrackedHubHref | null`,
  `resolveEffectivePathname(pathname: string, lastSection: TrackedHubHref | null): string`,
  `isNavItemActive(href: string, effectivePathname: string): boolean`.
  These 6 exports are consumed directly by Tasks 3, 5, and 6.

- [ ] **Step 1: Write the failing test**

Create `src/lib/section-tracker.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  matchHubHref,
  resolveEffectivePathname,
  isNavItemActive,
  isTrackedHubHref,
} from "./section-tracker";

test("matchHubHref: /beranda cocok cuma exact match", () => {
  assert.equal(matchHubHref("/beranda"), "/beranda");
  assert.equal(matchHubHref("/beranda/apapun"), null);
});

test("matchHubHref: hub lain cocok via prefix", () => {
  assert.equal(matchHubHref("/tugas-saya"), "/tugas-saya");
  assert.equal(matchHubHref("/saya-beri"), "/saya-beri");
  assert.equal(matchHubHref("/persetujuan"), "/persetujuan");
  assert.equal(matchHubHref("/pantauan"), "/pantauan");
});

test("matchHubHref: bukan salah satu dari 5 hub -> null", () => {
  assert.equal(matchHubHref("/permintaan"), null);
  assert.equal(matchHubHref("/admin"), null);
  assert.equal(matchHubHref("/tugas/abc123"), null);
});

test("isTrackedHubHref: validasi nilai cookie", () => {
  assert.equal(isTrackedHubHref("/persetujuan"), true);
  assert.equal(isTrackedHubHref("/permintaan"), false);
  assert.equal(isTrackedHubHref(undefined), false);
  assert.equal(isTrackedHubHref(""), false);
});

test("resolveEffectivePathname: pathname biasa tidak berubah", () => {
  assert.equal(resolveEffectivePathname("/permintaan", null), "/permintaan");
  assert.equal(resolveEffectivePathname("/beranda", "/pantauan"), "/beranda");
});

test("resolveEffectivePathname: /tugas/[id] pakai lastSection kalau ada", () => {
  assert.equal(resolveEffectivePathname("/tugas/abc", "/persetujuan"), "/persetujuan");
  assert.equal(resolveEffectivePathname("/tugas/abc", "/pantauan"), "/pantauan");
});

test("resolveEffectivePathname: /tugas/[id] fallback /tugas-saya kalau tidak ada lastSection", () => {
  assert.equal(resolveEffectivePathname("/tugas/abc", null), "/tugas-saya");
});

test("isNavItemActive: /beranda exact match saja", () => {
  assert.equal(isNavItemActive("/beranda", "/beranda"), true);
  assert.equal(isNavItemActive("/beranda", "/beranda-lain"), false);
});

test("isNavItemActive: item lain pakai prefix match", () => {
  assert.equal(isNavItemActive("/persetujuan", "/persetujuan"), true);
  assert.equal(isNavItemActive("/permintaan", "/permintaan"), true);
  assert.equal(isNavItemActive("/tugas-saya", "/saya-beri"), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/section-tracker.test.ts`
Expected: FAIL — `Cannot find module './section-tracker'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/section-tracker.ts`:

```ts
export const TRACKED_HUB_HREFS = [
  "/beranda",
  "/tugas-saya",
  "/saya-beri",
  "/persetujuan",
  "/pantauan",
] as const;

export type TrackedHubHref = (typeof TRACKED_HUB_HREFS)[number];

export const LAST_SECTION_COOKIE = "dil_last_section";

const TASK_DETAIL_PREFIX = "/tugas/";
const TASK_DETAIL_FALLBACK: TrackedHubHref = "/tugas-saya";

export function isTrackedHubHref(value: string | null | undefined): value is TrackedHubHref {
  return !!value && (TRACKED_HUB_HREFS as readonly string[]).includes(value);
}

function hrefMatches(href: string, pathname: string): boolean {
  return href === "/beranda" ? pathname === href : pathname.startsWith(href);
}

/** Href hub yang cocok untuk sebuah pathname, atau null kalau bukan salah satu hub. */
export function matchHubHref(pathname: string): TrackedHubHref | null {
  return TRACKED_HUB_HREFS.find((href) => hrefMatches(href, pathname)) ?? null;
}

/**
 * Pathname efektif untuk penentuan nav aktif: untuk detail tugas (yang bisa
 * dibuka dari 5 hub berbeda), pakai hub terakhir yang dikunjungi user
 * (`lastSection`) kalau ada; kalau tidak, fallback ke /tugas-saya.
 */
export function resolveEffectivePathname(
  pathname: string,
  lastSection: TrackedHubHref | null,
): string {
  if (pathname.startsWith(TASK_DETAIL_PREFIX)) {
    return lastSection ?? TASK_DETAIL_FALLBACK;
  }
  return pathname;
}

export function isNavItemActive(href: string, effectivePathname: string): boolean {
  return hrefMatches(href, effectivePathname);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/section-tracker.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Add to the project test script**

In `package.json`, change line 11 from:
```json
    "test": "node --import tsx --test src/lib/permissions.test.ts src/lib/core/engine.test.ts",
```
to:
```json
    "test": "node --import tsx --test src/lib/permissions.test.ts src/lib/core/engine.test.ts src/lib/section-tracker.test.ts src/lib/task-section.test.ts",
```
(The second new file, `task-section.test.ts`, is created in Task 2 — adding
both now avoids a second edit to this line.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/section-tracker.ts src/lib/section-tracker.test.ts package.json
git commit -m "feat: add section-tracker utils for nav highlighting"
```

---

### Task 2: Extract `resolveTaskDefaultSection` and use it in the task detail page

**Files:**
- Create: `src/lib/task-section.ts`
- Test: `src/lib/task-section.test.ts`
- Modify: `src/app/(app)/tugas/[id]/page.tsx:44-47`

**Interfaces:**
- Consumes: none.
- Produces: `resolveTaskDefaultSection(me: { id: string }, task: { giverId: string; assigneeId: string }): "/saya-beri" | "/tugas-saya"`.
  Consumed by this task's page edit, and later by
  [Fitur 2's plan](2026-07-14-tombol-kembali.md) for the back-button fallback.

- [ ] **Step 1: Write the failing test**

Create `src/lib/task-section.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTaskDefaultSection } from "./task-section";

test("resolveTaskDefaultSection: giver-only (bukan assignee) -> saya-beri", () => {
  const me = { id: "u1" };
  const task = { giverId: "u1", assigneeId: "u2" };
  assert.equal(resolveTaskDefaultSection(me, task), "/saya-beri");
});

test("resolveTaskDefaultSection: assignee -> tugas-saya", () => {
  const me = { id: "u2" };
  const task = { giverId: "u1", assigneeId: "u2" };
  assert.equal(resolveTaskDefaultSection(me, task), "/tugas-saya");
});

test("resolveTaskDefaultSection: tugas untuk diri sendiri (giver == assignee) -> tugas-saya", () => {
  const me = { id: "u1" };
  const task = { giverId: "u1", assigneeId: "u1" };
  assert.equal(resolveTaskDefaultSection(me, task), "/tugas-saya");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/task-section.test.ts`
Expected: FAIL — `Cannot find module './task-section'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/task-section.ts`:

```ts
type TaskRoleFields = { giverId: string; assigneeId: string };

/**
 * Section tugas default untuk sebuah task & user: dipakai sebagai fallback
 * highlight/back-button saat tidak ada histori navigasi yang bisa dipakai.
 */
export function resolveTaskDefaultSection(
  me: { id: string },
  task: TaskRoleFields,
): "/saya-beri" | "/tugas-saya" {
  const isGiver = task.giverId === me.id;
  const isAssignee = task.assigneeId === me.id;
  return isGiver && !isAssignee ? "/saya-beri" : "/tugas-saya";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/task-section.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Use it in the task detail page**

In `src/app/(app)/tugas/[id]/page.tsx`, add the import (alongside the other
`@/lib/...` imports near line 25):

```ts
import { resolveTaskDefaultSection } from "@/lib/task-section";
```

Replace line 47:
```ts
  const backHref = isGiver && !isAssignee ? "/saya-beri" : "/tugas-saya";
```
with:
```ts
  const backHref = resolveTaskDefaultSection(me, task);
```

(`isGiver`/`isAssignee` on lines 43-44 stay — they're still used elsewhere in
the file for `TaskActions`/comment permissions.)

- [ ] **Step 6: Run full test suite and typecheck**

Run: `npm test && npm run typecheck`
Expected: all tests PASS, typecheck reports no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/task-section.ts src/lib/task-section.test.ts "src/app/(app)/tugas/[id]/page.tsx"
git commit -m "refactor: extract resolveTaskDefaultSection, reuse in task detail back-link"
```

---

### Task 3: Client component that writes the last-section cookie

**Files:**
- Create: `src/components/app-shell/section-tracker.tsx`

**Interfaces:**
- Consumes: `matchHubHref`, `LAST_SECTION_COOKIE` from `src/lib/section-tracker.ts` (Task 1).
- Produces: `SectionTracker` component (no props, renders nothing), mounted
  in `(app)/layout.tsx` in Task 4.

- [ ] **Step 1: Write the component**

Create `src/components/app-shell/section-tracker.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { matchHubHref, LAST_SECTION_COOKIE } from "@/lib/section-tracker";

const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 hari

/** Tidak merender apa pun — cuma mencatat hub terakhir yang dikunjungi ke cookie. */
export function SectionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const hub = matchHubHref(pathname);
    if (!hub) return;
    document.cookie = `${LAST_SECTION_COOKIE}=${encodeURIComponent(hub)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }, [pathname]);

  return null;
}
```

- [ ] **Step 2: Commit**

There's no automated test for this component in isolation (it has no
testable pure logic beyond what Task 1 already covers, and this codebase has
no React component-test runner — see `package.json`, only `node:test` for
pure functions and Playwright for full e2e). It's verified end-to-end in
Task 7.

```bash
git add src/components/app-shell/section-tracker.tsx
git commit -m "feat: add SectionTracker client component"
```

---

### Task 4: Wire the cookie into the `(app)` layout

**Files:**
- Modify: `src/app/(app)/layout.tsx`

**Interfaces:**
- Consumes: `SectionTracker` (Task 3), `isTrackedHubHref`, `LAST_SECTION_COOKIE`,
  `TrackedHubHref` (Task 1), Next.js `cookies()` from `next/headers`.
- Produces: `lastSection: TrackedHubHref | null` passed as a prop to `Sidebar`
  and `BottomNav` (consumed in Tasks 5 and 6).

- [ ] **Step 1: Update the layout**

Replace the full contents of `src/app/(app)/layout.tsx`:

```tsx
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { getInboxCounts } from "@/lib/data/inbox";
import { canMonitor } from "@/lib/roles";
import { Header } from "@/components/app-shell/header";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { Sidebar } from "@/components/app-shell/sidebar";
import { SectionTracker } from "@/components/app-shell/section-tracker";
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
  );
}
```

This won't typecheck yet — `Sidebar`/`BottomNav` don't accept `lastSection`
until Tasks 5 and 6. That's expected; those are the next two tasks.

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/layout.tsx"
git commit -m "feat: read last-section cookie in app layout"
```

---

### Task 5: Use effective pathname in `Sidebar`

**Files:**
- Modify: `src/components/app-shell/sidebar.tsx`

**Interfaces:**
- Consumes: `resolveEffectivePathname`, `isNavItemActive`, `TrackedHubHref` (Task 1).
- Produces: `Sidebar` now requires a `lastSection: TrackedHubHref | null` prop
  (breaking change already satisfied by Task 4's layout edit).

- [ ] **Step 1: Update the component**

In `src/components/app-shell/sidebar.tsx`, add the import (with the other
`@/lib/...`/`@/components/...` imports near line 20):

```ts
import { isNavItemActive, resolveEffectivePathname, type TrackedHubHref } from "@/lib/section-tracker";
```

Replace lines 23-32 (the function signature):
```tsx
export function Sidebar({
  user,
  pendingApprovals,
  canMonitor,
}: {
  user: CurrentUser;
  pendingApprovals: number;
  canMonitor: boolean;
}) {
  const pathname = usePathname();
```
with:
```tsx
export function Sidebar({
  user,
  pendingApprovals,
  canMonitor,
  lastSection,
}: {
  user: CurrentUser;
  pendingApprovals: number;
  canMonitor: boolean;
  lastSection: TrackedHubHref | null;
}) {
  const pathname = usePathname();
  const effectivePathname = resolveEffectivePathname(pathname, lastSection);
```

Replace line 67:
```tsx
          const active = href === "/beranda" ? pathname === href : pathname.startsWith(href);
```
with:
```tsx
          const active = isNavItemActive(href, effectivePathname);
```

- [ ] **Step 2: Commit**

```bash
git add src/components/app-shell/sidebar.tsx
git commit -m "feat: highlight sidebar section by last-visited hub on task detail"
```

---

### Task 6: Use effective pathname in `BottomNav`

**Files:**
- Modify: `src/components/app-shell/bottom-nav.tsx`

**Interfaces:**
- Consumes: `resolveEffectivePathname`, `isNavItemActive`, `TrackedHubHref` (Task 1).
- Produces: `BottomNav` now requires a `lastSection: TrackedHubHref | null` prop
  (breaking change already satisfied by Task 4's layout edit).

- [ ] **Step 1: Update the component**

In `src/components/app-shell/bottom-nav.tsx`, add the import (with the
existing `@/lib/utils` import on line 6):

```ts
import { isNavItemActive, resolveEffectivePathname, type TrackedHubHref } from "@/lib/section-tracker";
```

Replace line 8:
```tsx
export function BottomNav({ pendingApprovals }: { pendingApprovals: number }) {
  const pathname = usePathname();
```
with:
```tsx
export function BottomNav({
  pendingApprovals,
  lastSection,
}: {
  pendingApprovals: number;
  lastSection: TrackedHubHref | null;
}) {
  const pathname = usePathname();
  const effectivePathname = resolveEffectivePathname(pathname, lastSection);
```

Replace line 23:
```tsx
          const active = href === "/beranda" ? pathname === href : pathname.startsWith(href);
```
with:
```tsx
          const active = isNavItemActive(href, effectivePathname);
```

- [ ] **Step 2: Run full test suite and typecheck**

Run: `npm test && npm run typecheck`
Expected: all tests PASS, typecheck reports no errors (this is the point
where the `lastSection` prop chain across layout → Sidebar/BottomNav
finally lines up).

- [ ] **Step 3: Commit**

```bash
git add src/components/app-shell/bottom-nav.tsx
git commit -m "feat: highlight bottom-nav section by last-visited hub on task detail"
```

---

### Task 7: Manual end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify the main scenario from the bug report**

In a browser: log in, go to **Tugas yang Saya Beri**, click into any task
card. Confirm: URL is `/tugas/<id>`, and **"Tugas yang Saya Beri"** stays
highlighted in the sidebar (desktop width) — not blank, not some other item.

- [ ] **Step 3: Verify the other 3 origin hubs**

Repeat from **Beranda** (click a task on the dashboard), **Perlu
Persetujuan**, and **Pantauan** (click a task link in the table/cards) —
each time, confirm the sidebar highlight follows the hub you actually came
from, not a fixed item.

- [ ] **Step 4: Verify unrelated routes are unaffected**

Visit a request detail (`/permintaan/[id]`) and an admin user detail
(`/admin/[id]`) — confirm **Papan Permintaan** / **Kelola Pengguna** still
highlight exactly as before (these were not touched).

- [ ] **Step 5: Verify the fresh-tab fallback**

Open dev tools, delete the `dil_last_section` cookie, then paste a
`/tugas/<id>` URL directly into the address bar (simulating a deep link with
no prior in-app navigation). Confirm **"Tugas Saya"** highlights (the fixed
fallback), and the page doesn't error.

- [ ] **Step 6: Repeat steps 2-3 at mobile width**

Resize the browser (or use device toolbar) to a mobile width and repeat
step 2 for the bottom nav — confirm **"Setujui"** highlights when arriving
from Perlu Persetujuan, and no item is force-highlighted when arriving from
Pantauan (Pantauan has no bottom-nav equivalent — this is expected).
