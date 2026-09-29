---
id: 043
title: 「待captain確認脈絡」大量刪列時同步不出聲，靜默少掉內容
status: design
source: captain 2026-09-03（先開票存證，脈絡待確認後再決定是否進行）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

> ## ⛔ 先不要 dispatch
>
> **captain 於 2026-09-03 表示尚未完全掌握脈絡。本票先開起來存證，不代表已決定要做。**
> 進入 `design` 之前，必須由 captain 重新確認範圍與是否進行。
> 任何 FO 或 worker 看到本票，請先問過 captain。

試算表被刪掉大量資料列時，同步程式照常寫出檔案並回報成功。網站內容因此靜默減少。

## Problem

`scripts/sync-content.mjs:415-424` 的 `checkNotEmptyAfterApproval` 只在**通過核可的列為 0 筆**時才中止。

因此：40 筆已核可的歷史資料被刪到剩 1 筆時，程式輸出

```
✅ 檢查通過，已寫入 src/data/history.json（1 筆）
```

退出碼 0。內容減少 97.5%，系統回報成功。

**這違反 `docs/content-pipeline/design.md:412` 的不變式 #3**（檢查失敗即中止，不可部分寫入）。現行程式只擋住了極端值，中間地帶完全放行。

**為什麼現在要處理**：captain 已於 2026-09-03 開放試算表編輯權限。多人捲動四十列的表格時，選錯列按刪除是常見失誤。

**feature 040 不涵蓋本項。** 040 比對的是「某一列的內容有沒有被改過」。被刪掉的列不會出現在 CSV 裡，沒有指紋可以比對。

**目前唯一能發現的方式是 PR diff。** 那依賴人每次都看仔細，且看的是逐行差異，不是總量變化。

## Proposed approach

**待確認。** 以下為初步方向，captain 確認脈絡後才定案。

在既有的驗證層加一條「總量跌幅」檢查：本次通過核可的列數，與上一次寫出的產物筆數相比，跌幅超過門檻即中止，不寫任何檔案。

**待 captain 決定的三件事**：

1. **門檻設多少。** 初步建議兩成。太鬆擋不住誤刪，太緊會在正常下架內容時誤擋。
2. **基準取自哪裡。** 讀現有的 `src/data/*.json` 筆數最直接，不需新增狀態檔。但若產物被手動改過，基準就不可信。
3. **合法大量下架時怎麼放行。** 需要一個明確的覆寫方式，例如環境變數或旗標。沒有覆寫方式，這道檢查遲早會被整條關掉。

第 3 點最容易被忽略。一道無法暫時繞過的檢查，最後會以「先註解掉」的方式被永久移除。

## Risk evidence

未執行 spike。**本票暫緩，脈絡確認前不投入驗證工作。**

已確認的事實：`checkNotEmptyAfterApproval` 的觸發條件為通過核可列數等於 0（`scripts/sync-content.mjs:415-424`）。同步程式無任何比較前後筆數的邏輯。

## Expected surface and tolerance

Estimate: 待確認方向後估算。
Semantics this may change: 同步的放行條件與退出碼。不改網站資料 shape。

## Acceptance criteria

**待 captain 確認脈絡與方向後補齊。** 現階段只記錄驗收必須涵蓋的性質：

- 通過核可的列數大幅減少時，同步以非零退出碼中止，且 `src/data/*.json` 的 sha256 不變。
- 正常的小幅增減不得被誤擋。
- 覆寫機制存在且必須明確指定，不可為預設行為。

## Test plan

待確認。

## Documentation impact

### 現在更新

| 文件 | 為什麼現在要改 | 更新內容 |
|---|---|---|
| `docs/health-check/TODO.md` | 本缺口未列於任何既有項目 | 新增一項，記錄缺口與待決事項。**本項待 captain 確認後才執行** |

### 實作後更新

| 文件 | 完成條件 | 更新內容 |
|---|---|---|
| `docs/content-pipeline/design.md` | 跌幅檢查通過驗證 | 於第四節記錄檢查規則與覆寫方式 |

### 不更新

| 文件 | 理由 |
|---|---|
| `docs/health-check/2026-08-31-content-pipeline.md` | 狀態為 record |
| `docs/health-check/2026-09-03-editor-onboarding.md` | 狀態為 record |

### Feedback Cycles

## Out of scope

不處理內容淨化，該項另行開票。不處理 feature 040。不處理個別列的內容變動偵測。
