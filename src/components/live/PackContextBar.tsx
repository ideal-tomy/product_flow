import type { PackContext } from "../../packs";

interface PackContextBarProps {
  context: PackContext;
}

const rows: { key: keyof PackContext; label: string }[] = [
  { key: "topic", label: "題材" },
  { key: "sources", label: "もとになる情報" },
  { key: "actions", label: "できること" },
  { key: "outcomes", label: "得られること" },
];

export function PackContextBar({ context }: PackContextBarProps) {
  return (
    <div className="rounded-lg border border-navy/15 bg-surface/50 px-4 py-3">
      <p className="mb-2 text-[11px] font-bold tracking-[0.12em] text-navy">
        このデモで分かること
      </p>
      <dl className="space-y-2">
        {rows.map((row) => (
          <div key={row.key} className="grid gap-0.5 sm:grid-cols-[7.5rem_1fr] sm:gap-3">
            <dt className="text-[11px] font-semibold text-muted">{row.label}</dt>
            <dd className="text-sm leading-snug text-navy">{context[row.key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
