---
session-date: 2026-08-31
sequence: 1
first-commit: 94c6356
last-commit: fe04178
duration: ~5h30m
---

# Session Debrief — 2026-08-31 #1

內容產線體檢與修復。起點是一個資料夾整理的問題，過程中發現網站 Track 1 有 60% 的資料損壞、一筆法律內容錯誤、測試字串對外顯示，並追出根因是產線的人工複製環節。本次工作**全部在 `constitution-features` workflow 之外進行** —— 未動任何 entity，9 個 commit 皆為資料修復與文件。

## Shipped

無 workflow entity 於本次 session 完成。本次工作未走 workflow 流程。

## Filed (backlog)

無新增 entity。

**但本次產出的施工項目與兩個既有 entity 重疊，下次應合併考量：**

- **019** `019-opposing-views-overview-page` — 今日確認 `opposing_views` 僅 d1 一筆且含佔位出處（`某學者`／`某大學法律系`），且 `sync-content.mjs` 根本不輸出該欄位。design.md 已規劃 `Track 2_opposing` 攤平分頁
- **031** `031-data-collection-process-doc` — 今日的 `docs/content-pipeline/design.md` 實質上已完成此 entity 的大部分內容

## Non-PR commits (workflow-only)

本次全部 9 個 commit 皆未走 PR，直接在分支上完成後 fast-forward 進 `main`：

- `94c6356` 搶救 `discussions.json` 中僅存於 repo 的人工內容 — 建立 `docs/content-rescue/`
- `3e1126e` 新增內容產線體檢報告與待辦清單 — 建立 `docs/health-check/`
- `8d3f8f9` 修復 Track 1 的 15 筆欄位錯位 — 資料來源採 `SSOT_收集區`，驗證 `0/25`
- `f4ae418` `chapter` 為空時不渲染標題 — `past/page.tsx`，`tsc --noEmit` 通過
- `ead9373` 內容產線設計定案 — 建立 `docs/content-pipeline/design.md`
- `8890d8d` 從 `SSOT_收集區` 補上 d2/d4/d6 的真實摘要
- `d397059` 暫時移除 tldr 該筆止血 — **後由 `fe04178` 取代為真修復**
- `3cdb4a0` 加入 noindex；依實際受眾修正緊急度判斷
- `fe04178` 自 `75df766` 還原被 sync 覆蓋的內容 — 取代 `d397059` 的暫時處置

## Decisions

**1. SSOT 定為 `SSOT_收集區`，`SSOT_Editor` 封存。**
依據為實測落差：42 vs 25 筆、h2 法律錯誤已改正 vs 未改正、h23/h24 已重寫 vs 舊版含錯字。`Editor` 自始至終是 `收集區` 的劣化副本。

**2. 把關改以 `status` 欄實現，不再以人工複製為閘門。**
captain 澄清編輯台職責為「只核可，不改內容」，故兩張表可合併。初步建議曾提出「廢除中間層」，經此澄清後修正 —— 中間層承載的把關功能必須保留，該廢除的只是「以複製作為把關手段」。

**3. 驗證失敗即中止，不部分寫入。**
本次唯一新增的常設檢查，已取得 captain 明確核可。理由：現行 sync 只印警告後繼續，系統從未拒絕過任何資料，這是 15 筆壞資料上線的直接原因。

**4. `opposing_views` 攤平為 `Track 2_opposing` 分頁。**
一列一觀點，以 `discussion_id` 分組還原巢狀結構。同時解決該資料目前完全不在編輯台視線內的問題。

**5. 預覽用 PR preview，不設獨立 staging。**
captain 即編輯台決策者且可使用 GitHub。PR preview 顯示「本次要發布的內容」，與核可決策對象一致。

**6. Track 1 的 15 筆採 `收集區` 現值，不從 json 反推。**
反推可完全機械化且不需外部資料，但只能還原「貼上當時」的版本。實測發現貼上後 `收集區` 仍持續被編輯（h24 的「遺屬**前**金」錯字已改正、h23/h24 敘述已重寫），反推會蓋掉這些成果。

**7. `vibe` 以 json 現值為準，不還原 4/16 版本。**
`vibe` 至少三代：試算表（最舊）→ 4/16（`75df766`）→ 4/30（`191ed44`，訊息註明 *per captain approval*）。json 現值為最新且經核可者。

**8. Vercel 環境變數停用，產線刻意斷開。**
`TRACK_1_CSV_URL`／`TRACK_2_CSV_URL` 改名加 `_disabled`。安全但不應長期維持。

