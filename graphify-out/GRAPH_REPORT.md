# Graph Report - project-management  (2026-07-09)

## Corpus Check
- 87 files · ~20,139 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 380 nodes · 969 edges · 24 communities (19 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `578f067a`
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

## God Nodes (most connected - your core abstractions)
1. `requireUser()` - 39 edges
2. `cn()` - 28 edges
3. `buttonClass()` - 24 edges
4. `DB` - 19 edges
5. `compilerOptions` - 16 edges
6. `scripts` - 13 edges
7. `createTaskOrRequest()` - 12 edges
8. `requireAdmin()` - 12 edges
9. `getAllPositions` - 12 edges
10. `formatDeadline()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `ProfilPage()` --calls--> `requireUser()`  [EXTRACTED]
  src/app/(app)/profil/page.tsx → src/lib/auth.ts
- `BottomNav()` --indirect_call--> `Home()`  [INFERRED]
  src/components/app-shell/bottom-nav.tsx → src/app/page.tsx
- `AdminPage()` --calls--> `buttonClass()`  [EXTRACTED]
  src/app/(app)/admin/page.tsx → src/components/ui/button.tsx
- `BerandaPage()` --calls--> `getInboxCounts`  [EXTRACTED]
  src/app/(app)/beranda/page.tsx → src/lib/data/inbox.ts
- `BerandaPage()` --calls--> `toJakartaWallClock()`  [EXTRACTED]
  src/app/(app)/beranda/page.tsx → src/lib/timezone.ts

## Import Cycles
- None detected.

## Communities (24 total, 5 thin omitted)

### Community 0 - "schema.ts"
Cohesion: 0.06
Nodes (58): CreateForm(), createDb(), DB, getDb(), globalForDb, Attachment, attachments, attachmentsRelations (+50 more)

### Community 1 - "dependencies"
Cohesion: 0.04
Nodes (44): dependencies, bcryptjs, clsx, date-fns, drizzle-orm, @electric-sql/pglite, jose, lucide-react (+36 more)

### Community 2 - "page.tsx"
Cohesion: 0.10
Nodes (31): RequestDetailPage(), TaskDetailPage(), RequestActions(), TaskActions(), Badge(), Card(), CardBody(), Textarea() (+23 more)

### Community 3 - "create-form.tsx"
Cohesion: 0.18
Nodes (14): AppLayout(), PantauanPage(), BottomNav(), firstName(), Header(), CurrentUser, getInboxCounts, getMonitorData() (+6 more)

### Community 4 - "auth.ts"
Cohesion: 0.13
Nodes (21): GET(), cnRow(), LainnyaPage(), ProfilPage(), MasukPage(), Home(), LoginForm(), Size (+13 more)

### Community 5 - "requireUser"
Cohesion: 0.20
Nodes (22): BerandaPage(), PermintaanPage(), PersetujuanPage(), SayaBeriPage(), TugasSayaPage(), RequestCard(), TaskCard(), buttonClass() (+14 more)

### Community 6 - "admin.ts"
Cohesion: 0.11
Nodes (26): UserCreateForm(), PasswordResetForm(), UserData, UserEditForm(), ChangePasswordForm(), PositionLite, Preview, UserLite (+18 more)

### Community 7 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "engine.test.ts"
Cohesion: 0.17
Nodes (16): AdminBaruPage(), AdminEditPage(), AdminPage(), BuatPage(), Avatar(), colorFor(), COLORS, initials() (+8 more)

### Community 9 - "page.tsx"
Cohesion: 0.36
Nodes (7): NotifikasiPage(), TYPE_STYLE, notifications, markAllReadAction(), getNotifications(), markAllNotificationsRead(), timeAgo()

### Community 10 - "layout.tsx"
Cohesion: 0.22
Nodes (8): 🧭 Arsitektur singkat, Delta Indonesia Laboratory — Manajemen Tugas, ☁️ Deploy (Supabase + Vercel), ✨ Fitur, 🚀 Menjalankan (dev lokal), 📜 Perintah, 🏢 Struktur jabatan (data asli Delta Indonesia Laboratory), 🛠️ Tech stack

### Community 11 - "layout.tsx"
Cohesion: 0.40
Nodes (3): metadata, viewport, PwaRegister()

### Community 20 - "Delta Indonesia Laboratory (DIL) — Manajemen Tugas"
Cohesion: 0.29
Nodes (6): Aturan bisnis inti (JANGAN ubah tanpa update tes), Delta Indonesia Laboratory (DIL) — Manajemen Tugas, Konvensi, Perintah penting, Stack, Verifikasi

## Knowledge Gaps
- **124 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requireUser()` connect `requireUser` to `schema.ts`, `page.tsx`, `create-form.tsx`, `auth.ts`, `admin.ts`, `engine.test.ts`, `page.tsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `cn()` connect `page.tsx` to `schema.ts`, `create-form.tsx`, `requireUser`, `admin.ts`, `engine.test.ts`, `page.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `buttonClass()` connect `requireUser` to `schema.ts`, `page.tsx`, `auth.ts`, `admin.ts`, `engine.test.ts`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _124 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05824561403508772 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10404040404040404 - nodes in this community are weakly interconnected._