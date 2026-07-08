"use client";

import { useMemo, useState, useActionState } from "react";
import { Send, CheckCircle2, Clock, User } from "lucide-react";
import { createTaskOrRequest, type CreateState } from "@/lib/actions/tasks";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { buttonClass } from "@/components/ui/button";
import { buildPositionMap, classifyAssignment, computeApprovers } from "@/lib/permissions";

type UserLite = {
  id: string;
  name: string;
  positionId: string;
  positionName: string;
  positionSort: number;
};
type PositionLite = { id: string; parentId: string | null; name: string; sort: number };

type Preview =
  | { kind: "self" }
  | { kind: "langsung"; targetName: string }
  | { kind: "permintaan"; approvers: string[] };

export function CreateForm({
  me,
  users,
  positions,
}: {
  me: { id: string; positionId: string };
  users: UserLite[];
  positions: PositionLite[];
}) {
  const [state, formAction, pending] = useActionState<CreateState, FormData>(
    createTaskOrRequest,
    {},
  );
  const [assigneeId, setAssigneeId] = useState("");

  const map = useMemo(() => buildPositionMap(positions), [positions]);
  const positionName = useMemo(
    () => new Map(positions.map((p) => [p.id, p.name])),
    [positions],
  );
  const usersByPosition = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const u of users) {
      const a = m.get(u.positionId) ?? [];
      a.push(u.name);
      m.set(u.positionId, a);
    }
    return m;
  }, [users]);

  const groups = useMemo(() => {
    const byPos = new Map<string, { name: string; sort: number; users: UserLite[] }>();
    for (const u of users) {
      const g = byPos.get(u.positionId) ?? { name: u.positionName, sort: u.positionSort, users: [] };
      g.users.push(u);
      byPos.set(u.positionId, g);
    }
    return [...byPos.values()].sort((a, b) => a.sort - b.sort);
  }, [users]);

  const preview: Preview | null = useMemo(() => {
    if (!assigneeId) return null;
    if (assigneeId === me.id) return { kind: "self" };
    const target = users.find((u) => u.id === assigneeId);
    if (!target) return null;
    const kind = classifyAssignment(map, me.positionId, target.positionId);
    if (kind === "langsung") return { kind: "langsung", targetName: target.name };
    const slots = computeApprovers(map, me.positionId, target.positionId);
    const approvers = slots.map((s) =>
      s.role === "diminta"
        ? `${target.name} (yang diminta)`
        : `${positionName.get(s.positionId) ?? s.positionId}${
            usersByPosition.get(s.positionId)?.length
              ? ` — ${usersByPosition.get(s.positionId)!.join(", ")}`
              : ""
          }`,
    );
    return { kind: "permintaan", approvers };
  }, [assigneeId, map, me, users, positionName, usersByPosition]);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Untuk siapa?" htmlFor="assigneeId" required>
        <Select
          id="assigneeId"
          name="assigneeId"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          required
        >
          <option value="">— Pilih orang —</option>
          {groups.map((g) => (
            <optgroup key={g.name} label={g.name}>
              {g.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                  {u.id === me.id ? " (saya sendiri)" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>

      {preview && <PreviewBanner preview={preview} />}

      <Field label="Judul tugas" htmlFor="title" required>
        <Input
          id="title"
          name="title"
          placeholder="mis. Ambil sampel air titik B"
          required
          maxLength={120}
        />
      </Field>

      <Field label="Catatan" htmlFor="note" hint="Boleh dikosongkan.">
        <Textarea id="note" name="note" placeholder="Keterangan tambahan…" maxLength={1000} />
      </Field>

      <Field label="Batas waktu" htmlFor="deadline" hint="Boleh dikosongkan.">
        <Input id="deadline" name="deadline" type="date" />
      </Field>

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-full")}>
        <Send className="h-5 w-5" />
        {pending ? "Menyimpan…" : "Kirim"}
      </button>
    </form>
  );
}

function PreviewBanner({ preview }: { preview: Preview }) {
  if (preview.kind === "self") {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <User className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
        <span>Ini untuk diri sendiri — langsung jadi tugas Anda.</span>
      </div>
    );
  }
  if (preview.kind === "langsung") {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <span>
          <b>Tugas langsung.</b> Akan langsung masuk ke <b>{preview.targetName}</b> tanpa
          persetujuan.
        </span>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      <div className="flex items-start gap-2.5">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div>
          <p>
            <b>Ini jadi Permintaan</b> (bukan perintah langsung). Perlu disetujui oleh:
          </p>
          <ul className="mt-1.5 list-inside list-disc space-y-0.5">
            {preview.approvers.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
          <p className="mt-1.5 text-blue-700">Setelah semua setuju, baru menjadi tugas.</p>
        </div>
      </div>
    </div>
  );
}
