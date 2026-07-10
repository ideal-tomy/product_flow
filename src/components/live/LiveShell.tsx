import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { KnowledgePackId } from "../../packs/types";
import { PackSwitcher } from "./PackSwitcher";

interface LiveShellProps {
  onOpenDocs: () => void;
  onOpenQueries?: () => void;
  presentation?: boolean;
  autoplay?: boolean;
  mode?: "sample" | "ai";
  onTogglePresentation?: () => void;
  onWatchVideo?: () => void;
  onExitVideo?: () => void;
  hideChrome?: boolean;
  /** ヘッダー中央の案件名 */
  packTitle?: string;
  packId?: KnowledgePackId;
  onPackChange?: (id: KnowledgePackId) => void;
  versionLabel?: string;
  aiSubtitle?: string;
  children: ReactNode;
}

export function LiveShell({
  onOpenDocs,
  onOpenQueries,
  presentation = false,
  autoplay = false,
  mode = "sample",
  onTogglePresentation,
  onWatchVideo,
  onExitVideo,
  hideChrome = false,
  packTitle = "作業手順の改定",
  packId,
  onPackChange,
  versionLabel,
  aiSubtitle,
  children,
}: LiveShellProps) {
  const isAi = mode === "ai";
  const showPackSwitcher =
    Boolean(packId && onPackChange) && !presentation && !autoplay;

  const sampleLink = packId ? `/?pack=${packId}` : "/";
  const aiLink = packId ? `/ai?pack=${packId}` : "/ai";

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-surface/40">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-white px-3 sm:gap-3 sm:px-4">
        {!hideChrome && (
          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={onOpenDocs}
              className="rounded border border-line px-2 py-1 text-xs text-navy-muted"
              aria-label="文書一覧を開く"
            >
              Docs
            </button>
            {onOpenQueries && (
              <button
                type="button"
                onClick={onOpenQueries}
                className="rounded border border-line px-2 py-1 text-xs text-navy-muted"
                aria-label="質問一覧を開く"
              >
                Queries
              </button>
            )}
          </div>
        )}
        <span className="text-sm font-semibold tracking-wide text-navy">
          GembaShift
        </span>
        <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />
        <div className="min-w-0 flex-1 truncate text-sm text-navy-muted">
          {isAi ? (
            <span className="tabular-nums">
              <span className="text-navy">{packTitle}</span>
              <span className="ml-2 rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                AI
              </span>
              {aiSubtitle && (
                <span className="ml-2 text-[11px] text-muted">{aiSubtitle}</span>
              )}
            </span>
          ) : presentation ? (
            <span className="tabular-nums">{aiSubtitle ?? packTitle}</span>
          ) : (
            <>
              <span className="text-navy">{packTitle}</span>
              <span className="ml-2 rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                Sample
              </span>
            </>
          )}
        </div>

        {!isAi && !presentation && onWatchVideo && (
          <button
            type="button"
            onClick={onWatchVideo}
            className="shrink-0 rounded-md bg-navy px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-navy-soft sm:px-4 sm:text-sm"
          >
            動画でdemoを見る
          </button>
        )}

        {autoplay && onExitVideo && (
          <button
            type="button"
            onClick={onExitVideo}
            className="shrink-0 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy/40 sm:text-sm"
          >
            操作デモに戻る
          </button>
        )}

        {!autoplay && (
          <div className="flex shrink-0 rounded-md border border-line p-0.5 text-[11px]">
            <Link
              to={sampleLink}
              className={`rounded px-2 py-1 font-medium transition-colors ${
                !isAi ? "bg-navy text-white" : "text-muted hover:text-navy"
              }`}
            >
              Sample
            </Link>
            <Link
              to={aiLink}
              className={`rounded px-2 py-1 font-bold transition-colors ${
                isAi ? "bg-navy text-white" : "text-muted hover:text-navy"
              }`}
            >
              AI Mode
            </Link>
          </div>
        )}

        {onTogglePresentation && !autoplay && !isAi && (
          <div className="hidden shrink-0 rounded-md border border-line p-0.5 text-[11px] sm:flex">
            <button
              type="button"
              onClick={() => presentation && onTogglePresentation()}
              className={`rounded px-2 py-1 font-medium transition-colors ${
                !presentation
                  ? "bg-navy text-white"
                  : "text-muted hover:text-navy"
              }`}
            >
              Demo
            </button>
            <button
              type="button"
              onClick={() => !presentation && onTogglePresentation()}
              className={`rounded px-2 py-1 font-medium transition-colors ${
                presentation
                  ? "bg-navy text-white"
                  : "text-muted hover:text-navy"
              }`}
            >
              Presentation
            </button>
          </div>
        )}
        {!presentation && versionLabel && (
          <span
            className="hidden text-xs text-muted lg:inline"
            title="比較対象（表示のみ）"
          >
            {versionLabel}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs text-success">
          <span
            className="h-1.5 w-1.5 rounded-full bg-success"
            aria-hidden="true"
          />
          Ready
        </span>
      </header>
      {showPackSwitcher && packId && onPackChange && (
        <PackSwitcher packId={packId} onChange={onPackChange} />
      )}
      {children}
    </div>
  );
}
