import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const AVATAR_DIR = process.env.AVATAR_DIR ?? "./.data/avatars";
const VALID_FILENAME = /^[a-f0-9-]+\.jpg$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!VALID_FILENAME.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const buffer = await readFile(path.join(AVATAR_DIR, filename));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
