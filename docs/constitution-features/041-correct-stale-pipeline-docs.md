---
id: 041
title: 修正內容產線文件與實際行為不符之處
status: review
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
            - id: gate-attempt:041-verify-2
              briefing:
                id: briefing:041:verify:attempt-2:revision-1
                digest: sha256:9dc5bbdf02e6b472891753cf87cafada35f616686c0152b722d406ba19144ec4
                room-ref: '@review/verify/briefing-2'
              resolution:
                type: Resolution
                id: resolution:spacedock:041:verify:2
                briefing: briefing:041:verify:attempt-2:revision-1
                by: person:captain
                at: "2026-09-05T04:10:04.637315Z"
                decision: approve
                reason: verify cycle 3 判 PASSED：F-1 至 F-4 全部修正並經獨立複驗。F-1 的修法以「未來也不會漂移」為標準驗證——更正段九句無一斷言票號、階段或數量，三道精確掃描零命中；段內實質主張逐一以指令查證屬實。三處導覽指引的六個被引行號全部實讀複驗，F-2 原句一字未改僅以補述指出。既有成果未破壞：刪除行仍只有 5 行日期欄位，24 處更正距離全驗 ≤20，src／scripts／兩份 record／_archive 皆未動，placeholder 零命中，資料檔指紋三個 cycle 相同。一項 Deferred risk 經 FO 授權 decline for 041 並記錄 promote 條件。captain 於 2026-09-04 核可進入 review。
              application:
                target-stage: review
                state: consumed
        - id: gate:041:review
          stage: review
          attempts:
            - id: gate-attempt:041-review-1
              briefing:
                id: briefing:041:review:attempt-1:revision-1
                digest: sha256:65f2695312b688c6b8254d2a245227cd99c938d6d12e6591f6b1508eb205de56
                room-ref: '@review/review/briefing-1'
review-round:
    id: round:041:verify:2
    stage: verify
    cycle: 2
    briefing:
        id: briefing:041:verify:round-2
        digest: sha256:6e50a0984508ddad75fae97a52b1ff08f6839e5403bb770960c97906432f2de0
        room-ref: '@review/verify/round-2'
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
- Cycle 2: REJECTED — verify；surface 5 檔／淨 +185 行 vs estimate +90 ±40%（範圍擴充由 captain 於 cycle 1 授權，非 scope creep）；AC unchanged。退回原因為單一處：23 處中 22 處實質主張經 reviewer 以指令獨立複驗屬實，F-1（Material）`AGENTS.md:147` 的更正段寫「040 與 041 的 status 為 implement」，但跑它自附的掃描指令輸出為 `041 … verify`——成因是把會隨流程漂移的快照寫進 evergreen 文件，且會隨本票自己推進而繼續惡化，正是本票要消滅的形狀。F-1 fix：改為只陳述不漂移的事實，即時票況交給指令回答，改寫後無任何一句斷言票號或階段。F-2 fix（Polish：INDEX.md 沿用「design.md 第七節第 7–10 項」，施工順序表實際在第五節；錯誤源自 INDEX.md 原句，依體例保留原句以補述指出）；F-3 fix（Polish：design.md 修訂紀錄誤將 :46／:81 歸為第二節）；F-4 fix（Polish：TODO.md 誤指被引句在 :87-99，實際在 :110）。四項皆已修，未重做已通過的 22 處、AC 條文與 operations.md 判定。

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

## Stage Report: verify (cycle 2)

- FAILED: 獨立重跑並逐處查核擴充後的 23 處更正
  22 處相符。第 22 處（`AGENTS.md:147`）不符：更正文字寫「040 與 041 兩張票的 `status` 為 `implement`」，但它自己附的指令現在輸出 `040 … implement`、`041 … verify`、15 張 `design`。依 checklist「任一處對不上即為 REJECTED」，判定 **REJECTED**。詳見下方 F-1。
- DONE: 特別查核本輪新增的 12 處「確實過時」者
  12 處逐一以指令複驗，全部屬實。見下方「本輪 12 處獨立複驗」。
- DONE: 確認 `TODO.md` P2-9 兩面都寫清楚
  `TODO.md:661` 的更正段確有兩節。「已不成立」：`2026-09-03-editor-onboarding.md:381-382` 逐字為「captain 對 diff、看預覽網址」「captain 把預覽連結貼進群組」，證實 2026-09-03 已實際使用，「待施工」不成立。「仍然開著」：同檔 `:453` 逐字為「這兩個環節完全靠人記得做」，殘留風險屬實。兩面皆在。
- DONE: 確認 AC-2 —— `git diff` 的刪除行只有日期欄位、23 處原句一字未改
  `git diff --numstat 655f163..HEAD` 對五份文件為 `AGENTS.md 6 0`、`INDEX.md 13 4`、`dcg 25 1`、`design.md 73 0`、`TODO.md 65 0`：刪除共 5 行。逐行讀出：`INDEX.md:4` 與 `dcg:2` 的「最後查核」欄，以及 `INDEX.md` 三列表格（三列的 `+` 側除日期外逐字相同）。23 處原句所在行（`design.md:43/67/69/71/248/412/430/472`、`TODO.md:32/339/529/570/615/639/657/727/743`、`dcg:23/161/177/181`、`AGENTS.md:141`、`INDEX.md:145`）皆不出現於 `-` 側，且現值與 `655f163` 一致。
