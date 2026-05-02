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

**⏸️ PENDING — 由 Captain 補完**
- T1/T2 的 SOP 需要修改：加入 Google Spreadsheet 作為 SSOT 的編輯流程
- 目前的 SOP 只描述 JSON 檔案的直接編輯，但實際流程應以 spreadsheet 為起點

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

## T1 憲法課本時光機 資料收集 SOP

### 資料來源
- 司法院大法官釋字、憲法法庭裁判（cons.judicial.gov.tw）
- 學術文獻、新聞報導、法學教科書（用於撰寫敘事文字）
- Unsplash（背景圖片）

### 資料結構

檔案：`src/data/history.json`（JSON 陣列）

| 欄位 | 說明 |
|------|------|
| `id` | 唯一識別碼，格式 `h{數字}` |
| `category` | 分類標籤（如「言論自由」「性別平等」「權力分立」） |
| `textbook.chapter` | 課本章節名或年份 |
| `textbook.content` | 釋字號碼或法條引述 |
| `textbook.handwriting` | 手寫風格一句話重點 |
| `reality.year` | 判決年份（**必須是純數字字串如 `"2024"`**） |
| `reality.title` | 白話標題（問句形式） |
| `reality.ruling` | 判決意旨白話翻譯 |
| `reality.ruling_id` | 釋字/憲判字編號（可為空字串） |
| `reality.bgImage` | Unsplash 背景圖 URL（可為空字串） |

### 更新步驟

1. **Captain 決定收錄哪個釋憲案** — 記下案號、年份、核心爭點
2. **準備內容** — 撰寫以下欄位：
   - `category`：從既有分類中選擇（如「言論自由」「性別平等」），盡量沿用
   - `textbook` 三欄位：用課本語氣寫，`chapter` 填章節名或年份，`content` 填釋字號，`handwriting` 填一句話摘要
   - `reality` 五欄位：`year` 填純數字年份，`title` 用吸引人的問句，`ruling` 寫白話判決意旨，`ruling_id` 填案號，`bgImage` 找 Unsplash 圖片 URL
3. **告訴 FO** — 例如「新增 T1 釋憲案：釋字第 XXX 號」
4. **Ensign 編輯 `src/data/history.json`** — 新增條目到陣列中，`id` 遞增（查看現有最大數字 +1）
5. **本機驗證** — `npm run dev`，確認新條目出現在正確的年代區塊
6. **推 PR → preview 確認 → merge**
7. **Vercel 自動部署**

### 誰負責
- **Captain**：決定收錄哪些釋憲案、撰寫或審核敘事文字
- **FO / Ensign**：執行 JSON 修改、確認格式正確

### 更新頻率
- 不定期：有值得收錄的重大憲法裁判時新增
- T1 是歷史資料，無固定排程

### 驗證方式
- `npm run build` — TypeScript 編譯檢查型別推導
- 開發伺服器人工確認 — 新條目是否在正確年代區塊、文字正確、背景圖載入
- 搜尋測試 — 在頁面搜尋欄輸入案號或關鍵字，確認可被搜尋到

### 已知限制
- `reality.year` 必須是純數字年份字串，否則 `decadeOf()` 回傳 NaN 導致條目不顯示（歷史條目 h15-h29 有此問題）
- `bgImage` 使用外部 Unsplash URL，圖片可能被移除
- JSON 手動維護無 schema 驗證，容易因格式錯誤導致解析失敗
- 沒有防止重複 `id` 的機制
- `category` 無固定枚舉，可能出現同義不同名的分類

### 預估時間
每新增一筆約 15-20 分鐘（含撰寫敘事文字）。

---

## T2 憲庭熱搜榜 資料收集 SOP

### 資料來源
- 學者文章（Scholar Articles）：法學期刊、Facebook 貼文、報導者、換日線等
- NGO 報告（NGO Reports）：民間司改會、鏡週刊專欄等
- 影片（Reels）：YouTube 短影片（法律白話文運動等法普頻道）
- 官方懶人包（Official TL;DR）：編輯團隊自行撰寫

### 資料結構

檔案：`src/data/discussions.json`（JSON 陣列）

| 欄位 | 說明 |
|------|------|
| `id` | 唯一識別碼（如 `d1`、`tldr`） |
| `category` | **必須是以下四種之一**：`"Scholar Articles"` / `"NGO Reports"` / `"Reels"` / `"Official TL;DR"` |
| `title` | 文章/影片標題 |
| `author` | 作者名稱 |
| `year` | 發表日期（建議格式 `"2026.1.14"`） |
| `abstract` | 摘要文字（TL;DR 支援 `**粗體**` 和 `\n` 換行） |
| `link` | 原文連結 URL |
| `owl_comment` | 貓頭鷹法官的編輯評語（可為空字串） |
| `vibe` | 氣氛標籤（如 `"🔥 公民必讀"` `"📖 深度解析"` `"🌍 國際視角"`） |
| `sticky` | 是否置頂（`true` / `false`） |
| `views` | 觀看次數（僅 Reels 使用，選填） |
| `opposing_views` | 反方觀點陣列（選填，見下方） |

