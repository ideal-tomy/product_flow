export type ScenarioId =
  | "version-diff"
  | "impact-scope"
  | "retest"
  | "contradiction"
  | "similar-cases"
  | "exception"
  | "source-trace"
  | "exec-summary"
  | "approval"
  | "supplier"
  | "newbie"
  | "fmea-impact"
  | "critical-changes"
  | "hold-detail"
  | "alarm-detail"
  | "sampling-detail"
  | "log-detail"
  | "sw-changes"
  | "ecu-impact"
  | "hw-check"
  | "audit-findings"
  | "design-review"
  | "regulatory"
  | "ecr-gate"
  | "knowledge"
  | "customer-brief"
  | "action-plan"
  | "open-risks"
  | "man-hours"
  | "srs-align"
  | "dr-minutes"
  | "training"
  | "rollback"
  | "priority-top3"
  | "cold-start"
  | "owners";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[？?！!。、．，,\s　]/g, "")
    .replace(/ｖ/g, "v");
}

const aliasMap: Record<ScenarioId, string[]> = {
  "critical-changes": [
    "重要な変更だけ教えてください",
    "重要な変更だけ",
    "重要度が高い変更は",
    "優先度の高い差分だけ",
    "ハイリスクな変更は",
  ],
  "hold-detail": [
    "起動後の判定保留は追加されましたか？",
    "判定保留の詳細は？",
    "起動後5秒とは",
    "判定保留時間は",
    "保留は何秒",
    "始動直後の保留",
  ],
  "alarm-detail": [
    "アラーム閾値は変わりましたか？",
    "アラーム閾値は？",
    "警告と重大の温度は",
    "78℃と82℃",
    "重大アラームは何度",
    "警告アラーム閾値",
  ],
  "sampling-detail": [
    "サンプリング周期の変更はありますか？",
    "サンプリング周期は？",
    "100msになった",
    "サンプリングは変わった",
  ],
  "log-detail": [
    "ログ保存期間は延びましたか？",
    "ログ保存期間は？",
    "90日保存",
    "ログは何日",
  ],
  "sw-changes": [
    "ソフトウェア設計書のどこを直すべきですか？",
    "ソフトの修正箇所は？",
    "ソフトどこ直す",
    "TempJudge",
    "実装で直すところ",
    "ソフトウェアの変更点",
  ],
  "ecu-impact": [
    "ECUインターフェースに影響はありますか？",
    "ECUへの影響は？",
    "TEMP_FAULT",
    "インターフェース定義への影響",
    "ECU IF",
  ],
  "hw-check": [
    "ハードウェア側の確認事項は？",
    "ハード確認事項は？",
    "取付位置は変わる",
    "ハードウェアの影響",
    "センサー取付",
  ],
  "audit-findings": [
    "品質監査で指摘されそうな点は？",
    "監査で指摘されそうな点は？",
    "監査リスク",
    "QAで怒られそうな点",
    "監査指摘になりそう",
  ],
  "design-review": [
    "設計レビューで確認すべきことは？",
    "DRで確認すべきことは？",
    "デザインレビューの論点",
    "レビューで見るべきこと",
  ],
  "regulatory": [
    "規制・安全要求上の論点は？",
    "規制・安全の論点は？",
    "安全要求",
    "規制上の確認点",
    "S-08",
  ],
  "ecr-gate": [
    "変更管理票の承認条件は満たしていますか？",
    "変更管理の承認条件は？",
    "ECRのゲート",
    "Gate-B",
    "量産反映の前提条件",
  ],
  knowledge: [
    "ベテラン設計者のメモに関連知見は？",
    "ベテラン知見は？",
    "ナレッジメモ",
    "暗黙知",
    "K-12",
  ],
  "customer-brief": [
    "顧客説明用に変更の要点をください",
    "顧客説明用の要点は？",
    "お客様向け説明",
    "対外説明の要点",
  ],
  "action-plan": [
    "次にやるべきことを教えてください",
    "次にやるべきことは？",
    "これから何をすべき",
    "アクションプラン",
    "TODOを整理して",
    "やるべきこと一覧",
  ],
  "open-risks": [
    "いま残っているリスクは何ですか？",
    "未解決リスクは？",
    "残リスク",
    "リスク一覧",
    "まだ危ないところ",
  ],
  "man-hours": [
    "これを手作業でやるとどれくらいかかりますか？",
    "従来どれくらいかかる？",
    "何人日かかる",
    "工数はどれくらい",
    "手作業だと何時間",
  ],
  "srs-align": [
    "システム要求仕様書との整合は取れていますか？",
    "要求仕様との整合は？",
    "REQ-T-09",
    "上位要求との整合",
    "SRSとの整合",
  ],
  "dr-minutes": [
    "設計レビュー議事録の関連指摘は？",
    "議事録の関連指摘は？",
    "DR-118",
    "過去のDR指摘",
    "議事録に関連は",
  ],
  training: [
    "現場教育は必要ですか？",
    "現場教育は必要？",
    "教育は必要か",
    "トレーニング項目",
    "周知すべきこと",
  ],
  rollback: [
    "問題が起きた場合のロールバック条件は？",
    "戻す条件は？",
    "切り戻し条件",
    "ロールバック",
    "失敗したらどう戻す",
  ],
  "priority-top3": [
    "今いちばん優先すべきことは何ですか？",
    "最優先の3つは？",
    "優先順位トップ3",
    "一番大事なこと",
    "まず何から",
  ],
  "cold-start": [
    "低温始動試験で見るべきポイントは？",
    "低温始動の要点は？",
    "TC-12の確認点",
    "低温始動試験は必要ですか？",
    "冬場始動の試験",
  ],
  owners: [
    "部門ごとの担当分担を教えてください",
    "誰が担当すべき？",
    "誰が何をやる",
    "役割分担",
    "担当部門",
  ],
  contradiction: [
    "文書間で矛盾している箇所はありますか？",
    "文書間の矛盾はある？",
    "センサー仕様と制御仕様は一致していますか？",
    "試験条件と制御仕様の食い違いは？",
    "旧試験手順書との差分で危険なものは？",
    "不整合の重要度が高いものだけ見せて",
    "矛盾している箇所",
    "文書の食い違い",
    "不整合候補",
  ],
  "similar-cases": [
    "過去に似た不具合はありましたか？",
    "過去に似た不具合は？",
    "冬季始動の事例はありますか？",
    "類似の監査指摘はありますか？",
    "過去の対策は今回の改訂に活きていますか？",
    "類似事例を見せて",
    "似た不具合はある",
    "過去事例",
  ],
  "fmea-impact": [
    "FMEAへの影響はありますか？",
    "FMEAへの影響は？",
    "FMEAは更新必要",
    "FMEA-R19",
    "FMEAの見直し",
  ],
  retest: [
    "再試験が必要な項目は？",
    "必須の再試験だけ教えてください",
    "アラーム境界試験の条件は？",
    "再試験一覧",
    "どの試験をやり直す",
    "回帰試験は必要",
  ],
  approval: [
    "この変更を承認して大丈夫ですか？",
    "承認して大丈夫？",
    "承認判断",
    "承認してよいか",
    "Go判断は",
  ],
  supplier: [
    "サプライヤーに確認すべきことはありますか？",
    "サプライヤー確認事項は？",
    "調達先に聞くことは",
    "仕入先への確認",
    "ベンダー確認",
  ],
  "exec-summary": [
    "経営層向けに3行でまとめてください",
    "経営層向けに3行で",
    "経営向けサマリー",
    "役員向けに短く",
    "エグゼクティブサマリー",
  ],
  newbie: [
    "新人向けに簡単に説明してください",
    "新人向けに説明",
    "わかりやすく説明して",
    "かみくだいて説明",
    "初心者向けに",
  ],
  exception: [
    "この条件に例外はありますか？",
    "例外規定はありますか？",
    "例外はある？",
    "例外規定",
    "試験運転の例外",
    "適用除外はあるか",
    "例外条項を教えて",
    "校正中はどう扱いますか？",
    "試験運転モードで止まらないアラームは？",
  ],
  "source-trace": [
    "この回答の根拠となる条項とページを教えてください",
    "根拠となる条項は？",
    "この回答の出典ページを教えてください",
    "§4.1.3 の原文を見せて",
    "v3.2とv3.4の該当箇所を並べて",
    "出典を教えて",
    "根拠はどこ",
    "どのページ",
    "条項とページ",
    "出典ページ",
    "根拠条項",
  ],
  "impact-scope": [
    "この変更の影響範囲は？",
    "この変更によって影響を受ける制御ロジックはどこですか？",
    "影響を受ける制御ロジックはどこですか？",
    "どこに影響する？",
    "関連する制御は？",
    "他の条項にも関係ある？",
    "影響箇所を教えて",
    "影響範囲は",
    "制御ロジックへの影響",
    "波及する箇所",
    "試験への影響はありますか？",
    "波及する条項をすべて挙げてください",
  ],
  "version-diff": [
    "v3.2からv3.4で何が変わりましたか？",
    "v3.2からv3.4で何が変わった？",
    "v3.2とv3.4で、温度センサーの許容範囲は変わりましたか？",
    "温度センサーの許容範囲は、v3.2からv3.4で変わりましたか？",
    "温度センサーの許容範囲は変わりましたか？",
    "温度センサーは変更された？",
    "温度センサーは変わった？",
    "v3.2と3.4の違いを教えて",
    "v3.2とv3.4の違い",
    "許容温度って変わった？",
    "許容範囲は変わりましたか",
    "許容範囲は変更された",
    "バージョン間で何が変わりましたか",
    "バージョン間の差分を一覧で見せてください",
    "±5℃から何度になりましたか？",
    "試験運転モードの例外は変わりましたか？",
    "版の差分を教えて",
    "温度センサーの差分",
    "差分一覧",
  ],
};

