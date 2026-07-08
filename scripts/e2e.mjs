import { chromium } from "playwright";

const BASE = "http://localhost:3000";
let pass = 0;
function ok(msg) {
  pass++;
  console.log("  ✓", msg);
}
function fail(msg) {
  throw new Error("ASSERT FAILED: " + msg);
}

const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.setDefaultTimeout(15000);

try {
  // ===== A. Login lewat form asli (rudi) + tugas pribadi + alur status =====
  console.log("A. Login form + tugas pribadi (rudi)");
  await page.goto(`${BASE}/masuk`);
  await page.fill("#username", "rudi");
  await page.fill("#password", "12345");
  await page.getByRole("button", { name: /Masuk/ }).click();
  await page.waitForURL("**/beranda");
  ok("login form berhasil -> /beranda");

  await page.goto(`${BASE}/buat`);
  await page.selectOption("#assigneeId", { label: "Rudi (saya sendiri)" });
  await page.getByText("Ini untuk diri sendiri").waitFor();
  ok("preview 'diri sendiri' muncul");
  const judul = "Uji E2E tugas pribadi " + Date.now();
  await page.fill("#title", judul);
  await page.getByRole("button", { name: /Kirim/ }).click();
  await page.waitForURL(/\/tugas\/[0-9a-f-]{36}/);
  await page.getByRole("heading", { name: judul }).waitFor();
  ok("tugas dibuat & detail tampil");

  await page.getByRole("button", { name: /Mulai Kerjakan/ }).click();
  await page.getByText("Sedang dikerjakan").first().waitFor();
  ok("status -> Sedang dikerjakan");
  await page.getByRole("button", { name: /Tandai Selesai/ }).click();
  await page.locator("text=🟢").first().waitFor();
  ok("status -> Selesai (tugas pribadi langsung selesai)");

  // ===== B. Permintaan: buat (joko) -> ACC hendra + wati -> jadi tugas =====
  console.log("B. Permintaan + ACC ganda");
  await page.goto(`${BASE}/api/dev/login/joko`);
  await page.waitForURL("**/beranda");
  await page.goto(`${BASE}/buat`);
  await page.selectOption("#assigneeId", { label: "Bu Wati" });
  await page.getByText("Ini jadi Permintaan").waitFor();
  await page.getByText("Manager Teknis", { exact: false }).first().waitFor();
  ok("preview 'Permintaan' + approver Manager Teknis muncul");
  const jreq = "Uji E2E permintaan " + Date.now();
  await page.fill("#title", jreq);
  await page.getByRole("button", { name: /Kirim/ }).click();
  await page.waitForURL(/\/permintaan\/[0-9a-f-]{36}/);
  const reqUrl = page.url().split("?")[0];
  const reqId = reqUrl.split("/").pop();
  ok("permintaan dibuat: " + reqId);

  // Hendra (Manager Teknis) menyetujui
  await page.goto(`${BASE}/api/dev/login/hendra`);
  await page.waitForURL("**/beranda");
  await page.goto(reqUrl);
  await page.getByRole("button", { name: /^Setujui$/ }).click();
  await page.getByText(/Sudah setuju/).first().waitFor();
  ok("Hendra menyetujui (slot atasan)");
  const stillMenunggu = await page.getByText("Menunggu persetujuan").first().isVisible();
  if (!stillMenunggu) fail("seharusnya masih menunggu ACC wati");
  ok("status masih Menunggu (wati belum ACC)");

  // Wati (yang diminta) menyetujui -> jadi tugas
  await page.goto(`${BASE}/api/dev/login/wati`);
  await page.waitForURL("**/beranda");
  await page.goto(reqUrl);
  await page.getByRole("button", { name: /^Setujui$/ }).click();
  await page.getByText("Disetujui", { exact: false }).first().waitFor();
  ok("Wati menyetujui -> Permintaan Disetujui");

  await page.goto(`${BASE}/tugas-saya`);
  await page.getByText(jreq).first().waitFor();
  ok("Tugas otomatis muncul di 'Tugas Saya' Wati");

  console.log(`\nSEMUA LOLOS (${pass} pemeriksaan)`);
} catch (e) {
  console.error("\nGAGAL setelah", pass, "lolos:", e.message);
  await page.screenshot({ path: "e2e-fail.png" }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
}
