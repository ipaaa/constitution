---
id: "019"
title: 不同意見總覽頁 + 文章摘要連結
status: design
source: captain-filed
started: 2026-09-21T22:12:00Z
completed:
verdict:
score: 0.7
worktree:
issue:
pr:
---

建立獨立的「不同意見總覽」頁面，集中呈現所有反方論述。同時在各文章詳細頁的反方意見區塊加上摘要連結，點擊後跳到總覽頁查看完整論述。

兩層結構：
1. 文章詳細頁（015 已完成）：簡短摘要 + 「查看完整論述」連結
2. 總覽頁（本 feature）：所有不同意見的集中呈現，可依議題/立場分類瀏覽

依賴 015（反方意見與中立呈現）的資料結構與元件。

## Design

**結論先講：本票不能照原樣施工。** 原票假設 `015` 的 `opposing_views` 欄會有資料。
那筆資料**不是還沒到，是 captain 已經決定不收集**。

`docs/content-pipeline/design.md:535-545` 記錄 2026-09-01 的決定，captain 原話：
「我從來不想收集反方意見。」同一節取消了 `Track 2_opposing` 分頁，
並把施工順序第 6 項標為「❌ 取消。不收集反方意見」。

因此 design 選擇**不依賴 `opposing_views` 欄**的設計。
新的資料來源是 `discussions.json` 本身那 16 篇已核可的真實文章。
代價是本票仍有一個前置，但前置從「新開一個巢狀資料收集管道」
縮小成「在現有分頁加兩個平面欄位」。

---

### 一、上游前置：實測事實

| 事實 | 實測指令與結果 |
|---|---|
| `discussions.json` 16 筆，`opposing_views` 0 筆 | `node -e "const d=require('./src/data/discussions.json');console.log(d.length, d.filter(r=>r.opposing_views&&r.opposing_views.length).length)"` → `16 0` |
| 渲染 guard 靠該欄 | `src/app/present/[id]/page.tsx:104` 為 `{item.opposing_views && item.opposing_views.length > 0 && ...}`，條件恆為 false |
| `015` 的元件從未渲染過一次 | 上兩項合併即證。同 `056` 第二節 A1 |
| **同步程式根本不會產出該欄** | `scripts/sync-content.mjs:557-571` 的 `buildTrack2` 回傳值是**逐鍵列舉**的白名單，沒有 `opposing_views`。試算表就算加了那一欄，同步也會丟掉 |
| 手改 `discussions.json` 被禁 | `AGENTS.md`「不要手改 `src/data/*.json`」；`docs/content-pipeline/design.md:454` 不變式 #2 |

最後兩項是關鍵：`opposing_views` **沒有任何合法的填入途徑**。
不是「沒人填」，是「填不進去」。

`056` 第二節 A1 把這一項判為「明確接受」，理由是 guard 讓區塊完全不渲染、對讀者零可見。
同節第 180 行明記「`019` 施工前須先讓產線產出該欄；這是 `019` 的前置，不是該 gate 的」。
**本票接下這個前置，並改變它的形狀。**

---

### 二、兩個方案與選擇

| | 方案 A：照原票走 | 方案 B：不依賴 `opposing_views`（**選定**） |
|---|---|---|
| 資料來源 | 新的反方意見收集管道 | `discussions.json` 現有 16 篇已核可文章 |
| 試算表改動 | 新增 `Track 2_opposing` 分頁（一篇文章對多筆意見） | 現有 `Track 2_discussion` 加 2 個平面欄位 |
| 同步程式改動 | 新增第四個 CSV 來源、跨分頁 join、巢狀組裝 | `TRACK_2_COLUMNS` 加 2 筆、projection 加 2 鍵、加 2 條驗證 |
| 內容工作量 | 每筆須寫 `stanceLabel`、`summary`、`fullArgument`、`editorialNote` 四段新文字 | 每篇填 2 格既有判斷 |
| 與 captain 決定的關係 | **直接推翻 2026-09-01 的決定** | 不衝突。不收集反方意見，只標記已收集文章的屬性 |
| 事故風險 | 重開產生「某學者，某大學法律系」那條路徑（`editorialNote` 是必填、無來源的新撰文字） | 零新撰文字。每篇都有真實作者與 `link` 原始出處 |

**選 B。** 理由不是工作量，是風險方向。
方案 A 要求為每筆意見新寫一段無出處的「編輯註記」——
`015` 的假出處事故、`006` 的 15 筆虛構跨軌連結、`docs/health-check/TODO.md` P1-8
三次同型事故都出自「新撰無來源文字」這一個動作。方案 B 一個字都不新寫。

#### 為什麼方案 B 還是需要新欄位

`Track 2_discussion` 現有欄位是 `id` `category` `title` `author` `year` `link`
`abstract` `vibe` `owl_comment` 等（`scripts/sync-content.mjs:102-120`）。
**沒有任何欄位記錄「這篇在談哪一個案件」或「它站在哪一邊」。**

不做機器推導。兩條都試過並否決：

