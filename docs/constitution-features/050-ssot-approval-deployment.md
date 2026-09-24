---
id: 050
title: 正式 SSOT 部署 feature 040 的審核欄位（040 合併的硬前置）
status: verify
source: captain 2026-09-04（把關機制體檢最高風險項：無票、無人負責）
started: 2026-09-07T23:15:17Z
completed:
verdict:
score: 0.95
worktree: .worktrees/spacedock-ensign-050-ssot-approval-deployment
issue:
pr:
mod-block:
---

feature 040 把八個審核欄位全部改為必填。正式試算表尚未建立這些欄位。**順序做錯會讓整條產線停擺。**

## Problem

040 的 `sync-content.mjs` 中 `APPROVAL_COLUMNS` 八個欄位全為 `column: 'required'`（已由 FO 直接讀取 worktree 程式確認）：

`status`、`review_decision`、`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、`current_fingerprint`、`reject_reason`

`column: 'required'` 的語意是：**欄位不存在 → 整份同步中止。**

`docs/health-check/2026-09-03-editor-onboarding.md:425-430` 明寫：

> **一旦先合併而試算表還沒建那八欄，下次同步會直接中止，一個字都出不去。**
> 正確順序是：**試算表建欄 → 裝公式 → 逐列重新核可 → 才合併程式。**

**為什麼需要這張票**：040 的 Out of scope 明文寫「不上線正式 SSOT 設定」；feature 044 只做隔離測試表的 probe，不碰正式表。**這些人工步驟目前沒有任何票、沒有任何人負責**，而 040 已走到最後一道 gate。

## 已知的工作內容（design stage 須確認並補齊順序與負責人）

1. **正式試算表三個發布分頁各建八個審核欄位。**
2. **裝上 `CONTENT_FINGERPRINT` 與 `APPROVAL_STATUS` 公式，以及 Review 選單。** 程式碼在 `scripts/apps-script/approval-workflow.gs`，部署方式見 `docs/content-pipeline/operations.md`（該檔目前只存在於 040 的 worktree，隨 040 合併才會進 main）。
3. **逐列重新核可。** `docs/content-pipeline/design.md` 明訂舊列不能批次補造指紋——部署新欄位後既有的 `Approved` 會**全部先顯示 `Needs review`**。
4. **確認保護範圍。** 八個審核欄位需設為投稿者不可編輯。與 `status` 欄的保護是分開設定的。

`editor-onboarding.md:430` 特別註明：**編輯權限已經開出去，這一輪重新核可的工作量比原設計預估的大。**

## 相依關係

- **擋住 040 的合併。** 本票未完成前，040 不應合併進 main。
- **feature 044**（隔離測試表兩帳號 probe）驗證的是同一套機制，但在測試表上。044 的結果可降低本票的風險，但兩者不互為前置。
- **`reject_reason` 欄目前在正式試算表上不存在**（`editor-onboarding.md:261`），而 040 將其列為必填。

> ⚠️ **2026-09-07 design stage 更正：上面第二個項目符號的「兩者不互為前置」不成立。**
> 判定與理由見下方「相依關係釐清（design stage）」。原句保留。

## Risk evidence

`no spike needed` 不成立，但 spike 的形式是**在隔離測試表上先跑一次**（即 feature 044）。**不得直接在正式 SSOT 上試錯**——正式表是 40 筆已上線內容的唯一來源。

### design stage 追加的實測證據

design stage 未接觸正式 SSOT。以下三項改用「離線執行真正的程式碼」取得，指令與 fixture 可重跑。

**證據 1：兩個會擋住部署的欄位不符，用真正的 `approval-workflow.gs` 跑出來**

以 stub 取代 Google 端全域物件，載入 `scripts/apps-script/approval-workflow.gs` 原始碼，
呼叫其中的 `resolveApprovalHeaders_`，餵入正式表現況的標題字串：

| 分頁 | 標題輸入 | 結果 |
|---|---|---|
| `Track 1_history` | `收集區` 現況 9 欄 + `status` + 新建 7 欄 | ⛔ `缺少欄位「chapter」。` |
| `Track 1_history` | 同上，補一欄 `chapter` | ✅ 解析 18 欄 |
| `Track 2_discussion` | 現況標題 `owl comment (允鍾…)`（**空格**） | ⛔ `缺少欄位「owl_comment」。` |
| `Track 2_discussion` | 同上，改成 `owl_comment (允鍾…)`（**底線**） | ✅ 解析 21 欄 |
| `site_tldr` | `order｜label｜text｜status｜link` + 新建 7 欄 | ✅ 解析 12 欄 |

原因：`approval-workflow.gs:127-144` 的 `resolveApprovalHeaders_` **沒有別名表**。
它只接受「標題等於欄名」或「標題以欄名加分隔符開頭」。
`scripts/sync-content.mjs` 有別名表（`owl comment` 與 `owl_comment` 都收），Apps Script 沒有。
兩支程式對同一份標題列的容忍度不同，這是部署會踩到的第一個坑。

`Track 1_history` 缺 `chapter` 的依據：`docs/health-check/2026-08-31-content-pipeline.md:174` 記載
`收集區` 的 Track 1 為 9 欄，不含 `chapter`；`.env.local` 註記三個網址已於 2026-09-02 統一指向 `收集區`。
`approval-workflow.gs:5` 的 `APPROVAL_FIELDS['Track 1_history']` 含 `chapter`，且 `resolveApprovalHeaders_` 要求它必須存在。

**證據 2：部署過程中有一段「兩支程式都跑不動」的窗口**

架一台本機 HTTP server 供應四組 CSV fixture，分別代表部署的四個階段，
用 **main 上現行的 `scripts/sync-content.mjs`** 與 **040 worktree 的新版**各跑一次：

| 階段 | main 現行 sync | 040 新版 sync |
|---|---|---|
| A　尚未動工（今天的正式表） | ✅ exit 0 | ⛔ `缺少必要欄位「review_decision」。` |
| B　八欄建好、公式未裝 | ⛔ `第 12 欄的標題「review_decision」對不到任何預期欄位。` | ⛔ `核可紀錄缺少 review_decision。` |
| C　公式已裝、尚未重新核可 | ⛔ 同上（標題對不到） | ⛔ `有 N 列資料，但沒有任何一列的 status 是 Approved。` |
| D　逐列重新核可完成 | ⛔ 同上（標題對不到） | ✅ exit 0 |

**B 與 C 是產線全停窗口。** 而且窗口從「建欄」那一刻就打開，不是從「裝公式」才打開——
main 現行的 `buildColumnMap` 對看不懂的標題會中止（`sync-content.mjs` 的最長前綴比對，
`design.md` 第二節第 4 點），新建的 `review_decision`、`review_fingerprint`、
`approved_fingerprint`、`current_fingerprint` 四個標題它一個都不認得。

**這推翻了一個直覺**：以為「先建欄不影響現況、可以慢慢做」。實際上建完欄的當下，
main 就已經同步不了了。B→D 這段必須一氣呵成，中間不可發布任何內容。

**證據 3：驗收要用的比對手法本身可行**

同一份內容，分別用 main 現行 sync（正式表現況欄位、無 `chapter`）與 040 新版 sync（部署後欄位、
`chapter` 為空白）產出，兩邊 `history.json` 與 `discussions.json` 的 sha256 完全相同：

```
b380578936…6b1b  history.json      （兩邊相同）
0994b8de11…49b8  discussions.json  （兩邊相同）
```

結論：**新增一欄空白的 `chapter` 不改變輸出。** AC-1 的比對手法成立，不是空談。

**證據 4：標題可以保留給學者看的中文說明**

runbook 要 captain 實際輸入的 18／21／12 個標題字串（含中文說明），
同時通過 `resolveApprovalHeaders_` 與 040 新版 sync，且輸出與純欄名版本逐字相同。
中文說明不必為了部署而刪掉。

## 部署 runbook

> ⚠️ **2026-09-24 implement stage 實測更正：下面的步驟 0 指令、步驟 2 字串、步驟 3 欄位表三處與現況不符。**
> 原文保留。**實際執行請照「implement stage 實測結果（2026-09-24）」的第八節「校正後的步驟 1-7」**，
> 不要照下面步驟 3 的表。不符之處逐項列在該節第七小節「runbook 缺陷」。

**執行者標示：`captain` 表示只能由人在 Google 試算表手動完成，worker 無法代勞。`工程` 表示可由 worker 執行。**

### 步驟 0（工程）確認現況欄位，不要憑文件推測

`docs/content-pipeline/design.md` 第二節的欄位表是**設計意圖**，不是現況快照，
已知至少兩處與現況不符（`chapter` 不存在、`reject_reason` 不存在）。動工前必須讀一次真的標題列。

```bash
# 在 repo 根目錄執行。只讀不寫，只印標題列。
node --env-file=.env.local -e '
const t = [["Track 1_history","TRACK_1_CSV_URL"],["Track 2_discussion","TRACK_2_CSV_URL"],["site_tldr","SITE_TLDR_CSV_URL"]];
Promise.all(t.map(async ([name, key]) => {
  const res = await fetch(process.env[key]);
  const head = (await res.text()).split(/\r?\n/)[0];
  return `${name}\n  ${head}\n`;
})).then(rows => console.log(rows.join("\n")));
'
```

**`--env-file` 必須寫在 `-e` 前面。** 寫在後面會被當成程式的參數，環境變數不會載入。

把三段輸出貼進本票。**這是後續每一步的比對基準。**
輸出含試算表的欄位標題，不含 URL，可以安全貼上。

### 步驟 1（captain）Track 1_history 補一欄 `chapter`

在 `Track 1_history` 最右側新增一欄，標題輸入：

```
chapter （目前全部空白）
```

**整欄留白，不要填任何值。** 證據 3 已證明空白的 `chapter` 不改變同步輸出。

> 為什麼要建一個沒有用的欄：`approval-workflow.gs` 的指紋公式把 `chapter` 算進發布欄位投影，
> 少這一欄，Review 選單的「安裝／更新公式」會直接報錯不動。
> `TODO.md` 的 P3-7 記載 `chapter` 設計已被放棄，那是另一張票要處理的事，本票不動它。

### 步驟 2（captain）Track 2_discussion 把 `owl comment` 改成 `owl_comment`

只改標題那一格，**空格換成底線，後面的中文說明照留**：

```
改前：owl comment (允鍾如果有靈感可以寫一句短評)
改後：owl_comment (允鍾如果有靈感可以寫一句短評)
```

不要動欄位位置，不要動任何一格內容。同步程式兩種寫法都認得（`sync-content.mjs` 的 `aliases`），
Apps Script 只認底線那種。

### 步驟 3（captain）三個分頁各新增缺少的審核欄位

**欄名的唯一依據是 `scripts/sync-content.mjs:84-93` 的 `APPROVAL_COLUMNS`，八個欄位依序是：**

```
status
review_decision
review_fingerprint
approved_by
approved_at
approved_fingerprint
current_fingerprint
reject_reason
```

**建議實際輸入的標題字串**（已實測同時通過 Apps Script 與同步程式）：

| 欄名 | 標題輸入 |
|---|---|
| `status` | `status （公式自動產生，不要手動填）` |
| `review_decision` | `review_decision （由 Review 選單寫入）` |
| `review_fingerprint` | `review_fingerprint （由 Review 選單寫入）` |
| `approved_by` | `approved_by （核可者，自動填）` |
| `approved_at` | `approved_at （核可時間 UTC，自動填）` |
| `approved_fingerprint` | `approved_fingerprint （由 Review 選單寫入）` |
| `current_fingerprint` | `current_fingerprint （公式自動產生，不要手動填）` |
| `reject_reason` | `reject_reason （退回原因）` |

**各分頁要新增哪幾欄**（依步驟 0 的實測結果修正；下表是依現有記錄的預期值）：

| 分頁 | 已有 | 要新增 |
|---|---|---|
| `Track 1_history` | `status`、`approved_by`、`approved_at` | `review_decision`、`review_fingerprint`、`approved_fingerprint`、`current_fingerprint`、`reject_reason` |
| `Track 2_discussion` | `status`、`approved_by`、`approved_at` | 同上五欄 |
| `site_tldr` | `status`（`TODO.md:127` 記錄現況為 `order｜label｜text｜status｜link`） | `review_decision`、`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、`current_fingerprint`、`reject_reason` |

