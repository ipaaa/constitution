---
id: 051
title: 內容來源標記與可重跑的來源掃描
status: design
source: captain 2026-09-04（把關機制體檢第三類；captain 明確核准建立常設檢查）
started: 2026-09-30T17:18:46Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

內容上線後沒有任何方法知道它是誰寫的。要讓「站上不得有 AI 生成內容」這句話可查核，必須先有來源欄位，再有會失敗的檢查。

## Problem

**三條辨識路徑全部不可用**（已由體檢逐一查證）：

1. **資料層沒有來源欄位。** 全 repo `grep -rn "provenance|generated_by|written_by|ai_generated|content_source"` **零命中**。
2. **git 紀錄不可靠。** `docs/health-check/TODO.md` 的 P1-6 已查證：短評進入 repo 的 commit `75df766` **沒有** `Co-Authored-By` 標記，而確定為 agent 所寫的 `58c433e` **有**。同一批作業裡有標與無標並存，反推不出來。
3. **檔頭註解已被證明會造假。** `src/data/opinions.ts:11-12` 聲稱「No justice names（…）schema physically enforces」，同檔卻有 12 個真實姓名（見 feature 049）。已移除的 `cross-track-links.ts` 自述「curated editorial links — not auto-generated」，同樣與事實相反。

**唯一殘存的線索**是 `src/data/future.ts:333` 那句 `Researched synthetic records` —— 那是作者自己留的，不是機制產生的。

現行防線三道全部不是為此設計：佔位掃描只認 5 個**已經出過事**的字串且只跑同步的兩個檔；workflow 的 `verify` 階段只涵蓋走 workflow 的票的 diff，且 2026-05-01 才新增（`014`／`015`／`006` 都在它之前上線）；captain 對 PR diff 只涵蓋同步產生的兩個 json。

`docs/content-pipeline/design.md` 第六節不變式第 6 條已預先寫下判詞：

> 「大家記得不要做 X」不是機制，是願望。

## 為什麼這張票是常設檢查、且需要 captain 核准

FO 操作契約規定：建立**新的常設檢查或強制流程**（lint、review gate、CI lane、週期性驗證）是最後手段，只有在既有守衛、既有機械檢查、可證偽的實地演練都無法證偽該主張時才做，且需 captain 明確核准、正常應自成一票。

**captain 已於 2026-09-04 明確核准。** 本票即為那個「自成一票」。

理由是前三個較便宜的層級都已試過並失敗：沒有既有守衛涵蓋非 SSOT 內容；既有機械檢查（佔位掃描）只認 5 個字串且範圍錯；可證偽的實地演練無法進行——**因為沒有欄位可以查**。

## Proposed approach

**待 design stage 定案。** 兩層，順序不可反：

**第一層：來源欄位。** 沒有欄位，任何檢查都無從查起。待決：每筆資料加 `source`／`reviewed_by`，還是每檔強制檔頭？前者精確但改動大，後者便宜但**已被證明會造假**（見 Problem 第 3 點），因此若採檔頭必須配機械檢查。

**第二層：可重跑的掃描。** 涵蓋 `src/data/` 全部與元件硬編文案，取代現行只在同步內、只跑兩檔、只認 5 個字串的掃描。

**第三層（待決）：掛載點。** 目前無 `.github`、無 test script、無自訂 lint。第二層做出來也沒有東西會自動跑它。design stage 須決定掛在哪裡，或明確記錄「暫不自動化，由人手動跑」並說明為什麼可接受。

> 定案（2026-09-30 design）：見下方 `## Design（2026-09-30）`。三層都已定。上面原文保留。

## Risk evidence

未執行 spike。**design stage 必須先做一件事**：拿現有的 `src/data/` 八個檔試填來源欄位，確認「這筆是誰寫的」這個問題**實際上答得出來**。若多數內容連人都答不出來，第一層的設計要改成先處理「未知來源」這個狀態，而不是假設每筆都有答案。

> 2026-09-30 design 補述：spike 已做，結果見 `## Design（2026-09-30）` 第二節。
> 結論：「誰寫的」答得出來，而且答案幾乎全是 AI。答不出來的是「依據什麼」與「誰審過」。

## Design（2026-09-30）

### 一、要 captain 決定的事（一項）

**決定 A：來源掃描要不要成為上線條件？**

建議：**選 1。** 這就是 captain 9/30 方向第 3 點「AI 生成的內容不得上線」的機械版本。

