import type { ReactNode } from "react";
import type { DemoAnswer, SourceReference } from "../../data/gembashift-demo";
import type { ScenarioId } from "../../data/question-aliases";
import { ResultHero } from "../presentation/ResultHero";
import { SearchSteps } from "../presentation/SearchSteps";
import { StaggerReveal } from "../presentation/StaggerReveal";

export type ThreadItem =
  | { kind: "user"; id: string; text: string }
  | {
      kind: "assistant";
      id: string;
      answer: DemoAnswer;
      unmatched?: boolean;
      suggestions?: string[];
      scenarioId?: ScenarioId | null;
      presentation?: boolean;
    }
  | { kind: "loading"; id: string }
  | {
      kind: "searching";
      id: string;
      stepMs: number;
      steps?: readonly string[];
    };

interface QueryThreadProps {
  items: ThreadItem[];
  onOpenSources: (sources: SourceReference[], focus?: SourceReference) => void;
  onSuggest?: (text: string) => void;
  presentation?: boolean;
  staggerMs?: number;
  countUpMs?: number;
  sourceCueActive?: boolean;
  wide?: boolean;
  emptyHint?: string;
}

const severityLabel = {
  high: "高",
  medium: "中",
  low: "低",
} as const;

const severityClass = {
  high: "bg-[#f8e8e6] text-danger",
  medium: "bg-[#f3eee4] text-[#8a5a12]",
  low: "bg-surface text-muted",
} as const;

