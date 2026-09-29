---
id: 048
title: 首頁的 build-time 日期對外誤示為內容更新日
status: design
source: captain 2026-09-04（T3 定版體檢附帶發現）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

`src/app/page.tsx:22` 在 server component 內呼叫 `new Date()`，日期會在 build 當下被烤進靜態 HTML。內容一個字沒改，重新部署一次，網站就對外顯示新日期。

## Problem

```tsx
{new Date().toISOString().split('T')[0]}
```

`src/app/page.tsx` 沒有 `'use client'`，是 server component。已查證：

- 全站 `new Date()` 只有兩處：本行與 `src/components/Footer.tsx:19` 的年份（一年才變一次，影響小）。
- `package.json` 的 `build` 就是 `next build`，日期在建置時求值後固定進 HTML。

**這是全站唯一違反「相同輸入、相同輸出」的地方。**

**但真正的問題不是不確定性，是它會誤導讀者。** 該日期渲染在「官方首頁 / Home」標籤旁邊，讀者會讀成「內容更新日」，實際上它只是「上次部署日」。

這使它成為一筆**沒有來源、且對外做出不實陳述**的內容 —— 性質接近「站上不得有無來源內容」那條禁令要防的東西，只是它不是 AI 生成的。

## Proposed approach

待 design stage 定案。兩個候選：

1. 改為固定的「最後更新日」常數，與實際內容更新綁定（需決定誰在什麼時候更新它）。
2. 直接移除該日期。

`Footer.tsx:19` 的年份是否一併處理，由 design stage 判斷。

## Risk evidence

`no spike needed`：本票只改前端顯示，不動資料流。上述事實皆已由讀碼確認（server component 判定、全站 `new Date()` 分布、build script 內容）。

## Expected surface and tolerance

Estimate: 待 design stage 定案後估算，預期極小（1–2 檔）。
Semantics this may change: 首頁顯示的日期語意。不改資料流、不改路由。

## Acceptance criteria

待 design stage 補齊。現階段記錄驗收必須涵蓋的性質：

- 內容未改動時，兩次不同日期的建置必須產生相同的首頁輸出。需以實際兩次建置比對證明。
- 若保留日期顯示，其語意必須與實際內容更新一致，且標示清楚。

## Out of scope

不處理 T3 資料的凍結（feature 047）。不處理其他頁面的文案。