## Issues — Workflow

**1. 🔴 `npm run build` 會執行 sync —— 壞資料自動上線的真正機制。**
`"build": "node scripts/sync-content.mjs && next build"`。Vercel 每次部署都跑 build，因此每次部署都重抓試算表，無人看過 diff、無人核可。不需要有人手動犯錯，只要推 code 觸發部署即可。已暫時緩解，根本解法為 design.md 不變式 #1。

**2. 🔴 Track 1 完全沒有把關。**
sync 的 Track 1 過濾條件為 `!row.status || approved`，而 `SSOT_Editor` 的 Track 1 無 `status` 欄，故 `!row.status` 恆為真，每列無條件放行。

**3. 🔴 產物檔被手改，且修正在四個月前已被沖掉一次。**
commit `75df766`（2026-04-16，entity `005-data-quality-cleanup`，訊息即為「remove placeholder data」）已完成同性質清理，其成果於 2026-05-02 前被一次 sync 沖回佔位與測試資料。**今日的修復若不回填 SSOT，將是第三次重演。** 此為 design.md 不變式 #1、#2 的實證。

**4. 🟡 編輯台無預覽介面。**
核可者只能看試算表儲存格，無法看見網站呈現。這是 `tldr` 的測試字串被標為 `Approved` 的根源。既有 `/preview` 路由為寫死假資料的視覺風格頁，非內容預覽。

**5. 🟡 兩張 SSOT 皆未分享給任何協作者。**
權限查詢結果為 `ipawei@gmail.com (owner)` 一人。命名為 SSOT 但無人可存取。唯一的協作方向相反：`憲法題庫/` 與 `Past and Future of the TCC` 的 owner 為他人。

**6. 🟡 「不會被 Google 查到」原為假設而非設定。**
查證發現無 `robots.txt`、無 `noindex`，且 metadata 含完整 OpenGraph／Twitter card（為分享而最佳化）。已加入 `robots: { index: false, follow: false }` 並驗證產生的 HTML。**發布前必須移除，見 TODO P3-8。**

**7. 🟡 `LaunchGate` 只有兩種狀態，非存取控制。**
「全開」或「僅開三頁」，無法做到夥伴看全部、公眾看部分。且為 client-side 判斷，頁面完整送達瀏覽器，屬視覺遮蔽。

**8. 🟢 `.env.local` 僅存於 captain 本機。**
協作者拿到 repo 也無法同步內容，產線實質上只有一人能操作。

## Issues — Spacedock

**1. debrief 的抽取邏輯假設工作發生在 `{dir}` 內。**
本次工作全部在 `docs/health-check/`、`docs/content-pipeline/`、`docs/content-rescue/`、`src/` —— 皆在 workflow 目錄之外。`git log -- {dir}` 回傳空集合，Shipped／Filed 兩節無內容可填。對「repo 中存在 workflow，但本次工作不走 workflow」的場景，現行抽取會漏掉整場 session。未提報為 GitHub issue（本次未經 captain 確認）。

**2. 子代理閒置未交付報告。**
兩個 `Explore` subagent 完成後回報 idle 但未附報告，`SendMessage` 索取後仍再次 idle。最終改為 FO 自行查證，反而更快。此為 Claude 平台的 agent 行為，非 spacedock 本身。未提報。

## Observations

**1. 症狀與病因的距離。**
captain 最初的問題是「三個資料夾如何整理以利多人協作」。若直接執行資料夾整理，症狀會再長回來 —— 因為重複的照片、`_備份` 檔名、兩張同名 SSOT，全都是產線缺乏定義的**產物**。花時間往上游追，是本次最有價值的判斷。

**2. 取樣會誤導，全量掃描才看得出規律。**
初期依試算表取樣，判斷欄位錯位是「逐列手誤累積」。改以機械掃描全量資料後，發現規律是 `h14` 以前全對、`h15` 以後全錯 —— 實為單次批次貼上事故。此修正已寫入體檢報告。

**3. 「沒跑到」不等於「通過」。**
一度回報 `tsc --noEmit` 通過，實際上 `node_modules` 不存在，檢查根本沒執行。補裝依賴後重跑才是真的通過。此類含糊是 CI 綠燈幻覺的來源。

**4. 未經查證的假設是本次每一個問題的共同來源。**
15 筆錯位、法律錯誤、test 字串上線、「不會被 Google 查到」—— 全部都是某個沒被驗證的前提。相對地，本次每一項結論都附可重跑的驗證指令，正是為了讓下一個人不必相信這份文件，而是能自己確認。

