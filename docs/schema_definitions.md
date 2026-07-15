# スキーマ定義書
AIデモ共通基盤:チャットボット「部署別プロンプト」/ OCRデモ「出力スキーマ」

このドキュメントは実装(Cursor)にそのまま渡せる形で記述しています。

---

# Part 1:チャットボット 部署別プロンプトスキーマ

## 1-1. 設計方針
- クライアント(または営業側)が投入するプロンプトは**自由記述で受けない**
- すべて下記の5スロット固定スキーマに正規化してから保存する
- システムプロンプトは「共通ベース + スキーマ差し込み」で機械的に組み立てる
- ②業界別ナレッジ ③部署別サンプル ④クライアント投入分、すべて同一スキーマで管理する

## 1-2. スキーマ定義(JSON)

```json
{
  "schema_version": "1.0",
  "prompt_id": "string (例: mfg-soumu-001)",
  "meta": {
    "industry": "string (製造業 / 物流 / 医療 / 小売 / 共通)",
    "department": "string (総務 / 営業 / 製造 / 経理 / 人事 / 情シス)",
    "label": "string (UI表示名 例: 総務部アシスタント)",
    "created_by": "string (sample | client)",
    "updated_at": "ISO 8601"
  },
  "role": {
    "persona": "string (例: 総務部の業務に精通した社内アシスタント)",
    "mission": "string (例: 社内規程・手続きに関する質問に正確に回答する)"
  },
  "knowledge_scope": {
    "sources": ["string (参照するナレッジファイル/カテゴリのID)"],
    "priority": "string (複数ソースが矛盾した場合の優先順位ルール)",
    "out_of_scope_action": "string (範囲外の質問への対応 例: 「担当部署への確認を案内する」)"
  },
  "tone": {
    "style": "string (丁寧 / フランク / 簡潔・事務的)",
    "language_level": "string (専門用語OK / 新入社員にもわかる平易さ)",
    "person": "string (です・ます調 / 箇条書き中心)"
  },
  "output_format": {
    "default_structure": "string (例: 結論→根拠→関連規程の参照元)",
    "max_length": "string (例: 300字以内を基本、手順説明は例外)",
    "citation": "boolean (回答に出典ナレッジ名を付けるか)"
  },
  "prohibitions": [
    "string (例: 推測で規程内容を答えない)",
    "string (例: 個人の評価・人事情報には言及しない)",
    "string (例: ナレッジにない場合は『わかりません』と明言する)"
  ]
}
```

## 1-3. 正規化フロー(クライアント投入時)

```
クライアントの自由記述プロンプト
        │
        ▼
[AI正規化] ── 変換用プロンプトで5スロットJSONに変換
        │        ・埋まらないスロットは業界×部署のデフォルト値で補完
        │        ・prohibitions には共通禁止事項3件を必ずマージ
        ▼
[バリデーション] ── 必須スロット充足チェック / 禁止事項の重複排除
        │
        ▼
[保存] ── prompt_id を採番して保存、UI上でプレビュー表示
```

### 正規化用プロンプト(実装用テンプレート)

```
あなたはプロンプト設計者です。以下のユーザー入力を、指定のJSONスキーマに変換してください。

ルール:
- 入力に含まれない項目は、業界「{industry}」部署「{department}」の一般的な値で補完する
- prohibitions には必ず次の3件を含める:
  「参照ナレッジにない内容を推測で答えない」
  「個人情報・人事評価に関する質問には答えない」
  「回答できない場合はその旨を明言し、確認先を案内する」
- 出力はJSONのみ。前置きやコードブロック記法は不要

ユーザー入力:
{raw_prompt}

出力スキーマ:
{schema_definition}
```

## 1-4. システムプロンプト組み立てテンプレート

