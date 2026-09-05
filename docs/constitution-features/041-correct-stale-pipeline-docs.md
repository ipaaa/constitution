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
gates:
    version: 1
    records:
        - id: gate:041:verify
          stage: verify
          attempts:
            - id: gate-attempt:041-verify-1
              briefing:
                id: briefing:041:verify:attempt-1:revision-1
                digest: sha256:7af2178c78586a269cfec765051fdd66910afd10b70462a612c7d42390edef7b
                room-ref: '@review/verify/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:041:verify:1
                briefing: briefing:041:verify:attempt-1:revision-1
                by: person:captain
                at: "2026-09-05T03:37:26.405535Z"
                decision: revise
                reason: 交付本身乾淨（九處全對、原句一字未改、AC-1 三項指令由 verify 獨立重跑全部相符），但範圍不足以達成本票自己宣稱的目的：041 把 data-collection-guide.md 的最後查核日推進到 2026-09-04，卻留下 :161／:171／:175 三句仍然錯誤的敘述，正是本票 Problem 親筆點名的『查核日期新而內容錯，比沒有查核日期更容易誤導』。captain 於 2026-09-04 裁決 revise 並擴充範圍：納入 scope notes 第二節已由 implement 與 verify 兩度查證的 14 處額外過時敘述。另裁示最後查核日採 2026-09-04（實際查核日）而非 AC-4 字面的 2026-09-03。FO 授權 fix：TODO.md:700 的路徑代換不完整（Polish）。
review-round:
    id: round:041:verify:1
    stage: verify
    cycle: 1
    briefing:
        id: briefing:041:verify:round-1
        digest: sha256:c0ad2fcc2bac28e667bd0d5ecf8d1b6af8aa5d11c1af1b3c465407aaa88f2648
        room-ref: '@review/verify/round-1'
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

> ⚠️ **2026-09-04 captain 裁決：擴充驗收範圍。** 原文保留於下，實際驗收依本段。
> AC-1 的「七處」擴充為 **23 處**。AC-4 的查核日由 2026-09-03 改為 **2026-09-04**。
> 依 `## Review-finding disposition` 第 5 條，只有 captain 能改已核可的驗收範圍。
> 擴充理由：041 把 `data-collection-guide.md` 的查核日推進到 2026-09-04，卻留下三句仍然錯誤的敘述，
> 正是本票 Problem 點名的失效模式（「查核日期新而內容錯」）。
> 查核日理由：實際查核發生在 2026-09-04，填 2026-09-03 會製造本票要消滅的同一種不符。
>
> **AC-1 涵蓋的 23 處清單**（括號內為更正後行號）：
>
> | # | 檔案 | 敘述 | 來源 |
> |---|---|---|---|
> | 1 | `design.md`（`:46`） | 產線現在是刻意斷開的 | 原七處 |
> | 2 | `design.md`（`:81`） | 流程圖「⚠️ 尚未改寫」 | 擴充 |
> | 3 | `design.md`（`:81`） | 流程圖「Track 1 的 status 空白也放行」 | 擴充 |
> | 4 | `design.md`（`:81`） | 流程圖「不認識 site_tldr 分頁」 | 擴充 |
> | 5 | `design.md`（`:255`） | 「投稿者 status 欄鎖住」寫成設計目標 | 原七處 |
> | 6 | `design.md`（`:421`） | 施工項目 4 ⏸ 等有協作者再設 | 原七處 |
> | 7 | `design.md`（`:434`） | 「目前狀態」同步刻意斷開 | 原七處 |
> | 8 | `design.md`（`:476`） | 「h30–h46 共 17 筆從未上線」 | 擴充 |
> | 9 | `TODO.md`（`:35`） | 動工前必讀：`build` 禁令尚未解除 | 原七處 |
> | 10 | `TODO.md`（`:341`） | P1-1 搶救內容尚未搬回試算表 | 擴充 |
> | 11 | `TODO.md`（`:531`） | P2-1 Track 1 完全沒有把關 | 原七處 |
> | 12 | `TODO.md`（`:572`） | P2-1「修法不變，且更急」 | 原七處（同節第二則） |
> | 13 | `TODO.md`（`:620`） | P2-6 sync 已將近 4 個月沒跑 | 擴充 |
> | 14 | `TODO.md`（`:646`） | P2-8 已暫時緩解，尚未從根本解決 | 擴充 |
> | 15 | `TODO.md`（`:661`） | P2-9 已納入設計，待施工（部分過時） | 擴充 |
> | 16 | `TODO.md`（`:731`） | P3-2 表的 `憲庭加好友文件/` 路徑 | scope notes 第一節 |
> | 17 | `TODO.md`（`:746`） | P3-3 表的 `憲庭加好友文件/` 路徑 | scope notes 第一節 |
> | 18 | `data-collection-guide.md`（`:26`） | 產線改造尚未完成 | 原七處 |
> | 19 | `data-collection-guide.md`（`:164`） | 目前 Vercel 的部署會執行同步 | 擴充 |
> | 20 | `data-collection-guide.md`（`:183`） | 檢查機制尚未實作 | 擴充 |
> | 21 | `data-collection-guide.md`（`:183`） | 「該指令現已禁止使用」 | 擴充 |
> | 22 | `AGENTS.md`（`:146`） | 現有兩個 workflow，目前皆休眠 | 擴充 |
> | 23 | `INDEX.md`（`:150`） | 整併第 2 階段 ⏸ 待產線改造完成 | 擴充 |
>
> **判定為尚未過時、維持不動**：`INDEX.md` 把 `docs/content-pipeline/operations.md` 列為「待新增」。
> `git ls-tree main docs/content-pipeline/` 只有兩檔，`operations.md` 只存在於 feature 040 的 worktree。
> **解除條件：feature 040 合併進 main。** 屆時該列才需要更正。