- **從標題正則抓判決字號** —— 這正是全站目前出錯的方式。
  `src/app/present/page.tsx:18` 把「國會職權修法」標成 114憲判1，
  該內容實為 113憲判9（見第六節）。字號寫在文字裡、由機器撈出來，錯了沒有人會發現。
- **從 `abstract` 推導立場** —— 立場是編輯判斷，不是字串特徵。
  機器推導立場等於生成內容，直接落入 P1-8。

所以前置是真的，且必須由人填。

#### 前置票（須由 captain 核可後開立）

**票名：`064` Track 2 新增 `case_ref` 與 `stance` 欄。**
本票 implement **不得在 `064` 交付資料前開始**。
`064` 的交付定義：同步跑完後，`src/data/discussions.json` 中
至少有一組 ≥2 筆同 `case_ref`、且 `stance` 不全相同的記錄。
未達此條件，本票的 AC-1 必定失敗——這是刻意的耦合，不是巧合。

---

### 三、資料需求

#### 3.1 試算表新增兩欄（`Track 2_discussion`）

| 欄位 | 必填 | 誰可以改 | 值域 |
|---|---|---|---|
| `case_ref` | 選填 | **只有編輯台** | `VERIFIED_CASE_REFS` 的鍵，或空白 |
| `stance` | 選填 | **只有編輯台**（下拉選單） | `支持`／`質疑`／`中立分析`，或空白 |

兩欄皆為選填。空白的文章不進任何案件分組，只出現在總覽頁的「未分類」區。
這讓 `064` 可以分批填，不必一次填完 16 筆。

`stance` 的三個值是**論點取向**，不是陣營：

| 值 | 定義 |
|---|---|
| `支持` | 認為憲法法庭在該案的作為正當 |
| `質疑` | 認為憲法法庭在該案的作為有疑義 |
| `中立分析` | 不表立場。描述、比較或制度分析 |

**不得出現政黨名、陣營名（進步派／藍白）或評價性用語。**
此為 `015` 的驗收條件之一（`_archive/015-opposing-views-integration.md:62`），本票沿用。

#### 3.2 `case_ref` 必須是白名單，不是自由文字

在 `scripts/sync-content.mjs` 新增常數，形狀如下（值為已查證者，見第六節）：

```js
/**
 * 已查證的判決字號。鍵為字號，值為案由與一手來源。
 * 新增任何一筆，必須先開啟 source 網址核對案由與判決日期。
 * 不接受自由文字 —— 全站目前已有把 113憲判9 誤標為 114憲判1 的實例。
 */
const VERIFIED_CASE_REFS = {
  '113年憲判字第9號': {
    caseName: '立法院職權行使法等案',
    date: '113-10-25',
    source: 'https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=352966',
  },
  '114年憲判字第1號': {
    caseName: '憲法訴訟法修正案',
    date: '114-12-19',
    source: 'https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=355485',
  },
};
```

試算表填了白名單以外的值，**同步中止**（不變式 #3：檢查失敗即中止，不可部分寫入）。
錯誤訊息須指名該值與該列 id。

這條是本票對 `docs/content-pipeline/design.md:458` 不變式 #6 的回應：
「約定必須可被機器驗證」。「請不要把字號打錯」不是機制。白名單是。

#### 3.3 同步程式改動（三處，皆在 `scripts/sync-content.mjs`）

| 位置 | 改什麼 |
|---|---|
| `TRACK_2_COLUMNS`（:102-120） | 加 `case_ref`、`stance` 兩筆，皆 `column: 'optional', value: 'optional'` |
| `buildTrack2` 迴圈（:537-555） | 加兩條驗證：`case_ref` 非空時須在 `VERIFIED_CASE_REFS`；`stance` 非空時須在允許清單 |
| `buildTrack2` projection（:557-571） | 加 `...(record.case_ref ? { case_ref: record.case_ref } : {})` 與同形的 `stance`。**加在 `full_content` 之後**，維持既有鍵序，讓 PR diff 只顯示內容差異（該處註解已載明此要求） |

`column: 'optional'` 是必要的：欄位還沒在試算表建立時，同步不可中止。
同 `TRACK_1_COLUMNS` 對 `approved_by` 的處理（欄位在 :96-98，理由寫在 :76-84 的註解）。

#### 3.4 型別改動（`src/components/SharedPresent.tsx`）

```ts
export type DiscussionItem = {
  // ... 現有欄位不動 ...
  case_ref?: string;   // 判決字號，值域見 VERIFIED_CASE_REFS
  stance?: DiscussionStance;
};

export type DiscussionStance = '支持' | '質疑' | '中立分析';
```

`OpposingView` 與 `SourceRef` 兩個型別**保留不動**，見第五節。

---

### 四、元件階層與 props

新增一個路由與四個元件。目錄用 `src/components/opposing-views-overview/`，
與 `opinion-lazybag/`、`opposing-views/` 同層，沿用既有目錄慣例。

