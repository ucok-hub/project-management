import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
    >
      <ChevronLeft className="h-4 w-4" />
      {label ?? "Kembali"}
    </Link>
  );
}
