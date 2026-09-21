---
id: "012"
title: 解釋門檻與案件數量關聯視覺化
status: verify
source: meetup-20260416
started: 2026-09-21T19:21:11Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-012-threshold-case-analysis
issue:
pr:
---

研究大法官會議時期通過舊案數量與提升門檻之間的關聯，製作時間軸 infographic。

來源：0416 會議討論（14:22, 25:47）。歷史上門檻從 1/2 → 3/4（1950s，案件驟減）→ 2/3（1987，案件暴增）→ 現行 10 人 9 人。利用司法院公開 81 份解釋案件資料，依年份分類，展現門檻調整點與案件量變化。需羅列土黃色區陡升陡降的可能因素。

---

## Problem

會議提出的敘事是「門檻提高→案件驟減，門檻降低→案件暴增」，但這條敘事目前有三個問題。

第一，資料來源不明。票內原文寫「司法院公開的 81 份解釋案件資料」。81 這個數字是錯的。
`docs/meetup-chats/20260416 log.md:81` 寫 81 份，同一份會議記錄 line 92 寫「已經有的資料 811 筆」。
實際數字是 813 筆（釋字第 1 號至第 813 號）。本階段已實跑確認，證據見 `## Risk evidence`。

第二，會議記錄的門檻時間點與法規沿革不一致。票內寫「1987 門檻下降至三分之二」。
法規沿革顯示該次修正公布日為 1993-02-03（民國 82 年），不是 1987。
慧婕投影片（`docs/meetup-chats/20260416 log.md` 內嵌截圖）自己標的是「1993 - 2022 大審法：雙三分之二」，
也不是 1987。1987 是解嚴年，不是門檻變動年。

第三，資料本身不支持「降門檻造成暴增」的時間順序。案件量的回升從 1986 年開始，
到 1993 年（門檻改變當年）已達 21 件，遠早於門檻變動。1987 年當年是 9 件，比 1986 年的 11 件更低。

這張 infographic 如果照會議原文做，會把一條時間順序錯誤的因果敘事當成事實發布。
本設計的目標是：呈現可查證的案件量曲線與可查證的門檻變動時點，讓讀者自己看見兩者的關係，
並明寫資料看不出來的部分。

## Proposed approach

畫一張 1949–2026 的年度案件量長條圖，圖底以色帶標示四個門檻時期。
色帶沿用慧婕投影片的配色語意（規則期／雙四分之三期土黃色／雙三分之二期綠色／憲訴法期），
但每條色帶的起訖日改用法規沿革的公布日，不用會議記錄的口述年份。

圖下方放一條「時期對照條」（era comparison strip），逐一列出每個時期的年均件數與相對前一期的倍率。
這是本設計量測端值的主要裝置：讀者要看見的不是「有一張圖」，而是「雙四分之三期年均 6.7 件、
雙三分之二期年均 17.3 件」這個對比，以及「回升早於門檻變動」這個限制。

圖下方再放一個獨立段落列土黃色區起伏的可能因素，每一項標明依據與不確定性。

### 不採用的選項

- **不採用折線／面積圖。** 慧婕投影片用面積圖。年度計數是離散事件數，面積圖的填色會暗示年之間有連續量。長條圖不會。
- **不採用把「可能因素」畫成圖上箭頭註解。** 註解釘在某個 x 位置，等於宣告該因素造成該處起伏。這是本票不能自行斷言的因果。改用獨立段落，見 `## 土黃色區起伏因素的交付形式`。
- **不採用引入圖表套件。** `package.json` 目前沒有任何圖表相依。`src/components/future/JusticeTermTimeline.tsx` 已示範以手寫 SVG 完成含門檻參考線的時間軸圖。沿用該做法。

## Risk evidence

最高風險項是「資料是否真的能以程式取得」。本階段以實跑驗證，結果如下。全部指令可重跑。

### R1 — 解釋清單與編號對照表：可取得（PROVEN）

清單頁 `https://cons.judicial.gov.tw/judcurrent.aspx?fid=2195` 為伺服器端渲染 HTML，
內含 813 個形如 `title="釋字第{N}號" href="/docdata.aspx?fid=100&id={id}"` 的錨點。

實跑結果：解析出 813 個相異釋字號，範圍 1–813，**無缺號**。

`id` 大致等於 `N + 310181`，但**釋字第 813 號為例外**（`id=325335`）。
因此不可用算式推 `id`，必須解析清單頁建對照表。這是實跑發現的，不是推測。

### R2 — 發布日期欄位：可取得且為西元 ISO 格式（PROVEN）

明細頁 `https://cons.judicial.gov.tw/docdata.aspx?fid=100&id={id}` 內含純文字
`發布日期：YYYY-MM-DD`。已實跑三筆端點與中點抽樣：

| 釋字 | id | 發布日期 |
|---|---|---|
| 第 1 號 | 310182 | 1949-01-06 |
| 第 80 號 | 310261 | 1958-11-26 |
| 第 813 號 | 325335 | 2021-12-24 |

日期已是西元，**不需要民國年換算**。同頁另有 `第1筆/共813筆`，獨立佐證總數為 813。

### R3 — 全量抓取已實際完成（PROVEN）

以 Node 併發 6 抓完 813 頁，耗時約 3 分鐘，**813 筆全部取到日期，缺漏 0 筆**。
依年份彙總的結果重現了慧婕投影片的曲線形狀：1958 年後的低谷、1990 年代中的尖峰、
尖峰值落在 1994 年 37 件（投影片目測約 36–37）。資料來源正確且足夠。

逐年件數（1949–2021，合計 813）：

| 1949:2 | 1950:0 | 1951:0 | 1952:10 | 1953:17 | 1954:14 | 1955:13 | 1956:14 | 1957:9 | 1958:2 |
| 1959:3 | 1960:4 | 1961:5 | 1962:6 | 1963:4 | 1964:2 | 1965:5 | 1966:8 | 1967:4 | 1968:3 |
| 1969:2 | 1970:2 | 1971:2 | 1972:3 | 1973:3 | 1974:4 | 1975:3 | 1976:3 | 1977:4 | 1978:4 |
| 1979:5 | 1980:6 | 1981:6 | 1982:6 | 1983:6 | 1984:8 | 1985:8 | 1986:11 | 1987:9 | 1988:13 |
| 1989:16 | 1990:22 | 1991:18 | 1992:22 | 1993:21 | 1994:37 | 1995:23 | 1996:27 | 1997:24 | 1998:28 |
| 1999:27 | 2000:21 | 2001:17 | 2002:18 | 2003:16 | 2004:17 | 2005:20 | 2006:15 | 2007:13 | 2008:18 |
| 2009:16 | 2010:14 | 2011:12 | 2012:12 | 2013:9 | 2014:10 | 2015:8 | 2016:9 | 2017:16 | 2018:14 |
| 2019:14 | 2020:12 | 2021:14 | | | | | | | |

### R3b — 重現方式（不依賴本機任何東西）

本階段的抓取在 session 暫存區執行，未進版控。任何人可用以下三步重現，只需 repo 內已有的 Node：

1. 抓清單頁，解析 `title="釋字第(\d+)號" href="/docdata\.aspx\?fid=100&id=(\d+)"`，得 813 組 `釋字號→id`。
2. 對每個 `id` 抓 `https://cons.judicial.gov.tw/docdata.aspx?fid=100&id={id}`，
   取正規式 `發布日期：(\d{4}-\d{2}-\d{2})` 的第一個命中。併發 6、失敗重試 3 次。
3. 抓 `https://cons.judicial.gov.tw/judcurrentNew1.aspx?fid=38` 單頁，
   解析 `title="(\d{3})年憲判字第(\d+)號"` 得憲判字逐年計數。

`scripts/fetch-interpretation-counts.mjs` 就是把這三步寫成可重跑的程式（施工階段建立）。
重現結果應與 `### R3` 的逐年表及 `### R5` 的憲判字表相符。若不符，代表來源網站已變動，
依 `## Acceptance criteria` AC-6 處理。

### R4 — Python 抓不到，Node 可以（PROVEN，施工必讀）

`cons.judicial.gov.tw` 的 TLS 憑證缺少 Subject Key Identifier 擴充欄位。
Python 的 `urllib` 會拒絕連線：

```
[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: Missing Subject Key Identifier
```

`curl` 與 Node 的 `fetch` 都連得上（已各自實跑成功）。
**抓取程式必須用 Node 寫**，與 `scripts/sync-content.mjs` 一致。不要用 Python。
這不是本機環境問題，任何用 Python OpenSSL 預設信任鏈的機器都會失敗。

### R5 — 2022 年起的裁判資料：可取得，且只需一頁（PROVEN）

2022-01-04 憲法訴訟法施行後不再作成「解釋」，改作成「判決」（憲判字）。
釋字序列在第 813 號（2021-12-24）終止。

`https://cons.judicial.gov.tw/judcurrentNew1.aspx?fid=38` 單一頁面即含全部憲判字，
錨點格式為 `title="{民國年}年憲判字第{N}號"`。實跑彙總（各年編號皆自 1 連續無缺號）：

| 民國年 | 西元 | 憲判字件數 |
|---|---|---|
| 111 | 2022 | 20 |
| 112 | 2023 | 20 |
| 113 | 2024 | 11 |
| 114 | 2025 | 1 |
| 115 | 2026 | 6 |

抓取日 2026-09-21。115 年尚未結束，該年數字會再變動。

### R6 — 四個門檻時點：三個有第一手法條，一個沒有

門檻條文取自全國法規資料庫（`law.moj.gov.tw`，伺服器端渲染 HTML，`curl` 可取得）。
沿革頁：`https://law.moj.gov.tw/LawClass/LawHistory.aspx?pcode=A0030159`
歷史條文頁：`https://law.moj.gov.tw/LawClass/LawOldVer.aspx?pcode=A0030159&lnndate={YYYYMMDD}&lser=001`

已實跑取得並核對的條文原文：

| 時期 | 法規 | 公布日 | 條文 | 原文（已實際抓取核對） |
|---|---|---|---|---|
| 規則期 | 司法院大法官會議規則 | 1948-09-16 | 未取得 | **UNPROVEN** — 見下 |
| 雙四分之三期 | 司法院大法官會議法 | 1958-07-21 | 第 13 條第 1 項 | 「大法官會議解釋憲法，應有大法官總額四分之三之出席，暨出席人四分之三之同意，方得通過。」 |
| 雙三分之二期 | 司法院大法官審理案件法 | 1993-02-03 | 第 14 條第 1 項 | 「大法官解釋憲法，應有大法官現有總額三分之二之出席，及出席人三分之二同意，方得通過。但宣告命令牴觸憲法時，以出席人過半數同意行之。」 |
| 現行 10 人 9 人 | 憲法訴訟法 | 2025-01-23 | 第 30 條第 2 項 | 「前項參與評議之大法官人數不得低於十人。作成違憲之宣告時，同意違憲宣告之大法官人數不得低於九人。」 |

**UNPROVEN 項：1948 年「二分之一」門檻。**
全國法規資料庫的歷史條文只回溯到 1958-07-21，1948 年的《司法院大法官會議規則》全文不在其中
（`LawOldVerList.aspx?pcode=A0030159` 只列出 19580721、19930203、20190104、20230621 四個版本）。
沿革頁記載該規則於 1948-09-16 制定公布全文 21 條，並於 1952-04-16 修正第 8、12、15 條，
但未提供條文內容。**因此票內「1/2」這個數字目前沒有第一手依據。** 處置見 `## 需外部拍板的項目` D1。

