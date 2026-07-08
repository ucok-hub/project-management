import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { positions, users, tasks, requests, requestApprovals } from "./schema";
import { SEED_POSITIONS, SEED_USERS, DEFAULT_PASSWORD } from "../lib/org";
import { buildPositionMap, computeApprovers } from "../lib/permissions";
import { newId } from "../lib/utils";

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(17, 0, 0, 0);
  return d;
}

async function main() {
  // 1) Jabatan
  for (const p of SEED_POSITIONS) {
    await db.insert(positions).values(p).onConflictDoNothing({ target: positions.id });
  }

  // 2) Pengguna
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  for (const u of SEED_USERS) {
    await db
      .insert(users)
      .values({
        id: newId(),
        username: u.username,
        name: u.name,
        positionId: u.positionId,
        passwordHash,
        isAdmin: u.isAdmin ?? false,
      })
      .onConflictDoNothing({ target: users.username });
  }

  // Peta username -> user
  const allUsers = await db.query.users.findMany();
  const byUsername = new Map(allUsers.map((u) => [u.username, u]));
  const uid = (username: string) => {
    const u = byUsername.get(username);
    if (!u) throw new Error(`User ${username} tidak ditemukan`);
    return u;
  };

  // 3) Contoh tugas (hanya sekali, bila belum ada tugas)
  const existingTask = await db.query.tasks.findFirst();
  if (!existingTask) {
    const hendra = uid("hendra");
    const joko = uid("joko");
    const wati = uid("wati");
    const rudi = uid("rudi");
    const agus = uid("agus");
    const sari = uid("sari");
    const dewi = uid("dewi");

    await db.insert(tasks).values([
      {
        id: newId(),
        title: "Ambil sampel air Sungai Ciliwung titik A",
        note: "Bawa cool box dan formulir sampling. Jangan lupa foto lokasi.",
        giverId: hendra.id,
        assigneeId: rudi.id,
        status: "belum",
        deadline: daysFromNow(2),
        origin: "langsung",
      },
      {
        id: newId(),
        title: "Siapkan botol sampel & cool box untuk besok",
        giverId: joko.id,
        assigneeId: agus.id,
        status: "dikerjakan",
        deadline: daysFromNow(1),
        origin: "langsung",
      },
      {
        id: newId(),
        title: "Analisis BOD & COD sampel #1023",
        note: "Gunakan metode standar. Catat hasil di logbook.",
        giverId: wati.id,
        assigneeId: sari.id,
        status: "menunggu_acc",
        deadline: daysFromNow(3),
        origin: "langsung",
      },
      {
        id: newId(),
        title: "Rapikan logbook lab minggu ini",
        giverId: hendra.id,
        assigneeId: dewi.id,
        status: "selesai",
        origin: "langsung",
        completedAt: new Date(),
      },
    ]);
  }

  // 4) Contoh permintaan (peer): SPV Sampling -> SPV Analis
  const existingReq = await db.query.requests.findFirst();
  if (!existingReq) {
    const joko = uid("joko"); // SPV Sampling
    const wati = uid("wati"); // SPV Analis
    const map = buildPositionMap(SEED_POSITIONS);
    const slots = computeApprovers(map, joko.positionId, wati.positionId);

    const reqId = newId();
    await db.insert(requests).values({
      id: reqId,
      requesterId: joko.id,
      targetId: wati.id,
      title: "Tolong bantu cek kalibrasi alat pH sebelum sampling besar",
      note: "Alat pH milik tim sampling perlu dibandingkan dengan lab.",
      deadline: daysFromNow(4),
      status: "menunggu",
    });

    for (const slot of slots) {
      await db.insert(requestApprovals).values({
        id: newId(),
        requestId: reqId,
        role: slot.role,
        positionId: slot.role === "atasan" ? slot.positionId : null,
        userId: slot.role === "diminta" ? wati.id : null,
        decision: "menunggu",
      });
    }
  }

  console.log(`✅ Seed selesai. ${allUsers.length} pengguna siap. Password default: "${DEFAULT_PASSWORD}"`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed gagal:", err);
    process.exit(1);
  });
