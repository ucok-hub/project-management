import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { positions, users, tasks, requests, requestApprovals } from "./schema";
import { SEED_POSITIONS, SEED_USERS, DEFAULT_PASSWORD } from "../lib/org";
import { buildPositionMap, computeApprovers } from "../lib/permissions";
import { newId } from "../lib/utils";
import { daysFromNowJakarta } from "../lib/timezone";

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
    const nidia = uid("nidia"); // Manager Teknis
    const hasan = uid("hasan"); // Penyelia Sampling
    const gita = uid("gita"); // Penyelia Lab
    const petugas1 = uid("petugas1");
    const petugas2 = uid("petugas2");
    const analis1 = uid("analis1");
    const analis2 = uid("analis2");

    await db.insert(tasks).values([
      {
        id: newId(),
        title: "Ambil sampel air Sungai Ciliwung titik A",
        note: "Bawa cool box dan formulir sampling. Jangan lupa foto lokasi.",
        giverId: nidia.id,
        assigneeId: petugas1.id,
        status: "belum",
        deadline: daysFromNowJakarta(2),
        origin: "langsung",
      },
      {
        id: newId(),
        title: "Siapkan botol sampel & cool box untuk besok",
        giverId: hasan.id,
        assigneeId: petugas2.id,
        status: "dikerjakan",
        deadline: daysFromNowJakarta(1),
        origin: "langsung",
      },
      {
        id: newId(),
        title: "Analisis BOD & COD sampel #1023",
        note: "Gunakan metode standar. Catat hasil di logbook.",
        giverId: gita.id,
        assigneeId: analis1.id,
        status: "menunggu_acc",
        deadline: daysFromNowJakarta(3),
        origin: "langsung",
      },
      {
        id: newId(),
        title: "Rapikan logbook lab minggu ini",
        giverId: nidia.id,
        assigneeId: analis2.id,
        status: "selesai",
        origin: "langsung",
        completedAt: new Date(),
      },
    ]);
  }

  // 4) Contoh permintaan (peer): Penyelia Sampling -> Penyelia Lab
  const existingReq = await db.query.requests.findFirst();
  if (!existingReq) {
    const hasan = uid("hasan"); // Penyelia Sampling
    const gita = uid("gita"); // Penyelia Lab
    const map = buildPositionMap(SEED_POSITIONS);
    const slots = computeApprovers(map, hasan.positionId, gita.positionId);

    const reqId = newId();
    await db.insert(requests).values({
      id: reqId,
      requesterId: hasan.id,
      targetId: gita.id,
      title: "Tolong bantu cek kalibrasi alat pH sebelum sampling besar",
      note: "Alat pH milik tim sampling perlu dibandingkan dengan lab.",
      deadline: daysFromNowJakarta(4),
      status: "menunggu",
    });

    for (const slot of slots) {
      await db.insert(requestApprovals).values({
        id: newId(),
        requestId: reqId,
        role: slot.role,
        positionId: slot.role === "atasan" ? slot.positionId : null,
        userId: slot.role === "diminta" ? gita.id : null,
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
