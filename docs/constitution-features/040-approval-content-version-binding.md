---
title: 核可綁定內容版本並在修改後退回重審
status: review
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
            - id: gate-attempt:040-verify-2
              briefing:
                id: briefing:040:verify:attempt-2:revision-1
                digest: sha256:f46555c84416d1fb7f847a6f1b8465ee95c5494d867b0b7638ac77bc8fefa66f
                room-ref: '@review/verify/briefing-2'
              resolution:
                type: Resolution
                id: resolution:spacedock:040:verify:2
                briefing: briefing:040:verify:attempt-2:revision-1
                by: person:captain
                at: "2026-09-04T19:35:37.383414Z"
                decision: approve
                reason: verify cycle 2 判 PASSED：六項 AC 全部以 repo 端可獨立重跑的證據通過，每項附反向改動證明且已 sha256 驗證還原；AC-6 的互斥現行指示已消除，五個入口各有位置在前的取代補述；placeholder 五類 0 命中；src/data、正式 SSOT、自動同步與網站資料 shape 均未變動。三則 finding 經 FO 授權處置且皆非 Material：F3 fix 另開 feature 045、F4 decline 併入 041、F5 hold 待正式 SSOT 部署。captain 於 2026-09-04 核可進入 review。
              application:
                target-stage: review
                state: consumed
        - id: gate:040:review
          stage: review
          attempts:
            - id: gate-attempt:040-review-1
              briefing:
                id: briefing:040:review:attempt-1:revision-1
                digest: sha256:10b398c70afa8f3fc0d2273bccbf28452e7da80fd4504e9022dd4a423e531549
                room-ref: '@review/review/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:040:review:1
                briefing: briefing:040:review:attempt-1:revision-1
                by: person:captain
                at: "2026-09-05T03:36:59.070656Z"
                decision: hold
                reason: 交付品質已達核可標準（六項 AC 全 PASSED、四項授權修正各以反向改動證明可失敗、越界檢查全乾淨），但核可即進入合併儀式，而合併有未完成的硬前置。captain 於 2026-09-04 裁決 hold。恢復條件：feature 050 完成正式 SSOT 的四項人工步驟——三個發布分頁各建八個審核欄位、安裝 CONTENT_FINGERPRINT 與 APPROVAL_STATUS 公式及 Review 選單、既有 40 筆逐列重新核可、審核欄位設定保護範圍。依 2026-09-03-editor-onboarding.md:425-430，順序不可反：先合併而試算表未建欄，下次同步會整份中止。040 的程式不需再改動。
review-round:
    id: round:040:review:1
    stage: review
    cycle: 1
    briefing:
        id: briefing:040:review:round-1
        digest: sha256:36704ba504e93b6ca48676b9653a9ac89c2e1abf2f7547280f5213a26e98c234
        room-ref: '@review/review/round-1'
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

「非空資料列」的定義：**任一發布欄位非空**的列。只填審核欄位（例如只填 `reject_reason`）的列不佔序號。試算表端與同步端必須用同一個定義，否則同一列會算出不同序號，讓沒有人修改過的列被誤判為需要重新核可。

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

