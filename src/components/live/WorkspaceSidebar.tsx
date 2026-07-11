import {
  scaleStats,
  sidebarDocuments,
  type DemoDocument,
} from "../../data/gembashift-demo";
import type { QueryCatalogItem } from "../../data/query-catalog";
import { queryCatalog } from "../../data/query-catalog";
import { QueryCatalog } from "./QueryCatalog";

export type SidebarMode = "docs" | "queries";

interface WorkspaceSidebarProps {
  mode: SidebarMode;
  onModeChange: (mode: SidebarMode) => void;
  activeDocId: string;
  onSelectDoc: (doc: DemoDocument) => void;
  onPickQuery: (item: QueryCatalogItem) => void;
  queryDisabled?: boolean;
  activeQueryId?: string | null;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  /** AI Mode など、文書一覧を差し替えるとき */
  documents?: DemoDocument[];
  docsStatLabel?: string;
  queries?: QueryCatalogItem[];
}

function DocsList({
  activeDocId,
  onSelect,
  onCloseMobile,
  documents,
  docsStatLabel,
}: {
  activeDocId: string;
  onSelect: (doc: DemoDocument) => void;
  onCloseMobile?: () => void;
  documents: DemoDocument[];
  docsStatLabel: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-4 py-2.5">
        <p className="text-[11px] text-muted">{docsStatLabel}</p>
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {documents.map((doc) => {
          const active = doc.id === activeDocId;
          return (
            <li key={doc.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(doc);
                  onCloseMobile?.();
                }}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  active
                    ? "bg-navy text-white"
                    : "text-navy-muted hover:bg-surface"
                }`}
              >
                <span className="block text-sm font-medium leading-snug">
                  {doc.name}
                </span>
                <span
                  className={`mt-0.5 block text-[11px] ${
                    active ? "text-white/70" : "text-muted"
                  }`}
                >
                  {doc.version} · {doc.note}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function WorkspaceSidebar({
  mode,
  onModeChange,
  activeDocId,
  onSelectDoc,
  onPickQuery,
  queryDisabled,
  activeQueryId,
  mobileOpen,
  onCloseMobile,
  documents,
  docsStatLabel,
  queries,
}: WorkspaceSidebarProps) {
  const docs = documents ?? sidebarDocuments;
  const catalog = queries ?? queryCatalog;
  const statLabel =
    docsStatLabel ??
    `${scaleStats.documents}文書 · ${scaleStats.pages.toLocaleString()}ページ`;

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-line p-2">
        <button
          type="button"
          onClick={() => onModeChange("docs")}
          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
            mode === "docs"
              ? "bg-navy text-white"
              : "text-navy-muted hover:bg-surface"
          }`}
        >
          文書
        </button>
        <button
          type="button"
          onClick={() => onModeChange("queries")}
          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
            mode === "queries"
              ? "bg-navy text-white"
              : "text-navy-muted hover:bg-surface"
          }`}
        >
          質問
          <span
            className={`ml-1 tabular-nums ${
              mode === "queries" ? "text-white/65" : "text-muted"
            }`}
          >
            {catalog.length}
          </span>
        </button>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-1 px-1.5 text-sm text-muted lg:hidden"
            aria-label="サイドバーを閉じる"
          >
            ×
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1">
        {mode === "docs" ? (
          <DocsList
            activeDocId={activeDocId}
            onSelect={onSelectDoc}
            onCloseMobile={onCloseMobile}
            documents={docs}
            docsStatLabel={statLabel}
          />
        ) : (
          <QueryCatalog
            onPick={onPickQuery}
            disabled={queryDisabled}
            onCloseMobile={onCloseMobile}
            activeId={activeQueryId}
            items={catalog}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[272px] shrink-0 border-r border-line bg-white lg:block">
        {content}
      </aside>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-navy/40 lg:hidden"
          onClick={onCloseMobile}
        >
          <aside
            className="h-full w-[300px] bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
