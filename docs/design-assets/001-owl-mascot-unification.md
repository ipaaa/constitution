---
id: "001"
title: 貓頭鷹法官視覺統一
status: draft
source: constitution-features/023
started: 2026-05-01T19:58:11Z
completed:
verdict:
score: 0.7
worktree:
issue:
pr:
---

統一全站貓頭鷹法官吉祥物的視覺形象：

1. 以 T2 中的貓頭鷹形象為基準，重新製作首頁的貓頭鷹主圖（目前首頁 owl.png 風格可能與 T2 不一致）
2. T1（時光機）和 T3（未來）頁面加入貓頭鷹法官元素，讓吉祥物貫穿三個軌道

需要產出：
- 首頁主圖 owl.png 重製
- T1 頁面裝飾用貓頭鷹插圖
- T3 頁面裝飾用貓頭鷹插圖
- 風格統一的設計指南

---

## Design Brief

### Current State Audit

**Homepage owl (`public/owl.png`)**
- 640x640px PNG, cartoon style
- Depicts an owl in purple graduation robe and mortarboard, holding an "ABC" book
- Displayed at 360x360 logical pixels inside a white bordered card with "Mascot" red label
- Used in `src/app/page.tsx:48`

**T2 JudgeOwlComment component (`src/components/SharedPresent.tsx:63-78`)**
- Reuses the same `owl.png` at 56x56px (`w-14 h-14`) as an avatar/icon
- Appears as a floating mascot above comment boxes with yellow (`#FFF9C4` / `#FBC02D`) or green (`#E8F5E9` / `#4CAF50`) styling
- Text signed as "貓頭鷹法官．小點評" or "貓頭鷹法官．深度領航"
- Also referenced with the emoji 🦉 in the T2 video grid cards (`src/app/present/page.tsx:309`)

**T1 (Past / 時光機) page** — No owl presence currently. Page uses a timeline/decade-grouped layout with textbook-to-reality visual contrast. Neutral tones, serif headings, red accent `#D32F2F`.

**T3 (Future / 憲庭載入中) page** — No owl presence currently. Dark crisis-mode aesthetic with `bg-gray-900`, red pulse indicators, monospace "Constitutional Emergency" styling.

### Target Visual Style

The unified owl character is **貓頭鷹法官 (Judge Owl)** — a wise, approachable judicial figure. The reference design (current `owl.png`) establishes the core identity:

- **Species:** Owl with brown plumage and large expressive eyes
- **Attire:** Purple judicial/academic robe with green trim, dark purple mortarboard
- **Personality:** Scholarly, authoritative yet friendly, approachable for a civic education audience
- **Art style:** Clean vector-style cartoon illustration, flat shading, minimal gradients, light gray or transparent background

All new assets must maintain this character design consistently. The owl should always be recognizable as the same character across all three tracks.

### Site Color Palette Reference

| Token | Hex | Usage |
|-------|-----|-------|
| pearl | `#F6F8FA` | Page background |
| accent-red | `#D32F2F` | Labels, borders, urgency |
| solar / FFE082 | `#F7C04A` / `#FFE082` | Highlights, owl comment borders |
| midnight | `#1A1B4B` | Dark backgrounds |
| sage | `#7AA874` | Depth/green variant |
| gray-900 | `#111827` | T3 crisis background, dark text |

Fonts: Manrope (sans), Lora/Noto Serif TC (serif), Caveat (handwriting).

---

### Deliverable Specifications

#### Asset 1: Homepage Hero Owl (`public/owl.png` replacement)

- **Purpose:** Primary mascot image on the landing page hero section
- **Dimensions:** 640x640px (displayed at 360x360 CSS px, needs 2x for retina)
- **Format:** PNG with transparent background
- **Pose:** Standing front-facing, holding a book (can be labeled "憲法" instead of "ABC" to match site theme). Confident, welcoming posture.
- **Style:** Same character as current, but refined: cleaner lines, slightly more mature/judicial presence (less "kindergarten", more "civic educator"). Keep the purple robe and mortarboard.
- **Background:** Transparent (the component wraps it in a white card)
- **Notes:** This is the hero image — it must be polished. The card wrapper adds a red "Mascot" label and a rotated shadow card behind it.

#### Asset 2: T1 (Past/時光機) Decorative Owl

