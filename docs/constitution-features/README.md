---
commissioned-by: spacedock@0.9.3
entity-type: feature
entity-label: feature
entity-label-plural: features
id-style: sequential
stages:
  defaults:
    worktree: false
    concurrency: 2
  states:
    - name: design
      initial: true
    - name: implement
      worktree: true
    - name: review
      fresh: true
      worktree: true
      gate: true
      feedback-to: implement
    - name: complete
      terminal: true
---

# Constitution Literacy Website — Feature Workflow

This workflow tracks features for a constitution literacy website that makes Taiwan's Constitutional Court accessible through three experiential tracks: Past (timeline), Present (trending cases), and Future (bottleneck crisis). Each feature moves from design through implementation and review before merging into the site.

## File Naming

Each feature is a markdown file named `{slug}.md` — lowercase, hyphens, no spaces. Example: `bottleneck-funnel.md`.

## Schema

Every feature file has YAML frontmatter with these fields:

```yaml
---
id:
title: Human-readable name
status: design
source:
started:
completed:
verdict:
score:
worktree:
issue:
pr:
---
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier, format determined by id-style in README frontmatter |
| `title` | string | Human-readable feature name |
| `status` | enum | One of: design, implement, review, complete |
| `source` | string | Where this feature came from |
| `started` | ISO 8601 | When active work began |
| `completed` | ISO 8601 | When the feature reached terminal status |
| `verdict` | enum | PASSED or REJECTED — set at final stage |
| `score` | number | Priority score, 0.0–1.0 (optional) |
| `worktree` | string | Worktree path while a dispatched agent is active, empty otherwise |
| `issue` | string | GitHub issue reference (e.g., `#42` or `owner/repo#42`). Optional cross-reference, set manually. |
| `pr` | string | GitHub PR reference (e.g., `#57` or `owner/repo#57`). Set when a PR is created for this entity's worktree branch. |

## Stages

### `design`

The first officer sets this status when a feature enters the workflow. The worker reads the feature description and project context to produce a concrete design spec with UX decisions, component breakdown, and acceptance criteria.

- **Inputs:** Feature description in the entity body, project architecture docs in `Documents/`, existing components in `src/components/`, current page implementations in `src/app/`
- **Outputs:**
  - Component hierarchy with props and responsibilities
  - Acceptance criteria as a testable checklist
  - Data requirements specifying shape, source, and any new types needed
  - Mobile/desktop responsive behavior notes
- **Good:** Specific enough that a different developer could implement from the spec alone; references existing project patterns and design system
- **Bad:** Vague hand-waving ("make it look nice"), ignoring existing code conventions, designing in isolation from the other tracks' visual language

### `implement`

A worker builds the feature in a worktree branch based on the design spec. This is where code gets written — components, pages, styles, data transformations.

- **Inputs:** Design spec from the `design` stage (in the entity body), existing codebase patterns in `src/`
- **Outputs:**
  - All components and pages described in the design spec
  - Data files or type definitions if the design calls for new data structures
  - The feature renders without errors and matches the design's responsive behavior
  - No regressions to existing Track 1/Track 2 functionality
- **Good:** Follows Next.js app router conventions, uses Tailwind consistently with existing pages, TypeScript types are complete, components are reusable where the design spec calls for it
- **Bad:** Inline styles mixed with Tailwind, `any` types, copy-pasting large blocks from other tracks without adapting, breaking existing navigation or layout

### `review`

An independent reviewer examines the implementation against the design spec. This stage uses a fresh agent to ensure unbiased assessment. If rejected, findings are routed back to `implement` for revision.

- **Inputs:** Design spec in the entity body, implementation diff on the worktree branch, existing codebase for consistency comparison
- **Outputs:**
  - Each acceptance criterion from the design spec verified as met or not met
  - Code quality assessment (types, conventions, reusability)
  - Any regressions or broken functionality identified
  - Clear PASSED or REJECTED verdict with rationale
- **Good:** Tests each acceptance criterion individually, checks mobile and desktop behavior, verifies data flow end-to-end
- **Bad:** Rubber-stamping without actually reading the diff, rejecting on style preferences not in the design spec, scope-creeping new requirements into the review

### `complete`

Terminal stage. The feature's worktree branch is merged and the entity is archived. No further work occurs.

## Workflow State

View the workflow overview:

```bash
python3 /Users/ipa/.claude/plugins/marketplaces/spacedock/skills/commission/bin/status --workflow-dir docs/constitution-features
```

Output columns: ID, SLUG, STATUS, TITLE, SCORE, SOURCE.

Include archived features with `--archived`:

```bash
python3 /Users/ipa/.claude/plugins/marketplaces/spacedock/skills/commission/bin/status --workflow-dir docs/constitution-features --archived
```

Find dispatchable features ready for their next stage:

```bash
python3 /Users/ipa/.claude/plugins/marketplaces/spacedock/skills/commission/bin/status --workflow-dir docs/constitution-features --next
```

Find features in a specific stage:

```bash
grep -l "status: design" docs/constitution-features/*.md
```

## Feature Template

```yaml
---
id:
title: Feature name here
status: design
source:
started:
completed:
verdict:
score:
worktree:
issue:
pr:
---

Description of this feature and what it aims to achieve.
```

## Commit Discipline

- Commit status changes at dispatch and merge boundaries
- Commit feature body updates when substantive