### R7 — 資料的三個邊界（PROVEN，必須在圖上寫明）

這三項是資料定義，可以斷言，不是推測：

1. **813 筆是「已作成的解釋」，不是「聲請案件數」。** 不受理的聲請不在其中。
   `docs/meetup-chats/20260416 log.md` 39:48 段記載早期不受理案件缺乏公開紀錄，
   且可能屬秘密評議。圖若不寫明，讀者會把它讀成聲請量。
2. **釋字與憲判字是兩個不同的序列，不可相加或接成同一條曲線。** 前者依解釋程序作成，後者依判決程序作成。
3. **現行 10 人 9 人門檻（2025-01-23）落在釋字序列結束之後 3 年。** 釋字資料無法用來評估這個門檻的影響。
   圖上必須讓這件事看得出來。

## Data requirements

### 取得與存放

| 檔案 | 角色 | 由誰產生 |
|---|---|---|
| `scripts/fetch-interpretation-counts.mjs` | 抓取程式。解析 R1 清單頁建 `釋字號→id` 對照表，逐頁抓 R2 的 `發布日期`，再抓 R5 單頁取憲判字。輸出原始對照到 `tests/fixtures/interpretation-dates.json`，並印出逐年彙總 | 人工執行，**不得進入 `npm run build`，也不得寫進 `src/data/discussions.json` 或 `src/data/history.json`** |
| `tests/fixtures/interpretation-dates.json` | 813 筆 `[釋字號, 發布日期]` 原始對照，加憲判字逐年計數 | 上述程式產生，進版控 |
| `src/data/threshold-analysis.ts` | 網站實際讀的資料模組。逐年計數、四條門檻時期、每項因素條目 | 手寫並經人工審閱，與 `src/data/controversy-timeline.ts`、`src/data/future.ts` 同性質 |

**為什麼 `src/data/threshold-analysis.ts` 是手寫 TS 而不是產生的 JSON：**
`AGENTS.md` 禁止手改 `src/data/*.json`，因為那是試算表同步的產物。
再放一個來源完全不同的 JSON 進同一個資料夾，會讓那條禁令的適用範圍變模糊，
下一個 agent 會不知道哪個檔可以改。手寫 `.ts` 沿用專案既有慣例，且讓數字進 PR diff 受人工審閱。

### 型別

```ts
// src/data/threshold-analysis.ts

/** 一年的案件計數。series 標明是哪個序列，兩個序列不可相加。 */
export interface YearCount {
  year: number;
  count: number;
  series: 'interpretation' | 'judgment';  // 釋字 / 憲判字
  /** 該年資料是否已完整。抓取當年為 false。 */
  complete: boolean;
}

/** 一段門檻時期。start/end 為法規公布日，不是會議口述年份。 */
export interface ThresholdEra {
  id: 'rules' | 'three-quarters' | 'two-thirds' | 'current';
  /** 圖上與對照條顯示的名稱，例：「雙四分之三」 */
  label: string;
  /** 門檻的白話一句話，例：「總額 3/4 出席，出席人 3/4 同意」 */
  ruleSummary: string;
  /** 法規名稱，例：「司法院大法官會議法」 */
  statute: string;
  /** 法規公布日 ISO。色帶起點。 */
  effectiveFrom: string;
  /** 下一期公布日 ISO，最後一期為 null。色帶終點。 */
  effectiveTo: string | null;
  /** 條號，例：「第 13 條第 1 項」。無第一手依據時為 null。 */
  article: string | null;
  /** 條文原文。無第一手依據時為 null，此時 UI 必須顯示未確認標記。 */
  quotedText: string | null;
  /** 第一手來源 URL。無則為 null。 */
  sourceUrl: string | null;
  /** 條文依據的取得狀態。'unverified' 時 UI 必須顯示未確認標記。 */
  evidence: 'primary-source' | 'unverified';
  /** 色帶顏色 token，見 ## 視覺 */
  colorToken: string;
}

/** 土黃色區起伏的一項可能因素。每一項都必須交代依據與拍板者。 */
export interface FactorNote {
  id: string;
  /** 可查證的事實陳述。不得寫成因果。 */
  claim: string;
  /** 依據。'data' = 本票抓取的計數；'statute' = 已引條文；'none' = 尚無依據 */
  basis: 'data' | 'statute' | 'none';
  /** 依據的具體出處。basis 為 'none' 時為 null。 */
  basisRef: string | null;
  /** 這項能不能解釋起伏。必須明寫不確定的是什麼。 */
  uncertainty: string;
  /** 誰有權把它從候選改成結論。null = 本票的資料即可支持，無須外部拍板。 */
  needsRuling: 'captain' | 'legal-reviewer' | 'external-source' | null;
}
```

### 已定的四條門檻時期資料

`effectiveFrom` 一律用法規公布日。**不得用票內原文的 1950s 或 1987。**

| id | label | statute | effectiveFrom | effectiveTo | article | evidence |
|---|---|---|---|---|---|---|
| `rules` | 規則期 | 司法院大法官會議規則 | `1948-09-16` | `1958-07-21` | `null` | `unverified` |
| `three-quarters` | 雙四分之三 | 司法院大法官會議法 | `1958-07-21` | `1993-02-03` | 第 13 條第 1 項 | `primary-source` |
| `two-thirds` | 雙三分之二 | 司法院大法官審理案件法 | `1993-02-03` | `2022-01-04` | 第 14 條第 1 項 | `primary-source` |
| `current` | 10 人 9 人 | 憲法訴訟法 | `2025-01-23` | `null` | 第 30 條第 2 項 | `primary-source` |

`two-thirds` 的 `effectiveTo` 是憲法訴訟法施行日 2022-01-04，不是 2025-01-23。
2022-01-04 到 2025-01-23 之間是憲法訴訟法的原始門檻（2019-01-04 公布全文，第 30 條），
**該段的門檻條文本階段未逐字抓取核對**，列為 D2，見 `## 需外部拍板的項目`。
施工時若 D2 仍未定，色帶在 2022-01-04 到 2025-01-23 之間留為中性灰並標「未確認」，
不可猜一個值填進去。

### 年份分類方式（已定）

- **分類欄位：解釋用 `發布日期` 的西元年（`YYYY-MM-DD` 取前四字元）；憲判字用錨點 `title` 的民國年 + 1911。**
- **一年一格。不合併十年。** 十年合併會把 1957→1958 這個關鍵落差（9→2）藏進同一個 1950s 桶裡。
- **x 軸範圍 1949–2026**，含 1950、1951 兩個 0 件年。0 件年畫成零高度但保留刻度位，不可略去。
- **跨年不調整。** 1958 年門檻自 7 月 21 日起適用，該年前後半年適用不同門檻。圖不對此做加權，
  但 1958 這一格必須帶 tooltip 註明「本年 7 月 21 日換法」。

## 四個門檻調整點如何標示

三層，由下而上：

1. **底層色帶（`ThresholdBand`）** — 每期一個 `<rect>`，自 `effectiveFrom` 的 x 位置畫到 `effectiveTo`，
   由 y 軸底拉到頂，不透明度 0.18，位於長條之下。色帶是區間，不是點。
2. **分界線（`ThresholdBoundary`）** — 在每個 `effectiveFrom` 畫一條垂直實線（1px，`#111827`），
   線上端掛一個標籤：法規公布日 + 門檻一句話。這是「調整點」本身。
   **線的 x 位置依公布日精確定位到月，不吸附到年刻度。** 1993-02-03 要落在 1993 年格的左緣附近，
   不是 1993 與 1994 之間。
3. **色帶內標籤** — 期間名稱 + 年均件數，置於色帶水平中央。

`current` 期（2025-01-23 起）的色帶右緣延伸到 x 軸末端，並加一條斜線網底（`<pattern>`）
表示「該期無釋字資料」。這是 R7 第 3 點的視覺落實。

2022-01-04 的序列斷點另畫一條虛線，標「解釋制度終止，改為判決」，
且長條顏色自此改為第二序列色。虛線與門檻分界線必須視覺可區分（虛線 vs 實線），
因為 2022-01-04 是制度換軌，不是門檻調整。

## Responsibilities and component hierarchy

新頁面路由 `src/app/past/thresholds/page.tsx`。

放在軌道一（過去）之下，因為內容是 1949–2021 的歷史。
從 `/future` 加一條連結指向它，因為 `src/components/future/JusticeTermTimeline.tsx` 已在畫 `QUORUM = 10` 這條門檻線，兩者講同一件事的兩端。
這個路由位置改起來便宜，本階段自行決定，不佔用 captain 的決策。

```
src/app/past/thresholds/page.tsx                 (server) 頁面外殼、metadata、渲染以下元件
└── src/components/threshold-analysis/
    ├── ThresholdCaseAnalysis.tsx        ('use client') 協調者。持有 hoveredYear / selectedEraId 狀態
    │   ├── ThresholdChart.tsx           SVG 圖本體。無自身狀態，狀態由 props 傳入
    │   │   ├── ThresholdBand.tsx        一條時期色帶 + 色帶內標籤
    │   │   ├── ThresholdBoundary.tsx    一條門檻分界線 + 上方標籤
    │   │   ├── SeriesBreakLine.tsx      2022-01-04 制度換軌虛線
    │   │   └── ChartAxes.tsx            x 年刻度、y 件數刻度、格線
    │   ├── ThresholdTooltip.tsx         hover 單一年份時的浮層
    │   ├── EraComparisonStrip.tsx       時期對照條。量測端值的主要裝置
    │   ├── SeriesBoundaryNote.tsx       R7 三項邊界的固定說明
    │   └── OchreBandFactors.tsx         土黃色區起伏因素段落
    └── src/data/threshold-analysis.ts   資料與型別
```

年份長條不另抽元件。78 個長條在 `ThresholdChart` 內以 `map` 直接產出 `<rect>`，
與 `JusticeTermTimeline.tsx` 的做法一致。多一層元件只會增加 78 個 React 節點而無好處。

### Props

```ts
// ThresholdCaseAnalysis — 無 props。資料自 @/data/threshold-analysis import。
// 與 src/components/future/JusticeTermTimeline.tsx 的做法一致。

interface ThresholdChartProps {
  years: readonly YearCount[];
  eras: readonly ThresholdEra[];
  /** 目前 hover 的年份。null 表示無。桌機由滑鼠決定，行動版恆為 null。 */
  hoveredYear: number | null;
  /** 目前選取的時期。行動版點擊色帶時設定；桌機恆為 null。 */
  selectedEraId: ThresholdEra['id'] | null;
  onHoverYear: (year: number | null) => void;
  onSelectEra: (id: ThresholdEra['id'] | null) => void;
}

interface ThresholdBandProps {
  era: ThresholdEra;
  /** 該期的年均件數。無資料期（current）為 null。 */
  meanPerYear: number | null;
  x: number;
  width: number;
  height: number;
  /** true 時填斜線網底，表示該期無釋字資料 */
  hatched: boolean;
  selected: boolean;
  onSelect: () => void;
}

interface ThresholdBoundaryProps {
  era: ThresholdEra;
  x: number;
  height: number;
  /** 標籤朝左或朝右，避免在圖緣被裁切 */
  labelAnchor: 'start' | 'end';
}

interface EraComparisonStripProps {
  /** 每期一個 tile。順序即時間序。 */
  items: readonly {
    era: ThresholdEra;
    meanPerYear: number | null;
    totalCount: number;
    yearSpan: number;
    /** 相對前一期的倍率。第一期與無資料期為 null。 */
    ratioToPrevious: number | null;
  }[];
  selectedEraId: ThresholdEra['id'] | null;
  onSelectEra: (id: ThresholdEra['id'] | null) => void;
}

interface ThresholdTooltipProps {
  year: YearCount;
  /** 該年所屬時期。1958、1993 這類跨年換法的年份會有兩個。 */
  eras: readonly ThresholdEra[];
  x: number;
  y: number;
}

interface OchreBandFactorsProps {
  factors: readonly FactorNote[];
}
```

