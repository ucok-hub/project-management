"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { hasNavigatedInApp } from "@/lib/section-tracker";

export function BackButton({ title, fallbackHref }: { title: string; fallbackHref: string }) {
  const router = useRouter();

  function handleClick() {
    if (hasNavigatedInApp()) router.back();
    else router.push(fallbackHref);
  }

  return (
    <button type="button" onClick={handleClick} className="flex min-w-0 items-center gap-1.5 text-left">
      <ChevronLeft className="h-5 w-5 shrink-0 text-slate-500" />
      <span className="truncate text-base font-bold text-slate-900">{title}</span>
    </button>
  );
}