- Cycle 1: REJECTED — verify；surface 12 檔／+896 淨行 vs estimate +500 ±40%（179%，超出上限 196 行）；AC changed（captain 2026-09-04 裁決方案 B：AC-2／AC-4 改寫為 repo 端可獨立驗證的範圍，隔離測試表兩帳號 probe 移交 feature 044）。F1 fix（Material：AC-6，design.md:13-16／:230-231／:343 仍教人直接改 status 或只按 status 放行，與 :526 起的取代聲明互斥）；F2 fix（Deferred risk：APPROVAL_STATUS 對無效曆日未 fail closed，VM 以 2026-02-31T20:00:00.000Z 重現 Approved，promote-to-material 條件為允許直接編輯審核欄位或 UI 狀態成為發布承諾）。F1／F2 已修並經反向驗證（改壞即失敗）；design.md 為純追加補述 34 行、原句未改；node --test 50 項通過、npx tsc --noEmit 通過；未執行 npm run build／sync-content，src/data 與正式 SSOT 未動。
- Cycle 2: REJECTED — review；surface 12 檔／+957 淨行 vs estimate +500 ±40%（191%，超出上限 257 行；review 判定為 estimate 清單漏列文件所致，非 scope creep，不因此退回）；AC unchanged。F6 fix（Material：Track 2 序號在 Node 與 Apps Script 間語意分歧——`toRecords` 只濾「所有儲存格皆空」的列，`PUBLISHED_ROW_SEQUENCE` 只數「任一發布欄位非空」的列；只改 `reject_reason` 一個非發布欄位就讓另一列被無效退回，且重新核可無法解除，違反 AC-5 與 design「序號不使用試算表實體列號」）；F7 fix（Polish：AC-1 有四個子測試恆真，是被既有欄位格式檢查擋下而非指紋閘門）；F3 fix（Deferred risk：測試欄位清單自我指涉，本輪一併處理，feature 045 待封存為 superseded）；F8 fix（Polish：design.md:276 補述做了過寬保證）；F4 decline for 040（併入 feature 041）；F5 hold（待正式 SSOT 部署）。四項已修並各以反向改動證明可失敗（F6 改回 index+1 → fail 1；F7 停用閘門 → 該四項確實失敗；F3 雙邊移除欄位 → fail 5）；spec 補上「非空資料列」定義釘住 F6 根因；node --test 52 項通過、npx tsc --noEmit 通過。


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

## Stage Report: verify (cycle 2)

- DONE: 獨立重跑並逐項判定改寫後的六項 acceptance criteria，特別是依 captain 2026-09-04 裁決改寫的 AC-2／AC-4（須是 repo 端可獨立重跑的驗證，不得以兩帳號 probe 為前提）與先前 REJECTED 的 AC-6；每項給可重現證據與 PASSED 或 REJECTED verdict。
  `node --test tests/approval-content-version-binding.test.mjs` 50 項全通過；六項 AC 逐項判定並各以一次反向改動證明可失敗，改動全部還原（scripts／tests 的 sha256 與改動前相同）。
- DONE: 查核 `docs/content-pipeline/design.md` 的更正確實是純追加補述、原句一字未改，且讀者從任一入口都會先讀到現行規格；確認 probe 檔未建立、文件未宣稱 probe 已執行。
  `git diff --numstat 8b3c7ed..HEAD -- docs/content-pipeline/design.md` = `35 0`，diff 內無任何 `-` 開頭內容行；`ls docs/content-pipeline/` 只有三檔，probe 檔不存在；operations.md:79、design.md:575、AGENTS.md:29-30 均寫「尚未執行」「不得補造 probe 證據」。
- DONE: 執行 placeholder 掃描並確認邊界未被越過。
  `src/data/*.json` 對 `某學者`／`某大學法律系`／`test`（詞界）／`lorem ipsum`／`快速了解最新判決的5個重點` 各 0 命中；`git diff main..HEAD -- src/data package.json package-lock.json .github next.config.* src/app src/components` 為空；`npm run build` 前後兩個 JSON 的 sha256 相同（`4071978a…`、`4d1992e3…`）；`package.json` 的 `build` 仍只是 `next build`。

- DONE: AC-1 — PASSED。
  29 個「核可後改單一發布欄位」子測試全部 exit 非零且兩個輸出維持原 bytes；把 `review_decision !== 'Approved'` 條件停用後「偽造 Approved」子測試失敗（50→pass 48／fail 2）。另以人工比對確認 Node 與 `.gs` 的投影欄位與 design「發布欄位範圍」表逐欄相同。
- DONE: AC-2 — PASSED。
  `vm` 載入 `.gs` 後逐欄位改動，`CONTENT_FINGERPRINT` 均改變且 `APPROVAL_STATUS` 回 `Needs review`；把 `APPROVAL_STATUS` 的指紋相等比對改成「非空即可」，該測試連同三個 actor 子測試失敗（pass 45／fail 5）。此判定不依賴兩帳號 probe。
- DONE: AC-3 — PASSED。
  七類缺漏／偽造紀錄全部拒絕、唯一有效紀錄通過；反向改動證據同 AC-1。
- DONE: AC-4 — PASSED。
  只在 `APPROVAL_STATUS` 與 `validateApprovalBinding` 各加一行對 `managing-editor-id` 的豁免，僅 `managing-editor-id` 子測試失敗（pass 48／fail 2），證明測試真的在測身分豁免而非恆真。此判定不依賴兩帳號 probe。
