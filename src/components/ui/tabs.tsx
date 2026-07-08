import Link from "next/link";
import { cn } from "@/lib/utils";

export function Tabs({
  items,
  active,
}: {
  items: { key: string; label: string; href: string; count?: number }[];
  active: string;
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-slate-200/70 p-1">
      {items.map((it) => (
        <Link
          key={it.key}
          href={it.href}
          className={cn(
            "flex-1 rounded-lg px-2 py-2 text-center text-sm font-semibold transition-colors",
            it.key === active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600",
          )}
        >
          {it.label}
          {it.count != null && it.count > 0 && (
            <span
              className={cn(
                "ml-1 text-xs",
                it.key === active ? "text-slate-400" : "text-slate-500",
              )}
            >
              {it.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
