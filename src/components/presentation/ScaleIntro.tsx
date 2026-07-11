import { scaleStats } from "../../data/gembashift-demo";
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
  eyebrow: "1,500ページの仕様書。必要な情報を探すだけで45分。",
  documents: scaleStats.documents,
  pages: scaleStats.pages,
  clauses: 436,
  pagesLabel: "pages",
  clausesLabel: "clauses",
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
