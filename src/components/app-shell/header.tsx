"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { FeatureSearch } from "@/components/app-shell/feature-search";
import { BackButton } from "@/components/app-shell/back-button";
import { useHeaderBackContext } from "@/components/app-shell/header-back";
import type { CurrentUser } from "@/lib/auth";

function firstName(name: string): string {
  return name.replace(/^(Pak|Bu|Ibu|Bpk)\s+/i, "").split(/\s+/)[0];
}

export function Header({
  user,
  unread,
  canMonitor,
}: {
  user: CurrentUser;
  unread: number;
  canMonitor: boolean;
}) {
  const { back } = useHeaderBackContext();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        {back ? (
          <BackButton title={back.title} fallbackHref={back.fallbackHref} />
        ) : (
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Halo,</p>
            <p className="truncate text-base font-bold text-slate-900">
              {firstName(user.name)}{" "}
              <span className="font-medium text-slate-400">· {user.position.name}</span>
            </p>
          </div>
        )}
        <div className="flex items-center gap-1">
          <FeatureSearch canMonitor={canMonitor} isAdmin={user.isAdmin} />
          <Link
            href="/notifikasi"
            aria-label="Notifikasi"
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <Bell className="h-6 w-6" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <Link href="/profil" aria-label="Profil" className="rounded-full">
            <Avatar name={user.name} src={user.avatarUrl} />
          </Link>
        </div>
      </div>
    </header>
  );
}
