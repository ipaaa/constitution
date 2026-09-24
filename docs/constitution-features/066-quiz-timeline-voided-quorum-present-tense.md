---
id: 066
title: quiz 與 controversy-timeline 把已失效的 10 人門檻當現行法
status: verify
source: constitution-features/063 V7（captain 2026-09-23 核准開票）
started: 2026-09-24T17:51:27Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-066-quiz-timeline-voided-quorum-present-tense
issue:
pr:
mod-block:
---

`/quiz/*` 與 `/controversy-timeline` 以現在式把已被宣告違憲失效的 10 人參與評議下限當成現行法，是 feature `063` 修完 `/future` 之後同一個法律錯誤的最大殘餘面。

## Problem

憲法訴訟法第 30 條第 2 項的 10 人參與評議下限，已由 **114 年憲判字第 1 號**宣告違憲，自 2025-12-19 起失其效力。feature `063` 已把 `/future` 的敘述改正，但同一錯誤仍留在別的路由：

| 位置 | 寫的 | 問題 |
|---|---|---|
| `src/data/quizzes/pending.ts:95` | 「這遠低於修法後的 10 人門檻，也是法庭運作困難的關鍵原因」 | 現在式，教讀者失效條文仍是現行法 |
| `src/data/quizzes/controversy.ts:83` | 「根本達不到 10 人門檻」 | 同上 |
| `src/data/controversy-timeline.ts:212` | 持續式敘述 | `/controversy-timeline` **在 `launch-status.ts` 的 `PUBLIC_PAGES` 內**，是預定對外發布的頁面 |

`063` 的 reviewer 已逐行讀過兩個 quiz 檔：`correctIndex` 指向的答案本身（「5 位」「10 人」）**作為歷史題是對的**，錯的是 explanation 的**時態**。

`/quiz` 目前只在 team mode 開放、不在 `PUBLIC_PAGES`；`/controversy-timeline` 則在其中。

**一併處理的第二項**（`063` 的 reviewer 記為非 finding，因早於該票存在）：`src/app/future/page.tsx:201` 的「每年處理量約 30~40 件」是 JSX 硬編、**無來源註解**，且在 `063` 刪去 V1 那一句之後**成為該段唯一的無來源量化敘述**。

## Proposed approach

`controversy-timeline.ts:151`／`:152`／`:164`／`:187` 四處是 2024–2025 事件的**過去式敘述，本身不算錯**（`063` reviewer 已判定），`:212` 的持續式敘述才是 deferred risk。逐處判斷時態，不得一律改寫。

`/quiz` 的 `correctIndex` 與答案不動，只改 explanation 的時態與失效標記。

## Risk evidence

`no spike needed`：位置與時態問題皆由 `063` 的 verify 階段逐行讀過並附行號，一手來源（114憲判1 主文與公告日）亦已由該票三輪逐字查核。

## Out of scope

不改 `/future`（`063` 已交付）。不動 `src/data/*.json`（`sync-content` 產物）。不處理 `REFERENCE_DATE` 身兼兩職的問題（另有其票）。

## Design

本節是 implement 的完整施工依據。所有位置、判定、處置與驗證都寫在這裡。

### 一、一手法律事實（本階段不重查，只列依據與陷阱）

憲法訴訟法第 30 條第 2 項的參與評議人數下限（10 人）與違憲宣告同意下限（9 人），
已由 114 年憲判字第 1 號宣告違憲，自公告日 2025-12-19 起失其效力。
逐字查核由 `063` 三輪完成，結論落在 `src/data/future.ts` 的 `RULING_THRESHOLD`。
本票沿用該結論，不重查。

**查證陷阱（沿用 `063` 的紀錄，未複驗）：** 全國法規資料庫至今仍原樣顯示已失效的
第 30 條第 2 至 6 項，不加任何失效標註。只查該站會得到「10 人下限是現行法」這個
錯誤結論。權威在憲判主文，不在法規資料庫的顯示。

**本階段實跑取得的旁證（新增）：** 憲法法庭判決清單
`https://cons.judicial.gov.tw/judcurrentNew1.aspx?fid=38`，以 `curl` 取得 153,680 bytes，
Node 正規化後逐年去重計數：111 年 20 則、112 年 20 則、113 年 11 則、114 年 1 則、
115 年 6 則。這組數字同時支撐第四小節的判定。

---

### 二、全站逐處清單（implement 的施工依據）

掃描範圍：`src/` 全部 `.ts` 與 `.tsx`。掃描條件為人數下限的各種寫法
（`10 人`／`10人`／`十人`／`10 位`／`9 人`…）、門檻語彙（`門檻`／`參與評議`／`評議`）
與持續語彙（`持續`／`始終`／`至今`／`目前`／`仍`）三組的交集。
`src/data/*.json` 是 `sync-content` 產物，不掃、不改。

判定分四級：

- **A 級**：把已失效的 10 人下限當成現行狀態。必修。
- **B 級**：不提數字，但把下限造成的停擺講成到現在還在。同一錯誤的下游。必修。
- **C 級**：缺少「該下限已失效」這個終點事實，讀者無從得知它已不存在。必修。
- **D 級**：2024–2025 事件的過去式敘述，本身不算錯。不改。

#### A 級（5 處）

| # | 位置 | 現文 | 為什麼錯 |
|---|---|---|---|
| A1 | `src/data/quizzes/pending.ts:94-95` | 「這遠低於修法後的 10 人門檻，也是法庭運作困難的關鍵原因」 | 「是…關鍵原因」為現在式。下限已失效，不再是任何事的原因 |
| A2 | `src/data/quizzes/controversy.ts:82-83` | 「大法官法定員額 15 人，但…僅剩 8 位——根本達不到 10 人門檻」 | 前半句「法定員額 15 人」是現在式，整句因此讀成現況 |
| A3 | `src/data/controversy-timeline.ts:212` | 「憲法法庭因人數不足無法達到新修《憲法訴訟法》的開庭門檻，數百件待審案件持續累積」 | 「持續累積」無終點，讀成到今天還在 |
| A4 | `src/data/controversy-timeline.ts:176` | 「搭配修法墊高的門檻，憲法法庭持續無法正常運作」 | 同上。**`063` 的 reviewer 未列此處** |
| A5 | `src/data/controversy-timeline.ts:180` | 「憲法法庭持續無法達到修法後的開庭門檻，違憲審查機能癱瘓」 | 同上。**`063` 的 reviewer 未列此處** |

A4 與 A5 是本階段新增的發現。`063` 的 reviewer 只列了 A3。
三處用的是同一個詞（`持續`）、同一個檔、相隔 36 行。
這正是本票要處理的那種盲區：檢查只涵蓋被點名的那一處。

#### B 級（3 處）

| # | 位置 | 現文 | 為什麼錯 |
|---|---|---|---|
| B1 | `src/data/quizzes/pending.ts:81-82` | 「違憲審查持續停擺」 | 下限失效後，115 年已作成 6 則判決。敘述與一手來源衝突 |
| B2 | `src/data/quizzes/controversy.ts:96-97` | 「違憲審查持續停擺」 | 同上。與 B1 一字不差，是兩份副本 |
| B3 | `src/data/quizzes/pending.ts:55-56` | 「法庭停擺意味著這些真實的權利爭議無法獲得解決」 | 現在式，且未限定期間 |

B1 與 B2 是 `063` 在 `/future` 已刪除的那句話（「實質上無法做出任何判決」）
在別的路由的等價敘述。`063` 的處置是整句刪除而非改寫，本票沿用。

**B3 的檢查涵蓋缺口，明講：** 第八小節的檢查 3 靠「停擺語彙 ∩ 持續語彙」判定，
B3 沒有持續語彙，因此**檢查 3 抓不到 B3**。B3 只能靠人工逐處判讀。
本票不假裝它被自動涵蓋。

#### C 級（2 處）

| # | 位置 | 缺什麼 |
|---|---|---|
| C1 | `src/data/controversy-timeline.ts:222-228`（`evt-15`） | 只寫「判決宣告…做法違憲」，沒寫第 30 條第 2 項自 2025-12-19 失其效力。時間軸讀者讀完全部 15 個節點，仍不知道 10 人下限已不存在 |
| C2 | `src/data/quizzes/controversy.ts:123-124`（q5 explanation） | 同上。該題正是問 114 年憲判字第 1 號，卻沒提它讓 10 人下限失效 |

