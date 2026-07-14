import "server-only";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { newId } from "@/lib/utils";

const AVATAR_DIR = process.env.AVATAR_DIR ?? "./.data/avatars";
const LOCAL_PREFIX = "/api/avatars/";
const VALID_FILENAME = /^[a-f0-9-]+\.jpg$/i;
export class AvatarStorageConfigurationError extends Error {
  constructor() {
    super("BLOB_READ_WRITE_TOKEN belum diset untuk penyimpanan foto production.");
    this.name = "AvatarStorageConfigurationError";
  }
}

function remoteToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new AvatarStorageConfigurationError();
  return token;
}


function usesRemoteStorage(): boolean {
  return !!process.env.DATABASE_URL;
}

export async function saveAvatar(blob: Blob): Promise<string> {
  const filename = `${newId()}.jpg`;

  if (usesRemoteStorage()) {
    const token = remoteToken();
    const result = await put(`avatars/${filename}`, blob, {
      access: "public",
      contentType: "image/jpeg",
      token,
    });
    return result.url;
  }

  await mkdir(AVATAR_DIR, { recursive: true });
  const buffer = Buffer.from(await blob.arrayBuffer());
  await writeFile(path.join(AVATAR_DIR, filename), buffer);
  return `${LOCAL_PREFIX}${filename}`;
}

export async function deleteAvatar(url: string): Promise<void> {
  if (usesRemoteStorage()) {
    const token = remoteToken();
    await del(url, { token });
    return;
  }
  if (!url.startsWith(LOCAL_PREFIX)) return;
  const filename = url.slice(LOCAL_PREFIX.length);
  if (!VALID_FILENAME.test(filename)) return;
  await unlink(path.join(AVATAR_DIR, filename)).catch(() => undefined);
}
