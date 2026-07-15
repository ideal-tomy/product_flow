/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Customer-facing Studio trial portal (e.g. https://demo.axeon.jp/trial) */
  readonly VITE_TRIAL_PORTAL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