| 選項 | 選了會怎樣 | 可逆嗎 |
|---|---|---|
| 1. 完整掃描綁進 P3-8（建議） | 站上每一段 AI 寫的文字，都要先經 `053` 處置（搬進試算表、補來源並由人審、或刪除），網站才能對外發布。第一次跑預期有數十處不過（第二節）。發布時間取決於 `053` 做多快 | 可退。從 P3-8 刪掉一行即可 |
| 2. 只綁「有沒有標記」，不綁「是不是 AI 寫的」 | 新加而沒標記的內容擋得住。既有的 AI 內容照樣上線。方向第 3 點在發布時不成立 | 可退 |
| 3. 不綁，人手動跑 | 沒有東西會擋。與今天相同，只多一份報告 | 可退 |

三個選項都不動網站本身，都可以改回來。

**不問 captain、我已自行決定的事**（做完會在 gate 告知）：

- 標記放在一份清單檔，不放在每筆資料裡，也不放在檔頭註解（第三節）。
- workflow 的 `verify` 階段一律跑「有沒有標記」那一半（第五節）。不論決定 A 怎麼選都做。
- 掃描照 `AGENTS.md` 第 5 條**字面**執行。第 5 條只允許兩類 AI 內容：試算表核可內容與 T3。

**captain 需要知道、但不必現在決定的事**：照字面執行，`threshold-analysis.ts`、`ruling-threshold.ts`、`verified-case-refs.mjs` 也會不過。
這三個檔由 agent 依官方一手來源寫成，經 workflow 審過（`012`、`066`、`064`）。
但它們不屬於第 5 條的兩類。要不要放行它們，是 `053` 逐檔處置的範圍，不是本票。
若 captain 日後決定在第 5 條加第三類，掃描只需改允許清單一行。

### 二、Spike：拿現有內容試填

在 `c6dcc9f` 的 `src/` 副本上跑暫存原型（scratchpad，未提交）。原型用 `067` 的 `scripts/content-audit/units.mjs` 取文字單元，先替每個檔寫一筆「作者未知」的標記，再逐項驗證。

**「誰寫的」答得出來：幾乎全是 AI。** git 的 `Co-Authored-By` 只能當旁證：有它表示 AI 參與過，沒有它不表示人寫的（P1-6 已證）。但下表每個非 SSOT 檔，**每一個** commit 都有它。

| P1-8 的檔 | 誰寫的（git 旁證：有 AI 標記的 commit／總數） | 依據什麼 | 誰審過、記在哪 |
|---|---|---|---|
| `history.json` | 試算表投稿者（2/7，皆為同步程式的 commit） | 試算表三個發布分頁 | 責任編輯核可，核可版本綁定 |
| `discussions.json` | 同上（13/24） | 同上 | 同上 |
| `future.ts` 案件部分 | AI（15/17） | 檔頭列 `cons.judicial.gov.tw/docdata.aspx?fid=52` | T3 流程要求 captain 看預覽；repo 內查無記錄 |
| `future.ts` 的 `JUSTICES` | AI（同上） | 檔內自述 `Researched synthetic records`，無出處 | 無 |
| `future.ts` 的 `CRISIS_STATS` | AI（同上） | 由 `JUSTICES` 計算而來 | 無 |
| `opinions.ts` | AI（2/2） | 檔頭聲稱「志工以共用試算表編碼」，`049` 已證不實 | 無 |
| `controversy-timeline.ts` | AI（6/6） | 全檔無出處 | 無 |
| ~~`cross-track-links.ts`~~ | — | — | 檔案已於 2026-09-03 刪除（`038`） |
| `contributors.ts` | AI（2/2） | 佔位名單（`前端工程師 A`） | 無 |
| `launch-status.ts` | AI（4/4） | 設定值，不是讀者內容 | 無 |

P1-8 以外、`src/data/` 內的其餘檔：`quizzes/*.ts` 四檔 AI（7/7），只有站內 `sourceRoute`。
`threshold-analysis.ts`（7/7）、`ruling-threshold.ts`（3/3）、`verified-case-refs.mjs`（1/1）是 AI 依官方來源寫成，有 workflow 票的審閱記錄。

**對設計的影響**：

1. 「作者」欄必須有 `unknown` 這個值，但現況用不太到。現況的主要值是 `ai`。
2. 真正決定能不能上線的是「依據」與「審閱記錄」。所以這兩欄是必填結構，不是備註。
3. `future.ts` 一個檔裡有三種依據不同的內容。**整檔一筆標記不夠**，必須能對檔內某個匯出值單獨標記。
4. **不能用「沒有中文就不是內容」來豁免。** 原型原本這樣做，結果 `CRISIS_STATS` 被判成非內容。它全是數字，卻渲染在首頁。所以「非內容」只能整檔宣告，而且 `report` 會把每一筆「非內容」單獨列出給人看。
5. **掃描要能分辨「沒過」與「跑不起來」。** 原型刪掉 `contributors.ts` 時，因為別的模組 import 它而當掉，離開碼同樣是 1。正式版必須用 2 表示「跑不起來」（沿用 `067` 的慣例）。

