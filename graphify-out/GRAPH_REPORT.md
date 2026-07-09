# Graph Report - .  (2026-07-09)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 347 nodes · 912 edges · 20 communities (17 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `71e85db2`
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
10. `Avatar()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `ProfilPage()` --calls--> `requireUser()`  [EXTRACTED]
  src/app/(app)/profil/page.tsx → src/lib/auth.ts
- `BottomNav()` --indirect_call--> `Home()`  [INFERRED]
  src/components/app-shell/bottom-nav.tsx → src/app/page.tsx
- `CreateForm()` --indirect_call--> `createTaskOrRequest()`  [INFERRED]
  src/components/create-form.tsx → src/lib/actions/tasks.ts
- `AdminEditPage()` --calls--> `getUserById()`  [EXTRACTED]
  src/app/(app)/admin/[id]/page.tsx → src/lib/data/users.ts
- `AdminPage()` --calls--> `requireAdmin()`  [EXTRACTED]
  src/app/(app)/admin/page.tsx → src/lib/auth.ts

## Import Cycles
- None detected.

## Communities (20 total, 3 thin omitted)

### Community 0 - "schema.ts"
Cohesion: 0.07
Nodes (46): createDb(), DB, getDb(), globalForDb, Attachment, attachments, attachmentsRelations, Notification (+38 more)

### Community 1 - "dependencies"
Cohesion: 0.04
Nodes (44): dependencies, bcryptjs, clsx, date-fns, drizzle-orm, @electric-sql/pglite, jose, lucide-react (+36 more)

### Community 2 - "page.tsx"
Cohesion: 0.13
Nodes (23): RequestDetailPage(), TaskDetailPage(), BottomNav(), RequestCard(), TaskActions(), Avatar(), colorFor(), COLORS (+15 more)

### Community 3 - "create-form.tsx"
Cohesion: 0.11
Nodes (27): BuatPage(), PantauanPage(), CreateForm(), PositionLite, Preview, UserLite, CreateState, CurrentUser (+19 more)

### Community 4 - "auth.ts"
Cohesion: 0.11
Nodes (25): GET(), cnRow(), LainnyaPage(), ProfilPage(), MasukPage(), Home(), ChangePasswordForm(), LoginForm() (+17 more)

### Community 5 - "requireUser"
Cohesion: 0.14
Nodes (27): AdminPage(), BerandaPage(), PermintaanPage(), PersetujuanPage(), SayaBeriPage(), TugasSayaPage(), TaskCard(), Button() (+19 more)

### Community 6 - "admin.ts"
Cohesion: 0.19
Nodes (18): AdminBaruPage(), AdminEditPage(), UserCreateForm(), PasswordResetForm(), UserData, UserEditForm(), BackLink(), Field() (+10 more)

### Community 7 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "engine.test.ts"
Cohesion: 0.18
Nodes (8): TestDB, U, Division, DIVISION_LABEL, SEED_POSITIONS, SEED_USERS, SeedPosition, SeedUser

### Community 9 - "page.tsx"
Cohesion: 0.36
Nodes (7): NotifikasiPage(), TYPE_STYLE, notifications, markAllReadAction(), getNotifications(), markAllNotificationsRead(), timeAgo()

### Community 10 - "layout.tsx"
Cohesion: 0.53
Nodes (4): AppLayout(), firstName(), Header(), getInboxCounts()

### Community 11 - "layout.tsx"
Cohesion: 0.40
Nodes (3): metadata, viewport, PwaRegister()

## Knowledge Gaps
- **109 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requireUser()` connect `requireUser` to `schema.ts`, `page.tsx`, `create-form.tsx`, `auth.ts`, `admin.ts`, `page.tsx`, `layout.tsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `cn()` connect `page.tsx` to `page.tsx`, `requireUser`, `admin.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `buttonClass()` connect `requireUser` to `page.tsx`, `create-form.tsx`, `auth.ts`, `admin.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07320024198427103 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13090418353576247 - nodes in this community are weakly interconnected._