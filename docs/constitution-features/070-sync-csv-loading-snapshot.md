---
id: 070
title: 同步讀到「載入中…」快照時隨機整份中止
status: review
source: 050 AC-2 正式同步失敗（2026-09-29），captain 同日核准開票
started: 2026-09-29T19:52:07Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-070-sync-csv-loading-snapshot
issue:
pr:
mod-block: merge:pr-merge
gates:
    version: 1
    records:
        - id: gate:070:verify
          stage: verify
          attempts:
            - id: gate-attempt:070-verify-1
              briefing:
                id: briefing:070:verify:attempt-1:revision-1
                digest: sha256:23e75e750efdb1f87dfaeec06ac38d3e2043410bd6b11a4a5b7cda3261c0f903
                room-ref: '@review/verify/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:070:verify:1
                briefing: briefing:070:verify:attempt-1:revision-1
                by: person:captain
                at: "2026-09-29T22:06:35.171603Z"
                decision: approve
                reason: 'Captain approved 070 verify in chat 2026-09-29: AC-1..AC-9 independently re-run, 040 validation byte-identical, live runs 10/10. F1 (8-fetch budget met at its edge) accepted as Deferred risk; revisit if a real sync fails with the 8-attempt message. F2 to 069.'
              application:
                target-stage: review
                state: consumed
        - id: gate:070:review
          stage: review
          attempts:
            - id: gate-attempt:070-review-1
              briefing:
                id: briefing:070:review:attempt-1:revision-1
                digest: sha256:ae1b939857ebb623372d3df037365fe414673cc30fbba6ea252bb6ae7a4d013a
                room-ref: '@review/review/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:070:review:1
                briefing: briefing:070:review:attempt-1:revision-1
                by: person:captain
                at: "2026-09-29T22:16:10.931226Z"
                decision: approve
                reason: 'Captain approved 070 review in chat 2026-09-29 (「070 approve」): fetch-layer retry and entry-point fix, 040 validation untouched, 137 tests 0 fail, R1 docs fixed; F1 accepted as Deferred risk.'
              application:
                target-stage: complete
                state: pending
---

`040` 合併後，正式同步可能隨機失敗：Google 發布的 CSV 有時送出公式仍在計算的舊快照，`status` 欄顯示「載入中…」，`040` 的驗證因此判整份不符而中止。不會把錯的內容推上網站，但會讓編輯看到數十筆錯誤而以為內容壞了。

## Problem

`050` 於 2026-09-29T19:04:58Z 在 main 上執行 `npm run sync-content`（`040` 已合併）：exit 1、36 筆錯誤，全在 `Track 2_discussion` 的 d8、d9、d11–d44：`status … 實際為「載入中…」`。`src/data` 零寫入。

同一 CSV 在約 10 秒內以 `curl` 抓 6 次，異常列數依序為 0／0／0／36／36／0。正常快照與 captain S8 的核可結果逐列相符。**試算表內容正確，問題在發布 CSV 的快取會送出計算中的快照。**

`status` 是 Apps Script 公式產生的衍生欄位（`040` 的設計），「載入中…」是 Google 試算表在公式計算完成前的顯示值。

design 要決定：同步程式怎麼分辨「快照在計算中」與「內容真的不符」（例如只在出現「載入中…」時重抓、重抓次數與間隔、多份快照一致才採用），且**不得放寬 `040` 的核可驗證**——內容不符時仍須整份中止；以及錯誤訊息怎麼讓編輯分得出兩種情況。

### 第二個缺陷：經符號連結路徑執行時，同步 exit 0 而什麼都不做（captain 2026-09-29 核准併入）

`050` 在同一天重跑 AC-6 時發現：`040` 合併後，`sync-content.mjs:824` 的入口判斷是
`path.resolve(process.argv[1]) === __filename`。`__filename` 已解開符號連結，`process.argv[1]` 沒有。
macOS 的 `mktemp -d` 回傳 `/var/…`，它是 `/private/var/…` 的符號連結，兩個字串不相等，`main()` 不執行，程式 exit 0，沒有任何輸出，沒有任何檔案。
證據：`050` 票（branch `spacedock-ensign/050-ssot-approval-deployment`）〈AC-6 修正後重跑〉一節。

design 階段重現（2026-09-29，main `35b015f` 的程式，三個 CSV 網址設為空字串）：

| 執行方式 | exit | 輸出 |
|---|---|---|
| `node /var/folders/…/sync-content.mjs` | 0 | 無 |
| `node "$(pwd -P 的同一目錄)"/sync-content.mjs` | 1 | `❌ 驗證失敗…`（環境變數未設定） |
| `node <指向 repo scripts/ 的符號連結>/sync-content.mjs` | 0 | 無 |

連「環境變數未設定」這種必定失敗的情況都變成 exit 0。這是 fail-open：呼叫端看到 exit 0，以為同步通過。
它不會把錯的內容推上網站（什麼都沒寫），但會讓驗收步驟假通過。

design 要決定：入口判斷怎麼在路徑寫法不同時仍然認得自己；認不出來時怎麼大聲失敗，而不是 exit 0。

## Proposed approach

### 一句話

在「抓取」這一層加一道重抓。**驗證這一層一個字都不改。**
重抓只在兩個公式欄出現「尚未算完的值」時觸發。
每一份被採用的快照，都照原樣跑完 `040` 的全部驗證。

### 為什麼這樣做不會放寬 `040`

`040` 的驗證是一個函式：給它一份 CSV，它回答「整份可以發布」或「整份不行」。
本票不改這個函式，只改「給它哪一份 CSV」。

- 重抓不會讓任何一份原本會被擋下的 CSV 通過。
  被採用的快照，必須自己通過完整驗證。
- 不拼接。不可以拿快照 A 的好列加上快照 B 的好列。
  一份快照要嘛整份被採用，要嘛整份被丟棄。
- 沒有「尚未算完的值」的快照，只抓一次，直接驗證。
  它若有內容不符，同步立刻整份中止，和今天完全相同。不重抓。

所以本票只改變一件事：**同步在失敗之前，多看幾份快照。**
它能改變的只有「成功得早或晚」，改變不了「什麼內容可以上線」。

### 名詞

| 名詞 | 定義 |
|---|---|
| 衍生欄 | `status` 與 `current_fingerprint`。兩欄由 Apps Script 公式產生（`scripts/apps-script/approval-workflow.gs` 的 `APPROVAL_STATUS` 與 `CONTENT_FINGERPRINT`） |
| 未算完值 | 衍生欄的值去掉頭尾空白後，**完全等於**下列三者之一：`載入中…`、`Loading...`、`#NAME?` |
| 未算完快照 | 任一列的任一衍生欄是未算完值的 CSV |
| 內容投影 | 一份 CSV 去掉兩個衍生欄之後剩下的所有格子（含標題列與 `review_*`、`approved_*` 等審核欄） |

未算完值的來源：

- `載入中…`：實測於 `Track 2`（見 Risk evidence）。這是 Google 試算表繁中介面在自訂函式算完之前的顯示值。
- `#NAME?`：實測於 `site_tldr`（見 Risk evidence）。這是該次 render 找不到自訂函式時的顯示值。
- `Loading...`：未實測。它是同一個顯示值的英文介面版本。收進清單的理由見下一小節。

**只比對衍生欄，不比對內容欄。** 內容欄（例如 `abstract`）可以合法地寫著「載入中…」四個字。
**只做完全相等比對，不做子字串比對。** `#FINGERPRINT! …` 是 `CONTENT_FINGERPRINT` 在內容本身有問題時回傳的值，
它是內容錯誤，不是未算完值，不可重抓。

