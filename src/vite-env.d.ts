/// <reference types="vite/client" />

interface ImportMetaEnv {
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
