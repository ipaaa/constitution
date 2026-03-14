# 5. 志工參與指南 (Contribution Guide)

`Add C0urt 憲庭加好友` 是一個開源的公民科技專案。我們將網站分為三大軌道（過去、現在、未來），並需要不種專業領域的志工投入。無論您的專長是什麼，這裡都有您可以貢獻的地方！

## 🌟 我們需要的角色與守備範圍

### 1. 🎨 UI/UX 設計師 (Designers)
*   **必讀文件**：`about.md` (了解受眾與痛點) ＆ `design_system.md` (了解最終拍板的美學定調)。
*   **您的任務**：
    *   依據確立的「Refined Document 雜誌編排」風格，在 Figma 中建立完整的 Design System 元件庫 (Component Library)。
    *   繪製 Track 1 (時光機)、Track 2 (雜誌跨頁熱搜榜)、Track 3 (權益計算機儀表板) 的高保真 Mockups 或 Wireframes，確保 RWD（手機版與桌機版）的流暢跳轉。
    *   設計吉祥物「貓頭鷹大法官」的各種狀態 Icon。

### 2. 💻 前端工程師 (Frontend Developers)
*   **必讀文件**：`architecture.md` (了解互動邏輯) ＆ `tech_stack.md` (了解架構限制)。
*   **您的任務**：
    *   在 Next.js / Tailwind 環境中進行切版與元件開發。
    *   實作 Track 1 的 Scroll-telling 滾動互動視差特效。
    *   實作 Track 3 的資料過濾器（權益計算機）與 D3.js 漏斗圖表。
    *   將寫死 (Hardcoded) 的內容替換為讀取 `src/data/` 下的 JSON 結構。

### 3. ⚖️ 法律文案與資料爬蟲志工 (Content & Data Hackers)
*   **必讀文件**：`about.md` (了解倡議青年的「彈藥庫」需求) ＆ `architecture.md` (了解資料要用在哪)。
*   **您的任務**：
    *   **資料收集**：撰寫爬蟲腳本，將司法院資料庫案件抓取下來。
    *   **白話文轉譯 (最關鍵)**：將生硬的憲庭判決（例如：牽涉《立法院職權行使法》），轉換為 Track 2 需要的 `TL;DR` 摘要，必須簡短、好懂、具備擴散力。
    *   **Tagging 標籤化**：為 Track 3 （未來）的待審案件貼上「生活化標籤」（如：這案子攸關女性權益、那案子攸關死刑存廢），這是讓「權益計算機」得以運作的核心燃料。

---

## 🛠️ 開發與協作流程 (Workflow)

1.  **認領任務**：本專案採用 GitHub Projects / Issues 作為任務池 (Issue Pool)。請先到 Issues 版面上尋找標註 `help wanted` 或 `good first issue` 的票卷。
2.  **Fork & Branch**：Fork 此 Repository，並開出新的 Branch 進行開發（例如：`feature/track2-ui-refine`）。
3.  **遵守單一真實來源 (SSOT)**：所有核心的設計決策與架構邏輯，都必須以本 `/Documents` 資料夾中的內容為依歸。若有因實作困難需要修改架構，請先在 Issue 或社群頻道中提出討論，並同步更新文檔。
4.  **發送 PR (Pull Request)**：開發完成後發送 PR，經由 Maintainers 審核測試無誤後，即可 Merge 進入佈署流程！

感謝您的參與，讓我們一起把抽象的憲法法庭，拉回每一個公民的現實生活中。