- **Purpose:** Thematic mascot element for the history timeline page
- **Placement:** Small decorative element in the page header area, beside or below the page title. Not a full hero — more of a guide/narrator figure.
- **Dimensions:** 200x200px PNG (displayed at ~80-100px)
- **Format:** PNG with transparent background
- **Pose:** Owl wearing the same judicial robe, but holding or reading from a scroll or old textbook. Looking slightly to the side as if reviewing history. Could also wear small reading glasses.
- **Style:** Same character, warm/sepia-tinted color treatment to match the textbook aesthetic (`#F3EBD1` textbook-bg tones)
- **Filename:** `public/owl-past.png`

#### Asset 3: T3 (Future/憲庭載入中) Decorative Owl

- **Purpose:** Thematic mascot element for the crisis/future page
- **Placement:** Small element in the header or crisis banner area, reinforcing the "system overloaded" theme
- **Dimensions:** 200x200px PNG (displayed at ~80-100px)
- **Format:** PNG with transparent background
- **Pose:** Owl in judicial robe with a concerned or determined expression, perhaps holding a gavel or pointing forward. Conveys urgency without being alarming.
- **Style:** Same character, but with slightly desaturated or cooler color treatment to match the dark crisis aesthetic. The purple robe works well against dark backgrounds.
- **Filename:** `public/owl-future.png`

#### Asset 4: Owl Avatar for Comment Component (optional refinement)

- **Purpose:** The existing `JudgeOwlComment` component uses the full 640px owl.png scaled down to 56x56px. A purpose-built avatar would be sharper.
- **Dimensions:** 112x112px PNG (displayed at 56x56, 2x retina)
- **Format:** PNG with transparent background
- **Pose:** Head/bust crop of the owl — just face and mortarboard, friendly expression
- **Filename:** `public/owl-avatar.png`
- **Priority:** Nice-to-have, not required for initial unification

---

## Stage Report

1. **Audit current owl assets: homepage owl.png, T2 JudgeOwlComment mascot, any other owl references** — DONE. Found one shared asset `public/owl.png` (640x640) used in homepage hero (`src/app/page.tsx:48`) and T2 comment component (`src/components/SharedPresent.tsx:68`). Emoji reference 🦉 in T2 grid cards (`src/app/present/page.tsx:309`).

2. **Define the target visual style based on T2 owl character** — DONE. Defined as vector-style cartoon Judge Owl in purple judicial robe with mortarboard, scholarly and approachable character. All assets must be recognizably the same character.

3. **Spec for homepage owl.png replacement: dimensions, style, pose** — DONE. 640x640px transparent PNG, front-facing judicial owl holding a "憲法" book, refined from current style to be slightly more mature/civic.

4. **Spec for T1 owl element: where to place, size, purpose** — DONE. 200x200px `owl-past.png`, history-reading pose with scroll/textbook, warm-toned, placed in the T1 page header as a narrator/guide element.

5. **Spec for T3 owl element: where to place, size, purpose** — DONE. 200x200px `owl-future.png`, determined/concerned pose with gavel, cool-toned for dark background, placed in T3 header or crisis banner.

6. **Deliverable list with file formats and sizes** — DONE. Four deliverables specified: (1) `owl.png` 640x640 hero replacement, (2) `owl-past.png` 200x200 T1 decoration, (3) `owl-future.png` 200x200 T3 decoration, (4) optional `owl-avatar.png` 112x112 comment component avatar.

### Summary

Completed a full audit of owl mascot usage across the site and wrote a detailed design brief. The current `owl.png` (640x640, cartoon judge owl) is used in two places: the homepage hero and the T2 JudgeOwlComment component. T1 and T3 have no owl presence. The brief specifies four deliverables to unify the mascot across all three tracks, with exact dimensions, filenames, poses, color treatments, and placement guidance for each.

## Stage Report: review

