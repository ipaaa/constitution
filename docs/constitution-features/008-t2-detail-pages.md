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

## Stage Report (review)

### Summary
Independent review of the T2 Detail Page Enhancement implementation on `spacedock-ensign/008-t2-detail-pages`. Verified each acceptance criterion against the diff with line-level evidence, exercised the Markdown renderer's URL allowlist against common script-injection vectors, ran `computeRelated` against the real `discussions.json` shape, and re-ran type-check + production build in the worktree. **Verdict: PASSED.**

### Checklist

1. **Read full implementation diff — DONE.** `git diff --stat main...HEAD` shows 4 files changed: entity doc + `src/app/present/[id]/page.tsx` + two new components (`Markdown.tsx`, `PresentDetail.tsx`). Total +454/-33. Two commits (`3a9b372` feature + `424b06b` stage report).

2. **Acceptance criteria — all DONE.**
   - **Empty-content graceful CTA:** `EmptyContentCTA` at `src/components/PresentDetail.tsx:10-40` replaces the old "Awaiting Transcription" placeholder with two typed CTAs — primary link to `item.link` (lines 23-30) and a pre-populated mailto for volunteer transcription (lines 31-36). Rendered conditionally from `src/app/present/[id]/page.tsx:96-102`.
   - **Markdown rendering for `full_content`:** `Markdown` component at `src/components/Markdown.tsx:91-146` wired in at `src/app/present/[id]/page.tsx:97-99` inside `<article className="prose-serif">`. Supports `#`/`##`/`###` headings, `**bold**`, `[text](url)` links, `>` blockquotes, paragraphs — matches spec scope exactly.
   - **2-3 related articles:** `RelatedArticles` at `src/components/PresentDetail.tsx:176-227` with `limit=3` and `md:grid-cols-3`; rendered at `src/app/present/[id]/page.tsx:138`.
   - **Share feature:** `ShareActions` at `src/components/PresentDetail.tsx:46-147` exposes copy-link, Twitter, Facebook. Two variants: `header` (icon buttons in sticky bar, line 47 of page) and `inline` (pill buttons in footer, line 133 of page).
   - **`owl_depth_comment` display:** gating logic at `src/app/present/[id]/page.tsx:31` (`const depthComment = item.owl_depth_comment || item.owl_comment`) and conditional block at lines 106-118. When both fields are empty, the decorative "Arxiv Review" header and the trailing caption are hidden entirely (no orphan label).

3. **Markdown renderer security review — PASSED.**
   - No `dangerouslySetInnerHTML` in the new code (verified via grep; the two existing uses in `src/app/present/page.tsx` and `src/app/past/page.tsx` are pre-existing and out of scope for this feature).
   - URL allowlist at `src/components/Markdown.tsx:7-12` correctly blocks `javascript:` (case-insensitive, including with leading whitespace after trim), `data:`, `vbscript:`, `file:`, `ftp:` — verified by direct regex testing.
   - User-authored text is composed as React nodes via `renderInline` (lines 16-58) and React automatically escapes text children, so no HTML/XSS injection is possible even for raw `<script>` strings.
   - **Minor note (non-blocking):** the allowlist accepts protocol-relative URLs (`//evil.com`) because `^(...|\/|...)` matches a single leading slash. Browsers resolve these to `https://evil.com`, so `[x](//evil.com)` could silently navigate users off-site; it's not a code-execution vector. Given the content pipeline is author-controlled (Google Sheets → volunteer transcription, not open user comments), this is acceptable for ship. If tightened later, change the pattern to require two leading slashes before a path (`\/(?!\/)` negative lookahead) or a stricter scheme check.

4. **Markdown renderer scope review — DONE.** Implemented subset (headings h1-h3, bold, links, blockquotes + paragraph/line-break handling) matches the entity's "標題、粗體、連結、引用" bullet exactly. Renderer is ~110 LOC and auditable. Real `discussions.json` currently has zero entries with `full_content` populated (all 9 rows have the field empty or absent), so the production runtime path is the `EmptyContentCTA` branch — exercised and clean. The Markdown path is unit-testable by inspection and the parser handles edge cases (CRLF normalization line 66, empty blocks line 71, mixed blockquote detection line 80).

