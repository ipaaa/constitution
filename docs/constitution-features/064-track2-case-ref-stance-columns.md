---
id: 064
title: Track 2 新增 case_ref 與 stance 欄
status: review
source: constitution-features/019 第二節（captain 2026-09-23 核准加欄）
started: 2026-09-29T16:52:37Z
completed:
verdict:
score: 0.7
worktree: .worktrees/spacedock-ensign-064-track2-case-ref-stance-columns
issue:
pr:
mod-block:
gates:
    version: 1
    records:
        - id: gate:064:verify
          stage: verify
          attempts:
            - id: gate-attempt:064-verify-1
              briefing:
                id: briefing:064:verify:attempt-1:revision-1
                digest: sha256:dbbf2a88ff7457fe95c38fabdb3fa1755516114ff8762144329eb3f2d574856c
                room-ref: '@review/verify/briefing-1'
              withdrawal:
                by: agent:first-officer
                at: "2026-09-29T20:22:22.190147Z"
                reason: 'Stale: the latest stage-report section is ''implement (verify fixes)'' appended after verify, so the verify gate would present the wrong section (ac-scan empty). Relocating those lines into the implement report, then re-preparing.'
            - id: gate-attempt:064-verify-2
              briefing:
                id: briefing:064:verify:attempt-2:revision-1
                digest: sha256:95f3ee3edd70cdd4044b4bddd5ef5fc445b6d33b82e6afb7f02a702fef6ab69b
                room-ref: '@review/verify/briefing-2'
              resolution:
                type: Resolution
                id: resolution:spacedock:064:verify:2
                briefing: briefing:064:verify:attempt-2:revision-1
                by: person:captain
                at: "2026-09-29T20:31:37.842468Z"
                decision: approve
                reason: 'Captain approved 064 verify in chat 2026-09-29 (「全部照建議」): primary-source whitelist match, fingerprint parity (050 approvals stand), 20 breakages caught; accepts test LOC over design tolerance.'
              application:
                target-stage: review
                state: consumed
        - id: gate:064:review
          stage: review
          attempts:
            - id: gate-attempt:064-review-1
              briefing:
                id: briefing:064:review:attempt-1:revision-1
                digest: sha256:1ed13a078942239b85c89018ce00ee2f0f1fa30f2c3c60560d5cac5ed8dc4726
                room-ref: '@review/review/briefing-1'
---

在 `Track 2_discussion` 分頁新增 `case_ref` 與 `stance` 兩個選填欄，並讓同步程式把它們帶進 `discussions.json`，使 feature `019` 的不同意見總覽頁得以成立。

## Problem

feature `019` 原本的資料源 `opposing_views` **沒有任何合法填入途徑**：`scripts/sync-content.mjs` 對該欄零命中，`buildTrack2` 的 projection 是逐鍵白名單，而 `docs/content-pipeline/design.md:535-545` 記錄 captain 已於 2026-09-01 明確決定不收集反方意見。

`019` 的 design 因此改採不依賴該欄的方案：以 `discussions.json` 16 篇**已核可、有真實作者與原始出處**的文章為資料源，按案件與立場並排呈現，零新撰文字——刻意避開 `015`／`006`／P1-8 三次同型事故的共同動作。

代價是需要兩個新欄位。這是 `019` 的**硬前置**：`019` 的 implement 不得在本票交付資料前開始，否則其 AC-1 必定從第一次跑就失敗。captain 已於 2026-09-23 核准加欄。

## Proposed approach

規格已由 `019` 的 design 寫定，見 `019-opposing-views-overview-page.md` 第三節，本票照做：

- **試算表**：`Track 2_discussion` 加 `case_ref`（選填，只有編輯台可改，值域為 `VERIFIED_CASE_REFS` 的鍵）與 `stance`（選填，下拉選單，值域 `支持`／`質疑`／`中立分析`）。兩欄皆選填，空白者不進任何案件分組。
- **同步程式**三處改動（皆在 `scripts/sync-content.mjs`）：`TRACK_2_COLUMNS` 加兩筆皆 `optional`；`buildTrack2` 迴圈加兩條驗證（`case_ref` 非空時須在白名單、`stance` 非空時須在允許清單）；projection 加兩個條件展開，**加在 `full_content` 之後以維持既有鍵序**（該處註解已載明此要求，目的是讓 PR diff 只顯示內容差異）。
- **`case_ref` 必須是白名單而非自由文字**，常數形狀見 `019` 第三節 3.2。

`stance` 的三個值是**論點取向不是陣營**，**不得出現政黨名、陣營名或評價性用語**——此為 `015` 的驗收條件（`_archive/015-opposing-views-integration.md:62`），本票沿用。

## Risk evidence

不得直接在正式 SSOT 上試錯。加欄本身會讓現行同步在欄位檢查處中止（同 feature `050` 已證實的機制），因此施工順序與停擺窗口需在 design stage 寫清楚。

## Acceptance criteria

**交付定義（由 `019` 第二節訂定，本票沿用為 AC-1）**：同步跑完後，`src/data/discussions.json` 中**至少有一組 ≥2 筆同 `case_ref`、且 `stance` 不全相同**的記錄。未達此條件，`019` 的 AC-1 必定失敗。

其餘 AC 由 design stage 補齊，每項附可失敗的 `Verified by:`。

## Out of scope

不做 `019` 的頁面與元件。不收集反方意見（`opposing_views` 的決定不變）。不改 `full_content` 或其他既有欄位的形狀。

## Design

**結論先講：兩欄照 `019` 第三節的形狀做，但有三處必須改。**

1. **程式要改在 `040` 的版本上，不是 main 的版本。** `019` 寫 design 時引用的是 main 的
   `scripts/sync-content.mjs`。`040` 會整份改寫這支程式，且 `040` 合併在先（`050` 步驟 9）。
2. **兩欄必須進入 `040` 的內容指紋。** 不進指紋，核可之後改立場不會觸發重新核可。
   `019` 寫 design 時 `040` 尚未部署，所以它沒有處理這一點。
3. **白名單要放在共用模組。** `019` 第 3.2 節把 `VERIFIED_CASE_REFS` 放在
   `scripts/sync-content.mjs`。`019` 的頁面也要讀案由與出處，但網頁不能匯入同步程式。

照本節的順序施工，**產線停擺時間為零**。順序做反，同步會中止（見第一節事實 3）。

本票沒有任何介面。元件階層與桌機／行動版行為不適用，由 `019` 負責。

---

### 一、實測事實（全部未接觸正式試算表）

| # | 事實 | 證據 |
|---|---|---|
| 1 | `040` 尚未合併。main 的 `buildTrack2` 在 `scripts/sync-content.mjs:519-572`；`040` 版在同檔 `:581-635`（`040` worktree，commit `a51b5d9`）。`019` 第 3.3 節的行號指的是 main 舊版 | `git worktree list`；`grep -n 'function buildTrack2'` 兩版各跑一次 |
| 2 | `040` 的指紋只涵蓋 `PUBLISHED_FIELDS` 列出的 13 欄（`scripts/content-fingerprint.mjs:9-17`，Apps Script 端 `approval-workflow.gs:4-7`）。新欄不列入，就不受核可綁定 | 讀檔 |
| 3 | **試算表先加欄、程式後改 → 同步中止。** 以 `040` 的 `buildTrack2` 餵含 `case_ref`、`stance` 標題的 CSV，回傳 `null`，錯誤為「第 22 欄的標題「case_ref」對不到任何預期欄位」與第 23 欄同一則。不加這兩欄時回傳正常 | 見第十節 spike，情境 A／B |
| 4 | Apps Script 的 `resolveApprovalHeaders_`（`approval-workflow.gs:127-144`）**忽略**看不懂的標題，不會中止。只有 Node 同步端會中止 | 讀檔：`if (best)` 之外沒有 else 分支 |
| 5 | `050` 的部署窗口自 2026-09-25 起開著，停在 S7 前。正式表 `Track 2_discussion` 現為 21 欄（A 至 U），`current_fingerprint` 在最後一欄 U | `_debriefs/2026-09-29-01-claude-claude-opus-5-5.md` 的 What's Next（2026-09-28 唯讀複查） |
| 6 | 目前 `discussions.json` 沒有任何 `case_ref` 或 `stance`。AC-1 的量測指令現在輸出 `NONE`、退出碼 1 | 第七節 AC-1 指令，已實跑 |
| 7 | 16 篇文章的標題、摘要、全文中，明寫 `114年憲判字第1號` 的有 `d1`、`d6`；提到憲訴法修正的有 `d2` `d9` `d11` `d14` `d15` `d16`；**沒有任何一篇提到 113 年憲判字第 9 號或立法院職權行使法** | 第十節指令。這是字串事實，不是分類 |
| 8 | 兩筆判決字號、案由、日期以一手來源重新查證一次，與 `019` 第六節相符：`113年憲判字第9號`【立法院職權行使法等案】113年10月25日；`114年憲判字第1號`【憲法訴訟法修正案】114年12月19日 | 2026-09-29 實跑 `curl`，見第十節 |
| 9 | 網站以 `as DiscussionItem[]` 轉型讀入 JSON（`src/app/present/page.tsx:9`、`src/app/present/[id]/page.tsx:12`）。JSON 多出鍵不會造成型別錯誤。`DiscussionItem` 的型別改動留給 `019`（其第 3.4 節） | 讀檔 |
| 10 | `045` 的觸發條件是「下一次改動發布欄位投影」。本票就是那一次。`040` 的測試已有字面清單 `DESIGN_PROJECTION`（`tests/approval-content-version-binding.test.mjs:35`），本票必須擴充它 | `045` 的 `## 觸發條件` 一節；讀檔 |