- DONE: 自行量測 23 處距離是否 ≤20 行（未採信 implement 的數字或腳本）
  以 `grep -n` 取原句行號與 `grep -n '⚠️ \*\*2026-09-04'` 取更正段行號相減。最遠 14 行（`design.md:67`→`:81`），最近 2 行。23 處全部 ≤20。逐處數字見下表。
- DONE: 確認條文更新與邊界
  AC-1 上方新增 captain 裁決段（七處→23 處，含 23 列清單），原 AC-1 條文保留於下；AC-4 下方新增裁決段（09-03→09-04），原條文保留於上。兩者與 frontmatter 內 captain 2026-09-04 的 Resolution 文字一致。`INDEX.md:145` 的 `operations.md`（新增）那一列一字未動（diff 為 `@@ -149,0 +150,9 @@` 純插入），解除條件「040 合併進 main」同時寫在 `INDEX.md:154-156` 與 implement 的 stage report。`git ls-tree main docs/content-pipeline/` 只有 `design.md` 與 `data-collection-guide.md`，證實尚未過時。`git diff --name-only main...HEAD` 只列 5 份文件＋entity＋gate artifacts：`src/`、`scripts/`、`docs/_archive/**`、兩份 `record`（`2026-08-31-content-pipeline.md`、`2026-09-03-editor-onboarding.md`）皆未動，未執行 `npm run sync-content`。`AGENTS.md` 為單一 hunk `@@ -145,2 +145,8 @@`，6 行新增 0 行刪除，只改 `:141` 那一處。

### 23 處距離（自行量測，單位：行）

`design.md` 43→46=3、67→81=14、69→81=12、71→81=10、248→255=7、412→421=9、430→434=4、472→476=4。
`TODO.md` 32→35=3、339→341=2、529→531=2、570→572=2、615→620=5、639→646=7、657→661=4、727→731=4、743→746=3。
`dcg` 23→26=3、161→164=3、177→183=6、181→183=2。`AGENTS.md` 141→146=5。`INDEX.md` 138→150=12。

### 本輪 12 處獨立複驗

| 更正處 | 我跑的驗證 | 結果 |
|---|---|---|
| `design.md:81`「尚未改寫／空白放行／不認識 site_tldr」 | `grep -n isApproved scripts/sync-content.mjs`；`sed -n '134p;575p;658p'` | `:354` 為 `(record.status \|\| '').trim().toLowerCase() === 'approved'`，`:478/:532/:601` 呼叫；`:134` `SITE_TLDR='site_tldr'`、`:575`、`:658` 皆為 `site_tldr` 處理 ✅ |
| `design.md:476` h30–h46 已上線 | `python3` 讀 `history.json` | 40 筆，h30–h46 全 17 個 id 在內，缺 0 ✅ |
| `TODO.md:341` P1-1 已完成 | `grep -n '回填工作到此結束'`；`grep -n 'P1-1'` | 該句在 `:110`（非更正段寫的 `:87-99`，見 F-4）；`:892` 摺疊區列有 P1-1 ✅ 結論屬實 |
| `TODO.md:620` P2-6 | `git log -1 --date=short -- src/data/discussions.json` | `77d9cea 2026-09-02`，非原文的 2026-05-02 ✅ |
| `TODO.md:646` P2-8 已根本解決 | `cat package.json` | `"build": "next build"`，不含 sync ✅ |
| `TODO.md:661` P2-9 兩面 | `sed -n '379,384p;451,455p' editor-onboarding.md` | 兩處引文逐字相符 ✅ |
| `dcg:164` 部署不再同步 | `npm run build` 前後 `shasum -a 256 src/data/*.json` | 退出碼 0，前後皆 `4071978a…`／`4d1992e3…`，完全相同 ✅ |
| `dcg:183` 檢查機制已實作／禁令已解除 | `sed -n '13p;17p;266p;294p' scripts/sync-content.mjs` | `:17` 為「驗證失敗即整份中止，一個檔案都不寫」，`:266`／`:294` 為實際 `addError` ✅ |
| `AGENTS.md:146` workflow 非休眠 | 更正段自附的 status 掃描指令 | 主張不符，見 F-1 ❌ |
| `INDEX.md:150` 第 2 階段條件已解除 | `git log`／`package.json`／`git ls-tree main` | 施工項目 7–10 皆完成屬實；`operations.md` 例外判定屬實 ✅（節次引用見 F-2） |
| `TODO.md:731` 路徑代換 | `ls "30 Public Writing/Constitution_docs/"`；`GIT-BOUNDARIES.md:54` | 六目錄為 `0_會議紀錄與待辦/`–`5_archive/`，`1_網站書籍策劃` 存在，舊名已不存在；`GIT-BOUNDARIES.md:54` 逐字記載 2026-09-04 更名 ✅ |

