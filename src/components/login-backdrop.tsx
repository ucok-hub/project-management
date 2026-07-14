function SkeletonTaskCard() {
  return (
    <div className="w-40 shrink-0 space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4 lg:w-56">
      <div className="flex items-center justify-between">
        <div className="h-3 w-14 rounded-full bg-slate-200 lg:w-16" />
        <div className="h-5 w-5 rounded-full bg-slate-200" />
      </div>
      <div className="h-3.5 w-full rounded-md bg-slate-200" />
      <div className="h-3.5 w-2/3 rounded-md bg-slate-200" />
      <div className="flex items-center gap-2 pt-1">
        <div className="h-6 w-6 rounded-full bg-slate-200" />
        <div className="h-2.5 w-16 rounded-full bg-slate-200 lg:w-20" />
      </div>
    </div>
  );
}

function SkeletonKanbanTile() {
  return (
    <div className="w-28 shrink-0 space-y-2 rounded-2xl border border-slate-200 bg-white p-3 lg:w-40">
      <div className="h-2.5 w-10 rounded-full bg-slate-200 lg:w-12" />
      <div className="h-3 w-full rounded-md bg-slate-200" />
      <div className="h-12 w-full rounded-xl bg-slate-100 lg:h-16" />
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className="flex w-52 shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 lg:w-72">
      <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-2/3 rounded-full bg-slate-200" />
        <div className="h-2 w-1/3 rounded-full bg-slate-100" />
      </div>
      <div className="h-5 w-10 shrink-0 rounded-full bg-slate-200" />
    </div>
  );
}

function SkeletonStatTile() {
  return (
    <div className="w-24 shrink-0 space-y-2 rounded-2xl border border-slate-200 bg-white p-3.5 lg:w-32">
      <div className="h-2.5 w-8 rounded-full bg-slate-200 lg:w-10" />
      <div className="h-6 w-12 rounded-md bg-slate-200 lg:w-14" />
    </div>
  );
}

type CardTemplate = () => React.JSX.Element;

const ROW_1: CardTemplate[] = [
  SkeletonTaskCard,
  SkeletonKanbanTile,
  SkeletonTableRow,
  SkeletonStatTile,
  SkeletonTaskCard,
  SkeletonKanbanTile,
];
const ROW_2: CardTemplate[] = [
  SkeletonTableRow,
  SkeletonStatTile,
  SkeletonTaskCard,
  SkeletonKanbanTile,
  SkeletonTableRow,
  SkeletonStatTile,
];
const ROW_3: CardTemplate[] = [
  SkeletonKanbanTile,
  SkeletonTaskCard,
  SkeletonStatTile,
  SkeletonTableRow,
  SkeletonKanbanTile,
  SkeletonTaskCard,
];

function MarqueeRow({
  cards,
  direction,
  durationS,
}: {
  cards: CardTemplate[];
  direction: "ltr" | "rtl";
  durationS: number;
}) {
  const keyframe = direction === "ltr" ? "marquee-ltr" : "marquee-rtl";

  return (
    <div
      className="marquee-row flex w-max will-change-transform"
      style={{ animation: `${keyframe} ${durationS}s linear infinite` }}
    >
      {[0, 1].map((copy) => (
        <div key={copy} className="flex shrink-0 gap-4 pr-4">
          {cards.map((Card, index) => (
            <Card key={index} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Latar halaman login: tiga baris kartu skeleton abstrak yang bergerak otomatis. */
export function LoginBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center gap-4 overflow-hidden opacity-35 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
    >
      <MarqueeRow cards={ROW_1} direction="ltr" durationS={38} />
      <MarqueeRow cards={ROW_2} direction="rtl" durationS={44} />
      <MarqueeRow cards={ROW_3} direction="ltr" durationS={40} />
    </div>
  );
}