### 已定的計算值

`EraComparisonStrip` 顯示的數字由 `years` 推導，不寫死。推導結果必須等於下表
（本階段已實跑算出，`## Acceptance criteria` AC-2 以此為斷言值）：

| 時期 | 資料涵蓋區間 | 合計 | 區間長度 | 年均 | 相對前期倍率 |
|---|---|---|---|---|---|
| 規則期 | 1949-01-06 – 1958-07-20 | 79 | 9.5 年 | 8.3 | — |
| 雙四分之三 | 1958-07-21 – 1993-02-02 | 233 | 34.5 年 | 6.7 | 0.81× |
| 雙三分之二 | 1993-02-03 – 2021-12-24 | 501 | 28.9 年 | 17.3 | 2.57× |
| 10 人 9 人 | 2025-01-23 – | — | — | 無釋字資料 | — |

**歸屬規則：逐筆按 `發布日期` 落在哪個時期，不按年歸屬。** 三期合計 79 + 233 + 501 = 813，與總數相符。

不按年歸屬的理由是實跑查出來的，不是偏好：1993 年 21 件之中，
只有釋字第 312 號（1993-01-29）在新法公布前，其餘 20 件都在 1993-02-03 之後。
把 1993 整年歸給雙四分之三期，會把 20 件算在錯的門檻底下。
1958 年的 2 件（第 80 號 1958-11-26、第 81 號 1958-12-17）則都在 1958-07-21 之後，
按年或按日皆歸雙四分之三期，無差異。

區間長度為該期與釋字資料實際範圍（1949-01-06 至 2021-12-24）的交集，以 365.2425 日為一年換算。
雙三分之二期的區間止於釋字序列終點 2021-12-24，不是憲法訴訟法施行日 2022-01-04
—— 之後沒有釋字可計，把空白期算進分母會壓低年均。

分母必須用下列已實算的日數，不得由 UI 端另行推算，否則四捨五入會漂移：

| 時期 | 起（含） | 迄（不含） | 日數 | 年數 = 日數／365.2425 | 年均 |
|---|---|---|---|---|---|
| 規則期 | `1949-01-06` | `1958-07-21` | 3483 | 9.5361 | 8.2843 → `8.3` |
| 雙四分之三 | `1958-07-21` | `1993-02-03` | 12616 | 34.5414 | 6.7455 → `6.7` |
| 雙三分之二 | `1993-02-03` | `2021-12-25` | 10552 | 28.8904 | 17.3414 → `17.3` |

倍率由未四捨五入的年均相除後才進位：`6.7455 / 8.2843 = 0.8143` → `0.81×`；
`17.3414 / 6.7455 = 2.5708` → `2.57×`。
**先進位再相除會讓第二個倍率變成 `17.3 / 6.7 = 2.5821` → `2.58×`，與 AC-2 斷言不符。**
（第一個倍率 `6.7 / 8.3 = 0.8072` → `0.81×`，兩種算法碰巧同值，不能拿它來檢查算序。）

**上表的區間定義與換算方式屬設計決定，施工不得自行改動。** 要改必須回 design 改規格並同步更新 AC-2 的斷言值。

長條圖仍是一年一格（見 `### 年份分類方式`）。**圖是年桶、對照條是日期精確，兩者刻意不同。**
1993 這一格因此橫跨兩期色帶的分界線，`ThresholdTooltip` 必須對 1958 與 1993 兩格
列出該年的兩個所屬時期與各自件數（1993：新法前 1 件、新法後 20 件；1958：換法前 0 件、換法後 2 件）。

補充參考（不進 `EraComparisonStrip`，只供 `OchreBandFactors` 引用）：
雙四分之三期可切為兩段 —— 1958-07-21 至 1985-12-31 為 121 件／27.5 年，年均 4.4；
1986-01-01 至 1993-02-02 為 112 件／7.1 年，年均 15.8。
後段的年均已達 15.8，接近雙三分之二期的 17.3，而門檻在該段全程未變。

### Desktop and mobile

單一 SVG，`viewBox="0 0 960 420"` 搭 `preserveAspectRatio="xMidYMid meet"`，
與 `JusticeTermTimeline.tsx:125-127` 同做法。圖本身靠 viewBox 縮放，不做兩套版面。

**桌機（`md` 起，≥768px）**

- 78 個年長條，滑鼠 hover 單一年份顯示 `ThresholdTooltip`（年份、件數、序列、所屬時期、門檻一句話）。
- x 軸每 3 年一個數字刻度，其餘只畫短刻度線。
- 門檻分界線標籤橫排，四條線不重疊。
- `EraComparisonStrip` 為 `grid-cols-4`。

**行動版（<768px）**

- 圖等比縮小。78 個長條在 375px 寬下每條約 3.5px，**放棄逐年 hover**。
  不做逐年觸控目標：3.5px 遠低於可觸控尺寸，硬做會變成誤觸。
- 改為**點擊色帶選取時期**。選取後：該色帶不透明度提到 0.32，其餘降到 0.08，
  下方 `EraComparisonStrip` 捲動到該期 tile，並展開該期逐年件數清單（`<dl>`，年份對件數）。
  逐年數字在行動版透過這份清單取得，不透過圖。
- x 軸改每 10 年一個數字刻度。
- 門檻分界線只保留線與公布年份，門檻一句話移到 `EraComparisonStrip` 的 tile 內。
- `EraComparisonStrip` 為 `grid-cols-1`，四個 tile 直向堆疊。
- `SeriesBoundaryNote` 與 `OchreBandFactors` 兩段版面不變，本來就是文字流。

**兩版皆須**

- SVG 帶 `role="img"` 與 `<title>` / `<desc>`。`<desc>` 必須包含四期的年均件數，
  讓讀螢幕軟體使用者取得與視覺讀者相同的對比資訊。
- 色帶不可為唯一的時期區辨手段。每條色帶都要有文字標籤，無資料期要有斜線網底。
- 圖不得橫向捲動。整張圖在任何寬度都完整可見。

## 視覺

沿用 `docs/project/design-system.md` 的既有語彙：襯線體標題、1px 灰框、米白底。
色帶顏色沿用慧婕投影片的語意，取專案已有的色票：

| 時期 | colorToken | 說明 |
|---|---|---|
| 規則期 | `#7C8B9A`（藍灰） | 投影片左側藍色區 |
| 雙四分之三 | `#B8913C`（土黃） | 投影片土黃區。票內「土黃色區」即指此 |
| 雙三分之二 | `#4E8C6A`（綠） | 投影片綠色區 |
| 10 人 9 人 | `#9CA3AF`（中性灰）+ 斜線網底 | 無釋字資料，不給實色 |

長條顏色：釋字序列 `#111827`，憲判字序列 `#D32F2F`（design-system 已用的紅）。
兩色差異須足以在灰階列印下區分（`print.css` 存在，圖會被列印）。

## Expected surface and tolerance

| 檔案 | 動作 | 預估淨行數 |
|---|---|---|
| `src/app/past/thresholds/page.tsx` | 新增 | 45 |
| `src/components/threshold-analysis/ThresholdCaseAnalysis.tsx` | 新增 | 110 |
| `src/components/threshold-analysis/ThresholdChart.tsx` | 新增 | 200 |
| `src/components/threshold-analysis/ThresholdBand.tsx` | 新增 | 60 |
| `src/components/threshold-analysis/ThresholdBoundary.tsx` | 新增 | 55 |
| `src/components/threshold-analysis/SeriesBreakLine.tsx` | 新增 | 35 |
| `src/components/threshold-analysis/ChartAxes.tsx` | 新增 | 90 |
| `src/components/threshold-analysis/ThresholdTooltip.tsx` | 新增 | 55 |
| `src/components/threshold-analysis/EraComparisonStrip.tsx` | 新增 | 95 |
| `src/components/threshold-analysis/SeriesBoundaryNote.tsx` | 新增 | 40 |
| `src/components/threshold-analysis/OchreBandFactors.tsx` | 新增 | 75 |
| `src/data/threshold-analysis.ts` | 新增 | 230 |
| `scripts/fetch-interpretation-counts.mjs` | 新增 | 130 |
| `tests/fixtures/interpretation-dates.json` | 新增 | 1（單行 JSON，約 16KB） |
| `tests/threshold-analysis.test.mjs` | 新增 | 180 |
| `src/components/future/JusticeTermTimeline.tsx` | 修改，加一條連結 | 8 |
| `src/app/past/page.tsx` | 修改，加入口 | 12 |
| 文件（見 `## Documentation impact`） | 修改 | 60 |

合計預估 **+1380 淨行，容差 ±40%（828–1932）**。

語意變更：新增一個路由 `/past/thresholds`；新增一個手寫資料模組；
新增一支人工執行的抓取程式。`src/data/discussions.json` 與 `src/data/history.json` 不動。
`package.json` 的 `build` 不動。不新增任何相依。

## Acceptance criteria

**AC-1 — 圖上標示的四個門檻時點與法規公布日一致，且沒有一處把門檻變動寫成 1987 年。**
Verified by: `tests/threshold-analysis.test.mjs` 斷言 `src/data/threshold-analysis.ts` 的四個
`effectiveFrom` 恰為 `1948-09-16`、`1958-07-21`、`1993-02-03`、`2025-01-23`，
且 `evidence === 'primary-source'` 的三期各有非空 `article`、`quotedText`、`sourceUrl`。
同一測試以正規式掃 `src/app/past/thresholds/`、`src/components/threshold-analysis/`、
`src/data/threshold-analysis.ts` 的全部原始碼與字串，要求
`/1987[^0-9]{0,12}(門檻|三分之二|降|放寬)/` 與 `/(門檻|三分之二|降|放寬)[^0-9]{0,12}1987/` 皆無命中，
且無任何 `ThresholdEra` 的 `effectiveFrom`、`effectiveTo` 以 `1987` 開頭。
**不可改為單純 grep 字串 `1987`。** `years` 資料必然含有 1987 這個年份鍵（1987 年 9 件），
純字串比對會恆真失敗。
把任一 `effectiveFrom` 改成 1987、或在任一元件寫回「1987 年門檻降至三分之二」，測試即失敗；
只把 1987 當年份鍵列在 `years` 裡，測試必須通過。

**AC-2 — 讀者拿到的每個時期年均件數，等於 813 筆原始日期算出來的值。**
Verified by: `tests/threshold-analysis.test.mjs` 自 `tests/fixtures/interpretation-dates.json`
的 813 筆原始 `[釋字號, 發布日期]` 重算，斷言下列各值：

