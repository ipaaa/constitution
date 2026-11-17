---
id: 079
title: 讓審閱的老師看得到成品：同步錯誤與預覽連結的轉交機制
status: implement
source: docs/health-check/TODO.md P2-9（「尚未有對應的票」）；2026-09-03-editor-onboarding.md:453
started: 2026-11-17T19:08:14Z
completed:
verdict:
score: 0.7
worktree: .worktrees/spacedock-ensign-reviewer-preview-delivery
issue:
pr:
mod-block:
---

老師審閱時，要能看到內容在網站上的實際呈現，不能只看試算表的儲存格。

## Problem

- 老師在試算表只看得到儲存格；網站只顯示已核可的列。
- 現行做法是 captain 看過 PR 的 Vercel 預覽網址後，手動把連結貼進群組。`2026-09-03-editor-onboarding.md:453` 原文：「這兩個環節完全靠人記得做」。
- 忘記轉貼，審閱者就看不到成品。這是 P2-9 指出的根源（test 字串與佔位摘要能通過核可）。它違反 `docs/content-pipeline/design.md` 的不變式 #6（約定必須能被機器驗證）。TODO 註明：「尚未有對應的票」。
- `/preview` 是寫死假資料的風格頁，不是解法。060 的 `?public=true` 開關不涵蓋 `/past`。

## Proposed approach

> ⚠️ **第二輪補述（2026-11-17）：本節到〈語意變更〉是第一輪的方案 C。定稿改為方案 D，見〈定稿：方案 D「單檔 HTML 審閱檔」〉。第一輪的 D1–D8 已併入〈現在就要決定〉。** 原文保留供比較。

### 一句話結論

採用「審閱版」。captain 在 `review/<日期>` 分支產生一份含未核可列的網站版本。連結寫進試算表，放在老師簽核的那一列旁邊。正式同步再檢查：每一列核可的內容版本，都要有一筆已送出的審閱版連結。沒有就整份中止。

最便宜的做法（PR 範本加必填勾選）不夠用，理由見下面的風險證據。狀態檢視頁也不採用。

### 風險證據（2026-11-17 查證，全程唯讀）

| # | 事實 | 怎麼查到的 | 對設計的影響 |
|---|---|---|---|
| R1 | 同步只取 `status = Approved` 的列。PR 預覽因此只看得到已核可的列 | `scripts/sync-content.mjs:675`（Track 1）、`:730`、`:815` 的 `records.filter(isApproved)` | 老師先簽核、之後才核可。PR 預覽在簽核之後才出現，順序反了 |
| R2 | 078 第一批要審的 `h2`、`h28` 都沒有核可，也不在網站資料裡 | `node -e` 讀 `src/data/history.json`：40 筆，`h2`、`h28` 皆不存在 | 現行的 PR 預覽永遠看不到 078 第一批的內容 |
| R3 | Vercel 的預覽網址與部署網址都要先登入 Vercel | `curl -sI` 三個網址（`constitution-git-main-…`、`constitution-noauya0pr-…`、`constitution-ipas-projects-…`）都回 `302`，導向 `vercel.com/sso-api` | 沒有 Vercel 帳號的老師，拿到原始預覽連結也打不開 |
| R4 | 預覽連結會失效 | PR #33 的分支網址回 `404`，PR #49 的回 `410` | 群組裡貼過的連結不能當紀錄 |
| R5 | repo 沒有 `.github/`，沒有 PR 範本，也沒有 CI | `ls .github` 回 No such file。`gh pr list` 顯示內容同步 PR 只有 #33 一次 | 「PR 範本必填項」要從零建，而且沒有機器讀它 |
| R6 | 同步遇到看不懂的欄位標題會整份中止 | `scripts/sync-content.mjs:321-324` | 試算表新增 `review_link` 欄，必須在程式合併之後 |
| R7 | GitHub repo 是公開的 | `gh api repos/ipaaa/constitution` 回 `public` | 推 `review/*` 分支，未核可的草稿會出現在公開 repo。需要決定，見 D2 |

R3 有一點我不確定：2026-09-03 captain 把預覽連結貼進群組，紀錄沒有寫學者打不打得開。可能當時的保護設定不同，也可能沒有人試過。

### 三個方案的比較

**A. PR 範本或檢查清單加一項必填「預覽連結已轉交」（最便宜）——不採用。**

- 勾選框是人自己宣告做了。機器沒辦法驗證，仍違反不變式 #6（R5）。
- 就算有轉交，連結裡也沒有老師要審的列（R1、R2）。
- 就算有那些列，老師也打不開連結（R3）。
- 連結貼在群組，事後會失效，查不到老師當時看的是哪一版（R4）。

**B. 網站上做一頁「狀態檢視頁」，列出所有列含未核可的——不採用。**

- 網站要顯示未核可的列，只有兩條路。一是部署時抓試算表，違反 `AGENTS.md:19` 與不變式 #1。二是把未核可內容放上正式站，違反不變式 #7。

**C. 審閱版＋試算表內的連結＋正式同步的轉交檢查——採用。**

### 方案 C 的流程

```
① 責任編輯／協作者在試算表改內容（列的 status 變成 Needs review）
② captain 切到 review/<日期> 分支，執行 npm run review-build
     → 取「不是 Rejected」的列，跑同一套內容檢查
     → 通過的列寫進 src/data/*.json，未通過的列記下錯誤
     → 寫 src/review-build/manifest.json（審閱版編號、每列指紋、狀態、錯誤）
③ captain commit 並 push。Vercel 自動部署這個分支
④ captain 依 D1 取得老師打得開的連結，執行 npm run review-deliver -- <連結>
     → 程式實際打開該連結，確認回 200，而且頁面就是這份審閱版
     → 確認後才印出一段表格文字
⑤ captain 把表格貼進試算表的「審閱版本」分頁
     → Track 1 每列的 review_link 欄自動顯示連結，或顯示該列的檢查錯誤
⑥ 老師打開該列的連結看成品，在同一列簽核（076）
⑦ 責任編輯以 076 的選單「核可選取列（附老師簽核）」一次寫入核可與簽核（040 綁定當下指紋）
⑧ captain 在 main 執行正式同步
     → 新檢查：每列核可的 approved_fingerprint 都要在「審閱版本」分頁有一筆、而且有連結
     → 缺任何一列就整份中止，錯誤訊息寫出列號
⑨ 開 PR、對 diff、合併（不變）
```

### 漏轉交怎麼被抓到（不變式 #6）

