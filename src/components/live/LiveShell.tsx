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
  onExitVideo?: () => void;
  hideChrome?: boolean;
  /** ヘッダー中央の案件名 */
  packTitle?: string;
  packLabel?: string;
  packId?: KnowledgePackId;
  onPackChange?: (id: KnowledgePackId) => void;
  /** true のときパック切替バーを出さない（公開ガイド入口） */
  hidePackSwitcher?: boolean;
  versionLabel?: string;
  aiSubtitle?: string;
  children: ReactNode;
}

function WorkspaceNav({
  isAi,
  sampleLink,
  aiLink,
}: {
  isAi: boolean;
  sampleLink: string;
  aiLink: string;
}) {
  return (
    <nav
      className="flex shrink-0 items-center gap-1 text-[12px]"
      aria-label="画面切替"
    >
      <Link
        to={sampleLink}
        className={`min-h-9 rounded px-2.5 py-1.5 transition-colors ${
          !isAi
            ? "font-semibold text-navy"
            : "text-muted hover:text-navy"
        }`}
      >
        文書
      </Link>
      <span className="text-line" aria-hidden="true">
        |
      </span>
      <Link
        to={aiLink}
        className={`min-h-9 rounded px-2.5 py-1.5 transition-colors ${
          isAi
            ? "font-semibold text-navy"
            : "text-muted hover:text-navy"
        }`}
      >
        ナレッジ
      </Link>
    </nav>
  );
}

export function LiveShell({
  onOpenDocs,
  onOpenQueries,
  presentation = false,
  autoplay = false,
  mode = "sample",
  onTogglePresentation,
  onExitVideo,
  hideChrome = false,
  packTitle = "SOP-組立-07",
  packLabel,
  packId,
  onPackChange,
  hidePackSwitcher = false,
  versionLabel,
  aiSubtitle,
  children,
}: LiveShellProps) {
  const isAi = mode === "ai";
  const showPackSwitcher =
    Boolean(packId && onPackChange) &&
    !hidePackSwitcher &&
    !presentation &&
    !autoplay;

  const sampleLink = packId ? `/?pack=${packId}` : "/";
  const aiLink = packId ? `/ai?pack=${packId}` : "/ai";

  const headerTitle =
    packLabel && packTitle ? `${packLabel} · ${packTitle}` : packTitle;

  const [menuOpen, setMenuOpen] = useState(false);
  const [ddReturnUrl, setDdReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    if (qs.get("from") !== "dd") return;
    const ret = qs.get("return");
    if (ret) setDdReturnUrl(ret);
  }, []);

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

  const DdReturnLink = ddReturnUrl ? (
    <a
      href={ddReturnUrl}
      className="shrink-0 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy/40 sm:text-sm"
    >
      DD画面に戻る
    </a>
  ) : null;

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
            ConformSystem
          </p>
          <p className="truncate text-[11px] text-muted">
            {presentation || autoplay
              ? (aiSubtitle ?? headerTitle)
              : headerTitle}
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
        ) : presentation && onTogglePresentation ? (
          <button
            type="button"
            onClick={onTogglePresentation}
            className="min-h-11 shrink-0 rounded-md border border-line bg-white px-3 text-xs font-semibold text-navy"
          >
            戻る
          </button>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            {DdReturnLink}
            <WorkspaceNav
              isAi={isAi}
              sampleLink={sampleLink}
              aiLink={aiLink}
            />
          </div>
        )}
      </header>

      {/* —— Desktop header (lg+) —— */}
      <header className="hidden h-12 shrink-0 items-center gap-2 border-b border-line bg-white px-3 sm:gap-3 sm:px-4 lg:flex">
        <span className="text-sm font-semibold tracking-wide text-navy">
          ConformSystem
        </span>
        <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />
        <div className="min-w-0 flex-1 truncate text-sm text-navy-muted">
          {presentation || autoplay ? (
            <span className="tabular-nums text-navy">
              {aiSubtitle ?? headerTitle}
            </span>
          ) : (
            <span className="text-navy">{headerTitle}</span>
          )}
        </div>

        {DdReturnLink}

        {autoplay && onExitVideo && (
          <button
            type="button"
            onClick={onExitVideo}
            className="shrink-0 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy/40 sm:text-sm"
          >
            戻る
          </button>
        )}

        {presentation && !autoplay && onTogglePresentation && (
          <button
            type="button"
            onClick={onTogglePresentation}
            className="shrink-0 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy/40 sm:text-sm"
          >
            戻る
          </button>
        )}

        {!autoplay && !presentation && (
          <WorkspaceNav
            isAi={isAi}
            sampleLink={sampleLink}
            aiLink={aiLink}
          />
        )}

        {!presentation && versionLabel && (
          <span className="text-xs text-muted">{versionLabel}</span>
        )}
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
              <li>
                <Link
                  to={sampleLink}
                  onClick={closeMenu}
                  className="flex min-h-12 w-full items-center px-3 text-left text-sm font-medium text-navy"
                >
                  文書
                </Link>
              </li>
              <li>
                <Link
                  to={aiLink}
                  onClick={closeMenu}
                  className="flex min-h-12 w-full items-center px-3 text-left text-sm font-medium text-navy"
                >
                  ナレッジ
                </Link>
              </li>
              {ddReturnUrl ? (
                <li>
                  <a
                    href={ddReturnUrl}
                    onClick={closeMenu}
                    className="flex min-h-12 w-full items-center px-3 text-left text-sm font-medium text-navy"
                  >
                    DD画面に戻る
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
