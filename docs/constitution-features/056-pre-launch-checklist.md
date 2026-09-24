---
id: 056
title: 上線前檢查清單：公開之前每一項都必須有結論
status: implement
source: captain 2026-09-07（把關機制體檢與任務地圖的綜合結論）
started: 2026-09-21T18:56:47Z
completed:
verdict:
score: 0.85
worktree: .worktrees/spacedock-ensign-056-pre-launch-checklist
issue:
pr:
mod-block:
---

網站目前是 `noindex` 且無對外網域，「讀者」是有連結的夥伴而非公眾。因此下列破口不是「今天要修」，而是**「公開之前必須為真」**。本票把六個散落的無票缺口收成一道 launch gate。

## Problem

2026-09-04 的把關機制體檢與任務地圖顯示一件事：**所有的票都在產線左半邊（投稿、審核、同步、發布），但已經在影響讀者的破口全在最右邊，而且多數沒有票。**

原因不是疏忽，是**形狀錯了**。這些項目彼此無關、無法排進同一個施工順序，唯一的共通點是「公開之前必須為真」。分別開六張票會讓它們各自漂走；收成一張 launch gate 才管得住。

**現況**（`src/app/layout.tsx:5-8` 的 `robots: { index: false, follow: false }` 仍在）：搜尋引擎收不到，但**任何拿到連結的人都看得到全部頁面**。

## 清單

下列每一項在公開之前必須有明確結論——**修好、明確接受、或移除**。不接受「待確認」。

> ⚠️ **下面四張表是 2026-09-07 的快照，保留原文不改。**
> 2026-09-21 的逐項複驗結果、以及每一項的結論，見本文 `## Proposed approach` 的第一、二節。
> 部分項目的事實已經改變，**不要直接引用下表的「查證」欄**。

### A. 交付物到不了使用者（已查證，皆無票）

| # | 項目 | 查證 |
|---|---|---|
| A1 | feature `015` 的反方意見元件**從未渲染過一次** | `discussions.json` 無 `opposing_views` 欄位；`present/[id]/page.tsx` 靠該欄決定是否渲染 |
| A2 | feature `014` 的散點圖等約 800 行**無任何檔案 import**，而首頁 CTA 仍宣傳「16 則意見分析」 | `grep -rn "OpinionLazybag" src/` 只剩它自己；`LazybagCtaSection.tsx:31` |
| A3 | feature `018` 的測驗**全站沒有入口** | 唯一 `href="/quiz"` 在 `QuizResult.tsx:149`，是做完測驗後的回程連結 |
| A4 | 每篇文章詳情頁都顯示「完整轉譯尚未收錄」 | `discussions.json` 無 `full_content` 欄位 |

### B. 上線控制

| # | 項目 | 查證 |
|---|---|---|
| B1 | `LaunchGate` 實際鎖不住任何頁面 | `NEXT_PUBLIC_PUBLIC_MODE` 未設 → `LAUNCHED_PAGES === ALL_PAGES`。「夥伴看全部、公眾看三頁」現行程式碼做不到 |
| B2 | 移除 `noindex` | `src/app/layout.tsx:5-8`；`docs/health-check/TODO.md` 的 P3-8。**目前無人追蹤解除時點** |
| B3 | 確認 Vercel 的 Build Command 與 `NEXT_PUBLIC_PUBLIC_MODE` 實際值 | repo 內查不到，只有 captain 能開 dashboard 確認 |

### C. 佔位與無來源內容

| # | 項目 | 查證 |
|---|---|---|
| C1 | 佔位信箱 `volunteer@addcourt.tw` | `src/components/PresentDetail.tsx:32`。feature `008` 當時已註明是佔位 |
| C2 | `/about` 的佔位貢獻者名單 | 已有 feature `052`，本票只追其結論 |
| C3 | `opinion-lazybag` 的具名大法官立場零出處 | 已有 feature `049`，本票只追其結論 |

### D. 卡在人的事實正確性

| # | 項目 | 查證 |
|---|---|---|
| D1 | 釋字第 272 號的法律內容錯誤 | `docs/health-check/TODO.md` 的 P0-2。需法學背景者拍板 |
| D2 | `h28` 掛了 `h14` 的標題 | 同檔 P0-6。captain 已清空 status 暫時擋住，待補正確標題 |
| D3 | `requiredForRuling: 10` 的法律正確性 | 該修法已於 2025-12 被判部分違憲（114憲判9）；數字仍渲染於 `future/page.tsx:79`、`:194`、`BottleneckFunnel.tsx:135`。features `021`／`026` 兩票都記過此疑慮，兩票都沒解 |

## Proposed approach

本票是 gate，不是施工票。design 階段的產出是三樣東西：**複驗結果**、**每一項的結論**、**gate 機制**。

### 一、2026-09-21 逐項複驗

基準：`main` 的 `bd4fca2`。驗證方式分三種——`repo`（讀檔案，附行號）、`data`（跑 node 讀 `src/data/*.json`）、`page`（起 `npx next dev -p 3199` 後實際抓頁面）。

| # | 2026-09-21 狀態 | 複驗結果與可重跑證據 |
|---|---|---|
| A1 | **仍成立** | `data`：`node -e "const a=require('./src/data/discussions.json');console.log(a.length, a.filter(x=>x.opposing_views).length)"` → `16 0`。`repo`：`src/app/present/[id]/page.tsx:104` 以 `item.opposing_views && .length > 0` 為渲染條件，條件恆為 false |
| A2 | **部分已變動** | 未接線元件仍在，共 **697 行**（非原記的約 800 行）：`ArgumentTag` 25、`DimensionSelector` 95、`OpinionLazybag` 99、`OpinionScatterPlot` 293、`OpinionTable` 147、`OpinionTooltip` 38。重跑：`for f in src/components/opinion-lazybag/*.tsx; do b=$(basename "$f" .tsx); grep -rqln "opinion-lazybag/$b" src/ \|\| echo "orphan $f"; done`。**CTA 數字已變動**：`LazybagCtaSection.tsx:31,34` 不是硬寫的「16」，是 `{OPINIONS.length}`／`{DIMENSIONS.length}`，`page` 實測渲染為「12 則意見分析」「4 個觀察維度」 |
| A3 | **仍成立** | `page`：對 `/`、`/past`、`/present`、`/future`、`/about`、`/controversy-timeline`、`/opinion-lazybag` 逐頁抓 `href="/quiz"`，**七頁全部零命中**。`repo`：`Navbar.tsx:10-15` 的 `NAV_ITEMS` 無 `/quiz`；`Footer.tsx:47-50` 無 `/quiz`。唯一 `/quiz` 連結仍是 `QuizResult.tsx:149` 的回程連結 |
| A4 | **仍成立** | `data`：`discussions.json` 16 筆全無 `full_content`。`repo`：`src/components/PresentDetail.tsx:14,17` 渲染「尚未收錄」「完整轉譯尚未收錄」 |
| B1 | **仍成立，機制已精確定位** | `launch-status.ts:7-10`：env 未設 → `LAUNCHED_PAGES === ALL_PAGES`。`LaunchGate.tsx:32`、`Navbar.tsx:34`、`TrackCards.tsx:31` 三處都寫 `isPublicMode ? LAUNCHED_PAGES : ALL_PAGES`，**兩個分支同值**，所以 `?public=true` 是 no-op |
| B2 | **仍成立** | `repo`：`src/app/layout.tsx:8`。`page`：`curl -s http://localhost:3199/ \| grep -o '<meta name="robots" content="[^"]*"'` → `noindex, nofollow` |
| B3 | **仍成立，且仍無法從 repo 查** | `.vercel/project.json` 只有 `projectId`／`orgId`／`projectName`，無建置設定。無 `vercel.json`。`.env.local` 七行內無 `NEXT_PUBLIC_PUBLIC_MODE`。重跑：`grep -rn NEXT_PUBLIC_PUBLIC_MODE .env* vercel.json .vercel/ 2>/dev/null` → 零輸出（判斷依據是輸出，不是離開碼；`vercel.json` 不存在會讓離開碼為 2） |
| C1 | **仍成立** | `repo`：`src/components/PresentDetail.tsx:32` 的 `mailto:volunteer@addcourt.tw`。此區塊對 16 篇文章詳情頁全部渲染 |
| C2 | **仍成立** | `repo`：`src/data/contributors.ts` 六筆全佔位（`專案發起人`／`前端工程師 A`／`前端工程師 B`／`法律文案`／`資料整理志工`／`顧問`），渲染於 `src/app/about/page.tsx:60,63` |
| C3 | **仍成立，但範圍需更正** | `repo`：`src/components/opinion-lazybag/StanceSpectrum.tsx:19-35` 硬編 14 位具名大法官，**正在線上渲染**。`src/data/opinions.ts:96` 起的 `justiceName` 共 12 筆，但其唯二渲染點 `OpinionTooltip.tsx`／`OpinionScatterPlot.tsx` 現在**無任何檔案 import**（見 A2），那條渲染路徑已死 |
| D1 | **已消失（線上）** | `data`：`node -e "const a=require('./src/data/history.json');console.log(a.length, a.map(x=>x.id).includes('h2'), JSON.stringify(a).includes('272'))"` → `40 false false`。原因：captain 清空 `status`，`scripts/sync-content.mjs:354` 的 `isApproved()` 把該列濾掉 |
| D2 | **已消失（線上），但同型缺陷仍在** | `h28` 不在 40 筆內。**新發現**：`h34`（釋字第708號）與 `h35`（釋字第710號）的 `reality.title` 一字不差，兩筆都在線上。重跑：`node -e "const a=require('./src/data/history.json');const t={};a.forEach(x=>t[x.reality.title]=(t[x.reality.title]\|\|0)+1);console.log(Object.entries(t).filter(([,v])=>v>1))"` |
| D3 | **仍成立** | `repo`：`src/data/future.ts:424` 的 `requiredForRuling: 10`，渲染於 `src/app/future/page.tsx:79`、`:194`、`src/components/future/BottleneckFunnel.tsx:135`。既有票 `021`／`026` 皆已封存於 `docs/constitution-features/_archive/`，兩票都沒解這一項 |

#### 複驗時發現的兩件事，會影響驗收方式

**第一，整站的伺服器端 HTML 目前不含任何頁面內容。**
`src/components/LaunchGate.tsx:30` 在 hydration 前回傳 `null`，所以 `curl` 抓 `/present/d1` 得到的 32KB HTML 裡，「尚未收錄」「volunteer@addcourt.tw」「前往原始出處」全部零命中。feature `039` 的 Problem 一節已記錄這個陷阱，本次複驗獨立重現。**任何只讀 SSR HTML 的驗證都會給出假通過。**

**第二，`049` 的一項前提需要更正。**
`049` 第 31 行寫 `justiceName` 渲染於 `OpinionTooltip.tsx:27` 與 `OpinionScatterPlot.tsx:265`。這兩個檔現在無任何 import，該渲染路徑是死的。`049` 的實際線上風險只剩 `StanceSpectrum.tsx` 與 `DecisionFlowchart.tsx`（即 `049` 第 39 行那一項）。這件事要回報給 `049`。

### 二、每一項的結論

**所有項目都在下表定案。沒有任何一項停在「待確認」。**

| # | 結論類型 | 內容與理由 | 誰執行 |
|---|---|---|---|
| A1 | **明確接受** | `opposing_views` 恆為空，`present/[id]/page.tsx:104` 的 guard 讓整個區塊完全不渲染，對讀者零可見，不是破口。**相依**：feature `019` 若要施工，須先讓產線產出 `opposing_views` 欄；這是 `019` 的前置，不是本 gate 的 | 接受者：captain（gate 執行時簽字） |
| A2 | **移除 ＋ 修** | 移除六個未接線元件（697 行）——`027` 改版後已由 `DecisionFlowchart` ＋ `StanceSpectrum` 取代，留著會讓下一個人以為它在線上。修 CTA：`LazybagCtaSection.tsx:31,34` 的數字取自 `opinions.ts`，但 CTA 連去的 `/opinion-lazybag` 渲染的是 `StanceSpectrum` 自帶的 14 筆資料，**數字與目的地不是同一份資料**。改為取自目的地實際資料，或改成不帶數字的文案 | **開新票 `058`**：`opinion-lazybag 未接線元件移除與 CTA 數字對齊` |
| A3 | **修** | 加站內入口。`018` 已交付四份測驗與結果圖，移除等於丟棄完成品；加入口的成本遠低於重做 | **開新票 `059`**：`測驗全站無入口` |
| A4 | **明確接受** | 「完整轉譯尚未收錄」是誠實的缺漏聲明，不是佔位假內容，且同一區塊有「前往原始出處」連結，讀者拿得到原文。**但同區塊的 C1 必須先處理** | 接受者：captain（gate 執行時簽字） |
| B1a | **修** | `LaunchGate.tsx:32`、`Navbar.tsx:34`、`TrackCards.tsx:31` 三處的真分支應取 `PUBLIC_PAGES` 而非 `LAUNCHED_PAGES`，讓 `?public=true` 真的鎖成三頁，成為可用的預覽開關 | **開新票 `060`**：`?public=true 預覽開關失效` |
| B1b | **移除（移除目標，不是移除程式）** | 「夥伴看全部、公眾看三頁」這個目標刪除。理由：本站無登入機制；`noindex` 解除後，靠前端 `localStorage` 做的分頁可見性控制，任何人改 `localStorage` 即可繞過，不是真的控制。公開等於整站公開 | 接受者：captain（gate 執行時簽字）。此項推翻 `033` 的分階段上線假設 |
| B2 | **修** | 移除 `layout.tsx:8`。**這就是 gate 的觸發動作**，見第三節 | captain ＋ FO（gate 通過後） |
| B3 | **修（人工項）** | 只有 captain 能開 Vercel dashboard。不開票，列為 gate 的人工項 `G-3` | captain |
| C1 | **移除** | 移除「我想協助轉譯」按鈕。沒有人收 `volunteer@addcourt.tw`，留著是承諾一個不存在的管道；`Footer.tsx:37` 的 GitHub issue 回報連結功能重疊。**覆寫點**：若 captain 提供真實信箱，該票改為替換而非移除 | **開新票 `061`**：`移除佔位信箱按鈕` |
| C2 | **修（既有票）** | 指向 feature `052`。本 gate 只追其結論，不重複施工 | `052` 的負責人 |
| C3 | **修（既有票）** | 指向 feature `049`，並回報上述前提更正 | `049` 的負責人 |
| D1 | **明確接受** | 線上已無此列，讀者看不到。**加一道反向保護**：`h2` 重新標 `Approved` 之前必須經法學確認。這條寫進 `docs/health-check/TODO.md` 的 P0-2 與本 gate 的 `G-6` | 接受者：captain |
| D2 | **明確接受（原項）** | `h28` 線上已無此列。反向保護同 D1 | 接受者：captain |
| D4 | **修（新發現）** | `h34`／`h35` 標題一字不差，兩筆都在線上。與 P0-6 同型，需內容判斷，FO 不擬標題 | **開新票 `062`**：`h34 與 h35 標題重複` |
| D3 | **修** | 開專票。掛在 `021`／`026` 兩張已封存的票上等於沒人負責——這正是本票 Problem 一節說的「各自漂走」 | **開新票 `063`**：`requiredForRuling 的法律正確性（114憲判9）` |

**共六張新票（`058`–`063`）**，由 FO 在本票 implement 階段開立。現有最大票號為 `057`，故 `058` 起連號無衝突。

> **2026-09-21 更正：上句括號內原寫的查法指令錯了，已換掉。原句其餘部分與結論不變。**
> 原指令為 `grep -c . <(ls docs/constitution-features/0*.md)`，實測輸出 `22`——那是檔案數，不是最大票號。
> 正確查法：`ls docs/constitution-features/0*.md | sed 's#.*/##' | cut -d- -f1 | sort -n | tail -1`。
> **`057` 這個結論本身正確**，是 design 當時逐檔檢視確認的。
> 但現在重跑上面那條指令會輸出 `063`，不是 `057`——因為 `058`–`063` 六張票已於 implement 階段由 FO 開立。
> 輸出不同不代表結論錯，是 repo 的狀態已經前進。要復現 design 當時的輸出，須回到開票前的 commit。

### 三、Gate 機制

#### 誰、在哪個時點執行

**執行者：captain，FO 代跑機械項。**
**時點：在移除 `src/app/layout.tsx` 的 `robots: { index: false, follow: false }` 之前，作為該次改動的前置。**

不設日期。日期會過期，而「要移除 noindex 的那一刻」不會。

#### 與移除 noindex 的綁定

綁定要做三處，其中第一處是關鍵。

| 處 | 檔案與位置 | 寫什麼 | 為什麼 |
|---|---|---|---|
| 1 | `src/app/layout.tsx` 第 5–7 行的註解區塊（緊貼在第 8 行 `robots:` 正上方） | 追加一行：`// 移除前必須通過 docs/constitution-features/056-pre-launch-checklist.md` | **這是唯一繞不過的位置。** 任何人要刪第 8 行，游標一定經過這幾行。另外兩處都要主動去找才看得到 |
| 2 | `docs/health-check/TODO.md` 的 P3-8（第 772 行起） | 在「狀態」下方加「解除條件」一條，指向 `docs/constitution-features/056-pre-launch-checklist.md` | P3-8 目前只寫「發布時必須移除」，沒寫「移除前要做什麼」 |
| 3 | `AGENTS.md` 第 51 行 | 現為「追蹤項目見 `docs/health-check/TODO.md` 的 P3-8」，改為同時指向 P3-8 與本票 | AGENTS.md 是每個 agent 的第一份必讀 |

**反向引用**：本票第三節已列出上述三處的檔案與行號，兩邊互指。

#### 「一道不會被觸發的 gate」怎麼被查證排除

綁定是否成立，用一條指令查：

```bash
grep -rn '056-pre-launch-checklist' src/app/layout.tsx docs/health-check/TODO.md AGENTS.md
```

三個檔案各至少一筆命中，即綁定成立；任一檔零命中即為失敗。這條指令進 `## Test plan`，也是 AC-3 的驗收方式。

#### Gate 執行清單

公開之前逐項跑。`機械` 項 FO 代跑並附輸出；`人工` 項 captain 判斷並留下簽字（寫在本票的 Feedback Cycles）。

| 項 | 類型 | 內容 | 通過條件 |
|---|---|---|---|
| G-1 | 機械 | `058`–`063` 六張新票的狀態 | 指令（2026-09-21 補，整列可原樣複製執行，不含需轉義的字元）：`for n in 058 059 060 061 062 063; do f=$(ls docs/constitution-features/$n-*.md docs/constitution-features/_archive/$n-*.md 2>/dev/null); if test -n "$f"; then echo "$n $(grep -m1 '^status:' $f) $(grep -m1 '^verdict:' $f)"; else echo "$n NOT FOUND"; fi; done`。通過條件（**2026-09-22 更正，原條件不可達成，原句與理由見表下補述**）：每張票印出的 `status` 為 `complete` 且 `verdict` 為 `PASSED`，或 captain 逐票明確接受，**理由逐票寫入本票 `### Feedback Cycles`，一張票一行**（格式與查核指令見表下 2026-09-23 補述）。印出 `NOT FOUND`、`verdict` 為空、或 `verdict` 為 `REJECTED`，一律視為該項尚未有結論，不通過 |
| G-2 | 機械 | `052`、`049` 兩張既有票 | 指令（2026-09-21 補）與 G-1 同一條，只換票號：`for n in 049 052; do f=$(ls docs/constitution-features/$n-*.md docs/constitution-features/_archive/$n-*.md 2>/dev/null); if test -n "$f"; then echo "$n $(grep -m1 '^status:' $f) $(grep -m1 '^verdict:' $f)"; else echo "$n NOT FOUND"; fi; done`。通過條件同 G-1（含 2026-09-22 的更正）|
| G-3 | 人工 | Vercel 的 Build Command 與 `NEXT_PUBLIC_PUBLIC_MODE` 實際值 | captain 開 dashboard 確認並把實際值抄回本票 |
| G-4 | 人工 | A1、A4、B1b 三項「明確接受」 | captain 簽字，理由寫入本票 |
| G-5 | 機械 | 佔位字串全站掃描 | `grep -rniE '某[學学]者\|某大[學学]\|lorem ipsum\|前端工程師[ 　]?[ABＡＢ]\|volunteer@addcourt\.tw\|快速了解最新判[決决]的[5５][個个]重[點点]' src/` 零命中 |
| G-6 | 機械 | D1／D2 的反向保護 | `node -e "const a=require('./src/data/history.json');const i=a.map(x=>x.id);if(i.includes('h2')\|\|i.includes('h28'))process.exit(1)"` 回傳 0。若任一列回來了，表示有人重新標了 `Approved`，必須先有法學確認記錄 |
| G-7 | 機械 | gate 綁定仍在 | 上面那條 `grep -rn '056-pre-launch-checklist'` 三檔皆命中 |
| G-8 | 機械 | 建置與型別 | （**2026-09-23 補執行順序**，理由見表下補述）先跑 `npm run build`（會重建 `.next/types/`），或先 `rm -rf .next`；再跑 `npx tsc --noEmit`。兩者皆通過才算過 |