### 清單寬窄只影響「多等幾秒」，不影響「什麼能上線」

把一個值收進未算完值清單，效果只有一個：看到它時先重抓，而不是立刻失敗。
重抓用盡時仍然失敗。重抓成功時，被採用的是另一份通過完整驗證的快照。
所以清單收錯一個值，最壞結果是同步晚 265 秒失敗；**不會**有內容因此上線。
這是 `Loading...` 收進清單的理由。反方向的錯誤（漏收一個真正的未算完值）則會讓同步維持今天的行為：立刻失敗，訊息誤導。

### 流程（每個分頁各自獨立）

三個分頁仍然同時抓（維持 `Promise.all`）。每個分頁各跑一次下列流程：

```
第 k 次抓取（k = 1…8）
  ├─ 連線失敗／HTTP 非 200／回應是 HTML → 照今天的訊息失敗。不重抓。
  ├─ 標題列解析失敗 → 把這份 CSV 交給驗證，讓驗證報標題錯誤。不重抓。
  ├─ 不是未算完快照
  │    ├─ 前面有未算完快照，且內容投影與前面任一份不同 → 失敗（「重抓期間內容改變」）
  │    └─ 否則 → 採用這一份，交給 040 的驗證。驗證結果就是最終結果。
  └─ 是未算完快照
       ├─ 與前面的未算完快照內容投影不同 → 失敗（「重抓期間內容改變」）
       ├─ k < 8 → 印出重抓通知，等待後重抓
       └─ k = 8 → 失敗（「連續 8 次未算完」）。這份快照不交給驗證。
```

**「這份快照不交給驗證」的理由**：交給驗證就會印出 36 行 `status 必須是…實際為「載入中…」`，
那正是 `050` 讓編輯誤以為內容壞掉的輸出。用盡時同步仍然 exit 1、零寫入，安全性不變。
代價是：這份快照若同時藏有真的內容不符，本次不會報出來。下一次抓到算完的快照時，驗證會報出來。

**「內容投影必須相同」的理由**：重抓只允許補齊衍生欄，不允許換掉內容。
若編輯在同步期間改了內容，或 Google 的不同快取送出不同世代的內容，
這道檢查讓同步停下，不讓「重抓」變成「挑一份舊的來用」。
沒有發生重抓時，這道檢查不執行，行為與今天相同。

### 重抓次數與間隔

- 每個分頁**最多抓 8 次**（第 1 次＋重抓 7 次）。8 是寫死在程式裡的常數，不開放設定。
- 兩次之間等待 10、10、20、30、45、60、90 秒。最長總等待 265 秒（約 4.4 分鐘）。
- 等待秒數乘以環境變數 `CONTENT_SYNC_RETRY_DELAY_SCALE`（預設 1）。它只供測試縮短等待。
  測試設為 `0`。次數上限不受它影響。

依據見 Risk evidence 的量測。

### 訊息

新訊息如下。字串是規格的一部分，AC 會逐字比對其中的關鍵片語。
範例中的 `36 列`、`status／current_fingerprint`、`載入中…` 由實際快照填入：列數是含未算完值的列數，欄名只列出實際出現未算完值的衍生欄，值列出實際出現的未算完值（多種時以「、」分隔）。`#NAME?` 快照會印成 `N 列的 status 顯示「#NAME?」`。

**重抓通知**（stdout，不是錯誤）：

```
⏳ Track 2 的發布版還沒算完：36 列的 status／current_fingerprint 顯示「載入中…」。10 秒後重抓（第 2／8 次）。
```

**重抓後成功**（stdout）：

```
✅ Track 2 第 3 次抓到算完的發布版。
```

**用盡**（錯誤，鍵為 `快照`）：

```
  Track 2
    快照  發布版連續 8 次都還沒算完：36 列的 status／current_fingerprint 顯示「載入中…」。這不是內容錯誤，核可紀錄沒有被比對。等 5 分鐘後重跑同步。一直出現時，打開試算表確認 status 欄已經算完、選單列有「Review」。
```

**內容改變**（錯誤，鍵為 `快照`）：

```
  Track 2
    快照  重抓期間發布內容改變了（第 1 次與第 3 次不同）。可能有人正在編輯試算表。等編輯完成 5 分鐘後重跑同步。
```

**結尾句**：全部錯誤的鍵都是 `快照` 時，最後一行改為

```
共 1 項錯誤。試算表的發布版還沒就緒，不是內容錯誤。等 5 分鐘後重試。
```

錯誤中只要有一項不是 `快照`，最後一行維持今天的 `共 N 項錯誤。請修正 SSOT 後重試。`

**編輯怎麼分辨兩種情況**：

| 看到什麼 | 意思 | 該做什麼 |
|---|---|---|
| `快照  發布版連續 8 次都還沒算完` | 試算表沒問題，Google 的發布版還沒算完 | 等 5 分鐘重跑 |
| `快照  重抓期間發布內容改變了` | 同步期間有人改了試算表 | 等編輯完成後重跑 |
| `與目前發布內容不符。需要重新核可。` | 內容在核可後被改過 | 確認內容，重新核可 |

第三行的訊息**不變**，一字不改。

### 程式結構

只動 `scripts/sync-content.mjs` 的三處：「抓取」與「主流程」兩個區段、`report` 的結尾句、檔尾的入口判斷（見下一小節）。

| 單元 | 職責 |
|---|---|
| `DERIVED_FIELDS`（常數） | `['status', 'current_fingerprint']` |
| `PENDING_FORMULA_VALUES`（常數） | `['載入中…', 'Loading...', '#NAME?']` |
| `MAX_FETCH_ATTEMPTS`（常數） | `8` |
| `RETRY_DELAYS_SECONDS`（常數） | `[10, 10, 20, 30, 45, 60, 90]` |
| `findPendingCells(csv, columns)` | 回傳 `{ cells: [{ key, field, value }], projection }`。標題解析失敗時回傳 `null`。用既有的 `parseCSVRows` 與 `buildColumnMap`（傳入一個丟棄用的錯誤陣列），不另寫解析器 |
| `fetchSettledCSV(source, errors, io)` | 上面的流程。`io` 注入 `fetch`、`sleep`、`log`，讓單元測試不必真的等待 |
| `main()` | 把 `fetchCSV` 換成 `fetchSettledCSV`。其餘不變 |
| `report(errors)` | 依「是否全部為 `快照`」選結尾句 |

**不可動的函式**（逐位元組不變）：`parseCSVRows`、`buildColumnMap`、`resolveHeader`、`toRecords`、
`checkStatusValues`、`validateApprovalBinding`、`publishedRowSequences`、`checkRequiredValues`、
`checkUniqueKeys`、`checkNotEmptyAfterApproval`、`checkPlaceholders`、`buildTrack1`、`buildTrack2`、
`buildSiteTldr`、`checkMergedDiscussionIds`、`writeOutputsAtomically`，以及 `scripts/content-fingerprint.mjs` 整檔。

`fetchCSV` 的三種失敗訊息保留原字串，由 `fetchSettledCSV` 沿用。

### 第二項：入口判斷（captain 2026-09-29 核准併入）

`sync-content.mjs:824` 現在寫：

```js
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) main();
```

這一行讓測試可以 `import` 本檔而不觸發同步。問題是它比的是字串。
`__filename` 來自 `import.meta.url`，Node 已把符號連結解開；`process.argv[1]` 沒有解開。
兩者一不相等，`main()` 就不執行，程式 exit 0，沒有任何輸出。這是 fail-open：呼叫端以為同步通過。