事實 7 的意義：`113年憲判字第9號` 目前沒有任何候選文章。它留在白名單內沒有害處，
但 `019` 的頁面實際上只會出現一個案件分組。

---

### 二、指紋怎麼處理：三個方案

| | A：不進指紋 | B：直接加進 13 欄清單 | **C：選填附加（選定）** |
|---|---|---|---|
| 核可後改立場 | **不觸發重新核可**。改完的立場直接上線 | 觸發 | 觸發 |
| 部署時既有核可 | 不受影響 | **Track 2 每一列都變成 `Needs review`**，因為每列的指紋輸入都多了兩個空值 | 不受影響。兩欄空白的列，指紋與現在逐位元組相同 |
| 公式重裝時的風險 | 無 | 新舊 Apps Script 的參數位置錯開。新程式配舊公式，會把序號當成 `case_ref` 讀 | 新欄參數排在序號之後。舊公式沒有這兩個參數，新程式把它們當空白，算出同一個值 |

**選 C。** A 違反 `040` 的核心保證：網站上的內容等於被核可的內容。
B 會讓 `050` 剛核可完的 Track 2 各列再核可一輪。C 兩個問題都沒有。

C 的規則：兩欄**有值才**加入指紋。加入位置在 `__sequence` 之前、13 欄之後，順序固定為 `case_ref`、`stance`。
版本字串維持 `approval-content-v1`，因為空白列的 payload 必須逐位元組不變。
Track 2 的資料列序號**只看原本 13 欄**，不看新欄。這樣 Node 的 `publishedRowSequences` 與 Apps Script 的
`PUBLISHED_ROW_SEQUENCE` 語意都不變。

C 的後果（刻意的）：責任編輯填入立場的那一列，指紋會變，狀態變成 `Needs review`，要重新核可一次。
立場是編輯判斷，被核可綁定是對的。

---

### 三、規格

#### 3.1 試算表兩欄（`Track 2_discussion`）

| 欄位 | 位置 | 標題輸入（逐字） | 資料驗證 | 保護範圍 |
|---|---|---|---|---|
| `case_ref` | V（附加在 `current_fingerprint` 右側） | `case_ref （判決字號，限下拉）` | 下拉清單，選項＝`VERIFIED_CASE_REFS` 的鍵，逐字相同；拒絕其他輸入 | 新增一個範圍 `V2:W`，允許名單與 `050` 的 B 類相同（責任編輯＋擁有者） |
| `stance` | W | `stance （立場，限下拉）` | 下拉清單，選項＝`支持`、`質疑`、`中立分析` | 同上 |

- 標題列的 C 類保護範圍從 `A1:U1` 擴為 `A1:W1`。
- 兩欄都附加在最右側。理由同 `050` 第三節「新欄要插在哪個位置」：兩支程式以標題解析欄位，附加不會錯位。
- 下拉清單是方便填寫，**不是檢查機制**。檢查機制是同步程式（3.3）。
- **兩欄要嘛都填，要嘛都空白。** 只填一欄，同步中止。
  `019` 第 3.1 節沒有定義「有字號、沒立場」的文章要放哪裡。本規則讓那種狀態不存在。

`stance` 三個值的定義沿用 `019` 第 3.1 節，一字不改：

| 值 | 定義 |
|---|---|
| `支持` | 認為憲法法庭在該案的作為正當 |
| `質疑` | 認為憲法法庭在該案的作為有疑義 |
| `中立分析` | 不表立場。描述、比較或制度分析 |

不得出現政黨名、陣營名或評價性用語（`_archive/015-opposing-views-integration.md:62`）。

#### 3.2 `VERIFIED_CASE_REFS` 放在共用模組（修改 `019` 第 3.2 節的位置）

新增 `src/data/verified-case-refs.mjs`，內容為 `019` 第 3.2 節的常數，形狀不變，加 `Object.freeze`：

```js
/**
 * 手寫資料模組。不是同步產物，可以改。
 * 已查證的判決字號。鍵為字號，值為案由、判決日期與一手來源。
 * 新增任何一筆，必須先開啟 source 網址核對案由與判決日期。
 * 同步程式（scripts/sync-content.mjs）與網頁（feature 019）共用這一份。
 */
export const VERIFIED_CASE_REFS = Object.freeze({ /* 兩筆，值見 019 第 3.2 節 */ });
```

為什麼是 `.mjs`：Node 直接執行的同步程式要能匯入，不能用 `.ts`。
`tsconfig.json` 已設 `allowJs: true`，網頁端可以匯入 `.mjs`。
`AGENTS.md` 的判準是「`.json` 不可手改」。本檔不是 `.json`，檔頭註明手寫。

#### 3.3 `scripts/sync-content.mjs`（以 `040` 版為基準）

| 位置（`040` 版，`a51b5d9`） | 改什麼 |
|---|---|
| 檔頭 import | 加 `import { VERIFIED_CASE_REFS } from '../src/data/verified-case-refs.mjs';` |
| `ALLOWED_VIBES` 之後（`:51` 附近） | 加 `const ALLOWED_STANCES = ['支持', '質疑', '中立分析'];`，附註解說明值域來源與「不是陣營」 |
| `TRACK_2_COLUMNS`（`:109`） | `full_content` 之後、`...APPROVAL_COLUMNS` 之前加兩筆：`{ field: 'case_ref', aliases: ['case_ref', 'case ref'], column: 'optional', value: 'optional' }` 與 `{ field: 'stance', aliases: ['stance'], column: 'optional', value: 'optional' }` |
| `buildTrack2` 已核可列迴圈（`:600-615`） | 加三條檢查，見下方 |
| `buildTrack2` projection（`:620-634`） | `full_content` 那一行之後加 `...(record.case_ref ? { case_ref: record.case_ref } : {})` 與同形的 `stance` |

三條檢查，錯誤訊息都要含該列 id（`rowKey`）與原值（`trunc`）：

```js
const hasCase = (record.case_ref || '') !== '';
const hasStance = (record.stance || '') !== '';
if (hasCase !== hasStance) → `case_ref 與 stance 必須同時填寫或同時空白。實際：case_ref「…」、stance「…」。`
if (hasCase && !Object.hasOwn(VERIFIED_CASE_REFS, record.case_ref)) → `case_ref「…」不在已查證的判決字號清單內。允許的值：…。`
if (hasStance && !ALLOWED_STANCES.includes(record.stance)) → `stance「…」不在允許清單內。允許的值：支持、質疑、中立分析。`
```

用 `Object.hasOwn`，不用 `in`。`in` 會讓 `toString` 之類的原型鍵通過。

檢查範圍與 `vibe` 相同：只檢查已核可的列。草稿列不檢查，理由見同檔 `checkRequiredValues` 的註解。

**語意改動**：`buildTrack2` 多三個中止條件。填錯一格，整份同步中止，不是只丟掉那一列。
這是不變式 #3。責任編輯必須知道這一點（第九節的 `實作後更新`）。

#### 3.4 `scripts/content-fingerprint.mjs`

- 新增並匯出 `OPTIONAL_PUBLISHED_FIELDS = { 'Track 2_discussion': ['case_ref', 'stance'] }`。
- `PUBLISHED_FIELDS` **不動**。`publishedRowSequences` 繼續只看它，序號語意不變。
- `fingerprintPayload`：Track 2 在 13 欄之後、`__sequence` 之前，依序附加**非空**的選填欄 `[field, normalizeText(value)]`。空白就不附加。