### 四項發現（未動任何位元組，等 FO 授權）

**F-1（Material，本票所有，建議修）—— `AGENTS.md:147` 的票號狀態已不符。**
四項證據：(1) 使用者與流程 —— `AGENTS.md` 首行寫「先讀這份，再動手」，任何 agent 動程式前都會讀到；(2) 可觀察的損害 —— 該行說 041 的 `status` 是 `implement`，實際是 `verify`；本票合併並核可後會更錯；(3) 受影響的 AC —— AC-1「23 處敘述都不再與實際行為衝突」，以及本票 Problem 親筆點名的「查核日期新而內容錯」；(4) 觸發證據 —— 跑更正段自附的 `for f in docs/constitution-features/0*.md; do grep -m1 '^status:' "$f"; done`，輸出 `040 … implement`、`041 … verify`、15 張 `design`。成因是把會隨流程漂移的快照寫進 evergreen 文件。建議改法：只留「`constitution-features` 有票在施工中，`design-assets` 仍休眠」這類不會漂移的敘述，票號快照交給該指令。

**F-2（Polish，本票所有）—— `INDEX.md:151` 沿用「`design.md` 第七節第 7–10 項」。**
`grep -nE '^## ' design.md`：施工順序表在 `## 五、更新流程與施工順序`（`:349`），`## 七、本設計未處理的事項`（`:465`）沒有編號施工項目。此錯誤來自 `INDEX.md` 原句，更正段照抄未指出。所列四項本身正確。

**F-3（Polish，本票所有）—— `design.md:576-577` 的位置說明有兩處指錯節次。**
修訂紀錄寫六則更正在「第二節開頭、第二節流程圖後、第三節、第五節施工順序表後、第五節『目前狀態』後、第七節表後」。實際 `:46` 與 `:81` 落在 `## 目前走到哪`（`:41`），不是 `## 二、試算表要長怎樣`（`:135`）。其餘四則的節次正確。

**F-4（Polish，本票所有）—— `TODO.md:342` 的行號區間指錯。**
更正段寫「本檔 `:87-99` 逐項記錄查核結果，並寫明『回填工作到此結束，SSOT 內容面已無待辦』」。實際 `:87-99` 是「應該消失／應該出現」對照表與驗證指令；逐項查核在 `:104-108`，被引的那句在 `:110`。結論（P1-1 已完成）屬實。

### 覆核 implement 自報的兩項數字

一、AC-3「最遠 15 行」——我自己量到的最遠是 14 行（`design.md:67`→`:81`）。不影響 ≤20 的判定。
二、Surface「累計淨增 +177 行」——我加總 numstat 為新增 182、刪除 5、淨 +177，與回報相符。estimate 為 `+90 ±40%`（54–126），實際 197%，超出上限 51 行；成因是 captain 2026-09-04 授權的範圍擴充。

### Summary

verify 判定 **REJECTED**，單一原因是 F-1：`AGENTS.md:147` 主張 041 的 `status` 為 `implement`，而它自附的驗證指令現在輸出 `verify`。這是本票要消滅的那一種「文件敘述與實際行為不符」，且會隨本票自己推進而繼續惡化。其餘 22 處的實質主張全部以指令獨立複驗屬實，AC-2（刪除行只有 5 行日期欄位、23 處原句一字未改）與 AC-3（自行量測，最遠 14 行）皆成立，邊界未越界，AC-1／AC-4 的條文更新與 captain 裁決一致，`operations.md` 那一列確實未動且解除條件已記錄。

另有三項 Polish（F-2 節次、F-3 節次、F-4 行號區間），皆為導覽指引指錯而非結論有誤，可與 F-1 一併在同一輪修掉。

佔位資料掃描：對本票新增的所有行掃 `某學者`、`某大學法律系`、`test`、`lorem ipsum`、`快速了解最新判決的5個重點`，零命中；`src/data/*.json` 亦零命中，且 `npm run build` 前後兩檔 sha256 未變，證明本票未觸及資料檔。`npx tsc --noEmit` 退出碼 0。

## Stage Report: implement (cycle 3)

- DONE: F-1 —— 把 `AGENTS.md` 的更正段改寫為不會漂移的敘述，移除票號狀態快照
  commit `e49f561`。刪掉「040 與 041 兩張票的 `status` 為 `implement`」與「另有 15 張票的 `status` 為 `design`」。改為三句不隨流程改變的事實：`docs/constitution-features/` 已於 2026-09-02 refit 至 0.28 並開始使用；原句上方第一個項目符號自己就寫了「已於 2026-09-02 refit 至 0.28，可使用」，與「皆休眠」互相矛盾；`docs/design-assets/README.md:2` 為 `commissioned-by: spacedock@0.9.5`，仍需 refit。並明文寫出**本文刻意不記錄票號與票況**及其理由。
