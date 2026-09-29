# 內容產線操作手冊

**狀態**：evergreen
**最後查核**：2026-09-29（feature 050 部署後逐處查證）
**適用範圍**：repo 內已實作的版本綁定流程。正式 SSOT 尚未部署。

> ⚠️ **2026-09-29 補述：上一行「正式 SSOT 尚未部署」已不成立。**
> 正式 SSOT 已於 2026-09-29 套用八個審核欄位、公式、Apps Script 與 12 個保護範圍（feature 050 部署窗口 S1–S9）。
> 見下方〈正式 SSOT 部署〉。原句保留。

## 安全邊界

- 不要在部署或 `npm run build` 中執行同步。
- 不要手改 `src/data/*.json`。
- 不要把正式 SSOT URL 或帳號 email 寫進 repo。
- 兩帳號隔離 probe 完成前，不要把 Apps Script 套到正式 SSOT。
- 不要批次替舊列補造指紋。部署後要逐列重新核可。

> ⚠️ **2026-09-29 補述：上面第 4 點（兩帳號 probe 的但書）的前提已解除。**
> 兩帳號隔離 probe 已於 2026-09-21 完成（feature 044，`verdict: PASSED`）。
> Apps Script 已於 2026-09-29 套到正式 SSOT。原句保留。
> 查證：`grep -m2 -E '^(status|verdict):' docs/constitution-features/_archive/044-approval-permission-two-account-probe.md`。

## 隔離表部署

1. 在隔離測試表建立八個審核欄位。
2. 把 `scripts/apps-script/approval-workflow.gs` 與 `appsscript.json` 加入綁定式 Apps Script 專案。
3. 重新載入試算表，開啟 `Review` 選單。
4. 在三個發布分頁執行「安裝／更新公式」。
5. 保護 `status`、`current_fingerprint` 與其餘審核欄位。
6. 只讓責任編輯可修改審核欄位。

八個欄位是 `status`、`review_decision`、`review_fingerprint`、`approved_by`、
`approved_at`、`approved_fingerprint`、`current_fingerprint` 與 `reject_reason`。

## 正式 SSOT 部署

**已完成**：2026-09-29，feature 050 部署窗口 S1–S9。完整 runbook、實測證據與逐步驗收見
[`../constitution-features/050-ssot-approval-deployment.md`](../constitution-features/050-ssot-approval-deployment.md)。
本節只收編日後會再用到的規則。

### 欄位位置（2026-09-29 讀取發布版 CSV 標題列，歷史讀數）

| 分頁 | 欄數 | 審核欄位與 `chapter` 的位置 |
|---|---|---|
| `Track 1_history` | 18 | `J` `status`、`K` `chapter`、`L`–`Q` 六個審核欄、`R` `current_fingerprint` |
| `Track 2_discussion` | 21 | `I` `status`、`M` `owl_depth_comment`、`N` `full_content`、`O`–`T` 六個審核欄、`U` `current_fingerprint` |
| `site_tldr` | 12 | `D` `status`、`F`–`K` 六個審核欄、`L` `current_fingerprint` |

要看現況，讀發布版 CSV 的第一列。不要引用上表的欄號當現況。

### 保護範圍（12 個）

| 分頁 | A 類：公式欄（只有 captain） | B 類：審核欄（只有責任編輯） | C 類：標題列（只有 captain） |
|---|---|---|---|
| `Track 1_history` | `J2:J`、`R2:R` | `L2:Q` | `A1:R1` |
| `Track 2_discussion` | `I2:I`、`U2:U` | `O2:T` | `A1:U1` |
| `site_tldr` | `D2:D`、`L2:L` | `F2:K` | `A1:L1` |

- 12 個範圍都選「限制可編輯此範圍的使用者」。不可選「編輯這個範圍時顯示警告」。
- B 類選「自訂」並只勾責任編輯。選「只有你」會擋住 `Review` 選單。
- **Google 試算表把開放範圍存成 1000 列。** 例如 `R2:R` 會存成 `R2:R1000`。
  第 1001 列之後不受保護。任一分頁資料列接近 1000 列時，重設範圍的結束列。
- 驗收看行為，不看設定畫面。用不在任何允許名單內的帳號逐格試改，再用責任編輯帳號試改 B 類。
  擁有者不受保護範圍限制，擁有者自己測不出任何東西。