- DONE: AC-5 — PASSED。
  八個審核欄位改值後指紋不變；把 `status` 加入 Track 1 投影後「每個發布欄位都會改變指紋，審核欄位不會」失敗（pass 35／fail 16）。
- DONE: AC-6 — PASSED。
  design.md 的補述位於導讀（:25）、第二節（:127）、第三節（:239）、第四節（:276）、第五節（:350），各在該節標題後第一段，早於該節所有舊 `status` 敘述；第一、六、七節不含被取代的核可規則。operations.md、tech-stack.md、contributing.md、AGENTS.md、INDEX.md 均已改為「公式衍生 status ＋ 同步端指紋」，無「只靠 `status = Approved` 放行」的敘述。

- FAILED: Review finding F3 — 測試的欄位清單自我指涉，投影縮小時覆蓋率會靜默縮小（Deferred risk；task-owned；未獲 FO fix 授權，candidate bytes 未改，sha256 已驗證還原）。
  觸發證據：同時把 `scripts/content-fingerprint.mjs` 與 `scripts/apps-script/approval-workflow.gs` 的 Track 1 投影移除 `'handwriting'`，`node --test` 得 `tests 49／pass 49／fail 0`（基準為 50／50／0）——測試以 `PUBLISHED_FIELDS[sheetKey]` 產生案例，欄位一旦離開投影，案例也一併消失。因此 AC-1 與 AC-2 所寫的「漏掉任一欄位（投影）會使測試失敗」只在單邊改動時成立（會被 parity 測試擋下），雙邊一致改動時不成立。
  受影響 AC／邊界：AC-1、AC-2 的可失敗性敘述。已釋出使用者與正常流程：責任編輯核可後有人改該欄位、由人手動執行 `npm run sync-content` 並開 PR。可觀察傷害：目前為零——本輪已人工比對兩份投影與 design 表逐欄相同，現行行為正確。promote-to-material 條件：任何一次改動發布欄位投影（新增 SSOT 欄、改名、清理）出貨時，被移除欄位的核可後修改會沿用舊核可而無測試示警。
  建議處置（advisory）：fix —— 在測試內以字面欄位清單斷言三個分頁的投影，把清單釘死在 design 表上。
- FAILED: Review finding F4 — `docs/content-pipeline/data-collection-guide.md:16-18` 仍寫「經編輯台把 `status` 設為 `Approved` 之後，由同步程式產生…」（Deferred risk；非 040 task-owned）。
  該檔狀態為 `evergreen`、最後查核 2026-09-03，敘述在 040 之後已不成立（無人能設定 `status`）。同節開頭已寫「流程見 `design.md`。本文件不重複記載。」，循連結進入者會先讀到 design.md 導讀補述，故無發布傷害。040 的 Documentation impact 明列本檔為「不更新」，且 main 上的 feature `041-correct-stale-pipeline-docs` 已承接本檔 `:23-24` 的同類過時敘述。建議處置（advisory）：decline for 040，並把本句追加進 041 的清單。
- FAILED: Review finding F5 — `docs/health-check/TODO.md:313` 仍教人「把 `status` 改回 `Approved`」（Polish；非 040 task-owned）。
  正式 SSOT 尚未部署新欄位與公式，因此該指示對「今天的試算表」仍正確；部署後即失效。建議處置（advisory）：hold，於正式 SSOT 部署時一併更正。
- DONE: 邊界與交接查核。
  `docs/constitution-features/044-approval-permission-two-account-probe.md` 確實存在於 `main`（commit `dc8ac40`，`status: design`，載明前置條件未到位不可 dispatch）；本分支 base 為 `aec222a`，早於 041–044 建立，故 `git diff main..HEAD` 顯示的四張票與 `2026-09-03-editor-onboarding.md`「刪除」是分支落後，不是本輪改動。
- DONE: Surface 與 tolerance（陳述事實，非新 finding）。
  `git diff --numstat 4503319..HEAD`（排除 entity 與 workflow state）= 12 檔／+985 −89／淨 +896，對 estimate `+500 ±40%`（上限 700）為 179%，超出上限 196 行。此數字與 cycle 1 相同，captain 於 2026-09-04 裁決方案 B 時未要求縮減。
