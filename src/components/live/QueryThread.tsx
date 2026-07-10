import type { ReactNode } from "react";
import {
  demoIntro,
  scaleStats,
  type DemoAnswer,
  type SourceReference,
} from "../../data/gembashift-demo";
import { scenarioSuggestions, type ScenarioId } from "../../data/question-aliases";
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
    };

interface QueryThreadProps {
  items: ThreadItem[];
  onOpenSources: (sources: SourceReference[], focus?: SourceReference) => void;
  onSuggest?: (text: string) => void;
  onWatchVideo?: () => void;
  presentation?: boolean;
  staggerMs?: number;
  countUpMs?: number;
  sourceCueActive?: boolean;
  hideGuide?: boolean;
  wide?: boolean;
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
      <div key="changes" className="overflow-hidden rounded-md border border-line">
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
      </div>,
    );
  }

  if (!answer.changes && answer.before && answer.after) {
    detailBlocks.push(
      <div key="ba" className="overflow-hidden rounded-md border border-line">
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
      <div key="retests" className="overflow-hidden rounded-md border border-line">
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
                <td className="border-t border-line px-3 py-2 text-ink">{r.reason}</td>
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
                  <span className="max-w-[14rem] truncate font-sans text-[11px] font-medium text-muted">
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
          <p className="whitespace-pre-line text-xl font-semibold leading-snug tracking-tight text-navy sm:text-2xl">
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

function DemoGuide({
  onSuggest,
  onWatchVideo,
}: {
  onSuggest?: (text: string) => void;
  onWatchVideo?: () => void;
}) {
  const stats = [
    { value: String(scaleStats.documents), unit: "文書", label: "検索対象" },
    {
      value: scaleStats.pages.toLocaleString(),
      unit: "ページ",
      label: "横断検索可能",
    },
    { value: String(scaleStats.majorChanges), unit: "件", label: "主要な仕様変更" },
    {
      value: String(scaleStats.retestCandidates),
      unit: "件",
      label: "再試験候補",
    },
    {
      value: String(scaleStats.contradictions),
      unit: "件",
      label: "文書不整合候補",
    },
  ];

  return (
    <div className="space-y-4 border-b border-line pb-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-navy sm:text-xl">
            {demoIntro.title}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-navy-muted">
            {demoIntro.subtitle}
          </p>
        </div>
        {onWatchVideo && (
          <button
            type="button"
            onClick={onWatchVideo}
            className="shrink-0 rounded-lg bg-navy px-5 py-3 text-sm font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-navy-soft sm:text-base"
          >
            動画でdemoを見る
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-md border border-line bg-white px-2.5 py-2"
          >
            <p className="text-base font-semibold tabular-nums text-navy sm:text-lg">
              {s.value}
              <span className="ml-0.5 text-[10px] font-normal text-muted">
                {s.unit}
              </span>
            </p>
            <p className="mt-0.5 text-[11px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {onSuggest && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium tracking-wide text-muted">
            質問例（タップで入力）
          </p>
          <div className="flex flex-wrap gap-2">
            {scenarioSuggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSuggest(s.label)}
                className="rounded border border-line bg-white px-2.5 py-1.5 text-xs text-navy transition-colors hover:border-navy/40"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function QueryThread({
  items,
  onOpenSources,
  onSuggest,
  onWatchVideo,
  presentation = false,
  staggerMs = 200,
  countUpMs = 700,
  sourceCueActive = false,
  hideGuide = false,
  wide = false,
}: QueryThreadProps) {
  return (
    <div
      className={`mx-auto flex w-full flex-col px-4 py-6 sm:px-6 ${
        wide ? "max-w-3xl gap-8 lg:max-w-4xl" : "max-w-2xl gap-6"
      }`}
    >
      {!hideGuide && !presentation && (
        <DemoGuide onSuggest={onSuggest} onWatchVideo={onWatchVideo} />
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
                <p className="text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl lg:text-3xl">
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
              <SearchSteps stepMs={item.stepMs} large={presentation} />
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
