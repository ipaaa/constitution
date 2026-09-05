---
id: 041
title: 修正內容產線文件與實際行為不符之處
status: implement
source: captain 2026-09-03
started: 2026-09-05T00:05:49Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-041-correct-stale-pipeline-docs
issue:
pr:
mod-block:
---

三份現行文件描述的產線狀態與實際行為不符，共七處。試算表編輯權限已開放給協作者，他們會依這些文件判斷什麼可做、什麼不可做。本 feature 讓文件敘述與實際行為一致，並保留原文脈絡。

## Problem

2026-09-02 與 09-03 有三項改動已完成並生效：同步程式改為嚴格把關（PR #32）、同步移出 build、首次正式同步完成（PR #33）。captain 另於 2026-09-03 確認 `status` 欄保護範圍已設定完成。

三份文件仍描述改動前的狀態。已查證的七處：

| # | 位置 | 文件現在說 | 實際狀態 |
|---|---|---|---|
| 1 | `docs/content-pipeline/design.md:42` | 產線現在是刻意斷開的 | 已接回 |
| 2 | `docs/content-pipeline/design.md:398-400` | 同步刻意斷開，環境變數加 `_disabled` | 已接回 |
| 3 | `docs/content-pipeline/design.md:386` | 施工項目 4 保護範圍 ⏸ 等有協作者再設 | 已完成 |
| 4 | `docs/content-pipeline/design.md:229` | 「投稿者 status 欄鎖住」寫成設計目標 | 已是現況 |
| 5 | `docs/health-check/TODO.md:510-542` | P2-1：Track 1 過濾條件沒改，空白放行 | PR #32 已改嚴格模式 |
| 6 | `docs/health-check/TODO.md:26-41` | `npm run build` 會跑 sync，禁令尚未解除 | 2026-09-02 已解除 |
| 7 | `docs/content-pipeline/data-collection-guide.md:23-24` | 產線改造尚未完成，不要執行 `sync-content` 或 `build` | 施工項目 7 已完成；`build` 禁令已解除 |

第 7 處的狀態是 `evergreen`、最後查核日是 2026-09-03，內容卻已不成立。查核日期新而內容錯，比沒有查核日期更容易誤導。

**為什麼現在要修**：`AGENTS.md` 明載「過時的 evergreen 文件是危險的」。第 5、6 處會讓讀者以為 Track 1 沒有把關、`build` 仍會覆蓋資料；第 1、2 處會讓讀者以為試算表的更新不會上線。三者都會讓新編輯對**真正還開著的兩個缺口**失去警覺：內容未淨化即以 HTML 渲染，以及刪列不觸發任何檢查。

## Proposed approach

**在錯誤敘述的原地加註，並在文件既有的修訂區追記一則。不刪改原句。**

`docs/content-pipeline/data-collection-guide.md` 已有此體例可循（見該檔 `:122`、`:164-165`、`:176-179`）：原句保留，其下以 `⚠️` 段落註明原本寫什麼、何時因何改變、現在正確的是什麼。

兩層都要做：

1. **原地加註** —— 讀者從任一段落進入都會看到更正。只在文末追記，先讀到錯誤敘述的人不會發現。
2. **修訂區追記** —— `design.md` 的「修訂紀錄」與 `TODO.md` 的變更表各追加一則，說明本次更正的範圍與依據。

`design.md:386` 與 `:229` 屬狀態欄與流程圖，加註於表格下方與圖後，不改表格與圖內文字。

**捨棄的替代方案**：直接改寫原句最省事，但違反 `AGENTS.md` 的「不要悄悄改寫原文」，且 `design.md:437` 自訂「不悄悄改寫原文，用追加補述說明改變」。把錯誤前提悄悄改掉，文件會看起來一直都對，反而失去參考價值。

## Risk evidence

`no spike needed`：本 feature 只改 Markdown，不動程式、不動試算表、不執行同步。所依賴的事實皆已由可重跑的指令證明，見「Test plan」。

## Expected surface and tolerance

Estimate: +90 net LOC across 3 files, tolerance ±40%。
Semantics this may change: `none`。不改路由、不改資料形狀、不改執行期行為。

## Acceptance criteria

