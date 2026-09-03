---
commissioned-by: spacedock@0.28.0-pre2
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
      context-sections:
        - Review-finding disposition
    - name: verify
      fresh: true
      worktree: true
      gate: true
      feedback-to: implement
      context-sections:
        - Review-finding disposition
    - name: review
      fresh: true
      worktree: true
      gate: true
      feedback-to: implement
      context-sections:
        - Review-finding disposition
    - name: complete
      terminal: true
---

# Constitution Literacy Website — Feature Workflow

This workflow tracks features for a constitution literacy website that makes Taiwan's Constitutional Court accessible through three experiential tracks: Past (timeline), Present (trending cases), and Future (bottleneck crisis). Each feature moves from design through implementation and review before merging into the site.

## 寫作規範

**本專案的工作規範在 [`../../AGENTS.md`](../../AGENTS.md)。動手前先讀。**

該檔涵蓋：絕對不要做的事（含「不要執行 `npm run build`」）、怎麼跟 captain 溝通、
簡明技術中文寫作規則、文件狀態規範。

> 舊版 README 曾指向 vault 根目錄的 `/CLAUDE.md` 與 `/style_guide.md`。
> 2026-09-02 查證，**這兩個檔案都不存在**。規範正本已改為專案內的 `AGENTS.md`。

## File Naming

Each feature is a markdown file named `{id}-{slug}.md` — lowercase, hyphens, no spaces. Example: `004-t2-search-wiring.md`.

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
mod-block:
---
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier, format determined by id-style in README frontmatter |
| `title` | string | Human-readable feature name |
| `status` | enum | One of: design, implement, verify, review, complete |
| `source` | string | Where this feature came from |
| `started` | ISO 8601 | When active work began |
| `completed` | ISO 8601 | When the feature reached terminal status |
| `verdict` | enum | PASSED or REJECTED — set at final stage |
| `score` | number | Priority score, 0.0–1.0 (optional) |
| `worktree` | string | Worktree path while a dispatched agent is active, empty otherwise. Once set on first dispatch into a `worktree: true` stage, it stays set across all non-terminal advancements (stickiness) and clears at terminal merge. |
| `issue` | string | GitHub issue reference (e.g., `#42` or `owner/repo#42`). Optional cross-reference, set manually. |
| `pr` | string | GitHub PR reference (e.g., `#57` or `owner/repo#57`). Set when a PR is created for this entity's worktree branch. |
| `mod-block` | string | Pending mod-declared blocking action, format `{lifecycle_point}:{mod_name}` — e.g. `merge:pr-merge` |

## Stages

### `design`

The first officer sets this status when a feature enters the workflow. The worker reads the feature description and project context to produce a concrete design spec with UX decisions, component breakdown, and acceptance criteria.

- **Inputs:** Feature description in the entity body, project architecture docs in `docs/project/`, existing components in `src/components/`, current page implementations in `src/app/`
- **Outputs:**
  - Component hierarchy with props and responsibilities
  - Acceptance criteria as end-state properties, each with a `Verified by:` clause
  - Data requirements specifying shape, source, and any new types needed
  - Mobile/desktop responsive behavior notes
  - 將文件影響分成 `現在更新`、`實作後更新` 與 `不更新`；每一節都要列出文件或寫 `無`
  - 每筆 `現在更新` 都要記錄已定方向、尚未實作的狀態與驗證目標；不可把預定行為寫成已上線
- **Good:** Specific enough that a different developer could implement from the spec alone; references existing project patterns and design system
- **Bad:** Vague hand-waving ("make it look nice"), ignoring existing code conventions, designing in isolation from the other tracks' visual language
- **Gate content:** Show the selected approach, risk evidence, expected files and lines with tolerance, semantic changes, and proposed proof for each acceptance criterion.

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
- When a finding arrives, follow `## Review-finding disposition`: investigate read-only, preserve its evidence, propose materiality/ownership/disposition, and obtain distinct FO authorization before any candidate edit, commit, or reviewer rerun.

> ⚠️ **Never run `npm run build` or `npm run sync-content`.** The build script runs the content sync, which overwrites `src/data/*.json` from the spreadsheet. Verify with `npx tsc --noEmit` and `npm run dev`. See `../../AGENTS.md`.

### `verify`

A fresh agent performs factual verification of AI-generated content. This stage catches errors in names, dates, events, statistics, and other factual claims before code review. If issues are found, findings are routed back to `implement` for correction.

- **Inputs:** Implementation diff on the worktree branch, entity body with design spec, external reference sources (司法院, 立法院, news archives)
- **Outputs:**
  - Each factual claim identified and verified against authoritative sources
  - Incorrect facts flagged with the correct information and source
  - Data accuracy assessment: names (人名), dates (日期), events (事件), statistics (數據)
  - **Placeholder scan:** no `某學者`, `某大學法律系`, `test`, `lorem ipsum`, or sample values from a design document reached a shipped data file
  - Clear PASSED or REJECTED verdict with rationale
