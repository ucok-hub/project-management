import { test } from "node:test";
import assert from "node:assert/strict";
import { SEED_POSITIONS } from "./org";
import {
  buildPositionMap,
  classifyAssignment,
  computeApprovers,
  getDescendantIds,
  isAncestor,
  type ApproverSlot,
} from "./permissions";

const map = buildPositionMap(SEED_POSITIONS);

function atasanIds(slots: ApproverSlot[]): string[] {
  return slots.filter((s) => s.role === "atasan").map((s) => (s as { positionId: string }).positionId);
}
function hasDiminta(slots: ApproverSlot[]): boolean {
  return slots.some((s) => s.role === "diminta");
}

test("isAncestor: Dirut leluhur semua orang", () => {
  assert.equal(isAncestor(map, "dirut", "staff_sampling"), true);
  assert.equal(isAncestor(map, "dirut", "sales"), true);
  assert.equal(isAncestor(map, "manager_teknis", "staff_sampling"), true);
  assert.equal(isAncestor(map, "staff_sampling", "dirut"), false);
  assert.equal(isAncestor(map, "spv_sampling", "spv_analis"), false);
});

test("classifyAssignment: ke bawahan = langsung", () => {
  assert.equal(classifyAssignment(map, "dirut", "staff_sampling"), "langsung");
  assert.equal(classifyAssignment(map, "manager_teknis", "staff_analis"), "langsung");
  assert.equal(classifyAssignment(map, "spv_sampling", "staff_sampling"), "langsung");
});

test("classifyAssignment: sejajar/atas/luar jalur = permintaan", () => {
  assert.equal(classifyAssignment(map, "spv_sampling", "spv_analis"), "permintaan"); // sejajar
  assert.equal(classifyAssignment(map, "staff_sampling", "staff_analis"), "permintaan"); // sejajar
  assert.equal(classifyAssignment(map, "staff_sampling", "manager_teknis"), "permintaan"); // ke atas
  assert.equal(classifyAssignment(map, "staff_sampling", "sales"), "permintaan"); // luar jalur
});

test("computeApprovers: ke atas cukup yang diminta", () => {
  const slots = computeApprovers(map, "staff_sampling", "manager_teknis");
  assert.deepEqual(slots, [{ role: "diminta" }]);
});

test("computeApprovers: minta ke atasan langsung sendiri cukup yang diminta", () => {
  const slots = computeApprovers(map, "staff_sampling", "spv_sampling");
  assert.deepEqual(slots, [{ role: "diminta" }]);
});

test("computeApprovers: peer satu subtree -> atasan bersama tunggal", () => {
  const slots = computeApprovers(map, "spv_sampling", "spv_analis");
  assert.deepEqual(atasanIds(slots), ["manager_teknis"]);
  assert.equal(hasDiminta(slots), true);
});

test("computeApprovers: staff -> sales tidak naik ke Dirut", () => {
  const slots = computeApprovers(map, "staff_sampling", "sales");
  assert.deepEqual(atasanIds(slots), ["spv_sampling", "manager_marketing"]);
  assert.equal(hasDiminta(slots), true);
  assert.equal(atasanIds(slots).includes("dirut"), false);
});

test("computeApprovers: konsultan -> staff analis (lintas divisi)", () => {
  const slots = computeApprovers(map, "konsultan", "staff_analis");
  assert.deepEqual(atasanIds(slots), ["manager_mutu", "spv_analis"]);
  assert.equal(hasDiminta(slots), true);
});

test("getDescendantIds: bawahan Direktur Operasional", () => {
  const ds = getDescendantIds(map, "dir_ops").sort();
  assert.deepEqual(ds, [
    "manager_teknis",
    "purchasing",
    "spv_analis",
    "spv_sampling",
    "staff_analis",
    "staff_sampling",
    "tenaga_ahli",
  ]);
});
