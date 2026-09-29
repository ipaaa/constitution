---
session-date: 2026-09-29
sequence: 2
first-commit: ee4de7d
last-commit: 0672bc5
duration: 2026-09-29 約 16:40–22:20 UTC（約 5.5 小時）；範圍 ee4de7d..0672bc5 共 247 個 commit（含分支經 PR 合併進來的歷史）
---

# Session Debrief — 2026-09-29 #2

本輪合併 7 個 PR，把 `050` 的正式試算表部署收尾、`040` 核可綁定上線，並交付查核工具、門檻頁修正、`064` 階段一、同步重抓、頁尾連結。`045` 確認已由 `040` 達成而直接結案。session 結束時準備把 `00_Claude spacedock folder` 搬出 iCloud。

## Shipped
- **067** `systematic-chinese-content-legal-audit` — [#42](https://github.com/ipaaa/constitution/pull/42). 全站生成中文內容的系統性法律事實查核工具（M 層六規則、L／H 閱讀清單）。
- **040** `040-approval-content-version-binding` — [#43](https://github.com/ipaaa/constitution/pull/43). 核可綁定內容版本，修改後退回重審。
- **050** `050-ssot-approval-deployment` — [#44](https://github.com/ipaaa/constitution/pull/44). 正式 SSOT 部署 `040` 的審核欄位（S1–S9、AC-2 正式同步、AC-6）。
- **068** `threshold-page-voided-quorum-current` — [#45](https://github.com/ipaaa/constitution/pull/45). `/past/thresholds` 把 2025-12-19 起失效的 10 人 9 人門檻標為現行；並修正 `012` AC-7 (4) 的誤報。
- **071** `071-footer-links` — [#46](https://github.com/ipaaa/constitution/pull/46). 頁尾連結改指 `ipaaa/constitution`、移除 HackMD、新增 Email 回報。
- **064** `064-track2-case-ref-stance-columns` — [#47](https://github.com/ipaaa/constitution/pull/47). Track 2 `case_ref`／`stance` 兩欄，**僅階段一（程式）**；階段二至四待辦，見 What's Next。
- **070** `070-sync-csv-loading-snapshot` — [#48](https://github.com/ipaaa/constitution/pull/48). 同步遇到「載入中…」「#NAME?」未算完快照時有界重抓；入口判斷不再靜默 exit 0。
- **045** `045-pin-published-field-projection-tests` — 無 PR。design 實測 29 個欄位雙邊移除皆使測試失敗，目標已由 `040` 達成；captain 核准不經 implement 直接結案（`--force`，`381ff04`）。

## Filed (backlog)
- **068** `threshold-page-voided-quorum-current` — shipped same session.
- **069** `069-content-audit-followups` — `067` 封存後的舊路徑、P3-8 第二條上線條件、紀年正本、閱讀順序。design 完成，等 implement。
- **070** `070-sync-csv-loading-snapshot` — shipped same session.
- **071** `071-footer-links` — shipped same session.

## Non-PR commits (workflow-only)
流程與記帳上值得留意、未經 PR 的 commit：

- `34663fd` README `review` stage 新增「repo 外步驟之後重判文件影響」條款 — 出處 `054` design 1.2（E2），captain 核准。
- `be77290` `069` 實體檔改名加編號前綴 — captain 要求檔名一律帶編號；`070` 由其 design worker 於 `ed88e1b` 改名。
- `381ff04`、`eff31e3` `045` 以 `--force` 結案並封存 — merge 儀式對無程式可合併的票沒有路徑。
- `4ea4b28` 合併 origin/main（`050`）進本機 main，`operations.md` 衝突由 `070` design worker 依兩邊保留解決。
- `9913e1c`、`4fd0785`、`726b53b` 等 `state: mirror …` — worktree 內的 stage report 手動鏡像回 main，才能在 main 上推進狀態與準備 gate。

其餘 commit 已包含在上列 PR 中。

## Decisions
- `067`：全站紀年用西元，判決字號保留官方民國寫法；H 層閱讀清單由法學背景審閱者先讀三個公開頁面來源檔；`check` 綁進 `TODO.md` P3-8 作為**手動**上線條件，不接 CI（施工單 `069`）。
- `050`：captain 親自逐格測試 S7-b 30 格與 S7-d 18 格，全部符合，以親自確認取代 AC-4／AC-7 的逐格紀錄；S7 完成時間記為「不記得」。AC-6 指令改以 `pwd -P` 解析路徑（一次性授權）。
- `064`：立場由責任編輯填，captain 看同步 PR 的 diff；接受測試行數超出 design 容許範圍。
- `068`、`071`：captain 以「全部照建議」核准；頁面／頁尾的畫面目視（6px 引線、375px Email 長字串）**未明確回報結果**，紀錄已註明。
- `071`：原始碼 → `https://github.com/ipaaa/constitution`；不列 HackMD；Email 回報 → `constitution.owl@gmail.com`（captain 確認拼法）。核准 AC-4／AC-5／行數容許的補述改寫。
- `054`：README 條款採用；`AGENTS.md` (a)(b)(c) 照提案原文；候選規則「把關總覽跟著把關變動」不採用。`054` review 退回兩輪（verify V1/V2、review R1），第 2 輪通過；captain 已批准 review。
- `070`：重抓上限 8 次照用（實測曾用到第 8 次，約 265 秒），實際同步失敗再調高。另併入「入口判斷靜默 exit 0」缺陷。
- 搬家：`00_Claude spacedock folder` 整個搬出 iCloud 到 `/Users/ipa/Workspace/`（只在這台 Mac 使用，有 Time Machine 備份）。

## Issues — Workflow
- **iCloud 同步干擾**：`.next/types` 反覆出現「 2」「 3」重複檔造成 `tsc` TS2300 誤報；檔案時間被改動使 `git merge --abort`、`merge guard` 的封存 commit 失敗（exit 128），`git update-index --refresh` 後重試成功。→ 搬出 iCloud。
- **兩個 PR 合併後才出現的測試失敗**：`067`（恢復 `012` 測試執行）與 `040`（新測試在暫存目錄寫同名檔）各自通過，合在一起觸發 `012` AC-7 (4) 誤報。FO 合併前只模擬了衝突，沒有在合併結果上跑測試。已由 `068` 收窄守衛修正。**之後合併多個 PR 前，應在模擬合併樹上跑全套測試。**
- **PR 號碼造成的衝突**：開 PR 後在 main 寫 `pr:` 欄，與分支上的實體檔 frontmatter 衝突（#45、#46）。改為寫入後立刻同步到分支再推。
- **FO 疏失**：對 `045` 誤用 `merge guard` 加上 `mod-block: merge:pr-merge`，隨即清除。
- 多處 AC 在事後被發現「會失敗的改動」其實不會失敗（`067` AC-8、`068` AC-1/AC-2 對卡片失效句），均記為 Deferred risk。

## Issues — Spacedock
（captain 決定本次不回報 GitHub，僅在本地記錄。）
1. 安裝的 binary（0.28.0-pre2）不支援 `dispatch build --checklist-file -`（stdin），須寫入檔案。plugin 已是 pre3，binary 未更新。 — not filed
2. worktree 階段的 stage report 只在 worktree 副本時，main 上 `status --set` 因「缺 current-stage report」拒絕，`dispatch build --stamp` 只接受 canonical（main）路徑，須手動鏡像。 — not filed
3. `gate record --round` 需要 room 父目錄已存在、但來源檔不可放在 canonical room 位置，否則報「immutable round replay does not match the entity pointer」，訊息無法指出原因。 — not filed
4. 無程式可合併的票（目標已由他票達成）沒有正常結案路徑，只能 `status --set … --force`。 — not filed
5. `status --read --ac-scan` 認不出 `**AC-1（…` 這種無破折號的 AC 標題，回傳空陣列。 — not filed

## Observations
_(none recorded)_

## Agent Testimonial
- Date: 2026-09-29
- Harness/runtime: Claude Code
- Model: Claude Opus 5.5
- Model version/build: claude-opus-5-5
- Session scale: 13 tasks touched; about 45 workers dispatched; 7 PRs merged

Spacedock 的價值在於它把「誰可以做什麼」和「什麼算完成」固定下來：每張票的 stage report、驗收條件、gate 與 captain 核准都是可重跑、可追溯的紀錄，這讓一次跨 7 個 PR、十幾張票的 session 仍能在任何時點說清楚狀態，也讓 captain 的每個決定有落點。沒有它，我大概會更快，但會把驗證與決定散落在對話裡，換 session 就消失。代價也很明顯：worktree 與 main 之間的實體檔鏡像、frontmatter 對齊、round 記錄的檔案位置，佔去大量非產品工作，而且多次因 binary 與 skill 版本不一致或路徑規則不透明而需要試錯；每張票三道 fresh worker 的流程對一行文件修正偏重。另外，我自己的疏失（合併前沒跑測試、045 誤加 mod-block、PR 號碼衝突）都是流程沒有強制、需要 FO 自律的地方。

## What's Next
**建議下一個 session 先做（新位置 `/Users/ipa/Workspace/…`）：**
1. `054`：review 已批准、等合併。先把最新 main 合併進分支（與 `050` 在 `INDEX.md`、`design.md` 修訂紀錄的衝突保留兩邊），並把 `064` 的三個新同步中止條件與 `tests/track2-case-ref-stance.test.mjs` 補進 `gatekeeping.md` 第 4、5 章（:117）——這是「後合併者更新總覽」的約定（V6／R5）。改動後需重跑該部分的審查，再給 captain 看 PR 草稿。
2. `069`：implement。本 session 追加的範圍：`067`、`068` 封存檔加編號前綴（檔名與 room 資料夾）並修正所有引用；`content-audit check` 的 M6 目前 16 筆（`050`、`064`、`068`、`070` 等封存所致）全部處理；`070` verify F2（`operations.md` 指向 `070` 的連結封存後失效）；`TODO.md` P1-10 補 `068` 的 PR 號碼（#45）；`INDEX.md` 中 `TODO.md` 列的最後查核日期。
3. **開一張票追蹤 `064` 階段二至四**：captain 依 `operations.md`〈Track 2 加兩欄〉加欄 → 責任編輯填值並重新核可 → captain 授權同步、看 PR diff。承接延後的 AC-1、AC-2(b)、AC-11、AC-12（指令已寫在 `064` 票內）。`019` 等這張票。

**captain 待決：**
- 頁尾：「© G0V CONTRIBUTORS」署名；repo 無 LICENSE 卻自稱「開源」；快速導覽缺意見懶人包、關於、測驗三頁。
- d3（d2 的續篇）可走新核可流程上線；上線前確認它當初 `status` 留空的原因。

**其他：**
- `20 Personal Writing/aboutme` 有 12 個 commit 未推；多數 repo 沒有遠端備份，搬出 iCloud 後只剩 Time Machine。
- spacedock binary 仍是 0.28.0-pre2，建議更新到與 plugin 相同的 pre3。
- `/past` 整頁內容 captain 首次看到，除 `068` 修正外未經人工審閱（在 `067` 的 H 層閱讀清單內）。
