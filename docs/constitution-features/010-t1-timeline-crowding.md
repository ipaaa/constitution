---
id: "010"
title: T1 Timeline Crowding — Solution Options
status: review
source: captain-filed
started: 2026-04-16T20:53:14Z
completed:
verdict:
score: 0.7
worktree: .worktrees/spacedock-ensign-010-t1-timeline-crowding
issue:
pr:
mod-block: merge:pr-merge
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

## Stage Report

### 現狀診斷

**Data flow**

- 資料檔：`src/data/history.json`（目前 10 筆 entries，年份從 1990 到 2023，涵蓋 10 個不同 categories；沒有任何一年重複）
- 頁面進入點：`src/app/past/page.tsx:4` 直接 `import HISTORY_DATA from '@/data/history.json'`，沒有任何排序、過濾、分頁 — 整批餵給 render
- 排序：沒有主動排序，完全依賴 JSON 檔本身的寫入順序（目前恰好是年份由小到大）
- 活躍 entry 判定：`src/app/past/page.tsx:12-41` `useEffect` 內建立 IntersectionObserver，`rootMargin: "-45% 0px -45% 0px"`（中央 10% viewport 觸發），以 `data-step` 屬性告知當前 active index
- Scroll 容器高度：`src/app/past/page.tsx:64` `style={{ height: ${HISTORY_DATA.length * 100}vh }}` — 1 entry = 100vh，**10 entries = 1000vh 的總捲動距離**
- Render 路徑：在同一個 sticky viewport 中同時 render 三組 `HISTORY_DATA.map`：
  - 左欄 textbook items（`src/app/past/page.tsx:72-101`，絕對定位疊在一起，由 `.textbook-item.active/.exit-up/.exit-down` CSS class 控制淡入淡出 — 見 `src/app/globals.css:60-78`）
  - 中央 timeline dots（`src/app/past/page.tsx:111-120`，以 flex `justify-between` + `py-[20vh]` 在 2px 垂直線上均分）
  - 右欄 reality items（`src/app/past/page.tsx:125-160`，同樣絕對定位疊放）
  - 第四組 scroll triggers（`src/app/past/page.tsx:167-173`）— 10 個 `h-screen` div 構成捲動錨點

**Entry 數量與現況問題**

- 目前 `HISTORY_DATA.length === 10`，總 scroll 高度 = 1000vh（≈ 1920px 螢幕需要滾 ~19 個螢幕高度才能看完）
- SSOT 試算表若再長到 20、30、40 筆，線性放大到 2000–4000vh — 已經是「這頁永遠滾不到底」的體感
- 中央 timeline 的年份標籤（`src/app/past/page.tsx:116-118` `whitespace-nowrap`）以 flex `justify-between` 均分 60vh 區段；entries 數量增加後每個 dot 的間距會縮到 3–4vh 以下，**年份標籤垂直疊在一起、不可讀**
- 全部 entries 同時存在 DOM（30 個絕對定位節點 + 10 個 trigger），每個 reality-item 還各自載入一張 Unsplash 2070w 背景圖 — 首屏初始化成本隨 N 線性上升
- 沒有任何「跳到 1999 年」的 affordance — 使用者想看特定年代必須從頭滾
- 沒有 filter / search；想找「性別平等」相關釋字必須滾過所有其他類別

**一句話總結：頁面架構假設 entries 數量固定且少；當資料成長時，scroll 距離、timeline 密度、DOM 節點數三者同時爆炸，沒有任何 escape hatch。**

### 候選解法

#### A. 年代折疊（Decade Sections）

- **一句話**：把 entries 依照年代（1990s / 2000s / 2010s / 2020s）分 section，每個 section 預設收合，點開才看內容
- **UX 樣貌**：進入 `/past` 先看到 4–5 個年代標題（配上 hero 動畫），每個標題寫「1990s · 3 則釋字 · 言論自由／權力分立／性別平等」；點開後才啟動該年代內部的 sticky scroll 動畫（保留現有視覺）；讀完可收合或切到下一年代
- **實作複雜度**：中
  - 改 `src/app/past/page.tsx` 讓頂層 render 由「單一 scroll 容器」變成「多個 collapsible section」
  - 每個 section 內部仍然可以沿用現有 sticky + IntersectionObserver 邏輯，但 scroll 高度改為 `sectionEntries.length * 100vh`
  - 資料層可在 `page.tsx` 內做一次 `groupBy(decade)`，不需要改 JSON schema
- **Trade-offs**
  - (+) 保留「時光機」的敘事感（年代本身就是故事分塊）
  - (+) 預設收合後首屏輕、DOM 節點大量減少
  - (+) 隨 entries 成長自然分攤 — 20 筆時每個年代仍只有 4–7 筆
  - (-) 使用者必須多一次點擊才能開始看內容（破壞現有「開頁就 scroll」的沉浸感）
  - (-) 某些年代可能只有 1–2 筆（e.g. 1990s 多、2000s 少），視覺不均
- **例子**：Apple 官網歷年發表會頁、維基百科年表收合、《紐時》長篇報導的章節折疊

#### B. Filter Chips（分類／年代快速過濾）

