import { useEffect, useState, type ReactNode } from "react";
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

function ModeToggle({
  isAi,
  sampleLink,
  aiLink,
  compact,
}: {
  isAi: boolean;
  sampleLink: string;
  aiLink: string;
  compact?: boolean;
}) {
  return (
    <div className="flex shrink-0 rounded-md border border-line p-0.5 text-[11px]">
      <Link
        to={sampleLink}
        className={`min-h-9 rounded px-2.5 py-1.5 font-medium transition-colors ${
          !isAi ? "bg-navy text-white" : "text-muted hover:text-navy"
        }`}
      >
        Sample
      </Link>
      <Link
        to={aiLink}
        className={`min-h-9 rounded px-2.5 py-1.5 font-bold transition-colors ${
          isAi ? "bg-navy text-white" : "text-muted hover:text-navy"
        }`}
      >
        {compact ? "AI" : "AI Mode"}
      </Link>
    </div>
  );
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

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const runAndClose = (fn?: () => void) => {
    closeMenu();
    fn?.();
  };

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-surface/40">
      {/* —— Mobile header (<lg) —— */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-white px-3 lg:hidden">
        {!hideChrome && !autoplay && (
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-line text-navy"
            aria-label="メニューを開く"
            aria-expanded={menuOpen}
          >
            <span className="flex flex-col gap-1" aria-hidden="true">
              <span className="block h-0.5 w-4 rounded-full bg-navy" />
              <span className="block h-0.5 w-4 rounded-full bg-navy" />
              <span className="block h-0.5 w-4 rounded-full bg-navy" />
            </span>
          </button>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-wide text-navy">
            GembaShift
          </p>
          <p className="truncate text-[11px] text-muted">
            {presentation || autoplay
              ? (aiSubtitle ?? packTitle)
              : packTitle}
          </p>
        </div>

        {autoplay && onExitVideo ? (
          <button
            type="button"
            onClick={onExitVideo}
            className="min-h-11 shrink-0 rounded-md border border-line bg-white px-3 text-xs font-semibold text-navy"
          >
            戻る
          </button>
        ) : (
          <ModeToggle
            isAi={isAi}
            sampleLink={sampleLink}
            aiLink={aiLink}
            compact
          />
        )}
      </header>

      {/* —— Desktop header (lg+) —— */}
      <header className="hidden h-12 shrink-0 items-center gap-2 border-b border-line bg-white px-3 sm:gap-3 sm:px-4 lg:flex">
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
          <ModeToggle isAi={isAi} sampleLink={sampleLink} aiLink={aiLink} />
        )}

        {onTogglePresentation && !autoplay && !isAi && (
          <div className="flex shrink-0 rounded-md border border-line p-0.5 text-[11px]">
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
            className="text-xs text-muted"
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
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
        {children}
      </div>

      {/* Mobile menu sheet */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-navy/40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="メニュー"
          onClick={closeMenu}
        >
          <div
            className="w-full overflow-hidden rounded-t-lg border-t border-line bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-navy">メニュー</p>
              <button
                type="button"
                onClick={closeMenu}
                className="min-h-11 rounded px-3 text-sm text-muted"
              >
                閉じる
              </button>
            </div>
            <ul className="divide-y divide-line p-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <li>
                <button
                  type="button"
                  onClick={() => runAndClose(onOpenDocs)}
                  className="flex min-h-12 w-full items-center px-3 text-left text-sm font-medium text-navy"
                >
                  文書一覧
                </button>
              </li>
              {onOpenQueries && (
                <li>
                  <button
                    type="button"
                    onClick={() => runAndClose(onOpenQueries)}
                    className="flex min-h-12 w-full items-center px-3 text-left text-sm font-medium text-navy"
                  >
                    質問一覧
                  </button>
                </li>
              )}
              {!isAi && !presentation && onWatchVideo && (
                <li>
                  <button
                    type="button"
                    onClick={() => runAndClose(onWatchVideo)}
                    className="flex min-h-12 w-full items-center px-3 text-left text-sm font-semibold text-navy"
                  >
                    動画でdemoを見る
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
