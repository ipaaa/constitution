---
id: "012"
title: 解釋門檻與案件數量關聯視覺化
status: review
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

> **2026-09-23 指路：本小節的「取不到條文」已不成立。** 條文在**另一個 pcode**
> （`A0030300`，已廢止的《司法院大法官會議規則》）取得。更正與三項限制寫在
> `## 需外部拍板的項目` 的 D1 補述，本小節原文保留。

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
且 `evidence === 'primary-source'` 的**四期**各有非空 `article`、`quotedText`、`sourceUrl`。
（原文為「三期」。2026-09-23 captain 於 verify gate 授權改為四期 —— 規則期的條文已於
`pcode=A0030300` 取得第一手依據。**這是本票唯一被授權的 AC 變更。**
規則期另帶 `caveats`，測試一併斷言三項限制存在且渲染得出來。）
同一測試掃 `src/app/past/thresholds/`、`src/components/threshold-analysis/`、
`src/data/threshold-analysis.ts` 的全部原始碼與字串，**外加 `renderToStaticMarkup` 渲染出的真實頁面文字**，
並斷言無任何 `ThresholdEra` 的 `effectiveFrom`、`effectiveTo` 以 `1987` 開頭。
**不可改為單純 grep 字串 `1987`。** `years` 資料必然含有 1987 這個年份鍵（1987 年 9 件），
純字串比對會恆真失敗。

（**2026-09-24 captain 一次性授權**：「授權修正 `Verified by:` 涵蓋既有寫法變體，不改 AC 要求本身。」
AC-1 的**要求**仍是上面那一行，一字未改；以下只換掉「怎麼查」。

原本的查法是兩條正規式
`/1987[^0-9]{0,12}(門檻|三分之二|降|放寬)/` 與 `/(門檻|三分之二|降|放寬)[^0-9]{0,12}1987/`。
它有兩個洞。**洞一：詞彙表只有四個詞。** 站上唯一同時出現 1987 與門檻主張的那句話，
當時用的是「表決條件」「改低」，剛好都在表外 —— 全頁最該被看守的一句，正好沒被看守。
**洞二：就算把詞彙補齊也不夠。** 正規式只能問「這兩者有沒有靠在一起」，
不能問「靠在一起的時候講法誠不誠實」。而誠實與否正是本票的核心：
誠實的講法是**歸屬給會議記錄並當場反駁**，不誠實的講法是把前半留下、後半刪掉。
純詞彙表在這兩種情況下都會紅，等於逼出迴避寫法 —— F5 的五種同義詞就是這樣長出來的。

現行查法：把原始碼與渲染文字切成句段（句號、換行、HTML 標籤皆為邊界），
**句段同時出現 `1987` 與門檻詞彙時，該句段必須同時帶歸屬標記與反駁標記**，否則失敗。
詞彙表擴充為：門檻／表決門檻／通過條件／表決條件／法規變動／表決標準／通過標準、
降／放寬／改低／調降／下修／鬆綁／提高／調高／收緊、三分之二／四分之三／二分之一／過半數。
歸屬標記：會議記錄／會議原文／會議說／投影片。反駁標記：不成立／`1993-02-03`／時間順序。
歸屬標記刻意不收「會議的」—— 反駁子句本身就寫著「會議的時間順序不成立」，
收了它會讓兩個條件不獨立。）

可失敗性（四項皆已實跑）：把任一 `effectiveFrom` 改成 1987，測試失敗；
把 `f2` 的反駁子句刪掉只留前半，測試失敗；把 `f2` 的歸屬「會議記錄說」刪掉，測試失敗；
把主張改寫成詞彙表外的新說法（例如「把通過標準放寬」），測試仍失敗。
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

  > **2026-09-23 補述（verify 的 V1，captain 採納）：條文已取得，原文的「找不到」不再成立。**
  > 上面只查了 `pcode=A0030159`。《司法院大法官會議規則》在全國法規資料庫另有**獨立的
  > 廢止法規紀錄 `pcode=A0030300`**（發布民國 37/09/16、廢止民國 107/07/31），全文 21 條可取得。
  > 第 12 條原文（本階段實抓核對）：
  > 「大法官會議開會時，須有在中央政府所在地全體大法官三分之二以上出席。如為決議，
  > 須有在中央政府所在地全體大法官過半數之同意。可否同數，取決於主席。」
  >
  > **「不得寫出 1/2」這個處置仍然成立，而且已證明是對的。** 實際條文是
  > 「三分之二以上出席＋過半數之同意」，寫 1/2 會是錯的。
  >
  > **但條文帶三項限制，三項都已寫進 `RULES_ERA_CAVEATS` 並顯示在站上：**
  > 1. 取得的是 **1952-04-16 修正版，不是 1948-09-16 原始版**。第 12 條正是該次修正的三條之一
  >    （另兩條為第 8、15 條）。`LawOldVerList.aspx?pcode=A0030300` 回「查無資料」，
  >    該頁並註明歷史法規只提供民國 90 年 4 月之後的版本，因此原始版取不到。
  > 2. 條文涵蓋規則期 **79 筆中的 77 筆**。釋字第 1、2 號（皆 1949-01-06）早於該次修正，
  >    落在未取得的原始版之下。這兩筆在圖下、tooltip 與對照條三處另作標示。
  > 3. **「在中央政府所在地全體大法官」這個限定語的解讀未經法學拍板。**
  >    它與後續法規的「總額」「現有總額」不是同一個概念。本頁不解釋，也不換算成人數。
  >
  > 因此 D1 **未結案**：條文證據已補齊，第 3 項的解讀仍待法學背景者拍板。
  > 原文保留，不改寫。

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
  > **2026-09-23 追記：視覺檢查時請特別看規則期的門檻分界線標籤。**
  > 該標籤原為「規則期：門檻條文待確認」（約 10 字），補上條文後變成
  > 「規則期：在中央政府所在地全體大法官 2/3 以上出席，過半數同意」（約 30 字），長度約三倍。
  > 它在桌機畫在圖左緣、向右展開。以字級 10 推算約 300px，下一條分界線（1993-02-03）在
  > 約 551px 處且排在同一列，**推算不會相撞，但沒有人真的看過**。
  > 行動版該標籤只顯示 4 位數年份，不受影響。

> **2026-09-21 補述：** 上面「以上四項不阻擋施工」寫於 D5 追加之前。
> D5 同樣不阻擋施工與進入 verify，但它是**未達成的驗證項**，不是已處置項。原句保留。

## Documentation impact

> **2026-09-23 更正（review F1，FO 授權）：下面兩條關於 `docs/INDEX.md` 的原文照字面做不到，已改寫。**
> 原文為「`docs/INDEX.md`：本 feature 由裸種子票變為有規格的計畫。狀態為 `plan`，不得寫成已上線。」
> 與「`docs/INDEX.md`：更新本 feature 狀態與最後查核日，並收錄新增文件。」
> 兩條都假設 INDEX 有一列屬於本票，實際上沒有：INDEX 對 workflow entity 是目錄層級索引。
> 原文寫於 design 階段，當時未核對 INDEX 的實際粒度。原文引在此處，不另外保留於正文，
> 避免正文同時留著兩套互相矛盾的指示。

### 現在更新

- `docs/constitution-features/012-threshold-case-analysis.md`（本檔）：記錄已定方向、R1–R7 實跑證據、
  D1–D4 待拍板項。全部尚未實作，不得讀成已上線。
- `docs/INDEX.md`：本票無列可改。INDEX 對 workflow entity 是**目錄層級**索引
  （第 96 列「33 個封存 entity、7 個進行中、6 份 debrief」），沒有逐票的列可以填狀態。
  本票的狀態在自己的 frontmatter `status:`，查詢方式見 `AGENTS.md` 的那條 `for f in ...` 指令。

### 實作後更新

- `docs/project/architecture.md`：新增路由 `/past/thresholds` 進軌道一的資訊架構。
- `docs/project/design-system.md`：登記四條門檻色帶的色票與斜線網底的用途。
- `docs/project/tech-stack.md`：登記 `scripts/fetch-interpretation-counts.mjs` 為第二支人工執行的
  外部資料抓取程式，並明寫它不進 `build`、不碰 `src/data/*.json`。
- `AGENTS.md`：在「不要手改 `src/data/*.json`」一節補一句，說明
  `src/data/threshold-analysis.ts` 是手寫資料模組、來源為 `cons.judicial.gov.tw` 與 `law.moj.gov.tw`，
  與試算表同步無關。否則下一個 agent 會分不清哪個資料檔可以改。
- `docs/INDEX.md`：把本分支改動過的 `evergreen` 文件的「最後查核」更新為施工日期
  —— 即 `AGENTS.md`、`docs/project/architecture.md`、`design-system.md`、`tech-stack.md` 四列。
  本票沒有新增任何 `.md` 文件，因此不收錄新列；也沒有逐票的列可以更新狀態。
  **不得為本票破例在 INDEX 加一列**，那會讓其餘四十幾個 entity 的索引方式不一致。

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

### Feedback Cycles

- Cycle 1: REVISE — verify gate（captain 2026-09-23 親自裁決，採納 V1 並**明確授權修改 AC-1**）；surface 本輪 7 檔／+300 淨行（+320/-20；不含本票流程記錄則 +215/-18），累計 24 檔／+3094 淨行（不含本票流程記錄則 +2806）vs estimate +1380 ±40%（828–1932）——verify cycle 1 已判定超出為**估算漏列**而非 scope creep（19 檔中 14 檔小幅超出、無新增相依、無 runtime 網路、未刪測試），本輪增量為授權範圍內的條文、限制與測試；**AC changed（captain 授權）**：AC-1 的 `primary.length` 由 3 改為 4、敘述「三期」改「四期」，其餘 AC-2 至 AC-7 以程式切塊比對證明**逐字未變**（斷言 `changed == ['AC-1']`，不符即中止）。V1 fix（Material，ownership 非 implement——缺口在 design 只查了一個 pcode：verify 在 `pcode=A0030300`（廢止法規紀錄）找到《司法院大法官會議規則》全文，第 12 條載明「三分之二以上出席、過半數之同意」，規範規則期 79 筆中的 77 筆；頁面原顯示「門檻條文待確認」等於低報已知事實，並藏起一個支持 AC-3 第 1 題的對比）。implement 未沿用票內轉述，自行 `curl` `LawAll.aspx?pcode=A0030300`（49594 bytes）逐字核對，並實抓確認 `LawOldVerList.aspx?pcode=A0030300` 回「查無資料」、歷史條文只提供民國 90 年 4 月以後者——故取得的確為 1952-04-16 修正版。三項限制（1952 修正版非 1948 原始版／涵蓋 77 of 79／「在中央政府所在地全體大法官」與「現有總額」非同一概念且不換算人數）全部進資料並在站上不摺疊顯示，第三項標 `needsRuling: 'legal-reviewer'`；釋字第 1、2 號於圖下固定註腳、1949 tooltip、規則期 tile 三處另作標示。新測試經可失敗性實跑（`coveredCount` 77→79 與拿掉限定語那項，各自讓對應測試由 ✔ 轉 ✖）；測試 21→23 pass。**本輪最有價值的產出是從真實頁面 HTML 抓到一個補條文帶出來的錯**：「資料來源」原只寫 `pcode A0030159`，補完後頁面等於謊報自己的證據出處——讀原始碼看不出來，已修正並重新驗證。留給 verify 裁量一項：`f1-1958-drop` 未寫明 1958 年是**提高**門檻（前一期為 2/3 出席＋過半數同意），該句本身不錯且 tile 上看得到前後對照，implement 依授權範圍未改寫。AC-3（朗讀測試，D4）與 D5（375px／1280px 視覺檢查）仍為 captain 執行的未達成項；D1 的解讀拍板者仍是法學背景審閱者。
- Cycle 2: REJECTED — review（captain 尚未於 review gate 裁決；本輪依 FO 授權先行修正，修完重審後才進 gate）；surface 3 檔（`docs/INDEX.md` 4+/4-、本票、`src/data/threshold-analysis.ts`）；AC unchanged（AC 全節逐字未變，**含 AC-1 的正規式詞彙表**——F4 屬 captain 權限，本輪未動）。review 的唯一阻擋項為 F1，其餘實質內容 reviewer 全部重現全部成立（五段條文自行 `curl` 逐字核對皆 VERBATIM、AC-2 每個數字不讀測試檔自 813 筆原始日期獨立重算相符、三項限制與三處標示與兩個 pcode 皆在真實渲染 HTML 63496 bytes 中、全頁無換算後人數、AC 變更以 design 階段原始 commit `497da2b` 比對確認只動 AC-1）。F1 fix（Material，本票所有：`## Documentation impact` 把 `docs/INDEX.md` 列兩次卻兩次都沒做）——四列「最後查核」由 2026-09-01 改為 2026-09-23；並改寫那句照字面做不到的指示（INDEX 對 entity 是目錄層級索引、無逐票列），**未為本票破例加列**。implement 另抓到 reviewer 未點名的孿生問題：`實作後更新` 帶著同一句做不到的指示，一併改寫，兩處原句皆逐字引在標日期的補述內。F2 fix（Polish：`threshold-analysis.ts:14` 檔頭第 3 條仍寫「規則期不得填」，已被 cycle 2 推翻）——追加補述更正，原句保留。F3 fix（Polish：`LAW_HISTORY_URL` 全域 0 引用且註解已被推翻）——**移除該 export**，implement 的決定性理由不是「沒被引用」而是「它指向規則期的錯誤 pcode，留著等於給下一個維護者一條通往錯條文的捷徑」；其出處價值保留在 `ERAS` 註解中，該註解現已列明哪個 pcode 涵蓋哪些公布日。F4 hold（Deferred risk，**AC 變更屬 captain**：規格內部矛盾——`## 土黃色區起伏因素的交付形式` 要求「照下表原文填入 FACTORS」，但表中 `f2` 原文「1987 降門檻」會命中 AC-1 的正規式；implement 選了讓 AC 過並把語意講對，reviewer 判定其解法正確，但代價是**全頁唯一讓 1987 與門檻變動主張同時出現的地方，正好在守衛的詞彙表之外**）。F5 hold（Polish，與 F4 同源：同一概念用了五種詞，違反 AGENTS.md 的用詞固定規範；reviewer 指出若 AC-3 朗讀測試在理解度上不如預期，這是第一個該查的原因）。三項未達成的驗證項原樣留存：AC-3 朗讀測試（PENDING-CAPTAIN）、D5 視覺檢查（本環境無可用無頭瀏覽器）、`c3` 的法學解讀未拍板。
- Cycle 3: REVISE — review gate（captain 2026-09-24 親自裁決，並同日給出一次性授權「授權修正 `Verified by:` 涵蓋既有寫法變體，不改 AC 要求本身」）；測試 23→25 pass／0 fail／1 skip；`tsc` 與 `build` 皆 exit 0；產線兩檔與 main 逐位元相同。review 重審已判 PASSED、F1 修得比 reviewer 要求的更完整，退回的理由是 F4／F5／F6／F7 全部指向同一件事——本票的核心紀律「對可斷言的講、對不可斷言的不講」當時沒有任何自動守衛。**F4 fix，且 FO 指定的修法被證明不可滿足**：純粹擴充詞彙表無解——站上那句誠實的敘述**本身就含有** FO 要求加入的那些詞，加進去會讓現行誠實文字轉紅，而 FO 同時要求它保持綠、只在反駁子句被刪時才轉紅。implement 找出唯一同時滿足兩者的設計：**區分誠實寫法與不誠實寫法**——含 1987 與門檻詞彙的片段必須同時帶**歸屬標記**與**反駁標記**。這正對應 `063` reviewer 指出的根因：**檢查的涵蓋面要對齊它宣稱要涵蓋的語意，而非某一次的寫法。****implement 的第一版守衛是壞的，被可失敗性實跑抓到**：它原用「會議的」當歸屬標記，但反駁子句本身含「會議的時間順序不成立」，兩個條件因此不獨立、刪掉歸屬仍會通過；改用「會議說」後四個情境全部如預期轉紅。F5 fix（用詞收斂，F4 修好後迴避寫法不再必要）；F6 fix（補測試守住 `c3` 的「不得出現換算後的人數」承諾，為手上行為寫測試、不涉 AC 變更，並做可失敗性實跑）；F7 fix（恆真斷言改為真的能失敗）。**另報一項供 gate 裁量**：`npx eslint src tests` 有 4 個既有 error，全在 `LaunchGate.tsx` 與 `Navbar.tsx`——本分支從未觸碰的檔案，main 上計數相同，implement 自身路徑 0/0；前幾輪只 lint 自己的路徑，故未浮現。依授權未動。三項未達成的驗證項原樣留存：AC-3 朗讀測試（PENDING-CAPTAIN）、D5 視覺檢查（本環境無可用無頭瀏覽器）、`c3` 的法學解讀未拍板。
- Cycle 4: REVISE — review gate（captain 2026-09-24 親自裁決）；surface 3 檔（本票、測試檔、`tsx-loader.mjs`）；**七個 AC 區塊本輪逐位元相同**；測試 25 pass／0 fail／1 skip；`tsc` 與 `build` exit 0；eslint 的 4 個既有 error 未動。review 重審已判 PASSED 且判定 F4 的設計「實質正確且是唯一解」，退回的理由是 reviewer 加了兩個**未經要求的對抗性探測**、兩個都成功打穿了上一輪剛建的守衛。F8 fix（同型盲區第十處：`c3` 的守衛只渲染元件不渲染 `page.tsx`，reviewer 把換算人數注進頁面外殼後 25 條全綠）。**成因由 implement 自陳，且它把成因記成比缺陷本身更重要的事**：`page.tsx` 在測試 harness 內無法 import `next/link`（next 的 package.json 無 `exports` 欄位，ESM 不做擴充名解析），上一輪它看到該錯誤後**改成元件渲染並繼續前進，沒有記錄守衛的涵蓋面已經縮小**——它自評「這比詞彙表不全更糟：一條看不到頁面外殼、卻聲稱保護『站上』的守衛」。**修法是修好 loader，而不是縮小宣稱。**F8 附帶：**FO 只點名 `c3`，但 AC-1 的 1987 守衛有完全相同的窄涵蓋面**（同樣只渲染元件）；implement 兩者都修，理由是「只修被點名的那一個，會留下同一個洞的另一半」。F9 fix（反駁標記收裸日期 `1993-02-03`，故一句沒有反駁的錯誤因果可過關；改為要求反駁的**語意**而非「出現了一個日期」）。F10 fix（reviewer 上一輪的 F7 被誤植）——**implement 沒有在識別上賭**：它以三項證據陳述自己的結論（AC-4 的分割恆等式），但因無法確定，**改為掃過每一條斷言並修掉全部三條不可能失敗的**，其中一條是它自己上一輪引入的。它的理由：「誤植顯示**點名單一斷言不可靠，清掉整類才可靠**」。**五次可失敗性實跑**，每次都觀察到轉紅再還原：頁面外殼注入、裸日期反駁探測、以及 F10 的三條替換各一次。eslint 的 4 個 error 依 captain 採納 reviewer 的判定**不由本票處置**（既有、main 上同樣存在、四檔本分支從未觸碰、本票自身路徑 0/0，在此修是 scope creep）。未結項原樣留存：AC-3 朗讀測試（PENDING-CAPTAIN）、D5 視覺檢查（本環境無可用無頭瀏覽器）、`c3` 的法學解讀未拍板。

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

