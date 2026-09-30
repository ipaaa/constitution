---
id: 072
title: 把關總覽第 4、5 章依 064 重判
status: design
source: 054 review R5（延續 verify V6）；captain 2026-09-29 裁示「照建議走」——R5 不在 054 處理，另開本票
started:
completed:
verdict:
score:
worktree:
issue:
pr:
---

`054` 的總覽 `docs/content-pipeline/gatekeeping.md` 寫於 `064` 合併之前。原先的處置是「後合併者重判總覽第 4、5 章」，但 `064`（PR #47）與 `050` 都比 `054` 先合併，這項重判沒有任何票承接。本票承接。

要重判的事（出處：`054` review R5）：

- 第 5 章 :117：`064` 在 `scripts/sync-content.mjs` 新增 `case_ref`／`stance` 允許清單與成對檢查，防線表要寫出它擋什麼、擋不到什麼。
- 第 4 章〈核可版本綁定〉：`064` 把兩欄選填欄位放進指紋（`content-fingerprint.mjs`、`.gs`），填了值的列要重新核可。總覽對指紋涵蓋範圍的描述要依此重判。
- 依總覽第 0 章寫作規則：只寫單調句、連結寫 `docs/…` 路徑、每道防線寫「擋什麼／擋不到什麼」。

**前置：`054` 合併進 `main` 之後才開始 design**（總覽目前只在 `054` 分支上）。