- 逐年計數等於 `src/data/threshold-analysis.ts` 的 `years`，合計 813 筆，最大值為 1994 年 37 件。
- 三期件數為 `79`、`233`、`501`，三者相加等於 813。
- 三期年均為 `8.3`、`6.7`、`17.3`（小數一位），`current` 期為 `null`。
- `EraComparisonStrip` 渲染出的 `ratioToPrevious` 為 `0.81×` 與 `2.57×`。
- 邊界年的分割：1993 年新法公布前 1 件、公布後 20 件；1958 年換法前 0 件、換法後 2 件。

可失敗性：把歸屬改成按年（1993 整年歸雙四分之三期）會讓三期件數變成 `79`／`253`／`481`、
年均變成 `8.8`／`7.0`／`17.2`、倍率變成 `0.80×` 與 `2.46×`，上列三項斷言同時失敗。
把任一年的 `count` 改掉，逐年比對即失敗。把邊界年分割寫成 1993 全年 21 件歸單一時期，最後一項斷言失敗。

**不可拿「雙三分之二期分母改用 2022-01-04」當可失敗性證明。** 已實算：
分母用 2022-01-04 得 501／28.92 年 = 17.32，四捨五入到一位小數仍是 `17.3`，斷言不會失敗。
這個分母選擇是為了語意正確（釋字序列已終止），不是為了數值。

**AC-3 — 非法律背景的讀者看完圖之後，能說出門檻與案件量的關聯，也能說出資料看不出來的部分。**
Verified by: captain 執行一次朗讀測試，記錄進 `docs/constitution-features/012-threshold-case-analysis.md`。
受測者 3 人，皆非法學背景，未事先看過本票。各人自行閱讀頁面後回答三題，不得提示：

1. 「哪一段時間解釋案件最少？跟當時的門檻有什麼關係？」
   通過條件：指出 1958–1985 這段（或說「四分之三那段」），並說出門檻較高、案件較少。
2. 「案件量開始回升是在門檻放寬之前還是之後？」
   通過條件：答「之前」。
3. 「這張圖有沒有算進被駁回、不受理的聲請？」
   通過條件：答「沒有」。

三人之中至少 2 人答對第 1、2 題，且至少 2 人答對第 3 題，本 AC 才通過。
第 2 題是本 AC 的核心：若讀者答「之後」，表示圖仍在傳達「降門檻造成暴增」這條錯誤的時間順序，
`EraComparisonStrip` 與 `OchreBandFactors` 必須改寫。
第 3 題不通過表示 `SeriesBoundaryNote` 沒有發揮作用。
**本 AC 需 captain 執行，worker 無法自證。** 施工完成時本 AC 記為 `PENDING-CAPTAIN`，不得記為 DONE。

**AC-4 — 土黃色區的起伏因素以獨立段落交付，且沒有一項被寫成已確立的因果。**
Verified by: `tests/threshold-analysis.test.mjs` 斷言 `FACTORS` 陣列每一項的
`basis` 為 `'data'`／`'statute'`／`'none'` 之一；`basis !== 'none'` 者 `basisRef` 非空；
`basis === 'none'` 者 `needsRuling` 非 `null`；每一項 `uncertainty` 非空且長度 ≥ 15 字。
另斷言 `OchreBandFactors` 渲染時，`needsRuling !== null` 的每一項都帶可見的待確認標記與拍板者名稱。
再以 `grep` 斷言 `ThresholdChart.tsx` 及其子元件不 import `FACTORS`
—— 因素只能出現在獨立段落，不得成為圖上註解。
加一個沒有 `uncertainty` 的因素，或把 `FACTORS` 接進圖上註解，測試即失敗。

**AC-5 — 現行 10 人 9 人門檻在圖上看得出「沒有釋字資料可用」。**
Verified by: `tests/threshold-analysis.test.mjs` 斷言 `current` 期的 `hatched === true`、
`meanPerYear === null`，且渲染輸出包含斜線 `<pattern>` 的 `fill` 引用與字串「無釋字資料」。
另斷言 `years` 中 `series === 'judgment'` 的年份（2022–2026）不被計入任何時期的 `meanPerYear`。
把 `current` 期的 `meanPerYear` 改成用憲判字件數算出的數字，測試即失敗。

**AC-6 — 資料可以重新抓取，且抓到的東西與已提交的數字一致。**
Verified by: 以 `THRESHOLD_LIVE=1 node --test tests/threshold-analysis.test.mjs` 執行線上比對。
該測試重跑 `scripts/fetch-interpretation-counts.mjs` 的抓取邏輯，
斷言清單頁仍解析出 813 個無缺號的釋字號、每筆 `發布日期` 與 fixture 相同、
且釋字第 813 號的 `id` 仍為 `325335`（即 `id = N + 310181` 的例外仍存在）。
未設 `THRESHOLD_LIVE` 時本測試跳過，`node --test` 不依賴外部網站。
把 fixture 任一日期改掉，線上比對即失敗。

**AC-7 — 本 feature 不動內容產線。**
Verified by: 施工前後比對 `src/data/discussions.json` 與 `src/data/history.json` 的 sha256，必須相同；
`git diff main...HEAD -- package.json` 中 `build` 指令不變；
`npx tsc --noEmit` 與 `npm run build` 皆通過。
任一產線檔案被改動或 `build` 被塞進抓取程式，即失敗。

## Test plan

- `tests/threshold-analysis.test.mjs`，`node --test`，離線。覆蓋 AC-1、AC-2、AC-4、AC-5。
  元件斷言以 `react-dom/server` 的 `renderToStaticMarkup` 取字串比對，不引入測試用瀏覽器。
- 同一檔的 `THRESHOLD_LIVE=1` 分支覆蓋 AC-6。預設跳過。
- `npx tsc --noEmit` 與 `npm run build` 覆蓋 AC-7 的型別與建置部分；sha256 比對以指令記錄於 stage report。
- 行動版行為以 `renderToStaticMarkup` 無法驗證。改為 `npm run dev` 下人工在 375px 與 1280px 各看一次，
  截圖附進 stage report。**不得只寫「已確認」而無截圖。**
- AC-3 為 captain 執行的朗讀測試，不在自動化測試內。

## 土黃色區起伏因素的交付形式

**交付形式：獨立段落，標題「土黃色區的起伏：看得出來的與看不出來的」，置於圖與 `EraComparisonStrip` 之下。**
不做圖上箭頭註解。理由見 `## Proposed approach` 的不採用選項。

段落內每一項以同一版面呈現四欄：事實陳述、依據、不確定的是什麼、誰能拍板。
`needsRuling` 非 null 的項目加一個可見的「待確認」標記，並寫出拍板者。

**這一節需要法學或史料判斷。** 以下候選項目的事實部分本階段已驗證，
但「這個因素是否解釋了那段起伏」全部未證。施工時照下表原文填入 `FACTORS`，不得改寫成因果句。

| id | 事實陳述（可查證） | basis | 不確定的是什麼 | needsRuling |
|---|---|---|---|---|
| `f1-1958-drop` | 1957 年 9 件，1958 年 2 件。1958-07-21 公布的司法院大法官會議法第 13 條第 1 項把解釋憲法門檻定為總額 3/4 出席、出席人 3/4 同意 | `statute` | 落差發生在換法同年，但本圖無法區分「門檻造成通不過」與「聲請量本身減少」。不受理與聲請件數不在 813 筆內 | `legal-reviewer` |
| `f2-ramp-precedes` | 案件量的回升自 1986 年起（1986:11、1988:13、1989:16、1990:22、1992:22、1993:21），全部早於 1993-02-03 的門檻變動。1987 年為 9 件，低於 1986 年 | `data` | 回升早於門檻變動這件事本圖可證。**造成回升的原因本圖不能證。** 會議記錄的「1987 降門檻→暴增」在時間順序上不成立，須確認會議原意是指其他事件 | `captain` |
| `f3-1994-peak` | 1994 年 37 件，為全期最高，出現在門檻放寬後第二年 | `data` | 尖峰是新門檻下積案一次消化、聲請量增加、或大法官組成變動，本圖無法分辨。三者皆未證 | `external-source` |
| `f4-1950-51-zero` | 1950、1951 兩年 0 件。釋字第 2 號（1949-01-06）與第 3 號（1952-05-21）之間相隔三年餘 | `data` | 空白的原因本圖不能證。沿革記載 1952-04-16 修正大法官會議規則第 8、12、15 條，該修正與空白期是否相關未證 | `legal-reviewer` |
| `f5-excluded-cases` | 813 筆是已作成的解釋，不含不受理與未受理的聲請。早期不受理案件缺乏公開紀錄 | `data` | 這是資料邊界，非因果。不受理件數若能取得，土黃色區的低谷可能有完全不同的解讀 | `null` |

`f5-excluded-cases` 的 `needsRuling` 為 `null`：它是資料定義，本票已可斷言，不必等外部拍板。
其餘四項皆需拍板，不得在網站上以肯定句呈現。

## 需外部拍板的項目

- **D1 — 1948 年規則期的門檻是否為「二分之一」。** 票內原文寫 1/2。
  全國法規資料庫的歷史條文只回溯到 1958-07-21，1948 年《司法院大法官會議規則》全文不在其中。
  本階段找不到第一手依據。
  處置：`rules` 期的 `evidence` 記為 `'unverified'`，`quotedText` 為 `null`，
  UI 顯示「門檻條文待確認」，**不得在網站上寫出「1/2」這個數字**。
  拍板者：慧婕或其他法學背景者，或取得該規則全文的史料來源。

- **D2 — 2022-01-04 到 2025-01-23 之間的門檻條文。** 憲法訴訟法 2019-01-04 公布全文、
  自公布後三年施行（2022-01-04），2025-01-23 才修正為 10 人 9 人。中間三年適用的是原始第 30 條。
  本階段未逐字抓取核對該版條文（`LawOldVer.aspx?pcode=A0030159&lnndate=20190104&lser=001` 可取得，
  但本階段未做）。
  處置：施工時先抓該版條文核對。若核對後仍有疑義，該段色帶留中性灰並標「未確認」。
  拍板者：施工者可自行抓取核對；條文解讀有疑義時才升級給法學背景者。

- **D3 — 會議記錄「1987」的原意。** `docs/meetup-chats/20260416 log.md` 與本票原文都寫 1987。
  慧婕投影片寫 1993。兩者不一致。
  處置：網站一律用 1993-02-03。但需 captain 向慧婕確認 1987 是否指解嚴，或指另一個本階段未掌握的事件。
  若確有 1987 年的相關事件，回 design 追加。
  拍板者：captain。

- **D4 — AC-3 的朗讀測試。** 需 captain 找 3 位非法學背景受測者執行。worker 無法自證。

以上四項不阻擋施工。D1、D2 已有明確的「未確認就留白」處置，D3、D4 在施工後處理。

