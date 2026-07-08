import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type DB = PgliteDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __medialabDb?: DB;
  __medialabPg?: ReturnType<typeof postgres>;
};

function createDb(): DB {
  const url = process.env.DATABASE_URL;
  if (url) {
    // Produksi / Supabase.
    const client = globalForDb.__medialabPg ?? postgres(url, { prepare: false });
    if (process.env.NODE_ENV !== "production") globalForDb.__medialabPg = client;
    return drizzlePg(client, { schema }) as unknown as DB;
  }
  // Dev lokal: Postgres in-process (PGlite), tersimpan ke folder.
  const dir = process.env.PGLITE_DIR ?? "./.data/pglite";
  mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  return drizzlePglite(client, { schema });
}

function getDb(): DB {
  return (globalForDb.__medialabDb ??= createDb());
}

/**
 * Koneksi database. Dibuat malas (lazy) saat pertama kali dipakai, bukan saat
 * import — supaya proses build tidak membuka koneksi PGlite yang tidak perlu.
 */
export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
}) as DB;

export { schema };
