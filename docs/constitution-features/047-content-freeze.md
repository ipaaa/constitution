---
id: 047
title: 內容凍結：區分哪些內容審定後不得再自動變動
status: design
source: captain 2026-09-04（把關機制體檢第二類核心缺口）
started: 2026-09-30T17:18:46Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

現況是所有內容一律等價：每次同步都可能被改寫。但實際上有兩類性質不同的內容，系統沒有任何欄位、規則或機制去表達這個差別。

## Problem

兩類內容混在一起，型別上一視同仁：

- **可持續更新**：摘要、短評、標籤、編輯判斷。
- **審定後不該再自動變動**：法律條文引述、判決要旨、案號、立案日期、已對外發布過的敘述。

`src/data/future.ts` 自己的註解就承認了這個分野：案號、立案日期、案由是 `taken directly from the court website`（`:16-17`），而 identity tags 是 `an editorial layer（…）this project's civic journalism judgment`（`:20-22`）。**兩者在型別上都只是 `PendingCase` 的欄位。**

## 與 feature 040 的差別（方向相反，需分開設計）

| | 040 | 本票 |
|---|---|---|
| 管什麼 | **核可失效** | **內容凍結** |
| 假設 | 內容可以被改，改了就不要偷偷上線 | 有些內容一旦審定，不該被任何路徑改寫 |
| 觸發 | 發布欄位改變 → `Needs review` | 任何覆寫嘗試 → 拒絕 |
| 範圍 | 三個試算表分頁 | 含 `src/data/future.ts` 等非 SSOT 資料 |

040 明確不涵蓋本票：其 Responsibilities 第一句寫「本功能不新增網站 React 元件」，作用面全在 Google Sheet 與 `sync-content.mjs`。

## 三個具體空洞

1. **`future.ts` 完全在 040 射程外。** 040 的指紋只涵蓋三個試算表分頁。T3 走「captain 直接改 TS 檔 → PR → merge」，唯一把關是 PR review 與 `npx tsc --noEmit`，沒有任何欄位能表達「這一筆已定稿」。
2. **兩類內容混在同一個檔、同一個型別。** 見上。
3. **`docs/health-check/TODO.md:486` 已把「標注來源並凍結」列為 P1-8 的三種處置之一**（另兩種是「搬進 SSOT」「移除」），但盤點本身尚未完成，也沒有任何機制實現「凍結」這個處置。

## Risk evidence

`no spike needed` 不成立。design stage 須先回答：凍結要在哪一層實作（型別、資料欄位、建置期檢查、或 CI），以及既有 40 筆 Track 1 與 T3 資料如何分類。**方向未定前不得動程式。**

## Acceptance criteria

待 design stage 補齊。現階段記錄驗收必須涵蓋的性質：

- 對一筆已標記凍結的內容做出覆寫嘗試時，必須有東西失敗——不能只靠人看 PR diff。此項需以實際覆寫嘗試證明，不可只驗規則文字存在。
- 分類必須涵蓋 `src/data/` 全部檔案，不只 SSOT 來源的兩個 json。

## Out of scope

不處理內容本身的正確性。不處理 feature 040 的核可失效機制。不處理 AI 生成內容的來源標記（另票）。

## Design（2026-09-30）

### 一、給 captain 的一段話

審過的 AI 內容，現在任何人或 agent 都能再改一次，網站照樣更新，沒有東西會擋。
本設計讓「定版」成為來源清單上的一個標記。標了定版的內容，只要被改動或刪掉，網站就建置失敗，更新不會上線。
已實測：改一個日期、重新生成一句案由、刪掉一筆、同步寫回試算表內容，四種改法都被擋下。改沒有定版的內容不受影響。

**上線當天不會有任何內容處於定版狀態。** 定版的前提是有人審過，而 `051` 規定只有 captain、責任編輯、學者可以簽審閱，agent 不得代簽。
第四節列了 9 筆定版候選。captain 簽了審閱之後，它們才會定版。

需要 captain 決定兩件事，見第八節。