```
あなたは{meta.label}です。{role.persona}として、{role.mission}。

# 参照できる情報
{knowledge_scope.sources を展開}
矛盾がある場合: {knowledge_scope.priority}
範囲外の質問: {knowledge_scope.out_of_scope_action}

# 回答スタイル
- 文体: {tone.style}、{tone.person}
- 想定読者: {tone.language_level}
- 構成: {output_format.default_structure}
- 長さ: {output_format.max_length}
{output_format.citation が true なら「- 回答末尾に参照したナレッジ名を記載」}

# 禁止事項
{prohibitions を箇条書き展開}
```

## 1-5. 部署別サンプル(3種)

### サンプルA:製造業 × 総務部

```json
{
  "schema_version": "1.0",
  "prompt_id": "mfg-soumu-001",
  "meta": { "industry": "製造業", "department": "総務", "label": "総務部アシスタント", "created_by": "sample", "updated_at": "2026-07-15" },
  "role": {
    "persona": "社内規程と各種手続きに精通した総務部のアシスタント",
    "mission": "従業員からの規程・手続き・福利厚生に関する質問に正確に回答する"
  },
  "knowledge_scope": {
    "sources": ["就業規則", "経費精算規程", "福利厚生ガイド"],
    "priority": "就業規則を最優先とし、他文書と矛盾する場合は就業規則に従う",
    "out_of_scope_action": "総務部窓口(内線)への確認を案内する"
  },
  "tone": { "style": "丁寧", "language_level": "新入社員にもわかる平易さ", "person": "です・ます調" },
  "output_format": {
    "default_structure": "結論→手続き手順→参照規程名",
    "max_length": "300字以内を基本、手順説明は箇条書きで例外可",
    "citation": true
  },
  "prohibitions": [
    "参照ナレッジにない内容を推測で答えない",
    "個人情報・人事評価に関する質問には答えない",
    "回答できない場合はその旨を明言し、確認先を案内する",
    "規程の解釈が分かれる場合は断定せず総務部確認を促す"
  ]
}
```

### サンプルB:製造業 × 製造部(現場)

```json
{
  "schema_version": "1.0",
  "prompt_id": "mfg-seizo-001",
  "meta": { "industry": "製造業", "department": "製造", "label": "現場サポートAI", "created_by": "sample", "updated_at": "2026-07-15" },
  "role": {
    "persona": "作業手順書と安全基準を熟知した現場サポート担当",
    "mission": "作業手順・設備操作・安全基準に関する質問に、現場で即使える形で回答する"
  },
  "knowledge_scope": {
    "sources": ["作業手順書", "安全衛生マニュアル", "設備取扱説明書"],
    "priority": "安全に関わる内容は安全衛生マニュアルを最優先",
    "out_of_scope_action": "ライン長または安全管理者への確認を指示する"
  },
  "tone": { "style": "簡潔・事務的", "language_level": "専門用語OK", "person": "箇条書き中心" },
  "output_format": {
    "default_structure": "手順の箇条書き→注意事項→参照文書名",
    "max_length": "スマホ1画面で読める分量",
    "citation": true
  },
  "prohibitions": [
    "参照ナレッジにない内容を推測で答えない",
    "個人情報・人事評価に関する質問には答えない",
    "回答できない場合はその旨を明言し、確認先を案内する",
    "安全に関わる手順の省略・簡略化を提案しない"
  ]
}
```

### サンプルC:共通 × 営業部

```json
{
  "schema_version": "1.0",
  "prompt_id": "cmn-eigyo-001",
  "meta": { "industry": "共通", "department": "営業", "label": "営業ナレッジAI", "created_by": "sample", "updated_at": "2026-07-15" },
  "role": {
    "persona": "自社の商品知識と過去の提案事例に詳しい営業サポート担当",
    "mission": "商品仕様・価格体系・過去事例に関する質問に回答し、提案準備を支援する"
  },
  "knowledge_scope": {
    "sources": ["商品カタログ", "価格表", "提案事例集", "FAQ"],
    "priority": "価格は価格表のみを正とし、事例集内の価格情報は参考扱いにする",
    "out_of_scope_action": "個別見積が必要な旨を伝え、営業管理者への確認を案内する"
  },
  "tone": { "style": "丁寧", "language_level": "専門用語OK", "person": "です・ます調" },
  "output_format": {
    "default_structure": "結論→補足情報→関連する過去事例",
    "max_length": "400字以内",
    "citation": true
  },
  "prohibitions": [
    "参照ナレッジにない内容を推測で答えない",
    "個人情報・人事評価に関する質問には答えない",
    "回答できない場合はその旨を明言し、確認先を案内する",
    "価格表にない値引き・特価の提示をしない"
  ]
}
```

