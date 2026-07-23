import { Link } from "react-router-dom";
import { PlayShell } from "../components/play/PlayShell";
import { getContactUrl } from "../lib/contactLink";
import { getRoiSimulatorUrl } from "../lib/roiLink";

const demos = [
  {
    id: "1",
    badge: "①",
    role: "現場",
    title: "現場判断",
    question: "塗装剥がれ、どうする？",
    href: "/play/minato-factory",
    primary: true,
  },
  {
    id: "2",
    badge: "②",
    role: "管理",
    title: "手順改定・教育",
    question: "この改定、現場に適用して大丈夫？",
    href: "/play/work-procedure",
    primary: false,
  },
  {
    id: "3",
    badge: "③",
    role: "設計・品質",
    title: "変更影響",
    question: "この変更の影響範囲は？",
    href: "/play/tcu-480",
    primary: false,
  },
] as const;

const relation = [
  { n: "①", verb: "動く" },
  { n: "②", verb: "揃える" },
  { n: "③", verb: "漏らさない" },
] as const;

export function ManufacturingHubPage() {
  const roiHref = getRoiSimulatorUrl();
  const contactHref = getContactUrl();

  return (
    <PlayShell
      brandSub="製造 · 判断デモ"
      maxWidthClass="max-w-3xl"
      headerEnd={
        <a
          href="/lp"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center px-1 text-xs font-medium text-navy-muted hover:text-navy"
        >
          製品説明
        </a>
      }
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          製造の判断を、3テーマで体験する
        </h1>

        {/* 関係ストリップ: モバイル縦 / sm以上横 */}
        <div className="mt-6 rounded-lg border border-navy/15 bg-surface/40 px-4 py-3">
          <ul className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
            {relation.map((r, i) => (
              <li
                key={r.n}
                className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3"
              >
                {i > 0 && (
                  <span
                    className="text-xs text-navy-muted sm:text-sm"
                    aria-hidden
                  >
                    <span className="sm:hidden">↓</span>
                    <span className="hidden sm:inline">→</span>
                  </span>
                )}
                <span className="text-sm font-semibold text-navy">
                  <span className="text-navy-muted">{r.n}</span> {r.verb}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <ul className="mt-8 space-y-3">
          {demos.map((demo) => (
            <li key={demo.id}>
              <Link
                to={demo.href}
                className={`group flex min-h-[4.5rem] items-center gap-4 rounded-xl border bg-white p-4 transition-colors hover:border-navy/35 sm:p-5 ${
                  demo.primary
                    ? "border-l-4 border-l-navy border-navy/20 shadow-[0_12px_40px_-28px_rgba(11,31,58,0.45)]"
                    : "border-line"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-navy-muted">
                    {demo.badge} · {demo.role}
                  </p>
                  <h2 className="mt-0.5 text-lg font-semibold text-navy">
                    {demo.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{demo.question}</p>
                </div>
                <span
                  className="shrink-0 text-navy-muted transition-transform group-hover:translate-x-0.5 group-hover:text-navy"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {(roiHref || contactHref) && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-6">
            {roiHref && (
              <a
                href={roiHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-soft"
              >
                投資回収の目安
              </a>
            )}
            {contactHref && (
              <a
                href={contactHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm font-semibold text-navy hover:border-navy/40"
              >
                導入を相談する
              </a>
            )}
          </div>
        )}
      </div>
    </PlayShell>
  );
}
