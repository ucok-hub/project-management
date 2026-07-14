import { Moon } from "lucide-react";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter((p) => !/^(pak|bu|ibu|bpk)$/i.test(p));
  const use = parts.length ? parts : name.trim().split(/\s+/);
  return use
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

// Warna avatar deterministik dari nama.
const COLORS = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
];

function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const DOT_SIZES = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
};

type PresenceValue = "online" | "idle" | "offline";
type Size = "sm" | "md" | "lg";

function PresenceDot({ presence, size }: { presence: PresenceValue; size: Size }) {
  if (presence === "idle") {
    return (
      <span
        className={cn(
          "absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-amber-400 ring-2 ring-white",
          DOT_SIZES[size],
        )}
        aria-label="Idle"
      >
        <Moon className="h-full w-full scale-75 text-amber-900" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 rounded-full ring-2 ring-white",
        presence === "online" ? "bg-emerald-500" : "bg-slate-300",
        DOT_SIZES[size],
      )}
      aria-label={presence === "online" ? "Online" : "Offline"}
    />
  );
}

export function Avatar({
  name,
  src,
  presence,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  presence?: PresenceValue;
  size?: Size;
  className?: string;
}) {
  const bubble = src ? (
    // Ukurannya sudah 256x256 dan terkompresi; optimisasi Next Image tidak diperlukan.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={cn("inline-block shrink-0 rounded-full object-cover", SIZES[size], className)}
    />
  ) : (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        SIZES[size],
        colorFor(name),
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );

  if (!presence) return bubble;

  return (
    <span className="relative inline-flex shrink-0">
      {bubble}
      <PresenceDot presence={presence} size={size} />
    </span>
  );
}
