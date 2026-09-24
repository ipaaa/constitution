---
id: 065
title: opinion-lazybag 與 present 頁誤引判決號：113憲判9 被寫成 114憲判1
status: implement
source: constitution-features/063 第六節 V8（captain 2026-09-23 核准開票）
started: 2026-09-23T17:51:45Z
completed:
verdict:
score: 0.95
worktree: .worktrees/spacedock-ensign-065-opinion-lazybag-wrong-ruling-citation
issue:
pr:
mod-block:
---

站上把「國會職權修法」判決的內容標成 114 年憲判字第 1 號，但那是憲法訴訟法修正案；國會職權修法是 113 年憲判字第 9 號。這是公開頁面上的事實錯誤，且涉及具名大法官。

## Problem

一手來源（已實跑 `curl` 核對）：

- `docdata.aspx?fid=38&id=355485` → **114年憲判字第1號【憲法訴訟法修正案】**，114-12-19
- `docdata.aspx?fid=38&id=352966` → **113年憲判字第9號【立法院職權行使法等案】**，113-10-25

**錯的位置（四個 `src/` 檔）：**

| 位置 | 寫的 |
|---|---|
| `src/app/opinion-lazybag/page.tsx:6` | 頁面標題「國會職權修法判決解析」 |
| 同上 `:7`、`:30` | 「114年憲判字第1號」 |
| `src/components/opinion-lazybag/DecisionFlowchart.tsx:6` | 「5 contested provisions from 114年憲判字第1號」 |
| `src/components/home/LazybagCtaSection.tsx:23` | 首頁 CTA 引「114年憲判字第1號」 |
| `src/app/present/page.tsx:18` | 「114年憲判字第1號」＋「關於國會職權修法之重大判決」＋年份 `2024`——**錯三層** |

**而該頁自己的資料是對的**：`src/data/opinions.ts` 的 **12 筆 `rulingRef` 全部**寫 `113年憲判字第9號`（第 13 筆是型別宣告 `rulingRef: string;`）。散文與資料互相矛盾。

**這件事的嚴重性**：`StanceSpectrum.tsx` 硬編 14 位具名大法官的立場，渲染於 `/opinion-lazybag`（`page.tsx:3`、`:66`）。把真實大法官的意見掛在錯誤的判決號下，是公開頁面上關於真實個人的事實錯誤。

## Proposed approach

**逐處判斷，不得全站字串替換。** 站上另有多處**正確**使用 114憲判1：

- `src/app/controversy-timeline/page.tsx:70` —— 張娟芬文章的標題〈憲法法庭，歡迎回來——兼評114年憲判字第1號判決〉，該文確實在談憲法訴訟法修正案
- `src/data/controversy-timeline.ts:224`、`src/data/discussions.json` 的三篇評論、`src/data/history.json:638`

一次替換會把這些改壞。

`src/data/*.json` 為 `sync-content` 產物，依規範不得手改；若需更正須走 SSOT。

### Feedback Cycles

- Cycle 1: AC-defect repair — implement cycle 1 的唯一 FAILED 為 AC-5 本身不可滿足，非施工缺漏；captain 2026-09-24 給出一次性授權「授權修正 `Verified by:` 涵蓋既有寫法變體，不改 AC 要求本身」後修正。surface 1 檔（本票）；本輪 `src/` **零變動**（`git rev-parse HEAD:src` 與 cycle 1 提交後同為 `6a7bad6`）。**基準值更正**：FO 先前依緊接寫法的實測把基準記為 9，**那是錯的**——以容許空白的 regex 實測為 **11**，與 AC-5 原本列出的 11 筆（B4、B6×2、B8、B9×5、B10、B11）逐筆相同。design 寫的 11 是對的，錯的是那條 grep。可失敗性雙向實跑：在 `src/` 暫存副本把 B11（`quizzes/controversy.ts:115`）改成別的號次 → 新寫法 11→10 **轉紅**，舊寫法 9→9 **仍然通過**，證實原寫法對此情境全盲；還原後新寫法回到 11。**另四項 AC 有同型問題，依同一授權一併修正涵蓋面**：AC-1／AC-2／AC-3 的「不含 114憲判1」是**不存在斷言**，固定字串 grep 對加空格寫法全盲——有人寫成 `114 年憲判字第 1 號` 仍會回 0 而**誤判通過**，故三項改用容許空白 regex；AC-4 原用 `head -1` 取第一個命中 chunk、其餘不受檢且無不存在斷言，補上「命中 chunk 數 ＝ 1」與定點殘留檢查。施工時另發現：`.next/static/chunks/` 有 **3 個 chunk 合法含有 114憲判1**（B4／B6／B9／B10／B11 的內容被打包進 timeline、quiz、discussions），故 AC-4 的不存在斷言**不可用全域寫法**（會恆紅），已限定在 `year:"2024",label:"114` 這個定點前綴，實測 0。AC-6／AC-7 未改——其斷言字串無數字、無空白變體，不存在同型問題。**未越界**：`git diff` 的刪除行共 6 行全部是 `Verified by:` 行或 AC-5 的「會失敗的改動」行，**沒有一行 AC 要求被刪改**。七項 AC 以改寫後的指令逐字重跑全部通過；`npx next build` exit 0。

## Out of scope

不修 `049` 的零出處問題（該票另有範圍，但其第 39 行把誤引當前提繼承，須一併更正）。不修 `docs/design-assets/003-comic-lazybag-114.md:28` 的同型誤引——屬 design-assets workflow，但**該票正在 review gate 上，其判決重點摘要整段建立在此誤引上**，須另行提醒。

---

## Design（2026-09-23）

### 一、一手來源核對結果

兩則判決的資料皆取自判決書本文，非站上文字，非 `opinions.ts`。