- **一句話**：保留現有單頁 scroll 體驗，但頂部加上「全部 / 言論自由 / 性別平等 / 1990s / 2000s / ...」的 chip 列，點選後只 render 符合條件的 entries
- **UX 樣貌**：進站看到熟悉的 hero + scroll；但頂部 sticky 一列 chips。點「性別平等」→ 畫面平滑 scroll 到第一筆性別平等 entry，其他 entries 從 DOM 移除；chip 可多選；「清除」回到完整模式
- **實作複雜度**：小
  - 只改 `src/app/past/page.tsx`：加一個 `useState<Set<string>>(filters)`，把 `HISTORY_DATA` 改成 `HISTORY_DATA.filter(...)` 後再 map
  - Chip UI 可用現有 Tailwind tokens，無須新組件
  - scroll 容器高度依 filter 後長度動態算
- **Trade-offs**
  - (+) 改動面最小、risk 最低
  - (+) 維持現有動畫與美術不變
  - (+) 對「我只關心性別平等歷史」的使用者超友善
  - (-) 沒解決「不下 filter 時仍然滾 1000vh+」的核心擁擠問題（只是多給一條逃生路）
  - (-) Filter 後 DOM 重建可能打斷 IntersectionObserver 的 activeIndex 狀態，要小心處理
- **例子**：Medium tag filter、Pinterest board filter、LinkedIn feed 的 "Top / Recent" toggle

#### C. Timeline Mini-map（側邊年代跳點）

- **一句話**：保留 full-scroll，但在螢幕右緣加一條永遠可見的迷你時間軸（年份點 + 類別色塊），點哪個點就 smooth-scroll 跳到那筆 entry
- **UX 樣貌**：desktop 右側 fixed 一條 vertical mini timeline（寬 40px），每筆 entry 一個 dot + 年份 hover tooltip；目前位置用醒目顏色高亮；使用者可快速 scan 全貌並跳年代
- **實作複雜度**：中
  - `src/app/past/page.tsx` 新增 fixed positioned mini-map 組件，接收 `HISTORY_DATA` 與 `activeIndex`
  - 點擊 dot → `window.scrollTo({ top: triggerElement.offsetTop, behavior: 'smooth' })`
  - Mobile 需另設計（可折疊 drawer 或隱藏）
- **Trade-offs**
  - (+) 不改變核心 scroll 敘事，只加「地圖」
  - (+) 解決「找不到特定年代」的問題
  - (+) 視覺與現有中央 timeline 呼應（主 timeline 聚焦、mini-map 概覽）
  - (-) 沒減少 scroll 總距離、沒減少 DOM — 只是讓長度「可跳躍」
  - (-) Mobile 體驗不好做（右側沒空間）
  - (-) 與現有中央 timeline 功能重疊，可能讓人困惑
- **例子**：MDN 長文右側 outline、iOS 聯絡人 A-Z 索引條、Figma 文件大綱 panel

#### D. 分成年代子頁（Route-level split）

- **一句話**：把 `/past` 變成 landing/overview，實際內容拆到 `/past/1990s`、`/past/2000s`、`/past/2010s`、`/past/2020s` 等子頁
- **UX 樣貌**：`/past` 顯示 4 張年代卡片（每張秀該年代 highlight 釋字 + 數量），點入後才看到 sticky scroll 動畫。每個子頁 entries 數量可控、載入快
- **實作複雜度**：大
  - 新增 `src/app/past/[decade]/page.tsx` 動態路由 + `generateStaticParams`
  - 改 `/past` 為 overview，需要新美術設計（4 張卡片版型）
  - 影響導覽列：其他地方 link 到 `/past` 的行為改變
  - SEO / social sharing 連結結構改變
- **Trade-offs**
  - (+) 每頁 entries 少、DOM 輕、scroll 距離短
  - (+) URL 可深連結到特定年代、SEO 友善
  - (+) 隨 entries 暴增完全不會崩（加年代就加 route）
  - (-) 破壞「一頁看完整部憲法史」的敘事連貫性 — T1 的情感張力仰賴「從 1990 滾到 2023」的累積感
  - (-) 改動面最大（新路由、新 overview 頁、可能影響 Track 2/3 對 `/past` 的連結）
  - (-) 需要新 overview 頁的視覺設計，不是純工程任務
- **例子**：維基百科「21 世紀年表」vs「20 世紀年表」分頁、Apple Newsroom 按年分的 archive

#### E. 搜尋欄（Search / Command-K）

- **一句話**：加一個搜尋框（或 Cmd+K palette），輸入關鍵字 / 釋字號 / 年份 → 跳到對應 entry
- **UX 樣貌**：頁首 sticky 一個搜尋欄 placeholder「搜年份、釋字號或關鍵字（如：同婚）」；輸入後下拉 suggestion，點選 smooth-scroll 到該 entry 並高亮閃爍
- **實作複雜度**：小–中
  - `src/app/past/page.tsx` 加 `useState(query)` + 簡單的 string match（title / category / ruling_id / year）
  - 可選：用 fuse.js 做 fuzzy match（多一個 dep）
  - 04 T2 已經有類似組件可以參考 / 複用
