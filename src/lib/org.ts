/**
 * Definisi statis hierarki jabatan Delta Indonesia Laboratory (DIL).
 * Dipakai untuk seeding database dan sebagai acuan struktur.
 *
 * Catatan: "Manager Administrasi" pada struktur organisasi asli dijabat oleh
 * orang yang sama dengan Direktur Utama (Joko Baroto). Karena sistem ini
 * mengikat satu akun ke satu jabatan, HRGA & Finance/Accounting ditempatkan
 * langsung di bawah Direktur Utama (efeknya sama — beliau yang membawahi).
 */

export type Division = "eksekutif" | "operasional" | "marketing_mutu";

export type SeedPosition = {
  id: string;
  name: string;
  parentId: string | null;
  division: Division;
  sort: number;
};

export const DIVISION_LABEL: Record<Division, string> = {
  eksekutif: "Eksekutif",
  operasional: "Operasional",
  marketing_mutu: "Marketing & Mutu",
};

export const SEED_POSITIONS: SeedPosition[] = [
  { id: "dirut", name: "Direktur Utama", parentId: null, division: "eksekutif", sort: 1 },
  { id: "dir_ops", name: "Direktur Operasional", parentId: "dirut", division: "operasional", sort: 2 },
  { id: "dir_mm", name: "Direktur Marketing & Mutu", parentId: "dirut", division: "marketing_mutu", sort: 3 },
  { id: "hrga", name: "HRGA", parentId: "dirut", division: "eksekutif", sort: 4 },
  { id: "finance", name: "Finance & Accounting", parentId: "dirut", division: "eksekutif", sort: 5 },

  { id: "manager_teknis", name: "Manager Teknis", parentId: "dir_ops", division: "operasional", sort: 6 },
  { id: "spv_sampling", name: "Penyelia Sampling", parentId: "manager_teknis", division: "operasional", sort: 7 },
  { id: "spv_analis", name: "Penyelia Lab", parentId: "manager_teknis", division: "operasional", sort: 8 },
  { id: "purchasing", name: "Purchasing", parentId: "manager_teknis", division: "operasional", sort: 9 },
  { id: "staff_sampling", name: "Petugas Sampling", parentId: "spv_sampling", division: "operasional", sort: 11 },
  { id: "staff_analis", name: "Analis", parentId: "spv_analis", division: "operasional", sort: 12 },

  { id: "manager_mutu", name: "Manager Mutu", parentId: "dir_mm", division: "marketing_mutu", sort: 13 },
  { id: "konsultan", name: "Konsultan", parentId: "manager_mutu", division: "marketing_mutu", sort: 14 },
  { id: "admin_mutu", name: "Admin Mutu", parentId: "manager_mutu", division: "marketing_mutu", sort: 15 },
  { id: "manager_marketing", name: "Manager Marketing", parentId: "dir_mm", division: "marketing_mutu", sort: 16 },
  { id: "sales", name: "Admin Sales", parentId: "manager_marketing", division: "marketing_mutu", sort: 17 },
];

export type SeedUser = {
  username: string;
  name: string;
  positionId: string;
  isAdmin?: boolean;
};

/** Personil asli Delta Indonesia Laboratory (dari struktur organisasi resmi). */
export const SEED_USERS: SeedUser[] = [
  { username: "joko", name: "Joko Baroto", positionId: "dirut", isAdmin: true },
  { username: "untung", name: "Untung Suprihadi", positionId: "dir_mm" },
  { username: "nanda", name: "Muhammad Nanda Rizky", positionId: "dir_ops" },
  { username: "hafidz", name: "Muhammad Hafidz", positionId: "hrga" },
  { username: "agus", name: "Agus Susila", positionId: "finance" },

  { username: "nidia", name: "Nidia Hendra Utami", positionId: "manager_teknis" },
  { username: "hasan", name: "M Hasan Ismail", positionId: "spv_sampling" },
  { username: "gita", name: "Gita Putri Ariana", positionId: "spv_analis" },
  { username: "ludfi", name: "Ludfi Rahmad I", positionId: "purchasing" },
  // PDF hanya menulis "2 Orang" tanpa nama — beri placeholder angka, ganti via panel Admin.
  { username: "petugas1", name: "Petugas Sampling 1", positionId: "staff_sampling" },
  { username: "petugas2", name: "Petugas Sampling 2", positionId: "staff_sampling" },
  { username: "analis1", name: "Analis 1", positionId: "staff_analis" },
  { username: "analis2", name: "Analis 2", positionId: "staff_analis" },

  { username: "novita", name: "Novita Putridiana", positionId: "manager_mutu" },
  { username: "nimal", name: "Ni'Mal Fatah T", positionId: "konsultan" },
  { username: "akilah", name: "Akilah Zahra H", positionId: "admin_mutu", isAdmin: true },
  { username: "topan", name: "Topan Dwi Putra", positionId: "manager_marketing" },
  { username: "kartika", name: "Kartika Diah Ayunda", positionId: "sales" },
];

/** Password default semua akun seed (untuk demo). Admin dapat menggantinya. */
export const DEFAULT_PASSWORD = "12345";
