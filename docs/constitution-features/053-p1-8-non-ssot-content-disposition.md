---
id: 053
title: 完成 P1-8 盤點：全站無 SSOT 來源內容的逐項處置
status: verify
source: captain 2026-09-04（把關機制體檢第三類；TODO.md P1-8 停滯項）
started: 2026-09-30T17:18:46Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-053-p1-8-non-ssot-content-disposition
issue:
pr:
mod-block:
review-round:
    id: round:053:verify:1
    stage: verify
    cycle: 1
    briefing:
        id: briefing:053:verify:round-1
        digest: sha256:27074e727cb976facf40de28cad98d8589e3f4d15dafb1ded9bbd2e9d6c7e737
        room-ref: '@review/verify/round-1'
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

## Design

### 一、給 captain 的結論

**建議：先拍板三件事，再照下面的處置表施工。**

- 處置表涵蓋 58 個檔。其中 2 個是 SSOT，不需處置。其餘 56 個都有處置與理由。
- 有 3 件事不能由工程師決定。它們是第四節的 G1、G2、G3。每件都附建議。
- 選了 G1-A、G2-A、G3-A，站上約 9 處內容要移除。爭議時序要搬進試算表。其餘標注來源並凍結。
- 可以立刻做的只有「移除」。「標注來源」要等 `051`，「凍結」要等 `047`。

**有一件事要先講。** 您的規則 5（`AGENTS.md` 第 5 條）只允許兩類內容：試算表核可內容，與 T3 經審閱內容。
站上的中文字，幾乎全部由 AI 寫成（證據見第二節第 3 點）。照字面執行規則 5，要刪掉大半個網站。
這就是 G1 與 G2 要您決定的事。

### 二、盤點依據與現況

**1. P1-8 的盤點表已經不完整。** `docs/health-check/TODO.md` 的 P1-8 列了 `src/data/` 八個檔與五個元件。
2026-09-30 重跑盤點，範圍變成：

- `src/data/` 有 14 個檔。P1-8 之後新增了 `ruling-threshold.ts`（`063`／`066`）、`threshold-analysis.ts`（`012`）、`verified-case-refs.mjs`（`064`）、`quizzes/` 四檔。
- `src/app` 與 `src/components` 有 44 個 `.tsx` 含連續 6 字以上的中文。

重跑指令（本票 AC-1 使用同一段）：

```bash
{ ls -1 src/data/*.* src/data/quizzes/*.ts
  for f in $(grep -rl '[一-鿿]' src/app src/components --include='*.tsx'); do
    [ "$(grep -coE '[一-鿿]{6,}' "$f")" -ge 1 ] && echo "$f"
  done; } | sort
```

**2. 大法官名單從未經人工確認。** `docs/meetup-chats/2026-05-01-agenda.md:14` 把「人工驗證 AI 生成的內容資料正確性（大法官名單、提名事件等）」列為會議目的。
repo 內沒有這場會議的紀錄。`docs/meetup-chats/Meeting notes.md` 不含「大法官」三字。
其餘文件也查無確認紀錄（`grep -rln '大法官名單\|人工驗證' docs`，命中者只是引用或他案）。
`future.ts:354` 仍寫 `Researched synthetic records`。`026` 把**案件**換成真實資料，**大法官名單**沒有換。本票不重工。

**3. 站上的中文字幾乎全部經 AI 寫成。** 以 `git log --follow` 查 44 個元件檔中段數 ≥ 5 的 38 個：
每一個檔的歷史都至少有一個 `Co-Authored-By: Claude` 的 commit。
`controversy-timeline.ts` 的首個 commit `7354c0b`、四份測驗的 `93dd150` 與 `7ad3e7c` 都帶此標記。
git 標記不完整（`docs/health-check/TODO.md` 的 P1-6 已證明有標與無標並存），所以這是下限，不是全貌。

**4. 爭議時序只經 agent 查核，沒有人審。** `docs/constitution-features/_archive/029-court-controversy-timeline-lazybag.md` 的 verify 第一輪退回：
一個事件是捏造的（evt-12 暫時處分），四個日期錯，大法官立場「appear to be AI-fabricated」。
第二輪由 agent 判 PASSED。之後 `067` 仍在同檔找到日期倒序（`docs/health-check/TODO.md` 的 P1-10 第 1 項）。
`consequence` 欄含政治評價，例如 `:87`「國會多數暴力」、`:135`「藍白陣營對憲法法庭本身的攻擊」。
`/controversy-timeline` 在 `src/data/launch-status.ts:3` 的 `PUBLIC_PAGES` 內。

**5. `/future` 仍顯示一個無來源的年數。** `src/components/future/BottleneckFunnel.tsx:35` 以 `avgDaysPerCase: 120` 算出年數，`:51` 顯示。
`066` 已刪掉 `/future/page.tsx` 那句無來源產能數字。這一處沒刪。
`docs/health-check/TODO.md` 產能那一節（第二個 P1-9）的檢查指令只查 `page.tsx`，抓不到這裡。

**6. T3 的範圍。** `docs/content-pipeline/data-collection-guide.md` T3 節把 `RULING_THRESHOLD` 與 `RulingThresholdNote.tsx` 寫進 T3 資料結構（2026-09-21 更正）。
本票據此認定：T3 = `/future` 頁、`src/components/future/*`、`src/data/future.ts`、`src/data/ruling-threshold.ts`。
這是讀既有文件得出的結論，不是新規則，所以不列為 gate。

### 三、分類規則

每一句中文先分成三種。處置跟著種類走。

| 種類 | 判準 | 處置原則 |
|---|---|---|
| 介面文字 | 不提任何案號、日期、數字、人名、機關、法律效果。例：導覽、按鈕、操作說明、「選擇與您相關的身分」 | 依 G1。建議不在規則 5 範圍內 |
| 事實陳述 | 提到上述任一項，且可對到一手來源。例：案號、判決日、條文、席次、表決結果 | T3 內：標注來源並凍結。T3 外：依 G2 |
| 編輯判斷 | 因果、評價、立場、身分標籤、對專案自身做法的宣稱 | T3 內：規則 5 第二類允許，標注來源、經審閱、不凍結。T3 外：只能搬進 SSOT 或移除，不論 G2 選哪個 |

**編輯判斷為什麼不能「標注來源並凍結」**：它對不到一手來源，標了也查不了。它屬於編輯台的職責，正確的關卡是責任編輯核可。

