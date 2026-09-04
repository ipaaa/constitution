---
id: 044
title: 隔離測試表兩帳號 probe：驗證核可欄位權限與公式重算
status: design
source: captain 2026-09-04（feature 040 verify gate 裁決方案 B 拆出）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

在隔離測試表上以兩個 Google 帳號實跑，證明核可欄位的權限邊界與 `status` 公式對「他人修改內容」與「責任編輯自行修改內容」都會重新計算。

## Problem

feature 040 的 AC-2 與 AC-4 需要試算表端的端到端證據，但 040 的 design 與 implement stage 都沒有隔離測試表，也沒有兩個 Google 帳號；repo 內無 Apps Script 專案、`clasp` 設定或 Google API credential，且契約禁止 worker 觸碰正式 SSOT。

2026-09-04 的 verify gate 因此把 AC-2、AC-4 判為 REJECTED —— **證據不足，不是行為失敗**。VM 重跑確認相異 fingerprint 會回傳 `Needs review`，但規定的表 ID hash 與 Apps Script execution ID 都不存在。

captain 於同日裁決：這條驗證路徑在現有條件下無法由 worker 完成，移出 040 另行開票，讓 040 以 repo 端 fail-closed 同步閘門先落地。

## 前置條件（卡在人，不是卡在程式）

本票在下列資源到位前**不可 dispatch**：

1. 一份與正式 SSOT 完全隔離的測試試算表。
2. 兩個 Google 帳號：測試者 A（建立 installable edit trigger、獨占審核欄位）與測試者 B（只能改內容欄位）。

## 待驗證的命題

- 責任編輯本人修改已核可列的內容欄位後，`status` 公式仍重新計算為 `Needs review`，`approved_*` 不變。
- 投稿者無法直接編輯審核欄位。
- 受保護欄位的 trigger 寫入路徑目前標記 `UNPROVEN`；即使本票證明可行，它也只能作為加速提示，不得取代同步端指紋閘門。

## 證據要求

證據寫入 `docs/content-pipeline/approval-permission-probe.md`，狀態為 `record`。必須記錄測試表 ID 的雜湊、時間、兩個角色、步驟、結果與 Apps Script execution ID。**不得記錄帳號 email 或正式 SSOT URL。**

## Out of scope

不改 repo 端的 fingerprint 或同步邏輯（feature 040 已交付）。不上線正式 SSOT 設定。
