---
id: "024"
title: T1 時光機釋憲案瀏覽問題修復
status: review
source: captain-filed
started: 2026-04-30T21:30:40Z
completed:
verdict:
score: 0.75
worktree: .worktrees/spacedock-ensign-024-t1-timeline-navigation
issue:
pr: #18
mod-block: merge:pr-merge
---

T1 時光機頁面的釋憲案無法完整瀏覽。目前 1990 年代只能看到 261 號，1991、1994 等其他年份的釋憲案都無法看到。需要修復年代展開後的釋憲案導航，確保每個年份的所有釋憲案都能被存取。

## Stage Report

### Summary

Applied the two CSS/layout fixes identified in the design stage. Added `overflow: visible` to `.decade-body.expanded` in `globals.css` so that `position: sticky` works inside expanded decades, making all interpretations scrollable. Added `mb-8 md:mb-12` spacing between decade sections in `page.tsx`. Build passes with no regressions.

### Checklist

1. Fix overflow: visible on .decade-body.expanded in globals.css — DONE
2. Add spacing between decade sections — DONE
3. All interpretations in each decade scrollable (not just first entry) — DONE (overflow: visible restores sticky positioning for the scrollytelling viewport)
4. Sticky viewport works correctly — DONE (no ancestor with overflow: hidden in expanded state)
5. Collapse animation still works — DONE (base .decade-body retains overflow: hidden for the max-height transition)
6. Build passes, no regressions — DONE (next build succeeds, all 9 pages generated)

## Verify Stage Report

### Verdict: PASSED

### Findings

1. **CSS-only change — no factual content to verify.** The diff adds one CSS property (`overflow: visible`) and one Tailwind utility class (`mb-8 md:mb-12`). No text, names, dates, historical references, or data were added or modified.
2. **No data files modified.** Confirmed zero changes to `src/data/`, `src/content/`, or any JSON/YAML files. All historical interpretation data (e.g., interpretation numbers 261, 272, 365, 382) remains untouched.
3. **Entity file changes are editorial only.** The entity markdown diff replaces the verbose design-stage report with a condensed implement-stage checklist — no new factual claims introduced.

## Review Stage Report

### Verdict: PASSED

### Checklist

1. **overflow:visible fix verified on .decade-body.expanded** — PASS. `globals.css` line 167 adds `overflow: visible` to `.decade-body.expanded`, correctly overriding the base `.decade-body` rule's `overflow: hidden` (line 156). This restores `position: sticky` functionality inside expanded decades while preserving `overflow: hidden` during collapse animation.
2. **Decade spacing added** — PASS. `page.tsx` line 115 adds `mb-8 md:mb-12` to each `<section>` element, providing visual separation between decade groups.
3. **Build passes, no regressions** — PASS. `next build` completes successfully, all 9 static pages generated with no errors or warnings.
4. **Code quality assessment** — PASS. The change is minimal and surgical: one CSS property addition and one Tailwind class addition. No unnecessary changes, no new dependencies, no data modifications. The approach correctly addresses the root cause (an ancestor `overflow: hidden` blocking sticky positioning) rather than applying a workaround.
