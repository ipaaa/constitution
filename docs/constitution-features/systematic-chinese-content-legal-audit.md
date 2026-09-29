---
title: 全站生成中文內容的系統性法律事實查核
status: design
score: 0.9
source: FO 2026-09-24，captain 指示「等 056 收斂後開」
id: 067
started: 2026-09-29T16:52:37Z
---

**⛔ 不得派工，直到 feature `056-pre-launch-checklist` 封存為止。** 這是 captain 2026-09-24 的明確排序：
先讓 056 收斂，才知道哪些形式檢查已經有人守著、不必重複。FO 在 056 封存前不得對本票 dispatch。

## Problem

這個站上的中文內容有兩種把關，目前只有一種存在。

**形式把關**（056 在做）：佔位文字、stray 指令、metadata、lorem ipsum。它抓得到「這裡還沒寫完」。

**內容把關**（沒有人在做）：釋字號引錯、日期錯、門檻數字錯、用現在式描述已失效的法律狀態。
它抓的是「這裡寫完了，而且寫錯了」。

證據是這兩張票的**發現方式**，不是它們的內容：

- `065-opinion-lazybag-wrong-ruling-citation` —— reviewer 在驗別的東西時**順手看到**。
- `066-quiz-timeline-voided-quorum-present-tense` —— FO 讀資料時**撞到**。

兩件都是運氣。沒有任何機制會系統性地找出第三件、第四件。而讀者看到的是錯誤的法律資訊。

已知的同類待查項（不是窮舉，是本票開工時的起點）：

- `src/data/controversy-timeline.ts:156` 與 `evt-11` 內部矛盾：一處寫「不審查」，另一處寫「投票否決」。
- 站上同時存在民國與西元兩套紀年，未統一也未標示換算。
- `docs/` 有兩條路徑仍指向已封存的 `063`。

## Value

讀者不會因為這個站而對憲法產生錯誤認知。這是本站存在的理由，不是附加品質。

## 這張票開工時要先決定的事

**不要一開始就寫檢查腳本。** 先回答：哪些內容類別是可機械驗證的（釋字號是否存在、日期是否落在合法區間、
門檻數字是否與 `ruling-threshold.ts` 一致），哪些只能靠人讀（因果敘述、時態、語氣）。
前者做成檢查、後者做成清單交給 captain 或法學背景審閱者。**把這條界線畫錯，這張票會變成第二個 056。**

並且：`056` 封存後先讀它最終的檢查清單，本票只補它沒有覆蓋的部分，不重複造網子。

> **2026-09-29 補述（design）：上方「⛔ 不得派工」已解除。** `056` 於 2026-09-25 封存，`verdict: PASSED`。
> captain 於 2026-09-29 決定本票先跑 design。原句保留。

## Design（2026-09-29）

基準：`main` 的 `a5786cc`。本節所有「今日」數字都在這個 commit 上實跑取得。
實跑用的探測程式放在 `tests/` 下的暫存檔，跑完即刪，`git status` 為乾淨。

### 一、`056` 最終檢查清單實際覆蓋了什麼

`056` 的最終交付是 gate 執行清單 `G-1`–`G-8`（`_archive/056-pre-launch-checklist.md:311-320`），
加上第二節結論表派出的六張票。逐項對照如下。

| `056` 的項目 | 它守的是什麼 | 本票怎麼處理 |
|---|---|---|
| `G-5` 佔位字串掃描 | `某學者`、`lorem ipsum`、`volunteer@addcourt.tw` 等六組字串 | **不碰。** 本票不掃任何佔位字串 |
| `G-6` D1／D2 反向保護 | `h2`／`h28` 兩個 id，與「釋字第272號」這一個號次 | **不碰。** 本票的號次檢查只驗「號次存在」。272 存在，不會報 |
| `G-1` → `062` | `h34`／`h35` 標題重複 | **不碰。** 屬單一缺陷，已有票 |
| `G-1` → `063`（已完成） | `/future` 的 `requiredForRuling` | **不碰。** |
| `G-2` → `049` | 具名大法官立場的出處 | **不碰。** 人物歸屬整類留給 `049` |
| `G-1`／`G-2` 其餘、`G-3`／`G-4`／`G-7`／`G-8` | 交付物、上線控制、建置 | 與內容正確性無關 |

另有兩個既有網子不屬於 `056`，但同樣不能重造：

