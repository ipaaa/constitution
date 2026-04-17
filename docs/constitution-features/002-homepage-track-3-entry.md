---
id: "002"
title: Homepage Track 3 Entry
status: review
source: commission seed
started: 2026-04-16T22:13:15Z
completed:
verdict:
score: 0.7
worktree: .worktrees/spacedock-ensign-002-homepage-track-3-entry
issue:
pr:
mod-block: merge:pr-merge
---

Upgrade the homepage Track 3 card from a greyed-out placeholder link to a live, compelling entry point that previews the bottleneck crisis.

Currently the homepage (`src/app/page.tsx`) shows Track 3 as a muted/disabled-looking link with a grey badge. Once the T3 page is built, this card should:
- Show a live mini-preview of the bottleneck state (e.g., "142 cases waiting, 5 justices active")
- Use visual urgency cues consistent with the T3 page design (loading/processing metaphor)
- Match the visual weight and interactivity of the Track 1 and Track 2 entry cards
- Link through to `/future` with a compelling call-to-action

## Stage Report

### Summary
Upgraded the homepage Track 3 card from a muted placeholder to a live crisis entry point. The card now pulls live bottleneck stats (`totalPending`, `activeJustices`, `designatedTotal`) directly from `@/data/future`'s `CRISIS_STATS` — the same source the `/future` page renders — and echoes the `/future` page's dark crisis-banner visual language (gray-900 surface, ambient `#D32F2F` red glow, pulsing red dot with "Constitutional Emergency" status pill). It matches T1/T2 card footprint (padding, rounded-sm, shadow, arrow-CTA) and adds hover-lift + focus-visible ring for parity. Commit `a8755a9` on branch `spacedock-ensign/002-homepage-track-3-entry`.