- DONE: 驗證指令與結果。
  `node --test tests/approval-content-version-binding.test.mjs` → 50/50 pass；`npx tsc --noEmit` → exit 0；`npm run build` → exit 0 且 `src/data/*.json` sha256 不變。未執行 `npm run sync-content`。

### Summary

PASSED。六項 acceptance criteria 全部以 repo 端可獨立重跑的證據判定通過，AC-2 與 AC-4 依 captain 2026-09-04 裁決改寫後不再以兩帳號 probe 為前提，先前 REJECTED 的 AC-6 也已成立：design.md 為純追加 35 行、原句一字未改，五個入口各有一則位置在前的取代補述。
`src/data`、正式 SSOT、自動同步狀態與網站資料 shape 均未因本輪修正而改變；placeholder 五類 0 命中；probe 檔未建立，文件一致宣告 probe 尚未執行並指向 feature 044（該票確實存在於 main）。
記名三則 finding 待 FO 授權：F3 是本 task 自有的測試釘樁缺口（Deferred risk，建議 fix），F4／F5 屬 feature 041 與正式 SSOT 部署時的文件更正（建議 decline／hold）。三則皆未觸及 candidate bytes，反向改動後已以 sha256 驗證還原。

## Stage Report: review

- FAILED: 逐項重現六項 acceptance criteria 的 `Verified by:` 子句，不採信實作或 verify 的自我回報；特別是依 captain 2026-09-04 裁決改寫的 AC-2／AC-4，以及 cycle 1 曾被擋下的 AC-6。
  五項成立、AC-5 不成立（見 F6）。基準 `node --test` 50/50、`npx tsc --noEmit` exit 0、`npm run build` exit 0 且 `src/data/*.json` sha256 前後相同。四次反向改動全在 `/private/tmp/.../scratchpad/rev` 的副本上做，worktree candidate bytes 未改（`git status` 僅 FO 寫的 frontmatter）。
- DONE: AC-1 — PASSED（附但書）。
  停用整個 `validateApprovalBinding` 後，29 個「核可後改單一發布欄位」子測試有 25 個失敗（50→pass 11／fail 39），證明退出碼確實由指紋閘門產生。但書見 F7。
- DONE: AC-2 — PASSED。
  把 `APPROVAL_STATUS` 的指紋相等比對改成「非空即可」→ pass 45／fail 5。判定只用 `vm` 載入 `.gs`，不依賴兩帳號 probe。
- DONE: AC-3 — PASSED。
  七類缺漏／偽造紀錄在停用閘門後全部失敗（同 AC-1 反向改動），證明拒絕來自新驗證而非既有欄位檢查。
- DONE: AC-4 — PASSED。
  在 `APPROVAL_STATUS` 與 `validateApprovalBinding` 各加一行 `managing-editor-id` 豁免 → pass 48／fail 2，只有該 actor 子測試失敗。判定不依賴兩帳號 probe。
- FAILED: AC-5 — REJECTED。見 F6：只改 `reject_reason` 一個非發布欄位，就讓另一列產生無效退回。
  反向改動（把 `status` 放進 Track 1 投影 → pass 35／fail 16）證明既有測試會擋下投影污染，但該測試只呼叫 `fingerprintPublishedRow`，看不到序號這條路徑。
- DONE: AC-6 — PASSED。
  五則 2026-09-04 補述位於 :25／:127／:239／:276／:350，各早於該節所有舊 `status` 敘述（:217、:227、:252、:293、:375）；`design.md` 相對 main 為 +57／−1，唯一刪除行是檔頭 `**最後修訂**` metadata，非內文改寫。無任何現行文件宣稱只靠 `status = Approved` 放行。
- DONE: 依實際交付行為查核 `## Documentation impact` 每一筆。
  現在更新四筆與實作後更新五筆（operations.md 新增、tech-stack、contributing、AGENTS、INDEX）皆有對應 diff；`approval-permission-probe.md` 正確未建立（`ls docs/content-pipeline/` 僅三檔）；「不更新」六項 `git diff --stat main...HEAD` 為空，`record` 文件未被改寫；`docs/INDEX.md:57` 已收錄 operations.md（evergreen／2026-09-04）。