| 項目 | 113年憲判字第9號 | 114年憲判字第1號 |
|---|---|---|
| 判決字號 | 113年憲判字第9號【立法院職權行使法等案】 | 114年憲判字第1號【憲法訴訟法修正案】 |
| 判決日期 | 113年10月25日（2024-10-25） | 114年12月19日（**2025**-12-19） |
| 原分案號 | 113年度憲立字第1號 | 114年度憲立字第1號 |
| 聲請人 | 立法委員柯建銘等51人 | 立法委員柯建銘等51人 |
| 審查標的 | 立法院職權行使法增修條文、刑法第141條之1 | 憲法訴訟法第4條第3項、第30條第2項至第6項、第95條 |
| 合議庭 | **15 人**：許宗力（審判長）、蔡烱燉、許志雄、張瓊文、黃瑞明、詹森林、黃昭元、謝銘洋、呂太郎、楊惠欽、蔡宗珍、蔡彩貞、朱富美、陳忠五、尤伯祥 | **5 人**：謝銘洋（審判長）、呂太郎、蔡彩貞、陳忠五、尤伯祥 |
| 主筆 | 蔡宗珍 | 呂太郎 |
| 意見書 | 9 份（見第三節） | 2 份：尤伯祥協同（謝銘洋、陳忠五加入）；蔡彩貞部分協同部分不同 |

取得方式（`curl` 可重跑，Python `urllib` 因司法院 TLS 憑證缺 Subject Key Identifier 連不上）：

    curl -s 'https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=352966'   # 113憲判9
    curl -s 'https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=355485'   # 114憲判1

合議庭名單出自判決書末「憲法法庭 審判長 大法官 ⋯」段，非推算。
`controversy-timeline.ts:224` 寫「3位大法官（蔡宗珍、楊惠欽、朱富美）拒絕參與」與一手來源相符：
2024-10-31 後在任 8 人，扣除上表 114憲判1 的 5 人，餘數正是這 3 人。

### 二、全站逐處判定清單（`grep -rn '憲判' src/` 全域掃過，23 處，無遺漏）

**這份清單就是 implement 的施工依據。不得做全站字串替換。**

要改的 5 處：

| # | 位置 | 現寫 | 改成 | 判定依據 |
|---|---|---|---|---|
| A1 | `src/app/opinion-lazybag/page.tsx:7` | `審理114年憲判字第1號` | `審理113年憲判字第9號` | 同頁渲染的是立職法五條文與該案大法官 |
| A2 | `src/app/opinion-lazybag/page.tsx:30` | `114年憲判字第1號——法庭如何逐條論理` | `113年憲判字第9號——法庭如何逐條論理` | 同上 |
| A3 | `src/components/opinion-lazybag/DecisionFlowchart.tsx:6` | 註解 `5 contested provisions from 114年憲判字第1號` | `⋯ from 113年憲判字第9號` | 五條文全部出自立職法與刑法第141條之1 |
| A4 | `src/components/home/LazybagCtaSection.tsx:23` | `114年憲判字第1號——看法庭如何逐條論理` | `113年憲判字第9號——看法庭如何逐條論理` | 連去 `/opinion-lazybag` |
| A5 | `src/app/present/page.tsx:18` | `{ year: '2024', label: '114年憲判字第1號', detail: '關於國會職權修法之重大判決⋯' }` | `{ year: '2024.10', label: '113年憲判字第9號', detail: 不動 }`，**並把該筆移到 `2024.08` 那筆之後** | `detail` 寫的是國會職權修法，`year` 寫 2024，兩者皆指向 113憲判9；只有 `label` 錯。改 `year` 為 `2024.10` 後必須重排，否則時間表不再遞增 |

A5 採「保留敘述、改正號次」而非「保留號次、改寫敘述」。理由：同陣列最後一筆「未來——憲政體制的韌性考驗⋯程序法修法等爭議」是 114憲判1（2025-12-19）作成**之前**的寫法，可證原作者當時指的是 113憲判9。

**對 `Problem` 一節的補述（原文保留，不改寫）：**
原文把 `src/app/opinion-lazybag/page.tsx:6` 的標題「國會職權修法判決解析」列為錯誤。**這一處是對的，不得改。**
「國會職權修法」就是 113憲判9 的俗稱。改掉它會製造新的錯誤。因此原文「已知錯的五處」實為 4 處，加上 `present:18` 共 5 處施工點（上表 A1–A5）。

確認為正確、**不得動**的 11 處：

| # | 位置 | 判定依據 |
|---|---|---|
| B1 | `src/app/opinion-lazybag/page.tsx:6`（title）、`:19`（h1）「國會職權修法」 | 即 113憲判9，無號次，正確 |
| B2 | `src/components/opinion-lazybag/DecisionFlowchart.tsx:188`「國會職權修法案中的五大爭議條文」 | 同上 |
| B3 | `src/app/preview/page.tsx:48`「國會職權修法部分違憲」＋同區塊日期 `2024-10-25` | 無號次，日期與內容皆為 113憲判9 |
| B4 | `src/app/controversy-timeline/page.tsx:70` 張娟芬〈憲法法庭，歡迎回來——兼評114年憲判字第1號判決〉 | 文章標題原文，該文評的是憲訴法案 |
| B5 | `src/data/controversy-timeline.ts:125`、`:127` | 113憲判9 ＝ 立職法，日期 2024-10-25，正確 |
| B6 | `src/data/controversy-timeline.ts:222`、`:224` | 114憲判1 ＝ 憲訴法、2025-12-19、5 人參與、3 人拒絕，逐項與一手來源相符 |
| B7 | `src/data/history.json:606`（113憲判9／2024） | 正確；且為 `sync-content` 產物，不得手改 |
| B8 | `src/data/history.json:638`（114憲判1／2025／憲訴法十人門檻） | 同上 |
| B9 | `src/data/discussions.json:5,8,46,53,58`（張娟芬、黃丞儀、蘇彥圖三篇） | 三篇皆評憲訴法案；且為 `sync-content` 產物 |
| B10 | `src/data/quizzes/perspectives.ts:89`（蘇彥圖對 114憲判1 的評價） | 正確 |
| B11 | `src/data/quizzes/controversy.ts:69`（113憲判9 宣告國會擴權法案違憲）、`:115`（2025年12月／114憲判1／8 位中 5 位參與，`correctIndex: 1` ＝「5 位」） | 逐項與一手來源相符 |

其餘 7 處（`src/data/quizzes/rights.ts:39` 的 113憲判6 選項、`src/data/history.json` 其餘 8 筆 `ruling_id`）與本案兩則判決無關，不動。

### 三、判定：StanceSpectrum 與 DecisionFlowchart 實際描述哪一個判決

