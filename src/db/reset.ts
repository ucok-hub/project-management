import "dotenv/config";
import { rmSync, existsSync } from "node:fs";

// Hanya untuk dev lokal (PGlite). Menghapus folder data agar dibuat ulang bersih.
if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL diset — reset dilewati (jangan hapus DB produksi lewat skrip ini).");
  process.exit(0);
}

const dir = process.env.PGLITE_DIR ?? "./.data/pglite";
if (existsSync(dir)) {
  rmSync(dir, { recursive: true, force: true });
  console.log(`🗑️  Folder data '${dir}' dihapus.`);
} else {
  console.log(`Folder data '${dir}' belum ada, tidak ada yang dihapus.`);
}