C 級是 A 級的根治。只刪掉現在式而不補上終點事實，
讀者仍然只看到「訂了 10 人下限」而不知道它後來沒了。

#### D 級（4 處，複核 `063` reviewer 的判定）

| 位置 | `063` reviewer 判定 | 本階段複核 |
|---|---|---|
| `src/data/controversy-timeline.ts:151`（`evt-09` summary） | 過去式，不算錯 | **同意。** 節點日期 2024-12-20，敘述的是當天三讀通過的法案內容 |
| `src/data/controversy-timeline.ts:152`（`evt-09` detail） | 過去式，不算錯 | **同意其時態判定，但該句另有一個詞要改。** 見下方 D-fix |
| `src/data/controversy-timeline.ts:164`（`evt-10` detail） | 過去式，不算錯 | **部分不同意。** 見下方 D-chrono |
| `src/data/controversy-timeline.ts:187`（`evt-12` summary） | 過去式，不算錯 | **同意。** 節點日期 2025-01-23，敘述的是新法生效當天的狀態 |

**D-fix（`:152`）：** 該句寫「實際上搭配立法院持續凍結大法官人事同意權」。
時態判定沒問題，但 `持續` 這個詞讓第八小節的檢查 1 命中。
處置是**改寫原文消除歧義，不是為檢查加豁免清單**：把「持續凍結」改為「當時已凍結」。
理由：豁免清單會腐化，而且下一個寫手不會知道那一處被豁免。
本票的整個立場是「檢查只涵蓋一種寫法就會形成穩定盲區」，
加白名單等於自己製造一個新的盲區。

**D-chrono（`:164`）：** `evt-10` 的 `date` 是 `2024-10-31`，
但該節點的 detail 寫「而修正後的《憲法訴訟法》要求至少 10 人參與評議」。
修正案 2024-12-20 才三讀、2025-01-23 才生效，皆晚於節點日期。
這是**時序錯置**，不是時態問題，屬另一種缺陷。
本票同檔施工，順手改為後見之明的明講寫法
（例如「兩個月後三讀通過的修正案要求至少 10 人參與評議」），成本一句。
若 gate 認為超出範圍，可只留紀錄不改——它不影響 A／B／C 級的處置。

#### 不改的位置（掃描有命中，判定為正確）

| 位置 | 理由 |
|---|---|
| `src/data/quizzes/*.ts` 的 `correctIndex` 與 `options` | 作為歷史題，答案（「5 位」「10 人」）正確。`063` 的 reviewer 已逐行確認，本階段複核同意 |
| `src/data/quizzes/pending.ts:86` 題幹「目前實際出席參與憲法法庭評議的大法官有幾位？」 | 問的是現在的出席人數，不是門檻。與站上 `ATTENDING_JUSTICES`（5 位）一致 |
| `src/data/quizzes/controversy.ts:101` 題幹「憲法法庭停擺期間…」 | 「期間」已把停擺限定為過去區間 |
| `src/data/quizzes/perspectives.ts:48`／`:57`／`:80` | 講的是「大法官自審自己的開庭門檻」這個爭議本身，不是門檻現行與否 |
| `src/components/future/JusticeTermTimeline.tsx:81-85` | 註解，且已由 `063` 寫明失效 |
| `src/data/future.ts:467`／`:499` | `063` 交付的權威敘述，已帶失效標記 |
| `src/components/Footer.tsx:17`、`src/app/page.tsx:32`、`src/app/layout.tsx:10`／`:13` | 「降低理解門檻」的通用文案，與判決門檻無關 |

#### 一處要改題幹（需 gate 明示同意）

`src/data/quizzes/controversy.ts:73-74` 的題幹：
「國會擴權法案被宣告違憲後，立法院隨即修改《憲法訴訟法》反制。
修法後，憲法法庭作成判決需要至少幾位大法官參與評議？」

「需要」是現在式且無時間錨。讀者會讀成「現在需要 10 人」。
建議在題幹加時間錨，例如「修法後（該規定已於 2025-12-19 失效）…當時規定需要至少幾位」。
**`correctIndex` 與 `options` 完全不動**，正確答案仍是「10 人」。

派工單明列的是「explanation 的時態」，題幹不在其列，因此本項標為**需 gate 明示同意**。
不改也不會讓第八小節的任何一項檢查 FAIL；改了會讓 C2 的補述更自然。

---

### 三、`/quiz` 與 `/controversy-timeline` 的曝光差異，以及它如何決定優先順序

`src/data/launch-status.ts` 的兩個清單：

```
PUBLIC_PAGES = ['/', '/controversy-timeline', '/future']
ALL_PAGES    = PUBLIC_PAGES + ['/opinion-lazybag', '/past', '/present', '/about', '/quiz']
```

`LAUNCHED_PAGES` 在 `NEXT_PUBLIC_PUBLIC_MODE === 'true'` 時鎖到 `PUBLIC_PAGES`。
也就是：正式對外發布時，`/controversy-timeline` 會被外部讀者看到，`/quiz/*` 不會。

**優先順序：`/controversy-timeline` 高於 `/quiz/*`。** 三個理由：

1. **曝光**。`/controversy-timeline` 是預定對外的三頁之一。`/quiz/*` 只在 team mode 開放。
2. **錯誤密度**。`/controversy-timeline` 佔 A 級 3 處與 C 級 1 處，是最大的單一面。
3. **`/quiz` 另有一個未解的前置問題**。`059` 記錄過「quiz 在站上沒有入口」。
   沒有入口的頁面，即使 team mode 開放，實際到達率也接近零。

**但優先順序不是取捨。** 兩者都在本票內修完。
理由：A 級的五處裡有兩處在 quiz，而 quiz 的錯誤敘述會被截圖外流；
「內部頁面」不等於「不會被看到」。分兩票只會讓 quiz 那半長期擱置——
`page.tsx:201` 就是這樣被擱置的（見第四小節）。

若 gate 要求縮小範圍，切法是**按路由切，不按級別切**：
先交 `/controversy-timeline`（A3／A4／A5／C1／D-fix／D-chrono），
再交 `/quiz/*`（A1／A2／B1／B2／B3／C2）。按級別切會讓某一頁只改一半，
留下「刪了現在式但沒補終點事實」的中間狀態，比不改更糟。

---

### 四、`src/app/future/page.tsx:201` 的 materiality 與歸屬判定

現文（`:201-203`）：

```
即使在正常編制下，憲法法庭每年處理量約 30~40 件。以目前 {CRISIS_STATS.totalPending} 件待審案件計算，
即使全員到位也需要數年時間消化。
```

**判定一：materiality 成立，且高於「無來源」本身。** 三項證據：

1. **與一手來源對不上。** 憲法法庭判決清單實跑計數：111 年 20 則、112 年 20 則、
   113 年 11 則。「正常編制下每年 30~40 件」與最自然的權威讀法（年度判決數）
   差了兩到三倍。若「處理量」指含不受理裁定的結案數，則遠高於 40。
   兩種讀法都對不上 30~40，而站上沒有任何地方說明它指哪一種。
2. **與同段的算術矛盾。** 473 ÷ 35 ≈ 13.5 年，句子卻寫「需要數年」。
3. **與同檔的資料矛盾。** `src/data/future.ts:452` 的 `estimatedClearanceYears: 3.4`
   隱含每年約 139 件；`:451` 的 `avgDaysPerCase: 120` 經
   `BottleneckFunnel.tsx:35` 換算得 31.1 年。同一個專案有三個互斥的產能數字。

`063` 刪去相鄰的法律結論句之後，這一句成為該段唯一的無來源量化敘述，
且 `/future` 在 `PUBLIC_PAGES` 內。

**判定二：本票是它的正確歸屬。** 理由不是「同類」，是「沒有別的歸屬」。
`063` 的 reviewer 記為「早於該票存在、非其 finding」並已封存。
再開一張票只為一句話，成本高於施工本身；而本專案有把殘留物放到上線四個月的前例
（`CLAUDE.md` 絕對不要做的事第 3 條）。

**判定三：處置限定為「刪除無來源數字」，不得自行換一個數字。**
與 `063` 對 V1 的處置同型（整句刪除而非改寫）。
implement 若自行填入 11、20 或 139，就是把一個無來源數字換成另一個未經拍板的數字。
正確的產能口徑（判決 vs 結案 vs 受理）需人工拍板，記入 `docs/health-check/TODO.md`。

