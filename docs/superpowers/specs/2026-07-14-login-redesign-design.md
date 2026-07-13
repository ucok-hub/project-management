# Desain: Redesign Halaman Login — Background Carousel Skeleton (Fitur 5/5)

Status: disetujui, siap dibuatkan implementation plan.

## Masalah

Halaman login (`src/app/masuk/page.tsx` + `src/components/login-form.tsx`)
saat ini polos: gradient `from-teal-50 to-slate-100` + kartu putih di tengah.
Inspirasi dari Jira (screenshot user): ada background full-screen berisi
carousel 3 baris konten skeleton-loading yang bergerak otomatis, memberi
kesan halaman "hidup" di belakang form login tanpa mengganggu fokus mengisi
kredensial.

## Solusi

### Struktur

Kartu form login tetap seperti sekarang (posisi tengah, rounded-3xl, putih),
solid/dengan backdrop supaya teks form tetap terbaca jelas apa pun yang
bergerak di belakangnya. Di baliknya (fixed, full-screen, di belakang
z-index kartu), 3 baris carousel skeleton mengisi seluruh layar.

### Animasi

- Baris 1 & 3 bergerak kiri→kanan, baris 2 kanan→kiri.
- Infinite loop mulus: tiap baris me-render isinya dua kali berurutan,
  digeser pakai `@keyframes` CSS (`transform: translateX`) dari `0%` ke
  `-50%` lalu mengulang — teknik marquee standar, tanpa jeda/lompatan.
- Murni CSS transform, GPU-accelerated, **tidak pakai library animasi**
  (framer-motion dll). Ini menjawab kekhawatiran performa yang dibahas di
  Fitur 3: tidak ada JS yang jalan tiap frame, beban minimal.
- Tailwind v4 tidak punya file config untuk extend keyframes, jadi
  `@keyframes` ditambah langsung di `src/app/globals.css` (satu-satunya
  tempat custom CSS di project ini saat ini).
- Hormati `prefers-reduced-motion`: kalau di-set di OS user, animasi
  dihentikan/kartu skeleton statis diam.

### Isi kartu skeleton

Bentuk abstrak ala komponen app ini — bar judul, badge status bulat,
lingkaran avatar placeholder — extend pola `Bar` yang sudah dipakai di
`src/app/(app)/loading.tsx`. **Tidak ada teks atau data asli sama sekali**
(mengikuti referensi Jira: skeleton abu-abu polos, bukan teks buram/blur).
Beberapa varian bentuk kartu (mis. 4-5 template berbeda: kartu tugas, tile
kanban, baris tabel, tile dashboard) diulang/disusun mengisi tiap baris
supaya tidak terasa monoton.

### Opacity & keterbacaan

Carousel dibuat opacity rendah (±30-40%) supaya jadi tekstur latar yang
catchy tapi tidak mengalihkan perhatian dari form. Kartu login di atasnya
tetap solid (atau backdrop-blur) supaya kontras & teks form tetap jelas.

### Mobile

Carousel tetap tampil (bukan disembunyikan) tapi ukuran kartu skeleton
dibuat lebih kecil/ramping menyesuaikan lebar layar sempit, supaya tetap
proporsional dan tidak terasa sesak.

## Cakupan Perubahan

- `src/app/masuk/page.tsx` — restrukturisasi jadi form di atas background
  carousel (bukan sekadar gradient polos).
- `src/app/globals.css` — tambah `@keyframes` marquee kiri-kanan & kanan-kiri.
- Komponen baru (client, karena perlu render 3 baris + duplikasi konten)
  untuk carousel + beberapa varian template kartu skeleton.
- `src/components/login-form.tsx` — tidak berubah secara fungsional, hanya
  kemungkinan penyesuaian container agar tampil solid di atas background
  baru.

## Di Luar Cakupan

- Tidak mengubah logic `loginAction`/autentikasi.
- Tidak menambah konten/teks asli di skeleton (murni dekoratif abstrak).
- Tidak menyentuh halaman lain selain `/masuk`.
