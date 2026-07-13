# Desain: Nav Highlighting Berbasis Section (Fitur 1/5)

Status: disetujui, siap dibuatkan implementation plan.

## Masalah

Sidebar (desktop, `src/components/app-shell/sidebar.tsx`) dan bottom nav (mobile,
`src/components/app-shell/bottom-nav.tsx`) menentukan item aktif dengan:

```ts
const active = href === "/beranda" ? pathname === href : pathname.startsWith(href);
```

Ini bekerja untuk halaman hub itu sendiri dan untuk detail route yang prefix-nya
cocok (`/permintaan/[id]` → "Papan Permintaan", `/admin/[id]` → "Kelola Pengguna").
Tapi **`/tugas/[id]` tidak punya nav item dengan href yang cocok** (nav item yang ada
hanya `/tugas-saya` dan `/saya-beri`), jadi tidak ada item sidebar/bottom-nav yang
menyala sama sekali saat user melihat detail tugas — user kehilangan orientasi ada
di bagian mana.

`/tugas/[id]` juga satu-satunya route yang benar-benar ambigu: ia bisa dibuka dari
5 hub berbeda — **Beranda**, **Tugas Saya**, **Tugas yang Saya Beri**, **Perlu
Persetujuan**, **Pantauan** (dikonfirmasi lewat grep pemakaian `TaskCard` dan link
`tugas/${id}` di `task-list.tsx`, `beranda/page.tsx`, `persetujuan/page.tsx`,
`monitor-list.tsx`). `/permintaan/[id]` dan `/admin/[id]` masing-masing hanya
punya satu hub asal, jadi logic `startsWith` yang sudah ada tetap dipertahankan
untuk keduanya — tidak diubah.

## Solusi

Highlight nav untuk `/tugas/[id]` mengikuti **hub asal navigasi yang sebenarnya**,
bukan aturan role tetap. Mekanismenya:

1. **Cookie kecil** `dil_last_section` (bukan sessionStorage/localStorage) menyimpan
   href hub terakhir yang dikunjungi user, dari daftar 5 hub yang valid untuk
   `/tugas/[id]`: `/beranda`, `/tugas-saya`, `/saya-beri`, `/persetujuan`, `/pantauan`.
   Cookie dipilih (bukan Web Storage) karena ikut terkirim di request awal, sehingga
   server (`(app)/layout.tsx`) bisa langsung membaca dan meneruskan nilai yang benar
   ke Sidebar/BottomNav pada render pertama — **tidak ada flicker** (sempat tanpa
   highlight lalu berubah setelah hydration).
2. Sebuah client component tipis (dipasang sekali di `(app)/layout.tsx`) memakai
   `usePathname()` dan menulis cookie tersebut setiap kali pathname cocok salah satu
   dari 5 hub di atas. Mengunjungi hub lain (Papan Permintaan, Kelola Pengguna,
   Profil) **tidak** mengubah cookie ini — supaya highlight `/tugas/[id]` tidak
   pernah "nyasar" ke section yang tidak relevan.
3. Resolusi highlight saat pathname adalah `/tugas/[id]`:
   - Jika cookie berisi salah satu dari 5 href valid → highlight nav item tsb.
   - Jika cookie kosong/tidak valid (deep-link baru dari notifikasi, tab baru,
     dsb.) → fallback ke logic role yang sudah dipakai tombol "Kembali" saat ini
     (`isGiver && !isAssignee ? "/saya-beri" : "/tugas-saya"`), diangkat jadi
     fungsi kecil yang bisa dipakai bersama oleh nav-resolver dan `BackLink`.
4. `/permintaan/[id]` dan `/admin/[id]` tidak disentuh — tetap pakai `startsWith`.

## Cakupan Perubahan

- `src/components/app-shell/sidebar.tsx` — ganti logic active-state untuk terima
  hasil resolusi section (bukan sekadar `pathname.startsWith`).
- `src/components/app-shell/bottom-nav.tsx` — sama, versi mobile.
- `src/app/(app)/layout.tsx` — baca cookie `dil_last_section` (server-side),
  teruskan sebagai prop; pasang client component penulis cookie.
- Util baru kecil (nama sementara `src/lib/task-section.ts`) — fungsi murni
  `resolveTaskDefaultSection(user, task)` yang diangkat dari logic role di
  `src/app/(app)/tugas/[id]/page.tsx` supaya dipakai bersama oleh fallback
  resolver dan `BackLink` yang sudah ada di halaman itu.

## Di Luar Cakupan

- Tidak mengubah perilaku `/permintaan/[id]` dan `/admin/[id]`.
- Tidak menyentuh isi tombol "Kembali" itu sendiri (itu Fitur 2, spec terpisah).
- Tidak menambah hub baru atau nav item baru.
