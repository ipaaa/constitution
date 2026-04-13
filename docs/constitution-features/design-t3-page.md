---
id: "001"
title: Design T3 Page
status: review
source: commission seed
started: 2026-04-13T16:16:43Z
completed:
verdict:
score: 1.0
worktree: .worktrees/spacedock-ensign-design-t3-page
issue:
pr:
---

Build the Track 3 "Future" page (憲庭載入中 / "Court is Loading") using real constitutional court data and the bottleneck funnel metaphor. The page should make the abstract crisis of a paralyzed court feel personal and urgent.

Key elements:
- **Rights Calculator Filter** — Users select identity tags (勞工, 性別, 原住民, 刑事被告, 環境保護, etc.) to instantly filter which pending cases affect them. Expand beyond the current 5 tags to cover more constituencies.
- **Bottleneck Funnel Visualization** — A Sankey/flow diagram showing the mass of pending cases funneling through only 5 active justices during the rehabilitation period. Cases should appear as animated dots or particles flowing through the narrow bottleneck.
- **Case Detail Cards** — Filtered cases display as cards with topic, applicant, days pending, and relevant tags. Longer-pending cases should feel visually heavier/more urgent.
- **Crisis Framing** — The page narrative should frame the 5-justice constraint as a systemic bottleneck, not just a number. Show estimated processing time, case backlog depth, and what rights remain in limbo.

The existing `src/app/future/page.tsx` has a basic tag filter and mock data. This redesign should elevate it into a compelling, data-driven interactive experience consistent with the visual language of Track 1 and Track 2.

## Stage Report

### 1. All components and pages described in the design spec are implemented
**DONE**
- `src/components/future/RightsCalculator.tsx` — Interactive tag filter with 12 identity tags (expanded from original 5), colored tag pills, result count summary, and clear-all button.
- `src/components/future/BottleneckFunnel.tsx` — SVG funnel visualization with animated particles flowing through a 5-justice bottleneck, stats bar (pending cases / active justices / estimated years), and capacity progress bar.
- `src/components/future/CaseCard.tsx` — Case detail cards with topic, applicant, days pending, tags, and visual urgency indicators (color-coded borders, urgency bar, urgency label) that scale with wait time.
- `src/app/future/page.tsx` — Full Track 3 page assembling all components with crisis banner, responsive sidebar layout, sort controls, and explanation section.

### 2. Data files or type definitions for new data structures are created
**DONE**
- `src/data/future.ts` — Expanded `IdentityTag` union type from 5 to 12 tags. Added `TAG_COLORS` mapping for consistent color theming across components. Expanded `PENDING_CASES` from 8 to 28 detailed cases covering all 12 constituencies. Added `CRISIS_STATS` constants for centralized crisis metrics (total pending, active justices, required quorum, vacancy count, estimated clearance time).

### 3. The feature renders without errors and matches the design's responsive behavior
**DONE**
- `next build` completes successfully with zero TypeScript or compilation errors.
- Rights calculator filter: tag selection instantly filters case cards and updates funnel stats.
- Bottleneck funnel: SVG with animated particles, stats bar, and capacity indicator all render correctly.
- Case detail cards: urgency-based visual weight (border color, bar width, label) differentiates long-pending from recent cases.
- Crisis framing: dark emergency banner with pulsing indicator, 4 explanation cards below the fold.
- Responsive: sidebar stacks above content on mobile, grid adapts from 2-column to 1-column for cards.

### 4. No regressions to existing Track 1/Track 2 functionality
**DONE**
- Navbar, Footer, and layout remain unchanged.
- All other routes (`/`, `/past`, `/present`, `/present/[id]`, `/preview`) build and render as before.
- No shared components were modified; new components are isolated under `src/components/future/`.