| 既有網子 | 它守的是什麼 | 本票怎麼處理 |
|---|---|---|
| `scripts/check-voided-floor.mjs`（`066`） | 已失效的 10 人下限被寫成現行法（時態） | **不碰。** 本票的時態定位器排除它的門檻句 |
| `066` 的 AC1 | 失效句只在 `ruling-threshold.ts` 定義一次 | **不碰。** |
| `tests/threshold-analysis.test.mjs`（`012`） | 釋字逐年件數、門檻條文 | **不碰。** 本票重用它的 fixture，不重驗它的數字 |

**結論：`056` 對「寫完了但寫錯了」只有一個號次（272）的保護。** 其餘的法律事實全無機制。
這證實了本票 Problem 一節的判斷。本票的範圍就是上面三張表以外的部分。

### 二、界線：三層，不是兩層

Problem 一節把內容分成「可機械驗證」與「只能靠人讀」兩類。實測後改為三層。
中間多一層的理由在第三節的證據欄：有一類錯誤機器**判不了對錯，但找得到位置**。
把它丟給「全部靠人讀」，審閱者得在 21,841 字裡自己撞到它，就是 `065`／`066` 的發現方式。

| 層 | 誰判對錯 | 產出 | 成立條件 |
|---|---|---|---|
| **M（機器判）** | 腳本 | 通過／失敗，離開碼 | repo 內有一個權威來源可比對，且判準不需要理解語意 |
| **L（機器找、人判）** | 審閱者 | 分組後的閱讀清單 | 判不了對錯，但能用詞彙或結構把「講同一件事的句子」集中 |
| **H（人讀）** | 法學背景審閱者 | 逐頁閱讀清單 | 錯誤沒有可定位的表面特徵 |

**判準：一條規則要進 M 層，必須同時具備兩項證據。**
(1) 一個權威來源，在 repo 內，不需要人判讀。
(2) 一個真實的錯誤實例（今日 repo 內，或 git 歷史中），證明這條規則抓得到。
缺 (1) 就降到 L。缺 (2) 就不做——沒有實例的規則是替想像中的錯誤造網子，那正是 `056` 長到 3,821 行的方式。

### 三、逐類歸屬與證據

