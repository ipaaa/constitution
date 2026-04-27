---
id: "007"
title: Accessibility Pass
status: review
source: codebase audit
started: 2026-04-27T16:30:08Z
completed:
verdict:
score: 0.6
worktree: .worktrees/spacedock-ensign-007-accessibility-pass
issue:
pr:
mod-block: merge:pr-merge
---

目前整站缺少基本的無障礙支援，作為公民教育網站，應該盡可能讓所有人都能使用。

### 需要處理的項目

**ARIA 標籤：**
- T1 滾動敘事的各段落缺少 `aria-label` 和 `role` 標記
- T2 搜尋欄缺少 `aria-label`
- T3 篩選按鈕缺少 `aria-pressed` 狀態
- 所有互動元素（tag pills、sort buttons）需要 `role="button"` 或語義化 HTML

**鍵盤導航：**
- T1 scroll-telling 無法用鍵盤（上下鍵）瀏覽
- T2/T3 的 tag filter 需要支援 Tab + Enter/Space 操作
- Focus 樣式（focus-visible）需要在所有互動元素上可見

**語義化 HTML：**
- 檢查 heading 層級是否正確（h1 → h2 → h3，不跳級）
- 圖片加 alt text（特別是 T1 的歷史照片和首頁的貓頭鷹）
- 外部連結加 `aria-label` 標示會開新分頁

**色彩對比：**
- 驗證所有文字/背景組合符合 WCAG AA 標準（4.5:1）
- 特別注意 T1 的淺色手寫字和 T3 的灰色系 UI
