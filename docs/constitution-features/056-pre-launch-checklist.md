---
id: 056
title: 上線前檢查清單：公開之前每一項都必須有結論
status: verify
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

**共六張新票（`058`–`063`）**，由 FO 在本票 implement 階段開立。現有最大票號為 `057`（`grep -c . <(ls docs/constitution-features/0*.md)` 可查），故 `058` 起連號無衝突。

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
| G-1 | 機械 | `058`–`063` 六張新票的狀態 | 每張票 `status` 為 `archived` 且 `verdict` 非空，或 captain 逐票明確接受並記錄理由 |
| G-2 | 機械 | `052`、`049` 兩張既有票 | 同 G-1 |
| G-3 | 人工 | Vercel 的 Build Command 與 `NEXT_PUBLIC_PUBLIC_MODE` 實際值 | captain 開 dashboard 確認並把實際值抄回本票 |
| G-4 | 人工 | A1、A4、B1b 三項「明確接受」 | captain 簽字，理由寫入本票 |
| G-5 | 機械 | 佔位字串全站掃描 | `grep -rniE '某學者\|某大學\|lorem ipsum\|前端工程師 [AB]\|volunteer@addcourt\.tw\|快速了解最新判決的5個重點' src/` 零命中 |
| G-6 | 機械 | D1／D2 的反向保護 | `node -e "const a=require('./src/data/history.json');const i=a.map(x=>x.id);if(i.includes('h2')\|\|i.includes('h28'))process.exit(1)"` 回傳 0。若任一列回來了，表示有人重新標了 `Approved`，必須先有法學確認記錄 |
| G-7 | 機械 | gate 綁定仍在 | 上面那條 `grep -rn '056-pre-launch-checklist'` 三檔皆命中 |
| G-8 | 機械 | 建置與型別 | `npx tsc --noEmit` 與 `npm run build` 皆通過 |

八項全數通過，才移除 `layout.tsx:8`。移除後在本票 Feedback Cycles 記下執行日期與 commit SHA，並把本票 `status` 推進到封存。

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
grep -rniE '某學者|某大學|lorem ipsum|前端工程師 [AB]|volunteer@addcourt\.tw' src/            # G-5
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
