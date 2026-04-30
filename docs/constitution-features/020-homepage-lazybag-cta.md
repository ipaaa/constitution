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
---

在首頁三軌道區塊下方新增獨立的 CTA section，連結到 `/opinion-lazybag`（大法官意見懶人包）。

設計方向：
- 位置：三軌道卡片區塊下方，作為獨立 section
- 定位為「額外分析工具」，非第四軌道
- 標題方向：「大法官怎麼想？」或「觀點分析」
- 簡短描述 + CTA 按鈕連到 /opinion-lazybag
- 視覺風格與三軌道卡片一致但有區隔（不是第四張卡片）

## Stage Report

### 1. Component hierarchy with props and responsibilities — DONE

```
src/app/page.tsx
  └─ <LazybagCtaSection />     (new, server component)
       └─ <Link href="/opinion-lazybag">
            ├─ Badge label ("Analysis Tool")
            ├─ Heading ("大法官怎麼想？")
            ├─ Description text
            ├─ Stat pills (dimensions count, opinions count)
            └─ CTA arrow prompt ("探索觀點光譜 →")
```

**`LazybagCtaSection`** — `src/components/home/LazybagCtaSection.tsx`
- Props: none (reads `OPINIONS.length` and `DIMENSIONS.length` from `@/data/opinions` directly)
- Responsibilities:
  - Renders a full-width horizontal banner as a single clickable `<Link>` to `/opinion-lazybag`
  - Displays two stat pills (number of classified arguments, number of analysis dimensions) to hint at the tool's depth
  - Visually distinct from the three-track grid cards above

### 2. Acceptance criteria — DONE

- [ ] A new `<section>` appears on the homepage below the three-track cards section and above the closing `</div>`
- [ ] The section links to `/opinion-lazybag` (entire banner is clickable)
- [ ] The section does NOT use a three-column grid; it uses a single-row horizontal banner layout
- [ ] Badge reads "Analysis Tool" (uppercase, tracking-widest) — NOT "Track 4"
- [ ] Heading uses `font-serif` matching the homepage heading style
- [ ] Two stat pills display dynamic counts from `opinions.ts` (opinions count, dimensions count)
- [ ] Hover state: slight lift (`-translate-y-0.5`), shadow increase, CTA text underlines — matching Track 3 card interaction pattern
- [ ] Keyboard accessible: entire section is a `<Link>`, receives focus ring matching Track 3's `focus-visible:ring-2`
- [ ] No new data types or API calls needed
- [ ] Mobile: stacks vertically (text block above stat pills); Desktop: single horizontal row with stats on the right
- [ ] Section has `border-t border-gray-200` top separator matching the tracks section pattern

### 3. Data requirements — DONE

No new data types or data sources needed.

- `OPINIONS` array from `@/data/opinions` — use `.length` for argument count stat pill
- `DIMENSIONS` array from `@/data/opinions` — use `.length` for dimension count stat pill

Both are already exported and used by the lazybag page. No new types required.

### 4. Mobile/desktop responsive behavior — DONE

- **Desktop (md+):** Single horizontal banner. Left side: badge + heading + description in a row. Right side: stat pills + CTA arrow. Uses `flex` row layout with `items-center` and `justify-between`.
- **Mobile (<md):** Stacks vertically. Badge + heading + description on top, stat pills below, CTA at bottom. Uses `flex-col` with natural stacking.
- Banner has consistent `px-6` padding matching the `max-w-7xl mx-auto px-6` container used elsewhere on the homepage.
- Min-height is not set; content determines height. Padding uses `py-10 md:py-12` for breathing room.

### 5. Visual design — DONE

**Distinct from three-track cards but consistent style:**
- Background: `bg-gray-50` with `border border-gray-200` — lighter than the white track cards, creating visual separation
- NOT a grid card — uses full-width horizontal banner layout within the `max-w-7xl` container
- Badge uses `bg-gray-800 text-white` pill style (same as track badges) but reads "Analysis Tool" instead of "Track N"
- Section sits within its own `<section>` with `bg-white py-16 border-t border-gray-200` wrapper, matching the tracks section wrapper pattern
- The inner banner card uses subtle `bg-gray-50` fill to differentiate from the white track cards above
- Heading: `text-2xl md:text-3xl font-bold font-serif text-gray-900`
- Description: `text-gray-600 font-medium`
- Stat pills: `font-mono text-sm` inside `bg-white border border-gray-200 rounded-sm px-3 py-1` containers
- Hover: `hover:shadow-md hover:-translate-y-0.5 transition-all` (borrowed from Track 3 card)

### 6. CTA copy direction and link — DONE

- **Badge:** `ANALYSIS TOOL` (uppercase, small, tracking-widest)
- **Heading:** `大法官怎麼想？` (conversational, inviting curiosity)
- **Description:** `不標籤人、不貼黨派——用論證角度看大法官意見的光譜分佈。` (emphasizes the argument-based, non-partisan approach that is core to the lazybag's design philosophy)
- **Stat pills:** `{N} 則意見分析` / `{N} 個觀察維度` (dynamic from data)
- **CTA text:** `探索觀點光譜` with `<ArrowRight>` icon
- **Link target:** `/opinion-lazybag`

### Summary

Designed a horizontal banner CTA section for the homepage that links to `/opinion-lazybag`. The component is a single `LazybagCtaSection` server component placed below the three-track cards. It uses a full-width banner layout (not a grid card) to visually distinguish it as an analysis tool rather than a fourth track. Dynamic stat pills pull counts from the existing `opinions.ts` data. Copy emphasizes the argument-based, non-partisan analysis approach. Responsive behavior stacks vertically on mobile.
