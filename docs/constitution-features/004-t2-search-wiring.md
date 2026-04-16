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
pr: #3
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

## Stage Report (review)

### Summary
Independent review of the T2 search-wiring implementation on branch `spacedock-ensign/t2-search-wiring` (commit `b89b8fa`). All six acceptance criteria verified directly against `src/app/present/page.tsx`. Typecheck clean; ESLint reports only two pre-existing warnings that also exist on `main`. No regressions detected — only `src/app/present/page.tsx` was modified; Track 1 page, shared components, and data are untouched. **Verdict: PASSED.**

### Checklist

1. **AC1 — useState wiring — DONE.** `const [searchTerm, setSearchTerm] = useState('')` at `src/app/present/page.tsx:337`; the input binds `value={searchTerm}` at `src/app/present/page.tsx:380` and `onChange={(e) => setSearchTerm(e.target.value)}` at `src/app/present/page.tsx:381`. `'use client'` directive correctly added at line 1 since `useState`/`useMemo` require a client component. `aria-label` added at line 382 is a small accessibility bonus.
2. **AC2 — title/author/abstract, case-insensitive — DONE.** `filteredData` `useMemo` at `src/app/present/page.tsx:350-358` lowercases the query once (`q = searchTerm.trim().toLowerCase()` at line 351) and tests each of `item.title.toLowerCase()`, `item.author.toLowerCase()`, `item.abstract.toLowerCase()` against `.includes(q)` at lines 354-356. Data schema confirmed to carry these fields on every record (`src/data/discussions.json`).
3. **AC3 — real-time keyup/onChange, no Enter — DONE.** The input uses React's `onChange` at `src/app/present/page.tsx:381`, which fires on every keystroke. No `<form>` wraps the input, no `onSubmit`/`onKeyDown` gate exists, and the adjacent `Search`-icon `<button>` at lines 384-386 has no `onClick` handler — it is purely decorative and does not mediate the filter, so users never need to press Enter or click it.
4. **AC4 — sticky/date sort preserved within filtered set — DONE.** `sortDiscussions()` logic (sticky first, then `b.year.localeCompare(a.year)`) at `src/app/present/page.tsx:340-346` is unchanged. It is now applied to the filtered slices `scholarItems` / `ngoItems` / `reelItems` at call sites `src/app/present/page.tsx:419,436,453`. Sticky items that survive the filter remain pinned; sort ordering is preserved inside the filtered view.
5. **AC5 — empty query restores full list — DONE.** `if (!q) return DISCUSSIONS_DATA;` at `src/app/present/page.tsx:352`, where `q` is `searchTerm.trim().toLowerCase()` — a whitespace-only input trims to the empty string and short-circuits to the unfiltered dataset, so counts and cards return to their original state.
6. **AC6 — category headers show filtered count — DONE.** `{scholarItems.length} Articles` at `src/app/present/page.tsx:415`, `{ngoItems.length} Articles` at `src/app/present/page.tsx:432`, `{reelItems.length} Videos` at `src/app/present/page.tsx:449`. Each count is derived from the filtered slice (built at lines 360-362), so headers live-update with the query.
7. **No regressions — DONE.** `git diff main..HEAD --name-only` reports only `src/app/present/page.tsx` as source-modified (the other two files are stage docs). Track 1 (`src/app/page.tsx`) and Track 3 (`src/app/future/page.tsx`) untouched. `ScholarCard`, `NGOCard`, `ReelCard`, `VibeTag`, `JudgeOwlComment`, `OfficialTLDR`, `CourtTimeline`, and `NarrativeLoopFooter` not in the diff — card rendering, owl comments, vibe tags, and TL;DR unchanged. `OfficialTLDR` still reads from the raw `DISCUSSIONS_DATA` at `src/app/present/page.tsx:402`, so the TL;DR block stays visible regardless of search state (correct — it's a curated summary, not a search result).
8. **Code-quality assessment — DONE.** `'use client'` is the correct app-router switch when introducing client state. The `useMemo` dependency array `[searchTerm]` at `src/app/present/page.tsx:358` is exhaustive — `DISCUSSIONS_DATA` is a module-scope constant and does not need to be listed. TypeScript types complete: no new `any` introduced; the `onChange` handler's event parameter is implicitly typed as `React.ChangeEvent<HTMLInputElement>` via JSX. Styling is Tailwind-only (no inline styles added). Minor observation, not a blocker: `scholarItems`/`ngoItems`/`reelItems` at lines 360-362 are recomputed on every render rather than memoized — fine given the small dataset and cheap `.filter` calls.
9. **Typecheck & lint — DONE.** `npx tsc --noEmit` in the worktree: zero output, zero errors. `npx eslint src/app/present/page.tsx` reports 0 errors and 2 warnings — `DiscussionCategory` unused (line 7) and `<img>` element (line 89). Both verified as **pre-existing on `main`** by running ESLint against the main-branch copy of the file (also returns the same 2 warnings at the corresponding pre-edit lines 4 and 86). No new warnings introduced by this change.
10. **Verdict — PASSED.** Rationale: Every acceptance criterion (AC1–AC6) is implemented correctly and directly verifiable in the diff. Typecheck is clean, no new lint warnings, no regressions outside the targeted file. The implementation follows project conventions (app-router client component, Tailwind, hooks) and the `useMemo` memoisation is appropriate for this filter.
