---
id: "015"
title: 反方意見與中立呈現
status: review
source: meetup-20260416
started: 2026-04-30T15:46:56Z
completed:
verdict:
score: 0.7
worktree: .worktrees/spacedock-ensign-015-opposing-views-integration
issue:
pr:
mod-block: merge:pr-merge
---

在現有內容中加入反方意見與論證重點標示，確保中立性。

來源：0416 會議討論（46:12）。面對進步派與藍白派學者立場分歧，需引入反方意見並以中立語氣呈現，附加批判性說明。非單純放進資料，而是要有編輯加工以維持網站品質。允中負責整理現有反方意見分析材料。

## Stage Report

### 1. Component Hierarchy with Props and Responsibilities — DONE

```
src/components/opposing-views/
  OpposingViewCard.tsx              # 'use client' — single opposing view block
    props: { view: OpposingView, isExpanded: boolean,
             onToggle: () => void }
    responsibilities: render a collapsible card showing counterargument
                      summary, source attribution, editorial annotation;
                      expand/collapse for full argument text;
                      visual treatment distinguishes it from main content

  EditorialAnnotation.tsx           # Inline editorial note attached to a view
    props: { annotation: string, sources?: SourceRef[] }
    responsibilities: render the critical commentary from editors in a
                      distinct callout; optionally link to supporting sources;
                      uses a neutral "editor's note" framing

  OpposingViewsSection.tsx          # Container for all opposing views on a detail page
    props: { views: OpposingView[], articleId: string }
    responsibilities: section wrapper with heading, introductory framing text,
                      renders list of OpposingViewCard components;
                      handles expand/collapse state for each card

src/components/PresentDetail.tsx    # (existing — modified)
  - Import and render OpposingViewsSection between the full content
    and the deep owl commentary sections on the article detail page
```

Placement rationale: opposing views are embedded directly into the existing `/present/[id]` detail page flow — not a separate page. They appear after the main article content but before the owl deep commentary, creating a natural reading sequence: main argument -> counterarguments -> editorial synthesis (owl). The component folder `opposing-views/` mirrors the `opinion-lazybag/` and `future/` patterns.

### 2. Acceptance Criteria — DONE

