---
id: "022"
title: T2 憲政大事記範圍調整（限憲訴法後）
status: review
source: captain-filed
started: 2026-04-30T18:13:00Z
completed:
verdict:
score: 0.7
worktree: .worktrees/spacedock-ensign-022-t2-timeline-scope
issue:
pr:
mod-block: merge:pr-merge
---

更改 Track 2（熱搜榜）的憲政大事記，只列出憲法訴訟法通過後的爭議事件，移除或歸檔較早期的內容。聚焦於當前最具爭議性與時事相關的事件。

## Stage Report

### 1. Audit current T2 timeline data — DONE

T2 has two data sources:

**A. CourtTimeline component** (`src/app/present/page.tsx:15-22`) — hardcoded `milestones` array with 6 entries:

| Year | Label | Pre/Post 憲訴法 |
|------|-------|-----------------|
| 1948 | 司法院大法官會議成立 | Pre |
| 1993 | 大法官審理案件法實施 | Pre |
| 2019 | 憲法訴訟法三讀通過 | Cutoff point |
| 2022 | 憲法法庭正式揭牌 | Post |
| 2024 | 114年憲判字第1號 | Post |
| 未來 | 憲政體制的韌性考驗 | Post |

**B. discussions.json** (`src/data/discussions.json`) — 10 entries (d1, d2, d4-d9, tldr). All entries date from 2025.12.30 to 2026.1.21 — **all are post-憲訴法. No changes needed here.**

### 2. Define the cutoff criteria — DONE

**Cutoff: 憲法訴訟法三讀通過 (2019)**

- Remove milestones with `year < 2019` from the CourtTimeline.
- The 2019 entry itself (憲法訴訟法三讀通過) should be **kept** as the anchor/origin point — it provides necessary context for why the court transitioned to its current form.
- All discussion items in `discussions.json` are already post-cutoff; no filtering needed.

### 3. List of events to keep vs remove/archive — DONE

**Keep (4 entries):**
- 2019: 憲法訴訟法三讀通過 (anchor — the law this feature scopes to)
- 2022: 憲法法庭正式揭牌
- 2024: 114年憲判字第1號
- 未來: 憲政體制的韌性考驗

**Remove (2 entries):**
- 1948: 司法院大法官會議成立
- 1993: 大法官審理案件法實施

These two entries are historical context better suited to T1 (Past track). No archival file is needed — the data is hardcoded and recoverable from git history.

### 4. Data migration plan — DONE

This is a **code-only change**, no JSON migration needed:

1. **Edit `src/app/present/page.tsx`** — In the `CourtTimeline` component (line 15), remove the first two entries from the `milestones` array (1948 and 1993).
2. **No changes to `discussions.json`** — all entries are already post-憲訴法.
3. **No changes to `cross-track-links.ts`** — discussion-to-history mappings reference T1 history entries, not the CourtTimeline milestones.
4. **No changes to `history.json`** — this is T1 data, out of scope.

### 5. Acceptance criteria — DONE

- [ ] CourtTimeline starts at 2019 (憲法訴訟法三讀通過), no entries before that year
- [ ] CourtTimeline still renders 4 milestones: 2019, 2022, 2024, 未來
- [ ] The "danger" styling on the 未來 entry and "Urgent Record" stamp are preserved
- [ ] The connector lines between milestones render correctly with the reduced set
- [ ] discussions.json is unchanged — all 10 entries remain
- [ ] No broken cross-track links
- [ ] Page builds without errors (`npm run build` passes)

### 6. Any UI changes needed — DONE

**No UI changes beyond the data removal.** The CourtTimeline component renders dynamically from the `milestones` array, so removing entries will automatically shorten the timeline. The visual design (archive header, folder-tab aesthetic, connector lines, footer stamp) remains intact. No responsive behavior changes needed — the component is already a single-column vertical timeline at all breakpoints.

### Summary

The T2 憲政大事記 scoping change is purely a data trim: remove 2 pre-憲訴法 hardcoded milestones (1948, 1993) from the CourtTimeline component in `page.tsx`. The discussions.json content is already entirely post-憲訴法 and requires no changes. Implementation is a single edit to one file.