---

# Part 2:OCRデモ 出力スキーマ

## 2-1. 設計方針
- テンプレート(帳票見本)の解析は**初回1回だけ**。以降はスキーマJSONを再利用し、毎回の画像解析にテンプレを含めない(コスト削減)
- スキーマは「フィールド定義+抽出ヒント」を持ち、これをシステムプロンプトに変換して画像解析に使う
- 出力は必ずJSON→UIで表形式表示→CSVダウンロード可能、の一本道

## 2-2. 全体フロー

```
【初回のみ】
テンプレート画像/見本帳票をアップ
        │
        ▼
[スキーマ生成] ── AIが帳票からフィールド定義JSONを生成
        │
        ▼
[人によるスキーマ確認・修正] ── UI上でフィールド名・型・必須を編集可能
        │
        ▼
[スキーマ保存] ── schema_id 採番

【毎回】
帳票画像をアップ(クライアント側で長辺1568px以下にリサイズ・JPEG圧縮)
        │
        ▼
[抽出] ── 保存済みスキーマをシステムプロンプトに展開して画像解析
        │
        ▼
[検証] ── 型チェック / 必須フィールド欠落チェック / confidence低の項目をUIで黄色表示
        │
        ▼
[出力] ── 表形式プレビュー → 修正 → CSV / JSONダウンロード
```

## 2-3. スキーマ定義(JSON)

```json
{
  "schema_version": "1.0",
  "schema_id": "string (例: ocr-nippo-001)",
  "meta": {
    "label": "string (UI表示名 例: 作業日報)",
    "document_type": "string (日報 / 帳票 / 処方箋 / 納品書)",
    "created_from": "string (template_image | manual)",
    "updated_at": "ISO 8601"
  },
  "fields": [
    {
      "key": "string (英数字スネークケース 例: work_date)",
      "label": "string (日本語表示名 例: 作業日)",
      "type": "string | number | date | time | boolean | enum",
      "required": true,
      "format": "string (例: YYYY-MM-DD / 整数 / カンマ区切り不可)",
      "enum_values": ["typeがenumの場合のみ 例: 午前, 午後, 終日"],
      "extraction_hint": "string (例: 帳票右上の日付欄。和暦の場合は西暦に変換)"
    }
  ],
  "table_fields": [
    {
      "key": "string (例: work_items)",
      "label": "string (例: 作業内容明細)",
      "columns": [
        { "key": "string", "label": "string", "type": "string", "extraction_hint": "string" }
      ]
    }
  ],
  "global_rules": [
    "判読できない文字は null とし、無理に推測しない",
    "各フィールドに confidence (high / medium / low) を付与する",
    "手書きの訂正(二重線等)がある場合は訂正後の値を採用する"
  ]
}
```

## 2-4. 抽出結果の出力形式(固定)

```json
{
  "schema_id": "ocr-nippo-001",
  "extracted_at": "ISO 8601",
  "data": {
    "work_date": { "value": "2026-07-15", "confidence": "high" },
    "worker_name": { "value": "山田太郎", "confidence": "high" },
    "remarks": { "value": null, "confidence": "low" }
  },
  "tables": {
    "work_items": [
      { "task": { "value": "部品検査", "confidence": "high" }, "hours": { "value": 3.5, "confidence": "medium" } }
    ]
  },
  "warnings": ["remarks: 判読不能のためnull", "hours(2行目): かすれのため要確認"]
}
```

