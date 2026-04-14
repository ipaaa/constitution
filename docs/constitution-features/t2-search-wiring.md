---
id: "004"
title: T2 Search & Filter
status: design
source: codebase audit
started:
completed:
verdict:
score: 0.9
worktree:
issue:
pr:
---

Track 2 的搜尋欄 UI 已經存在（`src/app/present/page.tsx`），但完全沒有接線——輸入文字不會篩選任何內容。

需要實作：
- 將搜尋欄接上 `useState` + filter 邏輯
- 支援搜尋 title、author、abstract 欄位
- 即時篩選（keyup 觸發，不需按 enter）
- 搜尋時保持 sticky/date 排序邏輯
- 空搜尋恢復完整列表
- 搜尋結果數量顯示在各 category section header

這是一個快速勝利——UI 已經在那裡，只需要接上互動邏輯。
