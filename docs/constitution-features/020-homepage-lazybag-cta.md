---
id: "020"
title: 首頁懶人包入口區塊
status: review
source: captain-filed
started: 2026-04-30T17:46:10Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-020-homepage-lazybag-cta
issue:
pr: #15
mod-block: 
---

在首頁三軌道區塊下方新增獨立的 CTA section，連結到 `/opinion-lazybag`（大法官意見懶人包）。

設計方向：
- 位置：三軌道卡片區塊下方，作為獨立 section
- 定位為「額外分析工具」，非第四軌道
- 標題方向：「大法官怎麼想？」或「觀點分析」
- 簡短描述 + CTA 按鈕連到 /opinion-lazybag
- 視覺風格與三軌道卡片一致但有區隔（不是第四張卡片）

## Stage Report — implement

1. LazybagCTA component created per design spec — DONE
   - `src/components/home/LazybagCtaSection.tsx`: server component, no props, imports OPINIONS/DIMENSIONS from `@/data/opinions`
   - Full-width horizontal banner with badge, heading, description, stat pills, and CTA arrow
2. Component added to homepage below three-track section — DONE
   - Imported and rendered in `src/app/page.tsx` after the three-track `</section>` closing tag
3. Links to /opinion-lazybag correctly — DONE
   - Entire banner is a single `<Link href="/opinion-lazybag">`, keyboard accessible with `focus-visible:ring-2`
4. Visual design: horizontal banner, distinct from track cards, consistent style — DONE
   - `bg-gray-50` inner card within `bg-white` section wrapper, `border-t border-gray-200` separator
   - Badge reads "ANALYSIS TOOL" (not "Track 4"), `bg-gray-800 text-white` pill matching track badges
   - Heading uses `font-serif`, stat pills use `font-mono`, CTA uses `text-blue-600` matching track cards
   - Hover: `hover:shadow-md hover:-translate-y-0.5 transition-all` matching Track 3 pattern
5. Mobile/desktop responsive behavior — DONE
   - Desktop (md+): `flex-row` with text left, stats right via `md:flex-row md:items-center md:justify-between`
   - Mobile: `flex-col` natural stacking, stats align left via `items-start`
6. Build passes without errors, no regressions — DONE
   - `next build` compiles successfully, all 9 pages generated, no TypeScript errors

### Summary

Implemented `LazybagCtaSection` component and integrated it into the homepage below the three-track cards section. The component renders a full-width horizontal banner linking to `/opinion-lazybag` with dynamic stat pills showing opinion and dimension counts from existing data. Visual design uses `bg-gray-50` card within a white section to distinguish it from track cards while maintaining consistent styling (badges, fonts, hover states). Responsive layout stacks vertically on mobile.

## Stage Report — review

1. Each acceptance criterion from the design spec verified as met or not met — DONE
   - Position below three-track section: verified in `src/app/page.tsx:160-161`, rendered after track `</section>` closing tag
   - Positioned as "extra analysis tool" not fourth track: badge reads "Analysis Tool", not "Track 4"
   - Title "大法官怎麼想？": verified in component line 20
   - Short description + CTA button to /opinion-lazybag: description at line 23, CTA arrow at line 37
   - Visual style consistent but distinct from track cards: confirmed (see item 3 below)
2. Code quality assessment (types, conventions, reusability) — DONE
   - Clean server component with no props, no client-side state — appropriate for static content
   - Imports `OPINIONS` and `DIMENSIONS` from `@/data/opinions` (verified exports exist in `src/data/opinions.ts`)
   - Uses project conventions: Tailwind utility classes, Next.js `Link`, `lucide-react` icons, `font-serif`/`font-mono` pairings
   - No TypeScript errors, no unused imports, no unnecessary complexity
3. Visual distinction from track cards verified — DONE
   - Track cards: `bg-white` cards in 3-column grid with `hover:shadow-md transition-shadow`
   - Lazybag CTA: `bg-gray-50` card in full-width horizontal layout with `hover:shadow-md hover:-translate-y-0.5 transition-all`
   - Distinct layout (single horizontal banner vs. grid of cards), distinct background color, distinct badge text
   - Consistent shared elements: `font-serif` headings, `text-blue-600` CTA links, `bg-gray-800` badge pills, `rounded-sm` corners
4. Link to /opinion-lazybag works — DONE
   - `<Link href="/opinion-lazybag">` wraps entire card (line 9-11)
   - Route `src/app/opinion-lazybag/page.tsx` exists and builds successfully
   - Keyboard accessible with `focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2`
5. Mobile and desktop responsive behavior verified — DONE
   - Mobile: `flex-col` stacking, stats `items-start` (left-aligned), padding `p-8`
   - Desktop (md+): `flex-row` with `md:items-center md:justify-between`, stats `md:items-end` (right-aligned), padding `md:p-10`
   - `flex-wrap` on stat pills handles narrow viewports gracefully
6. No regressions or broken functionality — DONE
   - `next build` passes cleanly, all 9 pages generated (/, /_not-found, /future, /opinion-lazybag, /past, /present, /present/[id], /preview)
   - No TypeScript errors, no new warnings
   - Existing homepage content unchanged (only addition, no modifications to track section)
7. Clear PASSED or REJECTED verdict with rationale — **PASSED**
   - All acceptance criteria from the design spec are met
   - Code is clean, follows project conventions, and introduces no regressions
   - Visual design achieves the goal of being consistent with the site aesthetic while clearly distinct from the three-track cards

### Summary

Review of the lazybag CTA implementation confirms all design spec requirements are met. The `LazybagCtaSection` component is well-implemented as a server component, correctly positioned below the three-track section, visually distinct (horizontal banner with `bg-gray-50` vs. grid cards with `bg-white`), and properly links to `/opinion-lazybag`. Build passes cleanly with no regressions. Verdict: PASSED.