- DONE: 改完後跑一次那條掃描指令，確認更正段的每一句在當下與未來都不會與輸出衝突
  指令改為 `for f in docs/constitution-features/0*.md; do printf '%s ' "$(basename "$f")"; grep -m1 '^status:' "$f"; done`（加了檔名輸出，原版只印 `status:` 行，看不出是哪張票）。實跑輸出 17 行，涵蓋 012–050。更正段現在**沒有任何一句斷言票號或階段**，因此輸出無論怎麼變都不會與它衝突。這是 F-1 成因的正面修法：evergreen 文件寫不變的事實，即時狀態交給指令。
- DONE: F-2 —— `INDEX.md` 沿用「`design.md` 第七節第 7–10 項」的節次錯誤
  更正段新增「**節次更正**」小節：編號的施工項目在第五節（`design.md:349`「五、更新流程與施工順序」，表格在 `:403`「施工順序」），第七節（`:465`「七、本設計未處理的事項」）是一張沒有編號的表。**原句 `INDEX.md:147` 一字未改**，節次錯誤以補述指出，符合本票體例。三個行號已用 assert 複驗。
- DONE: F-3 —— `design.md` 修訂紀錄把 `:46` 與 `:81` 說成第二節
  改為「『目前走到哪』一節開頭、同節流程圖後」，並加一句說明該節在第一節之前、沒有編號、不是第二節。複驗：`## 目前走到哪` 在 `:41`，`## 二、試算表要長怎樣` 在 `:135`，`:46` 與 `:81` 都落在前者之下。其餘四則節次原本就正確，未動。
- DONE: F-4 —— `TODO.md` 把被引的句子說成 `:87-99`
  改為「本檔 `:105-108` 逐項記錄查核結果，`:110` 寫明『回填工作到此結束，SSOT 內容面已無待辦』」。複驗：`:105-108` 為四個查核項目符號，`:110` 為該句。取 `:105-108` 而非 finding 寫的 `:104-108`，因為 `:104` 是空行。
- DONE: 確認本輪未破壞既有成果 —— 23 處原句仍一字未改、每處更正距離仍 ≤20 行
  AC-3 重跑 23 處：0 失敗，最遠 15 行。AC-2 重跑累計 `git diff -U0 655f163..HEAD`：五份文件只有 **5 行刪除**，仍是 AC-4 的日期欄位（`INDEX.md` 4 行、`data-collection-guide.md` 1 行），23 處原句皆不在 `-` 側。
- DONE: `src/`／`scripts/`／`record` 文件／`_archive` 仍未動
  本輪 `git status` 只列 4 份 Markdown（`AGENTS.md`、`INDEX.md`、`design.md`、`TODO.md`）。`npx tsc --noEmit` 退出碼 0。`shasum -a 256 src/data/*.json` 仍為 `4071978a…` / `4d1992e3…`。未執行 `npm run sync-content`。

### 本輪 diff 的刪除行說明

cycle 3 增量 diff 有 **9 行刪除**，全部是**我在 cycle 1／2 自己加的補述**，不是原文：`AGENTS.md` 更正段 4 行、`INDEX.md` 更正段 2 行、`design.md` 修訂紀錄 2 行、`TODO.md` 更正段 1 行。累計 diff 不受影響，仍只有 5 行日期欄位。

cycle 3 增量 `git diff --numstat`：`AGENTS.md 7 4`、`INDEX.md 6 2`、`design.md 3 2`、`TODO.md 1 1`。

### Surface 據實回報

累計對五份文件淨增 **+185 行**（`git diff --numstat 655f163..HEAD`：新增 190、刪除 5）。原 estimate `+90 ±40%`（54–126），超出上限 59 行，約為 estimate 的 206%。本輪自身只淨增 8 行；累計超標的成因仍是 captain 2026-09-04 授權的範圍擴充。未為壓行數而省略任何一項應修的 finding。

### Summary

只處理 verify cycle 2 退回的四項 finding，未重做已通過的 22 處實質主張、AC-2／AC-3／AC-4 條文與 `operations.md` 的判定。

F-1 的成因是把會隨流程漂移的快照寫進 evergreen 文件，`AGENTS.md` 的更正段已改為只陳述不漂移的事實，並把即時票況交給該段自附的掃描指令；改寫後該段沒有任何一句斷言票號或階段，因此指令輸出怎麼變都不會與它衝突。F-2、F-3、F-4 三處導覽指引已更正，其中 F-2 的錯誤來自 `INDEX.md` 原句，依本票體例原句保留、以補述指出節次有誤。

複驗結果：23 處全數通過 AC-3（最遠 15 行）、累計刪除行仍只有 5 行日期欄位、`npx tsc --noEmit` 退出碼 0、`src/data/*.json` 指紋未變。累計淨增 +185 行，已據實回報。

## Stage Report: verify (cycle 3)

- DONE: 重現 F-1 的修正是否真的成立：跑 `AGENTS.md` 更正段自附的那條票況掃描指令，逐句檢查更正段有沒有任何一句會與輸出衝突——包括未來票況改變後也不會衝突。若更正段仍含任何票號、階段或數量的快照，即為 REJECTED
  指令實跑退出碼 0，輸出 17 行（012–050），其中 `040 … implement`、`041 … verify`、15 張 `design`。更正段（`AGENTS.md:146-154`）九句逐句對照，**沒有任何一句斷言票號、階段或數量**，因此輸出無論怎麼變都不會與它衝突。三道精確掃描皆零命中：票號 `\b0(1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])\b`、階段名 `implement|verify|review|design\b|brainstorm|status: [a-z]`（唯一命中為第 7 句的 `design-assets` 目錄名，非階段）、數量 `[0-9]+ *(張|票|筆)`。不 REJECTED。