#### 3.5 `scripts/apps-script/approval-workflow.gs`

| 函式 | 改什麼 |
|---|---|
| 常數區 | 加 `OPTIONAL_APPROVAL_FIELDS = { 'Track 2_discussion': ['case_ref', 'stance'] }` |
| `approvalFingerprint_` | 多收一個 `optionalValues` 參數；非空者附加在 `__sequence` 之前，規則同 3.4 |
| `CONTENT_FINGERPRINT` | 參數排列改為：13 欄、序號、`case_ref`、`stance`。**新欄排在序號之後**。舊公式沒有後兩個參數時，視為空白 |
| `resolveApprovalHeaders_` | 選填欄另外解析，找不到不 throw，回傳時不含該鍵 |
| `installApprovalFormulas` | 若解析到選填欄，把兩格附加在序號參數之後 |
| `fingerprintForSheetRow_` | 若解析到選填欄，讀兩格並傳入 |

這樣三種中間狀態都是安全的：

| 狀態 | 公式算出的指紋 | 同步 |
|---|---|---|
| 新程式、舊公式、兩欄還沒建 | 與現在相同 | 通過 |
| 新程式、舊公式、兩欄已建但空白 | 與現在相同 | 通過 |
| 新程式、舊公式、有人填了立場 | 不含立場（公式沒讀那兩格） | Node 端含立場，**三份指紋不符，中止**。fail closed |

第三列就是「忘了重裝公式」。它會擋下來，不會放行。

#### 3.6 輸出形狀

兩欄都有值的記錄，在 `full_content`（或它不存在時的 `sticky`）之後多兩個鍵：

```
{ "id": …, …（現有鍵與順序不變）…, "sticky": …, ["full_content": …,] "case_ref": "<VERIFIED_CASE_REFS 的鍵>", "stance": "<支持｜質疑｜中立分析>" }
```

兩欄空白的記錄，輸出與現在逐位元組相同。

> 上面是形狀說明，不是資料。`<…>` 是欄位位置，不可照抄進試算表。
> 本票刻意不寫任何「某篇文章的立場是什麼」的範例（`AGENTS.md` 禁止事項第 3 項）。

---

### 四、誰填、何時填

| 誰 | 做什麼 | 何時 |
|---|---|---|
| **責任編輯**（`050` 步驟 6 B 類允許名單上的那一位） | 在 V、W 兩欄填值，然後以 `Review → 核可選取列` 重新核可那些列 | 第五節階段三。階段二驗證通過之後 |
| **captain** | 授權一次內容同步；在同步 PR 的 diff 逐列看 `case_ref`／`stance`，同意才合併 | 第五節階段四 |
| **工程** | 執行同步、開 PR、跑 AC-1 的量測指令並把輸出貼進 PR | 第五節階段四 |

**填欄規則（寫進編輯台文件，見第九節）：**

1. `case_ref` 只在文章的**主要論點**針對該判決審查的爭議時填。
   只是順帶提到、或拿來當比較對象時，兩欄都空白。
2. 判決作成前發表、但主要論點針對同一爭議的文章，可以填。網站卡片會顯示年份，讀者看得出時間先後。
3. `stance` 依作者在**該篇文中**明示的主張判斷。不依作者身分、發表媒體或作者的其他文章推斷。
4. 拿不定就兩欄都空白。空白的文章出現在 `019` 頁面的「未分類」區，不會消失。
5. **不為了讓 AC-1 通過而選值。** AC-1 量測的是「真實資料裡有沒有對立」。
   如果照實標完，同一案件只有一種立場，AC-1 就應該失敗。那是真實結果，要回報 captain，不是要修的錯誤。

**工程不提供任何一篇的建議值。** 立場是編輯判斷。由程式或 agent 推導立場，就是 `docs/health-check/TODO.md` P1-8 那一類「新撰無來源內容」。

**AC-1 能不能達成，design 無法事先保證。** 第一節事實 7 只說明候選文章集中在 `114年憲判字第1號`，
不說明它們的立場。達成與否取決於第 3 條規則下責任編輯的判斷。

工作量：最多 16 列 × 2 格，另加每個填了值的列重新核可一次。

---

### 五、施工順序與停擺窗口

| 階段 | 誰 | 做什麼 | 前置 | 同步狀態 |
|---|---|---|---|---|
| 零 | — | 等 `050` 完成 S9、`040` 合併進 main | — | `050` 的窗口，與本票無關 |
| 一 | 工程 | 在 `040` 合併後的 main 上實作 3.2–3.5 與測試，開 PR，captain 核可後合併 | 階段零 | 正常。欄位是選填，試算表沒有這兩欄也通過 |
| 二 | captain | (1) 在 V、W 建兩欄與下拉清單 (2) 加保護範圍 `V2:W`、擴大 `A1:W1` (3) 把新版 `approval-workflow.gs` 貼進 Apps Script (4) 在 `Track 2_discussion` 執行 `Review → 安裝／更新公式` (5) 確認 `Approved` 列數與步驟 (1) 之前相同 | 階段一合併 | 正常。兩欄空白，指紋不變（3.5 表第二列） |
| 三 | 責任編輯 | 依第四節填欄並重新核可 | 階段二第 (5) 項通過 | 正常。未重新核可的列狀態為 `Needs review`，同步只收 `Approved` |
| 四 | captain＋工程 | captain 授權同步 → 工程執行 → 開 PR → captain 看 diff → 合併 → 跑 AC-1 | 階段三 | — |

**停擺窗口為零**，條件是階段一在階段二之前。
階段二第 (1) 到第 (4) 項之間若有人填了立場，同步會中止（3.5 表第三列），不會放行錯的內容。

**第三階段有一個可見的變化**：填了值、還沒重新核可的列，不在網站上。
舊的已發布版本會在下次同步時消失，直到重新核可。所以階段三要一次做完再同步，不要分批同步。

**回退**（任何階段都可逆）：

1. 清空 V、W 兩欄的值 → 那些列的指紋回到原值。若原本的核可紀錄沒被覆寫，狀態回到 `Approved`；
   已重新核可過的列，要再核可一次。
2. 刪除 V、W 兩欄（不刪不影響同步，因為程式已認得）。
3. 若要回退程式：先完成 2，再 revert 階段一的 PR。**順序反過來，同步會中止**（第一節事實 3）。

---

### 六、與其他票的關係

| 票 | 關係 |
|---|---|
| `019` | 本票是它的硬前置。`019` 的 implement 在本票 AC-1 通過後才開始。本票修改了 `019` 的三處：白名單位置（3.2）、兩欄同填規則（3.1）、同步程式行號（3.3）。**`019` 的 body 由 FO 決定是否補述，本票不改** |
| `040` | 本票以 `040` 合併後的程式為基準，並擴充其指紋規格（方案 C）。不改 `040` 的分支 |
| `050` | 本票的階段二在 `050` 完成之後。本票不改 `050` 的 runbook。保護範圍由 12 個變 13 個（Track 2 多 `V2:W`），`A1:U1` 擴為 `A1:W1` |
| `045` | 本票觸發 `045` 的條件。本票對自己新增的兩欄做到 `045` 要求的雙邊反向測試（AC-9）。既有 13 欄仍由 `045` 負責 |

---

### 七、驗收條件

每條附 `Verified by:` 與「會讓它失敗的改動」。

**AC-1（端值，交付定義）真實資料裡有一個案件分組，含 ≥2 篇、≥2 種立場**

同步 PR 合併後，`src/data/discussions.json` 至少有一個 `case_ref`，其記錄 ≥2 筆，且 `stance` 至少兩種。
這是 `019` AC-1 的前提。

`Verified by:` 在 repo 根目錄執行：

```
node -e "const d=require('./src/data/discussions.json');const g={};for(const r of d)if(r.case_ref&&r.stance)(g[r.case_ref]??=[]).push(r.stance);const ok=Object.entries(g).filter(([k,s])=>s.length>=2&&new Set(s).size>=2);console.log(ok.length?ok.map(([k,s])=>k+' '+s.length+'筆/'+new Set(s).size+'種').join('; '):'NONE');process.exit(ok.length?0:1)"
```

通過＝退出碼 0，且印出至少一組。**2026-09-29 實跑：`NONE`，退出碼 1。** 這是正確的現況。
**會讓它失敗的改動**：試算表把同一 `case_ref` 的所有 `stance` 設成同一值。
依第四節規則 5，這個失敗若來自真實判斷，就如實回報 captain。

**AC-2 試算表沒有這兩欄時，同步輸出不變**

