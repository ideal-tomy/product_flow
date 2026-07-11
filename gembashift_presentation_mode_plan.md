# ConformSystem Presentation Mode 実装プラン

## 概要

通常の Live Demo UI は維持したまま、動画映え用の **Presentation Mode**（探索演出・Result Hero・順次 Reveal・自動再生）を追加する。  
機能を増やす段階ではなく、**「発見の瞬間」の見せ方**を足す。

## 中心原則

```text
通常モード = 触る（現状維持）
Presentation Mode = 見せる（動画・録画・埋め込み）
```

感動は派手さではなく、次のリズムで作る。

```text
質問 → 探索過程 → 発見の瞬間 → 詳細
```

Linear / Stripe 系の精密さ。ネオン・粒子・強いグローは禁止。

---

## 入口・役割分離

| モード | URL | 用途 |
|---|---|---|
| 通常 | `/` | 同席・触るデモ（現状） |
| Presentation | `/?presentation=1` | 録画・埋め込み・見せる |
| 自動再生 | `/?presentation=1&autoplay=1` | 30秒シナリオを人手なしで流す |

- Top bar に小さく `Demo` / `Presentation` トグル（通常でも切替可）
- Presentation 既定ではサイドバーを畳む／薄くし、中央コンテンツ幅を **760–900px** に拡大
- LP（`/lp`）は変更しない
- `/?presentation=1`（autoplay なし）は入口で version-diff を SearchSteps → Hero 経由で自動実行

---

## 回答パイプライン（Presentation 時のみ）

通常の「loading → 回答一括表示」を、次の段階に置き換える。

```text
QuestionShown
  → SearchSteps（1.2–2.0s）
  → ResultHero
  → StaggeredDetail
  → SourceFocus（根拠クリック時）
```

1. **Focus**: 周辺 UI を `opacity ~0.35`（blur は 0–1px まで）
2. **Search steps**: 業務ツール調  
   `Searching 18 documents` → `Comparing v3.2 ↔ v3.4` → `Comparing 436 clauses` → `5 sources found`  
   （ChatGPT 風の「考え中」は使わない）
3. **Result Hero**: シナリオ別の大きな数字／対比を先に出す
4. **Reveal**: 既存の表・カード・矛盾比較を順次表示（0.15–0.25s stagger）
5. **Source cue**: 条項ボタン強調 → 右ペインへ短い視線誘導（`sourceCueMs`）→ Drawer オープン＋ハイライト

通常モードの loading「条項を参照しています…」は維持。

---

## シナリオ別 Hero（既存データを利用）

データは `src/data/ConformSystem-demo.ts` の  
`scaleStats` / `changes` / `impactGroups` / `retests` / `contradictions` を流用。

| シナリオ | Hero | その後の詳細 |
|---|---|---|
| `version-diff` | `7 changes detected` → 大きく `±5℃ → ±3℃` | 既存 changes 表 |
| `impact-scope` | カード count-up（制御 / 試験 / FMEA の3グループ） | 既存 impactGroups |
| `retest` | `9 candidates` → 必須5 / 推奨3 / 任意1 | 既存 retests 表 |
| `contradiction` | `3 inconsistencies found` → VS（±3℃ vs ±4℃） | 既存 contradictions |
| 根拠クリック | SOURCE を開きハイライト | 既存 SourceDrawer |

---

## 30秒自動再生（`autoplay=1`）

`src/data/presentation-script.ts` にタイムラインを定義。

| 秒 | 内容 |
|---|---|
| 0–3 | 規模感（18 / 2,842 / 436）を1回だけ count-up |
| 3–10 | 差分質問 → 探索 → `±5℃ → ±3℃` |
| 10–18 | 影響範囲 → カード順次＋count-up |
| 18–22 | 矛盾 → `3 found` → VS |
| 22–26 | 根拠キュー → Drawer オープン＋ハイライト |
| 26–30 | 引いて「探す時間を、判断する時間へ。」 |

録画はブラウザ全画面でこの URL を開くだけで足りる状態にする。

---

## コンポーネント構成

```text
src/
  hooks/usePresentationMode.ts
  data/presentation-script.ts
  components/presentation/
    PresentationOverlay.tsx
    SearchSteps.tsx
    ResultHero.tsx
    CountUp.tsx
    StaggerReveal.tsx
    SourceCue.tsx
    ScaleIntro.tsx
    AutoplayController.tsx
```

既存の主な変更点:

- `src/pages/LiveDemoPage.tsx` — presentation 分岐、回答パイプライン、autoplay、入口ブートストラップ
- `src/components/live/LiveShell.tsx` — トグル、中央幅、サイドバー抑制
- `src/components/live/QueryThread.tsx` — Hero / stagger を presentation 時のみ

---

## 実装フェーズ

### Phase 1: モード基盤
- [x] `usePresentationMode`（`presentation` / `autoplay` クエリ同期）
- [x] Top bar トグル
- [x] サイドバー抑制＋中央 max-width 拡大
- [x] `prefers-reduced-motion` 時はアニメ短縮／スキップ

### Phase 2: 探索＋Hero＋Reveal
- [x] SearchSteps / ResultHero / StaggerReveal / CountUp
- [x] 上記シナリオの Hero マッピング（diff / impact / retest / contradiction）
- [x] 通常モードの見た目・操作は壊さない

### Phase 3: 根拠キュー＋自動再生
- [x] SourceCue（条項強調 → cue → Drawer）
- [x] presentation-script + AutoplayController
- [x] 30秒通しの手動確認（タイムライン調整済み）

### Phase 4: 品質
- [x] `/` と `/?presentation=1` の切替確認（入口で SearchSteps から開始）
- [x] モバイルは Presentation 時 timings 短縮（視線誘導線は PC のみ）
- [x] ビルド確認

---

## 明示的にやらないこと

- 通常 UI のレイアウト刷新や機能シナリオ追加
- LP への Presentation 埋め込み必須化
- 派手な AI 演出、常時3カラム強制、毎回答のフル count-up
- impact への Supplier カード追加（実データは3グループ）
- autoplay への retest 追加（30秒尺を維持）

---

## 受け入れ条件

1. `/` は今と同じく「触る」体験
2. `/?presentation=1` で探索→Hero→詳細のリズムが見える
3. 矛盾シナリオで「発見の瞬間」が表より先に来る
4. `autoplay=1` で約30秒、人手操作なしで差分→影響→矛盾→根拠→タグラインが流れる
5. reduced-motion / モバイルでも内容は欠落しない

---

## 実装優先度（効果順）

1. 探索ステップ
2. Result Hero
3. 順次 Reveal
4. 矛盾の VS 比較
5. フォーカスモード
6. 中央幅拡大
7. 根拠キュー ＋ 自動デモ再生
