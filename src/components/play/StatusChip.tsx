type Props = {
  live: boolean;
  hasUserDoc: boolean;
};

/** Sample / Live / Live·自社資料 — 説明文の代わりに状態を示す */
export function StatusChip({ live, hasUserDoc }: Props) {
  let label = "Sample";
  let className =
    "border-line bg-surface text-navy-muted";

  if (live && hasUserDoc) {
    label = "Live · 自社資料";
    className = "border-success/30 bg-success/10 text-success";
  } else if (live) {
    label = "Live";
    className = "border-navy/25 bg-navy/5 text-navy";
  }

  return (
    <span
      className={`inline-flex max-w-[9.5rem] truncate rounded border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${className}`}
      title={label}
    >
      {label}
    </span>
  );
}
