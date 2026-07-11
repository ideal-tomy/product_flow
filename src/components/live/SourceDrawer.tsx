import type { DemoDocument, SourceReference } from "../../data/ConformSystem-demo";

interface SourceDrawerProps {
  open: boolean;
  source: SourceReference | null;
  sources: SourceReference[];
  activeDoc: DemoDocument;
  onSelectSource: (source: SourceReference) => void;
  onClose: () => void;
  isMobile: boolean;
  /** 登録ナレッジの該当文書へジャンプ（AI Mode） */
  onBrowseDocument?: (documentId: string, clauseId?: string) => void;
}

function highlightBody(text: string, highlight?: string) {
  if (!highlight || !text.includes(highlight)) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }
  const parts = text.split(highlight);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <mark className="rounded-sm bg-[#dce8f5] px-0.5 text-navy">
              {highlight}
            </mark>
          )}
        </span>
      ))}
    </span>
  );
}

export function SourceDrawer({
  open,
  source,
  sources,
  activeDoc,
  onSelectSource,
  onClose,
  isMobile,
  onBrowseDocument,
}: SourceDrawerProps) {
  if (!open) return null;

  const body = source?.fullText ?? source?.excerpt ?? "";

  const panel = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-navy-muted">
            SOURCE
          </p>
          {source ? (
            <>
              <p className="mt-1 text-sm font-semibold text-navy">
                {source.documentName} {source.version}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                p.{source.page} · 条項 {source.clauseId}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">根拠を選択してください</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-1 text-sm text-muted hover:bg-surface hover:text-navy"
          aria-label="出典を閉じる"
        >
          閉じる
        </button>
      </div>

      {sources.length > 1 && (
        <div className="flex flex-wrap gap-1.5 border-b border-line px-4 py-2">
          {sources.map((s) => {
            const key = `${s.documentName}-${s.version}-${s.clauseId}-${s.page}`;
            const active =
              source?.clauseId === s.clauseId &&
              source?.version === s.version &&
              source?.page === s.page &&
              source?.documentName === s.documentName;
            const matchesActiveDoc =
              s.documentName === activeDoc.name &&
              (s.version === activeDoc.version ||
                `v${s.version}` === activeDoc.version ||
                s.version === activeDoc.version.replace(/^v/, ""));
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectSource(s)}
                className={`rounded border px-2 py-1 text-xs transition-colors ${
                  active
                    ? "border-navy bg-navy text-white"
                    : matchesActiveDoc
                      ? "border-navy/30 text-navy"
                      : "border-line text-muted hover:border-navy/30"
                }`}
              >
                §{s.clauseId} · {s.version}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {source ? (
          <div className="space-y-3">
            <div className="rounded-md border border-line bg-surface/40 px-4 py-5">
              <p className="mb-3 font-mono text-xs text-navy-muted">
                § {source.clauseId}
                {source.fullText ? " · 原文" : " · 抜粋"}
              </p>
              <div className="text-sm leading-relaxed text-ink">
                {highlightBody(body, source.highlight)}
              </div>
            </div>
            {onBrowseDocument && source.documentId && (
              <button
                type="button"
                onClick={() =>
                  onBrowseDocument(source.documentId!, source.clauseId)
                }
                className="text-sm font-semibold text-navy underline-offset-2 hover:underline"
              >
                この文書の他条項を見る →
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">
            回答の根拠を選択すると、該当条項の原文を表示します。
          </p>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end bg-navy/40"
        role="dialog"
        aria-modal="true"
        aria-label="出典"
        onClick={onClose}
      >
        <div
          className="max-h-[80vh] w-full overflow-hidden rounded-t-lg border-t border-line"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-[70vh]">{panel}</div>
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden w-[360px] shrink-0 border-l border-line lg:block">
      {panel}
    </aside>
  );
}
