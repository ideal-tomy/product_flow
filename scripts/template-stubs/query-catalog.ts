export type QueryCategoryId =
  | "all"
  | "diff"
  | "impact"
  | "risk"
  | "decide"
  | "share"
  | "next";

export interface QueryCatalogItem {
  id: string;
  label: string;
  question: string;
  category: Exclude<QueryCategoryId, "all">;
  hint: string;
}

export interface QueryCategory {
  id: QueryCategoryId;
  label: string;
  short: string;
}

export const queryCategories: QueryCategory[] = [
  { id: "all", label: "すべて", short: "すべて" },
  { id: "diff", label: "差分", short: "差分" },
  { id: "impact", label: "影響", short: "影響" },
  { id: "risk", label: "リスク", short: "リスク" },
  { id: "decide", label: "判断", short: "判断" },
  { id: "share", label: "共有", short: "共有" },
  { id: "next", label: "次", short: "次" },
];

/** テンプレートではパック側 catalog を使う。ここは空のフォールバック */
export const queryCatalog: QueryCatalogItem[] = [];

export function filterQueryCatalog(
  items: QueryCatalogItem[],
  category: QueryCategoryId,
  query: string,
): QueryCatalogItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (!q) return true;
    return (
      item.label.toLowerCase().includes(q) ||
      item.question.toLowerCase().includes(q) ||
      item.hint.toLowerCase().includes(q)
    );
  });
}

export function countByCategory(
  items: QueryCatalogItem[],
): Record<QueryCategoryId, number> {
  const init: Record<QueryCategoryId, number> = {
    all: items.length,
    diff: 0,
    impact: 0,
    risk: 0,
    decide: 0,
    share: 0,
    next: 0,
  };
  for (const item of items) {
    init[item.category] += 1;
  }
  return init;
}
