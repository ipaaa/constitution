---
id: 076
title: 老師審閱角色與簽核紀錄：權限與審核責任表
status: implement
source: captain 2026-11-16 裁示「老師只負責審閱、簽核，由責任編輯代按 Approve」；TODO.md P3-1、P3-2；2026-09-04 會議後續工作四
started: 2026-11-17T19:08:10Z
completed:
verdict:
score: 0.9
worktree: .worktrees/spacedock-ensign-teacher-review-role-and-signoff
issue:
pr:
mod-block:
---

讓法律老師能審閱 T1 內容並留下可查的簽核紀錄，而核可（Approve）仍由責任編輯在試算表 `Review` 選單代按。

## Problem

- captain 於 2026-11-16 決定：老師只負責審閱與簽核，不進審核欄位的 B 群保護範圍；Approve 由責任編輯代按。
- 現行設計沒有「老師簽核」這一層：`approval-workflow.gs` 只記錄按下 Approve 的帳號（`:241`），因此看不出哪位老師在何時、對哪個內容版本表示同意。
- `docs/content-pipeline/gatekeeping.md:49-55` 把學者列為與一般協作者同權，沒有寫明審閱責任。
- 參與的老師是誰、試算表分享給誰，都還沒確認（`docs/health-check/TODO.md` P3-1、P3-2）。2026-09-04 會議要求的「協作者權限與審核責任表」查無。

## Proposed approach

> 原 placeholder：「{design 階段決定。至少要比較兩種簽核紀錄位置：(a) 試算表新增老師簽核欄，綁定 `current_fingerprint`；(b) 不改試算表結構，改由責任編輯在 Approve 時於某欄記錄簽核老師與日期。選定方案時要說明，內容被修改後簽核如何隨版本失效，比照 040。}」由下方 `## Design` 回答。

## Design

### 〇、一句話結論

**建議採方案 (b′)：老師在試算表留言表示同意，並在留言中寫出該列的「版本短碼」；責任編輯用新的選單項目 `Review → 核可選取列（附老師簽核）` 代按核可，選單同時寫入三個新欄：簽核老師、留言連結、簽核所綁的內容指紋。**
老師在 Google 試算表的身分設為「加註者」（只能看、只能留言）。這樣「老師不改內容、不按 Approve」由 Google 的權限機制執行，不只靠約定。
第一期只記錄、不擋發布。要不要讓同步擋下「沒有老師簽核」的列，留給 11/26 會議決定（見第七節 D-5）。

標 🔴 的項目需要 captain 或 11/26 會議決定。第七節集中列出。

### 一、名詞

| 名詞 | 本票的意思 |
|---|---|
| 審閱 | 老師讀內容，判斷法律上是否正確 |
| 簽核 | 老師對**某一個內容版本**表示同意，並留下可查的紀錄 |
| 核可 | 責任編輯執行 `Review → 核可選取列`，寫入 B 類審核欄。只有核可會讓 `status` 變成 `Approved` |
| 版本短碼 | `current_fingerprint` 的前 8 個字元。內容改一個字，短碼就不同 |
| 有效簽核 | 該列 `status` 為 `Approved`，且 `signoff_fingerprint` 等於同步依目前內容重算的指紋 |

### 二、方案比較與風險證據

#### 2.1 三個方案

| | (a) 老師自己寫簽核欄 | (b) 責任編輯在某欄記錄老師 | **(b′) 選定：(b) ＋ 指紋綁定 ＋ 留言證據** |
|---|---|---|---|
| 誰寫簽核紀錄 | 老師本人 | 責任編輯 | 責任編輯，用新選單寫入 |
| 老師在 Google 的角色 | 必須是「編輯者」 | 不限 | **加註者** |
| 老師的身分怎麼證明 | `Session.getActiveUser()`，最強 | 只有責任編輯打的字 | 留言作者由 Google 登入帳號決定；`signoff_ref` 存該留言的連結 |
| 綁定哪個版本 | `signoff_fingerprint` | 無。只有名字與日期 | `signoff_fingerprint`，並在寫入前比對老師留言裡的版本短碼 |
| 內容改了之後 | 指紋不符，失效 | **舊老師名字留在新版本旁邊，看起來像有效** | 指紋不符，失效。不附老師的核可會清空三欄 |
| 是否符合 captain 2026-11-16 裁示 | **不符**：見風險 R2 | 符合 | 符合，而且由權限機制執行 |

**不選 (a) 的理由**：老師若是「編輯者」，就改得到所有未受保護的內容欄（R2）。裁示的「老師不改內容」只能靠老師自律。另外要新增一類允許名單，044／050 的行為測試要多一個角色。
**不選 (b) 的理由**：沒有版本綁定。內容改過、責任編輯重新核可時若忘了清欄，老師的名字會掛在老師沒看過的版本上（R4）。

#### 2.2 風險證據

| # | 風險 | 證據 | 本設計的處理 |
|---|---|---|---|
| R1 | 試算表先加欄，同步會整份中止 | `scripts/sync-content.mjs:320-322`：看不懂的標題回報「對不到任何預期欄位」並中止。`docs/content-pipeline/operations.md:67-77`：「順序不可反」 | 先合併程式，再建欄。見第五節 5.4 |
| R2 | 「編輯者」改得到所有未受保護的格 | `operations.md:60-61` 的允許名單機制；`050` S7-b 第 10 列：名單外的編輯者改得動內容欄（`docs/constitution-features/_archive/050-ssot-approval-deployment.md:1281`） | 老師設為加註者 🔴 D-2 |
| R3 | 把老師加進 B 類允許名單，老師就能按核可 | `docs/content-pipeline/gatekeeping.md:61`：`Review` 選單靠 B 類允許名單寫入 | 老師不進 B 類。符合裁示 |
| R4 | 現行紀錄只記按核可的人 | `scripts/apps-script/approval-workflow.gs:241`、`:257` 只寫 `Session.getActiveUser()` 到 `approved_by` | 新增三欄，見第三節 |
| R5 | 加欄會不會讓既有核可全部失效 | 指紋只取發布欄位（`approval-workflow.gs:4-11`）；測試「每個發布欄位都會改變指紋，審核欄位不會」（`tests/approval-content-version-binding.test.mjs`）| 三欄不進 `APPROVAL_FIELDS`。既有 40 列 T1 核可不受影響。AC-4 驗證 |
| R6 | Apps Script 沒有標題別名表，打錯標題會無聲失效 | `gatekeeping.md:174`、`docs/health-check/TODO.md` 的 P2-14 | 新選單項目缺任一簽核欄就中止並指名欄位。AC-5 驗證 |
| R7 | 新保護範圍只到第 1000 列 | `operations.md:62-63` | 與既有範圍同一限制。T1 現有 42 列，不處理 |
| R8 | 擁有者不受保護範圍限制，可手打簽核欄 | `gatekeeping.md:67`、`:88` | 同步獨立重算指紋，手打的指紋擋得到。手打的老師名字擋不到；`signoff_ref` 留言連結可回查。🔴 D-8 是否接受 |
| R9 | 加註者打開試算表時看不看得到 `Review` 選單 | **UNPROVEN**。repo 內沒有任何以加註者角色實測的紀錄（`grep -n 加註者` 於 044、050、`approval-permission-probe.md` 皆無命中） | 部署後以加註者帳號實測。AC-9 |
| R10 | 留言被刪除，`signoff_ref` 失去證據 | **UNPROVEN**。編輯者可刪留言；試算表版本記錄是否保留已刪留言，未查證 | 部署後實測一次；不成立時改由責任編輯另存截圖或 email 🔴 D-3 |
| R11 | TODO 寫「沒有分享給任何人」，與 050 記載矛盾 | `docs/health-check/TODO.md` P3-1 寫只有擁有者一人；`050` 記載 captain 2026-09-25 口頭回報正式表有六位編輯者、三位檢視者（`050-ssot-approval-deployment.md:1312-1314`） | P3-1 已過時。六位編輯者是誰、其中有沒有老師，repo 內無記錄 🔴 D-2 |