三種處置的機制歸屬：

- **標注來源** → 欄位與掃描由 `051` 設計。本票只指定哪些項目要標。
- **凍結** → 機制由 `047` 設計。本票只指定哪些項目要凍結。
- **搬進 SSOT** → 走既有的試算表、核可版本綁定與同步（`040`／`050`）。新增分頁另開票。
- **移除** → 無相依，本票 implement 直接做。

### 四、Captain gate 決定

#### G1　規則 5 管哪些字

**建議選 A。**

- **A. 只管「主張」。** 事實陳述與編輯判斷在範圍內。介面文字不在範圍內。介面文字照舊。
- **B. 管站上每一個中文字。** 導覽、按鈕、操作說明都要改由具名的人撰寫。三種處置都不適用於介面文字，要另開「人工改寫」一項。工作量約 44 個檔。

**可逆性**：兩者都只是規則解讀，隨時可改。改了之後已施工的部分不必退回。

**為什麼建議 A**：規則 5 的起因是假出處與虛構案件（`design.md` 第六節不變式表第 7 列的「對應的失敗」欄）。兩者都是主張。按鈕文字不會造成這類事故。

#### G2　AI 寫的、查得到一手來源的事實陳述，能不能留在試算表與 T3 以外

這一題直接碰到規則 5。規則 5 現在的答案是「不能」。

**建議選 A。**

- **A. 規則 5 新增第三類。** 條件三項全部成立才可留：（1）每句都對到一手來源，依 `051` 標注；（2）具名的法學審閱者逐項簽核，記在 `docs/content-audit/` 的清單；（3）依 `047` 凍結。編輯判斷不適用第三類。要改 `AGENTS.md` 第 5 條與 `design.md` 不變式第 7 條的措辭。
- **B. 規則 5 不改。** 這類內容一律搬進 SSOT 或移除。`/past/thresholds` 整頁、四份測驗、`verified-case-refs.mjs` 以外的條文敘述都要移除。
- 不提供第三個選項。「標注來源並凍結但不改規則 5」會違反規則 5，見 FO 範圍說明。

**可逆性**：A 改的是規則文字，可以退回。B 的移除可以用 git 救回，但門檻分析頁的資料（813 筆釋字逐年計數與三個時期的條文核對）重建要重新取證。

**為什麼建議 A**：

- 您 2026-09-30 的方向第 2 點說「AI 生成內容經審閱後定稿，不得重新生成」（`047`）。這一點預設了「經審閱的 AI 內容會留在站上」。規則 5 現行文字只在 T3 允許這件事。兩者要對齊。
- B 會移除站上來源最完整的內容。`src/data/threshold-analysis.ts` 每一筆都有一手來源，並有 `tests/threshold-analysis.test.mjs`。
- 搬進 SSOT 不適用這類資料。門檻資料是巢狀結構。`docs/health-check/TODO.md` 的 P1-3 已記錄平面試算表放不下巢狀資料。

**A 的風險**：第三類的條件（2）靠人。人會漏看。`067` 的閱讀清單是現成的簽核載具，但它不會自動失敗。`051` 的掃描要能檢查「有沒有簽核人」，這一點交給 `051` design 決定。

#### G3　本票施工完成，是否列為移除 `noindex` 的條件

**建議選 A。**

- **A. 列入。** 在 `docs/health-check/TODO.md` 的 P3-8 解除條件加一條：本票 AC-3 至 AC-6 全數通過。
- **B. 不列入。** 上線與本票脫鉤。上線時 `/controversy-timeline` 可能仍是 AI 寫、未經人審的內容。

**可逆性**：P3-8 的條件是文字，可以再改。上線本身不可逆。

**為什麼建議 A**：規則 5 沒有機械檢查（`gatekeeping.md` 第 6 章）。不綁上線條件，就沒有東西在上線前擋住它。`067` 的 `check` 已於 2026-09-29 用同樣方式綁進 P3-8。

### 五、逐檔處置表

「處置」欄是選 G1-A、G2-A 時的處置。「G2-B 時」欄只在處置會變時填寫。
負責人：**施工者** = FO 派出的 implement 工作者；**審閱者** = 法學背景審閱者；**captain** = 您本人。

#### 5.1　`src/data/`

