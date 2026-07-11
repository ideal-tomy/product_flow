import { impactRows } from "../../data/ConformSystem-demo";

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

        <ul className="mt-8 space-y-3 lg:hidden">
          {impactRows.map((row) => (
            <li
              key={row.task}
              className="rounded-md border border-line bg-white px-4 py-3"
            >
              <p className="text-sm font-medium text-navy">{row.task}</p>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-[11px] text-muted">Before</dt>
                  <dd className="text-muted line-through decoration-muted/40">
                    {row.before}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted">After</dt>
                  <dd className="font-semibold text-navy">{row.after}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted">削減</dt>
                  <dd className="font-semibold text-success">{row.reduction}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <div className="mt-8 hidden lg:block">
          <table className="w-full text-left text-sm">
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
