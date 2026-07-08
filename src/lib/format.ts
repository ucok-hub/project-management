import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isThisYear,
  formatDistanceToNow,
} from "date-fns";
import { id } from "date-fns/locale";

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

/** Tanggal batas waktu dalam bahasa manusia. */
export function formatDeadline(date: Date | null | undefined): string {
  if (!date) return "Tanpa batas waktu";
  if (isToday(date)) return "Hari ini";
  if (isTomorrow(date)) return "Besok";
  if (isYesterday(date)) return "Kemarin";
  return format(date, isThisYear(date) ? "EEE, d MMM" : "d MMM yyyy", { locale: id });
}

/** Apakah tugas melewati batas waktu (dan belum selesai)? */
export function isOverdue(date: Date | null | undefined, status: TaskStatus): boolean {
  if (!date || status === "selesai") return false;
  return isPast(date) && !isToday(date);
}

export function formatDateTime(date: Date): string {
  return format(date, "d MMM yyyy, HH:mm", { locale: id });
}

export function formatDateInput(date: Date | null | undefined): string {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
}

export function timeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: id });
}