**原型實測結果**（全部在副本上做，repo 未動）：

| 動作 | 結果 |
|---|---|
| 替現有內容寫好標記後跑「有沒有標記」 | 73 筆標記，離開碼 0 |
| 同一狀態跑完整掃描（含規則 5） | 離開碼 1，69 處不過 |
| 在已標記的 `controversy-timeline.ts` 陣列裡塞一筆新事件 | 離開碼 1，`標記後內容已變 src/data/controversy-timeline.ts` |
| 在 `src/data/` 新增一個含中文的檔 | 離開碼 1，`未標記 src/data/new-claims.ts CLAIMS[0]` |
| 新增一個含中文的元件 | 離開碼 1，`未標記 src/components/x/X.tsx` |
| 改 `JUSTICES` 裡一個字 | 離開碼 1，只報 `src/data/future.ts#JUSTICES`，不波及同檔其他標記 |
| 只改元件的 `className` 並讓行號位移 | 離開碼 0（不誤報） |
| 刪掉沒有被 import 的 `StanceSpectrum.tsx` | 離開碼 1，`標記指向不存在的內容` |

元件與頁面共 57 個 `.tsx` 含中文，原始碼裡有 686 段中文文字。

### 三、第一層：來源標記放哪裡、長什麼樣

**選定：一份清單檔 `content-provenance.json`，放在 repo 根目錄。** 網站不 import 它。

排除的兩個做法：

- **每筆資料加欄位**：只能用在 `src/data/*.ts`。元件文案沒有「一筆資料」可以加欄位。`history.json`、`discussions.json` 是同步產物，不可手改（`AGENTS.md` 第 2 條）。全站 1,597 個含中文的單元（`units.mjs` 計數）逐一加欄位，改動量不成比例。
- **檔頭註解**：已被證明會造假（Problem 第 3 點）。註解也無法和內容綁在一起，內容改了註解照樣留著。

**清單不放在 `src/data/`**：那裡的 `.json` 一律是「不可手改」的產物（`AGENTS.md` 第 2 條的判斷方式）。放進去會讓規則自相矛盾。

**防造假的核心是指紋，不是文字。** 每筆標記記下它所涵蓋內容的指紋。內容改一個字，指紋就對不上，掃描就失敗。標記因此永遠只證明「這一版內容被這樣宣告過」。這和 `040` 的核可版本綁定是同一個原理。

#### 3.1 一筆標記的欄位

```json
{
  "scope": "src/data/future.ts#JUSTICES",
  "class": "t3",
  "author": "ai",
  "basis": ["https://cons.judicial.gov.tw/docdata.aspx?fid=52"],
  "reviewed": { "by": "captain", "on": "2026-10-02", "record": "docs/constitution-features/053-p1-8-non-ssot-content-disposition.md" },
  "fingerprint": "sha256:…",
  "note": "…"
}
```

| 欄位 | 值 | 必填 | 意義 |
|---|---|---|---|
| `scope` | `檔案路徑` 或 `檔案路徑#位置` | 是 | 這筆標記涵蓋哪些內容。見 3.2 |
| `class` | `ssot`／`t3`／`other`／`config` | 是 | `gatekeeping.md` 第 6 章的三類，加上「不是讀者內容」 |
| `author` | `human`／`ai`／`unknown` | `ssot` 以外必填 | 文字是誰寫的。AI 參與過就寫 `ai` |
| `basis` | 字串陣列。每項是網址或 repo 內存在的路徑 | 是，可為空陣列 | 內容依據什麼。空陣列表示「查無依據」 |
| `reviewed` | 物件或 `null` | 是 | 誰審過。`by` 只能是 `captain`、`責任編輯`、`學者`（`gatekeeping.md` 第 2 章的角色）。`record` 是 repo 內存在的檔案（例如票檔），或本 repo 的 PR 網址 `https://github.com/ipaaa/constitution/pull/N`。沒有 `reviewed` 等於未審 |
| `fingerprint` | `sha256:` 開頭 | `ssot` 以外必填 | 涵蓋內容的指紋。見 3.3。只由 `stamp` 指令寫入 |
| `note` | 字串 | 否 | 給人看的說明 |
| `freeze` | — | 否 | **保留給 `047`。** 本票的掃描不解讀它，也不因它失敗 |

