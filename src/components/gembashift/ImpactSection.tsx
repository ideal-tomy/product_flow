import { impactRows } from "../../data/gembashift-demo";

export function ImpactSection() {
  return (
    <section className="border-y border-line bg-surface/50">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-navy sm:text-[1.75rem]">
            現場の時間配分が、根本から変わる。
          </h2>
          <p className="mt-3 text-muted">
            検索の時間を、判断と提案の時間に転換する。
          </p>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-navy-muted">
                <th className="py-3 pr-4 font-medium">業務</th>
                <th className="py-3 pr-4 font-medium">Before</th>
                <th className="py-3 pr-4 font-medium">After</th>
                <th className="py-3 font-medium">削減率</th>
              </tr>
            </thead>
            <tbody>
              {impactRows.map((row) => (
                <tr key={row.task} className="border-b border-line/80">
                  <td className="py-3.5 pr-4 font-medium text-navy">{row.task}</td>
                  <td className="py-3.5 pr-4 text-muted line-through decoration-muted/40">
                    {row.before}
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-navy">{row.after}</td>
                  <td className="py-3.5 font-semibold text-success">{row.reduction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {["品質の均一化", "監査対応力の向上", "属人化の解消"].map((item) => (
            <p
              key={item}
              className="border-l-2 border-navy/30 pl-3 text-sm font-medium text-navy-muted"
            >
              {item}
            </p>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted">
          ※ 数値は実案件・対象文書・運用条件により変動します。
        </p>
      </div>
    </section>
  );
}