**這一項與 A／B／C 級是不同的缺陷類別，因此獨立成 AC6，不混進其他 AC。**

---

### 五、Data requirements

#### 現況：失效子句只存在於一個 React 元件裡，資料檔拿不到

`063` 交付的 `src/components/future/RulingThresholdNote.tsx` 是全站唯一的門檻文案來源，
但它把兩個句子寫成**模組內的區域常數**（`:28` 的 `VOIDED_FLOOR_SHORT`、
`:32` 的 `VOIDED_FLOOR_FULL`），沒有 export。

本票要改的六個位置全都是**純資料字串**（`controversy-timeline.ts` 的 `detail`／`consequence`、
quiz 的 `explanation`），無法渲染 React 元件。
若 implement 在這六處各自手寫一次「已由 114 年憲判字第 1 號宣告違憲，
自 2025-12-19 起失其效力」，站上就會有**七份副本**。
`056` 的 F-12 記錄過同型事故：同一個檢查有兩份副本，副本分岔。
七份副本只是把那個事故乘以三點五。

#### 處置：新增一個小模組，所有句子由它產生

新增 `src/data/ruling-threshold.ts`：

- 從 `src/data/future.ts` 移入 `RULING_THRESHOLD`（連同它的 JSDoc）。
- 從 `RulingThresholdNote.tsx` 移入 `VOIDED_FLOOR_SHORT`、`VOIDED_FLOOR_FULL`，改為 export。
  兩個字串的組法一字不改，`/future` 的輸出必須逐字相同。
- 新增第三個 export，供資料檔使用：

```ts
/**
 * 最短版。設計成可以接在「⋯⋯10 人門檻」這類既有句子後面當補述。
 * 三個版本共用 RULING_THRESHOLD.voidedFloor 的同一組欄位，
 * 因此數字、依據與失效日永遠一致。不要在別處另寫一次。
 */
export const VOIDED_FLOOR_CLAUSE =
  `該下限已由 ${voidedFloor.voidedBy}宣告違憲，自 ${voidedFloor.voidedOn} 起失其效力`;
```

- `src/data/future.ts` 改為 re-export（`export { RULING_THRESHOLD } from './ruling-threshold';`），
  現有所有 `from '@/data/future'` 的 import 不必改。
- `RulingThresholdNote.tsx` 改為 import 這兩個字串，不再自行組。

**為什麼是新模組，不是直接放進 `future.ts`：**
`controversy-timeline.ts` 目前沒有任何 import。讓它 import `future.ts`
會把 470 行的待審案件資料集拉進 `/controversy-timeline` 的 bundle。
新模組只有門檻資料，沒有這個代價。

**迴圈相依檢查（已確認）：** `future.ts` 目前 import 0 個模組；
`controversy-timeline.ts` import 0 個；quiz 三檔只 import `./controversy` 的型別。
新增 `ruling-threshold.ts`（不 import 任何本地模組）不會構成迴圈。
`tsconfig.json` 的 `paths` 有 `@/* → ./src/*`，資料檔可用 `@/data/ruling-threshold`。

**對 `063` 的迴歸保護：** `063` 的 AC5 要求
`grep -n '063-required-for-ruling' src/data/future.ts` 至少 1 筆。
搬移後 `future.ts` 必須保留一行指回 `docs/constitution-features/_archive/063-required-for-ruling-legal-accuracy.md`
的註解，否則 `063` 的驗收條件會被本票打破。

#### 型別與資料形狀

不新增型別。`TimelineEvent`、`QuizQuestion` 的欄位不變，只改欄位內的字串。
`VOIDED_FLOOR_CLAUSE` 等三個常數皆為 `string`，由 `RULING_THRESHOLD.voidedFloor` 推導。

---

### 六、Component hierarchy

本票不新增元件，不改任何元件的 props。改動全在資料層與一個文案模組。

```
src/data/ruling-threshold.ts          ← 新增。RULING_THRESHOLD + 三個失效句
  ├─ src/data/future.ts               ← 改為 re-export RULING_THRESHOLD
  │    └─ src/components/future/RulingThresholdNote.tsx   ← 改為 import 兩個句子
  │         └─ src/app/future/page.tsx（variant="card"／"lede"）  ← 輸出須逐字不變
  ├─ src/data/controversy-timeline.ts ← import VOIDED_FLOOR_SHORT／CLAUSE
  │    └─ src/components/controversy-timeline/TimelineNode.tsx   ← 不改
  └─ src/data/quizzes/{pending,controversy}.ts  ← import VOIDED_FLOOR_CLAUSE
       └─ src/components/quiz/QuizContainer.tsx ← 不改
```

`src/components/controversy-timeline/TimelineNode.tsx:92`／`:111`／`:117`
分別渲染 `summary`／`detail`／`consequence`，三者都只吃字串，不需要改。

---

### 七、Mobile / desktop 響應行為

`TimelineNode.tsx:106` 的展開區塊用 `max-h-[1000px]` 做開合動畫。
超過 1000px 的內容會被截掉。

現況實測（`node` 量測字串長度）：`detail` 共 15 筆，最長 189 字；
`summary` 最長 43 字；`consequence` 最長 45 字。

375px 寬時，節點卡片扣掉 `ml-10`（40px）與 `p-4`（32px）後可用約 303px，
`text-sm` 下每行約 21 個全形字。189 字約 9 行、約 200px，距 1000px 尚遠。

**本票的長度預算：`detail` 不超過 320 全形字，`consequence` 不超過 80 全形字。**
320 字在 375px 下約 16 行、約 350px，仍在 `max-h-[1000px]` 內，留兩倍餘裕。
本票預計加入的失效補述約 35 到 60 字，最長的 `evt-15`（189 字）加完約 250 字，
在預算內。

`md:` 以上為左右交錯的雙欄（`md:w-[calc(50%-2rem)]`），單欄寬度更窄但可用高度不變，
1000px 的餘裕更大。桌機不需額外處置。

quiz 的 explanation 沒有高度限制，不需預算。

---

### 八、驗證工具與兩個必須知道的陷阱

#### 8.1 取真 HTML 的方法（沿用 `063`，本階段已實跑）

`src/components/LaunchGate.tsx:30` 在 hydration 前 `return null`。
因此 `curl` 直接抓 `/future`，**頁面內容完全不在 HTML 裡**——本階段實測 52,522 bytes，
只有頁首頁尾。`/controversy-timeline` 與 `/quiz/*` 的資料因為經 RSC flight payload 序列化，
即使閘門擋住也仍在 HTML 內，但 DOM 裡沒有；`/future` 的門檻文案出自 client component，
兩邊都沒有。

作法（不動候選檔）：

```bash
SCRATCH=<scratchpad>
git archive HEAD | tar -x -C "$SCRATCH/repo"
cp -Rc "<repo root>/node_modules" "$SCRATCH/repo/node_modules"
# 只在副本裡讓 LaunchGate 直接放行
#   export default function LaunchGate({ children }) {
# +   return <>{children}</>; // VERIFY-ONLY
cd "$SCRATCH/repo" && ./node_modules/.bin/next dev -p 3211
```

本階段實跑結果：`/future` 124,313 bytes（`063` 當時為 124,222／124,318，同一量級），
`/controversy-timeline` 91,479、`/quiz/controversy` 42,229、`/quiz/pending` 41,455。
**候選 repo 的 `git status --porcelain` 全程為空。**

主 repo 的 `.next/dev/lock` 可能被同 session 的其他 ensign 佔用
（本階段實際遇到）。副本作法同時解決這個衝突。

#### 8.2 陷阱：`sort`／`uniq` 在此機器上會把不同的中文字串併成同一筆

兩行可重現：

```bash
printf '10人\n10位\n' | sort | uniq -c
#   2 10人      ← 錯。兩個不同字串被併成一筆，而且顯示成其中一個
LC_ALL=C sort <<< $'10人\n10位' | LC_ALL=C uniq -c
#   1 10人
#   1 10位      ← 對
```

`sort -u` 同樣會併。更廣的例子：`甲人`／`甲名`／`乙位` 三個字串在預設 locale 下
被 `uniq -c` 併成 `3 甲人`。本機 `LANG=en_US.UTF-8`，`sort` 與 `uniq` 為 `/usr/bin` 的 BSD 版。

