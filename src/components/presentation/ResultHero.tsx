import type { DemoAnswer } from "../../data/gembashift-demo";
import { scaleStats } from "../../data/gembashift-demo";
import type { ScenarioId } from "../../data/question-aliases";
import { CountUp } from "./CountUp";

interface ResultHeroProps {
  scenarioId: ScenarioId | null | undefined;
  answer: DemoAnswer;
  countUpMs?: number;
}

export function ResultHero({ scenarioId, answer, countUpMs = 700 }: ResultHeroProps) {
  if (!scenarioId) return null;

  if (scenarioId === "version-diff") {
    const primary =
      answer.changes?.find((c) => c.id === "CHG-01") ?? answer.changes?.[0];
    return (
      <div className="fade-in space-y-4 rounded-lg border border-line bg-white px-5 py-6 text-center">
        <p className="text-xs font-semibold tracking-[0.14em] text-navy-muted">
          <CountUp to={answer.changes?.length ?? scaleStats.majorChanges} durationMs={countUpMs} />{" "}
          CHANGES DETECTED
        </p>
        {primary && (
          <div>
            <p className="text-sm text-muted">{primary.title}</p>
            <p className="mt-3 flex items-center justify-center gap-4 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              <span className="text-muted line-through decoration-muted/50">
                {primary.before}
              </span>
              <span className="text-lg font-normal text-muted">→</span>
              <span>{primary.after}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  if (scenarioId === "impact-scope" && answer.impactGroups) {
    return (
      <div className="fade-in grid grid-cols-2 gap-3 sm:grid-cols-3">
        {answer.impactGroups.map((g) => (
          <div
            key={g.label}
            className="rounded-lg border border-line bg-white px-4 py-5 text-center"
          >
            <p className="text-3xl font-bold tabular-nums text-navy">
              <CountUp to={g.count} durationMs={countUpMs} />
            </p>
            <p className="mt-1 text-xs font-medium tracking-wide text-navy-muted">
              {g.label}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (scenarioId === "retest" && answer.retests) {
    const required = answer.retests.filter((r) => r.priority === "必須").length;
    const recommended = answer.retests.filter((r) => r.priority === "推奨").length;
    const optional = answer.retests.filter((r) => r.priority === "任意").length;
    return (
      <div className="fade-in space-y-4 rounded-lg border border-line bg-white px-5 py-6 text-center">
        <p className="text-4xl font-bold tabular-nums text-navy sm:text-5xl">
          <CountUp to={answer.retests.length} durationMs={countUpMs} />
        </p>
        <p className="text-xs font-semibold tracking-[0.14em] text-navy-muted">
          TESTS IMPACTED
        </p>
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-lg font-semibold text-navy">{required}</p>
            <p className="text-[11px] text-muted">必須</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-navy">{recommended}</p>
            <p className="text-[11px] text-muted">推奨</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-navy">{optional}</p>
            <p className="text-[11px] text-muted">任意</p>
          </div>
        </div>
      </div>
    );
  }

  if (scenarioId === "contradiction" && answer.contradictions?.[0]) {
    const c = answer.contradictions[0];
    return (
      <div className="fade-in space-y-5 rounded-lg border border-line bg-white px-5 py-6">
        <p className="text-center text-xs font-semibold tracking-[0.14em] text-danger">
          <CountUp
            to={answer.contradictions.length}
            durationMs={countUpMs}
          />{" "}
          INCONSISTENCIES FOUND
        </p>
        <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-md bg-surface px-4 py-4 text-center">
            <p className="text-[11px] text-muted">
              {c.left.documentName} {c.left.version}
            </p>
            <p className="mt-2 text-3xl font-bold text-navy">{c.left.value}</p>
          </div>
          <p className="text-center text-sm font-semibold tracking-wide text-muted">
            VS
          </p>
          <div className="rounded-md bg-surface px-4 py-4 text-center">
            <p className="text-[11px] text-muted">
              {c.right.documentName} {c.right.version}
            </p>
            <p className="mt-2 text-3xl font-bold text-navy">{c.right.value}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