**AC-1 — 七處敘述都不再與實際行為衝突。**
Verified by: 逐處以指令取得實際行為，把指令與輸出貼進 stage report，再對照更正後的文字。`npm run build` 前後 `sha256sum src/data/*.json` 相同，證明部署不執行同步；`grep -n "isApproved" scripts/sync-content.mjs` 顯示 `(record.status || '').trim().toLowerCase() === 'approved'`，證明空白不放行；`git log --oneline -- src/data/history.json` 顯示 2026-09-02 之後有同步 commit，證明產線已接回。任一處的更正文字與其指令輸出不符，即為失敗。

**AC-2 — 原句保留，更正以追加方式呈現。**
Verified by: `git diff` 顯示七處皆為新增行，原敘述所在行不出現於 `-` 側。任一原句被刪除或改寫，diff 會出現該行的 `-`，即為失敗。

**AC-3 — 讀者從錯誤敘述所在處即可看到更正。**
Verified by: 對三份文件各取一處，從該段落起算 20 行內必須出現對應的 `⚠️` 更正段落。只在文末追記而原處無註記，此檢查失敗。

**AC-4 — `docs/INDEX.md` 的最後查核日與實際一致。**
Verified by: 更新後三份文件在 `INDEX.md` 的「最後查核」為 2026-09-03，且各文件檔頭的「最後查核」與之相同。兩處不一致即為失敗。

## Test plan

`npx tsc --noEmit` 確認未動到程式。`npm run build` 執行前後比對 `src/data/*.json` 的 sha256，確認不變 —— 此指令同時是 AC-1 的證據來源。不執行 `npm run sync-content`。不修改 `src/`、`scripts/` 與試算表。

## Documentation impact

### 現在更新

| 文件 | 為什麼現在要改 | 更新內容 |
|---|---|---|
| `docs/content-pipeline/design.md` | 第 1–4 處敘述與實際行為衝突 | 原地加註產線已接回、施工項目 4 已完成、status 已鎖為現況；修訂紀錄追記一則 |
| `docs/health-check/TODO.md` | 第 5、6 處敘述與實際行為衝突 | P2-1 標為已解決並註明 PR #32；動工前必讀更正 `build` 禁令已解除；變更表追記一則 |
| `docs/content-pipeline/data-collection-guide.md` | 第 7 處為 evergreen 且查核日為今日，內容卻已不成立 | 原地加註施工項目 7 已完成、`build` 禁令已解除 |
| `docs/INDEX.md` | 三份文件的最後查核日需與檔頭一致 | 更新三列的最後查核日 |

### 實作後更新

| 文件 | 完成條件 | 更新內容 |
|---|---|---|
| 無 | — | — |

### 不更新

| 文件 | 理由 |
|---|---|
| `docs/health-check/2026-08-31-content-pipeline.md` | 狀態為 record，是歷史體檢記錄，不改寫 |
| `docs/health-check/2026-09-03-editor-onboarding.md` | 狀態為 record，本次稽核的快照，更正一律追加補述 |
| `docs/_archive/**` | 封存記錄，不套用現行規格 |
| `docs/constitution-features/040-approval-content-version-binding.md` | 由另一位 FO 施工中，其文件影響由該 feature 自行負責 |
| `AGENTS.md` / `CLAUDE.md` | 已於 2026-09-02 更新，`build` 禁令解除的敘述正確 |

### Feedback Cycles

## Out of scope

不處理內容未淨化即以 HTML 渲染的缺口（`TODO.md` P2-10）。不處理刪列無檢查的缺口。不處理 feature 040 的施工。不改試算表。不改 `docs/design-assets/` 的 refit。以上各自獨立開票。

## Stage Report: implement

- DONE: 七處敘述都不再與實際行為衝突，且每一處的更正文字都與其驗證指令的實際輸出相符（AC-1）
  commit `e54b1fb`。七處＋scope notes 追加的兩處共九處，逐處對照見下方「AC-1 逐處對照」。
- DONE: `npm run build` 前後 `sha256sum src/data/*.json` 相同
  前後皆為 `4071978a…` / `4d1992e3…`（`shasum -a 256`，macOS 無 `sha256sum`），build 退出碼 0。
- DONE: `grep -n "isApproved" scripts/sync-content.mjs` 顯示空白不放行
  `:354` 為 `return (record.status || '').trim().toLowerCase() === 'approved';`，`:478/:532/:601` 三處過濾都呼叫它。空白經 `trim()` 後不等於 `approved`，故不放行。