| # | 項目 | 種類 | 處置 | G2-B 時 | 理由 | 負責人 |
|---|---|---|---|---|---|---|
| D1 | `src/data/history.json` | SSOT | 不處置 | — | 試算表同步產物，有核可版本綁定 | — |
| D2 | `src/data/discussions.json` | SSOT | 不處置 | — | 同上 | — |
| D3 | `src/data/future.ts` `RAW_CASES` 的 `id`、`filingDate`、`applicant`、`topic` | T3 事實 | 標注來源並凍結 | 同左 | 取自 `cons.judicial.gov.tw/docdata.aspx?fid=52`（`:160` 註明 2026-04-29 取證）。來源目前寫在註解，`051` 的欄位要取代它。`047` 本身以這幾欄為凍結範例 | 施工者；captain 看預覽 |
| D4 | `future.ts` `RAW_CASES` 的 `tags` | T3 編輯判斷 | 標注來源（編輯層，具名審閱人），不凍結 | 同左 | 規則 5 第二類允許 T3 經審閱的編輯判斷。現況未經審閱：`:171-173` 三件預算案全標為「言論自由」。依 `data-collection-guide.md` T3 SOP 由 captain 審。`047` 把標籤列為「可持續更新」 | captain |
| D5 | `future.ts:113` `REAL_TOTAL_PENDING = 473` | T3 事實 | 標注來源並凍結。依 T3 SOP 第 1 步從憲法法庭月報重新取數，附網址與取證日。取得的數字與 473 不同時，改用取得的數字 | 同左 | 註解只寫「司改會／媒體報導」，沒有連結。此數顯示在首頁（`TrackCards.tsx:138`）與 `/future`，都是公開頁 | captain 取數；施工者寫入 |
| D6 | `future.ts:359-377` `JUSTICES` | T3 事實（涉真實人物） | 標注來源並凍結。逐人對照司法院大法官名錄。刪掉 `synthetic` 字樣。`absent` 旗標每人附一則有日期的一手或新聞來源；查不到來源的人，旗標移除 | 同左 | 檔頭自述合成。會議曾列為待人工確認，查無紀錄（第二節第 2 點）。`absent` 是對具名公職人員行為的陳述，顯示在 `/future:77`「三名不參與評議會」 | 施工者取證；審閱者簽核 |
| D7 | `future.ts:437-453` `CRISIS_STATS` 的推導欄位與 `TERM_EVENTS`、`DAYS_UNTIL_CLIFF` | T3 推導值 | 不單獨處置，跟著 D5、D6 的輸入 | 同左 | 由其他常數算出。輸入凍結後，推導值自然固定 | — |
| D8 | `future.ts:451-452` `avgDaysPerCase`、`estimatedClearanceYears` | T3 事實（無來源） | 移除兩個欄位 | 同左 | 無來源。與判決清單的實際則數矛盾（`docs/health-check/TODO.md` 產能那一節）。任何新數字等該節拍板口徑 | 施工者 |
| D9 | `future.ts:412-425` `FAILED_NOMINATIONS` | T3 事實 | 標注來源並凍結 | 同左 | 兩次表決日可對到立法院議事紀錄。`029` verify 引過公視 2024-12-24 報導，但未寫進資料 | 施工者 |
| D10 | `future.ts:477-484` `RULINGS_SINCE_FLOOR_VOIDED` | T3 事實 | 標注來源並凍結 | 同左 | 已附判決清單網址與 docdata `id`，取證 2026-09-21。只差把註解改成 `051` 欄位 | 施工者 |
| D11 | `future.ts` 的 `IdentityTag`、`AVAILABLE_TAGS`、`TAG_COLORS`、`REFERENCE_DATE`、`LAST_UPDATED` | 非內容 | 不處置 | — | 型別、色票與日期設定 | — |
| D12 | `src/data/ruling-threshold.ts` | T3 事實（法條與判決引述） | 標注來源並凍結 | 同左 | 引述憲法訴訟法第 30 條與 114 年憲判字第 1 號，都是一手來源。`RULING_THRESHOLD.headcount` 維持 `null`，等 `docs/health-check/TODO.md` 的 P0-7 | 施工者；審閱者簽核 |
| D13 | `src/data/opinions.ts` | 事實＋編輯判斷（涉真實人物） | 依 `049` | 同左 | 本票範圍外 | `049` |
| D14 | `src/data/controversy-timeline.ts` | T3 外，事實＋編輯判斷 | **搬進 SSOT**：新增試算表分頁，每個事件一列，經責任編輯核可後同步 | 同左 | 每個事件都混有編輯判斷（`consequence` 欄的政治評價），編輯判斷只能走核可。資料是平面結構，放得進試算表。屬持續更新的編輯台職責（P1-8 處置 1 的適用條件）。`/controversy-timeline` 是公開頁 | captain 建分頁；另開施工票 |
| D15 | `src/data/contributors.ts` | 事實（佔位） | 依 `052` | 同左 | 本票範圍外 | `052` |
| D16 | `src/data/launch-status.ts` | 非內容 | 不處置 | — | 頁面開關設定 | — |
| D17 | `src/data/threshold-analysis.ts`（含 `FACTORS`） | T3 外事實 | 標注來源並凍結 | 移除 | 每筆已有一手來源與 `basisRef`。`FACTORS` 只陳述事實與不確定性，不寫因果（檔頭規則 2）。已有資料測試 | 施工者；審閱者簽核 |
| D18 | `src/data/verified-case-refs.mjs` | 事實（受控詞彙） | 標注來源並凍結 | 同左 | 每筆已附一手來源網址。它是同步程式的驗證依據，不是站上文字；G2-B 下仍保留，因為移除它會讓同步失去檢查 | 施工者 |
| D19 | `src/data/quizzes/rights.ts`、`controversy.ts`、`pending.ts` | T3 外事實 | 標注來源並凍結（題幹、選項、`explanation` 逐題） | 移除 | 題目引述釋字與判決，可對一手來源。`067` 閱讀清單已收錄其中多句（例：`pending.ts:71`）。`/quiz` 不在 `PUBLIC_PAGES` | 施工者；審閱者簽核 |
| D20 | `src/data/quizzes/perspectives.ts` | 編輯判斷 | 移除 | 同左 | 題目要讀者判斷「哪一方的立場」（`:33`），答案是 AI 對立場的歸類。沒有一手來源可對 | 施工者 |

#### 5.2　`src/app` 與 `src/components`

「介面文字」一律依 G1。下表的處置指檔內的**主張句**。