「轉交」的定義改成：**連結出現在「審閱版本」分頁，並對到該列的內容版本。** 不再指群組裡有沒有人貼連結。

- 老師看到連結的地方，就是他簽核的那一列。連結不進分頁，`review_link` 欄就是空的。
- 正式同步讀這個分頁（新環境變數 `REVIEW_BUILDS_CSV_URL`）。核可版本對不到任何一筆有連結的紀錄，就整份中止。這張網子抓的是「漏轉交」。
- 內容在送出審閱版之後被改，指紋就會變。`review_link` 欄會改顯示「審閱版已過期」。舊連結也通不過同步檢查。這張網子抓的是「老師看的是舊版」。
- `review-deliver` 會先打開連結才產出表格。Vercel 要求登入時，程式會回報失敗、不印表格。這張網子抓的是「老師打不開」。
- 正式網站的部署遇到審閱版資料會失敗（`next.config.ts` 的守門）。即使 `review/*` 分支被誤合併，未核可內容也上不了正式站。

**做不到的事，直說：** 這套檢查只能證明連結送到老師簽核的那一列、而且打得開。它不能證明老師真的點開看過。這一段要靠 076 的簽核紀錄。

### 同步錯誤怎麼轉交

2026-11-16 起老師不改內容。同步錯誤是寫內容的人要修的，不是老師要修的。

- **單列的錯誤**（佔位字串、必填空白、年份格式等）：`review-build` 不放這一列進審閱版，錯誤原文寫進「審閱版本」分頁，`review_link` 欄顯示這段文字。責任編輯與協作者在試算表就看得到，不必有人轉貼。
- **整份的錯誤**（標題列、抓取失敗、環境變數）：`review-build` 整份中止，不產出審閱版。標題列只有 captain 改得動，所以只有 captain 需要知道，不必轉交。
- 正式同步的錯誤處理不變，仍是整份中止（不變式 #3）。審閱版「略過有錯的列並寫明原因」是刻意的語意差異：審閱版不是發布，而且略過的列會明確列出，不是靜默。

### 誰在哪一步負責

| 步驟 | 誰 | 漏做時誰會發現 |
|---|---|---|
| ② 產生審閱版 | captain | 正式同步中止，訊息寫出列號 |
| ④ 確認連結打得開 | captain（`review-deliver` 代為驗證） | `review-deliver` 失敗，不產出表格 |
| ⑤ 貼進「審閱版本」分頁 | captain | 老師看到 `review_link` 欄空白；正式同步中止 |
| 通知老師「這一輪可以看了」 | 責任編輯（建議，見 D4） | 機器抓不到。但老師不會看到錯的版本，只是晚看到 |
| ⑥ 簽核 | 老師（076） | 076 的檢查 |

### 與 076 的銜接

076 的規格見 `docs/constitution-features/teacher-review-role-and-signoff.md` 第三節與第 6.1 節。兩票已用 SendMessage 互相告知介面。

**076 提供的東西，本設計直接沿用：**

- 簽核三欄 `signoff_by`、`signoff_ref`、`signoff_fingerprint`，放在 Track 1 的 `current_fingerprint` 右側。`review_link` 欄放在這三欄旁邊。
- 老師留言「同意，版本 `xxxxxxxx`」。短碼是 `current_fingerprint` 的前 8 字元。「審閱版本」分頁多一欄 `short_code`，`review-deliver` 印出的表格也帶短碼。老師在連結旁邊就看得到要引用的短碼。
- 選單 `Review → 核可選取列（附老師簽核）`：責任編輯一次寫入核可與簽核（076 第 3.3 節）。
- 同步的簽核摘要（076 第 3.6 節）列出「未簽」的 id 與短碼。審閱版本分頁列出的是同一批列，兩份清單可以互相對照。

**順序：兩票已一致，待 captain 確認（D7＝076 的 D-6b）。** 076 在 commit `d47bf29` 改為建議本設計的順序（076 稱「順序 A」，本文稱「順序 C」）。下面的比較保留，供 captain 判斷。

**實作前要和 076 一起定的事：** Track 1 的欄位順序（`signoff_*` 三欄在 `current_fingerprint` 右側，`review_link` 是新的 A 類公式欄）、保護範圍總數（076 不含本票時是 13 個）、權限行為測試的格子數。兩票要用同一份數字，再進 implement。

**原本的分歧：**

076 第 6.1 節的前提是：同步只寫已核可的列，所以老師看得到成品時，那一列一定已經核可。076 因此建議「順序 B」：責任編輯先不附簽核核可 → 同步 PR → 老師看預覽 → 老師留言 → 責任編輯對同一版本附簽核再核可一次。

本設計的審閱版拿掉了這個前提：審閱版不經核可也能顯示未核可的列。所以多出第三種順序，這裡稱為「順序 C」。

| | 順序 B（076 建議） | 順序 C（本設計） |
|---|---|---|
| 步驟 | 先核可 → 同步 PR → 老師看 PR 預覽 → 留言 → 再核可一次（附簽核） | 審閱版 → 老師看 → 留言 → 核可一次（附簽核） → 同步 PR |
| 老師看的東西 | PR 預覽。只有已核可的列 | 審閱版。含未核可的列 |
| 老師簽核前內容會不會上線 | **會**。第一期同步不擋未簽的列（076 第 3.6 節），PR 一合併就上線 | 不會。轉交檢查擋住沒送過審閱版的核可列 |
| 核可次數 | 每列兩次 | 每列一次 |
| 076 第二期（D-5）開啟後 | **失效**。未簽的列不會進 PR 預覽，老師看不到（076 第 6.1 節自己寫明） | 不受影響。審閱版不看簽核 |
| `h2`、`h28` | 要先核可才看得到。`h2` 的法律內容尚未確認，核可它等於先放行再審 | 不必核可就看得到 |
| 新增程式 | 少。不需要 `review-build` | 多。`review-build` 約 200 行 |
| 老師打不開預覽（R3） | 同樣要解決 D1 | 同樣要解決 D1 |

**我建議順序 C。** 主要理由：順序 B 在 076 第二期開啟時會失效，而且在那之前，內容會在老師簽核前上線。

**如果 captain 選順序 B，本設計要改的地方：**

- 正式同步的轉交檢查要拿掉。順序 B 先同步、後送連結，這條檢查會擋住每一次同步。
- 轉交檢查改放在 076 的選單 `核可選取列（附老師簽核）`：該列的指紋在「審閱版本」分頁沒有連結時，選單拒絕寫入簽核。這一項要改 `scripts/apps-script/approval-workflow.gs`，屬於 076 的施工範圍。
- `review-build` 不需要做。`review-deliver` 保留，改對 PR 預覽網址使用。
- 驗收條件 1、2、3、6 要改寫。預估行數約減 250 行。

