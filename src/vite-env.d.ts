/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Studio trial portal — 共通飛ばし先 /admin/trial */
  readonly VITE_TRIAL_PORTAL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
