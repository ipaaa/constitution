# 📄 內容同步工作流草案 (Content Sync Workflow Proposal)

為了落實 **Single Source of Truth (SSOT)** 的原則，讓不具備工程背景的貢獻者（法律志工、文案編輯）能透過熟悉的介面更新網站內容，我們提議建立一套 **「Google Spreadsheet ↔ 網站自動同步」** 的機制。

---

## 🛠️ 工作流架構 (Workflow Architecture)

1.  **編輯端 (Source)**：維護一份專屬的 Google Spreadsheet，內含 Track 1 與 Track 2 的分頁。
2.  **同步端 (Command)**：開發者或自動化腳本執行 `npm run sync-content`。
3.  **轉譯端 (Transform)**：同步腳本抓取 Spreadsheet 資料，驗證格式後轉換為專案內的 `src/data/*.ts` 或 `*.json`。
4.  **展示端 (Display)**：Next.js 讀取更新後的資料檔並重新部署（或在開發環境即時顯示）。

---

## 📊 試算表欄位設計 (Spreadsheet Schema)

### 【分頁：Track 1 - 過去時光機】
| 欄位 ID | 顯示名稱 | 說明 | 範例 |
| :--- | :--- | :--- | :--- |
| `id` | 唯一識別碼 | 不可重複 (e.g. h1, h2) | `h1` |
| `chapter` | 課本章節 | 左側課本標題 | `第六課：民主政治與選舉` |
| `content` | 課本內文 | 支援實體 HTML (如 highlight span) | `人民有權透過...選出公職人員` |
| `handwriting` | 眉批手寫 | 左側手寫感補充文字 | `但曾經，國會議員是不用改選的！` |
| `year` | 歷史年份 | 右側標註年份 | `1990` |
| `title` | 真實標題 | 右側大標題 | `你能親手選出新國會...` |
| `ruling` | 判決細節 | 右側底部說明文字 | `野百合學運・釋字第 261 號` |
| `image_url` | 背景圖片 | 歷史現場照片網址 (Unsplash 或路徑) | `https://images.unsplash...` |

### 【分頁：Track 2 - 現在熱搜榜】
| 欄位 ID | 顯示名稱 | 說明 | 範例 |
| :--- | :--- | :--- | :--- |
| `id` | 唯一識別碼 | 不可重複 (e.g. d1, d2) | `d1` |
| `category` | 分類 | 分為 `Scholar Articles`, `NGO Reports`, `Reels` | `NGO Reports` |
| `title` | 文章/影音標題 | 標題文字 | `國會擴權法案判決評析` |
| `author` | 作者/組織 | 來源單位名稱 | `民間司法改革基金會` |
| `year` | 發表年份 | 年份文字 | `2024` |
| `abstract` | 內容摘要 | 簡短說明文，用於卡片內文 | `針對立法院職權行使法修法...` |
| `link` | 外部連結 | 點擊卡片跳轉的網址 | `https://www.jrf.org.tw/` |
| `views` | 觀看數 | (僅限 Reels) 顯示熱度數字 | `45600` |

---

## 🚀 實作階段 (Implementation Phases)

### Phase 1：建立基礎架構
*   建立 Google Spreadsheet 並分享給編輯小組。
*   編寫 `scripts/sync-content.js` 腳本，使用 `axios` 抓取 Spreadsheet 發布的 CSV 連結。
*   將資料存入 `src/data/history.json` 與 `src/data/discussions.json`。

### Phase 2：整合與驗證
*   修改 `src/app/past/page.tsx` 與 `src/app/present/page.tsx` 改為讀取 JSON 檔案而非原始的 `.ts` 定義。
*   加入資料格式檢查 (Data Validation)，防止試算表填錯導致網站壞掉。

### Phase 3：自動化 (CI/CD Optimization)
*   設定 GitHub Actions 每晚自動執行 `sync-content` 並提交 Commit（如果內容有更動）。
*   這樣只要編輯改了 Spreadsheet，隔天網站就會自動看到更新，不需要任何工程師介入。

---

**❓ 您對這套「欄位設計」與「自動化方式」有什麼想法？**
如果您覺得欄位 OK，我可以先幫您產出一個 **Google Spreadsheet 的範本結構** 讓您複製去用，接著我就開始寫同步腳本。
