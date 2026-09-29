---
id: 068
title: 門檻分析頁把已失效的 10 人／9 人門檻標為現行
status: implement
source: constitution-features/067 design 新發現第 3 項（captain 2026-09-29 核准開票）
started: 2026-09-29T17:14:59Z
completed:
verdict:
score: 0.85
worktree: .worktrees/spacedock-ensign-threshold-page-voided-quorum-current
issue:
pr:
mod-block:
---

`/past/thresholds`（公開頁）把已失效的評議門檻當成現行法呈現。讀者會帶著錯誤的法律認知離開。

## Problem

067 design 實查（2026-09-29，`a5786cc`）：`src/data/threshold-analysis.ts:323-336` 把已失效的 10 人出席／9 人同意門檻標為 `id: 'current'`、`effectiveTo: null`，`/past/thresholds` 頁面上沒有任何失效敘述。

這與 `066`（quiz 與 controversy-timeline 把已失效的 10 人門檻當現行法）是同一型錯誤，但 `066` 的 `check-voided-floor.mjs` 沒有跑這條路由。修正會牽動 `012`（解釋門檻與案件數量關聯視覺化）的既有測試，所以不能在 `067` 裡順手處理。

design 要決定：失效的起訖日與依據（以一手來源查證，不從站內其他頁轉引）、頁面上怎麼呈現「曾經適用、現已失效」、`012` 的測試怎麼改而不失去它原本守的東西、`066` 的檢查是否要涵蓋此路由。

## Proposed approach

把 10 人 9 人這一期改成「有起點、有終點」的歷史時期，並在圖尾補上 2025-12-19 之後實際適用的條文。
讀者在三個地方看得到失效：時期卡片、「這張圖不包含什麼」一節、桌機圖尾的引線註解。
前兩處在行動版與桌機都看得到。

1. **資料層**（`src/data/threshold-analysis.ts`）。
   該期的 `effectiveTo` 由 `null` 改為 `RULING_THRESHOLD.voidedFloor.voidedOn`，並掛上 `voided` 欄位，指向 `src/data/ruling-threshold.ts` 的同一個物件。
   新增 `RESTORED_SEGMENT`（2025-12-19 起、`effectiveTo: null`），條文為第 30 條第 1 項。
   該期的 id 由 `'current'` 改為 `'fixed-floor'`。
2. **呈現層**。時期卡片在條文原文下接 `VOIDED_FLOOR_CLAUSE`；`SeriesBoundaryNote` 新增一格，交代失效依據與此後適用的條文，並附判決連結。
   圖上新增第六條色帶，引線註解由兩行改三行。`b3` 的標題刪去「現行」。
3. **失效句不重寫。** 一律 import `ruling-threshold.ts` 的常數，守住 `066` AC1 的「唯一定義處」。
4. **`012` 的測試**：改名是機械替換；另加四條守 068 的新測試。逐條對照見 Design 第五小節。
5. **`066` 的檢查**：要涵蓋此路由。不改腳本，改的是「跑哪些路由」的紀錄。理由見 Design 第六小節。

施工順序：**`067` 合併之後才開始 implement。** 理由見 Design 第九小節。

## Risk evidence

本階段做了 spike，全部在 scratchpad 的副本內，主 repo 未動。

1. **一手來源重查（2026-09-29，`curl` 原文）。** 114 年憲判字第 1 號主文第一項：
   114-01-23 修正公布之憲法訴訟法第 4 條第 3 項、**第 30 條第 2 項至第 6 項**及第 95 條，「均牴觸憲法，應自本判決公告之日起失其效力」。
   判決摘要記載「判決公告日期114年12月19日」。全國法規資料庫（整編截止 115-09-18）第 30 條仍原樣列出第 2 至 6 項，無失效標註；第 1 項與 2019-01-04 版逐字相同。詳見 Design 第一小節。
2. **讀者今天看到的內容（hydration 後量測）。** 以 Design 第七小節的探針掛載頁面：時期卡片顯示「2025-01-23 — 至今」，「這張圖不包含什麼」第 3 項標題為「現行 10 人 9 人條件⋯」，全頁「失其效力」0 處。
3. **原型驗證（副本內）。** 依本設計改 5 個檔（+81/−18，不含新測試與頁面文案）後：
   `npx tsc --noEmit` exit 0；`012` 套件 33 條 32 pass、1 skip（AC-6 線上比對）；
   `check-voided-floor.mjs` 七條路由 exit 0（改動前 exit 1）；探針量到失效句 2 處、行動版與桌機皆可見。
4. **陷阱一：不放行 LaunchGate 時，檢查腳本對這一頁假性通過。** 對未改動的 dev server 跑 `/past/thresholds`，輸出「下限數字出現 0 次」、三項全 PASS、exit 0。放行後同一頁為 16 次、檢查 2 FAIL。
5. **陷阱二：main 上的 `012` 測試目前完全沒有執行。** `tests/threshold-analysis.test.mjs:141` 讀 `docs/constitution-features/012-threshold-case-analysis.md`，該檔已於 `bbe0bc3`（2026-09-25）移入 `_archive/`。main 上執行結果為「tests 1／fail 1」，33 條守衛一條都沒跑。`067` 的 worktree 已以 `1faa286` 修正此路徑。
6. **陷阱三：無頭瀏覽器仍不可用。** 本機 Chrome 154 在沙箱內 `dlopen` 被擋；`012`、`063` 已記錄 Chrome for Testing 會 `SEGV`。jsdom 跑完整 Next 客戶端 bundle 也失敗（`document.currentScript` 為 null，補上後不 hydrate、不報錯）。因此端值改用 Design 第七小節的掛載探針。

## Expected surface and tolerance

Estimate: 約 +235／−40 行，跨 7 個檔，tolerance ±40%。
原型已量到其中 5 個檔 +81／−18（不含新測試、頁面文案、分界線標籤與 `<desc>`）。

| 檔案 | 估計 | 內容 |
|---|---|---|
| `src/data/threshold-analysis.ts` | +45／−8 | import、`voided` 欄位、id 改名、`effectiveTo`、`RESTORED_SEGMENT`、`b3`、檔頭規則 1 的補述 |
| `src/components/threshold-analysis/ThresholdChart.tsx` | +25／−3 | 第六條色帶、引線註解第三行、`<desc>` 補失效句 |
| `src/components/threshold-analysis/ThresholdBoundary.tsx` | +4／−1 | 桌機標籤在 `voided` 時加「（已失效）」 |
| `src/components/threshold-analysis/EraComparisonStrip.tsx` | +14／−0 | 「已失效」標記與失效句 |
| `src/components/threshold-analysis/SeriesBoundaryNote.tsx` | +30／−0 | 失效與此後條文的一格，附判決連結 |
| `src/app/past/thresholds/page.tsx` | +8／−3 | 起訖日來源的句子、資料來源一列 |
| `tests/threshold-analysis.test.mjs` | +110／−25 | 改名、色帶標題清單、四條新測試 |

**Semantics this may change:**

