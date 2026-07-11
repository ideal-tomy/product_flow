import { CountUp } from "./CountUp";

export type ScaleIntroStats = {
  eyebrow?: string;
  documents: number;
  pages: number;
  clauses: number;
  pagesLabel?: string;
  clausesLabel?: string;
};

interface ScaleIntroProps {
  visible: boolean;
  countUpMs?: number;
  stats?: ScaleIntroStats;
}

const DEFAULT_STATS: ScaleIntroStats = {
  eyebrow: "文書を探す時間を、判断する時間へ。",
  documents: 3,
  pages: 6,
  clauses: 4,
  pagesLabel: "pages",
  clausesLabel: "chunks",
};

export function ScaleIntro({
  visible,
  countUpMs = 900,
  stats = DEFAULT_STATS,
}: ScaleIntroProps) {
  if (!visible) return null;

  return (
    <div className="fade-in mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <p className="text-sm text-navy-muted">{stats.eyebrow}</p>
      <div className="grid w-full grid-cols-3 gap-4">
        <div>
          <p className="text-3xl font-bold tabular-nums text-navy sm:text-5xl">
            <CountUp to={stats.documents} durationMs={countUpMs} />
          </p>
          <p className="mt-1 text-xs tracking-wide text-muted">documents</p>
        </div>
        <div>
          <p className="text-3xl font-bold tabular-nums text-navy sm:text-5xl">
            <CountUp
              to={stats.pages}
              durationMs={countUpMs}
              formatter={(n) => Math.round(n).toLocaleString()}
            />
          </p>
          <p className="mt-1 text-xs tracking-wide text-muted">
            {stats.pagesLabel ?? "pages"}
          </p>
        </div>
        <div>
          <p className="text-3xl font-bold tabular-nums text-navy sm:text-5xl">
            <CountUp to={stats.clauses} durationMs={countUpMs} />
          </p>
          <p className="mt-1 text-xs tracking-wide text-muted">
            {stats.clausesLabel ?? "clauses"}
          </p>
        </div>
      </div>
    </div>
  );
}