其他欄位名一律判失敗，避免拼錯的欄位被默默忽略。

#### 3.2 `scope` 的寫法

- **整檔**：`src/data/controversy-timeline.ts`、`src/app/future/page.tsx`。
- **檔內某個位置**：只用於 `src/data/` 的 `.ts` 與 `.json`。`#` 後面接匯出名稱，可再接一筆紀錄的**鍵選擇器**，例如 `#JUSTICES`、`#RULINGS_SINCE_FLOOR_VOIDED[docket=114憲判字第3號]`。
  - 鍵選擇器 `[欄位=值]` 選出陣列中該欄位等於該值的**唯一**一筆。找到 0 筆或 2 筆以上，判 P5。
  - **不用陣列索引**（例如 `[3]`）。在前面插入一筆，索引就全部位移，標記會指到別筆。鍵選擇器不受插入順序影響。（2026-09-30 依 `047` 的需求 I1 修訂）
  - 掃描先把鍵選擇器換成 `units.mjs` 的 `path` 前綴，再比對。
- 一個文字單元屬於**最長**符合的那一筆。`#JUSTICES` 比整檔 `src/data/future.ts` 長，所以 `JUSTICES` 的內容歸 `#JUSTICES`。
- 元件（`.tsx`）只能整檔標記。原因是元件文字沒有穩定的位置名稱，行號會隨程式碼位移。

#### 3.3 掃描範圍與指紋

| 範圍 | 什麼要有標記 | 指紋算什麼 |
|---|---|---|
| `src/data/**` 的 `.ts`、`.json` | 每個檔，不論有無中文 | `units.mjs` 取出的每個單元的 `[path, text]`，依原順序 |
| `src/data/**` 的其他副檔名（現有 `verified-case-refs.mjs`） | 每個檔 | 整檔位元組 |
| `src/**/*.tsx` | 原始碼裡有中文字串或 JSX 文字的檔 | 原始碼中每段含中文的 JSX 文字與字串常值，依出現順序。**不代入資料值、不含行號** |
| `src/` 其他檔 | 內容含中文的檔（現況 0 個） | 整檔位元組 |

`.tsx` 不沿用 `units.mjs` 的元件抽法。那個抽法會把 `@/data` 的值代入元件文字（`units.mjs` 的 `buildScope`），`future.ts` 改一個數字，會連帶讓每個顯示它的元件指紋失效。原始碼文字才是「寫死在元件裡的文案」。

`class: ssot` 不記指紋。每次同步都會改寫那兩個檔，它們的版本由 `040` 的核可版本綁定負責。

`public/` 的圖檔與 `pitch.html` 不在範圍。見 Out of scope。

### 四、第二層：掃描與規則

新腳本 `scripts/content-provenance.mjs`。規則代號只在該腳本定義一次，文件只引用代號（沿用 `067` 的原則）。
代號用 `P`，避免和 `056` 的 G、`067` 的 M／L／H 混淆。

| 代號 | 什麼算失敗 | 屬於哪一半 |
|---|---|---|
| P1 未標記 | 範圍內有單元或檔案不屬於任何一筆標記 | 標記 |
| P2 標記後內容已變 | 算出的指紋和清單上的不同 | 標記 |
| P3 類別放錯位置 | `ssot` 用在 `history.json`、`discussions.json` 以外；`t3` 用在 `src/data/future.ts` 以外（依 `data-collection-guide.md` 的〈檔案位置一覽〉）；`config` 用在有中文單元的範圍，或用在檔內位置而非整檔 | 標記 |
| P4 違反 `AGENTS.md` 第 5 條 | `other` 的 `author` 不是 `human`；`other` 的 `author` 是 `human` 但 `reviewed` 為 `null`；`t3` 的 `reviewed` 為 `null` | 規則 5 |
| P5 標記指向不存在的內容 | 一筆標記沒有涵蓋任何單元；兩筆 `scope` 相同 | 標記 |
| P6 欄位不合法 | 缺必填欄、值不在列舉內、未定義的欄位名、`reviewed.by` 不在三個角色內、`reviewed.record` 或 `basis` 的 repo 路徑不存在 | 標記 |

`other` 的 `author: human` 也要有 `reviewed`，因為 repo 裡每個檔都可能由 agent 寫入（見第六節）。

#### 指令

```
node scripts/content-provenance.mjs check [--root DIR]            跑 P1–P6
node scripts/content-provenance.mjs check --marking [--root DIR]  只跑 P1、P2、P3、P5、P6
node scripts/content-provenance.mjs report [--root DIR]           印逐範圍的表，附 git 旁證欄
node scripts/content-provenance.mjs stamp <scope> [--author ai|unknown]
```