改法：

| 單元 | 職責 |
|---|---|
| `resolveEntry(argv1, filename, realpath = fs.realpathSync)` | 回傳 `run`、`import` 或 `mismatch`。兩者 `realpath` 後相等 → `run`。不相等且 basename 也不同 → `import`。不相等但 basename 相同 → `mismatch`。`argv1` 為空 → `import`。`realpath` 丟例外 → `mismatch` |
| 檔尾 | `run` → `main()`；`import` → 什麼都不做；`mismatch` → `console.error('⛔ 入口判斷失敗：…')`，`process.exitCode = 1` |

`mismatch` 的訊息：

```
⛔ 入口判斷失敗：執行的檔案是 {argv1}，本程式位於 {filename}，兩者解開符號連結後仍不相同。同步沒有執行。請用 npm run sync-content 或 node scripts/sync-content.mjs 執行。
```

理由：`realpath` 解決已知的 `/var`／`/private/var` 情況。`mismatch` 這一支擋未知的情況，
讓「看起來是要執行本程式、卻判斷成匯入」的狀況大聲失敗，而不是 exit 0。

### 本票不處理

- 不在 `checkStatusValues` 或 `validateApprovalBinding` 裡把未算完值當成合法值。那是放寬 `040`。
- 不對網路錯誤或 HTTP 錯誤重抓。那是另一種失敗，今天的訊息已能分辨。
- 不改 Apps Script。公式計算時間的根因（`PUBLISHED_ROW_SEQUENCE` 對每列取 `$2:列號` 的範圍）是另一件事，見 Risk evidence 第 4 點。

## Risk evidence

最危險的未驗證機制是 Google 發布 CSV 的快取行為。design 階段以**唯讀 GET** 實測。
沒有寫入正式試算表；沒有執行 `npm run sync-content`；`git status --short src/data` 全程無輸出。
探測腳本與原始記錄留在 design 的 scratchpad，不進 repo（含正式網址與內容）。

### 1. 主量測：三個分頁各抓 240 次

`2026-09-29T19:53:52Z` 至 `20:33:47Z`，每 10 秒一次，三個分頁同時抓。每次記錄 HTTP 狀態、回應時間、全文 sha256、
「去掉 `status` 與 `current_fingerprint` 兩欄後」的 sha256（下稱內容雜湊）、每欄出現「載入中」的列數、`status` 的值域。

| 分頁 | 次數 | 正常 | `載入中…` | `#NAME?` | 內容雜湊種類 | 正常快照全文種類 |
|---|---|---|---|---|---|---|
| `Track 1` | 240 | 240 | 0 | 0 | 1 | 1 |
| `Track 2` | 240 | 199 | 33 | 8 | 1 | 1 |
| `site_tldr` | 240 | 236 | 0 | 4 | 1 | 1 |

HTTP 全部 200。回應標頭 `cache-control: private, max-age=300`，沒有 `etag`、`last-modified`、`age`。
`Track 2` 有 13 次、`site_tldr` 有 8 次回應時間超過 3 秒（最長 12.2 秒）。

### 2. 回答 checklist 的三個問題

**多常出現。** `Track 2` 為 41／240（17%），`site_tldr` 為 4／240（2%），`Track 1` 為 0。
分布不均勻：`Track 2` 在 `20:16:43Z`–`20:23:15Z` 這 6.5 分鐘內有 23／40 次（58%）是未算完快照，其餘時段約 9%（18／200）。
`064` 的 F1 在 `20:21:12Z` 看到 `Track 2` 的 `#NAME?`，落在同一段時間內（team-lead 轉述）。

**持續多久。** 以 10 秒間隔看，`Track 2` 連續未算完的最長一段是 6 次（約 60 秒）。
21 段連續未算完之中，14 段只有 1 次。好與壞在相鄰兩次之間交替出現，
與 `050` 看到的「10 秒內 0／0／0／36／36／0」同形。解讀：Google 有多份快取，每次請求落到其中一份。
這是推論，不是 Google 的文件說法。

**是不是整份全有全無。** 不是整份，但形狀固定：

- 每一次回應都是三種全文之一：正常快照、`載入中…` 快照、`#NAME?` 快照。沒有第四種。
- `載入中…` 快照 33 次都是**同一組 36 列**（`d8`、`d9`、`d11`–`d44`），而且**兩個衍生欄同時**是 `載入中…`。`d1`–`d7` 正常。
- `#NAME?` 快照只有 `status` 是 `#NAME?`；`current_fingerprint` 仍是正常的雜湊。
- **240 次的內容雜湊只有一種。** 未算完快照與正常快照的差別，只在兩個衍生欄。
  這是「重抓只補衍生欄、內容投影必須相同」這條規則的實測基礎。

`site_tldr` 的 `#NAME?` 快照另以本機重播確認：它讓 main 的同步印出 6 項錯誤（4 行 `實際為「#NAME?」`、`order 0 的 status 必須是 Approved`、`order ≥ 1 沒有任何一列通過核可`）。
`Track 2` 的 `載入中…` 快照重播後印出 36 項錯誤，逐字重現 `050` 的失敗。

### 3. 重抓次數的依據

以上表 `Track 2` 的 240 次實測序列重播兩種排程（從每一個時點出發，依排程取樣，看是否全部未算完）：

| 排程 | 失敗的出發點 |
|---|---|
| 6 次，間隔 5、10、20、40、60 秒 | 2／240 |
| **8 次，間隔 10、10、20、30、45、60、90 秒** | **0／240** |

兩次失敗都落在 `20:16`–`20:23` 那段密集期。本票採 8 次。
重播只有 10 秒解析度，且只有 40 分鐘樣本，不能證明 8 次一定夠。用盡時的訊息要求「等 5 分鐘重跑」，對應 `max-age=300`。

### 4. 其他觀察

- **加查詢參數繞快取無效**：10 次附 `_cb=<時間戳>` 的請求仍得到 1 次 `載入中…` 快照。本票不採用繞快取。
- **main 目前的同步在真實來源上**：design 期間以 `CONTENT_OUTPUT_DIR` 暫存輸出唯讀實跑 12 次，12 次 exit 0，輸出 sha256 與 `src/data/*.json` 相同。失敗是機率性的。
- **根因推測（未驗證，本票不處理）**：`Track 2` 的 `current_fingerprint` 公式對每一列呼叫 `PUBLISHED_ROW_SEQUENCE`，範圍是 13 個發布欄各取 `$2:列號`。43 列合計讀約 1.2 萬格（13 × (1+2+…+43)），是三個分頁中計算量最大的一個。`Track 1` 沒有這個參數，實測 0 次未算完。
- **舊世代快取**：240 次中每個分頁的正常快照全文只有一種，沒有觀察到舊內容。本票仍以「內容投影必須相同」擋住這個情況，因為重抓會讓同步多看幾份快照。

### 5. 本設計的安全論證依賴哪些事實

| 論證 | 依賴 | 若不成立 |
|---|---|---|
| 被採用的快照一定通過 `040` 的完整驗證 | 驗證函式不被修改（AC-7） | AC-7 會失敗 |
| 重抓不會換掉內容 | 內容投影比對（AC-5） | AC-5 會失敗 |
| 真的內容不符不會被重抓掩蓋 | 只有衍生欄出現未算完值才重抓（AC-3、AC-6(b)） | AC-3 的請求次數會大於 1 |
| 同步不會無限等待 | 次數上限是常數（AC-2） | AC-2 的請求次數會大於 8 |

