---
title: Review 核可寫回試算表（取代試算表審核選單）
status: design
source: captain 2026-11-25（content-review 審稿流程討論）
started: 2026-11-25T23:01:11Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
id: 080
---

## 要解決的問題

T1、T2 內容改在 Spacedock Review 審稿（workflow `docs/content-review/`）。老師在 Review 留言簽核，責任編輯（owner）在 Review 按 Approve。
但網站同步只認試算表 SSOT_收集區上的核可紀錄。現在核可要在試算表另用選單 `Review → 核可選取列（附老師簽核）`（feature 076）再做一次。

船長決定：試算表的審核選單不再使用，改由 Spacedock Review 核可。需要一條路，把 Review 的核可寫回試算表。

## 船長已定的方向（2026-11-25）

1. owner 在 Spacedock Review 按 Approve（binding）後，由 first officer 把核可紀錄寫進試算表該列。owner 不必開試算表。
2. 寫入前檢查三件事，任一不符就不寫，並回報原因：
   - 決定是 owner 的 binding approve，且針對目前版本（`result.artifact.rev` 等於該 article 的 `review-rev`）
   - 每個 `##` 節都有**已登入帳號**留下的 `approved`；沒登入的留言不算（`docs/content-review/README.md` 審稿慣例第 2 條）
   - 試算表該列內容在審閱頁產生後沒有被改過（指紋相同）
3. 分兩期：
   - 第一期：first officer 列出「這批要寫入的列」，owner 回覆同意後才寫
   - 第二期：owner 按 Approve 後自動寫入，事後回報。第一期穩定後另行決定
4. 寫入試算表不等於上線。同步照 `AGENTS.md` 第 1 條，有人明確要求才執行，跑完開 PR 給 captain 對 diff。

## 已知事實（設計階段需查證並引用）

