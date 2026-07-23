/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * 公開ブランド。デプロイ単位で固定。
   * `axeon`（既定）| `ideal`
   */
  readonly VITE_BRAND?: string;
  /** 製品説明の外部URL（ideal 向けなど）。未設定時 axeon は /lp、ideal は非表示 */
  readonly VITE_PRODUCT_INFO_URL?: string;
  /** Studio trial portal — 共通飛ばし先 /admin/trial */
  readonly VITE_TRIAL_PORTAL_URL?: string;
  /** 投資回収シミュレーター。未設定なら CTA 非表示 */
  readonly VITE_ROI_SIMULATOR_URL?: string;
  /** 相談・問い合わせ。未設定なら CTA 非表示 */
  readonly VITE_CONTACT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
