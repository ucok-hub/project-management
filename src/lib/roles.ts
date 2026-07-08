import { getPositionMap } from "@/lib/data/positions";
import { getDescendantIds } from "@/lib/permissions";
import type { CurrentUser } from "@/lib/auth";

/** Bisa membuka Pantauan bila punya bawahan. */
export async function canMonitor(user: CurrentUser): Promise<boolean> {
  const map = await getPositionMap();
  return getDescendantIds(map, user.positionId).length > 0;
}