> **2026-09-22 更正：G-1／G-2 的原通過條件寫錯了，永遠不可能成立，已換掉。兩列的指令本身不變。**
> 原句為：「每張票印出的 `status` 為 `archived` 且 `verdict` 非空，或 captain 逐票明確接受並記錄理由。任一張印 `NOT FOUND` 即不通過」。
> **它為何不可達成**：本 workflow 的 `status` 沒有 `archived` 這個值。`README.md:81` 寫明 enum 是 `design`／`implement`／`verify`／`review`／`complete`；`grep -rl '^status: archived' docs/constitution-features/` 命中 **0 張票**。
> 指令跑得動，但它比對的標準構不到——這正是本票 Problem 一節要防的事：一道**永遠不會通過**的 gate 等於沒有 gate。
> **為何改成 `verdict` 為 `PASSED`，而不是沿用「`verdict` 非空」**：`verdict` 非空包含 `REJECTED`。本 gate 的用意是「每一項都必須有結論——修好、明確接受、或移除」，而一張 `REJECTED` 的後續票代表它的工作**沒有被接受**，那一項並沒有修好。沿用「非空」會讓一張被否決的票也算通過，是第二道假通過。
> **為何不能只看檔案在不在 `_archive/`**：`_archive/023-owl-mascot-unification.md` 的 `status` 是 `design`、`verdict` 是空的。票可以未結案就被封存。**人在 `_archive/` 不代表有結論。** 實測 35 張封存票中，34 張為 `complete`＋`PASSED`，`023` 是唯一的例外，也正是這個例外證明了判準必須看 `status` 與 `verdict`，不能看路徑。
> **`REJECTED` 與空 `verdict` 怎麼辦**：一律視為該項尚未有結論，走原本就寫在條件裡的那條出口——captain 逐票明確接受並記錄理由，或另開後續票。gate 不替被否決的票背書。
> 本次只改 G-1／G-2 兩格的通過條件。G-3 至 G-8 的通過條件已逐條複核，無同類的不可達成問題。

> **2026-09-23 補述：G-1／G-2 的「captain 逐票明確接受」出口沒寫記錄位置、也沒有查核方式，已補上。原句不動，只加一個子句。**
> 原句為：「或 captain 逐票明確接受並記錄理由」。出口存在，但沒說理由寫在哪，也沒人查得到它到底有沒有被寫。
> 本節導言的「寫在本票的 Feedback Cycles」只涵蓋 `人工` 項，而 G-1／G-2 是 `機械` 項，涵蓋不到這個情形——這是缺口的來源。
> **記錄位置**：本票的 `### Feedback Cycles`，一張票一行，格式固定為 `- gate-exception {票號}：captain 明確接受。理由：{一句話}。{YYYY-MM-DD}`。
> **查核指令**（整列可原樣複製；前綴與輸出刻意全用 ASCII——中文 pattern 在本機以獨立腳本執行時會噴 `grep: illegal byte sequence`，2026-09-23 實測過，ASCII 版本不會）：`for n in 058 059 060 061 062 063 049 052; do if awk -v n="$n" '/^### Feedback Cycles/{s=1;next} /^#/{s=0} s && index($0, "- gate-exception " n)==1 {f=1} END{exit !f}' docs/constitution-features/056-pre-launch-checklist.md; then echo "$n RECORDED"; else echo "$n NO-RECORD"; fi; done`
> **這條出口不會變成第二個 F-6。** F-6 壞在**主條件**構造上不可達——enum 裡根本沒有 `archived`，gate 因此永遠不會通過。這一條是**例外出口**：主條件已證明構得到（全 repo 34 張票符合 `complete`＋`PASSED`），出口只在某張票被否決或作廢時才用得上。**出口沒被用到不算壞掉，主條件不可達才算。**
> 而且它現在查得到：上面那條指令對八張票逐張印 `RECORDED` 或 `NO-RECORD`。captain 有沒有簽字看得出來，不能只靠口頭宣稱。

> **2026-09-23 更正：上面那條查核指令的掃描範圍原本寫錯了，是本票 cycle 4 自己造出來的 fail-open，已修。**
> 原指令為：`for n in 058 059 060 061 062 063 049 052; do if grep -q "^- gate-exception $n" docs/constitution-features/056-pre-launch-checklist.md; then echo "$n RECORDED"; else echo "$n NO-RECORD"; fi; done`。
> **它錯在哪**：`grep` 掃的是**整份本票**，不是 `### Feedback Cycles` 區段。所以本檔任何一處只要有一行以 `- gate-exception ` 加真實票號開頭——stage report 裡的舉例、`## Out of scope` 裡的說明——都會被算成 `RECORDED`。**這是 fail-open：gate 會宣稱一個沒有人簽過的核准。** 一道會說謊的檢查比沒有檢查更糟。
> **修法**：改用 `awk`，只在 `### Feedback Cycles` 標題之後、下一個標題之前的範圍內比對，並以 `index(...)==1` 取代正規表示式錨點，避開跳脫與編碼問題。
> **兩個方向都驗過**（2026-09-23，皆在副本上操作）：把 `- gate-exception 058：…` 放進 `## Out of scope` 段——舊指令印 `058 RECORDED`，新指令印 `058 NO-RECORD`；把 `- gate-exception 049：…` 放進 stage report 段——舊指令印 `049 RECORDED`，新指令印 `049 NO-RECORD`；再把 `- gate-exception 058：…` 放進 `### Feedback Cycles`（且 `## Out of scope` 的誘餌行仍在）——新指令印 `058 RECORDED`，其餘七張 `NO-RECORD`。**只驗「不再誤報」等於沒驗**，必須同時證明該算到的仍然算得到。
> 原句保留於上，未刪。

> **2026-09-23 補述：G-8 的 `npx tsc --noEmit` 會因環境因素假性失敗，已在 G-8 補上執行順序。這是環境問題，不是候選缺陷——遇到時不要去改原始碼。**
> **症狀**：`.next/` 內可能出現檔名帶「 2」「 3」的重複檔，例如 `.next/types/routes.d 2.ts`。`tsconfig.json` 的 `include` 含 `.next/types/**/*.ts` 而 `exclude` 只有 `node_modules`，所以這些重複檔會被一起編譯，與 `routes.d.ts` 撞成 `error TS2300: Duplicate identifier 'LayoutProps'`，讓 `tsc` 假性失敗。
> **成因未經證實，故不歸因。** 是哪個機制產生這些重複檔，本票沒有查證到可靠證據，因此不寫。遇到時**只要依下面的解法處理，不要去改原始碼**——判斷依據是「解法有效」與「`src/` 零變動」，不是「知道是誰造成的」。
> **解法**：先跑 `npm run build`（會重建 `.next/types/`），或先 `rm -rf .next`，再跑 `npx tsc --noEmit`。
> **2026-09-23 實測三段**：(1) 殘留 `routes.d 2.ts`／` 3.ts`／` 4.ts` 時 `tsc` 印三筆 `TS2300`、`exit 2`；(2) `rm -rf .next` 後 `tsc` → `exit 0`，`npm run build` 後 `tsc` → `exit 0`；(3) 刻意 `cp .next/types/routes.d.ts ".next/types/routes.d 2.ts"` 重建該檔 → 同一錯誤逐字重現、`exit 2`，刪掉後 → `exit 0`。全程 `src/` 零變動，故成因在環境不在候選。
> **2026-09-23 更正：本則原本把成因指名為 macOS／iCloud 同步，該歸因查無實據，已改為只描述症狀。原「實測三段」與解法不變。**
> 原句為：「本專案位於 `~/Documents/` 下的同步資料夾，macOS／iCloud 遇到檔名衝突會產生「 2」「 3」這類重複檔」。
> 這個歸因源自 FO 寫進 scope notes 的內容，是另一張票的推測被當成事實傳了下來，implement 照抄未查證。
> 後續查核在本 sandbox 下被擋住，不是查到「沒有」：`ls -d ~/Library/Mobile\ Documents` 回 `Operation not permitted`，`brctl status` 回 `brctl: Trying to invoke brctl from a sandboxed process`（2026-09-23 本階段獨立重跑，非轉述）。**被擋住不等於不存在。** 所以「是 iCloud」與「不是 iCloud」**兩個結論都沒有被證實**。
> 因此本則不換成另一個同樣未證實的歸因，直接不歸因。症狀與解法本來就不依賴成因：重複檔在不在，`ls` 看得到；解法有沒有效，離開碼看得到。

> **2026-09-24 更正：G-5 的掃描 pattern 只認一種寫法，異寫法全部掃不到，已擴大涵蓋面。G-5 要求什麼沒有改。**
> 本項**非本輪引入**——G-5 自 design 階段即如此寫。依 captain 2026-09-24 的一次性授權：「授權修正 `Verified by:` 涵蓋既有寫法變體，不改 AC 要求本身」。
> 原 pattern 為：`某學者|某大學|lorem ipsum|前端工程師 [AB]|volunteer@addcourt\.tw|快速了解最新判決的5個重點`。
> **它錯在哪**：`前端工程師 [AB]` 的半形空格是必要的，所以 `前端工程師A`（無空格）與 `前端工程師　B`（全形空格）掃不到；簡體 `某学者`／`某大学` 掃不到；全形數字 `快速了解最新判決的５個重點` 掃不到。**G-5 以零命中為通過，掃不到就等於通過**——方向是 fail-open，而 G-5 正是本票為了防 `015` 事故（`某學者，某大學法律系` 公開顯示四個月）而設的那一項。
> **可原樣複製的完整指令**（表格列內的 `|` 依 markdown 需寫成 `\|`，這一行沒有）：`grep -rniE '某[學学]者|某大[學学]|lorem ipsum|前端工程師[ 　]?[ABＡＢ]|volunteer@addcourt\.tw|快速了解最新判[決决]的[5５][個个]重[點点]' src/`
> **改的是哪幾個字元、為什麼**：`某[學学]者`／`某大[學学]`（簡繁）、`前端工程師[ 　]?[ABＡＢ]`（空格可有可無、半形或全形，A／B 半形或全形）、`快速了解最新判[決决]的[5５][個个]重[點点]`（簡繁與全形數字）。`lorem ipsum` 與 `volunteer@addcourt.tw` 靠 `-i` 已涵蓋大小寫，未動。**沒有新增任何字串**——字串集合與原本完全相同，只是每個字串多認了既有的寫法變體。
> **雙向驗過**（2026-09-24，逐行實跑）：(a) 十一個字串新 pattern 全部 `HIT`，舊 pattern 為六 `HIT`／五 `MISS`；(b) 對 `src/` 實掃，新舊 pattern 的輸出 `diff` **完全相同**（同樣三筆：`PresentDetail.tsx:32`、`contributors.ts:16`、`:21`），未多抓任何一行；另以八個近似但合法的字串（`某些學者認為這個判決有爭議`、`台灣大學法律系`、`前端工程師的工作內容`、`這則判決的5個重點` 等）測試，全部 `MISS`。**過寬和過窄一樣壞**：過寬會讓 G-5 永遠不通過，所以 (b) 和 (a) 一樣必須驗。

八項全數通過，才移除 `layout.tsx:8`。移除後在本票 Feedback Cycles 記下執行日期與 commit SHA，並把本票 `status` 推進到封存。

> **已知的非阻擋缺口（2026-09-21 記錄，不修）**：`npm run build` 產出的 15 個預先產製 HTML 中，唯 `.next/server/app/_global-error.html` 不帶 `<meta name="robots" content="noindex, nofollow">`。重跑（先 `npm run build`，指令整列可原樣複製）：`find .next/server/app -name '*.html' -exec grep -L 'content="noindex' {} +` → 只印該一檔。
> 此缺口在 `main` 上即已存在，非本票引入；該檔是 Next.js 的錯誤邊界回退頁，不在建置輸出的路由表內，且本站尚無對外網域，故目前無可觀察損害，不阻擋任何 gate 項。
> **promote-to-material 條件**：若日後決定「已公開但仍保留 noindex」，這是唯一的漏洞，屆時必須另開票處理。

### 四、Component hierarchy、Data requirements、Responsive

**無。** 本票不動任何元件、不新增任何型別、不渲染任何畫面。第二節列出的六張新票各自負責自己的元件與資料設計。唯一的程式碼改動是 `src/app/layout.tsx` 註解區塊加一行（第三節的綁定第 1 處），無視覺輸出，無響應式行為。

### 五、相依與已知阻擋

| 相依 | 對象 | 影響 |
|---|---|---|
| AC-2 的驗收方式 | feature `039`（常設渲染檢查工具，仍在 `design`） | 本 repo 目前無 `playwright`／`puppeteer`，本機亦無 Chrome。`curl` 因 `LaunchGate.tsx:30` 的 hydration 陷阱必然假通過。AC-2 只能靠 `039` 的 jsdom 掛載方案，或 captain 人工開瀏覽器 |
| `019` 的前置 | A1 的 `opposing_views` 欄 | `019` 施工前須先讓產線產出該欄。不是本 gate 的阻擋 |
| B1b 推翻的舊決定 | feature `033`（progressive-launch-strategy，已封存） | `033` 假設可以分階段開放頁面。本票判定該目標在現行架構下做不到 |

## Risk evidence

`no spike needed`：上表每一項皆已由 2026-09-04 的體檢查證，且 FO 於同日親自複驗 A1／A2／A3、C1、D3。

**但清單有固有風險**：它是 2026-09-07 的快照。design stage 必須重新逐項確認，不得直接沿用。

> **2026-09-21 補述：複驗已完成，結果見 `## Proposed approach` 第一節。**
> 十三項中，**十項仍成立、一項部分變動（A2）、兩項在線上已消失（D1／D2）**。
> 複驗另外找到一項舊快照沒有的缺陷（`h34`／`h35` 標題重複，列為 D4），
> 以及 `049` 的一項前提需更正。
> **固有風險未被消除，只是重新計時。** 本票的 gate 執行清單（第三節 `G-1`–`G-8`）
> 全部是可重跑的指令或人工簽字，就是為了讓「公開當下」再跑一次，而不是信任今天的結果。

## Acceptance criteria

**AC-1 — 公開之前，清單每一項都有明確結論。**
Verified by: 逐項檢查 `## Proposed approach` 第二節的結論表。任何一項停在「待確認」「待決定」即為失敗。**「修好」的項目必須指向可查證的證據**——票號加合併記錄，或實際指令輸出，不接受口頭宣稱。設計階段的通過條件是十五個項目（A1–A4、B1a、B1b、B2、B3、C1–C3、D1、D2、D3、D4）各有一個結論類型。

**AC-2 — A 類每一項都能以實際頁面行為驗證。**
Verified by: 對 A1–A4 各做一次真實渲染檢查。**不得只讀 SSR HTML**——`src/components/LaunchGate.tsx:30` 在 hydration 前回傳 `null`，`curl` 對整站都會零命中而看似通過。合格方式只有兩種：feature `039` 的 jsdom ＋ `react-dom/client` 掛載，或 captain 人工開瀏覽器。A3 必須從站上實際入口點進測驗頁，不接受直接打網址。任一項無法從真實入口達成即為失敗。

**AC-3 — 這道 gate 與移除 `noindex` 綁定。**
Verified by: 下列指令三個檔案各至少一筆命中。

```bash
grep -rn '056-pre-launch-checklist' src/app/layout.tsx docs/health-check/TODO.md AGENTS.md
```

任一檔零命中即為失敗——**一道不會被觸發的 gate 等於沒有。** 其中 `src/app/layout.tsx` 那一筆必須位於 `robots:` 那一行的正上方註解區塊內，不可放在檔尾。

**AC-4 — gate 執行清單可重跑。**
Verified by: `G-1`–`G-8` 八項中，六個 `機械` 項逐條執行並貼出輸出。任一項只有結論沒有輸出即為失敗。

## Test plan

設計階段不改動渲染邏輯，故不需回歸測試。下列為 gate 執行時要跑的完整指令，也是 implement／verify 的驗收依據。

```bash
npx tsc --noEmit                       # G-8
npm run build                          # G-8；不會觸發同步，PR #32 已把 sync 移出 build
grep -rn '056-pre-launch-checklist' src/app/layout.tsx docs/health-check/TODO.md AGENTS.md   # AC-3 / G-7
grep -rniE '某[學学]者|某大[學学]|lorem ipsum|前端工程師[ 　]?[ABＡＢ]|volunteer@addcourt\.tw' src/   # G-5（涵蓋面見第三節補述。注意：此列的字串集合比第三節的 G-5 少 `快速了解最新判決的5個重點` 一項，屬既有分歧，本輪未擅自補上，見 implement cycle 6 報告）
node -e "const a=require('./src/data/history.json');const i=a.map(x=>x.id);console.log(i.includes('h2'),i.includes('h28'))"   # G-6
```

**2026-09-21 實測結果**（這是現況，不是通過狀態）：

| 指令 | 通過條件 | 2026-09-21 實測 |
|---|---|---|
| `npx tsc --noEmit` | 無輸出 | **通過**，無輸出 |
| AC-3 的 `grep` | 三檔各至少一筆命中 | **不通過**，三檔皆零命中——綁定尚未建立，這是本票 implement 的工作 |
| G-5 的 `grep` | 零命中 | **不通過**，三筆命中：`PresentDetail.tsx:32`（C1）、`contributors.ts:16`、`:21`（C2）。兩者各有其票，gate 追其結論 |
| G-6 的 `node` | `false false` | **通過**，輸出 `false false` |

`npm run build` 本階段未跑——本票 design 未改動任何程式碼，`npx tsc --noEmit` 已足以確認型別基準線。`build` 列在 `G-8`，於 gate 執行時跑。

A 類四項需在 `npm run dev` 的實際渲染上驗證，方式見 AC-2。**不執行 `npm run sync-content`。**

## Documentation impact

### 現在更新

| 文件 | 為什麼現在要改 | 更新內容 | 狀態與驗證目標 |
|---|---|---|---|
| `docs/health-check/TODO.md` | P3-8（第 772 行起）只寫「發布時必須移除」，沒寫「移除前要做什麼」，因此無人追蹤解除時點 | 在 P3-8 的「狀態」下方加「解除條件」一條，指向 `docs/constitution-features/056-pre-launch-checklist.md` | **方向已定，尚未實作。** 驗證目標：`grep -n '056-pre-launch-checklist' docs/health-check/TODO.md` 至少一筆命中 |
| `docs/health-check/TODO.md` | P0-2 目前只寫「待法學確認」，沒寫「`h2` 已被 `isApproved` 濾掉」這個現況 | 在 P0-2 追加一則補述，寫明線上已無此列、以及重新標 `Approved` 前必須有法學確認記錄。**原文保留** | **方向已定，尚未實作。** 驗證目標：P0-2 一節內出現「反向保護」與 `G-6` 的指令 |
| `AGENTS.md` | 第 44–51 節的 noindex 條目只指向 P3-8，未指向本票 | 第 51 行改為同時指向 P3-8 與本票 | **方向已定，尚未實作。** 驗證目標：`grep -n '056-pre-launch-checklist' AGENTS.md` 至少一筆命中 |

### 實作後更新

| 文件 | 完成條件 | 更新內容 |
|---|---|---|
| `docs/constitution-features/049-opinion-lazybag-content-provenance.md` | 本票 design 通過 gate | 追加一則補述：該票第 31 行所述的 `OpinionTooltip.tsx`／`OpinionScatterPlot.tsx` 渲染路徑已死（兩檔無任何 import），線上風險只剩第 39 行那一項。**原文保留** |
| `docs/INDEX.md` | `058`–`063` 六張新票開立後 | 若索引收錄 feature 票，同步補入；若不收錄則不動 |
| `docs/health-check/TODO.md` | 本票封存 | P3-8 記下 gate 執行日期與移除 `noindex` 的 commit SHA |

### 不更新

| 文件 | 理由 |
|---|---|
| 狀態為 `record` 的文件與 `docs/_archive/**` | 歷史記錄，不改寫 |
| `docs/constitution-features/_archive/033-progressive-launch-strategy.md` | 已封存。B1b 推翻其假設一事記在本票，不回頭改封存票 |
| 本票 `## 清單` 的四張表 | 2026-09-07 的快照，保留原文。複驗結果另列於第一節，已在表上方加警告 |

### Feedback Cycles

