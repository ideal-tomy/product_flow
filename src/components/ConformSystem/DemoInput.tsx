interface DemoInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function DemoInput({
  value,
  onChange,
  onSubmit,
  disabled,
  loading,
}: DemoInputProps) {
  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="sr-only" htmlFor="demo-question">
        質問を入力
      </label>
      <input
        id="demo-question"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="質問を選択するか入力してください"
        className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition-shadow focus:border-navy/40 focus:ring-2 focus:ring-navy/15 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-md bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "参照中…" : "送信"}
      </button>
    </form>
  );
}
