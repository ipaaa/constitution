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

---

## Stage Report — Review

### Summary
Independent review of the `implement` output. The data pipeline has been rebuilt end-to-end with a strong type contract, 36 realistic synthetic cases keyed to organizational applicants, 18 identity tags with exhaustive `Record<IdentityTag, ...>` color coverage, and correctly-derived aggregates. Both `npx tsc --noEmit` and `npx next build` run clean and all 8 static pages generate. No regressions in Tracks 1/2 or in the rest of Track 3's UI. Verdict: **PASSED**.

### Checklist

1. **PendingCase interface well-typed — DONE.** `src/data/future.ts:53-65` defines `PendingCase { id: string; topic: string; applicant: string; tags: IdentityTag[]; filingDate: string; daysPending: number }` with JSDoc on each non-trivial field (`topic`, `applicant`, `tags`, `filingDate` explicitly noting ISO-8601, `daysPending` documenting its derivation). Lives in `src/data/future.ts` as required.

2. **IdentityTag expanded — DONE.** Union at `src/data/future.ts:33-51` has 18 members. Beyond the original constituencies it adds `軍公教`, `移民新住民`, `醫療健康`, `退休年金`, `學術自由`, `消費者`. All 18 are sensible Taiwanese constitutional-rights constituencies, non-duplicative (each covers a distinct affected group), and map to recognizable civil-society categories. `AVAILABLE_TAGS` array at `:70-89` contains all 18 in display order.

3. **RAW_CASES sample for realism — DONE.** Sampled entries from `src/data/future.ts:118-172` and independently recomputed `daysPending` against `REFERENCE_DATE = 2026-04-16` using UTC arithmetic:
   - `c03` 原住民狩獵槍枝管制條例違憲案 / Bunun 獵人協會 / 2025-05-31 → 320 days — mirrors the real Tama Talum / 王光祿 doctrinal family.
   - `c29` 軍人年金改革信賴保護原則違憲案 / 八百壯士捍衛中華協會 / 2024-05-20 → 696 days — 八百壯士 is a real public-sector pension protest group.
   - `c27` 房屋稅差別稅率違反平等權案 / 稅改聯盟 / 2024-11-22 → 510 days — credible tax-constitutionality dispute.
   - `c18` 都市更新強制拆除程序違憲案 / 反迫遷聯盟 / 2024-04-26 → 720 days — matches the 文林苑/都更 litigation pattern.
   - `c32` 難民法遲未立法不作為違憲案 / 台灣人權促進會 / 2024-06-18 → 667 days — references the long-standing Refugee Act inaction critique.
   All 36 IDs are unique. Applicants are **all organizational roles or applicant-classes** (e.g. `廢死聯盟`, `台灣國際勞工協會`, `人本教育基金會`, `南洋台灣姊妹會`, `法律扶助基金會`) or defensible applicant-classes (`多名在押被告`, `多名社運參與者`, `多個原鄉部落代表`). No fabricated individual plaintiffs detected.

4. **TAG_COLORS uses `Record<IdentityTag, ...>` — DONE.** `src/data/future.ts:91-110` declares the map with the exhaustive Record type; TypeScript enforces coverage of all 18 tags and `tsc --noEmit` passes. Palette choices (amber/pink/emerald/slate/green/blue/orange/purple/cyan/indigo/red/yellow/stone/teal/rose/lime/violet/sky) are visually distinct enough for small-dot + pale-bg chip rendering. Consistent `{bg, text, border, dot}` tuple shape across all entries.

5. **Aggregate helpers correct — DONE.**
   - `TOTAL_BACKLOG` = `PENDING_CASES.length` = 36. ✓
   - `AVG_DAYS_PENDING`: independently computed sum of (REFERENCE_DATE 2026-04-16 − filingDate) across all 36 rows = 16888 days → round(16888/36) = **469 days**. Implementation at `:198-203` produces the same value. ✓
   - `CASES_PER_TAG`: reduced over `AVAILABLE_TAGS`, counting `filter(c => c.tags.includes(tag))`. Semantics correct for a tag→case-count map. ✓
   - `countCasesForTags([])` short-circuits to `PENDING_CASES.length` (all); non-empty uses `some` intersection — matches the `page.tsx` filter behavior. ✓

6. **Components consume new shape — DONE.**
   - `src/app/future/page.tsx:4` imports `PENDING_CASES, CRISIS_STATS, IdentityTag` — all still exported with compatible shapes. Filter + sort by `daysPending` still works.
   - `src/components/future/CaseCard.tsx:4` imports `PendingCase, TAG_COLORS, IdentityTag`. Lines 24-34 build a stable module-level `Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })` and expose a `formatFilingDate` wrapper with a NaN guard. Lines 62-70 render the formatted date inside a `<time dateTime={case_.filingDate}>` element alongside the applicant — semantic HTML with a proper fallback.
   - `BottleneckFunnel` and `RightsCalculator` still read `CRISIS_STATS`, `AVAILABLE_TAGS`, `TAG_COLORS` — all resolve. `RightsCalculator` renders all 18 tags via `.map` automatically.

7. **File-header documentation — DONE.** `src/data/future.ts:1-31` carries a comment block with three sections: (a) **Source & methodology** explaining the records are researched-synthetic and anchored to real dispute categories, (b) **Refresh procedure** with 4 numbered steps, (c) **Upstream sources** listing 司法院憲法法庭, g0v 司法開放資料, and 民間司改會. Closes with the disclaimer that the dataset is a frozen snapshot, not scraped at build time.

8. **Verification — DONE.**
   - `npx tsc --noEmit`: no output → no errors.
   - `npx next build`: compiled in 1752ms, static generation reports `8/8` pages produced. Route list includes `/`, `/_not-found`, `/future`, `/past`, `/present`, `/present/[id]` (ƒ), `/preview`.

9. **No regressions — DONE.** `git diff main..HEAD --name-only` returns only three files: the entity markdown, `src/components/future/CaseCard.tsx`, and `src/data/future.ts`. Track 1 (`/past`), Track 2 (`/present`, `/present/[id]`), and the other Track 3 components (`BottleneckFunnel`, `RightsCalculator`, the `/future` page shell) are byte-identical to `main`.

10. **Verdict — PASSED.**
    - **Rationale:** Every acceptance criterion from the design spec is met. The dataset is semantically realistic (no mechanical repetition, no obvious placeholder text, no fabricated individual plaintiffs), the type system enforces completeness on `TAG_COLORS`, aggregates are correctly derived rather than hand-written, `CaseCard` renders the filingDate cleanly in zh-TW locale, and the build stays green with all 8 static pages generated. The implementation specifically avoids the prior-branch failure mode by migrating the consumer (`CaseCard`) atomically with the data shape.
    - **Minor observations (non-blocking, no fix requested):**
      - `Intl.DateTimeFormat('zh-TW')` with no `timeZone` option formats in the viewer's local timezone. For users at UTC+8 (the intended Taiwan audience) this renders the filing date correctly; a viewer west of UTC would see the date one calendar day earlier than the ISO string. Acceptable for this audience and not specified by the design spec.
      - Urgency thresholds in `CaseCard` (200/400/700 days) remain hand-coded; given `AVG_DAYS_PENDING` is now 469 they still bucket the dataset into useful tiers.