**`DecisionFlowchart.tsx` ＝ 113憲判9，只錯在標籤。**
五條文逐一對得上 113憲判9 主文：總統國情報告（主文二）、聽證調查權（主文五、六）、藐視國會罪（主文七＝刑法第141條之1違憲）、人事同意權（主文四）、調查權界線（主文五）。
唯一要改的是第 6 行註解，那是程式註解、不進 build 產物。

**`StanceSpectrum.tsx` ＝ 內容本身也錯，不是改標籤。**
題目確實是 113憲判9（14 筆 summary 全在講總統國情報告、藐視國會罪、國會調查權、人事同意權），但名單與意見類型對**兩個判決都不成立**：

1. **4 位不在任一合議庭**：黃虹霞、吳陳鐶、蔡明誠、林俊益。兩份判決書末的大法官名單都沒有這 4 人。
2. **漏列 113憲判9 合議庭 5 人**：蔡宗珍（**本案主筆**）、蔡彩貞、朱富美、陳忠五、尤伯祥。
3. **意見類型與一手來源牴觸**。113憲判9 實際意見書 9 份：黃瑞明（協同）；許志雄、張瓊文、蔡彩貞、朱富美、尤伯祥（部分協同部分不同）；詹森林、黃昭元、謝銘洋（部分不同）。而 `StanceSpectrum` 把黃昭元、謝銘洋標「協同意見」，把許志雄、張瓊文、詹森林標「多數意見」，把呂太郎、楊惠欽標「不同意見」——後兩位**未提出任何意見書**。
4. **有一筆與主文相反**：`:26` 林俊益「三讀程序未經逐條實質討論即付表決⋯相關條文應屬無效」。113憲判9 主文一明示「上開法律尚不因立法程序瑕疵而牴觸憲法」。

因此 A1／A2 改完號次後，這 14 位會被掛到 113憲判9 名下，其中 4 位是憑空的、5 位真正參與的仍然缺席——**是比現況更具體的不實敘述**。單改標籤不可接受。

**`src/data/opinions.ts` 的 12 筆 `rulingRef` 並非「對的」（對 Problem 第四段的補述）。**
12 筆 `argumentSummary` 與 4 個 `DIMENSIONS`（`是否支持法庭停止運作`、`急迫性判斷`⋯）講的全是法庭停擺、人數不足、急迫性，那是**114憲判1 的題目**；`rulingRef` 卻寫 113憲判9。號次與內容主題相反。
12 個 `justiceName`（許宗力、吳陳鐶、黃昭元、詹森林、黃虹霞、蔡烱燉、黃瑞明、謝銘洋、蔡明誠、呂太郎、林俊益、楊惠欽）同樣對兩個合議庭皆不符。
**本票不動 `opinions.ts`**：改號次只會把不實資料搬個位置。唯一公開渲染的是 `OPINIONS.length`（首頁 CTA 的「12 則意見分析」）；`justiceName` 目前渲染於 `OpinionTooltip.tsx`／`OpinionScatterPlot.tsx`，而 `grep -rn 'OpinionLazybag' src/` 顯示該組元件**無任何檔案 import**，未上線。處置見第七節。

### 四、施工範圍與元件

無新元件、無新型別、無新資料欄位。動到的檔案與職責：

- `src/app/opinion-lazybag/page.tsx` — server component，持有頁面標題／描述／兩段小標。A1、A2；另加 AC-6 的段落移除。
- `src/components/opinion-lazybag/DecisionFlowchart.tsx` — client component，無 props。A3（註解）。
- `src/components/home/LazybagCtaSection.tsx` — server component，無 props，從 `@/data/opinions` 取 `OPINIONS.length`／`DIMENSIONS.length`。A4；另加 AC-6 的文案刪節。
- `src/app/present/page.tsx` — client component，`CourtTimeline` 的 `milestones` 為函式內區域陣列。A5。

**響應式行為：無變更。** A5 只改 `milestones` 陣列的元素內容與順序，`CourtTimeline` 的版面對桌機與行動裝置都是同一條垂直時間軸（`w-14 shrink-0` 年份欄 ＋ `flex-1` 內容欄），不隨筆數或字串長度切換排版。AC-6 移除的是 `page.tsx` 一個 `<section>`，其上方的分隔線（`:48-54`）需一併移除，否則頁尾會留下孤立分隔線。

### 五、Risk evidence

1. **全站替換會改壞 11 處正確引用**（第二節 B1–B11）。其中 B4 是他人文章標題、B7–B9 是 `sync-content` 產物（依 `AGENTS.md` 不得手改）。
2. **`page.tsx:6` 若照 Problem 原文「修正」會製造新錯誤**（第二節補述）。
3. **A5 只改 `label` 不改 `year` 會讓時間表順序錯亂**：`2024` 排在 `2024.08` 之前，但 113憲判9 是 2024-10-25。
4. **`/opinion-lazybag` 與 `/present` 都不在 `PUBLIC_PAGES`**（`src/data/launch-status.ts:3` 只有 `/`、`/controversy-timeline`、`/future`）。目前對外可見的錯誤引用只有首頁 CTA 一行（`src/app/page.tsx:109` 無條件渲染 `<LazybagCtaSection />`）。這降低當下曝光量，不改變正確性，也不改變發布前必須修完的結論。
5. **A3 改的是程式註解，不進 build 產物**：`.next/static/chunks/` 內找不到該字串。因此 A3 的驗證只能在原始碼層級，AC-3 已照此設計。

### 六、Acceptance criteria

> **2026-09-24 更正（captain 一次性授權）：AC-1、AC-2、AC-3、AC-4、AC-5 的 `Verified by:` 已改寫，涵蓋面對齊語意。**
> 授權原文：「授權修正 `Verified by:` 涵蓋既有寫法變體，不改 AC 要求本身。」
> **五項 AC 的「要求」逐字未動**，動的只有驗證指令。原因：站上的判決號有兩種寫法——
> 緊接的 `114年憲判字第1號`（9 處）與加空格的 `114 年憲判字第 1 號`（2 處，即 B10／B11），
> 另有 `111 年 憲判字第 17 號` 這種連 `年` 後也有空格的第三種寫法。
> 原本的固定字串 grep 只掃得到緊接寫法，因此 AC-5 宣稱要涵蓋 11 行卻只可能回 9 行，
> 而 AC-1／AC-2／AC-3 的「不含 114憲判1」這類**不存在斷言**對加空格寫法是盲的。
> 改法：判決號一律改用容許空白的 regex `114[[:space:]]*年[[:space:]]*憲判字第[[:space:]]*1[[:space:]]*號`（113憲判9 同理）。
> 逐項改了什麼、為什麼，見本檔 `## Stage Report: implement (cycle 2)`。
> 每一處改寫都附了實測值；AC-1／AC-2／AC-3 的期望值不因改寫而變動（緊接與容許空白兩種寫法在現行候選檔上同值），AC-5 由 9 變 11。