- 離開碼：`0` 全過，`1` 有失敗，`2` 跑不起來（清單讀不到、資料模組 import 失敗）。
- `report` 的欄位：範圍、單元數、類別、作者、依據、審閱者與記錄、git 旁證（有 AI 標記的 commit／總數）、該範圍的失敗代號。git 旁證只是參考，不影響離開碼（原因見 Problem 第 2 點）。
- `stamp` 是寫入指紋的唯一方法。它會：重算指紋；把 `reviewed` 設為 `null`；`author` 只接受 `ai` 或 `unknown`，預設 `ai`。**內容改過，審閱就作廢，要人重新簽。** `047` 若要禁止某些範圍重新蓋指紋，攔在 `stamp` 這一個入口即可。
- `--root` 與 `067` 相同，用於檢查另一棵樹。

#### 對 `047` 與 `053` 的介面

- `053` 的「標注來源」處置 = 在清單裡為該範圍填 `basis` 與 `reviewed`。處置表的每一列可以直接寫 `scope` 字串。
- `053` 的「搬進 SSOT」處置 = 刪掉程式碼裡的內容與對應標記。若內容留著而標記刪了，P1 會失敗。
- `053` 的「移除」處置 = 刪掉內容與標記。若只刪內容，P5 會失敗。
- `047` 的「已定稿」掛在同一筆標記上（保留欄位 `freeze`），不另開 `frozen-content.json`。一份清單，不是兩份。
  - `047` 需求 I1（穩定鍵）：用 3.2 的鍵選擇器。
  - I2（AI／人寫／未知）：`author` 的 `ai`／`human`／`unknown`。
  - I3（審閱人、日期、依據）：`reviewed.by`／`on`／`record`。
  - I4（不必跑 Next 就讀得到）：清單是純 JSON。
  - `freeze` 物件內的欄位（例如只凍結某幾個欄位與它們的指紋）由 `047` 定義。本票的 `fingerprint` 涵蓋整個 `scope`，`047` 可沿用或另算。

### 五、第三層：掛載點

repo 沒有 CI。掛兩處：

1. **workflow 的 `verify` 階段**：跑 `check --marking`，離開碼必須是 0。走 workflow 的票只要加了沒標記的文字，或改了已標記的內容卻沒重蓋指紋，`verify` 就擋下。不論決定 A 怎麼選都做。
2. **上線條件 P3-8**：依決定 A。建議綁完整的 `check`。

**擋不到的**：不走 workflow、直接 commit 到 `main` 的改動，在發布前不會被檢查。發布前的 P3-8 是最後一道。這和 `067` 的 `check` 相同（`067` 也只在需要時手動跑、不接 build）。不接 `npm run build`：一旦接上，只要有一處未處置，網站就無法建置，連預覽都做不了。

### 六、剩下的風險（說實話）

- **清單本身也可以造假。** agent 可以在清單裡寫 `author: human` 或填一筆假的 `reviewed`。掃描抓不到說謊，只能讓說謊**留下位置**：每個 `reviewed` 都必須指向一個存在的記錄檔，而且清單的改動會出現在 PR diff 裡，只有一行，比讀整段內容好審。實作時在 `AGENTS.md` 第 5 條加一句：agent 不得寫 `author: human`，也不得填 `reviewed`。
- **git 旁證不當判準。** 它兩個方向都不可靠（P1-6）。只放在 `report` 給人看。
- **`config` 靠宣告。** agent 可以把一個全是數字的內容檔宣告成 `config`。掃描只擋「有中文」與「檔內位置」兩種情形。`report` 單獨列出每一筆 `config`。
- **只認中文。** 元件裡的英文段落不會被要求標記。站上文案是中文，`067` 用同一個判準。

### 七、Component hierarchy 與 Data requirements

沒有網站元件。沒有新的 React 元件或頁面。

| 單元 | 職責 |
|---|---|
| `scripts/content-provenance.mjs` | 讀清單、列範圍、算指紋、跑 P1–P6、`report`、`stamp`。`src/data/` 的單元透過 `import { extractUnits } from './content-audit/units.mjs'` 取得，不修改 `units.mjs` |
| `content-provenance.json` | 清單。頂層 `{ "version": 1, "entries": [...] }`，欄位見 3.1 |
| `tests/content-provenance.test.mjs` | 在暫存目錄複製 `src/` 後逐項塞入或修改，驗證每條規則會失敗 |

**實作時的初始填法**（不可由 agent 自行放寬）：

