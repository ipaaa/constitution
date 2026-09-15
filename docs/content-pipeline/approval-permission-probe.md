# 隔離測試表兩帳號 probe 記錄

**狀態**：record
**執行期間**：工作記錄只對 2026-09-15 的事件標日期（P2 重驗、P7、收尾）。
其餘步驟的執行日期未記錄。feature 044 的 implement stage 於 2026-09-08 起算。
**測試表 ID 雜湊（SHA-256）**：`a186d380c903dc493dbbd7c863deab2fa23d39142de97b49ffab0f96f1660a99`
**Apps Script 版本**：`scripts/apps-script/approval-workflow.gs`，commit
`093cd013515d64522dc47662202fd5ad3ce73b84`

本檔是 `record`。不改寫原文。要修正就追加一節補述。

> **本檔的記錄粒度有五個已知缺口，先講清楚：**
> 1. 各步驟的 UTC 時間沒有逐步記錄。工作記錄只對 2026-09-15 的事件標日期。
> 2. Apps Script execution ID 沒有記錄。現行介面不提供該欄位，見「Apps Script 執行紀錄」一節。
> 3. P2 的記錄是五格，不是 feature 044 的票所要求的十一項。見「P2」一節。
> 4. **`approved_*` 三欄的查核不完整。** P1 只查核 `approved_by` 與 `approved_at` 兩欄；
>    P3 完全未查核這三欄。票內 AC-2 要求兩次都確認三欄逐字不變。見 P1 與 P3 兩節。
> 5. 各命題的 `current_fingerprint` 實際值都沒有逐字記錄，改以 `status` 的行為間接證明。
>
> 這五項都是記錄缺口，不是行為失敗。各命題的行為結論不受影響，但**證據強度低於 AC 原文要求**。
> **本檔只記錄真正觀察到的事。沒有觀察到的，寫成缺口，不寫成事實。**

---

## 角色

| 代號 | 角色 | 身分 |
|---|---|---|
| A | 責任編輯／核可者 | 測試表擁有者，綁定式 Apps Script 專案擁有者 |
| B | 投稿者 | 以「編輯者」身分受邀，不是擁有者 |

兩個帳號的 email 不寫進本檔。

---

## 環境建立

### 測試表

全新獨立試算表，不是正式 SSOT 的分頁。三個分頁的名稱逐字建立。

### 三個分頁的匯入結果

| 分頁 | 列數 | 欄數 | 最後一欄 |
|---|---|---|---|
| `Track 1_history` | 3 | 18 | R1 = `reject_reason` |
| `Track 2_discussion` | 3 | 21 | U1 = `reject_reason` |
| `site_tldr` | 4 | 12 | L1 = `reject_reason` |

**匯入方式的更正**：直接貼上剪貼簿會讓換行失效。全部內容擠成一列，A2 空白。
正確做法是 **檔案 → 匯入 → 上傳 → 取代目前工作表 → 分隔符逗號**。

### Apps Script 安裝

`Review` 選單正常出現。三個分頁各執行一次 `Review → 安裝／更新公式`，三次都成功，無錯誤訊息。

**證實一條規則**：`Track 2_discussion` 的標題 `owl_comment （允鍾短評）` 安裝成功。
「欄名＋合法分隔符＋中文說明」的標題可以通過 `resolveApprovalHeaders_`。
feature 050 的步驟 3 不需要改寫標題規則。

**一個會誤導執行者的現象**：重新載入試算表會自動觸發 `onOpen`。
該次執行在「執行項目」顯示為已完成。它不是安裝紀錄。
要確認安裝，看函式名稱是不是 `installApprovalFormulas`。

### 檔案指紋

| 檔案 | sha256 |
|---|---|
| `approval-workflow.gs`（263 行） | `cd380aee10710dbdabfd275c480aa328c47c14c299e81ef629f2f2507fe86d67` |
| `appsscript.json` | `89fea58649f3372fe9125fd2ad936c5c16cb64f1def58d6d9ddcdc0edc243ad7` |

