---
id: 074
title: 爭議時序搬進 SSOT：新增試算表分頁並改由同步供應
status: design
source: 053 處置表 D14；captain 2026-09-30 G2-A（編輯判斷不適用第三類，只能走核可）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
---

`/controversy-timeline` 是公開頁，資料寫死在 `src/data/controversy-timeline.ts`。每個事件都混有編輯判斷（`consequence` 欄的政治評價）。依 `AGENTS.md` 第 5 條（captain 2026-09-30 G1-A、G2-A），編輯判斷不適用第三類，只能經責任編輯核可後上線。所以這份資料要搬進試算表，改由同步供應。

出處：`053` 的 `## Design` 第五節處置表 D14，以及第八節施工順序。

design 要回答：
- 分頁欄位：至少含 `id`、`date`、`title`、`summary`、`detail`、`category`、`significance`、`actors`、`consequence`，與 `TimelineEvent`（`controversy-timeline.ts:22`）一致。`VOIDED_FLOOR_SHORT` 的 import 留在頁面元件，不進試算表。
- 核可與保護：比照 `040` 的核可版本綁定與 `050` 的 A／B／C 欄位保護。captain 建分頁與保護範圍，流程同 `050`。
- 同步：`sync-content.mjs` 新增這個分頁的投影與驗證。
- 既有 AI 撰寫的事件如何進試算表：以「待核可」狀態匯入，經責任編輯逐筆核可後才上線，不得視為已核可。

本票存在並由 `docs/health-check/TODO.md` P1-8 指向它，是 `053` AC-8 的條件。
