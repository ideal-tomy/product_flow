type Props = {
  open: boolean;
  onClose: () => void;
};

/** 自社資料アップロードの取り扱い説明（サーバ保存なし／端末・質問時のみ） */
export function UploadPrivacyModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-labelledby="upload-privacy-title"
        className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-xl border border-line bg-white shadow-xl sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2
            id="upload-privacy-title"
            className="text-sm font-semibold text-navy"
          >
            投稿情報について
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-muted hover:bg-surface"
          >
            閉じる
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto px-4 py-4 text-sm leading-relaxed text-navy-muted">
          <p>
            アップロードした資料は、当社のサーバには保存しません。ブラウザ内でテキストを抽出し、この端末のブラウザ保存領域（localStorage）に残ります。
          </p>
          <p>
            質問したときだけ、接続先の AI（ご自身の API
            キー、または体験コード経由）へ参照内容が送られます。
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>本番データ・個人情報・機微情報は載せないでください</li>
            <li>共有 PC では、使い終わったら資料を消去してください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
