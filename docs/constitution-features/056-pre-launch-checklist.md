---
id: 056
title: 上線前檢查清單：公開之前每一項都必須有結論
status: review
source: captain 2026-09-07（把關機制體檢與任務地圖的綜合結論）
started: 2026-09-21T18:56:47Z
completed:
verdict:
score: 0.85
worktree: .worktrees/spacedock-ensign-056-pre-launch-checklist
issue:
pr:
mod-block:
gates:
    version: 1
    records:
        - id: gate:056:verify
          stage: verify
          attempts:
            - id: gate-attempt:056-verify-1
              briefing:
                id: briefing:056:verify:attempt-1:revision-1
                digest: sha256:a314d03de98cb8dc1316e5553cf8cfb0de9105e13b92b70e633173dcaaa232ca
                room-ref: '@review/verify/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:056:verify:1
                briefing: briefing:056:verify:attempt-1:revision-1
                by: person:captain
                at: "2026-09-23T17:49:23.330602Z"
                decision: revise
                reason: captain 2026-09-23 退回，並授權本票的 Cycle 3（README 的 disposition 規定 Cycle 3 升級給 captain，此授權即為該升級的答覆）。理由：本票的交付物就是「一道能被執行的 gate」，而 F-7 與 F-8 兩項恰恰是關於它能不能被執行——F-7 的「captain 逐票明確接受」出口沒有記錄位置也沒有查核指令（章節導言把「寫在 Feedback Cycles」限定在人工項，而 G-1／G-2 標的是機械項，涵蓋不到）；F-8 的 G-8 會因 .next 殘留重複檔假性失敗，本輪實際撞到一次，而一個會狼來了的檢查項最後會被忽略。兩項修法各是一個子句，留到後續票等於把這張票存在的理由留一半沒做完。
            - id: gate-attempt:056-verify-2
              briefing:
                id: briefing:056:verify:attempt-2:revision-1
                digest: sha256:97a577971ecbeedd09a905b5c8909ddc0a133f66115726fffdc7cb6a583ba5a2
                room-ref: '@review/verify/briefing-2'
              resolution:
                type: Resolution
                id: resolution:spacedock:056:verify:2
                briefing: briefing:056:verify:attempt-2:revision-1
                by: person:captain
                at: "2026-09-24T00:29:47.898497Z"
                decision: revise
                reason: 'captain 2026-09-23 退回。F-9 是 fail-open：新的查核指令 grep 整份 entity 而非 ### Feedback Cycles 區段，檔案裡任何一行以該前綴加真實票號開頭都會回報 RECORDED，reviewer 在副本上重現兩次。gate 會因此宣稱一個沒有人簽過的核准。本票的主題就是「看起來對但執行時不成立的檢查」——F-6 是主條件不可達、F-7 是出口無法稽核、F-9 是檢查會說謊；前兩個都修了，第三個是本輪自己造出來的，不該帶著交付。修法一個子句（用 awk 限縮 grep 到該區段）。併同處理 F-10：G-8 註記把成因歸給 iCloud，但 FO 複核發現在本 sandbox 下 CloudDocs 與 brctl 兩項檢查都回 Operation not permitted，是被擋住不是不存在，reviewer 的證據本身可能是 sandbox 產物；處置改為不歸因，只描述症狀與解法。'
            - id: gate-attempt:056-verify-3
              briefing:
                id: briefing:056:verify:attempt-3:revision-1
                digest: sha256:dcfc05c5a3a9eace06567e6a12de9742b9e3f4c3aa96f09034625d47ec034902
                room-ref: '@review/verify/briefing-3'
              resolution:
                type: Resolution
                id: resolution:spacedock:056:verify:3
                briefing: briefing:056:verify:attempt-3:revision-1
                by: person:captain
                at: "2026-09-24T17:29:46.109515Z"
                decision: revise
                reason: 'captain 2026-09-24 退回，修 F-11，並同日給出一次性授權：「授權修正 Verified by: 涵蓋既有寫法變體，不改 AC 要求本身」。F-11 與 F-9 同類但更尖銳——它落在 G-5，正是本票為了防止 015 事故（某學者，某大學法律系 公開顯示四個月）而加的那道檢查。G-5 的掃描寫 前端工程師 [AB]，其中半形空格是必要的，因此無空格寫法、全形空格、簡體 某学者／某大学、全形 ５個重點 全部掃不到（reviewer 逐行測了十一個字串）。G-5 以零命中為通過，故這是 fail-open。目前三個既有佔位值仍抓得到，但若 052 改寫 contributors.ts 時把那個空格拿掉，立刻變成抓不到。'
            - id: gate-attempt:056-verify-4
              briefing:
                id: briefing:056:verify:attempt-4:revision-1
                digest: sha256:b68e2452142b89fadd69c25916907b2f9f1192fc2adc5281b9a4404ad674e97e
                room-ref: '@review/verify/briefing-4'
              resolution:
                type: Resolution
                id: resolution:spacedock:056:verify:4
                briefing: briefing:056:verify:attempt-4:revision-1
                by: person:captain
                at: "2026-09-24T17:44:56.238255Z"
                decision: revise
                reason: captain 2026-09-24 退回，修 F-12 的根。前八處同型盲區都是「檢查只認一種寫法」，F-12 不同——本票有兩份同一檢查的副本（## Test plan 區塊與第三節），而兩者已在兩處分岔：Test plan 的 G-8 仍把 tsc 列在 build 之前，照它做會直接走進 F-8 記載的假性失敗（該分岔是 cycle 4 只修第三節那一列造成的）；Test plan 的 G-5 pattern 只有 5 個變體而第三節有 6 個，少了「快速了解最新判決的5個重點」，跑那一份會整個漏掉一個佔位值，又是 fail-open。採納 reviewer 的建議：修根而不是補兩處——讓 Test plan 指向第三節、不再複述指令，因為只要兩份副本還在就會有第三次分岔。本票已跑六輪、每輪 reviewer 都找到同一類缺陷的新實例，這是第一個能讓它停下來的修法。此修法不超出 2026-09-24 的授權：它移除一份過時的重複副本，不是改任何檢查要求什麼。
            - id: gate-attempt:056-verify-5
              briefing:
                id: briefing:056:verify:attempt-5:revision-1
                digest: sha256:1c986e0807bcaa00fd16c259362a3d988b9f70d602dd443e9a3f0bb7ffc5e120
                room-ref: '@review/verify/briefing-5'
              resolution:
                type: Resolution
                id: resolution:spacedock:056:verify:5
                briefing: briefing:056:verify:attempt-5:revision-1
                by: person:captain
                at: "2026-09-24T19:13:24.330688Z"
                decision: approve
                reason: captain 2026-09-24 核准進入 review。verify cycle 7 判 PASSED，F-12 的根本修法經對抗性實證有效：reviewer 在三個不同區段各植入一份重複的 G 項清單，三份全部回報 STRAY 且區段標籤正確；反向測試（放在第三節內的清單正確地不被標記）排除了「什麼都報因而永遠不通過」的假檢查；真實候選零 STRAY，一筆 AC-OWNED 以已知例外的身分宣告而非藏起來。核准的判準是：本票七輪累積的**可執行**缺陷已全數清除（F-6 主條件不可達、F-9 與 F-11 fail-open、F-12 兩份可執行副本分岔），殘留的 F-13 是為表格儲存格轉義而存在的**不可執行**展示形式、F-14 是自我排除機制的邊界情形，兩者皆不使任何 AC 失敗且已完整記錄在票內供 gate 執行者閱讀。三項未達成的驗證項仍在 captain 身上：AC-2（依賴尚未核准動工的 feature 039）、C1 的真實信箱覆寫點、G-3 的 Vercel dashboard 人工項。
              application:
                target-stage: review
                state: consumed
        - id: gate:056:review
          stage: review
          attempts:
            - id: gate-attempt:056-review-1
              briefing:
                id: briefing:056:review:attempt-1:revision-1
                digest: sha256:6fb4d528ef244d42d7a7d98ec93d74a34d6b104a0bd07e4e77ff89c5a8ee57c3
                room-ref: '@review/review/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:056:review:1
                briefing: briefing:056:review:attempt-1:revision-1
                by: person:captain
                at: "2026-09-24T22:51:04.15649Z"
                decision: revise
                reason: Captain 退回：修那個日期檢查（F-27）。全票唯一已被證實會靜默回報 0 的查核，也是唯一沒有存成可執行形式的那一條；本票的主題就是檢查的涵蓋面要對得上它宣稱保護的東西，不修等於在自己的成果上留一個反例。一併修 F-25／F-26／F-28。
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

> **2026-09-24（cycle 13）更正＝F-32：上表只寫了「綁定要做三處」，沒寫「每一處各自要怎麼被查證」，而 G-7 就照著只數了檔案命中數。原表一字未改，補充於此。**
> **缺陷**：G-7 的滿足者是 `layout.tsx` 1／`TODO.md` 9／`AGENTS.md` 1，而它只要求**每個檔至少一筆**（處 1 另有相鄰性）。
> 所以**處 2 與處 3 可以無聲消失**：實測刪掉 `TODO.md` 的 P3-8 解除條件那一條（其餘 8 筆保留）→ **`G-7 PASS`**；
> 把 `AGENTS.md` 的綁定從 noindex 小節移到檔尾註解 → **`G-7 PASS`**。**兩條觸發路徑都不見了，而 gate 回報三處都在。**
> **這正是本票在 `AC-3` 旁邊寫過的那句「一道不會被觸發的 gate 等於沒有」，只是這次不會被觸發的是它自己的兩條路徑。**
> **每一處的查驗身分（cycle 13 起由 G-7 各自斷言）**：
>
> | 處 | 要驗的身分 | 唯一性 |
> |---|---|---|
> | 1 | 綁定註解緊貼 `robots:` 正上方 | 全檔**恰好一行**含本票路徑且相鄰（`place1=1/1`）|
> | 2 | 該行在 `### P3-8` 小節內、且是「解除條件」那一條 | 小節內**恰好一條**（`place2=1`）|
> | 3 | 該行在 `AGENTS.md` 標題含 `noindex` 的那個小節內 | 小節內**恰好一行**（`place3=1`）|
>
> **為什麼要連唯一性一起斷言**：只驗「存在」會被**多重滿足者**吃掉——`TODO.md` 那 8 筆健康的命中就是替死鬼，
> 它們讓「該負責的那一筆」壞掉時看不出來。理由的一般形式見 cycle 13 報告的 Q3 一節。
> **範圍**：本則與 G-7 的修法**沒有動任何 acceptance criteria 文字**。`AC-3` 只要求三檔各至少一筆命中，G-7 一直忠於它；
> 缺口在上表沒有寫下每一處的身分，而 G-7 的自述照抄了那個缺口。**AC 全節仍 1622B／sha256 `93e5bf6a95f16592`。**

#### 「一道不會被觸發的 gate」怎麼被查證排除

綁定是否成立，用下面這一段查。**這是 G-7 的正本，其他地方只引用、不複述。**
**它對三處各自驗身分與唯一性，不是數三個檔各有幾筆命中**——理由與實測見上一小節的 2026-09-24（cycle 13）更正（F-32）。

```bash
# canonical: G-7 —— 三處綁定各自按身分與唯一性查驗，不只數檔案命中數
ok=1
p1=$(awk '/056-pre-launch-checklist/{n++; if ((getline nxt) > 0 && nxt ~ /robots:/) a++} END{print n"/"a+0}' src/app/layout.tsx)
if [ "$p1" != "1/1" ]; then echo "G-7 FAIL: place1 layout.tsx binding must be exactly one line directly above robots: [matched/adjacent=$p1]"; ok=0; fi
p2=$(awk '/^#+ /{sec=$0} sec ~ /^### P3-8/ && /解除條件/ && /056-pre-launch-checklist/{c++} END{print c+0}' docs/health-check/TODO.md)
if [ "$p2" != "1" ]; then echo "G-7 FAIL: place2 TODO.md needs exactly one 解除條件 line citing this ticket inside P3-8 [count=$p2]"; ok=0; fi
p3=$(awk '/^#+ /{sec=$0} sec ~ /noindex/ && /056-pre-launch-checklist/{c++} END{print c+0}' AGENTS.md)
if [ "$p3" != "1" ]; then echo "G-7 FAIL: place3 AGENTS.md needs exactly one line citing this ticket inside the noindex section [count=$p3]"; ok=0; fi
if [ "$ok" -eq 1 ]; then echo "G-7 PASS [place1=$p1 place2=$p2 place3=$p3]"; fi
exit $((1-ok))
```

通過條件：印出 `G-7 PASS` 且離開碼 `0`。三檔任一零命中即失敗；`layout.tsx` 的綁定註解**不在 `robots:` 正上方**也失敗。

> **2026-09-24（cycle 8）更正：原本這裡只有一條 `grep`，它是位置無關的，而它保護的性質是位置相關的。已改為同時檢查相鄰性。原內容保留於下。**
> 原句為：「綁定是否成立，用一條指令查：」，其後為一個 `bash` 區塊，內容逐字為
> `grep -rn '056-pre-launch-checklist' src/app/layout.tsx docs/health-check/TODO.md AGENTS.md`，
> 再接一句：「三個檔案各至少一筆命中，即綁定成立；任一檔零命中即為失敗。這條指令進 `## Test plan`，也是 AC-3 的驗收方式。」
> **它錯在哪**：本節自己寫著綁定要放在 `robots:` 正上方，理由是「**這是唯一繞不過的位置**」。但只看 `grep` 命中，
> 把註解**移到檔尾**——正是 AC-3 明文禁止的位置——`grep` 仍三檔命中、仍 exit 0、G-7 仍回報通過，
> 而「繞不過」這個性質已經沒了。**觸發情境不假設惡意**：要刪 `robots:` 的人把註解挪開而不是刪掉，是最自然的一種操作，
> 而那正是 gate 該叫的瞬間。
> **相鄰性判準本來就存在於本票**（AC-3 的 `awk`），只是 gate 沒用上。這次是把已有的判準接上 gate，不是發明新要求。
> **另一處順帶更正**：原句說「這條指令進 `## Test plan`」，該副本已於 cycle 7 依 F-12 移除，此描述自 cycle 7 起即不成立。

#### Gate 執行清單

公開之前逐項跑。`機械` 項 FO 代跑並附輸出；`人工` 項 captain 判斷並留下簽字（寫在本票的 Feedback Cycles）。

| 項 | 類型 | 內容 | 通過條件 |
|---|---|---|---|
| G-1 | 機械 | `058`–`063` 六張新票的狀態 | 指令（2026-09-21 補，整列可原樣複製執行，不含需轉義的字元）：`for n in 058 059 060 061 062 063; do f=$(ls docs/constitution-features/$n-*.md docs/constitution-features/_archive/$n-*.md 2>/dev/null); if test -n "$f"; then echo "$n $(grep -m1 '^status:' $f) $(grep -m1 '^verdict:' $f)"; else echo "$n NOT FOUND"; fi; done`。通過條件（**2026-09-22 更正，原條件不可達成，原句與理由見表下補述**）：每張票印出的 `status` 為 `complete` 且 `verdict` 為 `PASSED`，或 captain 逐票明確接受，**理由逐票寫入本票 `### Feedback Cycles`，一張票一行**（格式與查核指令見表下 2026-09-23 補述）。印出 `NOT FOUND`、`verdict` 為空、或 `verdict` 為 `REJECTED`，一律視為該項尚未有結論，不通過 |
| G-2 | 機械 | `052`、`049` 兩張既有票 | 指令（2026-09-21 補）與 G-1 同一條，只換票號：`for n in 049 052; do f=$(ls docs/constitution-features/$n-*.md docs/constitution-features/_archive/$n-*.md 2>/dev/null); if test -n "$f"; then echo "$n $(grep -m1 '^status:' $f) $(grep -m1 '^verdict:' $f)"; else echo "$n NOT FOUND"; fi; done`。通過條件同 G-1（含 2026-09-22 的更正）|
| G-3 | 人工 | Vercel 的 Build Command 與 `NEXT_PUBLIC_PUBLIC_MODE` 實際值 | captain 開 dashboard 確認並把實際值抄回本票（記錄格式與查核指令見表下 2026-09-24 cycle 9 補述）|
| G-4 | 人工 | A1、A4、B1b 三項「明確接受」 | captain 簽字，理由寫入本票（記錄格式與查核指令見表下 2026-09-24 cycle 9 補述）|
| G-5 | 機械 | 佔位字串全站掃描 | `grep -rniE '某[學学]者\|某大[學学]\|lorem ipsum\|前端工程師[ 　]?[ABＡＢ]\|volunteer@addcourt\.tw\|快速了解最新判[決决]的[5５][個个]重[點点]' src/` 零命中 |
| G-6 | 機械 | D1／D2 的反向保護（id 層＋內容層） | （**2026-09-24 cycle 8 更正**原判準只看 id、**2026-09-24 cycle 9 更正**內容層原為裸子字串，兩則見表下）跑 Gate 執行清單下方標記 `# canonical: G-6` 的那一段，通過條件為印出 `G-6 PASS` 且離開碼 `0`。`h2`／`h28` 任一列回來、或**釋字第272號**（半形／全形數字、有無空格、簡繁皆算）出現在**任何欄位的任何字串**裡，皆不通過，必須先有法學確認記錄 |
| G-7 | 機械 | **三處綁定各自都在它該在的位置，且各恰好一處** | （**2026-09-24 cycle 8 更正**，原為「上面那條 `grep -rn '056-pre-launch-checklist'` 三檔皆命中」；**2026-09-24 cycle 13 更正**，原為「三檔各至少一筆命中 ＋ 只驗 `layout.tsx` 的相鄰性」，見該小節的 cycle 13 更正）跑本節「怎麼被查證排除」小節內標記 `# canonical: G-7` 的那一段，通過條件為印出 `G-7 PASS` 且離開碼 `0`。**只看 `grep` 命中不足，只數檔案命中數也不足**——判準對三處**各自**驗它該驗的那一筆（處 1 相鄰且恰一行、處 2 在 P3-8 內且恰一條、處 3 在 noindex 小節內且恰一行）|
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

> **2026-09-24（cycle 9）補述：G-3／G-4 的簽字有記錄要求但沒有查核方式，與 F-9 是同一個形狀，已補上格式與查核指令。兩項的「要查什麼」沒有改。**
> **本項非本輪被點名**——是依本輪「逐條掃過每一個 G 項」的指示掃出來的。
> **缺口**：G-3 寫「把實際值抄回本票」、G-4 寫「理由寫入本票」，本節導言寫「`人工` 項 captain 判斷並留下簽字（寫在本票的 Feedback Cycles）」。
> 位置有了，但**沒有格式、也沒有任何人查得到它到底有沒有被寫**——這正是 F-9 在 G-1／G-2 例外出口上修掉的那個缺口，
> 只是當時只修了 `機械` 兩項，`人工` 兩項留在原地。**一道只靠口頭宣稱的 gate 項等於沒有。**
> **記錄位置**：本票的 `### Feedback Cycles`，一項一行，格式固定為
> `- gate-signoff G-3：實際值 Build Command={值} / NEXT_PUBLIC_PUBLIC_MODE={值}。{YYYY-MM-DD}`、
> `- gate-signoff G-4：captain 明確接受 A1／A4／B1b。理由：{一句話}。{YYYY-MM-DD}`。
> **查核指令**（整列可原樣複製；前綴與輸出刻意全用 ASCII，理由同 F-9 那條）：`for g in G-3 G-4; do if awk -v g="$g" '/^### Feedback Cycles/{s=1;next} /^#/{s=0} s && index($0, "- gate-signoff " g)==1 {f=1} END{exit !f}' docs/constitution-features/056-pre-launch-checklist.md; then echo "$g RECORDED"; else echo "$g NO-RECORD"; fi; done`
> **兩個方向都驗過**（2026-09-24 cycle 9，皆在副本上操作）：(a) 今日兩項皆印 `NO-RECORD`——沒簽就是沒簽，查得出來；
> (b) 把 `- gate-signoff G-3：…` 放進 `### Feedback Cycles`、同時把 `- gate-signoff G-4：…` 當誘餌放進 `## Out of scope`——
> 印 `G-3 RECORDED`／`G-4 NO-RECORD`，**該算到的算得到，區段外的誘餌不算**。只驗其中一個方向等於沒驗。
> **這兩項仍是 `人工`，AC-4 的「六個 `機械` 項」數目不變**：查核指令查的是**簽字記錄在不在**，不是代替 captain 判斷，
> 與 F-9 那條查 G-1／G-2 例外記錄的指令性質相同。
> **格式由 captain 可否決**：若 captain 偏好自由書寫，刪掉本則的格式與查核指令即可，不影響 G-3／G-4 要查的內容。

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

> **2026-09-24（cycle 6）更正：G-5 的掃描 pattern 只認一種寫法，異寫法全部掃不到，已擴大涵蓋面。G-5 要求什麼沒有改。**
> 本項**非本輪引入**——G-5 自 design 階段即如此寫。依 captain 2026-09-24 的一次性授權：「授權修正 `Verified by:` 涵蓋既有寫法變體，不改 AC 要求本身」。
> 原 pattern 為：`某學者|某大學|lorem ipsum|前端工程師 [AB]|volunteer@addcourt\.tw|快速了解最新判決的5個重點`。
> **它錯在哪**：`前端工程師 [AB]` 的半形空格是必要的，所以 `前端工程師A`（無空格）與 `前端工程師　B`（全形空格）掃不到；簡體 `某学者`／`某大学` 掃不到；全形數字 `快速了解最新判決的５個重點` 掃不到。**G-5 以零命中為通過，掃不到就等於通過**——方向是 fail-open，而 G-5 正是本票為了防 `015` 事故（`某學者，某大學法律系` 公開顯示四個月）而設的那一項。
> **可原樣複製的完整指令**（表格列內的 `|` 依 markdown 需寫成 `\|`，這一行沒有）：`grep -rniE '某[學学]者|某大[學学]|lorem ipsum|前端工程師[ 　]?[ABＡＢ]|volunteer@addcourt\.tw|快速了解最新判[決决]的[5５][個个]重[點点]' src/`
> **改的是哪幾個字元、為什麼**：`某[學学]者`／`某大[學学]`（簡繁）、`前端工程師[ 　]?[ABＡＢ]`（空格可有可無、半形或全形，A／B 半形或全形）、`快速了解最新判[決决]的[5５][個个]重[點点]`（簡繁與全形數字）。`lorem ipsum` 與 `volunteer@addcourt.tw` 靠 `-i` 已涵蓋大小寫，未動。**沒有新增任何字串**——字串集合與原本完全相同，只是每個字串多認了既有的寫法變體。
> **雙向驗過**（2026-09-24 cycle 6，逐行實跑）：(a) 十一個字串新 pattern 全部 `HIT`，舊 pattern 為六 `HIT`／五 `MISS`；(b) 對 `src/` 實掃，新舊 pattern 的輸出 `diff` **完全相同**（同樣三筆：`PresentDetail.tsx:32`、`contributors.ts:16`、`:21`），未多抓任何一行；另以八個近似但合法的字串（`某些學者認為這個判決有爭議`、`台灣大學法律系`、`前端工程師的工作內容`、`這則判決的5個重點` 等）測試，全部 `MISS`。**過寬和過窄一樣壞**：過寬會讓 G-5 永遠不通過，所以 (b) 和 (a) 一樣必須驗。

**G-6 的正本**（表格列只引用，不複述）：

```bash
# canonical: G-6 —— D1／D2 的反向保護：id 層與內容層都要成立
node -e "const a=require('./src/data/history.json');const i=a.map(x=>x.id);const bad=[];if(i.includes('h2'))bad.push('id:h2');if(i.includes('h28'))bad.push('id:h28');const RE=/[釋释]字第[ 　]*[2２][7７][2２][ 　]*[號号]/;const hit=[];(function w(o,p){if(typeof o==='string'){if(RE.test(o))hit.push(p)}else if(o&&typeof o==='object'){for(const k in o)w(o[k],p?p+'.'+k:k)}})(a,'');if(hit.length)bad.push('content:釋字第272號@'+hit.join('|'));if(bad.length){console.error('G-6 FAIL: '+bad.join(','));process.exit(1)}console.log('G-6 PASS')"
```

> **2026-09-24（cycle 8）更正：G-6 原本只以 id 判定，而它保護的性質是內容。已補上內容層斷言。原判準保留於下。**
> 原判準為：`node -e "const a=require('./src/data/history.json');const i=a.map(x=>x.id);if(i.includes('h2')||i.includes('h28'))process.exit(1)"` 回傳 0。
> **它錯在哪**：把釋字第272號的內容以**另一個 id** 重新核可，id 層完全看不到。實測——在副本加一列 `h47`、
> `reality.title` 帶「釋字第272號」：舊判準離開碼 `0`（回報通過），而同一份資料 `JSON.stringify(a).includes('272')` 為 `true`。
> **D1 那筆需法學確認的錯誤內容就在線上，而反向保護說通過。**
> **較強的寫法當時已知**：本票 design 第一節自己用的就是內容層斷言（`JSON.stringify(a).includes('272')` → `false`）。
> gate 採了較弱的那一個，這是本輪要修的。
> **id 層保留不移除**：它針對的是「`h2`／`h28` 這兩列本身回來」，內容層針對的是「內容換個 id 回來」，兩者互補不互斥。
> **涵蓋面要誠實說明**：內容層目前只針對 D1（`272`）。D2（`h28` 的標題錯誤）沒有等價的內容層字串可斷言——
> 錯誤的標題本身是一句正常中文，不像 `272` 有唯一識別性。D2 的同型缺陷（`h34`／`h35` 標題重複）由票 `062` 負責，
> 本 gate 不宣稱涵蓋它。
> `272` 這個字串若日後出現在其他合法內容上，G-6 會誤判為失敗——方向是 fail-closed（gate 卡住而非放行），
> 與本票一貫的取捨一致：寧可多叫一次，不可漏叫一次。

> **2026-09-24（cycle 9）更正：上一則補的內容層斷言在兩個方向同時錯，已改為「case-number 型樣 ＋ 容忍既有寫法變體」。原斷言保留於上。**
> 原斷言為：`JSON.stringify(a).includes('272')`，即**整份 JSON 的裸子字串**。
> **方向一，過窄（fail-open，且靜默）**：漏掉全形數字。副本加一列 `ruling_id` 為 `釋字第２７２號`——
> id 層乾淨、裸子字串為 `false`、**`G-6 PASS`、exit 0**。D1 那筆需法學確認的錯誤內容在線上，而反向保護說通過。
> **這正是 F-11（cycle 6）修過的同一個形狀**——那次修的是 `前端工程師 [AB]` 只認一種寫法，修法是加字元類；
> 一個 cycle 後在 G-6 重新出現。可行性不是假設：`history.json` 現有 **163 個全形標點**，證明輸入端用的是會產生全形字元的中文 IME；
> `ruling_id` 40 筆**已經有兩種寫法**（`釋字第242號` 與 `釋字第 261 號`），證明該欄位手打且格式不統一。
> **方向二，過寬（fail-closed）**：`272` 是裸子字串，會打到圖片網址。副本加一列**完全合法**的 `h48`（`釋字第748號`）、
> `bgImage` 為 `photo-1527200272341-...`：**`G-6 FAIL: content:272`、exit 1**，而訊息會讓執行者去找一個不存在的法律內容問題。
> 現有 8 列有 `bgImage`，`TODO.md` P3-8 另記 17 列待補。
> **上一則自己揭露過這個 fail-closed，但只寫在散文裡、沒有實測、也沒評估觸發面——揭露不等於驗證。**
> 該句（「`272` 這個字串若日後出現在其他合法內容上，G-6 會誤判為失敗」）**自本則起不再成立**：新斷言要求 `釋字第…號` 的前後文，圖片網址沒有這個前後文。
> **修法**：型樣為 `[釋释]字第[ 　]*[2２][7７][2２][ 　]*[號号]`——半形／全形數字、有無空格（半形或全形）、簡繁，全部容忍。
> **收窄必須同時容忍變體**：直覺的「收窄成 `第272號`」會漏掉資料裡**已經存在**的 `釋字第 261 號` 那種空格寫法，**比原斷言還糟**。三者實測對照：
>
> | 情境 | 原 `includes('272')` | 只收窄成 `第272號` | 本則（型樣＋變體類） |
> |---|---|---|---|
> | `釋字第272號` | 攔下 ✓ | 攔下 ✓ | 攔下 ✓ |
> | `釋字第 272 號`（**資料中真實存在的空格寫法**） | 攔下 ✓ | **放行 ✗** | 攔下 ✓ |
> | `釋字第２７２號`（全形） | **放行 ✗** | **放行 ✗** | 攔下 ✓ |
> | 合法列、圖片 id 帶 `272` | **攔下 ✗（誤攔）** | 放行 ✓ | 放行 ✓ |
> | 乾淨語料 | 放行 ✓ | 放行 ✓ | 放行 ✓ |
>
> **為何掃「所有字串欄位」而不是只掃 `ruling_id`**：只掃 `ruling_id` 會**退回**——
> 上一則自己的重現用的是 `reality.title`，收成單一欄位就抓不到它了。釋字號可以寫在 `title`、`ruling`、`textbook.content` 的任何一處，
> **涵蓋面要對齊語意（釋字號出現在任何人寫的字裡），不要對齊某一次的指認**。
> 而排除圖片網址**靠的是型樣不是欄位名**：點名 `bgImage` 是「點名單一實例」，日後任何新的網址欄位都會重新破功；
> 型樣要求 `釋字第…號` 的前後文，對所有網址欄位一體有效。
> **失敗訊息改為指出欄位路徑**（如 `content:釋字第272號@40.reality.ruling_id`），執行者不必再去猜是哪一列哪一欄。
> **殘留，誠實記錄**：(1) 範圍寫法 `釋字第781~783號` 在資料中真實存在，若日後出現 `釋字第270~275號` 這類**涵蓋** 272 的範圍，型樣不會攔——
> 它是另一個 `ruling_id`，不是 D1 那筆內容的還原，本 gate 不宣稱涵蓋；(2) 若某個網址**字面上**含 `釋字第272號`，會被攔下，方向是 fail-closed，可接受。
> **id 層與 D2 的涵蓋面說明不變**，見上一則。

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

設計階段不改動渲染邏輯，故不需回歸測試。

**gate 執行時要跑的完整指令在第三節的「Gate 執行清單」（`G-1`–`G-8`），以那一份為唯一正本。本節不再複述。**
本節只保留第三節沒有的東西：2026-09-21 的實測記錄，以及下方兩條規定。

**2026-09-21 實測結果**（這是現況，不是通過狀態）：

| 指令 | 通過條件 | 2026-09-21 實測 |
|---|---|---|
| `npx tsc --noEmit` | 無輸出 | **通過**，無輸出 |
| AC-3 的 `grep` | 三檔各至少一筆命中 | **不通過**，三檔皆零命中——綁定尚未建立，這是本票 implement 的工作 |
| G-5 的 `grep` | 零命中 | **不通過**，三筆命中：`PresentDetail.tsx:32`（C1）、`contributors.ts:16`、`:21`（C2）。兩者各有其票，gate 追其結論 |
| G-6 的 `node` | `false false` | **通過**，輸出 `false false` |

`npm run build` 本階段未跑——本票 design 未改動任何程式碼，`npx tsc --noEmit` 已足以確認型別基準線。`build` 列在 `G-8`，於 gate 執行時跑。

A 類四項需在 `npm run dev` 的實際渲染上驗證，方式見 AC-2。**不執行 `npm run sync-content`。**

> **2026-09-24（cycle 7）更正：本節原本複述了一份 gate 指令清單，那份副本已經跟第三節的正本分岔，整份移除並改為指向第三節。原內容逐字保留於下。**
> 原句為：「設計階段不改動渲染邏輯，故不需回歸測試。下列為 gate 執行時要跑的完整指令，也是 implement／verify 的驗收依據。」，其後為一個 `bash` 區塊，逐字如下（每列一條）：
> 1. `npx tsc --noEmit` — 註記 `# G-8`
> 2. `npm run build` — 註記 `# G-8；不會觸發同步，PR #32 已把 sync 移出 build`
> 3. `grep -rn '056-pre-launch-checklist' src/app/layout.tsx docs/health-check/TODO.md AGENTS.md` — 註記 `# AC-3 / G-7`
> 4. `grep -rniE '某[學学]者|某大[學学]|lorem ipsum|前端工程師[ 　]?[ABＡＢ]|volunteer@addcourt\.tw' src/` — 註記 `# G-5`
> 5. `node -e "const a=require('./src/data/history.json');const i=a.map(x=>x.id);console.log(i.includes('h2'),i.includes('h28'))"` — 註記 `# G-6`
> **它與第三節分岔在兩處，兩處都是 fail-open：**
> **分岔一（第 1、2 列，G-8 的順序）**：本副本把 `npx tsc --noEmit` 列在 `npm run build` **之前**。照它做會直接走進 F-8 記載的假性失敗——`.next/types/` 的殘留重複檔會讓 `tsc` 印 `TS2300`、離開碼 `2`，而執行者可能因此去改根本沒問題的原始碼。這個分岔是 cycle 4 只修了第三節那一列造成的，之後沒有人比對過兩份。
> **分岔二（第 4 列，G-5 的字串集合）**：本副本只有五個 alternation，少了 `快速了解最新判決的5個重點`。跑這一份會**整個漏掉一個佔位值**——而 G-5 以零命中為通過，漏掉就等於通過。
> **為什麼不是「把兩份對齊」而是「讓副本消失」**：本票前六輪，每一輪 reviewer 都找到同一類缺陷的新實例。前八處都是「檢查只認一種寫法」，這一處不同——**是同一個檢查有兩份副本，而副本會分岔。**只要兩份還在，就會有第三次分岔。對齊只修掉今天這兩處，移除副本才修掉產生分岔的機制。
> **本則保留的是記錄，不是指令**：本票的慣例是「fenced ```bash 區塊＝可執行的指令」、「blockquote 內的行內程式碼＝逐字保留的原文」。上面五列寫成 blockquote 而非 fenced 區塊，就是為了讓它不被當成第二份可執行副本——下面那條查核指令正是依這個區分在判斷。

**查核：本票內不得再有第二份可執行的 G 項指令清單。**

下列指令掃描本票的「活的」部分（第一個 `## Stage Report:` 之前），找出所有 fenced 區塊內的 G 項指令，並依所在區段分類。
**豁免是區塊性的，不是區段性的**：只有首行帶 `# canonical:` 或 `# divergence-check` 標記的那一個區塊被跳過；
沒有標記的區塊一律照掃，**不論它在哪一節**。`## Acceptance criteria` 內那一筆印為 `AC-OWNED`——AC 文字非本票可改，
它與 G-7 重疊是**已知例外，印出來而不是靜默略過**。其餘任何一筆一律報 `STRAY`。
**標記本身也被計數**：每個標記（`G-6`、`G-7`、`divergence-check`）在活的部分只該出現一次，出現兩次以上即報 `DUP-MARKER`。
理由見下方 2026-09-24（cycle 9）更正——`# canonical:` 是**貼在真實 gate 區塊上、本來就該被複製貼上**的標記，
光靠「有標記就豁免」會讓整份複製的正本區塊無聲通過。

```bash
# divergence-check (self) —— 本區塊是查核指令本身，依 self 規則排除
awk '
/^## Stage Report:/{stop=1} stop{next}
/^## /{h2=$0; sec=$0}
/^### /{sec=$0}
/^#### /{sec=$0}
$0 ~ "^[ \t]*\140\140\140" {inb=!inb; if(inb) self=0; next}
!inb{next}
/# canonical:|# divergence-check/{
  if (!self) {
    if (match($0, /# canonical:[ \t]*[A-Za-z0-9-]+/)) { lbl=substr($0,RSTART,RLENGTH); sub(/# canonical:[ \t]*/,"",lbl); cnt[lbl]++ }
    else cnt["divergence-check"]++
  }
  self=1; next
}
self{next}
{
  line=$0; gsub(/[ \t]+/," ",line); sub(/^ /,"",line);
  q=sprintf("%c",39); tgt=line; gsub(q,"",tgt); gsub(/"/,"",tgt); hit="";
  flat=line; gsub(/[][\\]/,"",flat); flat=tolower(flat);
  isrc = (tgt ~ / src\/( |$)/ || tgt ~ /layout\.tsx/);
  if (line ~ /tsc --noEmit/) hit="tsc";
  else if (line ~ /(npm|pnpm|yarn) (run )?build/) hit="build";
  else if (line ~ /grep -/ && (line ~ /056-pre-launch-checklist/ || line ~ /lorem ipsum/ || line ~ /某/) && isrc) hit="grep";
  else if (line ~ /node .*-e/ && line ~ /history\.json/ && flat ~ /h2|h28|272|釋字|字第|u5b57|u91cb|u7b2c/) hit="node";
  else if (line ~ /for [A-Za-z_][A-Za-z0-9_]* in [0-9]/ && line ~ /docs\/constitution-features/) hit="loop";
  if (hit=="") next;
  if (h2 ~ /^## Acceptance criteria/) print "AC-OWNED[" sec "] " hit;
  else print "STRAY[" sec "] " hit;
}
END{ for (k in cnt) if (cnt[k]>1) print "DUP-MARKER[" k "] " cnt[k] }
' docs/constitution-features/056-pre-launch-checklist.md
```

**通過條件：`STRAY` 零筆，且無任何 `DUP-MARKER`。** 2026-09-24（cycle 9）實測：`STRAY` 零筆、`DUP-MARKER` 零筆、`AC-OWNED` 一筆（三個標記各計一次）。

> **2026-09-24（cycle 8）更正：本查核指令有兩個缺陷，已修。原內容保留於下。**
> 原指令為（單行）：`awk '/^## Stage Report:/{exit} /^## /{h2=$0; sec=$0} /^### /{sec=$0} /^```/{inb=!inb; self=0; next} inb && /divergence-check/{self=1; next} inb && !self && /npx tsc --noEmit|npm run build|grep -rn |grep -rniE |node -e |for n in 0/ {if (sec ~ /^### 三、/) next; else if (h2 ~ /^## Acceptance criteria/) print "AC-OWNED[" h2 "] " substr($0,1,44); else print "STRAY[" sec "] " substr($0,1,44)}' docs/constitution-features/056-pre-launch-checklist.md`
> 其前的說明句為：「下列指令掃描本票的「活的」部分（第一個 `## Stage Report:` 之前），找出所有 fenced 區塊內的 G 項指令字串，並依所在區段分類——查核指令自己的區塊以首行 `# divergence-check (self)` 標記排除（只排除帶標記的那一個區塊，任何**新**放進來的區塊都沒有這個標記，照樣會被抓到），落在第三節的是正本，`## Acceptance criteria` 內的一筆屬 captain 所有（AC 文字非本票可改，已知與 G-7 重疊，列為已知例外而非隱藏），其餘一律報 `STRAY`：」
> 其後的通過條件句為：「**通過條件：`STRAY` 零筆。** 2026-09-24 實測——修法前五筆 `STRAY`（全在 `## Test plan`），修法後零筆，`AC-OWNED` 一筆不變。任何人日後在第三節之外再放一份可執行的 G 項指令，這條檢查就會印出 `STRAY`。」
> **缺陷一（豁免範圍太寬）**：原 awk 只在 `^### ` 與 `^## ` 更新 `sec`，**`####` 不更新**，
> 所以 `sec ~ /^### 三、/` 這個豁免實際涵蓋整個第三節——95 行、四個 `####` 子節。
> 把分岔副本放進 `#### 誰、在哪個時點執行`，原指令的 `STRAY` 為 **0**。
> headline 寫的是「**本票內**不得再有第二份」，涵蓋面卻只是「第三節之外」，兩者不一致。
> **修法**：移除區段性豁免，改為**只豁免帶標記的那一個區塊**，並讓 `sec` 也在 `####` 更新，使報告能指出精確子節。
> **缺陷二（只認一種拼法）**：原指令逐字比對 `grep -rn `、`grep -rniE `、`node -e `、`for n in 0` 等前綴，
> 所以 `grep -rinE`（旗標順序不同）、`grep -nr `、`node  -e`（雙空白）、`npm  run build`、`for m in 0`（迴圈變數不同）全部掃不到。
> **這與 F-11 是同一個形狀，只是換到偵測指令自己身上。**
> **修法不是列舉更多拼法**：先把空白正規化（`gsub(/[ \t]+/," ")`），再以「指令名 ＋ G 項專屬引數」配對判斷，
> 對旗標順序與空白數量不敏感。`grep` 一律寫成 `grep -`，不指定旗標內容。

> **2026-09-24（cycle 9）更正：偵測器有三類缺陷，已一併修。原指令保留於上一則。**
> **缺陷三（過寬：不看掃描目標）**：`grep` 分支的條件是「含 `grep -`」且「含 `056-pre-launch-checklist` 或 `lorem ipsum` 或 `某`」，
> **完全不看它在掃什麼**。自構十條合法驗證指令實測，**五條被誤報 `STRAY`**——
> `grep -c "某學者" src/data/discussions.json`、`grep -n '某大學' docs/health-check/TODO.md`、
> `grep -rn 'lorem ipsum' docs/content-pipeline/`、`grep -c '056-pre-launch-checklist' docs/INDEX.md`，
> 以及 `node -e "console.log(require('./src/data/history.json').length)"`。
> **這比 reviewer 點名的範圍大**：它報的是 `grep` 分支一條，實際是 `grep` 分支四條**加上 `node` 分支一條**——
> `node` 分支只要求「`node -e` ＋ `history.json`」，任何對 `history.json` 的合法讀取都會被誤報。**同一類缺陷，兩個分支。**
> **修法**：兩個分支都補上「G 項專屬的掃描目標／斷言」。`grep` 分支要求掃描目標是 ` src/`（G-5 的目錄）或 `layout.tsx`（G-7／AC-3 的三檔），
> 比對前先去掉引號，對 `'src/'`／`"src/"` 這類寫法不敏感；`node` 分支要求指令內出現 `h2`／`h28`／`272`／`釋字` 其一，
> 也就是**真的在做 G-6 的斷言**，而不只是碰到同一個檔案。
> **缺陷四（過窄：三個分支仍只認一種拼法）**：F-18 修了 `grep`，但 `tsc` 分支寫死 `npx tsc --noEmit`、
> `build` 分支寫死 `npm run build`、`loop` 分支寫死 `in 0`。**這是 F-11／F-18 的同一形狀，只是留在沒被點名的分支上。**
> 實測：`tsc --noEmit`（不帶 `npx`）、`yarn build`、`for m in 049`（迴圈變數與票號不同）三種寫法舊偵測器**全部掃不到**。
> **修法**：`tsc --noEmit`（不綁執行器）、`(npm|pnpm|yarn) (run )?build`、`in [0-9]`（對齊「票號是數字」的語意，而不是「058 開頭是 0」的巧合）。
> **缺陷五（標記可被複製）＝ F-14**：豁免判準是「區塊首行帶標記」，而 `# canonical:` 是**貼在真實 gate 區塊上、本來就該被複製貼上**的標記。
> 實測：把帶 `# canonical: G-6` 的區塊整份複製到 `## Out of scope`，`STRAY` 為 **0**；`G-7` 同；
> 帶 `# divergence-check` 的區塊同樣可繞過（這是 F-14 最初的那個探測，已開三輪未收）。
> **修法**：對每個標記計數，大於 1 即報 `DUP-MARKER`。**計數涵蓋整個標記類**（`G-N` 與 `divergence-check`），
> 不只 `# canonical:`——只收 `# canonical:` 是「點名單一實例」，會把 F-14 原本的那個探測留在原地。
> 計數只採**區塊的第一個標記行**，所以偵測器自己的區塊（首行是 `# divergence-check (self)`）計為一次，
> 其內文出現的 `# canonical:` 字樣（本程式自己的比對式）不會被重複計入。
> **上一則引述的原文裡那句「任何新放進來的區塊都沒有這個標記，照樣會被抓到」，自 2026-09-24（cycle 8）改成「只認標記」之後就不再成立**——
> 原文逐字保留不動（那是記錄），但**該宣稱到此作廢**，取代它的是 `DUP-MARKER` 計數。
> **雙向驗過**（2026-09-24 cycle 9，偵測器從本文件抽出後參數化執行，全部在副本上）：
> (a) **會叫**——六行真副本放進 `#### 誰、在哪個時點執行`／`#### 與移除 noindex 的綁定`／`#### Gate 執行清單`／`### 三、Gate 機制`／`## Test plan`／`## Out of scope`，
> **六個位置全部 `STRAY=6`**；七種拼法變體**全部抓到**（舊偵測器只抓到四種）；
> 整份複製 `# canonical: G-6` → `DUP-MARKER[G-6] 2`，`G-7` → `DUP-MARKER[G-7] 2`，`# divergence-check` → `DUP-MARKER[divergence-check] 2`。
> (b) **不誤叫**——十條合法指令 `STRAY` 由 **5 降為 0**；真實候選 `STRAY` 零筆、`DUP-MARKER` 零筆、`AC-OWNED` 一筆不變。
> **只驗 (a) 或只驗 (b) 都等於沒驗**：(a) 漏了就是 fail-open，(b) 漏了則會讓這條檢查因為常態誤報而被習慣性忽略。

> **2026-09-24（cycle 11）更正＝F-29：上一則「`node` 分支要求指令內出現 `h2`／`h28`／`272`／`釋字` 其一」留下一個盲區，已收。原句保留於上，不改寫。**
> **盲區是什麼**：那四個條件**都是字面值**，而 **G-6 正本自己把票號寫成字元類**——`[釋释]字第`、`[2２][7７][2２]`。
> 所以**只取內容層 `RE`、丟掉 id 層**的那種副本，**四個字面值一個都不含**：`釋` 後面接的是 `释`、`2` 後面接的是 `２`，字面值全部被 `]`／`[` 拆開。
> 實測：這樣一行放進 `## Out of scope`，舊判準 `STRAY` 為 **0，漏抓**。
> **正本被抓到只是因為它同時帶著 id 層的 `'h2'` 與錯誤訊息字串 `'content:釋字第272號@'`**——那是巧合，不是判準在起作用。
> **這是 F-11／F-18／F-22 的同一形狀第四次出現，而這一次偵測器盲的是自己的正本**：它列舉了票號的**某一種寫法**，而它要保護的性質是「這行在做 G-6 的斷言」。
> **修法**（FO 2026-09-24 cycle 11 授權）：把 **`字第`** 加進 alternation，即 `line ~ /h2|h28|272|釋字|字第/`。
> **為什麼是 `字第`**：字元類會把票號本身拆開，但**`字第` 這兩個字不會被拆**——`[釋释]字第` 裡的 `字第` 是連續的字面字元，
> 而它又同時被 `node .*-e` 與 `history\.json` 兩個條件夾住，所以不會擴大誤報面。
> **四個方向實測（修法後）**：漏抓的那一行 `STRAY` **0 → 1**；六行真副本仍 **6**（六個位置各 6）；七種拼法變體仍 **7**；十條合法指令仍 **0**；真實候選仍 `STRAY` 零筆、`DUP-MARKER` 零筆、`AC-OWNED` 一筆。
> **promote 條件已無需保留**（缺陷已收）。**日後若再擴充這個 alternation，必須重跑十條合法指令那一組**——`history.json` 出現在合法指令裡很常見，這個分支的誤報史就是 F-22。
> **2026-09-24（cycle 9）：F-21 記錄在案，決定不收（decline）。理由與日後要收的寫法一併寫在這裡，免得再推導一次。**
> **F-21 是什麼**：G-7 的相鄰性判準是 `nxt ~ /robots:/`，只認「下一行含 `robots:` 這串字」，**不認它是不是真的 metadata**。
> **觸發條件（兩件事必須同時發生）**：(1) 綁定註解被移出 `robots:` 正上方；(2) 註解新位置的下一行**剛好**含 `robots:` 這串字——
> 例如檔尾補一行 `// robots: 這一行只是註解，不是真的 metadata`。實測此時 `G-7 PASS`、exit 0，而真正的 metadata 已無綁定看守。
> **為何 decline**：這需要「註解被移走」與「新增一行剛好含 `robots:`」同時發生，想不出自然的工作流會產生它；
> 相較之下 F-19 的觸發只需要輸入端打一個全形數字。依 `## Review-finding disposition` 判為 **Polish**，FO 2026-09-24（cycle 9）授權 decline。
> **promote-to-material 條件**：`layout.tsx` 內出現第二處含 `robots:` 字樣的行（註解或字串皆算），此時判準的唯一性假設就沒了。
> **日後要收的寫法**：把 `nxt ~ /robots:/` 換成錨定 metadata 屬性的形式——要求下一行是 `robots:` 後接 `{`（物件字面值），
> 即 `nxt ~ /robots:[ \t]*\{/`，並同時斷言全檔符合該形式的行**恰好一行**（與 `DUP-MARKER` 同一個「唯一性要計數」的思路）。
> **收之前必須兩個方向都驗**：真 metadata 在正上方要 `PASS`，假 `robots:` 註解要 `FAIL`，且註解形式若日後改成多行物件也不能誤擋。

> **2026-09-24（cycle 9 補正）：本票的日期標示規則。先說為什麼需要一條規則——因為它壞過一次，而它壞的方式正是本票在修的形狀。**
> **缺陷**：本票有 29 處、`docs/health-check/TODO.md` 有 12 處日期指向**還沒到來的日子**（09-25 與 09-26，**branch 上沒有任何 commit 落在這兩天**）。
> 成因是最後四輪都發生在 2026-09-24，而日期被**按輪次遞增**而不是讀時鐘：cycle 6／7 標對了 09-24，cycle 8 標成 09-25，cycle 9 標成 09-26。
> **為什麼這在本票不是小事**：本票的整套方法就是「標日期的補述，原句保留」。**日期是這條審計軌跡的排序機制**，日期錯了軌跡就無法複查——
> 而「無法複查的記錄」正是 F-9、F-10、F-12 一路在修的東西。**同一個形狀，這次載體是日期而不是指令。**
> **規則（日後每一輪都照這個寫）**：
> 1. 日期一律取**實際 commit 的 author date**（`git log --format='%h %ad' --date=short`），**不得按輪次遞增、不得憑印象**。
> 2. **同一天有多輪時，用 cycle 編號消歧**，寫成 `2026-09-24（cycle 8）`；已在括號內時寫成 `2026-09-24 cycle 8`，避免括號套括號。
>    日期保持為真，排序資訊由 cycle 編號承載。
>    **這裡的 cycle 指 stage report 的編號**（`## Stage Report: implement (cycle 9)` 那一套），**不是 `### Feedback Cycles` 的編號**。
>    兩套自始相差 1——`### Feedback Cycles` 記 FO 授權的修正輪，stage report 記實際執行輪，說明見 `### Feedback Cycles` 的 Cycle 8 那一行。
>    **本則刻意指明用哪一套**：日期標籤是給人排序用的，若讀者拿另一套編號去對，排序資訊就失效了。
> 3. 某則補述若被別處逐字引述，**原文與引述必須同步**。只改一邊就是 F-12／F-13 的分岔副本，只是換一個載體。
> **可重跑的查核已存成正本，見本則下方標記 `# canonical: date-check` 的那一段。**
> **2026-09-24（cycle 10）更正：本則原本刻意不把這條查核寫成 fenced 區塊，那個決定已經推翻。原句保留於下。**
> 原句為：「本票**刻意不把這條查核寫成 fenced 區塊**：活的部分只該有四個可執行區塊（G-6 正本、G-7 正本、AC-3 的 `grep`、偵測器自己），
> 多放一個就是多一份會分岔的副本，而這條查核不屬於 G 項清單。判準以文字敘述，執行時照敘述寫一次性腳本即可。」
> **為什麼推翻**：那個理由在 cycle 9 之前成立，**而它正是被 cycle 9 自己的成果解掉的**。
> 「多一份就多一個會分岔的副本」的前提是「副本沒有任何機制保護」——cycle 9 新增的 `DUP-MARKER` 唯一性計數就是那個機制。
> 加上這一項之後，**全票唯一一條「已被證實會靜默回報 0」的查核，剛好也是唯一沒有被存成可執行形式的那一條**，
> 而本票十輪都在修「檢查的涵蓋面要對得上它宣稱保護的東西」。就這樣交付等於在自己的成果上留一個反例。
> **散文不能固定實作**：prose 判準要求每個執行者各寫一份，而它的已知失效模式正是「實作靜默回報 0」（BSD awk 無 `strftime`）。
> 存成正本之後只有一份實作，且由 `DUP-MARKER` 保護唯一性——複製它會被抓到，實測見 cycle 10 的 stage report。
> **活的可執行區塊因此由四個變成五個**：G-6 正本、G-7 正本、AC-3 的 `grep`、偵測器自己、date-check 正本。
> 判準一句話：**任何一行提到的日期，都不得晚於引入該行的那個 commit 的 author date。** 反向（早於）是合法的歷史引用，不報。
> cycle 9 補正實測：修正前 **41 筆**（本票 29、`TODO.md` 12），修正後 **0 筆**；另以刻意植入一個遠在未來的日期（`12-31`）的副本驗證該查核**會叫**，確認它不是一條永遠通過的死指令。
> **本則刻意不寫出那兩個錯誤日期的完整 ISO 形式**（只寫 `09-25`／`09-26`）：寫全了會被上面那條查核判為「指向未來」，
> 而為此加一個豁免標記，就是把 F-14 的錯誤再犯一次——**本票已經學過「標記會被複製，豁免會擴大」**。年份由本句上下文確定，不損失精確性。
>
> **涵蓋面聲明：「`violations=0`」不等於「所有日期都對」。以下兩件事在判準之外，日後看到 0 筆的人請以本段為準。**
> **(一) 只覆蓋完整 ISO 形式。** 判準比對的是 `20\d\d-\d\d-\d\d`，所以**裸 `MM-DD` 寫法對它不可見**，整份文件都一樣，不限本則。
> **刻意的例外是「兩個日期值」，不是「兩個位置」——這一句 cycle 10 初稿寫錯過，更正如下。**
> 例外的內容是：**提到 `09-25` 與 `09-26` 這兩個錯誤日期值時一律省略年份**（理由見上一段：寫全了會被本查核判為指向未來，而為此加豁免標記就是重犯 F-14）。
> 這個寫法**遍布全票**，不是只有上一段那兩處。**可重跑的計數指令**（兩個 lookbehind 用來排除已帶年份的寫法，只數真正裸的那些；
> **這裡刻意不舉出帶年份的例子**——舉了就等於在本票內寫下一個指向未來的完整 ISO 日期，會被下方那條查核判為違規。**我初稿就這樣寫，被自己的查核抓到了。**）：
>
>     perl -ne '$n+=()=/(?<!\d)(?<!-)\b09-2[56]\b/g; $l++ if /(?<!\d)(?<!-)\b09-2[56]\b/; END{print "$n occurrences on $l lines\n"}' docs/constitution-features/056-pre-launch-checklist.md
>
> 交付時實測 **72 處／47 行**（活的部分 **16 處／8 行**，其餘在各輪 stage report）。
> **全票總數只寫在這一處，其他地方一律改為定性敘述並指回本則。** 理由：這個數字會因為「記錄它自己」而變大。
> **實際軌跡**：cycle 10 收尾 **52** → cycle 11 報告提到那兩個日期一次 **53** → cycle 11 寫 F-31 一節 **60** → cycle 12 寫 F-31 處置與判準 **66** → cycle 12 記下「修好之後又抓到我一次」**67** → cycle 13 報告 **72**。
> **四輪之內變了六次，其中一次就是在記錄這個現象本身，而活的部分始終是 16／8 沒動一次。** 差別不在於誰比較準，在於**一個計數把記錄自己算了進去，另一個沒有**。
> **所以判準一句話：一個會因為被書寫而改變的數字，不該被寫在八個地方**（本票曾經如此，已收斂成這一處＋上面那條重算指令）。
> **通過條件永遠不要綁在這種數字上**——本票的 date-check 因此只要求 `scanned` 非零，不要求它等於某個值。
> **把一個會動的數字複製到八個地方，就是八個會各自過期的副本**——那是 F-12／F-13 的形狀。所以只留一處，其餘指回來。
> **這個數值會隨著「記錄它自己」而變大，所以它不是通過條件，只是一個可重跑的佐證**——真正要記住的是下面這個定性事實。
> **定性事實（不隨字數變動）**：裸 `09-25`／`09-26` **確實出現在日期規則這一則之外**——至少在 `### Feedback Cycles` 的 Cycle 8 那一行、
> cycle 9 的 stage report、以及 cycle 10 的 stage report。**所以「僅限本則」是假的**，初稿那樣寫，與文件實際狀態不符，已改掉。
> 實測佐證：把上一則的年份寫回去，該則多出 **13 筆** forward（不是初稿寫的 6 筆）；省略則 **0 筆**。
> **所以 0 筆的精確讀法是「所有寫成完整 ISO 的日期都對」。**
> **promote-to-material 條件**（初稿寫成「擴散到那兩處之外」，那個條件在寫下的當天就已經成立，等於恆真，**不可用**，改為下列兩條）：
> **(1)** 出現**不在下列基準集內**的裸 `MM-DD` 日期值——基準為 `09-21`／`09-24`／`09-25`／`09-26`（歷史事實）與 `12-31`／`01-15`（刻意的植入測試值）；
> **(2)** 或**任何一則補述的日期標籤本身**改用裸 `MM-DD` 書寫（現況為 0 則，全部標籤都是完整 ISO 的 `2026-09-24（cycle N）`，已實測）。
> 屆時要嘛把判準擴充到裸 `MM-DD`（需同時處理「哪一年」的歧義），要嘛改用一個不需要省略年份的記法。**在那之前不要把省略年份當成通用寫法。**
> **擴充判準時必須先處理誤判**：裸 `MM-DD` 的型樣會命中行號範圍——本票 `:79` 的 `Navbar.tsx:10-15` 就是一個，它不是日期。
> **(三)（已於 2026-09-24 cycle 12 修好，本條改為歷史記錄，原句保留於下）** 原本的限制是：基準是 commit 的 UTC 日期，而不是規則第 1 條要求的 author date——**那是一個已證實的 fail-open**，cycle 11 記為 F-31。
> **現況**：正本已改用 `git blame --line-porcelain` 的 **`author-tz`** 位移到作者當地時間，與規則第 1 條的 `%ad --date=short` 一致；
> 且**取不到 `author-tz` 時一律判失敗並回離開碼 `3`，不預設 `+0000`**。**所以 (三) 不再是現行限制。**
> **原限制文字保留於此**：
> 正本用 `toISOString()` 取 commit 日期，那是 **UTC**；而規則第 1 條要的是 `%ad --date=short`，即**作者時區**的日期。
> 作者時區落後 UTC 時兩者差一天，**查核會放行一個真的指向未來的日期**。本輪四個 commit 全部落在這個情況內（本地 `09-24` 傍晚、UTC 隔天）。
> **所以在 F-31 修好之前，`violations=0` 的精確讀法是**：沒有任何完整 ISO 日期晚於引入該行 commit 的 **UTC** 日期——**比規則要求的寬最多一天**。
> 證據、A／B 對照與建議修法見 cycle 11 報告的 F-31 一節。**看到 0 筆的人請連這一條一起讀。**
>
> **(二) 不覆蓋 commit message。** 判準經 `git blame` 讀的是**檔案行**，所以 commit 的 subject 與 body 在結構上不可見。
> `ba48f25` 的錯誤日期正是這樣躲過的——它的 subject 含完整 ISO 形式的 `09-26`，而兩檔查核仍為 0 筆，**兩件事同時成立**。
> 該筆已在 cycle 9 的 stage report 記錄更正（不 rebase，理由見該節）。**要查 commit message 的日期，得另外看 `git log`，本查核不做這件事。**

**日期查核的正本**（本票第五個可執行區塊；上方規則只引用，不複述）：

```bash
# canonical: date-check —— 票內每一個完整 ISO 日期都不得晚於引入該行的 commit
node -e "
const cp=require('child_process');let scanned=0,bad=0,notz=0;
for(const f of process.argv.slice(1)){
  const out=cp.execFileSync('git',['blame','--line-porcelain','--',f],{maxBuffer:1<<28}).toString();
  let sha='',t=null,tz=null,n=0;
  for(const ln of out.split('\n')){
    let m;
    if((m=/^([0-9a-f]{40}) /.exec(ln))) sha=m[1].slice(0,7);
    else if((m=/^author-time ([0-9]+)/.exec(ln))) t=+m[1];
    else if((m=/^author-tz ([+-][0-9][0-9][0-9][0-9])/.exec(ln))) tz=m[1];
    else if(ln.startsWith('\t')){
      n++; scanned++;
      if(t===null||tz===null){
        console.log('DATE-FAIL '+f+':'+n+' '+sha+' author-time/author-tz missing -- refusing to guess');
        notz++; t=null; tz=null; continue;
      }
      const sg=(tz[0]==='-')?-1:1, off=sg*(+tz.slice(1,3)*3600 + +tz.slice(3,5)*60);
      const cd=new Date((t+off)*1000).toISOString().slice(0,10);
      for(const d of (ln.match(/20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]/g)||[]))
        if(d>cd){ console.log('DATE-FAIL '+f+':'+n+' '+sha+' commit='+cd+' text='+d); bad++ }
      t=null; tz=null;
    }
  }
}
console.log('date-check scanned='+scanned+' violations='+bad+' no-tz='+notz);
if(!scanned){ console.log('DATE-FAIL scanned=0 -- the check did not actually run'); process.exit(2) }
if(notz){ console.log('DATE-FAIL no-tz='+notz+' -- author timezone unavailable, not assuming UTC'); process.exit(3) }
process.exit(bad?1:0)
" docs/constitution-features/056-pre-launch-checklist.md docs/health-check/TODO.md
```

通過條件：印出 `violations=0`、`no-tz=0`、`scanned` 為**非零**，且離開碼 `0`。
**三個離開碼各有所指**：`1` 有違規、`2` 什麼都沒比對到（`scanned=0`）、`3` 取不到作者時區（`no-tz` 非零）。
**但通過不等於「所有日期都對」——涵蓋面限制見上方「涵蓋面聲明」。**
**`scanned=0` 一律視為失敗並回離開碼 `2`**——理由見下方 cycle 10 的 stage report：這條查核的已知失效模式就是「什麼都沒比對到卻回報 0 筆」。

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
- Cycle 6: REVISE — verify gate（captain 2026-09-24 第二次裁決）；surface 1 檔（本票）；AC unchanged。verify cycle 6 判 PASSED——F-11 涵蓋面由 6/11 提升為 11/11，未過寬（對真實 `src/` 實掃舊新輸出 `diff` 逐位元相同），reviewer 另加九個合法近似字串（`台灣大學法律系`、`前端工程師的工作內容`、`這則判決的5個重點` 等）測試全部 MISS——**過寬的 pattern 會讓 G-5 永遠不通過，那和永遠通過一樣是假檢查**；授權邊界以兩種互相獨立的方式確認嚴守（六個 alternation 摺疊變體括號後化約為逐字相同的字串、新 pattern 在舊 pattern 匹配過的每個字串上都是超集）。F-12 fix（**同型盲區第九處，但形狀不同：不是「只認一種寫法」，而是同一檢查有兩份副本且副本已分岔**——`## Test plan` 的 G-8 仍把 `tsc` 列在 `build` 之前，照它做會直接走進 F-8 記載的假性失敗，該分岔是 cycle 4 只修第三節那一列造成的；Test plan 的 G-5 pattern 只有 5 個變體而第三節有 6，少了 `快速了解最新判決的5個重點`，跑那一份會整個漏掉一個佔位值——又是 fail-open）。**採 reviewer 的建議修根而非補兩處**（原話：「只要兩份副本還在，就會有第三次分岔」）：整份重複的 `bash` 區塊移除、`## Test plan` 改為指向第三節作為唯一正本，保留該節不在第三節的規定（2026-09-21 實測記錄表、`npm run build` 本階段未跑的說明、A 類需實際渲染驗證、`不執行 npm run sync-content`）。**沒有把缺的字串補進副本**——副本整份消失，沒有第二份可以不一致。原導言與五條指令逐字保留於補述，並逐項寫明兩處分岔、各自後果、以及為什麼是讓副本消失而不是把兩份對齊。另寫入一條**可重跑的查核指令**偵測未來的重複清單（掃本票第一個 `## Stage Report:` 之前的活內容、抓 fenced 區塊內的 G 項指令字串依區段分類），並交代該指令自己如何被排除。本票至此已跑七輪，每輪 reviewer 都找到同一類缺陷的新實例；這是第一個針對成因而非症狀的修法。round record 依 captain 先前授權跳過。
- Cycle 7: REJECTED — review（captain 2026-09-24 核准進入 review 後的首輪獨立審查）；surface 2 檔（本票與 `docs/health-check/TODO.md`——implement **主動揭露**此範圍差異：FO 的 dispatch 寫「預期只有本票一檔」，但那筆觀察的授權處置必須改 `TODO.md`）；AC 要求未變。**FO 記一筆自己的誤判**：FO 曾在 verify gate 向 captain 建議核准，理由是「可執行缺陷已全數清除，殘留只剩不可執行的展示形式」——**那是錯的**。前七輪的 verify 查的是票內部一致性；本輪 review 把每一條 G 項指令**從文件抽出後對抗性地執行**，找到三個 fail-open。F-15 fix（**四筆最嚴重**：G-7 是位置無關的，而它保護的性質是位置相關的——第三節自己寫著綁定放在 `robots:` 正上方的理由是「唯一繞不過的位置」，但把註解移到**檔尾**（AC-3 明文禁止的位置）G-7 仍 exit 0、印出三檔命中、回報綁定完好；**觸發情境不假設惡意**——要刪 `robots:` 的人把註解挪開而非刪掉是最自然的操作，而那正是 gate 該叫的瞬間）。修法：G-7 正本標記 `# canonical: G-7`，**同時檢查三檔命中與 AC-3 已有的 `awk` 相鄰性**，表格列改為指向正本。F-16 fix ＋ 那筆觀察（awk 只在 `^### `／`^## ` 更新 `sec`、`####` 不更新，致豁免區實際是 95 行四個子節；把分岔副本放進 `#### 誰、在哪個時點執行` 則 STRAY=0，且 **F-13 的建議處置會因此失效**——`:215` 就在第三節內；**前七輪無人指出**。另 `TODO.md` 有兩份 G-6 可執行副本、形式已與正本不同，而 gate 的指令橫跨三檔、防分岔機制只覆蓋一檔）。修法**比 FO 建議的更好**：豁免改為**只認標記**（`# canonical:` 或 `# divergence-check`），區段性豁免整段移除、`sec` 也在 `####` 更新；`TODO.md` 兩份副本移除並指向正本。F-17 fix（G-6 以 **id** 判定而它保護的性質是**內容**：以另一個 id 重新核可釋字第272號的內容，G-6 仍 exit 0，**而那筆需法學確認的錯誤內容在線上、反向保護說通過**；最諷刺的是**本票 design 第一節自己用的就是內容層斷言**——較強的寫法當時已知已用，gate 卻採了較弱的）。修法：G-6 正本標記 `# canonical: G-6`，**id 層保留並補上內容層斷言**；implement **未把 `TODO.md` P0-2 的宣稱降級**，它補的是較強的判準而非保留弱檢查。F-18 fix（Polish：偵測指令逐字比對旗標順序與單一空白，`grep -rinE`／`grep -nr `／`node  -e` 等變體全部掃不到；**與 F-11 同一形狀，只是換到偵測指令自己身上**）。修法：先正規化空白，再以「指令名 ＋ G 項專屬引數」配對，`grep` 只寫 `grep -` 不指定旗標內容；六種變體全抓到、八條合法指令零誤抓。reviewer 的方法紀律值得記：**每一條指令都從文件抽出後執行而非照著讀**，抽取過程本身抓到它第一版的 bug（`^\| G-[1-8] \|` 掃全檔會命中 stage report 的表格列並覆寫抽出檔，那會讓「G-5 指令」被換成 stage report 的文字而悄悄跑錯）；反向也驗（證明偵測指令會叫、不誤報正本，G-5 的 17 個合法字串全 MISS，F-9 的 `058 RECORDED` 證明不是死指令）——它的原話是「**只驗通過等於沒驗**」。
- Cycle 8: REJECTED — review (cycle 2)（**本行 Cycle 8 對應 stage report 的 implement cycle 9**；兩套編號自始相差 1——Feedback Cycles 記 FO 授權的修正輪、stage report 記 implement 的執行輪，首次 implement 不是修正輪。**請 review 判斷此並存需不需要消歧**：它不是分岔重複副本，但票內日期標籤用的是 stage report 編號，讀者可能混用）；surface 2 檔（本票、`docs/health-check/TODO.md`）；AC 全節仍 **1622B／sha256 `93e5bf6a95f16592`**；`src/` 本輪零變動、`src/data/*.json` 與 main 相同、未跑 `sync-content`；三條正本重跑 `G-6 PASS`／`G-7 PASS`／偵測器 `STRAY 0`・`DUP-MARKER 0`・`AC-OWNED 1`。**F-19／F-20 fix，而 implement 沒有照 FO 的字面做，且它是對的**：FO 授權寫「case-number **欄位** ＋ 容忍既有寫法變體」，implement 指出收窄到 `ruling_id` 會**重開 F-17**（F-17 自己的探測就是把 `272` 放在 `reality.title`），改為 `[釋释]字第[ 　]*[2２][7７][2２][ 　]*[號号]` 掃**所有字串欄位**並回報命中的欄位路徑——**排除圖片網址的是 pattern 的形狀，不是欄位的名字**；FO 當時把這兩件事當成同一件，等於在同一份授權裡一邊要求「兩個方向都要驗」一邊給了只驗一個方向的指示（FO 已認錯，revert 條件留在票內）。五個授權情境外另跑七個；三向對照表以真實輸出重現並完全證實 reviewer：舊寫法放行 `釋字第２７２號` 且誤抓圖片 id，**而直覺的「收窄成 `第272號`」比現行更糟**。**F-22 比 reviewer 報的寬**：同一缺陷在 node 分支也有，十條合法指令誤報的是 **5 條不是 1 條**，兩分支都修、`STRAY` 5→0 而六個注入點的真重複仍報 6。**F-14 強化擴及整個標記類**（`G-N` 與 divergence-check），順帶關掉 F-14 自己開了三個 cycle 的原始探測；另掃出三條未被點名、與 F-11／F-18 同型的拼寫敏感分支（tsc／build／loop），舊偵測器 7 個變體只抓 4 個、新的抓 7 個。**F-21 依授權 decline**，觸發條件、promote-to-material 條件、錨定 metadata 屬性的收斂寫法全部寫進票內。**掃全類掃出一項本輪沒人點名的**：G-3／G-4 的簽核項**有規定記錄位置卻沒有檢查**——F-9 的同一形狀，而 F-9 當初只修了兩個機械項；依 F-9 的模式補上，AC-4 的「六個機械項」計數未變、格式標為 captain 可撤。**日期缺陷（FO 於本輪查出，判為同型第十二處，載體是日期而非指令）**：本票的方法就是「標日期的補述、原句保留」，**日期是它自己審計軌跡的排序機制**，錯了軌跡就無法複查。FO 報 29 筆，**implement 獨立複驗後實際 41 筆**（本票 29 ＋ `TODO.md` 12），全部以 `git blame` 確認歸屬且映射一致（每個 09-25 由 cycle 8 引入、每個 09-26 由 cycle 9 引入，author date 皆 2026-09-24）；成因是**最後四輪同一天、日期被按輪次遞增而不是讀時鐘**。**它沒有整批盲改**：先建立可否證判準（任一行提到的日期不得晚於引入該行的 commit author date；反向早於是合法歷史引用，不報），`git blame --line-porcelain` 逐行比對，修正前 41 筆、修正後 0 筆，**並植入一個遠未來日期證明判準會叫、不是死指令**；替換腳本逐條斷言預期筆數、不符即中止；**日期輪 diff 為本票 28／28、`TODO.md` 10／10——增刪行數相等，代表全是原地換字、未夾帶任何實質改動**。逐字引述同步已實測（本票引述 `TODO.md` 的那句以程式斷言逐字出現於 `TODO.md` → true），標籤空白一併正規化 26 處。**implement 記下一筆自己的 fail-open，比修好的那 41 筆更值得留**：第一版查核用 `awk` 呼叫 `strftime`，**BSD awk 沒有這個函式**——錯誤印到 stderr，然後回報 `TOTAL forward-pointing refs = 0`，**「0 筆」看起來就是「乾淨」**；若它只看最後一行，就會回報「日期沒問題」並把 FO 正確的發現駁回。**與 G-8 的 `tsc` 假性失敗剛好相反：那個是假失敗，這個是假通過，而假通過危險得多。**兩項刻意決定經 FO 確認：(a) 提到那兩個錯誤日期時一律省略年份，**因為寫全了會被自己的查核判為指向未來，而為此加豁免標記就是重犯 F-14**（本票已學過「標記會被複製、豁免會擴大」）；(b) 日期規則刻意不寫成 fenced 區塊，活的部分只該有四個可執行區塊。**一處殘留經 FO 確認不修**：commit `ba48f25` 的 subject 寫「FO `09-26` 授權」，真實為 2026-09-24——改它要 rebase、會換掉該 SHA，而票內多處以該 SHA 引用它、下游三個 commit 也會一起變，**為修一行訊息讓票內所有 SHA 引用失效，代價大於缺陷**；依「`record` 不改寫、要修正就追加補述」已在票內記錄更正。`TODO.md` 247／362 兩處（仍描述已不存在的裸子字串形狀）經 FO 授權後修，各追加一則標日期補述、原句一字未改（`10 0`），並以偵測器單掃確認兩檔的可執行 G-6 副本仍皆為 0 筆。FO 另明確答覆：那句已作廢的宣稱**不直接改字**——本票分層為「活的說明必須準確、歷史記錄必須完整」，改寫逐字引述會讓「原句保留於下」的慣例失效，而那慣例是本票九輪還能被複查的原因。AC-2 維持未達成（依賴尚未核准動工的 feature `039`）；`PresentDetail.tsx` 零改動（C1 的真實信箱覆寫點仍待 captain 回答）。
- Cycle 9: REVISE — review gate（captain 2026-09-24 親自裁決，**退回的唯一理由是 F-27**：全票唯一一條已被證實會靜默回報 0 的查核，也是唯一沒有存成可執行形式的那一條；而排除它的理由已被 implement 自己上一輪新增的 `DUP-MARKER` 唯一性計數解掉）；AC 全節仍 **1622B／sha256 `93e5bf6a95f16592`**；`src/` 僅 `layout.tsx` +1（已授權的 gate 綁定註解，緊貼 `robots:` 上方）；`PresentDetail.tsx` 零改動；`src/data/*.json` 與 main 相同、未跑 `sync-content`；AC-2 維持未達成。**F-27 fix，選「存成第五個正本區塊」**（`# canonical: date-check`，由 `DUP-MARKER` 保護唯一性）。理由 implement 寫得比 FO 的授權更準：**失效模式是「一個什麼都沒比就印出成功樣貌摘要的檢查」，所以 `scanned=0` → exit 2 把「它到底有沒有真的跑」變成檢查自己的輸出，而不是一條要人記得的規則。****而那個區塊落地後的第一個獵物是作者自己的缺陷**：implement 在寫涵蓋面聲明時寫了一個完整 ISO 的日期當舉例，**新區塊立刻報出來（violations 0→1，附檔名與行號）**；散文版不會抓到它，它需要下一個人手寫腳本、掃到那一行、還記得檢查 stderr。**F-26 的授權措辭是 FO 寫錯的，implement 的偏離正確**：FO 寫「裸 MM-DD 屬刻意例外，僅限本則」與對應 promote 條件，**而 FO 是從 reviewer 的「今日 2 處」照抄、未自行清點**；實際 52 次橫跨 32 行（活的部分 16／8，含 FO 自己寫的 Cycle 8 行），故「僅限本則」不成立、該 promote 條件**在寫下當天即已被滿足**（恆真）。implement 保留兩項實質要求，改成**按日期值而非按位置**界定例外，並換成兩條目前為假且機械可查的條件。**FO 已更正歸屬：那段字面措辭是 FO 的，不是 captain 的裁決。****一條四環的傳遞鏈因此被記錄下來**：reviewer 寫「2 處」→ FO 照抄進授權書 → 草稿照抄進文件 → implement 重數發現幾十處。**四個環，沒有人數過，而每一環讀起來都完全合理。**F-25 fix（「增刪行數相等代表全是原地換字」不成立——`--numstat` 對本票是 80／28，同 commit 另新增日期規則約 52 行；**結論是真的但引用的證據不能支撐它**，改為引用逐行配對結果）；F-28 fix（補涵蓋面聲明：判準經 `git blame` 讀檔案行，**commit message 結構上不可見**，`ba48f25` 正是這樣躲過的）；兩套 cycle 編號依 reviewer 建議在日期規則加子句指明用 stage report 編號。**本輪另一項 FO 的錯已記錄**：FO 在 session 上限中斷後的交接說明寫「先前的 worker 沒做任何工作、只有一行 frontmatter」，**實際是 192 行新增的完整草稿**——FO 看了 `git status` 的檔案數就假定內容，**沒有看 diff**；而同一時間 FO 對 `012` 看了 diff 因此正確保住那裡的 113 行。**implement 依檔案狀態而非交接敘述行事並揭露落差，處理正確。** 它另逐條重跑草稿的「實測」，**四個數字沒有重現、全部更正並保留原值**，而它歸納的那一點比四個更正重要：**四個數字全部偏向「看起來更乾淨」，沒有一個偏向比較難辯護的方向**——而偏誤方向可以被下一個人檢查，個別數字不能。
- Cycle 10: PASSED-with-finding — FO 授權 F-29 fix；AC 全節仍 1622B／同 sha256；`src/` 零變動。**F-29：偵測器對自己的正本盲目。** `node` 分支以四個字面值把關（`h2`／`h28`／`272`／`釋字`），而 **G-6 正本把票號寫成字元類**（`[釋释]字第`、`[2２][7７][2２]`）；只取內容層 RE 而丟掉 id 層的副本**四個字面值一個都不含**，實測 `STRAY = 0` 漏掉。**正本本身之所以沒漏，只是因為它剛好帶著 id 層的 `'h2'`。** 這是 F-11／F-18／F-22 的同一形狀第四次出現。修法為把 `字第` 加進 alternation，四個方向全驗（漏掉的副本 0→1、六個真副本仍 6、七個拼寫變體仍 7、十條合法指令仍 0、真實候選不變）。**implement 第一版修法是錯的，而它靠跑它而非讀它發現**：`/[釋释]字/` 要求兩字相鄰，而目標文字裡它們被 `]` 隔開，所以什麼都沒抓到。**這一句是本票十二輪來最該被後人看到的方法論。****另兩筆它自己抓到、未被指派的**：(a) **同一個錯數字第三次出現，載體是它自己的搜尋方法**——它改了配對表與 Summary 卻漏掉 F-25 小節那句，**因為它搜的是字面 `28／28` 而那句寫的是「28 對全部只差日期標籤」**；它的結論逐字記入：**「更正一個數字時，要搜它支撐的那個宣稱，而不是它的某一種寫法。」**(b) **F-30（reviewer 的記錄裡有一個錯數字，而 F-25 依賴它）**：reviewer 寫「`--unified=0` 下 66／28」，實際 `--numstat` 不受 `--unified=0` 影響（仍 80／28），66 來自 `grep -c '^+[^+]'` 而它**靜默丟掉 14 行空白新增行**，`66 + 14 = 80`。**一項結構改動**：票內全域裸 MM-DD 總數原本寫在八處，而那個數字**在同一輪內從 52 → 53 → 60 移動，純粹因為書寫它**；已收斂為一個權威處加重算指令，其餘改為定性並指回。**活的部分 16／8 全程未動——那正是重點。**
- Cycle 11: PASSED — FO 授權 **F-31 fix（Material）** 與 F-30 追加補述。AC 全節仍 **1622B／sha256 `93e5bf6a95f16592`**；`src/` 零變動；`PresentDetail.tsx` 零改動；`src/data/*.json` 與 main 相同、未跑 `sync-content`；AC-2 維持未達成；五個正本區塊逐一分別量測 exit 0 且 stderr 各 0 位元組。**F-31：上一輪剛存成正本區塊的那個日期檢查，自己帶著一個 fail-open——而且已經漏掉一個真實違規。** 它比對的是 **commit 的 UTC 日期**，而規則第 1 條要求 **author date（作者時區）**；本機 UTC−7 而本 branch 的 commit 全是當地傍晚，**UTC 日期已是隔天**。A/B 對照（同文字、同當地 author date、只差時鐘）：`17:39 −0700` → `violations=0` exit 0 **漏掉**；`09:00 −0700` → `violations=1` exit 1 抓到。**`scanned` 非零、stderr 空、exit 0——三道護欄全過而基準點差一天。****它的發現方式是兩個方法打對台**：`grep -c` 回 1 而同一次掃描的 date-check 印 `violations=0`，**兩者不可能同時為真**；它沒有相信任何一邊，去找哪一邊壞了。**它也沒有用 `violations=0` 當自己那一輪的通過證據**，改用不依賴 commit 日期的方法複驗；並**把自己那行違規改寫成裸寫法**，理由是不留下一組會在 F-31 修好那一刻引爆的行。**修法以 `--line-porcelain` 的 `author-tz` 位移到作者當地日；FO 的硬條件已實作**：`author-tz` 或 `author-time` 缺漏時 **exit 3**，絕不預設 `+0000`。三個離開碼各指一種失敗（1 有違規、2 什麼都沒比、3 基準不可信），摘要行新增 `no-tz=<count>`。implement 把理由寫進票內，而它講得比授權更清楚：**預設 `+0000` 等於「基準不可得時就用 UTC 當基準」，那就是 F-31 本身；一個會退回到自己所移除行為的修法什麼都沒移除，只是縮小了觸發面，而縮小的觸發面更糟——每天下午都會中的版本至少會被抓到。****七個方向全跑，其中兩個不在它自己的提案裡，而那兩個證明這個缺陷是雙向的**：測 `+0800`（作者時區早於 UTC）發現另一面——**舊判準會把一個完全合法的當日日期標籤報成違規**。**這一面單獨成立**，因為 F-22 的教訓是**一個會亂叫的檢查會被習慣性忽略，而那個習慣會把 fail-open 那一面一起帶過去**。**FO 要求五個方向，它跑了七個，多出的兩個更正了它自己對缺陷的描述**——同樣是靠跑它而非想它。**修好之後幾分鐘內它又抓到作者一次**：寫七向對照表時從測試輸出複製了一個完整 ISO 的 commit 日期，修好的區塊立刻報出（`commit=2026-09-24`，修後基準）；**修好之前那一行不會被報，因為舊基準是隔天**。**它沒有把這當巧合**：本機上每一行在午後寫下的文字都落在那一天的間隙裡，而票內在 cycle 10 與 11 之間**真的掉了一行**——**一個「罕見」的 fail-open 在兩輪內中了兩次。****F-27 與 F-31 的區分已獨立成節並附對照表**：F-27 擋「什麼都沒比」，F-31 擋「比了很多但比錯基準」，**而票內原本只記錄了第一種、卻把它當成 F-27 的全部價值**。前瞻版本亦寫入：**一個檢查的自我保護必須分別回答兩個問題——它到底有沒有真的比，以及它的基準可不可信；只回答第一個的檢查會在第二個上靜默通過。****F-30 以追加補述處理，reviewer 原文一字未改**（整節抽出與前一 commit 比對：19 行新增、零刪除零修改），並附三條可重跑指令。**兩條箴言已獨立成節並逐字採用**，而 implement 預先回答了一個 reviewer 合理會提的反對：箴言本身在票內出現三四次，**而它說明了為什麼那不違反箴言二——真正的分界是「一份副本能不能自己漂走」**。量測會漂，固定的箴言與逐字引述的原文不會。**故三種處置：會動的量測給一個權威值加重算指令；固定箴言與引述原文可重複但必須逐字；會分岔的可執行指令給一份正本並由 `DUP-MARKER` 守著。**全域裸 MM-DD 總數兩輪內 **52 → 53 → 60 → 66 → 67**，**最後一步就是記錄這個現象的那一行**，而活的部分全程 16／8。
- Cycle 12: REJECTED — review (cycle 4)（阻擋項只有 **F-32**，而它是 FO 問的第三個問題的答案）；AC 全節仍 **1622B／sha256 `93e5bf6a95f16592`**；`src/` 本輪零變動；`PresentDetail.tsx` 零改動；`src/data/*.json` 與 main 相同、未跑 `sync-content`；AC-2 維持未達成；五個正本區塊逐一分別量測 exit 0 且 stderr 各 0 位元組。**F-32（Material）：G-7 的滿足者是 1／9／1，而兩條觸發路徑可以無聲消失。** reviewer 實測——刪掉 `TODO.md` 那條**本票自己指定為「處 2」**的 P3-8 解除條件、其餘 8 筆保留 → `G-7 PASS`；把 `AGENTS.md` 的綁定從 noindex 段移到檔尾註解 → `G-7 PASS`；**而 gate 回報三處都在。這正是本票反覆寫的「一道不會被觸發的 gate 等於沒有」。**修法讓 G-7 對三處**各自**斷言身分與唯一性（處 1 相鄰且恰一行、處 2 在 `### P3-8` 內且恰一條解除條件、處 3 在 `noindex` 段內且恰一行），印 `place1=1/1 place2=1 place3=1`；九個情境逐一分別量測 exit code 與 stderr，含**錨點標題被改名 → 轉紅而非靜默通過**、`AGENTS.md` 整檔不存在 → 轉紅且 stderr 非空、別處多一筆無害提及 → 維持綠。**未動任何 AC 文字，而 implement 自行複驗了 reviewer 的範圍界定而非採信**：AC-3 的要求只說三檔各至少一筆，**G-7 一直忠於那個字面**，缺口在綁定表從未寫下各處的身分、而 G-7 的自述繼承了那個缺口。**修法裡有一個細節承重，而 implement 差一個按鍵就把同一個 bug 寫進同一張票的第二條判準**：兩個區段測試都用 `/^#+ /{sec=$0}`（**任何**標題層級都更新 `sec`）；它以只認 `/^### /` 的版本重跑，洩漏情境**由 FAIL 翻成 PASS**——因為 `AGENTS.md` 的 noindex 段後面接的是 `##` 標題，`sec` 永遠不會清掉、檔案其餘部分仍被算成「在 noindex 段內」。**那正是本票 cycle 8 記錄過的 F-16。抓到它的是「寫一個設計成會失敗的探測」。****Q3 已命名並與 Q1／Q2 並列**（附表、各自的機械答案、以及「三者不能互相替代」這個可否證宣稱——**F-32 就是那個可示範的反例**：修前的 G-7 確實比了 9 筆命中（Q1 沒問題）、基準忠於 AC-3 的字面（Q2 沒問題），**而它在量 8 個健康的旁觀者**）。**最該留的那一段已獨立成段**：本票原本就有 Q3 的機制而沒有它的名字——`DUP-MARKER` 就是「唯一性要計數」、F-21 的收斂寫法明寫「斷言恰好一行」——**而因為它從未被升成一般性的問題，它被用在偵測器上，卻沒有用在同一個 G-7 的另外兩個檔案上。G-7 就是那個代價。一個只在某一條具體判準裡被理解的原則，不會自己擴散到下一條。****姊妹票 `012` 同日獨立到達同一個 Q3，已作為互為佐證寫入三載體表**：012 的肯定式吃「多重滿足者」、它的否定式吃「多重施用者」（**豁免按字串值發而非按產生者發**，實測 28 條全綠）、而 **G-7 是第三種載體——滿足者散在三個檔，而檢查只數了檔數**。**一個缺陷、三種載體：檢查確認了「有人」滿足那個性質，從來沒有確認「該負責的那個對象」滿足它。****F-33 fix（Deferred risk）以「先正規化再比對」修根，而不是再加一個字面值**——implement 的理由：**加字面值只是再指名一種寫法，而問題在於那條判準根本綁在寫法上**。去掉 `[`、`]`、`\` 並轉小寫後比對一組語意錨點；**「不靠單一字面值承重」這個性質是驗出來的不是宣稱的**：字元類改寫由 `字第` 抓到、escape 改寫由 `u5b57`／`u91cb`／`u7b2c` 抓到——**不同的錨點，所以移除任何一個都不會讓整組崩掉**。F-29 的五個結果不變（1／6／7／0／0）。**reviewer 自記的那句已逐字寫入，而 implement 同一輪就用上了它**：比對新舊偵測器輸出前先斷言兩個腳本**並非位元組相同**。它並指出為什麼那件事重要——它的三個 `assert count==1` 保護的是「替換到底有沒有發生」，**它們保護不了「這兩個東西現在是不是真的兩個東西」，那需要 `cmp`**。**兩道保護各守一件事；少掉任何一道，一個同一性就會被讀成一次驗證。****implement 另記自己兩個錯誤**：(a) 情境 F 它一開始讀成漏掉，實為它的 fixture 把那一行插在下一個標題**之前**、仍在同一段內，所以 PASS 才是正解——**本票第三次遇到「先懷疑探測本身」這個教訓**；(b) 它以**固定行號範圍**量 AC 區段得 1509B、一度以為自己越界，**而那是它的量測過期了**（本輪的插入位移了行號），改以標題定位得 1622B——**那正是箴言一的形狀：它搜了一種寫法，而不是那個寫法支撐的宣稱。**
- Cycle 13: PASSED — review (cycle 5，最終輪)。reviewer 按硬性收斂判準的三類逐一找過：**沒有 fail-open、沒有 Material 缺陷、沒有會讓 gate 執行者照著做而失敗的東西**。AC 全節 **1622B／sha256 `93e5bf6a95f16592`**（以標題定位而非固定行號）；`src/` 零變動；`PresentDetail.tsx` 零改動；資料與 main 相同；**AC-2 維持未達成**；五個活區塊逐一量測全為 exit 0／stderr 0B。**F-32 九個情境全部正確**：兩條消失路徑各自轉紅並指名處別與計數；處 2／處 3 被複製時 `count=2` 轉紅（唯一性兩個方向都守）；錨點標題改名時轉紅而非靜默通過；**別處的無害提及維持綠——reviewer 特別指出這一格和前面一樣重要，否則它就是一條永遠不通過的假檢查。****`/^#+ /` 對照成立，而結構比敘述更清楚**：`AGENTS.md` 的 noindex 錨點是 `###`、後面接 `##`，所以只認 `/^### /` 時 `sec` 永不清除、**noindex 段的範圍延伸過自己的結尾**；把綁定移進那個空隙，出貨版 `FAIL [count=0]`、變體 **`PASS`**。**那是 F-16 在同一張票裡的第二次現身：同一個機制、同一個方向、差一個按鍵。而攔住它的是一個設計成會失敗的探測，不是複核。****本輪最該留下的方法論**：**區段範圍的檢查要用「把目標放到區段外緣」來驗，不能用「放在區段內會通過」來驗。****F-33 的「不靠單一字面值承重」是真的驗出來的**：八個錨點逐一移除，**移除任一個最多只有一種寫法落空、其餘至少三種仍被抓到**，escape 形式另有三重冗餘；**修根與加字面值的差別在那張矩陣裡直接看得見**。正規化**沒有**引入新的過寬——合法集合擴到 16 條（含 6 條專打括號移除）誤抓 0。**Q3 的可否證宣稱通過了自己的否證測試**：對重建的修法前 G-7，**Q1 的守衛（比較次數 1／8／1 全非零）與 Q2 的守衛（基準就是 AC-3 原文、無推導）都不響**，而它回 `G-7 PASS`——**F-32 確實同時滿足 Q1 與 Q2 而只違反 Q3，是一個可重跑的真實反例**。AC 確實不需要動：G-7 一直忠於「三檔各至少一筆」的字面，新增的是 gate 項的收緊。**第四種載體：沒有。** 收束句管的是「被指定的對象 vs 旁觀者」這一個軸，三種載體都是同一個 range 在產生點／施用者／位置上；reviewer 試的兩個候選都歸到別處（多重檢查屬 Q1；跨檔滿足只是同一載體放大容器）。**但它留下兩個兄弟軸，理由是「把它們混進同一句話，下一輪就會有人以為問過了」**：**代理軸**（確認了記錄，沒確認記錄描述的東西——本票不是缺口，AC-1 已要求代理之外另有證據）與**時刻軸**（確認了曾經滿足，沒確認現在滿足——本票不是缺口，所有檢查執行當下讀活狀態，唯一的陳舊風險已寫成 G-8 的順序要求且 fail-closed）。**`count==1` 與 `cmp` 的區分它判定正確並造了兩個互不包含的反證**（把字串替換成它自己／替換沒命中但有無關位元組不同），並評價**那個區分比它自己原本那句話更有用，因為它指出哪一道守哪一種失敗**；本輪它做對照前就照它走了兩道。reviewer 自己 cycle-4 的報告文字零改動（唯一差異是邊界一個空行、1 位元組）。

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

## Stage Report: verify (cycle 6)

- DONE: 獨立重驗 F-11 的**兩個方向**，用從文件抽出的指令：(a) 十一個字串新 pattern 全部抓得到；(b) 確認不會誤抓——對 `src/` 實掃結果應與舊 pattern 完全相同，三個既有佔位值仍抓得到。
  兩個方向都驗，且 (b) 我另加了九個合法近似字串的過寬測試。(a) 舊 `6 HIT／5 MISS`、新 `11/11 HIT`；(b) 對 `src/` 實掃 `diff` **完全相同**（同三筆），九個合法字串**全部 MISS**。
- DONE: 判定 implement 是否嚴守授權邊界——自行比對舊新兩個 pattern 的**字串集合**，並確認「其他 G 項涵蓋面一項未改」屬實。
  **嚴守。** 字串集合經兩種方法確認未變：六個交替項一一對應、去除變體括號後**逐項字面相同**；且新 pattern 對舊 pattern 的所有命中皆為超集。其他七列 G 項整列位元組比對**全部 `IDENTICAL=True`**。
- DONE: 確認未越界也未回歸……最後給出 PASSED 或 REJECTED。
  八項比對全 `True`，`git diff` 只有本票一檔，AC-3 與相鄰性無回歸。判定 **PASSED**。並依指示提報第九處：**F-12**，見下。

### F-11 重驗：兩個方向

**(a) 涵蓋面——十一個字串逐行實跑**（pattern 由文件抽出，非手寫）：

| 字串 | 舊 | 新 | | 字串 | 舊 | 新 |
|---|---|---|---|---|---|---|
| `前端工程師 A` | HIT | HIT | | `某大学法律系` | MISS | **HIT** |
| `前端工程師A` | MISS | **HIT** | | `快速了解最新判決的5個重點` | HIT | HIT |
| `前端工程師　B`（全形空格） | MISS | **HIT** | | `快速了解最新判決的５個重點` | MISS | **HIT** |
| `某學者` | HIT | HIT | | `volunteer@addcourt.tw` | HIT | HIT |
| `某学者` | MISS | **HIT** | | `Volunteer@AddCourt.TW` | HIT | HIT |
| `某大學法律系` | HIT | HIT | | **合計** | **6／11** | **11／11** |

**(b) 不過寬——這一半和 (a) 一樣必須驗。** 對 `src/` 實掃，兩條指令各自抽出執行：

```
OLD  exit=0  lines=3  stderr=0B      NEW  exit=0  lines=3  stderr=0B
diff out-old.txt out-new.txt  ->  無輸出，exit=0（完全相同）
命中三筆：PresentDetail.tsx:32 / contributors.ts:16 / contributors.ts:21
```

三個既有佔位值全部仍抓得到，且**未多抓任何一行**。我另外用九個合法的近似字串測過寬：`某些學者認為這個判決有爭議`、`台灣大學法律系`、`國立政治大學`、`前端工程師的工作內容`、`這則判決的5個重點`、`資深前端工程師招募中`、`學者專家`、`大學生`、`最新判決的重點整理` —— **九個全部 MISS**。`台灣大學法律系` 不命中是對的：pattern 是 `某大[學学]`，需要「某」字。**過寬會讓 G-5 永遠不通過，與永遠通過一樣是假檢查**，所以這一半不能省。

### 授權邊界：字串集合確實沒動

授權只及於**涵蓋面**，新增要掃的字串就是改 G-5 的**要求**。我用兩種方法各驗一次：

| 方法 | 結果 |
|---|---|
| 交替項計數 | 舊 6、新 6 |
| 逐項「去除變體括號後是否字面相同」 | 六項**全部 `True`**：`某[學学]者`→`某學者`、`某大[學学]`→`某大學`、`lorem ipsum` 未動、`前端工程師[ 　]?[ABＡＢ]`→`前端工程師 A`、`volunteer@addcourt\.tw` 未動、`快速了解最新判[決决]的[5５][個个]重[點点]`→`快速了解最新判決的5個重點` |
| 超集檢驗 | 舊 pattern 命中的八個字串，新 pattern **全部**仍命中 |

**沒有新增、沒有刪除、沒有替換任何一個要掃的字串**，只有每個既有字串多認了寫法變體。`lorem ipsum` 與 `volunteer@addcourt.tw` 靠 `-i` 已涵蓋大小寫，未動——這一點也對。

**「其他 G 項涵蓋面一項未改」屬實**：`G-1`／`G-2`／`G-3`／`G-4`／`G-6`／`G-7`／`G-8` 七列整列位元組比對皆 `IDENTICAL=True`，只有 `G-5` 那一列變動。

### 未越界、未回歸

| 檢查 | 結果 |
|---|---|
| G-1／G-2 指令主體 | `257B`／`241B`，皆 `True` |
| F-6 兩段通過條件 | 皆仍在 G-1 格內 |
| F-7 記錄位置子句、固定格式 | 皆 `True`、未變 |
| F-9 的 `awk` 限縮指令 | `282B` vs `282B`，`True` |
| AC 全節 | `1622B` vs `1622B`，`True`（cycle 1–6 六輪同值） |
| `git diff` 範圍 | 只有本票一檔；`src/`／`next.config.ts`／`package.json` 皆空 |
| AC-3／G-7、相鄰性、G-6、F-9 查核、`src/data` | `1／5／1`；`binding at line 8; next line 9 = robots:`；`false false`；八張 `NO-RECORD`；與 `main` 位元組相同 |

### 第九處：F-12

依本輪指示提報。`063` 的 reviewer 把根因講成「**不是沒想到兩種寫法，而是規格自身不一致**」——本票的第九處正是這個根因的另一種面貌：**同一道檢查有兩份拷貝，改了一份沒改另一份。**

**F-12 — `## Test plan` 的指令區塊是第三節 gate 指令的第二份拷貝，兩者已在兩處分歧。**

- 已釋出使用者與正常流程：gate 執行者。`## Test plan` 開頭自述「下列為 gate 執行時要跑的完整指令，也是 implement／verify 的驗收依據」——它**被明示為可照跑的清單**，不是附註。
- 可觀察損害，兩處：
  1. **G-8 的執行順序（fail-closed，但直接抵銷 F-8 的修法）**。第三節 G-8 已於 2026-09-23 改為「先 `npm run build`……再 `npx tsc --noEmit`」；**Test plan 區塊仍是舊順序**——第一行 `npx tsc --noEmit`、第二行 `npm run build`。照 Test plan 跑，就是踩進 F-8 記錄的那個假失敗（我在 cycle 3 親自踩過一次）。F-8 補述存在的理由就是防這件事，而另一份拷貝仍在教人用會出事的順序。
  2. **G-5 的字串集合（fail-open）**。Test plan 的 G-5 pattern 只有 **5** 個交替項，第三節有 **6**：少的是 `快速了解最新判[決决]的[5５][個个]重[點点]`（實測：第三節有、Test plan 沒有；反向無差異）。**照 Test plan 跑會漏掉這一個佔位字串**，而 G-5 以零命中為通過——方向是 fail-open，與 F-11 同型。本輪的變體涵蓋**已同步套用**到 Test plan 那一行（`某[學学]者` 在內），所以分歧只剩字串數這一項。
- 受影響的 AC 或邊界：無 AC 直接失敗（AC-4 驗的是第三節那六個機械項）。受影響的是 gate 的可執行性與 G-5 的防護力。
- 觸發證據：如上，皆為本階段實跑比對。`AC-3`／`G-7` 的三份拷貝（`:156`、`:262`、`:277`）則**逐字相同**，無分歧；G-6 兩處形式不同（離開碼型 vs 印出型）是刻意且都有記載，不算分歧。
- 建議：materiality = **Deferred risk**（gate 尚未執行過），惟第 2 項方向為 fail-open，優先於第 1 項。task ownership = 本票自有範圍。disposition 建議 = **fix**，且建議治根不治標：**讓 `## Test plan` 不再重抄指令，改為指向第三節的 gate 執行清單**（或反之，指定唯一一份為準）。只把兩處補齊是治標——只要兩份拷貝還在，第三次分歧就會再來。
- **非本輪引入，且 implement 的處置正確**：G-5 的字串數分歧早於本輪，implement 已主動揭露並**刻意不補**——補上會改變該指令要求什麼，超出 captain「不改 AC 要求本身」的授權。這是正確的克制，我認同。G-8 的順序分歧則是 cycle 4 修 F-8 時只改了第三節那一列所留下的，**本輪未被要求檢查，也未被揭露**，由我本輪查出。

### 驗證與可否證性

- 「字串集合未變」以**兩種獨立方法**斷言，不是讀 pattern 推論：去括號後逐項字面比對（六項全 `True`），以及舊 pattern 全部命中在新 pattern 下仍命中（超集）。若 implement 偷加了一個要掃的字串，交替項會變七項、且該項無對應的舊項。
- 「不過寬」是本輪我加的一半：九個合法近似字串全部 `MISS`。若 pattern 寫成 `大[學学]` 而漏掉「某」，`台灣大學法律系` 就會命中，G-5 將永遠不通過——這個檢驗會抓到它。
- `diff out-old.txt out-new.txt` 無輸出是最強的一筆：對真實 `src/`，新舊 pattern 的**輸出位元組完全相同**。
- F-12 第 1 項可被單一比對推翻：若 Test plan 第一行是 `npm run build`，該項即不成立；實測第一行為 `npx tsc --noEmit`。
- F-12 第 2 項可被單一計數推翻：若兩份 pattern 的交替項皆為 6，該項即不成立；實測為 5 與 6。

### Summary

F-11 修好，兩個方向都驗過。涵蓋面：十一個字串從舊 pattern 的 `6/11` 提升到新 pattern 的 `11/11`，`前端工程師A`（無空格）、全形空格、簡體 `某学者`／`某大学`、全形數字 `５個重點` 現在都抓得到。不過寬：對真實 `src/` 實掃，新舊輸出 `diff` **完全相同**——同樣三筆，三個既有佔位值仍抓得到，一行都沒多抓；我另加的九個合法近似字串**全部 MISS**。

**授權邊界嚴守。** 字串集合以兩種方法確認未動：六個交替項去除變體括號後逐項字面相同，且新 pattern 是舊 pattern 的超集。沒有新增任何要掃的字串——動的只有「每個既有字串認得幾種寫法」。其他七列 G 項整列位元組未變。未越界、未回歸，AC 全節六輪位元組不變。

**依指示提報第九處：F-12。** 根因與 `063` reviewer 指出的一致——**規格自身不一致**，只是本票的面貌是「同一道檢查有兩份拷貝」：`## Test plan` 的指令區塊與第三節已在兩處分歧。G-8 仍是舊的執行順序（`tsc` 在 `build` 之前），照它跑就會踩進 F-8 記錄的假失敗；G-5 的 pattern 少一個字串（5 vs 6），照它跑會漏掉 `快速了解最新判決的5個重點`，**方向是 fail-open**。G-5 的分歧早於本輪且 implement 已主動揭露並刻意不補（補上會改變要求，超出授權，我認同這個克制）；G-8 的分歧則是 cycle 4 修 F-8 時只改了一份拷貝留下的，本輪由我查出。**建議治根**：讓 Test plan 指向第三節而不是重抄——兩份拷貝還在，就還會有第三次分歧。

## Stage Report: implement (cycle 7)

本輪即 captain 2026-09-24 第二次退回後授權的那一輪。只處理 F-12，修的是根不是兩處分岔，全部改動在 commit `c97e749`。未動 `src/`、build 產物、`layout.tsx`、Next.js 設定、`PresentDetail.tsx`，未跑 `sync-content`。

- DONE: F-12：讓 `## Test plan` 指向第三節而不再複述指令清單，消除「同一檢查兩份副本」這個分岔源頭。保留 Test plan 中**不在第三節**的規定（如「不執行 `npm run sync-content`」），只把重複的指令清單換成引用。**不得把 Test plan 副本缺的那個字串補進去**——正確作法是讓副本消失，不是讓兩份副本一致。
  `## Test plan` 的導言改為「以第三節那一份為唯一正本，本節不再複述」，整個 `bash` 區塊移除。保留的非重複內容：2026-09-21 實測記錄表、`npm run build` 本階段未跑的說明、A 類需實際渲染驗證、**`不執行 npm run sync-content`**（程式比對確認仍在）。**沒有把缺的字串補進去**——副本整份消失了，沒有第二份可以不一致。
- DONE: 原本 Test plan 的指令內容以追加補述**逐字保留**，並寫明它們曾與第三節分岔於哪兩處（G-8 的 `tsc`／`build` 順序、G-5 少一個變體）以及各自的後果（前者走進 F-8 的假性失敗、後者整個漏掉一個佔位值）。這段記錄說明為什麼不再保留第二份副本。
  補述逐字保留原導言句與五條指令（含各自的 `#` 註記），並逐項寫明兩處分岔與後果，以及「為什麼是讓副本消失而不是把兩份對齊」。
- DONE: 給出一個**可重跑的檢查**證明本票內不再存在第二份可執行的 G 項指令清單（例如確認第三節之外沒有其他區段含有 G 項的指令字串），並貼出輸出。並確認未越界未回歸：G-1／G-2 指令主體、F-6 通過條件、F-7 記錄格式、F-9 的 `awk` 限縮、F-11 的 pattern、AC 全節皆逐字未變；`git diff` 只有本票一個檔案。
  查核指令寫入 `## Test plan`，雙向驗過，輸出見下節。十項比對全部 `True`，`git diff` 只有本票一檔。

### 查核指令：怎麼判、以及它自己怎麼被排除

指令掃本票的「活的」部分（第一個 `## Stage Report:` 之前），抓 fenced 區塊內的 G 項指令字串，依區段分類：

| 分類 | 意義 |
|---|---|
| 落在 `### 三、` | 正本，不報 |
| `AC-OWNED` | `## Acceptance criteria` 內那一筆。AC 文字非本票可改，它與 G-7 重疊是**已知例外**，**印出來而不是靜默略過** |
| `STRAY` | 其餘任何一筆，即第二份可執行副本 |

**通過條件：`STRAY` 零筆。**

查核指令自己也在 fenced 區塊裡，會抓到自己。處理方式是首行標記 `# divergence-check (self)`，awk 見到該標記就跳過**那一個區塊**——**只排除帶標記的區塊，任何新放進來的區塊都沒有標記，照樣被抓**。這一點下面驗過。

### 雙向驗證

**方向 (a)：修法前後。** 修法前 `STRAY` **五筆**，全在 `## Test plan`（`npx tsc --noEmit`、`npm run build`、AC-3 的 `grep`、G-5 的 `grep`、G-6 的 `node`）。修法後 `STRAY` **零筆**，`AC-OWNED` 一筆不變。指令**從文件內抽出成獨立腳本執行**（444 字元），離開碼 `0`，無 `illegal byte sequence`。

**方向 (b)：這條檢查不是空的。** 只驗 (a) 會放過一個永遠印零筆的假檢查——例如把 self 標記寫成「跳過所有區塊」。所以在副本的 `## Documentation impact` 段植入**第三份**可執行副本（`npx tsc --noEmit` ＋ 一條 `node -e`），用**同一條抽出的指令**跑：印出 `STRAY[## Documentation impact]` **兩筆**，位置正確。

**沒有 (b)，這一輪的交付就只是一句宣稱。** 這與 F-9 的第三列、F-11 的九個合法近似字串是同一個道理：證明檢查會通過，不等於證明檢查會失敗。

### 這一處和前八處不同在哪

前八處都是**檢查只認一種寫法**——`archived` 不存在、出口無法稽核、grep 掃錯範圍、pattern 少認變體。F-12 不是，它是**同一個檢查有兩份副本，而副本已經分岔**，而且分岔是漸進的：cycle 4 只改了第三節的 G-8 順序，Test plan 那份沒跟上；cycle 6 只加寬了第三節的 G-5，Test plan 那份少一個字串。**兩次分岔都是我造成的，兩次都沒有比對另一份。**

把兩份對齊只修掉今天這兩處。移除副本才修掉產生分岔的機制——本票跑了七輪，這是第一個能讓同型缺陷停止再生的修法。

### 驗證與可否證性

- **F-12 的可否證點是方向 (b)**：若查核指令被寫成永遠印零筆，(a) 照樣「通過」，(b) 會立刻暴露。實測 (b) 印出兩筆且區段正確。
- **self 排除不是萬用豁免**：植入的第三份副本沒有 `# divergence-check` 標記，照樣被抓到——證明排除的是那一個標記過的區塊，不是「所有區塊」。
- **未回歸、未越界**（皆程式比對，非目視）：`G-1 指令主體逐字未變: True`、`G-2 指令主體逐字未變: True`、`AC 全節逐字未變: True`、`F-11 的 G-5 pattern 逐字未變: True`、`G-8 列逐字未變: True`、F-6 兩個判準片段 `True`、`F-7 記錄位置與固定格式逐字未變: True`、`F-9 awk 限縮逐字未變: True`、`sync-content 禁令仍在 Test plan: True`。
- **既有指令重跑無回歸**：G-5 仍印三筆；F-9 查核指令八張票全 `NO-RECORD`。
- **AC-3 無回歸**：三檔命中數仍為 `1／5／1`；相鄰性仍為 `binding at line 8; next line 9 =   robots: { index: false, follow: false },`。
- **改動範圍**：`git diff --name-only` 只有本票一檔；修法本身 `+27／-9`，連同本節 stage report 一併提交後為 `+87／-9`。九筆刪除為 `status: verify`（**FO 推進階段改的 frontmatter**，本 ensign 開工前就在工作區）、Test plan 導言一行、以及被移除的七行 `bash` 區塊（含前後圍欄）——五條指令全部逐字保留在更正補述內。**無以刪改掩蓋。**

### Summary

F-12 修根：`## Test plan` 不再自己抄一份 gate 指令，改為指向第三節的唯一正本。Test plan 裡不在第三節的東西全部留著（實測記錄表、`不執行 npm run sync-content` 等），五條被移除的指令逐字保留在更正補述裡，並寫明兩處分岔與各自的後果。

**沒有把 Test plan 缺的那個字串補進去。** 依授權，正確作法是讓副本消失，不是讓兩份副本一致——對齊只修今天這兩處，移除才修掉分岔機制。

新增一條可重跑的分岔偵測，並雙向驗過：修法前印五筆 `STRAY`、修法後零筆；在副本植入第三份副本後，同一條指令印出兩筆 `STRAY`。第二個方向是關鍵——**證明檢查會通過，不等於證明檢查會失敗。**

**一件我要誠實記下的事**：F-12 的兩處分岔都是我造成的。cycle 4 改 G-8 順序、cycle 6 加寬 G-5，兩次都只改第三節，兩次都沒去比對 Test plan 那一份。我每一輪都在驗「我改的那一處對不對」，沒有驗「這份文件裡還有沒有第二個地方講同一件事」。

**AC-2 維持未達成**，仍綁在未獲核准動工的 feature `039`。gate 整體仍不通過（八張票皆未結案、G-5 三筆佔位命中），各有其票，依禁令未動。

## Stage Report: verify (cycle 7)

- DONE: 獨立重驗 F-12 的根本修法：確認 `## Test plan` 內已無任何可執行的 G 項指令清單，且保留了不在第三節的非重複內容；特別確認 implement **沒有**把副本缺的那個字串補進去。
  `## Test plan`（`:270-312`）內已無可執行指令清單——僅存的兩行 fence 是查核指令自己那一塊。四項非重複內容**全部保留**（實測記錄表、`npm run build` 本階段未跑的說明、A 類需實際渲染、`不執行 npm run sync-content`）。**沒有補字串**：副本整份消失，五交替的那一版只以逐字引文形式留在更正 blockquote 內。
- DONE: 獨立重跑偵測重複清單的查核指令，並在副本上刻意再造重複確認它抓得到。**本輪最要緊的一項。**
  **抓得到。** 在三個不同區段各造一份重複，三次都印出 `STRAY` 並正確標出區段；第三節內的正本正確不報；還原後回到零 `STRAY`。詳見下節。
- DONE: 確認未越界也未回歸。
  十項比對全 `True`（含八列 G 項整列位元組相同），`git diff` 只有本票一檔，AC-3 與相鄰性無回歸。判定 **PASSED**。另記兩筆本輪新發現：**F-13**（殘留的第二份副本，在查核範圍外）與 **F-14**（查核指令的自排除可被繞過）。

### 本輪的核心問題：成因真的消失了嗎

**對它鎖定的機制而言，是。** 我沒有只確認「兩處分岔補好了」，而是照指示測它能不能抓到**未來**的分岔。查核指令從文件抽出後（`:306-309` 的 fenced 區塊，510 bytes；注意該 awk 內含行中的三連反引號，**必須用行首錨定的方式抽取**，用非貪婪正規表示式抽會被截斷——我第一次就踩到，已改正）：

| 情境（皆在副本上） | `STRAY` 筆數 | 判定 |
|---|---|---|
| 乾淨副本（基準） | 0 | 乾淨，`AC-OWNED` 1 筆 |
| 在 `## Documentation impact` 再造一份 | **3** | **抓到**，標為 `STRAY[## Documentation impact]` |
| 在 `## Out of scope` 再造一份 | **3** | **抓到** |
| 在 `## Risk evidence` 再造一份 | **3** | **抓到** |
| 在**第三節內**再放一份（正本區） | 0 | **正確放行**，正本不該被報 |
| 還原 | 0 | 回到乾淨 |

第五列和前三列一樣重要：若查核只會無差別地報所有 G 項指令，正本自己就會被報成 `STRAY`，那條檢查等於永遠不通過。實測它分得出正本與雜項。

真實候選上實跑：`STRAY` **零筆**，`AC-OWNED` 一筆（`## Acceptance criteria` 內 AC-3 的 `grep`，屬 captain 所有、已明列為已知例外而非隱藏），離開碼 `0`。

**但成因是被縮小，不是被消滅**——見 F-13、F-14。

### 授權邊界：副本是被移除，不是被對齊

這是本輪最容易做錯的地方，implement 做對了。live 文件內現存三處 G-5 pattern：

| 位置 | 交替項 | 性質 |
|---|---|---|
| `:171` G-5 表格列 | 6 | **正本**（表格內 `\|` 依 markdown 轉義） |
| `:215` blockquote「可原樣複製的完整指令」 | 6 | 正本的可執行寫法，**去轉義後與 `:171` 逐字相同（實測 `True`）** |
| `:295` F-12 更正 blockquote 內第 4 條 | 5 | **被移除副本的逐字引文**，前有「原句為」標記，行首為 `>` |

五交替的那一版只以**歷史引文**存在，不是活的第二份。**implement 沒有把 `快速了解最新判決的5個重點` 補進任何副本**——正確，補上會改變該檢查要求什麼，超出 captain「不改 AC 要求本身」的授權。讓副本消失而非讓兩份一致，是這次授權的正解。

### 未越界、未回歸

| 檢查 | 結果 |
|---|---|
| 八列 G 項整列位元組 | **全部 `IDENTICAL=True`**（含 G-5、G-8） |
| G-1／G-2 指令主體 | `257B`／`241B`，`True` |
| F-9 的 `awk` 限縮指令 | `282B` vs `282B`，`True` |
| F-7 記錄格式字串 | 仍在、未變 |
| F-11 的 pattern | 即 G-5 列，位元組未變 |
| AC 全節 | `1622B` vs `1622B`，`True`（cycle 1–7 **七輪同值**） |
| `git diff` 範圍 | 只有本票一檔；`src/`／`next.config.ts`／`package.json` 皆空 |
| AC-3／G-7、相鄰性、G-6、G-5、F-9 查核 | `1／5／1`；`binding at line 8; next line 9 = robots:`；`false false`；三筆；八張 `NO-RECORD` |

**關於與 `main` 的差異，我查了歸屬而非逕自採信**：`git diff main..HEAD -- src/data/` 顯示 `future.ts` 差 92 行。查證後確認是分支落後而非缺陷——本分支自 merge-base `d0a9bda` 起對 `src/` 只動過 `src/app/layout.tsx` 一行（cycle 1 的綁定），**從未碰過 `future.ts`**；該檔的變動來自 main 上 `063` 的三個 commit（`7f1f44e`／`3862691`／`f660ed7`，正是移除 `requiredForRuling: 10` 的那張票）。`src/data/*.json` 與 main **位元組相同**，sha256 七輪不變。以分支為準，如指示。

### 新 finding

**F-13 — 還留著一份 G-5 pattern 的副本，且落在查核範圍外。**
- 可觀察損害：目前無——`:215` 與 `:171` 實測**逐字相同**。但它確實是同一條 pattern 的第二份文字副本，必須與正本同步移動。cycle 6 改 F-11 時兩處都改了，所以今天一致；下一次只改一處就會分岔，**而查核指令抓不到它**（該指令只掃 fenced 區塊，`:215` 是 blockquote，依本票明訂的慣例 blockquote 屬「逐字保留的原文」而非可執行副本）。
- 為何它存在且不宜逕自刪除：markdown 表格列內的 `|` 必須寫成 `\|`，所以 `:171` 無法直接複製執行；`:215` 是它的可執行寫法。刪掉會讓 G-5 失去可原樣複製的形式。
- 受影響的 AC 或邊界：無 AC 失敗。受影響的是 F-12 想根除的那個機制——**縮小了，沒有消滅**。
- 觸發證據：三處 pattern 的位置與交替項數如上表；`:215` 去轉義後與 `:171` 相等為 `True`。
- 建議：materiality = **Deferred risk**。promote-to-material 條件：G-5 的 pattern 下次變動時，`:171` 與 `:215` 只改了一處。task ownership = 本票自有範圍。disposition 建議 = 兩擇一：把查核指令的掃描範圍擴及「blockquote 內宣告為可原樣複製的指令」，或在 `:215` 旁加一行「本行必須與 `:171` 同步」的提示。**未自行修。**

**F-14 — 查核指令的自排除可被繞過。**
- 可觀察損害：目前無。自排除的判準是「區塊內出現 `divergence-check` 字樣」，所以**任何含該字樣的新 fenced 區塊都會被一併排除**。實測：在 `## Out of scope` 放一個開頭寫 `# divergence-check` 的區塊並內含 `npx tsc --noEmit`，`STRAY` 為 **0**——沒被抓到。
- 補述宣稱「任何**新**放進來的區塊都沒有這個標記，照樣會被抓到」——這句在一般情況成立（我造的三份一般重複都被抓到），但**不是絕對成立**，複製查核區塊本身就會帶著標記。
- 受影響的 AC 或邊界：無 AC 失敗。
- 建議：materiality = **Polish**（需要刻意帶上標記才能繞過，屬非對抗情境下不會發生的操作）。disposition 建議 = 把自排除改為位置性判準（例如只排除 `## Test plan` 內第一個標記區塊），或接受現狀並把補述那句話的絕對語氣改成「一般情況下」。**未自行修。**

### 驗證與可否證性

- 本輪最關鍵的證據是**再造重複**：三個區段各造一次、三次全抓到，且第三節內的正本正確放行。若那條指令抓不到人為造出的重複，F-12 就只是被搬走而非修好——實測抓得到。
- 反向也驗了：若查核無差別報所有 G 項指令，第五列（第三節內）會是非零；實測為 0。
- 「副本被移除而非被對齊」以交替項計數斷言：live 文件內 6／6／5 三處，五交替那一處位於「原句為」引文之後且行首為 `>`。若 implement 補了字串，會出現第二個**活的** 6 交替 pattern 在 Test plan 內——實測沒有。
- 與 main 的差異以**歸屬**查證，不是看 diff 就下結論：`git log $MB..HEAD -- src/data/future.ts` 為空（分支從未動過），而 main 上有三個 `063` 的 commit 動過它。
- 抽取查核指令時我第一次用非貪婪正規表示式，被 awk 內行中的三連反引號截斷、執行報語法錯誤。改用行首錨定 fence 解析後正常。**這是我的抽取方法錯誤，不是文件缺陷**——如實記下，因為它也是未來抽取這條指令的人會踩到的坑。

### Summary

F-12 的根本修法成立。`## Test plan` 的重複指令清單整份移除、改為指向第三節，四項非重複內容全部保留，**沒有把缺的字串補進去**——副本消失而非兩份對齊，這正是授權的正解。原內容逐字保留於更正 blockquote。

**我照指示測的是成因而不是症狀**：在三個不同區段刻意再造重複，查核指令三次全部印出 `STRAY` 並標明區段；第三節內的正本正確放行；還原後歸零。真實候選上 `STRAY` 零筆、`AC-OWNED` 一筆（AC-3 的 `grep`，captain 所有，已明列為已知例外）。**這條檢查是真的會叫的。**

未越界：八列 G 項整列位元組相同，F-9 的 `awk`、F-7 的格式、F-11 的 pattern 皆未變，**AC 全節七輪維持 1622 bytes**。與 main 的 `future.ts` 差異經歸屬查證確認為分支落後（`063` 的三個 commit），本分支自 merge-base 起對 `src/` 只動過 `layout.tsx` 一行。

**但要把話說準：成因是被縮小，不是被消滅。** 兩筆新記錄——**F-13**：`:215` 仍是 G-5 pattern 的第二份副本（今天與正本逐字相同，實測），它存在有正當理由（表格列的 `\|` 無法直接複製執行），但落在查核範圍外，下次只改一處就會分岔；**F-14**：查核指令的自排除以「含 `divergence-check` 字樣」為判準，任何帶該字樣的新區塊都會被一併排除，實測可繞過——補述那句「任何新放進來的區塊都沒有這個標記」在一般情況成立，但不是絕對。兩筆皆不使任何 AC 失敗，依 `## Review-finding disposition` 只記錄、未動位元組。

## Stage Report: review

我是新的獨立 reviewer，不採信前七輪任何自我回報。四條 AC 全部自行重跑，八個 G 項全部**從文件內抽出**後執行。前七輪的交付經重驗全部成立。**但本輪又找到同一類缺陷的四個新實例，其中三個是可執行缺陷**——跑真正的指令、餵真實可能的輸入，它回報通過而被保護的性質已經不在。判定 **REJECTED**。

- DONE: 逐項重現 AC-1（十五項結論齊備、「修好」指向可查證證據）
  以 node 抽 `### 二、` 表格（`:99-129`）：A1–A4／B1a／B1b／B2／B3／C1–C3／D1／D2／D3／D4 **15/15 各有一個結論類型**，`extra rows: []`，全節唯一出現「待確認」的是那句斷言自己。十張「修」全部指向票號或人工項；`058`–`063`／`049`／`052` 八張票 `ls` 全部命中一檔。
- DONE: 逐項重現 AC-3（三檔各至少一筆命中，`layout.tsx` 那一筆以 `awk` 證明下一行即 `robots:`）
  命中數 `1／5／1`；`awk` 輸出 `binding at line 8` ／ `next line 9 =   robots: { index: false, follow: false },`。可否證點：若綁定行被移走，`next line` 不會是 `robots:`——我在副本上把它移到檔尾，`next line = <EOF>`（見 F-15）。
- DONE: 逐項重現 AC-4（六個機械項逐條執行並貼出輸出）
  指令全部從 `#### Gate 執行清單` 表格列抽出（表格內 `\|` 去轉義後）。輸出見下節。**G-1／G-2 的通過條件（`status: complete` 且 `verdict: PASSED`）目前不成立**：八張票全為 `status: design`、`verdict` 空。這是 gate 的**現況**，不是 AC-4 失敗——AC-4 要求的是「逐條執行並貼出輸出」，六項都有輸出。
- SKIPPED: AC-2 — A 類每一項都能以實際頁面行為驗證
  維持未達成，依指示不得以任何替代方式宣稱通過。獨立複核依賴為真：`039-render-check-tool.md` 仍為 `status: design`／`verdict` 空；`package.json` 內 `playwright`／`puppeteer`／`jsdom`／`cheerio` 皆不存在（實際讀 dependencies＋devDependencies，輸出 `[]`）。未自建任何常設檢查機制。
- DONE: 確認 `## Test plan` 內已無任何可執行的指令清單（F-12 的根本修法）
  `:270-312` 內僅存的兩道 fence 是查核指令自己那一塊（`:306`／`:309`）。全檔以行首錨定解析共 7 個 fenced 區塊，屬 live 部分的只有三個：`:155-157`（G-7 正本）、`:261-263`（AC-3，與前者**位元組相同**，`cmp` 為 IDENTICAL，已明列為 AC-OWNED 已知例外）、`:306-309`（查核指令自己）。四項非重複內容全部保留。
- DONE: 自行在副本上造重複，驗證偵測指令抓得到
  抓得到，但**涵蓋面有兩個缺口**（F-16／F-18）。五個情境見下節。
- DONE: G-5 兩個方向都驗（涵蓋變體、且不誤抓）
  方向 (a)：16 個佔位寫法變體（含簡體、全形空格、無空格、全形 `Ａ`／`Ｂ`、全形 `５`、大寫信箱）**全部 HIT，miss=0**。方向 (b)：17 個合法近似字串（`台灣大學法律系`、`前端工程師的工作內容`、`這則判決的5個重點`、`某大法官`、`前端工程師 C`、`前端工程師 甲` 等）**全部 MISS，false-hits=0**。去重用 JS `Set`，計數用 `grep -o`／`wc -l`，全程未用 `sort`／`uniq`。
- DONE: 判定七輪累積的未結項是否都正確留在票內
  F-13、F-14、AC-2、C1 覆寫點、G-3 五項**全部仍在票內且敘述與事實相符**，逐項複核見下節。
- FAILED: 判定這份 diff 能不能交付
  **不能。** 四個新實例，F-15／F-16／F-17 皆為可執行缺陷。

### 六個機械項的實際輸出

| 項 | 抽出來源與大小 | 輸出 | 判定 |
|---|---|---|---|
| G-1 | `:167` 表格列，257B | 八行 `058`–`063` 皆 `status: design verdict:` | 指令可跑；**通過條件不成立**（非 `complete`＋`PASSED`） |
| G-2 | `:168` 表格列，241B | `049 status: design verdict:`／`052 status: design verdict:` | 同上 |
| G-5 | `:171` 去轉義後 155B pattern | 三筆：`PresentDetail.tsx:32`、`contributors.ts:16`、`:21`（`wc -l` 計數＝3） | 符合預期（`061`／`052`），非新缺陷 |
| G-6 | `:172` 去轉義後 130B | exit `0` | 通過（`h2`／`h28` 皆不在 40 筆內） |
| G-7 | `:155-157` fenced 區塊 | 七行命中，三檔皆有 | 通過（但見 F-15） |
| G-8 | `npm run build` → `npx tsc --noEmit` | build exit `0`、`16/16` 靜態頁；tsc exit `0` 無輸出 | 通過 |

F-8 的環境陷阱依指示處理：先 `npm run build` 再跑 `tsc`。`.next/types/` 內無帶「 2」「 3」的重複檔（`find` 零輸出），但 `.next/` 根目錄有一個 `app-path-routes-manifest 3.json`——**非 `.ts`，不落在 `tsconfig.json` 的 `include`**，故不影響 `tsc`。未改原始碼，**未對成因作任何斷言**。

F-9 的 `### Feedback Cycles` 查核指令另行抽出重驗（282B、純 ASCII、exit 0）：真實候選上八張票全 `NO-RECORD`（正確，captain 尚未簽任何一張）。並在副本上雙向驗證：在 `### Feedback Cycles` 放一筆真實 `058` 記錄、同時在 `## Out of scope` 放一筆 `049` 誘餌 → 輸出 `058 RECORDED`、`049 NO-RECORD`、其餘六張 `NO-RECORD`。**該算到的算得到，誤報的不再算**，F-9 的修法成立。

### 偵測重複清單的指令：五個情境

指令從 `:306-309` 抽出（行首錨定解析，因 awk 內含行中三連反引號）。真實候選：`STRAY` **0 筆**、`AC-OWNED` 1 筆、exit `0`。

| 情境（皆在副本上） | `STRAY` | 判定 |
|---|---|---|
| 乾淨副本 | 0 | 基準 |
| T1：在 `## Documentation impact` 植入分岔副本 | **3** | **抓到**，區段標示正確 |
| T2：在 `#### 誰、在哪個時點執行`（第三節內、非正本子節）植入同一份 | **0** | **漏抓 → F-16** |
| T3：在 `## Out of scope` 植入只換旗標順序／空白的等價寫法 | **0** | **漏抓 → F-18** |
| T4：在 `## Out of scope` 植入帶 `# divergence-check` 標記的區塊 | **0** | 漏抓，**F-14 重現確認** |
| T5：在 `#### Gate 執行清單` 內植入 | 0 | 正本區，放行（設計如此） |

T1 證明這條檢查會叫，不是空的。T2／T3 證明它叫的範圍比它宣稱保護的語意窄。

### 七輪未結項複核

| 項 | 現況 | 判定 |
|---|---|---|
| F-13（`:215` 第二份 G-5 pattern） | `:171` 與 `:215` 去轉義後**仍逐字相同**（`true`），交替項 6／6；`:295` 為 5 交替且行首為 `>`，是歷史引文 | 敘述正確、仍留在票內。**但它的建議處置 (a) 無效——見 F-16** |
| F-14（自排除依賴字面字串） | T4 獨立重現，`STRAY` 為 0 | 敘述正確，仍留在票內 |
| AC-2 | `039` 仍 `design`；無 playwright／puppeteer／jsdom | 正確歸因，未以替代方式宣稱通過 |
| C1 真實信箱覆寫點 | 仍寫在 `### 二、` C1 列；`PresentDetail.tsx` 自 merge-base 起**零 commit、零改動** | 禁令遵守，覆寫點仍待 captain |
| G-3（Vercel dashboard 人工項） | `:169` 仍為 `人工`，通過條件仍是 captain 抄回實際值 | 仍留在票內，仍待 captain |

### Documentation impact 逐筆查核（依實際交付行為）

「現在更新」三筆**全部完成**：`TODO.md:807` 有「解除條件」指向本票並要求 G-1–G-8 全過；`TODO.md` P0-2／P0-6 各加一則 `2026-09-21 補述` 且**原文保留**（diff 只有 `+`，該兩節無 `-`）；`AGENTS.md:52` 同時指向 P3-8 與本票。「實作後更新」三筆條件未到（`049` 補述綁「本票 design 通過 gate」，尚未通過，未提前寫入）。
**未改寫任何 `record` 文件**：diff 四檔皆非 `record`（`AGENTS.md` 為 `evergreen`、`TODO.md` 為 `plan`），`_archive/` 零命中。**`docs/INDEX.md` 一致**：本 diff 未新增或刪除任何檔案（`--diff-filter=AD` 零輸出），且 INDEX 不逐張收錄 feature 票（`constitution-features/0` 命中 0），故不動符合本票自訂規則。

### 未越界、未回歸（皆以位元組或實跑證明）

`## Acceptance criteria` 全節 **1622B**，與 merge-base 版本**位元組相同**——AC 未被動過，我自行比對而非引用前輪數字。`src/` 自 merge-base 起只有 `layout.tsx` `+1`。`src/data/` **自 merge-base 起零 commit**，`discussions.json`／`history.json` 與 `main` **sha256 相同**，未執行 `sync-content`。與 `main` 的 `future.ts` 差異經**歸屬**查證為分支落後（`063` 已於 2026-09-24 合併），以分支為準查核，如指示。
**我的所有重現都在副本上做**：`git status --porcelain` 空、HEAD 仍 `25b6efb`、entity sha256 與 HEAD blob 相同、`history.json` sha256 未變。未動任何候選位元組，未提交任何修正。

### 新 finding

**F-15 — G-7 是位置無關的，而它保護的性質是位置相關的。這是四筆裡最嚴重的一筆。**
- released user 與 normal workflow：gate 執行時由 FO 代跑 G-7。真實工作流是「有人要移除 `robots:` 那一行」——本票第三節自己說綁定放在那裡的理由是「**這是唯一繞不過的位置**，任何人要刪第 8 行，游標一定經過這幾行」。
- observable harm：把註解從 `robots:` 正上方移到**檔尾**——正是 AC-3 明文禁止的位置（「不可放在檔尾」）——G-7 仍 exit `0`、仍印出三檔命中，**回報綁定完好**。而此時「繞不過」這個性質已經消失：刪第 8 行的人不會經過檔尾的註解。方向是 fail-open。
- 受影響的 AC 或邊界：AC-3 對同一道綁定明文要求相鄰性，G-7 對同一道綁定**只要求字串存在**。gate 執行時 AC-3 的驗證已是歷史，真正在跑的是 G-7——**在最需要它的那一刻，位置性質沒有被檢查**。
- trigger evidence：副本實跑。`layout.tsx` 註解移到檔尾後，G-7 逐字執行 → exit `0`，七行命中；同一份副本上 `awk` 的相鄰性檢查 → `binding at line 56` ／ `next line = <EOF>`。兩者對同一檔案給出相反結論。
- 建議：materiality = **Deferred risk**（今日相鄰性成立，觸發需一次未來編輯）。**但觸發情境不假設惡意**：要刪 `robots:` 的人把註解挪開而非刪掉，是最自然的一種操作，而那正是 gate 該叫的瞬間。promote-to-material 條件：`layout.tsx` 的該行與 `robots:` 不再相鄰。task ownership = 本票自有範圍（G-7 是本票的交付物）。disposition 建議 = 讓 G-7 的通過條件納入 AC-3 已有的 `awk` 相鄰性判準，而不是只看 `grep` 命中。**未自行修。**

**F-16 — 偵測重複清單的指令把整個第三節當成豁免區，而正本只有其中一張表。**
- released user 與 normal workflow：本票的修正輪迴本身。七輪裡有兩輪產生過分岔副本，而 cycle 6 為了讓 G-5 可原樣複製，在第三節的補述裡放了第二份 pattern（`:215`）。
- observable harm：awk 只在 `^### ` 與 `^## ` 更新 `sec`，`####` 不更新，所以 `sec` 在 `:130`–`:224` 全段都等於 `### 三、Gate 機制`。豁免區實際是**95 行、四個 `####` 子節**，而正本只有 `#### Gate 執行清單` 那張表加 `:155-157` 一個區塊。把分岔副本放進 `#### 誰、在哪個時點執行`，`STRAY` 為 **0**。headline 寫的是「**本票內**不得再有第二份可執行的 G 項指令清單」，涵蓋面卻是「第三節之外」。
- 受影響的 AC 或邊界：無 AC 今日失敗。受影響的是 F-12 根本修法的那句承諾，以及 **F-13 的建議處置 (a) 會失效**——`:215` 就在第三節內（`215` ∈ `130..224`），把掃描範圍擴及 blockquote 之後，第三節豁免仍會把它吞掉。這一點前七輪沒有人指出。
- trigger evidence：T2 實跑 `STRAY=0`；`sec` 更新規則見 `:309` 的 awk 本體。**近期觸發點具體存在**：G-6 的表格列含 `\|\|`（我執行前必須先去轉義），和 G-5 同樣不可原樣複製，因此 G-6 是下一個會被補上「可原樣複製的完整指令」的項——而那份自然會放在第三節。
- 建議：materiality = **Deferred risk**。promote-to-material 條件：第三節內出現第二個 fenced 可執行 G 項區塊。task ownership = 本票自有範圍。disposition 建議 = 把豁免改成區塊性判準（只豁免 `#### Gate 執行清單` 與 `:155-157` 那一塊），而不是整個 `### 三、`。**未自行修。**

**F-17 — G-6 以 id 判定，而它保護的性質是內容。**
- released user 與 normal workflow：內容來自 Google 試算表，經 `sync-content` 上線；`isApproved()` 依 `status` 欄過濾。試算表由人維護，id 並不穩定（同檔 P3-8 就記著 `h1`–`h46` 中間跳號）。
- observable harm：G-6 只問「`h2`／`h28` 這兩個 id 在不在」。把釋字第272號的內容以**另一個 id** 重新核可，G-6 仍 exit `0`。我在 scratch 副本上加一列 `h47`、`reality.title` 帶「釋字第272號」：G-6 逐字執行 → exit `0`（回報通過），而同一份資料 `JSON.stringify(a).includes('272')` → `true`。**D1 那筆需法學確認的錯誤內容在線上，反向保護說通過。**
- 受影響的 AC 或邊界：AC-4 未失敗（G-6 有輸出）。受影響的是 D1／D2 的結論——「明確接受 ＋ 加一道反向保護」——反向保護弱於它被賦予的用途。並且 `TODO.md` P0-2 新增的文字把這條 id 檢查描述成防「下次同步會把錯誤內容送回線上」，那是內容層的宣稱。**本票 design 第一節自己用的就是內容層斷言**（`JSON.stringify(a).includes('272')` → `false`），即較強的寫法當時已知、已用過，gate 卻採了較弱的。
- trigger evidence：scratch 副本實跑（repo 資料零改動，`history.json` sha256 未變）。今日真實資料 `272` 全檔零命中、含 `272` 的列 0 筆，故今日無損害。
- 建議：materiality = **Deferred risk**。promote-to-material 條件：`history.json` 內出現 `272` 字串而 `h2`／`h28` 兩個 id 都不在。task ownership = 本票自有範圍。disposition 建議 = G-6 的判準加上內容層斷言（即 design 第一節已用過的那一條），或明寫 G-6 只保證 id 層、並在 `TODO.md` P0-2 把宣稱降到同一層級。**未自行修。**

**F-18 — 偵測指令只認每個指令前綴的一種拼法。**
- released user 與 normal workflow：同 F-16。
- observable harm：pattern 是 `npx tsc --noEmit|npm run build|grep -rn |grep -rniE |node -e |for n in 0`，逐字比對旗標順序與單一空白。等價寫法 `grep -rinE`、`grep -nr `、`node  -e`、`npm  run build`、`for m in 0` **全部掃不到**；T3 實跑 `STRAY=0`。這與 F-11（`前端工程師 [AB]` 的半形空格是必要的）是同一個形狀，只是換到偵測指令自己身上。
- 受影響的 AC 或邊界：無 AC 失敗。
- trigger evidence：T3 實跑。觸發機率低——副本多由複製產生，會保留拼法。
- 建議：materiality = **Polish**。task ownership = 本票自有範圍。disposition 建議 = 與 F-14 併案處理，或接受現狀並把宣稱改為「一般情況下」。**未自行修。**

**一筆觀察，未列為 finding**：G-6 現在有兩份可執行副本在 `TODO.md`（`:242`、`:352`，皆在 fenced 區塊內），形式與正本**已經不同**（`console.log` 對 `process.exit(1)`，語意今日等價）。偵測指令只掃本票一個檔案，看不到它們。這兩份是本票 Documentation impact 自己裝上去的。headline 寫的是「本票內」，故非過度宣稱；但 gate 的指令現在橫跨三個檔案，而防分岔的機制只覆蓋一個。列此供 FO 判斷是否併入 F-16。

### 驗證與可否證性

- **每一條指令都從文件內抽出後執行**，不是照著讀一遍。G-1／G-2／G-5／G-6 從表格列抽出並去轉義（`\|` → `|`），G-7 與偵測指令從 fenced 區塊以行首錨定抽出。抽取過程本身抓到我第一版的 bug：用 `^\| G-[1-8] \|` 掃全檔會命中 stage report 裡的表格列（`:590`、`:591`、`:592`、`:739`、`:740`）並覆寫抽出檔——已改為限定在 `#### Gate 執行清單` 至第一則補述之間。**如實記下，因為它會讓「G-5 指令」被換成 stage report 的一段文字而悄悄跑錯。**
- **每一筆 finding 都以「跑指令」而非「讀指令」證明**：F-15 在副本上移動註解後跑 G-7 逐字指令；F-16／F-18 在副本上植入區塊後跑抽出的偵測指令；F-17 在 scratch 資料上跑 G-6 逐字指令。四筆都是「指令回報通過、性質已不在」。
- **反向也驗了**：T1 證明偵測指令會叫（3 筆）、T5 證明它不會把正本誤報；G-5 方向 (b) 的 17 個合法字串全 MISS 證明沒有過寬；F-9 的 `058 RECORDED` 證明它不是一條永遠回 NO-RECORD 的死指令。**只驗通過等於沒驗。**
- **locale 陷阱已避開**：全程未使用 `sort`／`uniq`／`sort -u` 判定中文字串。計數用 `grep -o`／`wc -l`／`grep -c`，去重用 JS `Set`。
- **未歸因未證實的成因**：`.next/` 的 `app-path-routes-manifest 3.json` 只描述症狀與其不影響 `tsc` 的理由（非 `.ts`、不在 `include`），未對產生機制作任何斷言。
- **可否證點**：若我對 F-15 的判斷錯了，只需證明 G-7 對「註解在檔尾」會回非零或少印一檔——實測它回 `0` 且三檔全印。若 F-16 錯了，只需證明 T2 會印 `STRAY`——實測 `0`。若 F-17 錯了，只需證明 G-6 對帶 272 內容的資料回非零——實測回 `0`。

### Summary

四條 AC 全部自行重現：AC-1 十五項結論齊備（15/15，無「待確認」）、AC-3 三檔 `1／5／1` 且 `awk` 證明第 8 行下一行即 `robots:`、AC-4 六個機械項逐條抽出執行並貼出輸出（G-8 build＋tsc 皆 exit 0）。AC-2 依指示維持未達成，依賴（`039` 仍 `design`、無 playwright／puppeteer／jsdom）獨立複核為真，未以任何替代方式宣稱通過。

**前七輪的交付經重驗全部成立**：F-12 的根本修法確實成立（Test plan 內已無可執行指令清單，偵測指令在 T1 上印 3 筆 `STRAY`，會叫）；F-9 雙向成立；F-11 的 G-5 兩個方向成立（16 個變體全 HIT、17 個合法近似全 MISS）；AC 全節 1622B 與 merge-base 位元組相同；`src/` 只動 `layout.tsx` 一行；`src/data/` 與 `main` sha256 相同；未跑 `sync-content`；`PresentDetail.tsx` 零改動。F-13／F-14／AC-2／C1／G-3 五項未結項全部正確留在票內。Documentation impact 逐筆查核：「現在更新」三筆已完成且原文保留，無 `record` 文件被改寫，`docs/INDEX.md` 一致。

**判定 REJECTED。** captain 的判準是「可執行缺陷已全數清除，殘留只剩不可執行的展示形式」。F-13 符合那個描述（今日與正本位元組相同的展示形式）、F-14 也符合（需刻意帶標記）。**但本輪三筆新實例不符合**：F-15、F-16、F-17 都是**跑真正的指令、餵真實可能的輸入，它回報通過而被保護的性質已經不在**。

三筆各自對應本票 Problem 一節要防的那件事的一個面：**F-15** 是「宣稱保護的語意比涵蓋面寬」——G-7 位置無關，而本票自己說綁定的價值就在位置（「唯一繞不過的位置」），AC-3 也明文禁止放檔尾，實測註解移到檔尾後 G-7 仍回 `0`；**F-16** 是「粒度比保護對象粗」——豁免區是整個第三節 95 行四個子節，正本只有一張表，且**這使 F-13 的建議處置 (a) 無效**，因為 `:215` 本身就在第三節內；**F-17** 是「判定層級比性質低」——G-6 問 id，性質是內容，實測 272 內容換個 id 回來，G-6 照樣回 `0`。

**這三筆的共同點與前八處相同**：檢查跑得動，但它比對的東西不是它宣稱在保護的東西。F-16 尤其值得說明——cycle 7 的修法是「讓副本消失」，方向正確，但它同時裝上的那道防再生機制本身就帶著兩個涵蓋面缺口（F-16／F-18）。**把偵測器裝好之後，還得對偵測器自己做一次同樣的追問。**

## Stage Report: implement (cycle 8)

本輪處理 review 判 REJECTED 的四筆：F-15、F-16（含那筆觀察）、F-17、F-18，全部改動在 commit `952962d`。未動 `src/`、build 產物、`layout.tsx`、`next.config.ts`、`PresentDetail.tsx`（`git diff -- src/ next.config.ts package.json` 為空），未跑 `sync-content`。

**先講一個範圍差異，不埋著。** dispatch 寫「本輪預期 `git diff` 只有本票一個檔案」，但那筆觀察授權處置 `TODO.md` 的兩份 G-6 副本，而我選的處置必須改 `TODO.md`。**本輪實際改了兩個檔案**：本票與 `docs/health-check/TODO.md`。理由見下方「那筆觀察」一節。

- DONE: F-15：讓 G-7 的通過條件納入 AC-3 已有的 `awk` 相鄰性判準，不要只看 `grep` 命中。**可失敗性實跑兩個方向**：把 `layout.tsx` 的綁定註解移到檔尾（AC-3 明文禁止的位置），G-7 必須**不通過**；移回 `robots:` 正上方必須通過。兩組輸出都要貼。
  第三節「怎麼被查證排除」小節的區塊改為 G-7 正本（標記 `# canonical: G-7`），同時檢查三檔命中與相鄰性；G-7 表格列改為指向正本。三個方向實跑見下節。
- DONE: F-16 ＋ 那筆觀察：把偵測重複清單指令的豁免改成**區塊性判準**，修掉「awk 不在 `####` 更新 `sec` 致整個第三節 95 行四個子節都被豁免」這個缺口；並處置 `TODO.md` 的兩份 G-6 可執行副本。
  豁免改為**只認標記**（`# canonical:` 或 `# divergence-check`），區段性豁免整段移除，`sec` 也在 `####` 更新。`TODO.md` 兩份副本移除並指向正本。可失敗性實跑見下節。
- DONE: F-17：G-6 的判準加上**內容層斷言**。可失敗性：以另一個 id（如 `h47`）帶入「釋字第272號」內容，修法後 G-6 必須**不通過**。
  Gate 執行清單下方新增 G-6 正本（標記 `# canonical: G-6`），id 層保留、內容層補上 `JSON.stringify(a).includes('272')`；G-6 表格列改為指向正本。**未把 `TODO.md` P0-2 的宣稱降級**——我補的是較強的判準，不是保留 id 層。
- DONE: F-18：讓偵測指令對指令前綴的拼法變體不敏感（正規化空白、旗標順序無關），**不要只是列舉更多拼法**；逐一驗證五種變體現在都抓得到，並確認不誤抓正常內容。
  改為先 `gsub(/[ \t]+/," ")` 正規化空白，再以「指令名 ＋ G 項專屬引數」配對判斷；`grep` 只寫 `grep -`，不指定旗標內容。六種變體全抓到，八條合法指令零誤抓。

### F-15 可失敗性：三個方向

| 情境 | 舊判準（只看 `grep`） | 新判準 |
|---|---|---|
| 註解在 `robots:` 正上方 | exit 0 | `G-7 PASS`，exit 0 |
| **註解移到檔尾**（AC-3 禁止的位置） | **exit 0 ← 說通過** | `G-7 FAIL: layout.tsx binding not directly above robots: [matched/adjacent=1/0]`，exit 1 |
| 註解整行刪除 | 三檔之一零命中 → exit 1 | `G-7 FAIL: zero hit in src/app/layout.tsx` ＋ `[matched/adjacent=/0]`，exit 1 |

第二列是 F-15 的核心：`grep` 仍三檔命中，而「唯一繞不過的位置」這個性質已經沒了。**觸發情境不假設惡意**——要刪 `robots:` 的人把註解挪開而不是刪掉，是最自然的一種操作。

### F-17 可失敗性：兩個方向

在副本的 `history.json` 加一列 `h47`、`reality.title` 帶「釋字第272號」：

| 判準 | 結果 |
|---|---|
| id 層（`h2`／`h28`） | 皆 `false` —— 看不到任何異常 |
| 舊 G-6（只看 id） | **exit 0 ← 回報通過** |
| 內容層 `JSON.stringify(a).includes('272')` | `true` |
| 新 G-6（id＋內容） | `G-6 FAIL: content:272`，exit 1 |
| 移除 `h47` 後 | `G-6 PASS`，exit 0 |

**涵蓋面誠實說明**：內容層只針對 D1（`272` 有唯一識別性）。D2 沒有等價的內容層字串可斷言——錯誤的標題本身是一句正常中文。D2 的同型缺陷由票 `062` 負責，**本 gate 不宣稱涵蓋它**，這一點寫進了 G-6 的更正補述。`272` 若日後出現在其他合法內容上，G-6 會誤判失敗，方向是 fail-closed。

### F-16 與 F-18 可失敗性：三組，全部用**從文件抽出**的偵測器執行

| 測試 | 舊偵測器 | 新偵測器 |
|---|---|---|
| A：分岔副本放進 `#### 誰、在哪個時點執行` | `STRAY` **0** ← 被第三節整段豁免吞掉 | `STRAY` **2**，且指出精確子節 `#### 誰、在哪個時點執行` |
| B：六種拼法變體（`grep -rinE` 僅中文字串無 `lorem ipsum`、`grep -nr `、`node  -e`、`npm  run build`、`for m in 0`、`npx   tsc   --noEmit`） | 五種掃不到 | `STRAY` **6**，全中 |
| C：八條合法非 G 項指令（`npm install`、`npx next dev`、`grep -c "test test test"`、`node scripts/sync-content.mjs`、`shasum`、`git diff`、`for f in src/components/*.tsx`、`python3 -c … history.json`） | — | 誤抓 **0** |

**C 是必須的**：過寬的偵測器會讓這條檢查永遠報 `STRAY`、永遠不通過，和永遠通過一樣是假檢查。

### 我在自己新寫的偵測器裡抓到一個 bug

寫入文件後我照規則把偵測器**抽出來看**，發現 `grep` 分支的第三個條件被寫成 `line ~ /某/`——那是字面的 `某`，不是 `某`。awk 會去比對字串 `u67d0`，永遠不中。

後果不是立刻壞：G-5 的正本同時含 `lorem ipsum`，所以副本仍會被 `lorem ipsum` 那個條件抓到。**但一份只抄中文字串的 G-5 副本會整份漏掉。** 已改為真正的 `某`，並在測試 B 特地放了一條**只有中文字串、不含 `lorem ipsum`** 的 `grep -rinE`，確認現在抓得到。

**這正是「抽出來執行而不是照著讀」的用處。** 我如實記下來，因為若只看我寫進去的意圖，這個字元錯誤看不出來。

### 那筆觀察：我的判斷是移除副本，不是擴大偵測

FO 給了兩個選項。**我選移除 `TODO.md` 的兩份副本，並把偵測器維持在本票單一檔案。理由是實測出來的，不是偏好。**

我先做了擴大版：把偵測器指向本票＋`TODO.md`＋`AGENTS.md`。結果 `TODO.md` 報出 **7 筆 `STRAY`，其中 5 筆是誤抓**——

| `TODO.md` 命中 | 性質 |
|---|---|
| `:242`、`:352` 的 `node -e` | **真副本**，G-6 的舊形式 |
| 動工前必讀的 `npm run build` ×2 | 該節自己的同步禁令記錄（且上方已有 2026-09-04 解除補述） |
| P0-5 的 `grep -c "某學者\|某法官\|某大學法律系" src/data/discussions.json` | P0-5 自己的驗證，目標是 `discussions.json` 不是 `src/`，且早於本票 |
| P3-8 的 `npm run build` | P3-8 自己的 noindex 驗證 |

偵測器的前提是「fenced 區塊裡的 G 項指令＝gate 清單的副本」。**這個前提只在本票內成立**——`TODO.md` 合法地為自己的目的使用這些指令。擴大涵蓋面會讓這條檢查長期報 5 筆假 `STRAY`，那就變成一條會被習慣性忽略的檢查，也就是另一種假檢查。

所以：**在前提成立的範圍內偵測，在前提不成立的範圍內直接移除副本。** `TODO.md` 兩節的原指令逐字保留在各自的 2026-09-24（cycle 8）補述內（blockquote 記錄，非 fenced 可執行），並寫明為什麼移除。移除後 `TODO.md` 已無 fenced 的 G-6 可執行副本（以偵測器邏輯單掃該檔，輸出為空）。

這也順帶證明了移除是對的：G-6 的判準本輪剛補上內容層，`TODO.md` 那兩份是 id 層舊形式——**它們在被移除時已經與正本不同形。**

### 兩條硬規則的遵守

- **未用 `sort`／`uniq` 判定中文字串**。本輪所有計數用 `grep -c` 或 `wc -l`。
- **每一條改過的 G 項指令都從文件抽出後執行**，不是照著讀：G-7 正本抽 8 行、G-6 正本抽 324 字元、偵測器抽 20 行。抽取範圍以標記行（`# canonical: G-7`／`# canonical: G-6`／`# divergence-check (self)`）定位並讀到下一個圍欄，**不是**用 `^\| G-[1-8] \|` 掃全檔——那種寫法會命中 stage report 裡的表格列。抽出後才發現上述 `某` bug。

### 驗證與可否證性

- **未回歸、未越界**（皆程式比對）：`G-1 指令主體逐字未變: True`、`G-2 指令主體逐字未變: True`、`AC 全節逐字未變: True`、`F-11 的 G-5 pattern 逐字未變: True`、F-6 兩個判準片段 `True`、`F-7 記錄位置與固定格式逐字未變: True`、`F-9 awk 限縮逐字未變: True`、`G-8 列逐字未變: True`、`sync-content 禁令仍在: True`。
- **各機械項重跑**：`G-7 PASS`、`G-6 PASS`、G-5 三筆命中、F-9 八張全 `NO-RECORD`、偵測器 `STRAY=0`／`AC-OWNED=1`。
- **AC-3 無回歸**：三檔命中數 `1／7／1`（`TODO.md` 由 5 增為 7，因補述新增兩處指向正本的引用）。相鄰性由新 G-7 直接斷言。
- **改動範圍**：本票修法本身 `+88／-10`（連同本節 stage report 為 `+188／-10`）、`TODO.md` `+22／-14`，`src/` 零變動。本票十筆刪除為 `status: verify`（**FO 推進階段改的 frontmatter**，本 ensign 開工前就在工作區）、G-6／G-7 兩列、G-7 原區塊與其前後兩句、偵測器區塊與其前後說明句——全部原文逐字保留在各自的更正補述內。`TODO.md` 十四筆刪除為兩節的 lead-in 句、兩個 `bash` 區塊、兩句實測記錄，同樣逐字保留。**無以刪改掩蓋。**

### Summary

四筆全修，每一筆都做了可失敗性實跑而不是只證明它會通過。三個修法的共同形狀是**判準層級比它保護的性質低**：G-7 用位置無關的 `grep` 保護位置相關的性質；G-6 用 id 判定保護內容；偵測器用區段豁免保護「本票內」這個涵蓋面。三者都補到同一層。

**F-17 最值得記**：較強的寫法當時已知——本票 design 第一節自己用的就是 `JSON.stringify(a).includes('272')`。gate 採了較弱的那一個，而且撐過七輪 verify。前七輪查的是票內部的一致性，這一輪查的是指令跑起來會不會說謊。

**我在自己本輪新寫的偵測器裡抓到一個字元錯誤**（`某` 而非 `某`），是靠抽出來執行才看見的，已修並補了針對性測試。

**那筆觀察我選了移除副本而非擴大偵測**，因為實測擴大版在 `TODO.md` 產生 5 筆誤抓——偵測器的前提只在本票內成立。理由與實測數字都寫進報告了。

**AC-2 維持未達成**，仍綁在未獲核准動工的 feature `039`。gate 整體仍不通過（八張票皆未結案、G-5 三筆佔位命中），各有其票，依禁令未動。

## Stage Report: review (cycle 2)

我是上一輪判 REJECTED 的同一個 reviewer。**我抓到的四筆全部真的修好了**——每一筆都用我當初用來證明 fail-open 的**同一個探測**重跑，現在都會叫。但我照同樣的標準往下追時，在**本輪新寫的 G-6 內容層**上找到同一類缺陷的兩個新實例，而且是**一條斷言同時過窄又過寬**。判定 **REJECTED**。

- DONE: 獨立重驗 F-15（移到檔尾必須不通過、移回必須通過，兩個方向都貼輸出）
  四個方向實跑，見下節。正上方 `G-7 PASS` exit 0；**移到檔尾 `G-7 FAIL ... [matched/adjacent=1/0]` exit 1**；整行刪除 exit 1；還原 exit 0。**我上一輪用來證明 fail-open 的那個探測，現在會叫。**
- DONE: 獨立重驗 F-16（重現 T2、確認 `:215` 是否被涵蓋、判定多檔涵蓋面）
  T2 現在報 **3 筆 `STRAY` 並指出精確子節 `#### 誰、在哪個時點執行`**。另測第三節其餘兩個子節，皆抓到。`sec` 確實在 `####` 更新，區段性豁免已整段移除。F-13 殘留與多檔問題見下節。
- DONE: 獨立重驗 F-17（以另一個 id 帶入 272 內容，確認 G-6 現在不通過）
  **確認不通過**：`h47` 帶「釋字第272號」→ `G-6 FAIL: content:272` exit 1；`h2` id 回來 → `G-6 FAIL: id:h2`；乾淨資料 → `G-6 PASS`。**但這條新斷言本身有兩個方向的缺陷，見 F-19／F-20。**
- DONE: 獨立重驗 F-18（六種拼法逐一確認、並自行構造合法指令確認不誤抓）
  六種拼法**全部抓到**（含只有中文字串、不含 `lorem ipsum` 的那一條，證明 `某` 的字元修正有效）。自構十條合法指令，**九條乾淨、一條誤抓**，見 F-22。
- DONE: 判定 implement 的兩個選擇
  F-16 的「只認標記」**比 FO 建議的區塊性判準更好，但代價是 F-14 的觸發面擴大**；F-17 的「補強判準而非降級宣稱」**方向正確，執行有缺陷**。兩項實質評估見下節。
- DONE: 確認 AC 要求文字逐字未變、`src/` 零變動
  AC 全節 **1622B**，與 merge-base、與我上一輪的 commit `37b4ac5`、與 HEAD **三者位元組相同**。`src/` 自 merge-base 起只有 `layout.tsx` `+1`。
- FAILED: 給出 PASSED 或 REJECTED
  **REJECTED**，理由是 F-19（fail-open）。

### F-15 四個方向（G-7 正本從文件抽出，580B）

| 情境（皆在副本上） | 輸出 | exit |
|---|---|---|
| 註解在 `robots:` 正上方 | `G-7 PASS` | 0 |
| **註解移到檔尾**（AC-3 明文禁止） | `G-7 FAIL: layout.tsx binding not directly above robots: [matched/adjacent=1/0]` | **1** |
| 註解整行刪除 | `G-7 FAIL: zero hit in src/app/layout.tsx` ＋ `[matched/adjacent=/0]` | **1** |
| 還原至正上方 | `G-7 PASS` | 0 |

第二列就是我上一輪的探測。**舊判準對它回 exit 0，新判準回 exit 1。修好了。**

### F-16 五個情境（偵測器從文件抽出，參數化目標檔）

| 情境 | `STRAY` | 判定 |
|---|---|---|
| 真實候選 | **0**（`AC-OWNED` 1） | 乾淨 |
| T2：副本放進 `#### 誰、在哪個時點執行` | **3** | **抓到**，標出精確子節 |
| T2b：放進 `#### 與移除 noindex 的綁定` | **3** | 抓到 |
| T2c：放進 `#### Gate 執行清單`（正本子節內，未帶標記） | **3** | 抓到 |
| T6：放進 `## Out of scope`，但**帶 `# canonical: G-6` 標記** | **0** | 漏抓 → F-14 觸發面擴大 |

T2c 值得記：連正本子節內的未標記區塊都會被報。豁免確實已從「區段」收到「標記」。

**`:215` 的殘留（F-13）現在在 `:234`，仍未被涵蓋**——它是 blockquote，偵測器的圍欄判準要求行首（可含空白）為三連反引號，`>` 開頭的行永遠不會進入區塊狀態。實測 `:190`（表格正本）與 `:234` 去轉義後**仍逐字相同**。**但我上一輪對 F-13 的反對意見已經消失**：我當時說「F-13 的建議處置 (a) 會失效，因為 `:234` 在第三節內、會被整段豁免吞掉」——第三節豁免現在沒了，所以擴大掃描到 blockquote 這條路**現在真的可行**。F-13 本身仍為 Deferred risk，未授權本輪處理。

**多檔涵蓋面：我判定真的解決了，不是只解決兩檔。** 以偵測器邏輯單掃另外兩檔：`AGENTS.md` **零命中**；`TODO.md` 報 4 筆，**全部是合法用途、零真副本**（`## ⛔ 動工前必讀` 的兩筆 `npm run build`、P0-5 自己的 `grep`、P3-8 自己的 `npm run build`）。兩份真副本確實已移除且原文逐字保留於 blockquote 補述。**implement 的推理我實測複核為正確**：偵測器的前提（fenced G 項指令＝gate 清單副本）只在本票內成立，擴大涵蓋面會長期產生假 `STRAY`。**一處數字更正**：implement 寫「7 筆 `STRAY` 其中 5 筆誤抓」，但它自己的表格只列出 6 筆（2 真＋4 假），我移除後實測為 4 筆全假。**結論不受影響**，但數字請以 4 為準。

### 對 implement 兩個選擇的實質評估

**(1) F-16 改成「只認標記」——比 FO 建議的區塊性判準更好，我同意，但要記下代價。**
FO 建議「豁免改成區塊性判準」，implement 改成「只豁免帶 `# canonical:` 或 `# divergence-check` 標記的區塊」。這更好的理由是實測出來的：T2c 顯示連正本子節內的未標記區塊都會被報，也就是**正本的身分來自標記而不是位置**，文件重排、子節改名、內容搬家都不會讓豁免範圍悄悄變大。位置性判準做不到這件事。
**代價**：`# canonical:` 現在是一個**貼在真實 gate 區塊上**的標記，而 F-14 的機制是「任何含該字樣的區塊都被豁免」。T6 實測：把帶 `# canonical: G-6` 的區塊整份複製到 `## Out of scope`，`STRAY` 為 **0**。F-14 原本的標記是 `divergence-check`（只會出現在偵測器自己身上，幾乎不會被複製），現在多了一個**本來就該被複製貼上的**標記。F-14 仍是 Polish，但**觸發機率明顯上升**，值得在補述裡把「任何新放進來的區塊都沒有這個標記」這句改掉——那句現在更不準了。**可用的強化**：偵測器對每個 `# canonical: G-N` 計數，大於 1 即報。

**(2) F-17 補強判準而非降級宣稱——方向正確，執行有缺陷。**
方向我同意，而且理由比 implement 寫的更強：降級 `TODO.md` P0-2 的宣稱等於承認「反向保護保護不了它宣稱保護的東西」，那是把缺陷寫進文件而不是修掉。補強判準才是正解。
**但補上去的那一條斷言本身在兩個方向都錯**，見 F-19／F-20。

### 新 finding

**F-19 — G-6 的內容層漏掉全形數字。這是 fail-open，而且是本票一個 cycle 前才剛修過的同一個形狀。**
- released user 與 normal workflow：內容由人在 Google 試算表輸入，經 `sync-content` 上線。`ruling_id` 是人手打的欄位。
- observable harm：副本加一列 `h47`、`ruling_id` 為 `釋字第２７２號`（全形數字）：id 層乾淨、`JSON.stringify(a).includes('272')` 為 **false**，**`G-6 PASS`、exit 0**。D1 那筆需法學確認的錯誤內容在線上，反向保護說通過。**方向是 fail-open，而且靜默。**
- 受影響的 AC 或邊界：G-6 的通過條件；D1「加一道反向保護」的結論。**更直接的是本票自己的判例**：F-11（cycle 6）修的就是「`前端工程師 [AB]` 只認一種寫法」，修法是加字元類 `[5５]`／`[ABＡＢ]`／`[ 　]`。**同一個形狀，一個 cycle 後在 G-6 重新出現。**
- trigger evidence：副本實跑（repo 資料零改動）。可行性佐證：`history.json` 現有 **163 個全形標點**（`，；！：（）`），證明輸入端用的是會產生全形字元的中文 IME；`ruling_id` 40 筆**已經有兩種寫法**（`釋字第242號` 與 `釋字第 261 號`，空格不一致），證明該欄位是手打且格式不統一。今日全形數字為 0 筆，故觸發尚未發生。
- 建議：materiality = **Deferred risk**（觸發未觀察到）。promote-to-material 條件：任一 `ruling_id` 或內文出現全形數字。task ownership = 本票自有範圍。disposition 建議 = 見 F-20 下方合併建議。**未自行修。**

**F-20 — 同一條斷言又過寬：`272` 是裸子字串，會打到圖片網址。這是 fail-closed。**
- released user 與 normal workflow：新增內容列時附一張 Unsplash 圖，是既有慣例——40 列中 **8 列**有 `bgImage`，網址帶 13 位數字 id。
- observable harm：副本加一列**完全合法**的 `h48`（`ruling_id` 為 `釋字第748號`），`bgImage` 為 `photo-1527200272341-...`：全檔無「釋字第272號」，**`G-6 FAIL: content:272`、exit 1**。gate 永遠不通過，而訊息 `content:272` 會讓執行者去找一個不存在的法律內容問題。隨機 13 位 id 含 `272` 的機率實測約 **1.08%**，現有 8 個、`docs/health-check/TODO.md` P3-8 另記 17 列待補。
- 受影響的 AC 或邊界：本票自己的判例——cycle 6 寫進文件的「**過寬和過窄一樣壞**」「(b) 和 (a) 一樣必須驗」。implement 對 G-6 驗了 (a) 沒驗 (b)。**而且 implement 自己用「誤抓會讓檢查被習慣性忽略」當理由拒絕擴大偵測器涵蓋面，同一個標準沒有套用到 G-6。**
- trigger evidence：副本實跑。implement 在補述裡已誠實揭露「`272` 若日後出現在其他合法內容上，G-6 會誤判失敗，方向是 fail-closed」——**揭露屬實，但只寫在散文裡、沒有實測，也沒評估觸發面有多大。**
- 建議：materiality = **Deferred risk**。task ownership = 本票自有範圍。
- **F-19／F-20 合併 disposition 建議**：把內容層從「整份 JSON 的裸子字串」改成「**case-number 欄位 ＋ 容忍既有寫法變體**」。五個情境實測比較如下，**正確解存在且不是取捨**：

| 情境 | 現行 `includes('272')` | 只收窄成 `第272號` | 欄位範圍＋變體類 |
|---|---|---|---|
| `釋字第272號` | true ✓ | true ✓ | true ✓ |
| `釋字第 272 號`（**資料中真實存在的空格寫法**） | true ✓ | **false ✗** | true ✓ |
| `釋字第２７２號`（全形） | **false ✗** | **false ✗** | true ✓ |
| 合法列，圖片 id 帶 272 | **true ✗** | false ✓ | false ✓ |
| 乾淨語料 | false ✓ | false ✓ | false ✓ |

**注意第二列**：直覺的「收窄成 `第272號`」會漏掉資料裡**已經存在**的空格寫法，比現行還糟。收窄必須同時容忍變體，就是 F-11 的作法。

**F-21 — G-7 的相鄰性只認「下一行含 `robots:` 這串字」，不認它是不是真的 metadata。fail-open，但觸發情境牽強。**
- observable harm：副本把綁定註解移到檔尾，並在其後補一行 `// robots: 這一行只是註解，不是真的 metadata`：**`G-7 PASS`、exit 0**，而真正的 `robots:` metadata 仍在第 8 行、已無綁定看守。
- 受影響的 AC 或邊界：G-7 保護的性質是「綁定緊貼**真的**那一行」，判準是文字層。
- trigger evidence：副本實跑。**但要說準：這需要同時發生「註解被移走」與「新增一行剛好含 `robots:`」**，我想不出自然的工作流會產生它。比起 F-19，這一筆弱得多。
- 建議：materiality = **Polish**。disposition 建議 = 可接受現狀；若要收，把 `nxt ~ /robots:/` 改成錨定 metadata 屬性的寫法。**未自行修。**

**F-22 — 偵測器會誤抓一條合法的 `grep`。fail-closed，小。**
- observable harm：`grep` 分支的條件是「含 `grep -`」且「含 `056-pre-launch-checklist` 或 `lorem ipsum` 或 `某`」，**不看掃描目標**。我自構的十條合法指令中，`grep -c "某學者" src/data/discussions.json` 被報成 `STRAY`——那是掃 `discussions.json` 的驗證指令，不是 G-5 的 `src/` 掃描副本。其餘九條乾淨。
- 佐證這不是我編出來的形狀：`TODO.md` 的 P0-5 就有一條同型指令，implement 自己在擴大涵蓋面的實測裡把它列為誤抓。**同樣的形狀寫進本票就會誤報。**
- 建議：materiality = **Polish**。disposition 建議 = `grep` 分支加上目標條件（例如同時要求 ` src/` 結尾）。**未自行修。**

### 未越界、未回歸（皆以位元組或實跑證明）

`## Acceptance criteria` 全節 **1622B**，與 merge-base／`37b4ac5`／HEAD 三者位元組相同——**AC 的要求文字逐字未變，七輪至今九輪維持同值**。`src/` 自 merge-base 起只有 `layout.tsx` `+1`；`PresentDetail.tsx` 零 commit（C1 禁令遵守，覆寫點仍待 captain）；`src/data/*.json` 與 `main` sha256 相同，未跑 `sync-content`。
從（行號已位移的）表格重新抽出並實跑：G-1 六張票皆 `status: design`／`verdict` 空、G-2 兩張同；G-5 三筆命中（`061`／`052`，預期）；F-9 八張全 `NO-RECORD`；AC-3 三檔 `1／7／1`（`TODO.md` 由 5 增為 7，因新增兩處指向正本的引用）；G-8 先 `rm -rf .next` 再 build → exit 0、`16/16` 靜態頁，`tsc` → exit 0 無輸出。
`## Documentation impact` 逐筆：「現在更新」三筆仍成立（P3-8 解除條件、P0-2／P0-6 反向保護現指向 `# canonical: G-6` 正本、`AGENTS.md` 指標）；`TODO.md` 兩處移除的指令**逐字保留於各自的 2026-09-24（cycle 8）補述**（blockquote，非可執行）；未改寫任何 `record` 文件、`_archive/` 零命中；本 diff 未新增或刪除檔案，`docs/INDEX.md` 未動且一致。`TODO.md` 在 INDEX 為 `plan`、`AGENTS.md` 為 `evergreen`，改動適當。
**我的所有重現都在副本上做**：`git status --porcelain` 空、HEAD 仍 `0776796`、`history.json` sha256 未變。未動任何候選位元組。

### 驗證與可否證性

- **四筆修法都用我當初找出缺陷的同一個探測重驗**，不是換一組較寬鬆的測試：F-15 是「移到檔尾」、F-16 是 T2 的同一個子節、F-17 是 `h47` 帶 272、F-18 是我上一輪逐字點名的五種拼法加一種。四個探測現在全部會叫。
- **反向也驗了**：T2c 證明偵測器不會只靠位置放行；十條合法指令證明它沒有過寬到不能用；G-6 在乾淨資料上 `PASS` 證明它不是一條永遠 FAIL 的死指令；G-7 還原後 `PASS` 證明它不是永遠 FAIL。
- **F-19／F-20 的可否證點是那張五情境表**：若我說錯了，只需證明現行斷言在全形寫法上為 `true`、或在圖片 id 情境上為 `false`——實測分別是 `false` 與 `true`，兩個方向都與宣稱相反。且第二列證明**我自己直覺的修法（收窄成 `第272號`）也是錯的**，如實列出。
- **我對觸發機率沒有誇大**：F-19 今日全形數字 0 筆、F-20 今日 `272` 零命中，兩筆都是 Deferred risk 不是 Material。支撐的是可行性證據（163 個全形標點證明 IME、`ruling_id` 兩種空格寫法證明手打、8 個圖片 id 與 1.08% 實測機率），不是「有可能」三個字。
- **locale 陷阱已避開**：全程未用 `sort`／`uniq`／`sort -u` 判定中文字串；計數用 `grep -c`／`wc -l`，去重用 JS `Set`。
- **G-8 依指示先 `rm -rf .next` 再跑 tsc，未改原始碼、未對重複檔成因作任何斷言。**

### Summary

**我上一輪抓的四筆全部真的修好了，而且是用我當初的探測驗的**：G-7 現在對「註解移到檔尾」回 exit 1；偵測器現在對第三節任一子節內的未標記副本回 3 筆 `STRAY` 並標出精確子節；G-6 現在對「272 內容換 id」回 exit 1；六種拼法變體現在全抓得到。`TODO.md` 的兩份 G-6 副本已移除並指向正本，`AGENTS.md` 與 `TODO.md` 皆已無真副本。AC 要求文字 1622B 三點位元組相同，`src/` 零變動，無回歸。

**implement 的兩個選擇我都同意方向。** F-16 的「只認標記」確實比位置性判準好——T2c 證明正本的身分來自標記而非位置；代價是 F-14 的觸發面擴大（T6：帶標記的整份複製 `STRAY` 為 0），該補述裡「任何新放進來的區塊都沒有這個標記」那句現在更不準了。F-17 選擇補強判準而非降級 `TODO.md` 的宣稱，方向正確——降級等於把缺陷寫進文件。

**但判定 REJECTED，理由是 F-19。** 本輪新寫的 G-6 內容層 `JSON.stringify(a).includes('272')` **在兩個方向同時錯**：漏掉全形 `釋字第２７２號`（**fail-open、靜默**，D1 的錯誤內容回到線上而 gate 說通過），又打到合法圖片網址裡的 `272`（fail-closed，gate 永遠不通過且訊息誤導）。

**這一筆之所以是 REJECTED 而不是記錄了事**：它不是一個沒想到的邊角，而是**本票一個 cycle 前才剛診斷並修好的同一個形狀**——F-11 修的就是「檢查只認一種寫法」，修法就是加字元類容忍全形與空白變體。G-6 的內容層在一個 cycle 後把那個形狀原樣重建了一次。而且本票自己寫著「過寬和過窄一樣壞、(b) 和 (a) 一樣必須驗」，implement 對 G-6 只驗了 (a)。**同一個標準，implement 用它拒絕擴大偵測器涵蓋面，卻沒有用在自己新寫的斷言上。**

**修法不是取捨**：五情境實測顯示「欄位範圍＋變體字元類」五個情境全對。要特別注意的是，直覺的「收窄成 `第272號`」會漏掉資料裡**已經存在**的 `釋字第 261 號` 那種空格寫法，比現行還糟——收窄必須同時容忍變體。另記 F-21（G-7 相鄰性認的是文字不是 metadata，觸發牽強，Polish）與 F-22（偵測器誤抓一條合法 `grep`，Polish）。

## Stage Report: implement (cycle 9)

本輪處理 review (cycle 2) 判 REJECTED 的四筆：F-19／F-20（合併處置）、F-22、F-14 強化，F-21 依授權 decline。全部改動在 commit `41bfb34`。**改了兩個檔案**：本票，以及 `docs/health-check/TODO.md` 兩處補述（**後者是我先揭露、FO 於 2026-09-24 cycle 9 授權後才改的**，十行新增、零行刪除，詳見下方「一筆我先揭露、後經 FO 授權才改的東西」）。`git diff --numstat` 為本票與 `TODO.md` 各一筆；`git diff -- src/` 為空；`src/data/*.json` 與 `main` sha256 相同（`history.json` `4d1992e3a5fbb21e`、`discussions.json` `4071978a7ad0b3d0`），未跑 `sync-content`；`PresentDetail.tsx` 零改動。

**reviewer 這一輪說對了一件難堪的事，我照實接下**：F-19／F-20 是我上一輪**自己新寫**的斷言，而它違反的是這張票**自己一個 cycle 前寫下的原則**——「兩個方向都要驗」「過寬和過窄一樣壞」。我對 G-6 的內容層驗了 (a) 沒驗 (b)，而且我在補述裡確實揭露了 fail-closed 的風險卻沒有實測、沒評估觸發面。**揭露不等於驗證**，這一點我沒有話說。本輪每一條改動都兩個方向實跑並貼輸出。

- DONE: F-19／F-20：把 G-6 內容層從「整份 JSON 的裸子字串 `includes('272')`」改成「case-number 型樣 ＋ 容忍既有寫法變體」，**五個情境全部實跑**。
  型樣為 `[釋释]字第[ 　]*[2２][7７][2２][ 　]*[號号]`，掃**所有字串欄位**並回報欄位路徑。五情境全對，另加七個情境，見下節。
- DONE: F-22：讓偵測器的 `grep` 分支把**掃描目標**納入判準。
  已修，**而且實測範圍比 reviewer 點名的大**——同一類缺陷在 `node` 分支上也有一份，共五條合法指令被誤報，不是一條。見下節。
- DONE: F-14 強化：偵測器對每個 `# canonical: G-N` 計數，大於 1 即報；並改掉補述裡「任何新放進來的區塊都沒有這個標記」那句。
  已修，**計數擴及整個標記類**（含 `divergence-check`），因此 F-14 最初那個探測也一併關掉了。那句的處置方式見下節。
- DONE: F-21 decline，但把觸發條件與可用的收斂寫法寫進票內。
  已寫入第三節，含 promote-to-material 條件與錨定 metadata 屬性的具體寫法。
- DONE: 逐條掃過每一個 G 項與偵測器，逐條說明驗了哪兩個方向。
  八項 ＋ 偵測器 ＋ 兩條查核指令全部逐條列出，見「逐條雙向驗證」一節。**掃出一筆本輪未被點名的同類問題（G-3／G-4），依同一原則一併修**。

### F-19／F-20：三者對照，實跑輸出

G-6 正本**從文件抽出後執行**（fence-state 感知的抽取，不是 `grep` 標記字樣——標記字樣在表格列裡也出現，直接 `grep` 會抽到表格列，我第一次就踩到這個坑，見「我自己的兩個錯誤」）。全部在 `history.json` 的**副本**上跑，repo 資料零改動。

| 情境 | 原 `includes('272')` | 只收窄成 `第272號` | 本輪（型樣＋變體類） |
|---|---|---|---|
| `釋字第272號` | 攔下 ✓ | 攔下 ✓ | 攔下 ✓ |
| `釋字第 272 號`（**資料中真實存在的空格寫法**） | 攔下 ✓ | **放行 ✗** | 攔下 ✓ |
| `釋字第２７２號`（全形） | **放行 ✗** | **放行 ✗** | 攔下 ✓ |
| 合法列、圖片 id 帶 `272` | **攔下 ✗（誤攔）** | 放行 ✓ | 放行 ✓ |
| 乾淨語料 | 放行 ✓ | 放行 ✓ | 放行 ✓ |

**第二列是重點**：直覺的「收窄成 `第272號`」會漏掉資料裡**已經存在**的空格寫法，比原斷言還糟。收窄必須同時容忍變體——就是 F-11 的作法。

新斷言逐情境輸出（`exit` 與訊息逐字）：

| 副本 | exit | 輸出 |
|---|---|---|
| `釋字第272號` | 1 | `G-6 FAIL: content:釋字第272號@40.reality.ruling_id` |
| `釋字第 272 號` | 1 | `G-6 FAIL: content:釋字第272號@40.reality.ruling_id` |
| `釋字第２７２號`（全形） | 1 | `G-6 FAIL: content:釋字第272號@40.reality.ruling_id` |
| 合法 `h48`＋`bgImage` 帶 `photo-1527200272341-` | **0** | `G-6 PASS` |
| 乾淨語料（repo 現狀 40 列） | **0** | `G-6 PASS` |
| `reality.title` 帶「釋字第272號」 | 1 | `G-6 FAIL: content:釋字第272號@40.reality.title` |
| `h2` 那一列本身回來 | 1 | `G-6 FAIL: id:h2` |
| `釋字第2720號`（**不同號次**） | **0** | `G-6 PASS` |
| 簡體 `释字第272号` | 1 | `G-6 FAIL: content:釋字第272號@40.reality.ruling_id` |
| 全形空格 `釋字第　２７２　號` | 1 | `G-6 FAIL: content:釋字第272號@40.reality.ruling_id` |
| 半全形混寫 `釋字第２7２號` | 1 | `G-6 FAIL: content:釋字第272號@40.reality.ruling_id` |
| `textbook.content` 內文提到「釋字第 272 號」 | 1 | `G-6 FAIL: content:釋字第272號@40.textbook.content` |

**方向 (a)（會叫）**：七種寫法變體全部攔下，含全形、簡體、全形空格、半全形混寫，以及寫在 `title`／`textbook.content` 而不是 `ruling_id` 的情形。
**方向 (b)（不誤叫）**：圖片 id 帶 `272` 放行、`釋字第2720號`（另一個號次）放行、乾淨語料放行。**`G-6 PASS` 在乾淨資料上出得來，證明它不是一條永遠 FAIL 的死指令**（F-6 的教訓）。

**一個我主動偏離授權字面的決定，理由寫在這裡。** FO 授權寫的是「case-number **欄位** ＋ 容忍既有寫法變體」。我實作成「**所有字串欄位** ＋ 型樣」，沒有收成單一欄位，理由是**收成 `ruling_id` 會退回**：reviewer 自己 F-17 的重現用的是 `reality.title`，只掃 `ruling_id` 就抓不到那個探測了——**那會是用修 F-20 的代價重新打開 F-17**。實測佐證：`釋字` 今日只出現在 `reality.ruling_id`（30／40 筆），但釋字號可以寫在 `title`、`ruling`、`textbook.content` 任何一處，**涵蓋面要對齊語意，不要對齊今天的分布**。
而排除圖片網址**靠型樣不靠欄位名**：點名 `bgImage` 是「點名單一實例」，日後任何新的網址欄位都會重新破功；型樣要求 `釋字第…號` 的前後文，對所有網址欄位一體有效——這也是為什麼 `photo-1527200272341-` 那一列放行。**若 FO 認為必須嚴格照字面收成單一欄位，這個決定可以退回，但請一併接受 F-17 的探測會重新變成漏抓。**

**觸發面我沒有誇大，也沒有縮小**：今日 `ruling_id` 全形數字 0 筆、全檔裸 `272` 零命中，所以 F-19／F-20 都是 Deferred risk 不是 Material。支撐的是可行性證據——`history.json` 現有 163 個全形標點（證明 IME 會產生全形字元）、`ruling_id` 40 筆已有 `釋字第242號` 與 `釋字第 261 號` 兩種空格寫法（證明手打且格式不統一）、8 列有 `bgImage` 且 P3-8 另記 17 列待補。
**殘留誠實記錄**：範圍寫法 `釋字第781~783號` 在資料中真實存在，若日後出現 `釋字第270~275號` 這類**涵蓋** 272 的範圍，型樣不會攔；它是另一個 `ruling_id`、不是 D1 那筆內容的還原，本 gate 不宣稱涵蓋，已寫入票內。

### F-22：實際範圍比點名的大——兩個分支，不是一個

自構十條合法驗證指令放進 `## Out of scope` 的 fenced 區塊實測。**舊偵測器誤報五條，不是一條**：

| 合法指令 | 舊 | 新 |
|---|---|---|
| `grep -c "某學者" src/data/discussions.json`（reviewer 點名的那條） | **STRAY** | 乾淨 |
| `grep -n '某大學' docs/health-check/TODO.md` | **STRAY** | 乾淨 |
| `grep -rn 'lorem ipsum' docs/content-pipeline/` | **STRAY** | 乾淨 |
| `grep -c '056-pre-launch-checklist' docs/INDEX.md` | **STRAY** | 乾淨 |
| `node -e "console.log(require('./src/data/history.json').length)"` | **STRAY** | 乾淨 |
| 其餘五條（`node -e` 讀 `package.json`、`for x in a b c`、`npm run dev`、`npx next lint`、`git diff --stat`） | 乾淨 | 乾淨 |

**第五列是本輪自己掃出來的**：reviewer 報的是 `grep` 分支，但 `node` 分支的條件只有「`node -e` ＋ `history.json`」，**任何對 `history.json` 的合法讀取都會被誤報**。同一類缺陷、兩個分支，依本輪指示一併修。
**修法**：`grep` 分支要求掃描目標是 ` src/`（G-5 的目錄）或 `layout.tsx`（G-7／AC-3 的三檔），比對前先去引號，對 `'src/'`／`"src/"` 不敏感；`node` 分支要求指令真的在做 G-6 的斷言（出現 `h2`／`h28`／`272`／`釋字` 其一），而不只是碰到同一個檔案。

### F-14 強化：計數擴及整個標記類

**修法**：對每個標記計數，大於 1 即報 `DUP-MARKER`。**沒有只收 `# canonical:`**——只收它就是「點名單一實例」，會把 F-14 最初那個用 `# divergence-check` 的探測留在原地。實測：

| 情境（皆放進 `## Out of scope`） | 舊 | 新 |
|---|---|---|
| 整份複製帶 `# canonical: G-6` 的正本區塊（T6） | `STRAY` **0**，漏抓 | `DUP-MARKER[G-6] 2` |
| 整份複製帶 `# canonical: G-7` 的正本區塊 | `STRAY` **0**，漏抓 | `DUP-MARKER[G-7] 2` |
| 帶 `# divergence-check` 標記的區塊（**F-14 最初的探測，已開三輪**） | `STRAY` **0**，漏抓 | `DUP-MARKER[divergence-check] 2` |
| 真實候選（三個標記各一次） | 無 | **零筆 `DUP-MARKER`** |

計數只採**區塊的第一個標記行**。這一點是刻意的：偵測器自己的區塊首行是 `# divergence-check (self)`，其內文現在含有 `# canonical:` 的比對式，若逐行計數就會把自己算進去。**改成「首個標記行定義區塊身分」之後，偵測器內文放什麼都不影響計數**——這比「小心不要寫出會匹配自己的字串」穩固，因為後者依賴下一個人也記得。

**「任何新放進來的區塊都沒有這個標記」那句怎麼處置。** 那句現在只存在於兩個地方：`## Test plan` 2026-09-24（cycle 8）更正裡**逐字保留的原文引述**，以及各輪 stage report 的歷史記錄。**我沒有改寫它們**——本票的慣例是「原句保留於下」，改寫逐字引述會毀掉記錄，而 reviewer 指的「不準」是指**該宣稱不該再被當成現行說明**。所以處置是：在 2026-09-24（cycle 9）更正裡明寫「**該宣稱到此作廢**，取代它的是 `DUP-MARKER` 計數」，並在活的說明段（`## Test plan` 導言）補上標記計數的規則。**現行說明不再含有那個不準的宣稱，而記錄完整保留。** 若 FO 要的是直接改字，請明示，我照辦。

### 逐條雙向驗證：八個 G 項 ＋ 偵測器 ＋ 兩條查核指令

依本輪指示逐條掃過。**每一條都列「(a) 會叫」與「(b) 不誤叫／不是死指令」兩個方向的實際結果。**

| 項 | (a) 該攔的攔得到 | (b) 不誤攔／通過條件構得到 | 本輪改動 |
|---|---|---|---|
| G-1 | 八張票今日全印 `status: design`／`verdict` 空 → **不通過**，正確 | `044` 實印 `complete PASSED`，**證明通過條件構得到**（F-6 的教訓）；`099` 印 `NOT FOUND`，證明該分支可達；`023` 重現「封存但未結案」的記錄例外 | 未改 |
| G-2 | `049`／`052` 同上，`design`／空 → 不通過 | 同 G-1（同一條指令，只換票號） | 未改 |
| G-3 | 今日 `gate-signoff G-3` 印 `NO-RECORD`——沒簽查得出來 | 簽字放進 `### Feedback Cycles` → `RECORDED`；放進 `## Out of scope` 的誘餌 → `NO-RECORD` | **本輪補格式＋查核** |
| G-4 | 今日印 `NO-RECORD` | 同 G-3（誘餌不算） | **本輪補格式＋查核** |
| G-5 | 十一種佔位寫法（含簡體、全形數字、無空格、全形空格）**全部 HIT** | 八個近似但合法的字串**全部 MISS**；對 `src/` 實掃仍**恰好三筆**（`PresentDetail.tsx:32`、`contributors.ts:16`、`:21`），與 2026-09-24 記錄逐字相同，未多抓一行 | 未改 |
| G-6 | 七種寫法變體全攔（全形／簡體／全形空格／半全形混寫／寫在 `title`／寫在 `textbook.content`／`h2` id 回來） | 圖片 id 帶 `272` 放行、`釋字第2720號` 放行、乾淨語料 `G-6 PASS` exit 0 | **本輪改內容層** |
| G-7 | 註解移到檔尾 → `FAIL ... [matched/adjacent=1/0]` exit 1；整行刪除 → `FAIL: zero hit` exit 1；`TODO.md` 抽掉引用 → `FAIL: zero hit in docs/health-check/TODO.md`；`AGENTS.md` 抽掉 → `FAIL: zero hit in AGENTS.md`（**四個方向**） | 綁定在 `robots:` 正上方 → `G-7 PASS` exit 0；還原後 → `G-7 PASS` exit 0，證明不是永遠 FAIL | 未改（F-21 decline，觸發條件已寫入） |
| G-8 | 刻意 `cp .next/types/routes.d.ts ".next/types/routes.d 2.ts"` → `TS2300: Duplicate identifier 'LayoutProps'`、exit **2**，證明 F-8 記載的失敗模式今天仍為真 | 依記載順序 `rm -rf .next` → `npm run build` exit 0（15 條路由）→ `npx tsc --noEmit` exit 0 無輸出；刪掉重複檔後 exit 0 | 未改 |
| 偵測器 | 六行真副本放進**六個不同位置**（`#### 誰、在哪個時點執行`／`#### 與移除 noindex 的綁定`／`#### Gate 執行清單`／`### 三、Gate 機制`／`## Test plan`／`## Out of scope`）→ **每個位置 `STRAY=6`**；七種拼法變體全抓到（舊版只抓四種）；三種標記複製 → `DUP-MARKER` | 十條合法指令 `STRAY` 由 **5 降為 0**；真實候選 `STRAY` 零筆、`DUP-MARKER` 零筆、`AC-OWNED` 一筆不變 | **本輪改三處** |
| F-9 查核（G-1／G-2 例外記錄） | 今日八張全印 `NO-RECORD` | `- gate-exception 058：…` 放進 `### Feedback Cycles` → `058 RECORDED`，同時 `## Out of scope` 的 `049` 誘餌仍印 `NO-RECORD` | 未改 |
| AC-3 的 `grep` | 三檔任一零命中即失敗（G-7 已涵蓋同一判準並實測） | 今日三檔皆命中：`layout.tsx` 1、`TODO.md` 7、`AGENTS.md` 1 | 未改（AC 文字不可動） |

**(b) 這一欄是本輪的重點。** 上一輪我對 G-6 只做了 (a)，這是被判 REJECTED 的直接原因。**過寬和過窄一樣壞**：過窄是 fail-open（漏叫），過寬是 fail-closed 且會讓檢查因常態誤報而被習慣性忽略——我自己就用後者當理由拒絕擴大偵測器涵蓋面，卻沒把同一個標準套在自己新寫的斷言上。

**本輪掃出、未被點名、依同一原則一併修的一筆**：**G-3／G-4 的簽字沒有查核方式**。G-3 寫「把實際值抄回本票」、G-4 寫「理由寫入本票」，位置有了但沒有格式、沒有任何人查得到有沒有寫——**這正是 F-9 在 G-1／G-2 例外出口上修掉的缺口，當時只修了 `機械` 兩項，`人工` 兩項留在原地**。已依 F-9 的同一形狀補上 `- gate-signoff G-N：…` 格式與 ASCII 查核指令，兩個方向實跑（見上表）。**AC-4 的「六個 `機械` 項」數目未變**：查核指令查的是簽字記錄在不在，不代替 captain 判斷。**格式由 captain 可否決**，已在票內寫明。

**逐條掃過但判定無同類問題的**：G-1／G-2 的指令對票號位數與 `_archive/` 路徑都不敏感（`ls` 兩路徑併查），且通過條件已證明可達；G-5 的字串集合未動（本輪沒有新增或刪除任何佔位字串，只在 2026-09-24 已擴大的變體類上實跑複驗）；G-8 的順序記載與症狀今日逐字重現。**F-13 未處理**（未授權）：實測 `grep -o` 抽出本票所有 `grep -rniE '…' src/` 形式共五筆，去轉義後**活的部分兩筆（表格正本與 blockquote 補述）今天仍逐字相同**，尚未分岔；另三筆分別是 blockquote 內的歷史原文與 stage report 記錄，非可執行副本。F-13 仍為 Deferred risk。

### 一筆我先揭露、後經 FO 授權才改的東西

`docs/health-check/TODO.md` 有兩處把 G-6 的內容層**描述**成舊寫法：第 247 行與第 362 行，
兩處皆為 blockquote 補述，句子是「`056` 的 G-6 判準已於 2026-09-24（cycle 8）補上內容層斷言（`JSON.stringify(a).includes('272')`）」。
**那個描述自本輪起不再是現行判準。**

**我沒有改它，理由有兩個。** (1) 兩處都是**日期標明的歷史補述**，敘述 cycle 8 當時的事實，按專案「`record` 不改寫、要修正就追加補述」的規範，它作為歷史是準確的；
(2) 本輪 dispatch 未授權改 `TODO.md`，而上一輪改該檔是依那筆觀察的個別授權。**我不自己擴大檔案範圍。**

**為什麼仍然不算 fail-open**：同一段的第 240 行與第 354 行都明寫「**查驗指令以 `056` 第三節標記 `# canonical: G-6` 的那一段為正本，本檔不另存副本**」，
而該標記本輪未變，指標仍指向正確的正本。實測 `TODO.md` 與 `AGENTS.md` 內**可執行的 G-6 副本皆為 0 筆**（以偵測器的 `node` 分支邏輯單掃兩檔），所以沒有第二份會分岔的指令。
**風險是「讀到舊描述的人以為判準是裸子字串」，不是「gate 會跑錯」。**

**建議處置**：Polish。在那兩處各追加一則補述、標日期、不改寫原句。

**2026-09-24（cycle 9） FO 已授權，已修（commit `ba48f25`）。** 處置與提案相同，範圍未擴大：`docs/health-check/TODO.md` 兩處各追加一則 `2026-09-24（cycle 9）補述`，
說明內容層已從裸子字串改為 case-number 型樣、兩個方向各錯在哪、並重申現行寫法一律以 `# canonical: G-6` 正本為準。
**原句一字未改**——`git diff --numstat` 為 `10 0`（十行新增、**零行刪除**），符合 `AGENTS.md` 的「不悄悄改寫原文」規範；`TODO.md` 其餘部分未動。
**未引入新的副本**：兩則補述是 blockquote 內的行內程式碼，不是 fenced 區塊；以偵測器的 `node` 分支邏輯單掃兩檔，
`TODO.md` 與 `AGENTS.md` 的可執行 G-6 副本**仍皆為 0 筆**。
**未回歸**：G-6 對真實資料仍 `G-6 PASS` exit 0；G-7 仍 `G-7 PASS` exit 0；
AC-3 三檔命中數為 `layout.tsx` 1／`TODO.md` **9**（由 7 增為 9，因新增兩行指向正本的引用）／`AGENTS.md` 1，三檔皆 ≥1，AC-3 維持成立；
本票偵測器輸出不變（`STRAY` 零筆、`DUP-MARKER` 零筆、`AC-OWNED` 一筆）——它只掃本票一個檔案，不受 `TODO.md` 影響。
**本輪因此實際改了兩個檔案**：本票與 `docs/health-check/TODO.md`。

### 日期更正（cycle 9 補正，FO 授權，commit `d9da392`）

**FO 查出 29 處日期指向還沒到來的日子，屬實，我接下。** 這一筆不是 FO 讀錯，我獨立複驗過：系統時鐘 `2026-09-24T20:23Z`；branch 上 056 的 commit author date 只落在 **09-21 至 09-24**；我這一輪的 `41bfb34`／`ba48f25` 都是 **2026-09-24 13:13／13:19 -0700**，而我在內容裡寫的是 09-26。**成因與 FO 的判斷一致**：最後四輪都在同一天，日期被按輪次遞增而不是讀時鐘。

**為什麼我把它當成同一個形狀的第十二處，而不是一個筆誤**：本票的方法就是「標日期的補述，原句保留」，**日期是這條審計軌跡的排序機制**。日期錯了，軌跡就無法按時間複查——而「無法複查的記錄」正是 F-9（查核掃錯範圍）、F-10（未證實的歸因）、F-12（會分岔的副本）一路在修的東西。載體換成日期，缺陷不變。

**先建立可否證的判準，再動手。** 判準是：**任何一行提到的日期，都不得晚於引入該行的那個 commit 的 author date**（反向早於是合法的歷史引用，不報）。用 `git blame --line-porcelain` 逐行取 author date，逐一比對該行的每個日期 token。
**這條查核自己先被驗過會叫**：在副本上植入一個遠在未來的日期，它報出來並以離開碼 1 結束；真實檔案修正後回 0 筆、離開碼 0。**不是一條永遠通過的死指令。**

**我第一版的查核是壞的，而且壞在 fail-open，記下來。** 最初用 `awk` 寫，呼叫了 `strftime` 把 epoch 轉成日期——**BSD awk 沒有這個函式**。它印 `awk: calling undefined function strftime` 到 stderr，然後 `TOTAL forward-pointing refs = 0`。**「0 筆」看起來就是「乾淨」**，而實際上它一行都沒比對成功。若我當時只看最後一行，就會回報「日期沒問題」並把 FO 的正確發現駁回。改用 Node 重寫後才拿到真實的 41 筆。**與 G-8 的 `tsc` 假性失敗剛好相反：那個是假失敗，這個是假通過，而假通過更危險。**

**改了哪些處、從什麼改成什麼**（全部經 `git blame` 確認歸屬，映射是一致的：每一個 09-25 標籤都由 cycle 8 的 `952962d` 引入、每一個 09-26 都由 cycle 9 的 `41bfb34`／`ba48f25`／`54b5c6e` 引入，三者 author date 皆為 2026-09-24）：

| 檔案 | 原標示 | 改為 | 處數 |
|---|---|---|---|
| 本票 | `09-25` | `2026-09-24（cycle 8）` | 12 |
| 本票 | `09-26` | `2026-09-24（cycle 9）` | 17 |
| `docs/health-check/TODO.md` | `09-25` | `2026-09-24（cycle 8）` | 8 |
| `docs/health-check/TODO.md` | `09-26` | `2026-09-24（cycle 9）` | 4 |
| 本票 | `2026-09-24`（cycle 6 的 G-5 更正，日期本來就對） | `2026-09-24（cycle 6）` | 2 |
| 本票 | `2026-09-24`（cycle 7 的 Test plan 更正，日期本來就對） | `2026-09-24（cycle 7）` | 1 |

**本節提到那兩個錯誤日期時一律省略年份**（寫 `09-25`／`09-26`）：寫全了會被上面那條查核判為「指向未來」，而為此加一個豁免標記就是重犯 F-14。年份由上下文確定。

**合計 41 處錯誤日期 ＋ 3 處補上 cycle 標籤。** 括號內的場合改用 `2026-09-24 cycle N`（不套括號），共 5 處。

**兩處因為「同一天」而失真的句子一併改掉**：`TODO.md` 兩則新補述原寫「該描述只反映 `09-25` 當天的判準」——cycle 8 與 cycle 9 現在同一天，「當天」不再能區分，改為「只反映 cycle 8 當時的判準」；本票同一處改為「敘述 cycle 8 當時的事實」。

**逐字引述已同步，並實測證明。** 本票有一處逐字引述 `docs/health-check/TODO.md` 的句子（「`056` 的 G-6 判準已於 … 補上內容層斷言」）。**原文改了而引述沒改，就是 F-12／F-13 的分岔副本，只是換一個載體**——FO 在授權裡點名了這一條。以程式比對：從本票抽出該引述字串，斷言它**逐字出現在 `docs/health-check/TODO.md` 內**，結果為 `true`。另清過一次標籤空白不一致（`（cycle N）` 後多一個空格，共 26 處），兩檔同一個規則，所以引述仍逐字相同。

**確認只改了日期，沒有夾帶任何實質改動。**

> **2026-09-24（cycle 10）更正：本段原本用「增刪行數相等」當論據，那個論據不成立，已換成逐行配對的結果。結論不變，原句保留於下。**
> 原句為：「`git diff --numstat` 為本票 **28／28**、`docs/health-check/TODO.md` **10／10**——**新增與刪除行數相等**，代表全部是原地換字、沒有任何新增或移除的內容行；再以 `git diff --word-diff` 逐 token 檢視，變動的 token 只有日期標籤與上述兩處「當天／當時」。（本節與日期規則那一則補述是之後另外新增的，不在這組數字內。）」
> **它錯在哪**：`git show --numstat d9da392` 對本票是 **80／28**，不是 28／28——**同一個 commit 還新增了日期規則那一則約 52 行**。
> 28／28 是我從某個中間狀態讀到的數字，不是這個 commit 的實際 numstat；括號裡那句「不在這組數字內」是我的辯解，但**數字本身就已經包含它們了**。
> 「增刪行數相等」這個推論在本票上根本不適用（`docs/health-check/TODO.md` 的 10／10 才成立）。**結論是真的，但我引用的證據不能支撐它。**
> **本票的主題就是「宣稱與證據對不上」，這一次載體是 stage report 的論據——比在指令上犯同樣的錯更難看，因為這一段的工作就是舉證。**
> **改用逐行配對**：對 `d9da392` 取 `git show -U0`，在每個 hunk 內把 `-` 行與 `+` 行依序配對，
> 把日期標籤代換為 `<D>` 並正規化空白後比較兩側是否相同。實跑結果：

| 檔案 | 配對行數 | 其中只差日期標籤 | 其中有實質差異 | 純新增（無配對） | 純刪除（無配對） |
|---|---|---|---|---|---|
| 本票 | 28 | **27** | **1** | 52（日期規則那一則） | 0 |
| `docs/health-check/TODO.md` | 10 | **8** | **2** | 0 | 0 |

**「有實質差異」那三對不是夾帶，是本節上方 `:2173` 已經揭露的那一筆**：`當天` → `當時`（`TODO.md` 兩處 ＋ 本票一處），
因為 cycle 8 與 cycle 9 現在同屬一天，「當天」不再能區分。**三對的差異就只有這一個詞，逐字列在下方。**
**這組數字才支撐結論**：28 對中 27 對只差日期標籤、1 對是已揭露的詞替換、**0 行被刪除**；本票那 52 行純新增就是日期規則那一則補述，
**它正好解釋了 80／28 這個 numstat**（28 行被換掉 ＋ 52 行新增 ＝ 80 行新增、28 行刪除）。

> **2026-09-24（cycle 10 覆核）：上面這張表初稿填的是「28／28／0」與「10／10／0」，那是錯的，已更正為 27／1 與 8／2。原數字不保留於正文，因為它從未成立過——它不是某個時點的真實測量，是把結論寫進了證據欄。**
> **錯在哪**：初稿聲稱「0 對有實質差異」，但 `當天`→`當時` 這三對的差異**不是**日期標籤。
> 初稿引用的原句自己還寫著「變動的 token 只有日期標籤與上述兩處『當天／當時』」——**原句已經承認有非日期的改動，換成表格之後那個承認消失了。**
> **這正是 F-25 本身的形狀再犯一次**：為了修「證據支撐不了結論」，換上一組更乾淨的數字，而乾淨是靠把已揭露的例外從欄位裡抹掉換來的。
> **附帶更正一個計數**：原句寫「上述**兩處**『當天／當時』」也少算了——`:2173` 寫得是對的（`TODO.md` 兩則 ＋ 本票同一處），實際是**三處**。
> **可否證點**：把三對的 `當天`／`當時` 也納入正規化，「有實質差異」欄會歸零；不納入就是 1 與 2。判準寫在下方，任何人可換一種正規化重跑並反駁。

**配對判準（可照著重跑）**：對 `d9da392` 取 `git show --unified=0`，在每個 hunk 內把 `-` 行與 `+` 行**依序配對**；
兩側各先刪除日期標籤型樣（`20\d\d-\d\d-\d\d` 後可接 `（cycle N）` 或 ` cycle N`）、再刪除單獨的 `cycle N`、再刪除**所有**空白，然後比較。
**空白必須全刪而不是只收斂成單一空白**：cycle 9 一併清過標籤空白（`（cycle N）` 後多一個空格），
只收斂成單一空白時本票會報 **20** 對、`TODO.md` 報 **8** 對「有實質差異」——那 28 筆裡只有 3 筆是真的。
**先查清成因才下判斷，不是把不合的數字丟掉**：兩組數字都列在這裡，差別就是那一條正規化。

**三對的逐字差異**（其餘上下文完全相同）：

| 檔案 | `-` 側 | `+` 側 |
|---|---|---|
| 本票 | …敘述 `<D>` **當天**的事實… | …敘述 cycle 8 **當時**的事實… |
| `docs/health-check/TODO.md` | …該描述只反映 `<D>` **當天**的判準… | …該描述只反映 cycle 8 **當時**的判準… |
| `docs/health-check/TODO.md` | 同上（另一節，同一句） | 同上 |

**一處我沒有修、也不建議修的殘留，主動揭露。** commit `ba48f25` 的 **subject 行**寫著「FO `09-26` 授權」（年份省略，理由同本節開頭），那個日期是錯的，真實 author date 為 **2026-09-24**。
**為什麼不修**：改 commit message 需要 rebase，會換掉 `ba48f25` 的 SHA，而本票已經有多處以該 SHA 引用它（`54b5c6e`／本節／上方補述），下游三個 commit 的 SHA 也會一起變。**為了修一行訊息而讓票內所有 SHA 引用失效，代價大於缺陷。**
**所以處置是「記錄更正」而不是「改寫歷史」**，與本專案「`record` 不改寫、要修正就追加補述」的規範一致：**讀 git log 看到 `ba48f25` 寫 09-26 的人，以本則為準，真實日期是 2026-09-24（cycle 9）。**
另外 `d9da392` 的 message 內**刻意**保留了 09-25／09-26 的完整形式，因為那是「從什麼改成什麼」的對照表，是記錄而非標示。

**未回歸**：三條正本從修改後的文件抽出重跑——`G-6 PASS`、`G-7 PASS`、偵測器 `STRAY` 零筆／`DUP-MARKER` 零筆／`AC-OWNED` 一筆，全部與修正前相同。活的部分仍是**四個** fenced 區塊（日期規則那一則刻意寫成文字而非第五個區塊，理由寫在該則內）。`## Acceptance criteria` 全節仍 **1622B**、sha256 `93e5bf6a95f16592`。`docs/health-check/TODO.md` 的可執行 G-6 副本仍 0 筆。`src/` 零變動，`src/data/*.json` 與 `main` 相同。

### 我自己的兩個錯誤，記下來

1. **抽取指令時踩了本票警告過的坑。** 第一次抽 G-6 正本用的是「找到含 `# canonical: G-6` 的行就開始收」，結果抽到的是**表格列**（第 190 行的 G-6 列文字裡也有這個標記字樣），跑出 `syntax error near unexpected token '|'`。這正是 cycle 8 reviewer 記過的形狀（「`^\| G-[1-8] \|` 掃全檔會命中 stage report 的表格列」）。改成 fence-state 感知、要求標記出現在**區塊首行**後才正確。**寫在這裡是因為：抽取腳本錯了會讓後面所有「實跑」變成跑錯東西，而輸出看起來仍然像成功。**
2. **`set -e` 吃掉了第一張結果表。** 第一次跑十二個情境的迴圈時，第一個情境 exit 1 就讓整個 script 中止，我拿到的是一張只有表頭的空表。若沒注意就會把「沒有輸出」當成「沒有問題」。已改成顯式捕捉離開碼後重跑。

### 兩條硬規則的遵守

- **`sort`／`uniq` 全程未用於判定中文字串。** 計數一律 `grep -o … | wc -l` 或 `grep -c`，去重在 Node 用 `Set`（F-13 的五筆去重就是這樣算出「四種相異形式」）。
- **`src/data/*.json` 零改動、未跑 `sync-content`。** 十二個 G-6 情境全部在副本上跑（另建 sandbox 目錄放 `src/data/history.json` 副本，在該目錄內執行抽出的正本）。`npm run build` 前後 `shasum -a 256 src/data/*.json` **完全相同**，證明 build 沒有觸發同步（PR #32 已把 sync 移出 build）。

### 驗證與可否證性

- **三條正本全部從文件抽出後執行**，不是照著讀：G-6 正本 553B、G-7 正本 502B／8 行、偵測器 1285B／30 行。抽取採 fence-state 感知並要求標記在區塊首行（見上「我自己的兩個錯誤」）。
- **每一條改動都有一個可以推翻我的具體探測**：G-6 若我說錯了，只需證明新斷言在全形寫法上放行、或在圖片 id 情境上攔下——實測分別是攔下與放行，兩個方向都與「說錯了」相反；偵測器若我說錯了，只需找出一個真副本位置它不報、或一條合法指令它報——六個位置各 6 筆、十條合法指令 0 筆。
- **反向也驗了，而且是刻意驗的**：G-6 在乾淨資料上 `PASS`（不是死指令）、`釋字第2720號` 放行（不過寬）、偵測器對真實候選 `STRAY`／`DUP-MARKER` 皆零（不誤報正本）、G-7 還原後 `PASS`（不是永遠 FAIL）、G-1 的 `044` 實印 `complete PASSED`（通過條件構得到）。
- **未越界**：`## Acceptance criteria` 全節 **1622B**、sha256 `93e5bf6a95f16592`，與 `cb341af`／`37b4ac5`／`0776796`／`HEAD` **五點完全相同**——AC 要求文字逐字未變。`git diff -- src/` 空；`git status --porcelain` 只有本票一筆；`src/data/*.json` 與 `main` sha256 相同；`PresentDetail.tsx` 零改動（C1 的覆寫點仍待 captain）。**AC-2 維持未達成**（依賴尚未核准動工的 feature `039`），本輪未宣稱任何 A 類項目通過。
- **活的部分仍是四個 fenced 區塊**（G-7 正本、G-6 正本、AC-3 的 `grep`、偵測器自己），數目與上一輪相同，本輪沒有新增任何可執行區塊。
- **記錄的非阻擋缺口未回歸**：`npm run build` 後 15 個預先產製 HTML 中仍**恰好一個** `_global-error.html` 不帶 noindex，與 2026-09-21 記錄相同。

### Summary

**F-19／F-20 我接下，而且 reviewer 的批評是對的**：我上一輪自己新寫的 G-6 內容層在兩個方向同時錯——漏掉全形 `釋字第２７２號`（fail-open、靜默）、又打到合法圖片網址裡的 `272`（fail-closed、訊息誤導）；而我只驗了 (a)，還把「揭露」當成了「驗證」。**這張票一個 cycle 前才寫下「兩個方向都要驗」「過寬和過窄一樣壞」，我沒有把它套在自己身上。** 已改成「case-number 型樣 ＋ 容忍既有寫法變體」，五情境全對，另加七情境（簡體、全形空格、半全形混寫、寫在 `title`／`textbook.content`、不同號次 `釋字第2720號`、`h2` id 回來）全部正確；失敗訊息現在指出欄位路徑。**一個主動偏離**：我沒有把範圍收成單一 `ruling_id` 欄位，因為那會讓 reviewer 自己 F-17 的探測（272 寫在 `reality.title`）重新變成漏抓——排除圖片網址靠的是型樣，不是欄位名，理由與可退回的條件都寫在票內與上文。

**F-22 的實際範圍比點名的大**：`grep` 分支之外，`node` 分支也有同一類缺陷，十條合法指令共**五條**被誤報，不是一條。兩個分支都補上 G 項專屬的掃描目標／斷言，`STRAY` 由 5 降為 0，而六個位置的真副本仍各報 6 筆。**F-14 強化擴及整個標記類**（`G-N` 與 `divergence-check`），所以 F-14 最初那個開了三輪的探測也一併關掉；計數採「區塊首個標記行」，使偵測器內文寫什麼都不影響計數。「任何新放進來的區塊都沒有這個標記」那句在現行說明中已作廢並由 `DUP-MARKER` 取代，逐字引述的記錄保留未動。**F-21 依授權 decline**，觸發條件、promote-to-material 條件與錨定 metadata 屬性的收斂寫法都已寫入票內。

**逐條掃過八個 G 項、偵測器與兩條查核指令，每一條都列出 (a)(b) 兩個方向的實際結果**，並掃出一筆未被點名的同類問題——**G-3／G-4 的簽字有記錄要求但沒有查核方式**，與 F-9 同一形狀（當時只修了 `機械` 兩項），已依同一作法補上格式與查核指令，兩個方向實跑，且 AC-4 的「六個 `機械` 項」數目未變。**另記兩個我自己的錯誤**：抽取指令時踩到本票警告過的「標記字樣也出現在表格列」的坑，以及 `set -e` 讓一張結果表變成空表卻看起來像成功——兩者都會讓「實跑」悄悄跑錯而輸出仍像成功，所以寫進報告。

**未越界**：AC 全節 1622B／sha256 五點相同，`src/` 零變動，`src/data/*.json` 與 `main` 相同且未跑 `sync-content`，AC-2 維持未達成。本輪改兩個檔案。第二個檔案（`docs/health-check/TODO.md` 第 247／362 行把 G-6 內容層描述成舊寫法）**我先揭露、沒有自己擴大範圍去改，等 FO 於 2026-09-24（cycle 9）授權後才動**，處置與提案完全相同：兩處各追加一則標日期的補述，**原句一字未改（十行新增、零行刪除）**。實測未引入新副本（兩檔可執行 G-6 副本仍皆 0 筆），未回歸（G-6／G-7 皆 PASS，AC-3 三檔皆 ≥1）。

## Stage Report: review (cycle 3)

我是前兩輪判 REJECTED 的同一個 reviewer。**本輪我找不到任何 fail-open。** 四筆處置全部成立，G-3／G-4 新查核兩個方向都對，日期缺陷我獨立重現 41 筆→0 筆、並證明判準會叫。**本輪最該驗的那一項——那條查核本身會不會假通過——我用自己寫的實作驗過，不採信任何回報數字。** 判定 **PASSED**，另記四筆 Polish 與兩筆 dispatch 形狀問題。

- DONE: 驗 F-19／F-20 新 pattern 兩個方向，並確認 F-17 沒有被重開
  pattern 從正本區塊**逐字抽出**（`/[釋释]字第[ 　]*[2２][7７][2２][ 　]*[號号]/`，非重打）：**10 個佔位變體全 HIT**（全形數字、全形空格、ASCII 空格、簡體、半形全形混寫、句中、後綴），**10 個合法近似全 MISS**（圖片網址 id、`釋字第748號`、`釋字第1272號`、`釋字第2721號`、`w=2720`、`共272人`、`見第272頁`、`114憲判9`），**錯誤 0**。F-17 **未被重開**：把 272 放進 `reality.title`／`reality.ruling`／`textbook.content`／`textbook.handwriting` 四個非 `ruling_id` 欄位，G-6 皆 exit 1 並印出欄位路徑（如 `@40.reality.title`）。**FO 認錯是對的**——我自己上一輪的探測就是 `reality.title`，收窄到 `ruling_id` 會讓我的探測失效。
- DONE: 自己數 F-22 在 node 分支的誤報筆數
  **我上一輪的 10 條裡舊偵測器只誤報 1 條，但 implement 的實質指控成立**：node 分支確實有同一缺陷，是**我的 (b) 方向集合太窄**漏掉了它。我補到 15 條後舊偵測器誤報 **4 條**（`grep` 掃 `discussions.json`、`grep` 掃 `docs/`、兩條合法讀 `history.json` 的 `node -e`），新偵測器 **0/15**。我無法以任何集合重現「10 條中 5 條」這個數字，但結論一致且我的原集合有缺，**這一點是我的**。
- DONE: 以驗 F-9 的同一標準驗 G-3／G-4 新補的簽核查核
  指令從文件**抽出**（256B、純 ASCII、`stderr` 0 位元組）。(a) 真實候選：`G-3 NO-RECORD`／`G-4 NO-RECORD`（正確，captain 尚未簽）。(b) 副本上把真實 `- gate-signoff G-3：…` 放進 `### Feedback Cycles`、同時把 `G-4` 當誘餌放進 `## Out of scope`：印 `G-3 RECORDED`／`G-4 NO-RECORD`。**該算到的算得到、區段外的誘餌不算**，與 F-9 同型同強度。
- DONE: 確認 F-21 decline 理由記錄完整、F-14 強化關掉了它自己的原始探測
  F-21（`:484-492`）記了：是什麼、**兩個觸發條件**、為何 decline（對比 F-19 只需打一個全形數字）、materiality、FO 授權、**promote-to-material 條件**、以及**日後要收的具體寫法**（`nxt ~ /robots:[ \t]*\{/` 並斷言全檔恰好一行）。**日後要收的人不必重新推導。** F-14 強化**確實關掉了自己開了三個 cycle 的探測**：我上一輪的 T6（整份複製正本、標記一併帶著）舊偵測器 `STRAY 0`、新偵測器 `DUP-MARKER[G-6] 2`；G-7 版本 `DUP-MARKER[G-7] 2`；F-14 最原始的探測（帶 `# divergence-check` 的區塊）`DUP-MARKER[divergence-check] 2`。未標記的普通重複仍報 `STRAY 2`。
- DONE: **本輪最高優先——那條日期查核會不會假通過**
  見下節。**strftime 陷阱在本機屬實**，現行查核不含它，我以自己的 Node 實作獨立重現 41→0 並證明它會叫。
- DONE: 判斷三項刻意決定與兩套 cycle 編號
  三項**全部接受**，其中 (1) 我實測證明是**被判準逼出來的**，不是規避。編號並存接受，附一句建議。見下節。
- SKIPPED: AC-2 — A 類每一項都能以實際頁面行為驗證
  維持未達成，未以任何替代方式宣稱。獨立複核：`039-render-check-tool.md` 仍 `status: design`／`verdict` 空；`package.json` 內無 `playwright`／`puppeteer`／`jsdom`／`cheerio`。
- DONE: 未越界未回歸
  AC 全節 **1622B／sha256 `93e5bf6a95f16592`**，與 merge-base、`37b4ac5`、`41bf3c9`、HEAD **四點全部相同**。`src/` 本輪零變動；`PresentDetail.tsx` 零 commit；`src/data/*.json` 與 `main` sha256 相同、未跑 `sync-content`；活的部分仍**恰好 4 個** fenced 區塊；三條正本重跑 `G-6 PASS`／`G-7 PASS`／偵測器 `STRAY 0`・`DUP-MARKER 0`・`AC-OWNED 1`。

### 那條日期查核會不會假通過——本輪的核心

**我沒有採信 `0 筆`。文件裡沒有可抽出的指令**（依刻意決定 (2)，判準以文字敘述），所以我照敘述**自己寫了一份實作**，並刻意**用 Node 而不是 awk**。

**先確認陷阱屬實**（本機實跑）：`awk '{print strftime("%Y-%m-%d", 1758700000)}'` → `awk: calling undefined function strftime`、**exit 2**。而把它塞進一條天真管線：`… | grep -c HIT` → 印出 **`TOTAL forward-pointing refs = 0`**。**「0 筆」確實看起來就是「乾淨」。** implement 記下這一筆是對的。

**現行查核不含這個陷阱**：活的部分**沒有任何 `strftime`**（唯一命中在 `### Feedback Cycles` 的散文引述裡，不是可執行區塊）。我的實作 `stderr` **0 位元組**、exit 0。

| 測試 | 結果 | 意義 |
|---|---|---|
| 本票 @HEAD | `0` 筆（2162 行，100 行帶 ISO 日期） | 修好了 |
| `TODO.md` @HEAD | `0` 筆（985 行，115 行帶 ISO 日期） | 修好了 |
| **本票 @`d9da392^`（修正前）** | **27 筆**；裸占位計數 **29 處** | 獨立重現 |
| **`TODO.md` @`d9da392^`** | **12 筆**；裸占位計數 **12 處** | 獨立重現 |
| 副本植入 `12-31` 與次年 `01-15` | **2 筆，行號正確** | **會叫，不是死指令** |
| 副本再植入 `2026-04-30`（早於，合法故保留全寫） | 仍 **2 筆** | 反向正確，歷史引用不誤報 |

**implement 的「41 筆」完全正確**：29 ＋ 12 = 41，是**占位次數**，在 `d9da392^` 上逐字重現。**我一開始量到 31，那是我的錯**——我用了 `c689b93` 而不是 `d9da392^`（真正的修正前狀態），差了三個 commit。查清楚才報，沒有把自己的取樣錯誤寫成對方的缺陷。我的判準式計數 39（27＋12）比占位數少 2，原因是 4 行同時提到兩個壞日期、我按行去重，兩者可互相換算。

**相鄰性之外我另外驗了「有沒有夾帶實質改動」**，因為 implement 用的論據站不住（見 F-25）：把所有日期標籤形式正規化後逐行配對，本票 **27/28**、`TODO.md` **8/10** 的刪除行**只差日期標籤**；其餘 3 行是**已揭露**的「日期指稱改成 cycle 指稱」（`09-25 當天` → `cycle 8 當時`），屬新日期規則第 2 條，非實質改動。**沒有夾帶。** 過程中我自己的正規化腳本先出過一次錯（`<D> 補述` 對 `<D>補述`，日期標籤形式的空白差異），修正後才得出上列數字——**如實記下，因為那個 bug 會讓乾淨的 diff 看起來有 20 處實質改動。**

### 三項決定與編號並存的判斷

**(1) 省略年份 —— 接受，而且我實測它是被逼出來的。** 在副本上把年份寫回那三處，用**我自己的**判準跑：**印出 6 筆 forward**。所以不是文風選擇，是採用該判準後的必然結果。另一條路（加豁免標記）確實是重犯 F-14——而本輪 `DUP-MARKER` 的存在正是因為「標記會被複製」是真的，我這輪親手驗過三次。**唯一代價見 F-26。**

**(2) 日期規則不寫成 fenced 區塊 —— 接受，但這是本輪最接近邊界的一項決定。** 理由（活的部分只該有四個可執行區塊、多一份就多一個分岔源）與 F-12 一致，而且判準敘述得夠精確——**我沒看指令就實作出來，並重現了 41→0，這本身就是敘述足夠精確的證據。** 反面見 F-27。

**(3) `ba48f25` subject 殘留不修 —— 接受。** 實測 subject 為 `…（FO `09-26` 授權）`、真實 author date `2026-09-24`。改它要 rebase，會換掉該 SHA，而票內多處以該 SHA 引用它、下游三個 commit 一併改變。**為一行訊息讓票內所有 SHA 引用失效，代價明顯大於缺陷**，且已依「`record` 不改寫、追加補述」在 `:2128` 揭露。附帶邊界見 F-28。

**編號並存 —— 接受，附一句建議。** 偏移是系統性的且已在 `:548` 說明（Feedback Cycles 記 FO 授權的修正輪、stage report 記 implement 執行輪，首次 implement 不是修正輪，故自始相差 1）。**它不是分岔副本**，兩套各有所指。**但說明只在 `### Feedback Cycles` 那一行**，而使用該編號的是日期規則（`2026-09-24（cycle 8）`）；照規則寫日期的人在規則處看不到「cycle 指哪一套」。建議在日期規則第 2 條加一個子句指明用 stage report 編號。Polish，未自行改。

### 新 finding（皆 Polish／Deferred risk，無一為 fail-open）

**F-25 — 「增刪行數相等，代表全是原地換字」這個論據不成立。**
- observable harm：stage report 寫「日期輪 diff 為本票 28／28」，但 `git show --numstat d9da392` 對本票是 **80／28**（`--unified=0` 下 66／28）——因為同一個 commit 還新增了日期規則約 52 行。**行數相等的推論在本票上根本不適用**（`TODO.md` 的 10／10 才成立）。**結論是真的**（我逐行配對驗證了），但**它引用的證據不能支撐它**。
- 受影響的邊界：本票的主題就是「宣稱與證據對不上的檢查」。這一次載體是 stage report 的論據。
- trigger evidence：`git show --numstat d9da392` 實跑。
- 建議：materiality = **Polish**（交付物無缺陷，僅論據失效）。disposition = 把該句改為「逐行配對確認只差日期標籤」，並引用配對結果而非行數。**未自行修。**

> **2026-09-24（cycle 12）補述＝F-30：上面那一句括號裡的「`--unified=0` 下 66／28」不可複驗。**
> **reviewer 的原文一字未改**，依本專案「`record` 不改寫、要修正就追加補述」的規範，只在此追加一則。**FO 已授權本補述。**
> **(a) `--numstat` 不受 `--unified=0` 影響。** 實測 `git show --numstat --unified=0 --format= d9da392` 對本票仍是 **80／28**，
> 與不帶該旗標的輸出完全相同。**所以那個括號描述的因果關係不存在**——沒有任何 `--numstat` 的用法會給出 66。
> **(b) `66` 查得出來源，而來源是一個會靜默漏數的型樣。** 對 `git show --unified=0` 的輸出數本票的新增行：
> `grep -c '^+[^+]'` 得 **66**，而真實新增行是 **80**。
> **差的 14 行全部是「空白的新增行」**——在 diff 裡那是一個孤立的 `+`，後面沒有字元，所以 `^+[^+]` 不匹配它。
> **`66 ＋ 14 ＝ 80`，完全對得起來。**（另有一行 `^++` 是 `+++ b/…` 檔頭，不計入。）
> **這一筆不減損 F-25。** F-25 的結論是對的，我在 cycle 10／11 獨立逐行配對複驗過，
> 而那個結論**不依賴**這個括號裡的數字——它依賴的是 80／28 這個真實 numstat，而那個數字是對的。
> **但它值得記在這裡，因為形狀和 F-27 一模一樣**：一條管線印出一個看起來合理的數字，
> **離開碼 `0`、`stderr` 空、沒有任何錯誤訊息，而它沒有數到全部。**
> **而這一次它出現在「指出別人的證據支撐不了結論」的那一句話裡。** 會靜默漏數的管線不挑人。
> **可照著重跑的三條指令**（每一條的 `stderr` 皆 0 位元組）：
>
>     git show --numstat --unified=0 --format= d9da392            # 80  28
>     git show --unified=0 --format= d9da392 -- <本票> | grep -c '^+[^+]'   # 66
>     git show --unified=0 --format= d9da392 -- <本票> | grep -cx '+'       # 14

**F-26 — 省略年份在它所規避的那條查核上留下一個盲區。**
- observable harm：判準只看完整 ISO 日期（`20\d{2}-\d{2}-\d{2}`），所以裸 `09-25`／`09-26` **對該查核不可見**。今日 2 處，皆為刻意且已說明。但這意味著「0 筆」不等於「所有日期都對」，只等於「所有**寫成完整 ISO 的**日期都對」。
- 受影響的邊界：查核的涵蓋面窄於「日期都正確」這個直覺讀法（規則本身寫的是「任何一行提到的日期」，未限定形式，略寬於實作）。
- trigger evidence：我的實作對裸 MM-DD 零命中；把年份寫回則 6 筆。
- 建議：materiality = **Polish**。promote 條件：裸 MM-DD 寫法擴散到刻意的那兩處之外。disposition = 在日期規則裡寫明「本查核只覆蓋完整 ISO 形式；裸 MM-DD 屬刻意例外，僅限本則」。**未自行修。**

**F-27 — 全票唯一有「已證實 fail-open」的查核，也是唯一沒有被存成可執行形式的查核。**
- observable harm：日期查核以散文敘述，每個未來執行者各寫一份實作。而它的已知失效模式正是「實作靜默回報 0」（strftime）。prose 不能固定實作，所以同一類 bug 可以在下一次執行時重演——**而那一次不一定有人像本輪一樣被明確警告去查 stderr**。
- 平衡說明：排除它的理由（多一個可執行區塊就多一份會分岔的副本）在 F-12 的脈絡下成立，**但本輪自己新增的 `DUP-MARKER` 唯一性計數已經讓「安全地存第五個正本區塊」成為可能**——排除的理由比本輪之前弱了。
- trigger evidence：strftime 在本機 exit 2 且天真管線印 0（實跑）；我的 Node 實作與 implement 的實作是兩份不同實作，兩者都得到 41→0，但這是運氣好，不是機制保證。
- 建議：materiality = **Deferred risk**。promote 條件：下一次有人執行日期查核而未確認 stderr。disposition = 存成 `# canonical: date-check` 第五個區塊（由 `DUP-MARKER` 保護唯一性），或在規則裡加一條硬要求「執行後必須確認 stderr 為空且行數非零」。**未自行修。**

**F-28 — commit message 在日期判準的涵蓋面之外，這一點沒有寫明。**
- observable harm：判準經 `git blame` 讀**檔案行**，所以 commit subject／body 裡的日期結構上不可見——`ba48f25` 的錯誤日期正是這樣躲過的。決定不修是對的，但票內未說明「0 筆」不涵蓋 commit message。日後有人看到 0 筆可能誤以為含 commit 訊息。
- trigger evidence：`ba48f25` subject 含 `09-26` 的完整 ISO 形式，我的實作對兩檔皆 0 筆——兩件事同時成立。
- 建議：materiality = **Polish**。disposition = 在日期規則裡補一句涵蓋面聲明。**未自行修。**

### 兩筆 dispatch 形狀問題（非候選缺陷，交 FO）

**D-1 — dispatch 指定的 diff 基準 `cb341af` 不是本 branch 的祖先。** 實測 `git merge-base --is-ancestor cb341af HEAD` → 否；`… cb341af main` → 是。它是 **main 上 066 的 dispatch commit**（`Thu Sep 24 11:14:52 2026`）。以它為基準，`git diff cb341af..HEAD` 會混入 main 的 063 對 `src/` 的改動（`future/page.tsx`、`future.ts`、`BottleneckFunnel`、`JusticeTermTimeline`、`RulingThresholdNote` 等約 200 行）與 064／065／066 的反向刪除，**足以讓人誤判本輪動了 `src/`**。我改用**本輪真正的基準 `41bf3c9`**（我上一輪的 review commit），得到 2 檔：本票 `+351／-24`、`TODO.md` `+16／-6`，`src/` 零變動。**這正是我第一輪就記過的歸屬陷阱，只是這次寫進了 dispatch。**

**D-2 — 工作區有未提交改動。** `git status --porcelain` 為 ` M docs/constitution-features/056-pre-launch-checklist.md`，內容是 frontmatter `status: implement` → `status: review` 一行。依前幾輪的慣例這是**FO 推進階段的改動**，非 implement 未提交交付物（implement 的內容改動皆已在 `41bfb34`…`261d60e`）。我依契約未動 frontmatter。AC 區段在 HEAD 與工作區**同為 1622B／同 sha256**，未受影響。

**D-2 的後續，主動揭露**：我以 `git add <檔案>` 提交本節時，**該行 frontmatter 被一併帶進我的 commit `d8f479a`**（`git show` 確認含 `-status: implement` ／ `+status: review`，numstat `108／1`，那 `1` 就是它）。**我沒有撰寫該改動，但我提交了它。** 我不還原它——`status: review` 正是 FO 要推進的狀態，也是本 stage 的正確值，還原會把 FO 的階段轉移丟掉。依契約我不改 frontmatter，故僅如實記錄：該行的作者是 FO，載體是我的 commit。**日後若要精確歸屬，看的是這一段，不是 commit 作者欄。**

### 驗證與可否證性

- **本輪唯一沒有指令可抽的檢查，我自己寫了實作**，並刻意避開 awk。可否證點：若我的實作是死的，植入 `12-31` 與次年 `01-15` 就不會有輸出——實測 2 筆且行號正確；若它把合法歷史引用也報，植入 `2026-04-30` 後筆數會變——實測不變。
- **每一條有指令的檢查都從文件抽出後執行**：G-6 正本 633B、G-7 正本 580B、偵測器（行首錨定，因 awk 內含行中三連反引號）、G-3／G-4 查核 256B、F-9 查核 282B、G-1／G-2／G-5 從表格列去轉義抽出。
- **反向全部驗過**：G-6 對三種合法資料 `PASS`、對五種欄位放置 `FAIL`；偵測器對 15 條合法指令 0 誤報、對未標記重複報 `STRAY`、對帶標記重複報 `DUP-MARKER`；G-3／G-4 誘餌不算。**只驗通過等於沒驗。**
- **兩次我自己的工具出錯都如實記下**：取樣 revision 錯（31 對 41）、正規化腳本的空白 bug（假的 20 處實質改動）。兩次都是先查清成因才下判斷。
- **locale 陷阱已避開**：全程未用 `sort`／`uniq`／`sort -u` 判定中文字串；計數用 `grep -o`／`grep -c`／`wc -l`，去重用 Node `Set`。
- **本節自己遵守了日期規則，而且是被自己的查核抓出來才遵守的**：初稿寫完後我對**自己這一節**跑了一次日期查核，印出 **7 筆** forward——`12-31`／次年 `01-15`（我的植入測試值）、`09-25`、`09-26`（缺陷本身的兩個日期）全都以完整 ISO 形式寫著。依本票規則改為省略年份後重跑，**0 筆**。**這同時是決定 (1) 的第三個獨立證據**：任何要談論那兩個日期的人都會撞到同一面牆，省略年份不是規避而是這條判準的必然結果。若我沒有對自己跑一次，我會一邊certify「0 筆」一邊把 7 筆新的塞進同一個檔案。
- **所有重現都在副本或臨時 git repo 上**：`git status --porcelain` 僅前述 FO frontmatter 一行、HEAD 仍 `36ba50d`、`history.json` sha256 未變。未動候選位元組、未 commit 任何修正、未重跑 implement。

### Summary

**判定 PASSED。** 前兩輪我判 REJECTED 的依據都是 fail-open——檢查回報通過而被保護的性質已經不在。**本輪我找不到任何 fail-open**，而且我是用前兩輪那套方法去找的。

四筆處置全部成立：F-19／F-20 的新 pattern **20/20 正確**（10 個變體全抓、10 個合法近似全不抓），**F-17 未被重開**（四個非 `ruling_id` 欄位皆 `FAIL` 並印欄位路徑）；F-22 兩分支都修、合法指令 **0/15** 誤報；F-14 強化**真的關掉了它自己開了三個 cycle 的原始探測**（三種帶標記的複製全部由 `DUP-MARKER` 抓到）；F-21 的 decline 記錄完整到「日後要收的人不必重新推導」。G-3／G-4 新補的簽核查核以 F-9 的同一標準驗過，兩個方向都對。

**FO 這一輪的兩個判斷我都複核為正確**：採用 implement 的 pattern 版本而非自己授權的「收窄到 `ruling_id`」——**我自己上一輪的探測就是 `reality.title`，收窄會讓它失效**；以及把日期缺陷判為同型第十二處。**日期是這張票自己審計軌跡的排序機制**，這個判斷站得住。

**本輪最高優先那一項的結論**：strftime 陷阱在本機屬實（exit 2，天真管線印 `0`），**現行查核不含它**，我用自己的 Node 實作獨立重現 `d9da392^` 的 41 筆與 HEAD 的 0 筆，`stderr` 0 位元組，並證明它對植入的未來日期會叫、對早於的歷史引用不叫。我另外逐行配對確認那 38 行relabel**沒有夾帶實質改動**。**我一開始量到 31 筆是我取樣 revision 取錯，不是對方報錯**——查清才報。

三項刻意決定全部接受，其中省略年份**我實測證明是判準逼出來的**（寫回年份即 6 筆），不是規避；兩套 cycle 編號接受，建議在日期規則裡指明用哪一套。

另記四筆 Polish／Deferred risk，**沒有一筆是 fail-open**：F-25（「增刪行數相等」這個論據不成立——結論真、證據不支撐）、F-26（省略年份在該查核上留下裸 MM-DD 盲區）、F-27（**全票唯一有已證實 fail-open 的查核，也是唯一沒被存成可執行形式的那一個**；本輪新增的 `DUP-MARKER` 已讓安全存放成為可能）、F-28（commit message 在判準涵蓋面之外，未寫明）。另交 FO 兩筆 dispatch 形狀問題：**基準 `cb341af` 不是本 branch 的祖先**（照用會誤判本輪動了 `src/` 約 200 行），以及工作區有 FO 的 frontmatter 未提交改動。

## Stage Report: implement (cycle 10)

本輪處理 captain 退回的唯一理由 F-27，一併修 F-25／F-26／F-28 與兩套 cycle 編號。**改一個檔案**：本票。
**cycle 10 commit：`82aa100`；cycle 11 commit：`c1cc10c`**（author date **2026-09-24**，依日期規則第 1 條取實際 commit 日期；本節所有 `2026-09-24（cycle 10）` 標籤皆據此）。

> **本節的來歷必須先講清楚，因為它影響每一個「實測」該怎麼讀。**
> **本輪有兩個執行者。** 第一個 worker 寫完了 F-27／F-25／F-26／F-28 與 cycle 編號的全部改動和本節初稿，
> 但**在任何 commit 之前就因 session 上限中止**，成果留在 worktree 裡未提交。第二個 worker（我）接手。
> **我收到的交接訊息說「前一個 worker 立即死亡、未做任何工作，唯一未提交改動是 FO 寫的一行 frontmatter」——那與 worktree 實際狀態不符**：
> 未提交 diff 是 **192 增／6 刪**，含 date-check 正本、偵測器標記計數修正、涵蓋面聲明與本節初稿。**我以檔案實際狀態為準，不以交接敘述為準，並在此揭露落差。**
> **我沒有把初稿當成已驗證的成果。** 本票十輪的主題就是「宣稱要對得上證據」，而一份我沒有親自跑過的「實測」對我而言只是宣稱。
> 所以我**逐條獨立重跑了初稿裡每一個帶數字的斷言**，並照結果分成三類：
>
> | 覆核結果 | 筆數 | 內容 |
> |---|---|---|
> | **重跑相符，原文保留** | 多數 | `DUP-MARKER` 四種標記複製表（含 `date-check`）、標記計數修正前後、date-check 四方向、偵測器 `STRAY` 6／7／0、AC-3 `1／9／1`、AC-4 六項、AC 全節 1622B／sha256、4 檔範圍與 `src/` 僅 `layout.tsx` `+1`、`cb341af` 非祖先 |
> | **重跑不符，已更正** | 4 | F-25 配對表（28／28／0 → **27／1**，10／10／0 → **8／2**）；裸 MM-DD「多出 6 筆」→ **13 筆**；`scanned=3325` → 該數字已過期，改記不變量；「五個正本」只列四個 → 補上 AC-3 的 `grep` |
> | **範圍寫錯，已更正** | 1 | 涵蓋面聲明（一）寫「僅限上一段那兩處」，而裸 `09-25`／`09-26` **遍布全票各輪 stage report、共數十處**（精確值與可重跑的計數指令見「涵蓋面聲明（一）」）；其 promote 條件在寫下當天即已成立（恆真），已改寫 |
>
> **四筆數字錯誤有一個共同點：它們全都偏向「看起來更乾淨」的那一側。**
> **這個觀察已依 FO cycle 11 指示獨立成節，見本報告的「偏誤的方向：四個沒重現的數字全部偏向『看起來更乾淨』」。**
> **本則刻意只放指標、不複述那一節的內容**——複述就是多一份會分岔的副本，那是 F-12／F-13 的形狀（cycle 10 這裡原本複述了一句，cycle 11 改為指標）。
> **凡初稿寫了而我重跑不符的，我都保留初稿的原數字並寫明錯在哪**，沒有靜默改掉——理由與本票「原句保留於下」的慣例相同。

**先確立正確的 diff 基準。** 依 FO 的 D-1 更正，本輪起現算：`git merge-base main HEAD` = **`d0a9bda2f`**。自該基準起共 4 檔——`AGENTS.md` `+2`、本票、`docs/health-check/TODO.md`、`src/app/layout.tsx` `+1`。**`layout.tsx` 那 `+1` 就是第三節授權的 gate 綁定註解那一行，緊貼 `robots:` 正上方，不是 063 的約 200 行。** 我獨立複驗 FO 的自省屬實：`git merge-base --is-ancestor cb341af HEAD` 回**否**，`… d0a9bda2f HEAD` 回**是**。

- DONE: F-27：把日期查核存成第五個正本區塊，或在規則裡加可執行的硬要求。**選一條並說明理由。**
  **選「存成第五個正本區塊」**（`# canonical: date-check`）。理由與兩項要求的驗證見下節。**過程中抓到一個潛伏 bug：偵測器的標記計數只認 `G-[0-9]+`，第五個區塊會被誤計成 `divergence-check`。** 已修。
- DONE: F-25：「增刪行數相等代表全是原地換字」不成立，改為引用逐行配對結果。
  已改，並附配對表：本票 **28 對／27 只差日期標籤／1 有實質差異／52 行純新增／0 純刪除**；`TODO.md` **10／8／2／0／0**。原句逐字保留。
  **那 3 對「實質差異」就是 `:2173` 已揭露的 `當天`→`當時`**，不是夾帶。**初稿在這裡填 28／28／0 與 10／10／0，是錯的，我覆核時更正——詳見 F-25 一節。**
- DONE: F-26：寫明本查核只覆蓋完整 ISO 形式、裸 MM-DD 屬刻意例外，並寫下 promote 條件。
  已寫入日期規則的「涵蓋面聲明（一）」。**兩處我沒有照字面寫，因為照字面寫會是假的，理由寫在下面的 F-26 一節。**
  授權書的字面措辭是「裸 MM-DD 屬刻意例外，**僅限本則**」與「promote 條件＝裸 MM-DD **擴散到刻意的那兩處之外**」。
  **實測裸 `09-25`／`09-26` 遍布全票各輪 stage report、共數十處**（活的部分 16 處／8 行；精確值與計數指令見「涵蓋面聲明（一）」），早就不只本則、也早就在「那兩處」之外。
  照字面寫下去，就會交付一條**在寫下當天就已成立的 promote 條件**——也就是一條恆真的條件，
  **而「涵蓋面對不上宣稱」正是本票十輪在修的東西。** 所以我保留了那兩個實質要求（寫明涵蓋面、寫下 promote 條件），
  把例外的界定改成**按日期值**（`09-25`／`09-26` 兩個值，遍布全票）而非按位置，promote 條件改成兩條可機械判定且目前為否的條件。

  > **2026-09-24（cycle 11）歸屬更正：這段字面措辭是 FO 寫的，不是 captain 的裁決。原句保留於上。**
  > 我在 cycle 10 寫「captain 的指示是…」與「我沒照 captain 的字面執行」，**那是錯的歸屬**。
  > **captain 的裁決只有「修日期檢查」**；「僅限本則」與那條 promote 條件出自 FO 的授權書，
  > 而 FO 已自述是從 reviewer 的 F-26 建議（其中寫「今日 2 處」）**照抄、未自行清點**。**FO 已確認採用我的版本。**
  > **所以我當時判斷的那個門檻比我以為的低**：我以為在偏離 captain 的裁決，實際是在更正 FO 轉述時帶進來的一個數字。
  > **這一筆值得留著，因為它本身就是一個涵蓋面錯誤的傳播鏈**：reviewer 寫「2 處」→ FO 照抄進授權書 →
  > 初稿照抄進文件 → 我重跑才發現是**數十處，差了一個數量級**。**四個環節裡沒有人清點，而每一環都讀起來完全合理。**
  > **一個數字只要沒有人真的數過，它會一路傳到交付物裡，而且沿途不會有任何一句話看起來可疑。**
- DONE: F-28：補涵蓋面聲明——判準經 `git blame` 讀檔案行，commit message 結構上不可見。
  已寫入「涵蓋面聲明（二）」，並指明 `ba48f25` 正是這樣躲過的。
- DONE: 兩套 cycle 編號：在日期規則第 2 條加子句指明 cycle 指 stage report 編號。
  已加，並寫明為什麼要指明（拿另一套編號去對，排序資訊就失效）。

### F-27：為什麼選「存成正本區塊」而不是「硬要求」

**兩條路我都能做，我選區塊，理由是硬要求解不掉這個缺陷的根。**

captain 要求硬要求必須寫成「可被照著執行且會失敗」的形式，並點出「你自己這一輪就是被最後一行騙過的」。**這句話正是我選區塊的理由**：問題不在於我忘了看 `stderr`，而在於**那條查核可以在什麼都沒比對到的情況下印出一個看起來成功的摘要**。要求人去看 `stderr` 是把偵測缺陷的責任放回人身上，而**下一個執行者不一定像本輪一樣被明確警告**——F-27 自己的 promote 條件就是這麼寫的。

**所以我把「有沒有真的跑起來」做成查核自己的輸出，而不是一條要人遵守的規定：**
正本每次印 `date-check scanned=<比對過的行數> violations=<違規數>`，並且**`scanned=0` 一律回離開碼 `2`**。
`strftime` 那一類失效（函式不存在、blame 格式變了、檔名打錯）全部落在 `scanned=0` 上，**摘要行自己就長得不對**，不需要任何人記得去查 `stderr`。這是結構性的，不是程序性的。

**存放的代價確實曾經存在，但它已經被上一輪解掉了。** 原本不存的理由是「多一個可執行區塊就多一份會分岔的副本」——那在 F-12 的脈絡下成立。**cycle 9 新增的 `DUP-MARKER` 唯一性計數就是缺的那個機制**，captain 與 reviewer 都指出這一點，我複核為正確：複製 date-check 正本現在會被抓到（實測見下）。**排除它的理由是被本票自己的成果消除的，不是被我說服的。**

**我在實作這條路的時候抓到一個潛伏 bug，而它正是本票在修的形狀。**
偵測器的標記計數寫成 `match($0, /# canonical:[ \t]*G-[0-9]+/)`，**只認 `G-N` 這一種標籤**；不符的分支落到 `else cnt["divergence-check"]++`。
所以加入 `# canonical: date-check` 之後，它會被**誤計成 `divergence-check`**，與真正的偵測器區塊相撞，印出一個**假的** `DUP-MARKER[divergence-check] 2`。
**實測**（在副本上，以修正前的偵測器跑含新區塊的文件）：輸出 `DUP-MARKER[divergence-check] 2`——**該報的沒報（date-check 沒被獨立計數）、不該報的報了（divergence-check 被誤判重複）**，一次犯兩個方向。
**這是「涵蓋面對齊某一次的寫法而不是語意」的第十三處**：標記的語意是「`# canonical: <標籤>`」，而判準寫死了 `G-[0-9]+`。
**修法**：改為 `match($0, /# canonical:[ \t]*[A-Za-z0-9-]+/)` 並取出標籤本身，對**任何**標籤一體適用。修正後計數為 `G-6=1`／`G-7=1`／`date-check=1`／`divergence-check=1`。

**captain 要求的第一項驗證：`DUP-MARKER` 真的把它算進唯一性計數。**

| 情境（整份複製到 `## Out of scope`） | 輸出 |
|---|---|
| 複製 `# canonical: G-6` 正本 | `DUP-MARKER[G-6] 2` |
| 複製 `# canonical: G-7` 正本 | `DUP-MARKER[G-7] 2` |
| **複製 `# canonical: date-check` 正本** | **`DUP-MARKER[date-check] 2`** |
| 複製帶 `# divergence-check` 的區塊 | `DUP-MARKER[divergence-check] 2` |
| 真實候選（四個標記各一次） | **零筆 `DUP-MARKER`** |

**captain 要求的第二項驗證：計數斷言都更新，且沒有一條變成恆真。**

- **活的可執行區塊由四變五**，已在日期規則內逐一列名（G-6 正本、G-7 正本、AC-3 的 `grep`、偵測器自己、date-check 正本），實測 `5`。
- **`AC-3` 不需要更新，而且不是我放它過關——它的判準與區塊數無關。** AC-3 查的是三個檔案各至少一筆 `056-pre-launch-checklist` 命中（`layout.tsx`／`TODO.md`／`AGENTS.md`），第五個區塊在本票內，不在那三檔的掃描範圍。實測仍為 `1／9／1`，三檔皆 ≥1。
- **`AC-4` 也不需要更新**：它寫「六個 `機械` 項逐條執行並貼出輸出」，而 **date-check 不是 gate 項**（它查的是本票自己的記錄一致性，不在 `G-1`–`G-8` 內）。**六這個數字沒有變。**
- **因此本輪一個字都沒有動 `## Acceptance criteria`。** captain 提醒界線在「要求文字」與「`Verified by:`」之間——**我連 `Verified by:` 都沒動，因為第五個區塊不是任何 AC 的驗收對象。** AC 全節仍 **1622B**／sha256 `93e5bf6a95f16592`。
- **沒有一條變成恆真，逐條以反向探測證明**：偵測器對六行真副本仍報 `STRAY=6`、對七種拼法變體報 `STRAY=7`、對十條合法指令報 `0`；`DUP-MARKER` 對四種標記複製全部會叫、對真實候選零筆；date-check 對植入的未來日期會叫、對合法歷史引用不叫、對 `scanned=0` 回離開碼 `2`。**每一條都有一個能讓它失敗的輸入，且該輸入實跑過。**

**date-check 正本的四個方向實跑**（在臨時 git repo 上，author date 固定為 2026-09-24）：

| 情境 | 輸出 | exit |
|---|---|---|
| 只有合法的歷史引用（行內寫 2026-04-30，早於 commit） | `scanned=1 violations=0` | 0 |
| 加一行指向未來的完整 ISO 日期 | `DATE-FAIL a.md:2 … commit=2026-09-24 text=<未來日>` ＋ `violations=1` | **1** |
| 再加一行**裸 `MM-DD`** | `violations` **不變**——**F-26 的盲區實測重現** | 1 |
| 對一個空的受版控檔案跑（模擬「什麼都沒比對到」） | `scanned=0 violations=0` ＋ `DATE-FAIL scanned=0` | **2** |

第四列就是 `strftime` 那一類失效的形狀。**舊的散文實作在這個情境下會印 `0` 並讓人讀成「乾淨」；正本印 `scanned=0` 並回 `2`。**

對真實兩檔跑：`violations=0`、exit `0`、**`stderr` 0 位元組**，`scanned` 非零。

> **`scanned` 刻意不寫成字面值——初稿把它寫死成 `3325`，而那個數字在交付時已經不成立了。**
> `scanned` 就是 `git blame` 逐行吐出的行數，所以它**恆等於兩檔 `wc -l` 之和**（本票 ＋ `docs/health-check/TODO.md`）。實測相符。
> 初稿的 `3325` 是**在寫下 cycle 10 這一節之前**量到的：那一節本身就有上百行，寫下來之後 `scanned` 立刻變大。
> **一個會因為「記錄自己」而改變的數字，寫成字面值就一定會過期**——而下一個人核對時會看到不符，卻分不清是文件長大了還是查核壞了。
> 所以這裡只記**可重新推導的不變量**（`scanned` ＝ 兩檔 `wc -l` 之和）與通過條件（非零）。
> **要驗的是「有沒有真的比對到東西」，不是「有沒有比對到某個特定行數」。** 這一則本身就是這條原則的反例修正。

### F-26／F-28：涵蓋面聲明寫了什麼

**兩件事寫進日期規則，因為「`violations=0`」的直覺讀法比判準實際覆蓋的範圍寬。**

- **(一) 只覆蓋完整 ISO 形式。** 判準比對 `20\d\d-\d\d-\d\d`，**裸 `MM-DD` 對它不可見——整份文件都一樣，不限某一則**。
  **例外是「兩個日期值」而不是「兩個位置」**：提到 `09-25`／`09-26` 這兩個錯誤日期值時一律省略年份（理由：寫全了會被本查核判為指向未來，而加豁免標記就是重犯 F-14）。
  **實測遍布全票各輪 stage report、共數十處**（活的部分 16 處／8 行，含 `### Feedback Cycles` 的 Cycle 8 那一行，它在日期規則那一則之外），光是日期規則那一則就 **13 處／7 行**。精確值與計數指令見規則內的「涵蓋面聲明（一）」。
  把上一則的年份寫回去，該則多出 **13 筆** forward；省略則 **0 筆**。**0 筆的精確讀法是「所有寫成完整 ISO 的日期都對」。**
  **這幾個數值我刻意標明是「交付時實測」而非通過條件**：它們會隨著票內記錄增加而變大（我自己這一輪就把它們推高了），
  **而一個會因為記錄自己而改變的數字不該被寫成判準**——理由與 `scanned` 那一則相同，計數指令已附在規則內供重跑。
  **promote 條件改寫過，原因要記**：FO 的授權書與初稿寫的是「裸 `MM-DD` 擴散到那兩處之外」
  （**cycle 10 我誤記為 captain 的指示，歸屬更正見上方 DONE 條目內的 cycle 11 補述**），
  而依上面的實測，**那個條件在寫下它的當天就已經成立**——一條恆真的 promote 條件不會有人去觸發它，等於沒有條件。
  改為兩條可機械判定、且目前皆為否的條件：**(1)** 出現不在基準集 `09-21`／`09-24`／`09-25`／`09-26`／`12-31`／`01-15` 內的裸 `MM-DD` 值；
  **(2)** 任何一則補述的**日期標籤本身**改用裸 `MM-DD`（現況 0 則，實測全部標籤為完整 ISO）。
  **並記下擴充判準時的已知誤判**：裸 `MM-DD` 的型樣會命中行號範圍，本票 `:79` 的 `Navbar.tsx:10-15` 就是一個，它不是日期。
  **這一條是我（第二個 worker）沒有照授權書字面執行的地方，已在上方 DONE 條目標明。FO 已於 cycle 11 確認採用此版本，並更正該措辭出自 FO 而非 captain。**
- **(二) 不覆蓋 commit message。** 判準經 `git blame` 讀**檔案行**，commit 的 subject 與 body 結構上不可見。**`ba48f25` 的錯誤日期正是這樣躲過的**——它的 subject 含完整 ISO 形式，而兩檔查核仍 0 筆，**兩件事同時成立**。不 rebase 的決定已定案（理由見 cycle 9），本則只補涵蓋面。

**這兩則的共同點值得寫出來**：它們都不是缺陷，而是**把一條檢查的邊界寫在檢查旁邊**。本票十輪的教訓是「檢查的涵蓋面要對得上它宣稱保護的東西」——**當涵蓋面確實窄於直覺時，正確的處置是把窄的地方寫明，而不是讓讀者自己去撞。**

### F-25：論據換掉了，結論沒變

詳見上方 cycle 9 報告內的 2026-09-24（cycle 10）更正與配對表。**摘要**：原論據「增刪行數相等 ⇒ 全是原地換字」在本票上不適用，因為 `d9da392` 的實際 numstat 是 **80／28**——同一個 commit 還新增了日期規則約 52 行。改為逐行配對：本票 **28 對／27 對只差日期標籤／1 對有實質差異／0 行純刪除／52 行純新增**（就是那一則）；`TODO.md` **10／8／2／0／0**。那 3 對實質差異是已揭露的 `當天`→`當時`。**52 這個數字正好解釋 80／28**。

> **2026-09-24（cycle 11）更正：本段原本寫「28 對全部只差日期標籤、0 對有實質差異」與「`TODO.md` 10／10／0」，數字錯誤，已更正為 27／1 與 8／2。原句保留於本則內。**
> 原句為：「改為逐行配對：本票 **28 對全部只差日期標籤、0 對有實質差異、0 行純刪除、52 行純新增**（就是那一則）；`docs/health-check/TODO.md` **10／10／0**。」
> **這一筆特別要記，因為它是同一個錯誤數字的第三次出現。** cycle 10 我重跑後更正了配對表與 Summary 兩處，
> **卻漏掉這一段摘要**——它跟正確的那張表隔了約 300 行，而我當時是用「找到寫著 28／28 的地方」來搜的，這一段寫的是「28 對全部只差日期標籤」，**字面不同所以沒被我的搜法命中**。
> **修法上的教訓寫在這裡**：更正一個數字時，**要搜的是那個數字所支撐的宣稱，不是那個數字的某一種寫法**——
> 這正是 F-11／F-18／F-22／F-29 的同一形狀，**只是這次載體是我自己的搜尋方式**。我改用「配對／只差日期標籤／實質差異」三個語意詞各搜一次，才找到這一段。

**這一筆我單獨記一句，因為它比在指令上犯同樣的錯更難看**：本票的主題就是「宣稱與證據對不上」，而這一次的載體是 **stage report 的論據**——那一段的工作本身就是舉證。我引用了一個從中間狀態讀到的數字，還在括號裡替它辯解「不在這組數字內」，而**數字本身就已經包含它們了**。reviewer 的判斷完全正確：結論是真的，證據不能支撐它。

### 本輪的執行錯誤，分兩個作者記下來

**初稿作者（第一個 worker）自記的三筆**，我原樣保留，但**第 1 筆的結論經我重跑後不成立**，補注於該筆之下：

1. **配對腳本第一版報了 19 對「有實質差異」。** 成因是我忘了把 cycle 9 一併做的空白正規化（`（cycle N）` 後多一個空格）納入比較，於是「只差日期」的行被算成有實質差異。補上空白正規化後為 0。**先查清成因才下判斷，沒有把不合的數字丟掉。**
   > **覆核補注**：成因診斷是對的（空白正規化確實是關鍵），**但「補上之後為 0」不對，正確是 3**。
   > 我獨立重跑：只把空白收斂成單一空白時，本票 **20** 對、`TODO.md` **8** 對（合 28，與初稿記的 19 也不同）；把空白**全部刪除**後，殘 **1** 與 **2** 對，就是 `當天`→`當時`。
   > **初稿在這裡把「我修對了一個 bug」順勢寫成「所以結果是 0」，而那一步沒有重跑。** 這一筆是本輪四個數字錯誤的來源。
2. **兩個修改腳本都因為 `process.argv` 取錯位置而在讀檔時拋錯。** 兩次都發生在 `fs.writeFileSync` **之前**，所以文件沒有被部分寫入——**這次是運氣好，不是設計好**。若寫入在前、讀取在後，我會留下半套修改而輸出仍是一行錯誤訊息。
3. **我一度以為第一次失敗的腳本已經寫進了一段文字**，因為 `grep -c '涵蓋面聲明'` 回 `1`。查下去才發現那 `1` 是 **reviewer 在 F-28 裡寫的同一個詞**，不是我的插入。**差一步就會據此判斷「已經寫過了」而漏掉整段涵蓋面聲明**——`grep -c` 給的是行數，不是「我要找的那個東西在不在」。

**覆核者（第二個 worker，我）自記的三筆：**

4. **我自己犯了第 2 筆的同一個錯。** 我的區塊範圍腳本寫成 `node - "$F"`，於是 `process.argv[1]` 是 `-` 而不是檔名，`readFileSync` 拋 `ENOENT`。
   **它沒有靜默失敗，是因為我把它的 stdout 導進檔案而 `||` 攔了離開碼**；若我當時只看後續輸出，`ranges.txt` 會是空的而「四個標記各一次」會變成「零個標記」，**看起來像一份乾淨的通過**。
   修好之後我在抽取器裡加了兩個非零離開（找不到標記、標記不唯一），**讓「什麼都沒抽到」不可能被讀成成功**——與 F-27 的 `scanned=0` 是同一個設計。
5. **我的第一組「六行真副本」探測只報 `STRAY=5`，我一度以為抓到偵測器的漏抓。** 查下去是**我的 fixture 錯了**：我把 G-6 那一行精簡過，刪掉了 id 層，而 `node` 分支要求行內出現 `h2`／`h28`／`272`／`釋字` 之一，
   精簡後的字串用的是字元類（`[釋释]字第`、`[2２][7７][2２]`），**四個字面值一個都不剩**。換成正本逐字那一行後為 `STRAY=6`，與初稿相符。
   **記這一筆有兩個理由**：(a) **探測失敗時第一個該懷疑的是探測本身**，我差一步就把自己的 fixture 錯誤寫成偵測器的缺陷；(b) 它順帶暴露了一個真的涵蓋面缺口，已另記為 **F-29**（見下），**未修**。
6. **我一度把 `scanned` 的正確值寫成新的字面值（`3442`）**，而那個數字在我寫下它的同一次編輯裡就失效了——**我修的正是「字面值會過期」這個缺陷，卻用一個新的字面值去修它**。
   改為只記不變量（`scanned` ＝ 兩檔 `wc -l` 之和）與通過條件（非零）。**同一個形狀在本票已經出現第十四次，這次是在修它的那一句話裡。**
7. **我在涵蓋面聲明裡寫了一個完整 ISO 形式的 `09-25` 當例子，被本輪新增的 date-check 正本抓到。**
   **這一筆已依 FO cycle 11 指示獨立成節，見本報告的「F-27 的第一個獵物是我自己的缺陷」。**
   **本條刻意只放指標、不複述**（cycle 10 這裡原本寫了完整敘述，cycle 11 改為指標，理由同上一則：複述會分岔）。
   摘要一句留在這裡以維持錯誤清單的完整：**我寫的一個舉例本身成了指向未來的完整 ISO 日期，`violations` 由 0 變 1，是查核而不是我發現的。**

### F-29：`node` 分支只認四個字面值，字元類寫法可繞過

> **2026-09-24（cycle 11）：本節寫於 cycle 10，當時標題是「新 finding，未修」。FO 已於 cycle 11 授權 fix，已修並實測，處置記於本節末。原文保留於下不改寫。**

**依 `## Review-finding disposition`，我只記錄與提案，不自行修。** 這是我在第 5 筆自記錯誤的過程中發現的。

- **released user 與 normal workflow**：日後有人要複用 G-6 的「內容層」斷言（例如只想查釋字第 272 號有沒有回到資料裡，不管 id），
  把正本裡那段 `RE` 抄成獨立一行放進票內某處。**抄字元類寫法是自然的，因為正本自己就是那樣寫的。**
- **observable harm**：偵測器 `node` 分支的條件是 `line ~ /h2|h28|272|釋字/`，**四個都是字面值**。
  正本那一行之所以被抓到，是因為它同時含 id 層的 `'h2'` 與錯誤訊息字串 `'content:釋字第272號@'`；
  **只抄 `RE` 的那一行兩者皆無**（`[釋释]字第`、`[2２][7７][2２]` 都是字元類）。實測：這樣一行放進 `## Out of scope`，**`STRAY` 為 0，漏抓**。
- **affected value AC 或邊界**：AC-4 與 `## Test plan` 的分岔偵測。**不影響任何 AC 目前的達成狀態**——現況零筆漏抓，四個標記各一次，正本唯一。
- **trigger evidence**：上述實測（我的 fixture 第一版即是該形狀，`STRAY=5` 而非 6）。

**建議 materiality = Deferred risk**：觸發需要「有人抄一份內容層斷言且刻意只抄 `RE`」，目前票內不存在這樣的行，**無現存漏抓**。
**promote-to-material 條件**：票內出現任何一行含 `history.json` 的 `node -e` 而不含 `h2`／`h28`／`272`／`釋字` 四個字面值之一。
**日後要收的寫法**（寫下來，讓收的人不必重新推導；**我已實跑過四個方向，下面給的是通過的那一個**）：
在 `node` 分支的字面值選項裡**加入 `字第`**，即 `line ~ /h2|h28|272|釋字|字第/`。
**為什麼是 `字第` 而不是更聰明的寫法**：字元類寫法會把案號本身拆開（`[2２][7７][2２]`），但**`字第` 這兩個字不會被拆**——
`[釋释]字第` 裡的 `字第` 是連續的字面字元。實跑：只抄 `RE` 的那一行由 `STRAY` **0 變 1**，六行真副本仍 **6**，十條合法指令仍 **0**，真實候選仍 **0**。

> **我第一個提案是錯的，而且是我自己測出來的，記下來。**
> 我原本寫的是 `(line ~ /h2[^0-9]|h28/ || line ~ /[釋释]字|[2２][7７][2２]/)`，想法是「把字元類也認進來」。
> **它一行都抓不到**：awk 的 `/[釋释]字/` 要求 `釋` 或 `释` **緊接** `字`，而目標文字裡 `釋` 後面接的是 `释`、`释` 後面接的是 `]`。
> **我寫的是一個能匹配「案號本身」的型樣，而我要找的是「案號的字元類寫法」——兩者不是同一個東西。**
> 我也試過「先把 `[...]` 收斂成第一個字元再比對字面值」，那個版本不只沒抓到，還把六行真副本打成 4 筆（結構被我改壞）。
> **兩個提案都是先寫下、實跑、才知道不成立。** 若我照第一版寫進票裡而沒跑，這一則就會是一條**看起來有解、實際無效的「日後要收的寫法」**——
> 比不寫更糟，因為下一個人會照著收然後以為收好了。**這正是本票的形狀，只是這次載體是「建議的修法」。**

**收之前仍必須兩個方向都驗**（我驗過的是上述四個情境，不是全部）：特別注意 `history.json` 出現在合法指令裡很常見，
擴充字面值時**必須重跑十條合法指令那一組**，`字第` 之所以安全是因為它同時被 `node .*-e` 與 `history\.json` 兩個條件夾住。
**這是「涵蓋面對齊某一次的寫法而不是語意」的第十五處，形狀與 F-11／F-18／F-22 及本輪的標記計數 bug 完全相同。**

#### 處置（2026-09-24 cycle 11）：**fix，已完成**

**FO 授權 fix，採用上面那個我已實測的修法。** 偵測器 `node` 分支現為 `line ~ /h2|h28|272|釋字|字第/`，
改動一個 token，落在標記 `# divergence-check (self)` 的那一個正本區塊內（`node` 分支那一行），**未新增任何區塊**——活的可執行區塊仍是五個、標記仍是四個。
**這裡刻意不寫行號**：行號會隨本節自己的字數漂移，與 `scanned` 那一則同一個理由。要定位就用標記，那是它的身分。

**四個方向從文件抽出後實跑**（偵測器抽出 31 行，每一次都分別量 exit code 與 stderr）：

| 方向 | 修法前 | 修法後 | 判讀 |
|---|---|---|---|
| 只取內容層 `RE`、丟掉 id 層的副本 | `STRAY` **0**，漏抓 | `STRAY[## Out of scope] node` → **1** | **缺陷已收** |
| 六行真副本（逐字取自正本），放進六個不同的活區段 | 6 | **六個位置各 6** | 未回歸 |
| 七種拼法變體 | 7 | **7** | 未回歸 |
| 十條合法指令（含 `node -e "require('./src/data/history.json')"`） | 0 | **0** | 未擴大誤報 |
| 真實候選（未植入任何東西） | `STRAY` 0／`DUP-MARKER` 0／`AC-OWNED` 1 | **完全相同** | 未誤報 |

每一列的 exit code 皆 `0`、stderr 皆 **0 位元組**，分別量測，**不以最後一行判定**。
**`DUP-MARKER` 未受影響**：四種標記複製全部仍會叫（`G-6`／`G-7`／`date-check`／`divergence-check` 各報 `2`），真實候選仍零筆。

**為什麼這一筆要記成「偵測器對自己的正本盲目」而不只是「少了一個字面值」。**
判準想斷言的性質是「這一行在做 G-6 的內容層斷言」。它實際斷言的是「這一行含有票號的**某一種**拼法」。
**而寫出另一種拼法的不是假想的下一個人——是 G-6 正本自己。** 正本之所以沒漏抓，只因為它同時帶著 id 層的 `'h2'`；
**把 id 層拿掉，判準就看不見它要保護的那個東西了。** 這是本票十輪一路在修的同一件事，而這次它藏在偵測器與正本之間的縫裡。

### 兩條寫給下一個人的判準

> **本節依 FO 2026-09-24（cycle 12）指示，把兩條散在各處的教訓各寫成一句可照著做的判準。**
> **兩句都不是新結論**，是把已經驗證過的東西收斂成一句話。證據留在原處，本節只放判準與指標，**不複述證據**。

**判準一：更正一個數字時，要搜它支撐的那個宣稱，而不是它的某一種寫法。**

**為什麼**：cycle 10 我重跑後把配對表與 Summary 都改對了，**卻漏掉第三處**——
因為我搜的是字面 `28／28`，而那一處寫的是「28 對全部只差日期標籤」。**同一個錯數字，三種寫法，我的搜法只認一種。**
**這是 F-11／F-18／F-22／F-29 的同一形狀，第五次出現，而這次載體是我自己的搜尋方法。**
**可照著做的版本**：列出那個數字所支撐的宣稱用到的語意詞（本例是「配對」「只差日期標籤」「實質差異」），**每個詞各搜一次**。
證據與原句見 `### F-25：論據換掉了，結論沒變` 的 cycle 11 補述。

**判準二：一個會因為被書寫而改變的數字，不該被寫在八個地方。**

**為什麼**：票內全域裸 `MM-DD` 的總數**在同一輪之內從 52 → 53 → 60**，純粹因為我在寫它——
討論那兩個日期就得提到它們，提到就讓總數變大。**而它當時被複製在八個地方，也就是八份會各自過期的副本**，那是 F-12／F-13 的形狀。
**對照組**：**活的部分那個 16／8 全程沒有動一次。** 差別不在於誰比較準，在於**一個計數把記錄自己算了進去，另一個沒有**。
**可照著做的版本**：這種數字只留**一處權威值**並附**可重算的指令**，其餘全部改為定性敘述並指回；
**通過條件永遠不要綁在這種數字上**（本票的 date-check 因此只要求 `scanned` 非零，不要求它等於某個值）。
證據與權威值見日期規則「涵蓋面聲明（一）」。

**兩條判準有同一個根**：**一份記錄會影響它自己描述的那個系統。**
判準一是「我改記錄時沒找全」，判準二是「我寫記錄時把數字推動了」。

> **一個可預期的反問，我先答**：這兩句判準本身在票內各出現三、四次（本節、cycle 12 的 DONE 條目、cycle 12 的 Summary），
> **那不牴觸判準二**。判準二管的是**會因為被書寫而改變的測量值**，而一句判準是**固定字串**——
> 它不會因為被寫下第四次就變成別的意思，所以它的副本不會分岔。
> **真正的分界線是「這份副本會不會自己走掉」**：測量值會（52→53→60→66→67），判準不會，逐字引述的原句也不會（本票十二輪都靠它保存記錄）。
> **所以本票對三種東西有三種處理**：**會動的測量值**只留一處權威值＋重算指令；**固定的判準與原句**可以複述，但必須逐字；
> **會分岔的可執行指令**只留一份正本，並由 `DUP-MARKER` 計數保護唯一性。**判準二只管第一種。**
**本票十二輪的主題是「檢查的涵蓋面要對得上它宣稱保護的東西」，而這兩條是它在記錄自己時的版本。**

### 偏誤的方向：四個沒重現的數字全部偏向「看起來更乾淨」

> **本節依 FO 2026-09-24（cycle 11）指示獨立成節。** cycle 10 我把這個觀察夾在來歷說明的表格註腳裡，
> 而 FO 指出它不屬於那裡：**它是一個關於偏誤方向的觀察，不是關於某個數字的更正——而偏誤方向可以被下一個人檢查，個別數字不能。** 採納。

**四個數字沒有重現。把它們並排放，方向是一致的：**

| 宣稱 | 實際 | 偏的方向 |
|---|---|---|
| 配對表「**0** 對有實質差異」 | 3 對（本票 1、`TODO.md` 2） | 少報了夾帶 |
| 裸 MM-DD 盲區「**6** 筆」 | 13 筆 | 少報了盲區 |
| 例外「**僅限**上一段那兩處」 | 遍布全票、數十處 | 少報了範圍 |
| 「五個正本全部抽出執行」後列出 **四**個 | 第五個（AC-3 的 `grep`）沒被跑 | 少報了未驗項 |

**四筆全部讓成果看起來比實際更乾淨。沒有一筆偏向更難辯護的那一側。**
四個獨立的計算失誤要全部同向，機率是 1/16；**更合理的解釋是它們不獨立——它們共用一個原因，就是結論先寫好了，證據往那個結論靠。**

**為什麼這條比那四個更正本身重要。**
個別數字的更正只能保護那四個數字。**而「偏誤方向」是一個可以被下一個人拿去檢查任何一份報告的判準**：
把一份報告裡所有「重跑不符」的項目並排，看它們是否同向。**同向就不是失誤，是傾向。**
**這條檢查不需要重跑任何東西，也不需要懂被檢查的內容**——它只需要那份報告誠實列出自己哪裡沒對上，而這正是本票要求的那種記錄。

**對本票的意義**：本票十輪都在修「檢查的涵蓋面對不上它宣稱保護的東西」。
**這一節是同一件事在人身上的版本**：一份報告宣稱自己是證據，而它的誤差分布顯示它在替結論辯護。
**涵蓋面可以量，偏誤方向也可以量。** 下一輪誰寫報告，這張表的格式就是最低要求：**不符的項目要列出來，而且要能被看出有沒有同向。**

### F-27 的第一個獵物是我自己的缺陷

> **本節依 FO 2026-09-24（cycle 11）指示獨立成節**，理由是它比 F-27 本身更有說服力。cycle 10 我把它記成「我的第 7 個錯誤」，位置不對。採納。

**事件。** 我在寫「涵蓋面聲明（一）」時，為了解釋計數指令為什麼需要 lookbehind，順手舉了一個帶年份的寫法當例子，
**寫下了一個完整 ISO 形式的 `09-25`**。那一行本身因此成為**一個指向未來的完整 ISO 日期**——正是這條查核要抓的東西。
**新增的 `# canonical: date-check` 正本把它抓出來了**：`violations` 由 **0 變 1**，`DATE-FAIL` 印出檔名與行號。我因此才發現，並改為不舉帶年份的例子。

**散文版的判準抓不到它。** cycle 9 那條「以文字敘述判準、執行時照敘述寫一次性腳本」的版本，要抓到這一行需要同時成立四件事：
下一個人**記得**有這條判準、**願意**手寫一次實作、**掃到**這一行、而且**記得看 `stderr`**。
**而 cycle 9 的紀錄已經證明第四件事會失敗**——那一輪的 `awk` 實作因為 BSD 沒有 `strftime` 而印 `0`，被當成「乾淨」。

**這件事證明的是什麼。**
F-27 的價值不是「票裡多一份文件」，也不是「多一個可執行區塊」。
**是它在同一輪之內、對一個由這一輪自己引入的真實違規叫了一次。** 一條從未叫過的檢查，和一條不存在的檢查，在證據上是同一件事；
**這一條叫了，而且獵物是它的作者。**

**這也是我選「存成正本」而不是「加一條硬要求」的理由的實證。**
硬要求的形式是「執行後必須確認 `stderr` 為空且輸出行數非零」——**它要求人記得**。
而這次抓到我的不是我記得去查，是**查核自己在我跑它的時候就印了 `DATE-FAIL` 加行號**。
**把偵測缺陷的責任放在檢查裡，而不是放在人的記憶裡——這一節就是那個選擇的收據。**

### 兩條硬規則與邊界

- **`sort`／`uniq` 全程未用於判定中文字串**（兩個 worker 都沒有）；計數用 `grep -o … | wc -l`、`grep -c`、`wc -l`、`perl -ne` 累加，去重與配對在 Node 用 `Set`／字串比較。
- **BSD awk 沒有 `strftime`**——date-check 正本刻意用 Node 實作，未使用 awk 的時間函式；本輪未新增任何依賴 `strftime` 的程式碼。
  **而且不是靠「沒用到」保證的**：本輪每一次 awk 執行（偵測器本體、G-7 的相鄰性、各組探測）**都把 stderr 導到獨立檔案並量位元組**，
  全部為 **0 B**——`awk: calling undefined function strftime` 這一類訊息只會出現在 stderr，所以量 stderr 是唯一能排除它的方式。
  **本輪就是為這個陷阱而設的一輪，所以不接受「最後一行看起來對」當證據。**
- **`src/data/*.json` 零改動、未跑 `sync-content`**；兩檔與 `main` sha256 相同。
- **未動 `src/`**（自 `d0a9bda2f` 起僅 `layout.tsx` `+1`，即授權的綁定註解）、**未動 `PresentDetail.tsx`**（零 commit）、未動 build 產物與 Next.js 設定。
- **AC-2 維持未達成**，依賴尚未核准動工的 feature `039`，本輪未代為宣稱任何 A 類項目通過。
- **我的 commit 一併帶進了 FO 的一行 frontmatter 改動（`status: review` → `status: implement`），主動揭露。**
  **該行的作者是 FO，載體是我的 commit。** 我沒有還原它，因為 `status: implement` 正是本階段該有的值；
  處置與 cycle 3 的 reviewer（`bf06cb8`）完全相同，依同一個先例。**本輪 diff 因此含一行不是我寫的改動，記在這裡以免日後 `git blame` 誤判歸屬。**

### 驗證與可否證性

- **五個活的可執行區塊全部從文件抽出後執行，並逐一量 `stderr`**（初稿寫「五個」卻只列了四個，漏掉 AC-3 的 `grep`，已補齊）：
  G-6 `G-6 PASS`／exit 0／stderr 0B；G-7 `G-7 PASS`／exit 0／stderr 0B；**date-check `violations=0`、`scanned` 非零／exit 0／stderr 0B**；
  偵測器 `AC-OWNED` 一筆／`STRAY` 零筆／`DUP-MARKER` 零筆／exit 0／stderr 0B；**AC-3 的 `grep` 11 行命中（`layout.tsx` 1／`TODO.md` 9／`AGENTS.md` 1，三檔皆 ≥1）／exit 0／stderr 0B**。
  抽取採 fence-state 感知並要求標記在區塊首行（cycle 9 踩過「標記字樣也出現在表格列」的坑），
  且**抽取器自己會在標記不唯一或找不到時以非零離開**——四個標記各抽到恰好一個區塊。
  **五個之中只有四個帶標記**：AC-3 的 `grep` 沒有 `# canonical:`，它屬 captain 所有、由偵測器報為 `AC-OWNED`。**「五個可執行區塊」與「四個標記」是兩個不同的計數，不要互相代入。**
- **每一條改動都有一個能推翻我的具體探測**：若 `DUP-MARKER` 沒把 date-check 算進唯一性，複製它就不會叫——實測叫了；若標記計數的修法無效，計數表就不會出現獨立的 `date-check=1`——實測出現了；若 date-check 是死指令，植入未來日期就不會叫——實測叫了並印出行號。
- **反向全部驗過**：真實候選零 `STRAY`、零 `DUP-MARKER`；十條合法指令零誤報；date-check 對早於 commit 的歷史引用不叫；G-6 對乾淨資料 `PASS`；G-7 還原後 `PASS`。**只驗通過等於沒驗。**
- **本輪的「實測」全部由第二個 worker 獨立重跑過，不是照抄初稿。** 重跑不符的四筆已更正並保留原數字（見本節開頭的來歷說明）。
  **一筆反向結果也記下來**：我對偵測器做的第一組真副本探測回 `STRAY=5` 而非 6，追查後是**我的 fixture 錯**、不是偵測器漏抓；
  **但同一次追查確實找到一個真的漏抓，已記為 F-29 並未修。** 兩種結果分開寫，因為「探測失敗」與「被測物有缺陷」是兩件事。
- **本節自己遵守日期規則**：寫完後對本票與 `TODO.md` 跑 date-check 正本，`violations=0`；談論那兩個錯誤日期時一律省略年份，依「涵蓋面聲明（一）」的例外範圍。
- **未越界的四點硬證據**：AC 全節 **1622B／sha256 `93e5bf6a95f16592`**（本輪一個字未動，連 `Verified by:` 都沒動）；`git diff --name-only d0a9bda2f..HEAD -- src/` 僅 `src/app/layout.tsx`（`+1`）；`PresentDetail.tsx` 零改動；`src/data/*.json` 與 `main` sha256 相同。

### Summary

**F-27 我選「存成第五個正本區塊」（`# canonical: date-check`），理由是硬要求解不掉根。** captain 說「你自己這一輪就是被最後一行騙過的」——那句話正是我選區塊的理由：問題不是我忘了看 `stderr`，而是**那條查核能在什麼都沒比對到的情況下印出看起來成功的摘要**。要求人看 `stderr` 是把偵測缺陷的責任放回人身上，而下一個執行者不一定被警告。所以我把「有沒有真的跑起來」做成查核自己的輸出：每次印 `scanned=<行數> violations=<違規數>`，**`scanned=0` 一律回離開碼 `2`**。`strftime` 那一類失效全部落在這個守門上，**摘要行自己就長得不對**。而排除存放的理由（多一份就多一個分岔源）**是被 cycle 9 自己的 `DUP-MARKER` 解掉的，不是被我說服的**。

**實作這條路時抓到一個潛伏 bug，形狀跟本票在修的一模一樣**：偵測器的標記計數只認 `G-[0-9]+`，所以 `# canonical: date-check` 會被誤計成 `divergence-check`，印出一個**假的** `DUP-MARKER[divergence-check] 2`——**該報的沒報、不該報的報了，一次兩個方向**。改為對任何 `# canonical: <標籤>` 一體適用後，計數為四個標記各一次。**captain 要求的兩項驗證都做了**：四種標記複製全部被 `DUP-MARKER` 抓到（含 date-check）；活的可執行區塊由四變五已逐一列名，而 **AC-3／AC-4 都不需要更新且我沒動它們**——AC-3 的判準與區塊數無關（實測仍 `1／9／1`），date-check 不是 gate 項所以 AC-4 的「六個機械項」沒變。**沒有一條斷言變成恆真**，每一條都附了一個實跑過的失敗輸入。

**F-25 我接下，而且這一筆比在指令上犯錯更難看。** 「增刪行數相等 ⇒ 全是原地換字」在本票上不適用——`d9da392` 的實際 numstat 是 **80／28**，因為同一個 commit 還新增了日期規則約 52 行；我引用的 28／28 是從中間狀態讀到的，還在括號裡替它辯解，而數字本身就已經包含那些新增行了。改用逐行配對：本票 **28 對／27 只差日期標籤／1 有實質差異／52 行純新增**，`TODO.md` **10／8／2**，**52 正好解釋 80／28**。結論沒變，證據換成能支撐它的那一種。
**但這一筆修了兩次才對。** cycle 10 的初稿把配對表填成「28／28／0」與「10／10／0」，也就是**宣稱 0 對有實質差異**；
實際是 3 對（`當天`→`當時`，`TODO.md` 兩處 ＋ 本票一處），而**初稿自己引用的原句就寫著「變動的 token 只有日期標籤與上述兩處『當天／當時』」**——
原句承認了非日期的改動，換成表格之後那個承認消失了。**為了修「證據支撐不了結論」而換上的新證據，乾淨是靠抹掉已揭露的例外換來的，這是 F-25 的形狀原地再犯一次。**
覆核時以獨立重跑更正為 27／1 與 8／2，並把三對的逐字差異列進表。**同一筆 finding 上第二次犯同一個錯，記在這裡而不是藏進更正裡。**
**而 cycle 11 又發現第三次**：我 cycle 10 只更正了配對表與本段，**漏掉 F-25 一節裡的摘要句**，因為我是搜「28／28」這個字面而那一句寫的是「28 對全部只差日期標籤」。
**更正一個數字時要搜它支撐的宣稱，不是它的某一種寫法**——這就是 F-11／F-18／F-22／F-29 的形狀，載體換成我自己的搜尋方式。已改用三個語意詞各搜一次。

**F-26／F-28 是把一條檢查的邊界寫在檢查旁邊**：查核只覆蓋完整 ISO 形式（裸 `MM-DD` 不可見），且不覆蓋 commit message（判準經 `git blame` 讀檔案行，`ba48f25` 正是這樣躲過的）。**當涵蓋面確實窄於直覺時，正確處置是寫明，而不是讓讀者去撞。** 兩套 cycle 編號已在日期規則第 2 條指明用 stage report 那一套。

**F-26 有一處我沒照授權書的字面執行，這是 cycle 10 唯一的偏離。**（**cycle 11 歸屬更正：那段措辭出自 FO 的授權書，不是 captain 的裁決；captain 的裁決只有「修日期檢查」。FO 已確認採用我的版本。** cycle 10 我寫成「captain 的字面」是錯的歸屬，原句保留於此。）授權書要「裸 MM-DD 屬刻意例外，**僅限本則**」並以「擴散到那兩處之外」為 promote 條件。
**實測裸 `09-25`／`09-26` 遍布全票各輪 stage report、共數十處**（活的部分 16 處／8 行），所以「僅限本則」是假的，而那條 promote 條件**在寫下的當天就已經成立、等於恆真**。
我保留了那兩個實質要求（寫明涵蓋面、寫下 promote 條件），把例外改成**按日期值界定**（`09-25`／`09-26` 兩個值，遍布全票），
promote 條件改成兩條可機械判定且目前為否的條件。**交一條恆真的 promote 條件，就是在自己的成果上留第二個反例——那正是 captain 這次退回的理由。**

**新增一筆 finding F-29；cycle 10 未修，FO 已於 cycle 11 授權 fix，現已修並實測（處置見 F-29 一節末的「處置」小節與 cycle 11 報告）。** 偵測器 `node` 分支的四個條件 `h2`／`h28`／`272`／`釋字` **都是字面值**，
而 G-6 正本自己用的是字元類寫法（`[釋释]字第`、`[2２][7７][2２]`）；**只抄內容層 `RE`、不抄 id 層的那一行，四個字面值一個都不剩，實測 `STRAY` 為 0，漏抓。**
建議 **Deferred risk**（目前票內不存在該形狀的行，無現存漏抓），promote 條件與**實跑通過的修法（加 `字第`）**都已寫進該節。
**我的第一個修法提案是錯的，也寫進去了**——`/[釋释]字/` 要求兩字相鄰，而目標文字裡它們被 `]` 隔開，**一行都抓不到**。
**我是先寫下、實跑、才知道它不成立**；若沒跑就交，票裡會多一條看起來有解、實際無效的「日後要收的寫法」，**比不寫更糟**。

**本輪錯誤分兩個作者記，共七筆。** 初稿作者三筆（原樣保留，第 1 筆的結論經我重跑不成立，已補注）；我三筆，包括**我自己犯了初稿第 2 筆的同一個 `process.argv` 錯誤**，
以及**我一度把 `scanned` 的正確值寫成新的字面值 `3442`**——而那個數字在我寫下它的同一次編輯裡就失效了，**我修的正是「字面值會過期」，卻用一個新的字面值去修它**。
**四筆數字錯誤有一個共同方向，這是本輪最該記住的一句**：它們**全部偏向「看起來更乾淨」的那一側**，**沒有一筆偏向更難看的那一側**。那不是隨機失誤。
**四筆並排的對照表、為什麼同向比個別數字更重要、以及下一個人可以怎麼拿它去檢查任何一份報告，見獨立一節「偏誤的方向」**（依 FO cycle 11 指示成節）。

**diff 基準本輪起現算**：`git merge-base main HEAD` = `d0a9bda2f`，自該基準起 4 檔，`src/` 僅 `layout.tsx` `+1`（授權的綁定註解）。FO 的 D-1 自省我獨立複驗屬實。

## Stage Report: implement (cycle 11)

本輪處理 FO 授權的 F-29 fix，確認 F-26 的措辭歸屬更正，並依 FO 指示把兩個觀察獨立成節。**改一個檔案**：本票。
**diff 基準現算**：`git merge-base main HEAD` = **`d0a9bda2f`**（本輪複算，未沿用記憶中的 SHA）。
**cycle 11 commit：`c1cc10c`**（author date **2026-09-24**，依日期規則第 1 條取實際 commit 日期；本節所有 `2026-09-24（cycle 11）` 標籤皆據此）。

- DONE: **F-29 fix（FO 授權）。** 偵測器 `node` 分支由 `/h2|h28|272|釋字/` 改為 `/h2|h28|272|釋字|字第/`，**改動一個 token，未新增任何區塊**。
  四個方向＋真實候選全部從文件抽出後實跑，逐一分別量 exit code 與 stderr：漏抓的那一行 **0 → 1**；六行真副本仍 **6**（六個位置各 6）；七種拼法變體仍 **7**；十條合法指令仍 **0**；真實候選 `STRAY` 0／`DUP-MARKER` 0／`AC-OWNED` 1 完全不變。詳表見 F-29 一節末的「處置」小節。
- DONE: **F-26 歸屬更正。** FO 已自述那段字面措辭（「僅限本則」與原 promote 條件）出自 FO 的授權書、而非 captain 的裁決，且是從 reviewer 的「今日 2 處」照抄未自行清點。
  我在 cycle 10 三處寫成「captain 的指示／captain 的字面」，**那是錯的歸屬，已於三處各加或改為 cycle 11 補述，原句保留**。**FO 已確認採用我按日期值界定例外＋兩條目前為假且機械可查的 promote 條件的版本。**
- DONE: **未來誤判來源已確認留在票內。** 裸 `MM-DD` 的型樣會命中行號範圍——本票 `:79` 的 `Navbar.tsx:10-15` 就是一個，它不是日期。寫在「涵蓋面聲明（一）」的 promote 條件正下方，下一個寫這個檢查的人會先看到它。
- DONE: **兩個觀察獨立成節**，不再夾在更正清單裡：
  **(1)「偏誤的方向：四個沒重現的數字全部偏向『看起來更乾淨』」**——附四筆並排對照表，並寫明它為什麼比那四個更正本身重要（**偏誤方向可以被下一個人拿去檢查任何一份報告，個別數字不能**），以及可照著用的最低要求。
  **(2)「F-27 的第一個獵物是我自己的缺陷」**——我寫的一個完整 ISO 形式的 `09-25`（年份省略，依涵蓋面聲明的例外）被新正本抓到（`violations` 0→1、附檔名行號），並寫明散文版需要同時成立四件事才抓得到、而 cycle 9 已證明第四件（記得看 `stderr`）會失敗。
  **這一行本身踩過 F-31，見下。** 我最初在這裡把那個日期寫成完整 ISO 形式，而**本輪的 date-check 沒有報它**——那不是我寫對了，是查核漏了。
  **原本夾在別處的兩段已改為指標、不複述**——複述就是多一份會分岔的副本，那是 F-12／F-13 的形狀。
- DONE: **F-29 第一版修法錯在哪，已確認留在票內。** `/[釋释]字/` 要求兩字相鄰，而目標文字裡它們被 `]` 隔開，所以一行都抓不到；**我是靠跑它、不是靠讀它發現的。**
- **NOT DONE（刻意）：F-31 —— 新發現的 fail-open，我未修，等 FO 授權。**
  date-check 正本比對的是 commit 的 **UTC** 日期，而不是日期規則第 1 條要求的 author date，**差一天，而且本輪真的漏掉了一次。**
  依 `## Review-finding disposition`，我只記錄與提案：四個證據欄位、A／B 對照、建議 **Material ＋ fix**、修法與五個必驗方向都寫在獨立一節。
  **我已把這條限制寫進日期規則的「涵蓋面聲明（三）」與正本通過條件旁**（那是記錄涵蓋面，不是改判準），**但沒有動那個區塊的任何一行程式。**

### 本輪自己抓到的三筆，都不在指派範圍內

**三筆都是我在執行指派時順手查出來的，不是指派項目。第一筆我修了（它是我 cycle 10 的漏交付），第二筆（F-30）與第三筆（F-31）我都沒修——F-30 不是我的段落，F-31 是一個需要 FO 授權的 Material。**
**F-31 是三筆裡唯一嚴重的一筆，而且它已經真的漏掉一次，見下方獨立一節。**

#### 一、同一個錯誤數字的第三次出現——我 cycle 10 的漏交付，已修

cycle 10 我重跑後把配對表更正為 27／1 與 8／2，並更正了 Summary。**但我漏掉 `### F-25：論據換掉了，結論沒變` 一節裡的摘要句**，它仍寫著「28 對全部只差日期標籤、0 對有實質差異」與「`TODO.md` 10／10／0」。

**為什麼會漏**：我當時用「搜 `28／28`」來找所有要更正的地方，而**那一句的字面是「28 對全部只差日期標籤」，不含 `28／28`**，所以沒被命中。

**教訓，寫成可照著做的形式**：**更正一個數字時，要搜的是那個數字所支撐的宣稱，不是那個數字的某一種寫法。**
我改用三個語意詞各搜一次（`配對`／`只差日期標籤`／`實質差異`）才找到它。
**這是 F-11／F-18／F-22／F-29 的同一形狀第五次出現，而這一次載體是我自己的搜尋方式**——
我對別人的判準要求「對齊語意而不是某一次的寫法」，自己搜尋時卻用了字面。已更正，原句保留於該節的 cycle 11 補述內。

#### 二、F-30（新 observation，**未修**）：reviewer 的 `66／28` 是一個會靜默漏數的管線產生的

- **released user 與 normal workflow**：日後有人要複驗 F-25，會照著 reviewer 的 F-25 記錄去跑它引用的數字。
- **observable harm**：該記錄寫「`git show --numstat d9da392` 對本票是 **80／28**（`--unified=0` 下 66／28）」。**括號裡那句有兩個問題。**
  **(a) `--numstat` 不受 `--unified=0` 影響**——實測 `git show --numstat --unified=0 --format= d9da392` 仍是 **80／28**，與不帶該旗標完全相同。所以「`--unified=0` 下 66／28」這個因果不成立。
  **(b) `66` 這個數字查得出來源，而來源是一個會靜默漏數的型樣。** 實測：對 `git show --unified=0` 的輸出數新增行，
  `grep -c '^+[^+]'` 得 **66**，而真實新增行是 **80**——差的 **14 行全部是「空白的新增行」**（在 diff 裡就是一個孤立的 `+`，`^+[^+]` 不匹配它）。
  **66 ＋ 14 ＝ 80，完全對得起來。**
- **affected value AC 或邊界**：**不影響任何 AC，也不影響 F-25 的結論**（逐行配對的結論獨立於這個數字，且已由我重跑驗證）。它影響的是**記錄的可複驗性**。
- **trigger evidence**：上述四條實測指令，每一條的 stderr 皆 0 位元組。

**建議 materiality = Polish**：交付物無缺陷，只有一筆歷史記錄裡的括號說明不可複驗。
**建議 task ownership：不屬我。** 那是 reviewer 的 finding 記錄，依本專案「`record` 不改寫」的規範，
**修正它的正確方式是追加一則補述，而補述該由誰寫、要不要寫，是 FO 的決定，不是我的。我沒有動那一段。**
**promote-to-material 條件**：有人照著那個括號去複驗 F-25，因為數字對不上而誤判 F-25 的結論不成立。

**這一筆為什麼值得記下來，而不是當成一個手誤。**
reviewer 在 F-25 裡做的事，是**指出 implement 引用的證據支撐不了它的結論**——那個判斷完全正確，我重跑也確認了。
**而 reviewer 在同一句話裡附上的佐證數字，本身來自一個靜默漏數 14 行的管線。**
**形狀與 F-27 一模一樣**：一個管線印出一個看起來合理的數字，而它其實沒有數到全部；
沒有任何錯誤訊息，`grep -c` 的離開碼是 `0`，**唯一能發現它的方法是知道正確答案並去對。**
**本票十輪的主題就是這件事，而它在「指出別人證據不足」的那一句話裡又出現了一次。**
**這不減損 F-25**——它加強了本票的結論：**會靜默漏數的管線不挑人。**

### F-31：date-check 比對的是 commit 的 **UTC 日期**，不是規則要求的 author date —— 已證實的 fail-open

> **2026-09-24（cycle 12）：本節寫於 cycle 11，當時標題是「新 finding，未修」。FO 已判 Material 並授權 fix，已修並實測七個方向，處置記於本節末。原文保留於下不改寫。**

**依 `## Review-finding disposition`，我只記錄與提案，不自行修。這是本輪最嚴重的一筆，而且它已經真的漏掉一次。**

**怎麼發現的**：交付前我對本票做最後一次自查，`grep -c '2026-09-2[56]'` 回 **1**——
我在 cycle 11 報告裡描述 F-27 自抓事件時，又把那個日期寫成了完整 ISO 形式。
**而同一次自查裡 date-check 印的是 `violations=0`。兩件事不可能同時為真，所以其中一個壞了。** 壞的是 date-check。

- **released user 與 normal workflow**：任何人在**下午或傍晚**（本機 `PDT`，UTC−7）commit 本票，
  然後照通過條件執行 date-check。**這是最普通的工作流，不需要任何特殊操作。**
- **observable harm**：正本用 `new Date(t*1000).toISOString().slice(0,10)` 取 commit 日期，**那是 UTC 日期**。
  而日期規則第 1 條要求的參照是 **author date**（`git log --format='%h %ad' --date=short`，即**作者時區**的日期）。
  作者時區落後 UTC 時，兩者可以差一天，**而查核會放行一個真的指向未來的日期**。
- **affected value AC 或邊界**：`AC-4` 之外，它直接打到 **F-27 本身的通過條件**——
  captain 要求把這條查核存成正本的理由就是「它會靜默回報 0」，**而它現在用另一個機制靜默回報 0**。
- **trigger evidence（本輪真實發生，非假想）**：commit `c1cc10c` 的 author date 是 **2026-09-24 17:39:14 −0700**，
  `%ad --date=short` 為 **2026-09-24**，但 `toISOString()` 取到的是 **`09-25`**（年份同為 2026，以下同）。
  該 commit 引入的那一行含完整 ISO 形式的 `09-25`，而查核拿來比的基準也是 `09-25`，**「晚於」不成立，所以沒有被報。**
  **本節提到 `09-25` 時一律省略年份**，依「涵蓋面聲明（一）」的例外：寫全了就是在本票內再種一個指向未來的完整 ISO 日期。
  **而那個例外在這裡特別重要**——F-31 一旦修好，這些行若寫成完整形式就會立刻被報。**我不打算留一組修好之後才爆的行給下一個人。**

**A／B 對照（臨時 git repo，唯一變數是同一個本地日期內的時鐘時間）**：

| 情境 | `%ad --date=short` | 查核實際取到的日期 | 結果 |
|---|---|---|---|
| author `2026-09-24T17:39:14-07:00` | `2026-09-24` | **`09-25`**（UTC，隔天） | `violations=0`，exit `0` —— **漏抓** |
| author `2026-09-24T09:00:00-07:00` | `2026-09-24` | `2026-09-24`（同日） | `DATE-FAIL … text=…09-25`，`violations=1`，exit `1` —— 抓到 |

**同一段文字、同一個本地日期，只差幾小時的時鐘時間，一個漏抓一個抓到。**

**建議 materiality = Material。** 四個欄位都成立：受支援的工作流（下午 commit）、可觀察損害（真的指向未來的日期被放行）、
打到 F-27 的通過條件與 `AC-4`、以及**本輪真實觸發的證據**。**這不是 Deferred risk——它已經發生了。**
**建議 task ownership：屬本票。** 那個區塊是本票 cycle 10 新增的。

**建議 disposition = fix**，修法如下（**我未實作，等 FO 授權**）：
`git blame --line-porcelain` 除了 `author-time` 也會吐 **`author-tz`**（例如 `-0700`）。
把時區位移加上去之後再格式化，取到的就是作者時區的日期，與規則第 1 條的 `%ad --date=short` 一致：

    else if((m=/^author-tz ([+-]\d{4})/.exec(ln))) tz=m[1];
    // …
    const sg=tz[0]==='-'?-1:1, off=sg*(parseInt(tz.slice(1,3),10)*3600+parseInt(tz.slice(3,5),10)*60);
    const cd=new Date((t+off)*1000).toISOString().slice(0,10);

**收之前必須驗的方向（至少五個）**：上表兩列各自要翻成「抓到／抓到」；
合法的歷史引用仍不報；`scanned=0` 仍回離開碼 `2`；真實兩檔仍 `violations=0`；
**並且要驗一個 UTC 之前的時區**（例如 `+0800`），確認修法不會在另一個方向上變成誤報。
**`author-tz` 缺漏時要當失敗處理，不要當 `+0000`**——否則就是把同一個 fail-open 換一個入口。

**這一筆對本票的意義，我寫明白。**
**F-27 的整個論證是「把『有沒有真的跑起來』做成查核自己的輸出，而不是一條要人記得的規則」。那個論證成立，我仍然認為選區塊是對的。**
**但它保護的是「什麼都沒比對到」這一種失效，而不是「比對到了、基準卻錯了」這一種。**
`scanned` 非零、`stderr` 空、離開碼 `0`——**三個守門全部通過，而判準的參照點錯了一天。**
**這是涵蓋面問題的第十六處，也是最尖的一處：它就在本票宣稱已經解決的那個缺陷旁邊。**
**「0 筆」的精確讀法因此要再收一次**：它現在只等於「沒有任何完整 ISO 日期晚於引入該行 commit 的 **UTC** 日期」。

#### 處置（2026-09-24 cycle 12）：**fix，已完成，FO 判 Material**

**修法就是上面提案那一份，一字未改。** 正本改用 `git blame --line-porcelain` 已經吐出的 **`author-tz`**
把 `author-time` 位移到作者當地時間，再格式化取日期——**與規則第 1 條的 `%ad --date=short` 對齊**。

**FO 的硬條件已實作並實測**：**取不到 `author-tz`（或 `author-time`）時一律判失敗，不預設 `+0000`。**
摘要行多印一個 `no-tz=<筆數>`，並**新增離開碼 `3`** 專指這個情況。
**為什麼硬條件非做不可**：預設 `+0000` 就是「拿不到基準時，改用 UTC 當基準」——**那正是 F-31 本身**。
**一個修法若在取不到資料時退回被修掉的那個行為，它沒有修掉任何東西，只是縮小了觸發面。**

**三個離開碼現在各指一種死法，這是刻意的**：`1` 有違規、`2` 什麼都沒比對到、`3` 取不到作者時區。
**摘要行自己就分得出「乾淨」與「沒比到」與「基準不可信」**——不需要任何人記得去查 `stderr`。

**七個方向全部從文件抽出後實跑，每一個分別量測 exit code 與 stderr**（`stderr` 全為 **0 位元組**）：

| # | 方向 | 結果 | exit |
|---|---|---|---|
| 1 | **原本漏掉的那個形狀**：author `17:39 −0700`、行內 `09-25` | `DATE-FAIL … commit=2026-09-24 text=…09-25`、`violations=1` | **1（已抓到）** |
| 2 | 對照組：author `09:00 −0700`、同一段文字 | 同上，`violations=1` | 1（未回歸） |
| 3 | 合法歷史引用（行內 `2026-04-30`，早於 commit） | `violations=0 no-tz=0` | 0（不誤報） |
| 4 | 空的受版控檔案（什麼都沒比對到） | `scanned=0` ＋ `DATE-FAIL scanned=0` | **2** |
| 5a | **UTC 之前的時區** `+0800`，行內日期＝當地日期 | `violations=0` | **0（不誤報）** |
| 5b | `+0800`，行內日期比當地日期晚一天 | `DATE-FAIL … commit=…09-25 text=…09-26` | 1（會抓） |
| 6 | **`author-tz` 被抽掉**（以假的 `git` 濾掉 blame 的該行） | `no-tz=1` ＋ `DATE-FAIL … refusing to guess` | **3** |
| 7 | 真實兩檔 | `violations=0 no-tz=0`、`scanned` ＝兩檔 `wc -l` 之和 | 0 |

**第 5a 列是我沒有預料到的，值得單獨寫出來：這個缺陷是雙向的，而票內只記了一個方向。**
我原本只把它當成 fail-open（作者時區落後 UTC → 放行真的違規）。
**測 `+0800` 才發現另一個方向：作者時區領先 UTC 時，舊判準會把一個完全合法的當日日期標籤報成違規。**
實測同一個 commit（當地 `09-25 06:00 +0800`）、同一行文字：**舊判準 `DATE-FAIL`、exit `1`；新判準 `violations=0`、exit `0`。**
**這一列很重要，因為它打到 F-22 的教訓**：一條會常態誤報的檢查會被習慣性忽略，
**而那種忽略會把方向一的 fail-open 一起帶過去。** 兩個方向是同一個 bug 的兩面，修一個就修掉兩個。
**我沒有在提案時想到這一面，是測出來的**——這也是為什麼「五個方向」我實際跑了七個。

#### F-27 與 F-31 是兩種不同的死法，票內原本只記了一種

**這個區分依 FO 2026-09-24（cycle 12）指示留在票內，因為它是這一串的結論。**

| | F-27 修掉的那一種 | F-31 修掉的那一種 |
|---|---|---|
| 失效形狀 | **什麼都沒比對到**，卻印出成功樣貌的摘要 | **比對了很多**，但**基準點錯了** |
| 本票的實例 | BSD awk 無 `strftime`，印 `awk: calling undefined function strftime` 到 `stderr` 後回報 `0 筆` | `toISOString()` 取 UTC 日期而非 author date，差一天 |
| 被什麼抓住 | `scanned=0` → 離開碼 `2`。**摘要行自己就不對** | **什麼都沒抓住**。`scanned` 非零、`stderr` 空、離開碼 `0`——三道護欄全過 |
| 怎麼發現的 | cycle 9 改用 Node 重寫時發現 | **兩個獨立方法給出矛盾答案**：`grep -c` 回 1、date-check 回 `violations=0` |

**F-27 的論證沒有被推翻。** 把查核存成正本、把「有沒有真的跑起來」做成查核自己的輸出——那是對的，而且 `scanned=0` 這道門確實有效。
**但它只擋住「沒比到」，不擋「比錯基準」。** 而票內從 cycle 10 起只寫了前者，還把它寫成了 F-27 的完整價值主張。
**這是一個涵蓋面聲明的涵蓋面不足**——同一個形狀又上了一層。

**寫給下一個人的判準**：一條查核的自我保護要分開回答兩個問題。
**(一) 它有沒有真的比對到東西？**（本票的答案：`scanned` 非零，否則離開碼 `2`）
**(二) 它比對的基準可信嗎？**（本票的答案：基準必須來自規則指定的來源；**取不到就失敗，不要退回預設值**，否則離開碼 `3`）
**只答第一個問題的查核，會在第二個問題上靜默通過，而它的摘要行看起來完全正常。**

> **2026-09-24（cycle 13）更正：本小節寫「兩個問題」，那個數字不夠。原句保留於上不改寫。**
> **有第三個問題，而本票當時已經有它的機制、卻沒有它的名字**：`DUP-MARKER` 的「唯一性要計數」與 F-21 收斂寫法的「斷言恰好一行」都是它。
> **因為沒有被升成一般性的問題，它被用在偵測器上，卻沒有被用在同一個 G-7 的另外兩個檔案上——F-32 就是那個代價。**
> 三個問題的完整敘述、為什麼三者不能互相替代、以及姊妹票 `012` 獨立到達同一結論的佐證，見 cycle 13 報告的
> 「**三個問題：比較次數、基準來源、對象身分**」一節。**本則只放指標，不複述。**

### 兩條硬規則與邊界

- **`sort`／`uniq` 全程未用於判定中文字串。** 本輪計數用 `grep -c`、`grep -o … | wc -l`、`wc -l`、`perl -ne` 累加。
- **BSD awk 沒有 `strftime`。** 本輪唯一動到的是偵測器的 `node` 分支型樣，未引入任何時間函式。
  **而且不是靠「沒用到」保證的**：本輪每一次 awk 執行都把 stderr 導到獨立檔案分別量測，**全部 0 位元組**，**未以最後一行判定**。
- **五個活的可執行區塊逐一分別量測 exit code 與 stderr**，結果見下節。
- **未動 `src/`**：本輪 `src/` 零改動，`layout.tsx` 那 `+1` 行是 cycle 8 已授權已落地的綁定註解，**我本輪沒有再動它**。
- **未動 `PresentDetail.tsx`**、build 產物、Next.js 設定；**`src/data/*.json` 與 `main` sha256 相同、未跑 `sync-content`**。
- **AC-2 維持未達成**，依賴尚未核准動工的 feature `039`，本輪未代為宣稱任何 A 類項目通過。
- **`## Acceptance criteria` 全節一個字未動**，仍 **1622B**／sha256 `93e5bf6a95f16592`。

### 驗證與可否證性

- **五個活的可執行區塊全部從文件抽出後執行，逐一分別量 exit code 與 stderr**（抽取採 fence-state 感知、要求標記在區塊首行，且抽取器在標記不唯一或找不到時以非零離開）：
  G-6 `G-6 PASS`／exit 0／stderr **0B**；G-7 `G-7 PASS`／exit 0／stderr **0B**；date-check `violations=0`、`scanned` 非零／exit 0／stderr **0B**；
  偵測器 `AC-OWNED` 一筆／`STRAY` 零筆／`DUP-MARKER` 零筆／exit 0／stderr **0B**；AC-3 的 `grep` 11 行命中（`1／9／1`，三檔皆 ≥1）／exit 0／stderr **0B**。
  **四個標記各抽到恰好一個區塊**；**五個區塊、四個標記，兩個計數不同，不要互相代入**（AC-3 的 `grep` 無標記，屬 captain 所有）。
- **F-29 的修法每一個方向都有一個能讓它失敗的輸入，且該輸入實跑過**：若修法無效，只取內容層 `RE` 的那一行仍會是 `STRAY` 0——實測變 1；
  若修法過寬，十條合法指令會出現誤報——實測仍 0；若修法打壞既有涵蓋面，六行真副本或七種變體會少報——實測仍 6 與 7。**三個方向都可否證，都跑過。**
- **反向全部驗過**：真實候選零 `STRAY`、零 `DUP-MARKER`；`DUP-MARKER` 對四種標記複製全部仍會叫；date-check 對植入的未來日期會叫、對早於 commit 的歷史引用不叫、對 `scanned=0` 回離開碼 `2`。**只驗通過等於沒驗。**
- **本節自己遵守日期規則**：寫完後對本票與 `docs/health-check/TODO.md` 跑 date-check 正本，`violations=0`、`stderr` 0 位元組；
  **本節提到那兩個錯誤日期時一律省略年份**，依「涵蓋面聲明（一）」的例外範圍——**cycle 10 我正是在這裡被自己的查核抓過一次。**
- **這個 `violations=0` 要打一個折，我自己先說**：依本輪新發現的 **F-31**，該查核的基準是 commit 的 **UTC** 日期而非 author date，
  所以它目前**只能保證「沒有日期晚於 UTC 日期」，比規則要求的寬最多一天**。
  **本輪四個 commit 全部落在會被放寬的那個情況內**（本地 `09-24` 傍晚、UTC 隔天），**所以這個 0 筆不是一個乾淨的 0。**
  **我沒有拿它當通過證據**：我另外用 `grep -c '2026-09-2[56]'` 直接掃全票，確認**目前 0 處**完整 ISO 形式的那兩個日期——
  **那條 grep 不依賴 commit 日期，所以不受 F-31 影響。** 兩個獨立方法都過，才是我敢寫「本節遵守日期規則」的根據。
- **本輪新增的兩筆自查（漏交付的摘要句、F-30）都不是指派項目**，是執行指派時順手查出來的。**第一筆我修了（它是我自己的漏交付），第二筆我沒修（它不是我的段落，且依規範該由 FO 決定要不要追加補述）。**

### Summary

**F-29 已修，改動一個 token。** 偵測器 `node` 分支加上 `字第`，因為字元類寫法會把票號本身拆開（`[2２][7７][2２]`）而 **`字第` 這兩個字不會被拆**，
且它同時被 `node .*-e` 與 `history\.json` 夾住，所以不擴大誤報面。**四個方向＋真實候選全部實跑**：漏抓的那一行 0→1，六行真副本仍 6（六個位置各 6），七種變體仍 7，十條合法指令仍 0，真實候選完全不變；每一次的 exit code 與 stderr 分別量測，stderr 全為 0 位元組。
**這一筆的意義不是「少了一個字面值」，而是偵測器對自己的正本盲目**：判準想斷言「這一行在做 G-6 的內容層斷言」，實際斷言的是「這一行含票號的某一種拼法」，**而寫出另一種拼法的正是 G-6 正本自己**。正本沒漏抓只因為它同時帶著 id 層的 `'h2'`——那是巧合，不是判準在起作用。

**F-26 的歸屬我記錯了，已更正三處。** 那段「僅限本則」的措辭出自 FO 的授權書，不是 captain 的裁決；captain 的裁決只有「修日期檢查」。
**所以我當時判斷的門檻比我以為的低**——我以為在偏離 captain 的裁決，實際是在更正一個經由「reviewer 寫『2 處』→ FO 照抄 → 初稿照抄」傳進來的數字。
**這條傳播鏈本身值得記**：四個環節沒有人清點，而每一環都讀起來完全合理。**一個沒有人真的數過的數字會一路傳到交付物裡，沿途不會有任何一句話看起來可疑。** 實際是**數十處，差了一個數量級**（精確值只記在「涵蓋面聲明（一）」一處，理由見該則）。

**兩個觀察已依指示獨立成節。**「偏誤的方向」附四筆並排對照表，並說明為什麼同向比個別數字重要——**偏誤方向可以被下一個人拿去檢查任何一份報告，而且不需要重跑任何東西、不需要懂被檢查的內容**，只需要那份報告誠實列出自己哪裡沒對上。
「F-27 的第一個獵物是我自己的缺陷」說明散文版判準要抓到那一行需要同時成立四件事，**而 cycle 9 的紀錄已經證明第四件（記得看 `stderr`）會失敗**。原本夾在別處的兩段改為指標、不複述，避免多一份會分岔的副本。

**本輪我自己抓到兩筆，都不在指派範圍內。** 一是**同一個錯誤數字的第三次出現**：cycle 10 我漏掉 F-25 一節的摘要句，因為我搜的是字面 `28／28` 而那一句寫「28 對全部只差日期標籤」。
**更正一個數字要搜它支撐的宣稱，不是它的某一種寫法**——這是 F-11／F-18／F-22／F-29 的形狀第五次出現，載體是我自己的搜尋方式。已修。
二是 **F-30（未修，建議 Polish、不屬我）**：reviewer 的 F-25 記錄裡「`--unified=0` 下 66／28」不可複驗——`--numstat` 不受 `--unified=0` 影響（實測仍 80／28），
而 `66` 來自 `grep -c '^+[^+]'`，**它靜默漏掉 14 行「空白的新增行」，66＋14＝80 完全對得起來**。
**這不減損 F-25**（其結論獨立於該數字，我也重跑確認過），但形狀與 F-27 一模一樣：**一個管線印出看起來合理的數字，離開碼 `0`、沒有錯誤訊息，而它沒有數到全部。**
**會靜默漏數的管線不挑人**——它出現在「指出別人證據不足」的那一句話裡。

**本輪最重要的一筆不是指派項，是 F-31——一個已證實的 fail-open，我未修，等 FO 授權。**
交付前最後一次自查時，`grep -c '2026-09-2[56]'` 回 **1**，而同一次 date-check 印 `violations=0`。
**兩件事不可能同時為真。** 壞的是 date-check：它用 `toISOString()` 取 commit 日期，那是 **UTC**，
而日期規則第 1 條要的是 `%ad --date=short`（**作者時區**的日期）。**本機是 UTC−7，本輪四個 commit 全在本地 `09-24` 傍晚，UTC 已是隔天。**
A／B 對照只差幾小時的時鐘時間：17:39 那一列 `violations=0` **漏抓**，09:00 那一列 `DATE-FAIL`、exit `1` **抓到**。
**這一筆打到 F-27 自己的通過條件**：captain 要求存成正本的理由就是「它會靜默回報 0」，**而它現在用另一個機制靜默回報 0**——
`scanned` 非零、`stderr` 空、離開碼 `0`，**三個守門全部通過，而判準的參照點錯了一天。**
**我仍然認為選存成正本是對的**：那個論證要解的是「什麼都沒比對到」，而它確實解了；
**F-31 是另一種失效——比對到了，基準卻錯了。** 兩者不互相取代，而票內原本只寫了前者。
**建議 Material ＋ fix**（四個證據欄位全部成立且已真實觸發），修法、五個必驗方向、以及「`author-tz` 缺漏要當失敗而非 `+0000`」都寫在該節。
**已把它寫進日期規則的「涵蓋面聲明（三）」與正本的通過條件旁**，所以在修好之前，看到 0 筆的人會先看到這條限制。

**未越界**：AC 全節一字未動（**1622B／sha256 `93e5bf6a95f16592`**）；`src/` 本輪零改動；`PresentDetail.tsx` 零改動；`src/data/*.json` 與 `main` 相同、未跑 `sync-content`；AC-2 維持未達成。**diff 基準現算 `git merge-base main HEAD` = `d0a9bda2f`。**
**date-check 的 `violations=0` 我沒有拿來當通過證據**——它受 F-31 影響。我另外用一條不依賴 commit 日期的 `grep` 確認全票目前 **0 處**完整 ISO 形式的那兩個日期，兩個獨立方法都過。

## Stage Report: implement (cycle 12)

本輪處理 FO 授權的 **F-31 fix（Material）** 與 **F-30 追加補述**，並把 F-27／F-31 的區分與兩條判準留在票內。**改一個檔案**：本票。
**diff 基準現算**：`git merge-base main HEAD` = **`d0a9bda2f`**（本輪複算，未沿用記憶中的 SHA）。
**本輪 commit：`97700b4`**（author date **2026-09-24**，依日期規則第 1 條取實際 commit 日期；本節所有 `2026-09-24（cycle 12）` 標籤皆據此）。

- DONE: **F-31 fix（Material，FO 授權）。** date-check 正本改用 `git blame --line-porcelain` 的 **`author-tz`** 位移到作者當地時間，與規則第 1 條的 `%ad --date=short` 對齊。
  **FO 的硬條件已實作並實測**：取不到 `author-tz`／`author-time` 時一律判失敗、**回離開碼 `3`**、不預設 `+0000`。摘要行多印 `no-tz=<筆數>`。
  **七個方向全部從文件抽出後實跑，逐一分別量測 exit code 與 stderr（全部 0 位元組）。** 詳表見 F-31 一節末的「處置」小節。
- DONE: **F-27 與 F-31 的區分已寫進票內**（F-31 節末獨立小節，附對照表）：**F-27 擋的是「什麼都沒比對到」，F-31 擋的是「比對了很多但基準錯了」**；票內原本只記了前者。
  **證據**：小節 `#### F-27 與 F-31 是兩種不同的死法，票內原本只記了一種`，位於 F-31 一節末、緊接「處置」小節之後；
  內含一張**四列對照表**（失效形狀／本票的實例／被什麼抓住／怎麼發現的），逐列把兩種死法並排。
  **其中「被什麼抓住」那一列是這個區分的要點**：F-27 那一種由 `scanned=0` → 離開碼 `2` 擋住，**摘要行自己就不對**；
  F-31 那一種**什麼都沒擋住**——`scanned` 非零、`stderr` 空、離開碼 `0`，三道護欄全過而基準點差一天。
  **而「怎麼發現的」那一列記下兩者的偵測途徑不同**：F-27 是 cycle 9 改用 Node 重寫時發現的；
  F-31 是**兩個獨立方法給出矛盾答案**才暴露的（`grep -c` 回 1、同一次 date-check 回 `violations=0`）——**單一方法不會發現它。**
  **前瞻形式的判準也寫進去了**，就在同一小節末尾：**一個檢查的自我保護必須分別回答兩個問題——它到底有沒有真的比，
  以及它的基準可不可信；只回答第一個的檢查會在第二個上靜默通過。** 本票對這兩個問題各給了一個機械答案：
  第一個是 `scanned` 非零、否則離開碼 `2`；第二個是基準必須來自規則指定的來源（`author-tz`），**取不到就失敗、不退回預設值**、否則離開碼 `3`。
  **可否證點**：若這個區分只是換句話說，那兩種死法應該被同一道門擋住——實測不是，方向 4（空檔）回 `2` 而修法前的方向 1（`17:39 −0700`）回 `0`，**兩個不同的離開碼對應兩種不同的失效**。
- DONE: **F-30 追加補述（FO 授權）。** 一則、標日期、寫明 `66` 的來源（`grep -c '^+[^+]'`）與 14 的去處（空白的新增行），並附三條可重跑指令。
  **reviewer 原文一字未改**：以 `sed` 抽出整個 `## Stage Report: review (cycle 3)` 區段與 HEAD 比對，**110 行 → 129 行，新增 19 行、刪除與變更 0 行**。
- DONE: **兩條判準各寫成一句**（獨立一節「兩條寫給下一個人的判準」）：
  **(1)「更正一個數字時，要搜它支撐的那個宣稱，而不是它的某一種寫法。」**（FO 指定逐字保留，已逐字寫入；原本四處各自的措辭也都留著）
  **(2)「一個會因為被書寫而改變的數字，不該被寫在八個地方。」** 並附對照組：**活的部分 16／8 全程未動**，差別在於一個計數把記錄自己算了進去。

### 第 5a 個方向是我沒預料到的：這個缺陷是雙向的

**我在 cycle 11 提案時只把 F-31 當成 fail-open，那個描述不完整，測出來才知道。**

提案時我寫的是「作者時區落後 UTC 時，查核會放行一個真的指向未來的日期」——那是對的，但只有一半。
**測 `+0800` 那個方向時發現另一半：作者時區領先 UTC 時，舊判準會把一個完全合法的當日日期標籤報成違規。**

**實測同一個 commit（當地 `09-25 06:00 +0800`）、同一行文字**：舊判準 `DATE-FAIL`、`violations=1`、exit `1`；**新判準 `violations=0`、exit `0`**。

**為什麼這一半也重要，而不是「反正修一個就修掉兩個」**：F-22 的教訓是**一條會常態誤報的檢查會被習慣性忽略**，
**而那種忽略會把方向一的 fail-open 一起帶過去。** 一個人如果習慣了「date-check 又亂叫」，他就不會去看它真的叫對的那一次。
**兩個方向是同一個 bug 的兩面**：基準錯了一天，落後 UTC 就漏報、領先 UTC 就誤報。

**所以 FO 說的五個方向我跑了七個**，而多跑的那兩個（`+0800` 兩列）正是提案裡沒寫到的那一面。
**寫下來的理由**：我提案時對自己找到的缺陷描述得不完整，**而我是靠跑它、不是靠想它發現的**——與 F-29 第一版修法同一個教訓。

### 修好之後它立刻又抓到我一次

**這一輪的 date-check 上線後第一件事，又是抓我自己的一行。**

我在上面那張七方向表裡寫第 5b 列時，把測試輸出裡的 commit 日期抄成了**完整 ISO 形式**。
修好的正本立刻報 `DATE-FAIL <本票>:2937 0000000 commit=2026-09-24 text=…09-25`、`violations=1`、exit `1`。
**注意 `commit=2026-09-24`——那是修好之後的基準（作者當地日期）。修法前的基準會是隔天，而隔天不晚於隔天，所以修法前這一行不會被報。**
已改為裸寫法，改完 `violations=0 no-tz=0`、exit `0`。

**這是同一條查核連續兩輪抓到它的作者**（cycle 10 一次、cycle 12 一次），而**第二次是修好的版本抓到修法前會漏掉的那個形狀**。
**我沒有把這當成巧合寫過去**：它說明這個缺陷的觸發率一點都不低——**本機每天下午之後寫的每一行都在那個一天的縫裡**，
而票內從 cycle 10 到 cycle 11 之間就真的漏掉一次。**一個「罕見」的 fail-open 在這裡的實際命中率是兩輪兩次。**

### 硬條件為什麼非做不可

**FO 把「`author-tz` 缺漏必須判失敗、不得預設 `+0000`」訂成授權的硬條件。我實作了，而我想把理由寫清楚。**

**預設 `+0000` 的意思是「拿不到基準時，改用 UTC 當基準」——那正是 F-31 本身。**
**一個修法若在取不到資料時退回被修掉的那個行為，它沒有修掉任何東西，只是縮小了觸發面。**
而縮小觸發面比原本更危險：原本它在本機**每天下午都會**漏，所以有機會被抓到；
退回預設值之後它只在 blame 格式改變時才漏，**那種情況罕見、沒人在看，而且摘要行照樣是 `violations=0`。**

**實作與實測**：`author-tz` 被抽掉時（以一個假的 `git` 濾掉 blame 輸出的該行），
正本印 `DATE-FAIL … author-time/author-tz missing -- refusing to guess`、`no-tz=1`，**回離開碼 `3`**。
**三個離開碼現在各指一種死法**：`1` 有違規、`2` 什麼都沒比對到、`3` 取不到作者時區。
**摘要行自己就分得出「乾淨」「沒比到」「基準不可信」**，不需要任何人記得去查 `stderr`。

### 兩條硬規則與邊界

- **`sort`／`uniq` 全程未用於判定中文字串。** 本輪計數用 `grep -c`、`grep -o … | wc -l`、`wc -l`、`perl -ne` 累加、`cmp`、`diff`。
- **BSD awk 沒有 `strftime`。** 本輪修的是 date-check 的 Node 實作，**未使用任何 awk 時間函式**；偵測器本輪未改。
  **五個正本區塊逐一分別量測 exit code 與 stderr**，全部 exit `0`、stderr **0 位元組**，**未以最後一行判定**。
- **未動 `src/`**：本輪 `src/` 零改動，`layout.tsx` 的 `+1` 是 cycle 8 已落地的工作，我沒有碰。
- **未動 `PresentDetail.tsx`**、build 產物、Next.js 設定；**`src/data/*.json` 與 `main` sha256 相同、未跑 `sync-content`**。
- **AC-2 維持未達成**，依賴尚未核准動工的 feature `039`，本輪未代為宣稱任何 A 類項目通過。
- **`## Acceptance criteria` 全節一個字未動**，仍 **1622B**／sha256 `93e5bf6a95f16592`。
- **未改寫 reviewer 的 F-25 原文一個字**，F-30 只追加一則補述，已以區段比對證明（新增 19 行、刪除變更 0 行）。

### 驗證與可否證性

- **五個活的可執行區塊全部從文件抽出後執行，逐一分別量測 exit code 與 stderr**（抽取採 fence-state 感知、要求標記在區塊首行，抽取器在標記不唯一或找不到時以非零離開）：
  G-6 `G-6 PASS`／exit 0／stderr **0B**；G-7 `G-7 PASS`／exit 0／stderr **0B**；
  **date-check `violations=0 no-tz=0`、`scanned` ＝兩檔 `wc -l` 之和／exit 0／stderr 0B**；
  偵測器 `AC-OWNED` 一筆／`STRAY` 零筆／`DUP-MARKER` 零筆／exit 0／stderr **0B**；AC-3 的 `grep` 11 行命中（`1／9／1`，三檔皆 ≥1）／exit 0／stderr **0B**。
  **四個標記各抽到恰好一個區塊**；活的可執行區塊仍是 **5 個**，標記仍是 **4 個**（AC-3 的 `grep` 無標記，屬 captain 所有）。
- **這一輪的 `violations=0` 可以當通過證據了，而且我說明為什麼**：cycle 11 我拒絕引用它，因為當時它的基準錯了一天。
  **本輪基準已與規則第 1 條對齊，而且「基準取不到就失敗」也實測過**，所以它的輸出現在有意義。
  **我仍然做了獨立複驗**：以不依賴 commit 日期的 `grep -c '2026-09-2[56]'` 掃全票，**0 處**。兩個獨立方法都乾淨。
- **每一條改動都有一個能推翻我的具體探測，且該探測實跑過**：
  若 F-31 沒修好，方向 1（author `17:39 −0700`）仍會是 `violations=0`——實測變 `1`；
  若修法在另一個方向上過嚴，方向 5a（`+0800` 當日日期）會誤報——實測 `0`；
  若硬條件沒生效，方向 6（抽掉 `author-tz`）會回 `0`——實測回 `3`；
  若 `scanned=0` 那道門被我改壞，方向 4 會回 `0`——實測回 `2`。
- **反向全部驗過**：合法歷史引用不報；真實候選零 `STRAY`、零 `DUP-MARKER`；`DUP-MARKER` 對四種標記複製全部仍會叫；偵測器對六行真副本仍報 6、七種變體 7、十條合法指令 0。**只驗通過等於沒驗。**
- **本節自己遵守日期規則**：寫完後對本票與 `docs/health-check/TODO.md` 跑修好的 date-check 正本，`violations=0 no-tz=0`、exit `0`、`stderr` 0 位元組；
  **本節提到那兩個錯誤日期時一律省略年份**，依「涵蓋面聲明（一）」的例外。

### Summary

**F-31 已修，FO 判 Material。** date-check 正本改用 `--line-porcelain` 已經吐出的 `author-tz` 把 `author-time` 位移到作者當地時間，與規則第 1 條的 `%ad --date=short` 對齊。
**FO 的硬條件我實作了，並且把理由寫進票內**：取不到 `author-tz` 就判失敗、回離開碼 `3`、**不預設 `+0000`**——
因為預設 `+0000` 就是「拿不到基準時改用 UTC 當基準」，**那正是 F-31 本身**。
**一個修法若在取不到資料時退回被修掉的那個行為，它沒有修掉任何東西，只是縮小了觸發面**，而縮小之後更難被抓到。
**三個離開碼現在各指一種死法**（`1` 有違規、`2` 什麼都沒比到、`3` 基準不可信），**摘要行自己就分得出來。**

**七個方向全部實跑，每一個分別量測 exit code 與 stderr（全部 0 位元組）**：原本漏掉的那個形狀由 `violations=0` 變成 `violations=1`；對照組未回歸；合法歷史引用不報；`scanned=0` 仍回 `2`；`author-tz` 被抽掉回 `3`；真實兩檔 `violations=0 no-tz=0`。

**其中兩個方向是我提案時沒想到的，而它們翻出這個缺陷是雙向的。** 我 cycle 11 只把 F-31 描述成 fail-open。
**測 `+0800` 才發現另一面：作者時區領先 UTC 時，舊判準會把一個完全合法的當日日期標籤報成違規**（實測舊判準 exit `1`、新判準 exit `0`）。
**這一面也重要，因為 F-22 的教訓是一條會常態誤報的檢查會被習慣性忽略，而那種忽略會把 fail-open 那一面一起帶過去。**
**我提案時對自己找到的缺陷描述得不完整，而我是靠跑它發現的，不是靠想它**——與 F-29 第一版修法同一個教訓。

**F-27 沒有被推翻，但它的價值主張在票內原本寫得太寬。** 存成正本、把「有沒有真的跑起來」做成查核自己的輸出——那是對的，`scanned=0` 這道門確實有效。
**但它只擋「沒比到」，不擋「比錯基準」。** 兩者的對照表已寫進票內，並留下一條給下一個人的判準：
**一條查核的自我保護要分開回答兩個問題——它有沒有真的比對到東西，以及它比對的基準可信嗎；只答第一個的查核會在第二個上靜默通過。**

**F-30 已追加補述，reviewer 原文一字未改**（區段比對：新增 19 行、刪除變更 0 行）。補述寫明 `66` 來自 `grep -c '^+[^+]'`、
**差的 14 行是「空白的新增行」**（diff 裡是一個孤立的 `+`，型樣不匹配），`66 + 14 = 80`，並附三條可重跑指令。
**它不減損 F-25**（其結論我已獨立逐行配對複驗，且不依賴那個括號裡的數字），**但形狀與 F-27 一模一樣**：
一條管線印出看起來合理的數字，離開碼 `0`、`stderr` 空、沒有錯誤訊息，而它沒有數到全部。**會靜默漏數的管線不挑人。**

**兩條判準各寫成一句並獨立成節**：「**更正一個數字時，要搜它支撐的那個宣稱，而不是它的某一種寫法。**」
與「**一個會因為被書寫而改變的數字，不該被寫在八個地方。**」
後者附了對照組——**全票總數同一輪內 52 → 53 → 60，而活的部分 16／8 全程未動**，差別在於一個計數把記錄自己算了進去。
**兩條同一個根：一份記錄會影響它自己描述的那個系統。**

**未越界**：AC 全節一字未動（**1622B／sha256 `93e5bf6a95f16592`**）；`src/` 本輪零改動；`PresentDetail.tsx` 零改動；`src/data/*.json` 與 `main` 相同、未跑 `sync-content`；AC-2 維持未達成。**diff 基準現算 `git merge-base main HEAD` = `d0a9bda2f`。**

## Stage Report: review (cycle 4)

我讀了收斂判準並接受它。**我本來準備判 PASSED**——F-31 的七個方向全部成立，F-29 四個方向全部成立，F-30 我的原文確認一字未改。**但 FO 問的那個問題有答案，而答案是「有第三個問題」，而且它在本票的 G-7 上已經是一個可實測的 fail-open。** 依收斂判準「真找到 fail-open 仍優先於收斂」，判定 **REJECTED**，唯一理由是 F-32。

- DONE: F-31 七個方向自己跑，逐一分別量測 exit code 與 stderr
  七個方向全部成立，**新舊判準對照實跑**（舊版由我從正本把 `off` 那一行換成 `off=0` 產生）。見下節表。**方向 3 確認缺陷是雙向的**、**方向 6 確認 exit 3 存在且拒絕猜測**。
- DONE: 評價「不得預設 `+0000`」的理由，並判斷三個離開碼的區分
  **理由正確，而且比它自己寫的更強一層**；三個離開碼的區分站得住，`no-tz=` 確實在該出現時出現。見下節。
- DONE: 判斷 F-27／F-31 的二分是否完整
  **不完整。有第三個問題。** 見 F-32——這是本輪唯一的 REJECTED 理由。
- DONE: F-29 四個方向自己跑，並判斷 alternation 是否完整
  四個方向全部成立（漏掉的副本 0→1、六個不同活區段各 1 共 6、七個變體 7/7、十條合法 0/10、真實候選 `STRAY 0`／`DUP-MARKER 0`／`AC-OWNED 1`、stderr 0）。**但 alternation 不完整**，見 F-33。
- DONE: F-30 自己確認我的原文一字未改，三條指令自己跑
  **一字未改，實測 `<` 為 0、改寫為 0。** 兩個 hunk（`60a61,79` 與 `108a128`）＝**20 行新增**（implement 報 19，差 1 行是尾端那一行；**不影響那個承載重量的宣稱**）。三條指令全部重現：`--numstat` 帶不帶 `--unified=0` 皆 `80／28`；`grep -c '^+[^+]'` ＝ `66`；孤立 `+` ＝ `14`；`66+14=80`。
- DONE: 判斷三分法，並自己數裸 MM-DD
  三分法站得住，見下節。**裸 MM-DD 我數出來與 implement 完全一致**：全域 `09-25`／`09-26` **67 處／44 行**，活的部分 **16 處／8 行**。
- SKIPPED: AC-2
  維持未達成，未以任何替代方式宣稱。`039-render-check-tool.md` 仍 `status: design`／`verdict` 空。
- DONE: 未越界未回歸
  AC 全節 **1622B／sha256 `93e5bf6a95f16592`**（自算，與 merge-base／`37b4ac5`／`41bf3c9`／`bf06cb8`／HEAD 一致）。`src/` 本輪零變動（`layout.tsx` 的 `+1` 自 merge-base 起未再動）。`PresentDetail.tsx` 零 commit。`src/data/*.json` 與 `main` sha256 相同，未跑 `sync-content`。**五個活的可執行區塊逐一分別量測**：`G-7` exit 0／stderr 0B、`G-6` exit 0／stderr 0B、`AC3-grep` exit 0／stderr 0B（11 行命中）、`divergence-check` exit 0／stderr 0B、`date-check` exit 0／stderr 0B。**diff 基準自算** `git merge-base main HEAD` ＝ `d0a9bda2f`；另實測 `cb341af` 非本 branch 祖先（在 `main` 上），確認 FO 的自我更正。

### F-31 七個方向（正本抽出 1588B，舊版由我改一行 `off=0` 產生）

| 方向 | 舊判準 | 新判準 | stderr |
|---|---|---|---|
| 1. `17:39 −0700`，文字寫 `09-25`（依本票規則省略年份） | **`violations=0` exit 0 ← 漏掉** | `violations=1` **exit 1** | 0B／0B |
| 2. `09:00 −0700` 對照組 | `violations=1` exit 1 | `violations=1` exit 1（**不變**） | 0B／0B |
| 3. **`+0800`，合法的當日標籤** | **`violations=1` exit 1 ← 誤報合法內容** | **`violations=0` exit 0** | 0B／0B |
| 4. 合法歷史引用 `2026-04-30` | `violations=0` exit 0 | `violations=0` exit 0 | 0B／0B |
| 5. 空檔 | — | `scanned=0` ＋ `DATE-FAIL scanned=0` **exit 2** | 0B |
| 6. **`author-tz` 被剝掉** | — | 逐行 `author-time/author-tz missing -- refusing to guess` ＋ `no-tz=1` ＋ **exit 3** | 0B |
| 7. 真實兩檔 | — | `scanned=4158 violations=0 no-tz=0` **exit 0** | 0B |

方向 6 我用一個 `git` 外殼（`blame` 時濾掉 `author-tz`、其餘原樣轉發）製造缺漏，並先驗外殼本身：`author-tz` 由 1 筆變 0 筆而內容行仍在。**方向 3 是我認為最值得記的一列**——它證明 F-31 不只是「會漏」，而是「會把完全合法的東西報成違規」。一個雙向錯的基準比單向錯更難被信任者察覺，因為它偶爾會「抓到東西」，看起來像在工作。

**「不得預設 `+0000`」的理由我同意，而且我要把它說得更硬一點。** implement 寫「預設 `+0000` 等於基準不可得時就用 UTC 當基準，那就是 F-31 本身」——對。我補一層：**縮小觸發面之所以更糟，是因為它把「錯誤」換成了「偶發的錯誤」，而偶發的錯誤會累積信任。** F-31 之所以躲過一輪 review 與一輪 implement 自檢，正是因為它只在傍晚 commit 時發作。exit 3 把一個偶爾說錯話的檢查換成一個明確拒答的檢查——**對 gate 來說，拒答是可處理的，說錯話不是。**

**三個離開碼站得住**，因為它們要求執行者做三件不同的事：`1` 去改日期、`2` 去修檔案清單或呼叫方式、`3` 去修環境或 git 資料。**而 `2` 與 `3` 正好是「`violations=0` 可能在說謊」的兩條路**——也就是 F-27 與 F-31。離開碼空間對得上那兩個自我保護問題。我另驗了**兩者同時發生時的優先序**：`no-tz` 與違規並存時回 **exit 3**，且違規計數被抑制（該行在掃描日期前就被跳過）。**基準不可信時不報一個可能是錯的違規數，方向正確。**

### F-32（Material，本輪唯一的 REJECTED 理由）—— 第三個問題：它比的是不是該比的那個對象

**答案是：有第三個問題，而且本票已經有它的機制、只是沒有它的名字。**

三個問題各自問的是不同的東西，守衛也不同型：

| 問題 | 守衛的型態 | 本票的實作 |
|---|---|---|
| Q1（F-27）它到底有沒有真的比 | **比較次數的計數** | `scanned=0` → exit 2 |
| Q2（F-31）它的基準可不可信 | **基準值的來源** | `author-tz` 缺漏 → exit 3 |
| **Q3 它比的是不是該比的那個對象** | **對象的唯一性與身分** | **`DUP-MARKER`（只用在偵測器上）** |

**Q3 不是前兩個的改寫**：Q1 問「有沒有比」、Q2 問「拿什麼當尺」、Q3 問「量的是不是那個該量的東西」。一個檢查可以真的比了（`scanned` 非零）、基準完全可信（`author-tz` 在）、而**仍然在量一個健康的旁觀者**——因為斷言的滿足者不唯一，該負責的那個壞掉時由別人頂替。那正是 `012` 的「多重滿足者」。

**本票自己已經發明了 Q3 的守衛，但只當成個案。** `DUP-MARKER` 就是「唯一性要計數」；F-21 的收斂寫法更是明寫「並同時斷言全檔符合該形式的行**恰好一行**（與 `DUP-MARKER` 同一個「唯一性要計數」的思路）」。**概念已經在票內，只是沒被升成第三個問題**——所以它被用在偵測器與（未來的）`layout.tsx`，而沒有用在同一個 G-7 的另外兩個檔案上。

**G-7 上的實例（已實測，兩個方向）。** G-7 對三處綁定的查法不對稱：`layout.tsx` 查位置（F-15 的成果），`TODO.md` 與 `AGENTS.md` 只查「整檔至少一筆命中」。而滿足者數量是：

| 檔案 | 滿足者 | 檔案行數 | G-7 查的 |
|---|---|---|---|
| `src/app/layout.tsx` | **1** | 55 | 命中數＝1 **且**下一行為 `robots:` |
| `docs/health-check/TODO.md` | **9** | 985 | 只要 `-c` 非零 |
| `AGENTS.md` | **1** | 188 | 只要 `-c` 非零 |

- **探測 A**：刪掉 `TODO.md` 第 825 行——**本票第三節「處 2」指定的那一條、也是 `## Documentation impact`「在 P3-8 的「狀態」下方加「解除條件」一條」的那一條**——其餘 8 筆命中全部保留。**`G-7 PASS`、exit 0、stderr 0B。** 綁定沒了，gate 說綁定在。
- **探測 B**：把 `AGENTS.md` 第 52 行從 noindex 段移到檔尾的一行變更記錄註解（處 3 指定的是「第 51 行的 noindex 條目」）。**`G-7 PASS`、exit 0。** noindex 段不再指向本票，gate 說綁定在。

**這是 fail-open，而且是靜默的。** 受影響的性質正是本票反覆寫的那一句：「**一道不會被觸發的 gate 等於沒有**」。三條觸發路徑（改 `layout.tsx`、讀 P3-8、讀 `AGENTS.md`）中的兩條可以無聲消失，而 G-7 回報三處都在。

**我要把範圍講清楚，因為這關係到能不能修。** **AC-3 的字面只要求另兩檔「各至少一筆命中」，位置條件只加在 `layout.tsx`。所以 G-7 忠於 AC-3。** 缺口不在 AC，而在**第三節的綁定表與 `## Documentation impact` 各自指定了三處綁定的位置**，而 G-7 只驗其中一處；G-7 自己的內容欄寫的是「gate 綁定仍在」。**修 G-7 不需要動任何 AC 文字**——G-7 是 gate 項，不是 AC。

- released user 與 normal workflow：gate 執行者，以及任何依 `AGENTS.md` 指引去讀 P3-8 的人。`TODO.md` 是 985 行、`plan` 狀態、**本輪自己就被改過**的活文件。
- observable harm：上列兩個探測，`G-7 PASS`／exit 0。
- 受影響的 AC 或邊界：非 AC-3 字面；是第三節綁定表與 G-7 的自述。
- trigger evidence：兩個探測皆在副本上實跑；滿足者計數 1／9／1 為真實候選實測。
- 建議：materiality = **Material 等級的方法缺口**（FO 指定的判準），具體實例的觸發尚未發生故其風險面為 Deferred risk。task ownership = 本票自有範圍。**disposition 建議（不動 AC）**：把 Q3 升成與 Q1／Q2 並列的第三個問題寫進那一節；G-7 對另兩檔改為**錨定位置並斷言唯一**——`TODO.md` 要求 P3-8 段內恰好一筆「解除條件」指向本票，`AGENTS.md` 要求 noindex 段內恰好一筆——即 F-21 收斂寫法與 `DUP-MARKER` 已經在用的同一個思路。**未自行修。**

### F-33（Deferred risk）—— 偵測器 node 分支的 alternation 現在靠單一字面值

F-29 修成 `/h2|h28|272|釋字|字第/`。我逐一量過**哪一個** alternative 在承重：G-6 正本把票號寫成字元類，所以**字面 `272` 不存在**；`[釋释]字第` 使 `釋` 後面接的是 `释`，所以**字面 `釋字` 也不相鄰**。只取內容層的副本不含 `h2`／`h28`。**因此唯一抓到它的是 `字第`。** 實測該副本 `STRAY=1` ✓。

但兩種**合法的正本寫法**會讓 `字第` 也消失，兩者實測 `STRAY=0`：

| 改寫 | `字第` 是否仍在 | 結果 |
|---|---|---|
| `[釋释][字]第…`（把 `字` 也寫成字元類） | 否 | **`STRAY=0` 漏抓** |
| `/釋字第…/`（改用 unicode escape） | 否 | **`STRAY=0` 漏抓** |

第二種不是我憑空想的：**本票 cycle 3 自己記載過中文 pattern 在獨立腳本裡噴 `grep: illegal byte sequence`，而當時的處置就是「改成純 ASCII」。** 一個日後遇到同樣問題的人把 CJK 字面改成 escape，是這張票的歷史裡已經發生過一次的動作。
- 建議：materiality = **Deferred risk**（需要日後改寫正本才觸發）。promote 條件：G-6 正本的 CJK 字面被改寫或移除。disposition 建議 = 讓 node 分支不依賴語意字面，改為「`history.json` ＋ `-e` ＋ 失敗機制（`process.exit`／`console.error`）」或直接對 `# canonical: G-6` 標記計數（`DUP-MARKER` 已在做）。**注意這裡有真實張力**：單靠 `history.json` 會誤抓合法的讀檔指令（我上輪量到 2 條），所以不能只是放寬。**未自行修。**

### 三分法與兩條箴言：站得住，而且我實測了它最弱的一條腿

**「一份副本能不能自己漂走」這個分界站得住。** 它切的是**指涉物會不會動**：量測值的指涉物（當下狀態）會動，副本不動就失真；箴言與逐字引述的指涉物是**凍結的文字**，不會在副本背後改變。三種處置與三種指涉物對得上。

**但三分法給了兩條腿機制、第三條腿只給紀律**：會動的量測有「權威值＋重算指令」，會分岔的指令有 `DUP-MARKER`，**而「可重複但必須逐字」沒有任何自動檢查**。依本票 F-12／F-13 的歷史，這是最弱的一條腿。**所以我實測了它**：

- 判準一（`更正一個數字時，要搜它支撐的那個宣稱…`）：**4 處，1 處在活的部分、3 處在 stage report，逐字相同。**
- 判準二（`一個會因為被書寫而改變的數字，不該被寫在八個地方`）：**4 處，同樣 1 活 3 記錄，逐字相同。**
- 片段計數交叉驗證：`要搜它支撐的那個宣稱` ×4、`而不是它的某一種寫法` ×4、`不該被寫在八個地方` ×4 —— 與整句計數一致，**沒有任何一處漂走**。唯一多出的 `因為被書寫而改變` ×5，第 5 處（`:2689`）是**討論該判準本身**的句子（「判準二管的是會因為被書寫而改變的測量值」），不是箴言的副本。
- 「會動的量測是否還寫在兩處以上」：`1622B` 在活的部分出現 4 次，但都在 `### Feedback Cycles` 的逐輪記錄裡，而 **AC 全節大小是設計上的不變量**（它必須永不改變），逐輪記下一個不變量是歷史記錄而非會漂的量測。分類正確。

**箴言本身重複三四次不牴觸判準二，我同意 implement 的答覆**，理由如上：指涉物凍結。**但「必須逐字」目前靠人守，今天守住了，這一點值得寫進那一節而不是留給下一輪重新發現。**（Polish，未自行修。）

### 裸 MM-DD：我數出來與 implement 完全一致

`09-25`／`09-26` 全域 **67 處／44 行**，活的部分 **16 處／8 行**——與「兩輪內 52 → 53 → 60 → 66 → 67 而活的部分全程 16／8」完全吻合。
**我第一次用較寬的 `\d\d-\d\d` 型樣量到 100 處／57 行，那是我的型樣在量別的東西**：它把 `12-31`／`01-15`（我自己植入的測試值）以及 `19-35`、`19-37`、`47-50`、`14-07`、`00-07` 這些**行號區間**（如 `StanceSpectrum.tsx:19-35`）一起算進去了。**按「那兩個錯誤日期」的定義重數即為 67／16。** implement 的數字是對的；如實記下我自己的型樣問題，因為它正是判準一講的那件事——**數一個數字之前要先確定它支撐的宣稱是什麼。**

### 驗證與可否證性

- **五個活的可執行區塊全部從文件抽出後執行，逐一分別量測 exit code 與 stderr**，沒有以最後一行判定任何一個。抽取用 fence-state 感知的行首錨定解析（偵測器內含行中三連反引號）。
- **F-31 的新舊對照是我自己造的**，不是採信票內表格：我從正本把 `const sg=…off=sg*(…)` 換成 `const off=0;` 得到舊判準。**第一次替換靜默失敗**（regex 沒對上，兩個腳本位元組相同），使方向 1–3 的「舊／新」兩列輸出一模一樣；我發現後改用精確 regex 並先斷言 `兩者位元組不同` 才重跑。**如實記下——若我沒查，我會把「新舊相同」當成「修法無效」或把兩列都當成新判準的結果。**
- **F-32 的可否證點**：若我判斷錯了，只需證明刪掉 `TODO.md` 第 825 行後 G-7 回非零、或移走 `AGENTS.md` 第 52 行後 G-7 回非零——實測兩者皆 `G-7 PASS`／exit 0。反向我也驗了基準：未改動的副本上 G-7 亦 `PASS`，所以兩個探測的 `PASS` 不是因為副本本身壞掉。
- **F-33 的可否證點**：若 `字第` 不是唯一承重的 alternative，把它拿掉後仍會被抓——實測兩種拿掉 `字第` 的寫法皆 `STRAY=0`。
- **locale 陷阱已避開**：全程未用 `sort`／`uniq`／`sort -u` 判定中文字串；計數用 `grep -o`／`grep -c`／`wc -l`，去重與逐句比對用 Node。
- **BSD awk**：本輪所有 `awk` 判斷（G-7 相鄰性、偵測器、F-9／G-3-G-4 查核）皆分別量測 stderr，全部 0 位元組；未使用 `strftime`。
- **所有重現都在副本或臨時 git repo 上**：候選位元組零改動，未 commit 任何修正，未重跑 implement。本節提到未來日期時依本票規則省略年份（`12-31`／`01-15`）。

### Summary

**判定 REJECTED，唯一理由是 F-32。** 收斂判準我讀了也接受，而它自己寫著「真找到 fail-open 仍優先於收斂」——我找到一個，而且它恰好就是 FO 問的那個問題的答案。

**先講成立的部分，因為那是本輪的大多數。** F-31 七個方向全部成立，含最關鍵的兩個：方向 3 證明舊判準**會把完全合法的當日標籤報成違規**（雙向錯，不只漏），方向 6 證明 `author-tz` 缺漏時 **exit 3、逐行印「refusing to guess」**，沒有退回到預設 UTC。三個離開碼的區分站得住，且我另驗了兩者並存時 **exit 3 優先、違規計數被抑制**——基準不可信時不報一個可能是錯的數字。F-29 四個方向全部成立。F-30 **我的原文一字未改**（`<`＝0、改寫＝0，兩個 hunk 共 20 行純新增），三條指令全部重現。裸 MM-DD 我數出 **67／44 與 16／8，與 implement 完全一致**。三分法站得住，我並實測了它最弱的一條腿——兩條箴言各 4 處**全部逐字**，沒有漂走。

**而 FO 問的第三個問題有答案：有。「它比的是不是該比的那個對象。」** Q1 守的是比較次數，Q2 守的是基準來源，**Q3 守的是對象的唯一性與身分**——三者不能互相替代：一個檢查可以真的比了、基準完全可信、而仍然在量一個健康的旁觀者。**本票已經有 Q3 的機制卻沒有它的名字**：`DUP-MARKER` 就是「唯一性要計數」，F-21 的收斂寫法也明寫「斷言恰好一行」。因為沒被升成一般性的問題，它被用在偵測器上，**而沒有用在同一個 G-7 的另外兩個檔案上**。

**G-7 的滿足者是 1／9／1。** 刪掉 `TODO.md` 那條本票自己指定為「處 2」的 P3-8 解除條件、其餘 8 筆保留——**`G-7 PASS`**；把 `AGENTS.md` 的綁定從 noindex 段移到檔尾註解——**`G-7 PASS`**。三條觸發路徑中的兩條可以無聲消失，而 gate 回報三處都在。**這正是本票反覆寫的「一道不會被觸發的 gate 等於沒有」。** 範圍我講清楚了：**G-7 忠於 AC-3 的字面**（另兩檔只要求「至少一筆」），缺口在第三節的綁定表與 G-7 的自述，**所以修 G-7 不需要動任何 AC 文字**。

另記 **F-33**（Deferred risk）：偵測器 node 分支現在只靠 `字第` 這一個字面值承重，兩種合法的正本改寫（把 `字` 也寫成字元類、改用 unicode escape）實測都讓它 `STRAY=0`——**而 escape 改寫在本票 cycle 3 的歷史裡已經因為 `illegal byte sequence` 發生過一次**。

**最後記一件我自己的錯。** F-31 的新舊對照，我第一次的字串替換靜默失敗，兩個腳本位元組相同，於是方向 1–3 的「舊」「新」兩列印出一模一樣的結果。**我差一步就把「修法無效」或「兩列都是新判準」寫進報告。** 我加了一個 `兩者位元組不同` 的斷言才重跑——**這一輪的 Material 是「三道護欄全過而基準差一天」，而我的工具錯法是「兩個受測對象其實是同一個」。同一家族：受測對象與基準都要先證明自己是它宣稱的那個東西。**

## Stage Report: implement (cycle 13)

本輪處理 review 判 REJECTED 的唯一阻擋項 **F-32（Material）** 與一併授權的 **F-33**，並把第三個問題升成一般性的判準。**改一個檔案**：本票。
**diff 基準現算**：`git merge-base main HEAD` = **`d0a9bda2f`**（本輪複算，未沿用記憶中的 SHA）。
**本輪 commit：`0bfa006`**（author date **2026-09-24**，依日期規則第 1 條取實際 commit 日期；本節所有 `2026-09-24（cycle 13）` 標籤皆據此）。

- DONE: **F-32 fix（Material，本輪唯一阻擋項）。** G-7 改為對三處綁定**各自驗身分與唯一性**，不再數檔案命中數。
  **證據**：兩條消失路徑各自轉紅——刪掉 `TODO.md` 的 P3-8 解除條件（其餘 8 筆保留）由 `G-7 PASS` 變 `G-7 FAIL … place2 … [count=0]` exit `1`；
  `AGENTS.md` 綁定移到檔尾由 `G-7 PASS` 變 `FAIL … place3 … [count=0]` exit `1`。現況三處齊備維持 `G-7 PASS [place1=1/1 place2=1 place3=1]` exit `0`。
  另驗四個方向：處 2／處 3 各自被複製成兩份 → `count=2` 轉紅（唯一性）；錨定標題被改名 → `count=0` 轉紅（**fail closed，不是靜默通過**）；`AGENTS.md` 整個不存在 → 轉紅且 `stderr` 非空。九個情境逐一分別量測 exit code 與 stderr。
- DONE: **不需要動任何 AC 文字，我複驗了 reviewer 的界定屬實。**
  **證據**：`AC-3` 的要求文字只說「下列指令三個檔案各至少一筆命中」，**G-7 一直忠於它**；缺口在第三節綁定表沒有寫下每一處的身分，而 G-7 的自述照抄了那個缺口。
  修法只動了綁定表的補述、G-7 的表格列自述、G-7 正本區塊。**AC 全節實測仍 1622B／sha256 `93e5bf6a95f16592`**（以標題定位而非固定行號，因為本輪插入使行號位移）。
- DONE: **把第三個問題升成一般性的判準，與 Q1／Q2 並列**，並寫明本票原本已有它的機制卻沒有它的名字。
  **證據**：獨立一節「三個問題：比較次數、基準來源、對象身分」，內含三問對照表、「三者不能互相替代」的具體反例，以及 `DUP-MARKER`／F-21「恰好一行」作為本票既有 Q3 機制的引用。
- DONE: **把姊妹票 `012` 獨立到達的同一結論寫進票內當互為佐證。**
  **證據**：同一節內的「三種載體」對照表——`012` 的肯定式（多重滿足者）、`012` 的否定式（多重施用者，豁免按字串值發），以及本票 G-7（滿足者散在三檔而檢查只數檔數）。
- DONE: **F-33 fix。** 偵測器 `node` 分支改為**先正規化再比對**，不再靠單一字面值承重。
  **證據**：兩種合法改寫舊判準皆 `STRAY=0`、新判準皆 `1`（把 `字` 也寫成字元類、改用 unicode escape）；十條合法指令與真實候選皆維持 `0`；**F-29 的五個結果全部不變**（1／6／7／0／0）。
- DONE: **逐字寫進票內**：reviewer 自記工具錯法的那一句歸類。
  **證據**：見下方「受測對象與基準都要先證明自己是它宣稱的那個東西」一節，逐字引述。

### 三個問題：比較次數、基準來源、對象身分

**一個檢查的自我保護必須分別回答三個問題——它到底有沒有真的比、它的基準可不可信、以及它比的是不是該比的那個對象。**

| | 問題 | 守什麼 | 本票的機械答案 | 對應 finding |
|---|---|---|---|---|
| **Q1** | 它到底有沒有真的比？ | **比較次數** | `scanned` 非零，否則離開碼 `2` | F-27 |
| **Q2** | 它的基準可不可信？ | **基準來源** | 基準取自規則指定的來源（`author-tz`）；**取不到就失敗、不退回預設值**，否則離開碼 `3` | F-31 |
| **Q3** | 它比的是不是該比的那個對象？ | **對象的唯一性與身分** | 每個滿足者**各自**按身分斷言，並斷言**恰好一個**（`place1=1/1`、`place2=1`、`place3=1`；`DUP-MARKER` 亦同） | **F-32** |

**三者不能互相替代，而這句話是可以舉反例的**：
**一個檢查可以真的比了（Q1 過）、基準完全可信（Q2 過）、而仍然在量一個健康的旁觀者（Q3 沒過）。**
**F-32 就是那個反例，而且不是假想的**：修法前的 G-7 對 `TODO.md` 確實比對了 9 筆命中（`scanned` 意義上完全有在工作），
它的基準（「至少一筆」）也完全忠於 `AC-3` 的字面，**而它在量的是那 8 筆健康的旁觀者，不是該負責的那一筆。**
刪掉該負責的那一條，其餘 8 筆頂替上來，**gate 照樣印 `G-7 PASS`。**

**最該記下的一句：本票原本已經有 Q3 的機制，卻沒有 Q3 的名字。**
`DUP-MARKER` 的設計理由就是「唯一性要計數」；F-21 的收斂寫法也明寫「斷言全檔符合該形式的行**恰好一行**」。
**兩處都是 Q3，而因為它從來沒有被升成一個一般性的問題，它被用在偵測器上，卻沒有被用在同一個 G-7 的另外兩個檔案上。**
**G-7 就是那個代價。** 一個只在某一個具體判準上被想通的原則，不會自己擴散到下一個判準——**除了給它一個名字，沒有別的辦法。**

**姊妹票 `012` 今天獨立到達同一個 Q3，載體不同，所以兩邊互為佐證。**

| 載體 | 形狀 | 為什麼是 Q3 |
|---|---|---|
| `012` **肯定式斷言** | **多重滿足者**：要求的字串在範圍內有多個產生點，該負責的那個壞掉時由另一個頂替 | 檢查確認了「這個字串存在」，但沒確認「它來自該負責的那個產生者」 |
| `012` **否定式斷言** | **多重施用者**：豁免清單**按字串值發而非按產生者發**，把違規內容寫成被豁免的那串字就隱形（`012` 實測 28 條全綠） | 豁免的對象身分錯了——它豁免了一個字串值，而該豁免的是一個產生者 |
| 本票 **G-7** | **滿足者散在三個檔，而檢查只數了檔數** | 檢查確認了「每個檔都有命中」，但沒確認「每個檔裡該負責的那一筆還在」 |

**三個載體，同一個缺陷**：**檢查確認了某個性質「有人滿足」，而沒有確認「該負責的那個對象滿足它」。**
**否定式的版本更難看見**，因為它反過來：不是「誰頂替了滿足者」，而是「誰混進了豁免名單」。
**兩邊的結論一致，而我們是從不同載體各自走到的**——這比任一邊單獨成立更有說服力。

### 「受測對象與基準都要先證明自己是它宣稱的那個東西」

**本節逐字引述 reviewer 自記的工具錯法與它的歸類。** 依 FO 指示逐字寫入，**不改寫一個字**：

> F-31 的新舊對照，我第一次的字串替換**靜默失敗**，兩個腳本**位元組相同**，
> 於是方向 1–3 的「舊」「新」兩列印出一模一樣的結果。
> **我差一步就把「修法無效」或「兩列都是新判準」寫進報告。**
> 我加了一個「兩者位元組不同」的斷言才重跑。
>
> **這一輪的 Material 是「三道護欄全過而基準差一天」，而我的工具錯法是「兩個受測對象其實是同一個」。
> 同一家族：受測對象與基準都要先證明自己是它宣稱的那個東西。**

**為什麼這一句把 Q2 與 Q3 統一了。**
Q2 問的是「基準是不是它宣稱的那個基準」，Q3 問的是「對象是不是它宣稱的那個對象」——
**最後一句指出這是同一個要求施加在兩個位置上**：比較的兩端都必須先證明自己的身分，否則比較本身沒有意義。
**一個新舊對照如果兩端其實是同一個腳本，它印出的「一致」不是證據，是恆等式。**
**而它不會報錯**——`cmp` 不會被呼叫，替換失敗沒有離開碼，兩列數字漂亮地相同。

**我本輪照著用了，而且它當場有用。** 做 F-33 的新舊對照之前，我先斷言兩個偵測器**位元組不同**
（`cmp -s` 回非零才繼續，相同就 `exit 9`）。**這不是禮貌性的引用**：我這一輪的替換是用 Python 做的、
帶三個 `assert count==1`，而**那三個 assert 保護的是「替換有沒有發生」，保護不了「替換後的兩份東西是不是真的兩份」**——
那需要另一個斷言，就是 `cmp`。**兩種保護各管一件事，缺一個就會把恆等式讀成驗證。**

### F-32：修法與九個情境

**修法**：G-7 從「三檔各至少一筆命中 ＋ 只驗處 1 的相鄰性」改為**對三處各自斷言身分與唯一性**。

| 處 | 斷言 | 輸出 |
|---|---|---|
| 1 | `layout.tsx` 內含本票路徑的行**恰好一行**，且其下一行含 `robots:` | `place1=1/1` |
| 2 | `TODO.md` 的 `### P3-8` 小節內，含「解除條件」且引用本票的行**恰好一條** | `place2=1` |
| 3 | `AGENTS.md` 標題含 `noindex` 的小節內，引用本票的行**恰好一行** | `place3=1` |

**九個情境全部從文件抽出後在鏡像目錄樹上實跑，逐一分別量測 exit code 與 stderr**：

| # | 情境 | 舊 | 新 |
|---|---|---|---|
| 0 | 三處齊備（現況） | `PASS` | **`PASS [place1=1/1 place2=1 place3=1]`** exit 0 |
| A | 刪掉處 2，`TODO.md` 其餘 8 筆保留 | **`PASS`** exit 0 ← fail-open | **`FAIL place2 [count=0]`** exit 1 |
| B | 處 3 移到 `AGENTS.md` 檔尾 | **`PASS`** exit 0 ← fail-open | **`FAIL place3 [count=0]`** exit 1 |
| C | 處 1 移到 `layout.tsx` 檔尾（回歸對照） | `FAIL` exit 1 | `FAIL place1 [1/0]` exit 1 |
| D | 處 2 複製成兩條 | — | `FAIL place2 [count=2]` exit 1 |
| E | 處 3 複製成兩行 | — | `FAIL place3 [count=2]` exit 1 |
| F | 處 3 移到**同一小節的末尾**（仍在 noindex 小節內） | — | `PASS` ← **正確，不是漏抓**（見下） |
| F2 | 處 3 移到**後面另一個小節內** | — | `FAIL place3 [count=0]` exit 1 |
| G | 處 3 保留，另在檔尾加一句無害提及 | — | `PASS` ← 正確，額外提及不是違規 |
| H | `AGENTS.md` 的 noindex 標題被改名 | — | `FAIL place3 [count=0]` exit 1，**fail closed** |
| I | `AGENTS.md` 整個不存在 | — | `FAIL` exit 1、`stderr` 53B |

**情境 F 我一開始判成漏抓，查下去是我的探測錯了，記在這裡。**
我本來想驗「把綁定移出 noindex 小節」，但我的 fixture 把那一行插在**下一個標題之前**——
**那個位置仍然在 noindex 小節裡面**，所以 `PASS` 是正確答案，不是漏抓。改成插進後面小節內（情境 F2）才是我要驗的東西，而它正確轉紅。
**這是本票第三次同一個教訓：探測失敗時第一個該懷疑的是探測本身。**

**而情境 F2 順帶證明了修法裡一個容易寫錯的細節是載重的。**
兩處小節判定我都寫成 `/^#+ /{sec=$0}`（**任何層級的標題都更新 `sec`**）。
**若只寫 `/^### /`，情境 F2 會 `PASS`**——因為 `AGENTS.md` 的 noindex 小節後面接的是一個 `##` 標題，
`sec` 不會被更新，於是後面整個檔案都還算在 noindex 小節內。**實測：同一份判準只把 `^#+ ` 換成 `^### `，F2 由 `FAIL` 變 `PASS`。**
**這正是 cycle 8 記過的 F-16**（`sec` 只在 `^### ／^## ` 更新、`####` 不更新，致豁免區實際橫跨四個子節）。
**我差一步就把同一個 bug 寫進同一張票的第二個判準裡**，而抓到它的是「先寫一個會失敗的探測」這個習慣。

### F-33：為什麼選「先正規化再比對」

**缺陷**：cycle 12 我把 `字第` 加進 `node` 分支的 alternation，四個方向都過。
**但 reviewer 指出那條 alternation 現在只靠 `字第` 一個字面值承重**，而兩種合法的正本改寫都會讓它 `STRAY=0`：
把 `字` 也寫成字元類（`[釋释][字]第`）、或改用 unicode escape（`釋字第`）。
**實測兩者對舊判準皆 `STRAY=0`，五個字面值（`h2`／`h28`／`272`／`釋字`／`字第`）一個都不命中。**

**而 escape 改寫不是假想的觸發，是本票自己走過的路**：cycle 3 的歷史裡就因為 `illegal byte sequence` 改寫過一次。

**修法我選「先正規化再比對」，理由是繼續加字面值解不掉根。**
每加一個字面值，就是再點名一種寫法；**而問題不是「少了哪一種寫法」，是判準綁在字面拼法上，而拼法是可以合法改的。**
正規化把可變的拼法折掉，再對**一組**語意錨點比對：
把 `[`、`]`、`\` 三個**純粹是正規表達式標點**的字元刪掉，再 `tolower()`，然後比對
`h2|h28|272|釋字|字第|u5b57|u91cb|u7b2c`（後三個是 釋／字／第 的 unicode 碼點，escape 寫法去掉反斜線後就長這樣）。

**關鍵是不再有單一字面值承重，而這一點是可以驗的**：不同改寫由**不同**的錨點命中——

| 改寫 | 舊判準 | 正規化後命中的錨點 |
|---|---|---|
| 把 `字` 也寫成字元類 | `STRAY=0` | **`字第`**（去掉方括號後 `釋释字第` 重新出現這個雙字） |
| 改用 unicode escape | `STRAY=0` | **`u5b57`／`u91cb`／`u7b2c`**（`字第` 與 `釋字` 皆不命中）|
| 正本逐字（含 id 層） | `STRAY=1` | `h2` 等多個 |

**兩種改寫各由不同錨點抓到，所以拿掉任一個錨點都不會讓整組失效。**
**已知的誤報向量我寫下來**：`u5b57` 這類短字串理論上可能出現在別的地方（例如某個 hash），
所以我保留了 `u` 前綴而不是只比對 `5b57`，而且這個分支仍然同時被 `node .*-e` 與 `history\.json` 兩個條件夾住。
**日後若再擴充這組錨點，必須重跑十條合法指令那一組**——這個分支的誤報史就是 F-22。

**F-29 的五個結果全部不變，我逐一比對過**：內容層副本 `1`、六行真副本 `6`、七種拼法變體 `7`、十條合法指令 `0`、真實候選 `0`；
`AC-OWNED` 一筆、`DUP-MARKER` 零筆，新舊完全相同。**新舊對照之前我先斷言兩個腳本位元組不同**（見上一節）。

### 兩條硬規則與邊界

- **`sort`／`uniq` 全程未用於判定中文字串。** 本輪計數用 `grep -c`、`awk` 累加、`wc -l`、`cmp`、`diff`。
- **BSD awk 沒有 `strftime`。** 本輪動到的兩個判準都是 `awk`／shell，**未使用任何時間函式**；
  **而且不是靠「沒用到」保證的**：本輪每一次執行都把 stderr 導到獨立檔案分別量測。
  **五個正本區塊逐一分別量測 exit code 與 stderr**，全部 exit `0`、stderr **0 位元組**，**未以最後一行判定**。
  唯一 stderr 非空的是情境 I（`AGENTS.md` 刻意刪除），**那是該有的行為**，已記在表內。
- **未動 `src/`**：本輪 `src/` 零改動，`layout.tsx` 的 `+1` 是 cycle 8 已落地的工作，我沒有碰。
- **未動 `PresentDetail.tsx`**、build 產物、Next.js 設定；**`src/data/*.json` 與 `main` sha256 相同、未跑 `sync-content`**。
- **AC-2 維持未達成**，依賴尚未核准動工的 feature `039`，本輪未代為宣稱任何 A 類項目通過。
- **`## Acceptance criteria` 全節一個字未動**，仍 **1622B**／sha256 `93e5bf6a95f16592`。
- **未改寫 reviewer 的報告**：本輪對 reviewer 文字的唯一動作是**逐字引述**它自記的工具錯法一段。
- **活的可執行區塊仍是 5 個、標記仍是 4 個**，本輪未新增任何區塊。

### 驗證與可否證性

- **五個活的可執行區塊全部從文件抽出後執行，逐一分別量測 exit code 與 stderr**：
  G-6 `G-6 PASS`／exit 0／stderr **0B**；**G-7 `G-7 PASS [place1=1/1 place2=1 place3=1]`／exit 0／stderr 0B**；
  date-check `violations=0 no-tz=0`／exit 0／stderr **0B**；偵測器 `AC-OWNED` 一筆／`STRAY` 零筆／`DUP-MARKER` 零筆／exit 0／stderr **0B**；
  AC-3 的 `grep` 11 行命中（`1／9／1`）／exit 0／stderr **0B**。四個標記各抽到恰好一個區塊。
- **每一條改動都有一個能推翻我的具體探測，且該探測實跑過**：
  若 F-32 沒修好，情境 A 與 B 仍會 `PASS`——實測都轉紅並印出是哪一處、`count` 是多少；
  若修法過嚴，情境 G（額外無害提及）會誤報——實測 `PASS`；
  若唯一性斷言沒生效，情境 D／E 會 `PASS`——實測 `count=2` 轉紅；
  若 F-33 沒修好，兩種改寫仍是 `STRAY=0`——實測都變 `1`；
  若 F-33 過寬，十條合法指令會誤報——實測仍 `0`。
- **反向全部驗過**：真實候選零 `STRAY`、零 `DUP-MARKER`、一筆 `AC-OWNED`；`DUP-MARKER` 對四種標記複製全部仍會叫；
  date-check 對合法歷史引用不叫、對 `scanned=0` 回 `2`、對 `author-tz` 缺漏回 `3`。**只驗通過等於沒驗。**
- **本節自己遵守日期規則**：寫完後對本票與 `docs/health-check/TODO.md` 跑 date-check 正本，`violations=0 no-tz=0`、exit `0`、`stderr` 0 位元組；
  **本節提到那兩個錯誤日期時一律省略年份**，依「涵蓋面聲明（一）」的例外。
- **AC 全節以標題定位複驗**（不用固定行號）：本輪插入使行號位移，`sed -n '339,358p'` 一度量到 1509B，
  **那是我的量法過期，不是 AC 變了**——改以 `^## Acceptance criteria` 到 `^## Test plan` 定位後為 **1622B／sha256 `93e5bf6a95f16592`**。
  **這一筆記下來，因為它正是「判準一」的形狀**：我原本搜的是某一種寫法（固定行號），而該搜的是它支撐的宣稱（那一節的內容）。

### Summary

**F-32 已修，這是本輪唯一的阻擋項。** G-7 從「三檔各至少一筆命中」改為**對三處各自斷言身分與唯一性**：
處 1 相鄰且恰一行、處 2 在 `P3-8` 內且恰一條、處 3 在 `noindex` 小節內且恰一行，輸出 `place1=1/1 place2=1 place3=1`。
**兩條無聲消失的路徑各自轉紅**（刪處 2 保留其餘 8 筆 → `place2 count=0`；處 3 移檔尾 → `place3 count=0`），**現況維持綠**。
另驗唯一性（複製成兩份 → `count=2` 轉紅）、fail-closed（錨定標題改名 → 轉紅）與檔案缺失（轉紅且 stderr 非空）。
**依 reviewer 的界定不需要動任何 AC 文字，我複驗屬實**——`AC-3` 只要求三檔各至少一筆，G-7 一直忠於它；缺口在綁定表沒寫每一處的身分，而 G-7 的自述照抄了那個缺口。

**而 F-32 的價值是它命名了第三個問題。** 一個檢查的自我保護必須分別回答三個問題——
**它到底有沒有真的比（Q1，守比較次數）、它的基準可不可信（Q2，守基準來源）、以及它比的是不是該比的那個對象（Q3，守對象的唯一性與身分）。**
**三者不能互相替代，而 F-32 是可舉證的反例**：修法前的 G-7 確實比對了 9 筆、基準也完全忠於 `AC-3` 的字面，
**而它在量的是 8 筆健康的旁觀者。** 刪掉該負責的那一條，其餘頂替上來，gate 照樣印 `PASS`。

**最該記住的一句：本票原本已經有 Q3 的機制，卻沒有 Q3 的名字。** `DUP-MARKER` 就是「唯一性要計數」，F-21 的收斂寫法也明寫「恰好一行」。
**因為它從來沒有被升成一般性的問題，它被用在偵測器上，卻沒有被用在同一個 G-7 的另外兩個檔案上——G-7 就是那個代價。**
**一個只在某個具體判準上被想通的原則，不會自己擴散到下一個判準；除了給它一個名字，沒有別的辦法。**

**姊妹票 `012` 今天獨立到達同一個 Q3，載體不同，兩邊互為佐證**：`012` 的肯定式吃**多重滿足者**、否定式吃**多重施用者**（豁免按字串值發而非按產生者發，實測 28 條全綠），
本票 G-7 是第三種載體——**滿足者散在三個檔，而檢查只數了檔數。** 三個載體同一個缺陷：**檢查確認了某個性質「有人滿足」，而沒有確認「該負責的那個對象滿足它」。**

**F-33 已修，改為「先正規化再比對」。** 繼續加字面值只是再點名一種寫法，而問題是判準綁在字面拼法上、而拼法可以合法改。
刪掉 `[`、`]`、`\` 三個純正規表達式標點並 `tolower()` 之後，比對一組語意錨點。
**不再有單一字面值承重，而這一點是驗過的**：字元類改寫由 `字第` 命中、escape 改寫由 `u5b57`／`u91cb`／`u7b2c` 命中，**兩者由不同錨點抓到**。
**F-29 的五個結果全部不變**（1／6／7／0／0），`AC-OWNED`／`DUP-MARKER` 亦不變。

**我本輪照用了 reviewer 那句歸類，而它當場有用。** 做 F-33 新舊對照前，我先斷言兩個偵測器**位元組不同**才比較輸出。
**我的 Python 替換帶三個 `assert count==1`，但那些 assert 保護的是「替換有沒有發生」，保護不了「替換後的兩份東西是不是真的兩份」**——那需要 `cmp`。
**兩種保護各管一件事，缺一個就會把恆等式讀成驗證。**

**另記兩筆我自己的錯。** 一、情境 F 我一開始判成漏抓，查下去是**我的 fixture 把那一行插在下一個標題之前、仍在同一小節內**，所以 `PASS` 是正確答案；
改成插進後面小節內（F2）才轉紅。**本票第三次同一個教訓：探測失敗時第一個該懷疑的是探測本身。**
二、我用 `sed -n '339,358p'` 查 AC 全節，量到 **1509B** 而一度以為越界；**那是我的量法過期**（本輪插入使行號位移），
改以標題定位後為 1622B／sha256 相同。**這正是「判準一」的形狀——我搜的是某一種寫法（固定行號），該搜的是它支撐的宣稱。**

**未越界**：AC 全節一字未動（**1622B／sha256 `93e5bf6a95f16592`**，以標題定位複驗）；`src/` 本輪零改動；`PresentDetail.tsx` 零改動；
`src/data/*.json` 與 `main` 相同、未跑 `sync-content`；AC-2 維持未達成；未改寫 reviewer 的報告（唯一動作是逐字引述）。**diff 基準現算 `git merge-base main HEAD` = `d0a9bda2f`。**

## Stage Report: review (cycle 5)

**判定 PASSED。** F-32 的九個情境全部正確、F-33 的錨點負載確實分散、`/^#+ /` 對照成立（**那是 F-16 在同一張票裡的第二次現身，被一個設計成會失敗的探測攔住**）。**我找不到 fail-open、找不到 Material 缺陷、找不到會讓 gate 執行者照著做而失敗的東西。** 第四種載體的答案是**沒有**，理由寫在下面——那是我這一輪最有內容的結論，因為它是「不再往下挖」的依據，不是放棄。

- DONE: F-32 九個情境自己跑，逐一分別量測 exit code 與 stderr
  九個全部正確，見下表。**我上一輪那兩條消失路徑現在各自轉紅並指名處別與計數**（`place2 [count=0]`／`place3 [count=0]`）。
- DONE: 重跑 `/^#+ /` vs `/^### /` 對照
  **成立，而且比敘述更精確。** 洩漏情境由 `FAIL` 翻成 `PASS`。見下節。
- DONE: 確認 AC 真的不需要動，且 implement 真的自行複驗了我的範圍界定
  **確認。** AC-3 全節逐位元組未變（1622B／`93e5bf6a95f16592`，以標題定位計算），G-7 一直忠於「三檔各至少一筆」那個字面；新增的身分與唯一性斷言是 gate 項的收緊，**不是 AC 要求的改動**。我以重建的修法前 G-7 獨立複驗了這個界定，見 Q1／Q2／Q3 那一節。
- DONE: F-33 自己移除每一個語意錨點各試一次
  **八個錨點逐一移除，共 32 格矩陣。** 移除任一個，四種寫法中最多只有一種落空，**其餘至少三種仍被抓到**。見下表。
- DONE: 確認 F-29 五個結果不變，並判斷正規化是否引入新的過寬
  **五個結果全部不變**（1／6／7／0／真實候選）。**過寬：沒有。** 我把合法指令集合從 10 條擴到 **16 條**，新增 6 條專打 `[`／`]`／`\` 移除（`a[0]`、`a[2].id`、`Object.keys(a[0])`、`x.textbook.chapter` 等全部含中括號），**誤抓 0／16**。
- DONE: 判斷可否證宣稱、F-32 是否只違反 Q3、三載體收束句、**以及有沒有第四種載體**
  可否證宣稱**真的可否證且通過了自己的否證測試**；F-32 **確實同時滿足 Q1 與 Q2 而只違反 Q3**（實測數字見下）；收束句**涵蓋那三種載體**；**第四種載體：沒有**。見下節。
- DONE: 判斷 `count==1` 與 `cmp` 的區分
  **正確，而且我認為它比我原本那句話更有用。** 兩個具體反證見下節，兩道保護票內都在。
- SKIPPED: AC-2 — A 類每一項都能以實際頁面行為驗證
  維持未達成，未以任何替代方式宣稱。`039-render-check-tool.md` 仍 `status: design`。
- DONE: 未越界未回歸
  AC **1622B／`93e5bf6a95f16592`**（以標題定位，不用固定行號）。`src/` 本輪零變動；`PresentDetail.tsx` 零 commit；`src/data/*.json` 與 `main` sha256 相同；未跑 `sync-content`。`### Feedback Cycles` 的 `- Cycle` 行數 **12**。活的可執行區塊 **5** 個，逐一分別量測：`G-7` exit 0／0B、`G-6` exit 0／0B、`AC3-grep` exit 0／0B、`divergence-check` exit 0／0B、`date-check` exit 0／0B（`scanned=4536 violations=0 no-tz=0`）。**diff 基準自算** `d0a9bda2f`。

### F-32：九個情境（G-7 正本抽出 1017B，逐一量測）

| 情境 | exit | stderr | 輸出 |
|---|---|---|---|
| A 未修改基準 | 0 | 0B | `G-7 PASS [place1=1/1 place2=1 place3=1]` |
| B **消失路徑一**：刪掉 P3-8 的解除條件（其餘 8 筆提及保留） | **1** | 0B | `FAIL: place2 … inside P3-8 [count=0]` |
| C **消失路徑二**：`AGENTS.md` 綁定移到檔尾註解 | **1** | 0B | `FAIL: place3 … inside the noindex section [count=0]` |
| D **處 2 被複製** | **1** | 0B | `FAIL: place2 … [count=2]` |
| E **處 3 被複製** | **1** | 0B | `FAIL: place3 … [count=2]` |
| F **P3-8 錨點標題改名** | **1** | 0B | `FAIL: place2 … [count=0]`（**不是靜默通過**） |
| G **noindex 錨點標題改名** | **1** | 0B | `FAIL: place3 … [count=0]` |
| H 別處多一筆無害提及 | 0 | 0B | `G-7 PASS [1/1 1 1]`（**維持綠，那不是違規**） |
| I `AGENTS.md` 被刪除 | **1** | **53B** | `FAIL: place3 … [count=]` ＋ `awk: can't open file AGENTS.md` |

情境 I 是**唯一** stderr 非空的一個，與票內記載一致，且它同時轉紅——**檔案不存在時不會被讀成「零筆命中所以只是沒綁定」，而是連 stderr 一起響**。

**B 與 C 正是我上一輪用來證明 fail-open 的那兩個探測。** 修法前兩者皆 `G-7 PASS`／exit 0；現在各自 exit 1 並指名是哪一處、計數多少。D／E 補上另一個方向——**唯一性不只防少，也防多**。H 是必須的反向：如果任何一筆提及都會讓它轉紅，那條檢查就會永遠不通過，和永遠通過一樣是假檢查。

### `/^#+ /` vs `/^### /`：F-16 在同一張票裡的第二次現身

**先確認兩個腳本不是同一個**（我上一輪就是被這件事咬的）：替換命中 **2 處**，`cmp` 為 **DIFFER**，`diff` 顯示差異只在那兩行的 `sec` 更新條件。

結構是關鍵：`AGENTS.md` 的 noindex 錨點是 **`###`（第 44 行）**，而它後面接的是 **`##`（第 57 行）**，再下一個 `###` 在第 61 行。所以在只認 `/^### /` 的版本裡，`sec` **不會被第 57 行清掉**——noindex 這一段的範圍會延伸過它自己的結尾，直到第 61 行。

**洩漏情境**：把綁定從第 52 行移到第 57 行之後（即移進 `## 怎麼跟 captain 溝通` 這一段）。

| 版本 | exit | stderr | 結果 |
|---|---|---|---|
| **出貨版 `/^#+ /`** | **1** | 0B | `FAIL: place3 … [count=0]` —— 正確偵測到綁定離開了 noindex 段 |
| 變體 `/^### /` | **0** | 0B | **`G-7 PASS [place1=1/1 place2=1 place3=1]`** —— **假綠** |

**這是 F-16 的同一個缺陷**：F-16 是「awk 不在 `####` 更新 `sec`，於是整個第三節成為一個豁免區」；這裡會是「awk 不在 `##` 更新 `sec`，於是 noindex 段延伸過自己的結尾」。**同一個機制（區段範圍綁在單一標題層級）、同一個方向（範圍過寬 → 假綠）、不同的檔案與不同的層級。** 差一個按鍵。

**而攔住它的不是複核，是一個設計成會失敗的探測。** 把綁定移進那個空隙，是一個「應該轉紅」的情境；只有先寫下這種情境，兩個版本的差別才會現形。**這一輪最值得留下的方法論就是這一句**：區段範圍的檢查必須用「把目標放到區段外緣」的探測驗，而不是用「放在區段內會通過」驗。

**附帶記一個已接受的代價（不是 finding）**：`/^#+ /` 讓一個區段的範圍在**任何**更深標題處也結束。所以若日後有人把解除條件改放在 P3-8 底下的 `####` 子節，`place2` 會變 0 而轉紅。**方向是 fail-closed、訊息指名 place2 與 count=0、且錨點的脆弱正是 F／G 兩個情境刻意要的性質**，所以我判定這是正確取捨而非缺陷。

### F-33：八個錨點逐一移除（四種寫法 × 九種錨點集合）

正規化為 `flat`：移除 `[`、`]`、`\` 後轉小寫。關鍵在於**它讓兩種改寫在正規化後落到不同的錨點上**——字元類改寫 `[釋释][字]第` 去掉括號後成為 `釋释字第`，被 `字第` 抓到；escape 改寫去掉 `\` 後成為 `u91cbu5b57u7b2c`，被三個 `u….` 錨點抓到。

| 移除的錨點 | 字元類改寫 | escape 改寫 | id 層 | 裸 272 |
|---|---|---|---|---|
| （完整集合） | 1 | 1 | 1 | 1 |
| `-h2` | 1 | 1 | **0** | 1 |
| `-h28` | 1 | 1 | 1 | 1 |
| `-272` | 1 | 1 | 1 | **0** |
| `-釋字` | 1 | 1 | 1 | 1 |
| `-字第` | **0** | 1 | 1 | 1 |
| `-u5b57` | 1 | 1 | 1 | 1 |
| `-u91cb` | 1 | 1 | 1 | 1 |
| `-u7b2c` | 1 | 1 | 1 | 1 |

**「不靠單一字面值承重」成立，而且是驗出來的**：移除任一個錨點，**最多只有一種寫法落空，其餘至少三種仍被抓到**。對照 F-33 之前——當時 `字第` 一個字面值同時承擔全部，移除它整組就崩。escape 改寫更有三重冗餘（三個 `u….` 任一個被移除仍有兩個）。
**修根與加字面值的差別在這張表裡看得見**：加字面值會讓新的一列「只有那一格是 1」，修根讓**負載分散到互不相同的錨點上**。implement 的理由（加字面值只是再指名一種寫法，而問題在判準綁在寫法上）我複核為正確。

**正規化沒有引入新的過寬**：合法指令集合由 10 條擴到 16 條，新增 6 條專打括號移除（`a[0]`、`a[2].id`、`Object.keys(a[0])`、`a.filter(x=>x.textbook.chapter)`、`JSON.stringify(a[0]).length`、`a[0].reality.year`——全部同時含 `node -e`、`history.json` 與中括號），**誤抓 0／16**。F-29 五個結果：漏掉的副本 **1**、六個活區段各 1 共 **6**、七個拼寫變體 **7/7**、合法指令 **0/16**、真實候選 `STRAY 0`／`DUP-MARKER 0`／`AC-OWNED 1`／stderr 0B。

### Q1／Q2／Q3：可否證宣稱通過了自己的否證測試

**「三者不能互相替代」是可否證的**，因為它有一個明確的否證條件：**只要能證明 Q1 的守衛或 Q2 的守衛施加在修法前的 G-7 上會抓到那個缺陷，宣稱就倒了。** 我對重建的修法前 G-7（只數檔案命中數＋`layout.tsx` 相鄰性，即 AC-3 的字面）施加了那個測試：

| 問題 | 守衛 | 施加在修法前 G-7（處 2 的指定行已被刪除）的結果 |
|---|---|---|
| Q1 它到底有沒有真的比 | 比較次數非零 | 命中數 **1／8／1**，全部非零 → **Q1 滿足，守衛不響** |
| Q2 它的基準可不可信 | 基準值的來源 | 字面值與門檻**就是 AC-3 的原文**（「至少一筆」），無任何推導、無時區、無轉換 → **Q2 滿足，守衛不響** |
| Q3 它比的是不是該比的那個對象 | 對象的唯一性與身分 | 指定的那一行已不存在，**8 個健康的旁觀者滿足了斷言** → **Q3 違反** |

修法前 G-7 在這個狀態下回 **`G-7 PASS`、exit 0、stderr 0B**。**兩個既有守衛都通過，缺陷仍在** —— 否證失敗，宣稱成立。**F-32 是一個真實的、可重跑的反例**，不是一個為了說明而構造的例子。

### 第四種載體：沒有。以下是我怎麼找的，以及我找到的兩個「鄰居」

收束句「**檢查確認了「有人」滿足那個性質，從來沒有確認「該負責的那個對象」滿足它**」的形式是：**以 `∃x. P(x)` 充當 `P(d)`，d 為被指定的對象。** 載體＝`x` 所range 的那個集合。三者對得上：

| 載體 | `x` range 在什麼上 |
|---|---|
| 012 肯定式「多重滿足者」 | 某字串的多個**產生點** |
| 012 否定式「多重施用者」 | 某處置的多個**施用者** |
| G-7「只數了檔數」 | 一個被計數容器內的多個**行／位置** |

**涵蓋成立。** 我另外試了兩個候選，兩個都**不是**這個句子的載體：

- **多重檢查**（兩條檢查名目上都覆蓋同一性質，壞掉的那條靜默、好的那條通過）——套件是綠的，但**性質確實被確認了**，假綠不存在，只有一條死掉的檢查沒人發現。**那是 Q1 的地盤**（「它到底有沒有真的比」），不是 Q3。
- **跨檔的多重滿足**（斷言「這個字串在 repo 某處出現」）——那只是把載體三的容器放大，**同一個載體**。

**而我要留下兩個鄰居，因為它們不是這個句子的載體、卻是這個句子的兄弟——問的是另一個問題：**

1. **對象對、但那是它的*代理***：「檢查確認了**記錄**滿足那個性質，從來沒有確認**記錄所描述的那個東西**滿足它。」G-1／G-2 讀的是票的 `status`／`verdict`，不是交付物本身。**這在本票不是缺口**：AC-1 已經明文要求「**『修好』的項目必須指向可查證的證據——票號加合併記錄，或實際指令輸出，不接受口頭宣稱**」，即代理之外另有證據；而 gate 要問的本來就是「每一項有沒有結論」，那個結論的載體就是票。**代理是刻意的對象，不是替身。**
2. **對象對、但那是它的*另一個時刻***：「檢查確認了它**曾經**滿足，從來沒有確認它**現在**滿足。」**這在本票也不是缺口**：G-6 直接 `require` `history.json`、G-7 直接讀那三個檔、`date-check` 與偵測器直接讀本票，全部在執行當下讀活狀態；唯一的陳舊證據風險（`.next/types/` 殘留讓 `tsc` 假性失敗）**已寫成 G-8 的執行順序要求，而且方向是 fail-closed**。

**所以答案是明確的「沒有」。** 我把它寫清楚而不是含糊帶過，因為這句話接下來會被當成判準用：**它管的是「被指定的對象 vs 旁觀者」這一個軸。代理與時刻是另外兩個軸，各自要另外問。** 把三個軸混成一句，下一輪就會有人以為問過了。

### `count==1` 與 `cmp`：區分正確，兩個反證

implement 說三個 `assert count==1` 保護「替換到底有沒有發生」，保護不了「這兩個東西現在是不是真的兩個東西」，後者需要 `cmp`。**正確，而且兩個方向我都造出了反證：**

| 情境 | `assert count==1` | `cmp` |
|---|---|---|
| (i) 把一個字串替換成**它自己**（命中 1 次，檔案不變） | matches=1 → **通過** | identical=true → **抓到** |
| (ii) 預期的替換**沒命中**，但有個無關的位元組不同 | matches=0 → **抓到** | differs → **通過** |

**兩者互不包含**，所以「少掉任何一道，一個同一性就會被讀成一次驗證」是對的。票內兩道都在（`count==1` 類斷言 9 處、`cmp`／位元組相同類 28 處）。**這個區分比我原本那句話更有用**，因為它指出了哪一道守哪一種失敗——我當時只說了「要先證明兩個受測對象不是同一個」，沒說清楚驗證替換發生與驗證結果相異是兩件事。**本輪我自己就用了它**：做 `/^#+ /` 對照前先斷言替換命中 2 處、再斷言 `cmp` 為 DIFFER，兩道都過才開始比較輸出。

### 未越界、未回歸

`## Acceptance criteria` **1622B／sha256 `93e5bf6a95f16592`**——**以 `## Acceptance criteria` 至 `## Test plan` 的標題定位計算，不用固定行號**（標題現在落在 `:359`／`:379`，行號已隨本輪位移；用固定行號就會量到別的東西，implement 本輪被這件事咬過一次）。
`src/` 本輪零變動（自 merge-base 起僅 `layout.tsx` `+1`，cycle 8 已落地）；`PresentDetail.tsx` 零 commit；`src/data/*.json` 與 `main` sha256 相同（`4d1992e3a5fbb21e`／`4071978a7ad0b3d0`）；未跑 `sync-content`；AC-2 維持未達成。
**我自己的 cycle-4 報告**：文字**零改動**——整節抽出比對，`diff` 只有一筆 `131a132`，內容是**一個空行**（19451B → 19452B，差 1 位元組），那是附加下一節時的分隔空行。**變動的文字行數為 0。** implement 說「唯一動到你文字的動作是逐字引用」，據此成立；精確地說是「文字零改動，邊界多一個空行」。
`### Feedback Cycles` 的 `- Cycle` 行數 **12**。活的可執行區塊 **5** 個，逐一分別量測 exit code 與 stderr（全部 0／0B），**沒有以最後一行判定任何一個**。

### 驗證與可否證性

- **每一條指令都從文件抽出後執行**：G-7 正本 1017B、G-6 正本 633B、AC-3 的 `grep` 90B、偵測器 1471B、`date-check` 1588B，全部以 fence-state 感知的行首錨定抽取。
- **做任何新舊對照前，先過兩道守衛**：替換命中次數為 2（非 0、非 1、非 3），且 `cmp` 為 DIFFER。**這是我上一輪自己犯的錯換來的規矩，本輪照它走。**
- **F-32 的可否證點**：情境 H 若也轉紅，這條檢查就是永遠不通過的假檢查——實測維持綠。情境 D／E 若不轉紅，唯一性就只是寫在訊息裡沒有實作——實測 `count=2` 轉紅。
- **F-33 的可否證點**：若仍靠單一字面值承重，移除某一個錨點會讓兩種以上的寫法同時落空——實測最多落空一種。
- **第四種載體的可否證點**：若存在，我應該能構造一個「檢查通過、而被指定對象不滿足」且**不屬於**產生點／施用者／位置三者的例子。我試了兩個，兩個都歸到別的問題（Q1、或同一載體放大容器）。**這是「找不到」，不是「沒找」。**
- **locale 陷阱**：全程未用 `sort`／`uniq`／`sort -u` 判定中文字串；計數用 `grep -c`、`grep -o … | wc -l`、`cmp`、`diff`、Node。
- **BSD awk**：本輪所有 `awk` 判斷（G-7 三處、偵測器、AC 區段抽取）皆分別量測 stderr；除情境 I 外全為 0 位元組；未使用 `strftime`。
- **所有重現都在副本或臨時 git repo 上**：候選位元組零改動，未 commit 任何修正，未重跑 implement。本節提到未來日期時依本票規則省略年份。

### Summary

**PASSED。** 我按硬性收斂判準的三類逐一找過：**沒有 fail-open、沒有 Material 缺陷、沒有會讓 gate 執行者照著做而失敗的東西。**

F-32 九個情境全部正確。**我上一輪那兩條消失路徑現在各自轉紅並指名處別與計數**；處 2／處 3 被複製時 `count=2` 轉紅（唯一性兩個方向都守）；兩個錨點標題改名時轉紅而非靜默通過；別處的無害提及維持綠——**最後這一個和前面一樣重要，否則它就是一條永遠不通過的假檢查**。情境 I 是唯一 stderr 非空的，且同時轉紅。

**`/^#+ /` 對照成立，而且結構比敘述更清楚**：`AGENTS.md` 的 noindex 錨點是 `###`、後面接 `##`，所以只認 `/^### /` 時 `sec` 永不清除，noindex 段的範圍延伸過自己的結尾——把綁定移進那個空隙，出貨版 `FAIL [count=0]`，變體 **`PASS`**。**那是 F-16 在同一張票裡的第二次現身：同一個機制、同一個方向、差一個按鍵。而攔住它的是一個設計成會失敗的探測，不是複核。** 這一輪最該留下的方法論是：**區段範圍的檢查要用「把目標放到區段外緣」來驗，不能用「放在區段內會通過」來驗。**

F-33 的「不靠單一字面值承重」是真的驗出來的：八個錨點逐一移除，**移除任一個最多只有一種寫法落空、其餘至少三種仍被抓到**，escape 形式還有三重冗餘。修根與加字面值的差別在那張矩陣裡直接看得見。正規化**沒有**引入新的過寬——合法集合擴到 16 條（含 6 條專打括號移除）誤抓 0。

**Q3 的可否證宣稱通過了自己的否證測試**：對重建的修法前 G-7，Q1 的守衛（比較次數 1／8／1 全非零）與 Q2 的守衛（基準就是 AC-3 原文、無推導）**都不響**，而它回 `G-7 PASS`——**F-32 確實同時滿足 Q1 與 Q2 而只違反 Q3**，是個可重跑的真實反例。AC 確實不需要動：G-7 一直忠於「三檔各至少一筆」的字面，新增的是 gate 項的收緊。

**第四種載體：沒有。** 收束句管的是「被指定的對象 vs 旁觀者」這一個軸，三種載體都是 `x` range 在產生點／施用者／位置上。我試的兩個候選都歸到別處（多重檢查屬 Q1；跨檔滿足只是同一載體放大容器）。**但我留下兩個兄弟軸，因為把它們混進同一句話，下一輪就會有人以為問過了**：**代理軸**（確認了記錄，沒確認記錄描述的東西——本票不是缺口，AC-1 已要求代理之外另有證據）與**時刻軸**（確認了曾經滿足，沒確認現在滿足——本票不是缺口，所有檢查執行當下讀活狀態，唯一的陳舊風險已寫成 G-8 的順序要求且 fail-closed）。

`count==1` 與 `cmp` 的區分正確，我造了兩個互不包含的反證（把字串替換成它自己／替換沒命中但有無關位元組不同）。**它比我原本那句話更有用**，因為它指出哪一道守哪一種失敗；本輪我做對照前就照它走了兩道。

未越界：AC **1622B／`93e5bf6a95f16592`**（以標題定位而非固定行號），`src/` 零變動，`PresentDetail.tsx` 零改動，資料與 `main` 相同，AC-2 維持未達成，`- Cycle` 行數 12，五個活區塊逐一量測全為 exit 0／stderr 0B。**我自己 cycle-4 的報告文字零改動**（唯一差異是邊界一個空行，1 位元組）。
