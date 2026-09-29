---
id: 054
title: 內容把關機制現況總覽，以及讓它不過時的機制
status: review
source: captain 2026-09-04（把關機制體檢；captain 明確要求本票須設計更新機制）
started: 2026-09-29T18:59:22Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-054-gatekeeping-overview
issue:
pr:
mod-block: merge:pr-merge
review-round:
    id: round:054:review:2
    stage: review
    cycle: 2
    briefing:
        id: briefing:054:review:round-2
        digest: sha256:07af0fa93f3b825b2387b1cf6c45b6aba4aa154e031ea7ec3118a0dd67320199
        room-ref: '@review/review/round-2'
gates:
    version: 1
    records:
        - id: gate:054:verify
          stage: verify
          attempts:
            - id: gate-attempt:054-verify-1
              briefing:
                id: briefing:054:verify:attempt-1:revision-1
                digest: sha256:4a6ff51c5a6c908443f6be76221ea23c2ca49ff2c9993580c3f6ab74ae01cea3
                room-ref: '@review/verify/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:054:verify:1
                briefing: briefing:054:verify:attempt-1:revision-1
                by: person:captain
                at: "2026-09-29T20:31:38.03914Z"
                decision: approve
                reason: 'Captain approved 054 verify cycle 2 in chat 2026-09-29 (「全部照建議」): V1–V5 corrected, fresh reader 8/8, AGENTS.md byte-identical to approved text.'
              application:
                target-stage: review
                state: consumed
        - id: gate:054:review
          stage: review
          attempts:
            - id: gate-attempt:054-review-1
              briefing:
                id: briefing:054:review:attempt-1:revision-1
                digest: sha256:a0865d862ea75390bd2d2f9f64e88c3bb9f8dfbceefae4b45d3e208b345827ef
                room-ref: '@review/review/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:054:review:1
                briefing: briefing:054:review:attempt-1:revision-1
                by: person:captain
                at: "2026-09-29T20:48:17.17Z"
                decision: approve
                reason: 'Captain approved 054 review cycle 2 in chat 2026-09-29 (「1235照建議」): overview delivered, R1–R3 fixed, AGENTS.md as approved.'
              application:
                target-stage: complete
                state: pending
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

> 📌 **2026-09-29 追加（captain 經 FO 轉述）**：總覽另須回答四件事——每個角色（投稿者、學者、責任編輯、captain）的編輯流程、
> 誰能改試算表的哪些欄（`050` 的 A／B／C 三類保護）、已由 `040` 上線的核可版本綁定規則、上線前檢查（`056` 的 G-1–G-8 與 `067` 的查核工具）。
> 一律連到正本，不複製。規格見下方 `## Design` 第二節。

## Design（2026-09-29）

> 本節是 design 階段的定案。上方〈Proposed approach〉的四階梯保留原文。每一階的實測與結論寫在第一節。

**結論先講：**

- **票內改到把關（in-diff）**：現有 review stage 已經擋得住。**不加新規則。** 6 組缺陷情境全部判 REJECTED，並指名總覽漏列或分類錯誤。
- **在 repo 外執行的部署（off-repo）**：現有 review 擋不住。原因是部署之後沒有排任何 review。`050` 就是這個形狀，三處過時句因此留到今天。
  解法是在 review stage 定義加一條：repo 外步驟之後、最後一道 gate 之前，重判文件影響。
- **連結失效**：`067` 的 M6 規則已經會抓。條件是總覽的連結寫成 `docs/…` 路徑。
- **票況**：不寫進總覽。用一條指令產生。
- **不新增常設檢查。**

### 一、更新機制：逐階實測

#### 1.1 第一階：現有 review stage 擋 in-diff 的漏列（實驗 E1）

**構造**：一張「043 形狀」的候選票。它在 `scripts/sync-content.mjs` 加筆數下降門檻，實際上關閉總覽缺口表的「誤刪資料列」。
總覽的試作版有兩句會被它推翻：防線「同步前置檢查」的擋不到什麼（「刪掉少數幾列…筆數靜默下降」），以及缺口列「沒有機制…對應 `043`」。
候選票的 `## Documentation impact` 正確列出 `design.md` 與 `operations.md`，只在總覽上出錯。
每組派一個 fresh reviewer，只給 README 的 review stage 定義與 repo，不告知實驗目的。

| 組 | repo | README 加規則 | 票對總覽的處理 | 裁決 | 指名總覽漏列或分類錯誤 |
|---|---|---|---|---|---|
| A | 12 檔 fixture | 否 | 完全沒列 | REJECTED | 是，Material |
| A2 | 12 檔 fixture | 否 | 列在〈不更新〉，理由「總覽只指向正本」 | REJECTED | 是，分類錯誤 |
| B1 | 12 檔 fixture | 是 | 完全沒列 | REJECTED | 是 |
| B2 | 12 檔 fixture | 是 | 列在〈不更新〉 | REJECTED | 是 |
| R0 | 真實 repo clone，本票檔移除 | 否 | 完全沒列 | REJECTED | 是。reviewer 以 `grep "筆數\|allow-drop\|…"` 找到總覽 |
| R1 | 真實 repo clone，本票檔移除 | 是 | 完全沒列 | REJECTED | 是 |
| C（對照） | 12 檔 fixture | 是 | 列在〈實作後更新〉並已改 | REJECTED | **否**。退件理由之一是總覽的「擋不到什麼」寫得不完整 |

「加規則」指候選規則「把關總覽跟著把關變動」：改到總覽〈把關面〉列出的路徑、改變防線範圍、或開關缺口列的票，必須在〈現在更新〉或〈實作後更新〉列出總覽，不得列在〈不更新〉。
各組另有與總覽無關的退件理由（fixture 的 `--allow-drop` 沒接線、R0／R1 的既有測試回歸、替換 `043` 票檔造成的流程問題）。這些不影響「是否指名總覽」這一欄。

**結論**：

- 擋得住的前提是：**總覽裡有一句會被改動推翻的具體句子**。R0 就是用關鍵字 grep 撞到那一句。
  總覽若只放連結，就沒有句子會被推翻，也就沒有東西會過時。兩者一致。這條前提寫進第二節的寫作規則。
- 對照組 C 證明 reviewer 讀的是總覽的內容，不是看到檔名就判失敗。
- 候選規則沒有觀察到增益。依「最便宜、能失敗的檢查優先」，**不加這條規則**。
- 限制：每組只跑一次；reviewer 同屬一個模型家族；實驗沒有時間壓力。

#### 1.2 第一階的缺口：repo 外部署之後沒有 review（`050` 的真實歷史與實驗 E2）

**歷史**（以下皆為已發生的事）：

1. `050` 的 `## Documentation impact`〈不更新〉列了 `AGENTS.md`（理由「本票不改變任何 agent 的行為約束」）與「`docs/project/` 全部」。
2. `050` 的 review 第一輪（2026-09-24）判「不更新五筆全部與零變動相符」。當時還沒部署，這個判斷在當時為真。
3. 部署窗口 S1–S9 於 2026-09-29 執行。窗口內的 review 範圍只有 S9（步驟 8 與 AC-3），沒有重判文件影響。
4. `040` 合併前的 stage report 已點名這三處，並把它交給「050 或交付後的文件工作」。
   查核：`grep -n 'AGENTS.md:29' docs/constitution-features/_archive/040-approval-content-version-binding.md`。
   **`040` 說交給 `050`，`050` 把 `AGENTS.md` 列在不更新。義務落在兩張票之間，沒有人接。**
5. 結果：`AGENTS.md:29`、`docs/project/tech-stack.md`〈部署邊界〉、`docs/content-pipeline/design.md`〈部署狀態〉三處在部署後成為錯的。

**重演 E2**：真實 repo clone，`050` 換成部署後的版本（含〈部署窗口記錄〉），本票檔移除。
兩組都要 reviewer 做「呈交最後一道 gate 前」的 review，不重跑 AC。

| 組 | README | 指名的過時處 | 漏掉 |
|---|---|---|---|
| D0 | 現行 | `AGENTS.md:29-30`、`operations.md` 四處、`design.md` 三處、`TODO.md` P3-7 | `tech-stack.md`〈部署邊界〉、`TODO.md` P2-12 |
| D | 加下方條款 | D0 全部，加 `tech-stack.md:41-43`、`TODO.md` P2-12、`INDEX.md` 兩處 | 無 |

兩組都判 REJECTED。

**結論**：

- 缺的不是 reviewer 的能力，是**時機**。部署之後沒有排任何 review。D0 只要被要求「呈交最後 gate 前審一次」，就找到大部分。
- 條款做兩件事：規定這一次重判一定要發生；要求**列舉**仍寫「尚未」的句子。後者多找到兩處（每組只跑一次）。
- 條款原文（實作時加進 README 的 review stage（`### review` 標題下）Outputs，放在 `## Documentation impact` 那一條之後）：

  > **repo 外步驟之後重判文件影響。** 本票若在 review 期間或之後執行了只在 repo 外生效的步驟（例如正式試算表部署、Vercel 設定），
  > 呈交最後一道 gate 前，依執行後的事實重判 `## Documentation impact`：`不更新` 各筆是否仍成立；
  > `實作後更新` 各筆的條件是否已成立而未做；並列舉 evergreen 與 plan 文件中仍描述該步驟「尚未」發生的句子。
  > 已到期的文件更新在本票 PR 合併前完成，不得留給下一張票。