| 類別 | 層 | 權威來源 | 證據（今日實跑或歷史實例） |
|---|---|---|---|
| **M1 號次存在** | M | 釋字：`tests/fixtures/interpretation-dates.json` 的 813 筆。憲判字：第五節的新 fixture | 歷史實例：`063` 第六小節記錄的「114憲判9」。114 年只有第 1 號。這個錯號寫進過 `056` 的 D3 與 `design-assets/003`。今日 `src/` 內 34 個釋字號、16 個憲判字號全部存在，M1 今日通過 |
| **M2 號次與年份配對** | M | 同 M1 的日期欄 | 歷史實例：`065` 修正前的 `src/app/present/page.tsx:18`（commit `06ddfb1`）為 `{ year: '2024', label: '114年憲判字第1號' }`。114 憲判 1 作成於 2025-12-19。今日 `history.json` 40 筆的 `reality.year` 與 `ruling_id` 全部配對正確（範圍寫法 `釋字第781~783號` 需支援） |
| **M3 門檻數值** | M | `src/data/ruling-threshold.ts` 的 `voidedFloor.participants`（10）與 `unconstitutionalityVotes`（9） | 今日 13 處「至少 N 人參與評議」「N 人門檻」「不得低於 N 人」全為 10 或 9，M3 今日通過。守的是數值漂移，不是時態。時態是 `066` 的 |
| **M4 日期合法性與順序** | M | 資料本身的 ISO `date` 欄 | **今日新發現**：`TIMELINE_EVENTS` 的 `evt-09`（2024-12-20）排在 `evt-10`（2024-10-31）之前。元件不排序（`ControversyTimeline.tsx:45` 只 filter），`/controversy-timeline` 依陣列順序渲染，該頁在 `PUBLIC_PAGES` 內 |
| **M5 同一段落混用紀年而未換算** | M | 民國年 ＋ 1911 | **今日新發現，種子二的具體位置**：`/future` 的 `RulingThresholdNote.tsx:55-57` 渲染成同一段「114 年 1 月 23 日修法增訂的⋯自公告日 2025-12-19 起失其效力，存續期間為 114 年 1 月 23 日至 114 年 12 月 19 日」。另 `threshold-analysis.ts:238` 的 caveat 同段有「1952-04-16」與「民國 90 年 4 月」。今日共 2 處 |
| **M6 文件路徑指向已封存的檔** | M | 檔案系統 | **種子三**：`docs/content-pipeline/data-collection-guide.md:98`、`docs/health-check/TODO.md:431` 指向 `063` 的舊路徑。同型的還有：`src/app/layout.tsx:8` 與 `AGENTS.md:61` 指向 `056` 的舊路徑，**也就是 noindex 綁定本身**；`TODO.md` 另有 9 處相對路徑 `../constitution-features/056-pre-launch-checklist.md`；`src/` 內 6 處指向 `066`／`012`／`about-content.md` 的舊路徑 |
| **L1 同一事實的所有敘述** | L | 無。兩個說法都是合法中文 | **種子一**：「不審查」與「投票否決」各自都是正常句子。錯的是它們描述同一件事卻互斥。實跑一組 5 個詞的詞彙群（同意權／提名／否決／不審查／杯葛，限含「大法官」的句子），在 `src/data/` 得到 16 句，`controversy-timeline.ts:144`、`:156`、`:180`、`:215` 與 `future.ts:416`、`quizzes/controversy.ts:87` 全部落在同一組。**`quizzes/controversy.ts:87` 的「立法院拒絕行使大法官人事同意權」是種子一的第三個位置，本票開工前沒有人知道** |
| **L2 號次與案名配對** | L | fixture 的官方案名 | `065` 的錯誤是「114 憲判 1」配上「國會職權修法」。同一個詞「國會職權修法」在 `opinion-lazybag/page.tsx:6` 是對的（`065` 設計 B1）。主題比對需要理解語意，所以只能把每個號次的所有出現處與官方案名並排，交給人判 |
| **L3 現在式的法律狀態** | L | 無 | `066` 的教訓：答案本身對，錯的是 explanation 的時態（`066` Problem 一節）。例：`quizzes/pending.ts:71`「目前僅剩 8 位在任大法官」——是否仍為真，要看撰寫日與今日。機器只能找出「目前／至今／仍」＋法律狀態詞的句子。**排除 `check-voided-floor.mjs` 的門檻句**，不重造 `066` 的網子 |
| **L4 全站紀年慣例盤點** | L | 無，需 captain 決定慣例 | 種子二的另一半：「未統一」。M5 只管同一段內混用。全站該用哪一套，是編輯決定，不是事實。L4 逐檔列出民國／西元各幾處，供 captain 決定 |
| **H1 因果敘述** | H | 一手判決與新聞 | 例：`evt-09`「這個修法表面上是⋯實際上⋯」。因果關係沒有表面特徵可以定位 |
| **H2 法律效果的精確度** | H | 判決主文 | 例：`065` 設計第九節第 1 點。`DecisionFlowchart.tsx` 把合憲性解釋的條文整條標「違憲」。「違憲」一詞本身正確，錯在程度 |
| **H3 語氣與立場** | H | 無 | 例：`evt-06` 的「護航執政黨」加了引號並歸給國民黨；`evt-03` 的 consequence「凸顯社會對國會多數暴力的不滿」沒有引號。敘述者是否採用了一方的用語，需要讀 |

**排除在三層之外**：佔位字串、272、人物歸屬、10 人下限時態、門檻視覺化的件數。理由見第一節。

**本階段順帶發現，屬 `066` 的錯誤類型，本票不重造網子：**
`src/data/threshold-analysis.ts:323-336` 的門檻期 `id: 'current'`，`label: '10 人 9 人'`，`effectiveTo: null`。
它把已失效的第 30 條第 2 項標成現行門檻，渲染於 `/past/thresholds`。該路由全檔零命中「失效」「失其效力」「2025-12-19」。
`066` 的 `check-voided-floor.mjs` 當時跑了六條路由，含 `/past`，不含 `/past/thresholds`（`_archive/066-quiz-timeline-voided-quorum-present-tense.md:1022-1026`）。
缺的是既有網子的路由涵蓋面，不是新規則。修它會動到 `012` 的測試（`tests/threshold-analysis.test.mjs:1181` 等處以 `'current'` 為錨），應另開票。見 Documentation impact。

### 四、閱讀量：H 層是有限的

實跑扣除註解與重複後，站上讀者看得到的中文共 **21,841 字，分布在 66 個檔**。
前三大是 `history.json` 4,412 字、`controversy-timeline.ts` 2,747 字、`discussions.json` 1,902 字。
以法學審閱的精讀速度估計，全部讀完約兩到三小時。
H 層清單依頁面曝光排序：`PUBLIC_PAGES`（`/`、`/controversy-timeline`、`/future`）優先。
**這個數字是 H 層可行的依據。** 若全站有二十萬字，H 層就必須縮小範圍，界線要重畫。

