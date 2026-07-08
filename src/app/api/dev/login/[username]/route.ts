import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";

// Login cepat untuk PENGEMBANGAN saja (mis. mencoba berbagai peran).
// Dinonaktifkan total di produksi.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }
  const { username } = await params;
  const user = await db.query.users.findFirst({
    where: eq(users.username, username.toLowerCase()),
  });
  if (!user) return new NextResponse(`User "${username}" tidak ditemukan`, { status: 404 });

  await createSession(user.id);
  return NextResponse.redirect(new URL("/beranda", req.url));
}
