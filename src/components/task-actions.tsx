"use client";

import { useState } from "react";
import { Play, CheckCircle2, Undo2, Trash2, X } from "lucide-react";
import { taskAction } from "@/lib/actions/tasks";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/form";
import type { TaskStatus } from "@/lib/format";

export function TaskActions({
  taskId,
  status,
  isAssignee,
  isGiver,
  isSelf,
  giverName,
}: {
  taskId: string;
  status: TaskStatus;
  isAssignee: boolean;
  isGiver: boolean;
  isSelf: boolean;
  giverName: string;
}) {
  const [showReturn, setShowReturn] = useState(false);

  return (
    <div className="space-y-3">
      {/* Aksi pelaksana */}
      {isAssignee && status === "belum" && (
        <form action={taskAction}>
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="action" value="mulai" />
          <SubmitButton variant="primary" size="lg" className="w-full" pendingText="Memproses…">
            <Play className="h-5 w-5" /> Mulai Kerjakan
          </SubmitButton>
        </form>
      )}

      {isAssignee && status === "dikerjakan" && (
        <form action={taskAction}>
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="action" value="ajukan_selesai" />
          <SubmitButton variant="success" size="lg" className="w-full" pendingText="Memproses…">
            <CheckCircle2 className="h-5 w-5" />
            {isSelf ? "Tandai Selesai" : "Ajukan Selesai"}
          </SubmitButton>
        </form>
      )}

      {isAssignee && !isGiver && status === "menunggu_acc" && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-medium text-blue-800">
          ⏳ Menunggu <b>{giverName}</b> menyetujui bahwa tugas ini selesai.
        </div>
      )}

      {/* Aksi pemberi tugas: ACC selesai */}
      {isGiver && !isSelf && status === "menunggu_acc" && !showReturn && (
        <div className="space-y-2.5">
          <form action={taskAction}>
            <input type="hidden" name="taskId" value={taskId} />
            <input type="hidden" name="action" value="setujui_selesai" />
            <SubmitButton variant="success" size="lg" className="w-full" pendingText="Memproses…">
              <CheckCircle2 className="h-5 w-5" /> Setujui Selesai
            </SubmitButton>
          </form>
          <button
            type="button"
            onClick={() => setShowReturn(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Undo2 className="h-5 w-5" /> Kembalikan untuk diperbaiki
          </button>
        </div>
      )}

      {isGiver && !isSelf && status === "menunggu_acc" && showReturn && (
        <form action={taskAction} className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3">
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="action" value="kembalikan" />
          <label className="block text-sm font-semibold text-slate-700">
            Alasan / yang perlu diperbaiki
          </label>
          <Textarea name="returnNote" placeholder="mis. Hasil kurang lengkap, mohon dicek ulang." required />
          <div className="flex gap-2">
            <SubmitButton variant="danger" size="md" className="flex-1" pendingText="Mengirim…">
              <Undo2 className="h-5 w-5" /> Kembalikan
            </SubmitButton>
            <button
              type="button"
              onClick={() => setShowReturn(false)}
              className="flex items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-600 hover:bg-slate-50"
            >
              <X className="h-5 w-5" /> Batal
            </button>
          </div>
        </form>
      )}

      {/* Hapus (pemberi tugas, selama belum selesai) */}
      {isGiver && status !== "selesai" && (
        <form action={taskAction}>
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="action" value="hapus" />
          <SubmitButton
            variant="ghost"
            size="sm"
            className="w-full text-red-600 hover:bg-red-50"
            confirm="Hapus tugas ini? Tindakan ini tidak bisa dibatalkan."
            pendingText="Menghapus…"
          >
            <Trash2 className="h-4 w-4" /> Hapus tugas
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
