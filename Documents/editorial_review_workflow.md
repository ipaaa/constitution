# 🖋️ 專業編輯台：分散式協作與三關審核流 (Enhanced Editorial Workflow)

為了確保網站內容具備專業可信度，同時支援多人分散協作，我們需要將原本的「直接同步」流程升級為 **「編輯台審稿制」**。

這個系統的核心目標是：**「讓志工盡情輸入，但只有總編輯點頭的內容才能上線。」**

---

## 🏛️ 三大角色定義 (Roles)

| 角色 | 權限內容 | 責任範圍 |
| :--- | :--- | :--- |
| **法律志工 / 文案 (Drafting)** | 試算表 `編輯` 權限 | 負責資料爬取、白話文轉譯初稿撰寫。 |
| **總編輯 (Chief Editor)** | 試算表 `核准` 權限 | 負責內容校對、事實查核 (Fact Check)，決定是否「發布」。 |
| **系統工程 (System/Ops)** | 同步腳本維護 | 確保技術端的資料轉換與 Vercel 部署正常運作。 |

---

## 🔄 升級版工作流程 (The 3-Step Review Flow)

### 第一關：草稿輸入 (Drafting & Peer Edit)
*   志工在 Google Spreadsheet 的各分頁中填寫資料。
*   **關鍵欄位新增**：`Content Status (內容狀態)`
    *   `Draft (草稿)`：編輯中，系統會略過不抓。
    *   `Needs Review (等候審核)`：志工填寫完畢，呼叫總編輯。

### 第二關：編輯台審核 (Editorial Gatekeeping)
*   **總編輯** 進入試算表，針對狀態為 `Needs Review` 的列進行校對。
*   **欄位設計：`Approved by` (核准人)**
    *   總編輯確認無誤後，將狀態改為 `Approved (可發布)` 並簽名。
*   **分散式協作機制**：利用試算表的 **「保護工作表/範圍」** 功能，限制只有「總編輯」帳號能修改 `Content Status` 與 `Approved by` 欄位，防止誤觸。

### 第三關：技術自動同步 (Auto-Sync & Preview)
*   **技術腳本優化**：`sync-content.js` 腳本執行時，會自動過濾 `WHERE Status = 'Approved'` 的資料。
*   **雙重環境驗證**：
    1.  **Staging (預覽站)**：每小時自動抓取資料，包含 `Needs Review` 的內容。讓團隊私下可以看到「成品長怎樣」。
    2.  **Production (正式站)**：只有 `Approved` 的內容會被 GitHub Action 抓取並自動部署。

---

---

## 🛡️ 品質控管與回饋機制 (Quality Control & Feedback)

為了維持專業可信度，我們不採取逐卡片標註審核者的方式（避免版面雜亂），而是建立全局的品質把關機制：

1.  **隱性審核 (Implicit Verification)**：所有發布到正式網站的內容，都預設已經過總編輯在試算表中的 `Approved` 狀態確認。
2.  **全站錯誤回報管道 (Centralized Reporting)**：
    *   **位置**：全站頁尾 (Footer)。
    *   **功能**：提供一個顯眼的「錯誤回報」或「資訊修正」按鈕/連結。
    *   **機制**：連結至 Google Form 或 GitHub Issues，讓熱心讀者能針對特定文章提出事實查核建議，由編輯台統一收件處理。這能在鼓勵協作的同時，維持內容的權威性與修正的反應速度。

---

## 🚀 升級方案的階段性實施 (Roadmap)

1.  **Step 1 (Immediate)**：在試算表中新增 `Status` 與 `Reviewer` 欄位，並設定編輯權限。
2.  **Step 2 (Technical)**：修改 `sync-content.js` 邏輯，加入狀態過濾 (Status filter)。
3.  **Step 3 (UX)**：在網頁前端加入「最後更新時間」與「審核單位」標示。

---

**❓ 您對於「Staging(預覽) vs Production(正式)」這種切分方式，以及在試算表中設定狀態欄位的方法，是否覺得能兼顧效率與安全感？**
如果這個草案 OK，我就直接以此邏輯來撰寫同步程式碼。