### 五、Component hierarchy

本票不動任何 React 元件，不渲染任何畫面。交付物是一支腳本、一個 fixture、一份測試、一份閱讀清單。

| 單元 | 位置 | 責任 |
|---|---|---|
| 文字單元抽取 | `scripts/content-audit/units.mjs` | 把站上所有讀者看得到的中文切成「文字單元」，每個單元帶 `file`、`line`、`path`、`text`、`route`（修正途徑） |
| 規則 M1–M6 ＋ 清單 L1–L4、H | `scripts/content-audit.mjs` | 兩個子命令：`check` 跑 M 層，全過時離開碼 0；`reading-list` 輸出 L 層與 H 層的 markdown |
| 憲判字 fixture | `tests/fixtures/judgment-dockets.json` | 111 年起每一則憲判字的號次、作成日、官方案名、`docdata.aspx` 的 id |
| 抓取 | `scripts/fetch-judgment-dockets.mjs` | 從 `judcurrentNew1.aspx?fid=38` 抓上述資料，只寫 `tests/fixtures/` |
| 測試 | `tests/content-audit.test.mjs` | 每條 M 規則一個種子失敗案例、一個修正後通過案例 |
| 閱讀清單 | `docs/content-audit/2026-MM-DD-reading-list.md` | `reading-list` 的一次輸出，交給審閱者勾選 |

**文字單元怎麼抽**（第八節的 spike 驗過三種都跑得動）：

1. `src/data/**/*.ts`：用 `tests/tsx-loader.mjs` 動態 import，走訪所有匯出值。
   樣板字串已在執行期展開，例如 `evt-15.detail` 內的 `${VOIDED_FLOOR_SHORT}`。
2. `src/data/*.json`：`JSON.parse` 後走訪。**唯讀。**
3. `src/**/*.tsx`：用 `typescript` 的 AST 取 JSX 元素的子節點與字串常值。
   JSX 裡的 `{識別字}` 若 import 自 `@/data/*` 且值為字串，就代入實際值；其餘標成 `⟦⟧`。
   `{/* 註解 */}` 不算讀者文字。

**為什麼不渲染整頁**：spike 對十個路由跑 `renderToStaticMarkup`，七個失敗
（`next/link`、`next/image` 的 CJS 互通，以及 `@/data/*.json` 的 import）。
起 dev server 則要先處理 `LaunchGate.tsx:30` 的 hydration 陷阱（`056` 第一節）。
源碼層抽取涵蓋 client-only 分支（tooltip、quiz 後續題），整頁渲染反而漏掉這些。

**修正途徑欄 `route`**：`.json` 標「改試算表」，`.ts`／`.tsx` 標「PR」。
依 `AGENTS.md` 第 2 條，審閱者看到 `.json` 的問題不能叫人改檔。

### 六、Data requirements

`tests/fixtures/judgment-dockets.json`（新增）：

```
{ "fetchedAt": "YYYY-MM-DD",
  "source": "https://cons.judicial.gov.tw/judcurrentNew1.aspx?fid=38",
  "dockets": [ [rocYear, no, "YYYY-MM-DD", "官方案名", docdataId], ... ] }
```

- **不改 `interpretation-dates.json`。** 重抓它會改動 `fetchedAt` 與 2026 年的件數，`012` 的測試會跟著變。新開一檔，兩檔獨立。
- 抓不到網路時 implement 必須停下回報，**不得憑記憶手打**。
- `tests/content-audit.test.mjs` 另斷言：新 fixture 每年的則數 ≥ `interpretation-dates.json` 的 `judgments` 同年件數。兩個抓取結果互相對照。

腳本的 M 規則細節：

| 規則 | 判準 |
|---|---|
| M1 | 正規化（全形轉半形、去空白、`憲判` 與 `憲判字` 同義、`號` 可省）後，釋字號 ∈ 1–813；憲判字 (年, 號) 在 fixture 內 |
| M2 | 同一物件內，一個欄位含號次、另一個欄位名為 `year`／`date`／`rocDate`／`dateLabel`：年份須等於該號次作成日的年份（民國與西元皆認）。範圍寫法 `781~783` 逐號驗 |
| M3 | 「至少 N 人參與評議」「N 人參與評議下限」「N 人門檻」「參與評議之大法官不得低於 N 人」→ N ＝ `participants`；「至少 N 人同意」「同意人數不得低於 N 人」→ N ＝ `unconstitutionalityVotes`。中文數字與全形數字皆認 |
| M4 | ISO `date` 為合法日曆日；`dateLabel` 若為完整年月日，須與 `date` 相同；含 `date` 的陣列須非遞減 |
| M5 | 扣除號次後，一個文字單元同時含民國年與西元年時，每個民國年須緊鄰其西元換算（括號內），或反之 |
| M6 | 掃描 `src/**`、`AGENTS.md`、`docs/INDEX.md` 標為 `evergreen` 或 `plan` 的文件（不含 workflow 票與 `_archive/`）。路徑（`docs/...` 或相對路徑）不存在，**且**同名檔存在於某個 `_archive/` 下，即失敗。從未存在的路徑（例如標註「新增」的 `operations.md`）不報 |

