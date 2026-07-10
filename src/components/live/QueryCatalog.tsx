import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  countByCategory,
  filterQueryCatalog,
  queryCatalog,
  queryCategories,
  type QueryCatalogItem,
  type QueryCategoryId,
} from "../../data/query-catalog";

interface QueryCatalogProps {
  onPick: (item: QueryCatalogItem) => void;
  disabled?: boolean;
  onCloseMobile?: () => void;
  /** 直近で選んだ／送信したシナリオ id（ハイライト用） */
  activeId?: string | null;
}

export function QueryCatalog({
  onPick,
  disabled,
  onCloseMobile,
  activeId,
}: QueryCatalogProps) {
  const [category, setCategory] = useState<QueryCategoryId>("all");
  const [query, setQuery] = useState("");
  const [focusIndex, setFocusIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const counts = useMemo(() => countByCategory(queryCatalog), []);
  const filtered = useMemo(
    () => filterQueryCatalog(queryCatalog, category, query),
    [category, query],
  );

  useEffect(() => {
    setFocusIndex(0);
  }, [category, query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${focusIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [focusIndex]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[focusIndex];
      if (item) {
        onPick(item);
        onCloseMobile?.();
      }
    }
  };

  return (
    <div className="flex h-full flex-col" onKeyDown={handleKeyDown}>
      <div className="border-b border-line px-3 pb-3 pt-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted">
            {filtered.length}
            <span className="text-muted/80"> / {queryCatalog.length} 件</span>
          </p>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="text-sm text-muted lg:hidden"
              aria-label="照会一覧を閉じる"
            >
              閉じる
            </button>
          )}
        </div>
        <label className="sr-only" htmlFor="query-catalog-search">
          質問を検索
        </label>
        <input
          ref={searchRef}
          id="query-catalog-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="キーワードで絞る…"
          className="w-full rounded-md border border-line bg-surface/60 px-2.5 py-1.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-navy/35 focus:ring-2 focus:ring-navy/10"
        />
        <div
          className="mt-2 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="質問カテゴリ"
        >
          {queryCategories.map((cat) => {
            const active = category === cat.id;
            const count = counts[cat.id];
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(cat.id)}
                className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-navy text-white"
                    : "bg-surface text-navy-muted hover:bg-surface-warm"
                }`}
                title={cat.label}
              >
                {cat.short}
                <span
                  className={`ml-1 tabular-nums ${
                    active ? "text-white/65" : "text-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ul
        ref={listRef}
        className="flex-1 space-y-0.5 overflow-y-auto p-2"
        role="listbox"
        aria-label="質問一覧"
      >
        {filtered.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-muted">
            該当する質問がありません
          </li>
        )}
        {filtered.map((item, index) => {
          const selected = activeId === item.id;
          const focused = index === focusIndex;
          return (
            <li key={item.id} role="option" aria-selected={selected || focused}>
              <button
                type="button"
                data-index={index}
                disabled={disabled}
                onMouseEnter={() => setFocusIndex(index)}
                onClick={() => {
                  onPick(item);
                  onCloseMobile?.();
                }}
                className={`w-full rounded-md px-2.5 py-2 text-left transition-colors disabled:opacity-50 ${
                  selected
                    ? "bg-navy text-white"
                    : focused
                      ? "bg-surface"
                      : "hover:bg-surface/80"
                }`}
              >
                <span
                  className={`block text-[13px] font-medium leading-snug ${
                    selected ? "text-white" : "text-navy"
                  }`}
                >
                  {item.label}
                </span>
                {item.hint && (
                  <span
                    className={`mt-0.5 block text-[11px] leading-snug ${
                      selected ? "text-white/65" : "text-muted"
                    }`}
                  >
                    {item.hint}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-line px-3 py-2 text-[10px] leading-relaxed text-muted">
        選ぶと質問が送信されます。↑↓で移動、Enterで決定。
      </p>
    </div>
  );
}