- Cycle 1: REJECTED — verify；surface 4 檔／+150 淨行（+151/-1）vs estimate 無（本票 design 未產出 `## Expected surface and tolerance` 段，記為缺口，本輪不因此退回）；AC unchanged。F-1 fix by FO（Material，ownership = FO：058–063 在本 worktree 內 NOT FOUND 使 AC-1「修好須指向可查證證據」與 AC-4 的 G-1 不成立；根因為 worktree 過時而非票未開立——六張票已於 main commit `ae68618` 開立，本分支分岔於 `24e2c44` 在其之前；FO 已 merge main 進分支修復，commit `10d82e8`，六張票現全部 FOUND，不派給 implement）；F-2 fix（Material，本票自有範圍：G-1／G-2 無可執行指令，六個機械項中 implement 只貼出三項輸出，AC-4「可重跑」無法滿足）；F-3 fix（Polish：design 第二節票號查法 `grep -c . <(ls …)` 實測輸出 22 為檔案數非最大票號，`057` 結論本身正確）；F-4 decline 修 build 產物＋授權補一行記錄（Deferred risk：15 個預製 HTML 僅 `_global-error.html` 不帶 noindex，目前無損害且 main 上即存在，promote-when = 決定「已公開但仍保留 noindex」）；F-5 decline（Polish：design 第一節三處行號／路徑漂移，語意位置與 12／14／4／697 全部計數皆成立）。implement 的兩項 DONE 經 verify 獨立重跑逐字一致，無自我宣稱經不起重跑；AC-3 以 `awk` 證明綁定下一行即 `robots:`，AC-2 未達成但歸因至未獲核准的 feature `039`，經獨立複核正確，不構成拒絕理由。
- Cycle 2: PASSED-with-finding — verify cycle 2；surface 1 檔／+66 淨行（+69/-3，本票一檔；指令與 AC 逐字未變，三筆刪除為被取代的通過條件原文，已以 blockquote 逐字保留）；AC unchanged。F-1／F-2／F-3／F-4 經 reviewer 獨立重驗全部確認修好、無回歸、無越界（F-1 依 FO 指示由 reviewer 自行重跑 G-1 驗證，六張票全部 FOUND）。F-6 fix（Material，本票擁有，reviewer 於 cycle 2 才發現且自陳 cycle 1 漏看：G-1／G-2 的通過條件寫 `status` 為 `archived`，但本 workflow 的 enum 無此值——README:81 為 design／implement／verify／review／complete，封存票實際是 `status: complete`＋`verdict: PASSED`，全 repo `status: archived` 命中 0 張，故該 gate 的通過條件**構造上不可能成立**）。implement 刻意採比 FO 建議更嚴的判準（`verdict: PASSED` 而非「非空」），三項理由：「非空」會讓 REJECTED 的票替該項背書、封存路徑本身不是結論證據（反例 `_archive/023` 為 `status: design`／`verdict` 空）、REJECTED 與空 verdict 走兩列原有的「captain 逐票明確接受」人工出口。可否證性：新判準全 repo 命中 34 張、舊判準命中 0 張；指令逐字未變經程式比對為 True。round record 依 captain 明確授權跳過（原話：「跳過 round record，直接重跑 reviewer」）——round room 已轉錄並 commit 在 main，但未記錄。
- Cycle 3: REVISE — verify gate（captain 2026-09-23 親自裁決並授權本輪，即 README disposition 規定的 Cycle 3 升級之答覆）；surface 1 檔／+56 淨行（+59/-3；修法本身 +16/-3，其餘為 stage report）；AC unchanged（全節逐字未變，程式比對）。verify cycle 3 判 PASSED，退回非因缺陷，而是 captain 採納「本票交付物就是一道能被執行的 gate，F-7／F-8 兩項恰恰是關於它能不能被執行」。F-7 fix（Deferred risk，本票擁有：G-1／G-2 的「captain 逐票明確接受」出口無記錄位置亦無查核指令——章節導言把「寫在 Feedback Cycles」限定在人工項，而 G-1／G-2 標的是機械項，涵蓋不到）；修法為指定記錄位置與固定格式，並補一條對八張票逐張印 RECORDED／NO-RECORD 的查核指令。F-8 fix（Deferred risk：G-8 的 `npx tsc --noEmit` 會因 `.next/types/` 殘留重複檔假性失敗，本輪實際撞到一次）；修法為在 G-8 補上執行順序（先 `npm run build` 或 `rm -rf .next` 再跑 tsc），並寫明成因為 `tsconfig.json` 的 include 含 `.next/types/**/*.ts` 而 exclude 只有 `node_modules`、專案位於 `~/Documents/` 同步資料夾產生檔名帶「 2」的重複檔——**環境問題，不是候選缺陷**。implement 本輪另自行抓到一個真缺陷：F-7 的查核指令原以中文為前綴，抽出成獨立腳本執行時每圈噴 `grep: illegal byte sequence`（設 LANG／LC_ALL 亦然），判定「一條以腳本形式跑就報錯的 gate 指令不算可查核」，改為純 ASCII；並以副本實測證明該指令可翻轉（補一筆 058 例外記錄 → 058 由 NO-RECORD 翻為 RECORDED，其餘七張不變）。round record 依 captain 先前授權跳過（原話：「跳過 round record，直接重跑 reviewer」）——room 已轉錄並 commit 在 main，但未記錄。
- Cycle 4: REVISE — verify gate（captain 2026-09-23 親自裁決）；surface 1 檔（本票）；AC unchanged（全節逐字未變，程式比對）。verify cycle 4 判 PASSED——F-7／F-8 皆以 reviewer 提出時的同一標準驗過（查核指令抽出成 194 bytes 獨立腳本執行、翻轉測試在副本獨立重現、F-8 另加一段 implement 沒做的復原檢查證明 `npm run build` 確實會刪掉殘留檔），兩項判斷題也都判 implement 正確。退回的是 reviewer 在 cycle 4 抓到、且**由 cycle 4 自己造出來**的一項問題。F-9 fix（fail-open：新的查核指令 grep 整份 entity 而非 `### Feedback Cycles` 區段，檔案任何一行以該前綴加真實票號開頭都會回報 RECORDED，reviewer 在副本上重現兩次——**gate 會宣稱一個沒有人簽過的核准**）。captain 採納的論點：本票的主題就是「看起來對但執行時不成立的檢查」，F-6 是主條件不可達、F-7 是出口無法稽核、F-9 是檢查會說謊，前兩個都修了第三個不該帶著交付。implement 先在副本重現兩種誤報情境確認問題為真，再以 `awk` 限縮到該區段並改用 `index($0, ...)==1` 取代正規錨點（順便避開 cycle 4 被中文 pattern 咬過的跳脫與編碼問題），最後以**從文件抽出的指令**雙向驗證：誤報情境不再算 RECORDED、而放進 `### Feedback Cycles` 的那一行仍然算得到。F-10 fix（FO 裁量與 reviewer 建議不同）：reviewer 查 CloudDocs 不存在、`brctl` 無輸出而判「不是 iCloud」，但 FO 複核發現在本 sandbox 下兩項檢查皆回 `Operation not permitted`——**是被擋住不是不存在**，故 reviewer 的結論與原註記的結論都未經證實；處置改為**不歸因**，只留症狀與解法，並記明該歸因源自 FO 的 scope notes、implement 照抄未查證。round record 依 captain 先前授權跳過（原話：「跳過 round record，直接重跑 reviewer」）。
- Cycle 5: REVISE — verify gate（captain 2026-09-24 親自裁決，並同日給出一次性授權「授權修正 `Verified by:` 涵蓋既有寫法變體，不改 AC 要求本身」）；surface 1 檔（本票）；AC unchanged。verify cycle 5 判 PASSED——F-9 雙向驗證以從文件抽出的指令完成（282B、純 ASCII、stderr 零位元組、exit 0），誘餌放進 Out of scope 與 stage report 兩處，舊指令兩次都報 RECORDED（fail-open 重現）、新指令報 NO-RECORD；而在同一次執行中真實記錄仍報 058 RECORDED、誘餌票 049 報 NO-RECORD——**這兩列正是用來排除「假修法」的**，一條永遠回 NO-RECORD 的指令會通過方向 (a) 卻悄悄殺掉那條出口。reviewer 並主動承認它在 F-10 上判斷錯誤（cycle-4 的檢查帶了 `2>/dev/null`，使 `Operation not permitted` 與「不存在」無法區分；不加抑制重跑後連 `~/Library` 本身都回 `Operation not permitted`），自陳「我對別人用了一個自己沒做到的標準」。F-11 fix（fail-open，**非本輪引入**，G-5 自 design 階段即如此：掃描寫 `前端工程師 [AB]`，其中半形空格是必要的，故無空格寫法、全形空格、簡體 `某学者`／`某大学`、全形 `５個重點` 全部掃不到；G-5 以零命中為通過故 fail-open。**而 G-5 正是本票為了防止 `015` 事故（`某學者，某大學法律系` 公開顯示四個月）而加的那道檢查——它自己就是該事故的重演路徑。**目前三個既有佔位值仍抓得到故為 Deferred risk，但若 `052` 改寫 `contributors.ts` 時把那個空格拿掉即刻失效）。修法嚴守授權邊界：**字串集合完全沒有變動**——沒有新增任何要掃的字串，只是每個既有字串多認了寫法變體。雙向驗證：十一個字串新 pattern 全數 HIT；對 `src/` 的實掃與舊 pattern `diff` 完全相同（無誤抓），三個既有佔位值仍抓得到。其他 G 項的涵蓋面一項未改，理由已列。round record 依 captain 先前授權跳過。

## Out of scope

不施工任何一項——每項該修的另循其票。不處理 SSOT 產線把關（features 040／042／043／050）。不建立防止文件過時的機制（feature 054）。

## Stage Report: design

- DONE: 清單 A1–A4、B1–B3、C1–C3、D1–D2 全部以當下 repo 與實際頁面重新查證，每項標明「仍成立／已變動／已消失」並附可重跑的指令或檔案行號；不得沿用 2026-09-07 快照的結論。
  第一節的十三列複驗表（含檢查清單未列的 D3）。十項仍成立、A2 部分變動、D1／D2 線上已消失。實際頁面查證用 `npx next dev -p 3199` 起站後逐頁抓取，非只讀程式碼。快照表原文保留，上方已加警告不得引用其「查證」欄。
- DONE: 每一項指定一種結論類型——修（指向既有票號，或明確說明該開哪張新票）／明確接受（記下理由與接受者）／移除——且沒有任何一項停在「待確認」或「待決定」。
  第二節結論表共十五項（B1 拆為 B1a／B1b，新增 D4）。修：A2、A3、B1a、B2、B3、C1、C2、C3、D3、D4；明確接受：A1、A4、B1b、D1、D2；移除：A2 的六個未接線元件、B1b 的目標、C1 的按鈕。六張新票 `058`–`063` 已指名標題，兩張既有票指向 `052`／`049`。
- DONE: 決定這道 gate 由誰、在哪個時點執行，並寫明它與「移除 noindex」的綁定方式（哪個檔案、哪一行、雙向引用怎麼做），使「一道不會被觸發的 gate」這個失敗模式可被查證排除。
  第三節。執行者 captain ＋ FO 代跑機械項；時點為移除 `layout.tsx:8` 之前，不設日期。綁定三處：`layout.tsx` 第 5–7 行註解（緊貼 `robots:` 上方，唯一繞不過的位置）、`TODO.md` 的 P3-8、`AGENTS.md:51`；本票第三節反向列出三者的檔案與行號。可查證排除的依據是 AC-3 的 `grep -rn '056-pre-launch-checklist'`，三檔各需至少一筆命中。

### 驗證與可否證性

- `npx tsc --noEmit` 通過（無輸出）。斷言的是型別基準線未被本階段破壞；本階段未改任何 `.ts`／`.tsx`，故此項若失敗代表 repo 本身在 `bd4fca2` 就是壞的。
- AC-3 的 `grep` 目前**三檔皆零命中**，即設計要求的綁定尚未建立。這是 implement 的工作，已如實寫入 Test plan 的實測表，不宣稱通過。
- G-5 的佔位掃描目前**三筆命中**（C1 一筆、C2 兩筆），故 gate 現在不通過。同樣如實記錄。
- G-6 的 `node` 輸出 `false false`。若日後有人把 `h2` 或 `h28` 重新標成 `Approved`，同步會讓該列回到 `history.json`，此指令即翻為 `true`，gate 失敗——這是 D1／D2「明確接受」的反向保護，也是該項唯一的失敗途徑。
- A3 的零入口結論以七個頁面的實際抓取為據。若任何人在 `Navbar.tsx` 的 `NAV_ITEMS` 或 `Footer.tsx` 加上 `/quiz`，該檢查即出現命中，結論翻轉。

### Summary

複驗推翻了快照的三項事實：A2 的 CTA 數字不是硬寫的 16 而是 `{OPINIONS.length}`（現為 12），且 CTA 的數字來源與目的地渲染的資料不是同一份；D1／D2 的錯誤列已被 `isApproved()` 濾出線上。另外找到兩件快照沒有的事：`h34`／`h35` 標題一字不差（列為 D4，開票 `063` 之外另開 `062`），以及 `049` 的一項前提已失效——它指的兩個渲染點現在無任何 import，該票的線上風險只剩 `StanceSpectrum.tsx`。

兩項設計決定值得 captain 特別看：**B1b 判定「夥伴看全部、公眾看三頁」在現行架構下做不到**（無登入機制，前端 `localStorage` 可被繞過），因此把該目標移除而非修它，這推翻了已封存的 `033` 的假設；**AC-2 的驗收綁在 feature `039` 上**——本 repo 無瀏覽器工具，而 `LaunchGate.tsx:30` 讓 `curl` 對整站零命中，任何只讀 SSR HTML 的驗證都會假通過。這一點本次複驗獨立重現了一遍。

## Stage Report: implement

- DONE: 三處 noindex 綁定全部落地：`src/app/layout.tsx` 第 5–7 行註解區塊緊貼 `robots:` 上方追加指向本票的一行、`docs/health-check/TODO.md` 的 P3-8 補「解除條件」、`AGENTS.md:51` 同時指向 P3-8 與本票。可否證方式為 `grep -rn '056-pre-launch-checklist'` 對三檔各至少一筆命中——目前三檔皆零命中，所以這項現在一定是失敗的。
  三檔命中數為 1／5／1，全部非零；`grep -rn '056-pre-launch-checklist' src/app/layout.tsx docs/health-check/TODO.md AGENTS.md` 現輸出七列，先前為零列。**行號已漂移**：綁定註解落在 `layout.tsx:8`，`robots:` 因此推到第 9 行；語意位置以指令證實，見下節。`AGENTS.md` 原第 51 行原文保留，新增第 52–53 行。`TODO.md` P3-8 在「狀態」下方新增「解除條件」一條（`:807`）。
- DONE: D1／D2 的反向保護寫進 `docs/health-check/TODO.md` 的 P0-2 與 P0-6：`h2`／`h28` 重新標 `Approved` 之前必須經法學確認，並讓第三節 G-6 的檢查指令可原樣重跑並印出 `false false`。
  P0-2（`:239-246`）與 P0-6（`:348-356`）各新增「反向保護」一條，寫明重新標 `Approved` 之前必須先有法學確認記錄，並在兩節開頭各追加一則 2026-09-21 補述。兩節原文全部保留；P0-6 的「解除方式」只追加「此步驟以上一條的確認記錄為前置」一句。G-6 指令從 `TODO.md` 抽出後原樣執行，輸出 `false false`、離開碼 0。

### 驗證與可否證性

本階段的全部改動在 commit `6c9fc65`（分支 `spacedock-ensign/056-pre-launch-checklist`），
共四個檔案：`src/app/layout.tsx`、`docs/health-check/TODO.md`、`AGENTS.md`、本票。diff 看 git log。

- AC-3／G-7 的 `grep`：三檔各至少一筆命中（1／5／1）。斷言的是綁定存在。任何人刪掉 `layout.tsx:8` 那行註解，該檔即回到零命中，本項翻為失敗——那正是綁定要擋的動作。
- **相鄰性以指令證明，不以閱讀證明**：`awk '/056-pre-launch-checklist/{n=NR; getline nxt; printf "binding at line %d; next line %d = %s\n", n, NR, nxt}' src/app/layout.tsx` → `binding at line 8; next line 9 =   robots: { index: false, follow: false },`。若有人把這行註解移到檔尾，`next line` 就不再是 `robots:` 那行，AC-3 的附加條件即失敗。
- G-6 可原樣重跑：`grep -h "i.includes('h2')" docs/health-check/TODO.md | sed 's/^  //' | sort -u` 收斂為單一列（證明 P0-2 與 P0-6 兩處的指令位元組完全相同），把該列交給 `bash` 執行輸出 `false false`、離開碼 0。本票第三節 G-6 的離開碼型（`if(...)process.exit(1)`）亦回傳 0。若有人把 `h2` 或 `h28` 重新標成 `Approved`，下次同步會讓該列回到 `history.json`，輸出翻為 `true`／離開碼翻為 1，gate 失敗。這是這兩項「明確接受」唯一的失敗途徑。
- `npx tsc --noEmit` 離開碼 0、無輸出。斷言的是註解追加未破壞 `metadata` 物件的型別；若漏掉 `//` 或把該行寫進物件字面值中間，此項會失敗。
- `npm run build` 離開碼 0，16 條路由全數產出。建置產物仍輸出 `<meta name="robots" content="noindex, nofollow"`。斷言 noindex 本身未被動到——本階段只建立綁定，不解除 noindex。
- `npm run build` 前後 `src/data/*.json` 的 sha256 相同（`discussions.json` `4071978a…`、`history.json` `4d1992e3…`）。斷言 build 未觸發內容同步。

### Summary

三處綁定與兩處反向保護全部落地，AC-3 的 `grep` 從三檔零命中翻為三檔皆命中。`layout.tsx` 的綁定是關鍵一處，其相鄰性已用 `awk` 證明「下一行就是 `robots:`」，而非只確認字串存在。G-6 的指令在 P0-2 與 P0-6 兩處位元組完全相同，可從文件抽出直接執行。

**未達成一項，如實記錄：AC-2（A 類四項的實際渲染驗證）本階段無法達成。** 本 repo 無 `playwright`／`puppeteer`，本機無 Chrome，而 `LaunchGate.tsx:30` 讓任何只讀 SSR HTML 的檢查必然假通過。AC-2 綁在 feature `039`（尚未獲 captain 核准動工）上，而本階段依指示不得自行建立任何常設檢查機制。此項留待 `039` 交付，或由 captain 人工開瀏覽器驗證。

**本階段刻意未做三件事**：未開 `058`–`063` 六張新票（依 design 第二節為 FO 的工作）；未動 `PresentDetail.tsx`（C1 的覆寫點尚待 captain 回答是否有真實信箱）；未更新 `docs/INDEX.md` 的「最後查核」日期——本階段只複核 `TODO.md` 的 P0-2、P0-6、P3-8 三節，把整份文件的查核日期改成 2026-09-21 會是過度宣稱。

## Stage Report: verify

- DONE: 不採信 implement 報告的任何自我宣稱，獨立重跑 AC-3 的 `grep`、`layout.tsx` 綁定相鄰性的 `awk` 證明、G-6 的 `node`、`npx tsc --noEmit` 與 `npm run build`，逐條貼出實際輸出；並確認 build 產物仍輸出 `noindex, nofollow`、且 `src/data/*.json` 的 sha256 與 main 相同。任一項只有結論沒有輸出即視為未驗。
  六項全部獨立重跑，輸出與 implement 報告一致。詳見下方「獨立重跑輸出」。
- DONE: 執行本 stage 的具名 placeholder 掃描（G-5 的 `grep -rniE`），逐筆判定每個命中是否都對應到已開立的票，並確認沒有任何**新的**佔位值或設計文件的樣本資料流入 shipped 資料檔。
  G-5 三筆命中，與 design 記錄相同，無新增。`src/data/*.json` 佔位掃描零命中，且與 main 位元組相同。**但票號對應只有兩筆成立**：`contributors.ts:16,21` → `052`（存在，`status: design`）；`PresentDetail.tsx:32` → `061` **不存在**（見 F-1）。
- FAILED: 逐項判定 AC-1 至 AC-4 是否成立 …… 最後給出 PASSED 或 REJECTED 與理由。
  判定完成，結論為 **REJECTED**。AC-3 成立；AC-2 未達成但誠實且歸因正確；**AC-1 部分不成立、AC-4 不成立**。理由見「AC 逐項判定」與 F-1／F-2。

### 獨立重跑輸出

| 項 | 指令 | 本階段實測輸出 | 與 implement 報告 |
|---|---|---|---|
| AC-3／G-7 | `grep -rn '056-pre-launch-checklist' src/app/layout.tsx docs/health-check/TODO.md AGENTS.md` | 七列；每檔命中數 `1／5／1`（`layout.tsx:8`、`AGENTS.md:52`、`TODO.md:217,246,330,356,807`） | 一致 |
| AC-3 相鄰性 | `awk '/056-pre-launch-checklist/{n=NR; getline nxt; printf "binding at line %d; next line %d = %s\n", n, NR, nxt}' src/app/layout.tsx` | `binding at line 8; next line 9 =   robots: { index: false, follow: false },` | 逐字一致 |
| G-6 離開碼型 | `node -e "…if(i.includes('h2')||i.includes('h28'))process.exit(1)"` | 無輸出，離開碼 `0` | 一致 |
| G-6 印出型 | `node -e "…console.log(i.includes('h2'),i.includes('h28'))"` | `false false`，離開碼 `0` | 一致 |
| G-6 位元組同一 | `grep -h "i.includes('h2')" docs/health-check/TODO.md \| sed 's/^  //' \| sort -u` | 收斂為單一列（`TODO.md:242` 與 `:352` 完全相同） | 一致 |
| G-8 型別 | `npx tsc --noEmit` | 無輸出，離開碼 `0` | 一致 |
| G-8 建置 | `npm run build` | 離開碼 `0`，`✓ Generating static pages (16/16)`，路由表 15 列 | 一致（「16 條路由」實為 16/16 靜態頁計數器，路由表 15 列；無實質差異） |
| noindex 未被動到 | 掃 `.next/server/app/**/*.html` | 15 個 HTML 中 **14 個**帶 `<meta name="robots" content="noindex, nofollow"`；唯一例外 `_global-error.html`（見 F-4） | implement 只稱「仍輸出」，未量化；未偽稱 |
| sync 未觸發 | `shasum -a 256 src/data/*.json`（build 前／後） | 前後相同：`4071978a…` `discussions.json`、`4d1992e3…` `history.json` | 一致 |
| 與 main 相同 | `git show main:… \| shasum -a 256`；`git diff main...HEAD -- src/data/` | 兩檔 sha256 與 main **完全相同**；diff 為空 | 一致。`package.json` 的 `build` 為 `next build`，`sync-content` 為獨立 script |

