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

> ⚠️ **2026-09-29 補述：上面前兩句已不成立。**
> 正式 SSOT 已於 2026-09-29 套用核可版本綁定（feature 050 部署窗口 S1–S9）。
> 兩帳號隔離 probe 已於 2026-09-21 完成（feature 044，`verdict: PASSED`）。
> 證據見 [`../content-pipeline/design.md`](../content-pipeline/design.md) 修訂紀錄「2026-09-29 — 正式 SSOT 已套用核可版本綁定（feature 050）」。
> 第三句（trigger 寫入能力）本補述未查證，維持原樣。原句保留。

完整規格見 [`../content-pipeline/design.md`](../content-pipeline/design.md)。
操作步驟見 [`../content-pipeline/operations.md`](../content-pipeline/operations.md)。


---

## 📎 補述（2026-09-21）：第二支人工執行的外部資料抓取程式

> 2026-09-29 合併註記：本則補述寫於 feature 040 改寫本文之前。
> 文中「上面『資料流動路徑』第 1 點」與「檔頭的警告」指改寫前的舊版，
> 已由 feature 040 移除，可於 git 歷史查閱。補述原文保留。

上面「資料流動路徑」第 1 點說的 Python 爬蟲不存在，這點檔頭的警告已經講了。
以下補記實際存在的抓取程式，共兩支，**都不進 `npm run build`**。

| 程式 | 抓什麼 | 寫到哪 | 何時執行 |
|---|---|---|---|
| `scripts/sync-content.mjs` | Google 試算表 SSOT | `src/data/discussions.json`、`src/data/history.json` | 人工執行 `npm run sync-content`，跑完必須開 PR 讓 captain 對 diff |
| `scripts/fetch-interpretation-counts.mjs` | `cons.judicial.gov.tw` 的釋字與憲判字清單 | `tests/fixtures/interpretation-dates.json` | 人工執行，只在需要重新核對計數時跑 |

`fetch-interpretation-counts.mjs` 的三條界線：

1. **不進 `build`。** `package.json` 的 `build` 仍然只有 `next build`。
2. **不碰 `src/data/*.json`。** 它只寫 `tests/fixtures/`。
   網站實際讀的是手寫的 `src/data/threshold-analysis.ts`，那支程式不會改它。
3. **必須用 Node 的 `fetch` 或 `curl` 寫，不可用 Python。**
   `cons.judicial.gov.tw` 的 TLS 憑證缺少 Subject Key Identifier 擴充欄位，
   Python 的 `urllib` 會以 `CERTIFICATE_VERIFY_FAILED` 拒絕連線。
   這不是某台機器的設定問題，任何用 OpenSSL 預設信任鏈的機器都會失敗。

重新抓取的結果可用 `THRESHOLD_LIVE=1 node --test tests/threshold-analysis.test.mjs` 與已提交的
fixture 比對。未設該環境變數時該測試跳過，`node --test` 不連外部網站。
