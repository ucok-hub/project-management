import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gabungkan className Tailwind dengan aman (menghindari konflik). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ID acak untuk baris database (portabel: PGlite & Supabase). */
export function newId(): string {
  return crypto.randomUUID();
}
