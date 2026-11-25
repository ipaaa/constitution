---
title: Review 核可寫回試算表（取代試算表審核選單）
status: design
source: captain 2026-11-25（content-review 審稿流程討論）
started: 2026-11-25T23:01:11Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
id: 080
---

## 要解決的問題

T1、T2 內容改在 Spacedock Review 審稿（workflow `docs/content-review/`）。老師在 Review 留言簽核，責任編輯（owner）在 Review 按 Approve。
但網站同步只認試算表 SSOT_收集區上的核可紀錄。現在核可要在試算表另用選單 `Review → 核可選取列（附老師簽核）`（feature 076）再做一次。

船長決定：試算表的審核選單不再使用，改由 Spacedock Review 核可。需要一條路，把 Review 的核可寫回試算表。

## 船長已定的方向（2026-11-25）

1. owner 在 Spacedock Review 按 Approve（binding）後，由 first officer 把核可紀錄寫進試算表該列。owner 不必開試算表。
2. 寫入前檢查三件事，任一不符就不寫，並回報原因：
   - 決定是 owner 的 binding approve，且針對目前版本（`result.artifact.rev` 等於該 article 的 `review-rev`）
   - 每個 `##` 節都有**已登入帳號**留下的 `approved`；沒登入的留言不算（`docs/content-review/README.md` 審稿慣例第 2 條）
   - 試算表該列內容在審閱頁產生後沒有被改過（指紋相同）
3. 分兩期：
   - 第一期：first officer 列出「這批要寫入的列」，owner 回覆同意後才寫
   - 第二期：owner 按 Approve 後自動寫入，事後回報。第一期穩定後另行決定
4. 寫入試算表不等於上線。同步照 `AGENTS.md` 第 1 條，有人明確要求才執行，跑完開 PR 給 captain 對 diff。

## 已知事實（設計階段需查證並引用）

- 同步的上線條件在 `scripts/sync-content.mjs` 的 `isApproved` 與 `validateApprovalBinding`：`status`、`review_decision` 為 `Approved`；`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、`current_fingerprint` 皆有值；三個指紋等於 Node 依目前內容重算的值（`scripts/content-fingerprint.mjs`）。Track 2 的指紋序號另見 `publishedRowSequences`。
- 試算表另有 feature 076 的簽核欄：`signoff_by`、`signoff_ref`、`signoff_fingerprint`（`docs/constitution-features/_archive/076-teacher-review-role-and-signoff.md`）。
- `status` 等欄為「權限保護」，只有試算表擁有者（ipawei）能改。寫入會以 owner 的已連結 Google 帳號進行。
- 審閱頁直接讀試算表（`scripts/content-review/sheet.mjs`，唯讀，用同步的同一組 CSV 網址）。發布的 CSV 中 `status`、`current_fingerprint` 可能顯示「載入中…」，不可當作可靠值。
- Review 留言能否分辨「已登入／未登入」：**尚未驗證**。網頁介面有區分（匿名代號 vs 帳號名稱），`subspace-relay-client feedback` 的輸出是否帶此資訊未知。設計必須先查證；查不到時要提出替代方案。
- 分享連結不得寫進 repo 或試算表的公開位置（repo 公開；連結即讀寫權限）。

## 設計要回答的問題

- 寫入哪些欄、各填什麼值（`approved_by`、`approved_at`、三個指紋、`signoff_by`、`signoff_ref`、`signoff_fingerprint`、`review_decision`、`status`）。`signoff_ref` 用什麼當證據（不可用分享連結）。
- 寫入機制：Google Sheets API（透過 owner 已連結帳號）或 Apps Script 端點，各自的權限、可回復性、失敗處理。
- 指紋怎麼綁：審閱頁產生時記下的指紋，與寫入當下 Node 重算的指紋比對。
- 試算表審核選單的去留：停用、隱藏或保留為備援；對 feature 076、079 的影響。
- 寫錯時怎麼回復（清欄、試算表版本記錄）。
- 驗證方法：不可對正式 SSOT 做破壞性測試；說明測試用的試算表或乾跑方式。不得補造 probe 證據（`AGENTS.md` 第 1 條）。

## 不做的事

- 不執行 `npm run sync-content`，不手改 `src/data/*.json`。
- 不改內容欄位，只寫核可與簽核欄。
- 不在第一期做自動寫入。
