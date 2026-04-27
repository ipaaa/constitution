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