- 最後一句針對第 4 點：到期的義務不可以再交給下一張票。

#### 1.3 第二階：既有的機械檢查（實驗 E3）

- `docs/INDEX.md` 第 4 階段的防漂移腳本：**本票不併入。** 它檢查的四項不涵蓋總覽的任何斷言。下一點的 M6 已是現成的機械檢查。
- `scripts/content-audit.mjs` 的規則 M6（`067` 出貨）掃 `docs/INDEX.md` 標為 evergreen 或 plan 的文件，
  抓「路徑不存在、同名檔在 `_archive/` 下」的連結。它只認 `docs/`、`./`、`../` 開頭的路徑。

E3 在 clone 上執行（總覽已列入 INDEX，狀態 evergreen）：

| 步驟 | 總覽的連結寫法 | 動作 | `check` 對總覽的 M6 |
|---|---|---|---|
| 1 | `[\`operations.md\`](operations.md)` | 把 `operations.md` 移進 `_archive/` | 0 筆 |
| 2 | `[\`docs/content-pipeline/operations.md\`](operations.md)` | 同上 | 1 筆：`gatekeeping.md:13 … 已封存` |
| 3 | 同步驟 2 | 移回原位 | 0 筆 |

**結論**：總覽的正本連結與票連結，可見文字一律寫 repo 根目錄起算的 `docs/…` 路徑。
票封存時，M6 會指名總覽的那一行，逼人更新缺口表。

**與 `069` 的關係**：`069` 把 `node scripts/content-audit.mjs check` 綁進 `docs/health-check/TODO.md` 的 P3-8。
總覽留著失效連結時 `check` 不通過，不可移除 noindex。**過時的總覽會擋上線。** 本票不改 `069` 的任何內容。

#### 1.4 第三階：能生成的不手寫

- **票況**：總覽不寫任何票的進度。缺口表只寫「缺口 → 票的路徑」。進度由下面這條指令產生。
  它以 frontmatter 的 `id:` 找檔，不靠檔名。`067` 與 `069` 的檔名沒有編號前綴，`{id}-*.md` 找不到它們。

  ```bash
  for n in 039 042 043 047 049 050 051 052 053 062 067 069; do f=$(grep -l "^id: $n\$" docs/constitution-features/*.md docs/constitution-features/_archive/*.md 2>/dev/null | head -1); if [ -n "$f" ]; then echo "$n $(grep -m1 '^status:' "$f") $(grep -m1 '^verdict:' "$f") $f"; else echo "$n NOT FOUND"; fi; done
  ```

  2026-09-29 實跑：12 個票號全部找到；另測不存在的 `999`，印 `999 NOT FOUND`。票號清單由實作時的缺口表決定。
- **P3-8 的解除條件**：不抄進總覽。用這條指令印出：
  `awk '/^### P3-8/{s=1;next} /^### /{s=0} s && /解除條件/' docs/health-check/TODO.md`。
  2026-09-29 實跑印一行（`056` 那一條）。`069` 加第二條後會印兩行，總覽不用改。
- **寫作規則**：沿用 `050` 的單調判準（captain 2026-09-25 授權，見 `050` 票 `## Documentation impact` 的 🔒 框）。
  總覽只寫「已完成 X（日期）」這類不會過期的句子。不寫「尚未」「仍是」「還沒」「待補」「目前仍」。需要這類資訊時放指令。

#### 1.5 最後手段：不採用

前三階已涵蓋實測到的兩種失敗形狀。不新增常設檢查，不需 captain 再次核准。

### 二、總覽文件規格：`docs/content-pipeline/gatekeeping.md`

**狀態** evergreen，**負責人** captain，列入 `docs/INDEX.md`〈內容產線〉表。
**定位**：總覽，不是規格。每一段連到正本，不複製步驟或指令細節。依〈文件影響規則〉不另建第二份規格正本。

**寫作規則**（寫在總覽檔頭，三條）：

1. 只寫單調句。進度與開關狀態用指令產生（第一節 1.4）。
2. 連結的可見文字寫 `docs/…` 路徑（第一節 1.3）。
3. 每道防線寫具體的「擋什麼」與「擋不到什麼」。**這些句子就是 review 抓漏列的依據**（第一節 1.1）。

**章節與內容**（實作時逐項重新查證，下列為 2026-09-29 的起點）：

| # | 章節 | 內容 | 正本 |
|---|---|---|---|
| 0 | 檔頭 | 狀態、最後查核、一句用途、三條寫作規則 | — |
| 1 | 內容怎麼到網站 | 編號步驟：投稿者填列 → `status` 公式顯示 `Needs review` → 責任編輯 `Review → 核可選取列` → 工程人員在專用分支手動同步，同步重算三份指紋，任一不符整份中止 → 開 PR，captain 對 JSON diff 與 Vercel 預覽 → 合併上線，網站仍 noindex → 對外發布前過 P3-8 | `design.md` 修訂紀錄〈2026-09-03 — feature 040 repo 實作完成〉、`operations.md`、`docs/project/contributing.md` |
| 2 | 角色 | 一個角色一小節，固定四項：做什麼／不能做什麼／被什麼擋／正本。角色見下表 | 同右欄各列 |
| 3 | 權限：A／B／C | 三列表：類別、欄位、誰可改、驗證記錄。另列三項已知限制 | `050` 票步驟 6；`050` 合併後改連 `operations.md` 的部署一節 |
| 4 | 核可版本綁定 | 內容改了就要重新核可，責任編輯自己改也一樣；同步獨立重算指紋；2026-09-29 起在正式表生效 | `design.md` 修訂紀錄 2026-09-03 與 2026-09-29 兩則 |
| 5 | 防線總表 | 每列一道防線：擋什麼／擋不到什麼／`機械` 或 `人工` 或 `人工（有記錄）`／`人工` 列寫由誰／正本 | 各列正本 |
| 6 | 三類內容 | SSOT 人工內容；T3 生成內容與圖表；其餘不得有 AI 生成內容。第三類的明文在 `AGENTS.md`（captain 核准後）。第三類沒有機械檢查 | `AGENTS.md`、`data-collection-guide.md`、`TODO.md` P1-8 |
| 7 | 上線前檢查 | P3-8 解除條件的指令；`056` 的 G-1–G-8；`067` 的 `check`（M 層）與閱讀清單（H 層）；寫明 `067` 不掃佔位字串、不管釋字第 272 號，那是 `056` 的 G-5／G-6 | `TODO.md` P3-8、`056` 第三節、`067` 票 `## Design` |
| 8 | 缺口 | 缺口／擋不到時會怎樣／對應票路徑，或「無票：`TODO.md` 的某項」；表下附票況指令 | 各票 |
| 9 | 本文怎麼保持正確 | 三句：review 抓 in-diff；repo 外步驟之後重判；M6 抓失效連結。附自查指令（`content-audit.mjs check`、票況指令） | 本票 |

**第 2 章的角色**（起點，實作時查證）：

| 角色 | 做什麼 | 不能做什麼／被什麼擋 | 正本 |
|---|---|---|---|
| 投稿者 | 在三個發布分頁編輯內容欄 | 改不到 A、B、C 三類欄位（2026-09-29 以投稿者帳號實測 30 格相符，captain 回報）。改內容後該列退回 `Needs review`。**整列刪除沒有被擋** | `050` 步驟 6、S7-b；`contributing.md` |
| 學者（法學背景審閱者） | 編輯時同投稿者。另負責別人不能代替的法律判斷：`TODO.md` 的 P0-2（釋字第 272 號）、`067` 的 H 層閱讀清單 | 這些判斷**沒有機制**，只靠人讀 | `TODO.md` P0-2；`067` 票 `## Design` 第十節 |
| 責任編輯 | 用 `Review` 選單核可或拒絕，拒絕要寫原因 | 必須在 B 類允許名單內，否則選單**靜默失敗，沒有錯誤訊息**。自己改內容，核可一樣失效 | `operations.md`；`approval-permission-probe.md` P1、P7；`050` 步驟 7 |
| captain | 試算表擁有者；設保護範圍；對 PR 的 JSON diff 與預覽；簽 `056` 的 G-3、G-4；核准新的常設檢查 | 擁有者排除不了保護範圍，所以**不要手動編輯 `status` 與 `current_fingerprint`** | `050` 步驟 6 的 ⚠️ |
| 工程人員與 agent | 有人明確要發布時，在專用分支同步並開 PR | 不手改 `src/data/*.json`；不自行執行 `npm run sync-content` | `AGENTS.md` 第 1、2 條 |

**第 3 章的三項已知限制**：擁有者排除不了保護範圍；整列刪除沒有對應設定；開放範圍被存成到第 1000 列（`050` 記為 Deferred risk）。

