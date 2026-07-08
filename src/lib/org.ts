/**
 * Definisi statis hierarki jabatan MediaLab.
 * Dipakai untuk seeding database dan sebagai acuan struktur.
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
  { id: "manager_teknis", name: "Manager Teknis", parentId: "dir_ops", division: "operasional", sort: 4 },
  { id: "spv_sampling", name: "SPV Sampling", parentId: "manager_teknis", division: "operasional", sort: 5 },
  { id: "spv_analis", name: "SPV Analis", parentId: "manager_teknis", division: "operasional", sort: 6 },
  { id: "staff_sampling", name: "Staff Sampling", parentId: "spv_sampling", division: "operasional", sort: 7 },
  { id: "staff_analis", name: "Staff Analis", parentId: "spv_analis", division: "operasional", sort: 8 },
  { id: "manager_mutu", name: "Manager Mutu", parentId: "dir_mm", division: "marketing_mutu", sort: 9 },
  { id: "konsultan", name: "Konsultan", parentId: "manager_mutu", division: "marketing_mutu", sort: 10 },
  { id: "admin_mutu", name: "Admin Mutu", parentId: "manager_mutu", division: "marketing_mutu", sort: 11 },
  { id: "manager_marketing", name: "Manager Marketing", parentId: "dir_mm", division: "marketing_mutu", sort: 12 },
  { id: "sales", name: "Sales", parentId: "manager_marketing", division: "marketing_mutu", sort: 13 },
];

/** Data user placeholder (nama fiktif) — 15 orang, ada posisi berisi lebih dari 1 orang. */
export type SeedUser = {
  username: string;
  name: string;
  positionId: string;
  isAdmin?: boolean;
};

export const SEED_USERS: SeedUser[] = [
  { username: "bagus", name: "Pak Bagus", positionId: "dirut", isAdmin: true },
  { username: "doni", name: "Pak Doni", positionId: "dir_ops" },
  { username: "rina", name: "Bu Rina", positionId: "dir_mm" },
  { username: "hendra", name: "Pak Hendra", positionId: "manager_teknis" },
  { username: "joko", name: "Pak Joko", positionId: "spv_sampling" },
  { username: "wati", name: "Bu Wati", positionId: "spv_analis" },
  { username: "rudi", name: "Rudi", positionId: "staff_sampling" },
  { username: "agus", name: "Agus", positionId: "staff_sampling" },
  { username: "sari", name: "Sari", positionId: "staff_analis" },
  { username: "dewi", name: "Dewi", positionId: "staff_analis" },
  { username: "lina", name: "Bu Lina", positionId: "manager_mutu" },
  { username: "eko", name: "Pak Eko", positionId: "konsultan" },
  { username: "maya", name: "Bu Maya", positionId: "admin_mutu", isAdmin: true },
  { username: "tono", name: "Pak Tono", positionId: "manager_marketing" },
  { username: "bayu", name: "Pak Bayu", positionId: "sales" },
];

/** Password default semua akun seed (untuk demo). Admin dapat menggantinya. */
export const DEFAULT_PASSWORD = "12345";
