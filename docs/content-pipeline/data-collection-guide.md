**狀態**：evergreen（僅涵蓋 T3）
**最後查核**：2026-09-02

# 資料收集流程說明文件

本文件記錄「憲庭加好友」的資料收集、更新與驗證流程。

> **T1／T2 的流程不在本文件。** 見 [`design.md`](./design.md)。
> 原本這裡有 T1／T2 的 SOP，教人直接編輯 `src/data/*.json`。
> 那個做法已於 2026-09-01 判定錯誤並移除，見文末的變更說明。

---
## T1（時光機）與 T2（熱搜榜）

**流程見 [`design.md`](./design.md)。本文件不重複記載。**

兩軌的內容都存放在 Google 試算表 `SSOT_收集區`，經編輯台把 `status` 設為
`Approved` 之後，由同步程式產生 `src/data/history.json` 與
`src/data/discussions.json`。

⚠️ **那兩個 JSON 檔是產物，不可手改。** 手改的內容會在下次同步時消失。

⚠️ **產線改造尚未完成。** 目前同步程式仍是舊版，`design.md` 第五節的施工項目
7–10 尚未執行。在那之前不要執行 `npm run sync-content` 或 `npm run build`。

---
## T3：未來軌道（Future Track）

### 資料來源

- **主要來源**：司法院憲法法庭網站 [cons.judicial.gov.tw/docdata.aspx?fid=52](https://cons.judicial.gov.tw/docdata.aspx?fid=52)（公開書狀之案件列表 — 已受理）
- **待審案件總數**：民間司法改革基金會 / 媒體報導（TNL、UDN），交叉比對司法院統計
- **大法官資訊**：司法院公開任命資料、新聞報導
- **月報**：司法院憲法法庭每月發布之月報（新收案件、已結案件、統計數字）

### 資料結構

檔案位置：`src/data/future.ts`

#### 核心常數

| 常數 | 型別 | 說明 |
|------|------|------|
| `REFERENCE_DATE` | string | 資料快照日期（ISO 8601），用於計算 `daysPending` |
| `LAST_UPDATED` | string | 顯示用的更新日期 |
| `REAL_TOTAL_PENDING` | number | 實際待審案件總數（含未公開書狀的案件） |

#### 案件結構（`PendingCase`）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 案號（如 `"114憲立3"`） |
| `topic` | string | 一行描述憲法爭點 |
| `applicant` | string | 聲請人（個人使用甲乙丙假名） |
| `tags` | IdentityTag[] | 受影響的身分族群標籤 |
| `filingDate` | string | 聲請日期（ISO 8601） |
| `daysPending` | number | 自動計算：`REFERENCE_DATE - filingDate` 的天數 |

#### 身分標籤（`IdentityTag`）

18 種：勞工、性別、原住民、刑事被告、環境保護、言論自由、居住正義、身心障礙、兒少權益、隱私權、集會遊行、稅務財產、軍公教、移民新住民、醫療健康、退休年金、學術自由、消費者

新增標籤時必須同步更新三處：`IdentityTag` type、`AVAILABLE_TAGS` array、`TAG_COLORS` record。

#### 大法官資料（`Justice`）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 識別碼 |
| `name` / `nameEn` | string | 中英文姓名 |
| `appointedDate` / `termExpiry` | string | 任命日/屆滿日 |
| `appointingPresident` | string | 提名總統 |
| `isActive` | boolean | 是否在任 |
| `absent` | boolean | 是否未出席評議 |
| `cohort` | string | 梯次（`'2016'` / `'2019'` / `'2023'`） |

#### 危機統計（`CRISIS_STATS`）

包含 `totalPending`、`activeJustices`、`requiredForRuling`（10）、`designatedTotal`（15）、`vacantSeats`、`absentJustices` 等欄位，由其他常數自動推導。

### 誰負責更新

- **Captain**：每月看月報、記下新案件案號和已結案件
- **FO**：開 feature、dispatch ensign 更新、跑 verify、推 PR
- **Ensign**：修改 `src/data/future.ts`

### 更新頻率

- **常規**：每月月報發布後更新一次
- **緊急**：有重大判決或大法官異動時即時更新

### 更新步驟 SOP

1. **上 cons.judicial.gov.tw 看最新月報** — 找新收案件、已結案件、統計數字
2. **開 Claude Code** — `claude --agent spacedock:first-officer`
3. **跟 FO 說「更新 T3 案件資料」** — FO 開 feature、dispatch ensign 更新、跑 verify、推 PR
4. **Vercel 自動部署**

**具體要改的檔案：**

| 檔案 | 改什麼 |
|------|--------|
| `src/data/future.ts` | `REFERENCE_DATE` 和 `LAST_UPDATED` 改成更新日期 |
| | `RAW_CASES` 加新案件 / 移除已結案 |
| | `REAL_TOTAL_PENDING` 更新總數 |
| | `CRISIS_STATS` 相關數值（大法官異動時更新 `JUSTICES` 陣列） |
| | 若有新身分族群，同步更新 `IdentityTag` + `AVAILABLE_TAGS` + `TAG_COLORS` |

**Captain 需要做的：**

1. 看月報 — 記下新案件案號和已結案件
2. 告訴 FO — 例如「新增 113憲民XXX，移除 112憲民YYY（已判決）」
3. FO 改 code — ensign 更新 + verify 確認案號/日期
4. 確認 preview — 看一下資料對不對
5. merge PR

**預估時間**：整個流程約 10-15 分鐘。

### 驗證方式

- **TypeScript 編譯檢查**：`npx tsc --noEmit` 會驗證所有型別一致性（特別是 `IdentityTag` 的三處同步）
  ⚠️ 原本此處寫 `npm run build`。該指令會執行同步並覆蓋資料檔，已於 2026-09-02 改掉。
- **daysPending 計算**：由程式自動從 `filingDate` 和 `REFERENCE_DATE` 推算，不需手動輸入
- **案號比對**：新增案件的 `id` 和 `filingDate` 應與 cons.judicial.gov.tw 一致
- **統計數字交叉驗證**：`REAL_TOTAL_PENDING` 應與媒體報導和司改會數據一致

### 已知限制與風險

- 資料為人工策展的凍結快照（frozen research snapshot），非即時爬蟲抓取
- `RAW_CASES` 是精選子集（目前約 40 件），不代表全部 473+ 件待審案件
- `IdentityTag` 是編輯層的分類判斷，非官方分類，可能有主觀性
- 大法官出缺席狀態（`absent`）需要人工追蹤，司法院未提供即時 API
- 月報發布時間不固定，可能延遲
- `FAILED_NOMINATIONS` 需手動維護，若有第三次提名須手動新增

---

## 跨軌道共通事項

### 共通模式

| | T1／T2 | T3 |
|---|---|---|
| 資料來源 | Google 試算表（`SSOT_收集區`） | 程式碼內的 `src/data/future.ts` |
| 誰改內容 | 投稿者填、編輯台核可 | Captain 直接改 TS 檔 |
| 怎麼上線 | 同步程式產生 JSON → PR → 合併 | 直接改 → PR → 合併 |
| 型別安全 | JSON，型別由 import 推導 | TS，有明確型別定義 |

**Vercel 自動部署**：PR 合併後由 Vercel 自動部署。

⚠️ 目前 Vercel 的部署**會執行同步**，這是已知缺陷，見 `design.md` 不變式 #1。
修好之前，部署不等於安全。

### 共通風險

| 風險 | 影響軌道 | 緩解措施 |
|------|---------|---------|
| 外部連結失效 | T1（bgImage）、T2（link） | 定期人工檢查；T1 可改用本地圖片 |
| 資料時效性 | T3（案件狀態）、T2（討論熱度） | T3 每月更新；T2 事件驅動 |
| 單點故障 | 全部 | Captain 是唯一內容決策者，需建立備援機制 |
| 資料格式錯誤 | T1、T2 | `design.md` 第四節的檢查機制。**尚未實作** |
| 無型別驗證 | T3 | TypeScript 編譯期檢查（`npx tsc --noEmit`） |

> 原表列有「`npm run build` 會在編譯時報錯」作為緩解措施。
> **該指令現已禁止使用** —— 它會執行同步並覆蓋資料檔。改用 `npx tsc --noEmit`。

### 檔案位置一覽

| 軌道 | 資料檔案 | 頁面元件 |
|------|---------|---------|
| T1 | `src/data/history.json` | `src/app/past/page.tsx` |
| T2 | `src/data/discussions.json` | `src/app/present/page.tsx` |
| T3 | `src/data/future.ts` | `src/app/future/page.tsx` |
| 跨軌道 | `src/data/cross-track-links.ts` | `src/components/CrossTrackLinks.tsx` |


---

## 變更說明

### 2026-09-02 — 移除 T1／T2 章節

**原內容有三個問題：**

1. T1 步驟第 4 條與 T2 步驟第 7 條教人「在 `src/data/*.json` 新增條目」。
   那違反 `design.md` 不變式 #2（產物不得手改）。
2. 驗證方式建議執行 `npm run build`。該指令會執行同步並覆蓋資料檔，現已禁止。
3. T2 步驟第 8 條提到準備 `opposing_views` 資料。反方意見已於 2026-09-01
   決定不收集。

**處置**：刪除 T1／T2 章節，改為指向 `design.md`。不在此重寫流程 ——
同一件事寫在兩個地方，兩邊遲早會不一致。

T3 章節保留。T3 走程式碼內的 `future.ts`，不經過試算表，`design.md` 管不到它。

**相關**：`docs/constitution-features/031` 這張票的正文是本文件的草稿。
該票的 T1／T2 部分已由 `design.md` 涵蓋，範圍已縮減為只剩 T3。
