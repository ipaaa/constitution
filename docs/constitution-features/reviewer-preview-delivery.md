---
id: 079
title: 讓審閱的老師看得到成品：同步錯誤與預覽連結的轉交機制
status: design
source: docs/health-check/TODO.md P2-9（「尚未有對應的票」）；2026-09-03-editor-onboarding.md:453
started:
completed:
verdict:
score: 0.7
worktree:
issue:
pr:
mod-block:
---

老師審閱時，要能看到內容在網站上的實際呈現，不能只看試算表的儲存格。

## Problem

- 老師在試算表只看得到儲存格；網站只顯示已核可的列。
- 現行做法是 captain 看過 PR 的 Vercel 預覽網址後，手動把連結貼進群組。`2026-09-03-editor-onboarding.md:453` 原文：「這兩個環節完全靠人記得做」。
- 忘記轉貼，審閱者就看不到成品。這是 P2-9 指出的根源（test 字串與佔位摘要能通過核可）。它違反 `docs/content-pipeline/design.md` 的不變式 #6（約定必須能被機器驗證）。TODO 註明：「尚未有對應的票」。
- `/preview` 是寫死假資料的風格頁，不是解法。060 的 `?public=true` 開關不涵蓋 `/past`。

## Proposed approach

{design 階段決定。先試最便宜的做法：同步 PR 範本或檢查清單裡，加一項必填的「預覽連結已轉交」，並說明怎麼驗證這項確實做了。之後再評估是否需要狀態檢視頁。不得把同步接進 build 或 CI（`AGENTS.md:19`）。}

## Acceptance criteria

{design 階段補。須包含：漏掉轉交預覽連結時，能被一項可執行的檢查抓到，而不是只靠人記得。}