**AC-1 — 七處敘述都不再與實際行為衝突。**
Verified by: 逐處以指令取得實際行為，把指令與輸出貼進 stage report，再對照更正後的文字。`npm run build` 前後 `sha256sum src/data/*.json` 相同，證明部署不執行同步；`grep -n "isApproved" scripts/sync-content.mjs` 顯示 `(record.status || '').trim().toLowerCase() === 'approved'`，證明空白不放行；`git log --oneline -- src/data/history.json` 顯示 2026-09-02 之後有同步 commit，證明產線已接回。任一處的更正文字與其指令輸出不符，即為失敗。

**AC-2 — 原句保留，更正以追加方式呈現。**
Verified by: `git diff` 顯示七處皆為新增行，原敘述所在行不出現於 `-` 側。任一原句被刪除或改寫，diff 會出現該行的 `-`，即為失敗。

**AC-3 — 讀者從錯誤敘述所在處即可看到更正。**
Verified by: 對三份文件各取一處，從該段落起算 20 行內必須出現對應的 `⚠️` 更正段落。只在文末追記而原處無註記，此檢查失敗。

**AC-4 — `docs/INDEX.md` 的最後查核日與實際一致。**
Verified by: 更新後三份文件在 `INDEX.md` 的「最後查核」為 2026-09-03，且各文件檔頭的「最後查核」與之相同。兩處不一致即為失敗。

> ⚠️ **2026-09-04 captain 裁決：日期改為 2026-09-04。** 原句保留於上。
> 理由：實際查核發生在 2026-09-04，本票的補述也全部標 2026-09-04。
> 填 2026-09-03 會讓查核日與內容不符，正是本票 Problem 點名要消滅的形狀
> （「查核日期新而內容錯，比沒有查核日期更容易誤導」）。
> 一致性的判定不變：`INDEX.md` 的三列與三份文件檔頭必須相同，不同即為失敗。

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

- Cycle 1: REJECTED — verify；surface 5 檔／+177 淨行 vs estimate +90 ±40%（197%，超出上限 51 行；範圍擴充由 captain 授權，非 scope creep）；AC changed（captain 2026-09-04 裁決：AC-1 由七處擴充為 23 處；AC-4 查核日由 2026-09-03 改為 2026-09-04，理由為實際查核日，填 09-03 會製造本票要消滅的同一種不符）。退回主因非交付有錯——verify 判 PASSED、四項 checklist 全 DONE——而是範圍不足：本票把 data-collection-guide.md 的查核日推進到 09-04，卻留下 :161／:171／:175 三句仍錯，正是本票 Problem 親筆點名的「查核日期新而內容錯」。F-A fix（Polish：TODO.md:700 路徑代換不完整，子目錄更名時加了編號前綴，代換後路徑不存在）。擴充後補上 12 處確實過時、1 處部分過時（P2-9 兩面都寫），1 處尚未過時（INDEX.md 的 operations.md）依判定維持不動並記錄解除條件為 040 合併。原句全數保留，diff 刪除行僅 5 行日期欄位。

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

