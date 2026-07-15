/**
 * IsoAccessMode — Phase 3 full access modes for product_flow /ai
 */
export type IsoAccessMode =
  | "sample"
  | "byok-direct"
  | "managed-trial"
  | "server-proxy";

export const ISO_ACCESS_MODE_LABELS: Record<IsoAccessMode, string> = {
  sample: "サンプルデータで試す",
  "byok-direct": "APIキーで試す",
  "managed-trial": "体験コードで試す",
  "server-proxy": "サーバー接続（運用）",
};

export const PRIMARY_ACCESS_MODES = [
  "sample",
  "byok-direct",
  "managed-trial",
] as const satisfies readonly IsoAccessMode[];

export function isIsoAccessMode(value: string | null | undefined): value is IsoAccessMode {
  return (
    value === "sample" ||
    value === "byok-direct" ||
    value === "managed-trial" ||
    value === "server-proxy"
  );
}