### 三、選定方案規格

#### 3.1 新欄位（第一期只加在 `Track 1_history`）

| 欄位 | 誰寫 | 內容 | 保護 |
|---|---|---|---|
| `signoff_by` | 選單 | 老師的代稱。選單只接受清單內的值 | B 類 |
| `signoff_ref` | 選單 | 老師那則留言的連結。不可空白 | B 類 |
| `signoff_fingerprint` | 選單 | 寫入當下的 `current_fingerprint` 全文（64 字元） | B 類 |

- 三欄放在 `current_fingerprint` 右側。依 2026-09-29 讀數，T1 是 `S`、`T`、`U` 三欄。**實作時讀發布版 CSV 第一列確認**，不引用此處欄號當現況（`operations.md:50` 的規則）。
- 標題照既有體例寫成 `signoff_by （簽核老師）` 這種「欄位名＋全形括號說明」的形式。
- 「何時」由兩處回答：老師同意的時間在留言上（Google 記錄）；寫入紀錄的時間是 `approved_at`。不另設時間欄。
- 老師代稱清單存在 Apps Script 的「指令碼屬性」`TEACHER_SIGNOFF_LABELS`，一行一個代稱。由 captain 設定。**不寫進 repo**，與「不要把帳號 email 寫進 repo」（`operations.md:15`）同一原則。代稱的內容 🔴 D-1。
- T2 與 `site_tldr` 是否也加，🔴 D-4。程式用一個常數列出適用分頁，第一期只列 `Track 1_history`。

#### 3.2 老師怎麼表示同意

1. 老師以加註者身分打開試算表，讀 `Track 1_history` 的某一列。
2. 老師在該列的 `content` 格留言，寫「同意，版本 `xxxxxxxx`」。`xxxxxxxx` 是同一列 `current_fingerprint` 的前 8 字元。
3. 要求修改時，留言寫明要改什麼。責任編輯修改內容後，該列自動變回 `Needs review`，版本短碼也跟著變，老師要對新短碼再留一次言。

管道選留言，理由是留言作者由 Google 登入帳號決定，責任編輯無法代填。改用 email 或群組訊息 🔴 D-3。

#### 3.3 選單：`Review → 核可選取列（附老師簽核）`

責任編輯選取一或多列，執行此項目。程式依序：

1. 檢查目前分頁在適用清單內，且三個簽核欄都找得到。缺任一欄就中止，訊息指名缺哪一欄（R6）。
2. 跳出對話框，要求輸入老師代稱。不在 `TEACHER_SIGNOFF_LABELS` 內就中止。
3. 跳出對話框，要求輸入留言連結。空白就中止。
4. 跳出對話框，要求貼上 `id 短碼` 清單，一列一行，例如 `h5 1a2b3c4d`。選取的每一列都必須恰好出現一次，短碼必須等於該列 `current_fingerprint` 的前 8 字元。任一列不符就整批中止，訊息指名列號與 `id`。
5. 執行與現行 `核可選取列` 相同的鎖定、快照、寫入、重讀檢查（`approval-workflow.gs:229-283`），另外在同一批寫入三個簽核欄：`signoff_fingerprint` 寫入快照時的指紋。
6. 任一步失敗，八個審核欄與三個簽核欄全部復原。快照範圍從 `WRITABLE_REVIEW_FIELDS` 擴到加上三個簽核欄。

一批只能有一位老師、一則留言連結。老師一則留言同意多列時，連結相同，可以一批處理。

#### 3.4 現行兩個選單項目的改變

| 選單 | 改變 |
|---|---|
| `核可選取列`（不附老師） | 仍可用。在適用分頁上，**同時清空選取列的三個簽核欄**。理由：不讓舊老師的名字留在新版本旁邊（方案 (b) 的缺陷）。舊紀錄可從留言與試算表版本記錄回查 |
| `拒絕選取列` | 不碰三個簽核欄。拒絕後 `status` 是 `Rejected`，舊簽核的指紋與目前內容不同，同步判為失效 |
| `安裝／更新公式` | 不變。三欄不是公式欄 |

#### 3.5 簽核如何隨版本失效（比照 040）

- 040 的規則：核可綁的是核可當下的內容。內容改了，`current_fingerprint` 變了，`status` 變回 `Needs review`（`gatekeeping.md:96-99`）。
- 本票沿用同一顆指紋。**有效簽核**的定義只有一條：`status` 為 `Approved`，`signoff_by`、`signoff_ref` 非空白，且 `signoff_fingerprint` 等於同步依目前內容重算的指紋。
- 因為核可必須 `approved_fingerprint` 等於目前指紋才算 `Approved`，所以有效簽核時三份指紋相同：老師同意的版本＝責任編輯核可的版本＝網站上的版本。
- 內容改了：`status` 變回 `Needs review`，簽核欄沒有被清，但指紋不符，判為失效。重新核可時：附老師就寫新簽核；不附老師就清空。
- 只改 B 類欄（含三個簽核欄）不改變指紋，不會讓核可或簽核失效。這與 040 的「只改審核欄位不會退回」相同。
- 不新增公式欄。判定在同步端，由 Node 獨立重算，與 040 的同步端核可檢查同一做法。

#### 3.6 同步的行為

**第一期（本票實作範圍）：只記錄、不擋。**

- `sync-content.mjs` 在 T1 欄位定義加三欄，`column: 'optional'`。試算表沒有這三欄時，同步照舊（向下相容，與 064 的 `case_ref` 同一做法）。
- 三欄**不寫進** `history.json`。輸出 JSON 的欄位與位元組不變。
- 同步印出 T1 簽核摘要：`有效`、`失效（版本不符）`、`未簽` 三類各幾列，以及各類的 `id` 清單。`有效` 每列印代稱與版本短碼。`未簽` 每列印 `id` 與目前版本短碼，供 079 轉交（見第六節）。
- 簽核狀態**不會**讓同步中止，也不會讓任何一列被排除。

**第二期（🔴 D-5，本票不實作）：** 讓同步不寫入「`Approved` 但沒有有效簽核」的 T1 列，與 `Needs review` 的列同樣處理。
現在開，T1 的 40 列都會從網站消失，因為它們是 2026-09-29 切換時批次核可的，沒有老師簽核（`2026-11-17_上稿系統流程與進度.md` 第四節）。建議 078 重審完成後才開。開關是程式常數，改它要開 PR。

### 四、權限與審核責任表（草案）

依 captain 2026-11-16 裁示。人名與帳號一律不寫，誰屬於哪個角色 🔴 D-1、D-2、D-7。
正本預定寫進 `docs/content-pipeline/operations.md` 新的一節〈權限與審核責任表〉（見第九節）。

#### 4.1 角色與 Google 試算表權限

| 角色 | Google 共用權限 | 保護範圍允許名單 | 一句話職責 |
|---|---|---|---|
| captain | 擁有者 | 自動涵蓋全部 | 設定權限與保護範圍；發起同步；看 PR 後合併 |
| 責任編輯 | 編輯者 | B 類（審核欄與簽核欄） | 修改內容；代老師按核可，寫入簽核紀錄 |
| 老師（審閱者） | **加註者** 🔴 D-2 | 無 | 審閱 T1 內容；留言表示同意或要求修改 |
| 協作者（投稿者） | 編輯者 | 無 | 撰寫、修改內容 |
| 檢視者 | 檢視者 | 無 | 只讀 |
| 工程人員與 agent | 不需要試算表權限 | 無 | 依明確要求執行同步、開 PR；不改試算表 |

#### 4.2 角色 × 分頁 × 可做的事

分頁：`使用說明`、`Track 1_history`、`Track 2_discussion`、`site_tldr`。

