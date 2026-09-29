---
id: 059
title: 測驗全站無入口
status: design
source: constitution-features/056 第二節 A3
started:
completed:
verdict:
score: 0.7
worktree:
issue:
pr:
mod-block:
---

讓 feature `018` 已交付的四份測驗在站上有真正的入口，而不是只能直接打網址。

## Problem

`018` 已交付四份測驗與結果分享圖，但**全站沒有任何入口**。唯一的 `href="/quiz"` 在 `QuizResult.tsx:149`，那是做完測驗後的回程連結——讀者得先在測驗裡，才看得到通往測驗的路。

feature `056` 的 design stage 以實際起站抓取七個頁面確認了這個結論，不是只讀程式碼。

現況等於把一份完成品丟掉。加入口的成本遠低於重做。

## Proposed approach

在站內加入口。design stage 需決定放哪裡（`Navbar.tsx` 的 `NAV_ITEMS`、`Footer.tsx`、或各 Track 頁面內的引導），並說明為何選那個位置。

## Out of scope

不改測驗本身的題目、計分或結果圖。不處理 `039` 的常設渲染檢查工具。

`056` 的 AC-2 依賴本票：它要求「必須從站上實際入口點到測驗頁，不接受直接打網址」。
