import type { LucideIcon } from "lucide-react";
import {
  Home,
  ClipboardList,
  Plus,
  BadgeCheck,
  Send,
  Inbox,
  BarChart3,
  Users,
  User,
  Bell,
  Megaphone,
} from "lucide-react";

export type SearchDestination = {
  href: string;
  label: string;
  keywords: string[];
  icon: LucideIcon;
  requires?: "monitor" | "admin";
};

/** Semua tujuan yang bisa dicari lewat Pencarian Fitur. */
export const SEARCH_DESTINATIONS: SearchDestination[] = [
  { href: "/beranda", label: "Beranda", keywords: ["home", "dashboard", "awal", "utama"], icon: Home },
  { href: "/tugas-saya", label: "Tugas Saya", keywords: ["task", "pekerjaan", "aktif"], icon: ClipboardList },
  {
    href: "/buat",
    label: "Buat Tugas",
    keywords: ["baru", "tambah", "create", "tugaskan", "kasih tugas", "permintaan baru"],
    icon: Plus,
  },
  {
    href: "/persetujuan",
    label: "Perlu Persetujuan",
    keywords: ["acc", "setujui", "approve", "konfirmasi", "setuju"],
    icon: BadgeCheck,
  },
  {
    href: "/saya-beri",
    label: "Tugas yang Saya Beri",
    keywords: ["diberikan", "assign", "ditugaskan"],
    icon: Send,
  },
  { href: "/permintaan", label: "Papan Permintaan", keywords: ["request", "minta", "permintaan"], icon: Inbox },
  {
    href: "/pantauan",
    label: "Pantauan",
    keywords: ["overview", "laporan", "monitor", "eksekutif", "tim"],
    icon: BarChart3,
    requires: "monitor",
  },
  {
    href: "/admin",
    label: "Kelola Pengguna",
    keywords: ["user", "akun", "pegawai", "karyawan", "admin", "tambah orang"],
    icon: Users,
    requires: "admin",
  },
  { href: "/notifikasi", label: "Notifikasi", keywords: ["lonceng", "pemberitahuan", "bell"], icon: Bell },
  {
    href: "/pembaruan",
    label: "Pembaruan",
    keywords: ["changelog", "update", "riwayat", "versi", "what's new"],
    icon: Megaphone,
  },
  {
    href: "/profil",
    label: "Profil & Password",
    keywords: ["akun saya", "ganti password", "settings", "pengaturan", "keluar", "logout"],
    icon: User,
  },
];

export function searchDestinations(
  query: string,
  { canMonitor, isAdmin }: { canMonitor: boolean; isAdmin: boolean },
): SearchDestination[] {
  const allowed = SEARCH_DESTINATIONS.filter((d) => {
    if (d.requires === "monitor") return canMonitor;
    if (d.requires === "admin") return isAdmin;
    return true;
  });

  const q = query.trim().toLowerCase();
  if (!q) return allowed;

  return allowed.filter(
    (d) =>
      d.label.toLowerCase().includes(q) || d.keywords.some((k) => k.toLowerCase().includes(q)),
  );
}