```
src/app/opposing-views/page.tsx                  # 'use client'（同 /present 與 /opinion-lazybag）
  責任：讀 discussions.json、呼叫 groupByCase、渲染頁首與各案件分組
  無 props（頁面元件）

src/components/opposing-views-overview/
  CaseGroup.tsx                                  # 一個案件的分組
    props: { caseRef: string
             caseName: string
             sourceUrl: string
             stances: Array<{ stance: DiscussionStance; items: DiscussionItem[] }> }
    責任：渲染案件標題（字號＋案由＋一手來源連結）、
          以 stance 分欄呈現各立場，每欄內渲染 StanceColumn

  StanceColumn.tsx                               # 一個立場的欄
    props: { stance: DiscussionStance; items: DiscussionItem[] }
    責任：立場標籤（沿用 `015` 的中性視覺：border-l-4 border-[#78909C]、bg-[#F5F7FA]）、
          渲染該立場下的 ArticleStanceCard 列表；
          items 為空時渲染「此立場目前沒有收錄文章」而**不是隱藏整欄**（見 AC-3）

  ArticleStanceCard.tsx                          # 一篇文章的卡片
    props: { item: DiscussionItem }
    責任：標題、作者、年份、abstract 前 80 字、
          「看原始出處」連結（item.link，target=_blank rel=noopener noreferrer）、
          「讀站內整理」連結（/present/{item.id}）
    視覺沿用 PresentDetail.tsx:204-222 的 RelatedArticles 卡片樣式

  SameCaseStances.tsx                            # 文章詳細頁的入口區塊（本票的「文章摘要連結」）
    props: { current: DiscussionItem; all: DiscussionItem[] }
    責任：找出同 case_ref、不同 stance 的文章，列出標題＋立場標籤；
          附「看這個案件的全部立場 →」連結至 /opposing-views#{case_ref}
          current.case_ref 為空、或同案件無其他立場時回傳 null

src/lib/opposing-views-overview.ts               # 純函式，無 React，可單獨測試
  export function groupByCase(items: DiscussionItem[]): CaseGroupData[]
  export function sameCaseOtherStances(current, all): DiscussionItem[]
  責任：分組與排序邏輯。抽成純函式是為了讓 AC-1 的證偽測試能直接餵假資料進去，
        不必掛載整個頁面
```

#### 既有檔案的修改

| 檔案 | 改什麼 | 為什麼 |
|---|---|---|
| `src/data/launch-status.ts:1` | `ALL_PAGES` 加 `'/opposing-views'` | **不加就整頁看不到。** `LaunchGate.tsx:34` 比對 `pathname` 是否在清單內，不在就渲染 `ComingSoon`。這是本票最容易漏的一行 |
| 同上 `PUBLIC_PAGES` | **不加** | 網站尚未對外發布。`060` 修好預覽開關後 `PUBLIC_PAGES` 才會真的生效，屆時本頁不該在公開三頁內 |
| `src/app/present/[id]/page.tsx` | 在 `RelatedArticles` 之前插入 `<SameCaseStances current={item} all={DISCUSSIONS_DATA} />` | 讀者動線：本文 → 同案其他立場 → 延伸閱讀 |
| `src/app/present/page.tsx` | 頁首加一個連往 `/opposing-views` 的連結 | **站內入口。** 只做詳細頁入口會重演 `059`（測驗全站無入口）：讀者得先進到某一篇有 `case_ref` 的文章才找得到路 |

**不改 `Navbar.tsx`。** `NAV_ITEMS` 是三軌＋關於的骨架，加第五項會稀釋軌道結構；
且 `059` 正在決定 Navbar 的入口政策，兩票各自動它會衝突。本頁屬 Track 2 的下層頁，入口放 `/present`。

---

### 五、與 `058`、`049`、`015` 的關係（逐項判定）

#### 5.1 `015` 的舊元件：重用還是重做？

**都不是。三個元件原地保留、本票不使用、也不新增對它們的依賴。**

判定依據：

1. **資料單位不同。** `opposing-views/` 的資料單位是 `OpposingView`——
   一篇文章底下的一則意見。方案 B 的資料單位是**整篇文章**（`DiscussionItem`），
   已經有卡片渲染方式（`RelatedArticles` 的卡片）。
2. **重用會強迫新撰無來源文字。** `OpposingView.editorialNote` 是**必填**
   （`SharedPresent.tsx:22`，無 `?`）。要把 `DiscussionItem` 套進 `OpposingView`，
   就得為每篇文章寫一段「編輯註記」。那正是 `015` 出事的那個動作。**否決重用。**
3. **視覺重用，元件不重用。** `015` 的中性視覺規範（`border-l-4 border-[#78909C]`、
   `bg-[#F5F7FA]`、不用政黨標籤）**沿用**，寫進 `StanceColumn` 的樣式。
   規範是對的，只有元件的資料形狀不合。

#### 5.2 修正一項前提

dispatch 的假設是「`015` 的舊元件硬編了立場資料，有 `049` 的零出處問題」。
**實測不成立。** `opposing-views/` 三個檔沒有任何資料字面值，全部經 props 傳入：

```
$ grep -n "justiceName\|stances:\|rulingRef\|const .*DATA\|= \[" src/components/opposing-views/*.tsx
src/components/opposing-views/OpposingViewCard.tsx:17:  const sourceText = [
```

唯一命中的那一行是 `const sourceText = [view.source.author, view.source.affiliation, view.source.year]`
——把 props 傳進來的值接成字串，**不是資料字面值**。三個檔都沒有任何硬編的立場、姓名或字號。

