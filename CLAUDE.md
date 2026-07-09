@AGENTS.md

# Delta Indonesia Laboratory (DIL) — Manajemen Tugas

Aplikasi tugas internal DIL, lab pengujian lingkungan (±18 orang). Sangat sederhana untuk pengguna
literasi digital rendah. Bahasa Indonesia, mobile-first (PWA). Lihat `README.md` untuk gambaran lengkap.

## Stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Drizzle ORM.
DB: PGlite lokal (folder `.data/pglite`) bila `DATABASE_URL` kosong; Postgres/Supabase bila diisi.
Auth: username+password, sesi JWT (`jose`) di cookie `sesi`, hash `bcryptjs`. Bukan Supabase Auth.
Hosting: Vercel region `bom1` (Mumbai) — sengaja co-located dengan Supabase untuk latensi rendah;
jangan pindahkan region tanpa memindahkan DB juga. Semua jam ditampilkan WIB via `src/lib/timezone.ts`
(server berjalan di UTC — JANGAN pakai `new Date()`/`date-fns` mentah untuk perbandingan "hari ini").

## Aturan bisnis inti (JANGAN ubah tanpa update tes)
- `src/lib/permissions.ts` — hierarki jabatan & aturan "+1" (fungsi murni).
  - Ke bawahan = tugas **langsung**; selain itu = **permintaan**.
  - ACC permintaan: ke atas → cukup yang diminta; lainnya → atasan langsung peminta +
    atasan langsung yang diminta + yang diminta (TIDAK naik ke Dirut kecuali memang atasan langsung).
- `src/lib/core/engine.ts` — `createAssignment` & `decideRequestCore` (buat tugas/permintaan,
  resolusi ACC → auto-buat tugas). Menerima `db` sebagai argumen agar bisa diuji.
- Tes: `npm test` (unit `permissions.test.ts` + integrasi `core/engine.test.ts` pakai PGlite in-memory).

## Konvensi
- Server actions di `src/lib/actions/*`, query baca di `src/lib/data/*`.
- Halaman terproteksi di grup `src/app/(app)/` — panggil `requireUser()` / `requireAdmin()`.
- `db` (`src/db/index.ts`) adalah proxy **lazy** — koneksi dibuka saat dipakai, bukan saat import.
- Impor pakai alias `@/...` di kode Next; skrip yang dijalankan `tsx`/`node --test` pakai path relatif
  (tsx tidak resolve alias).

## Perintah penting
`npm run dev` · `npm run db:setup` · `npm test` · `npm run typecheck` · `npm run build` · `npm run e2e`

## Verifikasi
Setelah perubahan pada aturan/alur: jalankan `npm test`. Untuk alur UI, `npm run e2e`
(butuh dev server jalan; memakai Microsoft Edge via `channel: "msedge"`, tanpa unduh Chromium).