- `ThresholdEra['id']` 的聯集：`'current'` → `'fixed-floor'`。行動版的 `selectedEraId` 狀態值隨之改變，無持久化，無外部引用。
- `ThresholdEra` 新增選填欄位 `voided`。`effectiveTo` 的定義由「下一期公布日」擴為「本期終止日：下一期公布日，或宣告失效的判決公告日」。
- 新增匯出 `RESTORED_SEGMENT`。`012` 的 c3 測試以匯出宣告數比對掃描面，新增 `export const` 會自動納入。
- 圖上色帶由 5 條變 6 條。斜線網底的語意不變，仍只表示「這段沒有釋字資料」。
- `threshold-analysis.ts` 開始 import `ruling-threshold.ts`。後者不 import 任何本地模組，不構成迴圈。

## Acceptance criteria

**本節的規則沿用 `066`：同一個檢查只定義一次。** 重用時寫「同 AC-n」，不複製指令。
探針的全文只在 Design 第七小節；`check-voided-floor.mjs` 的全文只在 repo 內。

**AC-1（端值）— 讀者在 hydration 後的 `/past/thresholds` 看得到 10 人 9 人已失效，行動版與桌機皆然。**
Verified by: 在候選 repo 上，以 Design 第七小節的探針各跑一次（不設 `MOBILE`、設 `MOBILE=1`），`NEEDLES` 為下列五串：

| # | needle | 通過條件 | 改動前基線（2026-09-29 實測） |
|---|---|---|---|
| N1 | `該下限已由 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力` | 元素 ≥ 2，行動版可見 ≥ 2，桌機可見 ≥ 2 | 0／0／0 |
| N2 | `2025-01-23 — 2025-12-19` | 元素 ≥ 1，兩版皆可見 ≥ 1 | 0 |
| N3 | `2025-12-19 起，10 人 9 人不再適用` | 元素 ≥ 1，兩版皆可見 ≥ 1 | 0 |
| N4 | `2025-01-23 — 至今` | 元素 = 0 | 1（兩版可見） |
| N5 | `現行 10 人 9 人` | 元素 = 0 | 1（兩版可見） |

另須輸出「對照 SSR 0 字元」且「掛載後文字」> 0。這一行證明量到的是 effect 執行之後的 DOM，不是 SSR。
N1 的字串就是 `VOIDED_FLOOR_CLAUSE` 的值；若 `ruling-threshold.ts` 日後改了措辭，以該常數當時的值為準，不改本 AC 的語意。
會失敗的改動：
1. 失效句只放在桌機的引線註解（`hidden md:block`）— N1 行動版可見 < 2。
2. 只在 `SeriesBoundaryNote` 加一格、時期卡片不動 — N1 元素 = 1，N4 仍為 1。
3. `effectiveTo` 維持 `null`、只加文字 — N2 = 0、N4 = 1。

**AC-2 — `066` 的檢查涵蓋 `/past/thresholds`，七條路由全數通過。**
Verified by: 以 `_archive/066-quiz-timeline-voided-quorum-present-tense.md` 第 8.1 小節的副本作法（LaunchGate 放行）起 dev server，執行 `node scripts/check-voided-floor.mjs` 於 `066` 的六條路由加 `/past/thresholds`，`exit 0`。
且 `/past/thresholds` 的輸出行「下限數字出現 N 次」須 N ≥ 1。N = 0 表示沒有放行 LaunchGate，該次執行作廢。
基線（2026-09-29 實測，放行後）：`/past/thresholds` 檢查 2 FAIL（0 筆），下限數字 16 次，`exit 1`；其餘六條全 PASS。未放行時同一頁為 0 次、三項全 PASS、`exit 0`（假性通過）。
會失敗的改動：時期卡片不接失效句 — 檢查 2 回到 FAIL。為了通過而改腳本的 regex — review 須比對 `scripts/check-voided-floor.mjs` 與 main 逐位元相同。

**AC-3 — 資料層不再把已失效的條文標成開放期間。**
Verified by: `node --test tests/threshold-analysis.test.mjs` 中 Design 第五小節的新測試 T-A、T-B 通過；且
`grep -n "'2025-12-19'" src/data/threshold-analysis.ts` 回傳 0 筆（失效日由 `RULING_THRESHOLD` 推導，不手寫）。
會失敗的改動：`effectiveTo: null`（T-A 紅）；手寫 `effectiveTo: '2025-12-19'`（grep 1 筆，T-A 的物件同一性斷言紅）；`RESTORED_SEGMENT` 漏掉或另設第二個開放期間（T-B 紅）。

**AC-4 — `012` 原有的守衛全數保留，且仍會失敗。**
Verified by:
1. `node --test tests/threshold-analysis.test.mjs`：`fail 0`；`tests` = 33 ＋ 新增數（Design 第五小節為 4 條，即 37）；`skipped` 僅 AC-6 線上比對 1 條。
2. 四個反向改動，各自只讓指定的測試轉紅（逐一套用、逐一還原，stage report 列出每次的紅燈測試名）：

| 反向改動 | 應轉紅 |
|---|---|
| `ThresholdChart` 傳給 `fixed-floor` 色帶的 `hatched` 改 `false` | `AC-5 … 斜線網底 …` |
| `SERIES_BOUNDARY_NOTES` 的 `b3` body 加「（約 11 位大法官）」 | `c3 豁免按產生者發 …` |
| `b3` heading 前加回「現行」 | T-C |
| 時期卡片拿掉失效句 | T-D |

會失敗的改動：改名時漏改某個 `'current'` 錨點 — `eraOf` 回 `undefined`，多條測試轉紅；為了變綠而刪斷言 — 第 1 點的 `tests` 數會少。

**AC-5 — `066` 的「失效句唯一定義處」不變。**
Verified by: 同 `_archive/066-quiz-timeline-voided-quorum-present-tense.md` AC1 的兩條 grep。第一條的每筆命中仍只在 `src/data/ruling-threshold.ts`；第二條的檔案清單須新增 `EraComparisonStrip.tsx`、`SeriesBoundaryNote.tsx`、`ThresholdChart.tsx`、`threshold-analysis.ts`。
會失敗的改動：在卡片或註記裡手寫一次「起失其效力」。

**AC-6 — 頁面與資料模組不再宣稱「起訖日一律取自法規公布日」。**
Verified by:
1. `grep -c '起訖日一律取自法規公布日' src/app/past/thresholds/page.tsx` = 0，且該段改寫後含 `RULING_THRESHOLD.voidedFloor` 推導出的失效日（以 AC-1 的探針加 needle `判決公告日` 驗證元素 ≥ 1）。
2. `grep -c '門檻時期的起訖日一律用法規公布日' src/data/threshold-analysis.ts` = 1（原句保留），且同一檔頭新增一段標日期的補述，說明終點可為判決公告日。
會失敗的改動：悄悄改寫檔頭規則 1 的原句（第 2 點為 0）；頁面文案沒改（第 1 點為 1）。

**AC-7 — 禁區未動、既有行為未回歸。**
Verified by:
1. `shasum -a 256 src/data/*.json` 與基準相同：`discussions.json` = `4071978a…3162`，`history.json` = `4d1992e3…ea3b`。
2. `shasum -a 256 tests/fixtures/interpretation-dates.json` 改動前後相同。
3. `src/app/layout.tsx` 仍有 `robots: { index: false, follow: false }`。
4. `npx tsc --noEmit` exit 0。
5. `RULING_THRESHOLD.headcount` 仍為 `null`；新文案不含任何由比例換算的人數（由 AC-4 第 1 點的 c3 兩條測試承擔）。
會失敗的改動：執行 `npm run sync-content`；在 `RESTORED_SEGMENT` 的文案寫出「至少 N 人」。

