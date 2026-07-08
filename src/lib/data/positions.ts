import { cache } from "react";
import { db } from "@/db";
import { buildPositionMap } from "@/lib/permissions";

/** Semua jabatan (di-cache per-request). */
export const getAllPositions = cache(async () => {
  return db.query.positions.findMany();
});

/** Peta jabatan untuk logika hierarki (di-cache per-request). */
export const getPositionMap = cache(async () => {
  const rows = await getAllPositions();
  return buildPositionMap(rows);
});

/** Cari nama jabatan berdasarkan id. */
export async function positionName(id: string): Promise<string> {
  const rows = await getAllPositions();
  return rows.find((p) => p.id === id)?.name ?? id;
}
