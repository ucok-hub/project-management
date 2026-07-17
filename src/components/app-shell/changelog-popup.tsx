"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Megaphone } from "lucide-react";
import { dismissChangelogPopup } from "@/lib/actions/changelogs";

export function ChangelogPopup({
  title,
  body,
  version,
}: {
  title: string;
  body: string;
  version: string | null;
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  function close() {
    setOpen(false);
    dismissChangelogPopup();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <Megaphone className="h-6 w-6" />
          </div>
          <button
            onClick={close}
            aria-label="Tutup"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-teal-700">
          Ada pembaruan{version ? ` · v${version}` : ""}
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm text-slate-600">{body}</p>
        <div className="mt-5 flex gap-2.5">
          <button
            onClick={close}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Nanti saja
          </button>
          <Link
            href="/pembaruan"
            onClick={close}
            className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-700"
          >
            Lihat Semua
          </Link>
        </div>
      </div>
    </div>
  );
}