- **D5 — 行動版與桌機的視覺檢查。** 375px 與 1280px 各看一次，需截圖。
  原列為 implement 的 checklist 項目，由 FO 於 2026-09-21 改派。
  **worker 做不到的原因（三項實測證據）：** 唯一可用的瀏覽器是 puppeteer cache 內的
  Chrome for Testing 147.0.7727.56，它在 worker 機器上連 `--dump-dom about:blank` 都
  `SEGV_ACCERR`（`--headless`、`--headless=old`、`chrome-headless-shell`、`--single-process`、
  關掉 sandbox 全部一樣）；`/Applications` 被 macOS TCC 擋住（`Operation not permitted`），
  沒有 Playwright cache；規格明文不得新增相依，因此不能裝 `puppeteer` 或 `playwright`。
  處置：由 captain 或任何有可用瀏覽器的人執行，截圖附回本票。
  **在此之前，行動版視覺行為視為未驗證。** implement 階段補的四條結構斷言驗的是機制
  —— 行動版字級數值、桌機長標籤不外洩到行動版、對照條的 grid 欄數、選取後展開的逐年清單
  —— **不是「看起來對」**。字級 26px 在 375px 下的實際可讀性、標籤有無互相重疊、
  色帶與長條的視覺對比，這幾件事只有人眼看得出來。
  拍板者：captain。
  **本項不阻擋進入 verify**，但 gate presentation 必須把它列為未達成的驗證項。

> **2026-09-21 補述：** 上面「以上四項不阻擋施工」寫於 D5 追加之前。
> D5 同樣不阻擋施工與進入 verify，但它是**未達成的驗證項**，不是已處置項。原句保留。

## Documentation impact

### 現在更新

- `docs/constitution-features/012-threshold-case-analysis.md`（本檔）：記錄已定方向、R1–R7 實跑證據、
  D1–D4 待拍板項。全部尚未實作，不得讀成已上線。
- `docs/INDEX.md`：本 feature 由裸種子票變為有規格的計畫。狀態為 `plan`，不得寫成已上線。

### 實作後更新

- `docs/project/architecture.md`：新增路由 `/past/thresholds` 進軌道一的資訊架構。
- `docs/project/design-system.md`：登記四條門檻色帶的色票與斜線網底的用途。
- `docs/project/tech-stack.md`：登記 `scripts/fetch-interpretation-counts.mjs` 為第二支人工執行的
  外部資料抓取程式，並明寫它不進 `build`、不碰 `src/data/*.json`。
- `AGENTS.md`：在「不要手改 `src/data/*.json`」一節補一句，說明
  `src/data/threshold-analysis.ts` 是手寫資料模組、來源為 `cons.judicial.gov.tw` 與 `law.moj.gov.tw`，
  與試算表同步無關。否則下一個 agent 會分不清哪個資料檔可以改。
- `docs/INDEX.md`：更新本 feature 狀態與最後查核日，並收錄新增文件。

### 不更新

- `docs/content-pipeline/design.md`、`docs/content-pipeline/data-collection-guide.md`：
  本 feature 的資料不經試算表 SSOT，與內容產線無關。
- `docs/health-check/2026-08-31-content-pipeline.md`、`docs/health-check/` 內其他 `record` 文件：歷史記錄，不改寫。
- `docs/health-check/TODO.md`：本 feature 不解決也不新增 TODO 上的項目。
- `docs/content-rescue/`：`record`，不改寫。
- `docs/_archive/`：封存記錄，不套用現行規格。
- `docs/constitution-features/README.md`：workflow 規格不因單一 feature 改變。
- `docs/meetup-chats/20260416 log.md`：會議記錄是 `record`。其中的 81 份與 1987 是當時的記錄，
  **不得回頭改寫**。更正寫在本檔的 `## Problem`。

## Out of scope

- 不做案件類型分類。那是 feature `016-case-keyword-classification`。
- 不處理不受理案件的資料取得。會議記錄 39:48 段指出早期不受理案件可能只存於紙本且屬秘密評議。
  本 feature 只在圖上寫明它不在資料內。
- 不斷言任何歷史因果。四項待拍板因素以候選形式呈現。
- 不把憲判字（2022 起）接成與釋字同一條曲線。兩序列分色、分序列標記。
- 不移除 `src/app/layout.tsx` 的 `noindex`。
- 不執行 `npm run sync-content`。
- 不改 `src/data/discussions.json`、`src/data/history.json`、`package.json` 的 `build`。
- 不引入圖表套件。

## Stage Report: design

- DONE: 定出這張 infographic 的具體規格：資料來源（會議提到的「司法院公開 81 份解釋案件資料」必須指名實際可取得的檔案或端點，不能只寫「司法院公開資料」）、年份分類方式、四個門檻調整點（1/2 → 3/4 於 1950s → 2/3 於 1987 → 現行 10 人 9 人）如何在時間軸上標示，以及元件階層、props 與桌機／行動版行為。規格要具體到另一個開發者不必再問就能實作。
  資料來源指名到端點：清單頁 `judcurrent.aspx?fid=2195`、明細頁 `docdata.aspx?fid=100&id={id}`、憲判字 `judcurrentNew1.aspx?fid=38`、法條 `law.moj.gov.tw` 的 `LawHistory.aspx` 與 `LawOldVer.aspx`（見 `## Risk evidence` R1–R6）。「81 份」經實跑證明為 813 筆。四個門檻點改用法規公布日，「1987」不成立（見 `## Problem`）。元件階層 11 個檔、props 六組介面、桌機／行動版行為與不做逐年觸控的理由都已寫定（`## Responsibilities and component hierarchy`）。
- DONE: 每項 acceptance criteria 寫成「做完之後世界應該是什麼樣子」並附可失敗的 `Verified by:`。其中至少一項要量測端值——讀者是否真的看見「門檻調整」與「案件量變化」之間的關聯——而不是只驗「圖有渲染出來」。
  七項 AC 各附 `Verified by:` 與明寫的可失敗改動。AC-3 為端值 AC：3 名非法學受測者、三道不提示的問題、至少 2 人答對的通過線；第 2 題（回升在門檻放寬之前或之後）直接量測讀者有沒有被錯誤因果誤導，答「之後」即不通過。AC-3 標為 `PENDING-CAPTAIN`，worker 不得自證。
- DONE: 釐清票內「需羅列土黃色區陡升陡降的可能因素」這項要求的交付形式（圖上註解／旁述文字／獨立段落），並判定它需不需要法學或史料判斷。若需要，明確標為需 captain 或外部權威來源拍板，**不得自行斷言歷史因果**。
  交付形式定為獨立段落，並在 `## Proposed approach` 寫明不採用圖上註解的理由（註解釘在 x 位置等於宣告因果）。五項候選因素中四項需拍板（`legal-reviewer` 兩項、`captain` 一項、`external-source` 一項），只有 `f5-excluded-cases`（資料邊界）本票可斷言。AC-4 以測試強制每項都有 `uncertainty` 與拍板者，並禁止圖元件 import `FACTORS`。
- DONE: 以最小實跑驗證「司法院公開解釋案件資料」是否存在於可程式取得的形式（Risk evidence 要求）。
  實際抓完 813 頁，0 筆缺漏，逐年彙總重現了慧婕投影片的曲線（尖峰 1994 年 37 件）。附帶查出三件實跑才會知道的事：釋字第 813 號的 `id` 不符 `N + 310181` 通式；`發布日期` 已是西元不需民國年換算；該站 TLS 憑證缺 Subject Key Identifier，Python `urllib` 連不上、Node `fetch` 與 `curl` 可以。
- DONE: 將文件影響分成 `現在更新`、`實作後更新` 與 `不更新`，每一節都列出文件。
  `## Documentation impact` 三節共 13 筆，含明文不改寫 `docs/meetup-chats/20260416 log.md`（`record`，其中的 81 份與 1987 是當時記錄，更正寫在本檔 `## Problem`）。
- SKIPPED: 取得 1948 年《司法院大法官會議規則》的門檻條文原文。
  全國法規資料庫的歷史條文只回溯到 1958-07-21（`LawOldVerList.aspx?pcode=A0030159` 僅四個版本）；票內「1/2」目前無第一手依據，列為 D1，處置為 UI 顯示「門檻條文待確認」且不寫出「1/2」。
- SKIPPED: 逐字核對 2022-01-04 至 2025-01-23 之間憲法訴訟法原始第 30 條的門檻。
  端點已確認可取得（`LawOldVer.aspx?...&lnndate=20190104&lser=001`），但本階段未抓。列為 D2，施工時先抓核對；仍有疑義則該段色帶留中性灰標「未確認」。

### 驗證

- `npx tsc --noEmit` 通過（exit 0，無輸出）。
- `npm run dev` 啟動成功：`✓ Ready in 808ms`（Next.js 16.1.6 Turbopack）。
- 未執行 `npm run sync-content`。未改 `src/data/`、`package.json` 或任何程式碼；本階段只改本檔一個 markdown。
- 每一項 PROVEN 證據皆為實跑，重現步驟寫在 `### R3b`，不依賴本機任何設定。

### Summary

本票原是裸種子票，現補成可施工規格。過程中實跑推翻了會議記錄的三項前提：解釋案件是 813 筆不是 81 份；
門檻降為三分之二的公布日是 1993-02-03 不是 1987；案件量回升自 1986 年開始，早於門檻變動，1987 年當年
（9 件）還低於 1986 年（11 件）。規格因此不照會議敘事做，改為呈現可查證的計數與可查證的公布日，
讓讀者自己看出關係，並以 AC-3 的朗讀測試量測讀者有沒有被錯誤的因果順序誤導。

四項需外部拍板的事項（D1 規則期門檻無第一手依據、D2 中間三年條文未核對、D3 會議「1987」的原意、
D4 朗讀測試）都不阻擋施工，D1／D2 已定「未確認就留白」的處置。土黃色區起伏的五項因素中四項需拍板，
一項（資料不含不受理案件）本票可斷言且必須寫在圖上。

需要 captain 注意的一件事：本規格與 0416 會議的口述內容不一致，且不一致的地方是會議記錄錯了。
建議向慧婕確認 1987 的原意（D3）。

## Stage Report: implement

- DONE: `/past/thresholds` 路由與規格列出的元件依 `## Responsibilities and component hierarchy` 落地並實際渲染
  11 個元件全數建立，另加 `ChartText.tsx`（行動版字級，理由見下）。`npm run dev` 下 `/past/thresholds`、`/past`、`/future` 三條路由皆回 200 並編譯無誤；`npm run build` 把 `/past/thresholds` 列為靜態預渲染頁。commit `2afef7d`。
- DONE: `npx tsc --noEmit` 與 `npm run build` 皆離開碼 0
  兩者各跑兩次（加行動版字級之前與之後）皆 0。`npx eslint` 對本票全部檔案 0 error。
- DONE: `src/data/discussions.json` 與 `src/data/history.json` 的 sha256 與 main 相同
  建置前後與 main 的 git blob 三方相同：`discussions.json` = `4071978a…3162`，`history.json` = `4d1992e3…cea3b`。`git status` 自始至終未列出這兩個檔。`git diff main...HEAD -- package.json` 為空，`build` 仍是 `next build`。
- SKIPPED: 行動版行為在 `npm run dev` 下於 375px 與 1280px 各人工看一次並把截圖附進 stage report
  **本項由 FO 誤派給 worker，已重新指派給 captain 執行，追蹤於 `## 需外部拍板的項目` 的 D5。** 改判為 SKIPPED 由 FO 授權（見下方「### FO 授權的改判」）。**改判的意思是換人做，不是做完了——視覺檢查未完成、未確認。** 原判為 FAILED，失敗證據逐字保留於下：
  **本機無法產生截圖。** 唯一可用的瀏覽器是 puppeteer cache 內的 Chrome for Testing 147.0.7727.56，它在本機連 `--dump-dom about:blank` 都 `SEGV_ACCERR`（`--headless`、`--headless=old`、`chrome-headless-shell`、`--single-process`、關掉 sandbox 全部一樣）。`/Applications` 被 macOS TCC 擋住（`Operation not permitted`），沒有 Playwright cache，且規格明文不得新增相依。**不寫「已確認」。** 視覺檢查留給有可用瀏覽器的人執行。
