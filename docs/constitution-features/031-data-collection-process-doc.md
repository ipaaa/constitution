---
id: "031"
title: T3 資料收集流程說明文件
status: design
source: captain-filed
started: 2026-05-02T17:52:29Z
completed:
verdict:
score: 0.7
worktree:
issue:
pr:
---

**範圍已縮減（2026-09-02）：只剩 T3。**

原範圍涵蓋 T1／T2／T3 三軌。T1／T2 的流程已由
[`../content-pipeline/design.md`](../content-pipeline/design.md) 完整定案，
本票不再重複記載。

原票上的 PENDING 註記如下，**已解決**：

> ⏸️ PENDING — 由 Captain 補完
> T1/T2 的 SOP 需要修改：加入 Google Spreadsheet 作為 SSOT 的編輯流程
> 目前的 SOP 只描述 JSON 檔案的直接編輯，但實際流程應以 spreadsheet 為起點

該問題於 2026-09-01 的產線體檢中確認為真，並已處理：
`docs/content-pipeline/data-collection-guide.md` 的 T1／T2 章節已刪除，改為指向
`design.md`。原內容教人直接編輯 `src/data/*.json`，違反不變式 #2。

## Problem

`docs/content-pipeline/data-collection-guide.md` 目前只有 T3 章節是有效的。
該章節需要確認內容是否仍然正確 —— 它寫於 2026-05-02，之後未查核過。

T3 與 T1／T2 不同：它的資料在程式碼裡（`src/data/future.ts`），不經過試算表，
因此不受產線改造影響。但它有自己的維護問題，見下方。

## Proposed approach

查核並更新 `data-collection-guide.md` 的 T3 章節。不新建文件。

## Risk evidence

no spike needed：T3 的資料流是純檔案編輯，機制已知且簡單。

## Expected surface and tolerance

Estimate: 僅文件變動，約 +30／−30 行，tolerance ±50%。
Semantics this may change: none。

## Acceptance criteria

**AC-1 — `data-collection-guide.md` 的 T3 章節所述欄位與 `src/data/future.ts` 實際結構一致。**
Verified by: 逐欄比對 `future.ts` 的型別定義與文件的欄位表，列出差異。差異為零。
會使其失敗的改動：`future.ts` 新增或改名任一欄位而文件未同步。

**AC-2 — T3 章節內不含任何已禁止的指令。**
Verified by: `grep -n "npm run build\|npm run sync-content" docs/content-pipeline/data-collection-guide.md`
在 T3 章節範圍內無結果（警告文字除外）。

## Test plan

文件變動，無程式碼測試。以 AC-1 的逐欄比對為主要驗證。

### Feedback Cycles

## Out of scope

- T1／T2 的流程（已由 `design.md` 涵蓋）
- 產線改造本身（見 `design.md` 第五節）
