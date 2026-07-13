# Desain: Presence Online/Idle/Offline & Last Seen (Fitur 4/5)

Status: disetujui, siap dibuatkan implementation plan.
Bersinggungan dengan: [Fitur 3 — Foto Profil](2026-07-14-foto-profil-design.md)
(sama-sama menambah prop baru ke `Avatar` component).

## Masalah

Tidak ada cara mengetahui siapa yang sedang aktif memakai app. `Avatar`
component (`src/components/ui/avatar.tsx`) tidak punya konsep status, tidak
ada kolom `lastSeenAt`/`status` di `users`, dan tidak ada infra
realtime/websocket/SSE/Supabase Realtime terpasang.

## Solusi

### Mekanisme: polling ringan (bukan push-based)

Dipilih drpd. SSE/Supabase Realtime karena: SSE di Vercel serverless
punya keterbatasan durasi koneksi, dan Supabase Realtime hanya bisa jalan di
prod (Postgres asli) — tidak di dev lokal (PGlite) — yang berarti perilaku
dev vs prod akan berbeda. Polling konsisten di kedua environment tanpa kode
bercabang, dan delay maks ~30 detik antar update sudah cukup "hidup" untuk
sekadar indikator presence (bukan chat real-time).

### Data model

Tabel baru `presence`:
```
userId    -> FK users.id (PK)
lastSeenAt -> timestamp
status     -> 'online' | 'idle'   (dilaporkan client, bukan dihitung server)
```
Dipisah dari `users` supaya data yang sering berubah (tiap ~25 detik per
user aktif) tidak membebani tabel utama.

### Heartbeat (mengirim status milik sendiri)

Client component kecil terpasang **global** di `src/app/(app)/layout.tsx`:

- Kirim heartbeat (server action) tiap ~25 detik selama app terbuka, dan
  langsung saat halaman dimuat/kembali fokus (`visibilitychange`).
- Pasang listener aktivitas (`mousemove`, `keydown`, `touchstart`, `scroll`)
  dengan timer 5 menit. Tidak ada aktivitas 5 menit → status lokal berubah
  jadi `"idle"`, dikirim di heartbeat berikutnya. Ada aktivitas lagi →
  kembali `"online"` di heartbeat berikutnya.
- Saat logout eksplisit → langsung tandai offline (hapus/reset row
  presence), tidak menunggu timeout kadaluarsa.

### Resolusi status untuk ditampilkan

Dihitung saat baca, bukan disimpan sebagai enum 3-nilai:
- `lastSeenAt` lebih tua dari ~75 detik (3× interval heartbeat, toleransi
  jaringan/tab di-background) → **offline**, terlepas dari `status` yang
  tersimpan (menangani kasus tab/browser ditutup tanpa sempat logout).
- Kalau tidak (masih dalam window segar) → pakai `status` tersimpan
  (`online` atau `idle`).

### Membaca status user lain (batched, bukan per-avatar)

Satu server action/API route menerima daftar `userId` yang sedang tampil di
layar suatu halaman, mengembalikan peta `{ userId: { status, lastSeenAt } }`.
Halaman yang menampilkan avatar user lain — Pantauan (`monitor-list.tsx`),
detail Permintaan (peminta/diminta), detail Tugas (giver/assignee), Kelola
Pengguna (`admin/user-list.tsx`, `admin/[id]`) — membungkus daftar avatarnya
dengan hook client kecil yang polling endpoint ini tiap ~25 detik.

Karena `Avatar` cuma dipakai di 9 file total di seluruh codebase (semua
terdaftar di atas plus header/sidebar/profil untuk diri sendiri), menambah
prop presence ke komponen ini otomatis mencakup semua tempat yang relevan.

### Tampilan dot

Prop baru `presence?: "online" | "idle" | "offline"` di `Avatar`
(terpisah dari prop `src` yang ditambah Fitur 3). Dot diposisikan absolut
di pojok kanan-bawah bubble, ukuran ±1/3 diameter avatar, dengan ring putih
(`ring-2 ring-white` atau setara) supaya ada "potongan" jelas dari avatar di
belakangnya:

| Status | Tampilan |
|---|---|
| online | dot bulat hijau terang |
| offline | dot bulat abu-abu |
| idle | ikon bulan sabit kecil warna kuning (pakai `lucide-react`, sudah jadi dependency — tidak perlu tambah library ikon) |

### Halaman profil-view baru untuk semua user

Route baru `src/app/(app)/pengguna/[id]/page.tsx` — read-only, bisa dibuka
semua user yang login (bukan cuma admin): avatar (dengan dot presence),
nama, jabatan, teks status ("Online sekarang" / "Idle" / "Terakhir dilihat:
{tanggal WIB}" — last-seen hanya relevan & ditampilkan saat status offline).
Diakses lewat klik avatar/nama di Pantauan, Papan Permintaan, dll.

`/profil` (diri sendiri) menampilkan teks status juga — karena sedang
melihat profil sendiri, otomatis selalu "Online sekarang".

`/admin/[id]` (halaman edit user, admin-only, sudah ada) juga ditambah info
status yang sama karena admin sudah bisa melihat detail user di situ.

## Cakupan Perubahan

- Migrasi Drizzle: tabel baru `presence`.
- `src/lib/actions/presence.ts` (baru): heartbeat action + batched-read
  action.
- Client component global heartbeat, dipasang di `(app)/layout.tsx`.
- Hook client kecil untuk polling batched presence, dipakai di halaman yang
  menampilkan avatar user lain.
- `src/components/ui/avatar.tsx` — tambah prop `presence`, render dot.
- Route baru `src/app/(app)/pengguna/[id]/page.tsx`.
- `src/app/(app)/profil/page.tsx` dan `admin/[id]/page.tsx` — tambah teks
  status.
- Logout action — set presence jadi offline eksplisit.

## Di Luar Cakupan

- Push-based realtime (SSE/websocket/Supabase Realtime).
- Riwayat/log presence (hanya status & lastSeenAt terkini, tidak ada history
  timeline).
- Custom status message (mis. "Sedang rapat") — hanya 3 status tetap
  (online/idle/offline).