- **Good:** Cross-references every factual claim against authoritative sources; flags uncertain claims rather than assuming correctness; provides correct values with citations for each error found
- **Bad:** Only checking surface-level formatting without verifying facts, accepting plausible-sounding but unverified claims, skipping data files that contain seed content, treating a design document's "sample data" as real content
- **Gate content:** Show each factual claim checked and its source, every placeholder scanned for, and the verdict with rationale.

> **Why the placeholder scan is a named output.** On 2026-04-30, feature `015` copied a JSON block from its own design document's "Sample data shape" section into `discussions.json`. The placeholder attribution `某學者，某大學法律系` displayed publicly for four months. The gate passed it. A named check is harder to skip than a general instruction.

### `review`

An independent reviewer examines the implementation against the design spec. This stage uses a fresh agent to ensure unbiased assessment. If rejected, findings are routed back to `implement` for revision.

- **Inputs:** Design spec in the entity body, implementation diff on the worktree branch, existing codebase for consistency comparison
- **Outputs:**
  - Each acceptance criterion from the design spec verified as met or not met, by reproducing its `Verified by:` clause rather than trusting the implementation's self-report
  - Code quality assessment (types, conventions, reusability)
  - Any regressions or broken functionality identified
  - 依實際交付行為檢查 `## Documentation impact` 每一筆：必要更新已完成、`record` 文件未被改寫，而且 `docs/INDEX.md` 符合文件新增或刪除結果
  - Clear PASSED or REJECTED verdict with rationale
- **Good:** Tests each acceptance criterion individually, checks mobile and desktop behavior, verifies data flow end-to-end
- **Bad:** Rubber-stamping without actually reading the diff, rejecting on style preferences not in the design spec, scope-creeping new requirements into the review
- **Small-change fast path.** Scale the checks to the diff's blast radius. A routine, low-blast-radius change (a doc line, a one-line fix, a rename) does not need the full checklist. Match the rigor to the change; a trivial diff over-validated is its own waste.
- **Gate content:** Show non-empty Stage Report results, checks run, evidence for each acceptance criterion, reviewer findings, and whether delivery can proceed.

### `complete`

Terminal stage. The feature's PR is merged (tracked via the `pr` field and the `pr-merge` mod), `completed` set, `verdict: PASSED`, entity archived. Reached via real merge, not a manual flag flip.

## Review-finding disposition

Every finding enters this checkpoint when it arrives during implement, verify, review, or a correction routed from a rejected gate.

1. The reviewer owns observation, not task ownership or authorization.
2. The worker preserves the finding, investigates without candidate mutation, records the four evidence fields, and proposes materiality, task ownership, and disposition separately. Its `actor:ensign` round Resolution is advisory.
3. The FO sends a distinct `fix`, `decline`, `hold`, or `route for decision` authorization.
4. The reviewer recommends `PASSED` or `REJECTED`; a new finding re-enters step 1.
5. Only the captain changes approved scope, accepted value, thresholds, tolerance, or acceptance criteria.
6. After revise is selected, rejection routing transports the evidence, classifications, authorized dispositions, and concrete assignment unchanged; it never re-triages.

Before FO authorization, candidate bytes and Git HEAD stay unchanged, no candidate commit is made, and no reviewer rerun starts. Read-only file/history inspection, non-mutating reproductions, and existing tests are allowed. After authorization, perform only that disposition; `hold` and `route for decision` forbid mutation and rerun.

The four evidence fields are: released user and normal workflow; observable harm; affected value AC or non-negotiable boundary; and trigger evidence.

- **Material:** all four fields establish supported-workflow harm to a value AC or protected boundary.
- **Deferred risk:** the trigger is hypothetical, unsupported, unobserved, or outside current promises; record its promote-to-material condition.
- **Polish:** no current user-visible loss or protected boundary is at risk.
- **Needs decision:** the task cannot own the required scope, product, or compatibility decision.

Materiality and task ownership are independent. Owned Material is eligible for an FO-authorized fix; out-of-scope Material holds unchanged as Needs decision. Deferred risk or Polish may be declined only after FO authorization.

The First Officer appends one `- Cycle {N}: ...` line to the entity's `### Feedback Cycles` section per correction round. **Cycle 3 escalates to the captain.**

## Workflow-specific rules

The FO/ensign operating contract governs generic stage semantics and proof discipline: prefer the cheapest check that can fail, prove by exercising rather than re-reading, and reject any acceptance criterion whose only proof is a review of its own prose. The rules below add this project's specifics.

- **Evidence must be able to fail.** Each acceptance criterion's cited evidence names the concrete change that would flip it — the falsifying edit. An author who cannot name what would make the evidence fail has not shown it can fail, and the criterion does not count.

- **External-proof acceptance criteria.** Each AC's evidence must come from a check outside the entity body — a test, a command's output or exit code, a file the change produces, or on-disk state. Reject self-referential ACs whose only proof is review of the entity's own prose.