- 同步的上線條件在 `scripts/sync-content.mjs` 的 `isApproved` 與 `validateApprovalBinding`：`status`、`review_decision` 為 `Approved`；`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、`current_fingerprint` 皆有值；三個指紋等於 Node 依目前內容重算的值（`scripts/content-fingerprint.mjs`）。Track 2 的指紋序號另見 `publishedRowSequences`。
- 試算表另有 feature 076 的簽核欄：`signoff_by`、`signoff_ref`、`signoff_fingerprint`（`docs/constitution-features/_archive/076-teacher-review-role-and-signoff.md`）。
- `status` 等欄為「權限保護」，只有試算表擁有者（ipawei）能改。寫入會以 owner 的已連結 Google 帳號進行。
- 審閱頁直接讀試算表（`scripts/content-review/sheet.mjs`，唯讀，用同步的同一組 CSV 網址）。發布的 CSV 中 `status`、`current_fingerprint` 可能顯示「載入中…」，不可當作可靠值。
- Review 留言能否分辨「已登入／未登入」：**尚未驗證**。網頁介面有區分（匿名代號 vs 帳號名稱），`subspace-relay-client feedback` 的輸出是否帶此資訊未知。設計必須先查證；查不到時要提出替代方案。
- 分享連結不得寫進 repo 或試算表的公開位置（repo 公開；連結即讀寫權限）。

## 設計要回答的問題

- 寫入哪些欄、各填什麼值（`approved_by`、`approved_at`、三個指紋、`signoff_by`、`signoff_ref`、`signoff_fingerprint`、`review_decision`、`status`）。`signoff_ref` 用什麼當證據（不可用分享連結）。
- 寫入機制：Google Sheets API（透過 owner 已連結帳號）或 Apps Script 端點，各自的權限、可回復性、失敗處理。
- 指紋怎麼綁：審閱頁產生時記下的指紋，與寫入當下 Node 重算的指紋比對。
- 試算表審核選單的去留：停用、隱藏或保留為備援；對 feature 076、079 的影響。
- 寫錯時怎麼回復（清欄、試算表版本記錄）。
- 驗證方法：不可對正式 SSOT 做破壞性測試；說明測試用的試算表或乾跑方式。不得補造 probe 證據（`AGENTS.md` 第 1 條）。

## 不做的事

- 不執行 `npm run sync-content`，不手改 `src/data/*.json`。
- 不改內容欄位，只寫核可與簽核欄。
- 不在第一期做自動寫入。

## 設計（design 階段，2026-11-25）

### 〇、給船長的白話摘要

- **要做的事：** 您在 Spacedock Review 按 Approve 之後，由 first officer 把「核可」寫進試算表那一列。您不必再開試算表用選單。
- **先講一個現在就有的問題：** 試算表 `Track 1_history` 的 S 欄標題被打成 `signoff_by3-ˇ（簽核老師）`。`signoff_by` 後面多了「3-ˇ」，應該是注音輸入法殘留。結果：今天任何人跑網站同步，T1 都會整份中止；試算表的「附老師簽核」選單也會拒絕執行。修法：把 S1 格改成 `signoff_by（簽核老師）`。只改標題，不必改內容。我沒有動試算表。
- **最大的風險查過了。答案是：從我們拿得到的資料，分不出來。** Review 的留言紀錄只寫「`person:` 加上名字」。沒登入的人也可以自己取名，例如取名「王老師」。所以光看留言紀錄，分不出是不是本人登入。Review 網頁本身知道誰有登入，您在頁面上看到的「已登入」標記是可靠的。first officer 用的指令列工具目前讀不到這個標記，至少還沒證實讀得到。現在所有連結都還沒有任何留言，沒有真實資料可驗。
- **因此第一期這樣做：** first officer 列出「這批要寫入哪些列、每一節是誰簽的」。您在 Review 頁面確認這些簽核者都有「已登入」標記，再回覆同意。first officer 收到同意才寫入。「已登入」由您確認，不由程式判斷。
- **第二期（按 Approve 就自動寫入）有一個前提：** 程式要能自己讀到「已登入」標記。第一則真實留言出現後，first officer 用唯讀方式查一次就知道。查不到就不開第二期。
- **寫入以後還沒上線。** 上線仍要有人明確要求同步，跑完開 PR 給您對 diff（`AGENTS.md` 第 1 條）。
- **寫錯可以退回。** 每次寫入都在試算表的紀錄分頁留下舊值。退回時只還原「目前仍是這次寫入值」的格子。試算表的版本記錄是第二道備援。
- **試算表的核可選單：** 建議第一批寫入成功之後，才從選單拿掉核可與拒絕項目。程式碼保留作備援。拿掉之前，舊路仍然可用。
- **要您決定三件事：** 寫入機制（第九節 D-1）、選單去留（D-2）、feature 079 怎麼處理（D-3）。079 已寫好但還沒合併。照現狀合併，「只走 Review、沒寄 HTML 審閱檔」的 T1 列會讓同步整份中止。

### 一、最大風險先查：Review 留言能不能分辨已登入與未登入

全程唯讀。沒有發布、修訂或撤回任何連結，也沒有留言。

| # | 查什麼 | 怎麼查 | 結果 |
|---|---|---|---|
| R1 | 現有連結上有沒有真實留言 | `subspace-relay-client list` 列出 162 條連結（含已撤回者）。對每一條跑 `subspace-relay-client feedback <url> --json` | 162 條全部結束碼 0，全部是 `{"results":[], ...}`。**目前沒有任何真實留言**，無法用真實輸出證明。h1 pilot（2026-11-20）的留言所在連結已不在清單中 |
| R2 | 瀏覽器寫入的留言作者欄長怎樣 | 讀 Review 網頁實際載入的 `room-bootstrap.js`（以 GET 取得 h1 頁面的 script 位址，只下載公開 JS，不進房） | `actorValue()` 回傳 `person:${reviewerName ?? anonymousAlias}`。`Annotation.by` 與 `Result.actor` 都用它。**已登入與未登入都是 `person:` 開頭**，只差名字 |
| R3 | 未登入的人能不能自取名字 | 同檔與 `room-identity.js` | 能。未登入時名稱選單有 `rename`（Change name）。對話框原文：「This name is temporary for this Room. It is self-declared and is not verified.」所以 `person:王老師` 可能是任何人 |
| R4 | Review 自己知不知道誰有登入 | 同檔 `readEveryonesFeedback()` 與 `web/src/index.js` | 知道。owner 看全部留言時，伺服器回傳的每張留言卡帶 `author.verified`。介面依此顯示「Signed-in person」或「Person」 |
| R5 | 指令列工具的 JSON 有沒有這個欄位 | `strings` 掃 `subspace-relay-client` 0.17.0 的 JSON 欄位標籤 | 沒有 `verified` 或 `signedIn`。有 `by`、`actor`、`binding`、`includes`、`annotations`、`resolution`，另有一個 `submitter`。`submitter` 的內容**我不確定**，要有真實留言才看得到 |
| R6 | 公開 API 文件 | `https://review.spacedock.md/llms.txt`（OpenAPI 2.2.0） | 進房回應有 `signedIn`、`anonymousAlias`、`read.reviewer.displayName`，但那是「看頁面的這個人」的身分。留言列表 `read.submissions[].annotations[]` 只保證 `by`、`body`，沒有登入標記 |

**結論：** 用指令列工具的 `feedback --json` 判斷「已登入」，目前沒有根據。只看 `by` 會被冒名。

**替代方案（第一期採用）：owner 確認制。**

1. first officer 從 `feedback --json` 讀出每一節的 `approved` 留言，列出作者名字與 annotation id。
2. 清單上每一位簽核者都標「待 owner 確認已登入」。
3. owner 在 Review 頁面看全部留言，確認那幾則顯示為 Signed-in person，再回覆同意。owner 本來就是決定誰的簽核算數的人（`docs/content-review/README.md` 審稿慣例第 2 條）。這一步沒有新增責任，只是寫明。
4. 沒有確認的節，視同缺簽，該篇不寫入。

理由：R4 證明可靠的訊號存在，而且 owner 看得到。R1、R5 證明程式目前拿不到。讓程式比對名字清單，會被 R3 的自取名字騙過。讓 owner 看標記，不會。

**P-1（實作階段的唯讀 probe，不得補造）：** 第一則真實留言出現後，first officer 跑一次 `feedback --json`。把一則已登入留言與一則未登入留言（若有）的欄位結構記在本票，不記名字、不記連結。`submitter` 或其他欄位能分辨時，第二期以它為準。不能分辨時，向 Spacedock Review 提需求，第二期等它。提需求照 `llms.txt` 的規則：先經 captain 同意，issue 不含文件內容與連結。沒有真實資料之前，測試夾具只用標明「合成」的資料，不可當 probe 證據。

### 二、另一個查到的問題：T1 標題列打錯（現在就影響同步）

- **證據：** 以 GET 讀 T1 發布版 CSV 第一列。第 19 欄（S 欄）是 `signoff_by3-ˇ（簽核老師）`。T 欄 `signoff_ref（留言連結）`、U 欄 `signoff_fingerprint（簽核版本）` 正常。
- **對同步的影響：** 在記憶體中呼叫 `scripts/sync-content.mjs` 匯出的 `buildTrack1`，不寫任何檔。回傳 `null`，錯誤 1 筆：`第 19 欄的標題「signoff_by3-ˇ（簽核老師）」對不到任何預期欄位。檢查是否打錯字。` 依 `buildColumnMap` 的規則，同步會整份中止。同一方法跑 `buildTrack2`：15 筆，0 錯誤。
- **對選單的影響：** `approval-workflow.gs` 的 `resolveApprovalHeaders_` 要求欄位名後面接分隔符。「3」不是分隔符，所以找不到 `signoff_by`。`核可選取列（附老師簽核）` 會停在 `缺少簽核欄位「signoff_by」`。
- **文件與事實不符：** `docs/content-pipeline/operations.md`〈錯誤與復原〉寫「`T1 的簽核欄不齊…`（同步）：…或標題打錯。…這一行不讓同步中止」。實際上標題打錯時，同步在更早的標題解析就中止，走不到那一行。列入〈文件影響〉實作後更新。
- **修法：** captain 把 S1 格改成 `signoff_by（簽核老師）`。只改標題，不影響任何列的指紋。本設計把「標題解析失敗」列為拒絕寫入（第 3.6 節 X8）。
- **前提 P-0：** S1 標題修正是本票實作驗證與部署的前提。修正後，以匯出的 `buildTrack1` 在記憶體解析 T1 發布版，必須 0 錯誤，才可在正式表執行 `dryRun`（AC-9）或任何寫入。first officer 已轉告 captain 修正；本票不動試算表。

### 三、選定方案

#### 3.1 第一期流程

```
① owner 在 Review 按 Approve（binding）
② first officer 執行 writeback plan（唯讀）
     → 讀 decision 與 feedback、重抓試算表、重算指紋、逐項檢查
     → 印出批次清單：篇、分頁、列、版本短碼、各節簽核者、建議的 signoff_by、不寫入的篇與原因
     → 存成本機計畫檔（不進 git）；計畫編號＝計畫內容 sha256 前 8 字元
③ owner 在 Review 頁面確認簽核者已登入，回覆「同意寫入 <計畫編號>」，可排除某幾篇
④ first officer 執行 writeback apply <計畫編號>
     → 全部檢查重做一次；任何結果與計畫不同，該篇不寫入
     → 逐篇呼叫 Apps Script 寫入（第 3.5 節），每篇一次、全有或全無
     → 結果寫進該篇 index.md 的 Review record，與試算表「審核寫回紀錄」分頁
⑤ first officer 回報：寫入幾篇、拒絕幾篇與原因、每篇的批次編號（供退回）
```

- Request changes 與 Hold 不寫試算表。內容在試算表修改後，公式自動變回 `Needs review`。
- 每篇獨立。一篇失敗不影響同批其他篇。`tldr` 一篇對應 `site_tldr` 四列（`order` 0–3），四列一起寫或都不寫。

#### 3.2 寫入哪些欄、各填什麼值

| 欄位 | T1 | T2、`site_tldr` | 值 | 來源 |
|---|---|---|---|---|
| `review_decision` | 寫 | 寫 | `Approved` | 最後才寫，順序與選單相同：先寫空白，重讀指紋無誤後才寫 `Approved` |
| `review_fingerprint` | 寫 | 寫 | 指紋全文 64 字元 | Apps Script 鎖定後依目前內容重算，且等於請求帶來的指紋 |
| `approved_by` | 寫 | 寫 | 執行者的 Google 帳號 email | `Session.getActiveUser().getEmail()`，與選單相同。**不由 first officer 提供** |
| `approved_at` | 寫 | 寫 | 寫入當下的 ISO 8601 UTC（含毫秒） | Apps Script `new Date().toISOString()`，與選單相同。owner 在 Review 決定的時間記在紀錄分頁與 index.md |
| `approved_fingerprint` | 寫 | 寫 | 同 `review_fingerprint` | 同上 |
| `reject_reason` | 寫 | 寫 | 空白 | 與選單核可相同 |
| `signoff_by` | 寫 | 無此欄 | owner 確認的老師代稱 | 必須在指令碼屬性 `TEACHER_SIGNOFF_LABELS` 內（沿用 076）。多位簽核者以「、」連接 |
| `signoff_ref` | 寫 | 無此欄 | 證據字串，格式見 3.3 | first officer 依 feedback 產生 |
| `signoff_fingerprint` | 寫 | 無此欄 | 同 `review_fingerprint` | 同上 |
| `status` | **不寫** | **不寫** | 公式 `APPROVAL_STATUS` | 寫入後讀回，必須顯示 `Approved`，否則全部復原 |
| `current_fingerprint` | **不寫** | **不寫** | 公式 `CONTENT_FINGERPRINT` | 寫入前後各讀一次，必須等於指紋 |
| 內容欄 | **不寫** | **不寫** | — | 本票不改內容 |

- T2 與 `site_tldr` 沒有簽核欄（076 決定只管 T1）。這兩類的老師簽核證據只記在 repo 的 `## Review record`。要不要加欄是 076 的 D-4，本票不改。我採預設「不加」，告知船長即可。
- `approved_by` 寫 email 是現況，選單也這樣寫。本票不新增 email 的去處。repo 內的紀錄不寫 email（`operations.md` 安全邊界第 3 點）。

#### 3.3 `signoff_ref` 的證據格式（不是分享連結）

```
review briefing:<32 位十六進位> v<版本號> ann:<annotation id>[,<annotation id>…]
```

- `briefing:` 與版本號指出是哪一份審閱頁。`ann:` 列出每一節採計的那則 `approved` 留言。
- 這三項都是識別碼，不是存取權。進房必須持有分享連結 `/r/<shareId>`（`llms.txt`〈Review a share link〉）。`review-briefing` 已經寫在 repo 的 `index.md` frontmatter，是既有前例。
- 寫入前檢查：字串必須以 `review briefing:` 加 32 位十六進位、版本號、`ann:` 開頭，且**不可含** `http`、`/r/`、`#`。不符就拒絕（X10）。Node 與 Apps Script 兩端都檢查。
- 076 的同步端只要求 `signoff_ref` 非空白（`scripts/teacher-signoff.mjs:51`），所以格式改變不影響同步判定。076 選單要求 `http(s)://` 的規則只留在選單，不套用到本路徑。

#### 3.4 指紋綁定：四次獨立計算

| 時點 | 誰算 | 依據 | 要求 |
|---|---|---|---|
| A 產生審閱頁 | Node，`render-t1.mjs`／`render-t2.mjs` | 同步的標題解析與 `fingerprintPublishedRow`；T2 用 `publishedRowSequences` 的序號 | 把指紋記進該篇 `index.md` frontmatter 新欄 `sheet-fingerprint`（`tldr` 記四個）。審閱頁「給編輯」區印 8 字元版本短碼 |
| B 寫入前（plan 與 apply 各一次） | Node，`writeback.mjs` | 以 `fetchSettledCSV`（`sync-content.mjs` 已匯出）取算完的發布版，再用同步的欄位定義解析、重算 | 等於 `sheet-fingerprint`。不讀 CSV 的 `status`、`current_fingerprint`（可能是「載入中…」；本次讀 T2 發布版時 36 列的 `status` 就是「載入中…」） |
| C 寫入當下 | Apps Script，持文件鎖 | `fingerprintForSheetRow_` 讀活的試算表顯示值重算，並讀 `current_fingerprint` 格 | 兩者都等於請求帶來的指紋。寫入後再讀一次 `current_fingerprint`，不同就全部復原 |
| D 正式同步 | Node，`validateApprovalBinding` | 同步當時的內容 | 三份指紋等於重算值（既有行為，本票不改） |

- 「審閱頁內容＝owner 核可的內容」由 `result.artifact.rev`＝`review-rev`＝本機審閱頁 sha256 證明。「審閱頁＝產生當時的試算表列」由 A 證明。「試算表列沒被改過」由 B、C 證明。
- T1 的十個指紋欄位（`scripts/content-fingerprint.mjs:11`）全部顯示在審閱頁上，對照審閱頁「給編輯」區的欄位表。T2 的 `views`、`vibe`、`sticky`、`owl_depth_comment`、`full_content`、`case_ref`、`stance` 與序號不顯示，但仍計入指紋，改動一樣會被擋。
- **2026-11-25 已發布的 v1 審閱頁沒有記錄指紋。** 不可事後補記。補記等於宣稱「產生當時就是這個值」，沒有證據。這些頁要先重新產生，並以 `revise` 更新同一連結，才能走本路徑（X5）。只改「給編輯」區時，審閱內容各節的位元組不變。老師在舊版留的 `approved` 依 README 審稿慣例第 3 條由 owner 決定是否採計；第一期清單會標明「舊版簽核」。

#### 3.5 寫入機制

| | A Apps Script API 執行（建議） | B Sheets API 直接寫格 | C Apps Script 網頁端點 |
|---|---|---|---|
| 怎麼做 | 在 `approval-workflow.gs` 加 `approveRowsFromReview(request)`，部署為「API 執行檔」。first officer 以 owner 的 OAuth 呼叫 `scripts.run`（`gws script scripts run`） | first officer 以 owner 的 OAuth 呼叫 `spreadsheets.values.batchUpdate`（`valueInputOption: RAW`） | `doPost` 網頁應用程式，以擁有者身分執行 |
| 權限 | 以呼叫者（owner）執行，通過保護範圍 | 同左 | 持有網址與密鑰的任何人 |
| `approved_by` 由誰決定 | Google 登入工作階段 | first officer 寫入的字串 | 部署者 |
| 鎖定 | 與選單共用 `LockService` 文件鎖 | 拿不到 Apps Script 的鎖 | 共用 |
| 檢查與復原 | 沿用選單已實測的快照、重讀、復原、狀態公式檢查 | 要在 Node 重寫一份，兩份邏輯會分岔 | 同 A |
| 一次性設定 | 中等：Apps Script 專案改連標準 GCP 專案、啟用 Apps Script API、建 OAuth 用戶端、部署 API 執行檔、`gws auth login`（本機 `gws` 0.22.5 目前未登入） | 較少：建 OAuth 用戶端、`gws auth login` | 少 |
| 主要風險 | 設定步驟多。`spreadsheets.currentonly` 範圍在 `scripts.run` 下是否夠用，**我不確定**。實作時在隔離表驗證；不夠就改 `spreadsheets` 範圍 | 檢查與寫入之間沒有鎖 | 網址外流即可寫入核可，**不採用** |

**建議 A。** 理由：寫入、檢查、復原只有一份程式，與選單相同。`approved_by` 由 Google 決定，不由代理填寫。鎖與選單共用，兩條路同時用也不會交錯。

`approveRowsFromReview(request)` 的行為：

1. 取文件鎖（30 秒）。以 `getSheetByName(request.sheet)` 取分頁，不用「目前選取範圍」。
2. 解析標題（`resolveApprovalHeaders_`）。T1 另外要求三個簽核欄都在。
3. 以 `id`（`site_tldr` 用 `order`）找列。找不到或重複就拒絕。不接受列號當依據。
4. 每一列的 `current_fingerprint` 顯示值與 `fingerprintForSheetRow_` 都要等於 `request.rows[].fingerprint`。
5. 檢查 `signoff_by` 在 `TEACHER_SIGNOFF_LABELS` 內，`signoff_ref` 符合 3.3。
6. 快照每一格要寫的舊值。`request.dryRun` 為真時到此為止，回傳「將寫入的值」，不寫任何格。
7. 依選單順序寫入（`review_decision` 先空白）→ `flush` → 重讀 `current_fingerprint` → 寫 `review_decision`＝`Approved` → `flush` → 讀 `status` 必須是 `Approved`。任一步不符，所有格還原為快照，回報原因。
8. 成功後在「審核寫回紀錄」分頁每格寫一筆（第四節），回傳批次編號。

選單的 `reviewActiveRows_` 改成「取得列號清單後呼叫共用核心」。選單行為不變，由既有隔離表行為測試確認（AC-10）。

#### 3.6 拒絕寫入的情況

任一條成立，該篇不寫入。清單與回報寫明編號與原因。

| # | 情況 | 在哪裡擋 |
|---|---|---|
| X1 | 沒有 owner 決定；決定不是 `approve`；`feedback` 標 `binding: no`；決定的 briefing 不是 `review-briefing` | Node |
| X2 | `result.artifact.rev` 不等於 `review-rev`，或本機審閱頁 sha256 不等於 `review-rev` | Node |
| X3 | 某個 `##` 節沒有採計的 `approved`。採計條件：`kind` 為 `comment`；內文去空白後不分大小寫等於 `approved`；屬於目前 briefing（沒有 `earlierVersion`）；能定位到該節（選取文字等於節標題，或在該節內唯一出現）。定位不到的標「無法定位」，交 owner 判斷 | Node；owner |
| X4 | 第一期：owner 沒有確認該節簽核者已登入。owner 自己的 `approved` 不算老師簽核 | owner |
| X5 | `index.md` 沒有 `sheet-fingerprint`（舊版審閱頁） | Node |
| X6 | 重算指紋不等於 `sheet-fingerprint`（審閱頁產生後內容被改過） | Node |
| X7 | 發布版連續 8 次未算完（`fetchSettledCSV` 失敗） | Node |
| X8 | 標題解析失敗，例如第二節的 `signoff_by3-ˇ` | Node 與 Apps Script |
| X9 | 找不到該 `id` 的列，或 `id` 重複 | Node 與 Apps Script |
| X10 | `signoff_ref` 格式不符，或含 `http`、`/r/`、`#`；`signoff_by` 不在代稱清單 | Node 與 Apps Script |
| X11 | Apps Script 端指紋不符、寫入期間內容變動、`status` 公式沒有變成 `Approved` | Apps Script（已寫的格全部還原） |
| X12 | 取不到文件鎖、OAuth 失效、API 錯誤 | Apps Script／Node。不自動重試，回報 |
| X13 | owner 的同意沒有點名這個計畫編號，或 apply 時重算結果與計畫不同 | Node |

#### 3.7 寫錯時怎麼回復

1. **第一道：`undoReviewWriteback(batchId)`。** first officer 執行 `writeback undo <批次編號>`，同樣經 `scripts.run`。程式讀紀錄分頁該批每一格的舊值與新值。**只有目前值仍等於當時寫入值的格才還原。** 已被別人改過的格不動，列入回報。還原後 `status` 依公式回到寫入前的狀態。紀錄分頁該批標 `undone_at`。
2. **第二道：試算表版本記錄**（檔案 → 版本記錄）。用來查舊值。**不要整份還原舊版本**：那會連同其他人之後的內容修改一起退掉。
3. 不可手改 `status` 或 `current_fingerprint`。`docs/constitution-features/_archive/050-ssot-approval-deployment.md` 步驟 6 的 ⚠️ 仍有效。

#### 3.8 第二期（自動寫入）的前提

以下全部成立後另開決定，不在本票實作：

1. P-1 證實程式讀得到「已登入」標記，X4 改由程式判斷。
2. 第一期至少成功寫入一批，並演練過一次退回。
3. captain 明確同意開啟。

### 四、元件與資料

**元件（皆為指令列與 Apps Script，沒有網頁介面）：**

| 元件 | 職責 |
|---|---|
| `scripts/content-review/writeback.mjs`（新） | 三個子指令：`plan`（唯讀，產生計畫）、`apply <計畫編號>`（重做檢查後呼叫 Apps Script）、`undo <批次編號>`。只從 `links.local.json` 取連結，不把連結寫進任何輸出 |
| `scripts/content-review/render-t1.mjs`、`render-t2.mjs` | 產生審閱頁時寫入 `sheet-fingerprint`，在「給編輯」區印短碼 |
| `scripts/content-review/sheet.mjs` | 提供原始列（全部欄位、同步的標題解析、T2 序號），給 render 與 writeback 算指紋 |
| `scripts/sync-content.mjs` | 只新增匯出：標題解析與 `toRecords`、`publishedRowSequences`。行為不變 |
| `scripts/apps-script/approval-workflow.gs` | 抽出共用核心；新增 `approveRowsFromReview`、`undoReviewWriteback`；選單依 D-2 調整 |
| 試算表「審核寫回紀錄」分頁（新） | 稽核與退回的依據。只有擁有者可改。不發布到網路 |

**資料形狀：**

- `index.md` frontmatter 新欄 `sheet-fingerprint`：64 字元十六進位；`tldr` 為 `order` 對指紋的對照。由 render 寫入，不手填。
- 計畫檔 `docs/content-review/writeback-plan.local.json`（不進 git，實作時加進 `.gitignore`）：
  `{ planId, createdAt, articles: [{ id, sheet, rows: [{ key, fingerprint }], briefing, version, rev, decisionAt, sections: [{ heading, annotationIds, signerNames, earlierVersion }], signoffBy, signoffRef, refusals: [] }] }`。
  `signerNames` 只存在本機計畫檔，給 owner 對照。
- Apps Script 請求：`{ batchId, dryRun, sheet, rows: [{ key, fingerprint }], signoff: { by, ref } 或 null, source: { briefing, version, rev, decisionAt } }`。
  回應：`{ ok, batchId, written: [{ key, row, fields }], refused: { code, message } 或 null }`。
- 紀錄分頁欄位：`batch_id`、`written_at`、`sheet`、`row_key`、`sheet_row`、`fingerprint`、`briefing`、`version`、`rev`、`decision_at`、`field`、`old_value`、`new_value`、`undone_at`。
- repo 紀錄：該篇 `index.md` 的 `## Review record` 追加一行：寫入時間、批次編號、版本短碼、各節 annotation id、`signoff_by` 代稱。**不寫** email、Review 顯示名稱、分享連結。

**手機／桌機：** 本票沒有網頁介面。網站 `src/` 零改動。

### 五、試算表審核選單的去留，與 076、079 的關係

- **選單（076）：** D-2 建議預設：第一批 Review 寫入成功後，選單只留 `安裝／更新公式`。`核可選取列`、`核可選取列（附老師簽核）`、`拒絕選取列` 從選單拿掉，函式保留。擁有者可在 Apps Script 編輯器手動執行，作為備援。要恢復，把 `onOpen` 的三行加回即可，可逆。拿掉之前，舊路照常可用。
- **076 的同步端摘要：** 不改。Review 路徑寫入的簽核三欄滿足「有效」判定：`signoff_by`、`signoff_ref` 非空白，`signoff_fingerprint` 等於重算指紋。076 文件是封存的 `record`，不改寫。新流程寫在 `operations.md` 與 content-review README。
- **079（目前 `status: review`，未合併）：** 079 方案 D 在正式同步加「轉交檢查」：每一個已核可 T1 列的 `approved_fingerprint`，都要在「審閱版本」分頁有一筆 `result=OK`、`sent_at` 有值的登錄，否則整份中止。走 Review 的列沒有這筆登錄。**079 照現狀合併後，Review 核可的 T1 列會讓同步整份中止。** D-3 建議預設：079 不照現狀合併。撤下它的同步轉交檢查，`review-file` 審閱檔工具保留為「老師無法使用 Review 時」的備援管道。Review 的 owner 決定綁定 `rev`，本身就證明審閱頁送達且被看過。

### 六、驗證方法（不碰正式 SSOT）

1. **Node 單元測試** `tests/review-writeback.test.mjs`：本機 HTTP 夾具提供 CSV，沿用 `tests/approval-content-version-binding.test.mjs` 的 `createServer` 做法。以假的 `subspace-relay-client` 與假的 Apps Script 呼叫器回傳合成 JSON。合成資料檔頭註明「合成，非 probe 證據」。
2. **Apps Script 在隔離表驗證**（比照 044）：captain 複製一份 SSOT 結構的測試表，部署 API 執行檔。first officer 對測試表跑 `apply` 與 `undo`。證據記測試表 ID 雜湊、UTC 時間、角色、Apps Script execution ID，不記 email 與網址（`operations.md`〈驗證〉）。
3. **正式表只做 `dryRun`**：`apply --dry-run` 在正式表持鎖做完全部檢查，不寫任何格，回傳將寫入的值。這一步是讀取，在 captain 同意後於實作驗證階段執行。
4. **P-1** 依第一節，用真實留言，唯讀。
5. 既有測試不退步：`node --test tests/*.test.mjs`、`npx tsc --noEmit`、`npm run build`，且 `src/data/*.json` 的 sha256 不變。

### 七、預估檔案、行數與容差

| 檔案 | 預估 |
|---|---|
| `scripts/content-review/writeback.mjs`（新） | +250～350 |
| `scripts/content-review/render-t1.mjs`、`render-t2.mjs`、`sheet.mjs` | 合計 +40～80 |
| `scripts/sync-content.mjs` | +3～10（只加匯出） |
| `scripts/apps-script/approval-workflow.gs` | +100～150，−5～15 |
| `tests/review-writeback.test.mjs`（新）與夾具 | +300～420 |
| `.gitignore` | +1 |
| 文件（README、operations、gatekeeping、design、AGENTS） | +90～160 |
| **合計** | **約 +800～1170，容差 ±25%** |

`src/` 零改動。

### 八、語意變更

- 核可寫入者：由責任編輯操作選單，改為 first officer 在 owner 明確同意後呼叫 Apps Script。`approved_by` 仍是 owner 的 Google 帳號。
- `signoff_ref` 的內容：由試算表留言連結（`http(s)://`），改為 Review 證據字串。同步端判定不變。
- 老師簽核的管道：由試算表留言（076 第 3.2 節），改為 Review 留言 `approved`。076 的「同意，版本 xxxxxxxx」留言不再需要，版本綁定改由 `sheet-fingerprint` 與 `rev` 承擔。
- 第一期「已登入」由 owner 確認，程式不判斷。
- 正式同步、指紋公式、`status` 公式、網站：都不變。

### 九、需要船長決定的事

| # | 建議 | 選了會怎樣 | 可逆性 |
|---|---|---|---|
| D-0 | **立即修正** S1 標題為 `signoff_by（簽核老師）` | 不修：同步與附簽核選單都不能用 | 可逆，只改標題 |
| D-1 寫入機制 | **選 A**（Apps Script API 執行） | A：一次性設定約 30–45 分鐘，之後寫入、檢查、退回都沿用選單同一套程式。B：設定較少，但檢查邏輯要重寫一份，且沒有鎖。C：不採用 | A、B 都可撤銷授權與部署 |
| D-2 選單去留 | **第一批寫入成功後，拿掉三個核可／拒絕項目，函式保留** | 現在就拿掉：新路驗證前沒有核可方法。永遠保留：兩條路並存，責任不清 | 可逆，加回三行即可 |
| D-3 079 | **不照現狀合併；撤下同步轉交檢查；審閱檔工具保留為備援** | 照現狀合併：Review 核可的 T1 列會讓同步整份中止。改成接受 Review 證據：多一份登錄要維護，證明內容與 Review 決定重複 | 未合併前都可逆 |

我自行決定、告知即可：T2 與 `site_tldr` 不加簽核欄（沿用 076 D-4）；`signoff_by` 沿用 076 的代稱清單；`approved_at` 記寫入時間（與選單相同）。

## Acceptance criteria

每條是完成後的性質。標「部署後」的條在隔離表執行，或經 captain 同意後在正式表做唯讀 `dryRun`。不在正式表做破壞性測試。

1. **AC-1　沒有 owner 的 binding approve 就不寫。** 決定缺漏、為 `revise` 或 `hold`、`binding: no`、briefing 不符、`rev` 不符時，`plan` 把該篇列為拒絕（X1、X2），`apply` 不呼叫 Apps Script。
   Verified by：`tests/review-writeback.test.mjs` 以五個合成決定逐一斷言拒絕代碼，且 Apps Script 呼叫次數為 0。拿掉 `rev` 比對時 X2 案例轉為寫入，測試失敗。
2. **AC-2　每個 `##` 節都要有採計的 `approved`，否則不寫。** 少一節、只有 `suggestion`、內文為 `approved!`、留言屬於舊版、選取文字定位不到時，該節不採計。T1 兩節、T2 三節、`tldr` 一節的節清單由審閱頁標題解析而來。
   Verified by：同一測試檔以合成 feedback 逐案斷言。把節清單寫死成兩節時 T2 案例失敗；拿掉 `earlierVersion` 判斷時舊版案例失敗。
3. **AC-3　第一期沒有 owner 點名同意就不寫。** 計畫中每位簽核者預設「待確認」。`apply` 只接受 owner 點名的計畫編號。計畫產生後任一檢查結果改變，該篇拒絕（X13）。
   Verified by：測試以「未點名」「點名了別的計畫編號」「計畫後內容被改」三案斷言不呼叫 Apps Script。部署後在隔離表各演一次，紀錄附在本票。
4. **AC-4　內容在審閱頁產生後被改過就不寫。** T1 十個發布欄位、T2 全部發布欄位與選填欄、T2 前面插入一列（序號改變），任一改動都使重算指紋不等於 `sheet-fingerprint`，拒絕 X6。沒有 `sheet-fingerprint` 時拒絕 X5。
   Verified by：測試逐欄改動本機 CSV 夾具並斷言 X6。把比對改成只比前 4 字元時，至少一案失敗。
5. **AC-5　寫入的值讓同步通過，且 076 判為有效。** 隔離表寫入一列 T1 與一列 T2 後，以匯出的 `buildTrack1`、`buildTrack2` 在記憶體解析該表發布版：0 錯誤，該列通過 `validateApprovalBinding`，076 摘要把 T1 列列為「有效」。`status` 讀回 `Approved`。
   Verified by：部署後在隔離表執行，記錄 execution ID、UTC 時間與解析結果。單元測試以合成寫入結果跑 `validateApprovalBinding` 與 `summarizeSignoffs`；把 `approved_fingerprint` 寫成舊指紋時測試失敗。
6. **AC-6　寫入期間內容變動或公式不符時，全部還原。** Apps Script 寫入後偵測到 `current_fingerprint` 改變，或 `status` 不是 `Approved` 時，所寫的每一格回到快照值。
   Verified by：部署後在隔離表演練兩案：寫入期間改 `content`；暫時破壞 `status` 公式。比對寫入前後全部審核欄與簽核欄的值相同，紀錄附在本票。
7. **AC-7　證據不含分享連結。** `signoff_ref`、紀錄分頁、`index.md` 與 repo 內任何檔案都不含 `links.local.json` 中的連結。`signoff_ref` 含 `http`、`/r/`、`#` 時兩端都拒絕。
   Verified by：測試以含連結的 `signoff_ref` 斷言 Node 拒絕。隔離表以同值呼叫 Apps Script 並斷言拒絕。實作 PR 執行 `git grep -n "review.spacedock.md/r/"`，輸出為空。
8. **AC-8　退回只還原自己寫入且未被改過的格。** `undo` 後，未被改過的格回到舊值；寫入後被改過的格保持現值並列入回報；`status` 回到寫入前的狀態。
   Verified by：部署後在隔離表寫入一次、手改其中一格、再 `undo`，比對三類格子的值。單元測試以合成紀錄斷言「先比較再還原」；拿掉比較時測試失敗。
9. **AC-9　`dryRun` 不寫任何格。** 正式表 `apply --dry-run` 前後，試算表版本記錄沒有新版本，回傳將寫入的值。
   Verified by：captain 同意後於正式表執行一次，比對版本記錄與回傳內容。紀錄只記時間與 execution ID，附在本票。
10. **AC-10　選單路徑行為不變（直到 D-2 執行）。** 抽出共用核心後，`核可選取列` 與 `核可選取列（附老師簽核）` 在隔離表的結果與重構前相同。
    Verified by：部署後依 `operations.md`〈老師簽核欄部署〉的行為測試逐格比對。
11. **AC-11　網站與同步不變。** 實作 PR 對 `src/` 的 diff 為空。`sync-content.mjs` 只有新增匯出。既有測試全過。`npm run build` 前後 `src/data/*.json` 的 sha256 相同。
    Verified by：`git diff --stat main...<實作分支> -- src/` 輸出為空；`node --test tests/*.test.mjs`、`npx tsc --noEmit`、`npm run build` 結束碼 0。
12. **AC-12　P-1 的結論有真實證據。** 第二期開啟前，本票記錄一次 `feedback --json` 對真實留言的欄位結構（不含名字與連結），並寫明能否分辨已登入。
    Verified by：captain 審閱本票該節。沒有真實留言時本條維持未完成，第二期不得開啟。

## 文件影響

### 現在更新

無。本階段只寫入本票。理由：first officer 限定 design 不動 `docs/content-review/` 與 `scripts/content-review/`。其餘文件描述現行選單流程，本票實作前仍然正確。第二節的標題錯誤是試算表現況，不是文件內容，已即時回報 first officer。

### 實作後更新

- `docs/content-review/README.md`：`approved` stage 的「本流程目前不寫回試算表」追加補述；Schema 加 `sheet-fingerprint`；Workflow State 加 writeback 三個子指令與第一期 owner 點名同意的步驟；Workflow-specific rules 加「寫入試算表要 owner 點名計畫編號」。
- `docs/content-pipeline/operations.md`：〈核可與拒絕〉追加補述（Review 路徑、選單去留）；新增 API 執行檔的一次性設定、紀錄分頁、`undo`；〈錯誤與復原〉補 X1–X13 的訊息，並以補述更正「標題打錯不讓同步中止」那一項（第二節）。
- `docs/content-pipeline/gatekeeping.md`：防線總表加「Review 核可寫回」一列，寫明第一期「已登入」由 owner 確認，程式擋不到。
- `docs/content-pipeline/design.md`：第五節流程追加補述（核可來源改為 Review）。原文保留。
- `AGENTS.md`：「絕對不要做的事」第 1 條加一句：`writeback apply` 會寫正式試算表，只有 owner 點名計畫編號後才可執行。
- `.gitignore`：加 `docs/content-review/writeback-plan.local.json`。
- `docs/INDEX.md`：本票不新增文件；實作若新增文件再補。

### 不更新

- `docs/constitution-features/_archive/076-teacher-review-role-and-signoff.md`、`050-ssot-approval-deployment.md`、`044-approval-permission-two-account-probe.md`：封存的 `record`，不改寫。
- `docs/constitution-features/reviewer-preview-delivery.md`（079）：由 first officer 依 D-3 的決定處理票況，本票不改其內文。
- `docs/constitution-features/062-h34-h35-duplicate-title.md`：與本票無關。
- `src/` 底下任何檔案：網站不變。

## Stage Report: design

- DONE: Riskiest unknown proven first, read-only: show from real `subspace-relay-client feedback --json` output (or the Review API in https://review.spacedock.md/llms.txt) whether a comment records signed-in vs anonymous; if it cannot, propose and justify the fallback.
  第一節 R1–R6：162 條連結的真實 `feedback --json` 全部 `results: []`（目前無留言）；Review 網頁 JS 證明 `by` 一律是 `person:<名字>`，未登入可自取名；`author.verified` 只在網頁端。結論：CLI 分不出。採 owner 確認制，P-1 待第一則真實留言唯讀查證
- DONE: Write path specified end to end: exact sheet columns and values (incl. `signoff_ref` evidence that is not a share link), fingerprint binding checked against `scripts/sync-content.mjs` `validateApprovalBinding` and `scripts/content-fingerprint.mjs`, write mechanism, refusal cases, and undo; no write to the production SSOT during design.
  第 3.2–3.7 節：欄值表（`status`、`current_fingerprint` 為公式，不寫）、`signoff_ref` 證據格式、四次獨立指紋計算、A/B/C 機制比較（建議 Apps Script API 執行）、X1–X13、CAS 式 `undo`。對正式表只做 GET 讀發布版 CSV；附帶發現 T1 S1 標題打錯，`buildTrack1` 回傳 null，已即時回報
- DONE: Acceptance criteria as end-state properties, each with a `Verified by:` clause, plus the 現在更新／實作後更新／不更新 doc-impact split and the fate of the sheet approval menu (features 076, 079).
  AC-1–12 各附 Verified by；文件影響三分；第五節：選單第一批成功後拿掉核可／拒絕項目、函式保留（D-2）；079 的同步轉交檢查會擋 Review 核可的 T1 列，建議不照現狀合併（D-3）

### Summary

選定第一期流程：first officer 唯讀產生計畫，owner 在 Review 確認簽核者已登入並點名計畫編號後，經 Apps Script API 寫入核可與簽核欄，並留紀錄分頁供 CAS 式退回。關鍵發現有三：Review CLI 目前分不出已登入留言，所以第一期由 owner 確認；正式表 T1 的 S1 標題被打成 `signoff_by3-ˇ`，同步與附簽核選單現在都不能用；079 照現狀合併會擋下走 Review 核可的 T1 列。待船長決定 D-0 至 D-3。
