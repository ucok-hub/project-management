import { test } from "node:test";
import assert from "node:assert/strict";
import { getRadianAngle, rotatedBoundingBox } from "./crop-image";

test("getRadianAngle mengubah derajat menjadi radian", () => {
  assert.equal(getRadianAngle(180), Math.PI);
  assert.equal(getRadianAngle(0), 0);
});

test("rotatedBoundingBox mempertahankan ukuran pada rotasi nol", () => {
  const box = rotatedBoundingBox(100, 200, 0);
  assert.ok(Math.abs(box.width - 100) < 0.001);
  assert.ok(Math.abs(box.height - 200) < 0.001);
});

test("rotatedBoundingBox menukar width dan height pada rotasi 90 derajat", () => {
  const box = rotatedBoundingBox(100, 200, 90);
  assert.ok(Math.abs(box.width - 200) < 0.001);
  assert.ok(Math.abs(box.height - 100) < 0.001);
});
