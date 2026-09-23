---
id: 065
title: opinion-lazybag 與 present 頁誤引判決號：113憲判9 被寫成 114憲判1
status: design
source: constitution-features/063 第六節 V8（captain 2026-09-23 核准開票）
started:
completed:
verdict:
score: 0.95
worktree:
issue:
pr:
mod-block:
---

站上把「國會職權修法」判決的內容標成 114 年憲判字第 1 號，但那是憲法訴訟法修正案；國會職權修法是 113 年憲判字第 9 號。這是公開頁面上的事實錯誤，且涉及具名大法官。

## Problem

一手來源（已實跑 `curl` 核對）：

- `docdata.aspx?fid=38&id=355485` → **114年憲判字第1號【憲法訴訟法修正案】**，114-12-19
- `docdata.aspx?fid=38&id=352966` → **113年憲判字第9號【立法院職權行使法等案】**，113-10-25

**錯的位置（四個 `src/` 檔）：**

| 位置 | 寫的 |
|---|---|
| `src/app/opinion-lazybag/page.tsx:6` | 頁面標題「國會職權修法判決解析」 |
| 同上 `:7`、`:30` | 「114年憲判字第1號」 |
| `src/components/opinion-lazybag/DecisionFlowchart.tsx:6` | 「5 contested provisions from 114年憲判字第1號」 |
| `src/components/home/LazybagCtaSection.tsx:23` | 首頁 CTA 引「114年憲判字第1號」 |
| `src/app/present/page.tsx:18` | 「114年憲判字第1號」＋「關於國會職權修法之重大判決」＋年份 `2024`——**錯三層** |

**而該頁自己的資料是對的**：`src/data/opinions.ts` 的 **12 筆 `rulingRef` 全部**寫 `113年憲判字第9號`（第 13 筆是型別宣告 `rulingRef: string;`）。散文與資料互相矛盾。

**這件事的嚴重性**：`StanceSpectrum.tsx` 硬編 14 位具名大法官的立場，渲染於 `/opinion-lazybag`（`page.tsx:3`、`:66`）。把真實大法官的意見掛在錯誤的判決號下，是公開頁面上關於真實個人的事實錯誤。

## Proposed approach

**逐處判斷，不得全站字串替換。** 站上另有多處**正確**使用 114憲判1：

- `src/app/controversy-timeline/page.tsx:70` —— 張娟芬文章的標題〈憲法法庭，歡迎回來——兼評114年憲判字第1號判決〉，該文確實在談憲法訴訟法修正案
- `src/data/controversy-timeline.ts:224`、`src/data/discussions.json` 的三篇評論、`src/data/history.json:638`

一次替換會把這些改壞。

`src/data/*.json` 為 `sync-content` 產物，依規範不得手改；若需更正須走 SSOT。

## Out of scope

不修 `049` 的零出處問題（該票另有範圍，但其第 39 行把誤引當前提繼承，須一併更正）。不修 `docs/design-assets/003-comic-lazybag-114.md:28` 的同型誤引——屬 design-assets workflow，但**該票正在 review gate 上，其判決重點摘要整段建立在此誤引上**，須另行提醒。