`oauthScopes` 為 `spreadsheets.currentonly` 與 `userinfo.email`。

### 保護範圍

實際設定 11 個範圍，不是 feature 044 的票所寫的 9 個。
原因是「乙　審核欄」的六欄不連續：`reject_reason` 與其餘五欄被 `current_fingerprint` 隔開。
部分分頁因此拆成兩段設定。

**數量不是判準，行為才是。** 驗收方式是用 B 逐格實測：B 改得動內容欄、改不動審核欄，分界才算正確。
本次即因為只看設定畫面而漏設三個範圍，見「P2」一節。

邀請順序正確：先設保護範圍，後邀請 B 為編輯者。

---

## 指紋核對

安裝公式後，七格 `current_fingerprint` 與 feature 044 的票的對照表相符。

| 格子 | 分頁 | 開頭 8 碼 | 結尾 8 碼 | 結果 |
|---|---|---|---|---|
| Q2 | `Track 1_history` | `2d5e569e` | `72c27765` | 相符 |
| Q3 | `Track 1_history` | `9538691c` | `8d65f908` | 相符 |
| T2 | `Track 2_discussion` | `75882184` | `db3155af` | 相符 |
| T3 | `Track 2_discussion` | `4414669e` | `7b071b74` | 相符 |
| K2 | `site_tldr` | `ae7076c3` | `9d7962cd` | 相符 |
| K3 | `site_tldr` | `4362c97d` | `4172ca25` | 相符 |
| K4 | `site_tldr` | `c01993f1` | `287b59ef` | 相符 |

**比對粒度的實話**：比對的是開頭 8 碼與結尾 8 碼，不是完整 64 字元逐字比對。
票內 AC-1 要求逐字。本次未達該粒度。
七格同時在頭尾各 8 碼都命中的機率極低，因此結論仍成立，但記錄粒度低於 AC 原文。

**意義**：測試表上執行的程式與 repo 的 `approval-workflow.gs` 產生相同指紋。
資料、程式、版本三者一致。後續各命題的結論可以採信。

安裝後 `status` 欄七列全部顯示 `Needs review`。內容存在、從未核可，符合預期。

### 用 A 核可全部七列

三個分頁各執行一次 `Review → 核可選取列`。範圍是 `Track 1_history` 列 2-3、
`Track 2_discussion` 列 2-3、`site_tldr` 列 2-4。

結果：七列 `status` 全部由 `Needs review` 轉為 `Approved`。
`review_fingerprint`、`approved_fingerprint`、`current_fingerprint` 三份相同。

**意義**：核可寫入的指紋等於當下內容的指紋。「核可的就是這一版」成立。

---

## 各命題結果

### P1　責任編輯自行修改內容　通過

- 操作：A 修改 `Track 1_history` 列 2 的內容欄。
- 預期：`status` 轉為 `Needs review`，`approved_by`、`approved_at`、`approved_fingerprint` 不變。
- 實際：`status` 轉為 `Needs review`。`approved_by` 與 `approved_at` 仍有值。
- 判定：通過。

**意義**：這是 feature 040 的 AC-4 在 verify cycle 1 被判 REJECTED 時所缺的表端證據。
公式不依操作者身分放行。責任編輯自己改內容，核可一樣失效。

**記錄缺口一**：**`approved_fingerprint` 未查核。**
原始記錄只觀察到 `approved_by` 與 `approved_at` 兩欄仍有值。
票內 AC-2 要求三欄逐字不變。第三欄的證據不存在，本節不宣稱它未變。

**記錄缺口二**：修改後 `current_fingerprint` 的實際值沒有記錄。
票內 AC-2 要求它逐字等於 `bab4a7d2c9e29c3044b1afda0d252e44ca3624a019f7700d520874a8e6806843`。
本次只記錄了 `status` 的轉換。

