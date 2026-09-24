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
3. **逐列重新核可。** `docs/health-check/2026-09-03-editor-onboarding.md:432-433` 明訂舊列不能批次補造指紋——部署新欄位後既有的 `Approved` 會**全部先顯示 `Needs review`**。
4. **確認保護範圍。** 八個審核欄位需設為投稿者不可編輯。與 `status` 欄的保護是分開設定的。

`editor-onboarding.md:434` 特別註明：**編輯權限已經開出去，這一輪重新核可的工作量比原設計預估的大。**

## 相依關係

- **擋住 040 的合併。** 本票未完成前，040 不應合併進 main。
- **feature 044**（隔離測試表兩帳號 probe）驗證的是同一套機制，但在測試表上。044 的結果可降低本票的風險，但兩者不互為前置。
- **`reject_reason` 欄目前在正式試算表上不存在**（`editor-onboarding.md:261`），而 040 將其列為必填。

> ⚠️ **2026-09-07 design stage 更正：上面第二個項目符號的「兩者不互為前置」不成立。**
> 判定與理由見下方「相依關係釐清（design stage）」。原句保留。

## Risk evidence

`no spike needed` 不成立，但 spike 的形式是**在隔離測試表上先跑一次**（即 feature 044）。**不得直接在正式 SSOT 上試錯**——正式表是 40 筆已上線內容的唯一來源。

