import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "MediaLab — Manajemen Tugas",
  description: "Aplikasi tugas internal MediaLab. Sederhana, jelas, mudah dipakai.",
  applicationName: "MediaLab Tugas",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MediaLab Tugas" },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

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