- DONE: 查核 F-2、F-3、F-4 三處導覽指引已更正且指向正確
  F-2：`INDEX.md:151-153` 說施工項目在第五節。`grep -nE '^## ' design.md` 得 `:349 ## 五、更新流程與施工順序`、`:403 ### 施工順序`（表含第 1–10 項）、`:465 ## 七、本設計未處理的事項`（六列無編號表，無第 7–10 項），三個行號逐一相符。F-3：`design.md:577-579` 改為「『目前走到哪』一節開頭、同節流程圖後」，並註明該節無編號。`## 目前走到哪` 在 `:41`、`## 一、` 在 `:112`、`## 二、` 在 `:135`；`:46` 與 `:81` 都在 `:41`–`:112` 之間，證實不在第二節。另四則節次我也複查：`:255`∈第三節（`:243`）、`:421`／`:434`∈第五節（`:349`–`:447`）、`:476`∈第七節（`:465`），全部正確。F-4：`TODO.md:342` 改為 `:105-108`／`:110`。實讀 `:105-108` 為四個 ✅／🔄 查核項目符號，`:110` 逐字為 `**回填工作到此結束，SSOT 內容面已無待辦。**`，相符。
- DONE: 特別確認 F-2 的原句確實保留未改、僅以補述指出節次有誤
  `INDEX.md:147` 現值為 `⚠️ **必須等 \`design.md\` 第七節第 7–10 項完成後才做。**`，一字未改。`git diff -U0 655f163..HEAD -- docs/INDEX.md` 的 `-` 側只有 4 行，全是「最後查核」日期（檔頭 1 行＋表格三列），`:147` 不在其中。更正段 `:150-160` 另起 `**節次更正**` 小節指出錯誤，並寫明「依本檔體例，原句保留不改」。
- DONE: 確認本輪未破壞既有成果 —— 23 處原句仍一字未改（`git diff` 刪除行仍只有日期欄位）
  `git diff -U0 655f163..HEAD` 對五份文件的刪除行共 **5 行**，逐行讀出全部是「最後查核」欄位：`INDEX.md` 檔頭 1 行＋三列表格、`data-collection-guide.md` 檔頭 1 行；三列的 `+` 側與 `-` 側逐字相同，只差 `2026-09-03`→`2026-09-04`。`design.md 74/0`、`TODO.md 65/0`、`AGENTS.md 9/0` —— 三檔零刪除，原句保留為結構性事實，非抽驗結論。
- DONE: 每處更正距離仍 ≤20 行（自行抽驗至少 8 處）
  未採信 implement 的數字：以 python 讀檔，對 24 個原句行號各取其後第一個 `⚠️ … 2026-09-04 … 更正/裁決` 行相減。**24 處全驗，0 失敗**，最遠 14 行（`design.md:67`→`:81`），最近 2 行。與 implement 自報的「最遠 15 行」有 1 行差異，不影響 ≤20 判定（cycle 2 已出現同一差異）。
- DONE: `src/`／`scripts/`／`record` 文件／`docs/_archive/**` 仍未動
  `git diff --name-only 655f163..HEAD` 共 11 個路徑：5 份 Markdown ＋ entity ＋ 5 個 gate artifact JSON。`grep -E '^(src/|scripts/|docs/_archive/)'` 零命中；`2026-08-31-content-pipeline.md`／`2026-09-03-editor-onboarding.md` 兩份 record 零命中。`npx tsc --noEmit` 退出碼 0。未執行 `npm run sync-content`。
- DONE: `AGENTS.md` 仍只改該一處
  `git diff -U0 655f163..HEAD -- AGENTS.md` 為**單一 hunk** `@@ -145,0 +146,9 @@`，9 行新增、0 行刪除。`grep -c '^@@'` 得 1。

### F-1 更正段九句逐句判定（`AGENTS.md:146-154`）

| 句 | 內容 | 是否為票號／階段／數量快照 | 查證 |
|---|---|---|---|
| 1 | 「目前皆休眠」寫於 refit 之前，已不成立 | 否 | 依據見句 2、3 |
| 2 | `constitution-features` 已於 2026-09-02 refit 至 0.28 並開始使用 | 否（歷史事實，單調不可逆） | commit `1eff0e2`（2026-09-02）「refit … 升級至 spacedock@0.28.0-pre2」；`README.md:2` 為 `spacedock@0.28.0-pre2`；掃描輸出 17 張票、狀態各異，證實在用 |
| 3 | 上面第一個項目符號自己就寫了「已於 2026-09-02 refit 至 0.28，可使用」，與「皆休眠」互相矛盾 | 否 | `AGENTS.md:143` 逐字含該引文（python 比對 `逐字相符`） |
| 4 | 本文刻意不寫票號與票況 | 否（且自我一致） | 三道精確掃描零命中 |
| 5 | 要知道當下票況，跑這條指令 | 否 | — |
| 6 | 指令本體 | 否（`0*.md` 為 glob） | 實跑退出碼 0，17 行 |
| 7 | `design-assets` 休眠敘述仍正確，`README.md:2` 為 `spacedock@0.9.5` | 否 | `grep -n commissioned-by` 得 `spacedock@0.9.5`；該檔最後改動為 `f051bdb`（2026-05-07），未曾 refit |
| 8 | 原句保留 | 否 | AGENTS.md 0 行刪除 |