**附帶證據（來自 P4 的前置還原）**：把列 2 的內容還原為原值後，
`current_fingerprint` 回到 `2d5e569e…72c27765`，與原始參考值相同。
這證明 P1 的改動完全可逆，指紋是內容的純函數，不帶歷史狀態。

### P2　投稿者不能編輯審核欄位　通過（重驗後）

**本項首次判定為假通過。過程記錄在下面，不可省略。**

#### 第一次測試（假通過）

B 以編輯者身分嘗試修改受保護的審核欄位，被拒絕，改不動。
保護模式確認為「限制」而非「警告」。當時判定通過。

#### 發現假通過（2026-09-15）

準備 P7 時清查 `Track 1_history` 的保護範圍，發現**只有 Q（`current_fingerprint`）
與 R（`reject_reason`）兩欄真正受保護**。其餘設定並未生效。
第一次測試所用的儲存格應為 Q 或 R，恰好是唯二設定成功的兩欄。

以 B 帳號逐格行為測試五格：

| 格 | 欄位 | 類別 | 預期 | 實際 |
|---|---|---|---|---|
| A1 | 標題列 | 丙 | 擋 | **可改** |
| K2 | `status` | 甲 | 擋 | **可改** |
| L2 | `review_decision` | 乙 | 擋 | **可改** |
| N2 | `approved_by` | 乙 | 擋 | **可改** |
| D2 | `content` | 內容 | 可改 | 可改 |

**P2 判定推翻為假通過。**

#### 為什麼這一項比原先評估的更嚴重

同步端指紋閘門擋得住「核可後內容被改」。它擋不住「投稿者偽造一份自洽的核可」。

B 若能編輯審核欄，可以把公式算出的 `current_fingerprint` 值複製到
`review_fingerprint` 與 `approved_fingerprint`，再自填 `review_decision = Approved`
與 `approved_by`。該組核可紀錄會通過 `validateApprovalBinding` 的全部檢查。

**結論：保護範圍是阻止投稿者自我核可的唯一防線。它不是次要設定。**

#### 重驗（2026-09-15）　真通過

補設 `Track 1_history` 缺漏的三個保護範圍（`K2:K` 甲、`L2:P` 乙、`1:1` 丙）後，
以 B 帳號重測同五格：

| 格 | 欄位 | 結果 |
|---|---|---|
| A1 | 標題列 | 擋 |
| K2 | `status` | 擋 |
| L2 | `review_decision` | 擋 |
| N2 | `approved_by` | 擋 |
| D2 | `content` | 可改（反向對照通過，未過度保護） |

**P2 確認通過。** 投稿者改不動審核欄位、公式欄與標題列，改得動內容欄。分界正確。

#### 記錄粒度的實話

feature 044 的票的 AC-3 要求逐項記錄八個審核欄位的編輯嘗試，加上三次繞道嘗試
（整列複製貼上、刪整欄、改標題），共十一項。

**本次實測五格**：A1（等同「改標題」繞道）、K2、L2、N2、D2。
`review_fingerprint`、`approved_at`、`approved_fingerprint`、`reject_reason` 四欄未逐格測。
「整列複製貼上」與「刪除整欄」兩項繞道未測。

依 AC-3 原文，記錄粒度不足。行為結論（保護分界正確）由五格實測支持，
其中涵蓋甲、乙、丙三類各至少一格與內容欄反向對照。

### P3　投稿者改內容也會退回　通過

- 操作：B 修改 `Track 1_history` 列 3 的 `content`。
- 實際：`status` 轉為 `Needs review`。
- 判定：通過。

**意義**：這是 feature 040 的 AC-2。配合 P1 可得結論：**退回與操作者身分無關。**
公式只比對指紋。

**記錄缺口**：**P3 完全未查核 `approved_by`、`approved_at`、`approved_fingerprint` 三欄。**
原始記錄這一節只觀察 `status`。票內 AC-2 要求 P1 與 P3 兩次都確認三欄逐字不變，
P3 這一半的證據不存在。本節不宣稱這三欄未變。

