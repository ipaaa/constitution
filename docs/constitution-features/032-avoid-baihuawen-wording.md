---
id: "032"
title: 全站文案避免使用「白話文」
status: implement
source: captain-filed
started: 2026-05-01T20:45:49Z
completed:
verdict:
score: 0.6
worktree: .worktrees/spacedock-ensign-032-avoid-baihuawen
issue:
pr: #26
mod-block: merge:pr-merge
---

全站文案中避免使用「白話文」三個字，避免與「法律白話文運動」混淆。搜尋所有程式碼和資料檔案中的「白話文」，替換為其他用詞（如「簡明語言」、「易懂說明」等）。

## Stage Report

### Summary
Replaced all standalone「白話文」references across source code, data files, and documentation with context-appropriate alternatives. The organization name「法律白話文運動」in `discussions.json` (author field for d7, d8, d9) and `spreadsheet_template.md` was intentionally preserved as it is a proper noun.

### Replacements

| File | Original | Replacement |
|:-----|:---------|:------------|
| `src/app/controversy-timeline/page.tsx:6` | 白話文解說 | 淺顯說明 |
| `src/app/controversy-timeline/page.tsx:36` | 以白話文整理了 | 以淺顯易懂的方式整理了 |
| `src/app/controversy-timeline/page.tsx:56` | 以白話文改寫 | 以簡明語言改寫 |
| `src/app/preview/page.tsx:54` | 閱讀完整白話文案由 | 閱讀完整易懂說明 |
| `src/data/contributors.ts:28` | 法律白話文撰寫與校對 | 法律簡明文案撰寫與校對 |
| `Documents/contribution_guide.md:26` | 白話文轉譯 (最關鍵) | 簡明語言轉譯 (最關鍵) |
| `Documents/editorial_review_workflow.md:13` | 白話文轉譯初稿撰寫 | 簡明語言轉譯初稿撰寫 |
| `Documents/about.md:18` | 判決白話文 | 判決易懂說明 |
| `docs/.../029-...-lazybag.md:22` | 白話文，讓沒有法律背景的讀者也能看懂 | 淺顯說明，讓沒有法律背景的讀者也能看懂 |
| `docs/.../029-...-lazybag.md:205` | plain Chinese (白話文) | plain Chinese (簡明語言) |

### Intentionally preserved

- `src/data/discussions.json` lines 102, 114, 126: `"author": "法律白話文運動"` — proper noun (organization/channel name)
- `Documents/spreadsheet_template.md` lines 30, 37: `法律白話文運動` — proper noun in template data
- `docs/constitution-features/_archive/005-*.md`, `017-*.md`: historical stage reports referencing the old `⚖️ 法律白話文` vibe tag name — these document what tags existed before they were renamed in feature 017; altering them would distort the historical record

### Build verification
`npx next build` passes — all 11 routes generated successfully, no TypeScript errors.