**這正是本票要防的那種盲區，而且是最惡劣的一種：它不報錯，只是少報。**
本階段一度據此得出「`/controversy-timeline` 有 5 個 `10人`、0 個 `10位`」的結論，
實際是 4 個 `10人` 與 1 個 `10位`（`grep -ob` 逐處列印位元組位移證實）。

**規則：本票的任何驗證，不得用 `sort | uniq -c` 或 `sort -u` 判定中文字串。**
要計數就用 `grep -o … | wc -l`，要去重就在 Node 裡用 `Set`。
`grep -oE '10(人|位)'` 本身是對的，錯的是後面那截管線。

#### 8.3 檢查腳本 `scripts/check-voided-floor.mjs`

implement 需把下列內容**原樣**建檔。
它是這三項檢查的唯一定義；AC 只引用它，不再複製一份指令清單。

```js
#!/usr/bin/env node
// 檢查站上是否把已失效的 10 人參與評議下限當成現行法。
//
// 一手依據：憲法訴訟法第 30 條第 2 項的參與評議人數下限，
// 經 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力。
//
// 設計原則：先正規化再比對，不列舉寫法。
// 「10 人」「10人」「十人」「10 位」正規化後是同一個 token；
// 「114 年憲判字第 1 號」與「114年憲判字第1號」也是。
// 逐一列舉寫法的 grep 已在本專案造成九次穩定盲區，本檔不用那種作法。
//
// 本檔不設豁免清單。檢查誤報時，改寫原文消除歧義，不要加白名單。

const PAGES = process.argv.slice(2);
if (PAGES.length === 0) {
  console.error('usage: node check-voided-floor.mjs <url> [url...]');
  process.exit(2);
}

/** 去掉 HTML 標籤、RSC flight payload 的 Unicode 轉義與所有空白 */
function normalize(html) {
  return html
    .replace(/<[^>]*>/g, '。')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/[\s\u00a0\u2000-\u200b\u3000]+/g, '');
}

/**
 * 切句。除了中文句末標點，也在 JSON 字串邊界切開——
 * flight payload 把每個欄位包成字串，不切會讓相鄰欄位黏成一句。
 */
function sentences(text) {
  return text
    .replace(/\\"/g, '')
    .replace(/["',]/g, '')
    .split(/[。！？；:{}[\]]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** 人數下限：條文訂的具體門檻數字 */
const FLOOR_NUM = /(10人|10位|10名|十人|十位|十名|9人|9位|9名|九人|九位|九名)/;
/** 門檻語彙：不帶數字也指向同一件事的說法 */
const FLOOR_WORD = /(評議門檻|開庭門檻|判決門檻|人數門檻|門檻)/;
/** 法庭脈絡：把頁首頁尾的「降低理解門檻」這類通用文案排除在外 */
const COURT = /(憲法法庭|大法官|憲法訴訟法|評議|判決)/;
const THRESHOLD = (s) => (FLOOR_NUM.test(s) || FLOOR_WORD.test(s)) && COURT.test(s);
/** 失效語彙：任何指向「已經沒有效力」的說法。刻意不含「違憲」——
 *  「宣告修正案違憲」不等於「這一項已失效」，含進來會讓檢查 2 假性通過 */
const VOIDED = /(失效|失其效力|不再適用|已廢止|停止適用)/;
/** 依據語彙：正規化後的判決字號 */
const AUTHORITY = /114年憲判字第1號/;
/** 持續語彙：把狀態講成「到現在還在」的說法 */
const ONGOING = /(持續|始終|至今|目前|仍然|仍舊|如今|依然|現在)/;
/** 停擺語彙：把法庭講成不能運作的說法 */
const PARALYSIS = /(停擺|癱瘓|無法運作|無法正常運作|無法作成判決|無法受理)/;

let failed = false;

for (const url of PAGES) {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`FAIL ${url}: HTTP ${res.status}`);
    failed = true;
    continue;
  }
  const full = normalize(await res.text());
  const sents = sentences(full);
  const floorSents = sents.filter(THRESHOLD);

  // 檢查 1：以句為單位。凡講到門檻的句子，不得帶持續語彙。
  const ongoingHits = [...new Set(floorSents.filter((s) => ONGOING.test(s)))];

  // 檢查 2：以字元視窗為單位，不以句為單位。
  // 理由：client component 的文案在 SSR 後被標籤與註解切碎，切句會把
  // 本來同一句的「門檻」「失效」「依據」拆到三句，造成假性 FAIL。
  const WINDOW = 150;
  const clauseHits = [];
  const g = new RegExp(FLOOR_NUM.source, 'g');
  let m;
  let floorNumCount = 0;
  while ((m = g.exec(full)) !== null) {
    const w = full.slice(Math.max(0, m.index - WINDOW), m.index + WINDOW);
    if (!COURT.test(w)) continue;
    floorNumCount += 1;
    if (VOIDED.test(w) && AUTHORITY.test(w)) clauseHits.push(w);
  }

  // 檢查 3：停擺敘述不得帶持續語彙。法庭在下限失效後已作成六則判決。
  const paralysisHits = [...new Set(
    sents.filter((x) => PARALYSIS.test(x) && ONGOING.test(x) && COURT.test(x)),
  )];

  const c1 = ongoingHits.length === 0;
  // 頁面沒提到人數下限就不必掛失效說明；提到了就一定要掛。
  const c2 = floorNumCount === 0 || clauseHits.length >= 1;
  console.log(`\n=== ${url}`);
  console.log(`句數 ${sents.length}, 門檻句 ${floorSents.length}, 下限數字出現 ${floorNumCount} 次`);
  console.log(`檢查 1 門檻句不得帶持續語彙: ${c1 ? 'PASS' : 'FAIL'} (${ongoingHits.length} 筆)`);
  for (const s of ongoingHits) console.log(`  x ${s.slice(0, 110)}`);
  console.log(`檢查 2 門檻+失效+依據須同窗出現: ${c2 ? 'PASS' : 'FAIL'} (${clauseHits.length} 筆)`);
  if (clauseHits.length) console.log(`  o ${clauseHits[0].slice(0, 160)}`);
  const c3 = paralysisHits.length === 0;
  console.log(`檢查 3 停擺敘述不得帶持續語彙: ${c3 ? 'PASS' : 'FAIL'} (${paralysisHits.length} 筆)`);
  for (const x of paralysisHits) console.log(`  x ${x.slice(0, 110)}`);
  if (!c1 || !c2 || !c3) failed = true;
}

process.exit(failed ? 1 : 0);
```

#### 8.4 本階段實跑輸出（改動前的基線）

上述腳本已在本階段對六條路由實跑，指令為

```
node scripts/check-voided-floor.mjs \
  http://localhost:3211/future \
  http://localhost:3211/controversy-timeline \
  http://localhost:3211/quiz/controversy \
  http://localhost:3211/quiz/pending \
  http://localhost:3211/quiz/rights \
  http://localhost:3211/quiz/perspectives
```

輸出：

```
=== /future                     檢查1 PASS(0)  檢查2 PASS(3)  檢查3 PASS(0)
=== /controversy-timeline       檢查1 FAIL(4)  檢查2 FAIL(0)  檢查3 FAIL(2)
=== /quiz/controversy           檢查1 PASS(0)  檢查2 FAIL(0)  檢查3 FAIL(1)
=== /quiz/pending               檢查1 PASS(0)  檢查2 FAIL(0)  檢查3 FAIL(1)
=== /quiz/rights                檢查1 PASS(0)  檢查2 PASS(0)  檢查3 PASS(0)
=== /quiz/perspectives          檢查1 PASS(0)  檢查2 PASS(0)  檢查3 PASS(0)
exit=1
```

檢查 1 的四筆命中，逐字為：

```
x 這個修法表面上是「提高司法品質」，實際上搭配立法院持續凍結大法官人事同意權（不審查新提名人），等於讓憲法法庭無法達到開庭門檻   ← :152（D-fix）
x 立法院透過否決提名人選，使憲法法庭始終無法補足大法官人數，搭配修法墊高的門檻，憲法法庭持續無法正常運作                   ← :176（A4）
x 憲法法庭持續無法達到修法後的開庭門檻，違憲審查機能癱瘓                                                               ← :180（A5）
x 憲法法庭因人數不足無法達到新修《憲法訴訟法》的開庭門檻，數百件待審案件持續累積，人民的釋憲聲請無法獲得及時處理           ← :212（A3）
```