`049` 記錄的硬編立場資料在 `opinion-lazybag/`：
`StanceSpectrum.tsx:19-35`（`JUSTICES` 陣列，14 位具名大法官）與
`DecisionFlowchart.tsx`（5 條爭議條文），以及 `src/data/opinions.ts`
（12 筆 `justiceName`，`rulingRef` 在 `:94`–`:237`）。**與 `opposing-views/` 無關。**

**但 `049` 對本票仍有一條硬約束：本票不得使用 `opinions.ts`、`StanceSpectrum`
或 `DecisionFlowchart` 的任何立場資料。** 那批資料的出處問題未解，
挪到新頁面等於把零出處內容再開一個展示面。本票的立場資料只來自
編輯台填的 `stance` 欄，且每篇都有 `author` 與 `link` 指回原文。

#### 5.3 `058` 要移除的元件裡有沒有本票要用的？

**沒有。實測確認。**

`058` 移除的是「無任何檔案 import」的未接線元件。實測 import 關係：

```
OpinionLazybag      ← 0 個 importer（根）
OpinionScatterPlot  ← OpinionLazybag        DimensionSelector ← OpinionLazybag
OpinionTooltip      ← OpinionScatterPlot    OpinionTable      ← OpinionLazybag
ArgumentTag         ← OpinionTooltip, OpinionTable
```

六個全部只從已無 importer 的 `OpinionLazybag.tsx` 可達，且**六個全在
`src/components/opinion-lazybag/`，沒有一個在 `opposing-views/`**。
本票用不到其中任何一個。兩票無交集。

#### 5.4 兩票都沒認領的一項：`OpposingViewsSection` 的處置

這是 `058` 與本票之間**真正的縫**，必須現在補上，否則就是
「兩張票各自假設對方會處理」。

`OpposingViewsSection` **已接線但恆死**：
`src/app/present/[id]/page.tsx:8` 確實 import 了它，所以 `058` 的判準
（「無任何檔案 import」）**不會**把它列入移除範圍。
而 `opposing_views` 欄依 2026-09-01 的決定永遠不會有資料，所以它永遠不渲染。
它既不在 `058` 的清單裡，原票也沒交代它。

**本票認領這一項，處置如下（可逆，成本一行）：**

保留三個元件與 import，並在 `src/app/present/[id]/page.tsx:104` 的 guard 上方加一段註解，
記錄「`opposing_views` 依 `docs/content-pipeline/design.md` 2026-09-01 決定不收集，
此區塊刻意恆不渲染；不要當成 bug 修」。

理由：直接刪除等於推翻 `015`（已 PASSED、captain 核可、PR #14），
需 captain 簽字；而什麼都不做正是造成 `056` 第二節 A1 的原因——
下一個人會再花一輪查出「這個元件從沒渲染過」。註解讓成本歸零。

> **gate 決策點（需 captain 一句話）**：保留並註解（建議），或連同 `015`
> 三個元件一起刪除。兩者都可逆。若選刪除，`058` 的移除清單應由六個擴為九個，
> 且須在該票記錄，不可留在本票。

---

### 六、判決引註的查證（一手來源）

本頁會顯示判決字號與案由。dispatch 已警告站上既有引註證實有誤，
因此以下兩筆**由 design 階段實跑一手來源查證**，不沿用站上任何文字。

```bash
curl -s "https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=352966" | grep -oE '憲判字第[0-9]+號【[^】]+】'
# → 憲判字第9號【立法院職權行使法等案】   判決日期 113年10月25日

curl -s "https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=355485" | grep -oE '憲判字第[0-9]+號【[^】]+】'
# → 憲判字第1號【憲法訴訟法修正案】       判決日期 114年12月19日
```

| 字號 | 案由 | 判決日期 |
|---|---|---|
| 113 年憲判字第 9 號 | 立法院職權行使法等案（國會職權修法） | 113-10-25 |
| 114 年憲判字第 1 號 | 憲法訴訟法修正案 | 114-12-19 |

司法院站的 TLS 憑證缺 Subject Key Identifier，Python `urllib` 連不上。用 `curl` 或 Node `fetch`。

#### 順帶查到的事，交給該票，不在本票範圍

站上把 113憲判9 的內容標成 114憲判1，實際錯在**四個檔**：

| 位置 | 錯在哪 |
|---|---|
| `src/app/present/page.tsx:18` | `year: '2024'` ＋「關於國會職權修法之重大判決」，標成 114憲判1。兩項都指向 113憲判9 |
| `src/app/opinion-lazybag/page.tsx:7,30` | 該頁資料（`opinions.ts`）**12 筆 `rulingRef` 全部**寫 113憲判9（`:94`–`:237`），頁面文案卻寫 114憲判1 |
| `src/components/home/LazybagCtaSection.tsx:23` | 同上，CTA 文案 |
| `src/components/opinion-lazybag/DecisionFlowchart.tsx:6` | 「5 contested provisions from 114年憲判字第1號」。那 5 條是立法院職權行使法的條文 |