> 修訂（2026-09-30，同日）：依 `051` design worker 的回覆，定版標記改寫在 `051` 的 `content-provenance.json` 保留欄位 `freeze`，不另開 `frozen-content.json`。
> 第一、三、四、五、七、八、十、十一、十二節因此調整。第六節 spike 未重跑：原型的比對邏輯不變，只換清單檔的位置與格式。

### 二、方向依據

captain 2026-09-30 的方向：

1. 試算表管理人寫的內容，並有角色授權。已由 `040`、`050` 完成。
2. **AI 生成的內容審閱後定版，不得再重新生成或改寫。** 本票負責這一項。
3. AI 生成的內容不得上線。`AGENTS.md` 第 5 條與 `docs/content-pipeline/design.md` 不變式 #7 已寫明（`054`）。

本票因此把 Problem 一節的「兩類內容」收斂為一條規則：**有審閱紀錄的 AI 內容必須定版；定版後任何路徑改動它都要失敗。**
試算表內容的變動由 `040` 的核可失效處理，本票不重複處理，理由見第四節。

### 三、凍結放在哪一層

**選定：來源清單上的定版標記＋建置前檢查。** 三個部分：

| 部分 | 做什麼 |
|---|---|
| `content-provenance.json` 的 `freeze` 欄位（清單由 `051` 建立） | 標記哪一筆定版、凍結哪些欄位、那些欄位的指紋（sha256）、誰在哪天定版 |
| `scripts/check-frozen-content.mjs`（新檔） | 讀清單中有 `freeze` 的每一筆，載入現值，重算凍結欄位的指紋。不符或項目不見 → 離開碼 1。無法載入 → 離開碼 2 |
| `package.json` 加 `prebuild` | `npm run build` 先跑檢查。檢查失敗，`next build` 不執行 |

另外在 `051` 的 `stamp` 指令加一道攔截：對有 `freeze` 的範圍，凍結欄位若已改變，`stamp` 拒絕並離開碼 1。
`stamp` 是 `051` 寫入指紋的唯一入口，攔在這裡，「重新生成後重蓋指紋」這條路就走不通。

指紋只算 `freeze.fields` 指定的欄位。衍生值（`daysPending`）與編輯判斷層（`tags`）不列入，改它們不會讓建置失敗。

**與 `051` 的掛載點不同，而且刻意不同。** `051` 不接 `npm run build`，因為它的檢查只要有一處內容未處置就會失敗，接上後連預覽都做不了。
本票的建置檢查只看有 `freeze` 的項目，不看未標記或未審的內容。它只在「定版內容被改」時失敗，這正是要擋在部署前的情況。

**不選的層：**

| 層 | 不選的原因 |
|---|---|
| TypeScript 型別（`readonly`／`as const`） | 只擋執行期修改，不擋改原始碼。把 `'115-08-14'` 改成 `'115-08-15'` 型別仍正確，`npx tsc --noEmit` 照樣通過 |
| 每筆加 `frozen: true` 欄位 | 只是標籤。改內容而保留標籤，沒有東西會發現 |
| CI | repo 沒有 `.github`。另架 CI 也不會擋 Vercel 部署，除非另行設定。`prebuild` 直接掛在部署必經的指令上 |
| 同步程式內加攔截 | 第一批候選不含試算表內容（第四節），攔截會是永遠不觸發的程式。同步產物照樣經過建置檢查（spike 步驟 5） |
| 另開 `frozen-content.json` | 會有兩份清單記同一筆內容。`051` 已預留 `freeze` 欄位 |

### 四、分類：`src/data/` 全部檔案

三類：

- **定版候選**：有一手來源，也有 workflow 審閱紀錄（封存票的 verify gate）。captain 在 `051` 的清單簽下 `reviewed` 後定版。
- **可更新**：編輯判斷、衍生值、設定。不凍結。
- **不得定版**：沒有審閱紀錄或來源不明。先定版等於把可能的錯誤鎖住。處置交給 `053`（或括號內的票），審過之後才進清單。

