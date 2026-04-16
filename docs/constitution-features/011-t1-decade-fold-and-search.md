---
id: "011"
title: T1 Decade Fold + Search (A+E Implementation)
status: implement
source: 010 ideation decision
started: 2026-04-16T21:16:29Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-011-t1-decade-fold-and-search
issue:
pr:
---

實作 010 ideation 報告中 captain 選定的 **A + E 組合方案** — 把 `/past` 頁面從「全部 entries 擠在一條 scroll 軸」重構為「依年代折疊 section + 全站搜尋」。

背景與完整方案討論請見 `docs/constitution-features/_archive/010-t1-timeline-crowding.md`（ideation + review 報告）或 `Documents/t1-timeline-options.md`（給夥伴討論用的精煉版本）。

### 範圍

本次實作涵蓋 **A 年代折疊 + E 搜尋** 的完整整合，不是兩個獨立功能疊加 — 搜尋命中時要能自動展開目標年代 section。

#### A 部分：年代折疊

- 把 `src/app/past/page.tsx` 的頂層結構從「單一 scroll 容器（`HISTORY_DATA.length * 100vh`）」重構為「每個年代一個 collapsible section」
- 年代分組在 component 內做 `groupBy(entry => Math.floor(parseInt(entry.reality.year) / 10) * 10)`，**不修改** `src/data/history.json` 的 schema
- 每個 section 內部沿用現有 sticky + IntersectionObserver + 左右雙欄動畫（`globals.css:60-78` 的 `.textbook-item` 狀態 class 不動）
- Section scroll 高度 = `sectionEntries.length * 100vh`
- Hero → 第一個 section 的銜接需要設計：**第一個年代（最早的）預設展開**（保留部分「開頁即沉浸」感），其他預設收合
- Collapsible 動畫：smooth ease，約 400ms
- 年代 overview 卡片（每個 section 的 header）顯示：年代（e.g. `1990s`）+ 筆數 + 該年代主題關鍵字（從 entries 的 category 取 top 2–3）

#### E 部分：搜尋

- 頁首加一個 search input（sticky、scroll 時常駐）
- 比對欄位：`reality.year`, `reality.title`, `reality.ruling`, `reality.ruling_id`, `textbook.chapter`, `category`（如 schema 有）
- 即時 filter（onChange 觸發，不需 Enter）+ 下拉 suggestion list（最多 5 筆）
- 點選 suggestion → smooth-scroll 到該 entry + 著陸時短暫高亮閃爍（約 1.5 秒）
- **整合點**：若目標 entry 所在年代 section 是收合狀態，先展開 section 再 scroll
- 空查詢 → 關閉 suggestion list，恢復正常瀏覽

### 不在本次範圍內

- 把「分段維度」從年代改成「主題」或「憲法條號」（如果之後要改，是獨立 entity）
- Cmd+K palette 的快捷鍵綁定（純 input 搜尋就好；之後可另加）
- Fuse.js fuzzy matching（現在 10–30 筆 `.includes()` 夠用）
- 導覽列的其他頁面連結調整（`/past` URL 不變）
- Mobile mini-map / drawer 替代方案

### Acceptance criteria

1. **年代分組正確**：groupBy 結果穩定、年代排序正確（升序從最早到最晚）、空年代不 render
2. **預設展開第一個年代**：首次進入頁面即可看到最早年代的 entries，不需額外點擊
3. **Section 收合 / 展開動畫** smooth，無視覺跳動
4. **Sticky scroll 體驗保留**：在 section 展開狀態下，原本的 IntersectionObserver + 左右雙欄動畫仍正常運作
5. **每個 section header** 顯示：年代標題、該年代筆數、主題關鍵字
6. **搜尋輸入即時 filter**：輸入時下拉 suggestion list，最多 5 筆，顯示 `year · title · ruling_id`
7. **點選 suggestion 跳轉**：若目標 section 收合，先展開；smooth-scroll 到對應 entry；著陸時閃爍高亮 ~1.5s
8. **空搜尋** 清除 suggestion、不影響正常瀏覽
9. **無 regressions**：Track 2 (`/present`, `/present/[id]`) 和 Track 3 (`/future`) 完全不受影響；`src/app/globals.css` 中的其他 CSS 規則不動
10. **Build 驗證**：`npx tsc --noEmit` 清潔、`npx next build` 8 個 static pages 正常生成

### 技術實作重點

- **Scroll 容器重構**：主容器不再用單一 `HISTORY_DATA.length * 100vh`；改為由每個展開中的 section 各自計算高度，整頁高度是 sections 的加總（或用 CSS grid / flow 自然堆疊）
- **IntersectionObserver scope**：觀察對象從全局 scroll triggers 改為每個 section 內部的 triggers；section 收合時 observer 可暫停或 unobserve
- **Search & section 整合**：搜尋結果跳轉時需要先呼叫目標 section 的展開方法（保留展開狀態），等待 transition 完成後才 scroll
- **State 管理**：`useState<Set<decade>>(expandedDecades)` 管理哪些年代是展開的；初始值是 `new Set([最早年代])`
- **URL / deep-link（nice-to-have，非 AC）**：若有時間，可支援 `#1990s` hash 來深連結到某年代，但不是必要

### 需要工程實作者做的設計細節

- **年代 overview 卡片視覺**：是 full-width stacked 還是 grid？用什麼字體大小、顏色、spacing？可以參考 001 (design-t3-page) 已經上的 T3 卡片風格
- **搜尋 input 的視覺位置**：頁首 right-aligned？hero 下方？sticky header 內？
- **高亮閃爍效果**：用哪個 Tailwind 色階、持續多久、幾次 pulse？
- **Mobile 體驗**：年代卡片在小螢幕怎麼排？搜尋 input 在手機上是否改為 drawer / FAB？（可合理取捨）

以上可自行判斷並在 stage report 裡說明選擇理由。
