# ナレッジパック追加レシピ

業界・顧客ごとにデモを作るときは、**プラットフォーム本体は触らず**、パック（ナレッジ＋回答シナリオ）だけを追加・差し替えます。

## 最短手順

```bash
# 1. starter から新パックを生成
npm run new-pack -- aerospace "航空整備"

# 2. チャンク（AI Mode）を差し替え
#    src/ai/data/aerospace_chunks.json

# 3. Sample 質問・回答・メタを差し替え
#    src/packs/aerospace/pack.ts

# 4. 起動して確認
npm run dev
# /?pack=aerospace
# /ai?pack=aerospace
# /?pack=aerospace&presentation=1&autoplay=1
```

## ファイル役割

| ファイル | モード | 内容 |
|---|---|---|
| `src/ai/data/<id>_chunks.json` | AI | RAG 用チャンク本体 |
| `src/packs/<id>/pack.ts` → `sample.questions` | Sample | 固定 Q&A（デモの「当たり」質問） |
| `pack.ts` → `context` / `ai.stats` | 両方 | 現場説明・会社名など |
| `pack.ts` → `presentation` | Presentation | 30秒脚本・検索ステップ文言 |
| `pack.ts` → `llmSystemPrompt` | AI+LLM | 業界向け回答ルール（任意） |
| `pack.ts` → `synthesizer` | AI | 通常は `"generic"` |

## チャンク JSON 形式

```json
{
  "chunkId": "DOC-A:1",
  "documentId": "DOC-A",
  "documentName": "手順書 XXX v2.0",
  "version": "2.0",
  "category": "sop",
  "clauseId": "§3.1",
  "page": "4",
  "text": "§3.1 …本文…"
}
```

よく使う `category`: `sop`, `change_notice`, `checklist`, `training`, `incident`, `approval`, `qms`

`generic` 合成器は category を見て差分・矛盾・影響などを組み立てます。

## Sample 質問のコツ

- デモで必ず当てたい質問は **3〜8問** に絞る
- `id` は Presentation の `beats[].scenarioId` と揃える
- `chipLabel` はサイドバー／チップ表示用の短い文言
- `answer.sources` に `documentId` / `chunkId` を入れると根拠ドロワーが安定する

## 回答ルールの入れ替え方

1. **軽量**: `llmSystemPrompt` に業界の禁止事項・言い回しを書く（OpenAI キーがあるとき）
2. **構造化**: チャンクの `category` / 条項を揃えて `generic` に任せる
3. **専用**: `synthesizer: "standardization"` のような専用合成は原則追加しない（保守コスト増）

## 空テンプレートから始める場合

ショーケース（東浜・標準化など）を含まない状態にする:

```bash
git checkout -b template
npm run prepare:template
npm run build
```

その後 GitHub で Template repository に設定し、業界デモは **Use this template** → `new-pack` で増やします。

詳細は [TEMPLATE.md](./TEMPLATE.md)。