5. **Related articles logic — DONE.**
   - `relatedScore` at `src/components/PresentDetail.tsx:151-156` is deterministic (pure function of category equality + vibe equality).
   - Self exclusion at line 164 (`d.id !== current.id`) plus `tldr` exclusion (`d.id !== 'tldr'`) — verified against real data: `computeRelated(self, ...)` never returns self or the `Official TL;DR` row.
   - Empty-result path: `return null` at line 184 when `related.length === 0`, so the entire section (header + grid + "更多檔案" CTA) is unrendered cleanly.
   - Exercised against all 9 real items: `d1 → [d9]`, `d2 → [d4, d6, d5]`, `d7 → [d8, d9]`, `tldr → []`, etc. Score-ties broken by descending year (line 170). Vibe match (3pts) correctly outweighs category match (2pts).
   - Responsive grid: `grid-cols-1 md:grid-cols-3` at line 202 — single column on mobile, 3 columns at md (768px+). `line-clamp-3` on title and `truncate` on author (lines 213, 217) prevent overflow on narrow cards.

6. **Share feature — DONE.**
   - Clipboard fallback at `src/components/PresentDetail.tsx:49-72`: primary path uses `navigator.clipboard.writeText`; fallback creates an off-screen `<textarea>`, selects it, and uses `document.execCommand('copy')` — standard pattern for non-secure contexts / older browsers. Wrapped in try/catch with visual feedback reset on failure.
   - Twitter URL: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` (line 83) — both components properly encoded.
   - Facebook URL: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` (line 84) — URL-encoded.
   - SSR safety: `getCurrentUrl()` at line 44 returns `''` when `typeof window === 'undefined'`, but — critically — the function is only called inside `onClick` handlers (`handleCopy`, `handleOpenShare`), never during render. So no hydration mismatch is possible. The `useState(false)` initial for `copied` is stable across server/client. Verified by reading the component top-to-bottom.
   - Popup opened via `window.open(..., '_blank', 'noopener,noreferrer')` (line 79) — safe window opener.

7. **`owl_depth_comment` gating — DONE.** When `owl_depth_comment` and `owl_comment` are both absent/empty, `depthComment` is falsy (line 31 of page) and the whole `<section className="mt-20 pt-12 border-t-2 ...">` block (lines 106-118) is skipped, so neither the "Arxiv Review" label nor the italic caption render. When either field has content, the existing `JudgeOwlComment` visual treatment is preserved untouched (still using the original `isDepth` styling at `src/components/SharedPresent.tsx:40-55`). Note: real `discussions.json` has 8/9 rows with `owl_comment` and 0/9 with `owl_depth_comment`, so most pages currently show the regular yellow-owl card as before; gating only kicks in for the TL;DR row which has neither.

8. **Code quality — DONE.**
   - No `any` types in any of the three touched/new files (grep-verified).
   - Tailwind palette consistent: `#fcfcfc` (page bg, page.tsx:34), `#D32F2F` (author chip + big CTA, page.tsx:77, 128), `#f8f9fa` (abstract + blockquote, page.tsx:89 + Markdown.tsx:122). No inline `style={}` additions.
   - Component boundaries are clean: `Markdown.tsx` is pure/stateless; `PresentDetail.tsx` groups three related client-component widgets; the page itself stays thin and orchestrates.
   - Typed `DiscussionItem` reused from `SharedPresent`, not redefined.
   - `src/data/discussions.json` untouched: `git diff --stat main...HEAD -- src/data/` returns empty.

9. **Build verification in the worktree — DONE.**
   - `npx tsc --noEmit` — clean, no errors.
   - `npx next build` — succeeds. Output: "Compiled successfully in 1628.6ms", 8/8 static pages generated (`/`, `/_not-found`, `/future`, `/past`, `/present`, `/preview` static; `/present/[id]` dynamic as before). No TypeScript or lint errors. No regressions to `/past`, `/future`, or `/present` list page (all three still prerender as static content). The Next.js "multiple lockfiles" warning is environmental (the worktree has its own `package-lock.json`) and not caused by this PR.

10. **Verdict — PASSED.** Every acceptance criterion from the entity description is met with line-level evidence. The custom Markdown renderer is the highest-risk surface and it blocks all major script-injection URL schemes, composes user text through React (not HTML), and matches the entity's declared scope exactly. Share feature has a correct clipboard fallback and no SSR hydration risks. Related-articles logic is deterministic, tested against real data, and degrades to `null` cleanly. `owl_depth_comment` gating fixes the orphan-label issue as specified. Build + type-check are clean; no regressions to other tracks. `discussions.json` untouched. Single minor non-blocking observation (protocol-relative URLs `//evil.com` pass the allowlist), documented above for future hardening — not a ship blocker given the closed content pipeline.
