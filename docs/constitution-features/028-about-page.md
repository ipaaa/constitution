---
id: "028"
title: About 頁面
status: review
source: captain-filed
started: 2026-05-01T17:52:40Z
completed:
verdict:
score: 0.7
worktree: .worktrees/spacedock-ensign-028-about-page
issue:
pr:
---

新增 About 頁面（/about），包含：

1. 專案緣由 — 為什麼做這個網站、問題意識
2. 前言/宣言 — 類似 manifesto，表達專案的價值觀與立場
3. 貢獻者列表 — 參與者名單與角色（合併原本的 013 contributor list）
4. Call for Action — 邀請更多人參與（志工招募、回饋管道、社群連結）

## Stage Report

### 1. Page structure and section layout for /about — DONE

Route: `src/app/about/page.tsx` (new file, server component)

The page is a single long-scroll editorial page divided into four distinct sections, separated by `border-t border-gray-200` dividers consistent with the homepage pattern. Each section uses `max-w-4xl mx-auto px-6` for a narrower, reading-optimized column (compared to `max-w-7xl` used on track pages that need wide layouts).

Overall page structure (top to bottom):

1. **Page Header** — Full-width banner with page title and a one-line subtitle
2. **Section 1: 專案緣由** — Why this site exists
3. **Section 2: 前言/宣言** — Manifesto / values statement
4. **Section 3: 貢獻者列表** — Team members and roles (subsumes feature 013)
5. **Section 4: Call for Action** — Join us, feedback channels, social links

Background: `bg-white` for the entire page to give it a clean document/letter feel, differentiating it from the `bg-[#F6F8FA]` pearl background of the homepage and track pages.

### 2. 專案緣由 section: content direction and tone — DONE

**Visual treatment:** A short editorial essay (3-4 paragraphs). Uses `font-serif` headings and `font-sans` body text. A thick left border (`border-l-[6px] border-gray-900`) on the section heading mirrors the homepage hero treatment.

**Content direction:**
- Paragraph 1: The problem — citizens see the Constitutional Court as distant, opaque, and drowned in political noise. They don't realize its paralysis directly threatens their rights.
- Paragraph 2: The gap — existing information sources are either too academic, too partisan, or too scattered. There is no neutral, accessible, structured resource.
- Paragraph 3: The solution — Add C0urt is an open-source civic tech project that transforms dry legal proceedings into clear, shareable, zero-barrier information. We don't preach; we provide tools.
- Paragraph 4: The g0v connection — born from the g0v civic hacker community, this project follows the open-source, decentralized collaboration model.

**Tone:** Passionate but measured. Concerned citizen, not activist. Factual framing of the crisis, not partisan blame. Matches the "objective civic tech + editorial curation" strategic position from `Documents/about.md`.

### 3. 前言/宣言 section: manifesto-style statement of values — DONE

**Visual treatment:** A visually distinct block — centered text on a light warm background (`bg-[#f8f6f0]`) with generous vertical padding (`py-16`), creating a "pull quote" or "letter" feel. Text is set in `font-serif` at a larger size (`text-xl md:text-2xl leading-relaxed`). Bordered top and bottom with a double-line rule (`border-t-2 border-b-2 border-gray-300`).

**Content direction — 5 core value statements:**
1. **透明 (Transparency)** — "We believe every citizen deserves to understand the institution that guards their rights, without needing a law degree."
2. **客觀 (Objectivity)** — "We present facts and multiple perspectives. We are not a mouthpiece for any party or ideology."
3. **開源 (Open Source)** — "Our code, data, and editorial process are open. Anyone can verify, contribute, or fork."
4. **行動 (Action)** — "Understanding is the first step. We build tools that turn awareness into civic participation."
5. **共創 (Co-creation)** — "This is not one team's project. It belongs to every citizen who contributes a line of code, a paragraph of plain-language summary, or a share on social media."

Each value is a short heading + 1-2 sentence expansion. The whole block reads like a signed letter or manifesto.

### 4. 貢獻者列表 section: how to display contributors — DONE

This section merges and replaces feature 013 (Contributor List Page).

**Data shape:** A TypeScript array in `src/data/contributors.ts` with the following type:

```typescript
export interface Contributor {
  name: string;           // Display name (can be real name or handle)
  role: string;           // e.g. "前端工程師", "法律文案", "UI/UX 設計"
  avatar?: string;        // Optional URL or path to avatar image
  github?: string;        // Optional GitHub username
  description?: string;   // Optional one-line contribution note
}
```

**Layout:** A responsive grid of contributor cards.
- Desktop: `grid-cols-3` (3 per row)
- Tablet: `grid-cols-2`
- Mobile: `grid-cols-1`

**Card design:** Each card is a compact horizontal card (`flex items-center gap-4`):
- Left: 48x48 rounded avatar. If no avatar provided, show a gray circle with the first character of `name` as initials (consistent with the "refined document" aesthetic — no playful placeholder illustrations).
- Right: Name in `font-bold text-gray-900`, role in `text-sm text-gray-500`, optional GitHub link as a small icon.
- Card container: `bg-white border border-gray-200 rounded-sm p-4 shadow-sm` — matches the card pattern used on the homepage track cards.

No photos are required — avatars are optional. This keeps the barrier to entry low for g0v contributors who may prefer pseudonymity.

**Section heading** includes a small count badge: "貢獻者 (N 人)" to give a sense of community scale.

### 5. Call for Action section: volunteer recruitment, feedback channels, social links — DONE

