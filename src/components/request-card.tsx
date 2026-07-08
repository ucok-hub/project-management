import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { REQUEST_STATUS, type RequestStatus } from "@/lib/format";
import type { RequestFull } from "@/lib/data/requests";
import { cn } from "@/lib/utils";

export function RequestCard({ req, needsMe }: { req: RequestFull; needsMe?: boolean }) {
  const rs = REQUEST_STATUS[req.status as RequestStatus];
  const total = req.approvals.length;
  const setuju = req.approvals.filter((a) => a.decision === "setuju").length;

  return (
    <Link
      href={`/permintaan/${req.id}`}
      className={cn(
        "block rounded-2xl border bg-white p-4 shadow-sm transition-colors active:bg-slate-50",
        needsMe ? "border-blue-300 ring-1 ring-blue-200" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold leading-snug text-slate-900">{req.title}</p>
        <Badge className={cn("shrink-0", rs.badge)}>{rs.label}</Badge>
      </div>

      <p className="mt-2 text-sm text-slate-600">
        <b className="font-medium text-slate-800">{req.requester.name}</b>
        <span className="text-slate-400"> minta ke </span>
        <b className="font-medium text-slate-800">{req.target.name}</b>
      </p>

      {req.status === "menunggu" && (
        <p className="mt-1 text-xs font-medium text-slate-500">
          {setuju} dari {total} sudah setuju
        </p>
      )}

      {needsMe && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
          <BadgeCheck className="h-3.5 w-3.5" /> Perlu persetujuan Anda
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      )}
    </Link>
  );
}