## Stage Report: implement (cycle 2)

本輪處理 verify 的 V1（captain 於 2026-09-23 判 revise 並採納，同時授權修改 AC-1）。

- DONE: 規則期的 `evidence` 改為 `'primary-source'` 並補齊 `article`／`quotedText`／`sourceUrl`，條文自行實抓核對
  **未沿用票內轉述。** 自行 `curl` `LawAll.aspx?pcode=A0030300`（49594 bytes）取得全文，第 12 條原文與 V1 所述逐字相符：「大法官會議開會時，須有在中央政府所在地全體大法官三分之二以上出席。如為決議，須有在中央政府所在地全體大法官過半數之同意。可否同數，取決於主席。」另抓 `LawHistory.aspx?pcode=A0030300` 確認：民國 37/09/16 制定公布全文 21 條、民國 41/04/16 修正第 8、12、15 條、民國 107/07/31 廢止。`article` 為 `第 12 條`，`sourceUrl` 指向 `pcode=A0030300`。commit `ea4bca9`。
- DONE: 三項限制逐項寫進資料並顯示在站上
  新增 `RULES_ERA_CAVEATS`（`StatuteCaveat[]`，掛在 `ThresholdEra.caveats`）。三項：(1) 取得的是 1952-04-16 修正版非 1948-09-16 原始版，第 12 條正是該次修正的三條之一；(2) 涵蓋 79 筆中的 77 筆；(3) 「在中央政府所在地全體大法官」與「總額」「現有總額」不是同一個概念，本頁不解釋也不換算人數。第 (3) 項 `needsRuling: 'legal-reviewer'`，UI 掛「待確認·法學背景審閱者」徽章。三項在 `EraComparisonStrip` 的規則期 tile 內逐項全文顯示，**不摺疊**。
- DONE: 三項限制的第一手佐證
  第 (1) 項的「原始版取不到」已實抓確認：`LawOldVerList.aspx?pcode=A0030300` 解析不出任何 `lnndate`，頁面回「查無資料！」，並註明「歷史法規係提供九十年四月以後法規修正之歷次完整舊條文」。第 (2) 項由 fixture 重算：規則期 79 筆中，發布日早於 1952-04-16 的恰為釋字第 1、2 號（皆 1949-01-06），其餘 77 筆自釋字第 3 號（1952-05-21）起算。
- DONE: 釋字第 1、2 號另作標示，三處
  新增 `RULES_ERA_UNCOVERED` 常數。三處標示：圖下的固定註腳（不需 hover，兩個斷點都看得到）、1949 年的 tooltip、以及規則期 tile 的第 (2) 項限制。註腳寫明這 2 件適用的是未取得的原始版規則，其餘 77 件（共 79 件）才在已引條文之下。
- DONE: 依 captain 授權修改 AC-1，`primary.length` 由 3 改為 4，敘述文字同步更新
  AC-1 敘述由「三期」改為「**四期**」，並註明授權來源。測試 `assert.equal(primary.length, 4)`，另加 `ERAS.length === 4` 與「沒有任何一期還停在 `unverified`」兩條。測試名稱同步由「三期」改「四期」，敘述與測試一致。
- DONE: 以程式比對證明其餘各 AC 逐字未變
  以 `git show HEAD:<entity>` 取改動前版本，用正規式切出七個 `AC-n` 區塊逐塊字串比對。結果：舊新皆 7 塊；**AC-2、AC-3、AC-4、AC-5、AC-6、AC-7 逐字未變**；唯一變動為 AC-1，diff 只有「三期→**四期**」一行加四行授權註記。比對腳本斷言 `changed == ['AC-1']`，不符即中止。
- DONE: `tests/threshold-analysis.test.mjs` 以 `node --test` 全數通過，改動前後輸出如下
  **改動前：** `tests 22 / pass 21 / fail 0 / skipped 1`。**改動後：** `tests 24 / pass 23 / fail 0 / skipped 1`（skip 者為 AC-6，未設 `THRESHOLD_LIVE`）。新增兩條 D1 測試、原 D1 測試改寫。
- DONE: 新測試的可失敗性實跑驗證
  把 `coveredCount` 由 77 改成 79（假裝條文涵蓋全期）→「D1 規則期 79 筆中有 2 筆不在已引條文之下」由 ✔ 轉 ✖。拿掉 `c3-scope-wording`（限定語待拍板那一項）→「D1 規則期的三項限制都存在」由 ✔ 轉 ✖。兩次還原後皆回到 23 pass／0 fail。覆蓋數字的那條測試自 fixture 重算，不吃資料模組的宣告值。
- DONE: 以真實頁面 HTML 確認呈現，未暫改候選檔
  用零風險副本作法：`git archive HEAD | tar -x -C "$SCRATCH/repo"`、`cp -Rc node_modules`，**只在副本裡**改 `LaunchGate.tsx`，在副本起 dev server（port 3456）取 HTML。候選 worktree 全程 `git status` 乾淨。副本裡改了該檔**兩處**：除了 `ComingSoon` 那一行，還要停用 `if (!ready) return null;` —— `ready` 由 `useEffect` 設定，SSR 不會跑，只改第一處拿到的 HTML 仍是空的（43994 bytes、`threshold-hatch` 命中 0 次）；兩處都停用後為 109382 bytes、命中 1 次。
- DONE: 「不寫出 1/2」的決定仍然成立，已在真實 HTML 上驗證
  真實頁面 HTML 不含 `1/2`，也不含「二分之一」。條文原文與四期的門檻一句話都在頁面上。**V1 的判斷正確**：實際條文是「三分之二以上出席＋過半數之同意」，寫 1/2 會是錯的。規則期的 `ruleSummary` 保留「在中央政府所在地全體大法官」的限定語，測試另斷言它不含「總額」二字。
- DONE: 連帶檢查——補上條文後沒有產生新的誤導
  真實 HTML 抽出四個 tile 的完整文字逐一檢視。結論：**沒有新的誤導，而且原本被藏起來的事實現在看得見了**。詳見下方「### 連帶檢查」。
- DONE: 頁面的「資料來源」原只寫 `pcode A0030159`，補上條文後變成錯的
  這是本輪從真實 HTML 抓到的實際問題，不是推測。規則期的條文來自 `A0030300`，但來源清單只列 `A0030159`，等於頁面謊報自己的證據出處。已改為兩筆併列，並寫明規則期取得的是 1952-04-16 修正版。改完在副本重新取 HTML 確認 `A0030300` 與 `A0030159` 都在頁面上。
- SKIPPED: AC-3 朗讀測試（D4）
  仍是 captain 執行的未達成項，本輪未代為宣稱達成。
- SKIPPED: 375px／1280px 視覺檢查（D5）
  仍是未達成項。本輪在 D5 追記一項給視覺檢查的提示：規則期的門檻分界線標籤由約 10 字變成約 30 字，長度約三倍；以字級 10 推算約 300px，下一條分界線在約 551px 處且同列，**推算不會相撞，但沒有人真的看過**。
- SKIPPED: D1 結案
  本輪只補條文證據，不拍板解讀。第 (3) 項「在中央政府所在地全體大法官」的解讀仍待法學背景者。D1 在 `## 需外部拍板的項目` 以補述記錄，原文保留。

### 連帶檢查：補上條文後的呈現是否產生新的誤導

四個 tile 現在並排顯示（真實 HTML 抽出）：規則期 2/3 出席＋過半數同意、年均 8.3；
雙四分之三 3/4＋3/4、年均 6.7（0.81×）；雙三分之二 2/3＋2/3、年均 17.3（2.57×）；10 人 9 人、無釋字資料。

- **原本被藏起來的事實現在看得見，而且支持 AC-3 第 1 題。** 最嚴的門檻（3/4＋3/4）對上最低的年均（6.7），
  兩側較寬鬆的兩期都比它高。先前「門檻條文待確認」讓讀者看不到規則期的門檻，這個對比就斷了一截。
- **檢查過的風險一：讀者可能把規則期的「2/3 出席」與雙三分之二期看成同一個門檻。**
  兩者的同意門檻不同（過半數 vs 出席人 2/3），計算基準也不同（在中央政府所在地全體大法官 vs 現有總額）。
  兩項差異在 tile 文字上都看得到，第 (3) 項限制另外明講基準不是同一個概念。判定：不構成誤導。
- **檢查過的風險二：讀者可能把 8.3 全部算在已引條文底下。** 圖下註腳與第 (2) 項限制都寫明
  79 件中有 2 件不在這份條文之下。判定：已標示。
- **檢查過的風險三：讀者可能就此推出「門檻越低案件越多」的因果。**
  「先後順序：案件量先回升，門檻才放寬」的區塊與 `OchreBandFactors` 的 `f2` 都還在，真實 HTML 已確認。
  本輪沒有新增任何因果句。判定：不構成誤導。
- **留給 verify 裁量的一項：`f1-1958-drop` 的事實陳述沒有跟著更新。**
  它寫 1958 年的法律「把解釋憲法的通過條件定為總額四分之三出席、出席人四分之三同意」，
  沒有寫這是**提高**（前一期是 2/3 出席＋過半數同意）。這句話本身不是錯的，
  前後對照在 tile 上也看得到。**本輪未改寫它**——改寫因素內容不在本次授權範圍內，
  且 `f1` 的拍板者仍是法學背景審閱者。列在此供 verify／review 判定是否要另開一輪補上。

### Summary

規則期補上了第一手條文依據，但**不是無條件地補**：條文來自 1952 修正版，涵蓋 79 筆中的 77 筆，
而且關鍵限定語的解讀仍未拍板。這三項限制全部進了資料、也全部顯示在站上，釋字第 1、2 號在三處另作標示。
AC-1 依 captain 授權由三期改四期，其餘六個 AC 以程式比對證明逐字未變。

本輪最有價值的產出不是補條文，是**從真實頁面 HTML 抓到一個補條文帶出來的錯**：
「資料來源」原本只寫 `pcode A0030159`，補完之後頁面等於謊報自己的證據出處，已修正並重新驗證。
這個錯用讀原始碼的方式看不出來。

「不寫出 1/2」的決定維持不變，而且 V1 已經證明它是對的。D1 未結案，D4、D5 仍是未達成項。

## Stage Report: verify (cycle 2)

- DONE: 獨立重驗 V1 的採納 —— 自行 `curl` 一手來源
  本輪**重新抓過三個端點**，未沿用 cycle 1 的副本。`LawAll.aspx?pcode=A0030300`（HTTP 200）回傳第 12 條，與資料模組 `quotedText` 以 `String.includes` 做位元組比對為 **VERBATIM MATCH**：「大法官會議開會時，須有在中央政府所在地全體大法官三分之二以上出席。如為決議，須有在中央政府所在地全體大法官過半數之同意。可否同數，取決於主席。」`LawHistory.aspx?pcode=A0030300` 的沿革恰為三筆且與票內敘述相符：民國 37/09/16 制定公布全文 21 條、41/04/16 修正公布第 8、12、15 條、107/07/31 廢止。`LawOldVerList.aspx?pcode=A0030300` 回「查無資料！」，**1948 原始版確實取不到**，`c1-amended-version` 的說法成立。
- DONE: 77／79 的切分獨立重算
  自 fixture 的 813 筆原始日期重算（未讀測試檔）：規則期 79 筆，發布日早於 `1952-04-16` 的**恰為 2 筆**且都是釋字第 1、2 號（皆 1949-01-06），其餘 **77 筆**自釋字第 3 號（1952-05-21）起算。與 `RULES_ERA_UNCOVERED` 的 `coveredCount: 77`／`totalCount: 79`／`interpretationNumbers: [1, 2]`／`amendedOn: '1952-04-16'` 四個欄位全部相符。
- DONE: 以真實頁面 HTML 確認三項限制、釋字第 1、2 號三處標示、資料來源兩個 pcode
  依 dispatch 的副本作法，**兩處都停用**（`if (!ready) return null;` 與 `return <ComingSoon />;`，皆在 `src/components/LaunchGate.tsx`），**只改副本**。Next 建置後 `thresholds.html` 仍只有 18025 bytes、可見文字 199 字 —— 追出原因是 `LaunchGate` 用了 `useSearchParams()`，該 hook 會讓子樹退出預渲染，與 dispatch 提到的 bytes 數不同即源於此。改以 `renderToStaticMarkup` 直接渲染 `src/app/past/thresholds/page.tsx` 元件樹（`next/link` 以 stub 代換），得 **57815 bytes 真實 HTML、可見文字 5940 字**，逐項比對結果：**三項限制全部現身且未摺疊**（`<details>`／`<summary>` 出現次數 **0**），`c3` 帶「待確認·法學背景審閱者」標記；**釋字第 1、2 號三處標示全部在**——(1) 圖下註記「※ 1949-01-06 的 2 件（釋字第 1、第 2 號）早於 1952-04-16 的修正……其餘 77 件（共 79 件）才在已引條文之下」、(2) 時期對照條的 `c2` 但書、(3) 1949 年 tooltip（另以單獨渲染確認：1949 出現該標示，1952／1958／1993 皆不出現）；**「資料來源」欄已同時列出兩筆**：「現行憲法訴訟法與其歷史條文為 pcode A0030159；規則期的《司法院大法官會議規則》為另一筆已廢止法規 pcode A0030300，取得的是 1952-04-16 修正後的版本」。implement 補的這一項確實修掉了一個**讀原始碼看不出來**的錯。
- DONE: 確認 AC 變更只動了 AC-1
  以程式把 `25cb906` 與 `HEAD` 的票各自切成七個 AC 區塊逐塊比對：**AC-2／3／4／5／6／7 六項字元數與內容完全相同（逐字未變）**，唯一差異在 AC-1，且差異只有授權範圍內的兩點——敘述「三期」→「**四期**」，並追加一段註明「原文為『三期』。2026-09-23 captain 於 verify gate 授權改為四期……**這是本票唯一被授權的 AC 變更**」。**保留原文、追加補述**的寫法符合 `AGENTS.md`「不要悄悄改寫原文」。測試端對應改為 `primary.length === 4`。