- `history.json`、`discussions.json`：`class: ssot`，`basis` 寫試算表三個發布分頁名，`reviewed: null`（由核可版本綁定負責）。
- 其餘每個範圍：`author` 依證據填。有任一 AI 標記 commit 或出自 workflow 票就寫 `ai`，否則 `unknown`。**一律不寫 `human`。**
- `basis`：只抄檔內或票內已寫明的網址與路徑。沒有就寫空陣列。不去找新來源（那是 `053` 的工作）。
- `launch-status.ts`：`class: config`。
- `reviewed`：一律 `null`。workflow 票的 gate 記錄是否算數，由 `053` 決定，本票不代判。
- `future.ts` 拆三筆：整檔、`#JUSTICES`、`#CRISIS_STATS`。其餘檔整檔一筆。

### 八、Mobile／desktop 響應行為

不適用。本票不改任何頁面。

## Expected surface and tolerance

Estimate: +1,250 net LOC across 8 files, tolerance ±35%.

| 檔案 | 預估 |
|---|---|
| `scripts/content-provenance.mjs`（新） | +280 |
| `content-provenance.json`（新，約 73 筆） | +700 |
| `tests/content-provenance.test.mjs`（新） | +200 |
| `docs/constitution-features/README.md` | +2（`verify` 階段一條） |
| `docs/content-pipeline/gatekeeping.md` | +15／−5 |
| `docs/INDEX.md` | +2 |
| `docs/health-check/TODO.md` | +12 |
| `AGENTS.md` | +3 |

Semantics this may change: 網站執行期行為不變（不動 `src/`）。`verify` 階段多一項必過的檢查。若 captain 選決定 A 的 1，P3-8 多一條上線條件。

## Acceptance criteria

原列三項性質對應：「能夠失敗」→ AC-2；「涵蓋範圍」→ AC-1；「回答 P1-8 的處置」→ AC-5。

**AC-1 — `src/data/` 每個檔與每個含中文的 `.tsx` 恰好屬於一筆標記，且現況的標記全部成立。**
Verified by: 在實作分支跑 `node scripts/content-provenance.mjs check --marking`，離開碼 0。會使它失敗的改動：從 `content-provenance.json` 刪掉任一筆（P1）。

**AC-2 — 塞入未標記的內容，掃描非零退出。**
Verified by: `node --test tests/content-provenance.test.mjs` 在暫存副本上實際做四件事，各自斷言離開碼 1 與失敗代號：（a）在已標記的 `controversy-timeline.ts` 陣列塞一筆事件 → P2；（b）在 `src/data/` 新增含中文的檔 → P1；（c）新增含中文的 `.tsx` → P1；（d）改 `JUSTICES` 一個字 → P2 且只報 `src/data/future.ts#JUSTICES`。會使測試失敗的改動：指紋不含文字內容，或最長前綴歸屬改成最短。

**AC-3 — 不改文案的程式碼改動不誤報。**
Verified by: 同一測試檔在副本上改某 `.tsx` 的 `className` 並在檔頭插入空行，斷言離開碼 0。會使它失敗的改動：指紋納入行號或非中文字串。

**AC-4 — `AGENTS.md` 第 5 條可以用機器檢查。**
Verified by: 測試在副本上把一筆 `other` 改成 `author: ai` → P4、離開碼 1；改成 `author: human` 且 `reviewed` 指向存在的檔 → 該筆通過；`reviewed.record` 指向不存在的檔 → P6。另在實作分支跑完整 `check`，把 P4 的失敗數寫進 stage report 作為基線。**這個數字只應隨 `053` 的處置下降。** 有人新增 AI 文字並如實標記時，它會上升。

**AC-5 — 對現有內容跑一次 `report`，就能回答 P1-8 八個檔各自的處置所需的三個問題（誰寫的、依據什麼、誰審過）。**
Verified by: `node scripts/content-provenance.mjs report` 的輸出，對 P1-8 現存的七個檔各有至少一列，每列的作者、依據、審閱欄都有值（空時印 `無`，不留白）。`src/data/cross-track-links.ts` 不存在，清單裡也沒有它的標記。測試斷言這七列存在。會使它失敗的改動：刪掉其中一檔的標記。

**AC-6 — 初始清單照實填寫。**
Verified by: `node -e` 讀 `content-provenance.json`，斷言：沒有任何一筆 `author: human`；沒有任何一筆 `reviewed` 非 `null`；`ssot` 只出現在兩個 JSON；`config` 只有 `launch-status.ts`。另在 `report` 裡逐列核對：`author: unknown` 的範圍，git 旁證的 AI commit 數必須是 0。會使它失敗的改動：agent 替任何一筆填 `human` 或補 `reviewed`。