**第 5 章防線表的起點**：核可版本綁定；試算表保護範圍 A／B／C；同步前置檢查（欄位、標題、指紋、id 重複、核可後 0 筆）；手動同步後的 PR diff 審閱（人工）；workflow `verify` 的佔位掃描（人工，走 workflow 的票才有）；`056` G-1–G-8；`067` 的 M 層 `check`；`067` 的 H 層閱讀清單（人工）；`layout.tsx` 的 noindex；`039` 的渲染檢查若已合併則列入，並寫明它**不做 AI 內容偵測**。

**第 8 章缺口表的起點**：誤刪資料列（`043`）；試算表 HTML 直接渲染（`042`）；內容凍結（`047`）；非 SSOT 內容無來源標記（`051`、`053`、`049`、`052`）；釋字第 272 號（無票：`TODO.md` P0-2）；保護範圍只到第 1000 列（無票：`050` Deferred risk）；Apps Script 缺標題別名表（無票：`050` J1）。

**不需要的產出**（README design stage 的通用項）：本票沒有 UI 元件、沒有資料型別、沒有響應式行為。第二節的章節表就是這份文件的結構。

### 三、要 captain 在 gate 上決定的事

**建議：三項都照建議走。**

1. **README review stage 加 1.2 的條款。** 建議採用。可逆，刪掉一條即可。README 由 FO 維護，條款文字由 captain 核准。
2. **`AGENTS.md` 三處修改的文字。** 建議核准下方提案。`AGENTS.md` 是 `CLAUDE.md` 的 symlink，agent 不得自行修改，**必須由 captain 本人核准文字**。
3. **不採用**候選規則「把關總覽跟著把關變動」。E1 顯示它沒有增益。之後若發生漏列，再拿 E1 的構造重跑。

**`AGENTS.md` 提案文字：**

(a) 第 29–30 行之後追加（原句保留）：

> ⚠️ **2026-09-29 補述：上面「正式 SSOT 尚未套用」與「probe 完成前不得部署」已不成立。**
> 正式 SSOT 已於 2026-09-29 套用核可版本綁定（feature 050）。兩帳號隔離 probe 已於 2026-09-21 完成（feature 044）。
> 「不得補造 probe 證據」仍然有效。

(b) 「絕對不要做的事」新增第 5 條。**措辭需要 captain 定案**：repo 內查得到的出處只有 `docs/health-check/TODO.md` P1-8 的 captain 裁示「全面防止 AI 生成的幻覺內容上線」。
本票 Problem 第二節寫的「除 SSOT 人工內容與 T3 之外，站上不得有 AI 生成內容」在 repo 內找不到原始出處（`grep -rn "不得有 AI\|除 SSOT" docs` 只命中 `051` 與本票）。提案：

> ### 5. 不要讓 AI 生成的內容上線
>
> 站上只允許兩類內容：試算表裡經責任編輯核可的內容，以及 T3（未來軌）依 `docs/content-pipeline/data-collection-guide.md` 收集並經審閱的內容與圖表。
> 其餘位置不得有 AI 生成的內容。要加內容，寫進試算表並走核可。
> 機械檢查的現況見 `docs/content-pipeline/gatekeeping.md` 的缺口表。

(c) 〈文件地圖〉新增一列：「現在有哪些把關、各擋什麼」→ `docs/content-pipeline/gatekeeping.md`。

(b) 核准後，`docs/content-pipeline/design.md` 第六節不變式表加第 7 列，措辭與 (b) 相同，並追加一則修訂紀錄。

## Risk evidence

未執行 spike。**design stage 必須先做一件可證偽的驗證**：拿一張真實的、改變了把關機制但未更新對應文件的歷史票（例如 feature `037` 或 `038`），檢查第一階方案的規則若當時存在，review 是否真的會擋下來。若擋不下來，第一階方案無效，須往下一階。

**不得以「README 寫了規則」當作機制成立的證據**——契約明文規定，散文規則本身不構成驗收滿足。

> ✅ **2026-09-29（design）：已執行。** 三組實驗，細節在 `## Design` 第一節。
>
> - **E1**（構造的候選票，fixture 與真實 repo clone 兩種規模，共 7 組）：現有 review 在 6 組缺陷情境全部擋下，對照組不誤報漏列。
> - **E2**（`050` 的真實歷史，加兩組重演）：現有 review 沒擋，原因是部署之後沒有 review。加條款後重演，找到全部三處。
> - **E3**（M6 連結檢查）：`docs/…` 寫法會被抓，純檔名不會。
>
> **為什麼用 `050` 而不是 `037`／`038`**：`037`／`038` 早於 `040` 起適用的〈文件影響規則〉，當時沒有 `## Documentation impact` 可檢查。
> `050` 適用該規則，而它漏掉的三處今天仍是錯的。它是現有機制的真實失敗，不是假設。
>
> **實驗材料不在 repo 內。** fixture 建在 session 的暫存目錄，已隨 session 消失。
> 構造方式寫在 `## Design` 第一節，AC-1 與 AC-2 的重跑依那裡的描述重建，不依賴暫存檔。
> 每組只跑一次。這是證據的已知上限，不是可以忽略的細節。

## Acceptance criteria

待 design stage 補齊。現階段記錄驗收必須涵蓋的性質：

- **更新機制必須能夠失敗。** 構造一張改變把關機制卻未更新 `gatekeeping.md` 的候選票，該機制必須擋下它。需以實際構造證明，不可只驗規則文字存在。
- 總覽中每一項「缺口」都指向一張實際存在的票或明確標記為無票。
- 文件中每一項「這不是機制，只靠人看」都必須明白標示，不得以模糊措辭掩蓋。

> 以上三項為 design 前記錄的性質，保留原文。定案的 AC 如下，三項性質分別由 AC-1／AC-2、AC-6、AC-7 承接。

**AC-1 — 總覽被票內改動推翻時，現有 review 會擋下漏列。**
Verified by：實作合併後，以真實 repo clone 重做 E1 的 R0 組。從總覽缺口表挑一列仍開著的缺口，構造一張關閉它的候選票，
改動落在該防線的程式上，`## Documentation impact` 不列總覽。派 fresh reviewer，只給 README 的 review stage 定義。
通過條件：裁決 REJECTED，且 finding 指名 `docs/content-pipeline/gatekeeping.md` 被推翻的那一列。
對照：同一候選但正確列入並改好總覽，reviewer 不出漏列 finding。
會讓它失敗的改動：把總覽中該防線的「擋不到什麼」與該缺口列刪掉。候選不再推翻任何句子，預期 reviewer 不會指名總覽。

**AC-2 — repo 外步驟之後、最後 gate 之前，review 會重判文件影響。**
Verified by：(a) `git diff` 顯示 README 的 review stage（`### review` 標題下）Outputs 新增第一節 1.2 的條款。
(b) 重做 E2 的 D 組：clone 本票 design commit 的父 commit（三處過時句仍在的版本），`050` 換成含〈部署窗口記錄〉的版本，README 加條款，派 fresh reviewer 做呈交前 review。
通過條件：finding 同時指名 `AGENTS.md:29`、`docs/project/tech-stack.md`〈部署邊界〉、`docs/content-pipeline/design.md`〈部署狀態〉。
會讓它失敗的改動：拿掉條款，即 D0 組。2026-09-29 的 D0 漏了 `tech-stack.md`。此比較每組只跑一次，stage report 須照實標明。

**AC-3 — 總覽的每條連結都受 M6 保護。**
Verified by：clone 實作後的 repo。對總覽裡每個 `docs/…` 路徑逐一執行：`git mv` 該目標到同目錄的 `_archive/`，
在主 checkout 執行 `node scripts/content-audit.mjs check --root <clone>`，M6 須有一筆指名 `gatekeeping.md`；移回後該筆消失。
另在主 checkout 執行 `node scripts/content-audit.mjs check`，指名 `gatekeeping.md` 的行數為 0。
會讓它失敗的改動：把任一連結寫成純檔名（E3 步驟 1 實測為 0 筆）；或在 `docs/INDEX.md` 把總覽標成 `record`，M6 就不掃它。

**AC-4 — 總覽不寫票況，票況由指令產生。**
Verified by：(a) 總覽第 8 章的票況指令在 repo 根目錄執行，離開碼 0，缺口表的每個票號各印一行，沒有 `NOT FOUND`。
(b) 一次性掃描，輸出貼進 stage report，不做成常設測試：
`` awk '/^```/{c=!c;next} !c' docs/content-pipeline/gatekeeping.md | grep -nE '尚未|仍是|還沒|待補|目前仍' `` 輸出 0 行。
會讓它失敗的改動：(a) 缺口表寫錯一個票號，印 `NOT FOUND`；(b) 在缺口表寫「043 尚未完成」，掃描命中 1 行。

**AC-5 — 一份文件回答 captain 的四個問題。**
Verified by：派一個 fresh agent，只給 `gatekeeping.md` 一個檔，回答下列八題。逐題對照右欄的正本判定對錯。八題全對才通過。