**不設豁免清單。** 沿用 `check-voided-floor.mjs` 檔頭的原則：誤報時改寫原文消除歧義，不加白名單。

### 七、Mobile／desktop 響應行為

無。本票不產生任何畫面。

### 八、Risk evidence

最有風險的機制有三個，都已在本階段實跑。

1. **`.tsx` 的 JSX 能否還原成讀者看到的段落。** spike 解析 `RulingThresholdNote.tsx`，代入 `VOIDED_FLOOR_FULL`，
   還原出的段落與第三節 M5 引文一致，並被 M5 型樣抓到。全站抽出 5,477 個單元，M5 命中 2 處（3 個單元，因 `ERAS` 與 `RULES_ERA_CAVEATS` 共用同一字串）。
2. **詞彙群能否集中種子一而不淹沒審閱者。** 見第三節 L1：16 句，種子一的四處與新發現的第五處都在內。
3. **M6 的路徑修復會不會打破 `056` 的 `G-7`。** 在副本上把 `layout.tsx`、`AGENTS.md`、`TODO.md` 的 `056` 路徑改為 `_archive/056-pre-launch-checklist.md`，
   `G-7` 正本（`_archive/056-pre-launch-checklist.md:282-291`）改前改後都印 `G-7 PASS [place1=1/1 place2=1 place3=1]`。
   原因：`G-7` 比對的是子字串 `056-pre-launch-checklist`，改後仍在。

**殘留風險**：`.tsx` 內由區域變數組出的字串（例如 `voidedFloor.voidedBy`，它是解構出的區域變數）會成為 `⟦⟧`。
M5 仍能在該段成立，但 M1 看不到被 `⟦⟧` 取代的號次。H 層清單逐檔列出，補這個洞。

### 九、「第二個 056」的防線

1. 第二節的判準：進 M 層要有權威來源與真實實例。
2. 每條規則只在 `scripts/content-audit.mjs` 定義一次。AC 與文件只引用規則代號，不複製型樣。這是 `066` 第九節的規則。
3. 不做語意判斷。L 層只分組，不打分。
4. 不追加 `056` 的 gate 項。`056` 已封存，其 gate 表屬於記錄。是否把本票綁進上線條件，交 captain 決定（第十節）。

### 十、要 captain 決定的事

**建議：三項都照預設走，implement 可以不等這三項開工。**

1. **全站紀年慣例。** 預設：敘述用西元；判決字號保留民國（官方名稱）；引用官方文字時保留民國並括號附西元。M5 不依賴這個決定，L4 清單會列出不符預設的位置。可逆。
2. **H 層由誰讀。** 預設：法學背景審閱者先讀三個 `PUBLIC_PAGES` 的來源檔，其餘頁面後讀。
3. **是否把本票綁進上線條件。** 預設：綁。在 `TODO.md` 的 P3-8 另加一條，不改動 `056` 引用的那一條，所以 `G-7` 的 `place2` 計數不變。可逆。

## Proposed approach

採第二節的三層界線。implement 交付：抽取器、`check`（M1–M6）、`reading-list`（L1–L4 ＋ H）、憲判字 fixture、測試、一份閱讀清單快照。
另修復 M6 抓到的已封存路徑，這是純機械改動，不涉法律判斷。

**implement 不修任何法律內容。** M4、M5 與 L 層找到的內容錯誤，逐項寫進 `docs/health-check/TODO.md` 的新條目或另開票。
理由：`065`／`066` 的修法都需要一手來源與逐處判定。夾在建工具的票裡做，兩件事都做不好。
因此 implement 結束時 `check` **預期為離開碼 1**，失敗項恰為第三節列出的今日發現加上 implement 另外發現的項目。這是真實的錯誤，不是誤報。

