---
id: "009"
title: 整理 public 內貓頭鷹圖片資產
status: review
source: captain-filed
started: 2026-05-03T04:07:19Z
completed:
verdict:
score: 0.8
worktree:
issue:
pr:
---

整理 `/public` 裡的貓頭鷹圖片資產，把所有仍要使用的貓頭鷹 avatar / mascot 圖片集中到同一個資料夾，並移除不需要的舊 redesign 資料夾與根目錄散落圖片。

Captain request:

> organize images in /public. folders I don't need: /mascot-redesign /mascot-redesin-v2 owl-future owl.past owl.png and organize all owl avatars in one folder

## Desired organization

Use one canonical folder:

`public/owl-avatars/`

Move current useful owl assets there, including:

- latest homepage owl currently at `public/owl.png`
- `public/owl-past.png`
- `public/owl-future.png`
- `public/owl-avatar.png` if present
- expression variants currently in `public/owl-expressions/`
- any still-used canonical owl assets from `public/codex/`

Remove obsolete review/draft folders if no longer referenced:

- `public/mascot-redesign/`
- `public/mascot-redesign-v2/`

Do not break runtime references. Update code, metadata, and renderer scripts that currently point at root `/owl.png`, `/owl-past.png`, `/owl-future.png`, `/owl-avatar.png`, `public/codex/owl*.png`, or `public/owl-expressions/*`.

## Acceptance criteria

**AC-1** All kept owl avatar / mascot PNGs live under `public/owl-avatars/`, with no active root-level `public/owl.png`, `public/owl-past.png`, `public/owl-future.png`, or `public/owl-avatar.png` remaining.

**AC-2** Obsolete folders `public/mascot-redesign/` and `public/mascot-redesign-v2/` are removed, and no code or script references them.

**AC-3** All active site references and asset-generation scripts are updated to the new paths and verified by search.

**AC-4** The change preserves existing image files' visual content and does not regenerate or redesign assets.

## Stage Report: draft

- DONE: Owl avatar/mascot PNGs that remain in use are consolidated under `public/owl-avatars/`, with root-level owl PNGs removed.
  Evidence: `find public -maxdepth 3` shows active owl PNGs under `public/owl-avatars/`; `test ! -e public/owl.png ... ! -e public/owl-avatar.png` passed.
- DONE: Obsolete `public/mascot-redesign/` and `public/mascot-redesign-v2/` folders are removed and references are cleared.
  Evidence: `git rm -r public/mascot-redesign public/mascot-redesign-v2`; strict active search found no code/script references to those folders.
- DONE: Active code, metadata, docs where relevant, and generation scripts are updated and verified by search so runtime asset paths are not broken.
  Evidence: updated app metadata/components and comic/quiz renderers; strict active old-path `rg` returned no matches, `node --check`, `git diff --check`, and targeted `npx eslint ...` passed.

### Summary

Consolidated the kept homepage, past/future/avatar, expression, former `public/codex`, and GPT image evidence owl PNGs under `public/owl-avatars/` without regenerating images. The default `npm run lint` was attempted but fails on existing unrelated `.worktrees/.next` and pre-existing source lint issues; targeted ESLint for the changed files passed with one existing `<img>` warning.
