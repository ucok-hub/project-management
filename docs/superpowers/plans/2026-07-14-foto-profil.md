# Foto Profil (Upload, Crop, Kompresi, Hapus) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user upload a profile photo (camera or gallery), crop/zoom/
rotate it in-browser, compress it client-side to a small JPEG, and have it
show up everywhere `Avatar` is rendered — with a delete option to revert to
the initials bubble.

**Architecture:** A new `avatarUrl` column on `users`. A storage abstraction
(`src/lib/avatar-storage.ts`) that writes to Vercel Blob in prod or local
disk (`.data/avatars/`, served via a small API route) in dev — mirroring the
existing PGlite-vs-Postgres split in `src/db/index.ts`. A client-side crop
editor (`react-easy-crop`) whose "Terapkan" button renders the final result
to a 256×256 canvas and compresses it to JPEG before it ever reaches the
server. `Avatar` gains an optional `src` prop, wired through every existing
call site.

**Tech Stack:** Next.js 16 Server Actions, `react-easy-crop` (new dep),
`@vercel/blob` (new dep), Canvas API, Drizzle migration.

## Global Constraints

- Output avatar: 256×256px square JPEG, quality 0.82 (typical result
  15-40KB). All cropping/rotating/compressing happens in the browser, only
  after the user clicks "Terapkan" — never on the server, never repeatedly.
- Storage selection mirrors `src/db/index.ts`'s pattern: `DATABASE_URL` set
  → Vercel Blob (prod); empty → local disk under `AVATAR_DIR`
  (default `./.data/avatars`), served by a new route handler.
- Raw upload guard (not a normal-case limit): reject files over 20MB or
  non-`image/*` before ever opening the crop editor.
- No live webcam capture (`getUserMedia`) on desktop — "Ambil Foto" uses
  `<input capture="user">`, which opens the native camera on mobile and
  falls back to a plain file picker on desktop (no extra code needed for
  that fallback — it's the browser's native behavior).
- Self-service only: a user uploads/deletes their own photo. No admin
  override in this plan.
- `Avatar`'s existing `name`-based initials-bubble rendering is unchanged
  when `src` is absent — this must stay a pure additive change.

---

### Task 1: Add `avatarUrl` column

**Files:**
- Modify: `src/db/schema.ts:24-25`

**Interfaces:**
- Produces: `users.avatarUrl: string | null` on the Drizzle `User` type,
  automatically included in every existing query that returns full user
  rows (`getCurrentUser`, `getUserById`, `getActiveUsers`, `getAllUsers`,
  `getUsersInPositions`, and every relational `with: { giver: ..., ... }`
  query) — no query-layer code changes needed anywhere.

- [ ] **Step 1: Add the column**

In `src/db/schema.ts`, in the `users` table definition, add a line after
`passwordHash`:

```ts
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").notNull().default(false),
```

- [ ] **Step 2: Generate the migration**