沒有一項依賴 Google 的快取行為。快取行為只決定「重抓多常成功」，不決定「什麼內容能上線」。

## Expected surface and tolerance

| 檔案 | 預期變動 | 容許範圍 |
|---|---|---|
| `scripts/sync-content.mjs` | 新增約 105 行（四個常數、`findPendingCells`、`fetchSettledCSV`、`report` 結尾句分支、`resolveEntry`）；`main()` 改 1 行呼叫；檔尾入口判斷 1 行改為約 12 行；`export` 行加三個名稱 | 新增 70–170 行。「不可動的函式」清單內任何一行被改即超出範圍 |
| `tests/approval-content-version-binding.test.mjs` | 新增約 200 行：一個會依請求次數換回應的 fixture server、AC-1 至 AC-7 與 AC-9 的測試 | 新增 100–300 行。既有測試與既有 helper 的行**只增不改**；`runSync` 可加一個選用參數 |
| `docs/content-pipeline/operations.md` | 見〈實作後更新〉 | 只追加，不改寫原句 |

`src/`、`scripts/content-fingerprint.mjs`、`scripts/apps-script/`、`package.json` 零變動。

**語意改變有兩項**：
1. 出現未算完快照時，同步由「立刻失敗」改為「最多再抓 7 次」。沒有未算完快照時，同步的請求次數、驗證、輸出、訊息全部與今天相同。
2. 經符號連結路徑執行時，同步由「exit 0 什麼都不做」改為正常執行；入口判斷無法確定時由 exit 0 改為 exit 1。

## Acceptance criteria

測試一律用 fixture server 與 `CONTENT_OUTPUT_DIR` 暫存輸出，設 `CONTENT_SYNC_RETRY_DELAY_SCALE=0`。
「請求次數」由 fixture server 逐路徑計數。
「未算完快照」fixture：Track 2 兩列已核可，其中第二列的 `status` 與 `current_fingerprint` 都改成 `載入中…`，其餘格子與正常快照逐位元組相同。這是 Risk evidence 實測到的形狀。

**AC-1　時好時壞的來源，最後取得正確快照並成功。**
Track 2 前兩次回應未算完快照，第三次起回應正常快照。
同步 exit 0；`discussions.json` 與 `history.json` 和「三個分頁都只回應正常快照」那一次的輸出**逐位元組相同**；Track 2 的請求次數恰為 3，另兩個分頁各為 1；stdout 含 `第 3 次抓到算完的發布版`。
Verified by: 新測試「未算完快照兩次後成功，輸出與一次成功逐位元組相同」。
它在下列改動時失敗：拿掉重抓（exit 1）；把重抓改成拼接好列（輸出不同）；重抓上限小於 3（exit 1）。

**AC-2　重抓用盡時，以可辨識的訊息失敗，兩個輸出都不寫。**
Track 2 每次都回應未算完快照。
同步 exit 1；Track 2 請求次數**恰為 8**；stderr 含 `快照` 與 `發布版連續 8 次都還沒算完`；stderr 最後一行含 `不是內容錯誤`；
stderr **不含** `status 必須是` 與 `與目前發布內容不符`；兩個輸出檔仍是測試預先寫入的 `history-before`／`discussions-before`。
Verified by: 新測試「未算完快照用盡時 exit 1、請求恰 8 次、訊息可辨識、零寫入」。
它在下列改動時失敗：重抓不設上限（請求多於 8 次，或測試逾時）；用盡時把快照交給驗證（出現 `status 必須是`）；結尾句沒有分支。

**AC-3　內容真的不符時，仍然整份中止，而且不重抓。**
Track 2 回應一份**沒有**未算完值的快照，其中一列已核可但 `abstract` 在核可後被改過（三份指紋不變）。
同步 exit 1；Track 2 請求次數**恰為 1**；stderr 含 `與目前發布內容不符。需要重新核可。`；stderr 最後一行是 `請修正 SSOT 後重試。` 結尾；兩個輸出檔未被寫入。
Verified by: 新測試「算完的快照內容不符時只抓一次並整份中止」。
它在下列改動時失敗：對所有驗證失敗都重抓（請求次數大於 1）；放寬指紋比對（exit 0）。

**AC-4　先未算完、後算完但內容不符：重抓一次，然後以內容不符中止。**
準備一份「內容不符快照」X（同 AC-3）。第一次回應 X 再把另一列的兩個衍生欄改成 `載入中…`；第二次回應 X 本身。兩份的內容投影相同。
同步 exit 1；Track 2 請求次數恰為 2；stderr 含 `與目前發布內容不符`；不含 `發布版連續`。
Verified by: 新測試「重抓後取得的快照仍須通過完整驗證」。
它在下列改動時失敗：重抓成功後略過驗證（exit 0）。

**AC-5　重抓期間內容改變時中止。**
Track 2 第一次回應未算完快照，第二次回應正常快照但另一列的 `title` 不同（兩份各自的核可紀錄都合法）。
同步 exit 1；stderr 含 `重抓期間發布內容改變了`；兩個輸出檔未被寫入。
Verified by: 新測試「未算完快照與後續快照內容投影不同時中止」。
它在下列改動時失敗：拿掉內容投影比對（exit 0，採用了另一份內容）。

**AC-6　`#NAME?` 與 `載入中…` 同樣處理；內容欄裡的「載入中…」不觸發重抓。**
(a) `site_tldr` 前兩次回應全部 `status` 為 `#NAME?`、`current_fingerprint` 正常的快照，第三次正常：exit 0，`site_tldr` 請求次數恰為 3。
(b) Track 2 一列已核可列的 `abstract` 內容就是 `載入中…`（指紋依此內容正確計算）：exit 0，Track 2 請求次數恰為 1。
Verified by: 新測試兩格。
(a) 在「清單漏收 `#NAME?`」時失敗；(b) 在「改用子字串比對或比對所有欄」時失敗。

**AC-7　驗證本身沒有被放寬。**
(a) 直接呼叫 `buildTrack2(未算完快照, errors)`：回傳 `null`，`errors` 含 `status 必須是…實際為「載入中…」`。
(b) `git diff main -- scripts/content-fingerprint.mjs` 無輸出；
「不可動的函式」清單中每個函式的原始碼，在 main 與實作分支上逐字相同（以腳本擷取 `function 名稱(` 起到下一個頂層 `function`／`// ----` 為止的文字比對）。
(c) 既有 `node --test tests/approval-content-version-binding.test.mjs` 全部通過，且 `git diff main -- tests/approval-content-version-binding.test.mjs` 只有 `+` 行（`runSync` 的選用參數除外）。
Verified by: (a) 新測試一格；(b)(c) verify 階段執行的指令，輸出貼進報告。
(a) 在「把未算完值加進 `checkStatusValues` 的合法值」時失敗；(b) 在任何一個清單內函式被改一個字元時失敗。

**AC-8　對正式試算表唯讀實跑。**
以 `CONTENT_OUTPUT_DIR` 指向暫存目錄，對正式三個 CSV 網址執行實作分支的同步 10 次（`node --env-file=.env.local scripts/sync-content.mjs`，**不是** `npm run sync-content`）。
10 次全部 exit 0；每次輸出的兩個 JSON 的 sha256 都等於當時 main 的 `src/data/*.json`；記錄每次是否發生重抓。
`git status --short src/data` 無輸出。
Verified by: verify 階段的執行記錄。
本條是機率性的：它證明實作在真實來源上可用，不證明重抓一定被觸發。重抓的確定性證明由 AC-1、AC-2 承擔。
若 10 次中出現 exit 1，報告必須貼出錯誤並分類（`快照` 類或其他）；`快照` 類出現即本條不通過。