**5. 快取的東西修好了不會留住。**
`75df766` 的教訓：有人認真寫了內容、走了流程、commit 了，然後一次 sync 全部沖回佔位文字。**在產物上修東西，等於在沙上寫字。** 這比任何論證都更能說明為什麼機制要改。

**6. 舊 workflow 與本次工作重疊。**
`019`（opposing views）與 `031`（資料收集流程文件）的內容，已被今日的 design.md 大幅涵蓋。下次應先合併再排程，避免重工。workflow 本身為 `spacedock@0.9.5`，若要續用需先 refit 至 0.27。

## Agent Testimonial

- Date: 2026-08-31
- Harness/runtime: Claude Code
- Model: Claude Opus 5 (1M context)
- Model version/build: unknown
- Session scale: 0 workflow entities touched; 2 subagents dispatched; 0 PRs touched/merged

這場 session 幾乎沒有用到 Spacedock。FO boot 在專案根目錄找不到 workflow（正確行為 —— vault 根目錄本來就沒有），而真正的 workflow 藏在一個子專案的 `docs/` 底下，與今天要做的事無關。於是整場工作是在 Spacedock 之外進行的：查證、修資料、寫文件、commit。

誠實地說，這對本次任務是正確的。今天的工作是**診斷**，不是執行既定流程 —— 而診斷的路徑無法預先切成 stage。每一步都取決於上一步查到什麼：從資料夾問題查到 SSOT、從 SSOT 查到 sync 腳本、從 sync 查到 build 指令、從 build 查到四個月前的 commit。這種形狀硬要塞進 design → implement → verify，只會變成填表。

Spacedock 真正發揮作用的地方是**文件慣例與 debrief 本身**。`_debriefs/` 的存在讓我知道要去讀上一場 session 的 `last-commit`，也讓今天的成果有一個約定俗成的落點。commit 訊息寫得詳細，是因為知道會有下一場 session 來讀。這種「為未來的讀者留下狀態」的紀律，是這套工具灌輸的。

摩擦有兩處。其一，subagent 的往返是純浪費 —— 兩個 Explore agent 完成後只回報 idle、不交付報告，`SendMessage` 索取後依然如此，最後我自己 grep 三次就解決了原本派給它們的問題。事後看，這個任務根本不該 fan out：它不是平行的搜尋，而是一條需要連續推理的線索。其二，debrief skill 的抽取邏輯假設工作發生在 workflow 目錄內，對這種「repo 有 workflow 但本次不走它」的場景會整場漏掉，Shipped 與 Filed 兩節只能手動說明「不適用」。

## What's Next

### 🔔 下次 session 的第一件事

**1. `git push origin main`（captain 決定）**
本機 `main` 領先遠端 10 個 commit，今天所有修復都還沒推上去，**線上網站仍是舊的**。該次部署已預先驗證：sync 會 skip、退出碼 0、build 16 頁全過。工作夥伴會看到網站變化，可能需先告知。

**2. 回填 SSOT 的 10 格** → `docs/content-rescue/ssot-backfill.md`
`d7`/`d8`/`d9` 的 abstract、owl comment、vibe 各三格，加 `tldr` 的 abstract 一格。**只有 captain 能做**（Drive connector 無寫入儲存格能力）。這是解除「不能跑 sync」封鎖的前提，不做則今日成果將被第三次覆蓋。

### 卡住待人

- **P0-2** `h2` 釋字第272號法律錯誤 —— 待法學協作者確認。全清單最高優先，理由為受眾含法學者，專業信任的損害比公開與否更難補救
- **P1-2** 5 筆短評兩版並存（`d1` `d2` `d4` `d5` `d6`），需編輯台決定採用哪一套聲音。此決定會定調全站語氣
- **P3-1** Drive 資料夾分享 —— 需協作者名單與 email
- **P3-2** 協作者身分待確認：`huichieh@gmail.com` 是否為黃丞儀

### 產線施工（design.md 第七節，10 項）

前 6 項為試算表人工作業，後 4 項為工程。**第 1 項（回填）是全部的前提。**

目前產線處於**刻意斷開**狀態 —— 安全，但試算表任何更新都不會上線，不應長期維持。

### 既有 workflow backlog

`035` `034` 在 implement；`012` `019` `031` `016` `036` 在 design。其中 `019`、`031` 與今日成果重疊，應先合併再排程。workflow 為 `spacedock@0.9.5`，續用需 refit。
