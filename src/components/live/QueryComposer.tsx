interface QueryComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onOpenQueries?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** 入力欄直上の短いおすすめ（最大4） */
  quickItems?: { label: string; onSelect: () => void }[];
  /** Presentation / 動画用の大きめ入力 */
  prominent?: boolean;
}

export function QueryComposer({
  value,
  onChange,
  onSubmit,
  onOpenQueries,
  disabled,
  loading,
  quickItems,
  prominent = false,
}: QueryComposerProps) {
  return (
    <div className="border-t border-line bg-white">
      {quickItems && quickItems.length > 0 && (
        <div className="mx-auto flex max-w-2xl gap-1.5 overflow-x-auto px-4 pt-2.5 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickItems.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={disabled}
              onClick={item.onSelect}
              className="shrink-0 rounded-md border border-line bg-surface/50 px-2.5 py-1 text-[11px] text-navy-muted transition-colors hover:border-navy/30 hover:text-navy disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <form
        className={`px-4 sm:px-6 ${prominent ? "py-4" : "py-3"}`}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div
          className={`mx-auto flex gap-2 ${
            prominent ? "max-w-3xl lg:max-w-4xl" : "max-w-2xl"
          }`}
        >
          {onOpenQueries && (
            <button
              type="button"
              onClick={onOpenQueries}
              disabled={disabled}
              className={`shrink-0 rounded-md border border-line font-medium text-navy-muted transition-colors hover:border-navy/30 hover:text-navy disabled:opacity-50 ${
                prominent
                  ? "px-3 py-3.5 text-sm"
                  : "px-2.5 py-2.5 text-xs"
              }`}
              title="質問一覧を開く"
              aria-label="質問一覧を開く"
            >
              一覧
            </button>
          )}
          <label className="sr-only" htmlFor="live-query">
            質問を入力
          </label>
          <input
            id="live-query"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="仕様書について質問する…"
            className={`min-w-0 flex-1 rounded-md border border-line bg-white text-ink outline-none transition-shadow focus:border-navy/40 focus:ring-2 focus:ring-navy/15 disabled:opacity-60 ${
              prominent
                ? "border-navy/25 px-4 py-3.5 text-lg font-semibold"
                : "px-3 py-2.5 text-sm"
            }`}
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className={`shrink-0 rounded-md bg-navy font-semibold text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-50 ${
              prominent ? "px-5 py-3.5 text-base" : "px-4 py-2.5 text-sm font-medium"
            }`}
          >
            {loading ? "参照中…" : "送信"}
          </button>
        </div>
      </form>
    </div>
  );
}
