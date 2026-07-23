import type { DemoAnswer } from "../../data/ConformSystem-demo";
import type { SourceReference } from "../../data/ConformSystem-demo";
import { brandConfig } from "../../config/brand.config";

interface AnswerCardProps {
  answer: DemoAnswer;
  showGenericBefore: boolean;
  genericBeforeText: string;
  onSelectSource: (source: SourceReference) => void;
  selectedSourceKey?: string;
}

function sourceKey(source: SourceReference) {
  return `${source.documentName}-${source.version}-${source.clauseId}-${source.page}`;
}

export function AnswerCard({
  answer,
  showGenericBefore,
  genericBeforeText,
  onSelectSource,
  selectedSourceKey,
}: AnswerCardProps) {
  return (
    <div className="space-y-4">
      {showGenericBefore && (
        <details className="fade-in rounded-md border border-line bg-surface/80 px-4 py-3 text-sm open:pb-4">
          <summary className="cursor-pointer font-medium text-navy-muted">
            一般的なAI / RAG なら…
          </summary>
          <div className="mt-3 border-l-2 border-danger/50 pl-3 text-muted">
            <p>{genericBeforeText}</p>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              <li>・版数を取り違える</li>
              <li>・数値の根拠が出ない</li>
              <li>・差分・影響範囲を見落とす</li>
            </ul>
          </div>
        </details>
      )}

      <div className="fade-in rounded-md border border-line bg-white p-4 sm:p-5">
        <p className="text-xs font-medium tracking-wide text-success">
          {brandConfig.assistantLabel}
        </p>
        <p className="mt-2 text-[1.05rem] font-semibold leading-relaxed text-navy">
          {answer.summary}
        </p>

        {answer.changes && answer.changes.length > 0 ? (
          <div className="fade-in-delay-1 mt-4 min-w-0">
            <ul className="space-y-2 lg:hidden">
              {answer.changes.map((c) => (
                <li
                  key={c.id}
                  className="rounded-md border border-line bg-surface/40 px-3 py-3"
                >
                  <p className="text-sm font-medium text-navy">{c.title}</p>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-[11px] text-muted">v3.2</dt>
                      <dd className="text-muted line-through decoration-muted/50">
                        {c.before}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-muted">v3.4</dt>
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
                    <th className="px-3 py-2 font-medium">v3.2</th>
                    <th className="px-3 py-2 font-medium">v3.4</th>
                  </tr>
                </thead>
                <tbody>
                  {answer.changes.map((c) => (
                    <tr key={c.id}>
                      <td className="border-t border-line px-3 py-2.5 text-muted">
                        {c.title}
                      </td>
                      <td className="border-t border-line px-3 py-2.5 text-muted line-through decoration-muted/50">
                        {c.before}
                      </td>
                      <td className="border-t border-line px-3 py-2.5 font-semibold text-navy">
                        {c.after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          answer.before &&
          answer.after && (
            <div className="fade-in-delay-1 mt-4 min-w-0">
              <div className="rounded-md border border-line bg-surface/40 px-3 py-3 lg:hidden">
                <p className="text-sm font-medium text-navy">
                  {answer.comparisonLabel ?? "値"}
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-[11px] text-muted">v3.2</dt>
                    <dd className="text-muted line-through decoration-muted/50">
                      {answer.before}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted">v3.4</dt>
                    <dd className="font-semibold text-navy">{answer.after}</dd>
                  </div>
                </dl>
              </div>
              <div className="hidden overflow-hidden rounded-md border border-line lg:block">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-left text-navy-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">項目</th>
                      <th className="px-3 py-2 font-medium">v3.2</th>
                      <th className="px-3 py-2 font-medium">v3.4</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-t border-line px-3 py-2.5 text-muted">
                        {answer.comparisonLabel ?? "値"}
                      </td>
                      <td className="border-t border-line px-3 py-2.5 text-muted line-through decoration-muted/50">
                        {answer.before}
                      </td>
                      <td className="border-t border-line px-3 py-2.5 font-semibold text-navy">
                        {answer.after}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {answer.impactGroups && answer.impactGroups.length > 0 ? (
          <div className="fade-in-delay-2 mt-4 space-y-3">
            {answer.impactGroups.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-medium tracking-wide text-navy-muted">
                  {group.label}（{group.count}）
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
          </div>
        ) : (
          answer.impactAreas &&
          answer.impactAreas.length > 0 && (
            <div className="fade-in-delay-2 mt-4">
              <p className="text-xs font-medium tracking-wide text-navy-muted">影響範囲</p>
              <ul className="mt-2 space-y-1.5 text-sm text-ink">
                {answer.impactAreas.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-navy" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}

        {answer.exceptionNote && (
          <p className="fade-in-delay-2 mt-3 rounded-md bg-surface px-3 py-2 text-sm text-navy-muted">
            {answer.exceptionNote}
          </p>
        )}

        <div className="fade-in-delay-3 mt-5 border-t border-line pt-4">
          <p className="text-xs font-medium tracking-wide text-navy-muted">根拠・出典</p>
          <div className="mt-2 space-y-2">
            {answer.sources.map((source) => {
              const key = sourceKey(source);
              const active = selectedSourceKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectSource(source)}
                  className={`w-full rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? "border-navy bg-navy/[0.04]"
                      : "border-line hover:border-navy/35"
                  }`}
                >
                  <p className="font-medium text-navy">
                    {source.documentName} {source.version}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    p.{source.page} / 条項 {source.clauseId}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