檢查 3 的四筆（三頁合計）逐字為 `:176`、`:180`，以及 quiz 兩檔的
「這使得憲法法庭始終無法補足人數，違憲審查持續停擺」（B1、B2 一字不差）。

**三個對照組證明這組檢查不是套套邏輯：**

- `/future` 三項全 PASS。該頁是 `063` 已修好的同一個法律錯誤。
  檢查若只會 FAIL 不會 PASS，`/future` 不可能過。
- `/quiz/rights`、`/quiz/perspectives` 三項全 PASS。兩頁完全沒提人數下限，
  檢查 2 的「沒提就不要求」分支在此被走到。
- 若把 `VOIDED` 加回「違憲」，`/controversy-timeline` 的檢查 2 會因為 `evt-15`
  的「宣告⋯⋯違憲」而假性 PASS——本階段實跑確認過這個假性通過，
  因此腳本刻意把「違憲」排除在 `VOIDED` 之外。

#### 8.5 涵蓋矩陣（哪一處由哪一項檢查抓，以及哪幾處沒有自動涵蓋）

| 位置 | 自動檢查 | 只能人工 |
|---|---|---|
| A1 `pending.ts:94-95` | 檢查 2（`/quiz/pending`） | |
| A2 `controversy.ts:82-83` | 檢查 2（`/quiz/controversy`） | |
| A3 `controversy-timeline.ts:212` | 檢查 1 | |
| A4 `controversy-timeline.ts:176` | 檢查 1、檢查 3 | |
| A5 `controversy-timeline.ts:180` | 檢查 1、檢查 3 | |
| B1 `pending.ts:81-82` | 檢查 3 | |
| B2 `controversy.ts:96-97` | 檢查 3 | |
| B3 `pending.ts:55-56` | **無** | AC3 |
| C1 `controversy-timeline.ts:222-228` | 檢查 2（`/controversy-timeline`） | |
| C2 `controversy.ts:123-124` | 檢查 2（`/quiz/controversy`） | |
| D-fix `controversy-timeline.ts:152` | 檢查 1 | |
| D-chrono `controversy-timeline.ts:164` | **無** | AC4 |
| 題幹 `controversy.ts:73-74` | **無** | AC5 |
| `future/page.tsx:201` | **無** | AC6 |

四處沒有自動涵蓋，全部明列在 AC3 到 AC6，各自有可失敗的人工驗證。
本票不宣稱自動檢查涵蓋全部——宣稱涵蓋全部而實際沒有，正是前九次盲區的成因。

---

### 九、Acceptance criteria

每一項都附可失敗的 `Verified by:`。

**本節的規則：同一個檢查只定義一次。**
需要重用時寫「同 ACx」，不得複製第二份指令清單。
`063` 的 AC3 與 AC7 就是因為同一個語意有兩份指令、其中一份沒跟上而產生盲區。

**AC1　失效子句在整個 `src/` 只有一個定義處。**
Verified by:
`grep -rn '起失其效力' src/ --include=*.ts --include=*.tsx`
的每一筆命中都必須落在 `src/data/ruling-threshold.ts`。
且 `grep -rn "from '@/data/ruling-threshold'" src/` 至少 4 筆
（`future.ts`、`RulingThresholdNote.tsx`、`controversy-timeline.ts`、quiz 兩檔中至少一檔）。
**會失敗的改動：** implement 在 quiz 或時間軸的字串裡手寫一次失效句。
那會在 `ruling-threshold.ts` 以外多出一筆命中。

**AC2　三個目標路由的檢查 1、2、3 全部 PASS，三個對照路由維持 PASS。**
Verified by: 以第 8.1 小節的副本作法起 dev server，執行第 8.3 小節的
`scripts/check-voided-floor.mjs`，六條路由一次跑完，`exit 0`。
基線見第 8.4 小節：改動前為 `exit 1`，`/controversy-timeline` 三項全 FAIL。
**會失敗的改動：**
1. 只改被點名的 `:212` 而漏掉 `:176`／`:180` — 檢查 1 仍會報 2 筆。
2. 只刪現在式而不補失效子句 — 檢查 2 仍為 0 筆。
3. 為了讓檢查通過而改腳本的 regex 或加豁免清單 — `/future` 對照組會連帶失去意義，
   review 階段須比對腳本與本文件第 8.3 小節逐字相同。
4. 一律改寫時態把 `:151`／`:187` 的過去式也改掉 — 檢查不會抓到，但 AC4 會。

**AC3　`pending.ts:55-56`（B3）已處置，且處置理由寫進票內。**
Verified by: `sed -n '55,56p' src/data/quizzes/pending.ts` 的輸出中，
「法庭停擺」不再以無時間限定的現在式出現——句中必須出現時間錨
（2025 年 1 月 23 日至 2025 年 12 月 19 日的區間，或「當時」）。
implement 必須把處置前後的該兩行貼進 stage report。
**會失敗的改動：** 因為第 8.3 小節的檢查 3 對 B3 回報 PASS 就跳過它。
B3 沒有持續語彙，檢查 3 本來就抓不到（見 8.5 矩陣）。

**AC4　D 級四處的判定經逐處複核，`:151` 與 `:187` 一字未改。**
Verified by:
`git diff -- src/data/controversy-timeline.ts` 中，
第 151 行與第 187 行不得出現在 diff 內。
`:152` 只允許「持續凍結」→「當時已凍結」這一處字詞變動。
`:164` 的處置（改為後見之明寫法，或維持原狀並記錄理由）二選一，
implement 須在 stage report 寫明選了哪一個。
**會失敗的改動：** 對整個檔案做時態的全域替換。
那會讓 `:151`／`:187` 出現在 diff 裡。

**AC5　`controversy.ts:73-74` 的題幹處置符合 gate 的裁示，且答案完全不動。**
Verified by:
`git diff -U0 -- src/data/quizzes/ | grep -E '^[+-]' | grep -cE 'correctIndex|label:' `
必須為 0。
題幹本身：gate 若同意加時間錨，`:74` 須出現時間錨；gate 若不同意，`:74` 不得出現在 diff 內。
**會失敗的改動：** 改動任何 `correctIndex` 或任何 `options` 的 `label`／`text`。
派工單與 `063` 的 reviewer 都已確認答案作為歷史題是對的。

**AC6　`src/app/future/page.tsx:201` 不再有無來源的量化敘述，且沒有被換成另一個未拍板的數字。**
Verified by:
1. `grep -n '30~40\|30-40' src/app/future/page.tsx` 回傳 0 筆。
2. `grep -nE '每年[^。]*[0-9]+[^。]*件' src/app/future/page.tsx` 回傳 0 筆。
3. `docs/health-check/TODO.md` 新增一列待人工拍板項，內容為「憲法法庭年度產能的
   正確口徑（判決／結案／受理）與數字」，格式比照該檔既有的 `P0-2`。
**會失敗的改動：** implement 自行把 30~40 換成 11、20 或 139。
第 2 條會抓到。三個數字分別來自年度判決數、`estimatedClearanceYears` 反推、
以及含裁定的結案數，都需要人工確認口徑，不是 implement 能拍板的。

**AC7　沒有動到禁區，且既有行為沒有迴歸。**
Verified by:
1. `shasum -a 256 src/data/*.json` 與改動前相同。基線：
   `discussions.json` = `4071978a7ad0b3d041f7cf0df5d5cf580db9e1c6b47df657819e698b213d3162`，
   `history.json` = `4d1992e3a5fbb21e13a7324ad9ca573fda48ac7d8209fb7a1c67da57047cea3b`
   （本階段實跑，與 `063` 記錄一致）。
2. `src/app/layout.tsx` 的 `robots: { index: false, follow: false }` 仍在。
3. `npx tsc --noEmit` exit 0。基線：本階段實跑 exit 0，改動前是乾淨的。
   若因 `.next/` 內出現檔名帶「 2」的重複檔而假性失敗，先 `rm -rf .next` 再跑，
   **不要改原始碼，也不要斷言成因**。