- DONE: `node --test` 23 pass／0 fail／1 skip，並獨立重現兩條新測試的可失敗性
  實跑 23 pass／0 fail／1 skip（skip 為未設 `THRESHOLD_LIVE` 的 AC-6）。突變在 worktree 外的副本進行，**候選位元組與 git HEAD 全程未動**：`coveredCount: 77` → `79` → **轉紅**「D1 規則期 79 筆中有 2 筆不在已引條文之下，且在圖下另作標示」；刪掉 `c3-scope-wording` 那項 caveat → **轉紅**「D1 規則期的三項限制都存在，且都渲染得出來」。另加驗一條：把規則期 `evidence` 改回 `'unverified'` → **轉紅** AC-1 的四期斷言與 D1 條文斷言。三條突變各自只打中該打中的測試，非恆真空轉。
- DONE: 未出現換算後的人數（`c3` 的未拍板限制被遵守）
  對真實 HTML 的可見文字掃 `[0-9一二三四五六七八九十兩]{1,3}\s*人`，命中**全部屬於 `current` 期**（10 人／9 人）或其條文原文（「不得低於十人」「不得低於九人」），**規則期附近 0 命中**。規則期 `ruleSummary` 為「在中央政府所在地全體大法官 2/3 以上出席，過半數同意」——照抄條文用語，未換算人數、未改寫成「總額」。D1 的「不得寫出 1/2」仍成立：shipped 表面僅有的 `1/2` 是 Tailwind 的 `-translate-x-1/2`，另兩處在**原始碼註解**（說明為何不得寫 1/2），不進渲染輸出。
- DONE: 無回歸
  78 列逐年計數與 cycle 1 的獨立重算 **0 筆不符**，釋字合計仍 813；四段既有條文（1958／1993／現行／INTERIM）仍全部逐字；`ERA_SPAN_DAYS` 3483／12616／10552 未變。`src/data/discussions.json` 與 `history.json` 在**建置後**仍與 main sha256 相同，`package.json` 與 main 完全相同。清空 `.next` 後 `npm run build` exit 0、`npx tsc --noEmit` exit 0（本機無檔名帶「 2」的重複檔，未遇 dispatch 提到的假性失敗）。本輪新增改動的 placeholder 掃描 0 命中，新程式碼無 runtime `fetch`／`localStorage`。
- DONE: 裁量 `f1-1958-drop` 未寫明 1958 是「提高」門檻
  判定見下節。**implement 的判斷正確**，且該缺漏**不會**讓讀者誤判方向。
- SKIPPED: AC-3 朗讀測試
  維持 `PENDING-CAPTAIN`，未代為宣稱達成。
- SKIPPED: D5 行動版／桌機視覺檢查
  維持未達成。依 dispatch 指示未再嘗試無頭瀏覽器。cycle 1 已實測本環境 `SEGV_ACCERR`，結論不變。

### `f1-1958-drop` 的裁量

**一、implement「不在本次授權範圍」的判斷正確，而且有兩個獨立理由。**

程序上：captain 授權的是 AC-1 一項。`FACTORS` 的內容受 AC-4 管，而 AC-4 本輪**逐字未變**（已程式比對）；規格的土黃色區表格另明文要求「照下表原文填入 `FACTORS`」。改寫 f1 的事實陳述是因素內容變更，本輪未獲授權。

實質上（這一點更要緊）：要寫「1958 **提高**了門檻」，必須拿「在中央政府所在地全體大法官 2/3 出席／過半數同意」去比「總額 3/4 出席／出席人 3/4 同意」。這兩組不只分母不同，**分母的種類也不同**——前者的「同意」是對**在中央政府所在地全體大法官**計算，後者的「同意」是對**出席人**計算。不知道「在所在地者」與「總額」的比例，就無法斷言兩者孰高。這正是 `c3-scope-wording` 標為待法學拍板的那個問題，而 `c3` 自己寫明「本頁不解釋這個限定語」。**若照補，頁面會違反自己剛宣告的克制。** 所以這不只是「沒被授權」，是「現在還不該寫」。

**二、這個缺漏不會讓讀者誤判方向，而且風險比本輪之前更低。**

本輪之前規則期顯示「門檻條文待確認」，讀者**根本無從比較**。本輪之後，時期對照條把兩段門檻並列（真實 HTML 中兩句相距 51 個字元，是相鄰的兩格）：規則期「在中央政府所在地全體大法官 2/3 以上出席，過半數同意」對上雙四分之三「總額 3/4 出席，出席人 3/4 同意」。前三期的分數依序是 過半數 → 3/4 → 2/3，**3/4 肉眼即為最高**，AC-3 第 1 題的通過條件（說出「門檻較高、案件較少」）從畫面上取得得到。

另查頁面**沒有在任何地方講錯方向**：唯一被斷言方向的是 1993 那次（「先後順序：案件量先回升，門檻才放寬」、f3 的「通過條件放寬後第二年」），而 1993 是 3/4 → 2/3，兩個維度同向、分母種類相同，**方向明確可斷言**。頁面對可斷言的講、對不可斷言的不講，這條線是一致的。

**分類：Polish。** 無當前使用者可見損失，無受保護邊界受威脅。**升級為 Material 的條件**：若日後要在站上明寫 1958 那次的方向，必須先取得 `c3` 的法學拍板；那是一次需要授權的內容變更，**不是可以順手補的顯然編輯**。

### Verdict

**PASSED。**

V1 是我在 cycle 1 提出的，本輪用同一套標準複驗，沒有因為是自己提的而放寬：三個一手端點全部自行重抓、77／79 的切分自 813 筆原始日期獨立重算、三項限制與三處標示改用**真實渲染 HTML** 而非 grep 確認、兩條新測試各自做突變實測確認真的會轉紅。結果全部成立，且未發現新的誤導。

AC 變更經逐塊比對確認**只動了 AC-1**，其餘六項逐字未變，改法保留原文並追加授權註記。三項限制的表述準確且未摺疊：條文確實是 1952-04-16 修正版（沿革證實第 12 條正是該次修正的三條之一）、確實只涵蓋 79 筆中的 77 筆（獨立重算相符）、「在中央政府所在地全體大法官」的解讀確實未被代為拍板（全頁無任何換算後的人數）。implement 從真實 HTML 抓到的「資料來源只寫 A0030159」是真的錯、也真的修好了——頁面原本等於謊報自己的證據出處，現已兩筆併列並註明版本。無回歸：78 列計數、四段既有條文、內容產線兩檔與 `package.json` 全部不動，建置與型別檢查皆 exit 0。

`f1-1958-drop` 的缺漏判定為 Polish 且不阻擋：implement 不補是對的，補了反而會違反 `c3` 的未拍板限制。

**PASSED 的範圍仍僅限於「事實查核通過、無回歸、無新誤導」。** 三項未達成的驗證項照舊必須在 gate 原樣呈現：**AC-3 朗讀測試**（`PENDING-CAPTAIN`）、**D5 行動版／桌機視覺檢查**（本環境無可用無頭瀏覽器，依指示未再嘗試）、以及 **`c3` 的法學解讀**（「在中央政府所在地全體大法官」與「總額」是否可比，未拍板前站上不得出現換算人數，也不得斷言 1958 那次的方向）。

### Summary

本輪複驗 V1 的採納。三個一手端點自行重抓：第 12 條與資料模組逐字相符，沿革確為「民國 37/09/16 制定、41/04/16 修正第 8、12、15 條、107/07/31 廢止」，`LawOldVerList` 確回「查無資料」故 1948 原始版取不到。77／79 的切分自 813 筆原始日期獨立重算相符（早於 1952-04-16 者恰為釋字第 1、2 號）。改用真實渲染 HTML（57815 bytes）確認三項限制全部現身且未摺疊、釋字第 1、2 號三處標示（圖下註記／對照條但書／1949 tooltip）全部到位、「資料來源」已同時列出 A0030159 與 A0030300——追出 Next 預渲染只有 18025 bytes 的真因是 `useSearchParams()` 使子樹退出預渲染，非副本作法有誤。

AC 變更經七塊逐字比對確認只動 AC-1（三期→四期，保留原文並追加授權註記），其餘六項未變；`node --test` 23 pass／0 fail／1 skip，兩條新測試以突變實測確認可失敗（`coveredCount` 77→79、刪 `c3` 各自轉紅），另加驗 `evidence` 改回 `unverified` 亦轉紅。全頁無任何換算後的人數，`c3` 的未拍板限制被遵守。無回歸。

`f1-1958-drop` 未寫明 1958 是「提高」門檻，判定 implement 不補正確：除了未獲授權，實質上要斷言方向必須跨兩種不同分母比較，正是 `c3` 待拍板的問題，補了會違反頁面自己的克制。該缺漏不致讀者誤判——對照條已把兩段門檻並列，3/4 肉眼即為前三期最高，且頁面只對方向明確的 1993 那次講「放寬」。分類 Polish，升級條件為取得 `c3` 的法學拍板。**AC-3、D5 與 `c3` 法學解讀三項維持未達成。**

## Stage Report: review

我是新的 reviewer，前三輪的結論全部自己重現，不採信自我回報。

- DONE: 逐項重現第十小節 AC1–AC7 的 `Verified by:` 子句
  **AC-1**：`ERAS` 的四個 `effectiveFrom` 實讀為 `1948-09-16`／`1958-07-21`／`1993-02-03`／`2025-01-23`；四期 `evidence` 皆 `primary-source` 且 `article`／`quotedText`／`sourceUrl` 皆非空。五段條文（四期＋`INTERIM_SEGMENT`）我**自己 `curl` 一手來源逐字比對，五段全部 VERBATIM**（`A0030300` 第 12 條、`A0030159` 的 19580721／19930203／20190104 三個舊版、現行全文）。規格的兩條 1987 正規式我另寫一支掃 13 個檔：0 命中；**再掃真實渲染 HTML 的可見文字：也是 0 命中**。
  **AC-2**：不讀測試檔，自 `tests/fixtures/interpretation-dates.json` 的 813 筆原始日期獨立重算，全部相符——逐年計數 0 筆不符、合計 813、尖峰 1994 年 37 件；三期 79／233／501 相加 813；年均 8.2843→`8.3`、6.7455→`6.7`、17.3414→`17.3`；倍率先除後進位得 `0.81×`、`2.57×`；邊界年 1993 為 1／20、1958 為 0／2。
  **AC-3**：`PENDING-CAPTAIN`，未代為宣稱達成。
  **AC-4**：五項 `FACTORS` 的 `basis`／`basisRef`／`uncertainty`（長度 40–128 字）／`needsRuling` 實讀齊備；真實 HTML 中四個待拍板項各帶「待確認」與拍板者，`f5` 無標記並寫明無須外部拍板；`ThresholdChart` 及其子元件 0 處 import `FACTORS`。
  **AC-5**：`current` 期 `meanPerYear === null`、`totalCount 0`；真實 HTML 有 `<pattern id="threshold-hatch">` 定義與 `fill="url(#…hatch…)"` 引用與「無釋字資料」；`series === 'judgment'` 的 2022–2026 不進任何年均。
  **AC-6**：未跑全量 250 秒版本，改抽三個端點實連比對——釋字第 1／80／813 號的 `發布日期` 與 fixture 全部 MATCH，第 813 號 `id` 仍為 `325335`（通式例外仍在）；fixture 自身 1–813 無缺號。
  **AC-7**：`discussions.json` `4071978a…`、`history.json` `4d1992e3…` 與 main blob 相同，**`npm run build` 之後再測仍相同**且 `git status` 乾淨；`git diff main...HEAD -- package.json` 為空，`build` 仍是 `next build`；`rm -rf .next` 後 `npx tsc --noEmit` exit 0、`npm run build` exit 0（`/past/thresholds` 列為靜態預渲染），未遇 dispatch 提到的假性失敗。
- DONE: 確認 AC-1 是唯一被授權的 AC 變更，其餘六項逐字未變
  我用**design 階段的原始 commit `497da2b`**（不是 verify 用的 cycle-1 基線）切出七個 AC 區塊逐塊字串比對：AC-2（784 字元）／AC-3（614）／AC-4（473）／AC-5（321）／AC-6（360）／AC-7（246）**六項 IDENTICAL**，`changed == ['AC-1']`，且 AC-1 的差異只有「三期→四期」與四行授權註記，原文保留。
- DONE: 以真實渲染 HTML 驗證，未暫改候選檔
  以 `renderToStaticMarkup` 渲染 `src/app/past/thresholds/page.tsx` 整棵元件樹（`next/link` 以 stub 代換），得 **63496 bytes、可見文字 5937 字**。渲染腳本寫在 `tests/` 下、跑完即刪，**候選位元組與 git HEAD 全程未動**（`git status` 前後皆乾淨）。逐項比對：三項限制全部現身且未摺疊（`<details>`／`<summary>` 出現 0 次）、`c3` 帶「待確認·法學背景審閱者」；釋字第 1、2 號三處標示（圖下註腳／對照條 `c2` 但書／1949 tooltip）全部在；「資料來源」同列 `A0030159` 與 `A0030300` 並註明 1952-04-16 修正版；R7 三項邊界全部寫在頁上；`<desc id="threshold-chart-desc">` 含四期年均。
- DONE: 全頁確無換算後的人數
  掃可見文字的 `[0-9一二三四五六七八九十兩]{1,3}\s*人`，**8 處命中全部屬 `current` 期（10 人／9 人）或其條文原文**，規則期附近 0 命中。全頁不含「1/2」也不含「二分之一」（`-translate-x-1/2` 那類 class 不進可見文字）。`c3` 的未拍板限制被遵守。
- DONE: 依實際交付行為查核 `## Documentation impact` 每一筆
  `實作後更新` 四筆（`architecture.md`／`design-system.md`／`tech-stack.md`／`AGENTS.md`）全部完成且內容正確；`tech-stack.md` 以加註日期的補述追加、不改寫原文，符合 `AGENTS.md`。`AGENTS.md` 新增的「`.json` 不改、`.ts` 可改」判準我實查 `src/data/` 核對過：只有 `discussions.json`、`history.json` 兩個 `.json` 且都是同步產物，其餘皆手寫 `.ts`，判準成立。`不更新` 一節全部遵守——`health-check/`、`content-rescue/`、`_archive/`、`meetup-chats/`、`content-pipeline/`、`constitution-features/README.md` **0 個檔被動到**，無 `record` 文件被改寫。**唯一未達成的是 `docs/INDEX.md`：見下方 F1。**
- DONE: 評估程式品質與回歸
  ESLint 對本票全部檔案 0 error。元件品質良好：`matchMedia` 初值固定為 false 再於 effect 校正避開 hydration 警告、斷點切換用衍生值而非 effect 改 state、`useMemo`／`useCallback` 用得其所、`aria-expanded` 與 `role="img"`／`<title>`／`<desc>` 齊備、手寫 SVG 沿用 `JusticeTermTimeline.tsx` 的 `viewBox` 做法且未新增任何相依。無回歸：78 列逐年計數 0 筆不符、內容產線兩檔與 `package.json` 不動、建置與型別檢查皆 exit 0。`metadataBase` 建置警告為既有現象（多個既有頁面都有 openGraph images），非本票造成。surface 為 **+2806 淨行（不含本票流程記錄）vs 估算 +1380 ±40%（828–1932）**，超出上緣約 45%；我逐檔比對估算表，**18 個計畫內檔案全部各自小幅超出，另加 2 支小型支援檔**（`ChartText.tsx` 55 行、`tests/tsx-loader.mjs` 71 行，皆在報告中說明且不新增相依），無計畫外路由、無新相依——**判定為估算漏列，非 scope creep**，與 verify cycle 1 的結論一致。
- DONE: 確認累積的未結項都正確留在票內
  四項全部在，無一悄悄消失：AC-3 朗讀測試（`PENDING-CAPTAIN`，AC 原文未變）、D5 視覺檢查（`## 需外部拍板的項目` 含 2026-09-23 追記）、`c3` 法學解讀（D1 補述第 3 項＋`RULES_ERA_CAVEATS` 的 `needsRuling: 'legal-reviewer'`，且渲染得出來）、`f1-1958-drop` 未寫方向（implement 留裁量、verify 判 Polish 並寫明升級條件）。D3（會議「1987」原意）仍掛 captain。D2 已實質結案——我自行核對 2019-01-04 版第 30 條為 VERBATIM，站上照實顯示且未標「未確認」，處置正確。