| 檔案／項目 | 筆數 | 分類 | 理由 |
|---|---|---|---|
| `history.json`（Track 1） | 40 | 試算表管轄，本票不凍結 | 見下方說明 |
| `discussions.json`（Track 2＋tldr） | 16 | 試算表管轄，本票不凍結 | 同上。貓頭鷹短評是否 AI 生成屬 `docs/health-check/TODO.md` 的 P1-6 |
| `future.ts` `RULINGS_SINCE_FLOOR_VOIDED` | 6 | **定版候選** | 逐則對過 `cons.judicial.gov.tw`，取證日 2026-09-21，經 `063` verify 審閱 |
| `future.ts` `RAW_CASES`（經 `PENDING_CASES` 匯出） | 54 | `id`／`applicant`／`filingDate`／`topic`：不得定版（待審）；`tags`：可更新；`daysPending`：衍生 | 唯一的審閱證據是檔頭註解「accessed 2026-04-29」。`051` 已證明檔頭註解不可信。有審閱紀錄後這四欄轉為定版 |
| `future.ts` `JUSTICES` | 15 | 不得定版（`053`） | 檔頭自述 `Researched synthetic records` |
| `future.ts` `TERM_EVENTS`、`FAILED_NOMINATIONS` | 3＋2 | 不得定版（`053`） | 無出處 |
| `future.ts` `REAL_TOTAL_PENDING`、`CRISIS_STATS` | — | 不得定版（`053`）；其中由其他常數算出的欄位為衍生 | 473、120、3.4 無連結出處 |
| `future.ts` `REFERENCE_DATE`、`LAST_UPDATED`、`IdentityTag`、`AVAILABLE_TAGS`、`TAG_COLORS` | — | 可更新 | 設定與顯示 |
| `ruling-threshold.ts` `RULING_THRESHOLD` 的 `rule`、`statute`、`voidedFloor` | 1 | **定版候選** | 條文引述與失效依據，經 `063`、`066` 審閱。`headcount` 待法學背景者拍板，不凍結 |
| `verified-case-refs.mjs` `VERIFIED_CASE_REFS` | 2 | **定版候選** | 每筆附一手來源網址，經 `064` 審閱 |
| `threshold-analysis.ts` | — | 可更新（已有更強的機制） | `tests/threshold-analysis.test.mjs` 從 fixture 重算並比對。再凍結會出現兩份真相 |
| `controversy-timeline.ts` | 15 | 不得定版（`053`） | 全檔零出處 |
| `opinions.ts` | 12 | 不得定版（`049`） | 含真實姓名，處置中 |
| `contributors.ts` | 6 | 不得定版（`052`） | 佔位資料 |
| `quizzes/*.ts` | 4 檔 | 不得定版（`053`） | 只有站內出處 |
| `launch-status.ts` | — | 可更新 | 上線旗標，非內容 |

第一批定版候選共 **9 筆**：6 則判決、2 筆判決字號、1 筆門檻條文。captain 簽審閱時可引用 `063`／`064`／`066` 的封存票作為 `reviewed.record`。

**為什麼 Track 1 的 40 筆不凍結。** 這 40 筆是試算表內容，屬於方向第 1 點。`040` 已讓發布欄位一改就轉為 `Needs review`，改過的內容不會未經核可上線。
若 repo 再凍結一次，編輯在試算表修正錯字，同步會被 repo 擋下，要改兩處。這違反 `docs/content-pipeline/design.md` 不變式 #4「只能有一份唯一真相」。
逐欄性質如下，供日後重新判斷：`ruling_id`、`year` 是一手事實；`category`、`content`、`handwriting`、`title`、`ruling` 是編輯撰寫；`image_url` 是素材；`chapter` 已廢置。
事實欄的正確性由 `scripts/content-audit.mjs` 的 M1、M2 檢查。凍結管的是「不變」，不是「正確」，兩者互補。
檢查程式本身支援 JSON（spike 步驟 5 已用 `history.json` 實測），日後改變決定不需改程式。

