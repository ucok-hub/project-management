# MediaLab — Manajemen Tugas

Aplikasi manajemen tugas internal untuk perusahaan lab pengujian lingkungan (±15 orang).
Rasa "Jira" tapi **dipangkas habis** agar sangat mudah dipakai. Web + ramah HP (PWA), Bahasa Indonesia.

---

## ✨ Fitur

- **Tugas sederhana** — status cuma 4: 🔴 Belum · 🟡 Dikerjakan · ⏳ Menunggu ACC · 🟢 Selesai.
- **Aturan penugasan otomatis ("+1")** — sistem menentukan sendiri saat Anda memilih orang:
  - Memberi tugas ke **bawahan** → langsung jadi **Tugas**.
  - Ke **sejajar / atasan / lintas divisi** → jadi **Permintaan** yang harus disetujui dulu.
- **Persetujuan selesai** — pelaksana klik "Selesai", lalu **pemberi tugas** yang menyetujui.
- **Papan Permintaan** — transparan, semua orang bisa melihat siapa minta apa ke siapa.
- **ACC ganda untuk Permintaan** — sesuai aturan: atasan langsung peminta + atasan langsung
  yang diminta + yang diminta (tidak naik sampai Dirut kecuali memang atasan langsung).
- **Notifikasi lonceng** dalam aplikasi.
- **Pantauan (Executive Overview)** — Dirut melihat seluruh perusahaan; atasan lain melihat timnya.
- **Panel Admin** — kelola pengguna, jabatan, reset password.

## 🏢 Struktur jabatan (seed placeholder)

```
Direktur Utama
├── Direktur Operasional
│   └── Manager Teknis
│       ├── SPV Sampling ── Staff Sampling
│       └── SPV Analis   ── Staff Analis
└── Direktur Marketing & Mutu
    ├── Manager Mutu ── Konsultan, Admin Mutu
    └── Manager Marketing ── Sales
```

---

## 🛠️ Tech stack

| Bagian | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (komponen buatan sendiri, ringan) |
| Database | Drizzle ORM · **PGlite** (lokal, in-process) → **Supabase Postgres** (produksi) |
| Auth | Username + password (dibuat admin), sesi JWT (`jose`) di cookie, hash `bcryptjs` |
| PWA | Manifest + service worker (installable di HP) |

Koneksi DB otomatis: bila `DATABASE_URL` diisi → pakai Postgres/Supabase; bila kosong → PGlite lokal.

---

## 🚀 Menjalankan (dev lokal)

```bash
npm install
npm run db:setup     # buat tabel + isi data contoh (15 user placeholder)
npm run dev          # buka http://localhost:3000
```

**Akun demo** (password semua: `12345`):

| Username | Peran |
|---|---|
| `bagus` | Direktur Utama (admin) |
| `hendra` | Manager Teknis |
| `joko` | SPV Sampling |
| `rudi` | Staff Sampling |
| `wati` | SPV Analis |
| `maya` | Admin Mutu (admin) |

> Saat pengembangan Anda juga bisa berpindah peran cepat via `/api/dev/login/<username>`
> (otomatis dinonaktifkan di produksi).

---

## 📜 Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan dev server |
| `npm run build` / `npm start` | Build & jalankan produksi |
| `npm run db:generate` | Generate migrasi SQL dari skema |
| `npm run db:migrate` | Terapkan migrasi |
| `npm run db:seed` | Isi data contoh |
| `npm run db:setup` | migrate + seed |
| `npm run db:reset` | Hapus DB lokal lalu setup ulang |
| `npm test` | Tes unit (aturan izin) + integrasi (engine) |
| `npm run e2e` | Tes end-to-end di browser (butuh dev server jalan) |
| `npm run typecheck` | Cek tipe TypeScript |

---

## ☁️ Deploy (Supabase + Vercel)

1. Buat project **Supabase** gratis → salin connection string Postgres.
2. Di **Vercel**, import repo ini, set environment variables:
   - `DATABASE_URL` = connection string Supabase
   - `AUTH_SECRET` = string acak panjang (≥ 32 karakter)
3. Jalankan migrasi ke DB Supabase (sekali):
   ```bash
   DATABASE_URL="postgres://…"  npm run db:migrate
   DATABASE_URL="postgres://…"  npm run db:seed     # opsional: data awal
   ```
4. Deploy. `next start`/Vercel otomatis memakai `NODE_ENV=production` (login-dev nonaktif).

---

## 🧭 Arsitektur singkat

```
src/
├── app/
│   ├── masuk/                  # login
│   ├── (app)/                  # halaman terproteksi (nav bawah + header)
│   │   ├── beranda, tugas-saya, saya-beri, buat, tugas/[id]
│   │   ├── permintaan, permintaan/[id], persetujuan
│   │   ├── notifikasi, lainnya, profil, pantauan, admin
│   └── api/dev/login/[username]   # login cepat dev-only
├── db/            # skema Drizzle, koneksi, migrasi, seed
├── lib/
│   ├── permissions.ts   # aturan hierarki "+1" (murni, teruji)
│   ├── core/engine.ts   # buat penugasan & resolusi ACC (teruji integrasi)
│   ├── auth.ts, roles.ts, notify.ts, format.ts
│   ├── actions/         # server actions (tugas, permintaan, admin, dll)
│   └── data/            # query baca
└── components/    # UI (ringan, buatan sendiri)
```

Inti aturan bisnis (`permissions.ts` + `core/engine.ts`) dipisah sebagai fungsi murni dan
diuji otomatis (`npm test`), termasuk skenario staff→sales tanpa naik ke Dirut dan alur ACC ganda.
