import type { SourceReference } from "../../data/gembashift-demo";

interface SourcePanelProps {
  source: SourceReference | null;
  onClose?: () => void;
  asModal?: boolean;
}

function highlightExcerpt(excerpt: string, highlight?: string) {
  if (!highlight || !excerpt.includes(highlight)) {
    return <span>{excerpt}</span>;
  }
  const parts = excerpt.split(highlight);
  return (
    <>
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
    </>
  );
}

export function SourcePanel({ source, onClose, asModal }: SourcePanelProps) {
  if (!source) {
    return (
      <div className="flex h-full min-h-[280px] flex-col justify-center rounded-md border border-dashed border-line bg-surface/50 px-5 py-8 text-center">
        <p className="text-sm font-medium text-navy-muted">出典パネル</p>
        <p className="mt-2 text-sm text-muted">
          回答の根拠カードを選ぶと、該当条項の抜粋とハイライトを表示します。
        </p>
      </div>
    );
  }

  const content = (
    <div className="flex h-full flex-col rounded-md border border-line bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-navy-muted">出典文書</p>
          <p className="mt-1 font-semibold text-navy">
            {source.documentName} {source.version}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            p.{source.page} · 条項 {source.clauseId}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-muted hover:bg-surface hover:text-navy"
            aria-label="出典パネルを閉じる"
          >
            閉じる
          </button>
        )}
      </div>

      <div className="flex-1 px-4 py-4">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted">
          <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-navy-muted">
            § {source.clauseId}
          </span>
          <span>該当箇所</span>
        </div>
        <div className="rounded-md border border-line bg-surface/40 px-4 py-4 text-sm leading-relaxed text-ink">
          {highlightExcerpt(source.excerpt, source.highlight)}
        </div>
        <p className="mt-4 text-xs text-muted">
          差分ハイライトは構造化データ上の該当語句を示しています。
        </p>
      </div>
    </div>
  );

  if (asModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-label="出典詳細"
        onClick={onClose}
      >
        <div
          className="max-h-[85vh] w-full max-w-lg overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return content;
}