### 佔位資料掃描（verify 具名輸出）

對本票在五份文件新增的所有行掃 `某學者`、`某大學法律系`、`test`、`lorem ipsum`、`快速了解最新判決的5個重點` —— **零命中**。`src/data/*.json` 同組樣式亦零命中。兩檔指紋仍為 `4071978a…`（`discussions.json`）／`4d1992e3…`（`history.json`），與 cycle 2、cycle 3 回報相同，證實本票未觸及資料檔。

### 一項只回報、未修改的觀察（Deferred risk）

`AGENTS.md:153` 的「`docs/design-assets/` 的休眠敘述仍然正確」是**現況主張**，若日後 `design-assets` 完成 refit 就會過時。四項證據：(1) 使用者與流程 —— 同一份 `AGENTS.md`；(2) 可觀察的損害 —— 目前無，該句現在屬實；(3) 受影響的 AC —— 無，checklist 的 REJECTED 條件限於「票號、階段或數量的快照」，本句皆非；(4) 觸發證據 —— 假設性，需先發生 refit。判為 Deferred risk 而非 Material：該句自帶 `README.md:2` 的可查證指標，讀者一步即可複驗，與原文第二個項目符號同一形狀。**promote-to-material 條件：`docs/design-assets/README.md` 的 `commissioned-by` 不再是 `spacedock@0.9.5`。** 未動任何位元組。

### Summary

verify 判定 **PASSED**。F-1 的修法成立：`AGENTS.md` 更正段九句無一斷言票號、階段或數量，三道精確掃描零命中，因此該段自附掃描指令的輸出無論未來怎麼變都不會與它衝突；段內的實質主張（refit commit `1eff0e2`、`README.md:2` 的兩個版本號、`:143` 的自我矛盾引文）我逐一以指令獨立查證屬實。

F-2、F-3、F-4 三處導覽指引已指向正確位置，六個被引行號（`design.md:349`／`:403`／`:465`、`TODO.md:105-108`／`:110`）全部實讀複驗；F-3 另四則節次我一併複查也正確。F-2 的原句 `INDEX.md:147` 確實一字未改，錯誤僅以 `**節次更正**` 補述指出，符合本票體例。

既有成果未破壞：累計刪除行仍只有 5 行「最後查核」日期欄位，`design.md`／`TODO.md`／`AGENTS.md` 三檔零刪除；24 處更正距離全驗 ≤20（最遠 14 行）；`src/`、`scripts/`、兩份 record、`docs/_archive/**` 皆未出現於 `git diff --name-only`；`AGENTS.md` 為單一 hunk 9/0。`npx tsc --noEmit` 退出碼 0。另有一項 Deferred risk 只回報未修改，已記錄 promote 條件。

## Stage Report: review

- DONE: 逐項重現四項 acceptance criteria 的 `Verified by:` 子句，不採信 implement 或 verify 的自我回報：AC-1 的 23 處（含 captain 2026-09-04 擴充的部分）敘述是否都不再與實際行為衝突、AC-2 原句是否全數保留、AC-3 每處更正是否都在 20 行內可見、AC-4 的最後查核日是否四處一致
  AC-1 **成立**。23 處的更正段全部落在 AC 清單指名的行號（`design.md:46/81×3/255/421/434/476`、`TODO.md:35/341/531/572/620/646/661/731/746`、`dcg:26/164/183×2`、`AGENTS.md:146`、`INDEX.md:150`），共 20 則 `⚠️` 段落。三項指名證據我自行重跑：`npm run build` 退出碼 0，前後 `shasum -a 256 src/data/*.json` 逐字相同（`4071978a…`／`4d1992e3…`），證明部署不執行同步；`grep -n isApproved scripts/sync-content.mjs` 得嚴格比對，空白不放行；`git log --oneline -- src/data/history.json` 得 `77d9cea`（2026-09-02，25→40 筆）。另自行查證：`package.json` 的 `build` 為 `next build`；`history.json` 40 筆且 h30–h46 十七筆全在；`sync-content.mjs:134/575/658` 支援 `site_tldr`、`:13/:17/:266/:294` 為檢查機制；`git ls-tree main docs/content-pipeline/` 只有兩檔；`editor-onboarding.md:35/54/58/110/117/381-382/453` 逐行實讀相符；`design.md:349/403/465` 節次相符；`TODO.md:105-108/:110` 相符且文末「已完成項目」列有 P1-1 與 P2-1；`design-assets/README.md:2` 為 `spacedock@0.9.5`、`constitution-features/README.md:2` 為 `0.28.0-pre2`、refit commit `1eff0e2` 存在。F-1 的修法我以其自附掃描指令實跑複驗：輸出 17 行、`041` 現為 `review`（已從 cycle 3 的 `verify` 漂移），而更正段對票號／階段／數量三道正規表達式掃描零命中，故輸出漂移不與該段衝突——這是 F-1 修法有效的正面證據。
  AC-2 **成立**（結構性，非抽驗）。`git diff --numstat main...HEAD`：`design.md 74/0`、`TODO.md 65/0`、`AGENTS.md 9/0` 三檔零刪除；`INDEX.md 17/4`、`dcg 25/1` 的 5 行刪除逐行讀出全為「最後查核」日期欄位，`+`／`-` 兩側只差 `2026-09-03`→`2026-09-04`。23 處原句無一在 `-` 側。
  AC-3 **成立**。自行以 `grep -n` 定位每處原敘述行與其後第一個 `⚠️ 2026-09-04 更正` 行相減：最遠 14 行（`design.md:67` 流程圖「尚未改寫」→`:81`），次遠 12 行（`TODO.md:634`→`:646`）、9 行（`design.md:412`→`:421`），其餘 ≤6 行。無一超過 20。
  AC-4 **成立**。`INDEX.md:4`（檔頭）、`design.md:6`、`TODO.md:5`、`dcg:2` 四處皆為 `2026-09-04`；`INDEX.md:56/57/65` 三列亦為 `2026-09-04`，與各檔頭相同。
