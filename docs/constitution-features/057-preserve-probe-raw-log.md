---
id: 057
title: 把 044 probe 的原始工作記錄併入 repo
status: design
source: feature 044 的 verify cycle 3 Finding 7；captain 2026-09-17 裁決選項 A
started:
completed:
verdict:
score: 0.3
worktree:
issue:
pr:
mod-block:
---

feature 044 的三輪查核全部以 `/tmp/sd044-probe-log.md` 為唯一基準。該檔在 `/tmp`，重開機即消失，且不在任何 commit 內。

## Problem

`docs/content-pipeline/approval-permission-probe.md`（狀態 `record`）是 probe 的正式證據文件。但它是**整理後的產物**，原始觀察記錄在 `/tmp/sd044-probe-log.md`。

044 的 verify 三個 cycle 全部以該原始記錄為基準，判斷證據文件有無超出實際觀察——**cycle 1 的 Material finding 就是這樣抓到的**（證據文件宣稱三個 `approved_*` 欄經實測不變，原始記錄只有兩欄、且 P3 完全未觀察）。

**升為 Material 的條件已寫在 044 的 verify 報告**：`/tmp` 被清除之後，若有人要重新稽核 `approval-permission-probe.md` 是否忠於原始觀察，基準已不存在，044 三輪的查核無法重現。

## 安全性已由 044 的 verify 實測確認

該檔**不含帳號 email、不含 Google 網址、不含 44 字元試算表 ID**（掃描命中數 0）。測試表僅以雜湊呈現。**沒有不能入庫的理由。**

## Proposed approach

**待 design stage 定案。** 兩個候選：

1. **獨立檔案**——放進 `docs/content-pipeline/`，狀態 `record`，檔名標明它是 044 probe 的原始工作記錄，並在 `approval-permission-probe.md` 加一行指向它。
2. **併為證據文件的附錄**——放在 `approval-permission-probe.md` 的分隔線之後。但該檔已 418 行，再加會很長。

design stage 須決定何者，並確認檔案的狀態標記與 `docs/INDEX.md` 的登錄方式。

## 現況

FO 已於 2026-09-17 把該檔複製到 `~/Documents/probe-csv/`（captain 本機），先避免 `/tmp` 清除造成遺失。**該備份不在版控內，不構成本票的交付。**

## Risk evidence

`no spike needed`：本票只新增一份 Markdown，不動程式、不動試算表、不執行同步。安全性已由 044 的 verify 實測確認。

## Expected surface and tolerance

Estimate: +140 net LOC across 2 files, tolerance ±40%。
Semantics this may change: `none`。

## Acceptance criteria

**AC-1 — 原始記錄在版控內，且內容與 044 查核所用的基準一致。**
Verified by: 以 `diff` 比對入庫版本與 `~/Documents/probe-csv/probe-log.md`；不一致即為失敗。**不得為了美化而改寫原始記錄**——它的價值正在於它是未經整理的原始觀察。

**AC-2 — 不含任何敏感值。**
Verified by: `grep` 掃描帳號 email、Google 試算表網址、44 字元試算表 ID，三者皆須零命中。任一命中即為失敗。

**AC-3 — 證據文件可以找到它。**
Verified by: `approval-permission-probe.md` 內有指向原始記錄的連結或路徑，且該路徑在 repo 內解析得到。

## Test plan

`npx tsc --noEmit` 確認未動到程式。不執行 `npm run sync-content`。

## Documentation impact

### 現在更新

| 文件 | 為什麼現在要改 | 更新內容 |
|---|---|---|
| `docs/content-pipeline/approval-permission-probe.md` | 需指向原始記錄 | 加一行路徑指向 |
| `docs/INDEX.md` | 新增文件須登錄 | 新增一列 |

### 實作後更新

| 文件 | 完成條件 | 更新內容 |
|---|---|---|
| 無 | — | — |

### 不更新

| 文件 | 理由 |
|---|---|
| `docs/constitution-features/044-approval-permission-two-account-probe.md` | 044 已於 2026-09-17 核可進入 review，本票不改動它 |
| 狀態為 `record` 的其他文件與 `docs/_archive/**` | 歷史記錄，不改寫 |

### Feedback Cycles

## Out of scope

不改寫原始記錄的內容。不補做 P6。不處理 044 證據文件本身的任何缺口。