| 角色 | `使用說明` | `Track 1_history` | `Track 2_discussion` | `site_tldr` |
|---|---|---|---|---|
| captain | 讀、改 | 讀、改內容、核可、拒絕、附老師簽核。**不手改 A 類公式欄** | 讀、改內容、核可、拒絕 | 讀、改內容、核可、拒絕 |
| 責任編輯 | 讀、改 🔴 D-6 | 讀、改內容、核可、拒絕、**附老師簽核** | 讀、改內容、核可、拒絕 | 讀、改內容、核可、拒絕 |
| 老師 | 讀、留言 | 讀、**留言表示同意或要求修改**。不改任何格、不按核可 | 讀、留言 🔴 D-4 | 讀、留言 🔴 D-4 |
| 協作者 | 讀、改 🔴 D-6 | 讀、改內容欄。改不到 A、B、C 類與簽核欄 | 同左 | 同左 |
| 檢視者 | 讀 | 讀 | 讀 | 讀 |

#### 4.3 審核責任（誰對什麼負責）

| 責任 | 負責角色 | 留下的紀錄 |
|---|---|---|
| 內容在法律上正確 | 老師 | 留言（含版本短碼）；`signoff_by`、`signoff_ref`、`signoff_fingerprint` |
| 核可的版本就是老師同意的版本 | 責任編輯 | `approved_by`、`approved_at`、`approved_fingerprint`；選單比對短碼 |
| 核可紀錄沒有被竄改、指紋相符 | 同步程式（機械） | 同步輸出；不符時整份中止 |
| 發布的 JSON 與預覽沒有看得見的錯 | captain | PR 的 diff 與合併紀錄 |
| 老師看得到網站上的成品 | 079 決定 | 079 決定 |
| 權限設定與行為測試 | captain | 測試紀錄（只記角色，不記 email） |

#### 4.4 被什麼擋、擋不到什麼

- 老師改不到任何格：由加註者權限擋。**需實測（AC-9）。**
- 協作者改不到簽核欄：由 B 類保護範圍擋。
- 簽核綁錯版本：由選單的短碼比對與同步的指紋重算擋。
- **擋不到**：責任編輯打錯老師代稱以外的事實，例如貼錯另一位老師的留言連結。留言連結可回查，但沒有機械比對。
- **擋不到**：擁有者手打簽核欄的老師代稱（R8）。

### 五、對既有機制的影響

#### 5.1 `scripts/apps-script/approval-workflow.gs`

- 新增常數 `SIGNOFF_FIELDS = ['signoff_by', 'signoff_ref', 'signoff_fingerprint']` 與適用分頁常數。
- `resolveApprovalHeaders_`：三欄列為選填，與 `OPTIONAL_APPROVAL_FIELDS` 同一機制；新選單項目另外要求三欄都存在。
- `onOpen` 加一個選單項目。
- `reviewActiveRows_`：快照與復原範圍加上三欄；接受選填的簽核參數。
- **不改** `APPROVAL_FIELDS`、`approvalFingerprint_`、`CONTENT_FINGERPRINT`、`APPROVAL_STATUS`、`APPROVAL_VERSION`。指紋與狀態公式逐字不變，既有核可不受影響。

#### 5.2 12 個保護範圍

| 變更 | 範圍（依 2026-09-29 欄號，實作時重讀） | 結果 |
|---|---|---|
| 新增 B 類範圍，只有責任編輯 | `Track 1_history` 的 `S2:U` | 12 → 13 個 |
| 擴大 C 類標題列 | `A1:R1` → `A1:U1` | 個數不變 |
| 老師 | 不進任何允許名單 | — |

T2、`site_tldr` 不變，除非 D-4 決定擴大。

#### 5.3 行為測試（044 建立的方法，050 S7-b／S7-d 的格子）

`050` 的兩組格子沿用 044 步驟 6 的十格檢查表：S7-b 以投稿者帳號測 30 格（10 格 × 3 分頁），S7-d 以責任編輯帳號反向測 B 類 18 格（6 欄 × 3 分頁）。

| 測試 | 現在 | 本票之後 | 新增的格子 |
|---|---|---|---|
| 投稿者測 A／B／C 類與內容欄 | 30 格 | **33 格** | T1 的三個簽核欄，預期「擋」 |
| 責任編輯反向測 B 類 | 18 格 | **21 格** | T1 的三個簽核欄，預期「可改」，改後立刻還原 |
| **新增**：加註者（老師角色）測 | 無 | **至少 6 項** | 三分頁各一個內容欄（擋）、T1 一個簽核欄（擋）、T1 一則留言（可留）、`Review` 選單（不可用或執行失敗） |

- 測試帳號必須不是擁有者。擁有者測不出保護（044 結論一）。
- 加註者測試可借用 044 的第二個帳號，暫時改為加註者，測完移除。🔴 D-7 captain 執行。
- 原 30 格與 18 格的格子與預期值不改，只追加。

> **2026-11-17 補述：與 079 對齊的合計數字。上方 5.2、5.3 的數字只算本票，保留不改。**
> 079 傾向改採方案 D：審閱檔是離線的單一 HTML 檔，T1 不加 `review_link` 欄。079 另建「審閱版本」分頁，整個分頁只有 captain 可改。兩票合計：
>
> | 項目 | 本票單獨 | 079 選 D | 079 選 C（加 `review_link`，A 類，T1 第 V 欄） |
> |---|---|---|---|
> | T1 新欄 | `S`–`U` | 同左 | 再加 `V` |
> | C 類標題列 | `A1:U1` | `A1:U1` | `A1:V1` |
> | 保護設定個數 | 13 | 14（+1 為整個「審閱版本」分頁） | **15**：`V2:V` 與既有 A 類範圍 `R2:R` 不相鄰，要另設一個範圍 |
> | 投稿者測試 | 33 | 34 | 35 |
> | 責任編輯反向測試 | 21（全部預期可改） | 22（新增那格預期**擋**） | 22。`V` 欄是 A 類；050 S7-d 只測 B 類，不加 |
> | 加註者測試 | 至少 6 | 至少 7 | 至少 7 |
>
> 兩項待實測：「整個分頁保護」與範圍保護是 Google 的兩種設定，前者是否也只保護到第 1000 列，**UNPROVEN**。責任編輯反向測試加一格「擋」之後，就不再是單純的反向對照，紀錄裡要把那一格分開寫。

#### 5.4 同步與指紋比對

- `scripts/content-fingerprint.mjs` 的 `PUBLISHED_FIELDS` 不改。三欄不參與指紋。
- `validateApprovalBinding` 不改。新增一個獨立的簽核判定函式，只讀不擋（第一期）。
- `history.json` 的 shape 與位元組不變。AC-4 驗證。
- 部署順序（比照 `operations.md`〈新增欄位或分頁時的順序〉與 064 階段二）：
  1. 程式 PR 合併：同步接受三個選填欄；`.gs` 新版在 repo。
  2. captain 數一次 T1 `Approved` 列數，工程跑一次不落地同步記下 sha256。
  3. captain 在 T1 建三欄，標題逐字照第 3.1 節，欄內留白。
  4. captain 新增 B 類範圍、擴大 C 類範圍。
  5. captain 把新版 `.gs` 整份貼進 Apps Script 並設定 `TEACHER_SIGNOFF_LABELS`。
  6. captain 做 5.3 的三組行為測試。
  7. captain 再數一次 `Approved` 列數，必須與第 2 步相同；工程再跑一次不落地同步，`history.json` 的 sha256 必須相同，簽核摘要必須是「未簽」等於 T1 的 `Approved` 列數。
  8. D-2 決定後，captain 以加註者身分共用給老師。

### 六、與 077、078、079 的介面

#### 6.1 給 079（預覽轉交）：簽核和看預覽的先後

**限制**：同步只寫 `Approved` 的列（`gatekeeping.md:25`）。所以一列在被核可之前，預覽網址上看不到它。老師簽核在核可之前，就表示老師簽核時還看不到成品。

