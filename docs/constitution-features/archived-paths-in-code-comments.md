---
id: 075
title: 程式註解與歷史檔中已封存票的舊路徑
status: design
source: 069 verify V-1；captain 2026-09-30 決定另開小票
started:
completed:
verdict:
score:
worktree:
issue:
pr:
---

`064`、`050`、`070`、`068` 封存後，下列 5 處仍指向封存前的路徑。`node scripts/content-audit.mjs check` 的 M6 不掃這些位置，所以 `069` 的通過條件不受影響；讀者看不到，但讀程式註解的人會碰到斷掉的連結。

- `scripts/sync-content.mjs:558`
- `scripts/content-fingerprint.mjs:23`
- `tests/track2-case-ref-stance.test.mjs:16`
- `tests/threshold-analysis.test.mjs:1303`
- `docs/health-check/2026-09-03-editor-onboarding.md:481`（歷史記錄檔：追加補述，不改寫原文）

行號以 `069` verify 當時（`86ee71d`）為準；施工時重新定位。

範圍只有改路徑，不動程式行為。**前置：`069` 合併之後**（069 已改過其他相關路徑）。
