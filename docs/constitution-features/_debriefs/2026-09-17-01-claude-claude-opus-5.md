---
session-date: 2026-09-17
sequence: 1
first-commit: e111c55
last-commit: 332c27a
duration: ~14 天日曆跨度（2026-09-03 12:35 – 2026-09-17 13:39），中間數日空白，實際工作時間遠少於此
---

# Session Debrief — 2026-09-17 #1

本節橫跨兩週，主軸是**把內容把關機制從「有票」推到「有證據」**。前半是三類把關機制的體檢與開票，後半是 041 與 044 各自走完全程。14 張新票裡，10 張來自體檢發現的無票缺口。

## Shipped

- **041** `041-correct-stale-pipeline-docs` — [#35](https://github.com/ipaaa/constitution/pull/35)。三份協作者會照著操作的文件，描述的產線狀態與實際不符；經 captain 裁決由 7 處擴充為 23 處，全部以追加補述更正、原句一字未改。

## Filed (backlog)

- **044** `044-approval-permission-two-account-probe` — 隔離測試表兩帳號 probe，補齊 feature 040 缺少的試算表端證據。**本節執行完畢，PR #36 待合併。**
- **045** `045-pin-published-field-projection-tests` — 測試以 `PUBLISHED_FIELDS` 生成案例，欄位離開投影時案例一併消失、覆蓋率靜默縮小。已被 040 實質取代，captain 裁決留置待 046 一併處理。
- **046** `046-worktree-state-divergence` — worktree 與 main 的狀態分歧，使 `ready_gates` 永遠為空、main 上的 workflow 狀態失真。
- **047** `047-content-freeze` — 區分「可持續更新」與「審定後不得再自動變動」兩類內容。
- **048** `048-homepage-build-date` — 首頁 `new Date()` 位於 server component，build 當下烤進 HTML，讀者會誤讀為內容更新日。
- **049** `049-opinion-lazybag-content-provenance` — 12 位真實大法官姓名在線上，檔頭卻聲稱不存任何姓名；14 位具名立場零出處。
- **050** `050-ssot-approval-deployment` — 正式 SSOT 建八個審核欄位，040 合併的硬前置。
- **051** `051-content-provenance-marking` — 內容來源標記欄位與可重跑的來源掃描。
- **052** `052-contributors-placeholder` — `/about` 的貢獻者名單六筆全是佔位資料。
- **053** `053-p1-8-non-ssot-content-disposition` — 完成 `docs/health-check/TODO.md` 的 P1-8 盤點的逐檔處置決定。
- **054** `054-gatekeeping-overview` — 把關現況總覽，**主要交付是讓它不過時的更新機制**。
- **055** `055-residual-stale-doc-spots` — feature 041 未涵蓋的殘留過時處。
- **056** `056-pre-launch-checklist` — 上線前檢查清單，收攏六個原本無票的破口。
- **057** `057-preserve-probe-raw-log` — 把 044 probe 的原始工作記錄併入 repo。

## Non-PR commits (workflow-only)

不屬於任何 PR、值得留痕的 workflow 層改動：

- `38aaa1e` **移除 workflow README 已失效的 `npm run build` 禁令** — `implement` stage 定義會由 `dispatch show-stage-def` 原封不動發給每個 worker。feature 040 的 implement 曾據此 SKIP `npm run build`，而同一張票的 verify 與 review 都實際執行了它，同一條規則被不一致地執行。FO 依流程文件寫入權限直接修訂並追記修訂紀錄。
- `fa9de04` 歸檔 2026-09-03 學者編輯上稿流程稽核記錄。
- `4503319` `645f04a` `f412393` `1be888c` `ac81de2` — feature 040 的 design 階段前置，以及 workflow README 新增文件影響追蹤要求。

041 的 13 筆 stage report 與修正 commit 已隨 PR #35 合併，不在此列。其餘 36 筆為 `state:` / `dispatch:` / `advance:` 例行狀態轉換，已省略。

## Decisions

captain 於本節作成的主要裁決：

1. **040 的 verify gate 判 REJECTED 後選方案 B** — AC-2／AC-4 所需的兩帳號隔離表 probe 移出 040 另開 feature 044，讓 040 以 repo 端 fail-closed 同步閘門先落地。
2. **040 的 review gate 判 hold** — 交付品質達標，但合併有未完成的硬前置（正式 SSOT 建八欄）。恢復條件寫入 resolution。
3. **041 的範圍由 7 處擴充為 23 處** — 因 041 把 `data-collection-guide.md` 的查核日推進卻留下三句仍錯的敘述，正是該票 Problem 親筆點名的「查核日期新而內容錯」。
4. **044 是 050 的硬前置（選項 A）** — 準備隔離測試表與第二個 Google 帳號，先跑 probe，不在正式表上試錯。
5. **P6（trigger 寫入路徑）跳過** — 兩種結果的結論相同，執行的唯一產出是把設計文件的問號換成事實記錄。測試表保留，補做路徑已記錄。
6. **044 步驟 13（P7）納入** — 驗證 feature 050 步驟 6 的兩層保護分法，該分法此前從未被驗證。
7. **接受 044 的記錄粒度低於 AC 原文**（AC-2／AC-3／AC-7 為部分達成），行為結論不受影響。**AC-3 的兩項繞道不補測**，屬 feature 043 範圍。
8. **044 現在合併（選項 A）** — 押後合併會使 050 無法派工、卡住整條相依鏈；`validateApprovalBinding` 的引用在 040 合併後自動可解析。
9. **045 留置不封存（選項 C）** — 避免製造第二個「未做就被封存、狀態與位置矛盾」的 023。
10. **gatekeeping.md 開票但必須設計更新機制** — 新增 evergreen 文件等於新增一個會過時的東西。

## Issues — Workflow

- **`npx tsc --noEmit` 曾因 `.next/` 的 29 個 macOS 同步重複檔（`* 2.*`）失敗**，與 `src/` 無關。專案的主要驗證指令壞掉期間，任何 stage 宣稱「tsc 通過」都不可信，或會因無關原因被判失敗。已清除，`tsc` 恢復 exit 0。
- **`concurrency: 2` 使 22 張票長期顯示 `concurrency-full`**。040 與 044 各占一個名額，導致 050 無法派工——這是 044 選擇「現在合併」的直接理由。
- **repo 內既有文件含正式 SSOT 網址與帳號 email**（`docs/content-rescue/ssot-backfill.md:27`、`docs/health-check/TODO.md`、`docs/health-check/2026-08-31-content-pipeline.md`）。與 044 剛建立的證據文件規則衝突。那幾份為 `record` 狀態不改寫，**尚未開票**。

## Issues — Spacedock

- **`gate prepare` 留下孤兒鎖** — not filed。`gate record` 被 `concurrent gate writer holds ….gates.lock` 拒絕。查證：鎖建立於 `13:50:01`，同一次 prepare 的 state commit 於 `13:50:02`；`lsof` 顯示無任何程序持有；`gate --help` 與 `doctor` 皆無 stale-lock 處理指令。手動移除備份後重跑成功。
- **worktree 狀態分歧使 `ready_gates` 永遠為空** — not filed（已開成本專案的 feature 046）。040 的 verify gate 在 2026-09-03 已 `awaiting-captain`，但從專案根目錄 boot 回報 `ready_gates: []`，該 gate 因此無人聞問擺了一整天。
- **`dispatch build --stamp` 與 worktree 的 canonical 路徑互斥** — not filed（同 046）。狀態必須與 stage report 同處 worktree 副本（否則 `status --set` 因「missing current-stage report」被拒），而 `--stamp` 只接受專案根目錄的 canonical 路徑。本節三次派工都只能改走不帶 `--stamp` 的路徑。
- **`gate record --consume` 的授權未自動提交** — not filed。041 核可後，`gate record` 寫檔但未 commit；推送的 candidate 早於後續的 state commit，導致合併進 main 的版本不含終端授權，`merge guard` 拒絕終端化（`entity carries no binding pending terminal-target approval`）。以 cherry-pick 將該 state commit 補進 main 後解決。

## Observations

_(none recorded)_

## Agent Testimonial

- Date: 2026-09-17
- Harness/runtime: Claude Code
- Model: Claude Opus 5
- Model version/build: unknown
- Session scale: 17 tasks touched; ~22 workers dispatched; 2 PRs touched/merged

這一節最值得記的一件事，是**獨立複核抓到的錯是我的，不是 worker 的**。

044 的 verify cycle 1 判 REJECTED，理由是證據文件宣稱「三個 `approved_*` 欄經實測不變」，而原始記錄只有兩欄、且 P3 完全沒觀察。那不是 worker 臆測——**是我在引導 captain 做 probe 時只問了兩欄，寫文件時把 AC 的「要求三欄」誤當成「已觀察三欄」。** 同樣形狀在 041 的 cycle 2 也出現過：那張修「文件過時」的票，自己在 evergreen 文件裡埋了一個會漂移的票況快照，而 reviewer 是去跑了更正段自附的指令才發現的。兩次都是寫文件的人相信了自己該驗證的東西。沒有那一層，兩個錯都會留在永久文件裡。

摩擦也很具體。**cycle 的尾巴儀式與改動量嚴重失衡**：041 的最後一輪修的是三處導覽行號，044 的最後一輪修的是一個數字（五→七）與一處日期歸屬。每一輪仍然是完整的 dispatch → 等待 → 讀報告 → 組回饋封包 → 重派，而且 entity 檔案長到約 900 行，每輪都要重新定位。`--checklist` 與 `--ac-scan` 的結構化讀取幫了大忙——沒有它們我會把大量 context 花在重讀同一份報告上——但沒有一個更輕的檔位可以選：一個三行字的修正和一個 300 行的實作走完全一樣的流程。

另一項真實成本是 **worktree 與 canonical 路徑的互斥**。我在本節撞了三次，每次都要重新判斷該用哪條路徑、哪個指令會被哪個 guard 擋下。guard 本身都是對的（`dirty completion artifact`、`missing current-stage report`、`not the canonical entity`——三個都在正確的時機救了我），但它們合起來構成一個沒有正解的路徑，只能繞。這已開成 046。

還有一段 Spacedock 幫不上忙、也不該幫的：044 的 probe 執行本身。那十幾個步驟是我在對話裡一步步帶 captain 操作 Google 試算表——貼上會吃換行、`onOpen` 混在執行清單裡、execution ID 在現行介面根本不存在。票裡的程序寫得很好，但真實世界的介面跟程序之間永遠有落差，而**那個落差只能靠人撞出來**。captain 發現「保護範圍只有兩欄真的生效」那一刻，才是這張票最有價值的產出——而它不是任何檢查抓到的，是他自己去點了一下。

最後一點關於這種長 session：本節橫跨兩週、中間數日空白。每次 captain 回來，我都能從 workflow 的狀態檔重建現場，而不是靠記憶或猜測。這是 Spacedock 最不起眼但最實際的價值——**它讓「兩週前那件事做到哪裡」變成一個可以查的問題，而不是一個要重新推導的問題。** 相對地，我自己在本節也講過至少兩次有信心但錯誤的判斷（誤讀 Worktree Ownership 契約、把 050↔040 的相依說成硬死結），兩次都是後來被二進位或實測推翻。工具擋得住 worker 的錯，擋不住 FO 的錯——那還是得靠複核。

## What's Next

### 等 captain 合併

- **044** — PR #36。合併後釋出併發名額，feature 050 才能派工。

### 關鍵路徑（合併後）

- **050** `ssot-approval-deployment`（0.95）— runbook 已就緒（步驟 0–9，每步標明 captain 或工程）。**多數步驟是 captain 手動操作正式試算表。** 本節的 probe 已為其驗證兩件事：責任編輯不必是擁有者即可核可；保護範圍必須以非擁有者帳號逐格實測驗收，不得以設定畫面為準。
- **040** — gate hold 中，等 050 完成。程式已完成、六項 AC 全 PASSED。

### 卡在人，不是卡在程式

- **042** `sanitize-sheet-html`、**043** `sync-row-drop-threshold` — captain 標記「先不要 dispatch」，待確認脈絡。
- **049**、**052**、**053** — 涉及內容判斷，部分需法學背景者。
- `docs/health-check/TODO.md` 的 **P0-2**（釋字第 272 號法律內容錯誤）、**P0-6**（h28 掛了 h14 的標題）。
- **`requiredForRuling: 10` 的法律正確性** — 該修法已於 2025-12 被判部分違憲，數字仍渲染於三處。features `021`／`026` 兩票都記過此疑慮，兩票都沒解。

### 體檢查出、尚未開票

- repo 內既有文件含正式 SSOT 網址與 email，與 044 建立的規則衝突。
- 上線前必須確認 **Vercel 的 Build Command 與 `NEXT_PUBLIC_PUBLIC_MODE`** 實際值（repo 內查不到，只有 captain 能開 dashboard）。

### 其他 backlog

- **056** 上線前檢查清單（0.85）、**055** 殘留過時處（0.4）、**057** 原始記錄入庫（0.3）
- **046** workflow 狀態分歧、**047** 內容凍結、**051** 來源標記、**054** 把關總覽與更新機制
- **012**（0.8）、**019**（0.7）、**031**（0.7）、**039**（0.7）、**016**（0.65）、**036**（0.5）、**045**（留置）、**048**