`src/components/PresentDetail.tsx` 未被改動：`git diff --name-only main...HEAD` 只有 `AGENTS.md`、`src/app/layout.tsx`、`docs/health-check/TODO.md`、本票四檔。

### 具名 placeholder 掃描（本 stage 的具名輸出）

`grep -rniE '某學者|某大學|lorem ipsum|前端工程師 [AB]|volunteer@addcourt\.tw|快速了解最新判決的5個重點' src/` → **三筆**：

1. `src/components/PresentDetail.tsx:32` `mailto:volunteer@addcourt.tw` — 對應 C1。design 指派給**票 `061`，該票尚未開立**。依 dispatch，本階段不動此檔；命中為預期，但「對應到已開立的票」不成立。
2. `src/data/contributors.ts:16` `"前端工程師 A"` — 對應 C2 → 票 `052`（存在，`status: design`、`verdict:` 空）。成立。
3. `src/data/contributors.ts:21` `"前端工程師 B"` — 同上。成立。

**無新增佔位值，也無設計文件樣本資料流入 shipped 資料檔。** 證據兩重：`grep -rniE '某學者|某大學|某法官|某教授|lorem ipsum|placeholder|TBD|待補|範例|sample|測試用|快速了解最新判決的5個重點|前端工程師' src/data/*.json` 零命中；且 `src/data/*.json` 與 main 位元組相同，本分支結構上不可能注入。`contributors.ts` 六筆佔位（`:11,16,21,26,31,36`）為 C2 既有範圍，非本分支新增。

### design 第一節事實斷言複驗

| 斷言 | 實測 | 判定 |
|---|---|---|
| `opinions.ts` 的 `justiceName` 現為 12 筆 | `grep -c "justiceName: '"` → `12`；`OPINIONS` 條目 12 筆 | 成立（`grep -c 'justiceName'` 為 13，多的一筆是 `:53` 的型別欄位宣告） |
| `StanceSpectrum` 自帶 14 筆 | `JUSTICES` 陣列 14 筆（10 多數＋2 協同＋2 不同） | 成立 |
| `LaunchGate.tsx:30` hydration 前回傳 `null` | `30:  if (!ready) return null;` | 成立，行號未漂移 |
| `LaunchGate.tsx:32`／`Navbar.tsx:34`／`TrackCards.tsx:31` 兩分支同值 | 三處皆命中。`Navbar.tsx:8` 為 `const ALL_PAGES_LIST = ALL_PAGES;`，故 `:34` 的 `ALL_PAGES_LIST` 與 `ALL_PAGES` 同值 | 成立。`launch-status.ts:7-10` 的 env 預設邏輯亦確認（實際路徑為 `src/data/launch-status.ts`） |
| `PresentDetail.tsx:32` 佔位信箱 | 行號未漂移 | 成立 |
| `LazybagCtaSection.tsx:31,34` 取 `{OPINIONS.length}`／`{DIMENSIONS.length}` | `:31` `{OPINIONS.length} 則意見分析`、`:34` `{DIMENSIONS.length} 個觀察維度`；實測 `OPINIONS`=12、`DIMENSIONS`=4 | 成立，「12 則／4 個」數字正確 |
| 未接線元件共 697 行 | 25＋95＋99＋293＋147＋38 = **697** | 成立 |
| `discussions.json` 16 筆、無 `opposing_views`／`full_content` | `16 0 0`；`present/[id]/page.tsx:104` guard 恆 false | 成立 |
| `history.json` 40 筆、`h34`／`h35` 標題重複 | 40 筆；重複標題恰一組，計數 2 | 成立 |
| `future.ts:424` `requiredForRuling: 10`，渲染於三處 | `future.ts:424`、`future/page.tsx:79`、`:194`、`BottleneckFunnel.tsx:135` | 成立，四處行號全部未漂移 |
| `049` 的線上風險只剩 `StanceSpectrum`／`DecisionFlowchart` | 兩檔皆被 `src/app/opinion-lazybag/page.tsx:3,2` import 並渲染於 `:66,:44`；`OpinionTooltip`／`OpinionScatterPlot` 確認無任何 import | 成立 |

輕微漂移（語意位置仍成立，依 dispatch 不算錯）：`opinions.ts:96` 實際首筆 `justiceName` 在 `:97`；`StanceSpectrum.tsx:19-35` 實際區塊為 `19-37`；`TrackCards.tsx`／`LazybagCtaSection.tsx` 實際位於 `src/components/home/` 而 design 只寫檔名。

### AC 逐項判定

**AC-1 — 部分不成立。** 十五個項目（A1–A4、B1a、B1b、B2、B3、C1–C3、D1、D2、D3、D4）各有一個結論類型，無任何一項停在「待確認」或「待決定」——這一半成立。但 AC-1 另有一條：「**『修好』的項目必須指向可查證的證據——票號加合併記錄，或實際指令輸出**」。十個 `修` 項中，A2→`058`、A3→`059`、B1a→`060`、C1→`061`、D4→`062`、D3→`063` 六項所指的票**全部不存在**（見 F-1）。指向一個不存在的票號不是可查證的證據。

**AC-2 — 未達成，但誠實且歸因正確。** implement 報告以粗體自陳「未達成一項」，未宣稱通過，也未用 SSR HTML 假通過。歸因獨立複核成立：(a) `package.json` 無 `playwright`／`puppeteer`；(b) `LaunchGate.tsx:30` 確實在 hydration 前回傳 `null`，故 `curl` 對整站必然零命中；(c) `docs/constitution-features/039-render-check-tool.md` 的 `status:` 為 `design`、`verdict:` 為空，即尚未獲核准動工。歸因對象與阻擋理由都正確，**本項不構成拒絕理由**。

**AC-3 — 成立。** 三檔命中數 `1／5／1` 皆非零，且附加條件（`layout.tsx` 那一筆須在 `robots:` 正上方註解區塊內，不可放檔尾）已用 `awk` 證明下一行即 `robots:`。`git diff` 顯示 `layout.tsx` 為 `+1／-0` 純追加。本項是本票最紮實的一項。

**AC-4 — 不成立。** AC-4 要求「六個 `機械` 項逐條執行並貼出輸出。任一項只有結論沒有輸出即為失敗」。六個機械項為 G-1、G-2、G-5、G-6、G-7、G-8。**implement 報告只貼出三項的輸出（G-6、G-7、G-8），G-1、G-2、G-5 完全沒有出現。** 更根本的問題：**G-1 與 G-2 在全票內沒有任何可執行的指令**，只有散文式的通過條件（「每張票 `status` 為 `archived` 且 `verdict` 非空」），而 Test plan 的指令區塊只給了四條（tsc／build→G-8、AC-3 grep→G-7、G-5 grep、G-6 node）。本階段為了產出輸出必須自行撰寫 `for` 迴圈。AC-4 的標題是「gate 執行清單**可重跑**」——兩個項目沒有指令可跑，這一點在票本身修好之前無法成立（見 F-2）。

本階段已補跑 G-1 與 G-2，輸出如下（兩項現在都**不通過**，這是預期的：gate 在公開當下才跑，不是現在）：

- G-1：`for n in 058 059 060 061 062 063; do ls docs/constitution-features/${n}-*.md 2>/dev/null || echo "$n: NOT FOUND"; done` → **六張票全部 `NOT FOUND`**。現有最大票號為 `057`。
- G-2：`049` → `status: design`、`verdict:` 空；`052` → `status: design`、`verdict:` 空。兩張皆非 `archived`，故不通過。

(c) **`AGENTS.md`、`TODO.md` 的 P0-2／P0-6／P3-8 原文保留** — 以 `git diff main...HEAD` 逐檔核對，**如報告所稱，無以刪改掩蓋**。`git diff --numstat`：`AGENTS.md` `+2／-0`、`src/app/layout.tsx` `+1／-0`、`docs/health-check/TODO.md` `+34／-1`、本票 `+28／-1`。`TODO.md` 唯一的那筆刪除是 P0-6 的「解除方式」一行，原文逐字重出後追加「。此步驟以上一條的確認記錄為前置」一句——implement 報告已明確自陳此事，未隱瞞。P0-2、P3-8 兩節為純追加。

### Findings（本階段只做唯讀調查，不動候選位元組）

**F-1 — `058`–`063` 六張新票未開立，G-1 無對象可查。**
- 已釋出使用者與正常流程：captain 與 FO 依第三節「公開之前逐項跑」執行 gate。
- 可觀察損害：G-1 的通過條件指向六張不存在的票；design 第二節六個 `修` 結論、以及 G-5 三筆命中中的 `PresentDetail.tsx:32`，全部指向不存在的票號。gate 跑不到結論。
- 受影響的 value AC 或不可協商邊界：**AC-1**（「修好」須指向可查證證據）與 **AC-4**（G-1 須有輸出）。
- 觸發證據：`for n in 058…063` 六筆 `NOT FOUND`；現有最大票號 `057`。
- 建議：materiality = **Material**（兩條 AC 直接不成立）。task ownership = **FO**——design 第二節明文「由 FO 在本票 implement 階段開立」，implement 報告亦如實記錄它依此刻意未開；這不是 implement 的疏失。disposition 建議 = **fix by FO**（開立六張票），開完 G-1 即可執行。

**F-2 — G-1 與 G-2 無可執行指令，AC-4 依現行規格無法滿足。**
- 已釋出使用者與正常流程：同 F-1。
- 可觀察損害：AC-4 要求六個機械項「逐條執行並貼出輸出」，但票內只提供四條指令。下一個執行 gate 的人對 G-1／G-2 只能自行發明查法，等於這兩項不可重跑。
- 受影響的 AC：**AC-4**。
- 觸發證據：第三節 Gate 執行清單 G-1／G-2 兩列的「通過條件」欄為散文；Test plan 指令區塊五行內無 G-1／G-2 相關指令。本階段自撰迴圈才產出輸出。
- 建議：materiality = **Material**。task ownership = **本票自有範圍**（AC-4 是本票的 AC，補一行指令不擴張範圍）。disposition 建議 = **fix**——在 G-1／G-2 兩列補上可原樣重跑的指令（本階段自撰的兩條可直接採用）。**等 FO 授權後才動。**

**F-3 — design 的票號查法指令錯誤（Polish）。**
design 第二節寫「現有最大票號為 `057`（`grep -c . <(ls docs/constitution-features/0*.md)` 可查）」。該指令實測輸出 `22`，是檔案數，不是最大票號。`057` 這個結論本身由逐檔檢視確認**正確**。受影響的 AC：無。建議 disposition = **fix（一行）或 decline**。

**F-4 — build 產物的 `_global-error.html` 不帶 noindex（Deferred risk）。**
15 個預先產製 HTML 中 14 個帶 `noindex, nofollow`，唯 `.next/server/app/_global-error.html` 無。可觀察損害：**目前無**——該檔是 Next.js 的錯誤邊界回退頁，不在建置輸出的 15 列路由表內，且本站尚無對外網域。此缺口在 `main` 上即已存在，非本分支引入。promote-to-material 條件：若日後決定「已公開但仍保留 noindex」，這是唯一的漏洞。建議 disposition = **decline**，或由 FO 決定是否記入 `TODO.md` 的 P3-8。

**F-5 — design 第一節的行號／路徑輕微漂移（Polish）。**
三處：`opinions.ts:96`（首筆在 `:97`）、`StanceSpectrum.tsx:19-35`（區塊為 `19-37`）、`TrackCards.tsx`／`LazybagCtaSection.tsx` 未標出實際目錄 `src/components/home/`。所有語意位置與計數（12／14／4／697）皆成立。依 dispatch，漂移本身不算錯。建議 disposition = **decline**。

### 驗證與可否證性

- AC-3 的兩條指令是本階段最強的證據，因為它們**同時可證真與可證偽**：任何人刪掉 `layout.tsx:8` 那行註解，該檔即回到零命中；把它移到檔尾，`awk` 的 `next line` 就不再是 `robots:` 那行。兩種破壞都會讓 AC-3 立即翻為失敗。
- `src/data/*.json` 未被動到，是用**與 main 的 sha256 相同**加上 `git diff` 為空兩種方式斷言，不是靠 build 前後相同——後者只能證明 build 未觸發同步，不能證明分支未手改。兩者都跑了。
- G-6 的可否證途徑唯一且明確：若有人把 `h2` 或 `h28` 重新標回 `Approved`，下次同步會讓該列回到 `history.json`，印出型翻為 `true`、離開碼型翻為 `1`。本階段兩型都跑過，都是通過態。
- AC-4 的失敗是**用缺席證明的**：我在 implement 報告全文中搜尋 G-1、G-2、G-5 的輸出，三者皆無。若 implement 曾貼出其中任一項，此判定即被推翻。
- 「原文保留」的判定不靠閱讀，靠 `git diff --numstat` 的刪除行數：三個程式／文件檔的刪除數分別為 `0`、`0`、`1`，唯一那筆刪除已逐字比對為「原文重出＋追加一句」。若 implement 曾悄悄改寫 P0-2 或 P3-8，刪除數不可能為 `0`。

### Summary

implement 的兩項 DONE 全部獨立重跑成立，逐字一致，無任何自我宣稱經不起重跑：AC-3 的三檔命中（`1／5／1`）、`awk` 相鄰性、G-6 兩型、`tsc`、`build`、build 產物的 noindex、以及 `src/data/*.json` 與 main 的 sha256 相同。`PresentDetail.tsx` 依 dispatch 未被動到。design 第一節十一項事實斷言全部與當下 repo 相符，僅三處行號／路徑輕微漂移且語意位置成立。具名 placeholder 掃描交付：三筆命中皆為既有範圍，shipped 資料檔零命中且與 main 位元組相同，**無新佔位值或設計文件樣本資料流入**。

implement 的誠實度值得記錄：它主動以粗體自陳 AC-2 未達成、歸因到未獲核准的 `039`、並列出三件「刻意未做」的事。AC-2 的歸因經獨立複核完全正確，**不構成拒絕理由**。

**判定：REJECTED。** 兩條 AC 不成立，而且兩者同源——**六張新票 `058`–`063` 從未開立**。因此 AC-1 的「『修好』須指向可查證證據」對六個 `修` 項不成立（票號不存在），AC-4 的 G-1 無對象可查；再加上 G-1／G-2 在票內根本沒有可執行的指令，AC-4 的「可重跑」依現行規格無法滿足（六個機械項中 implement 只貼出三項輸出）。

**拒絕的落點不在 implement。** design 第二節明文把開票指派給 FO，implement 亦如實記錄它依此刻意未開。F-1 的 task ownership 屬 FO，F-2 屬本票自有範圍。依 README 的 `## Review-finding disposition`，本階段保留 finding、只做唯讀調查、不動候選位元組，等 FO 的明確授權。

## Stage Report: implement (cycle 2)

本輪只執行 FO 逐項授權的三項處置（F-2 fix、F-3 fix、F-4 補記錄），全部改動在 commit `041ce56`。F-1 由 FO 自行修復，F-5 授權 decline，兩者皆未動一個位元組。

- DONE: 在第三節 Gate 執行清單的 G-1 與 G-2 兩列補上可原樣重跑的指令，使六個「機械」項全部有指令可跑；貼出兩條指令的實測輸出。AC-4 的「可重跑」在此之前不成立。不得改動 AC-4 的文字。
  第三節 `:167`（G-1）、`:168`（G-2）各補一條 `for` 迴圈，印出每張票的 `status` 與 `verdict`，並涵蓋 `_archive/` 路徑（票封存後會搬家）。兩條指令刻意不含 `|`，因此在 markdown 表格內無需轉義，複製即可執行。實測輸出見下節。**AC-4 的文字逐字未動**，以指令證明（見下節）。
- DONE: 修正 design 第二節括號內的票號查法指令（現寫 `grep -c . <(ls docs/constitution-features/0*.md)`，實測輸出 22 即檔案數，不是最大票號），並說明 main 現已有 058–063 故重跑輸出會與 design 當時不同；`057` 這個結論本身正確，不要改結論。
  `:121` 移除括號內的錯誤指令，`:123-128` 追加一則 2026-09-21 更正，寫明原指令、它為何錯（輸出 `22` 是檔案數）、正確查法、以及「`057` 結論本身正確」。同時寫明重跑現在會輸出 `063` 而非 `057`，原因是六張票已開立，並註明輸出不同不代表結論錯。**結論 `057` 未改。**
- DONE: 在第三節補一行記錄 `_global-error.html` 不帶 noindex 為已知的非阻擋缺口，並寫明 promote-to-material 條件（若日後決定「已公開但仍保留 noindex」，這是唯一漏洞）。這是記錄，不得改動 build 產物、`layout.tsx` 或 Next.js 設定。
  `:178-180` 在 Gate 執行清單下方補三行 blockquote：缺口內容與重跑指令、為何目前無可觀察損害（main 上即存在、錯誤邊界回退頁、無對外網域）、以及 promote-to-material 條件。**`layout.tsx`、`next.config.ts`、build 產物皆未改**，本輪 `git diff --name-only` 只有本票一檔。

### 驗證與可否證性

- **G-1／G-2 的「可原樣重跑」以抽出執行證明，不以閱讀證明**：用 python 從 `| G-1 `／`| G-2 ` 兩列的反引號內抽出指令字串寫入檔案，再交給 `bash` 執行。G-1 輸出六列 `058`–`063` 全部 `status: design`／`verdict:` 空，離開碼 0；G-2 輸出 `049`、`052` 兩列同樣 `design`／空，離開碼 0。**兩項現在都不通過 gate，這是正確結果**——八張票都還沒封存，gate 本來就該在公開當下才通過。若有人把指令改成不可執行（漏引號、誤加 `|` 未轉義），這條抽出執行會失敗。
- **AC-4 文字未動以指令證明**：比對 `git show HEAD:…056…md` 與工作區檔案的 `## Acceptance criteria` 段落，兩邊各 20 行且**逐字相同**（`a == b` 為 `True`），`AC-4 — gate 執行清單可重跑` 原句仍在。若本輪動了任何一個 AC 字元，此比對即為 `False`。
- **F-3 的新查法可執行**：`ls docs/constitution-features/0*.md | sed 's#.*/##' | cut -d- -f1 | sort -n | tail -1` → `063`。原指令 `grep -c . <(ls docs/constitution-features/0*.md)` → `22`。兩者輸出不同即證明原指令查的不是最大票號。
- **F-4 的新指令可執行**：`find .next/server/app -name '*.html' -exec grep -L 'content="noindex' {} +` → 只印 `.next/server/app/_global-error.html`。15 個預製 HTML 中僅此一檔，與 verify 報告的計數一致，本階段獨立重現。此指令取代原先寫入的巢狀引號版本，因為那一版複製後容易轉義出錯，不算「可原樣重跑」。
- **F-1 獨立確認，未動位元組**：`for n in 058…063; do ls …; done` 六筆全部存在（`058-opinion-lazybag-unwired-removal-cta-alignment.md` 等）。merge `10d82e8` 已生效，無需回報異常。
- **其餘四個機械項本輪重跑**：G-5 三筆命中（`PresentDetail.tsx:32`、`contributors.ts:16`、`:21`）→ 不通過，**這是預期的**，兩者各有其票（`061`／`052`），依禁令未動；G-6 `false false`；G-7 三檔 `1／5／1`；G-8 `npx tsc --noEmit` 離開碼 0、`npm run build` 離開碼 0（15 條路由）。build 前後 `src/data/*.json` 的 sha256 相同。
- **本輪的四筆刪除逐筆交代**（`git diff --numstat` 為 `+46／-4`，只有本票一檔）：`status: verify` 一行是 **FO 推進階段時改的 frontmatter**，在本 ensign 開工前就已存在於工作區，非本 ensign 所改（本 ensign 不改 frontmatter）；另三筆是被取代的原文——design 第二節那一句（更正說明已把原指令逐字重出）、G-1 與 G-2 兩列（通過條件文字保留並擴充）。**無以刪改掩蓋。**
- merge `10d82e8` 未觸及 `src/`、`package.json`、`package-lock.json`（`git diff --name-only 96e056b 10d82e8 --` 對三者為空），故 cycle 1 的型別與建置基準線仍成立；本輪仍重跑一次確認。

