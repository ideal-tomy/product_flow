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

export const scaleStats = {
  documents: 18,
  pages: 2842,
  majorChanges: 7,
  retestCandidates: 9,
  contradictions: 3,
} as const;

export const demoIntro = {
  title: "社内文書に、そのまま質問できます。",
  subtitle: "TCU-480 · 制御仕様 v3.2 → v3.4",
} as const;

export const demoDocuments: DemoDocument[] = [
  {
    id: "DOC-CTRL-034",
    name: "制御仕様書",
    version: "v3.4",
    pages: 312,
    category: "仕様書",
    note: "現行",
    controlVersion: "v3.4",
  },
  {
    id: "DOC-CTRL-032",
    name: "制御仕様書",
    version: "v3.2",
    pages: 298,
    category: "仕様書",
    note: "比較元",
    controlVersion: "v3.2",
  },
  {
    id: "DOC-SRS-012",
    name: "システム要求仕様書",
    version: "v1.8",
    pages: 186,
    category: "要求仕様",
    note: "上位要求",
  },
  {
    id: "DOC-TS-014",
    name: "温度センサー仕様書",
    version: "TS-14",
    pages: 64,
    category: "部品仕様",
    note: "精度定義",
  },
  {
    id: "DOC-ECU-IF-06",
    name: "ECUインターフェース定義書",
    version: "v2.1",
    pages: 142,
    category: "IF",
    note: "信号定義",
  },
  {
    id: "DOC-FMEA-09",
    name: "FMEA管理表",
    version: "Rev.C",
    pages: 88,
    category: "品質",
    note: "リスク",
  },
  {
    id: "DOC-TEST-073",
    name: "試験条件一覧",
    version: "v7.3",
    pages: 156,
    category: "試験",
    note: "再試験",
  },
  {
    id: "DOC-TEST-OLD",
    name: "旧試験手順書",
    version: "v5.1",
    pages: 98,
    category: "試験",
    note: "旧版参照",
  },
  {
    id: "DOC-QA-041",
    name: "品質監査指摘一覧",
    version: "2025-Q1",
    pages: 47,
    category: "監査",
    note: "指摘履歴",
  },
  {
    id: "DOC-SUP-028",
    name: "サプライヤー照会回答集",
    version: "2024-12",
    pages: 73,
    category: "調達",
    note: "照会回答",
  },
  {
    id: "DOC-NC-2024",
    name: "不具合事例集",
    version: "2024版",
    pages: 214,
    category: "不具合",
    note: "類似検索",
  },
  {
    id: "DOC-DR-118",
    name: "設計レビュー議事録",
    version: "DR-118",
    pages: 36,
    category: "議事録",
    note: "DR指摘",
  },
  {
    id: "DOC-KN-VET",
    name: "ベテラン設計者ナレッジメモ",
    version: "—",
    pages: 52,
    category: "ナレッジ",
    note: "暗黙知",
  },
  {
    id: "DOC-CHG-034",
    name: "変更管理票",
    version: "ECR-034",
    pages: 18,
    category: "変更管理",
    note: "承認状態",
  },
  {
    id: "DOC-CAL-03",
    name: "校正手順書",
    version: "v3.0",
    pages: 41,
    category: "手順",
    note: "例外運用",
  },
  {
    id: "DOC-ALM-02",
    name: "アラーム定義書",
    version: "v2.4",
    pages: 67,
    category: "定義",
    note: "閾値",
  },
  {
    id: "DOC-HW-011",
    name: "ハードウェア構成図説明書",
    version: "v1.6",
    pages: 89,
    category: "ハード",
    note: "配置",
  },
  {
    id: "DOC-SW-021",
    name: "ソフトウェア設計書",
    version: "v2.0",
    pages: 203,
    category: "ソフト",
    note: "実装箇所",
  },
  {
    id: "DOC-REG-07",
    name: "規制・安全要求チェックリスト",
    version: "v1.2",
    pages: 55,
    category: "規制",
    note: "承認根拠",
  },
  {
    id: "DOC-TRN-01",
    name: "新人向け温度制御概要",
    version: "v1.0",
    pages: 28,
    category: "教育",
    note: "平易説明",
  },
];

/** サイドバー表示用（主要18件。旧手順・教育は参照セットに含む） */
export const sidebarDocuments = demoDocuments.filter(
  (d) => d.id !== "DOC-TEST-OLD" && d.id !== "DOC-TRN-01",
);

