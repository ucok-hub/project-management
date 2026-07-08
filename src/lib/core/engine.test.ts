import { test, before } from "node:test";
import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../../db/schema";
import { SEED_POSITIONS } from "../org";
import { createAssignment, decideRequestCore } from "./engine";

type TestDB = ReturnType<typeof drizzle<typeof schema>>;
let db: TestDB;

// user id per posisi (satu orang per posisi untuk tes)
const U: Record<string, string> = {};

before(async () => {
  const client = new PGlite(); // in-memory
  db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });

  for (const p of SEED_POSITIONS) {
    await db.insert(schema.positions).values(p);
  }
  for (const p of SEED_POSITIONS) {
    const id = `u_${p.id}`;
    U[p.id] = id;
    await db.insert(schema.users).values({
      id,
      username: p.id,
      name: `Org ${p.id}`,
      positionId: p.id,
      passwordHash: "x",
    });
  }
});

function party(posId: string) {
  return { id: U[posId], positionId: posId };
}
function baseInput() {
  return { title: "Tugas uji", note: null, deadline: null, positions: SEED_POSITIONS };
}

test("createAssignment: ke bawahan = tugas langsung", async () => {
  const res = await createAssignment(db, {
    ...baseInput(),
    giver: party("manager_teknis"),
    target: party("staff_sampling"),
  });
  assert.equal(res.kind, "langsung");
  if (res.kind !== "langsung") return;
  const task = await db.query.tasks.findFirst({ where: eq(schema.tasks.id, res.taskId) });
  assert.ok(task);
  assert.equal(task!.giverId, U["manager_teknis"]);
  assert.equal(task!.assigneeId, U["staff_sampling"]);
  assert.equal(task!.status, "belum");
  assert.equal(task!.origin, "langsung");
});

test("createAssignment: staff -> sales = permintaan, atasan tanpa Dirut", async () => {
  const res = await createAssignment(db, {
    ...baseInput(),
    giver: party("staff_sampling"),
    target: party("sales"),
  });
  assert.equal(res.kind, "permintaan");
  if (res.kind !== "permintaan") return;
  assert.deepEqual([...res.atasanPositionIds].sort(), ["manager_marketing", "spv_sampling"]);

  const approvals = await db.query.requestApprovals.findMany({
    where: eq(schema.requestApprovals.requestId, res.requestId),
  });
  assert.equal(approvals.length, 3);
  assert.equal(approvals.filter((a) => a.role === "atasan").length, 2);
  const diminta = approvals.find((a) => a.role === "diminta");
  assert.equal(diminta?.userId, U["sales"]);
});

test("createAssignment: ke atas = permintaan, cukup yang diminta", async () => {
  const res = await createAssignment(db, {
    ...baseInput(),
    giver: party("staff_sampling"),
    target: party("manager_teknis"),
  });
  assert.equal(res.kind, "permintaan");
  if (res.kind !== "permintaan") return;
  assert.deepEqual(res.atasanPositionIds, []);
  const approvals = await db.query.requestApprovals.findMany({
    where: eq(schema.requestApprovals.requestId, res.requestId),
  });
  assert.equal(approvals.length, 1);
  assert.equal(approvals[0].role, "diminta");
});

test("decideRequestCore: alur ACC penuh membuat tugas", async () => {
  const res = await createAssignment(db, {
    ...baseInput(),
    giver: party("staff_sampling"),
    target: party("sales"),
  });
  assert.equal(res.kind, "permintaan");
  if (res.kind !== "permintaan") return;
  const reqId = res.requestId;

  // Aktor tak berwenang -> noop
  const noop = await decideRequestCore(db, reqId, party("manager_teknis"), "setuju");
  assert.equal(noop.outcome, "noop");

  // Atasan langsung peminta (SPV Sampling)
  let r = await decideRequestCore(db, reqId, party("spv_sampling"), "setuju");
  assert.equal(r.outcome, "menunggu");
  // Atasan langsung yang diminta (Manager Marketing)
  r = await decideRequestCore(db, reqId, party("manager_marketing"), "setuju");
  assert.equal(r.outcome, "menunggu");
  // Yang diminta (Sales) -> disetujui, tugas dibuat
  r = await decideRequestCore(db, reqId, party("sales"), "setuju");
  assert.equal(r.outcome, "disetujui");
  if (r.outcome !== "disetujui") return;

  const task = await db.query.tasks.findFirst({ where: eq(schema.tasks.id, r.taskId) });
  assert.ok(task);
  assert.equal(task!.giverId, U["staff_sampling"]);
  assert.equal(task!.assigneeId, U["sales"]);
  assert.equal(task!.origin, "permintaan");
  assert.equal(task!.requestId, reqId);

  const req = await db.query.requests.findFirst({ where: eq(schema.requests.id, reqId) });
  assert.equal(req!.status, "disetujui");
});

test("decideRequestCore: penolakan menutup permintaan tanpa tugas", async () => {
  const res = await createAssignment(db, {
    ...baseInput(),
    giver: party("staff_sampling"),
    target: party("staff_analis"),
  });
  assert.equal(res.kind, "permintaan");
  if (res.kind !== "permintaan") return;

  const r = await decideRequestCore(db, res.requestId, party("staff_analis"), "tolak");
  assert.equal(r.outcome, "ditolak");

  const req = await db.query.requests.findFirst({ where: eq(schema.requests.id, res.requestId) });
  assert.equal(req!.status, "ditolak");
  const tasksForReq = await db.query.tasks.findMany({ where: eq(schema.tasks.requestId, res.requestId) });
  assert.equal(tasksForReq.length, 0);
});
