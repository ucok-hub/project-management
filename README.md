# Delta Indonesia Laboratory — Manajemen Tugas

Aplikasi manajemen tugas internal untuk Delta Indonesia Laboratory (DIL), lab pengujian lingkungan.
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

## 🏢 Struktur jabatan (data asli Delta Indonesia Laboratory)

```
Direktur Utama (Joko Baroto)
├── HRGA · Finance & Accounting              [gabungan peran "Manager Administrasi"]
├── Direktur Operasional
│   └── Manager Teknis
│       ├── Penyelia Sampling ── Petugas Sampling (2 orang)
│       ├── Penyelia Lab      ── Analis (2 orang)
│       ├── Purchasing
│       └── Tenaga Ahli Elektrical & Sensor
└── Direktur Marketing & Mutu
    ├── Manager Mutu ── Konsultan, Admin Mutu
    └── Manager Marketing ── Admin Sales
```

> Catatan: "Manager Administrasi" pada struktur asli dijabat orang yang sama dengan Direktur
> Utama — karena sistem ini satu akun = satu jabatan, HRGA & Finance ditempatkan langsung di
> bawah Direktur Utama (efeknya sama).

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

Semua jam ditampilkan sebagai **WIB (Asia/Jakarta, UTC+7)** apa pun zona waktu server
(lihat `src/lib/timezone.ts`) — penting karena Vercel menjalankan fungsi di UTC.

Fungsi Vercel di-set jalan di region **`bom1` (Mumbai)** — sedekat mungkin dengan database
Supabase — supaya tiap query DB tidak menempuh latensi lintas benua (lihat `vercel.json` dan
`export const preferredRegion` di `src/app/layout.tsx`).

---

## 🚀 Menjalankan (dev lokal)

```bash
npm install
npm run db:setup     # buat tabel + isi data contoh (19 personil asli)
npm run dev          # buka http://localhost:3000
```

**Akun contoh** (password semua: `12345`, ganti sebelum dipakai sungguhan):

| Username | Peran |
|---|---|
| `joko` | Direktur Utama (admin) |
| `nidia` | Manager Teknis |
| `hasan` | Penyelia Sampling |
| `gita` | Penyelia Lab |
| `petugas1` | Petugas Sampling |
| `akilah` | Admin Mutu (admin) |

Daftar lengkap 19 personil ada di `src/lib/org.ts`.

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
