export function ProblemSection() {
  return (
    <section className="border-y border-line bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-14">
        <div className="flex items-baseline gap-1 text-navy">
          <span className="text-[6.5rem] font-bold leading-none tracking-tight sm:text-[8rem]">
            45
          </span>
          <span className="pb-3 text-3xl font-bold sm:pb-4 sm:text-4xl">分</span>
        </div>
        <div className="pb-2">
          <p className="text-sm font-medium tracking-wide text-navy-muted">
            ナレッジワーカーの実態
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-snug text-navy sm:text-[1.75rem]">
            現場の担当者が、ドキュメントを探し続けている。
          </h2>
          <p className="mt-3 text-muted">
            1件の差分確認に、毎回かかる時間。
          </p>
          <p className="mt-6 border-t border-line pt-4 text-sm text-muted">
            — 1冊 1,500ページ × 複数バージョン × 改訂が止まらない。
          </p>
        </div>
      </div>
    </section>
  );
}