兩種順序：

| | 順序 A：先簽後看 | 順序 B：先看後簽（建議） |
|---|---|---|
| 步驟 | 老師在試算表簽核 → 責任編輯附簽核核可 → 同步 PR → 老師看預覽 → 有意見就不合併 | 責任編輯先不附簽核核可 → 同步 PR → 老師看預覽 → 老師留言同意 → 責任編輯對**同一版本**附簽核再核可一次 |
| 老師簽核的依據 | 儲存格文字 | 網站上的成品 |
| 成本 | 每批一次同步 | 簽核那一步不改內容、不改指紋，不需要為簽核再同步 |
| 與第二期（D-5）的衝突 | 無 | 第二期開啟後，沒簽核的列進不了預覽。屆時 079 要另想辦法 |

🔴 D-6b：選 A 或 B。建議第一期用 B，因為網站帶 `noindex`、尚未對外，未簽核的列出現在預覽與網站上的風險有限。

> **2026-11-17 修訂（同日，079 design 回覆後）：建議改為順序 A，配 079 的審閱版建置。上一段原句保留。**
> 079 的 design worker 回覆三點（設計正本：`docs/constitution-features/reviewer-preview-delivery.md`）：
>
> 1. 079 另做一個審閱版建置（`review/<日期>` 分支），**含 `Needs review` 的列**。老師看的是這個建置，不是同步 PR 的預覽。所以本節開頭的「核可前看不到成品」只對同步 PR 的預覽成立，對審閱版建置不成立。
> 2. 079 回報 2026-11-17 實測：Vercel 預覽網址會轉到 Vercel 登入頁（Vercel Authentication）。沒有 Vercel 帳號的老師打不開順序 B 依賴的同步 PR 預覽。本票未獨立重測，引述 079 的紀錄。
> 3. h2、h28 不是 `Approved`，不在 `history.json`，只有審閱版建置看得到。順序 B 無法讓老師在核可前看到它們，而 078 要求它們在簽核前不得核可上線。
>
> 因此改建議**順序 A**：老師在審閱版建置看成品 → 老師在試算表留言同意（附版本短碼）→ 責任編輯 `核可選取列（附老師簽核）`。順序 A 與第二期（D-5）也不衝突。
> 本票第 3.3 節的選單與短碼比對不變。079 的檢查以 `approved_fingerprint` 對照「審閱版本」分頁，與本票的 `signoff_fingerprint` 是同一顆 Node 重算的指紋，兩者相容。
> **兩票交界的待辦**：079 要在 T1 加公式欄 `review_link`（A 類）。本票加三個 B 類欄。兩票合計的欄位順序、保護範圍個數（本票寫 13 個，加上 `review_link` 後會再變）與第 5.3 節的格數，要在 implement 前一起定。審閱版建置會顯示未核可的列，這與 `AGENTS.md` 第 5 條的關係由 079 說明，🔴 列為 captain 確認。
>
> **同日第二則補述（079 commit `d2adac4`〈與 076 的銜接〉）：上段的「順序 A」與 079 的「順序 C」是同一個流程。**
> 079 的 C：審閱版建置 → 老師看 → 老師留言「同意，版本 xxxxxxxx」→ 責任編輯執行一次 `核可選取列（附老師簽核）` → 同步 PR。
> 兩票的 D-6b 與 079 的 D7 是同一個決定。在 11/26 會議上以 079 的名稱「順序 C」呈現，避免兩個名稱。本票原表的「順序 A：先簽後看」指老師只看儲存格，不是這個流程，保留原文不改。
> 079 補充一項 B 的成本：**若 captain 選順序 B**，079 的轉交檢查無法在發布同步時執行，會移進本票的 `核可選取列（附老師簽核）` 選單。該指紋在「審閱版本」分頁沒有連結時，選單就拒絕簽核。這會把一段 `approval-workflow.gs` 的改動放進本票範圍，第九節的 `.gs` 行數估計要加 +20 至 +40 行。

**079 需要本票提供的東西**：同步摘要裡的「未簽」清單（`id`、版本短碼）。079 的轉交訊息應附上這份清單與預覽網址，讓老師知道要看哪幾列、留言時寫哪個短碼。
本票已將此介面另以訊息告知 079 的 design worker。

#### 6.2 給 077（使用說明與老師審閱指南）

077 的指南以第 3.2 節為準：加註者怎麼找列、版本短碼在哪一欄、怎麼留言、內容改後為什麼要再留一次言、`Needs review` 的意思。責任編輯的段落以第 3.3、3.4 節為準。

#### 6.3 給 078（T1 重審）

- 078 要求「每一列都能指出簽核紀錄或未審狀態」：同步摘要的三類清單直接回答。
- 078 要求「h2、h28 在有簽核紀錄之前，不會重新出現在 `history.json`」：**第一期不提供**。第一期同步不擋未簽的列。在第二期（D-5）開啟之前，h2 仍由 `056` 的 G-6 擋；h28 目前 `Needs review`，只要不被核可就不會出現。078 若需要更早的機械保護，要在 078 自己的設計裡處理，或請 captain 提前 D-5。

### 七、待 captain 或 11/26 會議決定

| # | 決定事項 | 建議 | 可否退回 |
|---|---|---|---|
| 🔴 D-1 | 參與審閱的老師名單，以及每位在 `signoff_by` 的代稱（`docs/health-check/TODO.md` P3-2） | captain 提供。repo 不記人名與 email | 可。改指令碼屬性即可 |
| 🔴 D-2 | 試算表共用對象。正式表目前六位編輯者、三位檢視者各是誰、屬哪個角色；老師是否全部改為「加註者」（`TODO.md` P3-1 的現況描述已過時，見 R11） | 老師一律加註者。若有老師目前是編輯者，改為加註者 | 可。共用權限隨時可改 |
| 🔴 D-3 | 老師表示同意的管道：試算表留言，或 email／群組訊息 | 留言。R10 實測不成立時再議 | 可 |
| 🔴 D-4 | 簽核範圍只有 T1，或也包括 T2、`site_tldr` | 第一期只做 T1。T2 是外部文章摘要，審閱對象不同 | 可。擴大要加欄、加範圍、重測 |
| 🔴 D-5 | 何時讓同步擋下沒有老師簽核的 T1 列（第二期） | 078 重審完成後 | 可。程式常數，PR 可回退。**但開啟當下若有未簽列，網站立刻少那些列** |
| 🔴 D-6 | `使用說明` 分頁誰可改 | 只有 captain 與責任編輯。077 決定細節 | 可 |
| 🔴 D-6b | 簽核與看預覽的先後（第 6.1 節）。與 079 的 D7 是同一個決定 | ~~順序 B~~ 改為 **079 的順序 C**（審閱版建置 → 老師看 → 留言簽核 → 附簽核核可一次 → 同步），見第 6.1 節兩則修訂。若選 B，079 的轉交檢查會移進本票的附簽核選單，`approval-workflow.gs` 增加 +20 至 +40 行 | 可。但 B 期間已在老師簽核前上線的內容，改回 C 也不會消失（079 D7） |
| 🔴 D-7 | 責任編輯是哪個帳號、有幾位；加註者行為測試由誰、用哪個帳號做 | captain 執行，借用 044 的第二個帳號 | 可 |
| 🔴 D-8 | 是否接受 R8：擁有者手打的老師代稱，機械擋不到 | 接受，以 `signoff_ref` 回查補足 | — |

### 八、元件、資料與版面

- **網站元件**：無。本票不改 `src/`。`history.json` shape 不變。
- **資料**：試算表 T1 新增三欄（第 3.1 節）。同步端新增三個選填欄位定義與一個判定函式。不新增 TypeScript 型別。
- **手機／桌面版面**：不適用。本票沒有網站畫面。試算表的加註者在手機 App 上能否留言，列入 AC-9 的實測備註，不列為驗收條件。

