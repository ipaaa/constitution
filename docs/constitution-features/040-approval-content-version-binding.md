---
title: 核可綁定內容版本並在修改後退回重審
status: design
source: captain 2026-09-03
started: 2026-09-03T19:46:08Z
completed:
verdict:
score: 0.95
worktree:
issue:
pr:
mod-block:
id: 040
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

**AC-2 — 核可後修改發布欄位會顯示 `Needs review`。**
Verified by: 隔離測試表的兩帳號 probe 逐一修改發布欄位。`status` 必須變為 `Needs review`，且 `approved_*` 不變。刪除狀態公式或漏掉欄位會使 probe 失敗。證據寫入 `docs/content-pipeline/approval-permission-probe.md`。

**AC-3 — 只有完整且與目前內容相符的核可紀錄可以發布。**
Verified by: `tests/approval-content-version-binding.test.mjs` 測試缺少核可者、時間、任一指紋、偽造 `Approved`、錯誤指紋及有效紀錄。前六類被拒絕，只有有效紀錄通過。放寬任一必要條件會使測試失敗。

**AC-4 — 責任編輯自行修改內容也必須重新核可。**
Verified by: `docs/content-pipeline/approval-permission-probe.md` 記錄責任編輯修改已核可列。公式必須顯示 `Needs review`。同一列匯出的 CSV fixture 必須被 Node 測試拒絕。若依操作者身分豁免，兩項驗證至少一項失敗。

**AC-5 — 非發布欄位變動不會造成無效退回。**
Verified by: `tests/approval-content-version-binding.test.mjs` 分別修改 `review_decision`、`approved_*` 與 `reject_reason`，確認內容指紋不變。把任一審核欄位納入投影會使測試失敗。

**AC-6 — 新規則成為內容產線的唯一現行規格。**
Verified by: repo 外部 review checklist 比對 `docs/content-pipeline/design.md`、`docs/content-pipeline/operations.md`、`docs/INDEX.md` 與實際測試。任一現行文件仍宣稱只靠 `status = Approved` 放行時判定失敗。

## Test plan

使用 Node 內建 test runner。測試以本機 HTTP fixture 提供三份 CSV。測試把輸出指向臨時目錄，不得讀 `.env.local`，也不得改 `src/data/*.json`。

覆蓋核可紀錄、正規化等價、每個發布欄位、Track 2 列順序、全有全無寫入及可定位錯誤。執行 `node --test tests/approval-content-version-binding.test.mjs`、`npx tsc --noEmit` 與 `npm run build`。不可執行 `npm run sync-content`。

隔離試算表 probe 覆蓋投稿者、責任編輯、核可、拒絕、內容修改及非發布欄位修改。probe 必須記錄測試表 ID 的雜湊、時間、兩個角色、步驟、結果與 Apps Script execution ID。不得記錄帳號 email 或正式 SSOT URL。

## Documentation impact

### 現在更新

- `docs/constitution-features/040-approval-content-version-binding.md`：記錄已定方向、`UNPROVEN` 風險與驗證目標。這是設計，尚未實作。
- `docs/content-pipeline/design.md`：記錄公式衍生 `status` 與同步端指紋的已定方向。明記行為尚未實作。
- `docs/health-check/TODO.md`：記錄施工與隔離 probe 待辦。明記正式 SSOT 尚未套用新行為。
- `docs/INDEX.md`：索引本 feature 的已定方向與計畫狀態。不得寫成已上線。

### 實作後更新

- `docs/content-pipeline/operations.md`：記錄核可、拒絕、重審、同步錯誤與復原步驟。
- `docs/content-pipeline/approval-permission-probe.md`：新增隔離表端到端證據。狀態為 `record`。
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