**`src/app/controversy-timeline/page.tsx:70` 不是錯的，不要一起改。**
那一行是引用張娟芬文章的**標題**（〈憲法法庭，歡迎回來——兼評114年憲判字第1號判決〉），
該文 2026-01-14 發表於鏡週刊，談的確實是憲訴法修正案。
`src/data/controversy-timeline.ts:125` 與 `:222` 也都正確。
一次 `sed` 全站替換會把這行改壞。

`src/app/present/page.tsx:18` 與本票同在 `/present`。
本票**不修它**（不在本票 scope），但實作時不得沿用該行的字號對應關係。

---

### 七、驗收條件

每條附可失敗的 `Verified by:`，並寫明「什麼改動會讓它失敗」。

**檢查方式的共同限制**：不得只讀 SSR HTML。
`src/components/LaunchGate.tsx:30` 在 hydration 前 `return null`，
`curl` 對整站都會零命中而看似通過。`037`／`038` 三個 agent 各自獨立踩過這個坑
（`039` 的 Problem 一節）。合格方式只有兩種：`039` 的 jsdom ＋ `react-dom/client` 掛載，
或 captain 人工開瀏覽器。`039` 尚在 design，本票 implement 需自備掛載腳本並**入版控**
（放 `scripts/checks/`），不可比照 `037`／`038` 用完即丟。

---

**AC-1（端值）讀者確實看見「同一案件存在不同意見」**

從 `/present` 出發、不打網址，兩次點擊內到達 `/opposing-views`，
且該頁**同一個案件分組內**同時出現 ≥2 筆**立場不同**的文章，每筆各有作者與原始出處連結。

`Verified by:` jsdom 掛載腳本，依序斷言：
(a) 掛載 `/present`，存在 `href="/opposing-views"` 的連結；
(b) 掛載 `/opposing-views`，至少一個 `CaseGroup` 內 `new Set(items.map(i => i.stance)).size >= 2` 且卡片數 >= 2；
(c) 該分組每張卡片的「看原始出處」`href` 等於對應 `item.link` 且為 http(s)。

**會讓它失敗的改動**：把 `discussions.json` 所有 `stance` 改成同一個值 → (b) 失敗。
這是本條的真正證偽點——它量測的是「有沒有對立」，不是「頁面有沒有渲染」。
另外，若 `064` 未交付資料，(b) 從第一次跑就失敗。**這是刻意的。**

---

**AC-2 新路由真的看得見**

`/opposing-views` 在 hydration 後渲染總覽頁內容，不是 `ComingSoon`。

`Verified by:` 掛載 `/opposing-views` 後斷言 DOM 不含 `ComingSoon` 的識別文字，且含案件分組標題。
**會讓它失敗的改動**：把 `'/opposing-views'` 從 `src/data/launch-status.ts` 的 `ALL_PAGES` 移除。

---

**AC-3 立場為空的欄顯示出來，不隱藏**

某案件在某立場下沒有收錄文章時，該欄仍渲染，並顯示「此立場目前沒有收錄文章」。

`Verified by:` 餵 `groupByCase` 一筆只含單一 `stance` 的假資料，斷言回傳的分組含 3 個 stance 欄、
其中 2 欄 `items.length === 0`；再掛載 `CaseGroup` 斷言空欄的提示文字存在。
**會讓它失敗的改動**：在 `StanceColumn` 加 `if (items.length === 0) return null`。

理由：**隱藏空欄會讓讀者誤以為該案件沒有反對意見。**
「我們沒收錄」和「不存在」是兩件事，頁面必須分得出來。
這與 `015` AC 的「無資料時不渲染整個區塊」方向相反，是刻意的——
`015` 是文章內的附屬區塊，本頁的主題就是立場對照，空欄本身是資訊。

---

**AC-4 沒有 `case_ref` 的文章不憑空歸類**

`case_ref` 為空的文章只出現在「未分類」區，不出現在任何案件分組內。

`Verified by:` 餵 `groupByCase` 混合資料（部分 `case_ref` 為空），
斷言所有分組的 `items` 皆 `item.case_ref === group.caseRef`，且空 `case_ref` 者全數落在 `uncategorized`。
**會讓它失敗的改動**：在 `groupByCase` 加任何從 `title` 或 `abstract` 猜 `case_ref` 的邏輯。
本條就是為了擋這個。

---

**AC-5 白名單以外的 `case_ref` 讓同步中止**

`Verified by:` 對 `buildTrack2` 餵一份含 `case_ref: '114年憲判字第9號'`（不存在的字號）的假 CSV，
斷言回傳 `null` 且 `errors` 含該列 id 與該值；再餵合法值，斷言回傳非 `null`。
**會讓它失敗的改動**：把驗證改成只警告不記 error，或把 `case_ref` 排除在驗證之外。

---

**AC-6 判決字號與案由對得上一手來源**

頁面顯示的每個 `case_ref`，其案由與 `VERIFIED_CASE_REFS` 一致，
且 `VERIFIED_CASE_REFS` 每筆的 `source` 網址實際開啟後案由相符。