- DONE: 獨立複驗 cycle 2 的核心事實
  `LawHistory.aspx?pcode=A0030300` 我自己抓到的沿革恰為三筆：民國 37/09/16 制定公布全文 21 條、**41/04/16 修正公布第 8、12、15 條**（第 12 條確為該次修正的三條之一）、107/07/31 廢止；`LawOldVerList.aspx?pcode=A0030300` 回「查無資料」且頁面註明只提供民國 90 年 4 月以後的舊條文，**1948 原始版確實取不到**。77／79 的切分自 813 筆原始日期獨立重算：規則期 79 筆中早於 `1952-04-16` 的恰為釋字第 1、2 號（皆 1949-01-06），其餘 77 筆自釋字第 3 號（1952-05-21）起算。三項限制全部有第一手根據。
- DONE: `node --test` 實跑並確認測試非空轉
  23 pass／0 fail／1 skip（skip 為未設 `THRESHOLD_LIVE` 的 AC-6）。AC-1 的 1987 測試帶非空轉守衛（斷言 `YEARS` 的 1987 仍為 9 件），AC-2 全部自 fixture 重算而非吃資料模組宣告值——**我另以完全獨立的腳本重算過同一批數字，與測試結論一致**，因此不是兩邊同源的恆真比對。
- FAILED: `docs/INDEX.md` 的必要更新未完成（F1，見下節）
  `git diff main...HEAD -- docs/INDEX.md` 為空，sha256 與 main 相同（`0eaa7cb4e60dfcb0`）。

### F1 — `docs/INDEX.md` 未更新（Material／本票所有）

`## Documentation impact` 把 `docs/INDEX.md` 列了**兩次**（`現在更新` 與 `實作後更新`），兩次都未執行。

四項證據欄位：

- **已發布使用者與正常流程**：協作者或下一個 agent 打開 `docs/INDEX.md`——`AGENTS.md` 明定「不確定去哪找就看這份」——查哪些文件是現況。
- **可觀察的損害**：`docs/INDEX.md:39,47,48,49` 四列的「最後查核」都寫 `2026-09-01`，但本分支在 2026-09-21／23 為這四份 `evergreen` 文件各加了新章節。索引低報了它們的更新時間。`AGENTS.md` 自己寫「過時的 evergreen 文件是危險的」。
- **受影響的價值 AC 或不可逾越邊界**：**不涉及任何 AC**，AC-1 至 AC-7 都不管文件索引。也**未觸犯 `AGENTS.md` 的索引硬規則**——該規則的觸發條件是「新增或刪除文件」，本票 0 個新增、0 個刪除。受影響的是本票**自己核可的交付範圍**，以及 `review` 階段定義明列的 Output。
- **觸發證據**：`git diff main...HEAD -- docs/INDEX.md` 空；`docs/INDEX.md` 與 main sha256 相同；`AGENTS.md`、`docs/project/{architecture,design-system,tech-stack}.md` 四檔確在本分支 diffstat 內。

分別提出（**本階段只做唯讀調查，未動任何候選位元組，未改 AC，未重跑 reviewer**）：

- **Materiality：Material**，但幅度小——是「核可範圍內的交付項未交付」，不是正確性缺陷，且損害僅限協作者查文件，**與網站讀者無關**。
- **Task ownership：本票所有。** 這是例行文件編輯，不需任何人拍板。
- **Disposition 建議：fix，範圍極窄**——把上述四列的「最後查核」改為 `2026-09-23`。
- **一項要請 captain 注意的設計缺口**：`現在更新` 那句「`docs/INDEX.md`：本 feature 狀態為 `plan`」**照字面做不到**。`docs/INDEX.md` 對 workflow entity 是**目錄層級**索引（第 96 列：「33 個封存 entity、7 個進行中、6 份 debrief」），沒有逐票的列可以填狀態。design 寫這句時沒有對過 INDEX 的實際結構。建議由 captain 決定：改 `## Documentation impact` 的措辭，或改 INDEX 的索引粒度——**不要為了滿足字面而替單一票破例加一列**，那會讓另外 40 個 entity 的索引方式不一致。

### F2、F3 — 資料模組的兩處陳述已被 cycle 2 推翻但未更新（皆 Polish／本票所有）

- **F2：`src/data/threshold-analysis.ts:14`** 檔頭「三條不可違反的規則」第 3 條仍寫「規則期的門檻數字沒有第一手依據，**不得填**」。cycle 2 已填入 `article`／`quotedText`／`sourceUrl` 並把 `evidence` 改為 `primary-source`。同檔第 252–259 行的 `ERAS` 說明有交代這次改變，**但檔頭沒有**——維護者讀檔頭會以為現行資料違反了自己宣告的不變量。
- **F3：`src/data/threshold-analysis.ts:92-93`** `LAW_HISTORY_URL` 在 `src/`、`tests/`、`scripts/` **全域 0 處引用**（dead export），且其註解「規則期唯一能查到的一手記載（只有制定日，沒有條文）」已被 cycle 2 推翻（我實抓複驗：`A0030300` 的沿革頁＋全文頁就有條文），它指的 `pcode=A0030159` 對規則期也是錯的 pcode。

兩項**都不進渲染輸出**，無當前使用者可見損失，無受保護邊界受威脅 → **Polish**。建議 disposition：與 F1 同一輪順手修掉，或 decline。

### F4 — AC-1 的正規式守衛剛好漏掉頁面上唯一真正的 1987 門檻句（Deferred risk）

`FACTORS` 的用詞被系統性改寫：規格表原文的「門檻」在站上變成「通過條件」「表決條件」「法規變動」。**這個改寫是被 AC-1 逼出來的，不是任意發揮**——規格 `## 土黃色區起伏因素的交付形式` 要求「照下表原文填入 `FACTORS`」，但表中 `f2` 原文「會議記錄的『1987 **降**門檻→暴增』」會命中 AC-1 的 `/1987[^0-9]{0,12}(門檻|三分之二|降|放寬)/`。**照原文填就會讓 AC-1 的測試變紅。規格自己互相矛盾，implement 選了讓 AC 過、把語意講對的那條路。**

站上實際的句子是：「會議記錄說 1987 年那次修法把表決條件改低、並因此造成案件暴增；實際的修法公布日是 1993-02-03，且案件量自 1986 年起已在回升，會議的時間順序不成立。」——**歸屬清楚、當場反駁、事實正確，AC-1 的判準本身有達成**（頁面沒有「把門檻變動寫成 1987 年」）。

風險在守衛而不在現況：這句用的「表決條件」「改低」都在正規式的詞彙之外，**全頁唯一讓 1987 與門檻變動主張同時出現的地方，正好是測試看不到的地方**。日後若有人刪掉後半的反駁子句，只留前半，AC-1 仍會全綠而頁面已經在斷言錯誤因果。

- **升級為 Material 的條件**：任何削弱或移除 `f2-ramp-precedes` 的 `uncertainty` 中「實際的修法公布日是 1993-02-03，且案件量自 1986 年起已在回升，會議的時間順序不成立」這段反駁的編輯。
- **要真正修好必須擴充 AC-1 的詞彙表**（加入「通過條件」「表決條件」「改低」），那是 **AC 變更，只有 captain 能決定**。本輪不動。

### F5 — 用詞不固定，違反 `AGENTS.md` 的寫作規範（Polish）

真實 HTML 可見文字中，同一個概念用了五種詞：門檻 13 次、表決門檻 3 次、通過條件 3 次、表決條件 1 次、法規變動 2 次。`f3-1994-peak` 甚至在同一張卡片裡「事實陳述」用通過條件、「不確定的是什麼」用門檻。`AGENTS.md` 的寫作規範明列「用詞固定 —— 同一個概念只用同一個詞」。

成因與 F4 同源（AC-1 的正規式）。受眾是非法學背景讀者，**若 AC-3 朗讀測試在理解度上不如預期，這是第一個該查的候選原因**。無當前可證的使用者損失 → Polish。

### 三項未達成的驗證項（原樣留存，gate 必須呈現）

1. **AC-3 朗讀測試**（D4）—— `PENDING-CAPTAIN`。3 位非法學受測者、三道不提示的問題，worker 無法自證。本輪未代為宣稱達成。
2. **D5 行動版／桌機視覺檢查** —— 本環境無可用無頭瀏覽器，依 dispatch 指示未再嘗試。規則期分界線標籤由約 10 字變 30 字後會不會與 1993-02-03 那條相撞，**只有推算，沒有人真的看過**。
3. **`c3` 的法學解讀** —— 「在中央政府所在地全體大法官」與「總額」「現有總額」是否可比，未拍板。在此之前站上不得出現換算後的人數（我已實測 0 命中），也不得斷言 1958 那次門檻變動的方向。

### Verdict

**REJECTED。**

**唯一的阻擋項是 F1**，而且它很窄：`## Documentation impact` 把 `docs/INDEX.md` 列為必要更新列了兩次，兩次都沒做；`review` 階段定義又明文要我逐筆查這一節。修法是四列日期。

我必須同時把減輕情節講清楚，讓 gate 能便宜地推翻我：F1 **不涉及任何 AC**，**也沒有觸犯 `AGENTS.md` 的索引硬規則**（該規則的觸發條件是新增或刪除文件，本票兩者皆 0），損害只及於協作者查文件的正確性，**與網站讀者無關**。而且 `現在更新` 那句照字面做不到——INDEX 對 entity 是目錄層級索引，沒有逐票的列。**若 captain 認為不值得一輪，改 `## Documentation impact` 的措辭比改索引粒度乾淨，我不反對。**

除 F1 之外，**這份 diff 的實質內容我全部重現、全部成立**。五段條文我自己 curl 逐字核對全部 VERBATIM；AC-2 的每個數字我不讀測試檔、自 813 筆原始日期獨立重算全部相符；三項限制、釋字第 1、2 號三處標示、兩個 pcode 的來源清單都在**真實渲染 HTML（63496 bytes）**裡而不是只在資料中；全頁無任何換算後的人數；無回歸、建置與型別檢查皆 exit 0、內容產線兩檔在建置後仍與 main 相同。AC 變更我拿**design 階段的原始 commit** 比對，確認只動 AC-1、其餘六項逐字未變。

`f1-1958-drop` 我同意 verify 的裁量並補一個理由：要斷言 1958 那次的方向，得拿「在中央政府所在地全體大法官」的分母去比「總額」的分母，那正是 `c3` 待拍板的問題——補了會違反頁面自己剛宣告的克制。維持 Polish。

F4 是我這輪新提的，值得 captain 看一眼：**規格內部矛盾**（「照原文填入 `FACTORS`」與 AC-1 的正規式無法同時滿足），implement 的解法正確，但代價是 AC-1 的守衛對頁面上唯一真正的 1987 句子失效。要修必須擴充 AC-1 詞彙表，那是 captain 的權限。

### Summary

七項 AC 的 `Verified by:` 全部自行重現，不採信前三輪的自我回報：五段條文自行 curl 逐字核對皆 VERBATIM、AC-2 的所有數字自 813 筆 fixture 獨立重算皆相符、AC-6 抽三個端點實連皆 MATCH、AC-7 在 `rm -rf .next` 後重跑建置與型別檢查皆 exit 0 且內容產線兩檔 sha256 不變。AC 變更以 **design 原始 commit** 為基線逐塊比對，確認 `changed == ['AC-1']`、其餘六項逐字未變。三項限制、釋字第 1、2 號三處標示、兩個 pcode 來源、R7 三項邊界，全部在自行渲染的 63496 bytes 真實 HTML 裡確認，且全頁無任何換算後的人數。候選位元組全程未動。

判 **REJECTED**，阻擋項只有 F1——`docs/INDEX.md` 的必要更新未執行（四列「最後查核」仍停在 `2026-09-01`，而四份 evergreen 文件本分支都改過）。F1 不涉 AC、不觸犯 `AGENTS.md` 索引硬規則，且該條 Documentation impact 有一半照字面做不到（INDEX 是目錄層級索引，沒有逐票的列），gate 可以便宜地推翻我。

另記四項不阻擋的發現：F2／F3 資料模組檔頭與 `LAW_HISTORY_URL` 的陳述已被 cycle 2 推翻但未更新（Polish）；**F4 —— 規格自身矛盾使 AC-1 的正規式守衛對頁面上唯一的 1987 門檻句失效**，現況文字正確但無測試保護，要修必須由 captain 擴充 AC-1（Deferred risk）；F5 用詞不固定，若 AC-3 理解度不如預期應優先查此（Polish）。AC-3、D5、`c3` 法學解讀三項維持未達成，原樣留存。

## Stage Report: implement (cycle 3)

本輪處理 review 的 F1（Material，阻擋）與 F2／F3（Polish）。F4／F5 依 FO 指示不動。

- DONE: F1 修法一 —— `docs/INDEX.md` 四列「最後查核」由 `2026-09-01` 改為 `2026-09-23`
  `AGENTS.md`、`docs/project/architecture.md`、`design-system.md`、`tech-stack.md` 四列。本分支確實為這四份 `evergreen` 文件各加了新章節，索引原本低報了它們的更新時間。修改以腳本逐列斷言「列首檔名相符」且「列尾恰為 `| 2026-09-01 |`」後才置換，不符即中止。`git diff --numstat docs/INDEX.md` 為 `4 4`，四加四減，**沒有新增任何列**。
- DONE: F1 修法二 —— 改寫 `## Documentation impact` 中兩條做不到的 `docs/INDEX.md` 指示
  reviewer 指出的是 `現在更新` 那條。實際上 `實作後更新` 也有一條同病（「更新本 feature 狀態與最後查核日，並收錄新增文件」），同樣假設 INDEX 有一列屬於本票，**一併改寫**。改寫後：`現在更新` 寫明本票無列可改、狀態在 frontmatter、查詢方式見 `AGENTS.md` 的 `for f in ...` 指令；`實作後更新` 寫明實際可做的是更新四份 evergreen 文件的最後查核日、本票未新增 `.md` 故不收錄新列、並明文禁止為本票破例加列。
- DONE: F1 的原文保留
  依 `AGENTS.md`「不要悄悄改寫原文」，在 `## Documentation impact` 開頭加一則 2026-09-23 補述，把兩條原文逐字引在裡面，並說明它們寫於 design 階段、當時未核對 INDEX 的實際粒度。原文不另外留在正文，避免正文同時掛著兩套互相矛盾的指示。
- DONE: F1 的引用已核對
  補述與正文都引用 INDEX 第 96 列作為「目錄層級索引」的證據。實際讀出該列確認為
  `| `docs/constitution-features/` | 33 個封存 entity、7 個進行中、6 份 debrief | record | — | 2026-09-03 |`，引用正確。
- DONE: **未為本票在 `docs/INDEX.md` 破例加列**
  INDEX 的 diff 只有四個日期字串，無新增列。其餘四十幾個 entity 的索引方式不受影響。
- DONE: F2 —— 資料模組檔頭第 3 條以追加補述更正，原句保留
  檔頭「三條不可違反的規則」第 3 條「規則期的門檻數字沒有第一手依據，不得填」寫於 cycle 2 之前。追加 ⚠️ 補述，寫明該條的前提已不成立、原因（當時只查 pcode A0030159，其歷史條文只回溯到 1958-07-21）、以及取代它的 `3'.`（條文取自 A0030300 的 1952-04-16 修正版、帶三項限制且三項必須顯示、仍不得寫出 1/2）。原句一字未刪。
- DONE: F3 —— 移除 `LAW_HISTORY_URL`，出處改記在 `ERAS` 的說明
  **先實跑確認無引用**：以 `grep -rn` 掃 `src`／`tests`／`scripts` 全部 `.ts`／`.tsx`／`.mjs`／`.js`，除宣告本身外 0 處引用；對照組 `LAW_CURRENT_URL` 在同一次掃描命中第 318 行（`current` 期的 `sourceUrl`），證明掃描本身有效、不是掃法錯誤。移除後 `npx tsc --noEmit` 與 `npm run build` 皆 exit 0。
- DONE: F3 的判斷理由
  **選擇移除而非修正註解保留。** 三個理由：(1) 零引用，留著不會有人讀到它的註解，只會在有人搜尋 `LawHistory` 時被撈出來；(2) 它指的 `pcode=A0030159` 對規則期是**錯的 pcode**，留一個現成常數等於給下一個維護者一條指向錯法規的捷徑——這比沒有常數更糟；(3) 它原本承載的資訊（effectiveFrom 的出處）本來就該寫在 `ERAS` 旁邊而不是一個沒人用的 export。**資訊沒有遺失**：`ERAS` 的說明改為明列兩個 pcode 各管哪幾個公布日（A0030159 管 1958-07-21／1993-02-03／2025-01-23，A0030300 管規則期的 1948-09-16），並明寫「查規則期要用 A0030300，A0030159 對規則期是錯的 pcode」。移除的理由也寫在該處註解裡，供日後追溯。