| # | 題目 | 正本 |
|---|---|---|
| 1 | 投稿者改了一列已核可的內容，該列狀態變成什麼？下次同步會怎樣？ | `design.md` 修訂紀錄 2026-09-03；`operations.md` |
| 2 | 誰能改 `review_decision` 等六個審核欄？哪兩欄誰都不要手改？ | `050` 步驟 6 |
| 3 | 誰能改標題列？為什麼要保護它？ | `050` 步驟 6 的 C 類 |
| 4 | 責任編輯按核可沒反應、也沒錯誤訊息，先查什麼？ | `050` 步驟 7；`approval-permission-probe.md` |
| 5 | 哪些判斷只有法學背景的人能做？ | `TODO.md` P0-2；`067` 票 `## Design` 第十節 |
| 6 | 試算表的保護範圍擋得住整列刪除嗎？ | `050` 步驟 6〈已知未解〉 |
| 7 | 移除 noindex 前要過哪些檢查？完整清單在哪裡？ | `TODO.md` P3-8；`056` 第三節 |
| 8 | 站上哪些內容可以是 AI 生成的？有沒有機械檢查？ | `AGENTS.md`（captain 核准後）；`TODO.md` P1-8 |

會讓它失敗的改動：刪掉總覽第 3 章。第 2、3 題答不出來。

**AC-6 — 每個缺口都指向實在的票，或寫明無票與對應的待辦項。**
Verified by：AC-4 (a) 的指令沒有 `NOT FOUND`。每一列「無票」所寫的 `TODO.md` 項目，以 `grep -n '^### {項目編號}' docs/health-check/TODO.md` 命中一行。
會讓它失敗的改動：寫一個不存在的待辦編號，`grep` 0 行。

**AC-7 — 「只靠人」的防線明白標示。**
Verified by：總覽第 5 章每一列的「機械或人工」欄只能是 `機械`、`人工`、`人工（有記錄）` 三值之一。
reviewer 對每一列 `機械` 實際執行它所指的腳本或測試一次，記錄離開碼。每一列 `人工` 寫明由哪個角色做。
會讓它失敗的改動：把「PR diff 審閱」標成 `機械`，它沒有可執行的腳本。

**AC-8 — 三處過時句已補述，原句保留。**
Verified by：`git diff 8a3d8d1 -- docs/project/tech-stack.md docs/content-pipeline/design.md | grep -c '^-[^-]'` 為 0，即只有新增。
兩檔各有一則 2026-09-29 的 ⚠️ 補述（design 階段已完成，見 `## Documentation impact`〈現在更新〉）。
`AGENTS.md` 的補述在 captain 核准後以同一方式查核。
會讓它失敗的改動：直接改寫原句，`grep -c` 大於 0。

**AC-9 — 第三類禁令以 captain 核准的措辭寫成明文。**
Verified by：本票 `### Feedback Cycles` 有一行 captain 核准的措辭記錄。`AGENTS.md` 與 `design.md` 第六節新增的那一句，與記錄的措辭逐字相同，以 `diff <(echo …) <(echo …)` 比對無輸出。
會讓它失敗的改動：任一處措辭與核准記錄不同。

## 相依

- **feature 041** 正在修既有文件的過時敘述。本票不重複處理那 23 處，但須在 041 合併後才寫總覽，避免描述到即將改變的內容。
- **feature 047／051／053** 會改變第二、三類的機制現況。本票的總覽須能吸收它們的結果，或明確標記為「進行中」。
- **feature 039**（渲染檢查工具）明文宣告它不做 AI 內容偵測。總覽須正確反映這個邊界，不得讓讀者誤以為它涵蓋。

> **2026-09-29（design）相依更新**：
> - `041` 已封存。第一項的等待條件已解除。
> - `040` 已合併，核可版本綁定已在 repo 生效。`050` 已於 2026-09-29 在正式表執行 S1–S9。
> - **`050` 合併後再開始 implement 較好。** 屆時保護範圍的正本會移進 `operations.md`，總覽直接連那裡。
>   先開工也可以：連到 `050` 票的路徑。`050` 封存時 M6 會指名那一行，提醒更新。
> - `069` 在 `TODO.md` P3-8 加 `067` 的第二條解除條件。本票不重寫它，只用第一節 1.4 的指令讀出。兩票互不為前置。
> - `047`／`051`／`053`／`039` 的進度不寫進總覽，由票況指令產生。

## Out of scope

不實作任何把關機制本身（那是 040、042、043、047、051 各自的工作）。不處理既有內容的處置（049、052、053）。不建立新的常設檢查，除非前三階都不足且經 captain 再次核准。

**design 階段追加**：

- 不修 `docs/content-pipeline/operations.md` 第 5、12、41、79 行的過時句。那是 `050`〈實作後更新〉的工作（E2 的 D0、D 兩組都指出）。
- 不修 `docs/health-check/TODO.md` P2-12 與 `docs/INDEX.md` 第 162、177 行的過時句。它們不屬於任何票，已回報 FO。
- 不改 `069` 的內容，也不改 P3-8。
- 不採用 `docs/INDEX.md` 第 4 階段的防漂移腳本。
- 不採用候選規則「把關總覽跟著把關變動」（E1 無增益）。

## Expected surface and tolerance

design 階段已完成：`docs/project/tech-stack.md` +6 行、`docs/content-pipeline/design.md` +26 行，只有新增。

implement 預估：+200 net LOC across 6 files，tolerance ±35%。

| 檔 | 預估 |
|---|---|
| `docs/content-pipeline/gatekeeping.md`（新增） | 150–220 行 |
| `docs/constitution-features/README.md` | +5 行（條款＋修訂紀錄一則） |
| `docs/INDEX.md` | +1 行 |
| `docs/project/contributing.md` | +2 行，指向總覽 |
| `AGENTS.md`（captain 核准後） | +10 行左右 |
| `docs/content-pipeline/design.md`（captain 核准後） | 第六節 +1 列、修訂紀錄 +8 行 |

Semantics this may change：README review stage 多一項必要輸出（repo 外步驟之後重判文件影響）。不改程式，不改 `src/`，不改 `scripts/`，不改試算表。

## Test plan

- AC-1、AC-2：各派一個 fresh reviewer 重做實驗。構造方式見 `## Design` 第一節。每組只跑一次，stage report 照實標明。
- AC-3：M6 逐一封存演練，在 clone 上做，不動主 checkout 的檔。
- AC-4、AC-6、AC-7：指令與一次性掃描，輸出貼進 stage report。
- AC-5：fresh agent 八題測驗。
- 不執行 `npm run sync-content`。本票不改程式，`npx tsc --noEmit` 與 `npm run build` 不是必要驗證。

## Documentation impact

### 現在更新

| 文件 | 為什麼現在要改 | 更新內容 |
|---|---|---|
| 本票 | design 定案 | `## Design`、AC、相依、Out of scope |
| `docs/project/tech-stack.md`〈部署邊界〉 | 「正式 SSOT 尚未套用」自 2026-09-29 起不成立 | **已完成**。追加 ⚠️ 補述，原句保留。只寫已完成的事，不寫總覽或條款（兩者未實作） |
| `docs/content-pipeline/design.md` 檔頭與〈部署狀態〉 | 同上 | **已完成**。檔頭與〈部署狀態〉下各一則 ⚠️ 補述，文末修訂紀錄一則。原句保留 |
| `AGENTS.md` 第 29–30 行 | 同上 | **未套用。** 提案文字在 `## Design` 第三節 (a)。`AGENTS.md` 是 `CLAUDE.md` 的 symlink，須 captain 本人核准文字後才可套用 |

### 實作後更新

| 文件 | 完成條件 | 更新內容 |
|---|---|---|
| `docs/content-pipeline/gatekeeping.md`（新增） | AC-3 至 AC-7 通過 | 依 `## Design` 第二節 |
| `docs/INDEX.md` | 總覽檔已建立 | 〈內容產線〉表加一列，狀態 evergreen。AC-3 依賴這一列 |
| `docs/constitution-features/README.md` | captain 核准條款 | review stage Outputs 加 1.2 條款；〈修訂紀錄〉加一則 |
| `docs/project/contributing.md` | 總覽檔已建立 | 〈內容協作〉末加一行指向總覽 |
| `AGENTS.md` | captain 核准 `## Design` 第三節 (b)、(c) 的措辭 | 「絕對不要做的事」第 5 條；〈文件地圖〉一列 |
| `docs/content-pipeline/design.md` 第六節 | 同上 | 不變式表第 7 列；修訂紀錄一則 |
| `docs/health-check/TODO.md` | FO 對 AC-6 的處置（implement cycle 1） | 新增 P2-13、P2-14 與進度紀錄一列。P3-8 由 `069` 修改，本票以指令讀出；P2-12 的過時句不屬本票 |

### 不更新

| 文件 | 理由 |
|---|---|
| `docs/content-pipeline/operations.md` | 過時的第 5、12、41、79 行屬 `050`〈實作後更新〉。本票只連結它 |
| `docs/health-check/2026-09-03-editor-onboarding.md` | record。補述屬 `050`〈實作後更新〉 |
| `docs/content-pipeline/data-collection-guide.md` | 總覽只連結它 |
| `docs/constitution-features/_archive/` 內的 `056`、`067`、`040` | 已封存，不改 |
| `docs/content-audit/` | `067`／`069` 的產出 |

### Feedback Cycles