**被否決的較簡單方案：一支 grep 腳本掃關鍵字。**
它做不到兩件事。第一，M2 需要知道「同一物件的兩個欄位」，grep 只看一行。第二，M5 的種子橫跨一個 JSX 插值，源碼裡的那一行看不到 `2025-12-19`。
`check-voided-floor.mjs` 檔頭也記錄了「逐一列舉寫法的 grep 已造成九次穩定盲區」。

## Expected surface and tolerance

Estimate: +750 net LOC across 約 20 files，tolerance ±35%。

| 檔案 | 預估 |
|---|---|
| `scripts/content-audit/units.mjs`（新） | +180 |
| `scripts/content-audit.mjs`（新） | +280 |
| `scripts/fetch-judgment-dockets.mjs`（新） | +70 |
| `tests/content-audit.test.mjs`（新） | +200 |
| `tests/fixtures/judgment-dockets.json`（新） | 產物，約 60 筆 |
| `docs/content-audit/2026-MM-DD-reading-list.md`（新） | 產物，不計入 LOC |
| M6 路徑修復：`src/` 6 檔、`AGENTS.md`、`TODO.md`、`data-collection-guide.md` 等 | 每處改一個路徑，行數不變 |
| `docs/INDEX.md`、`docs/health-check/TODO.md` 新條目 | +30 |

Semantics this may change: **無執行期行為變更。** 不動任何渲染輸出，不動 `src/data/*.json`。
`src/` 的改動只限註解內的路徑字串。

## Acceptance criteria

**AC-1 — M 層恰為 M1–M6，且不與既有網子重疊。**
Verified by: `node scripts/content-audit.mjs rules` 印出恰好六個代號。
`tests/content-audit.test.mjs` 的非重疊測試：把「某學者」「釋字第272號」「目前仍須10人參與評議」三個單元餵給 `check`，三者都不產生任何 M 層失敗。
會失敗的改動：在 M 層加入佔位字串規則，或把 272 列為禁用號次，或把時態詞加進 M3。

**AC-2 — M1 抓得到不存在的號次，含 `063` 的歷史錯號。**
Verified by: 測試以單元字串斷言：`114年憲判字第9號`、`114憲判9`、`１１４年憲判字第９號`、`釋字第814號` 皆失敗；`114年憲判字第1號`、`釋字第 261 號`、`釋字第781~783號` 皆通過。
且 `check` 在 `a5786cc` 上 M1 為零失敗。
會失敗的改動：正規化不處理全形或 `憲判` 簡寫，或號次上限寫死而非讀 fixture。

**AC-3 — M2 在 git 歷史上重現 `065` 的錯誤。**
Verified by: 在 `06ddfb1`（`065` 修正前）的 worktree 上執行本票的 `check`，M2 報出 `src/app/present/page.tsx:18`（年份 2024，號次作成於 2025）。
在實作分支上同一條規則不報這一行。
會失敗的改動：M2 只掃 `src/data/` 而不掃 `.tsx` 內的物件常值。

**AC-4 — M3 守住門檻數值與 `ruling-threshold.ts` 一致。**
Verified by: 測試把「至少11人參與評議」「至少8人同意」「十一人門檻」各餵一次，皆失敗；「至少10人參與評議、至少9人同意」通過。且 `check` 在實作分支上 M3 為零失敗。
會失敗的改動：M3 的期望值寫死為 10／9，而非 import `RULING_THRESHOLD.voidedFloor`——測試另以修改後的替身常值驗證期望值有跟著變。

**AC-5 — M4 抓到 `TIMELINE_EVENTS` 的順序錯誤。**
Verified by: `check` 在實作分支上報出 `src/data/controversy-timeline.ts` 的 `evt-09`→`evt-10`。測試另斷言 `2025-02-30` 與「`dateLabel` 2024年5月17日／`date` 2024-05-18」皆失敗。
會失敗的改動：M4 只驗日期格式、不驗順序。

**AC-6 — M5 抓到種子二在 `/future` 上的具體位置。**
Verified by: `check` 在實作分支上報出 `src/components/future/RulingThresholdNote.tsx:55` 與 `src/data/threshold-analysis.ts:238`。
測試斷言「民國 90 年（2001 年）4 月，另見 1952-04-16」通過、「民國 90 年 4 月，另見 1952-04-16」失敗。
會失敗的改動：`.tsx` 抽取不代入 `VOIDED_FLOOR_FULL`——那一段就只剩民國年，M5 不會成立。

