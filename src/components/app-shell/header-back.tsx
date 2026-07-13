"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type BackConfig = { title: string; fallbackHref: string } | null;

const HeaderBackContext = createContext<{
  back: BackConfig;
  setBack: (back: BackConfig) => void;
} | null>(null);

export function HeaderBackProvider({ children }: { children: ReactNode }) {
  const [back, setBack] = useState<BackConfig>(null);
  return <HeaderBackContext.Provider value={{ back, setBack }}>{children}</HeaderBackContext.Provider>;
}

export function useHeaderBackContext() {
  const context = useContext(HeaderBackContext);
  if (!context) throw new Error("useHeaderBackContext dipakai di luar HeaderBackProvider");
  return context;
}

/** Mendaftarkan konfigurasi tombol kembali halaman ke header global. */
export function SetHeaderBack({ title, fallbackHref }: { title: string; fallbackHref: string }) {
  const { setBack } = useHeaderBackContext();

  useEffect(() => {
    setBack({ title, fallbackHref });
    return () => setBack(null);
  }, [title, fallbackHref, setBack]);

  return null;
}
