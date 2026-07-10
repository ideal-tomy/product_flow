export function DemoCTA() {
  return (
    <section className="border-t border-line bg-surface/60">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="text-2xl font-bold text-navy sm:text-[1.75rem]">
          御社の文書でも、小さく検証できます。
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          数ページのサンプル文書から始められます。強い売り込みではなく、実際の操作と回答の質で判断してください。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#demo"
            className="inline-flex items-center rounded-md bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-soft"
          >
            デモを試す
          </a>
          <a
            href="mailto:contact@example.com?subject=GembaShift%20%E6%96%87%E6%9B%B8%E6%A4%9C%E8%A8%BC%E3%81%AE%E7%9B%B8%E8%AB%87"
            className="inline-flex items-center rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:border-navy/35"
          >
            自社文書での活用を相談する
          </a>
        </div>
      </div>
    </section>
  );
}