## Test plan

不得執行 `npm run sync-content`。不得手改 `src/data/*.json`。

1. `npx tsc --noEmit`（AC-7）。
2. `node --test tests/threshold-analysis.test.mjs`（AC-3、AC-4）。**必須在 `067` 合併後的 main 上跑**；在今天的 main 上，這個套件因 `SPEC_PATH` 指向已封存的路徑而整檔載入失敗（「tests 1／fail 1」）。
3. AC-4 第 2 點的四個反向改動，逐一套用、跑測試、還原。
4. 探針（AC-1、AC-6）：依 Design 第七小節在 scratchpad 裝 jsdom，於候選 repo 上跑兩次（桌機、`MOBILE=1`）。
5. `npm run dev` 的副本（LaunchGate 放行）＋ `scripts/check-voided-floor.mjs` 七條路由（AC-2）。**先確認 `/past/thresholds` 的「下限數字出現」≥ 1**，否則該次執行作廢。
6. 桌機版面的人工檢查：引線註解第三行在 `PLOT_H + 66`，距 SVG 底緣 6px。本環境沒有可用瀏覽器，implement 與 verify 都驗不到是否被裁切。**交 captain 在 `npm run dev` 後以瀏覽器開 `/past/thresholds` 目視確認**，不列為 AC。

## Documentation impact

### 現在更新

無。

理由：本階段只產規格，未施工。候選的 evergreen 文件有三份，現在寫都會出錯：

- `docs/health-check/TODO.md`：`067` 的 implement 正在同一檔改 24 行，並依其 Documentation impact 新增一列 `/past/thresholds` 門檻期問題。現在在 main 另寫一列會與 `067` 衝突，也會出現兩列描述同一件事。
- `docs/project/design-system.md`、`docs/INDEX.md`：要改的內容（三段網底、七條路由）取決於 implement 的結果。現在寫會把預定行為寫成現況。

本階段查到的三個陷阱（Risk evidence 第 4 至 6 點）留在本 entity 內，由 FO 在 gate 轉達。

### 實作後更新

| 文件 | 要改什麼 | 現況 |
|---|---|---|
| `docs/INDEX.md` 的 `scripts/check-voided-floor.mjs` 列 | 用法補兩件事：一、已知須涵蓋的七條路由（含 `/past/thresholds`）；二、須對 LaunchGate 放行的副本執行，否則對 client component 頁面假性通過（Risk evidence 第 4 點）。更新「最後查核」日期 | 已定方向，尚未實作。驗證目標＝AC-2 |
| `docs/project/design-system.md` 第 35 節 | 「目前用在 2022-01-04 之後的兩段」改為三段，並寫明第三段起於 2025-12-19 | 已定方向，尚未實作。驗證目標＝AC-3 的 T-B |
| `docs/health-check/TODO.md` | `067` 新增的 `/past/thresholds` 門檻期那一列，標記由 `068` 解決，附合併 PR。原文保留，追加補述 | 已定方向，尚未實作。前提是 `067` 已合併。驗證目標＝AC-1 |

### 不更新

| 文件 | 理由 |
|---|---|
| `docs/constitution-features/_archive/012-threshold-case-analysis.md`、`_archive/066-…md`、`_archive/063-…md` | `record`，不改寫。`012` 的「四期」與 id `current` 是當時的定案，本票的更動記在本 entity |
| `docs/project/architecture.md` | 第 33–38 行寫「四個時期的表決門檻」。`ERAS` 仍為四期，敘述仍正確 |
| `docs/constitution-features/systematic-chinese-content-legal-audit.md` | `067` 的 entity，另一位 ensign 正在作業 |
| `AGENTS.md`、`CLAUDE.md` | 本票不新增規則。「不得用 `sort \| uniq` 判定中文」已由 `066` 記錄 |
| `src/data/*.json` | 產物。見 `CLAUDE.md` 絕對不要做的事第 2 條 |

### Feedback Cycles

## Out of scope

- `067` 發現的其他三項（大事記 evt-09／evt-10 順序、quiz 與 future 對人事同意權的矛盾敘述、封存路徑）。
- 全站系統性查核——那是 `067`。

## Design

本節是 implement 的完整施工依據。行號以 main `d3d9551` 為準；`067` 合併後會位移，以內容定位。

### 一、一手法律事實（本階段重查，不從站內轉引）

2026-09-29 以 `curl` 取原文。

| 事實 | 一手來源 | 原文 |
|---|---|---|
| 10 人 9 人條文的公布日 | 114 年憲判字第 1 號主文第一項 | 「中華民國114年1月23日修正公布之憲法訴訟法⋯⋯第30條第2項規定：『前項參與評議之大法官人數不得低於10人。作成違憲之宣告時，同意違憲宣告之大法官人數不得低於9人。』」 |
| 失效的範圍與理由 | 同上 | 第 4 條第 3 項、**第 30 條第 2 項至第 6 項**、第 95 條「立法程序有明顯重大瑕疵，違背憲法正當立法程序，且違反憲法權力分立原則，均牴觸憲法，應自本判決公告之日起失其效力」 |
| 失效日 | 判決頁「判決日期 114年12月19日」；判決摘要「判決公告日期114年12月19日」 | 2025-12-19 |
| 失效後適用的條文 | 全國法規資料庫 `LawSingle.aspx?pcode=A0030159&flno=30`（整編截止 115-09-18） | 第 1 項：「判決，除本法別有規定外，應經大法官現有總額三分之二以上參與評議，大法官現有總額過半數同意。」與 2019-01-04 版（`INTERIM_SEGMENT.quotedText`）逐字相同 |

來源網址：判決 `https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=355485`（即 `RULING_THRESHOLD.voidedFloor.rulingUrl`）。

**結論與站內既有結論一致。** `src/data/ruling-threshold.ts` 的 `voidedFloor`（`voidedOn: '2025-12-19'`、`voidedBy: '114 年憲判字第 1 號'`）正確，本票直接引用，不另立。

**查證陷阱（本階段複驗仍成立）：** 全國法規資料庫的第 30 條頁面今天仍列出第 2 至 6 項，沒有任何失效標註。本頁的資料來源一節引用該資料庫，讀者點過去會看到失效條文。因此頁面要寫一句提醒（第四小節 4.5）。

**不處理的爭議。** 該判決由 5 位大法官作成，另 3 位拒絕參與評議。站上 `063`／`066` 已依判決主文敘述失效，captain 已核准。本票沿用同一立場，不在本頁評論判決的正當性，也不寫出任何由比例換算的人數（`063` 的 L1／L2 仍未拍板，`headcount` 為 `null`）。

### 二、頁面現況：讀者今天看到什麼

量測方式為第七小節的探針（effect 已執行，非 SSR）。