### 元件與檔案

| 位置 | 做什麼 |
|---|---|
| `scripts/sync-content.mjs` | 匯出三個 build 函式，加參數決定取哪些列。正式模式不變。新增讀「審閱版本」分頁與轉交檢查。`TRACK_1_COLUMNS` 加選填欄 `review_link`。這個欄不在 `PUBLISHED_FIELDS`，不影響指紋 |
| `scripts/review-build.mjs`（新） | `build` 子指令：分支名稱不是 `review/` 開頭就拒絕執行，然後產生審閱版。`deliver <url>` 子指令：打開 `<url>/past`，要求回 200，而且頁面 `<meta name="review-id">` 等於 manifest 的編號，才印出表格 |
| `src/review-build/manifest.json`（新） | main 上固定是 `{"review_id": null, "rows": []}`。放在 `src/data/` 外面，不碰「`src/data/*.json` 不可手改」的規則 |
| `next.config.ts` | `VERCEL_ENV === 'production'` 而且 `review_id` 不是 `null` 時，丟出錯誤，部署失敗 |
| `src/components/review/ReviewBanner.tsx`（新） | 審閱版才顯示的橫幅：「審閱版 <編號>：含尚未核可的內容，不是正式網站」 |
| `src/app/layout.tsx` | 放入橫幅與 `<meta name="review-id">`。meta 在伺服器端輸出，不受 `LaunchGate` 影響 |
| `src/app/past/page.tsx` | 審閱版中未核可的列，標一個「待核可」標記 |
| `package.json` | 新增 `review-build`、`review-deliver` 兩個指令 |
| `tests/review-delivery.test.mjs`（新） | 下面驗收條件的測試 |

**資料形狀。** manifest：`{ review_id: string|null, generated_at: string, rows: [{ sheet, id, fingerprint, status, error }] }`。「審閱版本」分頁欄位：`review_id`、`sheet`、`id`、`fingerprint`、`short_code`、`result`（`OK` 或錯誤原文）、`url`。`fingerprint` 由 Node 依 `scripts/content-fingerprint.mjs` 計算，與試算表的 `current_fingerprint` 相同（040 已保證兩邊一致）。

**`review_link` 欄的公式** 由 captain 在試算表設定，邏輯是：在「審閱版本」分頁找 `fingerprint = 本列 current_fingerprint` 的那一筆。找到而且 `result = OK` 就顯示 `url`。找到而且有錯誤就顯示錯誤原文。找不到就顯示「尚無審閱版，或審閱版已過期」。

**手機與桌機。** 橫幅固定在頁首，文字可換行，手機上最多三行。「待核可」標記與標題同一行，空間不夠時換到標題下方。橫幅與標記只在審閱版出現，正式站的版面完全不變。

### 上線順序（不可反）

1. D1 有結論，而且 captain 用沒登入 Vercel 的瀏覽器（無痕視窗）打開過一次連結。
2. captain 建「審閱版本」分頁（只有標題列）、設保護範圍（只有 captain 能改）、發布成 CSV、把網址加進 `.env.local` 的 `REVIEW_BUILDS_CSV_URL`。
3. 合併程式。
4. captain 在 Track 1 加 `review_link` 欄。**一定在第 3 步之後**，否則正式同步會因看不懂標題而中止（R6）。
5. 第一輪審閱版：078 的第一批（`h2`、`h28`、P0-7）。

第 3 步之後，正式同步會因為既有 40 列沒有審閱版紀錄而中止，直到老師審過一輪為止。見 D3。

### 需要 captain 或會議決定的事（2026-11-26 會議）

| # | 誰決定 | 問題 | 建議 | 可逆嗎 |
|---|---|---|---|---|
| D1 | **captain**（會議前先試） | 老師沒有 Vercel 帳號，怎麼打開連結（R3）？①用 Vercel 的分享連結 ②關掉預覽網址的登入保護 ③把老師加進 Vercel 團隊 | ①。**我不確定你的 Vercel 方案有沒有分享連結功能**，請在 Vercel 後台確認。沒有的話選 ②：任何拿到連結的人都看得到預覽，網站仍有 noindex | 三者都可退回 |
| D2 | **會議** | `review/*` 分支會把未核可的草稿放上公開的 GitHub repo（R7）。可以接受嗎？ | 可以接受。試算表目前就是「發布到網路」，草稿本來就能從網址讀到。不接受的話，改用 Vercel 指令列直接部署，不推分支，但 captain 的電腦要多裝一個工具 | 推上去的內容會留在 git 歷史，**不可逆** |
| D3 | **captain** | 程式合併後、老師審完前，正式同步會中止。要接受，還是讓既有 40 列例外？ | 接受。網站維持現有內容，不會變空。40 列本來就要由 078 重審。開例外等於讓沒人看過成品的內容繼續發布 | 可逆 |
| D4 | **會議** | 誰通知老師「這一輪可以看了」？ | 責任編輯在群組通知。漏通知不會讓老師簽錯版本，只會延後 | 可逆 |
| D5 | **captain** | 轉交檢查先只管 Track 1，還是三個分頁都管？ | 先只管 Track 1。老師審的是 T1（11-17 文件）。Track 2 之後要審時，同一套機制加一行設定即可 | 可逆 |
| D6 | **會議** | 審閱版多久出一次？ | 依 078 的批次，每批一次。不定期 | 可逆 |
| D7 | **captain**（與 076 的 D-6b 一起定） | 老師先看審閱版再簽核（順序 C），還是先核可、看 PR 預覽、再附簽核核可一次（順序 B）？ | 順序 C。順序 B 在 076 第二期開啟時會失效，而且老師簽核前內容就會上線。比較見〈與 076 的銜接〉 | 可逆。但順序 B 期間已上線的未簽內容，不會因改回而消失 |
| D8 | **captain** | 審閱版在 Vercel 預覽網址顯示未核可內容。這算不算違反 `AGENTS.md` 第 5 條（「站上只允許經責任編輯核可的內容」）？076 也把這一項列為待確認 | 不算。第 5 條指正式網站。審閱版有橫幅標明「不是正式網站」，正式部署會擋下它（驗收條件 4）。建議實作後在第 5 條補一句寫明這個例外 | 可逆 |

### 預估檔案、行數與容差