**三條硬規則：**

1. **欄名不可重複。** 同一分頁出現兩個 `status`，兩支程式都會中止。`site_tldr` 發生過一次。
2. **不要複製整欄來「備份」。** 那就是規則 1 的違反方式。
3. **新增的欄位全部留白。** 值由公式與 Review 選單產生。

**⚠️ 做完這一步，main 的 `npm run sync-content` 就會中止（證據 2 的階段 B）。從這裡到步驟 7 之間不可發布內容。**

### 步驟 4（captain）安裝 Apps Script

前置：feature 044 的裁決（見下方「相依關係釐清」）。

1. 在正式試算表開 **擴充功能 → Apps Script**，建立綁定式專案。
2. 貼入 `scripts/apps-script/approval-workflow.gs` 與 `scripts/apps-script/appsscript.json` 的內容。
   **兩個檔都在 040 的 worktree**：`.worktrees/spacedock-ensign-040-approval-content-version-binding/scripts/apps-script/`。
   工程可先把兩個檔的內容貼進本票或另存純文字給 captain，避免 captain 需要操作 git。
3. 儲存後**重新載入試算表分頁**。工具列會出現 `Review` 選單。
4. 第一次執行選單項目會跳授權視窗，**必須授權**。
   `approval-workflow.gs:220` 用 `Session.getActiveUser().getEmail()` 取核可者身分，
   沒授權會得到 `無法取得核可者身分。請確認 Apps Script 授權設定。`

**驗證這一步成功了沒有**：切到 `Track 1_history`，執行 `Review → 安裝／更新公式`。

- 沒有跳錯 → 成功。`status` 與 `current_fingerprint` 兩欄會出現公式與值。
- 跳 `缺少欄位「X」。` → 步驟 1／2／3 有一欄沒建好或名字不對。回去對。
- 跳 `這個分頁不支援核可公式。` → 分頁名稱不是 `Track 1_history`、`Track 2_discussion`、`site_tldr` 其中之一。
  `approval-workflow.gs:159` 用分頁名稱當 key，**名稱一個字都不能差**。

三個分頁**各要執行一次**「安裝／更新公式」。它只作用在當下的分頁。

### 步驟 5（captain）確認公式已生效

安裝後，`status` 欄應該全部顯示 `Needs review`（不是空白、不是 `#FINGERPRINT!`）。

| 看到什麼 | 意思 |
|---|---|
| `Needs review` | ✅ 正常。舊的核可紀錄不符新的指紋，本來就該是這樣 |
| 空白 | 該列所有發布欄位都空 → 是空列，正常 |
| `#FINGERPRINT! views 必須是非負整數。` | 該列的 `views`／`order`／`sticky` 有格式錯誤，先修內容 |
| `#NAME?` | Apps Script 沒載入成功，回步驟 4 |

### 步驟 6（captain）設定保護範圍

**保護範圍要涵蓋三類，三類是分開設定的：**

| 類別 | 範圍 | 誰可以編輯 | 為什麼 |
|---|---|---|---|
| A　公式欄 | `status`、`current_fingerprint` | **只有 captain**（連責任編輯都不給） | 這兩欄是公式產物。手改等於偽造核可狀態 |
| B　審核欄 | `review_decision`、`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、`reject_reason` | 只有責任編輯 | `approval-workflow.gs:12-14` 的 `WRITABLE_REVIEW_FIELDS` 就是這六欄。Review 選單以執行者身分寫入，執行者沒有權限就會被擋 |
| C　標題列 | 三個分頁的第 1 列**全列** | 只有 captain | 改一個標題，整條產線停擺。`editor-onboarding.md:104-111` 的風險 5 |

**三個分頁都要各設一次。** Google 試算表的保護範圍不會跨分頁繼承。

**已知未解**：`editor-onboarding.md:58` 提的「整列刪除」保護，Google 試算表沒有直接對應的設定。
本票不處理（見 Out of scope），由 feature 043（刪列跌幅門檻）在同步端擋。

### 步驟 7（captain + 工程）逐列重新核可

**範圍與數量**（以目前已上線內容計）：

| 分頁 | 要重新核可的列數 | 依據 |
|---|---|---|
| `Track 1_history` | 40 | `src/data/history.json` 有 40 筆 |
| `Track 2_discussion` | 15 | `src/data/discussions.json` 16 筆減去 `tldr` 那筆 |
| `site_tldr` | 4（`order` 0–3） | `tldr` 的 `abstract` 有 3 個重點，加 `order 0` 標題列 |
| **合計** | **59 列** | |

分頁上還會有**不該上線的列**（例如 `h28`，`editor-onboarding.md:344-345` 記載它掛錯標題，目前以清空 `status` 擋住）。
**這些列不要核可，讓它們停在 `Needs review`。**

**操作方式：**

1. 選取要核可的資料列（可一次選連續多列）。**不要選到第 1 列標題列**——`approval-workflow.gs:219` 會擋，但別浪費時間。
2. 執行 `Review → 核可選取列`。
3. 程式會逐列重算指紋、比對、寫入 `approved_by`／`approved_at`／三份指紋，最後把 `review_decision` 設為 `Approved`。
4. `status` 應變成 `Approved`。沒變就是有問題，程式會**自動復原整批審核欄位**並報錯。

**「逐列」的意思是逐列判斷，不是逐列點按。** 可以多列一起核可，因為程式對每一列各自重算指紋。
`design.md` 禁止的是**批次補造指紋**（手動貼上或用公式填 `approved_fingerprint`），那會讓核可不再綁定內容。

**⚠️ Track 2 有一個順序陷阱：** `Track 2_discussion` 的指紋含「已發布列序號」
（`approval-workflow.gs:76-80` 的 `__sequence`）。**在 Track 2 插入或刪除任何一列，
其後所有列的指紋都會變，全部退回 `Needs review`。**
所以 Track 2 的內容增刪要在重新核可**之前**全部做完。

**核可過程中的常見錯誤：**

| 錯誤訊息 | 原因 | 怎麼辦 |
|---|---|---|
| `第 N 列沒有可核可的 current_fingerprint。` | 該列公式沒裝或算不出來 | 回步驟 4／5 |
| `第 N 列的指紋公式與發布內容不符。` | 公式是舊的（內容改過但公式沒重算） | 重跑一次「安裝／更新公式」 |
| `審核期間內容已變更。所有審核欄位已復原。` | 核可當下有人在改內容 | 請對方停手，重做這一批 |
| `無法取得核可者身分。` | Apps Script 未授權 | 回步驟 4 第 4 點 |

### 步驟 8（工程）不落地驗證同步

**這一步不寫 `src/data/`，不需要合併 040。** 用 040 worktree 的程式跑一次，輸出導到暫存目錄再比 sha256。

```bash
REPO="/Users/ipa/Documents/ipa Document/00_Claude spacedock folder/30 Public Writing/Constitution"
WT="$REPO/.worktrees/spacedock-ensign-040-approval-content-version-binding"
OUT="$(mktemp -d)"

