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
