---
id: "035"
title: UX 審計上線前必修項
status: implement
source: design-assets/007
started: 2026-05-03T03:23:28Z
completed:
verdict:
score: 0.9
worktree: .worktrees/spacedock-ensign-035-ux-audit
issue:
pr: pr-merge:31 #31
mod-block:
---

根據 design-assets/007 UX 顧問報告，修正上線前必須解決的問題。

## Checklist

- [ ] A. 首頁主 CTA 改導向 /future 或 /controversy-timeline（目前導向 T2）
- [ ] B. 首頁三軌卡片在 public mode 下尊重 LAUNCHED_PAGES，未開放的顯示「即將開放」
- [ ] C. About 頁面移除 placeholder 文字（需 captain 補 docs/about-content.md）
- [ ] D. T2 頁首加「如果你只有 3 分鐘」導讀引導
- [ ] E. 統一首頁懶人包 CTA 文案和 /opinion-lazybag 頁面標題定位
- [ ] F. 第一波社群主視覺（「15→5」infographic）— 交 Codex design workflow
- [ ] K. 首頁三軌區加閱讀順序提示：「第一次來，建議先看未來危機」

---

### 終結說明（2026-09-02，由 FO 補記）

**本票的 `verify` 與 `review` 兩個階段從未執行。**

實際發生的事：PR #31 於 2026-05-03T04:13:51Z 合併，程式碼自此在線上運作。
已驗證該合併 commit 為 `main` 的祖先。但當時的 session 在合併前結束，
沒有人回來推進 workflow 狀態，因此本票停在 `implement` 四個月，
且持續佔用併行名額。

**`verdict: PASSED` 的依據是「PR 已合併且交付物已上線」，不是「通過了本
workflow 的 verify／review 審查」。** 本票內無任何 Stage Report。

補記此節的原因：標成通過而不說明審查未跑，等於製造一筆「看起來對、其實不對」
的紀錄。那正是 2026-08 內容產線事故的共同模式。

## Stage Report: implement

> 本節為 2026-09-02 依已合併的 PR #31 逐檔重建的回顧記錄，非當時即時撰寫。
> 依據為該 PR 的實際 diff。當時未留下任何 Stage Report。

- DONE: A. 首頁主 CTA 改導向 `/future`
  檔案 `src/app/page.tsx`，commit `8bf8354`。
- DONE: B. 新增 `TrackCards.tsx`，三軌卡片依 `LAUNCHED_PAGES` 顯示「即將開放」
  新檔 `src/components/home/TrackCards.tsx`，commit `8bf8354`，判斷邏輯經 commit `d408e57` 修正。
- DONE: E. 統一首頁懶人包 CTA 文案
  檔案 `src/components/home/LazybagCtaSection.tsx`，commit `8bf8354`，文案再經 commit `30e28bb` 更新。
- DONE: K. 首頁三軌區加閱讀順序提示
  檔案 `src/app/page.tsx`，commit `8bf8354`。
- SKIPPED: D. T2 頁首「3 分鐘導讀」。commit 記錄顯示先實作、後在同一 PR 內撤銷，最終未進入合併結果
  commit `485735a` 實作，commit `27c7326` 撤銷。
- SKIPPED: C. About 頁面移除 placeholder 文字。本 PR diff 未觸及
  PR #31 diff 不含 `src/app/about/page.tsx` 的任何改動。
- SKIPPED: F. 第一波社群主視覺 infographic。本 PR diff 未觸及
  PR #31 diff 不含任何新增圖片素材。

### 實際變更

對照本票 Checklist 逐項核對 diff：

- **A（首頁主 CTA 改導向 /future）**：`src/app/page.tsx` 主 CTA 連結從 `/present` 改為 `/future`，文案改為「查看癱瘓實況」。原本導向 `/present` 的連結降級為次要連結，文案「已知道背景？看各方怎麼說」，字級縮小。此項已實作。
- **B（三軌卡片在 public mode 下顯示「即將開放」）**：新增 `src/components/home/TrackCards.tsx`（172 行新檔），把原本寫死在 `src/app/page.tsx` 內的三張軌道卡片抽成獨立元件。元件依 `LAUNCHED_PAGES` 判斷各軌是否開放：未開放時渲染灰階、不可點擊的卡片，文字為「即將開放」；已開放時渲染原本可點擊的卡片。判斷邏輯讀取 `?public=true` 參數與 `localStorage.public_mode`，與 `LaunchGate` 使用同一套標記。此項已實作。
- **D（T2 頁首加「3 分鐘導讀」）**：commit 記錄顯示 `fix(D): add anchor links to reading guide on /present`，隨後被 `revert(D): remove reading guide from /present` 撤銷。合併進 `main` 的最終 diff 中，`src/app/present/page.tsx` 只保留三個錨點 id（`timeline`、`tldr`、`voices`，皆帶 `scroll-mt-24`），沒有任何導讀文字或 3 分鐘提示區塊。此項最終未出現在合併結果中。
- **E（統一懶人包 CTA 文案）**：`src/components/home/LazybagCtaSection.tsx` 標題改為「看看憲法法庭如何產生判決」，說明文字與按鈕文案（改為「看判決推理過程」）同步調整。此項已實作。
- **K（三軌區加閱讀順序提示）**：`src/app/page.tsx` 三軌區標題下方加入提示文字：「第一次來？建議先看『未來』了解危機，再回頭看『過去』與『現在』」。此項已實作。
- **C、F**：本 PR 的 diff 未觸及 About 頁面 placeholder 文字（C），也未包含任何 infographic 素材（F）。這兩項不在本次變更範圍內。

`src/app/page.tsx` 另有結構性精簡：移除 `Clock`、`Search`、`Workflow` 圖示與 `CRISIS_STATS` 的直接 import（改由 `TrackCards.tsx` 內部引用），新增 `TrackCards` 與 `Suspense` 的 import，三軌卡片渲染包在 `<Suspense fallback={null}>` 內。

commit 記錄額外顯示一筆 `fix(B): align TrackCards public mode detection with LaunchGate`，內容與上述 B 項的 public mode 判斷邏輯有關，已併入 B 項變更說明。

### 變更規模

+196／−98 行，跨 4 個檔案（其中 `src/components/home/TrackCards.tsx` 為新增檔案）。

### 未執行的事項

- `verify` 階段未執行
- `review` 階段未執行
- 無驗收標準，故無驗收結果

### 交付證明

PR #31 於 2026-05-03T04:13:51Z 合併。合併 commit `cd14620999e0e07f4a2bf344291a05eea3e884cf` 為 `main` 的祖先。

### Summary

本票 checklist 共 7 項，4 項完成（A、B、E、K），3 項未完成（C、D、F）。D 項（3 分鐘導讀）曾在同一 PR 內先實作後撤銷，最終未進入合併結果；C、F 兩項自始未被本 PR 的 diff 觸及。變更規模為 +196／−98 行，跨 4 個檔案，其中 `TrackCards.tsx`（172 行）為新增檔案。