| 位置 | 讀者看到的 | 問題 | 行動版 | 桌機 |
|---|---|---|---|---|
| `EraComparisonStrip.tsx:87` | 「2025-01-23 — 至今」 | `effectiveTo: null` 渲染成「至今」 | 可見 | 可見 |
| `threshold-analysis.ts:559-563`（`b3`） | 標題「現行 10 人 9 人條件落在釋字序列結束之後」 | 明寫「現行」 | 可見 | 可見 |
| `ThresholdChart.tsx:132-149` | 10 人 9 人色帶一路畫到 2026 年底 | 2026 年的 6 件判決長條落在失效條文的色帶上 | 可見 | 可見 |
| `ThresholdChart.tsx:247` | 「2025-01-23 10 人 9 人／兩段皆無釋字資料」 | 無終點 | 隱藏 | 可見 |
| `ThresholdBoundary.tsx:61` | 「10 人 9 人：參與評議不得低於 10 人⋯」 | 無失效標記 | 隱藏 | 可見 |
| `page.tsx:39` | 「門檻的起訖日一律取自法規公布日」 | 修正後此句不成立：終點 2025-12-19 是判決公告日 | 可見 | 可見 |
| 全頁 | 「失效」「失其效力」「2025-12-19」 | 0 處 | — | — |

### 三、資料層（`src/data/threshold-analysis.ts`）

1. 檔頭加 `import { RULING_THRESHOLD } from './ruling-threshold';`。
2. `ThresholdEra['id']`：`'current'` → `'fixed-floor'`。
   **為什麼改名：** 本頁「現行」一詞正是從這個 id 長出來的。`b3` 的 id 是 `b3-current-no-data`，標題就寫成「現行 10 人 9 人」。id 留著 `current`，下一位維護者會照同一個語意再寫一次。改名範圍小：`src/` 6 處、測試 11 處程式錨點，皆為機械替換。
3. `ThresholdEra` 新增選填欄位：
   ```ts
   /** 本期條文經憲法法庭宣告違憲失效時，指向 ruling-threshold.ts 的唯一定義。沒有失效的時期不帶這個欄位。 */
   voided?: typeof RULING_THRESHOLD.voidedFloor;
   ```
   同時改 `effectiveTo` 的 JSDoc：「本期終止日 ISO：下一期的法規公布日，或宣告本期條文失效的判決公告日。仍適用者為 null。」
4. `ERAS` 第四期：`id: 'fixed-floor'`、`effectiveTo: RULING_THRESHOLD.voidedFloor.voidedOn`、`voided: RULING_THRESHOLD.voidedFloor`。`label`、`ruleSummary`、`quotedText`、`sourceUrl` 不動（條文原文仍正確，它是歷史條文）。
5. `ERA_SPAN_DAYS`：鍵 `current` → `'fixed-floor'`，值仍為 `null`。上方 JSDoc 的「current 期」同步改。
6. 新增匯出（放在 `INTERIM_SEGMENT` 之後）：
   ```ts
   /**
    * 2025-12-19 起適用的門檻：憲法訴訟法第 30 條第 1 項。
    *
    * 第 2 至 6 項經 114 年憲判字第 1 號宣告違憲，自判決公告日起失其效力，
    * 此後只剩第 1 項。條文文字與 INTERIM_SEGMENT 逐字相同（2026-09-29 以全國法規資料庫核對）。
    * 起點與條文都由 RULING_THRESHOLD 推導，不另寫一次。
    * 該段沒有釋字資料可計，與 INTERIM_SEGMENT 一樣畫斜線網底。
    */
   export const RESTORED_SEGMENT: StatuteSegment = {
     id: 'restored-2025',
     label: '憲訴法第 30 條第 1 項',
     ruleSummary: '現有總額 2/3 參與評議，現有總額過半數同意',
     statute: '憲法訴訟法',
     effectiveFrom: RULING_THRESHOLD.voidedFloor.voidedOn,
     effectiveTo: null,
     article: '第 30 條第 1 項',
     quotedText: `${RULING_THRESHOLD.rule}。`,
     sourceUrl: LAW_CURRENT_URL,
     evidence: 'primary-source',
     colorToken: '#9CA3AF',
   };
   ```
   **不是第五期。** `ERAS` 的四期帶年均統計，`STATS.length === 4` 是既有斷言。本段與 `INTERIM_SEGMENT` 同型。
   **`label` 不寫「現行」。** 寫法一律帶時間錨（「2025-12-19 起」），比照 `066` AC3。
7. `SERIES_BOUNDARY_NOTES` 的 `b3`：id → `b3-fixed-floor-no-data`；heading → `'10 人 9 人條件落在釋字序列結束之後'`（刪「現行」）；body 不動。
8. 檔頭規則 1（第 12 行）**原句不動**，於第 26 行之後追加補述，比照同檔 2026-09-23 的格式：
   > ⚠️ 2026-MM-DD 補述：規則 1 寫「起訖日一律用法規公布日」。10 人 9 人這一期的**終點**不是法規公布日，是 114 年憲判字第 1 號的判決公告日（2025-12-19）。該判決宣告第 30 條第 2 至 6 項違憲失效，沒有新的法規公布。起點仍一律用法規公布日。原句保留。

### 四、呈現層

#### 4.1 元件階層（只列有改動的節點）

```
src/app/past/thresholds/page.tsx            ← 4.5：起訖日來源一句、資料來源一列
└─ ThresholdCaseAnalysis.tsx                ← 不改
   ├─ ThresholdChart.tsx                    ← 4.3：第六條色帶、引線註解、<desc>
   │  ├─ ThresholdBand.tsx                  ← 不改（props 型別已收 StatuteSegment）
   │  └─ ThresholdBoundary.tsx              ← 4.3：voided 時標籤加「（已失效）」
   ├─ EraComparisonStrip.tsx                ← 4.2：已失效標記＋失效句
   └─ SeriesBoundaryNote.tsx                ← 4.4：新增一格
```

所有元件的 props 介面不變。新資料一律經 `ERAS[i].voided` 與 `RESTORED_SEGMENT` 傳遞。

#### 4.2 `EraComparisonStrip.tsx`（主要端值，兩版皆可見）

- import `VOIDED_FLOOR_CLAUSE` from `@/data/ruling-threshold`。
- 日期列不改程式：`effectiveTo` 有值後自動顯示「2025-01-23 — 2025-12-19」。
- `ruleSummary` 後，比照既有「未確認」「附但書」的標記，當 `era.voided` 存在時加一個標記「已失效」（`bg-red-50 text-[#D32F2F]`，沿用 `docs/project/design-system.md` 的 accent red）。
- 條文原文 `<p>` 之後，當 `era.voided` 存在時加一段：`{VOIDED_FLOOR_CLAUSE}。`，字級同條文原文（`text-[11px]`），色 `text-gray-700`。
  **放在條文原文正後方**，讓「不得低於十人」與失效句落在同一個 150 字視窗內（`check-voided-floor.mjs` 檢查 2 的判準）。
- **不放判決連結。** 整張卡片是一個 `<button>`，按鈕內放 `<a>` 是無效 HTML。連結放在 4.4。

#### 4.3 `ThresholdChart.tsx` 與 `ThresholdBoundary.tsx`（桌機補充）

