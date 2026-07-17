import { LogOut, Terminal, Database, Users, Megaphone, TerminalSquare } from "lucide-react";
import { requireDev } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { getSystemInfo, getRowCounts } from "@/lib/data/dev";
import { getAllUsers } from "@/lib/data/users";
import { LoginAsList } from "@/components/dev/login-as-list";
import { SqlConsole } from "@/components/dev/sql-console";
import { ChangelogPublishForm } from "@/components/dev/changelog-publish-form";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function DevPanelPage() {
  await requireDev();
  const [info, counts, users] = await Promise.all([getSystemInfo(), getRowCounts(), getAllUsers()]);

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <Terminal className="h-6 w-6 text-emerald-400" />
          <div>
            <p className="font-bold text-white">Panel Developer</p>
            <p className="text-xs text-slate-500">Halaman tersembunyi — tidak tertaut dari menu mana pun.</p>
          </div>
        </div>
        <form action={logoutAction}>
          <SubmitButton variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-800" pendingText="…">
            <LogOut className="h-4 w-4" /> Keluar
          </SubmitButton>
        </form>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        {/* Info Sistem */}
        <Section icon={Database} title="Info Sistem">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <Row k="Lingkungan (env)" v={info.env} />
            <Row k="Region Vercel" v={info.region} />
            <Row k="Git commit" v={info.gitCommit} />
            <Row k="Git branch" v={info.gitBranch} />
            <Row k="Node.js" v={info.nodeVersion} />
            <Row k="Sumber DB" v={info.usingSupabase ? "Supabase (DATABASE_URL diset)" : "PGlite lokal"} />
            <Row
              k="Koneksi DB"
              v={info.dbOk ? `Sehat (${info.dbLatencyMs}ms)` : `Gagal: ${info.dbError}`}
              ok={info.dbOk}
            />
            <Row k="Jam server (mentah)" v={info.serverTimeRaw} />
            <Row k="Jam WIB (dipakai app)" v={info.wibTimeNow} />
          </dl>
        </Section>

        {/* Alat Data */}
        <Section icon={TerminalSquare} title="Alat Data">
          <p className="mb-3 text-xs text-slate-500">
            Sengaja hanya baca (read-only) — tombol reset/seed destruktif TIDAK disediakan di sini
            karena berisiko tinggi kalau dijalankan tanpa sengaja di production. Untuk operasi yang
            mengubah data, tetap minta dijalankan langsung dengan hati-hati.
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <Count label="Pengguna" value={counts.users} />
            <Count label="Tugas" value={counts.tasks} />
            <Count label="Permintaan" value={counts.requests} />
            <Count label="Komentar" value={counts.comments} />
            <Count label="Notifikasi" value={counts.notifications} />
            <Count label="Changelog" value={counts.changelogs} />
          </div>
        </Section>

        {/* Login-as */}
        <Section icon={Users} title="Login sebagai Pengguna Lain">
          <LoginAsList users={users} />
        </Section>

        {/* Changelog */}
        <Section icon={Megaphone} title="Terbitkan Changelog">
          <ChangelogPublishForm />
        </Section>

        {/* SQL Console */}
        <Section icon={Terminal} title="Konsol SQL (read-only)">
          <SqlConsole />
        </Section>
      </main>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-3 flex items-center gap-2 font-bold text-white">
        <Icon className="h-4 w-4 text-emerald-400" /> {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ k, v, ok }: { k: string; v: string; ok?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-slate-800 py-1.5 sm:justify-start sm:gap-2">
      <dt className="text-slate-500">{k}</dt>
      <dd className={ok === false ? "font-mono text-red-400" : "font-mono text-slate-200"}>{v}</dd>
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