### 九、預估檔案與行數

| 檔案 | 變更 | 預估 | 容差 |
|---|---|---|---|
| `scripts/apps-script/approval-workflow.gs` | 常數、標題解析、選單項目、對話框、快照擴充 | +70 行 | ±30 |
| `scripts/sync-content.mjs` | 三個選填欄定義、簽核判定、摘要輸出 | +40 行 | ±20 |
| `tests/teacher-signoff.test.mjs`（新） | 同步判定與摘要；以假的 `SpreadsheetApp` 跑 `.gs` 選單流程 | +180 行 | ±70 |
| `tests/approval-content-version-binding.test.mjs` | 不改。新測試另檔，避免動到 040 已驗證的測試 | 0 | 0 |
| `docs/content-pipeline/operations.md` | 〈權限與審核責任表〉新節；〈老師簽核欄部署〉步驟 | +70 行 | ±30 |
| `docs/content-pipeline/gatekeeping.md` | 第 2 章「學者」一節改名並追加補述；第 3 章 B 類加三欄；第 5 章一列 | +20 行 | ±10 |
| `docs/content-pipeline/design.md` | 修訂紀錄追加一則 | +12 行 | ±6 |
| `docs/project/contributing.md` | 角色一句與連結 | +6 行 | ±4 |
| `docs/health-check/TODO.md` | P3-1、P3-2 追加補述 | +10 行 | ±5 |
| `docs/INDEX.md` | 上列文件的最後查核日期 | ±5 行 | ±3 |

合計約 +410 行，容差 ±180。超出容差時，implement 要在報告中說明原因。

### 十、範圍外

- 不改正式試算表、保護範圍、共用設定、已部署的 Apps Script。這些是第 5.4 節由 captain 執行的步驟。
- 不執行 `npm run sync-content`。
- 不做第二期（D-5）。
- 不做預覽轉交（079）、使用說明（077）、重審（078）。
- 不改 `APPROVAL_VERSION` 與指紋演算法。

## Captain decisions (2026-11-17)

captain 於 2026-11-17 採用 079〈現在就要決定〉與本票第七節的 11 項建議預設值。編號對照寫在括號裡。

| # | 決定 | 本票的對應 | 對實作的影響 |
|---|---|---|---|
| 1 | 採用方案 D：單檔 HTML 審閱檔（079 #1） | 第 5.3 節補述「079 選 D」一欄 | T1 只加本票三欄，079 不加 `review_link`。與 079 合計 14 個保護設定 |
| 2 | 採用順序 C：老師看審閱檔 → 留言 → 責任編輯附簽核核可一次（079 #2） | D-6b | 附簽核選單不含 079 的轉交檢查，`.gs` 不需要 +20 至 +40 行 |
| 3 | 只管 Track 1（079 #3） | D-4 | `SIGNOFF_SHEETS` 只列 `Track 1_history` |
| 4 | 接受程式合併後正式同步暫停，直到老師審完 40 列（079 #4） | 無 | 本票不受影響。暫停來自 079 的轉交檢查 |
| 5 | 老師以試算表留言表示同意 | D-3 | `signoff_ref` 存留言連結，必填 |
| 6 | 審閱檔以 email 附件寄送（079 #5、#6） | 無 | 寫進 `operations.md`〈權限與審核責任表〉的審核責任 |
| 7 | 審閱檔由 captain 產生、寄送、登錄（079 #7） | 無 | 同上 |
| 8 | 第二期（同步排除未簽列）等 078 重審完成後才開 | D-5 | 本票不實作第二期；摘要只記錄，不擋 |
| 9 | 接受 R8：擁有者手打的老師代稱，機械擋不到 | D-8 | 寫進責任表〈被什麼擋、擋不到什麼〉 |
| 10 | `使用說明` 分頁只有 captain 與責任編輯可改 | D-6 | 寫進責任表；分頁內容由 077 負責 |
| 11 | `gatekeeping.md` 的「學者」一節於本階段修正 | `## Documentation impact`〈現在更新〉第二列 | implement 改寫該節並追加補述，不等部署 |

**仍待 captain 的事**（不阻擋 implement，repo 內不記人名與帳號）：D-1 老師名單與代稱；D-2 試算表共用對象與老師改為加註者；D-7 責任編輯帳號與加註者行為測試帳號。

## Acceptance criteria

每一條是完成後的性質。`Verified by` 寫明誰、用什麼、預期看到什麼。標「部署後」的條由 captain 在正式表執行，不在 implement 階段。

1. **AC-1　權限與審核責任表存在，且與裁示一致。** `docs/content-pipeline/operations.md` 有〈權限與審核責任表〉一節，含第四節的 4.1–4.4 四張表。老師一列在每個分頁都不含「改」與「核可」。表內沒有人名與 email。
   Verified by：`awk '/^## 權限與審核責任表/{s=1;next} /^## /{s=0} s' docs/content-pipeline/operations.md` 印出該節；review 階段逐格比對 captain 2026-11-16 裁示；AC-10 的掃描通過。
2. **AC-2　任一已核可的 T1 列都查得到簽核老師與所綁內容版本，或明確標為「未簽」或「失效」。** 同步摘要把每一個 `Approved` 的 T1 列放進三類之一，且只放一類。`有效` 的列印出 `signoff_by` 與 `signoff_fingerprint` 的短碼。
   Verified by：`node --test tests/teacher-signoff.test.mjs` 的測試以四列夾具（有效、內容改後失效、不附老師核可後清空、從未簽核）斷言摘要的三類清單與每列印出的代稱、短碼；把判定函式改成永遠回傳「有效」時此測試失敗。部署後：captain 發起的不落地同步摘要中，三類列數相加等於 T1 `Approved` 列數。
3. **AC-3　內容一改，簽核就失效。** 對 T1 的每一個發布欄位（`scripts/content-fingerprint.mjs` 的 `PUBLISHED_FIELDS` 中 T1 那一組），核可附簽核後再改該欄，判定為「失效」。
   Verified by：`tests/teacher-signoff.test.mjs` 逐欄迭代；若判定不比對 `signoff_fingerprint` 與重算指紋，此測試失敗。
4. **AC-4　加三欄不改變網站資料，也不讓既有核可失效。** 同一份夾具，有無三個簽核欄，同步寫出的 `history.json` 位元組相同，且 exit 0。
   Verified by：`tests/teacher-signoff.test.mjs` 比對兩次輸出的 sha256；若三欄被寫進 JSON 或被納入指紋，此測試失敗。`node --test tests/approval-content-version-binding.test.mjs` 全過且該檔未被修改（`git diff --stat` 不含此檔）。部署後：第 5.4 節第 2 步與第 7 步的 sha256 相同、`Approved` 列數相同。
5. **AC-5　附老師簽核的選單擋得住錯誤輸入，失敗時全部復原。** 下列任一情況，選單中止，九個欄位（`WRITABLE_REVIEW_FIELDS` 的六欄，加三個簽核欄）全部回到執行前的值：代稱不在清單；留言連結空白；短碼不符；選取列在貼上清單中缺漏或重複；三個簽核欄缺任一欄（訊息指名該欄）；寫入後重讀指紋改變。
   Verified by：`tests/teacher-signoff.test.mjs` 以 `vm` 載入 `approval-workflow.gs`，配假的 `SpreadsheetApp`、`PropertiesService`、`Session`、`LockService`，逐一觸發六種情況並比對寫入前後的格值。拿掉任一項檢查，對應測試失敗。
6. **AC-6　不附老師的核可會清空簽核欄；拒絕不碰簽核欄。**
   Verified by：同上測試檔，先附簽核核可，再分別執行 `核可選取列` 與 `拒絕選取列`，斷言三欄的值。