- DONE: 審查 implement diff 的程式碼品質、型別與慣例一致性並確認無回歸。
  無回歸：build／tsc 通過，`src/data`、`package.json`、網站資料 shape 未動，`sync-content.mjs` 唯一呼叫點 `package.json:10` 仍走 `main()`。慣例一致：`APPROVAL_COLUMNS` 沿用既有 aliases／longest-prefix 結構，`.gs` 的 `HEADER_SEPARATORS` 與 `sync-content.mjs:40` 字元集逐字相同。
- DONE: 判斷 surface 是否超出設計範圍或可收斂。
  重算 `git diff --numstat 4503319..HEAD`（排除 entity 與 state）= 12 檔／+985 −89／淨 +896，確認 179%。判定為 estimate 缺陷而非 scope creep：多出的四個檔（tech-stack、contributing、AGENTS、TODO）本來就列在同一份 spec 的 `## Documentation impact` 實作後更新，只是沒進「Expected surface」的檔案清單。淨行由 tests 318 與 `.gs` 263 主導，兩者都是 AC 與設計直接要求的產物。唯一可收斂處約 52 行（`installApprovalFormulas_`／`resolveApprovalHeaders_`／`columnA1_` 的公式安裝便利路徑），不建議為此退回。

### Review findings

- FAILED: F6 — Track 2 序號在 Node 與 Apps Script 之間分歧，只改一個非發布欄位就造成別列無效退回（**Material；task-owned；建議 fix；未獲 FO 授權，candidate bytes 未改**）。
  觸發證據（A／B 對照，唯一差異是 `reject_reason`）：Track 2 第一列發布欄位全空、`reject_reason` 填「內容已下架」時，`PUBLISHED_ROW_SEQUENCE` 給 d1 序號 1，`validateApprovalBinding` 的 `index + 1` 給 2 → sync exit 1，對沒人動過的 d1 報三筆「指紋與目前發布內容不符。需要重新核可。」；同一列改成完全空白 → exit 0。成因：`toRecords`（`scripts/sync-content.mjs:330`）只濾掉「所有儲存格皆空」的列，`PUBLISHED_ROW_SEQUENCE`（`approval-workflow.gs`）只數「任一發布欄位非空」的列。
  已釋出使用者與正常流程：責任編輯把某則討論的內容清空但保留該列（審核欄位受保護、清不掉），或退回後內容被刪；之後有人手動執行 `npm run sync-content`。可觀察傷害：整份同步中止，錯誤指向錯的列，而且訊息給的解法無效——重新核可時選單同樣用 `PUBLISHED_ROW_SEQUENCE`，算出的仍是舊序號，除非整列刪除否則解不開。
  受影響 AC／邊界：AC-5「非發布欄位變動不會造成無效退回」，以及 design`## 發布欄位範圍`「序號不使用試算表實體列號，避免插入空白列造成誤退回」。AC-5 的 `Verified by:` 只呼叫 `fingerprintPublishedRow`，看不到序號來源，因此測試通過不等於 AC 成立。
  建議處置（advisory）：fix —— Node 端改為只數「任一發布欄位非空」的列來產生序號，與 `PUBLISHED_ROW_SEQUENCE` 同語意，並補一項以非發布欄位為唯一變因的 sync 級迴歸測試。
- FAILED: F7 — AC-1 有四個子測試是恆真的（**Polish；task-owned；建議 fix；candidate bytes 未改**）。
  停用整個指紋閘門後，`Track 1.year`、`Track 2.views`、`Track 2.vibe`、`site_tldr.0.order` 仍通過——它們是被既有欄位格式檢查擋下，不是被指紋擋下。行為本身正確（這四欄確實在投影內，由指紋單元測試涵蓋），但 AC-1「漏掉任一欄位會使測試失敗」對這四欄不成立。建議在該子測試加 stderr 比對，或改用不觸發既有格式檢查的變更值。
- FAILED: F3（verify 記名，本輪已獨立重現）— 測試欄位清單自我指涉（**Deferred risk；task-owned；建議 fix**）。
  雙邊一致地把 Track 1 投影的 `'handwriting'` 從 `content-fingerprint.mjs` 與 `approval-workflow.gs` 移除 → `tests 49／pass 49／fail 0`，零示警。同意 verify 的分類與建議（測試內用字面欄位清單釘住 design 表）。