### Design decisions
No pre-written design spec existed, so the following calls were made and are documented here:
- **Visual language:** Borrow the `/future` crisis banner's palette (`bg-gray-900`, `#D32F2F` red accent, pulsing dot, red blur glow) rather than inventing a new one — this is the "loading/processing metaphor" from the entity spec and reinforces continuity with the destination page.
- **Data source:** Direct import of `CRISIS_STATS` from `@/data/future`. Keeps `page.tsx` a server component (no `'use client'` boundary added), since `CRISIS_STATS` is a static module-level export. No new shared helper introduced because the existing export is already the clean typed boundary.
- **Live preview shape:** Two-column mini-stat (`{totalPending} 件待審案件` / `{activeJustices} / {designatedTotal} 名大法官運作`), split by a subtle `border-gray-800` divider. Chose this over a single-line prose string because it mirrors the stat-bar pattern already used in `BottleneckFunnel.tsx`.
- **CTA copy:** Changed from muted `開始探索` to `查看癱瘓實況` ("view the paralysis in real time") to match the urgency framing. T1 / T2 keep `開始探索` since they are not crisis-framed.
- **Card color:** Deliberately darker than T1/T2 (which are white) so the crisis card reads as visually distinct *without* looking disabled. The dark theme + red accent is the inverse of "greyed out".
- **Accessibility:** Added `aria-label` summarizing the live stats for screen readers (which won't see the visual glow/pulse) and `focus-visible:ring-2` for keyboard navigation parity with T1/T2.

### Checklist
1. **DONE** — Homepage Track 3 card (`src/app/page.tsx:104-153`) upgraded from greyed-out placeholder to live entry point.
2. **DONE** — Live mini-preview shows `CRISIS_STATS.totalPending` + `CRISIS_STATS.activeJustices` / `designatedTotal`, imported from `@/data/future` (the same module `/future` uses).
3. **DONE** — Urgency cues applied: `bg-gray-900` surface, `#D32F2F` ambient glow, pulsing red dot with "Constitutional Emergency" pill, red workflow icon — all mirroring the `/future` crisis banner.
4. **DONE** — Matches T1/T2 footprint: same `p-8 shadow-sm rounded-sm` geometry, same arrow-CTA pattern, same Track badge in top-left + icon tile in top-right. Interactivity enhanced: hover-lift (`hover:-translate-y-0.5`), hover-shadow, `focus-visible:ring-2 focus-visible:ring-[#D32F2F]`, group-hover on heading / CTA.
5. **DONE** — Still links to `/future`; CTA copy is now `查看癱瘓實況` with an arrow, styled in `#FFE082` (brand-yellow) on the dark card — no longer muted or disabled-looking.
6. **DONE** — Reused the existing typed `CRISIS_STATS` export from `src/data/future.ts`. No copy-pasted literals; no new helper introduced because the existing one already fits.
7. **DONE** — Pure Tailwind; no inline `style={}` except the ambient glow positioning (acceptable for decorative `aria-hidden` element, same pattern as `/future` crisis banner). No `any` types introduced.
8. **DONE** — `/past` and `/present` markup untouched. `npx next build` still emits `/past`, `/present`, `/present/[id]`, `/future` as prerendered/server routes.
9. **DONE** — `npx tsc --noEmit` passes with no output. `npx next build` reports "Compiled successfully" and generates 8 static pages.
10. **DONE** — Committed as `a8755a9` on `spacedock-ensign/002-homepage-track-3-entry` with a descriptive feat message.

## Stage Report (review)

### Summary
Independent review of commit `a8755a9` (`feat(homepage): upgrade Track 3 card to live crisis entry point`) on branch `spacedock-ensign/002-homepage-track-3-entry`. Diff touches only `src/app/page.tsx` (+44 / −9) and the entity doc; no other source changed. Every acceptance criterion in the entity description is met with clean TypeScript, pure Tailwind, reused `CRISIS_STATS` data source, preserved server-component boundary, accessible focus/ARIA handling, and a green build (`tsc --noEmit` clean, `next build` succeeds with all 8 routes including `/past`, `/present`, `/present/[id]`, `/future`).

### Checklist
1. **DONE** — Read the full diff via `git diff main...HEAD`. Only two files changed: `src/app/page.tsx` and the entity doc. Three commits on the branch: `a8755a9` (implementation), `b52658f` (implement stage report), `692d038` (advance state). Scope is exactly what the entity asks for.
2. **DONE** — Acceptance criteria verified against `src/app/page.tsx:104-153`:
   - **Live mini-preview of bottleneck** — `src/app/page.tsx:137` renders `{CRISIS_STATS.totalPending}` (件待審案件) and `src/app/page.tsx:143-144` renders `{CRISIS_STATS.activeJustices} / {CRISIS_STATS.designatedTotal}` (名大法官運作). Values flow from `src/data/future.ts:224-229`, the same export `/future/page.tsx` consumes. **MET.**
   - **Visual urgency consistent with T3** — `src/app/page.tsx:107` uses `bg-gray-900 text-white`, `src/app/page.tsx:111` adds the ambient `bg-[#D32F2F] ... blur-[90px]` glow, `src/app/page.tsx:122-125` pulses a `bg-red-500 animate-pulse` dot next to a mono "Constitutional Emergency" pill. All four cues directly mirror `/future/page.tsx:50-60` (`bg-gray-900` crisis banner + `bg-[#D32F2F] ... blur-[120px]` glow + identical pulsing-dot + "Constitutional Emergency" pill). **MET.**
   - **Visual weight / interactivity matching T1 / T2** — Card uses the same `p-8 shadow-sm rounded-sm` geometry as T1 (`page.tsx:71`) and T2 (`page.tsx:88`), same Track-badge-top-left + icon-tile-top-right composition (`page.tsx:113-118` mirrors `page.tsx:72-76` / `89-93`), and same arrow-CTA footer (`page.tsx:150-152`). Interactivity is at parity or better: `hover:shadow-lg hover:-translate-y-0.5 transition-all` + `focus-visible:ring-2 focus-visible:ring-[#D32F2F] focus-visible:ring-offset-2` (`page.tsx:107`). **MET.**
   - **CTA linking to `/future`** — `href="/future"` at `src/app/page.tsx:106`; CTA copy upgraded from `開始探索` to `查看癱瘓實況` in brand-yellow `#FFE082` with arrow at `src/app/page.tsx:150-152`. **MET.**
3. **DONE** — Code quality: no `any` types introduced (confirmed by `tsc --noEmit` clean and grepping the diff); Tailwind used consistently (brand tokens `#D32F2F` / `#FFE082` match existing usage on `/future/page.tsx:37,51` and `page.tsx:26,43`); **no inline `style={}` anywhere in the diff** — the ambient glow uses pure Tailwind utilities, not an inline style block (the implement report's note about a decorative `style={}` exception is slightly misdescribed — reality is cleaner, this is an undercount not overclaim, not a defect).
4. **DONE** — Component reuse / Next.js conventions: `page.tsx` remains a server component (no `'use client'` directive added — confirmed by reading the file top-to-bottom; only `next/image`, `next/link`, `lucide-react`, and the typed `CRISIS_STATS` import are added). `CRISIS_STATS` is imported from `@/data/future` (`src/app/page.tsx:4`), the existing typed export — no literals duplicated, no new helper introduced. Imports use the project's `@/` alias consistently with existing `/future` and `/present` pages.
5. **DONE** — Visual language check: the card reads as urgent and alive — dark surface + red accent + pulsing dot + live numeric stats is the inverse of the prior greyed-out placeholder. It is clearly distinct from T1/T2's white cards (different surface color, different badge color `#D32F2F` vs `gray-800`, different icon palette, different CTA palette) while keeping the shared T1/T2 structural skeleton so the three cards still read as a set. Hover (lift + shadow + heading color shift to `#FFE082` + CTA underline + glow-opacity ramp) and `focus-visible:ring-2` states are present (`page.tsx:107`, `128`, `150`).
6. **DONE** — Accessibility: `focus-visible:ring-2 focus-visible:ring-[#D32F2F] focus-visible:ring-offset-2` keyboard ring present (`page.tsx:107`); decorative ambient glow is `aria-hidden` (`page.tsx:111`); the live-stats block is summarized for screen readers via the root `aria-label` on the `<Link>` (`page.tsx:108`: `進入憲庭載入中：${totalPending} 件案件待審，僅存 ${activeJustices} 名大法官運作`), so assistive tech gets the numbers without needing to parse the visual grid. Minor observation (non-blocking, out of spec scope): the pulsing dot could in principle be wrapped in `motion-reduce:animate-none` for users with `prefers-reduced-motion`, but this is a site-wide concern equally applicable to the identical pulsing dot on `/future/page.tsx:55` and is explicitly not called out in the entity description — not a review blocker.
7. **DONE** — Regressions: diff --stat confirms only `src/app/page.tsx` and the entity doc changed. T1 card (`page.tsx:71-85`) and T2 card (`page.tsx:88-102`) are byte-identical to their pre-change form — unchanged surface, icon, copy, CTA. Hero section (`page.tsx:10-58`), section header (`page.tsx:62-66`), and the grid container (`page.tsx:68`) are untouched. `/past`, `/present`, `/present/[id]`, and `/future` route files are not in the diff. Build output below confirms all routes still emit.
8. **DONE** — Build verification in the worktree:
   - `npx tsc --noEmit` — clean (no output, exit 0).
   - `npx next build` — "✓ Compiled successfully in 1712.1ms", "✓ Generating static pages using 7 workers (8/8)". Route table shows `/`, `/_not-found`, `/future`, `/past`, `/present`, `/present/[id]`, `/preview` — all expected pages present; `/` and the three track pages prerendered as static, `/present/[id]` dynamic as expected. (Sole build output is a benign Next.js warning about multiple lockfiles between repo root and worktree — this is a worktree-setup artifact, not caused by this change.)
9. **DONE** — Implement stage report is accurate. Claims of "`page.tsx:104-153`", `CRISIS_STATS` sourcing, T1/T2-footprint parity, hover/focus/ARIA additions, `/past` & `/present` untouched, and "Compiled successfully + 8 static pages" all verified against the diff and build output. One minor inaccuracy: the report claims an "inline `style={}`" exception for the glow, but the glow actually uses pure Tailwind utilities — reality is *cleaner* than reported, so this is an undercount, not overclaiming, and not grounds for rejection.
10. **DONE** — Verdict below.

### Verdict
**PASSED.**

Rationale: all four acceptance criteria in the entity description are met with line-level evidence, the card is visually distinct-but-coherent with T1/T2, the data source is the shared typed `CRISIS_STATS` export (not duplicated literals), the server-component boundary is preserved, the page type-checks and builds, no regressions touch `/past` or `/present`, and accessibility affordances (focus ring, aria-label, aria-hidden decoration) are in place. No blockers.

