---
title: 核可綁定內容版本並在修改後退回重審
status: implement
source: captain 2026-09-03
started: 2026-09-03T19:46:08Z
completed:
verdict:
score: 0.95
worktree: .worktrees/spacedock-ensign-040-approval-content-version-binding
issue:
pr:
mod-block:
id: 040
gates:
    version: 1
    records:
        - id: gate:040:verify
          stage: verify
          attempts:
            - id: gate-attempt:040-verify-1
              briefing:
                id: briefing:040:verify:attempt-1:revision-1
                digest: sha256:1bea6e99d4d347df3b6af0a61e964673b14d2e60c52514f616ed1e29f70f13bb
                room-ref: '@review/verify/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:040:verify:1
                briefing: briefing:040:verify:attempt-1:revision-1
                by: person:captain
                at: "2026-09-04T18:52:46.818197Z"
                decision: revise
                reason: AC-6 未成立：design.md:230-231 與 :343 仍教人直接改 status／只按 status 放行，與 :526 起的取代聲明互斥，正常讀者先撞上舊流程，違反『唯一現行規格』。captain 於 2026-09-04 裁決方案 B：AC-2／AC-4 所需的兩帳號隔離表 probe 移出本 feature 另行開票，040 以 repo 端 fail-closed 同步閘門先落地。退回 implement：(1) 清除 design.md 互斥現行指示；(2) 依 FO 授權 fix 修正 APPROVAL_STATUS 無效曆日未 fail closed；(3) 依裁決重寫 AC-2／AC-4 範圍。
---

讓 SSOT 的核可結果綁定被核可的內容版本。核可後只要發布欄位被修改，該列必須顯示 `Needs review`，而且同步程式必須拒絕沿用舊核可。

## Problem

現行同步只檢查 `status = Approved`。投稿者、學者或責任編輯在核可後修改同列內容時，`Approved` 不會失效。下一次同步會把未重新核可的內容送入 PR。

這會切斷「編輯核可的是實際發布內容」的證明鏈。PR 預覽仍是必要防線，但不能取代 SSOT 內的逐列核可。

## Proposed approach

採用「衍生狀態＋同步端指紋」雙層機制。

`status` 改為公式產生的唯讀欄位。公式比較目前指紋、最後審核指紋與最後審核決定。內容改變時，公式直接顯示 `Needs review`。這條路徑不需要觸發器寫入受保護欄位。

同步程式重新計算指紋。只有 `status = Approved`、最後決定為 `Approved`、核可紀錄完整，且三個指紋相同時才放行。任一列不符時，整份同步中止。

不採只靠 `onEdit` 清除狀態。該方案無法讓同步端獨立證明自動化曾成功執行。

## Risk evidence

**結論：受保護欄位的觸發器寫入路徑為 `UNPROVEN`。本設計不依賴它。**

design worker 沒有隔離測試表的兩個 Google 帳號。repo 也沒有 Apps Script 專案、`clasp` 設定或 Google API credential。worker 不得用正式 SSOT、credential 或受保護範圍補做測試。

Google 官方文件只能證明機制，不是本專案的端到端證據：

