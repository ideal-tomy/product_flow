import { knowledgePacks, type KnowledgePackId } from "../../packs";

interface PackSwitcherProps {
  packId: KnowledgePackId;
  onChange: (id: KnowledgePackId) => void;
}

export function PackSwitcher({ packId, onChange }: PackSwitcherProps) {
  return (
    <div className="border-b border-line bg-white px-3 py-2 sm:px-4">
      <p className="mb-1.5 text-[11px] font-medium tracking-wide text-muted">
        何についてのデモですか？
      </p>
      <div className="flex flex-wrap gap-1.5">
        {knowledgePacks.map((p) => {
          const active = p.id === packId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={`rounded-md px-3 py-2 text-left transition-colors ${
                active
                  ? "bg-navy text-white"
                  : "border border-line bg-surface/60 text-navy hover:border-navy/30"
              }`}
            >
              <span className="block text-sm font-bold leading-tight">
                {p.label}
              </span>
              <span
                className={`mt-0.5 block text-[10px] ${
                  active ? "text-white/70" : "text-muted"
                }`}
              >
                {p.audienceLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
