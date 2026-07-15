/**
 * ISO settings facade — uses vendor storage with product_flow config.
 */
import { demoConfig } from "../config/demo.config";
import {
  getApiKey,
  setApiKey,
  getTrialCode,
  setTrialCode,
  getSettings,
  setSettings,
  clearAll,
  type StudioSettings,
} from "../vendor/ai-demo/demo-core/storage";
import type { AiProvider } from "../vendor/ai-demo/types/access-mode";
import {
  isIsoAccessMode,
  type IsoAccessMode,
} from "./access-mode";

export type IsoSettings = StudioSettings & {
  accessMode: IsoAccessMode;
  userDocumentText: string;
};

export function getIsoAccessMode(): IsoAccessMode {
  const s = getSettings();
  if (isIsoAccessMode(s.accessMode)) return s.accessMode;
  return demoConfig.defaultAccessMode;
}

export function setIsoAccessMode(mode: IsoAccessMode): void {
  setSettings({ accessMode: mode as StudioSettings["accessMode"] });
}

export function getIsoProvider(): AiProvider {
  return getSettings().provider ?? demoConfig.defaultProvider;
}

export function getIsoModel(): string {
  return getSettings().model || demoConfig.defaultModel;
}

export function getUserDocumentText(): string {
  return getSettings().knowledge ?? "";
}

export function setUserDocumentText(text: string): void {
  setSettings({ knowledge: text });
}

export {
  getApiKey,
  setApiKey,
  getTrialCode,
  setTrialCode,
  getSettings,
  setSettings,
  clearAll,
};