| 檔案 | 預估增減 | 容差 |
|---|---|---|
| `scripts/sync-content.mjs` | +90 | ±40 |
| `scripts/review-build.mjs`（新） | +200 | ±70 |
| `src/review-build/manifest.json`（新） | +1 | — |
| `next.config.ts` | +15 | ±8 |
| `src/components/review/ReviewBanner.tsx`（新） | +40 | ±20 |
| `src/app/layout.tsx` | +8 | ±5 |
| `src/app/past/page.tsx` | +20 | ±12 |
| `package.json` | +2 | — |
| `tests/review-delivery.test.mjs`（新） | +280 | ±100 |
| **合計** | 約 +656 | ±200 |

超過容差上限、或需要改 `scripts/apps-script/`，就停下來回報。設計上不需要改 Apps Script：`review_link` 是試算表公式，不在指紋欄位內。

### 語意變更

- 正式同步多一條中止條件：Track 1 的核可列沒有審閱版紀錄。
- 正式同步多讀一個 CSV（`REVIEW_BUILDS_CSV_URL`）。沒設定就中止（fail closed）。
- Track 1 新增選填欄 `review_link`。不影響指紋，不影響既有核可。
- 新增 `review-build`：會寫 `src/data/*.json`，但只准在 `review/*` 分支執行。它和 `sync-content` 一樣，agent 不得自行執行。
- 正式部署新增一條失敗條件：資料是審閱版。

## 第一輪驗收條件（方案 C，已由方案 D 取代，保留供比較）

1. **審閱版含未核可的列，不含退稿的列。** 試算表有 `Approved`、`Needs review`、`Rejected` 各一列時，審閱版的 `history.json` 含前兩列，不含第三列。manifest 把 `Needs review` 的列標為待核可。
   Verified by: `tests/review-delivery.test.mjs` 以本機 CSV 夾具執行審閱版建置，檢查輸出的 id 與 manifest 狀態。把篩選改回只取 `Approved`，測試會失敗。
2. **單列錯誤寫進表格，不進審閱版。** 一列 `Needs review` 的 `content` 含「某學者」時，該列不在審閱版 JSON。`review-deliver` 印出的表格中，該列 `result` 是錯誤原文，`url` 空白。
   Verified by: 同一測試檔的夾具案例。拿掉對未核可列的佔位字串檢查，測試會失敗。
3. **審閱版只能在 `review/*` 分支產生。** 在 `main` 或其他分支執行 `review-build`，程式以非零結束，`src/data/*.json` 的 sha256 前後相同。
   Verified by: 測試在暫存 git repo 的 `main` 分支執行指令，比對結束碼與檔案指紋。拿掉分支檢查，測試會失敗。
4. **正式網站部署不了審閱版。** manifest 的 `review_id` 不是 `null` 時，`VERCEL_ENV=production npm run build` 以非零結束。`review_id` 是 `null` 時正常完成。
   Verified by: 在 worktree 各跑一次 build，記錄兩次結束碼。拿掉 `next.config.ts` 的守門，第一次會變成 0。
5. **老師打不開的連結產不出轉交表格。** 連結回 `302` 導向 `vercel.com/sso-api` 時，`review-deliver` 以非零結束，不印表格。連結回 200 但 `review-id` 不同時，也失敗。兩者都對時才印出表格。
   Verified by: 測試以本機 HTTP 伺服器模擬三種回應。拿掉狀態碼或編號比對，對應案例會失敗。
6. **漏轉交時正式同步失敗（反證）。** Track 1 有一列已核可，但「審閱版本」分頁沒有該列 `approved_fingerprint` 的紀錄。正式同步以非零結束，錯誤訊息含該列 id，兩個 JSON 都沒有寫入。分頁只有該列舊指紋的紀錄、或紀錄的 `url` 空白，結果相同。補上正確紀錄後同步通過。
   Verified by: `tests/review-delivery.test.mjs` 沿用 `tests/approval-content-version-binding.test.mjs` 的本機 HTTP 夾具，跑四個案例並比對 JSON 的 sha256。拿掉轉交檢查，前三個案例會從失敗變成通過，測試失敗。
7. **沒設定審閱版本分頁就不發布。** `REVIEW_BUILDS_CSV_URL` 未設定時，正式同步中止，訊息寫明缺哪個環境變數。
   Verified by: 測試清空該變數後執行同步，檢查結束碼與訊息。
8. **正式站外觀不變。** main 上 manifest 為 `null` 時，頁面沒有橫幅、沒有 `review-id` meta、沒有「待核可」標記。`npm run build` 前後 `src/data/*.json` 的 sha256 相同。
   Verified by: 在 worktree 執行 `npm run build`，比對 sha256，並以 `react-dom/server` 渲染 layout 與 `/past` 檢查元素不存在。
9. **老師在簽核的那一列看得到連結。** 在測試試算表的一列，`review_link` 依序顯示：連結、改內容後的「審閱版已過期」、有錯誤時的錯誤原文。
   Verified by: captain 在隔離測試表人工操作三次（比照 044 的兩帳號 probe），截圖附在本票。公式無法在 repo 內自動測試，這一項明確是人工驗證。
10. **既有測試不退步。**
    Verified by: `node --test tests/*.test.mjs`、`npx tsc --noEmit`、`npm run build` 全部通過。

## 第一輪文件影響（方案 C，已取代）

### 現在更新

無。first officer 規定 design 階段只寫入本票內文。原本應在本階段補述的 `docs/health-check/TODO.md` P2-9（「尚未有對應的票」已不成立，本票為 079，design 中，尚未實作），移到實作後一併處理。

### 實作後更新

- `AGENTS.md`：「絕對不要做的事」第 1 條加上 `npm run review-build`；新增「不得合併 `review/*` 分支」。
- `docs/content-pipeline/design.md`：第五節流程圖追加補述（第②步之前多一個審閱版步驟），加 captain 操作步驟；〈修訂紀錄〉加一則。原文保留。
- `docs/content-pipeline/gatekeeping.md`：第 5 章防線總表加「轉交檢查」與「正式部署擋審閱版」兩列；第 2 章學者一節寫明看審閱版的位置。
- `docs/health-check/TODO.md`：P2-9 追加補述，指向本票與實作 PR。
- `docs/INDEX.md`：只有新增文件時才改。本設計不新增文件。
- 試算表「使用說明」分頁與老師審閱指南：由 077 寫入 `review_link` 欄的用法。

### 不更新

