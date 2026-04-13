---
id: "003"
title: T3 Court Data Pipeline
status: implement
source: commission seed
started: 2026-04-13T16:16:43Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-t3-court-data-pipeline
issue:
pr:
---

Replace the mock data in `src/data/future.ts` with real/structured constitutional court pending case data.

The current `MOCK_PENDING_CASES` array has ~30 hand-written entries with limited tags. This feature should:
- Source real pending case data from constitutional court public records (or a well-researched structured dataset)
- Expand the `IdentityTag` type to cover more constituencies beyond the current 5
- Include accurate case metadata: topic, applicant, filing date, days pending, relevant identity tags
- Provide proper TypeScript types that support both the filter UI and the funnel visualization
- Structure the data to support aggregate statistics (total backlog, average wait time, cases per tag)
- Document the data source and any transformation steps so the pipeline can be refreshed
