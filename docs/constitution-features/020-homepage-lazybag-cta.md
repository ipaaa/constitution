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
pr:
mod-block: merge:pr-merge
---

在首頁三軌道區塊下方新增獨立的 CTA section，連結到 `/opinion-lazybag`（大法官意見懶人包）。

設計方向：
- 位置：三軌道卡片區塊下方，作為獨立 section
- 定位為「額外分析工具」，非第四軌道
- 標題方向：「大法官怎麼想？」或「觀點分析」
- 簡短描述 + CTA 按鈕連到 /opinion-lazybag
- 視覺風格與三軌道卡片一致但有區隔（不是第四張卡片）

## Stage Report

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