- `docs/health-check/2026-09-03-editor-onboarding.md`：`record`，不改寫。
- `docs/constitution-features/060-public-preview-toggle-broken.md`：`?public=true` 開關與審閱版無關。
- `docs/constitution-features/039-render-check-tool.md`：渲染檢查另案處理。
- `../Constitution_docs/0_會議紀錄與待辦/2026-11-17_上稿系統流程與進度.md`：captain 的會議文件，不在 repo 內。是否更新由 captain 決定。

## 定稿：方案 D「單檔 HTML 審閱檔」（第二輪，2026-11-17）

### 一句話結論

**建議方案 D。** captain 在自己電腦上產生一個 HTML 檔。檔案內容是待審的 T1 列，可以離線開啟，也可以寄送。老師讀完後，引用檔內印的版本短碼留言同意。正式同步的轉交檢查保留：核可版本必須登錄在「審閱版本」分頁，否則整份中止。

方案 D 不經 Vercel，也不推 `review/*` 分支。第一輪的 D1（老師過不了 Vercel 登入）、D2（草稿上公開 repo）、D8（`AGENTS.md` 第 5 條）三個決定因此全部消失。

### 前例：constitution-content 已經這樣送給老師（只讀，未修改）

- `../Constitution_docs/constitution-content/court-operation-20260903/build_preview.py`（752 行）以 `--teacher` 產生 `preview-teacher-20261005.html`（316 KB）。
- 檔案是單一 HTML。圖片以 `data:` URI 內嵌（檔內 2 處 `data:image`），沒有任何外部 `<link>` 或 `<script src>`（`grep` 0 筆）。檔頭有 `noindex`，橫幅寫明「未發布稿，請勿轉傳或公開」。
- `review/visuals/briefing-4/index.json` 記錄：FO 獨立抽驗「無外部資源」，259 KB 單一檔案可寄送。first officer 告知老師已實際開啟成功。這一點我沒有親自查證。

方案 D 沿用這個做法的三點：單一檔、內嵌圖片、產生後自我檢查沒有外部資源。

### 方案 C 與方案 D 的比較

| | 方案 C：審閱版網站（第一輪） | 方案 D：單檔 HTML 審閱檔 |
|---|---|---|
| 老師怎麼看 | 打開 Vercel 預覽網址 | 打開 email 附件（或檔案） |
| D1：老師過不了 Vercel 登入（R3） | **仍在**，阻擋上線 | **消失**。不經 Vercel |
| D2：未核可草稿推上公開 repo（R7） | **仍在**，不可逆 | **消失**。檔案寫進被 `.gitignore` 排除的目錄，不 commit |
| D8：`AGENTS.md` 第 5 條 | 要 captain 確認 | **消失**。檔案不是網站 |
| 順序 C（看 → 簽 → 核可一次） | 成立 | 成立。檔案不看核可狀態 |
| 正式站被誤放審閱資料的風險 | 有，要靠 `next.config.ts` 守門擋 | **沒有**。不寫 `src/data/`，不改 `src/` |
| 老師看到的版面 | 與網站相同 | **簡化版**，見下方〈與正式網站的差異〉 |
| 漏轉交檢查 | 連結在該列，同步檢查核可版本有連結 | 同步檢查核可版本已登錄。見下方〈漏轉交檢查的改寫〉 |
| 能證明「送到了」到什麼程度 | 連結在老師簽核的那一列，而且程式實測打得開 | 只能證明檔案產生過並且登錄了。**實際寄出這一步仍靠人**。見下方〈做不到的事〉 |
| 試算表 T1 新增欄位 | 1 欄（`review_link`） | **0 欄** |
| 預估行數 | 約 +656 | 約 +583，**且 `src/` 零改動** |
| 新增的人工步驟 | push、等 Vercel、取分享連結、貼表 | 寄信、貼表 |

**建議 D 的理由：** C 的兩個阻擋項（D1 需要先查 Vercel 方案，D2 不可逆）在 D 裡都不存在。captain 要立刻施工，D 不必等任何外部設定。D 的代價是兩點：版面是簡化版；「寄出」無法由機器證明。這兩點下面寫明，並說明為什麼可以接受。

### 方案 D 的流程（順序 C 不變）

```
① 責任編輯／協作者改內容（列變回 Needs review）
② captain 執行 npm run review-file
     → 讀 Track 1 發布版 CSV，取「不是 Rejected」的列
     → 跑與正式同步相同的內容檢查；有錯的列不放進檔案，錯誤寫進登錄表
     → 產生 review-out/T1-<日期>-<review_id>.html（單一檔，背景圖內嵌）
     → 自我檢查：沒有外部資源、每列短碼都在檔內；通過才印出登錄表
③ captain 寄檔案給老師，同一次把登錄表貼進「審閱版本」分頁並填 sent_at
④ 老師開檔，讀某一列，在試算表該列留言「同意，版本 xxxxxxxx」（076 第 3.2 節）
⑤ 責任編輯執行「核可選取列（附老師簽核）」（076 第 3.3 節），一次寫入核可與簽核
⑥ captain 在 main 執行正式同步
     → 轉交檢查：每列 approved_fingerprint 都要在「審閱版本」分頁有一筆 result=OK、sent_at 有值的紀錄
     → 缺任何一列就整份中止，錯誤訊息寫出列號
⑦ 開 PR、對 diff、合併（不變）
```

### 漏轉交檢查的改寫（不變式 #6）

「審閱版本」分頁欄位：`review_id`、`sheet`、`id`、`fingerprint`、`short_code`、`result`、`file_sha256`、`sent_at`。

- **登錄表只能由程式產生。** `review-file` 寫完檔案、通過自我檢查後，才印出登錄表。登錄表帶檔案的 sha256，可以事後比對 captain 手上的檔案就是寄出的那一份。
- **分頁只有 captain 能改**（保護範圍 +1，見〈T1 欄位計畫〉）。責任編輯與協作者不能自己補登錄來繞過檢查。
- **正式同步的檢查：** Track 1 每一列已核可的內容，`approved_fingerprint` 要對到一筆登錄。那一筆要 `result = OK`、`file_sha256` 是 64 位十六進位、`sent_at` 是日期。任一條不符就整份中止，訊息例：「h2：核可的版本 1a2b3c4d 沒有登錄在審閱版本分頁，老師沒有收到過這個版本的審閱檔。」
- **內容在寄出後被改：** 指紋改變。新版本沒有登錄，同步中止。076 的選單也會因為老師引用的短碼對不上目前版本而拒絕寫入簽核。兩道檢查互相獨立。
- `sent_at` 由 captain 手填，是本設計唯一手填的轉交欄位。