驗證一律在**副本**上做：`rsync` 出一份（排除 `node_modules`／`.next`／`.git`／`.worktrees`），`cp -Rc` 複製 `node_modules`（**不可用 symlink**，Turbopack 會以 `Symlink node_modules is invalid, it points out of the filesystem root` 失敗），`npx next build` 後 `npx next start -p <port>`。design stage 已實跑此流程，下列基準值為實測所得。

- **AC-1（真實頁面 HTML）** `/opinion-lazybag` 服務出的 HTML 不含 `114年憲判字第1號`，且含 `113年憲判字第9號` 3 次、`國會職權修法` 3 次。
  `Verified by:`（2026-09-24 改寫：固定字串 → 容許空白 regex，`grep -o` → `grep -oE`）
  `curl -s http://localhost:<port>/opinion-lazybag | grep -oE '114[[:space:]]*年[[:space:]]*憲判字第[[:space:]]*1[[:space:]]*號' | wc -l` ＝ `0`；
  同法數 `113[[:space:]]*年[[:space:]]*憲判字第[[:space:]]*9[[:space:]]*號` ＝ `3`、`國會職權修法` ＝ `3`（後者無數字、無空白變體，維持固定字串）。
  **為什麼要改**：第一項是不存在斷言。若有人把號次寫成 `114 年憲判字第 1 號`，原本的固定字串 grep 仍回 `0`，AC-1 會誤判通過。
  **會失敗的改動**：A1 或 A2 任一未改 → 第一項 ≠ 0；誤改 `page.tsx:6` 或 `:19` 的「國會職權修法」→ 第三項 ≠ 3。
  **改動前實測基準**：`114年憲判字第1號` ＝ 3、`113年憲判字第9號` ＝ 0、`國會職權修法` ＝ 3。

- **AC-2（真實頁面 HTML）** 首頁 `/` 服務出的 HTML 不含 `114年憲判字第1號`，且含 `113年憲判字第9號` 1 次。
  `Verified by:`（2026-09-24 改寫，理由同 AC-1）
  `curl -s http://localhost:<port>/ | grep -oE '114[[:space:]]*年[[:space:]]*憲判字第[[:space:]]*1[[:space:]]*號' | wc -l` ＝ `0`；同法數 `113[[:space:]]*年[[:space:]]*憲判字第[[:space:]]*9[[:space:]]*號` ＝ `1`。
  **會失敗的改動**：A4 未改 → 第一項 ＝ 1。
  **改動前實測基準**：`114年憲判字第1號` ＝ 1、`113年憲判字第9號` ＝ 0。

- **AC-3（原始碼，理由見第五節第 5 點）** `DecisionFlowchart.tsx` 的資料區註解指向 113憲判9。
  `Verified by:`（2026-09-24 改寫，理由同 AC-1；第二項同為不存在斷言）
  `grep -cE '5 contested provisions from 113[[:space:]]*年[[:space:]]*憲判字第[[:space:]]*9[[:space:]]*號' src/components/opinion-lazybag/DecisionFlowchart.tsx` ＝ `1`
  且 `grep -cE '114[[:space:]]*年[[:space:]]*憲判字第[[:space:]]*1[[:space:]]*號' src/components/opinion-lazybag/DecisionFlowchart.tsx` ＝ `0`。
  **會失敗的改動**：A3 未改，或把 `:188` 的「國會職權修法案」一併誤改（第二項仍為 0，但第一項不受影響——故本 AC 須與 AC-5 併用）。

- **AC-4（build 產物）** `/present` 的時間表筆順與內容正確。`/present` 是全 client 頁，服務出的 HTML 不含時間表文字，故驗證對象為 build 出的 client chunk。
  `Verified by:`（2026-09-24 改寫：補上檔數斷言與定點的不存在斷言）
  1. `grep -rl '憲法法庭正式揭牌' .next/static/chunks/ | wc -l` ＝ `1`——**先確認只有一個 chunk 命中**，原寫法用 `head -1` 取第一個檔，若命中多個則其餘不受檢。
  2. 該檔內容含最小化後的相鄰字串 `status:"blocked"},{year:"2024.10",label:"113年憲判字第9號",detail:"關於國會職權修法之重大判決`。
  3. `grep -rl 'year:"2024",label:"114' .next/static/chunks/ | wc -l` ＝ `0`——舊筆已無殘留。
  **這裡不可以用全域的「不含 114憲判1」當斷言**：`.next/static/chunks/` 有 3 個 chunk 合法含有 114憲判1（B4／B6／B9／B10／B11 的內容被打包進 timeline、quiz、discussions 的 chunk），全域斷言會恆為紅。故第 3 項限定在 `year:"2024",label:"114` 這個定點前綴。
  **會失敗的改動**：只改 `label` 不改 `year` → `year:"2024.10"` 不成立；未重排 → 前綴 `status:"blocked"},` 不成立（原位置前一筆是 `status:"present"},`）；誤改 `detail` → 後綴不成立。
  **改動前實測基準**：同一位置為 `status:"present"},{year:"2024",label:"114年憲判字第1號",detail:"關於國會職權修法之重大判決`。