## Stage Report: verify

- DONE: 獨立重跑 AC-1 的三項驗證指令，並逐一比對九處更正文字所斷言的內容與實際輸出是否相符
  三項全數獨立重跑，九處全數相符。逐處對照見下方「AC-1 獨立複驗」。
- DONE: 確認 AC-2 與 AC-3
  AC-2：`git diff -U0 main...HEAD` 於四份文件的刪除行共 5 行，全為「最後查核」日期（`INDEX.md` 4 行、`data-collection-guide.md` 1 行）。`design.md`、`TODO.md` 為 `56 0` / `33 0` 純新增。九處原句經 `sed -n` 逐行讀出，一字未改。
  AC-3：自行以 `grep -n` 定位九處錯誤敘述與九則 `⚠️ **2026-09-04 更正`，未採信 implement 的量測腳本。距離全部 ≤ 9 行，見下方表格。
- DONE: 邊界與越界查核
  `git diff --numstat main...HEAD` 只列出 5 個檔，全在 `docs/` 下；`src/`、`scripts/`、`AGENTS.md`、`docs/_archive/**`、兩份 `record` 文件（`2026-08-31-content-pipeline.md`、`2026-09-03-editor-onboarding.md`）皆未出現。未執行 `npm run sync-content`。`npx tsc --noEmit` 退出碼 0。
- DONE: 複核 14 處額外發現確實一處未改，且「是否過時」判定正確
  14 處的行號（`design.md:67/69/71/463`、`TODO.md:339/608/621/634`、`dcg:161/171/175`、`AGENTS.md:141`、`INDEX.md:138/145`）全部落在 diff hunk 之外，確認未改。12 處「是」的判定逐處查證屬實。P2-9「部分過時」與 `operations.md`「尚未過時」兩項複核結果見下方。

### AC-1 獨立複驗

| 指令 | 我跑出來的輸出 | 對應更正處 |
|---|---|---|
| `shasum -a 256 src/data/*.json`（build 前後） | 前後皆 `4071978a…` / `4d1992e3…`，`npm run build` 退出碼 0 | `dcg:26`、`TODO.md:35`、`design.md:425` |
| `grep -n "isApproved" scripts/sync-content.mjs` | `:354` 定義 `(record.status \|\| '').trim().toLowerCase() === 'approved'`；`:478/:532/:601` 呼叫 | `TODO.md:524`、`:565` |
| `git log --oneline -- src/data/history.json` | `77d9cea` 2026-09-02「25 → 40 筆」 | `design.md:46`、`:425` |

額外自行查證：`git show 77d9cea^:src/data/history.json` 為 **25** 筆、現為 **40** 筆，證實「25 增為 40」；`history.json` 內 h30–h46 共 17 筆全在，證實 `design.md:463`「從未上線」已過時。`package.json` 的 `build` 為 `next build`。`2026-09-03-editor-onboarding.md` 第 35、54、58、110、117 行內容與更正文字所引全部逐字相符。`GIT-BOUNDARIES.md:54` 逐字記載 2026-09-04 由 `憲庭加好友文件/` 更名為 `Constitution_docs/`，磁碟上舊名已不存在。

### AC-3 距離（自行量測）

| # | 錯誤敘述行 | 更正段行 | 距離 |
|---|---|---|---|
| 1 | `design.md:43` | `:46` | 3 |
| 2 | `design.md:421` | `:425` | 4 |
| 3 | `design.md:403` | `:412` | 9 |
| 4 | `design.md:244` | `:246` | 2 |
| 5 | `TODO.md:522`／`:563` | `:524`／`:565` | 2／2 |
| 6 | `TODO.md:26`（⛔ 區塊起） | `:35` | 9 |
| 7 | `dcg:23` | `:26` | 3 |
| 8 | `TODO.md:698` | `:700` | 2 |
| 9 | `TODO.md:708` | `:714` | 6 |

