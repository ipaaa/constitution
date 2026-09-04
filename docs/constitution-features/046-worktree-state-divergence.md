---
id: 046
title: worktree 副本與 main 的狀態分歧，使 main 上的 workflow 狀態失真
status: design
source: captain 2026-09-04（FO 於 040 推進過程中撞到，captain 裁決開進本 workflow）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

進行中的 entity，其 stage report 寫在 worktree 副本，但 spacedock 認定 canonical entity 在專案根目錄。兩邊在 merge 之前不會合流，因此中途狀態必然分歧，main 上看到的 workflow 狀態是錯的。

> **本票性質**：這是 workflow 機制問題，不是憲法網站的功能。依 FO 寫入契約的 Workflow Fit Gate，workflow refit／split-root migration 這類 process 工作原則上不屬於產品 workflow。captain 於 2026-09-04 明確裁決開進 `constitution-features`，理由是它每一輪都在咬人且會誤導接手者。後續讀者請知悉此例外。

## Problem

2026-09-04 推進 feature 040 時實測到三個後果：

**一、`ready_gates` 永遠是空的。**
040 的 verify gate 在 2026-09-03 就已 `prepare` 並處於 `awaiting-captain`，但從專案根目錄執行 `spacedock status --boot --identify --json` 回報 `ready_gates: []`。該 gate 因此無人聞問地擺了一整天。本節 FO 開機時也被同一個訊號誤導，先誤判為「沒有 gate」。

**二、標準派工路徑不可用。**
`dispatch build --stamp` 拒絕 worktree 的 entity 路徑：

```
entity_path must be a project-root absolute path; got worktree path ...
Pass the project-root location, not the worktree copy.
```

但改用 main 的路徑後，`status --set` 又被守衛擋下：

```
cannot change status away from entered stage "implement":
missing current-stage report: no heading whose first stage token is "implement"
```

**兩個守衛各自都是對的**，但合起來無解：狀態必須跟 stage report 待在同一份檔案（worktree 副本），而 `--stamp` 只認 main 副本。本節三次派工（implement／verify／review）都只能改走不帶 `--stamp` 的路徑才成功。

**三、下一個 session 會看到錯的畫面。**
040 實際已走完 implement → verify → gate 核可 → review，main 上仍顯示 `implement`，差三個階段。

## 為什麼現在要處理

上一位 FO 撞過同一件事但沒留下記錄就結束了 —— 這正是 040 的 gate 從未進入 `ready_gates` 的根因。本節 FO 重蹈一次，並在誤判後對 captain 講過一段有信心的錯誤解讀。

失真的是**狀態本身**，不是文件。性質與 feature `041`（文件敘述與實際行為不符）相同，但更難察覺：文件錯了人看得出來，狀態錯了工具會照著錯的走。

## Proposed approach

**待 design stage 定案。** 三個候選方向，不預設答案：

1. **FO 同步推進 main 的 frontmatter。** 依 State Management「FO 擁有 main 上的 YAML frontmatter」，由 FO 在每個 stage 邊界同步 main。需先解決上述守衛衝突（main 沒有 stage report 就推不動狀態）。
2. **`dispatch build` 接受 worktree 路徑。** 屬 spacedock 上游行為，本專案可能無法自行決定。
3. **改為 split-root。** README 宣告 `state:` 獨立 checkout（spacedock 原生支援），entity 與 stage report 都存在非分支的 state checkout，worktree 只隔離交付物。這是契約明文描述的既有模式。

方向三看起來最貼近契約原意，但會動到 workflow 的基礎設定，且需確認既有 45 張票與 `_archive` 如何遷移。

## Risk evidence

`no spike needed` 不成立 —— **本票必須先做 spike。** 三個方向都涉及未經本專案驗證的機制：方向一要驗證守衛能否滿足、方向三要驗證既有票與封存能否無損遷移。

design stage 須在隔離環境（例如一份拋棄式的測試 workflow）先跑通所選方向，再寫規格。**不得直接在 `constitution-features` 上實驗。**

## Acceptance criteria

待 design stage 補齊。現階段記錄驗收必須涵蓋的性質：

- 一個進行中且處於 gated stage 的 entity，從專案根目錄執行 `status --boot --identify --json` 必須出現在 `ready_gates`。這是最核心的一項，需以實際情境重現。
- 標準派工路徑（含 `--stamp`）可用，不需繞路。
- 既有 45 張票與 `_archive` 內容不因遷移而遺失或改寫。

## Out of scope

不改 spacedock 二進位本身。不處理 `docs/design-assets` workflow 的 refit（該 workflow 仍為 0.9.5，另案）。不追溯修補已封存 entity 的歷史狀態。