- FAILED: F8 — `docs/content-pipeline/design.md:276` 的補述說「本節的檢查規則仍然成立」，但同節 `:293`「`status` 必須是 `Approved`／`Rejected`／空白其中之一」已不成立（`checkStatusValues` 現在也收 `Needs review`）（**Polish；task-owned；建議 fix**）。
  不構成 AC-6 失敗（該行沒有宣稱只靠 `status = Approved` 放行），但補述對讀者做了過寬的保證。
- SKIPPED: F4、F5（verify 記名）。
  同意 verify 的分類與建議：F4 屬 feature 041 的檔案，decline for 040；F5 對尚未部署的正式試算表仍正確，hold。

### Summary

REJECTED。六項 AC 中五項以獨立反向改動證實成立，AC-5 不成立：F6 以 A／B 對照重現「只改 `reject_reason` 一個非發布欄位，就讓另一列被無效退回，且重新核可無法解除」，這正是 AC-5 與 design 序號設計明文要防的失效模式，且既有測試因為只驗指紋函式而看不到它。
其餘查核全部通過——文件影響九筆到位、`record` 文件未改寫、INDEX 與實際增刪一致、build／tsc 無回歸、`src/data` 與網站資料 shape 未動、probe 檔未建立。
Surface 179% 判定為 estimate 清單漏列文件所致，非 scope creep，不建議因此退回。F6 建議 fix（Material，數行），F7／F3／F8 建議一併 fix（Polish／Deferred risk），F4／F5 沿用 verify 的 decline／hold。所有 finding 均未觸及 candidate bytes，反向改動全在 repo 外副本進行。

## Stage Report: implement (cycle 3)

- DONE: F6：把 Node 端產生 Track 2 序號的列篩選改為與 `PUBLISHED_ROW_SEQUENCE` 同語意（只數「任一發布欄位非空」的列），並補一項 sync 級迴歸測試，其唯一變因是非發布欄位（例如只填 `reject_reason`）；該測試在兩端序號語意不一致時必須失敗。
  commit `35b015f` 新增 `publishedRowSequences()`，`validateApprovalBinding` 改用它取代 `index + 1`；測試「Track 2 序號與 Apps Script 同語意」先斷言 `PUBLISHED_ROW_SEQUENCE` 對該排列給 1，再比對「多一列只填 `reject_reason`」前後 `discussions.json` 逐字相同；把 Node 改回 `index + 1` 後該測試失敗（實測 pass 51／fail 1）。
- DONE: F7：AC-1 的四個恆真子測試（`Track 1.year`、`Track 2.views`、`Track 2.vibe`、`site_tldr.0.order`）改為真的由指紋閘門擋下——加 stderr 比對，或改用不觸發既有欄位格式檢查的變更值；停用指紋閘門後這四項必須失敗。
  29 個子測試一律加 `assert.match(result.stderr, /與目前發布內容不符|無法計算內容指紋/)`，兩個訊息都只由 `validateApprovalBinding` 產生；把該函式改成立即 return 後，`Track 1_history.h1.year`、`Track 2_discussion.d1.views`、`Track 2_discussion.d1.vibe`、`site_tldr.0.order` 四項確實失敗（實測 pass 9／fail 43）。
- DONE: F3 與 F8 一併修正：測試內以字面欄位清單斷言三個分頁的投影並釘在 design 表上（雙邊一致移除欄位時必須有測試失敗）；修正 `docs/content-pipeline/design.md:276` 補述的過寬保證，使其不再宣稱同節 `:293` 的 status 值域檢查規則仍然成立。
  測試新增逐字抄自 design 表的 `DESIGN_PROJECTION`，並以 `fingerprintPayload` 解出實際投影欄名比對；四個逐欄位迴圈改吃這份字面清單。雙邊一致移除 `handwriting` 後 5 項測試失敗（實測 pass 47／fail 5），先前同一改動是 49 全過。design.md 第四節補述改為逐條指名：`status` 值域那條已失效（現行多一個 `Needs review` 且由公式產生），其餘仍成立。