**AC-9　入口判斷在路徑不一致時不可以 exit 0 而什麼都不做。**（captain 2026-09-29 核准併入）
(a) 測試在暫存目錄複製 `sync-content.mjs` 與 `content-fingerprint.mjs`，再建一個指向該目錄的符號連結，以 `node <符號連結>/sync-content.mjs` 執行，其餘與 AC-1 的正常快照相同：exit 0，stdout 含 `🚀 Starting Content Sync...`，兩個輸出與直接執行逐位元組相同。
(b) 同一條符號連結路徑，三個 CSV 網址設為空字串：exit 1，stderr 含 `環境變數未設定`。
(c) 單元測試直接呼叫 `resolveEntry(argv1, filename, realpath)`，注入一個讓兩者 basename 相同、真實路徑不同的 `realpath`：回傳 `mismatch`；以子程序模擬此情況時 exit 1，stderr 含 `入口判斷失敗`。
(d) 以一個 argv[1] 為別的檔案的子程序 `import` 本模組：exit 0，stdout 不含 `Starting Content Sync`（測試仍能匯入而不觸發同步）。
Verified by: 新測試四格。
(a)(b) 在「改回 `path.resolve(process.argv[1]) === __filename`」時失敗（實測：main 的現行程式在 `/var` 路徑下 exit 0、零輸出、零檔案，連環境變數未設定都不報）；
(c) 在「把 `mismatch` 當成 `import` 處理」時失敗；(d) 在「一律執行 `main()`」時失敗。

## Test plan

1. `node --test tests/approval-content-version-binding.test.mjs`：既有測試全過，新增 AC-1 至 AC-7(a) 與 AC-9 的測試全過。
2. `npx tsc --noEmit`：通過（本票不動 TypeScript，這一步確認沒有連帶破壞）。
3. `npm run build`：通過；前後 `src/data/*.json` sha256 相同。
4. AC-7(b)(c) 的 `git diff` 與函式比對腳本。
5. AC-8：唯讀實跑 10 次。**不得執行 `npm run sync-content`。不得寫入正式試算表。**
6. **否證演練**（verify 階段）：暫時把 `MAX_FETCH_ATTEMPTS` 改成 1，確認 AC-1 的測試失敗；暫時拿掉內容投影比對，確認 AC-5 的測試失敗；暫時把入口判斷改回 `path.resolve(process.argv[1]) === __filename`，確認 AC-9(a)(b) 失敗；還原後重跑全綠。兩次演練的輸出摘要貼進報告。

新 fixture server 的形狀：`withFixtureServer` 目前接受「路徑 → 固定字串」。
實作新增一個 helper，接受「路徑 → 字串陣列」，第 n 次請求回應第 min(n, 長度) 個元素，並回報每個路徑的請求次數。既有 helper 不改。

## Documentation impact

### 現在更新

- `docs/content-pipeline/operations.md`〈錯誤與復原〉：**追加一則補述**，不改原句。
  - 已定方向：同步讀到 `status` 為「載入中…」或 `#NAME?` 而失敗時，那是 Google 發布版還沒算完，不是內容錯誤；等 5 分鐘重跑。
  - 尚未實作的狀態：明寫「目前同步不會自動重抓（feature 070 尚未實作）；錯誤訊息仍是 `status 必須是…實際為「載入中…」`」。
  - 驗證目標：補述指向本票 AC-2 的新訊息；070 合併後由〈實作後更新〉改寫成現況。
  - 理由：這個失敗今天就會發生（`050` 已遇到）。編輯在 070 合併前遇到時，手冊要能告訴編輯這不是內容壞掉。
  - 狀態：已寫入，commit `ed88e1b`。
- `docs/content-pipeline/operations.md`〈驗證〉：**追加一則補述**，不改原句。
  - 已定方向：在暫存目錄跑同步時，exit 0 不代表通過；要確認輸出含 `🚀 Starting Content Sync...` 與兩行 `✅ 檢查通過`；暫存目錄用 `pwd -P` 取得解開後的路徑。
  - 尚未實作的狀態：明寫「目前經符號連結路徑執行會 exit 0 而不做事；070 已定方向，尚未實作」。
  - 驗證目標：070 合併後，AC-9(a)(b) 通過，補述改為現況。
  - 狀態：已寫入，commit `ed88e1b`。

### 實作後更新

- `docs/content-pipeline/operations.md`〈錯誤與復原〉：追加三行，對應三種新訊息（`發布版連續 8 次都還沒算完`、`重抓期間發布內容改變了`、重抓通知），並在〈現在更新〉那則補述下加一句「070 已合併，現況見上」。原句保留。
- `docs/content-pipeline/operations.md`〈驗證〉：在〈現在更新〉的入口判斷補述下加一句「070 已合併：經符號連結路徑執行會正常同步；無法判斷時印 `⛔ 入口判斷失敗` 並 exit 1」。原句保留。
- `docs/content-pipeline/design.md`〈修訂紀錄〉：追加一則「2026-xx-xx — 同步對未算完快照重抓（feature 070）」，寫明改了什麼、**沒有改什麼**（第四節檢查、第六節不變式、040 的指紋比對全部未動），以及不變式 #3 如何維持（用盡仍整份中止），並記入口判斷的 fail-open 修正。

### 不更新

- `docs/content-pipeline/design.md` 第四節與第六節：檢查規則與不變式都沒有改變。
- `docs/INDEX.md`：沒有新增或刪除文件。
- `AGENTS.md`：同步的禁令與驗證方式不變。
- `docs/project/tech-stack.md`、`docs/project/architecture.md`：資料流沒有改變。
- `docs/constitution-features/050-ssot-approval-deployment.md`：`050` 的 AC-2 重跑由 `050` 自己處理（本票 Out of scope）。

### Feedback Cycles

## Out of scope

- 放寬或繞過 `040` 的核可綁定驗證。
- `050` 的 AC-2 重跑本身（由 `050` 處理）。

## Stage Report: design

- DONE: Characterize the Google published-CSV behavior with read-only fetches (how often and how long the 載入中… snapshot appears, whether it is all-or-nothing per fetch) and specify how sync-content.mjs distinguishes a mid-calculation snapshot from a real content mismatch — retry policy with bounded attempts — without loosening 040's approval-binding validation in any way.
  Risk evidence 第 1–3 節：3×240 次唯讀 GET（`Track 2` 41／240 未算完、最長連續 6 次約 60 秒、每次只會是三種全文之一、內容雜湊恆為一種）；Proposed approach 以「只在衍生欄出現未算完值時重抓，最多 8 次，內容投影必須相同，驗證函式逐位元組不動」分辨；8 次排程以實測序列重播 0／240 失敗。
- DONE: Acceptance criteria each carry a falsifiable Verified by; at least one measures the end value against fixtures: with a flaky 載入中… source the sync eventually succeeds or fails with a distinguishable message, and a genuine fingerprint mismatch still aborts the whole sync.
  AC-1（輸出與一次成功逐位元組相同、請求恰 3 次）、AC-2（用盡時請求恰 8 次、訊息可辨識、零寫入）、AC-3（內容不符只抓 1 次並整份中止）；AC-1 至 AC-9 各附「哪個改動會讓它失敗」。
