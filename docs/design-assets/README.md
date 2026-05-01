---
commissioned-by: spacedock@0.9.5
entity-type: design_task
entity-label: task
entity-label-plural: tasks
id-style: sequential
stages:
  defaults:
    worktree: false
    concurrency: 2
  states:
    - name: brief
      initial: true
    - name: draft
    - name: review
      fresh: true
      gate: true
      feedback-to: draft
    - name: complete
      terminal: true
---

# Design Assets & Social Media — 設計素材工作流

管理憲庭加好友專案的圖像設計素材與社群媒體視覺內容。涵蓋吉祥物設計、社群貼文圖像、infographic、品牌視覺統一等非程式碼的視覺產出物。

## File Naming

Each task is a markdown file named `{id}-{slug}.md` — lowercase, hyphens, no spaces. Example: `001-owl-mascot-homepage.md`.

## Schema

Every task file has YAML frontmatter with these fields:

```yaml
---
id:
title: Task name here
status: brief
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
| `title` | string | Human-readable task name |
| `status` | enum | One of: brief, draft, review, complete |
| `source` | string | Where this task came from |
| `started` | ISO 8601 | When active work began |
| `completed` | ISO 8601 | When the task reached terminal status |
| `verdict` | enum | PASSED or REJECTED — set at final stage |
| `score` | number | Priority score, 0.0–1.0 (optional) |
| `worktree` | string | Worktree path while a dispatched agent is active, empty otherwise |
| `issue` | string | GitHub issue reference (e.g., `#42` or `owner/repo#42`). Optional cross-reference, set manually. |
| `pr` | string | GitHub PR reference (e.g., `#57` or `owner/repo#57`). Set when a PR is created for this entity's worktree branch. |

## Stages

### `brief`

The first officer sets this status when a design task enters the workflow. The worker defines the design requirements, reference materials, specifications, and deliverable format.

- **Inputs:** Task description in the entity body, existing brand assets in `public/`, current site visual language from `src/components/`
- **Outputs:**
  - Clear deliverable definition (what to produce: PNG, SVG, carousel images, etc.)
  - Size and format specifications (dimensions, resolution, file format)
  - Reference materials and style direction (existing site aesthetics, color palette, tone)
  - Usage context (where the asset will be used: homepage, social media, specific page)
- **Good:** Specific enough that a designer (human or AI) can produce the asset without further questions; references existing visual language
- **Bad:** Vague briefs like "make it look good", missing dimensions or format, no reference to existing brand style

### `draft`

A worker produces the design asset based on the brief. This may involve AI image generation, SVG creation, or describing the asset for a human designer to produce.

- **Inputs:** Brief from the previous stage, existing brand assets for reference
- **Outputs:**
  - The designed asset (or detailed production-ready description if AI cannot directly produce it)
  - Asset file(s) placed in the appropriate directory (`public/`, `src/assets/`, or documented location)
  - Mockup or preview showing the asset in context (if applicable)
- **Good:** Matches the brief specifications exactly, consistent with existing brand identity, appropriate resolution and format
- **Bad:** Wrong dimensions, clashing style with existing assets, placeholder quality passed off as final

### `review`

The captain reviews the produced design asset against the brief. This is a human visual quality gate — does it look right, feel right, and serve the intended purpose?

- **Inputs:** Produced asset from draft stage, original brief for comparison
- **Outputs:**
  - Visual quality assessment
  - Brand consistency check
  - Approval or rejection with specific feedback for revision
- **Good:** Honest assessment of whether the asset serves its purpose; specific actionable feedback on rejection
- **Bad:** Rubber-stamping without looking; vague rejections like "I don't like it" without direction

### `complete`

Terminal stage. The design asset is approved and ready for use. No further work occurs.

## Workflow State

View the workflow overview:

```bash
python3 /Users/ipa/.claude/plugins/marketplaces/spacedock/skills/commission/bin/status --workflow-dir docs/design-assets
```

Output columns: ID, SLUG, STATUS, TITLE, SCORE, SOURCE.

Include archived tasks with `--archived`:

```bash
python3 /Users/ipa/.claude/plugins/marketplaces/spacedock/skills/commission/bin/status --workflow-dir docs/design-assets --archived
```

Find dispatchable tasks ready for their next stage:

```bash
python3 /Users/ipa/.claude/plugins/marketplaces/spacedock/skills/commission/bin/status --workflow-dir docs/design-assets --next
```

## Task Template

Save new tasks as `{id}-{slug}.md` (e.g. `001-owl-mascot-homepage.md`):

```yaml
---
id:
title: Task name here
status: brief
source:
started:
completed:
verdict:
score:
worktree:
issue:
pr:
---

Description of this design task and what it aims to achieve.
```

## Commit Discipline

- Commit status changes at dispatch and merge boundaries
- Commit task body updates when substantive