| # | 檔案 | 主張句的處置 | G2-B 時 | 理由 | 負責人 |
|---|---|---|---|---|---|
| C1 | `src/app/future/page.tsx`、`src/app/future/layout.tsx` | 標注來源並凍結 | 同左 | T3。主張句的數字都來自 D5、D6、D12，例 `:80` 取自 `CRISIS_STATS` | 施工者 |
| C2 | `src/components/future/RulingThresholdNote.tsx`、`JusticeTermTimeline.tsx`、`JusticeCountdown.tsx`、`RightsCalculator.tsx` | 標注來源並凍結 | 同左 | T3。文字由 D6、D12 推導。`RulingThresholdNote.tsx:56` 的紀年混用由 `069` 處理 | 施工者 |
| C3 | `src/components/future/BottleneckFunnel.tsx` | **移除**年數顯示（`:35`、`:51`） | 同左 | 見 D8 與第二節第 5 點 | 施工者 |
| C4 | `src/components/home/TrackCards.tsx` | 跟著 D5、D6（`:116`「三名不參與評議會」依 D6 的旗標結果） | 同左 | 數字全部取自 `CRISIS_STATS` | 施工者 |
| C5 | `src/app/page.tsx`、`src/app/layout.tsx`、`src/app/controversy-timeline/page.tsx` | 移除「從癱瘓到復活」等評價句（`page.tsx:80`、`controversy-timeline/page.tsx:10`）；專案自我介紹（例：`page.tsx`「將過去課本裡的民主成就轉化為…」）不動 | 同左 | 前者是對機關的評價。後者是專案對自身目標的宣告，不是對外在世界的主張 | 施工者 |
| C6 | `src/components/controversy-timeline/TimelineNode.tsx` | 不處置 | 同左 | 只有介面文字與立場標籤名稱。資料來自 D14，`justiceStances` 已清空（`controversy-timeline.ts:136`、`:233`） | — |
| C7 | `src/app/past/page.tsx` | **移除**前言三段（`030` 加入的「為什麼要回頭看這些釋憲案？」） | 同左 | 內容是編輯判斷（「這道防線正因為政治僵局面臨癱瘓」），沒有試算表分頁可放 | 施工者 |
| C8 | `src/app/past/thresholds/page.tsx`、`src/components/threshold-analysis/*`（11 檔：`ChartAxes`、`ChartText`、`EraComparisonStrip`、`OchreBandFactors`、`SeriesBoundaryNote`、`SeriesBreakLine`、`ThresholdBand`、`ThresholdBoundary`、`ThresholdCaseAnalysis`、`ThresholdChart`、`ThresholdTooltip`） | 標注來源並凍結 | 移除 | 跟著 D17 | 施工者；審閱者簽核 |
| C9 | `src/app/present/page.tsx` | **移除** `:14-23` 的寫死時間軸 `CourtTimeline` | 同左 | 與 D9、D14 重複，且含評價（`:19`「確立了權力分立與法律明確性原則的當代界線」）。同一件事只留一處 | 施工者 |
| C10 | `src/app/present/[id]/page.tsx`、`src/components/PresentDetail.tsx`、`src/components/opposing-views/OpposingViewsSection.tsx` | **移除**對專案做法的宣稱：`PresentDetail.tsx`「完整內文由『貓頭鷹檔案課』的志工協力轉譯」、`OpposingViewsSection.tsx`「每則論述均附有編輯團隊的脈絡說明」 | 同左 | 宣稱無法查證，性質同 `052` 的佔位貢獻者 | 施工者 |
| C11 | `src/app/preview/page.tsx` | **移除整頁** | 同左 | 2026-03-13 的風格比較頁。不在 `ALL_PAGES`，`LaunchGate` 現在對它顯示 ComingSoon，但程式碼仍在。內含範例文案（「以前上街頭會先被當罪犯？」）。`AGENTS.md` 第 3 條：設計範例不得當真實內容 | 施工者 |
| C12 | `src/app/quiz/*`（`page.tsx`、`controversy/`、`pending/`、`perspectives/`、`rights/` 五個 `page.tsx`）、`src/components/quiz/QuizResult.tsx` | 跟著 D19、D20；`perspectives/page.tsx` 隨 D20 移除 | 全部移除 | 頁面本身只有介面文字 | 施工者 |
| C13 | `src/components/opinion-lazybag/DecisionFlowchart.tsx`、`OpinionLazybag.tsx`、`StanceSpectrum.tsx`、`src/app/opinion-lazybag/page.tsx`、`src/components/home/LazybagCtaSection.tsx` | 依 `049` 與 `058` | 同左 | 本票範圍外 | `049`、`058` |
| C14 | `src/app/about/page.tsx` | 依 `052` | 同左 | 內含「專案緣由文案撰寫中」佔位，與貢獻者名單同一頁 | `052` |
| C15 | `src/components/Footer.tsx`、`src/components/ComingSoon.tsx` | 不處置 | 同左 | 介面文字與專案自我介紹 | — |

**本表沒有未決項。** 需判斷的地方都在第四節，各有建議。

### 六、相依與施工順序

```
053 gate（G1、G2、G3）
  ├─ 053 implement：只做「移除」與文件更新（C3、C5、C7、C9、C10、C11、D8、D20，G2-B 時加 D17、D19、C8、C12）
  ├─ 新票：爭議時序搬進 SSOT（D14）。前置：captain 建分頁與保護範圍，流程同 050
  ├─ 051 implement：建立來源欄位與掃描 → 對本表所有「標注來源」項目執行一次
  │    └─ 047 implement：建立凍結機制 → 對本表所有「凍結」項目執行一次
  ├─ 049、052、058：各自進行，與本票無先後
  └─ 059（測驗入口）：等 G2。G2-B 時測驗整組移除，059 失去對象
```

**051 必須在 047 之前。** `051` 的〈相依〉寫明它是 `047` 的前置：沒有來源欄位，就無法表達「這筆已定稿」。
**本票 implement 不等 051、047。** 移除類不需要任何機制。標注與凍結的施工由 `051`、`047` 的 implement 以本表為輸入清單執行。
`051` 的 AC 第 3 條（「結果必須可據以回答 P1-8 的八個檔各自的處置」）以本表為對照。

**過渡期**：`051`、`047` 完成前，標注來源並凍結的項目照舊顯示。網站仍有 `noindex`。G3-A 時，這段期間不會上線。

### 七、元件、資料與版面

- **不新增元件。** 本票只移除程式碼與文字。
- **移除的元件**：`src/app/preview/page.tsx`（C11）、`src/app/quiz/perspectives/page.tsx`（C12）。G2-B 時另移除 `src/app/past/thresholds/page.tsx`、`src/components/threshold-analysis/*`、其餘測驗頁。移除頁面時，連到它的連結一併移除。
- **資料形狀改變**：`CRISIS_STATS` 少兩個欄位（D8）。`src/app/quiz/page.tsx:6`、`:40-42` 拿掉 `perspectives` 的入口。
- **D14 的試算表分頁**：欄位至少含 `id`、`date`、`title`、`summary`、`detail`、`category`、`significance`、`actors`、`consequence`，與 `TimelineEvent`（`controversy-timeline.ts:22`）一致。細節由新票設計。`VOIDED_FLOOR_SHORT` 的 import 留在頁面元件，不進試算表。
- **手機與桌機**：C3 移除 `BottleneckFunnel` 的年數格後，該列少一格。施工者要確認兩種寬度下版面不留空洞。C7 移除前言後，`/past` 的英雄區直接接搜尋列。其餘移除不改版面。

### 八、驗收條件

**AC-1　處置表涵蓋全部範圍。**
Verified by：執行第二節第 1 點的指令，對每一行以 `grep -F` 查本檔 `### 五` 一節。未命中的路徑數必須為 0。
`src/components/threshold-analysis/*` 與 `src/app/quiz/*` 以目錄比對。新增一個含中文的 `.tsx` 而不更新本表，此條失敗。

**AC-2　處置表沒有未決項。**
Verified by：`awk '/^### 五、/{s=1;next} /^### 六、/{s=0} s' <本檔> | grep -cE '待決定|待定|TBD'` 輸出 0。