- DONE: Split documentation impact into 現在更新 / 實作後更新 / 不更新 (operations.md error table at least), each listing documents or 無.
  現在更新兩筆 operations.md 補述已寫入 `ed88e1b`；實作後更新列 operations.md 兩處與 design.md 修訂紀錄；不更新列五份並附理由。
- DONE: 併入 captain 2026-09-29 核准的第二個缺陷（入口判斷 fail-open）並改名為 `070-…`。
  design 階段在 main `35b015f` 重現：`/var` 路徑與符號連結目錄皆 exit 0 零輸出，連環境變數未設定都不報；AC-9 以 `resolveEntry` 的 `run／import／mismatch` 三態規格化；`status --resolve 070` 回傳新路徑。

### Summary

設計把重抓放在抓取層，`040` 的驗證函式列為逐位元組不可動；只有 `status`／`current_fingerprint` 完全等於 `載入中…`、`Loading...`、`#NAME?` 時才重抓，被採用的快照必須自己通過完整驗證且內容投影與先前快照相同，所以重抓只影響「多早成功」，不影響「什麼能上線」。實測另發現 `#NAME?` 是第二種未算完值（`site_tldr` 4 次、`Track 2` 8 次，與 064 在 20:21Z 的觀察一致），以及未算完快照集中在 `20:16`–`20:23Z` 的密集期；根因推測為 `PUBLISHED_ROW_SEQUENCE` 的計算量，本票不處理。全程零寫入正式試算表、未執行 `npm run sync-content`、`src/data` 未變動。

## Stage Report: implement

- DONE: Implement the design's bounded re-fetch in the fetch layer of sync-content.mjs (retry only when status or current_fingerprint is exactly 載入中… / Loading... / #NAME?, at most 8 fetches with the specified waits, adopted snapshot must pass full validation alone and match earlier content projections) and the resolveEntry run/import/mismatch fix — with 040's validation functions and content-fingerprint.mjs byte-for-byte unchanged.
  `4bfe3c3`：`findPendingCells`／`fetchSettledCSV`／`report` 結尾句分支／`resolveEntry`，`main()` 只改一個呼叫；`sync-content.mjs` 淨增 162 行（容許 70–170）。AC-7(b)：`git diff main -- scripts/content-fingerprint.mjs` 零行；擷取 16 個不可動函式（`function X(` 到第一個第 0 欄 `}`）與 main 比對，16／16 相同。
- DONE: Prove AC-1..AC-9 against fixtures with their stated failing changes (flaky source succeeds with identical output and exact request count; exhaustion fails with the distinguishable message and zero writes; a genuine mismatch fetches once and aborts; symlinked/`/var` entry fails loudly); run AC-8's read-only live runs; no-write sync with pwd -P paths byte-identical to src/data.
  67／67 通過（既有 50 行零刪改，新增 234 行）。否證演練，每項都改壞後重跑再還原：`MAX_FETCH_ATTEMPTS=1` → AC-1/2/4/5/6(a) 失敗；拿掉投影比對 → 只有 AC-5 失敗；用盡時把快照交給驗證 → AC-2 失敗；改成子字串比對 → AC-6(a)(b) 失敗；入口判斷改回字串比對 → AC-9(a)(b)(c) 失敗；把 mismatch 當 import → AC-9(c) 失敗。
  AC-3 證明內容真的不符時只抓 1 次，最後一行是 `請修正 SSOT 後重試。`。AC-7(a) 證明 `buildTrack2` 遇到未算完快照仍回傳 null。另加一格單元測試，確認等待為 10/10/20/30/45/60/90 秒，且網路錯誤只抓 1 次。
  AC-8：對正式表唯讀跑 10 次（`node --env-file=<repo>/.env.local`，`CONTENT_OUTPUT_DIR` 為 `pwd -P` 暫存目錄，21:04:44Z–21:05:42Z）。10 次都 exit 0，兩個 JSON 的 sha256 都等於 `src/data`，stderr 0 byte。重抓**實際觸發**於第 2、3、8 次：第 2 次先抓到 36 列 `#NAME?`，再抓到 1 列 `載入中…`，第 3 次成功；第 3 次先抓到 36 列 `載入中…`，第 2 次成功；第 8 次先抓到 36 列 `#NAME?`，第 2 次成功。
  AC-8 新觀察：Risk evidence 只記錄到 `#NAME?` 出現在 `status`。這次兩個衍生欄同時是 `#NAME?`，也出現只有 1 列、只有 `status` 的 `載入中…`，兩種都照規格處理。worktree 與 main 的 `git status --short src/data` 都沒有輸出。
- DONE: Update docs per 實作後更新 (operations.md notes to implemented state, design.md revision entry), including fixing 050's stale link in operations.md 〈同步〉 to 070-sync-csv-loading-snapshot.md; full suite and tsc pass; never run npm run sync-content, never write to the spreadsheet.
  `5a2f79c`：operations.md〈同步〉連結改為 `070-…`。〈錯誤與復原〉追加「070 已合併」一句與新補述（重抓通知、兩種 `快照` 訊息、不變的不符訊息）。〈驗證〉追加入口判斷現況。原句都保留。design.md 追加修訂紀錄，寫明改了什麼、沒改什麼、不變式 #3 怎麼維持。
  `npx tsc --noEmit` exit 0；`npm run build` exit 0，前後 `src/data/*.json` 的 sha256 相同。全套 116 項：114 過、1 skip、1 失敗。失敗的是 `threshold-analysis` 的「AC-7 build 指令與寫出產線檔…」，main 上同樣失敗，原因是 040 既有 `runSync` 的 fixture 寫入觸發該守衛。不是本票造成的，本票沒有修改它，見下方旗標。整個過程沒有執行 `npm run sync-content`，也沒有寫入試算表。

### Summary

重抓放在抓取層，040 的驗證函式與 `content-fingerprint.mjs` 逐位元組未動；入口判斷改為 realpath 比對，認不出時 `⛔ 入口判斷失敗` exit 1。唯讀實跑 10 次中有 3 次真的碰到未算完快照並自動恢復，輸出與 `src/data` 相同。
給 FO 的旗標：(1) 與 064 合併：程式碼無衝突，合併樹上兩票測試 84/84 通過；但 `design.md` 修訂紀錄兩票都在檔尾追加，會有一處 append-append 衝突，兩則都保留即可。為了相容 064 新增的 `../src/data/verified-case-refs.mjs` import，AC-9 的符號連結改指向 repo 的 `scripts/`，而不是複製兩個檔案（AC-9(a) 字面寫的是複製），否證力不變。
(2) verify 做 AC-7(b) 時，若 064 已先合併，`buildTrack2` 與 `content-fingerprint.mjs` 會因 064 合法地與 main 不同；請改對 merge-base `cefeeee` 比對。(3) `threshold-analysis` 的 AC-7 守衛在 main 上已經失敗，是既有問題，需要另開票或由該票處理。

- DONE: FO-authorized fix from review（R1，Polish）：合併 current main 後，`operations.md` 有兩句仍描述 070 之前的行為，各追加一則日期補述，原句保留。
  合併 main（`git merge main`）：`design.md` 修訂紀錄的 append-append 衝突保留兩則（064 在前、070 在後）。本票 frontmatter 的 `status` 取 main 的 FO 鏡像值。operations.md 在加欄程序「錯誤訊息含「載入中…」…重跑一次」與〈同步〉「同步印出多行 `實際為「載入中…」` 並中止」之後各追加補述，`git diff main` 只有這兩則是新增的 `+` 行。合併樹全套 137 項：136 過、0 失敗、1 skip。在不含 `.next` 的乾淨副本上 `npx tsc --noEmit` exit 0；worktree 內的 `.next/types/` 有並行建置留下的 `routes.d 2.ts` 重複檔，會讓 tsc 報 TS2300。那是 gitignore 的產物，未刪除。

