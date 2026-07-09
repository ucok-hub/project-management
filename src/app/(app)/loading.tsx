function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

/** Skeleton umum — tampil instan saat pindah halaman, sebelum data siap. */
export default function Loading() {
  return (
    <div className="space-y-5 pb-4">
      <Bar className="h-4 w-40" />
      <div className="grid grid-cols-3 gap-2.5">
        <Bar className="h-16 rounded-2xl" />
        <Bar className="h-16 rounded-2xl" />
        <Bar className="h-16 rounded-2xl" />
      </div>
      <div className="space-y-3">
        <Bar className="h-24 rounded-2xl" />
        <Bar className="h-24 rounded-2xl" />
        <Bar className="h-24 rounded-2xl" />
      </div>
    </div>
  );
}
