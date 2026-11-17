---
id: 076
title: 老師審閱角色與簽核紀錄：權限與審核責任表
status: design
source: captain 2026-11-16 裁示「老師只負責審閱、簽核，由責任編輯代按 Approve」；TODO.md P3-1、P3-2；2026-09-04 會議後續工作四
started: 2026-11-17T19:08:10Z
completed:
verdict:
score: 0.9
worktree:
issue:
pr:
mod-block:
---

讓法律老師能審閱 T1 內容並留下可查的簽核紀錄，而核可（Approve）仍由責任編輯在試算表 `Review` 選單代按。

## Problem

- captain 於 2026-11-16 決定：老師只負責審閱與簽核，不進審核欄位的 B 群保護範圍；Approve 由責任編輯代按。
- 現行設計沒有「老師簽核」這一層：`approval-workflow.gs` 只記錄按下 Approve 的帳號（`:241`），因此看不出哪位老師在何時、對哪個內容版本表示同意。
- `docs/content-pipeline/gatekeeping.md:49-55` 把學者列為與一般協作者同權，沒有寫明審閱責任。
- 參與的老師是誰、試算表分享給誰，都還沒確認（`docs/health-check/TODO.md` P3-1、P3-2）。2026-09-04 會議要求的「協作者權限與審核責任表」查無。

## Proposed approach

{design 階段決定。至少要比較兩種簽核紀錄位置：(a) 試算表新增老師簽核欄，綁定 `current_fingerprint`；(b) 不改試算表結構，改由責任編輯在 Approve 時於某欄記錄簽核老師與日期。選定方案時要說明，內容被修改後簽核如何隨版本失效，比照 040。}

## Acceptance criteria

{design 階段補。須包含：一份權限與審核責任表（角色 × 分頁 × 可做的事）；任一列已核可的內容都能查到簽核老師與所綁定的內容版本。}
