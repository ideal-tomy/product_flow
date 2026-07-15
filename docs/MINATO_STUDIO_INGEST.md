# ミナトテック — Studio 投入手順 + product_flow /ai 確認

架空企業「株式会社ミナトテック」のデモ用ナレッジ。実在の企業・団体とは無関係です。

## パック対応

| セット | product_flow パック | ソース文書 |
|---|---|---|
| 総務・共通 | `minato-hr` | `docs/knowledge1/00`〜`03` |
| 厚木工場・製造 | `minato-factory` | `docs/knowledge2/10`〜`13` |

台本（ボットに投入しない）: `04_想定質問リスト_デモ台本.md` / `14_想定質問リスト_製造現場デモ台本.md`

---

## A. product_flow（パック化済み = 投入済み）

```bash
cd product_flow
npm run dev
```

| 目的 | URL |
|---|---|
| 総務 Sample | http://localhost:5173/?pack=minato-hr |
| 総務 AI | http://localhost:5173/ai?pack=minato-hr |
| 製造 Sample | http://localhost:5173/?pack=minato-factory |
| 製造 AI | http://localhost:5173/ai?pack=minato-factory |
| 製造 Presentation | http://localhost:5173/?pack=minato-factory&presentation=1 |

AI Mode で LLM を使う場合は `.env.local` に `OPENAI_API_KEY` を設定する。

### 確認観点

**総務 (`minato-hr`)**

- Sample チップ: 有給 / 交際費 / 在宅+手当 / 出産祝 / TOEIC事前申請 / 範囲外給与
- AI: 「在宅勤務って週何日？手当は？」→ 就業規則+経費を横断
- AI: 誤前提「結婚休暇10日」→ 5日に訂正

**製造 (`minato-factory`)**

- Sample: ピーク温度 → QC/QA → **保持時間のどっち？（本命）** → 校正切れ
- AI: 手順書 40〜60秒 vs 検査標準 30〜60秒 → 規定>標準>手順で標準優先 + QA(620)報告

---

## B. AI-Demo-Studio への投入手順

Studio 本体コードは変更不要。ナレッジ欄へテキスト投入する。

### 前提

1. `AI-Demo-Studio` で `npm run dev`（BYOK または Managed Trial）
2. Setup / 設定の **ナレッジ** 欄を開く
3. 文字数: 各セット合計はおおよそ 4〜5KB → `hardLimit` 30000 内

### B1. 総務デモ

1. 次を順に、または連結してナレッジに貼る / MD を DocumentUpload → 適用  
   - `docs/knowledge1/00_会社設定_ミナトテック.md`  
   - `docs/knowledge1/01_就業規則_抜粋.md`  
   - `docs/knowledge1/02_経費精算規程.md`  
   - `docs/knowledge1/03_福利厚生ガイド.md`
2. カスタム指示（推奨）:

```text
あなたは株式会社ミナトテックの社内アシスタントです。参照ナレッジのみで日本語回答してください。
複数文書にまたがる質問（例: 在宅日数と手当）は横断して統合してください。
資格報奨は事前申請必須など条件を必ず確認してください。
個人の評価・給与明細など個人情報には答えず拒否してください。
ユーザーの誤った前提は条文で訂正してください。根拠がなければ推測せず拒否し、総務部・経理部への確認を案内してください。
```

3. 台本 `docs/knowledge1/04_想定質問リスト_デモ台本.md` の Q1→Q5→Q2→Q7→Q8〜Q10 で見せ場を確認
4. 締めの営業フレーズ（人が言う）: 「御社の規程を入れれば明日から御社版になります」

### B2. 製造デモ

1. 次をナレッジに投入  
   - `docs/knowledge2/10_工場設定_厚木工場.md`  
   - `docs/knowledge2/11_品質管理規定_抜粋.md`  
   - `docs/knowledge2/12_検査標準_抜粋.md`  
   - **`docs/knowledge2/13_作業手順書_リフロー実装.ingest.md`**（⚠行なし）
2. **禁止:** 原本 `13_作業手順書_リフロー実装.md` をそのまま投入しない（冒頭の種明かし行が残る）
3. カスタム指示（推奨）:

```text
あなたは株式会社ミナトテック厚木工場の品質文書アシスタントです。参照ナレッジのみで日本語回答してください。
文書の優先順位は 規定 > 標準 > 作業手順書 です。矛盾時は上位に従い、品質保証部(内線620)への報告を案内してください。
QC(品質管理課・内線610・日常判定)とQA(品質保証部・内線620・承認・文書・顧客)を区別してください。
4M変更や現場の勝手な条件変更は許可せず、MT-QAポータル申請を案内してください。
根拠がなければ推測せず拒否してください。
```

4. 台本 `docs/knowledge2/14_想定質問リスト_製造現場デモ台本.md`  
   推奨順: Q1 → Q2 → Q3 → **Q5（本命）** → Q7

---

## C. 関連ファイル

| ファイル | 役割 |
|---|---|
| `src/packs/minato-hr/pack.ts` | 総務 Sample / AI / Presentation |
| `src/packs/minato-factory/pack.ts` | 製造 Sample / AI / Presentation |
| `src/ai/data/minato-hr_chunks.json` | 総務 RAG チャンク |
| `src/ai/data/minato-factory_chunks.json` | 製造 RAG チャンク |
| `docs/knowledge2/13_....ingest.md` | Studio 投入用 SOP（種明かしなし） |
| `docs/PACK_RECIPE.md` | 一般的なパック追加手順 |