### Summary

三項授權處置全部落地，本輪 `git diff` 只有本票一個檔案——沒有動任何程式碼、build 產物或 Next.js 設定。AC-4 現在可以依原文被滿足：六個機械項都有指令，而且 G-1／G-2 的指令已用「從表格列抽出後交給 bash」的方式證明可原樣執行，不是只寫在紙上。

**gate 目前仍不通過，而且應該不通過。** G-1／G-2 八張票全在 `design`、`verdict` 空；G-5 有三筆佔位命中。這兩件事各有其票，本輪依禁令一項未動。gate 的用途是在公開當下擋住，不是現在就綠燈。

**AC-2 維持未達成。** 依 FO 指示不建立任何常設檢查機制，仍綁在未獲核准的 feature `039` 上。此項與 cycle 1 的記錄一致，本輪無新進展也無新阻擋。

## Stage Report: verify (cycle 2)

- DONE: 獨立重驗 F-2 是否真的修好：G-1 與 G-2 兩列現在是否有**可原樣重跑**的指令……貼出實際輸出與離開碼；並確認六個「機械」項現在全部有指令可跑，AC-4 的「可重跑」因此成立。
  **成立。** 未閱讀表格取信，改以 python 從 `| G-1 `（`:167`）與 `| G-2 `（`:168`）兩列的反引號內抽出唯一以 `for n in` 開頭的字串（G-1 該列 7 個反引號區段中唯一一個、G-2 該列 3 個中唯一一個），分別寫入 `extracted-G-1.sh`（257 bytes）、`extracted-G-2.sh`（241 bytes），交給 `bash` 執行。輸出見下節，兩者離開碼皆 `0`。六個機械項現在全部有指令，AC-4 成立。
- DONE: 重驗 F-3 與 F-4。
  F-3 已修：`:121` 的句子移除括號內錯誤指令、`057` 結論逐字未改，`:123-128` 追加更正並說明重跑會輸出 `063` 的原因。F-4 只在第三節 `:178-180` 補三行記錄，`git diff --name-only c222313..HEAD -- src/ next.config.ts next.config.js package.json package-lock.json` **輸出為空**，build 產物、`layout.tsx`、Next.js 設定一個位元組未動。
- DONE: 確認 cycle 2 沒有回歸也沒有越界……最後給出 PASSED 或 REJECTED 與理由。
  無回歸、無越界。AC 文字逐位元組未改（見下節）。判定 **PASSED**。另記一筆新 finding **F-6**（非本輪引入、不阻擋本輪判定，須在 gate 實際執行前處置）。

### F-2 重驗：從表格抽出、交給 bash 執行

```
$ bash extracted-G-1.sh                    $ bash extracted-G-2.sh
058 status: design verdict:                049 status: design verdict:
059 status: design verdict:                052 status: design verdict:
060 status: design verdict:                G2_EXIT=0
061 status: design verdict:
062 status: design verdict:
063 status: design verdict:
G1_EXIT=0
```

**兩項都不通過 gate，而這是正確結果**——八張票都還在 `design`，gate 本來就該在公開當下才通過。

**額外做一次可否證性探針**（implement 未做）：把 G-1 的票號換成三張已封存票加一個不存在的號碼，驗證 `_archive/` 分支與 `NOT FOUND` 分支都真的會動作，證明該指令不是恆真的空轉——
`021 status: complete verdict: PASSED` ／ `026 status: complete verdict: PASSED` ／ `033 status: complete verdict: PASSED` ／ `999 NOT FOUND`，離開碼 `0`。指令確實會依 repo 狀態給出不同結果。

### F-3／F-4 重驗

| 項 | 檢查 | 實測 |
|---|---|---|
| F-3 舊指令 | `grep -c . <(ls docs/constitution-features/0*.md)` | `28`（cycle 1 時為 `22`；六張新票開立後檔案數 +6）。輸出隨檔案數漂移，與最大票號無關，**原判斷成立** |
| F-3 新指令 | `ls docs/constitution-features/0*.md \| sed 's#.*/##' \| cut -d- -f1 \| sort -n \| tail -1` | `063`，正確 |
| F-3 結論 | `057` 是否被改動 | 未改。`:121` 仍為「現有最大票號為 `057`，故 `058` 起連號無衝突」 |
| F-3 原文 | 錯誤指令是否被悄悄刪除 | 否。更正區塊 `:124` 逐字重出原指令再說明它為何錯，符合 `AGENTS.md`「不要悄悄改寫原文」 |
| F-4 指令 | `find .next/server/app -name '*.html' -exec grep -L 'content="noindex' {} +` | 只印 `.next/server/app/_global-error.html`；預製 HTML 共 `15` 個。與記錄一致 |
| F-4 範圍 | `src/`／`next.config`／`package*` 是否被動 | `git diff --name-only c222313..HEAD` 對四者**皆空**。本輪 `056` 之外只有 merge 帶進的票檔 |

### 無回歸確認

| 項 | 實測 | 對比 cycle 1 |
|---|---|---|
| AC-3／G-7 | 七列；`1／5／1` | 一致 |
| AC-3 相鄰性 | `binding at line 8; next line 9 =   robots: { index: false, follow: false },` | 逐字一致 |
| G-5 | 三筆（`PresentDetail.tsx:32`、`contributors.ts:16`、`:21`） | 一致；**兩張對應票現在都存在**（`061`／`052`） |
| G-6 | 離開碼型 `0`；印出型 `false false` | 一致 |
| G-8 | `npx tsc --noEmit` 離開碼 `0` 無輸出；`npm run build` 離開碼 `0`，`16/16` 靜態頁 | 一致 |
| `src/data/*.json` | build 前後 sha256 相同；且與 `main` 位元組相同（`git diff main..HEAD -- src/data/` 為空） | 一致 |
| AC 文字 | `## Acceptance criteria` 段落與 `c222313` 比對：**1622 bytes 對 1622 bytes，`a == b` 為 `True`** | 一個位元組未改 |

`src/app/layout.tsx` 相對 `main` 仍只有 cycle 1 那一行綁定（`+1／-0`），cycle 2 未再動它。

### F-1 重驗（FO 修復，非本輪 implement 範圍）

六張票全部 FOUND，且**標題與 design 第二節的指派逐字相符**：`058` 未接線元件移除與 CTA 數字對齊、`059` 測驗全站無入口、`060` `?public=true` 預覽開關失效、`061` 移除佔位信箱按鈕、`062` `h34` 與 `h35` 標題重複、`063` `requiredForRuling` 的法律正確性（114憲判9）。不是只有號碼對上：`061` 內文 `:20` 明寫 `PresentDetail.tsx:32` 的 `volunteer@addcourt.tw`，`052` 內文 `:16` 明寫 `src/data/contributors.ts` 六筆佔位。**G-5 三筆命中現在全部對應到已開立且確實擁有該處的票**，cycle 1 的 AC-1 缺口因此消失。

我 cycle 1 判「六張票未開立」是對當時 worktree 的誠實觀察，但根因是 worktree 過時而非票未開；FO 的歸因正確，我接受更正。

### 新 finding

**F-6 — G-1／G-2 的機械通過條件指定了本 workflow 不存在的 `status` 值。**
- 已釋出使用者與正常流程：captain 與 FO 依第三節「公開之前逐項跑」執行 gate。
- 可觀察損害：兩列的通過條件寫「每張票印出的 `status` 為 `archived` 且 `verdict` 非空」，但本 workflow 沒有 `archived` 這個值。指令跑得出結果，**但該結果永遠不可能滿足所寫的條件**。這正是本票 Problem 一節要防的「一道不會被觸發的 gate」。
- 受影響的 value AC 或邊界：無 AC 直接失敗（AC-4 只要求六個機械項有指令並產出輸出，這一點成立），受影響的是第三節 gate 機制本身的可結論性。
- 觸發證據：`docs/constitution-features/README.md:81` 的 enum 為 `design, implement, verify, review, complete`；`grep -rl '^status: archived' docs/constitution-features/` **零命中**；全 repo `status:` 值統計為 `complete 34／design 27／verify 1／review 1`；上節探針顯示已封存的 `021`／`026`／`033` 印出的是 `status: complete verdict: PASSED`。
- 建議：materiality = **Material**（gate 的機械條件不可達），惟兩列另有「或 captain 逐票明確接受並記錄理由」的人工出口，故非硬性阻斷，嚴重度低、修法為兩格各改一個詞。task ownership = **本票自有範圍**（不動 AC 文字）。disposition 建議 = **fix**：把 `archived` 改為 `complete`，或寫成「`complete` 且檔案已移入 `_archive/`」。
- **此項非 cycle 2 引入**：原 design 的 G-1 列即如此寫，cycle 2 依授權只補指令、刻意保留通過條件原文，處置正確。**cycle 1 是我漏看**——我當時只查「有沒有指令」，沒查「條件可不可達」；是 cycle 2 讓指令可跑、我拿已封存票做探針才顯出來。**不阻擋本輪判定，但須在 gate 實際執行前處置。**

### 驗證與可否證性

- F-2 的「可原樣重跑」是**抽出執行**證明的，不是閱讀證明：若指令漏引號、誤含未轉義的 `|`、或 `_archive/` 分支寫錯，抽出後交給 `bash` 會報錯或輸出錯誤筆數。另以四票探針證明它會隨 repo 狀態改變輸出，排除恆真空轉。
- AC 文字未改以**位元組比對**斷言（1622 == 1622 且 `a == b`），不是靠肉眼掃過。本輪若動了任何一個 AC 字元，此比對即為 `False`。
- F-4 的「未越界」以 `git diff --name-only` 對 `src/`、`next.config.*`、`package*` 四個路徑斷言為空，不是靠 implement 的自述。
- G-6 的可否證途徑不變：`h2` 或 `h28` 被重標 `Approved` 後同步回檔，印出型即翻 `true`、離開碼型翻 `1`。
- F-6 的判定可被單一指令推翻：若 `grep -rl '^status: archived' docs/constitution-features/` 出現任何命中，或 README 的 enum 含 `archived`，此 finding 即不成立。兩者本輪皆已跑，皆否定。

### Summary

三項授權處置全部獨立重驗成立，且都在授權範圍內收手：F-2 的兩條指令從表格抽出後交給 `bash` 實跑，離開碼皆 `0`，六個機械項現在全部有指令，**AC-4 的「可重跑」成立**；F-3 換掉錯誤查法、逐字保留 `057` 結論並重出原指令說明錯在哪；F-4 只補三行記錄，`src/`、Next.js 設定、build 產物一個位元組未動。無回歸：AC-3 的 `1／5／1` 與 `awk` 相鄰性、`tsc`、`build`、`src/data/*.json` 與 `main` 相同，全部與 cycle 1 逐字一致，**AC 文字 1622 bytes 位元組相同**。

F-1 經獨立重驗確認由 FO 修復：六張票不只號碼存在，標題與 design 指派逐字相符，`061`／`052` 內文確實擁有 G-5 命中的那兩處，cycle 1 的 AC-1 缺口消失。

**判定：PASSED。** AC-1 成立（十五項各有結論，六個 `修` 項現在指向確實存在且擁有該處的票）；AC-3 成立；AC-4 成立；AC-2 維持未達成，但依 FO 指示綁在未獲核准的 feature `039`，歸因經獨立複核正確，且本輪未以任何替代方式假稱通過——**這是誠實的未達成，不是缺失**。

**一項必須帶走：F-6。** gate 的 G-1／G-2 通過條件寫的 `status: archived` 在本 workflow 不存在（enum 為 `design/implement/verify/review/complete`，全 repo 零命中）。它不是 cycle 2 引入的，也不讓任何 AC 失敗，因此不阻擋本輪；但 gate 實際執行前必須處置，否則這兩項的機械條件永遠不可達。依 `## Review-finding disposition`，本階段只記錄、不動位元組，等 FO 授權。

## Stage Report: implement (cycle 3)

本輪只處理 F-6 一件事，全部改動在 commit `5c1be8c`。未動 `src/`、build 產物、`layout.tsx`、Next.js 設定、`PresentDetail.tsx`，未跑 `sync-content`。

- DONE: 把第三節 G-1 與 G-2 兩格的通過條件從「`status` 為 `archived` 且 `verdict` 非空」改成實際可達成的判準（封存票的實際訊號是 `status: complete` 且 `verdict` 非空，檔案並已移入 `_archive/`）；原句以追加補述方式保留並說明它為何不可達成，比照先前處理 F-3 的作法。不得改動兩列的指令本身，也不得改動任何 AC 文字。
  `:167`（G-1）改為「`status` 為 `complete` 且 `verdict` 為 `PASSED`」；`:168`（G-2）改為「同 G-1（含 2026-09-22 的更正）」。`:176-183` 追加七行 blockquote，逐字保留原句並說明它為何構不到。**指令與 AC 皆逐字未變**，以程式比對證明（見下節）。
- DONE: 自行判斷通過條件該不該同時要求 `verdict: PASSED`，或該如何處理 `verdict: REJECTED`（被取代／作廢的後續票代表該項並未被修好），並把判斷理由寫進 stage report——不接受只改一個字。
  **判斷：要求 `verdict: PASSED`，比 FO 括號內建議的「`verdict` 非空」更嚴。理由見下方「判斷理由」一節。**
- DONE: 貼出改完後把 G-1／G-2 兩列指令原樣抽出執行的實際輸出與離開碼，並對照新的通過條件逐票說明現在為何仍不通過（八張票皆未結案，這是正確結果）。
  輸出與逐票對照見下方「逐票對照」一節。八張票全部 `status: design`、`verdict` 空，兩條指令離開碼皆 0。

### 判斷理由：為何是 `PASSED`，不是「非空」

FO 的括號寫「`status: complete` 且 `verdict` 非空」。**我刻意沒照抄，改用 `verdict: PASSED`。** 三個理由：

1. **「非空」把 `REJECTED` 也算通過。** 本 gate 的用意是「每一項都必須有結論——修好、明確接受、或移除」。一張 `verdict: REJECTED` 的後續票代表它的工作**沒有被接受**，那一項並沒有修好。用「非空」會讓一張被否決的票替該項背書，這是第二道假通過——與本票要防的事同型。
2. **「在 `_archive/` 裡」本身不是結論的證據。** `_archive/023-owl-mascot-unification.md` 的 `status` 是 `design`、`verdict` 是空的。票可以**未結案就被封存**。所以判準必須看 `status` 與 `verdict` 兩個欄位，不能看檔案路徑。實測 35 張封存票中 34 張為 `complete`＋`PASSED`，`023` 是唯一例外，而正是這個例外證明路徑靠不住。
3. **`REJECTED` 與空 `verdict` 不是死路，有既有出口。** 兩列原本就寫著「或 captain 逐票明確接受並記錄理由」。我把 `REJECTED`、空 `verdict`、`NOT FOUND` 三種情形一律歸為「尚未有結論」，走這條人工出口，或另開後續票。gate 不替被否決的票背書，但也不會因此卡死。

### 逐票對照：現在為何仍不通過

G-1 抽出執行（離開碼 0）：

| 票 | 指令輸出 | 對照新條件 |
|---|---|---|
| `058` | `status: design` `verdict:` | 非 `complete`，`verdict` 空 → 尚未有結論 |
| `059` | `status: design` `verdict:` | 同上 |
| `060` | `status: design` `verdict:` | 同上 |
| `061` | `status: design` `verdict:` | 同上 |
| `062` | `status: design` `verdict:` | 同上 |
| `063` | `status: design` `verdict:` | 同上 |

G-2 抽出執行（離開碼 0）：`049` 與 `052` 同樣 `status: design`、`verdict` 空，兩張皆尚未有結論。

**八張票全部不通過，這是正確結果。** 六張新票 `058`–`063` 是本票 implement 階段才由 FO 開立的，兩張既有票 `049`／`052` 也還在 `design`。gate 的用途是在公開當下擋住，不是現在就綠燈。

### 驗證與可否證性

- **新判準構得到，舊判準構不到**——這是 F-6 的核心可否證點。掃全 repo：符合 `status: complete` 且 `verdict: PASSED` 的票有 **34 張**；符合舊條件 `status: archived` 的票有 **0 張**。拿兩張已封存票套 G-1 的指令形狀：`044 status: complete verdict: PASSED`、`033 status: complete verdict: PASSED`，兩張都會過新條件。若新判準也是零命中，本輪的修法即與 F-6 同錯。
- **指令逐字未變**：從 HEAD 版本與工作區版本的 `| G-1 `／`| G-2 ` 兩列各抽出反引號內字串比對，`G-1 指令逐字未變: True`、`G-2 指令逐字未變: True`。若我順手動了指令，此比對即為 `False`。
- **AC 文字逐字未變**：比對兩版的 `## Acceptance criteria` 段落，`True`。
- **抽出執行仍可跑**：改完後重新抽出兩列指令交給 `bash`，G-1 印六列、G-2 印兩列，離開碼皆 0。修通過條件沒有破壞可重跑性。
- **殘留檢查**：`grep -n 'archived' 本票` 只剩兩類命中——`:177-178` 是刻意逐字保留的原句與它的反證，其餘全在既往 stage report 與 verify 報告內，屬歷史記錄，依專案規範不改寫。本票已無任何**現行有效**的條件仍以 `archived` 為判準。
- **未越界**：本輪 `git diff --name-only` 只有本票一個檔案，`--numstat` 為 `+69／-3`。三筆刪除逐筆交代：`status: verify` 是 **FO 推進階段改的 frontmatter**，本 ensign 開工前就在工作區，非本 ensign 所改；另兩筆是 G-1／G-2 兩列被整列取代，其中指令部分已證明逐字相同，被改的只有通過條件那一句，原句已逐字保留在 `:177`。**無以刪改掩蓋。**

### 一件觀察，未改，供 FO 判斷

第三節結尾那句「並把本票 `status` 推進到封存」用的是白話的「封存」，不是機器判準，故不屬 F-6 同型問題，本輪依指示未改。若 FO 認為該與新判準用語對齊（改寫為 `complete` 並移入 `_archive/`），請另行授權；我不自行擴張範圍。G-3 至 G-8 的通過條件已逐條複核，無不可達成的判準。

### Summary

F-6 修好：G-1／G-2 的通過條件從一個 workflow 裡根本不存在的 `status: archived`，換成實測 34 張票構得到的 `status: complete` 且 `verdict: PASSED`。原句逐字保留在表下補述，並附上「為何構不到」的反證指令。

**我沒有照抄 FO 括號內的建議。** FO 寫「`verdict` 非空」，我改用 `verdict: PASSED`，因為「非空」包含 `REJECTED`——一張被否決的後續票不代表該項修好了，沿用「非空」會做出第二道假通過。`REJECTED`、空 `verdict`、`NOT FOUND` 三者一律歸為「尚未有結論」，走兩列原本就有的 captain 人工出口。

順帶找到一件支持這個判斷的事實：`_archive/023` 的 `status` 是 `design`、`verdict` 是空的。**票可以未結案就被封存**，所以判準不能看檔案在不在 `_archive/`，必須看兩個欄位。

## Stage Report: verify (cycle 3)

- DONE: 獨立重驗 F-6 是否真的修好且**新判準構得到**……並確認舊判準 `status: archived` 命中 0 張……另請獨立驗證 `_archive/023-owl-mascot-unification.md`。
  **新判準構得到，舊判準構不到，兩個數字獨立重現。** 自行解析全 63 張票的 frontmatter：符合 `status: complete` 且 `verdict: PASSED` 者 **34 張**；符合舊判準 `status: archived` 者 **0 張**。`_archive/023-owl-mascot-unification.md` 確為 `status='design'`、`verdict` 空，且是 35 張封存票中**唯一**的例外。implement 舉的反例精確無誤。
- DONE: 判定 implement 刻意採比 FO 建議更嚴的判準……以及它把 `REJECTED`／空 `verdict`／`NOT FOUND` 三種情形一律歸為「尚未有結論」並走人工出口，是否會讓 gate 卡死或漏放。
  **三項理由我都實質評估過，結論是：判準正確、不卡死、不漏放，但第 3 項的出口欠缺器械。** 詳見下方「三項理由的實質評估」。
- DONE: 確認未越界也未回歸……最後給出 PASSED 或 REJECTED。
  無越界、無回歸，全部以位元組比對或實跑證明。判定 **PASSED**。另記兩筆新 finding：**F-7**（人工出口未指定記錄位置）與 **F-8**（G-8 的 `tsc` 會因 `.next/` 殘留而假失敗）。兩者皆非本輪引入，皆不使任何 AC 失敗。

### F-6 修法重驗

| 檢查 | 實測 | 判定 |
|---|---|---|
| 新判準命中數 | `status: complete` ∧ `verdict: PASSED` → **34 張** | 構得到 ✅ |
| 舊判準命中數 | `status: archived` → **0 張** | 構不到，F-6 成立 ✅ |
| 全 repo `status`×`verdict` 分布 | `complete`＋`PASSED` 34／`design`＋空 27／`review`＋空 1／`verify`＋空 1 | 無其他組合 |
| `_archive/023` 反例 | `status='design'`、`verdict` 空；35 張封存票中唯一例外 | 反例成立 ✅ |
| 判準與 workflow 終局定義是否一致 | `README.md:161`：「Terminal stage……`verdict: PASSED`, entity archived」 | 新判準恰為 workflow 文件定義的終局狀態 ✅ |