- 2026-09-29 captain 核准措辭（「全部照建議」，經 FO 轉述）：`## Design` 第三節 (a)、(b)、(c) 照提案原文套用；(b) 第 5 條逐字同時作為 `design.md` 第六節不變式第 7 列；候選規則「把關總覽跟著把關變動」不採用。README 條款由 FO 於 `34663fd` 套用。
- Cycle 1: REJECTED — verify（`8026f4a`）判 V1（第 7 章把 L／H 閱讀清單寫成 P3-8 條件，AC-5 7/8）、V2（:119 無出處日期）Material。FO 授權 V1–V5 fix（V3 依 captain 2026-09-29 核准記錄「逐字」補齊 `design.md` 第 7 列，不改 `AGENTS.md`），V6 decline for 054（交 `064`：後合併者重判總覽），V7 無動作。implement cycle 2 修正於 `f916c94`，fresh agent AC-5 8/8。round 記錄：`review/verify/round-1`。
- Cycle 2: REJECTED — review（`c01e361`）判 R1 Material（`gatekeeping.md:198` 自連結在 054 封存後使 M6 由 9 變 10）。FO 授權 R1–R3 fix（R1 改指 `_archive/` 路徑；R2 `TODO.md` 移到〈實作後更新〉；R3 第 4 章加一句「指紋」說明），R4 無動作（合併時由 FO 處理），R5 decline for 054（後合併者重判總覽第 4、5 章）。implement cycle 3 修正於 `3cdddd7`，clone 上封存前後 M6 皆 9、不指名總覽。round 記錄：`review/review/round-2`。

## Stage Report: design

- DONE: Design the update mechanism first (the ticket's primary deliverable, per the captain's 2026-09-04 requirement), climbing the cheapest-falsifiable ladder in the ticket; demonstrate by an actual exercise whether a ticket that changes gatekeeping but omits the overview doc from Documentation impact gets caught by the existing review stage.
  E1：fresh reviewer 7 組（fixture 5、真實 repo clone 2）。6 組缺陷情境（漏列或誤列〈不更新〉，有無新規則各半）全部 REJECTED 並指名總覽；對照組不報漏列 → 現有 review 已擋 in-diff，不加規則。E2：`050` 真實歷史證明 repo 外部署後沒有 review；重演 D0 漏 `tech-stack.md`，加條款的 D 找到三處全部 → 採用 review stage 條款。E3：M6 抓 `docs/…` 連結、不抓純檔名。每組 n=1，已註明。
- DONE: Specify the overview document the captain asked for on 2026-09-29: one place describing the editorial flow per role (contributor, scholar, 責任編輯, captain), who can edit which sheet columns (the 050 A/B/C protection classes), the approval-binding rule now live via 040, and the pre-launch checks (056 G-1..G-8, 067 check in P3-8) — linking to canonical sources instead of copying them.
  `## Design` 第二節：十章結構、五個角色的起點內容、A/B/C 與三項已知限制、防線表與缺口表起點。P3-8 以 `awk` 指令讀出（`069` 加第二條後自動多印一行），票況以 `id:` 指令產生（2026-09-29 實跑 12 個票號全找到，`999` 印 NOT FOUND）。
- DONE: Acceptance criteria each carry a falsifiable Verified by; documentation impact split into 現在更新 / 實作後更新 / 不更新, including the three stale "正式 SSOT 尚未套用" spots (tech-stack.md 部署邊界, design.md 部署狀態, AGENTS.md:29) now false after 050.
  AC-1–AC-9 各有外部查核與會讓它失敗的改動。`tech-stack.md` 與 `design.md` 已追加補述（只有新增，`git diff | grep -c '^-[^-]'` = 0）。`AGENTS.md:29` 未套用：它是 `CLAUDE.md` 的 symlink，提案文字待 captain 本人核准。

### Summary

更新機制分三層，全用既有守衛：現有 review 擋票內漏列（E1 實測，不加新規則）；review stage 加一條「repo 外步驟之後重判文件影響」補 `050` 形狀的洞（E2）；總覽連結寫 `docs/…` 讓 `067` 的 M6 抓失效（E3），而 `069` 會把 M6 綁進上線條件。不新增常設檢查。
另發現：`AGENTS.md` 的第三類禁令原句在 repo 找不到出處，措辭交 captain 定案；`operations.md` 四處、`TODO.md` P2-12、`INDEX.md` 兩處同屬過時，不在本票範圍，已回報 FO。

## Stage Report: implement

- DONE: Write docs/content-pipeline/gatekeeping.md per the design's ten chapters — per-role flow, A/B/C column permissions, the live approval-binding rule, pre-launch checks, defense and gap tables — linking to canonical sources with docs/… paths (M6-protected), with ticket status and P3-8 conditions produced by the design's commands, never prose; every gap points to a real ticket or says 無票 with its TODO item; human-only defenses labelled explicitly.
  `22ac14b`、`ea45cf0`：196 行，第 0–9 章。AC-4 (a) 票況指令 exit 0、12 行無 `NOT FOUND`（改 `062`→`999` 印 `999 NOT FOUND`）；(b) 單調句掃描 0 行（加「043 尚未完成」→1 行）。AC-7：防線表 12 列，「機械或人工」只用三值；`機械` 列實跑：binding test exit 0（52/52）、`content-audit check` exit 1（既有 M4／M5／M6 共 12 筆，無 `gatekeeping.md`）、`check-voided-floor` 對 `/future`、`/past` exit 0、`threshold-analysis` test exit 1（見下）、`056` G-6／G-7 PASS、G-8 build 與 tsc exit 0、noindex grep 印 `noindex, nofollow`。
- DONE: Apply the captain-approved AGENTS.md changes verbatim from the design (a/b/c) and design.md §六 invariant row 7 plus its revision entry; register gatekeeping.md in docs/INDEX.md. README not edited.
  `22ac14b`。AC-9：`diff` AGENTS 第 5 條全文 vs 本票提案、(a) 補述 vs 提案、第 5 條前兩句 vs `design.md` 第 7 列，三者皆無輸出；核准記錄見 `### Feedback Cycles`。AC-8：`git diff 8a3d8d1 -- AGENTS.md tech-stack.md design.md | grep -c '^-[^-]'` = 0。另依〈實作後更新〉在 `contributing.md`〈內容協作〉加一行指向總覽。
- DONE: Prove AC-1..AC-9 each with its stated Verified by and failing change; content-audit shows no new M6 hits; 056's G-7 still PASS; tests and tsc pass; never run npm run sync-content.
  逐項如下。**AC-1 與 AC-5 各有一次首輪未過，照實列出。**

**AC-1（真實 repo clone、本票檔移除、候選為 043 形狀：同步加筆數下降中止；fresh reviewer 只給 review stage 定義）**：
- 第一輪（候選弄壞 3 個既有測試）：R0 REJECTED，但**未指名總覽**，finding 全在測試回歸與 AC 缺漏。**未通過。**
- 第二輪（候選修正為測試全過、附 AC）：R0b REJECTED，finding 1 指名 `gatekeeping.md:117` 與 `:162` 被推翻、且未列入 Documentation impact。**通過。**
- 對照 C（兩輪）：都沒有漏列 finding；只指出總覽改寫的內容不夠準（C2：筆數比對抓不到「刪一列加一列」）。
- 會失敗的改動 F（刪掉兩句）：**預期未發生，兩輪都仍指名總覽。** F1 從第 5 章「擋什麼」的檢查清單找到；F2 發現第 1 章「改過未重核可的列不會寫進 JSON」也被候選推翻（候選讓這種情況整份中止）。總覽中會被推翻的句子不只 design 點名的兩句。
- 結論：擋得住，但不確定。n=4 的 R0 類中 1 次漏。第一輪的漏發生在 reviewer 被更大的缺陷吸走注意時。

**AC-2（D 組，`b4807cc^` clone，050 換成含〈部署窗口記錄〉版，README 含條款）**：REJECTED，finding 同時指名 `AGENTS.md:29`、`tech-stack.md:41–42`、`design.md:650–651`。通過。n=1；D0 未重跑，比較沿用 design 的結果。
**AC-3**：clone 上 22 個 `docs/…` 路徑逐一移入 `_archive/`：21 個讓 M6 指名總覽 1–10 筆，移回 0 筆。例外是 `docs/INDEX.md`：移走它 M6 就不掃任何 INDEX 列出的文件，0 筆，屬 M6 的結構限制。INDEX 改標 `record` 再封存 `operations.md` → 0 筆（對照 evergreen 為 5 筆）。主 checkout 的 `check` 指名總覽 0 行；與實作前相比無新增 M6（文件數 95→96，`design.md:616` 的既有一筆因插列移到 `:617`）。
**AC-5**：第一輪 7／8，第 8 題答不出「哪些內容可以是 AI 生成」。`ea45cf0` 在第 6 章補一段明寫。第二輪 fresh agent 8／8，逐題與正本相符。
**AC-6**：DONE。票況指令無 `NOT FOUND`。缺口表三列「無票」各指一個 `TODO.md` 項目，`grep -n '^### {id}' docs/health-check/TODO.md` 各命中 1 行：P0-2（:243）、P2-13（:720）、P2-14（:730）；寫 `P2-99` → 0 行。P2-13（保護範圍只到第 1000 列）與 P2-14（Apps Script 沒有欄位標題別名表）依 FO 處置在本票新增（`TODO.md` 只加兩項與進度紀錄一列，不動 050 改的 P2-12／P3-7）。改後 M6 仍 9 筆、無新增，G-7 PASS，單調句掃描 0 行。
**AC-4、AC-7、AC-8、AC-9**：見上方兩項。
**測試**：`approval-content-version-binding` 52/52、`content-audit` 16/16、tsc exit 0、build exit 0 且 `src/data/*.json` sha256 不變。`threshold-analysis` 31/32：`AC-7 build 指令…不得夾帶內容同步` 失敗，本票改動前（`git stash`）同樣失敗，本票沒動程式。未執行 `npm run sync-content`。實驗 clone 都在 scratchpad，未推送。