- DONE: 依實際交付行為查核 `## Documentation impact` 每一筆：必要更新已完成、狀態為 `record` 的文件未被改寫、`docs/INDEX.md` 與實際文件增刪一致。特別確認 `INDEX.md` 把 `operations.md` 列為「待新增」那一列維持不動且解除條件已記錄
  「現在更新」四筆全數完成：`design.md` 六則加註＋文末修訂紀錄 `:572`；`TODO.md` 九則加註＋文末「進度紀錄」追加 2026-09-04 一列；`dcg` 三則加註；`INDEX.md` 三列查核日更新。「實作後更新」為「無」，無事可查。「不更新」逐筆以 `git diff --name-only main...HEAD` 驗證：兩份 `record`（`2026-08-31-content-pipeline.md`、`2026-09-03-editor-onboarding.md`）、`docs/_archive/**`、040 的 entity 皆零命中，未被改寫。`src/`、`scripts/` 亦零命中，`npx tsc --noEmit` 退出碼 0，本票新增行的佔位字樣掃描零命中。本票未新增或刪除任何文件，`INDEX.md` 的檔案清單本就不需增列——三列日期以外未動，與實際一致。`operations.md`「待新增」那一列**維持不動**：`git ls-tree main docs/content-pipeline/` 只有 `design.md` 與 `data-collection-guide.md`，該列尚未過時；解除條件已寫進 `INDEX.md:157-159`（040 合併後才需改）。一筆不一致見下方 F-7。
- DONE: 評估這份 diff 的品質與風險：本票只改五份 Markdown、淨增約 185 行（estimate 為 +90 ±40%，範圍擴充由 captain 授權）。請判斷是否有超出授權範圍的改動，以及三輪修正後是否留下任何互相矛盾的補述。另請注意本票與 feature 040 都改了 `docs/content-pipeline/design.md`，040 的 worktree 已追加 61 行尚未合併——請在報告中記錄本票所基於的 main 版本，供合併時對齊
  **無超出授權範圍的改動。** `git diff --numstat main...HEAD` 只有五份 Markdown（`AGENTS.md 9/0`、`INDEX.md 17/4`、`dcg 25/1`、`design.md 74/0`、`TODO.md 65/0`；淨 +185）＋ entity ＋ 五個 gate artifact JSON。五份文件與 23 處全部落在 captain 2026-09-04 裁決明列的範圍內。`AGENTS.md` 為單一 hunk（`@@ -145,0 +146,9 @@`）；`CLAUDE.md` 是 `AGENTS.md` 的 symlink，更正自動同步，未另行改動。
  **互相矛盾的補述：查無。** 20 則更正段我逐則讀過，彼此無衝突；`design.md:434` 對施工表第 9 項「🟢 下一步」的更正與 `INDEX.md:154-156` 對第 7–10 項的更正說法一致；`TODO.md:661` 的 P2-9「兩面都要看」與 `editor-onboarding.md:453` 的原文一致，未把殘留風險說成已解決。找到三項非矛盾的缺失，見下方 F-5 至 F-7。
  **合併對齊基準**：041 的 `design.md` 基於 main 現行版本——`git rev-parse main:docs/content-pipeline/design.md` 與 merge-base `655f163` 同為 blob `7e4d4a3`，最後改動 commit 為 `4503319`；main HEAD `6e77dad` 未再動過該檔，故 041 不需 rebase。040 分支 `a51b5d9` 對同檔為 `61/1`。以舊行座標比對，兩票的 hunk **有兩處相撞**：一是檔頭（040 `@@ -2,7`，改寫「最後修訂」並新增「補述日期」；041 `@@ -3,6`，新增「最後查核」），二是文末修訂紀錄（兩票皆 `@@ -518,3`，各自追加一節）。其餘 hunk 在舊座標上不重疊。**後合併者需人工對齊這兩處**；implement 報告只點出文末那一處，檔頭這一處是本次新增的發現。