**AC-3　移除類完成。** 以下每條指令都必須成立：
- `grep -rn 'avgDaysPerCase\|estimatedClearanceYears' src` 無輸出（D8、C3）
- `test ! -e src/app/preview/page.tsx`（C11）
- `grep -c '憲政體制的韌性考驗\|當代界線' src/app/present/page.tsx` 輸出 0（C9）
- `grep -c '為什麼要回頭看這些釋憲案' src/app/past/page.tsx` 輸出 0（C7）
- `grep -rc '志工協力轉譯\|每則論述均附有編輯團隊' src/components` 全為 0（C10）
- `grep -rn '癱瘓到復活' src/app` 無輸出（C5）
- `test ! -e src/data/quizzes/perspectives.ts`（D20）
- `npx tsc --noEmit` 與 `npm run build` 離開碼 0

把任一項移除退回，對應的指令就會失敗。

**AC-4　大法官名單不再自稱合成，且每人有來源。**
Verified by：`grep -c 'synthetic' src/data/future.ts` 輸出 0；並以 `051` 的掃描對 `src/data/future.ts` 執行，離開碼 0。
刪掉任一位大法官的來源欄位，`051` 掃描必須非零退出。

**AC-5　T3 審閱有紀錄。**
Verified by：`docs/content-audit/` 下有一份 T3 審閱紀錄，列出 D3 至 D6、D9、D10、D12 每一項，每項有審閱人姓名與日期。
`grep -c '\[ \]' <該檔>` 輸出 0（沒有未勾選項）。

**AC-6　凍結項目擋得住覆寫。**
Verified by：`047` 的覆寫檢查。改動 `RULINGS_SINCE_FLOOR_VOIDED` 任一筆的 `docket`，檢查必須非零退出。本條的指令由 `047` design 提供。

**AC-7　爭議時序改由試算表供應。**
Verified by：`src/data/controversy-timeline.ts` 不再含手寫事件陣列（`grep -c "id: 'evt-" src/data/controversy-timeline.ts` 輸出 0），事件改從同步產物讀取。
本條由 D14 的新票驗收。本票只要求該票存在且 `docs/health-check/TODO.md` 指向它。

**AC-8　P1-8 可以結案。**
Verified by：`awk '/^### .*P1-8/{s=1} /^### P1-9/{s=0} s' docs/health-check/TODO.md | grep -c '已結案'` 大於 0。
結案條件：本票 gate 通過、AC-1 至 AC-3 成立、其餘每一項都有一張開著的票負責（`049`、`051`、`047`、`052`、`058`、D14 新票）。

**AC-9　（僅 G3-A）上線條件含本票。**
Verified by：`awk '/^### P3-8/{s=1;next} /^### /{s=0} s && /解除條件/' docs/health-check/TODO.md | grep -c '053'` 大於 0。

### 九、預計改動的檔案與行數

| 檔案 | 改動 | 估計行數（±30%） |
|---|---|---|
| `src/data/future.ts` | 刪 D8 兩欄；D6 改檔頭字樣 | −5 |
| `src/components/future/BottleneckFunnel.tsx` | 刪年數格 | −10 |
| `src/app/preview/page.tsx` | 刪檔 | −136 |
| `src/app/present/page.tsx` | 刪 `:14-23` 的 `CourtTimeline` 與使用它的地方 | −30 |
| `src/app/past/page.tsx` | 刪前言區塊 | −20 |
| `src/components/PresentDetail.tsx`、`src/components/opposing-views/OpposingViewsSection.tsx` | 刪兩句 | −4 |
| `src/app/page.tsx`、`src/app/layout.tsx`、`src/app/controversy-timeline/page.tsx` | 改評價句 | ±6 |
| `src/data/quizzes/perspectives.ts`、`src/app/quiz/perspectives/page.tsx`、`src/app/quiz/page.tsx` | 刪兩檔、拿掉入口 | −120 |
| `docs/health-check/TODO.md`、`AGENTS.md`、`docs/content-pipeline/*` | 見第十節 | +40 |

G2-B 時另刪 `src/data/threshold-analysis.ts`（598 行）、`src/components/threshold-analysis/*`、`src/app/past/thresholds/page.tsx`、`tests/threshold-analysis.test.mjs`、其餘三份測驗與頁面。

**語意改變**：`/future` 不再顯示估計年數。`/present` 不再顯示寫死的時間軸。`/past` 沒有前言。`/preview` 與 `/quiz/perspectives` 不存在。其餘頁面的文字與數字不變。

### 十、文件影響

#### 現在更新

- **`docs/health-check/TODO.md` 的 P1-8**：追加一則 2026-09-30 補述。已定方向：處置表在本票第五節，三項決定待 captain gate。狀態：尚未施工。盤點表列的八個檔已不完整，以本票為準。驗證目標：AC-8。
- **`docs/health-check/TODO.md` 產能那一節（第二個 P1-9）**：追加一則補述。事實：`BottleneckFunnel.tsx:35`、`:51` 仍顯示由 `avgDaysPerCase` 算出的年數，該節的 `grep` 只查 `page.tsx`，抓不到。已定方向：本票 D8、C3 移除。狀態：尚未施工。驗證目標：AC-3 第一條。

#### 實作後更新

- **`AGENTS.md` 第 5 條**與 **`docs/content-pipeline/design.md` 第六節不變式第 7 條**：G2-A 時改措辭，加入第三類；G1-A 時加一句範圍說明。兩處措辭要相同。以追加方式改，不改寫原句。
- **`docs/content-pipeline/gatekeeping.md`**：第 6 章「三類內容」表（G2-A 時變四類）；第 8 章缺口表中本票那一列改指向結案狀態。
- **`docs/content-pipeline/data-collection-guide.md` T3 節**：`CRISIS_STATS` 欄位清單拿掉 D8 兩欄；「已知限制」加 T3 審閱紀錄的位置（AC-5）。
- **`docs/health-check/TODO.md`**：P1-8 標已結案（AC-8）；G3-A 時 P3-8 加解除條件（AC-9）；D14 新票列入。
- **`docs/constitution-features/059-quiz-no-site-entry.md`**：追加補述，說明測驗的去留依本票 G2。
- **`docs/INDEX.md`**：D14 新票與 T3 審閱紀錄檔新增時加列。

#### 不更新