**反方觀點（`opposing_views`）欄位：**
- `id`：識別碼（格式 `ov-{文章id}-{序號}`）
- `stanceLabel`：立場標籤
- `summary`：簡短摘要
- `fullArgument`：完整論述（選填）
- `source`：`{ author, affiliation, year }`
- `editorialNote`：編輯團隊回應
- `editorialSources`：引用來源陣列 `[{ label, url }]`

### 更新步驟

1. **Captain 發現值得收錄的文章/影片** — 記下連結、標題、作者、日期
2. **決定分類** — Scholar Articles / NGO Reports / Reels（拼字必須完全一致，否則不會顯示）
3. **撰寫 owl_comment** — 用貓頭鷹法官的口吻寫白話評語（用引號包起來）
4. **選擇 vibe 標籤** — 從既有標籤選（`🔥 公民必讀`、`📖 深度解析`、`🌍 國際視角`、`💬 正反交鋒`、`📣 懶人入門`、`🎯 精準短評`、`💡 腦袋升級`、`🔭 他山之石`、`🔥 戰火猛烈`）
5. **決定是否置頂** — `sticky: true` 會排在該分類最前面
6. **告訴 FO** — 例如「新增 T2 學者文章：XXX by YYY」
7. **Ensign 編輯 `src/data/discussions.json`** — 新增條目，`id` 用 `d{下一個數字}`
8. **如需反方觀點** — 一併準備 `opposing_views` 資料，確保有 `editorialNote` 回應
9. **本機驗證** — `npm run dev`，確認卡片出現在正確分類區塊
10. **點擊 `link` 確認連結有效**
11. **推 PR → preview 確認 → merge**
12. **Vercel 自動部署**

### 誰負責
- **Captain**：發現文章、決定是否收錄、撰寫 owl_comment 和 vibe
- **FO / Ensign**：執行 JSON 修改、確認連結有效

### 更新頻率
- 事件驅動：有新的重要評論、文章、影片發表時即時加入
- 建議每 1-2 週檢查是否有遺漏的重要討論

### 驗證方式
- `npm run build` — TypeScript 編譯檢查
- 連結有效性 — 手動點擊 `link` 確認原文可訪問
- 分類檢查 — `category` 必須是四種之一（拼字錯誤 = 不顯示）
- 開發伺服器人工確認 — 卡片渲染正常、摘要不截斷
- 搜尋測試 — 輸入標題或作者確認可被搜尋到

### 已知限制
- `year` 格式不統一（`2026.1.14` / `2026` / 空字串），排序用字串比較可能有非預期結果
- 外部連結可能失效（Facebook 貼文尤其容易被刪或設為私人）
- 部分 `abstract` 是佔位文字（「快速了解最新判決的5個重點...」），尚未填入真正摘要
- TL;DR 條目（`id: "tldr"`）的 `abstract` 目前是測試用文字
- `opposing_views` 的 `source` 部分使用匿名佔位符（「某學者」「某法官」）
- 沒有自動化的連結健康檢查機制

### 預估時間
每新增一篇約 10 分鐘（含撰寫 owl_comment）。有反方觀點時加 15-20 分鐘。

---

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

## Stage Report

### Design decisions

1. **Document placement**: `docs/data-collection-guide.md` — lives alongside other project docs, not inside `src/`
2. **Structure**: Each track covers 7 dimensions: data sources, data structure (with field-level detail), who updates, update frequency, SOP steps, verification methods, and known limitations
3. **Cross-track section**: Added a shared section covering common patterns (all manual curation, FO/Ensign workflow, Vercel auto-deploy) and shared risks (link rot, JSON format errors, single-point-of-failure on Captain)

### Findings from code review

- **T1** (`history.json`): 21 entries. Some early entries (h15-h29) have `reality.year` storing legal text instead of year numbers — these get filtered out by `decadeOf()` returning NaN. The `textbook.chapter` field doubles as year indicator for these entries.
- **T2** (`discussions.json`): 17 entries across 4 categories. Several `abstract` fields contain placeholder text ("快速了解最新判決的5個重點..."). The TL;DR entry has test content. `opposing_views` uses anonymous placeholders ("某學者").
- **T3** (`future.ts`): 40 curated cases out of 473+ total. Well-structured TypeScript with derived computations (`daysPending`, `CRISIS_STATS`). The `IdentityTag` system requires triple-sync (type + array + color map). Existing SOP in entity file was already solid — expanded with field-level detail.

### Checklist

- [x] T1 data collection process documented
- [x] T2 data collection process documented
- [x] T3 data collection process documented (expanded existing SOP with field-level structure details)
- [x] Cross-track concerns (shared patterns, common risks table)
- [x] Document structure and placement decided (`docs/data-collection-guide.md`)
