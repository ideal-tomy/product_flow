export function DemoHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.4)_70%,#fff_100%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
        <div>
          <p className="mb-4 text-sm font-medium tracking-[0.08em] text-navy-muted">
            ConformSystem
          </p>
          <h1 className="text-[2.15rem] font-bold leading-[1.25] tracking-tight text-navy sm:text-[2.75rem]">
            探す時間を、
            <br />
            判断する時間へ。
          </h1>
          <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-muted">
            仕様書・設計基準・変更履歴を、
            <br className="hidden sm:block" />
            現場がそのまま質問できる状態に。
          </p>
          <p className="mt-3 text-sm text-navy-muted">
            根拠・出典・差分・影響範囲まで、数秒で確認。
          </p>
          <div className="mt-8">
            <a
              href="#demo"
              className="inline-flex items-center rounded-md bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-soft"
            >
              デモを試す
            </a>
          </div>
        </div>

        <div
          className="relative rounded-lg border border-line bg-white/90 p-4 shadow-[0_20px_50px_-28px_rgba(11,31,58,0.35)]"
          aria-hidden="true"
        >
          <div className="mb-3 flex items-center gap-2 border-b border-line pb-3">
            <span className="h-2 w-2 rounded-full bg-navy/30" />
            <span className="h-2 w-2 rounded-full bg-navy/20" />
            <span className="h-2 w-2 rounded-full bg-navy/10" />
            <span className="ml-2 text-xs text-muted">制御仕様書 v3.4 — 条項照会</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="rounded-md bg-surface px-3 py-2 text-navy-muted">
              v3.2とv3.4で、温度センサーの許容範囲は変わりましたか？
            </div>
            <div className="rounded-md border border-line px-3 py-3">
              <p className="font-medium text-navy">はい、許容範囲が変更されています。</p>
              <p className="mt-2 text-muted">
                v3.2: ±5℃ → v3.4: ±3℃
              </p>
              <p className="mt-1 text-xs text-navy-muted">
                根拠条項 4.1.3 / p.214〜218
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
