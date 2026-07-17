"use server";

import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { requireDev, createSession } from "@/lib/auth";

/** Login sebagai user lain (ganti sesi sepenuhnya). Hanya akun developer. */
export async function loginAsUser(formData: FormData): Promise<void> {
  await requireDev();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;
  await createSession(userId, false);
  redirect("/beranda");
}

export type SqlConsoleState = {
  error?: string;
  columns?: string[];
  rows?: Record<string, unknown>[];
  durationMs?: number;
  rowCount?: number;
};

const FORBIDDEN_KEYWORDS =
  /\b(insert|update|delete|drop|alter|truncate|grant|revoke|create|copy|call|execute|vacuum|reindex|merge|comment|do)\b/i;

function validateReadOnlyQuery(raw: string): string | null {
  const q = raw.trim();
  if (!q) return "Query kosong.";
  const withoutTrailingSemicolon = q.endsWith(";") ? q.slice(0, -1) : q;
  if (withoutTrailingSemicolon.includes(";")) return "Hanya boleh 1 query per eksekusi (tidak boleh ada ';' di tengah).";
  const firstWord = withoutTrailingSemicolon.trim().split(/\s+/)[0]?.toLowerCase();
  if (firstWord !== "select" && firstWord !== "with") {
    return "Hanya query SELECT (atau WITH ... SELECT) yang diizinkan.";
  }
  if (FORBIDDEN_KEYWORDS.test(withoutTrailingSemicolon)) {
    return "Query mengandung kata kunci yang tidak diizinkan untuk konsol read-only ini.";
  }
  return null;
}

/**
 * Jalankan query SELECT saja. Diproteksi berlapis:
 * 1) Validasi teks (harus SELECT/WITH, 1 statement, tanpa kata kunci berbahaya).
 * 2) Dijalankan dalam transaksi Postgres READ ONLY sungguhan -- kalaupun (1) lolos
 *    tapi query ternyata mengubah data, database sendiri yang menolak.
 * 3) Batas waktu 5 detik & hasil dipotong maksimal 200 baris.
 */
export async function runReadOnlyQuery(
  _prev: SqlConsoleState,
  formData: FormData,
): Promise<SqlConsoleState> {
  await requireDev();
  const query = String(formData.get("query") ?? "");
  const validationError = validateReadOnlyQuery(query);
  if (validationError) return { error: validationError };

  const started = Date.now();
  try {
    const result = await db.transaction(async (tx) => {
      await tx.execute(sql.raw(`SET LOCAL statement_timeout = '5s'`));
      await tx.execute(sql.raw(`SET TRANSACTION READ ONLY`));
      return tx.execute(sql.raw(query));
    });

    const raw = result as unknown;
    const rowsRaw: Record<string, unknown>[] = Array.isArray(raw)
      ? (raw as Record<string, unknown>[])
      : ((raw as { rows?: Record<string, unknown>[] })?.rows ?? []);

    const rows = rowsRaw.slice(0, 200);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return { columns, rows, durationMs: Date.now() - started, rowCount: rowsRaw.length };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Query gagal dijalankan." };
  }
}
