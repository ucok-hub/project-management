/**
 * Semua jam di aplikasi ini harus tampil sebagai WIB (Asia/Jakarta, UTC+7),
 * TIDAK PEDULI zona waktu server (Vercel berjalan di UTC, dev lokal bisa beda lagi).
 *
 * Trik: baca komponen tanggal/jam sebuah instant menurut WIB via Intl (akurat di
 * TZ server apa pun), lalu bangun ulang jadi Date "lokal palsu" dengan komponen
 * yang sama — supaya getter lokal (dipakai date-fns) selalu membaca angka WIB.
 * Indonesia tidak punya DST, jadi offset +7 selalu tetap — aman untuk aritmetika hari.
 */

const TZ = "Asia/Jakarta";

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function jakartaParts(date: Date) {
  const raw: Record<string, string> = {};
  for (const p of partsFormatter.formatToParts(date)) {
    if (p.type !== "literal") raw[p.type] = p.value;
  }
  return {
    year: Number(raw.year),
    month: Number(raw.month),
    day: Number(raw.day),
    hour: raw.hour === "24" ? 0 : Number(raw.hour),
    minute: Number(raw.minute),
    second: Number(raw.second),
  };
}

/** Date "lokal palsu" berkomponen WIB — aman dipakai bersama date-fns (format, dll). */
export function toJakartaWallClock(date: Date): Date {
  const p = jakartaParts(date);
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

function isSameJakartaDay(a: Date, b: Date): boolean {
  const pa = jakartaParts(a);
  const pb = jakartaParts(b);
  return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day;
}

export function isTodayJakarta(date: Date): boolean {
  return isSameJakartaDay(date, new Date());
}

export function isTomorrowJakarta(date: Date): boolean {
  return isSameJakartaDay(date, new Date(Date.now() + 86_400_000));
}

export function isYesterdayJakarta(date: Date): boolean {
  return isSameJakartaDay(date, new Date(Date.now() - 86_400_000));
}

export function isThisYearJakarta(date: Date): boolean {
  return jakartaParts(date).year === jakartaParts(new Date()).year;
}

/** "yyyy-MM-dd" menurut kalender WIB — untuk isi <input type="date">. */
export function jakartaDateKey(date: Date): string {
  const p = jakartaParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/**
 * Ubah tanggal "yyyy-MM-dd" (dipilih user, dimaksud sebagai waktu WIB) + jam
 * default jadi instant yang benar, dengan offset +07:00 eksplisit — tidak
 * bergantung sama sekali pada zona waktu server.
 */
export function parseJakartaDate(dateStr: string, time = "17:00:00"): Date | null {
  const s = dateStr.trim();
  if (!s) return null;
  const d = new Date(`${s}T${time}+07:00`);
  return isNaN(d.getTime()) ? null : d;
}

/** N hari dari sekarang, jam 17:00 WIB pada hari itu (dipakai untuk data contoh). */
export function daysFromNowJakarta(n: number): Date {
  const base = new Date(Date.now() + n * 86_400_000);
  const key = jakartaDateKey(base);
  return parseJakartaDate(key)!;
}