- **No prose-grep over instruction files.** A string or regex match over an instruction file the model reads (this README, `AGENTS.md`, a skill) never proves a behavioral claim. The matched text was written by the same implementer the check polices, so it asserts only that the file contains what we put in it. A grep whose output is pasted into a stage report is legitimate evidence for that run; the same grep committed as a permanent test is banned.

- **Design-document samples are not content.** Any placeholder value that appears in a design document — sample JSON, illustrative frontmatter, an example row — must never reach a shipped data file. The `verify` stage scans for this explicitly. See the note under `verify` for the incident that produced this rule.

- **`src/data/*.json` are build artifacts.** Never hand-edit them. Content changes go to the Google Sheet. See `../content-pipeline/design.md`.

- **Repo-mutation worktree layer.** `implement`, `verify`, and `review` run in a worktree against the codebase. `verify` and `review` are `fresh` so independent agents check the work. PR state lives on the `pr` field, managed by the `pr-merge` mod — there is no `pr_open` or `awaiting_merge` stage.

## Workflow State

View the workflow overview:

```bash
spacedock status --workflow-dir docs/constitution-features
```

Output columns: ID, SLUG, STATUS, TITLE, SCORE, SOURCE.

Include archived features:

```bash
spacedock status --workflow-dir docs/constitution-features --archived
```

Find dispatchable features ready for their next stage:

```bash
spacedock status --workflow-dir docs/constitution-features --next
```

> Earlier versions of this README pointed at
> `python3 /Users/ipa/.claude/plugins/marketplaces/spacedock/skills/commission/bin/status`.
> That path no longer exists. The status viewer now ships with the Spacedock plugin
> as the `spacedock status` command.

## Feature Template

Save new features as `{id}-{slug}.md` (e.g. `037-example-feature.md`):

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
mod-block:
---

Brief description of this feature and what it aims to achieve.

## Problem

{What is broken or missing, why it matters now, and what a fix must cover.}

## Proposed approach

{The direction chosen, and the simplest alternative rejected with the reason it cannot
deliver the value. Concrete enough that a worker can start.}

## Risk evidence

{The riskiest unverified mechanism and what exercising it showed, or
`no spike needed: {the proven mechanisms this relies on}`.}

## Expected surface and tolerance

Estimate: {+NNN} net LOC across {M} files, tolerance {±NN%}.
Semantics this may change: {routes, stored data shapes, runtime behavior, or `none`}.

## Acceptance criteria

Each AC names a property of the finished feature (not a stage action) and how it is
verified. At least one measures the end-value against a baseline that can move the
wrong way.

**AC-1 — {End-state property.}**
Verified by: {test name / command output or exit code / file the change produces /
resulting on-disk state — something outside this entity body that a future reader can
reproduce and that can fail. Name the concrete change that would make it fail.}

## Test plan

{What verifies the implementation. Remember: `npx tsc --noEmit` and `npm run dev`,
never `npm run build`.}

## Documentation impact

分類所有受影響的文件。三個小節都必須保留。該類別沒有文件時寫 `無`。

### 現在更新

| 文件 | 為什麼現在要改 | 更新內容 |
|---|---|---|
| `{path}` | {哪一項現行計畫或決定已不完整} | {已定決策、明確的尚未實作狀態、驗證目標} |

### 實作後更新

| 文件 | 完成條件 | 更新內容 |
|---|---|---|
| `{path}` | {必須先通過的行為或測試} | {實作後才成立的操作或 evergreen 現況} |

### 不更新

| 文件 | 理由 |
|---|---|
| `{path}` | {例如：屬於 record、由其他流程負責、或既有正本仍正確} |

### Feedback Cycles

{First officer appends one `- Cycle {N}: ...` line per correction round.
The gate reads reviewer findings from here. Cycle 3 escalates to the captain.}

## Out of scope

{What this feature deliberately does not address.}
```

## 文件影響規則

本規則適用於 feature `040` 與之後建立的所有 feature。較早建立且仍在進行的 feature
不追溯適用。若其內容明確新增 `## Documentation impact`，則適用本規則。

- `現在更新` 記錄已改變計畫的決定。取得實作證據前，必須明載該行為尚未實作。
- `實作後更新` 只能在指定完成條件通過後，記錄操作方式或 evergreen 現況。程式與必要操作文件放在同一個 PR。
- `不更新` 保護 record 與不相關的正本，避免不必要的修改。
- design worker 負責找出並分類文件。implement worker 負責更新與實作綁定的文件。
  verify worker 檢查實際行為。reviewer 遇到缺漏、過早、矛盾或重複的文件時，必須判定失敗。
- 新增或刪除文件時，更新 `docs/INDEX.md`。若現有文件已負責該主題，不可另建第二份規格正本。

## Commit Discipline

- Commit status changes at dispatch and merge boundaries
- Commit feature body updates when substantive
- Implementation commits land on the worktree branch; merge to main happens via the `pr-merge` mod after PR review
