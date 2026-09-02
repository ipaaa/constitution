---
session-date: 2026-09-01
sequence: 1
first-commit: 060882d
last-commit: 1eff0e2
duration: ~7h 作業時間（09/01 15:26–21:37、09/02 08:25），跨兩日
---

# Session Debrief — 2026-09-01 #1

承接 8/31 的內容產線體檢。本次確認搶救內容回填完成、發現並處理三個新的靜默失敗點、
在 captain 兩次反對下推翻原設計中兩個「把成本推給人」的決定，隨後建立專案工作規範
（`AGENTS.md`）、全面盤點 33 份文件並完成整併，最後將 `constitution-features`
workflow 自 spacedock 0.9.5 refit 至 0.28。

**本次工作仍在 workflow 之外進行** —— 未動任何 entity，13 個 commit 皆為資料修復、
文件與 scaffolding。這是連續第二次 0-entity 的 session。

## Shipped

無 workflow entity。

## Filed (backlog)

無新 entity。新待辦記於 `docs/health-check/TODO.md`：P0-5（同日解決）、P1-6。

## Non-PR commits (workflow-only)

全部直推 `main`，無 PR：

- `060882d` 標記 push 完成，記錄線上驗證結果 — 前一個 session（終端機當掉）留下
- `bdd0060` 查核 SSOT 回填進度（6/10 完成），記錄 `site_tldr` 斷點
- `862b081` design：新增 `site_tldr` 分頁，修掉 tldr 必填欄位的矛盾
- `a50834a` design：推翻「標題不得帶註解」，改由程式最長前綴比對
- `2e97429` docs：新增 P0-5 —— `d1` 反方意見掛虛構出處，正在線上顯示
- `c84b30f` design：取消 `Track 2_opposing`
- `bf491df` fix：刪除 `d1` 虛構出處；短評決定採試算表版；修好 TODO 折疊區塊
- `90bfb5e` docs：補上體檢報告缺的「送達機制」，整理三個破洞與四道防線
- `3e695a3` docs：新增 `AGENTS.md` 與文件總索引；4 份危險文件加警告標頭
- `6025126` docs：整併第 1、3 階段 —— 封存 7 份、刪 2 份重複、`Documents/` 併入 `docs/`
- `086daa4` docs：依新寫作標準重寫 `design.md`
- `b7d447f` docs：產線文件由 4 份合併為 3 份
- `1eff0e2` refit：`constitution-features` 升級至 spacedock@0.28.0-pre2

累計 27 個檔案變動、+1747／−561 行。

## Decisions

**產線**

1. **`tldr` 移到 `site_tldr` 分頁** —— captain 先做的改動。查證後確認它**修掉了原設計的矛盾**：
   原設計把 tldr 當 Track 2 的一列，卻要求 Track 2 的 `year`／`vibe` 必填，而 tldr 兩者皆空。
   照原設計施工完，第一次跑同步就會被自己擋下。
2. **`d8`/`d9` 的 vibe 刻意統一**為 `📣 懶人入門`。回填清單原訂值作廢。
3. **推翻「欄位標題不得帶註解」** —— 中文說明是寫給學者老師的欄位指引，保留；改由程式
   最長前綴比對，解析不出來就中止並指名。
4. **取消 `Track 2_opposing`，不收集反方意見** —— 0416 會議決定的是編輯策展，不是開分頁收集。
5. **刪除 `d1` 的虛構出處資料**，元件與型別保留（`019` 那張票還開著）。
6. **短評採試算表版**，網站版另存備份。
7. **`noindex` 現在刻意保持**，正式發布才移除。

**文件**

8. **新增 `AGENTS.md`**（`CLAUDE.md` 為 symlink）：禁止事項、不預設 captain 懂技術的溝通
   規範、簡明技術中文（ASD-STE100 中文等效）、文件狀態三分（evergreen／plan／record）。