- 在 `INTERIM_SEGMENT` 的色帶之後畫 `RESTORED_SEGMENT` 的色帶：`x = xForDate(RESTORED_SEGMENT.effectiveFrom)`，`width = PAD.left + PLOT_W - x`，`hatched`，`meanPerYear={null}`，`selected={false}`，`onSelect={() => onSelectEra(null)}`。寬度約 12px，低於 `MIN_LABEL_WIDTH`，不畫標籤。
- 第 4 期色帶的終點由 `effectiveTo` 自動收到 2025-12-19。
- 引線註解由兩行改三行（`fontSize` 10，`textAnchor="end"`）：
  - `PLOT_H + 40`：`{INTERIM_SEGMENT.effectiveFrom} {INTERIM_SEGMENT.label}／無釋字資料`
  - `PLOT_H + 53`：`{fixed.effectiveFrom} {fixed.label}（{fixed.effectiveTo} 失效）／無釋字資料`
  - `PLOT_H + 66`：`{RESTORED_SEGMENT.effectiveFrom} {RESTORED_SEGMENT.label}／無釋字資料`
  其中 `fixed` 以 `eras.find((e) => e.voided)` 取得，不再用 `eras[eras.length - 1]`。第 2 行同時帶 label、起點與「無釋字資料」，`012` AC-5 的 (2)(a) 斷言原樣成立。
- `<desc>` 在四期年均之後、「釋字序列⋯」之前，對每個 `voided` 期追加 `${label}：${VOIDED_FLOOR_CLAUSE}。`。讀螢幕軟體使用者因此也拿得到失效資訊。
- `ThresholdBoundary.tsx:61` 的桌機標籤：`era.voided` 存在時，在 `ruleSummary` 後加「（已失效）」。行動版不改（只顯示年份）。
- 色帶的 `<title>` 格式「{label}（{effectiveFrom} 起）」**不改**。它是 `012` 測試切色帶區段的界標（`BAND_TITLE_RE`），而且只陳述起點，不構成現行主張。

#### 4.4 `SeriesBoundaryNote.tsx`（兩版皆可見，附判決連結）

在既有的 interim 一格之後，對 `ERAS.filter((e) => e.voided)` 每一期各畫一格（今日恰為一格），樣式同 interim 那一格：

- `<h4>`：`{RESTORED_SEGMENT.effectiveFrom} 起，{era.label}不再適用` → 「2025-12-19 起，10 人 9 人不再適用」。
- `<p>`：`{era.statute}{era.article}：{VOIDED_FLOOR_CLAUSE}。此後適用{RESTORED_SEGMENT.statute}{RESTORED_SEGMENT.article}：{RESTORED_SEGMENT.quotedText} 這段沒有釋字可計，圖上畫斜線網底。`
- 連結一：`era.voided.rulingUrl`，文字「憲法法庭 {era.voided.voidedBy}判決」。
- 連結二：`RESTORED_SEGMENT.sourceUrl`，文字「全國法規資料庫 第 30 條」。

新增 prop `restored?: StatuteSegment`，預設 `RESTORED_SEGMENT`，比照既有的 `interim` prop。
第 25 行「以下三項是資料本身的邊界」不改：三項指的是 `SERIES_BOUNDARY_NOTES`，數量不變。

**不用 `VOIDED_FLOOR_FULL`。** 它含「不得低於 10 人」「不得低於 9 人」。`012` 的 c3 站上測試只豁免 10 人 9 人期自己的三個欄位，`VOIDED_FLOOR_FULL` 的人數會被判為換算人數而轉紅。原型已實測 `VOIDED_FLOOR_CLAUSE` 接在 `label` 後面時 c3 維持綠。

#### 4.5 `src/app/past/thresholds/page.tsx`

- import `RULING_THRESHOLD` from `@/data/ruling-threshold`（server component，可直接 import）。
- 第 39 行改為：
  「門檻的起點一律取自法規公布日。10 人 9 人一期的終點 {voidedOn} 取自憲法法庭判決公告日，當天沒有新的法規公布。都不取自任何人的口述年份。」
- 「資料來源」清單在「門檻條文」之後新增一列：
  「門檻失效：憲法法庭 {voidedBy}判決主文第一項，判決公告日 {voidedOn}。全國法規資料庫的第 30 條頁面仍列出已失效的第 2 至 6 項，未加標註；條文是否有效，以判決主文為準。」
- 兩處日期與字號一律由 `RULING_THRESHOLD.voidedFloor` 插值，不手寫。只用西元日期，不與民國年混用（`067` 的 M5 規則）。
- `metadata` 不改（見第十一小節第 2 項）。

### 五、`012` 的測試怎麼改，以及每一條原本守什麼

**前提：`067` 已合併。** 否則套件整檔載入失敗，任何「測試通過」都不成立（Risk evidence 第 5 點）。

#### 5.1 既有測試：只改錨點，守的東西不變

| 測試（行號為 main） | 原本守什麼 | 改法 | 為什麼不會失去守衛 |
|---|---|---|---|
| `AC-1 四個 effectiveFrom …`（:207） | 四期起點＝法規公布日 | 不改 | 起點仍為 2025-01-23 |
| `AC-1 primary-source 的四期 …`（:214） | 四期皆有一手條文 | 不改 | `ERAS.length` 仍為 4 |
| `AC-2 三期年均 …`（:430-445） | 無資料期年均為 null | 標題的「current 期」改字；`ERA_SPAN_DAYS.current` → `ERA_SPAN_DAYS['fixed-floor']`；`statOf('current')` → `statOf('fixed-floor')` | 斷言值不變 |
| `AC-5 … 斜線網底與文字標明無釋字資料`（:696-756） | 該期**自己**的色帶有網底；圖上看得見的文字把該期連到「無釋字資料」；兩個有資料期的年均畫在各自色帶上 | `eraOf` 改名；色帶標題清單末尾加 `'憲訴法第 30 條第 1 項（2025-12-19 起）'`；註解中的引線註解原文同步 | `bandRegion` 仍有下界（interim 色帶緊接其後）；(2)(a) 由引線註解第 2 行滿足，該行仍同時含 label、起點、「無釋字資料」 |
| `AC-5 無障礙描述 …`（:758） | `<desc>` 帶四期年均 | 不改 | 追加的失效句不影響 `includes` 比對 |
| `D2 …`（:1091） | interim 條文逐字核對 | 不改 | — |
| `c3 豁免按產生者發 …`（:1193） | 只有 10 人 9 人期自己的三個欄位與 `b3.heading` 可以帶人數；掃描面由匯出枚舉 | `'current'`／`b3-current-no-data` 改名；註解與訊息的「現行憲訴法」改為「10 人 9 人那一期（2025-01-23 公布，已失效）」 | 路徑豁免的邏輯與第二層限制不變；`RESTORED_SEGMENT` 是 `export const`，匯出宣告數與枚舉根數同步加一 |
| `c3 站上不得出現換算後的人數`（:1249） | 整站（含浮層）除條文用語外不得有人數 | 同上改名 | 新文案用 `VOIDED_FLOOR_CLAUSE`，不含人數；原型實測為綠 |
| 其餘 25 條 | 計數、1987、FACTORS、結構、AC-6／AC-7 | 不改 | 不觸及第四期 |

**不改的語意：** 「唯一可以帶人數的是該期的條文原文」這條 c3 原則不變。改的只是那一期的名字與時態描述。

