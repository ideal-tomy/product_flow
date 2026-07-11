import type { DemoAnswer } from "../../data/ConformSystem-demo";
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
      <div className="fade-in space-y-4 rounded-lg border-2 border-navy/10 bg-surface/40 px-5 py-7 text-center sm:py-8">
        <p className="text-sm font-bold tracking-[0.14em] text-navy-muted">
          <CountUp to={answer.changes?.length ?? 0} durationMs={countUpMs} />{" "}
          CHANGES DETECTED
        </p>
        {primary && (
          <div>
            <p className="text-base font-semibold text-navy-muted">{primary.title}</p>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-3 text-2xl font-bold tracking-tight text-navy sm:gap-4 sm:text-3xl lg:text-4xl xl:text-5xl">
              <span className="text-muted line-through decoration-muted/50">
                {primary.before}
              </span>
              <span className="text-xl font-semibold text-muted sm:text-2xl">→</span>
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
            className="rounded-lg border-2 border-navy/10 bg-surface/40 px-4 py-6 text-center"
          >
            <p className="text-3xl font-bold tabular-nums text-navy sm:text-4xl lg:text-5xl">
              <CountUp to={g.count} durationMs={countUpMs} />
            </p>
            <p className="mt-2 text-sm font-bold tracking-wide text-navy-muted">
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
      <div className="fade-in space-y-4 rounded-lg border-2 border-navy/10 bg-surface/40 px-5 py-7 text-center sm:py-8">
        <p className="text-4xl font-bold tabular-nums text-navy sm:text-5xl lg:text-6xl">
          <CountUp to={answer.retests.length} durationMs={countUpMs} />
        </p>
        <p className="text-sm font-bold tracking-[0.14em] text-navy-muted">
          TESTS IMPACTED
        </p>
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-2 text-base">
          <div>
            <p className="text-2xl font-bold text-navy">{required}</p>
            <p className="text-xs font-semibold text-muted">必須</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{recommended}</p>
            <p className="text-xs font-semibold text-muted">推奨</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{optional}</p>
            <p className="text-xs font-semibold text-muted">任意</p>
          </div>
        </div>
      </div>
    );
  }

  if (scenarioId === "contradiction" && answer.contradictions?.[0]) {
    const c = answer.contradictions[0];
    return (
      <div className="fade-in space-y-5 rounded-lg border-2 border-danger/20 bg-surface/40 px-5 py-7 sm:py-8">
        <p className="text-center text-sm font-bold tracking-[0.14em] text-danger">
          <CountUp
            to={answer.contradictions.length}
            durationMs={countUpMs}
          />{" "}
          INCONSISTENCIES FOUND
        </p>
        <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-md bg-white px-4 py-5 text-center">
            <p className="text-xs font-semibold text-muted">
              {c.left.documentName} {c.left.version}
            </p>
            <p className="mt-2 break-words text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">{c.left.value}</p>
          </div>
          <p className="text-center text-lg font-bold tracking-wide text-muted">
            VS
          </p>
          <div className="rounded-md bg-white px-4 py-5 text-center">
            <p className="text-xs font-semibold text-muted">
              {c.right.documentName} {c.right.version}
            </p>
            <p className="mt-2 break-words text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">{c.right.value}</p>
          </div>
        </div>
      </div>
    );
  }

  if (scenarioId === "std-classification" && answer.impactGroups) {
    return (
      <div className="fade-in space-y-4">
        <p className="text-center text-sm font-bold tracking-[0.14em] text-navy-muted">
          <CountUp to={answer.impactGroups.length} durationMs={countUpMs} />{" "}
          TYPES OF STANDARDS
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {answer.impactGroups.map((g) => (
            <div
              key={g.label}
              className={`rounded-lg border-2 px-3 py-5 text-center ${
                g.label === "社内規格"
                  ? "border-navy/30 bg-navy/5"
                  : "border-navy/10 bg-surface/40"
              }`}
            >
              <p className="text-sm font-bold tracking-wide text-navy">{g.label}</p>
              <p className="mt-2 text-xs text-navy-muted">{g.items[0]}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (scenarioId === "std-company") {
    return (
      <div className="fade-in space-y-4 rounded-lg border-2 border-navy/10 bg-surface/40 px-5 py-7 text-center sm:py-8">
        <p className="text-sm font-bold tracking-[0.14em] text-navy-muted">
          COMPANY STANDARD
        </p>
        <p className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          社内規格
        </p>
        {(answer.before || answer.after) && (
          <p className="mt-2 flex flex-wrap items-center justify-center gap-3 text-lg font-semibold text-navy-muted sm:text-xl">
            <span className="text-muted line-through decoration-muted/50">
              {answer.before}
            </span>
            <span className="text-base text-muted">→</span>
            <span className="text-navy">{answer.after}</span>
          </p>
        )}
      </div>
    );
  }

  return null;
}