- **AC-5（全站回歸）** 全站仍存在的 `114年憲判字第1號` 恰好落在第二節 B4、B6、B8、B9、B10、B11 所列位置，一處不多一處不少。
  `Verified by:`（2026-09-24 改寫：**本次授權的核心**。固定字串 → 容許空白 regex，基準行數 9 → 11）
  `grep -rnE '114[[:space:]]*年[[:space:]]*憲判字第[[:space:]]*1[[:space:]]*號' src/` 的輸出行號集合等於 `{controversy-timeline/page.tsx:70, data/controversy-timeline.ts:222, data/controversy-timeline.ts:224, data/history.json:638, data/discussions.json:5, data/discussions.json:8, data/discussions.json:46, data/discussions.json:53, data/discussions.json:58, data/quizzes/perspectives.ts:89, data/quizzes/controversy.ts:115}`（**11 行**；行號可因編輯位移，內容須逐行比對）。
  **為什麼要改**：B10（`quizzes/perspectives.ts:89`）與 B11（`quizzes/controversy.ts:115`）寫的是加空格的 `114 年憲判字第 1 號`。
  原本的固定字串 `grep -rn '114年憲判字第1號' src/` **在任何情況下都掃不到這兩行**，所以它宣稱的 11 行永遠回 9 行——
  AC-5 要求的集合含 B10／B11，驗證指令卻涵蓋不到它們。改用容許空白 regex 後實測回 11 行，集合與要求一致。
  **AC-5 要求什麼未變**：仍是「全站仍存在的正確引用恰好落在 B 清單所列位置，一處不多一處不少」。
  **會失敗的改動**：做了全站替換 → 集合變空或缺行；漏改 A1／A2／A4／A5 → 集合多出行；**改壞 B10 或 B11 任一處 → 集合少一行**（第三種情境是 2026-09-24 新增涵蓋的，原寫法對它是盲的，已實跑證明，見 cycle 2 報告）。

- **AC-6（需 captain 於 gate 核可，語意變更）** `/opinion-lazybag` 不再渲染 `StanceSpectrum`，首頁 CTA 文案不再承諾「大法官意見的光譜分佈」。
  `Verified by:` `curl -s http://localhost:<port>/opinion-lazybag | grep -o '大法官怎麼想的\|意見光譜' | wc -l` ＝ `0`；`curl -s http://localhost:<port>/ | grep -c '光譜'` ＝ `0`；且 `npx next build` 退出碼 `0`（證明 `page.tsx:3` 的 import 與 `:48-54` 的分隔線一併清掉、無未使用變數的 lint 失敗）。
  **會失敗的改動**：只刪 `<StanceSpectrum />` 不刪小標 → 第一項 ≠ 0；只刪段落不刪 import → build 或 lint 失敗。
  **改動前實測基準**：`/opinion-lazybag` HTML 含 `意見光譜` 2 次、`大法官怎麼想的` 1 次；首頁 HTML 含 `光譜` 1 次。
  **`src/components/opinion-lazybag/StanceSpectrum.tsx` 檔案保留，不刪**，留給 `049` 依 113憲判9 的「判決主文立場表」重建。

- **AC-7（回歸）** `npx next build` 退出碼 `0`。
  `Verified by:` 在副本上跑 `npx next build; echo $?` ＝ `0`。
  **環境註記**：`tsconfig.json` 的 `include` 含 `.next/types/**/*.ts` 而 `exclude` 只有 `node_modules`，本專案在同步資料夾下，`.next/` 內可能出現檔名帶「 2」的重複檔，會讓 `npx tsc --noEmit` 假性失敗。本票以 `next build` 取代 `tsc --noEmit`，遇到假性失敗先 `rm -rf .next` 重跑，不要改原始碼。

### 七、AC-6 的選項（captain 決定）

**建議：採 AC-6，移除該段。** 這是唯一能在發布前停止對真實公職人員作不實陳述的動作，且不與 `058`（刪未接線的舊元件，不同檔案）或 `049`（重建資料）相撞。`049` 之後以真實資料重新接回。

替代方案（不建議）：保留該段並加註「本節資料尚未查證」。不建議的理由是站台正走向發布，加註不會讓錯誤歸屬變成可接受。

不可逆性：AC-6 只刪 `page.tsx` 的段落與 CTA 一句文案，元件檔保留，退回只需還原這兩處。

### 八、文件影響

**現在更新**（本票 design 階段已完成或 implement 須完成）：

- `docs/constitution-features/065-opinion-lazybag-wrong-ruling-citation.md` — 本節即是。已定方向：A1–A5 ＋ AC-6。**尚未實作**，狀態為 design 完成、implement 未開始。驗證目標為第六節 AC-1～AC-7。
- `docs/constitution-features/049-opinion-lazybag-content-provenance.md` — implement 階段於文末**追加**一節補述（依 `AGENTS.md`「不要悄悄改寫原文」，不動 `:39`、不動第三節原文），內容為：（a）`StanceSpectrum.tsx` 的 14 位是 113憲判9 的題目不是 114憲判1；（b）其中黃虹霞、吳陳鐶、蔡明誠、林俊益 4 位不在任一合議庭，且漏列蔡宗珍等 5 位，故 `049` 第三節「同一判決，兩處人數差 9 位」的前提已失效，真正的問題比原文更嚴重；（c）`opinions.ts` 的 12 筆 `rulingRef` 同樣不可信，號次與內容主題相反；（d）重建資料的一手來源是判決書頁面的「憲法法庭113年憲判字第9號判決主文立場表」PDF。**已定方向，尚未實作。** 驗證目標：`049` 檔末存在標日期的補述節，且 `:39` 與第三節原文逐字未變。
  `049` 目前 `status: design`、`started:` 為空，未派工，衝突風險低。若 implement 開工時 `049` 已在跑，改為只在本票記錄、由 FO 轉達，不動 `049` 檔案。
- `docs/INDEX.md` — 不需新增或刪除文件，不更新。

**實作後更新**：

- `docs/health-check/TODO.md` — AC-6 若獲核可，`/opinion-lazybag` 的意見光譜自發布範圍移除，須在該檔記一筆待辦（由 `049` 補回），以免發布檢查表漏掉。

**不更新**：

- `docs/design-assets/003-comic-lazybag-114.md` — **本票不動，屬 design-assets workflow（該 workflow 仍為 0.9.5，未 refit）。但影響須通知。** 該票 `status: review`，正停在 review gate 上。其 `:24` 起的「判決重點摘要（供漫畫改編）」整段建立在誤引上：標題與內文都寫 114憲判1，實際描述的是 113憲判9；且票名本身就是「漫畫式懶人包 — 114年憲判字第1號」。**另有一處獨立的法律錯誤**：該節第 4 點「人事同意權 → 部分違憲。修法過程有重大議事程序瑕疵（未經實質討論即表決）」與 113憲判9 主文一相反（主文一明示法律「尚不因立法程序瑕疵而牴觸憲法」），人事同意權相關條文是依主文四以「逾越立法院憲法職權範圍」宣告失效。**該票在號次與這一點更正前不應通過 review gate。**
- `docs/content-pipeline/design.md`、`docs/project/*` — 無資料流或架構變更，不更新。

