---
id: 070
title: 同步讀到「載入中…」快照時隨機整份中止
status: design
source: 050 AC-2 正式同步失敗（2026-09-29），captain 同日核准開票
started: 2026-09-29T19:52:07Z
completed:
verdict:
score: 0.8
worktree:
issue:
pr:
mod-block:
---

`040` 合併後，正式同步可能隨機失敗：Google 發布的 CSV 有時送出公式仍在計算的舊快照，`status` 欄顯示「載入中…」，`040` 的驗證因此判整份不符而中止。不會把錯的內容推上網站，但會讓編輯看到數十筆錯誤而以為內容壞了。

## Problem

`050` 於 2026-09-29T19:04:58Z 在 main 上執行 `npm run sync-content`（`040` 已合併）：exit 1、36 筆錯誤，全在 `Track 2_discussion` 的 d8、d9、d11–d44：`status … 實際為「載入中…」`。`src/data` 零寫入。

同一 CSV 在約 10 秒內以 `curl` 抓 6 次，異常列數依序為 0／0／0／36／36／0。正常快照與 captain S8 的核可結果逐列相符。**試算表內容正確，問題在發布 CSV 的快取會送出計算中的快照。**

`status` 是 Apps Script 公式產生的衍生欄位（`040` 的設計），「載入中…」是 Google 試算表在公式計算完成前的顯示值。

design 要決定：同步程式怎麼分辨「快照在計算中」與「內容真的不符」（例如只在出現「載入中…」時重抓、重抓次數與間隔、多份快照一致才採用），且**不得放寬 `040` 的核可驗證**——內容不符時仍須整份中止；以及錯誤訊息怎麼讓編輯分得出兩種情況。

## Proposed approach

{design 填寫}

## Risk evidence

{design 填寫。最危險的未驗證機制是 Google CSV 快取的行為；只讀抓取可實測，不得寫入正式試算表。}

## Expected surface and tolerance

{design 填寫}

## Acceptance criteria

{design 填寫。至少一條量測端值：在快照時好時壞的條件下，同步最終取得正確快照並成功，或在重試用盡時以可辨識的訊息失敗；內容真的不符時仍整份中止。}

## Test plan

{design 填寫。`npx tsc --noEmit`；不得執行 `npm run sync-content`，以 `CONTENT_OUTPUT_DIR` 的不落地方式驗證。}

## Documentation impact

### 現在更新

{design 填寫}

### 實作後更新

{design 填寫}

### 不更新

{design 填寫}

### Feedback Cycles

## Out of scope

- 放寬或繞過 `040` 的核可綁定驗證。
- `050` 的 AC-2 重跑本身（由 `050` 處理）。
