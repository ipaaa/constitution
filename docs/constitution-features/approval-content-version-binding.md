---
title: 核可綁定內容版本並在修改後退回重審
status: design
source: captain 2026-09-03
started:
completed:
verdict:
score: 0.95
worktree:
issue:
pr:
mod-block:
id: 040
---

讓 SSOT 的核可結果綁定被核可的內容版本。核可後只要發布欄位被修改，該列必須顯示 `Needs review`，而且同步程式必須拒絕沿用舊核可。

## Problem

現行同步只檢查 `status = Approved`。投稿者、學者或責任編輯在核可後修改同列內容時，`Approved` 不會失效。下一次同步會把未重新核可的內容送入 PR。

這會切斷「編輯核可的是實際發布內容」的證明鏈。PR 預覽仍是必要防線，但不能取代 SSOT 內的逐列核可。

## Proposed approach

採用內容指紋加自動退回的雙層機制。核可操作同時寫入 `status`、`approved_by`、`approved_at` 與 `approved_fingerprint`。指紋涵蓋該分頁所有會發布的欄位，排除審核中繼欄位。

發布欄位變更後，試算表自動把狀態改為 `Needs review`。同步程式也重新計算指紋。只有狀態、核可紀錄與指紋全部有效時才放行。即使試算表自動退回機制失效，同步仍須整份中止並指出資料列。

不採只靠 `onEdit` 清除狀態。該方案無法讓發布端獨立證明自動化曾成功執行。

## Risk evidence

需在 design 階段先做最小端到端驗證：確認 Google Apps Script 可在一般協作者編輯受保護狀態欄之外的內容欄位後，以觸發器身分更新受保護的審核欄位。若此權限路徑不成立，仍保留同步端指紋防線，並改用不依賴該寫入權限的提示設計。

## Expected surface and tolerance

Estimate: +300 net LOC across 5 files, tolerance ±40%.
Semantics this may change: SSOT 核可操作、允許的 status 值、CSV 欄位結構、同步放行條件與錯誤訊息。

## Acceptance criteria

**AC-1 — 核可後的發布內容不可在未重新核可時通過同步。**
Verified by: 使用 fixture 先核可一列，再逐一修改每個發布欄位；同步每次都以非零退出碼中止且不改寫任何 `src/data/*.json`。把任一發布欄位錯誤地排除於指紋時，此測試會失敗。

**AC-2 — 核可後修改發布欄位會顯示 `Needs review`。**
Verified by: 在測試試算表由非編輯台協作者修改已核可列的每種發布欄位，觀察 `status` 變為 `Needs review`，並保留可追溯的前次核可紀錄。停用觸發器或漏掉欄位時，此驗證會失敗。

**AC-3 — 只有完整且與目前內容相符的核可紀錄可以發布。**
Verified by: 測試缺少 `approved_by`、缺少 `approved_at`、缺少指紋、偽造 `Approved`、錯誤指紋及有效指紋六種 fixture；前五種被拒絕，最後一種通過。放寬任何必要條件時，此測試會失敗。

**AC-4 — 責任編輯自行修改內容也必須重新核可。**
Verified by: 以責任編輯身分修改已核可列的發布欄位；狀態變為 `Needs review`，舊指紋無法通過同步。若依操作者身分豁免退回，此驗證會失敗。

**AC-5 — 非發布欄位變動不會造成無效退回。**
Verified by: 修改 `status`、`approved_by`、`approved_at`、`approved_fingerprint` 以外的明確非發布管理欄位，確認內容指紋保持一致；將審核中繼資料納入指紋時，此測試會失敗。

**AC-6 — 新規則成為內容產線的唯一現行規格。**
Verified by: `docs/content-pipeline/design.md` 與 `docs/INDEX.md` 的狀態及引用關係一致，且實際同步測試行為符合文件；若現行文件仍宣稱只靠 `status = Approved` 放行，review 會判定失敗。

## Test plan

為同步程式加入核可紀錄、指紋穩定性、欄位涵蓋、全有全無寫入及錯誤訊息測試。以隔離的測試試算表驗證 Apps Script 的核可與 `Needs review` 行為。執行 `npx tsc --noEmit` 與既有安全測試。不可執行 `npm run sync-content`。

### Feedback Cycles


## Out of scope

不處理既有內容的法律正確性。不恢復自動部署同步。不取消 PR diff 與預覽核可。不上線正式 SSOT 設定，直到隔離測試表完成驗證並由 captain 確認。
