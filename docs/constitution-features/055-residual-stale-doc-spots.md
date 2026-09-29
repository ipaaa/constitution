---
id: 055
title: feature 041 未涵蓋的殘留過時處
status: design
source: feature 041 的 verify cycle 3 與 review 記名，captain 2026-09-07 裁決不吸收進 041
started:
completed:
verdict:
score: 0.4
worktree:
issue:
pr:
mod-block:
---

feature 041 修正了五份文件的 23 處敘述，但那是一次性同步，且範圍由 captain 明確界定。本票承接 041 交付後仍然存在的殘留處。

## Problem

041 的驗收範圍是 captain 於 2026-09-04 裁決的 23 處。下列各處在該範圍之外，由 041 的 verify 與 review 記名、依 `## Review-finding disposition` 第 5 條維持不動。

### F-6 — 最要緊的一項（Material，非 041 task-owned）

`docs/content-pipeline/data-collection-guide.md` 有兩句仍以現在式斷言 `npm run build` 會執行同步、且仍被禁止：

- `:216`「驗證方式建議執行 `npm run build`。該指令會執行同步並覆蓋資料檔，**現已禁止**。」
- `:132`「⚠️ 原本此處寫 `npm run build`。該指令會執行同步並覆蓋資料檔，已於 2026-09-02 改掉。」

**兩句今天都不成立。** PR #32 已於 2026-09-02 把同步移出 build，`AGENTS.md:19` 記載解禁。

**為什麼要緊**：該檔狀態為 `evergreen`，而 041 把它的最後查核日推進到 2026-09-04。這正是 041 的 Problem 親筆點名的形狀 ——「查核日期新而內容錯，比沒有查核日期更容易誤導」。

`:216` 距離最近的更正段 33 行，041 的 AC-3「20 行內可見」規則搆不到它。

### F-5 — 導覽行號差一行（Polish）

`docs/content-pipeline/design.md:82` 寫「`scripts/sync-content.mjs:354` 為 `return (record.status || '').trim().toLowerCase() === 'approved';`」。實際 `:354` 是 `function isApproved(record) {`，該 `return` 在 `:355`。結論本身正確，僅導覽行號偏移。

### F-7 — 文件影響表與擴充後的驗收互相矛盾（Polish）

041 的 `## Documentation impact` 的 `### 不更新` 表仍把 `AGENTS.md` / `CLAUDE.md` 列為不改，但依 captain 擴充後的 AC-1 第 22 項，交付實際改了 `AGENTS.md`（9/0）。無事實衝突，但表未隨裁決更新。

### 本票不處理、但已由 FO 於 2026-09-07 直接修正的

`docs/constitution-features/README.md` 三處已失效的 `npm run build` 禁令（`:44`、`:124` 的 implement stage 定義、`:285` 的 Task template）。該檔為 FO 操作的流程文件，依寫入契約由 FO 直接修訂，已追記修訂紀錄。**列此僅為避免重複處理。**

### 已知、但不屬本 workflow 的

`docs/design-assets/README.md:29/31/32` 指向 vault 根的 `/CLAUDE.md` 與 `/style_guide.md`，兩檔皆不存在（2026-09-04 實查）。該檔屬 `design-assets` workflow，不在本 workflow 範圍內。**記錄於此避免遺忘，處理需另循該 workflow。**

## Proposed approach

沿用 041 已驗證有效的體例：**原句保留，以追加 `⚠️` 補述更正，每處更正距離其錯誤敘述 20 行內。**

F-7 依 041 的體例，在 `### 不更新` 表下追加一則說明，或把 `AGENTS.md` 移到「現在更新」——由 design stage 定案。

## Risk evidence

`no spike needed`：本票只改 Markdown，不動程式、不動試算表、不執行同步。所依賴的事實已由 041 的三輪驗證與 FO 複驗確認。

## Expected surface and tolerance

Estimate: +25 net LOC across 2 files, tolerance ±40%。
Semantics this may change: `none`。

## Acceptance criteria

**AC-1 — `data-collection-guide.md` 不再有任何一句斷言 `npm run build` 會執行同步或仍被禁止。**
Verified by: `grep -n "npm run build" docs/content-pipeline/data-collection-guide.md` 的每一處輸出，逐一對照其上下文；任一處仍以現在式作此斷言即為失敗。另以 `npm run build` 前後 `shasum -a 256 src/data/*.json` 相同，證明該斷言確實不成立。

**AC-2 — F-5 的導覽行號指向正確的行。**
Verified by: `grep -n "isApproved" scripts/sync-content.mjs` 取得實際行號，與 `design.md` 更正段所寫的行號比對。不一致即為失敗。

**AC-3 — 原句全數保留。**
Verified by: `git diff` 顯示所有更正皆為新增行，被更正的原句不出現於 `-` 側。

## Test plan

`npx tsc --noEmit` 確認未動到程式。`npm run build` 前後比對 `src/data/*.json` 的 sha256，此指令同時是 AC-1 的證據來源。不執行 `npm run sync-content`。

## Documentation impact

### 現在更新

| 文件 | 為什麼現在要改 | 更新內容 |
|---|---|---|
| `docs/content-pipeline/data-collection-guide.md` | F-6：兩句斷言與實際行為衝突，且該檔為 evergreen 並剛推進查核日 | `:216`、`:132` 原地加註 |
| `docs/content-pipeline/design.md` | F-5：導覽行號偏移一行 | `:82` 原地加註或更正行號 |
| `docs/constitution-features/041-correct-stale-pipeline-docs.md` | F-7：文件影響表與擴充後的 AC 矛盾 | 於 `### 不更新` 表追加說明 |

### 實作後更新

| 文件 | 完成條件 | 更新內容 |
|---|---|---|
| 無 | — | — |

### 不更新

| 文件 | 理由 |
|---|---|
| `docs/constitution-features/README.md` | FO 已於 2026-09-07 直接修正 |
| `docs/design-assets/README.md` | 屬另一個 workflow |
| 狀態為 `record` 的文件與 `docs/_archive/**` | 歷史記錄，不改寫 |

### Feedback Cycles

## Out of scope

不建立任何防止文件過時的機制 —— 那是 feature 054。本票與 041 同為一次性還債。
