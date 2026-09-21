---
id: 061
title: 移除佔位信箱按鈕
status: design
source: constitution-features/056 第二節 C1
started:
completed:
verdict:
score: 0.6
worktree:
issue:
pr:
mod-block:
---

移除「我想協助轉譯」按鈕，因為它指向一個沒有人收信的佔位信箱。

## Problem

`PresentDetail.tsx:32` 的按鈕指向 `volunteer@addcourt.tw`。feature `008` 當時已註明這是佔位值，至今沒有人收這個信箱。留著等於對讀者承諾一個不存在的管道。

`Footer.tsx:37` 已有 GitHub issue 回報連結，功能重疊。

## Proposed approach

移除該按鈕。

**🔴 覆寫點（需 captain 回答）**：若 captain 提供真實信箱，本票改為「替換信箱」而非「移除按鈕」。FO 不代為決定。design stage 開始前應先確認 captain 的答覆；若仍無答覆，照「移除」執行。

## Out of scope

不改 `Footer.tsx` 的回報連結。不處理同區塊 A4 的「完整轉譯尚未收錄」聲明——`056` 已判定該聲明是誠實的缺漏說明而非佔位假內容，明確接受。