4. `grep -n '063-required-for-ruling' src/data/future.ts` 至少 1 筆
   （`063` 的 AC5，不得被本票的搬移打破）。
5. `/future` 的門檻文案逐字不變：以第 8.1 小節的副本作法各取改動前後的
   `/future` HTML，`RulingThresholdNote` 產出的兩個句子逐字比對相同。
**會失敗的改動：** 執行 `npm run sync-content`、手改 `src/data/*.json`、
或在搬移 `RULING_THRESHOLD` 時順手改了句子的措辭。
見 `CLAUDE.md` 絕對不要做的事第 1、2、4 條。

---

### 十、文件影響

**現在更新：無。**
理由：本階段只產規格，不施工。第二小節的位置清單與第四小節的判定
都還沒反映到程式碼。現在寫進 evergreen 文件，就會產生
`CLAUDE.md` 所說「過時的 evergreen 文件是危險的」那種風險。
本階段查到的兩個陷阱（8.2 的 `uniq` 併字、8.1 的 LaunchGate 使 SSR 無內容）
留在本 entity 內，由 FO 在 gate 轉達 captain。

**實作後更新：**

| 文件 | 要改什麼 | 現況 |
|---|---|---|
| `docs/health-check/TODO.md` | 新增一列待人工拍板項：憲法法庭年度產能的正確口徑與數字。格式比照 `P0-2` | 已定方向，尚未實作。驗證目標＝AC6 第 3 點 |
| `docs/INDEX.md` | 新增 `scripts/check-voided-floor.mjs` 的說明列，並更新 `docs/health-check/TODO.md` 的「最後查核」日期 | 已定方向，尚未實作 |
| `CLAUDE.md` | 在「絕對不要做的事」加第 5 條：不得用 `sort \| uniq -c` 或 `sort -u` 判定中文字串（見 8.2） | 已定方向，尚未實作。此項影響所有後續票，建議由 FO 確認是否併入本票或另開 |

**不更新：**

| 文件 | 理由 |
|---|---|
| `docs/constitution-features/_archive/063-required-for-ruling-legal-accuracy.md` | 封存文件。`CLAUDE.md` 文件規範：`record` 不改寫。本票對 `063` reviewer 判定的複核（A4／A5／D-chrono）留在本票內 |
| `docs/constitution-features/056-pre-launch-checklist.md`、`065-...md` | 兩票正有其他 ensign 在作業。並行改寫會撞 git index |
| `docs/content-pipeline/design.md` | 本票不動內容產線 |
| `src/data/*.json` | 產物，不是原始資料。見 `CLAUDE.md` 絕對不要做的事第 2 條 |

---

### 十一、Out of scope（順手發現，本票不修，附證據供 FO 判斷）

1. **`src/app/present/page.tsx:18` 把 114 年憲判字第 1 號的年份與主題都寫錯。**
   現文為 `{ year: '2024', label: '114年憲判字第1號', detail: '關於國會職權修法之重大判決…' }`。
   114 年憲判字第 1 號作成於 2025-12-19，主題是《憲法訴訟法》修正案；
   「國會職權修法」是 113 年憲判字第 9 號（2024）。
   年份與主題各錯一處，且兩者互相「自圓其說」，掃讀看不出來。
   這與 `063` 第六小節記錄的 114憲判1／113憲判9 混用同型，也與 `065` 正在處理的
   `opinion-lazybag` 誤引同型，但**位置是新的**（`/present`，不在 `PUBLIC_PAGES`）。
   建議併入 `065` 或另開票。

2. **`CRISIS_STATS` 有三個互斥的產能數字。**
   `future.ts:451` 的 `avgDaysPerCase: 120` 經 `BottleneckFunnel.tsx:35` 換算得 31.1 年；
   `future.ts:452` 的 `estimatedClearanceYears: 3.4` 隱含每年約 139 件且**全站無人引用**；
   `future/page.tsx:201` 寫每年 30~40 件。本票只處理第三個（AC6），前兩個需一起重新拍板。

3. **`REFERENCE_DATE` 與 `LAST_UPDATED` 的落差仍在。**
   `future.ts:91` 的 `REFERENCE_DATE = '2026-04-29'` 已落後今日近五個月。
   `063` 第十二小節第 2 點已記錄，本票不動。

4. **`sort`／`uniq` 併中文字串的問題影響範圍遠大於本票。**
   見 8.2。本專案所有以中文內容為主題的驗證都可能受影響，
   包含已封存票的驗證紀錄。建議 FO 評估是否需要回溯複驗。

## Stage Report: design

- DONE: 逐處判定站上每一個把已失效的 10 人門檻當**現行法**的位置，並區分「過去式敘述（本身不算錯）」與「現在式敘述（錯）」。已知三處：`src/data/quizzes/pending.ts:95`、`src/data/quizzes/controversy.ts:83`、`src/data/controversy-timeline.ts:212`；但你必須自行全域掃過 `src/` 確認沒有遺漏，並把完整清單寫進票內——這份清單就是 implement 的施工依據。`controversy-timeline.ts:151`／`:152`／`:164`／`:187` 四處經 `063` 的 reviewer 判定為 2024–2025 事件的過去式敘述、本身不算錯，請自行複核該判定。
  第二小節，14 處分 A／B／C／D 四級。全域掃過 `src/` 全部 `.ts`／`.tsx`。除派工單點名的三處外，新找到 `:176`（A4）與 `:180`（A5）兩處同型持續式敘述，以及 quiz 三處停擺敘述（B1–B3）與兩處缺終點事實（C1、C2）。D 級複核：`:151`／`:187` 同意不算錯；`:152` 同意時態判定，但「持續凍結」一詞要改（否則檢查 1 命中，且處置是改原文不是加豁免）；`:164` 部分不同意——節點日期 2024-10-31 早於修正案三讀 2024-12-20，卻寫「修正後的《憲法訴訟法》要求」，屬時序錯置。
- DONE: 判定 `src/app/future/page.tsx:201` 的「每年處理量約 30~40 件」該不該併入本票
  第四小節。判定併入，理由是「沒有別的歸屬」而非同類。materiality 由三項證據支撐：憲法法庭判決清單實跑計數（111 年 20 則、112 年 20 則、113 年 11 則）與 30~40 差兩到三倍；473÷35≈13.5 年與同句「需要數年」矛盾；`future.ts:452` 的 `estimatedClearanceYears: 3.4` 隱含每年約 139 件、`:451` 的 `avgDaysPerCase: 120` 經 `BottleneckFunnel.tsx:35` 換算得 31.1 年，三個數字互斥。處置限定為刪除，不得換數字，獨立成 AC6。
- DONE: 每項 acceptance criteria 附可失敗的 `Verified by:`，且**涵蓋面要對齊語意而非某一次的寫法**（見 scope notes 的九次教訓）
  第九小節 AC1–AC7。三項自動檢查的唯一定義在 `scripts/check-voided-floor.mjs`（第 8.3 小節逐字給出），AC 只引用不複製。正規化後比對取代列舉寫法：`10 人`／`10人`／`十人`／`10 位` 與 `114 年憲判字第 1 號`／`114年憲判字第1號` 各自視為同一 token。第 8.5 小節列出涵蓋矩陣，明講四處沒有自動涵蓋（B3、D-chrono、題幹、`page.tsx:201`），各自落到 AC3–AC6 的人工驗證。
- DONE: 至少一項須在**真實頁面 HTML** 上驗證
  AC2。已用副本作法（`git archive` + `cp -Rc node_modules` + 只在副本內停用 LaunchGate）起 dev server 實跑六條路由：`/controversy-timeline` 三項全 FAIL（檢查 1 四筆、檢查 2 零筆、檢查 3 兩筆）、`/quiz/controversy` 與 `/quiz/pending` 檢查 2／3 FAIL、`/future` 與 `/quiz/rights` 與 `/quiz/perspectives` 三項全 PASS，`exit 1`。輸出見第 8.4 小節。票內嵌入的腳本與實跑的腳本經 `diff` 確認逐字相同。候選 repo 的 `git status --porcelain` 全程為空。
- DONE: `/quiz/*` 目前只在 team mode 開放，請在票內寫明這個曝光差異如何影響優先順序
  第三小節。`/controversy-timeline` 在 `PUBLIC_PAGES` 內、`/quiz/*` 不在，故前者優先；但兩者都在本票內修完，切法是按路由切不按級別切——按級別切會留下「刪了現在式但沒補終點事實」的中間狀態。
