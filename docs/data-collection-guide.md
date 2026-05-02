# 資料收集流程說明文件

本文件記錄「憲庭加好友」三個軌道（T1 過去、T2 現在、T3 未來）的資料收集、更新與驗證流程。

---

## T1：憲法課本時光機（Past Track）

### 資料來源

- **主要來源**：司法院大法官釋字、憲法法庭裁判（cons.judicial.gov.tw）
- **輔助來源**：學術文獻、新聞報導、法學教科書（用於撰寫 textbook/reality 敘事文字）
- **圖片來源**：Unsplash（`bgImage` 欄位使用的背景圖）

### 資料結構

檔案位置：`src/data/history.json`

每筆資料為一個 JSON 物件，結構如下：

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼，格式為 `h{數字}`（如 `h1`、`h15`） |
| `category` | string | 分類標籤（如「言論自由」「性別平等」「權力分立」） |
| `textbook.chapter` | string | 課本章節名稱或年份 |
| `textbook.content` | string | 釋字號碼或簡短法條引述 |
| `textbook.handwriting` | string | 手寫風格的一句話重點摘要 |
| `reality.year` | string | 判決年份（如 `"2017"`），**部分早期資料此欄位誤存為法條原文而非年份** |
| `reality.title` | string | 白話標題（吸引讀者的問句形式） |
| `reality.ruling` | string | 判決核心意旨的白話翻譯 |
| `reality.ruling_id` | string | 釋字/憲判字編號（部分為空字串） |
| `reality.bgImage` | string | Unsplash 背景圖 URL（部分為空字串） |

**注意事項**：
- 資料按年代分組（decade）顯示，分組邏輯由 `page.tsx` 中的 `decadeOf()` 從 `reality.year` 推算
- 部分較早加入的條目（如 `h15`–`h29`）的 `reality.year` 欄位存放的是法條原文而非年份數字，這些條目的年份改由 `textbook.chapter` 欄位推算
- `category` 沒有固定的枚舉值，新增時應盡量沿用既有分類

### 誰負責更新

- **Captain（專案負責人）**：決定要新增哪些釋憲案、撰寫或審核敘事文字
- **FO / Ensign**：執行 JSON 修改、確認格式正確

### 更新頻率

- **不定期**：當有重大憲法裁判值得收錄時新增
- **無固定排程**：T1 是歷史資料，不會頻繁變動

### 更新步驟 SOP

1. Captain 確認要新增的釋憲案（案號、年份、主旨）
2. 準備以下內容：
   - `category`（分類）
   - `textbook` 三個欄位（課本視角的敘事）
   - `reality` 五個欄位（現實視角的敘事 + 背景圖）
3. 告訴 FO「新增 T1 釋憲案 XXX」
4. Ensign 在 `src/data/history.json` 新增條目，`id` 遞增
5. 確認 `reality.year` 為純數字年份字串（如 `"2024"`），否則 decade 分組會出錯
6. 本機跑 `npm run dev` 確認新條目正確顯示在對應年代區塊
7. 推 PR、preview 確認、merge

### 驗證方式

- **型別檢查**：`npm run build` 會透過 TypeScript 檢查 `HistoryEntry` 型別推導
- **人工確認**：在開發伺服器上檢查新條目是否出現在正確的年代區塊、文字是否正確、背景圖是否載入
- **搜尋測試**：在頁面搜尋欄輸入案號或關鍵字，確認新條目可被搜尋到

### 已知限制與風險

- `reality.year` 欄位有歷史遺留格式問題（部分條目存的是法條文字而非年份），這些條目的 decade 分組結果為 `NaN`，會被 `groupByDecade` 濾除，改靠 `textbook.chapter` 顯示
- `bgImage` 使用外部 Unsplash URL，若圖片被移除或 Unsplash 服務異常，背景圖將無法顯示
- JSON 格式手動維護，無 schema 驗證，容易因遺漏逗號或引號造成解析錯誤
- 沒有防止重複 `id` 的機制

---

## T2：憲庭熱搜榜（Present Track）

### 資料來源

- **學者文章（Scholar Articles）**：法學期刊、個人 Facebook 貼文、報導者、換日線等
- **NGO 報告（NGO Reports）**：民間司改會、鏡週刊專欄等
- **影片（Reels）**：YouTube 短影片，主要來自「法律白話文運動」、其他法普頻道
- **官方懶人包（Official TL;DR）**：編輯團隊自行撰寫的摘要

### 資料結構

檔案位置：`src/data/discussions.json`

每筆資料為一個 JSON 物件，結構如下：

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼（如 `d1`、`tldr`） |
| `category` | string | 類別：`"Scholar Articles"` / `"NGO Reports"` / `"Reels"` / `"Official TL;DR"` |
| `title` | string | 文章/影片標題 |
| `author` | string | 作者名稱 |
| `year` | string | 發表日期（格式不統一：`"2026.1.14"` / `"2026"` / `"""`） |
| `abstract` | string | 摘要文字（TL;DR 類別支援 `**粗體**` markdown 和 `\n` 換行） |
| `link` | string | 原文連結 URL |
| `owl_comment` | string | 貓頭鷹法官的編輯評語（可為空字串） |
| `vibe` | string | 氣氛標籤（如 `"🔥 公民必讀"` `"📖 深度解析"`） |
| `sticky` | boolean | 是否置頂顯示 |
| `views` | number（選填） | 觀看次數（僅 Reels 類別使用） |
| `opposing_views` | array（選填） | 反方觀點陣列（見下方說明） |

