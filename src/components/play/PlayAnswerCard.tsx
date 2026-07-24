import type { DemoAnswer } from "../../data/demo-types";

type Props = {
  answer: DemoAnswer | null;
  loading: boolean;
  lastQuestion: string | null;
  refused: boolean;
  emptyHintNumber?: number;
};

export function PlayAnswerCard({
  answer,
  loading,
  lastQuestion,
  refused,
  emptyHintNumber = 1,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-lg border border-line bg-surface/40 px-4 py-8 text-center text-sm text-muted fade-in">
        照合中…
      </div>
    );
  }

  if (!answer) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface/30 px-4 py-12 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/25 bg-white text-sm font-semibold text-navy shadow-sm">
          {emptyHintNumber}
        </span>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-3">
      {lastQuestion && (
        <p className="text-sm text-muted">
          <span className="text-navy-muted">Q.</span> {lastQuestion}
          {refused && (
            <span className="ml-2 text-xs text-danger">回答を控えました</span>
          )}
        </p>
      )}

      <div className="rounded-lg border border-line bg-white p-4 sm:p-5">
        <p className="text-[1.05rem] font-semibold leading-relaxed text-navy">
          {answer.summary}
        </p>

        {answer.imageSrc && (
          <figure className="mt-4 overflow-hidden rounded-lg border border-line/80 bg-surface/40">
            <img
              src={answer.imageSrc}
              alt={answer.imageAlt ?? ""}
              className="aspect-video w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </figure>
        )}

        {(answer.before || answer.after) && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {answer.before && (
              <div className="rounded-md border border-line bg-surface/50 px-3 py-2">
                <p className="text-[11px] text-muted">
                  {answer.comparisonLabel ?? "比較"}
                </p>
                <p className="mt-1 text-sm text-muted line-through decoration-muted/40">
                  {answer.before}
                </p>
              </div>
            )}
            {answer.after && (
              <div className="rounded-md border border-navy/25 bg-navy/5 px-3 py-2">
                <p className="text-[11px] text-navy-muted">優先</p>
                <p className="mt-1 text-sm font-semibold text-navy">
                  {answer.after}
                </p>
              </div>
            )}
          </div>
        )}

        {answer.sources.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-line pt-3">
            {answer.sources.map((s) => (
              <li
                key={`${s.documentId ?? s.documentName}-${s.clauseId}-${s.page}`}
                className="rounded-md border border-line/80 bg-surface/40 px-3 py-2.5"
              >
                <p className="font-mono text-[11px] font-medium tracking-tight text-navy-muted">
                  {s.documentName}
                  {s.clauseId ? ` · ${s.clauseId}` : ""}
                  {s.version ? ` · ${s.version}` : ""}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted line-clamp-3 sm:line-clamp-none">
                  {s.excerpt}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
