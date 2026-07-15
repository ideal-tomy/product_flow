# Phase 3 最小スコープ（M1–M6）完了メモ

## 何をしたか

- AI-Demo-Studio の Core 最小セットを `src/vendor/ai-demo/` にコピー
- ISO Input/Output Adapter を追加（`src/ai/adapters/`）
- `src/ai/openai.ts` の OpenAI 直 `fetch` を `openaiAdapter` 経由に置換
- サーバー経路（`api/ask.ts` / `vite.gemba-api.ts`）のシグネチャは維持

## 回帰チェックリスト

- [x] `npm run build` 成功
- [ ] `/` Sample / Presentation — LLM未使用で従来どおり
- [ ] `/lp` — 変更なし
- [ ] `/ai` + `OPENAI_API_KEY` あり — 構造化回答 + SourceDrawer
- [ ] `/ai` + キーなし / LLM失敗 — `synthesizeAnswer` フォールバック

手動確認: `npm run dev` 後に上記ルートを触る。

## LOCAL DELTA（Studio 逆マージ候補）

`AiRequest.responseFormat` / `temperature` と openai-adapter への反映は product_flow vendor のみの拡張。

---

## フル（F1–F16）への引継ぎ指示

```text
【引継ぎ】product_flow Phase 3 最小（M1–M6）完了済み前提で、フル（サンプル/BYOK/Trial）へ進む。

守ること:
- 変更対象は product_flow のみ（dd_demo / hookapp_demo 禁止）
- 既存 Live / Presentation / LP / AnswerCard / SourceDrawer / packs / RAG は壊さない
- AI接続は src/vendor/ai-demo と src/ai/adapters 経由。UIから Provider fetch 禁止

最小で既にあるもの（再利用せよ）:
- src/vendor/ai-demo/（openaiAdapter + types）。responseFormat/temperature は vendor ローカル拡張あり
- src/ai/adapters/iso-input.ts / iso-output.ts
- askWithOpenAI は既に Adapter 経由。フルでもこの境界を維持し、Access Mode だけ増やす

フルで追加する順（前回切り出しどおり）:
1. F1–F3 Access Mode 状態（sample / byok-direct / managed-trial）と導線UI（既存画面を置き換えずモーダル/サイド）
2. F4–F7 BYOK: anthropic/gemini adapter コピー、ブラウザから sendAiRequest、storage・薄い設定UI
3. F8–F12 Trial: lib/trial + Vercel/Vite向け API 再配置、Redis env、残回数UI、admin
4. F13–F16 ISO demo.config /（任意）brand / Document Ingest / Phase3受け入れ

注意:
- 最小はサーバーキーのみ。BYOK追加時は「サーバー経路」と「ブラウザ BYOK」を Access Mode で分岐し、iso-input/output は共有
- Trial は OpenAI のみ（Studio方針）。Gateway にナレッジ本文を永続化しない
- vendor の responseFormat 拡張は Studio 本家への逆マージ候補として残している
- 移植ガイド: AI-Demo-Studio/docs/porting-guide.md
- マスタープラン Phase3: AI-Demo-Studio/ai_demo_core_master_plan.md
```