### 五、與 `051` 的介面（相依）

本票不設計來源欄位。本票向 `051` 提出四項需求，`051` 已回覆全部接上（`051` commit `6664a40`，該票 Design 第 3.1、3.2 節與第四節〈對 047 與 053 的介面〉）：

| # | 需求 | `051` 的對應 |
|---|---|---|
| I1 | 每筆資料有穩定鍵 | `scope` 的鍵選擇器，例：`src/data/future.ts#RULINGS_SINCE_FLOOR_VOIDED[docket=…]`。找到 0 筆或 2 筆以上判 P5 |
| I2 | 區分 AI／人寫／未知 | `author`：`ai`／`human`／`unknown` |
| I3 | 審閱人、日期、依據 | `reviewed`：`{by, on, record}`。`by` 限 captain／責任編輯／學者；`null` 即未審 |
| I4 | 不必啟動 Next 即可讀取 | 清單是純 JSON |

**施工順序：本票的 implement 排在 `051` 的 implement 之後。** 清單檔由 `051` 建立，本票沒有它就無處標記。

**本票在 `051` 之上加的規則**（由 `check-frozen-content.mjs` 的 `audit` 子命令執行，不接建置）：

- F1 已審未定版：`author: ai` 且 `reviewed` 不為 `null`，卻沒有 `freeze` → 失敗。這是 captain 方向第 2 點的機械版本。
- F2 未審不得定版：有 `freeze`，`reviewed` 卻是 `null` → 失敗。
- F3 定版內容被改：同建置檢查。

`audit` 與 `051` 的 `check` 掛在同一處：workflow 的 `verify` 階段與上線條件 P3-8。
F1、F2 不接建置。理由：改一個非凍結欄位（例如 `tags`）會讓 `051` 的 `stamp` 把 `reviewed` 清成 `null`，F2 隨即失敗。若接建置，改一個標籤就無法部署，要等 captain 重簽。

**這個狀態的判法：接受失敗，要人重新簽審**（`051` worker 2026-09-30 提出的選項 a）。有 `freeze` 而 `reviewed` 為 `null`，`audit` 判 F2 失敗，直到 captain、責任編輯或學者重簽。不另開例外。
理由：`051` 的原則是「內容改過，審閱就作廢」。同一 scope 內任何內容改了，都該有人再看一次。凍結欄位本身仍由建置檢查守住，重簽前網站照常可部署。

### 六、實測（spike）

原型用的是獨立清單檔。改用 `051` 的清單後，比對與載入邏輯相同，只換讀取位置。

`no spike needed` 不成立，已實作原型並實測。原型與執行腳本在工作暫存區，**未進 repo**；程式碼附於本節末，可重跑。
做法：把 `src/data/` 複製到暫存目錄，從未修改的內容產生 9 筆指紋（6 則判決、2 筆待審案件、1 筆 `history.json`，後兩類僅供實測，不代表第一批決定）。每一步重新複製，只做一種改動。

| 步驟 | 改動 | 結果 |
|---|---|---|
| 1 | 不改 | `✅ 凍結檢查通過：9 筆未變動`，exit 0 |
| 2 | 判決第 6 號 `rocDate` 改成 `115-08-15` | `⛔ … 115 年憲判字第 6 號：凍結欄位 … 被改動`，exit 1 |
| 3 | 重新生成案件 `114憲立3` 的 `topic` | `⛔ … 114憲立3：凍結欄位 … 被改動`，exit 1 |
| 4 | 刪除判決第 3 號那一行 | `⛔ … 115 年憲判字第 3 號：凍結項目不見了`，exit 1 |
| 5 | 以 `scripts/sync-content.mjs` 匯出的 `writeOutputsAtomically` 寫回 `history.json`，`h1` 的 `ruling_id` 改成 `釋字第 262 號` | 同步寫入成功；檢查 `⛔ … h1：凍結欄位 reality.ruling_id/reality.year 被改動`，exit 1 |
| 6（對照） | 改 `114憲國3` 的 `tags`（非凍結欄） | 通過，exit 0 |
| 7（對照） | `REFERENCE_DATE` 改成 `2026-09-30`（`daysPending` 全部改變） | 通過，exit 0 |
| 8 | 以 `prebuild` 掛檢查，內容未凍結處改動，`npm run build` | 檢查通過，後續 build 指令執行，exit 0 |
| 9 | 同上，但判決第 6 號被改 | exit 1，檢查印出失敗項目；後續 build 指令**未執行**（`NEXT_BUILD_RAN` 出現 0 次） |

