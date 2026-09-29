---
id: 062
title: h34 與 h35 標題重複
status: design
source: constitution-features/056 第二節 D4（design stage 新發現）
started:
completed:
verdict:
score: 0.65
worktree:
issue:
pr:
mod-block:
---

`h34` 與 `h35` 兩筆線上內容的標題一字不差，需要內容判斷才能補上正確標題。

## Problem

feature `056` 的 design stage 複驗時發現：`h34` 與 `h35` 的標題完全相同，兩筆都在線上，讀者會看到兩則看起來一樣的內容。

與 `docs/health-check/TODO.md` 的 P0-6（`h28` 掛了 `h14` 的標題）同型，但 P0-6 的那兩列已被 `isApproved()` 濾出線上，本項還在。

**這需要內容判斷，FO 不擬標題。**

## Proposed approach

查明 `h34`／`h35` 各自對應的實際案件，補上正確標題。來源是 SSOT，不是 repo——修正動作在試算表端。

design stage 需確認：是資料輸入錯誤（兩列抄同一個標題）還是同一案件被重複建列。兩者的處置不同。

## Out of scope

不改同步程式。不處理 P0-2（釋字第 272 號的法律內容錯誤）——`056` 已明確接受該項，並在 `G-6` 加了反向保護。