- DONE: 補上四條可自動驗證的行動版／桌機結構斷言，代替不了視覺檢查，但把機制本身驗起來
  `tests/threshold-analysis.test.mjs` 新增四條：x 軸桌機 26 個年份刻度／行動版 8 個且字級 ≥ 20；門檻分界線桌機帶門檻一句話、行動版只留 4 位數公布年份且長句不重複出現；`EraComparisonStrip` 為 `grid-cols-1 md:grid-cols-4`；選取某期後展開 29 個 `<dt>` 且含 `1994 → 37`。把行動版字級改回 10、或把桌機長句漏進行動版，這四條會失敗。
- DONE: `tests/threshold-analysis.test.mjs` 以 `node --test` 離線通過，覆蓋 AC-1／AC-2／AC-4／AC-5
  21 pass／0 fail／1 skip（skip 者為 AC-6，未設 `THRESHOLD_LIVE`）。AC-6 另以 `THRESHOLD_LIVE=1` 實跑通過（250 秒，813 頁全部重抓）：清單頁仍解析出 813 個無缺號釋字、每筆 `id` 與 `發布日期` 與 fixture 相同、釋字第 813 號的 `id` 仍為 `325335`。
- DONE: AC-1 的 1987 掃描用規格指定的兩條正規式，不是純字串 grep
  掃 `src/app/past/thresholds/`、`src/components/threshold-analysis/`、`src/data/threshold-analysis.ts` 全部原始碼，比對 `/1987[^0-9]{0,12}(門檻|三分之二|降|放寬)/` 與反向式皆無命中，另斷言 `YEARS` 的 1987 年仍為 9 件（否則兩條式子就是空轉）。**實跑可失敗性**：在資料模組插入註解「1987 年門檻降至三分之二」後，該測試立刻由 ✔ 轉 ✖，其餘 20 條仍過；移除後回復全過。
- DONE: AC-2 的斷言全部自 fixture 的 813 筆原始日期重算
  三期件數 79／233／501（和 = 813）、年均 8.3／6.7／17.3、倍率 `0.81×` 與 `2.57×`、邊界年 1958 = 0/2 與 1993 = 1/20、尖峰 1994 年 37 件，全部先由 fixture 重算再與資料模組比對。分母日數 3483／12616／10552 也由 fixture 的日期邊界反推核對。**實跑可失敗性**：把 1993 改成整年歸雙四分之三期（21/0），AC-2 的四條測試同時由 ✔ 轉 ✖；改回後全過。另斷言渲染輸出不含 `2.58×`，擋住「先進位再相除」的錯誤算序。
- DONE: D1 依規格處置 —— UI 顯示「門檻條文待確認」且不寫出「1/2」
  `rules` 期 `evidence: 'unverified'`、`article`／`quotedText`／`sourceUrl` 皆 `null`、`ruleSummary` 為「門檻條文待確認」。測試斷言 `EraComparisonStrip` 的渲染輸出含「未確認」且**不含**「1/2」與「二分之一」。已實跑確認沿革頁只記載 1948-09-16 制定公布全文 21 條，條文內容不在全國法規資料庫（`LawOldVerList.aspx?pcode=A0030159` 仍只有 19580721／19930203／20190104／20230621 四版）。D1 維持待拍板。
- DONE: D2 已抓 `LawOldVer.aspx?...&lnndate=20190104&lser=001` 逐字核對，**疑義已解除**
  第 30 條原文：「判決，除本法別有規定外，應經大法官現有總額三分之二以上參與評議，大法官現有總額過半數同意。」另查 2023-06-21 版第 30 條逐字相同，因此 2022-01-04 至 2025-01-23 全段適用同一條，無疑義。**該段色帶因此不標「未確認」**，但仍為中性灰加斜線網底 —— 理由改為「該段沒有釋字可計」，不是「條文未確認」。條文全文與來源連結顯示在 `SeriesBoundaryNote`。
- DONE: 土黃色區五項因素各帶 `uncertainty` 與拍板者，且圖元件不 import `FACTORS`
  `FACTORS` 五項：四項 `needsRuling` 非 null（`legal-reviewer` 2、`captain` 1、`external-source` 1），`f5-excluded-cases` 為 null。測試斷言每項 `uncertainty` 長度 ≥ 15、`basis !== 'none'` 者 `basisRef` 非空、渲染時待確認徽章數恰等於待拍板項數（只數 `>待確認</span>`，不數段落說明文字）。另對 `ThresholdChart`、`ThresholdBand`、`ThresholdBoundary`、`SeriesBreakLine`、`ChartAxes`、`ChartText` 六個檔去掉註解後斷言不含 `FACTORS` 字樣。
- DONE: AC-5 的無資料標示
  `current` 期 `meanPerYear === null`、`totalCount === 0`，渲染輸出含 `<pattern id="threshold-hatch">`、`fill="url(#threshold-hatch)"` 與字串「無釋字資料」。另斷言把憲判字年份全部灌成 999 件，四期統計一字不變 —— 憲判字確實不進任何時期的年均。
- SKIPPED: AC-3 朗讀測試
  記為 `PENDING-CAPTAIN`。需 captain 找 3 位非法學背景受測者執行，worker 無法自證，也未以任何替代方式宣稱達成。
- DONE: `## Documentation impact` 的 `### 實作後更新`
  `docs/project/architecture.md` 加入 `/past/thresholds` 到軌道一的 IA 圖與說明；`docs/project/design-system.md` 登記四條色帶色票、斜線網底的固定語意、行動版字級規則；`docs/project/tech-stack.md` 以**追加補述**方式登記第二支人工抓取程式（不改寫已標過時的資料流章節）；`AGENTS.md` 在「不要手改 `src/data/*.json`」一節補上「`.json` 不要手改、`.ts` 可以改」的判斷方式。
- SKIPPED: `docs/INDEX.md` 更新
  本階段沒有新增任何 `.md` 文件，而 `INDEX.md` 索引到資料夾層級、不索引個別 feature 票，因此沒有可加的列。`constitution-features/` 那一列寫的是票數快照，`AGENTS.md` 明文不建議把會漂移的快照寫進 evergreen 文件，未擅自改動。

### FO 授權的改判（2026-09-21）

上面「375px／1280px 人工視覺檢查」一項，原判 FAILED，現改判 SKIPPED。**本次改判由 FO 授權。**

FO 給的理由摘要：該 checklist 項目是 FO 誤派——dispatch 假設 worker 環境有可用瀏覽器，
事實不是這樣。worker 拒絕假通過、並完整記下三項失敗證據，處置正確。
階段守門以 `FAILED item ... is unresolved` 擋住推進，解法不是讓該項消失，
而是**改派給有可用瀏覽器的人執行**，與 AC-3 朗讀測試同一類。

本輪據此只做兩件事：改判該項並保留原證據逐字不動、在 `## 需外部拍板的項目` 追加 D5。
FO 明文指示其餘七項規格偏離與淨行數超標本輪一律不動，交由 verify／review 裁量，
因此下一節原文保留，未做任何辯護性修改或刪減。

本輪的 `git diff` 只有本檔一個檔案。未動任何程式碼、資料或 `package.json`，
未執行 `npm run sync-content`，未改動任何 acceptance criteria 的文字。

### 超出容差與規格偏離（需 gate 裁量）

1. **淨行數超出容差。** 規格估 +1380、容差 828–1932，實際 `git diff --shortstat main...HEAD` 為 **+2611／−2**。主要來自兩處：測試檔 507 行（估 180）、資料模組 473 行（估 230，78 個年份各一列物件，為了讓數字進 PR diff 受人工審閱）。另有兩個估算表沒有的檔：`ChartText.tsx` 55 行、`tests/tsx-loader.mjs` 71 行。沒有為了對齊估算而刪減測試。
2. **新增 `ChartText.tsx`（不在元件階層表內）。** 規格定的單一 SVG（`viewBox="0 0 960 420"`）在 375px 螢幕上縮放比約 0.32，桌機的 10px 字到手機只剩 3.2px，等於看不見。`ChartText` 同時輸出桌機與行動版兩套字級（行動版 26px），行動版另隱藏放不下的長標籤（制度換軌說明、右端引線註解），其內容在 `SeriesBoundaryNote` 有完整文字版。規格的「圖等比縮小」仍成立，改的只是字級。
3. **新增 `tests/tsx-loader.mjs`。** 專案沒有測試框架，規格又明文不新增相依。本檔只用已在 `devDependencies` 的 `typescript` 做語法轉譯，並解析 `@/` 別名，不裝任何東西。`package.json` 未動。
4. **`INTERIM_SEGMENT` 不是第五個 `ThresholdEra`。** D2 解除後，2022-01-04 至 2025-01-23 有了第一手條文，但 AC-1 斷言「四個 `effectiveFrom` 恰為 …」，加第五期會改動 AC，而 AC 只有 captain 能改。因此該段以獨立的 `StatuteSegment` 落地：圖上照樣畫一條色帶，條文與來源進 `SeriesBoundaryNote`，四期的 id 與 AC-1 不變。
5. **`f2-ramp-precedes` 的 `uncertainty` 文字微調。** 規格表的原文含「1987 降門檻」，那一串會直接命中 AC-1 的正規式 `/1987[^0-9]{0,12}(門檻|三分之二|降|放寬)/`，兩條規格自相矛盾。改寫為「會議記錄說 1987 年那次修法把表決條件改低、並因此造成案件暴增；實際的修法公布日是 1993-02-03，且案件量自 1986 年起已在回升，會議的時間順序不成立。」語意不變，仍不是因果句，也仍指出會議說法的時間順序不成立。
6. **規格的 `print.css` 前提不成立。** `## 視覺` 寫「`print.css` 存在，圖會被列印」。repo 內唯一的 CSS 是 `src/app/globals.css`，沒有任何 `@media print` 規則（`src/app/present/[id]/page.tsx:51` 只呼叫 `window.print()`）。長條的兩個序列色 `#111827` 與 `#D32F2F` 明度差仍足以在灰階下區分，但列印樣式本身不存在。
7. **`fixture` 存的是三元組而非二元組。** 規格寫 `[釋字號, 發布日期]`，實際存 `[釋字號, 明細頁 id, 發布日期]`。多存 `id` 是為了讓 AC-6 能逐筆核對「`id = N + 310181` 的例外仍在」，而不是只斷言第 813 號一筆。是規格形狀的超集，21348 bytes 單行。

### Summary

`/past/thresholds` 已可渲染：1949–2026 的年度長條圖、四條門檻色帶、四條公布日分界線、
2022-01-04 的制度換軌虛線，加上時期對照條、資料邊界說明與五項候選因素段落。
數字全部由重新抓取的 813 筆發布日期算出，AC-1／AC-2 兩組最關鍵的斷言都實跑做過可失敗性驗證。
D2 在本階段解除：抓到 2019-01-04 版憲法訴訟法第 30 條逐字核對，2023-06-21 版相同，
因此 2022–2025 那段不再標「未確認」。D1 維持未確認，UI 不寫出規則期的通過人數。