### 九、相鄰事務與新發現（本票不修，須另行處置）

1. **`DecisionFlowchart.tsx` 的實質法律錯誤，須另開票。** `:69` `rulingDetail`「基於議事程序重大瑕疵（未經實質逐條討論即付表決），相關條文因程序違憲而無效」與 `:66` `reasoning[2]` 同旨，兩處皆與 113憲判9 主文一直接矛盾。另 `:29` 把「總統國情報告」整條標 `違憲`，但主文二（一）對立職法第15條之1第1項採合憲性解釋（「尚不生牴觸憲法問題」），嚴格說是部分違憲。**本票只改號次，不改判斷**——改判斷屬法律正確性範疇，且需法學背景者複核。`063` 的範圍是 `/future` 的 `requiredForRuling`，涵蓋不到此處。
2. **`src/app/opinion-lazybag/page.tsx:63`「雖然結論一致，但各大法官的思路不同」不實。** 113憲判9 有 5 份部分不同意見書。此句若 AC-6 獲核可會隨該段一併移除；若未獲核可，須併入第 1 點的新票。
3. **`src/app/page.tsx:109` 無條件渲染 `<LazybagCtaSection />`，但 `/opinion-lazybag` 不在 `PUBLIC_PAGES`。** 公開模式下首頁會出現一個點不進去的 CTA。屬 `058`（CTA 對齊）範疇，本票不修。
4. **`src/data/opinions.ts:11` 檔頭「No justice names, party affiliations, or personal identifiers are stored」與 `:53` 的 `justiceName?` 及 12 筆實際值相反。** 即 `049` 標題所指，不重複開票。
5. **`src/app/present/page.tsx` 最後一筆 milestone「未來——憲政體制的韌性考驗⋯程序法修法等爭議」以現在式描述已由 114憲判1 解決的爭議。** 屬 `066`（時態）範疇，本票不修。

## Stage Report: design

- DONE: 逐處判定站上每一個引用 114 年憲判字第 1 號或 113 年憲判字第 9 號的位置是對是錯，附判定依據與一手來源；不得提出全站字串替換的方案
  第二節列出 `grep -rn '憲判' src/` 全域掃出的 23 處：5 處要改（A1–A5）、11 處確認正確不得動（B1–B11）、7 處無關。方案是逐處施工，AC-5 明確禁止全站替換並以行號集合驗證。
- DONE: 你必須自行掃過 `src/` 全域確認沒有遺漏
  scope notes 說「已知對的四處」，實掃為 11 處：另有 `controversy-timeline.ts:125/127`、`quizzes/perspectives.ts:89`、`quizzes/controversy.ts:69/115`、`history.json:606`、`preview/page.tsx:48`。
- DONE: 判定 StanceSpectrum.tsx 硬編的 14 位具名大法官立場、以及 DecisionFlowchart.tsx 硬編的 5 條爭議條文，實際描述的是哪一個判決；必須回一手來源查證
  第一、三節。`curl` 取兩則判決書：113憲判9 合議庭 15 人、主筆蔡宗珍、意見書 9 份；114憲判1 合議庭 5 人、主筆呂太郎、意見書 2 份。`DecisionFlowchart` ＝ 113憲判9，只錯標籤。`StanceSpectrum` 題目是 113憲判9，但 4 位（黃虹霞、吳陳鐶、蔡明誠、林俊益）不在任一合議庭、漏列 5 位、意見類型與一手來源牴觸 → 內容本身也錯。
- DONE: 每項 acceptance criteria 附可失敗的 Verified by
  第六節 AC-1～AC-7，每項附「會失敗的改動」與改動前實測基準。
- DONE: 至少一項在真實頁面 HTML 上驗證（副本作法取得，不得暫改候選檔）
  AC-1／AC-2。實跑：`rsync` 出副本 → `cp -Rc node_modules`（symlink 會讓 Turbopack 以 `Symlink node_modules is invalid` 失敗，已實測）→ 套 A1–A5 → `npx next build` 退出碼 0 → `npx next start -p 3200` → `/opinion-lazybag` 的 `114年憲判字第1號` 由 3 降為 0、`113年憲判字第9號` 由 0 升為 3、`國會職權修法` 維持 3；`/` 由 1 降為 0、`113年憲判字第9號` 升為 1。副本已刪除，候選檔全程未改（`git status` 乾淨）。
- DONE: 寫明 049 第 39 行把誤引當前提繼承的處置（本票改還是通知 049）
  第八節「現在更新」：本票改，但只在 `049` 檔末追加標日期的補述節，不動 `:39` 與第三節原文（`AGENTS.md`「不要悄悄改寫原文」）。並附退路：implement 開工時若 `049` 已派工，改為只記錄、由 FO 轉達。
- DONE: 寫明 docs/design-assets/003-comic-lazybag-114.md:28 的同型誤引處置（屬別 workflow，本票不動，但文件影響須記明需通知）
  第八節「不更新」：本票不動，列明該票 `status: review` 正停在 gate 上，其判決重點摘要整段建立在誤引上，且第 4 點「人事同意權因程序瑕疵違憲」與 113憲判9 主文一相反，在更正前不應通過 review gate。
- DONE: 文件影響分成「現在更新」「實作後更新」「不更新」，每一節都列出文件或寫「無」
  第八節，三節皆有具名文件。每筆「現在更新」都標了已定方向、尚未實作、驗證目標。
- DONE: Component hierarchy with props and responsibilities／Data requirements／Mobile-desktop responsive behavior
  第四節：無新元件、無新型別、無新資料欄位；列出 4 個動到的檔案的職責與 props；響應式行為無變更，並指出 AC-6 須一併移除 `page.tsx:48-54` 的孤立分隔線。

### Summary

