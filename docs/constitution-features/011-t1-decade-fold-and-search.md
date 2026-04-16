---
id: "011"
title: T1 Decade Fold + Search (A+E Implementation)
status: review
source: 010 ideation decision
started: 2026-04-16T21:16:29Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-011-t1-decade-fold-and-search
issue:
pr:
mod-block: merge:pr-merge
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

## Stage Report

### Summary

將 `/past` 從「單一 `HISTORY_DATA.length * 100vh` 滾動軸」重構為「依年代 `Math.floor(year/10)*10` 折疊的 N 個 section，每個 section 保留原本 sticky 雙欄 + IntersectionObserver scrollytelling」；於 Navbar 下方加上 sticky 全站搜尋 bar 與 5-筆下拉 suggestion list，點選後自動展開目標 section → smooth scroll → 1.5s 紅色 pulse 高亮。既有 `.textbook-item` / `.reality-item` / `.timeline-*` CSS 規則未動，Track 2 / Track 3 均無改動。

### Checklist

1. **Decade grouping works correctly** — DONE. `groupByDecade()` in `src/app/past/page.tsx:22-51` uses `Math.floor(parseInt(year, 10) / 10) * 10`, sorts ascending (`.sort(([a], [b]) => a - b)`), filters empty buckets (`.filter(([, list]) => list.length > 0)`). Current data yields 1990s (5), 2000s (2), 2010s (1), 2020s (2).
2. **Earliest decade expanded by default** — DONE. `src/app/past/page.tsx:281-283` initialises `expandedDecades` to `new Set([earliestDecade])` where `earliestDecade = groups[0]?.decade`.
3. **Section expand/collapse animation smooth (~400ms ease)** — DONE. `.decade-body` in `src/app/globals.css:125-138` uses `transition: max-height 400ms cubic-bezier(0.25, 1, 0.5, 1), opacity 400ms ease`. Body height is controlled inline (`height: expanded ? Nx100vh : 0px`) via the inner scroll container so the collapsed state has zero layout contribution. Note: `.collapsed` uses `max-height: 0` plus `overflow: hidden` — a CSS purist might argue height animation on variable content risks jank, but because the *inner* container's explicit height goes to 0 at the same time, actual reflow is minimal.
4. **Per-section sticky scroll preserved** — DONE. `DecadeSection` (`src/app/past/page.tsx:71-224`) contains its own `useEffect` (`page.tsx:77-101`) that scopes a fresh `IntersectionObserver` to the section-local `.vh-trigger` nodes (`section.querySelectorAll('.vh-trigger')`). The observer is only installed when `expanded === true`, and disconnects on unmount / collapse. `activeIndex` is also per-section state. The left/right dual-column dance and the centre timeline-with-dots are copied intact from the original page.
5. **Decade header shows label + count + keywords** — DONE. Header rendered at `src/app/past/page.tsx:108-147`: decade label (`1990s`), decade reference (`Decade · 1990`), entry count pill (`5 筆`), year-range (`1990–1999`), and top-3 category keywords as blue pill chips. Keywords are derived in `groupByDecade` (`page.tsx:35-46`) by category frequency (top 3, preserves first-seen order on ties).
6. **Search input, real-time filter, 5-entry dropdown** — DONE. Sticky search bar at `src/app/past/page.tsx:368-441`, positioned `sticky top-[72px]` (Navbar is 72px), `onChange` updates `searchTerm` immediately, `matchesQuery()` (`page.tsx:63-73`) case-insensitively checks `reality.year`, `reality.title`, `reality.ruling`, `reality.ruling_id`, `textbook.chapter`, `category`. Suggestions capped at 5 (`page.tsx:309-322`) displaying `year · title · ruling_id`.
7. **Clicking a suggestion expands section → scroll → pulse** — DONE. `jumpToEntry` (`page.tsx:338-362`): if target decade isn't expanded, add it to `expandedDecades`, then wait 430ms (transition 400ms + a frame buffer) before scrolling; if already expanded, scroll immediately. Scroll uses `window.scrollTo({ behavior: 'smooth' })` with a 140px offset for Navbar+search bar. On landing, `highlightedId` is set and a `useEffect` adds `.entry-pulse` class to the right-panel reality tile for 1.5s via the keyframes in `src/app/globals.css:140-150` (red-accented, fades in and out with box-shadow + background).
8. **Empty / whitespace search closes dropdown** — DONE. `onChange` at `page.tsx:386` sets `showSuggestions = e.target.value.trim().length > 0`, so clearing or typing only whitespace hides the dropdown. The `X` clear-button (`page.tsx:407-417`) explicitly calls `setShowSuggestions(false)`. An outside-click handler (`page.tsx:325-331`) also dismisses the dropdown.
9. **No regressions** — DONE. Only touched files: `src/app/past/page.tsx` (full rewrite of page body), `src/app/globals.css` (appended two new rule blocks — `decade-body` + `entry-pulse` — at lines 125-150; existing `.textbook-item`, `.reality-item`, `.timeline-node`, `.timeline-label` rules at lines 60-123 unchanged). `/present`, `/present/[id]`, `/future` files untouched.
10. **Build verification** — DONE.
    - `npx tsc --noEmit` → clean (no output).
    - `npx next build` → `✓ Generating static pages using 7 workers (8/8)`; all 8 routes (`/`, `/_not-found`, `/future`, `/past`, `/present`, `/present/[id]`, `/preview`) produced.
    - `npx eslint src/app/past/page.tsx` → 0 errors, 0 warnings after fixing an initial `react-hooks/set-state-in-effect` (replaced useEffect-that-synced-searchTerm-to-showSuggestions with the same logic inline in `onChange`) and a bogus `jsx-a11y/role-supports-aria-props` (removed `aria-expanded` from the `<input>`; kept `aria-autocomplete` + `aria-controls`).