/** Live Demo 上部の推奨チップ */
export const scenarioSuggestions: { id: ScenarioId; label: string }[] = [
  { id: "version-diff", label: "v3.2からv3.4で何が変わった？" },
  { id: "impact-scope", label: "この変更の影響範囲は？" },
  { id: "retest", label: "再試験が必要な項目は？" },
  { id: "contradiction", label: "文書間の矛盾はある？" },
  { id: "similar-cases", label: "過去に似た不具合は？" },
  { id: "action-plan", label: "次にやるべきことは？" },
  { id: "open-risks", label: "未解決リスクは？" },
  { id: "priority-top3", label: "最優先の3つは？" },
];

/** 未マッチ時の追加サジェスト */
export const unmatchedSuggestions = [
  ...scenarioSuggestions.map((s) => s.label),
  "経営層向けに3行でまとめてください",
  "サプライヤーに確認すべきことは？",
  "誰が担当すべき？",
  "従来どれくらいかかる？",
];

export const nextPresetAfter: Record<ScenarioId, string> = {
  "version-diff": "この変更の影響範囲は？",
  "impact-scope": "過去に似た不具合は？",
  "similar-cases": "文書間で矛盾している箇所は？",
  contradiction: "次にやるべきことを教えてください",
  retest: "低温始動試験で見るべきポイントは？",
  exception: "根拠となる条項は？",
  "source-trace": "",
  "exec-summary": "この変更を承認して大丈夫ですか？",
  approval: "変更管理票の承認条件は満たしていますか？",
  supplier: "ハードウェア側の確認事項は？",
  newbie: "重要な変更だけ教えてください",
  "fmea-impact": "再試験が必要な項目は？",
  "critical-changes": "この変更の影響範囲は？",
  "hold-detail": "低温始動試験で見るべきポイントは？",
  "alarm-detail": "文書間で矛盾している箇所は？",
  "sampling-detail": "サプライヤーに確認すべきことはありますか？",
  "log-detail": "再試験が必要な項目は？",
  "sw-changes": "ECUインターフェースに影響はありますか？",
  "ecu-impact": "ハードウェア側の確認事項は？",
  "hw-check": "サプライヤーに確認すべきことはありますか？",
  "audit-findings": "設計レビューで確認すべきことは？",
  "design-review": "変更管理票の承認条件は満たしていますか？",
  regulatory: "この変更を承認して大丈夫ですか？",
  "ecr-gate": "今いちばん優先すべきことは何ですか？",
  knowledge: "過去に似た不具合はありましたか？",
  "customer-brief": "経営層向けに3行でまとめてください",
  "action-plan": "部門ごとの担当分担を教えてください",
  "open-risks": "今いちばん優先すべきことは何ですか？",
  "man-hours": "次にやるべきことを教えてください",
  "srs-align": "規制・安全要求上の論点は？",
  "dr-minutes": "設計レビューで確認すべきことは？",
  training: "新人向けに簡単に説明してください",
  rollback: "変更管理票の承認条件は満たしていますか？",
  "priority-top3": "次にやるべきことを教えてください",
  "cold-start": "再試験が必要な項目は？",
  owners: "今いちばん優先すべきことは何ですか？",
};

