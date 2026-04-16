---
id: "009"
title: Docs & Lint Cleanup
status: review
source: debrief follow-up
started: 2026-04-16T20:53:13Z
completed:
verdict:
score: 0.3
worktree: .worktrees/spacedock-ensign-009-docs-and-lint-cleanup
issue:
pr:
---

Small maintenance pass to settle two follow-ups flagged in the 2026-04-16 session debrief.

### 1. Workflow README naming-convention drift

After commit `28927a4` renamed all entity files to `{id}-{slug}.md` for sort order, the workflow README at `docs/constitution-features/README.md` still documents the old convention in two places:

- **"File Naming" section** — says `Each feature is a markdown file named '{slug}.md'. Example: 'bottleneck-funnel.md'.`
- **"Feature Template" section** — also references the old pattern

Update both to the current `{id}-{slug}.md` convention. Example filename: `004-t2-search-wiring.md`.

### 2. Pre-existing ESLint warnings on Track 2

`npx eslint src/app/present/page.tsx` reports two warnings that predate recent work:

- **Unused import** — `DiscussionCategory` is imported but never used. Remove the import.
- **`<img>` element warning** — ESLint recommends `next/image`. Either:
  - Migrate the `<img>` tag to `<Image>` (with appropriate `src/width/height/alt`), or
  - If there's a reason to keep raw `<img>` (e.g. dynamic external URL without dimensions), add an inline `// eslint-disable-next-line @next/next/no-img-element` with a one-line justification.

### Acceptance criteria

- `docs/constitution-features/README.md` shows `{id}-{slug}.md` in both the File Naming section and the Feature Template example.
- `npx eslint src/app/present/page.tsx` reports 0 warnings (or the `<img>` warning has an accompanying disable-line with a rationale comment).
- `npx tsc --noEmit` remains clean.
- `npx next build` remains clean.
- No behavioral changes to the Present page rendering.