> **該 spike 已由 feature 044 於 2026-09-21 完成並 PASSED**（`score: 0.96`，已歸檔），
> 詳見下方「相依關係釐清」的相依二。上面那句講的是 spike 的**形式**，不是它的進度。

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
> `TODO.md` 的 P3-7 記載 `chapter` 設計已被放棄。本票不動它。
>
> **⚠️ 廢除 `chapter` 這件事目前尚無 feature 票，負責人未定。**
> 原句寫「那是另一張票要處理的事」，但那張票不存在——
> 它現在唯一的落腳處是 `TODO.md` 的 **P3-7**（以名稱引用，不寫行號，理由見第十節）。
> **而本票剛好讓它更難處理**：本票為了 Apps Script 新建了一個空白 `chapter` 欄，
> 該欄從此有技術用途，要廢除它得連 `approval-workflow.gs` 一起改。
> 這一點已列在下方 Documentation impact 的「實作後更新」。

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
| `site_tldr` | `status`（`TODO.md` 的 P1-5「附帶問題已解決」記錄現況為 `order｜label｜text｜status｜link`） | `review_decision`、`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、`current_fingerprint`、`reject_reason` |

**三條硬規則：**

1. **欄名不可重複。** 同一分頁出現兩個 `status`，兩支程式都會中止。`site_tldr` 發生過一次。
2. **不要複製整欄來「備份」。** 那就是規則 1 的違反方式。
3. **新增的欄位全部留白。** 值由公式與 Review 選單產生。

**⚠️ 做完這一步，main 的 `npm run sync-content` 就會中止（證據 2 的階段 B）。從這裡到步驟 7 之間不可發布內容。**

### 步驟 4（captain）安裝 Apps Script

前置：feature 044 **已於 2026-09-21 完成並 PASSED**（見下方「相依關係釐清」的相依二）。
仍待 captain 依 040 Out of scope 的後半句「並由 captain 確認」給出那一次確認。

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
本票不處理（見 Out of scope）。

> ⚠️ **2026-09-24 更正：原句寫「由 feature 043（刪列跌幅門檻）在同步端擋」，那句話會讓人以為已經有人接手。**
> 重讀 043 的 front matter：`status: design`、標題仍掛「待captain確認脈絡」、
> `source` 寫「脈絡待確認後再決定**是否進行**」——**那張票還沒決定要不要做。**
> 而且就算做出來也擋不住本票的風險：043 的門檻是「初步建議兩成」
> （`043-sync-row-drop-threshold.md:52`），誤刪 1 列／40 列 ＝ **2.5%**，遠在門檻之下。
> **本票對誤刪的防線是 S3 的檢查①與檢查②**（筆數仍是 40／16、AC-3 的 id 比對仍一致），
> 不是 043。S9 會再跑一次同樣的兩項。防線本身不變，改的只是這句話。

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
被禁止的是**批次補造指紋**——`editor-onboarding.md:432` 的原句是「舊列不能批次補造指紋」，
040 worktree 的 `operations.md:13` 寫「不要批次替舊列補造指紋。部署後要逐列重新核可。」
「手動貼上或用公式填 `approved_fingerprint`」是本票對那條禁令的舉例，不是原文。
那樣做會讓核可不再綁定內容。

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

**`site_tldr`** — 現況 5 欄（`order`／`label`／`text`／`status`／`link`，與 `TODO.md` 的 P1-5「附帶問題已解決」的記錄相符），
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

`editor-onboarding.md:434` 的「這一輪重新核可的工作量比原設計預估的大」**不是指列數變多**。
該句的主詞是「編輯權限已經開出去」——工作量變大的是**協調成本**：
窗口期間有 30 列草稿在編輯台手上可以隨時改。任何人改到那 59 列中任一列的發布內容，
該列的指紋就變了，核可要重做（`approval-workflow.gs` 會報
`審核期間內容已變更。所有審核欄位已復原。`）。

#### Track 2 的序號暴露面（票內未量化）

`Track 2_discussion` 的指紋含已發布列序號。實測序號分布：

- 15 個 `Approved` 列在試算表的第 2-17 列，序號 1-16。
- **只有 1 列**未核可的草稿夾在其中：第 4 列（`d3`）。刪掉它，其後 13 列（第 5-17 列）的指紋全變。
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

**⚠️ `chapter`、`owl_depth_comment`、`full_content` 三個內容欄在 S9 完成前必須保持全欄留白。**
階段一可以分幾天做，而保護範圍要到 S7 才設——這三欄在這段期間是**編輯台可寫的**。
**沒有任何程式會擋填值**：實測填入非空值，main 的同步仍然 exit 0，
只有輸出的 sha256 會變（`38e662f6…`／`6895ef6b…`）。
填了值，AC-1 的逐字比對就會失敗。請在階段一開始前告知責任編輯不要動這三欄。

**S3　工程確認產線還活著。** 用 AC-6 的 sandbox 手法跑 main 的同步，必須 exit 0，
且輸出的兩個 sha256 仍是 `4d1992e3…cea3b` 與 `4071978a…3162`。
**這一關沒過就不要進階段二。**

**AC-6 那段 `grep` 在 S3 會印 ⛔，那是對的。** 它是給窗口打開之後用的，
階段一還沒有任何窗口內欄位，本來就不該出現標題錯誤。S3 只看 exit code 與 sha256。

此時 main 成功會把兩個 JSON 寫進 `$SANDBOX/src/data/`（不是 repo），所以可以直接比：

```bash
shasum -a 256 "$SANDBOX/src/data/history.json" "$SANDBOX/src/data/discussions.json"
diff "$REPO/src/data/history.json" "$SANDBOX/src/data/history.json"
diff "$REPO/src/data/discussions.json" "$SANDBOX/src/data/discussions.json"
```

**sha256 不符時怎麼辦。** 先跑下面兩項**機器可判**的檢查，再看 `diff`。

**⚠️ 不要只看 `diff` 落在哪裡就決定重量 baseline。** 部署時誤刪一列已核可的列，
`diff` 也會完全落在「那 59 列的發布內容」之內，main 還是 exit 0——
光看 exit code 與 diff 位置，**誤刪與合法填值長得一樣**（實測見第十節）。

**檢查①　筆數。** main 印出的兩行必須逐字仍是：

```
✅ 檢查通過，已寫入 src/data/history.json（40 筆）
✅ 檢查通過，已寫入 src/data/discussions.json（16 筆，含 tldr）
```

**檢查②　id 清單。** 把 AC-3 的比對指令提前跑一次，`OUT` 指向沙箱：

```bash
REPO="$REPO" OUT="$SANDBOX/src/data" node -e '
const fs=require("fs");
const ids=p=>JSON.parse(fs.readFileSync(p,"utf8")).map(r=>r.id);
for (const f of ["history.json","discussions.json"]) {
  const a=ids(`${process.env.REPO}/src/data/${f}`), b=ids(`${process.env.OUT}/${f}`);
  console.log(f, JSON.stringify(a)===JSON.stringify(b) ? "✅ id 清單一致"
    : "⛔ 少了:"+JSON.stringify(a.filter(x=>!b.includes(x)))+" 多了:"+JSON.stringify(b.filter(x=>!a.includes(x))));
}'
```

兩行都必須是 `✅ id 清單一致`。**這是 AC-3 的指令原樣提前跑，不是另一套判準。**

分辨表：

| 分辨方式 | 判定 | 處置 |
|---|---|---|
| main 同步 exit 0、**檢查①與②都通過**，且 `diff` 只落在那三個內容欄或那 59 列的發布內容，且編輯台確認是有人正常填稿 | **編輯合法填值** | **重新量 baseline。** 把新的兩個 sha256 更新進 AC-1 的綁定值，在 AC-1 旁註明新值、量測日期與換基準的原因，然後繼續階段二 |
| main 同步 exit 0，但**檢查①或②沒通過**（筆數不是 40／16，或 id 比對印出「少了」「多了」） | **有列掉了或被換掉** | 停住。**絕對不要重量 baseline**——那會把掉掉的那一列一起烤進新基準，之後 AC-1 反而會通過，最壞情況是少一筆內容靜默上線。先照 id 比對印出的那個 `id` 把列找回來（Google 試算表的版本記錄） |
| main 同步轉為 exit 1，或 `diff` 落在沒人動過的欄位 | **部署副作用** | 停住。回頭查 S1／S2 是否改到欄位位置、刪到列、或在新欄填了值。**不要重量 baseline** |

**為什麼兩項要一起看。** 只看筆數擋不住「刪一列又新增一列」——筆數仍是 40，
但 id 比對會印出 `⛔ 少了:["h1"] 多了:["h99"]`。兩項合起來在四個實測情境下全部判對（第十節）。

**重量 baseline 不等於放寬 AC-1。** AC-1 的判準不變（部署前後逐字相同），
變的只是「部署前」那個基準的量測時點。重量之後，S9 仍然必須逐字相同。
**只有 captain 能改 AC 的要求**；工程在這裡做的是更新一個量測值，不是改判準。

**這一段何時升級為 Material**：兩個條件各自獨立，任一成立就升級。

1. 任何人在階段一對 `chapter`、`owl_depth_comment`、`full_content`
   或那 59 列的發布內容寫入任何值。在那之前它是 deferred risk——2026-09-24 重量 baseline 仍未漂移。
2. **S3 真的出現 sha256 不符，而工程在未跑檢查①②的情況下重量 baseline。**
   這一條需要「先誤刪、再誤判」兩步才成立，所以現在仍是 deferred risk；
   但它一旦發生就直接打穿 AC-1 與 AC-2，因為新基準會把錯誤內容當成正確。

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

### 九、F1-F4 的處置與引用複核（2026-09-24 第二輪）

verify stage 判 **PASSED**，並提出 F1-F4 四筆 finding。FO 授權**四筆全部 fix**。
本輪**未對正式試算表做任何寫入**，也未讀取它——四筆全部是票內文字的修正，
所需事實改由重跑 main 的同步程式（本機 fixture、暫存沙箱）與實讀被引用的檔案取得。
`src/data/*.json` 零改動。

#### 四筆 finding 的處置

| finding | 分類 | 改了哪裡 | 改成什麼 |
|---|---|---|---|
| **F2** | Material | AC-6 的 `Verified by:` | 判準改為「同一行同時含 `對不到任何預期欄位` 與 `review_decision` 兩個子串」，並在 sandbox 指令裡附上該 `grep`。不再逐字比對引號內容，不再綁欄號 |
| **F4** | Deferred risk | S2、S3 | S2 加「三個內容欄在 S9 完成前必須全欄留白」；S3 加 sha256 不符時的分辨表與 re-baseline 條文，並記下升級為 Material 的條件。順帶補上 S3 的 `diff` 指令——原本只寫「比 sha256」，沒寫怎麼看出差在哪 |
| **F1** | Polish | 第六節「Track 2 的序號暴露面」 | 「其後 14 列」改為「其後 13 列（第 5-17 列）」 |
| **F3** | Polish | 步驟 3 的表、第三節 | `TODO.md:127` 改為 `TODO.md:156`。**cycle 3 再改一次，改為名稱引用 `TODO.md` 的 P1-5「附帶問題已解決」**——`TODO.md` 是票內唯一兩個 checkout 不同的被引用檔，理由見第十節 |

**AC 的要求文字一字未動。** F2 只改 AC-6 的 `Verified by:`（改「怎麼認出那一行」），
AC-6 的標題與「必須 exit 1 並輸出一行指出 `review_decision` 這一欄對不到任何預期欄位」
這個要求本身不變。F4 的兩處都落在 S2／S3，沒有碰 AC-1 的條文。

#### F2 的字串已獨立重測

架本機 HTTP server 供應三個分頁的 fixture（標題用第三節的建議值、S2／S4 的排序），
把 `git show main:scripts/sync-content.mjs` 複製到暫存沙箱執行。exit 1，逐字印出：

```
第 15 欄的標題「review_decision （由 Review 選單寫入）」對不到任何預期欄位。檢查是否打錯字。
```

兩項確認：

1. `grep '「review_decision」'` **找不到**這一行（引號內多了中文說明），F2 成立。
2. 新判準 `grep '對不到任何預期欄位' | grep -q 'review_decision'` **認得**這一行。

另查出訊息實際結尾還有 `檢查是否打錯字。`（`sync-content.mjs` 第 294 行的
`addError(...)` 樣板）。AC-6 原文只引到 `對不到任何預期欄位。`，那是子串，不影響判準；
新版已把完整訊息逐字寫進票內，工程不會再對不上。

#### 引用複核：票內每一處 `檔名:行號`

verify 說它實讀通過 8 處。cycle 2 把範圍擴到全票的 `檔名:行號` 一族（31 處），
cycle 3 再補一族與一處漏掉的，共 **36 個被引用的位置**。
**五處指不到宣稱的內容，全部已修；其餘 31 處實讀通過。**
另有一列（`TODO.md` P3-7）宣稱正確、但本表當初拿來當證據的行號記錯，已改為名稱引用。

> ⚠️ **這張表的三個邊界，先寫清楚，因為它們是這張表唯一會騙人的地方。**
>
> 1. **它是「掃描當下」的快照。** 同一輪之後才新增的引用不會出現在裡面。
>    cycle 2 的 `sync-content.mjs:294` 正是這樣漏的——它是 cycle 2 自己為了 F2 加進票內的，
>    加在掃描之後，所以掃描結果「零漏」與「這張表涵蓋全票」**不是同一件事**。
>    本表已把它補上，並在第三輪重掃一次。
> 2. **它原本只掃 `檔名:行號` 一族。** `檔名 第 N 條／第 N 節` 是另一族，
>    原本整族不在範圍內。第三輪已把這一族的 5 處補進表尾。
> 3. **行號只在「那個檔在兩個 checkout 相同」時才有唯一答案。**
>    被引用的檔裡只有 `TODO.md` 在 main 與本 branch 之間不同（見 P3-7 那一列），
>    其餘七個檔兩邊是同一個 blob，所以行號無歧義。
>
> **⚠️ 第四輪追加：上面三條有一個共同的隱含假設，而第四族違反它。**
> 三條都假設「被引用的對象是一個檔，它的內容穩定，會變的只有位置」。
> **第四族是「引用另一張票、只寫 feature 編號」**（`feature 044`、`feature 043`、`feature 040`）。
> 它變的不是位置，是**被引用對象的狀態**——票會從 `design` 走到 `complete`、會被歸檔、
> 它的結論會反過來。**三條邊界一條都擋不住，因為它們檢查的是行號。**
>
> **第四族的檢查方式不是讀行號，是重讀被引用票的 front matter**：
> `status`／`verdict`／`completed`／是否已移進 `_archive/`。
> H1 就是這樣躲過三輪的：`044` 在 2026-09-21 完成並 PASSED，
> 票內卻還寫著「前置目前不存在、鏈條頭卡住」——**三輪掃描全部只盯 `檔名:行號`，所以全部沒看見。**
> 第四族的結果另列於下方「第四族：票對票的引用」。

| 引用 | 宣稱的內容 | 結果 |
|---|---|---|
| `editor-onboarding.md:430`（4 處） | 「編輯權限已經開出去，這一輪重新核可的工作量比原設計預估的大」 | ⛔ 該句在**第 434 行**。第 430 行是「正確順序是：試算表建欄 → …」。**已改為 `:434`** |
| `040-…md:221` | 040 的 Out of scope「不上線正式 SSOT 設定，直到隔離測試表完成驗證並由 captain 確認」 | ⛔ 該句在**第 290 行**，第 221 行是空行（main、040 worktree、本 worktree 三份皆同）。**已改為 `040-approval-content-version-binding.md:290`**（並補全檔名，原本寫成 `040-…md`） |
| 本票「第 50 行」 | 「spike 的形式是在隔離測試表上先跑一次（即 feature 044）」 | ⛔ 該句在第 53 行。cycle 2 改為「第 53 行（`## Risk evidence` 首句）」；**cycle 3 把行號整個拿掉、只留錨點** |
| `TODO.md:127` | `site_tldr` 現況為 `order｜label｜text｜status｜link` | ⛔ 第 127 行是空行，該記錄在第 156 行（即 F3）。cycle 2 改為 `:156`；**cycle 3 再改為名稱引用 `TODO.md` 的 P1-5「附帶問題已解決」**，因為 `TODO.md` 兩個 checkout 的行號不同 |
| `editor-onboarding.md:425-430` | 「一旦先合併而試算表還沒建那八欄…」＋「正確順序是…」兩句 | ✅ 兩句分別在第 428、430 行，都落在區間內 |
| `editor-onboarding.md:261` | `reject_reason` 欄在試算表上不存在 | ✅ 逐字相符 |
| `editor-onboarding.md:104-111` | 風險 5（改到欄位標題，整條產線停擺） | ✅ 標題在第 104 行，整段落在區間內 |
| `editor-onboarding.md:110` | 標題列保護與 `status` 是分開設定的 | ✅ 逐字相符 |
| `editor-onboarding.md:58` | 「整列刪除」保護尚未確認 | ✅ 逐字相符 |
| `editor-onboarding.md:344-345` | `h28` 掛了 `h14` 的標題，以清空 `status` 擋住 | ✅ 逐字相符 |
| `2026-08-31-content-pipeline.md:174` | `收集區` 的 Track 1 為 9 欄、不含 `chapter` | ✅ 逐字相符 |
| `TODO.md` P3-7（以名稱引用） | `chapter` 欄位設計已被放棄 | ✅ 標題存在，內容相符。**本欄原寫「第 865 行」，那是錯的記法而非錯的行號**——`TODO.md` 是票內唯一在 main 與本 branch 之間有差異的被引用檔（main 多 40 行，插在第 596-635 行），所以 P3-7 在 main 是第 **905** 行、在本 worktree 是第 865 行，**同一個名稱有兩個合法行號**。票內三處都以名稱引用、不帶行號，所以沒有任何載重引用被打壞。詳見 G1 的處置 |
| `approval-workflow.gs:5` | `APPROVAL_FIELDS['Track 1_history']` 含 `chapter` | ✅ |
| `approval-workflow.gs:6` | `APPROVAL_FIELDS['Track 2_discussion']` 是 13 個欄位 | ✅ 實數 13 個 |
| `approval-workflow.gs:12-14` | `WRITABLE_REVIEW_FIELDS` 排除 `status` 與 `current_fingerprint` | ✅ |
| `approval-workflow.gs:76-80` ／ 第 79 行 | Track 2 的指紋含 `__sequence` | ✅ 第 79 行為 `projection.push(['__sequence', …])` |
| `approval-workflow.gs:127-144` | `resolveApprovalHeaders_` | ✅ 第 127 行是函式開頭，第 144 行是它的結尾 `}` |
| `approval-workflow.gs:159` | `這個分頁不支援核可公式。` | ✅ 逐字相符 |
| `approval-workflow.gs:219` | 不可核可標題列 | ✅ 逐字相符 |
| `approval-workflow.gs:220` | `Session.getActiveUser().getEmail()` | ✅ 逐字相符 |
| 040 `sync-content.mjs:84-93` | `APPROVAL_COLUMNS` 八欄全為 `required` | ✅ 第 84 行宣告、第 93 行 `];`，八筆皆 `column: 'required'` |
| 040 `sync-content.mjs:392` | `publishedRowSequences` | ✅ 函式定義在該行 |
| main `sync-content.mjs` 第 94 行 | `chapter` 為 `optional` | ✅ |
| main 第 97-99 行 | Track 1 的 `approved_by`／`approved_at`／`reject_reason` | ✅ 三行逐字相符 |
| main 第 112 行 | `aliases: ['owl comment', 'owl_comment']` | ✅ 逐字相符 |
| main 第 113、116 行 | `owl_depth_comment`、`full_content` | ✅ |
| main 第 117-119 行 | Track 2 的三欄 | ✅ |
| main 第 123-129 行 | `SITE_TLDR_COLUMNS` 無 `approved_by`／`approved_at`／`reject_reason` | ✅ 七行實讀，確實沒有 |
| `operations.md:12` ／ 第 15-25 行 | probe 但書；「隔離表部署」一節 | ✅ 第 12 行逐字相符；該節內容為第 15-25 行（第 26 行空白、第 27 行是下一節） |
| `design.md` 第二節第 4 點 | 找不到標題就中止並指名 | ✅ 第二節在第 135 行，第 4 點為「找不到就中止，並指名是哪個標題看不懂」 |
| 本票 `## 相依關係` 第二個項目符號 | 「兩者不互為前置」 | ✅ 指到該句。cycle 2 寫成「第 45 行（錨點）」，cycle 3 **把行號整個拿掉、只留錨點**——理由見下方「錨點不等於修好」 |
| main `sync-content.mjs:294` | `第 N 欄的標題「…」對不到任何預期欄位。檢查是否打錯字。` 的 `addError` 樣板 | ✅ 逐字相符。**cycle 2 自己新增的引用，當輪掃描沒有涵蓋到**（見上方邊界 1） |
| `AGENTS.md` 第 1 條 | 不要自己執行內容同步 | ✅ 第 12 行 `### 1. 不要自己執行內容同步`；票內「main 的程式成功時會直接覆寫 `src/data/`，違反 `AGENTS.md` 第 1 條」成立 |
| `design.md` 第二節的欄位表 | 欄位表是設計意圖、不是現況快照 | ✅ 第二節內三個分頁各有欄位表（第 182／193／204 行） |
| `design.md` 第五節施工順序表 | Documentation impact 要追加本票為新項目 | ✅ `## 五、更新流程與施工順序`（第 349 行）內有 `### 施工順序` 表 |
| `design.md` 明訂舊列不能批次補造指紋（第 37 行、步驟 7） | 舊列不能批次補造指紋 | ⛔ **`design.md` 完全沒有這一條**（全檔 `grep 補造` 零命中，`指紋` 只出現在修訂紀錄）。該規則實際在 `editor-onboarding.md:432-433`，`040-…md:173` 與 040 worktree 的 `operations.md:13` 也各有一份。**引錯的是檔名，不是行號。已改指 `editor-onboarding.md:432-433`** |

**F3、`editor-onboarding.md:430`、`040-…md:221`、本票「第 50 行」是同一種錯**：
引用的行號在寫下之後就沒有再被驗證過。修法一致——實讀一次，改成對的行號，
並在自我引用的地方補上章節錨點，讓它不再隨著票內插入內容而漂移。

**verify 自己那兩處 `TODO.md:127` 刻意保留**（它的第四節末與第七節 F3）。
那兩處在**描述這個缺陷本身**，改掉就看不懂 F3 在講什麼。

#### 第四族：票對票的引用（2026-09-24 第四輪新增）

掃法與前三族不同：**先抓出票內每一個 feature 編號，再逐一重讀那張票現在的 front matter。**
不看行號，看 `status`／`verdict`／`completed`／是否在 `_archive/`。
票內被引用並據以推論的 feature 共 5 張：

| 被引用的票 | 票內據以推論什麼 | 重讀 front matter | 結果 |
|---|---|---|---|
| `044` | 「前置目前不存在」「鏈條頭卡住」「三個選項」「AC-4 的第二個 Google 帳號」 | `status: complete`、`verdict: PASSED`、`score: 0.96`、`completed: 2026-09-21T18:35:02Z`、`pr: pr-merge:36`、已在 `_archive/` | ⛔ **全部過期**。已在「相依二」逐項更正，原句保留（即 H1） |
| `043` | 「整列刪除由 feature 043 在同步端擋」 | `status: design`、標題掛「待captain確認脈絡」、`source` 寫「脈絡待確認後再決定**是否進行**」 | ⛔ **那張票還沒決定要不要做**，且門檻「初步建議兩成」擋不住刪 1 列／40 列（2.5%）。已改（即 H3） |
| `040` | 「擋住 040 的合併」「040 已走到最後一道 gate」「`operations.md` 只存在於 040 的 worktree」 | `status: review`、`completed:` 空白、未合併 | ✅ **仍成立**。但它**尚未合併**這件事本身有後果——見上方「040 branch 上那三個檔的行號，釘在 commit `a51b5d9`」（即 H4） |
| `042` | Out of scope：「不處理 HTML 淨化（042）」 | `status: design` | ✅ 成立。這句只宣告**本票不做**，沒有推論 042 會做 |
| `065`／`066`／`049` | 第十節：`TODO.md` 在 main 多出的 40 行是這三張票加的 | `065` complete、`066` complete、`049` design | ✅ 成立。那是對 `git diff` 內容的歸屬描述，不是對它們狀態的推論 |

**`041` 與 `045` 在票內沒有被引用。** 票內出現的 `041` 三處：一處是 sha256 字串裡的數字（誤判），
兩處是本票自己描述 `design.md` 修訂紀錄裡有一條 041 的註記——那是對 `design.md` 內容的陳述，不是票對票的推論。

**第四族的失效模式與前三族不同，這是重點。**
前三族壞掉時，指的東西還在原地，只是行號指偏了——**讀者會發現**，因為他看到的是不相干的內容。
第四族壞掉時，**句子讀起來完全合理**：「044 的前置目前不存在」是一個通順、具體、有證據感的句子。
它沒有指向任何會露餡的位置，所以**三輪掃描與三個 reviewer 都讀過它，沒有一個人起疑**。
**唯一的檢查方式是去把那張票打開重讀一次。**

#### 數字複核：同一件事在多處出現是否一致

| 數字 | 出現在哪裡 | 結果 |
|---|---|---|
| 刪 `d3` 後受影響的列數 | 第六節「其後 N 列」／S8「那 13 列要重做」 | ⛔ 14 對 13。**已把第六節改為 13**（即 F1） |
| 24 欄 | 第三節（8＋9＋7）、第六節分段表、第七節 D2、implement Stage Report、verify 第一節 | ✅ 全部 24，且 8＋9＋7＝24 |
| 9 欄安全前綴 | 第六節（4＋5＋0）、第八節 S2 的表、verify 第一節 | ✅ 全部 9，S2 的表實際列出 4＋5＋0＝9 欄 |
| 15 欄窗口內 | 第六節（4＋4＋7）、S4、時間估算表、verify 第一節 | ✅ 全部 15，S4 實際列出 4＋4＋7＝15 欄。9＋15＝24 |
| 17 欄（票內舊值） | 第三節、第七節 D2 | ✅ 兩處皆 17，且步驟 3 的表確實算出 5＋5＋7＝17；24－17＝7 與「少算 7 欄」相符 |
| 18／21／12 欄（建完的總欄數） | 證據 1、第三節、第四節、第八節 S4、verify 第一節 | ✅ 五處一致，且 10＋8＝18、12＋9＝21、5＋7＝12 |
| 59 列 | 步驟 7 的表、第六節、時間估算表、S8 的表、verify 第三節、AC 相關敘述 | ✅ 全部 59，且 40＋15＋4＝59 |
| 89／30 列 | 第六節的表 | ✅ 42＋43＋4＝89；2＋28＋0＝30；59＋30＝89 |
| 6 段連續選取 | 時間估算表（3＋2＋1）、S8 的表、verify 第三節 | ✅ 三處一致；S8 的表列出 1＋21＋18＋2＋13＋4＝59 列、共 6 段 |
| 12／15 個保護範圍 | 第三節、第六節的表、第七節 D6、S7 的表、verify 第三節 | ✅ 全部 12／15；S7 的表實際列出 4＋4＋4＝12 個範圍 |
| 27 列草稿（`d18`–`d44`） | 第六節、implement Summary、verify 第三節 | ✅ 第 18-44 列即 27 列，與 S8「第 18-44 列也不核可」相符 |
| `review_decision` 的欄號 | 第六節 fixB3／fixB4（第 12／第 6 欄）、第八節（第 15 欄）、AC-6（新版）、verify（第 15 欄、第 18 欄起、第 6 欄起） | ✅ 差異源自排序不同，不是矛盾：建議排序 12、S2／S4 排序 15（Track 2 為 18、`site_tldr` 為 6）。AC-6 新版已明寫「不要綁欄號」並列出兩個值 |
| 540 行 | verify 第六節的 placeholder scan 範圍 | ✅ `git log --numstat 2e83adf` 為 `540 0` |
| 「三處與現況不符」 | 部署 runbook 的 ⚠️ 橫幅、第八節開頭 | ✅ 不是矛盾。「三處」指**與現況不符的三個位置**（步驟 0 指令、步驟 2 字串、步驟 3 欄位表）；D4 是估算過大、D6 是漏說明，兩者不屬於「與現況不符」。兩處橫幅的措辭一致 |

**未改動 verify 已確認的任何數字**：24／9／15 欄、59 列、12／15 個保護範圍、6 個連續段，
以及 18／21／12、40／16、89／30、27 全部原值保留。F1 改的 14→13 是 verify 自己提的更正。

#### 未越界

- **正式 Google 試算表零寫入，本輪連讀取都沒有。** 沒有 HTTP 請求送到試算表。
- 未執行 `npm run sync-content`。main 的同步跑了兩次，兩次都在暫存沙箱、餵本機 fixture：
  一次驗 F2 的錯誤字串（exit 1），一次驗 S3 新增的 `diff` 指令指對地方（exit 0，
  兩個 JSON 確實寫進 `$SANDBOX/src/data/`，沒有碰 repo）。
- `src/data/*.json` 逐位元組未變，sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。
- 未改動任何 acceptance criteria 的**要求文字**。
- 未動 040 的 worktree（只以 `git show main:` 與唯讀 `sed` 取內容）。
- 判定中文字串時未使用 `sort`／`uniq`；欄名與訊息比對一律用 `grep -o … | wc -l` 或 Python 的字串計數。

### 十、G1-G3 的處置與 S3 前置的實測（2026-09-24 第三輪）

verify 第二輪判 **PASSED**，並提出 G1-G4。FO 授權 **G1／G2／G3 fix**；
**G4 由 FO 自己補**（`### Feedback Cycles` 的 Cycle 行是 FO 負責的記錄，worker 不代寫）。
本輪**對正式試算表零寫入、零讀取**：所需標題第一節已逐字記載，重跑只需本機 fixture。
`src/data/*.json` 零改動。diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。

#### G3：S3 的分辨表加了兩項機器可判的前置

**問題**：原表第 1 列的前兩個條件（main exit 0、`diff` 落在那 59 列之內）
**誤刪一列已核可的列也會同時滿足**。擋住它的只有第三個條件「編輯台確認是有人正常填稿」，
那是人工判斷。若有人把 `diff` 位置當成充分條件就會重量 baseline，
**把掉掉的那一列一起烤進新基準，之後 AC-1 反而會通過。**

**修法**：第 1 列再加**檢查①筆數**（`（40 筆）`／`（16 筆，含 tldr）`）
與**檢查②id 清單**（AC-3 的比對指令提前跑一次，兩行都要 `✅ id 清單一致`）。
另加一列專門處理「檢查①或②沒通過」，明寫**絕對不要重量 baseline**。

**兩個方向都驗過。** 手法：用第一節記載的真實標題造一個階段一完成後的本機 fixture
（Track 1 十四欄、Track 2 十七欄、`site_tldr` 五欄，即 S1／S2 做完的狀態），
內容列是合成的，但**列數與已核可數刻意造成與正式表相同**——
42／43／4 列資料、40／15／4 列 `Approved`，所以 main 印出的筆數就是 `（40 筆）` 與 `（16 筆，含 tldr）`。
main 的同步取自 `git show main:scripts/sync-content.mjs`，在 `mktemp -d` 沙箱執行。
baseline ＝ 未改動的那份 fixture 的輸出。

| 情境 | 做了什麼 | main | 筆數 | AC-3 id 比對 | sha256 | 舊前置 | **新前置** |
|---|---|---|---|---|---|---|---|
| **A** | 編輯合法填 `chapter`（`h1`） | exit 0 | 40／16 ✅ | ✅ 一致 | history 變 | 放行 | **放行** ✅ |
| **A2** | 編輯合法填 `owl_depth_comment`（`d1`） | exit 0 | 40／16 ✅ | ✅ 一致 | discussions 變 | 放行 | **放行** ✅ |
| **B** | 誤刪一列已核可的 `h1` | exit 0 | **39**／16 ⛔ | ⛔ `少了:["h1"]` | history 變 | **放行（誤判）** | **擋住** ✅ |
| **B2** | 誤刪一列已核可的 `d1` | exit 0 | 40／**15** ⛔ | ⛔ `少了:["d1"]` | discussions 變 | **放行（誤判）** | **擋住** ✅ |
| **B3** | 刪掉 `h1`、同時新增一列已核可的 `h99` | exit 0 | 40／16 ✅ | ⛔ `少了:["h1"] 多了:["h99"]` | history 變 | **放行（誤判）** | **擋住** ✅ |

四項結論：

1. **(a) 方向成立**：B／B2／B3 三種掉列情形，新前置全部擋住。
   verify 實測的情境 B 我獨立重現，**筆數逐字印出 `（39 筆）`、id 比對逐字印出 `⛔ 少了:["h1"]`**。
2. **(b) 方向成立**：A／A2 兩種編輯合法填值，新前置**全部放行**。
   加了前置之後仍然走得到「重新量 baseline」那一格，**不是把誤判的路換成永遠停住的路。**
3. **舊前置在五個情境下全部放行**——包含三種掉列。這證實 G3 的前提：
   光看 exit code 與 `diff` 位置，**誤刪與合法填值長得一樣**。
4. **兩項檢查缺一不可。** 情境 B3（刪一列又補一列）筆數仍是 40，只有 id 比對抓得到。
   所以表裡寫的是「檢查①**與**②都通過」。

**沒有碰 AC-1 或 AC-2 的條文。** 修改全部落在 S3。
檢查②用的是 AC-3 的指令原樣提前跑，只把 `OUT` 指到沙箱，判準沒有另立一套。

#### G1：P3-7 的行號——這不是錯的行號，是錯的記法

verify 說 P3-7 在第 905 行、第 865 行是 P3-4 的 `opposing_views`。**這在 main 上完全正確。**
但我實讀本 worktree 得到的是 **865**。兩邊都不是筆誤：

| checkout | `TODO.md` 行數 | P3-7 的行號 |
|---|---|---|
| main（`main` 分支） | 1046 | **905** |
| 本 worktree（`spacedock-ensign/050-…`） | 1006 | **865** |

`git diff` 兩個 blob：**main 多 40 行，插在第 596-635 行**（features 065／066／049 加的兩筆 P1-9）。
第 596 行之前兩邊逐字相同，之後一律差 40 行。
`905 － 865 ＝ 40`，與插入行數相符。

**所以「`TODO.md:行號`」這種引用在本票沒有唯一答案。**
這比「行號寫錯」嚴重一級：它不是查一次就能修好的，它會隨著讀者站在哪個 checkout 而改變。

**處置**：第九節那一列改為名稱引用，並把這個成因寫進該列。
**同時把票內最後一處 `TODO.md:行號` 也改掉**——步驟 3 的表與第三節原本寫 `TODO.md:156`
（cycle 2 對 F3 的修正），改為 `TODO.md` 的 P1-5「附帶問題已解決」。
`:156` 目前在兩個 checkout 都正確（因為差異從第 596 行才開始），
**但那是運氣，不是保證**：只要有人在 main 的第 156 行之前插入內容，它就會失準。

**另外查了票內其他被引用的檔在兩個 checkout 是否相同。**
`editor-onboarding.md`、`2026-08-31-content-pipeline.md`、`design.md`、
`040-approval-content-version-binding.md`、`AGENTS.md`、`CLAUDE.md`、`scripts/sync-content.mjs`
**七個檔兩邊都是同一個 blob**，所以那些行號無歧義，本輪不動它們。
`approval-workflow.gs` 與 `operations.md` 只存在於 040 的 worktree，票內已註明。

#### G2：把掃描的邊界寫進票內，並把範圍擴到第二族

verify 確認「掃描當下的 `檔名:行號` 一處都沒漏」，要修的不是結果而是**清單沒有寫明自己的涵蓋面**。
第九節的表頭已補上三條邊界（快照時點／只掃一族／行號的 checkout 前提），
並補進 5 列。其中 4 列實讀通過：

| 補進來的引用 | 結果 |
|---|---|
| main `sync-content.mjs:294` | ✅ `addError` 樣板逐字相符。**它是 cycle 2 自己為 F2 新增的引用，加在該輪掃描之後** |
| `AGENTS.md` 第 1 條 | ✅ 第 12 行 `### 1. 不要自己執行內容同步` |
| `design.md` 第二節的欄位表 | ✅ 第二節內三個分頁各有欄位表 |
| `design.md` 第五節施工順序表 | ✅ `## 五、更新流程與施工順序` 內有 `### 施工順序` 表 |

**第 5 列是本輪新查出的錯，而且它比 G1 嚴重：引錯的是檔名。**

票內兩處（`## 已知的工作內容` 第 3 點、步驟 7）寫
「`design.md` 明訂舊列不能批次補造指紋」「`design.md` 禁止的是批次補造指紋」。
**`design.md` 沒有這一條。** 全檔 `grep 補造` 零命中；`指紋` 只出現 5 次，
全在修訂紀錄與一條 041 的實測註記裡，沒有任何禁令。

該規則實際在三個地方：

| 出處 | 原句 |
|---|---|
| `editor-onboarding.md:432-433` | 「另外舊列不能批次補造指紋。／部署新欄位後既有的 `Approved` 會全部先顯示 `Needs review`，需要編輯台重新核可一輪。」 |
| `040-approval-content-version-binding.md:173` | 「舊列不能批次補造指紋。部署新欄位後，既有 `Approved` 全部先顯示 `Needs review`。編輯台重新核可後才能同步。」 |
| 040 worktree 的 `operations.md:13` | 「不要批次替舊列補造指紋。部署後要逐列重新核可。」 |

**票內那句的措辭與 `editor-onboarding.md:432-433` 逐字最接近**，所以兩處都改指它。
步驟 7 另外把「手動貼上或用公式填 `approved_fingerprint`」標明為**本票的舉例，不是原文**。

**實質規則沒有變，captain 要做的事一個字都沒變**——舊列仍然不能批次補造指紋，
仍然要逐列重新核可。改的只是「這條規則寫在哪裡」。
這一筆是靠 G2 擴大範圍才浮出來的：`design.md` 的兩處引用**不帶行號也不帶節號**，
所以它們既不在 `檔名:行號` 一族、也不在 `檔名 第 N 節` 一族，兩輪掃描都掃不到。
**第三族是「只寫檔名、不寫位置」的引用**，本表已把這兩處納入。

#### 錨點不等於修好：採納 verify 的評價

verify 判定 cycle 2 補章節錨點是「**部分改善不是修好**」。**這個評價是對的，我採納。**

- 行號 45／53 **仍然寫在文字裡**。上方一插入內容，那兩個數字就再次失準。
- 錨點買到的是「**可復原**」——讀者發現行號不對時，還有辦法找到那句話。
- 它買不到「**不漂移**」。要不漂移，行號就不能留。

**判斷：那兩處自我引用的行號，拿掉。只留錨點。** 四個理由：

1. **自我引用是最會漂移的一種。** 本票每一輪都在後面追加章節；
   cycle 2 光是插入第九節就把 `## 相依關係釐清` 以下全部往下推了 100 多行。
   對同一份文件的行號引用，等於保證會失準。
2. **錨點已經夠精確。** `## 相依關係` 的第二個項目符號、`## Risk evidence` 的首句，
   兩者各自只對應一句話。加上行號**沒有增加任何精確度**。
3. **票內已有正確示範。** 三處 P3-7 都以名稱引用、不帶行號，
   所以 G1 那個錯行號**沒有打壞任何一處載重引用**——這正是名稱引用的價值。
4. **G1 又補了一個更強的理由。** 行號在兩個 checkout 可以有兩個合法答案，
   名稱引用不會。

**沒有一併拿掉的是跨檔引用的行號**，理由要說清楚，因為這是不對稱的處置：
那些檔（七個）在兩個 checkout 是同一個 blob，而且本票不會去改它們——
它們的行號本輪已全部實讀通過，**留著行號比只寫章節名好查**。
`TODO.md` 是唯一的例外，已改為名稱引用。
**判準是「這個檔會不會在我引用它之後變動」**，不是「行號一律不好」。

#### 未越界

- **正式 Google 試算表零寫入、零讀取。** 本輪沒有發出任何 HTTP 請求到試算表。
  fixture 的標題取自第一節已逐字記載的實測標題；內容列是合成的。
- 未執行 `npm run sync-content`。main 的同步跑了七次（baseline 兩次與五個情境各一次），
  七次都在 `mktemp -d` 沙箱、餵本機 fixture，輸出寫進沙箱自己的 `src/data/`。
- `src/data/*.json` 逐位元組未變，sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。
- **AC 的要求文字一字未動。** G3 的修改全部落在 S3，未碰 AC-1、AC-2、AC-3 的條文。
- **承重數字原值保留**：24／9／15 欄、59 列、12／15 個保護範圍、6 個連續段。
  **S7 與 S8 兩個區塊逐字未動。**
- `src/`、`scripts/` 零變動。未動 040 的 worktree（只以 `git show`、唯讀 `sed`／`grep` 取內容）。
- **未代 FO 補寫 `### Feedback Cycles`**，也未改動 FO 已寫的 Cycle 1 那一行。
- 判定中文字串未使用 `sort`／`uniq`；計數用 Python 字串計數與 `grep -c`。未使用 `awk` 做任何判斷。

### 十一、H1-H4 的處置（2026-09-24 第四輪）

verify 第三輪判 **PASSED**，並提出 H1-H4。FO 授權四筆全部 fix，
但 **H1 只做事實更新——🔴 裁決本身由 FO 直接送 captain，worker 不解、也不代 captain 確認。**
本輪**對正式試算表零寫入、零讀取**。`src/data/*.json` 零改動。
diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。

| finding | 分類 | 改了哪裡 |
|---|---|---|
| **H1** | 事實更新 | 「相依二」加 044 的 front matter 更正、重寫三個選項、寫明 `operations.md:12` 與 AC-4 前置已過期、寫明還開著的只剩 040 Out of scope 後半句；步驟 4 的前置、design stage 的 Out of scope、Documentation impact 的 044 那一列一併更正 |
| **H2** | 方法 | 第九節補**第四族**（票對票的引用）與其檢查方式、失效模式，並新增一小節列出全票 5 張被引用票的重讀結果 |
| **H3** | Polish | 「整列刪除」那句加 ⚠️ 更正，說明 043 尚未定案且門檻擋不住單列誤刪，防線是 S3 的檢查①② |
| **H4** | Polish | 「相依一」新增一小節，把 040 branch 上三個檔的行號釘在 commit `a51b5d9` |

#### H1 沒有做的事

- **沒有解 🔴。** 三個選項仍然列在票內，仍然標著需要 captain 裁決。
- **沒有代 captain 確認 040 Out of scope 的後半句。** 票內明寫那一半仍在 captain 手上。
- **沒有動 `## Acceptance criteria` 一個字。** AC-4 的資源前置已過期這件事，
  寫在「相依二」而不是寫進 AC-4——本輪該區塊逐位元組未動。

#### H4 沒有照抄 044 的 commit，理由在這裡

FO 的提示是「044 把 `.gs` 釘到 `093cd01`，比照辦理」。**照抄會出錯。** 實查：

| 檔 | `093cd01` | `a51b5d9`（040 目前 HEAD，也是本票實讀的版本） |
|---|---|---|
| `approval-workflow.gs` | `cd380aee1071…`、263 行 | **相同** |
| `operations.md` | `a01a0d47237e…`、79 行 | **相同** |
| `sync-content.mjs` | `c2a8b978ade6…`、**807 行** | `7e9ab0587035…`、**824 行** |

`.gs` 與 `operations.md` 兩個 commit 是同一份位元組，所以兩份記錄互相印證。
**但 `sync-content.mjs` 不同**：在 `093cd01`，`publishedRowSequences` **根本不存在**，
第 392 行是另一條敘述。**本票的 `sync-content.mjs:392` 只在 `a51b5d9` 成立**，
所以三個檔一律釘 `a51b5d9`。

**這件事本身就是 H4 的證據**：040 尚未合併，它的檔案在兩個 commit 之間真的動了 17 行。

#### 未越界

- **正式 Google 試算表零寫入、零讀取。** 本輪沒有發出任何 HTTP 請求，也沒有跑任何同步。
- 未執行 `npm run sync-content`。`src/data/*.json` 逐位元組未變，
  sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。
- **`## Acceptance criteria` 整段逐位元組未動**，AC 的要求文字一字未改。
- **承重數字原值保留**：24／9／15 欄、59 列、12／15 個保護範圍、6 個連續段。
  **S7 與 S8 兩個區塊逐位元組未動。**
- **`### Feedback Cycles` 逐位元組未動，`- Cycle` 行數維持 1。** 未代 FO 補寫。
- `src/`、`scripts/` 零變動。未動 040 的 worktree（只以 `git show` 唯讀取出內容，
  該 worktree 的 `git status` 全程為空、HEAD 仍為 `a51b5d9`）。
- 判定中文字串未使用 `sort`／`uniq`；計數用 Python 與 `grep -c`。未使用 `awk`。

### 十二、J1-J2 的處置（2026-09-24 第五輪，收斂輪）

verify 第四輪判 **PASSED**，並提出 J1／J2，兩筆都是 Polish。
**FO 指定本輪為收斂輪：把這兩筆做乾淨，不開新的掃描維度。** 本節只記這兩筆。
本輪**對正式試算表零寫入、零讀取**，`src/data/*.json` 零改動。
diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。

#### J1：三處「另一張票／後續票／另議」指向的票都不存在

**沒有開新票。開不開票是 captain 的範圍決定。本輪做的是讓缺口可見。**
三處都改成明白話，原句一律保留：

| 位置 | 改成什麼 |
|---|---|
| 步驟 1 的說明框 | 「廢除 `chapter` 目前尚無 feature 票，負責人未定」，並指向它唯一的落腳處 `TODO.md` 的 **P3-7**（以名稱引用，不寫行號）。另寫明**本票反而讓它更難處理**——本票新建的空白 `chapter` 欄從此有技術用途，廢除它要連 `approval-workflow.gs` 一起改 |
| design stage 的 Out of scope | 「這個落差目前尚無票，負責人未定」，並寫明原句「要記成後續票」本身是一個沒有被執行的指令。補上 promote-to-material 條件與「現況不壞」的實測依據（見下） |
| Out of scope | 「整列刪除的保護目前尚無票，負責人未定」，並寫明**它不是 `043`** |

**查證方式**：讀 `docs/constitution-features/` 下全部 66 張票的 `title` 與 `status`（含 `_archive/`）。
沒有任何一張票的題目涵蓋這三件事。

#### J1 第二處：現況不壞，風險在之後

這一項與另外兩項不同，因為**它的觸發條件正是 captain 現在在做的事**——輸入含中文說明的標題。
所以票內同時寫了兩件事，避免讀者只讀到一半：

- **現在是安全的。** 第三節與第四節已實測：照票內建議輸入的 18／21／12 個標題字串
  **同時通過 `resolveApprovalHeaders_` 與 040 新版同步**，輸出與純欄名版本逐字相同（證據 4 亦同）。
- **升級為 Material 的條件：有人在部署後改動三個分頁上任何一個標題字串。**
  `approval-workflow.gs` 沒有別名表而 `sync-content.mjs` 有，兩支程式容忍度不同；
  屆時 Apps Script 可能無聲失效，而同步程式仍然通過，**兩邊不會互相提醒**。

#### J1 第三處：順帶更正一個綁在一起的說法

Out of scope 原句是「不處理標題列**與**整列刪除的保護範圍（另議）」，把兩件事綁在一起。
**但本票只擱下其中一件**：標題列的保護本票**有做**（步驟 6 的 C 類、
S7 的 `A1:R1`／`A1:U1`／`A1:L1`、AC-5），沒做的是整列刪除的保護。
所以「尚無票、負責人未定」只適用於整列刪除那一半。**原句保留，更正寫在下方的 ⚠️ 框。**

`043` 補不上這一格的理由也寫進票內：**`043` 是同步端偵測，這裡缺的是試算表端預防**，
時機與機制都不同；而且 043 自己 `status: design`、尚未決定是否進行。
本票目前對誤刪的替代防線是 S3 的檢查①②與 S9——**那是偵測不是預防**，
抓到的時候列已經不見了，要靠 Google 試算表的版本記錄救回。

#### J2：`## Risk evidence` 補一句 spike 的進度

該節首句說 spike 的**形式**是 044，**那句話沒有錯，所以原句不動**。
問題是該節要回答「風險現在如何」，而讀者在那裡讀不到 spike 已經做完。
首句下方加一則引言：**該 spike 已由 feature 044 於 2026-09-21 完成並 PASSED**
（`score: 0.96`，已歸檔），詳見相依二；並點明原句講的是形式不是進度。

**verify 判定不該改的兩處維持原狀**：`## Problem` 的「feature 044 只做隔離測試表的 probe，
不碰正式表」仍為真；`## 相依關係` 的「兩者不互為前置」下方已有 ⚠️ 更正塊。**兩處逐位元組未動。**

#### 本輪沒有做的事

- **沒有開新票。**
- **沒有解 🔴，沒有代 captain 確認** 040 Out of scope 的後半句。
- **沒有開新的掃描維度。** 查全部票的 `title`／`status` 是為了確認 J1 三處的事實，
  不是第六族掃描。
- **沒有動** `## Acceptance criteria`、S3、S7、S8、`### Feedback Cycles`、verify 第四輪整段。

#### 未越界

- **正式 Google 試算表零寫入、零讀取。** 本輪未發出任何 HTTP 請求，未跑任何同步。
- 未執行 `npm run sync-content`。`src/data/*.json` 逐位元組未變，
  sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`。
- **`## Acceptance criteria` 整段、S3、S7、S8 四個區塊逐位元組未動。**
  承重數字 24／9／15 欄、59 列、12／15 個保護範圍、6 個連續段原值保留。
- **`### Feedback Cycles` 逐位元組未動，`- Cycle` 行數維持 1。**
- `src/`、`scripts/` 零變動。040 worktree 未動，`git status` 為空、HEAD 仍為 `a51b5d9`。
- 判定中文字串未使用 `sort`／`uniq`；未使用 `awk`。

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

#### 040 branch 上那三個檔的行號，釘在 commit `a51b5d9`

票內對 `approval-workflow.gs`（9 處）、`operations.md`（3 處）、
040 版 `scripts/sync-content.mjs`（2 處）的行號引用，**全部以這個 commit 為準**：

| 檔 | commit | sha256 | 行數 |
|---|---|---|---|
| `scripts/apps-script/approval-workflow.gs` | `a51b5d90b025bf8bd0d035f9dea991e713660a17` | `cd380aee1071…` | 263 |
| `docs/content-pipeline/operations.md` | 同上 | `a01a0d47237e…` | 79 |
| `scripts/sync-content.mjs`（040 版） | 同上 | `7e9ab0587035…` | 824 |

**為什麼要釘**：這三個檔**不在 main**，只活在 feature 040 的 branch，
而 040 目前 `status: review`、`completed:` 空白、**尚未合併**。
review 若要求改動，行號就會移動——這正是「會在我引用它之後變動」的典型。
取出方式：`git -C <040 worktree> show a51b5d9:<path>`。

**`approval-workflow.gs` 與 `operations.md` 在 `a51b5d9` 與 feature 044 釘的 `093cd01`
是同一份位元組**（sha256 與行數皆同），所以兩份記錄互相印證。
**但 `sync-content.mjs` 兩個 commit 不同**：`093cd01` 是 807 行且**沒有 `publishedRowSequences`**，
`a51b5d9` 是 824 行、該函式在第 392 行。**本票的 `:392` 只在 `a51b5d9` 成立**，
所以本票釘 `a51b5d9`，不是照抄 044 的 `093cd01`。
（`APPROVAL_COLUMNS` 的 `:84-93` 兩個 commit 都成立。）

**main 版 `scripts/sync-content.mjs` 的行號另計**（第 94、97-99、112、113、116、117-119、
123-129、294 行），以 `main` ＝ `49e875c` 為準，blob sha256 `ff30b8bda476…`、729 行。
**它會因為本票步驟 9 合併 040 而整份換掉**，屆時這些行號全部失效——
那是預期的，因為合併後就該改讀 040 的新版。

### 相依二：票內自相矛盾——044 到底是不是前置

**矛盾確認**。本票 `## 相依關係` 的第二個項目符號寫
「044 的結果可降低本票的風險，但兩者不互為前置」；
`## Risk evidence` 的首句寫「spike 的形式是在隔離測試表上先跑一次（即 feature 044）」。
既然 `no spike needed` 不成立、而 spike 就是 044，044 就是前置。兩句不能同時成立。

**我的判定：`## 相依關係` 第二個項目符號錯，044 是步驟 4 起的硬前置。三項外部證據都指向同一邊：**

1. `docs/content-pipeline/operations.md:12`（040 worktree）：
   「兩帳號隔離 probe 完成前，不要把 Apps Script 套到正式 SSOT。」
2. feature 040 的 Out of scope（`040-approval-content-version-binding.md:290`）：
   「不上線正式 SSOT 設定，**直到隔離測試表完成驗證並由 captain 確認**。」
3. 本票 AC-3（非核可者不能編輯審核欄位）與 044 的第二個待驗證命題**是同一件事**。
   差別只在：044 在可丟棄的測試表上做，本票在 40 筆已上線內容的唯一來源上做。

**但這個判定會造成僵局，所以需要 captain 裁決。**

044 的前置是「一份隔離測試表 + 兩個 Google 帳號」，這兩項卡在人不卡在程式，目前不存在。
若照判定執行，鏈條是：`兩個帳號 → 044 → 050 → 040 合併`，而鏈條頭卡住。

> ⚠️ **2026-09-24 事實更正：上面兩句在 2026-09-07 寫下時成立，現在都已經不成立。原句保留。**
>
> **feature 044 已經做完了。** 重讀它的 front matter：
>
> | 欄位 | 值 |
> |---|---|
> | `status` | `complete` |
> | `verdict` | `PASSED` |
> | `score` | `0.96` |
> | `completed` | `2026-09-21T18:35:02Z` |
> | `pr` | `pr-merge:36` |
> | 位置 | `docs/constitution-features/_archive/044-approval-permission-two-account-probe.md` |
>
> 歸檔 commit `66ed939`，且**它是本 branch HEAD 的祖先**——
> 換句話說，這個事實在本票這條 branch 上早就看得到，只是沒有人重讀。
>
> **所以「前置目前不存在」與「鏈條頭卡住」兩句都已過期。**
> 隔離測試表與第二個 Google 帳號都已經備妥並用過，鏈條頭沒有卡住。

**🔴 需要 captain 裁決（worker 不自行決定）。三個選項——下表已依 044 的完成狀態重寫：**

| 選項 | 做什麼 | 代價 | 不可逆？ |
|---|---|---|---|
| **A（建議）** | 先跑 044，再做本票 | **已完成，無額外代價。** 044 於 2026-09-21 完成並 PASSED，這個選項要付的成本已經付掉了 | 可逆 |
| **B** | 明文豁免 `operations.md:12` 與 040 Out of scope 的但書，直接在正式表部署 | **前提已消失。** 這個選項的唯一好處是「省下等 044 的時間」，而 044 已經做完，沒有時間可省 | **部分不可逆**（見下） |
| **C** | 拆分：步驟 1-3（建欄）不需 044，先做；步驟 4 起等 044 | **前提已消失。** 沒有東西要等 | **不建議**——證據 2 證明窗口從建欄就開始 |

> ⚠️ **原始的三個選項措辭保留於此，供追溯**（2026-09-07 design stage 寫，當時 044 尚未開始）：
> A 的代價原寫「040 合併再延一輪。要多開一個帳號」；
> B 的代價原寫「若權限設定有誤，錯誤發生在 40 筆已上線內容的唯一來源上」；
> C 的代價原寫「產線停擺窗口被拉長成不確定時間」。
>
> **B 的原始代價敘述仍然成立，而它的好處已經歸零。**
> 票內自己把 B 標為「部分不可逆」，錯誤會發生在 40 筆已上線內容的唯一來源上。
> **選 B 等於拿那 40 筆去換一個已經不用付的成本。**

**`operations.md:12` 的保護邊界，觸發條件已經滿足。** 該句是
「兩帳號隔離 probe 完成前，不要把 Apps Script 套到正式 SSOT」——
probe 完成了（044，2026-09-21，PASSED），所以這句話**不再擋住本票**。

**AC-4 的資源前置也已經過期。** AC-4 的 `前置` 寫「需要第二個 Google 帳號。
這與 044 的資源前置是同一個」——那個帳號在 044 已經取得並使用過。
**AC-4 的要求本身不變，仍然必須做**（在正式表上以非核可者身分測三次），
只是它不再卡在「有沒有第二個帳號」。
**本票不編輯 `## Acceptance criteria` 任何一個字**，這段說明寫在這裡。

**真正還開著的是什麼。** feature 040 的 Out of scope（`040-approval-content-version-binding.md:290`）
寫的是「不上線正式 SSOT 設定，**直到隔離測試表完成驗證並由 captain 確認**」——**這是兩個條件**：

| 條件 | 狀態 |
|---|---|
| 隔離測試表完成驗證 | ✅ **已滿足**（044，2026-09-21，PASSED，score 0.96） |
| 並由 captain 確認 | 🔴 **仍在 captain 手上。worker 不代為確認。** |

**所以 🔴 沒有消失，只是縮小了。** 原本要裁決的是「要不要為了 044 而延期」，
現在那一半沒有了；剩下的是 040 Out of scope 後半句的那一次確認。
**本輪只做事實更新，不解這個 🔴，也不代 captain 確認。**

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
  node --env-file="$REPO/.env.local" "$SANDBOX/scripts/sync-content.mjs" > "$SANDBOX/out.txt" 2>&1
  echo "exit=$?"   # 必須是 1
  grep '對不到任何預期欄位' "$SANDBOX/out.txt" | grep -q 'review_decision' \
    && echo "✅ 出現預期的標題錯誤（窗口確實打開）" \
    || echo "⛔ 沒有出現預期的標題錯誤"
  ```
  必須 exit 1 並輸出一行指出 `review_decision` 這一欄對不到任何預期欄位。
  **怎麼認出那一行**：同一行同時含 `對不到任何預期欄位` 與 `review_decision` 兩個子串，即成立。
  上面的 `grep` 就是這個判準。
  **不要逐字比對引號內的內容，也不要綁欄號。** 照第三節的建議標題建欄後，程式實印的是
  `第 15 欄的標題「review_decision （由 Review 選單寫入）」對不到任何預期欄位。檢查是否打錯字。`
  ——引號內含中文說明，所以 `grep '「review_decision」'` 會找不到；
  欄號則依實際建欄順序而變（S2／S4 的分階段順序為第 15 欄，第三節「建議排序」為第 12 欄）。
  這是**預期行為**，不是 bug。合併 040 之後再跑一次（此時 main 的程式已是新版），必須 exit 0。
- **會怎麼失敗**：若這一步 exit 0，代表八個欄位沒有真的建進正式表，前面所有步驟都沒生效。
- **這個 sandbox 手法 design stage 已實測**：以本機 fixture 餵入四個部署階段的 CSV，
  main 版程式在階段 A exit 0、階段 B/C/D 全部 exit 1。
  那一輪的 fixture 用**純欄名**當標題，所以印出的是 `「review_decision」`（引號內沒有中文說明）。
  改用含中文說明的真實標題後，引號內就多了說明字串——這正是上面那個 `grep` 判準要吸收的差異。
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
| ~~`docs/constitution-features/044-…md`~~ | ~~依 captain 裁決結果，在 044 的相依關係註明它是否為 050 的前置~~ | **已無法執行。** 044 於 2026-09-21 完成並歸檔到 `_archive/`，而 `docs/_archive/` 依 `AGENTS.md` 的文件規範不動。本票與 044 的關係改記在本票的「相依關係釐清」相依二 |

### 不更新

| 文件 | 為什麼 |
|---|---|
| `AGENTS.md` | 本票不改變任何 agent 的行為約束。「不要自己執行內容同步」在部署後依然成立 |
| `docs/content-pipeline/data-collection-guide.md` | 它寫的是內容怎麼蒐集，與審核欄位無關 |
| `docs/project/` 全部 | 架構與技術選型不變 |
| `docs/_archive/` | 依規定不動 |
| `scripts/` 下任何程式 | 本票是純部署票。程式在 040，已完成 |

### Feedback Cycles

- Cycle 1: PASSED-with-findings — verify gate（verify cycle 1 判 PASSED 並提 F1–F4，FO 依 `## Review-finding disposition` 授權四筆全部 fix，未經 captain 裁決即修——四筆皆不改 AC 要求，F2 屬 captain 2026-09-24 的一次性 `Verified by:` 授權範圍）；surface 1 檔（本票）；**AC-1 至 AC-5 逐字未動**，AC-6 僅 `Verified by:` 與一句必要連帶修正（原寫「錯誤訊息與上面逐字相同」，在 AC-6 改寫後已成假，已揭露）；**正式試算表零寫入、零存取**（沿用 cycle 1 的快照）；`src/`／`scripts/` 零變動、`src/data/*.json` 在 main／本票 HEAD／工作區三者 sha256 相同、未跑 `sync-content`、未動 040 worktree。**F2 fix（Material，最優先——它發生在產線全停窗口內）**：AC-6 原要求工程逐字看到 `第 N 欄的標題「review_decision」對不到任何預期欄位。`，但照票用含中文說明的標題建欄後程式實印 `「review_decision （由 Review 選單寫入）」`，**引號內多了說明，逐字比對找不到**；改為判「同一行同時含 `對不到任何預期欄位` 與 `review_decision` 兩個子串」且不綁欄號。implement 另查出訊息實際結尾還有 `檢查是否打錯字。`（main `sync-content.mjs:294` 的 `addError` 樣板），票內原本連這句都沒寫。**verify cycle 2 親手跑了關鍵的否證格**：把一份**沒有標題錯誤的合法 fixture** 輸出餵進新判準，**新判準同樣判失敗**——它不是被放寬成恆真；另自加一格（抓取失敗類錯誤同樣 exit 1 但印 ⛔）證明兩個條件合起來才判得準。**F4 fix（Deferred risk）**：D4 把部署由「單一 2 小時窗口」改成「階段一可分次 ＋ 階段二窗口」，而階段一要 captain 先建三個**編輯台可寫**的內容欄（`chapter`／`owl_depth_comment`／`full_content`），保護範圍要到階段二 S7 才設；實測填入非空值 main **仍 exit 0**、只有 sha256 變，**沒有任何程式會擋**。S2 補「三欄在 S9 完成前必須全欄留白」，S3 補兩個 `diff` 指令、一張二分判定表與 re-baseline 條文，並寫明**重量 baseline 不等於放寬 AC-1**（判準不變，變的只是基準的量測時點）。**F4 的修改全部落在 S2／S3，未碰 AC-1 條文**（verify 以逐區塊 diff 確認）。**F1 fix（Polish）**第六節「其後 14 列」改 **13**（與同文件 S8 一致；`d3` 占序號 3，其後 `Approved` 為第 5-17 列）。**F3 fix（Polish）**`TODO.md:127` 改 **156**（127 為空行）。**掃同類的收穫大於被點名的兩筆**：implement 把引用檢查由 verify 掃的 8 處擴到**全票 31 處**，另查出**三處同類**——`editor-onboarding.md:430`（出現 4 次，該句實在 **434**）、`040-….md:221`（實在 **290**）、本票自我引用「第 50 行」（實為 **53**）；四處全修，兩處自我引用另補章節錨點。數字方面對每組附加總驗算（`24＝8＋9＋7`、`59＝40＋15＋4`、六段 `1＋21＋18＋2＋13＋4＝59` 等），**verify 已確認的 24／9／15／59／12／6 全部原值保留，S7 與 S8 整個區塊逐字未動**。verify cycle 2 判 **PASSED**，四筆修正「全部是真的修正，沒有一筆看起來修了其實沒修」，另提 G1–G4（見 Cycle 2）。**本輪未經 `gate record --round` 記錄**（captain 既有授權：跳過 round record、直接重跑；本票 `gates:` 於本輪尚未建立 verify 階段指標可綁定的 round room）。三項未結項原樣留存：步驟 1–7 為 captain 手動、AC-2 的實際同步需在部署後跑、040 的合併為步驟 9。
- Cycle 2: PASSED-with-findings — verify cycle 1 判 PASSED 後 FO 授權的第二輪（G1／G2／G3 fix，G4 為 FO 自有並由 FO 補寫）；surface 1 檔；**正式試算表零寫入零讀取**；AC 整段與承重數字 24／9／15／59／12／6 未動。**G3（最要緊，captain 的下一關就是 S3）**：S3 的二分判定表前兩個條件（main exit 0、`diff` 落在那 59 列之內）**誤刪一列已核可的列也會同時滿足**，擋住它的只有第三個人工條件；若有人把 diff 位置當充分條件而重量 baseline，**會把掉掉的那一列烤進新基準、AC-1 之後反而會通過**，最壞情況是少一筆內容靜默上線。修法加兩項機器可判前置（筆數仍為 40／16、AC-3 的 id 比對仍一致）；**五情境實測兩個方向都成立**——誤刪 `h1`／`d1` 擋住、編輯合法填 `chapter`／`owl_depth_comment` 放行（**不是把會誤判的路換成永遠停住的路**）、而**舊前置在五個情境全部放行、含三種掉列**。否證格 **B3（刪 `h1` 又補一列已核可的 `h99`）筆數仍是 40、只有 id 比對開火**，證明兩項檢查缺一不可。**G1 的更正方向是反的，verify 主動認錯**：`TODO.md` 在 main 與本 branch 是兩個 blob（1046 對 1006 行，差異為插在第 596 行起的 40 行），P3-7 在 main 是 905、在 worktree 是 865，**差值正好等於插入行數**——所以「`TODO.md:行號`」在本票**沒有唯一答案**，處置不是改行號而是改**名稱引用**；票內最後一處 `:156` 也一併改掉，理由是「目前兩邊都對，但那是因為差異從第 596 行才開始，**是運氣不是保證**」。**G2 擴大範圍後查出的比原 finding 嚴重：引錯的是檔名**——票內兩處寫「`design.md` 明訂舊列不能批次補造指紋」，而 `design.md` 全檔 `補造`／`批次` 皆零命中，該規則實際在 `editor-onboarding.md:432-433`；這兩處**不帶行號也不帶節號**，故既不在第一族也不在第二族，**第三族是「只寫檔名、不寫位置」的引用**。錨點的判斷題依 verify 評價定案：補章節錨點是**部分改善不是修好**（**錨點買到的是「可復原」而非「不漂移」**），自我引用的行號拿掉只留錨點；跨檔行號保留，判準為**「這個檔會不會在我引用它之後變動」**而非「行號一律不好」。
- Cycle 3: PASSED-with-findings — 第三輪（H1／H2／H3／H4 fix）；surface 1 檔；**正式試算表零寫入零讀取**；AC 整段與 **S3／S7／S8** 逐位元組未動。**H1（Material，本輪最要緊，captain 正在部署）：feature `044` 早在 2026-09-21 就 `complete`／`PASSED`／`score 0.96`／`pr-merge:36`／已歸檔 `_archive/`，而票內仍寫「044 的前置…目前不存在」「鏈條頭卡住」。****三個 🔴 選項因此全部失真**——A（建議）的代價「040 合併再延一輪、要多開一個帳號」**已經付掉**；B（豁免 probe 但書、直接在正式表部署）票內自標「**部分不可逆**」「錯誤發生在 40 筆已上線內容的唯一來源上」，**其唯一好處已歸零**，**選 B 等於拿那 40 筆去換一個已經不用付的成本**。處置為**任務內事實更新**（原句保留、三選項代價重寫、寫明 `operations.md:12` 的保護邊界觸發條件已滿足與 AC-4 的第二帳號前置已過期），**🔴 未解、未代 captain 確認**——`040` Out of scope 是「隔離測試表完成驗證**並由 captain 確認**」兩個條件，**前一半 044 做完了，後一半仍在 captain 手上**，裁決已由 FO 直接送交 captain。verify 另查出歸檔 commit `66ed939` **連 merge-base 都是它的後代**，即「044 已完成」**從本 branch 第一個 commit 起就看得到，只是六輪沒有人打開那張票**。**H2 是本輪的方法收穫：第四族是「引用另一張票、只寫 feature 編號」**，它變的是**被引用對象的狀態**而非位置，三條邊界宣告一條都擋不住（三條都假設引用對象是「內容穩定、只有位置會變」的檔）；檢查方式改為**重讀被引用票的 front matter**。全票 5 張被引用票逐一重讀：044 ⛔、043 ⛔、040 ✅（尚未合併有後果）、042 ✅、065／066／049 ✅。**失效模式的關鍵差異值得單獨記**：前三族壞掉時讀者會看到不相干的內容因而發現；**第四族壞掉時句子讀起來完全合理**——「044 的前置目前不存在」是通順、具體、有證據感的句子，不指向任何會露餡的位置，**所以它躲過三輪掃描與三個 reviewer**。**H4：implement 拒絕照抄 FO 的提示，而且是對的**——FO 說「比照 044 把 `.gs` 釘 `093cd01`」，實查發現 `.gs` 與 `operations.md` 在兩個 commit 同位元組，**但 040 的 `sync-content.mjs` 在 `093cd01` 只有 807 行且 `publishedRowSequences` 根本不存在**（`a51b5d9` 為 824 行、該函式在第 392 行），**照抄會讓票內 11 處行號指偏**；三檔一律釘 `a51b5d9`，並把那 17 行差異當成 H4 論點本身的證據（040 未合併、檔案真的會動）。**H3**：票內把整列刪除推給 `043`，但 043 `status: design`、標題仍掛「待captain確認脈絡」、source 寫「**再決定是否進行**」，且其門檻「初步建議兩成」**擋不住單列誤刪**（1／40 ＝ 2.5%）；改措辭而非改防線——**本票的防線是 S3 的檢查①②**。
- Cycle 4: PASSED — 收斂輪（J1／J2 fix）；surface 1 檔；**正式試算表零寫入零讀取**；**未開新票、未開新的掃描維度**；AC 整段與 S3／S7／S8、`### Feedback Cycles`、verify cycle 4 整段皆逐位元組未動。**J1：第五族——指涉一張沒有編號、而且不存在的票。** 票內三處（`chapter` 廢除的「另一張票」、Apps Script 缺別名表的「後續票」、保護範圍的「另議」）**查證後都沒有對應的票**；implement 讀完 66 張票的 `title` 與 `status` 確認無一涵蓋。**這一族比第四族更難查**：第四族至少有票號可以打開重讀，**第五族沒有編號，掃描再完整也掃不到**——只能問「這句話承諾的東西，實際上存在嗎」。**而它在這張票上特別刺眼**：本票 `## Problem` 自己寫著「**這些人工步驟目前沒有任何票、沒有任何人負責**」——**050 存在的理由，就是有人用「另議」把事情擱著**，而本票用同一種方式擱下三件事。處置為改成「尚無票，負責人未定」的明白話（**不開新票，開票屬 captain 的範圍決定**），原句保留；`chapter` 指向其唯一落腳處 `TODO.md` 的 P3-7（用名稱不用行號）。**Apps Script 別名表那一處刻意寫兩面**——「現在安全」（18／21／12 個含中文說明的標題已實測同時通過兩支程式）與 promote-to-material 條件（**有人在部署後改動任一標題字串**，那一刻 Apps Script 可能無聲失效而同步程式仍通過，兩邊不會互相提醒）；理由是「**只寫風險會讓 captain 以為現在就壞了，只寫安全會讓人忘記這個缺口**」。**順帶拆開一個把兩件事綁在一起的原句**：「不處理標題列與整列刪除的保護範圍」——**標題列的保護本票有做**（步驟 6 的 C 類、S7、AC-5），沒做的只有整列刪除；並寫明 `043` 補不上這一格（**它是同步端偵測，這裡缺的是試算表端預防**，而本票的替代防線 S3 檢查①②**同樣是偵測不是預防**）。**J2 原句一個字未改**——它說的是 spike 的**形式**而非進度，本來就沒錯；只在其下補引言說明該 spike 已由 044 完成並 PASSED，並點明這個區分，**免得下一輪有人把沒錯的句子當成錯的再改一次**。verify 判定不該改的兩處逐位元組未動。**verify cycle 5 依收斂判準判 PASSED：無擋住部署之事、無 Material 缺陷、未開新掃描維度。**

## Out of scope

不改 feature 040 的程式（已完成）。不處理標題列與整列刪除的保護範圍（另議）。不處理 HTML 淨化（042）與刪列門檻（043）。

> **⚠️ 「整列刪除的保護」目前尚無票，負責人未定。** 原句寫「（另議）」，
> 而「另議」沒有指向任何票。（原句把標題列與整列刪除綁在一起，但只有後者被擱下——見本框末段。）
>
> **它不是 `043`。** `043` 做的是**同步端**的刪列跌幅偵測——列已經被刪掉之後，
> 同步程式察覺筆數掉太多而中止。這裡缺的是**試算表端**的保護範圍——讓那一列一開始就刪不掉。
> **兩者機制不同、時機不同，`043` 補不上這一格**，何況 043 自己 `status: design`、
> 尚未決定是否進行（見「已知未解」的 ⚠️ 更正）。
>
> **本票目前的替代防線是偵測而不是預防**：S3 的檢查①②與 S9 會抓到列不見了，
> 但抓到的時候列已經不見了，要靠 Google 試算表的版本記錄救回。
> **另外，上面那句把兩件事綁在一起，但本票只擱下其中一件。**
> **標題列的保護本票有做**：步驟 6 的 C 類、S7 的 `A1:R1`／`A1:U1`／`A1:L1`、AC-5 都涵蓋它。
> **沒做的是整列刪除的保護**，Google 試算表沒有直接對應的設定。
> 所以「尚無票、負責人未定」只適用於**整列刪除**這一半。原句保留。

### design stage 追加的 Out of scope

- **不修 `approval-workflow.gs` 缺別名表的問題。** 證據 1 顯示 Apps Script 對標題的容忍度比同步程式低。
  本票用「改試算表標題」繞過（步驟 2），成本一格。改程式要重跑 040 的 review 與 verify，代價大得多。
  **⚠️ 這個落差目前尚無票，負責人未定。** 原句寫「這個落差要記成後續票」，
  但那句話本身是一個沒有被執行的指令——至今沒有任何 feature 票處理它。

  **現況不壞，不要誤讀**：本票第三節與第四節已實測，
  照票內建議輸入的 18／21／12 個標題字串（含中文說明）
  **同時通過 `resolveApprovalHeaders_` 與 040 新版同步**，輸出與純欄名版本逐字相同。
  **所以 captain 現在照票輸入的這批標題是安全的。**

  **風險在之後**：`approval-workflow.gs` 沒有別名表（`approval-workflow.gs:127-144`，
  釘在 commit `a51b5d9`），它只接受「標題等於欄名」或「標題以欄名加分隔符開頭」，
  而 `scripts/sync-content.mjs` 有別名表。兩支程式對同一份標題列的容忍度不同。

  **升級為 Material 的條件：有人在部署後改動三個分頁上任何一個標題字串。**
  那一刻 Apps Script 可能開始無聲失效，而同步程式仍然通過，兩邊不會互相提醒。
  這個條件**現在就在觸發範圍內**——captain 正在建欄與輸入標題。
- **不廢除 `chapter` 欄。** 見 `TODO.md` 的 P3-7。本票反而新建了它。
- **不執行 044。** 044 是獨立的票，有自己的資源前置。
  （2026-09-24 註：044 已於 2026-09-21 完成並 PASSED，已歸檔。原句保留。
  本票仍然不執行 044——現在的理由是它做完了，不是它還沒開始。）

## Stage Report: design

- DONE: 產出 captain 可以直接照著做的部署 runbook：八個審核欄位的確切欄名（以 `scripts/sync-content.mjs` 的 `APPROVAL_COLUMNS` 為唯一依據，不得引用文件轉述）、Apps Script 公式與 Review 選單的安裝步驟、既有 40 筆逐列重新核可的順序與範圍、以及保護範圍要涵蓋哪些欄位。每一步都要寫明由誰執行。
  「部署 runbook」步驟 0-9，每步標 `captain` 或 `工程`；欄名逐字取自 040 worktree `scripts/sync-content.mjs:84-93`；保護範圍分 A/B/C 三類，B 類對應 `approval-workflow.gs:12-14` 的 `WRITABLE_REVIEW_FIELDS`；重新核可範圍算出 59 列（Track 1 40／Track 2 15／site_tldr 4）。
- DONE: 補齊 acceptance criteria，每一項都要有可失敗的 `Verified by:`。
  AC-1 至 AC-6。AC-1 綁定部署前實測 sha256（`4d1992e3…cea3b`／`4071978a…3162`）；AC-2 綁定筆數字串 40／16；AC-3 的 id 比對指令實測會真的印出差異（餵 1 筆 fixture，正確列出少掉的 39 個 `h*` 與 14 個 `d*`）；AC-4／AC-5 為兩帳號人工測試；AC-6 讓停擺窗口變成可觀測事實。
- DONE: 釐清並在票內明確記錄兩項相依。
  「相依關係釐清（design stage）」。相依一判定本票不依賴 `operations.md`、改為自帶 runbook（`git ls-tree main docs/content-pipeline/` 只有兩個檔）；相依二判定 `## 相依關係` 第二個項目符號的「不互為前置」為錯，並附三項外部證據，同時標記 🔴 需 captain 裁決並給出 A/B/C 三個選項。
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
窗口只涵蓋 15 欄。核可列數 59 經實測確認，`editor-onboarding.md:434` 的「工作量比預估大」
指的是協調成本而非列數——窗口期間有 30 列草稿在編輯台手上。另量化了票內只定性描述的
Track 2 序號陷阱：15 個已核可列中只有第 4 列（`d3`）一列草稿夾在其中，其餘 27 列草稿都在後面，
所以風險點只有一個。

第八節的 S1-S9 已整份以 fixture `fixS` 實測：Apps Script 三個分頁全通過、040 同步 exit 0
且輸出與 baseline 逐字相同、main 同步 exit 1（窗口確實打開）、12 個保護範圍與 6 個核可連續段
都由程式算出。時間估算 75-120 分鐘是依動作次數推算，**不是量測的牆鐘時間**——
本輪沒有寫入試算表，無法量測 captain 在 Google UI 上的實際速度。

## verify stage 獨立複驗（2026-09-24）

本節是**獨立複驗**，不採信 implement 的任何 fixture 或結論。
自己抓標題列、自己建 fixture、自己跑兩支 sync、自己數列數。
指令與 fixture 全在 session 暫存目錄，未寫入 repo。

**未越界**：對正式試算表只做 3 次唯讀 HTTP GET（`status=200`，17704／10584／589 bytes），
零寫入、未建欄、未改標題、未裝 Apps Script、未設保護、未核可任何一列。
未執行 `npm run sync-content`。複驗前後 `src/data/*.json` 的 sha256 均為
`4d1992e3…cea3b`／`4071978a…3162`；主 checkout 與 040 worktree 的 `git status` 全程為空。
兩支 sync 都在暫存沙箱執行（main 版以 `git show main:` 取出後複製；040 版複製兩個檔並設
`CONTENT_OUTPUT_DIR`），未動 040 的 worktree。

### 一、最高風險宣稱：9 欄安全前綴 — **成立**

自建 fixture，main 版 sync 在暫存沙箱跑（沙箱手法與 AC-6 相同）。

**方向 (a)　9 欄全建後 main 同步 exit 0 且輸出逐字不變**

| 我的 fixture | 內容 | main 同步 | `history.json` | `discussions.json` |
|---|---|---|---|---|
| `fixRaw` | 今日抓下的原始位元組 | ✅ exit 0 | ✅ 逐字相同 | ✅ 逐字相同 |
| `fixA` | CSV round-trip，不加欄 | ✅ exit 0 | ✅ 逐字相同 | ✅ 逐字相同 |
| `fixRename` | 只做 S1 改名 | ✅ exit 0 | ✅ 逐字相同 | ✅ 逐字相同 |
| `fixSafe9` | **安全前綴 9 欄全建 ＋ 改名** | ✅ exit 0 | ✅ 逐字相同 | ✅ 逐字相同 |

「逐字」是**位元組比對**，不是筆數：`fixSafe9` 的兩份輸出與 repo 現況
`Buffer.equals` 為真（26057 bytes／11788 bytes）。

**方向 (b)　再多建任一窗口內欄位就 exit 1 — 15 欄全數驗過**

以 `fixSafe9` 為底，逐一多建**一**個窗口內欄位，共 15 組。**15 組全部 exit 1**，
錯誤一律是 `第 N 欄的標題「…」對不到任何預期欄位。`：

| 分頁 | 多建這一欄就中止 |
|---|---|
| `Track 1_history` | `review_decision`（第 15 欄）、`review_fingerprint`、`approved_fingerprint`、`current_fingerprint` |
| `Track 2_discussion` | 同上 4 欄（第 18 欄起） |
| `site_tldr` | 全部 7 欄（第 6 欄起）——**一欄都不安全** |

**界線正好在宣稱的位置**：不早也不晚。implement 自附的 falsifying change
（`fixB2` 多加一個 `review_decision` 由 exit 0 轉 exit 1）**已跑，確實轉為 exit 1**。

**9／15／24 三個數字不是手數的，是從原始碼推出來的。** 直接解析
`git show main:scripts/sync-content.mjs` 的 `TRACK_1_COLUMNS`／`TRACK_2_COLUMNS`／
`SITE_TLDR_COLUMNS`，與 040 的 `APPROVAL_COLUMNS`（8 欄，全為 `required`）、
`.gs` 的 `APPROVAL_FIELDS` 交集運算：

| 分頁 | 現況欄 | 要新建 | 安全前綴（main 認得） | 窗口內（main 不認得） | 建完 |
|---|---|---|---|---|---|
| `Track 1_history` | 10 | 8 | 4 | 4 | 18 |
| `Track 2_discussion` | 12 | 9 | 5 | 4 | 21 |
| `site_tldr` | 5 | 7 | 0 | 7 | 12 |
| **合計** | | **24** ✅ | **9** ✅ | **15** ✅ | |

機制根因複讀確認：main 的 `SITE_TLDR_COLUMNS`（第 123-129 行）**完全沒有**
`approved_by`／`approved_at`／`reject_reason`，所以 `site_tldr` 的安全前綴是 0；
`TRACK_1_COLUMNS`／`TRACK_2_COLUMNS` 有這三欄（第 97-99、117-119 行，皆 `optional`），
且 main 也認得 `chapter`（第 94 行）、`owl_depth_comment`（第 113 行）、`full_content`（第 116 行）。

**獨立佐證**：把 24 欄全建的 fixture 餵給 main，它印出「**共 15 項錯誤**」——
錯誤項數自己等於窗口內欄數。

### 二、D1／D2／D3／D5 — **四項全部成立**

**D1 成立。** 用今日抓下的位元組跑票內原指令的 `split(/\r?\n/)[0]`，輸出逐字為：

```
Track 1: id(給系統看的編號),…,image_url（現有為AI生成）,"status
Track 2: id,category,title,author,year,link,abstract,views,status,"owl comment
site_tldr: order,label,text,status,link
```

**exit 0、無任何警告。「它不報錯，它少印」成立。** Track 2 的 `vibe` 與 `sticky`
完全不出現。`site_tldr` 不受影響（標題無換行）。
自寫 CSV 狀態機重解，得 10／12／5 欄，與 implement 貼的 JSON **逐字相同**。

**D2 成立。** 三個分頁的標題列中，八個審核欄位**只有 `status` 存在**；
`approved_by`、`approved_at`、`reject_reason` 三個分頁皆無。票內算 17 欄，實際 24 欄。

**D3 成立。** 以**我自己抓的標題列**、`node:vm` 載入 `.gs` 原始碼、stub 掉
`SpreadsheetApp`／`Session`／`Utilities` 後重跑 `resolveApprovalHeaders_`：

| 階段 | `Track 1_history` | `Track 2_discussion` | `site_tldr` |
|---|---|---|---|
| A　現況 | ⛔ `缺少欄位「chapter」。` | ⛔ `缺少欄位「owl_comment」。` | ⛔ `缺少欄位「review_decision」。` |
| B　套用票內步驟 1、2 | ⛔ `缺少欄位「review_decision」。` | ⛔ `缺少欄位「owl_depth_comment」。` | ⛔ 同 A |
| C　再加票內步驟 3 的七欄 | ✅ 18 欄 | ⛔ `缺少欄位「owl_depth_comment」。` | ✅ 12 欄 |
| D　Track 2 再補兩個內容欄 | — | ✅ 21 欄 | — |

**與 implement 的表逐格相同。照票內步驟 1-3 做完，步驟 4 在 Track 2 必定失敗。**
`captain` 若少建這兩欄，會在窗口內卡在「安裝／更新公式」。

**D5 成立，且比票內描述更精確。** 實際標題是
`owl comment` ＋ **LF（`\n`，不是 CRLF）** ＋ `(允鍾如果有靈感可以寫一句短評)`。
票內「改前」字串 `owl comment (允鍾…)`（空格接括號）**不出現在實際標題中**——
用「尋找並取代」搜它會找不到。改名後（`owl_comment` ＋ LF ＋ 括號）
`resolveApprovalHeaders_` 解析成功（上表階段 D），main 同步也照樣 exit 0 且輸出逐字不變
（另跑一組「不改名」fixture 亦 exit 0，證實 alias 兩種都收）。

### 三、數字 — **全部自行數出，全部相符**

**59 列（40／15／4）成立，我是第三個獨立來源。** 從我抓的 CSV 讀 `status` 欄，
以 Node `Map` 計數（未用 `sort`／`uniq`）：

| 分頁 | 非空白資料列 | `Approved` | 空白 |
|---|---|---|---|
| `Track 1_history` | 42 | **40** | 2（`h2` 第 3 列、`h28` 第 25 列）|
| `Track 2_discussion` | 43 | **15** | 28（`d3` 第 4 列、`d18`–`d44`）|
| `site_tldr` | 4 | **4** | 0 |
| **合計** | 89 | **59** | 30 |

第三來源交叉驗算：`history.json` 40 筆 ＋ `discussions.json` 16 筆去掉 `tldr` 得 15
＋ `site_tldr` 分頁 4 列 ＝ **59**。

**保護範圍 12／15 成立，A1 位置逐格相符。** 以 `WRITABLE_REVIEW_FIELDS`（實讀 `.gs`，
確為 6 欄）與 A 類兩欄的解析欄號算連續段：

| 排序 | `Track 1_history` | `Track 2_discussion` | `site_tldr` | 合計 |
|---|---|---|---|---|
| 建議排序 | J2:J、R2:R／L2:Q／A1:R1 ＝ 4 | I2:I、U2:U／O2:T／A1:U1 ＝ 4 | D2:D、L2:L／F2:K／A1:L1 ＝ 4 | **12** ✅ |
| 票內 `APPROVAL_COLUMNS` 排序 | 5 | 5 | 5 | **15** ✅ |

S7 表中的 12 個 A1 範圍**逐格與我算的相同**。另確認：S2／S4 的**分階段**建欄順序
與第三節「建議排序」雖然物理欄序不同，算出的保護範圍**完全一樣**，S7 的表對兩者都成立。

**Track 2 夾在已核可列中的草稿確實只有 1 列。** 依 `.gs` 第 79 行與
`sync-content.mjs:392` 的同語意實算序號（「任一發布欄位非空」的累計計數）：
15 個 `Approved` 列在第 2-17 列，序號分別是 `1,2,4,5,…,16`（範圍 1-16，缺 3）。
序號 3 由 `d3`（第 4 列，有發布內容）占用。
**第 2-17 列之間只有 `d3` 一列非 `Approved`**；其餘 27 列草稿（`d18`–`d44`）全在第 17 列之後。
**captain 的窗口內禁令是完整的：只有 `d3` 一個風險點。**

**6 個連續選取段成立。** 由 `status` 欄算出：`Track 1` 第 2 列／第 4-24 列（21）／
第 26-43 列（18）；`Track 2` 第 2-3 列（2）／第 5-17 列（13）；`site_tldr` 第 2-5 列（4）。
共 6 段、59 列，與 S8 的表逐格相同。

### 四、證據 3 與 alias 表 — **成立**

**六組 fixture 兩份 JSON sha256 全同且等於 repo 現況，成立。** 我自己跑了六組
（`fixRaw`／`fixA`／`fixRename`／`fixSafe9` 走 main；「建議排序」與「票內排序」的
24 欄完整部署 fixture 走 040），**六組的兩份輸出 sha256 全部是
`4d1992e3…cea3b` 與 `4071978a…3162`**。

完整部署 fixture 的 59 列指紋**由我自己算**（040 的 `fingerprintPublishedRow`，
Track 2 序號自行重算），040 新版 sync 全部接受並 exit 0，逐字印出
`✅ 檢查通過，已寫入 src/data/history.json（40 筆）` 與
`✅ 檢查通過，已寫入 src/data/discussions.json（16 筆，含 tldr）`。
**AC-1／AC-2 的驗收手法在真實資料上可執行。**

另建「S2／S4 實際建欄順序」的 fixture：040 sync exit 0、輸出逐字相同；
同一份餵 main 得 exit 1，首個錯誤指向 **第 15 欄 `review_decision`**——
與第八節的宣稱相符。

**否證測試（證明這些比對真的會失敗）：**

| 改動 | 結果 |
|---|---|
| `chapter` 填入非空值 | main 仍 exit 0，但 `history.json` 變成 `38e662f6…` ≠ baseline ✅ |
| `owl_depth_comment` 填入非空值 | main 仍 exit 0，但 `discussions.json` 變成 `6895ef6b…` ≠ baseline ✅ |

**「新欄全部留白」是承重條件，而且沒有任何程式會擋它** —— 填了值 main 照樣 exit 0，
只有 sha256 會不同。AC-1 已寫明這一點。

**alias 表實讀成立。** `git show main:scripts/sync-content.mjs` 第 112 行逐字為
`  { field: 'owl_comment', aliases: ['owl comment', 'owl_comment'], column: 'optional', value: 'optional' },`。

**其餘被引用的行號全部實讀核對通過**：`.gs` 第 5-6（`APPROVAL_FIELDS`）、
12-14（`WRITABLE_REVIEW_FIELDS`）、127-144（`resolveApprovalHeaders_`）、
159（`這個分頁不支援核可公式。`）、219（`不可核可標題列。`）、220（`Session.getActiveUser()`）；
040 `sync-content.mjs` 第 84-93（`APPROVAL_COLUMNS`）、392（`publishedRowSequences`）。
**唯一一筆對不上的是 `TODO.md:127`** —— 見下方 F3。

### 五、時間估算的誠實度 — **揭露足夠**

「75-120 分鐘是推算、非量測」在票內**三處**揭露，captain 不會誤讀成實測值：

1. 第六節「窗口時間估算」開頭粗體：「**這是依動作次數推算的估計值，不是實測的牆鐘時間。**
   本輪沒有對試算表做任何寫入，所以無法量測 captain 在 Google 試算表 UI 上的實際速度。」
2. 表格欄位標籤本身：「單位時間（**假設**）」，並註「captain 可自行替換」。
3. implement 的 Stage Report Summary 再次明寫。

**動作次數已逐項查證，全部正確**：窗口內 15 欄 ✅、保護範圍 12 個 ✅、
連續選取 6 段 ✅、核可 59 列 ✅、3 個分頁各執行一次「安裝／更新公式」＝3 次 ✅。
只有「單位時間」是假設，這一點標示清楚。

### 六、Placeholder scan（verify stage 指名輸出）

| 掃的字串 | `src/data/*.json` | 本輪新增的 540 行票內文字 |
|---|---|---|
| `某學者` | 0 | 0 |
| `某大學法律系` | 0 | 0 |
| `lorem ipsum`／`Lorem` | 0 | 0 |
| `test` | 0 | — |
| `placeholder`／`TODO`／`FIXME`／`XXX` | 0 | 0 |
| `example.com`／`sample` | 0 | — |
| `YOUR_`／`TBD`／`xxx` | — | 0 |

**另掃「試算表網址外洩」**（本票明令 URL 不得入票）：
`docs.google`／`spreadsheets/d/`／`/pub?`／`gviz`／`https://` 在新增內容中**均為 0 次**。✅
本輪未改動任何資料檔，`src/data/*.json` 逐位元組未變。

### 七、verify stage 的獨立發現

四項都不改變 captain 要輸入的任何欄名、欄數或列號；**24／9／15／59／12／6 全部正確**。

**F1（數字自相矛盾，非承重）第六節說刪 `d3` 會讓「其後 **14** 列」指紋全變，實算是 **13** 列。**
`d3` 在第 4 列（序號 3），其後的 `Approved` 列是第 5-17 列，共 **13** 列。
同一份文件的 S8 寫的是「第 5-17 列的指紋全變，那 **13** 列要重做」——**S8 正確，第六節的 14 錯。**
- 已釋出使用者與正常流程：captain 讀第六節理解 `d3` 風險。
- 可觀察到的損害：無行為差異——兩處的可執行指令都是「`d3` 不可刪除或搬移」。只是列數印錯。
- 影響的 AC 或不可協商邊界：無。
- 觸發證據：本節第三小節實算，`Approved` 序號 `1,2,4..16`，`d3` 占序號 3。
- 提議：**Polish**／任務內／`fix`（把 14 改成 13）。

**F2（會讓工程誤判驗收失敗）AC-6 要求逐字出現的錯誤字串，在照票建欄後不會出現。**
AC-6 寫「必須 exit 1 並輸出 `第 N 欄的標題「review_decision」對不到任何預期欄位。`」。
但票內建議的標題字串含中文說明，程式實際印的是
`第 15 欄的標題「review_decision （由 Review 選單寫入）」對不到任何預期欄位。`
——**引號內多了中文說明**。逐字比對或 `grep '「review_decision」'` 會找不到。
- 已釋出使用者與正常流程：工程在 S3／AC-6／步驟 9 前執行 sandbox 驗證。
- 可觀察到的損害：驗證「看起來失敗」而系統其實正常，或反過來被當成通過而不再細看。
  發生在窗口內，會吃掉 captain 的時間。
- 影響的 AC 或不可協商邊界：**AC-6 的 `Verified by:`**。
- 觸發證據：本節第一、四小節實跑，三個分頁 15 條錯誤全部是
  `「<欄名> （<中文說明>）」` 的形式；且欄號隨建欄順序變動（S2／S4 順序為第 15 欄，
  第三節「建議排序」為第 12 欄）。
- 提議：**Material**／任務內／`fix`（AC-6 改成比對 `對不到任何預期欄位` 與
  `review_decision` 兩個子串，不綁完整引號內容；欄號改寫成「依實際建欄順序」）。

**F3（引用行號錯）`TODO.md:127` 指不到東西。** 票內步驟 3 的表與第三節都寫
「`TODO.md:127` 記錄現況為 `order｜label｜text｜status｜link`」。
`TODO.md` 第 127 行是**空行**；該記錄實際在**第 156 行**
（原文用半形 `|`：`現行欄位為 order | label | text | status | link（已直接讀 SSOT 確認）`）。
- 已釋出使用者與正常流程：任何人想回溯 `site_tldr` 欄位記錄的來源。
- 可觀察到的損害：追不到出處。**記載的內容本身正確**（我直接讀 SSOT 得同樣 5 欄）。
- 影響的 AC 或不可協商邊界：無。
- 觸發證據：`sed -n '127p'` 為空；`sed -n '156p'` 為該句。
- 提議：**Polish**／任務內／`fix`（127 改 156）。

**F4（D4 自己帶出來的新缺口）AC-1 綁死一個 sha256，但 D4 把單一窗口改成跨日計畫，票內沒有 re-baseline 條文。**
D4 是對的、也是好消息，但它把部署從「一段 2 小時窗口」改成「階段一可分幾天 ＋ 階段二窗口」。
階段一要 captain 先建 `chapter`／`owl_depth_comment`／`full_content` **三個內容欄**，
而保護範圍要到階段二的 S7 才設——**這三欄在階段一期間是編輯台可寫的**。
我實測：把它們填入非空值，main 同步**仍 exit 0**，只有輸出 sha256 改變
（`38e662f6…`／`6895ef6b…`）。AC-1 綁的是 2026-09-07 量到的固定值。
- 已釋出使用者與正常流程：責任編輯在階段一期間照常使用試算表
  （`editor-onboarding.md:434` 明記「編輯權限已經開出去」）。
- 可觀察到的損害：S3 會攔下來（它同時檢查 exit 0 **與**兩個 sha256，這一關寫得很好），
  但票內只寫「這一關沒過就不要進階段二」，**沒寫沒過要怎麼辦**。
  若是編輯合法填入內容，正解是重新量 baseline 而不是永久停住；
  若在 S3 之後、窗口內才被填，AC-1 會在步驟 8 失敗，而 captain 會以為是部署弄壞了內容。
- 影響的 AC 或不可協商邊界：**AC-1**（逐字 sha256 比對）。
- 觸發證據：上方否證測試兩列；S7 在階段二才設保護；階段一明寫「產線照常，可分次做」。
  今日重量 baseline 仍為 `4d1992e3…cea3b`／`4071978a…3162`，**目前尚未發生漂移**。
- 提議：**Deferred risk**（觸發尚未發生）／任務內／`fix`：在 S2 補一句
  「這三個內容欄在 S9 完成前必須保持全欄留白」，並在 S3 補 re-baseline 條文
  （sha256 不符時，先確認是編輯合法填值還是部署副作用；若是前者，重新量並更新 AC-1 綁定值）。
  升級為 Material 的條件：任何人在階段一對這三欄或那 59 列的發布內容寫入任何值。

### 八、裁決

**PASSED。**

本輪要複驗的每一項承重宣稱都獨立成立：9 欄安全前綴（兩個方向都驗，15 個窗口欄逐一驗，
falsifying change 已跑）、D1／D2／D3／D5、24／9／15 欄、59 列、12／15 個保護範圍、
6 個連續段、只有 `d3` 一個序號風險點、證據 3 的六組 sha256、alias 表。
**captain 可以依這份校正結果操作正式試算表。**

四項發現沒有一項會讓 captain 輸入錯的欄名、建錯的欄數或核可錯的列。
F2 是唯一會在窗口內浪費時間的（工程端的驗收字串），F4 是 D4 帶出來的計畫缺口
而 S3 已經攔得住，只差「攔下來之後怎麼辦」。F1／F3 是印錯的數字與行號。

## Stage Report: verify

- DONE: 獨立複驗「9 欄安全前綴」——自建 fixture、自跑 main 現行版與 040 版兩支 sync，不採信 `fixB1`–`fixB4`。兩個方向都驗；跑 implement 自附的 falsifying change。
  **成立。** 方向 (a)：`fixSafe9`（9 欄全建＋改名）main 同步 exit 0，兩份輸出與 repo 現況**位元組完全相同**（`Buffer.equals` 為真，26057／11788 bytes），不是筆數相同。方向 (b)：以 `fixSafe9` 為底逐一多建**一**個窗口內欄位，**15 組全部 exit 1**——界線不早也不晚。falsifying change（多加一個 `review_decision`）已跑，確實由 exit 0 轉 exit 1。9／15／24 三個數字改由直接解析 main 的三張 `*_COLUMNS` 與 040 的 `APPROVAL_COLUMNS`、`.gs` 的 `APPROVAL_FIELDS` 推出，非手數；main 對 24 欄 fixture 印出「共 15 項錯誤」自成佐證。根因複讀確認：`SITE_TLDR_COLUMNS`（第 123-129 行）無 `approved_by`／`approved_at`／`reject_reason`，故 `site_tldr` 安全前綴為 0。
- DONE: 複驗 D1、D2、D3、D5，並以自己抓的標題列重跑 `resolveApprovalHeaders_`。
  **四項全部成立。** D1：跑原指令得 exit 0、無警告的截斷輸出，Track 2 的 `vibe`／`sticky` 完全不出現——「它不報錯，它少印」成立；自寫 CSV 狀態機重解得 10／12／5 欄，與 implement 貼的 JSON 逐字相同。D2：三個分頁八個審核欄位只有 `status` 存在，17→24 成立。D3：以 `node:vm` 載入 `.gs`、stub 掉 Google 全域物件、餵**我自己抓的標題**重跑，四個階段的結果與 implement 的表**逐格相同**——階段 C 的 Track 2 仍 ⛔ `缺少欄位「owl_depth_comment」。`，照票做完步驟 1-3 步驟 4 必定失敗。D5：實際是 `owl comment` ＋ **LF**（非 CRLF）＋ 括號；票內「改前」字串**不出現在實際標題中**，尋找取代確實會找不到。
- DONE: 自行數證 24／9／15 欄、59 列、12／15 個保護範圍、Track 2 只有 `d3` 一個風險點；複驗證據 3 與 alias 表。
  **全部相符。** 59 列自己數（讀 `status` 欄、Node `Map`、未用 `sort`／`uniq`）得 40／15／4，並以 repo JSON 產物（40＋15＋4）交叉驗算——我是第三個獨立來源。保護範圍以 `WRITABLE_REVIEW_FIELDS`（實讀確為 6 欄）算連續段，建議排序 12、票內排序 15，**S7 的 12 個 A1 範圍逐格相符**；另確認 S2／S4 的分階段欄序與第三節建議排序雖物理順序不同，保護範圍完全一樣。`d3`：依 `.gs:79`／`sync-content.mjs:392` 同語意實算序號，`Approved` 為 `1,2,4..16`，`d3` 占序號 3，第 2-17 列之間**只有它**一列非 `Approved`，其餘 27 列全在第 17 列之後——**窗口內禁令完整**。6 個連續段與 S8 逐格相同。證據 3：我自己跑六組 fixture，兩份輸出 sha256 全部等於 `4d1992e3…cea3b`／`4071978a…3162`；完整部署 fixture 的 59 列指紋由我自己用 `fingerprintPublishedRow` 算，040 sync 全部接受並逐字印出 `（40 筆）`／`（16 筆，含 tldr）`。alias 表第 112 行實讀逐字相符；其餘 8 處被引用的行號全部實讀通過。
  falsifying change：`chapter` 或 `owl_depth_comment` 填入非空值，main 仍 exit 0 但 sha256 變為 `38e662f6…`／`6895ef6b…`——證明這些比對真的會失敗，且「全部留白」是承重條件而無程式會擋它。
- DONE: 確認時間估算的揭露、動作次數可查，並確認未越界；未報告的同類問題獨立列出。
  時間估算在**三處**明確揭露為「依動作次數推算、非量測牆鐘」（第六節開頭粗體、表格欄標籤「單位時間（假設）」、Stage Report Summary），captain 不會誤讀成實測值。動作次數逐項查證全部正確：15 欄／12 範圍／6 段／59 列／3 次安裝公式。未越界：正式試算表**零寫入**（只有 3 次唯讀 GET），未跑 `sync-content`，`src/data/*.json` 前後 sha256 未變且 `git status` 全程為空，未動 040 worktree（兩支 sync 皆在暫存沙箱執行）。Placeholder scan 與「試算表網址外洩」掃描全部 0 次。獨立發現 F1-F4 列於第七節，各附四項證據欄位與提議分類。

### Summary

不採信 implement 的任何 fixture，全部自己重做：自己抓標題列、自己寫 CSV 狀態機、
自己建 fixture、自己在暫存沙箱跑 main 與 040 兩支 sync、自己數列數與序號。
**每一項承重宣稱都成立，captain 可以依這份校正結果操作正式試算表。**

最高風險的「9 欄安全前綴」驗得最細：不只驗「9 欄全建後 exit 0」，還逐一驗了 15 個窗口內欄位
——**每一欄單獨多建都會讓 main exit 1**，界線正好在宣稱的位置。而且「逐字相同」是
`Buffer.equals` 的位元組比對，不是筆數。9／15／24 改由原始碼推導而非手數，
main 自己對完整部署 fixture 印出「共 15 項錯誤」，項數等於窗口欄數。

D3 是對 captain 最要緊的一條，也確認了：照票內步驟 1-3 做完，Track 2 的「安裝／更新公式」
必定報 `缺少欄位「owl_depth_comment」。`。`d3` 的序號風險點確實只有一個，
所以窗口內禁令是完整的。59 列有三個獨立來源。

四項獨立發現都不影響 captain 要輸入的欄名／欄數／列號。最值得處理的是兩項：
**F2**——AC-6 要求逐字出現的錯誤字串，在照票用含中文說明的標題建欄後不會出現
（程式印的是 `「review_decision （由 Review 選單寫入）」`），工程會在窗口內誤判驗收失敗；
**F4**——D4 把單一窗口改成跨日計畫，而 AC-1 綁死一個 2026-09-07 的 sha256，
階段一要先建三個**編輯台可寫**的內容欄而保護要到階段二才設。S3 攔得住（它同時檢查
exit 0 與兩個 sha256），但票內沒寫攔下來之後怎麼辦。今日重量 baseline 未漂移。

## Stage Report: implement (cycle 2)

- DONE: F2（Material，最優先）AC-6 改為比對 `對不到任何預期欄位` 與 `review_decision` 兩個子串，不綁完整引號內容；欄號改寫成「依實際建欄順序」。屬 captain 一次性授權範圍：只改 `Verified by:` 怎麼認，不改 AC-6 的要求文字。
  AC-6 的 `Verified by:` 已改。sandbox 指令現在把輸出導到 `$SANDBOX/out.txt`，再以 `grep '對不到任何預期欄位' | grep -q 'review_decision'` 判定；票內同時逐字寫出程式實印的完整訊息，並明寫「不要逐字比對引號內的內容，也不要綁欄號」，附上兩個欄號值（S2／S4 排序第 15 欄、建議排序第 12 欄）。**AC-6 的標題與要求本身一字未動。** 另修同一項下一句原本寫「錯誤訊息與上面逐字相同」——那句在 AC-6 改寫後就對不上了（design stage 的 fixture 用純欄名標題），已改為說明兩者差在引號內的中文說明。
  獨立重測：架本機 HTTP server 供三個分頁 fixture（標題用建議值、S2／S4 排序），`git show main:scripts/sync-content.mjs` 複製到暫存沙箱執行，exit 1，逐字得 `第 15 欄的標題「review_decision （由 Review 選單寫入）」對不到任何預期欄位。檢查是否打錯字。`。`grep '「review_decision」'` 找不到它（F2 成立）；新判準認得它。另查出訊息實際結尾還有 `檢查是否打錯字。`（main `sync-content.mjs:294` 的樣板），已一併寫進票內。
- DONE: F4（Deferred risk，第二優先）S2 補「`chapter`／`owl_depth_comment`／`full_content` 三欄在 S9 完成前必須保持全欄留白」；S3 補 re-baseline 條文；把 promote-to-material 條件記進票內。
  S2 尾端加一段 ⚠️：三欄必須全欄留白、階段一期間它們是編輯台可寫的、沒有任何程式會擋填值（實測填值 main 仍 exit 0，只有 sha256 變成 `38e662f6…`／`6895ef6b…`）、要事先告知責任編輯。S3 加了三樣東西：兩個 `diff` 指令（原本只寫「比 sha256」，沒寫怎麼看出差在哪）、一張二分判定表（編輯合法填值 → 重新量 baseline 並更新 AC-1 綁定值、註明日期與原因；部署副作用 → 停住，不要重量），以及「重量 baseline 不等於放寬 AC-1」一句（判準不變，變的只是基準的量測時點；只有 captain 能改 AC 的要求）。promote-to-material 條件照 verify 原文記入：任何人在階段一對那三欄或那 59 列的發布內容寫入任何值。**F4 的修改全部落在 S2／S3，未碰 AC-1 的條文。**
  S3 新增的 `diff` 指令已實測指對地方：同一沙箱手法餵一份合法 fixture，main exit 0 並把兩個 JSON 寫進 `$SANDBOX/src/data/`（不是 repo），`ls` 確認。
- DONE: F1（Polish）第六節「其後 14 列」改 13；F3（Polish）`TODO.md:127` 改 156。
  第六節「Track 2 的序號暴露面」已改為「其後 13 列（第 5-17 列）的指紋全變」，與同文件 S8 的 13 一致。`TODO.md:127` 兩處載重引用（步驟 3 的表、第三節）已改為 `:156`；實讀確認第 127 行是空行、該記錄在第 156 行。verify 自己那兩處 `TODO.md:127`（它的第四節末與第七節 F3）刻意保留——那兩處在描述缺陷本身。
- DONE: 一併掃同類——票內所有「第 N 列／N 欄／N 筆」在多處出現時是否一致；所有 `檔名:行號` 是否真的指到宣稱內容。逐項列出檢查範圍與結果，未被點名的同類一併修並列出。
  第九節兩張表。**引用**：範圍擴到全票 31 個被引用位置（verify 只掃了 8 處）。四處指不到宣稱內容——`TODO.md:127`（即 F3）加上**三處本輪新查出的同類**：`editor-onboarding.md:430` 出現 4 次都是指「編輯權限已經開出去…工作量比原設計預估的大」，該句實際在第 **434** 行（第 430 行是順序那一句）；`040-…md:221` 指的 Out of scope 原句實際在第 **290** 行（第 221 行在三個 checkout 都是空行），已一併補全檔名；本票自我引用「第 50 行」實際是第 **53** 行。四處全部已修，兩處自我引用另補上章節錨點（`## 相依關係` 第二個項目符號、`## Risk evidence` 首句），讓它們不再隨票內插入內容漂移。其餘 27 處實讀通過，逐處列出宣稱內容與核對結果。
  **數字**：14 對 13 是唯一矛盾（即 F1）。其餘全部一致並附加總驗算：24＝8＋9＋7、9＝4＋5＋0、15＝4＋4＋7、9＋15＝24、17＝5＋5＋7、24－17＝7、18＝10＋8／21＝12＋9／12＝5＋7、59＝40＋15＋4、89＝42＋43＋4、30＝2＋28＋0、59＋30＝89、6 段＝3＋2＋1 且 1＋21＋18＋2＋13＋4＝59、12＝4＋4＋4、27 列＝第 18-44 列、540 行以 `git log --numstat 2e83adf` 核對為 `540 0`。`review_decision` 的欄號在票內有 12／15／18／6 四個值，實為排序差異而非矛盾，已在表中說明並在 AC-6 明寫不要綁欄號。「三處與現況不符」與 D1-D6 也不是矛盾：D4 是估算過大、D6 是漏說明，兩者不屬於「與現況不符」。
  falsifying change：把 AC-6 新判準的第二段 `grep` 換成 `grep -q '「review_decision」'`，同一份實測輸出就會判失敗——證明新舊判準真的不同，且新判準不是放寬成「永遠通過」（把輸入換成一份沒有標題錯誤的合法 fixture 輸出，新判準同樣判失敗）。

### Summary

四筆 finding 全部按 FO 授權修完，改動全部在票內文字，**未對正式試算表寫入或讀取任何一格**。

F2 是最優先的一筆，因為它發生在窗口內。AC-6 原本要求工程逐字看到
`第 N 欄的標題「review_decision」對不到任何預期欄位。`，但照票用含中文說明的標題建欄後，
程式實印的是 `「review_decision （由 Review 選單寫入）」`——引號內多了說明，逐字比對找不到。
現在判準改成「同一行同時含兩個子串」，並把 `grep` 直接寫進 sandbox 指令，
欄號不再綁定。**AC-6 的要求文字一字未動**，改的只是怎麼認出那一行。
這一串字串本輪自己重跑 main 的同步重測過，新舊判準的差異已用反向改動證明。

F4 補的是「攔下來之後怎麼辦」。S2 現在明寫三個內容欄必須全欄留白，
並說明沒有任何程式會擋填值；S3 加了 `diff` 指令、二分判定表與 re-baseline 條文，
並說清楚重量 baseline 不是放寬 AC-1——判準不變，變的是基準的量測時點，
而改 AC 的要求仍然只有 captain 能做。

F1／F3 是同一類：引用寫下之後沒有再被驗證。把整票掃過一遍，
除了 verify 點名的 `TODO.md:127`，又查出**三處同類**：`editor-onboarding.md:430`
（出現 4 次，該句其實在第 434 行）、`040-…md:221`（其實在第 290 行）、
本票自我引用「第 50 行」（其實是第 53 行）。四處全修，兩處自我引用另外補了章節錨點，
讓它們不再隨著票內插入內容漂移。數字方面，14 對 13 是唯一的矛盾；
其餘每一組都附上加總驗算，verify 已確認的 24／9／15／59／12／6 全部原值保留。

## verify stage 第二輪：F1-F4 修正複驗（2026-09-24）

**本輪只驗那四筆修正，不重驗已確認過的承重數字**——只確認它們沒被動到。
**本輪對正式試算表零存取**：沿用第一輪抓下的 CSV 快照（sha256 與第一輪相同，
`6e16b1cb…`／`1c3fc28d…`／`a68602c4…`），沒有發出任何新的 HTTP 請求。
diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。

### 一、F2 —— 修好了，而且沒有被放寬成「永遠通過」

自己架 fixture、把 `git show main:scripts/sync-content.mjs` 複製到暫存沙箱跑，取得真實輸出。
程式實印的那一行逐字為：

```
第 15 欄的標題「review_decision （由 Review 選單寫入）」對不到任何預期欄位。檢查是否打錯字。
```

**與票內寫進 AC-6 的字串逐字相同**，包含結尾的 `檢查是否打錯字。`。
該樣板確認在 `git show main:scripts/sync-content.mjs` 第 294 行：
`addError(errors, group, '標題', \`第 ${i + 1} 欄的標題「${trunc(raw)}」對不到任何預期欄位。檢查是否打錯字。\`);`

四格判準測試（新判準逐字取自票內 AC-6 的 `grep`）：

| 輸入 | 新判準 | 舊逐字判準 `「review_decision」` |
|---|---|---|
| 窗口已打開（24 欄全建，main exit 1） | ✅ 認得 | ⛔ 找不到 ← **F2 原本的病灶** |
| **合法 fixture（安全前綴 9 欄，main exit 0，無標題錯誤）** | **⛔ 判失敗** | ⛔ 找不到 |

**下面那一格是關鍵，它通過了**：把一份沒有標題錯誤的合法輸出餵進去，
新判準**同樣判失敗**。新判準不是被放寬成恆真，它仍然會拒絕。

implement 自附的否證 (a) 也跑了：把第二段 `grep` 換回 `'「review_decision」'`，
同一份真實輸出立刻判失敗——證明新舊判準確實不同。

**另補一個我自己的否證**：新判準只在 `exit 1` **且** `grep` 印 ✅ 時才算通過。
若是抓取失敗之類的其他錯誤，同樣 exit 1 但 `grep` 會印 ⛔，兩段合起來才判得準。
票內兩個條件都寫了。

**AC-6 的要求文字一字未動，已逐區塊比對確認。** 把 `## Acceptance criteria` 整段
從我上一輪的 commit 與現在各抽出來 diff：

- **AC-1／AC-2／AC-3／AC-4／AC-5 逐字未動**（`diff -q` 無差異）。
- AC-6 只有兩處變動：`Verified by:` 那一則，以及「這個 sandbox 手法 design stage 已實測」
  那一則的末句。後者原本寫「錯誤訊息與上面逐字相同」，在 AC-6 改寫後就變成假的
  （design stage 的 fixture 用純欄名標題），**這是必要的連帶修正，implement 也已揭露**。
- AC-6 的標題、「會怎麼失敗」、「這一項的用意」三處**均未出現在 diff 中**。

### 二、F4 —— 「攔下來之後怎麼辦」寫完整了，那張表真的分得出來

**S3 新增的指令指對地方，我逐字照跑了一次。** 用票內 AC-6 的 sandbox 手法
（`mktemp -d` 真的建一個 `$SANDBOX`），env 指向本機 fixture：

```
exit=0
$SANDBOX/src/data/ → discussions.json (11788 bytes)、history.json (26057 bytes)
repo 的 git status → 空（repo 未被碰到）
shasum → 4d1992e3…cea3b / 4071978a…3162
diff（兩行）→ 皆無輸出
```

**main 確實把兩個 JSON 寫進 `$SANDBOX/src/data/` 而不是 repo，`ls` 與 `git status` 兩面確認。**

**那張二分判定表不是裝飾品。** 我用三個真實情境測它，三個落在不同格子，訊號差距很大：

| 情境 | main exit | `diff` 實際長什麼樣 | 表判到哪 |
|---|---|---|---|
| A　編輯在 `chapter` 填了「第一章　前言」 | 0 | **只有 1 行**：`"chapter": "" → "chapter": "第一章　前言"`，欄名就寫在 diff 裡 | 第 1 列 → 重新量 baseline ✅ |
| B　部署時誤刪一列已核可的列（`h1`） | 0 | **318 行**，首行即 `"id": "h1" → "id": "h4"`，整份往上位移 | 見下方 G3 |
| C　部署時欄名打錯（`aproved_by`） | **1** | 兩個 JSON 都未產生 | 第 2 列首句「exit 1」→ 停住 ✅ |

情境 A 的 diff 直接把欄名印出來，「只落在那三個內容欄」是肉眼可判的，不是空話。

**AC-1 的條文完全未動**（上面第一節已逐字確認），
**F4 的修改全部落在 S2／S3**——cycle 2 的 15 行刪改中，沒有一行屬於 AC-1。
「重量 baseline 不等於放寬 AC-1」這句成立：判準（部署前後逐字相同）確實沒變，
變的只是「部署前」的量測時點。

### 三、F1／F3 與那一類：**我把 31 處全查完了，不是抽樣**

**三處新查出的同類，我自己複驗，全部成立：**

| 引用 | 原行號指到什麼 | 更正後行號指到什麼 |
|---|---|---|
| `editor-onboarding.md` 430→**434** | 430 是「正確順序是：試算表建欄 → 裝公式 → …」 | 434 是「**現在編輯權限已經開出去，這一輪重新核可的工作量比原設計預估的大。**」✅ |
| `040-…md` 221→**290** | 221 是**空行** | 290 是「…不上線正式 SSOT 設定，直到隔離測試表完成驗證並由 captain 確認。」✅ |
| 本票 50→**53** | 50 是**空行** | 53 是「`no spike needed` 不成立，但 spike 的形式是在隔離測試表上先跑一次（即 feature 044）。」✅ |
| `TODO.md` 127→**156**（F3） | 127 是**空行** | 156 是「現行欄位為 `order \| label \| text \| status \| link`（已直接讀 SSOT 確認）」✅ |

本票「第 45 行」現在仍正確（實讀為 `- **feature 044**…兩者不互為前置。`）。

**其餘 27 處我沒有抽樣，逐一實讀查完。26 處通過，查出第 5 處錯——見下方 G1。**
通過的包含：`editor-onboarding.md` 的 58／104／110／261／344-345／425-430（428 與 430 兩句都在區間內）、
`2026-08-31-content-pipeline.md:174`（`（9 欄）` 逐字在該行）、
`operations.md:12` 與「隔離表部署」第 15-25 行（第 26 行確為空白、第 27 行確為下一節 `## 核可與拒絕`）、
`design.md` 第二節（第 135 行 `## 二、試算表要長怎樣`）第 4 點（逐字為「找不到就中止，並指名是哪個標題看不懂」）、
以及 `.gs` 的 5／6／12-14／76-80／79／127-144／159／219／220 與 main／040 `sync-content.mjs` 的
84-93／94／97-99／112／113／116／117-119／123-129／392（這一批第一輪已實讀，本輪未變動）。

**殘留的 12 處 `TODO.md:127` 我逐處看過，全部是在描述這個缺陷本身**
（F1-F4 處置表、第九節的複核表、我第一輪的第四節與 F3、兩份 stage report），
**沒有任何一處仍被當成 `site_tldr` 欄位記錄的出處**。implement 的說法成立。

#### 自我引用補章節錨點：**是部分改善，不是修好**

行號 45 與 53 **仍然寫在文字裡**，往後只要在它們上方插入任何內容就會再次失準——
錨點並沒有讓數字停止漂移，它讓漂移**可復原**：讀者發現行號對不上時，
還能靠 `## 相依關係 第二個項目符號`／`## Risk evidence 首句` 找到目標。
真正不會漂移的寫法是**只留錨點、不留行號**。
`TODO.md` 的 `P3-7` 就是正確示範：票內三處（第 161、1170、1196 行）都以**名稱**引用，
不帶行號，所以 G1 那個錯行號沒有傷到任何一處載重引用。

### 四、數字：六組全部原值保留

不重驗，只確認沒被動到。**用 cycle 2 的刪除行當證據**（共 15 行刪改），
逐行看過：12 行是引用行號修正或 `status` 欄位，2 行是 AC-6 的 `Verified by:`，
**只有 1 行含承重數字**——就是 F1 要改的那一行。

| 數字 | 現行值 | 狀態 |
|---|---|---|
| 合計 24 欄（8＋9＋7） | 第 493 行 `**合計要手動建立 24 欄**（8＋9＋7）` | ✅ 未動 |
| 安全前綴 9／窗口內 15 | 第 631、634 行 | ✅ 未動 |
| 59 列（40／15／4） | 第 692、848 行 | ✅ 未動 |
| 保護範圍 12／15 | 第 514 行「從 15 個降到 12 個」 | ✅ 未動 |
| 6 段連續選取 | 第 692、848 行 | ✅ 未動 |
| `d3` 單一風險點（第 4 列）、其餘 27 列 | 第 661、662 行 | ✅ 未動 |

**S7（12 個保護範圍）與 S8（6 段、59 列）整個區塊逐字未動**（`diff -q` 無差異，30 行）。

**F1 改對了**：第 661 行現為「刪掉它，其後 **13 列（第 5-17 列）**的指紋全變」，
與我第一輪實算的結果（`d3` 占序號 3，其後的 `Approved` 列為第 5-17 列共 13 列）**逐字相符**。
「其後 14 列」只殘留在兩處 meta 描述（F1 處置表、stage report），那是應該保留的。

**`review_decision` 四個欄號確為排序差異，不是矛盾。** 我自己在兩輪中把四個值都跑出來過：

| 值 | 來自哪個排序／分頁 | 我在哪一輪實測 |
|---|---|---|
| 第 12 欄 | 第三節「建議排序」的 `Track 1_history` | 第一輪 |
| 第 15 欄 | S2／S4 分階段排序的 `Track 1_history` | 兩輪都測到 |
| 第 18 欄 | S2／S4 排序的 `Track 2_discussion` | 本輪 |
| 第 6 欄 | `site_tldr`（兩種排序皆同，因為它沒有安全前綴） | 兩輪都測到 |

AC-6 現在明寫「**不要逐字比對引號內的內容，也不要綁欄號**」並列出其中兩個值，
判準本身也不含欄號——**足以讓 captain 與工程不被這四個值困惑**。

### 五、本輪的新發現

**G1（Polish）`TODO.md` P3-7 的行號錯，而且它在第九節的複核表裡被標成 ✅。**
第九節寫「| `TODO.md` P3-7 | `chapter` 欄位設計已被放棄 | ✅ 標題在第 **865** 行，存在 |」。
實讀：`### P3-7　chapter 欄位設計已被放棄` 在 **第 905 行**；
第 865 行是 **P3-4 的第 2 點**「`opposing_views` 攤平成 `Track 2_opposing` 分頁」，與 `chapter` 無關。
- 已釋出使用者與正常流程：任何人依第九節的表覆核引用（FO、captain、下一輪 worker）。
- 可觀察到的損害：**實質宣稱是對的**——P3-7 存在，內容確實是「`chapter` 設計已被放棄」；
  錯的只是當作證據的那個行號。照 865 去看會看到不相干的 `opposing_views`，
  可能誤以為 P3-7 不存在。**票內三處對 P3-7 的載重引用（第 161、1170、1196 行）都以名稱引用、不帶行號，所以沒有任何載重引用被打壞。**
- 影響的 AC 或不可協商邊界：無。`chapter` 的存廢本票明列為 Out of scope。
- 觸發證據：`grep -n 'P3-7' TODO.md` → `905:### P3-7　chapter 欄位設計已被放棄`；
  `sed -n '865p'` → `  2. **opposing_views 攤平成 Track 2_opposing 分頁** …`。
- 提議：**Polish**／任務內／`fix`（865 改 905）。**這是 31 列中唯一一列錯的**——我全查完了，不是抽樣。

**G2（Polish）「31 處」是一種引用寫法的快照，不是票內位置引用的全集。**
我自己重新抽取全票的引用並與那 31 列比對：**掃描當下存在的 `檔名:行號` 形式，一處都沒漏**。
但有兩個範圍外的缺口，兩者我都實讀過、**內容都是對的**：
- `sync-content.mjs:294`（F2 訊息樣板）是 **cycle 2 自己這一輪新增的引用**，加在掃描之後，不在表中。實讀第 294 行確為該 `addError` 樣板 ✅。
- `檔名 第 N 條／第 N 節` 這一族不在掃描範圍：`AGENTS.md 第 1 條`（實讀為 `### 1. 不要自己執行內容同步`，票內「成功時會直接覆寫 `src/data/`，違反 AGENTS.md 第 1 條」**成立** ✅）、`design.md 第五節`（實讀為 `## 五、更新流程與施工順序`，票內「第五節施工順序表」**成立** ✅）。
- 已釋出使用者與正常流程：往後任何人把這張表當成「引用已全部驗過」的依據。
- 可觀察到的損害：目前為零——範圍外的三處實際都正確。風險在方法：**同一輪新增的引用不會出現在該輪的清單裡**。
- 影響的 AC 或不可協商邊界：無。
- 觸發證據：本節第三小節的獨立抽取；`grep -n '294' `、`grep -n 'AGENTS.md 第'`、`grep -n '第五節'`。
- 提議：**Polish**／任務內／`fix`（把 `sync-content.mjs:294` 與 `檔名 第 N 條／第 N 節` 一族補進表，並註明表的適用時點）。

**G3（Deferred risk）S3 判定表第 1 列的前兩個條件，誤刪列也會同時滿足；擋住它的只有第三個條件。**
第 1 列是「main exit 0 **且** `diff` 只落在那三個內容欄或那 59 列的發布內容 **且** 編輯台確認是有人正常填稿」→ 重新量 baseline。
我實測情境 B（部署時誤刪一列已核可的列）：**main exit 0**，且 diff 完全落在「那 59 列的發布內容」之內
——前兩個條件都成立。唯一擋住它的是第三個條件「編輯台確認是有人正常填稿」。
表**照寫是對的**（`且` 明確），但若有人把 diff 位置當成充分條件就會重量 baseline，
**把掉掉的那一列一起烤進新基準，之後 AC-1 反而會通過**。
- 已釋出使用者與正常流程：階段一結束、S3 的 sha256 對不上時，工程照表判斷。
- 可觀察到的損害：對錯誤的內容重新設基準，AC-1 從此失去偵測能力（最壞情況：少一筆內容靜默上線）。
- 影響的 AC 或不可協商邊界：**AC-1**（逐字 sha256）與 **AC-2**（筆數 40／16 為硬條件）。
- 觸發證據：情境 B 實測——main exit 0、印出 `已寫入 src/data/history.json（**39 筆**）`、
  AC-3 的 id 比對印出 `⛔ 少了:["h1"]`、diff 318 行首行為 `"id": "h1" → "id": "h4"`。
- 提議：**Deferred risk**（需要「先誤刪、再誤判」兩步才成立）／任務內／`fix`：
  在第 1 列的條件再加一項**機器可判**的前置——「main 印出的筆數仍是 40／16，且 AC-3 的 id 比對仍為一致」。
  我實測這兩項**都會抓到情境 B**，成本是把 AC-3 那段指令提前跑一次。
  升級為 Material 的條件：S3 真的出現 sha256 不符，而工程在未跑筆數／id 比對的情況下重量 baseline。

**G4（FO 事項，非 implement 的缺失）`### Feedback Cycles` 是空的。**
第 1185 行有 heading，但底下沒有任何 `- Cycle 1: …` 行，而本輪是第 1 個修正回合。
stage 定義寫明「The First Officer appends one `- Cycle {N}: ...` line ... per correction round」。
另該 heading 目前放在 `## Documentation impact` 的末尾，不是獨立的頂層小節。
- 提議：**Polish**／**FO 所有**（worker 不自行補寫他人負責的記錄）／`route for decision`。

### 六、未越界

| 項目 | 結果 |
|---|---|
| diff 基準 | **自己算**：`git merge-base main HEAD` ＝ `384ca7a3c…`（未沿用任何記憶中的 SHA） |
| 整條 branch 動到的檔 | **只有** `docs/constitution-features/050-ssot-approval-deployment.md` |
| `src/`、`scripts/` | **零變動**（`git diff --stat $MB HEAD -- src/ scripts/` 無輸出） |
| `src/data/*.json` | main／050 HEAD／工作區**三者 sha256 相同**（`4d1992e3…`／`4071978a…`） |
| `npm run sync-content` | 未對 repo 執行。main 的同步只在 `mktemp -d` 沙箱跑，餵本機 fixture |
| 040 worktree | `git status` 空，HEAD 仍為 `a51b5d9` |
| 正式 Google 試算表 | **本輪零存取**：沿用第一輪的快照，未發出任何新請求 |
| `sort`／`uniq` 判定中文 | 未使用。去重與計數一律 Node `Map`／`grep -o … \| wc -l` |
| `awk strftime` | 未使用 `awk` 做任何判斷 |

**關於「implement 本輪連讀都沒有讀試算表」**：這是網路行為的否定命題，
我無法從本機狀態證實或否證，**不宣稱已驗證**。可以說的是它**與產出一致**——
implement 本輪需要的欄位標題，票內第一節早已逐字記載，
重跑 main 同步只需本機 fixture，不需要再讀一次試算表；
票內也沒有出現任何第一輪未記載的新資料。

### 七、裁決

**PASSED。**

四筆修正全部是真的修正，沒有一筆「看起來修了其實沒修」。
F2 最關鍵的一格——**合法 fixture 餵進新判準仍判失敗**——通過了，
新判準沒有被放寬成恆真。F4 的 `diff` 指令指對地方，二分判定表在三個真實情境下
確實分得出來。F1 的 13 與我自己實算的結果逐字相符，F3 與三處新查出的同類全部指得對。
**六組承重數字原值保留，S7／S8 兩個表逐字未動。**

新發現四筆，沒有一筆改變 captain 現在正在建的那 9 欄安全前綴，
也沒有一筆改變欄名、欄數或列號——**captain 可以繼續。**
最值得處理的是 **G3**：S3 判定表的前兩個條件擋不住誤刪列，
補一項「筆數仍是 40／16 且 AC-3 的 id 比對仍一致」就能補上，我已實測這兩項都抓得到。
**G1** 是那張 31 列複核表裡唯一一列錯的（P3-7 在 905 不在 865），
實質宣稱正確、載重引用未受影響。**G2** 指出的是方法而非結果：
同一輪新增的引用不會出現在該輪的清單裡——`sync-content.mjs:294` 就是這樣漏的。

## Stage Report: verify (cycle 2)

- DONE: F2（最重要，發生在窗口內）自己架 fixture 重跑 main 同步取得真實輸出，確認新判準認得、舊逐字判準認不得；確認訊息結尾確有 `檢查是否打錯字。`；**跑兩個 falsifying change**，其中 (b) 餵合法 fixture、新判準必須同樣判失敗；確認 AC-6 的要求文字一字未動。
  **全部通過。** 沙箱重跑得逐字輸出 `第 15 欄的標題「review_decision （由 Review 選單寫入）」對不到任何預期欄位。檢查是否打錯字。`，與票內寫入 AC-6 的字串**逐字相同**；`sync-content.mjs:294` 實讀確為該 `addError` 樣板。新判準認得它、舊判準 `「review_decision」` 找不到（F2 病灶重現）。否證 (a)：換回舊 `grep` 立刻判失敗。**否證 (b)（關鍵格）：合法 fixture（安全前綴 9 欄、main exit 0、無標題錯誤）餵進新判準，判失敗**——新判準沒有被放寬成恆真。另補一個自己的否證：抓取失敗類錯誤同樣 exit 1 但 `grep` 印 ⛔，兩個條件合起來才判得準，票內兩者都寫了。要求文字：把 `## Acceptance criteria` 整段逐區塊 diff，**AC-1 至 AC-5 逐字未動**；AC-6 僅 `Verified by:` 與「design stage 已實測」末句變動（後者原寫「錯誤訊息與上面逐字相同」，改寫後已成假，屬必要連帶修正且已揭露），**AC-6 的標題、「會怎麼失敗」、「這一項的用意」均未出現在 diff 中**。
- DONE: F4（S3 的 `diff` 指令自己跑一次確認指對地方；判斷二分判定表照著真的分辨得出來；確認 AC-1 條文完全未動、F4 的修改全部落在 S2／S3）。
  **指對地方。** 以 `mktemp -d` 真的建 `$SANDBOX`、逐字照跑：exit 0，兩個 JSON 確實寫進 `$SANDBOX/src/data/`（11788／26057 bytes），`git status` 確認 repo 未被碰，sha256 仍為 baseline，兩行 `diff` 皆無輸出。**判定表不是裝飾品**：三個真實情境落在不同格子且訊號差距很大——A 編輯填 `chapter`（exit 0，diff **只有 1 行**且欄名就印在 diff 裡）→ 第 1 列；C 欄名打錯（**exit 1**，JSON 未產生）→ 第 2 列首句。**B 誤刪一列已核可列另立為 G3**（exit 0 且 diff 落在那 59 列之內，前兩個條件都滿足）。AC-1 逐字未動（已隨第一項確認）；cycle 2 的 15 行刪改中無一行屬於 AC-1，F4 的修改全部落在 S2／S3。
- DONE: F1／F3 及其擴大掃描——抽樣複驗三處新查出的同類與 `TODO.md:127→156`；抽驗其餘 27 處；判斷「全票 31 處」這個集合是否完整；判斷自我引用補章節錨點是否真的解決漂移。
  三處新查出的同類**全部成立**：`editor-onboarding.md` 430 是順序句、434 才是「編輯權限已經開出去…工作量比原設計預估的大」；`040-…md` 221 是空行、290 才是 Out of scope 原句；本票 50 是空行、53 才是 spike 句。`TODO.md` 127 空行、156 為該記錄。本票「第 45 行」現仍正確。**其餘 27 處我沒有抽樣，逐一實讀全查完——26 處通過，查出第 5 處錯（G1：P3-7 在第 905 行不在 865）。** 集合完整性：獨立重新抽取全票引用後比對，**掃描當下的 `檔名:行號` 一處都沒漏**，但有兩個範圍外缺口（G2）——`sync-content.mjs:294` 是 cycle 2 自己新增、加在掃描之後；`AGENTS.md 第 1 條`／`design.md 第五節` 屬 `檔名 第 N 條／第 N 節` 一族不在掃描範圍，三處實讀**內容都正確**。錨點：**是部分改善不是修好**——行號 45／53 仍寫在文字裡，上方一插入內容就會再失準；錨點買到的是**可復原**而非不漂移。真正不漂移的寫法是只留錨點不留行號，`P3-7` 以名稱引用就是正確示範，也正因如此 G1 的錯行號沒傷到任何載重引用。
- DONE: 數字與未越界——確認六組數字原值保留；判斷 `review_decision` 四個欄號確為排序差異；diff 基準自算；確認 `src/` 零變動、`src/data/*.json` 與 main 相同、未跑 `sync-content`、未動 040 worktree、正式試算表零存取。
  **六組全部原值保留**：以 cycle 2 的 15 行刪改當證據逐行看過，**只有 1 行含承重數字**（即 F1 的 14→13）；24（8＋9＋7）、9／15、59（40／15／4）、12／15 個範圍、6 段、`d3` 第 4 列與其餘 27 列均未動，**S7 與 S8 整個區塊逐字未動**（30 行 `diff -q` 無差異）。F1 改對了：第 661 行現為「其後 13 列（第 5-17 列）」，與我第一輪實算逐字相符。四個欄號**確為排序差異**：12（建議排序 Track 1）、15（S2／S4 Track 1）、18（S2／S4 Track 2）、6（`site_tldr`，兩種排序皆同，因它沒有安全前綴）——四個值我在兩輪中都親自跑出來過；AC-6 已明寫不要綁欄號且判準本身不含欄號，足以不讓人困惑。未越界：diff 基準**自算**為 `384ca7a3c…`（未沿用記憶中的 SHA）；整條 branch 只動票檔一個；`src/`／`scripts/` 零變動；`src/data/*.json` 在 main／050 HEAD／工作區**三者 sha256 相同**；main 同步只在 `mktemp -d` 沙箱餵本機 fixture 跑；040 worktree `git status` 空且 HEAD 仍為 `a51b5d9`；**本輪對正式試算表零存取**（沿用第一輪快照，sha256 相同）。未用 `sort`／`uniq` 判定中文，未用 `awk`。
  **對「implement 連讀都沒有讀試算表」不宣稱已驗證**——那是網路行為的否定命題，無法從本機狀態證實；只能說它與產出一致（所需標題票內第一節已逐字記載，重跑只需本機 fixture，票內也未出現第一輪未記載的新資料）。

### Summary

四筆修正**全部是真的修正**，沒有一筆「看起來修了其實沒修」。

F2 最關鍵的一格通過了：把一份**沒有標題錯誤的合法 fixture** 輸出餵進新判準，
它**同樣判失敗**——新判準不是被放寬成恆真，它仍然會拒絕。
真實輸出與票內寫入 AC-6 的字串逐字相同，`sync-content.mjs:294` 的樣板也核對無誤。
**AC-1 至 AC-5 逐字未動，AC-6 只動 `Verified by:` 與一句必要的連帶修正。**

F4 的 `diff` 指令我逐字跑過，確實寫進 `$SANDBOX/src/data/` 而非 repo。
那張二分判定表**不是裝飾品**——三個真實情境落在不同格子，訊號差距很大
（1 行 diff／318 行 diff／exit 1）。六組承重數字原值保留，S7 與 S8 逐字未動。

新發現四筆，**沒有一筆改變 captain 正在建的那 9 欄，也沒有一筆改變欄名、欄數或列號**。
最值得處理的是 **G3**：S3 判定表第 1 列的前兩個條件，**誤刪一列已核可列也會同時滿足**
（實測 exit 0、diff 落在那 59 列之內），擋住它的只有第三個人工條件；
若有人把 diff 位置當充分條件而重量 baseline，就會把掉掉的那一列烤進新基準，
AC-1 之後反而會通過。補一項機器可判的前置（筆數仍是 40／16、AC-3 的 id 比對仍一致）即可，
我實測這兩項都抓得到（該情境印出 `39 筆`、`少了:["h1"]`）。

**G1** 是那張 31 列複核表裡唯一一列錯的——`TODO.md` 的 P3-7 在第 **905** 行不在 865
（865 是 P3-4 的 `opposing_views`）；實質宣稱正確，且票內三處都以**名稱**引用 P3-7、不帶行號，
所以沒有載重引用被打壞。**這一列是我逐一查完 31 列查出來的，不是抽樣。**
**G2** 指的是方法不是結果：掃描當下的 `檔名:行號` 一處沒漏，
但同一輪新增的引用不會出現在該輪清單裡——`sync-content.mjs:294` 正是這樣漏的；
`AGENTS.md 第 1 條`／`design.md 第五節` 則整族不在掃描範圍（三處實讀內容都正確）。
**G4** 是 FO 事項：`### Feedback Cycles` 有 heading 但沒有 `- Cycle 1` 行。

## Stage Report: implement (cycle 3)

- DONE: G3（最優先，captain 很快會跑 S3）S3 判定表第 1 列再加一項機器可判的前置——「main 印出的筆數仍是 40／16，且 AC-3 的 id 比對仍為一致」。兩個方向都驗：(a) 情境 B（誤刪 `h1`）必須擋住；(b) 情境 A（編輯合法填 `chapter`）必須放行。promote-to-material 條件一併記入。修改落在 S3，不得碰 AC-1／AC-2 條文。
  第十節第一小節。S3 現在先跑兩項機器檢查再看 `diff`：**檢查①筆數**（`（40 筆）`／`（16 筆，含 tldr）`）、**檢查②id 清單**（AC-3 的指令原樣提前跑，`OUT` 指向沙箱）。分辨表由兩列變三列，中間新增一列專門處理「檢查①或②沒通過」→ 判「有列掉了或被換掉」→ **絕對不要重量 baseline**，並寫明後果（把掉掉的那一列烤進新基準、AC-1 之後反而會通過、最壞情況少一筆內容靜默上線）。表頭上方另加 ⚠️ 明寫「光看 exit code 與 diff 位置，誤刪與合法填值長得一樣」。promote-to-material 改為兩條並列，第 2 條即 verify 寫的「S3 真的出現 sha256 不符，而工程在未跑檢查①②的情況下重量 baseline」。
  **五個情境實測，兩個方向都成立。** 用第一節記載的真實標題造階段一完成後的 fixture（Track 1 十四欄、Track 2 十七欄、`site_tldr` 五欄），列數刻意造成與正式表相同（42／43／4 列資料、40／15／4 列 `Approved`），所以 main 印出的就是 `（40 筆）` 與 `（16 筆，含 tldr）`。**(b) 放行**：情境 A（填 `chapter`）與 A2（填 `owl_depth_comment`）筆數與 id 都通過，仍走得到「重新量 baseline」那一格。**(a) 擋住**：情境 B（刪 `h1`）印 `（39 筆）`＋`⛔ 少了:["h1"]`；B2（刪 `d1`）印 `（15 筆，含 tldr）`＋`⛔ 少了:["d1"]`。**舊前置在五個情境全部放行**，證實 G3 的前提。
  falsifying change：情境 B3（刪 `h1` 又新增已核可的 `h99`）**筆數仍是 40 筆**，只有 id 比對抓到（`⛔ 少了:["h1"] 多了:["h99"]`）——證明兩項檢查缺一不可，表裡寫「檢查①**與**②都通過」不是冗贅。
- DONE: G1（Polish）`TODO.md` 的 P3-7 在第 905 行不在 865。
  第十節第二小節。**這一筆比「行號寫錯」複雜，實測結果與 verify 不同但兩邊都對**：`TODO.md` 是票內唯一在 main 與本 branch 之間有差異的被引用檔——main 多 40 行，插在第 596-635 行（features 065／066／049 的兩筆 P1-9）。所以 P3-7 在 **main 是 905**（verify 讀的）、**在本 worktree 是 865**（cycle 2 讀的），`905－865＝40` 與插入行數相符。**處置不是把 865 改成 905，而是改成名稱引用**，並把成因寫進該列。順帶把票內最後一處 `TODO.md:行號` 也改掉：步驟 3 的表與第三節的 `TODO.md:156`（cycle 2 對 F3 的修正）改為 `TODO.md` 的 P1-5「附帶問題已解決」——`:156` 目前兩邊都對，但那是因為差異從第 596 行才開始，是運氣不是保證。另查了其他七個被引用的檔（`editor-onboarding.md`、`2026-08-31-content-pipeline.md`、`design.md`、`040-…md`、`AGENTS.md`、`CLAUDE.md`、`scripts/sync-content.mjs`），**兩個 checkout 都是同一個 blob**，行號無歧義，本輪不動。
- DONE: G2（方法）把兩個範圍外缺口寫進票內掃描說明並把範圍擴到第二族。不必追求「掃描當下零漏」，要修的是清單沒有寫明自己的涵蓋邊界。
  第九節表頭補上**三條邊界**：①它是掃描當下的快照，同一輪之後新增的引用不會出現在裡面（`sync-content.mjs:294` 正是這樣漏的——cycle 2 自己為 F2 新增、加在掃描之後，所以「零漏」與「涵蓋全票」不是同一件事）；②它原本只掃 `檔名:行號` 一族；③行號只在「那個檔在兩個 checkout 相同」時才有唯一答案。表補 5 列，合計 36 列。`AGENTS.md` 第 1 條、`design.md` 第二節的欄位表、`design.md` 第五節施工順序表、`sync-content.mjs:294` **四處實讀通過**。
  **第 5 列是本輪新查出的錯，而且比 G1 嚴重：引錯的是檔名。** 票內兩處寫「`design.md` 明訂／禁止舊列不能批次補造指紋」，但 `design.md` **完全沒有這一條**（全檔 `grep 補造` 零命中；`指紋` 只出現 5 次，全在修訂紀錄與一條 041 的註記裡）。該規則實際在 `editor-onboarding.md:432-433`、`040-…md:173`、040 worktree 的 `operations.md:13`。措辭與 `editor-onboarding.md:432-433` 逐字最接近，兩處都改指它；步驟 7 另把「手動貼上或用公式填 `approved_fingerprint`」標明為本票的舉例而非原文。**實質規則與 captain 要做的事一個字都沒變**，改的只是「這條規則寫在哪裡」。這一筆是靠 G2 擴大範圍才浮出來的：那兩處引用**不帶行號也不帶節號**，所以既不在第一族也不在第二族——**第三族是「只寫檔名、不寫位置」的引用**，已納入表中。
- DONE: 採納 verify 對錨點的評價並寫進票內，並判斷那兩處自我引用要不要索性拿掉行號、說明理由。
  第十節第四小節。**採納**：補章節錨點是部分改善不是修好——行號仍寫在文字裡，上方一插入內容就再失準；**錨點買到的是「可復原」而非「不漂移」**。**判斷：那兩處自我引用的行號拿掉，只留錨點**（改為「本票 `## 相依關係` 的第二個項目符號」與「`## Risk evidence` 的首句」，另同步改了 Stage Report: design 裡的同一處引用）。四個理由：①自我引用最會漂移——cycle 2 光插入第九節就把 `## 相依關係釐清` 以下推了 117 行；②錨點已經夠精確，那兩個錨點各自只對應一句話，行號沒有增加精確度；③票內已有正確示範，三處 P3-7 以名稱引用，所以 G1 的錯行號沒打壞任何載重引用；④G1 又補了更強的理由——行號在兩個 checkout 可以有兩個合法答案。**不對稱處置已說明理由**：跨檔引用的行號保留，因為那七個檔兩邊同 blob、本票不會改它們、行號比章節名好查；`TODO.md` 是唯一例外已改名稱引用。**判準是「這個檔會不會在我引用它之後變動」，不是「行號一律不好」。**
- DONE: 未越界。
  **正式試算表零寫入零讀取**（本輪未發出任何 HTTP 請求；fixture 標題取自第一節已記載的實測值，內容列為合成）。**AC 區塊逐位元組未動**（`## Acceptance criteria` 整段與本輪之前比對逐字相同），G3 的修改全部落在 S3。**S7 與 S8 兩個區塊逐字未動**——與 S7／S8 誕生的那一版（`2e83adf`）以及本輪之前（`beb9b15`）**兩個基準都比過，373／535 bytes 逐字相同**。承重數字 24／9／15／59／12／6 原值保留。`Documentation impact` 與 `Out of scope` 逐字未動。**未代 FO 補寫 `### Feedback Cycles`**：該區塊逐位元組未動，Cycle 行數仍為 1。整條 branch 只動 `docs/constitution-features/050-ssot-approval-deployment.md` 一個檔；`git diff --stat $(git merge-base main HEAD) -- src/ scripts/` 無輸出；`src/data/*.json` sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`；未跑 `sync-content`（七次 main 同步全在 `mktemp -d` 沙箱、餵本機 fixture）；040 worktree 與主 checkout 的 `git status` 全程為空。diff 基準自算 `git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。未用 `sort`／`uniq` 判定中文字串，未用 `awk` 做任何判斷。

### Summary

三筆按 FO 授權修完，**G4 未動**——`### Feedback Cycles` 逐位元組未改，Cycle 行仍是 FO 寫的那一行。

**G3 是本輪的重點，因為 captain 正在建那 9 欄安全前綴、很快會跑 S3。**
原表的前兩個條件（main exit 0、`diff` 落在那 59 列之內）擋不住誤刪列——
我造了五個情境實測，**舊前置在五個情境全部放行，包含三種掉列**。
補上「筆數仍是 40／16」與「AC-3 的 id 比對仍一致」兩項機器檢查之後：
誤刪 `h1` 印 `（39 筆）`＋`少了:["h1"]`、誤刪 `d1` 印 `（15 筆）`＋`少了:["d1"]`，**都擋住**；
而編輯合法填 `chapter` 或 `owl_depth_comment` 兩種情形**都放行**，
仍然走得到「重新量 baseline」那一格——**不是把會誤判的路換成永遠停住的路**。
另外造了「刪一列又補一列」的情境：筆數仍是 40，只有 id 比對抓得到，
所以兩項檢查缺一不可。

**G1 的實測結果與 verify 不同，但兩邊都對，而這件事比原本那筆 finding 重要。**
`TODO.md` 是票內唯一在 main 與本 branch 之間有差異的被引用檔（main 多 40 行，插在第 596-635 行）。
P3-7 在 main 是第 905 行，在本 worktree 是第 865 行，差值正好等於插入的行數。
**所以「`TODO.md:行號`」在本票沒有唯一答案**——這不是查一次就能修好的錯，
它會隨讀者站在哪個 checkout 而改變。處置因此不是把 865 改成 905，而是改成名稱引用。

這也讓錨點那個判斷題有了明確答案：**那兩處自我引用的行號拿掉，只留錨點。**
verify 的評價是對的——錨點買到「可復原」，買不到「不漂移」，要不漂移就不能留行號。
但**跨檔引用的行號我保留**，理由寫進票內：那七個檔兩邊同 blob、本票不會改它們，
行號比章節名好查。判準是「這個檔會不會在我引用它之後變動」，不是「行號一律不好」。

**G2 擴大範圍又撈出一筆，而且比 G1 嚴重：`design.md` 引錯的是檔名不是行號。**
票內兩處說「`design.md` 明訂舊列不能批次補造指紋」，`design.md` 沒有這一條——
該規則在 `editor-onboarding.md:432-433`（另有兩份副本）。
實質規則與 captain 要做的事一個字都沒變，但讀者照票去 `design.md` 找會找不到。
這兩處**不帶行號也不帶節號**，所以前兩輪掃描都掃不到——
第九節現在明寫第三族是「只寫檔名、不寫位置」的引用，並已納入。

## verify stage 第三輪：G1-G3 修正複驗（2026-09-24）

diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。
**本輪對正式試算表零存取**，沿用第一輪的快照（sha256 未變）。

### 一、G1 —— **我上一輪判錯了**，implement 的解釋成立

**先更正我自己的結論。** 我上一輪寫「P3-7 在第 905 行不在 865」，
但我讀的是**主 checkout** 的 `docs/health-check/TODO.md`，而本票活在 050 這個 branch 上。
865 對 cycle 2 站的位置是對的，**G1 作為 finding 不成立**。

實測（兩個 blob、兩個行號、一個差值）：

| | blob | 行數 | P3-7 |
|---|---|---|---|
| `main` | `d0c7119a…` | 1046 | 第 **905** 行 |
| `HEAD`（050 branch） | `52d96f5c…` | 1006 | 第 **865** 行 |

`git diff HEAD main -- docs/health-check/TODO.md` 只有一個 hunk：`@@ -593,6 +593,46 @@`，
**新增 40 行、刪除 0 行**，插入內容是 065／066／049 的兩筆 P1-9。
`905 − 865 = 40`，**差值正好等於插入行數** ✅。

**所以結論比原 finding 重要：`TODO.md:行號` 在本票沒有唯一答案。**
它不是查一次能修好的錯，它隨讀者站在哪個 checkout 而變。改成名稱引用是對的處置。

**把最後一處 `TODO.md:156` 也改成名稱引用的理由成立。** 實測第 156 行在兩個 checkout
逐字相同——但那正是因為差異從第 596 行才開始，**156 < 596 是巧合不是保證**。
下一次若有人在 TODO.md 前段插入內容，`:156` 立刻兩邊不同。理由站得住。

**「其他七個被引用檔兩個 checkout 同 blob」抽驗通過**：

| 檔 | main vs HEAD |
|---|---|
| `2026-09-03-editor-onboarding.md` | ✅ 同 blob `9424cc529` |
| `2026-08-31-content-pipeline.md` | ✅ 同 blob `b6c6656c4` |
| `design.md` | ✅ 同 blob `6a0ec1845` |
| `040-approval-content-version-binding.md` | ✅ 同 blob `2b5da9b89` |
| `AGENTS.md` | ✅ 同 blob `53a81d010` |
| main `sync-content.mjs` | ✅ 同 blob `94dd3030a` |

### 二、G2 —— 成立，而且引錯的確實是**檔名**

**`design.md` 真的沒有這條規則。** 全檔實測：

- `grep 補造` → **零命中**
- `grep 批次` → **零命中**
- `grep 指紋` → 7 次，全部在別的脈絡（第 442、569、571、572、576 行：實測記錄、公式衍生 `status`、同步端重算、尚未實作）

**`editor-onboarding.md:432-433` 確實是措辭最接近的出處**，而且接近到近乎逐字：

```
432: 另外舊列不能批次補造指紋。
433: 部署新欄位後既有的 `Approved` 會全部先顯示 `Needs review`，需要編輯台重新核可一輪。
```

票內原句是「`design.md` 明訂舊列不能批次補造指紋——部署新欄位後既有的 `Approved` 會**全部先顯示 `Needs review`**」
——兩句的結構與用詞與上面這兩行對得上，**這是它真正的出處**。
另兩處佐證也實讀通過：`040-…md:173`「舊列不能批次補造指紋。…」、
040 worktree `operations.md:13`「不要批次替舊列補造指紋。部署後要逐列重新核可。」

全 repo `grep -rl 補造` 只命中三個檔（`editor-onboarding.md`、040 的票、本票），
**`design.md` 確認不在其中**。

**實質規則沒變，captain 要做的事一個字都沒變。** 這一筆的價值在於它證明了
第三族（只寫檔名、不寫位置）真的存在且會出錯。

### 三、G3 —— 五個情境我全部親手跑過，兩個方向都成立

沙箱跑 main 的同步，逐一套用五個 fixture。**檢查①** 取 main 印出的兩行筆數，
**檢查②** 是 AC-3 的比對指令原樣提前跑。**舊前置**＝ G3 之前的判準（exit 0 ＋ diff 位置）。

| 情境 | main exit | 檢查①筆數 | 檢查②id 清單 | 新表判定 | 舊前置 |
|---|---|---|---|---|---|
| **A**　編輯合法填 `chapter` | 0 | ✅ （40 筆）／（16 筆，含 tldr） | ✅ 一致 | **放行** → 重新量 baseline | 放行 |
| **A2**　編輯合法填 `owl_depth_comment` | 0 | ✅ （40 筆）／（16 筆，含 tldr） | ✅ 一致 | **放行** → 重新量 baseline | 放行 |
| **B**　誤刪 `h1` | 0 | ⛔ （**39 筆**）／（16 筆） | ⛔ `少了:["h1"]` | 擋住 | ⚠️ **放行** |
| **B2**　誤刪 `d1` | 0 | ⛔ （40 筆）／（**15 筆**） | ⛔ `少了:["d1"]` | 擋住 | ⚠️ **放行** |
| **B3**　刪 `h1` 又補一列已核可的 `h99` | 0 | **✅ （40 筆）／（16 筆）** | ⛔ `少了:["h1"] 多了:["h99"]` | 擋住 | ⚠️ **放行** |

**B3 這一格成立，而且它就是兩項檢查缺一不可的證明**：檢查①**完全通過**（筆數真的還是 40），
只有檢查②開火。表裡寫「檢查①**與**②都通過」不是冗贅，**拿掉②就擋不住 B3**。

**A 與 A2 兩格同樣通過**——兩項檢查都放行，走得到「重新量 baseline」。
新判準**沒有**把會誤判的路換成永遠停住的路，captain 過得去。

**implement 宣稱的前提也成立**：舊前置在五個情境**全部放行**，包含 B／B2／B3 三種掉列。
G3 之前，誤刪一列真的會一路走到「重新量 baseline」。

**修改全部落在 S3。** `## Acceptance criteria` 整段與 cycle 3 的前一個 commit（`beb9b15`）
**逐位元組相同（7009 bytes）**——AC-1、AC-2、AC-3 的條文一個字都沒動。

### 四、錨點的不對稱處置 —— 方向對，但判準的適用範圍還缺一塊

**自我引用拿掉行號、只留錨點：正確。** 四個理由都成立，其中第 3 點（P3-7 以名稱引用，
所以 G1 那個錯行號沒打壞任何載重引用）我實測確認——票內三處 P3-7 都不帶行號。

**跨檔保留行號、判準為「這個檔會不會在我引用它之後變動」：判準是對的，但它自己沒有被貫徹到底。**

邊界 3 用的測試是「兩個 checkout 是不是同一個 blob」。**這個測試對三個被引用的檔根本不適用**，
因為它們**不在 main 裡**：

| 檔 | 在 main？ | 票內以行號引用幾處 |
|---|---|---|
| `scripts/apps-script/approval-workflow.gs` | ⛔ **不在 main** | 9 處（5／6／12-14／76-80／79／127-144／159／219／220） |
| `docs/content-pipeline/operations.md` | ⛔ **不在 main** | 2 處（12／15-25） |

這兩個檔只活在 `spacedock-ensign/040-…` 這個 branch 上，而 **040 目前 `status: review`、
`completed:` 空白、尚未合併**——它正是「會在我引用它之後變動」的典型。
拿「兩個 checkout 同 blob」去測它們，**測不出東西，因為根本沒有第二個 checkout 可比**。

**票庫裡已經有正解**：044 處理同一個問題時，把 `.gs` **釘到 commit `093cd01`**
（044 票內第 1068 行記載該 commit 的 `.gs` sha256）。
建議 050 比照——把那 11 處的依據釘到 040 worktree 現在的 HEAD `a51b5d9`，
或在行號旁註明 commit。這不是新規則，是沿用本票庫既有做法。

### 五、本輪的新發現：**第三族不是最後一族**

被問到「三族完整了嗎」。**不完整。有第四族，而且它現在正咬著這張票。**

**第四族：引用另一張票，只寫 feature 編號——沒有檔名、沒有行號、沒有節號。**
票內這樣的引用至少有 11 處（`feature 044` 9 處、`feature 043` 2 處）。
它的失效模式和前三族**不同類**：前三族是「指到錯的位置」，
第四族是「**被引用的那張票，狀態變了**」。行號檢查永遠查不到它。

**H1（Material・需 captain 裁決）feature 044 已於 2026-09-21 完成並通過，050 的 🔴 裁決前提已經不成立。**

票內「相依關係釐清」寫：

> 044 的前置是「一份隔離測試表 + 兩個 Google 帳號」，這兩項卡在人不卡在程式，**目前不存在**。
> 鏈條是：`兩個帳號 → 044 → 050 → 040 合併`，而**鏈條頭卡住**。

實讀 `docs/constitution-features/_archive/044-approval-permission-two-account-probe.md`：

```
status: complete          verdict: PASSED          score: 0.96
completed: 2026-09-21T18:35:02Z                    pr: pr-merge:36
```

**044 早在三天前就完成了，而且已經歸檔到 `_archive/`。**
它的 AC-3 逐字是「**投稿者對八個審核欄位一格都改不到**」——
與 050 的 AC-3／AC-4 是同一個命題；044 票內第 130 行自己也寫明
「`050-…md` 的 AC-3…與本票的第二個命題是同一件事」。

- 已釋出使用者與正常流程：captain 正在部署，隨時會被要求解這個 🔴。
- 可觀察到的損害：**三個選項全部失真。** 選項 A（建議）的代價寫「040 合併再延一輪、要多開一個帳號」
  ——**那個代價已經付掉了**；選項 B 是「明文豁免 `operations.md:12` 與 040 Out of scope 的但書，
  直接在正式表部署」，代價欄自己寫「**部分不可逆**…錯誤發生在 40 筆已上線內容的唯一來源上」
  ——captain 若為了省下那個不存在的延期而選 B，**是拿 40 筆已上線內容去換一個已經不用付的成本**。
- 影響的 AC 或不可協商邊界：`operations.md:12` 這條**保護邊界的觸發條件已滿足**
  （「兩帳號隔離 probe 完成前，不要把 Apps Script 套到正式 SSOT」——probe 完成了）；
  AC-4 的「前置：需要第二個 Google 帳號…與 044 的資源前置是同一個」同樣過期。
- 觸發證據：上列 front matter；`ls docs/constitution-features/` 無 `044`，檔案在 `_archive/`；
  歸檔 commit `66ed939 archive 044-approval-permission-two-account-probe (merge guard)`。
- **仍然真正開著的是什麼**：040 的 Out of scope 是「不上線正式 SSOT 設定，
  直到隔離測試表完成驗證**並由 captain 確認**」。probe 那一半完成了，
  **「由 captain 確認」那一半仍在 captain 手上**。所以這不是「可以直接開工」，
  而是「**要決定的東西和票內寫的不一樣了**」。
- 提議：**Material**／**任務不能獨佔這個決定**（只有 captain 能改已核可的範圍）／
  `route for decision`。任務內可以做的是**事實更新**：把 044 的 `complete／PASSED／2026-09-21／_archive/`
  寫進相依關係節，並重寫三個選項——A 的代價改為「已完成，無額外代價」、
  B 標記為「**不再有理由**」、剩下的真問題縮小為「captain 確認」這一步。
- **我自己前兩輪也沒查到這一條**，因為我和前兩輪的掃描一樣只盯著 `檔名:行號`。

**H2（Polish）表頭那三條邊界宣告，涵蓋不到它自己最新的失效模式。**
逐條對照 H1：

| 邊界 | 它防的是什麼 | 擋得住 H1 嗎 |
|---|---|---|
| 1　「掃描當下的快照」 | **本票之後新增**的引用（如 `sync-content.mjs:294`） | ⛔ 擋不住。044 是**舊引用**，變的是**被引用對象** |
| 2　「原本只掃 `檔名:行號` 一族」 | 語法形式不同的族（第二族、第三族） | ⛔ 擋不住。第四族連檔名都沒有 |
| 3　「行號只在兩個 checkout 同 blob 時唯一」 | **檔案**在不同 branch 的行號歧義 | ⛔ 擋不住。044 變的是 `status` 與**所在目錄**，不是行號 |

三條邊界有一個共同的隱含假設：**被引用的對象是一個「內容穩定、只有位置會變」的檔。**
第四族違反的正是這個假設。
- 提議：**Polish**／任務內／`fix`（補第四族與對應的檢查方式：
  引用另一張票時，**重讀它的 front matter `status`／`verdict`／`completed`**，而不是檢查行號）。

**H3（Deferred risk）步驟 6 把整列刪除的缺口推給 043，但 043 未定案，且照它現在的設計也擋不住單列誤刪。**
票內第 265 行：「本票不處理（見 Out of scope），由 feature 043（刪列跌幅門檻）在同步端擋。」
實讀 `043-sync-row-drop-threshold.md`：`status: design`，標題前綴「**待captain確認脈絡**」，
source 寫「先開票存證，**脈絡待確認後再決定是否進行**」——**這張票還沒決定要不要做**。
而且它的門檻是「**初步建議兩成**」且列在未決問題裡：
**刪 1 列／共 40 列 ＝ 2.5%，遠低於兩成**，所以即使 043 照現在的設計做出來，
**也擋不住我這一輪實測的情境 B**。
- 可觀察到的損害：讀者會以為整列刪除已經有人接手擋掉了，實際沒有。
- 反過來說**這張票自己已經有更好的防線**：S3 的檢查②在情境 B／B2／B3 全部抓到。
  所以要改的只是這句話的措辭，不是防線。
- 提議：**Deferred risk**／任務內／`fix`（把該句改為「043 尚未定案，且其跌幅門檻設計
  擋不住單列誤刪；本票的防線是 S3 的檢查①②」）。

**H4（Polish）跨檔行號的例外清單漏了只存在於 040 branch 的兩個檔。** 見第四節。
- 提議：**Polish**／任務內／`fix`（比照 044 釘 commit）。

### 六、未越界

| 項目 | 結果 |
|---|---|
| diff 基準 | **自算** `384ca7a3c…`，未沿用記憶中的 SHA |
| 整條 branch／cycle 3 動到的檔 | **都只有** `050-ssot-approval-deployment.md` 一個 |
| `src/`、`scripts/` | **零變動** |
| `src/data/*.json` | main／050 HEAD／工作區**三者 sha256 相同** |
| `npm run sync-content` | 未對 repo 執行；五個情境全在 `mktemp -d` 沙箱餵本機 fixture |
| 040 worktree | `git status` 空，HEAD 仍為 `a51b5d9`（三輪皆同） |
| 正式試算表 | **零存取**，沿用第一輪快照 |
| `## Acceptance criteria` | vs `beb9b15` **逐位元組相同（7009 bytes）** |
| S7／S8 | 與 `2e83adf`、`beb9b15` **兩個基準皆逐位元組相同**（593／759 bytes；位元組數與 implement 報的 373／535 不同是切片邊界不同，內容同一致） |
| `### Feedback Cycles` | vs `beb9b15` **逐位元組未動**，`- Cycle` 行數 **＝ 1**（FO 所寫，implement 未動）✅ |
| `Documentation impact`／`Out of scope` | 逐字未動 |
| 承重數字 | 24／9／15 欄、59 列、12／15 個範圍、6 段 **全部原值保留**（cycle 3 的 22 行刪改逐行看過，無一含承重數字） |
| `sort`／`uniq` 判定中文、`awk` | 皆未使用 |

### 七、裁決

**PASSED。**

G1／G2／G3 三筆都驗過，三筆都是真的修正：
G1 的解釋成立而**我上一輪的 finding 不成立**——`TODO.md` 在兩個 checkout 有兩個合法行號，
改名稱引用是對的；G2 成立，`design.md` 確實沒有那條規則，`editor-onboarding.md:432-433` 才是出處；
G3 五個情境全部親手跑過，**B3 證明兩項檢查缺一不可，A／A2 證明新判準沒有變成永遠停住**。
AC 整段逐位元組未動，S7／S8 與兩個基準皆相同，`Feedback Cycles` 未被代寫。

**但本輪最重要的不是這三筆，是第四族。**
「三族」不完整——**引用另一張票、只寫 feature 編號**是第四族，
它的失效模式是「被引用的票**狀態變了**」，三條邊界宣告一條都擋不住。

**H1 需要 captain 在解那個 🔴 之前先看到**：feature 044 已於 **2026-09-21 完成、PASSED、已歸檔**，
而票內仍把它寫成「前置不存在、鏈條頭卡住」。
三個選項因此全部失真——選項 A 的代價已經付掉，選項 B（豁免 probe 但書、直接在正式表部署，
票內自己標為「部分不可逆」）**已經沒有理由**。
真正還開著的只剩 040 Out of scope 的後半句「**並由 captain 確認**」。

## Stage Report: verify (cycle 3)

- DONE: G3（最要緊，captain 下一關就是 S3）親手跑五個情境，特別是 B3；A／A2 必須放行；確認舊前置在五個情境全部放行；確認修改全部落在 S3、未碰 AC-1／AC-2 條文。
  **五個情境全部親手跑過，兩個方向都成立。** **B3（刪 `h1` 又補一列已核可的 `h99`）成立且是關鍵**：檢查①**完全通過**（筆數真的還是 `（40 筆）`／`（16 筆，含 tldr）`），只有檢查②開火印出 `⛔ 少了:["h1"] 多了:["h99"]`——**拿掉檢查②就擋不住它**，所以表裡的「檢查①**與**②都通過」不是冗贅。**A／A2 同樣通過**：兩項檢查都放行，走得到「重新量 baseline」，新判準沒有把會誤判的路換成永遠停住的路。B 擋在 `（39 筆）`＋`少了:["h1"]`，B2 擋在 `（15 筆，含 tldr）`＋`少了:["d1"]`。**前提也成立**：舊前置（exit 0＋diff 位置）在五個情境**全部放行**，包含三種掉列——G3 之前誤刪一列真的會一路走到重新量 baseline。修改全部落在 S3：`## Acceptance criteria` 整段與 `beb9b15` **逐位元組相同（7009 bytes）**，AC-1／AC-2／AC-3 條文一字未動。
- DONE: G1 自己驗「`TODO.md:行號` 沒有唯一答案」；判斷把 `:156` 也改名稱引用的理由；抽驗其他七個被引用檔同 blob。
  **implement 的解釋成立，而我上一輪的 G1 不成立——已在正文更正。** 我讀的是主 checkout 的 `TODO.md`，本票活在 050 branch 上；865 對 cycle 2 站的位置是對的。實測：main blob `d0c7119a…` 1046 行、P3-7 在 **905**；HEAD blob `52d96f5c…` 1006 行、P3-7 在 **865**；`git diff` 單一 hunk `@@ -593,6 +593,46 @@`、**+40 −0**，`905−865=40` **差值正好等於插入行數**。`:156` 改名稱引用的理由**成立**：實測第 156 行兩邊逐字相同，但那正因 `156 < 596`（差異起點）——是巧合不是保證。其他六個被引用檔抽驗**全部同 blob**（editor-onboarding `9424cc529`、content-pipeline `b6c6656c4`、design.md `6a0ec1845`、040 票 `2b5da9b89`、AGENTS.md `53a81d010`、main sync-content `94dd3030a`）。
- DONE: G2 自己確認 `design.md` 真的沒有那條規則、`editor-onboarding.md:432-433` 是最接近的出處；判斷「三族」是否完整；判斷三條邊界是否涵蓋自己的失效模式。
  **G2 成立，引錯的確實是檔名。** `design.md` 全檔 `grep 補造` **零命中**、`grep 批次` **零命中**；`指紋` 7 次全在別的脈絡。`editor-onboarding.md:432-433` 近乎逐字（「另外舊列不能批次補造指紋。」＋「部署新欄位後既有的 `Approved` 會全部先顯示 `Needs review`，需要編輯台重新核可一輪。」），與票內原句結構用詞對得上，**確認是真出處**；`040-…md:173` 與 `operations.md:13` 兩處佐證亦實讀通過；全 repo `grep -rl 補造` 只命中三檔，`design.md` 確認不在其中。**「三族」不完整——有第四族（H1／H2）**：引用另一張票、只寫 feature 編號（票內至少 11 處），失效模式是「被引用的票**狀態變了**」而非「指到錯的位置」。**三條邊界一條都擋不住**，因為它們共用一個隱含假設「被引用的對象是內容穩定、只有位置會變的檔」。
- DONE: 判斷錨點的不對稱處置；未越界（AC 逐位元組、S7／S8 與兩基準、承重數字、`Feedback Cycles` 與 Cycle 行數、`src/` 零變動、試算表零存取、diff 基準自算）。
  **自我引用拿掉行號只留錨點：正確**，四個理由都成立（第 3 點我實測確認，票內三處 P3-7 皆不帶行號）。**跨檔保留行號：判準對，但沒貫徹到底（H4）**——邊界 3 用「兩個 checkout 同 blob」當測試，但 `approval-workflow.gs`（票內 9 處行號引用）與 `operations.md`（2 處）**根本不在 main**，只活在 040 branch，而 **040 `status: review`、`completed:` 空白、尚未合併**，正是「會在我引用它之後變動」的典型；票庫已有正解——044 把 `.gs` **釘到 commit `093cd01`**。未越界全部通過：整條 branch 與 cycle 3 都只動票檔一個；`src/`／`scripts/` 零變動；`src/data/*.json` main／HEAD／工作區三者 sha256 相同；五個情境全在 `mktemp -d` 沙箱餵本機 fixture；040 worktree 乾淨且 HEAD 仍為 `a51b5d9`；**正式試算表零存取**；S7／S8 與 `2e83adf`、`beb9b15` **兩個基準皆逐位元組相同**；**`### Feedback Cycles` 逐位元組未動且 `- Cycle` 行數 ＝ 1**；`Documentation impact`／`Out of scope` 逐字未動；承重數字 24／9／15／59／12／6 原值保留（cycle 3 的 22 行刪改逐行看過，無一含承重數字）；diff 基準自算；未用 `sort`／`uniq` 判定中文，未用 `awk`。

### Summary

G1／G2／G3 三筆都是真的修正。**G1 那一筆的更正方向是反的——錯的是我。**
`TODO.md` 在 main 與本 branch 是兩個 blob（1046 對 1006 行，差異是插在第 596 行起的 40 行），
P3-7 在 main 是 905、在本 worktree 是 865，**差值正好等於插入行數**。
865 對 cycle 2 站的位置是對的，改成名稱引用比改行號更正確。
G2 成立且引錯的是**檔名**——`design.md` 全檔 `補造`、`批次` 皆零命中。
G3 的五個情境我全跑過：**B3 的檢查①完全通過、只有檢查②開火**，這一格證明兩項缺一不可；
**A／A2 放行**，新判準沒有變成永遠停住；舊前置則在五個情境全部放行，含三種掉列。

**本輪最重要的不是這三筆。** 被問到「三族完整了嗎」——**不完整**。
第四族是「引用另一張票、只寫 feature 編號」，它的失效模式是**被引用的票狀態變了**，
三條邊界宣告一條都擋不住，因為三條都假設引用對象是「內容穩定、只有位置會變的檔」。

而第四族現在正咬著這張票：**feature 044 已於 2026-09-21 完成、`verdict: PASSED`、
`score: 0.96`、已歸檔到 `_archive/`**，但票內仍寫「044 的前置…目前不存在」「鏈條頭卡住」。
三個選項因此全部失真：選項 A（建議）的代價「040 合併再延一輪、要多開一個帳號」**已經付掉**；
選項 B——豁免 `operations.md:12` 的 probe 但書、直接在正式表部署，票內自己標為「**部分不可逆**」、
「錯誤發生在 40 筆已上線內容的唯一來源上」——**已經沒有理由**。
044 的 AC-3 逐字是「投稿者對八個審核欄位一格都改不到」，與 050 的 AC-3／AC-4 同一命題。
真正還開著的只剩 040 Out of scope 的後半句「**並由 captain 確認**」。
**這一條需要 captain 在解那個 🔴 之前先看到**；我前兩輪也沒查到，因為我同樣只盯著 `檔名:行號`。

另兩筆較輕：**H3** 步驟 6 把整列刪除推給 043，但 043 `status: design`、標題仍掛
「待captain確認脈絡」、門檻「初步建議兩成」尚未定案——刪 1 列／40 列是 2.5%，
**即使 043 做出來也擋不住**；這張票自己的 S3 檢查②反而抓得到。
**H4** 跨檔行號的例外清單漏了只在 040 branch 的兩個檔，建議比照 044 釘 commit。

## Stage Report: implement (cycle 4)

- DONE: H1 事實更新（最優先，captain 正在部署）把 044 的 `status: complete`／`verdict: PASSED`／`score: 0.96`／`completed: 2026-09-21T18:35:02Z`／`pr: pr-merge:36`／已歸檔寫進相依關係節，取代「目前不存在／鏈條頭卡住」（原句保留）；重寫三個選項；寫明 `operations.md:12` 的保護邊界觸發條件已滿足、AC-4 的第二個 Google 帳號前置已過期；寫明真正還開著的只剩 040 Out of scope 的後半句。**不得自行解 🔴，不得代 captain 確認。**
  「相依二」的「但這個判定會造成僵局」之後加一則 ⚠️ 事實更正，**原本那兩句「前置目前不存在」「鏈條頭卡住」逐字保留**，下面以表列出 044 的六個 front matter 欄位。另查出一件 FO 沒提的事：歸檔 commit `66ed939` **是本 branch HEAD 的祖先**——這個事實在本票這條 branch 上一直看得到，只是沒有人重讀。三個選項已重寫：**A** 的代價改為「已完成，無額外代價」；**B** 改為「前提已消失——它的唯一好處是省下等 044 的時間，而 044 已做完」；**C** 同樣改為「前提已消失，沒有東西要等」。**原始三句代價措辭另以 ⚠️ 保留供追溯**，並明寫「B 的原始代價敘述仍然成立，而它的好處已經歸零，選 B 等於拿那 40 筆去換一個已經不用付的成本」。`operations.md:12` 與 AC-4 前置兩段各自寫明已滿足／已過期。**還開著的部分用兩列表拆開**：「隔離測試表完成驗證」✅ 已滿足、「並由 captain 確認」🔴 仍在 captain 手上。另更正三處連帶的 044 敘述：步驟 4 的「前置：feature 044 的裁決」、design stage Out of scope 的「不執行 044」（加註原句保留）、Documentation impact 的 044 那一列（044 已歸檔到 `_archive/`，而 `_archive/` 依 `AGENTS.md` 不動，該列已無法執行，改記為本票「相依二」）。
  **🔴 未解、未代確認、`## Acceptance criteria` 整段逐位元組未動**——AC-4 前置已過期這件事寫在「相依二」，沒有寫進 AC-4。
- DONE: H2 補第四族（引用另一張票、只寫 feature 編號）與其檢查方式，講清楚它與前三族是不同種類的漂移，並掃一次全票有沒有其他第四族引用、逐一重讀其現在的 `status`。
  第九節的三條邊界宣告後加一則 ⚠️ 第四輪追加：**三條都有一個共同的隱含假設——被引用的對象是「內容穩定、只有位置會變」的檔**，而第四族違反的正是這個假設；它變的是**被引用對象的狀態**，所以三條邊界一條都擋不住，因為它們檢查的是行號。檢查方式寫明為**重讀被引用票的 front matter（`status`／`verdict`／`completed`／是否在 `_archive/`），不是讀行號**。另新增一小節「第四族：票對票的引用」，逐一列出全票 5 張被引用票的重讀結果：**`044` ⛔ 全部過期（H1）、`043` ⛔ 尚未定案（H3）、`040` ✅ 仍成立但尚未合併有後果（H4）、`042` ✅ 成立（只宣告本票不做，沒有推論 042 會做）、`065`／`066`／`049` ✅ 成立（是對 `git diff` 內容的歸屬描述，不是狀態推論）**。另說明 `041` 三處與 `045` 都不是票對票引用（一處是 sha256 裡的數字誤判，兩處是對 `design.md` 修訂紀錄內容的陳述）。
  並寫進失效模式的關鍵差異：**前三族壞掉時讀者會發現**，因為他看到不相干的內容；**第四族壞掉時句子讀起來完全合理**——「044 的前置目前不存在」是通順、具體、有證據感的句子，不指向任何會露餡的位置，所以三輪掃描與三個 reviewer 都讀過它而沒有起疑。唯一的檢查方式是把那張票打開重讀。
- DONE: H3 把「由 feature 043 在同步端擋」改為「043 尚未定案，且其跌幅門檻擋不住單列誤刪；本票的防線是 S3 的檢查①②」。防線不改。
  「已知未解」那一段加 ⚠️ 更正並**保留原句**：重讀 043 的 front matter 得 `status: design`、標題仍掛「待captain確認脈絡」、`source` 寫「脈絡待確認後再決定**是否進行**」。另實讀 043 的門檻條文——`043-sync-row-drop-threshold.md:52` 逐字為「**門檻設多少。** 初步建議兩成」，而誤刪 1 列／40 列 ＝ **2.5%**，遠在門檻之下，**即使 043 做出來也擋不住**。明寫本票的防線是 S3 的檢查①②、S9 會再跑一次。**S3 區塊逐位元組未動**（防線本身沒改，改的只是那句會讓人以為已有人接手的話）。
- DONE: H4 把 `approval-workflow.gs`（9 處）與 `operations.md` 納入跨檔行號例外清單並比照 044 釘 commit。
  「相依一」新增一小節，把 040 branch 上**三個**檔（不是兩個）的行號釘在 commit `a51b5d9`，附 sha256 與行數表，並寫明取出方式與「為什麼要釘」（三檔不在 main、只活在 040 branch，而 040 `status: review`、`completed:` 空白、尚未合併）。
  **沒有照抄 044 的 `093cd01`，因為照抄會錯。** 實查三檔在兩個 commit 的 sha256：`.gs`（`cd380aee1071…`、263 行）與 `operations.md`（`a01a0d47237e…`、79 行）**兩個 commit 相同**，所以兩份記錄互相印證；**但 `sync-content.mjs` 不同**——`093cd01` 是 807 行且 `publishedRowSequences` **根本不存在**（第 392 行是另一條敘述），`a51b5d9` 是 824 行、該函式在第 392 行。**本票的 `:392` 只在 `a51b5d9` 成立**，所以三檔一律釘 `a51b5d9`。另把 main 版 `sync-content.mjs` 的 9 處行號另計並釘 `main` ＝ `49e875c`（`ff30b8bda476…`、729 行），並寫明它會因為本票步驟 9 合併 040 而整份換掉。
  falsifying change：把 `.gs` 的釘選改成 `093cd01` 仍然正確（同位元組），但把 `sync-content.mjs` 的釘選改成 `093cd01`，`:392` 就指到一條不相干的敘述、`publishedRowSequences` 整個找不到——這證明「比照辦理」在這裡會壞掉，而 17 行的差異本身就是 H4 論點（040 未合併、檔案真的會動）的直接證據。
- DONE: 未越界。
  **正式試算表零寫入零讀取**（本輪未發出任何 HTTP 請求、未跑任何同步）。**`## Acceptance criteria` 整段逐位元組未動**。**S7／S8／S3 三個區塊逐位元組未動**。承重數字 24／9／15／59／12／6 原值保留。**`### Feedback Cycles` 逐位元組未動、`- Cycle` 行數維持 1**，未代 FO 補寫。verify cycle 3 整段逐位元組未動。整條 branch 只動 `docs/constitution-features/050-ssot-approval-deployment.md` 一個檔；`git diff --stat $(git merge-base main HEAD) -- src/ scripts/` 無輸出；`src/data/*.json` sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`；未跑 `sync-content`；040 worktree `git status` 為空、HEAD 仍為 `a51b5d9`。diff 基準自算 ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。未用 `sort`／`uniq` 判定中文字串，未用 `awk`。

### Summary

四筆按 FO 授權修完。**H1 只做事實更新——🔴 仍在票內未解，也沒有代 captain 確認任何一半。**

**H1 是最要緊的一筆，因為 captain 正在部署，而票內那三個選項全部失真。**
044 已於 2026-09-21 完成、PASSED、score 0.96、歸檔。票內卻還寫「前置目前不存在、鏈條頭卡住」。
三個選項的代價全部重寫：A「已完成，無額外代價」、B 與 C「前提已消失」。
B 值得單獨講：票內自己把它標為「部分不可逆」、錯誤會發生在 40 筆已上線內容的唯一來源上，
而它的唯一好處是省下等 044 的時間——**那個時間已經不用等了**。
原句與原始三句代價措辭全部保留供追溯。
**真正還開著的只剩一半**：040 Out of scope 是「隔離測試表完成驗證**並由 captain 確認**」兩個條件，
前一半 044 做完了，後一半仍在 captain 手上。

**H2 是這一輪的方法收穫，我把它做滿了。** 第四族是「引用另一張票、只寫 feature 編號」，
它與前三族的差別不是程度而是種類：**變的是被引用對象的狀態，不是位置**，
所以三條邊界宣告一條都擋不住。全票 5 張被引用票逐一重讀 front matter：
044 過期、043 過期、040 仍成立、042 成立、065／066／049 成立。
最值得記下的是失效模式——前三族壞掉時讀者會看到不相干的內容因而發現；
**第四族壞掉時句子讀起來完全合理**，所以它躲過了三輪掃描與三個 reviewer。

**H4 我沒有照抄 044 的 commit，因為實查發現照抄會錯。**
`.gs` 與 `operations.md` 在 `093cd01` 與 `a51b5d9` 是同一份位元組，
但 040 的 `sync-content.mjs` 在 `093cd01` 只有 807 行、**`publishedRowSequences` 根本不存在**，
本票的 `:392` 只在 `a51b5d9`（824 行）成立。所以三檔一律釘 `a51b5d9`。
那 17 行的差異本身就是 H4 論點的證據：040 還沒合併，它的檔案真的會動。

**H3 改的只是一句話。** 「由 feature 043 在同步端擋」會讓人以為已有人接手，
而 043 `status: design`、標題還掛著「待captain確認脈絡」、source 寫「再決定是否進行」。
就算做出來也擋不住：門檻是「初步建議兩成」，刪 1 列／40 列 ＝ 2.5%。
**防線沒有改，S3 區塊逐位元組未動**——防線一直是 S3 的檢查①②。

## verify stage 第四輪：H1-H4 修正複驗（2026-09-24）

diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。
**本輪對正式試算表零存取。**

### 一、H4 —— 最該親手驗的一格：**implement 是對的，照抄 044 會錯**

`git show` 兩個 commit，逐項實測：

| 檔 | `093cd01` | `a51b5d9` | 相同？ |
|---|---|---|---|
| `approval-workflow.gs` | sha256 `cd380aee1071…`、263 行 | 同 | ✅ 同一份位元組 |
| `operations.md` | sha256 `a01a0d47237e…`、79 行 | 同 | ✅ 同一份位元組 |
| `sync-content.mjs`（040 版） | `c2a8b978ade6…`、**807 行** | `7e9ab0587035…`、**824 行** | ⛔ 不同（差 17 行） |

**關鍵那一格成立：**

```
093cd01: grep publishedRowSequences → 0 次命中（根本不存在）
         第 392 行 = if ((record[field] || '').trim() === '') addError(…`核可紀錄缺少 ${field}。`);
a51b5d9: 392:function publishedRowSequences(records, sheetKey) {
         403:  const sequences = sheetKey === SHEET_KEYS.TRACK_2 ? publishedRowSequences(…)
```

**若照抄 044 的 `093cd01`，票內的 `sync-content.mjs:392` 會指到一條不相干的敘述。**
implement 拒絕照抄是對的，釘 `a51b5d9` 才正確。
`.gs` 的 9 處行號在 `a51b5d9` 我逐一實讀，全部仍對（5／6／12／79／127／144／159／219／220）。

**雙軌釘法不會讓人混淆。** main 版釘 `49e875c`（我實測 `49e875c` **就是現在的 main**，
blob sha256 `ff30b8bda476…`、**729 行**，抽驗第 94／112／123 行全對）。兩組用四種方式區分開：
**commit 不同、sha256 不同、行數不同（824 對 729）、而且票內把屬於 main 版的 9 個行號逐一列名**。
光是 824 對 729 就足以辨認。票內另寫明 main 版「會因為步驟 9 合併 040 而整份換掉」——這是誠實且正確的。

引用處數也對：`approval-workflow.gs` 9 處、`operations.md` 3 處（`:12`／`:13`／`第 15-25 行`——
`:13` 是 cycle 3 修 G2 時新增的）、040 版 `sync-content.mjs` 2 處（`:84-93`／`:392`）。

### 二、H1 —— 六個欄位、祖先關係、兩列表拆法，全部成立

**044 的六個 front matter 欄位逐字正確**（實讀 `_archive/044-approval-permission-two-account-probe.md`）：
`status: complete`／`verdict: PASSED`／`score: 0.96`／`completed: 2026-09-21T18:35:02Z`／
`pr: pr-merge:36`／檔案位於 `_archive/`。

**祖先關係成立，而且比 implement 說的更強。**
`66ed939` 不只是 HEAD 的祖先，**它也是 merge-base `384ca7a3c` 的祖先**
（`git merge-base --is-ancestor` 兩次皆真），歸檔時間 `2026-09-21 11:35:03 -0700`。
也就是說：**044 已完成這件事，從本 branch 的第一個 commit 起就看得到**，
`git show HEAD:…/_archive/044-….md | grep status` 直接就是 `status: complete`。
三輪 implement、三輪 verify 都沒有人打開它。票內已如實寫下這一點。

**兩列表的拆法忠於 040 的原文。** 實讀 `040-approval-content-version-binding.md:290`：

> 不上線正式 SSOT 設定，直到隔離測試表完成驗證並由 captain 確認。

「直到〔隔離測試表完成驗證〕**並**〔由 captain 確認〕」——**確實是兩個條件**，拆法正確。
第 292 行的上下文也支持：captain 於 2026-09-04 裁決 worker 無法完成該驗證、改由 044 承接。

**三個選項重寫正確，B 那一格尤其誠實**：票內明寫「**B 的原始代價敘述仍然成立，而它的好處已經歸零**」，
並保留原始三句措辭供追溯。這個寫法沒有把 B 說成「安全了」，而是說它「沒有理由了」——
**這是兩件不同的事，票內分得很清楚。**

**🔴 未解、未代 captain 確認**：票內明寫「本輪只做事實更新，不解這個 🔴，也不代 captain 確認」，
兩列表的第二列仍是 🔴。`## Acceptance criteria` 整段與 cycle 4 前一版 **逐位元組相同（7009 bytes）**
——AC-4 前置已過期這件事寫在「相依二」，沒有寫進 AC-4。**處置正確。**

**三處連帶更正都在，而且我另查了三個沒被改的地方，其中兩個確實不該改：**

| 位置 | 現況 | 判斷 |
|---|---|---|
| 步驟 4 前置 | 已改為「044 **已於 2026-09-21 完成並 PASSED**…仍待 captain…確認」 | ✅ 正確 |
| design stage Out of scope「不執行 044」 | 原句保留＋註「現在的理由是它做完了，不是它還沒開始」 | ✅ 正確 |
| Documentation impact 的 044 列 | 刪除線＋「已無法執行」（044 已歸檔，`_archive/` 依 `AGENTS.md` 不動） | ✅ 正確 |
| `## Problem`「044 只做隔離測試表的 probe，不碰正式表」 | 未改 | ✅ **本來就不該改**，這句現在仍然為真 |
| `## 相依關係`「兩者不互為前置」 | 未改 | ✅ **本來就不該改**，它下方已有 design stage 的 ⚠️ 更正塊 |
| `## Risk evidence`「`no spike needed` 不成立，但 spike 的形式…（即 feature 044）」 | 未改 | ⚠️ **可能是第四處**——見下方 J2 |

**另查一件沒人提的事，結論是「不適用」，記下來免得下一輪再查一次。**
040 的 Out of scope 第 292 行還有第三個元素：「受保護欄位的 trigger 寫入路徑維持 `UNPROVEN`」，
兩列表沒有涵蓋它。我查了它對本票有沒有影響：
`approval-workflow.gs` 的 `ScriptApp`／`newTrigger`／`onEdit`／`onChange` **全部零命中**，
`appsscript.json` 也沒有宣告任何 trigger——本票裝的是 `onOpen` 起的 `Review` **選單**，不是 installable trigger。
（044 那個 `probe-trigger.gs` 是它自己的臨時探針，步驟 12 做完就刪掉了。）
**所以 UNPROVEN 的 trigger 路徑不在本票的路徑上，兩列表不涵蓋它是對的，不是遺漏。**

### 三、H2 —— 第四族的掃描完整，失效模式的解釋也準確

**我自己重跑了一次掃描**（抓出票內每一個三位數票號，用 `Map` 去重）。
出現的票號：`040`／`041`／`042`／`043`／`044`／`045`／`049`／`050`／`065`／`066`。
扣掉 `050`（本票自己）、`041` 與 `045`（implement 已說明不是票對票引用，我複核同意——
`041` 有一處確實是 sha256 字串裡的數字造成的誤判），
**被引用並據以推論的正好就是那 5 張：`044`／`043`／`040`／`042`／`065`＋`066`＋`049`。
集合完整，與 implement 的表逐列相符。**

**失效模式的解釋準確，我再補一層。** implement 寫：

> 前三族壞掉時讀者會發現，因為他看到不相干的內容；第四族壞掉時句子讀起來完全合理。

這個解釋成立，而且我手上有支持它的證據：**我前三輪查出的每一個前三族錯誤，都是「走到那個位置、看到不對的東西」才發現的**
——`TODO.md:127` 是空行、`040-…:221` 是空行、本票第 50 行是空行、
`editor-onboarding.md:430` 是另一句話、`design.md` 的 `補造` 零命中。**五個全都是位置暴露了自己。**
第四族沒有位置可走，「044 的前置是一份隔離測試表 + 兩個 Google 帳號，這兩項卡在人不卡在程式，目前不存在」
是通順、具體、有證據感的句子。

**我要修正的只有一點措辭**：前三族真正的優勢不是「讀者會發現」——不去查的讀者一樣被騙。
真正的差別是**「存不存在一個機械式的檢查」**：
前三族查位置、第四族查被引用票的 front matter、**第五族（見下）連查都無從查起**。

### 四、H3 —— 成立

`043-sync-row-drop-threshold.md:52` 逐字為：

```
1. **門檻設多少。** 初步建議兩成。太鬆擋不住誤刪，太緊會在正常下架內容時誤擋。
```

`status: design`、標題仍掛「待captain確認脈絡」。
**2.5% 的推論成立**：刪 1 列／40 列 ＝ 2.50%，遠低於兩成。即使 043 照現在的設計做出來也擋不住。
**S3 區塊逐位元組未動（4311 bytes）**——防線沒被改，只改了步驟 6 那句措辭。

### 五、本輪的新發現：**第五族**

**J1（Polish，但其中一項帶 deferred risk）第五族：指涉一張沒有編號、而且不存在的票。**

被問到「有沒有不寫 feature 編號、只用敘述指涉另一張票的引用」。**有，票內三處：**

| 位置 | 原句 | 那張票存在嗎 |
|---|---|---|
| 步驟 1 的說明框 | 「`TODO.md` 的 P3-7 記載 `chapter` 設計已被放棄，**那是另一張票要處理的事**，本票不動它」 | ⛔ **不存在。** 沒有任何 feature 的 `title` 含 `chapter`；全 `docs/constitution-features/` 只有 040 與本票提到 `chapter`。P3-7 是 `TODO.md` 的條目，不是票 |
| design stage Out of scope | 「**這個落差要記成後續票**：往後任何人在試算表加中文說明或改標題寫法，Apps Script 可能無聲失效」 | ⛔ **不存在。** 沒有任何 feature 的 `title` 含 alias／別名；除本票外只有 `012` 提到「別名」且與此無關。**這句話本身是一個沒有被執行的指令** |
| Out of scope | 「不處理標題列與整列刪除的保護範圍（**另議**）」 | ⛔ **沒有票。** `043` 是**同步端**的刪列跌幅偵測，不是**試算表端**的保護範圍，機制不同；而且 043 自己還沒定案（見 H3） |

**為什麼這一族在這張票上特別刺眼**：本票的 `## Problem` 第 31 行自己寫著
「**這些人工步驟目前沒有任何票、沒有任何人負責**，而 040 已走到最後一道 gate」
——**050 存在的理由，就是有人用「另議」把事情擱著而沒有票、沒有負責人。**
而本票現在用同一種方式擱下三件事。

**失效模式比第四族更難查**：第四族至少有一個票號可以打開重讀；
**第五族沒有編號可查，掃描再完整也掃不到它**——只能問「這句話承諾的東西，實際上存在嗎」。
- 已釋出使用者與正常流程：往後任何人讀 Out of scope，以為這三件事已有人接手。
- 可觀察到的損害：目前為零（三件事都確實不在本票範圍）。風險在於它們無人接手且不會被任何檢查發現。
  其中**別名表那一項帶 deferred risk**：本票正要 captain 輸入含中文說明的標題，
  而 `approval-workflow.gs` 沒有別名表——本票已實測目前這批標題兩支程式都通過，
  但往後任何人改標題寫法，Apps Script 可能無聲失效。升級條件：有人在部署後改動任一標題字串。
- 影響的 AC 或不可協商邊界：無。
- 觸發證據：上表三列的 `grep -l '^title:.*chapter'`／`'^title:.*\(alias\|別名\)'` 皆零命中；
  `043` 的 `title` 為「大量刪列時同步不出聲」。
- 提議：**Polish**／任務內／`fix`（把三處「另一張票」「後續票」「另議」改成
  **具體票號，或「尚無票，負責人未定」的明白話**——後者至少讓缺口可見，
  這正是本票 `## Problem` 對 040 做過的事）。

**J2（Polish）`## Risk evidence` 可能是第四處該註記 044 的地方。**
該節首句是「`no spike needed` 不成立，但 spike 的形式是**在隔離測試表上先跑一次**（即 feature 044）」。
**這句話沒有錯**——它說的是 spike 的形式，不是 spike 的狀態。
但 `## Risk evidence` 這一節的用途就是回答「風險現在如何」，
而讀者在這裡只會讀到「需要一個 spike」，讀不到「那個 spike 已經做完而且 PASSED」。
已更正的三處都是**前置／動作**語境，這一處是**風險狀態**語境，性質不同。
- 可觀察到的損害：極小。相依二已完整記載，且步驟 4 的前置已更新。
- 提議：**Polish**／任務內／`fix`（加一句「該 spike 已由 044 於 2026-09-21 完成並 PASSED，見相依二」）。
- **同時記下我查過但認為不該改的兩處**：`## Problem` 的「044 只做隔離測試表的 probe，不碰正式表」
  現在仍為真；`## 相依關係` 的「兩者不互為前置」下方已有 design stage 的 ⚠️ 更正塊。**這兩處維持原狀是對的。**

### 六、未越界

| 項目 | 結果 |
|---|---|
| diff 基準 | **自算** `384ca7a3c…` |
| 整條 branch／cycle 4 動到的檔 | 都只有 `050-ssot-approval-deployment.md` 一個 |
| `src/`、`scripts/` | **零變動** |
| `src/data/*.json` | main／050 HEAD／工作區**三者 sha256 相同** |
| `npm run sync-content` | 未執行 |
| 040 worktree | `git status` 空，HEAD 仍 `a51b5d9`（四輪皆同） |
| 正式試算表 | **零寫入零讀取** |
| `## Acceptance criteria` | ✅ 逐位元組未動（7009 bytes） |
| S3／S7／S8 | ✅ 逐位元組未動（4311／593／759 bytes） |
| `### Feedback Cycles` | ✅ 逐位元組未動（3689 bytes），`- Cycle` 行數 **＝ 1** |
| **我自己的 verify cycle 1／2／3 各段** | ✅ **全部逐位元組未動**（17546／35218／22782 bytes） |
| 承重數字 | 24／9／15／59／12／6 及 27 列、`d3`、「其後 13 列」**出現次數與內容皆未變** |

### 七、裁決

**PASSED。**

H1–H4 四筆都驗過，四筆都是真的修正。**H4 那一格 implement 是對的**：
`093cd01` 只有 807 行、`publishedRowSequences` 根本不存在、第 392 行是另一條敘述；
照抄 044 的 commit 會讓票內 11 處行號指偏。釘 `a51b5d9` 正確，雙軌釘法也不會混淆。
H1 的六個欄位逐字正確，祖先關係比宣稱的更強（連 merge-base 都看得到），
兩列表忠於 040 原文，**🔴 未解、AC 逐位元組未動**。
H2 的 5 張票集合我重跑後完整，失效模式的解釋準確。H3 成立。

**新發現是第五族：指涉一張沒有編號、而且不存在的票**（票內三處）。
它比第四族更難查——第四族至少有票號可以打開重讀，第五族沒有東西可查。
**而這件事在這張票上特別刺眼**：050 自己的 `## Problem` 就寫著
「這些人工步驟目前沒有任何票、沒有任何人負責」，那正是它被開出來的理由；
現在它用同樣的方式擱下三件事。建議改成具體票號，或明白寫「尚無票、負責人未定」。

## Stage Report: verify (cycle 4)

- DONE: H4（本輪最該親手驗的一格）`git show 093cd01:scripts/sync-content.mjs` 與 `a51b5d9` 比對——確認行數、`publishedRowSequences` 的有無與位置；判斷雙軌釘法會不會混淆。
  **implement 是對的，照抄 044 的 commit 會錯。** 實測：`093cd01` = `c2a8b978ade6…`、**807 行**、`grep publishedRowSequences` **0 次命中**，第 392 行是 `addError(…核可紀錄缺少 ${field}。)`；`a51b5d9` = `7e9ab0587035…`、**824 行**、`392:function publishedRowSequences(records, sheetKey) {`。**若照抄，票內 `sync-content.mjs:392` 會指到不相干的敘述。** `.gs`（`cd380aee1071…`、263 行）與 `operations.md`（`a01a0d47237e…`、79 行）兩個 commit 確為同一份位元組，票內所有 sha256 與行數逐項相符，824−807＝17 也對。`.gs` 的 9 處行號在 `a51b5d9` 逐一實讀全對。**雙軌釘法不會混淆**：`49e875c` 我實測就是現在的 main（`ff30b8bda476…`、729 行，抽驗第 94／112／123 行全對），兩組以 commit／sha256／行數（824 對 729）／逐一列名四種方式區分，且票內寫明 main 版會因步驟 9 合併而整份換掉。引用處數 9／3／2 也核對正確（`operations.md:13` 是 cycle 3 修 G2 時新增的第三處）。
- DONE: H1 驗六個 front matter 欄位、三個選項代價、兩列表忠於 040 原文、三處連帶更正有無第四處、歸檔 commit 的祖先關係；確認 🔴 未解、未代確認、AC 整段逐位元組未動。
  六個欄位**逐字正確**。**祖先關係比宣稱的更強**：`66ed939` 不只是 HEAD 的祖先，**也是 merge-base `384ca7a3c` 的祖先**（`--is-ancestor` 兩次皆真），即 044 已完成這件事**從本 branch 第一個 commit 起就看得到**，票內已如實寫下。兩列表**忠於原文**：實讀 `040-…:290`「直到隔離測試表完成驗證**並**由 captain 確認」確為兩個條件，第 292 行的 2026-09-04 裁決脈絡也支持。三個選項重寫正確，**B 那格特別誠實**——明寫「原始代價敘述仍然成立，而好處已歸零」，沒有把 B 說成「安全了」。**🔴 未解、未代確認**，`## Acceptance criteria` **逐位元組未動（7009 bytes）**，AC-4 前置過期一事寫在相依二而非 AC-4。三處連帶更正都在；另查三處未改的，`## Problem` 與 `## 相依關係` **本來就不該改**（前者仍為真、後者下方已有 ⚠️ 更正塊），`## Risk evidence` 可能是第四處（J2）。另查 040 第 292 行的第三個元素「trigger 寫入路徑維持 UNPROVEN」對本票是否適用：`.gs` 的 `ScriptApp`／`newTrigger`／`onEdit` **全零命中**、`appsscript.json` 未宣告 trigger，本票裝的是 `onOpen` 起的選單——**不適用，兩列表不涵蓋它是對的**。
- DONE: H2 自己重跑第四族掃描，判斷 5 張票的集合完整嗎；找有沒有第五族；判斷失效模式的解釋是否準確。
  **集合完整。** 自行抓出票內全部三位數票號並以 `Map` 去重，得 `040`／`041`／`042`／`043`／`044`／`045`／`049`／`050`／`065`／`066`；扣掉本票與 `041`／`045`（複核同意不是票對票引用，`041` 有一處確為 sha256 數字誤判），**被引用並據以推論的正好是那 5 張，與 implement 的表逐列相符**。失效模式的解釋**準確**，並有我自己的證據支持：前三輪查出的每一個前三族錯誤都是「走到位置、看到不對的東西」才發現的（三處空行、一句別的話、一次零命中）——**五個全都是位置暴露了自己**。唯一要修正的措辭：真正的差別不是「讀者會不會發現」（不去查的讀者一樣被騙），而是**存不存在機械式的檢查**——前三族查位置、第四族查 front matter、第五族無從查起。**第五族存在（J1）**：票內三處以敘述指涉一張沒有編號、而且不存在的票。
- DONE: H3 確認 `043-…md:52` 逐字、2.5% 推論、S3 逐位元組未動；未越界全項。
  `043-…md:52` 逐字為「1. **門檻設多少。** 初步建議兩成。太鬆擋不住誤刪，太緊會在正常下架內容時誤擋。」，`status: design`、標題仍掛「待captain確認脈絡」。2.5%（1／40）遠低於兩成，**推論成立**。**S3 逐位元組未動（4311 bytes）**——防線沒改，只改步驟 6 的措辭。未越界全項通過：整條 branch 與 cycle 4 都只動票檔；`src/`／`scripts/` 零變動；`src/data/*.json` 三者 sha256 相同；未跑 `sync-content`；040 worktree 空且 HEAD 仍 `a51b5d9`；**正式試算表零寫入零讀取**；**S7／S8 逐位元組未動（593／759 bytes）**；**`### Feedback Cycles` 逐位元組未動（3689 bytes）、`- Cycle` 行數 ＝ 1**；**我自己的 verify cycle 1／2／3 三段全部逐位元組未動**（17546／35218／22782 bytes）；承重數字 24／9／15／59／12／6 及 27 列、`d3`、「其後 13 列」出現次數與內容皆未變；diff 基準自算；未用 `sort`／`uniq` 判定中文，未用 `awk` 做判斷。

### Summary

H1–H4 四筆都是真的修正。**H4 那一格 implement 是對的，而且它拒絕照抄 FO 的提示是正確判斷**：
`093cd01` 只有 807 行、`publishedRowSequences` **根本不存在**、第 392 行是另一條敘述；
照抄會讓票內 11 處行號指偏。釘 `a51b5d9` 正確，雙軌釘法以四種方式區分，不會混淆。

H1 的六個 front matter 欄位逐字正確，**祖先關係比它宣稱的更強**——`66ed939` 連 merge-base 都是它的後代，
所以「044 已完成」從本 branch 第一個 commit 起就看得到，只是六輪沒有人打開它。
兩列表忠於 040 原文（「直到 X **並** 由 captain 確認」確為兩個條件），
**🔴 未解、未代 captain 確認、`## Acceptance criteria` 逐位元組未動**。
另查 040 第 292 行第三個元素「trigger 寫入路徑維持 UNPROVEN」對本票不適用
（`.gs` 零 trigger、裝的是選單），**兩列表不涵蓋它是對的，不是遺漏**——記下來免得下一輪再查一次。

H2 的 5 張票集合我重跑後**完整**；失效模式的解釋**準確**，我只修正一點措辭：
差別不在「讀者會不會發現」，而在**存不存在一個機械式的檢查**。

**新發現是第五族：指涉一張沒有編號、而且不存在的票**——票內三處
（廢除 `chapter` 的「另一張票」、Apps Script 缺別名表的「後續票」、保護範圍的「另議」），
三處查證後都**沒有對應的票**。它比第四族更難查：第四族至少有票號可以打開重讀，
第五族連查都無從查起。**而這件事在這張票上特別刺眼**——050 自己的 `## Problem` 就寫著
「這些人工步驟目前沒有任何票、沒有任何人負責」，那正是它被開出來的理由。
建議改成具體票號，或明白寫「尚無票、負責人未定」，讓缺口至少是可見的。
另一筆 **J2** 較輕：`## Risk evidence` 可能是第四處該註記 044 的地方
（該節專講風險狀態，而讀者在那裡讀不到 spike 已完成）；
同時記下我查過、認為**不該改**的兩處，免得下一輪重複勞動。

## Stage Report: implement (cycle 5)

- DONE: J1 三處「另一張票／後續票／另議」改成具體票號，或「尚無票，負責人未定」的明白話。**不開新票**（範圍決定屬 captain），工作是讓缺口可見。
  三處都改完，**原句一律保留**。查證方式是讀 `docs/constitution-features/` 下**全部 66 張票**（含 `_archive/`）的 `title` 與 `status`：**沒有任何一張票涵蓋這三件事**，verify 的三筆判定全部成立。(1) **`chapter`**：改為「廢除 `chapter` 目前尚無 feature 票，負責人未定」，指向它唯一的落腳處 `TODO.md` 的 **P3-7**，**以名稱引用、不寫行號**（理由見第十節）；另寫明**本票反而讓它更難處理**——本票新建的空白 `chapter` 欄從此有技術用途，廢除它要連 `approval-workflow.gs` 一起改。(2) **Apps Script 別名表**：改為「這個落差目前尚無票，負責人未定」，並點明原句「要記成後續票」**本身是一個沒有被執行的指令**。(3) **保護範圍**：改為「整列刪除的保護目前尚無票，負責人未定」，並寫明**它不是 `043`**——043 是**同步端**刪列跌幅偵測（列已被刪之後才察覺），這裡缺的是**試算表端**保護（讓列一開始就刪不掉），時機與機制都不同，且 043 自己 `status: design`、尚未決定是否進行。
- DONE: J1 第二處另寫 promote-to-material 條件，並寫明本票已實測目前這批標題兩支程式都通過。
  這一項的觸發條件**正是 captain 現在在做的事**，所以票內同時寫了兩面，避免讀者只讀到一半。**現況安全**：第三節與第四節已實測，照票內建議輸入的 18／21／12 個標題字串（含中文說明）**同時通過 `resolveApprovalHeaders_` 與 040 新版同步**，輸出與純欄名版本逐字相同（證據 4 亦同）——**captain 現在照票輸入的這批標題是安全的**。**風險在之後**：`approval-workflow.gs` 沒有別名表（`approval-workflow.gs:127-144`，釘在 commit `a51b5d9`）而 `sync-content.mjs` 有，兩支程式容忍度不同。**升級為 Material 的條件：有人在部署後改動三個分頁上任何一個標題字串**——屆時 Apps Script 可能無聲失效而同步程式仍然通過，**兩邊不會互相提醒**。
  順帶更正一處綁在一起的說法（落在同一個被指名的位置，未另開掃描）：Out of scope 原句是「不處理標題列**與**整列刪除的保護範圍」，但**本票只擱下其中一件**——標題列的保護本票**有做**（步驟 6 的 C 類、S7 的 `A1:R1`／`A1:U1`／`A1:L1`、AC-5），沒做的是整列刪除。所以「尚無票、負責人未定」只適用於整列刪除那一半。原句保留，更正寫在 ⚠️ 框內。另寫明本票對誤刪的替代防線是 S3 的檢查①②與 S9——**那是偵測不是預防**，抓到時列已經不見了，要靠 Google 試算表的版本記錄救回。
- DONE: J2 `## Risk evidence` 首句加一句「該 spike 已由 044 於 2026-09-21 完成並 PASSED，見相依二」。
  **原句逐字不動**（它說的是 spike 的**形式**，沒有錯），在其下加一則引言：該 spike 已由 feature 044 於 2026-09-21 完成並 PASSED（`score: 0.96`，已歸檔），詳見相依二；並點明原句講的是形式不是進度，避免下一輪有人把原句當成錯的再改一次。
- DONE: verify 判定不該改的兩處維持原狀。
  以區塊比對確認：`## Problem` 整節（含「feature 044 只做隔離測試表的 probe，不碰正式表」）與 `## 相依關係` 整節（含「兩者不互為前置」與其下方的 ⚠️ 更正塊）**兩節都逐位元組未動**。
- DONE: 收斂——不開新的掃描維度。
  本輪新增內容全部落在 J1 指名的三處、J2 指名的一處，加上第十二節的處置記錄。**沒有新增第六族**，沒有新的全票掃描表。讀 66 張票的 `title`／`status` 是為了查證 J1 三處的事實，不是新的掃描維度，這一點已寫進第十二節。
- DONE: 未越界。
  **正式試算表零寫入零讀取**（本輪未發出任何 HTTP 請求、未跑任何同步）。**未開新票、未解 🔴、未代 captain 確認**。**`## Acceptance criteria` 整段與 S3／S7／S8 三區塊逐位元組未動**；承重數字 24／9／15／59／12／6 原值保留。**`### Feedback Cycles` 逐位元組未動、`- Cycle` 行數維持 1**。verify 第四輪整段逐位元組未動。整條 branch 只動 `docs/constitution-features/050-ssot-approval-deployment.md` 一個檔；`git diff --stat $(git merge-base main HEAD) -- src/ scripts/` 無輸出；`src/data/*.json` sha256 仍為 `4d1992e3…cea3b`／`4071978a…3162`；040 worktree `git status` 為空、HEAD 仍為 `a51b5d9`。diff 基準自算 ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。未用 `sort`／`uniq` 判定中文字串，未用 `awk`。

### Summary

兩筆 Polish 做完，**沒有開新票、沒有開新的掃描維度**。

**J1 的三處，查證後 verify 三筆全部成立**——讀完 66 張票的 `title` 與 `status`，
沒有任何一張涵蓋廢除 `chapter`、Apps Script 別名表、或整列刪除的保護。
三處都改成「尚無票，負責人未定」的明白話，原句一律保留。
`chapter` 那一處指向它唯一的落腳處 `TODO.md` 的 P3-7，用名稱不用行號。

**Apps Script 別名表那一處我寫了兩面**，因為它的觸發條件正是 captain 此刻在做的事。
一面是「現在安全」：18／21／12 個含中文說明的標題已實測同時通過兩支程式。
另一面是 promote-to-material 條件：**有人在部署後改動任何一個標題字串**——
那一刻 Apps Script 可能無聲失效而同步程式仍然通過，兩邊不會互相提醒。
只寫其中一面都會誤導：只寫風險會讓 captain 以為現在就壞了，只寫安全會讓人忘記這個缺口。

**保護範圍那一處順帶更正了一個綁在一起的說法。** 原句寫「不處理標題列與整列刪除的保護範圍」，
但本票只擱下其中一件——**標題列的保護本票有做**（步驟 6 的 C 類、S7、AC-5），
沒做的是整列刪除。所以「尚無票」只適用於後者。這個更正落在 J1 指名的同一個位置，不是新掃描。
另寫明 `043` 補不上這一格：**它是同步端偵測，這裡缺的是試算表端預防**，
本票目前的替代防線（S3 的檢查①②與 S9）同樣是偵測不是預防。

**J2 原句一個字都沒改**，因為它說的是 spike 的形式而不是進度，本來就沒錯；
只在其下補一則引言說明該 spike 已由 044 完成並 PASSED，並點明這個區分，
免得下一輪有人把沒錯的句子當成錯的再改一次。
verify 判定不該改的兩處，以區塊比對確認逐位元組未動。

## verify stage 第五輪（收斂輪）：J1／J2 複驗（2026-09-24）

diff 基準自算：`git merge-base main HEAD` ＝ `384ca7a3cd670c436b4903e9ba63703140f63455`。
**本輪對正式試算表零存取。收斂輪，只驗 J1／J2，未開新的掃描維度。**

### 一、J1 —— 三處都真的變得可見

三處現在都明寫「**尚無票，負責人未定**」，原句保留。逐處複驗：

| 位置 | 現在寫什麼 | 我的查證 |
|---|---|---|
| 步驟 1 的 `chapter` 說明框 | 「廢除 `chapter` 這件事目前尚無 feature 票，負責人未定」，並點出**本票讓它更難處理**（新建了空白 `chapter`，廢除它要連 `.gs` 一起改） | ✅ 零命中 |
| design stage Out of scope 的別名表 | 「這個落差目前尚無票，負責人未定。原句『要記成後續票』**本身是一個沒有被執行的指令**」 | ✅ 零命中 |
| Out of scope 的「另議」 | 「整列刪除的保護目前尚無票，負責人未定」，並說明**它不是 `043`**（同步端偵測 vs 試算表端預防，機制與時機都不同） | ✅ 零命中 |

**「讀完 66 張票」的宣稱成立，而且 `_archive/` 有讀進去。**
我自己數：現役 30 個 `.md` ＋ `_archive/` 38 個 ＝ 68 個檔，
其中 `README.md` 不是票、`040-…md` 的 `id:` 在第 13 行（`head -8` 抓不到），
**扣掉後正好 66**——它數的是真正的票。
更重要的是實質結論我直接驗過：以 `title` 搜 `chapter`／`alias`／`別名`／`整列`／`保護範圍`，
**在現役與 `_archive/` 兩邊都是零命中**。三個缺口確實無人接手。

**別名表那一處寫兩面是正確的，而且是本輪最該寫兩面的一處。**
它的兩面各自有實測支撐，不是修辭：

- **現在安全**：第三、四節已實測，18／21／12 個含中文說明的標題**同時通過**
  `resolveApprovalHeaders_` 與 040 新版同步，輸出與純欄名版本逐字相同。
- **風險在之後**：`.gs` 沒有別名表、`sync-content.mjs` 有，兩支程式容忍度不同；
  promote-to-material 條件是「有人在部署後改動任何一個標題字串」。

理由（只寫風險會讓 captain 以為現在就壞了，只寫安全會讓人忘記這個缺口）**成立**。
而且票內誠實寫出「**這個條件現在就在觸發範圍內——captain 正在建欄與輸入標題**」,
這句話把一個 deferred risk 放在 captain 眼前而沒有誇大成擋路項，分寸是對的。

### 二、順帶那個更正：**正確，而且我同意 FO 的授權判定**

原句「不處理**標題列與整列刪除**的保護範圍（另議）」把兩件事綁在一起，
但**本票只擱下其中一件**。我自己查證標題列保護確實有做：

| 依據 | 內容 |
|---|---|
| 步驟 6 的 C 類 | 「三個分頁的第 1 列**全列**／只有 captain／改一個標題，整條產線停擺」 |
| S7 的 C 類欄 | `A1:R1`／`A1:U1`／`A1:L1`——**第 1 列全列**，三個分頁各一個範圍（我在第一輪自己算過這三個位置） |
| AC-5 | 「標題列受保護，非 captain 改不動」，`Verified by:` 三個分頁各測一次 |

**三者確實涵蓋標題列保護。沒做的只有整列刪除**（Google 試算表沒有直接對應的設定）。

**我同意「同一位置、同一病因，屬授權範圍」，理由有三個：**

1. **同一病因。** J1 的病因是「缺口不可見」。這句話的毛病是同一類的反面——
   它把一件**已經做了的事**混進缺口裡，讓缺口的範圍不準。兩者都是「這句話沒有如實描述現況」。
2. **它是把 J1 做對的必要條件。** J1 要求標明「整列刪除尚無票」，
   但原句的主詞是「標題列**與**整列刪除」。不拆開就會寫出自相矛盾的一段——
   一邊說這兩件事尚無票，一邊 S7 又有 `A1:R1`。**不拆開，J1 就修不乾淨。**
3. **它不擴張任何範圍。** 不加事、不減事、不碰任何 AC、不動任何承重數字，
   只把一個宣稱從兩項收斂成一項，而收斂後的那一項我已實測為真。
   方向上它**降低**風險：不拆開的話，讀者可能以為標題列保護沒人做，於是漏做或重做。

**而且原句本身一個字都沒改**，更正寫在其下的 ⚠️ 框裡。這是對的——記錄保留，判讀更新。

### 三、J2 —— 忠於我的提議

我提的是「**加一句**」而不是「改那句」。實測：`## Risk evidence` 的原句
（「`no spike needed` 不成立，但 spike 的形式是在隔離測試表上先跑一次（即 feature 044）…」）
**一個字都沒改**，其下新增一則引言，寫明 spike 已由 044 於 2026-09-21 完成並 PASSED，
並點出「上面那句講的是 spike 的**形式**，不是它的進度」。

**處置忠於提議，而且比我提的多做了一件有用的事**：
點明「形式 vs 進度」這個區分，等於替下一輪擋掉「把一句沒錯的話當成錯的再改一次」。

### 四、未越界

| 項目 | 結果 |
|---|---|
| diff 基準 | **自算** `384ca7a3c…` |
| 整條 branch／cycle 5 動到的檔 | 都只有 `050-ssot-approval-deployment.md` 一個 |
| **沒有開新票** | cycle 5 未新增任何票檔；現役 30／`_archive` 38，**與上一輪相同** |
| `src/`、`scripts/` | **零變動** |
| `src/data/*.json` | main／050 HEAD／工作區**三者 sha256 相同** |
| `npm run sync-content` | 未執行 |
| 040 worktree | `git status` 空，HEAD 仍 `a51b5d9`（五輪皆同） |
| 正式試算表 | **零寫入零讀取** |
| `## Acceptance criteria` | ✅ 逐位元組未動 |
| S3／S7／S8 | ✅ 逐位元組未動 |
| `### Feedback Cycles` | ✅ 逐位元組未動，`- Cycle` 行數 **＝ 1** |
| **我的 verify cycle 4 內容段與 stage report** | ✅ **逐位元組未動**（14213／7254 bytes） |
| **我判定不該改的兩處**（`## Problem`、`## 相依關係`） | ✅ **逐位元組未動**（940／598 bytes） |
| 承重數字 | 24／9／15／59／12／6 及「其後 13 列」出現次數與內容皆未變 |

### 五、裁決

**PASSED。收斂。**

J1 的三處都真的變得可見，「66 張票」的掃描宣稱我抽驗成立且確實含 `_archive/`，
別名表那一處寫兩面正確且兩面都有實測支撐。
順帶那個更正**事實正確、屬授權範圍**，而且不拆開的話 J1 根本修不乾淨。
J2 忠於提議——原句一字未改，只在其下補一則引言。

**沒有發現會擋住 captain 部署的東西，也沒有 Material 等級的缺陷。**
依收斂輪判準，**不再開新的掃描維度**。

**captain 部署前的狀態**：欄名、欄數（24＝9＋15）、列數（59＝40＋15＋4）、
保護範圍（12）、連續選取段（6）、`d3` 單一序號風險點——**五輪來原值未變、且每一項都被獨立重算過**。
S3 的兩項機器檢查已補上並實測（B3 證明缺一不可）。
唯一仍開著的是 040 Out of scope 後半句「**並由 captain 確認**」那一次確認，
以及三個已標明「尚無票、負責人未定」的缺口——**三者都不擋本票執行**。

## Stage Report: verify (cycle 5, 收斂輪)

- DONE: J1 抽驗「讀完 66 張票的 `title` 與 `status`、沒有任何一張涵蓋這三件事」，特別確認有沒有把 `_archive/` 讀進去；判斷別名表那一處寫兩面是否正確。
  **宣稱成立，`_archive/` 確實有讀進去。** 我自己數：現役 30 ＋ `_archive/` 38 ＝ 68 個 `.md`，扣掉 `README.md` 與 `040-…md`（其 `id:` 在第 13 行，`head -8` 抓不到）**正好 66**。實質結論我直接驗證：以 `title` 搜 `chapter`／`alias`／`別名`／`整列`／`保護範圍`，**現役與 `_archive/` 兩邊皆零命中**——三個缺口確實無人接手。三處現在都明寫「尚無票，負責人未定」且原句保留。**別名表寫兩面正確**：兩面各有實測支撐（現在安全＝18／21／12 個含中文說明標題實測同時通過兩支程式；風險在之後＝`.gs` 無別名表而 `sync-content.mjs` 有），理由成立，且誠實寫出「這個條件現在就在觸發範圍內——captain 正在建欄與輸入標題」，分寸正確。
- DONE: 判斷 implement 在 J1 位置順帶做的更正是否正確且未越界；自己確認 C 類／S7／AC-5 真的涵蓋標題列保護。
  **事實正確**：步驟 6 的 C 類（「三個分頁的第 1 列**全列**／只有 captain」）、S7 的 C 類欄（`A1:R1`／`A1:U1`／`A1:L1`，第 1 列全列，我在第一輪自己算過這三個位置）、AC-5（「標題列受保護，非 captain 改不動」，三個分頁各測一次）**三者確實涵蓋標題列保護**；沒做的只有整列刪除。**我同意 FO 的授權判定**，三個理由：① 同一病因——J1 的病因是「缺口不可見」，這句的毛病是同一類的反面（把已做的事混進缺口，讓缺口範圍不準）；② **它是把 J1 做對的必要條件**——原句主詞是「標題列**與**整列刪除」，不拆開就會寫出「這兩件事尚無票」卻又有 `A1:R1` 的自相矛盾；③ 不擴張任何範圍——不加事不減事、不碰 AC、不動承重數字，只把宣稱從兩項收斂成一項，方向上**降低**風險（不拆開，讀者可能以為標題列保護沒人做而漏做或重做）。原句本身一字未改，更正寫在其下的 ⚠️ 框，記錄保留、判讀更新，處理方式也對。
- DONE: J2 判斷「原句一個字未改、只在其下補引言」是否忠於我的提議。
  **忠於提議。** 我提的是「加一句」不是「改那句」；實測 `## Risk evidence` 原句一字未改，其下新增一則引言寫明 spike 已由 044 於 2026-09-21 完成並 PASSED。**而且比我提的多做了一件有用的事**——點明「上面那句講的是 spike 的**形式**，不是它的進度」，替下一輪擋掉「把一句沒錯的話當成錯的再改一次」。
- DONE: 未越界全項；依收斂輪判準給出裁決。
  全項通過：diff 基準**自算** `384ca7a3c…`；整條 branch 與 cycle 5 都只動票檔一個；**沒有開新票**（cycle 5 無新增票檔，現役 30／`_archive` 38 與上一輪相同）；`src/`／`scripts/` 零變動；`src/data/*.json` 三者 sha256 相同；未跑 `sync-content`；040 worktree 空且 HEAD 仍 `a51b5d9`；**正式試算表零寫入零讀取**；`## Acceptance criteria` 與 **S3／S7／S8 三區塊逐位元組未動**；**`### Feedback Cycles` 逐位元組未動、`- Cycle` 行數 ＝ 1**；**我的 verify cycle 4 內容段（14213 bytes）與 stage report（7254 bytes）逐位元組未動**；**我判定不該改的 `## Problem`（940 bytes）與 `## 相依關係`（598 bytes）逐位元組未動**；承重數字 24／9／15／59／12／6 原值保留。**未開新的掃描維度。**

### Summary

**PASSED，收斂。沒有發現會擋住 captain 部署的東西，也沒有 Material 等級的缺陷。**

J1 的三處都真的變得可見——三處都明寫「尚無票，負責人未定」且原句保留。
「66 張票」的掃描宣稱抽驗成立：我自己數到 68 個 `.md`，扣掉 `README.md` 與
`id:` 在第 13 行的 `040-…md` 正好 66，**且 `_archive/` 確實讀進去了**；
實質結論我直接以 `title` 搜過，兩個目錄皆零命中。
別名表那一處**寫兩面是對的**，兩面各有實測支撐，並誠實標出 promote 條件現在就在觸發範圍內。

順帶那個更正我**同意 FO 的授權判定**。標題列保護本票確實有做（步驟 6 C 類、S7 的
`A1:R1`／`A1:U1`／`A1:L1`、AC-5），沒做的只有整列刪除。關鍵是第二個理由：
**不拆開，J1 就修不乾淨**——原句主詞是「標題列與整列刪除」，
不拆就會寫出「這兩件事尚無票」卻又有 `A1:R1` 的自相矛盾。
它不加事不減事、不碰 AC、不動任何承重數字，方向上還降低風險。

J2 忠於我的提議：原句一字未改，只在其下補引言，並額外點明「形式 vs 進度」的區分，
替下一輪省掉一次重複勞動。

**交付狀態**：欄名、24 欄（9＋15）、59 列（40／15／4）、12 個保護範圍、6 個連續段、
`d3` 單一序號風險點——**五輪來原值未變，且每一項都被獨立重算過**；
S3 的兩項機器檢查已補上並實測（B3 證明缺一不可）。
仍開著的只有 040 Out of scope 後半句「並由 captain 確認」，
以及三個已標明「尚無票、負責人未定」的缺口——**都不擋本票執行**。
