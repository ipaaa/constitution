---
id: 047
title: 內容凍結：區分哪些內容審定後不得再自動變動
status: design
source: captain 2026-09-04（把關機制體檢第二類核心缺口）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

現況是所有內容一律等價：每次同步都可能被改寫。但實際上有兩類性質不同的內容，系統沒有任何欄位、規則或機制去表達這個差別。

## Problem

兩類內容混在一起，型別上一視同仁：

- **可持續更新**：摘要、短評、標籤、編輯判斷。
- **審定後不該再自動變動**：法律條文引述、判決要旨、案號、立案日期、已對外發布過的敘述。

`src/data/future.ts` 自己的註解就承認了這個分野：案號、立案日期、案由是 `taken directly from the court website`（`:16-17`），而 identity tags 是 `an editorial layer（…）this project's civic journalism judgment`（`:20-22`）。**兩者在型別上都只是 `PendingCase` 的欄位。**

## 與 feature 040 的差別（方向相反，需分開設計）

| | 040 | 本票 |
|---|---|---|
| 管什麼 | **核可失效** | **內容凍結** |
| 假設 | 內容可以被改，改了就不要偷偷上線 | 有些內容一旦審定，不該被任何路徑改寫 |
| 觸發 | 發布欄位改變 → `Needs review` | 任何覆寫嘗試 → 拒絕 |
| 範圍 | 三個試算表分頁 | 含 `src/data/future.ts` 等非 SSOT 資料 |

040 明確不涵蓋本票：其 Responsibilities 第一句寫「本功能不新增網站 React 元件」，作用面全在 Google Sheet 與 `sync-content.mjs`。

## 三個具體空洞

1. **`future.ts` 完全在 040 射程外。** 040 的指紋只涵蓋三個試算表分頁。T3 走「captain 直接改 TS 檔 → PR → merge」，唯一把關是 PR review 與 `npx tsc --noEmit`，沒有任何欄位能表達「這一筆已定稿」。
2. **兩類內容混在同一個檔、同一個型別。** 見上。
3. **`docs/health-check/TODO.md:486` 已把「標注來源並凍結」列為 P1-8 的三種處置之一**（另兩種是「搬進 SSOT」「移除」），但盤點本身尚未完成，也沒有任何機制實現「凍結」這個處置。

## Risk evidence

`no spike needed` 不成立。design stage 須先回答：凍結要在哪一層實作（型別、資料欄位、建置期檢查、或 CI），以及既有 40 筆 Track 1 與 T3 資料如何分類。**方向未定前不得動程式。**

## Acceptance criteria

待 design stage 補齊。現階段記錄驗收必須涵蓋的性質：

- 對一筆已標記凍結的內容做出覆寫嘗試時，必須有東西失敗——不能只靠人看 PR diff。此項需以實際覆寫嘗試證明，不可只驗規則文字存在。
- 分類必須涵蓋 `src/data/` 全部檔案，不只 SSOT 來源的兩個 json。

## Out of scope

不處理內容本身的正確性。不處理 feature 040 的核可失效機制。不處理 AI 生成內容的來源標記（另票）。