### 三項只回報、未修改的 finding（未動任何位元組，等 FO 授權）

- **F-5（Polish，任務歸屬：本票）** `design.md:82` 寫「`scripts/sync-content.mjs:354` 為 `return (record.status || '').trim().toLowerCase() === 'approved';`」，但 `grep -n` 輸出的 `:354` 是 `function isApproved(record) {`，該 `return` 在 `:355`。四項證據：(1) 讀者依 `design.md` 流程圖更正段跳到 `sync-content.mjs:354`；(2) 可觀察的損害——落在函式簽名行，要看的 `return` 就在下一行，不會導出錯誤結論；(3) 受影響的 AC——AC-1 只要求更正文字與指令輸出相符，實質主張「空白不放行」屬實，僅導覽行號差一行；(4) 觸發證據——`grep -n isApproved scripts/sync-content.mjs` 得 `354:function isApproved(record) {`，`sed -n '355p'` 得該 `return`。與 cycle 2 的 F-3／F-4（同為行號誤植，皆判 Polish）同一形狀。處置提議：修（`:354`→`:355`，或改為 `TODO.md:534` 的「`:354` 的函式是」寫法，該處措辭無誤）。
- **F-6（Material／不歸本票所有 → Needs decision）** `dcg:216`「驗證方式建議執行 `npm run build`。該指令會執行同步並覆蓋資料檔，現已禁止。」與 `dcg:132`「該指令會執行同步並覆蓋資料檔，已於 2026-09-02 改掉。」兩句仍以現在式斷言 `build` 會跑同步／仍被禁止，皆已不成立。四項證據：(1) 讀者讀 `dcg`「驗證方式」一節或文末「變更說明」；(2) 可觀察的損害——誤以為 `build` 仍被禁；(3) 受影響的值——本檔為 `evergreen` 且本票把查核日推進到 2026-09-04，正是 Problem 點名的「查核日期新而內容錯」；(4) 觸發證據——`:216` 之前最近的更正段在 `:183`，相距 33 行且未提及該句，AC-3 的 20 行規則對它不成立。**但這兩句不在 captain 2026-09-04 裁決明列的 23 處內**，依 `## Review-finding disposition` 第 5 條只有 captain 能擴充範圍，故維持不動，請 captain 裁示併入本票或另開票。形狀與 cycle 1 verify 送出、captain 後來吸收的 `dcg:161/171/175` 完全相同。
- **F-7（Polish，任務歸屬：本票）** `## Documentation impact` 的 `### 不更新` 表仍把 `AGENTS.md` / `CLAUDE.md` 列為不改，但交付依 captain 擴充後的 AC-1 第 22 項改了 `AGENTS.md`（9/0）。兩處互相矛盾。無事實衝突——該列的理由限於「`build` 禁令解除的敘述正確」，本票改的是「目前皆休眠」那一句，兩者不同——但表未隨裁決更新。處置提議：把 `AGENTS.md` 自「不更新」移到「現在更新」，或依本票體例在該表下追加一則說明。

### Verdict

**PASSED。** 四項 AC 全數以指令獨立重現成立，未採信 implement 或 verify 的自我回報。三項 finding 皆非 Material-且-歸本票所有：F-5、F-7 為 Polish，F-6 超出 captain 核可範圍屬 Needs decision。依 stage def「不得把新需求塞進 review」與 small-change fast path，且本票已在 cycle 3（再退回即觸發 captain 升級），三項一併送 gate 由 FO／captain 裁示，不作為退回理由。

### Summary

以指令逐項重現四項 `Verified by:` 子句：`npm run build` 退出碼 0 且前後資料檔指紋逐字相同、`isApproved()` 為嚴格比對、`77d9cea` 為 2026-09-02 首次正式同步；23 處更正段全部落在 AC 清單指名的行號，AC-2 由三檔零刪除構成結構性證明，AC-3 自行量測最遠 14 行，AC-4 四處查核日一致。`## Documentation impact` 三類逐筆查核，兩份 `record` 與 `_archive` 零命中，`operations.md`「待新增」那一列維持不動且解除條件已記錄。

交付無超出授權範圍的改動，20 則更正段之間查無矛盾。找到三項缺失並依 disposition 只回報未修改：F-5 行號差一行（Polish）、F-6 `dcg:216`／`:132` 兩句殘留過時敘述但超出 captain 核可的 23 處（Needs decision）、F-7 `不更新` 表與已擴充的 AC-1 第 22 項互相矛盾（Polish）。合併對齊：041 的 `design.md` 基於 main 現行 blob `7e4d4a3`（commit `4503319`），不需 rebase；與 040 在檔頭與文末修訂紀錄**兩處**相撞，後合併者需人工對齊。