兩件需要 gate 裁量：**行動版視覺檢查沒做**（本機 Chrome 連 `about:blank` 都 SEGV，
`/Applications` 被 TCC 擋住，規格又不准新增相依），只補了四條結構斷言，不宣稱視覺已確認；
以及**淨行數 +2611 超出 828–1932 的容差**，主要是測試與逐年資料列，未為了對齊估算而刪測試。
AC-3 朗讀測試記為 `PENDING-CAPTAIN`。

**2026-09-21 補述：** 上一段第一件事（行動版視覺檢查）已由 FO 授權改判為 SKIPPED
並改派給 captain，追蹤於 D5。**改派不等於做完——它仍是未達成的驗證項。**
原句保留。詳見上方「### FO 授權的改判」。

## Stage Report: verify

- DONE: 對外部權威來源逐項查核圖上與資料模組的全部事實斷言，不採信 fixture 的自我一致
  **四個公布日**逐字取自 `LawHistory.aspx?pcode=A0030159`：民國 37/09/16、47/07/21、82/02/03、114/01/23 = `1948-09-16`／`1958-07-21`／`1993-02-03`／`2025-01-23`，四項全中。**四段條文原文**與資料模組位元組逐字相符（程式比對 `src.includes(quotedText)` 四項全 true）：1958 第 13 條第 1 項、1993 第 14 條第 1 項、現行第 30 條第 2 項、D2 的 2019 版第 30 條；2023-06-21 版第 30 條與 2019 版逐字相同，D2 的「全段適用同一條」成立。**813 筆**為線上重抓實證，非採信 fixture：清單頁解析出 813 個相異釋字號、範圍 1–813、缺號 0，且 fixture 全部 813 筆的 `id` 與線上清單一一相符（0 筆不符），釋字第 813 號 `id=325335` 的通式例外仍存在（唯一例外）。另抽樣 34 筆明細頁實抓發布日期，與 fixture **34/34 相符**，每頁各自回報「共 813 筆」。
- DONE: 三期件數 79／233／501、年均 8.3／6.7／17.3、倍率 `0.81×` 與 `2.57×`、尖峰 1994 年 37 件、邊界年 1958 = 0/2 與 1993 = 1/20
  全部由 fixture 的 813 筆原始日期**獨立重算**（未讀測試檔），結果：79/233/501（和 813）、日數 3483/12616/10552、年均 8.2843/6.7455/17.3414 → 8.3/6.7/17.3、倍率 0.8143→`0.81×`、2.5708→`2.57×`（先進位再相除得 2.5821，證實算序斷言有鑑別力）、尖峰 1994 = 37、1958 = 0/2、1993 = 1/20。三期邊界另有線上佐證：釋字第 79 號 = 1957-10-07、第 80 號 = 1958-11-26、第 312 號 = 1993-01-29、第 313 號 = 1993-02-12，四筆皆實抓，故 79/233/501 的切點落在正確位置。資料模組 `YEARS` 全 78 列與獨立重算**0 筆不符**；憲判字 20/20/11/1/6 線上重抓確認且各年編號無缺號，2026 正確標 `complete: false`。
- DONE: 判定 D1（規則期無第一手依據）的「不寫出 1/2、顯示待確認」處置是否誠實
  **處置誠實，但其前提已被本階段推翻——見下方 V1。** 誠實的部分：規則期 `evidence: 'unverified'`、三個欄位皆 `null`、`ruleSummary: '門檻條文待確認'`，且掃遍 shipped 表面無「1/2」「二分之一」（唯一命中是 Tailwind 的 `-translate-x-1/2`，CSS transform 非內容）。**不寫 1/2 這個決定經查是對的**：實際條文是「三分之二以上出席 + 過半數之同意」，寫 1/2 會是錯的。
- DONE: 執行本 stage 的具名 placeholder 掃描
  對本票 24 個變更檔全數掃 `某學者`／`某大學法律系`／`test`／`lorem ipsum`／`快速了解最新判決的5個重點`／`某某`／`TODO`／`FIXME`／`placeholder`／`範例`／`dummy`／`sample`／`foo`／`bar`。**shipped 檔案 0 筆佔位值。** 全部命中皆為誤報並逐一確認：`AGENTS.md` 的命中是禁令條文本身（且該段非本票新增）、`src/app/past/page.tsx:464` 的 `placeholder=` 是既有搜尋框 HTML 屬性、`ThresholdChart.tsx` 的 `BAR_W`／`bar-` 是長條寬度變數。重點檔 `src/data/threshold-analysis.ts` 與 `tests/fixtures/interpretation-dates.json` 逐項核對來源後無設計文件樣本資料混入：資料模組的 `ERAS`／`FACTORS`／`SERIES_BOUNDARY_NOTES` 全部對應到已實抓的一手來源或已驗證的計數。
- DONE: 確認 `src/data/discussions.json`／`history.json` 與 main 位元組相同
  sha256 三方相同且**建置後再測一次仍相同**：`discussions.json` = `4071978a…3162`、`history.json` = `4d1992e3…cea3b`。`git diff main...HEAD` 對兩檔與 `package.json` 皆為空，`package.json` 與 main **完全相同**（`diff` 無輸出），`build` 仍是 `next build`。`scripts/fetch-interpretation-counts.mjs` 只寫 `tests/fixtures/`（`writeFileSync` 唯一目標），且未被 `package.json` 任何 script 引用。`npx tsc --noEmit` exit 0、`npm run build` exit 0（`/past/thresholds` 列為靜態預渲染）、`node --test` 21 pass／0 fail／1 skip。AC-7 全部成立。
- DONE: 逐項判定七項規格偏離與兩件 gate 裁量事項
  逐項結論見下方「### 七項規格偏離的判定」與「### 兩件 gate 裁量事項的判定」。七項全部**可接受**，無一越過封包邊界，**無一實質改動任何 AC**。
- FAILED: 行動版視覺檢查（D5）—— 本階段同樣無法執行，如實記錄，不假通過
  **本 verify 環境與 implement 環境同樣沒有可用瀏覽器**，失敗可獨立重現：`Google Chrome for Testing 147.0.7727.56` 與 `chrome-headless-shell` 連 `--dump-dom about:blank` 都崩，實測輸出逐字為 `Received signal 11 SEGV_ACCERR`；`ls /Applications` 回 `Operation not permitted`（TCC）；無 Playwright cache；`node_modules` 無 puppeteer／playwright 且規格不准新增相依。**因此 375px／1280px 的視覺行為在本階段仍屬未驗證**，D5 維持為未達成的驗證項，gate presentation 必須照 D5 原文列出。
- SKIPPED: AC-3 朗讀測試
  維持 `PENDING-CAPTAIN`。需 captain 找 3 位非法學背景受測者執行。**本階段未以任何替代方式宣稱達成，也未代為判定通過。**

### D5 四條結構斷言的可失敗性（實跑）

在 worktree 外的複本上做突變（**候選位元組與 git HEAD 全程未動**），每次突變後跑 `node --test`：

| 突變 | 結果 |
|---|---|
| 行動版刻度字級 `fontSize="26"` → `"10"`（dispatch 指名的例子） | **轉紅**：「行動版與桌機各有一套 x 軸年份刻度，數量不同」 |
| `ThresholdBoundary` 桌機 `<g className="hidden md:block">` 去掉限制（長標籤外洩到行動版） | **轉紅**：「門檻分界線：桌機帶門檻一句話，行動版只留公布年份」 |
| 對照條 `grid-cols-1 md:grid-cols-4` → `grid-cols-4 md:grid-cols-4` | **轉紅**：「EraComparisonStrip 桌機四格橫排，行動版直向堆疊」 |
| 展開清單 `<dt>` → `<span>` | **轉紅**：「行動版選取某期後展開該期逐年件數清單」 |
| `ThresholdChart` 傳給 `ChartAxes` 的 `mobileEvery={10}` → `{3}` | **全綠，未被抓到** |
| 同上 `desktopEvery={3}` → `{25}` | **全綠，未被抓到** |

判定：**四條斷言都真的可失敗**，不是恆真的空轉，implement 的「把行動版字級改回 10 會失敗」屬實。但覆蓋邊界要講清楚：測試是拿**自己準備的 props 單獨渲染 `ChartAxes`**，驗的是元件**做得到**，不是頁面**真的這樣接**。刻度密度的接線無人看守——把行動版改成每 3 年一個 26px 數字（375px 下必然重疊糊成一片）21 條測試全綠。**這正好是 D5 要人眼看的那一類問題，因此 D5 不可因為「已有四條結構斷言」而被讀成已覆蓋。**（`ThresholdChart` 整條 `ThresholdBoundary` 拿掉會被 AC-5 抓到，接線並非全無看守。）

### V1 — D1 的前提被推翻：規則期門檻其實查得到一手條文（Material／Needs decision）

本階段在**另一個 pcode** 找到了 design 與 implement 都找不到的東西。`A0030159` 的歷史條文只回溯到 1958-07-21（已複驗，`LawOldVerList` 仍只有四版），但《司法院大法官會議規則》在全國法規資料庫另有**獨立的廢止法規紀錄 `pcode=A0030300`**，發布日期民國 37 年 09 月 16 日、廢止日期民國 107 年 07 月 31 日，**全文 21 條可取得**。

其第 12 條原文（實抓）：「大法官會議開會時，須有在中央政府所在地全體大法官三分之二以上出席。如為決議，須有在中央政府所在地全體大法官過半數之同意。可否同數，取決於主席。」

必須連帶講清楚的限制：第 12 條**正是 1952-04-16 修正的三條之一**（`LawHistory.aspx?pcode=A0030300` 記載修正第 8、12、15 條），而 `LawOldVerList.aspx?pcode=A0030300` 回「查無資料」，故上列文字是**1952-04-16 版**，不是 1948-09-16 原始版。原始版條文仍未取得。就資料而言這個區分影響很小：規則期 79 筆中有 **77 筆**（1952 年 10 筆起算，釋字第 3 號為 1952-05-21，晚於修正日）落在已可查證的 1952 版之下，只有釋字第 1、2 號（皆 1949-01-06）落在未取得的原始版之下。

四項證據欄位：

- **已發布使用者與正常流程**：讀者開啟 `/past/thresholds`（已建置、已預渲染的正式頁面），看規則期色帶與對照條該格。
- **可觀察的損害**：頁面對整個規則期顯示「門檻條文待確認」，讀者被告知該期門檻不可考；實際上規範該期 77/79 件的條文有一手來源可引。頁面**低報了已知的事實**。另一層影響：AC-3 第 1 題要讀者連起「門檻較高→案件較少」，而規則期年均 8.3 件為三期最高、其門檻（2/3 出席＋過半數同意）**低於**次期的 3/4＋3/4——這個支持該敘事的事實目前被藏起來。
- **受影響的價值 AC 或不可逾越邊界**：D1 本身；AC-1 的「`evidence === 'primary-source'` 的三期」（測試寫死 `assert.equal(primary.length, 3)`，規則期一旦補上一手依據即為四期，該斷言會紅）。
- **觸發證據**：`LawAll.aspx?pcode=A0030300` 回傳第 12 條全文（HTTP 200）；`LawHistory.aspx?pcode=A0030300` 列出 1948-09-16 制定／1952-04-16 修正第 8、12、15 條／2018-07-31 廢止；`LawOldVerList.aspx?pcode=A0030300` 回「查無資料」，證明可取得者為 1952 版。三個 URL 皆本階段實抓。