### 三項理由的實質評估

**理由 1（用 `PASSED` 而非「非空」）——成立，且與 F-6 不同型。**
`README.md:85` 寫明 `verdict` 是 enum：`PASSED or REJECTED`。**`REJECTED` 在 enum 內，`archived` 不在 status enum 內**——這是關鍵分野：F-6 錯在指定了一個不存在的值，理由 1 指定的是 schema 允許的值，不是同一個錯誤的翻版。
惟須誠實記下尺度：全 repo 目前 **0 張票**帶 `verdict: REJECTED`，`verdict` 實際只出現 `PASSED` 與空兩種。因此今天「非空」與「等於 `PASSED`」**效果完全相同**，這條更嚴的判準此刻是空轉的。它的價值在於 schema 允許的未來狀態，代價為零。**在兩個當下等價的選項中選了安全的那個，理由正確，我背書。**

**理由 2（不能看檔案在不在 `_archive/`）——成立，但它防的是一個沒被採用的作法。**
`023` 的反例我獨立驗證無誤。須指出：兩列的指令本來就讀 `status` 與 `verdict` 兩個欄位，從未以路徑為判準，所以這條理由是**為既有設計辯護**，不是改變了什麼。作為寫進文件的理由它有價值——它擋住未來有人「簡化」成看路徑。

**理由 3（`REJECTED`／空／`NOT FOUND` 一律走 captain 人工出口）——出口真的存在，不會變成第二個 F-6，但欠缺器械。**

*出口存在嗎？* 存在。G-1 現行文字逐字含「或 captain 逐票明確接受並記錄理由」；G-2 以「通過條件同 G-1（含 2026-09-22 的更正）」繼承。以讀取實際位元組確認，非採信報告。

*它會變成另一個永遠不被觸發的分支嗎？* **不會，而且與 F-6 的差別是結構性的。** F-6 的 `status: archived` 是**構造上不可達**——workflow 裡沒有任何行為者能產生那個值，再多人力也無法使它為真。captain 出口則是**一個真實行為者能執行的動作**：captain 正是第三節指定的 gate 執行者；`### Feedback Cycles` 是活的記錄位置，目前已載有 Cycle 1／Cycle 2 兩筆；G-4 本身就是同形狀的既有 `人工` 項。三者都在，分支可執行。

*會卡死嗎？* 不會——**這條出口正是防卡死的設計**。若沒有它，六張後續票只要有一張被否決或放棄，gate 就永遠無法通過，反而製造 F-6 型的死結。

*會漏放嗎？* 系統性漏放不會，但有一個未上器械的縫。第三節「Gate 執行清單」前言寫「`人工` 項 captain 判斷並留下簽字（**寫在本票的 Feedback Cycles**）」——但 **G-1／G-2 的類型欄是 `機械`，不是 `人工`**，該句字面上沒有涵蓋到「在機械項內動用人工出口」這個情形；出口本身只寫「記錄理由」，沒寫記在哪，也沒有任何指令能驗證「確實有一筆記錄存在」。於是 gate 執行時，機械那半產出可查的輸出，人工出口那半不產出任何可查的東西。這是**器械不足**，不是分支不可達。列為 F-7。

### 未越界、未回歸（全部以位元組比對或實跑證明）

| 檢查 | 方法 | 結果 |
|---|---|---|
| G-1／G-2 **指令**逐字未變 | 自行從兩版的表格列抽出反引號字串比對，不採信報告 | G-1 `257B` vs `257B`、G-2 `241B` vs `241B`，**皆 `True`** |
| AC 全節逐字未變 | 與 `1f58ad8` 比對 `## Acceptance criteria` 全段 | `1622B` vs `1622B`，**`True`**（與 cycle 1／2 亦同值） |
| 原通過條件逐字保留 | 抽出 cycle 2 的 G-1 原句，與 `:177` blockquote 內「」中的字串比對 | **`VERBATIM MATCH: True`** |
| 抽出後仍可跑 | 改完後重新抽出交給 `bash` | G-1 印六列、G-2 印兩列，離開碼皆 `0` |
| 八張票對照新條件 | 全部 `status: design`、`verdict` 空 | 仍不通過——**正確結果**，gate 該在公開當下才綠燈 |
| `git diff` 範圍 | `git diff --name-only 1f58ad8..HEAD` | **只有本票一個檔案**；對 `src/`／`next.config.ts`／`package.json` 為空 |
| AC-3／G-7 | 三檔 `grep` | `1／5／1` |
| AC-3 相鄰性 | `awk` | `binding at line 8; next line 9 =   robots: { index: false, follow: false },` |
| G-5 | 佔位掃描 | 三筆（皆既有，各有其票 `061`／`052`） |
| G-6 | `node` | `false false` |
| G-8 build | `npm run build` | 離開碼 `0`；`src/data/*.json` build 前後 sha256 相同，且與 `main` 位元組相同 |
| G-8 型別 | `npx tsc --noEmit` | **離開碼 `0`**——但本輪第一次執行曾失敗，原因已查明並非候選改動，見 F-8 |

### 新 finding

**F-7 — G-1／G-2 的 captain 人工出口沒有指定記錄位置，也沒有任何檢查。**
- 已釋出使用者與正常流程：captain 於公開前執行 gate，遇到後續票未結案而動用「逐票明確接受」出口。
- 可觀察損害：目前無。出口可執行，但不產生可查的產物；gate 可能在沒有任何書面記錄的情況下通過 G-1／G-2。
- 受影響的 AC 或邊界：無 AC 失敗（AC-4 只要求六個機械項有指令並產出輸出，仍成立）。受影響的是第三節 gate 的可稽核性。
- 觸發證據：G-1 現行文字只寫「記錄理由」未寫位置；第三節前言把「寫在本票的 Feedback Cycles」限定於 `人工` 項，而 G-1／G-2 的類型欄為 `機械`；全票無任何指令可驗證該記錄存在。對照組 G-4 寫的是「理由寫入本票」。
- 建議：materiality = **Deferred risk**（觸發情境尚未發生）。**promote-to-material 條件**：gate 實際執行、G-1 或 G-2 經由該出口通過、而 `### Feedback Cycles` 無對應記錄。task ownership = 本票自有範圍。disposition 建議 = **fix（一個子句）**：比照 G-4，把出口改寫為「captain 逐票明確接受，理由寫入本票的 `### Feedback Cycles`」。**非本輪引入**——該子句自 design 原稿即存在，cycle 2、cycle 3 均逐字保留，處置正確。

**F-8 — G-8 的 `npx tsc --noEmit` 會因 `.next/` 內的殘留檔案假失敗。**
- 已釋出使用者與正常流程：FO 於 gate 執行時代跑 G-8。
- 可觀察損害：**本輪實際發生過一次。** 本輪第一次跑 `npx tsc --noEmit` 得到 `.next/types/routes.d 2.ts(65,8): error TS2300: Duplicate identifier 'LayoutProps'.`、離開碼 `2`。`tsconfig.json` 的 `include` 含 `.next/types/**/*.ts`，故 `.next/types/` 內任何重複檔都會被納入編譯。該 ` 2.ts` 檔是檔案系統層的重複產物（本 repo 位於 `Documents/` 下的同步資料夾），不是候選改動產生的。
- 受影響的 AC 或邊界：無 AC 失敗。受影響的是 G-8 的可信度——**這是假失敗，不是假通過**，方向是 fail-safe，但一個會亂叫的 gate 項會訓練人忽略它。
- 觸發證據（三段式，可完整複現）：(1) `.next/types/` 清空重建後 `npx tsc --noEmit` → 離開碼 `0`；(2) 刻意 `cp '.next/types/routes.d.ts' '.next/types/routes.d 2.ts'` 後重跑 → **逐字重現同一則錯誤**、離開碼 `2`；(3) 刪除該檔後重跑 → 離開碼 `0`。且 `git diff --name-only 1f58ad8..HEAD -- '*.ts' '*.tsx'` 為空，候選一個原始碼檔都沒動。
- 建議：materiality = **Deferred risk**（觸發已實際觀察到，但成因在環境不在候選）。task ownership = 本票自有範圍。disposition 建議 = **fix（一個子句）**：G-8 改為先 `npm run build`（會重建 `.next/types/`）再跑 `tsc`，或在跑 `tsc` 前 `rm -rf .next`。**非本輪引入。**

### 驗證與可否證性

- F-6 修法的核心可否證點是**兩個計數**：新判準 34、舊判準 0。若新判準也是 0，修法即與 F-6 同錯——本輪獨立解析 63 張票的 frontmatter 得到 34，反證成立。
- 「指令與 AC 未變」以**位元組比對**斷言（257/241/1622 三個長度全等且 `==` 為 `True`），不是肉眼掃過；任何一個字元被動，比對即翻 `False`。
- 「原句逐字保留」不是看有沒有引號，是把 cycle 2 的原句抽出來與 blockquote 內的字串做相等比較，得 `True`。
- F-8 的歸因以**刻意重現**證明，不是推測：造一個重複檔就重現錯誤，刪掉就消失，來回兩次。若候選真有型別錯誤，清空 `.next/` 後仍會失敗——實測離開碼 `0`。
- 理由 1 的評估可被單一事實推翻：若 `README.md:85` 的 `verdict` enum 不含 `REJECTED`，則理由 1 就是 F-6 的翻版；實測 enum 為 `PASSED or REJECTED`，故不是。
- 理由 3 的評估可被推翻：若 `### Feedback Cycles` 不存在或從未被使用，該出口即為不可達；實測該節存在且已載 Cycle 1／Cycle 2 兩筆記錄。

### Summary

F-6 修好，且修法本身通過了與當初抓它時同一套標準：新判準 `status: complete` ∧ `verdict: PASSED` 實測 **34 張票構得到**，舊判準 `status: archived` **0 張**，兩個數字獨立重現；新判準恰好等於 `README.md:161` 定義的 workflow 終局狀態。`_archive/023` 的反例精確——35 張封存票中唯一一張未結案卻已封存的票，它證明判準必須看欄位不能看路徑。

**implement 不照抄 FO 建議、改用更嚴的 `verdict: PASSED`，我判定正確並背書**，理由是 `REJECTED` 在 `README.md:85` 的 verdict enum 內（與 F-6 的 `archived` 不在 status enum 內是結構性差別）。同時誠實記下：全 repo 目前 0 張 `REJECTED`，這條更嚴的判準此刻與「非空」等價、實際空轉，價值在未來、代價為零。

**第 3 項理由——人工出口——我的判斷是：出口真實存在、可執行、防的正是卡死，不會變成第二個 F-6。** 與 F-6 的分野是結構性的：`archived` 構造上不可達，而 captain 是 gate 的指定執行者、`Feedback Cycles` 是已載有兩筆記錄的活位置、G-4 是同形狀的既有人工項。但它**欠缺器械**：出口沒寫記在哪（前言的 Feedback Cycles 指示只涵蓋 `人工` 項，而這兩列是 `機械`），也沒有任何指令能驗證記錄存在。列為 F-7。

無越界、無回歸：指令 `257B`／`241B`、AC `1622B`、原句逐字保留，三者位元組比對皆 `True`；`git diff` 只有本票一檔。

**判定：PASSED。** 兩筆新 finding 皆為 Deferred risk、皆非本輪引入、皆不使任何 AC 失敗，依 `## Review-finding disposition` 只記錄不動位元組：**F-7** 人工出口未指定記錄位置；**F-8** G-8 的 `tsc` 會因 `.next/` 殘留假失敗（本輪實際撞到一次，已用刻意重現證明成因在環境不在候選）。兩者建議的修法各是一個子句，宜在 gate 實際執行前一併處置。

## Stage Report: implement (cycle 4)

本輪即 FO 記為 **Cycle 3**（captain 2026-09-23 授權）的那一輪；本節的 `cycle 4` 是 stage report 的序號，兩個計數器不同。只處理 F-7 與 F-8，未動 `src/`、build 產物、`layout.tsx`、Next.js 設定、`PresentDetail.tsx`，未跑 `sync-content`。

- DONE: F-7：在 G-1／G-2 的「captain 逐票明確接受並記錄理由」出口補上記錄位置與可查核方式，比照 G-4 的形狀補一個子句；補完之後請說明這條出口現在要怎麼被查核，以及為什麼它不會變成另一個永遠不被執行的分支。原句以追加補述保留。
  `:167` 的出口子句改為「理由逐票寫入本票 `### Feedback Cycles`，一張票一行」；`:185-191` 追加補述，含固定格式與查核指令。原句逐字保留於 `:177`（F-6 那則補述內），本輪未動。查核方式與「為何不會變成第二個 F-6」見下方兩節。
- DONE: F-8：G-8 補一句——先 `npm run build`（重建 `.next/types/`）或 `rm -rf .next` 再跑 `npx tsc --noEmit`；並寫明成因（`tsconfig.json` 的 include 含 `.next/types/**/*.ts` 而 exclude 只有 `node_modules`，本專案位於 `~/Documents/` 下的同步資料夾會產生檔名帶「 2」的重複檔），讓 gate 執行者遇到時知道這是環境問題、不要去改原始碼。貼出改完後照新步驟實跑的輸出與離開碼。
  `:174` 的 G-8 通過條件補上執行順序；`:193-197` 追加補述，寫明成因、解法與三段實測。照新步驟實跑：`npm run build` 離開碼 `0`，接著 `npx tsc --noEmit` 無輸出、離開碼 `0`。
- DONE: 確認未越界也未回歸：G-1／G-2 的**指令本身**與 F-6 修好的通過條件逐字未變（自行抽出比對）、AC 全節逐字未變、`git diff` 只有本票一個檔案；並重跑 AC-3 的三檔 `grep` 與 `awk` 相鄰性確認無回歸。
  六項全部 `True`／無回歸，逐項輸出見下方「驗證與可否證性」。本輪只有本票一檔；修法本身為 `+16／-3`，連同本節 stage report 一併提交後為 `+59／-3`（commit `c2988e8`）。

### F-7：這條出口現在怎麼被查核

**記錄位置**：本票的 `### Feedback Cycles`，一張票一行，格式固定 `- gate-exception {票號}：captain 明確接受。理由：{一句話}。{YYYY-MM-DD}`。

**查核指令**對八張票逐張印 `RECORDED` 或 `NO-RECORD`，captain 有沒有簽字看得出來。**2026-09-23 實跑**：八張全部 `NO-RECORD`、離開碼 0——現在還沒有任何票走這條出口，正確。

**指令刻意全用 ASCII，這不是風格選擇。** 我原本把前綴寫成中文「gate 例外」、輸出寫成「有例外記錄」，從文件抽出成獨立腳本執行時每一圈都噴 `grep: illegal byte sequence`（即使 `LANG=en_US.UTF-8`、即使 `LC_ALL` 明寫亦然；同一條 pattern 直接在互動 shell 打則正常）。一條在本機以腳本形式跑就報錯的 gate 指令不算可查核，故改為純 ASCII 前綴與輸出，實測不再報錯。

### F-7：為什麼它不會變成第二個 F-6

**F-6 壞在主條件，這一條是例外出口，兩者不同形。** F-6 的 `status: archived` 在本 workflow 構造上不可達（enum 裡沒有這個值，全 repo 零命中），**主條件不可達＝gate 永遠不會通過**，那是致命的。這一條的主條件已證明構得到（全 repo 34 張票符合 `complete`＋`PASSED`），出口只在某張票被否決或作廢時才用得上。**出口沒被用到不算壞掉；主條件不可達才算。**

它也不是無法被觀察的分支：查核指令對每張票印 `RECORDED`／`NO-RECORD`，用了沒用、用在哪張票，都在輸出裡。**可否證性**：若在 `### Feedback Cycles` 補一行 `- gate-exception 058：…`，該指令就應該把 `058` 從 `NO-RECORD` 翻成 `RECORDED`。我用副本實測過這個翻轉：複製本票到暫存目錄、補一筆 `058` 的例外記錄、跑同一條指令 → `058 RECORDED`，其餘七張仍 `NO-RECORD`。**若翻不動，這條出口就是裝飾品**——它翻得動。

### 驗證與可否證性

- **F-8 三段實測，成因在環境不在候選**：(1) 殘留 `routes.d 2.ts`／` 3.ts`／` 4.ts` 時 `npx tsc --noEmit` 印三筆 `error TS2300: Duplicate identifier 'LayoutProps'`、離開碼 `2`；(2) `rm -rf .next` 後 `tsc` → 離開碼 `0`，`npm run build` 後 `tsc` → 離開碼 `0`；(3) 刻意 `cp .next/types/routes.d.ts ".next/types/routes.d 2.ts"` 重建該檔 → **同一錯誤逐字重現**、離開碼 `2`，刪掉後 → 離開碼 `0`。全程 `git status` 只有本票一檔，`src/` 零變動。若成因在候選，步驟 (2) 不可能通過。
- **G-8 照新順序實跑**：`npm run build` 離開碼 `0`（15 列路由表），接著 `npx tsc --noEmit` 無輸出、離開碼 `0`。
- **指令與 F-6 判準逐字未變**：`G-1 指令逐字未變: True`、`G-2 指令逐字未變: True`；G-1 格內 F-6 的兩個判準片段（「`status` 為 `complete` 且 `verdict` 為 `PASSED`」與「印出 `NOT FOUND`、`verdict` 為空、或 `verdict` 為 `REJECTED`，一律視為該項尚未有結論，不通過」）皆 `True` 仍在；G-2 仍為「通過條件同 G-1（含 2026-09-22 的更正）」。本輪只在兩者之間換掉出口那一個子句。
- **AC 全節逐字未變**：`True`。
- **AC-3 無回歸**：三檔命中數仍為 `1／5／1`；`awk` 相鄰性仍為 `binding at line 8; next line 9 =   robots: { index: false, follow: false },`。
- **其餘機械項無回歸**：G-6 `false false`；G-7 三檔共七列命中。
- **未越界**：`git diff --name-only` 只有本票一檔。修法本身 `+16／-3`；連同本節 stage report 提交為 `+59／-3`。三筆刪除逐筆交代：`status: verify` 是 **FO 推進階段改的 frontmatter**，本 ensign 開工前就在工作區；另兩筆是 G-1 與 G-8 兩列被整列取代，G-1 的指令部分已證明逐字相同、F-6 判準片段仍在，G-8 只在原通過條件前加上執行順序。**無以刪改掩蓋。**

### Summary

F-7 與 F-8 都修好，本輪 `git diff` 只有本票一檔，全部改動在 commit `c2988e8`。F-7 給那條原本「存在但查不到」的出口指定了記錄位置（`### Feedback Cycles`，固定格式）與一條逐票印 `RECORDED`／`NO-RECORD` 的查核指令，並以副本翻轉測試證明它翻得動，不是裝飾品。F-8 在 G-8 前面補上「先 `npm run build` 或 `rm -rf .next`」，並寫明成因是 `~/Documents/` 同步資料夾產生的重複檔被 `tsconfig` 的 `include` 掃進去——寫進票裡是為了讓 gate 執行者遇到時不要去改原始碼。

**一件必須講的事：F-7 的查核指令我沒有照自己第一版寫法交付。** 第一版用中文前綴與中文輸出，從文件抽出成獨立腳本跑會逐圈噴 `grep: illegal byte sequence`，`LC_ALL` 明寫也沒用。一條在本機跑就報錯的指令不算「可查核」，所以改成純 ASCII 前綴 `gate-exception` 與 `RECORDED`／`NO-RECORD` 輸出，實測乾淨。記錄行的其餘內容仍是中文。

**AC-2 維持未達成**，仍綁在未獲核准動工的 feature `039`，本輪未以任何替代方式宣稱通過，也未自建常設檢查機制。gate 整體仍不通過（G-1／G-2 八張票皆未結案、G-5 三筆佔位命中），各有其票，依禁令未動。

## Stage Report: verify (cycle 4)

- DONE: 獨立重驗 F-7：把新的查核指令從文件抽出成獨立腳本執行，貼出實際輸出與離開碼；並獨立重現它的翻轉測試。
  抽出為 194 bytes 的獨立腳本（純 ASCII 確認 `True`），執行輸出八張票全部 `NO-RECORD`、離開碼 `0`、**stderr 為 0 bytes**（無 `illegal byte sequence`）。翻轉測試在副本上獨立重現：補一筆 `058` 的例外記錄後，同一腳本把 `058` 印成 `RECORDED`、其餘七張不變。**出口翻得動，不是裝飾品。**
- DONE: 獨立重驗 F-8：照 G-8 新的執行順序實跑，貼出兩段離開碼；並判定補述對成因的描述是否足以讓 gate 執行者不會去改原始碼。
  四段實跑全部通過，含一段 implement 未做的**復原驗證**：`npm run build` 確實會刪掉殘留檔。補述**足以**阻止執行者改原始碼——但它指名的成因（iCloud）經查不成立，見 F-10。