/** 具体度の高いシナリオを先に判定 */
const matchOrder: ScenarioId[] = [
  "critical-changes",
  "hold-detail",
  "alarm-detail",
  "sampling-detail",
  "log-detail",
  "sw-changes",
  "ecu-impact",
  "hw-check",
  "audit-findings",
  "design-review",
  "regulatory",
  "ecr-gate",
  "knowledge",
  "customer-brief",
  "action-plan",
  "open-risks",
  "man-hours",
  "srs-align",
  "dr-minutes",
  "training",
  "rollback",
  "priority-top3",
  "cold-start",
  "owners",
  "contradiction",
  "similar-cases",
  "fmea-impact",
  "retest",
  "approval",
  "supplier",
  "exec-summary",
  "newbie",
  "exception",
  "source-trace",
  "impact-scope",
  "version-diff",
];

export function matchScenario(input: string): ScenarioId | null {
  const n = normalize(input);
  if (!n) return null;

  for (const id of matchOrder) {
    for (const alias of aliasMap[id]) {
      const a = normalize(alias);
      if (!a) continue;
      if (n === a || n.includes(a) || (a.length >= 4 && a.includes(n))) {
        return id;
      }
    }
  }

  if (n.includes("重要") && (n.includes("変更") || n.includes("差分"))) {
    return "critical-changes";
  }
  if (n.includes("保留") || (n.includes("5秒") && n.includes("判定"))) {
    return "hold-detail";
  }
  if (n.includes("アラーム") && (n.includes("閾値") || n.includes("78") || n.includes("82"))) {
    return "alarm-detail";
  }
  if (n.includes("サンプリング") || n.includes("100ms")) {
    return "sampling-detail";
  }
  if (n.includes("ログ") && (n.includes("保存") || n.includes("90"))) {
    return "log-detail";
  }
  if (n.includes("ソフト") || n.includes("実装") || n.includes("tempjudge")) {
    return "sw-changes";
  }
  if (n.includes("ecu") || n.includes("インターフェース") || n.includes("temp_fault")) {
    return "ecu-impact";
  }
  if (n.includes("ハード") || n.includes("取付")) {
    return "hw-check";
  }
  if (n.includes("監査")) {
    return "audit-findings";
  }
  if (n.includes("レビュー") || n.includes("drで")) {
    return "design-review";
  }
  if (n.includes("規制") || n.includes("安全要求")) {
    return "regulatory";
  }
  if (n.includes("変更管理") || n.includes("ecr") || n.includes("gate")) {
    return "ecr-gate";
  }
  if (n.includes("ベテラン") || n.includes("ナレッジ") || n.includes("暗黙知")) {
    return "knowledge";
  }
  if (n.includes("顧客") || n.includes("お客様") || n.includes("対外")) {
    return "customer-brief";
  }
  if (n.includes("次にやる") || n.includes("アクション") || n.includes("todo")) {
    return "action-plan";
  }
  if (n.includes("リスク") || n.includes("未解決")) {
    return "open-risks";
  }
  if (n.includes("人日") || n.includes("工数") || n.includes("手作業") || n.includes("何時間")) {
    return "man-hours";
  }
  if (n.includes("要求仕様") || n.includes("srs") || n.includes("上位要求")) {
    return "srs-align";
  }
  if (n.includes("議事録")) {
    return "dr-minutes";
  }
  if (n.includes("教育") || n.includes("周知") || n.includes("トレーニング")) {
    return "training";
  }
  if (n.includes("ロールバック") || n.includes("切り戻") || n.includes("戻す条件")) {
    return "rollback";
  }
  if (n.includes("最優先") || n.includes("優先すべき") || n.includes("まず何")) {
    return "priority-top3";
  }
  if (n.includes("低温始動") || n.includes("tc-12") || n.includes("冬場始動")) {
    return "cold-start";
  }
  if (n.includes("担当") || n.includes("分担") || n.includes("誰が")) {
    return "owners";
  }
  if (
    n.includes("矛盾") ||
    n.includes("不整合") ||
    n.includes("食い違") ||
    n.includes("一致して")
  ) {
    return "contradiction";
  }
  if (
    n.includes("似た不具合") ||
    n.includes("類似") ||
    n.includes("過去の不具合") ||
    n.includes("冬季始動")
  ) {
    return "similar-cases";
  }
  if (n.includes("fmea")) {
    return "fmea-impact";
  }
  if (n.includes("再試験") || n.includes("回帰試験")) {
    return "retest";
  }
  if (n.includes("承認")) {
    return "approval";
  }
  if (n.includes("サプライヤー") || n.includes("調達") || n.includes("仕入先")) {
    return "supplier";
  }
  if (n.includes("経営") || n.includes("役員") || n.includes("3行")) {
    return "exec-summary";
  }
  if (n.includes("新人") || n.includes("簡単に説明") || n.includes("わかりやすく") || n.includes("初心者")) {
    return "newbie";
  }
  if (n.includes("例外") || n.includes("適用除外") || n.includes("校正中")) {
    return "exception";
  }
  if (n.includes("根拠") || n.includes("出典") || n.includes("原文")) {
    return "source-trace";
  }
  if (n.includes("影響") || n.includes("波及")) {
    return "impact-scope";
  }
  if (
    (n.includes("許容") ||
      n.includes("温度センサー") ||
      n.includes("センサー") ||
      n.includes("変わ") ||
      n.includes("差分")) &&
    (n.includes("変") || n.includes("差分") || n.includes("v3") || n.includes("違い") || n.includes("一覧"))
  ) {
    return "version-diff";
  }

  return null;
}
