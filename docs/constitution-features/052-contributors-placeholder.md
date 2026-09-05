---
id: 052
title: /about 頁的貢獻者名單是佔位資料
status: design
source: captain 2026-09-04（把關機制體檢附帶發現）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

`src/data/contributors.ts` 的六筆全是佔位資料，已在 `/about` 頁面公開顯示。真正出力的人沒有被列名，列出來的是「前端工程師 A」。

## Problem

全檔六筆（已由 FO 直接讀取確認）：

```
專案發起人 / 前端工程師 A / 前端工程師 B / 法律文案 / 資料整理志工 / 顧問
```

渲染於 `src/app/about/page.tsx:60,63`。引入自 commit `366faaa`「feat: add About page with origin story, manifesto, contributors, and CTA」。

**性質與 feature `015` 的「某學者，某大學法律系」完全相同**——設計階段的佔位內容跟著上線了。`015` 那次公開顯示四個月才被發現。

**而且它躲在掃描範圍外**：現行佔位掃描寫在 `scripts/sync-content.mjs:68-74`，只在同步時執行、只跑 `history.json` 與 `discussions.json`。`contributors.ts` 不經過同步，**永遠不會被掃到**。

**為什麼這件事不只是資料錯誤**：這是一個 g0v 公民科技專案，貢獻者名單是署名與功勞歸屬。展示一份假名單，對真實協作者是漏列，對讀者是不實陳述。

## Proposed approach

**待 captain 與 design stage 定案。** 這題偏編輯判斷，不是技術缺陷。三個候選：

1. **填入真實貢獻者**——需要 captain 提供名單，且**需取得每個人的列名同意**（真實姓名公開顯示）。
2. **改為不具名的角色描述**——例如「本專案由 g0v 社群志工共同完成」，不列個人。
3. **暫時下架 contributors 區塊**——保留 About 頁其餘內容，待名單確認後再上。

方向未定前不動程式。

## Risk evidence

`no spike needed`：本票只改資料檔與可能的元件顯示，不動資料流。上述事實皆已由直接讀檔確認（六筆內容、渲染位置、引入 commit、掃描範圍）。

## Acceptance criteria

待方向定案後補齊。現階段記錄驗收必須涵蓋的性質：

- `/about` 頁不得顯示佔位性質的人名或角色。需以實際頁面內容檢查證明。
- 若採方案 1，每個列名者的同意需有記錄（不必公開，但需可查）。

## 相依

- **feature 051**（來源標記與掃描）若完成，其掃描範圍應涵蓋 `contributors.ts`，避免同類佔位再次漏網。本票不等待 051。

## Out of scope

不處理 About 頁的其他內容。不處理其他非 SSOT 來源內容（feature 049、053）。不建立掃描機制（feature 051）。