- SKIPPED: F4（`data-collection-guide.md:16-18`）與 F5（`TODO.md:313`）。
  修正封包分別標為 decline for 040（併入 feature 041）與 hold（正式 SSOT 部署時處理），本輪不處理。
- SKIPPED: 執行隔離試算表兩帳號 probe 與 `npm run build`。
  probe 已由 captain 裁決移交 feature 044；`npm run build` 由 stage definition 禁止，改以 `npx tsc --noEmit` 驗證，通過。

### 一併釘住的設計定義

`## 發布欄位範圍` 補上「非空資料列」的定義：任一發布欄位非空的列，只填審核欄位的列不佔序號。
F6 的成因就是兩端對這個詞的理解不同，spec 原本沒有寫死它。此段只補定義，未改變已核可的行為或範圍。

### Summary

四項授權修正全部完成，四項都以「反向改動使測試失敗」證明有效，不是只看通過數。
Node 與 Apps Script 現在對 Track 2 序號用同一個定義，只填 `reject_reason` 的列不再讓沒人動過的列被誤退回。
`node --test tests/approval-content-version-binding.test.mjs` 52 項通過、`npx tsc --noEmit` 通過；未執行 `npm run build` 或 `npm run sync-content`，`src/data/*.json`、正式 SSOT 與網站資料 shape 未動。

## Stage Report: review (cycle 2)

- DONE: 重現本輪四項修正的可失敗性，不採信 implement 的自我回報：F6 把 Node 序號改回 `index + 1` 後迴歸測試必須失敗；F7 停用 `validateApprovalBinding` 後 `Track 1.year`／`Track 2.views`／`Track 2.vibe`／`site_tldr.0.order` 四項必須失敗；F3 雙邊一致移除 Track 1 投影的 `handwriting` 後必須有測試失敗。任一項無法重現即為 REJECTED。
  四項全部重現。基準 52/52。F6 改回 `index + 1` → pass 51／fail 1，失敗的正是「Track 2 序號與 Apps Script 同語意」。F7 在 `validateApprovalBinding` 開頭插 `return;` → pass 9／fail 43，失敗清單逐字含 `Track 1_history.h1.year`、`Track 2_discussion.d1.views`、`Track 2_discussion.d1.vibe`、`site_tldr.0.order`（斷言 diff 顯示 stderr 只剩既有格式檢查訊息，證明新斷言真的在測指紋閘門）。F3 從 `content-fingerprint.mjs` 與 `approval-workflow.gs` 同時移除 `'handwriting'` → pass 47／fail 5。第四項 F8 無測試可掛：改以 `scripts/sync-content.mjs:371` 證實 `status` 值域確實已含 `Needs review`，且逐條核對〈檢查什麼〉其餘規則（year 4 碼、vibe 清單、sticky、order、`order 0` 須 Approved）在上述反向改動的 stderr 中確實仍會觸發，故補述的「其餘仍然成立」成立。
  四次反向改動全在 `/private/tmp/.../scratchpad/rev3` 的副本上做，改完以 sha256 逐檔比對確認與 worktree 相同；worktree `git status` 全程乾淨。
