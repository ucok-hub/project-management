import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, FileText, CheckCircle2, Check, X, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getRequestById, userCanActOnRequest } from "@/lib/data/requests";
import { getActiveUsers } from "@/lib/data/users";
import { getAllPositions } from "@/lib/data/positions";
import { RequestActions } from "@/components/request-actions";
import { PresenceAvatar } from "@/components/presence/presence-avatar";
import { Badge } from "@/components/ui/badge";
import { SetHeaderBack } from "@/components/app-shell/header-back";
import { REQUEST_STATUS, formatDeadline, formatDateTime, type RequestStatus } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ baru?: string }>;
}) {
  const { id } = await params;
  const { baru } = await searchParams;
  const me = await requireUser();
  const req = await getRequestById(id);
  if (!req) notFound();

  const users = await getActiveUsers();
  const positions = await getAllPositions();
  const posName = new Map(positions.map((p) => [p.id, p.name]));
  const byId = new Map(users.map((u) => [u.id, u]));
  const holdersByPos = new Map<string, string[]>();
  for (const u of users) {
    const a = holdersByPos.get(u.positionId) ?? [];
    a.push(u.name);
    holdersByPos.set(u.positionId, a);
  }

  const rs = REQUEST_STATUS[req.status as RequestStatus];
  const canAct = userCanActOnRequest(req, me);
  const isRequester = req.requesterId === me.id;

  const myPending = req.approvals.filter(
    (a) =>
      a.decision === "menunggu" &&
      ((a.role === "diminta" && a.userId === me.id) ||
        (a.role === "atasan" && a.positionId === me.positionId)),
  );
  const roleLabel = myPending.some((a) => a.role === "diminta")
    ? "Anda diminta mengerjakan tugas ini."
    : myPending.some((a) => a.role === "atasan")
      ? `Anda menyetujui sebagai ${me.position.name}.`
      : undefined;

  return (
    <div className="space-y-4 pb-4 lg:mx-auto lg:max-w-xl">
      <SetHeaderBack title="Detail Permintaan" fallbackHref="/permintaan" />

      {baru === "1" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5" /> Permintaan terkirim. Menunggu persetujuan.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Badge className={cn("text-sm", rs.badge)}>{rs.label}</Badge>
        <h1 className="mt-3 text-xl font-bold leading-snug text-slate-900">{req.title}</h1>

        <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500">
          <CalendarClock className="h-4 w-4" />
          Batas waktu: {formatDeadline(req.deadline)}
        </div>

        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <PartyRow label="Peminta" userId={req.requesterId} name={req.requester.name} sub={req.requester.position.name} avatarUrl={req.requester.avatarUrl} />
          <PartyRow label="Diminta" userId={req.targetId} name={req.target.name} sub={req.target.position.name} avatarUrl={req.target.avatarUrl} />
        </div>

        {req.note && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            <p className="mb-1 flex items-center gap-1.5 font-semibold text-slate-500">
              <FileText className="h-4 w-4" /> Catatan
            </p>
            <p className="whitespace-pre-wrap">{req.note}</p>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-400">Dibuat {formatDateTime(req.createdAt)}</p>
      </div>

      {/* Daftar persetujuan */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold text-slate-900">Persetujuan diperlukan</h2>
        <ul className="space-y-2.5">
          {req.approvals.map((a) => {
            const isDiminta = a.role === "diminta";
            const label = isDiminta ? req.target.name : (posName.get(a.positionId!) ?? a.positionId!);
            const holders = isDiminta ? null : holdersByPos.get(a.positionId!) ?? [];
            const decidedByName = a.decidedById ? byId.get(a.decidedById)?.name : null;
            const mine =
              (isDiminta && a.userId === me.id) ||
              (a.role === "atasan" && a.positionId === me.positionId);
            return (
              <li key={a.id} className="flex items-start gap-3">
                <DecisionIcon decision={a.decision} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">
                    {label}
                    {mine && <span className="ml-1 text-xs font-bold text-blue-600">(Anda)</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isDiminta ? "Yang diminta" : "Atasan"}
                    {holders && holders.length > 0 && ` · ${holders.join(", ")}`}
                  </p>
                  <p className="mt-0.5 text-xs">
                    <DecisionText decision={a.decision} by={decidedByName} />
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <RequestActions
        requestId={req.id}
        canAct={canAct}
        isRequester={isRequester && req.status === "menunggu"}
        roleLabel={roleLabel}
      />
    </div>
  );
}

function DecisionIcon({ decision }: { decision: string }) {
  if (decision === "setuju")
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="h-4 w-4" />
      </span>
    );
  if (decision === "tolak")
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
        <X className="h-4 w-4" />
      </span>
    );
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <Clock className="h-4 w-4" />
    </span>
  );
}

function DecisionText({ decision, by }: { decision: string; by?: string | null }) {
  if (decision === "setuju")
    return <span className="font-medium text-emerald-600">Sudah setuju{by ? ` — ${by}` : ""}</span>;
  if (decision === "tolak")
    return <span className="font-medium text-red-600">Menolak{by ? ` — ${by}` : ""}</span>;
  return <span className="text-slate-400">Menunggu</span>;
}

function PartyRow({
  label,
  userId,
  name,
  sub,
  avatarUrl,
}: {
  label: string;
  userId: string;
  name: string;
  sub: string;
  avatarUrl: string | null;
}) {
  return (
    <Link href={`/pengguna/${userId}`} className="flex items-center gap-3">
      <PresenceAvatar userId={userId} name={name} src={avatarUrl} size="sm" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate font-semibold text-slate-800">
          {name} <span className="font-normal text-slate-400">· {sub}</span>
        </p>
      </div>
    </Link>
  );
}