7. **AC-7　第一期簽核不擋發布。** 夾具中有 `Approved` 但未簽或失效的 T1 列時，同步 exit 0，該列照常寫進 `history.json`。
   Verified by：`tests/teacher-signoff.test.mjs`；若程式把未簽列排除或中止，此測試失敗。
8. **AC-8　沒有簽核欄的舊試算表照常同步。**
   Verified by：AC-4 的「無三欄」那一次即為此條；另斷言摘要印出「T1 沒有簽核欄」之類的單行說明，而非錯誤。
9. **AC-9　正式表的權限行為符合責任表（部署後，captain 執行）。** 投稿者帳號 34 格、責任編輯帳號反向 22 格、加註者帳號至少 7 項，全部與 `docs/content-pipeline/operations.md`〈老師簽核欄部署〉的行為測試表相符。（2026-11-17 captain 核准修改。原文為 33 格、21 格、至少 6 項，對應第 5.3 節本票單獨的數字；新數字含 079 方案 D 的審閱版本分頁，見第 5.3 節補述。）紀錄含 UTC 時間、角色、逐格結果，不記 email。R9、R10 的實測結果一併記下。
   Verified by：captain 的行為測試紀錄，寫進本票的 implement 或 verify 報告；任何一格不符即不通過，依 050 S7-b 第 4 點重設後整分頁重測。
10. **AC-10　repo 內沒有老師的人名或帳號。**
    Verified by：對本票 diff 新增行執行 `git diff main...HEAD -U0 | grep '^+' | grep -nE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}'` 無輸出；review 人工確認沒有加入人名。
11. **AC-11　指紋與狀態公式逐字未改。**
    Verified by：`git diff main...HEAD -- scripts/apps-script/approval-workflow.gs` 中，`APPROVAL_FIELDS`、`approvalFingerprint_`、`CONTENT_FINGERPRINT`、`APPROVAL_STATUS` 四段沒有刪除行；`tests/approval-content-version-binding.test.mjs` 的「Apps Script 與 Node 對三個分頁產生相同 fingerprint-v1」通過。

## Test plan

- 本機：`node --test tests/teacher-signoff.test.mjs tests/approval-content-version-binding.test.mjs tests/track2-case-ref-stance.test.mjs`、`npx tsc --noEmit`、`npm run build`。
- 不接觸正式 SSOT。夾具資料不得含 `AGENTS.md` 列出的佔位字串以外的真實人名。
- 部署後的 AC-2、AC-4 後半、AC-9 由 captain 執行，或由 captain 明確要求工程執行不落地同步。agent 不自行執行同步。

## Documentation impact

### 現在更新

| 文件 | 更新內容 | 狀態與驗證目標 |
|---|---|---|
| `docs/constitution-features/teacher-review-role-and-signoff.md` | 本節與 `## Design` | 已定方向，**尚未實作**，D-1 至 D-8 待決。驗證目標：`grep -c 'signoff_' scripts/sync-content.mjs scripts/apps-script/approval-workflow.gs` 在 main 上兩檔皆為 `0` |
| `docs/content-pipeline/gatekeeping.md` | 第 2 章「學者」一節追加補述：captain 2026-11-16 裁示老師只審閱簽核、不按核可；簽核紀錄機制已設計於 076，**尚未實作**；原句「權限與投稿者相同」在 D-2 決定前仍描述現況。**不改寫原句** | **本階段未寫**：FO 限定 design 只寫本票。請 FO 決定由 implement 第一個 commit 寫入，或另行授權。驗證目標：補述含「尚未實作」；`git diff` 該檔只有新增行 |

### 實作後更新

| 文件 | 更新內容 | 時點 |
|---|---|---|
| `docs/content-pipeline/operations.md` | 新增〈權限與審核責任表〉一節（AC-1）；新增〈老師簽核欄部署〉步驟（第 5.4 節）；〈保護範圍〉表加 T1 的 `S2:U` 並把「12 個」改以補述說明變成 13 個 | 程式 PR 合併時寫步驟；部署完成後追加「已完成」補述 |
| `docs/content-pipeline/gatekeeping.md` | 第 2 章角色改為與責任表一致；第 3 章 B 類加三欄；第 5 章加一列「老師簽核紀錄」防線，寫明第一期只記錄不擋 | 部署完成後。依本文規則，寫「已完成（日期）」 |
| `docs/content-pipeline/design.md` | 修訂紀錄追加一則：簽核欄、判定規則、第一期不擋 | 程式 PR 合併時 |
| `docs/project/contributing.md` | 〈內容協作〉加老師角色一句，連到責任表 | 程式 PR 合併時 |
| `docs/health-check/TODO.md` | P3-1 追加補述：正式表已有共用對象（050 記載），描述已過時；P3-2 追加補述：老師名單由 D-1 決定，記在 Apps Script 指令碼屬性，不進 repo | D-1、D-2 決定後 |
| `docs/INDEX.md` | 上列文件的最後查核日期 | 每次改上列文件時 |

### 不更新

- `docs/constitution-features/_archive/040-*.md`、`044-*.md`、`050-*.md`、`054-*.md`：`record`，不改寫。
- `docs/content-pipeline/approval-permission-probe.md`：044 的歷史證據，不改。本票的行為測試紀錄寫在本票。
- `AGENTS.md`：「絕對不要做的事」不受影響。
- `../Constitution_docs/0_會議紀錄與待辦/2026-11-17_上稿系統流程與進度.md`：repo 外的會議文件，由 captain 決定是否更新。

## Stage Report: design

- DONE: 選定老師簽核紀錄方案並附風險證據：至少比較 (a) 試算表新增老師簽核欄並綁定 current_fingerprint、(b) 責任編輯按 Approve 時一併記錄簽核老師；說明內容修改後簽核如何隨版本失效（比照 040），以及對 approval-workflow.gs、12 個保護範圍、044 的 18 格權限測試與 sync 指紋比對的影響
  `## Design` 第二節比較 (a)／(b)／(b′) 並列 R1–R11 證據；第 3.5 節寫失效規則；第五節 5.1–5.4 寫四項影響（13 個範圍、30→33／18→21 格、加註者新測、指紋與 JSON 不變）。
- DONE: 權限與審核責任表草案（角色 × 分頁 × 可做的事），反映 captain 2026-11-16 裁示「老師只審閱簽核、責任編輯代按 Approve」；老師名單與分享對象（TODO P3-1、P3-2）列為待 captain 確認，不自行假定人名或帳號
  第四節 4.1–4.4 四張表；第七節 🔴 D-1、D-2、D-7。repo 內無人名或 email。另發現 P3-1 已過時（R11：050 記載正式表有六位編輯者）。
- DONE: 驗收條件以完成後的性質表述並各附 Verified by（至少一項量測「任一已核可列能查到簽核老師與所綁內容版本」）；預估檔案與行數及容差；文件影響分 現在更新／實作後更新／不更新
  AC-1–AC-11，其中 AC-2 量測「任一已核可列」；第九節估約 +410 行，容差 ±180；`## Documentation impact` 三節齊備。gatekeeping.md 的「現在更新」因 FO 限定只寫本票，本階段未寫，交 FO 決定。

### Summary

選定 (b′)。老師以「加註者」身分在試算表留言表示同意，留言要引用版本短碼。責任編輯用新選單 `核可選取列（附老師簽核）` 代按核可，選單同時寫入 `signoff_by`、`signoff_ref`、`signoff_fingerprint`。第一期只記錄、不擋發布。指紋、狀態公式與 `history.json` 都不變；既有綁定測試 68/68 通過，作為基線。共有 9 項待 captain 或 11/26 會議決定（D-1 至 D-8，加 D-6b）。最關鍵的是 D-2 老師的共用角色，以及 D-5 何時強制簽核。已把預覽順序的介面（建議「先看後簽」）以訊息告知 079 的 design worker。同日 079 回覆：079 另做含 `Needs review` 列的審閱版建置，而且 Vercel 預覽要登入、老師打不開。因此第 6.1 節追加修訂，建議改為順序 A（先在審閱版看，再簽，再核可），原句保留。