**AC-7 — 跑不起來時離開碼是 2，不是 1。**
Verified by: 測試在副本放一個 import 時會拋錯的資料模組，斷言離開碼 2。會使它失敗的改動：沿用原型的行為（當掉即 1）。

**AC-8 — `stamp` 會讓審閱作廢。**
Verified by: 測試對一筆有 `reviewed` 的範圍改內容後跑 `stamp`，斷言新指紋與內容相符、`reviewed` 為 `null`；`stamp --author human` 離開碼非 0 且清單不變。

**AC-9 — `verify` 階段會跑 `check --marking`。**
Verified by: `docs/constitution-features/README.md` 的 `verify` stage 有這條指令與「離開碼必須為 0」。這是流程文件的性質，下一張走 workflow 的票的 verify 報告會出現該指令的輸出。

**AC-10 — 既有檢查與網站不受影響。**
Verified by: `node scripts/content-audit.mjs check` 的輸出與實作前相同；`npx tsc --noEmit` 與 `npm run build` 通過；`src/data/*.json` 的 sha256 實作前後相同。

## Test plan

- `node --test tests/content-provenance.test.mjs`：AC-2、AC-3、AC-4、AC-5、AC-7、AC-8。
- `node scripts/content-provenance.mjs check --marking`：AC-1。
- `node scripts/content-provenance.mjs check`：AC-4 的基線數字（預期離開碼 1）。
- `node scripts/content-provenance.mjs report`：AC-5、AC-6。
- `node scripts/content-audit.mjs check`、`npx tsc --noEmit`、`npm run build`、`shasum -a 256 src/data/*.json`：AC-10。
- 不執行 `npm run sync-content`。

## Documentation impact

### 現在更新

無。本階段只定方向，現行文件描述的現況都還成立：`gatekeeping.md` 第 6 章「沒有機械檢查」在實作前仍是事實。`gatekeeping.md` 自己的第 1 條寫作規則禁止寫進度，所以不能先寫「`051` 已定方向」。`053` 與 `047` 的票由各自的 design 引用本節，本票不改它們。

### 實作後更新

| 文件 | 完成條件 | 更新內容 |
|---|---|---|
| `docs/content-pipeline/gatekeeping.md` 第 5 章 | AC-1 至 AC-8 通過 | 防線總表加一列：來源標記掃描。擋什麼（未標記、標記後改過、第三類有 AI 作者）、擋不到什麼（清單本身造假、`public/` 圖檔、英文文案）、`機械` 與指令 |
| `docs/content-pipeline/gatekeeping.md` 第 6 章 | 同上 | 刪除「沒有機械檢查。資料層沒有來源欄位」一段，改寫為掃描的指令與它的限制。依本文第 1 條只寫不會過期的句子 |
| `docs/content-pipeline/gatekeeping.md` 第 8 章 | 同上 | 刪除「非 SSOT 內容沒有來源標記」一列；票況指令的票號清單同步移除 `051`；新增一列「清單本身可造假，只靠 PR diff」 |
| `docs/constitution-features/README.md` `verify` stage | 同上 | 加一條：跑 `node scripts/content-provenance.mjs check --marking`，離開碼必須為 0 |
| `docs/INDEX.md` | 同上 | 加 `scripts/content-provenance.mjs` 與 `content-provenance.json` 兩列，狀態 `evergreen` |
| `AGENTS.md` 第 5 條 | 同上 | 把「機械檢查的現況見缺口表」改為掃描指令；加一句：agent 不得在清單寫 `author: human` 或填 `reviewed` |
| `docs/health-check/TODO.md` P1-8 | AC-5 通過 | 追加補述：盤點可用 `report` 重跑；「標注來源」處置的欄位見本票第三節。原文保留 |
| `docs/health-check/TODO.md` P3-8 | captain 在決定 A 選 1 或 2 | 加一條解除條件，指向本票與對應指令。不動引用 `056` 與 `067` 的條件 |

### 不更新

| 文件 | 理由 |
|---|---|
| `docs/constitution-features/047-content-freeze.md`、`053-p1-8-non-ssot-content-disposition.md` | 進行中的票，由各自的 design 引用本票第三、四節 |
| `scripts/content-audit.mjs`、`scripts/content-audit/units.mjs` | `067` 的網子。本票只 import `extractUnits`，不修改 |
| `docs/content-pipeline/design.md` 不變式第 7 條 | 規則本身不變，本票只讓它可檢查。檢查方式寫在 `gatekeeping.md` 與 `AGENTS.md`，不重複 |
| `docs/content-pipeline/data-collection-guide.md` | T3 範圍仍是 `src/data/future.ts`，本票沿用，不改 |
| `src/data/*.json` | 同步產物，不手改 |
| 所有 `record` 文件與 `_archive/**` | 記錄，不改寫 |

