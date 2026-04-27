---
id: "006"
title: Cross-Track Navigation
status: review
source: codebase audit
started: 2026-04-27T16:30:06Z
completed:
verdict:
score: 0.5
worktree: .worktrees/spacedock-ensign-006-cross-track-navigation
issue:
pr:
mod-block: merge:pr-merge
---

三條軌道目前是各自獨立的體驗，缺少內容層面的跨軌道連結。Documents/architecture.md 描述的是一個「過去→現在→未來」的連貫旅程，但實際上只有 T2 的 Narrative Loop Footer 有簡單的 T1/T3 連結。

需要加強的連結：
- **T1 → T2：** 歷史釋憲案（如釋字 748 同婚）可以連到 T2 相關的現代討論文章
- **T2 → T3：** 正在討論的判決如果涉及待審案件，可以連到 T3 的篩選結果
- **T3 → T1：** 待審案件涉及的權利（如原住民狩獵權）可以回溯到 T1 的歷史判例
- **資料層面：** 需要在 JSON 資料中加入跨軌道的 reference ID（例如 discussions.json 的文章加一個 `related_history_ids` 欄位）

這是一個中期目標，會讓三條軌道從「三個獨立頁面」變成「一個連貫的學習路徑」。

## Stage Report

### Summary
Implemented cross-track navigation linking all three tracks (T1 Past, T2 Present, T3 Future) with curated editorial mappings and a reusable CrossTrackLinks component. Users can now discover related content across tracks: historical rulings link to modern discussions, discussion articles link to historical precedents and pending cases, and pending cases link back to the historical rulings that established their constitutional rights lineage.

### Checklist

1. **All components and pages described in design spec built** — DONE
   - `src/data/cross-track-links.ts`: Cross-track reference mappings (T1<->T2, T2->T3, T3->T1) with lookup helpers
   - `src/components/CrossTrackLinks.tsx`: Reusable component with track-specific styling (badge colors, labels)
   - T1 Past page: CrossTrackLinks rendered in reality panel for entries with related discussions
   - T2 Present detail page: CrossTrackSection showing related T1 history and T3 future case counts
   - T3 Future CaseCard: CaseHistoryLinks sub-component showing related T1 rulings

2. **Data files or type definitions if design calls for new data structures** — DONE
   - Created `cross-track-links.ts` with typed mappings: `HISTORY_TO_DISCUSSIONS`, `DISCUSSION_TO_HISTORY`, `DISCUSSION_TO_CASE_TAGS`, `CASE_TO_HISTORY`
   - `CrossTrackLink` interface exported for consumers
   - Lookup functions: `getLinksForHistory()`, `getLinksForDiscussion()`, `getLinksForCase()`

3. **Feature renders without errors, matches responsive behavior from design** — DONE
   - `npx next build` passes with zero errors
   - CrossTrackLinks component supports `compact` mode for space-constrained contexts (T1 reality panel, T3 case cards)
   - Full mode with descriptions used on T2 detail pages
   - Responsive: truncation on small screens, hidden descriptions on compact mode

4. **No regressions to existing Track 1/Track 2 functionality** — DONE
   - All existing pages render unchanged when no cross-track links exist for an item
   - CrossTrackLinks returns `null` when links array is empty
   - No modifications to existing data structures (history.json, discussions.json, future.ts)

5. **Follows Next.js app router conventions, Tailwind consistent, TypeScript types complete** — DONE
   - Uses Next.js `Link` component for all navigation
   - Tailwind classes consistent with existing track-specific color schemes
   - Full TypeScript typing: `CrossTrackLink` interface, `IdentityTag` import, typed Record mappings
   - No `any` types, no inline styles

---

## Review Stage Report

### Verdict: PASSED

### Summary
Independent review of the cross-track navigation implementation. All acceptance criteria from the design spec are met. The implementation correctly links T1, T2, and T3 through curated editorial mappings with a reusable component. Build passes cleanly, no regressions found.

### Checklist

1. **Each acceptance criterion from design spec verified as met or not met** — DONE

   Design spec requirements and verification:

   - **T1 → T2 (歷史釋憲案 → 現代討論):** MET. `HISTORY_TO_DISCUSSIONS` maps h10 (釋字748 同婚) to d1, d5; h1 (野百合) to d4, d6; h2 (言論自由) to d2; h14 (原住民) to d1. CrossTrackLinks rendered in T1 reality panel in compact mode.
   - **T2 → T3 (討論 → 待審案件):** MET. `DISCUSSION_TO_CASE_TAGS` maps d1, d4, d5 to relevant identity tags. `getLinksForDiscussion()` counts matching pending cases and generates a summary link to /future.
   - **T3 → T1 (待審案件 → 歷史判例):** MET. `CASE_TO_HISTORY` maps 15 case IDs to relevant history entries. CaseHistoryLinks sub-component renders T1 badges in T3 CaseCards.
   - **T2 → T1 (討論 → 歷史脈絡):** MET. `DISCUSSION_TO_HISTORY` maps 8 discussion articles back to historical rulings. CrossTrackSection on T2 detail pages renders these with full descriptions.
   - **Data layer with cross-track reference IDs:** MET. `cross-track-links.ts` provides typed Record mappings and lookup functions. No modifications to existing data files (history.json, discussions.json, future.ts).

2. **Code quality assessment (types, conventions, reusability)** — DONE

   - **Types:** Full TypeScript coverage. `CrossTrackLink` interface exported. `IdentityTag` imported from future.ts. Record types used for all mapping objects. No `any` types.
   - **Conventions:** Follows existing project patterns — `'use client'` directive, Next.js `Link` for navigation, Tailwind utility classes, lucide-react icons. Component naming matches project style (PascalCase).
   - **Reusability:** `CrossTrackLinks` component accepts `links`, `heading`, `compact` props — used across all three tracks with consistent rendering. Track-specific styling via `TRACK_STYLES` lookup table. `getLinksForHistory/Discussion/Case` provide clean data access APIs.
   - **Minor observations:** `CaseHistoryLinks` in CaseCard.tsx is a local component rather than reusing CrossTrackLinks — this is acceptable since it has a more compact layout specific to the card context with inline T1 badges. The history links point to `/past` rather than deep-linking to a specific entry (no anchor/hash), which is a reasonable choice given the T1 page's scroll-based structure.

3. **Any regressions or broken functionality identified** — DONE

   - `npx next build` passes with zero errors (verified).
   - All referenced IDs validated against source data: 4 history IDs in HISTORY_TO_DISCUSSIONS, 6 discussion IDs as values, 8 discussion IDs in DISCUSSION_TO_HISTORY, 15 case IDs in CASE_TO_HISTORY — all exist in their respective data files.
   - CrossTrackLinks returns `null` when links array is empty, so pages without cross-track data render unchanged.
   - No modifications to existing data structures or components beyond adding the new integration points.
   - No regressions identified.

4. **Clear PASSED or REJECTED verdict with rationale** — DONE

   **PASSED.** The implementation fulfills all four cross-track linking directions described in the design spec (T1→T2, T2→T3, T3→T1, T2→T1). Data integrity is sound — all 36+ cross-references resolve to valid IDs. The component architecture is clean with a single reusable CrossTrackLinks component and typed lookup functions. Build succeeds without errors. No regressions to existing functionality.