### Summary

總覽 `docs/content-pipeline/gatekeeping.md` 已寫成並列入 INDEX；`AGENTS.md` (a)(b)(c)、`design.md` 不變式第 7 列依核准原文套用，G-7 仍 PASS，M6 無新增。
需要 FO 知道的有三件事。AC-1 的 R0 首輪漏抓，第二輪抓到，design 寫的「會失敗的改動」兩輪都沒使 reviewer 失敗，因為總覽還有其他句子會被推翻。AC-5 首輪 7／8，已補第 6 章後 8／8。AC-6 的兩列缺口已依 FO 處置新增 `TODO.md` P2-13、P2-14 並改指過去，無偏離。

## Stage Report: verify

- FAILED: Verify every factual claim in docs/content-pipeline/gatekeeping.md against its canonical source: per-role flow, the A/B/C protection classes and ranges (050), the approval-binding rule (040/operations.md), pre-launch checks (056 G-1..G-8, P3-8), and each defense/gap row's cited ticket or TODO item; flag any sentence that misstates or goes stale, with the correct value.
  已查核：第 1 章對照 `sync-content.mjs:358-427`（`isApproved`、`validateApprovalBinding`），`Needs review` 列不寫進 JSON 屬實。第 2 至 4 章對照 `050` 步驟 6、7、S7-b（27 格擋、3 格可改，`:3655-3657`）、S7-d 18 格、〈部署窗口記錄〉第二節，以及 `approval-permission-probe.md` 的 P1、P7 與〈過程發現〉一、二；拒絕必填原因見 `.gs:204`。第 5 章：`PLACEHOLDER_PATTERNS` 5 組（`sync-content.mjs:69-75`），`056` G-1 至 G-8 分類，`067` 的 M1–M6、L、H（`## Design` 第二、三、十節），`check-voided-floor.mjs` 出自 `066`（`5eff145`）。第 6 章對照 `data-collection-guide.md` T3 SOP（:116-141）。第 8 章 9 張票的 title 與缺口列相符；`039` 的 title 寫明「非 AI 內容偵測」。**共 4 筆不符，列於下方 V1、V2、V4、V5。**
- FAILED: Confirm AGENTS.md (a)(b)(c) and design.md §六 row 7 are byte-identical to the captain-approved wording in 054's design, the symlink is intact, and no other AGENTS.md line changed; re-run AC-4 (ticket-status command, 0 NOT FOUND) and AC-6 (every 無票 row resolves to a TODO heading).
  AGENTS 的 (a)、(b) 分別與 `3fe06a9` 第 253–255、260–264 行的提案比對，`diff` 皆無輸出。提案文字自 design commit `b4807cc` 起沒有改過。(c) 那一列 `grep -c` 得 1。`AGENTS.md` 只有新增 11 行、刪除 0 行。`CLAUDE.md` 是 mode `120000`，指向 `AGENTS.md`。AC-4：exit 0，12 行，沒有 `NOT FOUND`；在併入 main 的 clone 上重跑也一樣。AC-6：P0-2 在 :243，P2-13 在 :720，P2-14 在 :730，各命中 1 行。**不符的一項是 V3：`design.md` 第 7 列只有 (b) 的前兩句，不是逐字的完整 (b)。**
