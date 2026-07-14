import { test } from "node:test";
import assert from "node:assert/strict";
import { resolvePresenceStatus, HEARTBEAT_INTERVAL_MS } from "./presence";

const NOW = new Date("2026-07-14T12:00:00Z");

test("resolvePresenceStatus: tidak pernah heartbeat -> offline", () => {
  assert.equal(resolvePresenceStatus(null, null, NOW), "offline");
});

test("resolvePresenceStatus: heartbeat baru, status online -> online", () => {
  const lastSeenAt = new Date(NOW.getTime() - 5_000);
  assert.equal(resolvePresenceStatus(lastSeenAt, "online", NOW), "online");
});

test("resolvePresenceStatus: heartbeat baru, status idle -> idle", () => {
  const lastSeenAt = new Date(NOW.getTime() - 5_000);
  assert.equal(resolvePresenceStatus(lastSeenAt, "idle", NOW), "idle");
});

test("resolvePresenceStatus: heartbeat basi -> offline", () => {
  const lastSeenAt = new Date(NOW.getTime() - (HEARTBEAT_INTERVAL_MS * 3 + 1_000));
  assert.equal(resolvePresenceStatus(lastSeenAt, "online", NOW), "offline");
});

test("resolvePresenceStatus: tepat di ambang batas masih segar", () => {
  const lastSeenAt = new Date(NOW.getTime() - HEARTBEAT_INTERVAL_MS * 3);
  assert.equal(resolvePresenceStatus(lastSeenAt, "online", NOW), "online");
});