9. **文件整併第 0、1、3 階段執行**：4 份危險檔加警告標頭、封存 7 份、刪 2 份重複、
   `Documents/` 併入 `docs/`。第 2 階段（重寫）刻意延後至產線改造完成後。
10. **防漂移採選項 B** —— 少數 evergreen ＋ 一支檢查腳本。captain 已核准，待實作。
11. **產線文件由 4 份併為 3 份** —— `current-vs-target.md`（本次新增）約 100/140 行重述
    `design.md`，已刪除併回。

**Workflow**

12. **`constitution-features` refit 至 0.28**，採用全部樣板新增內容；保留五階段設計與
    `sequential` 編號。`design-assets` 暫不動。

## Issues — Workflow

**已處理**

1. **`d1` 掛虛構出處正在線上**（已刪除）—— 來自 `015` 把 entity 文件中「Sample data shape」
   的**結構示範 JSON** 當成真實內容寫入。原訂流程「允中整理 → 編輯審查 → 才寫入」三步皆
   未執行，而 gate 判 `PASSED`(0.7) 沒抓到。已抓 JS bundle 實測確認曾在線上。
2. **`site_tldr` 會讓 TL;DR 無聲消失**（已寫進設計）—— `if (!item) return null`，不報錯不擋建置。
3. **體檢報告缺「送達機制」**（已補第二次補述）—— 只解釋資料為什麼壞，沒解釋為什麼會上線。
4. **`TODO.md` 折疊區塊未閉合**（已修）—— 8/31 起半份文件被摺起來。
5. **`.next/` 有 11 個 macOS「檔名 2」重複檔**（已清）—— 讓 `tsc` 持續報錯。以 `git stash`
   確認非本次改動所致。
6. **33 份文件中 13 份漂移，4 份照做會造成損害**（已加警告標頭並整併）。
7. **`constitution-features/README.md` 三處失效**（refit 時修好）：查詢指令指向不存在的
   路徑、寫作規範指向不存在的 `/CLAUDE.md` 與 `/style_guide.md`、`mod-block` 欄位未記載。

**未處理**

8. **`docs/meetup-chats/` 未進版控** —— `.gitignore` 第 46 行刻意排除（內容含與會者姓名）。
   但 `design.md` 引用 `20260416 log.md` 的 46:12 作為反方意見決策的權威出處，該檔只存在
   於 captain 本機。硬碟損壞或他人 clone 時證據不存在。需另行決定保存方式。
9. **`AGENTS.md` 與 `design.md` 對「產線工程是否走 workflow」的敘述互相衝突**。
   `AGENTS.md` 說實作用 spacedock 流程；`design.md` 說產線施工不走那兩個 workflow
   （沿用 8/31 的 P3-5 決定）。refit 完成後此題有了實際意義，待 captain 裁示。

## Issues — Spacedock

**debrief 格式與 doc-only session 不合。** 格式以 entity／PR 為中心（Shipped 要 PR 連結、
Filed 要 entity），但這已是**連續第二次** `0 entity` 的 session，兩次都得手動改寫格式。
建議增加「workflow 外工作」的變體，或讓 Shipped／Filed 在無 entity 時優雅退化。

狀態：**尚未提報。** captain 尚未決定是否開 GitHub issue。

## Observations

- **三次事故的共同模式只有一個**：不該發生的事情發生了，而且**沒有發出任何聲音**。
  15 筆欄位錯位、`test test test`、寫好的摘要被覆蓋 —— 表面原因都不同，但沒有一次系統
  出過聲。本次又抓到兩件同型的（`d1` 虛構出處、`site_tldr` 斷點）。
  **四道防線的目的不是防止出錯，是出錯時會停下來講話。**

- **`015` 的失敗模式值得單獨記住**：設計文件裡的「範例」被當成內容寫進資料檔。
  這不是打錯字，是**文件與資料之間沒有邊界**。已在 refit 時寫成 `verify` 階段的具名檢查
  項目 —— 具名的檢查比籠統的叮嚀難跳過。

