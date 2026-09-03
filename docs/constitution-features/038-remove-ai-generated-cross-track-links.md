---
id: 038
title: 移除 AI 生成的跨軌道連結（之後是否重做需討論）
status: design
source: captain 2026-09-02 決定
started:
completed:
verdict:
score: 0.6
worktree:
issue:
pr:
mod-block:
---

**⚠️ 需要討論** —— 移除的部分已定案，但「之後要不要重做、由誰做」尚未決定。

移除 `src/data/cross-track-links.ts` 內現有的跨軌道對應資料。captain 於 2026-09-02 裁示：不要現有的 AI 生成連結，之後可考慮重做。

## Problem

跨軌道連結於 2026-04-27 由 `006` 加入（PR #11）。檔案自述為「curated editorial links — not auto-generated」（人工策展，非自動生成），但**專案內沒有任何文件記錄這些對應是誰決定的、依據什麼**，而三項證據指向它並非人工策展：

**一、`T3 → T1` 的 15 筆對應指向虛構案件。**
`CASE_TO_HISTORY` 的鍵是 `c02`–`c31`。`/future` 最早以編造的假案件建置，編號即為此格式；commit `46a23e6`（`feat(T3): replace synthetic cases with real Constitutional Court data`）將其換成真實待審案件後，id 變為 `114憲立3` 這類格式，但對應表未同步更新。實測：對全部 39 件待審案件呼叫 `getLinksForCase`，每一件都回傳 0 筆，`/future` 的「歷史脈絡」區塊渲染 0 次。註解中的「代理孕母」「跨性別身分證」等主題即為當初虛構案件的題目。

**二、`T1 → T2` 的 `h2` 對應建立在錯誤資料之上。**
註解寫「廢除刑法100條・言論自由 -> 言論自由相關討論」，但 `h2` 是釋字第 272 號軍事審判案。`SSOT_收集區` 早已改正該筆，但四個月間修正未回流至網站，做對應者看到的是錯的版本。具法學背景者不會將釋字 272 認作言論自由案。

**三、`006` 的 review 判定 MET 的依據是結構存在，不是連結有效。**
原文：「`CASE_TO_HISTORY` maps 15 case IDs to relevant history entries」。它驗證對應表已填入 15 筆，未驗證這些鍵能解析到任何案件。

三者與 `015`（設計文件的 Sample data 被當成真實內容上線四個月）屬同一失效模式：**東西存在即判定通過，無人檢查它是否運作。**

## Proposed approach

移除四張對應表與其消費端，不保留註解掉的殘骸 —— 那會讓下一個人以為只要改鍵值就能復活，而實際上內容本身需要重做。

移除範圍：

- `src/data/cross-track-links.ts`：`HISTORY_TO_DISCUSSIONS`（4 筆）、`DISCUSSION_TO_HISTORY`（8 筆）、`DISCUSSION_TO_CASE_TAGS`（3 筆）、`CASE_TO_HISTORY`（15 筆）
- `src/components/CrossTrackLinks.tsx` 及其在 `past/page.tsx`、`present/[id]/page.tsx`、`future/CaseCard.tsx` 的引用

**拒絕的替代方案**：只修 `CASE_TO_HISTORY` 的鍵值。理由 —— 那只處理證據一，證據二（依據錯誤資料）與證據三（未驗證有效性）不會因此消失，且無人能確認剩下的對應是否正確。

## Risk evidence

no spike needed：三處消費端皆為條件渲染（`getLinksForHistory` / `getLinksForDiscussion` / `getLinksForCase` 回傳空陣列時區塊不顯示），移除資料後行為與現況一致 —— `/future` 本來就渲染 0 次。

已知現況：`T1 → T2` 目前只有 3 筆生效（`h1`、`h10`、`h14`；`h2` 因 status 空白不上線）。`T2 → T1` 有 8 筆、`T2 → T3` 有 3 筆，其有效性未經查證。

## Expected surface and tolerance

Estimate: −350 淨行，跨 5 個檔案，tolerance ±30%。
Semantics this may change: `/past`、`/present/[id]`、`/future` 三處的跨軌道連結區塊不再出現。無資料格式或路由變更。

## Acceptance criteria

**AC-1 — 三個頁面不再出現跨軌道連結區塊，且皆無例外。**
Verified by: 以 `react-dom/server` 配真實資料渲染 `/past`、`/present/[id]`、`/future`，查詢結果 DOM 中「Related — 跨軌道連結」與「歷史脈絡」標題數皆為 0，且渲染過程無例外拋出。
會使其失敗的改動：保留任一消費端而未移除其資料來源。

**AC-2 — 移除後網站的其餘內容未受影響。**
Verified by: 移除前後對三頁渲染出的 DOM 取元素計數（`.textbook-item`、`.reality-item`、討論卡片數、`#tldr`），除跨軌道區塊外數量完全相同。
會使其失敗的改動：誤刪共用元件或條件式。

**AC-3 — 不留下註解掉的殘骸。**
Verified by: `grep -rn "CASE_TO_HISTORY\|HISTORY_TO_DISCUSSIONS\|DISCUSSION_TO_CASE_TAGS\|DISCUSSION_TO_HISTORY" src/` 無結果。
會使其失敗的改動：以註解方式保留對應表。

## Test plan

`npx tsc --noEmit`、`npm run dev` 目視、`npm run build`。渲染比對沿用 037 的做法（`react-dom/server` + jsdom），該環境無法產生截圖。

### Feedback Cycles

## Out of scope

- **之後是否重做跨軌道連結** —— 需 captain 與內容端討論。若要重做，需先決定：由誰策展、依據什麼、如何驗證連結有效而非僅存在
- `docs/health-check/TODO.md` 的 P1-7 描述較窄（僅記「鍵值對不上」），待本票定案後一併更新