- DONE: 判定 implement 的論證是否成立……以及新的固定格式會不會因為格式漂移而讓查核指令漏掉真實存在的例外記錄。最後確認未越界並給出 PASSED 或 REJECTED。
  論證**成立**。格式漂移**會**漏掉，但漏的方向全部是 fail-safe；真正的問題是反方向的 **fail-open**，見 F-9。未越界，判定 **PASSED**。

### F-7 重驗：抽出執行與翻轉測試

```
$ bash f7-check.sh            (194 bytes, pure ASCII = True)
058 NO-RECORD   059 NO-RECORD   060 NO-RECORD   061 NO-RECORD
062 NO-RECORD   063 NO-RECORD   049 NO-RECORD   052 NO-RECORD
EXIT=0          stderr = 0 bytes
```

**翻轉測試（在副本上，候選位元組未動）**：複製本票到暫存目錄 → 於 `### Feedback Cycles` 補一筆 `058` 的例外記錄 → 同一腳本輸出 `058 RECORDED`，其餘七張仍 `NO-RECORD`、離開碼 `0`。事後 `git status --porcelain` 對候選為空。**翻得動。**

**關於 `grep: illegal byte sequence`：我無法重現，但這不影響結論。** 我以中文前綴的變體在本機測了 ugrep 7.8.4 與 `/usr/bin/grep`、四種 locale（未設／`C`／`POSIX`／`en_US.UTF-8`）、腳本與互動兩種形式，**全部乾淨退出，無一報錯**。implement 描述的故障在我手上沒有出現。這不構成問題：ASCII pattern 在所有上述組合下都可靠，是嚴格更安全的選擇，交付物本身實測無誤。合理的成因可能是當時腳本檔被寫入時多位元組序列截斷，而非中文 pattern 本身——若是如此，那是寫檔方式的問題，改用 ASCII 同樣正確地迴避了它。**我只記錄「未能重現」這個事實，不據此質疑修法。**

### 判斷題一：「出口沒被用到不算壞掉，主條件不可達才算」

**這個區分站得住，我同意。** 兩者在 gate 的因果位置不同：

| | F-6 的 `status: archived` | F-7 的 captain 例外出口 |
|---|---|---|
| 位置 | **主條件** | **例外出口** |
| 可達性 | 構造上不可達（enum 無此值，全 repo 0 命中） | 主條件已證明可達（34 張票符合） |
| 不被觸發的後果 | **gate 永遠不會通過**——致命 | 沒有票被否決時本來就用不到——正常 |
| 可觀察性 | 無 | 逐票印 `RECORDED`／`NO-RECORD` |

一條路徑「目前為空」與「原理上走不通」是兩回事。F-6 是後者，這條出口是前者。**而且現在它可觀察**：用沒用、用在哪張票，都在輸出裡，不能只靠口頭宣稱——這正是 F-7 當初要求的東西。

### 判斷題二：格式漂移會不會漏掉真實記錄

**會，而且漏得不少。** 我在副本上實測十種合理寫法，只有兩種被認得：

| 寫法 | 結果 |
|---|---|
| 文件所列的標準格式 | **認得** |
| 全形冒號改成半形 `:` | **認得**（pattern 只比對到票號為止） |
| 縮排兩格或四格（巢狀在 Cycle 行下） | 漏掉 |
| 票號前多一個空格 | 漏掉 |
| 用 `*` 當項目符號 | 漏掉 |
| 票號省略前導零（`59`） | 漏掉 |
| 首字大寫 `Gate-exception` | 漏掉 |
| 票號前加 `#` | 漏掉 |
| 連字號寫成底線 | 漏掉 |

**但這八種漏掉全部指向 `NO-RECORD`，也就是 gate 不通過。方向是 fail-safe。** 後果是 captain 明明簽了字卻被判沒簽，gate 卡住——會惹人惱，不會放行不該放行的東西。以 gate 的用途而言，這個方向可以接受。

**真正的問題在反方向，而它存在。** 見 F-9。

### F-8 重驗：四段實跑

| 段 | 動作 | 離開碼 |
|---|---|---|
| A | `rm -rf .next` → `npx tsc --noEmit` | **`0`** |
| B | `npm run build` → `npx tsc --noEmit`（文件所列順序） | build `0`／tsc **`0`** |
| C | 對照組：`cp` 重建 `routes.d 2.ts` → `tsc` | **`2`**，逐字重現 `error TS2300: Duplicate identifier 'LayoutProps'` |
| D | **復原驗證（implement 未做）**：再跑 `npm run build` → `tsc` | build `0`；`ls` 確認殘留檔**已被 build 刪除**；tsc **`0`** |

全程 `git status --porcelain` 為空，`src/` 零變動。D 段是這次補上的關鍵一環：它證明文件所列的解法**真的會清掉那個檔**，而不只是碰巧沒撞到。

**補述足以阻止執行者去改原始碼嗎？足以。** 它逐字給出執行者會看到的錯誤字串、以粗體標明「這是環境問題，不是候選缺陷——遇到時不要去改原始碼」、給出一行解法、並附可自行重跑的三段證據。四者齊備。**但它指名的成因不成立**，見 F-10。

### 未越界

| 檢查 | 結果 |
|---|---|
| G-1／G-2 **指令**逐字未變 | `257B` vs `257B`、`241B` vs `241B`，皆 `True` |
| F-6 的兩段判準片段仍在 G-1 格內 | 皆 `True` |
| G-2 整列與 cycle 3 相同 | `True` |
| F-6 的 2026-09-22 補述（`archived` 原句） | 逐字未變 `True` |
| AC 全節 | `1622B` vs `1622B`，`True`（與 cycle 1／2／3 同值） |
| `git diff` 範圍 | 只有本票一檔 |
| AC-3／G-7、G-6 | `1／5／1`；`awk` 相鄰性不變；`false false` |

### 新 finding

**F-9 — 查核指令未限定於 `### Feedback Cycles`，本票任何一處的格式舉例都會被判為 `RECORDED`。**
- 已釋出使用者與正常流程：captain／FO 於公開前執行 gate 的 G-1／G-2。
- 可觀察損害：指令是對**整份本票**做 `grep`，不是對 `### Feedback Cycles` 一節。只要本票任何位置有一行以該前綴加真實票號起頭，該票即被印成 `RECORDED`。**副本實測兩處**：把一行格式舉例放進某個 `## Stage Report` 一節 → `060` 印出 `RECORDED`；放進 `## Out of scope` → `061` 印出 `RECORDED`。**兩者都不是 captain 簽字。**
- 受影響的 AC 或邊界：無 AC 直接失敗。受影響的是 F-7 建立的可稽核性本身——**方向是 fail-open**：gate 宣稱有簽字而實際沒有。這與上一節八種漏掉（fail-safe）方向相反，嚴重度也相反。
- 觸發證據：上述兩次副本實測。本票現況安全——八張全部 `NO-RECORD`，且現行補述以 `{票號}` 佔位示範格式，未使用真實票號。
- 建議：materiality = **Deferred risk**（候選目前無此行），**但方向為 fail-open，是本輪三筆 finding 中最該優先處置的一筆**。promote-to-material 條件：本票任何一處出現以該前綴加真實票號起頭的行。task ownership = 本票自有範圍。disposition 建議 = **fix（一個子句）**：查核前先以 `awk '/^### Feedback Cycles/,/^## /'` 把該節切出來再 `grep`，或在 pattern 尾端要求接續「captain 明確接受」字樣。
- **這一筆與 F-6／F-7／F-8 不同，它是本輪新造物的性質，不是既有文字。** 我在撰寫本報告時刻意避免製造該條件：全文提及格式時一律寫在句中或用 `{票號}` 佔位，未在行首寫出真實票號。報告寫完後重跑查核指令，八張仍全部 `NO-RECORD`。

**F-10 — G-8 補述指名的成因（iCloud）查無實據。**
- 可觀察損害：目前無；解法正確且已驗證，執行者照做即可。
- 觸發證據：補述寫「本專案位於 `~/Documents/` 下的同步資料夾，macOS／iCloud 會產生「 2」這類重複檔」。實測：`~/Library/Mobile Documents/com~apple~CloudDocs` **不存在**，`brctl status` **無輸出**，`~/Documents` 無 iCloud 管理跡象。**本機的 `~/Documents` 並未啟用 iCloud 同步**，故該歸因不成立。重複檔確實出現過（cycle 3 我親眼遇到 `routes.d 2.ts`），但成因不是 iCloud。
- 受影響的 AC 或邊界：無。受影響的是文件正確性——`AGENTS.md` 明訂不得把錯誤前提留在文件裡。未來讀者可能去關一個根本沒開的 iCloud，或因發現 iCloud 沒開而連帶不信任整則補述。
- 建議：materiality = **Polish**。task ownership = 本票自有範圍。disposition 建議 = **fix（一行）**：把成因改寫為「重複檔的產生來源尚未確認（可能為檔案同步、備份工具或編輯器）」，保留已驗證的部分——`tsconfig` 的 `include` 會把 `.next/types/` 掃進來、解法是重建或清除 `.next`。

**兩則小觀察，不列為 finding**：(1) G-2 的條件寫「同 G-1（含 2026-09-22 的更正）」，未提 2026-09-23 的更正；操作上不受影響，因為查核指令本身就涵蓋 `049`／`052` 兩張。(2) 我未能重現 `illegal byte sequence`（詳見前節），但 ASCII 版本無論如何都是更安全的選擇。

### 驗證與可否證性

- 翻轉測試是 F-7 的核心可否證點：**翻不動就是裝飾品**。實測 `058` 由 `NO-RECORD` 翻為 `RECORDED` 且其餘七張不動，故出口可觀察。
- F-9 以**兩次獨立位置**的副本實測證明，不是推論：格式舉例放進 stage report 與 out-of-scope 兩處，分別讓 `060`、`061` falsely 印出 `RECORDED`。若指令有限定節區，這兩次都應維持 `NO-RECORD`。
- F-8 的 D 段（復原驗證）是這次新增的可否證點：若 `npm run build` 其實不會刪掉殘留檔，文件所列的解法就是假的；實測 `ls` 回報該檔已不存在、`tsc` 離開碼 `0`。
- F-10 可被單一事實推翻：若 `~/Library/Mobile Documents/com~apple~CloudDocs` 存在或 `brctl status` 有輸出，該歸因即成立；兩者實測皆否。
- 「未越界」全部以位元組比對斷言（`257`／`241`／`1622` 三個長度全等且 `==` 為 `True`），不是肉眼掃過。

### Summary

F-7 與 F-8 都修好，且都通過了我當初抓它們時的同一套標準。F-7 的查核指令抽成獨立腳本實跑乾淨——八張 `NO-RECORD`、離開碼 `0`、**stderr 零位元組**——翻轉測試在副本上獨立重現，`058` 翻為 `RECORDED` 而其餘不動，**證明這條出口不是裝飾品**。F-8 四段實跑全過，其中我補了 implement 沒做的復原驗證：`npm run build` 確實會刪掉那個殘留檔，所以文件所列的解法是真的能用的。

**implement 的論證我判定成立**：「主條件不可達」與「例外出口暫時沒被用到」在 gate 的因果位置上確實不同——前者讓 gate 永遠不通過，後者只是目前無票被否決。加上出口現在逐票可觀察，這個區分站得住。

**格式漂移確實會漏，十種寫法漏掉八種——但全部漏向 `NO-RECORD`，方向是 fail-safe，可以接受。** 真正的問題在反方向：查核指令是對整份本票 `grep`，沒有限定在 `### Feedback Cycles` 一節，因此本票任何位置的一行格式舉例都會讓該票 falsely 印出 `RECORDED`。我在副本上於兩個不同節區各重現一次。這是 **fail-open**，是本輪最該優先處置的一筆（F-9）。另查出 G-8 補述指名的 iCloud 成因在本機查無實據（F-10）。

**判定：PASSED。** 兩項授權處置都已交付並獨立驗證，未越界，指令與 AC 逐字未變，無 AC 失敗。兩筆新 finding 依 `## Review-finding disposition` 只記錄、未動位元組。

**但我要把話講清楚，讓 FO 與 captain 能推翻我這個判定**：F-9 與先前幾筆不同——它是本輪新造物的性質，而且方向是 fail-open，一個會謊報簽字的查核比一個查不到的出口更糟。我仍判 PASSED，理由是候選現況安全（八張全 `NO-RECORD`，現行補述以 `{票號}` 佔位）、觸發需要一個特定的撰寫失誤、修法是一個子句、且八張票全在 `design`，距離 gate 實際執行還很遠。**若認為 fail-open 不該帶著走，這是合理的相反判斷，退回即可。** 無論如何，F-9 必須在 gate 實際執行之前處置。

## Stage Report: implement (cycle 5)

本輪即 captain 2026-09-23 退回後授權的那一輪，全部改動在 commit `a3c1e06`。只處理 F-9 與 F-10，未動 `src/`、build 產物、`layout.tsx`、Next.js 設定、`PresentDetail.tsx`，未跑 `sync-content`。

- DONE: F-9：用 `awk` 把 G-1／G-2 的查核指令限縮到 `### Feedback Cycles` 區段，修掉「檔案任何一處的前綴＋真實票號都會被算成 RECORDED」這個 fail-open。**兩個方向都要驗**：把 `- gate-exception 058：…` 放進 stage report 或 out of scope 段，確認修法後**不再**算成 RECORDED；把同一行放進 `### Feedback Cycles`，確認**仍然**算到。並照你先前的紀律把指令抽出成獨立腳本執行，貼出輸出與離開碼。
  `:189` 的查核指令換成 `awk` 限縮版；`:193-198` 追加更正補述，原指令逐字保留於補述內。兩個方向皆已驗，輸出見下節。**F-9 是本票 cycle 4 自己造出來的，不是既有問題**，補述與本節都如此記載。
- DONE: F-10：把 G-8 註記改為**不歸因**——只描述症狀（`.next/` 內可能出現檔名帶「 2」的重複檔，因 `tsconfig.json` 的 include 含 `.next/types/**/*.ts` 而讓 `tsc` 假性失敗）與解法（先 `npm run build` 或 `rm -rf .next` 再跑），並寫明「成因未經證實，故不歸因」。不得換成另一個同樣未證實的歸因。
  `:200` 的「成因」段改寫為「症狀」＋「成因未經證實，故不歸因」；`:204-209` 追加更正補述，原句逐字保留，並記明該歸因源自 FO 的 scope notes、implement 照抄未查證。解法與「實測三段」不變。未換上任何新歸因。
- DONE: 確認未越界也未回歸：G-1／G-2 的**指令主體**、F-6 的通過條件、F-7 的記錄位置與固定格式、AC 全節皆逐字未變（自行抽出比對）；`git diff` 只有本票一個檔案；並重跑 AC-3 的三檔 `grep` 與 `awk` 相鄰性確認無回歸。
  七項比對全部 `True`，AC-3 與相鄰性皆無回歸，輸出見下節。

### F-9：fail-open 先重現，再修，再雙向驗

**先確認它是真的。** 在副本的 `## Out of scope` 段放一行 `- gate-exception 058：舉例說明格式，不是核准。`，舊指令印 `058 RECORDED`；在 `## Stage Report: implement (cycle 4)` 段放一行 `- gate-exception 049：…`，舊指令印 `049 RECORDED`。**兩處都不是核准，gate 卻說有人簽了。**

**修法**：`awk` 只在 `### Feedback Cycles` 標題之後、下一個標題之前比對，並用 `index($0, "- gate-exception " n)==1` 取代正規表示式錨點——順便避開跳脫與編碼問題（cycle 4 已被中文 pattern 咬過一次）。

**雙向驗證，用的是從文件抽出的那一條指令，不是我手寫的版本**：

| 情境 | 舊指令 | 新指令 |
|---|---|---|
| 誘餌在 `## Out of scope`（058） | `058 RECORDED` ← fail-open | `058 NO-RECORD` |
| 誘餌在 stage report（049） | `049 RECORDED` ← fail-open | `049 NO-RECORD` |
| 真實記錄在 `### Feedback Cycles`（058），且上面兩個誘餌**仍在** | — | `058 RECORDED`，其餘七張 `NO-RECORD` |

第三列是關鍵：**只驗「不再誤報」等於沒驗。** 必須同時證明該算到的仍然算得到，否則把指令改成永遠印 `NO-RECORD` 也能「通過」第一、二列——那會從 fail-open 換成 fail-closed，一樣是假檢查。

**抽出成獨立腳本執行**（真實本票，無誘餌）：八張全部 `NO-RECORD`、離開碼 `0`、無任何 `illegal byte sequence`。

### F-10：不歸因，而不是換一個歸因

G-8 補述原本寫「本專案位於 `~/Documents/` 下的同步資料夾，macOS／iCloud 遇到檔名衝突會產生「 2」這類重複檔」。**這個歸因源自 FO 寫進 scope notes 的內容，是另一張票的推測；implement 照抄，沒有查證。**

reviewer 查 CloudDocs 不存在、`brctl` 無輸出，據此判「不是 iCloud」。**我本階段獨立重跑，結果是被擋住而非不存在**：`ls -d ~/Library/Mobile\ Documents` → `Operation not permitted`；`brctl status` → `brctl: Trying to invoke brctl from a sandboxed process`。**被擋住不等於不存在**，所以 reviewer 的結論與原註記的結論**都沒有被證實**。

因此改為只寫症狀與解法，並明寫「成因未經證實，故不歸因」。**沒有換上另一個同樣未證實的歸因。** 這不影響註記的用途：它存在的理由是阻止執行者去改原始碼，而判斷依據是「解法有效」與「`src/` 零變動」，兩者都量得到，不需要知道是誰造成的。

### 驗證與可否證性

- **F-9 的可否證點是第三列**：若新指令改壞成永遠 `NO-RECORD`，第一、二列照樣「通過」，第三列會立刻露餡。實測第三列為 `058 RECORDED`＋其餘七張 `NO-RECORD`，且誘餌仍在檔案中未移除——證明限縮的是**區段**，不是把整條檢查關掉。
- **F-10 的可否證點**：若日後有人拿到可靠證據（例如在非 sandbox 環境重跑 `brctl status` 得到明確輸出），這則補述就該被改成帶歸因的版本。現在不寫，是因為證據不足，不是因為不重要。
- **未回歸、未越界**（皆為程式比對，非目視）：`G-1 指令主體逐字未變: True`、`G-2 指令主體逐字未變: True`、`AC 全節逐字未變: True`、F-6 兩個判準片段 `True`、`F-7 出口子句仍在: True`、`F-7 記錄位置與固定格式逐字未變: True`、`G-8 解法句仍在: True`。
- **AC-3 無回歸**：三檔命中數仍為 `1／5／1`；`awk` 相鄰性仍為 `binding at line 8; next line 9 =   robots: { index: false, follow: false },`。
- **改動範圍**：`git diff --name-only` 只有本票一檔。修法本身 `+16／-3`，連同本節 stage report 一併提交後為 `+71／-3`；三筆刪除為 `status: verify`（**FO 推進階段改的 frontmatter**，本 ensign 開工前就在工作區）、查核指令那一行、G-8「成因」那一行——後兩者的原句都逐字保留在各自的更正補述內。**無以刪改掩蓋。**

### Summary

F-9 是 cycle 4 我自己造出來的 fail-open：查核指令 `grep` 整份本票而非 `### Feedback Cycles` 區段，所以檔案裡任何一行舉例都會被算成核准。我先在副本上把它重現了兩次（`## Out of scope` 與 stage report 各一次），再用 `awk` 限縮區段，再用**文件裡那一條指令本身**雙向驗證：誘餌不再算數、真實記錄仍然算數，而且驗第三列時刻意把誘餌留在檔案裡。

這張票到現在修掉的三個問題是同一族：F-6 是**主條件不可達**、F-7 是**出口無法稽核**、F-9 是**檢查會說謊**。三者都不是「寫錯字」，都是「看起來有檢查、執行時不成立」——正好是本票 Problem 一節在講的事。

F-10 改成不歸因。原歸因來自 FO 的 scope notes，我照抄未查證；而 reviewer 用來推翻它的證據在本 sandbox 下是 `Operation not permitted` 與 `Trying to invoke brctl from a sandboxed process`（我獨立重跑過），屬於被擋住而非不存在。兩個方向都沒被證實，所以只留症狀與解法。

**AC-2 維持未達成**，仍綁在未獲核准動工的 feature `039`。gate 整體仍不通過（八張票皆未結案、G-5 三筆佔位命中），各有其票，依禁令未動。

## Stage Report: verify (cycle 5)

- DONE: 獨立重驗 F-9 的**兩個方向**，且用從文件抽出的那一條指令：(a) 誘餌放在區段外確認**不再**算成 RECORDED；(b) 真實記錄放進 `### Feedback Cycles` 確認**仍然**算得到。另確認新指令仍可原樣抽出執行。
  兩個方向都驗過，且第三種情境（真實記錄與誘餌**同時存在**）也驗了。新指令 282 bytes、純 ASCII、抽出成獨立腳本執行：八張 `NO-RECORD`、離開碼 `0`、**stderr 零位元組**。詳見下節。