## 2-5. スキーマ生成用プロンプト(初回テンプレ解析)

```
あなたは帳票のデータ化設計者です。添付された帳票画像を分析し、
この帳票からデータ抽出するためのスキーマJSONを生成してください。

ルール:
- 記入欄をすべて洗い出し fields に定義する(印刷済みの説明文は対象外)
- 繰り返し行がある表は table_fields に定義する
- 各フィールドに extraction_hint(帳票内の位置・記入形式の特徴)を必ず付ける
- key は英数字スネークケース、label は帳票の見出しをそのまま使う
- 出力はJSONのみ

出力スキーマ:
{schema_definition}
```

## 2-6. 抽出用システムプロンプト組み立てテンプレート

```
あなたは帳票データ抽出の専門家です。添付画像は「{meta.label}」です。
以下のフィールド定義に従い、画像から値を抽出してJSONで出力してください。

# フィールド定義
{fields を「key / label / type / format / extraction_hint」の箇条書きに展開}

# 明細表
{table_fields を同様に展開}

# 共通ルール
{global_rules を展開}

# 出力形式
指定のJSON形式のみで出力。前置き・コードブロック記法は不要。
```

## 2-7. プリセット例:作業日報スキーマ

```json
{
  "schema_version": "1.0",
  "schema_id": "ocr-nippo-001",
  "meta": { "label": "作業日報", "document_type": "日報", "created_from": "template_image", "updated_at": "2026-07-15" },
  "fields": [
    { "key": "work_date", "label": "作業日", "type": "date", "required": true, "format": "YYYY-MM-DD", "extraction_hint": "帳票右上。和暦は西暦に変換" },
    { "key": "worker_name", "label": "氏名", "type": "string", "required": true, "format": "姓名スペースなし", "extraction_hint": "帳票左上の氏名欄" },
    { "key": "site_name", "label": "現場名", "type": "string", "required": true, "format": "", "extraction_hint": "氏名欄の下" },
    { "key": "weather", "label": "天候", "type": "enum", "required": false, "format": "", "enum_values": ["晴", "曇", "雨", "雪"], "extraction_hint": "丸が付いた選択肢を採用" },
    { "key": "remarks", "label": "特記事項", "type": "string", "required": false, "format": "", "extraction_hint": "帳票下部の自由記入欄" }
  ],
  "table_fields": [
    {
      "key": "work_items",
      "label": "作業内容明細",
      "columns": [
        { "key": "task", "label": "作業内容", "type": "string", "extraction_hint": "明細表1列目" },
        { "key": "hours", "label": "作業時間", "type": "number", "extraction_hint": "明細表2列目。単位hの数値のみ" },
        { "key": "count", "label": "人数", "type": "number", "extraction_hint": "明細表3列目" }
      ]
    }
  ],
  "global_rules": [
    "判読できない文字は null とし、無理に推測しない",
    "各フィールドに confidence (high / medium / low) を付与する",
    "手書きの訂正(二重線等)がある場合は訂正後の値を採用する"
  ]
}
```

---

# Part 3:コスト設計メモ(OCR)

| 対策 | 内容 | 効果 |
|---|---|---|
| テンプレ解析の1回化 | スキーマ生成後はテンプレ画像を送らない | 毎回の入力トークンを大幅削減 |
| クライアント側圧縮 | 送信前に長辺1568px・JPEG品質80に変換 | 画像トークンを最小化 |
| モデル振り分け | 日報等の単純帳票→Haiku / 図面・処方箋等の高精度要求→Sonnet | 単価を用途で最適化 |
| 回数制限 | デモは1セッションN回まで(UI表示付き) | 上限コストの確定 |
| confidence活用 | 低confidence項目のみ人が修正する運用を見せる | 「精度100%でなくても使える」体験設計 |