**AC-7 — M6 抓到種子三，且修復後歸零。**
Verified by: implement 在修復前先跑一次 `check`，stage report 貼出 M6 輸出，須含 `docs/content-pipeline/data-collection-guide.md:98`、`docs/health-check/TODO.md:431`、`src/app/layout.tsx:8`、`AGENTS.md:61`。
修復後 M6 零失敗，且 `docs/content-pipeline/operations.md` 從未被報（它從未存在，不是被封存）。
另在修復後跑 `056` 的 `G-7` 正本，仍印 `G-7 PASS`。
會失敗的改動：M6 只認 `docs/` 開頭的路徑——`TODO.md` 的 9 處相對路徑會漏掉。

**AC-8 — 閱讀清單把種子一集中在同一組（end value）。**
Verified by: `node scripts/content-audit.mjs reading-list` 的輸出中，同一個 L1 組內同時出現 `src/data/controversy-timeline.ts:156`、`:180` 與 `src/data/quizzes/controversy.ts:87`。
會失敗的改動：詞彙群漏掉「否決」或「同意權」，或 L1 以檔案分組而不是以事實分組。

**AC-9 — H 層涵蓋每一個含讀者中文的檔。**
Verified by: 測試比對「抽取器回報含中文單元的檔案集合」與「`reading-list` 的 H 節列出的檔案集合」，兩者相等（基準：今日 66 檔；以抽取器實際輸出為準，不寫死）。
會失敗的改動：H 節只列 `PUBLIC_PAGES` 的檔，或抽取器新增檔案類型而 H 節沒跟上。

**AC-10 — 禁區未動，既有行為未回歸。**
Verified by:
1. `shasum -a 256 src/data/*.json` 與基準相同：`discussions.json` = `4071978a…3162`，`history.json` = `4d1992e3…ea3b`（本階段實跑）。
2. `node --test tests/threshold-analysis.test.mjs` 通過，且 `tests/fixtures/interpretation-dates.json` 位元組不變。
3. `npx tsc --noEmit` 通過（先 `rm -rf .next`，理由見 `056` 的 G-8 補述）。
4. `src/app/layout.tsx` 的 `robots: { index: false, follow: false }` 仍在。
會失敗的改動：執行 `npm run sync-content`、手改 `.json`、或重抓 `interpretation-dates.json`。

## Test plan

- `node --test tests/content-audit.test.mjs`：AC-1、AC-2、AC-4、AC-5、AC-6、AC-9 的單元案例。
- `node scripts/content-audit.mjs check`：實作分支上預期離開碼 1，失敗集合寫進 stage report。
- AC-3：`git worktree add` 到 `06ddfb1` 後，以實作分支的腳本對該 worktree 執行。
- AC-10 的四項。
- **不執行 `npm run sync-content`。** 不需要 dev server。

## Documentation impact

### 現在更新

無。本階段只決定方向，沒有改變任何現行計畫或文件描述的現況。
M6 的路徑修復必須等 `check` 先證明抓得到（AC-7），所以放在實作後。

### 實作後更新

| 文件 | 完成條件 | 更新內容 |
|---|---|---|
| `docs/INDEX.md` | AC-1 至 AC-9 通過 | 「驗證腳本」表加 `scripts/content-audit.mjs` 與 `scripts/fetch-judgment-dockets.mjs`；新增閱讀清單一列，狀態 `plan` |
| `docs/health-check/TODO.md` | `check` 的失敗集合已確定 | M4、M5 的每一項與種子一（L1）各開一條待辦，寫明修正途徑（PR 或試算表）；另記紀年慣例待 captain 決定；另記第三節末的 `/past/thresholds` 門檻期問題 |
| `docs/health-check/TODO.md` P3-8 | captain 同意第十節第 3 項 | 另加一條上線條件，指向本票。不改動引用 `056` 的那一條 |
| M6 報出的每一個 `evergreen`／`plan` 文件與 `AGENTS.md` | AC-7 的修復前輸出已貼進 stage report | 把舊路徑改為 `_archive/` 下的實際路徑。只改路徑，不改敘述 |
| `docs/content-audit/2026-MM-DD-reading-list.md`（新） | AC-8、AC-9 通過 | `reading-list` 的輸出快照，檔頭寫明產生時的 commit 與重跑指令 |

### 不更新

