import { useEffect, useMemo, useState } from "react";
import type { DemoDocument } from "../../data/ConformSystem-demo";
import type { KnowledgeChunk } from "../../ai/knowledge";

interface KnowledgeBrowserProps {
  document: DemoDocument;
  chunks: KnowledgeChunk[];
  /** 根拠ドロワーなどから条項を指定して開くとき */
  focusClauseId?: string | null;
  onAskAboutClause?: (chunk: KnowledgeChunk) => void;
}

function highlightText(text: string, highlight?: string) {
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

export function KnowledgeBrowser({
  document,
  chunks,
  focusClauseId,
  onAskAboutClause,
}: KnowledgeBrowserProps) {
  const docChunks = useMemo(
    () => chunks.filter((c) => c.documentId === document.id),
    [chunks, document.id],
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    () => docChunks[0]?.id ?? null,
  );

  useEffect(() => {
    if (focusClauseId) {
      const byClause = docChunks.find((c) => c.clauseId === focusClauseId);
      if (byClause) {
        setSelectedId(byClause.id);
        return;
      }
    }
    setSelectedId(docChunks[0]?.id ?? null);
  }, [document.id, docChunks, focusClauseId]);

  const selected =
    docChunks.find((c) => c.id === selectedId) ?? docChunks[0] ?? null;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-col gap-4 px-4 py-5 sm:px-6 lg:max-w-4xl">
      <div>
        <p className="text-[11px] font-bold tracking-[0.12em] text-navy">
          登録ナレッジ
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-navy">
          {document.name}
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          {document.version} · {document.note} · {docChunks.length} 条項
        </p>
      </div>

      {docChunks.length === 0 ? (
        <p className="rounded-md border border-line bg-surface/40 px-4 py-6 text-sm text-muted">
          この文書に紐づくチャンクがありません。
        </p>
      ) : (
        <div className="grid min-h-0 gap-4 lg:grid-cols-[13rem_1fr]">
          <ul className="max-h-[28rem] space-y-1 overflow-y-auto rounded-md border border-line bg-white p-2">
            {docChunks.map((c) => {
              const active = c.id === selected?.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full rounded px-2.5 py-2 text-left transition-colors ${
                      active
                        ? "bg-navy text-white"
                        : "text-navy-muted hover:bg-surface"
                    }`}
                  >
                    <span className="block font-mono text-xs">
                      §{c.clauseId}
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-[11px] ${
                        active ? "text-white/70" : "text-muted"
                      }`}
                    >
                      {c.page !== "—" ? `p.${c.page}` : c.category}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="rounded-md border border-line bg-surface/40 px-4 py-5">
            {selected ? (
              <>
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-navy-muted">
                      § {selected.clauseId}
                      {selected.page !== "—" ? ` · p.${selected.page}` : ""}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {selected.documentName} · {selected.version}
                    </p>
                  </div>
                  {onAskAboutClause && (
                    <button
                      type="button"
                      onClick={() => onAskAboutClause(selected)}
                      className="rounded border border-line px-2.5 py-1 text-xs font-semibold text-navy hover:border-navy/40"
                    >
                      この条項について聞く
                    </button>
                  )}
                </div>
                <div className="text-sm leading-relaxed text-ink">
                  {highlightText(selected.text, selected.highlight)}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
