/**
 * Logika hierarki & aturan penugasan ("+1 rule").
 * Fungsi murni — mudah diuji, tanpa akses database.
 */

export type PositionLite = { id: string; parentId: string | null };
export type PositionMap = Map<string, PositionLite>;

export function buildPositionMap(positions: PositionLite[]): PositionMap {
  return new Map(positions.map((p) => [p.id, { id: p.id, parentId: p.parentId }]));
}

export function getParentId(map: PositionMap, id: string): string | null {
  return map.get(id)?.parentId ?? null;
}

/** Semua id leluhur dari sebuah posisi (dari yang terdekat ke puncak). */
export function getAncestorIds(map: PositionMap, id: string): string[] {
  const out: string[] = [];
  const guard = new Set<string>();
  let cur = map.get(id)?.parentId ?? null;
  while (cur && !guard.has(cur)) {
    guard.add(cur);
    out.push(cur);
    cur = map.get(cur)?.parentId ?? null;
  }
  return out;
}

/** Apakah `aId` leluhur (atasan, langsung/tak langsung) dari `bId`? */
export function isAncestor(map: PositionMap, aId: string, bId: string): boolean {
  if (aId === bId) return false;
  return getAncestorIds(map, bId).includes(aId);
}

/** Semua id keturunan (bawahan) dari sebuah posisi. */
export function getDescendantIds(map: PositionMap, id: string): string[] {
  const childrenByParent = new Map<string, string[]>();
  for (const p of map.values()) {
    if (p.parentId) {
      const arr = childrenByParent.get(p.parentId) ?? [];
      arr.push(p.id);
      childrenByParent.set(p.parentId, arr);
    }
  }
  const out: string[] = [];
  const stack = [...(childrenByParent.get(id) ?? [])];
  while (stack.length) {
    const cur = stack.pop()!;
    out.push(cur);
    stack.push(...(childrenByParent.get(cur) ?? []));
  }
  return out;
}

/** Posisi + semua bawahannya (dipakai untuk Pantauan berdasarkan lingkup). */
export function getSubtreeIds(map: PositionMap, id: string): string[] {
  return [id, ...getDescendantIds(map, id)];
}

export type AssignmentKind = "langsung" | "permintaan";

/**
 * Memberi tugas dari posisi `giverPosId` ke `assigneePosId`.
 * - Ke bawahan (giver leluhur assignee) => tugas LANGSUNG.
 * - Selain itu (sejajar / ke atas / luar jalur) => PERMINTAAN.
 */
export function classifyAssignment(
  map: PositionMap,
  giverPosId: string,
  assigneePosId: string,
): AssignmentKind {
  if (isAncestor(map, giverPosId, assigneePosId)) return "langsung";
  return "permintaan";
}

export type ApproverSlot =
  | { role: "diminta" }
  | { role: "atasan"; positionId: string };

/**
 * Slot persetujuan untuk sebuah PERMINTAAN (requesterPos -> targetPos).
 * - Ke atas (target adalah leluhur peminta): cukup yang diminta.
 * - Selain itu: atasan langsung peminta + atasan langsung yang diminta + yang diminta
 *   (posisi atasan yang sama digabung; tidak naik sampai Dirut kecuali memang atasan langsung).
 */
export function computeApprovers(
  map: PositionMap,
  requesterPosId: string,
  targetPosId: string,
): ApproverSlot[] {
  if (isAncestor(map, targetPosId, requesterPosId)) {
    return [{ role: "diminta" }];
  }
  const slots: ApproverSlot[] = [];
  const seen = new Set<string>();
  const addAtasan = (posId: string | null) => {
    if (posId && !seen.has(posId)) {
      seen.add(posId);
      slots.push({ role: "atasan", positionId: posId });
    }
  };
  addAtasan(getParentId(map, requesterPosId));
  addAtasan(getParentId(map, targetPosId));
  slots.push({ role: "diminta" });
  return slots;
}
