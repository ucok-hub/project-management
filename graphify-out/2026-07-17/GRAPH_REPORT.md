# Graph Report - project-management  (2026-07-17)

## Corpus Check
- 137 files · ~48,807 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 609 nodes · 1429 edges · 35 communities (30 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8c060301`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- schema.ts
- dependencies
- page.tsx
- create-form.tsx
- auth.ts
- requireUser
- admin.ts
- compilerOptions
- engine.test.ts
- page.tsx
- layout.tsx
- layout.tsx
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- Delta Indonesia Laboratory (DIL) — Manajemen Tugas
- AGENTS.md
- vercel.json
- create-form.tsx
- Solusi
- Global Constraints
- Desain: Nav Highlighting Berbasis Section (Fitur 1/5)
- Global Constraints
- Global Constraints
- Solusi
- 2026-07-14-presence.md
- Global Constraints
- Global Constraints

## God Nodes (most connected - your core abstractions)
1. `requireUser()` - 49 edges
2. `cn()` - 35 edges
3. `buttonClass()` - 28 edges
4. `DB` - 24 edges
5. `compilerOptions` - 16 edges
6. `newId()` - 15 edges
7. `Global Constraints` - 15 edges
8. `Global Constraints` - 14 edges
9. `scripts` - 13 edges
10. `createTaskOrRequest()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `ProfilPage()` --calls--> `requireUser()`  [EXTRACTED]
  src/app/(app)/profil/page.tsx → src/lib/auth.ts
- `BottomNav()` --indirect_call--> `Home()`  [INFERRED]
  src/components/app-shell/bottom-nav.tsx → src/app/page.tsx
- `Sidebar()` --indirect_call--> `Home()`  [INFERRED]
  src/components/app-shell/sidebar.tsx → src/app/page.tsx
- `Sidebar()` --indirect_call--> `User`  [INFERRED]
  src/components/app-shell/sidebar.tsx → src/db/schema.ts
- `CreateForm()` --indirect_call--> `createTaskOrRequest()`  [INFERRED]
  src/components/create-form.tsx → src/lib/actions/tasks.ts

## Import Cycles
- None detected.

## Communities (35 total, 5 thin omitted)

### Community 0 - "schema.ts"
Cohesion: 0.08
Nodes (44): createDb(), DB, getDb(), globalForDb, Attachment, attachments, attachmentsRelations, Comment (+36 more)

### Community 1 - "dependencies"
Cohesion: 0.04
Nodes (48): dependencies, bcryptjs, clsx, date-fns, drizzle-orm, @electric-sql/pglite, jose, lucide-react (+40 more)

### Community 2 - "page.tsx"
Cohesion: 0.11
Nodes (30): TaskDetailPage(), RequestActions(), TaskActions(), TaskCard(), Badge(), Card(), CardBody(), Textarea() (+22 more)

### Community 3 - "create-form.tsx"
Cohesion: 0.16
Nodes (22): AppLayout(), BackButton(), BottomNav(), FeatureSearch(), useHeaderBackContext(), firstName(), Header(), SectionTracker() (+14 more)

### Community 4 - "auth.ts"
Cohesion: 0.07
Nodes (38): GET(), cnRow(), LainnyaPage(), NotifikasiPage(), TYPE_STYLE, PantauanPage(), MasukPage(), Home() (+30 more)

### Community 5 - "requireUser"
Cohesion: 0.14
Nodes (24): BerandaPage(), PermintaanPage(), PersetujuanPage(), SayaBeriPage(), TugasSayaPage(), RequestCard(), RequestList(), TaskList() (+16 more)

### Community 6 - "admin.ts"
Cohesion: 0.14
Nodes (24): AdminBaruPage(), BuatPage(), RequestDetailPage(), UserCreateForm(), PasswordResetForm(), UserData, UserEditForm(), BackConfig (+16 more)

### Community 7 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "engine.test.ts"
Cohesion: 0.09
Nodes (30): AdminEditPage(), AdminPage(), PenggunaDetailPage(), UserList(), UserRow, ACTIVITY_EVENTS, PresenceHeartbeat(), PresenceAvatar() (+22 more)

### Community 9 - "page.tsx"
Cohesion: 0.09
Nodes (30): ProfilPage(), AvatarActions(), CropModal(), ChangePasswordForm(), CommentForm(), Button(), buttonClass(), ButtonProps (+22 more)

### Community 10 - "layout.tsx"
Cohesion: 0.22
Nodes (8): 🧭 Arsitektur singkat, Delta Indonesia Laboratory — Manajemen Tugas, ☁️ Deploy (Supabase + Vercel), ✨ Fitur, 🚀 Menjalankan (dev lokal), 📜 Perintah, 🏢 Struktur jabatan (data asli Delta Indonesia Laboratory), 🛠️ Tech stack

### Community 11 - "layout.tsx"
Cohesion: 0.40
Nodes (3): metadata, viewport, PwaRegister()

### Community 20 - "Delta Indonesia Laboratory (DIL) — Manajemen Tugas"
Cohesion: 0.29
Nodes (6): Aturan bisnis inti (JANGAN ubah tanpa update tes), Delta Indonesia Laboratory (DIL) — Manajemen Tugas, Konvensi, Perintah penting, Stack, Verifikasi

### Community 24 - "create-form.tsx"
Cohesion: 0.09
Nodes (27): CreateForm(), PositionLite, Preview, UserLite, main(), CreateState, createAssignment(), TestDB (+19 more)

### Community 25 - "Solusi"
Cohesion: 0.09
Nodes (20): Desain: Foto Profil (Upload, Crop, Kompresi, Hapus) (Fitur 3/5), Di Luar Cakupan, Flow upload, Hapus foto, Masalah, Perubahan Data & Komponen, Solusi, Storage: Vercel Blob (prod) / disk lokal (dev) (+12 more)

### Community 26 - "Global Constraints"
Cohesion: 0.13
Nodes (15): Global Constraints, Task 10: Kelola Pengguna list (`admin/user-list.tsx`) — live dot, Task 11: Detail Tugas & Detail Permintaan — live dot + profile link, Task 12: `/admin/[id]` — status text + live dot, Task 13: New `/pengguna/[id]` profile-view page, Task 14: Manual end-to-end verification, Task 1: `presence` table, Task 2: Pure presence-resolution logic (+7 more)

### Community 27 - "Desain: Nav Highlighting Berbasis Section (Fitur 1/5)"
Cohesion: 0.13
Nodes (13): Cakupan Perubahan, Desain: Nav Highlighting Berbasis Section (Fitur 1/5), Di Luar Cakupan, Masalah, Solusi, Cakupan halaman, Cakupan Perubahan, Desain: Tombol Kembali ke View Sebelumnya (Fitur 2/5) (+5 more)

### Community 28 - "Global Constraints"
Cohesion: 0.14
Nodes (14): Global Constraints, Task 10: Add back button to `/notifikasi`, Task 11: Add back button to `/buat`, Task 12: Remove `BackLink` and verify, Task 13: Manual end-to-end verification, Task 1: Extend `section-tracker` with the has-navigated flag, Task 2: `HeaderBackProvider` context + `SetHeaderBack`, Task 3: `BackButton` component (+6 more)

### Community 29 - "Global Constraints"
Cohesion: 0.18
Nodes (11): Global Constraints, Task 10: Manual end-to-end verification, Task 1: Add `avatarUrl` column, Task 2: Install dependencies and configure storage env, Task 3: Storage abstraction + local dev serving route, Task 4: Crop + compress canvas helper, Task 5: `Avatar` gains an optional `src` prop, Task 6: Wire `src` through every existing `Avatar` render (+3 more)

### Community 30 - "Solusi"
Cohesion: 0.18
Nodes (10): Animasi, Cakupan Perubahan, Desain: Redesign Halaman Login — Background Carousel Skeleton (Fitur 5/5), Di Luar Cakupan, Isi kartu skeleton, Masalah, Mobile, Opacity & keterbacaan (+2 more)

### Community 31 - "2026-07-14-presence.md"
Cohesion: 0.25
Nodes (4): Foto Profil (Upload, Crop, Kompresi, Hapus) Implementation Plan, Nav Highlighting (Section-Aware Active State) Implementation Plan, Presence (Online/Idle/Offline & Last Seen) Implementation Plan, Tombol Kembali (Header Back Button) Implementation Plan

### Community 32 - "Global Constraints"
Cohesion: 0.25
Nodes (8): Global Constraints, Task 1: Section-tracker pure utilities, Task 2: Extract `resolveTaskDefaultSection` and use it in the task detail page, Task 3: Client component that writes the last-section cookie, Task 4: Wire the cookie into the `(app)` layout, Task 5: Use effective pathname in `Sidebar`, Task 6: Use effective pathname in `BottomNav`, Task 7: Manual end-to-end verification

### Community 33 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, Login Redesign — Background Skeleton Carousel Implementation Plan, Task 1: Marquee keyframes in `globals.css`, Task 2: `LoginBackdrop` component, Task 3: Wire it into `/masuk`, Task 4: Manual verification

## Knowledge Gaps
- **231 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+226 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requireUser()` connect `requireUser` to `schema.ts`, `page.tsx`, `create-form.tsx`, `auth.ts`, `admin.ts`, `engine.test.ts`, `page.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `cn()` connect `page.tsx` to `create-form.tsx`, `auth.ts`, `requireUser`, `admin.ts`, `engine.test.ts`, `page.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `buttonClass()` connect `page.tsx` to `page.tsx`, `auth.ts`, `requireUser`, `admin.ts`, `engine.test.ts`, `create-form.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _231 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07514124293785311 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10909090909090909 - nodes in this community are weakly interconnected._