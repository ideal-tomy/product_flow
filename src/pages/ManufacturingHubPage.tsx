import { Link } from "react-router-dom";
import { getRoiSimulatorUrl } from "../lib/roiLink";

const demos = [
  {
    id: "1",
    badge: "製造①",
    role: "現場",
    title: "現場判断",
    lead: "ガイドのあと、現場言葉で聞いて根拠付きで動く（社内ボット体験）。",
    climax: "塗装剥がれ・手直しなど、現場一言が規程フローに着地する",
    href: "/play/minato-factory",
    primary: true,
  },
  {
    id: "2",
    badge: "製造②",
    role: "管理",
    title: "手順改定・教育",
    lead: "SOPの差分から、影響・再教育・現場適用の可否まで見通す。",
    climax: "この改定を現場適用して大丈夫か",
    href: "/play/work-procedure",
    primary: false,
  },
  {
    id: "3",
    badge: "製造③",
    role: "設計・品質",
    title: "変更影響",
    lead: "仕様の版上げが、制御・試験・FMEAのどこまで波及するかを一覧する。",
    climax: "この変更の影響範囲は？",
    href: "/play/tcu-480",
    primary: false,
  },
] as const;

export function ManufacturingHubPage() {
  const roiHref = getRoiSimulatorUrl();

  return (
    <div className="min-h-dvh bg-surface/40 text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-wide text-navy">
              ConformSystem
            </p>
            <p className="truncate text-[11px] text-muted">製造 · 判断デモ</p>
          </div>
          <Link
            to="/lp"
            className="text-xs font-medium text-navy-muted hover:text-navy"
          >
            製品説明
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <p className="text-[11px] font-medium tracking-[0.18em] text-navy-muted uppercase">
          Manufacturing hub
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          製造の判断を、3テーマで体験する
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          楔は「文書と現場判断の隙間」。各テーマはガイド →
          現場言葉で社内ボット体験。ワークフロー画面は作りません。
        </p>

        <p className="mt-6 rounded-md border border-navy/15 bg-white px-4 py-3 text-sm leading-relaxed text-navy">
          現場は①で動き、改定は②で揃え、設計変更は③で漏らさない。つながると「判断が止まらない工場」になる。
        </p>

        <ul className="mt-8 space-y-4">
          {demos.map((demo) => (
            <li key={demo.id}>
              <Link
                to={demo.href}
                className={`block rounded-lg border bg-white p-5 transition-colors hover:border-navy/35 ${
                  demo.primary
                    ? "border-navy/30 shadow-[0_12px_40px_-28px_rgba(11,31,58,0.45)]"
                    : "border-line"
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-[11px] font-semibold tracking-wide text-navy-muted">
                    {demo.badge}
                  </span>
                  <span className="text-[11px] text-muted">· {demo.role}</span>
                  {demo.primary && (
                    <span className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      おすすめ
                    </span>
                  )}
                </div>
                <h2 className="mt-1.5 text-lg font-semibold text-navy">
                  {demo.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {demo.lead}
                </p>
                <p className="mt-3 text-xs text-navy-muted">
                  本命: {demo.climax}
                </p>
                <p className="mt-3 text-sm font-semibold text-navy">
                  体験する →
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 border-t border-line pt-8">
          <p className="text-sm text-muted">
            サンプル文書によるデモです。本番の文書・承認フローは案件ごとに設計します。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {roiHref && (
              <a
                href={roiHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-soft"
              >
                投資回収の目安を見る
              </a>
            )}
            <Link
              to="/play/minato-factory"
              className="inline-flex rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-navy/40"
            >
              ①から始める
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
