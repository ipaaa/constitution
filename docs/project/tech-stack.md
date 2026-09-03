# 技術架構與資料流

**狀態**：evergreen
**最後查核**：2026-09-03

## 網站技術

- 框架：Next.js App Router。
- 語言：TypeScript。
- UI：React 19 與 Tailwind CSS 4。
- 部署：Vercel 靜態與伺服器端建置產物。

網站不使用獨立 Backend API 或關聯式資料庫。
頁面直接讀取 repo 內的靜態 JSON。

## 內容資料流

Google 試算表 `SSOT_收集區` 是 Track 1、Track 2 與 `site_tldr` 的唯一真相。
`src/data/history.json` 與 `src/data/discussions.json` 是同步產物。不要手改。

```text
Google Sheet SSOT
  → 公式計算 current_fingerprint 與 status
  → Review 選單保存核可決定與內容指紋
  → scripts/sync-content.mjs 手動抓取三份 CSV
  → Node 重算 fingerprint-v1 並驗證完整核可紀錄
  → src/data/*.json
  → PR diff 與 Vercel 預覽
  → 合併後部署
```

`scripts/content-fingerprint.mjs` 固定發布欄位與正規化規格。
`scripts/apps-script/approval-workflow.gs` 提供對應的試算表公式與審核操作。
`scripts/sync-content.mjs` 只接受與目前內容相符的完整核可紀錄。

同步失敗時不更新任何 JSON。部署不執行同步。
`npm run build` 只執行 Next.js build。

## 部署邊界

repo 已實作核可版本綁定。正式 SSOT 尚未套用。
兩帳號隔離 probe 完成前，不得部署 Apps Script 到正式 SSOT。
受保護欄位的 trigger 寫入能力尚未證明。現行機制不依賴 trigger。

完整規格見 [`../content-pipeline/design.md`](../content-pipeline/design.md)。
操作步驟見 [`../content-pipeline/operations.md`](../content-pipeline/operations.md)。
