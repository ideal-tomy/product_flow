import { useState, type ReactNode } from "react";
import type { PackGuidedTour } from "../../packs/types";
import { PostTourActions } from "../PostTourActions";

type Props = {
  tour: PackGuidedTour;
  packId: string;
  answeredQuestionIds: Set<string>;
  activeQuestionId: string | null;
  loading: boolean;
  onAskStep: (questionId: string) => void;
  freeInputOpen: boolean;
  onToggleFreeInput: () => void;
  /** sample=文書デモ / ai=ナレッジAI */
  variant?: "sample" | "ai";
  /** AI側: ツアー進行後に差し込む（Access Mode・自社資料など） */
  afterProgressSlot?: ReactNode;
};

export function GuidedTourPanel({
  tour,
  packId,
  answeredQuestionIds,
  activeQuestionId,
  loading,
  onAskStep,
  freeInputOpen,
  onToggleFreeInput,
  variant = "sample",
  afterProgressSlot,
}: Props) {
  const total = tour.steps.length;
  const doneCount = tour.steps.filter((s) =>
    answeredQuestionIds.has(s.questionId),
  ).length;
  const complete = doneCount >= total && total > 0;
  const started = doneCount > 0;
  const [showAfter, setShowAfter] = useState(false);

  const revealAfter = complete || showAfter;
  const showLiveSlot = variant === "ai" && (started || complete || showAfter);

  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6 lg:max-w-4xl">
        <p className="text-[11px] font-medium tracking-wide text-navy-muted">
          {variant === "ai" ? "ステップ1 · ガイド質問" : "体験の始め方"} ·{" "}
          {tour.roleLabel}
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight text-navy sm:text-lg">
          {variant === "ai"
            ? "同じガイドを、ナレッジAIで試す"
            : tour.headline}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {variant === "ai"
            ? "番号順に押すと、いま選んでいる体験モード（サンプル／APIキー／体験コード）で回答します。まずはサンプルのまま進めてください。"
            : tour.lead}
        </p>

        <ol className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
          {tour.steps.map((step, index) => {
            const answered = answeredQuestionIds.has(step.questionId);
            const active = activeQuestionId === step.questionId;
            const climax = step.id === tour.climaxStepId;
            return (
              <li key={step.id} className="sm:min-w-[9.5rem] sm:flex-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => onAskStep(step.questionId)}
                  className={`flex w-full items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors disabled:opacity-50 ${
                    active
                      ? "border-navy bg-navy text-white"
                      : answered
                        ? "border-success/40 bg-success/5 text-navy"
                        : climax
                          ? "border-danger/35 bg-danger/5 text-navy hover:border-danger/50"
                          : "border-line bg-surface/60 text-navy hover:border-navy/30"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      active
                        ? "bg-white/20 text-white"
                        : answered
                          ? "bg-success/20 text-success"
                          : "bg-white text-navy-muted"
                    }`}
                  >
                    {answered ? "✓" : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] opacity-80">
                      {climax ? "本命" : `ステップ ${index + 1}`}
                    </span>
                    <span className="block text-sm font-medium leading-snug">
                      {step.shortLabel}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span>
            進捗 {doneCount}/{total}
          </span>
          <button
            type="button"
            onClick={onToggleFreeInput}
            className="font-medium text-navy underline-offset-2 hover:underline"
          >
            {freeInputOpen ? "自由入力を閉じる" : "自由に質問する"}
          </button>
          {!complete && (
            <button
              type="button"
              onClick={() => setShowAfter(true)}
              className="font-medium text-navy-muted underline-offset-2 hover:underline"
            >
              次の一歩へスキップ
            </button>
          )}
        </div>

        {showLiveSlot && afterProgressSlot ? (
          <div className="mt-3 space-y-2">{afterProgressSlot}</div>
        ) : null}

        {revealAfter && (
          <PostTourActions
            variant={variant}
            packId={packId}
            complete={complete}
            afterTourNote={tour.afterTourNote}
            siblingDemos={tour.siblingDemos}
          />
        )}
      </div>
    </div>
  );
}
