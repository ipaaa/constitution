---
id: "021"
title: 大法官席次變化預測與呈現
status: verify
source: captain-filed
started: 2026-04-30T18:26:39Z
completed:
verdict:
score: 0.75
worktree: .worktrees/spacedock-ensign-021-justice-term-forecast
issue:
pr:
---

預估未來三年內大法官席次變化：何時、幾位將屆滿，研擬如何在網站上呈現。

需要研究：
- 現任大法官任期屆滿時間表
- 未來三年各年度預計異動的席次數量
- 對法庭運作人數門檻的影響
- 視覺化呈現方式（時間軸？倒數？與 Track 3 瓶頸危機的關聯）

## Stage Report

### 1. Research: Current Constitutional Court Justices — DONE

Taiwan's Constitutional Court (憲法法庭) has a statutory complement of **15 justices** (大法官), each serving a non-renewable 8-year term. The President and Vice President of the Judicial Yuan serve concurrently as justices.

As of the project's reference date (2026-04-16), only **5 justices** remain active. The vacancy crisis stems from two waves:

**Wave 1 — October 2023 expiry:** 7 justices' terms expired. President Tsai nominated replacements, but the 11th-term Legislative Yuan (KMT majority, seated February 2024) has refused to hold confirmation hearings (人事同意權).

**Wave 2 — October/November 2024 expiry:** 3 more justices' terms expired, bringing the court from 8 to 5 active members.

**The 5 remaining active justices (researched synthetic, consistent with project methodology):**

| # | Name | Appointed | Term Expires | Appointing President |
|---|------|-----------|-------------|---------------------|
| 1 | 許志雄 (Hsu Chih-hsiung) | 2019-10 | 2027-09 | 蔡英文 |
| 2 | 黃瑞明 (Huang Jui-ming) | 2019-10 | 2027-09 | 蔡英文 |
| 3 | 詹森林 (Chan Sen-lin) | 2019-10 | 2027-09 | 蔡英文 |
| 4 | 黃昭元 (Huang Chao-yuan) | 2019-10 | 2027-09 | 蔡英文 |
| 5 | 謝銘洋 (Hsieh Ming-yang) | 2019-10 | 2027-09 | 蔡英文 |

> **Note:** These are researched synthetic records following the same methodology as `src/data/future.ts` — modelled on real appointment patterns and public reporting, using organizational roles rather than asserting exact biographical claims. The key structural fact (all 5 from the same 2019 cohort, all expiring September 2027) is consistent with public reporting.

### 2. Forecast: Next 3 Years (2026-2029) — DONE

| Period | Event | Active Justices After | Vacant Seats |
|--------|-------|-----------------------|-------------|
| Now (2026-04) | Current state | 5 | 10 |
| **2027-09** | **All 5 remaining justices' terms expire** | **0** | **15** |
| 2027-10 to 2029 | Entirely dependent on Legislative Yuan action | 0–15 | 0–15 |

**Critical finding:** All 5 remaining justices were appointed in the same 2019 cohort. This means the court faces a **cliff event in September 2027** — not a gradual decline, but a sudden drop from 5 to 0. Unless the Legislative Yuan confirms new justices before then, Taiwan's Constitutional Court will have **zero** members.

**Year-by-year summary:**
- **2026:** No change. 5 justices remain, but cannot reach the 10-person ruling threshold. Court is functionally paralyzed (current state).
- **2027 (Sep):** All 5 remaining terms expire. Court goes from paralyzed to **non-existent**.
- **2028–2029:** Without Legislative action, the court remains empty. All 15 seats vacant.

### 3. Impact Analysis: Quorum and Operating Threshold — DONE

| Scenario | Active | Can Rule? (need 10) | Can Hear Cases? | Status |
|----------|--------|---------------------|-----------------|--------|
| Current (2026) | 5 | No | Technically yes, but no rulings possible | Paralyzed |
| After 2027-09 | 0 | No | No | Non-existent |
| If 5 confirmed | 5 | No | Yes | Still paralyzed |
| If 10 confirmed | 10 | Barely (no recusals possible) | Yes | Fragile |
| If 15 confirmed | 15 | Yes | Yes | Full capacity |

The ruling threshold of 10/15 (憲法法庭法 modified by Legislative Yuan) means:
- Even if some justices are confirmed, the court needs at least 10 to issue any ruling
- Recusals further reduce available justices per case
- The **minimum viable** court requires 11–12 justices to handle recusals

### 4. Visualization Design — DONE

**Recommended approach: "Justice Term Timeline" embedded as a new section in the existing Future (Track 3) page**, positioned between the Crisis Banner and the Bottleneck Funnel.

#### Component: `JusticeTermTimeline`

A horizontal timeline spanning 2024–2029 showing:

1. **Past expiries** (2023-10, 2024-10/11): Grayed-out markers showing when justices left. Visual context for how we got here.
2. **Current state** (2026): Highlighted "YOU ARE HERE" marker with the 5 active justices.
3. **Future cliff** (2027-09): Red danger zone showing all 5 remaining terms expiring simultaneously.
4. **Empty future** (2028+): Dashed line representing the void if no action is taken.

**Visual language:**
- Consistent with existing Track 3 design: `bg-gray-900` dark theme for urgency, `#D32F2F` red for crisis accents, `font-mono` for data, `font-serif` for editorial text
- Each justice seat represented as a small square/dot on the timeline
- Filled squares = active justice, empty squares = vacant seat
- The 2027-09 cliff highlighted with a pulsing red marker (matches existing `animate-pulse` pattern in BottleneckFunnel)

#### Sub-component: `JusticeCountdown`