- DONE: Visual quality assessment compares each produced owl asset against the requested dimensions, pose, transparency/background needs, and intended page context.
  Inspected `public/owl.png`, `public/owl_frontpage.png`, `public/owl_past.png`, `public/owl_future.png`, and `public/owl_comment.png` with `file`, `sips -g pixelWidth -g pixelHeight -g hasAlpha`, and direct image review; the new files are polished RGBA 2048x2048 images, but the requested deliverables were 640x640 `owl.png`, 200x200 `owl-past.png`, 200x200 `owl-future.png`, and optional 112x112 `owl-avatar.png`. `public/owl.png` is still 640x640 RGB with a light background and the old ABC book, so the homepage replacement is not actually in place. The T1 image reads correctly as a history/scroll pose but is oversized and named `owl_past.png`; the T3 image reads as urgent/future with gavel and cool overlays but is oversized and named `owl_future.png`; the comment asset is a friendly bust crop but is oversized and named `owl_comment.png`.
- DONE: Brand consistency check addresses whether the assets read as the same Judge Owl character across homepage, T1/past, T3/future, and comment/avatar usage.
  The four new assets share the same brown owl face, mortarboard, judicial/academic robe, gold/yellow eyes, and clean cartoon rendering, so they read as one Judge Owl character; however, the future asset's cyber overlay and desaturated green/teal robe treatment push furthest from the purple-robed baseline and should be checked against the dark T3 page at display size.
- DONE: Approval or rejection is explicit, with specific actionable feedback for any asset that should be revised.
  Rejected for this cycle. Revision should export/commit the assets at the specified filenames and dimensions: replace `public/owl.png` with the refined 640x640 transparent homepage owl, produce `public/owl-past.png` and `public/owl-future.png` at 200x200 transparent PNG, and optionally produce `public/owl-avatar.png` at 112x112. Keep the current visual direction, but crop/scale each image for its intended context so the T1/T3 decorations remain legible at 80-100 CSS px and the comment avatar remains sharp at 56 CSS px.

### Summary

The produced owl illustrations are visually cohesive and generally fit the requested poses: homepage/book, T1 scroll/history, T3 gavel/crisis, and comment bust crop. This pass should not be approved as final because the deliverables do not match the requested file names or export dimensions, and the actual `public/owl.png` homepage asset remains the old non-transparent ABC-book version.

### Feedback Cycles

- 2026-05-02T18:31:25Z — review rejected this cycle. Route back to `draft`: export/commit the cohesive owl assets at the specified filenames and dimensions, replace `public/owl.png` with the transparent 640x640 homepage owl, add `public/owl-past.png` and `public/owl-future.png` at 200x200, and optionally add `public/owl-avatar.png` at 112x112. Keep current visual direction while cropping/scaling for intended page contexts.

## Stage Report: draft (cycle 2)

- DONE: Designed asset files are present at the exact requested paths, filenames, dimensions, and transparent PNG format.
  Exported with `sips -z`: `public/owl.png` from `public/owl_frontpage.png`, `public/owl-past.png` from `public/owl_past.png`, `public/owl-future.png` from `public/owl_future.png`, and optional `public/owl-avatar.png` from `public/owl_comment.png`; `file` reports each as PNG RGBA and `sips -g pixelWidth -g pixelHeight -g hasAlpha` reports 640x640/yes, 200x200/yes, 200x200/yes, and 112x112/yes respectively.
- DONE: Asset exports preserve the cohesive Judge Owl identity while being cropped/scaled for homepage, T1, T3, and optional comment/avatar contexts.
  Reused the current cohesive Judge Owl sources in `public/`: homepage book owl, T1 glasses/scroll owl, T3 gavel/cool crisis owl, and comment bust crop; the 200px T1/T3 exports keep the head, hat, robe, and prop readable for 80-100 CSS px use, and the 112px bust source is purpose-cropped for 56 CSS px avatar use.
- DONE: Stage report cites concrete verification evidence for file paths, pixel dimensions, alpha/transparency, and any generation/export commands used.
  Verification command: `for f in public/owl.png public/owl-past.png public/owl-future.png public/owl-avatar.png; do file "$f"; sips -g pixelWidth -g pixelHeight -g hasAlpha "$f"; done`; export command used `sips -z 640 640`, `sips -z 200 200`, `sips -z 200 200`, and `sips -z 112 112` against the corresponding source files.

### Summary

Replaced the old non-transparent homepage `public/owl.png` with the refined transparent Judge Owl export and added the requested hyphenated T1/T3 filenames. Also produced the optional 112x112 transparent avatar because the provided bust crop source was high enough quality for a sharp 56 CSS px comment icon.
