---
id: "010"
title: T1 Timeline Crowding — Solution Options
status: design
source: captain-filed
started:
completed:
verdict:
score: 0.7
worktree:
issue:
pr:
---

T1 的 timeline（`/past` 頁面）在加入新 entries 之後變得過於擁擠，UX 崩壞。需要有人研究現況、列出可能的解法，讓 captain 評估要走哪條路。

### Problem context

- `src/data/history.json` 現在有 N+ 筆 entries（隨 SSOT 試算表成長）
- 目前 T1 頁面（`src/app/past/page.tsx`）似乎是一次把所有 entries 一頁內 render，scroll 體驗混亂
- 視覺密度、reading flow、導航性都有問題

### What this task needs (design/ideation, not implementation)

產出一份 **solutions design spec** 作為這個 entity 的設計產物（寫入 entity body 的 `## Stage Report` 區塊），讓 captain 可以挑一個方向，再另外 dispatch implement。

Spec 應涵蓋：

1. **現狀診斷**
   - 現在 T1 頁面的 data flow（讀什麼檔、怎麼 render、排序邏輯）
   - 實際 entry 數量與目前視覺呈現的摘要
   - 引用具體的 `src/app/past/page.tsx` 程式碼位置（file:line）說明 render 路徑

2. **3-5 個候選解法**（每個要有以下欄位）
   - **名稱與一句話描述**
   - **UX 樣貌**（使用者會看到什麼、怎麼操作）
   - **實作複雜度評估**（小/中/大 + 粗估要改哪些檔案）
   - **Trade-offs**（優點、缺點、適合哪種情境）
   - **例子**（如果其他網站/產品有類似做法，列名）

   候選方向舉例（reviewer 可自由增減）：
   - 分頁 / load more
   - 年代折疊（例如 2020s / 2010s 為 section header，可收合）
   - 虛擬滾動（virtual scroll）
   - Filter chip（按 category / decade / 釋字編號）
   - Timeline + 側邊 mini-map（跳到指定年代）
   - 搜尋欄（類似 004 T2 做的）
   - Horizontal scroll timeline（scroll horizontally along years）
   - 分成多個子頁（e.g. `/past/1990s`, `/past/2000s`）

3. **推薦方案**
   - 選一個作為 recommendation，說明為什麼
   - 不是命令 captain 照做；是「如果只選一個，我推這個」

4. **如果有多解法可組合**（例如分頁 + 搜尋），明確指出組合方式

### Acceptance criteria

- Entity body 有完整的 `## Stage Report` 區塊，涵蓋上述 1–4 點
- 至少 3 個候選解法，每個都有所有欄位
- 有引用 `src/app/past/page.tsx` 現況的具體 file:line
- 不寫任何實作程式碼（這是 ideation，不是 implement）
- 推薦一個方案並說明理由