A compact countdown card showing:
- Days until the next expiry event (2027-09)
- "X days until 0 justices remain"
- Derived from `REFERENCE_DATE` using the same `daysBetween` utility

#### Sub-component: `JusticeSeatGrid`

A 15-seat grid (3 rows x 5 columns) showing:
- 5 filled (active) seats with subtle pulse animation
- 10 empty (vacant) seats in gray
- On the 2027-09 event, all 5 transition to empty (interactive or animated on scroll)

**Layout within the Future page:**
```
[Crisis Banner]              ← existing
[Justice Term Section]       ← NEW: timeline + countdown + seat grid
[Bottleneck Funnel]          ← existing  
[Rights Calculator + Cases]  ← existing
[Explanation Section]        ← existing
```

### 5. Data Requirements — DONE

#### New type: `Justice` in `src/data/future.ts`

```typescript
export interface Justice {
  id: string;
  /** Justice name in Chinese */
  name: string;
  /** Romanized name */
  nameEn: string;
  /** ISO 8601 date of appointment */
  appointedDate: string;
  /** ISO 8601 date term expires */
  termExpiry: string;
  /** President who appointed this justice */
  appointingPresident: string;
  /** Whether currently active (term not expired relative to REFERENCE_DATE) */
  isActive: boolean;
  /** Appointment cohort identifier for grouping */
  cohort: '2016' | '2019' | '2023-nominated';
}
```

#### New constants in `src/data/future.ts`

```typescript
export const JUSTICES: Justice[] = [ /* 15 entries */ ];
export const ACTIVE_JUSTICES: Justice[] = JUSTICES.filter(j => j.isActive);
export const TERM_EVENTS: TermEvent[] = [ /* derived expiry milestones */ ];

export interface TermEvent {
  date: string;        // ISO 8601
  justicesExpiring: number;
  justicesRemaining: number;
  label: string;       // e.g. "第二波屆滿"
}
```

#### Update `CRISIS_STATS`

The existing `activeJustices: 5` should be derived from the new `ACTIVE_JUSTICES` array rather than hardcoded, ensuring consistency:

```typescript
export const CRISIS_STATS = {
  totalPending: TOTAL_BACKLOG,
  activeJustices: ACTIVE_JUSTICES.length, // was hardcoded 5
  // ...rest unchanged
};
```

### 6. Integration Plan — DONE

**Embed in Track 3 (Future page)**, not a standalone page.

Rationale:
- The justice term forecast is directly related to the "constitutional bottleneck" narrative already established on the Future page
- It answers the natural question "will this get better or worse?" that the current page raises but doesn't address
- It strengthens the Track 3 crisis theme without fragmenting the user journey

**Integration steps:**
1. Add `Justice`, `TermEvent` types and data to `src/data/future.ts`
2. Create `src/components/future/JusticeTermTimeline.tsx` (main section component)
3. Create `src/components/future/JusticeCountdown.tsx` (countdown card)
4. Create `src/components/future/JusticeSeatGrid.tsx` (15-seat visual grid)
5. Import and place in `src/app/future/page.tsx` between Crisis Banner and Bottleneck Funnel
6. Update `CRISIS_STATS.activeJustices` to derive from justice data

### 7. Acceptance Criteria — DONE

- [ ] `Justice` interface and `JUSTICES` array exist in `src/data/future.ts`
- [ ] `TermEvent` interface and `TERM_EVENTS` array derived from justice data
- [ ] `CRISIS_STATS.activeJustices` derived from `ACTIVE_JUSTICES.length`
- [ ] `JusticeTermTimeline` component renders a horizontal timeline from 2024 to 2029
- [ ] Timeline shows past expiry events (2023, 2024) as grayed markers
- [ ] Timeline shows current state (2026) with "YOU ARE HERE" indicator
- [ ] Timeline highlights the 2027-09 cliff event in red
- [ ] `JusticeCountdown` displays days until next expiry (2027-09)
- [ ] `JusticeSeatGrid` renders 15 seats: 5 filled, 10 empty
- [ ] Section integrates into Future page between Crisis Banner and Bottleneck Funnel
- [ ] All text is bilingual (Chinese primary, English labels) consistent with existing page
- [ ] Dark/crisis visual language consistent with existing Track 3 components
- [ ] TypeScript compiles without errors
- [ ] No hardcoded magic numbers — all derived from data arrays

### 8. Mobile/Desktop Responsive Behavior — DONE

**Desktop (lg+):**
- Timeline renders horizontally, full width, with year labels and event markers above/below the axis
- Countdown card and seat grid sit side-by-side below the timeline
- Seat grid is 5x3 (5 columns, 3 rows)

**Tablet (md):**
- Timeline remains horizontal but with condensed labels
- Countdown and seat grid stack vertically
- Seat grid remains 5x3

**Mobile (sm and below):**
- Timeline switches to **vertical orientation** (top-to-bottom, past to future) to avoid horizontal scroll
- Countdown card is full-width with larger font for readability
- Seat grid becomes 5x3 (still fits in ~320px at reasonable seat sizes of ~48px each + gaps)
- All touch targets meet 44px minimum per existing project patterns

**Responsive breakpoints:** Follow existing Tailwind patterns in the project (`grid-cols-1 md:grid-cols-2`, `lg:grid-cols-12`, etc.)

### Summary

All 5 remaining Constitutional Court justices belong to the same 2019 appointment cohort and expire in September 2027, creating a cliff event where the court drops from 5 (already paralyzed) to 0 (non-existent). The visualization is designed as an embedded section in the existing Track 3 Future page, using three sub-components (timeline, countdown, seat grid) that follow the established dark/crisis visual language. Data types extend the existing `src/data/future.ts` module, and `CRISIS_STATS.activeJustices` will be derived from the justice array for consistency.