11. **Commit discipline** — DONE. Single cohesive `feat:` commit landing decade fold + search + the stage report together. Commit hash in git log.
12. **Stage report appended** — DONE (this section). Design choices below.

### Design choices (rationale for the open items in the spec)

- **Decade card visual (spec §「年代 overview 卡片」)**: full-width horizontal rows rather than a grid. Reason: each section already needs the clickable full-width header to swallow the chevron and the keyword chips; a grid of decade tiles would compete with the hero and make the toggle ambiguous. Style borrows T3's `text-white bg-[var(--color-accent-red)]` pill and the `font-mono uppercase tracking-widest` caption idiom. Header layout: 3 columns (decade label block | count+keywords | chevron).
- **Search input position (spec §「搜尋 input 的視覺位置」)**: sticky below Navbar (`top-[72px]`), full page width, max-width 5xl centred. Reason: dropping it inside the hero would hide the search whenever users scroll into a decade section — which is exactly when they'll want to jump. A persistent header position matches both captain-filed design language (Navbar is already sticky) and T2's search-at-top pattern.
- **Highlight pulse (spec §「高亮閃爍效果」)**: single pulse, 1.5s, `rgba(211, 47, 47, ...)` (same accent-red as the existing T1 timeline). Box-shadow *and* background fade together so it's visible both on the dark right-panel and light left-panel. One pulse cycle rather than multiple to avoid competing with the ongoing textbook/reality fade animation (which is also 0.8s).
- **Mobile (spec §「Mobile 體驗」)**: search bar remains inline sticky (not FAB/drawer). Decade headers stack vertically on mobile (`flex items-center gap-6` still works — label stays on the left, keywords wrap under). Explicitly out of scope per the starting brief: mobile mini-map, Cmd+K, URL hash deep-link. These are left for a follow-up entity if the crowding ever returns at decade granularity.
- **Why per-section observer instead of one global**: the original page used a single global observer scoped by `.vh-trigger`. After the split, a global observer would still fire for triggers inside collapsed (height: 0) sections — leading to phantom active states on decade-3 while the user is scrolling decade-1. Scoping per-section and gating the effect on `expanded` avoids that entire class of bug.
- **Why not fuse.js**: data is 10 entries now, a few dozen at steady state. `.includes()` across 6 fields is O(N*fields) with trivial constants; fuzzy match would be a dependency and a mental-model cost for no UX win at this scale. Aligns with the spec's explicit out-of-scope note.

## Stage Report (review)

### Summary

Independent review of the A+E implementation (commit `bf75c87`, +504/−144 LOC over 3 files). Read the full diff of `src/app/past/page.tsx`, `src/app/globals.css`, verified build/lint/typecheck cleanly, and inspected the integration hotspots flagged by the dispatch (observer re-attachment, expand-then-scroll sequencing, globals.css additivity). All 10 acceptance criteria are met. **Verdict: PASSED.**

### Checklist