- SKIPPED: F4 —— AC-1 正規式詞彙表的擴充
  屬 captain 權限，FO 已上呈，本輪不動。已驗證 AC 全節逐字未變，兩條正規式原樣仍在。
- SKIPPED: F5 —— 用詞不固定
  與 F4 同源，等 F4 的決定，本輪不動。`git diff --stat -- src/components` 為空，元件一字未改。
- SKIPPED: AC-3 朗讀測試（D4）、D5 視覺檢查、`c3` 的法學解讀
  三項維持未達成，本輪未代為宣稱達成，也未代為拍板。

### 未越界與未回歸的驗證

- **AC 全節逐字未變**：以 `git show HEAD:<entity>` 取本輪改動前版本，切出 `## Acceptance criteria` 至 `## Test plan` 之間整段字串比對，相同。另單獨確認 AC-1 的兩條正規式原樣仍在。
- **F5 未動**：`git diff --stat -- src/components` 為空。
- **產線檔與 main 逐位元相同**：`discussions.json` = `4071978a…3162`、`history.json` = `4d1992e3…cea3b`，與 `git show main:<path>` 的 sha256 相同。未執行 `npm run sync-content`。
- **測試無回歸**：`node --test` 為 `tests 24 / pass 23 / fail 0 / skipped 1`，與 cycle 2 相同（skip 者為 AC-6）。
- **建置無回歸**：`npm run build` exit 0；`npx tsc --noEmit` exit 0；`npx eslint` 0 error。
- **未暫改候選檔**：本輪的修改都不影響渲染輸出，測試本身即以 `renderToStaticMarkup` 渲染四個元件並通過，無需另起 dev server。

### Summary

三項授權修正全部完成。F1 補了索引的四個日期，並把票內兩條「照字面做不到」的 INDEX 指示改寫成
與實際粒度一致的說法——reviewer 只點名一條，實際上兩條同病，一併處理；原文以補述逐字保留。
F2 的檔頭補述、F3 的 dead export 移除都已落地。

F3 選擇移除而非保留，關鍵理由不是「沒人用」，是**它指向規則期的錯 pcode**：
留一個零引用但會把人導向錯法規的常數，比沒有常數更危險。它原本承載的出處資訊沒有遺失，
改記在 `ERAS` 旁邊，並明列兩個 pcode 各管哪幾個公布日。

F4／F5 依 FO 指示原樣不動，AC 全節經比對逐字未變。AC-3、D5、`c3` 三項仍為未達成項。

## Stage Report: review (cycle 2)

我是上一輪判 REJECTED 的同一個 reviewer。本輪只重驗 F1／F2／F3 的修正、以及有沒有越界或回歸；
F4／F5 依授權維持 hold，我未要求本輪處理，也未自行處理。

- DONE: 獨立重驗 F1 的兩半
  **第一半（四列日期）**：`docs/INDEX.md` 的 diff 就是四個日期字串，`AGENTS.md`／`architecture.md`／`design-system.md`／`tech-stack.md` 四列由 `2026-09-01` 改為 `2026-09-23`，其餘列一字未動。**未替本票破例加列已實證**：main 與 HEAD 的 `docs/INDEX.md` 皆為 **179 行**，行數相同，`--numstat` 為 `4 4`。
  **第二半（改寫那句做不到的指示）**：以 design 階段原始 commit `497da2b` 抽出 `## Documentation impact` 中全部 `docs/INDEX.md` 開頭的條目，**共 2 條**——證實 dispatch 說的孿生問題屬實，`實作後更新` 帶著同一句做不到的指示，**我上一輪只點名了 `現在更新` 那條**。兩條原文**都逐字保留**（程式比對 `includes` 皆 true），且**都落在「### 現在更新」之前、標記 2026-09-23 的補述區塊內**，正文只留改寫後的版本，不會同時掛著兩套互相矛盾的指示。符合 `AGENTS.md`「不要悄悄改寫原文」。
- DONE: 查核改寫後文字引用的兩處證據
  不採信轉述，逐項實讀：`docs/INDEX.md` 第 96 列確為 `| `docs/constitution-features/` | 33 個封存 entity、7 個進行中、6 份 debrief | record | — | 2026-09-03 |`，「目錄層級索引」的引用正確；`AGENTS.md:160` 確有那條 `for f in docs/constitution-features/0*.md; ... grep -m1 '^status:' ...` 指令，「狀態查詢方式」的指路可用。本票 frontmatter `status:` 亦確實存在。
- DONE: 獨立重驗 F2
  檔頭「三條不可違反的規則」第 3 條原句「規則期的門檻數字沒有第一手依據，不得填。見 D1。」**逐字仍在（grep 命中 1 次，一字未刪）**，其下追加標日期的 ⚠️ 補述：寫明前提已不成立、成因（當時只查 pcode A0030159、其歷史條文只回溯到 1958-07-21），並給出取代條款 `3'.`（條文取自 A0030300 的 1952-04-16 修正版、帶三項限制且三項必須顯示、仍不得寫出 1/2）。改法與 `AGENTS.md` 的追加補述原則一致。
- DONE: 獨立重驗 F3，並判定移除理由是否成立、出處資訊有無遺失
  **移除已實證乾淨**：`grep -rn LAW_HISTORY_URL` 掃全 repo（排除 `node_modules`／`.next`／`.git`），**程式碼中 0 處命中**，僅剩本票流程記錄與資料模組內一段說明移除理由的註解。對照組 `LAW_CURRENT_URL` 在同一次掃描命中第 104、333 行，證明掃描方法有效。
  **理由成立。** 該常數指向 `pcode=A0030159` 的沿革頁，名稱卻是通用的 `LAW_HISTORY_URL`，而我上一輪已實證 A0030159 的**歷史條文**不含《司法院大法官會議規則》。一個零引用、名稱通用、會把人導向查不到規則期條文之處的現成常數，確實比沒有常數更容易誤導——implement「留著等於給下一個維護者一條通往錯條文的捷徑」的判斷我同意，選擇移除優於只修註解。
  **出處資訊未遺失。** `ERAS` 的說明現已列明兩個 pcode 各管哪幾個公布日（A0030159 管 1958-07-21／1993-02-03／2025-01-23，A0030300 管規則期的 1948-09-16），兩個網址都還在檔內，且移除理由一併記在該處供追溯。以「出處該寫在資料旁邊、而不是一個沒人用的 export」而言，這是淨改善——A0030300 先前根本沒有被登記過。
- DONE: 確認未越界
  **AC 全節逐字未變**：與我上一輪的 commit `56829cf` 相比 `diff` 無輸出（BYTE-IDENTICAL）；再與 **design 原始 commit `497da2b`** 切塊比對，仍是 `changed == ['AC-1']`、其餘六項逐字相同。**AC-1 的兩條正規式詞彙表原樣仍在**（第 524 行），F4 未被動到。
  **F4／F5 零變動**：`git diff --stat 56829cf..HEAD -- src/components src/app scripts tests` 為空；`FACTORS` 整塊與上一輪 `diff` 無輸出。
- DONE: 確認未回歸
  `node --test` **23 pass／0 fail／1 skip**，與上一輪相同（skip 為未設 `THRESHOLD_LIVE` 的 AC-6）。清 `.next` 後 `npx tsc --noEmit` exit 0、`npm run build` exit 0。`discussions.json` `4071978a…`／`history.json` `4d1992e3…` 與 main 逐位元相同，`package.json` 與 main 無差異。
  **最強的一項證據**：重新渲染 `src/app/past/thresholds/page.tsx` 元件樹，得 **63496 bytes、可見文字 5937 字，與上一輪的 HTML 逐位元相同**（字串相等比對 true）。本輪改的是註解與文件，**使用者看到的輸出一個位元組都沒變**。全頁仍無 `1/2`、無「二分之一」；`N 人` 的 8 處命中仍全部屬 `current` 期或其條文原文，規則期附近 0 命中。三項限制與兩個 pcode 仍都在。
- DONE: 依指示尋找同型盲區的第八處（找到，記為 F6，未自行修）
  見下節。另附帶記一項測試瑕疵 F7。
- SKIPPED: F4（AC-1 詞彙表擴充）與 F5（用詞不固定）
  依授權 hold，已上呈 captain。本輪未動、也未要求動。
- SKIPPED: AC-3 朗讀測試、D5 視覺檢查、`c3` 的法學解讀
  三項維持未達成。本輪未代為宣稱達成，未代為拍板，未再嘗試無頭瀏覽器。

### F6 — 同型盲區的第八處：`c3` 的「不得出現換算後的人數」沒有任何自動守衛（Deferred risk）

這是 dispatch 要我找的同型第八處。形狀與前七處一致：**約束在文字上被反覆宣告為硬邊界，實際的檢查只覆蓋其中一個欄位，其餘形成穩定盲區。**

票內把這條講得很重——`c3` 標 `needsRuling: 'legal-reviewer'`，D1 補述第 3 項、verify cycle 2 的 Verdict、以及本輪 dispatch 都寫明「未拍板前站上不得出現換算後的人數」。但實際的自動檢查只有 `tests/threshold-analysis.test.mjs:447` 那一條 D1 測試，而它涵蓋的是：`rules.ruleSummary` 不含「總額」、含「在中央政府所在地全體大法官」，以及 `EraComparisonStrip` 的 HTML 不含 `1/2`／「二分之一」。

**沒有任何測試掃「換算後的人數」。** 若日後有人在 `RULES_ERA_CAVEATS` 的文字、`ThresholdBoundary` 的標籤、頁面外殼的說明段落、或 `OchreBandFactors` 裡寫進一個規則期的換算人數，**23 條測試會全綠**。這條邊界到目前為止是靠人工把關的：verify cycle 2 手跑一次正規式、我上一輪手跑一次、本輪再手跑一次。三輪都乾淨，但守的是人不是測試。

四項證據欄位：

- **已發布使用者與正常流程**：讀者開啟 `/past/thresholds` 看規則期的門檻敘述。
- **可觀察的損害**：目前 **0 處**（我本輪實掃確認），**所以是 Deferred risk 不是 Material**。損害是假設性的。
- **受影響的價值 AC 或不可逾越邊界**：`c3` 這條未拍板的法學邊界。不涉及任何 AC——AC-1 至 AC-7 都沒有涵蓋它，這正是盲區的成因。
- **觸發證據**：`grep` 全部 24 條測試，無一掃描人數樣式；D1 測試的斷言範圍如上列舉；本輪手動掃描仍需 reviewer 自行執行才能得到結論。

**升級為 Material 的條件**：任何一次編輯在站上引入規則期的換算人數。**建議 disposition：fix**——補一條掃全頁渲染輸出的測試即可，**這不是 AC 變更**（沒有任何 AC 的 `Verified by:` 需要改動），與 F4 的性質不同。但依 dispatch 指示，**本輪只提報不自行修**。

**一項該給的肯定**：`1/2` 與「二分之一」**兩種寫法都有測**（第 461–462 行），這一對不是盲區。前七處的教訓在這裡有被吸收，只是沒有延伸到人數。

### F7 — 一條恆真的斷言（Polish）

`tests/threshold-analysis.test.mjs:464`：

    assert.equal(/規則期[\s\S]{0,200}總額/.test(rules.ruleSummary), false);

`rules.ruleSummary` 的值是「在中央政府所在地全體大法官 2/3 以上出席，過半數同意」，**不含「規則期」三字**，因此這條正規式無論 `ruleSummary` 寫什麼都不可能命中，斷言恆真。**實質檢查由下一行 `rules.ruleSummary.includes('總額') === false` 完成**，所以沒有覆蓋損失，這條只是看起來在檢查、實際上是死的。附帶一提：`1/2`／「二分之一」的掃描只跑在 `EraComparisonStrip` 的 HTML 上，不是全頁——全頁掃描目前仍靠 reviewer 手動執行（與 F6 同源）。無使用者可見損失 → **Polish**。

### Verdict

**PASSED。**

上一輪的唯一阻擋項 F1 已修正，而且**修得比我要求的更完整**：我只點名了 `現在更新` 那一條做不到的 INDEX 指示，implement 自行抓到 `實作後更新` 帶著同一句孿生問題並一併改寫——這一點我實際比對 design 原始 commit 證實確有兩條，**是我上一輪漏看的**。四列日期改對、未替本票破例加列（行數與 main 同為 179）、兩條原文都逐字保留在標日期的補述內、引用的 INDEX 第 96 列與 `AGENTS.md:160` 兩處證據我都實讀核對無誤。

F2 的原句一字未刪並以補述更正；F3 的移除我判定理由成立——關鍵不在「沒人用」，而在它是一個名稱通用卻指向查不到規則期條文之處的現成常數，留著比拿掉更容易誤導；出處資訊沒有遺失，反而因為 A0030300 首次被登記而淨增。

**未越界**：AC 全節與上一輪逐位元相同，AC-1 的正規式詞彙表原樣仍在，F4／F5 零變動。**未回歸**：測試 23 pass／0 fail／1 skip、型別與建置皆 exit 0、產線兩檔與 main 逐位元相同，而且**重新渲染的頁面 HTML 與上一輪逐位元相同**——本輪只動註解與文件，使用者看到的輸出未變。

本輪新提兩項不阻擋的 finding：**F6 是 dispatch 要找的同型第八處**（`c3` 的「不得出現換算後的人數」無自動守衛，目前 0 處違反故為 Deferred risk，補測試即可且**不涉 AC 變更**）、**F7** 一條恆真斷言（Polish）。兩項都只提報、未自行修。

**PASSED 的範圍仍不包含三項未達成的驗證項**，gate 必須原樣呈現：**AC-3 朗讀測試**（`PENDING-CAPTAIN`）、**D5 行動版／桌機視覺檢查**（本環境無可用無頭瀏覽器）、**`c3` 的法學解讀**（未拍板前站上不得出現換算人數、不得斷言 1958 那次的方向）。F4／F5 維持 hold，等 captain。

### Summary

F1／F2／F3 三項授權修正全部重驗通過，且 F1 修得比我上一輪要求的更完整——implement 抓到我漏看的孿生條目（`實作後更新` 帶著同一句做不到的 INDEX 指示），我以 design 原始 commit 比對證實確有兩條、兩條原文都逐字保留在標日期的補述內、且未替本票在 INDEX 破例加列（行數與 main 同為 179）。F3 的移除理由我判定成立：問題不是零引用，而是一個名稱通用卻指向查不到規則期條文之處的常數；出處資訊改記在 `ERAS` 旁並首次登記 A0030300，未遺失反而淨增。

未越界未回歸皆已實證：AC 全節與上一輪逐位元相同（AC-1 正規式詞彙表原樣仍在）、F4／F5 零變動、測試 23 pass／0 fail／1 skip、型別與建置 exit 0、產線兩檔與 main 逐位元相同，**重新渲染的頁面 HTML 與上一輪逐位元相同（63496 bytes）**，全頁仍無換算後人數、無 `1/2`。

新提兩項不阻擋 finding：**F6**——dispatch 要找的同型第八處，`c3` 的「不得出現換算後的人數」三輪來都只靠人工掃描、無任何自動守衛，目前 0 處違反故列 Deferred risk，補一條全頁掃描測試即可且**不是 AC 變更**；**F7**——一條恆真的斷言（Polish）。兩項依指示只提報未自行修。判 **PASSED**；AC-3、D5、`c3` 法學解讀三項維持未達成，F4／F5 維持 hold。

## Stage Report: implement (cycle 3 續：F4／F5／F6／F7)

captain 於 2026-09-24 判 revise 並一次性授權：「授權修正 `Verified by:` 涵蓋既有寫法變體，不改 AC 要求本身。」

- DONE: F4 —— 擴充 AC-1 的守衛，讓全頁唯一同時出現 1987 與門檻主張的那句話落進守衛範圍
  **只擴充詞彙表不可能同時滿足兩個要求。** FO 要求「加入通過條件／表決條件／改低」且「現況必須綠、刪掉反駁子句必須紅」。但站上那句話**本身就含這些詞**（「把表決條件改低」），純詞彙表會讓現況直接變紅。兩個要求同時成立的唯一解，是讓守衛能分辨**誠實的講法與不誠實的講法**。