`Verified by:` 實跑第六節的兩條 `curl`，比對 `caseName`。
**會讓它失敗的改動**：把 `113年憲判字第9號` 的 `caseName` 改成「憲法訴訟法修正案」
（即複製 `src/app/present/page.tsx:18` 的錯誤對應）。

---

**AC-7 詳細頁入口在無資料時安靜消失**

`current.case_ref` 為空、或同案件無其他立場的文章時，`SameCaseStances` 回傳 `null`，
詳細頁不出現空標題或空區塊。

`Verified by:` 掛載 `/present/{某筆 case_ref 為空的 id}`，斷言 DOM 不含 `SameCaseStances` 的區塊標題；
再掛載一筆有同案其他立場的，斷言標題與 `href="/opposing-views#..."` 皆存在。
**會讓它失敗的改動**：移除 `SameCaseStances` 的早退。

---

**AC-8 不出現陣營用語與具名大法官立場**

`Verified by:` 對 `src/app/opposing-views/page.tsx` 與 `src/components/opposing-views-overview/`
全目錄 grep 下列字串，要求零命中：`進步派`、`藍白`、`justiceName`、`STANCE_NUMERIC`、
`from '@/data/opinions'`、`StanceSpectrum`、`DecisionFlowchart`。
**會讓它失敗的改動**：從 `opinions.ts` 或 `StanceSpectrum` 引入任何立場資料（5.2 節的硬約束）。

---

**AC-9 型別與建置**

`Verified by:` `npx tsc --noEmit` 零錯誤；`npm run dev` 起站後上述掛載腳本全過。
**不跑 `npm run sync-content`**（`AGENTS.md` 絕對不要做的事第 1 項）。
**會讓它失敗的改動**：`DiscussionItem` 加了 `case_ref` 但 `page.tsx` 仍讀 `item.caseRef`。

---

### 八、桌機／行動版行為

沿用 Track 2 的 Magazine Spread 版面邏輯（`docs/project/design-system.md:23`），
容器寬度比照 `/present/[id]` 的 `max-w-4xl mx-auto px-6`。

| | 行動版（< 768px） | 桌機（>= 768px） |
|---|---|---|
| `CaseGroup` | 單欄。案件標題置頂並 `sticky top-16`，捲動時知道自己在哪個案件 | 單欄，標題不 sticky |
| `StanceColumn` | **三個立場垂直堆疊**，各自為一段，立場標籤為段落標題 | **三欄並排** `grid grid-cols-3 gap-5`，左右對照一眼可見 |
| `ArticleStanceCard` | 全寬，`abstract` 截 80 字 `line-clamp-3` | 欄寬內，同截字規則 |
| `SameCaseStances` | 單欄清單 | 單欄清單（不分欄，它是附屬區塊） |

**三欄並排只在桌機。** 行動版硬做三欄會讓每欄剩約 100px，標題無法閱讀。
行動版改以立場標籤分段，代價是失去左右對照，換取可讀性。

桌機三欄是本頁的核心版面：`grid-cols-3` 固定三欄（不是 `auto-fit`），
空欄也占位——這是 AC-3 的視覺理由，空位本身在說「這個立場我們沒收錄到」。

行動版的 `sticky` 標題高度需扣掉 `src/app/present/[id]/page.tsx:37` 的 sticky header
（`top-0 z-50`）。本頁的 `sticky top-16` 需與該 header 實高對齊，implement 時實測調整。

無障礙：每個 `CaseGroup` 為 `role="region"` ＋ `aria-label="{caseRef} 各方立場"`；
立場標籤用 `<h3>`，案件標題用 `<h2>`，維持標題層級不跳號。

---

### 九、預期改動檔案與行數（含容許範圍）

| 檔案 | 動作 | 預估行數 | 容許範圍 |
|---|---|---|---|
| `src/app/opposing-views/page.tsx` | 新增 | 90 | ±30 |
| `src/components/opposing-views-overview/CaseGroup.tsx` | 新增 | 70 | ±25 |
| `src/components/opposing-views-overview/StanceColumn.tsx` | 新增 | 50 | ±20 |
| `src/components/opposing-views-overview/ArticleStanceCard.tsx` | 新增 | 55 | ±20 |
| `src/components/opposing-views-overview/SameCaseStances.tsx` | 新增 | 60 | ±20 |
| `src/lib/opposing-views-overview.ts` | 新增 | 70 | ±25 |
| `scripts/checks/opposing-views-overview.mjs` | 新增（jsdom 掛載檢查） | 120 | ±40 |
| `src/components/SharedPresent.tsx` | 改：加 2 欄位、1 型別 | +5 | ±3 |
| `src/data/launch-status.ts` | 改：`ALL_PAGES` 加一項 | +1 | 0 |
| `src/app/present/[id]/page.tsx` | 改：插入 `SameCaseStances` ＋ guard 註解 | +8 | ±4 |
| `src/app/present/page.tsx` | 改：頁首加入口連結 | +8 | ±4 |
| `scripts/sync-content.mjs` | 改：白名單常數、2 欄定義、2 條驗證、2 個 projection 鍵 | +40 | ±15 |

**語意改動（非純增行）**：

