---
id: "030"
title: T1 前言：為何回顧憲法釋憲案
status: implement
source: captain-filed
started: 2026-05-01T20:23:06Z
completed:
verdict:
score: 0.65
worktree: .worktrees/spacedock-ensign-030-t1-intro-text
issue:
pr:
---

在 T1（時光機）頁面加一段前言，說明為什麼要回顧歷史上的憲法釋憲案，幫助讀者理解這些過去的判決跟現在的生活有什麼關係。

## Stage Report

### 1. Placement — DONE

The intro text goes **between the existing hero section and the sticky search bar**, as a new `<section>` element inserted after the hero's closing `</section>` tag (after line 393 in `page.tsx`). This is the natural reading position: the hero hooks the reader with the poetic tagline, then the intro paragraph gives the "why this matters" context before they dive into the decade cards.

### 2. Intro Text Content — DONE

Three paragraphs, plain Chinese:

> **為什麼要回頭看這些釋憲案？**
>
> 你可能從來沒想過，每天自由上網、出門不需要跟警察報備、說錯話不會被關——這些「理所當然」的事，其實都是有人打過仗才換來的。那些仗，打在憲法法庭裡。
>
> 從 1990 年代開始，大法官透過一次又一次的釋憲，把寫在紙上的憲法變成真正保護人民的盾牌。集會自由、言論自由、隱私權、訴訟權……每一條權利的背後，都有一個真實的案件、一群真實的人。
>
> 現在，這道防線正因為政治僵局面臨癱瘓。如果你想知道我們可能失去什麼，最好的方式就是先看看我們曾經贏得了什麼。往下滑，翻開這本課本。

### 3. Visual Treatment — DONE

- **Background:** `bg-[var(--color-textbook-bg)]` (same parchment tone as the rest of the page) with `bg-paper-texture` for continuity.
- **Typography:** `font-serif` for all text. Heading uses `text-2xl md:text-3xl font-black`. Body paragraphs use `text-base md:text-lg leading-relaxed text-[var(--color-textbook-text)]/80`.
- **Layout:** Centered column, `max-w-2xl mx-auto`, `px-6 py-16 md:py-24`. Generous vertical padding to give the text breathing room between the hero and the search bar.
- **Accent:** A thin top border in accent red (`border-t-2 border-[var(--color-accent-red)]`) on the heading to visually anchor it and echo the red accents used throughout T1.
- **No background image or illustration** — this is a text-only moment of reflection. Clean and calm.

### 4. Component Changes Needed — DONE

**No new component file required.** The intro is a simple static `<section>` added inline in `src/app/past/page.tsx` inside the `PastTrack` component's return JSX.

Changes to `src/app/past/page.tsx`:
- Insert a new `<section>` block between the hero section (line ~393) and the sticky search bar `<div>` (line ~396).
- The section contains: one `<h2>` heading, three `<p>` paragraphs.
- No new state, hooks, data, or imports needed.

Approximate JSX to insert:

```tsx
{/* Intro: Why look back at constitutional rulings */}
<section
  className="bg-[var(--color-textbook-bg)] bg-paper-texture px-6 py-16 md:py-24"
  aria-label="前言：為什麼要回顧釋憲案"
>
  <div className="max-w-2xl mx-auto">
    <h2 className="text-2xl md:text-3xl font-black font-serif text-[var(--color-textbook-text)] border-t-2 border-[var(--color-accent-red)] pt-6 mb-8">
      為什麼要回頭看這些釋憲案？
    </h2>
    <p className="text-base md:text-lg leading-relaxed text-[var(--color-textbook-text)]/80 font-serif mb-6">
      你可能從來沒想過，每天自由上網、出門不需要跟警察報備、說錯話不會被關——這些「理所當然」的事，其實都是有人打過仗才換來的。那些仗，打在憲法法庭裡。
    </p>
    <p className="text-base md:text-lg leading-relaxed text-[var(--color-textbook-text)]/80 font-serif mb-6">
      從 1990 年代開始，大法官透過一次又一次的釋憲，把寫在紙上的憲法變成真正保護人民的盾牌。集會自由、言論自由、隱私權、訴訟權……每一條權利的背後，都有一個真實的案件、一群真實的人。
    </p>
    <p className="text-base md:text-lg leading-relaxed text-[var(--color-textbook-text)]/80 font-serif">
      現在，這道防線正因為政治僵局面臨癱瘓。如果你想知道我們可能失去什麼，最好的方式就是先看看我們曾經贏得了什麼。往下滑，翻開這本課本。
    </p>
  </div>
</section>
```

### 5. Acceptance Criteria — DONE

- [ ] A new section appears between the hero and the search bar on the T1 page
- [ ] The heading reads "為什麼要回頭看這些釋憲案？"
- [ ] Three paragraphs of intro text are visible and readable
- [ ] Text uses serif font consistent with the rest of the T1 page
- [ ] Section has parchment background (`--color-textbook-bg`) with paper texture
- [ ] Red top border accent is visible on the heading
- [ ] No new components, hooks, or data dependencies are introduced
- [ ] Page scrolls naturally from hero -> intro -> search bar -> decade cards
- [ ] Lighthouse accessibility audit passes (heading hierarchy, aria-label, contrast)

### 6. Mobile/Desktop Responsive Behavior — DONE

- **Desktop (md+):** `py-24`, heading `text-3xl`, body `text-lg`. `max-w-2xl` keeps line length comfortable (~60-70 chars).
- **Mobile (<md):** `py-16`, heading `text-2xl`, body `text-base`. Full-width with `px-6` side padding. Text stacks naturally — no layout changes needed since it's a single centered column.
- No horizontal scrolling, no overflow issues. The section is purely vertical text content.
