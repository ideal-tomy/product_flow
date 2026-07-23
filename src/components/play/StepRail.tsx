import type { PackGuidedTourStep } from "../../packs/types";

type Props = {
  steps: PackGuidedTourStep[];
  answeredIds: Set<string>;
  activeQuestionId: string | null;
  loading: boolean;
  climaxStepId?: string;
  onAskStep: (questionId: string) => void;
};

export function StepRail({
  steps,
  answeredIds,
  activeQuestionId,
  loading,
  climaxStepId,
  onAskStep,
}: Props) {
  const doneCount = steps.filter((s) => answeredIds.has(s.questionId)).length;
  const total = steps.length;
  const started = doneCount > 0;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div>
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-navy transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="flex flex-col gap-1.5">
        {steps.map((step, index) => {
          const answered = answeredIds.has(step.questionId);
          const active = activeQuestionId === step.questionId;
          const climax = step.id === climaxStepId;
          const hintFirst = !started && index === 0;

          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={loading}
                onClick={() => onAskStep(step.questionId)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:opacity-50 ${
                  active
                    ? "border-navy bg-navy text-white"
                    : answered
                      ? "border-success/35 bg-success/5 text-navy"
                      : climax
                        ? "border-danger/30 bg-danger/[0.04] text-navy hover:border-danger/45"
                        : hintFirst
                          ? "border-navy/40 bg-white text-navy ring-2 ring-navy/15"
                          : "border-line bg-white text-navy hover:border-navy/30"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    active
                      ? "bg-white/20 text-white"
                      : answered
                        ? "bg-success/20 text-success"
                        : "bg-surface text-navy-muted"
                  }`}
                >
                  {answered ? "✓" : index + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium leading-snug">
                  {step.shortLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
