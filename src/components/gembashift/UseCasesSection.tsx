import { checklistItems } from "../../data/gembashift-demo";

export function UseCasesSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-medium tracking-wide text-navy-muted">
          診断チェックリスト
        </p>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-[1.75rem]">
          貴社にも、こんな業務、ありませんか？
        </h2>
        <p className="mt-3 text-muted">
          大量の文書を、人が探し続けている業務へ。
        </p>
      </div>

      <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {checklistItems.map((item) => (
          <div key={item.title} className="bg-white p-5">
            <h3 className="font-semibold text-navy">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-md bg-navy px-4 py-3 text-sm text-white/90">
        → 1つでも該当したら、構造化AIで一気に解決可能。御社のドキュメントで効果検証できます。
      </p>
      <p className="mt-3 text-sm text-muted">
        — 検索を減らすことは、現場の判断時間を増やすこと。
      </p>
    </section>
  );
}
