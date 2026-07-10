import { scaleStats } from "../../data/gembashift-demo";
import { CountUp } from "./CountUp";

interface ScaleIntroProps {
  visible: boolean;
  countUpMs?: number;
}

const CLAUSES = 436;

export function ScaleIntro({ visible, countUpMs = 900 }: ScaleIntroProps) {
  if (!visible) return null;

  return (
    <div className="fade-in mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <p className="text-sm text-navy-muted">
        1,500ページの仕様書。必要な情報を探すだけで45分。
      </p>
      <div className="grid w-full grid-cols-3 gap-4">
        <div>
          <p className="text-3xl font-bold tabular-nums text-navy sm:text-5xl">
            <CountUp to={scaleStats.documents} durationMs={countUpMs} />
          </p>
          <p className="mt-1 text-xs tracking-wide text-muted">documents</p>
        </div>
        <div>
          <p className="text-3xl font-bold tabular-nums text-navy sm:text-5xl">
            <CountUp
              to={scaleStats.pages}
              durationMs={countUpMs}
              formatter={(n) => Math.round(n).toLocaleString()}
            />
          </p>
          <p className="mt-1 text-xs tracking-wide text-muted">pages</p>
        </div>
        <div>
          <p className="text-3xl font-bold tabular-nums text-navy sm:text-5xl">
            <CountUp to={CLAUSES} durationMs={countUpMs} />
          </p>
          <p className="mt-1 text-xs tracking-wide text-muted">clauses</p>
        </div>
      </div>
    </div>
  );
}