### 做不到的事，直說

- **機器無法證明信真的寄出。** 檢查能證明三件事：檔案產生過、通過自我檢查、登錄在 captain 專屬的分頁。登錄了卻沒寄，機器抓不到。
- 為什麼仍可接受：老師留言要引用短碼。沒收到檔案的老師會發現自己少一份檔，可以提問。第一輪方案 C 也只能證明「連結在那一列」，同樣不能證明老師點開過。
- 兩個方案都不能證明老師讀過內容。那一段由 076 的簽核留言承擔（留言作者由 Google 帳號決定）。

### 與正式網站的差異（老師看到什麼、看不到什麼）

| 項目 | 正式網站 `/past` | 審閱檔 |
|---|---|---|
| 版面 | 捲動驅動的左右分割畫面，滿版高度 | 每列一張卡片。桌機左右兩欄（課本／現實），手機上下兩段 |
| 文字欄位 | `content`、`handwriting`、`year`、`ruling_id`、`title`、`ruling` | 同左，排列順序相同，依 `year` 排序相同 |
| 配色 | `globals.css` 的 `--color-textbook-*`、`--color-reality-*` | 沿用同一組色碼 |
| 字型 | 網站字型 | 系統字型 |
| 背景圖（目前 40 列中 8 列有） | 外部網址 | 產生時抓圖、內嵌。抓不到時該列 `result` 記為錯誤，不靜默略過 |
| `content` 含 HTML 標記 | 網站直接渲染（P2-10，042 暫停中） | **以純文字顯示原始標記**。老師會看到原本隱藏的標記，這是刻意的 |
| 每列額外顯示 | 無 | `id`、狀態（待核可／已核可）、版本短碼（大字）、完整指紋（小字） |
| 長標題在滿版畫面是否溢出（P2-11） | 會出現 | **看不到**。這是版面問題，屬 039 渲染檢查，不是老師審閱的範圍 |

這張表的結論：老師審的是法律內容與讀者看到的文字組合。審閱檔完整呈現這兩樣。P2-9 的根源（test 字串與佔位摘要能通過核可）是「核可者只看到儲存格」，審閱檔已經解決這一點。網站專屬的版面問題交給 039。

### T1 欄位計畫（與 076 的設計者對齊）

兩票的合計數字已一致。076 寫在 `docs/constitution-features/teacher-review-role-and-signoff.md` 第 5.3 節後的補述（commit `19b4994`），本表與它相同。欄號是 2026-09-29 的讀數，實作時要重讀發布版 CSV 第一列確認。

| 項目 | 076 單獨 | **兩票合計（079 選 D，建議）** | 兩票合計（079 選 C） |
|---|---|---|---|
| T1 新欄 | `S`–`U`（`signoff_by`、`signoff_ref`、`signoff_fingerprint`，B 類） | **同左。079 不加欄** | 再加 `V`（`review_link`，A 類公式欄） |
| C 類標題列範圍 | `A1:U1` | **`A1:U1`** | `A1:V1` |
| 保護設定個數 | 13 | **14**（+1 是整個「審閱版本」分頁，只有 captain） | 15（`V2:V` 與既有 A 類範圍 `R2:R` 不相鄰，要另設一個） |
| 投稿者測試 | 33 格 | **34 格**（+1：「審閱版本」一格，預期擋） | 35 格 |
| 責任編輯反向測試 | 21 格（全部預期可改） | **22 格**（+1：「審閱版本」一格，預期**擋**） | 22 格 |
| 加註者（老師）測試 | 至少 6 項 | **至少 7 項**（+1：「審閱版本」一格，預期擋） | 至少 7 項 |

兩項待實測（076 提出，本票同意）：

- 「整個分頁保護」與「範圍保護」是 Google 的兩種設定。整個分頁保護是否也只保護到第 1000 列（`docs/health-check/TODO.md` P2-13），尚未證明。
- 責任編輯反向測試多了一格預期「擋」，紀錄裡要把這一格和其他預期「可改」的格子分開寫。

**方案 D 不在 T1 加欄的影響：** 第一輪 R6 的順序限制（新欄要在程式合併之後加）在本票消失。076 的三欄仍受 R6 限制，由 076 自己排順序。

### 元件與檔案（方案 D）

| 位置 | 做什麼 |
|---|---|
| `scripts/sync-content.mjs` | 匯出 Track 1 的讀取與檢查函式，加參數決定取哪些列；正式模式行為不變。新增讀「審閱版本」分頁（環境變數 `REVIEW_BUILDS_CSV_URL`）與轉交檢查 |
| `scripts/review-file.mjs`（新） | 產生審閱檔。輸出目錄 `review-out/` 必須被 `git check-ignore` 判定為忽略，否則拒絕執行。不寫 `src/`、不寫任何被 git 追蹤的檔案。自我檢查：檔內沒有 `http(s)://` 的 `src`、`href`、`url()`、`@import`；每列短碼都出現在檔內。通過才印出登錄表 |
| `.gitignore` | 加 `/review-out/` |
| `package.json` | 加 `review-file` 指令 |
| `tests/review-delivery.test.mjs`（新） | 驗收條件的測試 |

**資料形狀。** 登錄表一列一筆：`{ review_id, sheet: 'Track 1_history', id, fingerprint, short_code, result: 'OK' | 錯誤原文, file_sha256, sent_at: '' }`。`fingerprint` 由 Node 依 `scripts/content-fingerprint.mjs` 計算，與試算表 `current_fingerprint` 相同（040 已保證）。`short_code` 是指紋前 8 字元，與 076 第 3.2 節相同。

**審閱檔的響應式行為。** 寬度 768px 以上：卡片左右兩欄。以下：上下兩段，文字不截斷。頁首橫幅寫審閱檔編號與「未發布稿，請勿轉傳或公開」，手機上可換行。不用 JavaScript。

### 上線順序（方案 D）

1. captain 對下方〈現在就要決定〉清單中標為「阻擋 implement」的項目定案。
2. captain 建「審閱版本」分頁（只有標題列），設保護範圍（只有 captain），發布成 CSV，把網址寫進 `.env.local` 的 `REVIEW_BUILDS_CSV_URL`。
3. 合併程式。方案 D 不在 T1 加欄，沒有第一輪 R6 的順序限制。076 的三欄依 076 自己的順序施工。
4. 第一份審閱檔：078 的第一批 `h2`、`h28`。078 的 P0-7（判決門檻人數）是手寫的 `.ts` 資料，不在試算表，不在本機制範圍內。

