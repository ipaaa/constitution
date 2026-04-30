---
id: "014"
title: 大法官意見懶人包（多元觀點視覺化）
status: review
source: meetup-20260416
started: 2026-04-30T15:36:55Z
completed:
verdict:
score: 0.75
worktree: .worktrees/spacedock-ensign-014-opinion-lazybag
issue:
pr:
mod-block: merge:pr-merge
---

以論證角度分類不同大法官立場的懶人包，避免以人物或黨派標籤引導偏見。

來源：0416 會議討論（50:58, 59:38）。X 軸表示法庭是否支持停止運作，Y 軸表示法律層次或緊急性判斷。透過視覺化展示不同意見的論點與立場分布，標注各大法官在緊急性、刑事法邏輯等維度上的立場差異。先用 spreadsheet 整理分類數據後，用 AI 生成多種視覺化模型。

## Stage Report

### 1. Component Hierarchy — DONE

```
src/app/opinion-lazybag/
  page.tsx                          # SSG page, reads opinion JSON at build time

src/components/opinion-lazybag/
  OpinionLazybag.tsx                # 'use client' — top-level container, holds filter state
    props: { opinions: OpinionEntry[], dimensions: DimensionDef[] }
    responsibilities: layout shell, dimension selector state, responsive breakpoints

  DimensionSelector.tsx             # Toggle bar to pick active X/Y axis dimensions
    props: { dimensions: DimensionDef[], activeX: string, activeY: string,
             onChangeX: (id: string) => void, onChangeY: (id: string) => void }
    responsibilities: let users pick which two dimensions to plot;
                      defaults to X=court-halt-stance, Y=legal-level

  OpinionScatterPlot.tsx            # SVG scatter plot — the core visualization
    props: { opinions: OpinionEntry[], xDim: DimensionDef, yDim: DimensionDef,
             hoveredId: string | null, onHover: (id: string | null) => void }
    responsibilities: render ordinal scatter with labeled axes and quadrant shading;
                      place opinion dots by their stance values;
                      highlight dot on hover, trigger tooltip

  OpinionTooltip.tsx                # Floating tooltip bubble on dot hover
    props: { opinion: OpinionEntry | null, xDim: DimensionDef, yDim: DimensionDef }
    responsibilities: show argument summary, stance labels for both axes,
                      ruling reference; positioned near hovered dot

  OpinionTable.tsx                  # Tabular fallback / supplementary view
    props: { opinions: OpinionEntry[], dimensions: DimensionDef[],
             highlightId: string | null }
    responsibilities: sortable table listing every opinion with stance values;
                      row highlights on scatter hover; serves as accessible fallback

  ArgumentTag.tsx                   # Small tag chip for stance labels
    props: { label: string, stance: StanceValue }
    responsibilities: color-coded pill (support/neutral/oppose palette);
                      reused in tooltip and table cells
```

Placement rationale: this is a standalone lazybag page (like the present detail pages), not embedded inside an existing track. It lives at `/opinion-lazybag` as a shareable URL. The component folder mirrors the `future/` pattern for track-specific components.

### 2. Acceptance Criteria — DONE

- [ ] Page renders at `/opinion-lazybag` with SSG (static JSON, no API calls).
- [ ] Scatter plot displays all opinions plotted by two selectable dimensions.
- [ ] Default axes: X = "是否支持法庭停止運作", Y = "法律層次（憲法 vs 法律）".
- [ ] User can switch X and Y axes independently via DimensionSelector.
- [ ] Hovering a dot shows OpinionTooltip with argument summary, stance labels, and ruling ID.
- [ ] OpinionTable below the plot lists all opinions with sortable columns.
- [ ] Hovering a table row highlights the corresponding dot, and vice versa.
- [ ] No justice names, party affiliations, or personal identifiers appear anywhere — only argument-based labels (e.g., "主張法庭應繼續運作", "認為不具急迫性").
- [ ] Tooltip and table use ArgumentTag chips with a neutral three-color palette (support = blue, oppose = amber, neutral/mixed = gray) — no red/green political connotations.
- [ ] Page includes an introductory "how to read this chart" explainer section above the plot.
- [ ] Mobile: scatter plot is horizontally scrollable; table collapses to card layout.
- [ ] Desktop: scatter plot and table are visible together in a single scroll.
- [ ] Meets project a11y baseline: skip-link target, SVG role="img" with aria-label, keyboard-focusable dots, table uses proper `<th>` scope.
- [ ] Data loads from `src/data/opinions.ts` following the same frozen-snapshot pattern as `src/data/future.ts`.