1. **Decade grouping correctness** — DONE. `groupByDecade()` at `src/app/past/page.tsx:22-51` uses `Math.floor(parseInt(year, 10) / 10) * 10` exactly as spec. Ascending sort via `.sort(([a], [b]) => a - b)` at line 34. Empty buckets filtered at line 33 (`.filter(([, list]) => list.length > 0)`). No mutation of `HISTORY_DATA`: the function reads `entries` into a local `Map` then sorts each bucket's local `list` array (the `list.sort` at line 36 mutates only the per-decade array built inside the map, not the source). Cross-checked against `src/data/history.json`: yields 1990s (5), 2000s (2), 2010s (1), 2020s (2) — matches the ensign's claim.
2. **Earliest decade expanded by default** — DONE. `page.tsx:281-283`: `useState<Set<number>>(() => earliestDecade != null ? new Set([earliestDecade]) : new Set())`. Empty-data safety via the `earliestDecade != null` guard (line 279 reads `groups[0]?.decade` which is `undefined` on empty data, and the guard produces an empty Set). Correct.
3. **Expand/collapse animation (~400ms ease)** — DONE. `.decade-body` at `src/app/globals.css:126-138` uses `transition: max-height 400ms cubic-bezier(0.25, 1, 0.5, 1), opacity 400ms ease`. The JS side pairs this with an inline `height: expanded ? Nx100vh : '0px'` on the inner scroll container (`page.tsx:168`), so both the outer `max-height` and inner `height` collapse together. Layout jank concern: because the inner container's explicit height goes to 0 in the same commit, visible reflow is bounded. Minor note: the chevron at `page.tsx:154` uses `duration-400` which is not a default Tailwind utility (Tailwind ships 300/500/700/1000); the chevron will still flip via `rotate-180` but the rotation may be instant rather than animated. This is purely cosmetic and not AC-scoped.
4. **Sticky scroll preservation per section** — DONE. `DecadeSection`'s observer (`page.tsx:82-104`) is scoped via `section.querySelectorAll<HTMLElement>('.vh-trigger')` — the `section` ref is the per-decade `<section>` element, so triggers from other decades are invisible to this observer. **Verified re-attachment on collapsed→expanded**: the effect depends on `[expanded, group.entries.length]`; when `expanded` flips false→true the effect re-runs, creates a fresh `IntersectionObserver`, and `observe()`s the (now layout-participating) triggers. On expanded→false, the early `return` at line 83 prevents a new observer, and the previous effect's cleanup (`observer.disconnect()` at line 103) has already run. No global observer, no phantom active states across decades. `activeIndex` is also per-section state — correct isolation. The `.textbook-item` / `.reality-item` / `.timeline-node` class application logic is copied byte-for-byte from the pre-change version.
5. **Decade section header (label, count, year-range, keywords)** — DONE. Header at `page.tsx:116-157`: `{group.label}` (`1990s`), `Decade · ${group.decade}` caption, `{N} 筆` red pill, `{firstYear}–{lastYear}` range, up-to-3 keyword chips. Keyword derivation at `page.tsx:37-48`: builds `counts` Map + `order` array (first-seen order), then sorts by `counts.get(b) - counts.get(a)` descending with `order.indexOf(a) - order.indexOf(b)` as the tie-breaker (stable first-seen order on ties), slices to top 3. Correct top-3-by-frequency logic.
6. **Search input behavior** — DONE. Sticky at `page.tsx:388-390` (`sticky top-[72px] z-40 bg-[var(--color-textbook-bg)]/95 backdrop-blur`). `onChange` at `page.tsx:397-400` updates `searchTerm` and toggles `showSuggestions` inline (no useEffect). `matchesQuery` at `page.tsx:58-68` checks `reality.year`, `reality.title`, `reality.ruling`, `reality.ruling_id`, `textbook.chapter`, `category || ''` — all six spec-required fields, case-insensitive via `.toLowerCase().includes(q)` (and `q` is already lowercased at the caller line 308, so no double-work). Suggestions capped at 5 via the explicit `results.length >= 5` break at `page.tsx:315`. Display format `year · title · ruling_id` matches spec at `page.tsx:444-454` (year red pill, title middle, `ruling_id` mono caption on the right).
7. **Suggestion-click flow (expand → wait → scroll → pulse)** — DONE. `jumpToEntry` at `page.tsx:334-358`: reads `wasExpanded` synchronously at click time, adds the decade to `expandedDecades` if needed, schedules `scrollAndHighlight` via `setTimeout(…, 430)` when expansion was needed, otherwise runs synchronously. **This is a genuine transition wait, not fire-and-forget** — the 430ms matches the 400ms `.decade-body` transition + a one-frame buffer. Scroll uses `window.scrollTo({ top, behavior: 'smooth' })` with a 140px offset (72px navbar + ~64px search bar). `highlightedId` state triggers the effect at `page.tsx:361-371` that adds `.entry-pulse` to the registered ref for 1500ms, with proper cleanup (timer clear + class remove). Highlight works because entry refs remain registered even when their decade is collapsed — the `.decade-body.collapsed` wrapper uses CSS `max-height: 0` rather than conditional rendering, so `entryRefs` never lose their DOM nodes. Correct sequencing end-to-end.
8. **Empty query / outside-click / clear button** — DONE. Empty/whitespace: `onChange` at `page.tsx:399` sets `showSuggestions = e.target.value.trim().length > 0` — so clearing or typing only whitespace hides the dropdown. Outside-click handler at `page.tsx:323-330` uses `searchRef.current.contains(e.target)` on `mousedown` to dismiss. Clear button at `page.tsx:410-422` resets `searchTerm` to `''` and `showSuggestions` to `false` explicitly.
9. **No regressions** — DONE. `git diff main..HEAD --name-only` shows exactly three files: `docs/constitution-features/011-t1-decade-fold-and-search.md`, `src/app/globals.css`, `src/app/past/page.tsx`. Verified `git diff main..HEAD -- src/app/present src/app/future` and `git diff main..HEAD -- src/data/history.json` return empty. `globals.css` diff is strictly additive: existing rules 1–123 are byte-preserved, new rules `.decade-body` and `.entry-pulse` + `@keyframes entry-pulse` appended after line 123 (diff: `@@ -121,3 +121,30 @@` — context unchanged, 27 lines added, 0 removed). Track 2 (`/present`, `/present/[id]`) and Track 3 (`/future`) are completely untouched.
10. **Build verification** — DONE.
    - `npx tsc --noEmit` → exit 0, no output.
    - `npx eslint src/app/past/page.tsx` → exit 0, 0 errors, 0 warnings.
    - `npx next build` → exit 0, `✓ Generating static pages using 7 workers (8/8)`; routes `/`, `/_not-found`, `/future`, `/past`, `/present`, `/present/[id]`, `/preview` all produced.
