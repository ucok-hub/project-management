import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (WASM Postgres untuk dev lokal) tidak boleh di-bundle oleh Turbopack.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Indikator dev bawaan Next.js (ikon "N" pojok kiri-bawah) tumpang tindih dengan
  // sidebar baru — matikan saja; tidak muncul di production sama sekali.
  devIndicators: false,
};

export default nextConfig;