一手來源核對推翻了票內兩項前提：`page.tsx:6` 的「國會職權修法判決解析」是對的（改了就是新錯誤），而 `opinions.ts` 的 12 筆 `rulingRef` 並非對的（內容講的是 114憲判1 的題目，號次卻寫 113憲判9）。最重要的判定是 `StanceSpectrum.tsx` 不是標籤錯而是內容錯：14 位中有 4 位不在任一合議庭、漏列包含主筆蔡宗珍在內的 5 位、意見類型與判決書牴觸，因此單改號次會產生比現況更具體的不實敘述。設計據此把施工切成兩層：A1–A5 的號次更正（無爭議），與 AC-6 的 `StanceSpectrum` 段落移除（語意變更，需 captain 於 gate 核可，元件檔保留給 `049` 重建）。另查出兩項 `DecisionFlowchart` 的實質法律錯誤（人事同意權標為程序違憲、總統國情報告標為全部違憲），本票不修，須另開票並經法學背景者複核。

## Stage Report: implement

- DONE: A1–A5 五處號次更正落地，且以真實頁面 HTML 驗 AC-1／AC-2
  副本（`rsync` 排除 `node_modules`／`.next`／`.git`／`.worktrees` ＋ `cp -Rc node_modules`）`npx next build` 後 `npx next start -p 3265`。AC-1 實測：`/opinion-lazybag` 的 `114年憲判字第1號` ＝ **0**（基準 3）、`113年憲判字第9號` ＝ **3**（基準 0）、`國會職權修法` ＝ **3**（維持）。AC-2 實測：`/` 的 `114年憲判字第1號` ＝ **0**（基準 1）、`113年憲判字第9號` ＝ **1**。commit `b294597`。
- DONE: A3 依 AC-3 在原始碼層級驗
  `grep -c '5 contested provisions from 113年憲判字第9號' src/components/opinion-lazybag/DecisionFlowchart.tsx` ＝ `1`；同檔 `grep -c '114年憲判字第1號'` ＝ `0`。`:188` 的「國會職權修法案」未動——若誤改，AC-1 的第三項會由 3 掉到 2。
- DONE: A5 必須同時改 `year` 與 `label`，否則時間表順序錯亂
  AC-4 實測：`.next/static/chunks/efd3eef351a4d8c3.js` 含 `status:"blocked"},{year:"2024.10",label:"113年憲判字第9號",detail:"關於國會職權修法之重大判決`。前綴 `status:"blocked"},` 證明已重排到 `2024.08` 之後（原位置前一筆為 `status:"present"},`）；`year:"2024.10"` 證明 `year` 一併改；`detail` 後綴證明敘述未動。只改 `label` 或未重排都會讓這一行對不上。
- DONE: AC-6（captain 已於 2026-09-23 核可）三項驗證
  `curl /opinion-lazybag | grep -o '大法官怎麼想的\|意見光譜' | wc -l` ＝ **0**（基準 3：`意見光譜` 2 ＋ `大法官怎麼想的` 1）；`curl / | grep -c '光譜'` ＝ **0**（基準 1）；`npx next build` 退出碼 **0**。`page.tsx:3` 的 import 與 `:48-54` 分隔線已一併清掉——未清會讓 build 以未使用變數失敗、或頁尾留孤立分隔線。`意見光譜` 的來源是 `page.tsx:7` 的 metadata description（在 HTML 中出現 2 次），已改寫為「以決策流程圖呈現憲法法庭如何審理113年憲判字第9號——理解合議制的論理過程。」，該句同時貢獻 AC-1 的 3 次中的 2 次。
- DONE: `src/components/opinion-lazybag/StanceSpectrum.tsx` 檔案保留不刪
  `grep -rn 'StanceSpectrum' src/` 只剩 `StanceSpectrum.tsx:47` 元件自身的 export，無任何 import。
- DONE: AC-7 副本上 `npx next build` 退出碼 0
  退出碼 0，16 頁全部產生。未遇到 `.next/` 帶「 2」重複檔的假性失敗（副本是新建的，`.next` 由該次 build 產生）。`diff -r` 確認副本 `src/` 與候選檔逐位元相同，故此 build 驗的就是本次提交的原始碼。
- DONE: 依第八節在 `049` 檔末追加標日期的補述節（不動 `:39` 與第三節原文）
  `git diff --numstat` ＝ `39 0`（39 行新增、**0 行刪除**），`:39` 逐字未變。補述含設計指定的四點（a）～（d）。開工時 `049` 仍為 `status: design`、`started:` 為空，main 與 worktree 的檔案 md5 相同，第八節的退路條件未觸發。
- DONE: 文件影響——`docs/health-check/TODO.md` 記一筆待辦
  新增 `P1-9`（`:525`），記錄意見光譜已移除、由 `049` 補回、一手來源 PDF 位置。`git diff --numstat` ＝ `11 0`，無刪除。`docs/INDEX.md` 未動（無新增或刪除文件，依第八節）。
- DONE: 不執行 `npm run sync-content`；不動 `src/data/opinions.ts` 與 `src/data/*.json`
  本次 commit 只含 4 個 `src/` 檔與 2 個 `docs/` 檔（`git show --stat b294597`）。
- FAILED: AC-5 全站回歸：`grep -rn '114年憲判字第1號' src/` 的結果必須恰好落在第二節所列的 **11 行**
  **AC-5 的實質要求成立，但它寫的 11 行數字有誤，實測為 9 行。** 實測輸出恰為 B4（`controversy-timeline/page.tsx:70`）、B6（`controversy-timeline.ts:222`、`:224`）、B8（`history.json:638`）、B9（`discussions.json:5,8,46,53,58`）＝ 9 行，無多無少。缺的 2 行是 B10（`quizzes/perspectives.ts:89`）與 B11（`quizzes/controversy.ts:115`）——**這兩處用的是加空格的寫法 `114 年憲判字第 1 號`，AC-5 指定的緊接寫法 grep 本來就掃不到**，改動前即如此（基準亦為 9 行，非 11 行）。以 `grep -rn '114 年憲判字第 1 號' src/` 另驗，B10／B11 兩行原封不動。因此「沒有做全站替換、也沒有漏改」這件事已證成，失敗的只是 design 第六節寫錯的行數。

### Summary

