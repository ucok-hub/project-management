# Graph Report - project-management  (2026-07-17)

## Corpus Check
- 149 files · ~52,958 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 647 nodes · 1572 edges · 36 communities (31 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `459983c0`
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
- feature-search.tsx

## God Nodes (most connected - your core abstractions)
1. `requireUser()` - 54 edges
2. `cn()` - 35 edges
3. `buttonClass()` - 28 edges
4. `DB` - 28 edges
5. `newId()` - 17 edges
6. `compilerOptions` - 16 edges
7. `Global Constraints` - 15 edges
8. `Global Constraints` - 14 edges
9. `scripts` - 13 edges
10. `Avatar()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `ProfilPage()` --calls--> `requireUser()`  [EXTRACTED]
  src/app/(app)/profil/page.tsx → src/lib/auth.ts
- `MasukPage()` --calls--> `getCurrentUser`  [EXTRACTED]
  src/app/masuk/page.tsx → src/lib/auth.ts
- `Sidebar()` --indirect_call--> `User`  [INFERRED]
  src/components/app-shell/sidebar.tsx → src/db/schema.ts
- `CreateForm()` --indirect_call--> `createTaskOrRequest()`  [INFERRED]
  src/components/create-form.tsx → src/lib/actions/tasks.ts
- `ChangelogPublishForm()` --indirect_call--> `publishChangelog()`  [INFERRED]
  src/components/dev/changelog-publish-form.tsx → src/lib/actions/changelogs.ts

## Import Cycles
- None detected.

## Communities (36 total, 5 thin omitted)

### Community 0 - "schema.ts"
Cohesion: 0.06
Nodes (56): RequestActions(), createDb(), DB, getDb(), globalForDb, Attachment, attachments, attachmentsRelations (+48 more)

### Community 1 - "dependencies"
Cohesion: 0.04
Nodes (48): dependencies, bcryptjs, clsx, date-fns, drizzle-orm, @electric-sql/pglite, jose, lucide-react (+40 more)

### Community 2 - "page.tsx"
Cohesion: 0.09
Nodes (25): GET(), TaskDetailPage(), DevPanelPage(), CommentForm(), LoginAsList(), Row, formatCell(), SqlConsole() (+17 more)

### Community 3 - "create-form.tsx"
Cohesion: 0.09
Nodes (38): AppLayout(), Home(), BackButton(), BottomNav(), ChangelogPopup(), useHeaderBackContext(), firstName(), Header() (+30 more)

### Community 4 - "auth.ts"
Cohesion: 0.17
Nodes (6): MasukPage(), CardTemplate, LoginBackdrop(), ROW_1, ROW_2, ROW_3

### Community 5 - "requireUser"
Cohesion: 0.09
Nodes (41): BerandaPage(), PembaruanPage(), PermintaanPage(), PersetujuanPage(), SayaBeriPage(), TugasSayaPage(), RequestCard(), RequestList() (+33 more)

### Community 6 - "admin.ts"
Cohesion: 0.08
Nodes (38): ProfilPage(), UserCreateForm(), PasswordResetForm(), UserData, UserEditForm(), AvatarActions(), ChangePasswordForm(), PositionLite (+30 more)

### Community 7 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "engine.test.ts"
Cohesion: 0.07
Nodes (45): AdminBaruPage(), AdminEditPage(), AdminPage(), BuatPage(), NotifikasiPage(), TYPE_STYLE, PenggunaDetailPage(), RequestDetailPage() (+37 more)

### Community 9 - "page.tsx"
Cohesion: 0.22
Nodes (13): CropModal(), AvatarState, deleteAvatarAction(), isJpeg(), uploadAvatarAction(), deleteAvatar(), saveAvatar(), usesRemoteStorage() (+5 more)

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
Cohesion: 0.11
Nodes (28): cnRow(), LainnyaPage(), PantauanPage(), CreateForm(), User, main(), CurrentUser, getLatestChangelog() (+20 more)

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

### Community 35 - "feature-search.tsx"
Cohesion: 0.47
Nodes (4): FeatureSearch(), SEARCH_DESTINATIONS, SearchDestination, searchDestinations()

## Knowledge Gaps
- **233 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+228 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requireUser()` connect `engine.test.ts` to `schema.ts`, `page.tsx`, `create-form.tsx`, `requireUser`, `admin.ts`, `page.tsx`, `create-form.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `cn()` connect `create-form.tsx` to `engine.test.ts`, `page.tsx`, `requireUser`, `admin.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `buttonClass()` connect `admin.ts` to `page.tsx`, `create-form.tsx`, `requireUser`, `engine.test.ts`, `page.tsx`, `create-form.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _233 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06315789473684211 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09446693657219973 - nodes in this community are weakly interconnected._