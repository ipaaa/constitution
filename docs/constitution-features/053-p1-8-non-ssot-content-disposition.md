---
id: 053
title: 完成 P1-8 盤點：全站無 SSOT 來源內容的逐項處置
status: design
source: captain 2026-09-04（把關機制體檢第三類；TODO.md P1-8 停滯項）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

`docs/health-check/TODO.md` 的 P1-8 已完成初步盤點，但八個檔各自要「搬進 SSOT／標注來源凍結／移除」三選一，**停在 2026-09-02，一項都沒決定**。

## Problem

P1-8 的盤點列出了 `src/data/` 中無 SSOT 來源的檔案，並在 `TODO.md:486` 提出三種處置：**搬進 SSOT、標注來源並凍結、移除**。

**盤點做完了，處置一項都沒做。** feature `038` 消掉其中一項（跨軌道連結），其餘原地不動。

全站真正有 SSOT 來源的只有兩個檔：`src/data/history.json`（40 筆）與 `src/data/discussions.json`（16 筆）。其餘無來源者（體檢已查證）：

| 檔案 | 內容 | 備註 |
|---|---|---|
| `future.ts:337-356` | `JUSTICES` 15 位大法官任期資料 | 檔頭自述 `Researched synthetic records` |
| `future.ts:415-431` | `CRISIS_STATS` | 由上述合成名單**計算而來**，渲染於首頁與 `/future` |
| `future.ts:91` | `REAL_TOTAL_PENDING = 473` | 註解稱來自民間司改會／媒體報導，無連結 |
| `opinions.ts:90-247` | 12 筆具名大法官論點 | 由 feature 049 處理 |
| `controversy-timeline.ts:46-231` | 15 筆憲政爭議事件，含因果判斷 | 全檔零出處 |
| `contributors.ts` | 6 筆佔位貢獻者 | 由 feature 052 處理 |
| `quizzes/*.ts` | 4 檔測驗題與法律說明 | 只有站內 `sourceRoute`，無外部依據 |
| 元件硬編文案 | `StanceSpectrum.tsx`、`DecisionFlowchart.tsx` 等 | 前兩者由 feature 049 處理 |

**為什麼現在要做**：`015`（假學者公開四個月）與 `006`（跨軌道連結全站 0 筆卻判 MET）都不是程式壞了，是**沒有人在檢查內容從哪裡來**。P1-8 是這件事的第一步，而它停著。

## Proposed approach

**逐檔決定處置，不是一次性重寫。** design stage 須產出一份逐檔的處置表，每一項標明：搬進 SSOT／標注來源凍結／移除，以及理由與負責人。

**需 captain 參與的部分**：`future.ts` 的合成大法官名單、`controversy-timeline.ts` 的因果判斷、`quizzes` 的法律說明——這三者的處置涉及內容判斷，可能需要法學背景者（同 `TODO.md` P0-2 的性質）。

**已有票涵蓋、本票不重複處理**：`opinions.ts` 與 opinion-lazybag 元件（feature 049）、`contributors.ts`（feature 052）。本票負責**其餘各項**與**整體處置表**。

## Risk evidence

未執行 spike。本票的第一步是決策而非施工——`docs/meetup-chats/2026-05-01-agenda.md:14` 早已把 `future.ts` 的合成名單列為「需人工確認」，**至今未見任何確認記錄**。design stage 須先確認這件事是否已在別處做過，避免重工。

## Acceptance criteria

待 design stage 補齊。現階段記錄驗收必須涵蓋的性質：

- 每一個無 SSOT 來源的檔案都有明確處置與理由，不得留「待決定」。
- 處置表須與 `TODO.md` 的 P1-8 對齊，完成後 P1-8 可結案。
- 標為「凍結」者，其凍結機制指向 feature 047；標為「標注來源」者，其欄位設計指向 feature 051。

## 相依

- **feature 047**（內容凍結）提供「凍結」這個處置的機制。
- **feature 051**（來源標記）提供「標注來源」這個處置的機制。
- 本票是決策票，可先於兩者完成處置表，但實際施工需等機制到位。

## Out of scope

不處理 `opinions.ts` 與 opinion-lazybag（feature 049）。不處理 `contributors.ts`（feature 052）。不建立凍結或標記機制本身（047、051）。
