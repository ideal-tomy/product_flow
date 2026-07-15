/**
 * Primary experience mode selector — Phase 3 UX.
 * Visible segment control: sample / BYOK / trial.
 */
import {
  PRIMARY_ACCESS_MODES,
  type IsoAccessMode,
} from "../../access/access-mode";
import {
  getApiKey,
  getIsoProvider,
  getTrialCode,
  setIsoAccessMode,
} from "../../access/iso-settings";

const TAB_SHORT: Record<(typeof PRIMARY_ACCESS_MODES)[number], string> = {
  sample: "サンプルで試す",
  "byok-direct": "APIキーで試す",
  "managed-trial": "体験コードで試す",
};

type Props = {
  mode: IsoAccessMode;
  onModeChange: (mode: IsoAccessMode) => void;
  /** Open detail panel when credentials are needed */
  onNeedSetup: (mode: IsoAccessMode) => void;
  /** Customer-facing Studio /trial URL (with demo + return params) */
  trialPortalUrl?: string;
};

function needsSetup(mode: IsoAccessMode): boolean {
  if (mode === "byok-direct") {
    return !getApiKey(getIsoProvider()).trim();
  }
  if (mode === "managed-trial") {
    return !getTrialCode().trim();
  }
  return false;
}

export function ExperienceModeBar({
  mode,
  onModeChange,
  onNeedSetup,
  trialPortalUrl,
}: Props) {
  const activePrimary =
    mode === "byok-direct" || mode === "managed-trial" || mode === "sample"
      ? mode
      : "sample";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] text-navy/70">
            体験の始め方
          </p>
          <p className="mt-0.5 text-xs text-muted">
            まず下のどれか一つを選んでから、質問してください
          </p>
        </div>
        {trialPortalUrl ? (
          <a
            href={trialPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-teal-800 underline-offset-2 hover:underline"
          >
            体験コードを取得 →
          </a>
        ) : null}
      </div>

      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        role="tablist"
        aria-label="体験モード"
      >
        {PRIMARY_ACCESS_MODES.map((m) => {
          const selected = activePrimary === m;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setIsoAccessMode(m);
                onModeChange(m);
                if (needsSetup(m)) onNeedSetup(m);
              }}
              className={`min-h-12 rounded-xl border-2 px-3 py-3 text-left text-sm font-bold transition-colors sm:text-center ${
                selected
                  ? "border-navy bg-navy text-white shadow-sm"
                  : "border-line bg-white text-navy hover:border-navy/50 hover:bg-surface/60"
              }`}
            >
              {TAB_SHORT[m]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
