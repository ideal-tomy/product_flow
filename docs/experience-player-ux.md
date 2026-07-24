# 公開用体験プレイヤー UX（正本）

最終更新: 2026-07-24  
対象: `product_flow` 製造デモ（`/manufacturing` · `/play/:packId`）  
※ **製造専用。** 他業種はこの画面骨格を流用しない。横断原則は [`sites/ideal_official/docs/industry-demos/ux-saas-principles.md`](../../sites/ideal_official/docs/industry-demos/ux-saas-principles.md)

関連: [`field-language-interpretation-rules.md`](./field-language-interpretation-rules.md)

---

## 1. 目的

5秒で番号が主操作と分かり、ロック入力と状態チップで「次に何をするか」が説明文なしで伝わること。

---

## 2. ルート

| ルート | 役割 |
|--------|------|
| `/manufacturing` | ハブ（関係ストリップ＋タイトル＋1問いのカード） |
| `/play/:packId` | 体験プレイヤー |
| `/?pack=…&packs=1` | 旧シェル（開発） |

---

## 3. 画面（説明はUIで）

```text
[sticky header] ブランド · StatusChip · ハブ
[canvas]
  テーマ1行
  StepRail（番号＋短ラベル＋プログレス）
  AnswerCard（要約＋出典カード）
  よくある聞き方（横スクロールチップ）
  接続・資料・次へ（Connect / Upload チェック）
[sticky footer] ロックまたは開放の入力＋聞く
```

### 文言ルール

- 1セクション＝見出し1＋補助0〜1行
- 自由記述は Live＋自社資料後のみ。未達時は入力をロックし、タップでセットアップ
- 状態はヘッダー `Sample` / `Live` / `Live · 自社資料`
- Live 解答: 自社なし＝デモ規程（pack）、自社あり＝アップロードのみ（user-doc）。混ぜない

### モバイル

- ステップは縦リスト（`min-h-11`）
- 聞くバーは下部 sticky＋safe-area
- チップは横スクロール1行
- AccessMode は下からシート（`max-h-[90dvh]`）
- ハブ関係ストリップは縦3行＋矢印

---

## 4. 受け入れ

**Desktop**

- [x] 番号が主操作（説明文なし）
- [x] 自由記述は Live＋自社資料後のみ。ロック入力が説明になる
- [x] ハブ＝タイトル＋1問い。関係ストリップあり
- [x] 回答＋出典カードが製品の顔

**Mobile ≤640px**

- [x] ステップ縦リスト
- [x] sticky 聞くバー
- [x] チップ横スクロール
- [x] StatusChip が読める
- [x] ハブ関係ストリップが縦でも破綻しない