### 兩項判定的複核結果

`TODO.md` P2-9 判為「部分過時」— **同意**。`:636`「已納入設計，待施工」的解法是 PR 的 Vercel 預覽網址，`2026-09-03-editor-onboarding.md:381-382` 顯示 2026-09-03 已實際使用，故「待施工」不成立；同檔 `:453` 逐字記載「這兩個環節完全靠人記得做」，殘留風險屬實。

`INDEX.md:145` 把 `operations.md` 列為「待新增」判為「尚未過時」— **同意**。`git ls-tree main docs/content-pipeline/` 只有 `design.md` 與 `data-collection-guide.md`，`operations.md` 不在 main。040 合併後才會過時。

### 我發現、未修改的一處（Polish）

`TODO.md:700` 的更正寫「路徑請自行代換」。P3-2 表格的路徑是 `憲庭加好友文件/網站書籍策劃/`，直接代換得到 `Constitution_docs/網站書籍策劃/`，該路徑不存在 —— 實際是 `Constitution_docs/1_網站書籍策劃/`。更名時子目錄一併加了編號前綴，`GIT-BOUNDARIES.md:54` 有記載（`0_會議紀錄與待辦/` 至 `5_archive/`），更正段未帶到。四項證據：讀者依 P3-2 找撰稿人選盤點時觸發；`ls "Constitution_docs/網站書籍策劃"` 不存在；受影響的是本票「敘述與實際一致」的目的，非 AC-1 的七處；`ls "30 Public Writing/Constitution_docs/"` 輸出 `1_網站書籍策劃` 為觸發證據。更正的核心斷言（`憲庭加好友文件/` → `Constitution_docs/`）本身正確，僅導覽指示不完整，一次 `ls` 即可自行復原，故提議 **Polish**，任務歸屬為本票，處置提議為修（加一行說明子目錄已加編號前綴）。**未動任何位元組，等 FO 授權。**

### 需要 captain 決定的兩項（implement 已提出，複核後維持）

一、最後查核日填 2026-09-04 而非 AC-4 字面的 2026-09-03。四處（`INDEX.md:4`、三份文件檔頭）確實一致，AC-4 明定的失敗條件未觸發。查核確實發生在 2026-09-04。依 `## Review-finding disposition` 第 5 條，只有 captain 能改驗收標準。

二、`data-collection-guide.md` 狀態為 `evergreen`，本票把它的最後查核日推進到 2026-09-04，但該檔 `:161`「目前 Vercel 的部署會執行同步」、`:171`「檢查機制尚未實作」、`:175`「該指令現已禁止使用」三句仍然錯誤且依 scope notes 未改。這正是本票 Problem 第 34 行點名的「查核日期新而內容錯」。此為既有狀況（原本就標 2026-09-03 且同樣錯），非本票造成的退步，且超出本票授權範圍，故分類為 **Material／不歸本票所有 → Needs decision**，維持不動，請 captain 裁示是否另開票。

### Summary

verify 判定 **PASSED**。AC-1 的三項指令獨立重跑，九處更正文字所斷言的內容與實際輸出全部相符，無一處對不上；AC-2 的刪除行只有 5 行日期欄位，九處原句一字未改；AC-3 九處距離自行量測全部 ≤ 9 行，未採信 implement 的腳本。邊界未越界，14 處額外發現確實一處未動，P2-9 與 `operations.md` 兩項判定複核後同意。

佔位資料掃描：對本票新增的所有行掃 `某學者`、`某大學法律系`、`test`、`lorem ipsum`、`快速了解最新判決的5個重點`，零命中；`src/data/*.json` 亦零命中，且 build 前後指紋未變，證明本票未觸及資料檔。發現一處 Polish（`TODO.md:700` 的路徑代換不完整），未修改，連同 implement 提出的兩項一併送 gate。

## Stage Report: implement (cycle 2)

