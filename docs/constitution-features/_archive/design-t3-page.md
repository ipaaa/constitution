---
id: "001"
title: Design T3 Page
status: complete
source: commission seed
started: 2026-04-13T16:16:43Z
completed: 2026-04-14T15:20:56Z
verdict: PASSED
score: 1.0
worktree: 
issue:
pr: #2
---

Build the Track 3 "Future" page (憲庭載入中 / "Court is Loading") using real constitutional court data and the bottleneck funnel metaphor. The page should make the abstract crisis of a paralyzed court feel personal and urgent.

Key elements:
- **Rights Calculator Filter** — Users select identity tags (勞工, 性別, 原住民, 刑事被告, 環境保護, etc.) to instantly filter which pending cases affect them. Expand beyond the current 5 tags to cover more constituencies.
- **Bottleneck Funnel Visualization** — A Sankey/flow diagram showing the mass of pending cases funneling through only 5 active justices during the rehabilitation period. Cases should appear as animated dots or particles flowing through the narrow bottleneck.
- **Case Detail Cards** — Filtered cases display as cards with topic, applicant, days pending, and relevant tags. Longer-pending cases should feel visually heavier/more urgent.
- **Crisis Framing** — The page narrative should frame the 5-justice constraint as a systemic bottleneck, not just a number. Show estimated processing time, case backlog depth, and what rights remain in limbo.

The existing `src/app/future/page.tsx` has a basic tag filter and mock data. This redesign should elevate it into a compelling, data-driven interactive experience consistent with the visual language of Track 1 and Track 2.

## Stage Report

**Reviewer:** review stage (independent assessment)
**Verdict:** PASSED

### 1. Each acceptance criterion from the design spec verified as met or not met

**Rights Calculator Filter** — DONE
- 12 identity tags implemented (expanded from original 5): 勞工, 性別, 原住民, 刑事被告, 環境保護, 言論自由, 居住正義, 身心障礙, 兒少權益, 隱私權, 集會遊行, 稅務財產.
- Tags are colored pills with active/inactive states and a colored dot indicator.
- Selecting tags instantly filters the case cards below and updates the result count.
- Clear-all button appears when filters are active. Uses `forEach` + functional state updater — works correctly with React batching.
- Component: `src/components/future/RightsCalculator.tsx` (80 lines).

**Bottleneck Funnel Visualization** — DONE
- SVG funnel with a wide entry narrowing to a bottleneck zone, 5 justice lane lines inside the bottleneck, and animated circle particles flowing through via `<animateMotion>`.
- Particles are generated client-side (guarded by `mounted` state to avoid SSR hydration mismatch).
- Stats bar above the funnel: pending cases count, active justices (5, with pulsing red indicator), estimated clearance years.
- Capacity progress bar below: shows 5/15 justice capacity with vacancy/quorum annotations.
- Component: `src/components/future/BottleneckFunnel.tsx` (140 lines).

**Case Detail Cards** — DONE
- Each card shows: topic, applicant, days pending (with year conversion), tags (colored), and urgency indicators.
- Visual urgency scaling: border color (red >= 700 days, orange >= 400, default otherwise), top urgency bar width (full/3-4/half/quarter), urgency label text.
- Sort controls: "最久等待" (longest wait first) and "最近提出" (most recent first).
- Component: `src/components/future/CaseCard.tsx` (79 lines).

**Crisis Framing** — DONE
- Dark emergency banner at top with pulsing red dot, "Constitutional Emergency" label, justice count headline, and explanatory paragraph referencing `CRISIS_STATS`.
- Four explanation cards in the "為什麼會這樣？" section covering: legislative personnel blockage, court act amendment, case backlog accumulation, and personal rights impact.
- All stats are centralized in `CRISIS_STATS` constants — no magic numbers.

**Responsive Behavior** — DONE
- Sidebar (RightsCalculator) uses `lg:col-span-4` with `lg:sticky lg:top-24`, stacks above content on smaller screens.
- Case cards grid: `md:grid-cols-2` to `grid-cols-1`.
- Crisis banner and explanation section adapt with `md:` breakpoints.

### 2. Code quality assessment (types, conventions, reusability)

- **TypeScript types:** `IdentityTag` is a union type covering all 12 tags. `PendingCase` interface is clean. `TAG_COLORS` is a `Record<IdentityTag, ...>` ensuring completeness. All component props have explicit interfaces.
- **Conventions:** Files use `'use client'` directive consistently. Component naming and file structure (`src/components/future/`) follows existing patterns (`src/components/Footer.tsx`, `src/components/Navbar.tsx`). Tailwind classes are used throughout, matching T1/T2 styling approach.
- **Reusability:** Components are well-separated with clear prop interfaces. `TAG_COLORS` and `CRISIS_STATS` are centralized in the data file, avoiding duplication across components.
- **Minor note:** `CRISIS_STATS.totalPending` is 142 while `PENDING_CASES` array contains 28 representative entries. The page correctly shows `filteredCases.length` (actual card count) in the cards section header and `filteredCount` (which uses the 142 stat when unfiltered) in the funnel stats. This is a reasonable design choice (representative sample of a larger backlog) but the two different numbers could momentarily confuse users. Not a blocker.

### 3. Any regressions or broken functionality identified

- **No regressions found.** `next build` completes with zero errors across all 8 routes.
- No shared components (`Navbar.tsx`, `Footer.tsx`, `SharedPresent.tsx`) were modified.
- All existing routes (`/`, `/past`, `/present`, `/present/[id]`, `/preview`) compile and generate successfully.
- The only files changed outside `src/components/future/` and `src/data/future.ts` are the page itself (`src/app/future/page.tsx`) and the entity docs.

### 4. Clear PASSED or REJECTED verdict with rationale

**PASSED.** All four design spec requirements (rights calculator filter, bottleneck funnel visualization, case detail cards, crisis framing) are fully implemented with correct TypeScript types, responsive behavior, animated SVG particles, urgency-based visual weight, and centralized data constants. The build succeeds cleanly. No regressions to existing functionality. Code is well-structured and consistent with project conventions.
