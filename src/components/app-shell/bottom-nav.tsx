"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Plus, BadgeCheck, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav({ pendingApprovals }: { pendingApprovals: number }) {
  const pathname = usePathname();

  const items = [
    { href: "/beranda", label: "Beranda", Icon: Home },
    { href: "/tugas-saya", label: "Tugas Saya", Icon: ClipboardList },
    { href: "/buat", label: "Buat", Icon: Plus, center: true },
    { href: "/persetujuan", label: "Setujui", Icon: BadgeCheck, badge: pendingApprovals },
    { href: "/lainnya", label: "Lainnya", Icon: LayoutGrid },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-lg -translate-x-1/2 border-t border-slate-200 bg-white bottom-safe">
      <ul className="flex items-stretch justify-around px-1 py-1.5">
        {items.map(({ href, label, Icon, center, badge }) => {
          const active = href === "/beranda" ? pathname === href : pathname.startsWith(href);
          if (center) {
            return (
              <li key={href} className="flex flex-1 items-center justify-center">
                <Link
                  href={href}
                  aria-label={label}
                  className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-600/30 active:bg-teal-700"
                >
                  <Icon className="h-7 w-7" />
                </Link>
              </li>
            );
          }
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium",
                  active ? "text-teal-700" : "text-slate-500",
                )}
              >
                <Icon className={cn("h-6 w-6", active && "stroke-[2.5]")} />
                <span className="truncate">{label}</span>
                {badge != null && badge > 0 && (
                  <span className="absolute right-2 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