- DONE: F4 的實際做法 —— 句段 × 詞彙 × 歸屬 × 反駁
  把原始碼與**真實渲染文字**切成句段（句號、換行、HTML 標籤皆為邊界），句段同時出現 `1987` 與門檻詞彙時，**該句段必須同時帶歸屬標記與反駁標記**。誠實的講法是「歸屬給會議記錄並當場反駁」，不誠實的講法是把前半留下、後半刪掉 —— 舊守衛看不出這個差別。詞彙表擴充為 20 個詞（含 FO 指名的三個，另自行補上表決標準／通過標準／調降／下修／鬆綁／提高／調高／收緊／四分之三／過半數）。歸屬標記：會議記錄／會議原文／會議說／投影片。反駁標記：不成立／`1993-02-03`／時間順序。
- DONE: F4 的可失敗性實跑（四項，全部實際跑過並看到轉紅）
  (A) **FO 指名的情境**：刪掉 `f2` 的反駁子句只留前半 → **轉紅**，訊息指名該句段「沒有當場反駁」。(B) 刪掉歸屬「會議記錄說」、保留反駁 → **轉紅**。(C) 把主張改寫成詞彙表外的新說法「把通過標準放寬」 → **仍轉紅**（詞彙表夠寬）。(D) 把任一 `effectiveFrom` 改成 1987 → 轉紅（既有）。三次還原後皆回到全綠。
- DONE: F4 的一個中途修正 —— 兩個條件原本不獨立
  歸屬標記最初收了「會議的」，但反駁子句本身就寫著「**會議的**時間順序不成立」。結果情境 (B) 第一次跑**沒有轉紅**：刪掉「會議記錄說」仍能靠反駁子句裡的「會議的」蒙混過關。已把「會議的」從歸屬標記移除，改用「會議說」，兩個條件才真正獨立可失敗。若沒做情境 (B) 的實跑，這個洞不會被發現。
- DONE: F5 —— 用詞收斂為單一詞「門檻」
  **選「門檻」的理由**：它是本票標題（「解釋**門檻**與案件數量」）與 AC-1 要求文字用的詞，也是四個候選裡唯一非法律專有的日常詞；受眾是非法學背景讀者。改動 10 處：表決門檻→門檻（4）、通過條件→門檻（3）、表決條件→門檻（1）、法規變動→門檻變動（2）。真實渲染文字複驗：四個變體各 0 次，「門檻」30 次。`f3-1994-peak` 同卡片內混用兩種的問題隨之消失。
- DONE: F5 的成因已一併解除
  這些迴避寫法是被舊守衛的詞彙表逼出來的 —— 寫「門檻」會讓 AC-1 變紅，只好改寫成同義詞。F4 改成歸屬＋反駁之後，誠實的句子寫「門檻」也能過，迴避不再必要，收斂才站得住。
- DONE: F6 —— 補測試守著 `c3`「不得換算成人數」的承諾
  兩條測試。第一條掃**整頁**：把現行憲訴法自己的三個字串（`label`／`ruleSummary`／`quotedText`，人數來自條文原文不是換算）挖掉之後，全頁不得再剩任何 `N人`；並先斷言那三個字串確實出現在頁面上，否則挖除是空轉。第二條把範圍縮到規則期自己的 tile，斷言零人數，並斷言規則期條文原文確有渲染（證明不是整塊沒渲染造成的假綠）。
- DONE: F6 的可失敗性實跑
  在規則期 `ruleSummary` 插入「（約 11 人）」→ **兩條同時轉紅**。還原後回綠。
- DONE: F7 —— 兩條恆真斷言，都改成真的能失敗
  reviewer 指名的是 `assert.equal(79 + 233 + 501, 813)`：三個字面值相加，不碰程式碼也不碰 fixture，改壞任何東西都不會紅。改為「`STATS` 各期件數加總 === fixture 筆數」且「=== fixture 自行重算的三期件數加總」。**另有一條同病但未被指名**：`before.length + after.length === 79` —— `before` 與 `after` 是同一陣列切兩半，相加必然等於原長度，而原長度上一行剛斷言過，等於斷言 79 === 79。改為斷言切點後的第一筆是釋字第 3 號、日期 `1952-05-21`，並斷言 `before` 全部早於修正日。
- DONE: F7 的可失敗性實跑
  把 1993 邊界年的切分由 1/20 改成 0/20 → 「AC-2 三期件數」轉紅（原字面算式不會）。把 `amendedOn` 由 `1952-04-16` 改成 `1953-04-16` → 「D1 規則期 79 筆」轉紅（原恆真式不會）。
- DONE: 未越界 —— 除 AC-1 的 `Verified by:` 外，各 AC 的要求文字逐字未變
  以腳本切出七個 `AC-n` 區塊與改動前版本逐塊比對：唯一變動為 AC-1，且 **AC-1 的要求那一行（第一行）逐字未變** —— 仍是「圖上標示的四個門檻時點與法規公布日一致，且沒有一處把門檻變動寫成 1987 年。」變的只有底下的 `Verified by:`。AC-2 至 AC-7 逐字未變。
- DONE: 無回歸 —— 以真實渲染 HTML 複驗
  用副本作法（`tar` 出工作樹到 scratch、`cp -Rc node_modules`、**只在副本裡**停用 `LaunchGate` 的兩處早退、在副本起 dev server），取得 109612 bytes 的真實 HTML。三項限制全在、釋字第 1、2 號三處標示全在、兩個 pcode 都在來源清單、無 `1/2` 與「二分之一」、挖除現行憲訴法條文後全頁人數殘量 0。候選 worktree 全程未改動 `LaunchGate.tsx`（`git status` 對該檔為空）。
- DONE: 測試與建置
  **本輪前**：`tests 24 / pass 23 / fail 0 / skipped 1`。**本輪後**：`tests 26 / pass 25 / fail 0 / skipped 1`（新增兩條 `c3` 測試；skip 者仍為 AC-6）。`npx tsc --noEmit` exit 0；`npm run build` exit 0；`src/data/discussions.json`、`history.json` 與 main 逐位元相同；未執行 `npm run sync-content`。
- SKIPPED: AC-3 朗讀測試（D4）、D5 視覺檢查、`c3` 的法學解讀
  三項維持未達成，本輪未代為宣稱達成，也未代為拍板。**未斷言 1958 那次門檻變動的方向** —— 那正是 `c3` 待拍板的問題。

### 一項既有狀況（非本輪造成，未處理）

`npx eslint src tests` 有 4 個 error，全部在 `src/components/LaunchGate.tsx` 與 `src/components/Navbar.tsx`，
規則為 `react-hooks/set-state-in-effect`。**這兩個檔本分支從未改動**
（`git diff main...HEAD -- <兩檔>` 為空），在 main 上跑同一條指令同樣是 4 個 error。
我自己的檔案（`src/components/threshold-analysis/`、`src/data/threshold-analysis.ts`、
`src/app/past/thresholds/`、`tests/`、`scripts/`）單獨 lint 為 0 error 0 warning。
先前各輪的 lint 都只掃自己的路徑，所以沒看到這一項。列出供 gate 判斷是否另開票，本輪未動。

### Summary

四項全部完成，四項都做了可失敗性實跑。

**F4 的關鍵判斷**：FO 要的「擴充詞彙表」與「現況綠、刪反駁轉紅」兩個條件，用純詞彙表**無解**——
站上那句話本身就含要加入的詞。唯一解是讓守衛分辨誠實與不誠實的講法，
因此改成「句段內同時出現 1987 與門檻詞彙時，必須同時帶歸屬與反駁」。
這正好對上 FO 轉述 `063` 的根因：**檢查的涵蓋面要對齊它宣稱要涵蓋的語意，而不是對齊某一次的寫法。**
AC-1 宣稱要涵蓋的語意是「頁面沒有把門檻變動寫成 1987 年」，而不是「頁面沒有出現某四個詞」。

**中途抓到自己的洞**：情境 (B) 第一次實跑沒轉紅，因為歸屬標記收了「會議的」，
而反駁子句本身就含這三個字，兩個條件因此不獨立。不做這次實跑就不會發現。

F5 收斂到「門檻」（本票標題與 AC 要求用的詞，也是最不專業術語的一個），
並說明它的成因隨 F4 一併解除。F6 補上守著 `c3` 承諾的兩條測試。
F7 修了 reviewer 指名的那條，也修了另一條同病但未被指名的。

## Stage Report: review (cycle 3)

同一個 reviewer。F4／F6 是我提的，本輪用同一套標準複驗，沒有因為是自己提的而放寬。
**全部突變都在 worktree 外的副本進行**（`git archive HEAD` + `cp -Rc node_modules`），
候選位元組與 git HEAD 全程未動（`git status` 前後皆空）。副本基線先實跑確認 25 pass。

- DONE: 實質評估 F4 的新守衛設計，不只確認它能跑
  **設計判斷正確，而且是唯一解。** FO 指定的「純粹擴充詞彙表」確實不可滿足：F5 把用詞收斂回「門檻」之後，站上那句誠實敘述本身就寫著「把**門檻**改低」，舊正規式 `/1987[^0-9]{0,12}(門檻|…)/` 會直接命中（「1987」後 6 字即「門檻」），現況必然變紅。要同時做到「現況綠、刪反駁紅」，守衛就必須能分辨**誠實與不誠實的講法**，而不是分辨用了哪個詞。
  改法把提問從「這兩個詞有沒有靠在一起」換成「靠在一起時，這句話有沒有歸屬並反駁」。**這正好對上 `063` 指出的根因**：檢查要對齊它宣稱涵蓋的語意。AC-1 宣稱的語意是「頁面沒有把門檻變動寫成 1987 年」，不是「頁面沒出現某四個詞」。舊查法會懲罰誠實用詞、逼出迴避同義詞（F5 的五種變體就是這樣長出來的），新查法解除了這個壓力——**F4 與 F5 是同一個病的兩面，一起修才站得住**，這點 implement 判斷正確。
- DONE: 自行重現四個情境的可失敗性，並確認各自失敗的**原因**正確
  在副本實跑：**(D) 原樣 → 25 pass 全綠**。**(A) 刪反駁子句只留前半 → 轉紅**，失敗訊息為「卻沒有**當場反駁**」。**(B) 刪歸屬「會議記錄說」保留反駁 → 轉紅**，訊息為「卻沒有**歸屬給會議記錄**」。**(C) 改寫成詞彙表外的說法「把通過標準放寬」 → 仍轉紅**。(AB) 兩者都刪 → 轉紅（歸屬斷言先拋，只顯示第一個原因，屬斷言順序，非缺陷）。三次還原後皆回到 25 pass。
- DONE: 獨立確認 implement 自陳的陷阱真的修好了——兩個條件現在獨立
  反駁子句「…且案件量自 1986 年起已在回升，**會議的**時間順序不成立」確實含「會議的」；而現行 `ATTRIBUTION_MARKERS = ['會議記錄','會議原文','會議說','投影片']` 對該子句的命中數為 **0**（逐項實算）。因此情境 (B) 不可能靠反駁子句蒙混，實跑也確實轉紅。**若歸屬標記仍收「會議的」，(B) 會假綠**——implement 說「不做這次實跑就不會發現」是對的，這也是我沒有採信自我回報、自己重跑的原因。
- DONE: 獨立重驗 F5
  真實渲染文字實測：**表決門檻／通過條件／表決條件／法規變動／表決標準／通過標準各 0 次**，「門檻」為唯一用詞。`f3-1994-peak` 同卡片內混用兩詞的問題消失。選「門檻」的理由成立——它是本票標題與 AC-1 要求文字用的詞，也是四個候選裡最不專業術語的一個，受眾是非法學讀者。
- DONE: 獨立重驗 F6 與 F7 的可失敗性
  **F6**：在規則期 `ruleSummary` 插入「（約 11 人）」→ **兩條 `c3` 測試同時轉紅**。
  **F7 修好的兩條**：`ERA_YEAR_SPLITS` 1993 由 1/20 改 0/21 → 「AC-2 三期件數」**轉紅**；1994 年 count 37→36 → 亦**轉紅**；`amendedOn` 1952-04-16 改 1953-04-16 → 「D1 規則期 79 筆」**轉紅**。（我第一次選的 lever 是把 `effectiveFrom` 由 `1993-02-03` 改 `1993-01-01`，沒轉紅——那是我選錯了：`totalCount` 取的是年份桶＋`ERA_YEAR_SPLITS`，同年改日不動結果。換對 lever 後兩條都確實可失敗。）
- DONE: 確認未越界
  **AC-1 的要求那一行逐字未變**：`497da2b`（design）／`0cc7c7e`（我上一輪）／`HEAD` 三者比對，皆為「**AC-1 — 圖上標示的四個門檻時點與法規公布日一致，且沒有一處把門檻變動寫成 1987 年。**」變動全部在 `Verified by:` 之下，且舊的兩條正規式以歷史說明的形式**原文保留**，符合 captain 的一次性授權與 `AGENTS.md`「不要悄悄改寫原文」。**AC-2 至 AC-7 與 design 原始版逐字相同**（切塊比對，`changed == ['AC-1']`）。
- DONE: 確認未回歸
  `node --test` **26 tests／25 pass／0 fail／1 skip**（skip 為未設 `THRESHOLD_LIVE` 的 AC-6）。清 `.next` 後 `npx tsc --noEmit` exit 0、`npm run build` exit 0。產線兩檔**建置後**仍與 main 逐位元相同，`package.json` 與 main 無差異。自行渲染頁面（63454 bytes）複驗：三項限制全在且未摺疊、`c3` 帶「待確認·法學背景審閱者」、釋字第 1、2 號圖下註腳在、兩個 pcode 都在來源清單、無 `1/2` 無「二分之一」、斜線網底與「無釋字資料」在。**挖除現行憲訴法自己的條文字串後，全頁換算人數殘量 NONE。**
- DONE: 裁量 eslint 的 4 個 error —— **不該由本票處置**
  獨立核對：`npx eslint src tests` 為 4 errors／6 warnings，規則皆為 `react-hooks/set-state-in-effect`；我另把 **main** 單獨 checkout 出來跑同一指令，同樣是 **4 errors／6 warnings**，證實與本分支無關；四個檔 `git diff main...HEAD` 皆為空（從未觸碰）；本票自己的路徑 lint **exit 0、0 error 0 warning**。**一項更正**：implement 寫「全部在 `LaunchGate.tsx` 與 `Navbar.tsx`」，實際散在**四個**檔各一個——`LaunchGate.tsx`、`Navbar.tsx`、`BottleneckFunnel.tsx`、`TrackCards.tsx`。結論不受影響：既有、與本功能無關、main 上同樣存在，**在本票修它是 scope creep**（review 階段定義明文禁止把新要求塞進 review）。建議另開票。
- SKIPPED: AC-3 朗讀測試、D5 視覺檢查、`c3` 的法學解讀
  三項維持未達成。未代為宣稱達成、未代為拍板、**未斷言 1958 那次門檻變動的方向**，未再嘗試無頭瀏覽器。

### F8 — 第十處：`c3` 守衛的涵蓋面比它的名字窄（Deferred risk）

這是 dispatch 要我找的第十處，而且就在本輪的修正裡。

**決定性實驗（副本內實跑）**：我把換算人數寫進 `src/app/past/thresholds/page.tsx` 的外殼文字——
把「四個時期的門檻，對上 1949 至 2026 年的案件量。」改成
「四個時期的門檻**（規則期約 11 人出席）**，對上…」——**25 條測試全部保持綠**。

成因：名為「c3 **站上**不得出現換算後的人數」的那條測試，實際只渲染 `ThresholdCaseAnalysis` 這個元件，
**沒有渲染 `page.tsx`**。頁面外殼（大標、前言三段、「資料來源」清單、`metadata.description`）全在守衛之外。

**這正是 `056` 那一處的形狀，而且是分岔的版本**：AC-1 的守衛掃 `SCANNED_SOURCES`
（其中**含** `src/app/past/thresholds`）**外加**渲染文字，所以寫進 `page.tsx` 原始碼的 1987 主張**會**被抓到；
`c3` 的守衛沒有這層原始碼掃描做後盾，同一個位置對人數就完全不設防。
**兩個都宣稱是全頁級的檢查，一個有後盾一個沒有。**

四項證據欄位：

- **已發布使用者與正常流程**：讀者開啟 `/past/thresholds`，讀大標與前言，或看頁尾「資料來源」。
- **可觀察的損害**：**目前 0 處。** 我自行渲染整頁（含外殼）實掃，人數殘量 NONE。損害是假設性的。
- **受影響的價值 AC 或不可逾越邊界**：`c3` 這條未經法學拍板的邊界。**不涉任何 AC**。
- **觸發證據**：上述注入實驗，25 條全綠（副本內進行，候選未動）。