**附帶證據（有時序保留）**：原始記錄此處寫「B 改得動內容欄、改不動審核欄」。
這句寫於發現 P2 假通過之前，當時 `Track 1_history` 的保護範圍尚未補齊。
**保護分界的有效證據是 P2 的重驗，不是這一句。**

### P4　只改審核欄位不會退回　通過

**前置修正**：P1 改過列 2 的內容後未重新核可，該列停在 `Needs review`。
先把列 2 內容還原為原值，再重新核可，才能驗 P4。

- 操作：A 在列 2 的 `reject_reason` 填入 `probe-note`。
- 實際：`status` 維持 `Approved`。
- 判定：通過。

**意義**：這是 feature 040 的 AC-5 的試算表端。
`APPROVAL_STATUS` 只在三份指紋相符時顯示 `Approved`。`status` 維持 `Approved`
即代表 `current_fingerprint` 未改變。**審核欄位不進內容指紋。**

**記錄缺口**：`current_fingerprint` 的實際值沒有逐字記錄。
票內 AC-4 要求它仍為 `2d5e569ed2dc0f0154cb54ba4035332342731265a8eff83fac03a21c72c27765`。
本次以 `status` 的行為間接證明。

### P5　拒絕流程　通過

前半：A 選取 `Track 1_history` 列 3，執行 `Review → 拒絕選取列`，原因 `probe-reject`。

| 欄位 | 結果 |
|---|---|
| `status` | `Rejected` |
| `approved_by` | 仍有值 |
| `approved_at` | 仍有值 |

後半：A 在拒絕狀態下修改列 3 的 `content`，`status` 由 `Rejected` 轉為 `Needs review`。

**記錄缺口**：`review_decision` 與 `reject_reason` 兩欄的實際值未查核。
`probe-reject` 是輸入值，不是觀察到的欄位值。票內 AC-5 要求 `reject_reason` 為 `probe-reject`，
本次未記錄該欄的實際內容。`approved_fingerprint` 同樣未查核。

**意義**：拒絕不抹除稽核紀錄。上一次核可的操作者與時間仍可追溯。
`Rejected` 也不是終點狀態。稿件一經修改就回到待審，編輯不需要人工清除拒絕標記。

### P6　trigger 能不能寫入受保護欄位　跳過，維持 `UNPROVEN`

**未執行。captain 於 2026-09-15 決定跳過。**

**跳過的理由**：兩種結果的結論相同。trigger 可以被停用、可以失敗、授權可以過期。
因此不論它能不能寫入受保護欄位，都不得取代 `scripts/sync-content.mjs` 的同步端指紋閘門。
執行這一步的唯一產出，是把設計文件的問號換成一句事實記錄。它不改變任何決定。

**本 probe 的所有結論都不依賴 trigger 路徑。** feature 040 的設計自始就不依賴它。

**這一項的結論仍然成立且未放寬**：trigger 只能當加速提示，
不取代 `scripts/sync-content.mjs` 的同步端指紋閘門。
`docs/content-pipeline/design.md` 與 `operations.md` 不因本 probe 放寬同步端檢查。

**補做路徑**（全部前置已保留）：

1. 測試表保留不刪。
2. `~/Documents/probe-csv/` 的三份 CSV 與兩個 Apps Script 檔保留。
3. P6 是獨立步驟。它只寫入 `reject_reason`，而唯一會被污染的 P4 已經驗畢。
4. 可單獨補跑 feature 044 的票的步驟 12，約十分鐘。
5. 補做結果以**追加補述**方式寫進本檔，不改寫原文。

### P7　非擁有者的責任編輯　通過

captain 於 2026-09-07 核准把這一項納入。

**前置修復**：清查期間 B 曾可編輯 A1、K2、L2、N2。四格已還原——
A1 改回 `id`、重跑安裝公式還原 K 欄與 Q 欄的公式、重新核可還原 L 至 P 欄的核可紀錄。