`Verified by:` (a) 測試以 `040` 現有 fixture（無新欄）呼叫 `buildTrack2`，斷言 `Object.keys` 等於現行 13 鍵順序；
(b) 階段一合併後、階段二之前，以 `CONTENT_OUTPUT_DIR` 指向兩個暫存目錄，
對同一時間的正式表各跑一次不落地同步：一次用階段一合併前的程式，一次用合併後的程式。兩份 `discussions.json` 的 sha256 相同。
**會讓它失敗的改動**：把任一新欄設成 `column: 'required'`。

**AC-3 實際的標題字串兩支程式都認得**

`Verified by:` 測試以 3.1 表的兩個標題字串（含全形括號）組成 fixture CSV 餵 Node 的 `buildTrack2`（`buildColumnMap` 未匯出），
並以同一組標題呼叫 `vm` 載入的 `resolveApprovalHeaders_`，斷言分別解析成 `case_ref`、`stance`，且沒有其他欄位被改變解析結果。
**會讓它失敗的改動**：alias 打成 `caseref`，或把 `（` 從 `HEADER_SEPARATORS` 移除。

**AC-4 白名單以外的 `case_ref` 讓同步中止**（承接 `019` 的 AC-5）

`Verified by:` 餵 `case_ref: '114年憲判字第9號'`，斷言 `buildTrack2` 回傳 `null`，錯誤含該列 id 與該值；
再餵 `toString`，同樣中止；再餵兩個合法值各一次，斷言回傳非 `null`。
**會讓它失敗的改動**：把檢查改成只 `console.warn`；或把 `Object.hasOwn` 換成 `in`（`toString` 那一案會失敗）。

**AC-5 允許清單以外的 `stance` 讓同步中止**

`Verified by:` 餵 `stance: '進步派'` 與 `stance: '贊成'`，斷言中止；三個合法值各一次，斷言通過。
**會讓它失敗的改動**：刪掉 `ALLOWED_STANCES` 檢查。

**AC-6 只填一欄讓同步中止**

`Verified by:` 餵「有 `case_ref`、無 `stance`」與「無 `case_ref`、有 `stance`」各一列，斷言都中止且訊息指名兩欄。
**會讓它失敗的改動**：刪掉同填檢查。

**AC-7 空白不改指紋、有值就改指紋、Node 與 Apps Script 一致**

`Verified by:` 測試斷言：
(a) 兩欄空白時，`fingerprintPublishedRow` 等於改動前的值（以 `040` 測試現有的固定期望值比對）；
(b) 填 `stance` 後指紋改變；先核可再填 `stance` 的列，`buildTrack2` 中止並報「與目前發布內容不符」；
(c) 同一筆資料，Node 與 `vm` 載入的 `approvalFingerprint_` 算出相同值，含空白與有值兩種；
(d) `CONTENT_FINGERPRINT` 只給 13 欄＋序號（舊公式）時，結果與 (a) 相同。
**會讓它失敗的改動**：兩欄不進 payload（(b) 失敗）；兩欄無條件進 payload（(a) 失敗）；
新欄參數排在序號之前（(d) 失敗）。

**AC-8 新鍵排在既有鍵之後**

`Verified by:` 兩欄都有值時，`Object.keys` 等於現行 13 鍵加 `case_ref`、`stance`；兩欄空白時等於現行 13 鍵。
**會讓它失敗的改動**：把兩行展開寫在 `full_content` 之前。

**AC-9 雙邊一起刪掉新欄，測試會失敗**（`045` 的條件，限本票兩欄）

`Verified by:` 在 `DESIGN_PROJECTION` 加字面清單 `track2Optional: ['case_ref', 'stance']`，並斷言
`OPTIONAL_PUBLISHED_FIELDS` 與 Apps Script 的 `OPTIONAL_APPROVAL_FIELDS` 都等於它。
implement 時實際做一次反向改動：同時從兩端刪掉 `stance`，記錄 `node --test` 的失敗輸出，再還原。
**會讓它失敗的改動**：把字面清單改成從 `OPTIONAL_PUBLISHED_FIELDS` 匯入。

**AC-10 白名單與一手來源相符**（承接 `019` 的 AC-6）

`Verified by:` 對 `VERIFIED_CASE_REFS` 每筆的 `source` 實跑 `curl`，比對 `憲判字第N號【案由】` 與 `判決日期`。
指令見第十節。
**會讓它失敗的改動**：把 `113年憲判字第9號` 的 `caseName` 改成「憲法訴訟法修正案」。

**AC-11 投稿者改不到兩欄，責任編輯改得到**

`Verified by:` 階段二完成後，captain 比照 `050` S7-b／S7-d 的方法測四格：
投稿者帳號改 V2、W2 → 被擋；責任編輯帳號改 V2、W2 → 可改，改完 Ctrl+Z 還原。記錄四格結果。
**會讓它失敗的改動**：`V2:W` 的保護範圍選「只有你」（責任編輯會被擋），或不設範圍（投稿者可改）。

**AC-12 階段二不改變任何既有核可**

`Verified by:` 階段二第 (1) 項前後，captain 各數一次 `Track 2_discussion` 的 `status = Approved` 列數，兩數相同；
工程在第 (1) 項之前與第 (4) 項之後各跑一次不落地同步，兩次退出碼皆 0，兩份 `discussions.json` 的 sha256 相同。
兩次之間若有其他內容被核可，本條作廢重做。
**會讓它失敗的改動**：採用方案 B（第二節）。

**AC-13 建置**

`Verified by:` `node --test` 全過；`npx tsc --noEmit` 零錯誤；`npm run build` 成功。
**不跑 `npm run sync-content`**，除非是在階段四、captain 明確授權。
**會讓它失敗的改動**：`src/data/verified-case-refs.mjs` 的匯出名稱與 `sync-content.mjs` 的 import 不一致。

---

### 八、預期改動檔案與行數（含容許範圍）

| 檔案 | 動作 | 預估行數 | 容許範圍 |
|---|---|---|---|
| `src/data/verified-case-refs.mjs` | 新增 | 25 | ±10 |
| `scripts/sync-content.mjs` | 改：import、`ALLOWED_STANCES`、2 欄定義、3 條檢查、2 個 projection 鍵 | +30 | ±12 |
| `scripts/content-fingerprint.mjs` | 改：`OPTIONAL_PUBLISHED_FIELDS` 與 payload 附加 | +12 | ±6 |
| `scripts/apps-script/approval-workflow.gs` | 改：3.5 表六處 | +30 | ±12 |
| `tests/track2-case-ref-stance.test.mjs` | 新增（AC-2 至 AC-10） | 180 | ±60 |
| `tests/approval-content-version-binding.test.mjs` | 改：`DESIGN_PROJECTION` 加 `track2Optional` | +3 | ±2 |

`src/data/*.json` 在階段一**不得有任何改動**。它只在階段四由同步產生。

---

### 九、文件影響

#### 現在更新

| 文件 | 更新內容 | 狀態與驗證目標 |
|---|---|---|
| `docs/constitution-features/064-track2-case-ref-stance-columns.md` | 本節 | 已定方向，**尚未實作**。驗證目標：第七節 13 條 AC 皆有可失敗的檢查；`grep -c case_ref scripts/sync-content.mjs` 在 main 上仍為 `0` |
| `docs/content-pipeline/design.md` | 第七節的 `📌` 提案記錄下方追加一則補述；文末修訂紀錄追加一則。內容：captain 已於 2026-09-23 核准加欄；施工單改為 `064`；**尚未實作**，試算表與同步程式都未改；與 `040` 指紋的關係。**不改寫** 2026-09-21 那則的原文 | 已定方向、尚未實作。驗證目標：補述含「尚未實作」；2026-09-21 那兩段原文逐字不變（`git diff` 只有新增行） |

#### 實作後更新

| 文件 | 更新內容 | 時點 |
|---|---|---|
| `docs/content-pipeline/design.md` | 第二節 `Track 2_discussion` 欄位表加兩欄；「發布欄位範圍」表加選填欄；第五節施工順序加本票兩項並填真實狀態 | 「發布欄位範圍」表與階段一**同一個 PR**（`DESIGN_PROJECTION` 的註解要求先改 `design.md`）；第二節與第五節在階段二完成後寫 |
| `docs/content-pipeline/operations.md`（`040` 合併後才在 main） | 階段二的操作步驟：建欄、下拉、保護範圍、重裝公式、核對 `Approved` 列數 | 階段一合併時 |
| `docs/content-pipeline/data-collection-guide.md` | 第四節的五條填欄規則，以及「填錯會讓整次同步中止」。該檔 T1／T2 章節檔頭標示過時，改之前先確認段落不在過時範圍 | 階段二完成時 |
| `docs/INDEX.md` | 新增 `src/data/verified-case-refs.mjs` 不需列（不是文件）。上列文件的「最後查核」日期同步更新 | 同上 |