**分類：Deferred risk**（與我上一輪對 F6 的分類一致——目前無違反，故不阻擋）。
**升級為 Material 的條件**：任何一次編輯把換算人數寫進 `page.tsx`。
**建議 disposition：fix**，改法便宜——把那條測試改成渲染 `page.tsx`（我每輪都這樣渲染，`next/link` 以 stub 代換即可），
或比照 AC-1 加上 `SCANNED_SOURCES` 做後盾。**不是 AC 變更**，`Verified by:` 也不必動。
依 dispatch 指示只提報，未自行修。

### F9 — 反駁標記 `1993-02-03` 太弱，有一條假綠路徑（Deferred risk）

我自己的對抗性探測，不在 implement 跑的四個情境內。把 `f2` 的 `uncertainty` 換成：

> 「會議記錄說 1987 年修法把門檻改低，案件因此暴增；另外 1993-02-03 也修過法。」

這句**主張了錯誤因果且完全沒有反駁**，只是順帶提到那個日期——**守衛放行，測試全綠。**

成因：`REBUTTAL_MARKERS = ['不成立', '1993-02-03', '時間順序']` 是 OR，而**一個裸日期不構成反駁**。
另外兩個標記（不成立／時間順序）是語意標記，夠強；`1993-02-03` 是字串標記，而該日期在全頁到處合法出現
（四期資料、`f2` 的 `claim`、色帶標籤），拿它當反駁證據太鬆。

現實中最可能的回歸是「刪掉反駁子句」，那一條**有被抓到**（情境 A 轉紅），所以這不是主要路徑；
但「為了精簡改寫句子」很容易落進這個縫。

**分類：Deferred risk。目前 0 處違反。**
**升級條件**：任何一次編輯拿掉反駁、只留日期提及。
**建議 disposition：fix**——把 `1993-02-03` 從反駁標記移除（留下兩個語意標記即可），
或要求「日期＋語意標記」並存。屬 `Verified by:` 的查法細節，**不動 AC 要求**。

**附帶觀察（不列為 finding）**：句段以「。」為邊界，因此**誠實文字若拆成兩句會誤判為紅**
（我實測：把歸屬與反駁拆成兩個句號段，測試轉紅）。它**往安全方向失敗**，不構成漏網，
但等於要求未來的編輯者把歸屬與反駁寫在同一個句號段內。值得在改 F9 時一併考慮。

### F10 — 我的 F7 被誤植，我指名的那條仍然恆真（Polish）

本輪票內記「reviewer 指名的是 `assert.equal(79 + 233 + 501, 813)`」。**我指名的不是那條。**
我上一輪的 F7 指名的是 `tests/threshold-analysis.test.mjs:464`：

    assert.equal(/規則期[\s\S]{0,200}總額/.test(rules.ruleSummary), false);

它**現在仍在**（行號移到 544），而且仍然是死的：`rules.ruleSummary` 的值是
「在中央政府所在地全體大法官 2/3 以上出席，過半數同意」，**不含「規則期」三字**，正規式恆不命中。
我實證：把 `ruleSummary` 換成明顯違規的「總額 2/3 出席，約 11 人」，**該條斷言仍然通過**。

**這不影響覆蓋**——下一行 `rules.ruleSummary.includes('總額') === false` 做的是真的檢查，
而人數已由本輪新增的 `c3` 測試守住。implement 自行找出並修好的那兩條恆真斷言
（`79+233+501` 與 `before.length + after.length === 79`）**都是真的問題、也都真的修好了**（我已實證可失敗），
價值不比我指名的那條低。

**分類：Polish。** 提報的目的有二：那條斷言仍該處理；以及**票內對我的 finding 的轉述是錯的，記錄應更正**——
這張票的流程記錄會被後續參考，誤植會讓人以為該類問題已清乾淨。

### Verdict

**PASSED。**

F4／F5／F6／F7 四項我全部自行重現，不採信自我回報：四個可失敗性情境**加上我自己的兩個對抗性探測**
都在副本內實跑，紅綠與失敗原因逐一核對；獨立性以逐項命中計算證實（反駁子句對四個歸屬標記命中數為 0）。
**F4 的設計我判定為實質正確且是唯一解**，不只是「能跑」：純詞彙表在 F5 收斂後必然讓誠實文字變紅，
把提問改成「歸屬＋反駁」才同時滿足兩個要求，而且解除了逼出迴避同義詞的壓力——F4 與 F5 是同一個病的兩面。

未越界：**AC-1 的要求那一行在 design／上一輪／本輪三版逐字相同**，改動全在 `Verified by:` 之下且舊正規式原文保留；
AC-2 至 AC-7 與 design 原始版逐字相同。未回歸：25 pass／0 fail／1 skip、`tsc` 與 `build` exit 0、
產線兩檔建置後仍與 main 逐位元相同、渲染頁面的三項限制與三處標示與兩個 pcode 全在、全頁換算人數殘量 NONE。

eslint 的 4 個 error 判定**不由本票處置**：既有、main 上同樣存在（我單獨 checkout main 實測同為 4 errors／6 warnings）、
四個檔本分支從未觸碰、本票自身路徑 0/0。在此修它是 scope creep。附帶更正 implement 少報了兩個檔。

三項新 finding 全部**不阻擋**，與我上一輪對 F6 的分類標準一致（目前 0 處違反者列 Deferred risk，不阻擋）：
**F8 是第十處**，也是三者中最該在收票前處理的——`c3` 守衛只渲染元件不渲染 `page.tsx`，
我把人數注進頁面外殼後 25 條全綠；**F9** 反駁標記收了裸日期，我的對抗性探測讓一句沒反駁的錯誤因果過關；
**F10** 我的 F7 被誤植、我指名的那條仍恆真。三者皆非 AC 變更，改法都便宜。

**PASSED 的範圍不含三項未達成的驗證項**，gate 必須原樣呈現：**AC-3 朗讀測試**（`PENDING-CAPTAIN`）、
**D5 行動版／桌機視覺檢查**（本環境無可用無頭瀏覽器）、**`c3` 的法學解讀**（未拍板前站上不得出現換算人數、
不得斷言 1958 那次的方向——本輪頁面兩者皆守住）。

### Summary

F4 的新守衛我判定實質正確：FO 指定的純詞彙表在 F5 收斂後**必然**讓站上那句誠實敘述變紅（「把**門檻**改低」），
唯一解是讓守衛分辨誠實與不誠實的講法。四個情境我全部自行實跑並核對失敗原因——刪反駁報「沒有當場反駁」、
刪歸屬報「沒有歸屬給會議記錄」、詞彙表外的新說法仍紅、原樣全綠；兩個條件的獨立性以命中計算證實
（反駁子句含「會議的」但對四個歸屬標記命中 0），implement 自陳的陷阱確實修好。
F5 五種變體在渲染文字中各 0 次、F6 與 F7 的可失敗性我換對 lever 後全部實證轉紅。

未越界未回歸：AC-1 要求行三版逐字相同、AC-2 至 AC-7 與 design 逐字相同、25 pass、`tsc`／`build` exit 0、
產線兩檔逐位元相同、全頁換算人數殘量 NONE。eslint 4 error 判定不由本票處置（main 上同樣存在，四檔從未觸碰）。

新提三項不阻擋 finding：**F8（第十處）**——`c3` 守衛只渲染元件不渲染 `page.tsx`，我把人數注進頁面外殼後
25 條全綠，且與 AC-1 守衛有原始碼掃描後盾形成分岔；**F9**——反駁標記收了裸日期 `1993-02-03`，
我的對抗性探測讓一句沒反駁的錯誤因果過關；**F10**——我的 F7 被誤植，我指名的那條恆真斷言仍在。
三者皆 Deferred risk／Polish、皆非 AC 變更。判 **PASSED**；AC-3、D5、`c3` 法學解讀維持未達成。

## Stage Report: implement (cycle 4：F8／F9／F10)

captain 於 2026-09-24 判 revise。三項都是 reviewer 用對抗性探測打穿上一輪守衛後找出來的。

- DONE: F8 —— `c3` 的守衛改為涵蓋整個頁面的渲染輸出
  上一輪的守衛只渲染 `ThresholdCaseAnalysis`，不渲染 `page.tsx`。**reviewer 把換算人數注進頁面外殼，25 條全綠。** 已改為渲染 `@/app/past/thresholds/page`，涵蓋外殼與元件子樹。
- DONE: F8 的前置障礙 —— 讓 `page.tsx` 在測試裡渲染得起來
  `page.tsx` import `next/link`，而 `next` 的 `package.json` **沒有 `exports` 欄位**，ESM 解析無副檔名的裸子路徑會失敗（CJS 會自動補 `.js`，ESM 不會）。這正是上一輪守衛只掃元件的原因。已在 `tests/tsx-loader.mjs` 加一層 fallback：**只在 Node 自己解析失敗時**才補 `.js` 重試，本來解析得動的路徑一律不碰。整頁現在渲染出 57801 bytes。
- DONE: F8 的可失敗性實跑（照 reviewer 的手法）
  把「當時全體大法官 17 人，三分之二即 12 人。」注進 `page.tsx` 的導言段落 → `c3 站上不得出現換算後的人數` **轉紅**，訊息指名 `17 人,12 人`。還原後回綠。
- DONE: F8 的同型問題一併修掉 —— AC-1 的守衛也只掃元件
  FO 只點名 `c3`，但 **AC-1 的 1987 守衛有一模一樣的窄涵蓋面**：它的 `<rendered page>` 那一路也只渲染元件。AC-1 宣稱的是「**頁面**沒有把門檻變動寫成 1987 年」，涵蓋面就必須是整頁。已一併改為整頁渲染。另把 D1 那條「圖下固定註腳」的斷言也改用整頁，避免註腳日後搬到外殼時誤紅。
- DONE: F9 —— 反駁標記改為要求反駁的語意
  原標記為 `['不成立', '1993-02-03', '時間順序']`。**裸日期不構成反駁** —— 一個日期可以出現在任何句子裡；「時間順序」也可以是「時間順序如下」。兩者都被移除。新標記為 `['不成立', '不符', '並非', '站不住', '並不是']`，每一個都是明確否定該主張的詞。
- DONE: F9 的可失敗性實跑（重現 reviewer 的探測）
  把 `f2` 改成「會議記錄說 1987 年那次修法把門檻改低、並因此造成案件暴增，相關日期為 1993-02-03。」—— 帶歸屬、含門檻詞彙、只有裸日期、沒有反駁 → AC-1 **轉紅**，訊息把整句抄出來並指名「沒有當場反駁」。還原後回綠。
- DONE: F10 —— 找出 reviewer 真正指的那條恆真斷言
  **我的認定：`AC-4` 裡的 `settled.length === FACTORS.length - needsRuling.length`。依據三點**：(a) 它確實恆真 —— `settled` 與 `needsRuling` 是同一個陣列依同一條件切兩半，這個等式對任何陣列都成立，改壞任何一項的 `needsRuling` 都不會紅；(b) 它在 reviewer 提 F7 的那一輪就已存在；(c) 它與我上一輪**確實修掉**的 `before.length + after.length === 79` 是**同一個分割恆等式的另一個實例** —— 我上一輪把 reviewer 的描述對應到了同型的另一處，這正好解釋「誤植」怎麼發生的。
- DONE: F10 —— 不賭單一指認，把整類清掉（共三條）
  既然無法百分之百確定 reviewer 指的是哪一條，我逐條掃過全部斷言，把**所有不可能失敗的**都改掉：
  **(1) `AC-4` 的分割恆等式** → 改為 `assert.deepEqual(settled.map(id), ['f5-excluded-cases'])` 加 `needsRuling.length === 4`，指名「哪一項不必拍板」。
  **(2) `D1` 的 `/規則期[\s\S]{0,200}總額/.test(rules.ruleSummary) === false`** → 該正規式要求 `ruleSummary` 內出現「規則期」，但「規則期」是 `label` 不是 `summary`，**永遠不可能命中**，`.test()` 恆為 `false`。已移除，並把真正要守的語意擴大到整個規則期 tile 的渲染輸出（`c3` 說「在中央政府所在地全體大法官」與「總額」不是同一個概念，那就不只一個欄位不能混用）。
  **(3) `AC-1` 裡我上一輪自己加的 `segmentsOf(String(1987))`** → 拿硬寫的字串去問守衛，那字串當然沒有門檻詞彙，恆為 0。改為問**資料模組裡真正那一行**（`/year: 1987\b/` 命中的句段），句段切法壞掉就會紅。
- DONE: F10 的可失敗性實跑（三條各一次）
  (1) 把 `f5-excluded-cases` 的 `needsRuling` 改成 `'legal-reviewer'` → `AC-4 OchreBandFactors…` **轉紅**（原恆真式不會）。(2) 把規則期 `ruleSummary` 改成「總額 2/3 之出席，過半數同意」→ `D1 規則期已補上一手條文…` **轉紅**（原恆真式不會）。(3) 把句段切法的句號邊界拿掉，讓 `YEARS` 那一大塊與門檻詞彙併段 → `AC-1 沒有一處…` **轉紅**。三次還原後皆回全綠。
- DONE: 未越界
  **所有 AC 的要求文字逐字未變** —— 以腳本切出七個 `AC-n` 區塊與改動前版本逐塊比對，**七塊全部逐字相同（本輪連 `Verified by:` 都沒動到 AC 文字，改的都在測試檔）**。eslint 的 4 個既有 error 未動（仍為 4，全在本分支從未觸碰的 `LaunchGate.tsx`／`Navbar.tsx`；本票自身路徑 0/0）。未動 `src/data/*.json`，未執行 `npm run sync-content`。未代為拍板 `c3`，**未斷言 1958 那次門檻變動的方向**。
- DONE: 無回歸
  以整頁渲染複驗：三項限制全在、釋字第 1、2 號三處標示全在、兩個 pcode 都在來源清單、無 `1/2` 與「二分之一」、挖除現行憲訴法自身條文後全頁人數殘量 0、F5 的四個變體各 0 次。**本輪的驗證一律用 `grep -o … | wc -l` 計數、用 Node 的 `Set` 去重，沒有用 `sort | uniq -c` 或 `sort -u` 判定任何中文字串**（環境註記的 BSD locale 併字問題）。
- DONE: 測試與建置
  **本輪前**：`tests 26 / pass 25 / fail 0 / skipped 1`。**本輪後**：`tests 26 / pass 25 / fail 0 / skipped 1`（條數不變 —— 本輪是把既有守衛改成真的守得住，不是加新守衛）。`npx tsc --noEmit` exit 0；`npm run build` exit 0。
- SKIPPED: AC-3 朗讀測試（D4）、D5 視覺檢查、`c3` 的法學解讀
  三項維持未達成，本輪未代為宣稱達成，也未代為拍板。
- SKIPPED: eslint 的 4 個既有 error
  依 FO 指示不在本票處置，屬 scope creep。

### Summary

三項全部完成，五次可失敗性實跑（F8 一次、F9 一次、F10 三次）全部看到轉紅再還原。

**F8 的根因是測試環境的一個限制被默默接受了。** 上一輪守衛只掃元件，不是因為我覺得元件就夠，
而是因為 `page.tsx` 在測試裡 import 不動 `next/link` —— `next` 的 `package.json` 沒有 `exports` 欄位。
當時我看到那個錯誤、改用元件渲染、就繼續往下走了，**沒有把「守衛涵蓋面因此縮小」這件事當成問題記下來**。
這比詞彙表不全嚴重：一個掃不到頁面外殼的守衛，宣稱守的是「站上」。修法是把 loader 補好，不是縮小宣稱。

**FO 只點名 `c3`，但同樣的窄涵蓋面在 AC-1 的守衛上一模一樣**，已一併改掉。
只修被點名的那一個，會留下同一個洞的另一半。

**F10 我沒有賭單一指認。** 我寫明認定是 `AC-4` 的分割恆等式並給出三點依據，
但既然無法百分之百確定，就逐條掃過全部斷言、把三條不可能失敗的一起改掉 ——
其中一條是我上一輪自己加的。上一輪的誤植說明「指名某一條」本身就不可靠，清掉整類才可靠。

## Stage Report: review (cycle 4)

F8／F9 是我自己加的對抗性探測打穿的，F10 是我上一輪的誤植。本輪用同一套標準檢查修法：
**每一個探測都自己重跑，不採信自我回報。** 全部突變在 worktree 外的副本進行
（`git archive HEAD` + `cp -Rc node_modules`），基線先確認 25 pass；候選位元組與 git HEAD 全程未動。

