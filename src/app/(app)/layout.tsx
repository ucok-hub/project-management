import { requireUser } from "@/lib/auth";
import { getInboxCounts } from "@/lib/data/inbox";
import { canMonitor } from "@/lib/roles";
import { Header } from "@/components/app-shell/header";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { Sidebar } from "@/components/app-shell/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [counts, showMonitor] = await Promise.all([getInboxCounts(user), canMonitor(user)]);

  return (
    <div className="min-h-dvh bg-slate-100 lg:flex">
      <Sidebar user={user} pendingApprovals={counts.pendingApprovals} canMonitor={showMonitor} />

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col lg:mx-0 lg:max-w-none">
        <Header user={user} unread={counts.unreadNotifications} />
        <main className="flex-1 px-4 pt-4 pb-safe lg:px-10 lg:pt-8">
          <div className="lg:mx-auto lg:max-w-6xl">{children}</div>
        </main>
        <BottomNav pendingApprovals={counts.pendingApprovals} />
      </div>
    </div>
  );
}
