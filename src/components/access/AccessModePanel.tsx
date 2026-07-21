/**
 * Access Mode panel — Phase 3 full.
 * Adds sample / BYOK / Trial controls without replacing existing Live UI.
 */
import { useCallback, useEffect, useState } from "react";
import {
  PRIMARY_ACCESS_MODES,
  ISO_ACCESS_MODE_LABELS,
  type IsoAccessMode,
} from "../../access/access-mode";
import {
  clearAll,
  getApiKey,
  getIsoAccessMode,
  getIsoModel,
  getIsoProvider,
  getTrialCode,
  getUserDocumentText,
  setApiKey,
  setIsoAccessMode,
  setSettings,
  setTrialCode,
  setUserDocumentText,
} from "../../access/iso-settings";
import { getProviderConfig, getEnabledProviders } from "@axeon/ai-demo-core/config/provider.config";
import {
  extractDocumentText,
  DocumentIngestError,
  testConnection,
  testTrialConnection,
  evaluateKnowledge,
} from "@axeon/ai-demo-core/demo-core";
import type { AiProvider } from "@axeon/ai-demo-core/types/access-mode";
import type { TrialPublicStatus } from "@axeon/ai-demo-core/types/trial";
import { RoiPaybackCta } from "../RoiPaybackCta";

type Props = {
  open: boolean;
  onClose: () => void;
  trialPortalUrl?: string;
};

