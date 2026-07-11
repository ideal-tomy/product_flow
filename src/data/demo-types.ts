/** デモ共通の型定義（業界データは含まない） */

export interface SourceReference {
  documentName: string;
  version: string;
  page: string;
  clauseId: string;
  excerpt: string;
  highlight?: string;
  /** AI ナレッジチャンク ID（閲覧・根拠追跡用） */
  chunkId?: string;
  /** チャンク全文。無い場合は excerpt を表示 */
  fullText?: string;
  /** 文書 ID（ナレッジブラウザへのジャンプ用） */
  documentId?: string;
}

export interface SpecChangeItem {
  id: string;
  title: string;
  clauseId: string;
  before: string;
  after: string;
  severity: "high" | "medium" | "low";
}

export interface ContradictionItem {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  left: { documentName: string; version: string; value: string };
  right: { documentName: string; version: string; value: string };
}

export interface SimilarCaseItem {
  id: string;
  title: string;
  similarity: number;
  cause: string;
  countermeasure: string;
  relationToCurrent: string;
}

export interface RetestItem {
  id: string;
  name: string;
  reason: string;
  priority: "必須" | "推奨" | "任意";
}

export interface ImpactGroup {
  label: string;
  count: number;
  items: string[];
}

export interface DemoAnswer {
  summary: string;
  before?: string;
  after?: string;
  comparisonLabel?: string;
  impactAreas?: string[];
  impactGroups?: ImpactGroup[];
  sources: SourceReference[];
  exceptionNote?: string;
  changes?: SpecChangeItem[];
  contradictions?: ContradictionItem[];
  similarCases?: SimilarCaseItem[];
  retests?: RetestItem[];
}

export interface DemoQuestion {
  id: string;
  chipLabel: string;
  question: string;
  answer: DemoAnswer;
  showGenericBefore?: boolean;
}

export interface DemoDocument {
  id: string;
  name: string;
  version: string;
  pages: number;
  category: string;
  note: string;
  /** 出典フィルタ用。制御仕様書の版切替に使う */
  controlVersion?: "v3.2" | "v3.4";
}
