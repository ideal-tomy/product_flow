import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "../brand/BrandMark";

type Props = {
  brandSub?: string;
  headerEnd?: ReactNode;
  children: ReactNode;
  stickyFooter?: ReactNode;
  maxWidthClass?: string;
};

/**
 * 公開ハブ／プレイヤー共通の紙面キャンバス。
 */
export function PlayShell({
  brandSub,
  headerEnd,
  children,
  stickyFooter,
  maxWidthClass = "max-w-2xl",
}: Props) {
  return (
    <div className="min-h-dvh text-ink">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-white/95 backdrop-blur-sm">
        <div
          className={`mx-auto flex h-12 min-h-11 items-center justify-between gap-3 px-4 sm:h-14 sm:px-6 ${maxWidthClass}`}
        >
          <div className="min-w-0">
            <BrandMark showProduct={!brandSub} />
            {brandSub ? (
              <p className="truncate text-[11px] text-muted">{brandSub}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {headerEnd}
          </div>
        </div>
      </header>

      <div
        className={`mx-auto px-3 py-4 sm:px-6 sm:py-8 ${maxWidthClass} ${
          stickyFooter ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))]" : ""
        }`}
      >
        <div className="rounded-xl border border-line bg-white shadow-[0_16px_48px_-32px_rgba(11,31,58,0.35)]">
          <div className="space-y-6 p-4 sm:space-y-8 sm:p-8">{children}</div>
        </div>
      </div>

      {stickyFooter}
    </div>
  );
}

export function PlayHeaderLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-11 items-center px-1 text-xs font-medium text-navy-muted hover:text-navy"
    >
      {children}
    </Link>
  );
}
