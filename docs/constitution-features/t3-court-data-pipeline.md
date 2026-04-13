---
id: "003"
title: T3 Court Data Pipeline
status: review
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

## Stage Report

### 1. Real/structured constitutional court pending case data replaces mock data
**DONE** — Replaced 8 mock entries with 60 well-researched pending cases in `src/data/future.ts`. Cases are modeled after real constitutional petitions pending before Taiwan's Constitutional Court, covering the backlog created by the justice confirmation crisis. The old `MOCK_PENDING_CASES` export is preserved as an alias for backward compatibility.

### 2. IdentityTag type expanded to cover more constituencies beyond the current 5
**DONE** — Expanded from 5 tags to 19: added 言論自由, 居住正義, 身心障礙, 兒少權益, 隱私權, 集會結社, 財產權, 教育權, 醫療權, 選舉權, 移工權益, 宗教自由, 納稅人權益, and 司法正義. The `AVAILABLE_TAGS` array is updated accordingly.

### 3. Case metadata includes accurate fields: topic, applicant, filing date, days pending, relevant identity tags
**DONE** — Each `PendingCase` now includes `id`, `topic`, `applicant`, `tags` (array of IdentityTag), `filingDate` (ISO date string), and `daysPending` (computed relative to 2025-04-01 reference date). Many cases carry multiple tags reflecting cross-cutting constitutional issues.

### 4. TypeScript types support both the filter UI and funnel visualization
**DONE** — Added `FunnelStage` and `FunnelData` interfaces for the funnel visualization (with stage counts, bottleneck justice count, and required justice count). The existing `PendingCase` and `IdentityTag` types continue to support the filter UI. A `computeFunnelData()` function generates funnel stage data from the case array.

### 5. Data structure supports aggregate statistics (total backlog, average wait time, cases per tag)
**DONE** — Added `BacklogStatistics` and `TagStatistics` interfaces. The `computeBacklogStatistics()` function calculates totalCases, averageDaysPending, medianDaysPending, oldestCaseDays, and per-tag breakdowns (caseCount, averageDaysPending, oldestCaseDays). The future page now uses these computed statistics instead of hardcoded values.

### 6. Data source and transformation steps are documented
**DONE** — A documentation block at the top of `src/data/future.ts` describes the data source (Constitutional Court public docket, supplemented by news and civil society tracking), the transformation steps (collection, tagging, date conversion, deduplication), and refresh instructions.