第 3 步之後，正式同步會因為既有 40 列沒有登錄而中止，直到老師審過一輪為止。見清單第 4 項。

### 預估檔案、行數與容差（方案 D）

| 檔案 | 預估增減 | 容差 |
|---|---|---|
| `scripts/sync-content.mjs` | +80 | ±30 |
| `scripts/review-file.mjs`（新） | +260 | ±90 |
| `.gitignore` | +2 | — |
| `package.json` | +1 | — |
| `tests/review-delivery.test.mjs`（新） | +240 | ±80 |
| **合計** | 約 +583 | ±200 |

`src/` 零改動。超過容差上限、需要改 `src/` 或 `scripts/apps-script/`，就停下來回報。

### 語意變更（方案 D）

- 正式同步多一條中止條件：Track 1 的核可列沒有登錄在「審閱版本」分頁。
- 正式同步多讀一個 CSV。`REVIEW_BUILDS_CSV_URL` 沒設定就中止（fail closed）。
- 新增 `review-file`。它不寫 `src/data/*.json`，但會讀試算表、寫出含未核可內容的檔案。agent 不得自行執行，比照 `sync-content`。
- 網站、部署、T1 欄位都不變。

## 現在就要決定（captain 要立即施工，不等 11/26）

第一輪的 D1–D8 全部併入本表。方案 D 定案後，D1、D2、D8 消失。076 的對應編號寫在括號裡。

| # | 決定事項 | 建議預設值 | 阻擋 implement？ | 不可逆？ |
|---|---|---|---|---|
| 1 | 採用方案 D（單檔審閱檔）或方案 C（審閱版網站） | **D** | **是** | 否 |
| 2 | 順序 C：老師看審閱檔 → 留言 → 責任編輯附簽核核可一次（＝第一輪 D7＝076 D-6b） | **採用** | **是**，兩票都卡 | 否 |
| 3 | 轉交檢查只管 Track 1（＝第一輪 D5＝076 D-4） | **只管 T1** | **是** | 否 |
| 4 | 程式合併後、老師審完 40 列前，正式同步會中止。接受，或讓 40 列例外（＝第一輪 D3） | **接受**。網站維持現有內容，不會變空 | **是**。決定程式要不要有例外清單 | 否 |
| 5 | 審閱檔含未核可草稿，用 email 寄給老師 | **接受**。比照 court-operation 的老師討論版，橫幅寫「請勿轉傳」 | 否 | **是，每寄一次就收不回** |
| 6 | 寄送管道：email 附件，或共用雲端資料夾 | **email 附件**。court-operation 已用過 | 否 | 否 |
| 7 | 誰產生、誰寄、誰登錄 | **都由 captain**。只有 captain 跑 Node，也只有 captain 能改「審閱版本」分頁 | 否 | 否 |
| 8 | 多久出一次審閱檔（＝第一輪 D6） | 依 078 的批次，每批一次 | 否 | 否 |
| 9 | 誰通知老師「這一輪可以看了」（＝第一輪 D4） | captain 寄信即通知，不另設步驟 | 否 | 否 |

另外兩項不是本票的決定，但第一次寄檔前要有答案：老師名單與代稱（076 D-1），老師的試算表權限改為加註者（076 D-2）。

**不需要 captain 決定、由本設計直接定案的技術細節：** 背景圖內嵌（抓不到記為錯誤）、輸出目錄 `review-out/`、檔名格式、檔內不用 JavaScript。

## Acceptance criteria（方案 D，定稿）

1. **審閱檔含未核可的列，不含退稿的列，且每列印出短碼與指紋。** Track 1 夾具有 `Approved`、`Needs review`、`Rejected` 各一列時，審閱檔含前兩列，不含第三列。每列都有 `id`、狀態、8 字元短碼與 64 字元指紋，值等於 `content-fingerprint.mjs` 的計算結果。
   Verified by: `tests/review-delivery.test.mjs` 以本機 CSV 夾具產生審閱檔，解析 HTML 比對。把篩選改回只取 `Approved`，或短碼取錯位數，測試會失敗。
2. **有錯的列不進檔案，錯誤寫進登錄表。** `Needs review` 列的 `content` 含「某學者」時，該列不在審閱檔，登錄表中該列 `result` 是錯誤原文。背景圖抓不到時同樣處理。
   Verified by: 同一測試檔的兩個夾具案例（佔位字串、圖片網址回 404）。拿掉對未核可列的內容檢查，或把抓圖失敗改成略過，測試會失敗。
3. **審閱檔不依賴任何外部資源。** 檔內沒有 `http(s)://` 開頭的 `src`、`href`、`url()` 或 `@import`。有背景圖的列，圖以 `data:` URI 內嵌。
   Verified by: 測試以正規表示式掃描產出檔案，並確認有圖的列含 `data:image`。拿掉內嵌、改回外部網址，測試會失敗。另外，`review-file` 自己的自我檢查在同一條件下拒絕印出登錄表，測試也比對它的結束碼。
4. **產生審閱檔不改動任何被 git 追蹤的檔案。** 執行前後 `src/data/*.json` 的 sha256 相同，`git status --porcelain` 沒有新項目。輸出目錄沒有被 `.gitignore` 忽略時，程式拒絕執行。
   Verified by: 測試在暫存 git repo 執行兩次（輸出目錄已忽略／未忽略），比對結束碼、sha256 與 `git status`。拿掉 `git check-ignore` 檢查，第二次會變成成功，測試失敗。
5. **漏轉交時正式同步失敗（反證）。** Track 1 有一列已核可，但「審閱版本」分頁的情況是下列任一種時，正式同步都以非零結束：沒有該列 `approved_fingerprint` 的登錄；只有舊指紋；`result` 不是 `OK`；`sent_at` 空白。錯誤訊息含該列 id，兩個 JSON 都沒有寫入。補上正確登錄後同步通過。
   Verified by: `tests/review-delivery.test.mjs` 沿用 `tests/approval-content-version-binding.test.mjs` 的本機 HTTP 夾具（該檔有 2 處 `createServer`），跑五個案例，比對結束碼、訊息與 JSON 的 sha256。拿掉轉交檢查，前四個案例會從失敗變成通過，測試失敗。
6. **沒設定審閱版本分頁就不發布。** `REVIEW_BUILDS_CSV_URL` 未設定時，正式同步中止，訊息寫明缺哪個環境變數。
   Verified by: 測試清空該變數後執行同步，比對結束碼與訊息。