環境：node v25.6.1、npm 11.9.0。步驟 5 注意：`history.json` 會先被寫入，檢查在建置時才擋。這是刻意取捨（第三節末列）。

<details>
<summary>原型 `check-frozen.mjs`（spike 用，非最終實作）</summary>

```js
// spike 047：凍結檢查原型。不進 repo。
// 用法：node check-frozen.mjs <root> <lockfile> [freeze]
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.env.REPO;
await import(pathToFileURL(path.join(REPO, 'tests/tsx-loader.mjs')).href);

const [root, lockPath, mode] = process.argv.slice(2);
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
const norm = v => typeof v === 'string' ? v.normalize('NFC').trim() : Array.isArray(v) ? v.map(norm) : v;

async function loadExport(file, name) {
  const abs = path.join(root, file);
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(abs, 'utf8'));
  const mod = await import(pathToFileURL(abs).href + `?t=${Date.now()}`);
  return mod[name];
}
function get(obj, dotted) { return dotted.split('.').reduce((o, k) => o?.[k], obj); }
function digest(item, fields) {
  return createHash('sha256').update(JSON.stringify(fields.map(f => [f, norm(get(item, f))]))).digest('hex');
}

const failures = [];
for (const e of lock.entries) {
  const list = await loadExport(e.file, e.export);
  const item = Array.isArray(list) ? list.find(x => String(get(x, e.keyField)) === e.key) : undefined;
  if (!item) { failures.push(`${e.file} ${e.export} ${e.key}：凍結項目不見了`); continue; }
  const now = digest(item, e.fields);
  if (mode === 'freeze') { e.sha256 = now; continue; }
  if (now !== e.sha256) failures.push(`${e.file} ${e.export} ${e.key}：凍結欄位 ${e.fields.join('/')} 被改動`);
}
if (mode === 'freeze') { fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n'); console.log(`已寫入 ${lock.entries.length} 筆指紋`); process.exit(0); }
if (failures.length) { console.error(`⛔ 凍結檢查失敗（${failures.length} 項）`); failures.forEach(f => console.error('  - ' + f)); process.exit(1); }
console.log(`✅ 凍結檢查通過：${lock.entries.length} 筆未變動`);
```

執行：`REPO=<repo 路徑> node check-frozen.mjs <root> lock.json freeze` 產生指紋；去掉 `freeze` 為檢查。
清單每筆格式：`{ "file": "src/data/future.ts", "export": "RULINGS_SINCE_FLOOR_VOIDED", "keyField": "docket", "key": "115 年憲判字第 6 號", "fields": ["docket","rocDate","dateLabel","id"], "sha256": "…" }`。
</details>

### 七、模組與資料形狀

本票不新增、不修改任何 React 元件，也沒有畫面。手機與桌機行為：無變化。

**`content-provenance.json` 一筆標記的 `freeze` 物件**（其餘欄位見 `051` Design 第 3.1 節）：

```jsonc
{
  "scope": "src/data/future.ts#RULINGS_SINCE_FLOOR_VOIDED[docket=115 年憲判字第 6 號]",
  "class": "t3", "author": "ai", "basis": ["https://cons.judicial.gov.tw/…"],
  "reviewed": { "by": "captain", "on": "2026-10-xx", "record": "docs/constitution-features/_archive/063-required-for-ruling-legal-accuracy.md" },
  "fingerprint": "sha256:…",            // 051 的，涵蓋整個 scope
  "freeze": {
    "fields": ["docket", "rocDate", "dateLabel", "id"],   // 相對於 scope 選出的值
    "sha256": "<64 hex>",               // 047 的，只算 fields
    "by": "captain", "on": "2026-10-xx"
  }
}
```