# 必須在 worktree 內執行（用的是 040 的程式）。
# .env.local 不在 worktree 裡，要指到主 checkout 的那一份。
# CONTENT_OUTPUT_DIR 不可省略，否則會直接覆寫 worktree 的 src/data/。
cd "$WT" && CONTENT_OUTPUT_DIR="$OUT" node --env-file="$REPO/.env.local" scripts/sync-content.mjs

shasum -a 256 "$REPO/src/data/history.json" "$REPO/src/data/discussions.json"
shasum -a 256 "$OUT/history.json" "$OUT/discussions.json"
diff "$REPO/src/data/history.json" "$OUT/history.json" && \
diff "$REPO/src/data/discussions.json" "$OUT/discussions.json" && \
echo "✅ 部署前後逐字相同"
```

> **不要改寫成 `node -e "… await import(…)"` 的形式。** design stage 實測過：
> 那個寫法 exit 0 但什麼都不做，不產生任何檔案也不印任何訊息——
> 一個看起來成功、實際上沒跑的假通過。上面的寫法已實測會真的產生兩個 JSON。

`diff` 有輸出就是**部署把內容弄壞了**。停下來，不要合併 040，把 diff 貼進本票。

### 步驟 9（工程）合併 040

步驟 8 通過才做。合併後 main 的 `npm run sync-content` 才會恢復可用（證據 2 的階段 D）。

## implement stage 實測結果（2026-09-24）

本節是**實測校正**。上面的「部署 runbook」原文保留，但它的步驟 0 指令、步驟 3 欄位表、
步驟 2 字串三處與現況不符，**執行部署請照本節的「校正後的步驟 1-7」**，不要照上面的表。
不符之處逐項列在下方「runbook 缺陷」。

本輪只執行步驟 0。**未對正式試算表做任何寫入**：沒有建欄、沒有改標題、沒有裝 Apps Script、
沒有設保護範圍、沒有核可任何一列。唯一碰到外部系統的動作是三次 HTTP GET 讀取發布 CSV。
`src/data/*.json` 的 sha256 在本輪前後相同（`4d1992e3…cea3b`／`4071978a…3162`）。

### 一、步驟 0 的輸出（逐字）

照票內指令執行（`--env-file` 在 `-e` 前面），輸出如下：

```
Track 1_history
  id(給系統看的編號),category,year,ruling_id,ruling,content（現有為AI生成）,handwriting（現有為AI生成）,title（現有為AI生成）,image_url（現有為AI生成）,"status

Track 2_discussion
  id,category,title,author,year,link,abstract,views,status,"owl comment

site_tldr
  order,label,text,status,link
```

**這份輸出是被截斷的，不可當作基準。** Track 1 的 `status` 與 Track 2 的 `owl comment`
兩個標題格**內含換行字元**。票內指令用 `split(/\r?\n/)[0]` 取第一行，
在引號內的換行處就停住了。Track 2 因此完全看不到 `vibe` 與 `sticky` 兩欄。
這是 runbook 缺陷 D1，詳見下方。

**改用完整 CSV 解析（處理引號內換行）重讀。** 這份才是基準：

```bash
# 在 repo 根目錄執行。只讀不寫。--env-file 必須在檔名參數之前。
cat > /tmp/hdr.mjs <<'EOF'
function parseFirstRecord(text) {
  const out = []; let cur = ''; let i = 0; let q = false;
  if (text.charCodeAt(0) === 0xFEFF) i = 1;
  for (; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i+1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else if (c === '\n') { out.push(cur); return out; }
    else if (c !== '\r') cur += c;
  }
  out.push(cur); return out;
}
const t = [["Track 1_history","TRACK_1_CSV_URL"],["Track 2_discussion","TRACK_2_CSV_URL"],["site_tldr","SITE_TLDR_CSV_URL"]];
const res = {};
for (const [name, key] of t) res[name] = parseFirstRecord(await (await fetch(process.env[key])).text());
console.log(JSON.stringify(res, null, 2));
EOF
node --env-file=.env.local /tmp/hdr.mjs
```

完整標題列（`\n` 表示標題格內真的有一個換行字元）：

```json
{
  "Track 1_history": [
    "id(給系統看的編號)",
    "category",
    "year",
    "ruling_id",
    "ruling",
    "content（現有為AI生成）",
    "handwriting（現有為AI生成）",
    "title（現有為AI生成）",
    "image_url（現有為AI生成）",
    "status\n（權限保護）"
  ],
  "Track 2_discussion": [
    "id",
    "category",
    "title",
    "author",
    "year",
    "link",
    "abstract",
    "views",
    "status",
    "owl comment\n(允鍾如果有靈感可以寫一句短評)",
    "vibe",
    "sticky"
  ],
  "site_tldr": [
    "order",
    "label",
    "text",
    "status",
    "link"
  ]
}
```

**標題格內的換行不影響兩支程式。** 兩支都先把連續空白字元壓成一個半形空格
（`sync-content.mjs` 的 `raw.trim().toLowerCase().replace(/\s+/g,' ')`、
`approval-workflow.gs` 的 `normalizeApprovalText_` 加同樣的 `replace`），
壓完的空格是合法分隔符。`status\n（權限保護）` 兩支都解析成 `status`。實測已確認（下方第三節）。

### 二、票內兩項已知不符的裁決

| 票內的說法 | 實測結果 |
|---|---|
| `Track 1_history` 缺 `chapter` | **成立。** 現況 10 欄，沒有 `chapter` |
| `Track 2_discussion` 的標題是 `owl comment`（空格） | **成立，但票內的字串寫錯。** 欄名部分確實是空格（`owl comment`），但接在後面的不是空格加括號，是**換行**加括號 |
| 三個分頁都沒有 `reject_reason` | **成立。** 三個分頁都沒有 |

**另外查出兩項票內沒有記載的不符**，兩者都會擋住部署：

1. **`approved_by` 與 `approved_at` 在三個分頁都不存在。** 票內步驟 3 的表寫
   `Track 1_history` 與 `Track 2_discussion`「已有 `status`、`approved_by`、`approved_at`」。
   實測三個分頁的八個審核欄位**只有 `status` 存在**，其餘七個全部要新建。
2. **`Track 2_discussion` 還缺 `owl_depth_comment` 與 `full_content`。**
   `approval-workflow.gs:6` 的 `APPROVAL_FIELDS['Track 2_discussion']` 是 13 個欄位，
   包含這兩個；`resolveApprovalHeaders_` 對缺漏一律 throw。
   **票內的 runbook 完全沒有這一步。照票內步驟 1-3 做完，步驟 4 在 Track 2 仍然會失敗。**

### 三、校正後的欄位表（以實測標題列為依據）

**`Track 1_history`** — 現況 10 欄，要新建 8 欄。

| # | 現況標題（逐字） | 解析成 |
|---|---|---|
| 1 | `id(給系統看的編號)` | `id` |
| 2 | `category` | `category` |
| 3 | `year` | `year` |
| 4 | `ruling_id` | `ruling_id` |
| 5 | `ruling` | `ruling` |
| 6 | `content（現有為AI生成）` | `content` |
| 7 | `handwriting（現有為AI生成）` | `handwriting` |
| 8 | `title（現有為AI生成）` | `title` |
| 9 | `image_url（現有為AI生成）` | `image_url` |
| 10 | `status`＋換行＋`（權限保護）` | `status` ✅ 八個審核欄位中唯一已存在的 |

要新建：`chapter`（內容欄）、`review_decision`、`review_fingerprint`、`approved_by`、
`approved_at`、`approved_fingerprint`、`reject_reason`、`current_fingerprint`。

**`Track 2_discussion`** — 現況 12 欄，要新建 9 欄，另有 1 次改名。

| # | 現況標題（逐字） | 解析成 |
|---|---|---|
| 1-8 | `id`／`category`／`title`／`author`／`year`／`link`／`abstract`／`views` | 同名 |
| 9 | `status` | `status` ✅ 已存在 |
| 10 | `owl comment`＋換行＋`(允鍾如果有靈感可以寫一句短評)` | ⚠️ Apps Script 解析不到，要改名 |
| 11 | `vibe` | `vibe` |
| 12 | `sticky` | `sticky` |

要新建：`owl_depth_comment`、`full_content`（兩個內容欄）、`review_decision`、
`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、
`reject_reason`、`current_fingerprint`。

**`site_tldr`** — 現況 5 欄（`order`／`label`／`text`／`status`／`link`，與 `TODO.md:127` 的記錄相符），
要新建 7 欄：`review_decision`、`review_fingerprint`、`approved_by`、`approved_at`、
`approved_fingerprint`、`reject_reason`、`current_fingerprint`。

**合計要手動建立 24 欄**（8＋9＋7），另加 1 次改名。票內步驟 3 的表算出的是 17 欄，少算 7 欄。

#### 新欄要插在哪個位置

**全部附加在最右側，不要插入到現有欄位之間。** 兩支程式都以標題解析欄位，欄序不影響輸出
（已實測，見第五節 fixE）。附加避免了插入時錯位的風險。

**但新欄的排列順序會影響步驟 6 要設幾個保護範圍。** 建議順序（每個分頁都一樣）：

```
（現有欄位保持不動）
→ 新增的內容欄        Track 1：chapter／Track 2：owl_depth_comment、full_content／site_tldr：無
→ review_decision
→ review_fingerprint
→ approved_by
→ approved_at
→ approved_fingerprint
→ reject_reason
→ current_fingerprint   ← 放最後一欄
```

這個順序讓六個「責任編輯可寫」的欄位連成一段，保護範圍從 15 個降到 12 個。
若照票內 `APPROVAL_COLUMNS` 的順序建（`current_fingerprint` 在 `reject_reason` 之前），
`reject_reason` 會被切開，每個分頁多一個範圍。兩種順序的輸出都實測過，逐字相同。

**標題字串沿用票內步驟 3 的建議值**（已再次實測同時通過兩支程式）。
唯一要補的三個內容欄標題：

| 欄名 | 標題輸入 |
|---|---|
| `chapter` | `chapter （目前全部空白）` |
| `owl_depth_comment` | `owl_depth_comment （新建，全部留白）` |
| `full_content` | `full_content （新建，全部留白）` |

**⚠️ 不要新增第二個 `status` 欄。** `Track 1_history` 現有的
`status`＋換行＋`（權限保護）` 已經被解析成 `status`。再加一個會觸發
`欄位「status」重複。`（`approval-workflow.gs`）與 main 同步的重複欄位中止。

### 四、以實測標題重跑 `resolveApprovalHeaders_`

手法同證據 1：以 stub 取代 Google 端全域物件，用 `node:vm` 載入
`.worktrees/spacedock-ensign-040-approval-content-version-binding/scripts/apps-script/approval-workflow.gs`
原始碼，呼叫 `resolveApprovalHeaders_`。差別是**餵入 2026-09-24 實測到的真實標題字串**，
不是記錄中的推測值。

| 階段 | `Track 1_history` | `Track 2_discussion` | `site_tldr` |
|---|---|---|---|
| A　現況 | ⛔ `缺少欄位「chapter」。` | ⛔ `缺少欄位「owl_comment」。` | ⛔ `缺少欄位「review_decision」。` |
| B　套用票內步驟 1、2 後 | ⛔ `缺少欄位「review_decision」。` | ⛔ `缺少欄位「owl_depth_comment」。` | ⛔ `缺少欄位「review_decision」。` |
| C　再加七個審核欄後 | ✅ 解析 18 欄 | ⛔ `缺少欄位「owl_depth_comment」。` | ✅ 解析 12 欄 |
| D　Track 2 再補 `owl_depth_comment`、`full_content` | — | ✅ 解析 21 欄 | — |

**階段 C 的 Track 2 是本輪最重要的發現。** 照票內 runbook 一步一步做完步驟 1、2、3，
`Track 2_discussion` 的「安裝／更新公式」**仍然會報錯**。
證據 1 的 Track 2 之所以顯示 ✅ 21 欄，是因為它餵入的標題列已經含
`owl_depth_comment` 與 `full_content`——那份輸入取自 `design.md` 的設計意圖，不是現況。
這正是步驟 0 條文「不要憑文件推測」要擋的情況。

補完後 `Track 1_history` 18 欄、`Track 2_discussion` 21 欄、`site_tldr` 12 欄，
與證據 1 的欄數一致。

### 五、複驗證據 3：新增空白欄不改變同步輸出

2026-09-07 的量測仍然成立，而且本輪驗的範圍比當時更大。

手法：把三個分頁的現況 CSV 抓成本機快照，架一台本機 HTTP server 供應四組 fixture，
分別用 **main 現行的 `scripts/sync-content.mjs`**（取自 `git show main:`，複製到暫存目錄執行，
不碰 repo 的 `src/data/`）與 **040 worktree 的新版**跑。fixture 一律經過同一套
CSV round-trip，所以唯一變數是新增的欄位。

| fixture | 內容 | 用哪支同步 | 結果 |
|---|---|---|---|
| `fixRaw` | 現況原始位元組 | main | exit 0 |
| `fixA` | 現況（round-trip，不加欄） | main | exit 0 |
| `fixA2` | 現況 + 空白 `chapter`、`owl_depth_comment`、`full_content` | main | exit 0 |
| `fixD` | 完整部署後（24 欄全建、59 列填入真實指紋） | 040 新版 | exit 0 |
| `fixE` | 同 `fixD`，但新欄改用建議排序 | 040 新版 | exit 0 |
| `fixS` | **下方第八節 S2／S4 的實際建欄順序**，24 欄全建、59 列填入真實指紋 | 040 新版 | exit 0 |

六組的 `history.json` 與 `discussions.json` sha256 **完全相同**，且等於 repo 現況：

```
4d1992e3a5fbb21e13a7324ad9ca573fda48ac7d8209fb7a1c67da57047cea3b  history.json
4071978a7ad0b3d041f7cf0df5d5cf580db9e1c6b47df657819e698b213d3162  discussions.json
```

這兩個值與 AC-1 綁定的 2026-09-07 量測值逐字相同——**正式試算表的已發布內容在這段期間沒有變動。**

`fixD` 的指紋不是手填的。它用 040 的 `scripts/content-fingerprint.mjs` 的
`fingerprintPublishedRow` 逐列算出，Track 2 的 `__sequence` 用
`sync-content.mjs:392` 的 `publishedRowSequences` 同語意重算。
040 新版同步對 `fixD` 印出的是：

```
✅ 檢查通過，已寫入 src/data/history.json（40 筆）
✅ 檢查通過，已寫入 src/data/discussions.json（16 筆，含 tldr）
```

**AC-2 要求逐字出現的 40 與 16 兩個數字，已在實測中出現。**
這也證明 AC-1／AC-2 的驗收手法在真實資料上可執行，不只在 fixture 上成立。

#### `sync-content.mjs` 的 alias 表（實讀，非轉述）

`git show main:scripts/sync-content.mjs` 第 112 行逐字為：

```js
  { field: 'owl_comment', aliases: ['owl comment', 'owl_comment'], column: 'optional', value: 'optional' },
```

**兩種寫法都收，票內的說法成立。** 040 worktree 的版本同樣是這兩個 alias。
所以步驟 2 的改名對同步程式沒有影響，只是為了讓 Apps Script 解析得到。

同時實讀到一項票內沒提的事實：main 現行版本的 `approved_by`、`approved_at`、`reject_reason`
在 `TRACK_1_COLUMNS` 與 `TRACK_2_COLUMNS` 裡是 `column: 'optional'`（第 97-99、117-119 行），
但 `SITE_TLDR_COLUMNS`（第 123-129 行）**完全沒有這三欄**。這造就了下一節的安全前綴。

### 六、產線全停窗口的實測大小

#### 窗口不必從步驟 1 就打開

證據 2 的結論是「窗口從建欄那一刻就打開」。**實測顯示這個結論過度概括。**
有 9 欄可以先建，main 現行的同步仍然 exit 0，而且輸出逐字不變：

| fixture | 做了什麼 | main 現行同步 |
|---|---|---|
| `fixB1` | 步驟 1、2 + Track 2 補 `owl_depth_comment`、`full_content` | ✅ exit 0，輸出與 baseline 逐字相同 |
| `fixB2` | `fixB1` 再加 Track 1／2 的 `approved_by`、`approved_at`、`reject_reason` | ✅ exit 0，輸出與 baseline 逐字相同 |
| `fixB3` | 八欄全建（三個分頁） | ⛔ exit 1，`第 12 欄的標題「review_decision …」對不到任何預期欄位。` |
| `fixB4` | Track 1／2 停在 `fixB1`，只有 `site_tldr` 建審核欄 | ⛔ exit 1，`第 6 欄的標題「review_decision …」對不到任何預期欄位。` |

原因見第五節末：main 認得 `approved_by`／`approved_at`／`reject_reason`（Track 1／2），
不認得 `review_decision`／`review_fingerprint`／`approved_fingerprint`／`current_fingerprint`；
`site_tldr` 三欄都不認得，所以 `site_tldr` 的任何一個審核欄都在窗口內。

**因此 24 欄分成兩段：**

| 段 | 欄數 | 內容 | main 同步 |
|---|---|---|---|
| 安全前綴 | **9** | Track 1：`chapter`、`approved_by`、`approved_at`、`reject_reason`（4）<br>Track 2：`owl_depth_comment`、`full_content`、`approved_by`、`approved_at`、`reject_reason`（5）＋改名 1 次<br>`site_tldr`：0 | 仍可用 |
| 窗口內 | **15** | Track 1：`review_decision`、`review_fingerprint`、`approved_fingerprint`、`current_fingerprint`（4）<br>Track 2：同 4 欄<br>`site_tldr`：全部 7 欄 | 一建就中止 |

安全前綴可以分幾天慢慢做，做錯了也可以改，產線照常。**窗口只涵蓋 15 欄。**

#### 逐列重新核可的實際列數

從現況資料實測（讀 `status` 欄，以 Node `Map` 計數，未使用 `sort`／`uniq`）：

| 分頁 | 非空白資料列 | `status` = `Approved` | `status` 空白 |
|---|---|---|---|
| `Track 1_history` | 42 | **40** | 2（`h2`、`h28`） |
| `Track 2_discussion` | 43 | **15** | 28（`d3`、`d18`–`d44`） |
| `site_tldr` | 4 | **4** | 0 |
| **合計** | 89 | **59** | 30 |

**59 列，與票內的數字相符。** 票內是從 `src/data/*.json` 的筆數推算，本輪是從試算表的
`status` 欄直接數，兩邊一致。

`editor-onboarding.md:430` 的「這一輪重新核可的工作量比原設計預估的大」**不是指列數變多**。
該句的主詞是「編輯權限已經開出去」——工作量變大的是**協調成本**：
窗口期間有 30 列草稿在編輯台手上可以隨時改。任何人改到那 59 列中任一列的發布內容，
該列的指紋就變了，核可要重做（`approval-workflow.gs` 會報
`審核期間內容已變更。所有審核欄位已復原。`）。

#### Track 2 的序號暴露面（票內未量化）

`Track 2_discussion` 的指紋含已發布列序號。實測序號分布：

- 15 個 `Approved` 列在試算表的第 2-17 列，序號 1-16。
- **只有 1 列**未核可的草稿夾在其中：第 4 列（`d3`）。刪掉它，其後 14 列的指紋全變。
- 其餘 27 列草稿（`d18`–`d44`）全部在第 17 列之後。**在它們身上增刪不影響已核可列的序號。**

所以 Track 2 的順序陷阱只有一個具體風險點：**第 4 列（`d3`）在窗口結束前不可刪除或搬移。**
在最後一列之後新增草稿是安全的。

#### 步驟 6 要設幾個保護範圍

Google 試算表的一個保護範圍只能是一段連續範圍。範圍數由欄位是否相鄰決定，
以下 A1 位置由 fixture 的標題列程式算出：

| 排序 | `Track 1_history` | `Track 2_discussion` | `site_tldr` | 合計 |
|---|---|---|---|---|
| **建議排序**（`current_fingerprint` 放最後） | A 類 2（`J2:J`＋`R2:R`）／B 類 1（`L2:Q`）／C 類 1（`A1:R1`）＝ **4** | A 類 2（`I2:I`＋`U2:U`）／B 類 1（`O2:T`）／C 類 1（`A1:U1`）＝ **4** | A 類 2（`D2:D`＋`L2:L`）／B 類 1（`F2:K`）／C 類 1（`A1:L1`）＝ **4** | **12** |
| 票內 `APPROVAL_COLUMNS` 排序 | 5 | 5 | 5 | 15 |

A／B／C 三類的定義同票內步驟 6。`status` 已在原位，與 `current_fingerprint` 不可能相鄰，
所以 A 類每個分頁固定是 2 個範圍。

#### 窗口時間估算

**這是依動作次數推算的估計值，不是實測的牆鐘時間。** 本輪沒有對試算表做任何寫入，
所以無法量測 captain 在 Google 試算表 UI 上的實際速度。下表列出動作次數，
單位時間是保守假設，captain 可自行替換。

| 步驟 | 動作次數（實測） | 單位時間（假設） | 小計 |
|---|---|---|---|
| 3′　建窗口內的 15 欄 | 15 欄 | 1-2 分／欄 | 15-30 分 |
| 4′　安裝 Apps Script + 授權 | 1 次貼程式 + 1 次授權 + 3 次「安裝／更新公式」 | — | 10-20 分 |
| 5′　確認公式生效 | 3 個分頁各看一次 | 2 分／分頁 | 5-10 分 |
| 6′　設保護範圍 | 12 個範圍 | 2-3 分／範圍 | 25-35 分 |
| 7′　逐列重新核可 | 59 列，分 6 段連續選取（Track 1 跳過 `h2`、`h28` 分 3 段；Track 2 跳過 `d3` 分 2 段；`site_tldr` 1 段） | 2-3 分／段 | 15-20 分 |
| 8′　不落地驗證同步 | 1 次（工程執行） | — | 5 分 |
| **合計** | | | **75-120 分** |

**結論：請預留一段不受打擾的 2 小時。** 若把「中途發現某一欄打錯、要回頭對名字」
也算進去，預留 3 小時比較安全。

**這段時間內的兩個硬條件：**

1. **不可發布任何內容。** main 的 `npm run sync-content` 從建第一個窗口內欄位起就會中止。
2. **編輯台不可改動那 59 列的發布內容。** 改了就要重新核可該列。
   草稿列（`h2`、`h28`、`d18`–`d44`）可以改，但 `d3` 不可刪除或搬移（見上方序號暴露面）。

安全前綴的 9 欄不在這段時間內，可以事先分次完成。

### 七、runbook 缺陷（獨立列出）

**D1（擋住步驟 0 本身）步驟 0 的指令會靜默截斷標題列。**
`split(/\r?\n/)[0]` 不處理引號內的換行。Track 1 的 `status` 與 Track 2 的 `owl comment`
標題格都含換行，所以 Track 1 只印到第 10 欄的一半、Track 2 只印到第 10 欄的一半，
`vibe` 與 `sticky` 完全看不到。**它不報錯，它少印。**
照這份輸出填步驟 3 的欄位表，一定算錯。修法見第一節的完整解析版指令。

**D2（擋住步驟 3）步驟 3 的欄位表把 `approved_by`、`approved_at` 記成「已有」。**
實測三個分頁都沒有這兩欄。票內算出 Track 1／2 各新增 5 欄、`site_tldr` 新增 7 欄，共 17 欄；
實際要新增 24 欄。

**D3（擋住步驟 4，順序有誤）步驟 3 少了 Track 2 的 `owl_depth_comment` 與 `full_content`。**
這兩欄不是審核欄位，是 `APPROVAL_FIELDS['Track 2_discussion']` 的內容欄位，
`resolveApprovalHeaders_` 要求它們存在。**照票內步驟 1-3 做完，步驟 4 在 Track 2 必定失敗**，
錯誤訊息是 `缺少欄位「owl_depth_comment」。`。第四節階段 C 已實測。
修法：把這兩欄併入建欄那一步（它們在安全前綴內，可事先建）。

**D4（窗口估算過大）證據 2 的「窗口從建欄那一刻就打開」過度概括。**
實測有 9 欄的安全前綴，建了之後 main 同步仍 exit 0 且輸出逐字不變。
窗口只涵蓋 15 欄。第六節有分段表。

**D5（會讓 captain 找不到字串）步驟 2 的「改前」字串寫錯。**
票內寫 `owl comment (允鍾如果有靈感可以寫一句短評)`，是空格接括號。
實際是 `owl comment` + **換行** + `(允鍾如果有靈感可以寫一句短評)`。
captain 若用「尋找並取代」搜票內那個字串會找不到。
**正確做法：只改「owl」與「comment」之間那一個空格，換成底線。其餘一個字都不要動**
（包含那個換行）。

**D6（影響步驟 6 的工作量）步驟 6 沒說明保護範圍的數量取決於欄位排列順序。**
建議排序 12 個，票內排序 15 個。第三節有建議排序。

**沒有任何一步在現況下做不到。** D1-D6 都是「照票內做會失敗或多做」，不是「無法完成」。
套用上述修正後，步驟 1-9 全部可執行。

### 八、校正後的步驟 1-7

取代票內步驟 1-3 與步驟 6 的對應內容。步驟 4、5、7、8、9 的操作方式沿用票內原文，
只是編號與範圍依下表調整。

**下面這份順序已整份實測過**（fixture `fixS`，把 S1-S4 的建欄與改名、S8 的 59 列核可全部套上）：

- `resolveApprovalHeaders_` 三個分頁全通過，解析 18／21／12 欄。
- 040 新版同步 exit 0，印出 `（40 筆）` 與 `（16 筆，含 tldr）`，輸出與 baseline 逐字相同。
- main 現行同步 exit 1（窗口確實打開），錯誤指向第 15 欄 `review_decision`。
- S7 的 12 個保護範圍位置由 `fixS` 的標題列算出，不是手數的。
- S8 的 6 個連續段由 `fixS` 的 `status` 欄算出：第 2 列／第 4-24 列／第 26-43 列、
  第 2-3 列／第 5-17 列、第 2-5 列。

#### 階段一：安全前綴（`captain`，產線照常，可分次做）

**S1　`Track 2_discussion` 改名。** 把第 10 欄標題的 `owl comment` 改成 `owl_comment`。
只動「owl」與「comment」之間那一個空格。**後面的換行與中文說明一個字都不要動。**

**S2　三個分頁附加 9 個安全欄，全部留白。**

| 分頁 | 附加在最右側（依序） |
|---|---|
| `Track 1_history` | `chapter （目前全部空白）`<br>`approved_by （核可者，自動填）`<br>`approved_at （核可時間 UTC，自動填）`<br>`reject_reason （退回原因）` |
| `Track 2_discussion` | `owl_depth_comment （新建，全部留白）`<br>`full_content （新建，全部留白）`<br>`approved_by （核可者，自動填）`<br>`approved_at （核可時間 UTC，自動填）`<br>`reject_reason （退回原因）` |
| `site_tldr` | 無 |

**S3　工程確認產線還活著。** 用 AC-6 的 sandbox 手法跑 main 的同步，必須 exit 0，
且輸出的兩個 sha256 仍是 `4d1992e3…cea3b` 與 `4071978a…3162`。
**這一關沒過就不要進階段二。**

#### 階段二：窗口（`captain` + `工程`，一氣呵成，預留 2 小時）

⚠️ **從 S4 的第一欄建起，main 的 `npm run sync-content` 就會中止，直到步驟 9 合併 040。**

**S4　三個分頁附加 15 個窗口內欄位，全部留白。** 每個分頁依序附加：

```
review_decision （由 Review 選單寫入）
review_fingerprint （由 Review 選單寫入）
approved_fingerprint （由 Review 選單寫入）
current_fingerprint （公式自動產生，不要手動填）
```

`site_tldr` 另外還要補階段一沒建的三欄，**插在上面四欄之前**，讓可寫區連續：

```
review_decision （由 Review 選單寫入）
review_fingerprint （由 Review 選單寫入）
approved_by （核可者，自動填）
approved_at （核可時間 UTC，自動填）
approved_fingerprint （由 Review 選單寫入）
reject_reason （退回原因）
current_fingerprint （公式自動產生，不要手動填）
```

建完的標題數必須是 `Track 1_history` 18 欄、`Track 2_discussion` 21 欄、`site_tldr` 12 欄。
**數字不對就是漏建或多建，回頭對。** 硬規則同票內步驟 3：欄名不可重複、不要複製整欄備份、
新欄全部留白。**另外不要新增第二個 `status` 欄**（見第三節）。

**S5　安裝 Apps Script。** 照票內步驟 4 原文。三個分頁各執行一次「安裝／更新公式」。

**S6　確認公式生效。** 照票內步驟 5 原文。

**S7　設 12 個保護範圍。** 三類的定義同票內步驟 6。依 S2／S4 的排序，範圍是：

| 分頁 | A 類（只有 captain） | B 類（只有責任編輯） | C 類（只有 captain） |
|---|---|---|---|
| `Track 1_history` | `J2:J`、`R2:R` | `L2:Q` | `A1:R1` |
| `Track 2_discussion` | `I2:I`、`U2:U` | `O2:T` | `A1:U1` |
| `site_tldr` | `D2:D`、`L2:L` | `F2:K` | `A1:L1` |

**設之前先核對一次欄位位置。** 上表的 A1 位置是依 S2／S4 的排序算出的。
若實際建欄順序與上表不同，範圍要重算——**設錯範圍等於沒設**。

**S8　逐列重新核可 59 列。** 照票內步驟 7 原文，分 6 段：

| 分頁 | 段 | 試算表列號 | 列數 |
|---|---|---|---|
| `Track 1_history` | 1 | 2 | 1 |
| | 2 | 4-24 | 21 |
| | 3 | 26-43 | 18 |
| `Track 2_discussion` | 4 | 2-3 | 2 |
| | 5 | 5-17 | 13 |
| `site_tldr` | 6 | 2-5 | 4 |
| **合計** | | | **59** |

**跳過的列：`Track 1_history` 第 3 列（`h2`）與第 25 列（`h28`）、
`Track 2_discussion` 第 4 列（`d3`）。** 這三列現況 `status` 空白，讓它們停在 `Needs review`。
`Track 2_discussion` 第 18-44 列（`d18`–`d44`）也不核可。

**⚠️ `Track 2_discussion` 第 4 列（`d3`）在 S8 完成前不可刪除或搬移。** 刪了它，
第 5-17 列的指紋全變，那 13 列要重做。

**S9　工程執行不落地驗證。** 照票內步驟 8 原文，接著跑 AC-3 的 id 比對。
兩者都通過才做步驟 9 的合併。

## 相依關係釐清（design stage）

### 相依一：`docs/content-pipeline/operations.md` 只存在於 040 的 worktree

**已驗證**：`git ls-tree main docs/content-pipeline/` 只列出 `data-collection-guide.md` 與 `design.md`，
沒有 `operations.md`。該檔在 `.worktrees/spacedock-ensign-040-approval-content-version-binding/` 下存在。

**判定：本票不依賴 `operations.md`，改為自帶完整 runbook。** 三個理由：

1. `operations.md` 只有「隔離表部署」一節（第 15-25 行），**沒有正式 SSOT 部署的程序**。
   就算取得它，也回答不了本票的問題。
2. 它的第 12 行明寫「兩帳號隔離 probe 完成前，不要把 Apps Script 套到正式 SSOT」——
   它是**限制**本票的文件，不是指導本票的文件。
3. 把它 cherry-pick 到 main 會讓一份 `evergreen` 文件在功能還沒合併時就描述該功能，違反 `AGENTS.md` 的文件規範。

**040 合併前後的差別**：合併前，本票的部署程序**只存在於本票**，唯一權威是 040 worktree 的
`scripts/sync-content.mjs` 與 `scripts/apps-script/approval-workflow.gs` 兩份原始碼（上面每一步都標了行號）。
合併後，`operations.md` 進入 main 成為 `evergreen` 正式程序，本票的 runbook 降為「當時實際怎麼做」的 `record`。
**本票不編輯 `operations.md`**——那個檔在別張票的 worktree 裡，改它是跨票污染。
要補的內容列在下方 Documentation impact 的「實作後更新」。

### 相依二：票內自相矛盾——044 到底是不是前置

**矛盾確認**。本票第 45 行寫「044 的結果可降低本票的風險，但兩者不互為前置」；
第 50 行寫「spike 的形式是在隔離測試表上先跑一次（即 feature 044）」。
既然 `no spike needed` 不成立、而 spike 就是 044，044 就是前置。兩句不能同時成立。

**我的判定：第 45 行錯，044 是步驟 4 起的硬前置。三項外部證據都指向同一邊：**

1. `docs/content-pipeline/operations.md:12`（040 worktree）：
   「兩帳號隔離 probe 完成前，不要把 Apps Script 套到正式 SSOT。」
2. feature 040 的 Out of scope（`040-…md:221`）：
   「不上線正式 SSOT 設定，**直到隔離測試表完成驗證並由 captain 確認**。」
3. 本票 AC-3（非核可者不能編輯審核欄位）與 044 的第二個待驗證命題**是同一件事**。
   差別只在：044 在可丟棄的測試表上做，本票在 40 筆已上線內容的唯一來源上做。

**但這個判定會造成僵局，所以需要 captain 裁決。**

044 的前置是「一份隔離測試表 + 兩個 Google 帳號」，這兩項卡在人不卡在程式，目前不存在。
若照判定執行，鏈條是：`兩個帳號 → 044 → 050 → 040 合併`，而鏈條頭卡住。

**🔴 需要 captain 裁決（worker 不自行決定）。三個選項：**

| 選項 | 做什麼 | 代價 | 不可逆？ |
|---|---|---|---|
| **A（建議）** | 準備隔離測試表與第二個 Google 帳號，先跑 044 | 040 合併再延一輪。要多開一個帳號 | 可逆 |
| **B** | 明文豁免 `operations.md:12` 與 040 Out of scope 的但書，直接在正式表部署 | 若權限設定有誤，錯誤發生在 40 筆已上線內容的唯一來源上 | **部分不可逆**（見下） |
| **C** | 拆分：步驟 1-3（建欄）不需 044，先做；步驟 4 起等 044 | 產線停擺窗口被拉長成不確定時間 | **不建議**——證據 2 證明窗口從建欄就開始 |

**選 B 前要知道的事**：步驟 1-6 本身都可逆（欄位可刪、公式可清、保護範圍可解），
真正不可逆的是**步驟 7 核可過程中若有人同時改動內容**——`approval-workflow.gs` 的復原只還原審核欄位，
不還原內容欄位。以及正式表沒有版本鎖，誤刪整列要靠 Google 的版本記錄救回。

**選 C 不建議的理由**：證據 2 已證明，main 的同步在「建欄」完成的當下就會中止。
步驟 1-3 不是安全的暖身，它就是停擺窗口的起點。

## Acceptance criteria

每一項都寫成「做完之後世界應該是什麼樣子」，並附一個**會失敗**的驗證方式。

**AC-1　部署沒有把既有內容弄壞：以 040 的同步程式跑一次正式表，輸出與部署前逐字相同。**

- `Verified by:` 步驟 8 的指令。取步驟 7 完成後的輸出，與部署前 `src/data/*.json` 的
  sha256（`4d1992e3…cea3b` history、`4071978a…3162` discussions，2026-09-07 量測）比對。
  兩份都必須相同，且 `diff` 無輸出。
- **會怎麼失敗**：任何一列的內容在部署過程中被改到、欄位貼錯位、`chapter` 欄不小心填了值，
  sha256 就會不同。證據 3 已證明「內容沒動時兩邊必然相同」，所以不同就是真的動到了。
- **不可用替代證明**：不接受「肉眼看起來一樣」，不接受只比對筆數。

**AC-2　`npm run sync-content` 在正式表上實際成功一次，exit code 為 0。**

- `Verified by:` 步驟 8 的指令 exit 0，且 stdout 出現
  `✅ 檢查通過，已寫入 src/data/history.json（40 筆）` 與
  `✅ 檢查通過，已寫入 src/data/discussions.json（16 筆，含 tldr）`。
- **會怎麼失敗**：八欄少建一欄 → `缺少必要欄位「X」。`；重新核可漏一列 →
  該列被過濾掉，筆數變成 39；核可紀錄不完整 → `核可紀錄缺少 X。`。
  證據 2 的階段 A、B、C 全部 exit 1，證明這道閘門真的會擋。
- **筆數是硬條件**：40 與 16 兩個數字必須逐字出現。少一筆代表有內容掉了。

**AC-3　重新核可完成後，三個分頁沒有任何「應上線」的列停在 `Needs review`。**

- `Verified by:` 步驟 8 跑完後，比對 `$OUT/history.json` 與 `$OUT/discussions.json` 的
  `id` 清單和部署前的 `id` 清單，必須完全一致（順序也一致）。
  沿用步驟 8 的 `REPO` 與 `OUT` 兩個變數，接著執行：
  ```bash
  REPO="$REPO" OUT="$OUT" node -e '
  const fs=require("fs");
  const ids=p=>JSON.parse(fs.readFileSync(p,"utf8")).map(r=>r.id);
  for (const f of ["history.json","discussions.json"]) {
    const a=ids(`${process.env.REPO}/src/data/${f}`), b=ids(`${process.env.OUT}/${f}`);
    console.log(f, JSON.stringify(a)===JSON.stringify(b) ? "✅ id 清單一致"
      : "⛔ 少了:"+JSON.stringify(a.filter(x=>!b.includes(x)))+" 多了:"+JSON.stringify(b.filter(x=>!a.includes(x))));
  }'
  ```
  兩行都必須是 `✅ id 清單一致`。這段指令 design stage 已實測會真的印出差異
  （拿一份只有 1 筆的 fixture 比對，正確列出少掉的 39 個 `h*` 與 14 個 `d*`）。
- **會怎麼失敗**：漏核可某一列 → 該 `id` 在「少了」清單裡出現。
  誤核可 `h28` 這種不該上線的列 → 出現在「多了」清單裡，同時 AC-1 的 sha256 也會不同。
- **為什麼不直接數 `Needs review`**：分頁上本來就該有停在 `Needs review` 的列。
  「應上線的列都上線了」等價於「輸出的 id 清單沒變」，這個才可機器驗證。

**AC-4　以非核可者身分編輯審核欄位會被拒絕。**

- `Verified by:` 以未列入保護範圍的 Google 帳號開啟正式表，
  對 `Track 1_history` 任一資料列的 `approved_by` 儲存格輸入任意字元。
  必須跳出 Google 的「您嘗試編輯受保護的儲存格」對話框，且儲存格值不變。
  對 `status` 與 `current_fingerprint` 各重複一次（步驟 6 的 A 類與 B 類是分開設定的，要各測一次）。
  記錄：UTC 時間、三次嘗試的結果、使用的角色（**不記 email**）。
- **會怎麼失敗**：保護範圍漏設某一欄，或設成「顯示警告」而非「限制編輯」，
  儲存格就會被改掉。
- **前置**：需要第二個 Google 帳號。這與 044 的資源前置是同一個，見「相依關係釐清」的相依二。
  若 captain 選了選項 B（豁免 044），這一項仍必須做，只是改在正式表上做。

**AC-5　標題列受保護，非 captain 改不動。**

- `Verified by:` 同 AC-4 的帳號，嘗試修改 `Track 2_discussion` 第 1 列任一標題儲存格，
  必須被拒。三個分頁各測一次。
- **會怎麼失敗**：標題列保護是與審核欄位分開設定的（`editor-onboarding.md:110`），
  很容易只設了欄位忘了標題列。改得動標題就是漏設。

**AC-6　部署後 main 仍然不可用，這件事被明確記錄且不被誤認為故障。**

- `Verified by:` **不要在 repo 根目錄直接跑 `npm run sync-content`**——main 的程式不吃
  `CONTENT_OUTPUT_DIR`，成功時會直接覆寫 `src/data/`，違反 `AGENTS.md` 第 1 條。
  改成把 main 的程式複製到暫存目錄再跑；它的輸出路徑是相對於自己的位置算的，
  所以會寫進暫存目錄底下的 `src/data/`，碰不到 repo：
  ```bash
  SANDBOX="$(mktemp -d)"; mkdir -p "$SANDBOX/scripts" "$SANDBOX/src/data"
  git -C "$REPO" show main:scripts/sync-content.mjs > "$SANDBOX/scripts/sync-content.mjs"
  node --env-file="$REPO/.env.local" "$SANDBOX/scripts/sync-content.mjs"; echo "exit=$?"
  ```
  必須 exit 1 並輸出 `第 N 欄的標題「review_decision」對不到任何預期欄位。`。
  這是**預期行為**，不是 bug。合併 040 之後再跑一次（此時 main 的程式已是新版），必須 exit 0。
- **會怎麼失敗**：若這一步 exit 0，代表八個欄位沒有真的建進正式表，前面所有步驟都沒生效。
- **這個 sandbox 手法 design stage 已實測**：以本機 fixture 餵入四個部署階段的 CSV，
  main 版程式在階段 A exit 0、階段 B/C/D 全部 exit 1，錯誤訊息與上面逐字相同。
- **這一項的用意**：讓「產線停擺窗口」變成可觀測的事實，而不是口頭承諾。
  合併 040 之前若有人跑了 main 的同步並看到錯誤，本票已經寫明那是預期的。

## 元件與資料需求

- **元件階層與 props**：**不適用。** 本票不新增或修改任何 React 元件，`src/` 下不會有任何檔案變更。
  唯一的程式碼變更是步驟 9 的 040 合併，那是 040 的交付物。
- **手機／桌機響應行為**：**不適用。** 同上，沒有 UI 變更。
- **資料形狀**：不變。`src/data/history.json` 與 `src/data/discussions.json` 的 schema
  與內容都必須逐字不變（AC-1）。本票新增的八個欄位全部停在 SSOT 端，不進入 JSON 輸出。
- **資料來源**：正式 SSOT 試算表 `收集區` 的三個分頁，經由 `.env.local` 的三個 CSV URL 讀取。
  **URL 不得寫入 repo、不得寫入本票、不得貼進任何報告。**
- **新增型別**：無。

## Documentation impact

### 現在更新

| 文件 | 要記什麼 | 狀態 | 驗證目標 |
|---|---|---|---|
| 本票（`050-…md`） | 上述 runbook 與 AC | 已定方向、**尚未執行**。試算表目前仍是部署前狀態 | 步驟 8 的 sha256 比對 |

**沒有其他文件現在更新。** 理由：本票尚未執行任何一步，把預定行為寫進
`docs/` 下的 `evergreen` 文件，會讓文件描述一個不存在的現況——
這正是 `AGENTS.md` 指出的「過時的 evergreen 文件是危險的」。

### 實作後更新

| 文件 | 要改什麼 | 條件 |
|---|---|---|
| `docs/content-pipeline/operations.md` | 新增「正式 SSOT 部署」一節，把本票步驟 1-7 收編為正式程序；第 12 行的 probe 但書依 captain 裁決結果改寫或加註 | **040 合併之後**（該檔合併前不在 main） |
| `docs/content-pipeline/design.md` | 第二節欄位表補上八個審核欄位與 `chapter`；第五節施工順序表追加本票為新項目 | 部署完成後 |
| `docs/health-check/TODO.md` | P3-7（`chapter` 設計已放棄）追記：本票為了 Apps Script 建了一個空白 `chapter` 欄，該欄現在有技術用途，廢除它要連 `approval-workflow.gs` 一起改 | 步驟 1 完成後 |
| `docs/health-check/2026-09-03-editor-onboarding.md` | **不改寫原文**，追加補述：第 261 行「`reject_reason` 欄不存在」已於本票解決；第 425-430 行的順序判斷正確，但漏了「建欄當下 main 就同步不了」這一點 | 部署完成後 |
| `docs/INDEX.md` | 若 `operations.md` 隨 040 進 main，補一筆索引 | 040 合併後 |
| `docs/constitution-features/044-…md` | 依 captain 裁決結果，在 044 的相依關係註明它是否為 050 的前置 | captain 裁決後立即 |

### 不更新

| 文件 | 為什麼 |
|---|---|
| `AGENTS.md` | 本票不改變任何 agent 的行為約束。「不要自己執行內容同步」在部署後依然成立 |
| `docs/content-pipeline/data-collection-guide.md` | 它寫的是內容怎麼蒐集，與審核欄位無關 |
| `docs/project/` 全部 | 架構與技術選型不變 |
| `docs/_archive/` | 依規定不動 |
| `scripts/` 下任何程式 | 本票是純部署票。程式在 040，已完成 |

## Out of scope

不改 feature 040 的程式（已完成）。不處理標題列與整列刪除的保護範圍（另議）。不處理 HTML 淨化（042）與刪列門檻（043）。

### design stage 追加的 Out of scope

- **不修 `approval-workflow.gs` 缺別名表的問題。** 證據 1 顯示 Apps Script 對標題的容忍度比同步程式低。
  本票用「改試算表標題」繞過（步驟 2），成本一格。改程式要重跑 040 的 review 與 verify，代價大得多。
  **這個落差要記成後續票**：往後任何人在試算表加中文說明或改標題寫法，Apps Script 可能無聲失效。
- **不廢除 `chapter` 欄。** 見 `TODO.md` 的 P3-7。本票反而新建了它。
- **不執行 044。** 044 是獨立的票，有自己的資源前置。

## Stage Report: design

- DONE: 產出 captain 可以直接照著做的部署 runbook：八個審核欄位的確切欄名（以 `scripts/sync-content.mjs` 的 `APPROVAL_COLUMNS` 為唯一依據，不得引用文件轉述）、Apps Script 公式與 Review 選單的安裝步驟、既有 40 筆逐列重新核可的順序與範圍、以及保護範圍要涵蓋哪些欄位。每一步都要寫明由誰執行。
  「部署 runbook」步驟 0-9，每步標 `captain` 或 `工程`；欄名逐字取自 040 worktree `scripts/sync-content.mjs:84-93`；保護範圍分 A/B/C 三類，B 類對應 `approval-workflow.gs:12-14` 的 `WRITABLE_REVIEW_FIELDS`；重新核可範圍算出 59 列（Track 1 40／Track 2 15／site_tldr 4）。
- DONE: 補齊 acceptance criteria，每一項都要有可失敗的 `Verified by:`。
  AC-1 至 AC-6。AC-1 綁定部署前實測 sha256（`4d1992e3…cea3b`／`4071978a…3162`）；AC-2 綁定筆數字串 40／16；AC-3 的 id 比對指令實測會真的印出差異（餵 1 筆 fixture，正確列出少掉的 39 個 `h*` 與 14 個 `d*`）；AC-4／AC-5 為兩帳號人工測試；AC-6 讓停擺窗口變成可觀測事實。
- DONE: 釐清並在票內明確記錄兩項相依。
  「相依關係釐清（design stage）」。相依一判定本票不依賴 `operations.md`、改為自帶 runbook（`git ls-tree main docs/content-pipeline/` 只有兩個檔）；相依二判定第 45 行「不互為前置」為錯，並附三項外部證據，同時標記 🔴 需 captain 裁決並給出 A/B/C 三個選項。
- DONE: Documentation impact 三分類，每節列出文件或寫「無」。
  「現在更新」僅本票並說明為何不動 `docs/`；「實作後更新」六筆各附觸發條件；「不更新」五筆各附理由。
- DONE: 元件階層／響應行為／資料需求。
  本票無 UI 與程式變更，元件與響應兩項明寫「不適用」並說明理由；資料需求記明 schema 不變、八欄停在 SSOT 端不進 JSON。

### Summary

design stage 沒有接觸正式 SSOT，改以離線執行真正的程式碼取得四項證據，並全部寫進票內。
最重要的兩項是新發現：其一，`approval-workflow.gs` 沒有別名表，正式表現況的
`Track 1_history` 缺 `chapter`、`Track 2_discussion` 的 `owl comment` 用空格，兩者都會讓
「安裝／更新公式」直接報錯——這是照現有文件做一定會踩到的坑；其二，main 現行的同步程式
在「建好八個欄位」的當下就會中止（不是等到裝公式），所以產線停擺窗口比
`editor-onboarding.md:425-430` 的描述更早開始，B→D 必須一氣呵成。
runbook 裡每一段指令都實跑過，包含一個被淘汰的寫法：`node -e "await import(…)"`
會 exit 0 但什麼都不做，票內已明文標記不要用。
留下一項 🔴 需 captain 裁決：044 是否為本票步驟 4 起的硬前置。三項外部證據都指向「是」，
但 044 卡在「兩個 Google 帳號」這個人的前置，判定成立就會形成僵局，因此不由 worker 決定。

## Stage Report: implement

- DONE: 執行 050 runbook 步驟 0（唯讀），把三個分頁的真實標題列逐字貼進票內。注意 `--env-file` 必須寫在 `-e` 前面。**不得對正式試算表做任何寫入**，不得執行 `npm run sync-content`，`src/data/*.json` 零改動。
  第一節。票內指令照原樣跑過一次（`--env-file` 在前，環境變數有載入），輸出逐字貼上；另附完整 CSV 解析版指令與三個分頁的完整標題列 JSON。對外部系統只做三次 HTTP GET。`src/data/*.json` 前後 sha256 均為 `4d1992e3…cea3b`／`4071978a…3162`；三個 checkout 的 `git status` 無 `src/data/` 變動。
- DONE: 用真實標題列校正步驟 3 的欄位表（現況已有哪些欄、八個審核欄位哪幾個要新建、插在哪個位置），並確認票內兩項已知不符是否仍成立（`Track 1_history` 缺 `chapter`、`Track 2_discussion` 為 `owl comment` 空格、三分頁皆無 `reject_reason`）。比照證據 1 的手法、以**這次實測到的真實標題**重跑 `resolveApprovalHeaders_`，分別驗現況／套用步驟 1-2 後／再加八欄後的結果。
  第二至四節。三項已知不符全部成立。另查出兩項票內沒有的不符：`approved_by`／`approved_at` 三個分頁都不存在（票內記成已有）、`Track 2_discussion` 還缺 `owl_depth_comment` 與 `full_content`。`resolveApprovalHeaders_` 以實測標題重跑四個階段：現況三個分頁全 ⛔；套用步驟 1-2 後仍全 ⛔；再加七個審核欄後 Track 1／site_tldr ✅ 18／12 欄，**Track 2 仍 ⛔ `缺少欄位「owl_depth_comment」。`**。falsifying change：若 `APPROVAL_FIELDS['Track 2_discussion']` 不含那兩欄，階段 C 的 Track 2 就會通過而這項發現不成立。
- DONE: 量出產線全停窗口（步驟 3→7）的大小：三個分頁合計要手動建立幾欄、**逐列重新核可的實際列數**（實測，不沿用記錄中的 59）、步驟 6 要設幾個保護範圍。並重跑證據 3（空白 `chapter` 不改變同步輸出的 sha256 比對，2026-09-07 量測需複驗）與確認 `sync-content.mjs` 的 alias 表真的同時收 `owl comment` 與 `owl_comment`（實讀該表，不採信轉述）。runbook 若有任何一步現況下做不到或順序有誤，獨立列出。
  第五至八節。合計要建 24 欄（票內表算 17，少 7）；其中 **9 欄是安全前綴**（main 同步仍 exit 0 且輸出逐字不變），**窗口只涵蓋 15 欄**。逐列核可實測 59 列（40／15／4），與票內數字相符——票內從 JSON 筆數推算，本輪直接數試算表 `status` 欄。保護範圍實測 **12 個**（建議排序）／15 個（票內排序），A1 位置由 fixture 標題列算出。證據 3 複驗成立且範圍更大：六組 fixture 的兩份 JSON sha256 全部相同並等於 repo 現況。alias 表實讀 `git show main:scripts/sync-content.mjs` 第 112 行，`aliases: ['owl comment', 'owl_comment']` 兩種都收。runbook 缺陷 D1-D6 獨立列於第七節，其中 D1、D3 會讓照票執行必定失敗。
  falsifying change：把 `fixB2` 多加一個 `review_decision` 欄，main 同步就從 exit 0 變 exit 1，安全前綴的界線因此可被推翻；把 `fixD`／`fixS` 任一列的 `chapter` 填入非空值，040 同步的輸出 sha256 就會與 baseline 不同，證據 3 的結論隨之失效。

### Summary

本輪只做步驟 0，未對正式試算表寫入任何一格。步驟 0 本身查出票內指令有缺陷：
`split(/\r?\n/)[0]` 遇到標題格內的換行就截斷，Track 1 與 Track 2 的標題列都只印出一半，
`vibe`／`sticky` 完全看不到。改用完整 CSV 解析後才拿到基準。

兩項最重要的發現都會讓照票執行的部署失敗。其一，`Track 2_discussion` 缺
`owl_depth_comment` 與 `full_content`，票內 runbook 沒有這一步，做完步驟 1-3 後
「安裝／更新公式」在 Track 2 仍會報錯——證據 1 之所以顯示通過，是因為它餵的是
`design.md` 的設計意圖而非現況標題。其二，票內表把 `approved_by`／`approved_at`
記成已存在，實際三個分頁都沒有，要建的欄從 17 個變成 24 個。

窗口反而比票內估的小。實測有 9 欄的安全前綴可先建，main 同步照常 exit 0 且輸出逐字不變；
窗口只涵蓋 15 欄。核可列數 59 經實測確認，`editor-onboarding.md:430` 的「工作量比預估大」
指的是協調成本而非列數——窗口期間有 30 列草稿在編輯台手上。另量化了票內只定性描述的
Track 2 序號陷阱：15 個已核可列中只有第 4 列（`d3`）一列草稿夾在其中，其餘 27 列草稿都在後面，
所以風險點只有一個。

第八節的 S1-S9 已整份以 fixture `fixS` 實測：Apps Script 三個分頁全通過、040 同步 exit 0
且輸出與 baseline 逐字相同、main 同步 exit 1（窗口確實打開）、12 個保護範圍與 6 個核可連續段
都由程式算出。時間估算 75-120 分鐘是依動作次數推算，**不是量測的牆鐘時間**——
本輪沒有寫入試算表，無法量測 captain 在 Google UI 上的實際速度。
