/**
 * Vendor mirror of demo config fields needed by knowledge.ts / storage.
 * Keep in sync with src/config/demo.config.ts knowledgePolicy / defaults.
 */
export const demoConfig = {
  id: "iso-conform-system",
  defaultRoleId: "iso",
  knowledgePolicy: {
    recommendedMax: 20000,
    warningFrom: 20001,
    hardLimit: 30000,
  },
};
