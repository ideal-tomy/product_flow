import { useCallback, useEffect, useState } from "react";
import {
  DocumentIngestError,
  extractDocumentText,
  evaluateKnowledge,
} from "@axeon/ai-demo-core/demo-core";
import {
  getUserDocumentText,
  setUserDocumentText,
} from "../../access/iso-settings";

type Props = {
  /** false のときアップロードを案内のみ（ライブ未接続） */
  enabled: boolean;
  onOpenLiveSetup?: () => void;
  /** false のとき「先にライブ接続」ボタンを出さない（親に同導線がある場合） */
  showSetupLink?: boolean;
  /** 自社資料の文字数が変わったとき（投入／クリア） */
  onUserDocChange?: (charCount: number) => void;
};

/**
 * ツアー後に出す自社資料ストリップ。詳細設定パネルと同じストレージを使う。
 */
export function UserDocUploadStrip({
  enabled,
  onOpenLiveSetup,
  showSetupLink = true,
  onUserDocChange,
}: Props) {
  const [userDoc, setUserDoc] = useState(() => getUserDocumentText());
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUserDoc(getUserDocumentText());
  }, [enabled]);

  const applyDoc = useCallback(
    (next: string, statusMsg: string) => {
      setUserDocumentText(next);
      setUserDoc(next);
      setStatus(statusMsg);
      onUserDocChange?.(next.trim().length);
    },
    [onUserDocChange],
  );

  const onFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setBusy(true);
      setStatus(null);
      try {
        const extracted = await extractDocumentText(file, "knowledge");
        const next = extracted.text;
        const evald = evaluateKnowledge(next);
        if (!evald.withinHardLimit) {
          setStatus(evald.message ?? "文字数上限を超えています。");
          return;
        }
        applyDoc(
          next,
          `「${extracted.fileName}」を適用しました（${evald.characters.toLocaleString()}文字）${
            extracted.warning ? ` — ${extracted.warning}` : ""
          }`,
        );
      } catch (e) {
        const msg =
          e instanceof DocumentIngestError
            ? e.message
            : "読み込みに失敗しました。テキスト層のあるPDF / TXT / MD を試してください。";
        setStatus(msg);
      } finally {
        setBusy(false);
      }
    },
    [applyDoc],
  );

  return (
    <div className="rounded-md border border-dashed border-line bg-white px-3 py-3">
      <p className="text-xs font-semibold text-navy">自社の資料を足す</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted">
        1ファイルを追加すると、自由記述の本回答で優先参照します。パック本体は変わりません。
      </p>
      {!enabled ? (
        showSetupLink && onOpenLiveSetup ? (
          <button
            type="button"
            onClick={onOpenLiveSetup}
            className="mt-2 text-xs font-semibold text-navy underline-offset-2 hover:underline"
          >
            先にライブ接続（APIキー／体験コード）を有効にする →
          </button>
        ) : (
          <p className="mt-2 text-[11px] text-muted">
            上の「ライブ接続」で APIキー／体験コードを有効にしたあと、ここにファイルを追加できます。
          </p>
        )
      ) : (
        <div className="mt-2 space-y-1.5">
          <input
            type="file"
            accept=".pdf,.txt,.md,.csv,.yaml,.yml,.json"
            disabled={busy}
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            className="block w-full text-xs text-muted file:mr-2 file:rounded file:border-0 file:bg-surface file:px-2 file:py-1 file:text-xs file:font-semibold file:text-navy"
          />
          {userDoc.trim() ? (
            <p className="text-[11px] text-muted">
              適用中: {userDoc.length.toLocaleString()} 文字
              <button
                type="button"
                className="ml-2 font-semibold text-navy underline-offset-2 hover:underline"
                onClick={() => {
                  applyDoc("", "クリアしました。");
                }}
              >
                クリア
              </button>
            </p>
          ) : null}
          {status ? <p className="text-[11px] text-navy-muted">{status}</p> : null}
        </div>
      )}
    </div>
  );
}
