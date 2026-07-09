import { eq, inArray } from "drizzle-orm";
import { tasks, requests, requestApprovals } from "../../db/schema";
import { buildPositionMap, classifyAssignment, computeApprovers } from "../permissions";
import { newId } from "../utils";
import type { DB } from "../../db";

type Party = { id: string; positionId: string };
type PositionLite = { id: string; parentId: string | null };

export type CreateInput = {
  giver: Party;
  target: Party;
  title: string;
  note: string | null;
  deadline: Date | null;
  positions: PositionLite[];
};

export type CreateResult =
  | { kind: "langsung"; taskId: string }
  | { kind: "permintaan"; requestId: string; atasanPositionIds: string[] };

/** Buat Tugas Langsung atau Permintaan sesuai aturan hierarki. */
export async function createAssignment(db: DB, input: CreateInput): Promise<CreateResult> {
  const { giver, target } = input;
  const isSelf = giver.id === target.id;
  const map = buildPositionMap(input.positions);
  const kind = isSelf ? "langsung" : classifyAssignment(map, giver.positionId, target.positionId);

  if (kind === "langsung") {
    const taskId = newId();
    await db.insert(tasks).values({
      id: taskId,
      title: input.title,
      note: input.note,
      giverId: giver.id,
      assigneeId: target.id,
      status: "belum",
      deadline: input.deadline,
      origin: "langsung",
    });
    return { kind: "langsung", taskId };
  }

  const slots = computeApprovers(map, giver.positionId, target.positionId);
  const requestId = newId();
  await db.insert(requests).values({
    id: requestId,
    requesterId: giver.id,
    targetId: target.id,
    title: input.title,
    note: input.note,
    deadline: input.deadline,
    status: "menunggu",
  });

  const atasanPositionIds = slots
    .filter((s) => s.role === "atasan")
    .map((s) => s.positionId);

  await db.insert(requestApprovals).values(
    slots.map((slot) => ({
      id: newId(),
      requestId,
      role: slot.role,
      positionId: slot.role === "atasan" ? slot.positionId : null,
      userId: slot.role === "diminta" ? target.id : null,
      decision: "menunggu" as const,
    })),
  );
  return { kind: "permintaan", requestId, atasanPositionIds };
}

export type DecisionResult =
  | { outcome: "noop" }
  | { outcome: "ditolak"; requesterId: string }
  | { outcome: "menunggu" }
  | { outcome: "disetujui"; taskId: string; requesterId: string; targetId: string };

/** Terapkan keputusan (setuju/tolak) pada slot yang menjadi hak `actor`. */
export async function decideRequestCore(
  db: DB,
  requestId: string,
  actor: Party,
  decision: "setuju" | "tolak",
): Promise<DecisionResult> {
  const req = await db.query.requests.findFirst({
    where: eq(requests.id, requestId),
    with: { approvals: true },
  });
  if (!req || req.status !== "menunggu") return { outcome: "noop" };

  const mySlots = req.approvals.filter(
    (a) =>
      a.decision === "menunggu" &&
      ((a.role === "diminta" && a.userId === actor.id) ||
        (a.role === "atasan" && a.positionId === actor.positionId)),
  );
  if (mySlots.length === 0) return { outcome: "noop" };

  const now = new Date();
  await db
    .update(requestApprovals)
    .set({ decision, decidedById: actor.id, decidedAt: now })
    .where(inArray(requestApprovals.id, mySlots.map((s) => s.id)));

  const fresh = await db.query.requests.findFirst({
    where: eq(requests.id, requestId),
    with: { approvals: true },
  });
  if (!fresh) return { outcome: "noop" };

  if (decision === "tolak") {
    await db.update(requests).set({ status: "ditolak", resolvedAt: now }).where(eq(requests.id, requestId));
    return { outcome: "ditolak", requesterId: fresh.requesterId };
  }

  if (fresh.approvals.every((a) => a.decision === "setuju")) {
    const taskId = newId();
    await db.insert(tasks).values({
      id: taskId,
      title: fresh.title,
      note: fresh.note,
      giverId: fresh.requesterId,
      assigneeId: fresh.targetId,
      status: "belum",
      deadline: fresh.deadline,
      origin: "permintaan",
      requestId,
    });
    await db.update(requests).set({ status: "disetujui", resolvedAt: now }).where(eq(requests.id, requestId));
    return { outcome: "disetujui", taskId, requesterId: fresh.requesterId, targetId: fresh.targetId };
  }

  return { outcome: "menunggu" };
}