## Stage Report: implement

- DONE: 依定稿方案 (b′) 實作並通過測試：approval-workflow.gs 新增「核可選取列（附老師簽核）」（缺欄中止、代稱清單比對、留言連結必填、id 短碼逐列比對、與既有核可同批鎖定快照寫入、任一失敗全欄復原），既有「核可選取列」清空三個簽核欄；簽核判定與摘要（有效／失效／未簽）放在獨立模組，sync-content.mjs 只加最少的接線，第一期不擋發布；新測試 tests/teacher-signoff.test.mjs 通過，既有 040 綁定測試 68/68 不退步，history.json 輸出不變
  `1c47ffe`、`cfe4f3e`。判定在新模組 `scripts/teacher-signoff.mjs`。`sync-content.mjs` 只加 7 行：一個 import、`TRACK_1_COLUMNS` 一個展開、`main()` 寫檔後 3 行摘要。`buildTrack1` 與匯出清單未動。短碼 `fingerprintShortCode` 加在 `content-fingerprint.mjs` 檔尾，已把逐字內容傳給 079 共用。`node --test` 三檔 108/108（新 24、040 綁定 68、064 16），`npx tsc --noEmit` exit 0，`npm run build` exit 0 且 `src/data/*.json` sha256 不變。
  依宣稱分組，每組的測試與會讓它失敗的改動：
  - AC-2：四列夾具各落入一類，且印出代稱與短碼。判定改成永遠「有效」時，4 項失敗（已實測）。
  - AC-3：逐一改 T1 的 10 個發布欄位，每次都判「版本不符」。拿掉指紋比對時失敗（同一次 mutation）。
  - AC-4、AC-7、AC-8：真的跑子程序同步，比較有三欄與無三欄的結果。`history.json` sha256 相同、exit 0，未簽與失效列照常寫出，無欄時印一行說明。把 `SIGNOFF_COLUMNS` 從 T1 欄位定義拿掉時，2 項失敗（已實測）。
  - AC-5：以 `vm` 載入 `.gs`，配假的 `SpreadsheetApp`、`PropertiesService`、`Session`、`LockService`。觸發 7 種失敗，外加缺任一欄，九個欄位都逐格回到原值。已實測下列拿掉檢查的改動，各有對應測試失敗：拿掉短碼比對，3 項失敗；復原範圍只留 6 欄，2 項失敗；拿掉代稱檢查，1 項失敗。
  - AC-6：附簽核核可後，不附老師的核可會清空三欄。拿掉清空那一行，1 項失敗（已實測）。拒絕不碰三欄。
  - 相容性：沒有簽核欄的分頁，舊選單照常運作。`.gs` 與 Node 的三欄、適用分頁、短碼長度常數相同。`onOpen` 選單恰為四項。
  - AC-11：`git diff main...HEAD` 中 `.gs` 的 5 行刪除都在 `resolveApprovalHeaders_` 與 `reviewActiveRows_`，四個受保護段落沒有刪除行。040 綁定測試檔與 `src/` 無 diff。
- DONE: 文件依「實作後更新」落地：gatekeeping.md「學者」一節依 2026-11-16 裁示改寫（老師為加註者、只審閱簽核）、B 類加三欄；operations.md 新增〈權限與審核責任表〉與〈老師簽核欄部署〉步驟（先合併程式再建欄、與 079 合計 14 個保護設定、測試格數 投稿者 34／責任編輯反向 22／加註者至少 7）；repo 內不寫人名或 email
  `cfe4f3e`。gatekeeping 第 2 章改為「老師」一節，追加補述並保留原句。第 3 章 B 類加三欄，標明「尚未建欄、尚未實測」。operations.md 新增兩節，並加了四項補充：〈保護範圍〉補述 12→14、〈核可與拒絕〉補述新選單、四條錯誤訊息、驗證指令。design.md 修訂紀錄、contributing.md、INDEX.md 一併更新。AC-10 email 掃描無輸出。人名只用「老師甲／老師乙」代號，且只在測試裡。
- DONE: 票內新增「## Captain decisions (2026-11-17)」節，逐項記錄 captain 採用的 11 項預設（方案 D、順序 C、只管 T1、接受同步暫停、試算表留言、email 寄送、captain 產生寄送登錄、第二期待 078 完成、接受 R8、使用說明僅 captain 與責任編輯可改、gatekeeping.md 學者節於本階段修正）
  位於 `## Acceptance criteria` 之前，11 列附 079／076 編號對照與對實作的影響。另列出仍待 captain 的 D-1、D-2、D-7。
- SKIPPED: gatekeeping.md 第 5 章「老師簽核紀錄」防線一列、TODO.md P3-1／P3-2 補述
  兩項在設計的時點都是「部署完成後」或「D-1、D-2 決定後」，現在都還不成立。提前寫，evergreen 文件會描述尚未存在的現況。

### Summary

依 (b′) 完成實作。Apps Script 新增附老師簽核的核可選單。同步端新增獨立的簽核判定模組，只印摘要、不擋發布。`sync-content.mjs` 只加 7 行接線，降低與 079 合併時衝突的機會。行數超出預估：新增約 846 行，預估是 410±180。主要多在兩處。一是測試檔 449 行（預估 180±70）：假 `SpreadsheetApp` 與 24 項測試，每個檢查都以 mutation 確認測試會失敗。二是 operations.md 139 行（預估 70±30）：併入 079 的合計數字、錯誤訊息與回退步驟。另外兩處與設計不同，都可退回。代稱清單也接受逗號與頓號分隔，因為指令碼屬性的輸入框只有一行。留言連結必須是 `http(s)` 網址，不只是不可空白。未驗證：「取得留言連結」的介面文字、加註者能否看到選單（R9）、刪除的留言是否保留（R10），都要等部署後由 captain 實測。

## Stage Report: verify

- DONE: 逐項查核本分支文件改動中的事實陳述（gatekeeping.md、operations.md、design.md、contributing.md、INDEX.md）：保護設定 12→14、測試格數 投稿者 34／責任編輯反向 22／加註者至少 7、欄位位置、選單名稱與錯誤訊息，皆對照 approval-workflow.gs、teacher-signoff.mjs、sync-content.mjs 與封存的 040／044／050；凡「尚未部署／尚未實測」的事項不得寫成已上線
  數字全對：12 個＝050 `:893`、`:1221`；30 格＝050 `:1283`；18 格＝050 `:1390`；`R` 為 T1 最後一欄、`A1:R1`＝operations `:44-52`；`S2:U` 與 `L2:Q` 隔著 A 類 `R`，故 +1 成立；+1 審閱版本分頁＝079 `reviewer-preview-delivery.md:180`。選單四項名稱、四條錯誤訊息、`ℹ️ T1 沒有簽核欄…`、「有效 N 列、失效 N 列、未簽 N 列」皆與 `.gs`／`teacher-signoff.mjs` 逐字相符；不落地同步指令在 operations `:244`。發現 F1–F4、N1，見下。
