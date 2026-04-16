---
id: "005"
title: Data Quality Cleanup
status: review
source: codebase audit
started: 2026-04-16T15:57:37Z
completed:
verdict:
score: 0.85
worktree: .worktrees/spacedock-ensign-data-quality-cleanup
issue:
pr:
mod-block: merge:pr-merge
---

目前 codebase 中有多處 placeholder / 測試資料影響品質：

### history.json（T1）
- 移除 h15（"測試"）— 這是一筆完全 placeholder 的測試資料，破壞 T1 敘事流
- 確認 h14 的 bgImage 為空字串，決定是否補上或做 fallback 處理

### discussions.json（T2）
- 所有 `owl_comment` 都是同一句「這篇太長，我看完了：大法官說快來開會啦！」— 需要為每篇文章寫不同的貓頭鷹評語
- 所有 `vibe` 都是「💡 腦袋升級」— 需要根據文章內容分配不同的氛圍標籤（🔥 公民覺醒、🌊 同溫層外、⚖️ 法律白話文、📣 擴散必看、⚠️ 爭議中 等）
- 多數 `abstract` 是同一段 placeholder 文字「快速了解最新判決...」— 需要為每篇寫真正的摘要
- Official TL;DR（id: "tldr"）的 abstract 含有 "test" 字樣

### Footer
- `src/components/Footer.tsx` 中的「內容回報」連結是 `href="#"` — 需要接上真正的回報管道（Google Form 或 GitHub Issues）

## Stage Report

### Summary
Cleaned up placeholder and test data across `history.json`, `discussions.json`, and the footer feedback link. Replaced the shared owl comment / vibe / abstract strings with per-article copy, removed the h15 test entry, fixed the empty h14 `bgImage`, rewrote the TL;DR abstract to remove "test" filler, and pointed the 內容回報 link at GitHub Issues. `next build` passes with no type errors and all 8 static pages render.

### Checklist

1. **DONE** — Removed `h15` ("測試" placeholder) from `src/data/history.json`. Post-edit: 10 entries, IDs `h1,h2,h4,h6,h7,h3,h5,h10,h14,h11`.
2. **DONE** — Resolved `h14.bgImage` empty string. Approach chosen: supplied a real Unsplash image URL (`photo-1519817914152-22d216bb9170`, a mountain/landscape shot appropriate for 原住民族權利 / 西拉雅族身分判決) to match the data-driven pattern used by every other entry. Rationale: the consumer at `src/app/past/page.tsx:136` renders `url('${item.reality.bgImage}')` directly into CSS, so a component-level fallback would diverge from existing conventions; filling the field in data is a smaller, more consistent change.
3. **DONE** — Every `owl_comment` in `src/data/discussions.json` rewritten uniquely (8 unique strings across 8 articles; `tldr` retains empty owl_comment as before by design). No article shares its owl comment with another.
4. **DONE** — Each article assigned a content-appropriate vibe from the allowed set. Distribution: 🔥 公民覺醒 (d1, d9), 🌊 同溫層外 (d2, the English-language international-audience piece), ⚠️ 爭議中 (d4, d8 — both engage dissent / 毀憲爭議), ⚖️ 法律白話文 (d5, d6 — long-form scholarly analysis in Chinese), 📣 擴散必看 (d7 — the entry-point explainer reel). 💡 腦袋升級 no longer used.
5. **DONE** — Every `快速了解最新判決...` placeholder abstract replaced with a real per-article summary (verified: `d.filter(x => x.abstract.startsWith('快速了解最新判決')).length === 0`). d1 and d5 retained their existing substantive abstracts.
6. **DONE** — TL;DR abstract rewritten with three real points (`權限界線`, `權力分立`, `下一步`). Preserved the `**Label**：text\n` format required by `OfficialTLDR` in `src/app/present/page.tsx:76`, which splits on newlines and renders `**bold**`. Verified: "test" no longer appears in the abstract.
7. **DONE** — `src/components/Footer.tsx` 內容回報 link now points to `https://github.com/g0v/Welcome-to-Add-C0urt/issues/new` (opens in new tab, with `rel="noopener noreferrer"`). Chose GitHub Issues per the stage instructions' default since no existing feedback channel is documented in the repo; the URL is consistent with the GitHub source link already present in the same footer block. Also removed the `text-gray-400` dim styling so the feedback link matches the other active links.
8. **DONE** — Verified no regressions via `npx next build`: TypeScript passes, all 8 static pages (including `/past` and `/present`) generate successfully. Owl comments (`JudgeOwlComment`) and vibe tags (`VibeTag` in `src/components/SharedPresent.tsx:21`) continue to render — all new vibe strings match the emoji-prefix style checks, and the one 🌊 vibe correctly falls through to the default gray style. T1 timeline iterates `HISTORY_DATA` so removing h15 shortens the scroll sequence cleanly.
9. **DONE** — Committed on worktree branch `spacedock-ensign/data-quality-cleanup` (see commit below).
10. **DONE** — This Stage Report section appended to the entity body; every checklist item marked with status and evidence above.