1. `scripts/sync-content.mjs` 的 `buildTrack2` 新增中止條件。
   本來只有現有 17 條檢查會中止同步，現在 `case_ref`／`stance` 填錯也會中止整份。
   這是刻意的（不變式 #3），但**編輯台必須知道**：填錯字號會讓整次同步失敗，
   不是只有那一列被丟掉。此事須寫進編輯台文件（見第十節）。
2. `src/app/present/[id]/page.tsx:104` 的 guard 語意由「待資料」改為「刻意恆假」。
   程式不變，只加註解，但這是一個**判定**的記錄（見 5.4）。
3. `ALL_PAGES` 多一個路由 = 多一個夥伴可見的頁面。`PUBLIC_PAGES` 不動，公開範圍不變。

---

### 十、文件影響

#### 現在更新

| 文件 | 更新內容 | 狀態與驗證目標 |
|---|---|---|
| `docs/constitution-features/019-opposing-views-overview-page.md` | 本節（design 全文） | 已定方向，**尚未實作**。驗證目標：第七節九條 AC 皆有可失敗的檢查 |
| `docs/content-pipeline/design.md` | 第七節「本設計未處理的事項」加一列，記錄本票提出 `case_ref`／`stance` 兩欄；文末修訂紀錄加一則，標明**提案、待 captain 核可、尚未實作**，並同時指出它與 2026-09-01「不收集反方意見」決定的關係（不衝突，理由見本票第二節） | **必須寫成提案，不可寫成已決定。** 驗證目標：該節文字含「待核可」「尚未實作」，且不修改 2026-09-01 那則修訂紀錄的原文 |

#### 實作後更新

| 文件 | 更新內容 |
|---|---|
| `docs/content-pipeline/design.md` | 第二節 `Track 2_discussion` 欄位表加兩欄；第五節施工順序表加「Track 2 新增兩欄」與「同步程式支援兩欄」兩項並填真實狀態。**核可後、資料落地後才寫**，不可預先寫成已完成 |
| `docs/content-pipeline/data-collection-guide.md` | 編輯台填欄說明：兩欄的值域、下拉選單、以及「字號填錯會讓整次同步中止」。⚠️ 該文件 T1／T2 章節檔頭已標示過時（`:26` 的 2026-09-04 更正），動它之前要先確認要改的段落不在過時範圍 |
| `docs/project/design-system.md` | 加本頁的版面規範（桌機三欄、行動版堆疊、空欄占位的理由） |
| `docs/INDEX.md` | 僅在上述文件的「最後查核」日期需更新時同步 |
| `docs/health-check/TODO.md` | P1-8 的 `src/data/` 八檔表：`discussions.json` 仍為 SSOT 有把關，新增兩欄不改變其狀態。若表格需註明新欄位，於此時追加 |

#### 不更新

| 文件 | 為什麼 |
|---|---|
| `AGENTS.md` | 本票不改變任何禁令或溝通規範 |
| `docs/constitution-features/_archive/015-opposing-views-integration.md` | `record` 狀態，不改寫。本票對 `015` 的判定寫在本票 5.1／5.4 |
| `docs/design-assets/` | 休眠中，仍為 spacedock@0.9.5。本票不產視覺素材 |
| `docs/constitution-features/058-...md`、`049-...md` | 本票不改別票的 body。5.4 的 gate 決策若選「一併刪除」，由 FO 決定寫入哪一票 |
| `docs/health-check/2026-08-31-content-pipeline.md` | `record` 狀態，不改寫 |

---

### 十一、風險證據（未執行 spike）

`no spike needed`。本節每一項皆已由實跑指令或檔案行號證明，列於第一、五、六節。
需要判斷而非查證的只有兩項，兩項都是 captain 的決定，不是技術風險：

1. **要不要加 `case_ref`／`stance` 兩欄**（第二節）。不加，本票無法交付；
   加了，等於同意在試算表多兩格編輯工作。**這一項未決，implement 不能開始。**
2. **`OpposingViewsSection` 保留並註解，或連同 `015` 三個元件刪除**（5.4）。兩者皆可逆。

### 十二、gate 需要 captain 的兩個決定

**建議先講**：兩項都選第一個選項。

**決定一：加不加兩個欄位？**

- **加（建議）** —— 編輯台在現有分頁多填兩格：這篇談哪個判決、它站哪一邊。
  本票才能做出「同一案件、不同立場並排」的頁面。填錯字號會讓整次同步停下來，這是刻意的。
- 不加 —— 本票關掉。網站上不會有集中呈現不同立場的頁面。
  這不可逆的部分只有一個：`015` 留下的三個元件會繼續是死程式碼，該由 `058` 或本票的 5.4 處置。

**決定二：`015` 留下的三個反方意見元件怎麼辦？**

- **保留並加一行註解（建議）** —— 記錄「刻意不渲染」，下一個人不必再查一輪。可隨時改。
- 一併刪除 —— 乾淨，但等於推翻 2026-04-30 已核可的 `015`。刪了要恢復得重寫，但有 PR #14 可查。


## Stage Report: design