- DONE: 納入 scope notes 第二節已查證的 14 處：12 處「確實過時」者比照本票既有手法以追加 `⚠️` 補述更正，原句一字不改
  commit `e3110ed`。12 處分佈：`design.md` 4、`TODO.md` 3、`data-collection-guide.md` 3、`AGENTS.md` 1、`INDEX.md` 1。逐處對照見下方表。**原文一行未刪。** 詳見下方「AC-2 驗證」。
- DONE: `TODO.md` P2-9 依「部分過時」處理，同時寫清楚「待施工」已不成立與殘留風險仍在
  `TODO.md:661` 的更正段分兩節。「已不成立的部分」引 `2026-09-03-editor-onboarding.md:381-382`（2026-09-03 已實際使用 PR 預覽網址）。「仍然開著的部分」逐字引同檔 `:453`「這兩個環節完全靠人記得做」，並指出它違反 `design.md` 不變式 #6、尚無對應的票。
- DONE: `INDEX.md` 把 `operations.md` 列為「待新增」判定為尚未過時，維持不動，並在 stage report 記錄解除條件
  `INDEX.md:145` 一字未動。**解除條件：feature 040 合併進 main。** 查證：`git ls-tree main docs/content-pipeline/` 只有 `design.md` 與 `data-collection-guide.md`；`operations.md` 只存在於 `.worktrees/spacedock-ensign-040-approval-content-version-binding/`。此解除條件也寫進 `INDEX.md:150` 的更正段，讓讀者當場看到為什麼那一列不改。
- DONE: 更新驗收標準本文 —— AC-1 的「七處」擴充為 23 處並列出清單
  entity body AC-1 上方新增 captain 裁決段，含 23 處清單表（檔案、敘述、來源為「原七處／擴充／scope notes 第一節」）。原 AC-1 條文保留於下方。
- DONE: AC-4 的查核日由 2026-09-03 改為 2026-09-04 並記錄理由
  entity body AC-4 下方新增裁決段。理由：實際查核發生於 09-04，填 09-03 會製造本票要消滅的同一種不符。一致性判定不變。原條文保留。
- DONE: 修正 `docs/health-check/TODO.md:700` 的路徑代換不完整
  `TODO.md:735` 追加一行：`憲庭加好友文件/網站書籍策劃/` 現址為 `Constitution_docs/1_網站書籍策劃/`，六個子目錄為 `0_會議紀錄與待辦/` 至 `5_archive/`。查證指令 `ls "…/30 Public Writing/Constitution_docs/"` 輸出六個帶編號前綴的目錄。原更正段的核心斷言未改，只補一行。

### 本輪 12 處逐處對照

| 檔案:行 | 更正的敘述 | 驗證依據 |
|---|---|---|
| `design.md:81` | 流程圖「⚠️ 尚未改寫」 | `sync-content.mjs` 已於 PR #32 改寫 |
| `design.md:81` | 流程圖「Track 1 的 status 空白也放行」 | `sync-content.mjs:354` 嚴格比對，`:478/:532/:601` 呼叫它 |
| `design.md:81` | 流程圖「不認識 site_tldr 分頁」 | `sync-content.mjs:134/575/658` |
| `design.md:476` | 「h30–h46 共 17 筆從未上線」 | `history.json` 40 筆，h30–h46 共 17 個 id 全在 |
| `TODO.md:341` | P1-1「尚未搬回試算表 🔔 明天的第一項工作」 | 同檔 `:87-99`「回填工作到此結束」＋文末「已完成項目」 |
| `TODO.md:620` | P2-6「sync 已將近 4 個月沒跑」 | 該項自訂指令 `git log -1 -- src/data/discussions.json` → `77d9cea` 2026-09-02 |
| `TODO.md:646` | P2-8「已暫時緩解，尚未從根本解決」 | `package.json` 的 `build` 現為 `next build`；build 前後 sha256 相同 |
| `TODO.md:661` | P2-9「已納入設計，待施工」（部分） | `editor-onboarding.md:381-382` 已用；`:453` 殘留風險屬實 |
| `dcg:164` | 「目前 Vercel 的部署會執行同步」 | 同上 build 證據 |
| `dcg:183` | 「檢查機制尚未實作」 | `sync-content.mjs:13/17/266/294` |
| `dcg:183` | 「該指令現已禁止使用」 | 禁令 2026-09-02 解除 |
| `AGENTS.md:146` | 「現有兩個 workflow，目前皆休眠」 | 040、041 為 `status: implement`，另 15 張 `status: design` |
| `INDEX.md:150` | 整併第 2 階段「⏸ 待產線改造完成」 | `design.md` 第七節第 7–10 項皆已於 2026-09-02 完成 |

