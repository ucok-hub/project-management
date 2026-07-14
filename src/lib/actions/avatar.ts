"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  AvatarStorageConfigurationError,
  deleteAvatar,
  saveAvatar,
} from "@/lib/avatar-storage";

export type AvatarState = { error?: string };

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

async function isJpeg(blob: Blob): Promise<boolean> {
  if (blob.type !== "image/jpeg") return false;
  const signature = new Uint8Array(await blob.slice(0, 3).arrayBuffer());
  return signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
}

export async function uploadAvatarAction(
  _previous: AvatarState,
  formData: FormData,
): Promise<AvatarState> {
  const me = await requireUser();
  const file = formData.get("avatar");
  if (!(file instanceof Blob) || file.size === 0) {
    return { error: "Tidak ada file yang dipilih." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "File terlalu besar." };
  }
  if (!(await isJpeg(file))) {
    return { error: "Hasil foto harus berupa JPEG yang valid." };
  }

  try {
    const previousUrl = me.avatarUrl;
    const url = await saveAvatar(file);
    await db.update(users).set({ avatarUrl: url }).where(eq(users.id, me.id));
    if (previousUrl) await deleteAvatar(previousUrl);

    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    console.error("Gagal menyimpan foto profil:", error);
    if (error instanceof AvatarStorageConfigurationError) {
      return { error: "Penyimpanan foto belum dikonfigurasi. Hubungi admin." };
    }
    return { error: "Foto gagal disimpan. Coba lagi." };
  }
}

export async function deleteAvatarAction(): Promise<void> {
  const me = await requireUser();
  if (me.avatarUrl) {
    await deleteAvatar(me.avatarUrl);
    await db.update(users).set({ avatarUrl: null }).where(eq(users.id, me.id));
  }
  revalidatePath("/", "layout");
}
