import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HAS_NAVIGATED_KEY,
  isNavItemActive,
  isTrackedHubHref,
  matchHubHref,
  readLastSectionCookie,
  resolveEffectivePathname,
} from "./section-tracker";

test("matchHubHref: /beranda cocok cuma exact match", () => {
  assert.equal(matchHubHref("/beranda"), "/beranda");
  assert.equal(matchHubHref("/beranda/apapun"), null);
});

test("matchHubHref: hub lain cocok via prefix", () => {
  assert.equal(matchHubHref("/tugas-saya"), "/tugas-saya");
  assert.equal(matchHubHref("/saya-beri"), "/saya-beri");
  assert.equal(matchHubHref("/persetujuan"), "/persetujuan");
  assert.equal(matchHubHref("/pantauan"), "/pantauan");
});

test("matchHubHref: bukan salah satu dari 5 hub -> null", () => {
  assert.equal(matchHubHref("/permintaan"), null);
  assert.equal(matchHubHref("/admin"), null);
  assert.equal(matchHubHref("/tugas/abc123"), null);
});

test("isTrackedHubHref: validasi nilai cookie", () => {
  assert.equal(isTrackedHubHref("/persetujuan"), true);
  assert.equal(isTrackedHubHref("/permintaan"), false);
  assert.equal(isTrackedHubHref(undefined), false);
  assert.equal(isTrackedHubHref(""), false);
});

test("readLastSectionCookie: membaca dan memvalidasi cookie browser", () => {
  assert.equal(
    readLastSectionCookie("foo=bar; dil_last_section=%2Fpersetujuan; theme=light"),
    "/persetujuan",
  );
  assert.equal(readLastSectionCookie("dil_last_section=%2Fadmin"), null);
  assert.equal(readLastSectionCookie("dil_last_section=%E0%A4%A"), null);
  assert.equal(readLastSectionCookie(""), null);
});

test("resolveEffectivePathname: pathname biasa tidak berubah", () => {
  assert.equal(resolveEffectivePathname("/permintaan", null), "/permintaan");
  assert.equal(resolveEffectivePathname("/beranda", "/pantauan"), "/beranda");
});

test("resolveEffectivePathname: detail tugas memakai section terakhir", () => {
  assert.equal(resolveEffectivePathname("/tugas/abc", "/persetujuan"), "/persetujuan");
  assert.equal(resolveEffectivePathname("/tugas/abc", "/pantauan"), "/pantauan");
});

test("resolveEffectivePathname: detail tugas fallback ke /tugas-saya", () => {
  assert.equal(resolveEffectivePathname("/tugas/abc", null), "/tugas-saya");
});

test("isNavItemActive: /beranda exact match saja", () => {
  assert.equal(isNavItemActive("/beranda", "/beranda"), true);
  assert.equal(isNavItemActive("/beranda", "/beranda-lain"), false);
});

test("isNavItemActive: item lain memakai prefix match", () => {
  assert.equal(isNavItemActive("/persetujuan", "/persetujuan"), true);
  assert.equal(isNavItemActive("/permintaan", "/permintaan"), true);
  assert.equal(isNavItemActive("/tugas-saya", "/saya-beri"), false);
});

test("HAS_NAVIGATED_KEY: konstanta sessionStorage stabil", () => {
  assert.equal(HAS_NAVIGATED_KEY, "dil_has_navigated");
});