#### 5.2 新增四條（守 `068`）

以 `const { RULING_THRESHOLD, VOIDED_FLOOR_CLAUSE } = await import('@/data/ruling-threshold');` 取常數。

- **T-A `068 10 人 9 人期有終點，且終點與失效依據出自唯一定義處`**
  `eraOf('fixed-floor').voided === RULING_THRESHOLD.voidedFloor`（物件同一性，不是值相等）；
  `effectiveTo === RULING_THRESHOLD.voidedFloor.voidedOn`；`ERAS.some((e) => e.id === 'current') === false`。
  轉紅條件：`effectiveTo: null`；手寫一份 `voided` 物件；把 id 改回 `current`。
- **T-B `068 只有 2025-12-19 起那一段是開放期間`**
  `[...ERAS, INTERIM_SEGMENT, RESTORED_SEGMENT]` 中 `effectiveTo === null` 的 id 恰為 `['restored-2025']`；
  `RESTORED_SEGMENT.effectiveFrom === eraOf('fixed-floor').effectiveTo`（銜接無缺口）；
  `RESTORED_SEGMENT.quotedText === \`${RULING_THRESHOLD.rule}。\``，且等於 `INTERIM_SEGMENT.quotedText`。
  轉紅條件：漏掉 `RESTORED_SEGMENT`；另一段也留 `null`；條文文字漂移。
- **T-C `068 站上指稱 10 人 9 人期的句段不帶現在式`**
  用本檔既有的 `segmentsOf(htmlToText(…))` 切 `siteHtmlParts()`；凡含 `eraOf('fixed-floor').label` 的句段，不得含 `現行｜至今｜目前｜仍然｜如今｜現在`。
  轉紅條件：`b3` heading 加回「現行」。
  已知盲區：日期列「— 至今」與 label 分屬不同句段，這條抓不到；由 T-A 承擔。
- **T-D `068 失效句出現在時期卡片、邊界註記與無障礙描述`**
  只渲染 `fixed-floor` 那一格的 `EraComparisonStrip`：含 `VOIDED_FLOOR_CLAUSE`，且出現位置在 `id="era-years-fixed-floor"` 之前（不在行動版的收合清單裡）；
  渲染 `SeriesBoundaryNote`：含 `VOIDED_FLOOR_CLAUSE` 與 `RULING_THRESHOLD.voidedFloor.rulingUrl`；
  `renderChart()` 的 `<desc>` 含 `VOIDED_FLOOR_CLAUSE`。
  轉紅條件：任一處拿掉失效句。

### 六、`066` 的檢查要不要涵蓋這條路由

**決定：要涵蓋。不改腳本。**

- `scripts/check-voided-floor.mjs` 沒有內建路由清單，路由由呼叫端給。所謂「涵蓋」，是把 `/past/thresholds` 加進每次執行的路由集合。本票在 AC-2 執行，並在實作後把七條路由寫進 `docs/INDEX.md` 該列。
- 腳本對本頁有效：放行 LaunchGate 後，改動前檢查 2 FAIL、原型 PASS。它能分辨對錯。
- **不把「現行」加進腳本的 `ONGOING`。** 實測 `/quiz/pending` 有正確句子「⋯自2025-12-19起失其效力，現行門檻回到憲法訴訟法第30條第1項的比例計算」，`/future` 有「現行有效的門檻是」。加了會讓兩條已通過的路由誤報。本頁的「現行」由 `012` 的 T-C 守。
- **腳本的已知缺口，記錄不修：** 頁面若完全沒渲染出門檻數字（例如 LaunchGate 未放行），檢查 2 走「沒提就不要求」分支而假性通過。本票以 AC-2 的「下限數字出現 N ≥ 1」擋掉。要不要讓腳本本身對指定路由要求 N ≥ 1，屬 `066` 腳本的語意變更，本票不做，見第十一小節第 1 項。

### 七、驗證工具：hydration 探針（AC-1、AC-6 的唯一定義處）

**為什麼不用 SSR HTML。** `src/components/LaunchGate.tsx:30` 在 effect 執行前回傳 `null`。對 dev server `curl` 本頁，內容區是空的。
**為什麼不用瀏覽器。** 本機沒有可用的無頭瀏覽器（Risk evidence 第 6 點）。jsdom 載入完整 Next 客戶端也不 hydrate。
**本探針的作法。** 在 jsdom 內以 `react-dom/client` 掛載 `<LaunchGate><ThresholdsPage/></LaunchGate>`，用 `React.act` 讓 effect 執行完畢。LaunchGate 的 `ready` 變 `true`、`ThresholdCaseAnalysis` 的 `isDesktop` 依 `matchMedia` 設定。這就是讀者在 hydration 後看到的 DOM。探針同時輸出「同一棵樹不執行 effect」的字元數作對照，必須為 0。
**與真瀏覽器的差距。** 不套 CSS。可見性改由 Tailwind class 推定（`hidden`、`hidden md:block`、`md:hidden`、`[hidden]`）。版面是否裁切驗不到（Test plan 第 6 點）。`next/navigation` 以固定路徑 `/past/thresholds` 的替身取代。

**不入版控，不新增專案相依。** jsdom 裝在 scratchpad：

```bash
SCRATCH=<scratchpad>
mkdir -p "$SCRATCH/tools" && (cd "$SCRATCH/tools" && npm init -y >/dev/null && npm install jsdom@26.1.0)
# 將下方全文存成 "$SCRATCH/hydrated-probe.mjs"
N='該下限已由 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力|2025-01-23 — 2025-12-19|2025-12-19 起，10 人 9 人不再適用|2025-01-23 — 至今|現行 10 人 9 人'
JSDOM_DIR="$SCRATCH/tools" REPO=<候選 repo 根> NEEDLES="$N" node "$SCRATCH/hydrated-probe.mjs"
JSDOM_DIR="$SCRATCH/tools" REPO=<候選 repo 根> NEEDLES="$N" MOBILE=1 node "$SCRATCH/hydrated-probe.mjs"
```

本階段對 main（`d3d9551`）的實跑輸出：

```
對照 SSR 0 字元；掛載後文字 5498 字元；渲染例外 0
NEEDLE "該下限已由 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力" 元素 0，行動版可見 0，桌機可見 0
NEEDLE "2025-01-23 — 2025-12-19" 元素 0，行動版可見 0，桌機可見 0
NEEDLE "2025-12-19 起，10 人 9 人不再適用" 元素 0，行動版可見 0，桌機可見 0
NEEDLE "2025-01-23 — 至今" 元素 1，行動版可見 1，桌機可見 1
NEEDLE "現行 10 人 9 人" 元素 1，行動版可見 1，桌機可見 1
```

`MOBILE=1` 的輸出與上面相同。

對原型（本設計的 5 檔改動，scratchpad 副本）：「對照 SSR 0 字元；掛載後文字 5807 字元」，N1「元素 2，行動版可見 2，桌機可見 2」，N2 為 1／1／1，N4、N5 為 0。
N3 在原型為 0，因為原型的標題寫成「已不再適用」，與 4.4 定案的「不再適用」差一字。這也說明 N3 對措辭敏感：implement 須照 4.4 的字面寫。
可見性判定的對照：原型的引線註解「（2025-12-19 失效）」量得「元素 1，行動版可見 0，桌機可見 1」，符合它在 `hidden md:block` 群組內的事實。