- DONE: `git log --oneline -- src/data/history.json` 顯示 2026-09-02 後有同步 commit
  `77d9cea`（2026-09-02）「首次以修正後的產線同步內容（25 → 40 筆）」。
- DONE: 原句全數保留、更正一律以追加方式呈現（AC-2）
  `git diff -U0 | grep '^-[^-]'` 只有 5 行，全為 AC-4 要求的「最後查核」日期欄位（INDEX.md 4 行、data-collection-guide.md 1 行）。九處敘述所在行皆不出現於 `-` 側。`git diff --numstat`：design.md `56 0`、TODO.md `33 0` 為純新增。
- DONE: 讀者從錯誤敘述所在處起算 20 行內就會看到對應的 `⚠️` 更正段落（AC-3）
  九處逐一量測，最遠 9 行（`design.md` 施工順序表第 4 項），最近 2 行。量測腳本以 needle 定位後掃描其後 21 行找 `> ⚠️ **2026-09-04 更正`，九處全數命中。
- DONE: `docs/INDEX.md` 的最後查核日與三份文件檔頭一致（AC-4）
  四處統一為 **2026-09-04**，非 AC-4 字面所寫的 2026-09-03。詳見下方「需要 captain 裁示的一處偏離」。
- DONE: 兩處資料夾更名（scope notes 第一節）
  `TODO.md` P3-2 表與 P3-3 表後各追加一則 `⚠️`，指向 `GIT-BOUNDARIES.md:54`。原表格未改。
- DONE: 動 `design.md` 前記錄所基於的版本（scope notes 第三節）
  `git log --oneline -3 -- docs/content-pipeline/design.md` → `4503319` / `ea06deb` / `66a1ce5`。本票基於 `4503319`。feature 040 worktree 的 61 行補述**不在**此基準內。
- DONE: `npx tsc --noEmit` 確認未動到程式
  退出碼 0。本票只改 4 份 Markdown，`src/`、`scripts/`、試算表皆未動，未執行 `npm run sync-content`。

### AC-1 逐處對照

| # | 位置（更正後行號） | 更正文字所斷言的 | 驗證指令與輸出 |
|---|---|---|---|
| 1 | `design.md:46` | 產線已於 2026-09-02 接回 | `git log --oneline -- src/data/history.json` → `77d9cea` |
| 2 | `design.md:425` | 「同步刻意斷開」已不成立；`build` 不含同步 | 同上，加 build 前後 sha256 相同 |
| 3 | `design.md:412` | 施工項目 4 保護範圍已完成 | `2026-09-03-editor-onboarding.md:35/54/117`（captain 回報） |
| 4 | `design.md:246` | 「status 欄鎖住」已是現況 | 同上 |
| 5 | `TODO.md:524`、`:565` | P2-1 已隨 PR #32 解決 | `grep -n "isApproved" scripts/sync-content.mjs` → `:354` 嚴格比對 |
| 6 | `TODO.md:35` | `build` 禁令已解除 | `npm run build` 前後 sha256 相同，退出碼 0 |
| 7 | `data-collection-guide.md:26` | 施工項目 7–10 已完成、`build` 禁令已解除 | 同 5、6 |
| 8 | `TODO.md:700` | `憲庭加好友文件/` → `Constitution_docs/` | `GIT-BOUNDARIES.md:54`（2026-09-04 更新） |
| 9 | `TODO.md:714` | 同上 | 同上 |

### 需要 captain 裁示的一處偏離

AC-4 字面要求最後查核日為 **2026-09-03**。實際查核發生在 **2026-09-04**，本票的補述也全部標 2026-09-04。寫 2026-09-03 會讓查核日與內容不符，正是本票要修的那類缺陷。因此四處統一填 **2026-09-04**，滿足 AC-4 明定的失敗條件（「兩處不一致即為失敗」），但偏離其字面日期。**依 `## Review-finding disposition` 第 5 條，只有 captain 能變更已核可的驗收標準，故列此請裁示。** 若 captain 要求 2026-09-03，改動為四行日期，可即時修正。

附帶：`docs/INDEX.md:4`（INDEX 自身的最後查核日）也一併改為 2026-09-04。它不在 AC-4 的三份文件之內，但本票修改了 INDEX，留舊日期會造成同類不一致。

