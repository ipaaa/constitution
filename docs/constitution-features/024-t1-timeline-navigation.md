---
id: "024"
title: T1 時光機釋憲案瀏覽問題修復
status: verify
source: captain-filed
started: 2026-04-30T21:30:40Z
completed:
verdict:
score: 0.75
worktree: .worktrees/spacedock-ensign-024-t1-timeline-navigation
issue:
pr:
---

T1 時光機頁面的釋憲案無法完整瀏覽。目前 1990 年代只能看到 261 號，1991、1994 等其他年份的釋憲案都無法看到。需要修復年代展開後的釋憲案導航，確保每個年份的所有釋憲案都能被存取。

## Stage Report

### Summary

Audited the T1 past page (`src/app/past/page.tsx`) and its CSS (`src/app/globals.css`). Identified two root causes: (1) `overflow: hidden` on `.decade-body` breaks `position: sticky` on the scrollytelling viewport, making only the first entry visible per decade; (2) no spacing exists between decade sections.

### 1. Audit T1 page — DONE

The 1990s decade contains 4 entries in `src/data/history.json`:
- h1: 1990 / 釋字第 261 號
- h2: 1991 / 釋字第 272 號
- h4: 1994 / 釋字第 365 號
- h6: 1995 / 釋字第 382 號

All 4 entries are correctly grouped by `groupByDecade()`. The data is complete and correct.

### 2. Root cause analysis — DONE

**Issue 1 (only 261 visible): Rendering/CSS issue — `overflow: hidden` breaks sticky positioning.**

The scrollytelling mechanism relies on:
- A scroll container with height `entries.length * 100vh` (line 171 of `page.tsx`)
- A `position: sticky; top: 0; height: 100vh` viewport inside it (line 173)
- Invisible `.vh-trigger` divs (one per entry, each 100vh tall) observed by IntersectionObserver to update `activeIndex`

The `.decade-body` class in `globals.css` (line 156) sets `overflow: hidden` for the collapse/expand animation. This property persists even in the `.expanded` state. Per CSS spec, `position: sticky` does not work when any ancestor has `overflow: hidden` — the sticky element scrolls normally instead of sticking. As a result, the viewport scrolls away after the first 100vh, and only entry 0 (釋字 261) is ever visible.

**Issue 2 (no scrolling space between decades): Missing spacing.**

Each `<section>` for a decade (line 112) has `border-t border-black/10` but zero margin between sections. When collapsed, decade headers stack flush against each other with no visual breathing room.

### 3. Fix proposal: showing all interpretations — DONE

**In `src/app/globals.css`**, change `.decade-body.expanded` to override the base `overflow: hidden`:

```css
.decade-body.expanded {
  max-height: none;
  opacity: 1;
  overflow: visible;  /* <-- ADD: restore sticky positioning for the scroll viewport */
}
```

This allows `position: sticky` to work correctly inside the expanded decade body while preserving `overflow: hidden` for the collapsed state (which is needed for the max-height collapse animation).

### 4. Fix proposal: scrolling space between decade sections — DONE

**In `src/app/past/page.tsx`**, add bottom margin to each `<section>` element in `DecadeSection` (line 115):

Change:
```
className="relative border-t border-black/10 bg-[var(--color-textbook-bg)]"
```
To:
```
className="relative border-t border-black/10 bg-[var(--color-textbook-bg)] mb-8 md:mb-12"
```

This adds `2rem` (mobile) / `3rem` (desktop) of vertical space between decade sections.

### 5. Acceptance criteria — DONE

- [ ] When the 1990s decade is expanded, all 4 entries (261, 272, 365, 382) are reachable by scrolling
- [ ] The sticky viewport remains pinned while scrolling through entries within a decade
- [ ] The IntersectionObserver correctly updates `activeIndex` as each trigger scrolls into view
- [ ] The center timeline dots and progress bar update as the user scrolls through entries
- [ ] Each decade with multiple entries correctly cycles through all of them
- [ ] Collapsed decades still animate smoothly (max-height transition with overflow hidden)
- [ ] Visible vertical spacing exists between decade section headers
- [ ] Spacing is responsive (smaller on mobile, larger on desktop)
- [ ] Search jump-to-entry still works correctly (expanding decade + scrolling to target)
- [ ] The 2000s decade (2 entries: h3, h5) and 2010s/2020s decades also display all entries

### 6. Component changes needed — DONE

| File | Change | Lines affected |
|------|--------|---------------|
| `src/app/globals.css` | Add `overflow: visible` to `.decade-body.expanded` | Line 165 |
| `src/app/past/page.tsx` | Add `mb-8 md:mb-12` to `DecadeSection` root `<section>` className | Line 115 |

Both changes are minimal (1 CSS property, 1 Tailwind class) and localized to the T1 past page with no side effects on other tracks.
