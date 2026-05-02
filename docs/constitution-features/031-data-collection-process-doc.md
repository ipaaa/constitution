---
id: "031"
title: T1/T2/T3 資料收集流程說明文件
status: design
source: captain-filed
started: 2026-05-02T17:52:29Z
completed:
verdict:
score: 0.7
worktree:
issue:
pr:
---

建立一份說明文件，記錄三個軌道的資料收集、更新、驗證流程：

- T1（時光機）：釋憲案資料來源、CSV 同步機制、更新頻率
- T2（熱搜榜）：discussions.json 的內容策展流程、新文章如何加入、反方意見填充流程
- T3（未來）：待審案件資料來源（cons.judicial.gov.tw）、大法官名單維護、CRISIS_STATS 更新時機

每個軌道需說明：
1. 資料來源是什麼
2. 誰負責更新
3. 更新頻率
4. 更新步驟（SOP）
5. 驗證方式（verify 流程 or 人工確認）
6. 已知限制與風險

## T3 每月更新 SOP（已確認）

### 資料來源
- 司法院憲法法庭網站 cons.judicial.gov.tw 每月發布月報
- 月報包含：新收案件、已結案件、統計數字

### 更新步驟

1. **上 cons.judicial.gov.tw 看最新月報** → 找新收案件、已結案件、統計數字
2. **開 Claude Code** → `claude --agent spacedock:first-officer`
3. **跟 FO 說「更新 T3 案件資料」** → FO 開 feature、dispatch ensign 更新、跑 verify、推 PR
4. **Vercel 自動部署**

### 具體要改的檔案

| 檔案 | 改什麼 |
|------|--------|
| `src/data/future.ts` | `REFERENCE_DATE` 改成更新日期 |
| | `RAW_CASES` 加新案件 / 移除已結案 |
| | `totalPending` 更新總數 |
| | `CRISIS_STATS` 如有大法官異動就更新 |

### Captain 需要做的

1. **看月報** — 記下新案件案號和已結案件
2. **告訴 FO** — 例如「新增 113憲民XXX，移除 112憲民YYY（已判決）」
3. **FO 改 code** — ensign 更新 + verify 確認案號/日期
4. **確認 preview** — 看一下資料對不對
5. **merge PR**

### 預估時間
整個流程約 10-15 分鐘。

### 更新頻率
- 常規：每月月報發布後
- 緊急：有重大判決或大法官異動時即時更新
