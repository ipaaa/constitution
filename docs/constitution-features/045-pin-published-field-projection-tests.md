---
id: 045
title: 把發布欄位投影釘死在測試裡，避免覆蓋率靜默縮小
status: design
source: verify finding F3 (feature 040 cycle 2)，FO 授權 fix，2026-09-04
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

`tests/approval-content-version-binding.test.mjs` 以 `PUBLISHED_FIELDS[sheetKey]` 生成逐欄位案例。欄位一旦離開投影，案例也一併消失，測試不會失敗。

## Problem

feature 040 的 verify cycle 2 記名此缺口（finding F3）。

觸發證據：同時把 `scripts/content-fingerprint.mjs` 與 `scripts/apps-script/approval-workflow.gs` 的 Track 1 投影移除 `'handwriting'`，`node --test` 得 `tests 49／pass 49／fail 0`（基準 50／50／0）。**沒有任何測試失敗，只是案例少了一個。**

因此 feature 040 的 AC-1 與 AC-2 所寫的「漏掉任一欄位會使測試失敗」，只在**單邊**改動時成立（會被 parity 測試擋下），**雙邊一致改動時不成立**。

這是「檢查看起來有做、實際上跟著被改小」的典型形狀。本專案已有同類前科：feature `015` 的 placeholder 公開四個月、feature `006` 的跨軌道連結全站 0 筆卻判 MET。

## 目前為什麼還沒有傷害

feature 040 的 verify cycle 2 已人工比對 Node 與 Apps Script 兩份投影、以及 `docs/content-pipeline/design.md` 的「發布欄位範圍」表，三者逐欄相同。**現行行為正確。**

## 觸發條件（promote to material）

**任何一次改動發布欄位投影就會觸發**：新增 SSOT 欄位、欄位改名、清理不用的欄位。屆時被移除欄位的「核可後修改」會沿用舊核可，而測試不會示警。

**因此本票必須在下一次改動發布欄位投影之前完成。** feature 044（隔離測試表兩帳號 probe）若導致欄位調整，也適用本前置條件。

## Proposed approach

在測試內以**字面**欄位清單斷言三個分頁的投影，把清單釘死在 `design.md` 的「發布欄位範圍」表上。投影與字面清單不符時，測試必須失敗。

方向由 design stage 定案；上述為 verify reviewer 的 advisory 建議。

## Acceptance criteria

待 design stage 補齊。現階段記錄驗收必須涵蓋的性質：

- 從任一分頁投影移除一個欄位（**兩邊一致地改**）時，必須有測試失敗。這是本票的核心驗收，需以實際反向改動證明。
- 三個分頁的字面清單與 `design.md` 的「發布欄位範圍」表一致。

## Out of scope

不改 fingerprint 規格、不改同步放行條件、不改網站資料 shape。不處理 feature 040 的其他項目。