- DONE: 將文件影響分成 `現在更新`、`實作後更新` 與 `不更新`；每一節都要列出文件或寫 `無`
  第十小節。現在更新＝無（附理由）；實作後更新三份，每筆都記已定方向、尚未實作與驗證目標；不更新四項。
- DONE: Component hierarchy with props and responsibilities／Data requirements／Mobile-desktop 響應行為
  第五、六、七小節。新增 `src/data/ruling-threshold.ts` 作為失效句的唯一定義處，`future.ts` 改 re-export 以免打破 `063` 的 AC5；不新增元件、不改任何 props；`TimelineNode.tsx:106` 的 `max-h-[1000px]` 訂出 `detail` ≤ 320 全形字的預算（現況最長 189 字，加補述後約 250 字）。

### Summary

站上把已失效的 10 人下限當現行法的位置共 14 處，比派工單已知的三處多 11 處。
其中 `controversy-timeline.ts:176` 與 `:180` 與被點名的 `:212` 用同一個詞、在同一個檔、相隔 36 行，
是「檢查只涵蓋被點名的那一處」這個盲區的又一個實例。
驗證改用「先正規化再比對」的 Node 腳本取代列舉寫法的 grep，
腳本是三項檢查的唯一定義，AC 只引用而不複製第二份指令清單。
本階段另外查到一個會讓中文驗證靜默少報的機器層陷阱：本機預設 locale 下
`printf '10人\n10位\n' | sort | uniq -c` 輸出 `2 10人`，兩個不同字串被併成一筆並顯示成其中一個。
本階段一度據此得出錯誤計數，改用 `grep -ob` 逐處列印位元組位移才發現。
此事影響本專案所有以中文內容為主題的驗證，已列入 Out of scope 第 4 點供 FO 判斷是否回溯複驗。
`/future`（`063` 已修好的同一個法律錯誤）作為對照組三項全 PASS，
證明這組檢查不是只會 FAIL 的套套邏輯。

## Stage Report: implement

- DONE: 依第二小節的 14 處清單（A／B／C／D 四級）逐處施工，並按**路由**切而非按級別切。`/controversy-timeline` 在 `PUBLIC_PAGES` 內故優先，但兩者都在本輪修完。D 級依 design 的複核處置：`:151`／`:187` 不動；`:152` 的「持續凍結」要改（不是加豁免）；`:164` 的時序錯置要修
  commit `5eff145`。兩條路由同一輪交付，無中間狀態。A1／A2／B1／B2／B3／C2 在 quiz 兩檔，A3／A4／A5／C1／D-fix／D-chrono 在 `controversy-timeline.ts`。D 級：`:152` 只改「持續凍結」→「當時已凍結」四字，未加豁免清單；`:164` 選**改為後見之明寫法**（「而兩個月後三讀通過的《憲法訴訟法》修正案要求至少 10 人參與評議⋯⋯憲法法庭在新法 2025 年 1 月 23 日生效後面臨實質停擺」）；`:151`／`:187` 逐字比對與 HEAD 相同，且不在 `git diff -U0` 的 +／- 行內（AC4 證據見下）。B1／B2 沿用 `063` 的處置整句刪除而非改寫。
- DONE: 建立 `src/data/ruling-threshold.ts` 作為失效句的**唯一定義處**，`future.ts` 改 re-export；並落地 `scripts/check-voided-floor.mjs`（第 8.3 小節逐字給出）作為三項自動檢查的唯一定義——**AC 只引用不複製**。AC6 的 `future/page.tsx:201`「每年處理量約 30~40 件」**限定為刪除，不得換數字**
  `RULING_THRESHOLD` 連同 JSDoc 自 `future.ts` 移入，`future.ts:463` 改 `export { RULING_THRESHOLD } from './ruling-threshold'`，既有 `from '@/data/future'` 的 import 一個都沒改。`VOIDED_FLOOR_SHORT`／`FULL` 自 `RulingThresholdNote.tsx` 移入並 export，字串組法一字未動；新增 `VOIDED_FLOOR_CLAUSE`。腳本以程式自 entity 第 8.3 小節的 js 程式碼圍籬抽出建檔，並回頭逐字比對：`VERBATIM MATCH with entity 8.3`（5073 bytes）。`page.tsx:201` 整句刪除、未填任何數字，口徑待拍板記入 `docs/health-check/TODO.md` 的 P1-9。
- DONE: 依 AC1–AC7 逐項驗證並貼出輸出：AC2 須在**真實頁面 HTML**（副本作法）上跑六條路由，改完後三項檢查應全部 PASS、離開碼 0。第 8.5 小節列明四處**沒有自動涵蓋**（B3、D-chrono、題幹、`page.tsx:201`），各自落到 AC3–AC6 的人工驗證，請逐項給出人工驗證的證據
  七項全數驗過，輸出見下方「AC 驗證輸出」。四處人工驗證各有可失敗的證據，見 AC3／AC4／AC5／AC6。

### AC 驗證輸出

**AC1（失效句只有一個定義處）PASS。** `grep -rn '起失其效力' src/ --include=*.ts --include=*.tsx` 共 4 筆，全部落在 `src/data/ruling-threshold.ts`（`:29`／`:67`／`:73`／`:81`）。import 自 `ruling-threshold` 的檔案 5 個（`future.ts`、`RulingThresholdNote.tsx`、`controversy-timeline.ts`、quiz 兩檔），≥ 4 的門檻。會讓它失敗的改動（在 quiz 或時間軸手寫一次失效句）不存在。

**AC2（六條路由三項檢查）PASS，`exit 0`。** 副本作法起兩台 dev server：`before` = `git archive HEAD`（改動前，port 3212）、`after` = 工作樹（port 3221），兩邊只在副本內讓 `LaunchGate` 直接放行。候選 repo 的 `git status --porcelain` 全程只有本票的改動，無 VERIFY-ONLY 字樣。

| 路由 | 改動前（3212） | 改動後（3221） |
|---|---|---|
| `/future` | 1 PASS／2 PASS(3)／3 PASS | 1 PASS／2 PASS(3)／3 PASS |
| `/controversy-timeline` | 1 **FAIL(4)**／2 **FAIL(0)**／3 **FAIL(2)** | 1 PASS／2 PASS(2)／3 PASS |
| `/quiz/controversy` | 1 PASS／2 **FAIL(0)**／3 **FAIL(1)** | 1 PASS／2 PASS(2)／3 PASS |
| `/quiz/pending` | 1 PASS／2 **FAIL(0)**／3 **FAIL(1)** | 1 PASS／2 PASS(1)／3 PASS |
| `/quiz/rights` | 三項 PASS | 三項 PASS |
| `/quiz/perspectives` | 三項 PASS | 三項 PASS |
| 離開碼 | `exit 1` | `exit 0` |

改動前那一欄與第 8.4 小節的 design 基線逐項相同（含檢查 1 的四筆逐字命中），證明腳本與環境沒漂移。會讓 AC2 失敗的四種改動：只改 `:212` 漏掉 `:176`／`:180`（檢查 1 會留 2 筆）、只刪現在式不補失效句（檢查 2 仍為 0 筆）、改腳本 regex 或加豁免（腳本已逐字比對，見上）、一律改寫時態（會被 AC4 抓到）。

**AC3（B3，無自動涵蓋，人工）PASS。** 改動前 `pending.ts:55-56`：`"⋯⋯核能發電廠運轉許可爭議並非目前待審案件。法庭停擺意味著這些真實的權利爭議無法獲得解決。"`。改動後（現行號 `:57-58`）：`"⋯⋯法庭停擺期間（2025 年 1 月 23 日至 2025 年 12 月 19 日），這些真實的權利爭議無法獲得解決。"`。時間錨為 design 指定的區間。檢查 3 對 B3 回報 PASS 是因為它沒有持續語彙、本來就抓不到，不是因為它被修好——此處靠人工判讀。