探針全文（sha256 `56e4eeec8f9dc1ca3fc0ec11b6b9a86d1fd9e85cb996c7870d8f2e4b7d9699ea`）：

```js
// 068 驗證用探針，不入版控。以 react-dom/client 在 jsdom 內掛載
// <LaunchGate><ThresholdsPage/></LaunchGate>，讓 useEffect 真的執行
// （LaunchGate 的 ready=true、ThresholdCaseAnalysis 的 isDesktop），
// 量測的是 hydration 之後讀者看到的 DOM，不是 SSR HTML。
//
// 用法：JSDOM_DIR=<含 node_modules/jsdom 的目錄> REPO=<repo 根> \
//       NEEDLES='字串一|字串二' node hydrated-probe.mjs
// 每個 needle 印出：命中元素數、其中行動版可見的數目、桌機可見的數目。
// 可見性依 Tailwind class 判定：`hidden`（無 md: 重新顯示）＝兩版皆隱藏；
// `hidden md:block` 類＝行動版隱藏；`md:hidden`＝桌機隱藏；`[hidden]` 屬性＝皆隱藏。
// 離開碼：渲染例外 → 1；否則 0。判定由呼叫端讀輸出做。
import { registerHooks, createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = path.resolve(process.env.REPO);
const { JSDOM } = createRequire(path.join(path.resolve(process.env.JSDOM_DIR), 'x.js'))('jsdom');
const stubSrc = [
  'export const usePathname = () => "/past/thresholds";',
  'export const useSearchParams = () => new URLSearchParams("");',
  'export const useRouter = () => ({ push() {}, replace() {}, prefetch() {} });',
].join('\n');
const stubUrl = `data:text/javascript,${encodeURIComponent(stubSrc)}`;
registerHooks({
  resolve(spec, ctx, next) {
    if (spec === 'next/navigation') return { url: stubUrl, format: 'module', shortCircuit: true };
    return next(spec, ctx);
  },
});
await import(pathToFileURL(path.join(REPO, 'tests/tsx-loader.mjs')).href);

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/past/thresholds',
  pretendToBeVisual: true,
});
const w = dom.window;
w.matchMedia = () => ({ matches: !process.env.MOBILE, addEventListener() {}, removeEventListener() {} });
w.HTMLElement.prototype.scrollIntoView = () => {};
w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.self = w;
globalThis.IntersectionObserver = w.IntersectionObserver;
globalThis.requestIdleCallback = (cb) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0);
globalThis.cancelIdleCallback = clearTimeout;
for (const k of ['window', 'document', 'navigator', 'localStorage', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia']) {
  Object.defineProperty(globalThis, k, { value: k === 'window' ? w : w[k], configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// react 一律由候選 repo 的 node_modules 解析，與元件用的是同一份。探針放在 repo 外也能跑。
const repoRequire = createRequire(path.join(REPO, 'package.json'));
const React = repoRequire('react');
const { createRoot } = repoRequire('react-dom/client');
const { default: LaunchGate } = await import('@/components/LaunchGate');
const { default: Page } = await import('@/app/past/thresholds/page');
const { renderToStaticMarkup } = repoRequire('react-dom/server');
// 對照組：同一棵樹不執行 effect（等同 SSR）。LaunchGate 的 ready 為 false，應為 0 字元。
const ssr = renderToStaticMarkup(React.createElement(LaunchGate, null, React.createElement(Page)));
const rootEl = w.document.getElementById('root');
const errors = [];
const root = createRoot(rootEl, {
  onUncaughtError: (e) => errors.push(e),
  onCaughtError: (e) => errors.push(e),
  onRecoverableError: (e) => errors.push(e),
});
await React.act(async () => {
  root.render(React.createElement(LaunchGate, null, React.createElement(Page)));
});
await React.act(async () => { await new Promise((r) => setTimeout(r, 50)); });

console.log(`對照 SSR ${ssr.replace(/<[^>]+>/g, '').length} 字元；掛載後文字 ${rootEl.textContent.length} 字元；渲染例外 ${errors.length}`);
for (const e of errors) console.log(`  ! ${String(e).slice(0, 200)}`);

const RESHOW = /^md:(block|inline|inline-block|flex|grid)$/;
function visibility(el) {
  let mobile = true;
  let desktop = true;
  for (let n = el; n && n !== rootEl.parentElement; n = n.parentElement) {
    const c = (n.getAttribute('class') ?? '').split(/\s+/);
    if (n.hasAttribute('hidden')) mobile = desktop = false;
    if (c.includes('hidden')) {
      mobile = false;
      if (!c.some((t) => RESHOW.test(t))) desktop = false;
    }
    if (c.includes('md:hidden')) desktop = false;
  }
  return { mobile, desktop };
}
for (const needle of (process.env.NEEDLES ?? '').split('|').filter(Boolean)) {
  // 最內層包含整個 needle 的元素。needle 可能跨越同一元素下的多個文字節點。
  const els = [...rootEl.querySelectorAll('*')].filter(
    (el) => el.textContent.includes(needle) && ![...el.children].some((ch) => ch.textContent.includes(needle)),
  );
  const vis = els.map(visibility);
  console.log(
    `NEEDLE ${JSON.stringify(needle)} 元素 ${els.length}，行動版可見 ${vis.filter((v) => v.mobile).length}，桌機可見 ${vis.filter((v) => v.desktop).length}`,
  );
}
await React.act(async () => root.unmount());
process.exit(errors.length ? 1 : 0);
```

### 八、Mobile／desktop 響應行為

| 位置 | 375px（行動版） | ≥ 768px（桌機） |
|---|---|---|
| 時期卡片（4.2） | 直向堆疊，全寬。失效句約 40 字，`text-[11px]` 約 3 行 | 四欄，每欄約 280px，失效句約 4 行。卡片變高，四欄等高由 grid 處理 |
| 邊界註記（4.4） | 全寬，約 8 行 | 全寬，約 3 行 |
| 圖上第六條色帶 | 約 4px 寬（viewBox 縮 0.32 倍），看得到網底，看不到文字 | 約 12px，不畫標籤 |
| 引線註解（4.3） | 整組隱藏（既有設計） | 三行，靠右對齊 |
| 分界線標籤「（已失效）」 | 不顯示（行動版只顯示年份） | 顯示 |

**失效的事實在行動版由卡片與邊界註記承擔，兩者都不在任何 `hidden` 群組內。** AC-1 以探針分別量測兩版可見性。
行動版點第六條色帶：`onSelect` 傳 `null`，與 interim 色帶相同，不選取任何卡片。

### 九、與 `067` 的重疊與施工順序

`067` 的 implement 正在 `.worktrees/spacedock-ensign-systematic-chinese-content-legal-audit` 作業。本階段讀了它的 diff（未改動）：