- [ ] OpposingViewsSection renders on `/present/[id]` detail pages when the discussion item has associated opposing views.
- [ ] Section does not render (no empty state) when there are no opposing views for a given article.
- [ ] Each OpposingViewCard shows: counterargument summary (always visible), source attribution (author/org name + year), and a "展開全文" toggle for the full argument text.
- [ ] EditorialAnnotation renders below each opposing view with a clearly distinct visual treatment (different background, labeled "編輯註記").
- [ ] Editorial annotations use neutral, analytical language — no value judgments like "wrong" or "incorrect."
- [ ] Opposing views are visually distinct from main content: use a left-border accent color (neutral gray-blue, `border-l-4 border-[#78909C]`) and a subtle background tint (`bg-[#F5F7FA]`) to signal "this is a different perspective" without implying inferiority.
- [ ] Section heading includes framing text explaining the purpose: "以下收錄不同立場的論述，供讀者參照比較。" (The following collects arguments from different positions for readers' reference and comparison.)
- [ ] No political party labels, camp names (進步派/藍白), or loaded terminology appear in the UI. Source attribution uses author name + institutional affiliation only.
- [ ] Opposing views data loads from `discussions.json` via a new `opposing_views` field on `DiscussionItem`.
- [ ] Cards are collapsed by default; users can expand individually to read full arguments.
- [ ] Screen readers announce the section as a distinct region (`role="region"` with `aria-label`).
- [ ] Expand/collapse toggle is keyboard-accessible and uses `aria-expanded`.
- [ ] Mobile: cards stack vertically with full-width layout, same interaction model.
- [ ] Desktop: cards stack vertically within the existing max-w-4xl content column.

### 3. Data Requirements — DONE

#### New types (added to `src/components/SharedPresent.tsx`)

```typescript
/** A source reference for an opposing view or annotation. */
export interface SourceRef {
  label: string;        // e.g. "蘇永欽，〈大法官的角色與功能〉"
  url?: string;         // optional external link
}

/** A single opposing/counterargument view. */
export interface OpposingView {
  id: string;                     // e.g. 'ov-d1-01'
  stanceLabel: string;            // neutral label, e.g. "認為法庭應尊重立法裁量"
  summary: string;                // 1-2 sentence plain-language summary
  fullArgument?: string;          // full text (markdown), shown on expand
  source: {
    author: string;               // e.g. "蘇永欽"
    affiliation?: string;         // e.g. "政治大學法學院"
    year?: string;                // e.g. "2025"
  };
  editorialNote: string;          // editor's critical annotation
  editorialSources?: SourceRef[]; // references supporting the annotation
}
```

#### Extended `DiscussionItem` type

```typescript
// In SharedPresent.tsx, add to existing DiscussionItem type:
export type DiscussionItem = {
  // ... existing fields ...
  opposing_views?: OpposingView[];  // array of counterarguments for this article
};
```

#### Data source & workflow

1. 允中 (邵允鍾) compiles opposing view materials in an Excel/Google Sheet with columns: `id`, `article_id` (maps to discussion item), `stance_label`, `summary`, `full_argument`, `source_author`, `source_affiliation`, `source_year`, `editorial_note`, `editorial_sources`.
2. Editorial review: editors (Hui-Chieh SU and team) review the stance labels and editorial notes for neutrality before committing.
3. Data is added as a nested `opposing_views` array within each relevant entry in `discussions.json` — same frozen-snapshot commit pattern as all other data.
4. Not all discussion items will have opposing views; the field is optional.

#### Sample data shape in `discussions.json`

```json
{
  "id": "d1",
  "title": "憲法法庭，歡迎回來...",
  "opposing_views": [
    {
      "id": "ov-d1-01",
      "stanceLabel": "認為法庭應尊重國會多數決",
      "summary": "部分學者主張憲法法庭不應推翻經立法院三讀通過的法律，否則有違民主多數決原則。",
      "fullArgument": "完整論述文字...",
      "source": {
        "author": "某學者",
        "affiliation": "某大學法律系",
        "year": "2025"
      },
      "editorialNote": "此論點預設「多數決即民主」，但未回應少數權利保障作為立憲主義核心的論述。學者張嘉尹指出，公投複決違憲審查判決恰恰可能瓦解基本權保障機制。",
      "editorialSources": [
        { "label": "張嘉尹，公投複決憲法法庭判決分析", "url": "..." }
      ]
    }
  ]
}
```

### 4. Mobile / Desktop Responsive Behavior — DONE

| Breakpoint | OpposingViewsSection | OpposingViewCard | EditorialAnnotation |
|---|---|---|---|
| Desktop (md+) | Full-width within max-w-4xl content column, `mt-16 pt-12` spacing consistent with other detail page sections | Left-border accent + background tint, `p-6 md:p-8`, source attribution inline | Below view text, `ml-4` indent to visually nest under the argument |
| Tablet (sm-md) | Same as desktop, slightly tighter padding | `p-5`, source attribution inline | Same indent pattern |
| Mobile (<sm) | Full-width, `px-4`, section heading text slightly smaller | `p-4`, source attribution stacks vertically below summary | No indent (`ml-0`), full-width callout below argument |

Additional responsive notes:
- Collapsed cards show only summary + source + expand toggle — this keeps the mobile view scannable without overwhelming the reader.
- The section introduction text is always visible (not collapsible) — it frames the purpose of the opposing views for first-time visitors.
- Expand/collapse animation uses `max-height` transition for smooth open/close on all devices.

### 5. Strategy for Neutral, Editorial Presentation with Critical Annotations — DONE

**Core editorial principle: present, don't dismiss; annotate, don't judge.**

The meeting discussion (46:12) explicitly called for editorial curation — not just dumping raw opposing materials. This design implements that through a layered presentation model:

**Layer 1 — Neutral framing:**
- Section heading uses descriptive, non-judgmental language: "不同立場的論述" (Arguments from different positions), not "反方意見" (opposing opinions — which implies there is a "correct" side).
- Introductory text explicitly states the purpose: for readers' reference and comparison.
- No "main view vs. opposing view" hierarchy in visual weight — opposing views get their own section but are not visually diminished (no smaller font, no grayed-out treatment).

**Layer 2 — Stance labeling without camps:**
- Each view gets a `stanceLabel` describing the legal position, not the political camp. Example: "認為法庭應尊重立法裁量" instead of "藍白學者認為..."
- Source attribution uses author name + institutional affiliation — never party or camp affiliation.
- The data schema has no field for political leaning; it physically cannot encode camp membership.

**Layer 3 — Editorial annotation (the curation value-add):**
- Each opposing view includes an `editorialNote` that provides context, identifies logical assumptions, and cross-references other materials on the site.
- Annotations use analytical language: "此論點預設..." (This argument presupposes...), "未回應..." (does not address...), "與...的論述形成對比" (contrasts with the argument of...).
- Annotations never use dismissive language ("this is wrong," "misleading," "debunked").
- Annotations can reference other articles already on the site (via `editorialSources`), creating a cross-referencing web that lets readers form their own conclusions.

**Layer 4 — Editorial quality gate:**
- All opposing views pass through the same editorial review process as main content (volunteer curation -> editor review -> commit).
- The `editorialNote` field is required — every opposing view must have editorial context. Raw, unannotated counterarguments are not published.
- This ensures the meeting's requirement that materials are "editorially processed" (有編輯加工) rather than just dumped in.

### 6. Integration Points with Existing Track 2 (Present) Content Pages — DONE

**Primary integration: `/present/[id]` detail page (`src/app/present/[id]/page.tsx`)**

The OpposingViewsSection slots into the existing page structure between the full content area and the deep owl commentary:

```
[Sticky Header]
[Title / Author / Metadata]
[Abstract Card]
[Full Content or EmptyContentCTA]    ← existing
                                     ← NEW: OpposingViewsSection here
[Arxiv Review / Owl Deep Commentary] ← existing
[Cross-Track Navigation]             ← existing
[Action Footer / Share]              ← existing
[Related Articles]                   ← existing
```

Implementation detail: In `src/app/present/[id]/page.tsx`, add a conditional render after the full content `<div>` (line ~129) and before the depth comment `<section>` (line ~133):

```tsx
{item.opposing_views && item.opposing_views.length > 0 && (
  <OpposingViewsSection views={item.opposing_views} articleId={item.id} />
)}
```

**Data integration: `DiscussionItem` type extension**

- Add `opposing_views?: OpposingView[]` to the existing `DiscussionItem` type in `SharedPresent.tsx`.
- The field is optional, so all existing articles without opposing views continue to work unchanged.
- No changes needed to the listing page (`/present/page.tsx`) — opposing views are detail-page-only content.

**No changes needed to:**
- `/present/page.tsx` (listing page) — opposing views don't appear in cards/previews
- `CrossTrackLinks` — opposing views don't create new cross-track relationships
- `RelatedArticles` — related article scoring does not factor in opposing views
- Search filtering — the existing search covers title/author/abstract; opposing view content is not searched (keeps the search scope focused)

**Visual language consistency:**
- OpposingViewCard uses the same serif/sans-serif typography conventions as the rest of the detail page.
- The left-border accent pattern follows `JudgeOwlComment` (which uses `border-l-4` with color accents) but with a distinct neutral blue-gray (`#78909C`) to differentiate from owl commentary (yellow/green).
- EditorialAnnotation uses a pattern similar to the abstract card (`bg-[#f8f9fa]` with left border) but with its own label ("編輯註記") to avoid confusion.
- Expand/collapse uses Lucide icons (`ChevronDown`/`ChevronUp`) consistent with existing icon usage in the project.

### Summary

Designed an opposing views integration system that embeds counterarguments directly into existing Track 2 detail pages (`/present/[id]`). Each opposing view is presented as a collapsible card with a neutral stance label, source attribution (author + affiliation, no party labels), and a required editorial annotation providing critical context. The design enforces neutrality at the data schema level (no fields for political camp) and through editorial guidelines (analytical annotations, not value judgments). Data flows through the existing `discussions.json` frozen-snapshot pattern via a new optional `opposing_views` field on `DiscussionItem`. Visual treatment uses a distinct blue-gray accent to differentiate from main content and owl commentary while maintaining the project's "refined archive document" aesthetic. Mobile responsive with collapsible cards that keep the reading flow scannable.

## Stage Report — implement

### Checklist

1. All components created: OpposingViewCard, EditorialAnnotation, OpposingViewsSection — **DONE**
   - `src/components/opposing-views/OpposingViewCard.tsx` — collapsible card with stance label, summary, source attribution, expand/collapse toggle, editorial annotation
   - `src/components/opposing-views/EditorialAnnotation.tsx` — neutral callout with "編輯註記" label and optional source links
   - `src/components/opposing-views/OpposingViewsSection.tsx` — container with heading, framing text, expand/collapse state management

2. OpposingViewsSection integrated into /present/[id] detail page between content and owl commentary — **DONE**
   - Conditional render in `src/app/present/[id]/page.tsx` after full content div and before deep owl commentary section

3. Data types added: SourceRef, OpposingView, opposing_views field on DiscussionItem with seed data in discussions.json — **DONE**
   - `SourceRef` and `OpposingView` interfaces added to `src/components/SharedPresent.tsx`
   - `opposing_views?: OpposingView[]` added to `DiscussionItem` type
   - Two seed opposing views added to `d1` entry in `discussions.json` (one with fullArgument, one without)

4. Collapsible cards with neutral framing, editorial annotations, source attribution — **DONE**
   - Cards collapsed by default; `展開全文`/`收合全文` toggle with ChevronDown/ChevronUp icons
   - Smooth `max-height` transition for expand/collapse animation
   - Editorial annotation rendered below each view with distinct visual treatment

5. Neutral presentation: no party labels, stance-based labeling only, gray-blue accent — **DONE**
   - Stance labels describe legal positions, not political camps
   - Left border accent `border-[#78909C]` (blue-gray) with `bg-[#F5F7FA]` background
   - No fields for political leaning in the data schema
   - Section heading: "不同立場的論述" with framing text explaining purpose

6. Mobile/desktop responsive behavior matches design spec — **DONE**
   - Desktop: `p-6 md:p-8` padding, `md:ml-4` indent on editorial annotations
   - Mobile: `p-4` padding, `ml-0` full-width annotations, cards stack vertically
   - Section renders within existing `max-w-4xl` content column

7. No regressions to existing Track 1/2/3 functionality — **DONE**
   - `opposing_views` field is optional; all existing articles without it render unchanged
   - No changes to listing page, cross-track links, related articles, or search
   - Build succeeds with no TypeScript errors

8. Feature renders without errors — **DONE**
   - `npx next build` compiles successfully with 0 errors
   - All 8 routes generate correctly including dynamic `/present/[id]`

### Summary
Implemented the opposing views integration feature with three new components in `src/components/opposing-views/`. Added `SourceRef` and `OpposingView` types to `SharedPresent.tsx`, extended `DiscussionItem` with optional `opposing_views` field, and added two seed opposing views to the `d1` discussion entry. The section renders between article content and owl commentary on detail pages, with collapsible cards using neutral blue-gray accent styling, stance-based labels (no party names), required editorial annotations, and keyboard-accessible expand/collapse toggles. Build passes cleanly.
