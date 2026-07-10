"use client";

import { useRef } from "react";
import { Send } from "lucide-react";
import { addTaskComment } from "@/lib/actions/comments";
import { SubmitButton } from "@/components/ui/submit-button";

export function CommentForm({ taskId }: { taskId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addTaskComment(formData);
        formRef.current?.reset();
      }}
      className="flex items-end gap-2"
    >
      <input type="hidden" name="taskId" value={taskId} />
      <textarea
        name="body"
        required
        maxLength={1000}
        rows={2}
        placeholder="Tulis komentar atau keterangan..."
        className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
      />
      <SubmitButton size="md" pendingText="…">
        <Send className="h-4 w-4" /> Kirim
      </SubmitButton>
    </form>
  );
}
