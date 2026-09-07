---
id: 050
title: 正式 SSOT 部署 feature 040 的審核欄位（040 合併的硬前置）
status: design
source: captain 2026-09-04（把關機制體檢最高風險項：無票、無人負責）
started: 2026-09-07T23:15:17Z
completed:
verdict:
score: 0.95
worktree:
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
