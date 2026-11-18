---
id: 077
title: 重寫試算表「使用說明」分頁與老師審閱指南
status: design
source: T1 老師審閱缺口盤點（2026-11-16）；docs/health-check/2026-09-03-editor-onboarding.md
started:
completed:
verdict:
score: 0.8
worktree:
issue:
pr:
mod-block:
---

依現行的版本綁定審核機制（040／050），以及老師審閱、責任編輯代按 Approve 的分工，重寫試算表的 `使用說明` 分頁，並另寫一份給老師的審閱指南。

## Problem

- repo 裡沒有任何給老師的說明。`docs/project/contributing.md` 寫給責任編輯與工程師。
- 唯一的使用說明草稿 `docs/health-check/2026-09-03-editor-onboarding.md` 早於版本綁定。它仍寫「先請主編清空 status」，但 `status` 現在是公式欄位，這一句已經錯了。
- 線上 `使用說明` 分頁沒有副本存在 repo，是否已更新，未確認。

## Proposed approach

{design 階段決定。依賴 `teacher-review-role-and-signoff` 的分工與簽核方式。指南要涵蓋：怎麼找到待審列、`Needs review` 的意思、怎麼表示同意或提出修改、內容被改後為什麼要重審、去哪裡看網站預覽。}

## Acceptance criteria

{design 階段補。須包含：說明文字逐句對得上現行機制（以 040、050 的規格與 `approval-workflow.gs` 驗證）；repo 內留有線上 `使用說明` 分頁的權威副本。}