A1–A5 五處號次更正與 AC-6 的意見光譜段移除全部落地，AC-1、AC-2、AC-4、AC-6、AC-7 皆在副本的真實 build／HTTP 回應上實測通過，數值與設計的預期基準完全相符。AC-3 依設計在原始碼層級驗過。唯一的 FAILED 是 AC-5 的行數寫錯：B10、B11 用的是 `114 年憲判字第 1 號`（帶空格），緊接寫法的 grep 掃不到它們，故正確基準是 9 行而非 11 行——這是 design 第六節的筆誤，不是施工缺漏，B10／B11 經另一條 grep 確認未被動到。另外，`page.tsx:7` 的 metadata description 同時承載 AC-1 的號次與 AC-6 要清掉的「意見光譜」，改寫時須兩者兼顧，這一點設計未明講，已在上方記錄實際採用的句子。

## Stage Report: implement (cycle 2)

- DONE: 依 captain 2026-09-24 授權修正 AC-5 的 `Verified by:`，同時涵蓋兩種寫法，基準行數改為正確值
  固定字串 `grep -rn '114年憲判字第1號' src/` → 容許空白 regex `grep -rnE '114[[:space:]]*年[[:space:]]*憲判字第[[:space:]]*1[[:space:]]*號' src/`，基準 11 → **實測 11**。輸出的 file:line 集合與 AC-5 原本就列出的 11 筆逐筆相同（B4、B6×2、B8、B9×5、B10、B11）。**AC-5 的要求逐字未動**。
- DONE: 可失敗性實跑——故意改壞 B10／B11 其一，AC-5 應轉紅；還原後回復通過
  在 `src/` 的暫存副本上把 B11（`quizzes/controversy.ts:115`）的 `114 年憲判字第 1 號` 改成 `113 年憲判字第 9 號`：**新寫法 11 → 10 行，轉紅**；**舊寫法 9 → 9 行，仍然通過，證實原寫法對此情境全盲**。還原副本後新寫法回到 11 行。候選檔全程未參與此測試：`git rev-parse HEAD:src` 在測試前後皆為 `6a7bad6`。
- DONE: 檢查其他 AC 有無同型問題，逐項列出改了哪些、為什麼
  四項有、全部已改。**AC-1／AC-2／AC-3**：其「不含 114憲判1」是**不存在斷言**，固定字串 grep 對加空格寫法全盲——有人寫成 `114 年憲判字第 1 號` 仍會回 `0` 而誤判通過，故三項一律改用容許空白 regex（`grep -o`／`-c` → `-oE`／`-cE`）。**AC-4**：原寫法用 `head -1` 取第一個命中 chunk，命中多個時其餘不受檢，且只有存在斷言、無不存在斷言；補上「命中 chunk 數 ＝ 1」與定點殘留檢查 `grep -rl 'year:"2024",label:"114' … ＝ 0`。**AC-6／AC-7 未改**——其斷言字串（`大法官怎麼想的`、`意見光譜`、`光譜`、退出碼）無數字、無空白變體，不存在同型問題。
- DONE: AC-4 的不存在斷言不可用全域寫法（施工時發現，已寫入 AC-4）
  `.next/static/chunks/` 有 **3 個 chunk 合法含有 114憲判1**（B4／B6／B9／B10／B11 的內容被打包進 timeline、quiz、discussions 的 chunk）。若把 AC-4 第 3 項寫成全域「不含 114憲判1」會恆為紅。故限定在 `year:"2024",label:"114` 這個定點前綴，實測 ＝ `0`。
- DONE: 七項 AC 以改寫後的指令逐字重跑，全部通過
  副本重建（`rsync` ＋ `cp -Rc node_modules`，`diff -r` 確認 `src/` 與候選檔逐位元相同）後 `npx next build` 退出碼 **0**（AC-7），`npx next start -p 3267`。AC-1：`114` ＝ **0**、`113` ＝ **3**、`國會職權修法` ＝ **3**。AC-2：`114` ＝ **0**、`113` ＝ **1**。AC-3：註解 ＝ **1**、`114` ＝ **0**。AC-4：命中 chunk ＝ **1**、相鄰字串 ＝ **1**、舊筆殘留 ＝ **0**。AC-5 ＝ **11 行**。AC-6：lazybag ＝ **0**、home ＝ **0**。
- DONE: 本輪 `src/` 零變動、A1–A5 與 AC-6 的成果未被影響
  `git rev-parse HEAD:src` ＝ `6a7bad6af38a7f28b7557a622169353549a9d231`，與 cycle 1 提交 `b294597` 後的值相同。`git status` 本輪只有 entity 檔一個 M。AC-1／AC-2／AC-4／AC-6 的實測值與 cycle 1 完全一致。
- SKIPPED: 改動任何 AC 的**要求**
  本次授權只及於 `Verified by:` 的涵蓋面。`git diff` 的刪除行共 6 行，全部是 `Verified by:` 行或 AC-5 的「會失敗的改動」行，**沒有一行 AC 要求被刪改**。
- SKIPPED: 動 `src/data/opinions.ts`、`docs/design-assets/003`、執行 `npm run sync-content`
  三者本輪皆未觸及，`git status` 可證。

### Summary

captain 授權的是「驗證涵蓋面」而不是「AC 要求」，因此本輪 `src/` 零變動，只改 entity 檔的五處 `Verified by:`。AC-5 的核心修正是固定字串換成容許空白的 regex，實測由 9 行變 11 行，與 AC-5 本來就列出的 11 筆集合對齊；可失敗性已實跑證明——改壞 B11 時新寫法轉紅、舊寫法仍綠。同型問題在 AC-1／AC-2／AC-3 也成立（三者的「不含 114憲判1」都是對加空格寫法全盲的不存在斷言），AC-4 則是另一種涵蓋面缺口（`head -1` 只檢第一個 chunk、且沒有不存在斷言），四項一併修正。施工中另有兩項發現寫進了規格：一是站上其實有**第三種**寫法 `111 年 憲判字第 17 號`（連 `年` 後也有空格），所以 regex 採每個接縫都容許空白而非只補一處；二是 AC-4 的不存在斷言不可寫成全域，因為有 3 個 chunk 合法含有 114憲判1。順帶一提，我自己在還原測試副本時用了一次盲目全域替換，把 `controversy.ts:69` 這行正確的 113憲判9 也一併改掉了——只發生在暫存副本上，但正好是 AC-5 要擋的那種事故的現場重演。
