import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "DIL — Manajemen Tugas",
  description: "Aplikasi tugas internal Delta Indonesia Laboratory. Sederhana, jelas, mudah dipakai.",
  applicationName: "DIL Tugas",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "DIL Tugas" },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Jalankan fungsi Vercel sedekat mungkin dengan database Supabase (Mumbai) —
// tiap query DB jadi ~10-30ms alih-alih ~250ms+ lintas benua. Ini pengaruh
// terbesar terhadap kecepatan aplikasi.
export const preferredRegion = "bom1";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full">
        {children}
        <PwaRegister />
        <SpeedInsights />
      </body>
    </html>
  );
}
