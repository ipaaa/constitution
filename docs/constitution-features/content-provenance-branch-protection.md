---
id: 073
title: 分支保護：定版標記與內容不得在同一次修改中一起改
status: design
source: 047 design 第八節決定二；captain 2026-09-30 選「先開分支保護的票」（只有 captain 可以解除定版）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
---

`047` 的定版檢查有一個已知漏洞：同一次修改裡同時改了內容與 `content-provenance.json`（`051` 建立）的 `freeze` 欄位，建置前檢查會通過。檢查分不出「經 captain 同意的解除定版」與「順手一起改」。

captain 2026-09-30 決定：**只有 captain 可以核准解除定版**，並要求另開本票，用機械方式擋下這個漏洞，而不只靠 PR 審閱時看清單檔的變動。

design 要回答：
- 用什麼擋：GitHub 分支保護、CODEOWNERS（`content-provenance.json` 須 captain 核准）、CI 檢查，或其組合。repo 目前沒有 `.github`。
- 怎麼證明擋得住：一次同時改內容與 `freeze` 的 PR，必須在未經 captain 核准時無法合併。要實測，不可只驗設定文字。
- 對既有流程的影響：pr-merge 流程、agent 開 PR 的方式、captain 的核准步驟。

**前置：`051` 與 `047` 合併之後才開始 design**（清單檔與 `freeze` 欄位要先存在）。