const src = {
  tol34: {
    documentName: "制御仕様書",
    version: "v3.4",
    page: "214〜218",
    clauseId: "4.1.3",
    excerpt:
      "温度センサーの許容範囲は、測定値に対して ±3℃ とする。異常判定閾値は本許容範囲を基準に設定すること。",
    highlight: "±3℃",
  } satisfies SourceReference,
  tol32: {
    documentName: "制御仕様書",
    version: "v3.2",
    page: "198〜201",
    clauseId: "4.1.3",
    excerpt:
      "温度センサーの許容範囲は、測定値に対して ±5℃ とする。異常判定閾値は本許容範囲を基準に設定すること。",
    highlight: "±5℃",
  } satisfies SourceReference,
  judge: {
    documentName: "制御仕様書",
    version: "v3.4",
    page: "215〜218",
    clauseId: "4.1.4",
    excerpt:
      "異常判定は条項 4.1.3 の許容範囲を逸脱した場合に成立する。許容範囲の改訂時は、判定閾値を同期して更新すること。",
    highlight: "許容範囲を逸脱した場合",
  } satisfies SourceReference,
  interlock: {
    documentName: "制御仕様書",
    version: "v3.4",
    page: "221〜223",
    clauseId: "4.2.1",
    excerpt:
      "インターロック条件における温度監視区間は、条項 4.1.3 の許容範囲に連動する。",
    highlight: "条項 4.1.3 の許容範囲に連動",
  } satisfies SourceReference,
  alarm: {
    documentName: "制御仕様書",
    version: "v3.4",
    page: "256〜258",
    clauseId: "5.3.2",
    excerpt: "重大アラームは 82℃ 以上で発報する。",
    highlight: "82℃",
  } satisfies SourceReference,
  hold: {
    documentName: "制御仕様書",
    version: "v3.4",
    page: "220",
    clauseId: "4.1.6",
    excerpt: "起動後5秒間は判定を保留する。",
    highlight: "5秒間",
  } satisfies SourceReference,
  exception: {
    documentName: "制御仕様書",
    version: "v3.4",
    page: "219〜220",
    clauseId: "4.1.5",
    excerpt:
      "試験運転モード中は、条項 4.1.3 に基づく通常の許容範囲判定を一時停止できる。ただし重大アラーム（許容範囲の 150% 超過）は本例外の対象外とする。",
    highlight: "一時停止できる",
  } satisfies SourceReference,
  cal: {
    documentName: "制御仕様書",
    version: "v3.4",
    page: "301〜302",
    clauseId: "7.2.1",
    excerpt:
      "校正作業中は、作業責任者の承認のもと温度センサー判定を保留できる。作業完了後は直ちに通常判定へ復帰すること。",
    highlight: "判定を保留できる",
  } satisfies SourceReference,
  sensor: {
    documentName: "温度センサー仕様書",
    version: "TS-14",
    page: "12",
    clauseId: "3.2",
    excerpt: "測定精度は ±4℃ とする。",
    highlight: "±4℃",
  } satisfies SourceReference,
  testHold: {
    documentName: "試験条件一覧",
    version: "v7.3",
    page: "44",
    clauseId: "TC-12",
    excerpt: "始動後3秒で判定を開始する。",
    highlight: "3秒",
  } satisfies SourceReference,
  oldAlarm: {
    documentName: "旧試験手順書",
    version: "v5.1",
    page: "71",
    clauseId: "6.4",
    excerpt: "重大判定は 85℃ とする。",
    highlight: "85℃",
  } satisfies SourceReference,
  nc071: {
    documentName: "不具合事例集",
    version: "2024版",
    page: "88〜90",
    clauseId: "2024-071",
    excerpt:
      "冬季始動時の誤アラーム。原因は低温始動直後の一時的なセンサー偏差。対策として起動後3秒の判定保留を実施。",
    highlight: "起動後3秒の判定保留",
  } satisfies SourceReference,
  warn: {
    documentName: "制御仕様書",
    version: "v3.4",
    page: "254〜255",
    clauseId: "5.3.1",
    excerpt: "警告アラームは 78℃ 以上で発報する。",
    highlight: "78℃",
  } satisfies SourceReference,
  sampling: {
    documentName: "制御仕様書",
    version: "v3.4",
    page: "228",
    clauseId: "4.3.1",
    excerpt: "温度センサーのサンプリング周期は 100ms とする。",
    highlight: "100ms",
  } satisfies SourceReference,
  log: {
    documentName: "制御仕様書",
    version: "v3.4",
    page: "340",
    clauseId: "8.2.1",
    excerpt: "温度関連ログの保存期間は 90日 とする。",
    highlight: "90日",
  } satisfies SourceReference,
  sw: {
    documentName: "ソフトウェア設計書",
    version: "v2.0",
    page: "112〜118",
    clauseId: "6.4.2",
    excerpt:
      "温度異常判定モジュール TempJudge は、許容範囲・保留時間・アラーム境界を設定ファイルから読み込む。仕様改訂時は設定値と単体テストを更新すること。",
    highlight: "TempJudge",
  } satisfies SourceReference,
  ecu: {
    documentName: "ECUインターフェース定義書",
    version: "v2.1",
    page: "56",
    clauseId: "4.2",
    excerpt:
      "温度異常フラグ TEMP_FAULT の立上り条件は、制御仕様書の重大アラーム判定に従う。",
    highlight: "TEMP_FAULT",
  } satisfies SourceReference,
  hw: {
    documentName: "ハードウェア構成図説明書",
    version: "v1.6",
    page: "33",
    clauseId: "3.1",
    excerpt:
      "温度センサー取付位置は吸気側ダクト中央とする。配線長は 1.5m 以内を推奨。",
    highlight: "吸気側ダクト中央",
  } satisfies SourceReference,
  fmea: {
    documentName: "FMEA管理表",
    version: "Rev.C",
    page: "24",
    clauseId: "R19",
    excerpt:
      "始動直後の誤アラーム。現行対策は起動後3秒保留。検出度評価は D=4。",
    highlight: "起動後3秒保留",
  } satisfies SourceReference,
  qa: {
    documentName: "品質監査指摘一覧",
    version: "2025-Q1",
    page: "9",
    clauseId: "QA-17",
    excerpt:
      "試験条件と制御仕様の版不一致が未是正のまま残っている。次回監査までに突合記録を提出すること。",
    highlight: "版不一致",
  } satisfies SourceReference,
  dr: {
    documentName: "設計レビュー議事録",
    version: "DR-118",
    page: "4",
    clauseId: "DR-118-07",
    excerpt:
      "判定保留時間の根拠を過去不具合と紐づけて説明すること。試験条件一覧の更新を承認条件とする。",
    highlight: "試験条件一覧の更新を承認条件",
  } satisfies SourceReference,
  reg: {
    documentName: "規制・安全要求チェックリスト",
    version: "v1.2",
    page: "15",
    clauseId: "S-08",
    excerpt:
      "保護機能の閾値変更時は、安全要求への影響評価と再検証記録を残すこと。",
    highlight: "再検証記録",
  } satisfies SourceReference,
  ecr: {
    documentName: "変更管理票",
    version: "ECR-034",
    page: "2",
    clauseId: "Gate-B",
    excerpt:
      "量産反映の前提条件: 必須再試験完了、文書不整合の是正または暫定合意、FMEA更新。",
    highlight: "必須再試験完了",
  } satisfies SourceReference,
  knowledge: {
    documentName: "ベテラン設計者ナレッジメモ",
    version: "—",
    page: "17",
    clauseId: "K-12",
    excerpt:
      "冬場の初回始動はセンサーが実温より低く出やすい。保留を入れないと誤アラームが再発する。3秒では足りない現場があった。",
    highlight: "3秒では足りない",
  } satisfies SourceReference,
  srs: {
    documentName: "システム要求仕様書",
    version: "v1.8",
    page: "71",
    clauseId: "REQ-T-09",
    excerpt:
      "温度異常は誤検知を最小化しつつ、危険温度を見逃さないこと。始動過渡は特別扱いを許容する。",
    highlight: "始動過渡は特別扱いを許容",
  } satisfies SourceReference,
  train: {
    documentName: "新人向け温度制御概要",
    version: "v1.0",
    page: "8",
    clauseId: "2.3",
    excerpt:
      "電源投入直後は判定が保留される。保留中でも重大アラームは有効な場合がある。",
    highlight: "重大アラームは有効",
  } satisfies SourceReference,
};

