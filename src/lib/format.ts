import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
  toJakartaWallClock,
  isTodayJakarta,
  isTomorrowJakarta,
  isYesterdayJakarta,
  isThisYearJakarta,
} from "@/lib/timezone";

export type TaskStatus = "belum" | "dikerjakan" | "menunggu_acc" | "selesai";

export const TASK_STATUS: Record<
  TaskStatus,
  { label: string; short: string; emoji: string; badge: string; dot: string }
> = {
  belum: {
    label: "Belum dikerjakan",
    short: "Belum",
    emoji: "🔴",
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  dikerjakan: {
    label: "Sedang dikerjakan",
    short: "Dikerjakan",
    emoji: "🟡",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  menunggu_acc: {
    label: "Menunggu persetujuan",
    short: "Menunggu ACC",
    emoji: "⏳",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  selesai: {
    label: "Selesai",
    short: "Selesai",
    emoji: "🟢",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

export type RequestStatus = "menunggu" | "disetujui" | "ditolak" | "dibatalkan";

export const REQUEST_STATUS: Record<RequestStatus, { label: string; badge: string }> = {
  menunggu: { label: "Menunggu persetujuan", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  disetujui: { label: "Disetujui", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ditolak: { label: "Ditolak", badge: "bg-red-50 text-red-700 border-red-200" },
  dibatalkan: { label: "Dibatalkan", badge: "bg-slate-100 text-slate-600 border-slate-200" },
};

/** Tanggal + jam batas waktu dalam bahasa manusia (selalu menurut WIB, presisi jam). */
export function formatDeadline(date: Date | null | undefined): string {
  if (!date) return "Tanpa batas waktu";
  const jam = format(toJakartaWallClock(date), "HH:mm", { locale: id });
  if (isTodayJakarta(date)) return `Hari ini, ${jam}`;
  if (isTomorrowJakarta(date)) return `Besok, ${jam}`;
  if (isYesterdayJakarta(date)) return `Kemarin, ${jam}`;
  const tgl = format(
    toJakartaWallClock(date),
    isThisYearJakarta(date) ? "EEE, d MMM" : "d MMM yyyy",
    { locale: id },
  );
  return `${tgl}, ${jam}`;
}

/**
 * Apakah tugas melewati batas waktu (dan belum selesai)? Presisi ke menit —
 * begitu jam deadline lewat, langsung dianggap lewat waktu (tidak ada
 * keringanan sampai akhir hari).
 */
export function isOverdue(date: Date | null | undefined, status: TaskStatus): boolean {
  if (!date || status === "selesai") return false;
  return date.getTime() < Date.now();
}

export function formatDateTime(date: Date): string {
  return format(toJakartaWallClock(date), "d MMM yyyy, HH:mm", { locale: id }) + " WIB";
}

export function formatDateInput(date: Date | null | undefined): string {
  if (!date) return "";
  return format(toJakartaWallClock(date), "yyyy-MM-dd");
}

export function timeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: id });
}
