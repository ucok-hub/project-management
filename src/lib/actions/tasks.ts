"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getAllPositions } from "@/lib/data/positions";
import { getUserById, getUsersInPositions } from "@/lib/data/users";
import { createAssignment } from "@/lib/core/engine";
import { notify, notifyMany } from "@/lib/notify";

export type CreateState = { error?: string };

function parseDeadline(value: string): Date | null {
  const s = value.trim();
  if (!s) return null;
  const d = new Date(`${s}T17:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function refreshTaskViews() {
  revalidatePath("/beranda");
  revalidatePath("/tugas-saya");
  revalidatePath("/saya-beri");
  revalidatePath("/persetujuan");
}

/** Buat Tugas Langsung atau Permintaan (otomatis, sesuai aturan +1). */
export async function createTaskOrRequest(
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  const me = await requireUser();
  const assigneeId = String(formData.get("assigneeId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || null;
  const deadline = parseDeadline(String(formData.get("deadline") ?? ""));

  if (!assigneeId) return { error: "Pilih dulu untuk siapa tugas ini." };
  if (!title) return { error: "Judul tugas belum diisi." };

  const target = await getUserById(assigneeId);
  if (!target || !target.isActive) return { error: "Orang yang dipilih tidak ditemukan." };

  const positions = await getAllPositions();
  const result = await createAssignment(db, {
    giver: { id: me.id, positionId: me.positionId },
    target: { id: target.id, positionId: target.positionId },
    title,
    note,
    deadline,
    positions,
  });

  let redirectTo: string;

  if (result.kind === "langsung") {
    if (target.id !== me.id) {
      await notify(target.id, {
        type: "tugas_baru",
        title: "Tugas baru untuk Anda",
        body: `${me.name}: ${title}`,
        link: `/tugas/${result.taskId}`,
      });
    }
    refreshTaskViews();
    redirectTo = `/tugas/${result.taskId}?baru=1`;
  } else {
    await notify(target.id, {
      type: "permintaan_baru",
      title: "Ada permintaan tugas untuk Anda",
      body: `${me.name} meminta: ${title}`,
      link: `/permintaan/${result.requestId}`,
    });
    const atasanUsers = await getUsersInPositions(result.atasanPositionIds);
    await notifyMany(
      atasanUsers.map((u) => u.id).filter((uid) => uid !== me.id),
      {
        type: "perlu_acc",
        title: "Permintaan perlu persetujuan Anda",
        body: `${me.name} → ${target.name}: ${title}`,
        link: `/permintaan/${result.requestId}`,
      },
    );
    revalidatePath("/permintaan");
    revalidatePath("/persetujuan");
    redirectTo = `/permintaan/${result.requestId}?baru=1`;
  }

  redirect(redirectTo);
}

/** Aksi status tugas (mulai, ajukan selesai, setujui, kembalikan, hapus). */
export async function taskAction(formData: FormData): Promise<void> {
  const me = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");
  const action = String(formData.get("action") ?? "");
  const returnNote = String(formData.get("returnNote") ?? "").trim() || null;

  const task = await db.query.tasks.findFirst({ where: eq(tasks.id, taskId) });
  if (!task) return;

  const isAssignee = task.assigneeId === me.id;
  const isGiver = task.giverId === me.id;
  const isSelf = task.giverId === task.assigneeId;
  const now = new Date();

  if (action === "mulai" && isAssignee && task.status === "belum") {
    await db.update(tasks).set({ status: "dikerjakan", updatedAt: now }).where(eq(tasks.id, taskId));
  } else if (action === "ajukan_selesai" && isAssignee && task.status === "dikerjakan") {
    if (isSelf) {
      await db
        .update(tasks)
        .set({ status: "selesai", completedAt: now, updatedAt: now })
        .where(eq(tasks.id, taskId));
    } else {
      await db.update(tasks).set({ status: "menunggu_acc", updatedAt: now }).where(eq(tasks.id, taskId));
      await notify(task.giverId, {
        type: "tugas_menunggu_acc",
        title: "Tugas menunggu persetujuan selesai",
        body: `${me.name}: ${task.title}`,
        link: `/tugas/${taskId}`,
      });
    }
  } else if (action === "setujui_selesai" && isGiver && task.status === "menunggu_acc") {
    await db
      .update(tasks)
      .set({ status: "selesai", completedAt: now, updatedAt: now, returnNote: null })
      .where(eq(tasks.id, taskId));
    if (!isSelf) {
      await notify(task.assigneeId, {
        type: "tugas_disetujui",
        title: "Tugas Anda disetujui selesai 🎉",
        body: task.title,
        link: `/tugas/${taskId}`,
      });
    }
  } else if (action === "kembalikan" && isGiver && task.status === "menunggu_acc") {
    await db
      .update(tasks)
      .set({ status: "dikerjakan", returnNote, updatedAt: now })
      .where(eq(tasks.id, taskId));
    if (!isSelf) {
      await notify(task.assigneeId, {
        type: "tugas_dikembalikan",
        title: "Tugas dikembalikan untuk diperbaiki",
        body: returnNote ?? task.title,
        link: `/tugas/${taskId}`,
      });
    }
  } else if (action === "hapus" && isGiver) {
    await db.delete(tasks).where(eq(tasks.id, taskId));
    refreshTaskViews();
    redirect("/saya-beri");
  }

  revalidatePath(`/tugas/${taskId}`);
  refreshTaskViews();
}