export const genericBeforeAnswer =
  "バージョン間で変更された可能性はありますが、詳細は仕様書をご確認ください。出典：なし";

export const demoQuestions: DemoQuestion[] = [
  {
    id: "version-diff",
    chipLabel: "v3.2からv3.4で何が変わった？",
    question: "v3.2からv3.4で何が変わりましたか？",
    showGenericBefore: true,
    answer: {
      summary:
        "v3.2からv3.4で、主要な仕様変更を 7件 検出しました。特に重要なのは、センサー許容範囲の厳格化（±5℃→±3℃）と、起動後5秒の判定保留の追加です。",
      comparisonLabel: "温度センサー許容範囲",
      before: "±5℃",
      after: "±3℃",
      changes: [
        {
          id: "CHG-01",
          title: "温度センサー許容範囲",
          clauseId: "4.1.3",
          before: "±5℃",
          after: "±3℃",
          severity: "high",
        },
        {
          id: "CHG-02",
          title: "起動後判定保留時間",
          clauseId: "4.1.6",
          before: "なし（即判定）",
          after: "5秒保留",
          severity: "high",
        },
        {
          id: "CHG-03",
          title: "アラーム重大判定閾値",
          clauseId: "5.3.2",
          before: "許容範囲の100%",
          after: "82℃固定",
          severity: "high",
        },
        {
          id: "CHG-04",
          title: "警告アラーム閾値",
          clauseId: "5.3.1",
          before: "許容範囲の80%",
          after: "78℃",
          severity: "medium",
        },
        {
          id: "CHG-05",
          title: "試験運転モードの例外",
          clauseId: "4.1.5",
          before: "全判定停止可",
          after: "重大アラームは停止対象外",
          severity: "medium",
        },
        {
          id: "CHG-06",
          title: "センサーサンプリング周期",
          clauseId: "4.3.1",
          before: "200ms",
          after: "100ms",
          severity: "medium",
        },
        {
          id: "CHG-07",
          title: "ログ保存期間",
          clauseId: "8.2.1",
          before: "30日",
          after: "90日",
          severity: "low",
        },
      ],
      sources: [src.tol34, src.tol32, src.hold, src.alarm],
    },
  },
  {
    id: "impact-scope",
    chipLabel: "この変更の影響範囲は？",
    question: "この変更の影響範囲は？",
    answer: {
      summary:
        "影響範囲は、制御3件・試験4件・FMEA3件です。再試験候補は合計 9件 です。",
      impactGroups: [
        {
          label: "制御ロジック",
          count: 3,
          items: [
            "§4.1.4 — 異常判定ロジック（閾値再計算）",
            "§4.2.1 — インターロック条件（温度監視区間）",
            "§5.3.2 — アラーム発報条件（警告／重大境界）",
          ],
        },
        {
          label: "試験",
          count: 4,
          items: [
            "TC-12 — 低温始動試験（判定保留5秒の確認）",
            "TC-18 — 校正後復帰試験",
            "TC-24 — アラーム境界試験（78℃ / 82℃）",
            "TC-31 — サンプリング周期変更に伴う応答試験",
          ],
        },
        {
          label: "FMEA",
          count: 3,
          items: [
            "FMEA-R12 — センサー偏差による誤判定",
            "FMEA-R19 — 始動直後の誤アラーム",
            "FMEA-R27 — 判定遅延による保護遅れ",
          ],
        },
      ],
      impactAreas: [
        "制御 3件 / 試験 4件 / FMEA 3件",
        "再試験候補 9件",
      ],
      sources: [src.judge, src.interlock, src.alarm],
    },
  },
  {
    id: "retest",
    chipLabel: "再試験が必要な項目は？",
    question: "再試験が必要な項目は？",
    answer: {
      summary: "再試験候補を 9件 抽出しました。必須は 5件 です。",
      retests: [
        {
          id: "TC-12",
          name: "低温始動試験",
          reason: "判定保留5秒が新設",
          priority: "必須",
        },
        {
          id: "TC-18",
          name: "校正後復帰試験",
          reason: "例外規定の変更",
          priority: "必須",
        },
        {
          id: "TC-24",
          name: "アラーム境界試験",
          reason: "78℃ / 82℃へ変更",
          priority: "必須",
        },
        {
          id: "TC-31",
          name: "応答性試験",
          reason: "サンプリング100ms化",
          priority: "必須",
        },
        {
          id: "TC-07",
          name: "許容範囲逸脱試験",
          reason: "±3℃への厳格化",
          priority: "必須",
        },
        {
          id: "TC-09",
          name: "インターロック連動試験",
          reason: "§4.2.1連動",
          priority: "推奨",
        },
        {
          id: "TC-15",
          name: "試験運転モード例外試験",
          reason: "重大アラーム除外",
          priority: "推奨",
        },
        {
          id: "TC-22",
          name: "連続運転ログ試験",
          reason: "保存90日化の確認",
          priority: "任意",
        },
        {
          id: "TC-40",
          name: "回帰スモーク（温度系）",
          reason: "横断影響の確認",
          priority: "推奨",
        },
      ],
      sources: [src.hold, src.alarm, src.testHold, src.exception],
    },
  },
  {
    id: "contradiction",
    chipLabel: "文書間の矛盾はある？",
    question: "文書間で矛盾している箇所はありますか？",
    answer: {
      summary: "不整合候補を 3件 検出しました。",
      contradictions: [
        {
          id: "CX-01",
          title: "センサー精度",
          severity: "high",
          left: {
            documentName: "制御仕様書",
            version: "v3.4",
            value: "±3℃",
          },
          right: {
            documentName: "温度センサー仕様書",
            version: "TS-14",
            value: "±4℃",
          },
        },
        {
          id: "CX-02",
          title: "起動後判定保留",
          severity: "high",
          left: {
            documentName: "制御仕様書",
            version: "v3.4",
            value: "5秒",
          },
          right: {
            documentName: "試験条件一覧",
            version: "v7.3",
            value: "3秒",
          },
        },
        {
          id: "CX-03",
          title: "アラーム重大判定",
          severity: "medium",
          left: {
            documentName: "制御仕様書",
            version: "v3.4",
            value: "82℃",
          },
          right: {
            documentName: "旧試験手順書",
            version: "v5.1",
            value: "85℃",
          },
        },
      ],
      sources: [src.tol34, src.sensor, src.hold, src.testHold, src.alarm, src.oldAlarm],
    },
  },
  {
    id: "similar-cases",
    chipLabel: "過去に似た不具合は？",
    question: "過去に似た不具合はありましたか？",
    answer: {
      summary:
        "類似事例を 3件 見つけました。最も近いのは 2024-071（類似度92%）です。",
      similarCases: [
        {
          id: "2024-071",
          title: "冬季始動時の誤アラーム",
          similarity: 92,
          cause: "低温始動直後の一時的なセンサー偏差",
          countermeasure: "起動後3秒の判定保留",
          relationToCurrent:
            "v3.4で追加された「5秒保留」と強く関連",
        },
        {
          id: "2023-118",
          title: "校正直後の閾値ずれによる警告多発",
          similarity: 81,
          cause: "校正後の判定再開タイミング未定義",
          countermeasure: "校正完了後の明示的な判定復帰手順",
          relationToCurrent: "§4.1.5 / 校正手順書の例外と関連",
        },
        {
          id: "2022-044",
          title: "センサー公差と制御閾値の不一致",
          similarity: 74,
          cause: "部品仕様 ±4℃ に対し制御が ±3℃ 相当で運用",
          countermeasure: "調達仕様の改訂または制御側マージン見直し",
          relationToCurrent: "今回の不整合候補（センサー精度）と同型",
        },
      ],
      sources: [src.nc071, src.hold, src.sensor],
    },
  },
  {
    id: "exception",
    chipLabel: "例外規定はありますか？",
    question: "この条件に例外はありますか？",
    answer: {
      summary:
        "はい。試験運転モードおよび校正作業中は、通常の許容範囲判定を一時停止できます。",
      exceptionNote:
        "ただし、試験運転モードでも重大アラーム（許容範囲の 150% 超過）は停止対象外です。",
      impactAreas: [
        "例外: 条項 4.1.5 — 試験運転モード",
        "例外: 条項 7.2.1 — 校正作業中の判定保留",
        "停止対象外: 重大アラーム（150%超過）",
      ],
      sources: [src.exception, src.cal],
    },
  },
  {
    id: "source-trace",
    chipLabel: "根拠となる条項は？",
    question: "この回答の根拠となる条項とページを教えてください。",
    answer: {
      summary:
        "温度センサー許容範囲の変更に関する根拠条項と出典ページは以下のとおりです。",
      impactAreas: [
        "根拠条項 4.1.3（許容範囲の定義）",
        "関連条項 4.1.4 / 4.1.6 / 5.3.2",
        "制御仕様書 v3.4 p.214〜218",
      ],
      sources: [src.tol34, src.judge, src.hold, src.alarm, src.interlock],
    },
  },
  {
    id: "exec-summary",
    chipLabel: "経営層向けに3行で",
    question: "経営層向けに3行でまとめてください。",
    answer: {
      summary:
        "1. センサー判定を厳格化し、誤検知・見逃しリスクを低減。\n2. 過去不具合を踏まえ、始動直後5秒の判定保留を追加。\n3. ただし試験条件・部品仕様との不整合が3件残っており、承認前に突合が必要。",
      sources: [src.tol34, src.hold, src.sensor],
    },
  },
  {
    id: "approval",
    chipLabel: "承認して大丈夫？",
    question: "この変更を承認して大丈夫ですか？",
    answer: {
      summary:
        "条件付きで承認可能です。必須の再試験5件と、文書不整合3件（特にセンサー精度・判定保留時間）の解消または暫定合意がない場合、量産反映はリスクがあります。",
      impactAreas: [
        "根拠: 変更7件",
        "影響: 制御3・試験4・FMEA3",
        "不整合: 3件",
        "類似不具合: 2024-071",
      ],
      sources: [src.tol34, src.sensor, src.testHold, src.nc071],
    },
  },
  {
    id: "supplier",
    chipLabel: "サプライヤー確認事項は？",
    question: "サプライヤーに確認すべきことはありますか？",
    answer: {
      summary: "サプライヤーへ確認すべき事項を 3点 抽出しました。",
      impactAreas: [
        "TS-14 の精度 ±4℃ を、制御仕様 ±3℃ に合わせられるか",
        "サンプリング周期 100ms での安定供給可否",
        "冬季始動時の過渡偏差データ（2024-071相当）の提供可否",
      ],
      sources: [src.sensor, src.tol34, src.nc071],
    },
  },
  {
    id: "newbie",
    chipLabel: "新人向けに説明",
    question: "新人向けに簡単に説明してください。",
    answer: {
      summary:
        "温度の測り方のルールが厳しくなりました。以前は ±5℃ までOKでしたが、今は ±3℃ です。また、電源を入れてすぐは5秒待ってから判定します。昔の不具合（冬に誤アラーム）への対策です。",
      sources: [src.tol34, src.hold, src.nc071],
    },
  },
  {
    id: "fmea-impact",
    chipLabel: "FMEAへの影響は？",
    question: "FMEAへの影響はありますか？",
    answer: {
      summary:
        "あります。FMEA-R12 / R19 / R27 の見直しが必要です。特に R19（始動直後の誤アラーム）は、対策が「3秒保留」から仕様上「5秒保留」へ更新されるため、発生頻度・検出度の再評価を推奨します。",
      impactAreas: [
        "FMEA-R12 — センサー偏差による誤判定",
        "FMEA-R19 — 始動直後の誤アラーム（優先）",
        "FMEA-R27 — 判定遅延による保護遅れ",
      ],
      sources: [src.hold, src.nc071, src.judge, src.fmea],
    },
  },
  {
    id: "critical-changes",
    chipLabel: "重要な変更だけ",
    question: "重要な変更だけ教えてください。",
    answer: {
      summary: "重要度「高」の変更は 3件 です。まずここを押さえてください。",
      changes: [
        {
          id: "CHG-01",
          title: "温度センサー許容範囲",
          clauseId: "4.1.3",
          before: "±5℃",
          after: "±3℃",
          severity: "high",
        },
        {
          id: "CHG-02",
          title: "起動後判定保留時間",
          clauseId: "4.1.6",
          before: "なし（即判定）",
          after: "5秒保留",
          severity: "high",
        },
        {
          id: "CHG-03",
          title: "アラーム重大判定閾値",
          clauseId: "5.3.2",
          before: "許容範囲の100%",
          after: "82℃固定",
          severity: "high",
        },
      ],
      sources: [src.tol34, src.hold, src.alarm],
    },
  },
  {
    id: "hold-detail",
    chipLabel: "判定保留の詳細は？",
    question: "起動後の判定保留は追加されましたか？",
    answer: {
      summary:
        "はい。v3.4で起動後5秒の判定保留が新設されました。過去不具合2024-071の対策（当時3秒）を仕様へ昇格し、余裕を持たせた形です。",
      comparisonLabel: "起動後判定保留",
      before: "なし（即判定）",
      after: "5秒保留",
      impactAreas: [
        "制御仕様書 §4.1.6",
        "試験条件一覧 TC-12 はまだ 3秒表記（不整合）",
        "FMEA-R19 の対策記述更新が必要",
      ],
      sources: [src.hold, src.testHold, src.nc071, src.fmea],
    },
  },
  {
    id: "alarm-detail",
    chipLabel: "アラーム閾値は？",
    question: "アラーム閾値は変わりましたか？",
    answer: {
      summary:
        "はい。警告は 78℃、重大は 82℃ に変更されています。旧試験手順書は重大 85℃ のまま残っており、突合が必要です。",
      changes: [
        {
          id: "CHG-04",
          title: "警告アラーム閾値",
          clauseId: "5.3.1",
          before: "許容範囲の80%",
          after: "78℃",
          severity: "medium",
        },
        {
          id: "CHG-03",
          title: "重大アラーム閾値",
          clauseId: "5.3.2",
          before: "許容範囲の100% / 旧手順85℃",
          after: "82℃",
          severity: "high",
        },
      ],
      sources: [src.warn, src.alarm, src.oldAlarm],
    },
  },
  {
    id: "sampling-detail",
    chipLabel: "サンプリング周期は？",
    question: "サンプリング周期の変更はありますか？",
    answer: {
      summary:
        "あります。200ms から 100ms へ短縮されています。応答性試験 TC-31 と、サプライヤーへの100ms安定供給確認が必要です。",
      comparisonLabel: "サンプリング周期",
      before: "200ms",
      after: "100ms",
      impactAreas: [
        "制御仕様書 §4.3.1",
        "再試験: TC-31 応答性試験（必須）",
        "調達: 100msでの安定供給可否を確認",
      ],
      sources: [src.sampling, src.sw],
    },
  },
  {
    id: "log-detail",
    chipLabel: "ログ保存期間は？",
    question: "ログ保存期間は延びましたか？",
    answer: {
      summary: "はい。30日から90日へ延長されています。重要度は低ですが、ストレージ容量と連続運転ログ試験 TC-22 の確認を推奨します。",
      comparisonLabel: "ログ保存期間",
      before: "30日",
      after: "90日",
      sources: [src.log],
    },
  },
  {
    id: "sw-changes",
    chipLabel: "ソフトの修正箇所は？",
    question: "ソフトウェア設計書のどこを直すべきですか？",
    answer: {
      summary:
        "ソフトウェア設計書 v2.0 では、温度異常判定モジュール TempJudge 周辺の更新が必要です。",
      impactAreas: [
        "§6.4.2 TempJudge — 許容範囲 ±3℃ を設定値へ反映",
        "§6.4.3 起動保留タイマ — 5秒を実装／設定",
        "§6.5.1 アラーム境界 — 警告78℃ / 重大82℃",
        "単体テスト: 始動過渡・境界値・例外モード",
      ],
      sources: [src.sw, src.tol34, src.hold, src.alarm],
    },
  },
  {
    id: "ecu-impact",
    chipLabel: "ECUへの影響は？",
    question: "ECUインターフェースに影響はありますか？",
    answer: {
      summary:
        "信号定義自体の追加はありませんが、TEMP_FAULT の立上り条件が重大アラーム82℃判定に追随するため、受信側の閾値理解と結合試験が必要です。",
      impactAreas: [
        "ECU IF §4.2 — TEMP_FAULT 立上り条件の説明更新",
        "結合試験: 78℃警告 / 82℃重大の境界確認",
        "診断ログの閾値コメント更新",
      ],
      sources: [src.ecu, src.alarm, src.warn],
    },
  },
  {
    id: "hw-check",
    chipLabel: "ハード確認事項は？",
    question: "ハードウェア側の確認事項は？",
    answer: {
      summary:
        "取付位置・配線の変更要求はありません。ただし精度要求が厳しくなるため、センサー個体差と取付熱影響の再確認を推奨します。",
      impactAreas: [
        "取付位置: 吸気側ダクト中央（現行どおり）",
        "配線長: 1.5m以内推奨（現行どおり）",
        "追加確認: ±3℃要求に対する実機ばらつき",
        "調達仕様 TS-14（±4℃）とのギャップ是正",
      ],
      sources: [src.hw, src.sensor, src.tol34],
    },
  },
  {
    id: "audit-findings",
    chipLabel: "監査で指摘されそうな点は？",
    question: "品質監査で指摘されそうな点は？",
    answer: {
      summary:
        "監査で指摘されやすい論点を 4件 抽出しました。特に試験条件と制御仕様の版不一致は、既存指摘 QA-17 の再燃リスクがあります。",
      impactAreas: [
        "試験条件一覧が判定保留3秒のまま（制御は5秒）",
        "部品仕様 ±4℃ と制御 ±3℃ の未突合",
        "旧試験手順書 85℃ の残存",
        "FMEA-R19 の対策記述が旧3秒のまま",
      ],
      sources: [src.qa, src.testHold, src.sensor, src.fmea],
    },
  },
  {
    id: "design-review",
    chipLabel: "DRで確認すべきことは？",
    question: "設計レビューで確認すべきことは？",
    answer: {
      summary:
        "DR-118 の承認条件に沿い、次を確認してください。",
      impactAreas: [
        "判定保留5秒の根拠（2024-071 / ナレッジK-12）を説明できるか",
        "試験条件一覧 v7.3 の更新案があるか",
        "必須再試験5件の計画と担当が決まっているか",
        "文書不整合3件の是正または暫定合意があるか",
      ],
      sources: [src.dr, src.hold, src.nc071, src.knowledge],
    },
  },
  {
    id: "regulatory",
    chipLabel: "規制・安全の論点は？",
    question: "規制・安全要求上の論点は？",
    answer: {
      summary:
        "保護機能の閾値変更に該当するため、安全要求チェックリスト S-08 に基づく影響評価と再検証記録が必要です。",
      impactAreas: [
        "S-08: 閾値変更時の影響評価",
        "再検証: 重大アラーム82℃ / 始動保留5秒",
        "記録: 試験成績書と変更管理票 Gate-B の紐づけ",
      ],
      sources: [src.reg, src.alarm, src.ecr],
    },
  },
  {
    id: "ecr-gate",
    chipLabel: "変更管理の承認条件は？",
    question: "変更管理票の承認条件は満たしていますか？",
    answer: {
      summary:
        "まだ満たしていません。ECR-034 Gate-B の前提条件のうち、必須再試験完了と文書不整合の是正／暫定合意が未完了です。",
      impactAreas: [
        "未完了: 必須再試験5件",
        "未完了: 文書不整合3件の是正または暫定合意",
        "進行中: FMEA更新（R12/R19/R27）",
        "完了寄り: 変更理由と主要差分の文書化",
      ],
      sources: [src.ecr, src.qa, src.fmea],
    },
  },
  {
    id: "knowledge",
    chipLabel: "ベテラン知見は？",
    question: "ベテラン設計者のメモに関連知見は？",
    answer: {
      summary:
        "あります。ナレッジ K-12 は「冬場の初回始動はセンサーが低く出やすい。3秒では足りない現場があった」と記録しており、今回の5秒保留の根拠になります。",
      impactAreas: [
        "K-12: 冬季始動の過渡偏差",
        "示唆: 3秒保留では再発しうる",
        "今回改訂: 5秒へ延長して仕様化",
      ],
      sources: [src.knowledge, src.hold, src.nc071],
    },
  },
  {
    id: "customer-brief",
    chipLabel: "顧客説明用の要点は？",
    question: "顧客説明用に変更の要点をください。",
    answer: {
      summary:
        "今回の改訂は、温度判定をより正確にし、始動直後の誤アラームを減らすためのものです。判定は厳しくなりますが、起動後5秒は様子を見てから判定します。量産反映前に、試験条件と部品仕様の最終突合を実施します。",
      impactAreas: [
        "顧客向け要点1: 誤アラーム低減（始動保留）",
        "顧客向け要点2: 判定精度の向上（±3℃）",
        "顧客向け要点3: 安全側の重大閾値を明確化（82℃）",
      ],
      sources: [src.tol34, src.hold, src.alarm],
    },
  },
  {
    id: "action-plan",
    chipLabel: "次にやるべきことは？",
    question: "次にやるべきことを教えてください。",
    answer: {
      summary: "優先度順のアクションを整理しました。今日〜今週で潰すべき項目です。",
      impactAreas: [
        "1. 試験条件一覧の判定保留を 3秒→5秒 に更新",
        "2. センサー仕様 ±4℃ と制御 ±3℃ の突合（調達確認）",
        "3. 必須再試験5件の日程・担当を確定",
        "4. FMEA-R19 の対策記述を5秒へ更新",
        "5. 旧試験手順書85℃の廃止または改訂",
      ],
      sources: [src.testHold, src.sensor, src.ecr, src.fmea],
    },
  },
  {
    id: "open-risks",
    chipLabel: "未解決リスクは？",
    question: "いま残っているリスクは何ですか？",
    answer: {
      summary: "量産反映前に残る主なリスクは 5件 です。",
      impactAreas: [
        "高: 部品精度と制御閾値の不一致（±4℃ vs ±3℃）",
        "高: 試験条件が旧保留時間のまま",
        "中: 旧手順85℃の誤用リスク",
        "中: FMEA未更新による監査指摘",
        "低: ログ90日化に伴うストレージ不足",
      ],
      sources: [src.sensor, src.testHold, src.oldAlarm, src.qa],
    },
  },
  {
    id: "man-hours",
    chipLabel: "従来どれくらいかかる？",
    question: "これを手作業でやるとどれくらいかかりますか？",
    answer: {
      summary:
        "同種の確認を手作業で行う場合の目安です。GembaShiftでは同じ確認を数秒〜数分で横断できます。",
      impactAreas: [
        "版差分の洗い出し: 半日〜1日",
        "影響範囲（制御・試験・FMEA）: 1〜3日",
        "文書間の矛盾突合: 半日〜1日",
        "類似不具合の探索: 数時間〜1日",
        "合計: おおよそ 3〜6人日",
      ],
      sources: [src.tol34, src.qa, src.nc071],
    },
  },
  {
    id: "srs-align",
    chipLabel: "要求仕様との整合は？",
    question: "システム要求仕様書との整合は取れていますか？",
    answer: {
      summary:
        "大枠は整合しています。REQ-T-09（誤検知最小化と危険温度の見逃し防止、始動過渡の特別扱い）に対し、±3℃厳格化と5秒保留は適合方向です。ただし部品仕様の未突合が残るため、完全適合とは言えません。",
      impactAreas: [
        "適合: 始動過渡の特別扱い（5秒保留）",
        "適合寄り: 危険温度の明確化（82℃）",
        "未完了: センサー精度の要求カスケード",
      ],
      sources: [src.srs, src.hold, src.tol34, src.sensor],
    },
  },
  {
    id: "dr-minutes",
    chipLabel: "議事録の関連指摘は？",
    question: "設計レビュー議事録の関連指摘は？",
    answer: {
      summary:
        "DR-118-07 が直接関連します。「判定保留時間の根拠を過去不具合と紐づけて説明し、試験条件一覧の更新を承認条件とする」とあります。",
      impactAreas: [
        "指摘: 保留時間の根拠説明",
        "承認条件: 試験条件一覧の更新",
        "今回の対応: 2024-071 / K-12 を根拠に5秒化",
      ],
      sources: [src.dr, src.nc071, src.knowledge],
    },
  },
  {
    id: "training",
    chipLabel: "現場教育は必要？",
    question: "現場教育は必要ですか？",
    answer: {
      summary:
        "必要です。特に「起動直後は5秒判定保留」「保留中でも重大アラームは有効な場合がある」「警告78℃ / 重大82℃」の3点を、製造・試験・サービスへ共有してください。",
      impactAreas: [
        "教育対象: 製造 / 試験 / サービス",
        "必須トピック: 5秒保留・重大アラーム例外・新閾値",
        "教材: 新人向け温度制御概要 v1.0 の改訂も推奨",
      ],
      sources: [src.train, src.hold, src.exception, src.alarm],
    },
  },
  {
    id: "rollback",
    chipLabel: "戻す条件は？",
    question: "問題が起きた場合のロールバック条件は？",
    answer: {
      summary:
        "ECR-034 の運用では、必須再試験で重大不具合が出た場合、または量産初期に誤アラーム／見逃しが再発した場合に v3.2 相当設定への切り戻しを検討します。",
      impactAreas: [
        "トリガ: 必須再試験の重大失敗",
        "トリガ: 量産初期の誤アラーム再発",
        "切り戻し対象: 許容範囲・保留時間・アラーム閾値の設定値",
        "注意: 試験条件・FMEAも同時に戻すこと",
      ],
      sources: [src.ecr, src.tol32, src.alarm],
    },
  },
  {
    id: "priority-top3",
    chipLabel: "最優先の3つは？",
    question: "今いちばん優先すべきことは何ですか？",
    answer: {
      summary: "最優先は次の3つです。",
      impactAreas: [
        "1. 文書不整合の解消（保留時間・センサー精度）",
        "2. 必須再試験5件の実施計画確定",
        "3. FMEA-R19 更新とDR承認条件の充足",
      ],
      exceptionNote:
        "この3つが揃うまで、量産反映の承認は条件付きのままです。",
      sources: [src.ecr, src.testHold, src.sensor, src.fmea],
    },
  },
  {
    id: "cold-start",
    chipLabel: "低温始動の要点は？",
    question: "低温始動試験で見るべきポイントは？",
    answer: {
      summary:
        "TC-12（低温始動）では、起動後5秒間に誤アラームが出ないこと、5秒経過後に通常判定へ入ること、重大アラームが保留対象外であることを確認します。",
      impactAreas: [
        "確認1: 0〜5秒で通常判定が動かない",
        "確認2: 5秒後に ±3℃ 判定が有効",
        "確認3: 重大条件では保留中でも保護が働く",
        "注意: 現行試験条件書は3秒表記のまま（要更新）",
      ],
      sources: [src.hold, src.testHold, src.exception, src.nc071],
    },
  },
  {
    id: "owners",
    chipLabel: "誰が担当すべき？",
    question: "部門ごとの担当分担を教えてください。",
    answer: {
      summary: "部門別の担当案です。",
      impactGroups: [
        {
          label: "設計（制御／ソフト）",
          count: 3,
          items: [
            "仕様差分の確定と設定値反映",
            "TempJudge / 保留タイマ実装",
            "FMEA更新",
          ],
        },
        {
          label: "試験",
          count: 2,
          items: [
            "必須再試験5件の実施",
            "試験条件一覧の改訂",
          ],
        },
        {
          label: "調達／品質",
          count: 3,
          items: [
            "センサー精度のサプライヤー確認",
            "監査指摘QA-17の是正記録",
            "変更管理 Gate-B 判定",
          ],
        },
      ],
      sources: [src.sw, src.ecr, src.qa, src.sensor],
    },
  },
];

