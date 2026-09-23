---
id: 066
title: quiz 與 controversy-timeline 把已失效的 10 人門檻當現行法
status: design
source: constitution-features/063 V7（captain 2026-09-23 核准開票）
started:
completed:
verdict:
score: 0.8
worktree:
issue:
pr:
mod-block:
---

`/quiz/*` 與 `/controversy-timeline` 以現在式把已被宣告違憲失效的 10 人參與評議下限當成現行法，是 feature `063` 修完 `/future` 之後同一個法律錯誤的最大殘餘面。

## Problem

憲法訴訟法第 30 條第 2 項的 10 人參與評議下限，已由 **114 年憲判字第 1 號**宣告違憲，自 2025-12-19 起失其效力。feature `063` 已把 `/future` 的敘述改正，但同一錯誤仍留在別的路由：

| 位置 | 寫的 | 問題 |
|---|---|---|
| `src/data/quizzes/pending.ts:95` | 「這遠低於修法後的 10 人門檻，也是法庭運作困難的關鍵原因」 | 現在式，教讀者失效條文仍是現行法 |
| `src/data/quizzes/controversy.ts:83` | 「根本達不到 10 人門檻」 | 同上 |
| `src/data/controversy-timeline.ts:212` | 持續式敘述 | `/controversy-timeline` **在 `launch-status.ts` 的 `PUBLIC_PAGES` 內**，是預定對外發布的頁面 |

`063` 的 reviewer 已逐行讀過兩個 quiz 檔：`correctIndex` 指向的答案本身（「5 位」「10 人」）**作為歷史題是對的**，錯的是 explanation 的**時態**。

`/quiz` 目前只在 team mode 開放、不在 `PUBLIC_PAGES`；`/controversy-timeline` 則在其中。

**一併處理的第二項**（`063` 的 reviewer 記為非 finding，因早於該票存在）：`src/app/future/page.tsx:201` 的「每年處理量約 30~40 件」是 JSX 硬編、**無來源註解**，且在 `063` 刪去 V1 那一句之後**成為該段唯一的無來源量化敘述**。

## Proposed approach

`controversy-timeline.ts:151`／`:152`／`:164`／`:187` 四處是 2024–2025 事件的**過去式敘述，本身不算錯**（`063` reviewer 已判定），`:212` 的持續式敘述才是 deferred risk。逐處判斷時態，不得一律改寫。

`/quiz` 的 `correctIndex` 與答案不動，只改 explanation 的時態與失效標記。

## Risk evidence

`no spike needed`：位置與時態問題皆由 `063` 的 verify 階段逐行讀過並附行號，一手來源（114憲判1 主文與公告日）亦已由該票三輪逐字查核。

## Out of scope

不改 `/future`（`063` 已交付）。不動 `src/data/*.json`（`sync-content` 產物）。不處理 `REFERENCE_DATE` 身兼兩職的問題（另有其票）。
