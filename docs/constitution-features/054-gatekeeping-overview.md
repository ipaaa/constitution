---
id: 054
title: 內容把關機制現況總覽，以及讓它不過時的機制
status: design
source: captain 2026-09-04（把關機制體檢；captain 明確要求本票須設計更新機制）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

沒有任何一份文件回答「現在到底有哪些把關、各擋什麼、哪些缺口還開著」。但新增一份 evergreen 文件等於新增一個會過時的東西——**本票的核心不是寫那份文件，是設計讓它不過時的機制。**

## Problem

### 一、現況總覽沒有家

一個讀者（新編輯、學者協作者、三個月後的 captain、下一個接手的 agent）想知道站上現在有哪些把關時，沒有文件可讀：

| 文件 | 為什麼不是答案 |
|---|---|
| `docs/content-pipeline/design.md` | 是**規格**不是現況；且本身有多處過時，feature 041 正在修 |
| `docs/health-check/TODO.md` | 是**缺陷清單**不是機制圖 |
| `docs/health-check/2026-09-03-editor-onboarding.md` | **目前最準確的一份**，但狀態為 `record`（時點快照），依規定不可改寫，因此必然逐漸過時 |
| `docs/INDEX.md` | 是索引，不描述機制 |

2026-09-04 的把關機制體檢動用三名調查員才拼出全貌。**那份全貌目前只存在於一次性的對話裡。**

### 二、第三類禁令沒有明文

「除 SSOT 人工內容與 T3 之外，站上不得有 AI 生成內容」目前只有 `docs/health-check/TODO.md:434` 一行裁示引述。不在 `AGENTS.md` 的「絕對不要做的事」、不在 `design.md` 第六節的不變式、不在 workflow README 的 workflow-specific rules。

### 三、這張票自己就是風險

`docs/content-pipeline/data-collection-guide.md` 掛著新的最後查核日卻有多處錯誤——feature 041 正在修的就是這個形狀。**新增一份 evergreen 文件而沒有更新機制，等於預約下一次同樣的事故。**

captain 於 2026-09-04 核准開票時明確要求：**本票必須設計更新機制。**

## Proposed approach

**待 design stage 定案。更新機制是本票的主要交付，文件本身是次要。**

依 FO 操作契約「最便宜、能失敗的檢查優先」的階梯，候選依序為：

**第一階：使用系統已經出貨的守衛（優先評估）。**
workflow README 已規定每張票必須填 `## Documentation impact`，而 `review` stage 的定義明文要求「依實際交付行為檢查 `## Documentation impact` 每一筆」。**這個強制點已經存在且已在運作。**

因此候選方案是：在 workflow README 的 workflow-specific rules 中規定——**任何改變把關機制的票，其 `## Documentation impact` 必須包含 `gatekeeping.md`**，由既有的 review stage 執行檢查。不新增任何檢查程式。

design stage 須驗證這個方案是否真的擋得住：一張改了把關機制卻沒列 `gatekeeping.md` 的票，review 會不會抓到？

**第二階：既有的機械檢查。**
`docs/INDEX.md:150-165` 的防漂移檢查腳本，captain 已核准選項 B，但尚未有票。若第一階不足，評估是否併入。

**第三階：讓內容不需要手動維護。**
評估總覽中哪些部分可由 `spacedock status` 直接產生（例如「哪些缺口開著、對應哪張票」），只有真正需要人寫的散文才留在文件裡。**能生成的就不要手寫。**

**最後手段：新增常設檢查。** 只有前三階都不足時才做，且需 captain 再次核准。

## 文件內容範圍（次要交付）

`docs/content-pipeline/gatekeeping.md`，狀態 `evergreen`，回答四個問題：

1. 現在有哪些防線？各擋什麼、擋不到什麼？
2. 三類把關機制（SSOT 人工內容／T3 生成內容與圖表／其餘不得有 AI 生成內容）各自的現況。
3. 哪些缺口還開著？對應哪張票？
4. 已知**不是**機制的東西（只靠人看、只靠慣例）必須明白標示。

另須把第三類禁令寫成明文，加入 `AGENTS.md` 的「絕對不要做的事」與 `design.md` 第六節的不變式。

## Risk evidence

未執行 spike。**design stage 必須先做一件可證偽的驗證**：拿一張真實的、改變了把關機制但未更新對應文件的歷史票（例如 feature `037` 或 `038`），檢查第一階方案的規則若當時存在，review 是否真的會擋下來。若擋不下來，第一階方案無效，須往下一階。

**不得以「README 寫了規則」當作機制成立的證據**——契約明文規定，散文規則本身不構成驗收滿足。

## Acceptance criteria

待 design stage 補齊。現階段記錄驗收必須涵蓋的性質：

- **更新機制必須能夠失敗。** 構造一張改變把關機制卻未更新 `gatekeeping.md` 的候選票，該機制必須擋下它。需以實際構造證明，不可只驗規則文字存在。
- 總覽中每一項「缺口」都指向一張實際存在的票或明確標記為無票。
- 文件中每一項「這不是機制，只靠人看」都必須明白標示，不得以模糊措辭掩蓋。

## 相依

- **feature 041** 正在修既有文件的過時敘述。本票不重複處理那 23 處，但須在 041 合併後才寫總覽，避免描述到即將改變的內容。
- **feature 047／051／053** 會改變第二、三類的機制現況。本票的總覽須能吸收它們的結果，或明確標記為「進行中」。
- **feature 039**（渲染檢查工具）明文宣告它不做 AI 內容偵測。總覽須正確反映這個邊界，不得讓讀者誤以為它涵蓋。

## Out of scope

不實作任何把關機制本身（那是 040、042、043、047、051 各自的工作）。不處理既有內容的處置（049、052、053）。不建立新的常設檢查，除非前三階都不足且經 captain 再次核准。