- `freeze.by` 與 `reviewed.by` 用同一組角色。agent 不得寫 `freeze`，理由與 `051` 第六節「agent 不得填 `reviewed`」相同。
- `fields` 省略時凍結整個 scope 選出的值。
- 整檔 scope（例如 `src/data/verified-case-refs.mjs`，`051` 規定非 `.ts`／`.json` 只能整檔標記）的 `fields` 以 export 名稱開頭，例：`VERIFIED_CASE_REFS.113年憲判字第9號.date`。
- 字串先做 NFC 正規化與去頭尾空白再算指紋，與 `scripts/content-fingerprint.mjs` 的 `normalizeText` 相同。

**`scripts/check-frozen-content.mjs`** 子命令：

| 子命令 | 做什麼 | 掛在哪 |
|---|---|---|
| `check`（預設） | F3：定版欄位指紋比對 | `prebuild` |
| `audit` | F1、F2、F3 | `verify` 階段、P3-8 |
| `list` | 列出已定版項目 | 人工 |
| `fingerprint <scope> [fields…]` | 印出一筆的 `freeze.sha256`，供人審後貼進清單 | 人工 |

**不提供**「全部重算」的指令。重算全部等於一鍵解除全部定版。

**解除定版的程序**：同一個 PR 內同時改內容與該筆的 `freeze`（刪除或重算）。清單的 diff 會出現在 PR 上。誰可以核准，見第八節決定二。

### 八、需要 captain 決定的事

**決定一：`AGENTS.md` 第 5 條與 `design.md` 不變式 #7 是否加上「並定版」。**

建議：**加，但等本票上線後再加。** 規則不要早於機制存在。

現行文字只寫「經審閱」，沒有寫審閱後不得再改。本票上線後，建議把「收集並經審閱的內容與圖表」改為：

> 「收集、經審閱並定版的內容與圖表。定版後，任何路徑都不得改寫或重新生成；要修改，須先解除定版並經 captain 同意。」

兩份文件的文字必須相同。改了可以退回。本票的 worker 不會自行修改 `AGENTS.md`。

**決定二：誰可以解除定版，以及接受一個剩下的漏洞。**

建議：**只有 captain 可以核准解除；接受下述漏洞。**

漏洞是：有人在同一次修改裡同時改內容和清單的 `freeze`，檢查會通過。檢查分辨不出「經同意的解除」與「順手一起改」。
能看見的地方只有 PR 上清單檔的變動。要機械擋下，需要 GitHub 分支保護或 CODEOWNERS。repo 目前沒有 `.github`，屬另一張票的範圍。
改了可以退回。

**不需決定、已自行處理的事**：Track 1 的 40 筆不凍結（第四節）；`RAW_CASES` 54 筆等審閱紀錄再定版（第四節）。

### 九、風險

| 風險 | 處理 |
|---|---|
| Vercel 的建置指令若在後台被改掉，`prebuild` 不會執行 | 我不確定 Vercel 後台的設定。`.vercel/project.json` 只有專案編號。AC-8 要求 verify 讀一次實際部署紀錄 |
| 原型用 `tests/tsx-loader.mjs`，依賴 `node:module` 的 `registerHooks`。Vercel 的 node 版本若太舊，載入會失敗 | 失敗時檢查離開碼 2，建置失敗，不會靜默通過（AC-7）。實作須確認 Vercel 的 node 版本，或改用不依賴 `registerHooks` 的載入方式 |
| `051` 尚未通過 gate。它的清單格式若再改，本票第五、七節要跟著改 | 本票 implement 排在 `051` implement 之後。清單檔不存在時 `check` 離開碼 2，建置失敗，因此不可先於 `051` 合併 |
| `prebuild` 讓 `npm run build` 不再只是 `next build` | `AGENTS.md` 第 1 條寫「現在 `build` 就是 `next build`」。檢查只讀不寫，不違反不變式 #1。該句需補述，列於實作後更新 |