- `docs/constitution-features/047-content-freeze.md`、`docs/constitution-features/051-content-provenance-marking.md`：正在平行 design。本票只引用它們，不改它們的內容。它們以本表為輸入清單的方式由各自的 design 決定。
- `docs/constitution-features/049-opinion-lazybag-content-provenance.md`、`052-contributors-placeholder.md`、`058-opinion-lazybag-unwired-removal-cta-alignment.md`：本票對它們的範圍沒有改變。

### Feedback Cycles

- Cycle 1: REJECTED — verify（`6473c8c`）判 F1 Material（`/quiz` 仍寫「從入門到進階」，進階題組已由本票移除：`src/app/quiz/page.tsx` :10、:13、:52）。FO 授權：F1 fix（刪去三處「從入門到進階，」）；F2 fix（`TODO.md` P2-9 以一行補述記 `/preview` 已由 C11 刪除，原文不改）；F3 decline（「其餘兩句未改」措辭不精確，文字內容無誤）；F4 decline（第 6 章標題「三類內容」下列四列，補述已說明）。

## Stage Report: design

- DONE: Produce a per-file disposition table for every non-SSOT file in `docs/health-check/TODO.md` P1-8 (move into SSOT / mark source + freeze / remove), each with a reason; no 待決定 — anything needing captain judgment becomes a gate decision with a recommendation.
  `## Design` 第五節：D1–D20、C1–C15 涵蓋重跑盤點的 58 個檔（P1-8 原表只列 13 個）；三項 captain 決定 G1／G2／G3 在第四節，各附建議與可逆性。AC-1 實跑 0 缺漏，AC-2 實跑 0 筆未決字樣。
- DONE: Every 凍結 disposition points at 047 and every 標注來源 disposition points at 051, with the dependency order stated; acceptance criteria each with a falsifiable `Verified by:`, end value: P1-8 can be closed.
  第三節定機制歸屬；第六節定順序 gate → 053 移除 → 051 → 047（051 為 047 前置）。AC-1 至 AC-9 各附指令；AC-3、AC-4、AC-8 今天實跑皆失敗（5 筆 avgDaysPerCase、preview 存在、1 筆 synthetic、0 筆已結案），證明可證偽。AC-8 即 P1-8 結案條件。
- DONE: Split documentation impact into 現在更新／實作後更新／不更新, each listing documents or 無.
  第十節。現在更新已執行：`docs/health-check/TODO.md` P1-8 與產能 P1-9 各追加一則 2026-09-30 補述，原文未動。

### Summary

逐檔處置表完成。核心發現：站上中文幾乎全部經 AI 寫成（38 個主要元件檔每個都有 `Co-Authored-By: Claude` commit），照字面執行規則 5 要刪掉大半個網站，所以 G1（規則 5 管哪些字）與 G2（有來源的 AI 事實陳述能否成為第三類）交 captain 決定；建議 A／A，並給出 G2-B 時每項的替代處置。另外找到兩件未入帳的事：`BottleneckFunnel.tsx:35/:51` 在公開頁顯示無來源年數且 P1-9 的 grep 抓不到；大法官名單的人工確認查無紀錄。爭議時序因含政治評價，不論 G2 都建議搬進 SSOT，另開票。`docs/health-check/TODO.md` 有兩個標題都叫 P1-9，本票未處理編號重複。

## Stage Report: implement

- DONE: Execute only the 移除 dispositions from the design's section 五 table (captain 2026-09-30: G1-A, G2-A, G3-A), and add the P3-8 解除條件 that 053's AC-3..AC-6 must all pass, without touching the other P3-8 lines.
  `bbe32bc`：D8、D20、C3、C5、C7、C9、C10、C11，以及 C12 的 `/quiz/perspectives` 入口。P3-8 新增獨立一行（2026-09-30，G3-A），056 那行未動；AC-9 指令輸出 1。
- DONE: Draft the exact new wording of `AGENTS.md` rule 5 and `design.md` invariant #7 (identical text) adding the third class per G2-A, and send it to team-lead as a need_decision; do NOT edit `AGENTS.md` or invariant #7 until the captain approves the text through the FO.
  已送 team-lead（三類＋編輯判斷排除＋G1-A 範圍句；建議改本文並加 2026-09-30 補述）。`AGENTS.md`、`design.md`、`gatekeeping.md` 第 6 章皆未改，等核准。
- DONE: Prove each removal with its `Verified by:`; list every remaining 標注來源 / 凍結 / 搬進 SSOT item with the ticket that owns it, and name any item that still needs a new ticket (e.g. controversy timeline → spreadsheet tab); never run `npm run sync-content`.
  AC-3 八條在本分支全數成立，同樣指令對 `HEAD~1` 全數失敗（avgDaysPerCase 3 處、癱瘓到復活 2 處、其餘各 1、兩檔仍在）。見下方清單。未執行 sync；`src/data/*.json` sha256 在 build 前後相同。

**AC-3 各條**（以 `/usr/bin/grep` 執行）：D8/C3 無輸出；C11 `test ! -e` 為 0；C9 為 0；C7 為 0；C10 全為 0；C5 無輸出；D20 `test ! -e` 為 0；`npx tsc --noEmit` 0、`npm run build` 0。
另跑：AC-1 缺漏 0、AC-2 為 0；`node --test tests/*.test.mjs` 136 pass／0 fail；`node scripts/content-audit.mjs check` 前後同為 M4=1 M5=2 M6=18（本次沒有新增失敗，文字單元 3045→2888）。`next start` 實測 `/quiz/perspectives`、`/preview` 回 404，`/quiz` 顯示「3 組題目」。
**做了表外的最小附帶改動**：`BottleneckFunnel` 統計列 `grid-cols-3`→`2`；`/present` 內容欄改 `lg:col-span-12`（避免空欄）；`/past` 門檻連結區 `pb`→`py`（前言移除後補上方留白）；`/quiz` 文案「4 組」→「3 組」（不改會變成錯的事實）；`future/page.tsx` 註解改寫，不再提兩個欄位名（否則 AC-3 第一條會命中註解）。
**未做**：D6 刪 `synthetic` 字樣（第九節列在本票，但處置是標注來源，先刪字樣等於未取證就宣稱已查核，交 051）。`data-collection-guide.md` 的 `CRISIS_STATS` 欄位清單本來就沒列 D8 兩欄，不需改。`docs/content-audit/2026-09-29-reading-list.md` 是 record，不改。
**剩餘項目與負責票**：
- 標注來源 → `051`：D3–D6、D9、D10、D12、D17、D18、D19、C1、C2、C4、C8、C12 其餘三份測驗（D7 跟著 D5、D6）
- 凍結 → `047`：同上，D4 除外
- T3 審閱紀錄（AC-5）→ 由 `051` 的標注施工一併產出，審閱人簽核靠人
- 搬進 SSOT → D14 爭議時序。**需要新票**，建議名稱：「爭議時序搬進 SSOT：新增試算表分頁並改由同步供應」（AC-7、AC-8 以它為前提）
- 範圍外：`049`（D13、C13）、`052`（D15、C14）、`058`（C13）
**P1-8 尚未結案**：D14 票開出前 AC-8 不成立。TODO.md P1-8 已追加補述說明。

