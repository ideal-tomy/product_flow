# Phase 3 フル完了 — 運用・受け入れ

product_flow に Access Mode（サンプル / BYOK / Trial）を組み込み済み。  
最小スコープ（M1–M6）の Adapter 境界は維持。

## 体験モード（/ai）

上部の **ExperienceModeBar**（サンプル / APIキー / 体験コード）で選択。詳細は「詳細設定」。

| モード | 動作 |
|---|---|
| サンプルデータで試す | `sampleEngine`（APIキー不要） |
| APIキーで試す | ブラウザ BYOK → `sendAiRequest` → iso-output |
| 体験コードで試す | `/api/trial/ask` → Gateway（OpenAI のみ） |
| サーバー接続（運用） | 現行 `/api/ask` + `OPENAI_API_KEY`（詳細設定） |

## Managed Trial の取得手順（共通導線）

**全デモの飛ばし先は Studio `/admin/trial`（量産契約）。**

| 役割 | URL |
|---|---|
| 体験コード取得（共通） | Studio `/admin/trial`（`VITE_TRIAL_PORTAL_URL`） |

1. AI-Demo-Studio に同一の Upstash + `OPENAI_API_KEY` を設定
2. product_flow `.env.local` に `VITE_TRIAL_PORTAL_URL=http://localhost:3000/admin/trial`（現行本番は `https://ai-demo-studio-lime.vercel.app/admin/trial`）
3. `/ai` →「体験コードを取得」→ Studio `/admin/trial?demo=iso-chat&return=...`
4. 発行されたコードを「体験コードで試す」に入力
5. 質問（残回数表示あり）

一覧・失効・特権発行も同じ `/admin/trial` + `TRIAL_ADMIN_SECRET`。

## 環境変数（product_flow）

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-nano
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
TRIAL_DEFAULT_MODEL=gpt-5-nano
VITE_TRIAL_PORTAL_URL=http://localhost:3000/admin/trial
```

## 自社資料投入

接続パネル内「自社の資料を追加」で PDF/TXT/MD 等を読み込み。  
セッション知識として `USER-DOC` チャンクを retrieve 結果先頭にマージ（パック JSON は不変）。

## 受け入れチェック

- [x] `npm run build` 成功
- [ ] `/` Sample / Presentation 回帰
- [ ] `/ai` server-proxy（従来 API キー）
- [ ] `/ai` sample モード
- [ ] `/ai` BYOK（OpenAI）で構造化回答
- [ ] `/ai` Trial（コード発行後）残回数＋回答
- [ ] 文書アップロード → 質問反映
- [ ] Live UI / AnswerCard / SourceDrawer 維持

## 主なパス

| 領域 | パス |
|---|---|
| Access | `src/access/`, `src/components/access/AccessModePanel.tsx` |
| Client LLM | `src/ai/askClientLlm.ts` |
| Engine | `src/engines/aiEngine.ts`（accessAware） |
| Vendor Core | `src/vendor/ai-demo/demo-core/` |
| Trial | `src/vendor/ai-demo/trial/`, `api/trial/*` |
| Config | `src/config/demo.config.ts`, `brand.config.ts` |

## LOCAL DELTA（Studio 逆マージ候補）

- `AiRequest.responseFormat` / `temperature`
- Trial `runServerProviderRequest` の json_object 既定（ISO 構造化回答用）