#### 不更新

| 文件 | 為什麼 |
|---|---|
| `AGENTS.md` | 「`.json` 不可手改」的判準不變。新檔是 `.mjs`，檔頭自帶說明 |
| `docs/constitution-features/019-opposing-views-overview-page.md` | 別票的 body。本票對它的三處修改列在第六節，由 FO 決定是否寫補述 |
| `docs/constitution-features/040-*.md`、`050-*.md`、`045-*.md` | 別票的 body。關係寫在第六節 |
| `docs/constitution-features/_archive/015-opposing-views-integration.md` | `record`，不改寫 |
| `docs/project/design-system.md` | 本票沒有介面 |

---

### 十、風險證據（spike 已執行，未接觸正式試算表）

**spike：`040` 版程式 × 新標題 × 方案 C 原型。** 腳本放在 session scratchpad，不入 repo。
唯讀匯入 `040` worktree 的 `buildTrack2` 與 `content-fingerprint.mjs`，餵本機 fixture。

```
A base headers        -> ok keys=10 []
B +2 unknown headers  -> null [第 22 欄的標題「case_ref」對不到任何預期欄位…, 第 23 欄的標題「stance」…]
C blank optional equal to v1 -> true
C filled stance differs      -> true
```

- A、B 證明第一節事實 3：試算表先加欄會讓同步中止，所以程式必須先合併。
- C 證明方案 C 的核心性質：空白時 payload 與 v1 逐位元組相同，有值時指紋改變。
  C 用的是原型函式，不是 repo 程式。正式實作由 AC-7 再驗一次。

**一手來源重驗（2026-09-29）**：

```
curl -s "https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=352966" | sed 's/<[^>]*>/ /g' | tr -s ' \n' ' ' | grep -oE '判決日期 +[0-9]+年[0-9]+月[0-9]+日|憲判字第[0-9]+號【[^】]+】'
# → 憲判字第9號【立法院職權行使法等案】／判決日期 113年10月25日
# 355485 → 憲判字第1號【憲法訴訟法修正案】／判決日期 114年12月19日
```

**事實 7 的指令**：

```
node -e "const d=require('./src/data/discussions.json');const t=r=>[r.title,r.abstract,r.full_content||''].join(' ');const q=re=>d.filter(r=>re.test(t(r))).map(r=>r.id).join(',');console.log(q(/114\s*年?\s*憲判字?第?\s*1\s*號|114憲判1/),'|',q(/113\s*年?\s*憲判字?第?\s*9\s*號|113憲判9|職權行使法/))"
# → d1,d6 | （空）
```

**剩下的風險不是技術風險**：AC-1 取決於編輯判斷（第四節）。design 無法以 spike 消除它，只能把它寫明。

---

### 十一、gate 需要 captain 的一個決定

**建議先講：由責任編輯填。**

**誰來判斷每篇文章的立場？**

- **責任編輯填，captain 在同步 PR 看 diff（建議）** —— 與現行核可分工一致。captain 看得到每一個值，不同意就不合併。可隨時改。
- captain 自己填 —— 判斷集中在一個人。責任編輯仍要重新核可那些列，因為核可權在 B 類。可隨時改。

兩個選項都可逆。填錯的值清空即可（第五節回退第 1 項）。

## Stage Report: design

- DONE: Specify the case_ref and stance flat optional columns on Track 2_discussion and the exact sync-content.mjs changes, matching the shape and delivery conditions 019's design section 三 defines for 064 (019 is waiting on this ticket).
  `## Design` 第三節：欄位位置 V／W、逐字標題、下拉、保護範圍；`sync-content.mjs` 以 `040` 版（`a51b5d9`）行號寫出 import、`ALLOWED_STANCES`、2 欄定義、3 條檢查、2 個 projection 鍵。沿用 019 的形狀與值域，並明列三處修改：白名單移到共用模組 `src/data/verified-case-refs.mjs`、兩欄同填規則、程式基準改為 `040`。
