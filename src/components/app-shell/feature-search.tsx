"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { searchDestinations } from "@/lib/feature-search";

export function FeatureSearch({
  canMonitor,
  isAdmin,
}: {
  canMonitor: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Pintasan Ctrl+K / Cmd+K (bonus untuk pengguna desktop) + Escape untuk menutup.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = searchDestinations(query, { canMonitor, isAdmin });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Cari fitur"
        className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-0 sm:items-start sm:p-4 sm:pt-24">
          <button
            aria-label="Tutup"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-dvh w-full flex-col bg-white shadow-2xl sm:h-auto sm:max-h-[70vh] sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-center gap-2 border-b border-slate-100 p-4">
              <div className="flex-1">
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder="Cari fitur… mis. 'buat tugas', 'setujui'"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup pencarian"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-400">
                  Tidak ada fitur yang cocok dengan &quot;{query}&quot;.
                </p>
              ) : (
                <ul className="space-y-1">
                  {results.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-800 hover:bg-slate-50 active:bg-slate-100"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="font-medium">{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
