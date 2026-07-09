import type { ReactNode } from "react";

/** Daftar kartu: menumpuk 1 kolom di HP, berjajar 2-3 kolom di layar lebar. */
export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 xl:grid-cols-3">
      {children}
    </div>
  );
}
