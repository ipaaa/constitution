---
id: 051
title: 內容來源標記與可重跑的來源掃描
status: design
source: captain 2026-09-04（把關機制體檢第三類；captain 明確核准建立常設檢查）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

內容上線後沒有任何方法知道它是誰寫的。要讓「站上不得有 AI 生成內容」這句話可查核，必須先有來源欄位，再有會失敗的檢查。

## Problem

**三條辨識路徑全部不可用**（已由體檢逐一查證）：

1. **資料層沒有來源欄位。** 全 repo `grep -rn "provenance|generated_by|written_by|ai_generated|content_source"` **零命中**。
2. **git 紀錄不可靠。** `docs/health-check/TODO.md` 的 P1-6 已查證：短評進入 repo 的 commit `75df766` **沒有** `Co-Authored-By` 標記，而確定為 agent 所寫的 `58c433e` **有**。同一批作業裡有標與無標並存，反推不出來。
3. **檔頭註解已被證明會造假。** `src/data/opinions.ts:11-12` 聲稱「No justice names（…）schema physically enforces」，同檔卻有 12 個真實姓名（見 feature 049）。已移除的 `cross-track-links.ts` 自述「curated editorial links — not auto-generated」，同樣與事實相反。

**唯一殘存的線索**是 `src/data/future.ts:333` 那句 `Researched synthetic records` —— 那是作者自己留的，不是機制產生的。

現行防線三道全部不是為此設計：佔位掃描只認 5 個**已經出過事**的字串且只跑同步的兩個檔；workflow 的 `verify` 階段只涵蓋走 workflow 的票的 diff，且 2026-05-01 才新增（`014`／`015`／`006` 都在它之前上線）；captain 對 PR diff 只涵蓋同步產生的兩個 json。

`docs/content-pipeline/design.md` 第六節不變式第 6 條已預先寫下判詞：

> 「大家記得不要做 X」不是機制，是願望。

## 為什麼這張票是常設檢查、且需要 captain 核准

FO 操作契約規定：建立**新的常設檢查或強制流程**（lint、review gate、CI lane、週期性驗證）是最後手段，只有在既有守衛、既有機械檢查、可證偽的實地演練都無法證偽該主張時才做，且需 captain 明確核准、正常應自成一票。

**captain 已於 2026-09-04 明確核准。** 本票即為那個「自成一票」。

理由是前三個較便宜的層級都已試過並失敗：沒有既有守衛涵蓋非 SSOT 內容；既有機械檢查（佔位掃描）只認 5 個字串且範圍錯；可證偽的實地演練無法進行——**因為沒有欄位可以查**。

## Proposed approach

**待 design stage 定案。** 兩層，順序不可反：

**第一層：來源欄位。** 沒有欄位，任何檢查都無從查起。待決：每筆資料加 `source`／`reviewed_by`，還是每檔強制檔頭？前者精確但改動大，後者便宜但**已被證明會造假**（見 Problem 第 3 點），因此若採檔頭必須配機械檢查。

**第二層：可重跑的掃描。** 涵蓋 `src/data/` 全部與元件硬編文案，取代現行只在同步內、只跑兩檔、只認 5 個字串的掃描。

**第三層（待決）：掛載點。** 目前無 `.github`、無 test script、無自訂 lint。第二層做出來也沒有東西會自動跑它。design stage 須決定掛在哪裡，或明確記錄「暫不自動化，由人手動跑」並說明為什麼可接受。

## Risk evidence

未執行 spike。**design stage 必須先做一件事**：拿現有的 `src/data/` 八個檔試填來源欄位，確認「這筆是誰寫的」這個問題**實際上答得出來**。若多數內容連人都答不出來，第一層的設計要改成先處理「未知來源」這個狀態，而不是假設每筆都有答案。

## Acceptance criteria

待 design stage 補齊。現階段記錄驗收必須涵蓋的性質：

- 掃描必須**能夠失敗**：塞一筆無來源標記的內容進 `src/data/`，掃描必須非零退出。需以實際塞入證明，不可只驗規則文字存在。
- 涵蓋範圍須含 `src/data/` 全部檔案與元件硬編文案，不只同步產生的兩個 json。
- 對現有內容執行一次，結果必須可據以回答 P1-8 的八個檔各自的處置。

## 相依

- **feature 049**（opinion-lazybag）與 **053**（P1-8 處置）處理的是**既有**內容；本票建立的是**往後**的機制。兩者互補，不互為前置。
- **feature 047**（內容凍結）需要來源標記才能表達「這筆已定稿」，本票是其前置。

## Out of scope

不處理既有內容的正確性。不處理 SSOT 分頁的核可機制（feature 040）。不建立渲染檢查（feature 039，且該票明文宣告它不做 AI 內容偵測）。