- DONE: 界定這一頁的產出與它的上游前置。實測事實：`src/data/discussions.json` 有 16 筆、`opposing_views` 欄 **0 筆**，而 `src/app/present/[id]/page.tsx:104` 的 guard 靠該欄決定是否渲染——所以 feature `015` 的反方意見元件**從未渲染過一次**。design 必須寫明：要讓本頁成立，SSOT 端必須產出什麼欄位、欄位形狀為何、由誰在哪一張票交付；或提出不依賴該欄的替代設計。
  第一至三節。查出比原判定更硬的事實：`grep -c "opposing_views" scripts/sync-content.mjs` → `0`，`buildTrack2` 的 projection 是逐鍵白名單（:557-571），該欄**沒有任何合法填入途徑**；且 `docs/content-pipeline/design.md:535-545` 記錄 captain 2026-09-01 已明確決定不收集反方意見。因此選定不依賴該欄的方案 B（以 `discussions.json` 16 篇已核可文章為資料源），前置縮小為 `Track 2_discussion` 加 `case_ref`／`stance` 兩個平面選填欄，形狀與同步程式三處改動寫在第三節，交付票指名為待開立的 `064`，並定義其交付條件。
- DONE: 元件階層、props、資料需求、桌機／行動版行為齊備，且每項 acceptance criteria 附可失敗的 `Verified by:`。其中至少一項要量測端值——讀者是否真的因為這一頁而看見「同一案件存在不同意見」，而不是只驗「頁面渲染出來了」。
  第四、七、八節。一個路由＋四個元件＋一個純函式模組，props 逐項列出；九條 AC 每條附 `Verified by:` 與「會讓它失敗的改動」。AC-1 為端值條：斷言同一案件分組內 `new Set(items.map(i => i.stance)).size >= 2` 且卡片數 >= 2，證偽點是「把所有 `stance` 改成同一值」——量測的是有無對立，不是有無渲染。全部檢查禁止只讀 SSR HTML（`LaunchGate.tsx:30` hydration 前 `return null`）。
- DONE: 判定並寫明本票與 `058` 與 `049` 的關係：`015` 的舊元件要重用還是重做？若重用，它硬編的立場資料有 `049` 記錄的零出處問題；若重做，`058` 要移除的那批元件裡有沒有本票要用的。**不得兩張票各自假設對方會處理。**
  第五節。判定：都不重用也不重做——`opposing-views/` 三元件原地保留、本票不使用、不新增依賴（`editorialNote` 為必填，重用會強迫為每篇新撰無出處編輯註記，即 `015` 出事的動作）。`058` 的六個元件經 import 圖實測全在 `opinion-lazybag/`、全只從無 importer 的 `OpinionLazybag.tsx` 可達，與本票零交集。5.4 補上兩票之間真正的縫：`OpposingViewsSection` **已被 import 因此不入 `058` 清單，但恆不渲染**，兩票都沒認領——本票認領並提出處置（保留＋註解），另附 gate 決策點。
- DONE: 將文件影響分成 `現在更新`、`實作後更新` 與 `不更新`；每一節都要列出文件或寫 `無`
  第十節，三節皆有具名文件。`現在更新` 兩筆已實際寫入：本票 `## Design`，以及 `docs/content-pipeline/design.md` 第七節加一則 `📌` 提案記錄（:482）＋修訂紀錄加一則（:610）。
- DONE: 每筆 `現在更新` 都要記錄已定方向、尚未實作的狀態與驗證目標；不可把預定行為寫成已上線
  `design.md` 的兩則皆標明「提案、待 captain 核可、尚未實作、試算表未新增任何欄位、同步程式未改」，並明寫「第二節欄位表與第五節施工順序表在核可前不得改動」。驗證目標可機器檢：`grep -c "case_ref" scripts/sync-content.mjs` → 實跑 `0`，即當前正確狀態。

### Summary

原票的前提不成立，且不是「資料還沒到」——`opposing_views` 沒有任何合法填入途徑（同步 projection 是白名單、`src/data/*.json` 禁止手改），而 captain 已於 2026-09-01 明確決定不收集反方意見。因此改採不依賴該欄的設計：以 `discussions.json` 16 篇已核可、有真實作者與原始出處的文章為資料源，按案件與立場並排呈現，零新撰文字，避開 `015`／`006`／P1-8 三次同型事故的共同動作。

本票仍有前置，但形狀從「新開巢狀收集管道」縮小為「現有分頁加兩個平面選填欄」。前置未核可前 implement 不得開始——AC-1 會從第一次跑就失敗，這是刻意的耦合。

查證時發現兩件與本票相鄰的事，皆已寫入第六節並標明不在本票範圍：`113憲判9` 被誤標為 `114憲判1` 實際錯在**四個檔**（含 `/present` 頁的 `src/app/present/page.tsx:18`），而 `src/app/controversy-timeline/page.tsx:70` 是正確的文章標題引用，一次全站替換會把它改壞；`opinions.ts` 的 `rulingRef` 是 **12 筆全部**寫 113憲判9，非 dispatch 所述的 12/13。兩筆判決字號與案由已以 `curl` 實跑一手來源查證（第六節）。

gate 需要 captain 兩個決定，皆已附建議與可逆性說明（第十二節）。