### Summary

依 captain 的 G1-A／G2-A／G3-A 完成全部「移除」類處置（`bbe32bc`），每條 AC-3 指令在本分支成立、對上一版失敗。P3-8 加了本票自己的解除條件行。規則 5／不變式 #7 的新措辭已送 FO 待 captain 核准，核准前未動 `AGENTS.md` 與 `design.md`；爭議時序搬進試算表需要 FO 另開新票。

## Stage Report: implement (addendum — rule 5 approved)

- DONE: Apply the captain-approved rule 5 / invariant #7 text (FO relay 2026-09-30,「核准，改寫本體＋補述」).
  `82f7d8d`：`AGENTS.md` 第 5 條本體換成核准文字並加 2026-09-30 補述（引原「兩類」句、註明 G1-A／G2-A 與 053）；`design.md` 不變式 #7「規則」欄換成同一文字，「對應的失敗」欄不變，並加 `### 2026-09-30` 修訂紀錄。未加「並定版」。
- DONE: Prove the two bodies are identical and `CLAUDE.md` is still a symlink.
  `cmp` 顯示 `AGENTS.md` 第 5 條本體與核准文字逐位元組相同。把該本體去掉換行後，與 `design.md` 第 7 列規則欄做 `diff`，沒有輸出。表格儲存格不能換行，所以需要去換行才能比對。2026-09-29 的舊版本也只有去換行後才相同，已實跑確認。`readlink CLAUDE.md` 印出 `AGENTS.md`，`cmp CLAUDE.md AGENTS.md` 相同。
- DONE: Follow-on doc: `docs/content-pipeline/gatekeeping.md` 第 6 章（第十節「實作後更新」所列）。
  新增第三類那一列，「其餘內容」改稱第四類，並加 2026-09-30 補述。第 8 章 051 那列的「第三類禁令」改為「第四類禁令」。`content-audit check` 計數與改動前相同（M4=1 M5=2 M6=18），沒有指向本次三檔的新 M6。測驗 136 pass／0 fail。

### Summary

captain 核准的規則 5 新措辭已寫入 `AGENTS.md` 與 `design.md` 不變式 #7，兩處文字相同。`gatekeeping.md` 第 6 章已隨之改為四類。剩下的只有 D14 爭議時序的新票，由 FO 開立。

## Stage Report: implement (cycle 2)

- DONE: Apply the captain-approved rule 5 text (「核准，改寫本體＋補述」, 2026-09-30) to `AGENTS.md` rule 5 and `design.md` invariant #7, with the `AGENTS.md` 補述 and a `design.md` `### 2026-09-30` revision record; no 「並定版」.
  已在 `82f7d8d` 施工（FO 的兩則訊息交錯，核准先到，本輪沒有重做）。「對應的失敗」欄不變。兩檔 `grep -c '定版'` 皆為 0。
- DONE: Update `gatekeeping.md` chapter 6 to match, following that file's writing rules.
  `82f7d8d`：新增第三類列，「其餘內容」改為第四類，加 2026-09-30 補述。第 8 章 051 那列改寫為「第四類禁令」。文件開頭的三條寫作規則：（1）只寫有日期的完成事實，不寫進度。（2）新列連結的可見文字是 repo 根目錄路徑 `AGENTS.md`。（3）本章是分類表，不是防線，不適用。
- DONE: Prove bodies byte-identical, `CLAUDE.md` still a symlink, content-audit names 0 new lines, G-7 passes.
  `cmp` 顯示 `AGENTS.md` 第 5 條本體與核准文字相同。本體去掉換行後，與 `design.md` 第 7 列規則欄的 `diff` 沒有輸出。表格儲存格不能換行，2026-09-29 的舊版本也只有去換行後才相同，已實跑確認。`readlink CLAUDE.md` 印出 `AGENTS.md`。
  `content-audit check`：在分派基準 `145127b` 的暫時 worktree 與本分支各跑一次，去掉行號後比對，新增 0 行、消失 0 行，兩邊同為 M4=1 M5=2 M6=18。G-7（`056` 正本 awk 區塊）：`G-7 PASS [place1=1/1 place2=1 place3=1]`，離開碼 0。
- DONE: Point `docs/health-check/TODO.md` P1-8 at D14's ticket `074` for AC-8.
  改的是本分支上一輪由本票新增、尚未合併的 P1-8 補述：搬進 SSOT 那一項指向 `074`（`docs/constitution-features/controversy-timeline-to-ssot.md`），規則 5 那句改為已核准，結案句改為「AC-7 由 `074` 驗收」。P1-8 區段中 `074` 的命中數為 2（負責票清單與結案句各一）。

### Summary

規則 5 與不變式 #7 的核准措辭在上一輪已寫入。本輪補上 FO 要的證據：文字相同、symlink 仍在、content-audit 沒有新增失敗、G-7 通過。`TODO.md` P1-8 已指向 `074`。AC-8 的結案條件現在都有負責的票，P1-8 等本票通過最後一道 gate 後結案。

## Stage Report: verify

- DONE: Verify every removal against the design's section 五 table: each removed item is exactly what the table names (D8/C3, D20/C12, C5, C7, C9, C10, C11), each follow-on change is necessary and states nothing false (e.g. /quiz says 3 組), and no factual claim remaining on the touched pages became wrong.
  Removals match the table 1:1 (`git diff main...HEAD -- src`). All 7 AC-3 grep/test lines hold on HEAD. The same greps against `main` hit 7 lines and both deleted files exist there, so each line is falsifiable. Follow-ons are necessary: grid 3→2, `lg:col-span-12`, `pb`→`py`, 4→3 組, and the future/page.tsx comment. No `#timeline`, `/preview` or `perspectives` link is left in `src`. `/future` 「本站不列具體年數」 is now true, where before the funnel's year cell contradicted it.
