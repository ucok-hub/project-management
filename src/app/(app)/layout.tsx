import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { getInboxCounts } from "@/lib/data/inbox";
import { canMonitor } from "@/lib/roles";
import { Header } from "@/components/app-shell/header";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { Sidebar } from "@/components/app-shell/sidebar";
import { HeaderBackProvider } from "@/components/app-shell/header-back";
import { SectionTracker } from "@/components/app-shell/section-tracker";
import { PresenceHeartbeat } from "@/components/app-shell/presence-heartbeat";
import { isTrackedHubHref, LAST_SECTION_COOKIE } from "@/lib/section-tracker";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [counts, showMonitor, cookieStore] = await Promise.all([
    getInboxCounts(user),
    canMonitor(user),
    cookies(),
  ]);
  const rawLastSection = cookieStore.get(LAST_SECTION_COOKIE)?.value;
  const lastSection = isTrackedHubHref(rawLastSection) ? rawLastSection : null;

  return (
    <HeaderBackProvider>
      <div className="min-h-dvh bg-slate-100 lg:flex">
        <SectionTracker />
        <PresenceHeartbeat />
        <Sidebar
          user={user}
          pendingApprovals={counts.pendingApprovals}
          canMonitor={showMonitor}
          lastSection={lastSection}
        />

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col lg:mx-0 lg:max-w-none">
          <Header user={user} unread={counts.unreadNotifications} canMonitor={showMonitor} />
          <main className="flex-1 px-4 pt-4 pb-safe lg:px-10 lg:pt-8">
            <div className="lg:mx-auto lg:max-w-6xl">{children}</div>
          </main>
          <BottomNav pendingApprovals={counts.pendingApprovals} lastSection={lastSection} />
        </div>
      </div>
    </HeaderBackProvider>
  );
}