- DONE: 獨立重驗 F-10：G-8 註記現在是否**真的沒有歸因**……且沒有換上任何新的未證實歸因；原句是否逐字保留。並判定一位沒參與過本票的 gate 執行者讀了之後會不會去改原始碼。
  **真的沒有歸因**，也沒換上新的。原句逐字保留一次於更正內。判定：外來執行者**不會**去改原始碼，理由見下節。**並確認 FO 對我的更正成立——我 cycle 4 的判斷是錯的。**
- DONE: 確認未越界也未回歸……最後給出 PASSED 或 REJECTED。
  九項比對全部 `True`，`git diff` 只有本票一檔，AC-3 與相鄰性無回歸。判定 **PASSED**。另依本輪指示記一筆同型風險 finding **F-11**（G-5 的異寫法盲區），不自行修。

### 先認錯：我 cycle 4 的 F-10 結論是錯的

我在 cycle 4 寫「本機的 `~/Documents` 並未啟用 iCloud 同步，故該歸因不成立」。**這個結論站不住，FO 的更正正確。** 原因是我當時把 stderr 丟掉了（`ls ... 2>/dev/null`、`brctl status 2>/dev/null`），於是「權限被擋」與「檔案不存在」在我眼裡長得一模一樣。本階段不抑制 stderr 重跑：

```
ls ~/Library/Mobile Documents/com~apple~CloudDocs → Operation not permitted
brctl status                                      → brctl: Trying to invoke brctl from a sandboxed process
ls ~/Library                                      → Operation not permitted
```

連 `~/Library` 本身都讀不到。**被擋住不等於不存在**，所以「是 iCloud」與「不是 iCloud」兩個結論都未被證實——包含我那一個。我用來抓別人未證實歸因的標準，自己沒守住。captain 採納的「不歸因」處置比我的建議（改寫成別的說法）更正確：它沒有用一個猜測換掉另一個猜測。

### F-9 重驗：兩個方向，用抽出的指令

新指令（`:189`，282 bytes，`ascii=True`）以 `awk` 限縮在 `### Feedback Cycles` 到下一個標題之間，並以 `index($0, "- gate-exception " n)==1` 取代正規表示式錨點。舊指令同樣從文件抽出（`:194` 的更正內，194 bytes）作為對照組。

| 情境（皆在副本上） | 舊指令 | 新指令 |
|---|---|---|
| (a) 誘餌置於 `## Out of scope`，票號 `058` | `RECORDED` ← fail-open 重現 | **`NO-RECORD`** |
| (a) 誘餌置於某 stage report 段，票號 `049` | `RECORDED` ← fail-open 重現 | **`NO-RECORD`** |
| (b) 真實記錄置於 `### Feedback Cycles`（`058`），**且上面兩個誘餌仍在** | `RECORDED` | **`RECORDED`** ← 出口仍然有效 |
| (b) 同一次執行，未簽字的 `059` | `NO-RECORD` | `NO-RECORD` |
| (b) 同一次執行，只有誘餌的 `049` | `RECORDED` ← 仍誤報 | **`NO-RECORD`** |

**第三、五列是關鍵。** 只驗 (a) 等於沒驗——把指令改成永遠印 `NO-RECORD` 也能通過 (a)，那會把 fail-open 換成 fail-closed，出口失效，而出口失效正是 F-7 當初要解決的事。第三列證明該算到的仍算得到；第五列證明在**同一次執行**中，區段內的真實記錄算得到、區段外的誘餌算不到——是區段判別在起作用，不是整條指令被關掉。

真實本票（無誘餌）抽出執行：八張全部 `NO-RECORD`、離開碼 `0`、stderr `0` bytes。

### F-10 重驗：不歸因，且沒換一個新的

| 檢查 | 結果 |
|---|---|
| 「成因」段是否已移除歸因 | 已改為「**症狀**」，只描述 `.next/` 出現帶「 2」的重複檔如何被 `tsconfig` 的 `include` 掃進來撞成 `TS2300` |
| 是否明寫成因未證實 | 有：「**成因未經證實，故不歸因。**……本票沒有查證到可靠證據，因此不寫」 |
| 是否換上新的未證實歸因 | **沒有。** 全則僅存三處提及 iCloud，皆在 2026-09-23 更正內：更正標題（說明該歸因已被移除）、逐字保留的原句、以及 sandbox 被擋的證據行。無一處以之為事實 |
| 原句是否逐字保留 | 是，完整保留一次於更正內 |
| 解法與「實測三段」 | 不變 |

**外來執行者會不會去改原始碼？不會。** 這段給了他四樣東西：開頭粗體直說「這是環境問題，不是候選缺陷——遇到時不要去改原始碼」；他會看到的錯誤字串（`error TS2300: Duplicate identifier 'LayoutProps'`）；為何它是建置產物而非原始碼缺陷（`include` 含 `.next/types/**/*.ts`，`exclude` 只有 `node_modules`）；以及兩種解法與可自行重跑的三段證據。

**不寫成因反而更安全。** 原版指名 iCloud 的風險是：執行者去查，發現 iCloud 沒開（或如本 sandbox 根本查不到），於是連帶懷疑整則註記、回頭去翻原始碼。現在的版本把判斷依據講明了——「解法有效」與「`src/` 零變動」，兩者都量得到，不需要知道是誰造成的。這是正確的切法：**「是環境問題」有證據（三段實測，`src/` 零變動），「是哪個環境機制」沒有證據**，前者留下、後者拿掉。

### 未越界、未回歸

| 檢查 | 結果 |
|---|---|
| G-1／G-2 **指令主體**逐字未變 | `257B` vs `257B`、`241B` vs `241B`，皆 `True` |
| G-2 整列 | `True` |
| F-6 兩段通過條件仍在 G-1 格內 | 皆 `True` |
| F-7 記錄位置子句 | `True` |
| F-7 固定格式字串 | 仍在且未變，`True` |
| F-6 的 `archived` 原句引文 | `True` |
| AC 全節 | `1622B` vs `1622B`，`True`（cycle 1–5 五輪同值） |
| `git diff` 範圍 | 只有本票一檔；`src/`／`next.config.ts`／`package.json` 皆空 |
| AC-3／G-7、相鄰性、G-6、G-5、`src/data` | `1／5／1`；`binding at line 8; next line 9 = robots:`；`false false`；三筆命中；與 `main` 位元組相同 |

### 新 finding

**F-11 — G-5 的佔位掃描有異寫法盲區，且方向是 fail-open。**
這是本輪指示要我特別留意的同型風險，實測確認本票也有一處。

- 已釋出使用者與正常流程：captain／FO 於公開前執行 gate 的 G-5。
- 可觀察損害：目前無——現存三筆佔位（`PresentDetail.tsx:32`、`contributors.ts:16`、`:21`）都寫成掃得到的形式，本輪實測仍是三筆命中。但 **G-5 的通過條件是「零命中」，掃不到就等於通過**，方向是 fail-open，而且 G-5 正是本票為了防 `015` 事件而設的那一項。
- 受影響的 AC 或邊界：`AGENTS.md` 第三節列為「一律視為佔位資料，不可發布」的字串。
- 觸發證據（以 G-5 的 pattern 逐行實測）：`前端工程師 A` **掃得到**，但 `前端工程師A`（無空格）與 `前端工程師　B`（全形空格）**掃不到**——pattern 寫的是 `前端工程師 [AB]`，那個半形空格是必要的。同理 `某學者` 掃得到、`某学者`（簡體）掃不到；`某大學法律系` 掃得到、`某大学法律系` 掃不到；`快速了解最新判決的5個重點` 掃得到、`快速了解最新判決的５個重點`（全形數字）掃不到。`volunteer@addcourt.tw` 因 `-i` 而大小寫皆可，無此問題。
- **與本輪指示所列的兩例同型**：feature `063` 的 AC7 只寫 `114憲判9` 而漏掉「114 年憲判字第 9 號」；feature `065` 的 AC-5 同型。共同結構是**同一個名詞有兩種寫法，而 pattern 只寫了一種**，於是形成穩定盲區——不是偶爾漏，是那一種寫法永遠漏。
- 建議：materiality = **Deferred risk**（現存佔位皆掃得到，尚未實際漏掉任何一筆）。**promote-to-material 條件**：任何佔位值以上列任一異寫法出現於 `src/`——尤其 `052` 改寫 `contributors.ts` 時若把空格拿掉，這一筆立刻由「掃得到」變成「掃不到」。task ownership = 本票自有範圍（G-5 是本票的 gate 項）。disposition 建議 = **fix**：把空格改為可選並涵蓋全形（例如 `前端工程師[ 　]?[ABＡＢ]`），簡繁與全形數字同理。**依本輪指示，本階段只提報不自行修。**

**另一則同型但方向相反，僅記錄不提報**：F-7 查核指令的票號比對同樣只認一種寫法（`058` 而非 `58`、不認縮排、不認 `*` 項目符號），cycle 4 的漂移表已列出十種寫法中有八種漏掉。但那八種**全部漏向 `NO-RECORD`**，是 fail-safe——gate 卡住而非放行，與 F-11 的方向相反，故不另立 finding。

### 驗證與可否證性

- F-9 的雙向驗證是本輪核心。**單向驗證會放過一個把出口改死的修法**：若新指令永遠印 `NO-RECORD`，(a) 兩列照樣「通過」，但第三列會翻成 `NO-RECORD` 而暴露它。實測第三列為 `RECORDED`，故出口仍活。
- 第五列是比第三列更強的證據：真實記錄與誘餌在**同一份檔案、同一次執行**中被分開判定（`058 RECORDED`／`049 NO-RECORD`），證明生效的是區段判別本身。
- F-10 的「沒換新歸因」以逐行掃描斷言：全則提及 iCloud 僅三處，皆位於更正區塊且皆非事實主張。
- 我 cycle 4 的錯誤可被單一操作重現：把 `2>/dev/null` 拿掉，`Operation not permitted` 就會顯現。這是方法錯誤，不是判斷錯誤——抑制 stderr 讓「被拒絕」偽裝成「不存在」。
- F-11 以 G-5 的 pattern 對十一個字串逐行實跑得出，不是讀 pattern 推論；五個異寫法確實無命中。
- 「未越界」全部以位元組比對斷言（`257`／`241`／`1622`），不是肉眼掃過。

### Summary

F-9 修好，而且是**兩個方向都驗過**的修好：誘餌放在 `## Out of scope` 與 stage report 兩處，舊指令都誤報 `RECORDED`（fail-open 重現），新指令都回 `NO-RECORD`；真實記錄放進 `### Feedback Cycles` 且誘餌仍在時，新指令仍印 `058 RECORDED` 而同一次執行的誘餌票 `049` 印 `NO-RECORD`。這一列排除了「把出口改死也能通過」的假修法。新指令 282 bytes、純 ASCII、抽出執行 stderr 零位元組。

F-10 修好，且處置比我建議的更正確：**不歸因，而不是換一個歸因**。原句逐字保留，全則再無任何以 iCloud 為事實的敘述。外來執行者讀了不會去改原始碼——「不要改原始碼」在開頭粗體、錯誤字串可對照、判斷依據改為「解法有效」與「`src/` 零變動」兩個量得到的東西。

**我要明確認錯：cycle 4 我判「不是 iCloud」是錯的**，錯在把 stderr 丟掉，使「權限被擋」與「不存在」無法區分。FO 的更正成立。我用來要求別人的標準，那一次自己沒守住。

**判定：PASSED。** 兩項授權處置都交付並獨立雙向驗證，未越界（九項比對全 `True`，AC 全節五輪位元組不變），無 AC 失敗。

依本輪指示另記一筆同型風險：**F-11——G-5 的佔位掃描有異寫法盲區**（`前端工程師A` 無空格、全形空格、簡體、全形數字皆掃不到），**方向是 fail-open**，而 G-5 正是本票為防 `015` 事件而設的那一項。現存三筆佔位都還掃得到，故列 Deferred risk；但 `052` 改寫 `contributors.ts` 時若拿掉那個空格，就會立刻變成掃不到。**依指示只提報，未自行修。**

## Stage Report: implement (cycle 6)

本輪即 captain 2026-09-24 退回後、依「授權修正 `Verified by:` 涵蓋既有寫法變體，不改 AC 要求本身」這句一次性授權執行的那一輪。只處理 F-11，全部改動在 commit `9f5724c`。未動 `src/`、build 產物、`layout.tsx`、Next.js 設定、`PresentDetail.tsx`，未跑 `sync-content`。

- DONE: F-11：讓 G-5 的佔位掃描涵蓋既有的寫法變體（無空格 `前端工程師A`、全形空格、簡體 `某学者`／`某大学`、全形 `５個重點` 等，以你 cycle 5 逐行測過的十一個字串為基準），修掉「G-5 以零命中為通過故 fail-open」這個缺陷。依 captain 2026-09-24 的一次性授權，這是改 `Verified by:` 的涵蓋面，**不得改 G-5 要求什麼**。
  `:171` 的 G-5 列與 `:270` 的 Test plan 該列各換上新 pattern；`:186-192` 追加更正補述，原 pattern 逐字保留其中。**字串集合完全沒有變動**——沒有新增任何一個要掃的字串，只是每個既有字串多認了寫法變體。**F-11 非本輪引入**，G-5 自 design 階段即如此，補述與本節都如此記載。
- DONE: 照你驗 F-9 的同一套紀律**雙向驗證**並貼出兩組輸出：(a) 把指令抽出成獨立腳本執行，對十一個字串逐一確認現在都抓得到；(b) 確認不會誤抓正常內容——過寬的 pattern 會讓 G-5 永遠不通過，那和永遠通過一樣壞。同時確認三個既有佔位值（`PresentDetail.tsx:32`、`contributors.ts:16`、`:21`）仍被抓到。
  兩組輸出見下方兩節。十一個字串新 pattern 全數 `HIT`；對 `src/` 的實掃與舊 pattern `diff` 完全相同，三個既有佔位值仍抓得到。
- DONE: 確認未越界也未回歸：G-1／G-2 的指令主體、F-6 的通過條件、F-7 的記錄位置與固定格式、F-9 的 `awk` 限縮、AC 全節皆逐字未變（自行抽出比對）；`git diff` 只有本票一個檔案；並重跑 AC-3 的三檔 `grep` 與 `awk` 相鄰性確認無回歸。若你依授權另修了其他 G 項的涵蓋面，**逐項列出改了哪些、為什麼**。
  八項比對全部 `True`，AC-3 與相鄰性無回歸。**其他 G 項的涵蓋面一項未改**——理由見下方「其他 G 項」一節。

### 方向 (a)：十一個字串逐行實跑

| 字串 | 舊 pattern | 新 pattern |
|---|---|---|
| `某學者` | HIT | HIT |
| `某学者`（簡體） | **MISS** | HIT |
| `某大學法律系` | HIT | HIT |
| `某大学法律系`（簡體） | **MISS** | HIT |
| `lorem ipsum` | HIT | HIT |
| `前端工程師 A`（半形空格） | HIT | HIT |
| `前端工程師A`（無空格） | **MISS** | HIT |
| `前端工程師　B`（全形空格） | **MISS** | HIT |
| `volunteer@addcourt.tw` | HIT | HIT |
| `快速了解最新判決的5個重點` | HIT | HIT |
| `快速了解最新判決的５個重點`（全形數字） | **MISS** | HIT |

舊 pattern 六 `HIT`／**五 `MISS`**，與 verify cycle 5 的 F-11 觸發證據逐項相符；新 pattern 十一項全 `HIT`。

**抽出成獨立腳本執行**（從補述那一行的反引號內抽出完整指令，寫入檔案交給 `bash`）：印出三筆、離開碼 `0`，**無 `illegal byte sequence`**——這是 cycle 4 咬過我一次的失敗模式，本輪先驗過才交付。

### 方向 (b)：不誤抓

**對 `src/` 實掃，新舊 pattern 的輸出 `diff` 完全相同**，都是三筆：`PresentDetail.tsx:32`（C1）、`contributors.ts:16`、`:21`（C2）。三個既有佔位值仍抓得到，一筆未漏。新 pattern **未多抓任何一行**。

另以八個近似但合法的字串測試，全部 `MISS`：`某些學者認為這個判決有爭議`、`台灣大學法律系`、`前端工程師的工作內容`、`這則判決的5個重點`、`判決的重點`、`學者專家`、`大學法律系教授`、`前端工程`。

**為什麼 (b) 和 (a) 一樣必須驗**：G-5 的通過條件是零命中。pattern 過寬會讓 G-5 永遠有命中、永遠不通過——那是 fail-closed，和 fail-open 一樣是假檢查，只是卡住而不是放行。只驗 (a) 會放過一個「把 pattern 寫成 `.` 」這種修法。

### 其他 G 項：一項未改，逐項說明

授權允許一併修正其他 G 項的涵蓋面，但實際檢查後**沒有一項需要改**：

- **G-1／G-2**：比對的是 `status:`／`verdict:` 這兩個機器產生的欄位，寫法由 workflow 固定，無人工異寫法空間。
- **G-6**：比對 `history.json` 的 `id` 欄（`h2`／`h28`），同樣是機器產生。
- **G-7**：比對檔名字串 `056-pre-launch-checklist`，本票自己的檔名，無變體。
- **G-8**：跑 `tsc` 與 `build`，判斷依據是離開碼，無 pattern。
- **G-3／G-4**：人工項，captain 判斷，無 pattern。

**F-7 的查核指令有同型盲區但方向相反**：它只認 `058` 而不認 `58`、不認縮排或 `*` 項目符號。verify cycle 5 已列出十種寫法漏掉八種，**但全部漏向 `NO-RECORD`**——gate 卡住而非放行，是 fail-safe。依「不得順手改其他 G 項的要求」，本輪未動。

### 一件觀察，未改，供 FO 判斷

**Test plan（`:270`）那一列的字串集合比第三節的 G-5 少一項**：它沒有 `快速了解最新判決的5個重點`。這是本輪之前就存在的分歧，**不是寫法變體問題，而是兩份副本要掃的字串集合不同**。

補上那一項會改變該指令要求什麼，超出「只改涵蓋面」的授權範圍，**故本輪未補**，只在該列加了一行註記指出分歧。**若 FO 認為兩份應該對齊，請另行授權。** 我不自行擴張範圍——本票前六輪被退回的原因裡有一半是「看起來對但執行時不成立」，自己再造一個「未經授權的悄悄對齊」不是修它的方法。

### 驗證與可否證性

- **方向 (a) 的可否證點**：若新 pattern 沒有真的涵蓋變體，十一列裡會留下 `MISS`。實測零 `MISS`。
- **方向 (b) 的可否證點**：若新 pattern 過寬，對 `src/` 的 `diff` 會出現舊 pattern 沒有的行。實測 `diff` 無輸出，兩者完全相同；另八個近似合法字串全 `MISS`。
- **「沒有新增字串」可查證**：新舊 pattern 的 `|` 分隔項數相同（六項），每一項都是原項目的變體展開，無新項目。
- **未回歸、未越界**（皆為程式比對，非目視）：`G-1 指令主體逐字未變: True`、`G-2 指令主體逐字未變: True`、`AC 全節逐字未變: True`、F-6 兩個判準片段 `True`、`F-7 記錄位置與固定格式逐字未變: True`、`F-9 awk 限縮逐字未變: True`、`G-8 解法句仍在: True`。F-9 的查核指令重跑仍印 `NO-RECORD`。
- **AC-3 無回歸**：三檔命中數仍為 `1／5／1`；相鄰性仍為 `binding at line 8; next line 9 =   robots: { index: false, follow: false },`。
- **改動範圍**：`git diff --name-only` 只有本票一檔；修法本身 `+11／-3`，連同本節 stage report 一併提交後為 `+87／-3`。三筆刪除為 `status: verify`（**FO 推進階段改的 frontmatter**，本 ensign 開工前就在工作區）、G-5 列、Test plan 該列——後兩者的原 pattern 逐字保留在更正補述內。**無以刪改掩蓋。**

### Summary

F-11 修好：G-5 的 pattern 從只認一種寫法，擴為涵蓋簡繁、全形半形空格、全形半形字母與數字。**字串集合一個沒加、一個沒減**，改的只是每個字串認得的寫法。十一個字串從六中五漏變成全中；對 `src/` 的實掃輸出與舊 pattern 逐字相同，三個既有佔位值仍抓得到，八個近似合法字串全部不誤抓。

F-11 不是本輪引入的，G-5 自 design 階段就這樣寫。但它的方向值得記一筆：**G-5 以零命中為通過，所以掃不到就等於通過**——而 G-5 正是本票為了防 `015` 事故（`某學者，某大學法律系` 公開顯示四個月）而設的那一項。一道防事故的檢查，自己走在事故的重演路徑上。

**一件我沒做、要請 FO 裁示的事**：Test plan 那一列比 G-5 少掃一個字串。補上它會改變該指令要求什麼，超出本次授權，所以我只加註記、沒有補。

**AC-2 維持未達成**，仍綁在未獲核准動工的 feature `039`。gate 整體仍不通過（八張票皆未結案、G-5 三筆佔位命中），各有其票，依禁令未動。