- FAILED: Independently re-run AC-5 with a fresh agent that has not seen the ticket (the captain's four questions answered only from gatekeeping.md) and AC-3's M6 protection on at least three archived paths; placeholder scan; confirm 056 G-7 PASS and content-audit shows no new failures.
  AC-5：只給 fresh agent 一份檔案的副本，結果 **7／8**。第 7 題列出 `067` 的 `check` 與閱讀清單，當成移除 noindex 的條件；正本 P3-8 只有 `056` 那一條（見 V1）。AC-3 在 clone 上封存 5 條路徑：`050` 票得 6 筆（:47、:92、:116），`operations.md` 5 筆，`043` 2 筆，`approval-permission-probe.md` 2 筆，`TODO.md` 12 筆；全部移回後都是 0 筆。佔位掃描：diff 的新增行只在引述事故（`某學者，某大學法律系`）與測試檔名時命中，`src/` 零變動。單調句掃描 0 行。G-7 依正本抽出執行（1018 B），結果 `G-7 PASS [place1=1/1 place2=1 place3=1]`，exit 0。`content-audit check`：main 與 worktree 都是 M4=1、M5=2、M6=9，差別只有 `TODO.md` 行號位移 21 行，沒有新增失敗。

### Findings（唯讀，未動候選）

- **V1（Material，本票可修）**：第 7 章 :150–154 把 `067` 的 `check` 與 L／H 閱讀清單寫成「條件引用的檢查」。正本 `TODO.md` P3-8（:986）的解除條件只有 `056` 那一條，用第 7 章自己的 `awk` 指令就能印出。`069`（design）依 captain 2026-09-29「要綁」的決定，只加 `check`（`069` 票 :21、:50-59），**閱讀清單從來不是 P3-8 的條件**。captain 的受眾會把這段讀成 noindex 的前置條件，fresh reader 第 7 題就是這樣讀的。建議修法：分成兩段，一段寫「P3-8 的條件用指令印出」，另一段寫「captain 2026-09-29 決定把 `check` 綁進 P3-8，施工單 `069`」，並寫明閱讀清單不是 P3-8 的條件。修法沿用單調句規則，不寫「尚未」。
- **V2（Material，本票可修）**：第 5 章 :119 寫「擋不到 2026-05-01 之前上線的內容」，這個日期在 repo 內找不到出處。`verify` stage 由 `565cd93`（2026-04-30）加入。具名的佔位掃描由 `1eff0e2`（2026-09-02 refit）加入。workflow 在 2026-09-02 之前休眠（見 `AGENTS.md`〈實作方式〉）。正確的邊界是「不走 workflow 的改動」。如果要寫日期，佔位掃描的日期是 2026-09-02。
- **V3（Needs decision，captain 措辭）**：`design.md` 第 7 列等於 (b) 的前兩句，缺「要加內容，寫進試算表並走核可。」與指向總覽的那一句。核准記錄（`### Feedback Cycles`）寫「(b) 第 5 條逐字同時作為…第 7 列」。修訂紀錄 :742 也寫「與 `AGENTS.md` 第 5 條相同」。有兩條路：第 7 列補上缺的句子，或把修訂紀錄與核准記錄改成「取前兩句」並由 captain 確認。兩條路都不改 `AGENTS.md`。
- **V4（Polish，併入 main 就過時）**：:181 寫「`067` 與 `069` 的檔名沒有編號前綴」。main 的 `be77290` 已把 `069` 改名為 `069-content-audit-followups.md`，所以 `069` 那一半不成立。指令本身不受影響。
- **V5（Polish）**：第 4 章 :100 寫「同步不信任試算表顯示的 `status`」。實際上 `status` 決定這一列要不要檢查（`isApproved`；`approval-permission-probe.md`〈過程發現〉一）。`design.md` :651 的寫法「同步不再只憑 `status = Approved` 放行」較準確。
- **V6（Deferred risk，交 FO）**：`064` 分支在 `sync-content.mjs` 新增 `case_ref` 允許清單、`stance` 允許清單與兩欄成對的檢查。這是新的防線，第 5 章 :117 沒有列出。`064` 的 base 沒有總覽，所以它的 Documentation impact 列不到總覽。升級為 Material 的條件：兩票都合併，而後合併的那一張沒有重判總覽。
- **V7（資訊，050 合併時）**：在 clone 上試併 `050` 分支，`docs/INDEX.md` 與 `design.md` 修訂紀錄各有一處兩邊都新增的衝突，保留兩邊即可解決，`TODO.md` 自動合併。`050` 封存時，M6 會指名總覽 :47、:92、:116 與 `TODO.md` 的 P2-13、P2-14，這是設計好的行為。屆時 :92 的正本改指 `operations.md`〈正式 SSOT 部署〉〈保護範圍（12 個）〉，這一節由 `050` 新增。
- 另記：`tests/threshold-analysis.test.mjs` 31／32，main 上一樣失敗，與本票無關。binding test 52／52，exit 0。

### Summary

REJECTED。檔頭 AGENTS (a)(b)(c) 與核准文字逐字相同，symlink 完整。AC-3、AC-4、AC-6、G-7 都通過，佔位掃描乾淨，`content-audit` 沒有新增失敗。退件理由有兩項。V1：第 7 章把不在 P3-8 裡的檢查寫成移除 noindex 的條件，fresh reader 的第 7 題因此答錯，AC-5 只得 7／8。V2：:119 的日期沒有出處。V3 要 captain 定案 `design.md` 第 7 列是否要逐字。V4 至 V7 是 Polish、延後風險或合併時的提醒。

## Stage Report: implement (cycle 2)

- DONE: V1 — 第 7 章改成兩段：(1) P3-8 的解除條件以 `awk` 指令印出，並指向 `056` G-1 至 G-8；(2) captain 2026-09-29 決定把 `content-audit.mjs check` 綁進 P3-8，施工單 `069`，以指令輸出為準。另寫明 L／H 閱讀清單不是 P3-8 的條件。
  AC-5 用沒看過兩張票的 fresh agent 重跑，只給 `gatekeeping.md`：8／8。第 7 題明寫「`067` 的閱讀清單不是條件」。
- DONE: V2 — 第 5 章 verify 那一列的擋不到什麼改成「不走 workflow 的改動。具名的佔位掃描自 2026-09-02 refit（`1eff0e2`）起才寫進 `verify` 的輸出」。
  `grep -c 2026-05-01` = 0。
- DONE: V3 — `design.md` 第六節第 7 列改為 (b) 的完整三句本文，逐字。
  本票提案 (b) 去掉標題後的三行接成一行，與第 7 列 `diff` 無輸出。`git diff --quiet 3fe06a9 -- AGENTS.md` 成立，`AGENTS.md` 未動。修訂紀錄「與第 5 條相同」因此成立。
- DONE: V4 — 第 8 章刪掉「`067` 與 `069` 的檔名沒有編號前綴」。
  指令保留。
- DONE: V5 — 第 4 章改為「同步不再只憑 `status = Approved` 放行。`status` 決定一列要不要檢查；被檢查的列，同步自己重算指紋…」。
  與 `design.md` :651 一致。
- DONE: 檢查。
  G-7 PASS（place1=1/1、place2=1、place3=1）。`content-audit check` 仍是 M4=1、M5=2、M6=9，指名 `gatekeeping.md` 0 行，沒有新增失敗。單調句掃描 0 行。
- SKIPPED: V6 由 FO 帶到 `064`；V7 無需動作。
  依 FO 處置。

### Summary

依 FO 處置修了 V1–V5，只動 `gatekeeping.md` 第 4、5、7、8 章與 `design.md` 第 7 列。AC-5 重跑 8／8，第 7 題不再把閱讀清單列為上線條件。本 commit 一併帶上 FO 在工作區改的 frontmatter `status: implement`，本輪沒有改 frontmatter。

## Stage Report: verify (cycle 2)

- DONE: Re-check V1–V5 against canonical sources
  V1：第 7 章改成「P3-8 的條件用指令印出」。現在印出 1 行，只有 `056` 那一條，文字與 P3-8「（2026-09-21 加入）」相符。`067` 的 `check` 寫成 captain 決定綁入、施工單 `069`，並寫明「出現在指令輸出裡才算條件」，與 `069` 票 :21、:50-59 相符。閱讀清單寫明不是 P3-8 的條件。V2：新寫法是「具名的佔位掃描自 2026-09-02 refit（`1eff0e2`）起才寫進 `verify`」。`git log -S'Placeholder scan' --all -- docs/constitution-features/README.md` 只有 `1eff0e2`，相符。V4：:181 的檔名那句已刪除，指令不依賴檔名。V5：:100 改為「不再只憑 `status = Approved` 放行；`status` 決定一列要不要檢查」，與 `sync-content.mjs` 的 `isApproved`／`validateApprovalBinding` 相符，也與 `design.md` :651 一致。
- DONE: Re-run AC-5 with a new fresh agent (target 8/8; Q7 must not list the reading list as a P3-8 condition)
  這次用新的 fresh agent，副本改名為 `overview.md`，只讀一個檔，不執行指令，得 **8／8**。第 7 題答 `056` 的 G-1 至 G-8、完整清單在 `056` 第三節，另補一句「自 `069` 起加入 `067` 的 `check`」。**沒有列閱讀清單**。其餘七題逐題對照正本，與 cycle 1 的判定相同。
- DONE: Confirm design.md row 7 byte-identical to (b), AGENTS.md unchanged from 3fe06a9, G-7 PASS, content-audit no new failures
  第 7 列與 (b) 提案三行串接後的字串相同，`diff` 無輸出。`design.md` 對 `657e015` 只有新增，刪除行數為 0；對 `8026f4a` 只換了第 7 列那一行。修訂紀錄寫「與第 5 條相同」，現在成立。`git diff 3fe06a9 HEAD -- AGENTS.md CLAUDE.md` 無輸出，`CLAUDE.md` 仍是 mode `120000`。G-7 依正本抽出執行，得 `G-7 PASS [place1=1/1 place2=1 place3=1]`，exit 0。`content-audit check` 的輸出與 cycle 1 逐字相同（M4=1、M5=2、M6=9，96 份文件），指名總覽的行數為 0。單調句掃描 0 行。

### Summary

PASSED。V1、V2、V4、V5 已依正本修正，V3 的第 7 列已與 (b) 逐字相同。新的 fresh reader 得 8／8，第 7 題沒有把閱讀清單當成 P3-8 條件。`AGENTS.md` 自核准版本起未再變動，G-7 通過，`content-audit` 沒有新增失敗。本輪沒有新 finding。V6（交 `064`）與 V7（`050` 合併時的兩處保留兩邊的衝突）依 FO 處置，未重判。

## Stage Report: review

- DONE: Review gatekeeping.md and the AGENTS.md/design.md/INDEX/contributing.md edits against the design for what verify did not own: structure and readability for a non-engineer captain, links written as docs/… paths, no ticket status in prose, and the design's update mechanism actually delivered (README clause present at 34663fd, commands in the doc run and print what the doc claims).
  結構照 design 第二節十章，198 行（預估 150–220）。每道防線先寫擋什麼、擋不到什麼，只靠人的防線都標明。全部 Markdown 連結的可見文字都是 `docs/…` 路徑，`AGENTS.md` 在根目錄，M6 本來就不管。單調句掃描 0 行。`34663fd` 是 HEAD 的祖先，條款與 design 1.2 逐字相同。三條指令都實跑過：P3-8 指令 exit 0，印 1 行（`056` 那條）；票況指令 exit 0，12 行，沒有 `NOT FOUND`；自查 `check | grep gatekeeping.md` 無輸出。AC-1 另做一次獨立重演：clone 壓成單一 commit，拿掉本票，候選是 043 形狀（兩成跌幅門檻，測試全過），fresh reviewer 判 REJECTED，第 1 項 finding 指名 `gatekeeping.md:117`、`:162`。累計 R0 類 5 次抓到 4 次。發現 R1、R3，見下方。
- DONE: Check every ## Documentation impact row against delivered behavior, record docs untouched (editor-onboarding etc.), AGENTS.md change limited to the three captain-approved edits, TODO P2-13/P2-14 correctly formed; apply the new README out-of-repo clause (no out-of-repo step expected).
  〈實作後更新〉六列都已完成。README 條款在 main `34663fd`。INDEX 的列在〈內容產線〉，標 evergreen。`git diff 657e015 HEAD --stat` 只改 7 個檔。operations、editor-onboarding、data-collection-guide、`_archive/`、`docs/content-audit/` 都沒動。`AGENTS.md` 只加 11 行、刪 0 行，就是 (a)(b)(c) 三處。`CLAUDE.md` 仍是 symlink。P2-13、P2-14 六欄齊全，數字與 main 上 `050` 票相符（:7742-7747、:2315-2323、18／21／12、`d44`），進度紀錄也加了一列。repo 外步驟條款：本票沒有執行 repo 外步驟，不需要重判。發現 R2，見下方。
- DONE: Identify regressions (056 G-7, content-audit no new failures, tests/tsc/build) and anticipate merge interplay with 050 (INDEX, design.md revision log) and 064 (new sync checks missing from ch.5); end with a clear PASSED or REJECTED verdict.
  G-7 從正本抽出執行，得 `PASS [place1=1/1 place2=1 place3=1]`，exit 0。`content-audit check` 是 M4=1、M5=2、M6=9，與 verify 相同。binding test 52/52、content-audit test 16/16、tsc exit 0。build exit 0，`src/data/*.json` sha256 不變，`noindex, nofollow`。`threshold-analysis` 31/32，在 main `96d5908` 上同樣失敗，本 branch 只改 `.md`。合併與 064 見 R4、R5。判定：**REJECTED**，只因 R1。

### Findings（唯讀，未動候選）

- **R1（Material，本票可修）**：`gatekeeping.md:198` 寫 `docs/constitution-features/054-gatekeeping-overview.md`。本票完成時一定會封存，封存後 M6 會多出一筆新失敗。實測：在 clone 上 `git mv` 到 `_archive/` 後，M6 從 9 變成 10，第 10 筆是 `gatekeeping.md:198 … 已封存`。第 9 章自查指令寫著「應無輸出」，封存後會印出一行。AC-3「指名 gatekeeping.md 的行數為 0」也不再成立。`050` 封存時的命中是設計好的，因為那時缺口表要跟著改；本票封存時的命中沒有要改的內容。修法：把路徑改成 `docs/constitution-features/_archive/054-gatekeeping-overview.md`。實測封存前後 M6 都是 9，沒有指名總覽。另一個做法是 FO 在封存的 commit 裡改這一行。
- **R2（Polish）**：〈不更新〉還列著 `docs/health-check/TODO.md`，但本 branch 在 TODO 新增了 P2-13、P2-14。這是 FO 依 AC-6 授權的處置。修法：把這一列移到〈實作後更新〉，或補一行說明。
- **R3（Polish）**：總覽第 23 行起用了「指紋」，全文沒有解釋。captain 不是工程師。建議在第 4 章加一句說明：指紋是依發布內容算出的代碼，內容改一個字，代碼就不同。
- **R4（合併提醒，050）**：在 clone 上先併 main，只有本票 frontmatter 的 `status` 衝突，屬於 FO 的狀態記錄。接著併 `050`：`docs/INDEX.md` 衝突時，保留 `050` 兩列更新後的日期，加上本票新增的那一列。`design.md` 修訂紀錄衝突時，兩則都保留。`050` 那一則寫著「上一則修訂紀錄（feature 054）已補的檔頭與〈部署狀態〉」，所以它要緊接在 054 design 階段那則補述之後，放在不變式 #7 那則之前。否則「上一則」會指到不變式 #7。`050` 的 `operations.md` 已有〈保護範圍（12 個）〉，與總覽 :92 相符。
- **R5（合併提醒，064，延續 V6）**：`064` 除了 `sync-content.mjs` 新增的 `case_ref`／`stance` 允許清單與成對檢查（第 5 章 :117），也把兩欄選填欄位放進指紋（`content-fingerprint.mjs`、`.gs`）。填了值的列要重新核可。所以第 4 章也要重判，不是只看 :117。
- 實驗 clone 都在 scratchpad，沒有推送。沒有執行 `npm run sync-content`。沒有動 git stash。

### Summary

REJECTED，只因 R1。本票一封存，總覽第 198 行自己的連結就會讓 M6 多一筆失敗，第 9 章寫的自查也會失敗。修法是改一行，已實測有效。其餘都通過：更新機制已交付，三條指令輸出與文件所述相符。AC-1 獨立重演再抓到一次，累計 5 次抓到 4 次。`AGENTS.md` 只有核准的三處。G-7、tests、tsc、build 沒有回歸。R2、R3 是可以一起修的 Polish。R4、R5 是給合併與 `064` 的提醒。

## Stage Report: implement (cycle 3)

- DONE: R1 — `gatekeeping.md:198` 的自連結改為 `docs/constitution-features/_archive/054-gatekeeping-overview.md`。
  clone 上 `content-audit.mjs check`：封存前 M6=9、指名 `gatekeeping.md` 0 行；`git mv` 054 進 `_archive/` 後 M6=9、0 行；第 9 章自查兩次都無輸出。對照：封存後改回舊路徑 → M6=10，指名 `gatekeeping.md:199`。
- DONE: R2 — 本票〈Documentation impact〉的 `docs/health-check/TODO.md` 由〈不更新〉移到〈實作後更新〉。
  新列：「| `docs/health-check/TODO.md` | FO 對 AC-6 的處置（implement cycle 1） | 新增 P2-13、P2-14 與進度紀錄一列。P3-8 由 `069` 修改，本票以指令讀出；P2-12 的過時句不屬本票 |」。
- DONE: R3 — 第 4 章第一次出現「指紋」處前加一條：「指紋是依發布內容算出的代碼，內容改一個字，代碼就不同。」
  `gatekeeping.md:99`。單調句掃描 0 行，G-7 PASS，`git diff --quiet 3fe06a9 -- AGENTS.md` 成立。

### Summary

依 FO 處置修了 R1–R3。R4 不動，R5 依處置不在本票處理。自連結改指封存後的路徑，封存前後 M6 都不指名總覽。本 commit 一併帶上 FO 在工作區改的 frontmatter `status: implement`。

## Stage Report: review (cycle 2)

- DONE: Re-check R1 on a clone: M6 stays 9 with 0 lines naming gatekeeping.md before and after a simulated archive; ch.9 self-check prints nothing
  clone 在 `455b872`。封存前：M6=9，指名總覽 0 行。`git mv` 054 進 `_archive/` 後：M6=9，0 行，而且 `_archive/054-gatekeeping-overview.md` 真的存在。兩次的第 9 章自查都無輸出。worktree 上直接跑自查，也無輸出。
- DONE: Confirm R2 and R3 as assigned; no other candidate change since c01e361 beyond these fixes and state lines
  R2：`TODO.md` 那一列在〈實作後更新〉（:431），〈不更新〉已經沒有它。R3：第 4 章 :99 新增一句說明「指紋」。`git diff --name-only c01e361 HEAD` 只有兩個檔：`gatekeeping.md` 加 1 行、改 1 行（R3、R1），本票檔只有 frontmatter、R2 那一列、Feedback Cycles 與 implement 報告。單調句掃描 0 行。
- DONE: G-7 PASS, and AGENTS.md unchanged vs 3fe06a9
  G-7 從 `056` 正本抽出執行，得 `G-7 PASS [place1=1/1 place2=1 place3=1]`，exit 0。`git diff --quiet 3fe06a9 HEAD -- AGENTS.md CLAUDE.md` 成立，`CLAUDE.md` 仍指向 `AGENTS.md`。

### Summary

PASSED。R1 已修好：模擬封存前後，M6 都停在 9，沒有一行指名總覽，第 9 章自查無輸出。R2、R3 依授權完成，自 `c01e361` 起沒有其他候選改動。G-7 通過，`AGENTS.md` 自核准版起未變。本輪沒有新 finding。R4 在合併時由 FO 處理，R5 由後合併的那張票處理，兩項依處置未重判。

## Stage Report: review (merge reconcile)

- DONE: Merge `main` into branch spacedock-ensign/054-gatekeeping-overview and resolve ONLY the two conflicts per review finding R4: docs/INDEX.md keeps 050's two updated dates plus 054's new row; docs/content-pipeline/design.md revision log keeps both entries, with 050's entry placed directly after 054's design-stage entry and before the invariant #7 entry. No other content change.
  合併 commit `fabf4ea`（parents `780869f`、main `341848e`）。只有這兩個檔衝突，本票 frontmatter 沒有衝突。`INDEX.md` 保留 main 那兩列的 2026-09-29，再加上總覽那一列。`design.md` 的 main 端除了 050，還多了 064、070 兩則，R4 寫的時候還沒有。處理方式：main 的四則照原順序保留（054 design、050、064、070），本票不變式 #7 那則接在最後。050 仍緊接在 054 design 那則之後，也在 #7 之前。`git diff main` 只有本票新增的內容，兩端文字都沒有改。
- FAILED: Prove the merged candidate: content-audit check shows 0 lines naming gatekeeping.md and no new failures vs main; 056 G-7 prints PASS; ch.9 self-check prints nothing; npx tsc --noEmit exits 0; AGENTS.md diff vs main is exactly the three captain-approved (a)(b)(c) additions.
  失敗兩項：content-audit 與第 9 章自查。main 上 M6=18，合併後 M6=26，其中 6 行指名總覽。第 9 章自查印出 6 行。其餘通過：G-7 印 `G-7 PASS [place1=1/1 place2=1 place3=1]`，exit 0。tsc exit 0。`AGENTS.md` 與 main 相比只多 (a)(b)(c) 三處，與 `3fe06a9` 相同。M4=1、M5=2 與 main 相同。
- DONE: End with a clear PASSED or REJECTED verdict on the reconciled candidate, naming the new HEAD SHA.
  見 Summary。

### Findings（唯讀，未動候選）

- **R6（050 已封存，本票連結失效）**：`050` 已在 main 封存（`60a240f`）。本票有 5 行仍指向 `docs/constitution-features/050-ssot-approval-deployment.md`：`gatekeeping.md` :47、:92、:117，以及 `TODO.md` :734、:745（本票 `09d496e` 新增的 P2-13、P2-14）。M6 因此多 8 行。
  四欄證據：使用者是跟著總覽找正本的人，照正常流程閱讀。害處是 5 個連結打不開。受影響的是本票自己寫的保持正確機制：第 9 章自查應無輸出。觸發證據是上面的實測。提議：Material，屬本票。修法是把 5 行改指 `_archive/050-ssot-approval-deployment.md`。
  另外，`gatekeeping.md:92` 寫「`050` 封存後，保護範圍的正本移到 operations.md」，現在條件已成立。這句要不要改寫，是 R5 的範圍（後合併者重判第 4、5 章），需要 FO 決定。

### Summary

REJECTED，HEAD `fabf4ea`（本報告 commit 在其上）。依 R4 解決了合併衝突，也沒有改到其他內容。候選被退，是因為 main 在本票核准後封存了 `050`，本票 5 行連結隨之失效（R6）。第 9 章自查與「相對 main 無新失敗」兩項因此不成立。G-7、tsc、`AGENTS.md` 都通過。沒有推送，也沒有執行 `sync-content`。
