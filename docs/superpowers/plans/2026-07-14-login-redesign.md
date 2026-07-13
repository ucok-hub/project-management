# Login Redesign — Background Skeleton Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `/masuk` (login) a full-screen animated background of 3 rows
of abstract skeleton "preview" cards (Jira-style), rows 1 & 3 sliding
left-to-right, row 2 right-to-left, behind the existing solid login card.

**Architecture:** A new Server Component (`LoginBackdrop`, no client JS
needed — it's pure CSS animation) renders 3 rows, each containing a
sequence of small skeleton-card templates duplicated once so a CSS
`translateX` keyframe loop is seamless. `masuk/page.tsx` renders it
absolutely positioned behind the existing (unchanged) login card.

**Tech Stack:** Pure CSS `@keyframes` in `globals.css` (Tailwind v4 has no
config file to extend animations in) — no new dependencies, no client JS.

**Depends on:** nothing — `/masuk` is outside the `(app)` route group, so
none of the other 4 plans' infrastructure applies here.

## Global Constraints

- No JS animation library (framer-motion, etc.) — pure CSS `transform`
  keyframes, GPU-accelerated, addresses the performance concern raised
  during brainstorming (this runs continuously on an unauthenticated page,
  so it must be cheap).
- Skeleton cards are abstract shapes only (gray rounded blocks) — no real
  text/data, matching the Jira reference exactly.
- Individual bars do **not** pulse (no `animate-pulse`) — only the row's
  `translateX` marquee motion. Combining per-bar opacity pulsing with
  whole-row sliding would look busy; the brief was "catchy but not
  distracting."
- Backdrop opacity: `opacity-35` (roughly the 30-40% range agreed on) with
  a top/bottom fade mask so rows don't have a hard-cut edge.
- Respect `prefers-reduced-motion: reduce` — animation is disabled entirely
  for users with that OS setting.
- Cards are visible (not hidden) on mobile widths, just smaller
  (`w-* lg:w-*` responsive sizing on each card template).
- The login card itself (form) is untouched functionally — only its
  surrounding page markup changes.

---

### Task 1: Marquee keyframes in `globals.css`

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add the keyframes and reduced-motion override**

Append to `src/app/globals.css`:

```css
/* Marquee latar halaman login — lihat LoginBackdrop. */
@keyframes marquee-ltr {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0%);
  }
}
@keyframes marquee-rtl {
  from {
    transform: translateX(0%);
  }
  to {
    transform: translateX(-50%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .marquee-row {
    animation: none !important;
  }
}
```

(`marquee-ltr` starts shifted left by half its (duplicated) width and
animates back to 0 — the content visually slides rightward, i.e.
left-to-right. `marquee-rtl` is the mirror image, sliding leftward.)

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add marquee keyframes for login background"
```

---

### Task 2: `LoginBackdrop` component

**Files:**
- Create: `src/components/login-backdrop.tsx`

**Interfaces:**
- Produces: `LoginBackdrop` component, no props. Consumed by
  `src/app/masuk/page.tsx` (Task 3).

- [ ] **Step 1: Write the skeleton card templates**

Create `src/components/login-backdrop.tsx`:

```tsx
function SkeletonTaskCard() {
  return (
    <div className="w-40 shrink-0 space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4 lg:w-56">
      <div className="flex items-center justify-between">
        <div className="h-3 w-14 rounded-full bg-slate-200 lg:w-16" />
        <div className="h-5 w-5 rounded-full bg-slate-200" />
      </div>
      <div className="h-3.5 w-full rounded-md bg-slate-200" />
      <div className="h-3.5 w-2/3 rounded-md bg-slate-200" />
      <div className="flex items-center gap-2 pt-1">
        <div className="h-6 w-6 rounded-full bg-slate-200" />
        <div className="h-2.5 w-16 rounded-full bg-slate-200 lg:w-20" />
      </div>
    </div>
  );
}

function SkeletonKanbanTile() {
  return (
    <div className="w-28 shrink-0 space-y-2 rounded-2xl border border-slate-200 bg-white p-3 lg:w-40">
      <div className="h-2.5 w-10 rounded-full bg-slate-200 lg:w-12" />
      <div className="h-3 w-full rounded-md bg-slate-200" />
      <div className="h-12 w-full rounded-xl bg-slate-100 lg:h-16" />
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className="flex w-52 shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 lg:w-72">
      <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-2/3 rounded-full bg-slate-200" />
        <div className="h-2 w-1/3 rounded-full bg-slate-100" />
      </div>
      <div className="h-5 w-10 shrink-0 rounded-full bg-slate-200" />
    </div>
  );
}

function SkeletonStatTile() {
  return (
    <div className="w-24 shrink-0 space-y-2 rounded-2xl border border-slate-200 bg-white p-3.5 lg:w-32">
      <div className="h-2.5 w-8 rounded-full bg-slate-200 lg:w-10" />
      <div className="h-6 w-12 rounded-md bg-slate-200 lg:w-14" />
    </div>
  );
}

type CardTemplate = () => React.JSX.Element;

const ROW_1: CardTemplate[] = [
  SkeletonTaskCard,
  SkeletonKanbanTile,
  SkeletonTableRow,
  SkeletonStatTile,
  SkeletonTaskCard,
  SkeletonKanbanTile,
];
const ROW_2: CardTemplate[] = [
  SkeletonTableRow,
  SkeletonStatTile,
  SkeletonTaskCard,
  SkeletonKanbanTile,
  SkeletonTableRow,
  SkeletonStatTile,
];
const ROW_3: CardTemplate[] = [
  SkeletonKanbanTile,
  SkeletonTaskCard,
  SkeletonStatTile,
  SkeletonTableRow,
  SkeletonKanbanTile,
  SkeletonTaskCard,
];

function MarqueeRow({
  cards,
  direction,
  durationS,
}: {
  cards: CardTemplate[];
  direction: "ltr" | "rtl";
  durationS: number;
}) {
  // Duplikat urutan sekali supaya loop translateX 0%->-50% (atau sebaliknya) mulus tanpa lompatan.
  const sequence = [...cards, ...cards];
  const keyframe = direction === "ltr" ? "marquee-ltr" : "marquee-rtl";

  return (
    <div
      className="marquee-row flex w-max gap-4"
      style={{ animation: `${keyframe} ${durationS}s linear infinite` }}
    >
      {sequence.map((Card, i) => (
        <Card key={i} />
      ))}
    </div>
  );
}

/** Latar halaman login: 3 baris kartu skeleton abstrak yang bergerak otomatis. */
export function LoginBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center gap-4 overflow-hidden opacity-35 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
    >
      <MarqueeRow cards={ROW_1} direction="ltr" durationS={38} />
      <MarqueeRow cards={ROW_2} direction="rtl" durationS={44} />
      <MarqueeRow cards={ROW_3} direction="ltr" durationS={40} />
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/login-backdrop.tsx
git commit -m "feat: add LoginBackdrop skeleton marquee component"
```

---

### Task 3: Wire it into `/masuk`

**Files:**
- Modify: `src/app/masuk/page.tsx`

- [ ] **Step 1: Update the page**

Replace the full contents of `src/app/masuk/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import { LoginBackdrop } from "@/components/login-backdrop";

export default async function MasukPage() {
  const user = await getCurrentUser();
  if (user) redirect("/beranda");

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-teal-50 to-slate-100 px-5 py-10">
      <LoginBackdrop />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
            <FlaskConical className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Delta Indonesia Laboratory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manajemen Tugas — masuk untuk melihat tugas Anda
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
```

The only changes: `relative overflow-hidden` added to `<main>`, the new
`<LoginBackdrop />` render, and `relative z-10` added to the content wrapper
`div` so it stacks above the backdrop. The logo/title/form card markup is
byte-for-byte unchanged.

- [ ] **Step 2: Run full test suite and typecheck**

Run: `npm test && npm run typecheck`
Expected: PASS (this page has no unit tests — this just confirms nothing
else broke).

- [ ] **Step 3: Commit**

```bash
git add src/app/masuk/page.tsx
git commit -m "feat: render animated skeleton backdrop on login page"
```

---

### Task 4: Manual verification

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`, visit `/masuk` (log out first if already logged in).

- [ ] **Step 2: Verify the animation**

Confirm 3 rows of gray skeleton cards fill the background, rows 1 and 3
sliding left-to-right, row 2 sliding right-to-left, looping continuously
with no visible jump/seam at the loop point.

- [ ] **Step 3: Verify legibility and non-distraction**

Confirm the login card (logo, title, username/password fields) stays fully
legible and the backdrop reads as a subtle background texture, not
something competing for attention.

- [ ] **Step 4: Verify no horizontal scroll**

Confirm the page never gets a horizontal scrollbar regardless of viewport
width (the marquee rows are intentionally wider than the screen — the
backdrop container's `overflow-hidden` must clip them).

- [ ] **Step 5: Verify mobile sizing**

Resize to a mobile width — confirm the skeleton cards shrink proportionally
(via each template's `w-* lg:w-*` classes) rather than overflowing or
looking crowded.

- [ ] **Step 6: Verify reduced-motion**

In your OS/browser accessibility settings, enable "reduce motion" (or in
Chrome DevTools: Rendering tab → "Emulate CSS media feature
prefers-reduced-motion: reduce"), reload `/masuk` — confirm the cards are
static (no sliding).

- [ ] **Step 7: Verify login still works**

Log in with valid credentials — confirm it still redirects to `/beranda`
exactly as before (the form's behavior is untouched).
