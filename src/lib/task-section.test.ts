import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTaskDefaultSection } from "./task-section";

test("giver-only kembali ke saya-beri", () => {
  assert.equal(
    resolveTaskDefaultSection({ id: "u1" }, { giverId: "u1", assigneeId: "u2" }),
    "/saya-beri",
  );
});

test("assignee kembali ke tugas-saya", () => {
  assert.equal(
    resolveTaskDefaultSection({ id: "u2" }, { giverId: "u1", assigneeId: "u2" }),
    "/tugas-saya",
  );
});

test("tugas untuk diri sendiri kembali ke tugas-saya", () => {
  assert.equal(
    resolveTaskDefaultSection({ id: "u1" }, { giverId: "u1", assigneeId: "u1" }),
    "/tugas-saya",
  );
});