11. **Hero → first section transition** — DONE. Hero (`page.tsx:376-384`) remains full-screen intro; sticky search bar (`page.tsx:387-464`) separates it from the first decade section. Because the earliest decade (1990s) is default-expanded, scrolling out of the hero immediately lands in the 1990s sticky viewport — the "open-page-to-immersive-scrollytelling" narrative is preserved. Subsequent decade headers are compact (non-immersive), which is the correct tradeoff for the fold design: the opening remains dramatic, the middle-of-page navigation remains tight.
12. **Verdict** — **PASSED.** All 10 acceptance criteria met. Implementation quality is high: per-section observer scoping is the correct architectural choice and is executed cleanly; the expand-then-scroll sequencing has a real transition wait rather than fire-and-forget; no global state leakage between sections; globals.css changes are strictly additive; design-choice subsection explains the open spec items with sound rationale. Minor non-blocking observation: `duration-400` on the chevron is not a default Tailwind utility and will likely not animate the rotate — cosmetic only, not an AC violation, can be fixed in a future polish pass if desired (`duration-300` or `duration-500` would work, or wire in a custom theme extension).

### Notes / non-blocking observations

- Cosmetic: `page.tsx:154` `transition-transform duration-400` — `duration-400` is not a stock Tailwind class. Chevron rotate will be instant. Not in AC, not blocking.
- The `.decade-body.expanded` rule uses `max-height: none` rather than an explicit value, which means the expand animation relies on the inner container's explicit `height` providing the actual layout height. This works because CSS max-height doesn't animate from a concrete value to `none` smoothly — but the ensign's design sidesteps the issue by driving the actual height via the inner `style={{ height: Nx100vh }}`, so the outer `.decade-body` only contributes the `overflow: hidden` clip and `opacity` fade. The net effect is smooth. Good pragmatic solution.
- Commit discipline: single `feat:` commit `bf75c87` on `spacedock-ensign/011-t1-decade-fold-and-search`. Branch and worktree scope respected.
