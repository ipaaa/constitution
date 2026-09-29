---
id: 045
title: 把發布欄位投影釘死在測試裡，避免覆蓋率靜默縮小
status: complete
source: verify finding F3 (feature 040 cycle 2)，FO 授權 fix，2026-09-04
started: 2026-09-29T19:52:07Z
completed: 2026-09-29T20:08:29Z
verdict: PASSED
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

design stage 判定：兩條性質在 main `657e015` 上都已成立，由 feature 040 合併的 `DESIGN_PROJECTION` 滿足（PR #43）。本票不再需要程式改動。

**AC-1 兩邊一致地移除任一發布欄位，至少一個測試失敗。**
`Verified by:` 在 repo 副本上，把一個欄位同時從 `scripts/content-fingerprint.mjs` 與 `scripts/apps-script/approval-workflow.gs` 的投影移除，再執行 `node --test tests/approval-content-version-binding.test.mjs`。三個分頁共 29 個欄位逐一做，每一個都必須 `fail ≥ 1`。**狀態：已成立**，見下方〈反向實驗〉。

**AC-2 測試內的字面清單與「發布欄位範圍」表逐欄相同。**
`Verified by:` 人工比對 `tests/approval-content-version-binding.test.mjs:35-40` 的 `DESIGN_PROJECTION` 四組清單與 `_archive/040-approval-content-version-binding.md:145` 的表。**狀態：已成立**，四組逐欄、逐序相同。
注意：測試註解寫「逐字抄自 `docs/content-pipeline/design.md`」，但該表**不在 `design.md` 裡**，只在 040 的封存票。見〈尚未處理的缺口〉第 1 項。

## Out of scope

不改 fingerprint 規格、不改同步放行條件、不改網站資料 shape。不處理 feature 040 的其他項目。

## Design（2026-09-29）

### 結論

**045 的核心目標已由 feature 040 達成。** 040 的 implement cycle 3 在測試內加入字面清單 `DESIGN_PROJECTION`。逐欄位測試改依這份清單產生案例，不再依 `PUBLISHED_FIELDS`。因此兩邊一致地刪掉欄位時，清單不會跟著變小，測試會失敗。

本票開立時的證據（`tests 49／pass 49／fail 0`）是 040 cycle 2 的程式。它已不是現況。

### 反向實驗

- 對象：main `657e015`，以 `git archive HEAD` 匯出到 scratchpad 副本。主 checkout 未改動。未執行 sync。
- 基準：`tests 52／pass 52／fail 0`。
- 做法：每次只移除一個欄位，兩個檔案一起改。測試檔不動。
- 結果：29 個欄位全部至少一個測試失敗。

| 分頁 | 移除的欄位 | 失敗數 |
|---|---|---|
| `Track 1_history` | `chapter` `handwriting` `image_url`（選填） | 各 5 |
| `Track 1_history` | 其餘 7 個必填欄 | 各 28 |
| `Track 2_discussion` | `owl_comment` `sticky` | 各 5 |
| `Track 2_discussion` | `views` `owl_depth_comment` `full_content` | 各 6 |
| `Track 2_discussion` | 其餘 8 個必填欄 | 各 21 |
| `site_tldr` `order = 0` | `text` `link` | 各 5 |
| `site_tldr` `order = 0` | `order` | 1 |
| `site_tldr` `order ≥ 1` | `order` `label` `text` | 各 5 |

選填欄的 5 個失敗是：字面清單比對、逐欄位改指紋、該欄位的同步子測試、同步父測試、Apps Script `Needs review` 測試。必填欄失敗較多，是因為測試用 CSV 的標題由 `PUBLISHED_FIELDS` 產生，缺必填欄會讓同步整份中止。

`site_tldr` `order = 0` 移除 `order` 只有 1 個失敗，就是字面清單比對（`test('三個分頁的指紋投影與 design.md 的發布欄位範圍表逐字相同')`）。原因：把 `order` 從 `0` 改成其他值，會讓這列改走 `order ≥ 1` 的投影，指紋照樣改變，所以逐欄位測試仍通過。這一欄只靠字面清單比對擋住。這仍滿足 AC-1。

