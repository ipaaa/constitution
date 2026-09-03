# 內容產線操作手冊

**狀態**：evergreen
**最後查核**：2026-09-03
**適用範圍**：repo 內已實作的版本綁定流程。正式 SSOT 尚未部署。

## 安全邊界

- 不要在部署或 `npm run build` 中執行同步。
- 不要手改 `src/data/*.json`。
- 不要把正式 SSOT URL 或帳號 email 寫進 repo。
- 兩帳號隔離 probe 完成前，不要把 Apps Script 套到正式 SSOT。
- 不要批次替舊列補造指紋。部署後要逐列重新核可。

## 隔離表部署

1. 在隔離測試表建立八個審核欄位。
2. 把 `scripts/apps-script/approval-workflow.gs` 與 `appsscript.json` 加入綁定式 Apps Script 專案。
3. 重新載入試算表，開啟 `Review` 選單。
4. 在三個發布分頁執行「安裝／更新公式」。
5. 保護 `status`、`current_fingerprint` 與其餘審核欄位。
6. 只讓責任編輯可修改審核欄位。

八個欄位是 `status`、`review_decision`、`review_fingerprint`、`approved_by`、
`approved_at`、`approved_fingerprint`、`current_fingerprint` 與 `reject_reason`。

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