### Feedback Cycles

## 相依

- **feature 049**（opinion-lazybag）與 **053**（P1-8 處置）處理的是**既有**內容；本票建立的是**往後**的機制。兩者互補，不互為前置。
- **feature 047**（內容凍結）需要來源標記才能表達「這筆已定稿」，本票是其前置。

## Out of scope

不處理既有內容的正確性。不處理 SSOT 分頁的核可機制（feature 040）。不建立渲染檢查（feature 039，且該票明文宣告它不做 AI 內容偵測）。

2026-09-30 design 補充：

- 不處置任何既有內容，也不判斷哪些 AI 內容可以放行。那是 `053`。本票的初始清單只照實記錄現況。
- 不定義凍結規則。`freeze` 欄位保留給 `047`。
- `public/` 的 41 個 PNG、6 個 SVG 與 `pitch.html` 不在範圍。它們不是 `src/data/` 也不是元件文案，而且圖片裡的文字抽不出來。若要納入，可用整檔指紋的同一套機制，另開票。
- 不偵測一段文字「像不像」AI 寫的。本票只檢查宣告，不做內容判讀。

## Stage Report: design

- DONE: Specify the provenance field (shape, where it lives) covering every file in `src/data/` and hardcoded component copy, and a rerunnable scan that must be able to fail — prove it by actually inserting an unmarked item and observing a non-zero exit.
  Design 第三、四節：repo 根目錄 `content-provenance.json`，一筆一個 `scope`（整檔或 `檔#位置`），欄位 class／author／basis／reviewed／fingerprint，指紋綁內容；掃描規則 P1–P6。第二節：在 `c6dcc9f` 的 `src/` 副本上跑暫存原型，塞新事件 → exit 1（P2）、新 data 檔 → exit 1（P1）、新含中文元件 → exit 1（P1）、改 JUSTICES 一字 → exit 1 且只報該子範圍；只改 className 與行號 → exit 0。
- DONE: Acceptance criteria each with a falsifiable `Verified by:`; the end value is that one run over current content answers each of P1-8's eight files' disposition inputs, making AGENTS.md rule 5 (no AI-generated content outside the two allowed classes) machine-checkable.
  AC-1–AC-10 各附會使其失敗的改動。AC-5 以 `report` 回答八個檔的三個問題（第二節表格即原型的實跑結果，cross-track-links.ts 已不存在）；AC-4 以 P4 讓規則 5 可機械判定，並以 P4 失敗數為基線，只應隨 053 下降。
- DONE: Split documentation impact into 現在更新／實作後更新／不更新 (gatekeeping.md ch.6/ch.8 list 051 as a gap), each listing documents or 無.
  現在更新為「無」並附理由（gatekeeping.md 第 1 條禁寫進度；第 6 章「沒有機械檢查」實作前仍為真）；實作後更新 8 列（含 gatekeeping 第 5／6／8 章、README verify、INDEX、AGENTS 第 5 條、TODO P1-8／P3-8）；不更新 6 列。

### 本階段實跑的新發現（供 FO 判斷）

1. P1-8 的非 SSOT 檔，每一個 commit 都帶 AI `Co-Authored-By`（`future.ts` 15/17，其餘全數）。第 5 條照字面執行，第一次完整掃描預期數十處不過（原型：69 處，其中含 57 個元件檔）。
2. `threshold-analysis.ts`、`ruling-threshold.ts`、`verified-case-refs.mjs` 是 agent 依官方來源寫成、經 workflow 審過，但不屬第 5 條兩類，字面上也不過。已寫進第一節，交 `053`。
3. 原型發現以「沒有中文」豁免會把全是數字的 `CRISIS_STATS`（首頁顯示）誤判為非內容；以及刪除被 import 的資料檔會當掉而離開碼仍為 1。兩者都已改進設計（`config` 只能整檔宣告；離開碼 2）。

### Summary

來源標記定為 repo 根目錄一份清單，每筆以指紋綁定它所宣告的內容，改一個字就失效；掃描分「有沒有標記」（P1–P3、P5、P6，掛在 workflow `verify`）與「是否違反第 5 條」（P4）。spike 證實「誰寫的」答得出來（幾乎全是 AI），真正缺的是依據與審閱記錄。captain 只需決定一件事：完整掃描是否綁進上線條件 P3-8（建議綁，代價是發布要等 `053` 處置完）。