function AnswerBody({
  answer,
  onOpenSources,
  presentation,
  scenarioId,
  staggerMs = 200,
  countUpMs = 700,
  sourceCueActive,
}: {
  answer: DemoAnswer;
  onOpenSources: (sources: SourceReference[], focus?: SourceReference) => void;
  presentation?: boolean;
  scenarioId?: ScenarioId | null;
  staggerMs?: number;
  countUpMs?: number;
  sourceCueActive?: boolean;
}) {
  const detailBlocks: ReactNode[] = [];

  if (answer.changes && answer.changes.length > 0) {
    detailBlocks.push(
      <div key="changes" className="min-w-0">
        <ul className="space-y-2 lg:hidden">
          {answer.changes.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-line bg-white px-3 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy">{c.title}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted">
                    §{c.clauseId}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${severityClass[c.severity]}`}
                >
                  {severityLabel[c.severity]}
                </span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-[11px] text-muted">Before</dt>
                  <dd className="text-muted line-through decoration-muted/40">
                    {c.before}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted">After</dt>
                  <dd className="font-semibold text-navy">{c.after}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-hidden rounded-md border border-line lg:block">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-navy-muted">
              <tr>
                <th className="px-3 py-2 font-medium">変更</th>
                <th className="px-3 py-2 font-medium">Before</th>
                <th className="px-3 py-2 font-medium">After</th>
                <th className="px-3 py-2 font-medium">重要度</th>
              </tr>
            </thead>
            <tbody>
              {answer.changes.map((c) => (
                <tr key={c.id}>
                  <td className="border-t border-line px-3 py-2 text-navy">
                    <span className="font-medium">{c.title}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted">
                      §{c.clauseId}
                    </span>
                  </td>
                  <td className="border-t border-line px-3 py-2 text-muted line-through decoration-muted/40">
                    {c.before}
                  </td>
                  <td className="border-t border-line px-3 py-2 font-semibold text-navy">
                    {c.after}
                  </td>
                  <td className="border-t border-line px-3 py-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${severityClass[c.severity]}`}
                    >
                      {severityLabel[c.severity]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>,
    );
  }

  if (!answer.changes && answer.before && answer.after) {
    detailBlocks.push(
      <div key="ba" className="min-w-0">
        <div className="rounded-md border border-line bg-white px-3 py-3 lg:hidden">
          <p className="text-sm font-medium text-navy">
            {answer.comparisonLabel ?? "値"}
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-[11px] text-muted">Before</dt>
              <dd className="text-muted line-through decoration-muted/40">
                {answer.before}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted">After</dt>
              <dd className="font-semibold text-navy">{answer.after}</dd>
            </div>
          </dl>
        </div>
        <div className="hidden overflow-hidden rounded-md border border-line lg:block">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-navy-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Version</th>
                <th className="px-3 py-2 font-medium">
                  {answer.comparisonLabel ?? "値"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-t border-line px-3 py-2 text-muted">v3.2</td>
                <td className="border-t border-line px-3 py-2 text-muted line-through decoration-muted/40">
                  {answer.before}
                </td>
              </tr>
              <tr>
                <td className="border-t border-line px-3 py-2 font-medium text-navy">
                  v3.4
                </td>
                <td className="border-t border-line px-3 py-2 font-semibold text-navy">
                  {answer.after}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>,
    );
  }

  if (answer.impactGroups && answer.impactGroups.length > 0) {
    detailBlocks.push(
      <div key="impact" className="space-y-3">
        {answer.impactGroups.map((group) => (
          <div key={group.label} className="rounded-md border border-line px-3 py-2.5">
            <p className="text-xs font-semibold text-navy">
              {group.label}
              <span className="ml-2 font-normal text-muted">{group.count}件</span>
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink">
              {group.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-navy" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>,
    );
  }

  if (!answer.impactGroups && answer.impactAreas && answer.impactAreas.length > 0) {
    detailBlocks.push(
      <ul key="areas" className="space-y-1.5 text-sm text-ink">
        {answer.impactAreas.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-navy" />
            <span>{item}</span>
          </li>
        ))}
      </ul>,
    );
  }

  if (answer.retests && answer.retests.length > 0) {
    detailBlocks.push(
      <div key="retests" className="min-w-0">
        <ul className="space-y-2 lg:hidden">
          {answer.retests.map((r) => (
            <li
              key={r.id}
              className="rounded-md border border-line bg-white px-3 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-muted">{r.id}</p>
                  <p className="text-sm font-medium text-navy">{r.name}</p>
                </div>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${
                    r.priority === "必須"
                      ? severityClass.high
                      : r.priority === "推奨"
                        ? severityClass.medium
                        : severityClass.low
                  }`}
                >
                  {r.priority}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink">{r.reason}</p>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-hidden rounded-md border border-line lg:block">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-navy-muted">
              <tr>
                <th className="px-3 py-2 font-medium">試験</th>
                <th className="px-3 py-2 font-medium">理由</th>
                <th className="px-3 py-2 font-medium">優先度</th>
              </tr>
            </thead>
            <tbody>
              {answer.retests.map((r) => (
                <tr key={r.id}>
                  <td className="border-t border-line px-3 py-2 text-navy">
                    <span className="font-mono text-[11px] text-muted">{r.id}</span>
                    <span className="mt-0.5 block font-medium">{r.name}</span>
                  </td>
                  <td className="border-t border-line px-3 py-2 text-ink">
                    {r.reason}
                  </td>
                  <td className="border-t border-line px-3 py-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                        r.priority === "必須"
                          ? severityClass.high
                          : r.priority === "推奨"
                            ? severityClass.medium
                            : severityClass.low
                      }`}
                    >
                      {r.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>,
    );
  }

  if (answer.contradictions && answer.contradictions.length > 0) {
    detailBlocks.push(
      <div key="cx" className="space-y-2">
        {answer.contradictions.map((c) => (
          <div key={c.id} className="rounded-md border border-line px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-navy">{c.title}</p>
              <span
                className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${severityClass[c.severity]}`}
              >
                重要度: {severityLabel[c.severity]}
              </span>
            </div>
            <div className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
              <p className="rounded bg-surface px-2.5 py-2 text-ink">
                <span className="block text-[11px] text-muted">
                  {c.left.documentName} {c.left.version}
                </span>
                <span className="mt-0.5 font-semibold text-navy">{c.left.value}</span>
              </p>
              <p className="rounded bg-surface px-2.5 py-2 text-ink">
                <span className="block text-[11px] text-muted">
                  {c.right.documentName} {c.right.version}
                </span>
                <span className="mt-0.5 font-semibold text-navy">{c.right.value}</span>
              </p>
            </div>
          </div>
        ))}
      </div>,
    );
  }

  if (answer.similarCases && answer.similarCases.length > 0) {
    detailBlocks.push(
      <div key="similar" className="space-y-2">
        {answer.similarCases.map((c) => (
          <div key={c.id} className="rounded-md border border-line px-3 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-navy">
                <span className="font-mono text-xs text-muted">{c.id}</span>
                <span className="ml-2">{c.title}</span>
              </p>
              <span className="text-xs font-medium text-success">
                類似度: {c.similarity}%
              </span>
            </div>
            <dl className="mt-2 space-y-1.5 text-sm text-ink">
              <div>
                <dt className="text-[11px] text-muted">原因</dt>
                <dd>{c.cause}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">対策</dt>
                <dd>{c.countermeasure}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">今回との関係</dt>
                <dd>{c.relationToCurrent}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>,
    );
  }

  if (answer.exceptionNote) {
    detailBlocks.push(
      <p key="ex" className="rounded-md bg-surface px-3 py-2 text-sm text-navy-muted">
        {answer.exceptionNote}
      </p>,
    );
  }

  const sourcesBlock =
    answer.sources.length > 0 ? (
      <div
        className={
          presentation
            ? "space-y-3 rounded-lg border border-navy/15 bg-surface/60 px-4 py-4"
            : "flex flex-wrap items-center gap-2 pt-1"
        }
      >
        {presentation && (
          <p className="text-xs font-bold tracking-[0.12em] text-navy">
            根拠 · 登録ナレッジ
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {answer.sources.map((s) => (
            <button
              key={`${s.documentName}-${s.version}-${s.clauseId}-${s.page}`}
              type="button"
              onClick={() => onOpenSources(answer.sources, s)}
              className={`rounded border font-mono text-navy transition-colors hover:border-navy/40 ${
                presentation
                  ? "border-navy/25 bg-white px-3 py-2 text-sm font-semibold"
                  : "border-line px-2 py-1 text-xs"
              } ${
                sourceCueActive
                  ? "border-navy bg-navy/[0.06] ring-2 ring-navy/20"
                  : ""
              }`}
            >
              {presentation ? (
                <span className="flex flex-col items-start gap-0.5 text-left">
                  <span>§{s.clauseId}</span>
                  <span className="max-w-[9rem] truncate font-sans text-[11px] font-medium text-muted sm:max-w-[14rem]">
                    {s.documentName}
                  </span>
                </span>
              ) : (
                <>§{s.clauseId}</>
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onOpenSources(answer.sources, answer.sources[0])}
            className={`font-semibold text-navy underline-offset-2 hover:underline ${
              presentation ? "text-base" : "text-sm font-medium"
            }`}
          >
            {answer.sources.length}件の根拠を確認 →
          </button>
        </div>
      </div>
    ) : null;

  if (presentation) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-bold tracking-[0.14em] text-navy">回答</p>
          <ResultHero
            scenarioId={scenarioId}
            answer={answer}
            countUpMs={countUpMs}
          />
          <p className="whitespace-pre-line break-words text-lg font-semibold leading-snug tracking-tight text-navy sm:text-xl lg:text-2xl">
            {answer.summary}
          </p>
        </div>
        <StaggerReveal stepMs={staggerMs} className="space-y-4">
          {[...detailBlocks, sourcesBlock].filter(Boolean)}
        </StaggerReveal>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-navy">
        {answer.summary}
      </p>
      {detailBlocks}
      {sourcesBlock}
    </div>
  );
}

export function QueryThread({
  items,
  onOpenSources,
  onSuggest,
  presentation = false,
  staggerMs = 200,
  countUpMs = 700,
  sourceCueActive = false,
  wide = false,
  emptyHint = "選択中の文書について質問できます",
}: QueryThreadProps) {
  return (
    <div
      className={`mx-auto flex w-full min-w-0 flex-col px-4 py-6 sm:px-6 ${
        wide ? "max-w-3xl gap-8 lg:max-w-4xl" : "max-w-2xl gap-6"
      }`}
    >
      {!presentation && items.length === 0 && (
        <p className="py-8 text-center text-sm text-navy-muted">{emptyHint}</p>
      )}

      {items.map((item) => {
        if (item.kind === "user") {
          if (presentation) {
            return (
              <div
                key={item.id}
                className="fade-in space-y-2 rounded-xl border-2 border-navy bg-navy px-5 py-5 sm:px-6 sm:py-6"
              >
                <p className="text-xs font-bold tracking-[0.14em] text-white/70">
                  質問
                </p>
                <p className="break-words text-lg font-bold leading-snug tracking-tight text-white sm:text-2xl lg:text-3xl">
                  {item.text}
                </p>
              </div>
            );
          }
          return (
            <div key={item.id} className="fade-in flex justify-end">
              <div className="max-w-[90%] rounded-lg bg-navy px-4 py-3 text-sm leading-relaxed text-white">
                {item.text}
              </div>
            </div>
          );
        }

        if (item.kind === "searching") {
          return (
            <div key={item.id} className="fade-in space-y-3">
              <p
                className={
                  presentation
                    ? "text-xs font-bold tracking-[0.14em] text-navy"
                    : "text-[11px] font-semibold tracking-[0.1em] text-navy-muted"
                }
              >
                {presentation ? "登録ナレッジを検索中" : "GembaShift"}
              </p>
              <SearchSteps
                stepMs={item.stepMs}
                large={presentation}
                steps={item.steps}
              />
            </div>
          );
        }

        if (item.kind === "loading") {
          return (
            <div
              key={item.id}
              className="flex items-center gap-2 text-sm text-navy-muted"
            >
              <span className="flex gap-1" aria-hidden="true">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-navy" />
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-navy [animation-delay:0.2s]" />
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-navy [animation-delay:0.4s]" />
              </span>
              複数文書を横断参照しています…
            </div>
          );
        }

        if (item.unmatched) {
          return (
            <div key={item.id} className="fade-in space-y-3">
              <p className="text-[11px] font-semibold tracking-[0.1em] text-navy-muted">
                GembaShift
              </p>
              <p className="text-sm leading-relaxed text-navy-muted">
                {item.answer.summary}
              </p>
              {item.suggestions && item.suggestions.length > 0 && onSuggest && (
                <div className="flex flex-wrap gap-2">
                  {item.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onSuggest(s)}
                      className="rounded border border-line bg-white px-2.5 py-1 text-xs text-navy transition-colors hover:border-navy/40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }

        const isPresentationAnswer = item.presentation ?? presentation;
        return (
          <div
            key={item.id}
            className={
              isPresentationAnswer
                ? "fade-in space-y-4 rounded-xl border border-line bg-white px-5 py-6 sm:px-6 sm:py-7"
                : "fade-in space-y-2"
            }
          >
            {!isPresentationAnswer && (
              <p className="text-[11px] font-semibold tracking-[0.1em] text-navy-muted">
                GembaShift
              </p>
            )}
            <AnswerBody
              answer={item.answer}
              onOpenSources={onOpenSources}
              presentation={isPresentationAnswer}
              scenarioId={item.scenarioId}
              staggerMs={staggerMs}
              countUpMs={countUpMs}
              sourceCueActive={sourceCueActive}
            />
          </div>
        );
      })}
    </div>
  );
}

