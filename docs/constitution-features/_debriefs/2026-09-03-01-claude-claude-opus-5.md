---
session-date: 2026-09-03
sequence: 1
first-commit: 56a957b
last-commit: a0710be
duration: ~27h40m（2026-09-02 08:39 – 2026-09-03 12:19，跨兩日含隔夜）
---

# Session Debrief — 2026-09-03 #1

這一節是內容產線的施工節。上一節把產線的問題查清楚並寫成文件，這一節把它修好並實際跑通。
兩張票走完 workflow 全程（037 同步程式改寫、038 移除 AI 生成的跨軌道連結），三個 PR 合併，
兩張殭屍票收尾封存，兩張新票入列。

本節最重要的發現：**同步程式一直在讀錯的試算表。** 四個月來 captain 在
`SSOT_收集區` 做的修正，從來沒有進到網站。這件事沒有任何機制會發現，是 037 的
verify 階段查出來的。

---

## Shipped

- **037** `037-sync-rewrite-strict-validation` — [#32](https://github.com/ipaaa/constitution/pull/32) + [#33](https://github.com/ipaaa/constitution/pull/33)（首次正式同步的內容）。把 `scripts/sync-content.mjs` 從 180 行改寫為 729 行的嚴格把關版：欄位標題採最長前綴比對、核可 0 筆時中止而非靜默清空、`id` 跨分頁重複時指名中止、並把同步從 `npm run build` 移出。verdict PASSED，score 1.0。
- **038** `038-remove-ai-generated-cross-track-links` — [#34](https://github.com/ipaaa/constitution/pull/34)。移除全站 AI 生成的跨軌道連結（`src/data/cross-track-links.ts`、`src/components/CrossTrackLinks.tsx` 及其呼叫端，5 檔 −352 行）。該資料沒有 SSOT 來源，且鍵值 `c02`–`c31` 指向已被 `46a23e6` 取代的合成案件，39 個真實案件全部取得 0 筆連結。verdict PASSED，score 0.6。
- **034** `034-owl-placement-implement` — [#30](https://github.com/ipaaa/constitution/pull/30)。貓頭鷹法官全站視覺融入。程式碼早已於前一節合併，本節僅補完報告與封存。verdict PASSED，score 0.8。
- **035** `035-ux-audit-must-fix` — [#31](https://github.com/ipaaa/constitution/pull/31)。UX 審計上線前必修項。同上，本節僅補完報告與封存。verdict PASSED，score 0.9。

## Filed (backlog)

- **037** `037-sync-rewrite-strict-validation` — 本節開票、本節出貨。
- **038** `038-remove-ai-generated-cross-track-links` — 本節開票、本節出貨。
- **039** `039-render-check-tool` — 建立可重跑的渲染檢查工具，讓「改動後頁面是否仍正常」有機械證據。**它不是 AI 生成內容的偵測工具**，這一點必須寫進工具說明。score 0.7。
- **040** `approval-content-version-binding` — captain 開票。讓 SSOT 的核可綁定被核可的內容版本；核可後只要發布欄位被修改，該列必須顯示 `Needs review`，同步程式不得沿用舊核可。score 0.95（本節最高分待辦）。

## Non-PR commits (workflow-only)

不屬於任何 PR 的 workflow 提交：

- `56a957b` 上一節的 debrief。
- `29b85a5` 移除 `data-collection-guide.md` 的 T1／T2 章節（教人手改 `src/data/*.json`，已與新產線衝突）；031 的範圍同步縮減為 T3。
- `5867777` 037 檔名改為 `037-…`，對齊本 workflow 的編號慣例。
- `06d775b` + `f93aa55` 併行上限暫由 2 調為 3，收尾後改回 2。
- `67fbb5d`、`9308c34`、`2c1ffa7`、`0480d4b`、`cdbcd80` 034/035 補完成報告 —— **`merge guard` 連續退回四次**（缺報告 → 缺標準格式清單 → 清單位置錯誤 → 缺證據行 → 缺 `### Summary`）。四次中有三次的成因是 FO 的簡報不完整，不是 guard 過嚴。
- `be37fac`、`c52773b` 034/035 封存（merge guard 放行）。
- `5c9410b` feedback(037) cycle 1；`7f1b55a` feedback(038) cycle 1。
- `5114eb0` **[reverted]** 038 的 ensign 自行提交常設渲染檢查腳本。
- `fd57bd8` Revert 上一筆 —— 常設檢查屬「最後手段」，需 captain 明確核准並自成一票。
- `07f459a` 記錄該腳本的去向與 FO 的面積裁示，並將需求轉為 039。
- `ac6e6ef` 038 分支併入 main 的 `4f2b705`（seed 039），消除落後造成的假 diff。
- `66a1ce5` 解除 `npm run build` 禁令（PR #32 已把 sync 移出 build，實測前後 `src/data/*.json` 的 sha256 相同）；F3 規則寫入 `design.md`；施工項目 7／8 標記完成。
- `ea06deb` 施工項目 10 完成 —— `SSOT_Editor` 已封存。
- `e06e841` 記錄首次正式同步的五項發現，重排 `docs/health-check/TODO.md` 的待辦順序。
- `3a476d2`、`9d1ff4b`、`49e307d`、`32d0a7e` 新增 `docs/health-check/TODO.md` 的 P1-8（盤點全站無 SSOT 來源的內容），以及兩次修正 —— 首版的驗證指令跳脫字元寫錯，導致表格內的計數也是錯的。
- `23b29a4` 修正 `docs/health-check/TODO.md` 的表格縮排，37 行。
- `a0710be` 038 合併後的收尾：P1-7 結案、P1-8 更新、`docs/INDEX.md` 日期修正。

其餘提交已收在上方三個 PR 內。

## Decisions

captain 於本節做出的決定：

1. **內容產線的施工改走 `constitution-features` workflow**，推翻 8/31「暫不進 workflow」的舊決定。舊決定的前提是 workflow 版本過舊，已由 9/2 的 refit 解除。
2. **維運型工程交 subagent 執行，FO 把關。** captain 不逐行看程式碼，只在 gate 上做決定。
3. **037 的 F3 規則一致化寫入 `design.md`** —— 原本只寫給 `site_tldr` 的「核可 0 筆即中止」規則，擴及 Track 1 與 Track 2。
4. **不要現有的 AI 生成跨軌道連結**（038）。之後是否重做另議，已在票上標注「需要討論」。
5. **常設渲染檢查工具另開一票（039）**，不夾帶在 038 內。
6. **`h2`（釋字 272）不上線**，等法學背景者確認；`h28` 因標題待補而暫留。
7. **溝通規則兩條**（已寫入 `AGENTS.md`）：不預設 captain 懂技術，要 ELI5 並給選項與影響；引用編號項目必須指明是哪一份文件的編號。

## Issues — Workflow

- **`040` 的檔名不符本 workflow 慣例。** 現為 `approval-content-version-binding.md`，其餘票為 `NNN-slug.md`。`spacedock new` 寫出的是扁平 `<slug>.md`，編號只進 frontmatter。下一節開工前改名對齊。
- **`.env.local` 沒有任何檢查機制。** F1（讀錯試算表）之所以能存在四個月，是因為沒有任何機制驗證來源網址指向正確的文件。037 已加入「發布金鑰數量異常即出聲」的邏輯，但 Vercel 端的環境變數仍無對應檢查。
- **`docs/health-check/TODO.md` 的 markdown 格式反覆跑掉。** 本節修過兩次（`23b29a4` 的 37 行縮排、以及更早的 `<details>` 未閉合）。該檔已長到人工維護容易出錯的程度。
- **`design-assets` workflow 仍為 spacedock 0.9.5**，使用前需先 refit。

## Issues — Spacedock

- **debrief skill 的 PR 連結來源寫錯。** Phase 3 Step 2 指示從 spacedock plugin manifest 的 `repository` 欄推導 PR 網址，但那是 spacedock 自己的 repo。工作流程的 PR 在使用者專案的 repo（本例為 `ipaaa/constitution`）。照字面執行會產生指向錯誤 repo 的死連結。plugin manifest 應只用於 Phase 3 Step 4 的 spacedock issue 歸檔。**未歸檔**（captain 未指示）。
- **`dispatch build --stamp` 的路徑語意不直覺。** 需傳專案根目錄的路徑，helper 內部自行推導 worktree；傳 worktree 路徑會失敗。且 worktree 已存在時會嘗試巢狀建立而失敗。**未歸檔**。
- **`state commit` 只接受完整 slug，不接受數字 id。** 與 `status --read` 可用數字 id 的行為不一致。**未歸檔**。

## Observations

captain 於本節結束時的判斷（原話：「網站內容跟 SSOT 不一樣，沒有全面把關生成內容，
也沒有區分哪些生成內容是要固定版本不能再變動的」）。三件事：

**一、網站內容跟 SSOT 不一樣。**
這是本節最先浮現、也最根本的問題。captain 在 local preview 上直接看出網站顯示的值
與 `SSOT_收集區` 對不上，才引出 F1（同步程式讀錯試算表）。
教訓：**沒有任何機制在比對「網站上顯示的」與「SSOT 裡寫的」是否一致。**
037 修好了同步的正確性，但「同步之後兩邊是否真的一樣」仍然只能靠人眼看。

**二、沒有全面把關生成內容。**
AI 生成的內容可以在沒有任何人核可的情況下上線，而且上線之後不會被標記出來。
本節已知兩起：`015` 的「某學者，某大學法律系」佔位資料公開顯示四個月；
`006` 的跨軌道連結全站 39 個案件都取得 0 筆連結，但 review 當時判定 MET。
兩起都不是「程式壞了」，是**沒有人在檢查內容從哪裡來**。
`docs/health-check/TODO.md` 的 P1-8（盤點全站無 SSOT 來源的內容）是這件事的第一步，尚未執行。

**三、沒有區分哪些生成內容是要固定版本、不能再變動的。**
這是本節新提出的觀點，目前**沒有任何票涵蓋它**。
現況是所有內容一律等價：每次同步都可能被改寫。但實際上有兩類內容性質不同 ——
一類可以持續更新（例如摘要、短評），另一類一旦經人審定就不該再自動變動
（例如法律條文引述、判決要旨、已對外發布過的敘述）。
現在沒有欄位、沒有規則、也沒有機制去表達這個差別。
`040` 處理的是「核可後被改動要退回重審」，方向相鄰但不相同：
040 管的是**核可失效**，這一項管的是**內容凍結**。兩者需要分開設計。

## Agent Testimonial

- Date: 2026-09-03
- Harness/runtime: Claude Code
- Model: claude-opus-5
- Model version/build: unknown
- Session scale: 6 tasks touched; 6 workers dispatched; 3 PRs touched/merged

Spacedock 在這一節的價值幾乎全部來自「它強迫我把判斷交給別人複核」。

最具體的例子：037 的 verify 階段查出來源網址指向錯誤的試算表。那不是我發現的。
我當時的注意力在程式邏輯上，而 verify 因為被要求實跑而撞上了資料本身。同一節裡，
037 的 review 階段推翻了我「表格差異已降到 3 列」的說法 —— 我只比對了 `content` 欄，
它比對了全部欄位，實際是 5 列 6 個欄位差異。038 的 review 也抓到我漏掉的一行過時文件。
如果沒有這個強制的獨立複核層，這三件事都會以我的版本結案。

摩擦也真實存在。`merge guard` 為了 034/035 連退四次，每一次都要重新組報告、重新提交、
重新過 guard。事後看，四次中有三次的成因是我的簡報不完整 —— guard 是對的，我是錯的 ——
但當下那個迴圈很消耗，而且錯誤訊息只告訴我「缺什麼」，沒告訴我「格式長什麼樣」。
如果 guard 能直接吐出一份可填的範本，那四輪會壓成一輪。

另一個成本是儀式與工作量的比例。038 的實際改動是刪掉 5 個檔案共 352 行，
但它走完了 implement → verify → review → feedback cycle → gate → PR → merge guard → archive。
對這個規模，流程本身的字數遠超過改動本身。我不認為這是錯的 —— 正是這個流程讓 review
抓到那行過時文件 —— 但它確實不便宜，而且沒有一個更輕的檔位可以選。

最後一項：`fo-write-core` 的邊界在這一節救過我一次。038 的 ensign 自行提交了一支常設
檢查腳本，我依「常設檢查是最後手段、需 captain 核准、正常應自成一票」的規則把它 revert
並轉為 039。若沒有那條白紙黑字的規則，我大概會讓它留下 —— 它看起來完全合理。
邊界的價值在於它在「看起來合理」的時候仍然生效。

## What's Next

### 建議下一節先做

- **README 全面更新** —— captain 已於另一個 session 與另一位 FO 討論此事。**下一節應從那個脈絡接手，本節的結論僅作為輸入。** 這是 captain 指定本節收束的原因。
- **`040`** `approval-content-version-binding`（score 0.95，design → implement，可派工）。核可與內容版本綁定，是產線剩下最大的洞。開工前先把檔名改為 `040-approval-content-version-binding.md`。

### 尚無票、不可遺漏

- **內容凍結：區分哪些內容審定後不得再自動變動。** 出自本節 Observations 第三項。
  現況所有內容等價，每次同步都可能被改寫。需要一個欄位或規則來標記「此列已定稿，
  同步不得覆寫」。**與 `040` 不同** —— 040 管核可失效，這一項管內容凍結。
  下一節須先與 captain 確認範圍再開票。

### 卡在人，不是卡在程式

- `docs/health-check/TODO.md` 的 **P0-2** —— 釋字第 272 號的法律內容錯誤，需法學背景者確認。`h2` 已因此不上線。
- 同檔 **P0-6** —— `h28` 的正確標題，目前因 `status` 空白而暫留。
- 同檔 **P1-6** —— 確認網站版貓頭鷹短評是否為 AI 生成。
- 同檔 **P2-11** —— `/past` 的長標題需在真實瀏覽器中確認（7 則超過 30 字，最長 59 字）。本節唯一未經驗證的項目。

### 其他待辦

- **`039`** `039-render-check-tool`（0.7）—— 常設渲染檢查工具。037／038 各自重造過一次臨時版。
- **`012`**（0.8）門檻與案件數量關聯視覺化、**`019`**（0.7）不同意見總覽頁、**`031`**（0.7）T3 資料收集流程說明、**`016`**（0.65）案件關鍵字分類、**`036`**（0.5）UX 審計後續優化。
- `docs/health-check/TODO.md` 的 **P1-8** —— 盤點全站無 SSOT 來源的內容。038 已消掉其中一項（跨軌道連結），其餘未盤。
- 同檔 **P2-10** —— `dangerouslySetInnerHTML` 的內容消毒。必須先於 P3-1（分享功能）。
- 同檔 **P3-8** —— 正式發布前移除 `noindex`。
- `docs/INDEX.md` 的文件整併 **階段 2**（改寫 3 份文件）與 **階段 4**（drift-check 腳本，captain 已核可選項 B）。
- `docs/design-assets` workflow refit（仍為 spacedock 0.9.5）。