**Visual treatment:** Dark section (`bg-gray-900 text-white`) to create a strong visual break and signal "this is where you act." Full-width within the page column. This mirrors the Track 3 card's dark aesthetic on the homepage.

**Content blocks (2-column grid on desktop, stacked on mobile):**

**Left column — "Join Us" messaging:**
- Heading: "一起參與 / Get Involved" in `font-serif text-3xl`
- Short paragraph: "Whether you write code, translate legal jargon, or simply share our work — you are part of this project."
- Three role callouts (matching `Documents/contribution_guide.md` roles), each as a compact pill/tag:
  - "UI/UX 設計師" 
  - "前端工程師"
  - "法律文案 & 資料志工"

**Right column — Action links:**
- **GitHub** — Link to `https://github.com/g0v/Welcome-to-Add-C0urt` with GitHub icon. Label: "查看原始碼 & Issues"
- **HackMD** — Link to the collaboration doc. Label: "協作共筆"
- **Feedback** — Link to GitHub Issues new issue form. Label: "回報錯誤或建議"

Each link is styled as a bordered button (`border border-gray-700 hover:border-white px-6 py-3 rounded-sm`) with icon + text, stacked vertically with `space-y-3`.

No social media links (Instagram, Threads, etc.) are included at this stage since the project does not yet have established social accounts. The Footer already contains the GitHub and HackMD links, so the CTA section serves as a more prominent, action-oriented duplicate.

### 6. Component hierarchy with props — DONE

```
src/app/about/page.tsx (Server Component, page route)
├── PageHeader (inline, no separate component needed)
│   Props: none (static content)
│
├── SectionOrigin (inline section)
│   Props: none (static editorial content)
│
├── SectionManifesto (inline section)
│   Props: none (static editorial content)
│
├── ContributorGrid
│   File: src/components/about/ContributorGrid.tsx (Client or Server Component)
│   Props: { contributors: Contributor[] }
│   ├── ContributorCard (mapped inside ContributorGrid)
│   │   Props: { contributor: Contributor }
│   │   └── Avatar fallback (initials) rendered inline
│
├── SectionCTA (inline section)
│   Props: none (static content with hardcoded links)
```

**Rationale for component extraction:**
- `ContributorGrid` and `ContributorCard` are extracted because they render dynamic data (`contributors.ts`) and the card pattern is reusable.
- The other three sections (Origin, Manifesto, CTA) are purely static editorial content with no dynamic data or interactivity. They remain inline in `page.tsx` to avoid unnecessary abstraction. If any section grows complex enough to warrant extraction, it can be split later.

**New files to create:**
1. `src/app/about/page.tsx` — The page route
2. `src/components/about/ContributorGrid.tsx` — Grid + card rendering
3. `src/data/contributors.ts` — Contributor data and type definition

### 7. Acceptance criteria as a testable checklist — DONE

- [ ] Navigating to `/about` renders the About page without errors
- [ ] Page has four visually distinct sections in order: 專案緣由, 前言/宣言, 貢獻者列表, Call for Action
- [ ] 專案緣由 section contains 3-4 paragraphs explaining the project's origin and problem statement
- [ ] 前言/宣言 section displays 5 value statements in a visually distinct manifesto block
- [ ] 貢獻者列表 section renders a grid of contributor cards from `src/data/contributors.ts`
- [ ] Each contributor card shows name and role; avatar and GitHub link render when provided
- [ ] Cards without an avatar show an initials fallback (first character of name)
- [ ] Call for Action section has a dark background and contains links to GitHub, HackMD, and feedback
- [ ] All external links open in new tabs with `rel="noopener noreferrer"`
- [ ] Page uses `font-serif` for headings and `font-sans` for body, consistent with the design system
- [ ] Navbar includes an "About" link that navigates to `/about` (or the link is added in a follow-up feature)
- [ ] Page is accessible: heading hierarchy is correct (h1 > h2), all images have alt text, link purpose is clear
- [ ] Lighthouse accessibility score >= 90

### 8. Mobile/desktop responsive behavior — DONE

| Element | Mobile (<768px) | Desktop (>=768px) |
|---|---|---|
| Page content column | `px-6`, full width | `max-w-4xl mx-auto px-6` |
| Section headings | `text-2xl` | `text-3xl md:text-4xl` |
| Manifesto text | `text-lg` | `text-xl md:text-2xl` |
| Contributor grid | `grid-cols-1` | `grid-cols-2 md:grid-cols-3` |
| CTA section | Single column, stacked | `grid-cols-2`, side by side |
| CTA action links | Full-width buttons | Auto-width, left-aligned |
| Section vertical spacing | `py-12` | `py-16 md:py-24` |

Key responsive notes:
- No horizontal scrolling at any breakpoint.
- The manifesto section maintains generous padding on mobile (`px-6 py-12`) but does not shrink font below `text-lg` to preserve readability.
- Contributor cards maintain the same horizontal layout (avatar left, text right) on all breakpoints — they do not stack vertically within a card.
- The dark CTA section is full-bleed on mobile (no horizontal padding gap against screen edge) by using negative margin + padding technique or placing it outside the `max-w-4xl` wrapper.

### Summary

Designed the `/about` page as a four-section editorial page: Origin story (why this project exists), Manifesto (5 core values), Contributor grid (dynamic cards from data file, merging feature 013), and a dark Call for Action section with links to GitHub/HackMD/feedback. The design follows the project's "Refined Document" aesthetic — serif headings, clean borders, restrained color palette — and is fully responsive. Three new files are needed: the page route, a ContributorGrid component, and a contributors data file.