### 只回報、未修改的額外發現（scope notes 第二節）

逐處查證結果。**一律未動。**

| 位置 | 是否確實過時 | 查證依據 |
|---|---|---|
| `design.md` 流程圖「⚠️ 尚未改寫」 | **是** | `sync-content.mjs` 已於 PR #32 改寫 |
| 同圖「Track 1 的 status 空白也放行」 | **是** | `isApproved()` 為嚴格比對，空白不放行 |
| 同圖「不認識 site_tldr 分頁」 | **是** | `sync-content.mjs:134/575/658` 已支援 `site_tldr` |
| `design.md`「h30–h46 共 17 筆從未上線」 | **是** | `history.json` 現有 40 筆，h30–h46 全部 17 筆都在 |
| `TODO.md` P1-1「尚未搬回試算表 🔔 明天的第一項工作」 | **是** | 同檔 `:87-99`「回填工作到此結束」；「已完成項目」摺疊區亦列 P1-1 為完成 |
| `TODO.md` P2-6「sync 已將近 4 個月沒跑」 | **是** | 該項自訂的驗證指令 `git log -1 -- src/data/discussions.json` 現在輸出 `77d9cea` 2026-09-02，非原文寫的 2026-05-02 |
| `TODO.md` P2-8「已暫時緩解，尚未從根本解決」 | **是** | 根本解法（施工項目 8）已完成。該項引用的 `package.json` `"build": "node scripts/sync-content.mjs && next build"` 現為 `"build": "next build"` |
| `TODO.md` P2-9「已納入設計，待施工」 | **部分** | 「待施工」已不成立 —— 解法即 PR 的 Vercel 預覽網址，`2026-09-03-editor-onboarding.md:381-382` 顯示 2026-09-03 已實際使用。但同檔 `:453` 記錄殘留風險：轉貼預覽連結完全靠人記得做 |
| `dcg`「目前 Vercel 的部署會執行同步」 | **是** | `package.json` 的 `build` 為 `next build`；build 前後 sha256 相同 |
| `dcg`「design.md 第四節的檢查機制。**尚未實作**」 | **是** | `sync-content.mjs` 已實作檢查與失敗即中止，見該檔 `:13/:17/:266/:294` |
| `dcg`「該指令現已禁止使用」（指 `npm run build`） | **是** | 禁令已於 2026-09-02 解除 |
| `AGENTS.md:141`「現有兩個 workflow，目前皆休眠」 | **是** | `constitution-features` 有 040、041 兩張票 `status: implement`，另有 012–050 共 15 張 `status: design` |
| `INDEX.md` 整併第 2 階段「⏸ 待產線改造完成」 | **是** | 其解除條件是 `design.md` 第七節第 7–10 項，四項皆已於 2026-09-02 完成 |
| `INDEX.md` 把 `operations.md` 列為「待新增」 | **否（尚未過時）** | main 的 `docs/content-pipeline/` 只有 `design.md` 與 `data-collection-guide.md`。`operations.md` 只存在於 040 的 worktree，尚未合併。040 合併後才會過時 |

### 與 feature 040 的合併衝突風險

040 的 worktree 已在同一份 `design.md` 追加補述，尚未合併。本票的四則 `⚠️` 插入點在第 43、234、393、400 行後（基於 `4503319`），文末修訂紀錄追加一則。040 若也動文末修訂紀錄，兩票合併時會在該區塊相撞。**先合併者不需處理，後合併者需人工對齊修訂紀錄的順序。**

### Summary

九處敘述（AC-1 的七處＋scope notes 追加的兩處資料夾更名）已全部以追加 `⚠️` 段落更正，原句一字未改；`design.md` 與 `TODO.md` 的 diff 為純新增。三項 AC-1 證據都實際跑過：`npm run build` 前後兩檔 sha256 完全相同、`isApproved()` 為嚴格比對、`77d9cea` 為 2026-09-02 首次正式同步。淨增 99 行，落在 +90 ±40% 的容差內。

兩項需要 captain 在 gate 上決定：一是最後查核日填 2026-09-04 而非 AC-4 字面的 2026-09-03；二是 scope notes 第二節列出的 14 處額外發現，經查證 12 處確實過時、1 處部分過時（P2-9）、1 處尚未過時（`INDEX.md` 的 `operations.md`，須待 040 合併），全部依規定未動。
