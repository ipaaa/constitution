---
id: 078
title: T1 既有 40 列的老師重審計畫（含 h2、h28 優先處理）
status: design
source: 050 S8（captain 2026-09-29 切換時批次核可 40 列）；067 閱讀清單；069 第 4 項；TODO.md P0-2、P0-6、P0-7
started:
completed:
verdict:
score: 0.85
worktree:
issue:
pr:
mod-block:
---

把 T1 從「切換時為保持網站不變而批次核可」推進到「每一列都有老師簽核」。

## Problem

- `Track 1_history` 的 40 列 Approved，是 captain 在 050 S8（2026-09-29）為了保持網站不變而一次核可的，不是法律審閱。
- 試算表 T1 的欄位標題仍寫 `content（現有為AI生成）`。
- 067 的閱讀清單 212 格，勾選數為 0。
- 兩列待法學確認，目前不在線上：`h2`（釋字第272號內容錯誤，P0-2）、`h28`（標題誤掛 `h14` 的，P0-6）。P0-7 的判決門檻人數也待法學確認。

## Proposed approach

{design 階段決定。依賴 `teacher-review-role-and-signoff` 的簽核紀錄方式，以及 069（閱讀順序）。至少要定下：審閱的批次與順序（h2、h28 先、`PUBLIC_PAGES` 來源次之）；以 067 閱讀清單作為進度紀錄，或改用試算表簽核欄；老師要求修改時，回到責任編輯修改、重新核可的路徑；完成條件。}

## Acceptance criteria

{design 階段補。須包含：40 列與 h2、h28 每一列都能指出簽核紀錄或「未審」狀態；h2、h28 在有簽核紀錄之前，不會重新出現在 `history.json`（守住 P0-2 的反向保護）。}