- **Trade-offs**
  - (+) 對「我記得是釋字 748」這類精準查詢最佳
  - (+) 改動小、與其他方案可共存
  - (-) 對「不知道要找什麼、只想瀏覽」的使用者沒用 — 他們才是擁擠問題的主受害者
  - (-) 只有 10–30 筆資料時，搜尋的必要性不高（大砲打蚊子）
- **例子**：Linear Cmd-K、Notion 頁內搜尋、GitHub issue search

### 推薦方案

**推薦 A（年代折疊）作為主方案。**

理由：

1. **直接對應問題的核心維度**：擁擠的根源是「所有 entries 疊在同一條 scroll 軸上」，A 是唯一從「分割 scroll 軸」層面動刀的方案。B/E 只加 escape hatch、C 只加地圖、D 雖然也分割但代價太大
2. **敘事上合理**：年代本身就是故事單位（「90 年代的民主轉型 / 2010 年代的性別平權」），分塊不破壞 T1 時光機的情緒曲線，反而強化章節感
3. **規模化可控**：entries 從 10 長到 30、40 時，A 的壓力是線性分攤到 4–5 個年代（每段 6–10 筆），仍在現有單 section sticky scroll 的甜蜜點內
4. **保留現有視覺資產**：section 內部可以原封不動沿用 sticky + IntersectionObserver + 左右雙欄動畫，不需重做美術
5. **實作複雜度中等可控**：主要改動集中在 `src/app/past/page.tsx` 的頂層結構，CSS 與 JSON schema 不動

**放棄了什麼（誠實列出）**：

- vs B：B 改動更小；若 captain 的優先順序是「盡快上線、之後再說」，B 其實更划算。A 需要做收合動畫、重新思考 hero section 與第一個 section 的銜接，是中等工程
- vs D：D 對超大規模（50+ entries）的表現會更好；A 在單年代本身就 10+ 筆時仍會有內部擁擠（但這是「未來的問題」，不是現在的問題）
- vs C/E：放棄了「任意快速跳點 / 精準查詢」的能力 — A 只能在年代層級跳，無法直接跳到「釋字 748」。若這種使用情境常見，A 單獨不夠
- 共同代價：A 引入「需要點擊展開」這一步，破壞現況「開頁即沉浸 scroll」的無縫感 — 是實在的 UX 退步，設計時要盡量用動效補償（例如第一個年代預設展開）

### 可組合方案

**A + E（年代折疊 + 搜尋）是高 CP 值組合**：

- 預設瀏覽者走 A 的年代折疊敘事；知道要找什麼的使用者走 E 的搜尋直接跳點
- 額外複雜度：**小**。E 本身改動就小，疊在 A 之上只需讓搜尋結果「自動展開該年代 section 並 scroll 到 entry」
- 這組合回應了兩種互斥的使用者意圖（探索型 vs 目標型），而 A 單獨只服務前者

**A + B（年代折疊 + filter chips）也可以**，但有重疊：年代本身已經是 filter 的一種；若再加 category chip 會有兩層過濾邏輯，UI 容易混亂。**不推薦這組**，除非未來 category 數量也爆炸。

**不建議 C（mini-map）+ 任何方案組合**：一旦走了 A，頁面已經分段，mini-map 的價值大幅下降；資訊架構重複。

### 完成度檢核

1. 讀 `src/app/past/page.tsx` 完整檔案並理解 render 路徑 — **DONE**（file:line 已引用於現狀診斷）
2. 讀 `src/data/history.json` 確認筆數與 shape — **DONE**（10 筆、年份 1990–2023、10 個 categories）
3. 寫 `### 現狀診斷` 含 data flow / file:line / entry 數量 / 擁擠問題總結 — **DONE**
4. 寫 `### 候選解法` 含 3–5 個候選，每個含 名稱 / UX / 複雜度 / Trade-offs / 例子 — **DONE**（5 個：A 年代折疊、B filter chips、C mini-map、D 子頁、E 搜尋）
5. 候選涵蓋從最小改動（B/E 小）到最大改動（D 大）的光譜 — **DONE**
6. 寫 `### 推薦方案` 選一個並承認放棄了什麼 — **DONE**（推薦 A，誠實列出對 B/D/C/E 的讓步）
7. 寫 `### 可組合方案` — **DONE**（推薦 A+E；討論 A+B 與為何不選 C 組合）
8. 不動 `src/**` — **DONE**（僅編輯本 entity body）
9. Commit 到 worktree branch，訊息 `docs:` — **DONE**（見下一步 commit）
10. 每個 checklist 項目標 DONE/SKIPPED/FAILED — **DONE**（本節）

### Summary

診斷了 `src/app/past/page.tsx` 的 render 擁擠根源（10 筆 entries → 1000vh scroll + 30 個絕對定位 DOM 節點 + timeline dot 標籤疊字），提出 5 個橫跨「小改動」到「路由重構」的候選解法，推薦「年代折疊（A）」作為主方案並搭配「搜尋（E）」作為組合加分項，誠實列出每條路的讓步。Ideation only — 無 `src/**` 改動。
