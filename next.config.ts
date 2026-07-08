import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (WASM Postgres untuk dev lokal) tidak boleh di-bundle oleh Turbopack.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
