"use client";

import { useActionState } from "react";
import { runReadOnlyQuery, type SqlConsoleState } from "@/lib/actions/dev";
import { SubmitButton } from "@/components/ui/submit-button";

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function SqlConsole() {
  const [state, formAction] = useActionState<SqlConsoleState, FormData>(runReadOnlyQuery, {});

  return (
    <div className="space-y-3">
      <form action={formAction} className="space-y-2.5">
        <textarea
          name="query"
          rows={4}
          required
          placeholder="select * from tasks order by created_at desc limit 20"
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-sm text-emerald-300 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        />
        <SubmitButton size="sm" pendingText="Menjalankan…">
          Jalankan (read-only)
        </SubmitButton>
      </form>

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      {state.rows && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-500">
            {state.rowCount} baris · {state.durationMs}ms — ditampilkan maks. 200 baris.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {state.columns?.map((c) => (
                    <th key={c} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-600">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.rows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    {state.columns?.map((c) => (
                      <td key={c} className="whitespace-nowrap px-3 py-2 text-slate-700">
                        {formatCell(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
