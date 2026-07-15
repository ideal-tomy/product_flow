/**
 * ISO Demo Config — Phase 3 full
 * Pack-specific prompts stay on KnowledgePack.llmSystemPrompt.
 */
export const demoConfig = {
  id: "iso-conform-system",
  name: "ConformSystem ISO Demo",
  description: "社内規程・品質文書に質問できる ISO / 製造業向けデモ",
  storageNamespace: "conform",
  defaultRoleId: "iso",
  knowledgePolicy: {
    recommendedMax: 20000,
    warningFrom: 20001,
    hardLimit: 30000,
  },
  chat: {
    maxHistoryMessages: 8,
  },
  defaultAccessMode: "sample" as const,
  defaultProvider: "openai" as const,
  defaultModel: "gpt-5-nano",
};

export type DemoConfig = typeof demoConfig;