把 B 加入乙類的兩個保護範圍（`L2:P`、`R2:R`）。甲、丙維持只有 A。以 B 測試：

| | 動作 | 結果 |
|---|---|---|
| a | 在 `R2`（`reject_reason`，乙類）填字 | 成功 |
| b | 改 `K2`（`status`）或 `Q2`（`current_fingerprint`，甲類） | 被擋 |
| c | 選列 2 → `Review → 核可選取列` | 成功，`approved_by` 顯示 B |

**意義**：feature 050 的步驟 6 把保護分成「只有 captain 可改的公式欄」與
「只有責任編輯可改的審核欄」兩類。**這個分法成立。**
責任編輯不必是試算表擁有者，就能正常執行核可，而且觸不到公式欄。

**附帶結論**：`無法取得核可者身分。` 未出現。
**責任編輯首次使用 `Review` 選單不需要額外授權 Apps Script。**

---

## 過程發現

這三項不屬於任何命題，但會影響 feature 050 的操作手冊。

### 一、`status` 欄擋不住擁有者（設計預期，不是缺陷）

A 可以手動編輯 `status` 欄。Google 試算表的保護範圍無法排除擁有者。這是平台限制。

**feature 040 的設計不依賴 `status`。** 查 `scripts/sync-content.mjs` 的
`validateApprovalBinding`：`status` 只決定「這一列要不要檢查」。
真正的閘門是 `review_decision === 'Approved'`，加上三份指紋與同步端重算值逐字相符。

| 手動操作 | 同步程式反應 |
|---|---|
| 手打 `status = Approved`，未真正核可 | 擋下：`核可紀錄缺少 review_decision。` |
| 手打 `status` 且偽造 `review_decision` | 擋下：`review_fingerprint 與目前發布內容不符。` |

**這張表的依據是閱讀 `validateApprovalBinding` 的程式碼，不是實跑同步。**
本 probe 全程不執行 `npm run sync-content`，不設定測試表的 CSV URL。

**操作風險**：手動編輯 `status` 會覆蓋該格公式。該列狀態自此不再自動更新，
必須重跑「安裝／更新公式」還原。
**feature 050 的操作手冊要明訂：不要手動編輯 `status` 欄。**

### 二、未授權的編輯者執行核可會靜默失敗

執行 P5 時誤以 B 帳號操作。`Review → 拒絕選取列` 完全沒有作用，畫面無任何欄位變動。

原因是拒絕動作要寫入 `review_decision`、`reject_reason` 等受保護的審核欄。
B 當時不在該範圍的允許名單內，寫入被拒。

行為正確。投稿者本來就不該能拒絕稿件。
**問題在失敗是靜默的**：沒有錯誤訊息，容易被誤判成「功能壞了」。

**feature 050 的操作手冊要寫**：責任編輯若發現核可選單「沒反應」，
先確認自己在審核欄的允許名單內。

### 三、`Review` 選單的中文說明標題可以通過

見「環境建立」的 Apps Script 安裝一節。

---

## Apps Script 執行紀錄

**execution ID 未記錄。現行 Apps Script 介面不提供該欄位。**

「執行項目」的欄位只有：部署、函式、類型、開始時間、持續時間、狀態。

| 操作 | 函式 | 開始時間 | 狀態 |
|---|---|---|---|
| 安裝公式 `Track 1_history` | `installApprovalFormulas` | 未記錄 | 成功 |
| 安裝公式 `Track 2_discussion` | `installApprovalFormulas` | 未記錄 | 成功 |
| 安裝公式 `site_tldr` | `installApprovalFormulas` | 未記錄 | 成功 |
| 核可七列（三次） | 未記錄 | 未記錄 | 成功 |

**替代證據**：「指紋核對」一節的七格比對。
它證明測試表上執行的程式就是 repo 的 `approval-workflow.gs`。