分別提出（**本階段只做唯讀調查，未動任何候選位元組，未改 AC，未重跑 reviewer**）：

- **Materiality：Material。** 四項欄位齊備，且指向 D1 與 AC-1。
- **Task ownership：不屬本票 implement 所有 → Needs decision。** 補上規則期的 `article`／`quotedText`／`sourceUrl` 會使 `evidence` 變 `'primary-source'`，直接推翻 AC-1 寫死的「三期」斷言；依 README 的 `## Review-finding disposition` 第 5 條，**只有 captain 能改 AC**。且 D1 原就把拍板者定為「慧婕或其他法學背景者，或取得該規則全文的史料來源」——本階段供上了史料來源，但「在中央政府所在地全體大法官」這個限定語如何解讀、以及 1949 年兩筆要不要另作處置，仍需法學背景者判斷。
- **Disposition 建議：route for decision（captain＋法學背景者），不要在本輪改碼。** 與 D1／D3／D4／D5 一起進 gate。若 captain 決定採納，建議連帶授權修改 AC-1 的「三期」斷言為「四期」，否則 implement 無法在不破 AC 的情況下施工。

**這一項不是 implement 的錯。** implement 逐字執行了規格的 D1 處置，處置本身也沒有講出任何錯話；缺口出在 design 階段只查了 `A0030159`。

### 七項規格偏離的判定

1. **淨行數超標——判定為「估算漏列」，不是 scope creep。** 實測 `+2707/−3`（含本票 95 行流程記錄；不含則 +2609，與 implement 自報的 +2611 相符）。逐檔比對估算表：**19 個檔有 14 個超出，但幅度都小（+8～+80）**，這是估算系統性偏低的形狀，不是加了東西的形狀。超出量 1122 行中 570 行（51%）來自兩個檔，而兩者的體積都由規格自己決定：測試檔 507 vs 估 180（要蓋 7 條 AC 加 4 條結構斷言），資料模組 473 vs 估 230（規格要求 78 個年份一年一列且「讓數字進 PR diff 受人工審閱」，78 列就佔 78 行，加上規格自己寫死的型別區塊約 50 行）。估算表未列的只有兩個檔共 126 行（`tsx-loader.mjs` 71、`ChartText.tsx` 55），兩者皆已揭露且有理由。**實質檢查無 scope creep 跡象**：新程式碼沒有任何 runtime `fetch`／`localStorage`／analytics／計時器，import 只有 `react` 與 `next/link`，未新增相依，`package.json` 與 main 完全相同，且沒有為對齊估算而刪測試（21 條測試蓋滿 7 條 AC 可佐證）。文件 66 行 vs 估 60，準確。**可接受。**
2. **新增 `ChartText.tsx`。** 理由成立且已實測：單一 viewBox 960 在 375px 下縮放比約 0.32，桌機 10px 字剩 3.2px。規格的「圖等比縮小」未被推翻，改的只是字級，且行動版隱藏的長標籤在 `SeriesBoundaryNote` 有完整文字版（已讀確認）。未改任何 AC。**可接受。**
3. **新增 `tests/tsx-loader.mjs`。** 已驗證未新增相依：只 import `node:module`／`node:fs`／`node:path`／`node:url` 與 `typescript`，而 `typescript` 在 **main 的 `devDependencies` 即為 `^5`**（已查 main 的 `package.json`），且 `package.json` 與 main 完全相同。規格「不新增相依」未被違反。**可接受。**
4. **`INTERIM_SEGMENT` 不做第五個 `ThresholdEra`——判定為正確的封包邊界處理。** 已讀 AC-1 兩條測試，確認仍是 `ERAS` 恰四個 `effectiveFrom` 與 `primary.length === 3`，`INTERIM_SEGMENT` 是另一個 export，**完全未觸及這兩條斷言**。這正是 README 第 5 條要的做法：發現規格外的事實時，不自行改 AC，而是把事實放在 AC 之外並交代。**可接受，且是本票處理得最好的一項。**
5. **`f2-ramp-precedes` 文字改寫——判定為語意未弱化，且規格自相矛盾屬實、implement 還少報了一處。** 實跑兩條 AC-1 正規式：規格原文的 `uncertainty`「1987 降門檻」**命中** `/1987[^0-9]{0,12}(門檻|三分之二|降|放寬)/`；規格原文的 `claim`「門檻變動。1987」也**命中**反向式 `/(門檻|三分之二|降|放寬)[^0-9]{0,12}1987/`。**兩個欄位都與 AC-1 衝突，implement 只揭露了 `uncertainty` 一個。** 語意判定：改寫後的文字把結論「會議的時間順序不成立」逐字保留，並**額外補上兩項支撐事實**（實際公布日 1993-02-03、回升自 1986 年起），且把會議說法明確標成引述（「會議記錄說……」）後立刻否證。**是加強，不是悄悄弱化。** 頁面並未主張 1987 年改過門檻，AC-1 的立法目的仍達成。附帶查核 `f2` 引用的數字全部正確（1986:11、1988:13、1989:16、1990:22、1992:22、1993:21、1987:9 < 1986:11），`f4` 引用的 1952-04-16 修正第 8、12、15 條亦經沿革頁確認。**可接受**（另見下方 V3 的一項小瑕疵）。
6. **`print.css` 前提不成立——判定為 implement 揭露正確。** 已複驗：repo 內唯一 CSS 是 `src/app/globals.css`，全 repo `@media print` 命中 0，無 `print.css` 檔。規格 `## 視覺` 的前提確實是錯的，這是 design 的事實錯誤，非 implement 的偏離。兩序列色 `#111827`／`#D32F2F` 明度差仍足以灰階區分。**可接受。**
7. **fixture 存三元組——判定為有實益的超集。** 已讀 AC-6 測試確認第三個元素真的在用：它對**全部 813 筆**逐筆比對 `id`，不只斷言第 813 號一筆。本階段獨立重跑等效檢查，813 筆 `id` 全中。是嚴格加強 AC-6 的鑑別力。**可接受。**

### 兩件 gate 裁量事項的判定

- **淨行數超標** — 判定「估算漏列」，可接受。理由與逐檔數據見上第 1 項。處置與 scope creep 不同之處在於：不需要 implement 刪任何東西，也不需要 captain 追認新增範圍；只需 gate 知道容差是拿一個低估的基數算出來的。
- **行動版視覺檢查 FAILED 的處置** — **判定處置誠實。** implement 拒絕假通過、逐字保留三項失敗證據、明寫「改判的意思是換人做，不是做完了」，並在 Summary 與 D5 兩處加補述不改寫原句，符合 `AGENTS.md` 的「不要悄悄改寫原文」。本階段獨立重現了同一個崩潰（`Received signal 11 SEGV_ACCERR`），失敗證據為真、非藉口。四條結構斷言經突變實測確認真的可失敗（見上表）。**但 D5 仍是未達成的驗證項**，且刻度密度接線無測試看守，gate 不得把四條斷言讀成視覺檢查的替代品。

### Verdict

**PASSED**，附一項 Material／Needs decision 的 finding（V1）與兩項未達成的驗證項。

理由：shipped 表面上每一條可對外部權威查核的事實斷言都正確——四個公布日逐字相符、四段條文逐字相符、813 筆與全部 813 個 `id` 線上重抓相符、34 筆日期抽樣全中、78 列逐年計數與獨立重算 0 筆不符、三期件數與年均與倍率與兩個邊界年全部獨立重算相符、憲判字五年計數線上相符。具名 placeholder 掃描在 shipped 檔案 0 命中。內容產線兩檔建置前後皆與 main 位元組相同，`package.json` 與 main 完全相同。七項規格偏離全部可接受，**無一實質改動任何 AC**，其中第 4 項是遇到規格外事實時的正確做法。第 5 項的改寫經正規式實跑與語意比對判定為加強而非弱化，且查出規格自相矛盾之處比 implement 自報的多一處。淨行數超標判定為估算漏列，非 scope creep。

不判 REJECTED 的理由：V1 雖為 Material，但頁面**沒有講錯任何事**——「門檻條文待確認」對 1948–1952 那段為真，且規格明令的「不寫出 1/2」經查證是對的決定（實際條文為 2/3 出席＋過半數同意，寫 1/2 會錯）。implement 逐字執行了已核准的規格，缺口在 design 只查了一個 pcode；而修補它必須改 AC-1 寫死的「三期」斷言，依 README 第 5 條只有 captain 能改。把它退回 implement 會逼 implement 在「破 AC」與「什麼都不能做」之間二選一，是錯的路由。正確路由是與 D1 併案上呈 captain。

**PASSED 的範圍僅限於「事實查核通過且偏離可接受」，不等於本 feature 已完整驗證。** 兩項未達成的驗證項必須在 gate 原樣呈現：**D5 行動版／桌機視覺檢查**（本階段環境同樣無可用瀏覽器，已如實記錄失敗證據，未假通過；且刻度密度接線無測試看守）與 **AC-3 朗讀測試**（維持 `PENDING-CAPTAIN`，未代為宣稱達成）。

### Summary

對外部權威來源逐項查核完畢：四個門檻公布日與四段條文原文（含 D2 的 2019 版第 30 條）逐字相符，813 筆總數、全部 813 個明細頁 `id`、憲判字五年計數皆線上重抓實證，另抽樣 34 筆發布日期全中；三期件數 79／233／501、年均 8.3／6.7／17.3、倍率 `0.81×`／`2.57×`、尖峰 1994 年 37 件與兩個邊界年切分全部自 813 筆原始日期獨立重算相符，78 列逐年計數 0 筆不符。具名 placeholder 掃描於 shipped 檔案 0 命中，內容產線兩檔建置前後與 main 位元組相同。

本階段推翻了 D1 的前提：《司法院大法官會議規則》在全國法規資料庫另有廢止法規紀錄 `pcode=A0030300`，全文 21 條可取得，第 12 條載明「三分之二以上出席、過半數之同意」，規範規則期 79 筆中的 77 筆（該條係 1952-04-16 修正，原始版仍未取得）。此為 Material 但不屬本票所有——補上會推翻 AC-1 寫死的「三期」斷言，只有 captain 能改——故列為 Needs decision 並建議與 D1 併案上呈，本階段未動任何候選位元組。同時確認規格「不寫出 1/2」的決定是對的：實際條文不是二分之一。

七項規格偏離逐項判定可接受，無一改動 AC；`f2` 改寫經正規式實跑判定為加強語意而非弱化，並查出規格自相矛盾的欄位比 implement 自報的多一個（`claim` 也命中反向式）。淨行數 +2609（不含流程記錄）判定為估算漏列而非 scope creep：19 檔中 14 檔小幅超出，超出量半數來自規格自己決定體積的測試檔與資料模組，且無新增相依、無 runtime 網路或儲存、未刪測試。D5 的四條結構斷言經突變實跑確認真的可失敗（含 dispatch 指名的字級 26→10），但刻度密度接線無看守；本階段環境同樣無可用瀏覽器（`SEGV_ACCERR` 已重現），**D5 與 AC-3 維持為未達成的驗證項**。
