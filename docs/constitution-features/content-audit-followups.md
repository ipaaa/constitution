---
id: 069
title: 067 後續：查核工具自指舊路徑、綁進上線條件、紀年與閱讀順序入檔
status: design
source: 067 review R2 ＋ captain 2026-09-29 三項決定（聊天中裁示）
started: 2026-09-29T18:59:22Z
completed:
verdict:
score: 0.8
worktree:
issue:
pr:
mod-block:
---

`067`（PR #42）已合併並封存。它的 review 與 captain 在 gate 上的決定留下四件要落地的事，本票一次處理。

## Problem

1. **R2（review 的 Deferred risk，觸發條件已發生）**：`067` 封存後，查核工具的封存路徑規則 M6 會回報工具自己的檔。review 在副本上模擬封存，M6 由 1 變 6。指向 `067` 舊路徑的 7 處：`scripts/content-audit.mjs:5`、`:454`（寫在閱讀清單產生器內，之後每份快照都會帶舊路徑）、`scripts/fetch-judgment-dockets.mjs:4`、`docs/health-check/TODO.md:694`、`docs/content-audit/2026-09-29-reading-list.md:4`、`scripts/content-audit/units.mjs:4`、`tests/content-audit.test.mjs:8`。修完後 `check` 的 M6 應回到只剩 `/about:38` 那一處。
2. **綁進上線條件（captain 2026-09-29：「要綁」）**：在 `docs/health-check/TODO.md` 的 P3-8 另加一條解除條件：`node scripts/content-audit.mjs check` 全數通過（離開碼 0）才可移除 noindex。手動執行，不接 CI／build。**不可改動 `056` 引用的那一條**，`056` 的 G-7 必須仍印 `G-7 PASS`。
3. **全站紀年慣例（captain 2026-09-29：「紀年用西元」）**：寫進規格正本（`067` design 第十節的預設：敘述用西元；判決字號保留官方民國寫法；引用官方文字保留民國並括號附西元）。判決字號是否也改西元，captain 尚未明示；design 以預設「保留官方寫法」提出並標為待 captain 確認。L4 清單列出的不符處是後續內容修正的待辦，不在本票修。
4. **H 層閱讀順序（captain 2026-09-29）**：法學背景審閱者先讀三個 `PUBLIC_PAGES` 的來源檔。寫進閱讀清單的說明或產生器。

## Proposed approach

{design 填寫}

## Risk evidence

{design 填寫}

## Expected surface and tolerance

{design 填寫}

## Acceptance criteria

{design 填寫。至少一條量測端值：封存後 `check` 的 M6 只剩 `/about:38`；P3-8 有兩條解除條件且 G-7 仍 PASS。}

## Test plan

{design 填寫。`npx tsc --noEmit`；不得執行 `npm run sync-content`。}

## Documentation impact

### 現在更新

{design 填寫}

### 實作後更新

{design 填寫}

### 不更新

{design 填寫}

### Feedback Cycles

## Out of scope

- P1-10 列出的內容錯誤本身（大事記順序、紀年混用、`/about:38` 文案）。
- 把 `check` 接進 CI 或 build（需另開票並經 captain 明確同意）。
- `067` review 的 R1、R3–R7。