- [Installable triggers](https://developers.google.com/apps-script/guides/triggers/installable) 說明 installable trigger 以建立者帳號執行。
- [Protected sheets and ranges](https://support.google.com/docs/answer/1218656) 說明受保護範圍可限制可編輯者。
- [Protection class](https://developers.google.com/apps-script/reference/spreadsheet/protection) 提供 `canEdit()` 檢查。

後續可在隔離測試表提升這條路徑。測試者 A 建立 installable edit trigger，並獨占審核欄位。測試者 B 只能改內容欄位。B 修改內容後，測試必須觀察 A 身分的執行紀錄、受保護欄位成功寫入及 B 仍無法手改該欄位。任一條不成立，就維持公式方案。

即使後續測試通過，trigger 只能作為加速提示。同步端指紋仍是發布閘門。

## Data requirements

### 審核欄位

三個發布分頁都加入下列欄位：

| 欄位 | 型別與來源 | 責任 |
|---|---|---|
| `status` | 公式；`Approved`、`Rejected`、`Needs review` 或空白 | 顯示有效狀態；人不得直接輸入 |
| `review_decision` | 保護欄位；`Approved`、`Rejected` 或空白 | 保存最後一次審核決定 |
| `review_fingerprint` | 保護欄位；64 字元小寫 SHA-256 | 綁定最後一次審核的內容 |
| `approved_by` | 保護欄位；非空字串 | 保存最近一次核可者 |
| `approved_at` | 保護欄位；ISO 8601 UTC | 保存最近一次核可時間 |
| `approved_fingerprint` | 保護欄位；64 字元小寫 SHA-256 | 綁定最近一次核可內容 |
| `current_fingerprint` | 公式；64 字元小寫 SHA-256 或明確錯誤 | 顯示目前內容指紋 |
| `reject_reason` | 保護欄位；字串 | 保存退回原因 |

拒絕後保留最近一次 `approved_*`。這些欄位是稽核紀錄。同步只接受與目前決定一致的新核可。

### 發布欄位範圍

指紋只涵蓋會改變 JSON 的輸入：

| 分頁 | 指紋欄位，順序固定 |
|---|---|
| `Track 1_history` | `id`, `category`, `chapter`, `content`, `handwriting`, `year`, `title`, `ruling`, `ruling_id`, `image_url` |
| `Track 2_discussion` | `id`, `category`, `title`, `author`, `year`, `abstract`, `link`, `views`, `owl_comment`, `owl_depth_comment`, `vibe`, `sticky`, `full_content` |
| `site_tldr`, `order = 0` | `order`, `text`, `link` |
| `site_tldr`, `order >= 1` | `order`, `label`, `text` |

`status`、所有審核欄位與 `reject_reason` 不進指紋。未知欄位仍依現行規則中止同步。移動欄位不改變指紋，因為程式依欄名取值。

Track 1 依 `year` 排序。`site_tldr` 依 `order` 排序。Track 2 保留來源列順序。實作須把 Track 2 的非空資料列序號加入指紋，避免移動列後沿用核可。序號不使用試算表實體列號，避免插入空白列造成誤退回。

### 指紋正規化

Apps Script 與 Node 共用下列 `fingerprint-v1` 規格：

1. 先依上表投影欄位。不得依物件列舉順序決定欄位。
2. 一般文字轉成字串、Unicode NFC、CRLF/CR 轉 LF，再執行 JavaScript `trim()`。
3. `sticky` 正規化為 `true` 或 `false`。空白等同 `false`，與現行 JSON 輸出一致。
4. `views` 空白保留空字串。非空值驗證後轉為十進位整數字串。
5. `order` 驗證後轉為十進位整數字串。
6. 將內容編碼為 `JSON.stringify(["approval-content-v1", sheetKey, [[field, value], ...]])`。
7. 對 UTF-8 bytes 計算 SHA-256。輸出 64 字元小寫十六進位。

無法正規化的值不產生可核可指紋。同步要沿用現有欄位錯誤，並整份中止。

## State transitions

| 事件 | 寫入 | 衍生 `status` |
|---|---|---|
| 空白列 | 無 | 空白 |
| 有內容但從未審核 | 無 | `Needs review` |
| 編輯台核可 | `review_decision = Approved`；兩個 fingerprint 寫目前值；寫 `approved_by`、`approved_at`；清空 `reject_reason` | `Approved` |
| 編輯台拒絕 | `review_decision = Rejected`；`review_fingerprint` 寫目前值；寫 `reject_reason`；保留 `approved_*` | `Rejected` |
| 任一發布欄位改變 | 不寫保護欄位 | `Needs review` |
| 只改審核欄位 | 依公式重算 | 內容指紋不變 |
| 再次核可 | 覆寫本次核可紀錄 | `Approved` |

`status` 公式只有在必要欄位完整且指紋相等時顯示 `Approved`。公式錯誤、缺欄或未知值一律不可顯示 `Approved`。

舊列不能批次補造指紋。部署新欄位後，既有 `Approved` 全部先顯示 `Needs review`。編輯台重新核可後才能同步。

## Responsibilities and component hierarchy

本功能不新增網站 React 元件。

```text
Google Sheet row
├─ CONTENT_FINGERPRINT(sheetKey, fields...)
│  └─ 只讀：產生 current_fingerprint
├─ status formula
│  └─ 只讀：依 decision 與 fingerprints 顯示狀態
└─ Review menu actions
   ├─ approveActiveRows(): 寫核可快照與操作者
   └─ rejectActiveRows(reason): 寫拒絕快照與原因

scripts/content-fingerprint.mjs
└─ fingerprintPublishedRow(sheetKey, record, sequence?)

scripts/sync-content.mjs
├─ 解析 CSV 與驗證欄位
├─ validateApprovalBinding(): 比對決定、紀錄與指紋
└─ 任何錯誤先 abort，再進入既有原子寫入
```

Review menu 每次只處理選取列。動作先取得文件鎖，再讀取與寫入。寫入後呼叫 `SpreadsheetApp.flush()` 並重讀。若指紋在動作期間改變，動作失敗且不得顯示 `Approved`。

公式與選單程式碼必須存入 repo。不得只存在試算表內。Apps Script 專案需宣告所需 scope 與部署步驟。

### Desktop and mobile

桌面版 Google Sheets 提供 Review 選單。手機版仍顯示公式狀態，但不保證可執行自訂選單。編輯台核可使用桌面版。網站桌面版與手機版都不改 UI。

## Expected surface and tolerance

Estimate: +500 net LOC across 8 files, tolerance ±40%.

預期檔案：

- `scripts/content-fingerprint.mjs`：共用 Node 指紋函式。
- `scripts/sync-content.mjs`：欄位、狀態與同步拒絕條件。
- `scripts/apps-script/approval-workflow.gs`：公式函式與審核操作。
- `scripts/apps-script/appsscript.json`：scope 與 runtime 宣告。
- `tests/approval-content-version-binding.test.mjs`：Node fixture 測試。
- `docs/content-pipeline/design.md`：現行產線規格。
- `docs/content-pipeline/operations.md` 與 `docs/INDEX.md`：操作與索引。

Semantics this may change: SSOT 核可操作、`status` 來源、允許狀態、CSV 欄位結構、同步放行條件與錯誤訊息。不得改網站資料 shape。

## Acceptance criteria

**AC-1 — 核可後的發布內容不可在未重新核可時通過同步。**
Verified by: `tests/approval-content-version-binding.test.mjs` 先核可 fixture，再逐一修改上表每個發布欄位。每次都要得到非零退出碼，且 `src/data/*.json` 的 sha256 不變。漏掉任一欄位會使測試失敗。

**AC-2 — 核可後修改發布欄位會使衍生 `status` 變成 `Needs review`。**
Verified by: `tests/approval-content-version-binding.test.mjs` 以 `node:vm` 載入 `scripts/apps-script/approval-workflow.gs`，逐一修改三個分頁的每個發布欄位。每次都要求 `CONTENT_FINGERPRINT` 改變，且 `APPROVAL_STATUS` 在核可快照三欄不變的情況下回傳 `Needs review`。漏掉任一欄位投影，或讓 `APPROVAL_STATUS` 不比對指紋，測試就會失敗。
範圍：本 AC 只驗證 repo 內的公式邏輯。實際 Google 試算表上的兩帳號行為由 feature `044-approval-permission-two-account-probe` 承接（captain 2026-09-04 裁決）。

**AC-3 — 只有完整且與目前內容相符的核可紀錄可以發布。**
Verified by: `tests/approval-content-version-binding.test.mjs` 測試缺少核可者、時間、任一指紋、偽造 `Approved`、錯誤指紋及有效紀錄。前六類被拒絕，只有有效紀錄通過。放寬任一必要條件會使測試失敗。

**AC-4 — 放行判斷不因操作者身分而豁免。**
Verified by: `tests/approval-content-version-binding.test.mjs` 以三個不同的 `approved_by`（投稿者、責任編輯、與核可者同一人）重跑「核可後修改內容」案例。三者都必須讓 `APPROVAL_STATUS` 回傳 `Needs review`，且同步以非零退出碼中止。若任一段程式依 `approved_by` 放寬條件，對應案例會通過而使測試失敗。
範圍：本 AC 只驗證 repo 內的判斷邏輯不讀取身分。責任編輯以自己帳號在正式試算表編輯時的端到端行為由 feature `044-approval-permission-two-account-probe` 承接（captain 2026-09-04 裁決）。

**AC-5 — 非發布欄位變動不會造成無效退回。**
Verified by: `tests/approval-content-version-binding.test.mjs` 分別修改 `review_decision`、`approved_*` 與 `reject_reason`，確認內容指紋不變。把任一審核欄位納入投影會使測試失敗。

**AC-6 — 新規則成為內容產線的唯一現行規格。**
Verified by: repo 外部 review checklist 比對 `docs/content-pipeline/design.md`、`docs/content-pipeline/operations.md`、`docs/INDEX.md` 與實際測試。任一現行文件仍宣稱只靠 `status = Approved` 放行時判定失敗。

## Test plan

使用 Node 內建 test runner。測試以本機 HTTP fixture 提供三份 CSV。測試把輸出指向臨時目錄，不得讀 `.env.local`，也不得改 `src/data/*.json`。

覆蓋核可紀錄、正規化等價、每個發布欄位、Track 2 列順序、全有全無寫入及可定位錯誤。執行 `node --test tests/approval-content-version-binding.test.mjs`、`npx tsc --noEmit` 與 `npm run build`。不可執行 `npm run sync-content`。

隔離試算表 probe 覆蓋投稿者、責任編輯、核可、拒絕、內容修改及非發布欄位修改。probe 必須記錄測試表 ID 的雜湊、時間、兩個角色、步驟、結果與 Apps Script execution ID。不得記錄帳號 email 或正式 SSOT URL。

**補述（2026-09-04，captain 裁決）**：上一段的 probe 移出本 feature，由 feature `044-approval-permission-two-account-probe` 承接。本 feature 只交付 repo 端可獨立重跑的驗證。probe 尚未執行，`docs/content-pipeline/approval-permission-probe.md` 仍不得建立。

## Documentation impact

### 現在更新

- `docs/constitution-features/040-approval-content-version-binding.md`：記錄已定方向、`UNPROVEN` 風險與驗證目標。這是設計，尚未實作。
- `docs/content-pipeline/design.md`：記錄公式衍生 `status` 與同步端指紋的已定方向。明記行為尚未實作。
- `docs/health-check/TODO.md`：記錄施工與隔離 probe 待辦。明記正式 SSOT 尚未套用新行為。
- `docs/INDEX.md`：索引本 feature 的已定方向與計畫狀態。不得寫成已上線。

### 實作後更新

- `docs/content-pipeline/operations.md`：記錄核可、拒絕、重審、同步錯誤與復原步驟。
- `docs/content-pipeline/approval-permission-probe.md`：新增隔離表端到端證據。狀態為 `record`。
  **補述（2026-09-04）**：本項改由 feature `044-approval-permission-two-account-probe` 負責。本 feature 不建立此檔。
- `docs/project/tech-stack.md`：移除過時資料流警告，改寫為已實作的試算表、指紋、同步與 JSON 流程。
- `docs/project/contributing.md`：更新內容協作與重新核可流程。
- `AGENTS.md`：更新 agent 可用的產線驗證指令、禁止事項與正式 SSOT 邊界。
- `docs/INDEX.md`：新增實作後文件，更新用途、狀態與最後查核日。

### 不更新

- `docs/content-pipeline/data-collection-guide.md`：只規範 T3 資料收集，不負責 T1／T2 核可產線。
- `docs/project/architecture.md`：網站資訊架構不變。
- `docs/project/design-system.md`：網站視覺與元件語言不變。
- `docs/health-check/2026-08-31-content-pipeline.md`：是歷史體檢記錄，不改寫。
- `docs/_archive/`：是封存記錄，不套用現行規格。
- `docs/constitution-features/README.md`：workflow 規格不因單一 feature 改變。

### Feedback Cycles


## Out of scope

不處理既有內容的法律正確性。不恢復自動部署同步。不取消 PR diff 與預覽核可。不上線正式 SSOT 設定，直到隔離測試表完成驗證並由 captain 確認。

隔離測試表的兩帳號 probe 不在本 feature 範圍。captain 於 2026-09-04 裁決：現有條件（無測試表、無兩個 Google 帳號、禁止觸碰正式 SSOT）下 worker 無法完成該驗證，改由 feature `044-approval-permission-two-account-probe` 承接。受保護欄位的 trigger 寫入路徑維持 `UNPROVEN`。

## Stage Report: design

- SKIPPED: 以最小端到端證據確認 Apps Script 對受保護審核欄位的實際寫入權限，並依結果選定不依賴未證明能力的安全設計。
  repo 無測試專案與 credential，且禁止接觸正式 SSOT；權限路徑明記 `UNPROVEN`，公式衍生狀態與同步指紋都不依賴 trigger 寫入。
- DONE: 把內容指紋正規化、發布欄位範圍、核可與 Needs review 狀態轉換、同步拒絕條件寫成可由不同實作者完成的具體規格。
  規格固定 `fingerprint-v1` 編碼、三分頁欄位投影、審核欄位、狀態表、模組責任及失敗關閉條件。
- DONE: 補齊 Documentation impact 三類文件，並讓每項驗收標準都有可失敗且位於 feature 外部的驗證方式。
  三類完整列出現在須記方向、實作後須更新及不更新的文件與理由；六項 AC 指向 `tests/` 或 `docs/content-pipeline/` 的外部驗證。

### Summary

選定不依賴受保護欄位 trigger 寫入的安全設計。`status` 由公式顯示，Node 同步以相同 SHA-256 規格獨立把關。
正式 SSOT 維持不動。兩帳號隔離 probe 通過後，trigger 也只能作為加速提示，不能取代同步閘門。

## Stage Report: design (cycle 2)

- DONE: 更新 docs/content-pipeline/design.md，記錄 feature 040 已定案的公式衍生狀態與同步端指紋方向，明載尚未實作、正式 SSOT 未套用，並用追加修訂保留舊設計脈絡。
  追加 2026-09-03 修訂，連回 feature 040，並明列目前能力、取代時點與可失敗的驗證目標。
- DONE: 更新 docs/health-check/TODO.md，新增 approval 未綁定內容版本的結構性問題、連到 feature 040、列出完成條件與對多人編輯及正式同步的前置關係，並修正與 workflow refit 現況直接衝突的舊追蹤狀態。
  新增 P2-12，修正 P3-5 為 0.28 refit 已完成，並把 P3-1 與下次正式同步標為前置相依。
- DONE: 更新 docs/INDEX.md，只更新 workflow 活躍狀態、實際數量、相關文件用途與 2026-09-03 查核日期；不得替 feature 040 新增單獨索引列，也不得把未實作行為寫成現況。
  索引記錄 33 個封存 entity、7 個進行中、6 份 debrief；feature 040 只出現在既有文件用途說明。

### Summary

三份 pre-implementation 文件已同步 feature 040 的已定方向與未實作狀態。此次只更新文件，沒有改程式或正式 SSOT。
TODO 現在把版本綁定列為多人編輯與下次正式同步的前置。INDEX 也反映 workflow 的實際活躍狀態與數量。

## Stage Report: implement

- DONE: 實作 fingerprint-v1 的 Node 與 Apps Script 對應機制、三分頁發布欄位投影及核可操作；不得改網站資料 shape，也不得依賴未證明的受保護欄位 trigger 寫入。
  commit `b75c98c` 新增 Node／Apps Script 同規格指紋、公式狀態及鎖定式核可／拒絕操作；有效 fixture 斷言既有 JSON keys 與 Track 2 順序不變。
- DONE: 讓同步對狀態、決定、核可人、時間及指紋採 fail-closed 驗證；fixture 測試必須覆蓋每個發布欄位、偽造或缺漏紀錄、正規化、Track 2 順序與全有全無寫入。
  `node --test tests/approval-content-version-binding.test.mjs` 通過 44 項；漏投影欄位、放寬核可紀錄、移除序號或移除 rollback 都會使對應測試失敗。
- DONE: 更新實作後才成立的操作與架構文件，但不得碰正式 SSOT、不得恢復自動同步，也不得偽造尚未執行的兩帳號 probe 證據。
  commit `b75c98c` 更新操作、架構、協作、索引與待辦；文件明載正式 SSOT 未部署且兩帳號 probe 尚未執行。
- SKIPPED: 執行隔離試算表兩帳號 probe。
  本 stage 沒有測試表或兩個 Google 帳號；維持 `UNPROVEN`，未新增 `approval-permission-probe.md` 或偽造 execution ID。
- SKIPPED: 執行 `npm run build`。
  implement stage definition 明確禁止；改以 `npx tsc --noEmit` 驗證，結果通過。

### Summary

repo 已完成內容版本綁定、fail-closed 同步與可復原的兩檔寫入。網站資料 shape、自動同步狀態與正式 SSOT 都未變更。
Apps Script 與 Node parity、全部發布欄位及核可偽造 fixture 共 44 項通過。正式部署仍等待隔離表兩帳號 probe 與 captain 確認。

## Stage Report: verify

- FAILED: 獨立重跑與檢視 feature 040 的實作證據，確認 fingerprint-v1、三分頁投影、核可紀錄與 fail-closed 原子寫入符合設計，且網站資料 shape、自動同步與正式 SSOT 均未被改變。
  44 tests、`npx tsc --noEmit`、`npm run build` 通過，`src/data`／`package.json`／`.github` 相對 implement 基線無 diff；但 AC-2、AC-4、AC-6 未成立，總 verdict 為 REJECTED。
- DONE: 核對 Apps Script 權限與公式行為的事實主張、UNPROVEN 邊界及 placeholder 掃描；不得把未執行的兩帳號 probe 當成通過證據。
  Google 官方文件支持 `userinfo.email`、`spreadsheets.currentonly`、直接傳入 cell/range 會重算、document lock 與 `flush()`；兩帳號 probe 明列未執行，`src/data/*.json` 對五類 placeholder 均 0 命中。
- FAILED: 逐項判定六項 acceptance criteria，列出可重現證據與 PASSED 或 REJECTED verdict；文件影響必須符合實際交付狀態。
  六項已逐項判定；三項 PASSED、三項 REJECTED，且 `approval-permission-probe.md` 正確未建立，但唯一現行規格仍保留互相衝突的操作指示。

- DONE: AC-1 — PASSED。
  `node --test tests/approval-content-version-binding.test.mjs` 逐一變更 29 個發布投影案例皆 exit 非零且兩個暫存輸出維持原 bytes；刪除任一投影或放寬比對會失敗。
- FAILED: AC-2 — REJECTED（證據不足，不是行為失敗）。
  VM 重跑顯示相異 fingerprint 回傳 `Needs review`，但規定的隔離表兩帳號 probe、表 ID hash 與 execution ID 均不存在，因此不得宣告通過。
- DONE: AC-3 — PASSED。
  fixture 對缺核可者、缺／錯時間、缺任一指紋、偽造決定及錯誤指紋均拒絕，只有完整相符紀錄通過；放寬任一必要條件會使測試失敗。
- FAILED: AC-4 — REJECTED（證據不足，不是已觀察到身分豁免）。
  Node fixture 可拒絕責任編輯修改後的舊 fingerprint，但沒有兩帳號表端證據可證公式對責任編輯本人亦重新計算；維持 UNPROVEN。
- DONE: AC-5 — PASSED。
  指紋單元測試逐一改八個審核欄位皆保持 fingerprint 不變；把任一審核欄位放入投影會使測試失敗。
- FAILED: AC-6 — REJECTED。
  `design.md:13-16` 指示讀第五節、`:230-231` 與 `:343` 仍教人直接改 `status`／只按 `status` 放行，雖 `:526` 起聲明取代；正常文件讀者仍會遇到互斥現行流程，違反「唯一現行規格」。

- FAILED: Review finding — `APPROVAL_STATUS` 對無效曆日未完全 fail closed（Deferred risk；task-owned；未獲 FO fix 授權，candidate bytes 未改）。
  VM 以 `2026-02-31T20:00:00.000Z` 重現 `Approved`；正常 Review 選單只寫 `toISOString()` 且 Node 嚴格拒絕，故目前無 supported-workflow 發布傷害；若允許直接編輯審核欄位或 UI 狀態本身成為發布承諾，提升為 Material。
- DONE: Authoritative sources checked。
  https://developers.google.com/apps-script/guides/sheets/functions、https://developers.google.com/apps-script/reference/base/session、https://developers.google.com/apps-script/reference/lock、https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app、https://developers.google.com/apps-script/reference/spreadsheet/protection。

### Summary

REJECTED。Repo-side fingerprint、三分頁投影、核可紀錄驗證、輸出復原、資料 shape 與 build 均由獨立重跑支持；正式 SSOT、自動同步與 shipped JSON 未改。
兩帳號 probe 必須保持 UNPROVEN，且 AC-6 的互斥現行文件指示須經 FO 授權後回到 implement 修正；另保存無效曆日公式判斷為 deferred risk。

## Stage Report: implement (cycle 2)

- DONE: `docs/content-pipeline/design.md` 不再有與 040 新規則互斥的現行操作指示：`:13-16` 的導讀指向、`:230-231` 與 `:343` 教人直接改 `status`／只按 `status` 放行的敘述，都必須讓讀者從任一入口進入都只會得到「公式衍生 status ＋ 同步端指紋」這一套現行規格；依 AGENTS.md 與 design.md:437 以追加補述保留原句脈絡，不得悄悄改寫原文。
  commit `093cd01`：導讀新增「現在怎麼核可」指向與取代警告，第二、三、四、五節各加一則 2026-09-04 補述；`git diff` 顯示 design.md 為純新增 34 行，原句一字未改。
- DONE: `APPROVAL_STATUS` 對無效曆日 fail closed：`2026-02-31T20:00:00.000Z` 之類不存在的日期不得產生 `Approved`，且新增的測試在放寬該條件時會失敗。
  新增 `isApprovalIsoUtc_()` 往返比對 `toISOString()`，與 Node 的 `isIsoUtc` 同語意；測試「APPROVAL_STATUS 只對真實曆日的完整紀錄顯示 Approved」斷言 2026-02-31、2026-04-31、2026-13-01、25 時、非 ISO 與空字串皆回 `Needs review`，把往返比對改成 `return true` 後該測試失敗（實測 pass 44／fail 1）。
- DONE: AC-2 與 AC-4 依 captain 2026-09-04 裁決重寫為 040 在 repo 端可獨立驗證的範圍，並在 Out of scope 指向 feature 044 承接隔離測試表兩帳號 probe；不得宣稱 probe 已執行，`docs/content-pipeline/approval-permission-probe.md` 仍不得建立。
  AC-2 改以 vm 載入 `.gs` 逐欄位驗證衍生狀態，AC-4 改為「放行判斷不依身分」；Out of scope、Test plan、Documentation impact、operations.md、TODO.md P2-12 均指向 feature 044；`ls docs/content-pipeline/` 確認只有三個檔，probe 檔未建立。
- SKIPPED: 執行隔離試算表兩帳號 probe。
  captain 2026-09-04 裁決移出本 feature；trigger 寫入路徑維持 `UNPROVEN`，未偽造 execution ID。
- SKIPPED: 執行 `npm run build`。
  修正封包邊界明令禁止；改以 `npx tsc --noEmit` 驗證，通過。

### 新測試的可失敗性

- 「核可後逐一修改每個發布欄位，衍生 status 都變成 Needs review」：把 `APPROVAL_STATUS` 的指紋相等比對改成「非空即可」，該測試失敗。
- 「放行判斷不依操作者身分」：只在 `validateApprovalBinding` 加一行 `approved_by === 'managing-editor-id'` 就 return，僅該 actor 子測試失敗（實測 pass 48／fail 2），證明它真的在測身分豁免。

### Summary

三項指派全部完成。`design.md` 改為純追加補述，讀者從導讀、第二節、第三節、第四節或第五節任一入口都會先看到「公式衍生 status ＋ 同步端指紋」才是現行規格。
`APPROVAL_STATUS` 的曆日判斷補到與 Node 端同語意，AC-2／AC-4 改寫為 repo 端可重跑的驗證，隔離表兩帳號 probe 明確移交 feature 044。
`node --test tests/approval-content-version-binding.test.mjs` 50 項通過、`npx tsc --noEmit` 通過；未執行 `npm run build` 或 `npm run sync-content`，`src/data/*.json` 與正式 SSOT 未動。