export function AccessModePanel({ open, onClose, trialPortalUrl }: Props) {
  const [mode, setMode] = useState<IsoAccessMode>(() => getIsoAccessMode());
  const [provider, setProvider] = useState<AiProvider>(() => getIsoProvider());
  const [model, setModel] = useState(() => getIsoModel());
  const [apiKeyDraft, setApiKeyDraft] = useState(() => getApiKey(getIsoProvider()));
  const [trialDraft, setTrialDraft] = useState(() => getTrialCode());
  const [userDoc, setUserDoc] = useState(() => getUserDocumentText());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [trialStatus, setTrialStatus] = useState<TrialPublicStatus | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(getIsoAccessMode());
    setProvider(getIsoProvider());
    setModel(getIsoModel());
    setApiKeyDraft(getApiKey(getIsoProvider()));
    setTrialDraft(getTrialCode());
    setUserDoc(getUserDocumentText());
  }, [open]);

  const applyMode = useCallback((next: IsoAccessMode) => {
    setMode(next);
    setIsoAccessMode(next);
    setStatusMsg(`モード: ${ISO_ACCESS_MODE_LABELS[next]}`);
  }, []);

  const saveByok = useCallback(async () => {
    setBusy(true);
    setStatusMsg(null);
    try {
      setApiKey(provider, apiKeyDraft.trim());
      setSettings({ provider, model, accessMode: "byok-direct" });
      setIsoAccessMode("byok-direct");
      setMode("byok-direct");
      const result = await testConnection({
        provider,
        apiKey: apiKeyDraft.trim(),
        model,
      });
      if (result.ok) {
        setStatusMsg("APIキー接続に成功しました。");
      } else {
        setStatusMsg(result.error.userMessage);
      }
    } finally {
      setBusy(false);
    }
  }, [apiKeyDraft, model, provider]);

  const saveTrial = useCallback(async () => {
    setBusy(true);
    setStatusMsg(null);
    try {
      const code = trialDraft.trim();
      setTrialCode(code);
      setSettings({ accessMode: "managed-trial", provider: "openai" });
      setIsoAccessMode("managed-trial");
      setMode("managed-trial");
      setProvider("openai");
      const result = await testTrialConnection(code, "openai");
      if (result.ok) {
        setTrialStatus(result.status);
        setStatusMsg(
          `体験コード有効。残り ${result.status.remainingRequests} / ${result.status.maxRequests} 回`,
        );
      } else {
        setTrialStatus(null);
        setStatusMsg(result.error.userMessage);
      }
    } finally {
      setBusy(false);
    }
  }, [trialDraft]);

  const onFile = useCallback(async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setStatusMsg(null);
    try {
      const extracted = await extractDocumentText(file, "knowledge");
      const next = extracted.text;
      const evald = evaluateKnowledge(next);
      if (!evald.withinHardLimit) {
        setStatusMsg(evald.message ?? "文字数上限を超えています。");
        return;
      }
      setUserDoc(next);
      setUserDocumentText(next);
      setStatusMsg(
        `「${extracted.fileName}」を適用しました（${evald.characters.toLocaleString()}文字）${
          extracted.warning ? ` — ${extracted.warning}` : ""
        }`,
      );
    } catch (e) {
      setStatusMsg(
        e instanceof DocumentIngestError
          ? e.message
          : "ファイルの読み込みに失敗しました。",
      );
    } finally {
      setBusy(false);
    }
  }, []);

  if (!open) return null;

  const providerCfg = getProviderConfig(provider);
  const models = providerCfg?.allowedModels ?? [];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-end bg-black/30 p-3 sm:p-6"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-label="接続モード設定"
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">接続モード</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
          >
            閉じる
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-4 py-4 text-sm">
          <div className="grid gap-2">
            {PRIMARY_ACCESS_MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => applyMode(m)}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  mode === m
                    ? "border-teal-700 bg-teal-50 text-teal-900"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {ISO_ACCESS_MODE_LABELS[m]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => applyMode("server-proxy")}
              className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                mode === "server-proxy"
                  ? "border-zinc-500 bg-zinc-50"
                  : "border-zinc-100 text-zinc-500 hover:border-zinc-200"
              }`}
            >
              {ISO_ACCESS_MODE_LABELS["server-proxy"]}（現行 /api/ask）
            </button>
          </div>

          {mode === "byok-direct" && (
            <div className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/80 p-3">
              <p className="text-xs text-zinc-600">
                デモ専用APIキーを推奨します。キーは sessionStorage のみに保存されます。
              </p>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-zinc-700">Provider</span>
                <select
                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5"
                  value={provider}
                  onChange={(e) => {
                    const p = e.target.value as AiProvider;
                    setProvider(p);
                    const cfg = getProviderConfig(p);
                    setModel(cfg?.defaultModel ?? model);
                    setApiKeyDraft(getApiKey(p));
                  }}
                >
                  {getEnabledProviders().map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-zinc-700">モデル</span>
                <select
                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} ({m.id})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-zinc-700">APIキー</span>
                <input
                  type="password"
                  autoComplete="off"
                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs"
                  value={apiKeyDraft}
                  onChange={(e) => setApiKeyDraft(e.target.value)}
                  placeholder={providerCfg?.apiKeyHint}
                />
              </label>
              <button
                type="button"
                disabled={busy || !apiKeyDraft.trim()}
                onClick={() => void saveByok()}
                className="w-full rounded-lg bg-teal-800 px-3 py-2 text-white disabled:opacity-50"
              >
                保存して接続確認
              </button>
            </div>
          )}

          {mode === "managed-trial" && (
            <div className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/80 p-3">
              <p className="text-xs text-zinc-600">
                体験コードは共通基盤の取得ページで発行します。Provider は OpenAI 固定です。
              </p>
              {trialPortalUrl ? (
                <a
                  href={trialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-xs font-semibold text-teal-800 underline-offset-2 hover:underline"
                >
                  体験コードを取得 →
                </a>
              ) : null}
              <label className="block space-y-1">
                <span className="text-xs font-medium text-zinc-700">体験コード</span>
                <input
                  type="text"
                  autoComplete="off"
                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs"
                  value={trialDraft}
                  onChange={(e) => setTrialDraft(e.target.value)}
                  placeholder="発行されたコードを入力"
                />
              </label>
              {trialStatus?.valid && (
                <p className="text-xs text-teal-800">
                  残り {trialStatus.remainingRequests} / {trialStatus.maxRequests} 回
                  （期限 {trialStatus.expiresAt.slice(0, 10)}）
                </p>
              )}
              <button
                type="button"
                disabled={busy || !trialDraft.trim()}
                onClick={() => void saveTrial()}
                className="w-full rounded-lg bg-teal-800 px-3 py-2 text-white disabled:opacity-50"
              >
                保存して接続確認
              </button>
            </div>
          )}

          {(mode === "byok-direct" || mode === "managed-trial") && (
            <div className="space-y-2 rounded-lg border border-dashed border-zinc-200 p-3">
              <p className="text-xs font-medium text-zinc-800">自社の資料を追加</p>
              <p className="text-xs text-zinc-500">
                PDF(テキスト層) / TXT / MD などを読み込み、質問時の参照に追加します。
              </p>
              <input
                type="file"
                accept=".pdf,.txt,.md,.csv,.yaml,.yml,.json"
                onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
                className="block w-full text-xs"
              />
              {userDoc.trim() && (
                <p className="text-xs text-zinc-600">
                  適用中: {userDoc.length.toLocaleString()} 文字
                  <button
                    type="button"
                    className="ml-2 text-teal-800 underline"
                    onClick={() => {
                      setUserDoc("");
                      setUserDocumentText("");
                    }}
                  >
                    クリア
                  </button>
                </p>
              )}
            </div>
          )}

          {mode === "sample" && (
            <p className="text-xs text-zinc-600">
              パックに仕込んだサンプル質問・固定回答で体験します。APIキーは不要です。
            </p>
          )}

          {statusMsg && (
            <p className="rounded bg-zinc-100 px-2 py-1.5 text-xs text-zinc-700">
              {statusMsg}
            </p>
          )}

          <button
            type="button"
            className="w-full rounded border border-zinc-200 px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50"
            onClick={() => {
              clearAll();
              setApiKeyDraft("");
              setTrialDraft("");
              setUserDoc("");
              setTrialStatus(null);
              setMode("sample");
              setStatusMsg("設定をクリアしました。");
            }}
          >
            設定をすべてクリア
          </button>

          <RoiPaybackCta />
        </div>
      </div>
    </div>
  );
}
