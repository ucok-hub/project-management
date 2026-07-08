import Link from "next/link";
import {
  Send,
  Inbox,
  BarChart3,
  Users,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { canMonitor } from "@/lib/roles";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function LainnyaPage() {
  const me = await requireUser();
  const showMonitor = await canMonitor(me);

  const items = [
    { href: "/saya-beri", label: "Tugas yang Saya Beri", icon: Send },
    { href: "/permintaan", label: "Papan Permintaan", icon: Inbox },
    ...(showMonitor ? [{ href: "/pantauan", label: "Pantauan", icon: BarChart3 }] : []),
    ...(me.isAdmin ? [{ href: "/admin", label: "Kelola Pengguna", icon: Users }] : []),
    { href: "/profil", label: "Profil & Password", icon: User },
  ];

  return (
    <div className="space-y-5 pb-4">
      <h1 className="text-xl font-bold text-slate-900">Lainnya</h1>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {items.map(({ href, label, icon: Icon }, i) => (
          <Link
            key={href}
            href={href}
            className={cnRow(i === items.length - 1)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Icon className="h-5 w-5" />
            </span>
            <span className="flex-1 font-semibold text-slate-800">{label}</span>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </Link>
        ))}
      </div>

      <form action={logoutAction}>
        <SubmitButton variant="secondary" size="lg" className="w-full text-red-600" pendingText="Keluar…">
          <LogOut className="h-5 w-5" /> Keluar
        </SubmitButton>
      </form>

      <p className="text-center text-xs text-slate-400">MediaLab · Manajemen Tugas</p>
    </div>
  );
}

function cnRow(last: boolean): string {
  return `flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 ${
    last ? "" : "border-b border-slate-100"
  }`;
}
