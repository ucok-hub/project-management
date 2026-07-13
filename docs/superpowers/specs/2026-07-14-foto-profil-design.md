# Desain: Foto Profil (Upload, Crop, Kompresi, Hapus) (Fitur 3/5)

Status: disetujui, siap dibuatkan implementation plan.

## Masalah

Tidak ada cara bagi user untuk menambahkan foto profil. `users` table tidak
punya kolom foto, `Avatar` component (`src/components/ui/avatar.tsx`) hanya
bisa menampilkan bubble inisial berwarna, dan tidak ada storage/library
upload apa pun yang terpasang di project ini (green-field).

## Solusi

### Flow upload

1. Di halaman Profil (`src/app/(app)/profil/page.tsx`), tombol "Ubah Foto"
   menampilkan dua opsi:
   - **Ambil Foto** — `<input type="file" accept="image/*" capture="user">`.
     Di mobile ini membuka kamera native OS. Di desktop, browser tidak
     punya konsep "kamera native" lewat file input, jadi otomatis berubah
     jadi file picker biasa — **tidak ada live webcam capture (getUserMedia)
     yang dibangun**, disengaja untuk membatasi kompleksitas karena jarang
     dipakai di app internal 18 orang.
   - **Pilih dari Galeri** — `<input type="file" accept="image/*">` biasa,
     berlaku sama di kedua platform.
2. Setelah file dipilih, validasi ringan (guard, bukan target normal):
   harus `image/*`, maksimal 20MB mentah sebelum diproses. Kalau browser
   gagal decode file (mis. format HEIC yang tidak didukung), tampilkan
   pesan error — tidak membangun transcoding HEIC sisi server/WASM.
3. Buka **editor crop** memakai library `react-easy-crop` (~12kb, dipilih
   drpd. custom-build karena sudah teruji untuk gesture drag+pinch-zoom+
   rotate di banyak app avatar-upload):
   - Drag untuk reposisi, pinch/scroll untuk zoom.
   - Slider rotasi bebas (koreksi kemiringan halus) + tombol putar 90°
     kiri/kanan cepat (kasus umum: foto HP kepotret miring 90°/180°).
   - Mask lingkaran sebagai preview bentuk avatar akhir.
4. Klik **"Terapkan"** → crop di-render ke `<canvas>` persegi 256×256px
   (cukup tajam untuk ukuran avatar terbesar di app ini yang hanya ~48-96px,
   termasuk retina), lalu di-encode ke JPEG kualitas ~0.82 lewat
   `canvas.toBlob` (hasil tipikal 15-40KB). **Kompresi baru dieksekusi di
   titik ini** — bukan saat memilih file, bukan berulang di server.
5. Blob hasil kompresi di-upload lewat server action.

### Storage: Vercel Blob (prod) / disk lokal (dev)

Dipilih otomatis berdasarkan kondisi yang sama dengan pola DB
(`DATABASE_URL` kosong = lokal):

- **Prod:** `@vercel/blob` (`put()`/`del()`), env var `BLOB_READ_WRITE_TOKEN`
  otomatis dari integrasi Vercel. Dipilih drpd. Supabase Storage karena
  project ini belum pakai Supabase JS SDK sama sekali (murni koneksi
  Postgres lewat Drizzle) — Vercel Blob nol setup tambahan.
- **Dev lokal:** simpan ke folder `.data/avatars/` (mengikuti pola
  `.data/pglite` yang sudah ada), disajikan lewat API route kecil
  `GET /api/avatars/[filename]` yang membaca file dari disk dan mengirim
  dengan content-type yang benar.
- Saat upload foto baru berhasil, foto lama (kalau ada) dihapus dari
  storage — supaya tidak ada file yatim menumpuk.

### Hapus foto

Tombol "Hapus Foto" di halaman Profil (muncul hanya kalau user punya foto):
hapus objek dari storage + set `avatarUrl` jadi `null`. Kembali ke bubble
inisial seperti sekarang. Self-service saja (user hapus foto sendiri;
tidak ada override admin di scope ini).

## Perubahan Data & Komponen

- **Migrasi Drizzle:** tambah kolom `avatarUrl` (text, nullable) di `users`
  (`src/db/schema.ts`).
- **`src/components/ui/avatar.tsx`:** tambah prop opsional `src?: string`.
  Kalau ada → render `<img>` HTML biasa (bukan `next/image` — ukuran sudah
  kecil & terkompresi, tidak perlu optimasi tambahan, dan menghindari
  konfigurasi `images.remotePatterns`). Kalau tidak ada → fallback ke bubble
  inisial seperti sekarang (perilaku existing tidak berubah).
- **`src/lib/actions/avatar.ts`** (baru): `uploadAvatarAction`,
  `deleteAvatarAction`.
- **Komponen editor baru** (client component) membungkus `react-easy-crop`
  + kontrol zoom/rotate/terapkan, dipakai di halaman Profil.
- Dependency baru: `react-easy-crop`, `@vercel/blob`.

## Di Luar Cakupan

- Live webcam capture (getUserMedia) di desktop.
- Transcoding HEIC di server.
- Admin mengubah/menghapus foto user lain.
- Multiple foto/riwayat foto (hanya satu foto aktif per user).
