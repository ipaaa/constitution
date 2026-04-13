---
id: "001"
title: Design T3 Page
status: design
source: commission seed
started:
completed:
verdict:
score: 1.0
worktree:
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
