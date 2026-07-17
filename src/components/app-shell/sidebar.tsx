"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Plus,
  BadgeCheck,
  Send,
  Inbox,
  BarChart3,
  Users,
  User,
  LogOut,
  FlaskConical,
  Megaphone,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/auth";
import {
  isNavItemActive,
  matchHubHref,
  readLastSectionCookie,
  resolveEffectivePathname,
  type TrackedHubHref,
} from "@/lib/section-tracker";

export function Sidebar({
  user,
  pendingApprovals,
  canMonitor,
  lastSection,
  hasUnseenChangelog,
}: {
  user: CurrentUser;
  pendingApprovals: number;
  canMonitor: boolean;
  lastSection: TrackedHubHref | null;
  hasUnseenChangelog?: boolean;
}) {
  const pathname = usePathname();
  const cookieLastSection =
    typeof document === "undefined" ? lastSection : readLastSectionCookie(document.cookie) ?? lastSection;
  const effectivePathname = resolveEffectivePathname(
    pathname,
    matchHubHref(pathname) ?? cookieLastSection,
  );

  const items = [
    { href: "/beranda", label: "Beranda", Icon: Home },
    { href: "/tugas-saya", label: "Tugas Saya", Icon: ClipboardList },
    { href: "/saya-beri", label: "Tugas yang Saya Beri", Icon: Send },
    { href: "/persetujuan", label: "Perlu Persetujuan", Icon: BadgeCheck, badge: pendingApprovals },
    { href: "/permintaan", label: "Papan Permintaan", Icon: Inbox },
    ...(canMonitor ? [{ href: "/pantauan", label: "Pantauan", Icon: BarChart3 }] : []),
    ...(user.isAdmin ? [{ href: "/admin", label: "Kelola Pengguna", Icon: Users }] : []),
    {
      href: "/pembaruan",
      label: "Pembaruan",
      Icon: Megaphone,
      dot: !!hasUnseenChangelog,
    },
    { href: "/profil", label: "Profil & Password", Icon: User },
  ];

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
          <FlaskConical className="h-5 w-5" />
        </div>
        <p className="text-sm font-bold leading-tight text-slate-900">
          Delta Indonesia
          <br />
          Laboratory
        </p>
      </div>

      <Link
        href="/buat"
        className="mx-4 mb-4 flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
      >
        <Plus className="h-4 w-4" /> Buat Tugas
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {items.map((item) => {
          const { href, label, Icon } = item;
          const badge = "badge" in item ? item.badge : undefined;
          const dot = "dot" in item ? item.dot : false;
          const active = isNavItemActive(href, effectivePathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active && "stroke-[2.5]")} />
              <span className="flex-1 truncate">{label}</span>
              {!!badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
              {dot && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <Link
          href="/profil"
          className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50"
        >
          <Avatar name={user.name} src={user.avatarUrl} size="sm" presence="online" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.position.name}</p>
          </div>
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