- DONE: 重新判定六項 acceptance criteria，特別是 cycle 2 被擋下的 AC-5——請自行構造「只改一個非發布欄位」的情境驗證不再產生無效退回，並確認 `## 發布欄位範圍` 新增的「非空資料列」定義與 Node、Apps Script 兩端實作三者一致。
  六項全部成立，AC-5 由 REJECTED 轉 PASSED。自構情境 `scratchpad/ac5.mjs` 完全不依賴 `tests/`，六個場景：A 兩列已核可 exit 0；B 前置一列只填 `reject_reason` → exit 0 且 `discussions.json` 與 A 逐字相同；C 同一列夾在兩列中間 → 同上；D 已核可列自己帶 `reject_reason` → exit 0 且輸出相同；E 發布欄位全空卻偽造 `Approved` → exit 1，fail closed；F Track 1 前置同型空列 → exit 0 且輸出相同。同一支腳本在舊 `index + 1` 下 B 與 C 變成 exit 1、輸出不同，證明情境有鑑別力而非恆真。
  AC-1／AC-3 由 F7 的停用閘門反向改動覆蓋（43 項失敗）。AC-2 把 `APPROVAL_STATUS` 的指紋相等比對改成「非空即可」→ pass 47／fail 5。AC-4 在 `APPROVAL_STATUS` 與 `validateApprovalBinding` 各加一行 `managing-editor-id` 豁免 → pass 50／fail 2，只有該 actor 子測試失敗。AC-6：五則補述位於 `design.md` 的 :25／:127／:239／:276／:354，各在該節所有舊 `status` 敘述之前（:217／:227 屬第二節，由 :127 覆蓋；:297／:324 屬第四節，由 :276 覆蓋；:379 屬第五節，由 :354 覆蓋）；`design.md` 相對 main 為 +61／−1，唯一刪除行是檔頭 `**最後修訂**` metadata。
  「非空資料列」三者一致，以執行證明而非讀碼：`scratchpad/seq.mjs` 用 `node:vm` 載入 `.gs`，對同一組三列排列（只填 `reject_reason` 的空列、d1、d2）取得 Apps Script 公式端 `PUBLISHED_ROW_SEQUENCE` = 0／1／2、Node `publishedRowSequences` = 0／1／2，且選單端 `fingerprintForSheetRow_` 對 d1／d2 算出的指紋與 Node 逐字相同——重新核可能解開退回，F6 的「重新核可無法解除」已在兩端同時關閉。空列在兩端都擲錯，維持 fail closed。
- DONE: 確認本輪未越界：`docs/content-pipeline/design.md` 的修改仍為追加補述且未改寫原句、`record` 文件未被改寫、`approval-permission-probe.md` 未建立、`src/data`／正式 SSOT／網站資料 shape 未變動；並複核 F4／F5 確實未被處理（依授權應維持 decline／hold）。
  本輪 diff（`afa2cde..HEAD`）只動 6 個檔，程式與文件端僅 `design.md`、`sync-content.mjs`、測試三支。`design.md` 本輪改的是自己前一輪加的補述區塊，原文一句未動。`git diff --stat main...HEAD` 對 `2026-08-31-content-pipeline.md`、`docs/_archive/`、`architecture.md`、`design-system.md`、`README.md`、`src/`、`package.json` 全部為空。`ls docs/content-pipeline/` 僅三檔，probe 檔未建立。`npm run build` exit 0 且 `src/data/*.json` sha256 前後相同（`shasum -c` 兩檔 OK）、`npx tsc --noEmit` exit 0、未執行 `npm run sync-content`。
  F4（`data-collection-guide.md:16-18`）該檔完全未進 diff，decline 維持。F5（`TODO.md:313`）該行原文仍在，`TODO.md` 的 diff 只落在 :639-660 的 P2-12 段，hold 維持。placeholder 五類在本輪 diff 0 命中（grep 命中全為 `test(` 與 `example.test` 網域）。

### Review findings

無新 finding。上一輪的 F6／F7／F3／F8 四項授權 fix 全部關閉，F4（decline for 040，併入 feature 041）與 F5（hold，待正式 SSOT 部署）依授權原樣帶出本 task。

Surface 陳述事實、非 finding：12 檔／+1046 −89／淨 +957，對 estimate +500 ±40%（上限 700）為 191%，超出 257 行。與 cycle 2 判定相同——多出的四個文件檔本來就列在同一份 spec 的 `## Documentation impact` 實作後更新，只是沒進 `## Expected surface` 的檔案清單，屬 estimate 缺陷而非 scope creep，不建議因此退回。範圍調整屬 captain。

### Summary

PASSED。四項授權修正逐一以反向改動重現可失敗性，沒有一項是恆真或自我回報。AC-5 以獨立於 `tests/` 的六個 sync 級場景重新判定成立，且同一支腳本在舊程式下確實會失敗，證明判定有鑑別力。
「非空資料列」的定義在 spec、Node、Apps Script 公式端與選單端四處一致，並以 `node:vm` 實跑取得同一組序號與同一份指紋，F6 原本「重新核可也解不開」的傷害在兩端同時關閉。
越界檢查全部乾淨：`record` 文件與 `_archive` 未動、probe 檔未建立、`src/data` sha256 不變、網站資料 shape 未變、F4／F5 依授權未處理。build 與 tsc 皆 exit 0。建議進入交付。