## Stage Report: verify

- DONE: Independently re-run AC-1..AC-9 against fixtures including each stated failing change, and confirm by diff against merge-base cefeeee that 040's 16 validation functions and content-fingerprint.mjs are byte-for-byte unchanged (AC-7(b)); verify the retry trigger is exact-match only (載入中… / Loading... / #NAME?) and a genuine fingerprint mismatch still fetches once and aborts the whole sync with the unchanged message.
  `node --test tests/approval-content-version-binding.test.mjs`：67／67 通過。AC-7(b)：`git diff cefeeee -- scripts/content-fingerprint.mjs` 0 行；以兩種擷取法（到下一個頂層宣告、到第 0 欄 `}`）比對 16 個函式，16／16 相同；同一腳本在改一個字（`實際為`→`實際是`）後報 5 個 DIFF，證明比對有鑑別力。main 已含 064，所以依指示對 `cefeeee` 比對，未對 main。整份 diff 只動 CONFIG、`report` 結尾句、`fetchCSV` 注入參數、新抓取區塊、`main()` 一行、檔尾入口；`addError`、`rowKey`、欄位常數等被驗證函式呼叫的輔助程式也未動。AC-7(c)：測試檔 diff 沒有 `-` 行。
  觸發條件：`PENDING_FORMULA_VALUES.includes(record[field])` 只掃 `DERIVED_FIELDS`；`toRecords` 已 trim，符合「去掉頭尾空白後完全等於」。
  否證演練在 scratchpad 複本執行（`git archive HEAD`，worktree 未改動），每項改壞、跑測試、還原：
  重抓上限 1 → AC-1/2/4/5/6(a) 失敗；上限 2 → AC-1/2/6(a) 失敗；上限 9 → AC-1/2 與間隔單元測試失敗（證明「恰 8 次」被量到）。
  拿掉投影比對 → 只有 AC-5 失敗。重抓後改採先前的未算完快照 → AC-1/5/6(a) 失敗。
  用盡時把快照交給驗證 → AC-2 失敗；拿掉結尾句分支 → AC-2、AC-5 失敗。
  改成掃所有欄 → AC-6(b) 失敗；清單拿掉 `#NAME?` → AC-6(a) 失敗。
  算完的快照也一直重抓 → AC-3（請求次數 >1）、AC-4 等失敗。在 `checkStatusValues` 放行 `載入中…` → AC-7(a) 失敗。
  入口改回字串比對 → AC-9(a)(b)(c) 失敗；mismatch 當 import → AC-9(c) 失敗；一律執行 → AC-9(c)(d) 失敗。還原後 67／67。
  觀察（不列 finding）：只在衍生欄內改成子字串比對，測試不會失敗。三個清單值不會出現在正常指紋或 `#FINGERPRINT! …` 裡，所以行為等價，無害。
- DONE: Re-run the read-only live check yourself (several no-write syncs with pwd -P temp paths): every successful run byte-identical to src/data, any retry visible in stderr, and no run that exits 0 without writing both files; confirm the entry-point fix makes a symlinked or /var invocation fail loudly instead of silently exiting 0.
  10 次唯讀實跑（`node --env-file=<repo>/.env.local scripts/sync-content.mjs`，`CONTENT_OUTPUT_DIR` 為 `pwd -P` 暫存目錄，21:36:02Z–21:42:00Z）：10／10 exit 0，兩個 JSON 的 sha256 都等於 `src/data`，每次都印 `🚀 Starting Content Sync...` 與兩行 `✅ 檢查通過`，stderr 皆 0 byte。6 次發生重抓（重抓 7、1、1、2、1、3 次）。重抓通知依設計印在 **stdout**，不是 stderr；checklist 寫 stderr 與設計不符，以設計為準。
  入口判斷（`/var/folders/…` 暫存目錄，三個 CSV 網址為空）：`cefeeee` 的程式複製到 `/var` 路徑 → exit 0、零輸出（重現原缺陷）；本分支複製到 `/var` 路徑、經符號連結目錄執行 → 兩者都 exit 1，stderr `環境變數未設定`；另一個也叫 `sync-content.mjs` 的檔案匯入本程式 → exit 1，stderr `⛔ 入口判斷失敗`。
  `git status --short src/data` 在 repo 與 worktree 都沒有輸出。
- DONE: Check the operations.md and design.md updates against delivered behavior (070 link fixed, messages match code verbatim), placeholder scan over the diff, tsc and build pass, only the known pre-existing test failure; confirm no sync-content run and no spreadsheet write.
  operations.md〈同步〉連結改為 `070-sync-csv-loading-snapshot.md`，檔案存在。新補述的四句訊息都與程式字串逐字相符（重抓通知、`第 N 次抓到算完的發布版`、`發布版連續 8 次都還沒算完`、`重抓期間發布內容改變了`、結尾 `…不是內容錯誤。等 5 分鐘後重試。`）。間隔 10/10/20/30/45/60/90 與 265 秒上限都相符。原句都保留，只有連結那一行被改，這一行是 checklist 要求的修正。design.md 修訂紀錄的描述與 diff 相符。
  佔位資料掃描：diff 的 `+` 行沒有 `某學者`、`某大學法律系`、`lorem ipsum`、`快速了解最新判決的5個重點`。`test` 只出現在測試檔的 `test(`、`t.test(` 與 fixture 網址 `example.test`。`src/` 零變動，沒有資料檔。
  `npx tsc --noEmit` exit 0。`npm run build` exit 0，前後 `src/data/*.json` 的 sha256 相同。全套 `node --test tests/*.test.*`：116 項，114 過、1 skip、1 失敗；失敗的是 `threshold-analysis` 的 AC-7，是已知問題，由 068 修正。
  本階段沒有執行 `npm run sync-content`。對試算表只做唯讀 GET：10 次同步，以及 14 次 `curl` 探測。

### Findings

- F1（Deferred risk，交 FO）：重抓預算在實測中用到最後一次。實跑第 1 次（21:36:02Z 起）連續 7 次拿到 `Track 2` 36 列 `載入中…`，第 8 次才成功，共等 265 秒。
  - 使用者與流程：編輯發布內容時執行同步。
  - 可觀察的傷害：若第 8 次也是未算完快照，同步會失敗，編輯要等 5 分鐘重跑。錯的內容不會上線，零寫入，訊息也正確指出不是內容錯誤。
  - 相關 AC 或邊界：影響 AC-8 的「10 次全部 exit 0」。design 的重播是 0／240 失敗，當時最長連續 6 次（約 60 秒），且 design 已註明「不能證明 8 次一定夠」。040 的邊界沒有受影響。
  - 觸發證據：本次實跑記錄。之後 14 次 `curl` 探測（21:43–21:45Z）有 3 次未算完，沒有再出現長段。
  - 升級為 Material 的條件：真實同步因 `快照  發布版連續 8 次` 失敗，或重跑後仍失敗。
  - 次數與間隔是 captain 核准的規格值。是否調整由 captain 決定，本票不改。
- F2（Polish）：spacedock 完成時會把票移到 `_archive/`，operations.md 指向 `070-…` 的連結屆時會失效。`050` 的連結（operations.md:39）已經是這種狀況，所以這是既有的通用模式，不是 070 造成的。

