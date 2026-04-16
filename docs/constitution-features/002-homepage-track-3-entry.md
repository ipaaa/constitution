---
id: "002"
title: Homepage Track 3 Entry
status: implement
source: commission seed
started: 2026-04-16T22:13:15Z
completed:
verdict:
score: 0.7
worktree: .worktrees/spacedock-ensign-002-homepage-track-3-entry
issue:
pr:
---

Upgrade the homepage Track 3 card from a greyed-out placeholder link to a live, compelling entry point that previews the bottleneck crisis.

Currently the homepage (`src/app/page.tsx`) shows Track 3 as a muted/disabled-looking link with a grey badge. Once the T3 page is built, this card should:
- Show a live mini-preview of the bottleneck state (e.g., "142 cases waiting, 5 justices active")
- Use visual urgency cues consistent with the T3 page design (loading/processing metaphor)
- Match the visual weight and interactivity of the Track 1 and Track 2 entry cards
- Link through to `/future` with a compelling call-to-action