- **captain 的兩次反對都推翻了設計中的錯誤決定，而且是同一個模式** —— 設計把成本推給人：
  「大家記得不要在標題加註解」、「開個分頁讓人填反方意見」。兩次都改成由程式承擔。
  **這正是 design.md 不變式 #6（約定必須可被機器驗證）所禁止的事，而設計自己違反了兩次。**

- **我自己也犯了同一個錯。** 下午為了做一張圖新開 `current-vs-target.md`，造成產線有 4 份
  文件、3 處重複記載「還剩什麼沒做」。captain 問「真的需要這麼多文件嗎」才發現。
  已合併回 `design.md`。**寫文件的人最容易低估自己製造的重複。**

- **文件漂移不是假設。** 本次盤點證明：33 份文件無一標過查核日期，13 份已漂移，其中 4 份
  會造成實際損害。「記得更新日期」這種人為約定守不住 —— 這也是為什麼防漂移選了要有
  機器檢查的選項 B。

## Agent Testimonial

- Date: 2026-09-01
- Harness/runtime: Claude Code
- Model: Claude Opus 5
- Model version/build: unknown
- Session scale: 0 workflow entities touched; 2 workers dispatched（文件盤點）; 0 PRs

這次 Spacedock 大部分時間沒有參與。first-officer 開機在專案根目錄找不到 workflow 就停住
（規則正確 —— 不准亂搜檔案系統），但恢復完全靠 captain 給線索加上我手動逐層 `ls`。
真正該做的事是編輯文件，不是派工 —— Spacedock 自己的「最小充分機制」原則正確地告訴我
不要用 Spacedock。這對原則是好事，但也意味著整套派工／gate／worktree 機制在這場 session
的前八成時間裡是純開銷。

真正產生價值的不是框架，是它帶的證明紀律：**最便宜的、能失敗的檢查**。這條直接抓到四件事
—— 用現行程式裡真正的 `parseCSV` 而非等價重寫去驗 CSV、用 `git stash` 確認型別錯誤是既有
的、實際抓 JS bundle 確認假出處真的在線上、以及發現 `.gitignore` 排除了會議記錄因而不能
改名資料夾。沒有那個姿態，這四件我都會用「應該沒問題」帶過，而其中至少一件會出事。

`refit` 技能運作良好，分類策略（README 只給差異、mod 比版本、絕不自動覆寫）判斷正確 ——
README 裡確實有大量客製化，自動替換會毀掉 `verify` 那個本專案特有的階段。

摩擦點是 debrief 格式：連兩次 `0 entity` 都得手動改寫，這是真的不合身。

## What's Next

**工程（可立即開工，人工前置已清空）**

- `docs/content-pipeline/design.md` 第五節施工項目 7–10：改寫同步程式 → 移除 build 中的
  同步 → 完整同步後開 PR 對 diff → 封存 `SSOT_Editor`
- **先決**：待 captain 裁示此工程是否走 `constitution-features` workflow（見 Issues 第 9 項）

**captain 要做（卡在人）**

- `docs/health-check/TODO.md` 的 P0-2 — 釋字第 272 號法律內容錯誤，需法學背景者確認
- 同檔 P1-6 — 確認網站版貓頭鷹短評是否為 AI 生成

**已核准待實作**

- 文件防漂移檢查腳本（整併第 4 階段，選項 B）。**新增常設檢查應為獨立工作項目。**

**延後**

- 文件整併第 2 階段（重寫 3 份 ＋ 新寫 `operations.md`）—— 必須等產線改造完成，
  否則寫的是還沒實現的流程
- `design-assets` workflow 的 refit —— 要用再說
- `docs/constitution-features/` 的 7 張開著的票，`--next` 無可派工項目

**發布前**

- `docs/health-check/TODO.md` 的 P3-8 — 移除 `src/app/layout.tsx` 的 `noindex`