### Summary

PASSED。AC-1 至 AC-9 全部由我獨立重跑通過，AC-8 也通過（10／10 exit 0，輸出與 `src/data` 相同，6 次實際重抓）。14 項否證演練都讓對應測試失敗，還原後全綠。另一項（只在衍生欄內改成子字串比對）不會讓測試失敗，但行為與原本等價，見報告內的觀察。040 的 16 個函式與 `content-fingerprint.mjs` 對 `cefeeee` 逐位元組相同。入口修正讓 `/var` 路徑與符號連結路徑正常執行；認不出入口時 exit 1。F1 記錄一次用到第 8 次才成功的實跑，屬 Deferred risk，交由 FO 或 captain 決定是否調整重抓預算。

## Stage Report: review

- DONE: Review the diff against the design for what verify did not own: code quality and readability of findPendingCells / fetchSettledCSV / resolveEntry and the report branch in sync-content.mjs (conventions, no loosening of 040's validation, bounded loop clearly terminating, waits and limits named not magic), and whether the new tests are necessary rather than duplicated.
  `sync-content.mjs` 對 `cefeeee` 只有 6 個 hunk（CONFIG、`report` 結尾句、`fetchCSV` 注入參數、新抓取區塊、`main()` 一行、檔尾入口），合併 main 後對 main 仍是同樣 6 個 hunk；16 個不可動函式沒有落在任何 hunk 內，`content-fingerprint.mjs` 對 main 0 行。
  `findPendingCells` 沿用 `parseCSVRows`／`buildColumnMap`／`toRecords`／`rowKey`，不另寫解析器；空 CSV 先回 `null`，避開 `buildColumnMap` 讀 `rows[0]`。重抓條件是 `PENDING_FORMULA_VALUES.includes` 只掃 `DERIVED_FIELDS`，完全相等。被採用的快照原樣交給 `buildTrack1/2`、`buildSiteTldr`，040 沒有被放寬。
  迴圈的最後一輪（`attempt === MAX_FETCH_ATTEMPTS`）每一條分支都 `return`，不會跑出迴圈；上限、間隔、未算完值、錯誤鍵都是具名常數。等待只能由 `CONTENT_SYNC_RETRY_DELAY_SCALE` 縮放，無效值退回 1，不影響次數。`resolveEntry` 三態與規格逐條相符。註解密度與中文風格和本檔既有區段一致。
  測試：15 項新測試（9 個 top-level、6 個 subtest）各對一條 AC。`fetchSettledCSV` 間隔單元測試不是重複：子程序測試把等待設為 0，只有它量得到 10/10/20/30/45/60/90 秒與「網路錯誤只抓 1 次」。AC-9(a) 重跑一次直接執行的基準，比 AC-1 多花一次子程序，可接受。暫存目錄不清除，與既有 `runSync` 慣例相同。
- DONE: Check every ## Documentation impact row against delivered behavior (operations.md 〈同步〉/〈錯誤與復原〉/〈驗證〉, design.md revision entry) and that record docs are untouched; merge interplay with 064 now on main (design.md revision-log append-append, AC-9 symlink approach).
  〈實作後更新〉三筆都已完成，四種訊息與程式字串逐字相符（我自己的實跑輸出也逐字對上）。〈同步〉只改連結一行，是 checklist 要求的修正。〈不更新〉各筆仍成立：沒有新增或刪除文件，`docs/INDEX.md` 不需動。diff 只碰本票、`operations.md`（evergreen）、`design.md`（INDEX 標為 plan）；沒有 `record` 文件被改。
  合併 main（scratch worktree，未提交到本分支）：`design.md` 修訂紀錄有一處 append-append 衝突，兩則都保留即可（064 在前、070 在後）；本票 frontmatter 另有一處 `status` 衝突，來自 main 的狀態鏡像，由 FO 處理。`sync-content.mjs`、測試檔、`operations.md` 自動合併。AC-9 改用指向 repo `scripts/` 的符號連結，在合併樹上能解析 064 新增的 `../src/data/verified-case-refs.mjs`，AC-9 四格通過；否證力由 verify 的「入口改回字串比對 → AC-9(a)(b)(c) 失敗」演練證明。
  見 Findings R1：合併後 `operations.md` 有兩句描述 070 之前的訊息。
- DONE: Identify regressions on the branch merged with current main (full suite 0 fail now that 068 is merged, tsc, build, one no-write sync with pwd -P byte-identical to src/data) and end with a clear PASSED or REJECTED verdict; F1 (budget at its edge) is a captain-accepted Deferred risk, not a finding.
  main `dfa6170` 全套 `node --test tests/*.test.*`：122 項，121 過、0 失敗、1 skip。合併樹（`61e5751` + main）：137 項，136 過、0 失敗、1 skip；多出的 15 項正是本票新增的測試。`npx tsc --noEmit` exit 0。`npm run build` exit 0，前後 `src/data/*.json` sha256 相同。
  不落地同步一次（合併樹的程式，`node --env-file=<repo>/.env.local`，`CONTENT_OUTPUT_DIR` 為 `pwd -P` 暫存目錄，22:08:54Z–22:09:25Z）：exit 0，stderr 0 byte。本次**實際觸發重抓**：`Track 2` 連兩次 36 列 `載入中…`，第 3 次成功。兩個 JSON 的 sha256 與 `src/data` 相同（`4071978a…`、`4d1992e3…`）。repo 的 `git status --short src/data` 無輸出。
  沒有執行 `npm run sync-content`，沒有寫入試算表。scratch worktree 與暫存輸出已刪除，沒有留下執行中的程序。F1 依指示不列為 finding。

### Findings

- R1（Polish，建議合併時一併處理）：合併 main 後，`operations.md`（evergreen）有兩句仍描述 070 之前的行為。
  - 使用者與流程：captain 或工程依手冊跑同步，或跑 064 加欄程序的不落地同步。
  - 可觀察的傷害：070 合併後，未算完快照不會再印出「實際為「載入中…」」，而是先自動重抓，用盡時印 `快照  發布版連續 8 次都還沒算完`。這兩句寫的觸發訊息不會再出現。但新訊息自己寫明「不是內容錯誤…等 5 分鐘後重跑」，〈錯誤與復原〉也已有新補述，所以操作者仍會做對。
  - 相關 AC 或邊界：無 AC 受影響；不涉及 040 的邊界。
  - 觸發證據：合併樹 `operations.md` 的〈同步〉補述「同步印出多行 `實際為「載入中…」` 並中止」（本票只改了該段的連結），以及 064 帶進 main 的加欄程序句「錯誤訊息含「載入中…」或 `status` 為 `#NAME?` 時，重跑一次。」（本票分支建立時還不存在）。
  - 建議處置：合併時在兩句下各追加一行補述，不改原句，例如「070 合併後同步會自動重抓；用盡時訊息是 `快照  發布版連續 8 次都還沒算完`，一樣等 5 分鐘重跑。」由 FO 決定是否授權。

### Summary

PASSED。程式碼只在抓取層、`report` 結尾句與入口判斷動手，040 的驗證函式與指紋模組在合併前後都逐位元組未動；重抓迴圈有明確上限，每個分支都終止，常數都具名。合併 current main 後全套 137 項 0 失敗，tsc 與 build 通過；一次不落地實跑真的碰到 `載入中…` 並在第 3 次恢復，輸出與 `src/data` 相同。唯一 finding R1 是兩句過時的手冊敘述（其中一句是 064 合併後才出現的），屬 Polish，建議合併時順手補述。
