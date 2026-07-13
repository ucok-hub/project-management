# Desain: Tombol Kembali ke View Sebelumnya (Fitur 2/5)

Status: disetujui, siap dibuatkan implementation plan.
Bergantung pada: [Fitur 1 — Nav Highlighting](2026-07-14-nav-highlighting-design.md)
(memakai navigation-tracker & `resolveTaskDefaultSection` yang sama).

## Masalah

`src/components/ui/back-link.tsx` bukan tombol "kembali" sungguhan — ia `<Link>`
biasa ke href yang dihitung dari business logic (misal role user), bukan ke
tempat asal navigasi user yang sebenarnya. Dipakai di 3 tempat:

- `tugas/[id]/page.tsx:51` → selalu ke `/saya-beri` atau `/tugas-saya` (role-based),
  tidak pernah ke Perlu Persetujuan/Pantauan/Beranda walau user datang dari sana.
- `permintaan/[id]/page.tsx:56` → selalu ke `/permintaan`.
- `admin/[id]/page.tsx:22` → selalu ke `/admin`.

Tiga halaman non-hub lain — `/admin/baru`, `/notifikasi`, `/buat` — bahkan
tidak punya tombol kembali sama sekali.

## Solusi

### Posisi: terintegrasi ke Header sticky

`src/components/app-shell/header.tsx` sudah sticky & tampil di semua halaman
(desktop dan mobile, satu komponen yang sama). Pada halaman non-hub, area teks
"Halo, {nama}" diganti tombol back (chevron) + judul halaman singkat:

| Halaman | Judul saat back aktif |
|---|---|
| `/tugas/[id]` | "Detail Tugas" |
| `/permintaan/[id]` | "Detail Permintaan" |
| `/admin/[id]` | "Kelola Pengguna" |
| `/admin/baru` | "Tambah Pengguna" |
| `/notifikasi` | "Notifikasi" |
| `/buat` | "Buat Tugas" |

Header perlu menerima prop opsional (mis. `backTo` / `pageTitle`) dari tiap
page server component; search & bell & avatar di sisi kanan tidak berubah.

### Cakupan halaman

Semua halaman yang bukan item sidebar/bottom-nav mendapat tombol back:
`/tugas/[id]`, `/permintaan/[id]`, `/admin/[id]`, `/admin/baru`, `/notifikasi`,
`/buat`.

### Mekanisme "kembali persis sebelumnya"

Klik tombol:
1. Kalau ada navigasi dalam-app sebelumnya di tab ini → `router.back()`
   (memakai history asli browser — otomatis mengembalikan scroll position &
   state komponen berkat router cache Next.js, termasuk mis. toggle
   Aktif/Selesai di daftar tugas).
2. Kalau tidak ada (halaman ini dibuka sebagai halaman pertama di tab — deep
   link dari notifikasi, share link, buka tab baru) → fallback ke href statis
   per halaman:
   - `/permintaan/[id]` → `/permintaan`
   - `/admin/[id]`, `/admin/baru` → `/admin`
   - `/notifikasi`, `/buat` → `/beranda`
   - `/tugas/[id]` → `resolveTaskDefaultSection(user, task)` (util yang sama
     dari Fitur 1)

Deteksi "ada navigasi dalam-app sebelumnya" memakai penanda kecil (counter)
yang ditulis oleh navigation-tracker yang sama dengan Fitur 1 — bertambah
setiap kali `usePathname()` berubah dalam sesi tab ini. Kalau counter masih 0
saat tombol diklik, berarti ini halaman pertama di tab → pakai fallback.

## Cakupan Perubahan

- `src/components/app-shell/header.tsx` — terima prop back-button opsional,
  render chevron+judul menggantikan greeting saat prop tsb ada.
- `src/app/(app)/layout.tsx` atau tiap page — kirim prop back-button ke Header
  sesuai halaman (perlu pola: page tahu dirinya non-hub, kirim title+fallback
  href).
- 6 halaman non-hub di atas — hapus `BackLink` inline lama, pasang lewat
  Header; tambahkan tombol baru di 3 halaman yang belum punya (`/admin/baru`,
  `/notifikasi`, `/buat`).
- Navigation-tracker dari Fitur 1 diperluas: tambah counter navigasi (bukan
  cuma cookie last-section).
- `src/components/ui/back-link.tsx` — kemungkinan besar dihapus setelah semua
  pemakaiannya dipindah ke Header (dicek ulang saat implementasi, tidak
  dihapus preventif kalau ternyata masih relevan di tempat lain).

## Di Luar Cakupan

- Tidak mengubah isi/urutan sidebar atau bottom-nav.
- Tidak menambah breadcrumb multi-level (cukup satu tombol back per halaman).