### 驗證輸出

- **AC-3 全數通過。** 23 處逐一量測更正段與原敘述的距離：最遠 15 行（`INDEX.md` 整併表第 2 列），最近 2 行。量測方式：以原敘述字串定位後掃描其後 21 行找 `> ⚠️ **2026-09-04 更正`，23 處全數命中，0 失敗。
- **AC-2 驗證：原文一行未刪。** 全票累計 `git diff -U0 655f163..HEAD` 對五份文件只有 **5 行刪除**，全部是 AC-4 要求更新的「最後查核」日期欄位（`INDEX.md` 4 行、`data-collection-guide.md` 1 行）。23 處敘述所在行皆不出現於 `-` 側。
  cycle 2 的增量 diff（`9d52c85..e3110ed`）另有 5 行刪除，但那 5 行**是 cycle 1 自己加的補述**，不是原文：`design.md` 修訂紀錄那則的「四則」改寫為「六則」共 4 行，`TODO.md` 進度紀錄那列「三份文件」改寫為「五份文件」1 行。兩者在累計 diff 中不出現，因為它們在 `655f163` 時尚不存在。
  cycle 2 增量 `git diff --numstat`：`AGENTS.md 6 0`、`INDEX.md 9 0`、`dcg 14 0`、`design.md 21 4`、`TODO.md 33 1`。
- **AC-1 證據未變。** `npm run build` 退出碼 0，前後 `shasum -a 256 src/data/*.json` 皆為 `4071978a…` / `4d1992e3…`。本輪未動 `src/`、`scripts/`、試算表，未執行 `npm run sync-content`，故該證據仍成立（`git status` 只列 6 份 Markdown）。
- **`npx tsc --noEmit` 退出碼 0。**

### Surface 據實回報

累計對五份文件淨增 **+177 行**（`git diff --numstat 655f163..HEAD`：新增 182、刪除 5；刪除的 5 行全為 AC-4 的日期欄位）。原 estimate 為 `+90 ±40%`（54–126）。超出上限 51 行，約為 estimate 的 197%。**未為壓行數而省略任何應更正的處數**，範圍調整已由 captain 於 2026-09-04 授權。

### 需要知道的兩件事

1. **`CLAUDE.md` 是 `AGENTS.md` 的 symlink**（`lrwxr-xr-x CLAUDE.md -> AGENTS.md`）。更正 `AGENTS.md:141` 一併對 `CLAUDE.md` 生效，不需另外處理。依指示只動了 `:141` 那一處。
2. **與 feature 040 的合併衝突風險擴大。** cycle 1 本已在 `design.md` 文末修訂紀錄追加一則；cycle 2 又動了同一則（四則改為六則），並新增 `INDEX.md` 的更正段。040 的 worktree 已在 `design.md` 追加 61 行、且建立了 `docs/content-pipeline/operations.md`。本票基於 `4503319`。**後合併者需人工對齊 `design.md` 文末修訂紀錄的順序，並在 040 合併後更正 `INDEX.md:145` 的 `operations.md` 那一列。**

### Summary

依 captain 2026-09-04 裁決把驗收範圍由七處擴充為 23 處，補上 scope notes 第二節查證過的 12 處確實過時敘述與 1 處部分過時（P2-9，兩面都寫），並補齊 `TODO.md` 的路徑代換說明。判定尚未過時的 `INDEX.md` `operations.md` 那一列維持不動，解除條件（040 合併）同時寫進 stage report 與該檔的更正段。entity body 的 AC-1 與 AC-4 已依裁決更新，原條文保留。

23 處全部通過 AC-3（最遠 15 行），原文一行未刪，`npx tsc --noEmit` 與 `npm run build` 皆通過且 `src/data/*.json` 指紋未變。累計淨增 +177 行，超出原 estimate 上限 51 行，成因是 captain 授權的範圍擴充，已據實回報。
