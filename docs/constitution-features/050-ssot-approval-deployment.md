---
id: 050
title: 正式 SSOT 部署 feature 040 的審核欄位（040 合併的硬前置）
status: review
source: captain 2026-09-04（把關機制體檢最高風險項：無票、無人負責）
started: 2026-09-07T23:15:17Z
completed:
verdict:
score: 0.95
worktree: .worktrees/spacedock-ensign-050-ssot-approval-deployment
issue:
pr:
mod-block:
gates:
    version: 1
    records:
        - id: gate:050:verify
          stage: verify
          attempts:
            - id: gate-attempt:050-verify-1
              briefing:
                id: briefing:050:verify:attempt-1:revision-1
                digest: sha256:e57202b091ba96ecc437ef7e4d20ad5949a12d8c642d05aed86415c583a761ae
                room-ref: '@review/verify/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:050:verify:1
                briefing: briefing:050:verify:attempt-1:revision-1
                by: person:captain
                at: "2026-09-24T22:51:04.870988Z"
                decision: approve
                reason: Captain 核准：runbook 經五輪 verify 收斂，全程對正式試算表零寫入零讀取，承重數字三個獨立來源確認，S3 補上機器可判前置後誤刪列擋得住而合法填值仍放行。進入獨立審查。
              application:
                target-stage: review
                state: consumed
        - id: gate:050:review
          stage: review
          attempts:
            - id: gate-attempt:050-review-1
              briefing:
                id: briefing:050:review:attempt-1:revision-1
                digest: sha256:649af86574ff2fdd1ab86b0bd3600cc91eab843ff55044f9a642cc95a8c10bcd
                room-ref: '@review/review/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:050:review:1
                briefing: briefing:050:review:attempt-1:revision-1
                by: person:captain
                at: "2026-09-25T17:33:50.614272Z"
                decision: revise
                reason: Captain 裁決三項（方向採納，review cycle 4 的 PASSED 不變）：(1) AC-4 擴大至逐欄逐分頁，對齊 S7-b 既有的 30 格；(2) 新增反向對照 B——以責任編輯身分驗 B 類六欄必須可改，6 欄 x 3 分頁 = 18 格，補上 S7-b 只驗單一方向的缺口；(3) 放行 040 Out of scope 後半句「並由 captain 確認」，選項 A。退回 implement 僅為落實 captain 授權的 AC 變更與對應 S7 程序，非否定 runbook。另 FO 以 AC-6 唯讀探針實測確認：main 同步 exit 0、無 review_decision 標題錯誤、sha256 與 baseline 逐字相同（4d1992e3…cea3b / 4071978a…3162）、筆數 40/16——窗口未打開，S4 起全部未執行，票內「captain 正在 S7」為未查證的轉述。
review-round:
    id: round:050:review:8
    stage: review
    cycle: 8
    briefing:
        id: briefing:050:review:round-8
        digest: sha256:08ac52abfcef67dbb764ca27eba8490878d4c4214e7bb6764733449e01ad8498
        room-ref: '@review/review/round-8'
---

feature 040 把八個審核欄位全部改為必填。**正式試算表要先把那八欄全部建好，040 才能合併。**
**順序做錯會讓整條產線停擺。**

> ⚠️ **2026-09-25 更正（K22 掃描追加）：原句「正式試算表尚未建立這些欄位」已不再全對。原句保留。**
> 階段一（S2）已建好其中三欄（`approved_by`／`approved_at`／`reject_reason`），
> 加上本來就有的 `status`，`Track 1_history` 與 `Track 2_discussion` 各為 **4／8**、`site_tldr` 為 **1／8**
> （截至 `2026-09-25T19:11Z` 量測，**歷史讀數，會過期**；要現況跑第十六節的指令一）。
> **摘要的實質不變**：八欄**全部**建好之前 040 不能合併，順序做錯仍會讓產線停擺。

## Problem

040 的 `sync-content.mjs` 中 `APPROVAL_COLUMNS` 八個欄位全為 `column: 'required'`（已由 FO 直接讀取 worktree 程式確認）：

`status`、`review_decision`、`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、`current_fingerprint`、`reject_reason`

`column: 'required'` 的語意是：**欄位不存在 → 整份同步中止。**

`docs/health-check/2026-09-03-editor-onboarding.md:425-430` 明寫：

> **一旦先合併而試算表還沒建那八欄，下次同步會直接中止，一個字都出不去。**
> 正確順序是：**試算表建欄 → 裝公式 → 逐列重新核可 → 才合併程式。**

**為什麼需要這張票**：040 的 Out of scope 明文寫「不上線正式 SSOT 設定」；feature 044 只做隔離測試表的 probe，不碰正式表。**這些人工步驟目前沒有任何票、沒有任何人負責**，而 040 已走到最後一道 gate。

## 已知的工作內容（design stage 須確認並補齊順序與負責人）

1. **正式試算表三個發布分頁各建八個審核欄位。**
2. **裝上 `CONTENT_FINGERPRINT` 與 `APPROVAL_STATUS` 公式，以及 Review 選單。** 程式碼在 `scripts/apps-script/approval-workflow.gs`，部署方式見 `docs/content-pipeline/operations.md`（該檔目前只存在於 040 的 worktree，隨 040 合併才會進 main）。
3. **逐列重新核可。** `docs/health-check/2026-09-03-editor-onboarding.md:432-433` 明訂舊列不能批次補造指紋——部署新欄位後既有的 `Approved` 會**全部先顯示 `Needs review`**。
4. **確認保護範圍。** 八個審核欄位需設為投稿者不可編輯。與 `status` 欄的保護是分開設定的。

`editor-onboarding.md:434` 特別註明：**編輯權限已經開出去，這一輪重新核可的工作量比原設計預估的大。**

## 相依關係

- **擋住 040 的合併。** 本票未完成前，040 不應合併進 main。
- **feature 044**（隔離測試表兩帳號 probe）驗證的是同一套機制，但在測試表上。044 的結果可降低本票的風險，但兩者不互為前置。
- **`reject_reason` 欄目前在正式試算表上不存在**（`editor-onboarding.md:261`），而 040 將其列為必填。

> ⚠️ **2026-09-07 design stage 更正：上面第二個項目符號的「兩者不互為前置」不成立。**
> 判定與理由見下方「相依關係釐清（design stage）」。原句保留。

## Risk evidence

> 🔒 **本票的寫作規則（captain 2026-09-25 親自授權，全票適用，不限節次）**
>
> **票內不得斷言「部署現在做到哪裡」這種會自己過期的事實。** 需要記錄現況時二擇一：
> **(a)** 明寫 UTC 量測時戳並寫明那是歷史讀數，或
> **(b)** **只留可重跑的指令，不留當時的輸出**。
> **指令永遠為真，輸出十分鐘後可能就假了。**
>
> **單調／非單調判準**：「**已完成 X**」單調、不會過期，不必標時戳；
> 會翻面的是「**仍是**」「**尚未**」「**待補**」「**還沒**」「**目前仍**」。
>
> **引用版本一律釘 SHA，不得使用 `HEAD`、`main` 等移動引用**——
> **移動引用是非單調的，寫下的瞬間就開始過期。**
> （`main`／`HEAD` 出現在**指令**裡沒問題，只要把它解析出來的 SHA 一併印在旁邊；
> 不可以的是拿它當**量測標籤**，例如「某值在 HEAD 是 12」。）
>
> **這條規則為什麼出現在這一節**（reviewer cycle 6 收出的判準，逐字寫進票內）：
>
> > **斷根規則寫在處置節裡，擋不住操作節與交付節。**
> > **規則要放在「會被讀到的那一節」，而不是放在「記錄它的那一節」。**
>
> 第一次入票時規則只寫在第十六節與第十七節（兩節都是**處置節**），
> `## Documentation impact` 因此完全沒被掃到，同一形狀第三次復發。
> **覆蓋清單與掃描方式見第十八節。**
>
> ---
>
> 🔒 **同一條規則的上游版本：寫授權封包與 `### Feedback Cycles` 的人也受約束**
> （FO 提出，經 reviewer cycle 6 收緊後採用；逐字寫在這裡是因為
> **worker 會把授權封包的字逐字抄進票內**——K18 就是這樣被放大成五處的）。
>
> > 在**授權封包**與 **`### Feedback Cycles`** 寫下任何**非單調**狀態宣稱或數量詞之前，
> > **先跑一條列舉型指令，再依輸出寫結論**；票內**只留那一行指令**；
> > 需要留結果時**同時標 UTC 時戳並寫明是歷史讀數**；
> > **凡逐字轉寫的值（hash、行號、SHA、數量），封包送出前各自回讀一次。**
>
> **「列舉型」是關鍵字。** K26 的成因是**以確認型指令回答了列舉型問題**——
> 用 `git show <SHA> | grep` 查到「那個 commit 裡沒有」（那是真的）就停手，
> 沒有跑 `git log --oneline <SHA>..HEAD` 去列出後來發生了什麼。
> **確認型指令只能證實你已經想到的事；列舉型指令會告訴你還有什麼。**

`no spike needed` 不成立，但 spike 的形式是**在隔離測試表上先跑一次**（即 feature 044）。**不得直接在正式 SSOT 上試錯**——正式表是 40 筆已上線內容的唯一來源。

> **該 spike 已由 feature 044 於 2026-09-21 完成並 PASSED**（`score: 0.96`，已歸檔），
> 詳見下方「相依關係釐清」的相依二。上面那句講的是 spike 的**形式**，不是它的進度。

### design stage 追加的實測證據

design stage 未接觸正式 SSOT。以下三項改用「離線執行真正的程式碼」取得，指令與 fixture 可重跑。

**證據 1：兩個會擋住部署的欄位不符，用真正的 `approval-workflow.gs` 跑出來**

以 stub 取代 Google 端全域物件，載入 `scripts/apps-script/approval-workflow.gs` 原始碼，
呼叫其中的 `resolveApprovalHeaders_`，餵入正式表現況的標題字串：

| 分頁 | 標題輸入 | 結果 |
|---|---|---|
| `Track 1_history` | `收集區` 現況 9 欄 + `status` + 新建 7 欄 | ⛔ `缺少欄位「chapter」。` |
| `Track 1_history` | 同上，補一欄 `chapter` | ✅ 解析 18 欄 |
| `Track 2_discussion` | 現況標題 `owl comment (允鍾…)`（**空格**） | ⛔ `缺少欄位「owl_comment」。` |
| `Track 2_discussion` | 同上，改成 `owl_comment (允鍾…)`（**底線**） | ✅ 解析 21 欄 |
| `site_tldr` | `order｜label｜text｜status｜link` + 新建 7 欄 | ✅ 解析 12 欄 |

原因：`approval-workflow.gs:127-144` 的 `resolveApprovalHeaders_` **沒有別名表**。
它只接受「標題等於欄名」或「標題以欄名加分隔符開頭」。
`scripts/sync-content.mjs` 有別名表（`owl comment` 與 `owl_comment` 都收），Apps Script 沒有。
兩支程式對同一份標題列的容忍度不同，這是部署會踩到的第一個坑。

`Track 1_history` 缺 `chapter` 的依據：`docs/health-check/2026-08-31-content-pipeline.md:174` 記載
`收集區` 的 Track 1 為 9 欄，不含 `chapter`；`.env.local` 註記三個網址已於 2026-09-02 統一指向 `收集區`。
`approval-workflow.gs:5` 的 `APPROVAL_FIELDS['Track 1_history']` 含 `chapter`，且 `resolveApprovalHeaders_` 要求它必須存在。

**證據 2：部署過程中有一段「兩支程式都跑不動」的窗口**

架一台本機 HTTP server 供應四組 CSV fixture，分別代表部署的四個階段，
用 **main 上現行的 `scripts/sync-content.mjs`** 與 **040 worktree 的新版**各跑一次：

| 階段 | main 現行 sync | 040 新版 sync |
|---|---|---|
| A　尚未動工（**2026-09-07 量測當時**的正式表） | ✅ exit 0 | ⛔ `缺少必要欄位「review_decision」。` |
| B　八欄建好、公式未裝 | ⛔ `第 12 欄的標題「review_decision」對不到任何預期欄位。` | ⛔ `核可紀錄缺少 review_decision。` |
| C　公式已裝、尚未重新核可 | ⛔ 同上（標題對不到） | ⛔ `有 N 列資料，但沒有任何一列的 status 是 Approved。` |
| D　逐列重新核可完成 | ⛔ 同上（標題對不到） | ✅ exit 0 |

> ⚠️ **2026-09-25（K22 掃描追加）：上表四列是 fixture 實驗的四個「階段」，不是現況快照。**
> 階段 A 原寫「（**今天**的正式表）」，那是 2026-09-07 design stage 的「今天」，已加上日期。
> **這四列本身是單調的**——它們記的是「某一種欄位狀態下兩支程式各自怎麼反應」，永遠成立。
> **要知道正式表現在落在哪一個階段，跑第十六節的兩條指令，不要讀這張表的列名。**

**B 與 C 是產線全停窗口。** 而且窗口從「建欄」那一刻就打開，不是從「裝公式」才打開——
main 現行的 `buildColumnMap` 對看不懂的標題會中止（`sync-content.mjs` 的最長前綴比對，
`design.md` 第二節第 4 點），新建的 `review_decision`、`review_fingerprint`、
`approved_fingerprint`、`current_fingerprint` 四個標題它一個都不認得。

**這推翻了一個直覺**：以為「先建欄不影響現況、可以慢慢做」。實際上建完欄的當下，
main 就已經同步不了了。B→D 這段必須一氣呵成，中間不可發布任何內容。

**證據 3：驗收要用的比對手法本身可行**

同一份內容，分別用 main 現行 sync（正式表現況欄位、無 `chapter`）與 040 新版 sync（部署後欄位、
`chapter` 為空白）產出，兩邊 `history.json` 與 `discussions.json` 的 sha256 完全相同：

```
b380578936…6b1b  history.json      （兩邊相同）
0994b8de11…49b8  discussions.json  （兩邊相同）
```

結論：**新增一欄空白的 `chapter` 不改變輸出。** AC-1 的比對手法成立，不是空談。

**證據 4：標題可以保留給學者看的中文說明**

runbook 要 captain 實際輸入的 18／21／12 個標題字串（含中文說明），
同時通過 `resolveApprovalHeaders_` 與 040 新版 sync，且輸出與純欄名版本逐字相同。
中文說明不必為了部署而刪掉。

## 部署 runbook

> 🔒 **本票的寫作規則（captain 2026-09-25 親自授權，全票適用，不限節次）**
>
> **票內不得斷言「部署現在做到哪裡」這種會自己過期的事實。** 需要記錄現況時二擇一：
> **(a)** 明寫 UTC 量測時戳並寫明那是歷史讀數，或
> **(b)** **只留可重跑的指令，不留當時的輸出**。
> **指令永遠為真，輸出十分鐘後可能就假了。**
>
> **單調／非單調判準**：「**已完成 X**」單調、不會過期，不必標時戳；
> 會翻面的是「**仍是**」「**尚未**」「**待補**」「**還沒**」「**目前仍**」。
>
> **引用版本一律釘 SHA，不得使用 `HEAD`、`main` 等移動引用**——
> **移動引用是非單調的，寫下的瞬間就開始過期。**
> （`main`／`HEAD` 出現在**指令**裡沒問題，只要把它解析出來的 SHA 一併印在旁邊；
> 不可以的是拿它當**量測標籤**，例如「某值在 HEAD 是 12」。）
>
> **這條規則為什麼出現在這一節**（reviewer cycle 6 收出的判準，逐字寫進票內）：
>
> > **斷根規則寫在處置節裡，擋不住操作節與交付節。**
> > **規則要放在「會被讀到的那一節」，而不是放在「記錄它的那一節」。**
>
> 第一次入票時規則只寫在第十六節與第十七節（兩節都是**處置節**），
> `## Documentation impact` 因此完全沒被掃到，同一形狀第三次復發。
> **覆蓋清單與掃描方式見第十八節。**
>
> ---
>
> 🔒 **同一條規則的上游版本：寫授權封包與 `### Feedback Cycles` 的人也受約束**
> （FO 提出，經 reviewer cycle 6 收緊後採用；逐字寫在這裡是因為
> **worker 會把授權封包的字逐字抄進票內**——K18 就是這樣被放大成五處的）。
>
> > 在**授權封包**與 **`### Feedback Cycles`** 寫下任何**非單調**狀態宣稱或數量詞之前，
> > **先跑一條列舉型指令，再依輸出寫結論**；票內**只留那一行指令**；
> > 需要留結果時**同時標 UTC 時戳並寫明是歷史讀數**；
> > **凡逐字轉寫的值（hash、行號、SHA、數量），封包送出前各自回讀一次。**
>
> **「列舉型」是關鍵字。** K26 的成因是**以確認型指令回答了列舉型問題**——
> 用 `git show <SHA> | grep` 查到「那個 commit 裡沒有」（那是真的）就停手，
> 沒有跑 `git log --oneline <SHA>..HEAD` 去列出後來發生了什麼。
> **確認型指令只能證實你已經想到的事；列舉型指令會告訴你還有什麼。**


> ⚠️ **2026-09-24 implement stage 實測更正：下面的步驟 0 指令、步驟 2 字串、步驟 3 欄位表三處與現況不符。**
> 原文保留。**實際執行請照「implement stage 實測結果（2026-09-24）」的第八節「校正後的步驟 1-7」**，
> 不要照下面步驟 3 的表。不符之處逐項列在該節第七小節「runbook 缺陷」。

**執行者標示：`captain` 表示只能由人在 Google 試算表手動完成，worker 無法代勞。`工程` 表示可由 worker 執行。**

### 步驟 0（工程）確認現況欄位，不要憑文件推測

`docs/content-pipeline/design.md` 第二節的欄位表是**設計意圖**，不是現況快照，
已知至少兩處與現況不符（`chapter` 不存在、`reject_reason` 不存在）。動工前必須讀一次真的標題列。

```bash
# 在 repo 根目錄執行。只讀不寫，只印標題列。
node --env-file=.env.local -e '
const t = [["Track 1_history","TRACK_1_CSV_URL"],["Track 2_discussion","TRACK_2_CSV_URL"],["site_tldr","SITE_TLDR_CSV_URL"]];
Promise.all(t.map(async ([name, key]) => {
  const res = await fetch(process.env[key]);
  const head = (await res.text()).split(/\r?\n/)[0];
  return `${name}\n  ${head}\n`;
})).then(rows => console.log(rows.join("\n")));
'
```

**`--env-file` 必須寫在 `-e` 前面。** 寫在後面會被當成程式的參數，環境變數不會載入。

把三段輸出貼進本票。**這是後續每一步的比對基準。**
輸出含試算表的欄位標題，不含 URL，可以安全貼上。

### 步驟 1（captain）Track 1_history 補一欄 `chapter`

在 `Track 1_history` 最右側新增一欄，標題輸入：

```
chapter （目前全部空白）
```

**整欄留白，不要填任何值。** 證據 3 已證明空白的 `chapter` 不改變同步輸出。

> 為什麼要建一個沒有用的欄：`approval-workflow.gs` 的指紋公式把 `chapter` 算進發布欄位投影，
> 少這一欄，Review 選單的「安裝／更新公式」會直接報錯不動。
> `TODO.md` 的 P3-7 記載 `chapter` 設計已被放棄。本票不動它。
>
> **⚠️ 廢除 `chapter` 這件事目前尚無 feature 票，負責人未定。**
> 原句寫「那是另一張票要處理的事」，但那張票不存在——
> 它現在唯一的落腳處是 `TODO.md` 的 **P3-7**（以名稱引用，不寫行號，理由見第十節）。
> **而本票剛好讓它更難處理**：本票為了 Apps Script 新建了一個空白 `chapter` 欄，
> 該欄從此有技術用途，要廢除它得連 `approval-workflow.gs` 一起改。
> 這一點已列在下方 Documentation impact 的「實作後更新」。

### 步驟 2（captain）Track 2_discussion 把 `owl comment` 改成 `owl_comment`

只改標題那一格，**空格換成底線，後面的中文說明照留**：

```
改前：owl comment (允鍾如果有靈感可以寫一句短評)
改後：owl_comment (允鍾如果有靈感可以寫一句短評)
```

不要動欄位位置，不要動任何一格內容。同步程式兩種寫法都認得（`sync-content.mjs` 的 `aliases`），
Apps Script 只認底線那種。

### 步驟 3（captain）三個分頁各新增缺少的審核欄位

**欄名的唯一依據是 `scripts/sync-content.mjs:84-93` 的 `APPROVAL_COLUMNS`，八個欄位依序是：**

```
status
review_decision
review_fingerprint
approved_by
approved_at
approved_fingerprint
current_fingerprint
reject_reason
```

**建議實際輸入的標題字串**（已實測同時通過 Apps Script 與同步程式）：

| 欄名 | 標題輸入 |
|---|---|
| `status` | `status （公式自動產生，不要手動填）` |
| `review_decision` | `review_decision （由 Review 選單寫入）` |
| `review_fingerprint` | `review_fingerprint （由 Review 選單寫入）` |
| `approved_by` | `approved_by （核可者，自動填）` |
| `approved_at` | `approved_at （核可時間 UTC，自動填）` |
| `approved_fingerprint` | `approved_fingerprint （由 Review 選單寫入）` |
| `current_fingerprint` | `current_fingerprint （公式自動產生，不要手動填）` |
| `reject_reason` | `reject_reason （退回原因）` |

**各分頁要新增哪幾欄**（依步驟 0 的實測結果修正；下表是依現有記錄的預期值）：

| 分頁 | 已有 | 要新增 |
|---|---|---|
| `Track 1_history` | `status`、`approved_by`、`approved_at` | `review_decision`、`review_fingerprint`、`approved_fingerprint`、`current_fingerprint`、`reject_reason` |
| `Track 2_discussion` | `status`、`approved_by`、`approved_at` | 同上五欄 |
| `site_tldr` | `status`（`TODO.md` 的 P1-5「附帶問題已解決」記錄現況為 `order｜label｜text｜status｜link`） | `review_decision`、`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、`current_fingerprint`、`reject_reason` |

**三條硬規則：**

1. **欄名不可重複。** 同一分頁出現兩個 `status`，兩支程式都會中止。`site_tldr` 發生過一次。
2. **不要複製整欄來「備份」。** 那就是規則 1 的違反方式。
3. **新增的欄位全部留白。** 值由公式與 Review 選單產生。

**⚠️ 做完這一步，main 的 `npm run sync-content` 就會中止（證據 2 的階段 B）。從這裡到步驟 7 之間不可發布內容。**

### 步驟 4（captain）安裝 Apps Script

前置：feature 044 **已於 2026-09-21 完成並 PASSED**（見下方「相依關係釐清」的相依二）。
仍待 captain 依 040 Out of scope 的後半句「並由 captain 確認」給出那一次確認。

1. 在正式試算表開 **擴充功能 → Apps Script**，建立綁定式專案。
2. 貼入 `scripts/apps-script/approval-workflow.gs` 與 `scripts/apps-script/appsscript.json` 的內容。
   **兩個檔都在 040 的 worktree**：`.worktrees/spacedock-ensign-040-approval-content-version-binding/scripts/apps-script/`。
   工程可先把兩個檔的內容貼進本票或另存純文字給 captain，避免 captain 需要操作 git。
3. 儲存後**重新載入試算表分頁**。工具列會出現 `Review` 選單。
4. 第一次執行選單項目會跳授權視窗，**必須授權**。
   `approval-workflow.gs:220` 用 `Session.getActiveUser().getEmail()` 取核可者身分，
   沒授權會得到 `無法取得核可者身分。請確認 Apps Script 授權設定。`

**驗證這一步成功了沒有**：切到 `Track 1_history`，執行 `Review → 安裝／更新公式`。

- 沒有跳錯 → 成功。`status` 與 `current_fingerprint` 兩欄會出現公式與值。
- 跳 `缺少欄位「X」。` → 步驟 1／2／3 有一欄沒建好或名字不對。回去對。
- 跳 `這個分頁不支援核可公式。` → 分頁名稱不是 `Track 1_history`、`Track 2_discussion`、`site_tldr` 其中之一。
  `approval-workflow.gs:159` 用分頁名稱當 key，**名稱一個字都不能差**。
  **這一列實際發生過。** 2026-09-25 captain 執行 S5 時，第三個分頁跳出這則訊息。
  該分頁當時的名稱是 `Site_TLDR`（來源：captain 口頭回報，改名前記錄，見 `### Feedback Cycles` 的 Cycle 12）。
  captain 改名為 `site_tldr` 後重跑成功。名稱確認步驟見第八節階段二的「S5 之前：確認三個分頁名稱」。

三個分頁**各要執行一次**「安裝／更新公式」。它只作用在當下的分頁。

### 步驟 5（captain）確認公式已生效

安裝後，`status` 欄應該全部顯示 `Needs review`（不是空白、不是 `#FINGERPRINT!`）。

| 看到什麼 | 意思 |
|---|---|
| `Needs review` | ✅ 正常。舊的核可紀錄不符新的指紋，本來就該是這樣 |
| 空白 | 該列所有發布欄位都空 → 是空列，正常 |
| `#FINGERPRINT! views 必須是非負整數。` | 該列的 `views`／`order`／`sticky` 有格式錯誤，先修內容 |
| `#NAME?` | Apps Script 沒載入成功，回步驟 4 |

### 步驟 6（captain）設定保護範圍

**保護範圍要涵蓋三類，三類是分開設定的：**

| 類別 | 範圍 | 誰可以編輯 | 為什麼 |
|---|---|---|---|
| A　公式欄 | `status`、`current_fingerprint` | 設為「只有 captain」——**但這不是授權 captain 去改** | 這兩欄是公式產物。保護範圍**排除不了擁有者**，那是 Google 試算表的平台限制，不是本票刻意給的權限。規則是**不要改**（見下方 ⚠️） |
| B　審核欄 | `review_decision`、`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、`reject_reason` | 只有責任編輯 | `approval-workflow.gs:12-14` 的 `WRITABLE_REVIEW_FIELDS` 就是這六欄。Review 選單以執行者身分寫入，執行者沒有權限就會被擋 |
| C　標題列 | 三個分頁的第 1 列**全列** | 只有 captain | 改一個標題，整條產線停擺。`editor-onboarding.md:104-111` 的風險 5 |

**三個分頁都要各設一次。** Google 試算表的保護範圍不會跨分頁繼承。

> ⚠️ **不要手動編輯 `status` 欄，也不要手動編輯 `current_fingerprint`。**
> 這一條採用 `044` 交給本票的第一項規則，原句是：
>
> > **不要手動編輯 `status` 欄。** 擁有者改得動（保護範圍排除不了擁有者，是平台限制）。
> > 手改會覆蓋該格公式，該列狀態自此不再自動更新，必須重跑「安裝／更新公式」還原。
>
> **機械成因**（實讀 `approval-workflow.gs:156-171`，釘在 commit `a51b5d9`）：
> `installApprovalFormulas` 對每一列用 `setFormula` 寫入 `current_fingerprint` 與 `status` 兩格。
> 那是**公式**，不是值。往那一格輸入字面值會**覆蓋該列的公式**，
> 該列的狀態從此不再隨內容變動而更新——它會凍結在你輸入的那個字上。
>
> **還原方式**：對該分頁重跑 `Review → 安裝／更新公式`。它會把公式重新寫回每一列。
>
> **為什麼這一條特別危險**：本票自己的驗證迴路就是讀 `status`——
> 步驟 5、S6 要 captain 看 `status` 是否顯示 `Needs review`，
> 步驟 7 第 4 點要 captain 看 `status` 是否變成 `Approved`。
> **手改過的 `status` 會顯示你想看到的字，而那個字不再代表任何事實。**
>
> 同步端不受影響：`validateApprovalBinding` 的閘門是 `review_decision` 與三份指紋，不是 `status`。

**已知未解**：`editor-onboarding.md:58` 提的「整列刪除」保護，Google 試算表沒有直接對應的設定。
本票不處理（見 Out of scope）。

> ⚠️ **2026-09-24 更正：原句寫「由 feature 043（刪列跌幅門檻）在同步端擋」，那句話會讓人以為已經有人接手。**
> 重讀 043 的 front matter：`status: design`、標題仍掛「待captain確認脈絡」、
> `source` 寫「脈絡待確認後再決定**是否進行**」——**那張票還沒決定要不要做。**
> 而且就算做出來也擋不住本票的風險：043 的門檻是「初步建議兩成」
> （`043-sync-row-drop-threshold.md:52`），誤刪 1 列／40 列 ＝ **2.5%**，遠在門檻之下。
> **本票對誤刪的防線是 S3 的檢查①與檢查②**（筆數仍是 40／16、AC-3 的 id 比對仍一致），
> 不是 043。S9 會再跑一次同樣的兩項。防線本身不變，改的只是這句話。

### 步驟 7（captain + 工程）逐列重新核可

**範圍與數量**（以目前已上線內容計）：

| 分頁 | 要重新核可的列數 | 依據 |
|---|---|---|
| `Track 1_history` | 40 | `src/data/history.json` 有 40 筆 |
| `Track 2_discussion` | 15 | `src/data/discussions.json` 16 筆減去 `tldr` 那筆 |
| `site_tldr` | 4（`order` 0–3） | `tldr` 的 `abstract` 有 3 個重點，加 `order 0` 標題列 |
| **合計** | **59 列** | |

分頁上還會有**不該上線的列**（例如 `h28`，`editor-onboarding.md:344-345` 記載它掛錯標題，目前以清空 `status` 擋住）。
**這些列不要核可，讓它們停在 `Needs review`。**

**操作方式：**

1. 選取要核可的資料列（可一次選連續多列）。**不要選到第 1 列標題列**——`approval-workflow.gs:219` 會擋，但別浪費時間。
2. 執行 `Review → 核可選取列`。
3. 程式會逐列重算指紋、比對、寫入 `approved_by`／`approved_at`／三份指紋，最後把 `review_decision` 設為 `Approved`。
4. `status` 應變成 `Approved`。**但「沒變」有兩種完全不同的原因，不要只當成一種：**
   - **選單跳出錯誤訊息** → 程式偵測到問題，會**自動復原整批審核欄位**並報錯。
     訊息對照下方「常見錯誤」表。
   - **選單完全沒反應、沒有任何錯誤訊息** → **這是靜默失敗，不是程式沒跑。**
     先確認執行的帳號在**審核欄（B 類）保護範圍的允許名單內**。見下方「常見錯誤」表最後一列。

   **不要手動把 `status` 改成 `Approved` 來「修正」它。** 那會覆蓋該列公式
   （見步驟 6 的 ⚠️），該列狀態從此凍結，而核可紀錄其實沒有寫進去。
   還原方式是重跑「安裝／更新公式」。

**「逐列」的意思是逐列判斷，不是逐列點按。** 可以多列一起核可，因為程式對每一列各自重算指紋。
被禁止的是**批次補造指紋**——`editor-onboarding.md:432` 的原句是「舊列不能批次補造指紋」，
040 worktree 的 `operations.md:13` 寫「不要批次替舊列補造指紋。部署後要逐列重新核可。」
「手動貼上或用公式填 `approved_fingerprint`」是本票對那條禁令的舉例，不是原文。
那樣做會讓核可不再綁定內容。

**⚠️ Track 2 有一個順序陷阱：** `Track 2_discussion` 的指紋含「已發布列序號」
（`approval-workflow.gs:76-80` 的 `__sequence`）。**在 Track 2 插入或刪除任何一列，
其後所有列的指紋都會變，全部退回 `Needs review`。**
所以 Track 2 的內容增刪要在重新核可**之前**全部做完。

**核可過程中的常見錯誤：**

| 錯誤訊息 | 原因 | 怎麼辦 |
|---|---|---|
| `第 N 列沒有可核可的 current_fingerprint。` | 該列公式沒裝或算不出來 | 回步驟 4／5 |
| `第 N 列的指紋公式與發布內容不符。` | 公式是舊的（內容改過但公式沒重算） | 重跑一次「安裝／更新公式」 |
| `審核期間內容已變更。所有審核欄位已復原。` | 核可當下有人在改內容 | 請對方停手，重做這一批 |
| `無法取得核可者身分。` | Apps Script 未授權 | 回步驟 4 第 4 點 |
| **沒有任何錯誤訊息，選單像是沒反應** | **未授權的帳號執行核可或拒絕會靜默失敗。**`044` 實測確認：**沒有錯誤訊息。** 執行者不在審核欄（B 類）保護範圍的允許名單內時就會這樣 | 確認執行的帳號在 B 類保護範圍的允許名單內（步驟 6／S7 設的那一組）。**captain 自己踩不到這一格**——擁有者永遠在允許名單內。**責任編輯只要不在 B 類的允許名單內就會踩到**，而那正是步驟 6 B 類指定的角色，也是部署後執行核可的人 |

> **最後一列是 `044` 交給本票的第二項規則**，原句是：
>
> > **核可選單「沒反應」時，先確認自己在審核欄保護範圍的允許名單內。**
> > 未授權帳號執行核可或拒絕會**靜默失敗**，沒有錯誤訊息。
>
> **本票原本第 4 點寫的是相反的話**（「沒變就是有問題，程式會自動復原整批審核欄位並報錯」）。
> 那句話對「程式跑了並偵測到問題」成立，**對靜默失敗不成立**——那種情況下什麼都不會印。
> 第 4 點已改寫成兩種原因並列。

### 步驟 8（工程）不落地驗證同步

**這一步不寫 `src/data/`，不需要合併 040。** 用 040 worktree 的程式跑一次，輸出導到暫存目錄再比 sha256。

```bash
REPO="/Users/ipa/Documents/ipa Document/00_Claude spacedock folder/30 Public Writing/Constitution"
WT="$REPO/.worktrees/spacedock-ensign-040-approval-content-version-binding"
OUT="$(mktemp -d)"

# 必須在 worktree 內執行（用的是 040 的程式）。
# .env.local 不在 worktree 裡，要指到主 checkout 的那一份。
# CONTENT_OUTPUT_DIR 不可省略，否則會直接覆寫 worktree 的 src/data/。
cd "$WT" && CONTENT_OUTPUT_DIR="$OUT" node --env-file="$REPO/.env.local" scripts/sync-content.mjs

shasum -a 256 "$REPO/src/data/history.json" "$REPO/src/data/discussions.json"
shasum -a 256 "$OUT/history.json" "$OUT/discussions.json"
diff "$REPO/src/data/history.json" "$OUT/history.json" && \
diff "$REPO/src/data/discussions.json" "$OUT/discussions.json" && \
echo "✅ 部署前後逐字相同"
```

> **不要改寫成 `node -e "… await import(…)"` 的形式。** design stage 實測過：
> 那個寫法 exit 0 但什麼都不做，不產生任何檔案也不印任何訊息——
> 一個看起來成功、實際上沒跑的假通過。上面的寫法已實測會真的產生兩個 JSON。

`diff` 有輸出就是**部署把內容弄壞了**。停下來，不要合併 040，把 diff 貼進本票。

### 步驟 9（工程）合併 040

步驟 8 通過才做。合併後 main 的 `npm run sync-content` 才會恢復可用（證據 2 的階段 D）。

## implement stage 實測結果（2026-09-24）

本節是**實測校正**。上面的「部署 runbook」原文保留，但它的步驟 0 指令、步驟 3 欄位表、
步驟 2 字串三處與現況不符，**執行部署請照本節的「校正後的步驟 1-7」**，不要照上面的表。
不符之處逐項列在下方「runbook 缺陷」。

本輪只執行步驟 0。**未對正式試算表做任何寫入**：沒有建欄、沒有改標題、沒有裝 Apps Script、
沒有設保護範圍、沒有核可任何一列。唯一碰到外部系統的動作是三次 HTTP GET 讀取發布 CSV。
`src/data/*.json` 的 sha256 在本輪前後相同（`4d1992e3…cea3b`／`4071978a…3162`）。

### 一、步驟 0 的輸出（逐字）

照票內指令執行（`--env-file` 在 `-e` 前面），輸出如下：

```
Track 1_history
  id(給系統看的編號),category,year,ruling_id,ruling,content（現有為AI生成）,handwriting（現有為AI生成）,title（現有為AI生成）,image_url（現有為AI生成）,"status

Track 2_discussion
  id,category,title,author,year,link,abstract,views,status,"owl comment

site_tldr
  order,label,text,status,link
```

**這份輸出是被截斷的，不可當作基準。** Track 1 的 `status` 與 Track 2 的 `owl comment`
兩個標題格**內含換行字元**。票內指令用 `split(/\r?\n/)[0]` 取第一行，
在引號內的換行處就停住了。Track 2 因此完全看不到 `vibe` 與 `sticky` 兩欄。
這是 runbook 缺陷 D1，詳見下方。

**改用完整 CSV 解析（處理引號內換行）重讀。** 這份才是基準：

```bash
# 在 repo 根目錄執行。只讀不寫。--env-file 必須在檔名參數之前。
cat > /tmp/hdr.mjs <<'EOF'
function parseFirstRecord(text) {
  const out = []; let cur = ''; let i = 0; let q = false;
  if (text.charCodeAt(0) === 0xFEFF) i = 1;
  for (; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i+1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else if (c === '\n') { out.push(cur); return out; }
    else if (c !== '\r') cur += c;
  }
  out.push(cur); return out;
}
const t = [["Track 1_history","TRACK_1_CSV_URL"],["Track 2_discussion","TRACK_2_CSV_URL"],["site_tldr","SITE_TLDR_CSV_URL"]];
const res = {};
for (const [name, key] of t) res[name] = parseFirstRecord(await (await fetch(process.env[key])).text());
console.log(JSON.stringify(res, null, 2));
EOF
node --env-file=.env.local /tmp/hdr.mjs
```

完整標題列（`\n` 表示標題格內真的有一個換行字元）：

```json
{
  "Track 1_history": [
    "id(給系統看的編號)",
    "category",
    "year",
    "ruling_id",
    "ruling",
    "content（現有為AI生成）",
    "handwriting（現有為AI生成）",
    "title（現有為AI生成）",
    "image_url（現有為AI生成）",
    "status\n（權限保護）"
  ],
  "Track 2_discussion": [
    "id",
    "category",
    "title",
    "author",
    "year",
    "link",
    "abstract",
    "views",
    "status",
    "owl comment\n(允鍾如果有靈感可以寫一句短評)",
    "vibe",
    "sticky"
  ],
  "site_tldr": [
    "order",
    "label",
    "text",
    "status",
    "link"
  ]
}
```

**標題格內的換行不影響兩支程式。** 兩支都先把連續空白字元壓成一個半形空格
（`sync-content.mjs` 的 `raw.trim().toLowerCase().replace(/\s+/g,' ')`、
`approval-workflow.gs` 的 `normalizeApprovalText_` 加同樣的 `replace`），
壓完的空格是合法分隔符。`status\n（權限保護）` 兩支都解析成 `status`。實測已確認（下方第三節）。

### 二、票內兩項已知不符的裁決

| 票內的說法 | 實測結果 |
|---|---|
| `Track 1_history` 缺 `chapter` | **成立。** 現況 10 欄，沒有 `chapter` |
| `Track 2_discussion` 的標題是 `owl comment`（空格） | **成立，但票內的字串寫錯。** 欄名部分確實是空格（`owl comment`），但接在後面的不是空格加括號，是**換行**加括號 |
| 三個分頁都沒有 `reject_reason` | **成立。** 三個分頁都沒有 |

**另外查出兩項票內沒有記載的不符**，兩者都會擋住部署：

1. **`approved_by` 與 `approved_at` 在三個分頁都不存在。** 票內步驟 3 的表寫
   `Track 1_history` 與 `Track 2_discussion`「已有 `status`、`approved_by`、`approved_at`」。
   實測三個分頁的八個審核欄位**只有 `status` 存在**，其餘七個全部要新建。
2. **`Track 2_discussion` 還缺 `owl_depth_comment` 與 `full_content`。**
   `approval-workflow.gs:6` 的 `APPROVAL_FIELDS['Track 2_discussion']` 是 13 個欄位，
   包含這兩個；`resolveApprovalHeaders_` 對缺漏一律 throw。
   **票內的 runbook 完全沒有這一步。照票內步驟 1-3 做完，步驟 4 在 Track 2 仍然會失敗。**

### 三、校正後的欄位表（以實測標題列為依據）

**`Track 1_history`** — 現況 10 欄，要新建 8 欄。

| # | 現況標題（逐字） | 解析成 |
|---|---|---|
| 1 | `id(給系統看的編號)` | `id` |
| 2 | `category` | `category` |
| 3 | `year` | `year` |
| 4 | `ruling_id` | `ruling_id` |
| 5 | `ruling` | `ruling` |
| 6 | `content（現有為AI生成）` | `content` |
| 7 | `handwriting（現有為AI生成）` | `handwriting` |
| 8 | `title（現有為AI生成）` | `title` |
| 9 | `image_url（現有為AI生成）` | `image_url` |
| 10 | `status`＋換行＋`（權限保護）` | `status` ✅ 八個審核欄位中唯一已存在的 |

要新建：`chapter`（內容欄）、`review_decision`、`review_fingerprint`、`approved_by`、
`approved_at`、`approved_fingerprint`、`reject_reason`、`current_fingerprint`。

**`Track 2_discussion`** — 現況 12 欄，要新建 9 欄，另有 1 次改名。

| # | 現況標題（逐字） | 解析成 |
|---|---|---|
| 1-8 | `id`／`category`／`title`／`author`／`year`／`link`／`abstract`／`views` | 同名 |
| 9 | `status` | `status` ✅ 已存在 |
| 10 | `owl comment`＋換行＋`(允鍾如果有靈感可以寫一句短評)` | ⚠️ Apps Script 解析不到，要改名 |
| 11 | `vibe` | `vibe` |
| 12 | `sticky` | `sticky` |

要新建：`owl_depth_comment`、`full_content`（兩個內容欄）、`review_decision`、
`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、
`reject_reason`、`current_fingerprint`。

**`site_tldr`** — 現況 5 欄（`order`／`label`／`text`／`status`／`link`，與 `TODO.md` 的 P1-5「附帶問題已解決」的記錄相符），
要新建 7 欄：`review_decision`、`review_fingerprint`、`approved_by`、`approved_at`、
`approved_fingerprint`、`reject_reason`、`current_fingerprint`。

**合計要手動建立 24 欄**（8＋9＋7），另加 1 次改名。票內步驟 3 的表算出的是 17 欄，少算 7 欄。

#### 新欄要插在哪個位置

**全部附加在最右側，不要插入到現有欄位之間。** 兩支程式都以標題解析欄位，欄序不影響輸出
（已實測，見第五節 fixE）。附加避免了插入時錯位的風險。

**但新欄的排列順序會影響步驟 6 要設幾個保護範圍。** 建議順序（每個分頁都一樣）：

```
（現有欄位保持不動）
→ 新增的內容欄        Track 1：chapter／Track 2：owl_depth_comment、full_content／site_tldr：無
→ review_decision
→ review_fingerprint
→ approved_by
→ approved_at
→ approved_fingerprint
→ reject_reason
→ current_fingerprint   ← 放最後一欄
```

這個順序讓六個「責任編輯可寫」的欄位連成一段，保護範圍從 15 個降到 12 個。
若照票內 `APPROVAL_COLUMNS` 的順序建（`current_fingerprint` 在 `reject_reason` 之前），
`reject_reason` 會被切開，每個分頁多一個範圍。兩種順序的輸出都實測過，逐字相同。

**標題字串沿用票內步驟 3 的建議值**（已再次實測同時通過兩支程式）。
唯一要補的三個內容欄標題：

| 欄名 | 標題輸入 |
|---|---|
| `chapter` | `chapter （目前全部空白）` |
| `owl_depth_comment` | `owl_depth_comment （新建，全部留白）` |
| `full_content` | `full_content （新建，全部留白）` |

**⚠️ 不要新增第二個 `status` 欄。** `Track 1_history` 現有的
`status`＋換行＋`（權限保護）` 已經被解析成 `status`。再加一個會觸發
`欄位「status」重複。`（`approval-workflow.gs`）與 main 同步的重複欄位中止。

### 四、以實測標題重跑 `resolveApprovalHeaders_`

手法同證據 1：以 stub 取代 Google 端全域物件，用 `node:vm` 載入
`.worktrees/spacedock-ensign-040-approval-content-version-binding/scripts/apps-script/approval-workflow.gs`
原始碼，呼叫 `resolveApprovalHeaders_`。差別是**餵入 2026-09-24 實測到的真實標題字串**，
不是記錄中的推測值。

| 階段 | `Track 1_history` | `Track 2_discussion` | `site_tldr` |
|---|---|---|---|
| A　現況 | ⛔ `缺少欄位「chapter」。` | ⛔ `缺少欄位「owl_comment」。` | ⛔ `缺少欄位「review_decision」。` |
| B　套用票內步驟 1、2 後 | ⛔ `缺少欄位「review_decision」。` | ⛔ `缺少欄位「owl_depth_comment」。` | ⛔ `缺少欄位「review_decision」。` |
| C　再加七個審核欄後 | ✅ 解析 18 欄 | ⛔ `缺少欄位「owl_depth_comment」。` | ✅ 解析 12 欄 |
| D　Track 2 再補 `owl_depth_comment`、`full_content` | — | ✅ 解析 21 欄 | — |

**階段 C 的 Track 2 是本輪最重要的發現。** 照票內 runbook 一步一步做完步驟 1、2、3，
`Track 2_discussion` 的「安裝／更新公式」**仍然會報錯**。
證據 1 的 Track 2 之所以顯示 ✅ 21 欄，是因為它餵入的標題列已經含
`owl_depth_comment` 與 `full_content`——那份輸入取自 `design.md` 的設計意圖，不是現況。
這正是步驟 0 條文「不要憑文件推測」要擋的情況。

補完後 `Track 1_history` 18 欄、`Track 2_discussion` 21 欄、`site_tldr` 12 欄，
與證據 1 的欄數一致。

### 五、複驗證據 3：新增空白欄不改變同步輸出

2026-09-07 的量測仍然成立，而且本輪驗的範圍比當時更大。

手法：把三個分頁的現況 CSV 抓成本機快照，架一台本機 HTTP server 供應四組 fixture，
分別用 **main 現行的 `scripts/sync-content.mjs`**（取自 `git show main:`，複製到暫存目錄執行，
不碰 repo 的 `src/data/`）與 **040 worktree 的新版**跑。fixture 一律經過同一套
CSV round-trip，所以唯一變數是新增的欄位。

| fixture | 內容 | 用哪支同步 | 結果 |
|---|---|---|---|
| `fixRaw` | 現況原始位元組 | main | exit 0 |
| `fixA` | 現況（round-trip，不加欄） | main | exit 0 |
| `fixA2` | 現況 + 空白 `chapter`、`owl_depth_comment`、`full_content` | main | exit 0 |
| `fixD` | 完整部署後（24 欄全建、59 列填入真實指紋） | 040 新版 | exit 0 |
| `fixE` | 同 `fixD`，但新欄改用建議排序 | 040 新版 | exit 0 |
| `fixS` | **下方第八節 S2／S4 的實際建欄順序**，24 欄全建、59 列填入真實指紋 | 040 新版 | exit 0 |

六組的 `history.json` 與 `discussions.json` sha256 **完全相同**，且等於 repo 現況：

```
4d1992e3a5fbb21e13a7324ad9ca573fda48ac7d8209fb7a1c67da57047cea3b  history.json
4071978a7ad0b3d041f7cf0df5d5cf580db9e1c6b47df657819e698b213d3162  discussions.json
```

這兩個值與 AC-1 綁定的 2026-09-07 量測值逐字相同——**正式試算表的已發布內容在這段期間沒有變動。**

`fixD` 的指紋不是手填的。它用 040 的 `scripts/content-fingerprint.mjs` 的
`fingerprintPublishedRow` 逐列算出，Track 2 的 `__sequence` 用
`sync-content.mjs:392` 的 `publishedRowSequences` 同語意重算。
040 新版同步對 `fixD` 印出的是：

```
✅ 檢查通過，已寫入 src/data/history.json（40 筆）
✅ 檢查通過，已寫入 src/data/discussions.json（16 筆，含 tldr）
```

**AC-2 要求逐字出現的 40 與 16 兩個數字，已在實測中出現。**
這也證明 AC-1／AC-2 的驗收手法在真實資料上可執行，不只在 fixture 上成立。

#### `sync-content.mjs` 的 alias 表（實讀，非轉述）

`git show main:scripts/sync-content.mjs` 第 112 行逐字為：

```js
  { field: 'owl_comment', aliases: ['owl comment', 'owl_comment'], column: 'optional', value: 'optional' },
```

**兩種寫法都收，票內的說法成立。** 040 worktree 的版本同樣是這兩個 alias。
所以步驟 2 的改名對同步程式沒有影響，只是為了讓 Apps Script 解析得到。

同時實讀到一項票內沒提的事實：main 現行版本的 `approved_by`、`approved_at`、`reject_reason`
在 `TRACK_1_COLUMNS` 與 `TRACK_2_COLUMNS` 裡是 `column: 'optional'`（第 97-99、117-119 行），
但 `SITE_TLDR_COLUMNS`（第 123-129 行）**完全沒有這三欄**。這造就了下一節的安全前綴。

### 六、產線全停窗口的實測大小

#### 窗口不必從步驟 1 就打開

證據 2 的結論是「窗口從建欄那一刻就打開」。**實測顯示這個結論過度概括。**
有 9 欄可以先建，main 現行的同步仍然 exit 0，而且輸出逐字不變：

| fixture | 做了什麼 | main 現行同步 |
|---|---|---|
| `fixB1` | 步驟 1、2 + Track 2 補 `owl_depth_comment`、`full_content` | ✅ exit 0，輸出與 baseline 逐字相同 |
| `fixB2` | `fixB1` 再加 Track 1／2 的 `approved_by`、`approved_at`、`reject_reason` | ✅ exit 0，輸出與 baseline 逐字相同 |
| `fixB3` | 八欄全建（三個分頁） | ⛔ exit 1，`第 12 欄的標題「review_decision …」對不到任何預期欄位。` |
| `fixB4` | Track 1／2 停在 `fixB1`，只有 `site_tldr` 建審核欄 | ⛔ exit 1，`第 6 欄的標題「review_decision …」對不到任何預期欄位。` |

原因見第五節末：main 認得 `approved_by`／`approved_at`／`reject_reason`（Track 1／2），
不認得 `review_decision`／`review_fingerprint`／`approved_fingerprint`／`current_fingerprint`；
`site_tldr` 三欄都不認得，所以 `site_tldr` 的任何一個審核欄都在窗口內。

**因此 24 欄分成兩段：**

| 段 | 欄數 | 內容 | main 同步 |
|---|---|---|---|
| 安全前綴 | **9** | Track 1：`chapter`、`approved_by`、`approved_at`、`reject_reason`（4）<br>Track 2：`owl_depth_comment`、`full_content`、`approved_by`、`approved_at`、`reject_reason`（5）＋改名 1 次<br>`site_tldr`：0 | 仍可用 |
| 窗口內 | **15** | Track 1：`review_decision`、`review_fingerprint`、`approved_fingerprint`、`current_fingerprint`（4）<br>Track 2：同 4 欄<br>`site_tldr`：全部 7 欄 | 一建就中止 |

安全前綴可以分幾天慢慢做，做錯了也可以改，產線照常。**窗口只涵蓋 15 欄。**

#### 逐列重新核可的實際列數

從現況資料實測（讀 `status` 欄，以 Node `Map` 計數，未使用 `sort`／`uniq`）：

| 分頁 | 非空白資料列 | `status` = `Approved` | `status` 空白 |
|---|---|---|---|
| `Track 1_history` | 42 | **40** | 2（`h2`、`h28`） |
| `Track 2_discussion` | 43 | **15** | 28（`d3`、`d18`–`d44`） |
| `site_tldr` | 4 | **4** | 0 |
| **合計** | 89 | **59** | 30 |

**59 列，與票內的數字相符。** 票內是從 `src/data/*.json` 的筆數推算，本輪是從試算表的
`status` 欄直接數，兩邊一致。

`editor-onboarding.md:434` 的「這一輪重新核可的工作量比原設計預估的大」**不是指列數變多**。
該句的主詞是「編輯權限已經開出去」——工作量變大的是**協調成本**：
窗口期間有 30 列草稿在編輯台手上可以隨時改。任何人改到那 59 列中任一列的發布內容，
該列的指紋就變了，核可要重做（`approval-workflow.gs` 會報
`審核期間內容已變更。所有審核欄位已復原。`）。

#### Track 2 的序號暴露面（票內未量化）

`Track 2_discussion` 的指紋含已發布列序號。實測序號分布：

- 15 個 `Approved` 列在試算表的第 2-17 列，序號 1-16。
- **只有 1 列**未核可的草稿夾在其中：第 4 列（`d3`）。刪掉它，其後 13 列（第 5-17 列）的指紋全變。
- 其餘 27 列草稿（`d18`–`d44`）全部在第 17 列之後。**在它們身上增刪不影響已核可列的序號。**

所以 Track 2 的順序陷阱只有一個具體風險點：**第 4 列（`d3`）在窗口結束前不可刪除或搬移。**
在最後一列之後新增草稿是安全的。

#### 步驟 6 要設幾個保護範圍

Google 試算表的一個保護範圍只能是一段連續範圍。範圍數由欄位是否相鄰決定，
以下 A1 位置由 fixture 的標題列程式算出：

| 排序 | `Track 1_history` | `Track 2_discussion` | `site_tldr` | 合計 |
|---|---|---|---|---|
| **建議排序**（`current_fingerprint` 放最後） | A 類 2（`J2:J`＋`R2:R`）／B 類 1（`L2:Q`）／C 類 1（`A1:R1`）＝ **4** | A 類 2（`I2:I`＋`U2:U`）／B 類 1（`O2:T`）／C 類 1（`A1:U1`）＝ **4** | A 類 2（`D2:D`＋`L2:L`）／B 類 1（`F2:K`）／C 類 1（`A1:L1`）＝ **4** | **12** |
| 票內 `APPROVAL_COLUMNS` 排序 | 5 | 5 | 5 | 15 |

A／B／C 三類的定義同票內步驟 6。`status` 已在原位，與 `current_fingerprint` 不可能相鄰，
所以 A 類每個分頁固定是 2 個範圍。

#### 窗口時間估算

**這是依動作次數推算的估計值，不是實測的牆鐘時間。** 本輪沒有對試算表做任何寫入，
所以無法量測 captain 在 Google 試算表 UI 上的實際速度。下表列出動作次數，
單位時間是保守假設，captain 可自行替換。

| 步驟 | 動作次數（實測） | 單位時間（假設） | 小計 |
|---|---|---|---|
| 3′　建窗口內的 15 欄 | 15 欄 | 1-2 分／欄 | 15-30 分 |
| 4′　安裝 Apps Script + 授權 | 1 次貼程式 + 1 次授權 + 3 次「安裝／更新公式」 | — | 10-20 分 |
| 5′　確認公式生效 | 3 個分頁各看一次 | 2 分／分頁 | 5-10 分 |
| 6′　設保護範圍 | 12 個範圍 | 2-3 分／範圍 | 25-35 分 |
| 7′　逐列重新核可 | 59 列，分 6 段連續選取（Track 1 跳過 `h2`、`h28` 分 3 段；Track 2 跳過 `d3` 分 2 段；`site_tldr` 1 段） | 2-3 分／段 | 15-20 分 |
| 8′　不落地驗證同步 | 1 次（工程執行） | — | 5 分 |
| **合計** | | | **75-120 分** |

**結論：請預留一段不受打擾的 2 小時。** 若把「中途發現某一欄打錯、要回頭對名字」
也算進去，預留 3 小時比較安全。

**這段時間內的兩個硬條件：**

1. **不可發布任何內容。** main 的 `npm run sync-content` 從建第一個窗口內欄位起就會中止。
2. **編輯台不可改動那 59 列的發布內容。** 改了就要重新核可該列。
   草稿列（`h2`、`h28`、`d18`–`d44`）可以改，但 `d3` 不可刪除或搬移（見上方序號暴露面）。

安全前綴的 9 欄不在這段時間內，可以事先分次完成。

### 七、runbook 缺陷（獨立列出）

**D1（擋住步驟 0 本身）步驟 0 的指令會靜默截斷標題列。**
`split(/\r?\n/)[0]` 不處理引號內的換行。Track 1 的 `status` 與 Track 2 的 `owl comment`
標題格都含換行，所以 Track 1 只印到第 10 欄的一半、Track 2 只印到第 10 欄的一半，
`vibe` 與 `sticky` 完全看不到。**它不報錯，它少印。**
照這份輸出填步驟 3 的欄位表，一定算錯。修法見第一節的完整解析版指令。

**D2（擋住步驟 3）步驟 3 的欄位表把 `approved_by`、`approved_at` 記成「已有」。**
實測三個分頁都沒有這兩欄。票內算出 Track 1／2 各新增 5 欄、`site_tldr` 新增 7 欄，共 17 欄；
實際要新增 24 欄。

**D3（擋住步驟 4，順序有誤）步驟 3 少了 Track 2 的 `owl_depth_comment` 與 `full_content`。**
這兩欄不是審核欄位，是 `APPROVAL_FIELDS['Track 2_discussion']` 的內容欄位，
`resolveApprovalHeaders_` 要求它們存在。**照票內步驟 1-3 做完，步驟 4 在 Track 2 必定失敗**，
錯誤訊息是 `缺少欄位「owl_depth_comment」。`。第四節階段 C 已實測。
修法：把這兩欄併入建欄那一步（它們在安全前綴內，可事先建）。

**D4（窗口估算過大）證據 2 的「窗口從建欄那一刻就打開」過度概括。**
實測有 9 欄的安全前綴，建了之後 main 同步仍 exit 0 且輸出逐字不變。
窗口只涵蓋 15 欄。第六節有分段表。

**D5（會讓 captain 找不到字串）步驟 2 的「改前」字串寫錯。**
票內寫 `owl comment (允鍾如果有靈感可以寫一句短評)`，是空格接括號。
實際是 `owl comment` + **換行** + `(允鍾如果有靈感可以寫一句短評)`。
captain 若用「尋找並取代」搜票內那個字串會找不到。
**正確做法：只改「owl」與「comment」之間那一個空格，換成底線。其餘一個字都不要動**
（包含那個換行）。

**D6（影響步驟 6 的工作量）步驟 6 沒說明保護範圍的數量取決於欄位排列順序。**
建議排序 12 個，票內排序 15 個。第三節有建議排序。

**沒有任何一步在現況下做不到。** D1-D6 都是「照票內做會失敗或多做」，不是「無法完成」。
套用上述修正後，步驟 1-9 全部可執行。

### 八、校正後的步驟 1-7

> ⚠️ **這一節是 captain 實際照著做的那一節。** 下面的 🔒 規則在這裡不是形式——
> **本節的每一句「目前是…」「還沒…」都會在 captain 動手的下一刻過期。**

> 🔒 **本票的寫作規則（captain 2026-09-25 親自授權，全票適用，不限節次）**
>
> **票內不得斷言「部署現在做到哪裡」這種會自己過期的事實。** 需要記錄現況時二擇一：
> **(a)** 明寫 UTC 量測時戳並寫明那是歷史讀數，或
> **(b)** **只留可重跑的指令，不留當時的輸出**。
> **指令永遠為真，輸出十分鐘後可能就假了。**
>
> **單調／非單調判準**：「**已完成 X**」單調、不會過期，不必標時戳；
> 會翻面的是「**仍是**」「**尚未**」「**待補**」「**還沒**」「**目前仍**」。
>
> **引用版本一律釘 SHA，不得使用 `HEAD`、`main` 等移動引用**——
> **移動引用是非單調的，寫下的瞬間就開始過期。**
> （`main`／`HEAD` 出現在**指令**裡沒問題，只要把它解析出來的 SHA 一併印在旁邊；
> 不可以的是拿它當**量測標籤**，例如「某值在 HEAD 是 12」。）
>
> **這條規則為什麼出現在這一節**（reviewer cycle 6 收出的判準，逐字寫進票內）：
>
> > **斷根規則寫在處置節裡，擋不住操作節與交付節。**
> > **規則要放在「會被讀到的那一節」，而不是放在「記錄它的那一節」。**
>
> 第一次入票時規則只寫在第十六節與第十七節（兩節都是**處置節**），
> `## Documentation impact` 因此完全沒被掃到，同一形狀第三次復發。
> **覆蓋清單與掃描方式見第十八節。**
>
> ---
>
> 🔒 **同一條規則的上游版本：寫授權封包與 `### Feedback Cycles` 的人也受約束**
> （FO 提出，經 reviewer cycle 6 收緊後採用；逐字寫在這裡是因為
> **worker 會把授權封包的字逐字抄進票內**——K18 就是這樣被放大成五處的）。
>
> > 在**授權封包**與 **`### Feedback Cycles`** 寫下任何**非單調**狀態宣稱或數量詞之前，
> > **先跑一條列舉型指令，再依輸出寫結論**；票內**只留那一行指令**；
> > 需要留結果時**同時標 UTC 時戳並寫明是歷史讀數**；
> > **凡逐字轉寫的值（hash、行號、SHA、數量），封包送出前各自回讀一次。**
>
> **「列舉型」是關鍵字。** K26 的成因是**以確認型指令回答了列舉型問題**——
> 用 `git show <SHA> | grep` 查到「那個 commit 裡沒有」（那是真的）就停手，
> 沒有跑 `git log --oneline <SHA>..HEAD` 去列出後來發生了什麼。
> **確認型指令只能證實你已經想到的事；列舉型指令會告訴你還有什麼。**

取代票內步驟 1-3 與步驟 6 的對應內容。步驟 4、5、7、8、9 的操作方式沿用票內原文，
只是編號與範圍依下表調整。

**下面這份順序已整份實測過**（fixture `fixS`，把 S1-S4 的建欄與改名、S8 的 59 列核可全部套上）：

- `resolveApprovalHeaders_` 三個分頁全通過，解析 18／21／12 欄。
- 040 新版同步 exit 0，印出 `（40 筆）` 與 `（16 筆，含 tldr）`，輸出與 baseline 逐字相同。
- main 現行同步 exit 1（窗口確實打開），錯誤指向第 15 欄 `review_decision`。
- S7 的 12 個保護範圍位置由 `fixS` 的標題列算出，不是手數的。
- S8 的 6 個連續段由 `fixS` 的 `status` 欄算出：第 2 列／第 4-24 列／第 26-43 列、
  第 2-3 列／第 5-17 列、第 2-5 列。

#### 階段一：安全前綴（`captain`，產線照常，可分次做）

**S1　`Track 2_discussion` 改名。** 把第 10 欄標題的 `owl comment` 改成 `owl_comment`。
只動「owl」與「comment」之間那一個空格。**後面的換行與中文說明一個字都不要動。**

**S2　三個分頁附加 9 個安全欄，全部留白。**

| 分頁 | 附加在最右側（依序） |
|---|---|
| `Track 1_history` | `chapter （目前全部空白）`<br>`approved_by （核可者，自動填）`<br>`approved_at （核可時間 UTC，自動填）`<br>`reject_reason （退回原因）` |
| `Track 2_discussion` | `owl_depth_comment （新建，全部留白）`<br>`full_content （新建，全部留白）`<br>`approved_by （核可者，自動填）`<br>`approved_at （核可時間 UTC，自動填）`<br>`reject_reason （退回原因）` |
| `site_tldr` | 無 |

**⚠️ `chapter`、`owl_depth_comment`、`full_content` 三個內容欄在 S9 完成前必須保持全欄留白。**
階段一可以分幾天做，而保護範圍要到 S7 才設——這三欄在這段期間是**編輯台可寫的**。
**沒有任何程式會擋填值**：實測填入非空值，main 的同步仍然 exit 0，
只有輸出的 sha256 會變（`38e662f6…`／`6895ef6b…`）。
填了值，AC-1 的逐字比對就會失敗。請在階段一開始前告知責任編輯不要動這三欄。

> ⚠️ **2026-09-25 更正：最後一句的涵蓋面不足。原句保留。**
>
> 原句只點名**責任編輯一人**。captain 於 **2026-09-25** 打開正式表的「共用」對話框，
> 回報名單是**六人有編輯權限、另三人是檢視者**（來源：captain 口頭回報，票內不記 email）。
> **保護範圍要到 S7 才設**，所以階段一到 S7 之間，這三欄對**那六位編輯者全部可寫**，
> 不是只有責任編輯改得到。
>
> **正確的說法**：階段一開始前，要告知**全部六位編輯者**不要動
> `chapter`、`owl_depth_comment`、`full_content` 這三欄。
> **告知一個人擋不住另外五個人。**
>
> **暴露面是 6 不是 1**，觸發機率跟著放大。
>
> ✅ **2026-09-25 captain 裁決：暫時不通知編輯者。這是「接受風險」，不是「消除風險」。**
>
> - captain 原話：「**暫時不須通知編輯者，他們最近不會開檔案**」。
> - **依據是 captain 對編輯台近期行為的判斷，repo 內無從驗證，也不是已觀察到的保證。**
>   **本票不得把它寫成「那三欄不會被寫入」或任何等價的保證句**——
>   裁決的是「**要不要主動告知**」，不是「風險存不存在」。
> - **升級條件不變**：第八節第 1 條逐字是「**任何人**」對那三欄寫入任何值即升為 Material。
>   captain 沒有動門檻，implement 的 `Deferred risk` 分類也維持不變。
> - **仍在運作的偵測**：FO 的唯讀絆線（AC-6 sandbox 的 sha256 比對）。
>   最近一次量測 **2026-09-25T18:56Z**：exit 0、40 筆／16 筆、兩個 sha256 與 AC-1 綁定值逐字相同
>   ⇒ 三欄當時仍全欄留白。**此為歷史讀數，會過期**；重跑指令見第十六節。
> - **所以現在的防線只剩偵測，沒有預防**：沒有告知、沒有保護範圍（要到 S7 才設）、沒有程式會擋。
>   **一旦絆線響了，那就是 Material，不是 Deferred risk。**
> **風險分類本輪維持 Deferred risk 不變**——升級條件仍是本節下方那兩條，本輪未觀察到觸發
> （截至 `2026-09-25T18:37Z` 量測，兩個 sha256 仍等於 AC-1 的綁定值，即三欄仍全欄留白；
> 該量測會過期，要現況請跑第十六節的指令二）。
> **完整的四欄證據、分類與處置建議見第十七節的「追加」一節**——
> 依 `## Review-finding disposition` 第 2 條，worker 提出分類與建議，**不代 captain 裁決**。

**S3 之前先設一次 `REPO`。** 票內的 `$REPO` 只在步驟 8 的區塊裡賦值，
而步驟 8 屬於**階段二**；S3 在階段一就要用它，AC-6 的 sandbox 指令也要用它。
工程在自己的 shell 先跑這一行：

```bash
REPO="/Users/ipa/Documents/ipa Document/00_Claude spacedock folder/30 Public Writing/Constitution"
```

沒設也不會假通過——實跑確認三個方向都大聲失敗（`git -C ""` exit 128、
`node --env-file=""` exit 9、sha256 比對印 ⛔）。**但那是白花時間。**

**S3　工程確認產線還活著。** 用 AC-6 的 sandbox 手法跑 main 的同步，必須 exit 0，
且輸出的兩個 sha256 仍是 `4d1992e3…cea3b` 與 `4071978a…3162`。
**這一關沒過就不要進階段二。**

**AC-6 那段 `grep` 在 S3 會印 ⛔，那是對的。** 它是給窗口打開之後用的，
階段一還沒有任何窗口內欄位，本來就不該出現標題錯誤。S3 只看 exit code 與 sha256。

此時 main 成功會把兩個 JSON 寫進 `$SANDBOX/src/data/`（不是 repo），所以可以直接比：

```bash
shasum -a 256 "$SANDBOX/src/data/history.json" "$SANDBOX/src/data/discussions.json"
diff "$REPO/src/data/history.json" "$SANDBOX/src/data/history.json"
diff "$REPO/src/data/discussions.json" "$SANDBOX/src/data/discussions.json"
```

**sha256 不符時怎麼辦。** 先跑下面兩項**機器可判**的檢查，再看 `diff`。

**⚠️ 不要只看 `diff` 落在哪裡就決定重量 baseline。** 部署時誤刪一列已核可的列，
`diff` 也會完全落在「那 59 列的發布內容」之內，main 還是 exit 0——
光看 exit code 與 diff 位置，**誤刪與合法填值長得一樣**（實測見第十節）。

**檢查①　筆數。** main 印出的兩行必須逐字仍是：

```
✅ 檢查通過，已寫入 src/data/history.json（40 筆）
✅ 檢查通過，已寫入 src/data/discussions.json（16 筆，含 tldr）
```

**檢查②　id 清單。** 把 AC-3 的比對指令提前跑一次，`OUT` 指向沙箱：

```bash
REPO="$REPO" OUT="$SANDBOX/src/data" node -e '
const fs=require("fs");
const ids=p=>JSON.parse(fs.readFileSync(p,"utf8")).map(r=>r.id);
for (const f of ["history.json","discussions.json"]) {
  const a=ids(`${process.env.REPO}/src/data/${f}`), b=ids(`${process.env.OUT}/${f}`);
  console.log(f, JSON.stringify(a)===JSON.stringify(b) ? "✅ id 清單一致"
    : "⛔ 少了:"+JSON.stringify(a.filter(x=>!b.includes(x)))+" 多了:"+JSON.stringify(b.filter(x=>!a.includes(x))));
}'
```

兩行都必須是 `✅ id 清單一致`。**這是 AC-3 的指令原樣提前跑，不是另一套判準。**

分辨表：

| 分辨方式 | 判定 | 處置 |
|---|---|---|
| main 同步 exit 0、**檢查①與②都通過**，且 `diff` **只**落在那 59 列的發布內容（**不含那三個內容欄**——那三欄見下方 ⚠️），且編輯台確認是有人正常填稿 | **編輯合法填值** | **重新量 baseline。** 把新的兩個 sha256 更新進 AC-1 的綁定值，在 AC-1 旁註明新值、量測日期與換基準的原因，然後繼續階段二 |
| main 同步 exit 0，但**檢查①或②沒通過**（筆數不是 40／16，或 id 比對印出「少了」「多了」） | **有列掉了或被換掉** | 停住。**絕對不要重量 baseline**——那會把掉掉的那一列一起烤進新基準，之後 AC-1 反而會通過，最壞情況是少一筆內容靜默上線。先照 id 比對印出的那個 `id` 把列找回來（Google 試算表的版本記錄） |
| main 同步轉為 exit 1，或 `diff` 落在沒人動過的欄位 | **部署副作用** | 停住。回頭查 S1／S2 是否改到欄位位置、刪到列、或在新欄填了值。**不要重量 baseline** |

> ⚠️ **2026-09-25 更正（B-1）：`diff` 落在那三個內容欄時，處置與上表第一列相反。原句保留於本框末。**
>
> | 分辨方式 | 判定 | 處置 |
> |---|---|---|
> | `diff` 落在 `chapter`／`owl_depth_comment`／`full_content` **任何一欄** | **有人動了必須留白的欄** | **停住。⛔ 絕對不要重量 baseline。** 找出那一格、清空它、重跑一次確認兩個 sha256 回到 `4d1992e3…cea3b`／`4071978a…3162`，然後才繼續階段二 |
>
> **為什麼相反**：S2 明令那三欄在 **S9 完成前必須保持全欄留白**。
> 對這三欄而言，上表第一列的第三個條件「**編輯台確認是有人正常填稿**」**不可能為真**——
> **沒有任何人應該在那裡填任何東西。**
> 照第一列重量 baseline，等於**把不該存在的值烤進新基準**，
> 之後 AC-1 反而會通過——**與第二列「絕對不要重量 baseline」要防的是同一種傷害。**
>
> **原句保留**（上表第一列的分辨方式原文）：
>
> > `diff` 只落在**那三個內容欄**或那 59 列的發布內容，且編輯台確認是有人正常填稿
>
> **錯在哪**：它把「那三個內容欄」與「那 59 列的發布內容」並列，
> 但**兩者的正確處置剛好相反**——後者填值是合法的日常編輯，前者填值是必須清掉的違規。
> 第三個人工條件擋得住一個仔細的讀者，**但一張分辨表的用途就是讓人不必每次重新推理。**
>
> **來源**：本票 implement 於 cycle 10 追加時自行提出，reviewer（cycle 6）獨立確認無異議，
> FO 於 cycle 11 授權 `fix` 並**僅就這一列**解除 S3 的逐位元組凍結。
> 分類 **`Deferred risk`**（需要「有人填值」＋「誤答第三個條件」兩步才會踩到），未自行升級。

**為什麼兩項要一起看。** 只看筆數擋不住「刪一列又新增一列」——筆數仍是 40，
但 id 比對會印出 `⛔ 少了:["h1"] 多了:["h99"]`。兩項合起來在四個實測情境下全部判對（第十節）。

**重量 baseline 不等於放寬 AC-1。** AC-1 的判準不變（部署前後逐字相同），
變的只是「部署前」那個基準的量測時點。重量之後，S9 仍然必須逐字相同。
**只有 captain 能改 AC 的要求**；工程在這裡做的是更新一個量測值，不是改判準。

**這一段何時升級為 Material**：兩個條件各自獨立，任一成立就升級。

1. 任何人在階段一對 `chapter`、`owl_depth_comment`、`full_content`
   或那 59 列的發布內容寫入任何值。在那之前它是 deferred risk——2026-09-24 重量 baseline 仍未漂移。
2. **S3 真的出現 sha256 不符，而工程在未跑檢查①②的情況下重量 baseline。**
   這一條需要「先誤刪、再誤判」兩步才成立，所以現在仍是 deferred risk；
   但它一旦發生就直接打穿 AC-1 與 AC-2，因為新基準會把錯誤內容當成正確。

#### 階段二：窗口（`captain` + `工程`，一氣呵成，預留 2 小時）

⚠️ **從 S4 的第一欄建起，main 的 `npm run sync-content` 就會中止，直到步驟 9 合併 040。**

**S4　三個分頁附加 15 個窗口內欄位，全部留白。** 每個分頁依序附加：

```
review_decision （由 Review 選單寫入）
review_fingerprint （由 Review 選單寫入）
approved_fingerprint （由 Review 選單寫入）
current_fingerprint （公式自動產生，不要手動填）
```

`site_tldr` 另外還要補階段一沒建的三欄，**插在上面四欄之前**，讓可寫區連續：

```
review_decision （由 Review 選單寫入）
review_fingerprint （由 Review 選單寫入）
approved_by （核可者，自動填）
approved_at （核可時間 UTC，自動填）
approved_fingerprint （由 Review 選單寫入）
reject_reason （退回原因）
current_fingerprint （公式自動產生，不要手動填）
```

建完的標題數必須是 `Track 1_history` 18 欄、`Track 2_discussion` 21 欄、`site_tldr` 12 欄。
**數字不對就是漏建或多建，回頭對。** 硬規則同票內步驟 3：欄名不可重複、不要複製整欄備份、
新欄全部留白。**另外不要新增第二個 `status` 欄**（見第三節）。

**S5 之前：確認三個分頁名稱。** 開正式試算表，逐一看底部分頁標籤。名稱必須逐字為：

```
Track 1_history
Track 2_discussion
site_tldr
```

**大小寫、底線、空格皆須相同。** 不符的分頁先改名，再進 S5。

- **理由**：`approval-workflow.gs:159`（釘在 `a51b5d9`）逐字比對這三個名稱，不符就中止並跳 `這個分頁不支援核可公式。`。
  `.gs` 內會因名稱不符而中止的只有這一行，而 `.gs` 要到 S5 才第一次在正式表上執行。
  sync 不查名稱：它以 `.env.local` 的 CSV URL 讀取（`site_tldr` 那一條帶 `gid=310949254`），
  `grep -c "getSheetByName\|SpreadsheetApp" scripts/sync-content.mjs` 在 `b05efba` 與 `a51b5d9` 皆為 0。
  **所以 S1-S4 全部通過，也不代表名稱正確。**
- **改名安全性**：gid 不隨改名變動。改名不影響 sync 的讀取路徑。
- **已發生過一次**：2026-09-25 第三個分頁的名稱是 `Site_TLDR`（來源：captain 口頭回報），S5 因此失敗。見票內步驟 4 的錯誤對照。

**S5　安裝 Apps Script。** 照票內步驟 4 原文。三個分頁各執行一次「安裝／更新公式」。

**S6　確認公式生效。** 照票內步驟 5 原文。

**S7　設 12 個保護範圍。** 三類的定義同票內步驟 6。依 S2／S4 的排序，範圍是：

| 分頁 | A 類（只有 captain） | B 類（只有責任編輯） | C 類（只有 captain） |
|---|---|---|---|
| `Track 1_history` | `J2:J`、`R2:R` | `L2:Q` | `A1:R1` |
| `Track 2_discussion` | `I2:I`、`U2:U` | `O2:T` | `A1:U1` |
| `site_tldr` | `D2:D`、`L2:L` | `F2:K` | `A1:L1` |

**設之前先核對一次欄位位置。** 上表的 A1 位置是依 S2／S4 的排序算出的。
若實際建欄順序與上表不同，範圍要重算——**設錯範圍等於沒設**。

##### S7-a　權限模式：必須選「限制」，不可選「顯示警告」

**不可選「編輯這個範圍時顯示警告」。** 每個範圍的權限設定畫面都會問一次。
12 個範圍全部選「限制可編輯此範圍的使用者」，再依類別選允許名單：

| 類別 | 範圍數 | 選哪一項 |
|---|---|---|
| A　公式欄 | 6 | 限制 →「只有你」 |
| B　審核欄 | 3 | 限制 →「自訂」→ 只勾責任編輯。擁有者本來就改得動，不必另勾 |
| C　標題列 | 3 | 限制 →「只有你」 |

**B 類不可選「只有你」。** 步驟 6 的理由：Review 選單以執行者身分寫入，執行者沒有權限就會被擋。
B 類選「只有你」，責任編輯就不在允許名單內，部署後他執行 `Review → 核可選取列` 會被擋。

**選錯的後果不是「保護較弱」，是「完全沒有保護，而且看起來有」。**
警告模式擋不住任何人——對方按一下「確定」就能改。
`044` 的步驟 6 把這個選擇標為 ⚠️，原句是：

> ⚠️ **一定要選「限制可編輯此範圍的使用者」，不可選「編輯這個範圍時顯示警告」。**
> 警告模式擋不住任何人。B 按一下「確定」就能改，而且 P2 會得到假通過。

**這就是 `044` 的 P2 假通過的成因。** 12 個範圍每一個都要確認一次。

> ⚠️ **2026-09-28 更正：本小節原句與步驟 6 的類別表矛盾。原句逐字引述於下。**
> 原句：「每個範圍的權限設定畫面都會問一次。**必須選『限制可編輯此範圍的使用者』→『只有你』。**」
> 步驟 6 的類別表把 B 類定為「只有責任編輯」。照原句字面設定 B 類，責任編輯會被擋在外面。
> AC-7／S7-d 會在 S8 之前抓到這個錯，但 captain 要先照票做錯，再回頭重設 3 個範圍。
> 原句中「限制」、不可選「顯示警告」這兩點正確，保留在上方。錯的只有「每個範圍都選『只有你』」。

##### S7-b　行為驗收：設定畫面不是驗收標準，行為才是

**這一格不是選配。** `044` 在一張七列、三分頁、由 captain 親手設定的測試表上，
**只有兩欄真正受保護，其餘設定看起來正確但未生效**，一直到準備後續步驟時清查才發現。
正式表是 59 列、已開放多位協作者，**漏設的機會更大而不是更小**。

**直接採用 `044` 步驟 6 追加補述的那份檢查表**（那是實測過、而且是抓出假通過的那一份），
欄位與類別逐項照抄，只把 A1 位置換成本票 S2／S4 排序算出的位置：

| # | 欄位 | 類別 | `Track 1_history` | `Track 2_discussion` | `site_tldr` | 預期 |
|---|---|---|---|---|---|---|
| 1 | 標題列 | C | `A1` | `A1` | `A1` | 擋 |
| 2 | `status` | A | `J2` | `I2` | `D2` | 擋 |
| 3 | `current_fingerprint` | A | `R2` | `U2` | `L2` | 擋 |
| 4 | `review_decision` | B | `O2` | `R2` | `F2` | 擋 |
| 5 | `review_fingerprint` | B | `P2` | `S2` | `G2` | 擋 |
| 6 | `approved_by` | B | `L2` | `O2` | `H2` | 擋 |
| 7 | `approved_at` | B | `M2` | `P2` | `I2` | 擋 |
| 8 | `approved_fingerprint` | B | `Q2` | `T2` | `J2` | 擋 |
| 9 | `reject_reason` | B | `N2` | `Q2` | `K2` | 擋 |
| 10 | **內容欄**（反向對照） | — | `F2`（`content`） | `G2`（`abstract`） | `C2`（`text`） | **可改** |

**10 格 × 3 分頁 ＝ 30 格。** 第 10 列是**反向對照**，用來確認沒有過度保護——
若連內容欄都被擋住，責任編輯就沒辦法工作了。

**怎麼測**：

1. **測試者必須是「投稿者」角色的帳號——不是 captain，也不是責任編輯。**
   這是整格的重點，**角色不能換**，理由見下方「為什麼角色必須是投稿者」。

   - **不能是 captain**：**保護範圍排除不了擁有者**，captain 自己測每一格都會「可改」，測不出任何東西。
   - **不能是責任編輯**：B 類設的是「只有責任編輯」，所以責任編輯**本來就改得動那六欄**。
     用他去測，第 4-9 格會回報「可改」，而上表寫的預期是「擋」。
   - **用 `044` 的那個第二個 Google 帳號**：它在 `044` 裡的角色是**投稿者**
     （`044` 的帳號表：A ＝ 責任編輯／核可者＝測試表擁有者；**B ＝ 投稿者，以「編輯者」身分受邀，不是擁有者**）。
     它不在 A、B、C 任何一類的允許名單內，所以上表 9 格的預期值「擋」對它全部成立。

   **前置：那個帳號目前沒有正式表的權限，要先給它。** `044` 的步驟 15 第 2 點
   已經把它從**測試表**的共用名單移除，而它**從未被加入正式表**。本票原本沒有一句建立這個前置。

   > ✅ **2026-09-25 captain 親自確認：該帳號目前確實不在正式表的共用名單內。原推論句保留。**
   >
   > 上面那句依據的是 `044` 的記載，**那是推論**。captain 於 2026-09-25 打開共用對話框
   > **直接確認**，兩者一致。**推論與確認是兩種強度不同的證據，本票兩者都留。**
   >
   > 三項連帶結論：
   >
   > 1. **「先保護，後邀請」的順序適用，下面的寫法不變**——S7 的 12 個範圍全部設完之後才共用，
   >    權限「編輯者」，不勾「編輯者可以變更權限和共用設定」，**不加進任何一類的允許名單**。
   > 2. **S7-b 的 30 格預期值全部成立。** 該帳號既不在共用名單、也不在 A／B／C 任一類的
   >    允許名單內，所以 9 格「擋」＋1 格「可改」對它成立。**推廣到其他編輯者的理由見本節末。**
   > 3. **編輯者人數會暫時變動：六 → 七 → 六。** captain 2026-09-25 回報正式表目前有**六位編輯者**
   >    （另有三位檢視者）；S7-b 邀請該帳號後暫時變成**七位**；
   >    S7-b／S7-c／S7-d 三者都做完之後的收尾把它移除，回到**六位**。
   >
   > **這三個數字的來源是 captain 的口頭回報，repo 內無從驗證。** 依第九節判準三，
   > 寫下數量詞就要當場跑一次能否證的檢查——我查的是**票內有沒有別的敘述依賴這個人數**：
   >
   > ```bash
   > # 在 050 的 worktree 根目錄執行。只讀本票。
   > grep -nE '六人|六位|六個編輯|七人|七位' docs/constitution-features/050-ssot-approval-deployment.md
   > ```
   >
   > **本輪寫入之前命中 4 處，全部在 `### Feedback Cycles`**（FO 所寫，已記載同一事實）；
   > **本票的操作段落零命中**，所以沒有連帶要校正的地方。
   > 票內既有的「已開放多位協作者／多位學者」**不是數量詞，仍然成立**，不必改。

   - **時機**：S7 的 12 個範圍全部設完之後才共用。
     （`044` 步驟 6 的原則是「**先保護，後邀請**。否則 B 會有一段可以動任何欄位的空窗。」）
   - **做法**：正式表 **共用 → 加入該帳號 → 權限「編輯者」**。
     **不要**勾選「編輯者可以變更權限和共用設定」。
   - **⛔ 不要把它加進 B 類（或任何一類）的允許名單。**
     加進去它就變成責任編輯，這 18 格就測不出東西了。

   **收尾（S7-b 與 S7-c 都做完之後）：把該帳號從正式表的共用名單移除。**
   比照 `044` 步驟 15 第 2 點。**這一步不要忘記**——正式表是 40 筆已上線內容的唯一來源，
   不該留一個只為了測試而開的編輯者。

   > ⚠️ **2026-09-25 更正：收尾時機往後移一格。** 原句寫「S7-b 與 S7-c 都做完之後」，
   > 當時 S7-c 是最後一個用到這個帳號的步驟。captain 於 2026-09-25 授權新增 **S7-d**
   > （反向對照 B，驗 AC-7），而 S7-d 在沒有其他責任編輯帳號時會**借用同一個帳號**。
   > **正確時機是 S7-b、S7-c、S7-d 三者都做完之後。** 原句保留；做法與理由不變。
2. 第 1-9 格：在該格輸入任意字元。**必須跳出 Google 的「您嘗試編輯受保護的儲存格」對話框，且值不變。**
3. 第 10 格：在該格輸入任意字元。**必須輸入成功。**
   **然後立刻 Ctrl+Z 還原，並確認該格回到原本的字串。**
4. 逐格記錄結果（**不記 email，只記角色**）。
   **任何一格與預期不符，回頭補設該範圍，然後把該分頁 10 格全部重測**——
   不是只重測失敗那一格。

##### 為什麼角色必須是投稿者——30 格裡有 18 格的預期值取決於它

**把 30 格按「預期值會不會隨測試者角色改變」分成兩堆：**

| 堆 | 哪幾格 | 每分頁 | 共 | 投稿者 | 責任編輯 |
|---|---|---|---|---|---|
| **與角色無關** | 第 1 格（標題列，C 類）、第 2-3 格（`status`／`current_fingerprint`，A 類）、第 10 格（內容欄，未保護） | 4 | **12** | 擋／擋／擋／可改 | 擋／擋／擋／可改（相同） |
| **⚠️ 取決於角色** | 第 4-9 格（六個審核欄，B 類） | 6 | **18** | **擋** ✅ 與上表相符 | **可改** ⛔ 與上表相反 |

**12 ＋ 18 ＝ 30。** A 類與 C 類設「只有 captain」，投稿者與責任編輯都被擋，所以那三格對兩種角色相同；
第 10 格沒有保護，兩種角色都改得動。**只有 B 類那六格會因為角色而翻面**，
因為 B 類的允許名單裡**就是責任編輯**。

**角色寫反會怎麼假通過——兩條路，兩條都會傷到部署後的責任編輯：**

1. **實際拿責任編輯去測** → 第 4-9 格回報「可改」，與上表的「擋」不符 →
   照第 4 點的指示「回頭補設該範圍」→ **把責任編輯從 B 類允許名單移出去**。
   30 格從此全部「相符」，S7-b 通過，部署繼續。
   **而部署後責任編輯執行 `Review → 核可選取列` 會靜默失敗**——
   沒有錯誤訊息，就是步驟 7「常見錯誤」表最後那一列。
   **captain 自己測不到**（擁有者永遠在允許名單內），所以這個洞會一路撐到有人回報「選單沒反應」。
2. **實際拿投稿者去測，但票上寫成責任編輯** → 18 格正確回報「擋」，
   於是有人把它讀成「**B 類對責任編輯設對了**」。
   **那個結論沒有被證明。** 這 30 格證明的是「投稿者改不到」，
   **不包含「責任編輯改得到」**——B 類就算設成「只有 captain」、或允許名單是空的，
   這 30 格照樣全過。

**所以角色是投稿者這件事，不是一個可以替換的細節，它是上表 18 格預期值的前提。**

> **殘留缺口（本輪不修，寫明給下一位）：S7-b 只驗一個方向。**
> 它驗「投稿者改不到那六欄」，**不驗「責任編輯改得到那六欄」**（上面第 2 條）。
> 要補這個方向，得在 30 格之外加一組「以責任編輯身分測 B 類六欄必須可改」的反向對照——
> **而那 30 格與 30 個 A1 位置已經被 review 逐格驗過，本輪不得改動**；
> 擴大 AC-4 的驗收範圍**依 `## Review-finding disposition` 第 5 條只有 captain 能改**，已送交裁決。
> **在那之前，這個方向的最早偵測點是 S8**：
> 若 S8 由責任編輯執行而選單靜默失敗，就是 B 類把他排除了。
> 本票的 S8 寫的是 captain 執行，所以**照票做不會觸發這個偵測**——缺口是實的，請知道它在。

> ✅ **2026-09-25 裁決：captain 決定「收」，這個缺口已經補上。原框保留。**
> 依 `## Review-finding disposition` 第 5 條，captain 親自行使 AC 變更授權：
> 新增 **AC-7**（反向對照 B：以責任編輯身分驗 B 類六欄必須可改，**6 欄 × 3 分頁 ＝ 18 格**），
> 執行程序為下方新增的 **S7-d**。
> **上面這段話已不再是「本輪不修」的現況**——它記錄的是 2026-09-24 那一輪的處置，依本票慣例保留。
> **那 30 格表與它的 30 個 A1 位置本輪逐位元組未動**；S7-d 的 18 格直接引用該表第 4-9 列。

> **第 3 點的還原要求是本票加的，`044` 沒有。** 原因：`044` 在可丟棄的測試表上做，
> 改壞了無所謂；本票在 40 筆已上線內容的唯一來源上做，
> **反向對照那一格若留著改動，S9 的 AC-1 sha256 就會不符**。
>
> **這一格為什麼此刻是安全的**：S6 完成後所有列的 `status` 都是 `Needs review`，
> **還沒有任何一列被核可**（核可是 S8 的事）。所以此刻改內容不會退回任何核可。
> 這也是 S7-c 必須排在 S8 之前的附帶好處。

> **`044` 實測出的範圍數量與判準**：它原本規劃每分頁 3 類共 9 個範圍，
> 實際設了 11 個，因為「審核欄」六欄不連續、部分分頁要拆成兩段。
> 本票的 12 個是依 S2／S4 排序算出的（六欄連續，所以每分頁 4 個）。
> **但 `044` 的原句要記住：判準是行為，不是數量。**
> 就算數到 12 個範圍，S7-b 的 30 格沒有全過，保護就是沒生效。

##### 為什麼那 30 格不必對六位編輯者逐一重測

**保護範圍是「允許名單」機制：名單內的人可改，名單外的人一律被擋。**
所以用**一個名單外的帳號**測出的「擋」，對**其餘每一個名單外的帳號**同樣成立。
S7-b 的 9 格「擋」因此可以推廣——**不必把六位編輯者一個一個拉來測 30 次。**

**這句話會失敗，失敗的條件寫在這裡**：推廣成立的前提是該範圍的權限模式為
**「限制可編輯此範圍的使用者」**。若某個範圍誤設為**「編輯這個範圍時顯示警告」**，
它就不再是允許名單機制——**任何人按一下「確定」都能改**，
「名單外一律擋」不成立，推廣也隨之不成立。
**而那正是 S7-a 要擋的那一格**，也是 `044` 的 P2 假通過的成因。

**所以順序是：S7-a 先確認 12 個範圍全部是「限制」模式，S7-b 的推廣才站得住。**
兩者是同一條論證的上下游，不是兩件獨立的事。

**推廣的邊界**：它只推廣「**名單外的帳號會被擋**」這一個方向。
**它不推廣「名單內的帳號改得到」**——那是相反方向，由 **AC-7／S7-d** 負責，
而 S7-d 測的是那位實際的責任編輯本人，不是推廣出來的。

##### S7-c　跑 AC-4 與 AC-5（**必須在 S8 之前**）

**S7-b 通過之後、S8 之前，執行 AC-4 與 AC-5。**

**為什麼卡在這裡，而不是放到最後**：S8 之後的每一道檢查都偵測不到「保護未生效」。
S8 的核可會成功、S9 的 sha256 與 `diff` 會相同、AC-3 的 id 清單會一致、
AC-1／AC-2／AC-6 都會通過、S6 的公式檢查也正常。
**原因是 captain 是擁有者，保護範圍排除不了他**——他執行的每一步都會成功，
**不論保護有沒有設對**。所以**保護未生效這件事，只有 AC-4 與 AC-5 抓得到**，
而它們必須在核可之前抓到，不是之後。

- **AC-4**（保護範圍的行為逐欄逐分頁成立，30 格）：**S7-b 的那 30 格就是 AC-4 的驗收本身。**
  captain 於 2026-09-25 把 AC-4 擴大到與 S7-b 同範圍，兩者自此是同一組格子。
  **S7-c 在這裡不重跑那 30 格**，要做的是把 S7-b 的結果整理成 AC-4 要求的記錄格式：
  **UTC 時間、30 格逐格的結果、使用的角色（不記 email）。**
  S7-b 第 4 點已要求逐格記錄，所以這一步是把記錄補上時間與角色欄，不是重做一次操作。
- **AC-5**（標題列受保護）：照 AC-5 原文執行。
  **AC-5 的三格 ＝ S7-b 表第 1 列的三格**；captain 本次**未擴大也未收窄 AC-5**，它仍獨立成立。

> ⚠️ **2026-09-25 更正：下面這段引言的前提已經消失，原句依本票慣例保留。**
> 它寫於 captain 裁決之前，描述的是「AC-4 只要 3 格、S7-b 要 30 格」的並存狀態。
> **captain 已裁決擴大 AC-4，兩者自此同範圍，那個落差不存在了。**
> 上面兩個項目符號是現行有效的敘述；下框是 2026-09-24 的歷史記錄。
>
> > **runbook 的操作要求可以比 AC 的驗收門檻寬，這兩件事不衝突。**
> > AC-4 的 `Verified by:` 要求的是 `Track 1_history` 的三格加 AC-5 的三個分頁標題列；
> > **S7-b 要求的是 30 格**。S7-b 涵蓋 AC-4／AC-5 並且更寬。
> > **本輪不動 AC 一個字**——AC-4 要不要擴大到逐欄逐分頁、要不要納入反向對照，
> > 依 `## Review-finding disposition` 第 5 條**只有 captain 能改**，已另行送交。
> > 在 captain 裁決前，**照 S7-b 做 30 格**；AC-4／AC-5 依原文各自成立即可。

##### S7-d　反向對照 B：以責任編輯身分驗 B 類六欄必須可改（**S7-c 之後、S8 之前**）

**這一格驗的是 AC-7。** S7-b 的 30 格證的是「**投稿者改不到**那六欄」；
**S7-d 證的是「責任編輯改得到那六欄」。兩個方向是獨立的兩件事，各需要一次實測。**

###### 1. 帳號前置——這一段是實查結果，不是推測

**repo 內查不到正式表的責任編輯是哪一個帳號。** 實查指令與結果（2026-09-25）：

```bash
# 在 repo 根目錄執行。只讀 repo，不碰試算表。
grep -rniE '責任編輯.*(帳號|email|@)|(帳號|email).*責任編輯' docs/ --include=*.md \
  | grep -v _archive/044 | grep -v '050-ssot'
```

**四筆命中，沒有一筆寫出帳號**：`040-approval-content-version-binding.md:236`、
同檔 `:250`（該行本身就明文禁止記錄 email）、同檔 `:356`、
`docs/constitution-features/_debriefs/2026-09-17-01-claude-claude-opus-5.md:104`。

repo 內能確定的只有這三件事：

| 事實 | 出處（實讀） |
|---|---|
| 專案至今只用過兩個 Google 帳號：**A ＝ captain 現用帳號**（測試表擁有者，扮演責任編輯／核可者）、**B ＝ 第二個帳號**（投稿者，以「編輯者」身分受邀） | `_archive/044-approval-permission-two-account-probe.md:271-272` |
| `044` 驗「非擁有者的責任編輯」（P7）用的**就是帳號 B**——把 B **暫時**加進「乙　審核欄」的允許名單，測完**移除** | 同檔 `:671`（加入）與 `:675`（移除） |
| **正式表的共用名單不在 repo 內**，而且兩份文件的描述互相不符 | `_archive/044-…:767`「正式表的編輯權限已開放給多位學者，名單不同」 ⟷ `docs/health-check/TODO.md` 的 **P3-1**（本 branch `:789`／main `:879`）「`2026_憲庭加好友`、`SSOT_Editor`、`網站內容收集` 的權限皆為 `ipawei@gmail.com (owner)` 一人」 |

> ⚠️ **引用 `TODO.md` 一律寫項目編號，不要只寫行號。**
> `TODO.md` 的 `status` 是 `plan`，它一直在被編輯，**行號會漂**：
> 同一個 P3-1 的證據行，在本 branch 是 `:789`，在 main 已經是 `:879`。
> 本票稍早的 `F3`（`TODO.md:127` 實為 156）與本輪的 `K16`（誤寫 `:876`，那是 **P3-9** 的
> 「狀態：全部未處理」）**是同一個錯**。
> 可重跑的查法：`grep -n '^### P3-1' docs/health-check/TODO.md`。
> 這也是 `AGENTS.md` 的既有規則——**引用編號項目時，必須指明是哪一份文件的編號**。

**那兩份文件的不符，worker 解不了，也不該猜。** 前者講的是試算表的共用名單，
後者講的是 Drive 資料夾的權限——檔案可以單獨共用而它所在的資料夾不共用，
所以兩句可以同時為真，也可以其中一句已經過時。
**只有 captain 打開正式表的「共用」對話框才看得到現況。**

> ✅ **2026-09-25：captain 打開了那個對話框，上面的問題已經有答案。原句保留。**
>
> **來源與強度**：captain 於 **2026-09-25** 親自查看正式表的「共用」對話框後**口頭回報**。
> **這不是 repo 內可驗證的事實**——本票不得把它重述為已驗證，要重新確認只能再打開一次那個對話框。
> **票內不記任何 email**（`040-approval-content-version-binding.md:250` 明文禁止），只記角色與人數。
>
> | 問題 | captain 的回報（2026-09-25） |
> |---|---|
> | 正式表的共用名單 | **六人有編輯權限，另有三人是檢視者** |
> | 名單中有沒有責任編輯 | **有** |
> | `044` 的第二個 Google 帳號 | **仍在 captain 手上**，可用於 S7-b 的投稿者角色 |
> | 該第二帳號是否已在正式表的共用名單內 | **不在**（2026-09-25 親自確認） |
>
> **上面那張表的兩份文件矛盾因此解開**：
>
> | 文件 | 判定 |
> |---|---|
> | `_archive/044-…:767`「正式表的編輯權限已開放給多位學者，名單不同」 | **成立。** 六位編輯者與測試表的兩人名單確實不同 |
> | `docs/health-check/TODO.md` 的 **P3-1**「權限皆為 `ipawei@gmail.com (owner)` 一人」 | **與正式表現況不符。** 它講的是 **Drive 資料夾**，不是試算表檔案本身；也可能只是過期。**本票不改 `TODO.md`**——那是別的文件的事，本票只記錄本票需要的事實 |

**S7-d 用哪個帳號測——只有一條路。**

**用正式表上那位責任編輯的帳號。** 他確實在共用名單內（captain 2026-09-25 確認），
所以 **AC-7 證明的是實際情況，不只是機制成立**。

- **測之前先確認他已經被加進 S7 三個分頁 B 類範圍的允許名單。**
  B 類設的就是「只有責任編輯」。
  **⚠️ 在共用名單內不等於在 B 類允許名單內——那是兩份不同的名單。**
  共用名單決定他能不能開這份試算表；B 類允許名單決定他能不能改那六欄。
  B 類名單沒有他，這 18 格必定全部失敗。
- **⛔ 不可以把他加進 A 類或 C 類。**
  加了，AC-4 的 30 格第 1-3 格就會翻面，整個 AC-4 作廢。

> ⚠️ **2026-09-25：原本的「沒有責任編輯帳號」那條路不再需要，依本票慣例保留於此，不刪除。**
>
> 原文：
>
> > - **沒有（正式表目前只有 captain 一人可編輯）**：比照 `044` 步驟 13，
> >   借用 `044` 的**第二個 Google 帳號**：把它**暫時**加進 B 類三個分頁的允許名單，測完**移除**。
> >   **這一條的限制要寫明**：借用帳號**只證明機制成立**（B 類的允許名單確實會放行），
> >   **不證明某一位實際責任編輯已在名單內**。
> >   日後真的指派責任編輯時，**這 18 格要用他的帳號重跑一次**。
>
> **為什麼不再需要**：那條路的前提是「正式表上沒有 captain 以外的責任編輯」，
> 而 captain 2026-09-25 回報**有**。走真實帳號那條之後，
> 上面那兩句附帶條件——「只證明機制成立」與「日後要用他的帳號重跑一次」——**都不再適用**。
> **這是 AC-7 的一次升級，不是縮水**：驗收對象由代理帳號換成了真正會執行核可的人。
>
> **什麼情況要把它取回來**：日後責任編輯換人或離開共用名單，而新人尚未指派時，
> 借用帳號仍是唯一能驗 B 類機制的做法。所以保留。
>
> **（上面「有」那條路的原文已併入本步唯一的那條路，內容未刪減，只補上兩份名單的區別。）**

###### 2. 為什麼排在 S7-c 之後、S8 之前

| 相對於 | 為什麼 |
|---|---|
| **S7-b 之後** | S7-b 要求測試帳號**不在任何一類的允許名單內**，那是它第 4-9 格預期值「擋」的前提。S7-d 要把帳號**放進** B 類。順序對調，S7-b 的 18 格會全部翻面 |
| **S7-c 之後** | S7-c 整理的是 AC-4（＝S7-b 那 30 格）與 AC-5 的記錄，用的角色同樣是投稿者。同一個理由 |
| **S8 之前（兩個理由）** | ①**偵測**：S8 之後沒有任何一道檢查抓得到「B 類把責任編輯排除了」——S8 由 captain 執行，他是擁有者，核可一定成功；S9 的 sha256、AC-1／AC-2／AC-3／AC-6 也全部會通過。這與 S7-c 必須在 S8 之前是同一個道理。②**安全**：此刻 B 類六欄**全部留白**（S2／S4 建欄時就留白，核可是 S8 的事），所以寫入再還原不會動到任何已核可的列 |

**跳過 S7-d 的後果，票內第九節已經寫明**：部署後責任編輯執行 `Review → 核可選取列`
會**靜默失敗**，沒有錯誤訊息；**captain 自己測不到**（擁有者永遠在允許名單內）；
最早的偵測點是有人回報「選單沒反應」。

###### 3. 18 格逐格預期值

**欄位與 A1 位置取自 S7-b 的 30 格表第 4-9 列，本步未另算一份，也未改動該表。**

| # | 欄位 | `Track 1_history` | `Track 2_discussion` | `site_tldr` | 預期 |
|---|---|---|---|---|---|
| 1 | `review_decision` | `O2` | `R2` | `F2` | **可改** |
| 2 | `review_fingerprint` | `P2` | `S2` | `G2` | **可改** |
| 3 | `approved_by` | `L2` | `O2` | `H2` | **可改** |
| 4 | `approved_at` | `M2` | `P2` | `I2` | **可改** |
| 5 | `approved_fingerprint` | `Q2` | `T2` | `J2` | **可改** |
| 6 | `reject_reason` | `N2` | `Q2` | `K2` | **可改** |

**6 欄 × 3 分頁 ＝ 18 格。** 六欄在三個分頁上各自連續，正好是 S7 的 B 類範圍
`L2:Q`／`O2:T`／`F2:K`。

**「取自 S7-b、未另算一份」這句話可以當場證偽。** 把兩張表讀出來逐格比：

```bash
# 在 050 的 worktree 根目錄執行。只讀本票，不碰試算表。
python3 - <<'PY'
import io
s=io.open("docs/constitution-features/050-ssot-approval-deployment.md",encoding="utf-8").read()
def rows(a,b):
    blk=s[s.index(a):s.index(b)]
    return [[c.strip() for c in l.strip("|").split("|")] for l in blk.split("\n")
            if l.startswith("|") and not set(l.replace("|","").strip())<=set("- ")]
s7b=rows("| # | 欄位 | 類別 | `Track 1_history` |","**10 格 × 3 分頁 ＝ 30 格。**")[1:]
s7d=rows("| # | 欄位 | `Track 1_history` | `Track 2_discussion` | `site_tldr` | 預期 |",
         "**6 欄 × 3 分頁 ＝ 18 格。**")[1:]
b={r[1]:(r[3],r[4],r[5]) for r in s7b if r[2]=="B"}
d={r[1]:(r[2],r[3],r[4]) for r in s7d}
bad=[k for k in d if k in b and b[k]!=d[k]]
missing=sorted(set(b)-set(d)); extra=sorted(set(d)-set(b))
print("S7-b 的 B 類欄位數 =",len(b)," S7-d 欄位數 =",len(d)," 格數 =",len(d)*3)
if bad or missing or extra:
    print("⛔ A1 不符:",bad," S7-d 漏列:",missing," S7-d 多列:",extra)
else:
    print("✅ 18 格 A1 位置與 S7-b 表第 4-9 列逐格相同")
PY
```

**它會失敗，而且三種壞法都會指名是哪一欄。** 三種突變實跑過，逐字輸出如下
（第一行是未突變的情形）：

| 情形 | 輸出的第二行 |
|---|---|
| 未突變 | `✅ 18 格 A1 位置與 S7-b 表第 4-9 列逐格相同` |
| S7-d 一格 A1 打錯（`P2`→`P3`） | `⛔ A1 不符: ['\`review_fingerprint\`']  S7-d 漏列: []  S7-d 多列: []` |
| S7-b 表被改（`J2`→`J9`） | `⛔ A1 不符: ['\`approved_fingerprint\`']  S7-d 漏列: []  S7-d 多列: []` |
| S7-d 漏掉一列 | `⛔ A1 不符: []  S7-d 漏列: ['\`reject_reason\`']  S7-d 多列: []`，且第一行的**格數變成 15** |

> ⚠️ **2026-09-25 更正（K20）：上一版的自評「會印 ⛔ 並指名是哪一欄」，在「漏一欄」時不成立。**
> 舊版的 `bad` 用 `b.get(k)!=d[k]` 只走 S7-d 有的欄，漏掉的欄根本不在迴圈裡，
> 所以印出的是 `⛔ 不相符: []`——**有 ⛔ 但沒有名字**，只有「格數 = 15」這個間接線索。
> **本輪改了三行把它補上**（`missing`／`extra` 兩個集合），三種突變現在都指名。
> **錯的不只是描述它的那句話，判準本身也真的少一塊**，所以本輪修的是判準，不是措辭。

**這一格沒有反向對照的反向對照**，因為「擋」的方向 S7-b 已經對兩種角色各驗過：
S7-b 的分堆表寫明第 1-3 格與第 10 格**與角色無關**（4 格 × 3 分頁 ＝ 12 格），
投稿者與責任編輯的預期值相同。

###### 4. 怎麼測

1. 以責任編輯身分開啟正式表（帳號見第 1 點）。
2. 逐格輸入任意字元。**必須輸入成功，而且儲存格顯示你剛輸入的字。**
   **不要只看有沒有跳對話框**——沒跳對話框但值沒變，一樣是失敗。
3. **測完立刻還原成空白**（按 `Delete` 或 Ctrl+Z），並確認該格回到空白。
   **比照 S7-b 第 3 點的還原要求，理由相同**：正式表是 40 筆已上線內容的唯一來源。
   留著測試字串，S8 的核可與 S9 的 AC-1／AC-2 會讀到它。
   **此刻還原是安全的**：這六欄在 S2／S4 建欄時全部留白，S8 之前沒有任何一列被核可，
   **還原成空白就是回到原值**，不會退回任何核可。
4. 逐格記錄結果（**不記 email，只記角色**），連同 UTC 時間，這是 AC-7 的記錄要求。

###### 5. 任一格不符時的處置

**不符 ＝ 該格跳出「您嘗試編輯受保護的儲存格」，或沒跳對話框但值沒有改變。**

1. **停住，不要進 S8。** 帶著這個缺陷做 59 列核可，缺陷會被 S8 與 S9 全部蓋過去，
   而它們全部會通過（見第 2 點的表）。

2. **鑑別診斷：能讓這一格失敗的只有兩件事，兩件都是「有人把責任編輯擋在外面」。**

   | # | 成因 | 怎麼查 | 為什麼它會讓這一格被擋 |
   |---|---|---|---|
   | 1 | **B 類的允許名單裡沒有該責任編輯帳號**（設成「只有你」、名單空白、或只加了其中一兩個分頁） | 開該分頁的 B 類保護範圍，看允許名單 | B 類設的就是「只有責任編輯」。名單沒有他，他就被擋 |
   | 2 | **A 類或 C 類的範圍蓋到了那六欄** | 開該分頁的 A 類與 C 類範圍，看 A1 有沒有涵蓋 B 類那六欄（`L2:Q`／`O2:T`／`F2:K`） | A 類與 C 類設的是「只有 captain」，責任編輯不在那兩類的名單內 |

   > **範圍重疊時 Google 以哪一個為準，本票不下斷言。** 要查的是
   > **A 類與 C 類的 A1 有沒有涵蓋那六欄**——有涵蓋就是嫌疑，改回不涵蓋，然後重測。
   > **S7-d 測到的行為就是答案**，這也是本票一貫的立場：設定畫面不是驗收標準，行為才是。

3. **⛔ 這兩件不是本步的成因，往這兩個方向查會查錯——它們會讓 S7-d 反而「通過」。**

   | 缺陷 | 對 S7-d 的影響 | 誰抓得到 |
   |---|---|---|
   | 權限模式選成「**顯示警告**」而非「限制編輯」（S7-a） | 該格**變成沒有保護**，責任編輯當然改得動 → S7-d **通過** | **AC-4 的 30 格。** 那六欄在 AC-4 裡的預期是「擋」，沒保護就變「可改」，AC-4 會失敗 |
   | **B 類範圍的 A1 漏掉那一欄** | 同上——該欄不在任何保護範圍內，誰都改得動 → S7-d **通過** | **AC-4 的 30 格**，同一個道理 |

   **所以 AC-4 與 AC-7 互補，不重複**：**AC-4 抓「保護不足」，AC-7 抓「保護過頭」。**
   **兩邊都過，那六欄才算設對。** 只跑其中一邊，另一邊的缺陷會靜默通過。

4. 補設之後，**把該分頁的 6 格全部重測**，不是只重測失敗那一格。
   與 S7-b 第 4 點同一條規則，理由相同：**漏設是分布式的**。

5. **若補設動作改到了 B 類、A 類或 C 類任一個範圍的 A1 或權限模式，
   該分頁的 S7-b 第 1-10 格必須一併重測**——AC-4 那 30 格的預期值全部建立在同一組範圍上。
   （上一版只寫「B 類」與「第 4-9 格」；**動到 A 類或 C 類會影響第 1-3 格**，先放大到第 1-9 格；
   **本輪再補上第 10 格**，理由見下。）

   > ⚠️ **2026-09-25 更正（K25）：第 10 格原本被排除在重測範圍外，而它正是最該重測的那一格。原範圍寫法保留於上。**
   >
   > **第 10 格是內容欄的反向對照，預期值是「可改」**，AC-4 用它抓**過度保護**。
   > 而本點的觸發條件是「**補設動作改到了某一類範圍的 A1**」——
   > **那恰好就是可能把內容欄涵蓋進去、使第 10 格由「可改」翻成「擋」的動作。**
   > 舊版把觸發條件與應檢範圍脫鉤了：**最可能翻面的那一格，剛好是唯一沒被要求重測的那一格。**
   >
   > **而且它不會被別的步驟補救**：第 10 格的結果來自 **S7-c**（AC-4 的記錄整理），
   > **補設之後不會自動重跑 S7-c**。不在這裡重測，就沒有人會再測它。
   >
   > **分類：`Deferred risk`（reviewer cycle 6 判定，本輪未自行升級也未降級）。**
   > **promote-to-material 條件（逐字採用 reviewer 的寫法）**：
   > **任何一次 S7-d 補設實際擴大了 A／B／C 任一範圍的 A1。**
   > trigger 為補設時的操作失誤，**本輪未觀察到**，故列 Deferred risk 而非 Material。
   >
   > **本輪的處置是把範圍補到第 1-10 格**，讓 promote 條件一旦成立時有對應的檢查接住它；
   > **S7-b 的 30 格表與 S7-d 的 18 格表本輪逐位元組未動**——改的只有本點的文字。

###### 6. 收尾

- **只有在走第 1 點那則 ⚠️ 保留註記的「取回」情形時**（責任編輯換人或離開共用名單、新人尚未指派，
  因而借用 `044` 的第二個帳號代測）：
  **把該帳號從 B 類三個分頁的允許名單移除，還原成 S7 的設定。** 比照 `044` 步驟 13 第 5 點。
  **走正常那條路（用真實責任編輯的帳號）時不做這一步**——他本來就該留在 B 類名單內。

  > ⚠️ **2026-09-25 更正（K24）：原句指向一個已經不存在的分支標籤。原句保留。**
  > 原文寫「走第 1 點**「沒有」那條**（借用 `044` 的第二個帳號）時」，
  > 但第 1 點已於 cycle 10 收斂為**一條路**，「沒有」那條降為 ⚠️ 保留註記，
  > **「沒有」這個標籤在第 1 點裡已經無處可對**。改為指向那則註記的**取回條件**。
- **S7-b、S7-c、S7-d 三者都做完之後**，才把第二個 Google 帳號從正式表的共用名單移除
  （S7-b 第 1 點的收尾要求，時機已依本步更正）。

**S8　逐列重新核可 59 列。** 照票內步驟 7 原文，分 6 段：

| 分頁 | 段 | 試算表列號 | 列數 |
|---|---|---|---|
| `Track 1_history` | 1 | 2 | 1 |
| | 2 | 4-24 | 21 |
| | 3 | 26-43 | 18 |
| `Track 2_discussion` | 4 | 2-3 | 2 |
| | 5 | 5-17 | 13 |
| `site_tldr` | 6 | 2-5 | 4 |
| **合計** | | | **59** |

**跳過的列：`Track 1_history` 第 3 列（`h2`）與第 25 列（`h28`）、
`Track 2_discussion` 第 4 列（`d3`）。** 這三列現況 `status` 空白，讓它們停在 `Needs review`。
`Track 2_discussion` 第 18-44 列（`d18`–`d44`）也不核可。

**⚠️ `Track 2_discussion` 第 4 列（`d3`）在 S8 完成前不可刪除或搬移。** 刪了它，
第 5-17 列的指紋全變，那 13 列要重做。

**S9　工程執行不落地驗證。** 照票內步驟 8 原文，接著跑 AC-3 的 id 比對。
兩者都通過才做步驟 9 的合併。

### 九、F1-F4 的處置與引用複核（2026-09-24 第二輪）

verify stage 判 **PASSED**，並提出 F1-F4 四筆 finding。FO 授權**四筆全部 fix**。
本輪**未對正式試算表做任何寫入**，也未讀取它——四筆全部是票內文字的修正，
所需事實改由重跑 main 的同步程式（本機 fixture、暫存沙箱）與實讀被引用的檔案取得。
`src/data/*.json` 零改動。

#### 四筆 finding 的處置

| finding | 分類 | 改了哪裡 | 改成什麼 |
|---|---|---|---|
| **F2** | Material | AC-6 的 `Verified by:` | 判準改為「同一行同時含 `對不到任何預期欄位` 與 `review_decision` 兩個子串」，並在 sandbox 指令裡附上該 `grep`。不再逐字比對引號內容，不再綁欄號 |
| **F4** | Deferred risk | S2、S3 | S2 加「三個內容欄在 S9 完成前必須全欄留白」；S3 加 sha256 不符時的分辨表與 re-baseline 條文，並記下升級為 Material 的條件。順帶補上 S3 的 `diff` 指令——原本只寫「比 sha256」，沒寫怎麼看出差在哪 |
| **F1** | Polish | 第六節「Track 2 的序號暴露面」 | 「其後 14 列」改為「其後 13 列（第 5-17 列）」 |
| **F3** | Polish | 步驟 3 的表、第三節 | `TODO.md:127` 改為 `TODO.md:156`。**cycle 3 再改一次，改為名稱引用 `TODO.md` 的 P1-5「附帶問題已解決」**——`TODO.md` 是票內唯一兩個 checkout 不同的被引用檔，理由見第十節 |

**AC 的要求文字一字未動。** F2 只改 AC-6 的 `Verified by:`（改「怎麼認出那一行」），
AC-6 的標題與「必須 exit 1 並輸出一行指出 `review_decision` 這一欄對不到任何預期欄位」
這個要求本身不變。F4 的兩處都落在 S2／S3，沒有碰 AC-1 的條文。

#### F2 的字串已獨立重測

架本機 HTTP server 供應三個分頁的 fixture（標題用第三節的建議值、S2／S4 的排序），
把 `git show main:scripts/sync-content.mjs` 複製到暫存沙箱執行。exit 1，逐字印出：

```
第 15 欄的標題「review_decision （由 Review 選單寫入）」對不到任何預期欄位。檢查是否打錯字。
```

兩項確認：

1. `grep '「review_decision」'` **找不到**這一行（引號內多了中文說明），F2 成立。
2. 新判準 `grep '對不到任何預期欄位' | grep -q 'review_decision'` **認得**這一行。

另查出訊息實際結尾還有 `檢查是否打錯字。`（`sync-content.mjs` 第 294 行的
`addError(...)` 樣板）。AC-6 原文只引到 `對不到任何預期欄位。`，那是子串，不影響判準；
新版已把完整訊息逐字寫進票內，工程不會再對不上。

#### 引用複核：票內每一處 `檔名:行號`

verify 說它實讀通過 8 處。cycle 2 把範圍擴到全票的 `檔名:行號` 一族（31 處），
cycle 3 再補一族與一處漏掉的，共 **36 個被引用的位置**。
**五處指不到宣稱的內容，全部已修；其餘 31 處實讀通過。**
另有一列（`TODO.md` P3-7）宣稱正確、但本表當初拿來當證據的行號記錯，已改為名稱引用。

> ⚠️ **這張表的三個邊界，先寫清楚，因為它們是這張表唯一會騙人的地方。**
>
> 1. **它是「掃描當下」的快照。** 同一輪之後才新增的引用不會出現在裡面。
>    cycle 2 的 `sync-content.mjs:294` 正是這樣漏的——它是 cycle 2 自己為了 F2 加進票內的，
>    加在掃描之後，所以掃描結果「零漏」與「這張表涵蓋全票」**不是同一件事**。
>    本表已把它補上，並在第三輪重掃一次。
> 2. **它原本只掃 `檔名:行號` 一族。** `檔名 第 N 條／第 N 節` 是另一族，
>    原本整族不在範圍內。第三輪已把這一族的 5 處補進表尾。
> 3. **行號只在「那個檔在兩個 checkout 相同」時才有唯一答案。**
>    被引用的檔裡只有 `TODO.md` 在 main 與本 branch 之間不同（見 P3-7 那一列），
>    其餘七個檔兩邊是同一個 blob，所以行號無歧義。
>
> **⚠️ 第四輪追加：上面三條有一個共同的隱含假設，而第四族違反它。**
> 三條都假設「被引用的對象是一個檔，它的內容穩定，會變的只有位置」。
> **第四族是「引用另一張票、只寫 feature 編號」**（`feature 044`、`feature 043`、`feature 040`）。
> 它變的不是位置，是**被引用對象的狀態**——票會從 `design` 走到 `complete`、會被歸檔、
> 它的結論會反過來。**三條邊界一條都擋不住，因為它們檢查的是行號。**
>
> **第四族的檢查方式不是讀行號，是重讀被引用票的 front matter**：
> `status`／`verdict`／`completed`／是否已移進 `_archive/`。
> H1 就是這樣躲過三輪的：`044` 在 2026-09-21 完成並 PASSED，
> 票內卻還寫著「前置目前不存在、鏈條頭卡住」——**三輪掃描全部只盯 `檔名:行號`，所以全部沒看見。**
> 第四族的結果另列於下方「第四族：票對票的引用」。
>
> **⚠️ 第六輪追加：前五族有一個共同點，而第六族打破它。**
> **第一至第五族全部是「對外引用」**——050 指向某個檔、某個節、某張票，或一張不存在的票。
> 它們的共同前提是：**票內有一句話可以拿去檢查。**
>
> **第六族的方向相反：別人指定 050 要做的事。**
> 票內**根本沒有指向那個義務的引用**，所以從 050 內部出發的掃描，
> **無論多完整都掃不到它**——沒有東西可以掃。
> 第五族（指涉不存在的票）至少那句話寫在 050 裡；第六族連那句話都不在 050 裡。
>
> **檢查方式：對其他票 grep 本票的票號，逐一讀「由 050 …」的義務。**
>
> ```bash
> cd <repo 根目錄>
> grep -rln '\b050\b' docs/constitution-features/ \
>   | grep -v '^docs/constitution-features/050-ssot-approval-deployment'
> # 然後逐檔 grep -n '050' 並實讀每一處，判斷它是「引用 050」還是「指定 050 要做的事」
> ```
>
> **⚠️ 這條指令本身修過一次，而它犯的是第六族同一個形狀的錯。**
> 第六輪寫下的版本是
> `grep -rln … docs/constitution-features/*.md docs/constitution-features/_archive/*.md`——
> **glob 只涵蓋兩層 `.md`，漏掉 `_debriefs/`、`_mods/` 與各票的子目錄。**
> 漏掉的 `_debriefs/2026-09-17-01-claude-claude-opus-5.md`
> **在 2026-09-17 也記著同一項義務**（「保護範圍必須以非擁有者帳號逐格實測」）。
>
> > ⚠️ **更正（第八輪，來源是 review 的 K11）：這裡與下方那張表原本寫這份 debrief
> > 「比 `044` 的票更早被寫下」，實查是反的。**
> > `044` 的結論節標題逐字為「## 執行結果與交給 feature 050 的結論（**2026-09-15** 追加）」，
> > 而這份 debrief 是 **2026-09-17**——**`044` 在前，debrief 在後。**
> >
> > **錯誤源頭是本票第七輪的 K9 處置**（我寫下「而且比 `044` 的票更早被寫下」），
> > **FO 照抄進 K11 的授權書，又轉述給 captain。**
> > FO 已指出**這是同一天第二次同型的傳遞鏈**（前一次是 F-26 的「2 處」），
> > **兩次的第二個環都是 FO。** 依 FO 要求照實記在這裡。
> >
> > **要確認的結論不變**：那項義務有**兩個見證**，而**兩個都被漏掉了**。
> > 改的只是先後順序，不是結論——事實上順序反過來對本票更不利：
> > **最早的記載是 `044` 自己的票，而那正是第六輪掃描漏掉的那一族要抓的東西。**
> 也就是說：**為了抓「別人指定本票要做的事」而寫的掃描指令，自己的涵蓋面不完整。**
> 現行版本改為 `-r` 掃整個目錄，命中 8 個檔（舊版 5 個）。
> `\b050\b` 的詞界是必要的——沒有它，`0501`、`sha256:…050…` 都會命中。
> **這一筆由 review 在第七輪查出（K9），不是本票自己發現的。**
>
> **這一族是 K1-K3 的來源，而 K1 是 Material。**
> 結果另列於下方「第六族：別人指定 050 要做的事」。

| 引用 | 宣稱的內容 | 結果 |
|---|---|---|
| `editor-onboarding.md:430`（4 處） | 「編輯權限已經開出去，這一輪重新核可的工作量比原設計預估的大」 | ⛔ 該句在**第 434 行**。第 430 行是「正確順序是：試算表建欄 → …」。**已改為 `:434`** |
| `040-…md:221` | 040 的 Out of scope「不上線正式 SSOT 設定，直到隔離測試表完成驗證並由 captain 確認」 | ⛔ 該句在**第 290 行**，第 221 行是空行（main、040 worktree、本 worktree 三份皆同）。**已改為 `040-approval-content-version-binding.md:290`**（並補全檔名，原本寫成 `040-…md`） |
| 本票「第 50 行」 | 「spike 的形式是在隔離測試表上先跑一次（即 feature 044）」 | ⛔ 該句在第 53 行。cycle 2 改為「第 53 行（`## Risk evidence` 首句）」；**cycle 3 把行號整個拿掉、只留錨點** |
| `TODO.md:127` | `site_tldr` 現況為 `order｜label｜text｜status｜link` | ⛔ 第 127 行是空行，該記錄在第 156 行（即 F3）。cycle 2 改為 `:156`；**cycle 3 再改為名稱引用 `TODO.md` 的 P1-5「附帶問題已解決」**，因為 `TODO.md` 兩個 checkout 的行號不同 |
| `editor-onboarding.md:425-430` | 「一旦先合併而試算表還沒建那八欄…」＋「正確順序是…」兩句 | ✅ 兩句分別在第 428、430 行，都落在區間內 |
| `editor-onboarding.md:261` | `reject_reason` 欄在試算表上不存在 | ✅ 逐字相符 |
| `editor-onboarding.md:104-111` | 風險 5（改到欄位標題，整條產線停擺） | ✅ 標題在第 104 行，整段落在區間內 |
| `editor-onboarding.md:110` | 標題列保護與 `status` 是分開設定的 | ✅ 逐字相符 |
| `editor-onboarding.md:58` | 「整列刪除」保護尚未確認 | ✅ 逐字相符 |
| `editor-onboarding.md:344-345` | `h28` 掛了 `h14` 的標題，以清空 `status` 擋住 | ✅ 逐字相符 |
| `2026-08-31-content-pipeline.md:174` | `收集區` 的 Track 1 為 9 欄、不含 `chapter` | ✅ 逐字相符 |
| `TODO.md` P3-7（以名稱引用） | `chapter` 欄位設計已被放棄 | ✅ 標題存在，內容相符。**本欄原寫「第 865 行」，那是錯的記法而非錯的行號**——`TODO.md` 是票內唯一在 main 與本 branch 之間有差異的被引用檔（main 多 40 行，插在第 596-635 行），所以 P3-7 在 main 是第 **905** 行、在本 worktree 是第 865 行，**同一個名稱有兩個合法行號**。票內三處都以名稱引用、不帶行號，所以沒有任何載重引用被打壞。詳見 G1 的處置 |
| `approval-workflow.gs:5` | `APPROVAL_FIELDS['Track 1_history']` 含 `chapter` | ✅ |
| `approval-workflow.gs:6` | `APPROVAL_FIELDS['Track 2_discussion']` 是 13 個欄位 | ✅ 實數 13 個 |
| `approval-workflow.gs:12-14` | `WRITABLE_REVIEW_FIELDS` 排除 `status` 與 `current_fingerprint` | ✅ |
| `approval-workflow.gs:76-80` ／ 第 79 行 | Track 2 的指紋含 `__sequence` | ✅ 第 79 行為 `projection.push(['__sequence', …])` |
| `approval-workflow.gs:127-144` | `resolveApprovalHeaders_` | ✅ 第 127 行是函式開頭，第 144 行是它的結尾 `}` |
| `approval-workflow.gs:159` | `這個分頁不支援核可公式。` | ✅ 逐字相符 |
| `approval-workflow.gs:219` | 不可核可標題列 | ✅ 逐字相符 |
| `approval-workflow.gs:220` | `Session.getActiveUser().getEmail()` | ✅ 逐字相符 |
| 040 `sync-content.mjs:84-93` | `APPROVAL_COLUMNS` 八欄全為 `required` | ✅ 第 84 行宣告、第 93 行 `];`，八筆皆 `column: 'required'` |
| 040 `sync-content.mjs:392` | `publishedRowSequences` | ✅ 函式定義在該行 |
| main `sync-content.mjs` 第 94 行 | `chapter` 為 `optional` | ✅ |
| main 第 97-99 行 | Track 1 的 `approved_by`／`approved_at`／`reject_reason` | ✅ 三行逐字相符 |
| main 第 112 行 | `aliases: ['owl comment', 'owl_comment']` | ✅ 逐字相符 |
| main 第 113、116 行 | `owl_depth_comment`、`full_content` | ✅ |
| main 第 117-119 行 | Track 2 的三欄 | ✅ |
| main 第 123-129 行 | `SITE_TLDR_COLUMNS` 無 `approved_by`／`approved_at`／`reject_reason` | ✅ 七行實讀，確實沒有 |
| `operations.md:12` ／ 第 15-25 行 | probe 但書；「隔離表部署」一節 | ✅ 第 12 行逐字相符；該節內容為第 15-25 行（第 26 行空白、第 27 行是下一節） |
| `design.md` 第二節第 4 點 | 找不到標題就中止並指名 | ✅ 第二節在第 135 行，第 4 點為「找不到就中止，並指名是哪個標題看不懂」 |
| 本票 `## 相依關係` 第二個項目符號 | 「兩者不互為前置」 | ✅ 指到該句。cycle 2 寫成「第 45 行（錨點）」，cycle 3 **把行號整個拿掉、只留錨點**——理由見下方「錨點不等於修好」 |
| main `sync-content.mjs:294` | `第 N 欄的標題「…」對不到任何預期欄位。檢查是否打錯字。` 的 `addError` 樣板 | ✅ 逐字相符。**cycle 2 自己新增的引用，當輪掃描沒有涵蓋到**（見上方邊界 1） |
| `AGENTS.md` 第 1 條 | 不要自己執行內容同步 | ✅ 第 12 行 `### 1. 不要自己執行內容同步`；票內「main 的程式成功時會直接覆寫 `src/data/`，違反 `AGENTS.md` 第 1 條」成立 |
| `design.md` 第二節的欄位表 | 欄位表是設計意圖、不是現況快照 | ✅ 第二節內三個分頁各有欄位表（第 182／193／204 行） |
| `design.md` 第五節施工順序表 | Documentation impact 要追加本票為新項目 | ✅ `## 五、更新流程與施工順序`（第 349 行）內有 `### 施工順序` 表 |
| `design.md` 明訂舊列不能批次補造指紋（第 37 行、步驟 7） | 舊列不能批次補造指紋 | ⛔ **`design.md` 完全沒有這一條**（全檔 `grep 補造` 零命中，`指紋` 只出現在修訂紀錄）。該規則實際在 `editor-onboarding.md:432-433`，`040-…md:173` 與 040 worktree 的 `operations.md:13` 也各有一份。**引錯的是檔名，不是行號。已改指 `editor-onboarding.md:432-433`** |

**F3、`editor-onboarding.md:430`、`040-…md:221`、本票「第 50 行」是同一種錯**：
引用的行號在寫下之後就沒有再被驗證過。修法一致——實讀一次，改成對的行號，
並在自我引用的地方補上章節錨點，讓它不再隨著票內插入內容而漂移。

**verify 自己那兩處 `TODO.md:127` 刻意保留**（它的第四節末與第七節 F3）。
那兩處在**描述這個缺陷本身**，改掉就看不懂 F3 在講什麼。

#### 第四族：票對票的引用（2026-09-24 第四輪新增）

掃法與前三族不同：**先抓出票內每一個 feature 編號，再逐一重讀那張票現在的 front matter。**
不看行號，看 `status`／`verdict`／`completed`／是否在 `_archive/`。
票內被引用並據以推論的 feature 共 5 張：

| 被引用的票 | 票內據以推論什麼 | 重讀 front matter | 結果 |
|---|---|---|---|
| `044` | 「前置目前不存在」「鏈條頭卡住」「三個選項」「AC-4 的第二個 Google 帳號」 | `status: complete`、`verdict: PASSED`、`score: 0.96`、`completed: 2026-09-21T18:35:02Z`、`pr: pr-merge:36`、已在 `_archive/` | ⛔ **全部過期**。已在「相依二」逐項更正，原句保留（即 H1） |
| `043` | 「整列刪除由 feature 043 在同步端擋」 | `status: design`、標題掛「待captain確認脈絡」、`source` 寫「脈絡待確認後再決定**是否進行**」 | ⛔ **那張票還沒決定要不要做**，且門檻「初步建議兩成」擋不住刪 1 列／40 列（2.5%）。已改（即 H3） |
| `040` | 「擋住 040 的合併」「040 已走到最後一道 gate」「`operations.md` 只存在於 040 的 worktree」 | `status: review`、`completed:` 空白、未合併 | ✅ **仍成立**。但它**尚未合併**這件事本身有後果——見上方「040 branch 上那三個檔的行號，釘在 commit `a51b5d9`」（即 H4） |
| `042` | Out of scope：「不處理 HTML 淨化（042）」 | `status: design` | ✅ 成立。這句只宣告**本票不做**，沒有推論 042 會做 |
| `065`／`066`／`049` | 第十節：`TODO.md` 在 main 多出的 40 行是這三張票加的 | `065` complete、`066` complete、`049` design | ✅ 成立。那是對 `git diff` 內容的歸屬描述，不是對它們狀態的推論 |

**`041` 與 `045` 在票內沒有被引用。** 票內出現的 `041` 三處：一處是 sha256 字串裡的數字（誤判），
兩處是本票自己描述 `design.md` 修訂紀錄裡有一條 041 的註記——那是對 `design.md` 內容的陳述，不是票對票的推論。

**第四族的失效模式與前三族不同，這是重點。**
前三族壞掉時，指的東西還在原地，只是行號指偏了——**讀者會發現**，因為他看到的是不相干的內容。
第四族壞掉時，**句子讀起來完全合理**：「044 的前置目前不存在」是一個通順、具體、有證據感的句子。
它沒有指向任何會露餡的位置，所以**三輪掃描與三個 reviewer 都讀過它，沒有一個人起疑**。
**唯一的檢查方式是去把那張票打開重讀一次。**

**詞界誤判：4 處，散在 3 個檔**（`050` 命中但 `\b050\b` 不命中，都不是對本票的引用）：

| 檔 | 處數 | 實際內容 |
|---|---|---|
| `_debriefs/2026-05-02-01.md` | 2 | 兩處都是 `0501`（2026-05-01 的會議日期） |
| `056-…/review/review/briefing-1/index.json` | 1 | `sha256:…fea050324…` |
| `056-…/review/verify/briefing-1/index.json` | 1 | `sha256:…d050a23e…` |

**重算指令**（這個數字會隨檔案增減而變，所以指令放在這裡當唯一權威處）：

```bash
cd <repo 根目錄>
python3 - <<'EOF'
import os,re
base="docs/constitution-features"; tot=0; hits=[]
for root,_,files in os.walk(base):
    for fn in files:
        p=os.path.join(root,fn)
        if p.startswith(base+"/050-ssot-approval-deployment"): continue
        try: t=open(p,encoding="utf-8",errors="replace").read()
        except: continue
        d=len(re.findall(r"050",t))-len(re.findall(r"\b050\b",t))
        if d: hits.append((p,d)); tot+=d
print("非詞界誤判:",tot,"處／",len(hits),"檔")
for p,n in sorted(hits): print(f"  {n} 處  {p}")
EOF
```

> ⚠️ **更正（第八輪，來源是 review 的 K12）：這一段原本寫「兩處詞界誤判」，
> 結尾又寫「這五處」，兩個數字都不對，而且其中一項舉例是憑空的。**
> 原句是「`_debriefs/2026-05-02-01.md` 的 `0501`（會議日期）與 `#6-#27`（PR 編號）、
> `056` 兩個 briefing JSON 的 `sha256:…050…`。這五處都不是對本票的引用。」
> **`#6-#27` 整個字串裡沒有 `050`，它從來不是一處誤判。**
> 那個檔的兩處誤判都是 `0501`。正確答案是 **4 處／3 檔**，已重數並附重算指令。

#### 第六族：別人指定 050 要做的事（2026-09-24 第六輪新增）

掃法：**在其他票裡 grep 本票的票號**，逐一實讀每一處，
判斷它是「引用 050」還是「**指定 050 要做的事**」。
`docs/constitution-features/` 下除本票外**有 8 個檔**提到 `050`
（第六輪只掃到 5 個，glob 漏掉三個——見上方邊界宣告的 ⚠️ 與 K9）：

| 票 | 提到 050 的內容 | 是義務嗎 | 結果 |
|---|---|---|---|
| `044` | 「執行結果與交給 feature 050 的結論」：結論一（保護範圍須以非擁有者帳號逐格實測、提供逐欄檢查表、內容欄可改列為反向對照）、附帶規則一（不要手動編輯 `status`）、附帶規則二（未授權帳號核可會靜默失敗）。明寫「**上述結論由 050 自己的 stage 採用**」 | **是，三項** | ⛔ **三項一項都沒有被採用**，而且票內兩處寫了相反的話。即 K1／K2／K3，本輪全部採用 |
| `040` | `gates` 的 hold 恢復條件：「feature 050 完成正式 SSOT 的四項人工步驟——三個發布分頁各建八個審核欄位、安裝 `CONTENT_FINGERPRINT` 與 `APPROVAL_STATUS` 公式及 Review 選單、既有 40 筆逐列重新核可、審核欄位設定保護範圍」 | **是，四項** | ✅ **四項都在**：分別對應 S4、S5、S8、S7 |
| `064` | 「加欄本身會讓現行同步在欄位檢查處中止（同 feature `050` 已證實的機制）」 | 否 | ✅ 它引用 050 的結論，不是指定 050 做事 |
| `056` | 「不處理 SSOT 產線把關（features 040／042／043／050）」 | 否 | ✅ 宣告 056 自己不做，對 050 無要求 |
| `041` | 三處都是票號清單（`012–050 共 15 張 status: design`、掃描輸出涵蓋 `012–050`） | 否 | ✅ 只是列舉範圍 |
| **`_debriefs/2026-09-17-01-…`** | **第六輪漏掉的那一檔。** 2026-09-17 的 debrief 記著「本節的 probe 已為其驗證兩件事：責任編輯不必是擁有者即可核可；**保護範圍必須以非擁有者帳號逐格實測**」，另記 `044` 步驟 13（P7）是為驗證 050 步驟 6 的兩層保護分法而納入 | **是——與 `044` 同一項** | ⛔ **同一項義務的第二個見證。** 它不是新義務，但它證明**那項義務有兩個獨立記載，而兩個都被漏掉了**——`044` 的結論節（2026-09-15）與這份 debrief（2026-09-17）——而本票到第六輪才採用 |
| `_archive/044/review/{review,verify}/briefing-1/index.json` | 兩檔都只在 `uri` 欄位引用本票的檔案路徑（`git-root://main/<sha>/…/050-…md`） | 否 | ✅ workflow 的 briefing 產物，引用本票當參考資料，不是指定本票做事 |

**這一族為什麼特別嚴重。**

> ⚠️ **更正（第七輪，來源是 review 的 K10，不是本票自己發現的）：
> 原句寫「它是唯一產出 Material 的一族／前五族全部是 Polish」，那兩句都不成立。**
> **被票內自己的 `### Feedback Cycles` 推翻**：Cycle 1 的 **F2 是 Material**，
> Cycle 3 的 **H1 是 Material，而 H1 正是第四族**。
> **原句就是這一段引號裡的那兩句**，保留在此，下方換成準確的陳述。
>
> 那兩句話出自 FO 在 K4 的授權書，本票照著寫進來，**兩邊都沒有回頭對 Cycle 記錄**。
> 這一筆是 FO 自己認的錯，依 FO 要求照實記在這裡。

**準確的陳述是這樣**：

| 族 | 目前產出的最高等級 | 哪一筆 |
|---|---|---|
| 第一族（`檔名:行號`） | Polish | F1／F3／`editor-onboarding.md:430`／`040-…md:221` 等 |
| 第二族（`檔名 第 N 條／節`） | **無缺陷** | 補進表的 4 處全部實讀通過 |
| 第三族（只寫檔名、不寫位置） | Polish | `design.md` 引錯檔名那一筆 |
| **第四族（票對票的引用）** | **Material** | **H1**（Cycle 3）——`044` 已完成而票內仍寫「前置不存在」 |
| 第五族（指涉不存在的票） | Polish | J1 的三處「另一張票／後續票／另議」 |
| **第六族（別人指定 050 要做的事）** | **Material** | **K1**（Cycle 6）——`044` 的三項結論一項都沒採用 |

（Cycle 1 的 **F2** 也是 Material，但它不屬於這六族——那是 AC-6 的判準字串對不上，
與「引用」無關。列此避免「Material 只出現在第四、六族」被再讀錯一次。）

**第六族真正獨有的性質不是「Material」，是這兩點：**

1. **它在 050 裡沒有留下任何可檢查的東西。** 前五族至少有一句話寫在票內——
   查它、實讀它、就會發現它指偏了。第六族**連那句話都不在票內**。
2. **K1 是唯一一筆「照票做完之後沒有任何一步會揭露錯誤」的 Material。**
   F2 會**大聲失敗**（工程看到驗收字串對不上，只是誤判方向）；
   H1 傷的是**決策品質**（三個選項失真，captain 可能選 B）；
   **K1 傷的是成品本身，而且完全靜默**——
   保護沒生效，S8 之後每一道檢查都照樣通過（理由見 S7-c）。
**第六族不同**：`044` 的結論一是**實測抓出假通過的那份檢查表**，
沒有採用它，captain 會把保護範圍設成看起來對但沒生效，
**而本票 S8 之後的每一道檢查都偵測不到**（理由見 S7-c）。

**也是最難自己發現的一族。** 前五族至少有一句話寫在 050 裡可以檢查；
第六族在 050 裡**沒有留下任何痕跡**——
沒有指向 `044` 結論的引用、沒有「待採用」的註記、沒有空白的待辦。
**它是一個不在場的東西，而不在場的東西掃不到。**
發現它的唯一辦法是反向操作：**不問「本票引用了什麼」，問「誰引用了本票」。**

#### 三條判準（本票七輪累積下來、可以帶去別張票的三句話）

前兩條原本散在票內兩處，第三條是第八輪新增的。放在一起，因為它們是同一種毛病的三個面。

**一、判準是行為，不是數量。**（寫在 S7-b；來源是 `044` 步驟 6 的追加補述）
數到 12 個保護範圍、看設定畫面都正確，都不代表保護生效。
S7-b 的 30 格沒有全過，保護就是沒生效。`044` 就是只看設定畫面而得到假通過的。

**二、判準是「這個檔會不會在我引用它之後變動」，不是「行號一律不好」。**（寫在第十節）
所以 `TODO.md` 改名稱引用（它在兩個 checkout 有兩個合法行號）、
040 branch 上那三個檔釘 commit `a51b5d9`（040 未合併，檔案真的會動）、
而 main 上七個不會動的檔保留行號（行號比章節名好查）。
**推論**：會動的量測要有一個權威處，其他地方指向它，不要各自抄一份。

**三、更正一個錯誤時，要驗證那句更正自己的涵蓋面。**（第八輪新增）

這一條是被連續三筆同型缺陷逼出來的，**三筆都發生在第七輪之內**：

| 筆 | 更正的動作 | 更正本身錯在哪 |
|---|---|---|
| **K13** | 處理 K10 時宣稱「三處都處理」 | **實際兩處。** 第十三節的標題與首句沒改 |
| **K11** | 處理 K9 時寫「debrief 比 `044` 的票更早」 | **先後順序寫反。** `044` 是 09-15、debrief 是 09-17 |
| **K12** | 處理 K9 時列出詞界誤判 | **「兩處」與「五處」兩個數字都不對**（實為 4 處／3 檔），還多列了一項憑空的 `#6-#27` |

**共同形狀**：更正的內容是對的，**而描述那個更正的句子沒有被驗**——
「三處」「更早」「兩處」「五處」四個宣稱，沒有一個是查過才寫的。
**修一個錯誤的那一刻，最不會被檢查的就是自己剛寫下的那句話。**

**可操作的版本**：更正裡出現數量詞、時間先後、或「全部／都」這類涵蓋面宣稱時，
**當場跑一次能否證的指令**，並把指令留在票內（第一條與第二條各自都這樣做了；
K12 的重算指令是第三條的第一次實踐）。

#### 數字複核：同一件事在多處出現是否一致

| 數字 | 出現在哪裡 | 結果 |
|---|---|---|
| 刪 `d3` 後受影響的列數 | 第六節「其後 N 列」／S8「那 13 列要重做」 | ⛔ 14 對 13。**已把第六節改為 13**（即 F1） |
| 24 欄 | 第三節（8＋9＋7）、第六節分段表、第七節 D2、implement Stage Report、verify 第一節 | ✅ 全部 24，且 8＋9＋7＝24 |
| 9 欄安全前綴 | 第六節（4＋5＋0）、第八節 S2 的表、verify 第一節 | ✅ 全部 9，S2 的表實際列出 4＋5＋0＝9 欄 |
| 15 欄窗口內 | 第六節（4＋4＋7）、S4、時間估算表、verify 第一節 | ✅ 全部 15，S4 實際列出 4＋4＋7＝15 欄。9＋15＝24 |
| 17 欄（票內舊值） | 第三節、第七節 D2 | ✅ 兩處皆 17，且步驟 3 的表確實算出 5＋5＋7＝17；24－17＝7 與「少算 7 欄」相符 |
| 18／21／12 欄（建完的總欄數） | 證據 1、第三節、第四節、第八節 S4、verify 第一節 | ✅ 五處一致，且 10＋8＝18、12＋9＝21、5＋7＝12 |
| 59 列 | 步驟 7 的表、第六節、時間估算表、S8 的表、verify 第三節、AC 相關敘述 | ✅ 全部 59，且 40＋15＋4＝59 |
| 89／30 列 | 第六節的表 | ✅ 42＋43＋4＝89；2＋28＋0＝30；59＋30＝89 |
| 6 段連續選取 | 時間估算表（3＋2＋1）、S8 的表、verify 第三節 | ✅ 三處一致；S8 的表列出 1＋21＋18＋2＋13＋4＝59 列、共 6 段 |
| 12／15 個保護範圍 | 第三節、第六節的表、第七節 D6、S7 的表、verify 第三節 | ✅ 全部 12／15；S7 的表實際列出 4＋4＋4＝12 個範圍 |
| 27 列草稿（`d18`–`d44`） | 第六節、implement Summary、verify 第三節 | ✅ 第 18-44 列即 27 列，與 S8「第 18-44 列也不核可」相符 |
| `review_decision` 的欄號 | 第六節 fixB3／fixB4（第 12／第 6 欄）、第八節（第 15 欄）、AC-6（新版）、verify（第 15 欄、第 18 欄起、第 6 欄起） | ✅ 差異源自排序不同，不是矛盾：建議排序 12、S2／S4 排序 15（Track 2 為 18、`site_tldr` 為 6）。AC-6 新版已明寫「不要綁欄號」並列出兩個值 |
| 540 行 | verify 第六節的 placeholder scan 範圍 | ✅ `git log --numstat 2e83adf` 為 `540 0` |
| 「三處與現況不符」 | 部署 runbook 的 ⚠️ 橫幅、第八節開頭 | ✅ 不是矛盾。「三處」指**與現況不符的三個位置**（步驟 0 指令、步驟 2 字串、步驟 3 欄位表）；D4 是估算過大、D6 是漏說明，兩者不屬於「與現況不符」。兩處橫幅的措辭一致 |

**未改動 verify 已確認的任何數字**：24／9／15 欄、59 列、12／15 個保護範圍、6 個連續段，
以及 18／21／12、40／16、89／30、27 全部原值保留。F1 改的 14→13 是 verify 自己提的更正。

#### 未越界

- **正式 Google 試算表零寫入，本輪連讀取都沒有。** 沒有 HTTP 請求送到試算表。
- 未執行 `npm run sync-content`。main 的同步跑了兩次，兩次都在暫存沙箱、餵本機 fixture：
  一次驗 F2 的錯誤字串（exit 1），一次驗 S3 新增的 `diff` 指令指對地方（exit 0，
  兩個 JSON 確實寫進 `$SANDBOX/src/data/`，沒有碰 repo）。
- `src/data/*.json` 逐位元組未變，sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。
- 未改動任何 acceptance criteria 的**要求文字**。
- 未動 040 的 worktree（只以 `git show main:` 與唯讀 `sed` 取內容）。
- 判定中文字串時未使用 `sort`／`uniq`；欄名與訊息比對一律用 `grep -o … | wc -l` 或 Python 的字串計數。

### 十、G1-G3 的處置與 S3 前置的實測（2026-09-24 第三輪）

verify 第二輪判 **PASSED**，並提出 G1-G4。FO 授權 **G1／G2／G3 fix**；
**G4 由 FO 自己補**（`### Feedback Cycles` 的 Cycle 行是 FO 負責的記錄，worker 不代寫）。
本輪**對正式試算表零寫入、零讀取**：所需標題第一節已逐字記載，重跑只需本機 fixture。
`src/data/*.json` 零改動。diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。

#### G3：S3 的分辨表加了兩項機器可判的前置

**問題**：原表第 1 列的前兩個條件（main exit 0、`diff` 落在那 59 列之內）
**誤刪一列已核可的列也會同時滿足**。擋住它的只有第三個條件「編輯台確認是有人正常填稿」，
那是人工判斷。若有人把 `diff` 位置當成充分條件就會重量 baseline，
**把掉掉的那一列一起烤進新基準，之後 AC-1 反而會通過。**

**修法**：第 1 列再加**檢查①筆數**（`（40 筆）`／`（16 筆，含 tldr）`）
與**檢查②id 清單**（AC-3 的比對指令提前跑一次，兩行都要 `✅ id 清單一致`）。
另加一列專門處理「檢查①或②沒通過」，明寫**絕對不要重量 baseline**。

**兩個方向都驗過。** 手法：用第一節記載的真實標題造一個階段一完成後的本機 fixture
（Track 1 十四欄、Track 2 十七欄、`site_tldr` 五欄，即 S1／S2 做完的狀態），
內容列是合成的，但**列數與已核可數刻意造成與正式表相同**——
42／43／4 列資料、40／15／4 列 `Approved`，所以 main 印出的筆數就是 `（40 筆）` 與 `（16 筆，含 tldr）`。
main 的同步取自 `git show main:scripts/sync-content.mjs`，在 `mktemp -d` 沙箱執行。
baseline ＝ 未改動的那份 fixture 的輸出。

| 情境 | 做了什麼 | main | 筆數 | AC-3 id 比對 | sha256 | 舊前置 | **新前置** |
|---|---|---|---|---|---|---|---|
| **A** | 編輯合法填 `chapter`（`h1`） | exit 0 | 40／16 ✅ | ✅ 一致 | history 變 | 放行 | **放行** ✅ |
| **A2** | 編輯合法填 `owl_depth_comment`（`d1`） | exit 0 | 40／16 ✅ | ✅ 一致 | discussions 變 | 放行 | **放行** ✅ |
| **B** | 誤刪一列已核可的 `h1` | exit 0 | **39**／16 ⛔ | ⛔ `少了:["h1"]` | history 變 | **放行（誤判）** | **擋住** ✅ |
| **B2** | 誤刪一列已核可的 `d1` | exit 0 | 40／**15** ⛔ | ⛔ `少了:["d1"]` | discussions 變 | **放行（誤判）** | **擋住** ✅ |
| **B3** | 刪掉 `h1`、同時新增一列已核可的 `h99` | exit 0 | 40／16 ✅ | ⛔ `少了:["h1"] 多了:["h99"]` | history 變 | **放行（誤判）** | **擋住** ✅ |

四項結論：

1. **(a) 方向成立**：B／B2／B3 三種掉列情形，新前置全部擋住。
   verify 實測的情境 B 我獨立重現，**筆數逐字印出 `（39 筆）`、id 比對逐字印出 `⛔ 少了:["h1"]`**。
2. **(b) 方向成立**：A／A2 兩種編輯合法填值，新前置**全部放行**。
   加了前置之後仍然走得到「重新量 baseline」那一格，**不是把誤判的路換成永遠停住的路。**
3. **舊前置在五個情境下全部放行**——包含三種掉列。這證實 G3 的前提：
   光看 exit code 與 `diff` 位置，**誤刪與合法填值長得一樣**。
4. **兩項檢查缺一不可。** 情境 B3（刪一列又補一列）筆數仍是 40，只有 id 比對抓得到。
   所以表裡寫的是「檢查①**與**②都通過」。

**沒有碰 AC-1 或 AC-2 的條文。** 修改全部落在 S3。
檢查②用的是 AC-3 的指令原樣提前跑，只把 `OUT` 指到沙箱，判準沒有另立一套。

#### G1：P3-7 的行號——這不是錯的行號，是錯的記法

verify 說 P3-7 在第 905 行、第 865 行是 P3-4 的 `opposing_views`。**這在 main 上完全正確。**
但我實讀本 worktree 得到的是 **865**。兩邊都不是筆誤：

| checkout | `TODO.md` 行數 | P3-7 的行號 |
|---|---|---|
| main（`main` 分支） | 1046 | **905** |
| 本 worktree（`spacedock-ensign/050-…`） | 1006 | **865** |

`git diff` 兩個 blob：**main 多 40 行，插在第 596-635 行**（features 065／066／049 加的兩筆 P1-9）。
第 596 行之前兩邊逐字相同，之後一律差 40 行。
`905 － 865 ＝ 40`，與插入行數相符。

**所以「`TODO.md:行號`」這種引用在本票沒有唯一答案。**
這比「行號寫錯」嚴重一級：它不是查一次就能修好的，它會隨著讀者站在哪個 checkout 而改變。

**處置**：第九節那一列改為名稱引用，並把這個成因寫進該列。
**同時把票內最後一處 `TODO.md:行號` 也改掉**——步驟 3 的表與第三節原本寫 `TODO.md:156`
（cycle 2 對 F3 的修正），改為 `TODO.md` 的 P1-5「附帶問題已解決」。
`:156` 目前在兩個 checkout 都正確（因為差異從第 596 行才開始），
**但那是運氣，不是保證**：只要有人在 main 的第 156 行之前插入內容，它就會失準。

**另外查了票內其他被引用的檔在兩個 checkout 是否相同。**
`editor-onboarding.md`、`2026-08-31-content-pipeline.md`、`design.md`、
`040-approval-content-version-binding.md`、`AGENTS.md`、`CLAUDE.md`、`scripts/sync-content.mjs`
**七個檔兩邊都是同一個 blob**，所以那些行號無歧義，本輪不動它們。
`approval-workflow.gs` 與 `operations.md` 只存在於 040 的 worktree，票內已註明。

#### G2：把掃描的邊界寫進票內，並把範圍擴到第二族

verify 確認「掃描當下的 `檔名:行號` 一處都沒漏」，要修的不是結果而是**清單沒有寫明自己的涵蓋面**。
第九節的表頭已補上三條邊界（快照時點／只掃一族／行號的 checkout 前提），
並補進 5 列。其中 4 列實讀通過：

| 補進來的引用 | 結果 |
|---|---|
| main `sync-content.mjs:294` | ✅ `addError` 樣板逐字相符。**它是 cycle 2 自己為 F2 新增的引用，加在該輪掃描之後** |
| `AGENTS.md` 第 1 條 | ✅ 第 12 行 `### 1. 不要自己執行內容同步` |
| `design.md` 第二節的欄位表 | ✅ 第二節內三個分頁各有欄位表 |
| `design.md` 第五節施工順序表 | ✅ `## 五、更新流程與施工順序` 內有 `### 施工順序` 表 |

**第 5 列是本輪新查出的錯，而且它比 G1 嚴重：引錯的是檔名。**

票內兩處（`## 已知的工作內容` 第 3 點、步驟 7）寫
「`design.md` 明訂舊列不能批次補造指紋」「`design.md` 禁止的是批次補造指紋」。
**`design.md` 沒有這一條。** 全檔 `grep 補造` 零命中；`指紋` 只出現 5 次，
全在修訂紀錄與一條 041 的實測註記裡，沒有任何禁令。

該規則實際在三個地方：

| 出處 | 原句 |
|---|---|
| `editor-onboarding.md:432-433` | 「另外舊列不能批次補造指紋。／部署新欄位後既有的 `Approved` 會全部先顯示 `Needs review`，需要編輯台重新核可一輪。」 |
| `040-approval-content-version-binding.md:173` | 「舊列不能批次補造指紋。部署新欄位後，既有 `Approved` 全部先顯示 `Needs review`。編輯台重新核可後才能同步。」 |
| 040 worktree 的 `operations.md:13` | 「不要批次替舊列補造指紋。部署後要逐列重新核可。」 |

**票內那句的措辭與 `editor-onboarding.md:432-433` 逐字最接近**，所以兩處都改指它。
步驟 7 另外把「手動貼上或用公式填 `approved_fingerprint`」標明為**本票的舉例，不是原文**。

**實質規則沒有變，captain 要做的事一個字都沒變**——舊列仍然不能批次補造指紋，
仍然要逐列重新核可。改的只是「這條規則寫在哪裡」。
這一筆是靠 G2 擴大範圍才浮出來的：`design.md` 的兩處引用**不帶行號也不帶節號**，
所以它們既不在 `檔名:行號` 一族、也不在 `檔名 第 N 節` 一族，兩輪掃描都掃不到。
**第三族是「只寫檔名、不寫位置」的引用**，本表已把這兩處納入。

#### 錨點不等於修好：採納 verify 的評價

verify 判定 cycle 2 補章節錨點是「**部分改善不是修好**」。**這個評價是對的，我採納。**

- 行號 45／53 **仍然寫在文字裡**。上方一插入內容，那兩個數字就再次失準。
- 錨點買到的是「**可復原**」——讀者發現行號不對時，還有辦法找到那句話。
- 它買不到「**不漂移**」。要不漂移，行號就不能留。

**判斷：那兩處自我引用的行號，拿掉。只留錨點。** 四個理由：

1. **自我引用是最會漂移的一種。** 本票每一輪都在後面追加章節；
   cycle 2 光是插入第九節就把 `## 相依關係釐清` 以下全部往下推了 100 多行。
   對同一份文件的行號引用，等於保證會失準。
2. **錨點已經夠精確。** `## 相依關係` 的第二個項目符號、`## Risk evidence` 的首句，
   兩者各自只對應一句話。加上行號**沒有增加任何精確度**。
3. **票內已有正確示範。** 三處 P3-7 都以名稱引用、不帶行號，
   所以 G1 那個錯行號**沒有打壞任何一處載重引用**——這正是名稱引用的價值。
4. **G1 又補了一個更強的理由。** 行號在兩個 checkout 可以有兩個合法答案，
   名稱引用不會。

**沒有一併拿掉的是跨檔引用的行號**，理由要說清楚，因為這是不對稱的處置：
那些檔（七個）在兩個 checkout 是同一個 blob，而且本票不會去改它們——
它們的行號本輪已全部實讀通過，**留著行號比只寫章節名好查**。
`TODO.md` 是唯一的例外，已改為名稱引用。
**判準是「這個檔會不會在我引用它之後變動」**，不是「行號一律不好」。

#### 未越界

- **正式 Google 試算表零寫入、零讀取。** 本輪沒有發出任何 HTTP 請求到試算表。
  fixture 的標題取自第一節已逐字記載的實測標題；內容列是合成的。
- 未執行 `npm run sync-content`。main 的同步跑了七次（baseline 兩次與五個情境各一次），
  七次都在 `mktemp -d` 沙箱、餵本機 fixture，輸出寫進沙箱自己的 `src/data/`。
- `src/data/*.json` 逐位元組未變，sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。
- **AC 的要求文字一字未動。** G3 的修改全部落在 S3，未碰 AC-1、AC-2、AC-3 的條文。
- **承重數字原值保留**：24／9／15 欄、59 列、12／15 個保護範圍、6 個連續段。
  **S7 與 S8 兩個區塊逐字未動。**
- `src/`、`scripts/` 零變動。未動 040 的 worktree（只以 `git show`、唯讀 `sed`／`grep` 取內容）。
- **未代 FO 補寫 `### Feedback Cycles`**，也未改動 FO 已寫的 Cycle 1 那一行。
- 判定中文字串未使用 `sort`／`uniq`；計數用 Python 字串計數與 `grep -c`。未使用 `awk` 做任何判斷。

### 十一、H1-H4 的處置（2026-09-24 第四輪）

verify 第三輪判 **PASSED**，並提出 H1-H4。FO 授權四筆全部 fix，
但 **H1 只做事實更新——🔴 裁決本身由 FO 直接送 captain，worker 不解、也不代 captain 確認。**
本輪**對正式試算表零寫入、零讀取**。`src/data/*.json` 零改動。
diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。

| finding | 分類 | 改了哪裡 |
|---|---|---|
| **H1** | 事實更新 | 「相依二」加 044 的 front matter 更正、重寫三個選項、寫明 `operations.md:12` 與 AC-4 前置已過期、寫明還開著的只剩 040 Out of scope 後半句；步驟 4 的前置、design stage 的 Out of scope、Documentation impact 的 044 那一列一併更正 |
| **H2** | 方法 | 第九節補**第四族**（票對票的引用）與其檢查方式、失效模式，並新增一小節列出全票 5 張被引用票的重讀結果 |
| **H3** | Polish | 「整列刪除」那句加 ⚠️ 更正，說明 043 尚未定案且門檻擋不住單列誤刪，防線是 S3 的檢查①② |
| **H4** | Polish | 「相依一」新增一小節，把 040 branch 上三個檔的行號釘在 commit `a51b5d9` |

#### H1 沒有做的事

- **沒有解 🔴。** 三個選項仍然列在票內，仍然標著需要 captain 裁決。
- **沒有代 captain 確認 040 Out of scope 的後半句。** 票內明寫那一半仍在 captain 手上。
- **沒有動 `## Acceptance criteria` 一個字。** AC-4 的資源前置已過期這件事，
  寫在「相依二」而不是寫進 AC-4——本輪該區塊逐位元組未動。

> ✅ **2026-09-25 裁決落地：captain 已親自確認放行，選定選項 A。上面的原句保留。**
>
> | 項目 | 內容 |
> |---|---|
> | 裁決者 | `person:captain` |
> | 日期 | 2026-09-25 |
> | 裁決內容 | `040` Out of scope 的後半句「**並由 captain 確認**」——**確認放行**，並選定**選項 A** |
> | 授權來源 | `gate:050:review` / `gate-attempt:050-review-1`，decision `revise`，actor `person:captain`；被審快照 `briefing:050:review:attempt-1:revision-1`（artifact rev `sha256:324d436a…283bae3`） |
> | 依據 | `## Review-finding disposition` 第 5 條——只有 captain 能改已核准範圍與驗收標準 |
>
> **所以這個 🔴 已解。** 兩個條件現在都成立：
> 「隔離測試表完成驗證」✅（`044`，2026-09-21，PASSED，score 0.96）、
> 「並由 captain 確認」✅（2026-09-25，選項 A）。
> **本票不改寫 `040` 的票**；那張票的 Out of scope 原文不動，本票只記錄 captain 的這次確認。
>
> **這一節記的是 2026-09-24 第四輪的處置，敘述在當時為真，依本票慣例保留。**
> 現行狀態見「相依關係釐清」的相依二。

#### H4 沒有照抄 044 的 commit，理由在這裡

FO 的提示是「044 把 `.gs` 釘到 `093cd01`，比照辦理」。**照抄會出錯。** 實查：

| 檔 | `093cd01` | `a51b5d9`（040 目前 HEAD，也是本票實讀的版本） |
|---|---|---|
| `approval-workflow.gs` | `cd380aee1071…`、263 行 | **相同** |
| `operations.md` | `a01a0d47237e…`、79 行 | **相同** |
| `sync-content.mjs` | `c2a8b978ade6…`、**807 行** | `7e9ab0587035…`、**824 行** |

`.gs` 與 `operations.md` 兩個 commit 是同一份位元組，所以兩份記錄互相印證。
**但 `sync-content.mjs` 不同**：在 `093cd01`，`publishedRowSequences` **根本不存在**，
第 392 行是另一條敘述。**本票的 `sync-content.mjs:392` 只在 `a51b5d9` 成立**，
所以三個檔一律釘 `a51b5d9`。

**這件事本身就是 H4 的證據**：040 尚未合併，它的檔案在兩個 commit 之間真的動了 17 行。

#### 未越界

- **正式 Google 試算表零寫入、零讀取。** 本輪沒有發出任何 HTTP 請求，也沒有跑任何同步。
- 未執行 `npm run sync-content`。`src/data/*.json` 逐位元組未變，
  sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。
- **`## Acceptance criteria` 整段逐位元組未動**，AC 的要求文字一字未改。
- **承重數字原值保留**：24／9／15 欄、59 列、12／15 個保護範圍、6 個連續段。
  **S7 與 S8 兩個區塊逐位元組未動。**
- **`### Feedback Cycles` 逐位元組未動，`- Cycle` 行數維持 1。** 未代 FO 補寫。
- `src/`、`scripts/` 零變動。未動 040 的 worktree（只以 `git show` 唯讀取出內容，
  該 worktree 的 `git status` 全程為空、HEAD 仍為 `a51b5d9`）。
- 判定中文字串未使用 `sort`／`uniq`；計數用 Python 與 `grep -c`。未使用 `awk`。

### 十二、J1-J2 的處置（2026-09-24 第五輪，收斂輪）

verify 第四輪判 **PASSED**，並提出 J1／J2，兩筆都是 Polish。
**FO 指定本輪為收斂輪：把這兩筆做乾淨，不開新的掃描維度。** 本節只記這兩筆。
本輪**對正式試算表零寫入、零讀取**，`src/data/*.json` 零改動。
diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。

#### J1：三處「另一張票／後續票／另議」指向的票都不存在

**沒有開新票。開不開票是 captain 的範圍決定。本輪做的是讓缺口可見。**
三處都改成明白話，原句一律保留：

| 位置 | 改成什麼 |
|---|---|
| 步驟 1 的說明框 | 「廢除 `chapter` 目前尚無 feature 票，負責人未定」，並指向它唯一的落腳處 `TODO.md` 的 **P3-7**（以名稱引用，不寫行號）。另寫明**本票反而讓它更難處理**——本票新建的空白 `chapter` 欄從此有技術用途，廢除它要連 `approval-workflow.gs` 一起改 |
| design stage 的 Out of scope | 「這個落差目前尚無票，負責人未定」，並寫明原句「要記成後續票」本身是一個沒有被執行的指令。補上 promote-to-material 條件與「現況不壞」的實測依據（見下） |
| Out of scope | 「整列刪除的保護目前尚無票，負責人未定」，並寫明**它不是 `043`** |

**查證方式**：讀 `docs/constitution-features/` 下全部 66 張票的 `title` 與 `status`（含 `_archive/`）。
沒有任何一張票的題目涵蓋這三件事。

#### J1 第二處：現況不壞，風險在之後

這一項與另外兩項不同，因為**它的觸發條件正是 captain 現在在做的事**——輸入含中文說明的標題。
所以票內同時寫了兩件事，避免讀者只讀到一半：

- **現在是安全的。** 第三節與第四節已實測：照票內建議輸入的 18／21／12 個標題字串
  **同時通過 `resolveApprovalHeaders_` 與 040 新版同步**，輸出與純欄名版本逐字相同（證據 4 亦同）。
- **升級為 Material 的條件：有人在部署後改動三個分頁上任何一個標題字串。**
  `approval-workflow.gs` 沒有別名表而 `sync-content.mjs` 有，兩支程式容忍度不同；
  屆時 Apps Script 可能無聲失效，而同步程式仍然通過，**兩邊不會互相提醒**。

#### J1 第三處：順帶更正一個綁在一起的說法

Out of scope 原句是「不處理標題列**與**整列刪除的保護範圍（另議）」，把兩件事綁在一起。
**但本票只擱下其中一件**：標題列的保護本票**有做**（步驟 6 的 C 類、
S7 的 `A1:R1`／`A1:U1`／`A1:L1`、AC-5），沒做的是整列刪除的保護。
所以「尚無票、負責人未定」只適用於整列刪除那一半。**原句保留，更正寫在下方的 ⚠️ 框。**

`043` 補不上這一格的理由也寫進票內：**`043` 是同步端偵測，這裡缺的是試算表端預防**，
時機與機制都不同；而且 043 自己 `status: design`、尚未決定是否進行。
本票目前對誤刪的替代防線是 S3 的檢查①②與 S9——**那是偵測不是預防**，
抓到的時候列已經不見了，要靠 Google 試算表的版本記錄救回。

#### J2：`## Risk evidence` 補一句 spike 的進度

該節首句說 spike 的**形式**是 044，**那句話沒有錯，所以原句不動**。
問題是該節要回答「風險現在如何」，而讀者在那裡讀不到 spike 已經做完。
首句下方加一則引言：**該 spike 已由 feature 044 於 2026-09-21 完成並 PASSED**
（`score: 0.96`，已歸檔），詳見相依二；並點明原句講的是形式不是進度。

**verify 判定不該改的兩處維持原狀**：`## Problem` 的「feature 044 只做隔離測試表的 probe，
不碰正式表」仍為真；`## 相依關係` 的「兩者不互為前置」下方已有 ⚠️ 更正塊。**兩處逐位元組未動。**

#### 本輪沒有做的事

- **沒有開新票。**
- **沒有解 🔴，沒有代 captain 確認** 040 Out of scope 的後半句。
- **沒有開新的掃描維度。** 查全部票的 `title`／`status` 是為了確認 J1 三處的事實，
  不是第六族掃描。
- **沒有動** `## Acceptance criteria`、S3、S7、S8、`### Feedback Cycles`、verify 第四輪整段。

> ✅ **2026-09-25 裁決落地：captain 已親自確認放行，選定選項 A。上面的原句保留。**
>
> | 項目 | 內容 |
> |---|---|
> | 裁決者 | `person:captain` |
> | 日期 | 2026-09-25 |
> | 裁決內容 | `040` Out of scope 的後半句「**並由 captain 確認**」——**確認放行**，並選定**選項 A** |
> | 授權來源 | `gate:050:review` / `gate-attempt:050-review-1`，decision `revise`，actor `person:captain`；被審快照 `briefing:050:review:attempt-1:revision-1`（artifact rev `sha256:324d436a…283bae3`） |
> | 依據 | `## Review-finding disposition` 第 5 條——只有 captain 能改已核准範圍與驗收標準 |
>
> **所以這個 🔴 已解。** 兩個條件現在都成立：
> 「隔離測試表完成驗證」✅（`044`，2026-09-21，PASSED，score 0.96）、
> 「並由 captain 確認」✅（2026-09-25，選項 A）。
> **本票不改寫 `040` 的票**；那張票的 Out of scope 原文不動，本票只記錄 captain 的這次確認。
>
> **這一節記的是 2026-09-24 第五輪的處置，敘述在當時為真，依本票慣例保留。**
> 現行狀態見「相依關係釐清」的相依二。

#### 未越界

- **正式 Google 試算表零寫入、零讀取。** 本輪未發出任何 HTTP 請求，未跑任何同步。
- 未執行 `npm run sync-content`。`src/data/*.json` 逐位元組未變，
  sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。
- **`## Acceptance criteria` 整段、S3、S7、S8 四個區塊逐位元組未動。**
  承重數字 24／9／15 欄、59 列、12／15 個保護範圍、6 個連續段原值保留。
- **`### Feedback Cycles` 逐位元組未動，`- Cycle` 行數維持 1。**
- `src/`、`scripts/` 零變動。040 worktree 未動，`git status` 為空、HEAD 仍為 `a51b5d9`。
- 判定中文字串未使用 `sort`／`uniq`；未使用 `awk`。

### 十三、K1-K6 的處置（2026-09-24 第六輪，review 判 REJECTED）

review 判 **REJECTED**，唯一阻擋項是 **K1（Material）**。**captain 已被告知暫停 S7。**
K1-K3 的來源都是同一件事：**`044` 為本票寫了三項結論，明寫「由 050 自己的 stage 採用」，
而本票一項都沒有採用**，其中兩項票內還寫了相反的話。本輪全部採用。
本輪**對正式試算表零寫入、零讀取**，`src/data/*.json` 零改動。
diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。

| finding | 分類 | 改了哪裡 |
|---|---|---|
| **K1** | **Material** | S7 新增 **S7-a**（權限模式）、**S7-b**（30 格行為驗收）、**S7-c**（AC-4／AC-5 卡在 S8 之前） |
| **K2** | — | 步驟 6 的 A 類措辭改寫 ＋ 新增 ⚠️「不要手動編輯 `status`」；步驟 7 第 4 點改寫 |
| **K3** | — | 步驟 7「常見錯誤」表新增靜默失敗那一列；第 4 點改寫成兩種原因並列 |
| **K4** | 方法 | 第九節邊界宣告新增**第六族**與其檢查指令，另新增一小節列出 5 張票的重讀結果 |
| **K5** | Polish | S3 之前補一行 `REPO=…`；AC-6 的 `# 必須是 1` 註解改為雙向標註 |
| **K6** | Polish | 相依一的證據句加 ⚠️ 更正（main 現在有三個檔），原句保留 |

#### K1：為什麼這一筆的損害形狀與前面六輪的每一筆都不同

> ⚠️ **更正（第八輪，來源是 review 的 K13）：本小節的標題與首句原本寫**
> 「**為什麼這一筆是 Material，而前面六輪的發現都不是**」與
> 「**前五族的錯都是「查不到出處」**」，**兩句都不成立，而且是 K10 漏掉的第三處。**
> Cycle 1 的 **F2** 與 Cycle 3 的 **H1** 都是 Material（H1 就是第四族）。
> 第七輪處理 K10 時宣稱「三處都處理」，**實際只處理兩處**——漏的就是這裡。
> 準確的分級表見第九節「第六族」那一小節。**原句保留於本框內。**

**前五族的錯多半是「查不到出處」**——讀者照票去找會找不到，
但 captain 照票做出來的東西通常還是對的。**第四族的 H1 是例外，它傷的是決策品質。**
**K1 又不同：照票做出來的東西可能是錯的，而且沒有任何一步會告訴他。**

reviewer 把 S7 之後每一道檢查都走過一次——S8 的核可、S9 的 sha256 與 `diff`、
AC-3 的 id 比對、AC-1／AC-2／AC-6、步驟 5 與 S6 的公式檢查——**沒有一道會揭露保護未生效**。
**成因是 captain 是擁有者，保護範圍排除不了他**：
他執行的每一步都會成功，不論保護有沒有設對。
**他會把整場部署做完，然後永遠不會知道。**

這就是 **S7-c 必須排在 S8 之前**的理由，也是為什麼第三項處置與前兩項一樣重要：
**偵測必須擋在核可之前。** 排在之後等於沒排。

#### K1 的三項處置，逐項對應

**(1) S7-b 直接採用 `044` 的檢查表，沒有自己另發明一份。**
那份是實測過的，而且**就是抓出 P2 假通過的那一份**。
`044` 的原表是 10 格（9 格擋 ＋ 1 格反向對照「`content` 必須可改」）、三個分頁各做一次 ＝ **30 格**。
本票**欄位與類別逐項照抄**，只把 A1 位置換成本票 S2／S4 排序算出的位置
（`044` 的測試表欄序與正式表不同，照抄 A1 位置會指到別的欄）。

對照本票原有的驗收範圍：**AC-4 的 3 格（只在 `Track 1_history`）＋ AC-5 的 3 格標題列 ＝ 6 格**。
`Track 2_discussion` 與 `site_tldr` 的審核欄原本一格都沒有被驗收；
`review_decision`／`review_fingerprint`／`approved_at`／`approved_fingerprint`／`reject_reason`
**五欄在任何分頁都沒有被驗收**。S7-b 補上這些。

**一項本票自己加的要求，明文標示為本票所加**：反向對照那一格測完要**立刻還原**。
`044` 不需要——它在可丟棄的測試表上做；
本票在 40 筆已上線內容的唯一來源上做，那一格留著改動就會讓 S9 的 AC-1 sha256 不符。
同時寫明**此刻改內容是安全的**：S6 之後所有列都是 `Needs review`，還沒有任何一列被核可。

**(2) S7-a 補權限模式。** 「限制可編輯此範圍的使用者」vs「編輯這個範圍時顯示警告」
這個選擇，**原本全票只出現一次**——在 AC-4 的「會怎麼失敗」，
**不在 captain 實際執行的步驟 6 或 S7 裡**。而 `044` 把它標為 ⚠️，
因為**選錯就是 P2 假通過的成因**。現在寫在 S7-a，並引用 `044` 原句，12 個範圍每個都要確認。

**(3) S7-c 把 AC-4／AC-5 排進 runbook。**
原本 **AC-4／AC-5 在步驟 0-9 與 S1-S9 之中從未被排進去**——
S1-S9 只引用 AC-1、AC-3、AC-6。
**本票唯一能偵測「保護未生效」的兩項驗收，沒有任何一步要求執行它們。**
現在它們是 S7-c，落點在 S7-b 之後、S8 之前。

#### 本輪沒有動 AC 一個字

**S7-b 要求 30 格，AC-4 的 `Verified by:` 要求 3 格**——兩者不衝突，
因為 **runbook 的操作要求與 AC 的驗收門檻是兩件事**，前者可以比後者寬。
票內已在 S7-c 講明這一點。

**AC-4 本身要不要從 3 格擴到逐欄逐分頁、要不要納入反向對照，
依 `## Review-finding disposition` 第 5 條只有 captain 能改**，已另行送交 captain。
在裁決前：**照 S7-b 做 30 格**，AC-4／AC-5 依原文各自成立即可。
`## Acceptance criteria` 的要求文字本輪逐字未動（唯一改動是 AC-6 bash 區塊裡一行**註解**的方向標註，見 K5）。

#### K2／K3：本票寫了與 `044` 相反的話

**K2**：步驟 6 的 A 類原本寫「**只有 captain**（連責任編輯都不給）」，理由「手改等於偽造核可狀態」
——**那是把「captain 可改」講成一項刻意授予的權限**。
`044` 的原意相反：**擁有者改得動是平台限制，規則是不要改。**
機械成因已實讀 `approval-workflow.gs:156-171`（釘在 `a51b5d9`）：
`installApprovalFormulas` 對每列用 `setFormula` 寫入這兩欄，
輸入字面值會**覆蓋該列公式**，該列狀態自此不再自動更新。
**而它壞掉的是本票自己的驗證迴路**——步驟 5／S6 與步驟 7 第 4 點都叫 captain 讀 `status` 當成功訊號。
還原方式（重跑「安裝／更新公式」）已寫進票內。

**K3**：步驟 7 第 4 點原本寫「沒變就是有問題，程式會**自動復原整批審核欄位**並報錯」，
而 `044` 實測的是**沒有錯誤訊息**。原句對「程式跑了並偵測到問題」成立，
**對靜默失敗不成立**。第 4 點已改成兩種原因並列，「常見錯誤」表補上第五列。
**captain 自己踩不到**（擁有者永遠在允許名單內）；
**責任編輯只要不在 B 類的允許名單內就會踩到**——
那正是步驟 6 B 類指定的角色，也是部署後執行核可的人。

#### 未越界

- **正式 Google 試算表零寫入、零讀取。** 本輪未發出任何 HTTP 請求，未跑任何同步。
- **AC 的要求文字逐字未動。** 未擴大 AC-4，未代 captain 裁決。
- **S3 與 S8 兩個區塊逐位元組未動。** S7 本輪改動，屬 K1 的授權範圍。
  `REPO=` 那一行加在 S3 **之前**，不在 S3 區塊內。
- 承重數字 24／9／15 欄、59 列、12／15 個保護範圍、6 個連續段原值保留。
- **`### Feedback Cycles` 逐位元組未動，`- Cycle` 行數維持 4。**
- 未執行 `npm run sync-content`。`src/data/*.json` 逐位元組未變，
  sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。`src/`、`scripts/` 零變動。
- 040 worktree 未動，`git status` 為空、HEAD 仍為 `a51b5d9`。
- 判定中文字串未使用 `sort`／`uniq`；未使用 `awk`。

### 十四、K7-K10 的處置（2026-09-24 第七輪，review 判 REJECTED）

review 判 **REJECTED**，只因 **K7** 一筆（Material）。
**K1 的實質內容 review 逐格驗過全部正確**——30 格逐列相符、30 個 A1 位置它自己重算逐格相同、
三個反向對照格對各分頁 4 個範圍逐一做包含判定全在範圍外、Ctrl+Z 正確且必要、
「此刻改內容是安全的」由 `APPROVAL_STATUS` 與 `installApprovalFormulas` 驗過成立；K2-K6 全部正確。
**K7 錯的是「誰去測」——而那是 S7-b 存在的全部意義。**
本輪**對正式試算表零寫入、零讀取**，`src/data/*.json` 零改動。
diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。

#### K7（Material）：角色寫錯，而那 30 格的預期值全靠角色成立

**錯在哪**：S7-b 第 1 點原本寫「用 `044` 那個第二個 Google 帳號（**責任編輯角色**）登入」。
**那個帳號在 `044` 裡是投稿者，不是責任編輯。**
`044` 的帳號表寫得很清楚：**A ＝ 責任編輯／核可者 ＝ 測試表擁有者**（captain 現用帳號）；
**B ＝ 投稿者，以「編輯者」身分受邀，不是擁有者**。

**為什麼這一筆是 Material**：本票 B 類設的是「只有責任編輯」，
所以 **30 格裡有 18 格（六個審核欄 × 3 分頁）的預期值「擋」只對投稿者成立**。
角色寫反有兩條假通過的路，**兩條都會讓部署後的責任編輯核可靜默失敗**——
正是第六輪剛寫進步驟 7「常見錯誤」表的那一列。詳細推導寫在 S7-b 的
「為什麼角色必須是投稿者」一小節，含 12／18 分堆表與兩條假通過路徑。

**三句話的修法，全部落在 S7-b 第 1 點：**

1. **角色改為投稿者**，並明寫不能是 captain（擁有者不受保護範圍限制）、
   也不能是責任編輯（B 類允許名單裡就是他，那六欄他本來就改得動）。
   **⛔ 不要把該帳號加進 B 類或任何一類的允許名單。**
2. **補前置**：該帳號**目前沒有正式表的權限**——`044` 步驟 15 第 2 點已把它從**測試表**移除，
   而它**從未被加入正式表**，本票原本沒有一句建立這個前置。
   修法寫明時機（S7 的 12 個範圍全設完之後才共用，比照 `044`「先保護，後邀請」）
   與做法（共用 → 加入該帳號 → 權限「編輯者」，**不勾**「編輯者可以變更權限和共用設定」）。
3. **補收尾**：S7-b 與 S7-c 都做完之後，把該帳號從正式表的共用名單移除，比照 `044` 步驟 15 第 2 點。

**未碰 AC、未碰承重數字、未碰那 30 格與 30 個 A1 位置。** 改的是「誰去測」與它的前置與收尾。

**另記一項殘留缺口（本輪不修，已寫在 S7-b）**：S7-b 只驗一個方向。
它驗「投稿者改不到那六欄」，**不驗「責任編輯改得到那六欄」**。
B 類就算設成「只有 captain」或允許名單是空的，30 格照樣全過。
補這個方向要改那 30 格或擴大 AC-4，**兩者本輪都無權限**；
最早的偵測點是 S8，而本票 S8 寫的是 captain 執行，所以照票做不會觸發。

#### K8：措辭收斂

步驟 7「常見錯誤」表最後一列與第十三節的「**責任編輯一定會踩到**」
改為「**責任編輯只要不在 B 類的允許名單內就會踩到**」。
同一格的「原因」欄本來就寫對了（「執行者不在審核欄（B 類）保護範圍的允許名單內時就會這樣」），
過頭的是「怎麼辦」欄。「也是部署後的常態」改為「也是部署後執行核可的人」。

#### K9：我自己那條掃描指令的涵蓋面不完整——同一個形狀

第六輪為了抓第六族寫下的指令是
`grep -rln … docs/constitution-features/*.md docs/constitution-features/_archive/*.md`。
**glob 只涵蓋兩層 `.md`**，漏掉 `_debriefs/`、`_mods/` 與各票的子目錄。
**漏掉的那一檔在 2026-09-17 就記著同一項義務。**

**這是第六族自己的形狀**：為了抓「別人指定本票要做的事」而寫的掃描，
自己漏掉了記著那項義務的檔。指令已改為 `-r` 掃整個目錄，命中 8 個檔（舊版 5 個），
新增的三個與五處詞界誤判都已寫進「第六族」那張表。
**這一筆是 review 查出的（K9），不是本票自己發現的。**

#### K10：一句不準確的話，來源是 FO 的授權書

票內原本寫「第六族是唯一產出 Material 的一族／前五族全部是 Polish」。
**兩句都不成立，而且是被票內自己的 `### Feedback Cycles` 推翻的**——
Cycle 1 的 **F2 是 Material**，Cycle 3 的 **H1 是 Material 且 H1 正是第四族**。

**那兩句話出自 FO 在 K4 的授權書，本票照著寫進來，兩邊都沒有回頭對 Cycle 記錄。**
**FO 已自認這一筆是它的錯，並要求本票寫明更正來源是 review 而非 FO。** 照辦：
**這一筆由 review 在第七輪查出（K10）。**
更正與準確陳述（六族各自的最高等級表）寫在第九節「第六族」那一小節；
第六輪 Stage Report 裡同一個錯誤（「K1 是六輪以來第一筆 Material」）已追加更正，原句保留。

**第六族真正獨有的性質已改寫為兩點**：它在票內沒有留下任何可檢查的東西；
以及 **K1 是唯一一筆「照票做完之後沒有任何一步會揭露錯誤」的 Material**
（F2 大聲失敗、H1 傷決策品質，只有 K1 靜默）。

#### 未越界

- **正式 Google 試算表零寫入、零讀取。** 本輪未發出任何 HTTP 請求，未跑任何同步。
- **AC 的要求文字逐字未動**；**AC-4 的擴大仍待 captain，本輪未動。**
- **那 30 格與 30 個 A1 位置逐位元組未動**（review 已逐格驗過）。
- **S3 與 S8 逐位元組未動。** 承重數字 24／9／15 欄、59 列、12／15 個保護範圍、6 個連續段原值保留。
- **未改寫 review 的報告。** 本輪只改本票自己的敘述與本票自己的 Stage Report。
- **`### Feedback Cycles` 逐位元組未動，`- Cycle` 行數維持 4。**
- 未執行 `npm run sync-content`。`src/data/*.json` 逐位元組未變，
  sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。`src/`、`scripts/` 零變動。
- 040 worktree 未動，`git status` 為空、HEAD 仍為 `a51b5d9`。
- 判定中文字串未使用 `sort`／`uniq`；未使用 `awk`。

### 十五、K11-K13 的處置（2026-09-24 第八輪，review 判 PASSED）

review 判 **PASSED，captain 已可開始做 S7。** K11／K12／K13 皆 Polish，不擋部署。
**三筆是同一個形狀**，已寫成第九節的「判準三」：
**更正一個錯誤時，要驗證那句更正自己的涵蓋面。**
本輪**對正式試算表零寫入、零讀取**，`src/data/*.json` 零改動。
diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。

| finding | 改了哪裡 | 原句 | 實際 |
|---|---|---|---|
| **K13** | 第十三節的標題與首句 | 「為什麼這一筆是 Material，而前面六輪的發現都不是」／「前五族的錯都是『查不到出處』」 | F2（Cycle 1）與 H1（Cycle 3）都是 Material。**這是 K10 漏掉的第三處** |
| **K11** | 第九節邊界宣告的 ⚠️ 與「第六族」那張表 | 「debrief 比 `044` 的票更早被寫下」 | **反了。** `044` 結論節 **2026-09-15**、debrief **2026-09-17** |
| **K12** | 第九節「第六族」的詞界誤判段 | 「兩處」＋「這五處」 | **兩個數字都不對，實為 4 處／3 檔**；另多列一項憑空的 `#6-#27` |

#### K11：錯誤源頭是本票，傳遞鏈的第二環是 FO

**這一筆的源頭是本票第七輪處理 K9 時寫下的那半句**（「而且比 `044` 的票更早被寫下」）。
**FO 照抄進 K11 的授權書，又把它轉述給 captain。**
FO 已指出**這是同一天第二次同型的傳遞鏈**（前一次是 F-26 的「2 處」），
**兩次的第二個環都是 FO**。依 FO 要求照實記在票內。

**要確認的結論不變**：那項義務有**兩個見證**，而**兩個都被漏掉了**。
改的只是先後順序——而順序反過來對本票更不利：
**最早的記載是 `044` 自己的票（2026-09-15），而那正是第六族要抓的東西。**
debrief（2026-09-17）是第二個見證，第六輪的 glob 連它也漏掉（K9）。

#### K12：重數，並把重算指令留在票內

正確答案是 **4 處誤判、散在 3 個檔**：`_debriefs/2026-05-02-01.md` 兩處（都是 `0501`，
2026-05-01 的會議日期）、`056` 的兩個 briefing JSON 各一處（`sha256:…fea050324…`、`sha256:…d050a23e…`）。
**`#6-#27` 整個字串裡沒有 `050`，它從來不是一處誤判**——那是憑空寫上去的。
**重算指令已寫進第九節那一段**，依判準二「會動的量測要有一個權威處」。

#### 順帶：我自己票內的「90 個 A1 位置」也是 30

reviewer 在本輪自行更正了它上一輪寫的「90 個 A1 位置」，正確是 **30**。
**它的報告是它的 `record`，本票不動。** 本票要做的是確認自己引用該數字的地方正確——
**票內有 8 處寫「90 個 A1 位置」，全部是從 FO 的授權書照抄來的，全部已改為 30。**
實數：S7-b 那張表 10 個資料列 × 3 個分頁欄 ＝ **30 個 A1 參照**（表內反引號 A1 共 30 個）。

**這是判準三的第四個例子**，而且它和 K11 同一條傳遞鏈：
**一個沒被驗的數量詞，從 reviewer 進 FO 的授權書，再進本票 8 個地方。**

#### 未越界

- **正式 Google 試算表零寫入、零讀取。** 本輪未發出任何 HTTP 請求，未跑任何同步。
- **AC 的要求文字與 `## Acceptance criteria` 整段逐位元組未動**；
  **AC-4 的兩項裁決仍待 captain**；🔴 未解、未代 captain 確認。
- **那 30 格表與它的 30 個 A1 位置、S7 的 12 個範圍表逐位元組未動。**
- **S3 與 S8 逐位元組未動。** 承重數字 24／9／15 欄、59 列、12／15 個保護範圍、6 個連續段原值保留。
- **未改寫 review 或 verify 的任何報告**（含 reviewer 自己那三處「90」）。
  本輪動到的既有 Stage Report 只有**本票自己的 cycle 7 那一份**（8 處數字更正之一落在其中）。
- **`### Feedback Cycles` 逐位元組未動，`- Cycle` 行數維持 4。**
- 未執行 `npm run sync-content`。`src/data/*.json` 逐位元組未變，
  sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。`src/`、`scripts/` 零變動。
- 040 worktree 未動，`git status` 為空、HEAD 仍為 `a51b5d9`。
- 判定中文字串未使用 `sort`／`uniq`；未使用 `awk`。

### 十六、captain 三項授權的處置（2026-09-25 第九輪，review cycle 4 PASSED 後由 captain 裁決 revise）

review cycle 4 判 **PASSED**，**那個 PASSED 不變**。本輪退回 implement 的唯一原因，
是落實 captain 依 `## Review-finding disposition` 第 5 條**親自行使的 AC 變更授權**。
runbook 本身、S7-b 既有的 30 格表、S3、S8 都不是被退回的原因。

| 項目 | 內容 |
|---|---|
| Gate | `gate:050:review` / attempt `gate-attempt:050-review-1` |
| 被審快照 | `briefing:050:review:attempt-1:revision-1`（artifact rev `sha256:324d436a…283bae3`） |
| Decision | `revise`，actor `person:captain`，2026-09-25 |

#### 三項授權，逐項對應

| # | captain 裁決 | 落地位置 |
|---|---|---|
| 一 | **AC-4 擴大**至逐欄逐分頁（30 格） | `## Acceptance criteria` 的 AC-4 改寫（原條文以 ⚠️ 保留）；第八節 S7-c 引言一併校正 |
| 二 | **反向對照 B——收** | 新增 **AC-7**（18 格）與第八節 **S7-d**（帳號前置／執行時機／逐格預期值／不符處置／還原要求／收尾） |
| 三 | **🔴 放行，選項 A** | 第十一節、第十二節、「相依二」三處各加一則 ✅ 裁決框；「相依二」的兩列表第二列與三選項標題一併更新。**原句全部保留** |

#### 現況怎麼查：兩條可重跑的指令（**本票刻意不留任何一次的輸出**）

**票內原本寫「captain 正在 S7」「captain 正在建欄與輸入標題」，那是未查證的轉述。**
傳遞鏈是 review 報告 → FO → 本票，**沒有任何一環查過**。這正是第九節**判準三**的形狀。

> 🔒 **本票自 2026-09-25 起的規則（captain 親自授權，見第十七節的斷根要求）：
> 票內不得斷言「部署現在做到哪裡」。**
>
> 那種句子**會自己過期**，而本票已經因此錯了兩次：
> 先是「captain 正在 S7」（寫下時就是假的），
> 再是本節上一版的「**runbook 一步都還沒開始**」（寫下時可能為真，被 review 讀到時已經是假的——
> captain 在這中間做完了 S1 與 S2）。
>
> - 需要知道現況：**跑下面的指令**。
> - 需要在報告或處置節裡記錄結果：**帶量測時戳（UTC）**，例如「截至 2026-09-25T18:37Z 量測」。
>
> **指令永遠為真，輸出十分鐘後可能就假了。**
> 所以下面兩條指令**只留指令與判讀方式，不留任何一次的輸出**。

**指令一：把票內第五節的標題列解析器原樣重跑，並與第五節的基準 JSON 做 `diff`（只讀正式表，零寫入）。**

**`/tmp/hdr.mjs` 的內容逐字取自本票第五節**（處理引號內換行的完整 CSV 解析），一個字未改。
第五節下方那段 `json` 區塊就是 **2026-09-24 的基準**，存成 `/tmp/hdr-baseline.json` 直接比：

```bash
# 在 repo 根目錄執行。只讀不寫。--env-file 必須在檔名參數之前。
# /tmp/hdr.mjs 的內容見本票第五節，逐字照抄，不要改。
node --env-file=.env.local /tmp/hdr.mjs > /tmp/hdr-now.json
# /tmp/hdr-baseline.json ＝ 本票第五節「完整標題列」那段 json 區塊的內容，原樣貼上。
diff /tmp/hdr-baseline.json /tmp/hdr-now.json \
  && echo "✅ 與 2026-09-24 基準逐字相同" \
  || echo "⛔ 有差異（上方 diff 指出是哪幾行）"
node -e 'const r=require("/tmp/hdr-now.json");for(const[k,v]of Object.entries(r))console.log(k,v.length)'
```

**指令二：照 AC-6 的唯讀 sandbox 跑 main 的 `sync-content.mjs`（只寫暫存目錄，對正式表零寫入）。**

```bash
# $REPO 見 S3 上方的賦值那一行。
SANDBOX="$(mktemp -d)"; mkdir -p "$SANDBOX/scripts" "$SANDBOX/src/data"
git -C "$REPO" show main:scripts/sync-content.mjs > "$SANDBOX/scripts/sync-content.mjs"
node --env-file="$REPO/.env.local" "$SANDBOX/scripts/sync-content.mjs" > "$SANDBOX/out.txt" 2>&1
echo "exit=$?"
cat "$SANDBOX/out.txt"
grep '對不到任何預期欄位' "$SANDBOX/out.txt" | grep -q 'review_decision' \
  && echo "✅ 出現預期的標題錯誤（窗口確實打開）" \
  || echo "⛔ 沒有出現預期的標題錯誤（窗口未打開）"
shasum -a 256 "$SANDBOX/src/data/"*.json | sed 's#/.*/##'
```

##### 怎麼讀這兩條指令——**這張表寫的是判準，不會過期**

| 想知道 | 看哪裡 | 判準 |
|---|---|---|
| **S1** 做了沒（`owl comment` → `owl_comment`） | 指令一的 **`diff`** | `Track 2_discussion` 第 10 欄是 `owl_comment\n(…)`（**底線**）＝已做；是 `owl comment\n(…)`（**半形空格**）＝未做 |
| **S2** 做了沒（三個分頁附加 9 個安全欄） | 指令一的**欄數** | `14／17／5` ＝已做；`10／12／5` ＝未做 |
| **S4** 做了沒（窗口是否打開） | 指令二 | `exit 1` 且 `grep` 印 ✅ ＝**窗口已開**；`exit 0` 且 `grep` 印 ⛔ ＝**窗口未開** |
| 產線現在健不健康 | 指令二 | `exit 0`、逐字印出 `（40 筆）` 與 `（16 筆，含 tldr）`、兩個 sha256 為 `4d1992e3…cea3b`／`4071978a…3162`（＝AC-1 的綁定值） |

> **⛔ 不要用欄數判斷 S1。S1 是就地改標題，不新增也不刪除欄位，欄數不變。**
> 本節上一版寫「**是指令一的欄數 10／12／5 才把 S1／S2 也釘死**」——**那句推理是錯的**，
> 欄數對 S1 沒有任何鑑別力。**釘住 S1 的是 `diff` 印出的那一行標題字串。**
> 原句不再留在本節（它是操作指示，留著會讓人查錯地方）；
> 錯誤本身記在第十七節的 K15，那裡有原句。
>
> **⛔ `grep` 印 ⛔ 不代表失敗。** 與 S3 的讀法一致：
> AC-6 的那個 `grep` 是給窗口**打開之後**用的，窗口還沒開時本來就不該出現標題錯誤。

> **為什麼要兩條指令，不是一條。** 只跑指令二不夠——**階段一是安全的**，
> 做完 S1／S2 之後 main 的同步照樣 exit 0、sha256 照樣相同（第六節的證據 3 就是在證這件事）。
> **指令二只判得出 S4。S1 與 S2 都要靠指令一，而且靠的是它的兩個不同部分**：
> S2 看欄數，**S1 只能看 `diff` 裡的標題字串**。
> **這一段本身就是判準三的用法**：要寫「全部未執行」這種含「全部」的話，
> 不只要確認指令涵蓋「全部」，還要講得出**每一步各由哪一個判準涵蓋**。
> 上一版沒做到第二件事，於是把 S1 算在欄數頭上。

#### 本輪沒有做的事

- **沒有動 S7-b 的 30 格表與它的 30 個 A1 位置。** S7-d 的 18 格**引用**該表第 4-9 列，不另算一份。
- **沒有動 S3、S8**，沒有動承重數字（24 欄／18／21／12／40 筆／16 筆／59 列／12 個保護範圍／6 段）。
- **沒有動 verify 五輪與 review 四輪的任何一個報告區塊。**
- **沒有動 AC-1／AC-2／AC-3／AC-5／AC-6 一個字。** AC-5 未擴大也未收窄。
- **沒有自行擴大或緊縮 captain 未授權的任何 AC。**
- **沒有改寫 `040` 的票。** captain 的確認記在本票，`040` 的 Out of scope 原文不動。
- **沒有對正式試算表寫入任何一格。** 本輪只做兩次唯讀讀取（上方兩條指令），
  未跑 `npm run sync-content`，`src/data/*.json` 逐位元組未變。

#### 留給下一位的一件事

**S7-d 第 1 點的責任編輯帳號，repo 內查不到，只有 captain 能回答。**
兩份文件對正式表的共用名單描述不符（`_archive/044-…:767` ⟷ `docs/health-check/TODO.md` 的 **P3-1**），
兩句可以同時為真（一句講試算表、一句講 Drive 資料夾），也可以其中一句已過時。
**本票沒有猜，把這個分岔與兩條路的做法都寫進 S7-d。**
若走「借用 `044` 第二個帳號」那條，AC-7 只證明機制成立，
**不證明某位實際責任編輯已在名單內**——這個限制已寫在 S7-d 第 1 點，不要事後才發現。

#### 未越界

- **正式 Google 試算表零寫入。** 本輪對它只發出兩次唯讀 HTTP 讀取（第五節的標題列指令、AC-6 的 sandbox），
  兩者都是票內既有的驗證手法，都不寫回任何一格。
- 未執行 `npm run sync-content`。`src/data/*.json` 逐位元組未變，
  sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。
- `src/`、`scripts/` 零變動。040 worktree 未動。
- 整條 branch 只動 `docs/constitution-features/050-ssot-approval-deployment.md` 一個檔。
- **`### Feedback Cycles` 逐位元組未動，`- Cycle` 行數維持 5。** 未代 FO 補寫。
- 承重數字只增不減、無值被替換（新增的 30／18／12／6 都是本輪授權範圍內的新值）。

### 十七、K14-K21 的處置（2026-09-25 第十輪，review 判 REJECTED）

review 第五輪判 **REJECTED**：K14-K18 五筆 **Material**、K19-K21 三筆 **Polish**。
FO 授權**八筆全部 fix**，無 decline、無 hold、無 route for decision。
**三項授權的實質內容 reviewer 判定全部落地且正確**——退回的是上一輪新寫的字裡的事實錯誤。

#### 斷根要求（captain 2026-09-25 親自授權，優先於逐筆修正）

captain 對 FO 的建議「票內不再斷言『部署做到哪裡』——改成時戳，或只留指令不留輸出」回覆**「修」**。

> 🔒 **票內不得再斷言「部署現在做到哪裡」這種會自己過期的事實。**
> 需要記錄現況時，兩條路擇一：
> **(a)** 明寫量測時戳（例：「截至 2026-09-25T18:37Z 量測」），或
> **(b)** **只留可重跑的指令，不留當時的輸出**。
> **指令永遠為真，輸出十分鐘後可能就假了。**

**這是 K14／K15／K19／K20 的根因處置。** reviewer 指出這四筆是第九節**判準三**的同一形狀，
而且是判準三入票後的第一輪就犯了四次。

落地位置：

| 位置 | 採哪一條 |
|---|---|
| 第十六節「現況怎麼查」 | **(b)**——兩條指令原樣保留，**當時的輸出全部移除**，改附一張不會過期的判讀表 |
| `### design stage 追加的 Out of scope` 的 ⚠️ 框 | **(b)**——移除欄數與 sha256 的逐字輸出，改為指向第十六節的指令 |
| 本節下方的「量測記錄」 | **(a)**——帶 UTC 時戳，並明寫它會過期 |

#### 八筆逐項對應

| # | 分類 | 處置 |
|---|---|---|
| **K14** | Material | 兩處 live 敘述（第十六節、design stage Out of scope 的 ⚠️ 框）依斷根要求 **(b)** 改寫，不再斷言進度。原句與錯誤記在本節 |
| **K15** | Material | 第十六節的「欄數釘死 S1」推理錯誤，已移除該句並改為判讀表；原句保留在本節下方 |
| **K16** | Material | `docs/health-check/TODO.md:876` → 改引 **P3-1** 並附兩個 revision 的行號；S7-d 第 1 點加一則「引用 `TODO.md` 一律寫項目編號」的根因註記 |
| **K17** | Material | 「相依二」那兩句 live 敘述加 ⚠️ 更正框（兩列表逐句對照），原句保留 |
| **K18** | Material | 四處 live 的 `sha256:324d436a…dbae3` → `…283bae3`；Stage Report cycle 9 那一處以追加更正處理 |
| **K19** | Polish | AC-4 ⚠️ 框的「原條文」補回漏掉的第二個項目符號與三個 `- ` 標記，並加註這是第二次更正 |
| **K20** | Polish | **修的是判準不是措辭**：S7-d 第 3 點的比對腳本加 `missing`／`extra` 兩個集合，三種突變現在都指名是哪一欄 |
| **K21** | Polish（**有執行後果，優先處理**） | S7-d 第 5 點由「檢查三件事」改為**鑑別診斷**：兩件真成因（含漏列的 A／C 類蓋到六欄）、兩件會讓 S7-d 反而通過的缺陷各由誰抓，並補上「AC-4 抓保護不足、AC-7 抓保護過頭」 |

#### K15 的原句（本節是它唯一的存放處）

> **是指令一的欄數 10／12／5 才把 S1／S2 也釘死。**

**錯在哪**：**S1 是就地改標題，不新增也不刪除欄位**，做完之後欄數不變。
所以欄數對 S1 沒有任何鑑別力，釘住 S1 的是 `diff` 印出的那一行標題字串。
reviewer 抓到的現況就是這句話的反例：S1 已做，而欄數當時仍是 `10／12／5`。

#### K14 的原句（同上）

> **合起來的結論：`S1` 起一步都還沒做，窗口未打開，三個內容欄未被填值，S3 現在是通過的。**

**錯在哪**：這句話**寫下的當時可能為真，被 review 讀到時已經是假的**——
captain 在這中間做完了 S1 與 S2。
**它不是一個查錯的結論，是一個沒有時效標註的結論。** 這正是斷根要求要消滅的句型。

#### 量測記錄（**截至 `2026-09-25T18:37Z` 量測，之後會過期**）

**本節刻意把時戳寫進標題。** 要知道現在的狀況，**跑第十六節的兩條指令**，不要引用這一段。

| 步驟 | 該次量測的結果 |
|---|---|
| **S1**（`owl comment` → `owl_comment`） | **已執行**——`Track 2_discussion` 第 10 欄為 `owl_comment\n(允鍾如果有靈感可以寫一句短評)`（底線） |
| **S2**（三個分頁附加 9 個安全欄） | **已執行**——欄數由 `10／12／5` 變為 **`14／17／5`**；`Track 1_history` 新增 `chapter`／`approved_by`／`approved_at`／`reject_reason` 四欄，`Track 2_discussion` 新增 `owl_depth_comment`／`full_content`／`approved_by`／`approved_at`／`reject_reason` 五欄，全部照票內 S2 的字串 |
| **S4 起** | **尚未執行，窗口未打開**——指令二 `exit 0`、`grep` 判準印 ⛔ |
| 產線健康 | **通過**——`exit 0`、逐字印出 `（40 筆）` 與 `（16 筆，含 tldr）`、兩個 sha256 為 `4d1992e3…cea3b`／`4071978a…3162`，**與 AC-1 的綁定值逐字相同**；AC-3 的 id 清單比對兩份皆 `✅ 一致` |

**AC-1 的基準不變，不需要重量 baseline。** 依 S3 的分辨表：
`diff` 的差異全部落在**新增的九個空白欄**，而檢查①（筆數 40／16）與檢查②（id 清單）都通過，
且 sha256 與 baseline 逐字相同——**S1／S2 沒有改到任何一列的發布內容**。
這也再次印證第六節的證據 3：**新增空白欄不改變同步輸出**。

#### 本輪沒有做的事

- **沒有動 `### Feedback Cycles`。** 它的 Cycle 6 那一行也寫著「runbook 一步都還沒開始」，
  **那一行是 FO 寫的，本票慣例不代 FO 補寫**。已在 Stage Report 列給 FO。
- **沒有動 AC-4 與 AC-7 的條文本體。** K19 動的是 AC-4 下方 ⚠️ 框裡「原條文」那份引文；
  K17 動的是「相依二」的敘述。
- **沒有動 S7-d 的 18 格表與其 A1 位置。** K20 動的是表下方的比對腳本，K21 動的是第 5 點。
- **沒有改寫 `040` 的票**，沒有自行擴大或緊縮任何 AC。
- **對正式試算表零寫入。** 本輪只發出兩次唯讀讀取（第十六節的兩條指令各一次）。

#### 追加：captain 共用名單裁決的處置（2026-09-25，cycle 10 授權追加）

FO 追加一筆授權，範圍限於 K16／K21 已在動的 **S7-d 第 1 點**，外加一筆本票原本沒有的事實。
來源是 captain 於 **2026-09-25** 親自打開正式表「共用」對話框後的口頭回報。

> **這一段的事實強度要講清楚。** captain 的回報**不是 repo 內可驗證的事實**——
> 本票不得把它重述為已驗證，也不記任何 email。要重新確認，只能再打開一次那個對話框。
> 依斷根要求，所有帶「現在」的敘述都標時戳：**以下為 2026-09-25 的回報**。

| 問題 | 回報 |
|---|---|
| 共用名單 | **六人有編輯權限，另三人是檢視者** |
| 名單中有沒有責任編輯 | **有** |
| `044` 的第二個 Google 帳號 | **仍在 captain 手上**，可用於 S7-b 的投稿者角色 |
| 該第二帳號是否已在正式表的共用名單內 | **不在** |

四項處置：

| # | 處置 | 落地位置 |
|---|---|---|
| **(a)** | 兩份文件的矛盾已解：`_archive/044-…:767`**成立**；`docs/health-check/TODO.md` 的 **P3-1** **與正式表現況不符**（它講的是 Drive 資料夾，或已過期）。**不改 `TODO.md`** | S7-d 第 1 點的 ✅ 框 |
| **(b)** | S7-d 的兩條路**收斂為一條**——用真實責任編輯的帳號，**AC-7 因此證明的是實際情況，不只是機制成立**。借用帳號那條降為註記保留（原文逐字留著，寫明為何不再需要、什麼情況要取回） | S7-d 第 1 點 |
| **(c)** | 新事實：**六位編輯者 ＋ 保護範圍要到 S7 才設** ⇒ 三個內容欄在階段一至 S7 期間**對六人全部可寫**。原措辭只點名責任編輯，涵蓋面不足 | S2 的 ⚠️ 框；分類與建議見下 |
| **(d)** | `044` 第二帳號**不在名單內**已由 captain 直接確認；原推論句與其依據**一併保留**（推論與確認是兩種強度不同的證據）。「先保護，後邀請」維持原寫法；30 格預期值全部成立，並補上**可否證的推廣理由** | S7-b 第 1 點的 ✅ 框；S7-b 末尾新增一小節 |

##### (c) 的 finding 分類與處置建議（**worker 提出，不代 captain 裁決**）

依 `## Review-finding disposition` 第 2 條，以下是四欄證據、我的分類建議與處置建議。

| 欄位 | 內容 |
|---|---|
| **已釋出使用者與正常流程** | 正式表的編輯權限**已經開出去**，六位編輯者在階段一到 S7 之間照常在表上編輯。這就是正常流程，不是假想情境 |
| **可觀察的傷害** | 任何一人在 `chapter`／`owl_depth_comment`／`full_content` 填值，**AC-1 的逐字比對就會失敗**。票內已實測：填入非空值後 main 的同步**仍然 exit 0**，只有 sha256 變成 `38e662f6…`／`6895ef6b…`——**沒有任何程式會擋** |
| **受影響的價值 AC 或邊界** | **AC-1**（部署前後逐字相同） |
| **trigger 證據** | **部分成立。** 「六人可寫」是 captain 2026-09-25 的直接回報；「已經有人填值」**未觀察到**——截至 `2026-09-25T18:37Z`，兩個 sha256 仍等於 AC-1 的綁定值，三欄仍全欄留白 |

**我的分類建議：維持 `Deferred risk`，不升級為 Material。**
理由：第四欄的 trigger 只成立一半。**暴露面由 1 放大為 6 是事實，但「有人填值」尚未發生**，
而票內第八節既有的兩條升級條件已經涵蓋它（第 1 條逐字寫「**任何人**在階段一對那三欄…寫入任何值」——
**原文用的就是「任何人」，不是「責任編輯」**，所以升級條件本身不必改，
不足的只是那句緩解措施的措辭）。

**我的任務歸屬建議：本票擁有。** 那句緩解措施是本票 S2 寫的，改它不需要任何票外決定。

**我的處置建議：`fix`（已執行，措辭改為六位編輯者，原句保留）。**
**尚未執行、需要 FO 或 captain 決定的是**：這件事要不要**改變部署順序**——
例如把 S7 的保護範圍提前到階段一，或在階段一期間先手動鎖住那三欄。
**那是範圍決定，worker 不做。** 本票目前的防線仍是**告知 ＋ S3 的檢查①②**，
兩者都不是預防，是偵測。

> ✅ **2026-09-25 captain 裁決（A-2）：部署順序不改。**
>
> captain 原話：「**部署順序不改**」——**不**把 S7 提前到階段一，**也不**在階段一期間手動鎖那三欄。
>
> **captain 採納的理由**：runbook 已收斂十輪、reviewer 逐格驗過；
> 臨時加一個**不在那 12 個保護範圍內**的鎖，會讓 S7-b 的 30 格預期值難以推理，
> **而 S7-b 正是最容易假通過的一格**（`044` 已經在七列的測試表上付過一次代價）。
> **為尚未觀察到的風險變更已驗證的程序，代價大於風險。**
>
> **連帶**：上面那句「本票目前的防線仍是告知 ＋ S3 的檢查①②」**要再減一項**——
> captain 同時裁決**暫時不通知編輯者**（見 S2 的 ✅ 框，A-1）。
> **所以現在只剩 S3 的檢查①②與 FO 的唯讀絆線，兩者都是偵測，沒有任何預防。**
> 這是 captain 知情下接受的風險，不是遺漏。

##### 我在本輪另外發現的一筆（**未處置，等 FO 授權**）

**S3 的分辨表把「那三個內容欄」列進「編輯合法填值 → 重新量 baseline」那一列。**

原文（S3 分辨表第一列，**S3 區塊本輪逐位元組未動**。
**引用時只做了兩件事**：把表格的三個欄位用 `→` 串接，以及替 `那三個內容欄` 加粗；文字一字未改）：

> main 同步 exit 0、**檢查①與②都通過**，且 `diff` 只落在**那三個內容欄**或那 59 列的發布內容，
> 且編輯台確認是有人正常填稿 → **編輯合法填值** → **重新量 baseline。**

**但 S2 明令那三欄在 S9 完成前必須全欄留白。** 對這三欄而言，
「有人正常填稿」不可能為真——**沒有人應該在那裡填任何東西**。
若有人照這一列重量 baseline，就會**把不該存在的值烤進新基準**，AC-1 之後反而會通過。

| 欄位 | 內容 |
|---|---|
| **已釋出使用者與正常流程** | 工程在階段一跑 S3，發現 sha256 不符，照分辨表處置 |
| **可觀察的傷害** | 重量 baseline 之後，那三欄的非法填值成為新基準，**AC-1 之後反而會通過**，錯誤靜默上線 |
| **受影響的價值 AC 或邊界** | **AC-1** |
| **trigger 證據** | 需要兩步同時成立：①有人在那三欄填值 ②工程把第三個條件「編輯台確認是有人正常填稿」**誤答為是**。第三個條件本身擋得住一個仔細的讀者，**但那一列把「那三個內容欄」與「那 59 列的發布內容」並列，兩者的正確處置其實相反** |

**我的分類建議：`Deferred risk`。** 第三個條件是有效的防線，需要兩步誤判才會踩到。
**promote-to-material 條件**：任何一次 S3 的 sha256 不符，其 `diff` 落在那三欄。

**我沒有做任何事。** `S3 整個區塊`在本輪授權中列為**逐位元組不得改動**，
依 `## Review-finding disposition`，**FO 授權前不變更候選位元組**。
本輪已確認 S3 區塊 `9adddbd602991ae6`、4844 B **逐位元組未動**。
**請 FO 決定要不要開一輪處理它。**

### 十八、K22-K25 與 captain 兩筆裁決的處置（2026-09-25 第十一輪，review cycle 6 判 REJECTED）

review 第六輪判 **REJECTED**，**只站在 K22 一筆**。K14-K21 八筆 reviewer 逐筆驗過，
**沒有一筆是假修的**。FO 授權 **K22／K23／K24／K25 四筆全部 `fix`**，
外加 captain 兩筆裁決（A-1／A-2）與一筆 held finding（B-1）的處置。
**K26 由 FO 自行更正（`ad07a26`），本輪不處置，也不代 FO 改寫 `### Feedback Cycles`。**

#### K22：規則放錯了節——這一筆的教訓比它修掉的兩句話重要

reviewer 收出的判準，逐字寫進票內（已複述到 `## 部署 runbook` 與 `## Documentation impact` 兩節的 🔒 框）：

> **斷根規則寫在處置節裡，擋不住操作節與交付節。**
> **規則要放在「會被讀到的那一節」，而不是放在「記錄它的那一節」。**

**上一輪我把 captain 的斷根規則寫進第十六節與第十七節，而那兩節都是處置節。**
`## Documentation impact` 是 review stage 定義**逐輪指名要查**的一節，
我卻從來沒有把它當成規則要覆蓋的對象——**我掃的是「我改過的地方」，不是「規則該管的地方」。**

##### 覆蓋清單：規則現在寫在哪幾節

> ⚠️ **2026-09-25 第十九節（cycle 12）改寫：這份清單原本只列了四節，**
> **沒有寫判準、也沒有列出掃過而排除的節，所以它自己無法被否證。**
> **原表保留於本框末，現行版本見下。** reviewer（cycle 7）實測指出：
> 全票 11 個 live `##` 節只有 2 節帶 🔒 框，而漏掉的其中一節
> **正是 captain 此刻照著執行的第八節**。

###### 判準：什麼叫「會被讀到的節」

**一節要有 🔒 框，當且僅當它落在這三條閱讀路徑的任何一條上：**

> **第五欄的「含」一律指「承載」，不是「提及」。**
> **承載** ＝ 本節**自己就是那樣東西的出處**；**提及** ＝ 本節只是指向別節的那樣東西。
> 交叉引用、轉述、回顧都算提及，**不算數**。
> 下表第五欄的每一條都已經寫成只認得出「承載」的形式，理由列在第六欄。

| # | 路徑 | 讀者 | 讀它做什麼 | 機器可查的代理特徵（**只認承載**） | 為什麼這樣寫才排除得掉「提及」 |
|---|---|---|---|---|---|
| **P1** | **操作** | captain／工程 | 照著它動手改正式表或跑指令 | 有**行首**為 `**S{數字}` 或 `### 步驟 ` 的行，或節內有 ```` ```bash ```` ／ ```` ```python ```` 區塊 | 行首才是**定義**那一步的地方；句中出現的「步驟 9」是引用 |
| **P2** | **交付** | 排定文件更新時機的人 | 判斷某筆文件義務到期了沒有 | 有一列表格**同時**含「條件」與（`要改什麼`／`要記什麼`／`要做什麼`）其一，或節內含 `⟵ 條件：` | 義務表要**指派**一件事給人做；只有 `\| 條件 \| 狀態 \|` 的表是在**記錄**某個裁決的條件已否滿足 |
| **P3** | **驗收** | reviewer／verify／執行者 | 判定某一項過了沒有 | 有**行首**為 `**AC-{數字}　`（**全形空格**）的行，或節內含 `Verified by:`／「升級為 Material 的條件」／「promote-to-material 條件」，或本節自己下的粗體禁令 `**不得…**` | 全形空格是本票 AC **條文**的固定格式；`**AC-4 的資源前置…`（半形空格）是**提及**，抓不到 |

**掃描前先剝掉 🔒 框。** 它是規則本身，不是節的內容——不剝，一節會因為**已經有框**而被判成**需要框**，
**測試就變成循環論證，永遠通過。**

**不在任何一條路徑上的節 ⇒ 不必有 🔒 框。** 它們是背景、歷史或處置記錄：
讀了會增加理解，**但沒有人會據此做一件事**，所以一句過期的話在那裡不會害到誰。

###### 否證測試：把上表第五欄寫成程式，看它跟表格合不合

```bash
# 在 050 的 worktree 根目錄執行。只讀本票。
python3 - <<'PY'
import io,re
F="docs/constitution-features/050-ssot-approval-deployment.md"
lines=io.open(F,encoding="utf-8").read().split("\n")
allh=[i for i,l in enumerate(lines,1) if re.match(r'^## ',l)]
live=[(i,lines[i-1].strip()) for i in allh
      if not re.match(r'^## (Stage Report:|verify stage |review stage )',lines[i-1])]
def strip_lock(seg):                      # 剝掉 🔒 框：它是規則本身，不是節的內容
    out=[];skip=False
    for l in seg:
        if l.lstrip().startswith("> 🔒"): skip=True
        elif skip and not l.lstrip().startswith(">") and l.strip()!="": skip=False
        if not skip: out.append(l)
    return out
for n,t in live:
    nxt=[x for x in allh if x>n]; end=nxt[0] if nxt else len(lines)+1
    seg=strip_lock(lines[n-1:end-1]); txt="\n".join(seg)
    P1 = (any(re.match(r'^\*\*S\d', x) for x in seg)
          or any(re.match(r'^### 步驟 ', x) for x in seg)
          or "```bash" in txt or "```python" in txt)
    P2 = (any(("條件" in x) and re.match(r'^\|', x) and
              any(k in x for k in ("要改什麼","要記什麼","要做什麼")) for x in seg)
          or "⟵ 條件：" in txt)
    P3 = (any(re.match(r'^\*\*AC-\d+　', x) for x in seg)
          or "Verified by:" in txt
          or "升級為 Material 的條件" in txt or "promote-to-material 條件" in txt
          or re.search(r'\*\*不得[^*]{0,40}\*\*', txt) is not None)
    print(f"{'要  ' if (P1 or P2 or P3) else '不要'}  P1={int(P1)} P2={int(P2)} P3={int(P3)}  {t}")
PY
```

逐字輸出（本輪處置後，釘死 SHA：見本節末的提交）：

```
不要  P1=0 P2=0 P3=0  ## Problem
不要  P1=0 P2=0 P3=0  ## 已知的工作內容（design stage 須確認並補齊順序與負責人）
不要  P1=0 P2=0 P3=0  ## 相依關係
要    P1=0 P2=0 P3=1  ## Risk evidence
要    P1=1 P2=0 P3=0  ## 部署 runbook
要    P1=1 P2=1 P3=1  ## implement stage 實測結果（2026-09-24）
不要  P1=0 P2=0 P3=0  ## 相依關係釐清（design stage）
要    P1=1 P2=0 P3=1  ## Acceptance criteria
不要  P1=0 P2=0 P3=0  ## 元件與資料需求
要    P1=1 P2=1 P3=1  ## Documentation impact
要    P1=0 P2=0 P3=1  ## Out of scope
```

**11 節逐節相符，一個例外都沒有。** 要的 6 節與下表的 6 節同一組。

> **cycle 12 版的第五欄通不過這個測試，reviewer 實測多打中兩節。** 原因逐筆：
>
> | 節 | 舊第五欄為什麼誤中 | 新定義怎麼排除 |
> |---|---|---|
> | `## 元件與資料需求` | 句中有「步驟 9」「AC-1」 | P1／P3 改為只認**行首**格式，句中引用不算 |
> | `## 相依關係釐清（design stage）` | 有 `\| 條件 \| 狀態 \|` 表，且有 `**AC-4 的資源前置…` | P2 要求同列另有**指派欄**（那張表只記錄 040 裁決的兩個條件已否滿足，不指派任何人做事）；P3 要求 `**AC-N　` 的**全形空格**條文格式 |
>
> **那兩節判「不要」的結論一直是對的，錯的是「憑第五欄的字面掃不出來」**——
> 也就是中間還有一步判斷沒寫出來。**沒寫出來的那一步，就是重跑不會一致的地方。**

###### 全部 11 個 live `##` 節，逐節判定（**無一略過**）

清單來源（先跑再寫）：

```bash
# 在 050 的 worktree 根目錄執行。只讀本票。列出所有 live `##` 節（排除報告區塊）。
grep -nE '^## ' docs/constitution-features/050-ssot-approval-deployment.md \
  | grep -vE '^[0-9]+:## (Stage Report:|verify stage |review stage )'
```

| # | 節 | 路徑 | 要不要 🔒 | 現況 |
|---|---|---|---|---|
| 1 | `## Problem` | —— | 不要 | 背景。說明這張票為什麼存在，不含步驟、義務條件或驗收判準 |
| 2 | `## 已知的工作內容` | —— | 不要 | design stage 的待辦清單，已被 `## 部署 runbook` 取代 |
| 3 | `## 相依關係` | —— | 不要 | 背景。其現行判定已由「相依關係釐清」取代，該節下方已有 ⚠️ 指向 |
| 4 | **`## Risk evidence`** | **P3** | **要** | ✅ **cycle 12 加入**。它承載 spike 進度與風險是否仍成立的敘述 |
| 5 | **`## 部署 runbook`** | **P1** | **要** | ✅ cycle 11 已加入 |
| 6 | `## implement stage 實測結果（2026-09-24）` | **P1**（僅第八節） | **要**（落在第八節） | ✅ **cycle 12 加入於第八節**。本節其餘子節（第九～十九節）是處置記錄，不在路徑上 |
| 7 | `## 相依關係釐清（design stage）` | —— | 不要 | 裁決記錄（🔴 已解、選項 A）。記的是「當時決定了什麼」，單調 |
| 8 | **`## Acceptance criteria`** | **P3** | **要** | ⛔ **本輪未加入——該節在 cycle 12 授權中列為逐位元組不得動。** 見下方缺口 |
| 9 | `## 元件與資料需求` | —— | 不要 | 全節為「不適用」（本票無 UI 與程式變更） |
| 10 | **`## Documentation impact`** | **P2** | **要** | ✅ cycle 11 已加入 |
| 11 | **`## Out of scope`** | **P3** | **要** | ✅ **cycle 13 加入**。它載有一條風險升級條件（見下方更正框） |

**要 🔒 的 6 節，5 節已有。** 唯一缺口是 `## Acceptance criteria`（已 `decline`，見下）。

> ⚠️ **2026-09-25 更正（cycle 13）：第 11 列原判「不要」，理由被該節自己的內容否證。原判與原理由逐字保留。**
>
> 原文：`| 11 | ``## Out of scope`` | —— | 不要 | 範圍記錄。「不做什麼」是單調的 |`
>
> **錯在哪**：該節的 `### design stage 追加的 Out of scope` 子節逐字載有
> **「升級為 Material 的條件：有人在部署後改動三個分頁上任何一個標題字串」**——
> **那正是 P3 的代理特徵**，是本節自己下的風險判定，不是別節的交叉引用。
>
> **而且它不是「可能會出現過期敘述」，它已經出現過一次了**：
> 同子節的「這個條件**現在就在觸發範圍內**——captain 正在建欄與輸入標題」**已經過期**，
> 它下方那則 ⚠️ 更正框就是為它寫的；同段「captain **現在**照票輸入的這批標題是安全的」
> 也必須另加限定才站得住。**一節已經被這條規則救過一次，卻沒有被列進規則的覆蓋範圍。**
>
> **該節原本確實有一個 🔒，但範圍只及於一框**：那是寫在那則 ⚠️ 更正框**內部**的
> 「本框刻意不寫『現在做到哪裡』」，**它只約束那一框，不約束整節**。
> 本輪補的是**節層級**的框。兩者不衝突，也不重複。
>
> **「不做什麼」是單調的——這句話本身沒錯**，錯的是把它當成整節的性質。
> 該節同時載有**範圍記錄（單調）**與**風險升級條件（非單調）**，**後者決定它要不要框。**

> ⛔ **已知缺口：`## Acceptance criteria` 落在 P3 上，但本輪沒有加框。**
>
> **理由不是判準漏掉它，是授權邊界擋住**——它在 cycle 12 的授權封包中列為
> **全段逐位元組不得動**，而加一個 🔒 框就會動到它的位元組。
> **worker 不自行越界**（`## Review-finding disposition`：FO 授權前不變更候選位元組）。
>
> **這個缺口現在有多重**：AC-1／2／3／5／6 的條文是**驗收要求**，單調；
> 目前唯一含非單調敘述的是 **AC-4 與 AC-7 的 `前置` 欄**
> （例：AC-7 寫「repo 內查不到正式表的責任編輯是哪一個帳號」），
> 而那兩句都已在第八節 S7-b／S7-d 有對應的 ✅ 框接住。
> **所以缺口是實的，但目前沒有已知的過期敘述落在裡面。**
> **請 FO 決定要不要開一輪替 `## Acceptance criteria` 加框。**
>
> ✅ **2026-09-25 FO 裁定（Cycle 9）：`decline`。上面那個問句保留，答案在這裡。**
>
> | 項目 | 內容 |
> |---|---|
> | 裁定 | **`decline`**——不為 `## Acceptance criteria` 加 🔒 框 |
> | 理由 | 該節依 `## Review-finding disposition` 第 5 條**只有 captain 能改**，為加一個規則框而動它，**代價大於收益** |
> | 現狀評估 | AC-1／2／3／5／6 的條文為**單調句型**；AC-4／AC-7 的 `前置` 兩句已由第八節 S7-b／S7-d 的 ✅ 框接住 |
> | **promote 條件** | **若日後 AC 條文出現任何非單調敘述，即重開。** |
>
> **這個缺口因此是「已知並接受」，不是「待辦」。**
> 它仍然列在覆蓋表裡（第 8 列標 ⛔），**因為判準沒有放過它——放過它的是裁定。**

> **原表保留（cycle 11 版本，只列四節、無判準）**：
>
> | 節 | 類型 | 有沒有 🔒 規則 |
> |---|---|---|
> | `## 部署 runbook` | **操作節**（captain 照著做） | ✅ 本輪加入 |
> | `## Documentation impact` | **交付節**（排定文件更新時機） | ✅ 本輪加入 |
> | 第十六節「現況怎麼查」 | 處置節（兼指令出處） | ✅ 上一輪已有 |
> | 第十七節 | 處置節 | ✅ 上一輪已有 |
>
> **它錯在哪**：~~四節全對~~，但**它只列了「我加過框的節」**——
> 沒有判準、沒有分母、沒有排除清單，**所以沒有任何方式能看出它漏了什麼**。
>
> ⚠️ **2026-09-25 再校正（cycle 13）：「四節全對」也不對。原表與原敘述逐字保留。**
>
> 依新判準，**第十六節與第十七節都是處置節，不在 P1／P2／P3 任何一條路徑上，本來就不需要框**。
> 原表把它們列為「✅ 上一輪已有」，等於把**兩個多餘的框**算成覆蓋成績。
>
> **它們現在怎麼處理**：那兩個框**留著不刪**，但**不是本票的正式規則框**——
> 它們的措辭是 cycle 11 之前的較早版本（**沒有 L5 的 SHA 那一條**），
> 內容是那兩節自己的處置記錄，**留著是歷史，不是規則**。
>
> **以哪一份為準**：**六份正式框**（`## Risk evidence`、`## 部署 runbook`、第八節、
> `## Documentation impact`、`## Out of scope`，加上 `## Acceptance criteria` 的 `decline` 缺口）。
> 六份正式框**逐位元組相同**，可以這樣驗：
>
> ```bash
> # 在 050 的 worktree 根目錄執行。只讀本票。正式框的第一行應出現 5 次（六節中五節已加框）。
> grep -c '^> 🔒 \*\*本票的寫作規則（captain 2026-09-25 親自授權，全票適用，不限節次）\*\*$' \
>   docs/constitution-features/050-ssot-approval-deployment.md
> ```
>
> **兩種版本並存這件事本身要寫明**，否則下一個人會以為票內的規則有兩套。
> **規則只有一套，框有兩種年份。**
> 這與本票第九節判準三是同一件事的另一面：
> **一份無法被否證的清單，和一個沒查過的數量詞，失敗方式相同。**

##### 掃描方式：可否證，而且我寫明它為什麼不夠

**第一階段——機器掃。** 非單調標記取自規則本身（「仍是／尚未／待補／還沒／目前仍」）：

```bash
# 在 050 的 worktree 根目錄執行。只讀本票。
python3 - <<'PY'
import io,re
F="docs/constitution-features/050-ssot-approval-deployment.md"
lines=io.open(F,encoding="utf-8").read().split("\n")
report=set(); cur=None
for i,l in enumerate(lines,1):
    if re.match(r'^## (Stage Report:|verify stage |review stage )',l) or l.strip()=="### Feedback Cycles":
        cur=l
    elif re.match(r'^## ',l) and not re.match(r'^## (Stage Report:|verify stage |review stage )',l):
        cur=None
    if cur: report.add(i)
pat=re.compile(r'仍是|尚未|待補|還沒|目前仍|一步都還沒')
for i,l in enumerate(lines,1):
    if i not in report and pat.search(l): print(f":{i}  {l.strip()[:110]}")
PY
```

**處置前 42 行，處置後 57 行**（live body，已排除報告區塊與 `### Feedback Cycles`；
**兩個端點都釘死 SHA**：處置前 ＝ `ad07a26`，處置後 ＝ `458c730`）。

> ⚠️ **2026-09-25 更正（L2，cycle 12）：原寫「處置前 **43** 行」，實際是 **42**。原數字保留。**
> 那一句寫的時候沒有跑，是憑印象。**本輪先跑再寫**——把上面那段 python 對
> `git show <SHA>:<票檔>` 的內容各跑一次，得 `ad07a26` ＝ **42**、`458c730` ＝ **57**。
> **順帶把「處置後」的標籤由當時的工作區改成釘死的 `458c730`**（🔒 規則的 SHA 那一條）。
>
> ⚠️ **2026-09-25 再更正（cycle 13）：上一輪只改了一半。**
> 同一節下方第二階段的正文也寫著「**43** 行裡絕大多數是合法的」，
> **而那是正文、不是保留原句（沒有 `>` 前綴）**，所以它不是在引用錯誤，它就是錯誤。
> **兩處現在都是 42。** 重跑的指令就是上面那段 python，餵 `git show ad07a26:<票檔>` 的內容：
>
> ```bash
> # 在 050 的 worktree 根目錄執行。只讀 git 物件。
> git show ad07a26:docs/constitution-features/050-ssot-approval-deployment.md > /tmp/t.md
> # 再把上面那段 python 的 F 指向 /tmp/t.md 跑一次 → 42
> ```
>
> **同一個數字、同一節，只改了一半——這本身就是判準三的形狀**：
> 改了被指名的那一處，沒有掃同一節裡的同一個值。
**這個總行數本身就是非單調的，不要拿它當指標**——更正框裡**刻意保留的原句**同樣含那些標記詞，
所以每處置一筆，總行數只會更多，不會更少。
**要看的是第二階段挑出來的那幾筆，不是總行數。**

**第二階段——人工判。** 42 行裡絕大多數是合法的：條件句（「若…仍是…」）、
講別張票的狀態、更正框裡**刻意保留的原句**、以及判準敘述。
**要挑出來的只有一種**：**對「這張正式試算表現在的狀態」下的斷言**。
四筆，逐筆處置：

| 位置 | 原句 | 處置 |
|---|---|---|
| 票首摘要行 | 「正式試算表**尚未建立**這些欄位」 | 已不全對（4／8、4／8、1／8）。改為單調寫法，原句與時戳讀數保留 |
| 證據 2 的階段 A | 「尚未動工（**今天**的正式表）」 | 「今天」是 2026-09-07。加日期＋一則「這是 fixture 階段標籤，不是現況快照」的註記 |
| `## Documentation impact` `:2998`／`:3000` | 「試算表目前仍是部署前狀態」／「本票尚未執行任何一步」 | **K22 本體。** 依 (b) 只留指令；理由句改寫成不會過期的版本，原句保留 |
| 第十七節追加 | 「**尚未執行**、需要 FO 或 captain 決定」（指部署順序） | captain 已裁決（A-2），改記為已裁決 |

**⚠️ 這個掃描法擋不住什麼，我寫在這裡，不要以為掃過就安全了。**

1. **它只認那五個詞。** 「試算表目前是部署前狀態」不含任何一個標記詞，這條 grep 抓不到。
   **真正的判準是語意（對現況下斷言），不是字串。**
2. **第二階段是人工的**，換一個人判可能得到不同的四筆。
3. **它掃不到「寫下時就是假的」那一種**（K26 的形狀）——
   那一種要靠**列舉型指令**，不是靠掃票內的字。

#### K23：「唯一下降」——我自己重數一次，答案是「至少兩種，而且取決於怎麼數」

**我先跑清點，再寫結論**（這是本輪規則的第一次自我適用）：

```bash
# 在 050 的 worktree 根目錄執行。只讀 git 物件。
python3 - <<'PY'
import subprocess, collections, re
REL="docs/constitution-features/050-ssot-approval-deployment.md"
def show(r): return subprocess.run(["git","-C",".","show",r+":"+REL],capture_output=True,text=True,check=True).stdout
a,b=show("1646f0e"),show("3d91b13")
pat=re.compile(r'\d+\s*(?:欄|列|格|筆|段|個|處|人|輪|次)')
ca,cb=collections.Counter(pat.findall(a)),collections.Counter(pat.findall(b))
for k in sorted(ca):
    if cb[k]<ca[k]: print(f"{k!r}: {ca[k]} -> {cb[k]}")
PY
```

輸出（`1646f0e` → `3d91b13`）：`'15 個': 30 → 29`、`'5 欄': 6 → 5`、`'6  格': 1 → 0`。

| 我上一輪寫的 | 事實 |
|---|---|
| 「**唯一**下降的『12 欄』由 17 降為 16」 | **「唯一」是錯的。** reviewer 用純子字串計數找到**兩種**（`12 欄`、`15 個`）；我用 `\d+量詞` 正規式找到**三種**（`15 個`、`5 欄`、`6  格`）。**種數取決於怎麼數，所以寫這種句子必須連方法一起寫。** |

**三種全部來自兩行被刪的字與一段被取代的程式輸出，逐行查過**：

| 樣式 | 來自 |
|---|---|
| `15 個` | 被 K14 授權移除的判讀表那一列：`\| **S4**（附加 15 個窗口內欄位） \| … \| **未執行**——一個都沒有 \|` |
| `5 欄`（及 `12 欄`、`10 欄`） | 同樣被 K14 授權移除的那一行：`> 欄數為 **Track 1_history 10 欄／Track 2_discussion 12 欄／site_tldr 5 欄**，` |
| `6  格`（雙空格） | K20 取代掉的舊版比對腳本**印出的輸出**：`S7-b 的 B 類欄位數 = 6  S7-d 欄位數 = 6  格數 = 18` |

**沒有任何承重值回歸**：`15 個窗口內欄位` 仍在 S4 條文，`1646f0e` 5 處 → HEAD 7 處。
**掉的全部是被授權移除的過期讀數與程式輸出，不是規格值。**

> ⚠️ **2026-09-25 更正（L1，cycle 12）：上面那句的舉證是錯的，而且方向反了。原句保留。**
>
> **先跑再寫**，逐版清點（`grep -c '15 個窗口內欄位'`，版本全部釘死 SHA）：
>
> ```bash
> # 在 050 的 worktree 根目錄執行。只讀 git 物件。
> for r in 1646f0e 3d91b13 ad07a26 458c730 2f1d87e 87f6b80 7d109ce; do
>   printf '%-9s %s\n' "$r" \
>     "$(git show $r:docs/constitution-features/050-ssot-approval-deployment.md \
>        | grep -c '15 個窗口內欄位')"
> done
> ```
>
> 輸出：`1646f0e=6`、`3d91b13=5`、`ad07a26=7`、`458c730=11`、`2f1d87e=12`、`87f6b80=16`、`7d109ce=16`。
>
> | 原句 | 事實 |
> |---|---|
> | 「`1646f0e` **5 處**」 | `1646f0e` 是 **6**。**5** 是 `3d91b13` |
> | 「**HEAD** 7 處」 | **7** 是 `ad07a26`。而且 `HEAD` 是移動引用，**不能當量測標籤**（見 🔒 規則的 SHA 那一條） |
> | 用「5 → 7」證明沒有回歸 | **方向反了。** cycle 10 真正改動的窗口是 `1646f0e` → `3d91b13`，該值是 **6 → 5，下降**。我拿了一組上升的數字去證一件發生在下降窗口裡的事 |
>
> **結論本身仍然成立，只是要用對的方式證。** 承重的不是「出現幾次」，是**那一行條文還在不在**：
>
> ```bash
> for r in 1646f0e 3d91b13 ad07a26 458c730 2f1d87e 87f6b80 7d109ce; do
>   printf '%-9s ' "$r"
>   git show $r:docs/constitution-features/050-ssot-approval-deployment.md \
>     | grep -m1 '^\*\*S4　'
> done
> ```
>
> **七版逐字相同**，都是
> `**S4　三個分頁附加 15 個窗口內欄位，全部留白。** 每個分頁依序附加：`。
> **`1646f0e` → `3d91b13` 掉的那一次，是被 K14 授權移除的判讀表那一列，不是 S4 條文。**
>
> **附帶（reviewer cycle 7 查出，我自行重跑確認）**：`12 欄` 在本票檔的
> **全部 39 個版本裡單調不減**（首版 0 → `7d109ce` 36），**下降次數 0**——
> **它從來沒有由 17 降為 16。**
> 那個數字在 cycle 10 寫下、cycle 11 轉述、FO 的 Cycle 8 再轉述一次，
> **三輪、兩個角色，沒有人跑過。**
> （reviewer 當時量到 37 個版本，我量到 39——**版本數本身就是非單調的**，
> 所以這裡把量測時的 SHA 釘住：**截至 `7d109ce` 為 39 版**。）

#### K24／K25

- **K24**：S7-d 收尾指向「第 1 點『沒有』那條」，而第 1 點已收斂成一條路，那個標籤無處可對。
  改為指向 ⚠️ 保留註記的**取回條件**，並補一句「走正常那條路時不做這一步」。
- **K25**：第 5 點的重測範圍由第 1-9 格補到 **第 1-10 格**。
  **第 10 格是最該重測的那一格**——本點的觸發條件（補設改到某類範圍的 A1）
  正是可能讓內容欄被涵蓋、使第 10 格由「可改」翻成「擋」的動作；
  而**第 10 格的結果來自 S7-c，補設之後不會自動重跑**。
  **分類維持 `Deferred risk`（reviewer 判定），未自行升級也未降級**；
  promote-to-material 條件逐字採用 reviewer 的寫法。

#### captain 兩筆裁決與一筆 held finding

| # | 內容 | 落地位置 |
|---|---|---|
| **A-1** | **暫時不通知編輯者——接受風險，不是消除風險。** 依據是 captain 對編輯台近期行為的判斷，**repo 內無從驗證，也不是已觀察到的保證**；**不得寫成「那三欄不會被寫入」**。升級條件（「任何人」寫入任何值）不變，`Deferred risk` 分類不變 | S2 的 ✅ 框 |
| **A-2** | **部署順序不改**——不把 S7 提前，也不在階段一手動鎖那三欄。理由：**為尚未觀察到的風險變更已驗證程序，代價大於風險**，且臨時的鎖會讓 S7-b 的 30 格預期值難以推理 | 第十七節追加的 ✅ 框 |
| **B-1** | S3 分辨表把「那三個內容欄」放錯邊。**FO 僅就這一列解除凍結**，已修：第一列排除那三欄，並在表下補一列相反處置（**停住、清空、確認 sha256 回到綁定值**） | S3 分辨表與其下的 ⚠️ 框 |

**A-1 與 B-1 合起來要講一句**：**不通知編輯者，使「有人填值」那一步的可能性不降反升，
而 B-1 修的正是「填了值之後會不會被誤判成合法」。** 兩者方向相反，B-1 因此更要緊，不是更不要緊。

#### 本輪沒有做的事

- **沒有改寫 `### Feedback Cycles`**（K26 由 FO 自行更正，已於 `ad07a26` 落地）。
- **沒有動 S3 除那一列以外的任何位元組**；沒有動 S7-b 的 30 格表、S7-d 的 18 格表、S7 的 12 範圍表、S8。
- **沒有動任何 AC 的條文**。K25 改的是 S7-d 第 5 點的文字，不是 AC-4 或 AC-7。
- **沒有代為執行 `TODO.md` P3-7 的追記**——改 `TODO.md` 不在本票交付範圍內，只把到期狀態記明白。
- **沒有對正式試算表寫入任何一格。** 本輪只發出一次唯讀讀取（`2026-09-25T19:11Z` 的標題列量測）。

### 十九、L1-L5 的處置（2026-09-25 第十二輪，review cycle 7 判 PASSED 的低成本定點修正）

review 第七輪判 **PASSED**，提 L1／L2／L3 三筆 **Polish**，並把 L4 **升報**為範圍決定。
FO 授權 **L1（票內部分）／L2／L3／L5 四筆 `fix`，L4 `hold`**。
reviewer 明言「**建議用一輪低成本定點修正處理，不必退回整輪**」——
**本輪照這個尺度做，沒有開新的掃描維度。**

基準 `7d109ce`（列舉型指令輸出，2026-09-25T19:40Z）。

| # | 分類 | 處置 |
|---|---|---|
| **L3** | Polish（**最要緊，優先做**） | 覆蓋清單改為**可否證**：寫出「會被讀到的節」的三條路徑判準與機器可查的代理特徵、逐節判定全部 **11 個 live `##` 節**（含排除理由）、補上缺口的 `## Risk evidence` 與**第八節**。原表保留 |
| **L1** | Polish | 「`1646f0e` 5 處 → HEAD 7 處」兩個端點皆錯，**且方向反了**。改為逐版釘 SHA 的清點，並改用正確的舉證方式（S4 條文那一行七版逐字相同）。原句保留 |
| **L2** | Polish | 「處置前 43 行」實為 **42**。先跑再寫，兩個端點都釘 SHA |
| **L5** | Polish（FO 提報） | `HEAD` 當量測標籤是非單調的。規則加一條「引用版本一律釘 SHA」，並改掉票內我自己那兩處 |
| **L4** | **hold** | `TODO.md` P3-7 的追記義務已到期未執行，須指定執行者。**本輪不處置**，FO 另行帶給 captain |

#### L3 的重點不是補兩節，是那份清單原本無法被否證

cycle 11 的覆蓋清單四節全對，**但它只列了「我加過框的節」**——
沒有判準、沒有分母、沒有排除清單，**所以沒有任何方式能看出它漏了什麼**。
reviewer 一跑就看出來：**11 個 live `##` 節只有 2 節帶框**。

**而漏掉的其中一節，captain 此刻正照著它執行部署**（第八節「校正後的步驟 1-7」）。
三個缺口裡只有這一個會直接影響操作，所以它排第一。

**這與第九節判準三是同一件事的另一面**：
**一份無法被否證的清單，和一個沒查過的數量詞，失敗方式相同。**

#### L5：這一族的第五個變種，而它落在 reviewer 自己身上

review cycle 7 的報告把量測基準寫成 **`HEAD`**（例：`15 個窗口內欄位` … `HEAD`＝12）。

**沒有人數錯，錯的是標籤。** reviewer 量測時 `HEAD` ＝ `2f1d87e`，該值確為 **12**；
它把報告提交成 `87f6b80` 的那一刻，**同一個標籤指向的值變成 16**。
**`HEAD` 本身是非單調的——寫下的瞬間就開始過期。**

我自己重跑確認兩端都可重現（指令與逐版輸出見第十八節 L1 那一框）：
`2f1d87e`＝**12**、`87f6b80`＝**16**。

**規則因此加一條，已寫進全部四份 🔒 框**：

> **引用版本一律釘 SHA，不得使用 `HEAD`、`main` 等移動引用**——
> **移動引用是非單調的，寫下的瞬間就開始過期。**

**界線寫明白**：`main`／`HEAD` 出現在**指令**裡沒問題
（票內 `git merge-base main HEAD` 那幾處都把解析出的 SHA 一併印在旁邊，那是合格的）；
**不可以的是拿它當量測標籤**，例如「某值在 HEAD 是 12」。

**本輪沒有改 reviewer 的報告。** review cycle 7 的區塊在授權中列為逐位元組不得動，
**這一筆的來源在那裡，處置在這裡**：規則入框，並改掉票內我自己寫的兩處
（第十八節 K23 一處、Stage Report cycle 10 的 ⚠️ 框一處）。

#### 收斂規則（FO 裁定，2026-09-25，cycle 13 起生效）

**cycle 13 是本票 ticket-side 的最後一輪定點修正。**

FO 裁定的理由，逐項記下：

- runbook 的**可執行內容**已連續多輪驗證乾淨，十二個受保護區塊逐位元組未動；
- 最近四輪的發現**全部是 Polish**，操作重量遞減；
- **captain 此刻正在執行 S4，窗口已開**——**票的邊際整潔度不值得再換取更多輪次。**

> 🔻 **收斂規則：cycle 13 之後，再出現 Polish 級發現，一律記錄為「已知並接受」，不再修。**
>
> **重開條件（唯一）**：出現 **Material**——
> 依 `## Review-finding disposition` 的**四欄證據全部成立**
> （已釋出使用者與正常流程／可觀察的傷害／受影響的價值 AC 或非協商邊界／trigger 證據）。
> **四欄缺一，就不是 Material，就不重開。**
>
> **這條規則可以被否證**：拿任何一筆新發現去對那四欄，
> **四欄全中卻沒有重開，或四欄沒全中卻重開了**，都是違反。
>
> **它不禁止記錄。** Polish 級發現仍然該寫進票內、標成「已知並接受」——
> **停的是修，不是看見。**

**為什麼這條規則本身要寫進票內**：本票十三輪的教訓是
**一個沒有寫下判準的決定，下一輪就會被重新爭論一次**。
收斂也一樣——**口頭說「這是最後一輪」，不會擋住第十四輪。**

#### 本輪沒有做的事

- **沒有開新的掃描維度**（reviewer 指定的尺度）。
- **沒有動十二個受保護區塊與 `## Acceptance criteria` 一個位元組**；**S3 本輪未再解凍任何一列**。
- **沒有代 FO 改寫 `### Feedback Cycles`**（L1 在 Cycle 8 的那一處已由 FO 於 `7d109ce` 自行更正）。
- **沒有處置 L4**——它是範圍決定（誰去執行 `TODO.md` P3-7 的追記），FO 另行帶給 captain。
- **沒有對正式試算表做任何讀寫。** 本輪一次 HTTP 請求都沒有發出——
  **captain 此刻正在執行 S4，窗口已開**，本輪需要的資料全部來自 git 物件。

## 相依關係釐清（design stage）

### 相依一：`docs/content-pipeline/operations.md` 只存在於 040 的 worktree

**已驗證**：`git ls-tree main docs/content-pipeline/` 只列出 `data-collection-guide.md` 與 `design.md`，
沒有 `operations.md`。該檔在 `.worktrees/spacedock-ensign-040-approval-content-version-binding/` 下存在。

> ⚠️ **2026-09-24 更正：上面那句證據已過期。原句保留。**
> `git ls-tree --name-only main docs/content-pipeline/` 現在列出**三個**檔——
> `044` 隨 commit `36af185` 把 `approval-permission-probe.md` 帶進了 main：
>
> ```
> docs/content-pipeline/approval-permission-probe.md
> docs/content-pipeline/data-collection-guide.md
> docs/content-pipeline/design.md
> ```
>
> **承重結論不變**：`operations.md` 確實不在 main，
> 所以「本票不依賴 `operations.md`、改為自帶 runbook」這個判定仍然成立。
> 過期的只是「只列出兩個檔」這句話本身。

**判定：本票不依賴 `operations.md`，改為自帶完整 runbook。** 三個理由：

1. `operations.md` 只有「隔離表部署」一節（第 15-25 行），**沒有正式 SSOT 部署的程序**。
   就算取得它，也回答不了本票的問題。
2. 它的第 12 行明寫「兩帳號隔離 probe 完成前，不要把 Apps Script 套到正式 SSOT」——
   它是**限制**本票的文件，不是指導本票的文件。
3. 把它 cherry-pick 到 main 會讓一份 `evergreen` 文件在功能還沒合併時就描述該功能，違反 `AGENTS.md` 的文件規範。

**040 合併前後的差別**：合併前，本票的部署程序**只存在於本票**，唯一權威是 040 worktree 的
`scripts/sync-content.mjs` 與 `scripts/apps-script/approval-workflow.gs` 兩份原始碼（上面每一步都標了行號）。
合併後，`operations.md` 進入 main 成為 `evergreen` 正式程序，本票的 runbook 降為「當時實際怎麼做」的 `record`。
**本票不編輯 `operations.md`**——那個檔在別張票的 worktree 裡，改它是跨票污染。
要補的內容列在下方 Documentation impact 的「實作後更新」。

#### 040 branch 上那三個檔的行號，釘在 commit `a51b5d9`

票內對 `approval-workflow.gs`（9 處）、`operations.md`（3 處）、
040 版 `scripts/sync-content.mjs`（2 處）的行號引用，**全部以這個 commit 為準**：

| 檔 | commit | sha256 | 行數 |
|---|---|---|---|
| `scripts/apps-script/approval-workflow.gs` | `a51b5d90b025bf8bd0d035f9dea991e713660a17` | `cd380aee1071…` | 263 |
| `docs/content-pipeline/operations.md` | 同上 | `a01a0d47237e…` | 79 |
| `scripts/sync-content.mjs`（040 版） | 同上 | `7e9ab0587035…` | 824 |

**為什麼要釘**：這三個檔**不在 main**，只活在 feature 040 的 branch，
而 040 目前 `status: review`、`completed:` 空白、**尚未合併**。
review 若要求改動，行號就會移動——這正是「會在我引用它之後變動」的典型。
取出方式：`git -C <040 worktree> show a51b5d9:<path>`。

**`approval-workflow.gs` 與 `operations.md` 在 `a51b5d9` 與 feature 044 釘的 `093cd01`
是同一份位元組**（sha256 與行數皆同），所以兩份記錄互相印證。
**但 `sync-content.mjs` 兩個 commit 不同**：`093cd01` 是 807 行且**沒有 `publishedRowSequences`**，
`a51b5d9` 是 824 行、該函式在第 392 行。**本票的 `:392` 只在 `a51b5d9` 成立**，
所以本票釘 `a51b5d9`，不是照抄 044 的 `093cd01`。
（`APPROVAL_COLUMNS` 的 `:84-93` 兩個 commit 都成立。）

**main 版 `scripts/sync-content.mjs` 的行號另計**（第 94、97-99、112、113、116、117-119、
123-129、294 行），以 `main` ＝ `49e875c` 為準，blob sha256 `ff30b8bda476…`、729 行。
**它會因為本票步驟 9 合併 040 而整份換掉**，屆時這些行號全部失效——
那是預期的，因為合併後就該改讀 040 的新版。

### 相依二：票內自相矛盾——044 到底是不是前置

**矛盾確認**。本票 `## 相依關係` 的第二個項目符號寫
「044 的結果可降低本票的風險，但兩者不互為前置」；
`## Risk evidence` 的首句寫「spike 的形式是在隔離測試表上先跑一次（即 feature 044）」。
既然 `no spike needed` 不成立、而 spike 就是 044，044 就是前置。兩句不能同時成立。

**我的判定：`## 相依關係` 第二個項目符號錯，044 是步驟 4 起的硬前置。三項外部證據都指向同一邊：**

1. `docs/content-pipeline/operations.md:12`（040 worktree）：
   「兩帳號隔離 probe 完成前，不要把 Apps Script 套到正式 SSOT。」
2. feature 040 的 Out of scope（`040-approval-content-version-binding.md:290`）：
   「不上線正式 SSOT 設定，**直到隔離測試表完成驗證並由 captain 確認**。」
3. 本票 AC-3（非核可者不能編輯審核欄位）與 044 的第二個待驗證命題**是同一件事**。
   差別只在：044 在可丟棄的測試表上做，本票在 40 筆已上線內容的唯一來源上做。

**但這個判定會造成僵局，所以需要 captain 裁決。**

044 的前置是「一份隔離測試表 + 兩個 Google 帳號」，這兩項卡在人不卡在程式，目前不存在。
若照判定執行，鏈條是：`兩個帳號 → 044 → 050 → 040 合併`，而鏈條頭卡住。

> ⚠️ **2026-09-24 事實更正：上面兩句在 2026-09-07 寫下時成立，現在都已經不成立。原句保留。**
>
> **feature 044 已經做完了。** 重讀它的 front matter：
>
> | 欄位 | 值 |
> |---|---|
> | `status` | `complete` |
> | `verdict` | `PASSED` |
> | `score` | `0.96` |
> | `completed` | `2026-09-21T18:35:02Z` |
> | `pr` | `pr-merge:36` |
> | 位置 | `docs/constitution-features/_archive/044-approval-permission-two-account-probe.md` |
>
> 歸檔 commit `66ed939`，且**它是本 branch HEAD 的祖先**——
> 換句話說，這個事實在本票這條 branch 上早就看得到，只是沒有人重讀。
>
> **所以「前置目前不存在」與「鏈條頭卡住」兩句都已過期。**
> 隔離測試表與第二個 Google 帳號都已經備妥並用過，鏈條頭沒有卡住。

**~~🔴 需要 captain 裁決（worker 不自行決定）。~~ ✅ captain 已於 2026-09-25 裁決：選定選項 A。**
**三個選項——下表已依 044 的完成狀態重寫，A 那一列加註裁決：**

| 選項 | 做什麼 | 代價 | 不可逆？ |
|---|---|---|---|
| **A（建議）✅ captain 2026-09-25 選定** | 先跑 044，再做本票 | **已完成，無額外代價。** 044 於 2026-09-21 完成並 PASSED，這個選項要付的成本已經付掉了 | 可逆 |
| **B** | 明文豁免 `operations.md:12` 與 040 Out of scope 的但書，直接在正式表部署 | **前提已消失。** 這個選項的唯一好處是「省下等 044 的時間」，而 044 已經做完，沒有時間可省 | **部分不可逆**（見下） |
| **C** | 拆分：步驟 1-3（建欄）不需 044，先做；步驟 4 起等 044 | **前提已消失。** 沒有東西要等 | **不建議**——證據 2 證明窗口從建欄就開始 |

> ⚠️ **原始的三個選項措辭保留於此，供追溯**（2026-09-07 design stage 寫，當時 044 尚未開始）：
> A 的代價原寫「040 合併再延一輪。要多開一個帳號」；
> B 的代價原寫「若權限設定有誤，錯誤發生在 40 筆已上線內容的唯一來源上」；
> C 的代價原寫「產線停擺窗口被拉長成不確定時間」。
>
> **B 的原始代價敘述仍然成立，而它的好處已經歸零。**
> 票內自己把 B 標為「部分不可逆」，錯誤會發生在 40 筆已上線內容的唯一來源上。
> **選 B 等於拿那 40 筆去換一個已經不用付的成本。**

**`operations.md:12` 的保護邊界，觸發條件已經滿足。** 該句是
「兩帳號隔離 probe 完成前，不要把 Apps Script 套到正式 SSOT」——
probe 完成了（044，2026-09-21，PASSED），所以這句話**不再擋住本票**。

**AC-4 的資源前置也已經過期。** AC-4 的 `前置` 寫「需要第二個 Google 帳號。
這與 044 的資源前置是同一個」——那個帳號在 044 已經取得並使用過。
**AC-4 的要求本身不變，仍然必須做**（在正式表上以非核可者身分測三次），
只是它不再卡在「有沒有第二個帳號」。
**本票不編輯 `## Acceptance criteria` 任何一個字**，這段說明寫在這裡。

> ⚠️ **2026-09-25 更正（K17）：上面那兩句寫於 2026-09-24 第四輪，現在兩句都假。原句保留。**
>
> | 原句 | 現況 |
> |---|---|
> | 「AC-4 的要求本身不變，仍然必須做（**在正式表上以非核可者身分測三次**）」 | **要求已經變了。** captain 於 2026-09-25 依 `## Review-finding disposition` 第 5 條把 AC-4 由 **3 格擴大為 30 格**（10 列 × 3 分頁，與第八節 S7-b 同範圍）。以 `## Acceptance criteria` 的 AC-4 現行條文為準 |
> | 「**本票不編輯 `## Acceptance criteria` 任何一個字**」 | **本票已經編輯過了。** 同一次授權改寫了 AC-4，並新增 **AC-7**（反向對照 B，18 格）。AC-1／AC-2／AC-3／AC-5／AC-6 仍逐位元組未動 |
>
> **沒變的是這一段真正要講的事**：AC-4 的**資源前置**（第二個 Google 帳號）已經不再卡住，
> 因為 `044` 已取得並使用過那個帳號。前置過期這件事寫在這裡而不是寫進 AC-4，當時的理由已隨授權消失——
> 現在 AC-4 的 `前置` 欄自己就寫著「需要第二個 Google 帳號，而且**它不得被加進 A／B／C 任何一類的允許名單**」。
>
> **下方那則 ✅ 裁決框涵蓋不到這兩句**：它逐字寫的「上面那三句」指的是
> 「🔴 沒有消失，只是縮小了」那一段，不是這裡。

**真正還開著的是什麼。** feature 040 的 Out of scope（`040-approval-content-version-binding.md:290`）
寫的是「不上線正式 SSOT 設定，**直到隔離測試表完成驗證並由 captain 確認**」——**這是兩個條件**：

| 條件 | 狀態 |
|---|---|
| 隔離測試表完成驗證 | ✅ **已滿足**（044，2026-09-21，PASSED，score 0.96） |
| 並由 captain 確認 | ✅ **已確認**（`person:captain`，2026-09-25，選定選項 A）。2026-09-24 此格為 🔴「仍在 captain 手上」，原文見下方 ✅ 框 |

**所以 🔴 沒有消失，只是縮小了。** 原本要裁決的是「要不要為了 044 而延期」，
現在那一半沒有了；剩下的是 040 Out of scope 後半句的那一次確認。
**本輪只做事實更新，不解這個 🔴，也不代 captain 確認。**

> ✅ **2026-09-25 裁決落地：captain 已親自確認放行，選定選項 A。上面的原句保留。**
>
> | 項目 | 內容 |
> |---|---|
> | 裁決者 | `person:captain` |
> | 日期 | 2026-09-25 |
> | 裁決內容 | `040` Out of scope 的後半句「**並由 captain 確認**」——**確認放行**，並選定**選項 A** |
> | 授權來源 | `gate:050:review` / `gate-attempt:050-review-1`，decision `revise`，actor `person:captain`；被審快照 `briefing:050:review:attempt-1:revision-1`（artifact rev `sha256:324d436a…283bae3`） |
> | 依據 | `## Review-finding disposition` 第 5 條——只有 captain 能改已核准範圍與驗收標準 |
>
> **所以這個 🔴 已解。** 兩個條件現在都成立：
> 「隔離測試表完成驗證」✅（`044`，2026-09-21，PASSED，score 0.96）、
> 「並由 captain 確認」✅（2026-09-25，選項 A）。
> **本票不改寫 `040` 的票**；那張票的 Out of scope 原文不動，本票只記錄 captain 的這次確認。
>
> **上面那三句寫於 2026-09-24 第四輪，當時為真，依本票慣例保留。**
> 兩列表第二列的原文是：`| 並由 captain 確認 | 🔴 **仍在 captain 手上。worker 不代為確認。** |`。
>
> **這次裁決解除的是本票唯一的硬前置。** `040` 的合併（步驟 9）在此之前一直卡在這一句上。

**選 B 前要知道的事**：步驟 1-6 本身都可逆（欄位可刪、公式可清、保護範圍可解），
真正不可逆的是**步驟 7 核可過程中若有人同時改動內容**——`approval-workflow.gs` 的復原只還原審核欄位，
不還原內容欄位。以及正式表沒有版本鎖，誤刪整列要靠 Google 的版本記錄救回。

**選 C 不建議的理由**：證據 2 已證明，main 的同步在「建欄」完成的當下就會中止。
步驟 1-3 不是安全的暖身，它就是停擺窗口的起點。

## Acceptance criteria

每一項都寫成「做完之後世界應該是什麼樣子」，並附一個**會失敗**的驗證方式。

**AC-1　部署沒有把既有內容弄壞：以 040 的同步程式跑一次正式表，輸出與部署前逐字相同。**

- `Verified by:` 步驟 8 的指令。取步驟 7 完成後的輸出，與部署前 `src/data/*.json` 的
  sha256（`4d1992e3…cea3b` history、`4071978a…3162` discussions，2026-09-07 量測）比對。
  兩份都必須相同，且 `diff` 無輸出。
- **會怎麼失敗**：任何一列的內容在部署過程中被改到、欄位貼錯位、`chapter` 欄不小心填了值，
  sha256 就會不同。證據 3 已證明「內容沒動時兩邊必然相同」，所以不同就是真的動到了。
- **不可用替代證明**：不接受「肉眼看起來一樣」，不接受只比對筆數。

**AC-2　`npm run sync-content` 在正式表上實際成功一次，exit code 為 0。**

- `Verified by:` 步驟 8 的指令 exit 0，且 stdout 出現
  `✅ 檢查通過，已寫入 src/data/history.json（40 筆）` 與
  `✅ 檢查通過，已寫入 src/data/discussions.json（16 筆，含 tldr）`。
- **會怎麼失敗**：八欄少建一欄 → `缺少必要欄位「X」。`；重新核可漏一列 →
  該列被過濾掉，筆數變成 39；核可紀錄不完整 → `核可紀錄缺少 X。`。
  證據 2 的階段 A、B、C 全部 exit 1，證明這道閘門真的會擋。
- **筆數是硬條件**：40 與 16 兩個數字必須逐字出現。少一筆代表有內容掉了。

**AC-3　重新核可完成後，三個分頁沒有任何「應上線」的列停在 `Needs review`。**

- `Verified by:` 步驟 8 跑完後，比對 `$OUT/history.json` 與 `$OUT/discussions.json` 的
  `id` 清單和部署前的 `id` 清單，必須完全一致（順序也一致）。
  沿用步驟 8 的 `REPO` 與 `OUT` 兩個變數，接著執行：
  ```bash
  REPO="$REPO" OUT="$OUT" node -e '
  const fs=require("fs");
  const ids=p=>JSON.parse(fs.readFileSync(p,"utf8")).map(r=>r.id);
  for (const f of ["history.json","discussions.json"]) {
    const a=ids(`${process.env.REPO}/src/data/${f}`), b=ids(`${process.env.OUT}/${f}`);
    console.log(f, JSON.stringify(a)===JSON.stringify(b) ? "✅ id 清單一致"
      : "⛔ 少了:"+JSON.stringify(a.filter(x=>!b.includes(x)))+" 多了:"+JSON.stringify(b.filter(x=>!a.includes(x))));
  }'
  ```
  兩行都必須是 `✅ id 清單一致`。這段指令 design stage 已實測會真的印出差異
  （拿一份只有 1 筆的 fixture 比對，正確列出少掉的 39 個 `h*` 與 14 個 `d*`）。
- **會怎麼失敗**：漏核可某一列 → 該 `id` 在「少了」清單裡出現。
  誤核可 `h28` 這種不該上線的列 → 出現在「多了」清單裡，同時 AC-1 的 sha256 也會不同。
- **為什麼不直接數 `Needs review`**：分頁上本來就該有停在 `Needs review` 的列。
  「應上線的列都上線了」等價於「輸出的 id 清單沒變」，這個才可機器驗證。

**AC-4　保護範圍的行為逐欄逐分頁成立：以投稿者身分實測第八節 S7-b 的 30 格，逐格與預期相符。**

- `Verified by:` 以**投稿者**角色的 Google 帳號開啟正式表（不是 captain，也不是責任編輯；
  帳號前置、共用時機與收尾見第八節 S7-b 第 1 點），照**第八節 S7-b 的 30 格表**逐格操作：
  **10 列 × 3 分頁 ＝ 30 格**。
  - 第 1-9 列的 27 格（標題列、`status`、`current_fingerprint`、六個審核欄）：
    必須跳出 Google 的「您嘗試編輯受保護的儲存格」對話框，**且儲存格值不變**。
  - 第 10 列的 3 格（內容欄，反向對照）：必須**輸入成功**，並依 S7-b 第 3 點立刻還原。
  - **那張 30 格表是本 AC 的唯一欄位／類別／A1 位置來源。** 本條刻意不另抄一份，避免兩份漂移。
- **記錄要求涵蓋全部 30 格**：UTC 時間、**30 格逐格的結果**、使用的角色（**不記 email**）。
  **不接受「抽測幾格、其餘推定相同」**——`044` 抓到的假通過是分布式的：
  一張七列、三分頁、由 captain 親手設定的測試表上，**只有兩欄真正受保護**，
  其餘每一欄的設定畫面都看起來正確。抽樣抓不到這種分布。
- **會怎麼失敗**：保護範圍漏設某一欄、某一個分頁漏設、或設成「顯示警告」而非「限制編輯」，
  該格就會被改掉——30 格裡至少一格與預期不符。
  第 10 列若反而被擋住，是另一個方向的失敗：**過度保護，責任編輯沒辦法工作**。
- **不可用替代證明**：不接受保護範圍的設定畫面截圖（`044` 已證明畫面正確而行為未生效）；
  不接受由 captain 自己測——**保護範圍排除不了擁有者**，他 30 格全部會「可改」，測不出任何東西。
- **前置**：需要第二個 Google 帳號，而且**它不得被加進 A／B／C 任何一類的允許名單**。
  這與 044 的資源前置是同一個，見「相依關係釐清」的相依二（該帳號已於 `044` 取得並使用過）。

> ⚠️ **2026-09-25 AC 變更：本條由 3 格擴大為 30 格，逐欄逐分頁。授權者 `person:captain`，
> 依 `## Review-finding disposition` 第 5 條（只有 captain 能改 acceptance criteria）。
> 原條文保留於此供追溯：**
>
> > **AC-4　以非核可者身分編輯審核欄位會被拒絕。**
> >
> > - `Verified by:` 以未列入保護範圍的 Google 帳號開啟正式表，
> >   對 `Track 1_history` 任一資料列的 `approved_by` 儲存格輸入任意字元。
> >   必須跳出 Google 的「您嘗試編輯受保護的儲存格」對話框，且儲存格值不變。
> >   對 `status` 與 `current_fingerprint` 各重複一次（步驟 6 的 A 類與 B 類是分開設定的，要各測一次）。
> >   記錄：UTC 時間、三次嘗試的結果、使用的角色（**不記 email**）。
> > - **會怎麼失敗**：保護範圍漏設某一欄，或設成「顯示警告」而非「限制編輯」，
> >   儲存格就會被改掉。
> > - **前置**：需要第二個 Google 帳號。這與 044 的資源前置是同一個，見「相依關係釐清」的相依二。
> >   若 captain 選了選項 B（豁免 044），這一項仍必須做，只是改在正式表上做。
>
> ⚠️ **2026-09-25 第二次更正（K19）：上面這份「原條文」第一次貼的時候漏了一條。**
> 漏掉的是第二個項目符號「**會怎麼失敗**：保護範圍漏設某一欄，或設成「顯示警告」而非「限制編輯」，
> 儲存格就會被改掉。」，而且三個 `- ` 標記一併被拿掉，變成連續文字，更難看出少一條。
> **本輪已把那一條補回去，三個 `- ` 標記也還原**，所以「原條文保留於此供追溯」現在才是真的。
> **實質內容當時沒有丟**——新 AC-4 的「會怎麼失敗」寫得比原條文更完整；
> 錯的是「保留」這個動作沒有做完，以及描述它的那句話。
>
> **captain 的理由（2026-09-25，要點）**：那 30 格的工時本來就要付（S7-b 已經要求做），
> 差別只在它算不算正式證據；`044` 的教訓是**只有兩欄真正受保護、其餘看起來正確但未生效**，
> **3 格抽樣抓不到這種分布式漏設**。
>
> **原條文最後一句已失效**：選項 B 那句的前提是「captain 尚未裁決」。
> captain 已於 2026-09-25 選定**選項 A**，見「相依關係釐清」的相依二。
> 本條仍然必須做，而且是在正式表上做。

**AC-5　標題列受保護，非 captain 改不動。**

- `Verified by:` 同 AC-4 的帳號，嘗試修改 `Track 2_discussion` 第 1 列任一標題儲存格，
  必須被拒。三個分頁各測一次。
- **會怎麼失敗**：標題列保護是與審核欄位分開設定的（`editor-onboarding.md:110`），
  很容易只設了欄位忘了標題列。改得動標題就是漏設。

**AC-6　部署後 main 仍然不可用，這件事被明確記錄且不被誤認為故障。**

- `Verified by:` **不要在 repo 根目錄直接跑 `npm run sync-content`**——main 的程式不吃
  `CONTENT_OUTPUT_DIR`，成功時會直接覆寫 `src/data/`，違反 `AGENTS.md` 第 1 條。
  改成把 main 的程式複製到暫存目錄再跑；它的輸出路徑是相對於自己的位置算的，
  所以會寫進暫存目錄底下的 `src/data/`，碰不到 repo：
  ```bash
  SANDBOX="$(mktemp -d)"; mkdir -p "$SANDBOX/scripts" "$SANDBOX/src/data"
  git -C "$REPO" show main:scripts/sync-content.mjs > "$SANDBOX/scripts/sync-content.mjs"
  git -C "$REPO" show main:scripts/content-fingerprint.mjs > "$SANDBOX/scripts/content-fingerprint.mjs"
  node --env-file="$REPO/.env.local" "$SANDBOX/scripts/sync-content.mjs" > "$SANDBOX/out.txt" 2>&1
  echo "exit=$?"   # AC-6（窗口已開）必須是 1；S3 重用這段時必須是 0
  grep '對不到任何預期欄位' "$SANDBOX/out.txt" | grep -q 'review_decision' \
    && echo "✅ 出現預期的標題錯誤（窗口確實打開）" \
    || echo "⛔ 沒有出現預期的標題錯誤"
  ```
  必須 exit 1 並輸出一行指出 `review_decision` 這一欄對不到任何預期欄位。
  **怎麼認出那一行**：同一行同時含 `對不到任何預期欄位` 與 `review_decision` 兩個子串，即成立。
  上面的 `grep` 就是這個判準。
  **不要逐字比對引號內的內容，也不要綁欄號。** 照第三節的建議標題建欄後，程式實印的是
  `第 15 欄的標題「review_decision （由 Review 選單寫入）」對不到任何預期欄位。檢查是否打錯字。`
  ——引號內含中文說明，所以 `grep '「review_decision」'` 會找不到；
  欄號則依實際建欄順序而變（S2／S4 的分階段順序為第 15 欄，第三節「建議排序」為第 12 欄）。
  這是**預期行為**，不是 bug。合併 040 之後再跑一次（此時 main 的程式已是新版），必須 exit 0。
- **會怎麼失敗**：若這一步 exit 0，代表八個欄位沒有真的建進正式表，前面所有步驟都沒生效。
- **這個 sandbox 手法 design stage 已實測**：以本機 fixture 餵入四個部署階段的 CSV，
  main 版程式在階段 A exit 0、階段 B/C/D 全部 exit 1。
  那一輪的 fixture 用**純欄名**當標題，所以印出的是 `「review_decision」`（引號內沒有中文說明）。
  改用含中文說明的真實標題後，引號內就多了說明字串——這正是上面那個 `grep` 判準要吸收的差異。
- **這一項的用意**：讓「產線停擺窗口」變成可觀測的事實，而不是口頭承諾。
  合併 040 之前若有人跑了 main 的同步並看到錯誤，本票已經寫明那是預期的。

> ⚠️ **2026-09-29 `Verified by:` 更正（授權者 `person:captain`，2026-09-29 裁決「全部照建議」，經 FO 轉述；一次性授權，只加一行）。**
> 上方指令區塊新增第三行
> `git -C "$REPO" show main:scripts/content-fingerprint.mjs > "$SANDBOX/scripts/content-fingerprint.mjs"`。
> **原因**：040 合併後（`e98ed02`），main 的 `sync-content.mjs:4` 會 import 同目錄的 `./content-fingerprint.mjs`。
> 原指令只複製一個檔，程式在讀試算表之前就以 `ERR_MODULE_NOT_FOUND` 中止（2026-09-29 實測）。
> **原指令的複製區只有一行，逐字為**：
> `git -C "$REPO" show main:scripts/sync-content.mjs > "$SANDBOX/scripts/sync-content.mjs"`
> 該行仍在原位，未改一字。AC-6 其餘文字未動。

**AC-7　反向對照 B：以責任編輯身分，B 類那六個審核欄必須改得到。18 格逐格成立。**

- **為什麼要有這一條**：AC-4 的 30 格證的是「**投稿者改不到**那六欄」，
  **不證明「責任編輯改得到那六欄」**。B 類就算設成「只有你（captain）」、
  或允許名單是空的，那 30 格照樣全過——見第八節 S7-b 的「兩條假通過路徑」第 2 條。
  **兩個方向是獨立的兩件事，各需要一次實測。**
- `Verified by:` 第八節 **S7-d** 的逐格程序。以**責任編輯**身分，
  對 B 類六欄（`review_decision`、`review_fingerprint`、`approved_by`、
  `approved_at`、`approved_fingerprint`、`reject_reason`）在三個分頁各測一次，
  **6 欄 × 3 分頁 ＝ 18 格**。每一格都必須**輸入成功且儲存格值真的改變**，
  然後還原成空白。**A1 位置取自 S7-b 的 30 格表第 4-9 列，不另算一份。**
- **記錄要求**：UTC 時間、**18 格逐格的結果**、使用的角色（**不記 email**）。
- **會怎麼失敗**：B 類的允許名單沒有包含該責任編輯帳號——設成「只有你」、
  名單空白、或只加了其中一兩個分頁——該格會跳出
  「您嘗試編輯受保護的儲存格」，與預期相反。
  **這正是部署後 `Review → 核可選取列` 靜默失敗的成因**（步驟 7「常見錯誤」表最後一列）。
- **不可用替代證明**：
  - **不接受由 captain 自己測。** 保護範圍排除不了擁有者，他 18 格全部會「可改」，
    不論 B 類名單裡有沒有他以外的人。這一條與 AC-4 是同一個平台限制，方向相反而已。
  - **不接受看保護範圍的設定畫面。** `044` 已證明畫面正確而行為未生效。
  - **不接受用 AC-4 的 30 格代替。** 那 30 格證的是相反方向。
- **前置**：責任編輯帳號，且它必須已在 B 類三個分頁的允許名單內。
  **repo 內查不到正式表的責任編輯是哪一個帳號**——實查結果與處理方式見第八節 S7-d 第 1 點。

> ⚠️ **2026-09-25 新增：本條是 captain 依 `## Review-finding disposition` 第 5 條
> 親自行使的 AC 變更（授權者 `person:captain`，決定「收」）。**
> 它補的是 review cycle 3 標為 **Deferred risk** 的殘留缺口——
> 原缺口框在第八節 S7-b，寫著「本輪不修，寫明給下一位」。缺口自此有驗收條文。

## 元件與資料需求

- **元件階層與 props**：**不適用。** 本票不新增或修改任何 React 元件，`src/` 下不會有任何檔案變更。
  唯一的程式碼變更是步驟 9 的 040 合併，那是 040 的交付物。
- **手機／桌機響應行為**：**不適用。** 同上，沒有 UI 變更。
- **資料形狀**：不變。`src/data/history.json` 與 `src/data/discussions.json` 的 schema
  與內容都必須逐字不變（AC-1）。本票新增的八個欄位全部停在 SSOT 端，不進入 JSON 輸出。
- **資料來源**：正式 SSOT 試算表 `收集區` 的三個分頁，經由 `.env.local` 的三個 CSV URL 讀取。
  **URL 不得寫入 repo、不得寫入本票、不得貼進任何報告。**
- **新增型別**：無。

## Documentation impact

> 🔒 **本票的寫作規則（captain 2026-09-25 親自授權，全票適用，不限節次）**
>
> **票內不得斷言「部署現在做到哪裡」這種會自己過期的事實。** 需要記錄現況時二擇一：
> **(a)** 明寫 UTC 量測時戳並寫明那是歷史讀數，或
> **(b)** **只留可重跑的指令，不留當時的輸出**。
> **指令永遠為真，輸出十分鐘後可能就假了。**
>
> **單調／非單調判準**：「**已完成 X**」單調、不會過期，不必標時戳；
> 會翻面的是「**仍是**」「**尚未**」「**待補**」「**還沒**」「**目前仍**」。
>
> **引用版本一律釘 SHA，不得使用 `HEAD`、`main` 等移動引用**——
> **移動引用是非單調的，寫下的瞬間就開始過期。**
> （`main`／`HEAD` 出現在**指令**裡沒問題，只要把它解析出來的 SHA 一併印在旁邊；
> 不可以的是拿它當**量測標籤**，例如「某值在 HEAD 是 12」。）
>
> **這條規則為什麼出現在這一節**（reviewer cycle 6 收出的判準，逐字寫進票內）：
>
> > **斷根規則寫在處置節裡，擋不住操作節與交付節。**
> > **規則要放在「會被讀到的那一節」，而不是放在「記錄它的那一節」。**
>
> 第一次入票時規則只寫在第十六節與第十七節（兩節都是**處置節**），
> `## Documentation impact` 因此完全沒被掃到，同一形狀第三次復發。
> **覆蓋清單與掃描方式見第十八節。**
>
> ---
>
> 🔒 **同一條規則的上游版本：寫授權封包與 `### Feedback Cycles` 的人也受約束**
> （FO 提出，經 reviewer cycle 6 收緊後採用；逐字寫在這裡是因為
> **worker 會把授權封包的字逐字抄進票內**——K18 就是這樣被放大成五處的）。
>
> > 在**授權封包**與 **`### Feedback Cycles`** 寫下任何**非單調**狀態宣稱或數量詞之前，
> > **先跑一條列舉型指令，再依輸出寫結論**；票內**只留那一行指令**；
> > 需要留結果時**同時標 UTC 時戳並寫明是歷史讀數**；
> > **凡逐字轉寫的值（hash、行號、SHA、數量），封包送出前各自回讀一次。**
>
> **「列舉型」是關鍵字。** K26 的成因是**以確認型指令回答了列舉型問題**——
> 用 `git show <SHA> | grep` 查到「那個 commit 裡沒有」（那是真的）就停手，
> 沒有跑 `git log --oneline <SHA>..HEAD` 去列出後來發生了什麼。
> **確認型指令只能證實你已經想到的事；列舉型指令會告訴你還有什麼。**

### 現在更新

| 文件 | 要記什麼 | 狀態 | 驗證目標 |
|---|---|---|---|
| 本票（`050-…md`） | 上述 runbook 與 AC | **部署進度不寫在這裡**——跑第十六節的兩條指令。本列的交付判準是「runbook 與 AC 已寫完」，**那是單調的，已成立** | 步驟 8 的 sha256 比對 |

> ⚠️ **2026-09-25 更正（K22）：上一版的狀態欄是一句會自己過期的斷言，而且現在已經是假的。原句保留。**
>
> 原文：`已定方向、**尚未執行**。試算表目前仍是部署前狀態`
>
> **假在哪**：S1／S2／S3 都已執行，試算表**不是**部署前狀態。
> 否證證據就在本票內部——第十七節的「量測記錄」逐字寫著 S1 已執行、S2 已執行、S3 已通過。
>
> **依斷根要求 (b) 處置**：本列不再記進度，只指向第十六節的兩條指令。
> **本列真正要回答的問題是「這份文件更新了沒有」**，而那是單調的：runbook 與 AC 已寫完，成立。
> **把部署進度塞進交付狀態欄，是把兩件不同的事寫在同一格。**

**沒有其他文件現在更新。** 理由：本票尚未執行任何一步，把預定行為寫進
`docs/` 下的 `evergreen` 文件，會讓文件描述一個不存在的現況——
這正是 `AGENTS.md` 指出的「過時的 evergreen 文件是危險的」。

> ⚠️ **2026-09-25 更正（K22）：「本票尚未執行任何一步」已是假的。原句保留。**
>
> **不變的是結論**：現在仍然只更新本票，其他文件一份都不動。
> **變的是理由**，改寫成不會過期的說法：
>
> **`docs/` 下那些 `evergreen` 文件描述的是「產線平常怎麼運作」，
> 而本票改的是那條產線本身。** 部署做到一半時把新流程寫進去，
> 文件會描述一個**只在窗口期間成立**的中間狀態——那比「過時」更糟，
> 它從來沒有真正對過。**所以判準是「部署完成與否」，不是「開始了沒有」**，
> 而完成的定義寫在「實作後更新」那一表的每一列條件裡（`040 合併之後`／`部署完成後`）。
>
> **要知道部署走到哪裡，跑第十六節的兩條指令；不要引用本節的任何一句話。**

### 實作後更新

| 文件 | 要改什麼 | 條件 |
|---|---|---|
| `docs/content-pipeline/operations.md` | 新增「正式 SSOT 部署」一節，把本票步驟 1-7 收編為正式程序；第 12 行的 probe 但書依 captain 裁決結果改寫或加註 | **040 合併之後**（該檔合併前不在 main） |
| `docs/content-pipeline/design.md` | 第二節欄位表補上八個審核欄位與 `chapter`；第五節施工順序表追加本票為新項目 | 部署完成後 |
| `docs/health-check/TODO.md` | P3-7（`chapter` 設計已放棄）追記：本票為了 Apps Script 建了一個空白 `chapter` 欄，該欄現在有技術用途，廢除它要連 `approval-workflow.gs` 一起改 | ~~步驟 1 完成後~~ **條件已成立，這筆義務已到期** |
| `docs/health-check/2026-09-03-editor-onboarding.md` | **不改寫原文**，追加補述：第 261 行「`reject_reason` 欄不存在」已於本票解決；第 425-430 行的順序判斷正確，但漏了「建欄當下 main 就同步不了」這一點 | 部署完成後 |
| `docs/INDEX.md` | 若 `operations.md` 隨 040 進 main，補一筆索引 | 040 合併後 |

> ⚠️ **2026-09-25（K22）：上表 `TODO.md` P3-7 那一列的條件已經成立，這筆義務已到期。原條件文字以刪除線保留。**
>
> **條件「步驟 1 完成後」＝「`Track 1_history` 補一欄 `chapter`」完成**（步驟 1 的原文就是這件事）。
> **S2 已經把 `chapter` 建好了**——這是**單調事實**（「已完成 X」不會翻面），依寫作規則**不必標時戳**。
> 要自己確認一次：
>
> ```bash
> # 在 repo 根目錄執行。只讀正式表，零寫入。/tmp/hdr.mjs 的內容見本票第五節。
> node --env-file=.env.local /tmp/hdr.mjs \
>   | grep -c 'chapter'        # ≥1 即步驟 1 已完成
> ```
>
> **這一列本來讀起來像還沒到期**，而排定文件更新時機的人就是讀這一表。
> **這不是措辭問題，是一筆已經到期卻看不出到期的義務。**
> **本票不代為執行它**——改 `TODO.md` 不在本票的交付範圍內（本票 surface 只有票檔一個），
> 這裡只把到期狀態記明白，交給 FO 或 captain 決定誰去做。
| ~~`docs/constitution-features/044-…md`~~ | ~~依 captain 裁決結果，在 044 的相依關係註明它是否為 050 的前置~~ | **已無法執行。** 044 於 2026-09-21 完成並歸檔到 `_archive/`，而 `docs/_archive/` 依 `AGENTS.md` 的文件規範不動。本票與 044 的關係改記在本票的「相依關係釐清」相依二 |

### 不更新

| 文件 | 為什麼 |
|---|---|
| `AGENTS.md` | 本票不改變任何 agent 的行為約束。「不要自己執行內容同步」在部署後依然成立 |
| `docs/content-pipeline/data-collection-guide.md` | 它寫的是內容怎麼蒐集，與審核欄位無關 |
| `docs/project/` 全部 | 架構與技術選型不變 |
| `docs/_archive/` | 依規定不動 |
| `scripts/` 下任何程式 | 本票是純部署票。程式在 040，已完成 |

### Feedback Cycles

- Cycle 1: PASSED-with-findings — verify gate（verify cycle 1 判 PASSED 並提 F1–F4，FO 依 `## Review-finding disposition` 授權四筆全部 fix，未經 captain 裁決即修——四筆皆不改 AC 要求，F2 屬 captain 2026-09-24 的一次性 `Verified by:` 授權範圍）；surface 1 檔（本票）；**AC-1 至 AC-5 逐字未動**，AC-6 僅 `Verified by:` 與一句必要連帶修正（原寫「錯誤訊息與上面逐字相同」，在 AC-6 改寫後已成假，已揭露）；**正式試算表零寫入、零存取**（沿用 cycle 1 的快照）；`src/`／`scripts/` 零變動、`src/data/*.json` 在 main／本票 HEAD／工作區三者 sha256 相同、未跑 `sync-content`、未動 040 worktree。**F2 fix（Material，最優先——它發生在產線全停窗口內）**：AC-6 原要求工程逐字看到 `第 N 欄的標題「review_decision」對不到任何預期欄位。`，但照票用含中文說明的標題建欄後程式實印 `「review_decision （由 Review 選單寫入）」`，**引號內多了說明，逐字比對找不到**；改為判「同一行同時含 `對不到任何預期欄位` 與 `review_decision` 兩個子串」且不綁欄號。implement 另查出訊息實際結尾還有 `檢查是否打錯字。`（main `sync-content.mjs:294` 的 `addError` 樣板），票內原本連這句都沒寫。**verify cycle 2 親手跑了關鍵的否證格**：把一份**沒有標題錯誤的合法 fixture** 輸出餵進新判準，**新判準同樣判失敗**——它不是被放寬成恆真；另自加一格（抓取失敗類錯誤同樣 exit 1 但印 ⛔）證明兩個條件合起來才判得準。**F4 fix（Deferred risk）**：D4 把部署由「單一 2 小時窗口」改成「階段一可分次 ＋ 階段二窗口」，而階段一要 captain 先建三個**編輯台可寫**的內容欄（`chapter`／`owl_depth_comment`／`full_content`），保護範圍要到階段二 S7 才設；實測填入非空值 main **仍 exit 0**、只有 sha256 變，**沒有任何程式會擋**。S2 補「三欄在 S9 完成前必須全欄留白」，S3 補兩個 `diff` 指令、一張二分判定表與 re-baseline 條文，並寫明**重量 baseline 不等於放寬 AC-1**（判準不變，變的只是基準的量測時點）。**F4 的修改全部落在 S2／S3，未碰 AC-1 條文**（verify 以逐區塊 diff 確認）。**F1 fix（Polish）**第六節「其後 14 列」改 **13**（與同文件 S8 一致；`d3` 占序號 3，其後 `Approved` 為第 5-17 列）。**F3 fix（Polish）**`TODO.md:127` 改 **156**（127 為空行）。**掃同類的收穫大於被點名的兩筆**：implement 把引用檢查由 verify 掃的 8 處擴到**全票 31 處**，另查出**三處同類**——`editor-onboarding.md:430`（出現 4 次，該句實在 **434**）、`040-….md:221`（實在 **290**）、本票自我引用「第 50 行」（實為 **53**）；四處全修，兩處自我引用另補章節錨點。數字方面對每組附加總驗算（`24＝8＋9＋7`、`59＝40＋15＋4`、六段 `1＋21＋18＋2＋13＋4＝59` 等），**verify 已確認的 24／9／15／59／12／6 全部原值保留，S7 與 S8 整個區塊逐字未動**。verify cycle 2 判 **PASSED**，四筆修正「全部是真的修正，沒有一筆看起來修了其實沒修」，另提 G1–G4（見 Cycle 2）。**本輪未經 `gate record --round` 記錄**（captain 既有授權：跳過 round record、直接重跑；本票 `gates:` 於本輪尚未建立 verify 階段指標可綁定的 round room）。三項未結項原樣留存：步驟 1–7 為 captain 手動、AC-2 的實際同步需在部署後跑、040 的合併為步驟 9。
- Cycle 2: PASSED-with-findings — verify cycle 1 判 PASSED 後 FO 授權的第二輪（G1／G2／G3 fix，G4 為 FO 自有並由 FO 補寫）；surface 1 檔；**正式試算表零寫入零讀取**；AC 整段與承重數字 24／9／15／59／12／6 未動。**G3（最要緊，captain 的下一關就是 S3）**：S3 的二分判定表前兩個條件（main exit 0、`diff` 落在那 59 列之內）**誤刪一列已核可的列也會同時滿足**，擋住它的只有第三個人工條件；若有人把 diff 位置當充分條件而重量 baseline，**會把掉掉的那一列烤進新基準、AC-1 之後反而會通過**，最壞情況是少一筆內容靜默上線。修法加兩項機器可判前置（筆數仍為 40／16、AC-3 的 id 比對仍一致）；**五情境實測兩個方向都成立**——誤刪 `h1`／`d1` 擋住、編輯合法填 `chapter`／`owl_depth_comment` 放行（**不是把會誤判的路換成永遠停住的路**）、而**舊前置在五個情境全部放行、含三種掉列**。否證格 **B3（刪 `h1` 又補一列已核可的 `h99`）筆數仍是 40、只有 id 比對開火**，證明兩項檢查缺一不可。**G1 的更正方向是反的，verify 主動認錯**：`TODO.md` 在 main 與本 branch 是兩個 blob（1046 對 1006 行，差異為插在第 596 行起的 40 行），P3-7 在 main 是 905、在 worktree 是 865，**差值正好等於插入行數**——所以「`TODO.md:行號`」在本票**沒有唯一答案**，處置不是改行號而是改**名稱引用**；票內最後一處 `:156` 也一併改掉，理由是「目前兩邊都對，但那是因為差異從第 596 行才開始，**是運氣不是保證**」。**G2 擴大範圍後查出的比原 finding 嚴重：引錯的是檔名**——票內兩處寫「`design.md` 明訂舊列不能批次補造指紋」，而 `design.md` 全檔 `補造`／`批次` 皆零命中，該規則實際在 `editor-onboarding.md:432-433`；這兩處**不帶行號也不帶節號**，故既不在第一族也不在第二族，**第三族是「只寫檔名、不寫位置」的引用**。錨點的判斷題依 verify 評價定案：補章節錨點是**部分改善不是修好**（**錨點買到的是「可復原」而非「不漂移」**），自我引用的行號拿掉只留錨點；跨檔行號保留，判準為**「這個檔會不會在我引用它之後變動」**而非「行號一律不好」。
- Cycle 3: PASSED-with-findings — 第三輪（H1／H2／H3／H4 fix）；surface 1 檔；**正式試算表零寫入零讀取**；AC 整段與 **S3／S7／S8** 逐位元組未動。**H1（Material，本輪最要緊，captain 正在部署）：feature `044` 早在 2026-09-21 就 `complete`／`PASSED`／`score 0.96`／`pr-merge:36`／已歸檔 `_archive/`，而票內仍寫「044 的前置…目前不存在」「鏈條頭卡住」。****三個 🔴 選項因此全部失真**——A（建議）的代價「040 合併再延一輪、要多開一個帳號」**已經付掉**；B（豁免 probe 但書、直接在正式表部署）票內自標「**部分不可逆**」「錯誤發生在 40 筆已上線內容的唯一來源上」，**其唯一好處已歸零**，**選 B 等於拿那 40 筆去換一個已經不用付的成本**。處置為**任務內事實更新**（原句保留、三選項代價重寫、寫明 `operations.md:12` 的保護邊界觸發條件已滿足與 AC-4 的第二帳號前置已過期），**🔴 未解、未代 captain 確認**——`040` Out of scope 是「隔離測試表完成驗證**並由 captain 確認**」兩個條件，**前一半 044 做完了，後一半仍在 captain 手上**，裁決已由 FO 直接送交 captain。verify 另查出歸檔 commit `66ed939` **連 merge-base 都是它的後代**，即「044 已完成」**從本 branch 第一個 commit 起就看得到，只是六輪沒有人打開那張票**。**H2 是本輪的方法收穫：第四族是「引用另一張票、只寫 feature 編號」**，它變的是**被引用對象的狀態**而非位置，三條邊界宣告一條都擋不住（三條都假設引用對象是「內容穩定、只有位置會變」的檔）；檢查方式改為**重讀被引用票的 front matter**。全票 5 張被引用票逐一重讀：044 ⛔、043 ⛔、040 ✅（尚未合併有後果）、042 ✅、065／066／049 ✅。**失效模式的關鍵差異值得單獨記**：前三族壞掉時讀者會看到不相干的內容因而發現；**第四族壞掉時句子讀起來完全合理**——「044 的前置目前不存在」是通順、具體、有證據感的句子，不指向任何會露餡的位置，**所以它躲過三輪掃描與三個 reviewer**。**H4：implement 拒絕照抄 FO 的提示，而且是對的**——FO 說「比照 044 把 `.gs` 釘 `093cd01`」，實查發現 `.gs` 與 `operations.md` 在兩個 commit 同位元組，**但 040 的 `sync-content.mjs` 在 `093cd01` 只有 807 行且 `publishedRowSequences` 根本不存在**（`a51b5d9` 為 824 行、該函式在第 392 行），**照抄會讓票內 11 處行號指偏**；三檔一律釘 `a51b5d9`，並把那 17 行差異當成 H4 論點本身的證據（040 未合併、檔案真的會動）。**H3**：票內把整列刪除推給 `043`，但 043 `status: design`、標題仍掛「待captain確認脈絡」、source 寫「**再決定是否進行**」，且其門檻「初步建議兩成」**擋不住單列誤刪**（1／40 ＝ 2.5%）；改措辭而非改防線——**本票的防線是 S3 的檢查①②**。
- Cycle 4: PASSED — 收斂輪（J1／J2 fix）；surface 1 檔；**正式試算表零寫入零讀取**；**未開新票、未開新的掃描維度**；AC 整段與 S3／S7／S8、`### Feedback Cycles`、verify cycle 4 整段皆逐位元組未動。**J1：第五族——指涉一張沒有編號、而且不存在的票。** 票內三處（`chapter` 廢除的「另一張票」、Apps Script 缺別名表的「後續票」、保護範圍的「另議」）**查證後都沒有對應的票**；implement 讀完 66 張票的 `title` 與 `status` 確認無一涵蓋。**這一族比第四族更難查**：第四族至少有票號可以打開重讀，**第五族沒有編號，掃描再完整也掃不到**——只能問「這句話承諾的東西，實際上存在嗎」。**而它在這張票上特別刺眼**：本票 `## Problem` 自己寫著「**這些人工步驟目前沒有任何票、沒有任何人負責**」——**050 存在的理由，就是有人用「另議」把事情擱著**，而本票用同一種方式擱下三件事。處置為改成「尚無票，負責人未定」的明白話（**不開新票，開票屬 captain 的範圍決定**），原句保留；`chapter` 指向其唯一落腳處 `TODO.md` 的 P3-7（用名稱不用行號）。**Apps Script 別名表那一處刻意寫兩面**——「現在安全」（18／21／12 個含中文說明的標題已實測同時通過兩支程式）與 promote-to-material 條件（**有人在部署後改動任一標題字串**，那一刻 Apps Script 可能無聲失效而同步程式仍通過，兩邊不會互相提醒）；理由是「**只寫風險會讓 captain 以為現在就壞了，只寫安全會讓人忘記這個缺口**」。**順帶拆開一個把兩件事綁在一起的原句**：「不處理標題列與整列刪除的保護範圍」——**標題列的保護本票有做**（步驟 6 的 C 類、S7、AC-5），沒做的只有整列刪除；並寫明 `043` 補不上這一格（**它是同步端偵測，這裡缺的是試算表端預防**，而本票的替代防線 S3 檢查①②**同樣是偵測不是預防**）。**J2 原句一個字未改**——它說的是 spike 的**形式**而非進度，本來就沒錯；只在其下補引言說明該 spike 已由 044 完成並 PASSED，並點明這個區分，**免得下一輪有人把沒錯的句子當成錯的再改一次**。verify 判定不該改的兩處逐位元組未動。**verify cycle 5 依收斂判準判 PASSED：無擋住部署之事、無 Material 缺陷、未開新掃描維度。**
- Cycle 5: PASSED — review (cycle 4，最終輪)；K11／K12／K13 三筆 Polish 全部落地，**對正式試算表零寫入零讀取且未發出任何網路請求**（captain 同時正在該表上執行 S7）。**三筆是同一個形狀，而那個形狀已寫成第九節的判準三**：**更正的內容都是對的，錯的是描述更正的那句話**——四個宣稱「三處」「更早」「兩處」「五處」**沒有一個是查過才寫的**。可操作版本：**更正裡出現數量詞、先後、或「全部／都」時，當場跑一次能否證的指令，並把指令留在票內。** K12 的重算指令是它的第一次實踐，**reviewer 照原樣跑過一次、exit 0、逐字印出「4 處／3 檔」、三個檔與逐檔處數全符**。K11：先後順序改對（`044` 結論節 `36af185`／2026-09-15 在前、debrief `39ea85e`／2026-09-17 在後），**承重結論保留並改得更準**——那項義務有兩個見證而兩個都被漏掉，而順序反過來對本票更不利：**最早的記載是 `044` 自己的票，正是第六族該抓的東西**。K12：改為 4 處／3 檔、憑空的 `#6-#27` 自活宣稱移除。K13：K10 的第三處（第十三節標題與首句）更正，並自承第七輪只處理了兩處。**第四個例子由 implement 自己找到，而它是四筆裡最有說服力的**：票內 8 處「90 個 A1 位置」是從 **FO 的授權書**照抄的，正確為 **30**（10 列 × 3 分頁）；reviewer 程式化清點確認 **11 處 ＝ 它自己報告內 3 ＋ 本票 8**，那 8 處全部改為 30，**而它自己的六個報告區塊逐位元組未動**。**reviewer 對這一筆的判斷值得單獨記**：**它是四筆裡唯一跨角色的**——前三筆都是同一個寫作者描述自己的更正，第四筆的數量詞**從 reviewer 出發、經 FO 的授權書、進本票 8 處**；**所以判準三必須同時約束「寫更正的人」與「轉述數量詞的人」。****它並更正了 FO 的字面用詞**：形狀正確但**該說「同一種」不是「同一條」**——K11 的鏈是本票→FO→captain，第四例是 reviewer→FO→本票，**中間環相同但起點終點不同**；不列為 finding。**而它拒絕替 FO 的「三次」背書，理由本身就是判準三的用法**：**本票內它能證兩次**（K11、第四例），第三次（`056` 的 F-26）不是本票的 finding、它在本票內查不到，**故它只確認自己跑得出來的兩次**。**一個 reviewer 把 FO 剛授權的判準，套用在 FO 自己的陳述上——這是本票十四輪來最乾淨的一次收尾。**未越界：AC 要求文字與 `## Acceptance criteria` 整段逐位元組未動；**AC-4 的兩項裁決仍待 captain**；🔴 未解、未代 captain 確認；那 30 格與其 A1 位置、S7 的 12 個範圍表、S3、S8 皆逐位元組未動；承重數字 24／9／15／59／12／6 原值保留；review 四輪與 verify 五輪報告全部逐位元組未動；`src/`／`scripts/` 零變動、`src/data/*.json` 與 main 相同、未跑 `sync-content`、040 worktree 乾淨。
- Cycle 6: REVISE — review gate（**captain 親自裁決 `revise`，非 reviewer 判 REJECTED**；`review cycle 4` 的 PASSED 未被推翻）；surface 1 檔；**對正式試算表零寫入**（本輪只發出兩次唯讀讀取，皆為票內既有手法）。captain 依 `## Review-finding disposition` 第 5 條行使 AC 變更授權，三項逐項落地：**(1) AC-4 由 3 格擴大為 30 格**（10 列 × 3 分頁，與第八節 S7-b 同範圍，**引用而非另抄一份**——雙份會漂移；加「不接受抽測幾格其餘推定相同」條款，理由用 `044` 那張七列測試表只有兩欄真正受保護的分布式假通過；連帶把 S7-c 舊引言「AC-4／AC-5 依原文各自成立即可」降為歷史框並明寫前提已消失）；**(2) 新增 AC-7 與第八節 S7-d**，收進 review cycle 3 標為 Deferred risk 的殘留缺口——以**責任編輯**身分驗 B 類六欄**必須可改**（6 欄 × 3 分頁 ＝ 18 格，A1 位置引用 S7-b 表第 4-9 列），排在 S7-b／S7-c 之後、S8 之前（S8 之後沒有任何檢查抓得到；此刻六欄全留白，寫入再還原不動已核可列），含不符處置四步與比照 S7-b 第 3 點的還原要求；**(3) 🔴 放行**——`040` Out of scope 後半句「並由 captain 確認」由 captain 2026-09-25 親自確認並選定**選項 A**，第十一節／第十二節／「相依二」三處各記裁決者、日期、選定選項與授權來源，原句全部保留，**未改寫 `040` 的票**。**本輪最要緊的發現：票內「captain 正在 S7」是未查證的轉述，實際 runbook 一步都還沒開始。**（⚠️ **本行內的欄數與 sha256 皆為 2026-09-25T17:50Z 的讀數，是該輪的歷史記錄，不是現況**——此後 captain 已完成 S1／S2／S3，見 Cycle 7。要現況請跑第十六節的兩條指令，不要引用本行的輸出。） implement 跑了兩條可否證的指令（留在第十六節）：第五節標題列解析器原樣重跑、`diff` 對基準 JSON **無輸出**，欄數仍 10／12／5（`owl comment` 仍含半形空格 ⇒ S1 未做；無 `chapter`／`approved_by` ⇒ S2 未做）；AC-6 唯讀 sandbox 跑 main 的 sync exit 0、40 筆／16 筆、sha256 仍 `4d1992e3…cea3b`／`4071978a…3162`、grep 判準印 ⛔（⇒ S4 未做）。**兩條缺一不可**——階段一是安全的，做完 S1／S2 後 main 仍 exit 0 且 sha256 不變，所以第二條單獨證不了 S1／S2 有沒有做。**FO 先前只跑了第二條就轉述「captain 正在 S7」，這正是第九節判準三的形狀，而傳遞鏈的第二環仍是 FO。** 未越界（基準 `b8e2233`，全部自行量測）：S7-b 的 30 格表 743 B、S7-b 角色分堆表 480 B、S7 的 12 範圍表 292 B、S3 4844 B、S8 759 B、AC-1 731 B／AC-2 697 B／AC-3 1479 B／AC-5 393 B／AC-6 2701 B、verify 五輪與 review 四輪共九個報告區塊，皆**逐位元組未動**；承重數字 24 欄／18／21／12／59 列／40 筆／16 筆／12 個保護範圍／6 段只增不減、無值被替換；`src/`／`scripts/` 零變動、`src/data/*.json` sha256 未變、040 worktree 乾淨且 HEAD 仍 `a51b5d9`。**留給 captain 的一件事：S7-d 第 1 點的責任編輯帳號 repo 內查不到，且兩份文件互相不符**（`_archive/044-…:767`「已開放給多位學者」⟷ `docs/health-check/TODO.md` 的 **`### P3-1`**「權限皆為 owner 一人」（⚠️ 本行原寫 `TODO.md:876`，**是錯的行號**——`:876` 是 P3-9；正確為 P3-1，本 branch `:789`／main `:879`。`TODO.md` 的 `status: plan` 會持續被編輯、行號會漂，故一律引項目編號。此即 K16，FO 自行更正）），**只有 captain 打開正式表的共用對話框才答得出來**（⚠️ **captain 已於 2026-09-25 查看並回報**：六人有編輯權限、三人檢視、責任編輯在名單內、044 第二帳號不在名單內。即 `044:767` 成立、`TODO.md` P3-1 與正式表現況不符。見 Cycle 7）；走借用 `044` 第二帳號那條路時 **AC-7 只證明機制成立、不證明實際責任編輯已在名單內**，日後指派責任編輯要重跑那 18 格。
- Cycle 7: REVISE — review cycle 5 判 **REJECTED**（reviewer 原分類：**K14–K18 Material、K19–K21 Polish**）；captain 授權**八筆全 fix**，外加一項**斷根**要求（captain 原話「修」，回應 FO 建議「票內不再斷言『部署做到哪裡』——改成時戳，或只留指令不留輸出」）；implement cycle 10（`3d91b13`）交付；surface 1 檔；**對正式試算表零寫入**（僅兩次唯讀讀取）。**斷根先於逐筆**：規則寫進第十七節開頭並在第十六節開頭複述（操作者實際會讀到的位置）；第十六節由「現況**實測**」改寫為「現況**怎麼查**」——兩條指令原樣保留、**當時的輸出全部移除**、改附一張不會過期的判讀表；design stage 的 ⚠️ 框同樣移除欄數與 sha256 的逐字輸出；需要留結果的地方改為**時戳寫進標題並明說它會過期**。**兩筆修的是判準本身，不是描述判準的句子**：**K20** 舊版 `bad=[k for k in d if b.get(k)!=d[k]]` 只走 S7-d 已有的欄，漏掉的欄根本不進迴圈，所以「漏一欄」時印 `⛔ 不相符: []`——**有 ⛔ 卻沒有名字**；加入 `missing`／`extra` 兩個集合後三種突變實跑全部指名（A1 打錯 → `['review_fingerprint']`；S7-b 表被改 → `['approved_fingerprint']`；漏一列 → `S7-d 漏列: ['reject_reason']` 且格數變 15）。**K21** 第 5 點改為鑑別診斷：真成因兩件（B 類允許名單沒有該帳號、**A 類或 C 類範圍蓋到那六欄**——後者是 reviewer 指出的漏列），另兩件標 ⛔ 並明寫它們會讓 S7-d **反而通過**、該由 AC-4 的 30 格抓；重測範圍由「B 類／第 4-9 格」放大為「B／A／C 任一類／第 1-9 格」。由此收出一句可帶走的判準：**AC-4 抓「保護不足」、AC-7 抓「保護過頭」，那六欄兩邊都過才算設對。** **K16 的根因比 reviewer 指出的更廣**：不只是行號寫錯——`TODO.md` 的 `status: plan` 持續被編輯，**行號會漂**（同一個 P3-1 證據行，本 branch `:789`／main 已是 `:879`，兩邊檔案 sha256 不同，implement 自行比對），故修法是改引**項目編號**並附兩個 revision，符合 `AGENTS.md` 既有規則，S7-d 第 1 點另加可重跑的 `grep -n '^### P3-1'`。⚠️ **【FO 自行更正，2026-09-25T19:05Z】以下「captain 共用名單」這一族，在 `3d91b13` 裡一行都沒有。本行原本把它敘述為**已交付**，那是錯的——正確是**已授權、交付待補**。**
- Cycle 8: REVISE — review cycle 6 判 **REJECTED**（`55e573d`，補述 `17b885a`；reviewer 原分類：**K22 Material（阻擋項）、K23／K24 Polish、K25 Deferred risk**），另有 **K26 Material** 為 FO 自報、reviewer 查核四項證據全部成立；captain 授權**四筆全 fix**，外加兩筆 captain 裁決入票與 B-1 的一列解凍；implement cycle 11（`458c730`）交付；surface 1 檔；**對正式試算表零寫入**（本輪一次唯讀讀取）。基準以列舉型指令取得：`git log --oneline ad07a26..HEAD` → `458c730`，HEAD ＝ `458c730`，`git status --short` 為空。**K22 的教訓比它修掉的兩句話重要，且由 implement 自述**：「上一輪我把 captain 的斷根規則寫進第十六節與第十七節，而那兩節都是處置節——**我掃的是『我改過的地方』，不是『規則該管的地方』**。」處置順序因此倒過來：**先把 🔒 規則框複述到 `## 部署 runbook`（操作節）與 `## Documentation impact`（交付節）**，並把 reviewer 收出的判準逐字入框——「**斷根規則寫在處置節裡，擋不住操作節與交付節。規則要放在『會被讀到的那一節』，而不是放在『記錄它的那一節』。**」——**再**依斷根 (b) 修那兩句：`:2998` 的交付判準改為「runbook 與 AC 已寫完」（**單調**）、`:3000` 的理由句改以「部署完成與否」為判準而非「開始了沒有」，原句均保留；**`TODO.md` P3-7 那一列的到期狀態已更正**（條件「步驟 1 完成後」＝「`chapter` 欄建好」，S2 已建，屬**單調事實**故依規則不標時戳，附可重跑的 `grep -c 'chapter'`），**但本票不代為執行該追記**。另依指示自行掃全票，再揪出**三筆同形狀**（票首摘要行、證據 2 的階段 A 標籤、第十七節追加的「尚未執行」），**並寫明該掃描法擋不住的三件事**（只認五個標記詞、第二階段靠人工、掃不到「寫下時就是假的」那一種）。**K23 是本輪規則的第一次自我適用，而它推翻了自己的前提**：implement 先跑清點再寫結論，發現以 `\d+量詞` 正規式清點得**三種**下降（`15 個` 30→29、`5 欄` 6→5、`6 格` 1→0），reviewer 以純子字串計數得**兩種**——**下降的種數取決於怎麼數，所以這種句子必須連方法一起寫**，修法不是換一個數字。三種全部查到來源（兩行被 K14 授權移除的過期讀數＋一段被 K20 取代的舊腳本輸出），**承重值未回歸**（`15 個窗口內欄位` 仍在 S4 條文，5→7 處） ⚠️ **【FO 更正，2026-09-25T19:35Z，原句依慣例保留。本筆即 review cycle 7 的 L1，錯誤源頭是 FO 照抄 implement 的自報而未自行清點】** 「5→7 處」**兩個端點都不是我宣稱的那一對**。我自己跑 `for c in 1646f0e 3d91b13 ad07a26 HEAD; do git show $c:<票檔> | grep -c '15 個窗口內欄位'; done` 的逐字輸出：**`1646f0e`=6、`3d91b13`=5、`ad07a26`=7、`HEAD`=16**。所以「5→7」實際是 `3d91b13`→`ad07a26`，**不是** `1646f0e`→HEAD。**更要緊的是方向**：cycle 10 真正改動的那個窗口（`1646f0e`→`3d91b13`）該值是 **6→5，下降**——**我卻拿一組上升的數字去證明「沒有回歸」。** **結論本身仍然成立**（該承重值在四個版本裡都存在，未被移除），**但我引用的證據不支持它**。**成因（FO 自述）**：我把 implement 報告裡的數字原樣轉寫進本行，**沒有自己跑一次**——這正是 reviewer 在 cycle 7 收出的那句：**判準三真正的缺口不在「寫的人沒查」，在「轉寫的人預設上游查過」。****本次更正前，上列指令已先跑過再落筆。**。同節「掃描命中 43 行」亦當場改掉，**因為那個總行數本身就是非單調的**（處置後實跑為 57）。**K24** 收尾改指向 ⚠️ 保留註記的**取回條件**並補「走正常那條路時不做這一步」。**K25** 重測範圍由第 1-9 格補到**第 1-10 格**——**第 10 格是最該重測的那一格**，因為本點的觸發條件正是可能讓內容欄被涵蓋、使它由「可改」翻成「擋」的動作，而其結果來自 S7-c、補設後不會自動重跑；**分類維持 Deferred risk 未升未降**，promote 條件逐字採用 reviewer 寫法。**captain 兩筆裁決依「接受風險、非消除風險」的強度入票**：**A-1**（不通知六位編輯者）記於 S2 的 ✅ 框，明寫依據是 captain 對編輯台近期行為的判斷、**repo 內無從驗證、亦非已觀察到的保證**、**不得寫成「那三欄不會被寫入」**，升級條件（「任何人」）與 `Deferred risk` 分類皆不變，FO 絆線讀數標明為歷史讀數，並寫出後果——**現在只剩偵測，沒有預防**；**A-2**（部署順序不改）記於第十七節追加，理由「為尚未觀察到的風險變更已驗證程序，代價大於風險」。**B-1**（S3 分辨表把那三個內容欄放錯邊）依 implement 自己 cycle 10 的分類建議處置，**FO 僅就那一列解除逐位元組凍結**：第一列排除那三個內容欄，表下補一列相反處置（停住、清空、確認 sha256 回到綁定值），原句保留、分類未升級；**implement 另指出 A-1 與 B-1 方向相反——不通知編輯者使「有人填值」的可能性不降反升，而 B-1 修的正是「填了值之後會不會被誤判成合法」，故 B-1 因此更要緊而非更不要緊。****B-2／K26 未由 worker 碰**——由 FO 於 `ad07a26` 自行更正，且依 reviewer 判定**更正歸類**：K26 屬第十六節 🔒 框的**第一種**子形狀（**寫下時就是假的**），非 K14／K22 的第二種（寫下時為真、被讀到時已假）；**時戳治得了第二種，治不了第一種**。成因（FO 自述）：**以確認型指令回答了列舉型問題**——查 `3d91b13` 查到「沒有」就停手，未查 HEAD、未查自己 commit 的父節點。**FO 自我約束規則改採 reviewer 的收緊版**（FO 原版經評為「四次只擋兩次半」，三個缺口：只蓋 `### Feedback Cycles` 而未蓋會被 worker 逐字抄進票內的**授權封包**、「附上輸出」與 captain 斷根要求正面衝突、「附上」不強制「先跑」），逐字寫進兩份 🔒 框；**本輪的授權封包與本行即為第一次實踐**。未越界（基準 `ad07a26`，implement 自行量測）：verify 五輪與 review 六輪共十一個報告區塊、S7-b 的 30 格表 743 B、S7 的 12 範圍表 292 B、S8 759 B、S7-d 的 18 格表 466 B、AC-1／2／3／5／6、AC-7、AC-4 條文本體 2112 B、`### Feedback Cycles` 25814 B，**皆逐位元組未動**；**S3 另做逐列比對**——分辨表第 2、3 列與表前表後四段全未動，**整個 S3 內被取代的既有行剛好 1 行，就是 FO 指名解凍的那一列**；承重數字只增不減；未改寫 `040` 的票、`src/`／`scripts/` 零變動。**留給 FO／captain 一件事：`TODO.md` 的 P3-7 追記義務已到期，本票記明到期狀態但不代為執行（改 `TODO.md` 不在本票交付範圍），須決定由誰去做。**
- Cycle 9: PASSED-with-findings — review cycle 7 判 **PASSED**（`87f6b80`），FO 授權的低成本定點修正輪（**非退回輪，無 rejection，故本輪不發 `gate record --round`**）；reviewer 原分類 **L1／L2／L3 Polish、L4 升報**，另 **L5 Polish** 為 FO 提報；implement cycle 12（`8901df9`）交付；surface 1 檔；**對正式試算表零讀零寫——本輪一次 HTTP 請求都沒發出**（captain 正在執行 S4、窗口已開，所需資料全部取自 git 物件）。**L3 是本輪重點，而它的問題不是漏了兩節，是那份覆蓋清單無法被否證**：cycle 11 列的四節全對，但它只列了「加過框的節」——沒有判準、沒有分母、沒有排除清單，**所以沒有任何方式能看出它漏了什麼**，reviewer 一跑就看出全票 11 個 live `##` 節只有 2 節帶 🔒 框。處置：判準寫成**三條閱讀路徑**（P1 操作／P2 交付／P3 驗收），每條各給讀者、用途與**一個機器可查的代理特徵**；**逐節判定全部 11 節、一個未略過**，六個排除節各附理由；清單來源附一行可重跑的 `grep`，implement 逐字跑過、印出的 11 節與表格同序同名。缺口補上**第八節「校正後的步驟 1-7」**（另加一句「這一節是 captain 實際照著做的那一節」）與 **`## Risk evidence`**。**implement 自陳的可帶走判準**：**一份無法被否證的清單，和一個沒查過的數量詞，失敗方式相同——這是第九節判準三的另一面。** **L1 不只是兩個端點錯，是舉證方向反了**：逐版清點（七個版本全部釘死 SHA，與 FO 的輸出逐字相同）`1646f0e=6`／`3d91b13=5`／`ad07a26=7`／`458c730=11`／`2f1d87e=12`／`87f6b80=16`／`7d109ce=16`——原句拿一組**上升**的數字（`3d91b13`→`ad07a26`）去證一件發生在**下降**窗口（`1646f0e`→`3d91b13`，6→5）裡的事；**結論仍成立但舉證錯誤**，改以「S4 條文那一行七版逐字相同」為證，並附第二條可重跑指令。附帶重跑確認 reviewer 查出的「`12 欄` 從未由 17 降為 16」——**39 個版本、下降次數 0**，而那個數字**傳了三輪、經過兩個角色，沒有人跑過**。**L2** 「處置前 43 行」憑印象，對兩個釘死 SHA 各跑一次得 `ad07a26`＝**42**、`458c730`＝**57**，原數字保留。**L5 是同一家族的第五個變種，而它落在 reviewer 自己身上**：review cycle 7 以「HEAD」當量測標籤，量測時 HEAD ＝ `2f1d87e`（該值確為 12），報告提交成 `87f6b80` 的那一刻同一標籤指向 16——**沒有人數錯，錯的是標籤，`HEAD` 寫下的瞬間就開始過期**。規則因此加一條並入四份 🔒 框：**引用版本一律釘 SHA，不得使用 `HEAD`／`main` 等移動引用**；界線一併寫明——`main`／`HEAD` 出現在**指令**裡沒問題（只要把解析出的 SHA 一併印在旁），不可以的是拿它當**量測標籤**。implement **未改 reviewer 的報告**（review cycle 7 區塊列為逐位元組不得動），只改自己寫的兩處。**FO 本輪的兩筆裁定**：(1) **L4 `hold`**——`TODO.md` P3-7 的追記義務已到期，屬範圍決定，**FO 不代 captain 指定執行者**，已升報 captain；(2) **`## Acceptance criteria` 的 🔒 缺口 `decline`**——它落在 P3 閱讀路徑上，但該節在本輪授權中列為全段逐位元組不得動而 implement **正確地未越界**；FO 評估其當前重量不足以另開一輪：AC-1／2／3／5／6 的條文為單調句型，AC-4／AC-7 的 `前置` 欄兩句已由 S7-b／S7-d 的 ✅ 框接住，**且該節依第 5 條只有 captain 能改，為加一個規則框而動它，代價大於收益**。缺口已寫在票內，promote 條件：若日後 AC 條文出現任何非單調敘述，即重開。未越界（基準 `7d109ce`，implement 自行量測）：**verify 五輪與 review 七輪共十二個報告區塊**、S7-b 的 30 格表 743 B、S7-b 角色分堆表 480 B、S7 的 12 範圍表 292 B、**S3 整段 6730 B（本輪未再解凍任何一列）**、S8 759 B、S7-d 的 18 格表 466 B、**`## Acceptance criteria` 全段 13187 B**、`## 元件與資料需求` 771 B、`### Feedback Cycles` 33036 B，**皆逐位元組未動**；**承重數字九項本輪無一項增減**；未改寫 `040` 的票。
- Cycle 10: PASSED-with-findings — review cycle 8 判 **PASSED**（`0f30a84`，四筆全為 **Polish**，無一阻擋）；**FO 裁定本輪為本票 ticket-side 的最後一輪定點修正並將收斂規則入票**；implement cycle 13（`8936b4e`）交付；surface 1 檔；**對正式試算表零讀零寫——本輪一次 HTTP 請求都沒發出**（captain 正在執行 S4、窗口已開，所需資料全部取自 git 物件）。**FO 收斂裁定的三項理由**：runbook 的可執行內容已連續多輪驗證乾淨、十二個受保護區塊逐位元組未動；最近四輪發現全為 Polish，操作重量遞減；captain 正開著窗口，**票的邊際整潔度不值得再換更多輪次**。**規則本體已寫進第十九節（依指示未新增章節）**：之後再出現 Polish 級發現一律記錄為「**已知並接受**」不再修，**唯一重開條件是出現 Material——依 `## Review-finding disposition` 的四欄證據全部成立，四欄缺一就不重開**；並寫明它**怎麼被否證**（四欄全中卻沒重開、或四欄沒全中卻重開了，都是違反），以及它**不禁止記錄**——**停的是修，不是看見**。implement 記下為什麼這條規則必須寫進票內：**一個沒有寫下判準的決定，下一輪就會被重新爭論一次；口頭說「這是最後一輪」，不會擋住第十四輪。** **本輪最值得記的是 `## Out of scope`**：reviewer 拿票內第十八節自己寫的否證測試去掃，**第一次掃就不一致**——該節的 `### design stage 追加的 Out of scope` 逐字載有「升級為 Material 的條件：有人在部署後改動三個分頁上任何一個標題字串」，**那是本節自己下的風險判定，正是 P3 的代理特徵**，而覆蓋表第 11 列判它「不要」。**它不是「可能會過期」的節，它已經過期過一次**——同子節的「這個條件現在就在觸發範圍內」已過期，其下那則 ⚠️ 更正框正是為它寫的。處置：補進 P3、加節層級 🔒 框、分母 5→6，原判與原理由逐字保留；並收出一句——**「不做什麼是單調的」這句話本身沒錯，錯的是把它當成整節的性質**：該節同時載有範圍記錄（單調）與風險升級條件（非單調），**後者決定它要不要框**。**第二筆是把一步沒寫出來的判斷寫出來**：第五欄叫「機器可查的代理特徵」卻沒分「**提及**」與「**承載**」，reviewer 原樣寫成正規式去掃會多打中 `## 元件與資料需求`（`步驟 9`／`AC-1` 皆為交叉引用）與 `## 相依關係釐清`（`| 條件 | 狀態 |` 表為 P2 特徵）——**結論全對，但字面掃不出來**。處置：定義「承載 ＝ 本節自己就是那樣東西的出處；提及 ＝ 只是指向別節」，三條判準全部**收緊**為只認承載（P1／P3 只認行首格式、P2 要求同列另有指派欄、P3 要求 `**AC-N　` 的全形空格條文格式），新增第六欄逐條說明為何這樣寫才排除得掉提及；**implement 另自補一條 cycle 12 與 reviewer 都沒寫的**：**掃描前必須先剝掉 🔒 框——不剝，一節會因為已經有框而被判成需要框，測試變成循環論證、永遠通過**。**否證測試由 implement 自票內逐字抽出重跑，11 節逐節相符、一個例外都沒有。** reviewer 的判準一併入票：**沒寫出來的那一步，就是重跑不會一致的地方。** **三筆殘留**：(1) 第二階段正文的「43 行」改為 42——**那是正文不是保留原句，所以它不是引用錯誤，它就是錯誤**，形狀為**同一個數字、同一節，上一輪只改了一半**（改了被指名的那一處，沒掃同節的同一個值）；(2) cycle 11 原表的「四節全對」亦不對——**第十六、十七節都是處置節，不在任何一條路徑上，本來就不需要框**，原表把兩個多餘的框算成覆蓋成績；那兩個框留著不刪但**不是正式規則框**（措辭較早、無 L5 的 SHA 條），**以六份正式框為準**並附可重跑計數，收一句：**規則只有一套，框有兩種年份**；(3) AC 缺口框補上 FO 於 Cycle 9 的 **`decline`** 裁定、理由、現狀評估與 **promote 條件（若日後 AC 條文出現任何非單調敘述，即重開）**，原問句保留，並寫明**這個缺口是「已知並接受」不是「待辦」**——它仍列在覆蓋表第 8 列標 ⛔，**因為判準沒有放過它，放過它的是裁定**。**量測慣例差已由 implement 主動寫明**（B 值含區塊尾端換行，reviewer 採不含，故各少 1 B；兩邊對「有沒有變動」的結論相同，是慣例差不是出入）。未越界（基準 `0f30a84`，implement 自行量測）：**verify 五輪與 review 八輪共十三個報告區塊**、S7-b 的 30 格表 743 B、角色分堆表 480 B、S7 的 12 範圍表 292 B、**S3 整段 6730 B**、S8 759 B、S7-d 的 18 格表 466 B、**`## Acceptance criteria` 全段 13187 B**、`### Feedback Cycles` 37402 B，**皆逐位元組未動**；承重數字九項完全不變；**未新增章節、未開新的掃描維度、未擴大任何判準**——第五欄三條全部是收緊，沒有一條放寬。**L4 仍在 hold**（`TODO.md` P3-7 的追記義務已到期，須指定執行者，本票不代為執行），**FO 已升報 captain，待其窗口結束後裁定。**
- Cycle 11: PASSED — review cycle 9（`bc629c7`）判 **PASSED**，**本票 ticket-side 收口**。**這一輪是 Cycle 10 新立的收斂規則的第一次實測，而它擋住了**：四筆發現全為 **Polish**，reviewer 逐筆對過 `## Review-finding disposition` 的四欄證據、**傷害欄皆不成立**，依規則**記錄為「已知並接受」、不修、不重開**——規則寫明「停的是修，不是看見」，本行即為那個「看見」。**否證測試這次是真的通過**：reviewer 依第五欄**另寫一份獨立實作**（其 `strip_lock` 比票內更嚴），再把票內那段 python 逐字抽出執行，**獨立實作／票內實作 × 剝框／不剝框四種組合輸出逐字相同**——11 節、6 要，與覆蓋表第 4／5／6／8／10／11 列同一組；`## Out of scope` 的 P3 來自 `:3894` 的升級條件，**剝掉新框後仍判 1**，分母 6 正確。43→42 改對且同節無殘留（重跑 `ad07a26`＝42、`458c730`＝57）。五份正式 🔒 框逐位元組相同（各 2573 B、sha256 `43a70351fd61b6cb`，位於 `:60`／`:176`／`:900`／`:3690`／`:3819`）。AC 的 `decline` 與 FO 於 Cycle 9 的四項逐項相符；收斂規則的重開條件唯一且明寫違反樣態。未越界：十三個報告區塊、**`## 部署 runbook` 整段 19454 B**（S1–S9、S3、S7、S7-b、S7-d、S8 全在其內）、**`## Acceptance criteria` 13186 B**、`### Feedback Cycles` 37401 B 逐位元組未動；第五欄 **11／11 皆為收緊、無一放寬**；`TODO.md` 零變動。**四筆已知並接受的 Polish（不修，供後人知其存在）**：**M1**（`:3280`）「已寫進全部**四份** 🔒 框」——本輪加到第五份而數字未跟著改，**與 43→42 同一形狀**；**M2**（`:3051`）「**六份**正式框逐位元組相同」——實際五份，而下一行的 grep 註解自己寫「5 次」；**M3**（`:2888`）「不剝框測試會變成循環論證」**重現不出來**——reviewer 對 13 段 🔒 逐段判定 P1／P2／P3 全為 0，剝與不剝輸出逐字相同，**真正的自我引用是第五欄的 `**不得…**` 命中它自己那一處，但該節另有八個獨立觸發，判定不受影響**（即該防範措施本身沒錯，只是在本票內並非承重）；**M4**（`:3040`）「第十六節與第十七節**都**不在任何路徑上」——第十七節對，**第十六節不對**（含兩個 ```bash 區塊，P1＝1；cycle 11 原表自己就標它「兼指令出處」）。**四筆的共同形狀值得與判準三並列**：M1／M2 是數量詞未隨改動更新、M4 是「都」這個全稱量詞未逐項查、M3 是一個沒被實測就寫下的機制宣稱——**全部落在「寫下時未跑可否證的檢查」這一族**，而它們出現在票內論述這一族最完整的那一輪。**gate 尚未 prepare**：本票六項 AC 全部要求部署已完成，而 captain 此刻正在執行 S4（`Track 1_history` 已達 18 欄，`Track 2_discussion` 與 `site_tldr` 未建），**AC 證據尚不存在**；FO 裁定待 S9 完成後再 prepare 並呈交 captain——**核准本 gate 即 runbook 的「步驟 9 合併 040」**，提早呈交會要求 captain 裁決一件證據尚未產生的事。**L4 仍在 hold**（`TODO.md` P3-7 的追記義務已到期，須指定執行者），FO 已升報 captain，待其部署窗口結束後裁定。
- Cycle 12: FINDING（部署執行中發現，Material，已觀察到的損害）— **分頁名稱從未被量測過。** captain 於 2026-09-25 執行 S5（`Review → 安裝／更新公式`）時，`Track 1_history` 與 `Track 2_discussion` 成功，第三個分頁跳出 `這個分頁不支援核可公式。`。成因：`approval-workflow.gs:159`（`a51b5d9`）以分頁名稱逐字比對 `'site_tldr'`，而正式表該分頁的實際名稱是 **`Site_TLDR`**（captain 口頭回報原名，改名前記錄）。票內寫 `site_tldr` 的地方很多，**沒有一處是量出來的**；`sync-content.mjs` 以 CSV URL 的 `gid=310949254` 讀取、完全不查分頁名稱（`grep -c "getSheetByName\|SpreadsheetApp" scripts/sync-content.mjs` ＝ 0），FO 的標題列解析器所印的分頁名也是寫死的標籤，**因此在 S5 之前沒有任何檢查能否證這個名稱**。**處置**：captain 將分頁改名為 `site_tldr` 後重跑 S5 成功。改名安全性：gid 不隨改名變動，sync 讀取路徑不受影響。S6 驗證（FO 唯讀讀取三個 CSV，2026-09-25 約 20:3xZ）：三分頁共 89 列 `status` 全為 `Needs review`、`current_fingerprint` 全數有值、無 `#NAME?`／`#FINGERPRINT!`。**待補的 runbook 註記（captain 2026-09-25 指示）**：**runbook 在 S5 之前必須先確認三個分頁名稱逐字為 `Track 1_history`、`Track 2_discussion`、`site_tldr`（大小寫、底線、空格皆須相同），不符者先改名再進 S5**；理由：分頁名稱只有 `.gs` 會檢查，而 `.gs` 要到 S5 才第一次在正式表上執行。此註記尚未寫進 `## 部署 runbook` 本文（本文修改依寫入權限須經 worker），先記於此。**FO 自承**：先前多輪審查與 FO 的標題列檢查都只驗了欄位，沒有驗分頁名稱；FO 的解析器以寫死的標籤列印分頁名，看起來像量測，實際沒有量到。
- Cycle 13: REOPEN（依 Cycle 10 收斂規則，兩筆 Material）— implement cycle 14（`fff8465`，報告 `a115c5a`）；surface 1 檔，`git diff --stat b05efba a115c5a` ＝ +55／−2；對正式試算表零讀零寫。**N1** 分頁名稱：S5 之前新增「確認三個分頁名稱」一步，步驟 4 錯誤對照補記 2026-09-25 實際發生的 `Site_TLDR`（來源：captain 口頭回報）。**N2** S7-a 與步驟 6 矛盾（FO 於 2026-09-28 查證）：原 S7-a 要求每個範圍都選「只有你」，而步驟 6 規定 B 類審核欄為「只有責任編輯」（Review 選單以執行者身分寫入）；改寫為 A／C 類「只有你」、B 類「自訂 → 只勾責任編輯」，「不可選顯示警告」置於首句，原句保留於更正框。本輪發生在部署窗口中（S1–S6 已完成，S7 未開始）；FO 於 `2026-09-28T21:31Z` 唯讀複查三分頁 18／21／12 欄、留白內容欄與審核欄全空、無任何列被核可。不發 `gate record --round`（非 gate 退回輪）。
>
> ⚠️⚠️ **【FO 二次更正，2026-09-25T19:10Z。上面那句「交付待補」也是錯的，原句依慣例保留】** 寫下上面那個更正框時，交付**已經在樹裡**。列舉型指令的輸出：`git log --oneline 3d91b13..HEAD` 列出 `118f474`（implement 的追加交付）與 `e8dd0c1`（FO 的 Cycle 7）；`git rev-parse cfd1794^` ＝ `118f474`；提交時刻 `118f474` 為 `11:50:51-07:00`、`cfd1794` 為 `11:51:43-07:00`，**交付早 52 秒，且是該更正框自身 commit 的父節點**。**正確敘述：共用名單那一族已於 `118f474` 交付。** 此筆記為 **K26（Material）**，reviewer 於 `17b885a` 查核四項證據全部成立。**歸類依 reviewer 判定更正**：K26 屬第十六節 🔒 框的**第一種**子形狀（**寫下時就是假的**），非 K14／K22 的第二種（寫下時為真、被讀到時已假）——**時戳治得了第二種，治不了第一種**，一句寫下時就假的話補上時戳只會變成一句有時戳的假話。**成因（FO 自述）**：以確認型指令 `git show 3d91b13 | grep` 回答了一個列舉型問題——查到「`3d91b13` 裡沒有」（那是真的）就停手，未查 HEAD、未查自己 commit 的父節點。** 成因是 FO 的流程錯誤：implement 已在 `3d91b13` 送出涵蓋 K14–K21 的完成訊號之後，FO 才以兩則 ad-hoc 訊息追加這一族授權，破壞了本輪的原子性，又在交付落地前就寫下本行並把 050 推進 review。reviewer（cycle 6）因此被擋住並主動停審——**該筆攔截由 reviewer 提出，不是 FO 自己發現的**。其交付 SHA 待 implement 回報後補記。**這是 FO 在本票內第三次犯下第九節判準三的同一形狀**（前兩次為 K18 的縮寫錯誤、Cycle 6 行內的兩處過期宣稱），且本次形狀更重：前兩次錯的是描述更正的句子，這次錯的是**宣稱某件事已經交付**。原句依本票慣例保留於下，讀時請視為「本輪已授權」而非「本輪已交付」。** ⟶ **captain 於 2026-09-25 親自查看共用對話框**，解決本票自 design stage 起就開著的帳號前置：**六人有編輯權限、三人檢視、責任編輯在名單內、`044` 第二帳號不在名單內**；因此 `_archive/044-…:767`「已開放給多位學者」**成立**、`TODO.md` P3-1「權限皆為 owner 一人」**與正式表現況不符**，S7-d 由兩條路**收斂為一條**（AC-7 驗的是真實責任編輯，不是打折的「只證明機制成立」），「先保護，後邀請」維持原寫法，S7-b 的 30 格預期值全部成立並補上可否證的推廣理由（保護範圍是**允許名單**機制，名單外一律擋，故一個名單外帳號測出的「擋」對其餘名單外編輯者同樣成立——**其否證條件正是 S7-a**：模式若誤設為「顯示警告」則此推廣不成立）。**另記一筆本票原本沒有的事實**：正式表目前有六個編輯者而保護範圍要到 S7 才設，故 `chapter`／`owl_depth_comment`／`full_content` 三個必須全欄留白的內容欄，在階段一至 S7 期間**對六人全部可寫**——票內原措辭只點名責任編輯，涵蓋面不足，已依實際人數修正並保留原句。**FO 自承兩筆**：**K18 的錯誤源頭是 FO**——上一輪授權封包把 artifact rev 縮寫成 `…dbae3`（正確 `sha256:324d436a…283bae3`），implement 依指示逐字保留，於是被原樣複製五處；**Cycle 6 那一行內的「runbook 一步都還沒開始」與 `TODO.md:876` 亦為 FO 所寫**，implement 依本票慣例不代 FO 補寫，已由 FO 自行加註更正框（原句保留、標明為該輪歷史讀數而非現況）。未越界（基準 `1646f0e`，全部自行量測）：verify 五輪與 review **五輪**共十個報告區塊、S7-b 的 30 格表 743 B、S7 的 12 範圍表、S3、S8、AC-1／AC-2／AC-3／AC-5／AC-6、**AC-7 2468 B**、**S7-d 的 18 格表 466 B**、**AC-4 條文本體 2112 B**，皆**逐位元組未動**；承重數字逐一清點只增不減（唯一下降的「12 欄」由 17 降為 16 出現在 design stage ⚠️ 框，是被 K14 授權移除的**當下欄數讀數**，非承重數字——承重的 `site_tldr` 12 欄兩處都在）；未改寫 `040` 的票、`src/`／`scripts/` 零變動。

## Out of scope

> 🔒 **本票的寫作規則（captain 2026-09-25 親自授權，全票適用，不限節次）**
>
> **票內不得斷言「部署現在做到哪裡」這種會自己過期的事實。** 需要記錄現況時二擇一：
> **(a)** 明寫 UTC 量測時戳並寫明那是歷史讀數，或
> **(b)** **只留可重跑的指令，不留當時的輸出**。
> **指令永遠為真，輸出十分鐘後可能就假了。**
>
> **單調／非單調判準**：「**已完成 X**」單調、不會過期，不必標時戳；
> 會翻面的是「**仍是**」「**尚未**」「**待補**」「**還沒**」「**目前仍**」。
>
> **引用版本一律釘 SHA，不得使用 `HEAD`、`main` 等移動引用**——
> **移動引用是非單調的，寫下的瞬間就開始過期。**
> （`main`／`HEAD` 出現在**指令**裡沒問題，只要把它解析出來的 SHA 一併印在旁邊；
> 不可以的是拿它當**量測標籤**，例如「某值在 HEAD 是 12」。）
>
> **這條規則為什麼出現在這一節**（reviewer cycle 6 收出的判準，逐字寫進票內）：
>
> > **斷根規則寫在處置節裡，擋不住操作節與交付節。**
> > **規則要放在「會被讀到的那一節」，而不是放在「記錄它的那一節」。**
>
> 第一次入票時規則只寫在第十六節與第十七節（兩節都是**處置節**），
> `## Documentation impact` 因此完全沒被掃到，同一形狀第三次復發。
> **覆蓋清單與掃描方式見第十八節。**
>
> ---
>
> 🔒 **同一條規則的上游版本：寫授權封包與 `### Feedback Cycles` 的人也受約束**
> （FO 提出，經 reviewer cycle 6 收緊後採用；逐字寫在這裡是因為
> **worker 會把授權封包的字逐字抄進票內**——K18 就是這樣被放大成五處的）。
>
> > 在**授權封包**與 **`### Feedback Cycles`** 寫下任何**非單調**狀態宣稱或數量詞之前，
> > **先跑一條列舉型指令，再依輸出寫結論**；票內**只留那一行指令**；
> > 需要留結果時**同時標 UTC 時戳並寫明是歷史讀數**；
> > **凡逐字轉寫的值（hash、行號、SHA、數量），封包送出前各自回讀一次。**
>
> **「列舉型」是關鍵字。** K26 的成因是**以確認型指令回答了列舉型問題**——
> 用 `git show <SHA> | grep` 查到「那個 commit 裡沒有」（那是真的）就停手，
> 沒有跑 `git log --oneline <SHA>..HEAD` 去列出後來發生了什麼。
> **確認型指令只能證實你已經想到的事；列舉型指令會告訴你還有什麼。**

不改 feature 040 的程式（已完成）。不處理標題列與整列刪除的保護範圍（另議）。不處理 HTML 淨化（042）與刪列門檻（043）。

> **⚠️ 「整列刪除的保護」目前尚無票，負責人未定。** 原句寫「（另議）」，
> 而「另議」沒有指向任何票。（原句把標題列與整列刪除綁在一起，但只有後者被擱下——見本框末段。）
>
> **它不是 `043`。** `043` 做的是**同步端**的刪列跌幅偵測——列已經被刪掉之後，
> 同步程式察覺筆數掉太多而中止。這裡缺的是**試算表端**的保護範圍——讓那一列一開始就刪不掉。
> **兩者機制不同、時機不同，`043` 補不上這一格**，何況 043 自己 `status: design`、
> 尚未決定是否進行（見「已知未解」的 ⚠️ 更正）。
>
> **本票目前的替代防線是偵測而不是預防**：S3 的檢查①②與 S9 會抓到列不見了，
> 但抓到的時候列已經不見了，要靠 Google 試算表的版本記錄救回。
> **另外，上面那句把兩件事綁在一起，但本票只擱下其中一件。**
> **標題列的保護本票有做**：步驟 6 的 C 類、S7 的 `A1:R1`／`A1:U1`／`A1:L1`、AC-5 都涵蓋它。
> **沒做的是整列刪除的保護**，Google 試算表沒有直接對應的設定。
> 所以「尚無票、負責人未定」只適用於**整列刪除**這一半。原句保留。

### design stage 追加的 Out of scope

- **不修 `approval-workflow.gs` 缺別名表的問題。** 證據 1 顯示 Apps Script 對標題的容忍度比同步程式低。
  本票用「改試算表標題」繞過（步驟 2），成本一格。改程式要重跑 040 的 review 與 verify，代價大得多。
  **⚠️ 這個落差目前尚無票，負責人未定。** 原句寫「這個落差要記成後續票」，
  但那句話本身是一個沒有被執行的指令——至今沒有任何 feature 票處理它。

  **現況不壞，不要誤讀**：本票第三節與第四節已實測，
  照票內建議輸入的 18／21／12 個標題字串（含中文說明）
  **同時通過 `resolveApprovalHeaders_` 與 040 新版同步**，輸出與純欄名版本逐字相同。
  **所以 captain 現在照票輸入的這批標題是安全的。**
  （2026-09-25 註：這句話的「現在」是指「**照票輸入的那一刻**」，不預設已經輸入，
  也不斷言現在輸入到哪裡——見本項目符號下方的 ⚠️ 更正與第十六節的兩條指令。）

  **風險在之後**：`approval-workflow.gs` 沒有別名表（`approval-workflow.gs:127-144`，
  釘在 commit `a51b5d9`），它只接受「標題等於欄名」或「標題以欄名加分隔符開頭」，
  而 `scripts/sync-content.mjs` 有別名表。兩支程式對同一份標題列的容忍度不同。

  **升級為 Material 的條件：有人在部署後改動三個分頁上任何一個標題字串。**
  那一刻 Apps Script 可能開始無聲失效，而同步程式仍然通過，兩邊不會互相提醒。
  這個條件**現在就在觸發範圍內**——captain 正在建欄與輸入標題。

  > ⚠️ **2026-09-25 更正：「captain 正在建欄與輸入標題」在寫下的當時就是未查證的轉述。原句保留。**
  >
  > **這一段的實質判斷不變**：升級為 Material 的條件仍然是「**有人改動三個分頁上任何一個標題字串**」。
  > 改的只是「現在是否已在觸發範圍內」這句**會自己過期的現況敘述**。
  >
  > 🔒 **本框刻意不寫「現在做到哪裡」。** 依 captain 2026-09-25 的斷根要求
  > （見第十七節），本票不得斷言部署進度——**要知道現況，跑第十六節的兩條指令**。
  >
  > **這個條件什麼時候算進入觸發範圍**：S1 或 S2 開始改動標題字串的那一刻起。
  > 第十六節的判讀表說得出**怎麼查它有沒有發生**：指令一的 `diff` 會印出被改動的那一行。
  >
  > ⚠️ **本框第一版（2026-09-25 較早）寫了「runbook 一步都還沒開始執行」並附逐字輸出，
  > 那句話在 review 讀到它之前就已經過期。** 那正是這條斷根要求的由來，詳見第十七節 K14。
- **不廢除 `chapter` 欄。** 見 `TODO.md` 的 P3-7。本票反而新建了它。
- **不執行 044。** 044 是獨立的票，有自己的資源前置。
  （2026-09-24 註：044 已於 2026-09-21 完成並 PASSED，已歸檔。原句保留。
  本票仍然不執行 044——現在的理由是它做完了，不是它還沒開始。）

## Stage Report: design

- DONE: 產出 captain 可以直接照著做的部署 runbook：八個審核欄位的確切欄名（以 `scripts/sync-content.mjs` 的 `APPROVAL_COLUMNS` 為唯一依據，不得引用文件轉述）、Apps Script 公式與 Review 選單的安裝步驟、既有 40 筆逐列重新核可的順序與範圍、以及保護範圍要涵蓋哪些欄位。每一步都要寫明由誰執行。
  「部署 runbook」步驟 0-9，每步標 `captain` 或 `工程`；欄名逐字取自 040 worktree `scripts/sync-content.mjs:84-93`；保護範圍分 A/B/C 三類，B 類對應 `approval-workflow.gs:12-14` 的 `WRITABLE_REVIEW_FIELDS`；重新核可範圍算出 59 列（Track 1 40／Track 2 15／site_tldr 4）。
- DONE: 補齊 acceptance criteria，每一項都要有可失敗的 `Verified by:`。
  AC-1 至 AC-6。AC-1 綁定部署前實測 sha256（`4d1992e3…cea3b`／`4071978a…3162`）；AC-2 綁定筆數字串 40／16；AC-3 的 id 比對指令實測會真的印出差異（餵 1 筆 fixture，正確列出少掉的 39 個 `h*` 與 14 個 `d*`）；AC-4／AC-5 為兩帳號人工測試；AC-6 讓停擺窗口變成可觀測事實。
- DONE: 釐清並在票內明確記錄兩項相依。
  「相依關係釐清（design stage）」。相依一判定本票不依賴 `operations.md`、改為自帶 runbook（`git ls-tree main docs/content-pipeline/` 只有兩個檔）；相依二判定 `## 相依關係` 第二個項目符號的「不互為前置」為錯，並附三項外部證據，同時標記 🔴 需 captain 裁決並給出 A/B/C 三個選項。
- DONE: Documentation impact 三分類，每節列出文件或寫「無」。
  「現在更新」僅本票並說明為何不動 `docs/`；「實作後更新」六筆各附觸發條件；「不更新」五筆各附理由。
- DONE: 元件階層／響應行為／資料需求。
  本票無 UI 與程式變更，元件與響應兩項明寫「不適用」並說明理由；資料需求記明 schema 不變、八欄停在 SSOT 端不進 JSON。

### Summary

design stage 沒有接觸正式 SSOT，改以離線執行真正的程式碼取得四項證據，並全部寫進票內。
最重要的兩項是新發現：其一，`approval-workflow.gs` 沒有別名表，正式表現況的
`Track 1_history` 缺 `chapter`、`Track 2_discussion` 的 `owl comment` 用空格，兩者都會讓
「安裝／更新公式」直接報錯——這是照現有文件做一定會踩到的坑；其二，main 現行的同步程式
在「建好八個欄位」的當下就會中止（不是等到裝公式），所以產線停擺窗口比
`editor-onboarding.md:425-430` 的描述更早開始，B→D 必須一氣呵成。
runbook 裡每一段指令都實跑過，包含一個被淘汰的寫法：`node -e "await import(…)"`
會 exit 0 但什麼都不做，票內已明文標記不要用。
留下一項 🔴 需 captain 裁決：044 是否為本票步驟 4 起的硬前置。三項外部證據都指向「是」，
但 044 卡在「兩個 Google 帳號」這個人的前置，判定成立就會形成僵局，因此不由 worker 決定。

## Stage Report: implement

- DONE: 執行 050 runbook 步驟 0（唯讀），把三個分頁的真實標題列逐字貼進票內。注意 `--env-file` 必須寫在 `-e` 前面。**不得對正式試算表做任何寫入**，不得執行 `npm run sync-content`，`src/data/*.json` 零改動。
  第一節。票內指令照原樣跑過一次（`--env-file` 在前，環境變數有載入），輸出逐字貼上；另附完整 CSV 解析版指令與三個分頁的完整標題列 JSON。對外部系統只做三次 HTTP GET。`src/data/*.json` 前後 sha256 均為 `4d1992e3…cea3b`／`4071978a…3162`；三個 checkout 的 `git status` 無 `src/data/` 變動。
- DONE: 用真實標題列校正步驟 3 的欄位表（現況已有哪些欄、八個審核欄位哪幾個要新建、插在哪個位置），並確認票內兩項已知不符是否仍成立（`Track 1_history` 缺 `chapter`、`Track 2_discussion` 為 `owl comment` 空格、三分頁皆無 `reject_reason`）。比照證據 1 的手法、以**這次實測到的真實標題**重跑 `resolveApprovalHeaders_`，分別驗現況／套用步驟 1-2 後／再加八欄後的結果。
  第二至四節。三項已知不符全部成立。另查出兩項票內沒有的不符：`approved_by`／`approved_at` 三個分頁都不存在（票內記成已有）、`Track 2_discussion` 還缺 `owl_depth_comment` 與 `full_content`。`resolveApprovalHeaders_` 以實測標題重跑四個階段：現況三個分頁全 ⛔；套用步驟 1-2 後仍全 ⛔；再加七個審核欄後 Track 1／site_tldr ✅ 18／12 欄，**Track 2 仍 ⛔ `缺少欄位「owl_depth_comment」。`**。falsifying change：若 `APPROVAL_FIELDS['Track 2_discussion']` 不含那兩欄，階段 C 的 Track 2 就會通過而這項發現不成立。
- DONE: 量出產線全停窗口（步驟 3→7）的大小：三個分頁合計要手動建立幾欄、**逐列重新核可的實際列數**（實測，不沿用記錄中的 59）、步驟 6 要設幾個保護範圍。並重跑證據 3（空白 `chapter` 不改變同步輸出的 sha256 比對，2026-09-07 量測需複驗）與確認 `sync-content.mjs` 的 alias 表真的同時收 `owl comment` 與 `owl_comment`（實讀該表，不採信轉述）。runbook 若有任何一步現況下做不到或順序有誤，獨立列出。
  第五至八節。合計要建 24 欄（票內表算 17，少 7）；其中 **9 欄是安全前綴**（main 同步仍 exit 0 且輸出逐字不變），**窗口只涵蓋 15 欄**。逐列核可實測 59 列（40／15／4），與票內數字相符——票內從 JSON 筆數推算，本輪直接數試算表 `status` 欄。保護範圍實測 **12 個**（建議排序）／15 個（票內排序），A1 位置由 fixture 標題列算出。證據 3 複驗成立且範圍更大：六組 fixture 的兩份 JSON sha256 全部相同並等於 repo 現況。alias 表實讀 `git show main:scripts/sync-content.mjs` 第 112 行，`aliases: ['owl comment', 'owl_comment']` 兩種都收。runbook 缺陷 D1-D6 獨立列於第七節，其中 D1、D3 會讓照票執行必定失敗。
  falsifying change：把 `fixB2` 多加一個 `review_decision` 欄，main 同步就從 exit 0 變 exit 1，安全前綴的界線因此可被推翻；把 `fixD`／`fixS` 任一列的 `chapter` 填入非空值，040 同步的輸出 sha256 就會與 baseline 不同，證據 3 的結論隨之失效。

### Summary

本輪只做步驟 0，未對正式試算表寫入任何一格。步驟 0 本身查出票內指令有缺陷：
`split(/\r?\n/)[0]` 遇到標題格內的換行就截斷，Track 1 與 Track 2 的標題列都只印出一半，
`vibe`／`sticky` 完全看不到。改用完整 CSV 解析後才拿到基準。

兩項最重要的發現都會讓照票執行的部署失敗。其一，`Track 2_discussion` 缺
`owl_depth_comment` 與 `full_content`，票內 runbook 沒有這一步，做完步驟 1-3 後
「安裝／更新公式」在 Track 2 仍會報錯——證據 1 之所以顯示通過，是因為它餵的是
`design.md` 的設計意圖而非現況標題。其二，票內表把 `approved_by`／`approved_at`
記成已存在，實際三個分頁都沒有，要建的欄從 17 個變成 24 個。

窗口反而比票內估的小。實測有 9 欄的安全前綴可先建，main 同步照常 exit 0 且輸出逐字不變；
窗口只涵蓋 15 欄。核可列數 59 經實測確認，`editor-onboarding.md:434` 的「工作量比預估大」
指的是協調成本而非列數——窗口期間有 30 列草稿在編輯台手上。另量化了票內只定性描述的
Track 2 序號陷阱：15 個已核可列中只有第 4 列（`d3`）一列草稿夾在其中，其餘 27 列草稿都在後面，
所以風險點只有一個。

第八節的 S1-S9 已整份以 fixture `fixS` 實測：Apps Script 三個分頁全通過、040 同步 exit 0
且輸出與 baseline 逐字相同、main 同步 exit 1（窗口確實打開）、12 個保護範圍與 6 個核可連續段
都由程式算出。時間估算 75-120 分鐘是依動作次數推算，**不是量測的牆鐘時間**——
本輪沒有寫入試算表，無法量測 captain 在 Google UI 上的實際速度。

## verify stage 獨立複驗（2026-09-24）

本節是**獨立複驗**，不採信 implement 的任何 fixture 或結論。
自己抓標題列、自己建 fixture、自己跑兩支 sync、自己數列數。
指令與 fixture 全在 session 暫存目錄，未寫入 repo。

**未越界**：對正式試算表只做 3 次唯讀 HTTP GET（`status=200`，17704／10584／589 bytes），
零寫入、未建欄、未改標題、未裝 Apps Script、未設保護、未核可任何一列。
未執行 `npm run sync-content`。複驗前後 `src/data/*.json` 的 sha256 均為
`4d1992e3…cea3b`／`4071978a…3162`；主 checkout 與 040 worktree 的 `git status` 全程為空。
兩支 sync 都在暫存沙箱執行（main 版以 `git show main:` 取出後複製；040 版複製兩個檔並設
`CONTENT_OUTPUT_DIR`），未動 040 的 worktree。

### 一、最高風險宣稱：9 欄安全前綴 — **成立**

自建 fixture，main 版 sync 在暫存沙箱跑（沙箱手法與 AC-6 相同）。

**方向 (a)　9 欄全建後 main 同步 exit 0 且輸出逐字不變**

| 我的 fixture | 內容 | main 同步 | `history.json` | `discussions.json` |
|---|---|---|---|---|
| `fixRaw` | 今日抓下的原始位元組 | ✅ exit 0 | ✅ 逐字相同 | ✅ 逐字相同 |
| `fixA` | CSV round-trip，不加欄 | ✅ exit 0 | ✅ 逐字相同 | ✅ 逐字相同 |
| `fixRename` | 只做 S1 改名 | ✅ exit 0 | ✅ 逐字相同 | ✅ 逐字相同 |
| `fixSafe9` | **安全前綴 9 欄全建 ＋ 改名** | ✅ exit 0 | ✅ 逐字相同 | ✅ 逐字相同 |

「逐字」是**位元組比對**，不是筆數：`fixSafe9` 的兩份輸出與 repo 現況
`Buffer.equals` 為真（26057 bytes／11788 bytes）。

**方向 (b)　再多建任一窗口內欄位就 exit 1 — 15 欄全數驗過**

以 `fixSafe9` 為底，逐一多建**一**個窗口內欄位，共 15 組。**15 組全部 exit 1**，
錯誤一律是 `第 N 欄的標題「…」對不到任何預期欄位。`：

| 分頁 | 多建這一欄就中止 |
|---|---|
| `Track 1_history` | `review_decision`（第 15 欄）、`review_fingerprint`、`approved_fingerprint`、`current_fingerprint` |
| `Track 2_discussion` | 同上 4 欄（第 18 欄起） |
| `site_tldr` | 全部 7 欄（第 6 欄起）——**一欄都不安全** |

**界線正好在宣稱的位置**：不早也不晚。implement 自附的 falsifying change
（`fixB2` 多加一個 `review_decision` 由 exit 0 轉 exit 1）**已跑，確實轉為 exit 1**。

**9／15／24 三個數字不是手數的，是從原始碼推出來的。** 直接解析
`git show main:scripts/sync-content.mjs` 的 `TRACK_1_COLUMNS`／`TRACK_2_COLUMNS`／
`SITE_TLDR_COLUMNS`，與 040 的 `APPROVAL_COLUMNS`（8 欄，全為 `required`）、
`.gs` 的 `APPROVAL_FIELDS` 交集運算：

| 分頁 | 現況欄 | 要新建 | 安全前綴（main 認得） | 窗口內（main 不認得） | 建完 |
|---|---|---|---|---|---|
| `Track 1_history` | 10 | 8 | 4 | 4 | 18 |
| `Track 2_discussion` | 12 | 9 | 5 | 4 | 21 |
| `site_tldr` | 5 | 7 | 0 | 7 | 12 |
| **合計** | | **24** ✅ | **9** ✅ | **15** ✅ | |

機制根因複讀確認：main 的 `SITE_TLDR_COLUMNS`（第 123-129 行）**完全沒有**
`approved_by`／`approved_at`／`reject_reason`，所以 `site_tldr` 的安全前綴是 0；
`TRACK_1_COLUMNS`／`TRACK_2_COLUMNS` 有這三欄（第 97-99、117-119 行，皆 `optional`），
且 main 也認得 `chapter`（第 94 行）、`owl_depth_comment`（第 113 行）、`full_content`（第 116 行）。

**獨立佐證**：把 24 欄全建的 fixture 餵給 main，它印出「**共 15 項錯誤**」——
錯誤項數自己等於窗口內欄數。

### 二、D1／D2／D3／D5 — **四項全部成立**

**D1 成立。** 用今日抓下的位元組跑票內原指令的 `split(/\r?\n/)[0]`，輸出逐字為：

```
Track 1: id(給系統看的編號),…,image_url（現有為AI生成）,"status
Track 2: id,category,title,author,year,link,abstract,views,status,"owl comment
site_tldr: order,label,text,status,link
```

**exit 0、無任何警告。「它不報錯，它少印」成立。** Track 2 的 `vibe` 與 `sticky`
完全不出現。`site_tldr` 不受影響（標題無換行）。
自寫 CSV 狀態機重解，得 10／12／5 欄，與 implement 貼的 JSON **逐字相同**。

**D2 成立。** 三個分頁的標題列中，八個審核欄位**只有 `status` 存在**；
`approved_by`、`approved_at`、`reject_reason` 三個分頁皆無。票內算 17 欄，實際 24 欄。

**D3 成立。** 以**我自己抓的標題列**、`node:vm` 載入 `.gs` 原始碼、stub 掉
`SpreadsheetApp`／`Session`／`Utilities` 後重跑 `resolveApprovalHeaders_`：

| 階段 | `Track 1_history` | `Track 2_discussion` | `site_tldr` |
|---|---|---|---|
| A　現況 | ⛔ `缺少欄位「chapter」。` | ⛔ `缺少欄位「owl_comment」。` | ⛔ `缺少欄位「review_decision」。` |
| B　套用票內步驟 1、2 | ⛔ `缺少欄位「review_decision」。` | ⛔ `缺少欄位「owl_depth_comment」。` | ⛔ 同 A |
| C　再加票內步驟 3 的七欄 | ✅ 18 欄 | ⛔ `缺少欄位「owl_depth_comment」。` | ✅ 12 欄 |
| D　Track 2 再補兩個內容欄 | — | ✅ 21 欄 | — |

**與 implement 的表逐格相同。照票內步驟 1-3 做完，步驟 4 在 Track 2 必定失敗。**
`captain` 若少建這兩欄，會在窗口內卡在「安裝／更新公式」。

**D5 成立，且比票內描述更精確。** 實際標題是
`owl comment` ＋ **LF（`\n`，不是 CRLF）** ＋ `(允鍾如果有靈感可以寫一句短評)`。
票內「改前」字串 `owl comment (允鍾…)`（空格接括號）**不出現在實際標題中**——
用「尋找並取代」搜它會找不到。改名後（`owl_comment` ＋ LF ＋ 括號）
`resolveApprovalHeaders_` 解析成功（上表階段 D），main 同步也照樣 exit 0 且輸出逐字不變
（另跑一組「不改名」fixture 亦 exit 0，證實 alias 兩種都收）。

### 三、數字 — **全部自行數出，全部相符**

**59 列（40／15／4）成立，我是第三個獨立來源。** 從我抓的 CSV 讀 `status` 欄，
以 Node `Map` 計數（未用 `sort`／`uniq`）：

| 分頁 | 非空白資料列 | `Approved` | 空白 |
|---|---|---|---|
| `Track 1_history` | 42 | **40** | 2（`h2` 第 3 列、`h28` 第 25 列）|
| `Track 2_discussion` | 43 | **15** | 28（`d3` 第 4 列、`d18`–`d44`）|
| `site_tldr` | 4 | **4** | 0 |
| **合計** | 89 | **59** | 30 |

第三來源交叉驗算：`history.json` 40 筆 ＋ `discussions.json` 16 筆去掉 `tldr` 得 15
＋ `site_tldr` 分頁 4 列 ＝ **59**。

**保護範圍 12／15 成立，A1 位置逐格相符。** 以 `WRITABLE_REVIEW_FIELDS`（實讀 `.gs`，
確為 6 欄）與 A 類兩欄的解析欄號算連續段：

| 排序 | `Track 1_history` | `Track 2_discussion` | `site_tldr` | 合計 |
|---|---|---|---|---|
| 建議排序 | J2:J、R2:R／L2:Q／A1:R1 ＝ 4 | I2:I、U2:U／O2:T／A1:U1 ＝ 4 | D2:D、L2:L／F2:K／A1:L1 ＝ 4 | **12** ✅ |
| 票內 `APPROVAL_COLUMNS` 排序 | 5 | 5 | 5 | **15** ✅ |

S7 表中的 12 個 A1 範圍**逐格與我算的相同**。另確認：S2／S4 的**分階段**建欄順序
與第三節「建議排序」雖然物理欄序不同，算出的保護範圍**完全一樣**，S7 的表對兩者都成立。

**Track 2 夾在已核可列中的草稿確實只有 1 列。** 依 `.gs` 第 79 行與
`sync-content.mjs:392` 的同語意實算序號（「任一發布欄位非空」的累計計數）：
15 個 `Approved` 列在第 2-17 列，序號分別是 `1,2,4,5,…,16`（範圍 1-16，缺 3）。
序號 3 由 `d3`（第 4 列，有發布內容）占用。
**第 2-17 列之間只有 `d3` 一列非 `Approved`**；其餘 27 列草稿（`d18`–`d44`）全在第 17 列之後。
**captain 的窗口內禁令是完整的：只有 `d3` 一個風險點。**

**6 個連續選取段成立。** 由 `status` 欄算出：`Track 1` 第 2 列／第 4-24 列（21）／
第 26-43 列（18）；`Track 2` 第 2-3 列（2）／第 5-17 列（13）；`site_tldr` 第 2-5 列（4）。
共 6 段、59 列，與 S8 的表逐格相同。

### 四、證據 3 與 alias 表 — **成立**

**六組 fixture 兩份 JSON sha256 全同且等於 repo 現況，成立。** 我自己跑了六組
（`fixRaw`／`fixA`／`fixRename`／`fixSafe9` 走 main；「建議排序」與「票內排序」的
24 欄完整部署 fixture 走 040），**六組的兩份輸出 sha256 全部是
`4d1992e3…cea3b` 與 `4071978a…3162`**。

完整部署 fixture 的 59 列指紋**由我自己算**（040 的 `fingerprintPublishedRow`，
Track 2 序號自行重算），040 新版 sync 全部接受並 exit 0，逐字印出
`✅ 檢查通過，已寫入 src/data/history.json（40 筆）` 與
`✅ 檢查通過，已寫入 src/data/discussions.json（16 筆，含 tldr）`。
**AC-1／AC-2 的驗收手法在真實資料上可執行。**

另建「S2／S4 實際建欄順序」的 fixture：040 sync exit 0、輸出逐字相同；
同一份餵 main 得 exit 1，首個錯誤指向 **第 15 欄 `review_decision`**——
與第八節的宣稱相符。

**否證測試（證明這些比對真的會失敗）：**

| 改動 | 結果 |
|---|---|
| `chapter` 填入非空值 | main 仍 exit 0，但 `history.json` 變成 `38e662f6…` ≠ baseline ✅ |
| `owl_depth_comment` 填入非空值 | main 仍 exit 0，但 `discussions.json` 變成 `6895ef6b…` ≠ baseline ✅ |

**「新欄全部留白」是承重條件，而且沒有任何程式會擋它** —— 填了值 main 照樣 exit 0，
只有 sha256 會不同。AC-1 已寫明這一點。

**alias 表實讀成立。** `git show main:scripts/sync-content.mjs` 第 112 行逐字為
`  { field: 'owl_comment', aliases: ['owl comment', 'owl_comment'], column: 'optional', value: 'optional' },`。

**其餘被引用的行號全部實讀核對通過**：`.gs` 第 5-6（`APPROVAL_FIELDS`）、
12-14（`WRITABLE_REVIEW_FIELDS`）、127-144（`resolveApprovalHeaders_`）、
159（`這個分頁不支援核可公式。`）、219（`不可核可標題列。`）、220（`Session.getActiveUser()`）；
040 `sync-content.mjs` 第 84-93（`APPROVAL_COLUMNS`）、392（`publishedRowSequences`）。
**唯一一筆對不上的是 `TODO.md:127`** —— 見下方 F3。

### 五、時間估算的誠實度 — **揭露足夠**

「75-120 分鐘是推算、非量測」在票內**三處**揭露，captain 不會誤讀成實測值：

1. 第六節「窗口時間估算」開頭粗體：「**這是依動作次數推算的估計值，不是實測的牆鐘時間。**
   本輪沒有對試算表做任何寫入，所以無法量測 captain 在 Google 試算表 UI 上的實際速度。」
2. 表格欄位標籤本身：「單位時間（**假設**）」，並註「captain 可自行替換」。
3. implement 的 Stage Report Summary 再次明寫。

**動作次數已逐項查證，全部正確**：窗口內 15 欄 ✅、保護範圍 12 個 ✅、
連續選取 6 段 ✅、核可 59 列 ✅、3 個分頁各執行一次「安裝／更新公式」＝3 次 ✅。
只有「單位時間」是假設，這一點標示清楚。

### 六、Placeholder scan（verify stage 指名輸出）

| 掃的字串 | `src/data/*.json` | 本輪新增的 540 行票內文字 |
|---|---|---|
| `某學者` | 0 | 0 |
| `某大學法律系` | 0 | 0 |
| `lorem ipsum`／`Lorem` | 0 | 0 |
| `test` | 0 | — |
| `placeholder`／`TODO`／`FIXME`／`XXX` | 0 | 0 |
| `example.com`／`sample` | 0 | — |
| `YOUR_`／`TBD`／`xxx` | — | 0 |

**另掃「試算表網址外洩」**（本票明令 URL 不得入票）：
`docs.google`／`spreadsheets/d/`／`/pub?`／`gviz`／`https://` 在新增內容中**均為 0 次**。✅
本輪未改動任何資料檔，`src/data/*.json` 逐位元組未變。

### 七、verify stage 的獨立發現

四項都不改變 captain 要輸入的任何欄名、欄數或列號；**24／9／15／59／12／6 全部正確**。

**F1（數字自相矛盾，非承重）第六節說刪 `d3` 會讓「其後 **14** 列」指紋全變，實算是 **13** 列。**
`d3` 在第 4 列（序號 3），其後的 `Approved` 列是第 5-17 列，共 **13** 列。
同一份文件的 S8 寫的是「第 5-17 列的指紋全變，那 **13** 列要重做」——**S8 正確，第六節的 14 錯。**
- 已釋出使用者與正常流程：captain 讀第六節理解 `d3` 風險。
- 可觀察到的損害：無行為差異——兩處的可執行指令都是「`d3` 不可刪除或搬移」。只是列數印錯。
- 影響的 AC 或不可協商邊界：無。
- 觸發證據：本節第三小節實算，`Approved` 序號 `1,2,4..16`，`d3` 占序號 3。
- 提議：**Polish**／任務內／`fix`（把 14 改成 13）。

**F2（會讓工程誤判驗收失敗）AC-6 要求逐字出現的錯誤字串，在照票建欄後不會出現。**
AC-6 寫「必須 exit 1 並輸出 `第 N 欄的標題「review_decision」對不到任何預期欄位。`」。
但票內建議的標題字串含中文說明，程式實際印的是
`第 15 欄的標題「review_decision （由 Review 選單寫入）」對不到任何預期欄位。`
——**引號內多了中文說明**。逐字比對或 `grep '「review_decision」'` 會找不到。
- 已釋出使用者與正常流程：工程在 S3／AC-6／步驟 9 前執行 sandbox 驗證。
- 可觀察到的損害：驗證「看起來失敗」而系統其實正常，或反過來被當成通過而不再細看。
  發生在窗口內，會吃掉 captain 的時間。
- 影響的 AC 或不可協商邊界：**AC-6 的 `Verified by:`**。
- 觸發證據：本節第一、四小節實跑，三個分頁 15 條錯誤全部是
  `「<欄名> （<中文說明>）」` 的形式；且欄號隨建欄順序變動（S2／S4 順序為第 15 欄，
  第三節「建議排序」為第 12 欄）。
- 提議：**Material**／任務內／`fix`（AC-6 改成比對 `對不到任何預期欄位` 與
  `review_decision` 兩個子串，不綁完整引號內容；欄號改寫成「依實際建欄順序」）。

**F3（引用行號錯）`TODO.md:127` 指不到東西。** 票內步驟 3 的表與第三節都寫
「`TODO.md:127` 記錄現況為 `order｜label｜text｜status｜link`」。
`TODO.md` 第 127 行是**空行**；該記錄實際在**第 156 行**
（原文用半形 `|`：`現行欄位為 order | label | text | status | link（已直接讀 SSOT 確認）`）。
- 已釋出使用者與正常流程：任何人想回溯 `site_tldr` 欄位記錄的來源。
- 可觀察到的損害：追不到出處。**記載的內容本身正確**（我直接讀 SSOT 得同樣 5 欄）。
- 影響的 AC 或不可協商邊界：無。
- 觸發證據：`sed -n '127p'` 為空；`sed -n '156p'` 為該句。
- 提議：**Polish**／任務內／`fix`（127 改 156）。

**F4（D4 自己帶出來的新缺口）AC-1 綁死一個 sha256，但 D4 把單一窗口改成跨日計畫，票內沒有 re-baseline 條文。**
D4 是對的、也是好消息，但它把部署從「一段 2 小時窗口」改成「階段一可分幾天 ＋ 階段二窗口」。
階段一要 captain 先建 `chapter`／`owl_depth_comment`／`full_content` **三個內容欄**，
而保護範圍要到階段二的 S7 才設——**這三欄在階段一期間是編輯台可寫的**。
我實測：把它們填入非空值，main 同步**仍 exit 0**，只有輸出 sha256 改變
（`38e662f6…`／`6895ef6b…`）。AC-1 綁的是 2026-09-07 量到的固定值。
- 已釋出使用者與正常流程：責任編輯在階段一期間照常使用試算表
  （`editor-onboarding.md:434` 明記「編輯權限已經開出去」）。
- 可觀察到的損害：S3 會攔下來（它同時檢查 exit 0 **與**兩個 sha256，這一關寫得很好），
  但票內只寫「這一關沒過就不要進階段二」，**沒寫沒過要怎麼辦**。
  若是編輯合法填入內容，正解是重新量 baseline 而不是永久停住；
  若在 S3 之後、窗口內才被填，AC-1 會在步驟 8 失敗，而 captain 會以為是部署弄壞了內容。
- 影響的 AC 或不可協商邊界：**AC-1**（逐字 sha256 比對）。
- 觸發證據：上方否證測試兩列；S7 在階段二才設保護；階段一明寫「產線照常，可分次做」。
  今日重量 baseline 仍為 `4d1992e3…cea3b`／`4071978a…3162`，**目前尚未發生漂移**。
- 提議：**Deferred risk**（觸發尚未發生）／任務內／`fix`：在 S2 補一句
  「這三個內容欄在 S9 完成前必須保持全欄留白」，並在 S3 補 re-baseline 條文
  （sha256 不符時，先確認是編輯合法填值還是部署副作用；若是前者，重新量並更新 AC-1 綁定值）。
  升級為 Material 的條件：任何人在階段一對這三欄或那 59 列的發布內容寫入任何值。

### 八、裁決

**PASSED。**

本輪要複驗的每一項承重宣稱都獨立成立：9 欄安全前綴（兩個方向都驗，15 個窗口欄逐一驗，
falsifying change 已跑）、D1／D2／D3／D5、24／9／15 欄、59 列、12／15 個保護範圍、
6 個連續段、只有 `d3` 一個序號風險點、證據 3 的六組 sha256、alias 表。
**captain 可以依這份校正結果操作正式試算表。**

四項發現沒有一項會讓 captain 輸入錯的欄名、建錯的欄數或核可錯的列。
F2 是唯一會在窗口內浪費時間的（工程端的驗收字串），F4 是 D4 帶出來的計畫缺口
而 S3 已經攔得住，只差「攔下來之後怎麼辦」。F1／F3 是印錯的數字與行號。

## Stage Report: verify

- DONE: 獨立複驗「9 欄安全前綴」——自建 fixture、自跑 main 現行版與 040 版兩支 sync，不採信 `fixB1`–`fixB4`。兩個方向都驗；跑 implement 自附的 falsifying change。
  **成立。** 方向 (a)：`fixSafe9`（9 欄全建＋改名）main 同步 exit 0，兩份輸出與 repo 現況**位元組完全相同**（`Buffer.equals` 為真，26057／11788 bytes），不是筆數相同。方向 (b)：以 `fixSafe9` 為底逐一多建**一**個窗口內欄位，**15 組全部 exit 1**——界線不早也不晚。falsifying change（多加一個 `review_decision`）已跑，確實由 exit 0 轉 exit 1。9／15／24 三個數字改由直接解析 main 的三張 `*_COLUMNS` 與 040 的 `APPROVAL_COLUMNS`、`.gs` 的 `APPROVAL_FIELDS` 推出，非手數；main 對 24 欄 fixture 印出「共 15 項錯誤」自成佐證。根因複讀確認：`SITE_TLDR_COLUMNS`（第 123-129 行）無 `approved_by`／`approved_at`／`reject_reason`，故 `site_tldr` 安全前綴為 0。
- DONE: 複驗 D1、D2、D3、D5，並以自己抓的標題列重跑 `resolveApprovalHeaders_`。
  **四項全部成立。** D1：跑原指令得 exit 0、無警告的截斷輸出，Track 2 的 `vibe`／`sticky` 完全不出現——「它不報錯，它少印」成立；自寫 CSV 狀態機重解得 10／12／5 欄，與 implement 貼的 JSON 逐字相同。D2：三個分頁八個審核欄位只有 `status` 存在，17→24 成立。D3：以 `node:vm` 載入 `.gs`、stub 掉 Google 全域物件、餵**我自己抓的標題**重跑，四個階段的結果與 implement 的表**逐格相同**——階段 C 的 Track 2 仍 ⛔ `缺少欄位「owl_depth_comment」。`，照票做完步驟 1-3 步驟 4 必定失敗。D5：實際是 `owl comment` ＋ **LF**（非 CRLF）＋ 括號；票內「改前」字串**不出現在實際標題中**，尋找取代確實會找不到。
- DONE: 自行數證 24／9／15 欄、59 列、12／15 個保護範圍、Track 2 只有 `d3` 一個風險點；複驗證據 3 與 alias 表。
  **全部相符。** 59 列自己數（讀 `status` 欄、Node `Map`、未用 `sort`／`uniq`）得 40／15／4，並以 repo JSON 產物（40＋15＋4）交叉驗算——我是第三個獨立來源。保護範圍以 `WRITABLE_REVIEW_FIELDS`（實讀確為 6 欄）算連續段，建議排序 12、票內排序 15，**S7 的 12 個 A1 範圍逐格相符**；另確認 S2／S4 的分階段欄序與第三節建議排序雖物理順序不同，保護範圍完全一樣。`d3`：依 `.gs:79`／`sync-content.mjs:392` 同語意實算序號，`Approved` 為 `1,2,4..16`，`d3` 占序號 3，第 2-17 列之間**只有它**一列非 `Approved`，其餘 27 列全在第 17 列之後——**窗口內禁令完整**。6 個連續段與 S8 逐格相同。證據 3：我自己跑六組 fixture，兩份輸出 sha256 全部等於 `4d1992e3…cea3b`／`4071978a…3162`；完整部署 fixture 的 59 列指紋由我自己用 `fingerprintPublishedRow` 算，040 sync 全部接受並逐字印出 `（40 筆）`／`（16 筆，含 tldr）`。alias 表第 112 行實讀逐字相符；其餘 8 處被引用的行號全部實讀通過。
  falsifying change：`chapter` 或 `owl_depth_comment` 填入非空值，main 仍 exit 0 但 sha256 變為 `38e662f6…`／`6895ef6b…`——證明這些比對真的會失敗，且「全部留白」是承重條件而無程式會擋它。
- DONE: 確認時間估算的揭露、動作次數可查，並確認未越界；未報告的同類問題獨立列出。
  時間估算在**三處**明確揭露為「依動作次數推算、非量測牆鐘」（第六節開頭粗體、表格欄標籤「單位時間（假設）」、Stage Report Summary），captain 不會誤讀成實測值。動作次數逐項查證全部正確：15 欄／12 範圍／6 段／59 列／3 次安裝公式。未越界：正式試算表**零寫入**（只有 3 次唯讀 GET），未跑 `sync-content`，`src/data/*.json` 前後 sha256 未變且 `git status` 全程為空，未動 040 worktree（兩支 sync 皆在暫存沙箱執行）。Placeholder scan 與「試算表網址外洩」掃描全部 0 次。獨立發現 F1-F4 列於第七節，各附四項證據欄位與提議分類。

### Summary

不採信 implement 的任何 fixture，全部自己重做：自己抓標題列、自己寫 CSV 狀態機、
自己建 fixture、自己在暫存沙箱跑 main 與 040 兩支 sync、自己數列數與序號。
**每一項承重宣稱都成立，captain 可以依這份校正結果操作正式試算表。**

最高風險的「9 欄安全前綴」驗得最細：不只驗「9 欄全建後 exit 0」，還逐一驗了 15 個窗口內欄位
——**每一欄單獨多建都會讓 main exit 1**，界線正好在宣稱的位置。而且「逐字相同」是
`Buffer.equals` 的位元組比對，不是筆數。9／15／24 改由原始碼推導而非手數，
main 自己對完整部署 fixture 印出「共 15 項錯誤」，項數等於窗口欄數。

D3 是對 captain 最要緊的一條，也確認了：照票內步驟 1-3 做完，Track 2 的「安裝／更新公式」
必定報 `缺少欄位「owl_depth_comment」。`。`d3` 的序號風險點確實只有一個，
所以窗口內禁令是完整的。59 列有三個獨立來源。

四項獨立發現都不影響 captain 要輸入的欄名／欄數／列號。最值得處理的是兩項：
**F2**——AC-6 要求逐字出現的錯誤字串，在照票用含中文說明的標題建欄後不會出現
（程式印的是 `「review_decision （由 Review 選單寫入）」`），工程會在窗口內誤判驗收失敗；
**F4**——D4 把單一窗口改成跨日計畫，而 AC-1 綁死一個 2026-09-07 的 sha256，
階段一要先建三個**編輯台可寫**的內容欄而保護要到階段二才設。S3 攔得住（它同時檢查
exit 0 與兩個 sha256），但票內沒寫攔下來之後怎麼辦。今日重量 baseline 未漂移。

## Stage Report: implement (cycle 2)

- DONE: F2（Material，最優先）AC-6 改為比對 `對不到任何預期欄位` 與 `review_decision` 兩個子串，不綁完整引號內容；欄號改寫成「依實際建欄順序」。屬 captain 一次性授權範圍：只改 `Verified by:` 怎麼認，不改 AC-6 的要求文字。
  AC-6 的 `Verified by:` 已改。sandbox 指令現在把輸出導到 `$SANDBOX/out.txt`，再以 `grep '對不到任何預期欄位' | grep -q 'review_decision'` 判定；票內同時逐字寫出程式實印的完整訊息，並明寫「不要逐字比對引號內的內容，也不要綁欄號」，附上兩個欄號值（S2／S4 排序第 15 欄、建議排序第 12 欄）。**AC-6 的標題與要求本身一字未動。** 另修同一項下一句原本寫「錯誤訊息與上面逐字相同」——那句在 AC-6 改寫後就對不上了（design stage 的 fixture 用純欄名標題），已改為說明兩者差在引號內的中文說明。
  獨立重測：架本機 HTTP server 供三個分頁 fixture（標題用建議值、S2／S4 排序），`git show main:scripts/sync-content.mjs` 複製到暫存沙箱執行，exit 1，逐字得 `第 15 欄的標題「review_decision （由 Review 選單寫入）」對不到任何預期欄位。檢查是否打錯字。`。`grep '「review_decision」'` 找不到它（F2 成立）；新判準認得它。另查出訊息實際結尾還有 `檢查是否打錯字。`（main `sync-content.mjs:294` 的樣板），已一併寫進票內。
- DONE: F4（Deferred risk，第二優先）S2 補「`chapter`／`owl_depth_comment`／`full_content` 三欄在 S9 完成前必須保持全欄留白」；S3 補 re-baseline 條文；把 promote-to-material 條件記進票內。
  S2 尾端加一段 ⚠️：三欄必須全欄留白、階段一期間它們是編輯台可寫的、沒有任何程式會擋填值（實測填值 main 仍 exit 0，只有 sha256 變成 `38e662f6…`／`6895ef6b…`）、要事先告知責任編輯。S3 加了三樣東西：兩個 `diff` 指令（原本只寫「比 sha256」，沒寫怎麼看出差在哪）、一張二分判定表（編輯合法填值 → 重新量 baseline 並更新 AC-1 綁定值、註明日期與原因；部署副作用 → 停住，不要重量），以及「重量 baseline 不等於放寬 AC-1」一句（判準不變，變的只是基準的量測時點；只有 captain 能改 AC 的要求）。promote-to-material 條件照 verify 原文記入：任何人在階段一對那三欄或那 59 列的發布內容寫入任何值。**F4 的修改全部落在 S2／S3，未碰 AC-1 的條文。**
  S3 新增的 `diff` 指令已實測指對地方：同一沙箱手法餵一份合法 fixture，main exit 0 並把兩個 JSON 寫進 `$SANDBOX/src/data/`（不是 repo），`ls` 確認。
- DONE: F1（Polish）第六節「其後 14 列」改 13；F3（Polish）`TODO.md:127` 改 156。
  第六節「Track 2 的序號暴露面」已改為「其後 13 列（第 5-17 列）的指紋全變」，與同文件 S8 的 13 一致。`TODO.md:127` 兩處載重引用（步驟 3 的表、第三節）已改為 `:156`；實讀確認第 127 行是空行、該記錄在第 156 行。verify 自己那兩處 `TODO.md:127`（它的第四節末與第七節 F3）刻意保留——那兩處在描述缺陷本身。
- DONE: 一併掃同類——票內所有「第 N 列／N 欄／N 筆」在多處出現時是否一致；所有 `檔名:行號` 是否真的指到宣稱內容。逐項列出檢查範圍與結果，未被點名的同類一併修並列出。
  第九節兩張表。**引用**：範圍擴到全票 31 個被引用位置（verify 只掃了 8 處）。四處指不到宣稱內容——`TODO.md:127`（即 F3）加上**三處本輪新查出的同類**：`editor-onboarding.md:430` 出現 4 次都是指「編輯權限已經開出去…工作量比原設計預估的大」，該句實際在第 **434** 行（第 430 行是順序那一句）；`040-…md:221` 指的 Out of scope 原句實際在第 **290** 行（第 221 行在三個 checkout 都是空行），已一併補全檔名；本票自我引用「第 50 行」實際是第 **53** 行。四處全部已修，兩處自我引用另補上章節錨點（`## 相依關係` 第二個項目符號、`## Risk evidence` 首句），讓它們不再隨票內插入內容漂移。其餘 27 處實讀通過，逐處列出宣稱內容與核對結果。
  **數字**：14 對 13 是唯一矛盾（即 F1）。其餘全部一致並附加總驗算：24＝8＋9＋7、9＝4＋5＋0、15＝4＋4＋7、9＋15＝24、17＝5＋5＋7、24－17＝7、18＝10＋8／21＝12＋9／12＝5＋7、59＝40＋15＋4、89＝42＋43＋4、30＝2＋28＋0、59＋30＝89、6 段＝3＋2＋1 且 1＋21＋18＋2＋13＋4＝59、12＝4＋4＋4、27 列＝第 18-44 列、540 行以 `git log --numstat 2e83adf` 核對為 `540 0`。`review_decision` 的欄號在票內有 12／15／18／6 四個值，實為排序差異而非矛盾，已在表中說明並在 AC-6 明寫不要綁欄號。「三處與現況不符」與 D1-D6 也不是矛盾：D4 是估算過大、D6 是漏說明，兩者不屬於「與現況不符」。
  falsifying change：把 AC-6 新判準的第二段 `grep` 換成 `grep -q '「review_decision」'`，同一份實測輸出就會判失敗——證明新舊判準真的不同，且新判準不是放寬成「永遠通過」（把輸入換成一份沒有標題錯誤的合法 fixture 輸出，新判準同樣判失敗）。

### Summary

四筆 finding 全部按 FO 授權修完，改動全部在票內文字，**未對正式試算表寫入或讀取任何一格**。

F2 是最優先的一筆，因為它發生在窗口內。AC-6 原本要求工程逐字看到
`第 N 欄的標題「review_decision」對不到任何預期欄位。`，但照票用含中文說明的標題建欄後，
程式實印的是 `「review_decision （由 Review 選單寫入）」`——引號內多了說明，逐字比對找不到。
現在判準改成「同一行同時含兩個子串」，並把 `grep` 直接寫進 sandbox 指令，
欄號不再綁定。**AC-6 的要求文字一字未動**，改的只是怎麼認出那一行。
這一串字串本輪自己重跑 main 的同步重測過，新舊判準的差異已用反向改動證明。

F4 補的是「攔下來之後怎麼辦」。S2 現在明寫三個內容欄必須全欄留白，
並說明沒有任何程式會擋填值；S3 加了 `diff` 指令、二分判定表與 re-baseline 條文，
並說清楚重量 baseline 不是放寬 AC-1——判準不變，變的是基準的量測時點，
而改 AC 的要求仍然只有 captain 能做。

F1／F3 是同一類：引用寫下之後沒有再被驗證。把整票掃過一遍，
除了 verify 點名的 `TODO.md:127`，又查出**三處同類**：`editor-onboarding.md:430`
（出現 4 次，該句其實在第 434 行）、`040-…md:221`（其實在第 290 行）、
本票自我引用「第 50 行」（其實是第 53 行）。四處全修，兩處自我引用另外補了章節錨點，
讓它們不再隨著票內插入內容漂移。數字方面，14 對 13 是唯一的矛盾；
其餘每一組都附上加總驗算，verify 已確認的 24／9／15／59／12／6 全部原值保留。

## verify stage 第二輪：F1-F4 修正複驗（2026-09-24）

**本輪只驗那四筆修正，不重驗已確認過的承重數字**——只確認它們沒被動到。
**本輪對正式試算表零存取**：沿用第一輪抓下的 CSV 快照（sha256 與第一輪相同，
`6e16b1cb…`／`1c3fc28d…`／`a68602c4…`），沒有發出任何新的 HTTP 請求。
diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。

### 一、F2 —— 修好了，而且沒有被放寬成「永遠通過」

自己架 fixture、把 `git show main:scripts/sync-content.mjs` 複製到暫存沙箱跑，取得真實輸出。
程式實印的那一行逐字為：

```
第 15 欄的標題「review_decision （由 Review 選單寫入）」對不到任何預期欄位。檢查是否打錯字。
```

**與票內寫進 AC-6 的字串逐字相同**，包含結尾的 `檢查是否打錯字。`。
該樣板確認在 `git show main:scripts/sync-content.mjs` 第 294 行：
`addError(errors, group, '標題', \`第 ${i + 1} 欄的標題「${trunc(raw)}」對不到任何預期欄位。檢查是否打錯字。\`);`

四格判準測試（新判準逐字取自票內 AC-6 的 `grep`）：

| 輸入 | 新判準 | 舊逐字判準 `「review_decision」` |
|---|---|---|
| 窗口已打開（24 欄全建，main exit 1） | ✅ 認得 | ⛔ 找不到 ← **F2 原本的病灶** |
| **合法 fixture（安全前綴 9 欄，main exit 0，無標題錯誤）** | **⛔ 判失敗** | ⛔ 找不到 |

**下面那一格是關鍵，它通過了**：把一份沒有標題錯誤的合法輸出餵進去，
新判準**同樣判失敗**。新判準不是被放寬成恆真，它仍然會拒絕。

implement 自附的否證 (a) 也跑了：把第二段 `grep` 換回 `'「review_decision」'`，
同一份真實輸出立刻判失敗——證明新舊判準確實不同。

**另補一個我自己的否證**：新判準只在 `exit 1` **且** `grep` 印 ✅ 時才算通過。
若是抓取失敗之類的其他錯誤，同樣 exit 1 但 `grep` 會印 ⛔，兩段合起來才判得準。
票內兩個條件都寫了。

**AC-6 的要求文字一字未動，已逐區塊比對確認。** 把 `## Acceptance criteria` 整段
從我上一輪的 commit 與現在各抽出來 diff：

- **AC-1／AC-2／AC-3／AC-4／AC-5 逐字未動**（`diff -q` 無差異）。
- AC-6 只有兩處變動：`Verified by:` 那一則，以及「這個 sandbox 手法 design stage 已實測」
  那一則的末句。後者原本寫「錯誤訊息與上面逐字相同」，在 AC-6 改寫後就變成假的
  （design stage 的 fixture 用純欄名標題），**這是必要的連帶修正，implement 也已揭露**。
- AC-6 的標題、「會怎麼失敗」、「這一項的用意」三處**均未出現在 diff 中**。

### 二、F4 —— 「攔下來之後怎麼辦」寫完整了，那張表真的分得出來

**S3 新增的指令指對地方，我逐字照跑了一次。** 用票內 AC-6 的 sandbox 手法
（`mktemp -d` 真的建一個 `$SANDBOX`），env 指向本機 fixture：

```
exit=0
$SANDBOX/src/data/ → discussions.json (11788 bytes)、history.json (26057 bytes)
repo 的 git status → 空（repo 未被碰到）
shasum → 4d1992e3…cea3b / 4071978a…3162
diff（兩行）→ 皆無輸出
```

**main 確實把兩個 JSON 寫進 `$SANDBOX/src/data/` 而不是 repo，`ls` 與 `git status` 兩面確認。**

**那張二分判定表不是裝飾品。** 我用三個真實情境測它，三個落在不同格子，訊號差距很大：

| 情境 | main exit | `diff` 實際長什麼樣 | 表判到哪 |
|---|---|---|---|
| A　編輯在 `chapter` 填了「第一章　前言」 | 0 | **只有 1 行**：`"chapter": "" → "chapter": "第一章　前言"`，欄名就寫在 diff 裡 | 第 1 列 → 重新量 baseline ✅ |
| B　部署時誤刪一列已核可的列（`h1`） | 0 | **318 行**，首行即 `"id": "h1" → "id": "h4"`，整份往上位移 | 見下方 G3 |
| C　部署時欄名打錯（`aproved_by`） | **1** | 兩個 JSON 都未產生 | 第 2 列首句「exit 1」→ 停住 ✅ |

情境 A 的 diff 直接把欄名印出來，「只落在那三個內容欄」是肉眼可判的，不是空話。

**AC-1 的條文完全未動**（上面第一節已逐字確認），
**F4 的修改全部落在 S2／S3**——cycle 2 的 15 行刪改中，沒有一行屬於 AC-1。
「重量 baseline 不等於放寬 AC-1」這句成立：判準（部署前後逐字相同）確實沒變，
變的只是「部署前」的量測時點。

### 三、F1／F3 與那一類：**我把 31 處全查完了，不是抽樣**

**三處新查出的同類，我自己複驗，全部成立：**

| 引用 | 原行號指到什麼 | 更正後行號指到什麼 |
|---|---|---|
| `editor-onboarding.md` 430→**434** | 430 是「正確順序是：試算表建欄 → 裝公式 → …」 | 434 是「**現在編輯權限已經開出去，這一輪重新核可的工作量比原設計預估的大。**」✅ |
| `040-…md` 221→**290** | 221 是**空行** | 290 是「…不上線正式 SSOT 設定，直到隔離測試表完成驗證並由 captain 確認。」✅ |
| 本票 50→**53** | 50 是**空行** | 53 是「`no spike needed` 不成立，但 spike 的形式是在隔離測試表上先跑一次（即 feature 044）。」✅ |
| `TODO.md` 127→**156**（F3） | 127 是**空行** | 156 是「現行欄位為 `order \| label \| text \| status \| link`（已直接讀 SSOT 確認）」✅ |

本票「第 45 行」現在仍正確（實讀為 `- **feature 044**…兩者不互為前置。`）。

**其餘 27 處我沒有抽樣，逐一實讀查完。26 處通過，查出第 5 處錯——見下方 G1。**
通過的包含：`editor-onboarding.md` 的 58／104／110／261／344-345／425-430（428 與 430 兩句都在區間內）、
`2026-08-31-content-pipeline.md:174`（`（9 欄）` 逐字在該行）、
`operations.md:12` 與「隔離表部署」第 15-25 行（第 26 行確為空白、第 27 行確為下一節 `## 核可與拒絕`）、
`design.md` 第二節（第 135 行 `## 二、試算表要長怎樣`）第 4 點（逐字為「找不到就中止，並指名是哪個標題看不懂」）、
以及 `.gs` 的 5／6／12-14／76-80／79／127-144／159／219／220 與 main／040 `sync-content.mjs` 的
84-93／94／97-99／112／113／116／117-119／123-129／392（這一批第一輪已實讀，本輪未變動）。

**殘留的 12 處 `TODO.md:127` 我逐處看過，全部是在描述這個缺陷本身**
（F1-F4 處置表、第九節的複核表、我第一輪的第四節與 F3、兩份 stage report），
**沒有任何一處仍被當成 `site_tldr` 欄位記錄的出處**。implement 的說法成立。

#### 自我引用補章節錨點：**是部分改善，不是修好**

行號 45 與 53 **仍然寫在文字裡**，往後只要在它們上方插入任何內容就會再次失準——
錨點並沒有讓數字停止漂移，它讓漂移**可復原**：讀者發現行號對不上時，
還能靠 `## 相依關係 第二個項目符號`／`## Risk evidence 首句` 找到目標。
真正不會漂移的寫法是**只留錨點、不留行號**。
`TODO.md` 的 `P3-7` 就是正確示範：票內三處（第 161、1170、1196 行）都以**名稱**引用，
不帶行號，所以 G1 那個錯行號沒有傷到任何一處載重引用。

### 四、數字：六組全部原值保留

不重驗，只確認沒被動到。**用 cycle 2 的刪除行當證據**（共 15 行刪改），
逐行看過：12 行是引用行號修正或 `status` 欄位，2 行是 AC-6 的 `Verified by:`，
**只有 1 行含承重數字**——就是 F1 要改的那一行。

| 數字 | 現行值 | 狀態 |
|---|---|---|
| 合計 24 欄（8＋9＋7） | 第 493 行 `**合計要手動建立 24 欄**（8＋9＋7）` | ✅ 未動 |
| 安全前綴 9／窗口內 15 | 第 631、634 行 | ✅ 未動 |
| 59 列（40／15／4） | 第 692、848 行 | ✅ 未動 |
| 保護範圍 12／15 | 第 514 行「從 15 個降到 12 個」 | ✅ 未動 |
| 6 段連續選取 | 第 692、848 行 | ✅ 未動 |
| `d3` 單一風險點（第 4 列）、其餘 27 列 | 第 661、662 行 | ✅ 未動 |

**S7（12 個保護範圍）與 S8（6 段、59 列）整個區塊逐字未動**（`diff -q` 無差異，30 行）。

**F1 改對了**：第 661 行現為「刪掉它，其後 **13 列（第 5-17 列）**的指紋全變」，
與我第一輪實算的結果（`d3` 占序號 3，其後的 `Approved` 列為第 5-17 列共 13 列）**逐字相符**。
「其後 14 列」只殘留在兩處 meta 描述（F1 處置表、stage report），那是應該保留的。

**`review_decision` 四個欄號確為排序差異，不是矛盾。** 我自己在兩輪中把四個值都跑出來過：

| 值 | 來自哪個排序／分頁 | 我在哪一輪實測 |
|---|---|---|
| 第 12 欄 | 第三節「建議排序」的 `Track 1_history` | 第一輪 |
| 第 15 欄 | S2／S4 分階段排序的 `Track 1_history` | 兩輪都測到 |
| 第 18 欄 | S2／S4 排序的 `Track 2_discussion` | 本輪 |
| 第 6 欄 | `site_tldr`（兩種排序皆同，因為它沒有安全前綴） | 兩輪都測到 |

AC-6 現在明寫「**不要逐字比對引號內的內容，也不要綁欄號**」並列出其中兩個值，
判準本身也不含欄號——**足以讓 captain 與工程不被這四個值困惑**。

### 五、本輪的新發現

**G1（Polish）`TODO.md` P3-7 的行號錯，而且它在第九節的複核表裡被標成 ✅。**
第九節寫「| `TODO.md` P3-7 | `chapter` 欄位設計已被放棄 | ✅ 標題在第 **865** 行，存在 |」。
實讀：`### P3-7　chapter 欄位設計已被放棄` 在 **第 905 行**；
第 865 行是 **P3-4 的第 2 點**「`opposing_views` 攤平成 `Track 2_opposing` 分頁」，與 `chapter` 無關。
- 已釋出使用者與正常流程：任何人依第九節的表覆核引用（FO、captain、下一輪 worker）。
- 可觀察到的損害：**實質宣稱是對的**——P3-7 存在，內容確實是「`chapter` 設計已被放棄」；
  錯的只是當作證據的那個行號。照 865 去看會看到不相干的 `opposing_views`，
  可能誤以為 P3-7 不存在。**票內三處對 P3-7 的載重引用（第 161、1170、1196 行）都以名稱引用、不帶行號，所以沒有任何載重引用被打壞。**
- 影響的 AC 或不可協商邊界：無。`chapter` 的存廢本票明列為 Out of scope。
- 觸發證據：`grep -n 'P3-7' TODO.md` → `905:### P3-7　chapter 欄位設計已被放棄`；
  `sed -n '865p'` → `  2. **opposing_views 攤平成 Track 2_opposing 分頁** …`。
- 提議：**Polish**／任務內／`fix`（865 改 905）。**這是 31 列中唯一一列錯的**——我全查完了，不是抽樣。

**G2（Polish）「31 處」是一種引用寫法的快照，不是票內位置引用的全集。**
我自己重新抽取全票的引用並與那 31 列比對：**掃描當下存在的 `檔名:行號` 形式，一處都沒漏**。
但有兩個範圍外的缺口，兩者我都實讀過、**內容都是對的**：
- `sync-content.mjs:294`（F2 訊息樣板）是 **cycle 2 自己這一輪新增的引用**，加在掃描之後，不在表中。實讀第 294 行確為該 `addError` 樣板 ✅。
- `檔名 第 N 條／第 N 節` 這一族不在掃描範圍：`AGENTS.md 第 1 條`（實讀為 `### 1. 不要自己執行內容同步`，票內「成功時會直接覆寫 `src/data/`，違反 AGENTS.md 第 1 條」**成立** ✅）、`design.md 第五節`（實讀為 `## 五、更新流程與施工順序`，票內「第五節施工順序表」**成立** ✅）。
- 已釋出使用者與正常流程：往後任何人把這張表當成「引用已全部驗過」的依據。
- 可觀察到的損害：目前為零——範圍外的三處實際都正確。風險在方法：**同一輪新增的引用不會出現在該輪的清單裡**。
- 影響的 AC 或不可協商邊界：無。
- 觸發證據：本節第三小節的獨立抽取；`grep -n '294' `、`grep -n 'AGENTS.md 第'`、`grep -n '第五節'`。
- 提議：**Polish**／任務內／`fix`（把 `sync-content.mjs:294` 與 `檔名 第 N 條／第 N 節` 一族補進表，並註明表的適用時點）。

**G3（Deferred risk）S3 判定表第 1 列的前兩個條件，誤刪列也會同時滿足；擋住它的只有第三個條件。**
第 1 列是「main exit 0 **且** `diff` 只落在那三個內容欄或那 59 列的發布內容 **且** 編輯台確認是有人正常填稿」→ 重新量 baseline。
我實測情境 B（部署時誤刪一列已核可的列）：**main exit 0**，且 diff 完全落在「那 59 列的發布內容」之內
——前兩個條件都成立。唯一擋住它的是第三個條件「編輯台確認是有人正常填稿」。
表**照寫是對的**（`且` 明確），但若有人把 diff 位置當成充分條件就會重量 baseline，
**把掉掉的那一列一起烤進新基準，之後 AC-1 反而會通過**。
- 已釋出使用者與正常流程：階段一結束、S3 的 sha256 對不上時，工程照表判斷。
- 可觀察到的損害：對錯誤的內容重新設基準，AC-1 從此失去偵測能力（最壞情況：少一筆內容靜默上線）。
- 影響的 AC 或不可協商邊界：**AC-1**（逐字 sha256）與 **AC-2**（筆數 40／16 為硬條件）。
- 觸發證據：情境 B 實測——main exit 0、印出 `已寫入 src/data/history.json（**39 筆**）`、
  AC-3 的 id 比對印出 `⛔ 少了:["h1"]`、diff 318 行首行為 `"id": "h1" → "id": "h4"`。
- 提議：**Deferred risk**（需要「先誤刪、再誤判」兩步才成立）／任務內／`fix`：
  在第 1 列的條件再加一項**機器可判**的前置——「main 印出的筆數仍是 40／16，且 AC-3 的 id 比對仍為一致」。
  我實測這兩項**都會抓到情境 B**，成本是把 AC-3 那段指令提前跑一次。
  升級為 Material 的條件：S3 真的出現 sha256 不符，而工程在未跑筆數／id 比對的情況下重量 baseline。

**G4（FO 事項，非 implement 的缺失）`### Feedback Cycles` 是空的。**
第 1185 行有 heading，但底下沒有任何 `- Cycle 1: …` 行，而本輪是第 1 個修正回合。
stage 定義寫明「The First Officer appends one `- Cycle {N}: ...` line ... per correction round」。
另該 heading 目前放在 `## Documentation impact` 的末尾，不是獨立的頂層小節。
- 提議：**Polish**／**FO 所有**（worker 不自行補寫他人負責的記錄）／`route for decision`。

### 六、未越界

| 項目 | 結果 |
|---|---|
| diff 基準 | **自己算**：`git merge-base main HEAD` ＝ `384ca7a3c…`（未沿用任何記憶中的 SHA） |
| 整條 branch 動到的檔 | **只有** `docs/constitution-features/050-ssot-approval-deployment.md` |
| `src/`、`scripts/` | **零變動**（`git diff --stat $MB HEAD -- src/ scripts/` 無輸出） |
| `src/data/*.json` | main／050 HEAD／工作區**三者 sha256 相同**（`4d1992e3…`／`4071978a…`） |
| `npm run sync-content` | 未對 repo 執行。main 的同步只在 `mktemp -d` 沙箱跑，餵本機 fixture |
| 040 worktree | `git status` 空，HEAD 仍為 `a51b5d9` |
| 正式 Google 試算表 | **本輪零存取**：沿用第一輪的快照，未發出任何新請求 |
| `sort`／`uniq` 判定中文 | 未使用。去重與計數一律 Node `Map`／`grep -o … \| wc -l` |
| `awk strftime` | 未使用 `awk` 做任何判斷 |

**關於「implement 本輪連讀都沒有讀試算表」**：這是網路行為的否定命題，
我無法從本機狀態證實或否證，**不宣稱已驗證**。可以說的是它**與產出一致**——
implement 本輪需要的欄位標題，票內第一節早已逐字記載，
重跑 main 同步只需本機 fixture，不需要再讀一次試算表；
票內也沒有出現任何第一輪未記載的新資料。

### 七、裁決

**PASSED。**

四筆修正全部是真的修正，沒有一筆「看起來修了其實沒修」。
F2 最關鍵的一格——**合法 fixture 餵進新判準仍判失敗**——通過了，
新判準沒有被放寬成恆真。F4 的 `diff` 指令指對地方，二分判定表在三個真實情境下
確實分得出來。F1 的 13 與我自己實算的結果逐字相符，F3 與三處新查出的同類全部指得對。
**六組承重數字原值保留，S7／S8 兩個表逐字未動。**

新發現四筆，沒有一筆改變 captain 現在正在建的那 9 欄安全前綴，
也沒有一筆改變欄名、欄數或列號——**captain 可以繼續。**
最值得處理的是 **G3**：S3 判定表的前兩個條件擋不住誤刪列，
補一項「筆數仍是 40／16 且 AC-3 的 id 比對仍一致」就能補上，我已實測這兩項都抓得到。
**G1** 是那張 31 列複核表裡唯一一列錯的（P3-7 在 905 不在 865），
實質宣稱正確、載重引用未受影響。**G2** 指出的是方法而非結果：
同一輪新增的引用不會出現在該輪的清單裡——`sync-content.mjs:294` 就是這樣漏的。

## Stage Report: verify (cycle 2)

- DONE: F2（最重要，發生在窗口內）自己架 fixture 重跑 main 同步取得真實輸出，確認新判準認得、舊逐字判準認不得；確認訊息結尾確有 `檢查是否打錯字。`；**跑兩個 falsifying change**，其中 (b) 餵合法 fixture、新判準必須同樣判失敗；確認 AC-6 的要求文字一字未動。
  **全部通過。** 沙箱重跑得逐字輸出 `第 15 欄的標題「review_decision （由 Review 選單寫入）」對不到任何預期欄位。檢查是否打錯字。`，與票內寫入 AC-6 的字串**逐字相同**；`sync-content.mjs:294` 實讀確為該 `addError` 樣板。新判準認得它、舊判準 `「review_decision」` 找不到（F2 病灶重現）。否證 (a)：換回舊 `grep` 立刻判失敗。**否證 (b)（關鍵格）：合法 fixture（安全前綴 9 欄、main exit 0、無標題錯誤）餵進新判準，判失敗**——新判準沒有被放寬成恆真。另補一個自己的否證：抓取失敗類錯誤同樣 exit 1 但 `grep` 印 ⛔，兩個條件合起來才判得準，票內兩者都寫了。要求文字：把 `## Acceptance criteria` 整段逐區塊 diff，**AC-1 至 AC-5 逐字未動**；AC-6 僅 `Verified by:` 與「design stage 已實測」末句變動（後者原寫「錯誤訊息與上面逐字相同」，改寫後已成假，屬必要連帶修正且已揭露），**AC-6 的標題、「會怎麼失敗」、「這一項的用意」均未出現在 diff 中**。
- DONE: F4（S3 的 `diff` 指令自己跑一次確認指對地方；判斷二分判定表照著真的分辨得出來；確認 AC-1 條文完全未動、F4 的修改全部落在 S2／S3）。
  **指對地方。** 以 `mktemp -d` 真的建 `$SANDBOX`、逐字照跑：exit 0，兩個 JSON 確實寫進 `$SANDBOX/src/data/`（11788／26057 bytes），`git status` 確認 repo 未被碰，sha256 仍為 baseline，兩行 `diff` 皆無輸出。**判定表不是裝飾品**：三個真實情境落在不同格子且訊號差距很大——A 編輯填 `chapter`（exit 0，diff **只有 1 行**且欄名就印在 diff 裡）→ 第 1 列；C 欄名打錯（**exit 1**，JSON 未產生）→ 第 2 列首句。**B 誤刪一列已核可列另立為 G3**（exit 0 且 diff 落在那 59 列之內，前兩個條件都滿足）。AC-1 逐字未動（已隨第一項確認）；cycle 2 的 15 行刪改中無一行屬於 AC-1，F4 的修改全部落在 S2／S3。
- DONE: F1／F3 及其擴大掃描——抽樣複驗三處新查出的同類與 `TODO.md:127→156`；抽驗其餘 27 處；判斷「全票 31 處」這個集合是否完整；判斷自我引用補章節錨點是否真的解決漂移。
  三處新查出的同類**全部成立**：`editor-onboarding.md` 430 是順序句、434 才是「編輯權限已經開出去…工作量比原設計預估的大」；`040-…md` 221 是空行、290 才是 Out of scope 原句；本票 50 是空行、53 才是 spike 句。`TODO.md` 127 空行、156 為該記錄。本票「第 45 行」現仍正確。**其餘 27 處我沒有抽樣，逐一實讀全查完——26 處通過，查出第 5 處錯（G1：P3-7 在第 905 行不在 865）。** 集合完整性：獨立重新抽取全票引用後比對，**掃描當下的 `檔名:行號` 一處都沒漏**，但有兩個範圍外缺口（G2）——`sync-content.mjs:294` 是 cycle 2 自己新增、加在掃描之後；`AGENTS.md 第 1 條`／`design.md 第五節` 屬 `檔名 第 N 條／第 N 節` 一族不在掃描範圍，三處實讀**內容都正確**。錨點：**是部分改善不是修好**——行號 45／53 仍寫在文字裡，上方一插入內容就會再失準；錨點買到的是**可復原**而非不漂移。真正不漂移的寫法是只留錨點不留行號，`P3-7` 以名稱引用就是正確示範，也正因如此 G1 的錯行號沒傷到任何載重引用。
- DONE: 數字與未越界——確認六組數字原值保留；判斷 `review_decision` 四個欄號確為排序差異；diff 基準自算；確認 `src/` 零變動、`src/data/*.json` 與 main 相同、未跑 `sync-content`、未動 040 worktree、正式試算表零存取。
  **六組全部原值保留**：以 cycle 2 的 15 行刪改當證據逐行看過，**只有 1 行含承重數字**（即 F1 的 14→13）；24（8＋9＋7）、9／15、59（40／15／4）、12／15 個範圍、6 段、`d3` 第 4 列與其餘 27 列均未動，**S7 與 S8 整個區塊逐字未動**（30 行 `diff -q` 無差異）。F1 改對了：第 661 行現為「其後 13 列（第 5-17 列）」，與我第一輪實算逐字相符。四個欄號**確為排序差異**：12（建議排序 Track 1）、15（S2／S4 Track 1）、18（S2／S4 Track 2）、6（`site_tldr`，兩種排序皆同，因它沒有安全前綴）——四個值我在兩輪中都親自跑出來過；AC-6 已明寫不要綁欄號且判準本身不含欄號，足以不讓人困惑。未越界：diff 基準**自算**為 `384ca7a3c…`（未沿用記憶中的 SHA）；整條 branch 只動票檔一個；`src/`／`scripts/` 零變動；`src/data/*.json` 在 main／050 HEAD／工作區**三者 sha256 相同**；main 同步只在 `mktemp -d` 沙箱餵本機 fixture 跑；040 worktree `git status` 空且 HEAD 仍為 `a51b5d9`；**本輪對正式試算表零存取**（沿用第一輪快照，sha256 相同）。未用 `sort`／`uniq` 判定中文，未用 `awk`。
  **對「implement 連讀都沒有讀試算表」不宣稱已驗證**——那是網路行為的否定命題，無法從本機狀態證實；只能說它與產出一致（所需標題票內第一節已逐字記載，重跑只需本機 fixture，票內也未出現第一輪未記載的新資料）。

### Summary

四筆修正**全部是真的修正**，沒有一筆「看起來修了其實沒修」。

F2 最關鍵的一格通過了：把一份**沒有標題錯誤的合法 fixture** 輸出餵進新判準，
它**同樣判失敗**——新判準不是被放寬成恆真，它仍然會拒絕。
真實輸出與票內寫入 AC-6 的字串逐字相同，`sync-content.mjs:294` 的樣板也核對無誤。
**AC-1 至 AC-5 逐字未動，AC-6 只動 `Verified by:` 與一句必要的連帶修正。**

F4 的 `diff` 指令我逐字跑過，確實寫進 `$SANDBOX/src/data/` 而非 repo。
那張二分判定表**不是裝飾品**——三個真實情境落在不同格子，訊號差距很大
（1 行 diff／318 行 diff／exit 1）。六組承重數字原值保留，S7 與 S8 逐字未動。

新發現四筆，**沒有一筆改變 captain 正在建的那 9 欄，也沒有一筆改變欄名、欄數或列號**。
最值得處理的是 **G3**：S3 判定表第 1 列的前兩個條件，**誤刪一列已核可列也會同時滿足**
（實測 exit 0、diff 落在那 59 列之內），擋住它的只有第三個人工條件；
若有人把 diff 位置當充分條件而重量 baseline，就會把掉掉的那一列烤進新基準，
AC-1 之後反而會通過。補一項機器可判的前置（筆數仍是 40／16、AC-3 的 id 比對仍一致）即可，
我實測這兩項都抓得到（該情境印出 `39 筆`、`少了:["h1"]`）。

**G1** 是那張 31 列複核表裡唯一一列錯的——`TODO.md` 的 P3-7 在第 **905** 行不在 865
（865 是 P3-4 的 `opposing_views`）；實質宣稱正確，且票內三處都以**名稱**引用 P3-7、不帶行號，
所以沒有載重引用被打壞。**這一列是我逐一查完 31 列查出來的，不是抽樣。**
**G2** 指的是方法不是結果：掃描當下的 `檔名:行號` 一處沒漏，
但同一輪新增的引用不會出現在該輪清單裡——`sync-content.mjs:294` 正是這樣漏的；
`AGENTS.md 第 1 條`／`design.md 第五節` 則整族不在掃描範圍（三處實讀內容都正確）。
**G4** 是 FO 事項：`### Feedback Cycles` 有 heading 但沒有 `- Cycle 1` 行。

## Stage Report: implement (cycle 3)

- DONE: G3（最優先，captain 很快會跑 S3）S3 判定表第 1 列再加一項機器可判的前置——「main 印出的筆數仍是 40／16，且 AC-3 的 id 比對仍為一致」。兩個方向都驗：(a) 情境 B（誤刪 `h1`）必須擋住；(b) 情境 A（編輯合法填 `chapter`）必須放行。promote-to-material 條件一併記入。修改落在 S3，不得碰 AC-1／AC-2 條文。
  第十節第一小節。S3 現在先跑兩項機器檢查再看 `diff`：**檢查①筆數**（`（40 筆）`／`（16 筆，含 tldr）`）、**檢查②id 清單**（AC-3 的指令原樣提前跑，`OUT` 指向沙箱）。分辨表由兩列變三列，中間新增一列專門處理「檢查①或②沒通過」→ 判「有列掉了或被換掉」→ **絕對不要重量 baseline**，並寫明後果（把掉掉的那一列烤進新基準、AC-1 之後反而會通過、最壞情況少一筆內容靜默上線）。表頭上方另加 ⚠️ 明寫「光看 exit code 與 diff 位置，誤刪與合法填值長得一樣」。promote-to-material 改為兩條並列，第 2 條即 verify 寫的「S3 真的出現 sha256 不符，而工程在未跑檢查①②的情況下重量 baseline」。
  **五個情境實測，兩個方向都成立。** 用第一節記載的真實標題造階段一完成後的 fixture（Track 1 十四欄、Track 2 十七欄、`site_tldr` 五欄），列數刻意造成與正式表相同（42／43／4 列資料、40／15／4 列 `Approved`），所以 main 印出的就是 `（40 筆）` 與 `（16 筆，含 tldr）`。**(b) 放行**：情境 A（填 `chapter`）與 A2（填 `owl_depth_comment`）筆數與 id 都通過，仍走得到「重新量 baseline」那一格。**(a) 擋住**：情境 B（刪 `h1`）印 `（39 筆）`＋`⛔ 少了:["h1"]`；B2（刪 `d1`）印 `（15 筆，含 tldr）`＋`⛔ 少了:["d1"]`。**舊前置在五個情境全部放行**，證實 G3 的前提。
  falsifying change：情境 B3（刪 `h1` 又新增已核可的 `h99`）**筆數仍是 40 筆**，只有 id 比對抓到（`⛔ 少了:["h1"] 多了:["h99"]`）——證明兩項檢查缺一不可，表裡寫「檢查①**與**②都通過」不是冗贅。
- DONE: G1（Polish）`TODO.md` 的 P3-7 在第 905 行不在 865。
  第十節第二小節。**這一筆比「行號寫錯」複雜，實測結果與 verify 不同但兩邊都對**：`TODO.md` 是票內唯一在 main 與本 branch 之間有差異的被引用檔——main 多 40 行，插在第 596-635 行（features 065／066／049 的兩筆 P1-9）。所以 P3-7 在 **main 是 905**（verify 讀的）、**在本 worktree 是 865**（cycle 2 讀的），`905－865＝40` 與插入行數相符。**處置不是把 865 改成 905，而是改成名稱引用**，並把成因寫進該列。順帶把票內最後一處 `TODO.md:行號` 也改掉：步驟 3 的表與第三節的 `TODO.md:156`（cycle 2 對 F3 的修正）改為 `TODO.md` 的 P1-5「附帶問題已解決」——`:156` 目前兩邊都對，但那是因為差異從第 596 行才開始，是運氣不是保證。另查了其他七個被引用的檔（`editor-onboarding.md`、`2026-08-31-content-pipeline.md`、`design.md`、`040-…md`、`AGENTS.md`、`CLAUDE.md`、`scripts/sync-content.mjs`），**兩個 checkout 都是同一個 blob**，行號無歧義，本輪不動。
- DONE: G2（方法）把兩個範圍外缺口寫進票內掃描說明並把範圍擴到第二族。不必追求「掃描當下零漏」，要修的是清單沒有寫明自己的涵蓋邊界。
  第九節表頭補上**三條邊界**：①它是掃描當下的快照，同一輪之後新增的引用不會出現在裡面（`sync-content.mjs:294` 正是這樣漏的——cycle 2 自己為 F2 新增、加在掃描之後，所以「零漏」與「涵蓋全票」不是同一件事）；②它原本只掃 `檔名:行號` 一族；③行號只在「那個檔在兩個 checkout 相同」時才有唯一答案。表補 5 列，合計 36 列。`AGENTS.md` 第 1 條、`design.md` 第二節的欄位表、`design.md` 第五節施工順序表、`sync-content.mjs:294` **四處實讀通過**。
  **第 5 列是本輪新查出的錯，而且比 G1 嚴重：引錯的是檔名。** 票內兩處寫「`design.md` 明訂／禁止舊列不能批次補造指紋」，但 `design.md` **完全沒有這一條**（全檔 `grep 補造` 零命中；`指紋` 只出現 5 次，全在修訂紀錄與一條 041 的註記裡）。該規則實際在 `editor-onboarding.md:432-433`、`040-…md:173`、040 worktree 的 `operations.md:13`。措辭與 `editor-onboarding.md:432-433` 逐字最接近，兩處都改指它；步驟 7 另把「手動貼上或用公式填 `approved_fingerprint`」標明為本票的舉例而非原文。**實質規則與 captain 要做的事一個字都沒變**，改的只是「這條規則寫在哪裡」。這一筆是靠 G2 擴大範圍才浮出來的：那兩處引用**不帶行號也不帶節號**，所以既不在第一族也不在第二族——**第三族是「只寫檔名、不寫位置」的引用**，已納入表中。
- DONE: 採納 verify 對錨點的評價並寫進票內，並判斷那兩處自我引用要不要索性拿掉行號、說明理由。
  第十節第四小節。**採納**：補章節錨點是部分改善不是修好——行號仍寫在文字裡，上方一插入內容就再失準；**錨點買到的是「可復原」而非「不漂移」**。**判斷：那兩處自我引用的行號拿掉，只留錨點**（改為「本票 `## 相依關係` 的第二個項目符號」與「`## Risk evidence` 的首句」，另同步改了 Stage Report: design 裡的同一處引用）。四個理由：①自我引用最會漂移——cycle 2 光插入第九節就把 `## 相依關係釐清` 以下推了 117 行；②錨點已經夠精確，那兩個錨點各自只對應一句話，行號沒有增加精確度；③票內已有正確示範，三處 P3-7 以名稱引用，所以 G1 的錯行號沒打壞任何載重引用；④G1 又補了更強的理由——行號在兩個 checkout 可以有兩個合法答案。**不對稱處置已說明理由**：跨檔引用的行號保留，因為那七個檔兩邊同 blob、本票不會改它們、行號比章節名好查；`TODO.md` 是唯一例外已改名稱引用。**判準是「這個檔會不會在我引用它之後變動」，不是「行號一律不好」。**
- DONE: 未越界。
  **正式試算表零寫入零讀取**（本輪未發出任何 HTTP 請求；fixture 標題取自第一節已記載的實測值，內容列為合成）。**AC 區塊逐位元組未動**（`## Acceptance criteria` 整段與本輪之前比對逐字相同），G3 的修改全部落在 S3。**S7 與 S8 兩個區塊逐字未動**——與 S7／S8 誕生的那一版（`2e83adf`）以及本輪之前（`beb9b15`）**兩個基準都比過，373／535 bytes 逐字相同**。承重數字 24／9／15／59／12／6 原值保留。`Documentation impact` 與 `Out of scope` 逐字未動。**未代 FO 補寫 `### Feedback Cycles`**：該區塊逐位元組未動，Cycle 行數仍為 1。整條 branch 只動 `docs/constitution-features/050-ssot-approval-deployment.md` 一個檔；`git diff --stat $(git merge-base main HEAD) -- src/ scripts/` 無輸出；`src/data/*.json` sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`；未跑 `sync-content`（七次 main 同步全在 `mktemp -d` 沙箱、餵本機 fixture）；040 worktree 與主 checkout 的 `git status` 全程為空。diff 基準自算 `git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。未用 `sort`／`uniq` 判定中文字串，未用 `awk` 做任何判斷。

### Summary

三筆按 FO 授權修完，**G4 未動**——`### Feedback Cycles` 逐位元組未改，Cycle 行仍是 FO 寫的那一行。

**G3 是本輪的重點，因為 captain 正在建那 9 欄安全前綴、很快會跑 S3。**
原表的前兩個條件（main exit 0、`diff` 落在那 59 列之內）擋不住誤刪列——
我造了五個情境實測，**舊前置在五個情境全部放行，包含三種掉列**。
補上「筆數仍是 40／16」與「AC-3 的 id 比對仍一致」兩項機器檢查之後：
誤刪 `h1` 印 `（39 筆）`＋`少了:["h1"]`、誤刪 `d1` 印 `（15 筆）`＋`少了:["d1"]`，**都擋住**；
而編輯合法填 `chapter` 或 `owl_depth_comment` 兩種情形**都放行**，
仍然走得到「重新量 baseline」那一格——**不是把會誤判的路換成永遠停住的路**。
另外造了「刪一列又補一列」的情境：筆數仍是 40，只有 id 比對抓得到，
所以兩項檢查缺一不可。

**G1 的實測結果與 verify 不同，但兩邊都對，而這件事比原本那筆 finding 重要。**
`TODO.md` 是票內唯一在 main 與本 branch 之間有差異的被引用檔（main 多 40 行，插在第 596-635 行）。
P3-7 在 main 是第 905 行，在本 worktree 是第 865 行，差值正好等於插入的行數。
**所以「`TODO.md:行號`」在本票沒有唯一答案**——這不是查一次就能修好的錯，
它會隨讀者站在哪個 checkout 而改變。處置因此不是把 865 改成 905，而是改成名稱引用。

這也讓錨點那個判斷題有了明確答案：**那兩處自我引用的行號拿掉，只留錨點。**
verify 的評價是對的——錨點買到「可復原」，買不到「不漂移」，要不漂移就不能留行號。
但**跨檔引用的行號我保留**，理由寫進票內：那七個檔兩邊同 blob、本票不會改它們，
行號比章節名好查。判準是「這個檔會不會在我引用它之後變動」，不是「行號一律不好」。

**G2 擴大範圍又撈出一筆，而且比 G1 嚴重：`design.md` 引錯的是檔名不是行號。**
票內兩處說「`design.md` 明訂舊列不能批次補造指紋」，`design.md` 沒有這一條——
該規則在 `editor-onboarding.md:432-433`（另有兩份副本）。
實質規則與 captain 要做的事一個字都沒變，但讀者照票去 `design.md` 找會找不到。
這兩處**不帶行號也不帶節號**，所以前兩輪掃描都掃不到——
第九節現在明寫第三族是「只寫檔名、不寫位置」的引用，並已納入。

## verify stage 第三輪：G1-G3 修正複驗（2026-09-24）

diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。
**本輪對正式試算表零存取**，沿用第一輪的快照（sha256 未變）。

### 一、G1 —— **我上一輪判錯了**，implement 的解釋成立

**先更正我自己的結論。** 我上一輪寫「P3-7 在第 905 行不在 865」，
但我讀的是**主 checkout** 的 `docs/health-check/TODO.md`，而本票活在 050 這個 branch 上。
865 對 cycle 2 站的位置是對的，**G1 作為 finding 不成立**。

實測（兩個 blob、兩個行號、一個差值）：

| | blob | 行數 | P3-7 |
|---|---|---|---|
| `main` | `d0c7119a…` | 1046 | 第 **905** 行 |
| `HEAD`（050 branch） | `52d96f5c…` | 1006 | 第 **865** 行 |

`git diff HEAD main -- docs/health-check/TODO.md` 只有一個 hunk：`@@ -593,6 +593,46 @@`，
**新增 40 行、刪除 0 行**，插入內容是 065／066／049 的兩筆 P1-9。
`905 − 865 = 40`，**差值正好等於插入行數** ✅。

**所以結論比原 finding 重要：`TODO.md:行號` 在本票沒有唯一答案。**
它不是查一次能修好的錯，它隨讀者站在哪個 checkout 而變。改成名稱引用是對的處置。

**把最後一處 `TODO.md:156` 也改成名稱引用的理由成立。** 實測第 156 行在兩個 checkout
逐字相同——但那正是因為差異從第 596 行才開始，**156 < 596 是巧合不是保證**。
下一次若有人在 TODO.md 前段插入內容，`:156` 立刻兩邊不同。理由站得住。

**「其他七個被引用檔兩個 checkout 同 blob」抽驗通過**：

| 檔 | main vs HEAD |
|---|---|
| `2026-09-03-editor-onboarding.md` | ✅ 同 blob `9424cc529` |
| `2026-08-31-content-pipeline.md` | ✅ 同 blob `b6c6656c4` |
| `design.md` | ✅ 同 blob `6a0ec1845` |
| `040-approval-content-version-binding.md` | ✅ 同 blob `2b5da9b89` |
| `AGENTS.md` | ✅ 同 blob `53a81d010` |
| main `sync-content.mjs` | ✅ 同 blob `94dd3030a` |

### 二、G2 —— 成立，而且引錯的確實是**檔名**

**`design.md` 真的沒有這條規則。** 全檔實測：

- `grep 補造` → **零命中**
- `grep 批次` → **零命中**
- `grep 指紋` → 7 次，全部在別的脈絡（第 442、569、571、572、576 行：實測記錄、公式衍生 `status`、同步端重算、尚未實作）

**`editor-onboarding.md:432-433` 確實是措辭最接近的出處**，而且接近到近乎逐字：

```
432: 另外舊列不能批次補造指紋。
433: 部署新欄位後既有的 `Approved` 會全部先顯示 `Needs review`，需要編輯台重新核可一輪。
```

票內原句是「`design.md` 明訂舊列不能批次補造指紋——部署新欄位後既有的 `Approved` 會**全部先顯示 `Needs review`**」
——兩句的結構與用詞與上面這兩行對得上，**這是它真正的出處**。
另兩處佐證也實讀通過：`040-…md:173`「舊列不能批次補造指紋。…」、
040 worktree `operations.md:13`「不要批次替舊列補造指紋。部署後要逐列重新核可。」

全 repo `grep -rl 補造` 只命中三個檔（`editor-onboarding.md`、040 的票、本票），
**`design.md` 確認不在其中**。

**實質規則沒變，captain 要做的事一個字都沒變。** 這一筆的價值在於它證明了
第三族（只寫檔名、不寫位置）真的存在且會出錯。

### 三、G3 —— 五個情境我全部親手跑過，兩個方向都成立

沙箱跑 main 的同步，逐一套用五個 fixture。**檢查①** 取 main 印出的兩行筆數，
**檢查②** 是 AC-3 的比對指令原樣提前跑。**舊前置**＝ G3 之前的判準（exit 0 ＋ diff 位置）。

| 情境 | main exit | 檢查①筆數 | 檢查②id 清單 | 新表判定 | 舊前置 |
|---|---|---|---|---|---|
| **A**　編輯合法填 `chapter` | 0 | ✅ （40 筆）／（16 筆，含 tldr） | ✅ 一致 | **放行** → 重新量 baseline | 放行 |
| **A2**　編輯合法填 `owl_depth_comment` | 0 | ✅ （40 筆）／（16 筆，含 tldr） | ✅ 一致 | **放行** → 重新量 baseline | 放行 |
| **B**　誤刪 `h1` | 0 | ⛔ （**39 筆**）／（16 筆） | ⛔ `少了:["h1"]` | 擋住 | ⚠️ **放行** |
| **B2**　誤刪 `d1` | 0 | ⛔ （40 筆）／（**15 筆**） | ⛔ `少了:["d1"]` | 擋住 | ⚠️ **放行** |
| **B3**　刪 `h1` 又補一列已核可的 `h99` | 0 | **✅ （40 筆）／（16 筆）** | ⛔ `少了:["h1"] 多了:["h99"]` | 擋住 | ⚠️ **放行** |

**B3 這一格成立，而且它就是兩項檢查缺一不可的證明**：檢查①**完全通過**（筆數真的還是 40），
只有檢查②開火。表裡寫「檢查①**與**②都通過」不是冗贅，**拿掉②就擋不住 B3**。

**A 與 A2 兩格同樣通過**——兩項檢查都放行，走得到「重新量 baseline」。
新判準**沒有**把會誤判的路換成永遠停住的路，captain 過得去。

**implement 宣稱的前提也成立**：舊前置在五個情境**全部放行**，包含 B／B2／B3 三種掉列。
G3 之前，誤刪一列真的會一路走到「重新量 baseline」。

**修改全部落在 S3。** `## Acceptance criteria` 整段與 cycle 3 的前一個 commit（`beb9b15`）
**逐位元組相同（7009 bytes）**——AC-1、AC-2、AC-3 的條文一個字都沒動。

### 四、錨點的不對稱處置 —— 方向對，但判準的適用範圍還缺一塊

**自我引用拿掉行號、只留錨點：正確。** 四個理由都成立，其中第 3 點（P3-7 以名稱引用，
所以 G1 那個錯行號沒打壞任何載重引用）我實測確認——票內三處 P3-7 都不帶行號。

**跨檔保留行號、判準為「這個檔會不會在我引用它之後變動」：判準是對的，但它自己沒有被貫徹到底。**

邊界 3 用的測試是「兩個 checkout 是不是同一個 blob」。**這個測試對三個被引用的檔根本不適用**，
因為它們**不在 main 裡**：

| 檔 | 在 main？ | 票內以行號引用幾處 |
|---|---|---|
| `scripts/apps-script/approval-workflow.gs` | ⛔ **不在 main** | 9 處（5／6／12-14／76-80／79／127-144／159／219／220） |
| `docs/content-pipeline/operations.md` | ⛔ **不在 main** | 2 處（12／15-25） |

這兩個檔只活在 `spacedock-ensign/040-…` 這個 branch 上，而 **040 目前 `status: review`、
`completed:` 空白、尚未合併**——它正是「會在我引用它之後變動」的典型。
拿「兩個 checkout 同 blob」去測它們，**測不出東西，因為根本沒有第二個 checkout 可比**。

**票庫裡已經有正解**：044 處理同一個問題時，把 `.gs` **釘到 commit `093cd01`**
（044 票內第 1068 行記載該 commit 的 `.gs` sha256）。
建議 050 比照——把那 11 處的依據釘到 040 worktree 現在的 HEAD `a51b5d9`，
或在行號旁註明 commit。這不是新規則，是沿用本票庫既有做法。

### 五、本輪的新發現：**第三族不是最後一族**

被問到「三族完整了嗎」。**不完整。有第四族，而且它現在正咬著這張票。**

**第四族：引用另一張票，只寫 feature 編號——沒有檔名、沒有行號、沒有節號。**
票內這樣的引用至少有 11 處（`feature 044` 9 處、`feature 043` 2 處）。
它的失效模式和前三族**不同類**：前三族是「指到錯的位置」，
第四族是「**被引用的那張票，狀態變了**」。行號檢查永遠查不到它。

**H1（Material・需 captain 裁決）feature 044 已於 2026-09-21 完成並通過，050 的 🔴 裁決前提已經不成立。**

票內「相依關係釐清」寫：

> 044 的前置是「一份隔離測試表 + 兩個 Google 帳號」，這兩項卡在人不卡在程式，**目前不存在**。
> 鏈條是：`兩個帳號 → 044 → 050 → 040 合併`，而**鏈條頭卡住**。

實讀 `docs/constitution-features/_archive/044-approval-permission-two-account-probe.md`：

```
status: complete          verdict: PASSED          score: 0.96
completed: 2026-09-21T18:35:02Z                    pr: pr-merge:36
```

**044 早在三天前就完成了，而且已經歸檔到 `_archive/`。**
它的 AC-3 逐字是「**投稿者對八個審核欄位一格都改不到**」——
與 050 的 AC-3／AC-4 是同一個命題；044 票內第 130 行自己也寫明
「`050-…md` 的 AC-3…與本票的第二個命題是同一件事」。

- 已釋出使用者與正常流程：captain 正在部署，隨時會被要求解這個 🔴。
- 可觀察到的損害：**三個選項全部失真。** 選項 A（建議）的代價寫「040 合併再延一輪、要多開一個帳號」
  ——**那個代價已經付掉了**；選項 B 是「明文豁免 `operations.md:12` 與 040 Out of scope 的但書，
  直接在正式表部署」，代價欄自己寫「**部分不可逆**…錯誤發生在 40 筆已上線內容的唯一來源上」
  ——captain 若為了省下那個不存在的延期而選 B，**是拿 40 筆已上線內容去換一個已經不用付的成本**。
- 影響的 AC 或不可協商邊界：`operations.md:12` 這條**保護邊界的觸發條件已滿足**
  （「兩帳號隔離 probe 完成前，不要把 Apps Script 套到正式 SSOT」——probe 完成了）；
  AC-4 的「前置：需要第二個 Google 帳號…與 044 的資源前置是同一個」同樣過期。
- 觸發證據：上列 front matter；`ls docs/constitution-features/` 無 `044`，檔案在 `_archive/`；
  歸檔 commit `66ed939 archive 044-approval-permission-two-account-probe (merge guard)`。
- **仍然真正開著的是什麼**：040 的 Out of scope 是「不上線正式 SSOT 設定，
  直到隔離測試表完成驗證**並由 captain 確認**」。probe 那一半完成了，
  **「由 captain 確認」那一半仍在 captain 手上**。所以這不是「可以直接開工」，
  而是「**要決定的東西和票內寫的不一樣了**」。
- 提議：**Material**／**任務不能獨佔這個決定**（只有 captain 能改已核可的範圍）／
  `route for decision`。任務內可以做的是**事實更新**：把 044 的 `complete／PASSED／2026-09-21／_archive/`
  寫進相依關係節，並重寫三個選項——A 的代價改為「已完成，無額外代價」、
  B 標記為「**不再有理由**」、剩下的真問題縮小為「captain 確認」這一步。
- **我自己前兩輪也沒查到這一條**，因為我和前兩輪的掃描一樣只盯著 `檔名:行號`。

**H2（Polish）表頭那三條邊界宣告，涵蓋不到它自己最新的失效模式。**
逐條對照 H1：

| 邊界 | 它防的是什麼 | 擋得住 H1 嗎 |
|---|---|---|
| 1　「掃描當下的快照」 | **本票之後新增**的引用（如 `sync-content.mjs:294`） | ⛔ 擋不住。044 是**舊引用**，變的是**被引用對象** |
| 2　「原本只掃 `檔名:行號` 一族」 | 語法形式不同的族（第二族、第三族） | ⛔ 擋不住。第四族連檔名都沒有 |
| 3　「行號只在兩個 checkout 同 blob 時唯一」 | **檔案**在不同 branch 的行號歧義 | ⛔ 擋不住。044 變的是 `status` 與**所在目錄**，不是行號 |

三條邊界有一個共同的隱含假設：**被引用的對象是一個「內容穩定、只有位置會變」的檔。**
第四族違反的正是這個假設。
- 提議：**Polish**／任務內／`fix`（補第四族與對應的檢查方式：
  引用另一張票時，**重讀它的 front matter `status`／`verdict`／`completed`**，而不是檢查行號）。

**H3（Deferred risk）步驟 6 把整列刪除的缺口推給 043，但 043 未定案，且照它現在的設計也擋不住單列誤刪。**
票內第 265 行：「本票不處理（見 Out of scope），由 feature 043（刪列跌幅門檻）在同步端擋。」
實讀 `043-sync-row-drop-threshold.md`：`status: design`，標題前綴「**待captain確認脈絡**」，
source 寫「先開票存證，**脈絡待確認後再決定是否進行**」——**這張票還沒決定要不要做**。
而且它的門檻是「**初步建議兩成**」且列在未決問題裡：
**刪 1 列／共 40 列 ＝ 2.5%，遠低於兩成**，所以即使 043 照現在的設計做出來，
**也擋不住我這一輪實測的情境 B**。
- 可觀察到的損害：讀者會以為整列刪除已經有人接手擋掉了，實際沒有。
- 反過來說**這張票自己已經有更好的防線**：S3 的檢查②在情境 B／B2／B3 全部抓到。
  所以要改的只是這句話的措辭，不是防線。
- 提議：**Deferred risk**／任務內／`fix`（把該句改為「043 尚未定案，且其跌幅門檻設計
  擋不住單列誤刪；本票的防線是 S3 的檢查①②」）。

**H4（Polish）跨檔行號的例外清單漏了只存在於 040 branch 的兩個檔。** 見第四節。
- 提議：**Polish**／任務內／`fix`（比照 044 釘 commit）。

### 六、未越界

| 項目 | 結果 |
|---|---|
| diff 基準 | **自算** `384ca7a3c…`，未沿用記憶中的 SHA |
| 整條 branch／cycle 3 動到的檔 | **都只有** `050-ssot-approval-deployment.md` 一個 |
| `src/`、`scripts/` | **零變動** |
| `src/data/*.json` | main／050 HEAD／工作區**三者 sha256 相同** |
| `npm run sync-content` | 未對 repo 執行；五個情境全在 `mktemp -d` 沙箱餵本機 fixture |
| 040 worktree | `git status` 空，HEAD 仍為 `a51b5d9`（三輪皆同） |
| 正式試算表 | **零存取**，沿用第一輪快照 |
| `## Acceptance criteria` | vs `beb9b15` **逐位元組相同（7009 bytes）** |
| S7／S8 | 與 `2e83adf`、`beb9b15` **兩個基準皆逐位元組相同**（593／759 bytes；位元組數與 implement 報的 373／535 不同是切片邊界不同，內容同一致） |
| `### Feedback Cycles` | vs `beb9b15` **逐位元組未動**，`- Cycle` 行數 **＝ 1**（FO 所寫，implement 未動）✅ |
| `Documentation impact`／`Out of scope` | 逐字未動 |
| 承重數字 | 24／9／15 欄、59 列、12／15 個範圍、6 段 **全部原值保留**（cycle 3 的 22 行刪改逐行看過，無一含承重數字） |
| `sort`／`uniq` 判定中文、`awk` | 皆未使用 |

### 七、裁決

**PASSED。**

G1／G2／G3 三筆都驗過，三筆都是真的修正：
G1 的解釋成立而**我上一輪的 finding 不成立**——`TODO.md` 在兩個 checkout 有兩個合法行號，
改名稱引用是對的；G2 成立，`design.md` 確實沒有那條規則，`editor-onboarding.md:432-433` 才是出處；
G3 五個情境全部親手跑過，**B3 證明兩項檢查缺一不可，A／A2 證明新判準沒有變成永遠停住**。
AC 整段逐位元組未動，S7／S8 與兩個基準皆相同，`Feedback Cycles` 未被代寫。

**但本輪最重要的不是這三筆，是第四族。**
「三族」不完整——**引用另一張票、只寫 feature 編號**是第四族，
它的失效模式是「被引用的票**狀態變了**」，三條邊界宣告一條都擋不住。

**H1 需要 captain 在解那個 🔴 之前先看到**：feature 044 已於 **2026-09-21 完成、PASSED、已歸檔**，
而票內仍把它寫成「前置不存在、鏈條頭卡住」。
三個選項因此全部失真——選項 A 的代價已經付掉，選項 B（豁免 probe 但書、直接在正式表部署，
票內自己標為「部分不可逆」）**已經沒有理由**。
真正還開著的只剩 040 Out of scope 的後半句「**並由 captain 確認**」。

## Stage Report: verify (cycle 3)

- DONE: G3（最要緊，captain 下一關就是 S3）親手跑五個情境，特別是 B3；A／A2 必須放行；確認舊前置在五個情境全部放行；確認修改全部落在 S3、未碰 AC-1／AC-2 條文。
  **五個情境全部親手跑過，兩個方向都成立。** **B3（刪 `h1` 又補一列已核可的 `h99`）成立且是關鍵**：檢查①**完全通過**（筆數真的還是 `（40 筆）`／`（16 筆，含 tldr）`），只有檢查②開火印出 `⛔ 少了:["h1"] 多了:["h99"]`——**拿掉檢查②就擋不住它**，所以表裡的「檢查①**與**②都通過」不是冗贅。**A／A2 同樣通過**：兩項檢查都放行，走得到「重新量 baseline」，新判準沒有把會誤判的路換成永遠停住的路。B 擋在 `（39 筆）`＋`少了:["h1"]`，B2 擋在 `（15 筆，含 tldr）`＋`少了:["d1"]`。**前提也成立**：舊前置（exit 0＋diff 位置）在五個情境**全部放行**，包含三種掉列——G3 之前誤刪一列真的會一路走到重新量 baseline。修改全部落在 S3：`## Acceptance criteria` 整段與 `beb9b15` **逐位元組相同（7009 bytes）**，AC-1／AC-2／AC-3 條文一字未動。
- DONE: G1 自己驗「`TODO.md:行號` 沒有唯一答案」；判斷把 `:156` 也改名稱引用的理由；抽驗其他七個被引用檔同 blob。
  **implement 的解釋成立，而我上一輪的 G1 不成立——已在正文更正。** 我讀的是主 checkout 的 `TODO.md`，本票活在 050 branch 上；865 對 cycle 2 站的位置是對的。實測：main blob `d0c7119a…` 1046 行、P3-7 在 **905**；HEAD blob `52d96f5c…` 1006 行、P3-7 在 **865**；`git diff` 單一 hunk `@@ -593,6 +593,46 @@`、**+40 −0**，`905−865=40` **差值正好等於插入行數**。`:156` 改名稱引用的理由**成立**：實測第 156 行兩邊逐字相同，但那正因 `156 < 596`（差異起點）——是巧合不是保證。其他六個被引用檔抽驗**全部同 blob**（editor-onboarding `9424cc529`、content-pipeline `b6c6656c4`、design.md `6a0ec1845`、040 票 `2b5da9b89`、AGENTS.md `53a81d010`、main sync-content `94dd3030a`）。
- DONE: G2 自己確認 `design.md` 真的沒有那條規則、`editor-onboarding.md:432-433` 是最接近的出處；判斷「三族」是否完整；判斷三條邊界是否涵蓋自己的失效模式。
  **G2 成立，引錯的確實是檔名。** `design.md` 全檔 `grep 補造` **零命中**、`grep 批次` **零命中**；`指紋` 7 次全在別的脈絡。`editor-onboarding.md:432-433` 近乎逐字（「另外舊列不能批次補造指紋。」＋「部署新欄位後既有的 `Approved` 會全部先顯示 `Needs review`，需要編輯台重新核可一輪。」），與票內原句結構用詞對得上，**確認是真出處**；`040-…md:173` 與 `operations.md:13` 兩處佐證亦實讀通過；全 repo `grep -rl 補造` 只命中三檔，`design.md` 確認不在其中。**「三族」不完整——有第四族（H1／H2）**：引用另一張票、只寫 feature 編號（票內至少 11 處），失效模式是「被引用的票**狀態變了**」而非「指到錯的位置」。**三條邊界一條都擋不住**，因為它們共用一個隱含假設「被引用的對象是內容穩定、只有位置會變的檔」。
- DONE: 判斷錨點的不對稱處置；未越界（AC 逐位元組、S7／S8 與兩基準、承重數字、`Feedback Cycles` 與 Cycle 行數、`src/` 零變動、試算表零存取、diff 基準自算）。
  **自我引用拿掉行號只留錨點：正確**，四個理由都成立（第 3 點我實測確認，票內三處 P3-7 皆不帶行號）。**跨檔保留行號：判準對，但沒貫徹到底（H4）**——邊界 3 用「兩個 checkout 同 blob」當測試，但 `approval-workflow.gs`（票內 9 處行號引用）與 `operations.md`（2 處）**根本不在 main**，只活在 040 branch，而 **040 `status: review`、`completed:` 空白、尚未合併**，正是「會在我引用它之後變動」的典型；票庫已有正解——044 把 `.gs` **釘到 commit `093cd01`**。未越界全部通過：整條 branch 與 cycle 3 都只動票檔一個；`src/`／`scripts/` 零變動；`src/data/*.json` main／HEAD／工作區三者 sha256 相同；五個情境全在 `mktemp -d` 沙箱餵本機 fixture；040 worktree 乾淨且 HEAD 仍為 `a51b5d9`；**正式試算表零存取**；S7／S8 與 `2e83adf`、`beb9b15` **兩個基準皆逐位元組相同**；**`### Feedback Cycles` 逐位元組未動且 `- Cycle` 行數 ＝ 1**；`Documentation impact`／`Out of scope` 逐字未動；承重數字 24／9／15／59／12／6 原值保留（cycle 3 的 22 行刪改逐行看過，無一含承重數字）；diff 基準自算；未用 `sort`／`uniq` 判定中文，未用 `awk`。

### Summary

G1／G2／G3 三筆都是真的修正。**G1 那一筆的更正方向是反的——錯的是我。**
`TODO.md` 在 main 與本 branch 是兩個 blob（1046 對 1006 行，差異是插在第 596 行起的 40 行），
P3-7 在 main 是 905、在本 worktree 是 865，**差值正好等於插入行數**。
865 對 cycle 2 站的位置是對的，改成名稱引用比改行號更正確。
G2 成立且引錯的是**檔名**——`design.md` 全檔 `補造`、`批次` 皆零命中。
G3 的五個情境我全跑過：**B3 的檢查①完全通過、只有檢查②開火**，這一格證明兩項缺一不可；
**A／A2 放行**，新判準沒有變成永遠停住；舊前置則在五個情境全部放行，含三種掉列。

**本輪最重要的不是這三筆。** 被問到「三族完整了嗎」——**不完整**。
第四族是「引用另一張票、只寫 feature 編號」，它的失效模式是**被引用的票狀態變了**，
三條邊界宣告一條都擋不住，因為三條都假設引用對象是「內容穩定、只有位置會變的檔」。

而第四族現在正咬著這張票：**feature 044 已於 2026-09-21 完成、`verdict: PASSED`、
`score: 0.96`、已歸檔到 `_archive/`**，但票內仍寫「044 的前置…目前不存在」「鏈條頭卡住」。
三個選項因此全部失真：選項 A（建議）的代價「040 合併再延一輪、要多開一個帳號」**已經付掉**；
選項 B——豁免 `operations.md:12` 的 probe 但書、直接在正式表部署，票內自己標為「**部分不可逆**」、
「錯誤發生在 40 筆已上線內容的唯一來源上」——**已經沒有理由**。
044 的 AC-3 逐字是「投稿者對八個審核欄位一格都改不到」，與 050 的 AC-3／AC-4 同一命題。
真正還開著的只剩 040 Out of scope 的後半句「**並由 captain 確認**」。
**這一條需要 captain 在解那個 🔴 之前先看到**；我前兩輪也沒查到，因為我同樣只盯著 `檔名:行號`。

另兩筆較輕：**H3** 步驟 6 把整列刪除推給 043，但 043 `status: design`、標題仍掛
「待captain確認脈絡」、門檻「初步建議兩成」尚未定案——刪 1 列／40 列是 2.5%，
**即使 043 做出來也擋不住**；這張票自己的 S3 檢查②反而抓得到。
**H4** 跨檔行號的例外清單漏了只在 040 branch 的兩個檔，建議比照 044 釘 commit。

## Stage Report: implement (cycle 4)

- DONE: H1 事實更新（最優先，captain 正在部署）把 044 的 `status: complete`／`verdict: PASSED`／`score: 0.96`／`completed: 2026-09-21T18:35:02Z`／`pr: pr-merge:36`／已歸檔寫進相依關係節，取代「目前不存在／鏈條頭卡住」（原句保留）；重寫三個選項；寫明 `operations.md:12` 的保護邊界觸發條件已滿足、AC-4 的第二個 Google 帳號前置已過期；寫明真正還開著的只剩 040 Out of scope 的後半句。**不得自行解 🔴，不得代 captain 確認。**
  「相依二」的「但這個判定會造成僵局」之後加一則 ⚠️ 事實更正，**原本那兩句「前置目前不存在」「鏈條頭卡住」逐字保留**，下面以表列出 044 的六個 front matter 欄位。另查出一件 FO 沒提的事：歸檔 commit `66ed939` **是本 branch HEAD 的祖先**——這個事實在本票這條 branch 上一直看得到，只是沒有人重讀。三個選項已重寫：**A** 的代價改為「已完成，無額外代價」；**B** 改為「前提已消失——它的唯一好處是省下等 044 的時間，而 044 已做完」；**C** 同樣改為「前提已消失，沒有東西要等」。**原始三句代價措辭另以 ⚠️ 保留供追溯**，並明寫「B 的原始代價敘述仍然成立，而它的好處已經歸零，選 B 等於拿那 40 筆去換一個已經不用付的成本」。`operations.md:12` 與 AC-4 前置兩段各自寫明已滿足／已過期。**還開著的部分用兩列表拆開**：「隔離測試表完成驗證」✅ 已滿足、「並由 captain 確認」🔴 仍在 captain 手上。另更正三處連帶的 044 敘述：步驟 4 的「前置：feature 044 的裁決」、design stage Out of scope 的「不執行 044」（加註原句保留）、Documentation impact 的 044 那一列（044 已歸檔到 `_archive/`，而 `_archive/` 依 `AGENTS.md` 不動，該列已無法執行，改記為本票「相依二」）。
  **🔴 未解、未代確認、`## Acceptance criteria` 整段逐位元組未動**——AC-4 前置已過期這件事寫在「相依二」，沒有寫進 AC-4。
- DONE: H2 補第四族（引用另一張票、只寫 feature 編號）與其檢查方式，講清楚它與前三族是不同種類的漂移，並掃一次全票有沒有其他第四族引用、逐一重讀其現在的 `status`。
  第九節的三條邊界宣告後加一則 ⚠️ 第四輪追加：**三條都有一個共同的隱含假設——被引用的對象是「內容穩定、只有位置會變」的檔**，而第四族違反的正是這個假設；它變的是**被引用對象的狀態**，所以三條邊界一條都擋不住，因為它們檢查的是行號。檢查方式寫明為**重讀被引用票的 front matter（`status`／`verdict`／`completed`／是否在 `_archive/`），不是讀行號**。另新增一小節「第四族：票對票的引用」，逐一列出全票 5 張被引用票的重讀結果：**`044` ⛔ 全部過期（H1）、`043` ⛔ 尚未定案（H3）、`040` ✅ 仍成立但尚未合併有後果（H4）、`042` ✅ 成立（只宣告本票不做，沒有推論 042 會做）、`065`／`066`／`049` ✅ 成立（是對 `git diff` 內容的歸屬描述，不是狀態推論）**。另說明 `041` 三處與 `045` 都不是票對票引用（一處是 sha256 裡的數字誤判，兩處是對 `design.md` 修訂紀錄內容的陳述）。
  並寫進失效模式的關鍵差異：**前三族壞掉時讀者會發現**，因為他看到不相干的內容；**第四族壞掉時句子讀起來完全合理**——「044 的前置目前不存在」是通順、具體、有證據感的句子，不指向任何會露餡的位置，所以三輪掃描與三個 reviewer 都讀過它而沒有起疑。唯一的檢查方式是把那張票打開重讀。
- DONE: H3 把「由 feature 043 在同步端擋」改為「043 尚未定案，且其跌幅門檻擋不住單列誤刪；本票的防線是 S3 的檢查①②」。防線不改。
  「已知未解」那一段加 ⚠️ 更正並**保留原句**：重讀 043 的 front matter 得 `status: design`、標題仍掛「待captain確認脈絡」、`source` 寫「脈絡待確認後再決定**是否進行**」。另實讀 043 的門檻條文——`043-sync-row-drop-threshold.md:52` 逐字為「**門檻設多少。** 初步建議兩成」，而誤刪 1 列／40 列 ＝ **2.5%**，遠在門檻之下，**即使 043 做出來也擋不住**。明寫本票的防線是 S3 的檢查①②、S9 會再跑一次。**S3 區塊逐位元組未動**（防線本身沒改，改的只是那句會讓人以為已有人接手的話）。
- DONE: H4 把 `approval-workflow.gs`（9 處）與 `operations.md` 納入跨檔行號例外清單並比照 044 釘 commit。
  「相依一」新增一小節，把 040 branch 上**三個**檔（不是兩個）的行號釘在 commit `a51b5d9`，附 sha256 與行數表，並寫明取出方式與「為什麼要釘」（三檔不在 main、只活在 040 branch，而 040 `status: review`、`completed:` 空白、尚未合併）。
  **沒有照抄 044 的 `093cd01`，因為照抄會錯。** 實查三檔在兩個 commit 的 sha256：`.gs`（`cd380aee1071…`、263 行）與 `operations.md`（`a01a0d47237e…`、79 行）**兩個 commit 相同**，所以兩份記錄互相印證；**但 `sync-content.mjs` 不同**——`093cd01` 是 807 行且 `publishedRowSequences` **根本不存在**（第 392 行是另一條敘述），`a51b5d9` 是 824 行、該函式在第 392 行。**本票的 `:392` 只在 `a51b5d9` 成立**，所以三檔一律釘 `a51b5d9`。另把 main 版 `sync-content.mjs` 的 9 處行號另計並釘 `main` ＝ `49e875c`（`ff30b8bda476…`、729 行），並寫明它會因為本票步驟 9 合併 040 而整份換掉。
  falsifying change：把 `.gs` 的釘選改成 `093cd01` 仍然正確（同位元組），但把 `sync-content.mjs` 的釘選改成 `093cd01`，`:392` 就指到一條不相干的敘述、`publishedRowSequences` 整個找不到——這證明「比照辦理」在這裡會壞掉，而 17 行的差異本身就是 H4 論點（040 未合併、檔案真的會動）的直接證據。
- DONE: 未越界。
  **正式試算表零寫入零讀取**（本輪未發出任何 HTTP 請求、未跑任何同步）。**`## Acceptance criteria` 整段逐位元組未動**。**S7／S8／S3 三個區塊逐位元組未動**。承重數字 24／9／15／59／12／6 原值保留。**`### Feedback Cycles` 逐位元組未動、`- Cycle` 行數維持 1**，未代 FO 補寫。verify cycle 3 整段逐位元組未動。整條 branch 只動 `docs/constitution-features/050-ssot-approval-deployment.md` 一個檔；`git diff --stat $(git merge-base main HEAD) -- src/ scripts/` 無輸出；`src/data/*.json` sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`；未跑 `sync-content`；040 worktree `git status` 為空、HEAD 仍為 `a51b5d9`。diff 基準自算 ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。未用 `sort`／`uniq` 判定中文字串，未用 `awk`。

### Summary

四筆按 FO 授權修完。**H1 只做事實更新——🔴 仍在票內未解，也沒有代 captain 確認任何一半。**

**H1 是最要緊的一筆，因為 captain 正在部署，而票內那三個選項全部失真。**
044 已於 2026-09-21 完成、PASSED、score 0.96、歸檔。票內卻還寫「前置目前不存在、鏈條頭卡住」。
三個選項的代價全部重寫：A「已完成，無額外代價」、B 與 C「前提已消失」。
B 值得單獨講：票內自己把它標為「部分不可逆」、錯誤會發生在 40 筆已上線內容的唯一來源上，
而它的唯一好處是省下等 044 的時間——**那個時間已經不用等了**。
原句與原始三句代價措辭全部保留供追溯。
**真正還開著的只剩一半**：040 Out of scope 是「隔離測試表完成驗證**並由 captain 確認**」兩個條件，
前一半 044 做完了，後一半仍在 captain 手上。

**H2 是這一輪的方法收穫，我把它做滿了。** 第四族是「引用另一張票、只寫 feature 編號」，
它與前三族的差別不是程度而是種類：**變的是被引用對象的狀態，不是位置**，
所以三條邊界宣告一條都擋不住。全票 5 張被引用票逐一重讀 front matter：
044 過期、043 過期、040 仍成立、042 成立、065／066／049 成立。
最值得記下的是失效模式——前三族壞掉時讀者會看到不相干的內容因而發現；
**第四族壞掉時句子讀起來完全合理**，所以它躲過了三輪掃描與三個 reviewer。

**H4 我沒有照抄 044 的 commit，因為實查發現照抄會錯。**
`.gs` 與 `operations.md` 在 `093cd01` 與 `a51b5d9` 是同一份位元組，
但 040 的 `sync-content.mjs` 在 `093cd01` 只有 807 行、**`publishedRowSequences` 根本不存在**，
本票的 `:392` 只在 `a51b5d9`（824 行）成立。所以三檔一律釘 `a51b5d9`。
那 17 行的差異本身就是 H4 論點的證據：040 還沒合併，它的檔案真的會動。

**H3 改的只是一句話。** 「由 feature 043 在同步端擋」會讓人以為已有人接手，
而 043 `status: design`、標題還掛著「待captain確認脈絡」、source 寫「再決定是否進行」。
就算做出來也擋不住：門檻是「初步建議兩成」，刪 1 列／40 列 ＝ 2.5%。
**防線沒有改，S3 區塊逐位元組未動**——防線一直是 S3 的檢查①②。

## verify stage 第四輪：H1-H4 修正複驗（2026-09-24）

diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。
**本輪對正式試算表零存取。**

### 一、H4 —— 最該親手驗的一格：**implement 是對的，照抄 044 會錯**

`git show` 兩個 commit，逐項實測：

| 檔 | `093cd01` | `a51b5d9` | 相同？ |
|---|---|---|---|
| `approval-workflow.gs` | sha256 `cd380aee1071…`、263 行 | 同 | ✅ 同一份位元組 |
| `operations.md` | sha256 `a01a0d47237e…`、79 行 | 同 | ✅ 同一份位元組 |
| `sync-content.mjs`（040 版） | `c2a8b978ade6…`、**807 行** | `7e9ab0587035…`、**824 行** | ⛔ 不同（差 17 行） |

**關鍵那一格成立：**

```
093cd01: grep publishedRowSequences → 0 次命中（根本不存在）
         第 392 行 = if ((record[field] || '').trim() === '') addError(…`核可紀錄缺少 ${field}。`);
a51b5d9: 392:function publishedRowSequences(records, sheetKey) {
         403:  const sequences = sheetKey === SHEET_KEYS.TRACK_2 ? publishedRowSequences(…)
```

**若照抄 044 的 `093cd01`，票內的 `sync-content.mjs:392` 會指到一條不相干的敘述。**
implement 拒絕照抄是對的，釘 `a51b5d9` 才正確。
`.gs` 的 9 處行號在 `a51b5d9` 我逐一實讀，全部仍對（5／6／12／79／127／144／159／219／220）。

**雙軌釘法不會讓人混淆。** main 版釘 `49e875c`（我實測 `49e875c` **就是現在的 main**，
blob sha256 `ff30b8bda476…`、**729 行**，抽驗第 94／112／123 行全對）。兩組用四種方式區分開：
**commit 不同、sha256 不同、行數不同（824 對 729）、而且票內把屬於 main 版的 9 個行號逐一列名**。
光是 824 對 729 就足以辨認。票內另寫明 main 版「會因為步驟 9 合併 040 而整份換掉」——這是誠實且正確的。

引用處數也對：`approval-workflow.gs` 9 處、`operations.md` 3 處（`:12`／`:13`／`第 15-25 行`——
`:13` 是 cycle 3 修 G2 時新增的）、040 版 `sync-content.mjs` 2 處（`:84-93`／`:392`）。

### 二、H1 —— 六個欄位、祖先關係、兩列表拆法，全部成立

**044 的六個 front matter 欄位逐字正確**（實讀 `_archive/044-approval-permission-two-account-probe.md`）：
`status: complete`／`verdict: PASSED`／`score: 0.96`／`completed: 2026-09-21T18:35:02Z`／
`pr: pr-merge:36`／檔案位於 `_archive/`。

**祖先關係成立，而且比 implement 說的更強。**
`66ed939` 不只是 HEAD 的祖先，**它也是 merge-base `384ca7a3c` 的祖先**
（`git merge-base --is-ancestor` 兩次皆真），歸檔時間 `2026-09-21 11:35:03 -0700`。
也就是說：**044 已完成這件事，從本 branch 的第一個 commit 起就看得到**，
`git show HEAD:…/_archive/044-….md | grep status` 直接就是 `status: complete`。
三輪 implement、三輪 verify 都沒有人打開它。票內已如實寫下這一點。

**兩列表的拆法忠於 040 的原文。** 實讀 `040-approval-content-version-binding.md:290`：

> 不上線正式 SSOT 設定，直到隔離測試表完成驗證並由 captain 確認。

「直到〔隔離測試表完成驗證〕**並**〔由 captain 確認〕」——**確實是兩個條件**，拆法正確。
第 292 行的上下文也支持：captain 於 2026-09-04 裁決 worker 無法完成該驗證、改由 044 承接。

**三個選項重寫正確，B 那一格尤其誠實**：票內明寫「**B 的原始代價敘述仍然成立，而它的好處已經歸零**」，
並保留原始三句措辭供追溯。這個寫法沒有把 B 說成「安全了」，而是說它「沒有理由了」——
**這是兩件不同的事，票內分得很清楚。**

**🔴 未解、未代 captain 確認**：票內明寫「本輪只做事實更新，不解這個 🔴，也不代 captain 確認」，
兩列表的第二列仍是 🔴。`## Acceptance criteria` 整段與 cycle 4 前一版 **逐位元組相同（7009 bytes）**
——AC-4 前置已過期這件事寫在「相依二」，沒有寫進 AC-4。**處置正確。**

**三處連帶更正都在，而且我另查了三個沒被改的地方，其中兩個確實不該改：**

| 位置 | 現況 | 判斷 |
|---|---|---|
| 步驟 4 前置 | 已改為「044 **已於 2026-09-21 完成並 PASSED**…仍待 captain…確認」 | ✅ 正確 |
| design stage Out of scope「不執行 044」 | 原句保留＋註「現在的理由是它做完了，不是它還沒開始」 | ✅ 正確 |
| Documentation impact 的 044 列 | 刪除線＋「已無法執行」（044 已歸檔，`_archive/` 依 `AGENTS.md` 不動） | ✅ 正確 |
| `## Problem`「044 只做隔離測試表的 probe，不碰正式表」 | 未改 | ✅ **本來就不該改**，這句現在仍然為真 |
| `## 相依關係`「兩者不互為前置」 | 未改 | ✅ **本來就不該改**，它下方已有 design stage 的 ⚠️ 更正塊 |
| `## Risk evidence`「`no spike needed` 不成立，但 spike 的形式…（即 feature 044）」 | 未改 | ⚠️ **可能是第四處**——見下方 J2 |

**另查一件沒人提的事，結論是「不適用」，記下來免得下一輪再查一次。**
040 的 Out of scope 第 292 行還有第三個元素：「受保護欄位的 trigger 寫入路徑維持 `UNPROVEN`」，
兩列表沒有涵蓋它。我查了它對本票有沒有影響：
`approval-workflow.gs` 的 `ScriptApp`／`newTrigger`／`onEdit`／`onChange` **全部零命中**，
`appsscript.json` 也沒有宣告任何 trigger——本票裝的是 `onOpen` 起的 `Review` **選單**，不是 installable trigger。
（044 那個 `probe-trigger.gs` 是它自己的臨時探針，步驟 12 做完就刪掉了。）
**所以 UNPROVEN 的 trigger 路徑不在本票的路徑上，兩列表不涵蓋它是對的，不是遺漏。**

### 三、H2 —— 第四族的掃描完整，失效模式的解釋也準確

**我自己重跑了一次掃描**（抓出票內每一個三位數票號，用 `Map` 去重）。
出現的票號：`040`／`041`／`042`／`043`／`044`／`045`／`049`／`050`／`065`／`066`。
扣掉 `050`（本票自己）、`041` 與 `045`（implement 已說明不是票對票引用，我複核同意——
`041` 有一處確實是 sha256 字串裡的數字造成的誤判），
**被引用並據以推論的正好就是那 5 張：`044`／`043`／`040`／`042`／`065`＋`066`＋`049`。
集合完整，與 implement 的表逐列相符。**

**失效模式的解釋準確，我再補一層。** implement 寫：

> 前三族壞掉時讀者會發現，因為他看到不相干的內容；第四族壞掉時句子讀起來完全合理。

這個解釋成立，而且我手上有支持它的證據：**我前三輪查出的每一個前三族錯誤，都是「走到那個位置、看到不對的東西」才發現的**
——`TODO.md:127` 是空行、`040-…:221` 是空行、本票第 50 行是空行、
`editor-onboarding.md:430` 是另一句話、`design.md` 的 `補造` 零命中。**五個全都是位置暴露了自己。**
第四族沒有位置可走，「044 的前置是一份隔離測試表 + 兩個 Google 帳號，這兩項卡在人不卡在程式，目前不存在」
是通順、具體、有證據感的句子。

**我要修正的只有一點措辭**：前三族真正的優勢不是「讀者會發現」——不去查的讀者一樣被騙。
真正的差別是**「存不存在一個機械式的檢查」**：
前三族查位置、第四族查被引用票的 front matter、**第五族（見下）連查都無從查起**。

### 四、H3 —— 成立

`043-sync-row-drop-threshold.md:52` 逐字為：

```
1. **門檻設多少。** 初步建議兩成。太鬆擋不住誤刪，太緊會在正常下架內容時誤擋。
```

`status: design`、標題仍掛「待captain確認脈絡」。
**2.5% 的推論成立**：刪 1 列／40 列 ＝ 2.50%，遠低於兩成。即使 043 照現在的設計做出來也擋不住。
**S3 區塊逐位元組未動（4311 bytes）**——防線沒被改，只改了步驟 6 那句措辭。

### 五、本輪的新發現：**第五族**

**J1（Polish，但其中一項帶 deferred risk）第五族：指涉一張沒有編號、而且不存在的票。**

被問到「有沒有不寫 feature 編號、只用敘述指涉另一張票的引用」。**有，票內三處：**

| 位置 | 原句 | 那張票存在嗎 |
|---|---|---|
| 步驟 1 的說明框 | 「`TODO.md` 的 P3-7 記載 `chapter` 設計已被放棄，**那是另一張票要處理的事**，本票不動它」 | ⛔ **不存在。** 沒有任何 feature 的 `title` 含 `chapter`；全 `docs/constitution-features/` 只有 040 與本票提到 `chapter`。P3-7 是 `TODO.md` 的條目，不是票 |
| design stage Out of scope | 「**這個落差要記成後續票**：往後任何人在試算表加中文說明或改標題寫法，Apps Script 可能無聲失效」 | ⛔ **不存在。** 沒有任何 feature 的 `title` 含 alias／別名；除本票外只有 `012` 提到「別名」且與此無關。**這句話本身是一個沒有被執行的指令** |
| Out of scope | 「不處理標題列與整列刪除的保護範圍（**另議**）」 | ⛔ **沒有票。** `043` 是**同步端**的刪列跌幅偵測，不是**試算表端**的保護範圍，機制不同；而且 043 自己還沒定案（見 H3） |

**為什麼這一族在這張票上特別刺眼**：本票的 `## Problem` 第 31 行自己寫著
「**這些人工步驟目前沒有任何票、沒有任何人負責**，而 040 已走到最後一道 gate」
——**050 存在的理由，就是有人用「另議」把事情擱著而沒有票、沒有負責人。**
而本票現在用同一種方式擱下三件事。

**失效模式比第四族更難查**：第四族至少有一個票號可以打開重讀；
**第五族沒有編號可查，掃描再完整也掃不到它**——只能問「這句話承諾的東西，實際上存在嗎」。
- 已釋出使用者與正常流程：往後任何人讀 Out of scope，以為這三件事已有人接手。
- 可觀察到的損害：目前為零（三件事都確實不在本票範圍）。風險在於它們無人接手且不會被任何檢查發現。
  其中**別名表那一項帶 deferred risk**：本票正要 captain 輸入含中文說明的標題，
  而 `approval-workflow.gs` 沒有別名表——本票已實測目前這批標題兩支程式都通過，
  但往後任何人改標題寫法，Apps Script 可能無聲失效。升級條件：有人在部署後改動任一標題字串。
- 影響的 AC 或不可協商邊界：無。
- 觸發證據：上表三列的 `grep -l '^title:.*chapter'`／`'^title:.*\(alias\|別名\)'` 皆零命中；
  `043` 的 `title` 為「大量刪列時同步不出聲」。
- 提議：**Polish**／任務內／`fix`（把三處「另一張票」「後續票」「另議」改成
  **具體票號，或「尚無票，負責人未定」的明白話**——後者至少讓缺口可見，
  這正是本票 `## Problem` 對 040 做過的事）。

**J2（Polish）`## Risk evidence` 可能是第四處該註記 044 的地方。**
該節首句是「`no spike needed` 不成立，但 spike 的形式是**在隔離測試表上先跑一次**（即 feature 044）」。
**這句話沒有錯**——它說的是 spike 的形式，不是 spike 的狀態。
但 `## Risk evidence` 這一節的用途就是回答「風險現在如何」，
而讀者在這裡只會讀到「需要一個 spike」，讀不到「那個 spike 已經做完而且 PASSED」。
已更正的三處都是**前置／動作**語境，這一處是**風險狀態**語境，性質不同。
- 可觀察到的損害：極小。相依二已完整記載，且步驟 4 的前置已更新。
- 提議：**Polish**／任務內／`fix`（加一句「該 spike 已由 044 於 2026-09-21 完成並 PASSED，見相依二」）。
- **同時記下我查過但認為不該改的兩處**：`## Problem` 的「044 只做隔離測試表的 probe，不碰正式表」
  現在仍為真；`## 相依關係` 的「兩者不互為前置」下方已有 design stage 的 ⚠️ 更正塊。**這兩處維持原狀是對的。**

### 六、未越界

| 項目 | 結果 |
|---|---|
| diff 基準 | **自算** `384ca7a3c…` |
| 整條 branch／cycle 4 動到的檔 | 都只有 `050-ssot-approval-deployment.md` 一個 |
| `src/`、`scripts/` | **零變動** |
| `src/data/*.json` | main／050 HEAD／工作區**三者 sha256 相同** |
| `npm run sync-content` | 未執行 |
| 040 worktree | `git status` 空，HEAD 仍 `a51b5d9`（四輪皆同） |
| 正式試算表 | **零寫入零讀取** |
| `## Acceptance criteria` | ✅ 逐位元組未動（7009 bytes） |
| S3／S7／S8 | ✅ 逐位元組未動（4311／593／759 bytes） |
| `### Feedback Cycles` | ✅ 逐位元組未動（3689 bytes），`- Cycle` 行數 **＝ 1** |
| **我自己的 verify cycle 1／2／3 各段** | ✅ **全部逐位元組未動**（17546／35218／22782 bytes） |
| 承重數字 | 24／9／15／59／12／6 及 27 列、`d3`、「其後 13 列」**出現次數與內容皆未變** |

### 七、裁決

**PASSED。**

H1–H4 四筆都驗過，四筆都是真的修正。**H4 那一格 implement 是對的**：
`093cd01` 只有 807 行、`publishedRowSequences` 根本不存在、第 392 行是另一條敘述；
照抄 044 的 commit 會讓票內 11 處行號指偏。釘 `a51b5d9` 正確，雙軌釘法也不會混淆。
H1 的六個欄位逐字正確，祖先關係比宣稱的更強（連 merge-base 都看得到），
兩列表忠於 040 原文，**🔴 未解、AC 逐位元組未動**。
H2 的 5 張票集合我重跑後完整，失效模式的解釋準確。H3 成立。

**新發現是第五族：指涉一張沒有編號、而且不存在的票**（票內三處）。
它比第四族更難查——第四族至少有票號可以打開重讀，第五族沒有東西可查。
**而這件事在這張票上特別刺眼**：050 自己的 `## Problem` 就寫著
「這些人工步驟目前沒有任何票、沒有任何人負責」，那正是它被開出來的理由；
現在它用同樣的方式擱下三件事。建議改成具體票號，或明白寫「尚無票、負責人未定」。

## Stage Report: verify (cycle 4)

- DONE: H4（本輪最該親手驗的一格）`git show 093cd01:scripts/sync-content.mjs` 與 `a51b5d9` 比對——確認行數、`publishedRowSequences` 的有無與位置；判斷雙軌釘法會不會混淆。
  **implement 是對的，照抄 044 的 commit 會錯。** 實測：`093cd01` = `c2a8b978ade6…`、**807 行**、`grep publishedRowSequences` **0 次命中**，第 392 行是 `addError(…核可紀錄缺少 ${field}。)`；`a51b5d9` = `7e9ab0587035…`、**824 行**、`392:function publishedRowSequences(records, sheetKey) {`。**若照抄，票內 `sync-content.mjs:392` 會指到不相干的敘述。** `.gs`（`cd380aee1071…`、263 行）與 `operations.md`（`a01a0d47237e…`、79 行）兩個 commit 確為同一份位元組，票內所有 sha256 與行數逐項相符，824−807＝17 也對。`.gs` 的 9 處行號在 `a51b5d9` 逐一實讀全對。**雙軌釘法不會混淆**：`49e875c` 我實測就是現在的 main（`ff30b8bda476…`、729 行，抽驗第 94／112／123 行全對），兩組以 commit／sha256／行數（824 對 729）／逐一列名四種方式區分，且票內寫明 main 版會因步驟 9 合併而整份換掉。引用處數 9／3／2 也核對正確（`operations.md:13` 是 cycle 3 修 G2 時新增的第三處）。
- DONE: H1 驗六個 front matter 欄位、三個選項代價、兩列表忠於 040 原文、三處連帶更正有無第四處、歸檔 commit 的祖先關係；確認 🔴 未解、未代確認、AC 整段逐位元組未動。
  六個欄位**逐字正確**。**祖先關係比宣稱的更強**：`66ed939` 不只是 HEAD 的祖先，**也是 merge-base `384ca7a3c` 的祖先**（`--is-ancestor` 兩次皆真），即 044 已完成這件事**從本 branch 第一個 commit 起就看得到**，票內已如實寫下。兩列表**忠於原文**：實讀 `040-…:290`「直到隔離測試表完成驗證**並**由 captain 確認」確為兩個條件，第 292 行的 2026-09-04 裁決脈絡也支持。三個選項重寫正確，**B 那格特別誠實**——明寫「原始代價敘述仍然成立，而好處已歸零」，沒有把 B 說成「安全了」。**🔴 未解、未代確認**，`## Acceptance criteria` **逐位元組未動（7009 bytes）**，AC-4 前置過期一事寫在相依二而非 AC-4。三處連帶更正都在；另查三處未改的，`## Problem` 與 `## 相依關係` **本來就不該改**（前者仍為真、後者下方已有 ⚠️ 更正塊），`## Risk evidence` 可能是第四處（J2）。另查 040 第 292 行的第三個元素「trigger 寫入路徑維持 UNPROVEN」對本票是否適用：`.gs` 的 `ScriptApp`／`newTrigger`／`onEdit` **全零命中**、`appsscript.json` 未宣告 trigger，本票裝的是 `onOpen` 起的選單——**不適用，兩列表不涵蓋它是對的**。
- DONE: H2 自己重跑第四族掃描，判斷 5 張票的集合完整嗎；找有沒有第五族；判斷失效模式的解釋是否準確。
  **集合完整。** 自行抓出票內全部三位數票號並以 `Map` 去重，得 `040`／`041`／`042`／`043`／`044`／`045`／`049`／`050`／`065`／`066`；扣掉本票與 `041`／`045`（複核同意不是票對票引用，`041` 有一處確為 sha256 數字誤判），**被引用並據以推論的正好是那 5 張，與 implement 的表逐列相符**。失效模式的解釋**準確**，並有我自己的證據支持：前三輪查出的每一個前三族錯誤都是「走到位置、看到不對的東西」才發現的（三處空行、一句別的話、一次零命中）——**五個全都是位置暴露了自己**。唯一要修正的措辭：真正的差別不是「讀者會不會發現」（不去查的讀者一樣被騙），而是**存不存在機械式的檢查**——前三族查位置、第四族查 front matter、第五族無從查起。**第五族存在（J1）**：票內三處以敘述指涉一張沒有編號、而且不存在的票。
- DONE: H3 確認 `043-…md:52` 逐字、2.5% 推論、S3 逐位元組未動；未越界全項。
  `043-…md:52` 逐字為「1. **門檻設多少。** 初步建議兩成。太鬆擋不住誤刪，太緊會在正常下架內容時誤擋。」，`status: design`、標題仍掛「待captain確認脈絡」。2.5%（1／40）遠低於兩成，**推論成立**。**S3 逐位元組未動（4311 bytes）**——防線沒改，只改步驟 6 的措辭。未越界全項通過：整條 branch 與 cycle 4 都只動票檔；`src/`／`scripts/` 零變動；`src/data/*.json` 三者 sha256 相同；未跑 `sync-content`；040 worktree 空且 HEAD 仍 `a51b5d9`；**正式試算表零寫入零讀取**；**S7／S8 逐位元組未動（593／759 bytes）**；**`### Feedback Cycles` 逐位元組未動（3689 bytes）、`- Cycle` 行數 ＝ 1**；**我自己的 verify cycle 1／2／3 三段全部逐位元組未動**（17546／35218／22782 bytes）；承重數字 24／9／15／59／12／6 及 27 列、`d3`、「其後 13 列」出現次數與內容皆未變；diff 基準自算；未用 `sort`／`uniq` 判定中文，未用 `awk` 做判斷。

### Summary

H1–H4 四筆都是真的修正。**H4 那一格 implement 是對的，而且它拒絕照抄 FO 的提示是正確判斷**：
`093cd01` 只有 807 行、`publishedRowSequences` **根本不存在**、第 392 行是另一條敘述；
照抄會讓票內 11 處行號指偏。釘 `a51b5d9` 正確，雙軌釘法以四種方式區分，不會混淆。

H1 的六個 front matter 欄位逐字正確，**祖先關係比它宣稱的更強**——`66ed939` 連 merge-base 都是它的後代，
所以「044 已完成」從本 branch 第一個 commit 起就看得到，只是六輪沒有人打開它。
兩列表忠於 040 原文（「直到 X **並** 由 captain 確認」確為兩個條件），
**🔴 未解、未代 captain 確認、`## Acceptance criteria` 逐位元組未動**。
另查 040 第 292 行第三個元素「trigger 寫入路徑維持 UNPROVEN」對本票不適用
（`.gs` 零 trigger、裝的是選單），**兩列表不涵蓋它是對的，不是遺漏**——記下來免得下一輪再查一次。

H2 的 5 張票集合我重跑後**完整**；失效模式的解釋**準確**，我只修正一點措辭：
差別不在「讀者會不會發現」，而在**存不存在一個機械式的檢查**。

**新發現是第五族：指涉一張沒有編號、而且不存在的票**——票內三處
（廢除 `chapter` 的「另一張票」、Apps Script 缺別名表的「後續票」、保護範圍的「另議」），
三處查證後都**沒有對應的票**。它比第四族更難查：第四族至少有票號可以打開重讀，
第五族連查都無從查起。**而這件事在這張票上特別刺眼**——050 自己的 `## Problem` 就寫著
「這些人工步驟目前沒有任何票、沒有任何人負責」，那正是它被開出來的理由。
建議改成具體票號，或明白寫「尚無票、負責人未定」，讓缺口至少是可見的。
另一筆 **J2** 較輕：`## Risk evidence` 可能是第四處該註記 044 的地方
（該節專講風險狀態，而讀者在那裡讀不到 spike 已完成）；
同時記下我查過、認為**不該改**的兩處，免得下一輪重複勞動。

## Stage Report: implement (cycle 5)

- DONE: J1 三處「另一張票／後續票／另議」改成具體票號，或「尚無票，負責人未定」的明白話。**不開新票**（範圍決定屬 captain），工作是讓缺口可見。
  三處都改完，**原句一律保留**。查證方式是讀 `docs/constitution-features/` 下**全部 66 張票**（含 `_archive/`）的 `title` 與 `status`：**沒有任何一張票涵蓋這三件事**，verify 的三筆判定全部成立。(1) **`chapter`**：改為「廢除 `chapter` 目前尚無 feature 票，負責人未定」，指向它唯一的落腳處 `TODO.md` 的 **P3-7**，**以名稱引用、不寫行號**（理由見第十節）；另寫明**本票反而讓它更難處理**——本票新建的空白 `chapter` 欄從此有技術用途，廢除它要連 `approval-workflow.gs` 一起改。(2) **Apps Script 別名表**：改為「這個落差目前尚無票，負責人未定」，並點明原句「要記成後續票」**本身是一個沒有被執行的指令**。(3) **保護範圍**：改為「整列刪除的保護目前尚無票，負責人未定」，並寫明**它不是 `043`**——043 是**同步端**刪列跌幅偵測（列已被刪之後才察覺），這裡缺的是**試算表端**保護（讓列一開始就刪不掉），時機與機制都不同，且 043 自己 `status: design`、尚未決定是否進行。
- DONE: J1 第二處另寫 promote-to-material 條件，並寫明本票已實測目前這批標題兩支程式都通過。
  這一項的觸發條件**正是 captain 現在在做的事**，所以票內同時寫了兩面，避免讀者只讀到一半。**現況安全**：第三節與第四節已實測，照票內建議輸入的 18／21／12 個標題字串（含中文說明）**同時通過 `resolveApprovalHeaders_` 與 040 新版同步**，輸出與純欄名版本逐字相同（證據 4 亦同）——**captain 現在照票輸入的這批標題是安全的**。**風險在之後**：`approval-workflow.gs` 沒有別名表（`approval-workflow.gs:127-144`，釘在 commit `a51b5d9`）而 `sync-content.mjs` 有，兩支程式容忍度不同。**升級為 Material 的條件：有人在部署後改動三個分頁上任何一個標題字串**——屆時 Apps Script 可能無聲失效而同步程式仍然通過，**兩邊不會互相提醒**。
  順帶更正一處綁在一起的說法（落在同一個被指名的位置，未另開掃描）：Out of scope 原句是「不處理標題列**與**整列刪除的保護範圍」，但**本票只擱下其中一件**——標題列的保護本票**有做**（步驟 6 的 C 類、S7 的 `A1:R1`／`A1:U1`／`A1:L1`、AC-5），沒做的是整列刪除。所以「尚無票、負責人未定」只適用於整列刪除那一半。原句保留，更正寫在 ⚠️ 框內。另寫明本票對誤刪的替代防線是 S3 的檢查①②與 S9——**那是偵測不是預防**，抓到時列已經不見了，要靠 Google 試算表的版本記錄救回。
- DONE: J2 `## Risk evidence` 首句加一句「該 spike 已由 044 於 2026-09-21 完成並 PASSED，見相依二」。
  **原句逐字不動**（它說的是 spike 的**形式**，沒有錯），在其下加一則引言：該 spike 已由 feature 044 於 2026-09-21 完成並 PASSED（`score: 0.96`，已歸檔），詳見相依二；並點明原句講的是形式不是進度，避免下一輪有人把原句當成錯的再改一次。
- DONE: verify 判定不該改的兩處維持原狀。
  以區塊比對確認：`## Problem` 整節（含「feature 044 只做隔離測試表的 probe，不碰正式表」）與 `## 相依關係` 整節（含「兩者不互為前置」與其下方的 ⚠️ 更正塊）**兩節都逐位元組未動**。
- DONE: 收斂——不開新的掃描維度。
  本輪新增內容全部落在 J1 指名的三處、J2 指名的一處，加上第十二節的處置記錄。**沒有新增第六族**，沒有新的全票掃描表。讀 66 張票的 `title`／`status` 是為了查證 J1 三處的事實，不是新的掃描維度，這一點已寫進第十二節。
- DONE: 未越界。
  **正式試算表零寫入零讀取**（本輪未發出任何 HTTP 請求、未跑任何同步）。**未開新票、未解 🔴、未代 captain 確認**。**`## Acceptance criteria` 整段與 S3／S7／S8 三區塊逐位元組未動**；承重數字 24／9／15／59／12／6 原值保留。**`### Feedback Cycles` 逐位元組未動、`- Cycle` 行數維持 1**。verify 第四輪整段逐位元組未動。整條 branch 只動 `docs/constitution-features/050-ssot-approval-deployment.md` 一個檔；`git diff --stat $(git merge-base main HEAD) -- src/ scripts/` 無輸出；`src/data/*.json` sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`；040 worktree `git status` 為空、HEAD 仍為 `a51b5d9`。diff 基準自算 ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。未用 `sort`／`uniq` 判定中文字串，未用 `awk`。

### Summary

兩筆 Polish 做完，**沒有開新票、沒有開新的掃描維度**。

**J1 的三處，查證後 verify 三筆全部成立**——讀完 66 張票的 `title` 與 `status`，
沒有任何一張涵蓋廢除 `chapter`、Apps Script 別名表、或整列刪除的保護。
三處都改成「尚無票，負責人未定」的明白話，原句一律保留。
`chapter` 那一處指向它唯一的落腳處 `TODO.md` 的 P3-7，用名稱不用行號。

**Apps Script 別名表那一處我寫了兩面**，因為它的觸發條件正是 captain 此刻在做的事。
一面是「現在安全」：18／21／12 個含中文說明的標題已實測同時通過兩支程式。
另一面是 promote-to-material 條件：**有人在部署後改動任何一個標題字串**——
那一刻 Apps Script 可能無聲失效而同步程式仍然通過，兩邊不會互相提醒。
只寫其中一面都會誤導：只寫風險會讓 captain 以為現在就壞了，只寫安全會讓人忘記這個缺口。

**保護範圍那一處順帶更正了一個綁在一起的說法。** 原句寫「不處理標題列與整列刪除的保護範圍」，
但本票只擱下其中一件——**標題列的保護本票有做**（步驟 6 的 C 類、S7、AC-5），
沒做的是整列刪除。所以「尚無票」只適用於後者。這個更正落在 J1 指名的同一個位置，不是新掃描。
另寫明 `043` 補不上這一格：**它是同步端偵測，這裡缺的是試算表端預防**，
本票目前的替代防線（S3 的檢查①②與 S9）同樣是偵測不是預防。

**J2 原句一個字都沒改**，因為它說的是 spike 的形式而不是進度，本來就沒錯；
只在其下補一則引言說明該 spike 已由 044 完成並 PASSED，並點明這個區分，
免得下一輪有人把沒錯的句子當成錯的再改一次。
verify 判定不該改的兩處，以區塊比對確認逐位元組未動。

## verify stage 第五輪（收斂輪）：J1／J2 複驗（2026-09-24）

diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。
**本輪對正式試算表零存取。收斂輪，只驗 J1／J2，未開新的掃描維度。**

### 一、J1 —— 三處都真的變得可見

三處現在都明寫「**尚無票，負責人未定**」，原句保留。逐處複驗：

| 位置 | 現在寫什麼 | 我的查證 |
|---|---|---|
| 步驟 1 的 `chapter` 說明框 | 「廢除 `chapter` 這件事目前尚無 feature 票，負責人未定」，並點出**本票讓它更難處理**（新建了空白 `chapter`，廢除它要連 `.gs` 一起改） | ✅ 零命中 |
| design stage Out of scope 的別名表 | 「這個落差目前尚無票，負責人未定。原句『要記成後續票』**本身是一個沒有被執行的指令**」 | ✅ 零命中 |
| Out of scope 的「另議」 | 「整列刪除的保護目前尚無票，負責人未定」，並說明**它不是 `043`**（同步端偵測 vs 試算表端預防，機制與時機都不同） | ✅ 零命中 |

**「讀完 66 張票」的宣稱成立，而且 `_archive/` 有讀進去。**
我自己數：現役 30 個 `.md` ＋ `_archive/` 38 個 ＝ 68 個檔，
其中 `README.md` 不是票、`040-…md` 的 `id:` 在第 13 行（`head -8` 抓不到），
**扣掉後正好 66**——它數的是真正的票。
更重要的是實質結論我直接驗過：以 `title` 搜 `chapter`／`alias`／`別名`／`整列`／`保護範圍`，
**在現役與 `_archive/` 兩邊都是零命中**。三個缺口確實無人接手。

**別名表那一處寫兩面是正確的，而且是本輪最該寫兩面的一處。**
它的兩面各自有實測支撐，不是修辭：

- **現在安全**：第三、四節已實測，18／21／12 個含中文說明的標題**同時通過**
  `resolveApprovalHeaders_` 與 040 新版同步，輸出與純欄名版本逐字相同。
- **風險在之後**：`.gs` 沒有別名表、`sync-content.mjs` 有，兩支程式容忍度不同；
  promote-to-material 條件是「有人在部署後改動任何一個標題字串」。

理由（只寫風險會讓 captain 以為現在就壞了，只寫安全會讓人忘記這個缺口）**成立**。
而且票內誠實寫出「**這個條件現在就在觸發範圍內——captain 正在建欄與輸入標題**」,
這句話把一個 deferred risk 放在 captain 眼前而沒有誇大成擋路項，分寸是對的。

### 二、順帶那個更正：**正確，而且我同意 FO 的授權判定**

原句「不處理**標題列與整列刪除**的保護範圍（另議）」把兩件事綁在一起，
但**本票只擱下其中一件**。我自己查證標題列保護確實有做：

| 依據 | 內容 |
|---|---|
| 步驟 6 的 C 類 | 「三個分頁的第 1 列**全列**／只有 captain／改一個標題，整條產線停擺」 |
| S7 的 C 類欄 | `A1:R1`／`A1:U1`／`A1:L1`——**第 1 列全列**，三個分頁各一個範圍（我在第一輪自己算過這三個位置） |
| AC-5 | 「標題列受保護，非 captain 改不動」，`Verified by:` 三個分頁各測一次 |

**三者確實涵蓋標題列保護。沒做的只有整列刪除**（Google 試算表沒有直接對應的設定）。

**我同意「同一位置、同一病因，屬授權範圍」，理由有三個：**

1. **同一病因。** J1 的病因是「缺口不可見」。這句話的毛病是同一類的反面——
   它把一件**已經做了的事**混進缺口裡，讓缺口的範圍不準。兩者都是「這句話沒有如實描述現況」。
2. **它是把 J1 做對的必要條件。** J1 要求標明「整列刪除尚無票」，
   但原句的主詞是「標題列**與**整列刪除」。不拆開就會寫出自相矛盾的一段——
   一邊說這兩件事尚無票，一邊 S7 又有 `A1:R1`。**不拆開，J1 就修不乾淨。**
3. **它不擴張任何範圍。** 不加事、不減事、不碰任何 AC、不動任何承重數字，
   只把一個宣稱從兩項收斂成一項，而收斂後的那一項我已實測為真。
   方向上它**降低**風險：不拆開的話，讀者可能以為標題列保護沒人做，於是漏做或重做。

**而且原句本身一個字都沒改**，更正寫在其下的 ⚠️ 框裡。這是對的——記錄保留，判讀更新。

### 三、J2 —— 忠於我的提議

我提的是「**加一句**」而不是「改那句」。實測：`## Risk evidence` 的原句
（「`no spike needed` 不成立，但 spike 的形式是在隔離測試表上先跑一次（即 feature 044）…」）
**一個字都沒改**，其下新增一則引言，寫明 spike 已由 044 於 2026-09-21 完成並 PASSED，
並點出「上面那句講的是 spike 的**形式**，不是它的進度」。

**處置忠於提議，而且比我提的多做了一件有用的事**：
點明「形式 vs 進度」這個區分，等於替下一輪擋掉「把一句沒錯的話當成錯的再改一次」。

### 四、未越界

| 項目 | 結果 |
|---|---|
| diff 基準 | **自算** `384ca7a3c…` |
| 整條 branch／cycle 5 動到的檔 | 都只有 `050-ssot-approval-deployment.md` 一個 |
| **沒有開新票** | cycle 5 未新增任何票檔；現役 30／`_archive` 38，**與上一輪相同** |
| `src/`、`scripts/` | **零變動** |
| `src/data/*.json` | main／050 HEAD／工作區**三者 sha256 相同** |
| `npm run sync-content` | 未執行 |
| 040 worktree | `git status` 空，HEAD 仍 `a51b5d9`（五輪皆同） |
| 正式試算表 | **零寫入零讀取** |
| `## Acceptance criteria` | ✅ 逐位元組未動 |
| S3／S7／S8 | ✅ 逐位元組未動 |
| `### Feedback Cycles` | ✅ 逐位元組未動，`- Cycle` 行數 **＝ 1** |
| **我的 verify cycle 4 內容段與 stage report** | ✅ **逐位元組未動**（14213／7254 bytes） |
| **我判定不該改的兩處**（`## Problem`、`## 相依關係`） | ✅ **逐位元組未動**（940／598 bytes） |
| 承重數字 | 24／9／15／59／12／6 及「其後 13 列」出現次數與內容皆未變 |

### 五、裁決

**PASSED。收斂。**

J1 的三處都真的變得可見，「66 張票」的掃描宣稱我抽驗成立且確實含 `_archive/`，
別名表那一處寫兩面正確且兩面都有實測支撐。
順帶那個更正**事實正確、屬授權範圍**，而且不拆開的話 J1 根本修不乾淨。
J2 忠於提議——原句一字未改，只在其下補一則引言。

**沒有發現會擋住 captain 部署的東西，也沒有 Material 等級的缺陷。**
依收斂輪判準，**不再開新的掃描維度**。

**captain 部署前的狀態**：欄名、欄數（24＝9＋15）、列數（59＝40＋15＋4）、
保護範圍（12）、連續選取段（6）、`d3` 單一序號風險點——**五輪來原值未變、且每一項都被獨立重算過**。
S3 的兩項機器檢查已補上並實測（B3 證明缺一不可）。
唯一仍開著的是 040 Out of scope 後半句「**並由 captain 確認**」那一次確認，
以及三個已標明「尚無票、負責人未定」的缺口——**三者都不擋本票執行**。

## Stage Report: verify (cycle 5, 收斂輪)

- DONE: J1 抽驗「讀完 66 張票的 `title` 與 `status`、沒有任何一張涵蓋這三件事」，特別確認有沒有把 `_archive/` 讀進去；判斷別名表那一處寫兩面是否正確。
  **宣稱成立，`_archive/` 確實有讀進去。** 我自己數：現役 30 ＋ `_archive/` 38 ＝ 68 個 `.md`，扣掉 `README.md` 與 `040-…md`（其 `id:` 在第 13 行，`head -8` 抓不到）**正好 66**。實質結論我直接驗證：以 `title` 搜 `chapter`／`alias`／`別名`／`整列`／`保護範圍`，**現役與 `_archive/` 兩邊皆零命中**——三個缺口確實無人接手。三處現在都明寫「尚無票，負責人未定」且原句保留。**別名表寫兩面正確**：兩面各有實測支撐（現在安全＝18／21／12 個含中文說明標題實測同時通過兩支程式；風險在之後＝`.gs` 無別名表而 `sync-content.mjs` 有），理由成立，且誠實寫出「這個條件現在就在觸發範圍內——captain 正在建欄與輸入標題」，分寸正確。
- DONE: 判斷 implement 在 J1 位置順帶做的更正是否正確且未越界；自己確認 C 類／S7／AC-5 真的涵蓋標題列保護。
  **事實正確**：步驟 6 的 C 類（「三個分頁的第 1 列**全列**／只有 captain」）、S7 的 C 類欄（`A1:R1`／`A1:U1`／`A1:L1`，第 1 列全列，我在第一輪自己算過這三個位置）、AC-5（「標題列受保護，非 captain 改不動」，三個分頁各測一次）**三者確實涵蓋標題列保護**；沒做的只有整列刪除。**我同意 FO 的授權判定**，三個理由：① 同一病因——J1 的病因是「缺口不可見」，這句的毛病是同一類的反面（把已做的事混進缺口，讓缺口範圍不準）；② **它是把 J1 做對的必要條件**——原句主詞是「標題列**與**整列刪除」，不拆開就會寫出「這兩件事尚無票」卻又有 `A1:R1` 的自相矛盾；③ 不擴張任何範圍——不加事不減事、不碰 AC、不動承重數字，只把宣稱從兩項收斂成一項，方向上**降低**風險（不拆開，讀者可能以為標題列保護沒人做而漏做或重做）。原句本身一字未改，更正寫在其下的 ⚠️ 框，記錄保留、判讀更新，處理方式也對。
- DONE: J2 判斷「原句一個字未改、只在其下補引言」是否忠於我的提議。
  **忠於提議。** 我提的是「加一句」不是「改那句」；實測 `## Risk evidence` 原句一字未改，其下新增一則引言寫明 spike 已由 044 於 2026-09-21 完成並 PASSED。**而且比我提的多做了一件有用的事**——點明「上面那句講的是 spike 的**形式**，不是它的進度」，替下一輪擋掉「把一句沒錯的話當成錯的再改一次」。
- DONE: 未越界全項；依收斂輪判準給出裁決。
  全項通過：diff 基準**自算** `384ca7a3c…`；整條 branch 與 cycle 5 都只動票檔一個；**沒有開新票**（cycle 5 無新增票檔，現役 30／`_archive` 38 與上一輪相同）；`src/`／`scripts/` 零變動；`src/data/*.json` 三者 sha256 相同；未跑 `sync-content`；040 worktree 空且 HEAD 仍 `a51b5d9`；**正式試算表零寫入零讀取**；`## Acceptance criteria` 與 **S3／S7／S8 三區塊逐位元組未動**；**`### Feedback Cycles` 逐位元組未動、`- Cycle` 行數 ＝ 1**；**我的 verify cycle 4 內容段（14213 bytes）與 stage report（7254 bytes）逐位元組未動**；**我判定不該改的 `## Problem`（940 bytes）與 `## 相依關係`（598 bytes）逐位元組未動**；承重數字 24／9／15／59／12／6 原值保留。**未開新的掃描維度。**

### Summary

**PASSED，收斂。沒有發現會擋住 captain 部署的東西，也沒有 Material 等級的缺陷。**

J1 的三處都真的變得可見——三處都明寫「尚無票，負責人未定」且原句保留。
「66 張票」的掃描宣稱抽驗成立：我自己數到 68 個 `.md`，扣掉 `README.md` 與
`id:` 在第 13 行的 `040-…md` 正好 66，**且 `_archive/` 確實讀進去了**；
實質結論我直接以 `title` 搜過，兩個目錄皆零命中。
別名表那一處**寫兩面是對的**，兩面各有實測支撐，並誠實標出 promote 條件現在就在觸發範圍內。

順帶那個更正我**同意 FO 的授權判定**。標題列保護本票確實有做（步驟 6 C 類、S7 的
`A1:R1`／`A1:U1`／`A1:L1`、AC-5），沒做的只有整列刪除。關鍵是第二個理由：
**不拆開，J1 就修不乾淨**——原句主詞是「標題列與整列刪除」，
不拆就會寫出「這兩件事尚無票」卻又有 `A1:R1` 的自相矛盾。
它不加事不減事、不碰 AC、不動任何承重數字，方向上還降低風險。

J2 忠於我的提議：原句一字未改，只在其下補引言，並額外點明「形式 vs 進度」的區分，
替下一輪省掉一次重複勞動。

**交付狀態**：欄名、24 欄（9＋15）、59 列（40／15／4）、12 個保護範圍、6 個連續段、
`d3` 單一序號風險點——**五輪來原值未變，且每一項都被獨立重算過**；
S3 的兩項機器檢查已補上並實測（B3 證明缺一不可）。
仍開著的只有 040 Out of scope 後半句「並由 captain 確認」，
以及三個已標明「尚無票、負責人未定」的缺口——**都不擋本票執行**。

## review stage 獨立審查（2026-09-24）

全新 reviewer。五輪 verify 的承重結論**一律自行重現**，未採信任何自我回報。
**對正式 Google 試算表零寫入、零讀取**：本輪沒有任何 HTTP 請求送到試算表，
未讀 `.env.local`，fixture 的標題列取自本票第一節已逐字記載的實測值，內容列是合成的。
`src/data/*.json` 逐位元組未變。diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3c`。
判定中文字串未使用 `sort`／`uniq`；未使用 `awk` 做任何判斷。

### 一、五輪 verify 的承重結論——全部自行重現，全部成立

手法：以本票第一節記載的真實標題列造本機 fixture（Track 1 42 資料列／40 `Approved`、
Track 2 43／15、`site_tldr` 4／4），架 127.0.0.1 的 HTTP server 供應，
`git show main:scripts/sync-content.mjs`（729 行、`ff30b8bda476…`）與
040 的 `a51b5d9:scripts/sync-content.mjs`（824 行、`7e9ab0587035…`）各複製到 `mktemp -d` 沙箱執行。

| 宣稱 | 我的重現 |
|---|---|
| 9 欄安全前綴方向 (a) | S1 改名＋S2 的 9 欄（4＋5＋0）全建後，main **exit 0**，兩份輸出 sha256 **與 baseline 逐位元組相同**，並逐字印出 `（40 筆）`／`（16 筆，含 tldr）` |
| 9 欄安全前綴方向 (b) | **15 個窗口內欄位逐一單獨加**在安全前綴之上，**15 次全部 exit 1**。界線就在宣稱的位置：9 安全、15 窗口內、9＋15＝24 |
| 欄號 | Track 1 第 **15** 欄、Track 2 第 **18** 欄、`site_tldr` 第 **6** 欄，與 AC-6／第九節列的值相符 |
| D3 | 以 `node:vm` 載入 `a51b5d9` 的 `.gs`、stub 掉 Google 全域物件重跑 `resolveApprovalHeaders_`：階段 A／B／C／D 四列**逐格與票內第四節相同**；階段 C 的 Track 2 仍 ⛔ `缺少欄位「owl_depth_comment」。` |
| D3 的附帶發現 | 照**票內步驟 3 的原表**（5／5／7）建，Track 1 **也會失敗**：⛔ `缺少欄位「approved_by」。`（即 D2 的後果）。D3 說「步驟 4 在 Track 2 必定失敗」成立，但實際上兩個分頁都失敗 |
| S3 檢查①② | 五情境全部重現：A／A2 合法填值 **放行**、B（刪 `h1`）印 `（39 筆）`＋`⛔ 少了:["h1"]`、B2（刪 `d1`）印 `（40 筆）`／`（15 筆…）`＋`⛔ 少了:["d1"]`、**B3（刪 `h1` 又補已核可的 `h99`）筆數仍 40／16、只有 id 比對開火 `⛔ 少了:["h1"] 多了:["h99"]`**。舊前置（exit 0＋diff 位置）在五情境**全部放行**，含三種掉列 |
| AC-6 新判準 | 窗口已開 → ✅；**合法 fixture（9 欄安全前綴、exit 0、無標題錯誤）→ ⛔**（未被放寬成恆真）；抓取失敗（exit 1）→ ⛔；**我另加一格**：只把 `current_fingerprint` 建錯（exit 1、有「對不到任何預期欄位」但不是 `review_decision`）→ ⛔。舊判準 `grep '「review_decision」'` 在四格**全部找不到**（F2 病灶重現） |
| 承重數字 | 全部自行算出：24＝8＋9＋7（欄數實測 10→18、12→21、5→12）；59＝40＋15＋4；89＝42＋43＋4、30＝2＋28＋0；**保護範圍以 `.gs` 實讀的 `WRITABLE_REVIEW_FIELDS`（確為 6 欄）算連續段，S2／S4 排序得 12、票內 `APPROVAL_COLUMNS` 排序得 15**，且 S7 表中 12 個 A1 位置（`J2:J`／`R2:R`／`L2:Q`／`A1:R1`、`I2:I`／`U2:U`／`O2:T`／`A1:U1`、`D2:D`／`L2:L`／`F2:K`／`A1:L1`）**逐格相符**；6 段＝2／4-24／26-43／2-3／5-17／2-5，1＋21＋18＋2＋13＋4＝59，**與 S8 逐格相符** |
| `d3` 單一風險點 | 依 `publishedRowSequences`（`040:392`，實讀語意為「任一發布欄位非空就計數」，非「`Approved` 才計數」）實算：`Approved` 序號 `1,2,4..16`，**`d3` 占序號 3**，第 2-17 列之間**只有它一列**非 `Approved`，刪掉它使**正好 13 列**已核可列序號改變（F1 的 14→13 正確），其餘 27 列草稿全在第 17 列之後 |
| H4 | `.gs`（`cd380aee1071…`、263 行）與 `operations.md`（`a01a0d47237e…`、79 行）在 `a51b5d9` 與 `093cd01` **同位元組**；`sync-content.mjs` **不同**（824／807），`093cd01` 的 `publishedRowSequences` **零命中**、第 392 行是另一條敘述。**照抄 044 的 pin 會錯，implement 拒絕照抄是對的** |
| AC-1 綁定值 | `src/data/*.json` 在 main／HEAD／工作區三者 sha256 **皆為** `4d1992e3…cea3b`／`4071978a…3162`，40 筆／16 筆 |

**結論：五輪 verify 的承重結論沒有一項需要更正。** 票內被掃過的每一個維度都站得住。

### 二、最高優先：`044` 為 050 寫下的三項結論，**確實沒有被 050 採用**

`044`（`status: complete`／`verdict: PASSED`／`score: 0.96`／已歸檔）在「執行結果與交給 feature 050 的結論」
一節末尾寫「**本票不編輯 feature 050 的票。跨票編輯是污染。上述結論由 050 自己的 stage 採用。**」
它為 050 寫了三項。**我不只搜字串，逐句讀了步驟 6、S7、步驟 5、步驟 7、AC-3／AC-4／AC-5 的實質內容。**

**K1（Material，任務內可修的部分）結論一：步驟 6 必須改成「逐格用非擁有者帳號實測、提供逐欄檢查表、把『內容欄可改』列為反向對照」——一項都沒有做。**

- 步驟 6 只列 A／B／C 三類與「三個分頁都要各設一次」；S7 只列 12 個 A1 範圍與「設之前先核對一次欄位位置——設錯範圍等於沒設」。
  **兩處都沒有任何行為驗收**，沒有檢查表，沒有反向對照。
- `044` 步驟 6 的 🔴 追加補述提供的是**每個分頁 10 格 × 3 分頁 ＝ 30 格**的檢查表，
  含反向對照（`content` 欄**必須可改**，確認未過度保護）。050 對應的只有 **AC-4 的 3 格**
  （`approved_by`／`status`／`current_fingerprint`，**只在 `Track 1_history`**）＋ AC-5 的 3 格標題列。
  `Track 2_discussion` 與 `site_tldr` 的審核欄**一格都沒有被驗收**，`review_decision`／`review_fingerprint`／
  `approved_at`／`approved_fingerprint`／`reject_reason` 五欄**在任何分頁都沒有被驗收**。
- **`044` 自己的 AC-3 要求「八個欄位逐項 ＋ 三次繞道（整列貼上、刪整欄、改標題）共十一項，每一項都記錄」，
  並明寫「只寫『全部擋住』而沒有逐項記錄，判定不成立」。** 那是七列、可丟棄的測試表。
  **本票在 40 筆已上線內容的唯一來源上，驗收標準比那張測試表寬。**
- **「限制可編輯此範圍」vs「編輯這個範圍時顯示警告」全票只出現一次**，在 **AC-4 的「會怎麼失敗」**（第 1564 行），
  **不在 captain 實際執行的步驟 6 或 S7 裡**。`044` 把這個選擇標為 ⚠️，因為選錯就是 P2 假通過的成因。
- **AC-4／AC-5 在步驟 0-9 與 S1-S9 之中從未被排進去。** S1-S9 區段只引用 AC-1、AC-3、AC-6；
  S9 明寫「照票內步驟 8 原文，接著跑 AC-3 的 id 比對。**兩者都通過才做步驟 9 的合併**」——
  **本票唯一能偵測保護未生效的兩項驗收，沒有任何一步要求執行它們，也沒有說在窗口的哪個位置做。**

**四項證據欄位：**

| 欄位 | 內容 |
|---|---|
| 已發布使用者與正常流程 | captain 依 S7 → S8 → 步驟 9 在**正式表**操作，而該表**編輯權限已開放給多位協作者**（`editor-onboarding.md:434`、本票第六節） |
| 可觀察的損害 | 保護未生效時，投稿者可寫 `review_decision`／`approved_by`／`approved_at`／`approved_fingerprint`／`reject_reason`。040 的 `validateApprovalBinding` 只在**內容變過**時擋得住；**內容未變而審核欄被偽造的列會照樣以 `Approved` 上線**——那正是 040 AC-4／`044` P2 要證明的性質，而 P2 **第一次就是假通過** |
| 受影響的價值 AC 或不可協商邊界 | 本票 **AC-4**（「以非核可者身分編輯審核欄位會被拒絕」）與 **AC-5**；以及 `044` AC-3 訂下的驗收標準 |
| 觸發證據 | **實測過的，不是假設。** `044` 記載：在**七列、三分頁、captain 親手設定**的測試表上，清查時 `Track 1_history` **只有 Q／R 兩欄真正受保護**，其餘「設定看起來正確但未生效」，**P2 因此得到假通過，直到準備步驟 13 時清查才發現**。正式表是 **59 列、多位協作者** |

**「captain 照現行步驟 6 做完之後，有沒有任何東西會告訴他保護其實沒生效？」——沒有。我把 S7 之後的每一道檢查都走過一次：**

| S7 之後的檢查 | 會不會揭露保護未生效 |
|---|---|
| S8 逐列核可後 `status` 變 `Approved` | **不會。** captain 是擁有者，保護範圍排除不了他，核可照樣成功 |
| S9 步驟 8 的 sha256／`diff` | **不會。** 保護範圍不進入任何輸出 |
| S9 的 AC-3 id 比對 | **不會。** 同上 |
| AC-1／AC-2／AC-6 | **不會。** 三者都只看內容位元組、筆數與 exit code |
| 步驟 5／S6 的公式檢查 | **不會。** 只看 `status` 欄算不算得出來 |
| AC-4／AC-5 | **唯一的偵測，但沒有被排進 runbook，且只涵蓋 30 格中的 6 格、沒有反向對照** |

**分類與歸屬（分開提，不合併）：**

- **Material、任務內可修**：S7 缺行為驗收、缺「限制可編輯此範圍」的模式指示、
  AC-4／AC-5 在 S7 與 S8 之間沒有落點。三者都落在本票自己的 runbook，`044` 已備好檢查表可直接引用。
- **Needs decision（只有 captain 能改）**：**AC-4 本身**要不要從 3 格擴到逐欄逐分頁、要不要加反向對照。
  那是 acceptance criteria 的要求文字，依 `## Review-finding disposition` 第 5 條**只有 captain 能改**。
  **本輪未改 AC 一個字。**

**K2（Deferred risk）附帶規則一：「不要手動編輯 `status` 欄」——沒有被採用，而且步驟 6 的措辭方向相反。**

- 全票 `不要手動編輯` 零命中。`不要手動填` 的四處都是**要輸入到試算表的標題字串**，不是操作規則。
- 步驟 6 的 A 類把 `status`、`current_fingerprint` 設為「**只有 captain**（連責任編輯都不給）」，
  理由欄寫「手改等於偽造核可狀態」。**那是把 captain 可改講成一項刻意授予的權限**；
  `044` 的原意相反——擁有者改得動是**平台限制**，規則是**不要改**。
- **機械成因已從 `.gs` 實讀確認，不是轉述**：`installApprovalFormulas`（`a51b5d9:.gs:156-173`）
  對每一列 `setFormula` 寫入 `current_fingerprint` 與 `status`。往這種格輸入字面值會**覆蓋該列的公式**，
  該列狀態自此不再自動更新，要靠重跑「安裝／更新公式」還原。
- **它壞掉的是本票自己的驗證迴路**：步驟 5／S6 與**步驟 7 第 4 點**都叫 captain 讀 `status` 當成功訊號。
- **已發布內容不受威脅**（我查了）：040 的 `isApproved` 讀 `status`（`040:358`），
  但 `validateApprovalBinding` 的閘門是 `review_decision` 與三份 Node 重算的指紋——
  過期的字面 `Approved` 會撞上指紋不符而**大聲擋住**，不會靜默上線。所以是 Deferred risk，不是 Material。
- **升級為 Material 的條件**：captain 對任何一格 `status` 或 `current_fingerprint` 輸入字面值。

**K3（Deferred risk）附帶規則二：「未授權帳號執行核可或拒絕會靜默失敗、沒有錯誤訊息」——沒有被採用，而且步驟 7 寫了相反的話。**

- 全票 `靜默失敗`／`沒反應`／`允許名單` 皆零命中。
- **步驟 7 第 4 點**寫「`status` 應變成 `Approved`。**沒變就是有問題，程式會自動復原整批審核欄位並報錯。**」
  `044` 實測的是**沒有錯誤訊息**。步驟 7 的「常見錯誤」表列了四個錯誤訊息，**沒有這一種**。
- **captain 自己在 S8 踩不到**（擁有者永遠在允許名單內），所以是 Deferred risk。
- **升級為 Material 的條件**：任何非擁有者使用 `Review` 選單——而那正是部署後的常態，
  也正是步驟 6 B 類「只有責任編輯」指定的角色。`044` 明寫這是「**要寫進 feature 050 操作手冊的規則**」。

**（`044` 結論二「050 的步驟 4 不需要補充授權說明」不需要動作**——它說的是不必**增加**內容，
步驟 4 第 4 點現有的授權說明講的是安裝者本人，與 P7 的非擁有者結論不衝突。）

### 三、K4（方法）這是**第六族**，不是第五族的反面

第一至第五族**全部是對外引用**：050 指向某個檔、某個節、某張票、或一張不存在的票。
**K1-K3 的方向相反：是別人指定 050 要做的事。** 從 050 內部出發的掃描，**無論多完整都掃不到它**——
因為票內根本沒有指向 044 結論的那個引用可以檢查。第五族（指涉不存在的票）至少那句話**寫在 050 裡**。

**第六族的檢查方式：對其他票 grep 本票的票號，逐一讀「由 050 …」的義務。** 我跑了，一條指令：

| 提到 `050` 的檔 | 對 050 的義務 | 結果 |
|---|---|---|
| `_archive/044-…md` | 三項結論，明寫「由 050 自己的 stage 採用」 | ⛔ **一項都沒採用**（K1-K3） |
| `040-…md:64`（gate hold 的恢復條件） | 四項人工步驟：三分頁各建八審核欄、裝公式與 Review 選單、既有 40 筆逐列重新核可、審核欄設保護範圍 | ✅ **四項都在票內**（S2／S4、S5、S8、S7） |
| `064-…md:38` | 只引本票為先例 | ✅ 無義務 |
| `056-…md:503`、`_archive/041-…md` | 只提票號 | ✅ 無義務 |

**而這個缺口從第一個 commit 起就看得到**：`044` 的結論寫於 2026-09-15、歸檔 commit `66ed939`
是本 branch **merge-base 的祖先**（`--is-ancestor` 兩次皆真）——與 H1 同一形狀，**五輪又漏一次**。

### 四、runbook 可執行性——逐步讀步驟 0-9 與 S1-S9

除了上面 K1 指出的「AC-4／AC-5 沒有落點」，另外查到兩處，都只是摩擦、不是假通過：

**K5（Polish）`$REPO` 只在步驟 8 的區塊裡被賦值（第 332 行），而它屬於階段二；
S3（階段一）與 AC-6 的指令都用 `$REPO`，AC-6 的區塊只賦值 `$SANDBOX`。**
階段一按順序執行的工程從未見過第 332 行。**我實跑了 `$REPO` 未設的情況**：
`git -C "" show` **exit 128**、`node --env-file=/.env.local` **exit 9**、AC-6 的 `grep` 印 **⛔**——
三個方向都大聲失敗，**不會假通過**。修法是在 S3 前補一行 `REPO=…`。
（順帶：AC-6 區塊的註解 `# 必須是 1` 在 S3 重用時是反的，S3 要求 exit 0。票內已警告 `grep` 會印 ⛔，沒警告這行註解。）

**K6（Polish）相依一的證據句已過期。** 它寫「`git ls-tree main docs/content-pipeline/`
**只列出** `data-collection-guide.md` 與 `design.md`」。我實跑，main 現在**還有 `approval-permission-probe.md`**
（`044` 隨 `36af185` 帶進 main）。**承重結論仍然成立**——`operations.md` 確實不在 main，我重新確認過。
這是 H1 同一個第四族機制的殘留：`044` 合併改變了 main 的樹，收斂輪沒有再掃。

**沒有其他一步抄不起來或接不上。** 另查兩項無後果者：S4 對 `site_tldr` 的散文寫
「三欄插在上面四欄之前」，而它自己的程式區塊把七欄交錯列出；**我把兩種讀法都算過，
A1 範圍完全相同**（`D2:D`／`L2:L`／`F2:K`／`A1:L1`，皆 12 個），**無後果**。
步驟 8 的 `--env-file` 位置正確，`CONTENT_OUTPUT_DIR` 確實被 040 的 `OUTPUT_DIR` 讀取（`040:30`），
main **沒有**這個變數（零命中），AC-6 的沙箱手法因此必要——三項都實讀確認。

**票內 🔴 的三個選項忠於事實。** A「已完成，無額外代價」與 044 的 front matter 相符；
B／C「前提已消失」正確，且 B 保留「部分不可逆」與「拿那 40 筆去換一個已經不用付的成本」。
**唯一要提醒 FO 的是框架**：三個選項是**原決定的更新版**，而真正還開著的是一次是非確認
（040 Out of scope 後半句）。票內在表格下方兩段已明寫這件事，**所以不是缺陷，但送 captain 時該先講那一句**。

### 五、`## Documentation impact` 逐筆核對（依實際交付行為）

| 節 | 逐筆結果 |
|---|---|
| 現在更新 | 只列本票，並說明為何不動 `docs/`。**與實際交付相符**：整條 branch 只動票檔一個 |
| 實作後更新 | 六筆，五筆條件未到（`operations.md` 等 040 合併——我確認 main 仍無此檔；`design.md`／`editor-onboarding.md` 等部署完成；`TODO.md` P3-7 等步驟 1 完成；`INDEX.md` 等 `operations.md` 進 main）。第六筆 044 那列**已刪除線**並說明已無法執行——`044` 確在 `_archive/`、`status: complete`，**判斷正確**；理由引 `AGENTS.md` 稍寬（該檔的 archive 條文寫的是 `docs/_archive/`，此處是 `docs/constitution-features/_archive/`），但「`record` 不要改寫」與跨票污染兩條各自都足以支撐，**不需更動** |
| 不更新 | 五筆（`AGENTS.md`／`data-collection-guide.md`／`docs/project/`／`docs/_archive/`／`scripts/`）**全部與零變動相符** |
| `record` 文件未被改寫 | ✅ branch 只動票檔一個，`2026-08-31-content-pipeline.md`／`2026-09-03-editor-onboarding.md`／`approval-permission-probe.md` 皆未動 |
| `docs/INDEX.md` 符合文件新增或刪除結果 | ✅ **本輪沒有新增或刪除任何文件**，`INDEX.md` 因此不需更動，實際也是 0 變動 |

### 六、未越界未回歸（全部自行量測）

- **正式試算表零寫入零讀取。** 未跑 `npm run sync-content`。main 與 040 的同步共跑 30 次，
  全部在 `mktemp -d` 沙箱、餵 127.0.0.1 的本機 fixture，輸出寫進沙箱自己的 `src/data/`。
- `src/data/*.json` 逐位元組未變；main／HEAD／工作區三者 sha256 相同。
- **`## Acceptance criteria` 整段逐位元組未動**：自 cycle 2 的 F2 修正起
  五個 commit 皆為 `8b87d308b4a808f0`、**7009 bytes**。
- **S3／S7／S8 三個區塊逐位元組未動**：S7 `3c5df453a7229da1`（593 B）與 S8 `1bf4d8b0957abd9f`（759 B）
  在**全部六個 commit** 皆同；S3 自 cycle 3 的 G3 修正起（`190d1fff5d1b6079`、4311 B）四個 commit 皆同。
- **`### Feedback Cycles` 的 `- Cycle` 行數為 4**（Cycle 1-4，由 FO 在 `beb9b15` 與 `acbd8db` 寫入；
  三個 worker commit 上皆為 1，**未代 FO 補寫**）。
- 承重數字原值保留——不是靠數出現次數，是**每一個值我都從程式與 fixture 重算過**（見第一節）。
- 整條 branch 只動票檔一個（`git diff --stat 384ca7a3c HEAD`）；`src/`／`scripts/` 零變動；工作區乾淨。
- **040 worktree 乾淨**：`git status --porcelain` 為空，HEAD 仍為 `a51b5d9`；只用 `git show` 唯讀取檔。
- Placeholder 掃描：branch 新增行中 `某學者`／`某大學法律系`／`lorem ipsum`／`快速了解最新判決的5個重點`
  的命中**全部落在 verify 自己那張「零命中」結果表裡**，無真正的佔位資料。
- **未自行解票內的 🔴，未代 captain 確認。未改任何 AC 一個字。未修 implement 的任何東西**——
  依 `## Review-finding disposition`，FO 授權前不變更候選位元組、不 commit 候選、不重跑。

### 七、裁決

**REJECTED**，只因為 K1 一筆。

**其餘一切都通得過**：五輪 verify 的承重結論**無一需要更正**，runbook 除了 K5／K6 兩處摩擦
**沒有一步抄不起來或接不上**，Documentation impact 逐筆與實際交付相符，越界檢查全乾淨。
**票內被掃過的每一個維度都站得住；缺口在沒有人掃的那個方向。**

**REJECTED 的理由是 K1 落在 captain 的關鍵路徑上，而且是唯一沒有任何後續檢查會發現的一類。**
captain 正在做階段一，S7 就在窗口裡等著；`044` 已經在一張七列的測試表上**為這件事付過一次假通過的代價**，
而本票的驗收標準比那張測試表寬、又沒有被排進 runbook。修正很小、界線清楚，
**而且來源現成**（`044` 步驟 6 的 🔴 補述就是那張 30 格檢查表）。

**建議給 FO 的最小修正範圍**（任務內可修，全部落在 runbook，**不碰任何 AC 的要求文字、不動任何承重數字**）：

1. 在 **S7 與 S8 之間**新增一步：以非擁有者帳號逐格實測 `044` 那張檢查表（每分頁 10 格 × 3 分頁），
   **含「內容欄可改」的反向對照**，並明寫任何一格不符就回頭補設該範圍、再全部重測。
2. 在 **S7** 補一行：保護範圍必須選「**限制可編輯此範圍的使用者**」，
   **不可**選「編輯這個範圍時顯示警告」（警告模式擋不住任何人）。
3. 把 `044` 的**兩項附帶規則**寫進操作手冊：**不要手動編輯 `status` 欄**（含覆蓋公式的後果與還原方式）
   與**未授權帳號核可會靜默失敗、沒有錯誤訊息**；後者同時更正步驟 7 第 4 點「程式會…報錯」那句。
4. 在 S3 前補一行 `REPO=…`（K5）；更正相依一的 `git ls-tree` 證據句（K6）。

**不在任務內、需送 captain**：AC-4 本身要不要從 3 格擴到逐欄逐分頁並加反向對照。
**只有 captain 能改 acceptance criteria。**

## Stage Report: review

- DONE: **最高優先**：獨立判定 `044`（已封存，PASSED）為 050 寫下的三項結論**是否真的沒有被 050 採用**
  **三項全部未採用，已確認。** 不只搜字串——逐句讀步驟 6／S7／步驟 5／步驟 7／AC-3／AC-4／AC-5 的實質內容。結論一（K1，Material）：步驟 6／S7 **零行為驗收、零檢查表、零反向對照**；`044` 的檢查表是 10 格 × 3 分頁 ＝ 30 格，050 只有 AC-4 的 3 格（僅 `Track 1_history`）＋ AC-5 的 3 格，`Track 2`／`site_tldr` 的審核欄與五個審核欄位**一格未驗**；「限制可編輯」vs「顯示警告」全票只在 **AC-4 的「會怎麼失敗」**出現一次，**不在 captain 執行的步驟裡**；**AC-4／AC-5 在步驟 0-9 與 S1-S9 中從未被排進去**（該區段只引 AC-1／AC-3／AC-6）。附帶規則一（K2，Deferred risk）：步驟 6 A 類把 captain 可改 `status` 寫成刻意授予的權限，方向與 `044` 相反；成因從 `.gs:156-173` 的 `setFormula` 實讀確認；已發布內容**不受威脅**（`040:358` 的 `isApproved` 讀 `status`，但閘門是 `review_decision` 與三份 Node 重算指紋，過期字面值會大聲擋住）。附帶規則二（K3，Deferred risk）：**步驟 7 第 4 點寫了相反的話**（「程式會…報錯」），`044` 實測是沒有錯誤訊息；captain 是擁有者故自己踩不到。
- DONE: 走四項證據欄位判 materiality，特別問 captain 照現行步驟 6 做完後有沒有任何東西會告訴他保護其實沒生效
  **答案是沒有。** S7 之後每一道檢查都走過：S8 的 `status` 翻轉（captain 是擁有者，照樣成功）、S9 的 sha256／`diff`／AC-3 id 比對、AC-1／AC-2／AC-6、步驟 5／S6 的公式檢查——**六類全部與保護範圍無關**，只看內容位元組、筆數或 exit code。唯一的偵測是 AC-4／AC-5，而它沒有落點、只涵蓋 30 格中的 6 格、沒有反向對照。觸發證據是**實測過的**：`044` 在七列、captain 親手設定的測試表上只有 Q／R 兩欄真正受保護，P2 得到**假通過**；正式表 59 列、多位協作者。
- DONE: 判斷這是不是第五族的反向實例
  **不是——它是第六族。** 第一至五族全部是**對外引用**，從 050 內部出發的掃描無論多完整都掃不到 K1-K3，因為票內沒有指向 044 結論的引用可檢查（第五族至少那句話寫在 050 裡）。檢查方式是**對其他票 grep 本票票號**：7 個檔提到 050，`044` 三項義務**全未採用**，`040:64` 的四項義務**全部在票內**（S2／S4、S5、S8、S7），`064`／`056`／`041` 無義務。`66ed939` 是 merge-base 的祖先，**缺口從第一個 commit 起就看得到**——與 H1 同形狀。
- DONE: 自行重現五輪 verify 的承重結論（9 欄安全前綴兩個方向、D3、S3 兩項機器檢查、承重數字、AC-6 新判準）
  **全部重現，全部成立，無一需要更正。** (a) 9 欄全建後 main exit 0 且兩份 sha256 與 baseline **逐位元組相同**、逐字印 `（40 筆）`／`（16 筆，含 tldr）`；(b) **15 個窗口內欄位逐一單獨加，15 次全部 exit 1**（欄號 15／18／6 與票內相符）。D3：`node:vm` 載入 `a51b5d9` 的 `.gs` 重跑 `resolveApprovalHeaders_`，四階段逐格相符，階段 C 的 Track 2 仍 ⛔ `缺少欄位「owl_depth_comment」。`；**另查出照票內步驟 3 原表建，Track 1 也會失敗**（⛔ `缺少欄位「approved_by」。`）。S3 五情境全部重現，**B3 筆數仍 40／16、只有 id 比對開火**，舊前置五情境全部放行。AC-6：合法 fixture **判失敗**（未被放寬成恆真），另加「只建錯 `current_fingerprint`」一格亦判失敗。數字全部自算：24＝8＋9＋7、59＝40＋15＋4、89／30、**12／15 個保護範圍與 S7 的 12 個 A1 位置逐格相符**、6 段與 S8 逐格相符、`d3` 占序號 3 且刪它**正好 13 列**受影響。H4 的三檔 pin 實查成立。
- DONE: **review 階段真正該問的**：captain 照著做會不會走不下去
  **除 K1 外只有兩處摩擦，都不是假通過。** K5（Polish）：`$REPO` 只在步驟 8 的區塊（第 332 行、階段二）賦值，而 S3 與 AC-6 的指令都用它，AC-6 只賦值 `$SANDBOX`；**實跑 `$REPO` 未設**得 `git` exit 128、`node` exit 9、AC-6 的 `grep` 印 ⛔——三個方向都大聲失敗。K6（Polish）：相依一的 `git ls-tree main docs/content-pipeline/` 證據句已過期（main 現在還有 `approval-permission-probe.md`，隨 `36af185` 進入），但**承重結論仍成立**，`operations.md` 確實不在 main。另查兩項無後果：S4 對 `site_tldr` 的散文與程式區塊順序不一致，**兩種讀法算出的 A1 範圍完全相同**；AC-6 的註解 `# 必須是 1` 在 S3 重用時是反的。🔴 的三個選項**忠於事實**，唯一要提醒的是框架（真正開著的是一次是非確認，票內下方兩段已明寫）。
- DONE: 依實際交付行為逐筆核對 `## Documentation impact`
  三節逐筆相符。「現在更新」只列本票，與「branch 只動票檔一個」一致；「實作後更新」六筆條件皆未到，044 那列已刪除線且判斷正確（`044` 確在 `_archive/`、`status: complete`），其 `AGENTS.md` 引用稍寬但「`record` 不要改寫」與跨票污染各自足以支撐；「不更新」五筆與零變動相符。**`record` 文件未被改寫**（三份皆未動）。**`docs/INDEX.md` 符合結果**——本輪無文件新增或刪除，故不需更動，實際 0 變動。
- DONE: 未越界未回歸（正式表零存取、AC 與 S3／S7／S8 逐位元組、Cycle 行數 4、branch 範圍、diff 基準自算）
  diff 基準**自算**：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`（未沿用任何記憶中的 SHA）。**正式試算表零寫入零讀取**，未讀 `.env.local`，30 次同步全在沙箱餵 127.0.0.1 fixture。`src/data/*.json` 在 main／HEAD／工作區三者 sha256 皆 `4d1992e3…cea3b`／`4071978a…3162`。**AC 整段** `8b87d308b4a808f0`（**7009 B**）五個 commit 皆同；**S7** `3c5df453a7229da1`（593 B）與 **S8** `1bf4d8b0957abd9f`（759 B）**全部六個 commit 皆同**；**S3** `190d1fff5d1b6079`（4311 B）自 G3 起四個 commit 皆同。**`- Cycle` 行數為 4**。branch 只動票檔一個、`src/`／`scripts/` 零變動、工作區乾淨、**040 worktree `git status` 為空且 HEAD 仍 `a51b5d9`**。Placeholder 命中全落在 verify 自己的「零命中」表內。判定中文字串未用 `sort`／`uniq`，未用 `awk`。**未解 🔴、未代 captain 確認、未改任何 AC 一個字、未修 implement 任何東西。**

### Summary

五輪 verify 的承重結論我全部自行重現，**沒有一項需要更正**——9 欄／15 欄的界線就在宣稱的位置、
D3 成立（而且兩個分頁都會失敗）、S3 的兩項檢查缺一不可、AC-6 的新判準沒有被放寬成恆真、
12／15 個保護範圍與 6 段 59 列的每一個位置都逐格相符。**票內被掃過的每一個維度都站得住。**

**裁決 REJECTED，只因為一筆：`044` 為 050 寫下的三項結論，一項都沒有被採用。**
最要緊的是結論一——步驟 6／S7 沒有任何行為驗收，而 `044` 已經在一張七列的測試表上
為「只看設定畫面」付過一次**假通過**的代價。本票的驗收比那張測試表寬（3 格對 30 格）、
只涵蓋一個分頁、沒有反向對照，而且 **AC-4／AC-5 在整份 runbook 裡沒有落點**。
我把 S7 之後的六類檢查全部走過：**沒有任何一項會告訴 captain 保護其實沒生效。**

**這是第六族，不是第五族的反面**：前五族都是 050 指向別人，從票內出發的掃描永遠掃不到「別人指定 050 要做的事」。
檢查方式是一條 grep——對其他票搜本票票號。跑完只有 `044` 這一個缺口（`040` 的四項義務全部在票內），
而它從 merge-base 起就看得見。修正很小、界線清楚、來源現成（`044` 步驟 6 的 🔴 補述就是那張檢查表），
**但 AC-4 本身要不要擴充是 acceptance criteria，只有 captain 能改。**

## Stage Report: implement (cycle 6)

- DONE: K1（Material，最優先；captain 已被告知暫停 S7）三項任務內處置——S7 補行為驗收（直接引用 `044` 步驟 6 的檢查表，不自己另發明）、S7 補模式指示、把 AC-4／AC-5 排進 runbook 落點在 S7 之後 S8 之前。
  S7 新增三個小節。**S7-a 權限模式**：明寫必須選「限制可編輯此範圍的使用者」→「只有你」，不可選「編輯這個範圍時顯示警告」，並逐字引用 `044` 步驟 6 的 ⚠️ 原句，寫明**選錯就是 `044` P2 假通過的成因**、12 個範圍每個都要確認一次。**S7-b 行為驗收**：直接採用 `044` 步驟 6 追加補述的那份檢查表（**10 格 × 3 分頁 ＝ 30 格**，第 10 列是反向對照「內容欄必須可改」），欄位與類別逐項照抄，**只把 A1 位置換成本票 S2／S4 排序算出的位置**——`044` 的測試表欄序與正式表不同，照抄 A1 會指到別的欄。三個分頁的反向對照格分別是 `F2`（`content`）／`G2`（`abstract`）／`C2`（`text`）。另寫明四點操作要求，第 1 點是重點：**必須用非擁有者帳號測**，captain 自己測每格都會「可改」，測不出任何東西。**S7-c**：AC-4／AC-5 排進 runbook，落點 S7-b 之後、S8 之前，並寫明理由——**S8 之後每一道檢查都偵測不到保護未生效**（S8 的核可、S9 的 sha256／`diff`、AC-3 的 id 比對、AC-1／AC-2／AC-6、步驟 5／S6 的公式檢查），成因是 captain 是擁有者、保護範圍排除不了他，所以**偵測必須擋在核可之前**。
  **一項本票自己加的要求，已在票內明文標示為本票所加**：反向對照那一格測完要立刻 Ctrl+Z 還原並確認回到原字串。`044` 不需要（可丟棄的測試表），本票需要——那一格留著改動會讓 S9 的 AC-1 sha256 不符。同時寫明**此刻改內容是安全的**：S6 之後所有列都是 `Needs review`，還沒有任何一列被核可，這也是 S7-c 排在 S8 之前的附帶好處。
  A1 位置已逐欄回算並與 S7 原有的 12 個範圍交叉核對：`Track 1` B 類 `L2:Q` ＝ 第 12-17 欄 ＝ 六個 `WRITABLE_REVIEW_FIELDS`；`Track 2` `O2:T` ＝ 第 15-20 欄；`site_tldr` `F2:K` ＝ 第 6-11 欄。三個反向對照格（F／G／C）全部落在所有保護範圍之外。
  **AC 一個字未動。** 票內已在 S7-c 講明 **runbook 的操作要求可以比 AC 的驗收門檻寬**（S7-b 要 30 格，AC-4 的 `Verified by:` 要 3 格，兩者不衝突），並註明 AC-4 的擴大依 `## Review-finding disposition` 第 5 條只有 captain 能改、已另行送交。
- DONE: K2 把「不要手動編輯 `status` 欄」寫進步驟 6 與步驟 7，理由是平台限制不是授權，並寫明還原方式。
  步驟 6 的 A 類措辭改寫：從「**只有 captain**（連責任編輯都不給）／手改等於偽造核可狀態」改為「設為只有 captain——**但這不是授權 captain 去改**／保護範圍排除不了擁有者，那是平台限制，不是本票刻意給的權限」。表後新增 ⚠️ 區塊，逐字引用 `044` 的附帶規則一，並補上實讀的機械成因（`approval-workflow.gs:156-171`，釘在 `a51b5d9`：`installApprovalFormulas` 對每列用 `setFormula` 寫入這兩欄，輸入字面值會覆蓋該列公式，狀態自此凍結）、還原方式（重跑「安裝／更新公式」），以及**為什麼這一條特別危險**——本票自己的驗證迴路就是讀 `status`（步驟 5／S6 看 `Needs review`、步驟 7 第 4 點看 `Approved`），手改過的 `status` 會顯示你想看到的字而那個字不再代表任何事實。另註明同步端不受影響（閘門是 `review_decision` 與三份指紋）。步驟 7 第 4 點也加了「不要手動把 `status` 改成 `Approved` 來修正它」。
- DONE: K3 把「未授權帳號執行核可或拒絕會靜默失敗、沒有錯誤訊息」加進步驟 7 的「常見錯誤」表，並修正第 4 點那句相反的話。
  「常見錯誤」表新增第五列：「沒有任何錯誤訊息，選單像是沒反應」→ 原因是未授權帳號靜默失敗（`044` 實測確認沒有錯誤訊息）→ 怎麼辦是確認帳號在 B 類保護範圍的允許名單內，並註明**captain 自己踩不到**（擁有者永遠在允許名單內）、**責任編輯一定會踩到**（那正是步驟 6 B 類指定的角色，也是部署後的常態）。表後引用 `044` 附帶規則二的原句，並說明本票原本第 4 點寫的是相反的話、它對「程式跑了並偵測到問題」成立而對靜默失敗不成立。第 4 點已改寫成兩種原因並列（跳錯誤訊息 vs 完全沒反應）。
- DONE: K4 把第六族與它的檢查指令寫進第九節的邊界宣告，與前五族並列。
  邊界宣告新增第六輪追加段：**前五族全部是「對外引用」**，共同前提是票內有一句話可以拿去檢查；**第六族方向相反——別人指定 050 要做的事**，票內根本沒有指向那個義務的引用，所以從 050 內部出發的掃描無論多完整都掃不到（第五族至少那句話寫在 050 裡，第六族連那句話都不在）。檢查指令已寫入並實跑。另新增一小節列出 5 張票的重讀結果：**`044` 三項義務全部未採用**（即 K1／K2／K3，本輪全部採用）；**`040` 的 gates hold 恢復條件四項人工步驟全部都在**（分別對應 S4／S5／S8／S7，逐項核對）；`064`／`056`／`041` 無義務（引用結論、宣告自己不做、票號清單）。並寫明這一族**是唯一產出 Material 的一族**，以及它為什麼最難自己發現——**它是一個不在場的東西**，發現的唯一辦法是反問「誰引用了本票」。
- DONE: K5 在 S3 前補 `REPO=`；修 AC-6 註解在 S3 重用時方向相反。K6 修相依一的過期證據句。
  K5：`REPO=` 那一行加在 **S3 之前**（不在 S3 區塊內，S3 保持逐位元組未動），並註明未設時三個方向都大聲失敗（`git -C ""` exit 128、`node --env-file=""` exit 9、sha256 比對印 ⛔）、不會假通過，只是白花時間。AC-6 的 `# 必須是 1` 改為 `# AC-6（窗口已開）必須是 1；S3 重用這段時必須是 0`——**那是 bash 區塊裡的一行註解，不是 AC 的要求文字**，`## Acceptance criteria` 整段本輪的差異就只有這一行。K6：相依一的證據句加 ⚠️ 更正並**保留原句**，實跑 `git ls-tree --name-only main docs/content-pipeline/` 得三個檔（`044` 隨 `36af185` 帶進 `approval-permission-probe.md`），並寫明承重結論不變（`operations.md` 確實不在 main）。
- DONE: 未越界。
  **正式試算表零寫入零讀取**（未發出任何 HTTP 請求、未跑任何同步）。**AC 的要求文字逐字未動**（唯一差異是 AC-6 bash 區塊一行註解的方向標註，屬 K5 授權）；**未擴大 AC-4、未代 captain 裁決、未解 🔴**。**S3 與 S8 逐位元組未動**（S7 本輪改動屬 K1 授權範圍）。承重數字 24／9／15／59／12／6 原值保留。**`### Feedback Cycles` 逐位元組未動、`- Cycle` 行數維持 4**。整條 branch 只動 `docs/constitution-features/050-ssot-approval-deployment.md` 一個檔；`git diff --stat $(git merge-base main HEAD) -- src/ scripts/` 無輸出；`src/data/*.json` sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`；040 worktree `git status` 為空、HEAD 仍為 `a51b5d9`。diff 基準自算 ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。未用 `sort`／`uniq` 判定中文字串，未用 `awk`。

### Summary

六筆修完。**K1 是六輪以來第一筆 Material，也是唯一會讓 captain 白做一整場部署的一筆。**

> ⚠️ **第七輪更正（來源是 review 的 K10，不是本票自己發現的）：上面那句「第一筆 Material」不成立。原句保留。**
> Cycle 1 的 **F2** 與 Cycle 3 的 **H1** 都是 Material。
> 準確的說法是：**K1 是唯一一筆「照票做完之後沒有任何一步會揭露錯誤」的 Material**——
> F2 大聲失敗、H1 傷的是決策品質，只有 K1 是靜默的。詳見第九節「第六族」那一小節的更正表。

**K1 的核心不是「驗收格數不夠」，是「沒有任何一步會告訴他保護沒生效」。**
原本 S7 只說要設 12 個範圍，而 `044` 在一張七列、由 captain 親手設定的測試表上，
**只有兩欄真正受保護、其餘設定看起來正確但未生效**，一路假通過到清查才發現。
本票在 59 列、已開放多位協作者的正式表上，驗收範圍卻只有 6 格、只在一個分頁、沒有反向對照——
**比那張可丟棄的測試表還寬。**

三項處置都做了，而第三項與前兩項一樣重要：**AC-4／AC-5 原本從未被排進任何一步。**
它們是本票唯一能偵測「保護未生效」的兩項驗收，現在是 S7-c，卡在 S8 之前。
理由已寫進票內：S8 之後每一道檢查都偵測不到，**因為 captain 是擁有者、保護範圍排除不了他**，
所以他執行的每一步都會成功，不論保護有沒有設對。偵測排在核可之後等於沒排。

S7-b 的 30 格**直接採用 `044` 那份實測過的檢查表**，欄位與類別照抄，
只把 A1 位置換成本票 S2／S4 排序算出的位置——`044` 的測試表欄序與正式表不同，照抄會指到別的欄。
我另外加了一項 `044` 不需要的要求並明文標示為本票所加：
**反向對照那一格測完要立刻還原**，否則 S9 的 AC-1 sha256 會不符。

**K2／K3 的共同形狀是：本票寫了與 `044` 相反的話。**
步驟 6 把「captain 可改」講成刻意授予的權限，而 `044` 的原意是平台限制、規則是不要改；
步驟 7 第 4 點寫「沒變就是有問題，程式會報錯」，而 `044` 實測的靜默失敗**沒有錯誤訊息**。
兩處都改了，並附上實讀的機械成因與還原方式。
K2 值得記一句：它壞掉的是**本票自己的驗證迴路**——步驟 5、S6、步驟 7 都叫 captain 讀 `status`。

**K4 是方法上的收穫，也解釋了為什麼前五輪都沒找到 K1。**
前五族全部是「050 指向外面」，共同前提是票內有一句話可以檢查。
**第六族是「外面指定 050 要做的事」，票內沒有留下任何痕跡**——
沒有引用、沒有待辦、沒有註記。**它是一個不在場的東西，掃不到。**
唯一的辦法是反問「誰引用了本票」，指令已寫進第九節並實跑：
`044` 三項義務一項未採用，`040` 的四項人工步驟四項都在，其餘三張票無義務。

## review stage 第二輪：K1-K6 複審（2026-09-24）

同一位 reviewer（上一輪判 REJECTED 的那位）。**對正式 Google 試算表零寫入、零讀取**：
未發出任何 HTTP 請求到試算表、未讀 `.env.local`，fixture 標題取自第一節已逐字記載的實測值。
未跑 `npm run sync-content`。diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3c`，
複審基準為我上一輪的 commit `ec62f9f`。未用 `sort`／`uniq` 判定中文字串，未用 `awk`。

### 一、K1 的三項處置——**兩項完全正確，第三項的核心資料正確但執行者指示有誤**

#### S7-b 的 30 格：欄位、類別、A1 位置**全部自行回算，全部正確**

**欄位與類別是 `044` 那一份，不是另發明的。** 我把兩張表逐列機器比對（10 對 10）：
欄位順序（標題列→`status`→`current_fingerprint`→`review_decision`→`review_fingerprint`→
`approved_by`→`approved_at`→`approved_fingerprint`→`reject_reason`→內容欄）
與類別映射（甲→A、乙→B、丙→C、內容→—）**十列全部一致**，預期值（擋／可改）也全部一致。
唯一的差異是第 10 列：`044` 寫死 `content`（它只列 Track 1 的位置），
本票改成「內容欄」並逐分頁指名 `content`／`abstract`／`text`——**那是必要的推廣，不是偏離。**

**A1 位置我自己從標題列重算**（以第一節的實測標題 ＋ S2／S4 的附加順序建表，
`WRITABLE_REVIEW_FIELDS` 實讀 `.gs` 確為 6 欄），**30 格逐格與票內相同**：

| 分頁 | 我算出的欄序 | 30 格中的位置 |
|---|---|---|
| `Track 1_history`（18 欄） | …I=`image_url`、J=`status`、K=`chapter`、L=`approved_by`、M=`approved_at`、N=`reject_reason`、O=`review_decision`、P=`review_fingerprint`、Q=`approved_fingerprint`、R=`current_fingerprint` | `A1`／`J2`／`R2`／`O2`／`P2`／`L2`／`M2`／`Q2`／`N2`／`F2` |
| `Track 2_discussion`（21 欄） | …I=`status`、J=`owl_comment`、K=`vibe`、L=`sticky`、M=`owl_depth_comment`、N=`full_content`、O=`approved_by`、P=`approved_at`、Q=`reject_reason`、R=`review_decision`、S=`review_fingerprint`、T=`approved_fingerprint`、U=`current_fingerprint` | `A1`／`I2`／`U2`／`R2`／`S2`／`O2`／`P2`／`T2`／`Q2`／`G2` |
| `site_tldr`（12 欄） | A=`order`、B=`label`、C=`text`、D=`status`、E=`link`、F=`review_decision`、G=`review_fingerprint`、H=`approved_by`、I=`approved_at`、J=`approved_fingerprint`、K=`reject_reason`、L=`current_fingerprint` | `A1`／`D2`／`L2`／`F2`／`G2`／`H2`／`I2`／`J2`／`K2`／`C2` |

同一份欄序算出的保護範圍是 `J2:J`／`R2:R`／`L2:Q`／`A1:R1`、`I2:I`／`U2:U`／`O2:T`／`A1:U1`、
`D2:D`／`L2:L`／`F2:K`／`A1:L1`，**合計 12 個，與 S7 原有的表逐格相同**。

**三個反向對照格真的落在所有保護範圍之外——反向對照是活的。**
我對每一格做了範圍包含判定（欄號區間 ＋ 列號區間，含 C 類只涵蓋第 1 列這一點）：

| 分頁 | 反向格 | 對照該分頁全部 4 個範圍 | 結論 |
|---|---|---|---|
| `Track 1_history` | `F2`（`content`） | `J2:J` 否／`R2:R` 否／`L2:Q` 否（F 在 L 之前）／`A1:R1` 否（只第 1 列） | **在所有範圍之外 ✅** |
| `Track 2_discussion` | `G2`（`abstract`） | `I2:I` 否／`U2:U` 否／`O2:T` 否／`A1:U1` 否 | **在所有範圍之外 ✅** |
| `site_tldr` | `C2`（`text`） | `D2:D` 否／`L2:L` 否／`F2:K` 否（C 在 F 之前）／`A1:L1` 否 | **在所有範圍之外 ✅** |

**implement 不照抄 `044` 的 A1 是對的。** `044` 的表把反向對照寫在 `D2`；
在本票的欄序下，Track 1 的 D 是 `ruling_id`、`site_tldr` 的 D 是 **`status`**——
照抄會把反向對照格指到一個 A 類保護欄上，**那一格永遠測不出「可改」，反向對照會是死的。**

#### 自加的「測完立刻 Ctrl+Z 還原」：**正確且必要，而且它宣稱的安全性成立**

**必要性我實測了。** 用部署後的 fixture 分別改那三格，跑同步比 sha256：

| 改哪一格 | 結果 |
|---|---|
| Track 1 第 2 列 `content`（`F2`） | `history.json` sha256 **改變** |
| Track 2 第 2 列 `abstract`（`G2`） | `discussions.json` sha256 **改變** |
| `site_tldr` 第 2 列 `text`（`C2`，`order 0` 的標題） | `discussions.json` sha256 **改變** |

三格全部進入輸出。**留著改動，S9 的 AC-1 逐位元組比對必定失敗。**
`044` 不需要這一條（可丟棄的測試表），本票需要——理由正確。

**「此刻改內容是安全的」這個宣稱成立，我從程式驗的，不是採信。**
實讀 `approval-workflow.gs:115-124` 的 `APPROVAL_STATUS`：
`review_decision` 非 `Approved` 時直接回 `Needs review`（第 121 行）。
S4 建的 15 個窗口內欄位全部留白 ⇒ 每一列 `review_decision` 皆空 ⇒ **每一列都是 `Needs review`**。
而 `installApprovalFormulas`（`156-171`）對第 2 列到最後一列**逐列 `setFormula` 覆寫 `status`**，
**原本那 40／15／4 個字面 `Approved` 在 S5 當下就被公式取代了**。
所以 S7-b 執行時**確實沒有任何一列處於已核可狀態**，
那個 Ctrl+Z 不可能動到一個已核可的列。**宣稱正確。**

> 非阻擋的一句：更保險的等價作法是把反向對照格改測一個**草稿列**
> （`h2`／`h28`／`d3`，`status` 空白、不在那 59 列內），那樣連 Ctrl+Z 都不必要。
> 但維持 `044` 第 2 列的忠實度也說得過去，**兩者都可以，不影響判定。**

#### S7-a：正確

模式指示寫進 captain 實際執行的步驟了，逐字引用 `044` 的 ⚠️ 原句，
並寫明「12 個範圍每一個都要確認一次」與「選錯的後果不是保護較弱，是完全沒有保護而且看起來有」。
**上一輪的缺口（全票只在 AC-4 的「會怎麼失敗」出現一次）已補。**

#### S7-c：落點正確，而且理由正確——我自己再走了一次那張表

落點是 **S7-b 之後、S8 之前**，逐字確認。理由也寫進票內。
**我重走一次，加上新的兩道：**

| 執行順序 | 會不會揭露「保護未生效」 |
|---|---|
| S5 裝公式／S6 確認公式 | 不會。captain 是擁有者，`setFormula` 照樣寫得進去 |
| S7 設 12 個範圍 | 不會，那是動作本身 |
| **S7-a 模式指示** | **不會——它是預防，不是偵測。** 而且它看的是設定畫面，正是 `044` 證明會騙人的那個 |
| **S7-b 30 格行為驗收** | **會。這是唯一的完整偵測** ✅ |
| **S7-c AC-4／AC-5** | **會，但是 S7-b 的真子集**（AC-4 ＝ 第 2／3／6 列的 Track 1 格，AC-5 ＝ 第 1 列三分頁） |
| S8 逐列核可 | 不會。擁有者核可必定成功 |
| S9 sha256／`diff`／AC-3 id 比對 | 不會。保護範圍不進入任何輸出 |
| AC-1／AC-2／AC-6 | 不會。只看內容位元組、筆數、exit code |

**結論與上一輪相同，而且現在有偵測了**：S7-b 與 S7-c 是唯一的兩道，S7-b 嚴格涵蓋 S7-c，
兩者都排在 S8 之前。**排在 S8 之後等於沒排**——票內這句話成立。

#### 「30 格 vs 3 格」並存：**不會讓執行者困惑**

S7-c 的引言給了無歧義的指令：「在 captain 裁決前，**照 S7-b 做 30 格**；
AC-4／AC-5 依原文各自成立即可。」數量沒有歧義。
唯一可再收斂一句的是：S7-b 做完之後，S7-c 的實質工作是**補 AC-4 要求的記錄格式**
（AC-4 的 `Verified by:` 要 UTC 時間、三次結果、角色；S7-b 只要求「逐格記錄結果、不記 email」）。
**非阻擋。**

#### AC-4 未擴大、未代 captain 裁決——**逐位元組確認**

`## Acceptance criteria` 整段 `ec62f9f` 為 7009 B、HEAD 為 7063 B，
**行級比對只有一行不同**，就是 K5 那行註解：

```
-   echo "exit=$?"   # 必須是 1
+   echo "exit=$?"   # AC-6（窗口已開）必須是 1；S3 重用這段時必須是 0
```

`echo "exit=$?"` 這個**指令本身逐字未動**，兩行 `grep` 判準逐字未動，
AC-1 至 AC-6 的標題、要求文字、`Verified by:` 散文、「會怎麼失敗」、「這一項的用意」
**全部不在差異裡**。**implement 的宣稱成立。**
另外「相依二」整段（含 🔴 三選項）`59fcc4305f39d8a7`、5718 B **逐位元組未動**——
**🔴 未解、未代 captain 確認。**

### 二、K7（**Material，本輪唯一阻擋項**）S7-b 指名的測試帳號，角色寫反了，而且沒交代它要先被授權

**這一筆落在 S7-b 本身——也就是為了擋住假通過而新增的那一步。**

**(a) 角色寫反了。** S7-b 第 1 點：

> 用 `044` 那個第二個 Google 帳號（**責任編輯角色**）登入，開正式表。

**`044` 的「角色與帳號」表寫的相反**（`044` 的 `## 角色與帳號`）：

| 代號 | 角色 | 身分 |
|---|---|---|
| **A** | **責任編輯／核可者** | 測試表**擁有者** ＝ captain 現用的帳號 |
| **B** | **投稿者** | 以「編輯者」受邀，**不是擁有者** ＝ **第二個 Google 帳號** |

第二個帳號在 `044` 是**投稿者**，`責任編輯` 是 captain 自己（擁有者）。
S7-b 第 1 點自己剛講完「**不是用 captain 的帳號**」，括號卻把那個帳號標成 captain 的角色。

**而這不只是標籤問題，它會翻轉 30 格裡的 18 格。**
`044` 的「乙　審核欄」設的是「限制 → **只有你**」（擁有者），所以 B（投稿者）測乙類六欄**預期擋**。
**本票 S7 的 B 類設的是「只有責任編輯」——不是擁有者。**
兩者的目標設定不同，`044` 那張表的「擋」只對**不在允許名單內**的帳號成立。

**`044` 自己量過這件事**：步驟 13（P7）第 1-2 點先「把 B 加入乙類可編輯名單」，
然後「用 B 在 `Track 1_history` 列 2 的 `reject_reason` 填字 → **預期成功**」，做完再移除。
**044 刻意把兩個角色分開測，因為結果相反。** S7-b 把這個區分收掉了。

**照現行文字執行的後果**：若那個帳號被當成責任編輯放進 B 類允許名單，
第 4-9 列（`review_decision`／`review_fingerprint`／`approved_by`／`approved_at`／
`approved_fingerprint`／`reject_reason`）**六格會「可改」**，三分頁共 **18 格**與預期相反。
S7-b 對不符的處置是「**回頭補設該範圍**，然後把該分頁 10 格全部重測」——
而 B 類唯一能再收緊的方向就是**把責任編輯從允許名單移除**（回到 `044` 的乙類設定）。
**那會拆掉本票自己的設計**：步驟 6 B 類的理由是「Review 選單以執行者身分寫入，
執行者沒有權限就會被擋」，而依本輪剛補的 K3 那一列，
**責任編輯之後核可會靜默失敗、沒有任何錯誤訊息。**
另一條路是 captain 判斷「S7-b 過不了」而停住——**同樣走不下去。**

**(b) 那個帳號現在沒有正式表的權限，而票內沒有交代要先授權。**
`044` 步驟 15（收尾）第 2 點：「**把 B 從測試表的共用名單移除**」；
AC-8 的判定列記「**B 已移出乙類保護範圍的允許名單**」。
而 `044` 全程未碰正式表。所以那個帳號**從來沒有被加進正式表的共用名單**。
S7-b 寫「登入，開正式表」，**假設它打得開**。
**FO 要我確認「指名的帳號來源可用」——我無法確認，而且票內沒有任何一句建立它。**
反向對照格要顯示「可改」，該帳號還必須是**編輯者**而不是檢視者。

**四項證據欄位：**

| 欄位 | 內容 |
|---|---|
| 已發布使用者與正常流程 | captain 在 S7 之後照 S7-b 執行，用票內指名的第二個 Google 帳號，在正式表上 |
| 可觀察的損害 | (b) 帳號打不開正式表 ⇒ S7-b **無法開始**；(a) 帳號若被當責任編輯授權 ⇒ 30 格中 **18 格**與預期相反，而步驟指示的處置會把責任編輯移出 B 類允許名單，**使其部署後核可靜默失敗（本輪 K3 剛寫進票內的那一列）** |
| 受影響的價值 AC 或不可協商邊界 | **AC-4** 的 `Verified by:` 逐字寫「以**未列入保護範圍**的 Google 帳號」——與 S7-b 的角色標籤直接相反；步驟 6 B 類的設計理由；本票 `## 已知的工作內容` 第 4 點「八個審核欄位需設為**投稿者**不可編輯」 |
| 觸發證據 | 不是推測。`044` 的角色表、`044` 乙類的「只有你」設定、`044` 步驟 13 第 2 點**實測**「B 加入允許名單後寫 `reject_reason` 預期成功」、`044` 步驟 15 第 2 點的收尾移除——四處實讀 |

**修法是同一段裡的三句話**（全部落在 S7-b 第 1 點，不碰 AC、不碰承重數字、不碰 30 格內容）：

1. 角色改為**投稿者**：「用一個**不在任何保護範圍允許名單內**的非擁有者帳號
   （即 `044` 的 B 所扮演的**投稿者**角色）」。**不要**把它加進 B 類允許名單。
2. 補前置：**先把正式表以「編輯者」共用給該帳號**（`044` 步驟 6 的原句：
   不要勾選「編輯者可以變更權限和共用設定」），因為 `044` 收尾時已把它移出測試表、
   且從未加入正式表。
3. 補收尾（可選，`044` 步驟 15 有做）：S7-b 通過後把該帳號移出正式表共用名單。

> **這一筆不影響 S7-b 的其餘一切。** 30 格的欄位、類別、A1 位置、三個反向對照格、
> Ctrl+Z 還原與它的安全性論證、S7-a、S7-c 的落點與理由——**我逐項驗過，全部正確。**
> 缺的只是「誰去測、他憑什麼打得開那張表」。

### 三、K2／K3——兩筆都修對了，K3 有一處措辭過頭（Polish）

**K2 成立。** 步驟 6 A 類的「誰可以編輯」欄已從「**只有 captain**（連責任編輯都不給）」
改成「設為「只有 captain」——**但這不是授權 captain 去改**」，
理由欄改為「保護範圍**排除不了擁有者**，那是 Google 試算表的平台限制，不是本票刻意給的權限」。
**方向從「授權」翻成「平台限制」，正確。**
機械成因**我自己實讀 `a51b5d9` 的 `approval-workflow.gs:156-171`**：
該區間正是 `installApprovalFormulas` 從函式開頭到 `status` 那一行 `setFormula`，
兩個 `setFormula`（`current_fingerprint`、`status`）都落在區間內——**引用精確**。
還原方式（重跑「安裝／更新公式」）與「為什麼特別危險」（步驟 5／S6／步驟 7 第 4 點都讀 `status`）
都寫到了。同步端不受影響那句也保留且正確（`040:358` 的 `isApproved` 讀 `status`，
但閘門是 `review_decision` 與三份 Node 重算指紋）。

**K3 成立。** 「常見錯誤」表確實新增第五列「**沒有任何錯誤訊息，選單像是沒反應**」，
步驟 7 第 4 點那句相反的話已改成兩種原因並列，並在表後引用 `044` 原句、
明寫「本票原本第 4 點寫的是相反的話」。另補了「不要手動把 `status` 改成 `Approved` 來『修正』它」，
正好接上 K2——**那是最可能發生的錯誤反射動作。**

**沒有把 `044` 的實測結論講過頭，但有一處措辭過頭：**

- **實測範圍如實。** `044` 直接觀察到的是**拒絕**（`044` 步驟 11 的補述：
  「以未授權帳號執行 `Review → 拒絕選取列` **完全沒有作用且沒有錯誤訊息**（靜默失敗）」）；
  「核可**或**拒絕」是 `044` 自己在附帶規則二裡做的推廣。
  本票逐字引用 `044` 原句並註明「`044` 實測確認：沒有錯誤訊息」——**忠於來源，沒有加碼。**
- **K8（Polish）「責任編輯一定會踩到」措辭過頭。** 同一格的「原因」欄已正確寫成條件式
  （「執行者不在審核欄（B 類）保護範圍的允許名單內時就會這樣」），
  但「怎麼辦」欄寫「責任編輯**一定會**踩到」。
  **S7 的 B 類若設對，責任編輯就在允許名單內，核可會成功、不會踩到。**
  正確的說法是「**只有非擁有者踩得到**；責任編輯若被漏出允許名單就會踩到」。
  錯誤方向保守（促使讀者去檢查允許名單，而那正是對的動作），**不阻擋**。

### 四、K4——寫法正確，結論正確，但**指令的範圍少一個目錄**，且一句自評不準

**我自己重跑了那條指令。** 票內版本（`grep -rln '\b050\b'` ＋ 兩個 glob）跑出 **5 個檔**：
`040`／`064`／`056`／`_archive/041`／`_archive/044`——**與票內的表完全一致，`_archive/` 有涵蓋。**
逐處實讀後義務判定也全部正確：`044` 三項義務（本輪已全部採用）、
`040` 四項人工步驟**四項都在票內**（對應 S4／S5／S8／S7）、`064`／`056`／`041` 無義務。
票內的 `\b050\b` 比我上一輪用的裸 `050` 更好——它正確排除了 `0501 meeting agenda` 那個假命中。

**K9（Polish）指令的 glob 少一個目錄，而漏掉的那一檔記著同一項義務。**
把票內**同一條 regex** 改成遞迴（`--include=*.md docs/constitution-features/`）會多出第 6 個檔：
`_debriefs/2026-09-17-01-claude-claude-opus-5.md`。它的第 104 行寫：

> **050** …本節的 probe 已為其驗證兩件事：責任編輯不必是擁有者即可核可；
> **保護範圍必須以非擁有者帳號逐格實測驗收，不得以設定畫面為準。**

**那就是 `044` 的結論一，在 2026-09-17 被第二次記下來。**
義務內容沒有超出 `044`（我逐行讀完該檔 9 處），所以**不影響本輪的修正完整性**；
但「5 張票」這個集合是**對「票」而言完整**，而**指令寫下的掃描範圍比實際需要窄一個目錄**。
修法是把 glob 換成遞迴或加上 `_debriefs/`。

**那句自評的評價：後半準，前半不準。**

- **後半完全正確，而且是本節最有價值的一句**：「**它是一個不在場的東西**，
  發現的唯一辦法是反問『誰引用了本票』。」我就是這樣找到它的，沒有別的路。
- **K10（Polish）前半不準**：「第六族**是唯一產出 Material 的一族**」「**前五族全部是 Polish**」
  （第 1237-1238 行、十三節「K1：為什麼這一筆是 Material，而前面六輪的發現都不是」、cycle 6 Stage Report）
  **被票內自己的記錄推翻**：
  - 第九節的處置表第 1 列逐字是「**F2** | **Material**」；
  - `### Feedback Cycles` 的 Cycle 1 逐字是「**F2 fix（Material，最優先——它發生在產線全停窗口內）**」；
  - Cycle 3 逐字是「**H1（Material，本輪最要緊，captain 正在部署）**」，
    而 **H1 正是第四族的實例**（verify cycle 3 自己也寫「H1（Material・需 captain 裁決）」）。
  所以第四族**也**產出過 Material，前五族**並非**全部是 Polish。
  （十一節的表把 H1 的分類欄寫成「事實更新」，與 Cycle 3 的記錄不一致——那是既有的不一致，不是本輪造成。）
  **不阻擋任何一步**，但它寫在方法論小節裡，會被後續輪次當成事實引用。

### 五、K5／K6——兩筆都正確

**K5 成立。** `REPO=` 那一行加在 **S3 之前**（S2 的末段之後、S3 標題之前），
並如實記下我上一輪的實測（`git -C ""` exit 128、`node --env-file=""` exit 9、比對印 ⛔、不會假通過）。
**S3 區塊 `e308334897139517`、4511 B，`ec62f9f` 與 HEAD 逐位元組相同**——那一行確實在 S3 之外。
AC-6 的註解改成「AC-6（窗口已開）必須是 1；S3 重用這段時必須是 0」，**雙向都標了**。
**它是 bash 區塊裡的註解、不是 AC 的要求文字，這個宣稱成立**（見上方逐行差異）。

**K6 成立。** 原句保留，其下加 ⚠️ 更正列出三個檔與 provenance commit `36af185`。
**我自己跑 `git ls-tree --name-only main docs/content-pipeline/`**，得
`approval-permission-probe.md`／`data-collection-guide.md`／`design.md` 三個檔，
`operations.md` 不在其中——**更正準確，承重結論（本票不依賴 `operations.md`）仍然成立。**

### 六、未越界未回歸（全部自行量測，基準 `ec62f9f` 與 `384ca7a3c`）

| 項目 | 結果 |
|---|---|
| 正式試算表 | **零寫入零讀取。** 未發 HTTP 請求到試算表、未讀 `.env.local`；同步全在 `mktemp -d` 沙箱餵 127.0.0.1 fixture |
| `## Acceptance criteria` | 7009 B → 7063 B，**行級差異只有 K5 那一行 bash 註解**；AC 要求文字逐字未動 |
| S3 | `e308334897139517` 4511 B，**逐位元組未動** |
| S8 | `4454f27a2d7723be` 759 B，**逐位元組未動** |
| S7 原有內容 | HEAD 的 S7 區塊**以 `ec62f9f` 的 S7 區塊為前綴**（593 B 完整保留），S7-a/b/c 為 **5549 B 純新增**——12 個範圍的表逐位元組未動 |
| 「相依二」（含 🔴 三選項） | `59fcc4305f39d8a7` 5718 B **逐位元組未動**；🔴 未解、未代 captain 確認 |
| `## Out of scope`、步驟 8 區塊 | 各自逐位元組未動 |
| `### Feedback Cycles` | `e422f7dc04b54637` 11709 B **逐位元組未動**，**`- Cycle` 行數 ＝ 4**（Cycle 5 未由 worker 代寫） |
| 我上一輪的 review 報告 | `83b654ef63f7cb9a` **29645 B 逐位元組未動**（HEAD 與工作區皆同） |
| 承重數字 | 24 欄／18／21／12／16 筆 出現次數**完全不變**；9／15／59／12／15／6 段只增不減，**無任何值被替換**；且每一個值我本輪重算過 |
| 9／15 欄界線 | 重跑：9 欄安全前綴 main exit 0 且輸出與 baseline 逐位元組相同；**15 個窗口欄逐一單獨加，15 次全部 exit 1** |
| branch 範圍 | 只動票檔一個；`src/`／`scripts/` 零變動；`src/data/*.json` sha256 仍 `4d1992e3…cea3b`／`4071978a…3162` |
| 040 worktree | `git status` 為空，HEAD 仍 `a51b5d9` |
| Placeholder | cycle 6 新增行零命中 |
| 本輪 reviewer 的越界 | **未解 🔴、未代 captain 確認、未改任何 AC、未替 implement 修任何東西**（依 `## Review-finding disposition`，FO 授權前不變更候選位元組） |

> **一項附記，不是 finding**：工作區有一筆未提交的 frontmatter 改動
> （`status: implement` → `review`），那是 FO／工具的 stage 推進，不在我的權限內，**未觸碰**。

### 七、裁決

**REJECTED**，只因為 **K7** 一筆。

**K1 的實質內容是對的，而且是我要求的那一份。** 30 格的欄位與類別逐列就是 `044` 那張表；
90 個 A1 位置（30 格 × 3 分頁的欄序推導）我自己重算，逐格相同；
**三個反向對照格真的落在所有保護範圍之外，反向對照是活的**；
implement 拒絕照抄 `044` 的 `D2` 是對的——照抄會把 `site_tldr` 的反向對照指到 `status` 上。
自加的 Ctrl+Z 要求**正確且必要**（三格我實測都會改變輸出 sha256），
它宣稱的「此刻改內容是安全的」**我從 `APPROVAL_STATUS` 與 `installApprovalFormulas` 驗過，成立**。
S7-a 補上了模式指示，S7-c 的落點在 S8 之前且理由正確——**我重走那張偵測表，結論不變。**
K2／K5／K6 全部正確，K3 正確，K4 的寫法與結論正確。
**AC 一個字未動、🔴 未解、S3／S8／`### Feedback Cycles`／我的報告全部逐位元組未動。**

**但 S7-b 的執行者指示不能照著做**：它指名的帳號在 `044` 是**投稿者**、不是責任編輯，
而本票 B 類設的是「只有責任編輯」——角色寫反會讓 30 格裡的 **18 格**與預期相反，
而該步指示的處置會把責任編輯移出 B 類允許名單，**使其部署後核可靜默失敗**
（正是本輪 K3 剛寫進票內的那一格）。而且那個帳號**目前沒有正式表的權限**
（`044` 步驟 15 已把它移出測試表、從未加入正式表），**票內沒有一句建立這個前置**。
**S7-b 是為了擋住不可回復的假通過而存在的一步。它的「誰去測」必須是對的。**

**修法是 S7-b 第 1 點裡的三句話**（角色改投稿者且不入 B 類名單、補「先以編輯者共用正式表」前置、
補收尾移除），**不碰 AC、不碰承重數字、不碰那 30 格。**

另有三筆 Polish，**都不阻擋**，FO 可與 K7 併一輪處理或逕行 decline：
**K8** 「責任編輯一定會踩到」措辭過頭（同格的「原因」欄已正確）；
**K9** K4 的掃描指令 glob 少 `_debriefs/`，漏掉的那一檔在 2026-09-17 記著同一項義務；
**K10** 「第六族是唯一產出 Material 的一族／前五族全部是 Polish」被票內自己的
Cycle 1（F2 Material）與 Cycle 3（H1 Material，第四族）推翻。

**不在任務內、仍待 captain**：AC-4 要不要從 3 格擴到逐欄逐分頁並納入反向對照。

## Stage Report: review (cycle 2)

- DONE: K1 三項：**S7-b 那 30 格逐格核對**是否真的與 `044` 一致、**自己回算 A1** 並確認與 S7 的 12 個範圍一致、三個反向對照格真的落在所有保護範圍之外
  **30 格全部正確。** 兩張表機器逐列比對：欄位順序十列一致、類別映射（甲→A／乙→B／丙→C）一致、預期值一致；第 10 列由 `044` 寫死的 `content` 推廣為逐分頁 `content`／`abstract`／`text`，**是必要推廣不是偏離**。A1 位置我從第一節實測標題 ＋ S2／S4 順序自己重算（`WRITABLE_REVIEW_FIELDS` 實讀 `.gs` 確為 6 欄），**30 格逐格相同**，同一份欄序算出的保護範圍**就是 S7 那 12 個**。**三個反向對照格（`F2`／`G2`／`C2`）對各自分頁全部 4 個範圍逐一做包含判定，全部在範圍之外——反向對照是活的。** 另確認 **implement 不照抄 `044` 的 `D2` 是對的**：本票欄序下 `site_tldr` 的 D 是 `status`，照抄會把反向對照指到 A 類保護欄上，那一格就永遠測不出「可改」。
- DONE: 確認「必須用非擁有者帳號測」寫在顯眼處且指名的帳號來源可用；S7-a 的模式指示；S7-c 落點在 S8 之前並自己再走一次偵測表
  「用非擁有者帳號測，不是用 captain 的帳號」寫在 S7-b「怎麼測」第 1 點、粗體、附理由（保護範圍排除不了擁有者）——**位置顯眼、理由正確**。**但帳號的角色與可用性兩項都不成立，見 K7。** S7-a 正確：模式指示已進 captain 執行的步驟、逐字引用 `044` ⚠️ 原句、寫明 12 個範圍各確認一次，補上了上一輪「全票只在 AC-4 的『會怎麼失敗』出現一次」的缺口。S7-c 落點逐字確認在 **S7-b 之後、S8 之前**。**偵測表我重走一次（含新增的 S7-a／S7-b／S7-c）**：S7-a 是預防不是偵測（且它看的正是 `044` 證明會騙人的設定畫面）；**S7-b 是唯一的完整偵測**；S7-c 是 S7-b 的真子集；S5／S6／S8／S9／AC-1／AC-2／AC-3／AC-6 八道**全部偵測不到**（擁有者不受保護範圍限制、保護範圍不進輸出）。**「排在 S8 之後等於沒排」成立。**
- DONE: 判斷自加的 Ctrl+Z 要求正確且必要，並**驗「此刻改內容是安全的」**；確認 AC-4 未擴大、未代 captain 裁決，並判斷 30 格與 3 格並存是否讓執行者困惑
  **必要性實測**：改 `F2`（Track 1 `content`）→ `history.json` sha256 變；`G2`（Track 2 `abstract`）與 `C2`（`site_tldr` `order 0` 的 `text`）→ `discussions.json` sha256 變。三格全進輸出，**留著改動 AC-1 必定失敗**，所以這一條正確且必要，`044` 不需要的理由也正確。**安全性宣稱從程式驗過，成立**：`APPROVAL_STATUS:121` 在 `review_decision` 非 `Approved` 時回 `Needs review`，而 S4 的 15 欄全留白；`installApprovalFormulas:156-171` 逐列 `setFormula` **覆寫** `status`，原本的字面 `Approved` 在 S5 當下就被公式取代——**S7-b 時確實沒有任何一列已核可**，Ctrl+Z 不可能動到已核可的列。**AC-4 未擴大：`## Acceptance criteria` 7009→7063 B，行級差異只有 K5 那行 bash 註解**，`echo "exit=$?"` 指令與兩行 `grep` 判準逐字未動；「相依二」含 🔴 三選項 5718 B 逐位元組未動 ⇒ **未代裁決**。**30／3 並存不困惑**：S7-c 引言明寫「照 S7-b 做 30 格；AC-4／AC-5 依原文各自成立即可」。非阻擋的一句：可再補「S7-c 的實質工作是補 AC-4 要求的記錄格式（UTC 時間／三次結果／角色）」。
- DONE: K2 措辭是否從「授權」改成「平台限制」、**自己實讀 `approval-workflow.gs:156-171`**、還原方式與「為什麼特別危險」；K3 表列新增與第 4 點改寫、**確認沒把 `044` 結論講過頭**
  **K2 成立。** A 類「誰可以編輯」改為「設為『只有 captain』——**但這不是授權 captain 去改**」，理由改為「保護範圍**排除不了擁有者**，那是平台限制，不是本票刻意給的權限」——方向翻對了。**`a51b5d9:approval-workflow.gs:156-171` 我自己實讀**：該區間正是 `installApprovalFormulas` 從函式開頭到 `status` 的 `setFormula`，兩個 `setFormula` 都在區間內，**引用精確**。還原方式與「壞掉的是本票自己的驗證迴路（步驟 5／S6／步驟 7 第 4 點都讀 `status`）」都寫到。**K3 成立**：「常見錯誤」表確有第五列「沒有任何錯誤訊息，選單像是沒反應」，第 4 點已改成兩種原因並列並自承原句相反，另補「不要手動把 `status` 改成 `Approved` 來『修正』它」接上 K2。**沒有把實測講過頭**：`044` 直接觀察到的是**拒絕**（步驟 11 補述），「核可或拒絕」是 `044` 自己的推廣，本票逐字引用原句、忠於來源。**但一處措辭過頭 → K8（Polish）**：「責任編輯**一定會**踩到」——B 類設對時責任編輯在允許名單內、不會踩到；同格「原因」欄已正確寫成條件式。錯誤方向保守，不阻擋。
- DONE: K4 **自己重跑那條檢查指令**、判斷「5 張票」集合是否完整（含 `_archive/`）、評價那句自評
  **票內指令原樣重跑得 5 個檔**（`040`／`064`／`056`／`_archive/041`／`_archive/044`）——**與票內表完全一致，`_archive/` 有涵蓋**；逐處實讀，義務判定全部正確（`044` 三項、`040` 四項且四項都在票內對應 S4／S5／S8／S7、其餘三張無義務）。票內的 `\b050\b` 比我上一輪的裸 `050` 更好，正確排除 `0501` 假命中。**→ K9（Polish）**：同一條 regex 改成遞迴會多出 `_debriefs/2026-09-17-01-…md`，其第 104 行記著「**保護範圍必須以非擁有者帳號逐格實測驗收，不得以設定畫面為準**」——**同一項義務的第二次記錄**。義務內容未超出 `044`（該檔 9 處我逐行讀完），不影響修正完整性；但指令的 glob 比實際需要窄一個目錄。**自評後半準、前半不準**：「它是一個不在場的東西，唯一辦法是反問誰引用了本票」**完全正確且最有價值**；**→ K10（Polish）**「第六族是唯一產出 Material 的一族／前五族全部是 Polish」被票內自己推翻——第九節表第 1 列「**F2 | Material**」、Cycle 1「F2 fix（Material，最優先）」、Cycle 3「**H1（Material，本輪最要緊）**」而 **H1 正是第四族**。
- DONE: K5 `REPO=` 在 S3 之前且 S3 逐位元組未動、AC-6 註解雙向標註，**逐位元組確認「AC 整段本輪差異只有這一行註解」**；K6 相依一更正並自己跑 `git ls-tree`
  **K5 成立**：`REPO=` 在 S2 末段之後、S3 標題之前，**S3 區塊 `e308334897139517` 4511 B 在 `ec62f9f` 與 HEAD 逐位元組相同**——那一行確實在 S3 之外；並如實記下我上一輪的實測（exit 128／exit 9／⛔、不會假通過）。註解改為「AC-6（窗口已開）必須是 1；S3 重用這段時必須是 0」，雙向都標。**「AC 整段差異只有這一行」逐位元組確認成立**（唯一差異行即該註解，指令本體與 `grep` 判準未動）。**K6 成立**：原句保留、⚠️ 更正列出三個檔與 provenance `36af185`；**我自己跑 `git ls-tree --name-only main docs/content-pipeline/`** 得三個檔、`operations.md` 不在其中，承重結論仍成立。
- DONE: 未越界未回歸（AC 要求文字、S3／S8、承重數字、`- Cycle` ＝ 4、我自己的報告、branch 範圍、040 worktree、diff 基準自算）
  diff 基準**自算** ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`，複審基準 `ec62f9f`。**正式試算表零寫入零讀取**，未讀 `.env.local`。**S3 4511 B、S8 759 B、`### Feedback Cycles` 11709 B、「相依二」5718 B、`## Out of scope` 3280 B、步驟 8 區塊 1419 B、我上一輪的 review 報告 29645 B——全部逐位元組未動**；**`- Cycle` 行數 ＝ 4**。**S7 為純新增**：HEAD 的 S7 區塊以 `ec62f9f` 的 593 B 為前綴，S7-a/b/c 共 5549 B 新增，12 範圍表未動。承重數字 24 欄／18／21／12／16 筆 次數完全不變，其餘只增不減、無值被替換，且每一個值本輪重算過（含重跑 9／15 欄界線：9 欄 exit 0 且輸出與 baseline 逐位元組相同、**15 個窗口欄逐一單獨加 15 次全部 exit 1**）。branch 只動票檔一個、`src/`／`scripts/` 零變動、`src/data/*.json` sha256 未變、**040 worktree `git status` 為空且 HEAD 仍 `a51b5d9`**、cycle 6 新增行 placeholder 零命中。未用 `sort`／`uniq` 判定中文字串、未用 `awk`。**未解 🔴、未代 captain 確認、未改任何 AC、未替 implement 修任何東西。** 附記：工作區有一筆未提交的 frontmatter `status: implement→review`，屬 FO／工具的 stage 推進，**未觸碰**。

### Summary

**K1 的實質內容是對的，而且正是我上一輪要的那一份。** 30 格的欄位與類別逐列就是 `044` 那張表；
A1 位置我自己重算，30 格逐格相同，同一份欄序算出的就是 S7 原有的 12 個範圍；
**三個反向對照格（`F2`／`G2`／`C2`）對全部 4 個範圍逐一判定，都在範圍之外——反向對照是活的**，
而 implement 拒絕照抄 `044` 的 `D2` 是對的：本票欄序下 `site_tldr` 的 D 是 `status`。
自加的 Ctrl+Z **正確且必要**（三格實測都改變輸出 sha256），它宣稱的「此刻改內容是安全的」
我從 `APPROVAL_STATUS:121` 與 `installApprovalFormulas:156-171` 驗過，**成立**。
S7-a 補上模式指示；S7-c 卡在 S8 之前，而我重走偵測表後確認 S7-b／S7-c 仍是唯一兩道。
K2／K3／K5／K6 全部正確，K4 的寫法與結論正確。
**AC 整段的差異只有一行 bash 註解，🔴 未解，S3／S8／`- Cycle` ＝ 4／我的報告全部逐位元組未動。**

**裁決 REJECTED，只因 K7：S7-b 的「誰去測」錯了。** 票內指名的第二個 Google 帳號在 `044` 是
**投稿者**、`責任編輯` 是 captain 自己（擁有者）；而本票 B 類設的是「只有責任編輯」，
不是 `044` 的「只有你」。角色寫反會讓 30 格裡的 **18 格**與預期相反，
而該步對不符的處置會把責任編輯移出 B 類允許名單，**使其部署後核可靜默失敗**——
正是本輪 K3 剛寫進票內的那一格。加上該帳號**目前沒有正式表權限**
（`044` 步驟 15 已將它移出測試表、從未加入正式表），票內沒有一句建立這個前置。
**S7-b 是為了擋住不可回復的假通過而存在的一步；它的執行者必須是對的。**
修法是同一段裡的三句話，不碰 AC、不碰承重數字、不碰那 30 格。
另有 K8／K9／K10 三筆 Polish，皆不阻擋。

## Stage Report: implement (cycle 7)

- DONE: K7 fix（**Material，最優先**）S7-b 第 1 點的「誰去測」寫錯角色，三句話修法：角色改為投稿者且不入 B 類名單、補「先以編輯者身分共用正式表」的前置、補收尾移除。不碰 AC、不碰承重數字、不碰那 30 格與 30 個 A1 位置。
  三項都做了，全部落在 S7-b 第 1 點。**角色**：改為「測試者必須是投稿者角色的帳號——不是 captain，也不是責任編輯」，並逐條寫出理由（captain 是擁有者、保護範圍排除不了他；責任編輯本來就改得動 B 類那六欄），附 `044` 帳號表的原始定義（**A ＝ 責任編輯／核可者 ＝ 測試表擁有者；B ＝ 投稿者，以「編輯者」身分受邀，不是擁有者**），並加 ⛔ 明寫不要把該帳號加進 B 類或任何一類的允許名單。**前置**：實查確認該帳號目前沒有正式表權限——`044` 步驟 15 第 2 點已把它從**測試表**移除、且從未加入正式表，票內原本沒有一句建立這個前置。修法寫明時機（S7 的 12 個範圍全設完之後才共用，比照 `044` 步驟 6 的「先保護，後邀請。否則 B 會有一段可以動任何欄位的空窗」）與做法（共用 → 加入該帳號 → 權限「編輯者」，**不勾**「編輯者可以變更權限和共用設定」）。**收尾**：S7-b 與 S7-c 都做完之後把該帳號從正式表共用名單移除，比照 `044` 步驟 15 第 2 點，並寫明為什麼不能忘（正式表是 40 筆已上線內容的唯一來源）。
  **那 30 格與 30 個 A1 位置逐位元組未動**（以區塊比對確認），S7 的 12 個範圍表亦未動。
- DONE: K7 一併要求——把「為什麼角色必須是投稿者」寫清楚：30 格裡哪些格的預期值取決於測試者角色、角色寫反時它們會怎麼假通過。下一個執行者要能自己看出角色不能換。
  新增 S7-b 的子小節「為什麼角色必須是投稿者——30 格裡有 18 格的預期值取決於它」。**12／18 分堆表**：與角色無關的 12 格（第 1 格標題列 C 類、第 2-3 格 A 類、第 10 格未保護——A／C 類設「只有 captain」，投稿者與責任編輯都被擋；第 10 格沒保護，兩者都改得動）；**取決於角色的 18 格**（第 4-9 格六個審核欄 × 3 分頁，因為 B 類的允許名單裡就是責任編輯）。12＋18＝30。
  **兩條假通過路徑逐條寫出，兩條都傷部署後的責任編輯**：(1) 實際拿責任編輯去測 → 18 格回報「可改」與表上的「擋」不符 → 照第 4 點「回頭補設該範圍」→ **把責任編輯移出 B 類允許名單** → 30 格從此全部相符、S7-b 通過、部署繼續 → **部署後責任編輯核可靜默失敗**，而 captain 是擁有者測不到，洞會撐到有人回報「選單沒反應」；(2) 實際拿投稿者去測但票上寫成責任編輯 → 18 格正確回報「擋」→ 有人讀成「B 類對責任編輯設對了」，**而那個結論沒有被證明**——B 類就算設成「只有 captain」或名單為空，30 格照樣全過。
  **另主動標出一項殘留缺口並寫明本輪不修的理由**：S7-b 只驗「投稿者改不到」，**不驗「責任編輯改得到」**。補這個方向要動那 30 格或擴大 AC-4，**兩者本輪都無權限**（30 格 review 已逐格驗過、AC-4 擴大屬 captain 且未裁決）；最早偵測點是 S8，而本票 S8 寫的是 captain 執行，**所以照票做不會觸發這個偵測**——缺口是實的，已寫在票內請下一位知道它在。
- DONE: K8 fix（Polish）「責任編輯一定會踩到」措辭過頭，收斂。
  兩處都改：步驟 7「常見錯誤」表最後一列與第十三節，改為「**責任編輯只要不在 B 類的允許名單內就會踩到**」；「也是部署後的常態」改為「也是部署後執行核可的人」。同一格的「原因」欄本來就寫對（條件式），未動。
- DONE: K9 fix（Polish）K4 的掃描指令 glob 少了 `_debriefs/`，修掉 glob 並把這件事記下來。
  指令改為 `grep -rln '\b050\b' docs/constitution-features/ | grep -v '^docs/constitution-features/050-ssot-approval-deployment'`——`-r` 掃整個目錄，不用 glob。**實跑對照：新版命中 8 個檔，舊版 5 個**，漏掉的三個是 `_debriefs/2026-09-17-01-…`（**在 2026-09-17 就記著同一項義務**：「保護範圍必須以非擁有者帳號逐格實測」，另記 `044` 步驟 13 是為驗證 050 步驟 6 的兩層保護分法而納入）與 `_archive/044/review/{review,verify}/briefing-1/index.json` 兩檔（只在 `uri` 欄引用本票路徑，非義務）。三個新增檔已進「第六族」那張表，`_debriefs/2026-09-17` 那一列標明它是**同一項義務的第二個見證、而且比 `044` 的票更早被寫下**。
  邊界宣告內加 ⚠️ 記下這件事，並明寫**這是第六族自己的形狀**——為了抓「別人指定本票要做的事」而寫的掃描，自己漏掉了記著那項義務的檔。另記 `\b050\b` 的詞界是必要的（沒有它 `0501`、`sha256:…050…` 都會命中），五處詞界誤判已列出。**並寫明這一筆是 review 查出的（K9），不是本票自己發現的。**
- DONE: K10 fix（Polish）「第六族是唯一產出 Material 的一族／前五族全部是 Polish」改成準確陳述，並寫明更正來源是 review 而非 FO。
  三處都處理。第九節「第六族」那一小節：加 ⚠️ 更正塊保留原句、指出**被票內自己的 `### Feedback Cycles` 推翻**（Cycle 1 的 F2 是 Material、Cycle 3 的 H1 是 Material 且 H1 正是第四族），並照 FO 要求寫明**那兩句出自 FO 在 K4 的授權書、兩邊都沒有回頭對 Cycle 記錄、這一筆是 FO 自認的錯**，以及**更正來源是 review 在第七輪查出的 K10**。換上準確陳述：**六族各自最高等級表**（第四族與第六族各一筆 Material，第一／三／五族 Polish，第二族無缺陷），並註明 Cycle 1 的 F2 也是 Material 但不屬這六族（那是 AC-6 判準字串對不上，與引用無關）。邊界宣告刪去「前五族全部是 Polish」一句。第六輪 Stage Report 的同一個錯誤（「K1 是六輪以來第一筆 Material」）**追加更正、原句保留**。
  **第六族真正獨有的性質改寫為兩點**：它在票內沒有留下任何可檢查的東西；以及 **K1 是唯一一筆「照票做完之後沒有任何一步會揭露錯誤」的 Material**——F2 大聲失敗、H1 傷決策品質，只有 K1 靜默。
- DONE: 未越界。
  **正式試算表零寫入零讀取**（未發出任何 HTTP 請求、未跑任何同步）。**AC 的要求文字與 `## Acceptance criteria` 整段逐位元組未動**；**AC-4 的擴大仍待 captain，本輪未動**；🔴 未解、未代 captain 確認。**那 30 格表與 30 個 A1 位置逐位元組未動**，S7 的 12 個範圍表亦未動。**S3 與 S8 逐位元組未動**。承重數字 24／9／15／59／12／6 原值保留。**未改寫 review 的報告**——`## review stage 獨立審查`、`## Stage Report: review`、`## review stage 第二輪`、`## Stage Report: review (cycle 2)` 四個區塊以區塊比對確認逐位元組未動；verify 的五輪報告亦未動。本輪唯一動到的既有 Stage Report 是**本票自己的 cycle 6 那一份**（追加 K10 的更正，原句保留）。**`### Feedback Cycles` 逐位元組未動、`- Cycle` 行數維持 4**。整條 branch 只動 `docs/constitution-features/050-ssot-approval-deployment.md` 一個檔；`git diff --stat $(git merge-base main HEAD) -- src/ scripts/` 無輸出；`src/data/*.json` sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`；040 worktree `git status` 為空、HEAD 仍為 `a51b5d9`。diff 基準自算 ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。未用 `sort`／`uniq` 判定中文字串，未用 `awk`。

### Summary

四筆修完。**K7 是「30 格全部正確，但叫錯人去測」——而叫錯人的話，那 30 格有 18 格會翻面。**

S7-b 原本寫「用 `044` 那個第二個帳號（責任編輯角色）」。
**那個帳號在 `044` 裡是投稿者**，而本票 B 類設的是「只有責任編輯」。
所以那六個審核欄的預期值「擋」**只對投稿者成立**——換成真的責任編輯，它們應該是「可改」。
兩條假通過路徑都指向同一個後果：**部署後責任編輯核可靜默失敗**，
正是上一輪我剛把它寫進步驟 7「常見錯誤」表的那一列。
而 captain 是擁有者，他測不到、也不會遇到。

三句話的修法都落在 S7-b 第 1 點，**那 30 格與 30 個 A1 位置一個字沒動**。
補的前置是實查來的：`044` 步驟 15 已把該帳號從測試表移除，而它從未加入正式表——
**票內原本沒有一句建立這個前置**，照票做會卡在「登入之後打不開正式表」。
收尾的移除也補了，比照 `044` 步驟 15。

**我另外主動標出一項本輪修不了的缺口**：S7-b 只驗一個方向。
它證明「投稿者改不到那六欄」，**不證明「責任編輯改得到那六欄」**——
B 類設成「只有 captain」或名單為空，30 格照樣全過。
補這個方向要動那 30 格或擴大 AC-4，兩者本輪都無權限，所以我把它寫成具名缺口留在票內。

**K9 值得記一筆，因為它是第六族在我自己身上發作。**
我為了抓「別人指定本票要做的事」而寫的掃描指令，glob 只涵蓋兩層 `.md`，
**漏掉的那一檔在 2026-09-17 就記著同一項義務**。指令已改成 `-r` 掃整個目錄，
命中從 5 個檔變 8 個。這一筆是 review 查出的，不是我自己發現的，票內已照實寫明。

**K10 照 FO 的要求記成 FO 的錯，並註明更正來源是 review。**
「第六族是唯一產出 Material 的一族」被票內自己的 Cycle 1 與 Cycle 3 推翻。
換上的準確陳述是一張六族最高等級表，並把第六族真正獨有的性質寫成
「它在票內沒有任何可檢查的東西」與「K1 是唯一靜默的那一筆 Material」。
第六輪 Stage Report 裡同一個錯誤也追加了更正，原句保留。

## review stage 第三輪：K7-K10 複審（2026-09-24）——**PASSED**

同一位 reviewer。**對正式 Google 試算表零寫入、零讀取**（未發任何 HTTP 請求、未讀 `.env.local`）。
未跑 `npm run sync-content`。diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3c`；
複審基準為我上一輪的 commit `03af7b6`。未用 `sort`／`uniq` 判定中文字串，未用 `awk`。

### 一、K7——**修對了，四個元素逐項驗過**

**角色定義**：我自己去 `044` 讀那張表（`## 角色與帳號`），逐字是
**A ＝ 責任編輯／核可者，測試表擁有者，captain 現用的 Google 帳號**；
**B ＝ 投稿者，以「編輯者」身分受邀，不是擁有者，第二個 Google 帳號**。
票內引的與原文相符。它還把「為什麼不能是 captain」「為什麼不能是責任編輯」分開寫，
兩個理由都正確。**⛔「不要把它加進 B 類（或任何一類）的允許名單」寫進去了。**

**「先保護，後邀請」**：時機寫成「S7 的 12 個範圍全部設完之後才共用」，
並引 `044` 步驟 6 的原句（我實讀，逐字為「**順序不可顛倒。** 先保護，後邀請。
否則 B 會有一段可以動任何欄位的空窗。」）。做法（共用 → 編輯者 → 不勾「可以變更權限和共用設定」）
與 `044` 步驟 6 末段相符。**前置也補了**：`044` 步驟 15 第 2 點逐字為
「把 B 從測試表的共用名單移除」，而 `044` 全程未碰正式表——所以該帳號確實沒有正式表權限。
**收尾移除**寫進去了，理由（正式表是 40 筆已上線內容的唯一來源，不該留一個只為測試而開的編輯者）正確。

#### 12／18 分堆表：我自己重算，完全相符

建模方式：`A 類 → 只有擁有者`、`B 類 → 只有責任編輯`、`C 類 → 只有擁有者`、
第 10 格未保護，再加上「**保護範圍排除不了擁有者**」這條平台規則，對三種角色逐格求值：

| # | 欄位 | 類 | 投稿者 | 責任編輯 | captain | 表上預期 | 是否取決於角色 |
|---|---|---|---|---|---|---|---|
| 1 | 標題列 | C | 擋 | 擋 | 可改 | 擋 | 否 |
| 2-3 | `status`／`current_fingerprint` | A | 擋 | 擋 | 可改 | 擋 | 否 |
| 4-9 | 六個審核欄 | B | **擋** | **可改** | 可改 | 擋 | **是** |
| 10 | 內容欄（反向對照） | — | 可改 | 可改 | 可改 | 可改 | 否 |

**與角色無關 ＝ 每分頁 4 格 × 3 ＝ 12；取決於角色 ＝ 每分頁 6 格 × 3 ＝ 18；12＋18＝30。**
與票內的表逐格相同。

#### 兩條假通過路徑：我自己走過，兩條都成立

| 路徑 | 我的重現 |
|---|---|
| **1　拿責任編輯去測** | 逐格求值得**每分頁 6 格不符、共 18／30**，與票內相符。照第 4 點「回頭補設該範圍」→ B 類唯一能再收緊的方向就是把責任編輯移出允許名單 → 30 格全符、S7-b 通過 → **部署後責任編輯核可靜默失敗**（步驟 7「常見錯誤」表最後一列）。成立 |
| **2　拿投稿者去測（B 類設定未被證明）** | **這一條我用三種 B 類設定各跑一次**：`只有責任編輯`（正確）、`只有 captain`（責任編輯被排除）、`允許名單為空`——**三種都是 30／30 全過**。投稿者在三種設定下都不在允許名單內，所以那六格一律「擋」。**票內「B 類就算設成只有 captain、或允許名單是空的，這 30 格照樣全過」逐字成立。** 30 格證明的是「投稿者改不到」，**不含「責任編輯改得到」** |

#### 殘留缺口的分類：**Deferred risk**，不是 Material——但**它不是 captain 正在裁決的那個方向**

**四項證據欄位：**

| 欄位 | 內容 |
|---|---|
| 已發布使用者與正常流程 | 責任編輯在部署後執行 `Review → 核可選取列`／`拒絕選取列`。**是受支持的常態流程**（步驟 6 B 類就是為這個角色設的；`044` P7 已驗過非擁有者在名單內可核可） |
| 可觀察的損害 | 若 B 類允許名單漏掉責任編輯，他的核可／拒絕**靜默失敗、沒有錯誤訊息**，該列停在 `Needs review`；而 040 的閘門要求 `review_decision` 與三份指紋，**該列就不會發布**。所以是**對已發布內容 fail-closed**（不會有錯的內容上線），對操作者 fail-open（沒有訊息）。**減損因子**：第六輪剛補的「常見錯誤」最後一列已給出一步到位的診斷 |
| 受影響的價值 AC 或不可協商邊界 | **沒有。** 本票的 AC 沒有一條涵蓋正向：AC-4 是反向（非核可者改不到）、AC-5 是標題列、AC-1／2／3／6 是內容與產線。**正向這件事在本票目前的承諾之外**（`044` 以自己的 P7／AC-9 在測試表上驗過一次） |
| 觸發證據 | **未觀察到。** K7 修好之後，runbook 不再誘發這個設定錯誤；剩下的是一般性的 S7 允許名單填錯，而 S7-b／S7-c 偵測不到 |

**第三欄與第四欄都不成立 ⇒ 依 `## Review-finding disposition` 的定義是 Deferred risk**
（「觸發是假設的、未觀察到的，或在目前承諾之外」），不是 Material。

**升級為 Material 的條件（任一成立）：**

1. **captain 裁決擴大 AC-4（或新增一條 AC）涵蓋正向**——那一刻它就變成「有 AC、但 runbook 沒有任何一步驗它」。
2. **S8 改由責任編輯執行**——部署本身就依賴 B 類寫入權，runbook 必須在窗口前先驗。
3. **部署後有人回報「選單沒反應」**——那就從未觀察變成已觀察。

**「會不會讓 captain 照票做完而 B 類其實沒設對？」——會，我已經證明（上方路徑 2 的三種設定全過）。**
但**照票做不會失敗**：S1-S9 與步驟 9 每一步都走得完，已發布內容正確，AC-1／2／3／6 全都成立。
壞的是部署**之後**責任編輯能不能核可，而那一格現在有診斷路徑。**所以它不擋部署。**

**⚠️ 它不是 captain 正在裁決的那個方向。這一點請 FO 帶給 captain。**

待裁決的問題票內逐字是「**AC-4 本身要不要從 3 格擴到逐欄逐分頁、要不要納入反向對照**」。
拆開來是兩件事：

| 待裁決的成分 | 指的是什麼 |
|---|---|
| 「擴到逐欄逐分頁」 | 把**反向**（擋）的涵蓋面從 3 格擴到 9 格 × 3 分頁 ＝ S7-b 的前 9 列 |
| 「納入反向對照」 | **第 10 列——內容欄必須可改**（票內第 990、992、1702 行的定義：確認未過度保護） |

**殘留缺口是第三個方向**：「以責任編輯身分測 B 類六欄**必須可改**」。
**它不在上面兩個成分裡。** 而且票內在 S7-b 的缺口框裡把它也叫做「一組反向對照」——
**同一個詞指了兩件不同的事**，所以 captain 讀到「要不要納入反向對照」時，
**很可能以為已經包含它了**。

**後果就是 FO 說的那件事**：若裁決照現行措辭進行，captain 決定的是
「門檻寫在哪裡、涵蓋幾格」，而**正向這個方向仍然不會被任何一步驗到**。
**建議把它當成一個獨立、換過措辭的項目送 captain**，不要讓它混在「反向對照」裡。
（本輪未動 AC 一個字，也未代裁決。）

### 二、K8／K9／K10

**K8 成立。** 兩處都改了：步驟 7「常見錯誤」表最後一列與第十三節的 K3 段，
都成為條件式「**責任編輯只要不在 B 類的允許名單內就會踩到**」，
「也是部署後的常態」改為「也是部署後執行核可的人」。
**同格的「原因」欄逐字未動**（「執行者不在審核欄（B 類）保護範圍的允許名單內時就會這樣」）。

**K9 成立，新舊兩版我自己跑了對照：**

| 版本 | 命中 |
|---|---|
| 舊版（兩層 glob） | **5 個檔**：`040`／`056`／`064`／`_archive/041`／`_archive/044` |
| 新版（`-r` 整個目錄） | **8 個檔**：上列 5 個 ＋ `_debriefs/2026-09-17-01-…md` ＋ `_archive/044/review/{review,verify}/briefing-1/index.json` |

**8 對 5 逐字成立。** 新增三個我逐一實讀：debrief 記著同一項義務（非新義務）；
兩個 `index.json` 只在 `uri` 欄位出現 `git-root://main/<sha>/…/050-…md`，**是 briefing 產物、無義務** ——
票內的表兩項都判對了。「**這是第六族自己的形狀**」這個自我評價**準確**：
為了抓「別人指定本票要做的事」而寫的掃描，自己漏掉了記著那項義務的檔。
**`\b050\b` 詞界的必要性我也確認了**（見下方 K12 的數字更正）。

**K10：三處我上一輪點名的位置，處理了兩處半——見下方 K13。**
**六族最高等級表我逐列核對，正確：**

| 族 | 表上寫的 | 我的核對 |
|---|---|---|
| 第一族 | Polish | ✅ 第九節處置表逐字「**F1** \| Polish」「**F3** \| Polish」 |
| 第二族 | 無缺陷 | ✅ G2 補進表的 4 處全部實讀通過 |
| 第三族 | Polish | ✅ `design.md` 引錯檔名那一筆——票內自己寫「實質規則沒有變，captain 要做的事一個字都沒變」，依定義是 Polish |
| **第四族** | **Material** | ✅ `### Feedback Cycles` Cycle 3 逐字「**H1（Material，本輪最要緊，captain 正在部署）**」 |
| 第五族 | Polish | ✅ 第十二節逐字「提出 J1／J2，**兩筆都是 Polish**」 |
| **第六族** | **Material** | ✅ K1 |
| （F2 不屬六族） | Material | ✅ Cycle 1 逐字「**F2 fix（Material，最優先）**」，而 F2 是 AC-6 的判準字串，與「引用」無關 |

**「K1 是唯一一筆『照票做完之後沒有任何一步會揭露錯誤』的 Material」——站得住，但要補一句限定。**
F2 **確實大聲失敗**（AC-6 的 `grep` 印 ⛔、exit code 也在，只是指錯方向）。
H1 則要說清楚：**H1 的失真同樣沒有任何自動檢查會揭露**——
讓它不靜默的不是某一道驗收，而是**它的主題本來就卡在一個強制的 🔴 裁決閘門後面**，
那個閘門會迫使 captain 去把 `044` 打開。**K1 完全沒有閘門，也沒有檢查。**
所以票內劃的那條界線（**成品 vs 決策、有閘門 vs 無閘門**）是對的，
句子可以留，但「只有 K1 靜默」嚴格說是「只有 K1 既無檢查也無閘門」。

### 三、三筆 Polish（全部不阻擋，FO 可併一輪或逕行 decline）

**K11　第六族那張表的一句 provenance 寫反了。** 表內 debrief 那一列寫
「**而它比 `044` 的票更早被寫下**」。**實查：不成立，順序是反的。**

| 見證 | 內容日期 | 進 repo 的 commit |
|---|---|---|
| `044` 的「執行結果與交給 feature 050 的結論」（含結論一） | 節標題逐字「（**2026-09-15** 追加）」 | `36af185`，**2026-09-15** |
| `_debriefs/2026-09-17-01-…md` | 2026-09-17 | `39ea85e`，**2026-09-17** |

**`044` 的票早兩天，是第一個見證；debrief 是第二個、較晚的那一個。**
（同一節的邊界宣告只寫「在 2026-09-17 就記著同一項義務」，**沒有下順序斷言，那句是對的**；
過頭的只有表格那一格。）
**FO 要我確認的實質點成立，而且不受順序影響：那項義務有兩個見證，兩個都被漏掉六輪。**
準確說法是：**2026-09-15 由 `044` 自己寫下，2026-09-17 由 debrief 再寫一次。**

**K12　詞界誤判的處數寫錯，而且同一段前後不一致。**
第六族那一段開頭寫「**兩處**詞界誤判已排除」，結尾寫「這**五處**都不是對本票的引用」，
第十四節 K9 也寫「五處」。**實測：4 處，分布在 3 個檔。**

| 檔 | 裸 `050` 命中 | `\b050\b` 命中 | 詞界排除 | 內容 |
|---|---|---|---|---|
| `_debriefs/2026-05-02-01.md` | 2 | 0 | 2 | 兩處都是 `0501`（會議日期） |
| `056-…/review/review/briefing-1/index.json` | 1 | 0 | 1 | `sha256:32bdcbd0de720e83d3d4fea050324c2…` |
| `056-…/review/verify/briefing-1/index.json` | 1 | 0 | 1 | 十六進位摘要中的 `…19d050a23e` |
| **合計** | **4** | **0** | **4** | |

另外票內舉的例子 `#6-#27`（PR 編號）**不含 `050`**，不是詞界誤判之一。
**但承重結論正確且我已確認：`\b050\b` 的詞界是必要的**——
去掉它會多命中 3 個檔、4 處，全部無關（兩個十六進位摘要與一個會議日期）。

**K13　K10 沒有完全套用：我上一輪點名的三處，第十三節那一處還在。**
第 1684 行的小節標題仍是「**#### K1：為什麼這一筆是 Material，而前面六輪的發現都不是**」，
第 1686 行仍是「**前五族的錯都是「查不到出處」**」。
**兩句就是 K10 判為不成立的那兩句**（F2 與 H1 都是 Material；H1 屬第四族，
而 H1 的錯不是「查不到出處」，是被引用票的狀態變了、導致三個 🔴 選項失真）。
其餘兩處都處理了（第九節邊界宣告把該句刪除、第六族小節加 ⚠️ 並換上準確的表），
**但第十三節這一處沒有 ⚠️、也沒有指向更正的指標**，而它是標題形式——最容易被後續輪次原句引用。

> **一併更正我自己上一輪的一個數字**：我寫「30 格與 **90 個** A1 位置」，
> 而那張表是 10 列 × 3 分頁 ＝ **30 格、30 個 A1 參照**（我實數表內反引號 A1 共 30 個）。
> 正確是 30。本票第十四節與 cycle 7 Stage Report 引了我那個 90，**兩處都該是 30**。
> 逐格核對的結論不變——30 格我全部重算過兩輪。

### 四、未越界未回歸（基準 `03af7b6` 與 `384ca7a3c`，全部自行量測）

| 項目 | 結果 |
|---|---|
| 正式試算表 | **零寫入零讀取**；未讀 `.env.local`；未跑 `sync-content` |
| `## Acceptance criteria` 整段 | `36c45dd03748e3c6`、7063 B，**逐位元組未動**；**AC-4 的擴大仍待 captain，本輪未動** |
| 「相依二」（含 🔴 三選項） | `59fcc4305f39d8a7`、5718 B，**逐位元組未動** ⇒ 🔴 未解、未代 captain 確認 |
| S7-b 的 30 格表 | `ea5c762def3e8ac4`、743 B，**逐位元組未動**（30 個 A1 參照全在內） |
| S7 的 12 範圍表 | `84d657895c17baff`、593 B，**逐位元組未動** |
| S3 ／ S8 | `e308334897139517` 4511 B ／ `4454f27a2d7723be` 759 B，**兩者逐位元組未動** |
| `### Feedback Cycles` | `e422f7dc04b54637`、11709 B，**逐位元組未動**；**`- Cycle` 行數 ＝ 4** |
| 我自己的四個 review 區塊 | review#1 本文 21396 B、review#1 Stage Report 8249 B、review#2 本文 24799 B、review#2 Stage Report 10833 B——**四個全部逐位元組未動** |
| verify 五輪報告 | 17547／17091／15522／14214／7164 B——**五份全部逐位元組未動** |
| 本輪動到的既有 Stage Report | **只有本票 cycle 6 那一份**，且是**純追加**一則 ⚠️（原句保留，並寫明「來源是 review 的 K10，不是本票自己發現的」） |
| 承重數字 | 24 欄／18／21／12／16 筆 出現次數**完全不變**；9／15／59／12／15／6 段只增不減，**無任何值被替換** |
| branch 範圍 | 只動票檔一個；`src/`／`scripts/` 零變動；`src/data/*.json` sha256 仍 `4d1992e3…cea3b`／`4071978a…3162` |
| 040 worktree | `git status` 為空，HEAD 仍 `a51b5d9` |
| 本輪 reviewer | **未解 🔴、未代 captain 確認、未改任何 AC、未替 implement 修任何東西** |

> 附記（非 finding）：工作區有一筆未提交的 frontmatter `status: implement → review`，
> 屬 FO／工具的 stage 推進，**未觸碰**。

### 五、裁決

**PASSED。**

**K7 修對了**，而且是四個元素都對：角色（我去 `044` 讀了那張表）、
「先保護，後邀請」的順序與理由、⛔ 不入任何允許名單、以及我上一輪點出的那個
從未被建立的前置（共用正式表）與收尾移除。
**12／18 分堆表我自己重算，逐格相符；兩條假通過路徑我自己走過，兩條都成立**——
其中路徑 2 我用三種 B 類設定各跑一次，**三種都 30／30 全過**，
所以「這 30 格證明的是投稿者改不到，不含責任編輯改得到」是硬事實。
K8／K9／K10 也都對，六族最高等級表逐列核對正確。

**殘留缺口是 Deferred risk，不是 Material，也不擋部署**：本票沒有任何 AC 承諾正向、
損害對已發布內容 fail-closed、觸發未觀察到，而且第六輪補的診斷列讓它發生時一步可查。
**它確實會讓 captain 照票做完而 B 類沒被證明設對**——但照票做不會失敗，
內容也不會出錯。三個升級條件已列在上方第一節。

**唯一要請 FO 帶走的一句**：**那個缺口不是 captain 正在裁決的方向。**
待裁決的措辭是「擴到逐欄逐分頁／納入反向對照」，而票內的「反向對照」定義是
**第 10 列的內容欄必須可改**；正向（責任編輯必須改得到 B 類六欄）是**第三個方向**，
兩個成分都不涵蓋它，而缺口框又用同一個詞稱呼它——**captain 很可能以為已經包含了**。
**請把它作為獨立、換過措辭的項目送裁決**，否則他決定完「門檻寫在哪裡」之後，
**這個方向仍然不會被任何一步驗到**。

**三筆 Polish 不阻擋，列在上方第三節**：K11（debrief 的 provenance 順序寫反，
`044` 的票早兩天；FO 要確認的「兩個見證都被漏掉」成立）、
K12（詞界誤判實為 4 處／3 檔，票內「兩處」與「五處」都不對，`#6-#27` 不是例子；
但詞界必要性成立）、K13（K10 的第三處——第十三節的標題與首句——仍未更正）。
另附我自己上一輪「90 個 A1 位置」應為 **30** 的更正。

**captain 可以開始做 S7。** 建議他從 S7-a 的模式選擇開始，
S7-b 的測試帳號依修正後的第 1 點準備（投稿者角色、S7 全設完才共用、不入任何允許名單、做完移除）。

## Stage Report: review (cycle 3)

- DONE: K7（最高優先）——**自己去 `044` 讀帳號表確認角色定義**；確認「先保護，後邀請」、收尾移除、⛔ 不入任何允許名單都寫進去了
  **四個元素全部正確。** `044` 的 `## 角色與帳號` 我實讀，逐字為 **A ＝ 責任編輯／核可者、測試表擁有者、captain 現用帳號；B ＝ 投稿者、以「編輯者」受邀、不是擁有者、第二個 Google 帳號**——票內引用相符，並把「不能是 captain」（擁有者不受保護範圍限制）與「不能是責任編輯」（B 類允許名單裡就是他）兩個理由分開寫對。「先保護，後邀請」的時機寫成「S7 的 12 個範圍全設完之後才共用」並引 `044` 步驟 6 原句（我實讀逐字相符）；做法（編輯者、不勾「可以變更權限和共用設定」）與 `044` 相符；**我上一輪點出的前置已建立**（`044` 步驟 15 第 2 點逐字「把 B 從測試表的共用名單移除」＋ `044` 全程未碰正式表 ⇒ 該帳號確實沒有正式表權限）；**收尾移除**與其理由都寫到；**⛔「不要把它加進 B 類（或任何一類）的允許名單」明文在列。**
- DONE: **自己重算 12／18 分堆表**；**自己走那兩條假通過路徑**
  **12／18 完全相符。** 建模（A／C 類只有擁有者、B 類只有責任編輯、第 10 格未保護，加上「保護範圍排除不了擁有者」）對三種角色逐格求值：第 1 格（C）、第 2-3 格（A）、第 10 格（未保護）對投稿者與責任編輯**結果相同** ⇒ 每分頁 4 格 × 3 ＝ **12**；第 4-9 格（B 類六欄）**投稿者「擋」、責任編輯「可改」** ⇒ 每分頁 6 格 × 3 ＝ **18**；12＋18＝30。**路徑 1 成立**：以責任編輯測得每分頁 6 格不符、**共 18／30**，而 B 類唯一能再收緊的方向就是把責任編輯移出允許名單 → 30 格全符、S7-b 通過 → 部署後核可靜默失敗。**路徑 2 成立，而且我用三種 B 類設定各跑一次**：`只有責任編輯`（正確）／`只有 captain`／`允許名單為空`——**三種都是 30／30 全過**，因為投稿者在三種設定下都不在名單內。**「B 類就算設成只有 captain 或名單為空，30 格照樣全過」逐字成立。**
- DONE: 判斷 implement 主動標出的殘留缺口——四項證據欄位、會不會讓 captain 照票做完而 B 類沒設對、**是不是 captain 尚未裁決的 AC-4 擴大所指的方向**
  **分類 Deferred risk，不是 Material。** 四欄：①已發布使用者與正常流程**成立**（責任編輯部署後核可，正是步驟 6 B 類設定的角色）；②可觀察損害＝核可靜默失敗、該列停在 `Needs review` 而不發布——**對已發布內容 fail-closed**，對操作者 fail-open，且第六輪補的診斷列使其一步可查；③**受影響的價值 AC／不可協商邊界：沒有**（AC-4 是反向、AC-5 是標題列、AC-1／2／3／6 是內容與產線，本票**沒有任何 AC 承諾正向**）；④觸發**未觀察到**（K7 修好後 runbook 不再誘發）。③④皆不成立 ⇒ 依定義為 Deferred risk。升級條件三項已列（擴大 AC-4 涵蓋正向／S8 改由責任編輯執行／部署後有人回報選單沒反應）。**會不會讓 captain 照票做完而 B 類沒設對：會，已由路徑 2 證明**；但**照票做不會失敗**，S1-S9 與步驟 9 走得完、內容正確 ⇒ 不擋部署。**它不是待裁決的那個方向**：待裁決措辭是「擴到逐欄逐分頁／納入反向對照」，而票內把「反向對照」定義為**第 10 列內容欄必須可改**（第 990／992／1702 行）；正向是**第三個方向**，兩個成分都不涵蓋，**而缺口框又用同一個詞稱呼它，captain 很可能誤以為已包含**——已在票內明寫請 FO 以獨立措辭送裁決。
- DONE: K8 措辭改為條件式且「原因」欄未動；K9 **自己跑新舊兩版對照**並確認那項義務有兩個見證；K10 三處、六族最高等級表、與「唯一靜默的 Material」是否站得住
  **K8 成立**：兩處（步驟 7 表最後一列、第十三節 K3 段）都改成「責任編輯**只要不在 B 類的允許名單內**就會踩到」，「部署後的常態」改為「部署後執行核可的人」，**同格「原因」欄逐字未動**。**K9 成立**：舊版 glob **5 檔**、新版 `-r` **8 檔**，逐字相符；新增三檔我實讀——debrief 記同一項義務（非新義務）、兩個 `index.json` 只在 `uri` 出現 `git-root://…/050-…md`（briefing 產物、無義務），表內兩項判對；「這是第六族自己的形狀」**準確**。**但義務的兩個見證順序寫反了 → K11。** **六族最高等級表逐列核對正確**（第一族 Polish＝F1／F3 的處置表逐字；第二族無缺陷；第三族 Polish；第四族 Material＝Cycle 3 逐字的 H1；第五族 Polish＝第十二節逐字；第六族 Material＝K1；F2 Material 但不屬六族）。**「K1 是唯一靜默的 Material」站得住但要限定**：F2 確實大聲失敗；**H1 的失真同樣沒有自動檢查會揭露**，讓它不靜默的是它卡在強制的 🔴 裁決閘門後、迫使 captain 打開 `044`——**K1 既無檢查也無閘門**。票內劃的界線（成品 vs 決策）對。
- DONE: 未越界未回歸（AC 整段、30 格表與 A1、S7 的 12 範圍表、S3、S8、承重數字、`- Cycle` ＝ 4、我自己四個 review 區塊與 verify 五輪報告、branch 範圍、040 worktree、diff 基準自算）
  diff 基準**自算** ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`，複審基準 `03af7b6`。**正式試算表零寫入零讀取**、未讀 `.env.local`、未跑 `sync-content`。以區塊雜湊逐一確認**逐位元組未動**：`## Acceptance criteria` 7063 B、「相依二」含 🔴 5718 B、**S7-b 的 30 格表 743 B**、S7 的 12 範圍表 593 B、S3 4511 B、S8 759 B、`### Feedback Cycles` 11709 B（**`- Cycle` ＝ 4**）、**我自己四個 review 區塊**（21396／8249／24799／10833 B）、**verify 五輪報告**（17547／17091／15522／14214／7164 B）。**本輪唯一動到的既有 Stage Report 是本票 cycle 6 那一份，且為純追加一則 ⚠️（原句保留、寫明來源是 review 的 K10）。** 承重數字 24 欄／18／21／12／16 筆 次數不變，其餘只增不減、無值被替換。branch 只動票檔一個、`src/`／`scripts/` 零變動、`src/data/*.json` sha256 未變、040 worktree `git status` 為空且 HEAD 仍 `a51b5d9`。未用 `sort`／`uniq`、未用 `awk`。**未解 🔴、未代 captain 確認、未改任何 AC、未替 implement 修任何東西。**
- DONE: 收斂——除 fail-open／Material／會讓 captain 照票做而失敗者外判 PASSED
  **判 PASSED。** 沒有 fail-open（殘留缺口對已發布內容 fail-closed）、沒有 Material（殘留缺口四欄有兩欄不成立）、沒有會讓 captain 照票做而失敗的東西（S1-S9 與步驟 9 每一步走得完）。**未開新的掃描維度**：K11／K12／K13 三筆全部落在本輪被指名要核對的 K9／K10 範圍內，是核對的直接結果，不是新維度。

### Summary

**PASSED。** K7 四個元素全部驗過：角色定義（我去 `044` 讀了帳號表，A ＝ 責任編輯／擁有者、
B ＝ 投稿者／非擁有者）、「先保護後邀請」的時機與理由、⛔ 不入任何允許名單、
以及我上一輪點出的那個從未被建立的前置（共用正式表）與收尾移除。
**12／18 分堆表我自己重算逐格相符；兩條假通過路徑我自己走過，兩條都成立**——
路徑 2 我用三種 B 類設定各跑一次，**三種都 30／30 全過**，
所以「30 格證明的是投稿者改不到、不含責任編輯改得到」是硬事實。K8／K9／K10 亦正確。

**殘留缺口判 Deferred risk**：本票沒有任何 AC 承諾正向、損害對已發布內容 **fail-closed**、
觸發未觀察到，且第六輪補的診斷列讓它發生時一步可查。**它不擋部署。**
**但它不是 captain 正在裁決的方向**——待裁決的是「逐欄逐分頁」與「納入反向對照（＝第 10 列內容欄可改）」，
正向是第三個方向，而缺口框用了同一個詞，**captain 很可能誤以為已包含**。
**請以獨立措辭送裁決**，否則門檻定了，這個方向仍然不會被任何一步驗到。

三筆 Polish 不阻擋：**K11**（debrief 那一列寫「比 `044` 的票更早」，實查反了——
`044` 的結論節是 `36af185`／2026-09-15，debrief 是 `39ea85e`／2026-09-17；
FO 要確認的「兩個見證都被漏掉」成立）、**K12**（詞界誤判實為 **4 處／3 檔**，
票內「兩處」與「五處」都不對、`#6-#27` 不是例子，但詞界必要性成立）、
**K13**（K10 的第三處——第十三節第 1684／1686 行的標題與首句——仍未更正）。
另更正我自己上一輪的「90 個 A1 位置」，正確是 **30**。

## Stage Report: implement (cycle 8)

- DONE: K11 fix（Polish，**FO 也錯了**）debrief 那一列的「比 `044` 的票更早」實查反了；記明錯誤源頭與傳遞路徑，並確認結論不變。
  實查兩個日期：`044` 的節標題逐字為「## 執行結果與交給 feature 050 的結論（**2026-09-15** 追加）」，debrief 檔名為 `2026-09-17-01-…`——**`044` 在前、debrief 在後**。兩處都改（第九節邊界宣告的 ⚠️、「第六族」那張表的 debrief 那一列），並加 ⚠️ 記明：**錯誤源頭是本票第七輪的 K9 處置**（本票寫下「而且比 `044` 的票更早被寫下」），**FO 照抄進 K11 的授權書後又轉述給 captain**；FO 已指出**這是同一天第二次同型的傳遞鏈**（前一次是 F-26 的「2 處」）、**兩次的第二個環都是 FO**。依 FO 要求照實記。
  **要確認的結論確認成立且未改**：那項義務有**兩個見證**（`044` 的結論節、debrief），**兩個都被漏掉**。另寫明順序反過來對本票更不利——**最早的記載是 `044` 自己的票，而那正是第六族要抓的東西**；debrief 是第二個見證，第六輪的 glob 連它也漏掉（K9）。
- DONE: K12 fix 詞界誤判實為 4 處／3 檔，票內「兩處」與「五處」都不對；自己重數並寫下重算指令。
  自己重數（Python `re`，逐檔算 `050` 命中數減 `\b050\b` 命中數）：**4 處誤判、散在 3 個檔**——`_debriefs/2026-05-02-01.md` 2 處（**兩處都是 `0501`**，2026-05-01 的會議日期）、`056-…/review/review/briefing-1/index.json` 1 處（`sha256:…fea050324…`）、`056-…/review/verify/briefing-1/index.json` 1 處（`sha256:…d050a23e…`）。原段落改為三列表 ＋ **重算指令**（依判準二，會動的量測要有一個權威處），並加 ⚠️ 保留原句、指出**三個錯而不是兩個**：「兩處」錯、「五處」錯，而且**`#6-#27` 整個字串裡沒有 `050`，它從來不是一處誤判**——那一項是憑空寫上去的。
- DONE: K13 fix K10 的第三處（第十三節的標題與首句）仍未更正。
  標題由「為什麼這一筆是 Material，而前面六輪的發現都不是」改為「為什麼這一筆的損害形狀與前面六輪的每一筆都不同」；首句由「前五族的錯都是『查不到出處』」改為「前五族的錯**多半**是『查不到出處』…**第四族的 H1 是例外，它傷的是決策品質**」。加 ⚠️ 保留原句並寫明**這是 K10 漏掉的第三處**、第七輪宣稱「三處都處理」**實際兩處**。
- DONE: 把 K10／K11／K13 放在一起，寫成一句，與既有的兩條判準並列。
  第九節新增「三條判準（本票七輪累積下來、可以帶去別張票的三句話）」一小節，把原本散在兩處的兩條收攏並加第三條。**判準一：判準是行為，不是數量**（S7-b，來源 `044`）。**判準二：判準是「這個檔會不會在我引用它之後變動」，不是「行號一律不好」**（第十節），並補上推論「會動的量測要有一個權威處，其他地方指向它，不要各自抄一份」。**判準三（新增）：更正一個錯誤時，要驗證那句更正自己的涵蓋面。** 附三列表列出 K13／K11／K12 各自錯在哪，並寫出共同形狀——**更正的內容是對的，而描述那個更正的句子沒有被驗**：「三處」「更早」「兩處」「五處」四個宣稱，**沒有一個是查過才寫的**。可操作版本：更正裡出現數量詞、時間先後、或「全部／都」這類涵蓋面宣稱時，當場跑一次能否證的指令並留在票內。
- DONE: 確認票內引用「90 個 A1 位置」的地方是對的（reviewer 已自行更正為 30，不動它的報告）。
  實數確認：S7-b 那張表 **10 個資料列 × 3 個分頁欄 ＝ 30 個 A1 參照**（以正則數表內反引號 A1，得 30）。**票內有 8 處寫「90 個 A1 位置」，全部從 FO 的授權書照抄，全部已改為 30**（第九節 1 處、第十四節 3 處、本票 cycle 7 Stage Report 4 處）。**reviewer 報告裡的 3 處「90」未動**——那是它的 `record`，且其中兩處就是它自己的更正句。第十五節另記明**這是判準三的第四個例子，而且與 K11 同一條傳遞鏈**：一個沒被驗的數量詞，從 reviewer 進 FO 的授權書，再進本票 8 個地方。
- DONE: 未越界。
  **正式試算表零寫入零讀取**（未發出任何 HTTP 請求、未跑任何同步）。**AC 的要求文字與 `## Acceptance criteria` 整段逐位元組未動**；**AC-4 的兩項裁決仍待 captain**；🔴 未解、未代 captain 確認。**那 30 格表與它的 30 個 A1 位置、S7 的 12 個範圍表逐位元組未動**。**S3 與 S8 逐位元組未動**。承重數字 24／9／15／59／12／6 原值保留。**未改寫 review 或 verify 的任何報告**（六個區塊逐一以區塊比對確認，含 reviewer 自己那三處「90」）；本輪動到的既有 Stage Report 只有本票自己的 cycle 7 那一份。**`### Feedback Cycles` 逐位元組未動、`- Cycle` 行數維持 4**。整條 branch 只動 `docs/constitution-features/050-ssot-approval-deployment.md` 一個檔；`git diff --stat $(git merge-base main HEAD) -- src/ scripts/` 無輸出；`src/data/*.json` sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`；040 worktree `git status` 為空、HEAD 仍為 `a51b5d9`。diff 基準自算 ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。未用 `sort`／`uniq` 判定中文字串，未用 `awk`。

### Summary

三筆 Polish 修完，**部署不受影響——review 已判 PASSED，captain 可以做 S7。**

**三筆是同一個形狀，而那個形狀值得留下來：更正的內容都是對的，錯的是描述更正的那句話。**
第七輪處理 K10 時說「三處都處理」（實際兩處）、處理 K9 時說 debrief「比 `044` 更早」（實際反了）、
同一段的詞界誤判寫「兩處」又寫「五處」（實際 4 處／3 檔，還多列一項憑空的 `#6-#27`）。
四個宣稱——「三處」「更早」「兩處」「五處」——**沒有一個是查過才寫的**。
已寫成第九節的判準三，和既有的兩條並列，並附可操作版本：
**更正裡出現數量詞、先後、或「全部／都」時，當場跑一次能否證的指令，並把指令留在票內。**
K12 的重算指令就是這條的第一次實踐。

**K11 的傳遞鏈照實記了。** 源頭是本票第七輪那半句，FO 照抄後又轉述給 captain——
FO 指出這是同一天第二次同型的傳遞鏈，兩次的第二個環都是它。
**而要確認的結論不變**：那項義務有兩個見證，兩個都被漏掉。
順序反過來其實對本票更不利：**最早的記載是 `044` 自己的票，正是第六族該抓的東西。**

**還有第四個例子，是我自己找的**：票內 8 處「90 個 A1 位置」也是從 FO 的授權書照抄的，
正確是 **30**（10 列 × 3 分頁）。reviewer 本輪自己更正了這個數字，我不動它的報告，
只把我這邊 8 處改對。**它和 K11 是同一條傳遞鏈**：
一個沒被驗的數量詞，從 reviewer 進授權書，再進本票 8 個地方。

## review stage 第四輪（最後一輪）：K11-K13 複審（2026-09-24）——**PASSED**

同一位 reviewer。**本輪對正式 Google 試算表零寫入、零讀取，而且沒有發出任何網路請求**——
captain 此刻正在那張表上操作 S7，所以本輪全部工作只在本機檔案與 git 上完成。
未讀 `.env.local`、未跑 `sync-content`。diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3c`；
複審基準為我上一輪的 commit `0d9473f`。未用 `sort`／`uniq` 判定中文字串，未用 `awk`。

### 一、三筆 Polish——全部落地且正確

**K11 ✅** 順序改對了。第六族表的 debrief 那一列已把「比 `044` 的票更早被寫下」拿掉，
改為「**同一項義務的第二個見證**……`044` 的結論節（2026-09-15）與這份 debrief（2026-09-17）」。
我實查兩個日期：`044` 的節標題逐字是「執行結果與交給 feature 050 的結論（**2026-09-15** 追加）」，
進 repo 的 commit 是 `36af185`（2026-09-15）；debrief 進 repo 的是 `39ea85e`（2026-09-17）。
**`044` 在前，早兩天。** 承重結論**不但保留，還更準確**——
原本寫「證明那項義務在 2026-09-17 就已在案」，現在寫「**有兩個獨立記載，而兩個都被漏掉了**」。
**傳遞鏈照實記了**：源頭是本票第七輪 K9 的處置文字，FO 照抄進 K11 的授權書後又轉述給 captain。

**K12 ✅ 而且重算指令我實跑過。** 段落已改為「**詞界誤判：4 處，散在 3 個檔**」＋逐檔表
（`_debriefs/2026-05-02-01.md` 2 處、`056` 兩個 briefing JSON 各 1 處），
憑空的 `#6-#27` **已從活宣稱中移除**，只留在 ⚠️ 裡當被撤回的那一項
（並明寫「`#6-#27` 整個字串裡沒有 `050`，它從來不是一處誤判」）。
**票內附的重算指令我照抄原樣跑了一次**（Python，`os.walk` 全目錄、逐檔算
`050` 命中數減 `\b050\b` 命中數）：**exit 0，逐字印出 `非詞界誤判: 4 處／ 3 檔`**，
三個檔與逐檔處數與票內的表完全相同。**指令是真的、可跑的、而且自己證明自己的數字。**

**K13 ✅** 第十三節的標題已從「為什麼這一筆是 Material，而前面六輪的發現都不是」
改為「**為什麼這一筆的損害形狀與前面六輪的每一筆都不同**」；
首句從「前五族的錯都是『查不到出處』」改為「**前五族的錯多半是……第四族的 H1 是例外，
它傷的是決策品質**」。⚠️ 保留兩句原文、寫明來源是 review 的 K13，
並且**自承第七輪宣稱「三處都處理」實際只處理兩處**。

### 二、第四個例子（90 → 30）：**8 處全部改對，我的報告一個字未動**

我用區塊邊界程式化清點，不靠肉眼：

| | 數量 |
|---|---|
| `0d9473f` 全檔「90 個 A1」 | **11 處** |
| 其中落在 reviewer 四個報告區塊內（那些區塊本輪逐位元組未動） | **3 處** |
| 其中落在本票自己的敘述內 | **8 處** |
| HEAD 本票自己的敘述內仍作為**活宣稱**寫「90」的 | **0 處** |

那 8 處的分布我也逐處定位：**第八節 S7-b 的缺口框 1 處、第十四節 3 處、
cycle 7 Stage Report 4 處**（含其 `### Summary`）——全部改為 30。
HEAD 還剩 6 個「90 個 A1 位置」字串，我逐行檢查過，**6 個全部包在「」內、
都是在描述被撤回的那個錯**，沒有一個是活宣稱。

**我自己的 3 處刻意保留是對的**：它們在我的 `record` 裡，而且其中兩處正是我自己的更正句
（「另更正我自己上一輪的『90 個 A1 位置』，正確是 30」）——改掉那句話就讀不懂了。
**實數我也重算過**：S7-b 那張表 10 個資料列 × 3 個分頁欄 ＝ **30 格、30 個 A1 參照**
（以正則數表內反引號 A1，得 30）。

> **一句非 finding 的附記，不需要再開一輪**：票內把那 8 處的分布寫成
> 「第九節 1 處、第十四節 3 處、cycle 7 Stage Report 4 處」，
> 而那 1 處實際在**第八節**（S7-b 的缺口框），不在第九節。總數 8 正確、全部改對。
> **記在這裡只因為它剛好又是判準三說的那個形狀**：描述更正的那句話裡的位置詞沒有被查。

### 三、判準三——**站得住，而且第四個例子是它最強的那一個**

**這條判準成立。** 三個理由：

1. **歸納對得上四個實例。** 我逐筆核過「更正的內容是對的，錯的是描述更正的那句話」：
   K13 的內容（F2 與 H1 都是 Material）對、「三處都處理」錯；
   K11 的內容（glob 漏 `_debriefs/`、debrief 記著同一項義務）對、「更早」錯；
   K12 的內容（詞界必要）對、「兩處」「五處」與 `#6-#27` 錯；
   第四例的內容（30 格與 A1 已逐格驗過）對、「90」錯。**四筆全部吻合。**
2. **四個宣稱都是一條指令就能否證的，而沒有一個被跑過。** 這是它的力道所在。
3. **它是三條判準裡唯一是程序性的**（前兩條是實質判準），所以最能帶去別張票。
   而「**修一個錯誤的那一刻，最不會被檢查的就是自己剛寫下的那句話**」把成因講得很準。

**K12 的重算指令確實是它的第一次實踐**——我實跑確認（見上方第一節）。
判準一與判準二各自也都有可否證的依據（S7-b 的 30 格、`TODO.md` 兩個 checkout 的行號），
但**只有 K12 把指令本身寫進票內當唯一權威處**，那才是判準三要求的動作。

**第四個例子比前三個更有說服力，理由值得記下來**：
K13／K11／K12 三筆都是**同一個寫作者在描述自己的更正**時出的錯——自作自受。
**第四例跨了角色**：數量詞由 **reviewer** 寫下（我，第二輪）、經 **FO 的授權書**、再進**本票** 8 個地方。
**所以判準三不只約束「寫更正的人」，也約束「轉述數量詞的人」。** 這一點前三例證明不了。

#### 對「與 K11 同一條傳遞鏈」這個歸類的判定

**形狀上正確，字面上不精確。** 兩條鏈的中間環相同（FO 的授權書），但起點與終點不同：

| 鏈 | 起點 | 第二環 | 終點 |
|---|---|---|---|
| **K11** | 本票第七輪的 K9 處置文字 | FO 的 K11 授權書 | 轉述給 captain |
| **第四例（90）** | **reviewer** 第二輪的報告 | FO 的 K4／K7 授權書 | 本票 8 個地方 |

所以準確的說法是「**同一種**傳遞鏈」而不是「同一條」——
同一個形狀（沒被驗的數量詞被照抄前傳），不是同一個實例。
**這是措辭層級的差異，不是歸類錯誤，我不把它列為 finding。**

**關於 FO 自己那句「三次同型的傳遞鏈，三次的第二個環都是我」**：
**本票之內我能證兩次**——K11 與第四例，兩次的中間環確實都是 FO 的授權書。
**第三次（F-26 的「2 處」）不是本票的 finding**
（本票自己的編號是 F1-F4／G／H／J／K），我在本票內查不到它，
**所以我不替那個「三次」背書，只確認我能查證的兩次。**
——這句話本身就是判準三的用法：**數量詞只認我跑得出來的那一部分。**

### 四、未越界未回歸（基準 `0d9473f` 與 `384ca7a3c`，全部自行量測）

| 項目 | 結果 |
|---|---|
| 正式試算表 | **零寫入零讀取，本輪連一個網路請求都沒有發出**（captain 正在 S7）；未讀 `.env.local`、未跑 `sync-content` |
| `## Acceptance criteria` 整段 | `36c45dd03748e3c6`、7063 B，**逐位元組未動**；**AC-4 的兩項裁決仍待 captain，本輪未動** |
| 「相依二」（含 🔴 三選項） | `59fcc4305f39d8a7`、5718 B，**逐位元組未動** ⇒ 🔴 未解、未代 captain 確認 |
| S7-b 的 30 格表 | `ea5c762def3e8ac4`、743 B，**逐位元組未動**（30 個 A1 參照全在內） |
| S7 的 12 範圍表 | `84d657895c17baff`、593 B，**逐位元組未動** |
| S3 ／ S8 | `e308334897139517` 4511 B ／ `4454f27a2d7723be` 759 B，**兩者逐位元組未動** |
| `### Feedback Cycles` | `e422f7dc04b54637`、11709 B，**逐位元組未動**；**`- Cycle` 行數 ＝ 4** |
| **reviewer 的三輪報告（六個區塊）** | 21396／8249 B、24799／10833 B、17943／9053 B——**六個全部逐位元組未動** |
| **verify 的五輪報告** | 17547／17091／15522／14214／7164 B——**五份全部逐位元組未動** |
| 承重數字 | 24 欄／18／21／12／40 筆／16 筆 出現次數**完全不變**；9／15／59／12／15／6 段只增不減，**無任何值被替換** |
| branch 範圍 | 只動票檔一個；`src/`／`scripts/` 零變動；`src/data/*.json` sha256 仍 `4d1992e3…cea3b`／`4071978a…3162` |
| 040 worktree | `git status` 為空，HEAD 仍 `a51b5d9` |
| Placeholder | cycle 8 新增行零命中 |
| 本輪 reviewer | **未解 🔴、未代 captain 確認、未改任何 AC、未替 implement 修任何東西** |

> 附記（非 finding）：工作區有一筆未提交的 frontmatter `status: implement → review`，
> 屬 FO／工具的 stage 推進，**未觸碰**。

### 五、裁決

**PASSED。**

三筆 Polish 全部落地且正確：**K11** 的順序改對（`044` 2026-09-15 在前、debrief 2026-09-17 在後）、
承重結論保留並更準確、傳遞鏈照實記；**K12** 改為 4 處／3 檔、憑空的 `#6-#27` 從活宣稱移除，
**而且它附的重算指令我照原樣跑了一次，exit 0、逐字印出 `4 處／3 檔`**；
**K13** 標題與首句都更正、H1 被指名為例外、⚠️ 保留原句並自承第七輪只處理了兩處。

**第四個例子的 8 處我程式化清點確認全部改對**（11 － 3 在我的報告內 ＝ 8），
**我的報告一個字未動**，HEAD 剩下的 6 個「90」全部是引號內的引述。

**判準三站得住**，歸納對得上四個實例，K12 的重算指令確實是它的第一次實踐。
**而第四個例子是四筆裡最有說服力的一筆**——它是唯一跨角色的：
數量詞從 reviewer 出發、經 FO 的授權書、進本票 8 處。
**所以這條判準要同時約束寫更正的人和轉述數量詞的人。**
「與 K11 同一條傳遞鏈」形狀上正確、字面上該說「同一種」，**這不是 finding。**
至於 FO 那句「三次的第二個環都是我」：**本票之內我能證兩次**，
第三次（F-26）不是本票的 finding，**我不替它背書**。

**沒有 fail-open、沒有 Material、沒有會讓 captain 照票做而失敗的東西。**
本輪未開任何新的掃描維度——所有核對都落在被指名的 K11／K12／K13 與那第四個例子之內。
**S7 的實質內容自第三輪判 PASSED 之後逐位元組未動**
（30 格表、12 範圍表、S3、S8 都在上表中確認），**captain 可以繼續做他正在做的事。**

## Stage Report: review (cycle 4)

- DONE: K11——debrief 先後順序改對、傳遞鏈照實記、承重結論仍保留
  **三項全部成立。** 「比 `044` 的票更早被寫下」已移除，改為「同一項義務的第二個見證……`044` 的結論節（2026-09-15）與這份 debrief（2026-09-17）」。**我實查兩個日期**：`044` 節標題逐字「（**2026-09-15** 追加）」、進 repo 為 `36af185`（2026-09-15）；debrief 進 repo 為 `39ea85e`（2026-09-17）——**`044` 早兩天**。承重結論**保留且更準確**（由「2026-09-17 就已在案」改為「**有兩個獨立記載，兩個都被漏掉**」）。傳遞鏈照實記：**源頭是本票第七輪 K9 的處置文字，FO 照抄進授權書後又轉述給 captain。**
- DONE: K12——詞界誤判改為 4 處／3 檔、重算指令留在票內、憑空的 `#6-#27` 已移除
  **全部成立，而且重算指令我實跑過。** 段落改為「4 處，散在 3 個檔」＋逐檔表（`_debriefs/2026-05-02-01.md` 2 處、`056` 兩個 briefing JSON 各 1 處）。`#6-#27` **已從活宣稱移除**，只留在 ⚠️ 內作為被撤回的那一項，並明寫它整個字串裡沒有 `050`。**票內那段 Python 重算指令我照抄原樣跑了一次：exit 0，逐字印出 `非詞界誤判: 4 處／ 3 檔`**，三個檔與逐檔處數與票內表完全相同——**指令是真的、可跑的、自己證明自己的數字。**
- DONE: K13——K10 的第三處（第十三節標題與首句）已更正
  **成立。** 標題改為「為什麼這一筆的損害形狀與前面六輪的每一筆都不同」；首句改為「前五族的錯**多半**是『查不到出處』……**第四族的 H1 是例外，它傷的是決策品質**」。⚠️ 保留兩句原文、寫明來源是 review 的 K13，並**自承第七輪宣稱「三處都處理」實際只處理兩處**。
- DONE: 第四個例子——自己數那 8 處是否都改成 30、確認未動我的報告、判斷「與 K11 同一條傳遞鏈」是否正確
  **程式化清點（以區塊邊界判定歸屬，不靠肉眼）**：`0d9473f` 全檔「90 個 A1」**11 處**＝ reviewer 報告內 **3 處** ＋ 本票自己的敘述 **8 處**；HEAD 本票自己的敘述內作為**活宣稱**的「90」＝ **0 處**。那 8 處逐處定位為**第八節 S7-b 缺口框 1 處、第十四節 3 處、cycle 7 Stage Report 4 處**，全部改為 30。**HEAD 剩下的 6 個「90 個 A1 位置」我逐行檢查，6 個全部包在「」內、都是在描述被撤回的錯。** **我的報告六個區塊逐位元組未動**（含其中 3 處「90」，其中兩處正是我自己的更正句）。實數重算：該表 **10 列 × 3 分頁 ＝ 30 格、30 個 A1 參照**。**歸類判定：形狀正確、字面該說「同一種」不是「同一條」**——兩條鏈中間環相同（FO 授權書）但起點終點不同（K11 ＝ 本票→FO→captain；第四例 ＝ **reviewer**→FO→本票 8 處）。**措辭差異，不列為 finding。**
- DONE: 判準三是否站得住、K12 的重算指令是否為第一次實踐、對三筆的歸納是否準確
  **站得住，三個理由**：歸納對得上**四個**實例（我逐筆核過「內容對、描述更正的那句話錯」——K13 的「三處」、K11 的「更早」、K12 的「兩處／五處」、第四例的「90」，四筆全部吻合，且四個宣稱都是一條指令就能否證而沒有一個被跑過）；它是三條裡唯一程序性的，最能帶去別張票；成因講得準（「修一個錯誤的那一刻，最不會被檢查的就是自己剛寫下的那句話」）。**K12 的重算指令確實是第一次實踐**——判準一與判準二各有可否證的依據，但**只有 K12 把指令本身寫進票內當唯一權威處**，我實跑確認。**另記一項它自己沒說的**：第四例是四筆裡唯一**跨角色**的（reviewer → FO → 本票），前三筆都是同一個寫作者描述自己的更正，**所以判準三要同時約束轉述數量詞的人**。對 FO「三次的第二個環都是我」：**本票內我能證兩次**（K11、第四例），第三次（F-26）不是本票的 finding、我查不到，**不替那個「三次」背書。**
- DONE: 未越界未回歸（AC 整段、30 格表與其 A1、S7 的 12 範圍表、S3、S8、承重數字、`- Cycle` ＝ 4、我的四輪報告與 verify 五輪報告、branch 範圍、040 worktree、diff 基準自算）
  **本輪對正式試算表零寫入零讀取，而且沒有發出任何網路請求**（captain 正在 S7），未讀 `.env.local`、未跑 `sync-content`。diff 基準**自算** ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`，複審基準 `0d9473f`。以區塊雜湊逐一確認**逐位元組未動**：AC 整段 7063 B、「相依二」含 🔴 5718 B、**S7-b 的 30 格表 743 B**、S7 的 12 範圍表 593 B、S3 4511 B、S8 759 B、`### Feedback Cycles` 11709 B（**`- Cycle` ＝ 4**）、**reviewer 三輪報告六個區塊**（21396／8249／24799／10833／17943／9053 B）、**verify 五輪報告**（17547／17091／15522／14214／7164 B）。承重數字 24 欄／18／21／12／40 筆／16 筆 次數不變，其餘只增不減、無值被替換。branch 只動票檔一個、`src/`／`scripts/` 零變動、`src/data/*.json` sha256 未變、040 worktree `git status` 為空且 HEAD 仍 `a51b5d9`、cycle 8 新增行 placeholder 零命中。未用 `sort`／`uniq`、未用 `awk`。**未解 🔴、未代 captain 確認、未改任何 AC、未替 implement 修任何東西。**
- DONE: 收斂——除 fail-open／Material／會讓 captain 照票做而失敗者外判 PASSED
  **判 PASSED。** 三者皆無。**未開任何新的掃描維度**——所有核對都落在被指名的 K11／K12／K13 與那第四個例子之內；本輪唯一多記的兩句（8 處分布的節號、FO 那個「三次」）都明確標為非 finding。**S7 的實質內容自第三輪 PASSED 後逐位元組未動**，captain 可以繼續做他正在做的事。

### Summary

**PASSED。這是最後一輪，三筆 Polish 全部落地且正確。**
**K11**：順序改對（`044` 的結論節 `36af185`／2026-09-15 在前，debrief `39ea85e`／2026-09-17 在後），
承重結論保留並改得更準（「**兩個獨立記載，兩個都被漏掉**」），傳遞鏈照實記。
**K12**：改為 4 處／3 檔、憑空的 `#6-#27` 從活宣稱移除，
**而它附的重算指令我照原樣跑了一次——exit 0，逐字印出 `4 處／3 檔`，三個檔與逐檔處數全符。**
**K13**：標題與首句都更正、H1 被指名為例外、⚠️ 保留原句並自承第七輪只處理了兩處。

**第四個例子的 8 處程式化清點確認全部改對**（11 － 我報告內的 3 ＝ 8，
分布為第八節 1 ／第十四節 3 ／cycle 7 Stage Report 4），**我的報告六個區塊逐位元組未動**，
HEAD 剩下的 6 個「90」全部是引號內的引述。

**判準三站得住**，歸納對得上四個實例，K12 的指令確實是它的第一次實踐。
**而第四個例子是最有說服力的一筆——它是唯一跨角色的**：
數量詞從 reviewer 出發、經 FO 的授權書、進本票 8 處，
**所以這條判準要同時約束寫更正的人和轉述數量詞的人。**
「同一條傳遞鏈」形狀正確、字面該說「同一種」，不列為 finding。
FO 那句「三次的第二個環都是我」：**本票內我能證兩次，第三次不是本票的 finding，我不背書。**

**沒有 fail-open、沒有 Material、沒有會讓 captain 照票做而失敗的東西。**
S7 的實質內容自第三輪 PASSED 後逐位元組未動——**captain 可以繼續做他正在做的事。**

## Stage Report: implement (cycle 9)

- DONE: AC-4 條文擴大至逐欄逐分頁：對齊 S7-b 既有的 30 格（10 列 x 3 分頁），並讓 Verified by: 的記錄要求（UTC 時間／逐格結果／角色，不記 email）涵蓋全部 30 格
  AC-4 改寫為「以投稿者身分實測第八節 S7-b 的 30 格」，明寫 27 格「擋」＋3 格「可改」、記錄涵蓋全部 30 格、並加一條「不接受抽測幾格其餘推定相同」（理由用 `044` 那張七列測試表只有兩欄真正受保護的分布式假通過）。**刻意不另抄一份格子表**，只引用 S7-b 那張——雙份會漂移。原條文與 captain 的理由以 ⚠️ 保留在 AC-4 下方。連帶校正 S7-c：兩個項目符號改為「S7-b 的 30 格就是 AC-4 的驗收本身，S7-c 不重跑、只補記錄格式」，舊引言（「AC-4／AC-5 依原文各自成立即可」）降級為歷史框並在上方明寫前提已消失。**AC-5 逐位元組未動**（`ddff30a7c643aa00`，393 B）。
- DONE: 新增反向對照 B 的驗收條文與執行程序：以責任編輯身分驗 B 類六欄必須可改（6 欄 x 3 分頁 = 18 格），含帳號前置、相對 S7-b／S7-c／S8 的執行時機、逐格預期值、以及任一格不符時的處置
  新增 **AC-7** 與第八節 **S7-d**（六個小節）。18 格的 A1 位置**引用** S7-b 表第 4-9 列，未另算一份：`L2:Q`／`O2:T`／`F2:K`。帳號前置是實查不是推測——`grep -rniE '責任編輯.*(帳號|email|@)…'` 四筆命中**沒有一筆寫出帳號**，票內留了指令；repo 能確定的只有 `044:271-272`（專案只用過兩個帳號）與 `044:671`／`:675`（P7 是把帳號 B 暫時加進 B 類名單再移除）。**並如實寫出兩份文件互相不符**（`044:767`「已開放給多位學者」⟷ `TODO.md:876`「權限皆為 owner 一人」），判定 worker 解不了、只有 captain 打開共用對話框才看得到，因此給了「有／沒有責任編輯帳號」兩條路，並寫明借用帳號**只證明機制成立、不證明實際責任編輯已在名單內**。執行時機：S7-b 之後（S7-b 要求帳號不在任何名單內，順序對調會讓它 18 格翻面）、S7-c 之後（同一個角色理由）、S8 之前（①S8 後無檢查抓得到 ②此刻六欄全留白，寫入再還原不動已核可列）。還原要求**比照 S7-b 第 3 點**，理由寫明。不符處置四步，含「補設若改到 B 類 A1 或權限模式，該分頁 S7-b 第 4-9 格要一併重測」。連帶更正 S7-b 第 1 點的收尾時機（原寫「S7-b 與 S7-c 都做完之後」→ 三者都做完之後），以插入 ⚠️ 方式加註，原句保留。
- DONE: 收束票內三處 🔴：captain 已放行 040 Out of scope 後半句「並由 captain 確認」並選定選項 A，改為已裁決並記錄授權來源與日期，原句依本票慣例保留
  第十一節、第十二節、「相依二」三處各加一則 ✅ 裁決框（裁決者 `person:captain`、日期 2026-09-25、選定選項 A、授權來源 `gate:050:review` / `gate-attempt:050-review-1` / artifact rev `sha256:324d436a…dbae3`、依據第 5 條）。「相依二」另兩處：三選項標題改為「已裁決：選定選項 A」（原句以刪除線保留）、選項 A 那格加註「✅ captain 2026-09-25 選定」、兩列表第二列由 🔴 改為 ✅ 並在同格註明原文。**未改寫 `040` 的票**——`git diff --stat` 全票只動 050 一個檔可證。
- DONE: 更正票內所有基於「captain 正在 S7／正在部署」的現況敘述，並遵守判準三
  票內非報告區塊的該類敘述只有一處（`### design stage 追加的 Out of scope` 的「captain 正在建欄與輸入標題」），已加 ⚠️ 更正並保留原句；同段「captain 現在照票輸入的這批標題是安全的」加一句限定。**依判準三當場跑了兩條能否證的指令，指令與逐字輸出都留在第十六節。** 指令一：把第五節的標題列解析器原樣重跑，`diff` 對第五節的基準 JSON——**無輸出**，欄數 10／12／5（`owl comment` 仍含空格 ⇒ S1 未做；無 `chapter`／`approved_by` ⇒ S2 未做；無窗口欄 ⇒ S4 未做）。指令二：AC-6 唯讀 sandbox 跑 main 的 sync——exit 0、40 筆／16 筆、sha256 仍 `4d1992e3…cea3b`／`4071978a…3162`、grep 判準印 ⛔。**兩條缺一不可，票內寫明理由**：階段一是安全的，指令二單獨證不了 S1／S2 有沒有做。結論：**runbook 一步都還沒開始，窗口未打開。**

### Summary

captain 三項授權全部落地：AC-4 由 3 格擴大為 30 格、新增 AC-7 與 S7-d 補上反向對照 B 的 18 格、三處 🔴 收束為已裁決（選項 A）。四個 DONE 各自可失敗：AC-4／AC-7 的失敗形狀寫在條文裡（漏設、過度保護、名單漏加），現況敘述的兩條指令只要有人動過一個標題字元或建了一欄，`diff` 與 grep 就會翻面。

**未越界（全部自行量測，基準 `b8e2233`）**：以區塊雜湊逐一確認**逐位元組未動**——**S7-b 的 30 格表 743 B（`eb81d3a9f418906f`）**、S7-b 角色分堆表 480 B、S7 的 12 範圍表 292 B、**S3 4844 B**、**S8 759 B**、`### Feedback Cycles` 14811 B（**`- Cycle` 行數 ＝ 5**）、**verify 五輪報告**（17547／17091／15522／14214／7164 B）、**review 四輪報告**（21396／24799／17943／10868 B）、**AC-1 731 B／AC-2 697 B／AC-3 1479 B／AC-5 393 B／AC-6 2701 B**。承重數字 24 欄／18／21／12／59 列／40 筆／16 筆／12 個保護範圍／6 段 **只增不減、無值被替換**。**對正式試算表零寫入**——本輪只發出兩次唯讀讀取（第五節的標題列指令、AC-6 的 sandbox），兩者都是票內既有手法；未跑 `npm run sync-content`，`src/data/*.json` sha256 未變。整條 branch 只動票檔一個，`src/`／`scripts/` 零變動。**未自行擴大或緊縮 captain 未授權的任何 AC，未改寫 `040` 的票。**

**留給 FO 帶給 captain 的一件事**：S7-d 第 1 點的責任編輯帳號 repo 內查不到，兩份文件互相不符，只有 captain 打開正式表的共用對話框才答得出來。這不是阻擋項——S7-d 兩條路都寫好了——但**走借用帳號那條時 AC-7 只證明機制成立**，日後真的指派責任編輯要重跑那 18 格。

> ⚠️ **2026-09-25 追加更正（本報告寫於 cycle 9，以下三處由 review cycle 5 抓出。原文逐字保留）。**
>
> | 本報告原文 | 更正 |
> |---|---|
> | 「`diff` 對第五節的基準 JSON——**無輸出**，欄數 10／12／5」「結論：**runbook 一步都還沒開始，窗口未打開**」 | **K14。** 那是**沒有時效標註的結論**，被 review 讀到時已經是假的——captain 在這中間做完了 S1 與 S2。依 captain 2026-09-25 的斷根要求，票內不再斷言部署進度，見第十七節 |
> | 「**兩條缺一不可**……指令二單獨證不了 S1／S2 有沒有做」所依據的「欄數把 S1／S2 釘死」 | **K15。** 推理錯誤：**S1 是就地改標題，不改欄數**，欄數對 S1 沒有鑑別力。釘住 S1 的是 `diff` 的那一行標題字串。兩條指令仍然缺一不可，理由改成正確的 |
> | 「`TODO.md:876`「權限皆為 owner 一人」」 | **K16。** 正確是 `docs/health-check/TODO.md` 的 **P3-1**（本 branch `:789`／main `:879`）；`:876` 是 P3-9 的「狀態：全部未處理」 |
> | 「artifact rev `sha256:324d436a…dbae3`」 | **K18。** 正確縮寫為 `sha256:324d436a…283bae3`（全值結尾是 `283bae3`）。此錯源自 FO 上一輪的授權封包，本報告照抄 |

## review stage 第五輪：captain 三項授權的複審（2026-09-25）——**REJECTED**

三項授權的**實質內容全部落地且正確**。退回的原因不是授權沒做，是**這一輪新寫的字裡有五處與事實不符**，
其中兩處推翻了本輪自己最看重的那一節（第十六節的現況實測）。

### 一、逐位元組未動：全部自行量測，全部通過

基準 `b8e2233`（implement cycle 9 的父 commit），以區塊雜湊比對，**不採用 implement 的自評數字**：

| 區塊 | 結果 |
|---|---|
| verify 五輪報告 | `b00be22d71db9d00`／`8ba6a6d19668814d`／`104376e91a6ae98f`／`c4dd5526ca08e274`／`2d36f46076882514`，**五個全同** |
| review 四輪報告 | `3b2add16338e49cd`／`6ed9e2b2ef89c402`／`0fe2c5ed0954b129`／`79c272354fb34fd2`，**四個全同** |
| S7-b 的 30 格表 | 779 B `43131a4bec4187aa`，**同**。S7-d 的 18 格我逐格回算過，見第二節 |
| S7 的 12 範圍表 | 335 B `17b425864c099f57`，**同** |
| S3 | 4518 B `958132bcd71a5998`，**同**。S8 763 B `eb067fbcee593eaa`，**同** |
| AC-1／AC-2／AC-3／AC-5／AC-6 | 740／706／1488／402／2725 B，**五條全同** |
| `### Feedback Cycles` | implement 這一輪**未動**（`4a36b1b0c68ff187`）。head 的差異來自 FO 自己的 `2d3d959`，+1 行 |
| 承重數字 | 在 live body 逐一清點，**每一個的出現次數只增不減**（24 欄 6→8、59 列 24→27、40 筆 18→24、16 筆 7→12、12 個保護範圍 3→5、6 段 4→6、18 欄／21 欄 5→5），**無值被替換** |
| 未改寫 `040` | `git diff --name-only $(git merge-base main HEAD)` 只有 050 一個檔；`-- src/ scripts/` 無輸出 |
| `## Documentation impact` | 本輪無文件新增或刪除，`docs/INDEX.md` 不需動；該區塊 implement 未動 |

### 二、AC-7／S7-d 的 18 格：正確，而且那段判準真的會失敗

S7-d 表六列的 A1 逐格等於 S7-b 表第 4-9 列（`O2/R2/F2`、`P2/S2/G2`、`L2/O2/H2`、`M2/P2/I2`、`Q2/T2/J2`、`N2/Q2/K2`），
反推 B 類連續段 `L2:Q`／`O2:T`／`F2:K` 與 S7 的 12 範圍表相符。

票內那段 python **我原樣跑過，印 ✅**。再做三種突變確認它不是恆真：

| 突變 | 輸出 |
|---|---|
| S7-d 一格 A1 打錯（`P2`→`P3`） | `⛔ 不相符: ['review_fingerprint']` |
| S7-b 表被改（`J2`→`J9`） | `⛔ 不相符: ['approved_fingerprint']` |
| S7-d 漏掉一列 | `⛔`，且 `格數 = 15`——**但清單是空的，沒有指名** |

排在 S7-c 之後、S8 之前的兩個理由**都成立**：S8 由 captain（擁有者）執行必定成功、S9／AC-1／AC-2／AC-3／AC-6 全部看不到保護設定，
所以 S8 之後確實沒有偵測點；此刻 B 類六欄全留白（S4 建欄留白、核可是 S8 的事），寫入再還原確實回到原值。
帳號前置的兩條路寫得完整，**含「借用帳號只證明機制成立、不證明實際責任編輯已在名單內」這個限定**。

### 三、五筆 Material

#### K14　票內的現況敘述現在是假的：**S1 已經執行了**

| 證據欄位 | 內容 |
|---|---|
| released user 與正常流程 | captain 照 runbook 部署；下一位 worker 讀票判斷現在做到哪 |
| 可觀察的損害 | 票內第十六節、`### design stage 追加的 Out of scope` 的 ⚠️ 更正框、`Feedback Cycles` Cycle 6 三處都寫「**runbook 一步都還沒開始**」「S1 未執行——仍是 `owl comment`」 |
| 受影響的價值 AC 或邊界 | 第九節**判準三**本身。**不危及 AC-1**——見下方產線健康實測 |
| trigger 證據 | 我把票內第五節的解析器原樣跑**兩次**（間隔重跑，結果一致，非暫態）：`Track 2_discussion` 第 10 欄現況為 `owl_comment\n(允鍾如果有靈感可以寫一句短評)`，**底線不是空格**。票內第五節的基準是 `owl comment\n(…)` |

**S2／S4 確實仍未執行**：欄數仍 `10／12／5`，無 `chapter`／`approved_by`／`review_decision`。
所以正確的現況是「**S1 已做，S2 起未做**」，不是「一步都還沒開始」。

**產線健康，captain 不必做任何事**：我照 AC-6 的唯讀 sandbox 跑 main 的 `sync-content.mjs`，
`exit=0`、40 筆／16 筆、輸出 sha256 為 `4d1992e3…7cea3b`／`4071978a…13d3162`，
**與 main 的 `src/data/*.json` 逐位元組相同**。S1 沒有打壞任何東西，AC-1 的基準不變。

**這一筆可能是在 implement 提交（10:49 -0700）之後才變成假的。** 我證不了它當時是不是真的，
也不需要證——**這類敘述本來就會腐壞**，而本票沒有為它加時效標註。

#### K15　第十六節的推理錯了：欄數釘不死 S1

票內逐字寫「**是指令一的欄數 10／12／5 才把 S1／S2 也釘死**」。
**S1 是就地改標題，不改欄數。** 現在就是反例：S1 已做、欄數仍是 `10／12／5`。
釘住 S1 的是那個 `diff`，不是欄數。（同節那張表的判準欄寫的是「第 10 欄標題是否還含半形空格」，**那一句是對的**——錯的只有這句散文。）

#### K16　`docs/health-check/TODO.md:876` 是錯的行號

正確是 **`docs/health-check/TODO.md:789`**，項目是 **P3-1　Google Drive 資料夾沒有分享給任何人**。
`:876` 是 **P3-9** 的「**狀態**：全部未處理。不影響正確性，不擋發布」，與權限無關。
**引文內容本身逐字正確**，錯的只有行號。票內兩處 live（S7-d 第 1 點的表、第十六節「留給下一位的一件事」），
另在 `Feedback Cycles` Cycle 6 與 Stage Report 各一。
**這是本票第一族的形狀，而且與 F3 是同一個錯**（當時 `TODO.md:127` 實為 156，127 是空行）。

#### K17　相依二仍留著與新 AC-4 相衝突的 live 敘述

```
**AC-4 的要求本身不變，仍然必須做**（在正式表上以非核可者身分測三次），
只是它不再卡在「有沒有第二個帳號」。
**本票不編輯 `## Acceptance criteria` 任何一個字**，這段說明寫在這裡。
```

**兩句現在都假**：AC-4 已是 30 格不是三次；本輪確實編輯了 `## Acceptance criteria`。
**它不在任何 ⚠️／✅ 框內**——下方那則 ✅ 框逐字寫「上面那三句寫於 2026-09-24 第四輪」，
指的是「🔴 沒有消失，只是縮小了」那三句，**不涵蓋這一段**。
這正是 completion checklist 第一項點名要查的「票內是否還留有與新 AC-4 相衝突的敘述」。

#### K18　三處 ✅ 裁決框的 artifact rev 寫錯

票內五處寫 `sha256:324d436a…dbae3`。授權書的實際值是
`sha256:324d436a95e340d4ba72f62e67d4bf7ed9914af921f60292bc360ccdd283bae3`，**結尾是 `283bae3`**。
`dbae3` 不是這個 hash 的任何後綴。
裁決者 `person:captain`、日期 2026-09-25、選定選項 A、`gate:050:review`／`gate-attempt:050-review-1`／
`briefing:050:review:attempt-1:revision-1` **五項全部正確**，所以授權仍然追得到——錯的只有這個縮寫。

### 四、三筆 Polish（不阻擋）

- **K19**　AC-4 的 ⚠️ 框寫「**原條文保留於此供追溯**」，但原 AC-4 的第二個項目符號
  （`- **會怎麼失敗**：保護範圍漏設某一欄，或設成「顯示警告」而非「限制編輯」，儲存格就會被改掉。`）**沒有被保留**；
  三個 bullet 的 `- ` 標記也一併被拿掉，變成連續文字，更難看出少一條。
  **實質內容沒有丟**（新 AC-4 的「會怎麼失敗」寫得更完整），錯的是描述保留動作的那句話。
- **K20**　S7-d 第 3 點自評「這段就會印 ⛔ **並指名是哪一欄**」。**「漏一欄」的情形指名不了**（見第二節的突變表）。
  判準本身會失敗，這是好的；錯的又是描述它的那句話。
- **K21**　S7-d 第 5 點「檢查三件事」不是鑑別診斷。三件事裡**只有「允許名單」能造成 S7-d 失敗**；
  「權限模式＝顯示警告」與「B 類範圍漏掉那一欄」都會讓該格**變成沒保護**，S7-d 反而**通過**。
  另一個真實成因——**A 類或 C 類的範圍蓋到那六欄**——沒被列。

### 五、裁決

**REJECTED。** 三項授權的實質全部正確，那 30 格表與九個報告區塊逐位元組未動，
18 格的 A1 逐格正確而且判準真的會失敗。**退回的是五筆事實錯誤，全部集中在本輪新寫的字。**

**K14／K15／K19／K20 是同一個形狀，而且就是本票第九節判準三寫的那個形狀**——
**更正的內容都是對的，錯的是描述更正的那句話**。本輪是判準三寫進票內之後的第一輪，
而它在同一輪裡犯了四次：說欄數釘死 S1（釘不死）、說原條文保留（少一條）、說會指名哪一欄（漏一欄時不會）、
說一步都還沒開始（S1 已做）。**K16 是第一族，與 F3 同一個錯。**

**不阻擋合併的部分請照留**：S7-b 的 30 格表、S3、S8、AC-1／2／3／5／6、verify 五輪與 review 四輪報告，
**我逐一量測過，逐位元組未動**；承重數字只增不減；`src/`／`scripts/` 零變動；**對正式試算表零寫入**
（本輪我只發出三次唯讀讀取：標題列兩次、AC-6 sandbox 一次）。

## Stage Report: review (cycle 5)

- FAILED: AC-4 擴大後是否可失敗：條文範圍是否與第八節 S7-b 的 30 格表同範圍、是否確實只引用該表而未另抄一份會漂移的格子表、「不接受抽測幾格其餘推定相同」是否擋得住抽樣、以及 S7-c 舊引言降為歷史框後票內是否還留有與新 AC-4 相衝突的敘述
  前三項**全部成立**：AC-4 明寫「照第八節 S7-b 的 30 格表逐格操作」「那張 30 格表是本 AC 的唯一欄位／類別／A1 位置來源，本條刻意不另抄一份」，我確認全票只有一張 30 格表（`43131a4bec4187aa`，逐位元組未動）；「不接受抽測幾格、其餘推定相同」寫成獨立條款並附 `044` 的分布式假通過理由，擋得住抽樣。**第四項 FAILED（K17）**：相依二留著兩句 live 敘述——「AC-4 的要求本身不變，仍然必須做（**在正式表上以非核可者身分測三次**）」與「**本票不編輯 `## Acceptance criteria` 任何一個字**」——兩句現在都假，且不在任何更正框內（下方 ✅ 框的「上面那三句」逐字指的是另外三句）。
- FAILED: AC-7 與第八節 S7-d 是否可失敗：18 格的 A1 位置是否正確引用 S7-b 表第 4-9 列、責任編輯帳號前置的兩條路是否都寫得完整（含走借用帳號時 AC-7 只證明機制成立這個限定）、排在 S7-c 之後 S8 之前的兩個理由是否成立、不符處置四步與還原要求是否真的分得出來
  **18 格逐格正確**：六列 A1 等於 S7-b 表第 4-9 列，反推 `L2:Q`／`O2:T`／`F2:K` 與 S7 的 12 範圍表相符。票內那段 python 我原樣跑過印 ✅，再做三種突變證明它會失敗（改 A1 → 指名該欄；改 S7-b 表 → 指名該欄；漏一列 → 印 ⛔ 且格數變 15）。**兩條路完整**，含「借用帳號只證明機制成立、不證明實際責任編輯已在名單內」的限定。**兩個時機理由成立**（S8 由擁有者執行必成功、S9／AC-1／2／3／6 全看不到保護設定；六欄此刻全留白故還原＝原值）。**FAILED 的是帳號前置的引用（K16）**：`docs/health-check/TODO.md:876` 是錯的行號，正確為 `:789`（P3-1），`:876` 是 P3-9 的「狀態：全部未處理」。另兩筆 Polish：K20 自評「會指名是哪一欄」在漏一欄時不成立；K21 不符處置的「檢查三件事」只有一件能造成 S7-d 失敗，另兩件會讓它反而通過，且漏列 A／C 類蓋到六欄這個真實成因。
- FAILED: 未越界未回歸：S7-b 的 30 格表與其 30 個 A1 位置、S7 的 12 範圍表、S3、S8、AC-1／AC-2／AC-3／AC-5／AC-6、verify 五輪與 review 四輪共九個報告區塊是否逐位元組未動；三處 🔴 裁決框的裁決者／日期／選定選項／授權來源是否記載正確且未改寫 040 的票；承重數字是否只增不減
  **未越界的部分全部通過，全部自行量測**（基準 `b8e2233`，區塊雜湊）：九個報告區塊全同、30 格表 779 B `43131a4bec4187aa` 同、12 範圍表 335 B `17b425864c099f57` 同、S3 4518 B 同、S8 763 B 同、AC-1／2／3／5／6 五條全同、`### Feedback Cycles` implement 未動（head 的 +1 行來自 FO 的 `2d3d959`）、承重數字每一個只增不減無替換、branch 只動 050 一個檔、`src/` 與 `scripts/` 零變動、040 的票未被改寫。**FAILED 的是授權來源（K18）**：三處 ✅ 框的 artifact rev 寫 `sha256:324d436a…dbae3`，實際結尾是 `283bae3`，五處皆錯；裁決者／日期／選項 A／gate／attempt／briefing id 六項則全部正確。

### Summary

三項授權的**實質內容全部落地且正確**，保護邊界逐位元組守住。判 **REJECTED** 的是五筆事實錯誤，全部落在本輪新寫的字裡：**K14 票內「runbook 一步都還沒開始」已是假的——我兩次唯讀重跑第五節的解析器，`Track 2_discussion` 第 10 欄現為 `owl_comment`（底線，不是空格），S1 已執行**；S2／S4 確實仍未做（欄數仍 10／12／5）。**K15 第十六節的「欄數 10／12／5 把 S1／S2 釘死」推理錯誤**——S1 是就地改名不改欄數，現況就是反例；釘住 S1 的是那個 `diff`。K16 引用行號錯（`TODO.md:876` → `:789`），K17 相依二留著與新 AC-4 相衝突的 live 敘述，K18 artifact rev 縮寫錯五處。

**K14／K15／K19／K20 是同一個形狀，就是本票第九節判準三寫的那個**——更正的內容都對，錯的是描述更正的那句話；本輪是判準三入票後的第一輪，同一輪犯了四次。

**產線健康，captain 不必做任何事**：AC-6 唯讀 sandbox 跑 main 的 `sync-content.mjs`，`exit=0`、40 筆／16 筆、sha256 `4d1992e3…7cea3b`／`4071978a…13d3162`，**與 main 的 `src/data/*.json` 逐位元組相同**——S1 沒有打壞任何東西，AC-1 的基準不變。本輪**對正式試算表零寫入**，只發出三次唯讀讀取。

## Stage Report: implement (cycle 10)

- DONE: K14-K18 五筆 Material 全部修正，且每一句修正本身不得成為下一輪的 K14——凡涉及「部署現在做到哪裡」的敘述一律帶量測時戳，或只留可重跑的指令而不留當時的輸出
  **先做斷根，再做逐筆。** captain 的斷根要求寫成第十七節開頭的 🔒 規則，並在第十六節開頭再放一次（那裡是操作者會讀到的地方）。**K14** 兩處 live 敘述改採 **(b) 只留指令**：第十六節的兩條指令原樣保留、**當時的輸出全部移除**，改附一張「怎麼讀這兩條指令」的判讀表（寫的是判準，不會過期）；`### design stage 追加的 Out of scope` 的 ⚠️ 框同樣移除欄數與 sha256 的逐字輸出。**K15** 的「欄數釘死 S1」是錯的推理，該句從操作指示裡移除（留著會讓人查錯地方），原句存到第十七節；判讀表改成正確的分工——**S1 只能看 `diff` 的標題字串，S2 才看欄數，S4 看指令二**。**K16** 改引 `docs/health-check/TODO.md` 的 **P3-1**，並附兩個 revision 的行號（本 branch `:789`／main `:879`）——我自己驗過兩邊確實不同檔（sha256 `a518969b…` vs `b4c9b0c5…`），所以**這一類引用的根因是行號本身會漂**，S7-d 第 1 點因此加了一則「引用 `TODO.md` 一律寫項目編號」的註記與可重跑的 `grep -n '^### P3-1'`。**K17** 相依二那兩句加兩列表逐句對照的 ⚠️ 框，原句保留。**K18** 四處 live 改為 `sha256:324d436a…283bae3`。**唯一沒動的一處是 `### Feedback Cycles` Cycle 6**——那一行是 FO 寫的，本票慣例不代 FO 補寫，已列在下方給 FO。
- DONE: K19-K21 三筆 Polish 修正，其中 K21 優先處理：S7-d 不符處置的三件檢查有兩件會讓它反而通過，且漏列 A／C 類範圍蓋到那六欄這個真實成因
  **K21**（先做）：第 5 點由「檢查三件事」改成**鑑別診斷**，拆成兩張表。真成因兩件：**B 類允許名單沒有該帳號**、**A 類或 C 類的範圍蓋到那六欄**（後者是 reviewer 指出的漏列）。另兩件標 ⛔ 明寫**會讓 S7-d 反而通過**，並指名**由 AC-4 的 30 格抓**（那六欄在 AC-4 的預期是「擋」，沒保護就變「可改」）。由此收出一句可帶走的話：**AC-4 抓「保護不足」、AC-7 抓「保護過頭」，兩邊都過那六欄才算設對。** 另把第 5 點的重測範圍由「B 類／第 4-9 格」放大為「B／A／C 任一類／第 1-9 格」——動到 A 類或 C 類會影響第 1-3 格。範圍重疊時 Google 以哪一個為準，**本票不下斷言**，只說要查 A／C 類的 A1 有沒有涵蓋那六欄。**K19**：AC-4 ⚠️ 框的「原條文」補回漏掉的第二個項目符號與三個 `- ` 標記，並加註這是第二次更正——補回去之後，「原條文保留於此供追溯」才是真的。**K20：修的是判準，不是措辭。** 舊版 `bad=[k for k in d if b.get(k)!=d[k]]` 只走 S7-d 有的欄，漏掉的欄根本不進迴圈，所以「漏一欄」時印 `⛔ 不相符: []`——有 ⛔ 沒有名字。加 `missing`／`extra` 兩個集合後，**三種突變實跑全部指名**：A1 打錯 → `A1 不符: ['review_fingerprint']`；S7-b 表被改 → `['approved_fingerprint']`；漏一列 → `S7-d 漏列: ['reject_reason']` 且格數變 15。更新後的指令我從票內**逐字抽出再跑一次**，輸出與票內記載相同。
- DONE: 未越界未回歸：verify 五輪與 review 五輪共十個報告區塊、S7-b 的 30 格表、S7 的 12 範圍表、S3、S8、AC-1／AC-2／AC-3／AC-5／AC-6、S7-d 的 18 格與其 A1 位置逐位元組未動；承重數字只增不減；未改寫 040 的票；對正式試算表零寫入
  以區塊雜湊逐一確認，基準 `1646f0e`（review cycle 5），**全部自行量測**：**verify 五輪**（17547／17091／15522／14214／7164 B）、**review 五輪**（21396／24799／17943／10868／**9203 B**）、**S7-b 的 30 格表 743 B `eb81d3a9f418906f`**、S7-b 角色分堆表 480 B、**S7 的 12 範圍表 292 B**、**S3 4844 B**、**S8 759 B**、**AC-1 731／AC-2 697／AC-3 1479／AC-5 393／AC-6 2701 B**、**AC-7 2468 B**、**S7-d 的 18 格表 466 B `2cd0045eef2c6355`**——**全部逐位元組未動**。**AC-4 條文本體**（標題到 ⚠️ 框之前）**2112 B `18e2720d569805fa` 亦逐位元組未動**；AC-4 整段的差異只在 K19 授權的那則 ⚠️ 框。`### Feedback Cycles` 18189 B 逐位元組未動、`- Cycle` 行數維持 6。
- DONE: 承重數字只增不減
  逐一清點：24 欄 25→25、18 欄 10→10、21 欄 8→8、`site_tldr` 12 欄 2→2、59 列 57→57、40 筆 57→57、16 筆 36→36、6 段 22→22、12 個保護範圍 10→10。**一處「12 欄」由 17 降為 16，那不是承重數字**——是 design stage ⚠️ 框裡「`Track 2_discussion` 12 欄」這個**當下欄數的讀數**，正是 K14 授權移除的過期輸出；承重的 `site_tldr` 12 欄兩處都在。
- DONE: 未改寫 040 的票；對正式試算表零寫入
  `git status --short` 只有 050 一個檔；`git diff --stat $(git merge-base main HEAD) -- src/ scripts/` 無輸出；`src/data/*.json` sha256 仍 `4d1992e3…cea3b`／`4071978a…3162`。**對正式試算表零寫入**——本輪只發出兩次唯讀讀取（第十六節的兩條指令各一次），未跑 `npm run sync-content`。

### Summary

八筆全修。**K14／K15／K19／K20 是同一個形狀，所以先做斷根再做逐筆**：captain 的規則（不得斷言部署進度，要嘛帶 UTC 時戳、要嘛只留指令不留輸出）寫進第十七節與第十六節開頭，兩處 live 敘述改採「只留指令」，量測記錄改採「帶時戳」並在標題就寫明它會過期。

**兩筆修的是判準本身，不只是描述它的句子**：K20 的比對腳本真的少一塊（漏一欄時不指名），加 `missing`／`extra` 後三種突變全部指名，實跑驗過；K21 的不符處置真的會把人帶去錯的方向，改成鑑別診斷並補上漏列的 A／C 類成因。

**K16 的根因比 reviewer 指出的更廣**：`TODO.md` 的 `status` 是 `plan`，一直在被編輯，**行號會漂**——同一個 P3-1 的證據行在本 branch 是 `:789`、在 main 已經是 `:879`（兩邊檔案 sha256 不同，我自行比過）。所以修法不是換一個行號，是**改引項目編號並附 revision**，這也是 `AGENTS.md` 的既有規則。

**截至 `2026-09-25T18:37Z` 的量測**（記在第十七節，會過期）：S1／S2 已執行、欄數 14／17／5、S4 起未執行窗口未打開、產線健康（exit 0、40 筆／16 筆、sha256 與 AC-1 綁定值逐字相同、AC-3 的 id 比對兩份皆一致）。**AC-1 的基準不變，不需要重量 baseline**——依 S3 的分辨表，`diff` 的差異全部落在新增的九個空白欄，檢查①②都通過。

**留給 FO 的一件事**：`### Feedback Cycles` 的 Cycle 6 那一行仍寫著「runbook 一步都還沒開始」與「`TODO.md:876`」，兩處都已過期或錯誤。**那一行是 FO 寫的，本票慣例不代 FO 補寫**，請 FO 自行更正。

> ⚠️ **2026-09-25 追加更正（本報告寫於 cycle 10，以下由 review cycle 6 抓出 K23。原文逐字保留）。**
>
> 本報告寫「**一處「12 欄」由 17 降為 16，那不是承重數字**」時，用的量詞是「**唯一**」
> （見上方「承重數字只增不減」那一條的 DONE 內文）。**「唯一」沒有查過。**
>
> **我在 cycle 11 重跑了全檔清點**（指令與逐字輸出留在第十八節 K23）：
> 以 `\d+量詞` 正規式清點 `1646f0e` → `3d91b13`，下降的有**三種樣式**
> （`15 個` 30→29、`5 欄` 6→5、`6  格` 1→0）；
> reviewer 以純子字串計數找到**兩種**（`12 欄`、`15 個`）。
> **種數取決於怎麼數——所以這種句子必須連方法一起寫。**
>
> **承重值沒有回歸這個結論不變**：三種全部來自兩行被 K14 授權移除的過期讀數、
> 與一段被 K20 取代的舊腳本輸出；`15 個窗口內欄位` 仍在 S4 條文（`1646f0e` 5 處 → HEAD 7 處）。
>
> ⚠️ **2026-09-25 再更正（L1／L5，cycle 12）：括號裡那組數字兩個端點都錯，且不該用它舉證。**
> 逐版釘 SHA 清點為 `1646f0e`＝**6**、`3d91b13`＝**5**、`ad07a26`＝**7**；
> 「5 → 7」實際是 `3d91b13` → `ad07a26`，而 cycle 10 真正改動的窗口
> （`1646f0e` → `3d91b13`）該值是 **6 → 5 下降**。
> **正確的舉證是 S4 條文那一行七版逐字相同**，不是出現次數。
> 另 `HEAD` 是移動引用，不得當量測標籤。詳見第十八節 K23 的更正框與第十九節。
> **錯的只是「唯一」這個量詞，不是結論。** 這又是第九節判準三的形狀。

### 追加：captain 共用名單裁決的處置（cycle 10 授權追加，2026-09-25）

- DONE: (a) 兩份文件的矛盾照實記錄裁決，不改 `TODO.md`
  S7-d 第 1 點的兩份文件對照表下方加一則 ✅ 框：captain 2026-09-25 親自查看共用對話框，回報**六人有編輯權限、另三人檢視、名單中有責任編輯、`044` 第二帳號仍在 captain 手上且不在名單內**。判定 `_archive/044-…:767`「已開放給多位學者」**成立**、`docs/health-check/TODO.md` 的 **P3-1**「權限皆為 owner 一人」**與正式表現況不符**（講的是 Drive 資料夾，或已過期）。**本票不改 `TODO.md`。** 框內開頭就寫明**事實強度**：這是口頭回報、**repo 內無從驗證**、不記 email、要重新確認只能再開一次對話框。
- DONE: (b) S7-d 第 1 點的兩條路收斂成一條，借用帳號那條降為註記保留
  改為單一路徑：**用正式表上那位責任編輯的帳號**，因此 **AC-7 證明的是實際情況，不只是機制成立**——這是 AC-7 的一次升級，不是縮水。另補一句原本沒有的區別：**在共用名單內不等於在 B 類允許名單內，那是兩份不同的名單**（共用名單決定他能不能開這份表，B 類名單決定他能不能改那六欄）。借用帳號那條的原文逐字保留在 ⚠️ 框內，並寫明為何不再需要（前提「沒有責任編輯」已被推翻）、原本那兩句附帶條件（「只證明機制成立」「日後要重跑」）為何隨之不適用、以及**什麼情況要把它取回來**（責任編輯換人或離開名單而新人未指派時）。
- DONE: (c) 補記「六個編輯者 + 保護範圍要到 S7 才設」，依實際人數修正涵蓋面，並提出分類與處置建議
  S2 尾端加 ⚠️ 框，原句「請在階段一開始前告知責任編輯不要動這三欄」保留，改為**告知全部六位編輯者**——**告知一個人擋不住另外五個人**。**依 `## Review-finding disposition` 第 2 條提出四欄證據與建議，未代 captain 裁決**：分類建議**維持 Deferred risk**（trigger 只成立一半——「六人可寫」是 captain 直接回報，「已經有人填值」未觀察到：截至 `2026-09-25T18:37Z` 兩個 sha256 仍等於 AC-1 綁定值，三欄仍全欄留白）；任務歸屬建議**本票擁有**；處置建議 **fix（措辭，已執行）**。**另指出升級條件本身不必改**——第八節第 1 條逐字寫的是「**任何人**」，不是「責任編輯」，不足的只是那句緩解措施。**需要 FO 或 captain 決定而我沒做的是**：要不要因此改變部署順序（把 S7 提前，或階段一先手動鎖那三欄）——那是範圍決定。
- DONE: (d) `044` 第二帳號不在名單內改記為 captain 直接確認，三項連帶結論一併寫入
  S7-b 第 1 點的前置段加 ✅ 框，**原推論句與其依據（`044` 步驟 15 第 2 點）一併保留**——推論與確認是兩種強度不同的證據，本票兩者都留。三項連帶：①**「先保護，後邀請」維持原寫法**；②**30 格預期值全部成立**；③**人數六 → 七 → 六**。依判準三，數量詞當場查：`grep -nE '六人|六位|六個編輯|七人|七位'` **寫入前命中 4 處、全部在 `### Feedback Cycles`（FO 所寫）**，**本票操作段落零命中**，故無連帶校正；票內既有的「多位協作者／多位學者」不是數量詞，仍成立。另在 S7-b 末尾新增一小節寫**可否證的推廣理由**：保護範圍是**允許名單**機制，名單外一律擋，故一個名單外帳號測出的「擋」對其餘名單外編輯者同樣成立，30 格不必對六人逐一重測；**否證條件寫明**——若某範圍誤設為「顯示警告」就不再是允許名單機制，推廣不成立，**而那正是 S7-a 要擋的**，所以 S7-a 與 S7-b 是同一條論證的上下游。推廣的邊界也寫明：只推廣「名單外會被擋」，**不推廣「名單內改得到」**，後者由 AC-7／S7-d 用真人測。
- DONE: 未越界未回歸
  基準 `e8dd0c1`（FO 的 Cycle 7 commit），區塊雜湊逐一確認**逐位元組未動**：S7-b 的 30 格表 743 B、角色分堆表 480 B、S7 的 12 範圍表 292 B、**S3 4844 B**、S8 759 B、`### Feedback Cycles` 23546 B（`- Cycle` ＝ 7，**未代 FO 補寫**）、**verify 五輪與 review 五輪共十個報告區塊**、AC-1／AC-2／AC-3／AC-5／AC-6、**AC-7 2468 B**、**S7-d 的 18 格表 466 B**、**AC-4 條文本體 2112 B**。承重數字只增不減。**對正式試算表零寫入、零讀取**（本次追加未發出任何 HTTP 請求；引用的是 `2026-09-25T18:37Z` 那次量測）。`src/`／`scripts/` 零變動。

#### 本次追加另提一筆 finding，**未處置，等 FO 授權**

**S3 的分辨表把「那三個內容欄」列進「編輯合法填值 → 重新量 baseline」那一列**，
而 S2 明令那三欄在 S9 前必須全欄留白——對這三欄，「有人正常填稿」不可能為真。
照那一列重量 baseline，會把不該存在的值烤進新基準，**AC-1 之後反而會通過**。
四欄證據與分類建議（**`Deferred risk`**，第三個條件「編輯台確認是有人正常填稿」是有效防線，
需要兩步誤判才會踩到）寫在第十七節的追加一節。
**我沒有動 S3 一個位元組**——它在本輪授權中列為逐位元組不得改動，
依 `## Review-finding disposition`，FO 授權前不變更候選位元組。**請 FO 決定要不要開一輪處理。**

## review stage 第六輪：K14-K21 複審（2026-09-25）——**REJECTED**

**被審快照**：implement cycle 10 ＝ `3d91b13` ＋ 追加 `118f474`；基準 `1646f0e`（review cycle 5）。
**對正式試算表零寫入零讀取**——本輪未發出任何 HTTP 請求、未跑 `sync-content`、未讀 `.env.local`。

### 〇、本輪開場被擋住一次，那筆攔截由我提出

我第一次讀票時，票檔**正在被寫入**：40 秒內由 5857 行長到 5935 行、sha256 兩次翻新，
而 `### Feedback Cycles` 的 Cycle 7 已經把「captain 共用名單」那一族敘述為**已交付**——
那些字在 `3d91b13` 裡一行都沒有。我停審並回報 FO，未做任何量測、未下裁決。
FO 已於 `cfd1794` 自行更正該行（改記為「已授權、交付待補」），implement 隨後以 `118f474` 補齊交付。
**本輪的所有量測都在 `cfd1794` 這個穩定快照上重做，沒有沿用停審前的任何讀數。**

### 一、未越界未回歸——全部自行量測，全部通過

以區塊雜湊逐一比對 `1646f0e` 與 `cfd1794`，**下列全部逐位元組未動**：
**十個報告區塊**（verify 五輪 17546／17090／15521／14213／7163 B、review 五輪 21395／24798／17942／10867／9202 B，
以 `## verify stage`／`## review stage` 到下一個 `##` 為界，我自己切的）、
**S7-b 的 30 格表 743 B `eb81d3a9f418906f`**、**S7-d 的 18 格表 466 B `2cd0045eef2c6355`**、
**S7 的 12 範圍表 292 B**、**S3 4511 B `439894573bb37b25`**、**S8 759 B**、
**AC-1 731／AC-2 697／AC-3 1479／AC-5 393／AC-6 2701／AC-7 2468 B**、
**AC-4 條文本體 2112 B `18e2720d569805fa`**。三個共同值與 implement 自報完全相符。
**S3 另沿 `ec62f9f`→`cfd1794` 七個 revision 逐一回溯，7/7 皆 4511 B 同一雜湊**——沒有任何一輪動過它。
整條 branch 對 `384ca7a3c` **只動 050 一個檔**；`src/`／`scripts/` 零變動；
`src/data/*.json` 為 `4d1992e3…cea3b`／`4071978a…3162`，**與 AC-1 的綁定值逐字相同**；`040` 的票未被改寫。

### 二、K16／K17／K18／K19／K20——四筆修對，一筆自行跑過突變測試

**K16 成立，而且根因抓得比 reviewer 上一輪更深。** 我實查兩邊：`### P3-1` 標題在本 branch `:787`／main `:877`，
其**證據行**（`權限皆為 ipawei@gmail.com (owner) 一人`）在本 branch **`:789`**、main **`:879`**，
票內兩個行號都對；兩份檔 sha256 `a518969b…`／`b4c9b0c5…`，與 implement 自報相符。
`:876` 在本 branch 確實是 **P3-9**（`### P3-9` 在 `:874`）的「狀態：全部未處理」，票內的更正描述正確。
可重跑的 `grep -n '^### P3-1' docs/health-check/TODO.md` 我照原樣跑過，印 `787`。

**K17 成立。** 兩句 live 敘述各有一列逐句對照，原句**逐字保留**在框外；
框內並自行指出「下方那則 ✅ 框逐字寫的『上面那三句』指的是另一段，涵蓋不到這兩句」——
這正是上一輪 reviewer 點出的涵蓋缺口，被正面收掉。

**K18 成立。** 四處 live（第十一節 `:1955`、第十二節 `:2065`、第十六節被審快照表 `:2354`、相依二 ✅ 框 `:2797`）
全部為 `sha256:324d436a…283bae3`。票內殘留 `…dbae3` 五處，**五處全部合法**：
一處是第十七節描述這次修正的「改前值」，四處在 Stage Report cycle 9 與 review cycle 5 兩個歷史區塊內。

**K19 成立，我做了逐位元組比對。** 把 ⚠️ 框內 `> > ` 引文還原後，與 `b8e2233`（captain 擴大前）的真正 AC-4 原條文
比對：**兩邊皆 925 B，逐位元組相同**。漏掉的第二個項目符號與三個 `- ` 標記確實補回去了。

**K20 成立——我自己做了突變測試，沒有採信自評。**
從票內**逐字抽出**那段 python（1028 B），對票檔副本做三種突變後實跑：

| 突變 | 我跑出來的第二行 | 是否指名 |
|---|---|---|
| 未突變 | `✅ 18 格 A1 位置與 S7-b 表第 4-9 列逐格相同` | — |
| S7-d 的 `review_fingerprint` Track 2 由 `S2`→`S9` | `⛔ A1 不符: ['`review_fingerprint`']  S7-d 漏列: []  S7-d 多列: []` | ✅ |
| S7-b 表的 `approved_fingerprint` site_tldr 由 `J2`→`J9` | `⛔ A1 不符: ['`approved_fingerprint`']  …` | ✅ |
| S7-d 刪掉 `reject_reason` 整列 | `⛔ A1 不符: []  S7-d 漏列: ['`reject_reason`']  …`，且格數 **18→15** | ✅ |

**三種全部指名，與票內記載逐字相同。** 並且我從 `f8c6631` 取出**真正的舊版**
（`bad=[k for k in d if b.get(k)!=d[k]]`，判斷式 `if bad or set(b)!=set(d)`）跑同一組突變：
漏一欄時印 `⛔ 不相符: []`——**有 ⛔ 沒有名字**。**舊版真的少一塊，這一筆修的是判準不是措辭，成立。**

### 三、K21——鑑別診斷分得出兩個方向，四件檢查的 ⛔ 標註正確

我自行回算 S7-b 的 30 格表確認類別分佈：**第 1 格 C 類、第 2-3 格 A 類、第 4-9 格 B 類、第 10 格未保護**。
據此逐項判：

- **兩件真成因都對。** ①B 類允許名單沒有責任編輯 → 被擋；②A／C 類範圍蓋到那六欄 → 責任編輯不在 A／C 名單 → 被擋。
  第②件正是上一輪漏列的那件，補上了，而且是**「保護過頭」**這個方向。
- **兩件 ⛔ 標註正確。** 權限模式誤設「顯示警告」、B 類 A1 漏掉某欄——兩者都**取消保護**，
  責任編輯當然改得動，S7-d **反而通過**。判它們「不是本步成因」正確；
  判「由 AC-4 的 30 格抓」也正確——那六欄在 AC-4 對投稿者的預期是「擋」，沒保護就變「可改」，AC-4 必失敗。
- **「AC-4 抓保護不足、AC-7 抓保護過頭」這句收斂成立**，與 30 格表的分佈一致。
- **重測範圍放大為「B／A／C 任一類、第 1-9 格」成立**——第 1 格是 C 類、第 2-3 格是 A 類，
  動 A／C 確實會影響第 1-3 格，舊版只寫「B 類／第 4-9 格」是真的不夠。（殘留一格見第五節 K25。）

### 四、captain 的四項事實——照實記錄，未放大，未代裁決

| 檢查 | 結果 |
|---|---|
| 四項事實是否照實 | ✅ 六人編輯／三人檢視／責任編輯在名單內／`044` 第二帳號不在名單內，四項逐項落在第十七節「追加」的問答表，無增減 |
| 是否標明來源 | ✅ 明寫「captain 親自打開共用對話框後**口頭回報**」「**不是 repo 內可驗證的事實**，本票不得重述為已驗證」「要重新確認只能再打開一次那個對話框」 |
| 是否記 email | ✅ 全票零 email，並自行引 `040-…:250` 的禁令 |
| 「六個編輯者可寫那三欄」這筆新事實 | ✅ 落在 S2 的 ⚠️ 框，原句保留，明寫「暴露面是 6 不是 1」「告知一個人擋不住另外五個人」 |
| 是否代 captain 裁決 | ✅ **沒有。** (c) 的分類**維持 Deferred risk 未自行升級**，四欄證據第四欄自承 trigger「只成立一半」；
並把「要不要把 S7 的保護提前到階段一」明寫為**範圍決定、worker 不做**，留給 FO／captain |
| 是否照判準三自查 | ✅ 寫下「六位」這個數量詞時當場跑 `grep` 查票內有無其他敘述依賴此人數，並記錄命中分佈 |

**另記一筆值得肯定的處置**：implement 在本輪**自行發現**「S3 分辨表把那三個內容欄列進『編輯合法填值 → 重新量 baseline』」
這個缺陷（重量 baseline 會把非法填值烤進新基準，AC-1 之後反而通過），
**寫了四欄證據與分類建議，但一個位元組都沒改**——因為 S3 在本輪授權中列為不得改動。
**這是 `## Review-finding disposition` 第 2 條的正確用法，我確認 S3 確實未動。**

### 五、本輪的發現

#### K22（**Material，本輪唯一阻擋項**）`## Documentation impact` 的兩句 live 進度斷言，現在都是假的

**斷根要求入票的第一輪，同一形狀又出現一次，而這次出現在 `## Documentation impact`——
那正是 review stage 定義逐輪指名要查的一節。**

| 位置 | 原文 | 為什麼是假的 |
|---|---|---|
| `:2998`（「現在更新」表） | 「已定方向、**尚未執行**。**試算表目前仍是部署前狀態**」 | 試算表**不是**部署前狀態 |
| `:3000` | 「理由：**本票尚未執行任何一步**」 | 已經執行了三步 |

**否證證據就在本票自己內部**，不必外求：第十七節「量測記錄」逐字寫著
**S1 已執行**（第 10 欄已是 `owl_comment`，底線）、**S2 已執行**（欄數 `10／12／5` → **`14／17／5`**，
`Track 1_history` 新增 `chapter`／`approved_by`／`approved_at`／`reject_reason`）、**S3 已通過**。
**兩句都沒有時戳，也不在任何更正框內。**

**這不只是措辭。它有一個已經到期的後果**：同表「實作後更新」那一列寫
「`docs/health-check/TODO.md` P3-7 追記 ⟵ 條件：**步驟 1 完成後**」，
而**步驟 1 就是「`Track 1_history` 補一欄 `chapter`」**（`:152`），S2 已經把它建好了。
**那筆文件義務現在已經到期，但表上讀起來像還沒到期。**

**四欄證據**：①**已釋出使用者與正常流程**——`## Documentation impact` 是 review stage 定義要求逐輪查核的一節，
也是排定文件更新時機的依據，讀它是正常流程；②**可觀察的傷害**——`TODO.md` P3-7 的追記已到期卻讀成未到期；
且任何讀者會得到「窗口未開、階段一未做」這個結論，**那正是 K14 那一輪導致 REJECTED 的同一個錯誤信念**；
③**受影響的邊界**——**captain 2026-09-25 親自授權的斷根要求**（「票內不得再斷言『部署現在做到哪裡』」，
原文無任何節次豁免），且該節不在本輪「逐位元組不得改動」的邊界清單內，本可一併掃到；
④**trigger 證據**——**已觸發、現在就成立**，與本票第十七節自相矛盾即為證。

**我的分類：Material。** **我的任務歸屬：本票擁有**（`## Documentation impact` 是本票自己的一節）。
**我的處置建議：`fix`——依斷根要求 (a) 帶時戳或 (b) 只留指令，並把 `TODO.md` P3-7 那一列的到期狀態一併更正。
原句依本票慣例保留。**（以上為 `actor:ensign` 的建議，**授權在 FO**。）

#### K23（Polish）承重數字的自評「唯一下降」沒有查過

implement 自報「**唯一下降的「12 欄」由 17 降為 16**」。我對 `1646f0e`→`3d91b13` 全檔計數：
**「15 個」也下降了，30 → 29。** 掉的是被 K14 授權移除的那一列
`| **S4**（附加 15 個窗口內欄位） | … | **未執行**——一個都沒有 |`。
**承重值本身沒有掉**——`15 個窗口內欄位` 仍在 S4 條文（`:934`）與另外四處。
**所以沒有回歸**，錯的只是「唯一」這個量詞沒有跑過一次全檔清點。**又是判準三的形狀。**

#### K24（Polish）S7-d 收尾第 1 點指向一個已經不存在的分支標籤

收尾寫「走第 1 點**「沒有」那條**（借用 `044` 的第二個帳號）時…」，
但第 1 點已依 (b) 收斂為一條路，「沒有」那條降為 ⚠️ 保留註記，**標籤在第 1 點裡已無處可對**。
建議改為指向那則保留註記的取回條件。

#### K25（Deferred risk）K21 第 5 點的重測範圍把第 10 格排除在外

第 5 點寫「第 1-9 格必須一併重測」，理由是「AC-4 那 27 格『擋』建立在同一組範圍上」。
**但第 5 點的觸發條件正是「補設動作改到了某一類範圍的 A1」**，
而那恰好是**可能把內容欄涵蓋進去**、使第 10 格由「可改」翻成「擋」的動作——
第 10 格正是 AC-4 用來抓過度保護的反向對照。**AC-4 的第 10 格結果來自 S7-c，補設之後不會重跑。**
**promote-to-material 條件**：任何一次 S7-d 補設實際擴大了 A／B／C 任一範圍的 A1。
（trigger 為補設時的操作失誤，**本輪未觀察到**，故列 Deferred risk 而非 Material。）

### 六、`## Documentation impact` 逐筆核對（依實際交付行為）

本輪實際交付行為＝**只動票檔一個**（`git diff --stat` 對 `384ca7a3c` 可證）。
「現在更新」只列本票，已更新 ✅；「實作後更新」六列全部繫於部署或 040 合併，**除 P3-7 那一列已到期外**（見 K22），
其餘尚未到條件 ✅；「不更新」五列全部未被觸碰 ✅。
**`record` 文件未被改寫**——`docs/_archive/` 零變動。
**`docs/INDEX.md` 無需更動**——本輪未新增或刪除任何文件。

### 七、裁決

**REJECTED。**

**理由只有 K22 一筆。** K14-K21 八筆我逐筆驗過，**沒有一筆是假修的**：
K20 我自己跑了突變測試並回溯舊版證明缺口真實存在，K19 我做了逐位元組比對，
K16 我實查了兩個 revision 的行號與兩份檔的 sha256，K21 我自行回算了 30 格的類別分佈。
未越界的部分**全部通過**，captain 的四項事實**照實記錄、未放大、未代裁決**。

**擋住的是同一個形狀的第三次復發，而且是在斷根要求入票的第一輪。**
K14／K15／K19／K20 被判為同一形狀之後，captain 親自授權了斷根；
implement 確實掃了第十六節與 design stage 的 ⚠️ 框，**但沒有掃 `## Documentation impact`**，
於是那裡的兩句話今天仍在斷言「試算表目前仍是部署前狀態」。
**這一筆帶著一個已經到期的文件義務（`TODO.md` P3-7），不是純措辭問題。**

**建議的下一輪範圍**：K22 `fix`；K23／K24 可併同一輪處理或 decline；
K25 記為 Deferred risk 並留下 promote 條件即可。
**K25 若要改，動的是 S7-d 第 5 點的文字，不是那 18 格表**——該表本輪仍逐位元組未動，請維持。


## Stage Report: review (cycle 6)

- FAILED: K14-K18 五筆 Material 是否真的修好，且修正句本身不會再過期：斷根規則是否落在操作者實際會讀到的位置、第十六節的判讀表是否完全不依賴任何會過期的讀數、K17 的兩句 live 敘述是否已被更正框涵蓋且原句保留、K18 五處 artifact rev 是否已改為正確全值
  **五筆之中四筆成立，斷根規則的涵蓋面不成立（K22，Material）。** K16：我實查兩個 revision，P3-1 證據行本 branch `:789`／main `:879` 兩者皆對，兩份檔 sha256 `a518969b…`／`b4c9b0c5…` 與自報相符，`:876` 在本 branch 確為 P3-9。K17：兩句各有一列逐句對照、原句逐字保留，並自行點出下方 ✅ 框涵蓋不到它們。K18：四處 live 全為 `…283bae3`，殘留五處 `…dbae3` 全部合法（一處為「改前值」、四處在歷史報告區塊內）。**第十六節的判讀表完全不依賴會過期的讀數**——四列判準分別是標題字串、欄數、exit code／grep、以及 AC-1 的綁定值（該值由 AC-1 條文綁定，非當次量測），全部可重跑。**不成立的是斷根規則的位置**：它放在第十六節與第十七節，兩節都是處置節；`## Documentation impact` 的 `:2998`／`:3000` 仍 live 斷言「試算表目前仍是部署前狀態」「本票尚未執行任何一步」，**與本票第十七節量測記錄（S1／S2 已執行、欄數 14／17／5）直接矛盾**，且連帶使 `TODO.md` P3-7 的追記義務已到期卻讀成未到期。
- DONE: K19-K21 三筆 Polish，其中兩筆要親手跑：K20 的交叉比對指令在「漏一欄」時是否真的指名該欄（請自行做突變測試，不要採信自評）；K21 的鑑別診斷是否真的分得出「保護不足」與「保護過頭」，四件檢查的 ⛔ 標註是否正確，重測範圍放大為 B／A／C 任一類第 1-9 格是否成立
  **K20 我自己跑了，沒有採信自評。** 從票內逐字抽出該段 python（1028 B），對票檔副本做三種突變實跑：A1 打錯 → `⛔ A1 不符: ['review_fingerprint']`；S7-b 表被改 → `['approved_fingerprint']`；漏一列 → `S7-d 漏列: ['reject_reason']` 且格數 18→15。**三種全部指名，與票內記載逐字相同。** 並從 `f8c6631` 取出真正的舊版（`if bad or set(b)!=set(d)`）跑同一組突變，漏一欄時印 `⛔ 不相符: []`——**有 ⛔ 沒有名字，舊版的缺口真實存在**，這一筆修的是判準不是措辭。**K21 我自行回算 30 格表的類別分佈**（第 1 格 C、第 2-3 格 A、第 4-9 格 B、第 10 格未保護），據此確認：兩件真成因都會造成「被擋」，兩件 ⛔ 都會**取消保護**因而使 S7-d 反而通過、且都由 AC-4 抓得到，**⛔ 標註正確**；「AC-4 抓保護不足、AC-7 抓保護過頭」與分佈一致；**第 1-9 格成立**（第 1 格是 C、第 2-3 格是 A，動 A／C 確實影響第 1-3 格）。**K19 我做了逐位元組比對**：還原 ⚠️ 框內 `> > ` 引文後與 `b8e2233` 的真正原條文比對，**兩邊皆 925 B、逐位元組相同**。殘留一格記為 K25（Deferred risk）：第 5 點排除第 10 格，而它的觸發條件正是可能把內容欄涵蓋進去的 A1 改動。
- DONE: 未越界未回歸，且 captain 的口頭事實是否照實記錄未被放大：十個報告區塊、S7-b 的 30 格表與其 A1、S7 的 12 範圍表、S3、S8、AC-1／2／3／5／6、AC-7、S7-d 的 18 格表、AC-4 條文本體是否逐位元組未動；captain 回報的四項事實（六人編輯／三人檢視／責任編輯在名單內／044 第二帳號不在名單內）與「六個編輯者可寫那三欄」這筆新事實是否照實記錄、是否標明來源為 captain 口頭回報、是否未代 captain 裁決任何事
  **全部通過，全部自行量測**（基準 `1646f0e`，比對 `cfd1794`）：十個報告區塊（verify 17546／17090／15521／14213／7163 B、review 21395／24798／17942／10867／9202 B）、**S7-b 的 30 格表 743 B `eb81d3a9f418906f`**、**S7-d 的 18 格表 466 B `2cd0045eef2c6355`**、S7 的 12 範圍表 292 B、**S3 4511 B `439894573bb37b25`**、S8 759 B、AC-1 731／AC-2 697／AC-3 1479／AC-5 393／AC-6 2701／**AC-7 2468 B**、**AC-4 條文本體 2112 B `18e2720d569805fa`**——**全部逐位元組未動**，三個共同值與 implement 自報完全相符。S3 另沿七個 revision 回溯，**7/7 同一雜湊**。branch 對 `384ca7a3c` 只動 050 一個檔；`src/`／`scripts/` 零變動；`src/data/*.json` ＝ AC-1 綁定值；`040` 的票未改寫。**captain 的四項事實逐項照實、無增減**，明寫來源為口頭回報且「不是 repo 內可驗證的事實」，全票零 email。「六個編輯者可寫那三欄」落在 S2 的 ⚠️ 框、原句保留。**未代 captain 裁決任何事**——(c) 維持 Deferred risk 未自行升級，並把「要不要把 S7 保護提前到階段一」明寫為範圍決定留給 FO／captain。
- DONE: 本輪開場的停審與 FO 流程問題
  我第一次讀票時檔案正在被寫入（40 秒內 5857→5935 行、sha256 兩次翻新），而 Cycle 7 已把「captain 共用名單」那一族敘述為已交付，但那些字在 `3d91b13` 裡一行都沒有。**我停審並回報 FO，未做任何量測、未下裁決。** FO 以 `cfd1794` 自行更正該行，implement 以 `118f474` 補齊交付；**本輪全部量測在 `cfd1794` 上重做，未沿用停審前任何讀數。**
- DONE: 對正式試算表零寫入零讀取
  本輪未發出任何 HTTP 請求、未跑 `sync-content`、未讀 `.env.local`。K20 的突變測試全部在 `scratchpad` 的票檔副本上進行，未觸碰候選位元組；`git status --short` 在我寫報告前為空。

### Summary

**REJECTED，而且只因一筆。** K14-K21 八筆我逐筆驗過，**沒有一筆是假修的**——K20 我自己跑了三種突變並回溯 `f8c6631` 的舊版證明缺口真實存在，K19 做了 925 B 的逐位元組比對，K16 實查了兩個 revision 的行號與兩份檔的 sha256，K21 自行回算了 30 格的類別分佈。未越界十二個區塊全部逐位元組未動，captain 的四項口頭事實照實記錄、未放大、未代裁決。

**擋住的是 K22：同一個形狀的第三次復發，而且就發生在斷根要求入票的第一輪。** implement 把斷根規則寫進第十六節與第十七節並掃了那兩處，**但沒有掃 `## Documentation impact`**——那一節的兩句話今天仍在斷言「試算表目前仍是部署前狀態」「本票尚未執行任何一步」，**而本票第十七節自己的量測記錄寫著 S1／S2 已執行、欄數 14／17／5**。否證證據在票內，不必外求。**這不是純措辭**：同表「`TODO.md` P3-7 追記 ⟵ 步驟 1 完成後」那一列已經到期（步驟 1 就是建 `chapter` 欄，S2 已建好），但表上讀起來像還沒到期。

**可帶走的一句**：**斷根規則寫在處置節裡，擋不住操作節與交付節。** 規則要放在**會被讀到的那一節**，而不是放在記錄它的那一節——`## Documentation impact` 正是 review stage 定義逐輪指名要查的一節，卻沒有被這條規則覆蓋到。

另三筆不阻擋：**K23**（Polish）自評「唯一下降的 12 欄」沒查過——「15 個」也由 30 降為 29，掉的是被授權移除的過期讀數，**承重值仍在 S4 條文**，沒有回歸，錯的是「唯一」這個量詞；**K24**（Polish）S7-d 收尾仍指向已收斂掉的「沒有」那條分支標籤；**K25**（Deferred risk）K21 第 5 點的重測範圍排除第 10 格，而其觸發條件正是可能使第 10 格翻面的 A1 改動，promote 條件已寫明。

### 八、補述（2026-09-25）：FO 自報 finding 的查核，與 FO 自訂規則的評估

**本節是追加補述，不改寫上面任何一個字。** 依 `AGENTS.md`「不要悄悄改寫原文」。

#### 對第七節裁決句的更正

第七節寫「**理由只有 K22 一筆**」。**該句在寫下時為真，現在不再準確**——
本節新增 **K26（Material）**。**裁決不變，仍為 REJECTED**；改變的是它現在站在兩筆 Material 上，
而 **K26 經 FO 裁定 `hold`，不在本輪處置**，與 S3 那筆一起進下一輪。

#### K26（Material，FO 自報，我查核後同意分類但修正其歸類）

**FO 的四項證據我自己重跑，全部成立：**

| FO 的宣稱 | 我跑的指令 | 結果 |
|---|---|---|
| `118f474` 是 `cfd1794` 的父 commit | `git rev-parse cfd1794^` | `118f4741dd963aa05b61c269cdbd06713d474257` ✅ |
| 早 52 秒 | `git log --format='%h a=%aI c=%cI'` | `118f474` 11:50:51、`cfd1794` 11:51:43，**author 與 committer 時間一致，差 52.0 秒** ✅ |
| `grep -c "captain 2026-09-25"`：`3d91b13`＝6、`cfd1794`＝11 | 逐 revision 重跑 | 6／11 ✅（另補：`118f474`＝11、`e8dd0c1`＝6，**躍升確實發生在 `118f474`**） |
| 「共用名單那一族在 `3d91b13` 裡一行都沒有」 | 三個標記字串各自計數 | `3d91b13` 的「六人\|六位」「三人是檢視」「口頭回報」**皆為 0**；`118f474` 為 20／3／5 ✅ |

**所以那個更正框是「一半對、一半錯」**：「在 `3d91b13` 裡一行都沒有」**成立且我獨立驗過**；
錯的只有狀態子句——「**交付待補**」與「**其交付 SHA 待 implement 回報後補記**」。
**寫下那兩句時，交付已經是它自己的父 commit，早 52 秒。**

**⚠️ FO 另一個數字我沒驗過就不會寫，這裡驗了：`118f474` 的 diffstat 不是 `+218／−12`，
是 `+216／−11`。** 該數字**只出現在 FO 給我的訊息裡，未寫進票內**（票內兩處 `218` 是無關的 byte 數），
**所以不是票內缺陷，不另立 finding**，僅回報給 FO 更正。

#### 我同意 `Material`，但**不同意「與 K14 同一形狀」這個歸類**

**分類 `Material` 成立。** 四欄證據：
①**已釋出使用者與正常流程**——`### Feedback Cycles` 是逐輪交付記錄，gate 與下一輪 worker 都讀它；
②**可觀察的傷害**——讀者會把 `3d91b13` 當成本輪的交付終點，
於是下一輪的「未越界」基準會取錯快照，`118f474` 的 +216 行會被誤判為未授權漂移。
**這不是假想：本輪我被派來時拿到的基準就不是實際交付的那一個**，
同一個錯誤信念已經實際造成過一次停審；
③**受影響的邊界**——第九節**判準三**（狀態宣稱要當場跑可否證的指令）；
④**trigger 證據**——**已觸發、寫下當時即為假**，`git rev-parse cfd1794^` 一行即可證偽。

**但它不是 K14 的形狀，票內自己已經把這兩種分開了。** 第十六節的 🔒 框逐字寫著本票錯過兩次：
「**『captain 正在 S7』（寫下時就是假的）**」與「**『runbook 一步都還沒開始』（寫下時可能為真，
被 review 讀到時已經是假的）**」。

| 子形狀 | 缺陷 | 本票案例 |
|---|---|---|
| **寫下時即為假** | 沒跑那一行本來就能回答它的指令 | 「captain 正在 S7」、**K26** |
| **寫下時為真、之後過期** | 跑了，但沒標時戳也沒改成只留指令 | 「runbook 一步都還沒開始」、**K14**、**K22** |

**K26 屬第一種，K14／K22 屬第二種。** 這個區分有執行後果：**時戳治得了第二種，治不了第一種。**
一句寫下時就假的話，補上時戳只會變成「一句有時戳的假話」。
**嚴重度我同意相當**，但**成因不同，處方也不同**，歸成同一形狀會讓下一條規則開錯藥。

#### 對 FO 擬自訂規則的評估：**擋得住四次裡的兩次半，而且機制與斷根要求相衝突**

擬議規則：「FO 寫進 `### Feedback Cycles` 的任何交付／部署狀態宣稱，
必須附上確立它的那一行指令與輸出，不能只寫結論。」

**逐次比對：**

| # | 事件 | 擋得住嗎 |
|---|---|---|
| 1 | **K18**：授權封包把 hash 縮寫成 `…dbae3`，被逐字複製五處 | ❌ **完全擋不住。** 那不是狀態宣稱，也不在 `### Feedback Cycles`，而在**授權封包** |
| 2 | **Cycle 6 兩處**：「runbook 一步都還沒開始」＋ `TODO.md:876` | ◐ **半個。** 前者是進度宣稱，擋得住；後者是**引用錯誤**，不是狀態宣稱，擋不住 |
| 3 | **Cycle 7**：把未交付說成已交付 | ✅ 擋得住 |
| 4 | **K26**：把已交付說成未交付 | ✅ 擋得住 |

**三個缺口：**

**(a) 範圍只蓋 `### Feedback Cycles`，漏掉槓桿最大的那一面——授權封包。**
K18 的錯誤源頭是封包，implement 依指示逐字保留，**於是一個錯誤被放大成五處**。
`### Feedback Cycles` 只有 FO 自己讀；**授權封包會被 worker 逐字寫進票內**。
規則蓋錯了面。

**(b) 「附上輸出」與 captain 的斷根要求直接衝突。**
斷根要求 (b) 逐字寫著「**只留可重跑的指令，不留當時的輸出**——指令永遠為真，輸出十分鐘後可能就假了」。
`### Feedback Cycles` 是永久記錄，把輸出貼進去**正是在 FO 自己的區塊裡重建 K14**。
**要貼輸出，就必須同時標 UTC 時戳並寫明那是歷史讀數**，否則這條規則會製造它想防的東西。

**(c) 「附上」不等於「先跑」，而 K26 的成因正是順序。**
「附上指令與輸出」可以在**先寫好結論之後**補跑補貼來滿足。
K26 的失敗不是缺證據，是**結論先於查核**。
**而且更精確地說：FO 查的是 `3d91b13`（查到「沒有」，這是真的），
卻沒查 HEAD、也沒查自己這個 commit 的父節點就下了「交付待補」。**
**指令必須是「列舉型」而不是「確認型」**——
`git log --oneline <base>..HEAD` 會**告訴你有什麼**，
`git show 3d91b13 | grep …` 只會**確認你猜的那一格**。
K26 是用確認型指令去回答一個列舉型問題。

**(d) 附帶觀察：狀態宣稱要分單調與非單調，兩者過期風險差很多。**
`e8dd0c1` 的 Cycle 6 更正框寫「此後 captain **已完成** S1／S2／S3」，**未標時戳**——
形式上違反斷根要求 (a)，**但我不把它列為 finding**：
「已完成 X」是**單調**的，完成的步驟不會變回未完成，它不會過期。
真正會翻面的是**非單調**句型：「**仍是**部署前狀態」「**尚未**執行」「**待補**」——
**K22 的兩句與 K26 的一句全部屬於非單調**。
**規則應該咬住非單調句型，而不是一律要求貼輸出。**

**我建議的收緊版（供 FO 參考，不代 FO 決定）：**

> FO 在**授權封包**與 `### Feedback Cycles` 寫下任何**非單調**的狀態宣稱
> （「仍是」「尚未」「待補」「還沒」「只有／全部」或任何數量詞）之前，
> **先跑一條列舉型指令，再依它的輸出寫結論**；
> 票內**只留那一行指令**，需要留結果時**同時標 UTC 時戳並寫明是歷史讀數**。
> **凡是逐字轉寫的值（hash、行號、SHA、數量），封包送出前各自跑一次回讀。**

**這一版擋得住四次全部**：第 (1) 次靠末句的回讀、第 (2) 次靠「列舉型 ＋ 引用回讀」、
第 (3)(4) 次靠「先跑再寫」與列舉型。


## Stage Report: review (cycle 6) — 補述

**本補述不取代上面的 `## Stage Report: review (cycle 6)`，只追加 FO 交辦的三件事。**

- DONE: 查核 FO 自報 K26 的時序與 grep 數字
  四項全部自行重跑、全部成立：`git rev-parse cfd1794^` ＝ `118f474`；author 與 committer 時間一致，**差 52.0 秒**；`grep -c "captain 2026-09-25"` 為 `3d91b13`＝6／`cfd1794`＝11（另補 `118f474`＝11、`e8dd0c1`＝6，**躍升確實發生在 `118f474`**）；「共用名單那一族在 `3d91b13` 裡一行都沒有」以三個標記字串各自計數，`3d91b13` 皆為 **0**。**一處數字要更正：`118f474` 的 diffstat 是 `+216／−11`，不是 FO 訊息裡的 `+218／−12`；該數字未寫進票內，不立 finding，僅回報。**
- DONE: 判定 FO 的分類建議與歸類
  **`Material` 我同意**，四欄證據寫在第八節，其中傷害一欄是實證而非假想——**本輪我被派來時拿到的基準就不是實際交付的那一個**，同一個錯誤信念已造成過一次停審。**但「與 K14 同一形狀」我不同意。** 票內第十六節的 🔒 框自己已經把兩種子形狀分開：「寫下時就是假的」（「captain 正在 S7」、**K26**）與「寫下時為真、之後過期」（「runbook 一步都還沒開始」、**K14**、**K22**）。**時戳治得了第二種，治不了第一種**——一句寫下時就假的話，補時戳只會變成有時戳的假話。嚴重度相當，成因與處方不同。
- DONE: 評估 FO 擬自訂的規則
  **擋得住四次裡的兩次半。** ①K18 完全擋不住（不是狀態宣稱，且在**授權封包**不在 `### Feedback Cycles`）；②Cycle 6 只擋得住進度宣稱那半，`TODO.md:876` 是引用錯誤擋不住；③④擋得住。**三個缺口**：**(a) 範圍蓋錯面**——`### Feedback Cycles` 只有 FO 自己讀，**授權封包會被 worker 逐字寫進票內**，K18 就是這樣被放大成五處；**(b) 「附上輸出」與斷根要求 (b) 直接衝突**——那條逐字寫「只留指令，不留當時的輸出」，把輸出貼進永久記錄等於在 FO 自己的區塊裡重建 K14；**(c) 「附上」不等於「先跑」**，而 K26 的成因正是順序，**且指令必須是列舉型不是確認型**——FO 查了 `3d91b13`（查到「沒有」，這是真的）卻沒查 HEAD 與自己的父 commit，是**用確認型指令回答列舉型問題**。**另附一項觀察**：狀態宣稱要分**單調／非單調**，「已完成 X」不會過期（故 `e8dd0c1` 的「此後 captain 已完成 S1／S2／S3」雖未標時戳，我**不列為 finding**），真正會翻面的是「仍是」「尚未」「待補」——**K22 兩句與 K26 一句全部是非單調**。收緊版規則寫在第八節末，**擋得住四次全部**。
- DONE: 未變更候選位元組，未重複開單
  本補述只追加第八節與本節，**未改寫第一至七節任何一個字**（依 `AGENTS.md`）。**S3 那筆 held finding 我沒有重複開單**——第四節已記錄 implement 正確地只提報不改動，我獨立確認 S3 逐位元組未動；**我對該筆的分類與 implement 的 `Deferred risk` 建議一致**，無異議要記。K26 依 FO 裁定 `hold`，本輪不處置。**對正式試算表仍為零寫入零讀取。**

### Summary

**裁決不變：REJECTED。** 改變的是它現在站在**兩筆 Material** 上——**K22**（本輪阻擋項，FO 授權即可修）與 **K26**（FO 自報，已裁定 `hold` 進下一輪）。第七節那句「理由只有 K22 一筆」**寫下時為真，現在不再準確**，已在第八節開頭更正，原句保留。

**FO 的自報我逐項重跑，四項全部成立**，只有 diffstat 一處要更正（`+216／−11`，且未入票）。**分類 `Material` 我同意，歸類我不同意**：票內自己早就把「寫下時即為假」與「寫下時為真、之後過期」分成兩種，K26 屬前者、K14／K22 屬後者，**而時戳只治得了後者**。

**對 FO 那條擬議規則，我的結論是「方向對、機制錯、範圍窄」**：它擋得住兩次半，漏掉的 K18 恰好是**放大倍數最高**的一次（封包一錯，票內五處）；而「附上輸出」這個機制**與 captain 的斷根要求正面衝突**，照做會在 `### Feedback Cycles` 裡重建 K14。**可帶走的一句：要擋住狀態宣稱出錯，該管的是「先跑列舉型指令再寫結論」，不是「事後附上輸出」。**

## Stage Report: implement (cycle 11)

- DONE: K22（Material，本輪阻擋項）修正：`## Documentation impact` 的兩句 live 非單調斷言依斷根要求處置，並把 TODO.md P3-7 那一列的到期狀態一併更正；同時把斷根規則從處置節搬到或複述到會被讀到的操作節與交付節，使 `## Documentation impact` 被覆蓋
  **先搬規則，再修那兩句。** 🔒 規則框複述到 **`## 部署 runbook`（操作節）** 與 **`## Documentation impact`（交付節）**，並把 reviewer 收出的判準逐字寫進框內：「**斷根規則寫在處置節裡，擋不住操作節與交付節。規則要放在「會被讀到的那一節」，而不是放在「記錄它的那一節」。**」`:2998` 的狀態欄依 **(b)** 只留指令——本列的交付判準改為「runbook 與 AC 已寫完」，**那是單調的**；`:3000` 的理由句改寫為不會過期的版本（判準是**部署完成與否**，不是開始了沒有），兩處原句都保留。**P3-7 那一列的到期狀態已更正**：條件「步驟 1 完成後」＝「`chapter` 欄建好」，S2 已建，屬**單調事實**故依規則不標時戳，並附一行可重跑的 `grep -c 'chapter'`；**本票不代為執行該追記**（改 `TODO.md` 不在本票交付範圍），只把到期狀態記明白。**另依指示自行掃描還有哪些會被讀到的節沒被覆蓋**：兩階段掃描的指令、43→57 行的命中、第二階段挑出的**四筆**（票首摘要行、證據 2 的階段 A 標籤、`## Documentation impact` 兩句、第十七節追加的「尚未執行」）與逐筆處置全部寫在第十八節，**並寫明這個掃描法擋不住的三件事**（只認五個標記詞、第二階段是人工的、掃不到「寫下時就是假的」那一種）。
- DONE: K23／K24（Polish）與 K25（Deferred risk）三筆修正；K25 請照 reviewer 寫明的 promote 條件處置，不得自行升級或降級
  **K23：我先跑清點再寫結論**（本輪規則的第一次自我適用）。指令與逐字輸出留在第十八節：以 `\d+量詞` 正規式清點 `1646f0e`→`3d91b13`，下降的有**三種**（`15 個` 30→29、`5 欄` 6→5、`6  格` 1→0）；reviewer 以純子字串計數找到**兩種**。**種數取決於怎麼數，所以這種句子必須連方法一起寫**——這是這一筆真正的教訓。三種全部逐行查過來源：兩行被 K14 授權移除的過期讀數＋一段被 K20 取代的舊腳本輸出；**承重值沒有回歸**（`15 個窗口內欄位` 仍在 S4 條文，5 處 → 7 處）。cycle 10 的報告已追加更正框，原文保留。**K24**：收尾改為指向 ⚠️ 保留註記的**取回條件**，並補「走正常那條路時不做這一步」。**K25**：重測範圍由第 1-9 格補到 **第 1-10 格**——**第 10 格是最該重測的那一格**（本點的觸發條件正是可能讓內容欄被涵蓋、使它由「可改」翻成「擋」的動作，而它的結果來自 S7-c、補設後不會自動重跑）。**分類維持 `Deferred risk`，未自行升級也未降級**；promote-to-material 條件**逐字採用 reviewer 的寫法**。
- DONE: captain 兩筆裁決與兩筆 held finding 入票，且未越界未回歸
  **A-1** 落在 S2 的 ✅ 框，照「**接受風險，不是消除風險**」的強度記錄：captain 原話、**依據是他對編輯台近期行為的判斷、repo 內無從驗證、也不是已觀察到的保證**、**不得寫成「那三欄不會被寫入」**、升級條件（「任何人」）與 `Deferred risk` 分類皆不變、FO 唯讀絆線的 `2026-09-25T18:56Z` 讀數標明為歷史讀數。並寫出後果：**現在只剩偵測，沒有預防**。**A-2** 落在第十七節追加的 ✅ 框：部署順序不改，理由「**為尚未觀察到的風險變更已驗證程序，代價大於風險**」，並連帶把「防線是告知 ＋ S3 檢查①②」再減一項。**B-1** 依我自己 cycle 10 的分類建議處置，**FO 僅就那一列解除凍結**：第一列排除那三個內容欄，表下補一列相反處置（**停住、清空、確認 sha256 回到綁定值**），原句保留，分類 `Deferred risk` 未升級。**B-2 未碰**——K26 由 FO 於 `ad07a26` 自行更正，本輪未改寫 `### Feedback Cycles` 一個位元組。**C** 的收緊版自我約束規則逐字寫進兩份 🔒 框，並點出「列舉型 vs 確認型」是 K26 的成因。
- DONE: 十二個受保護區塊逐位元組未動
  基準 `ad07a26`，區塊雜湊自行量測：**verify 五輪與 review 六輪共十一個報告區塊**（17547／17091／15522／14214／7164；21396／24799／17943／10868／9203／**13869** B）、**S7-b 的 30 格表 743 B `eb81d3a9f418906f`**、**S7 的 12 範圍表 292 B**、**S8 759 B**、**S7-d 的 18 格表 466 B `2cd0045eef2c6355`**、**AC-1 731／AC-2 697／AC-3 1479／AC-5 393／AC-6 2701／AC-7 2468 B**、**AC-4 條文本體 2112 B**、`### Feedback Cycles` 25814 B，**全部相同**。**S3 另做逐列比對**：分辨表第 2 列（423 B）與第 3 列（209 B）逐位元組未動，分辨表**之前**（2636 B）與**之後**（1154 B）兩段亦未動，**整個 S3 內被取代的既有行剛好 1 行，就是 FO 指名解凍的那一列**。承重數字只增不減。
- DONE: 對正式試算表零寫入；未改寫 040 的票
  本輪只發出**一次**唯讀讀取（`2026-09-25T19:11Z` 的標題列量測，用於判定票首摘要行的 4／8、4／8、1／8）。未跑 `npm run sync-content`；`git status --short` 只有票檔一個；`git diff --stat $(git merge-base main HEAD) -- src/ scripts/` 無輸出。

### Summary

K22 是本輪唯一阻擋項，而它的教訓比它修掉的兩句話重要：**上一輪我把 captain 的斷根規則寫進第十六節與第十七節，而那兩節都是處置節——我掃的是「我改過的地方」，不是「規則該管的地方」。** 所以本輪先把規則複述到操作節與交付節，再依 (b) 修那兩句，再依指示自行掃描全票、另外揪出三筆同形狀（票首摘要行、證據 2 的階段 A 標籤、第十七節追加的「尚未執行」），並寫明這個掃描法擋不住什麼。

**兩處自我適用值得單獨記**：K23 我先跑清點再寫結論，結果發現**下降的種數取決於怎麼數**（正規式三種、子字串兩種）——所以修法不是換一個數字，是**連方法一起寫**。第十八節裡「掃描命中 43 行」這句我也當場改掉了：**那個總行數本身就是非單調的**，更正框保留的原句同樣含標記詞，處置後只會更多（實跑 57 行）。

**captain 的兩筆裁決都照「接受風險」的強度記錄，沒有放大成保證**。A-1 與 B-1 合起來有一句要講：**不通知編輯者使「有人填值」的可能性不降反升，而 B-1 修的正是「填了值之後會不會被誤判成合法」——兩者方向相反，B-1 因此更要緊，不是更不要緊。**

**留給 FO 的一件事**：`TODO.md` P3-7 的追記義務**已經到期**，本票已把到期狀態記明白但**不代為執行**（改 `TODO.md` 不在本票交付範圍）。請 FO 或 captain 決定誰去做。

## review stage 第七輪：K22-K25、captain 兩筆裁決與 B-1 複審（2026-09-25）——**PASSED**

被審快照 `2f1d87e`（implement 交付 `458c730`；FO 的 Cycle 8 行為 `2f1d87e`），基準 `ad07a26`。
`git diff --stat ad07a26..HEAD` ＝ **1 檔、`+389／−8`**，其中 `2f1d87e` 只加 **1 行**。

### 一、未越界——用 `-U0` 的 hunk 位置判定，不採信自評

`git diff -U0 ad07a26..HEAD` 全檔**只有 8 個被刪除的既有行**，舊檔行號為
`16／91／911／1397／1398／1402／2998／3010`，**八個全部落在 live 段落**。
其餘 19 個 hunk 全是純插入。據此逐一判定（舊檔行區間為我自行掃標題取得）：

| 受保護區塊 | 舊檔行區間 | 有無 hunk |
|---|---|---|
| verify 五輪與 review 六輪共十一個報告區塊 | 3435-6288 內各段 | **無**（該區間僅兩個 hunk：`5939` 落在 `## Stage Report: implement (cycle 10)`，不在十一個之內；`6288` 是檔尾 append） |
| S7-b 的 30 格表 | 988-1076 | **無** |
| S7 的 12 範圍表 | 963-973 | **無** |
| S7-d 的 18 格表 | 1291-1352 | **無** |
| S8 | 1407-1428 | **無** |
| `## Acceptance criteria`（AC-1／2／3／4／5／6／7 全段） | 2817-2980 | **無** |
| `### Feedback Cycles` | 3025-3036 | **無**（implement 的 `458c730` 在此區間零 hunk） |
| S3 | 864-929 | 只有 `911` 一行被取代、`914` 後一段插入——**被取代的既有行剛好 1 行，即 FO 指名解凍的那一列** |

**`### Feedback Cycles` 未被 worker 代寫**：Cycle 8 那一行來自 FO 的 `2f1d87e`，
`git diff -U0 458c730..2f1d87e` 只有 `@@ -3375,0 +3376 @@` 一個 hunk。

### 二、K22——修好了，而且我自己重跑掃描確認票內沒有殘留的活躍假宣稱

- **🔒 規則框確實複述進兩節**，而且**逐位元組相同**：`## 部署 runbook`（:136-168）與
  `## Documentation impact`（:3260-3292）各 **2122 B**、sha256 皆 `52c6673eea0e429e`。
  reviewer 收出的判準在兩框內逐字各一份（全票共 4 處命中）。
- **`:2998`／`:3000` 改寫後為單調**：交付判準改成「runbook 與 AC 已寫完」與「部署完成與否」，
  兩者都是「已完成 X」型，不會翻面；原句都保留。
- **P3-7 那一列的到期狀態正確——我自己讀了正式表**（`2026-09-25T19:29Z`，唯讀，零寫入）：
  用票內第五節那段解析器（與 `/tmp/hdr.mjs` 逐位元組相同）實跑，欄數 **14／17／5**，
  `Track 1_history` 含 `chapter`、`approved_by`、`approved_at`、`reject_reason`，
  `Track 2_discussion` 第 10 欄為 `owl_comment`（底線）。
  **步驟 1 ＝「`Track 1_history` 補一欄 `chapter`」的條件確實已成立**，且為單調事實，不標時戳正確。
  同一次讀取也證實票首摘要行的 **4／8、4／8、1／8**：`status` 是八欄中唯一本來就有的，
  S2 為前兩個分頁各補 `approved_by`／`approved_at`／`reject_reason`，`site_tldr` 一欄未補。
- **另揪出的三筆同形狀全部成立**（票首摘要行、證據 2 的階段 A 標籤、第十七節的「尚未執行」）。
- **自陳的三項掃描盲點誠實**。我用票內那段 python 原樣重跑：`ad07a26` → **42 行**、HEAD → **57 行**，
  逐行判讀 57 行，**沒有任何一筆是殘留的活躍現況假宣稱**——
  命中的全是條件句、判準敘述、更正框刻意保留的原句、或帶 UTC 時戳的歷史讀數。

### 三、K23／K24／K25

- **K24 ✅**：第 1 點已收斂成一條路，「沒有」那條降為 ⚠️ 保留註記；
  新收尾指向該註記的「什麼情況要把它取回來」，與註記文字一致，並補上「走正常那條路時不做這一步」。
- **K25 ✅**：範圍補到第 1-10 格，理由與 reviewer 一致（觸發條件正是可能使第 10 格翻面的動作，
  且第 10 格的結果來自 S7-c、補設後不會重跑）。**分類仍是 `Deferred risk`，未升未降**；
  promote 條件「任何一次 S7-d 補設實際擴大了 A／B／C 任一範圍的 A1。」**逐字相符**（全票 2 處：原文＋新處）。
  「AC-4 那 27 格」改為「那 30 格」正確——第 10 格的「可改」預期同樣建立在同一組範圍上。
  S7-b 的 30 格表與 S7-d 的 18 格表本輪確實未動（見第一節）。
- **K23：結論成立，但它自己的兩個計數是錯的**——見第五節 L1、L2。

### 四、captain 兩筆裁決與 B-1

- **A-1 ✅**：照「接受風險、非消除風險」記錄。**票內沒有出現任何保證句**；
  明寫依據是 captain 對編輯台近期行為的判斷、repo 內無從驗證、不是已觀察到的保證。
  升級條件逐字仍是「**任何人**」（:1010 實讀），分類仍是 `Deferred risk`，
  絆線讀數帶 `2026-09-25T18:56Z` 並標明會過期，並寫出「只剩偵測、沒有預防」。
- **A-2 ✅**：captain 原話與採納理由照實，未加碼也未削弱。
- **B-1 ✅**：第一列排除那三個內容欄，表下補一列相反處置（停住、清空、確認 sha256 回到綁定值），
  原句保留、分類未升級；**S3 其餘逐位元組未動**（見第一節）。

### 五、本輪的發現（三筆 Polish，一筆升報，**都不阻擋**）

#### L1（Polish）「`1646f0e` 5 處 → HEAD 7 處」兩個端點都對不上

`git show <rev>:<票>` 逐版清點 `15 個窗口內欄位`：
`1646f0e` **6**、`3d91b13` **5**、`ad07a26` **7**、`HEAD` **12**（出現次數與行數相同）。
**「5 → 7」實際上是 `3d91b13` → `ad07a26`，不是 `1646f0e` → HEAD。**
票內 3 處這樣寫（第十八節 K23、cycle 10 報告的追加更正框、Stage Report cycle 11），
**FO 的 Cycle 8 行也照抄了「5→7 處」**。

**結論本身成立，我自己驗過**：S4 條文 `**S4　三個分頁附加 15 個窗口內欄位，全部留白。**`
在 `1646f0e`／`3d91b13`／`HEAD` 三版都在；`1646f0e` → `3d91b13` 掉的那一處是
`1646f0e:2263` 的判讀表列，正是被 K14 授權移除的過期讀數。**承重值沒有回歸。**
**錯的是它舉的證據**：那個窗口內 `15 個窗口內欄位` 其實由 6 降為 5，
而票內用一組「上升」的數字去證明「沒有回歸」，把一次**被授權的下降**蓋掉了。

**附帶查到**：`12 欄` **在本票全部 37 個版本裡單調不減**（0→2→9→11→14→15→16→17→20→22→24→30），
**從來沒有 17 降為 16**。cycle 10 的「唯一下降的 12 欄由 17 降為 16」不可重現，
reviewer（cycle 6）沿用未查，cycle 11 又把它轉寫成「reviewer 以純子字串計數找到兩種」。
**這個數字已經傳了三輪沒有人跑過。**

四項證據：使用者＝下一位讀「未越界」證據的 FO／reviewer／captain；
可觀察損害＝證據依原文重跑得不到原值，且掩蓋了一次被授權的下降；
受影響的 AC 或邊界＝**無**（「承重數字只增不減」這條邊界實際上沒有被破）；
trigger＝已重現。**故為 Polish，不是 Material。** 任務歸屬本票；Cycle 8 那一行屬 FO。

#### L2（Polish）「本輪處置前跑出來 43 行」實際是 42 行

用票內第十八節那段 python **原樣**對 `ad07a26` 實跑 ＝ **42** 行；對 HEAD ＝ **57** 行（57 相符）。
與 L1 同一形狀。結論（「總行數非單調，不要拿它當指標」）成立。

#### L3（Polish）覆蓋清單只列四節，未寫判準，也未列出掃過而判定不需要的節

FO 的指示是「**用可否證的方式記錄你掃了哪些、判準是什麼**」。第十八節的覆蓋清單只有 4 列，
沒有寫「會被讀到的節」如何認定，也沒有列出被排除的節。我自行列舉全票 **11 個 live `## ` 節**，
帶 🔒 框的只有 2 個。具體缺口兩處：

- **`## implement stage 實測結果（2026-09-24）`（2455 行）**——其中第八節「校正後的步驟 1-7」
  **就是 captain 真正照著執行的那一節**，而 `## 部署 runbook` 的 ⚠️ 框正是把人導去那裡。
  規則在這個 `##` 節內只出現在第十六／十七節，位置在第八節之後約一千行。
- **`## Risk evidence`**——本輪新揪出的三筆同形狀，其中一筆（證據 2 的階段 A）就在這一節。

**規則的效力沒有缺口**（框題自己寫「全票適用，不限節次」），缺的是**下筆的人在下筆的位置看得到它**——
與 K22 判準同一形狀。**本輪票內沒有因此殘留任何活躍假宣稱**（第二節已實測），故列 Polish。

#### L4（升報，非本輪缺失）P3-7 的文件義務已到期但未執行

我自己讀正式表確認 `chapter` 欄存在，**條件成立**。本票依 FO 授權只記到期狀態、不代為執行。
review stage 定義要求「必要更新已完成」，而這一筆已到期未做。
**這是範圍決定，不是 worker 的缺失**，implement 已逐項升報。請 FO 或 captain 指定執行者。

### 六、`## Documentation impact` 逐筆核對（依實際交付行為）

實際交付行為＝**只動票檔一個**：`git diff --stat 384ca7a..HEAD` 僅 `050-…md`；
`src/`／`scripts/`／`docs/_archive/`／`docs/INDEX.md`／`docs/health-check/`／`docs/content-pipeline/`
**零變動**；工作區乾淨。
「現在更新」只列本票，已更新 ✅。「實作後更新」六列：**P3-7 那一列已到期未執行（L4）**，
其餘五列仍繫於「040 合併後」或「部署完成後」，未到條件 ✅。「不更新」五列未被觸碰 ✅。
**`record` 文件未被改寫**（`docs/_archive/` 零變動）。
**`docs/INDEX.md` 無需更動**——本輪未新增或刪除任何文件。

### 七、對正式試算表零寫入——我自己跑了 AC-6 的唯讀 sandbox

`2026-09-25T19:30Z`，指令二原樣：exit **0**、逐字印出 `（40 筆）` 與 `（16 筆，含 tldr）`、
sha256 為 `4d1992e3…cea3b`／`4071978a…3162`，**與 AC-1 的綁定值逐字相同**。
⇒ `chapter`／`owl_depth_comment`／`full_content` 三欄**當時仍全欄留白**，59 列發布內容未變動。
**此為歷史讀數，會過期。** repo 的 `src/data/*.json` 與 main 相同，未跑 `sync-content`。

### 八、裁決

**PASSED。**

FO 授權的七件事——K22／K23／K24／K25、captain 的 A-1／A-2、B-1——**全部落地，沒有一筆是假修的**。
阻擋本票兩輪的 K22 這次真的斷根了：規則搬到了會被讀到的兩節、兩框逐位元組相同、
兩句 live 假宣稱改成單調寫法、P3-7 的到期狀態我親手讀正式表確認正確，
而且我用票內自己那段掃描重跑全票，**57 行命中裡沒有任何一筆是殘留的活躍假宣稱**。
受保護的十二個區塊與 `### Feedback Cycles` 逐一確認未動，S3 只動了被指名解凍的那一列。

**三筆 Polish 不阻擋，但 L1 值得單獨記**：它是**判準三在本票的第四次復發**，
而且發生在**修復第三次的那一輪、那一段**——那一段的論點正是「這種句子必須連方法一起寫」。
更值得記的是它揭出的第二件事：`12 欄 17→16` 這個數字**傳了三輪、經過兩個角色，沒有人跑過**。
**可帶走的一句：判準三真正的缺口不在「寫的人沒查」，在「轉寫的人預設上游查過」。**
建議 FO 用一輪低成本的定點修正處理 L1／L2（三句話加它自己的 Cycle 8 行），不必退回整輪。

## Stage Report: review (cycle 7)

- DONE: K22 是否真的修好且規則這次覆蓋到位：🔒 規則框是否確實複述進 `## 部署 runbook` 與 `## Documentation impact`、:2998 與 :3000 改寫後的判準是否為單調且不會再過期、TODO.md P3-7 那一列的到期狀態是否正確、implement 自行掃全票另揪出的三筆同形狀是否成立、以及它自陳「這個掃描法擋不住的三件事」是否誠實且完整
  **全部成立。** 兩框 **2122 B、sha256 同為 `52c6673eea0e429e`**（:136-168 與 :3260-3292），reviewer 判準逐字各一份。`:2998`／`:3000` 改為「已寫完」與「部署完成與否」，皆「已完成 X」型，不會翻面。**P3-7 我親手讀正式表確認**（`19:29Z`，唯讀，用票內第五節的解析器，與 `/tmp/hdr.mjs` 逐位元組相同）：欄數 14／17／5、`Track 1_history` 含 `chapter` ⇒ 步驟 1 條件成立，屬單調事實，不標時戳正確；同一次讀取印證票首的 4／8、4／8、1／8。三筆同形狀全部成立。**三項盲點誠實**——我用票內那段 python 原樣重跑（`ad07a26` 42 行、HEAD 57 行），逐行判讀 57 行命中，**沒有任何一筆是殘留的活躍現況假宣稱**。falsifying change：若票內任何一句仍對「正式表現在做到哪裡」下無時戳斷言，這 57 行裡就會挑得出來。
- DONE: K23／K24／K25 三筆：K23 請自行用兩種計數法各跑一次，判定「下降種數取決於計數方法」這個結論是否成立、承重值是否真的沒有回歸；K24 收尾改指向取回條件是否正確；K25 重測範圍由第 1-9 補到第 1-10 格是否成立，且分類是否未被自行升降、promote 條件是否逐字採用
  **K23 的結論成立，它自己的兩個計數錯了（L1／L2，Polish）。** 兩種計數法我各跑一次：`\d+\s*量詞` 正規式得三種下降（`15 個` 30→29、`5 欄` 6→5、`6  格` 1→0，與票內逐字相符）；**嚴格不含空白的子字串計數得零種**——所以「種數取決於計數方法」成立，而且比票內寫的更強。**承重值確實沒有回歸**：S4 條文 `15 個窗口內欄位` 在 `1646f0e`／`3d91b13`／`HEAD` 三版都在，掉的那一處是 `1646f0e:2263` 被 K14 授權移除的判讀表列。**但票內「`1646f0e` 5 處 → HEAD 7 處」兩個端點都錯**：實測 `1646f0e`=6、`3d91b13`=5、`ad07a26`=7、`HEAD`=12，「5→7」其實是 `3d91b13`→`ad07a26`；且該窗口內這個值是**下降** 6→5，票內卻用一組上升的數字去證「沒有回歸」。另查出 `12 欄` **在 37 個版本裡單調不減（0→30），從未 17 降為 16**——該數字傳了三輪沒有人跑過。**K24 正確**：收尾指向 ⚠️ 保留註記的「什麼情況要把它取回來」，與註記文字一致。**K25 成立**：範圍第 1-10 格、「那 30 格」用詞正確（第 10 格的「可改」同樣建立在同一組範圍上）、**分類仍為 `Deferred risk` 未升未降**、promote 條件全票 2 處逐字相符。
- DONE: captain 兩筆裁決與 B-1 的入票強度，以及未越界未回歸：A-1 是否照「接受風險、非消除風險」記錄且未出現任何保證句、升級條件與分類是否不變、A-2 理由是否照實；B-1 是否只動 FO 指名解凍的那一列而 S3 其餘逐位元組未動；十一個報告區塊、S7-b 的 30 格表、S7 的 12 範圍表、S8、S7-d 的 18 格表、AC-1／2／3／5／6、AC-7、AC-4 條文本體是否逐位元組未動；`### Feedback Cycles` 是否未被 worker 代寫
  **全部通過。** A-1 無任何保證句，明寫「repo 內無從驗證、不是已觀察到的保證」；升級條件實讀 :1010 逐字仍是「任何人」，分類仍 `Deferred risk`，絆線讀數帶時戳並標明會過期。A-2 原話與理由照實。**未越界我用 `-U0` 的 hunk 位置判定，不採信自評**：`ad07a26..HEAD` 全檔**只有 8 個被刪除的既有行**（舊檔 16／91／911／1397／1398／1402／2998／3010），**八個全部在 live 段落**；十一個報告區塊（舊 3435-6288）區間內只有兩個 hunk——`5939` 落在 `## Stage Report: implement (cycle 10)`（不在受保護的十一個之內）、`6288` 是檔尾 append；S7-b 30 格表（988-1076）、S7 12 範圍表（963-973）、S7-d 18 格表（1291-1352）、S8（1407-1428）、`## Acceptance criteria` 全段（2817-2980）**零 hunk**。**S3（864-929）內被取代的既有行剛好 1 行，就是 911，即 FO 指名解凍的那一列。** `### Feedback Cycles`（3025-3036）在 implement 的 `458c730` 裡**零 hunk**；Cycle 8 那一行來自 FO 的 `2f1d87e`（該 commit 只有 `@@ -3375,0 +3376 @@` 一個 hunk）。falsifying change：任一受保護區間出現 hunk，上表就會指出來。
- DONE: 依實際交付行為核對 `## Documentation impact`，並確認對正式試算表零寫入
  交付面 `git diff --stat 384ca7a..HEAD` **只有票檔一個**；`src/`／`scripts/`／`docs/_archive/`／`docs/INDEX.md`／`docs/health-check/`／`docs/content-pipeline/` 零變動，工作區乾淨。`record` 文件未被改寫，`INDEX.md` 無需更動（未增刪文件）。「實作後更新」的 **P3-7 一列已到期未執行**，依 FO 授權不由本票代做，列為 **L4 升報**。**零寫入我自己驗**：`19:30Z` 原樣跑 AC-6 唯讀 sandbox，exit 0、逐字印 `（40 筆）`／`（16 筆，含 tldr）`、sha256 `4d1992e3…cea3b`／`4071978a…3162` **與 AC-1 綁定值逐字相同** ⇒ 三個內容欄當時仍全欄留白。此為歷史讀數，會過期。

### Summary

**PASSED。** FO 授權的七件事全部落地，沒有一筆是假修的；阻擋兩輪的 K22 這次真的斷根——規則搬到了會被讀到的兩節、兩框逐位元組相同、兩句 live 假宣稱改成單調寫法、P3-7 的到期狀態我親手讀正式表確認正確。我用票內自己那段掃描重跑全票，57 行命中裡沒有殘留的活躍假宣稱；受保護的十二個區塊與 `### Feedback Cycles` 以 hunk 位置逐一確認未動。

**三筆 Polish 不阻擋，L1 值得單獨記**：它是判準三在本票的**第四次復發**，而且發生在**修復第三次的那一輪、那一段**——那一段的論點正是「這種句子必須連方法一起寫」。它並揭出第二件事：`12 欄 17→16` 這個數字**傳了三輪、經過兩個角色，沒有人跑過**（我逐版清點 37 個版本，`12 欄` 單調不減）。**可帶走的一句：判準三真正的缺口不在「寫的人沒查」，在「轉寫的人預設上游查過」。**

**留給 FO 兩件事**：L1 的「5→7 處」也在 FO 自己的 Cycle 8 行裡，worker 不代寫；`TODO.md` P3-7 的追記義務已到期（L4），須指定執行者。建議用一輪低成本定點修正處理 L1／L2，不必退回整輪。

## Stage Report: implement (cycle 12)

- DONE: L3（最要緊，captain 正在照第八節執行）：把「會被讀到的節」寫成可判定的判準，補上缺口的兩節——第八節「校正後的步驟 1-7」與 `## Risk evidence`，並列出掃過而排除的節與排除理由，使覆蓋清單本身可被否證
  **判準寫成三條閱讀路徑**（P1 操作／P2 交付／P3 驗收），每條各給**讀者是誰、讀它做什麼、以及一個機器可查的代理特徵**（步驟編號或可執行區塊／「⟵ 條件：」義務表／`AC-` 條文與升級條件）。**逐節判定全部 11 個 live `##` 節，一個都沒略過**，六個排除的各附理由（背景、已被取代、裁決記錄、全節不適用、範圍記錄）。清單來源附一行可重跑的 `grep`，**我逐字跑過，印出的 11 節與表格同序同名**。缺口補上：**第八節加 🔒 框並另加一句「這一節是 captain 實際照著做的那一節」**、`## Risk evidence` 加 🔒 框。**要 🔒 的 5 節現有 4 節**，唯一缺口是 `## Acceptance criteria`——它落在 P3 上，但本輪授權列為**全段逐位元組不得動**，**我沒有越界**，已在票內寫明缺口、評估其當前重量（AC-1／2／3／5／6 條文單調；AC-4／AC-7 的 `前置` 欄兩句已由 S7-b／S7-d 的 ✅ 框接住），並請 FO 決定要不要另開一輪。原表逐字保留，並寫明它錯在「只列了我加過框的節，沒有分母也沒有排除清單」。
- DONE: L1 的票內部分與 L2 定點修正：L1 只修票內敘述；L2 的「處置前 43 行」改為 42 行；兩筆都要先跑清點再寫結論，並把指令留在票內
  **兩筆都先跑再寫。** **L1**：逐版清點 `grep -c '15 個窗口內欄位'`，七個版本全部釘死 SHA——`1646f0e=6`／`3d91b13=5`／`ad07a26=7`／`458c730=11`／`2f1d87e=12`／`87f6b80=16`／`7d109ce=16`，**與 FO 的輸出逐字相同**。原句兩個端點皆錯（`1646f0e` 是 6 不是 5；7 是 `ad07a26` 不是 HEAD），**而且方向反了**——cycle 10 真正改動的窗口該值是 **6→5 下降**，我卻拿一組上升的數字去證「沒有回歸」。**改用正確的舉證**：承重的不是出現次數，是那一行條文還在不在；附第二條指令，**七版印出的 S4 條文行逐字相同**（我逐字跑過）。附帶把 reviewer 查出的「`12 欄` 從未 17 降為 16」自行重跑確認：**本票檔 39 個版本、下降次數 0**（並把「版本數本身非單調」這件事釘在 `7d109ce`）。**L2**：把那段 python 對兩個釘死 SHA 的內容各跑一次，`ad07a26` ＝ **42**（原寫 43，憑印象）、`458c730` ＝ **57**；順帶把「處置後」的標籤由當時的工作區改成釘死的 SHA。兩處原數字都保留。**`### Feedback Cycles` 內 Cycle 8 那一處未碰**——FO 已於 `7d109ce` 自行更正。
- DONE: 新增一筆同形狀（FO 提報，分類建議 Polish）：review cycle 7 報告內以「HEAD」當量測基準的標籤；請把該類標籤改為釘死的 SHA，並把「引用版本一律釘 SHA、不得用 HEAD／main 等移動引用」寫進 🔒 規則框
  **L5 入框**，四份 🔒 框全部更新（原兩份加入、新兩份帶著加入）。**界線一併寫明**：`main`／`HEAD` 出現在**指令**裡沒問題，只要把解析出的 SHA 一併印在旁邊（票內 `git merge-base main HEAD` 那幾處都是合格的）；**不可以的是拿它當量測標籤**。**沒有改 reviewer 的報告**——review cycle 7 區塊在授權中列為逐位元組不得動，**這一筆來源在那裡、處置在這裡**：規則入框，並改掉票內我自己寫的兩處（第十八節 K23 一處、Stage Report cycle 10 的 ⚠️ 框一處）。我自行重跑確認兩端可重現：`2f1d87e`＝12、`87f6b80`＝16——**沒有人數錯，錯的是標籤**。
- DONE: 未越界未回歸；L4 hold；對正式試算表零寫入
  基準 `7d109ce`，區塊雜湊自行量測，**全部逐位元組未動**：**verify 五輪與 review 七輪共十二個報告區塊**（17547／17091／15522／14214／7164；21396／24799／17943／10868／9203／13869／**11444** B）、**S7-b 的 30 格表 743 B**、S7-b 角色分堆表 480 B、**S7 的 12 範圍表 292 B**、**S3 整段 6730 B `bae19747dae42b5e`（本輪未再解凍任何一列）**、**S8 759 B**、**S7-d 的 18 格表 466 B**、**`## Acceptance criteria` 全段 13187 B `c5fdb9a17b85cd20`**（AC-1／2／3／5／6／7 與 AC-4 條文本體另各自比對亦相同）、`## 元件與資料需求` 771 B、**`### Feedback Cycles` 33036 B**。承重數字九項**完全不變**（本輪無一項增減）。**L4 未處置**（範圍決定，FO 另行帶給 captain）。**對正式試算表零讀零寫——本輪一次 HTTP 請求都沒有發出**，captain 正在執行 S4、窗口已開，本輪需要的資料全部來自 git 物件。

### Summary

低成本定點修正，照 reviewer 指定的尺度，**沒有開新的掃描維度**。

**L3 的重點不是補兩節，是那份清單原本無法被否證。** cycle 11 的覆蓋清單四節全對，但它只列了「我加過框的節」——沒有判準、沒有分母、沒有排除清單，**所以沒有任何方式能看出它漏了什麼**，reviewer 一跑就看出 11 節只有 2 節帶框。而漏掉的其中一節，**captain 此刻正照著它執行部署**，所以它排第一。**一份無法被否證的清單，和一個沒查過的數量詞，失敗方式相同**——這是第九節判準三的另一面。

**L1 不只是兩個端點錯，是舉證方向反了**：我拿一組上升的數字（`3d91b13`→`ad07a26`）去證一件發生在下降窗口（`1646f0e`→`3d91b13`，6→5）裡的事。結論仍成立，但要改用「S4 條文那一行七版逐字相同」來證，不是用出現次數。**附帶那一筆更難看**：`12 欄` 從未由 17 降為 16，而那個數字傳了三輪、經過兩個角色，**沒有人跑過**。

**L5 值得與前四個變種並列記錄，因為它落在 reviewer 自己身上**：沒有人數錯，錯的是標籤——`HEAD` 寫下的瞬間就開始過期。規則因此加了 SHA 那一條。

**留給 FO 兩件事**：**L4**（`TODO.md` P3-7 的追記義務已到期，須指定執行者）本輪 hold 未處置；**`## Acceptance criteria` 的 🔒 缺口**本輪因授權邊界未補，票內已寫明缺口與當前重量，請決定要不要另開一輪。

> ⚠️ **2026-09-25 補註（cycle 13）：本報告列的 B 值採哪一種慣例。**
> **本票的 B 值 ＝ 從該區塊的起始標記，到下一個標記之前的全部位元組，**含區塊尾端那個換行****。
> reviewer 採**不含**尾端換行，所以它量到的 `13187`／`771`／`33036` 各少 1 B，**三處一致**。
> **兩邊對「有沒有變動」的結論完全相同**——這是慣例差，不是出入。
> 由 reviewer（cycle 8）主動指出，**不需要改數字，但需要寫明慣例**，否則下一個人會當成不符。
>
> **另**：`## Acceptance criteria` 的 🔒 缺口，FO 已於 Cycle 9 裁定 **`decline`**，
> 裁定、理由與 promote 條件已寫進第十八節的缺口框正文。

## review stage 第八輪：L1／L2／L3／L5 的定點修正複審（2026-09-25）——**PASSED**

被審快照 `8901df9`（implement cycle 12），FO 的 Cycle 9 為 `defcfe3`。基準 `7d109ce`。
**全部數字我自己重跑過，沒有採信任何自評。** 判 **PASSED**，附四筆 Polish。

### 最要緊的一筆：那份清單仍然通不過它自己寫的否證測試

票內第十八節寫著：**「拿上表第五欄去掃全票的 live `##` 節，應該得出與下表完全相同的
「要／不要」分佈。掃出來不一樣，就是判準或清單有一邊錯了。」**

**我掃了。不一樣。**

**`## Out of scope` 落在 P3 上。** P3 的代理特徵逐字是「節內含 `AC-` 條文、`Verified by:`、
或**風險升級條件**」，而該節第 3690 行逐字寫著：

> **升級為 Material 的條件：有人在部署後改動三個分頁上任何一個標題字串。**

表格第 11 列判它「不要」，理由是「範圍記錄。「不做什麼」是單調的」。
**那個理由被該節自己的內容否證**：第 3692 行原句「這個條件**現在就在觸發範圍內**——
captain 正在建欄與輸入標題」已經過期過一次，第 3694 行就是它的 ⚠️ 更正框；
第 3681 行「captain **現在**照票輸入的這批標題是安全的」也得加一則註記才站得住。
**這一節不只是可能出現過期敘述，它已經出現過一次了。**

**所以分母是 6 不是 5，缺口是兩個不是一個。** 該節現有的 🔒 只有第 3699 行
更正框裡那一句「本框刻意不寫現在做到哪裡」，範圍只及於那一框。

### 判準本身還不能機器判讀

第五欄叫「**機器可查的代理特徵**」，但它沒有分「**提及**」與「**承載**」。
我拿它寫成正規式原樣掃，除了 `## Out of scope` 之外還多打中兩節：
`## 元件與資料需求`（`步驟 9`、`AC-1` 都只是交叉引用）與
`## 相依關係釐清`（第 3314 行有一張 `| 條件 | 狀態 |` 表，正是 P2 的代理特徵）。
那兩節「不要」的結論我同意，**但憑第五欄的字面掃不出這個結論**——
得再加一個沒寫出來的判斷。**沒寫出來的那一步，就是重跑不會一致的地方。**

### 逐項複驗

- DONE: L3 的覆蓋清單這次是否真的可被否證：三條閱讀路徑（P1 操作／P2 交付／P3 驗收）的判準是否可判定、那行 grep 是否真的印出同序同名的 11 節（請自行跑，不要採信自評）、六個排除節的理由是否成立、以及拿該判準重跑是否會得出相同的節清單
  **大幅改善，但否證測試沒通過。** 那行 `grep` 我逐字跑過：**印出 11 節，與表格同序同名**（第 2 列標題有簡寫，指涉無誤）；全檔 49 個 `##` 中 38 個報告區塊全被排除乾淨，分母正確。六個排除理由**四個成立**（`## Problem`／`## 已知的工作內容`／`## 相依關係`／`## 相依關係釐清`），**一個措辭過寬**（`## 元件與資料需求` 寫「全節為『不適用』」，實際只有前兩個項目符號是不適用，其餘為單調禁令，結論仍對），**一個被否證**（`## Out of scope`，見上）。**重跑不會得出相同清單**——這正是該清單自己寫的失敗條件。falsifying change：若把 `## Out of scope` 補進 P3 並把第五欄的「含」定義成「承載而非提及」，重跑就會一致。
- DONE: L1／L2／L5 三筆定點修正是否成立：L1 改用「S4 條文那一行七版逐字相同」為證是否正確且可重跑、七個釘死 SHA 的計數是否與你自己的量測相符；L2 的 42／57 是否正確；L5 的規則是否確實入四份 🔒 框、其「指令裡可用 HEAD 但不可當量測標籤」的界線是否站得住
  **三筆全部成立，全部可重跑。** **L1**：七版計數我自己跑，`1646f0e=6`／`3d91b13=5`／`ad07a26=7`／`458c730=11`／`2f1d87e=12`／`87f6b80=16`／`7d109ce=16`，**與票內逐字相同**；新舉證更強——七版 S4 條文行 `sort -u` 得 **1 筆**，逐位元組相同。附帶那筆也對：`12 欄` 在 39 版中**下降次數 0**，子字串與行計數兩種計法都是 0（首版 0 → `7d109ce` 36 用的是出現次數計法，我重現得到同值）。**L2**：把票內那段 python 原樣對兩個 SHA 各跑一次，`ad07a26`＝**42**、`458c730`＝**57**，正確。**L5**：SHA 那一條確在四份 🔒 框（:70／:186／:910／:3537）。界線**站得住**——live body 40 處 `HEAD` 我逐行看過，六處 `git merge-base main HEAD` 全都把 `384ca7a3…` 印在同一行；唯一當量測標籤的 :3028 是帶更正框的保留原句。
- DONE: 未越界未回歸，且 FO 本輪兩筆裁定是否被照實記錄：十二個報告區塊、S7-b 的 30 格表與角色分堆表、S7 的 12 範圍表、S3 整段、S8、S7-d 的 18 格表、`## Acceptance criteria` 全段、`### Feedback Cycles` 是否逐位元組未動；承重數字是否九項皆未增減；L4 是否確實未處置僅標明升報；`## Acceptance criteria` 的 🔒 缺口是否照 FO 的 decline 與 promote 條件記錄而未自行補框
  **全部成立，而且我量到的比票內宣稱的更嚴。** 逐節雜湊比對 `7d109ce` vs `8901df9`：**全檔 37 個報告區塊中 36 個逐位元組相同**（唯一變動的 `Stage Report: implement (cycle 10)` 13893→14453 B 正是 L5 授權要改的那一框），**十二個 verify／review 區塊無一變動**。整段比對（範圍比票內更寬）：S3 6396 B `69cd05b9`、S7 範圍 592 B、S7-b 12362 B、S7-d 17448 B、S8 758 B、`## Acceptance criteria` 13186 B、`## 元件與資料需求` 770 B、`### Feedback Cycles` 33035 B（`8901df9` 與 `7d109ce` 同雜湊 `74022618b22b0885`，implement 確實沒碰）——**兩側皆同**。承重九項 `24 欄`／`18／21／12`／`40 筆`／`16 筆`／`59 列`／`12 個保護範圍`／`6 段` 計數完全相同，另兩項只增不減。全部 7 行刪除都是原表與原句，且兩者都在 `>` 框內逐字保留。`src/`／`scripts/`／`040` 票／`docs/` 其餘檔**零變動**。**L4 確實未處置**：`TODO.md` 自 `7d109ce` 起零變動，P3-7 仍為「待決定」無追記，票內 :3119／:3162 標明 hold 與升報。**AC 缺口未自行補框**（該節逐位元組相同），FO 的 decline 與 promote 條件記於 Cycle 9。

### 三筆較輕的

- **L2 有殘留。** 第 2976 行仍寫「**43 行**裡絕大多數是合法的」，就在改成 42 的那句下面 11 行，
  **而且它是正文不是保留原句**（無 `>` 前綴）。同一個數字、同一節、只改了一半。
- **第十六節（:2570）與第十七節（:2682）的 🔒 框沒有 SHA 那一條。** 依新判準那兩節不在閱讀路徑上、
  不需要框，但票內保留的 cycle 11 原表仍把它們列為「✅ 上一輪已有」，**票內因此並存兩種版本的規則框**。
- **票內缺口框（:2926）仍寫「請 FO 決定要不要開一輪」，而 FO 已在 Cycle 9 裁定 `decline`。**
  implement 寫 `8901df9` 時該裁定還不存在，**不是它的疏漏**；但答案現在只在 `### Feedback Cycles` 裡，
  正文讀者看到的仍是一個懸而未決的問句。

### 量測慣例的一點差異（不是出入）

票內的 `13187`／`771`／`33036` B 比我量到的各多 1 B，三處一致——是區塊尾端換行算不算的慣例差。
**兩邊對「有沒有變動」的結論完全相同**，我是獨立比對雜湊得到的，不是換算票內數字得到的。

### 裁決

**PASSED。** 四筆全部是 Polish，無一阻擋交付：L1／L2／L5 三筆授權修正**完全成立且可重跑**，
L3 把一份無法被否證的四列清單換成一份可以被否證的十一列清單——**這是真的進步，
而它現在通不過測試，正是因為它終於有測試可通不過。**

**但 L3 的成功條件是 reviewer 上一輪逐字寫的「有人拿它去掃，應該得出相同的節清單」，
第一次拿去掃就不一樣。** 建議再一輪低成本定點修正（兩處：把 `## Out of scope` 補進 P3，
把第五欄的「含」定義成「承載而非提及」），**不必退回整輪，也不要再開新的掃描維度。**

**可帶走的一句**：上一輪學到「一份無法被否證的清單，和一個沒查過的數量詞，失敗方式相同」。
這一輪補上後半句——**一份可被否證的清單，要等到有人真的拿去否證，才知道它對不對。
寫下判準不等於通過判準。**

## Stage Report: implement (cycle 13)

> **B 值慣例（本報告與 cycle 12 報告通用）**：B 值 ＝ 從該區塊起始標記到下一個標記之前的全部位元組，**含區塊尾端那個換行**。reviewer 採不含，故其數值各少 1 B。**兩邊對「有沒有變動」的結論相同**，這是慣例差不是出入。

- DONE: 把 `## Out of scope` 補進 P3 閱讀路徑並加 🔒 框，分母由 5 改為 6，原表與原理由逐字保留
  🔒 框已加（正式框第一行全票現為 **5 處**，附一行可重跑的 `grep -c` 驗證，我逐字跑過印 5）。覆蓋表第 11 列由「不要」改判 **P3／要**，原判與原理由 `範圍記錄。「不做什麼」是單調的` 逐字保留在更正框內，並寫明它錯在哪：該節的 `### design stage 追加的 Out of scope` **逐字載有「升級為 Material 的條件：有人在部署後改動三個分頁上任何一個標題字串」**，那是本節自己下的風險判定，**正是 P3 的代理特徵**。並照 reviewer 的指出寫明**它不是「可能會過期」而是「已經過期過一次」**——同子節的「這個條件現在就在觸發範圍內」已過期，其下方那則 ⚠️ 更正框就是為它寫的。**另說明該節原有的那個 🔒 只寫在該更正框內部、範圍只及於一框**，本輪補的是節層級的框，兩者不衝突也不重複。最後收一句：「不做什麼是單調的」**這句話本身沒錯，錯的是把它當成整節的性質**——該節同時載有範圍記錄（單調）與風險升級條件（非單調），**後者決定它要不要框**。
- DONE: 把第五欄的「含」定義成「承載而非提及」，補定義後自行重跑否證測試並把指令與逐字輸出留在票內
  **定義寫在表上方**：承載 ＝ 本節自己就是那樣東西的出處；提及 ＝ 只是指向別節。第五欄三條全部改寫成**只認承載**的形式，並新增第六欄逐條說明「為什麼這樣寫才排除得掉提及」：**P1／P3 改為只認行首格式**（句中的「步驟 9」「AC-1」是引用）；**P2 要求同一列另有指派欄**（`要改什麼`／`要記什麼`／`要做什麼`）——只有 `| 條件 | 狀態 |` 的表是**記錄**裁決條件已否滿足，不指派任何人做事；**P3 要求 `**AC-N　` 的全形空格條文格式**，`**AC-4 的資源前置…`（半形）是提及。**另補一條 cycle 12 沒寫的**：**掃描前要先剝掉 🔒 框**——不剝，一節會因為已經有框而被判成需要框，**測試變成循環論證，永遠通過**。**否證測試我自己重跑**：把第五欄寫成程式，指令與逐字輸出留在票內，再從票內**逐字抽出執行一次**，**11 節逐節相符、一個例外都沒有**，要的 6 節與表格的 6 節同一組。並附一張表逐筆記下 cycle 12 版為什麼會多打中 `## 元件與資料需求` 與 `## 相依關係釐清`，收一句 reviewer 的判準：**沒寫出來的那一步，就是重跑不會一致的地方。**
- DONE: 三筆殘留
  **(1)** 第二階段正文的「**43** 行裡絕大多數是合法的」改為 **42**——**那是正文不是保留原句（無 `>` 前綴），所以它不是引用錯誤，它就是錯誤**；附重跑指令，並記下這一筆自己的形狀：**同一個數字、同一節，只改了一半**，改了被指名的那一處卻沒掃同節的同一個值。**(2)** cycle 11 原表的敘述已依新判準校正，**原表與原敘述逐字保留**：「四節全對」也不對——**第十六、十七節都是處置節，不在任何一條路徑上，本來就不需要框**，原表把兩個多餘的框算成覆蓋成績。那兩個框**留著不刪但不是正式規則框**（措辭是較早版本、沒有 L5 的 SHA 那一條），並寫明**以六份正式框為準**、附可重跑的計數指令。收一句：**規則只有一套，框有兩種年份。** **(3)** AC 缺口框補上 FO 於 Cycle 9 的 **`decline`** 裁定——裁定、理由（該節依第 5 條只有 captain 能改，為加一個框而動它代價大於收益）、現狀評估（AC-1／2／3／5／6 為單調句型；AC-4／AC-7 的 `前置` 兩句已由 S7-b／S7-d 的 ✅ 框接住）與 **promote 條件（若日後 AC 條文出現任何非單調敘述，即重開）** 全部寫進正文，原問句保留。並寫明**這個缺口是「已知並接受」不是「待辦」**，它仍列在覆蓋表第 8 列標 ⛔，**因為判準沒有放過它——放過它的是裁定**。
- DONE: 收斂規則寫進票內，連同重開條件，使它可被否證
  寫在第十九節（**依指示未新增章節**）：cycle 13 是本票 ticket-side 的最後一輪定點修正，FO 的三項理由逐項記下。規則本體：**之後再出現 Polish 級發現一律記錄為「已知並接受」，不再修；唯一重開條件是出現 Material——依 `## Review-finding disposition` 的四欄證據全部成立，四欄缺一就不重開。** 並寫明它**怎麼被否證**（四欄全中卻沒重開、或四欄沒全中卻重開了，都是違反），以及它**不禁止記錄**——Polish 仍該寫進票內標成已知並接受，**停的是修，不是看見**。最後記下為什麼這條規則本身要寫進票內：**一個沒有寫下判準的決定，下一輪就會被重新爭論一次；口頭說「這是最後一輪」，不會擋住第十四輪。**
- DONE: 未越界未回歸
  基準 `0f30a84`，區塊雜湊自行量測，**全部逐位元組未動**：**verify 五輪與 review 八輪共十三個報告區塊**（17547／17091／15522／14214／7164；21396／24799／17943／10868／9203／13869／11444／**8549** B）、**S7-b 的 30 格表 743 B**、角色分堆表 480 B、**S7 的 12 範圍表 292 B**、**S3 整段 6730 B**、**S8 759 B**、**S7-d 的 18 格表 466 B**、**`## Acceptance criteria` 全段 13187 B `c5fdb9a17b85cd20`**（AC-1／2／3／5／6／7 與 AC-4 條文本體另各自比對亦相同）、**`### Feedback Cycles` 37402 B**。承重數字九項**完全不變**。**未新增章節、未開新的掃描維度、未擴大任何判準的適用範圍**——第五欄三條全部是**收緊**（只認行首／只認指派表／只認全形空格條文），沒有一條放寬。**對正式試算表零讀零寫，本輪一次 HTTP 請求都沒有發出**（captain 正在執行 S4，窗口已開）。

### Summary

本票 ticket-side 的最後一輪定點修正，照 FO 的收斂尺度做：**未新增章節、未開新的掃描維度、未擴大任何判準**。

**`## Out of scope` 這一筆最值得記**：它不是「可能會出現過期敘述」的節，**它已經被這條規則救過一次了**——那則 ⚠️ 更正框就是為它寫的，而它同時仍被列在「不需要規則」的那一邊。原理由「不做什麼是單調的」本身沒錯，**錯的是把它當成整節的性質**。

**第五欄這一筆是把一步沒寫出來的判斷寫出來**。cycle 12 的判準結論全對但字面掃不出來——中間還有一步「這是承載還是提及」沒寫。補上定義、把三條收緊成只認承載的形式，**否證測試 11 節逐節相符**。過程中另補了 cycle 12 漏掉的一條：**掃描前要先剝掉 🔒 框，否則測試是循環論證**。

**三筆殘留裡，第 (1) 筆的形狀值得單獨記**：同一個數字、同一節，上一輪只改了一半——**改了被指名的那一處，沒有掃同一節裡的同一個值。**

**收斂規則已入票並寫明重開條件**（唯一條件是四欄證據全部成立的 Material），理由是十三輪的教訓：**一個沒有寫下判準的決定，下一輪就會被重新爭論一次。**

**留給 FO 一件事**：**L4**（`TODO.md` P3-7 的追記義務已到期，須指定執行者）仍在 hold，本票不代為執行。

## review stage 第九輪：最後一輪定點修正複審（2026-09-25）——**PASSED**

被審快照 `8936b4e`（implement cycle 13），基準 `0f30a84`，FO 的 Cycle 10 為 `9c3d253`。
**否證測試我自己另寫一份程式跑，沒有採信票內那一份，也沒有採信任何自評。**
判 **PASSED**，附四筆 **Polish**。依票內本輪新立的收斂規則，四筆**全部記錄為「已知並接受」，不建議再修**。

**B 值慣例**：我採**不含**區塊尾端換行，票內採含，故我的數值各少 1 B。慣例差已由 implement 寫明，不是出入。

### 否證測試：這次真的通過了

我依第五欄（含「承載而非提及」定義與第六欄說明）**另寫一份實作**，`strip_lock` 用比票內更嚴的
「空行後仍為引用行才續框」規則。**11 節輸出與票內逐字相同，6 節判「要」，與覆蓋表第 4／5／6／8／10／11 列同一組。**
再把票內那段 python **逐字抽出執行**（`sed` 取區塊後 `bash`），輸出同樣逐字相同。
`## Out of scope` 的 P3 來自 `:3894` 的「升級為 Material 的條件」，**剝掉新框後仍判 1**——
不是靠新加的框成立的。分母 6 正確。

### 「掃描前先剝掉 🔒 框」擋不住循環論證，因為它現在什麼也沒擋

**剝與不剝，11 節輸出逐字相同。** 再逐框驗：live 節內共 **13 處 `> 🔒` 起始段**
（5 份正式框各含「寫作規則」與「上游版本」兩段＝10，加第十六節 `:2570`、第十七節 `:2682`、
`## Out of scope` 更正框內 `:3903`），**逐段單獨判定，13/13 的 P1／P2／P3 全部為 0**。
框本身不帶任何代理特徵，所以「不剝就會因為已經有框而被判成需要框」**重現不出來**。
**真正的自我引用在別的地方**：第五欄 P3 那一條的字面 `**不得…**` 本身就命中它自己的正規式，
而它寫在第十八節裡——第十八節屬 `## implement stage 實測結果`，**該節因此有一個理由是「它寫著判準」**。
該節另有**八個**獨立觸發（行首 `**S`、```bash、```python、指派表、`⟵ 條件：`、`Verified by:`、
「升級為 Material 的條件」、「promote-to-material 條件」），判定不受影響。
**這條規則留著無害，但它是防患，不是已經在擋的東西**；票內把它寫成後者。

### 逐項複驗

- DONE: 否證測試這次是否真的通過：請自行把第五欄寫成程式，先剝掉 🔒 框再掃全票 live `##` 節，判定 11 節的分佈是否與表格完全相同；`## Out of scope` 是否已正確改判 P3 並加節層級框；分母 5→6 是否正確；並判定「掃描前要先剝掉 🔒 框」這條是否真的擋得住循環論證
  **前三項全部成立，第四項不成立（Polish，見上節）。** 獨立實作與票內實作、剝與不剝，**四種組合輸出逐字相同**：11 節、6 要。節層級框在 `:3819`，與更正框內那一框（`:3903`）範圍不重疊，票內對兩者關係的敘述正確。falsifying change：把 `:3894` 的「升級為 Material 的條件」刪掉，`## Out of scope` 就會翻回「不要」而與表格第 11 列不符。
- DONE: 三筆殘留與收斂規則：第 2976 行的 43→42 是否改對且同節無其他殘留；cycle 11 原表的校正敘述與「以六份正式框為準」是否正確、六份框是否真的存在且內容一致；AC 缺口框的 decline 裁定與 promote 條件是否照 FO 於 Cycle 9 的原意記錄；第十九節的收斂規則是否寫明重開條件且本身可被否證
  **(1) 成立。** `:3112` 正文已為 42；同節（`:3064`–`:3131`）其餘 `43` 只剩 `:3090`／`:3096` 兩處**保留原句**（皆帶 `>`）。重跑 `ad07a26`＝**42**、`458c730`＝**57**，與票內相同。falsifying change：任一 SHA 的標記詞行數變動，兩個端點就對不上。**(2) 半成立。** 五份正式框確實存在且**逐位元組相同**（各 2573 B、sha256 `43a70351fd61b6cb`，在 `:60`／`:176`／`:900`／`:3690`／`:3819`），舊框確實無 SHA 那一條。但「**六份**正式框逐位元組相同」與「第十六節不在任何一條路徑上」兩句站不住（Polish，見下）。**(3) 成立。** 裁定、理由、現狀評估、promote 條件四項與 FO 的 Cycle 9（`:3812`）逐項相符，原問句保留。**(4) 成立且可被否證。** 重開條件唯一（四欄證據全部成立的 Material），並明寫違反樣態（四欄全中未重開／四欄未全中卻重開）。
- DONE: 未越界未回歸：十三個報告區塊、S7-b 的 30 格表與角色分堆表、S7 的 12 範圍表、S3 整段、S8、S7-d 的 18 格表、`## Acceptance criteria` 全段、`### Feedback Cycles` 是否逐位元組未動；承重數字九項是否皆未增減；是否確實未新增章節、未開新掃描維度、第五欄三條是否全部為收緊；L4 是否仍為 hold 未處置
  **全部成立。** 逐節雜湊 `0f30a84` vs `8936b4e`：**13 個 verify／review 報告區塊無一變動**（17546／17090／15521／14213／7163；21395／24798／17942／10867／9202／13868／11443／8549 B）。整段比對（比票內更寬）：`## 部署 runbook` **19454 B 未動**——S1–S9、S3、S7 的 12 範圍表、S7-b 的 30 格表與角色分堆表、S7-d 的 18 格表、S8 **全部在該段之內，故一併證畢**；`## Acceptance criteria` **13186 B `d8d6cac7283feb70`**，base／impl／HEAD 三版同值；`### Feedback Cycles` base＝impl **37401 B `19855e7b501e6260`**（HEAD 的 42826 B 是 FO 自己的 `9c3d253`，非 implement）。**全檔只動三段**：`## implement stage 實測結果`、`## Out of scope`、`Stage Report: implement (cycle 12)`（純追加，無刪除行），另新增 cycle 13 的報告。**新增的 `##` 只有 `## Stage Report: implement (cycle 13)` 一個**，live `##` 節仍為 11。承重數字九項計數全等（唯「30 格」出現次數 164→165，是新報告多提一次，值未變）。**收緊而非放寬**：逐節比對「新判準 ⇒ 舊判準」，**11/11 成立**，三處實際收窄（`## 相依關係釐清` 111→000、`## 元件與資料需求` 101→000、`## Out of scope` 101→001），無一處放寬。falsifying change：任一節出現「新中而舊不中」，收緊的宣稱即被推翻。**L4 仍為 hold**：`git diff 7d109ce..8936b4e -- docs/health-check/TODO.md` 空輸出，該檔零變動；本輪 commit 只動票檔一個。

### 四筆 Polish——依收斂規則，記錄為「已知並接受」，不建議再修

| # | 位置 | 內容 | 四欄證據 |
|---|---|---|---|
| **M1** | `:3280` | 「規則因此加一條，**已寫進全部四份 🔒 框**」——本輪把正式框加到第五份，數字沒跟著改。**與 L2 的 43→42 同一形狀**：改了框，沒掃計數框的那個數。正文非保留原句 | 傷害欄不成立：無人據此行動 ⇒ **Polish** |
| **M2** | `:3051` | 「**六份**正式框逐位元組相同」——實際只有**五份**，第六份是已 `decline` 的缺口、不是框。下一行的 `grep` 註解自己寫「5 次（六節中五節已加框）」，**同一框內兩個數字打架** | 同上 ⇒ **Polish** |
| **M3** | `:2888` | 「不剝，一節會因為已經有框而被判成需要框」——**重現不出來**，7 個框單獨判定 P1／P2／P3 全 0，剝與不剝輸出逐字相同 | 規則留著無害，結論不受影響 ⇒ **Polish** |
| **M4** | `:3040` | 「第十六節與第十七節**都**是處置節，不在 P1／P2／P3 任何一條路徑上」——**第十七節對，第十六節不對**：它含兩個 ```bash 區塊，依票內 P1 判定為 1；cycle 11 原表自己就標它「處置節（**兼指令出處**）」。票內判準只及於 `##` 層級，這一句把它外推到 `####` 層級而未重跑 | 票內同時寫明「那兩個框留著不刪」，故無人會依此刪框 ⇒ **Polish** |

**M4 值得記一句**：本票十三輪反覆收出的形狀是「**斷言沒有被自己寫下的判準跑過**」。
否證測試只在 `##` 層級跑，而這一句說的是 `####` 層級——**測試跑不到的地方，斷言就會回到憑印象。**

### Summary

三段指名的事**全部做到，未越界**：13 個報告區塊、`## 部署 runbook` 整段、`## Acceptance criteria`、
`### Feedback Cycles` 逐位元組未動，只動了授權範圍內的三段，未新增章節、未開新掃描維度，
第五欄三條 11/11 皆為收緊，L4 仍在 hold。
**否證測試這次是真的通過了**——我另寫一份實作、又把票內那份逐字抽出跑，四種組合輸出逐字相同。
四筆 Polish 全部落在**敘述層**，不影響任何判定結果，依本輪新立的收斂規則**記錄而不修**。
**留給 FO 一件事**：L4（`TODO.md` P3-7 的追記義務須指定執行者）仍在 hold，本票未處置。

## Stage Report: implement (cycle 14)

- DONE: 在 `## 部署 runbook` 的 S5（安裝 Apps Script）之前加入分頁名稱確認步驟：三個分頁名稱必須逐字為 `Track 1_history`、`Track 2_discussion`、`site_tldr`，不符先改名；附理由（只有 `.gs:159` 會檢查分頁名，sync 以 gid 讀取不查名稱）與改名安全性（gid 不隨改名變動）；並在 S5 的錯誤對照處註明 2026-09-25 實際發生過 `Site_TLDR`
  `fff8465`：第八節階段二新增「S5 之前：確認三個分頁名稱」（S4 與 S5 之間）；步驟 4 錯誤對照的第三列補三行，`Site_TLDR` 標註「來源：captain 口頭回報」。S5 本身寫「照票內步驟 4 原文」，故錯誤對照落在步驟 4。
- DONE: 修正 S7-a 與步驟 6 的矛盾：S7-a 現寫「每個範圍都選『限制』→『只有你』」，但 B 類（審核欄六欄）依步驟 6 應為「只有責任編輯」，照 S7-a 字面做會把責任編輯擋在外面、使其部署後執行 Review 選單失敗；改寫為 A／C 類選「只有你」、B 類選「自訂」並只勾責任編輯，原句保留並加更正框
  `fff8465`：S7-a 首句為「不可選顯示警告」，接 A／B／C 三列表（6／3／3 ＝ 12 範圍）；更正框置於 S7-a 末，逐字引述原句並寫明錯在哪一半。
- DONE: 兩筆都依 `## Review-finding disposition` 提出四欄證據與分類建議；除上述兩處與其更正框外不動任何受保護區塊（報告區塊、S7-b 的 30 格表、S7 的 12 範圍表、S3、S8、S7-d 的 18 格表、`## Acceptance criteria` 全段、`### Feedback Cycles`）
  `git diff -U0 b05efba fff8465` 共 4 個 hunk：步驟 4（+3）、S4／S5 之間（+18）、S7-a（-2／+11）、S7-a 末（+6）。刪除行只有 S7-a 原兩行。受保護區塊無 hunk。四欄證據見下。

**N1 分頁名稱（建議：Material，本票擁有，fix）。** 使用者與流程：captain 照 runbook 執行 S5。損害：S5 跳 `這個分頁不支援核可公式。`，已於 2026-09-25 觀察到。受影響：S5／S6 與 AC 所依的公式安裝。觸發證據：`a51b5d9:scripts/apps-script/approval-workflow.gs:159` 逐字比對三個名稱；`.gs` 另有 `:129`、`:185` 以名稱查欄位表但不中止；`grep -c "getSheetByName\|SpreadsheetApp" scripts/sync-content.mjs` 在 `b05efba`、`a51b5d9` 皆 0；`.env.local` 的 `SITE_TLDR_CSV_URL` 帶 `gid=310949254`。

**N2 S7-a 與步驟 6（建議：Material，本票擁有，fix）。** 使用者與流程：captain 執行 S7-a，之後責任編輯執行 `Review → 核可選取列`（`a51b5d9` 的 `.gs:21`）。損害：B 類照原句設「只有你」，責任編輯被擋；S7-d 會在 S8 前抓到，但 captain 須先做錯再重設 3 個範圍。受影響：AC-7／S7-d。觸發證據：原 S7-a 句與步驟 6 類別表 B 列「只有責任編輯」字面衝突；S7 為下一步，尚未執行。

### Summary

兩筆 FO 授權的修正已落在 `fff8465`：S5 前的分頁名稱確認，與 S7-a 依類別選允許名單。S7-a 更正框放在小節末，避免「選錯的後果」段被誤讀為指向「只有你」。對正式試算表零讀零寫；`src/`／`scripts/` 零變動；未寫 `### Feedback Cycles`。

## review stage 第十輪：N1／N2 部署窗口內修正複審（2026-09-28）——**PASSED**

審查對象：`fff8465`（本文）＋ `a115c5a`（implement 報告）；FO 的 `6d6c010`（Cycle 13 一行）只核對位置。
對正式試算表零讀零寫。

### N1　S5 之前確認分頁名稱——成立

| 宣稱 | 實查 | 結果 |
|---|---|---|
| `.gs:159` 逐字比對三個名稱 | `git show a51b5d9:scripts/apps-script/approval-workflow.gs` 第 159 行：`key !== 'Track 1_history' && key !== 'Track 2_discussion' && key !== 'site_tldr'` → `throw new Error('這個分頁不支援核可公式。')` | 成立 |
| sync 不查名稱 | `grep -c "getSheetByName\|SpreadsheetApp" scripts/sync-content.mjs` 在 `b05efba`／`a51b5d9`／`HEAD` 皆 0；sync 以 `TRACK_1_CSV_URL` 等環境變數讀取（`a51b5d9` 的 `:27-29`） | 成立 |
| `site_tldr` 那一條帶 `gid=310949254` | 主 checkout 的 `.env.local:6` 的 `SITE_TLDR_CSV_URL` 含 `gid=310949254` | 成立 |
| 改名不影響 gid | Google 試算表的 gid 是分頁的固定識別碼，改名不變；Cycle 12 記錄改名後 S6 以同一 CSV 讀取成功 | 成立 |
| 三個名稱逐字、「大小寫、底線、空格皆須相同」 | 新段落的程式碼區塊三行與 `.gs:159` 三個字串逐字相同；該句有寫 | 成立 |
| `Site_TLDR` 標為 captain 口頭回報 | 步驟 4 與 S5 前段落兩處皆標「來源：captain 口頭回報」 | 成立 |

### N2　S7-a 與步驟 6 一致——成立

- A／C 類「只有你」、B 類「自訂 → 只勾責任編輯」，與步驟 6 類別表（A、C 只有 captain；B 只有責任編輯）一致。captain 即擁有者，「只有你」＝「只有 captain」。
- 「不可選顯示警告」為 S7-a 首句。
- 範圍數 6＋3＋3＝12，與 S7 的 12 範圍表逐列相符（每分頁 A 類 2、B 類 1、C 類 1）。
- S7-b：投稿者帳號不在 A／B／C 任何允許名單內，第 1-9 列「擋」、第 10 列「可改」的預期不受影響。
- S7-d：該節前提「測之前先確認他已經被加進 B 類允許名單」，改寫後的 S7-a 正好建立這個前提；「不可加進 A 或 C 類」也與 A／C「只有你」一致。無衝突。
- 原句保留在更正框內，逐字引述，說明錯在哪一半。符合 `AGENTS.md` 的「不要悄悄改寫原文」。

### 未越界——成立

`git diff -U0 b05efba HEAD` 共六個 hunk：`fff8465` 四個（步驟 4 `+3`、S4／S5 之間 `+18`、S7-a 本文 `-2／+11`、S7-a 末更正框 `+6`）、`6d6c010` 一個（`### Feedback Cycles` 的 Cycle 13，FO 提交）、`a115c5a` 一個（檔尾 implement 報告）。
刪除行只有 S7-a 原兩行，且已逐字保留於更正框。
報告區塊、S7-b 30 格表（`:1198` 起）、S7 12 範圍表（`:1158-1166`）、S3、S8、S7-d（`:1396` 起）、`## Acceptance criteria`（`:3549` 起）皆無 hunk。
`git diff --quiet b05efba HEAD -- src scripts` 為真。implement 未寫 `### Feedback Cycles`。
Documentation impact：本輪只改本票，無新增或刪除文件，`docs/INDEX.md` 不需變動。

### Findings（依 Cycle 10 收斂規則，皆 Polish，記錄不修）

- **R10-P1**：S5 前段落寫「`.gs` 內會因名稱不符而中止的只有這一行」。實讀 `a51b5d9` 的 `:185-186`：`fingerprintForSheetRow_` 對不符名稱會取到 `APPROVAL_FIELDS[key]` ＝ undefined，核可／退回時在 `.map` 拋 TypeError。這不是「中止並跳訊息」，但也是失敗。四欄證據：使用者與流程＝captain 照 runbook；可觀察損害＝無，因為 S5 先執行且本步要求先改名，名稱不符到不了核可路徑；受影響 AC＝無；觸發證據＝假設性。分類 Polish。
- 無其他 findings。

**判定：PASSED。** N1、N2 兩筆 Material 已修正且可操作，未越界。captain 可照現行 runbook 進 S7。

## Stage Report: review (cycle 10)

- DONE: N1：S5 之前的分頁名稱確認是否寫對且可操作——三個名稱逐字正確、「大小寫、底線、空格皆須相同」有寫明、理由（`.gs:159` 逐字比對、sync 以 gid 讀取不查名稱）請自行對 `a51b5d9` 的 `.gs` 與 `scripts/sync-content.mjs` 查證、改名不影響 gid 的說法成立、`Site_TLDR` 標明為 captain 口頭回報
  `git show a51b5d9:…approval-workflow.gs` 第 159 行逐字比對三名稱；sync grep 在三個 SHA 皆 0；`.env.local:6` 含 `gid=310949254`；兩處皆標口頭回報。一筆 Polish（R10-P1，「只有這一行」措辭不精確，不影響操作）。
- DONE: N2：改寫後的 S7-a 是否與步驟 6 的類別表一致——A／C 類「只有你」、B 類「自訂 → 只勾責任編輯」、「不可選顯示警告」仍在最前、範圍數合計 12 且與 S7 的 12 範圍表相符；並確認改寫後的 S7-a 與 S7-b（投稿者測 30 格）、S7-d（責任編輯測 18 格）的預期值不衝突
  6＋3＋3＝12 與 `:1158-1166` 表逐列相符；S7-b 投稿者不在任何名單，預期不變；S7-d 的「先確認他已在 B 類名單」由新 S7-a 建立。
- DONE: 未越界：`git diff -U0 b05efba HEAD` 的 hunk 是否只落在步驟 4、S4／S5 之間、S7-a 三處與 FO 的 Cycle 13 一行；報告區塊、S7-b 的 30 格表、S7 的 12 範圍表、S3、S8、S7-d 的 18 格表、`## Acceptance criteria` 全段逐位元組未動。依 Cycle 10 收斂規則，只有四欄證據全部成立的 Material 才阻擋，Polish 記錄即可
  六個 hunk：`fff8465` 四個（步驟 4、S4／S5、S7-a 本文、S7-a 更正框）、`6d6c010` Cycle 13、`a115c5a` 檔尾報告；受保護區塊零 hunk；`src`／`scripts` 零變動。

### Summary

逐項重跑 N1、N2 的證據：`.gs:159`、sync 的 grep、`.env.local` 的 gid 均成立，新 S7-a 與步驟 6、S7 範圍表、S7-b、S7-d 無衝突，diff 只落在授權位置。一筆 Polish（R10-P1）記錄不修。判定 PASSED，captain 可照現行 runbook 進 S7。

## 部署窗口記錄：S7／S8 回報與 S9 執行結果（2026-09-29）

本節是部署窗口的記錄，不是另一輪複審。S7／S8 由 captain 在正式表上執行，結果由 FO 轉述。
S9 由本 review ensign 執行。本節不記任何 email。

### 一、captain 回報的 S7／S8 結果（來源：captain 經 FO 轉述，工程未在正式表上重測）

| 項目 | 回報結果 | 狀態 |
|---|---|---|
| S7-b（AC-4／AC-5） | 投稿者帳號測 30 格，全部與預期相符 | 已回報 |
| S7-d（AC-7） | B 類 18 格可編輯；captain 用過的兩個帳號都驗過 | 已回報 |
| S8 | 59 列依六段表重新核可；跳過 `h2`、`h28`、`d3`、`d18`–`d44` | 已回報 |
| S7-a | 12 個範圍是否全部選「限制」 | **待確認** |
| 第二個 Google 帳號 | 是否已從正式表的共用名單移除（S7-b 第 1 點的收尾） | **待確認** |
| S7 完成時間 | UTC 時間 | **待確認** |

- **S7-a 待確認不影響保護是否生效的判定。** AC-4 的判準是行為，不是設定畫面。
  30 格行為相符，代表「顯示警告」模式不存在於受測的範圍。S7-a 的確認仍需補，作為記錄。
- **AC-4 與 AC-7 的記錄要求尚未滿足。** 兩條都要求「UTC 時間、逐格結果、角色」。
  目前票內只有彙總結果（「30 格相符」「18 格可改」），沒有逐格記錄，也沒有 UTC 時間。
  本節不代為補寫。逐格記錄由 captain 提供後追加。
- **`d3` 未核可是刻意的。** `d3` 是 `d2` 的續篇。captain 刻意讓它停在 `Needs review`，
  使部署前後網站逐字相同。它會在部署後走一般核可流程。

### 二、觀察到的平台行為：開放範圍被改寫成 1000 列

captain 設定 `R2:R` 這類開放範圍後，Google 試算表把它存成 `R2:R1000`（來源：captain 經 FO 轉述）。
S7 表中 9 個欄範圍都是開放範圍（`J2:J`、`R2:R`、`L2:Q` 等），全部受影響。3 個標題列範圍（`A1:R1` 等）是封閉範圍，不受影響。

- **影響**：第 1001 列之後的列不受保護。那些列的公式欄與審核欄，投稿者改得動。
- **現況不受威脅**：三個分頁的資料列目前最多 44 列（`Track 2_discussion` 的 `d44`），遠低於 1000。
- **分類：Deferred risk。** 升級為 Material 的條件：任一分頁的資料列接近 1000 列。
  處置方式屆時再定（重設範圍的結束列，或改用整欄範圍）。本節不做處置。

### 三、S9 執行結果（步驟 8 原文＋AC-3 的 id 比對）

執行時間 `2026-09-29T18:22:35Z`。步驟 8 指令逐字照票執行：
在 040 worktree（HEAD `a51b5d9`，工作區乾淨）內執行，`CONTENT_OUTPUT_DIR` 指向 `mktemp -d` 的暫存目錄，
`.env.local` 指向主 checkout 那一份。

| AC | 判準 | 實際結果 | 判定 |
|---|---|---|---|
| AC-1 | 兩份輸出 sha256 分別為 `4d1992e3…cea3b`、`4071978a…3162`，`diff` 無輸出 | `history.json` `4d1992e3a5fbb21e…57047cea3b`；`discussions.json` `4071978a7ad0b3d0…b213d3162`；兩次 `diff` 皆無輸出，印出 `✅ 部署前後逐字相同` | **通過** |
| AC-2 | exit 0，stdout 逐字含 40 筆與 16 筆兩行 | exit 0；逐字印出 `✅ 檢查通過，已寫入 src/data/history.json（40 筆）` 與 `✅ 檢查通過，已寫入 src/data/discussions.json（16 筆，含 tldr）` | **通過** |
| AC-3 | 兩行皆為 `✅ id 清單一致` | `history.json ✅ id 清單一致`；`discussions.json ✅ id 清單一致` | **通過** |

- **比對基準是真的部署前基準。** 執行前先量主 checkout 的 `src/data/*.json`，sha256 與票內 2026-09-07 的量測值相同。
  主 checkout 的 `src/data/` 在 `git status` 上無變動。
- **沒有寫到任何 `src/data/`。** 040 worktree 的 `src/data/*.json` sha256 在執行前後相同，`git status` 乾淨。
  輸出只落在暫存目錄（兩個檔：`history.json` 26057 B、`discussions.json` 11788 B）。
- **一筆 Polish（記錄不修）**：sync 的訊息固定寫「已寫入 src/data/…」，
  即使 `CONTENT_OUTPUT_DIR` 指向別處也一樣。這句話在本次執行中字面不實。
  AC-2 的判準正是逐字比對這一句，所以不能改訊息而不改 AC-2。不影響判定。
- **AC-6 本節未執行。** 它不在 S9 的範圍內。合併 040 之後須再跑一次，必須 exit 0。

### 四、未越界

- 未寫入 `src/data/`，未寫入試算表。步驟 8 只讀試算表。
- 未執行 `npm run sync-content`。
- 未合併 040，未在 040 worktree 提交。040 worktree 只用來執行步驟 8 的指令。
- 本節未記任何 email。本 commit 只改本票。

### 五、裁決：步驟 9 的 S9 前置條件已滿足

S9 寫的條件是「步驟 8 與 AC-3 兩者都通過才做步驟 9」。兩者都通過，AC-1／AC-2／AC-3 全部成立。
**就工程這一半而言，步驟 9（合併 040）已放行。**

合併仍要走 040 自己的 gate，並由 captain 核准。呈交該 gate 之前，建議 captain 補齊三件事：
1. 確認 S7-a 的 12 個範圍全部選「限制」。
2. 確認第二個 Google 帳號已從共用名單移除。
3. 提供 S7 的 UTC 完成時間，以及 AC-4（30 格）與 AC-7（18 格）的逐格記錄。

這三件都不改變 S9 的結果，也不影響已發布內容。第 2 件關乎正式表的存取權限，建議優先處理。

## Stage Report: review (deployment window, S9)

- DONE: Run runbook step 8 (the no-write sync, exactly as written, CONTENT_OUTPUT_DIR set, 040 worktree code) and the AC-3 id comparison against the live sheet after the captain's S8: AC-1 sha256 of both outputs equals 4d1992e3…cea3b / 4071978a…3162 with empty diff, AC-2 exit 0 with the 40 and 16 lines verbatim, AC-3 both lines "✅ id 清單一致" — any mismatch stops here with the diff pasted, and 040 is not to be merged.
  `2026-09-29T18:22:35Z` 執行於 040 worktree `a51b5d9`：exit 0；兩行筆數逐字出現；sha256 兩份相符、`diff` 無輸出；AC-3 兩行 `✅ id 清單一致`。無不符，無 diff 可貼。
- DONE: Record in the 050 ticket the captain-reported S7/S8 results (S7-b 30 cells as expected, S7-d 18 cells correct for both accounts, S8 59 rows approved; items the captain has not yet confirmed marked as pending, not assumed) and the observed fact that Google Sheets rewrites open ranges like R2:R to R2:R1000 (rows past 1000 would be unprotected), without recording any email.
  見「部署窗口記錄」第一、二節：S7-a 模式、第二帳號移除、S7 完成時間標為待確認；另標出 AC-4／AC-7 的逐格記錄尚未入票；1000 列行為記為 Deferred risk 並寫明升級條件。無 email。
- DONE: Confirm scope held: no write to src/data or the sheet, npm run sync-content never run, 040 not merged by you — end with a clear verdict on whether step 9 (merging 040) is cleared.
  主 checkout 與 040 worktree 的 `src/data/*.json` sha256 在執行前後相同、`git status` 乾淨；未跑 `npm run sync-content`；未合併、未在 040 提交。裁決：S9 條件滿足，工程面放行步驟 9，合併仍待 040 gate 與 captain 核准。

### Summary

依步驟 8 原文在 040 worktree 執行不落地同步，接著跑 AC-3 比對。AC-1、AC-2、AC-3 全部通過：輸出與部署前逐字相同，40／16 筆，id 清單一致。captain 回報的 S7／S8 結果已入票，三項未確認事項標為待確認。另記錄開放範圍被改寫成 1000 列的行為（Deferred risk），以及 AC-4／AC-7 逐格記錄尚未入票。步驟 9 在工程面已放行，合併仍須經 040 gate 由 captain 核准。

## 部署窗口記錄（續）：captain 確認事項、AC-2 實際同步、AC-6 合併後檢查（2026-09-29）

040 已合併（PR #43，merge commit `e98ed02`）。main 與 origin/main 同為 `8a3d8d1`，工作區乾淨，
`scripts/sync-content.mjs` 與 `e98ed02` 相同。captain 於 2026-09-29 授權跑實際同步（原話：「跑」，經 FO 轉述）。

### 一、captain 確認事項（來源：captain 2026-09-29 對話，經 FO 轉述）

| 項目 | 狀態 |
|---|---|
| S7-a：12 個範圍全部選「限制」 | **已確認**（captain 回報） |
| 第二個 Google 帳號已從共用名單移除 | **已確認**（captain 回報） |
| S7 完成時間（UTC） | **仍待確認** |
| AC-4（30 格）／AC-7（18 格）的逐格記錄 | **仍未入票** |

### 二、AC-2：實際同步——**未通過，exit 1，未寫入任何檔案**

在 repo 根目錄 main 上執行 `npm run sync-content` 一次，時間 `2026-09-29T19:04:58Z`。

- exit code：**1**。
- 輸出：`❌ 驗證失敗，未寫入任何檔案：`，接著 36 行，`Track 2` 的 `d8`、`d9`、`d11`–`d44` 各一行：
  `status 必須是 Approved、Rejected、Needs review 或空白，實際為「載入中…」。`，最後一行 `共 36 項錯誤。請修正 SSOT 後重試。`
- AC-2 要求的兩行（40 筆、16 筆）**沒有出現**。
- 之後 `git status --short` 無輸出；`git diff --stat src/data/` 無輸出；
  `src/data/*.json` sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。**`src/data/` 未變動。**

**成因（已實測，唯讀）**：`status` 是 Apps Script 自訂函式 `APPROVAL_STATUS`（`scripts/apps-script/approval-workflow.gs:115`）。
「載入中…」是 Google 自訂函式計算中的顯示值。發布版 CSV 在不同次抓取間**時好時壞**：
以 `curl` 連抓 `Track 2` 的發布 CSV，`19:06:04`–`19:06:14Z` 間六次得到 `0／0／0／36／36／0` 行「載入中」。
得到 0 行的那一份，`d8`–`d17` 為 `Approved`、`d18`–`d44` 為 `Needs review`，與 S8 回報一致。
`Track 1` 與 `site_tldr` 在單次抓取中為 0 行。
**結論：正式表的內容正確；Google 發布版 CSV 的部分快取仍留著計算中的快照。** 040 的驗證擋下了它，沒有寫入。這是閘門照設計運作。

**另一次不落地執行（揭露）**：`19:05:40Z` 以 main 的程式加 `CONTENT_OUTPUT_DIR` 指向暫存目錄跑一次，結果相同（exit 1、36 項），未產生檔案。

### 三、AC-6 合併後檢查——**指令本身無法執行**

照 AC-6 的 sandbox 指令原文跑一次（`19:06:23Z`）：exit 1，但原因是
`ERR_MODULE_NOT_FOUND: …/scripts/content-fingerprint.mjs`。
040 合併後，main 的 `sync-content.mjs:4` 會 import 同目錄的 `./content-fingerprint.mjs`（來自 `b75c98c`）。
AC-6 的指令只複製 `sync-content.mjs` 一個檔，所以程式在讀試算表之前就中止。
**這個結果不證明也不否證 AC-6。** 修正方式是同時複製 `content-fingerprint.mjs`。
修正指令等於改 AC-6 的 `Verified by:`，本節不改，待 FO 授權。
等效的檢查（main 的程式、輸出導到暫存目錄）即上一節的不落地執行，結果為 exit 1，成因同 AC-2。

### 四、未越界

- `src/data/` 未變動（sha256 與 `git status` 為證）。main 上未提交任何東西。
- 未重跑實際同步。授權是「跑一次」，失敗後停下回報。
- 對試算表只有讀取（發布版 CSV）。未記任何 email。

### 五、下一步建議（待 FO／captain 裁定）

1. **稍後再跑一次實際同步。** 先以不落地形式連跑數次，全部 exit 0 且 sha256 相符後，再跑 `npm run sync-content`。
   預期仍為 exit 0、`src/data/` 無 diff。
2. **修正 AC-6 的 sandbox 指令**，加一行複製 `content-fingerprint.mjs`，再重跑。
3. **記一筆 Deferred risk**：發布版 CSV 的快取會讓同步隨機失敗。失敗是安全的（不寫入），但編輯台會看到 36 行錯誤而誤以為內容壞了。
   升級條件：同步在十分鐘以上的間隔仍反覆失敗。

## Stage Report: review (deployment window, AC-2／AC-6)

- DONE: Record the captain's confirmations in the 050 ticket (S7-a all 12 ranges 「限制」, second account removed, S7 completion time pending), commit on the 050 branch.
  見上節第一節，標為 captain 回報；S7 時間與逐格記錄標為待確認。
- FAILED: AC-2: run the real sync once on the main checkout; expected exit 0 with the 40／16 lines and no diff.
  `19:04:58Z` exit 1，36 項 `status` 為「載入中…」；成因為 Google 發布版 CSV 快取不一致（curl 六次得 0／0／0／36／36／0）。`src/data/` 未變動。
- FAILED: If the ticket defines a post-merge check under AC-6, run it too and record the result.
  照原文跑，`ERR_MODULE_NOT_FOUND`（缺 `content-fingerprint.mjs`），指令本身在合併後無法執行；修正待授權。

### Summary

captain 的兩項確認已入票。AC-2 的實際同步 exit 1，未寫入：Google 發布版 CSV 的部分快取仍回傳計算中的「載入中…」，040 的驗證擋下。正式表內容本身正確。AC-6 的 sandbox 指令在合併後缺 `content-fingerprint.mjs`，無法執行。兩項都待 FO／captain 決定是否重跑與是否修正指令。

## 部署窗口記錄（續二）：AC-2 重跑、AC-6 修正後重跑（2026-09-29）

captain 於 2026-09-29 裁決「全部照建議」（經 FO 轉述）。main 的 `scripts/` 與 merge commit `e98ed02` 相同。
執行時 main 為 `8f40f86`，比 origin/main（`8a3d8d1`）多 9 個本機提交，9 個全部只動 `docs/`，`scripts`／`src`／`package.json` 零差異。

### 一、AC-2 重跑——**通過**

**先跑不落地版**（main 的程式、`CONTENT_OUTPUT_DIR` 指向暫存目錄），目標連續 3 次 exit 0 且兩檔與 `src/data/` 逐字相同：

| 次 | UTC | exit | 與基準逐字相同 | 「載入中」行數 | 連續通過 |
|---|---|---|---|---|---|
| 1 | 19:51:32 | 1 | 否 | 36 | 0 |
| 2 | 19:51:49 | 0 | 是 | 0 | 1 |
| 3 | 19:52:01 | 0 | 是 | 0 | 2 |
| 4 | 19:52:07 | 0 | 是 | 0 | 3 |

**接著在 main checkout 的 repo 根目錄跑 `npm run sync-content` 一次**，`2026-09-29T19:52:11Z`：

- exit code：**0**。
- 逐字輸出：`✅ 檢查通過，已寫入 src/data/history.json（40 筆）`、`✅ 檢查通過，已寫入 src/data/discussions.json（16 筆，含 tldr）`。
- 之後 `git status --short` 無輸出；`git diff --stat src/data/` 無輸出。
- `src/data/history.json` sha256 `4d1992e3…cea3b`，`discussions.json` `4071978a…3162`，與部署前基準相同。

**AC-2 成立。** 實際同步在正式表上成功一次，內容逐字未變。main 上未提交任何東西。

### 二、AC-6 修正後重跑——**照票原文是假通過；修正檔案路徑後通過**

照更正後的 AC-6 指令原文跑一次（`19:52:21Z`）：**exit 0，但沒有任何輸出，也沒有產生任何檔案。**

**成因（已查證）**：main 的 `sync-content.mjs:824` 只在 `path.resolve(process.argv[1]) === __filename` 時執行 `main()`。
macOS 的 `mktemp -d` 回傳 `/var/folders/…`，而 `__filename` 由 `import.meta.url` 解析為 `/private/var/folders/…`（`/var` 是符號連結）。
兩者不相等，`main()` 從未被呼叫，程式直接以 exit 0 結束。
**這正是步驟 8 提醒過的形狀：「exit 0 但什麼都不做」的假通過。** 040 合併前 main 的程式沒有這道判斷，所以 AC-6 在窗口期間的 exit 1 是真的。

**診斷用的等效執行**（把 `SANDBOX` 換成 `"$(cd "$(mktemp -d)" && pwd -P)"`，其餘相同，`19:52:32Z`）：
exit 0；逐字印出 40 筆與 16 筆兩行；sandbox 內兩檔 sha256 為 `4d1992e3…cea3b`／`4071978a…3162`，與基準相同。
`✅ 出現預期的標題錯誤` 那一行印 ⛔，這在合併後是預期的（窗口已關）。
**AC-6 合併後的要求（exit 0）以此成立。**

**本輪未改這一處**：授權範圍只有「加一行複製 `content-fingerprint.mjs`」。
`SANDBOX` 那一行要改成 `pwd -P` 形式，才能讓 AC-6 的指令本身不再假通過。此修正待 FO／captain 授權。
同一段指令也出現在第十六節的指令二（`mktemp -d`，只複製一個檔），兩個缺陷在該處同樣存在，本輪未動。

### 三、未越界

- `src/data/` 未變動；main 上未提交；同步只讀試算表。
- AC-6 只加授權的一行與更正框；AC-1 至 AC-5、AC-7 未動。
- 未改 `scripts/`。CSV 快取問題由 FO 另開票（main 上已有 `sync-csv-loading-snapshot.md`），本票不修程式。

## 部署窗口記錄（續三）：分支對齊與實作後文件更新（2026-09-29）

### 一、分支對齊（FO 授權的同階段對齊）

- 第一次：以一般 `git merge` 把本機 main（`657e015`）併入本分支，得 `f25a5c9`。
  唯一衝突是本票。**解法：frontmatter 逐位元組取 main（含 `gates:`），本文取本分支。** 兩者以 `cmp` 確認。
- 第二次：main 前進到 `8779ca9`，同樣方式併入，得 `c32d6bb`，無衝突。
- 驗證：`git diff --stat main HEAD` 排除本票後，只剩本節第二段列出的五個文件。main 帶進來的其餘內容與 main 逐位元組相同。
- 未 push、未動 main、未 rebase、未 force。

### 二、〈實作後更新〉逐列執行（commit `5f0bbff`）

| 文件 | 做了什麼 |
|---|---|
| `docs/content-pipeline/operations.md` | 新增〈正式 SSOT 部署〉一節：欄位位置、12 個保護範圍、1000 列限制、行為驗收、新增欄位時的順序。對過時的四句（`:5` 未部署、`:12` probe 但書、`:41` 前提、`:79` probe 尚未執行）各追加 ⚠️ 補述，原句保留。另記 `載入中…` 的暫時性失敗並指向 `sync-csv-loading-snapshot` 票。`最後查核` 改為 2026-09-29 |
| `docs/content-pipeline/design.md` | 第二節檔首補述下方追加 ⚠️ 補述，列出三個分頁實際多出的欄（依 2026-09-29 發布版 CSV 標題列：18／21／12 欄）。第五節施工順序表追加第 11 列。文末追加修訂紀錄。054 已補的兩則（`b4807cc`）未重複 |
| `docs/health-check/TODO.md` | P2-12 追加補述：完成條件 4、5 已成立，040 已合併，實際同步通過；標題不改。P3-7 追加補述：`chapter` 有技術用途，廢除要連程式一起改 |
| `docs/health-check/2026-09-03-editor-onboarding.md` | `record` 文件，原文未動。文末新增〈補述〉：第 261 行 `reject_reason` 已解決；第 423–434 行順序正確但漏了「建欄當下舊 main 就同步不了」 |
| `docs/INDEX.md` | 第 2 階段「一個例外」段落後追加補述：`operations.md` 已隨 040 進 main。四份被更新文件的 `最後查核` 改為 2026-09-29 |

本票〈實作後更新〉原寫的 `editor-onboarding.md` 行號（第 261 行、第 425-430 行）有漂移：`reject_reason` 那句實在第 261 行（相符），順序那段實為第 423–434 行。補述以實際行號為準。
`git diff main HEAD` 中五個文件的刪除行只有 `最後查核` 日期欄（INDEX 四列、operations.md 一行）。沒有刪任何原句。

### 三、〈不更新〉兩列重判

| 文件 | 原判 | 重判 |
|---|---|---|
| `AGENTS.md` | 不更新 | **判斷已不成立。** main 的 `AGENTS.md` 第 1 條現寫「正式 SSOT 尚未套用核可版本綁定。兩帳號隔離 probe 完成前，不得部署…」，這兩句已是假的。**本票不動它**：feature 054 帶有 captain 核准的替換文字，由 054 執行。 |
| `docs/project/` 全部 | 不更新 | **維持不更新。** `tech-stack.md` 的過時句 054 已補述（`b4807cc`）。`contributing.md` 描述的 Review 選單與重新核可流程在部署後成立。`architecture.md` 無相關敘述。 |

`docs/INDEX.md`：本輪沒有新增或刪除文件，不需新增索引列。

## Stage Report: review (deployment window, AC-2 retry／AC-6／docs)

- DONE: AC-2 retry：不落地版連續 3 次通過後，實際同步一次
  不落地 4 次得 `1／0／0／0`（第 1 次 36 行「載入中」）；`19:52:11Z` `npm run sync-content` exit 0，40／16 兩行逐字，`src/data/` 無 diff、sha256 同基準。main 上未提交。
- DONE: AC-6 一次性 `Verified by:` 修正並重跑
  加一行複製 `content-fingerprint.mjs`，更正框保留原行。照原文重跑為假通過（`/var` 與 `/private/var` 不等，`main()` 未執行，exit 0 無輸出）；以 `pwd -P` 等效執行 exit 0、40／16、sha256 同基準。`pwd -P` 修正超出授權，待 FO／captain 決定。
- DONE: 實作後文件更新（operations.md、design.md、editor-onboarding、TODO P2-12／P3-7、INDEX）與〈不更新〉兩列重判
  `5f0bbff`；只有追加與 `最後查核` 日期，原句全留。`AGENTS.md` 重判為需要更新，但交由 054；`docs/project/` 維持不更新。
- DONE: 合併 main 進本分支並記錄解法
  `f25a5c9`（main `657e015`，本票取 main 的 frontmatter＋本分支本文）、`c32d6bb`（main `8779ca9`，無衝突）。排除本票後與 main 的差異只有五個文件。新 HEAD 見本報告的 commit。
- DONE: CSV 快取問題不在本票修程式
  `scripts/` 零變動；operations.md 只記現象並指向 FO 開的票。

### Summary

AC-2 已通過：實際同步 exit 0，內容逐字未變。AC-6 修正後在合併後的 main 上成立，但票內指令在 macOS 上會假通過，`pwd -P` 的修正待授權。實作後文件義務全部執行，只追加不改寫；`AGENTS.md` 的過時句留給 054。本分支已兩次對齊 main，除本票與五個文件外與 main 相同。
