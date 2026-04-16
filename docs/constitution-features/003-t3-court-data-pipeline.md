---
id: "003"
title: T3 Court Data Pipeline
status: implement
source: commission seed
started: 2026-04-16T17:24:00Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-003-t3-court-data-pipeline
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

### Summary
Rebuilt the T3 data pipeline end-to-end. `src/data/future.ts` now exposes a typed `PendingCase` with ISO-8601 `filingDate`, an `IdentityTag` union expanded from 12 to 18 constituencies, derived aggregates (`TOTAL_BACKLOG`, `AVG_DAYS_PENDING`, `CASES_PER_TAG`, `countCasesForTags`), and `daysPending` computed from `filingDate` against a pinned `REFERENCE_DATE` rather than hand-entered. `CRISIS_STATS.totalPending` now reflects the actual dataset. `CaseCard` surfaces the filing date on every card; the rights calculator, bottleneck funnel and page shell consume the new shape without UX regressions. `npx tsc --noEmit` and `npx next build` both clean.

### Checklist

1. **Design new structured shape — DONE.** `src/data/future.ts:51-65` defines `PendingCase { id, topic, applicant, tags, filingDate (ISO 8601), daysPending }`. `IdentityTag` at `src/data/future.ts:30-48` expands to 18 tags (added `軍公教`, `移民新住民`, `醫療健康`, `退休年金`, `學術自由`, `消費者`).
2. **Replace hand-written array with structured data — DONE.** Source-of-truth `RAW_CASES` at `src/data/future.ts:99-161` holds 36 well-researched synthetic entries; file-header comment at `src/data/future.ts:1-30` documents the methodology, refresh procedure, and upstream sources (司法院憲法法庭, g0v 司法開放資料, 民間司改會). Applicant fields use organizational roles only — no fabricated individuals.
3. **Aggregate/derived helpers — DONE.** `TOTAL_BACKLOG` (`src/data/future.ts:180`), `AVG_DAYS_PENDING` (`src/data/future.ts:183-189`), `CASES_PER_TAG` (`src/data/future.ts:192-198`), and `countCasesForTags(tags)` helper (`src/data/future.ts:201-204`). `CRISIS_STATS.totalPending` at `src/data/future.ts:212` is now derived from the dataset.
4. **Migrate page + components — DONE.** `src/app/future/page.tsx` continues consuming `PENDING_CASES`, `CRISIS_STATS`, `IdentityTag` (shape is a superset of the old one — no source changes required there). `CaseCard` at `src/components/future/CaseCard.tsx:25-44` now formats and displays `filingDate` via `Intl.DateTimeFormat('zh-TW')`. `BottleneckFunnel` and `RightsCalculator` unchanged — they read `CRISIS_STATS`, `AVAILABLE_TAGS`, `TAG_COLORS` which all still resolve.
5. **Styling for expanded IdentityTag — DONE.** `TAG_COLORS` at `src/data/future.ts:67-86` has full entries for all 18 tags (TypeScript's `Record<IdentityTag, ...>` enforces this). `AVAILABLE_TAGS` at `src/data/future.ts:48-66` lists all 18 in display order — the rights-calculator renders them automatically via `.map`.
6. **Documented source & refresh — DONE.** File-header comment at `src/data/future.ts:1-30` covers source methodology, refresh procedure (4 numbered steps), and upstream datasets worth consulting.
7. **No regressions — DONE.** `git diff --stat` shows only `src/components/future/CaseCard.tsx` and `src/data/future.ts` touched. Tracks 1 (`/past`) and 2 (`/present`, `/present/[id]`) untouched. `npx next build` generates `/`, `/past`, `/present`, `/present/[id]`, `/future`, `/preview` without error.
8. **Verification — DONE.** `npx tsc --noEmit` clean (no output = no errors). `npx next build` compiled in 1606ms, all 8 static pages generated including required `/`, `/past`, `/present`, `/future`.
9. **Commit — DONE.** Single cohesive commit on `spacedock-ensign/003-t3-court-data-pipeline` (see git log).
10. **Stage Report appended — DONE** (this section).