### 新增欄位或分頁時的順序

1. 在試算表建欄。新欄一律先留白。
2. 確認分頁名稱逐字為 `Track 1_history`、`Track 2_discussion`、`site_tldr`。
3. 執行 `Review → 安裝／更新公式`，確認公式生效。
4. 設定或調整保護範圍，並做行為驗收。
5. 逐列重新核可。不要批次補造指紋。
6. 以不落地方式驗證同步：`CONTENT_OUTPUT_DIR` 指向暫存目錄，再比對 sha256 與 `id` 清單。
7. 通過後才做實際同步與 PR。

**順序不可反。** 程式要求的欄位比試算表多時，同步整份中止。

## 核可與拒絕

核可時，選取完整資料列，再執行 `Review → 核可選取列`。
程式會鎖定文件、保存目前指紋、核可者與 UTC 時間。
程式在寫入後重新讀取指紋。內容同時被修改時，程式會復原整批審核欄位。

拒絕時，執行 `Review → 拒絕選取列`，並輸入退回原因。
拒絕會更新最後審核決定與指紋，但保留最近一次 `approved_*` 稽核紀錄。

發布欄位一旦修改，公式會顯示 `Needs review`。
只改審核欄位不會改變內容指紋。

## 同步

先完成隔離 probe 與正式 SSOT 部署，再設定三個 CSV URL。
正式同步仍要由人明確發起，並在專用分支執行：

```bash
npm run sync-content
git diff -- src/data/history.json src/data/discussions.json
```

> ⚠️ **2026-09-29 補述：上面「先完成隔離 probe 與正式 SSOT 部署，再設定三個 CSV URL」的前提已成立。**
> probe 已完成（feature 044），正式 SSOT 已部署（feature 050），三個 CSV URL 已設在 `.env.local`。
> 2026-09-29 已在 main 實際同步一次：exit 0，40 筆與 16 筆，`src/data/` 無 diff。原句保留。
>
> **已知暫時性失敗**：發布版 CSV 的部分快取會回傳計算中的 `status`，
> 同步印出多行 `實際為「載入中…」` 並中止，不寫入任何檔案。內容本身沒有錯。
> 稍後重跑即可。追蹤票：[`../constitution-features/sync-csv-loading-snapshot.md`](../constitution-features/sync-csv-loading-snapshot.md)。

同步只接受完整的 `Approved` 紀錄。
Node 會重算指紋，並比對 `review_fingerprint`、`approved_fingerprint` 與
`current_fingerprint`。任一狀態、決定、核可者、時間或指紋不符時，兩個 JSON 都不寫。

通過後開 PR。讓編輯台檢查 JSON diff 與預覽網址。不要直接提交到 `main`。

## 錯誤與復原

- `缺少必要欄位`：補齊八個審核欄位，再重新安裝公式。
- `與目前發布內容不符`：確認內容後重新核可。不要手改指紋。
- `approved_at 必須是 ISO 8601 UTC`：用 Review 選單重新核可。
- `無法計算內容指紋`：先修正 `views`、`order` 或 `sticky` 的欄位錯誤。
- Apps Script 顯示審核期間內容變更：重新讀取內容，再重做整批核可。

同步失敗時先修正 SSOT。不要手改輸出 JSON 繞過檢查。

## 驗證

不接觸 SSOT 的本機驗證：

```bash
node --test tests/approval-content-version-binding.test.mjs
npx tsc --noEmit
npm run build
```

兩帳號 probe 仍須在隔離表執行。證據要記錄測試表 ID 雜湊、UTC 時間、兩個角色、
步驟、結果與 Apps Script execution ID。不要記錄 email 或正式 SSOT URL。

**補述（2026-09-04）**：兩帳號 probe 由 feature `044-approval-permission-two-account-probe` 承接，
不在 feature 040 範圍內。probe 尚未執行。

> ⚠️ **2026-09-29 補述：上一句「probe 尚未執行」已不成立。**
> feature 044 已於 2026-09-21 完成兩帳號 probe，`verdict: PASSED`。
> 正式 SSOT 的行為驗收另於 2026-09-29 在正式表上執行（feature 050 的 S7-b 與 S7-d）。原句保留。
