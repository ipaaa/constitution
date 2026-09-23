---
id: 064
title: Track 2 新增 case_ref 與 stance 欄
status: design
source: constitution-features/019 第二節（captain 2026-09-23 核准加欄）
started:
completed:
verdict:
score: 0.7
worktree:
issue:
pr:
mod-block:
---

在 `Track 2_discussion` 分頁新增 `case_ref` 與 `stance` 兩個選填欄，並讓同步程式把它們帶進 `discussions.json`，使 feature `019` 的不同意見總覽頁得以成立。

## Problem

feature `019` 原本的資料源 `opposing_views` **沒有任何合法填入途徑**：`scripts/sync-content.mjs` 對該欄零命中，`buildTrack2` 的 projection 是逐鍵白名單，而 `docs/content-pipeline/design.md:535-545` 記錄 captain 已於 2026-09-01 明確決定不收集反方意見。

`019` 的 design 因此改採不依賴該欄的方案：以 `discussions.json` 16 篇**已核可、有真實作者與原始出處**的文章為資料源，按案件與立場並排呈現，零新撰文字——刻意避開 `015`／`006`／P1-8 三次同型事故的共同動作。

代價是需要兩個新欄位。這是 `019` 的**硬前置**：`019` 的 implement 不得在本票交付資料前開始，否則其 AC-1 必定從第一次跑就失敗。captain 已於 2026-09-23 核准加欄。

## Proposed approach

規格已由 `019` 的 design 寫定，見 `019-opposing-views-overview-page.md` 第三節，本票照做：

- **試算表**：`Track 2_discussion` 加 `case_ref`（選填，只有編輯台可改，值域為 `VERIFIED_CASE_REFS` 的鍵）與 `stance`（選填，下拉選單，值域 `支持`／`質疑`／`中立分析`）。兩欄皆選填，空白者不進任何案件分組。
- **同步程式**三處改動（皆在 `scripts/sync-content.mjs`）：`TRACK_2_COLUMNS` 加兩筆皆 `optional`；`buildTrack2` 迴圈加兩條驗證（`case_ref` 非空時須在白名單、`stance` 非空時須在允許清單）；projection 加兩個條件展開，**加在 `full_content` 之後以維持既有鍵序**（該處註解已載明此要求，目的是讓 PR diff 只顯示內容差異）。
- **`case_ref` 必須是白名單而非自由文字**，常數形狀見 `019` 第三節 3.2。

`stance` 的三個值是**論點取向不是陣營**，**不得出現政黨名、陣營名或評價性用語**——此為 `015` 的驗收條件（`_archive/015-opposing-views-integration.md:62`），本票沿用。

## Risk evidence

不得直接在正式 SSOT 上試錯。加欄本身會讓現行同步在欄位檢查處中止（同 feature `050` 已證實的機制），因此施工順序與停擺窗口需在 design stage 寫清楚。

## Acceptance criteria

**交付定義（由 `019` 第二節訂定，本票沿用為 AC-1）**：同步跑完後，`src/data/discussions.json` 中**至少有一組 ≥2 筆同 `case_ref`、且 `stance` 不全相同**的記錄。未達此條件，`019` 的 AC-1 必定失敗。

其餘 AC 由 design stage 補齊，每項附可失敗的 `Verified by:`。

## Out of scope

不做 `019` 的頁面與元件。不收集反方意見（`opposing_views` 的決定不變）。不改 `full_content` 或其他既有欄位的形狀。
