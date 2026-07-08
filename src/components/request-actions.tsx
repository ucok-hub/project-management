"use client";

import { Check, X, Ban } from "lucide-react";
import { decideRequest, cancelRequest } from "@/lib/actions/requests";
import { SubmitButton } from "@/components/ui/submit-button";

export function RequestActions({
  requestId,
  canAct,
  isRequester,
  roleLabel,
}: {
  requestId: string;
  canAct: boolean;
  isRequester: boolean;
  roleLabel?: string;
}) {
  return (
    <div className="space-y-3">
      {canAct && (
        <div className="space-y-2.5 rounded-2xl border border-blue-200 bg-blue-50 p-3">
          {roleLabel && (
            <p className="text-center text-sm font-medium text-blue-800">{roleLabel}</p>
          )}
          <div className="flex gap-2">
            <form action={decideRequest} className="flex-1">
              <input type="hidden" name="requestId" value={requestId} />
              <input type="hidden" name="decision" value="setuju" />
              <SubmitButton variant="success" size="lg" className="w-full" pendingText="Memproses…">
                <Check className="h-5 w-5" /> Setujui
              </SubmitButton>
            </form>
            <form action={decideRequest} className="flex-1">
              <input type="hidden" name="requestId" value={requestId} />
              <input type="hidden" name="decision" value="tolak" />
              <SubmitButton
                variant="danger"
                size="lg"
                className="w-full"
                confirm="Tolak permintaan ini?"
                pendingText="Memproses…"
              >
                <X className="h-5 w-5" /> Tolak
              </SubmitButton>
            </form>
          </div>
        </div>
      )}

      {isRequester && (
        <form action={cancelRequest}>
          <input type="hidden" name="requestId" value={requestId} />
          <SubmitButton
            variant="ghost"
            size="sm"
            className="w-full text-red-600 hover:bg-red-50"
            confirm="Batalkan permintaan ini?"
            pendingText="Membatalkan…"
          >
            <Ban className="h-4 w-4" /> Batalkan permintaan
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