| 文件 | 理由 |
|---|---|
| `docs/constitution-features/_archive/056-pre-launch-checklist.md` | 已封存。gate 表屬記錄，不追加 G-9 |
| `scripts/check-voided-floor.mjs` | `066` 的網子。本票不修改、不重疊 |
| `tests/fixtures/interpretation-dates.json`、`tests/threshold-analysis.test.mjs` | `012` 的網子。只讀 |
| 狀態為 `record` 的文件、所有 `_archive/**` | 記錄，不改寫。M6 也不掃它們 |
| 進行中的 workflow 票（`040`、`049`、`055`、`057` 等）內的舊路徑 | 由各票自己的 stage 負責。M6 不掃 workflow 票 |
| `src/data/*.json` | 產物。其中的內容問題走試算表 |

### Feedback Cycles

## Out of scope

- 修正任何法律內容。見 Proposed approach。
- 佔位字串、釋字第272號、`h34`／`h35`、具名大法官出處、10 人下限時態、門檻視覺化件數。見第一節。
- 判斷內容是否為 AI 生成。那是 `051` 的範圍。本票對所有讀者看得到的中文一視同仁。
- 從未存在的文件路徑（例如標註「新增」的 `operations.md`）。它們不是法律內容，也不是封存造成的斷鏈。

## Stage Report: design

- DONE: Read 056's final checklist (_archive/056-pre-launch-checklist.md) and write down exactly what it already covers; 067's scope is only what 056 leaves uncovered — no second net over the same ground.
  Design 第一節：G-1–G-8 逐項對照，另列 `066` 的 `check-voided-floor.mjs` 與 `012` 測試兩個非 056 的既有網子；結論是 056 對內容正確性只守釋字第272號一個號次。AC-1 以非重疊測試（某學者／272／門檻時態三個單元不得觸發 M 層）使這條界線可失敗。
- DONE: Draw the machine-checkable vs human-read boundary per content category (e.g. ruling numbers exist, dates in legal range, thresholds match ruling-threshold.ts vs causal narrative, tense, tone), with evidence for each placement; acceptance criteria each carry a falsifiable Verified by, and at least one measures the end value — the check or reading list actually surfaces the known seeds (controversy-timeline.ts:156 vs evt-11 contradiction, mixed ROC/AD years, docs paths pointing at archived 063).
  第二、三節：界線改為 M／L／H 三層，進 M 層需「repo 內權威來源＋真實錯誤實例」兩項證據；13 個類別逐一附證據。三個種子皆在 `a5786cc` 上以暫存 spike 實跑命中：L1 詞彙群 16 句含 `:156`／`:180`（另發現第三處 `quizzes/controversy.ts:87`）→ AC-8；M5 命中 `/future` 的 `RulingThresholdNote.tsx:55` → AC-6；M6 命中 `data-collection-guide.md:98`、`TODO.md:431` → AC-7。AC-1–AC-10 各附會失敗的改動；AC-3 以 git 歷史 `06ddfb1` 重現 `065` 的錯誤。
- DONE: Split documentation impact into 現在更新 / 實作後更新 / 不更新, each listing documents or 無; any 現在更新 entry states direction, not-yet-implemented status, and verification target.
  現在更新為「無」並附理由（路徑修復必須等 M6 先證明抓得到）；實作後更新 5 列各附完成條件；不更新 6 列。

### 本階段實跑的新發現（未修，供 FO 判斷）

1. `TIMELINE_EVENTS` 的 `evt-09`（2024-12-20）排在 `evt-10`（2024-10-31）之前，`/controversy-timeline`（PUBLIC）依陣列順序渲染。
2. `src/app/layout.tsx:8` 與 `AGENTS.md:61`——noindex 綁定本身——指向 `056` 封存前的路徑；`TODO.md` 另有 9 處相對路徑同樣失效。已在副本上實測改為 `_archive/` 路徑後 `G-7` 仍 PASS。
3. `src/data/threshold-analysis.ts:323-336` 把已失效的 10 人 9 人標為 `id: 'current'`、`effectiveTo: null`，`/past/thresholds` 無任何失效敘述；`066` 的檢查未跑該路由。
4. `quizzes/controversy.ts:87`「立法院拒絕行使大法官人事同意權」與 `future.ts:416`「投票否決全部人選」互斥，是種子一的第三個位置。

### Summary

界線畫成三層：M 層六條規則（號次存在、號次年份配對、門檻數值、日期與順序、同段紀年混用、封存路徑），L 層四份定位清單（同一事實的全部敘述、號次與案名、現在式法律狀態、紀年盤點），H 層為 21,841 字、66 檔的逐頁閱讀清單。implement 只建工具與修封存路徑，不修法律內容，故 `check` 結束時預期離開碼 1。要 captain 決定的三項（紀年慣例、H 層由誰讀、是否綁進上線條件）都有預設值，不阻擋 implement。
