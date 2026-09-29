---
id: 042
title: 「待captain確認脈絡」試算表內容以 HTML 直接渲染，未經淨化
status: design
source: captain 2026-09-03（先開票存證，脈絡待確認後再決定是否進行）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

> ## ⛔ 先不要 dispatch
>
> **captain 於 2026-09-03 表示尚未完全掌握脈絡。本票先開起來存證，不代表已決定要做。**
> 進入 `design` 之前，必須由 captain 重新確認範圍與是否進行。
> 任何 FO 或 worker 看到本票，請先問過 captain。

試算表的內容欄位進入網站時不做 HTML 淨化。能編輯試算表的人，就能讓瀏覽器執行任意 HTML。

## Problem

同步程式把試算表的值原樣寫入 `src/data/*.json`，網站再以 `dangerouslySetInnerHTML` 渲染。中間沒有任何淨化。

**兩條路徑**（本次稽核查出第二條，`docs/health-check/TODO.md` 的 P2-10 只記了第一條）：

| # | 渲染位置 | 資料來源 |
|---|---|---|
| 1 | `src/app/past/page.tsx:197` | `Track 1_history` 的 `content` |
| 2 | `src/app/present/page.tsx:110` | `site_tldr` 的 `label` 與 `text`，經 `scripts/sync-content.mjs:646` 組成 `abstract` 後由 `:78` 切行 |

**為什麼現在要處理**：`docs/health-check/TODO.md:816` 把本項列為「必須在 P3-1 分享試算表之前處理」。captain 已於 2026-09-03 將試算表編輯權限開放給協作者。**該前置條件已被跳過。**

**最可能的觸發方式不是刻意攻擊**：從 Word 或網頁複製整段文字貼進儲存格時，來源的行內標記可能一併帶入。編輯看到的是乾淨文字，儲存格裡卻含標記。

**目前尚無實際污染**：`TODO.md:624` 記載 2026-09-02 掃描 41 筆 `content`，無任何 HTML 標記。本票處理的是機制缺口，不是既有污染。

## Proposed approach

**待確認。** 以下為初步方向，captain 確認脈絡後才定案。

兩個候選：

1. **同步時淨化** —— 在 `scripts/sync-content.mjs` 寫出 JSON 前移除或轉義標記。優點是產物即安全，網站不必改。缺點是若既有內容刻意使用標記排版，會一併失效。
2. **渲染改純文字** —— 移除兩處 `dangerouslySetInnerHTML`。優點是根絕，缺點是若 `content` 現在或未來需要換行、強調等呈現，需另設安全的標記方式。

**選擇前必須先回答的問題**：`Track 1` 的 `content` 是否預期含排版標記？`docs/_archive/spreadsheet_template.md` 的範例資料含 `<span class="textbook-highlight">`，顯示原始設計曾預期使用標記。若是，方案 2 會改變呈現，需要 captain 決定。

## Risk evidence

未執行 spike。**本票暫緩，脈絡確認前不投入驗證工作。**

已確認的事實：兩處 `dangerouslySetInnerHTML` 的位置與資料來源（見 Problem）。`scripts/sync-content.mjs` 全檔無任何淨化或轉義邏輯。

## Expected surface and tolerance

Estimate: 待確認方向後估算。
Semantics this may change: `Track 1` 的 `content` 與 `site_tldr` 文字在網站上的呈現方式。

## Acceptance criteria

**待 captain 確認脈絡與方向後補齊。** 現階段只記錄驗收必須涵蓋的性質：

- 含標記的試算表內容進入產線後，瀏覽器不得執行該標記。驗證需涵蓋**兩條路徑**，只測 `past` 不算通過。
- 既有 40 筆內容的呈現不得因本次改動而改變。

## Test plan

待確認。

## Documentation impact

### 現在更新

| 文件 | 為什麼現在要改 | 更新內容 |
|---|---|---|
| `docs/health-check/TODO.md` | P2-10 只記載一條路徑，且未反映權限已開放 | 補記第二條路徑；記錄前置條件已被跳過。**本項待 captain 確認後才執行** |

### 實作後更新

| 文件 | 完成條件 | 更新內容 |
|---|---|---|
| `docs/content-pipeline/design.md` | 淨化行為通過驗證 | 於第四節記錄淨化規則 |

### 不更新

| 文件 | 理由 |
|---|---|
| `docs/health-check/2026-08-31-content-pipeline.md` | 狀態為 record |
| `docs/health-check/2026-09-03-editor-onboarding.md` | 狀態為 record |

### Feedback Cycles

## Out of scope

不處理既有內容的正確性。不處理 feature 040。不處理刪列缺口，該項另行開票。
