---
id: 068
title: 門檻分析頁把已失效的 10 人／9 人門檻標為現行
status: design
source: constitution-features/067 design 新發現第 3 項（captain 2026-09-29 核准開票）
started: 2026-09-29T17:14:59Z
completed:
verdict:
score: 0.85
worktree:
issue:
pr:
mod-block:
---

`/past/thresholds`（公開頁）把已失效的評議門檻當成現行法呈現。讀者會帶著錯誤的法律認知離開。

## Problem

067 design 實查（2026-09-29，`a5786cc`）：`src/data/threshold-analysis.ts:323-336` 把已失效的 10 人出席／9 人同意門檻標為 `id: 'current'`、`effectiveTo: null`，`/past/thresholds` 頁面上沒有任何失效敘述。

這與 `066`（quiz 與 controversy-timeline 把已失效的 10 人門檻當現行法）是同一型錯誤，但 `066` 的 `check-voided-floor.mjs` 沒有跑這條路由。修正會牽動 `012`（解釋門檻與案件數量關聯視覺化）的既有測試，所以不能在 `067` 裡順手處理。

design 要決定：失效的起訖日與依據（以一手來源查證，不從站內其他頁轉引）、頁面上怎麼呈現「曾經適用、現已失效」、`012` 的測試怎麼改而不失去它原本守的東西、`066` 的檢查是否要涵蓋此路由。

## Proposed approach

{design 填寫}

## Risk evidence

{design 填寫}

## Expected surface and tolerance

{design 填寫}

## Acceptance criteria

{design 填寫。至少一條量測端值：讀者在 `/past/thresholds` 看得到該門檻已失效。}

## Test plan

{design 填寫。`npx tsc --noEmit` 與 `npm run dev`；不得執行 `npm run sync-content`。}

## Documentation impact

### 現在更新

{design 填寫}

### 實作後更新

{design 填寫}

### 不更新

{design 填寫}

### Feedback Cycles

## Out of scope

- `067` 發現的其他三項（大事記 evt-09／evt-10 順序、quiz 與 future 對人事同意權的矛盾敘述、封存路徑）。
- 全站系統性查核——那是 `067`。