- DONE: 佔位掃描：某學者、某大學法律系、test、lorem ipsum、設計文件的樣本值、人名與 email（「老師甲／乙」僅能出現在測試）均未進入出貨文件或 src/data；src/ 與 src/data/*.json 無 diff
  `git diff main...HEAD -U0 -- . ':!tests'` 新增行無 某學者／某大學法律系／lorem／老師甲乙／快速了解；email 正則無輸出（AC-10）。唯一命中是格式範例 `xxxxxxxx`、`h5 1a2b3c4d`（說明格式，非資料）。`git diff --stat main...HEAD -- src` 空；`npm run build` 前後 `src/data/*.json` sha256 相同。
- DONE: 獨立重跑 node --test（含 teacher-signoff、040 綁定、064）、npx tsc --noEmit，並至少重做一項 mutation 確認對應測試會失敗；對照 AC-1–AC-11 給出 PASSED 或 REJECTED 與理由
  108/108、tsc exit 0、build exit 0。在 scratchpad 副本做 5 項 mutation，worktree 未動：同步判定不比對指紋→3 項失敗（AC-2/3）；復原只留 6 欄→2 項失敗（AC-5）；拿掉「清單有選取範圍外 id」檢查→1 項失敗（AC-5，implement 未測過此項）；不附老師核可不清空→1 項失敗（AC-6）；`signoff_by` 加進 `PUBLISHED_FIELDS`→19 項失敗（AC-4）。AC-1–8、10、11 成立；AC-9 為部署後項目，未執行。建議 **REJECTED**，理由為 F1。

### 發現（依 `## Review-finding disposition` 四欄；處置待 FO 授權）

- **F1 建議 Material，本票可修，建議 fix。** 使用者與流程：captain／責任編輯讀 evergreen 的 gatekeeping 與 contributing，判斷「現在」誰擋得住什麼。可見損害：`gatekeeping.md:54-56` 以現在式寫「權限：試算表的加註者」「改不到任何格，由加註者權限擋」「核可由責任編輯以 `核可選取列（附老師簽核）` 代按」；`contributing.md:33-34` 同樣以現在式寫選單代按。正式表沒有這個選單，老師的共用權限也沒有紀錄（R11）。加註者能否看見選單仍是 UNPROVEN（R9）。受影響邊界：本階段 checklist「尚未部署事項不得寫成已上線」，以及 AGENTS.md 對 evergreen 的規則。觸發證據：上述行號。`:63` 的補述有說明，但與本文矛盾；contributing 則完全沒有說明。同檔 `:93` B 類列有寫「尚未建欄、尚未實測」，是正確寫法。修法：在兩處加「〈老師簽核欄部署〉完成後」標記，約 3 行。
- **F2 Polish。** `gatekeeping.md:58` 與 `:65` 有兩條「正本」。`:64` 的補述暗示舊條已被取代，但舊條仍在。
- **F3 Polish。** `operations.md:67` 的補述標題寫部署 076 後「會變成 14 個」。076 單獨部署只會到 13 個；第 14 個來自 079 的分頁。補述內文與 `:198-209` 的表都寫對了。另外〈權限與審核責任表〉說它描述「076 部署完成後」，表中卻有「審閱版本」欄，而那一欄屬於 079 的部署。
- **F4 Polish。** 有兩處文字直接改寫，沒有補述：`design.md` 的 076 修訂紀錄沒寫「尚未部署」，只指向部署步驟；`gatekeeping.md:134`、`:165` 把「學者」直接改成「老師」。在 evergreen 文件裡統一用詞可以接受，此項只記錄。
- **N1 Needs decision，屬 captain。** AC-9 本文仍寫 33／21／6。operations 的 runbook 依 captain 決定 #1 寫 34／22／7（設計第 5.3 節補述的「079 選 D」欄）。AC 只能由 captain 修改。部署時兩個數字會互相矛盾，建議 captain 確認 AC-9 以 34／22／7 為準。

### 超出預估的判斷

報告的約 846 行屬實（numstat 873 行，含 entity 43 行）。出貨的程式與文件約 381 行。`.gs` 新增 98 行，在 70±30 內。同步端 96 行，超出 40±20，原因是判定移進獨立模組，並含摘要格式。測試 449 行，超出 180±70。多出的部分是 HTTP 假 CSV 伺服器、`vm` 假 `SpreadsheetApp`，以及 24 項測試。五項 mutation 都被抓到，所以這些行有實際作用，不是灌水。可挑剔的一點：載入 `.gs` 的 harness 在 040、064 的測試裡已各有一份，本票又寫了第三份，沒有共用。operations 139 行，超出 70±30。多出的是 079 合計數字、四條錯誤訊息、回退步驟，都在設計第 5.4 節的範圍內。結論：沒有範圍蔓延；超出部分是測試與 runbook 的實際價值。

### Summary

事實查核：數字、欄位、選單名稱、錯誤訊息都與程式及 040／044／050 相符。測試、型別檢查、建置都獨立重跑通過；五項 mutation 都讓對應測試失敗。建議 REJECTED，只因 F1：gatekeeping.md 與 contributing.md 把尚未部署的加註者權限與附簽核選單寫成現況。修正約 3 行。F2–F4 為 Polish，N1 交 captain 決定 AC-9 格數。

### Feedback Cycles

- Cycle 1 (verify → implement, 2026-11-17): verify 建議 REJECTED。FO 授權處置：F1 fix（gatekeeping.md:54-56、contributing.md:33-34 改標為「〈老師簽核欄部署〉完成後」，比照 gatekeeping.md:93；處理 :63 補述與本文矛盾）；F2 fix（gatekeeping.md:58、:65 只留一條「正本」）；F3 fix（operations.md:67 改為 076 單獨部署為 13、加上 079 為 14；權限表「審閱版本」欄註明來自 079 部署）；F4 fix（gatekeeping.md:134、:165 改名處加補述；design.md 076 修訂紀錄註明尚未部署）；N1 fix（captain 2026-11-17 核准：AC-9 改為 投稿者 34／責任編輯反向 22／加註者至少 7）。captain 2026-11-17 接受 076 行數超出（846 對 410±180）。不在本輪：合併後 tests/teacher-signoff.test.mjs 兩項真同步測試需補 review.csv fixture，由後合併的分支處理。

## Stage Report: implement (cycle 2)

- DONE: 依授權處置修正 F1–F4 與 N1，只動所列文件與 AC-9，不動程式與測試
  `1c2b102`。F1：gatekeeping.md 老師一節把加註者權限、附簽核選單、加註者擋格改列在「〈老師簽核欄部署〉完成後才成立，尚未部署」之下，另立「部署前的現況」一項。補述改寫為「原句無記錄可證實，本節不再沿用」，不再與本文矛盾。contributing.md 兩行改標「〈老師簽核欄部署〉完成後」與「尚未部署」。F2：老師一節只剩一條「正本」，原三個連結併入。F3：operations.md〈保護範圍〉補述改為 076 單獨 12→13，加 079 為 14；權限表欄名改「審閱版本（079 部署後）」並註明部署前不適用。F4：gatekeeping.md 第 5 章 `067` 列與第 7 章改稱處各加「原為學者」註記，第 2 章補述也記一句；design.md 的 076 條目加「狀態：repo 內已實作，正式表尚未部署」。N1：AC-9 改為 34／22／至少 7，附 captain 2026-11-17 核准與原數字。`git diff --stat -- scripts tests src` 無輸出。
- DONE: 修正後重跑 node --test（108 項）與 npx tsc --noEmit 仍全過，並以 grep 證明 gatekeeping.md、contributing.md 不再以現在式描述尚未部署的加註者與簽核選單
  三檔 108/108，tsc exit 0。`grep -nE '加註者|附老師簽核'` 兩檔共 8 行命中，逐行都帶部署條件：gatekeeping:56–58 在「部署後才成立，尚未部署」子項下；:59「部署前的現況」；:67 補述寫「第 12 步完成後才成立」；:97 同列寫「尚未建欄、尚未實測」；contributing:34–35 寫「完成後」與「尚未部署」。content-audit check 沒有新增指向這兩檔的項目，其餘既有項目與 main 相同。
- DONE: 在本票新增 implement（cycle 2）stage report，逐項對應 F1–F4、N1
  即本節。

### Summary

只改文件，處理 verify cycle 1 的 F1–F4 與 N1。關鍵是 F1：gatekeeping.md 與 contributing.md 原本把尚未部署的加註者權限與附簽核選單寫成現況，現在一律標明「〈老師簽核欄部署〉完成後」。AC-9 依 captain 核准改為 34／22／至少 7。程式與測試未動，合併時 review.csv fixture 的處理依 FO 指示不在本輪範圍。
