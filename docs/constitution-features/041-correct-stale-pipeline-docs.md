---
id: 041
title: 修正內容產線文件與實際行為不符之處
status: design
source: captain 2026-09-03
started:
completed:
verdict:
score:
worktree:
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