- DONE: 判定 loader 的修法穩健，**是真的修好，不是更隱晦的繞路**
  **成因我自行查證屬實**：`next@16.1.6` 的 `package.json` **確實沒有 `exports` 欄位**（實讀 `"exports" in pkg` 為 `false`），而未載 loader 時 `await import('next/link')` 確實以 `ERR_MODULE_NOT_FOUND` 失敗（CJS 會自動補 `.js`，ESM 不會）。這是 Node 的 ESM／CJS 互通缺口，不是本專案的設定問題。
  **修法的形狀正確**：補副檔名放在 `nextResolve` 的 `catch` 裡，**只在 Node 自己解析失敗後才觸發**，且限定「裸 specifier 且無副檔名」。我實證三件事：(1) 正常 import 不受影響——`react`／`react-dom/server`／`node:fs`／`typescript` 全部照舊解析；(2) 真正不存在的模組**仍然拋錯**、沒有被吞掉（`ERR_MODULE_NOT_FOUND`）；(3) `next/link` 解析到的是**真實模組而非 stub**（`String(default).includes('return p.children')` 為 `false`），渲染輸出含真的 `<a href="/past">` 與 `<a href="/future">`——**比我自己歷輪用的 stub 保真度更高**。
  **關鍵判斷**：上一輪的錯不在「遇到 loader 失敗」，而在**看到失敗就縮小涵蓋面且不記錄**。本輪把能力補起來、讓宣稱與涵蓋面重合，方向正確。implement 自評「這比詞彙表不全更糟：一條看不到頁面外殼、卻聲稱保護『站上』的守衛」，我同意這個自評，而且這正是本 session 反覆出現的那一類錯。
- DONE: 獨立重現 F8 的注入探測 —— `c3` 守衛，**當時全綠，現在轉紅**
  **我上一輪的原探測**（把「（規則期約 11 人出席）」注進 `page.tsx` 的副標）→ **`c3 站上不得出現換算後的人數` 轉紅**。另換一個外殼位置（注進頁尾免責聲明前）→ **同樣轉紅**。四個渲染點現在全部走 `renderPage()`／`pageVisibleText()`，`ThresholdCaseAnalysis` 已不再被單獨渲染（實查程式碼 0 處）。頁面外殼確實進了渲染輸出：大標、前言、副標、資料來源、A0030300、免責聲明、`next/link` 連結文字**七項全部 PRESENT**。
- DONE: 對 AC-1 的守衛做等效注入，並**追出它是被哪個掃描器抓到的**
  把不誠實的「1987 年門檻放寬，案件因此暴增」注進 `page.tsx` 外殼 → AC-1 轉紅，但失敗訊息前綴是 `src/app/past/thresholds/page.tsx`，**是原始碼掃描先抓到的**（`SCANNED_SOURCES` 本來就含該目錄）。因此我另做一個**只有渲染掃描能抓的決定性探測**：把同一句不誠實文字放進 `src/components/probe/Probe.tsx`（**三個被掃路徑之外**，已實查該文字不在三路徑內）再由 `page.tsx` 渲染 → **失敗訊息前綴為 `<rendered page>`**。
  **結論：AC-1 的加寬有獨立價值，不只是與原始碼掃描重複。** implement 超出 FO 的點名範圍（FO 只點 `c3`）把 AC-1 一併修掉是**實質正確**的——理由「只修被點名的那一個，會留下同一個洞的另一半」成立，而且我證明了那另一半真的是洞。
- DONE: 獨立重現 F9 的裸日期探測
  **我上一輪的原探測**（「會議記錄說 1987 年修法把門檻改低，案件因此暴增；另外 1993-02-03 也修過法。」——帶歸屬、含門檻詞彙、只有裸日期、完全沒有反駁）→ **轉紅**。另探測舊標記「時間順序」被非反駁地使用（「時間順序如下」）→ **也轉紅**。**誠實的現行文字（含「不成立」）保持綠。** 反駁標記改為只收明確否定語（不成立／不符／並非／站不住／並不是），確實從「出現了一個日期」變成要求反駁的**語意**。
- DONE: F10（a）—— **implement 的識別是錯的，我指名的不是 AC-4 那條**
  我不憑記憶，自 `git show 0cc7c7e` 取回我 cycle 2 的原文：我指名的是 `tests/threshold-analysis.test.mjs:464` 的 `assert.equal(/規則期[\s\S]{0,200}總額/.test(rules.ruleSummary), false)`，**不是** AC-4 的分割恆等式。implement 以三項證據推斷成 AC-4 那條，推斷錯了。
- DONE: F10（b）—— 三條替換**全部實證可失敗，且各自只打中該打中的測試**
  (1) 把規則期 `ruleSummary` 改用「總額 2/3 之出席」→ **只有 `D1 規則期已補上一手條文` 轉紅**。(2) 把 `f5-excluded-cases` 的 `needsRuling` 由 `null` 改為 `'captain'` → **只有 `AC-4 OchreBandFactors` 轉紅**。(3) 在 `year: 1987` 那一行尾端加註解「// 1987 年門檻放寬」，讓該句段帶門檻詞彙 → **只有 `AC-1 沒有一處…` 轉紅**。無交叉誤觸、無空轉。三條原式我也逐一確認**已從程式碼中消失**（只剩說明其被移除的註解）。
- DONE: F10（c）—— **同意掃全類的作法，而且本輪正好證明它是對的**
  implement 的識別錯了，但因為它**掃過每一條斷言、清掉整類**而非只動自己認定的那一條，**我真正指名的那條也被一併修掉了**。若它照自己的（錯誤）識別行事，我的 finding 會第二次存活——那正是上一輪發生的事。**掃全類把一次誤植從缺陷變成了無事件**，這是本 session 通則（檢查要對齊語意而非某一次的指認）在「修法」這一側的正確延伸。
  **但掃全類的可靠度取決於掃得乾不乾淨，所以我自己也掃了一遍**：139 條 `assert` 逐一檢視，找「兩側皆字面值」「同陣列切半相加」「目標必然不含樣式的正規式」三種形狀，**未發現殘留的恆真斷言**；另實證 `AC-4 圖元件不 import FACTORS` 那條（用 `stripComments` 後比對，所以元件裡「不得 import FACTORS」的註解不會誤觸）真的可失敗——在 `ThresholdChart` 實際 import `FACTORS` 後轉紅。
- DONE: 確認未越界
  **AC 全節與上一輪 `d10998c` 逐位元相同**；**AC-1 的要求那一行在 design／cycle2／cycle3／HEAD 四版逐字相同**；AC-2 至 AC-7 與 design 原始版逐字相同（`changed == ['AC-1']`）。eslint 的 4 個既有 error 依授權未動，本輪也不重新提起。未代為拍板 `c3`、**未斷言 1958 那次門檻變動的方向**、未宣稱 AC-3 或 D5 已達成。
- DONE: 確認未回歸
  **`src/` 自上輪起零變動**（`git diff --stat d10998c..HEAD -- src/` 為空），因此 shipped 程式碼無任何行為改變。`node --test` **26 tests／25 pass／0 fail／1 skip**。清 `.next` 後 `tsc --noEmit` exit 0、`npm run build` exit 0。產線兩檔**建置後**仍與 main 逐位元相同，`package.json` 與 main 無差異。整頁渲染複驗 14 項全 PASS（三項限制、`c3` 待確認標記、未摺疊、釋字第 1、2 號註腳、兩個 pcode、無 `1/2`、無「二分之一」、斜線網底、無釋字資料、F5 六個變體皆 0），**全頁換算人數殘量 NONE**。
- SKIPPED: AC-3 朗讀測試、D5 視覺檢查、`c3` 的法學解讀
  三項維持未達成，未代為宣稱達成、未代為拍板、未再嘗試無頭瀏覽器。

### F11 — AC-1 的 `Verified by:` 仍記載著已被 F9 移除的那份壞標記表（Material／本票所有）

**這是第十一處同型問題，而且方向反過來了**：前十處是「檢查的涵蓋面小於它宣稱的」，
這一處是**「規格記載的檢查已經不是實際執行的檢查」**——而且記載的那一份，正是 F9 要拔掉的那一份。

`docs/constitution-features/012-threshold-case-analysis.md:544`，位置在 `## Acceptance criteria`
之下、AC-1 的 `Verified by:` 之內（已實查小節歸屬，**不是 stage report**）：

> 歸屬標記：會議記錄／會議原文／會議說／投影片。反駁標記：不成立／`1993-02-03`／時間順序。

而 `tests/threshold-analysis.test.mjs:180` 實際是：

    const REBUTTAL_MARKERS = ['不成立', '不符', '並非', '站不住', '並不是'];

我把票內記載的三份清單與程式碼逐項程式比對，**分岔只有一處、乾淨地落在 F9 改的那一份**：

| 清單 | 程式碼 | 票內 AC-1 | 結果 |
|---|---|---|---|
| `THRESHOLD_TERMS` | 20 | 20 | MATCH |
| `ATTRIBUTION_MARKERS` | 4 | 4 | MATCH |
| `REBUTTAL_MARKERS` | 5 | 3 | **DIVERGENT** |

只在票內：`1993-02-03`／`時間順序`。只在程式碼：`不符`／`並非`／`站不住`／`並不是`。
**AC 全節與上一輪逐位元相同**，證實這一段本輪根本沒被動過——F9 只改了程式碼那一半。

四項證據欄位：

- **已發布使用者與正常流程**：reviewer 或下一個 agent 讀 AC-1 的 `Verified by:` 以重現驗證——
  **這正是 review 階段定義規定的方法**（"by reproducing its `Verified by:` clause"）。
- **可觀察的損害**：**現在就成立，不需要未來的編輯。** 規範條文描述的是 F9 剛拔掉的那個守衛，
  含那個裸日期標記。照條文重現會**重建那個洞**；若有人拿程式碼去對齊條文，會把 `1993-02-03` 放回去。
- **受影響的價值 AC 或不可逾越邊界**：**AC-1 的 `Verified by:` 本身**，也正是 captain
  一次性授權涵蓋的那段文字（「授權修正 `Verified by:` 涵蓋既有寫法變體」）。
  授權的修正只落實在程式碼、沒有帶進條文，**授權被執行了一半**。
- **觸發證據**：票內第 544 行 vs 測試第 180 行；上表的三份清單程式比對；
  AC 全節與 `d10998c` 逐位元相同。

分別提出（**本階段只做唯讀調查與副本突變，未動候選位元組，未改 AC，未重跑 reviewer**）：

- **Materiality：Material。** 與我對 F8／F9 判 Deferred risk 的差別在此：那兩項的損害需要一次未來的編輯才會發生；
  **這一項的文件現在就是錯的**，而文件正是 review 階段被指定要重現的東西。
- **Task ownership：本票所有。** 一行文字，不需任何人拍板，也不動 AC 的**要求**（只動 `Verified by:` 的記載）。
- **Disposition 建議：fix。** 把第 544 行的反駁標記改為程式碼實際的五個詞，並比照票內既有作法
  保留原文於標日期的補述（F9 的成因值得留：裸日期不是反駁語意）。
  **stage report 內的舊清單（如第 1350 行）不該改**——那是歷史記錄，依 `AGENTS.md` 原樣保留才對，我不要求動它。

### 兩項不阻擋的觀察

- **loader 的診斷訊息小瑕疵（Polish）**：補副檔名重試若也失敗，**escape 的是重試的錯誤而非原始錯誤**
  （`throw err` 在 `if (withExt) return withExt;` 之後，永遠到不了）。實測 `import('definitely-not-a-real-package-xyz')`
  的錯誤訊息指的是 `…-xyz.js`，不是原始 specifier。打錯套件名時訊息會略誤導。不影響正確性。
- **反駁標記表的用語剛性（觀察，非缺陷）**：用五個詞以外的反駁語會被誤判為紅——
  我實測「但這個說法錯了，實際公布日是 1993-02-03」→ 轉紅。它**往安全方向失敗**，不構成漏網，
  但等於要求未來的編輯者從那五個詞裡挑一個。這是標記表作法的固有代價，記錄供日後參考。

### Verdict

**REJECTED。**

**本輪要求的實質工作全部通過，而且做得比要求的多。** loader 是真的修好的
——成因我自行查證屬實（`next` 無 `exports`、裸 ESM 解析確實失敗），修法只在解析失敗後觸發、
不影響正常 import、不吞真錯誤，而且讓測試用上**真實的 `next/link`** 而非 stub，比我自己歷輪的 harness 更保真。
F8 兩個守衛都修了，我並用一個**只有渲染掃描能抓的探測**證明 AC-1 那一半確實是洞、
implement 超出 FO 點名範圍是對的。F9 我的裸日期探測現在轉紅、誠實文字保持綠。
F10 三條替換全部實證可失敗且互不交叉；我另自行掃過 139 條 `assert`，未發現殘留恆真斷言。
**F10（c）我明確同意掃全類**：implement 的識別其實錯了（我指名的是 D1 那條，不是 AC-4 那條），
但因為它清掉整類，我真正指名的那條也被修掉了——**掃全類把一次誤植從缺陷變成了無事件**。

**阻擋項只有 F11，而且只有一行**：AC-1 的 `Verified by:` 還記載著 F9 剛拔掉的那份反駁標記表
（含裸日期 `1993-02-03`）。我程式比對三份清單，分岔只此一處，乾淨地落在 F9 改的那一份。
判它 Material 而非 Polish 的理由只有一個，但我認為足夠：**review 階段定義規定 reviewer 以重現
`Verified by:` 來驗證 AC**，照現行條文重現會重建 F9 剛關掉的洞；而且 captain 的一次性授權
正是針對這段文字，現在只落實了程式碼那一半。

**給 gate 一條便宜的路**：F11 不動任何程式碼、不動 AC 的**要求**、不涉法學判斷，
就是把第 544 行的三個詞換成實際的五個詞並加一則補述。
**若 captain 認為不值得一輪，指示 FO 直接補這一行、無須重跑 reviewer，我不反對**
——我已重現本輪全部實質內容並確認無回歸，這一行是唯一的缺口。

**三項未達成的驗證項照舊必須在 gate 原樣呈現**：**AC-3 朗讀測試**（`PENDING-CAPTAIN`）、
**D5 行動版／桌機視覺檢查**（本環境無可用無頭瀏覽器）、**`c3` 的法學解讀**
（未拍板前站上不得出現換算人數、不得斷言 1958 那次的方向——本輪頁面兩者皆守住）。

### Summary

本輪的實質修法全部重現通過。loader 的成因我自行查證屬實（`next@16.1.6` 無 `exports` 欄位、
裸 ESM `import('next/link')` 確以 `ERR_MODULE_NOT_FOUND` 失敗），修法穩健：只在解析失敗後補副檔名、
正常 import 不受影響、真錯誤仍拋出，且讓測試用上真實 `next/link`（渲染出真的 `<a href>`）。
F8 的兩個守衛都涵蓋整頁了——我的原注入探測現在轉紅，並以一個**放在三個被掃路徑之外**的元件證明
AC-1 的渲染掃描有獨立價值，implement 自行超出 FO 點名範圍是對的。F9 我的裸日期探測轉紅、誠實文字保持綠。
F10 的識別其實錯了（我指名的是 D1 的 `規則期` 恆真式，非 AC-4 分割恆等式），**但掃全類讓誤植無害**，
三條替換各自實證可失敗且只打中自己的測試；我另掃 139 條 `assert` 未見殘留。
未越界：AC 全節與上輪逐位元相同、AC-1 要求行四版逐字相同、`src/` 零變動。未回歸：25 pass、
`tsc`／`build` exit 0、產線兩檔逐位元相同、整頁 14 項檢查全 PASS、換算人數殘量 NONE。

判 **REJECTED**，阻擋項只有 **F11**：AC-1 的 `Verified by:` 仍記載 F9 剛移除的壞標記表
（`1993-02-03`／`時間順序`），三份清單程式比對確認分岔只此一處。判 Material 的理由是
review 階段定義要 reviewer 重現 `Verified by:`，照現行條文重現會重建剛關掉的洞。
修法一行、不動程式碼也不動 AC 要求；**若 captain 認為不值得一輪，指示 FO 直接補這一行我不反對**。
另記兩項不阻擋觀察：loader 重試失敗時錯誤訊息指向補了副檔名的 specifier（Polish）、
反駁標記表要求從五個詞中選用（往安全方向失敗的固有代價）。AC-3、D5、`c3` 法學解讀維持未達成。