對照組：三邊一起刪（兩個程式加上 `DESIGN_PROJECTION`）移除 `handwriting`，結果 `tests 51／pass 51／fail 0`。這是預期行為，見〈尚未處理的缺口〉第 2 項。

### 尚未處理的缺口

1. **錨點文件指錯。** 測試註解（`tests/approval-content-version-binding.test.mjs:32-34`）要求「改動這份清單前，先改 `design.md`」。但 `docs/content-pipeline/design.md` 沒有「發布欄位範圍」表。全 repo 只有 `_archive/040-approval-content-version-binding.md:145` 有這張表。`064` 的文件影響表也寫要改「`design.md` 的『發布欄位範圍』表」。那張表不存在，要先建立。
   處理：交給 `064` 在階段一的同一個 PR 內，把 040 封存票的表搬進 `design.md`，再加兩個選填欄。本票不另開程式改動。
2. **三邊一起改，測試不會失敗。** 這無法用測試消除。字面清單的作用是讓刪欄位必須同時改測試檔，使 PR diff 露出這個改動。把關點是 PR 審查。
3. **`064` 的兩個新欄不會自動被涵蓋。** `064` 選的方案 C 是「有值才加入指紋」。直接把 `case_ref`、`stance` 加進 `DESIGN_PROJECTION.track2` 會出錯：測試資料 `TRACK_2` 沒有這兩欄，字面清單比對會失敗；同步測試填入的 `x` 會被白名單擋下，錯誤訊息對不上指紋閘門。`064` 的 AC-9 已規劃獨立清單 `track2Optional`，方向正確。`064` 須自己做雙邊移除實驗，本票不代做。

### 不適用的產出

本票不改畫面、元件或資料 shape。元件層級、props、響應式行為皆為 `無`。

### 文件影響

- **現在更新**：本檔（design 結論與實驗紀錄）。
- **實作後更新**：`docs/content-pipeline/design.md` 新增「發布欄位範圍」表。由 `064` 階段一的 PR 負責，理由見缺口第 1 項。本票不寫，避免與 `064` 同時改同一節。
- **不更新**：`tests/approval-content-version-binding.test.mjs`、兩個投影腳本、`docs/INDEX.md`（未新增或刪除文件）。

### 建議

直接結案本票，不經 implement。`064` 可以開工。前提是 `064` 負責缺口第 1 項，並在 AC-9 完成新欄的雙邊移除實驗。

## Stage Report: design

- DONE: Determine on current main whether 045's goal is already met by 040's merged DESIGN_PROJECTION literal list: re-run the both-sides removal experiment (drop one published field from both content-fingerprint.mjs and approval-workflow.gs projections on a copy) and record whether tests fail, for all three sheets.
  main `657e015` 副本，基準 52/52/0；29 個欄位逐一雙邊移除，每個都 fail ≥ 1（5 至 28）；`site_tldr` order=0 的 `order` 只由字面清單比對擋下（fail 1）。
- DONE: If met, state that 045 is satisfied by 040 with the evidence and what (if anything) remains, e.g. whether 064's two new columns would be covered automatically once added to design.md's table; if not met, write the minimal design to close the gap.
  已滿足。剩三項：`design.md` 沒有「發布欄位範圍」表（只在 040 封存票）；三邊一起改無法以測試擋下；064 的兩欄不會自動涵蓋，需靠其 AC-9 的 `track2Optional`。
- DONE: Acceptance criteria and documentation impact (現在更新 / 實作後更新 / 不更新) consistent with that finding; no code edits in this stage.
  AC-1、AC-2 皆標「已成立」並附 `Verified by:`；文件影響三分類已寫；未改任何程式或測試。

### Summary

045 的目標已由 040 合併的 `DESIGN_PROJECTION` 達成：兩邊一致地移除任一發布欄位，29 個欄位全部讓測試失敗。建議直接結案，不需 implement。唯一實質缺口是測試註解指向的 `design.md`「發布欄位範圍」表並不存在，建議由 `064` 在同一個 PR 內建立；`064` 的兩個選填欄需依其 AC-9 自行釘住。