- DONE: Acceptance criteria each carry a falsifiable Verified by, and at least one measures the end value 019 needs: real approved discussion data can yield at least one case group with 2+ distinct stances (019 AC-1's precondition) — name who fills the columns and when.
  第七節 13 條 AC，各附「會讓它失敗的改動」。AC-1 為端值：對 `discussions.json` 的一行指令，今天實跑輸出 `NONE`／exit 1。第四節指名責任編輯在階段三填、captain 在階段四看 diff，並寫明不得為了通過 AC-1 選值。
- DONE: Split documentation impact into 現在更新 / 實作後更新 / 不更新, each listing documents or 無; any 現在更新 entry states direction, not-yet-implemented status, and verification target.
  第九節。`現在更新` 兩筆已寫入：本票，以及 `docs/content-pipeline/design.md` 的一則補述與一則修訂紀錄（`git diff` 只有新增行，`grep -c case_ref scripts/sync-content.mjs` → `0`）。

### Summary

019 寫 design 時 `040` 尚未部署。本票查出三件它沒處理的事，並各給出處置。第一，程式要以 `040` 合併後的版本為基準。第二，兩欄必須進入內容指紋，否則核可後改立場不會觸發重新核可；選定「有值才計入」，spike 證明空白列的指紋逐位元組不變，所以 `050` 的核可不必重做。第三，網頁不能匯入同步程式，白名單改放共用模組。spike 也證明試算表先加欄會讓同步中止，因此施工順序定為「程式先合併、試算表後加欄」，停擺窗口為零。

AC-1 能否達成取決於編輯判斷，design 無法保證：16 篇中沒有任何一篇提到 113 年憲判字第 9 號，候選文章集中在 114 年憲判字第 1 號。gate 只有一項 captain 決定：由誰判斷立場（建議由責任編輯判斷，captain 看 diff）。

## 實作記錄（implement，2026-09-29）

以 main `8779ca9`（`040` 已合併）為基準。程式 commit `b1a298d`，文件 commit `6da1442`。

### 反向改動（每項改完跑 `node --test` 兩個測試檔，再還原）

| AC | 改動 | 結果 |
|---|---|---|
| AC-2 | `case_ref` 改 `column: 'required'` | 20 項失敗，含 AC-2 兩項與 040 的 Track 2 全部同步測試 |
| AC-3 | alias 改 `caseref` | 9 項失敗，含 AC-3 |
| AC-3 | Node 的 `HEADER_SEPARATORS` 刪 `（` | **0 項失敗**。見下方說明 |
| AC-3 | Node／Apps Script 的 `HEADER_SEPARATORS` 刪半形空白 | 各 9 項／3 項失敗，含 AC-3 |
| AC-4 | 白名單檢查改 `console.warn`；`Object.hasOwn` 改 `in` | 各 1 項失敗（AC-4；`in` 那次是 `toString` 案） |
| AC-5 | 刪 `ALLOWED_STANCES` 檢查 | 1 項失敗（AC-5） |
| AC-6 | 刪同填檢查 | 1 項失敗（AC-6） |
| AC-7 | Node 選填欄不進 payload／無條件進 payload | 各 5 項失敗，含 (b)／(a) |
| AC-7 | Apps Script 新參數排在序號之前 | 4 項失敗，含 (c)(d) 與 040 的兩端一致測試 |
| AC-7 | `fingerprintForSheetRow_` 不讀新欄；安裝公式不附加新欄；序號計入新欄 | 各 1 項失敗 |
| AC-8 | 兩個展開寫在 `full_content` 之前 | 1 項失敗（AC-8） |
| AC-9 | 兩端同時刪 `stance` | 4 項失敗，含釘住測試：`actual: ['case_ref'] expected: ['case_ref', 'stance']` |
| AC-9 | 兩端同時刪 `case_ref` | 5 項失敗，含釘住測試：`actual: ['stance'] expected: ['case_ref', 'stance']` |
| AC-9 | 兩端同時刪 `stance`，且字面清單改從 `OPTIONAL_PUBLISHED_FIELDS` 匯入 | 釘住測試**不再失敗**（其他 3 項仍失敗）。證明字面清單是必要的 |
| AC-13 | 白名單匯出名改 `VERIFIED_CASE_REF` | 47 項失敗，`SyntaxError: ... does not provide an export named 'VERIFIED_CASE_REFS'` |

**AC-3 的反向改動寫錯了一半。** design 寫「把 `（` 從 `HEADER_SEPARATORS` 移除」會失敗。
實測不會失敗：3.1 表的標題在 `case_ref` 與 `（` 之間有一個半形空白，解析靠的是空白。
所以改用「刪半形空白」當反向改動，兩端都會失敗。程式與測試不需改。

**測試擋不住的情況（沿用 `045` 的結論）**：同一個改動若同時改掉所有地方，測試會全數通過。所有地方是指 `design.md` 的〈發布欄位範圍〉表、`DESIGN_PROJECTION.track2Optional`、兩支程式，以及 `tests/track2-case-ref-stance.test.mjs` 內的欄名字面值。
這種改動只能靠 PR 審查擋下。審查時看 diff 有沒有動到〈發布欄位範圍〉表。
兩欄沒有併入 `DESIGN_PROJECTION.track2`。原因是「有值才計入」：放進去，字面清單比對與同步測試都會失敗（`045` design，`8fe7235`）。

### 指紋等值（050 的核可不必重做）

- 以 `src/data/discussions.json` 15 篇（不含 `tldr`）當 Track 2 列，改動前後各算一次 Node 與 Apps Script 指紋：30 個值逐字相同，且每列兩端相同。
- 040 版 `installApprovalFormulas` 與新版對同一個 21 欄分頁寫出的公式逐字相同。測試已釘住第 2 列的字面公式。

### 不落地同步（AC-2 (b) 的程式部分）

`2026-09-29T20:06:09Z`，`CONTENT_OUTPUT_DIR` 指向兩個暫存目錄，對正式表各跑一次：
main 版程式 exit 0，本分支程式 exit 0。第一次就成功，沒有遇到「載入中…」快照。
兩份輸出與 `src/data/` 的 sha256 相同：`discussions.json` `4071978a…3162`、`history.json` `4d1992e3…ea3b`。
跑完 `src/data/*.json` 的 sha256 不變。沒有執行 `npm run sync-content`，沒有碰試算表。

### AC-10 一手來源（2026-09-29 實跑）

```bash
while IFS=$'\t' read -r key name date src; do
  page=$(curl -s "$src" | sed 's/<[^>]*>/ /g' | tr -s ' \r\n\t' ' ')
  echo "$key｜$name｜$date → $(echo "$page" | grep -oE '憲判字第[0-9]+號【[^】]+】' | head -1)／$(echo "$page" | grep -oE '判決日期 +[0-9]+年[0-9]+月[0-9]+日' | head -1)"
done < <(node --input-type=module -e "import {VERIFIED_CASE_REFS as V} from './src/data/verified-case-refs.mjs'; for (const [k,v] of Object.entries(V)) console.log([k,v.caseName,v.date,v.source].join('\t'))")
# 113年憲判字第9號｜立法院職權行使法等案｜113-10-25 → 憲判字第9號【立法院職權行使法等案】／判決日期 113年10月25日
# 114年憲判字第1號｜憲法訴訟法修正案｜114-12-19 → 憲判字第1號【憲法訴訟法修正案】／判決日期 114年12月19日
```

第十節的指令只用 `tr -s ' \n'`。頁面含 `\r`，判決日期那一段抓不到。上面加了 `\r\t`。
把 `113年憲判字第9號` 的 `caseName` 改成「憲法訴訟法修正案」後，比對顯示不符。

### 留到後續階段的 AC（implement 無法證明）

| AC | 階段 | 屆時執行的檢查 |
|---|---|---|
| AC-1 | 四 | 同步 PR 合併後，在 repo 根目錄跑第七節 AC-1 的 `node -e` 指令。退出碼 0 且印出至少一組 |
| AC-2 (b) | 一合併後、二之前 | 同一時間以合併前與合併後的程式各跑一次下方的「不落地同步指令」，兩次都要印出 sha256，且兩個 `discussions.json` 的值相同。本次已用分支程式先跑一次，結果相同 |
| AC-11 | 二 | captain 比照 `050` S7-b／S7-d：投稿者帳號改 V2、W2 → 被擋；責任編輯帳號改 V2、W2 → 可改，Ctrl+Z 還原。記錄四格 |
| AC-12 | 二 | captain 在 `operations.md`〈Track 2 加兩欄〉第 1 步與第 9 步各數一次 `Approved` 列數，兩數相同；工程在第 2 步之前與第 8 步之後各跑一次下方的「不落地同步指令」，兩次都要印出 sha256，且兩個 `discussions.json` 的值相同 |

**不落地同步指令**（取自 verify 報告 F1）。在主 repo 根目錄執行，該處有 `.env.local`：

```bash
OUT=$(mktemp -d); OUT=$(cd "$OUT" && pwd -P); REPO=$(pwd -P); CONTENT_OUTPUT_DIR="$OUT" node --env-file=.env.local "$REPO/scripts/sync-content.mjs"; test -s "$OUT/discussions.json" && shasum -a 256 "$OUT"/*.json
```

- **失敗條件**：`test -s` 不成立，也就是沒有印出 sha256。這時比對結果作廢，不可視為相同。
  路徑經 `pwd -P` 解析，避開 ticket `070` 記錄的陷阱：從符號連結路徑執行時，程式 exit 0，但不寫檔，也不輸出訊息。
- 遇到暫態快照就重跑。暫態快照是指錯誤訊息含「載入中…」或 `status` 為 `#NAME?`。
  2026-09-29T20:21:12Z 實跑時遇過一次 `#NAME?`：43 列全數失敗，沒有印出 sha256。7 秒後重跑即通過。
- AC-2 (b) 的「合併前程式」：先執行 `git worktree add --detach /tmp/pre-064 <064 合併 commit>^1`。
  再把上面指令的 `REPO=$(pwd -P)` 改成 `REPO=$(cd /tmp/pre-064 && pwd -P)`，仍在主 repo 根目錄執行。
  `.env.local` 不複製到其他目錄。
- 2026-09-29T20:21:12Z–20:21:19Z 實跑：`REPO` 指向 main 與本分支，各印出 `discussions.json` `4071978a…3162`、`history.json` `4d1992e3…ea3b`，與 `src/data` 相同。
  跑完 `src/data` 無改動。

### 誰填 stance

captain 2026-09-29 決定：責任編輯填 `case_ref`／`stance`，captain 在同步 PR 看 diff。
已寫進 `design.md` 修訂紀錄與 `operations.md`〈Track 2 加兩欄〉。工程不提供任何一篇的建議值。

### 與 design 的差異

- 測試行數超出第八節容許範圍：`tests/track2-case-ref-stance.test.mjs` 293 行（容許 120–240），`tests/approval-content-version-binding.test.mjs` +23 行（容許 +1–+5）。
  多出的部分是 Apps Script 假分頁測試（公式安裝、核可前重算）與 AC-9 的兩端逐欄檢查。三個反向改動只有這些測試抓得到。
- `docs/INDEX.md` 的「最後查核」未更新。本次只查核了新增段落，沒有逐段查核整份 `design.md` 與 `operations.md`。例如 `operations.md` 檔頭仍寫「正式 SSOT 尚未部署」，那不在本票範圍。
- `data-collection-guide.md` 依第九節在階段二完成時更新，本次未改。

## Stage Report: implement

- DONE: Implement design §三 3.2–3.5 on current main (040 merged, 050 deployed): the case_ref/stance flat optional columns in sync-content.mjs and approval-workflow.gs, the shared src/data/verified-case-refs.mjs whitelist, the both-or-neither rule, and the "count only when filled" fingerprint extension — with blank rows' fingerprints byte-identical to today (050's approvals must not need redoing). Also create design.md's missing 「發布欄位範圍」 table that 045 found the tests cite (now including the two new columns).
  `b1a298d`（程式＋測試）、`6da1442`（`design.md` 第二節新增〈發布欄位範圍〉，含選填列；`operations.md` 加階段二步驟）。15 篇真實資料列的 Node／Apps Script 指紋改動前後 30 值逐字相同，公式字串也相同。
