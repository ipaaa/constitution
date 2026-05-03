---
id: "006"
title: 測驗結果分享圖片
status: review
source: captain-filed
started: 2026-05-02T20:48:17Z
completed:
verdict:
score: 0.8
worktree:
issue:
pr:
---

設計測驗結果分享圖片。依照測驗成績製作 4 個等級，每個等級各一組分享圖：

- 憲法小白（0-1 題）
- 憲法見習生（2-3 題）
- 憲法觀察家（4 題）
- 憲法達人（5 題）

## 規格

每個等級需產出兩種尺寸：

- 1080x1080px（IG / Threads）
- 1200x630px（Facebook）

## 必備元素

- 貓頭鷹吉祥物（每個等級使用不同表情或姿態）
- 稱號
- 分數
- CTA 連結

## 風格方向

- 與網站整體視覺一致
- 貓頭鷹法官必須與 `public/codex/` 中的三張貓頭鷹圖片風格一致：
  - `public/codex/owl.png`
  - `public/codex/owl-past.png`
  - `public/codex/owl-future.png`
- 適合作為社群分享圖
- 清楚呈現使用者的測驗結果與行動呼籲

## Output

Codex 產出圖片後放到：

`public/quiz/`

## Acceptance criteria

**AC-1** 產出 4 個等級 x 2 種尺寸，共 8 張分享圖片，並放在 `public/quiz/`。

**AC-2** 每張圖片都包含貓頭鷹吉祥物、稱號、分數與 CTA 連結。

**AC-3** 4 個等級的表情或姿態有明確差異，但整體仍維持一致的網站視覺風格。

**AC-4** 圖片尺寸符合規格：IG / Threads 為 1080x1080px，Facebook 為 1200x630px。

**AC-5** 貓頭鷹法官的角色造型、線條、色彩與表情語言需明確延續 `public/codex/` 圖片風格，不得改成不同吉祥物。

## Stage Report: draft

- DONE: Eight quiz result share images exist under `public/quiz/` with the requested level coverage, filenames, dimensions, and required text elements.
  Evidence: Commit `d3bdbd7` added `quiz-result-{novice,trainee,observer,expert}-{ig,fb}.png`; `node public/quiz/render-quiz-result-share-images.mjs` exported IG files at 1080x1080 and FB files at 1200x630; renderer data includes all four titles, scores, and `addcourt.tw`.
- DONE: Owl styling is demonstrably consistent with `public/codex/` assets while giving each quiz level a distinct expression or pose.
  Evidence: Renderer embeds only `public/codex/owl.png`, `public/codex/owl-past.png`, and `public/codex/owl-future.png` as mascot sources; visual inspection confirmed novice question pose, trainee book pose, observer magnifier pose, and expert gavel/medal pose preserve the Judge Owl linework, colors, and expression language.
- DONE: Stage report cites concrete verification evidence for dimensions, output paths, text/CTA inclusion, reference-style inspection, and generation/export commands or tool path used.
  Evidence: Verification command using `sharp(...).metadata()` reported all eight expected files OK at target sizes; `rg` verified title/score/CTA/source-owl strings in `public/quiz/render-quiz-result-share-images.mjs`; `git diff --check` passed cleanly.

### Summary

Produced the final eight quiz result share PNGs in `public/quiz/` using the imagegen skill workflow with a deterministic project-bound SVG-to-PNG renderer (`sharp`) instead of model-rendered lettering, so Chinese text and CTA are exact. The layouts follow the site's white editorial card style, dark borders, red/yellow/purple accents, and the existing Judge Owl mascot assets from `public/codex/`.

## Stage Report: review

- DONE: Visual quality assessment verifies all eight `public/quiz/` images against required dimensions, text/CTA contents, readability, and social-share suitability.
  Evidence: Inspected `public/quiz/quiz-result-{novice,trainee,observer,expert}-{ig,fb}.png`; `file public/quiz/quiz-result-*.png public/codex/owl*.png` confirmed IG outputs are 1080x1080 and FB outputs are 1200x630, and visual review confirmed each card clearly shows the title, score, `來測測你的憲法素養`, and `addcourt.tw`.
- DONE: Brand consistency check verifies owl usage and overall layout match the existing site and `public/codex/` Judge Owl style.
  Evidence: Compared outputs against `public/codex/owl.png`, `public/codex/owl-past.png`, and `public/codex/owl-future.png`; all cards preserve the purple judicial outfit, warm owl palette, heavy dark outlines, expressive brows/eyes, and law-themed props while using distinct question, pencil, magnifier, and medal/gavel result treatments.
- DONE: Approval or rejection is explicit; if rejected, feedback is specific enough to route directly back to draft.
  Evidence: APPROVED. No draft revision requested; the deterministic SVG-to-PNG `sharp` rendering method supports acceptability because the Chinese text and CTA render as exact designed text rather than model-generated lettering.

### Summary

Approved for entity 006. The eight share images satisfy the 4 levels x 2 sizes requirement, remain legible and balanced for IG/Threads and Facebook crops, and continue the Judge Owl visual language from `public/codex/` while giving each result level a distinct expression or pose.
