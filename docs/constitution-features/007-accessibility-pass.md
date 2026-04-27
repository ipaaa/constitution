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

## Stage Report

### implement

1. All components and pages described in design spec built — DONE
   - ARIA labels added to all interactive elements: T2 search button, mood widget buttons, article detail share/print buttons, T1 search input (already had aria-label), T1 clear search button (already had aria-label)
   - `aria-pressed` state added to T3 sort buttons (urgency/recent) and all tag filter buttons in RightsCalculator
   - `aria-label` added to nav element in Navbar, footer, scroll sections in T1
   - `aria-hidden="true"` added to decorative icons (ExternalLink, ArrowDown, emojis)
   - `role="img"` with `aria-label` added to T1 background images and T3 SVG funnel
   - Skip-to-content link added to layout for keyboard users

2. Data files or type definitions if design calls for new data structures — SKIPPED (no new data structures needed for accessibility pass)

3. Feature renders without errors, matches responsive behavior from design — DONE
   - `npx next build` passes with zero errors and zero TypeScript issues
   - All pages generate successfully (static and dynamic routes)
   - No visual layout changes; all fixes are additive (ARIA attributes, focus styles, contrast bumps)

4. No regressions to existing Track 1/Track 2 functionality — DONE
   - All existing interactive behavior preserved (search, tag filtering, decade accordion, scroll-telling)
   - Focus-visible styles added via global CSS rule so all interactive elements gain visible focus rings
   - No existing class names or event handlers were removed

5. Follows Next.js app router conventions, Tailwind consistent, TypeScript types complete — DONE
   - All changes use Tailwind utility classes consistently with existing patterns
   - Global focus-visible and skip-link styles added in `globals.css` `@layer base`
   - No new TypeScript types needed; no `any` types introduced

### Summary
Comprehensive accessibility pass across all tracks: added ARIA labels/roles/states to interactive elements, `aria-pressed` to toggle buttons, skip-to-content link, global focus-visible outlines, semantic heading hierarchy fix (Navbar h1 to span, T1 intro h2 to h1), Chinese alt text for images, `aria-label` on external links indicating new tab, and WCAG AA color contrast fixes for T1 handwriting (#1565C0 darkened to #0D47A1) and T3 gray UI (gray-400 bumped to gray-500/600 throughout).