### 3. Data Requirements — DONE

#### New types (`src/data/opinions.ts`)

```typescript
/** A single stance position on an ordinal scale. */
export type StanceValue = 'support' | 'lean-support' | 'neutral' | 'lean-oppose' | 'oppose';

/** Numeric mapping for plotting: support=2, lean-support=1, neutral=0, lean-oppose=-1, oppose=-2 */
export const STANCE_NUMERIC: Record<StanceValue, number> = {
  'support': 2, 'lean-support': 1, 'neutral': 0, 'lean-oppose': -1, 'oppose': -2,
};

/** A classification dimension (axis candidate). */
export interface DimensionDef {
  id: string;                    // e.g. 'court-halt-stance'
  label: string;                 // e.g. '是否支持法庭停止運作'
  supportLabel: string;          // positive-end axis label, e.g. '支持繼續運作'
  opposeLabel: string;           // negative-end axis label, e.g. '支持停止運作'
}

/** A single opinion entry — one row in the spreadsheet. */
export interface OpinionEntry {
  id: string;                    // unique key, e.g. 'op-01'
  rulingRef: string;             // ruling reference, e.g. '113年憲判字第9號'
  argumentSummary: string;       // 1-2 sentence plain-language summary of the argument
  stances: Record<string, StanceValue>;  // keyed by DimensionDef.id
  category?: string;             // optional grouping, e.g. '多數意見', '部分不同意見'
}
```

#### Dimensions (initial set from meeting discussion)

| id                   | label      | supportLabel | opposeLabel |
| -------------------- | ---------- | ------------ | ----------- |
| `court-halt-stance`  | 是否支持法庭停止運作 | 支持繼續運作       | 支持停止運作      |
| `legal-level`        | 法律層次判斷     | 憲法層次論證       | 法律層次論證      |
| `urgency`            | 急迫性判斷      | 具有急迫性        | 不具急迫性       |
| `criminal-law-logic` | 刑事法邏輯立場    | 嚴格限縮解釋       | 擴張適用解釋      |

#### Data source & workflow

1. Volunteers classify opinions in a Google Sheet using the spreadsheet template pattern (same as Track 1/2).
2. Sheet columns: `id`, `ruling_ref`, `argument_summary`, `category`, then one column per dimension ID with values `support|lean-support|neutral|lean-oppose|oppose`.
3. Export as CSV, transform to TypeScript (same manual curation + commit pattern as `future.ts` — not a live feed).
4. Dimensions array is also defined in the same file so adding a new axis is a single-file change.

### 4. Mobile / Desktop Responsive Behavior — DONE

| Breakpoint | Scatter Plot | Table | DimensionSelector |
|---|---|---|---|
| Desktop (md+) | Full-width SVG, ~500px height, quadrant labels visible | Full table with all dimension columns, visible below plot | Horizontal toggle bar above plot |
| Tablet (sm–md) | Full-width SVG, ~400px height, quadrant labels abbreviated | Table hides less-critical dimension columns | Horizontal toggle bar, smaller text |
| Mobile (<sm) | SVG in a horizontally scrollable container (min-width: 480px), pinch-zoom enabled | Collapses to vertical card list (one card per opinion), each card shows argument summary + stance chips | Stacked vertically: X selector, then Y selector, as dropdowns instead of toggle bar |