### 十、預計改動的檔案

| 檔案 | 改動 | 行數（容差 ±50%） |
|---|---|---|
| `scripts/check-frozen-content.mjs` | 新增 | 約 180 |
| `scripts/content-provenance.mjs`（`051` 建立） | `stamp` 加凍結攔截 | 約 15 |
| `content-provenance.json`（`051` 建立） | 不改。定版由 captain 簽審閱後另開 PR 寫入 | 0 |
| `package.json` | 加 `prebuild` 與 `check-frozen` 兩行 | 2 |
| `tests/content-freeze.test.mjs` | 新增，以暫存清單做實際覆寫嘗試 | 約 180 |
| `src/data/*` | **不改** | 0 |

### 十一、驗收條件

測試一律用暫存副本與暫存清單，不依賴 repo 清單上已有定版項目（上線當天為 0 筆）。

- **AC-1 改動定版欄位會失敗。** 對暫存副本改一則定版判決的 `rocDate`，`check` 離開碼 1，訊息指名該 scope。
  Verified by: `tests/content-freeze.test.mjs` 的對應測試。若檢查對此改動回傳 0，測試失敗。
- **AC-2 刪除定版項目會失敗。** 刪除一筆定版判決，`check` 離開碼 1，訊息含「不見了」。
  Verified by: 同檔測試。若只比對存在的項目、跳過不見的項目，測試失敗。
- **AC-3 同步產物同樣受檢。** 暫存清單凍結 `history.json` 的一筆，以 `writeOutputsAtomically` 寫入改動後的內容，`check` 離開碼 1。
  Verified by: 同檔測試。若檢查只載入 `.ts`，測試失敗。
- **AC-4 部署路徑會被擋。** 定版項目被改時，`npm run build` 非零離開，且輸出不含 `next build` 的 `Creating an optimized production build`。未改時 `npm run build` 離開碼 0。
  Verified by: verify 階段在 worktree 以暫存清單實際執行兩次 `npm run build`，記錄離開碼與輸出行。若移除 `prebuild`，第一次會成功。
- **AC-5 不過度阻擋。** 改非凍結欄 `tags`、改 `REFERENCE_DATE`、新增一筆待審案件、新增一筆未標記的內容，`check` 離開碼 0。
  Verified by: 同檔測試。若指紋改算整個 scope，或 `check` 誤跑 `051` 的 P1，測試失敗。
- **AC-6 重新蓋指紋被擋。** 對有 `freeze` 且凍結欄位已改的 scope 執行 `051` 的 `stamp`，離開碼 1，清單檔 sha256 不變。凍結欄位未改、只改 `tags` 時，`stamp` 照常成功。
  Verified by: 同檔測試，兩項各一。拿掉攔截，第一項失敗；攔截改成見 `freeze` 就拒，第二項失敗。
- **AC-7 無法檢查時大聲失敗。** 定版項目所在的檔案有語法錯誤、鍵選擇器找不到項目、或清單檔不存在，`check` 離開碼非 0。語法錯誤與清單不存在為 2。
  Verified by: 同檔測試。若載入錯誤被吞掉並當成通過，測試失敗。
- **AC-8 Vercel 實際執行檢查。** 一次預覽部署的建置紀錄出現檢查的輸出行。
  Verified by: verify 階段讀取 Vercel 建置紀錄並貼出該行。紀錄中沒有該行，本項 FAILED。
- **AC-9 F1、F2 會失敗。** 暫存清單：`author: ai`＋`reviewed` 非 `null`＋無 `freeze` → `audit` 離開碼 1（F1）；有 `freeze`＋`reviewed: null` → `audit` 離開碼 1（F2）；兩者都合規 → 0。
  Verified by: 同檔測試三項。刪掉 F1 或 F2 任一規則，對應項失敗。