/** LP インタラクティブデモ用（従来の4チップ） */
export const lpDemoQuestions = demoQuestions.filter((q) =>
  ["version-diff", "impact-scope", "exception", "source-trace"].includes(q.id),
);

export const checklistItems = [
  {
    title: "仕様書のバージョン突合",
    detail: "v3.2とv3.4の差分を、毎回手作業で確認している",
  },
  {
    title: "部品変更時のFMEA",
    detail: "影響範囲の特定に数日かかっている",
  },
  {
    title: "試験条件の根拠探索",
    detail: "過去の試験ログから条件の根拠を辿れない",
  },
  {
    title: "サプライヤー問合せ即答",
    detail: "仕様に関する問い合わせへの回答に時間がかかる",
  },
  {
    title: "設計DR過去指摘の遡及",
    detail: "類似指摘を議事録から手作業で探している",
  },
  {
    title: "リコール対応の根拠提示",
    detail: "該当条項の特定に数日を要している",
  },
];

export const impactRows = [
  {
    task: "仕様書内の検索",
    before: "数十分〜数時間",
    after: "数秒",
    reduction: "99% ↓",
  },
  {
    task: "バージョン間比較",
    before: "半日〜1日",
    after: "即時",
    reduction: "99% ↓",
  },
  {
    task: "影響範囲の分析",
    before: "1〜3日",
    after: "数秒",
    reduction: "99% ↓",
  },
  {
    task: "条件を変えた試算",
    before: "数時間",
    after: "即時",
    reduction: "95% ↓",
  },
];
