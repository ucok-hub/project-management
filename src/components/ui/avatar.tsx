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

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (src) {
    return (
      // Ukurannya sudah 256x256 dan terkompresi; optimisasi Next Image tidak diperlukan.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={cn("inline-block shrink-0 rounded-full object-cover", SIZES[size], className)}
      />
    );
  }
  return (
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
}