**反方觀點結構**（`opposing_views` 內的物件）：

| 欄位 | 說明 |
|------|------|
| `id` | 唯一識別碼 |
| `stanceLabel` | 立場標籤 |
| `summary` | 簡短摘要 |
| `fullArgument` | 完整論述（選填） |
| `source` | 來源物件（author, affiliation, year） |
| `editorialNote` | 編輯團隊的回應/註解 |
| `editorialSources` | 編輯回應引用的來源陣列 |

### 誰負責更新

- **Captain**：發現新的學者文章、NGO 報告、影片後決定是否收錄，撰寫 `owl_comment` 和 `vibe` 標籤
- **FO / Ensign**：執行 JSON 修改、確認連結有效

### 更新頻率

- **事件驅動**：當有新的重要評論、文章、影片發表時即時加入
- **建議每 1-2 週**：檢查是否有遺漏的重要討論

### 更新步驟 SOP

1. Captain 發現值得收錄的文章/影片
2. 準備以下資訊：
   - 原文連結、標題、作者、發表日期
   - 分類（Scholar Articles / NGO Reports / Reels）
   - 摘要文字
3. 撰寫 `owl_comment`（貓頭鷹法官的白話評語）
4. 選擇 `vibe` 標籤（從既有標籤中選，或新增）
5. 決定是否 `sticky`（置頂）
6. 告訴 FO「新增 T2 文章 XXX」
7. Ensign 在 `src/data/discussions.json` 新增條目
8. 若需要附加反方觀點，一併準備 `opposing_views` 資料
9. 本機跑 `npm run dev` 確認卡片在正確分類區塊中顯示
10. 推 PR、preview 確認、merge

### 驗證方式

- **連結有效性**：手動點擊 `link` 確認原文可訪問
- **分類正確**：確認 `category` 值為四種之一（拼字錯誤會導致該條目不顯示在任何區塊）
- **顯示確認**：在開發伺服器上確認卡片渲染正常、摘要文字不截斷
- **搜尋測試**：在頁面搜尋欄輸入標題或作者，確認可被搜尋到

### 已知限制與風險

- `year` 欄位格式不統一（有 `2026.1.14`、`2026`、空字串），排序邏輯用字串比較，可能產生非預期順序
- 外部連結可能失效（Facebook 貼文尤其容易被刪除或設為私人）
- `abstract` 欄位在部分條目中是佔位文字（如 `"快速了解最新判決的5個重點..."`），尚未填入真正摘要
- `opposing_views` 僅部分條目有，且 `source` 欄位使用「某學者」「某法官」等匿名佔位符
- 沒有自動化的連結健康檢查機制
- TL;DR 條目（`id: "tldr"`）的 `abstract` 目前是測試用文字

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

- **TypeScript 編譯檢查**：`npm run build` 會驗證所有型別一致性（特別是 `IdentityTag` 的三處同步）
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

1. **全部手動維護**：三個軌道的資料都是人工編輯 JSON/TS 檔案，無自動化爬蟲或 API 串接
2. **FO/Ensign 工作流**：透過 Claude Code 的 Spacedock 工作流進行更新，Captain 提供內容，Ensign 執行修改
3. **Vercel 自動部署**：PR merge 後由 Vercel 自動部署，無需手動發布
4. **TypeScript 型別安全**：T1/T2 使用 JSON（型別由 import 推導），T3 使用 TS（有明確型別定義）

### 共通風險

| 風險 | 影響軌道 | 緩解措施 |
|------|---------|---------|
| 外部連結失效 | T1（bgImage）、T2（link） | 定期人工檢查；T1 可改用本地圖片 |
| JSON 格式錯誤 | T1、T2 | `npm run build` 會在編譯時報錯 |
| 資料時效性 | T3（案件狀態）、T2（討論熱度） | T3 每月更新；T2 事件驅動 |
| 單點故障 | 全部 | Captain 是唯一內容決策者，需建立備援機制 |
| 無 schema 驗證 | T1、T2 | 可考慮未來加入 JSON Schema 或 Zod 驗證 |

### 檔案位置一覽

| 軌道 | 資料檔案 | 頁面元件 |
|------|---------|---------|
| T1 | `src/data/history.json` | `src/app/past/page.tsx` |
| T2 | `src/data/discussions.json` | `src/app/present/page.tsx` |
| T3 | `src/data/future.ts` | `src/app/future/page.tsx` |
| 跨軌道 | `src/data/cross-track-links.ts` | `src/components/CrossTrackLinks.tsx` |