- FAILED: 同上 — one claim on a touched page became unsupported (finding F1).
  `src/app/quiz/page.tsx:10`, `:13` and `:52` still say 「從入門到進階」. The only 進階 set was the removed perspectives quiz (tag 「進階思辨」, description 「5 道進階題目」). The three quizzes left are tagged 必做題組, 入門友善 and 時事關懷.
- DONE: Verify the rule-5 text: AGENTS.md body byte-identical to the captain-approved text, design.md invariant #7 identical once line breaks are removed, the 補述 quotes the original sentence accurately, gatekeeping.md ch.6/ch.8 now true, no 「定版」 added; CLAUDE.md still a symlink; P3-8 has 053's own line with other lines unchanged; P1-8 points at 074.
  I took the approved block from the implementer's need_decision SendMessage (17:54:54Z). `cmp` against the AGENTS.md rule-5 body is identical. With line breaks removed, `cmp` against design.md row 7's rule cell is identical. The block also matches the design's G1-A wording and all three G2-A conditions (「依 `051`」 became 「依 feature 051」). The 補述 quote equals the `main` line 1 exactly. `grep -c 定版` returns 0 in both files. `CLAUDE.md -> AGENTS.md`. The TODO.md diff removes 0 lines. The AC-9 awk prints 1. The P1-8 section has 2 hits for `074`; 074 exists on `main` but not yet on this branch. gatekeeping ch.6/ch.8 statements are true (polish in F3 and F4).
- DONE: Placeholder scan over the diff; tests, tsc and build pass; G-7 PASS; content-audit unchanged vs main; end with a clear PASSED or REJECTED verdict — findings go through the disposition checkpoint without touching the candidate.
  Placeholder scan: the added lines contain no 某學者, 某大學法律系, lorem ipsum or 5個重點 in `src`. The only 某學者 hit is design.md row 7's pre-existing, unchanged 「對應的失敗」 cell. `node --test tests/*.test.mjs`: 136 pass, 0 fail, 1 skipped. `tsc --noEmit` rc 0. `npm run build` rc 0; its route list has no `/preview` or `/quiz/perspectives`. `src/data/*.json` sha256 is the same before and after the build. G-7 (056 canonical block) prints `G-7 PASS [place1=1/1 place2=1 place3=1]`. content-audit on a `git archive main` tree vs the branch, line numbers stripped: only the summary unit count differs (3045→2888). Both print M4=1 M5=2 M6=18. No sync run and no push. My temporary node_modules symlink has been removed.

**Findings (disposition checkpoint; candidate untouched, HEAD `bf8e2d0`):**
- F1: /quiz 「從入門到進階」. Released user: team mode only (`/quiz` is in `ALL_PAGES`, not `PUBLIC_PAGES`). Harm: the subtitle promises a 進階 tier that no longer exists. Boundary: this checklist's 「states nothing false」 on a follow-on line 053 already edited. Trigger: observed in source. **Polish now, deferred risk.** It becomes material when `/quiz` enters `PUBLIC_PAGES` (059). Owned by 053. Proposed disposition: fix (drop 「從入門到進階，」 in the three strings).
- F2: `docs/health-check/TODO.md` P2-9 says 「既有的 `/preview` 路由不是解答」, but C11 deleted that route. Polish, owned. Proposed disposition: fix with a one-line 補述, or decline.
- F3: the AGENTS.md 補述 and the design.md revision record both say 「其餘兩句未改」. The rest of the old rule is three sentences on two lines, now merged onto one line, with the wording unchanged. Polish. Proposed disposition: decline.
- F4: gatekeeping ch.6 keeps the heading 「三類內容」 over four rows, which its 補述 explains. The 「其餘內容」 row still says 「寫死在元件裡的中文」, and the next paragraph carries the G1-A carve-out. Polish. Proposed disposition: decline.
- Merge-order notes, not 053 defects: `docs/constitution-features/051-content-provenance-marking.md:81` still says 「第 5 條只允許兩類」. 051's 「規則 P4 即第三類的禁令」 will point at the wrong class. Both are for the FO.

### Summary

**Verdict: REJECTED.** The only blocker is F1, a one-line owned fix on `/quiz` (team-visible, not public). The rule-5 text is byte-identical to the captain-approved block, all removals match the section 五 table, and tests, tsc, build, G-7 and content-audit all pass. If the FO authorizes declining F1 as polish, nothing else blocks, and I would recommend PASSED.

## Stage Report: implement (cycle 3)

- DONE: F1: remove 「從入門到進階，」 from the three /quiz strings (src/app/quiz/page.tsx :10, :13, :52) so the page describes the three remaining sets truthfully; nothing else on the page changes.
  `37d7368`：三處都刪了，diff 只動這三行。`grep -c '進階' src/app/quiz/page.tsx` 為 0。只要把任一處改回，這條檢查就會失敗。
- DONE: F2: add a dated one-line 補述 under TODO.md P2-9 recording that /preview was deleted by 053 C11, original text unchanged.
  `37d7368`：在 P2-9 的 2026-09-04 更正之後追加一行 2026-09-30 補述。diff 只有新增，沒有刪除任何行。
- DONE: Re-run the verify-owned proofs touched by the fix (removal checks, tests, tsc, build, G-7, content-audit unchanged vs main); no other candidate change.
  AC-3 八條全數成立。`tsc` 0、`build` 0，`src/data/*.json` 的 sha256 在 build 前後相同。測驗 136 pass、0 fail。G-7 PASS [1/1, 1, 1]。
  content-audit 與 main（`b7a7f96`）比對：去掉行號後新增 0 行、消失 0 行，兩邊同為 M4=1 M5=2 M6=18。
  F3、F4 依 FO 指示不處理。規則 5 的文字與它的補述沒有改動。

### Summary

依 cycle 1 的處理決定修了 F1 與 F2，一共改兩個檔、四行。verify 負責的證據全部重跑，結果都通過。content-audit 的結果與 main 相同。
