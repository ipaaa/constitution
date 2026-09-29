---
id: 071
title: 頁尾連結指向錯誤的 GitHub 與 HackMD
status: design
source: captain 2026-09-29（聊天中直接要求開票）
started: 2026-09-29T20:11:16Z
completed:
verdict:
score: 0.8
worktree:
issue:
pr:
mod-block:
---

全站頁尾的外部連結有多處錯誤。captain 2026-09-29 裁示：原始碼一律指向 `https://github.com/ipaaa/constitution`；不列 HackMD；「內容錯誤回報」也指向正確的 GitHub。

## Problem

`src/components/Footer.tsx`（2026-09-29 `main` 實查）：

| 行 | 現況 | captain 裁示 |
|---|---|---|
| :27–28 | 「HackMD 協作共筆」→ `https://g0v.hackmd.io/njOKlAIVQcmCgomNMr9cUg?view` | 移除，不列 HackMD |
| :32 | 「GitHub 原始碼」→ `https://github.com/g0v/Welcome-to-Add-C0urt` | 改為 `https://github.com/ipaaa/constitution` |
| :37 | 「內容錯誤回報」→ `https://github.com/g0v/Welcome-to-Add-C0urt/issues/new` | 改指向 `ipaaa/constitution` 的回報入口 |

captain 表示「很多是錯的」，上表只是 `grep` 命中的三處。design 須逐一檢查頁尾（及其他頁面重複出現的同類外部連結）的**每一個**連結，列出現況、目的地是否存在、應改成什麼。

design 要決定：內容錯誤回報的確切目的地（`issues/new`、issue template 或其他），以及 repo 是否已開啟 Issues；站上其他位置是否也寫死舊 repo 或 HackMD；移除 HackMD 後頁尾的版面。

## Proposed approach

{design 填寫}

## Risk evidence

{design 填寫。連結目的地以實際 HTTP 請求驗證，不以字串判斷。}

## Expected surface and tolerance

{design 填寫}

## Acceptance criteria

{design 填寫。至少一條量測端值：hydration 後的頁尾中，每一個外部連結都指向存在的目的地，且全站沒有 `g0v/Welcome-to-Add-C0urt` 或 `hackmd` 連結。}

## Test plan

{design 填寫。`npx tsc --noEmit`、`npm run dev`；不得執行 `npm run sync-content`。}

## Documentation impact

### 現在更新

{design 填寫}

### 實作後更新

{design 填寫}

### 不更新

{design 填寫}

### Feedback Cycles

## Out of scope

- `/about` 的貢獻者名單（`ContributorGrid.tsx` 以各人 GitHub 帳號組連結，屬 `052`）。