- **AC-10 repo 現況可跑。** 在 `051` 的初始清單（全部 `reviewed: null`、無 `freeze`）上，`check` 離開碼 0，`list` 輸出 0 筆，`npm run build` 離開碼 0。
  Verified by: verify 階段在 worktree 實跑三條指令並記錄輸出。若檢查把「沒有定版項目」當成錯誤，本項失敗。

### 十二、文件影響

**現在更新**：無。
唯一相關的文件位置是 `docs/content-pipeline/gatekeeping.md:166` 的缺口表列，它已指向本票。
方向尚未經 captain 在 gate 核准，現在寫進 evergreen 文件會把未核准的決定寫成定案。另 `gatekeeping-overview-rejudge-064` 正在修改同一份文件。

**實作後更新**：

| 文件 | 內容 |
|---|---|
| `docs/content-pipeline/gatekeeping.md` | 缺口表 `:166` 一列改為已有機制，寫明第八節決定二的漏洞 |
| `docs/content-pipeline/design.md` | 修訂紀錄加一則；不變式 #7 措辭依第八節決定一（captain 核准文字） |
| `AGENTS.md` | 第 1 條補述 `prebuild`；第 5 條依決定一，並加「agent 不得寫 `freeze`」。皆由 captain 核准措辭，worker 不自行修改 |
| `docs/content-pipeline/data-collection-guide.md` | T3 流程加「審閱後定版」一步與指令 |
| `docs/health-check/TODO.md` | P1-8 補述：「標注來源並凍結」的凍結機制已存在 |

**不更新**：`docs/INDEX.md`（不新增文件；清單檔是資料，不是文件）、`docs/project/tech-stack.md`（資料流章節已標過時，與本票無關）、`051`／`053` 的票（由各自的 worker 處理）、`040` 封存票（record）。

## Stage Report: design

- DONE: Choose the freeze layer (type, data field, build-time check, or CI) and classify the existing 40 Track 1 records and T3 `src/data/future.ts`; prove it with an actual overwrite attempt on a frozen item that fails, not rule text alone (spike required).
  Design 三／四／六節：`051` 清單的 `freeze` 標記＋`prebuild` 檢查＋`stamp` 攔截；spike 9 步實測，改日期／重生 topic／刪除／同步寫回皆 exit 1，`npm run build` 後續指令未執行；改 tags／REFERENCE_DATE exit 0。Track 1 的 40 筆不凍結（不變式 #4），定版候選 9 筆。
- DONE: Anchor on the captain's direction (2026-09-30): AI-generated content, once reviewed and finalized, must not be re-rendered or changed by any path; build on 051's provenance field; state whether AGENTS.md rule 5 / design.md invariant 7 should add 「並定版」 as a captain gate decision (do not edit AGENTS.md).
  二節方向；五節 I1–I4 經 `051` worker 確認（`6664a40`），併入同一份清單，F1「已審未定版」即方向第 2 點；八節決定一建議加「並定版」但等上線後。AGENTS.md 未修改。
- DONE: Acceptance criteria each with a falsifiable `Verified by:`; split documentation impact into 現在更新／實作後更新／不更新, each listing documents or 無.
  十一節 AC-1 至 AC-10，各附會讓它失敗的改動；十二節三分（現在更新：無，附理由）。

### Summary

凍結層選定為 `051` 來源清單上的 `freeze` 標記，加上 `prebuild` 建置檢查與 `stamp` 入口攔截；否決型別、欄位標籤、CI、同步內攔截與另開清單，各附理由。spike 原型（六節）實測四種覆寫都失敗、兩種合法改動不受影響。本票 implement 須排在 `051` implement 之後；上線當天 0 筆定版，9 筆候選待 captain 簽審閱。captain 需決定：AGENTS.md 第 5 條加「並定版」（建議加，上線後），以及只由 captain 核准解除定版並接受「同一次修改同時改內容與清單」的漏洞。Vercel 建置指令與 node 版本我不確定，列為 AC-8 與風險。
