import { requireUser } from "@/lib/auth";
import { getInboxCounts } from "@/lib/data/inbox";
import { Header } from "@/components/app-shell/header";
import { BottomNav } from "@/components/app-shell/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const counts = await getInboxCounts(user);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-slate-100">
      <Header user={user} unread={counts.unreadNotifications} />
      <main className="flex-1 px-4 pt-4 pb-safe">{children}</main>
      <BottomNav pendingApprovals={counts.pendingApprovals} />
    </div>
  );
}