Run: `npm run db:generate`
Expected: a new file appears under `drizzle/`, e.g.
`drizzle/0002_<generated-name>.sql`, containing:
```sql
ALTER TABLE "users" ADD COLUMN "avatar_url" text;
```
(Drizzle-kit picks a random adjective-noun name for the file — the exact
name doesn't matter, just confirm the SQL content matches.)

- [ ] **Step 3: Apply it to local dev**

Run: `npm run db:migrate`
Expected: no errors; `.data/pglite` now has the new column.

- [ ] **Step 4: Run full test suite and typecheck**

Run: `npm test && npm run typecheck`
Expected: PASS — `engine.test.ts` applies all migrations under `./drizzle`
to a fresh in-memory PGlite on every run (see its `before()` hook), so it
picks up the new column automatically; existing `db.insert(schema.users, ...)`
calls in that test don't set `avatarUrl`, which is fine since the column is
nullable.

- [ ] **Step 5: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat: add avatarUrl column to users"
```

---

### Task 2: Install dependencies and configure storage env

**Files:**
- Modify: `package.json`
- Modify: `.env.example`

- [ ] **Step 1: Install packages**

Run: `npm install react-easy-crop @vercel/blob`
Expected: both added to `dependencies` in `package.json`, no peer-dependency
errors against React 19.

- [ ] **Step 2: Document the new env var**

In `.env.example`, add after the `PGLITE_DIR` line:

```
# Folder lokal untuk simpan foto profil saat dev (DATABASE_URL kosong).
# Di produksi (DATABASE_URL diisi), foto disimpan ke Vercel Blob lewat
# BLOB_READ_WRITE_TOKEN (env var ini disuntik otomatis oleh integrasi
# Vercel Blob — tidak perlu diisi manual di .env lokal).
AVATAR_DIR="./.data/avatars"
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: add react-easy-crop and @vercel/blob dependencies"
```

---

### Task 3: Storage abstraction + local dev serving route

**Files:**
- Create: `src/lib/avatar-storage.ts`
- Create: `src/app/api/avatars/[filename]/route.ts`

**Interfaces:**
- Produces: `saveAvatar(blob: Blob): Promise<string>` (returns a URL — either
  a Vercel Blob public URL or a local `/api/avatars/<file>.jpg` path),
  `deleteAvatar(url: string): Promise<void>`. Consumed by the server
  actions in Task 7.

- [ ] **Step 1: Write the storage module**

Create `src/lib/avatar-storage.ts`:

```ts
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { put, del } from "@vercel/blob";
import { newId } from "@/lib/utils";

const AVATAR_DIR = process.env.AVATAR_DIR ?? "./.data/avatars";
const LOCAL_PREFIX = "/api/avatars/";

function isProd(): boolean {
  return !!process.env.DATABASE_URL;
}

/** Simpan blob avatar (JPEG hasil kompresi client) dan kembalikan URL-nya. */
export async function saveAvatar(blob: Blob): Promise<string> {
  const filename = `${newId()}.jpg`;

  if (isProd()) {
    const result = await put(`avatars/${filename}`, blob, {
      access: "public",
      contentType: "image/jpeg",
    });
    return result.url;
  }

  await mkdir(AVATAR_DIR, { recursive: true });
  const buffer = Buffer.from(await blob.arrayBuffer());
  await writeFile(path.join(AVATAR_DIR, filename), buffer);
  return `${LOCAL_PREFIX}${filename}`;
}

/** Hapus avatar lama dari storage (dipanggil sebelum simpan yang baru, atau saat user hapus foto). */
export async function deleteAvatar(url: string): Promise<void> {
  if (isProd()) {
    await del(url);
    return;
  }
  if (!url.startsWith(LOCAL_PREFIX)) return;
  const filename = url.slice(LOCAL_PREFIX.length);
  await unlink(path.join(AVATAR_DIR, filename)).catch(() => {});
}
```

- [ ] **Step 2: Write the local-dev serving route**

Create `src/app/api/avatars/[filename]/route.ts`:

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const AVATAR_DIR = process.env.AVATAR_DIR ?? "./.data/avatars";
const VALID_FILENAME = /^[a-f0-9-]+\.jpg$/i;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!VALID_FILENAME.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const buffer = await readFile(path.join(AVATAR_DIR, filename));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
```

(This route only matters in dev — in prod, `avatarUrl` already points
directly at a public Vercel Blob URL, so `<img src>` never hits this route.
The filename regex is defense-in-depth against path traversal, even though
every filename is server-generated via `newId()`, never taken from user
input.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/avatar-storage.ts "src/app/api/avatars/[filename]/route.ts"
git commit -m "feat: add avatar storage abstraction (Vercel Blob / local disk)"
```

---

### Task 4: Crop + compress canvas helper

**Files:**
- Create: `src/lib/crop-image.ts`
- Test: `src/lib/crop-image.test.ts`
- Modify: `package.json` (test script)

**Interfaces:**
- Produces: `getRadianAngle(degrees: number): number`,
  `rotatedBoundingBox(width, height, rotationDeg): { width: number; height: number }`
  (both pure, unit-tested), `type PixelCrop = { x: number; y: number; width: number; height: number }`,
  `cropAndCompressAvatar(imageSrc: string, pixelCrop: PixelCrop, rotationDeg: number): Promise<Blob>`
  (DOM-dependent, not unit-tested — consumed by `CropModal` in Task 8).

- [ ] **Step 1: Write the failing test for the pure math**

Create `src/lib/crop-image.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { getRadianAngle, rotatedBoundingBox } from "./crop-image";

test("getRadianAngle: konversi derajat ke radian", () => {
  assert.equal(getRadianAngle(180), Math.PI);
  assert.equal(getRadianAngle(0), 0);
});

test("rotatedBoundingBox: rotasi 0 derajat -> ukuran sama", () => {
  const box = rotatedBoundingBox(100, 200, 0);
  assert.ok(Math.abs(box.width - 100) < 0.001);
  assert.ok(Math.abs(box.height - 200) < 0.001);
});

test("rotatedBoundingBox: rotasi 90 derajat -> width/height tertukar", () => {
  const box = rotatedBoundingBox(100, 200, 90);
  assert.ok(Math.abs(box.width - 200) < 0.001);
  assert.ok(Math.abs(box.height - 100) < 0.001);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/crop-image.test.ts`
Expected: FAIL — `Cannot find module './crop-image'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/crop-image.ts`:

```ts
export function getRadianAngle(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Ukuran bounding box gambar setelah dirotasi sejumlah derajat. */
export function rotatedBoundingBox(
  width: number,
  height: number,
  rotationDeg: number,
): { width: number; height: number } {
  const rotRad = getRadianAngle(rotationDeg);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export type PixelCrop = { x: number; y: number; width: number; height: number };

const OUTPUT_SIZE = 256;
const JPEG_QUALITY = 0.82;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/**
 * Ambil area crop (koordinat piksel gambar asli, sudah memperhitungkan
 * rotasi — dihasilkan react-easy-crop lewat onCropComplete), render ke
 * kanvas 256x256, dan kompres jadi JPEG. Dipanggil saat user klik "Terapkan".
 */
export async function cropAndCompressAvatar(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotationDeg: number,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const { width: boxWidth, height: boxHeight } = rotatedBoundingBox(
    image.width,
    image.height,
    rotationDeg,
  );

  const rotateCanvas = document.createElement("canvas");
  rotateCanvas.width = boxWidth;
  rotateCanvas.height = boxHeight;
  const rotateCtx = rotateCanvas.getContext("2d")!;
  rotateCtx.translate(boxWidth / 2, boxHeight / 2);
  rotateCtx.rotate(getRadianAngle(rotationDeg));
  rotateCtx.translate(-image.width / 2, -image.height / 2);
  rotateCtx.drawImage(image, 0, 0);

  const cropData = rotateCtx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
  );
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = pixelCrop.width;
  cropCanvas.height = pixelCrop.height;
  cropCanvas.getContext("2d")!.putImageData(cropData, 0, 0);

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = OUTPUT_SIZE;
  outputCanvas.height = OUTPUT_SIZE;
  const outputCtx = outputCanvas.getContext("2d")!;
  outputCtx.imageSmoothingQuality = "high";
  outputCtx.drawImage(cropCanvas, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Gagal mengompres gambar"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/crop-image.test.ts`
Expected: PASS (3 tests). `cropAndCompressAvatar` itself is DOM-dependent
(uses `Image`/`document.createElement("canvas")`, unavailable under plain
`node:test`) — it's verified manually in Task 10, same treatment as
`SectionTracker` in the nav-highlighting plan.

- [ ] **Step 5: Add to the project test script**

In `package.json`, add `src/lib/crop-image.test.ts` to the `test` script
(alongside the existing files).

- [ ] **Step 6: Commit**

```bash
git add src/lib/crop-image.ts src/lib/crop-image.test.ts package.json
git commit -m "feat: add crop/rotate/compress canvas helper for avatars"
```

---

### Task 5: `Avatar` gains an optional `src` prop

**Files:**
- Modify: `src/components/ui/avatar.tsx`

**Interfaces:**
- Produces: `Avatar` now accepts `src?: string | null`. When present,
  renders an `<img>`; when absent, unchanged initials-bubble behavior.

- [ ] **Step 1: Update the component**

Replace the full contents of `src/components/ui/avatar.tsx`:

```tsx
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter((p) => !/^(pak|bu|ibu|bpk)$/i.test(p));
  const use = parts.length ? parts : name.trim().split(/\s+/);
  return use
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

// Warna avatar deterministik dari nama.
const COLORS = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
];

function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn("inline-block shrink-0 rounded-full object-cover", SIZES[size], className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        SIZES[size],
        colorFor(name),
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
```

(`SIZES` moved out of the function body since both branches share it — the
only structural change beyond adding the `src` branch.)

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: errors at every existing `<Avatar name=... />` call site are NOT
expected here (the new `src` prop is optional, so all 9 existing call
sites still compile as-is) — this step just confirms `avatar.tsx` itself
compiles.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/avatar.tsx
git commit -m "feat: Avatar renders an image when src is provided"
```

---

### Task 6: Wire `src` through every existing `Avatar` render

**Files:**
- Modify: `src/components/app-shell/header.tsx:45`
- Modify: `src/components/app-shell/sidebar.tsx:94`
- Modify: `src/app/(app)/profil/page.tsx:16`
- Modify: `src/app/(app)/tugas/[id]/page.tsx` (comment avatar line 141, and
  the local `PartyRow` helper + its 2 call sites, lines 84-85 and 158-170)
- Modify: `src/app/(app)/permintaan/[id]/page.tsx` (local `PartyRow` helper
  + its 2 call sites, lines 74-75 and 162-174)
- Modify: `src/app/(app)/admin/[id]/page.tsx:25`
- Modify: `src/components/admin/user-list.tsx:49,87`
- Modify: `src/components/monitor-list.tsx:43,108`

All 9 sites already have full user rows available (confirmed in the
codebase survey — every query with `with: { ... }` returns full columns,
so `avatarUrl` is already present on every object below, no query changes
needed). This is one mechanical batch — same one-line change repeated.

- [ ] **Step 1: `header.tsx`**

Replace line 45:
```tsx
            <Avatar name={user.name} />
```
with:
```tsx
            <Avatar name={user.name} src={user.avatarUrl} />
```

- [ ] **Step 2: `sidebar.tsx`**

Replace line 94:
```tsx
          <Avatar name={user.name} size="sm" />
```
with:
```tsx
          <Avatar name={user.name} src={user.avatarUrl} size="sm" />
```

- [ ] **Step 3: `profil/page.tsx`**

Replace line 16:
```tsx
        <Avatar name={me.name} size="lg" />
```
with:
```tsx
        <Avatar name={me.name} src={me.avatarUrl} size="lg" />
```

- [ ] **Step 4: `tugas/[id]/page.tsx` — comment avatar**

Replace line 141:
```tsx
                <Avatar name={c.author.name} size="sm" />
```
with:
```tsx
                <Avatar name={c.author.name} src={c.author.avatarUrl} size="sm" />
```

- [ ] **Step 5: `tugas/[id]/page.tsx` — `PartyRow` helper**

Replace lines 158-170 (the `PartyRow` function):
```tsx
function PartyRow({ label, name, sub }: { label: string; name: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} size="sm" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate font-semibold text-slate-800">
          {name} <span className="font-normal text-slate-400">· {sub}</span>
        </p>
      </div>
    </div>
  );
}
```
with:
```tsx
function PartyRow({
  label,
  name,
  sub,
  avatarUrl,
}: {
  label: string;
  name: string;
  sub: string;
  avatarUrl: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} src={avatarUrl} size="sm" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate font-semibold text-slate-800">
          {name} <span className="font-normal text-slate-400">· {sub}</span>
        </p>
      </div>
    </div>
  );
}
```

Then replace lines 84-85 (the two call sites):
```tsx
          <PartyRow label="Dari" name={task.giver.name} sub={task.giver.position.name} />
          <PartyRow label="Untuk" name={task.assignee.name} sub={task.assignee.position.name} />
```
with:
```tsx
          <PartyRow
            label="Dari"
            name={task.giver.name}
            sub={task.giver.position.name}
            avatarUrl={task.giver.avatarUrl}
          />
          <PartyRow
            label="Untuk"
            name={task.assignee.name}
            sub={task.assignee.position.name}
            avatarUrl={task.assignee.avatarUrl}
          />
```

- [ ] **Step 6: `permintaan/[id]/page.tsx` — `PartyRow` helper**

Same treatment as Step 5, in this file's own separate `PartyRow` (lines
162-174):
```tsx
function PartyRow({ label, name, sub }: { label: string; name: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} size="sm" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate font-semibold text-slate-800">
          {name} <span className="font-normal text-slate-400">· {sub}</span>
        </p>
      </div>
    </div>
  );
}
```
with:
```tsx
function PartyRow({
  label,
  name,
  sub,
  avatarUrl,
}: {
  label: string;
  name: string;
  sub: string;
  avatarUrl: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} src={avatarUrl} size="sm" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate font-semibold text-slate-800">
          {name} <span className="font-normal text-slate-400">· {sub}</span>
        </p>
      </div>
    </div>
  );
}
```

Then replace lines 74-75:
```tsx
          <PartyRow label="Peminta" name={req.requester.name} sub={req.requester.position.name} />
          <PartyRow label="Diminta" name={req.target.name} sub={req.target.position.name} />
```
with:
```tsx
          <PartyRow
            label="Peminta"
            name={req.requester.name}
            sub={req.requester.position.name}
            avatarUrl={req.requester.avatarUrl}
          />
          <PartyRow
            label="Diminta"
            name={req.target.name}
            sub={req.target.position.name}
            avatarUrl={req.target.avatarUrl}
          />
```

- [ ] **Step 7: `admin/[id]/page.tsx`**

Replace line 25:
```tsx
        <Avatar name={user.name} size="lg" />
```
with:
```tsx
        <Avatar name={user.name} src={user.avatarUrl} size="lg" />
```

- [ ] **Step 8: `admin/user-list.tsx`**

Replace line 49:
```tsx
                <Avatar name={u.name} size="sm" />
```
with:
```tsx
                <Avatar name={u.name} src={u.avatarUrl} size="sm" />
```

Replace line 87:
```tsx
                        <Avatar name={u.name} size="sm" />
```
with:
```tsx
                        <Avatar name={u.name} src={u.avatarUrl} size="sm" />
```

- [ ] **Step 9: `monitor-list.tsx`**

Replace line 43:
```tsx
                  <Avatar name={user.name} size="sm" />
```
with:
```tsx
                  <Avatar name={user.name} src={user.avatarUrl} size="sm" />
```

Replace line 108:
```tsx
                        <Avatar name={user.name} size="sm" />
```
with:
```tsx
                        <Avatar name={user.name} src={user.avatarUrl} size="sm" />
```

- [ ] **Step 10: Run full test suite and typecheck**

Run: `npm test && npm run typecheck`
Expected: all PASS. Typecheck in particular confirms every `PartyRow` call
site now passes `avatarUrl` (a required prop after Steps 5-6) and every
object referenced (`task.giver`, `req.requester`, `u`, `user`, etc.) really
does have `avatarUrl` on its inferred type post-migration.

- [ ] **Step 11: Commit**

```bash
git add src/components/app-shell/header.tsx src/components/app-shell/sidebar.tsx \
  "src/app/(app)/profil/page.tsx" "src/app/(app)/tugas/[id]/page.tsx" \
  "src/app/(app)/permintaan/[id]/page.tsx" "src/app/(app)/admin/[id]/page.tsx" \
  src/components/admin/user-list.tsx src/components/monitor-list.tsx
git commit -m "feat: render uploaded avatar image everywhere Avatar appears"
```

---

### Task 7: Upload / delete server actions

**Files:**
- Create: `src/lib/actions/avatar.ts`

**Interfaces:**
- Consumes: `saveAvatar`, `deleteAvatar` (Task 3), `requireUser` (existing).
- Produces: `uploadAvatarAction(prev: AvatarState, formData: FormData): Promise<AvatarState>`,
  `deleteAvatarAction(): Promise<void>`. Consumed by `AvatarActions` (Task 9).

- [ ] **Step 1: Write the actions**

Create `src/lib/actions/avatar.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { saveAvatar, deleteAvatar } from "@/lib/avatar-storage";

export type AvatarState = { error?: string };

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // guard, jauh di atas ukuran hasil kompresi normal

export async function uploadAvatarAction(
  _prev: AvatarState,
  formData: FormData,
): Promise<AvatarState> {
  const me = await requireUser();
  const file = formData.get("avatar");
  if (!(file instanceof Blob) || file.size === 0) {
    return { error: "Tidak ada file yang dipilih." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "File terlalu besar." };
  }

  const previousUrl = me.avatarUrl;
  const url = await saveAvatar(file);
  await db.update(users).set({ avatarUrl: url }).where(eq(users.id, me.id));
  if (previousUrl) await deleteAvatar(previousUrl);

  revalidatePath("/", "layout");
  return {};
}

export async function deleteAvatarAction(): Promise<void> {
  const me = await requireUser();
  if (me.avatarUrl) {
    await deleteAvatar(me.avatarUrl);
    await db.update(users).set({ avatarUrl: null }).where(eq(users.id, me.id));
  }
  revalidatePath("/", "layout");
}
```

`revalidatePath("/", "layout")` invalidates the whole `(app)` layout tree —
needed because the avatar shows up in `Header`/`Sidebar`, which are part of
the shared layout wrapping every route, not just `/profil`.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/avatar.ts
git commit -m "feat: add uploadAvatarAction and deleteAvatarAction"
```

---

### Task 8: `CropModal` component

**Files:**
- Create: `src/components/avatar-upload/crop-modal.tsx`

**Interfaces:**
- Consumes: `cropAndCompressAvatar`, `type PixelCrop` (Task 4).
- Produces: `CropModal({ imageSrc, error, onApply, onCancel })`. Consumed
  by `AvatarActions` (Task 9).

- [ ] **Step 1: Write the component**

Create `src/components/avatar-upload/crop-modal.tsx`:

```tsx
"use client";

import { useState } from "react";
import Cropper from "react-easy-crop";
import { RotateCcw, RotateCw } from "lucide-react";
import { cropAndCompressAvatar, type PixelCrop } from "@/lib/crop-image";
import { buttonClass } from "@/components/ui/button";

export function CropModal({
  imageSrc,
  error,
  onApply,
  onCancel,
}: {
  imageSrc: string;
  error: string | null;
  onApply: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<PixelCrop | null>(null);
  const [applying, setApplying] = useState(false);

  async function handleApply() {
    if (!area) return;
    setApplying(true);
    try {
      const blob = await cropAndCompressAvatar(imageSrc, area, rotation);
      onApply(blob);
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80">
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={(_area, areaPixels: PixelCrop) => setArea(areaPixels)}
        />
      </div>

      <div className="space-y-3 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="w-12 text-xs font-medium text-slate-500">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="w-12 text-xs font-medium text-slate-500">Putar</span>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="flex-1"
          />
          <button
            type="button"
            aria-label="Putar 90 derajat kiri"
            onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Putar 90 derajat kanan"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <RotateCw className="h-5 w-5" />
          </button>
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={applying}
            className={buttonClass("secondary", "md", "flex-1")}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={applying || !area}
            className={buttonClass("primary", "md", "flex-1")}
          >
            {applying ? "Memproses…" : "Terapkan"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

(`onCropComplete`'s second argument is typed inline as our own `PixelCrop`
rather than importing `react-easy-crop`'s own area type — the runtime shape
`{x, y, width, height}` is identical, and this avoids depending on the
exact type export name of a newly-installed package.)

- [ ] **Step 2: Commit**

```bash
git add src/components/avatar-upload/crop-modal.tsx
git commit -m "feat: add CropModal (drag/zoom/rotate avatar editor)"
```

---

### Task 9: `AvatarActions` + wire into `/profil`

**Files:**
- Create: `src/components/avatar-upload/avatar-actions.tsx`
- Modify: `src/app/(app)/profil/page.tsx`

**Interfaces:**
- Consumes: `CropModal` (Task 8), `uploadAvatarAction`, `deleteAvatarAction`
  (Task 7).

- [ ] **Step 1: Write the component**

Create `src/components/avatar-upload/avatar-actions.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Trash2 } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { CropModal } from "@/components/avatar-upload/crop-modal";
import { uploadAvatarAction, deleteAvatarAction } from "@/lib/actions/avatar";

const MAX_RAW_BYTES = 20 * 1024 * 1024;

export function AvatarActions({ hasAvatar }: { hasAvatar: boolean }) {
  const [pickedSrc, setPickedSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > MAX_RAW_BYTES) {
      setError("Ukuran file terlalu besar (maks 20MB).");
      return;
    }
    setError(null);
    setPickedSrc(URL.createObjectURL(file));
  }

  async function handleApply(blob: Blob) {
    setBusy(true);
    try {
      const formData = new FormData();
      formData.set("avatar", blob, "avatar.jpg");
      const result = await uploadAvatarAction({}, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setPickedSrc(null);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteAvatarAction();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={busy}
          className={buttonClass("secondary", "sm")}
        >
          <Camera className="h-4 w-4" /> Ambil Foto
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={busy}
          className={buttonClass("secondary", "sm")}
        >
          <ImageIcon className="h-4 w-4" /> Pilih dari Galeri
        </button>
        {hasAvatar && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className={buttonClass("ghost", "sm", "text-red-600")}
          >
            <Trash2 className="h-4 w-4" /> Hapus Foto
          </button>
        )}
      </div>

      {error && !pickedSrc && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {pickedSrc && (
        <CropModal
          imageSrc={pickedSrc}
          error={error}
          onApply={handleApply}
          onCancel={() => {
            setPickedSrc(null);
            setError(null);
          }}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Wire it into the profile page**

In `src/app/(app)/profil/page.tsx`, add the import (after line 6):
```ts
import { AvatarActions } from "@/components/avatar-upload/avatar-actions";
```

Replace lines 15-27 (the avatar/name card):
```tsx
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Avatar name={me.name} src={me.avatarUrl} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-900">{me.name}</p>
          <p className="text-sm text-slate-500">{me.position.name}</p>
          <p className="mt-1 text-xs text-slate-400">@{me.username}</p>
          {me.isAdmin && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </span>
          )}
        </div>
      </div>
```
with:
```tsx
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar name={me.name} src={me.avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-900">{me.name}</p>
            <p className="text-sm text-slate-500">{me.position.name}</p>
            <p className="mt-1 text-xs text-slate-400">@{me.username}</p>
            {me.isAdmin && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 border-t border-slate-100 pt-4">
          <AvatarActions hasAvatar={!!me.avatarUrl} />
        </div>
      </div>
```

(Note the outer `div`'s class moved from the removed wrapper to this new
outer `div`, and the inner avatar+name row keeps `flex items-center gap-4`
as its own nested `div`.)

- [ ] **Step 3: Run full test suite and typecheck**

Run: `npm test && npm run typecheck`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/avatar-upload/avatar-actions.tsx "src/app/(app)/profil/page.tsx"
git commit -m "feat: add photo upload/delete UI to profile page"
```

---

### Task 10: Manual end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify gallery upload + crop + rotate + zoom**

Go to Profil, click "Pilih dari Galeri", pick any photo. Confirm the crop
editor opens with a circular mask, drag to reposition, scroll/pinch to
zoom, drag the rotation slider and click both 90° buttons — confirm the
preview updates live. Click "Terapkan".

- [ ] **Step 3: Verify the result appears everywhere**

After the upload completes, confirm the new photo shows in: the profile
page itself, the header avatar (top-right), the desktop sidebar (bottom-left
user row), and — after visiting a task/request you're party to, or if an
admin, the user list — everywhere else `Avatar` renders for this user.

- [ ] **Step 4: Verify file size**

Open dev tools → Network tab, find the request the upload made (or check
`.data/avatars/` on disk in dev). Confirm the uploaded file is well under
1MB (expect roughly 15-40KB for a typical photo).

- [ ] **Step 5: Verify delete**

Click "Hapus Foto". Confirm the avatar everywhere reverts to the colored
initials bubble, and (in dev) the file under `.data/avatars/` is gone.

- [ ] **Step 6: Verify camera capture on mobile**

On an actual phone (or device-emulation mode with a real camera), click
"Ambil Foto" — confirm it opens the native camera app, not just a file
picker. On desktop, confirm clicking "Ambil Foto" just opens a normal file
picker (no error, no live webcam UI).

- [ ] **Step 7: Verify guard rails**

Try selecting a non-image file (e.g. a `.pdf`) via "Pilih dari Galeri" —
confirm the error message appears and the crop editor never opens.
