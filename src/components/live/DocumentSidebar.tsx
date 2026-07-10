import {
  scaleStats,
  sidebarDocuments,
  type DemoDocument,
} from "../../data/gembashift-demo";

interface DocumentSidebarProps {
  activeDocId: string;
  onSelect: (doc: DemoDocument) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function DocumentSidebar({
  activeDocId,
  onSelect,
  mobileOpen,
  onCloseMobile,
}: DocumentSidebarProps) {
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-navy-muted">
          DOCUMENTS
        </p>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="text-sm text-muted lg:hidden"
            aria-label="文書一覧を閉じる"
          >
            閉じる
          </button>
        )}
      </div>

      <div className="border-b border-line px-4 py-2.5">
        <p className="text-[11px] text-muted">
          {scaleStats.documents}文書 · {scaleStats.pages.toLocaleString()}ページ
        </p>
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {sidebarDocuments.map((doc) => {
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

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-line bg-white lg:block">
        {content}
      </aside>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-navy/40 lg:hidden"
          onClick={onCloseMobile}
        >
          <aside
            className="h-full w-72 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
