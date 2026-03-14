# 4. 技術架構與資料流 (Tech Stack & Data Flow)

為了讓 `Add C0urt 憲庭加好友` 能在低維護成本下長期營運，並乘載可能因為時事引發的瞬間高流量，我們採取 **「無伺服器架構 (Serverless)」** 與 **「資料驅動靜態網站 (Data-driven SSG)」** 的策略。

## 🏗️ 前端技術堆疊 (Frontend Stack)

*   **核心框架**：`Next.js` (App Router 機制)
    *   選用原因：支援靜態網站生成 (Static Site Generation, SSG)，載入速度極快，且有利於 SEO 與社群媒體爬蟲解析 Open Graph (OG) 標籤，對於我們這種需要被大量轉發的資訊懶人包網站至關重要。
*   **樣式與切版**：`Tailwind CSS` (v4)
    *   選用原因：Utility-first 能極速構建複雜的 Dashboard (軌道二/三) 與網格佈局。配合我們建立的 `Design System`，可大幅減少自定義 CSS 的維護成本。
*   **語言**：`TypeScript`
    *   選用原因：確保資料結構（特別是複雜的憲法判決 JSON）在組件間傳遞的安全性。
*   **圖表與動畫**：
    *   軌道三的漏斗圖/資料儀表板：推薦使用 `D3.js` 或 `@nivo` 系列圖表庫。
    *   轉場動畫：可使用 `Framer Motion` 點綴滾動視差特效。

## 🗄️ 資料流架構：以靜態 JSON 為核心

我們決定**不建置**傳統的 Backend API Server 或關聯式資料庫 (如 PostgreSQL)。

### 資料流動路徑 (Data Workflow)

1.  **資料擷取 (Data Extraction)**：由後端/爬蟲志工編寫 Python 腳本，定期（例如每晚）從司法院網站與相關新聞源抓取最新案件與判決。
2.  **資料淨化與標註 (Data Refining & Tagging)**：爬取下來的原始資料，經過法律志工的整理，加上符合民眾痛點的「生活化標籤 (Tags)」(例如：`勞工`, `婚姻平權`), 最終輸出為乾淨的 `JSON` 檔案。
3.  **儲存為 SSOT (Single Source of Truth)**：這些 `JSON` 檔案直接被 Commit 進入 GitHub Repository 中（例如 `src/data/cases.json`）。
4.  **靜態建置 (Build & Deploy)**：當 GitHub 發現資料檔更新時，觸發 CI/CD 流程。Next.js 會讀取最新的 JSON，將所有頁面預先渲染 (Pre-render) 為純 HTML/CSS。
5.  **全球分發 (CDN)**：靜態檔案部署至 Vercel 或 GitHub Pages，由全球 CDN 節點分發給末端使用者，達到零首屏延遲與無限併發能力。

這套架構確保了專案可以永遠免費託管，且不會因為資料庫連線超載而當機。
