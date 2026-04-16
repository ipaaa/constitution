---
id: "008"
title: T2 Detail Page Enhancement
status: review
source: codebase audit
started: 2026-04-16T22:13:16Z
completed:
verdict:
score: 0.7
worktree: .worktrees/spacedock-ensign-008-t2-detail-pages
issue:
pr:
mod-block: merge:pr-merge
---

T2 的文章詳情頁（`src/app/present/[id]/page.tsx`）已經實作，但幾乎所有文章都顯示「等待轉譯」狀態，因為 `discussions.json` 中的 `full_content` 欄位都是空的。

這個 feature 處理的是 **程式碼層面** 的改善，不是內容填入（那是 Google Sheets 管線的事）：

### 需要實作
- **空內容的優雅降級：** 目前顯示「Awaiting Transcription」但沒有 CTA — 應該引導使用者去原始連結閱讀全文，或加入「協助轉譯」的志工呼籲
- **Markdown 渲染：** 當 `full_content` 有內容時，支援基本 Markdown 格式（標題、粗體、連結、引用）
- **相關文章推薦：** 根據 category 或 vibe tag 在詳情頁底部顯示 2-3 篇相關文章
- **分享功能：** 加入複製連結 / 社群分享按鈕（設計文件有提到）
- **`owl_depth_comment` 顯示：** 目前有 UI 但資料幾乎都是空的 — 需要確保有內容時能正確顯示深度評論

## Stage Report

### Summary
Enhanced the T2 article detail page (`src/app/present/[id]/page.tsx`) with a safe Markdown renderer, a graceful empty-content CTA, a share widget (copy-link + Twitter + Facebook), category/vibe-based related-article recommendations, and conditional rendering for the owl-depth commentary block. All logic is localized to the detail route and two new co-located components under `src/components/`. Type check, ESLint, and `next build` all pass cleanly.

### Markdown renderer choice
Chose a minimal custom renderer over pulling in a dependency (e.g., `react-markdown` + `remark`). Rationale:
- Spec calls for only 4 features: headings, bold, links, blockquotes. The custom renderer is ~110 LOC and matches this scope exactly.
- Zero new runtime deps keeps the bundle small and aligns with the existing lightweight `package.json` (only `lucide-react`, `next`, `react`).
- The renderer does NOT support raw HTML passthrough and applies a URL scheme allowlist (`http(s)://`, `mailto:`, `/`, `./`, `../`, `#`) for links, so user-authored Markdown cannot inject unsafe URLs or scripts. The existing T2 list page already uses a narrow `dangerouslySetInnerHTML` pattern for the TL;DR `**bold**` substitution; the new renderer avoids that by composing React nodes.

### Checklist

1. **Empty-content graceful degradation — DONE.** `EmptyContentCTA` component in `src/components/PresentDetail.tsx` replaces the old placeholder with two CTAs: a primary "前往原始出處" button linking to `item.link`, and a "我想協助轉譯" mailto button seeded with the article title/id.
2. **Markdown rendering — DONE.** `src/components/Markdown.tsx` parses `#`/`##`/`###` headings, `**bold**`, `[text](url)` links, and `>`-prefixed blockquotes. Inline formatting composes into React nodes; no `dangerouslySetInnerHTML`. Typography matches existing detail-page rules (serif, `text-gray-800/900`, blockquote uses the same `bg-[#f8f9fa]` + left-border treatment as the abstract card).
3. **Related articles recommendation — DONE.** `RelatedArticles` scores remaining items by category match (+2) and matching vibe tag (+3), sorts by score then year-desc, takes top 3. TL;DR entry excluded by id. Renders a 3-column grid at md+, stacks on mobile. Fails silently (returns `null`) if nothing scores > 0.
4. **Share feature — DONE.** `ShareActions` component offers copy-link (with `navigator.clipboard` primary + textarea fallback), Twitter intent URL, and Facebook sharer. Exposed in two variants: `header` (icon buttons in the sticky bar) and `inline` (full pill buttons in the footer). URL is read at click-time to avoid SSR hydration mismatches.
5. **`owl_depth_comment` display — DONE.** Existing `JudgeOwlComment` already hides when empty; I additionally gated the surrounding "Arxiv Review" section header on a truthy `depthComment = owl_depth_comment || owl_comment`, so the decorative header and caption no longer render when there is no comment. When present, the existing visual treatment is preserved.
6. **Scope localized — DONE.** Changes limited to: `src/app/present/[id]/page.tsx` (modified), `src/components/Markdown.tsx` (new), `src/components/PresentDetail.tsx` (new). No Track 1 or Track 3 files touched (`git diff --stat` confirms).
7. **Next.js + Tailwind conventions — DONE.** All styling via Tailwind utility classes matching existing palette (`#fcfcfc`, `#D32F2F`, `#f8f9fa`, etc.); no inline `style={}` attributes; no `any` types (components export typed props; `computeRelated` fully typed). The page remains a Next.js app-router client component using the existing `use(params)` pattern.
8. **No regressions — DONE.** Full `next build` succeeds; all static pages (`/`, `/past`, `/present`, `/future`, `/preview`) still generate; `/present/[id]` remains dynamic as before. `discussions.json` untouched.
9. **Build verification — DONE.** `npx tsc --noEmit` is clean. `npx eslint` on the three changed files is clean. `npx next build` succeeds: "Compiled successfully in 2.2s", 8/8 static pages generated, no TypeScript or lint errors.
10. **Commit on worktree branch — DONE.** Single commit `3a9b372` on `spacedock-ensign/008-t2-detail-pages` with message `feat(present/detail): add markdown rendering, share, related, empty CTA`. Working tree clean after commit.

### Notes for reviewers
- Volunteer-transcription CTA uses `mailto:volunteer@addcourt.tw` as a placeholder inbox. Swap for a real submission form or inbox later if the team has one.
- Markdown renderer intentionally omits lists, code blocks, images, and tables — out of scope per the entity bullet list. If future content needs those, extend `parseBlocks` / `renderInline` rather than swapping to a third-party renderer (current behavior is auditable in ~110 LOC).
- Related-articles scoring is deliberately simple (category + vibe only). If the team later adds tag arrays or author-overlap signals, extend `relatedScore` in `src/components/PresentDetail.tsx`.