7. **網站完全不變。** 實作 PR 對 `src/` 的 diff 為空。
   Verified by: `git diff --stat main...<實作分支> -- src/` 輸出為空；`npm run build` 通過。
8. **老師實際打得開。** captain 把一份審閱檔寄給一個非技術帳號，在手機與桌機各開一次，桌機那次先斷網。
   Verified by: captain 人工操作，截圖附在本票。這一項明確是人工驗證。
9. **既有測試不退步。**
   Verified by: `node --test tests/*.test.mjs`、`npx tsc --noEmit`、`npm run build` 全部通過。

## 文件影響（方案 D，定稿）

### 現在更新

無。first officer 規定 design 階段只寫入本票內文。`docs/health-check/TODO.md` P2-9 的補述移到實作後。

### 實作後更新

- `AGENTS.md`：「絕對不要做的事」第 1 條加上 `npm run review-file`。
- `docs/content-pipeline/design.md`：第五節流程圖追加補述（第②步核可之前，多一個「老師看審閱檔、留言簽核」的步驟）。加 captain 的操作步驟。〈修訂紀錄〉加一則。原文保留。
- `docs/content-pipeline/gatekeeping.md`：第 5 章防線總表加「轉交檢查」一列；第 2 章學者一節寫明老師看的是審閱檔。
- `docs/health-check/TODO.md`：P2-9 追加補述，指向本票與實作 PR。
- 試算表「使用說明」分頁與老師審閱指南：由 077 寫入「怎麼讀審閱檔、短碼在哪裡」。

### 不更新

- `docs/INDEX.md`：本設計不新增文件。
- `docs/health-check/2026-09-03-editor-onboarding.md`：`record`，不改寫。
- `docs/constitution-features/060-public-preview-toggle-broken.md`、`039-render-check-tool.md`：與本票無關。039 負責網站版面，本票不負責。
- `../Constitution_docs/` 底下的檔案：不在 repo 內。court-operation 的 `build_preview.py` 只作參考，未修改。

## Stage Report: design

- DONE: 選定讓審閱老師看得到成品的機制並附風險證據：先評估最便宜做法（例如同步 PR 範本或檢查清單的必填項「預覽連結已轉交」），說明為何足夠或不足，再評估是否需要狀態檢視頁；不得把同步接進 build 或 CI（AGENTS.md:19），不得執行 npm run sync-content
  採方案 C（審閱版、試算表連結、轉交檢查）。方案 A 有四點不足，證據是 R1–R5，含 2026-11-17 實測：預覽網址 302 導向 vercel.com/sso-api。方案 B 違反不變式 #1 或 #7。全程唯讀，沒有執行同步或 build
- DONE: 說明「漏掉轉交預覽連結或同步錯誤訊息」如何被一項可執行的檢查抓到（滿足 design.md 不變式 #6），並寫明由誰、在哪一步負責轉交，與 076 的老師審閱流程銜接
  見〈漏轉交怎麼被抓到〉〈同步錯誤怎麼轉交〉〈誰在哪一步負責〉〈與 076 的銜接〉。轉交由 captain 負責（步驟 ②④⑤）。已對齊 076 的簽核欄與版本短碼，並比較 076 的順序 B 與本設計的順序 C（D7）
- DONE: 驗收條件以完成後的性質表述並各附 Verified by（至少一項以「漏轉交時檢查失敗」作反證）；預估檔案與行數及容差；文件影響分 現在更新／實作後更新／不更新
  共 10 條驗收條件。反證是第 6 條：拿掉轉交檢查後，前三個案例會從失敗變成通過。預估約 +656 行，容差 ±200。第 9 條明確是人工驗證

### Summary

選定「審閱版」：captain 在 `review/*` 分支建一份含未核可列的網站版本。打得開的連結經 `review-deliver` 實測後才貼進試算表，放在老師簽核的那一列旁邊。正式同步再檢查每列的核可指紋都有已送出的連結，否則整份中止。關鍵發現：現行 PR 預覽只含已核可的列，排在老師簽核之後。預覽網址也要登入 Vercel，老師打不開。2026-11-26 會議要決定 D1–D8，其中 D7 與 076 的 D-6b 是同一個決定（老師看審閱版再簽，或先核可再看 PR 預覽）； D1（老師怎麼通過 Vercel 登入）阻擋上線，D2（未核可草稿推上公開 repo）不可逆。

## Stage Report: design (cycle 2)

- DONE: 補評估方案 D「單檔 HTML 審閱版」（待審列含未核可列，產生為可離線開啟、可寄送的單一 HTML，每列印出 076 的版本短碼與內容指紋；不經 Vercel、不推 review/* 分支），與方案 C 並列比較：D1／D2 是否消失、順序 C 是否成立、漏轉交檢查如何改寫（例如以寄出檔的 manifest 登錄於「審閱版本」分頁）、老師看到的與正式網站版面的差異、預估行數；給出一個建議
  見〈定稿：方案 D〉。建議 D：D1、D2、D8 消失，順序 C 成立，檢查改為登錄＋`file_sha256`＋`sent_at`。版面差異逐項列表。約 +583 行，`src/` 零改動。明寫「寄出」無法由機器證明。前例 `build_preview.py` 只讀未改
- DONE: 依建議方案定稿 T1 欄位計畫並與 076 的設計者對齊：欄位順序、A／B 類保護範圍總數、權限測試格數；若 D 不需要 review_link 欄，明寫兩票的數字
  見〈T1 欄位計畫〉：079 不加欄，T1 只有 076 的 `S`–`U`；保護設定 14；測試 34／22／至少 7。與 076 commit `19b4994` 的補述數字相同
- DONE: 把所有待決事項合併成一張「現在就要決定」清單（captain 要立即施工，不等 11/26）：每項給建議預設值，標出阻擋 implement 的項目與不可逆項目
  見〈現在就要決定〉：9 項。第 1–4 項阻擋 implement；第 5 項（寄出未核可草稿）每寄一次就收不回

### Summary

第二輪改為建議方案 D：captain 在本機產生離線單檔 HTML，寄給老師。不經 Vercel，不推分支，`src/` 不動，第一輪的三個阻擋或不可逆決定因此消失。轉交檢查保留在正式同步，以 captain 專屬的「審閱版本」分頁登錄為準。代價有兩點：版面是簡化版，網站專屬的版面問題歸 039；「信真的寄出」無法由機器證明。T1 欄位數字已與 076 一致。第一輪方案 C 的內容保留並標為已取代。
