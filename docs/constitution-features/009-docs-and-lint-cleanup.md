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
mod-block: merge:pr-merge
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

## Stage Report

### Summary
Performed both maintenance follow-ups: synced the workflow README to the current `{id}-{slug}.md` filename convention, and cleared the two pre-existing ESLint warnings on `src/app/present/page.tsx` by removing an unused type import and migrating the TL;DR hero from raw `<img>` to `next/image`'s `<Image>` component with explicit dimensions. Verified clean through ESLint, `tsc`, and `next build` (8 static pages generate as before).

### Checklist

1. **DONE** — Updated File Naming section example to `{id}-{slug}.md` / `004-t2-search-wiring.md`. See `docs/constitution-features/README.md:31`.
2. **DONE** — Added a filename pattern reference line above the Feature Template YAML block: `Save new features as {id}-{slug}.md (e.g. 004-t2-search-wiring.md):`. See `docs/constitution-features/README.md:144`.
3. **DONE** — Removed unused `DiscussionCategory` type import from `src/app/present/page.tsx:7`.
4. **DONE** — Migrated raw `<img>` to `<Image>` from `next/image` with `width={1024}` / `height={503}` (matches the source PNG at `public/tldr-illustration.png`) and `priority` (hero above-the-fold). Added `import Image from 'next/image'` at `src/app/present/page.tsx:12`; replacement at `src/app/present/page.tsx:90-97`. Image is a stable local asset with known dimensions, so `<Image>` was preferred over an eslint-disable.
5. **DONE** — `npx eslint src/app/present/page.tsx` reports 0 warnings (empty output).
6. **DONE** — `npx tsc --noEmit` reports clean (empty output).
7. **DONE** — `npx next build` compiles successfully; 8 static pages generated (`/`, `/_not-found`, `/future`, `/past`, `/present`, `/preview` + dynamic `/present/[id]`). Only warning is the pre-existing unrelated multi-lockfile notice.
8. **DONE** — No behavioral changes: search input, sort-by-year-with-sticky, ScholarCard/NGOCard/ReelCard rendering, and the hero TL;DR image all render identically; only the underlying `<img>` element changed to a Next-optimized `<Image>` with the same src/alt/className.
9. **DONE** — Changes committed on branch `spacedock-ensign/009-docs-and-lint-cleanup` with a `chore:` message (see git log).
10. **DONE** — This Stage Report section.

## Stage Report — Review

### Verdict: PASSED

### Summary
Independent review of commit `f05e90d` on branch `spacedock-ensign/009-docs-and-lint-cleanup`. Both maintenance fixes landed cleanly with no scope creep. README now documents the `{id}-{slug}.md` convention in both the File Naming and Feature Template sections. The Present page's two ESLint warnings are resolved: the unused `DiscussionCategory` import is removed, and the hero `<img>` was migrated to `next/image`'s `<Image>` with preserved src/alt/className and correct dimensions (1024×503 matches the actual PNG via `file public/tldr-illustration.png`). The `priority` flag is appropriate for an above-the-fold hero. All three verification commands pass clean. Diff scope is exactly 3 files (entity MD, README, page.tsx).

### Checklist

1. **DONE** — `docs/constitution-features/README.md:31` now reads `named \`{id}-{slug}.md\` ... Example: \`004-t2-search-wiring.md\``. Verified via file read.
2. **DONE** — `docs/constitution-features/README.md:144` adds `Save new features as \`{id}-{slug}.md\` (e.g. \`004-t2-search-wiring.md\`):` immediately above the Feature Template YAML block. The YAML block itself is a schema template and not a filename example, so referencing the pattern alongside is the right spot.
3. **DONE** — `DiscussionCategory` removed from the destructured import at `src/app/present/page.tsx:7`. Confirmed via diff.
4. **DONE** — Migration to `<Image>` at `src/app/present/page.tsx:90-97`. `width={1024}` / `height={503}` exactly match the PNG's intrinsic dimensions (verified by `file public/tldr-illustration.png` → `1024 x 503`). `alt`, `src`, and `className` are preserved byte-for-byte from the original `<img>`. `priority` is correct for a hero above-the-fold. New `import Image from 'next/image'` added at line 12. Migration chosen over eslint-disable is the right call given the image is a stable local asset with known dimensions.
5. **DONE** — `npx eslint src/app/present/page.tsx` → exit 0, empty output (0 warnings).
6. **DONE** — `npx tsc --noEmit` → exit 0, empty output (clean).
7. **DONE** — `npx next build` → exit 0, `✓ Compiled successfully`, `✓ Generating static pages (8/8)`. Route table shows all 8 expected entries (`/`, `/_not-found`, `/future`, `/past`, `/present`, `/preview`, `/present/[id]`). Only warning is the pre-existing unrelated multi-lockfile notice, not introduced by this change.
8. **DONE** — No behavioral regressions. `<Image>` preserves `src`, `alt`, and `className` exactly; outer `<div>` wrapper with `overflow-hidden border-b border-gray-200` is unchanged, so hero renders visually identically. The `opacity-90 hover:opacity-100 transition-opacity` hover affordance carries over via the same className. No other lines in `page.tsx` were touched (diff confirms only the import line and the 9-line `<img>` → `<Image>` block changed).
9. **DONE** — Only 3 files changed vs `main`: `docs/constitution-features/009-docs-and-lint-cleanup.md`, `docs/constitution-features/README.md`, `src/app/present/page.tsx`. No scope creep.
10. **DONE** — Verdict: **PASSED**. Both acceptance criteria from the design spec are met; all four verification commands pass; scope is tight; the `<Image>` migration is faithful to the original rendering. No fix requests.