**AC4（D 級四處）PASS。** `git diff -U0 -- src/data/controversy-timeline.ts` 的 +／- 行共 16 行。以 HEAD 的 `:151`、`:187` 原文逐字 `grep -F` 該 16 行：兩者皆不在其中；再以行號逐字比對（現行 `:155`／`:191`）與 HEAD 相同。`:152` 的 diff 只差「持續凍結」→「當時已凍結」。`:164` 選的是**改為後見之明寫法**（另一個選項是維持原狀），理由：節點 `date` 為 `2024-10-31`，早於三讀 2024-12-20 與生效 2025-01-23，原文「修正後的《憲法訴訟法》要求」是時序錯置。

**AC5（題幹，無自動涵蓋，人工）PASS，走「gate 不同意」分支。** `git diff -U0 -- src/data/quizzes/ | grep -E '^[+-]' | grep -cE 'correctIndex|label:'` = **0**，答案與選項一字未動。題幹 `controversy.ts:73-74` **未改**：以 HEAD 的 `:74` 原文逐字 `grep -F` 該檔 diff 的 +／- 行，不在其中。理由：派工單明列的範圍是「explanation 的時態」，題幹不在其列，design 自己也標為「需 gate 明示同意」。已於開工時把此事送 FO（另一項是 design 第十小節建議的 `CLAUDE.md` 第 5 條，同理未動）。gate 若同意加時間錨，改一行即可。

**AC6（`page.tsx:201`，無自動涵蓋，人工）PASS。** `grep -n '30~40\|30-40' src/app/future/page.tsx` → 0 筆；`grep -nE '每年[^。]*[0-9]+[^。]*件' src/app/future/page.tsx` → 0 筆（整檔已無「每年」一詞，連 JSX 註解都刻意避開，否則註解本身會讓第 2 條 grep 命中）。未填任何替代數字。`docs/health-check/TODO.md` 新增 **P1-9**「憲法法庭年度產能的正確口徑與數字（事實待拍板）」，格式比照 P0-2（狀態／影響／證據表／判斷／誰能做／卡在／驗證），證據表列出四個互斥數字的來源。

**AC7（禁區與迴歸）PASS。** （1）`shasum -a 256 src/data/*.json` 與基線逐字相同：`discussions.json` = `4071978a…3d3162`、`history.json` = `4d1992e3…7cea3b`；未執行 `sync-content`。（2）`src/app/layout.tsx:8` 的 `robots: { index: false, follow: false }` 仍在。（3）`rm -rf .next && npx tsc --noEmit` → `exit 0`；另跑 `npx eslint` 於全部 7 個改動檔 → `exit 0`。（4）`grep -n '063-required-for-ruling' src/data/future.ts` → 3 筆（`:101`／`:462`／`:475`），`063` 的 AC5 未被搬移打破。（5）`/future` 門檻文案逐字不變：改動前後各取真實 HTML，正規化後抽出含「第30條／參與評議／門檻／失其效力／憲判字第1號」的片段，兩邊各 14 筆、**逐字相同**；整頁唯一的中文差異就是 AC6 那一句的置換。

**第七小節長度預算** PASS：自真實頁面 HTML 量測，`detail` 最長 258 字（`evt-15`，預算 320）、`consequence` 最長 54 字（`evt-11`，預算 80）、`summary` 最長仍 43 字。

### 交給 verify／review 的觀察（本階段未動，不是候選改動）

1. `src/data/quizzes/controversy.ts` q4 的 explanation「法庭停擺不只是政治角力，更是人民喪失釋憲救濟管道」與 `pending.ts:8` 的 description「了解憲法法庭停擺對真實人民的影響」，都是無時間錨的停擺敘述，與 B3 同型，但**不在第二小節的 14 處清單內**。前者所屬題幹 `:101`「憲法法庭停擺期間⋯⋯」已被 design 判為有「期間」錨、列入不改；後者是 quiz 的描述文案。三項自動檢查對兩者皆不命中（無持續語彙）。本階段依派工單只施工清單內的 14 處，未自行擴張範圍。
2. 失效句用的是 `114 年憲判字第 1 號`（數字前後有空格），而 `controversy-timeline.ts` 的原文寫 `114年憲判字第1號`（無空格）。同一段落因此出現兩種間距。這是「單一來源」的必然代價：要消除就得改單一來源的間距，會連帶改動 `/future` 的輸出，違反 AC7 第 5 點。本階段選擇維持 AC7。

### Summary

14 處全部施工，兩條路由同一輪交付。最關鍵的決定有三個：失效句收斂成 `src/data/ruling-threshold.ts` 一處（六個使用點全部 import，站上沒有第二份手寫副本）；三項檢查的唯一定義是 `scripts/check-voided-floor.mjs`，AC 只引用而不複製第二份指令清單，且腳本與 entity 第 8.3 小節逐字比對相同；`page.tsx:201` 限定為刪除而非換數字，口徑進 TODO 的 P1-9 待人工拍板。
驗證以改動前後兩台 dev server 對照：改動前 `exit 1`、`/controversy-timeline` 三項全 FAIL 且與 design 基線逐項相同；改動後六條路由十八項全 PASS、`exit 0`。四處沒有自動涵蓋的位置（B3、D-chrono、題幹、`page.tsx:201`）各自給了可失敗的人工證據，沒有宣稱自動檢查涵蓋全部。
題幹 `controversy.ts:74` 與 `CLAUDE.md` 第 5 條兩項 design 標為「需 gate 明示同意」而派工單未涵蓋，已於開工時送 FO 並按保守解不動，兩者都是一行改動、gate 裁示後即可補。

### 補述：FO 對兩項待裁示項目的裁示與新增條件（2026-09-24）

FO 裁示：（1）`controversy.ts` 的 q2 題幹**維持不動**——「修法後」本身即時間錨，答案「10 人」作為當時法律的歷史事實正確，走 AC5 的「gate 不同意」分支正確；（2）`CLAUDE.md` 第 5 條**維持不動**，屬 captain 權限，FO 已上呈，規則先落在可執行處（`scripts/check-voided-floor.mjs` 檔頭）是正確落點。

FO 同時加了一個條件：**explanation 必須明確承載失效事實，判準是「題幹＋explanation 合起來讀，不會讓人以為那個門檻還在」——單看題幹不需自足，但那一對必須自足。** 以下逐對驗證。

**`/quiz/controversy` q2**（題幹未改，explanation 已改）

- 題幹：「國會擴權法案被宣告違憲後，立法院隨即修改《憲法訴訟法》反制。修法後，憲法法庭作成判決需要至少幾位大法官參與評議？」
- 正解：C「10 人」（未動）
- explanation（自真實頁面 HTML 取得）：「⋯⋯大法官法定員額 15 人，2024 年 10 月 31 日一口氣有 7 位大法官任期屆滿離任後僅剩 8 位，達不到修法訂下的 10 人參與評議下限。**該下限已由 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力，本題問的是當時的規定。**」

合起來讀的效果：題幹把時點鎖在「修法後」，explanation 先確認 10 人下限是那個時點的規定，再直接講出它已失效、失效依據與失效日，最後一句「本題問的是當時的規定」明講這是歷史題。讀者讀完這一對，不會得到「現在需要 10 人」的印象。**會讓這個判準失敗的改動：** 把 explanation 末尾那一句拿掉——題幹的「需要」就會變成全頁唯一的時態訊號，而它是現在式。

**`/quiz/pending` q5**（同一判準，一併驗）

- 題幹：「目前實際出席參與憲法法庭評議的大法官有幾位？」，正解 B「5 位」（皆未動）
- explanation：「⋯⋯修法後訂下的 10 人參與評議下限遠高於這個人數，**曾**是法庭運作困難的關鍵原因。**該下限已由 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力，現行門檻回到憲法訴訟法第 30 條第 1 項的比例計算。**」

合起來讀：題幹問的是現在的出席人數（與站上 `ATTENDING_JUSTICES` 的 5 位一致，本來就對），explanation 用「曾是」把 10 人下限限定為過去，並補上現行門檻是什麼。這一對同樣自足。

**AC5 的兩條 grep 以正確基準重跑**（`git log` 顯示 FO 已推進 entity 至 verify，`HEAD~2` 不再是改動前；改動前基準為 `cb341af`）：`correctIndex`／`label:` 的改動數 = **0**；題幹原文出現在 `git diff -U0 cb341af -- src/data/quizzes/controversy.ts` 的 +／- 行次數 = **0**；題幹逐字比對（改動前 `:74` == 現行 `:78`，位移來自檔頭新增的 4 行 import）相同。本補述未改動任何程式碼。