| 重疊 | 事實 | 處置 |
|---|---|---|
| `tests/threshold-analysis.test.mjs:141` | `067` 的 `1faa286` 把 `SPEC_PATH` 改到 `_archive/`。沒有這個修正，`012` 套件在 main 上整檔載入失敗 | **本票 implement 必須從 `067` 合併後的 main 開分支** |
| `src/data/threshold-analysis.ts` | `067` 改第 4 行的規格路徑。本票改第 12–26 行的檔頭補述與其後內容 | 不同 hunk，可自動合併 |
| `067` AC-6 的 Verified by | 寫死 `src/data/threshold-analysis.ts:238`（規則期 caveat 的民國年） | 本票在該行之前會新增約 8 行。**若本票先合併，`067` 的 Verified by 會失準。** 這是第二個先後順序的理由 |
| `docs/health-check/TODO.md` | `067` 會新增 `/past/thresholds` 門檻期一列 | 本票在實作後把該列標為已解決（Documentation impact 實作後更新） |
| `067` 的 M5（民國年混用） | 本票新文案只用西元日期與判決字號 | 若 `067` 已合併，verify 另跑一次 `node scripts/content-audit.mjs`，M5 不得新增 `/past/thresholds` 相關檔案的命中 |

`067` 的 AC-10 第 2 點要求 `node --test tests/threshold-analysis.test.mjs` 通過。本票改名之後該套件仍須全綠（AC-4），兩票的要求相容。

### 十、補述：Problem 一節的「公開頁」不精確（2026-09-29，design）

Problem 第一句寫「`/past/thresholds`（公開頁）」。原句保留。實查：

- `src/data/launch-status.ts:3` 的 `PUBLIC_PAGES` 為 `['/', '/controversy-timeline', '/future']`，**不含** `/past` 與其子路由。
- `LaunchGate` 在 `NEXT_PUBLIC_PUBLIC_MODE=true` 時只放行 `PUBLIC_PAGES`；未設定時（team mode）放行 `ALL_PAGES`，其中含 `/past`，因此 `/past/thresholds` 可見。
- 所以本頁目前是 team mode 可見、公開模式不可見。正式環境是否設了該變數，本階段無從查證。

這不改變本票的必要性：`066` 修 `/quiz` 時，`/quiz` 同樣不在 `PUBLIC_PAGES`。本頁有兩個站內入口（`/past` 與 `/future`，見 `docs/project/architecture.md:37`），`/future` 在 `PUBLIC_PAGES` 內。

### 十一、Out of scope（順手發現，本票不修，附證據供 FO 判斷）

1. **`check-voided-floor.mjs` 對「沒渲染出內容」的頁面假性通過。** 證據見 Risk evidence 第 4 點。修法是讓腳本對呼叫端指定的路由要求「下限數字出現 ≥ 1」，屬 `066` 腳本的語意變更。本票以 AC-2 的有效性條件繞過。
2. **`page.tsx` 的 OG 描述寫「門檻改過四次」。** 依本頁資料，變動點有 1958、1993、2022（憲訴法施行，條文用語改變）、2025-01、2025-12 五個，「四次」的算法不明。本票不改：它不構成現行主張，且怎麼算次數需要 captain 決定。
3. **`SERIES_BREAK_DATE` 的 JSDoc 寫 2022-01-04「不是門檻調整點」**（`threshold-analysis.ts:203`），但 `INTERIM_SEGMENT` 的條文與前期不同（「出席」改「參與評議」、「出席人 2/3 同意」改「現有總額過半數同意」）。兩者敘述不一致。需法學背景者判斷該日是否算門檻調整。
4. **114 年憲判字第 1 號同時宣告第 30 條第 3 至 6 項失效**（含迴避超過 7 人時的四分之三門檻）。`ruling-threshold.ts` 的 `voidedFloor.statute` 只寫「第 2 項」。本頁只呈現第 2 項，敘述正確；4.5 的資料來源一列會寫「第 2 至 6 項」。是否要讓 `voidedFloor` 反映完整範圍，屬 `ruling-threshold.ts` 的語意，本票不動。

## Stage Report: design

- DONE: Establish from primary sources when and why the 10-attendance / 9-agreement threshold stopped applying, and specify how /past/thresholds presents it as historical-not-current, plus how 012's tests change without losing what they currently guard.
  Design 一：114憲判1 主文（第 30 條第 2–6 項違憲，判決公告日 2025-12-19 起失效，理由為立法程序重大瑕疵）與全國法規資料庫第 1 項原文，皆 2026-09-29 `curl` 取得；呈現規格見 三、四；`012` 33 條逐條對照與新增 T-A–T-D 見 五。
- DONE: Acceptance criteria each carry a falsifiable Verified by; at least one measures the end value — a reader of the rendered /past/thresholds page (after hydration, not SSR HTML) sees the threshold marked as no longer in force — and decide whether 066's check-voided-floor.mjs should cover this route.
  AC-1–AC-7 各附會失敗的改動；AC-1 以 jsdom＋`react-dom/client` 探針量 effect 執行後的 DOM（對照組 SSR 0 字元），分行動版／桌機可見性，main 基線 N4=1、N5=1。決定：`066` 腳本要跑本路由、不改腳本（Design 六；加「現行」會誤報 `/quiz/pending`、`/future`）。
- DONE: Split documentation impact into 現在更新 / 實作後更新 / 不更新, each listing documents or 無; any 現在更新 entry states direction, not-yet-implemented status, and verification target.
  現在更新＝無（附理由：`067` 正改 `TODO.md`）；實作後更新 3 份，各附現況與驗證目標；不更新 5 項附理由。
- DONE: Component hierarchy, data requirements, mobile/desktop behavior（stage definition outputs）
  Design 3（資料形狀與新匯出 `RESTORED_SEGMENT`）、4.1（元件階層，props 介面不變）、八（兩版對照表）。

### 本階段實跑的新發現（交 FO）

1. **main 上的 `012` 測試整檔沒有執行。** `tests/threshold-analysis.test.mjs:141` 指向 `bbe0bc3` 已封存的規格路徑，main 結果為 tests 1／fail 1。`067` 的 `1faa286` 已修。**本票 implement 須在 `067` 合併後開始**（另一理由：`067` AC-6 寫死 `threshold-analysis.ts:238`）。
2. **`check-voided-floor.mjs` 對未放行 LaunchGate 的本頁假性通過**（下限數字 0 次、exit 0）；放行後檢查 2 FAIL。AC-2 以「N ≥ 1」擋。
3. **Problem 寫本頁為「公開頁」不精確**：`/past` 不在 `PUBLIC_PAGES`，僅 team mode 可見（Design 十，原句保留）。
4. 原型（scratchpad 副本，5 檔 +81／−18）：`tsc` exit 0；`012` 32 pass／1 skip；七條路由 `check-voided-floor` exit 0（改動前 exit 1）；探針 N1 兩版各 2 處可見。

### Summary

以一手來源確認 10 人 9 人下限自 2025-12-19 起失效，設計把該期改成有終點的歷史期、補上此後適用的第 30 條第 1 項，失效句一律引用 `ruling-threshold.ts`，行動版由時期卡片與邊界註記承擔。`012` 測試為機械改名加四條新守衛，原型已驗證全綠且 `066` 檢查由 FAIL 轉 PASS。端值以可重跑的 hydration 探針量測，因本機無可用瀏覽器；桌機引線註解是否裁切須 captain 目視。