- DONE: Prove the 13 ACs each with their stated failing change, especially the fingerprint parity (blank-row fingerprints unchanged, filled-row changes trigger Needs review in both Node and Apps Script) and AC-9's pinning of the two new columns; run the no-write sync (CONTENT_OUTPUT_DIR temp, retry past transient 載入中… snapshots) to show today's output stays byte-identical to src/data.
  見〈實作記錄〉反向改動表。每條測試過的 AC 都會被它的反向改動打紅。AC-3 的「刪 `（`」測不出來，因為標題裡有半形空白；改用「刪空白」，兩端都會紅。AC-9：兩端同時刪 `case_ref`，或同時刪 `stance`，釘住測試都會失敗。同時改掉所有地方時測試擋不住，只能靠 PR 審查，見〈實作記錄〉；清單改成匯入後，那個測試就不會紅。AC-10 以 curl 對照兩筆來源，結果相符。改動 caseName 後比對顯示不符。不落地同步第一次就 exit 0，兩份輸出的 sha256 都與 `src/data` 相同，沒有遇到「載入中…」。AC-1、AC-11、AC-12 及 AC-2 (b) 的合併前後比對留待後續階段，各自的檢查指令已寫在表內。
- DONE: No regressions: full test suite 0 fail and tsc pass; never run npm run sync-content, never edit the live spreadsheet (adding the columns is the captain's stage 2); record that stance values are to be filled by the 責任編輯 with captain reviewing the sync PR diff (captain decision 2026-09-29).
  `node --test`：118 tests，116 pass，1 fail，1 skipped。唯一的 fail 是 `threshold-analysis.test.mjs:1549` 的 AC-7 寫檔掃描。它在改動前的 main 上就失敗（101/99/1）。原因是 040 的測試檔被列為寫出產線檔的程式，不是本票造成，已回報 team-lead。修正在 068 分支 `84962bb`，截至本報告尚未併入 main（main `381ff04`），所以本分支沒有合併 main。本票新增 0 個失敗。`npx tsc --noEmit` exit 0；`npm run build` exit 0，建置前後 `src/data/*.json` 的 sha256 相同。沒有跑 sync-content，也沒有碰試算表。captain 的決定已寫進 `design.md` 修訂紀錄與 `operations.md`。

### Summary

兩欄照 design 3.2–3.5 實作。兩欄空白時指紋不變：050 的核可不必重做，舊公式配新程式算出同值。有人填值而公式未更新時，同步中止。design.md 補上 045 查出缺少的〈發布欄位範圍〉表。偏離 design 的有三處。第一，AC-3 的反向改動改用「刪半形空白」。第二，測試行數超出容許範圍，多出的是 Apps Script 假分頁測試，有三個反向改動只有它們抓得到。第三，INDEX 最後查核日未更新。另有一個 main 既有的測試失敗，待 FO 決定由誰修。

- DONE: FO-authorized fix from verify (F1) — give the deferred AC-2 (b) and AC-12 checks an exact, ready-to-paste command (verify's `pwd -P` command; fails if `discussions.json` isn't written).
  〈留到後續階段的 AC〉表兩列改為引用新增的「不落地同步指令」區塊。區塊內逐字放入 verify 的指令、失敗條件，以及 AC-2 (b) 合併前程式的 `git worktree` 做法。`operations.md`〈Track 2 加兩欄〉第 9 步後也加了同一指令。實跑時第一次遇到 `#NAME?` 暫態快照，指令沒印出 sha256，失敗有被抓到。重跑後 main 與本分支都印出與 `src/data` 相同的 sha256。F2 依 FO 決定維持延後風險，不改。
- DONE: FO-authorized fix from verify (F3) — correct 「前三列抄自 040」 to four rows in the design.md 發布欄位範圍 note.
  改為「第 1、2、4、5 列（共四列）」。修訂紀錄的同一說法一併改正。以 `diff` 比對這四列與 `_archive/040-…md` 的表，逐字相同。只改文件，程式未改。

## Stage Report: verify

- DONE: Verify every factual value the branch ships against primary sources: each case_ref in src/data/verified-case-refs.mjs (ruling number, case name, decision date) against 憲法法庭 judgment pages, and the stance value list against design §三; run the placeholder scan over every new file and added line.
  2026-09-29 以 `curl` 讀 `cons.judicial.gov.tw` 兩頁。`id=352966`：判決字號 `113年憲判字第9號【立法院職權行使法等案】`，判決日期 113年10月25日，案號 113年度憲立字第1號。`id=355485`：`114年憲判字第1號【憲法訴訟法修正案】`，114年12月19日，案號 114年度憲立字第1號。檔內鍵、`caseName`、`date`、`source` 四項逐字相符。`ALLOWED_STANCES` 與本票 3.1、`019` 第 3.1 節（`019-…md:107,116-118`）逐字相同，無政黨名、陣營名。佔位掃描涵蓋全部新增行與 `verified-case-refs.mjs`：無 `某學者`／`某大學法律系`／`lorem ipsum`／`快速了解…`。`test` 命中全在測試檔（`node:test`、`test(`、`RegExp.test`、`example.test` fixture 網址），沒有進入發布檔。`src/data/*.json` 對 main 無 diff。
- DONE: Independently re-run the fingerprint parity claim (blank-row Node and Apps Script fingerprints byte-identical before/after for all 15 discussions + tldr, so 050's approvals stand), AC-4..AC-9 each under its failing change, and one no-write sync (CONTENT_OUTPUT_DIR temp; retry past 載入中… snapshots) proving output byte-identical to src/data.
  指紋：base `8779ca9` 對分支，`discussions.json` 16 筆當 Track 2 列比 6 種算法（Node 舊／新／新＋空欄、GS 舊、GS 新＋舊公式、GS 新＋空欄）。另把 tldr 還原成 4 列 `site_tldr` 比 4 種算法。20 列 0 不符。反向改動（在拋棄式 worktree 改完即還原）：AC-4 `warn`／`in` 各 1 項失敗；AC-5 1 項；AC-6 1 項；AC-7 Node 不附加／無條件附加各 5 項，GS 參數排序號前 4 項，`fingerprintForSheetRow_` 不讀新欄 1 項，安裝公式不附加 1 項，Node 序號計入新欄 1 項；AC-8 1 項；AC-9 刪 `stance` 4 項，刪 `case_ref` 5 項，刪 `stance`＋清單改匯入 3 項（釘住測試不再紅）；AC-2 `required` 20 項；AC-3 `caseref` 9 項；AC-13 47 項。全部與 implement 的表一致。不落地同步：`2026-09-29T20:16:11Z`，路徑經 `pwd -P`，分支與 base 同時各跑一次。第一次就兩者 exit 0 且各寫出 2 檔。四份輸出與 `src/data` 的 sha256 都相同（`discussions.json` `4071978a…3162`、`history.json` `4d1992e3…ea3b`）。前後 `src/data/*.json` 不變。
- DONE: Judge implement's deviations (AC-3 failing-change substitution, test LOC over tolerance, INDEX last-checked not updated) and confirm the deferred ACs (AC-1, AC-2(b), AC-11, AC-12) each carry an exact runnable check for their stage; the one failing test (threshold-analysis AC-7 (4)) must be the pre-existing one fixed on 068's branch, not new; confirm no sync-content run and no spreadsheet edit.
  AC-3：重現刪 `（` 0 項失敗、刪空白 Node 9 項／GS 3 項。替代合理，因為 `operations.md` 第 2 步要求逐字輸入含空白的標題。行數超標：接受。GS 安裝公式與 `fingerprintForSheetRow_` 的反向改動只有多出的假分頁測試抓得到（已重現）。行數是 design 訂的容許值，放寬要 captain 在 gate 認可。INDEX：不算偏離。第九節把 INDEX 日期與 `data-collection-guide.md` 同列在「階段二完成時」。延後 AC：AC-1 有逐字 `node -e` 指令；AC-11 有四格手動程序；AC-2 (b) 與 AC-12 只有程序描述，**沒有逐字指令**，見 F1。唯一失敗：`threshold-analysis.test.mjs:1549`。base `8779ca9` 同樣失敗（101/99/1）。分支套上 068 分支（`threshold-page-voided-quorum-current`）的 `84962bb` 後為 118/117/0，失敗 0。不是本票造成。沒有跑 sync-content：`src/data` 對 main 無 diff，main 自 09-28 起無 `src/data/*.json` commit。沒有動試算表：正式表 `Track 2_discussion` 標題唯讀讀回為 21 欄（A=id … U=current_fingerprint），沒有 `case_ref`／`stance`。`npx tsc --noEmit` exit 0；`npm run build` exit 0，前後 sha256 相同。

驗證範圍：分支 HEAD `1007a50`（含 implement 補記的兩端刪除實驗）。反向改動的拋棄式 worktree 即由此 HEAD 建立；兩端刪 `case_ref`（5 項失敗）與兩端刪 `stance`（4 項失敗）兩項都已親自重跑，結果與 `1007a50` 的記錄相同。

### Findings

- **F1（延後風險，建議本票修）** AC-2 (b) 與 AC-12 延後到階段一／二，但延後表沒有逐字的不落地同步指令，也沒寫「必須寫出兩檔」。已重現 ticket 070 的陷阱：從 `/tmp/…` 符號連結路徑執行 `sync-content.mjs`，exit 0，沒有輸出，也沒有訊息。延後表的條件是「exit 0 且 sha256 相同」。操作者比對不存在的檔案時，這條件寫法不夠明確。建議在延後表補上下列指令，只改文件：
  `OUT=$(mktemp -d); OUT=$(cd "$OUT" && pwd -P); REPO=$(pwd -P); CONTENT_OUTPUT_DIR="$OUT" node --env-file=.env.local "$REPO/scripts/sync-content.mjs"; test -s "$OUT/discussions.json" && shasum -a 256 "$OUT"/*.json`
  失敗條件：`test -s` 不成立。
- **F2（測試缺口，非阻擋）** 把 GS `fingerprintForSheetRow_` 的序號迴圈改成計入選填欄，0 項測試失敗。實害受限：`approval-workflow.gs:247` 會比對公式值並 throw，核可會被拒，不會放行（fail closed）。觸發條件是某列只填 `case_ref`／`stance`，且位在已核可列之上。
- **F3（文字，非阻擋）** `design.md` 新表的註記寫「前三列抄自 `040`」。實際抄了四列（第 1、2、4、5 列）。四列逐字相符。

### Verdict: PASSED

白名單兩筆與一手來源逐字相符。`stance` 值域正確，佔位掃描乾淨。指紋等值、各 AC 的反向改動與不落地同步都已獨立重跑，結果與 implement 一致。沒有新失敗，沒有執行同步，也沒有動試算表。F1 是文件補強。它影響的是延後 AC 的執行品質，不影響本分支交付的程式或資料，所以不構成退回理由。修不修由 FO 決定。

### Summary

在 base、分支與拋棄式 worktree 上獨立重跑全部檢查：一手來源、指紋等值（20 列）、20 個反向改動、`tsc`、`build`，以及兩次不落地同步。所有 implement 的數字都重現成功。發現三項，都不阻擋：延後 AC-2 (b)／AC-12 缺逐字指令（F1，附指令）、一個 fail-closed 的測試缺口（F2）、一處文字誤差（F3）。行數超標需 captain 在 gate 認可。

## Stage Report: review

- DONE: Review the diff against the design for what verify did not own: code quality of sync-content.mjs, content-fingerprint.mjs, approval-workflow.gs and verified-case-refs.mjs (types/JSDoc conventions, no weakening of 040's approval validation, Node/Apps Script parity kept readable), and whether the extra test lines are justified rather than duplicated.
  程式改動逐行對照 design 3.2–3.5，全部相符。JSDoc 與 `ALLOWED_VIBES` 的註解形式一致；白名單與 `OPTIONAL_PUBLISHED_FIELDS` 皆 `Object.freeze`。`040` 的檢查沒有被放寬：`validateApprovalBinding` 未動；`resolveApprovalHeaders_` 仍對缺欄與重複欄 throw；`reviewActiveRows_` 在「新程式、舊公式、已填值」時因 `fingerprintForSheetRow_` 與公式值不符而 throw（`approval-workflow.gs:247`），fail closed。兩端的附加規則在 `content-fingerprint.mjs:72-75` 與 `approval-workflow.gs:80-83` 各四行，結構對稱，可讀。另外親自重跑三個反向改動（在拋棄式 worktree，改完即還原）：`Object.hasOwn`→`in` 使 AC-4 失敗 1 項；`CONTENT_FINGERPRINT` 把選填參數移到序號前使 3 項失敗（含 AC-7(c)(d) 與 040 兩端一致測試）；兩個展開移到 `full_content` 前使 AC-8 失敗 1 項。多出的測試行有必要：假分頁測試（公式安裝、`fingerprintForSheetRow_`）是那兩個 GS 反向改動唯一會失敗的測試。R2 記錄了輔助函式重複，屬於 Polish。
- DONE: Check every ## Documentation impact row against delivered behavior (design.md 發布欄位範圍 table, operations.md stage-2 steps and new error messages, the captain's stance-filling decision recorded), record docs untouched, INDEX consistency; apply the README clause only if an out-of-repo step ran (none should have).
  現在更新兩筆都已完成。對 `docs/content-pipeline/` 的 diff 只有一行刪除：`operations.md` 的 `node --test` 指令加上新測試檔；2026-09-21 那則補述逐字未改。實作後更新：〈發布欄位範圍〉表與本 PR 同時交付（`design.md:257`），內容與 `DESIGN_PROJECTION` 及程式相符。`operations.md`〈Track 2 加兩欄〉的 9 步與 design 第五節階段二相符，三則錯誤訊息與 `sync-content.mjs` 的字串前綴逐字相同。captain 決定的填值分工已寫入 `design.md` 修訂紀錄與 `operations.md`。第二節欄位表、第五節、`data-collection-guide.md` 與 INDEX 日期依第九節排在階段二，目前未改，時點正確。不更新清單中的六份文件，本分支都沒有 diff。本票沒有新增或刪除文件，INDEX 不需改。repo 外步驟：沒有執行，所以 README 條款不適用。
- DONE: Identify regressions (full suite with 068's 012 fix considered, tsc, build, no-write sync byte-identical, 056 G-7, content-audit no new failures) and end with a clear PASSED or REJECTED verdict; note for the FO that 054's gatekeeping.md does not yet list 064's new checks (whichever of 054/064 merges second must update it).
  完整測試：分支 118/116/1 fail/1 skip。唯一的 fail 是 `threshold-analysis` AC-7。在拋棄式 worktree 套用 068 的 `84962bb` 後為 118/117/0/1。`npm run build` exit 0；接著 `npx tsc --noEmit` exit 0；前後 `src/data/*.json` 的 sha256 相同。不落地同步於 `2026-09-29T20:34:16Z` 執行，`pwd -P` 路徑，分支與 main 各跑一次：兩次都 exit 0，`discussions.json` 為 `4071978a…3162`，`history.json` 為 `4d1992e3…ea3b`，與 `src/data` 相同；主 repo 的 `src/data` 未變。056 G-7 印出 `G-7 PASS [place1=1/1 place2=1 place3=1]`。`content-audit check` 的分支與 main 結果相同，都是 `M4=1 M5=2 M6=9`，唯一差異是 `design.md` 的 M6 行號因新增段落而位移，沒有新失敗。沒有執行 sync-content，也沒有碰試算表。**給 FO**：`054` 的 `docs/content-pipeline/gatekeeping.md:117`〈同步前置檢查〉沒有列出本票的三個新中止條件，測試指令也缺 `tests/track2-case-ref-stance.test.mjs`。`054` 與 `064` 較晚合併的一方要補上。

### Findings

- **R1（Polish）** Node 的 alias `case ref`（空白）在 Apps Script 沒有對應。GS 只比對欄名本身。若標題誤打成 `case ref （…）`，Node 解析得到，GS 解析不到。結果是：公式不含該欄，填值後同步以「與目前發布內容不符」中止。這是 fail closed，但錯誤訊息不指向標題。design 3.3 規定了這個 alias；040 的 `full content` 也有同型不對稱。`operations.md` 第 2 步要求逐字輸入，所以沒有觸發路徑。不建議本票修。
- **R2（Polish）** `tests/track2-case-ref-stance.test.mjs` 重寫了 `loadAppsScript`、`csvCell`、`toCsv`、`approve`，040 測試檔已有同名函式，但簽名不同。抽成共用模組要動 040 的測試檔，超出本票範圍。不阻擋。
- verify 的 F2（GS 序號迴圈計入選填欄時沒有測試會失敗）維持 FO 的延後決定，不重列。

### Verdict: PASSED

程式與 design 3.2–3.5 相符，沒有放寬 040 的核可檢查，兩端 parity 可讀。親自重跑的三個反向改動都讓對應測試失敗。文件影響各筆都依時點處理。回歸檢查全部乾淨：套用 068 修正後 0 fail，tsc、build、不落地同步逐位元組相同，G-7 PASS，content-audit 無新失敗。R1、R2 都是 Polish。

### Summary

獨立審查 064 階段一的程式與文件，對照 design 逐項比對，並自行重跑三個反向改動與全部回歸檢查。結果都與 implement 和 verify 的記錄一致。兩項 Polish 不阻擋交付。另提醒 FO：054 的 gatekeeping.md 尚未列入本票的三個新同步檢查。
