/**
 * 公開UIブランド。ビルド時の VITE_BRAND で固定（デプロイ単位）。
 * axeon / ideal は互いのURLをコードに埋め込まない。外部リンクは env のみ。
 */
export type BrandId = "axeon" | "ideal";

export type BrandConfig = {
  id: BrandId;
  /** 会社名（ロゴ代替のテキスト） */
  companyName: string;
  /** 製品・デモ名 */
  productName: string;
  /** ヘッダー等に出す主表記 */
  headerBrand: string;
  /** 回答カード等のアシスタント名 */
  assistantLabel: string;
  /** localStorage 名前空間（ブランド間で設定が混ざらない） */
  storageNamespace: string;
  /**
   * 製品説明リンク。未設定なら非表示。
   * axeon 既定は同一オリジン /lp。ideal は VITE_PRODUCT_INFO_URL のみ。
   */
  productInfoHref: string | null;
  productInfoLabel: string;
  documentTitle: string;
};

function resolveBrandId(): BrandId {
  const raw = import.meta.env.VITE_BRAND?.trim().toLowerCase();
  if (raw === "ideal") return "ideal";
  return "axeon";
}

function buildBrandConfig(id: BrandId): BrandConfig {
  const productInfoFromEnv =
    import.meta.env.VITE_PRODUCT_INFO_URL?.trim().replace(/\/+$/, "") || null;

  if (id === "ideal") {
    return {
      id: "ideal",
      companyName: "ideal",
      productName: "製造判断デモ",
      headerBrand: "ideal",
      assistantLabel: "ideal",
      storageNamespace: "ideal",
      productInfoHref: productInfoFromEnv,
      productInfoLabel: "製品・サービス",
      documentTitle: "ideal · 製造判断デモ",
    };
  }

  return {
    id: "axeon",
    companyName: "AXEON",
    productName: "ConformSystem",
    headerBrand: "AXEON",
    assistantLabel: "AXEON",
    storageNamespace: "axeon",
    productInfoHref: productInfoFromEnv ?? "/lp",
    productInfoLabel: "製品説明",
    documentTitle: "AXEON · ConformSystem",
  };
}

/** ビルド時に確定。ランタイム切替はしない */
export const brandId: BrandId = resolveBrandId();

export const brandConfig: BrandConfig = buildBrandConfig(brandId);

export function getBrandConfig(): BrandConfig {
  return brandConfig;
}

export function isIdealBrand(): boolean {
  return brandConfig.id === "ideal";
}

export function isAxeonBrand(): boolean {
  return brandConfig.id === "axeon";
}
