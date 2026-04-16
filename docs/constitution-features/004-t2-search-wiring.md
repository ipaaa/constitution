---
id: "004"
title: T2 Search & Filter
status: review
source: codebase audit
started: 2026-04-16T15:57:36Z
completed:
verdict:
score: 0.9
worktree: .worktrees/spacedock-ensign-t2-search-wiring
issue:
pr:
mod-block: merge:pr-merge
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

## Stage Report

### Summary
Wired the existing Track 2 search bar to real-time state-driven filtering. Converted `src/app/present/page.tsx` to a client component (`'use client'`) and introduced a `searchTerm` state plus a memoised `filteredData` that matches against `title`, `author`, and `abstract` case-insensitively. Each category section (Scholar / NGO / Reels) now derives its cards and its header count from the filtered set; the existing sticky-first + year-descending sort is applied after filtering, so sticky items remain pinned within the filtered view. Empty / whitespace-only queries restore the full list. The TL;DR block remains data-agnostic and is unaffected.

### Checklist

1. **Wire the search bar to React state — DONE.** Input binds `value={searchTerm}` and `onChange={(e) => setSearchTerm(e.target.value)}` at `src/app/present/page.tsx:378-381`; state declared in `PresentTrack` at `src/app/present/page.tsx:337`.
2. **Filter by title, author, abstract (case-insensitive) — DONE.** `filteredData` `useMemo` at `src/app/present/page.tsx:350-358` lowercases both the query and each field before `.includes()`.
3. **Real-time filter on keyup/onChange — DONE.** Uses React's `onChange` (fires on every keystroke); no Enter or submit required.
4. **Preserve sticky/date sort within filtered set — DONE.** `sortDiscussions()` (sticky-first, then year descending) is applied to the filtered category slices `scholarItems` / `ngoItems` / `reelItems` (built at `src/app/present/page.tsx:360-362`) at render sites `src/app/present/page.tsx:419,436,453`.
5. **Empty search restores full list — DONE.** `if (!q) return DISCUSSIONS_DATA;` after trimming at `src/app/present/page.tsx:351-352`.
6. **Category section headers show current filtered count — DONE.** `{scholarItems.length} Articles`, `{ngoItems.length} Articles`, `{reelItems.length} Videos` at `src/app/present/page.tsx:415,432,449`.
7. **No regressions — DONE.** `npx tsc --noEmit` passes with zero errors. `npx eslint src/app/present/page.tsx` reports only two pre-existing warnings (unused `DiscussionCategory` import and `<img>` element) — neither was introduced by this change. Track 1 page untouched; Track 2 TL;DR, card rendering, owl comments, vibe tags, and sort logic unchanged.
8. **Project conventions — DONE.** `'use client'` + `useState`/`useMemo` follows the same pattern as `src/app/future/page.tsx`. Tailwind-only styling (no inline styles added). TypeScript types complete: event is inferred as `React.ChangeEvent<HTMLInputElement>` via JSX, no `any` introduced.
9. **Commit on worktree branch — DONE.** `feat:` commit recorded on `spacedock-ensign/t2-search-wiring`.
10. **Stage Report appended — DONE.** This section.
