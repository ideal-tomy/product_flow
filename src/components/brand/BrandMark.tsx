import { brandConfig } from "../../config/brand.config";

type Props = {
  className?: string;
  /** 製品名を2行目に出す（既定 true） */
  showProduct?: boolean;
};

/**
 * 会社名を主表記（AXEON / ideal）。製品名は補助行。
 */
export function BrandMark({ className = "", showProduct = true }: Props) {
  const showSub =
    showProduct &&
    brandConfig.productName &&
    brandConfig.productName !== brandConfig.headerBrand;

  return (
    <div className={`min-w-0 ${className}`}>
      <p className="truncate text-sm font-semibold tracking-tight text-navy">
        {brandConfig.headerBrand}
      </p>
      {showSub ? (
        <p className="truncate text-[11px] text-muted">{brandConfig.productName}</p>
      ) : null}
    </div>
  );
}