**這項替代證據比 execution ID 強**。execution ID 只證明「有跑過」，
不證明「跑的是哪一版」。指紋對照兩者都證明。

---

## 收尾

| 項目 | 狀態 |
|---|---|
| `probe-trigger.gs` 與其觸發條件 | **未建立**（P6 跳過），因此無須刪除 |
| B 的權限 | 已從乙類保護範圍的允許名單移除，還原為原本設定 |
| 測試表 | **保留**（captain 2026-09-15 決定），供日後補做 P6 |
| 測試資料 | 只存在於隔離測試表。未進入 `src/data/*.json`，未複製到正式表 |

`probe-h1`、`probe content A` 這類值屬於 `AGENTS.md` 第 3 條的佔位資料，不得發布。

---

## 結論與對 feature 050 的影響

### 命題總表

| 命題 | 內容 | 結果 | 對應 |
|---|---|---|---|
| P1 | 責任編輯自己改內容也會退回 | 通過 | feature 040 的 AC-4 |
| P2 | 投稿者不能編輯審核欄位 | 通過（重驗；首次為假通過） | feature 040 的 AC-4 |
| P3 | 投稿者改內容也會退回 | 通過 | feature 040 的 AC-2 |
| P4 | 只改審核欄位不會退回 | 通過 | feature 040 的 AC-5 |
| P5 | 拒絕流程可用且保留稽核紀錄 | 通過 | — |
| P6 | trigger 能否寫入受保護欄位 | 跳過，維持 `UNPROVEN` | — |
| P7 | 非擁有者的責任編輯 | 通過 | feature 050 的步驟 6 |

**feature 040 在 verify cycle 1 被判 REJECTED 的 AC-2 與 AC-4，
所需的試算表端證據已經齊備。**

**但有一項限制，040 的 gate 必須知道**：齊備的是 `status` 重算的行為證據。
`approved_*` 三欄「逐字不變」的證據**不齊**——P1 只查核 `approved_by` 與 `approved_at` 兩欄，
P3 完全未查核。040 的 gate 若要求該項，需另行補測。

### 要交給 feature 050 的兩項結論

**一、保護範圍必須以非擁有者帳號逐格實測驗收。不得以設定畫面為準。**

本次漏設發生在七列、三分頁、由 captain 親手設定的測試表上。
清查時 `Track 1_history` 只有 Q、R 兩欄真正受保護，其餘設定看起來正確但未生效。
正式表是 59 列，而且已開放多位協作者。

feature 050 的步驟 6 必須改成：

1. **以行為驗收，不以設定畫面驗收。** 逐格用非擁有者帳號實測。
2. **提供逐欄檢查表**，不用「設三類保護」這種概括指示。
3. 把「B 可改內容欄」列為反向對照，確認未過度保護。

**二、責任編輯首次使用 `Review` 選單不需要額外授權 Apps Script。
feature 050 的步驟 4 不需要補充授權說明。**

依據是 P7 的第 c 項：B 以非擁有者身分執行 `Review → 核可選取列` 成功，
`無法取得核可者身分。` 未出現。

### 兩項要寫進 feature 050 操作手冊的操作規則

1. 不要手動編輯 `status` 欄。手改會覆蓋公式，該列狀態自此不再自動更新。
2. 核可選單「沒反應」時，先確認自己在審核欄保護範圍的允許名單內。失敗是靜默的。

### 本 probe 不能證明什麼

| 不能證明 | 為什麼 |
|---|---|
| 正式表的權限設定正確 | 測試表是新建的空表，共用名單只有兩人 |
| 正式表的標題列能通過 | 正式表已知兩處不符。那是 feature 050 步驟 1-3 的工作 |
| 同步端會擋住舊核可 | 那由 feature 040 的 `tests/approval-content-version-binding.test.mjs` 證明 |
| 59 列重新核可不會出錯 | 測試表只有七列 |
| trigger 可以取代同步端閘門 | P6 跳過。不論結果如何，結論都是不可取代 |
