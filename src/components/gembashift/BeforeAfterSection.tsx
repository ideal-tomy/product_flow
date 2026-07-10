export function BeforeAfterSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-navy sm:text-[1.75rem]">
          同じ質問でも、答えの解像度が違う。
        </h2>
        <p className="mt-3 text-sm text-muted">
          現場の問い：v3.2とv3.4で、温度センサーの許容範囲は変わりましたか？
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-line bg-surface/70 p-5">
          <p className="text-xs font-medium tracking-wide text-muted">
            BEFORE · 汎用チャットAI / RAG
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            バージョン間で変更された可能性はありますが、詳細は仕様書をご確認ください。
            <span className="mt-2 block text-xs">出典：なし</span>
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-danger">×</span>
              版数を取り違える
            </li>
            <li className="flex gap-2">
              <span className="text-danger">×</span>
              数値の根拠が出ない
            </li>
            <li className="flex gap-2">
              <span className="text-danger">×</span>
              差分・影響範囲を見落とす
            </li>
          </ul>
        </div>

        <div className="rounded-md border border-navy/25 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(11,31,58,0.4)]">
          <p className="text-xs font-medium tracking-wide text-success">
            AFTER · 構造化AI（GembaShift）
          </p>
          <p className="mt-4 text-sm leading-relaxed text-navy">
            はい、許容範囲が変更されています。
            <br />
            v3.2: ±5℃ → v3.4: ±3℃（条項 4.1.3）
            <br />
            影響範囲：制御ロジック 3箇所（条項 4.1.4 / 4.2.1 / 5.3.2）
          </p>
          <p className="mt-3 rounded-md bg-surface px-3 py-2 text-xs text-navy-muted">
            制御仕様書 v3.4 p.214〜218 / 根拠条項 4.1.3, 4.1.4, 4.2.1, 5.3.2
          </p>
          <ul className="mt-5 space-y-2 text-sm text-navy-muted">
            <li className="flex gap-2">
              <span className="text-success">✓</span>
              条項IDで確定回答
            </li>
            <li className="flex gap-2">
              <span className="text-success">✓</span>
              例外規定も自動でチェック
            </li>
            <li className="flex gap-2">
              <span className="text-success">✓</span>
              出典ページまで追跡可能
            </li>
          </ul>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        — 推測ではなく参照することで、現場での判断品質が均一になる。
      </p>
    </section>
  );
}
