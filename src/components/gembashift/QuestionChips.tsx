import type { DemoQuestion } from "../../data/gembashift-demo";

interface QuestionChipsProps {
  questions: DemoQuestion[];
  activeId: string | null;
  onSelect: (question: DemoQuestion) => void;
}

export function QuestionChips({ questions, activeId, onSelect }: QuestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="質問候補">
      {questions.map((q) => {
        const active = q.id === activeId;
        return (
          <button
            key={q.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(q)}
            className={`rounded-md border px-3 py-1.5 text-left text-sm transition-colors ${
              active
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-navy-muted hover:border-navy/40 hover:text-navy"
            }`}
          >
            {q.chipLabel}
          </button>
        );
      })}
    </div>
  );
}
