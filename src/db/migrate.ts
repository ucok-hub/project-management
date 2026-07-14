import "dotenv/config";
import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { migrate as migratePg } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const MIGRATIONS_FOLDER = "./drizzle";

async function main() {
  const url = process.env.DATABASE_URL;
  if (process.env.VERCEL) {
    if (!url) {
      throw new Error("DATABASE_URL wajib diset di environment Vercel.");
    }
    if (!process.env.AUTH_SECRET) {
      throw new Error("AUTH_SECRET wajib diset di environment Vercel.");
    }
  }

  if (url) {
    const client = postgres(url, { max: 1, prepare: false });
    await migratePg(drizzlePg(client), { migrationsFolder: MIGRATIONS_FOLDER });
    await client.end();
  } else {
    const dir = process.env.PGLITE_DIR ?? "./.data/pglite";
    mkdirSync(dir, { recursive: true });
    const client = new PGlite(dir);
    await migratePglite(drizzlePglite(client), { migrationsFolder: MIGRATIONS_FOLDER });
    await client.close();
  }
  console.log("✅ Migrasi database selesai.");
}

main().catch((err) => {
  console.error("❌ Migrasi gagal:", err);
  process.exit(1);
});
