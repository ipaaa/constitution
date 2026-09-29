---
id: 058
title: opinion-lazybag 未接線元件移除與 CTA 數字對齊
status: design
source: constitution-features/056 第二節 A2
started:
completed:
verdict:
score: 0.6
worktree:
issue:
pr:
mod-block:
---

移除 `027` 改版後已被取代、但仍留在 repo 的未接線元件，並讓首頁 CTA 的意見則數與它連去的頁面實際渲染的資料一致。

## Problem

兩件事，同一個成因——`027` 改版後舊元件沒有清掉。

其一，約 697 行的散點圖等元件**無任何檔案 import**（`grep -rn "OpinionLazybag" src/` 只剩它自己）。功能已由 `DecisionFlowchart` ＋ `StanceSpectrum` 取代。留著會讓下一個接手的人以為它在線上。

其二，`LazybagCtaSection.tsx:31,34` 的則數取自 `opinions.ts`（現為 12），但 CTA 連去的 `/opinion-lazybag` 渲染的是 `StanceSpectrum` 自帶的 14 筆資料。**數字與目的地不是同一份資料**，讀者點進去會發現數不對。

feature `056` 的 design stage 複驗推翻了舊快照「CTA 硬寫 16」的說法：它不是硬寫，是取自另一份資料。

## Proposed approach

刪除未接線元件；CTA 的數字改為取自目的地實際渲染的那份資料，或改成不帶數字的文案。design stage 需在兩者間選定並說明理由。

不採「把 opinions.ts 補成 14 筆」——那是讓兩份資料假裝一致，真正的問題是有兩份資料。

## Out of scope

不重做 `/opinion-lazybag` 的視覺。不處理 `049` 的具名大法官出處問題（該票另有負責人；`056` 已回報其一項前提已失效）。