Additional responsive notes:
- OpinionTooltip uses absolute positioning on desktop, switches to a fixed bottom sheet on mobile (avoids tooltip clipping on small viewports).
- The "how to read this chart" explainer section is always visible (not collapsed) — it is essential for non-expert users.

### 5. UX Design for Multi-Dimensional Opinion Mapping — DONE

**Core interaction model: Configurable Scatter Plot + Table**

The scatter plot is the hero visualization. Each dot represents one classified opinion (not a person). Users can reconfigure which two dimensions serve as X and Y axes using the DimensionSelector, producing different "views" of the same opinion set. This aligns with the meeting discussion about generating "multiple visualization models" from the same classified data.

**Scatter plot details:**
- Ordinal axes with 5 positions each (oppose → lean-oppose → neutral → lean-support → support).
- Quadrant shading uses very light fills (opacity ~0.03) to suggest regions without implying hard boundaries.
- Axis labels at both ends use the `supportLabel` / `opposeLabel` from DimensionDef.
- Dots that overlap are jittered slightly (random offset within a small radius) so all remain visible.
- Dot size is uniform (no encoding on size to keep the chart simple for non-experts).

**Tooltip bubble UX (for non-expert users):**
- Appears on hover (desktop) or tap (mobile).
- Content: argument summary (plain language, 1-2 sentences), stance chips for both active axes, ruling reference.
- No jargon — the tooltip is the "lazybag" moment where the user gets the takeaway.
- Design: white card with 1px border-gray-200, subtle drop shadow, pointer triangle. Follows the project's "refined document" aesthetic (serif heading, sans-serif body).

**Table as complement:**
- Always visible below the plot (not hidden behind a tab).
- Serves dual purpose: accessible fallback for screen readers, and a detail view for users who prefer scanning a list.
- Bi-directional hover linkage with the scatter plot (hover table row = highlight dot, hover dot = highlight row).

### 6. Strategy for Neutral Presentation — DONE

**Principle: classify by argument, never by person or party.**

Implementation rules:
1. **No names**: `OpinionEntry` has no `justiceName` or `author` field. The data schema physically cannot store personal identifiers. Each entry is an *argument*, not a person's position.
2. **No party colors**: The ArgumentTag palette uses blue (support), amber (oppose), and gray (neutral) — deliberately avoiding red/green (political party connotations in Taiwan) and any culturally loaded color pairings.
3. **Neutral axis labels**: DimensionDef uses descriptive labels ("支持繼續運作" / "支持停止運作") not value-laden ones ("正確" / "錯誤"). Both ends of each axis are presented as legitimate legal positions.
4. **No ranking or scoring**: Opinions are plotted as equal-sized dots. There is no "better" or "worse" position — the visualization shows distribution, not judgment.
5. **Category labels are procedural**: The optional `category` field uses procedural terms from judicial practice ("多數意見", "協同意見", "部分不同意見", "不同意見") which are neutral court terminology, not editorial labels.
6. **Explainer framing**: The introductory section frames the chart as "understanding the range of legal arguments" (理解法律論證的光譜), not "who is right."
7. **Spreadsheet review gate**: Data is curated by volunteers and committed (same as Track 1/2/3 workflow), ensuring editorial review before any opinion classification goes live. This prevents accidental bias in stance coding.

### Summary

Designed a configurable scatter plot + table visualization for classifying Constitutional Court opinions by argument dimensions (court halt stance, legal level, urgency, criminal law logic). The core UX lets users switch X/Y axes to explore different analytical views of the same opinion data. All presentation is argument-based with no personal/party identifiers — enforced at the data schema level. Data follows the project's existing frozen-snapshot-in-TypeScript pattern. Components follow existing project conventions (Tailwind, TypeScript, 'use client', SVG-based visualization like BottleneckFunnel). Mobile responsive with scrollable chart and card-based table fallback.
