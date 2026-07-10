"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks, comments } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { newId } from "@/lib/utils";

/** Tambah komentar pada tugas. Hanya pemberi & penerima tugas yang boleh. */
export async function addTaskComment(formData: FormData): Promise<void> {
  const me = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const task = await db.query.tasks.findFirst({ where: eq(tasks.id, taskId) });
  if (!task) return;

  const isGiver = task.giverId === me.id;
  const isAssignee = task.assigneeId === me.id;
  if (!isGiver && !isAssignee) return;

  await db.insert(comments).values({ id: newId(), taskId, authorId: me.id, body });

  const otherPartyId = isGiver ? task.assigneeId : task.giverId;
  if (otherPartyId !== me.id) {
    await notify(otherPartyId, {
      type: "komentar_baru",
      title: "Komentar baru di tugas",
      body: `${me.name}: ${body}`,
      link: `/tugas/${taskId}`,
    });
  }

  revalidatePath(`/tugas/${taskId}`);
}
