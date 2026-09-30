---
id: 072
title: 把關總覽第 4、5 章依 064 重判
status: design
source: 054 review R5（延續 verify V6）；captain 2026-09-29 裁示「照建議走」——R5 不在 054 處理，另開本票
started: 2026-09-30T17:18:46Z
completed:
verdict:
score:
worktree:
issue:
pr:
---

`054` 的總覽 `docs/content-pipeline/gatekeeping.md` 寫於 `064` 合併之前。原先的處置是「後合併者重判總覽第 4、5 章」，但 `064`（PR #47）與 `050` 都比 `054` 先合併，這項重判沒有任何票承接。本票承接。

要重判的事（出處：`054` review R5）：

- 第 5 章 :117：`064` 在 `scripts/sync-content.mjs` 新增 `case_ref`／`stance` 允許清單與成對檢查，防線表要寫出它擋什麼、擋不到什麼。
- 第 4 章〈核可版本綁定〉：`064` 把兩欄選填欄位放進指紋（`content-fingerprint.mjs`、`.gs`），填了值的列要重新核可。總覽對指紋涵蓋範圍的描述要依此重判。
- 依總覽第 0 章寫作規則：只寫單調句、連結寫 `docs/…` 路徑、每道防線寫「擋什麼／擋不到什麼」。

**前置：`054` 合併進 `main` 之後才開始 design**（總覽目前只在 `054` 分支上）。

## Design

基準：`main` `c6dcc9f`。`054` 已合併（PR #49，`937922d`），`064` 已合併（PR #47，`6d9cf9e`，2026-09-29T21:41Z）。
本節只改一份文件：`docs/content-pipeline/gatekeeping.md`（以下稱「總覽」）。不改程式。

### 一、給 captain 的一句話

總覽第 4、5 章寫在 `064` 之前。它沒有寫到兩件事：
一，Track 2 的 `case_ref`（判決字號）與 `stance`（立場）填了值，就會被核可綁住，改了要重新核可。
二，同步程式會擋下這兩欄填錯的列。本票把這兩件事補進總覽，並寫明這兩道檢查擋不到什麼。

### 二、`064` 實際交付了什麼（程式證據）

| 編號 | 事實 | 證據 |
|---|---|---|
| C1 | `case_ref`、`stance` 是選填發布欄位。有值才計入指紋，空白不計入。空白列的指紋與 `064` 之前逐位元組相同 | `scripts/content-fingerprint.mjs:25-27`、`:72-75`；`scripts/apps-script/approval-workflow.gs:9-11`。實跑：空白＝不存在 `true`，填值≠空白 `true`，改 `stance` 指紋改變 `true`（指令見 AC-2） |
| C2 | Track 2 的序號只看原本 13 欄。只填這兩欄的列不佔序號 | `content-fingerprint.mjs:22`（註解）；`tests/track2-case-ref-stance.test.mjs:233` |
| C3 | 核可後才填或改 `stance`，同步報「與目前發布內容不符」，整份中止 | `tests/track2-case-ref-stance.test.mjs:186` |
| C4 | 試算表公式沒重裝就填值，試算表指紋與 Node 不符，該列不會是 `Approved`（fail closed） | `tests/track2-case-ref-stance.test.mjs:221`；`064` 票 3.5 表第三列 |
| C5 | 同步對已核可的 Track 2 列加三個中止條件：兩欄只填一欄；`case_ref` 不在 `src/data/verified-case-refs.mjs` 的鍵；`stance` 不是 `支持`／`質疑`／`中立分析` | `scripts/sync-content.mjs:750-762`、`:78`；測試 `:139`、`:152`、`:165` |
| C6 | 三個條件只查已核可的列。草稿列填錯不中止 | `tests/track2-case-ref-stance.test.mjs:173` |
| C7 | 已查證字號清單目前兩筆。清單的增減會讓形狀測試失敗。清單內容的正確性靠人工對照憲法法庭網頁 | `src/data/verified-case-refs.mjs:1-9`（檔頭規則）、`:11-22`；測試 `:284-293`；`064` verify 以 `curl` 對照兩筆 |
| C8 | captain 2026-09-29 決定：責任編輯填這兩欄，captain 在同步 PR 的 diff 逐值看 | `docs/content-pipeline/operations.md:121-123`；`064` 票〈誰填 stance〉 |
| C9 | 正式試算表的兩欄與新版 Apps Script 要照 `operations.md`〈Track 2 加兩欄〉第 1–9 步建立。`064` verify 於 2026-09-29 讀回正式表 `Track 2_discussion` 為 21 欄，沒有這兩欄 | `docs/content-pipeline/operations.md:91-117`；`064` 票 `## Stage Report: verify` 第三項 |

### 三、總覽裡錯誤或不完整的句子

判定：「錯」＝與程式不符；「缺」＝句子本身為真，但讀者會漏掉 `064` 的行為。

| 位置 | 原句（摘） | 判定 | 理由 |
|---|---|---|---|
| 第 4 章 `:99` | 指紋是依發布內容算出的代碼，內容改一個字，代碼就不同 | 缺 | 沒寫指紋涵蓋哪些欄。`case_ref`、`stance` 空白時不進指紋（C1）。讀者無法判斷「只填立場」會不會讓核可失效 |
| 第 4 章 `:100` | Track 2 的指紋含資料列的序號。插入或刪除一列，其後各列都要重新核可 | 缺 | 只填選填欄的列不佔序號（C2）。原句讀起來是任何一列都算 |
| 第 4 章 `:101` | 同步……三份比對 | 正確 | 不改 |
| 第 4 章 `:102` | 2026-09-29 起，正式試算表套用這套機制 | 缺 | 「這套機制」加上新句後，會被讀成正式表已涵蓋兩欄。正式表要建欄並重裝公式後才涵蓋（C4、C9） |
| 第 4 章 `:104` 正本 | 只列 `design.md` 兩則修訂紀錄 | 缺 | 指紋欄位的正本是 `design.md` 第二節〈發布欄位範圍〉（`design.md:272-297`），`064` 新增 |
| 第 5 章 `:116` 核可版本綁定 | 擋什麼：核可後被改過的內容…；機械：只列 binding test | 缺 | `case_ref`／`stance` 的改動也被擋（C3）。兩欄的指紋測試在 `tests/track2-case-ref-stance.test.mjs`，欄內沒列 |
| 第 5 章 `:118` 同步前置檢查 | 擋什麼列了六項；擋不到三項；機械只列 binding test | 缺 | 漏 C5 的三個中止條件；擋不到漏「值在清單內但判斷錯」與「清單本身寫錯」（C7）；機械欄漏新測試檔 |
| 第 5 章 `:118` 同一格 | 同上 | 缺（非 `064` 造成） | 另漏 `040` 起就有的格式檢查：`link`／`image_url` 網址、`vibe` 允許清單、`sticky`、`views`、`year`（`sync-content.mjs:682-747`）。同一格要重寫，一併補上 |
| 第 5 章 `:119` PR diff 審閱 | 擋什麼：少了一筆、多了測試字串、畫面壞掉 | 缺 | C8：captain 在 diff 逐值看兩欄。這是 `064` 新增的人工檢查 |

第 4、5 章以外，重判時發現兩處與 `064` 相關（R5 未點名，一句即可補，本票一併處理）：

| 位置 | 判定 | 理由 |
|---|---|---|
| 第 2 章 `:59` 責任編輯〈做什麼〉 | 缺 | C8 的分工沒寫 |
| 第 3 章 `:86` 表後 | 缺 | 兩欄建立後的保護範圍 `V2:W`（B 類允許名單）沒寫。`064` 已封存，建欄屬 repo 外步驟，沒有任何票會回頭改總覽。所以用條件句寫，建欄前後都成立 |

### 四、改法（逐字草稿，implement 可微調用字，不可改語意）

**第 2 章責任編輯〈做什麼〉，原句後加一句：**
「Track 2 的 `case_ref`、`stance` 由責任編輯填，填完重新核可（captain 2026-09-29 決定）。」

**第 3 章〈三項已知限制〉前加一段：**
「`Track 2_discussion` 建 `case_ref`、`stance` 兩欄時，另設保護範圍 `V2:W`，允許名單同 B 類。步驟見 [`docs/content-pipeline/operations.md`](operations.md)〈Track 2 加 `case_ref`／`stance` 兩欄〉第 5、6 步。」

**第 4 章，`:100` 之後加三句：**
- 「Track 2 的 `case_ref`、`stance` 是選填欄。有值才計入指紋，空白不計入。」
- 「所以建這兩欄不會讓既有核可失效。填入、改動或清空這兩欄，該列要重新核可。」
- 「只填這兩欄的列不佔 Track 2 的序號。」

**第 4 章 `:102` 之後加兩句：**
- 「試算表端的指紋要重跑 `Review → 安裝／更新公式` 才含這兩欄。沒重裝就填值，同步中止。」
- 「正式試算表有沒有這兩欄，看 `Track 2_discussion` 標題列有沒有 `case_ref`、`stance`。」

**第 4 章正本**：加 [`docs/content-pipeline/design.md`](design.md) 第二節〈發布欄位範圍〉。

**第 5 章 `:116`**：擋什麼改為「核可後被改過的內容（含 Track 2 的 `case_ref`、`stance`）、缺漏或偽造的核可紀錄、指紋不符的列。任一列不符，整份不寫」。機械欄加 `node --test tests/track2-case-ref-stance.test.mjs`。正本加〈發布欄位範圍〉。擋不到不變。

**第 5 章 `:118`**：
- 擋什麼加：「欄位格式（網址、`vibe` 允許清單、`sticky`、`views`、`year`）。Track 2 已核可列的 `case_ref`、`stance` 只填一欄；`case_ref` 不在 `src/data/verified-case-refs.mjs` 的清單；`stance` 不是 `支持`、`質疑`、`中立分析`」。
- 擋不到加：「`case_ref` 在清單內但與文章無關、`stance` 判斷錯誤：同步只查值在不在清單內。清單裡字號本身的正確性：新增字號靠人工對照憲法法庭網頁」。
- 機械欄加 `node --test tests/track2-case-ref-stance.test.mjs`。
- 正本加 `src/data/verified-case-refs.mjs` 檔頭。

**第 5 章 `:119`**：擋什麼加「`case_ref`、`stance` 填在哪幾列、填了什麼值（captain 逐值看）」。其餘不變。

**檔頭 `:4` 最後查核**改為實作當天日期。`docs/INDEX.md:59` 的最後查核同步改。

不做的事：
- 不新增防線表列。兩欄的檢查都在既有的「同步前置檢查」與「核可版本綁定」兩道防線內。表維持 12 列。
- 不改第 8 章缺口表與票況指令。`064` 沒有關閉或新增缺口。
- 不寫「正式表還沒加欄」一類句子。那是進度，違反總覽第 0 章規則 1。改用 C9 的查法句。

### 五、驗收條件

**AC-1 — 第 5 章寫出的 `064` 擋什麼，每一項都對應一道會失敗的測試。**
Verified by：執行 `node --test tests/track2-case-ref-stance.test.mjs tests/approval-content-version-binding.test.mjs`，exit 0。
再在拋棄式 worktree 各做一次反向改動，改完即還原：(a) 刪 `sync-content.mjs` 的成對檢查 → `AC-6` 測試失敗；(b) `Object.hasOwn` 判斷改成恆真 → `AC-4` 失敗；(c) `ALLOWED_STANCES` 加一個值 → `AC-5` 失敗；(d) `content-fingerprint.mjs` 不附加選填欄 → `AC-7(b)` 失敗。
四項任一沒有測試失敗，就表示總覽寫了一項沒有機械保證的「擋什麼」，要改總覽或回報。

**AC-2 — 第 4 章對指紋涵蓋範圍的描述與程式相符。**
Verified by：在 repo 根目錄執行下列指令，印出 `true true true`：
```bash
node --input-type=module -e "import {fingerprintPublishedRow as f, SHEET_KEYS as K} from './scripts/content-fingerprint.mjs'; const r={id:'d1',title:'x'}; const a=f(K.TRACK_2,r,1), b=f(K.TRACK_2,{...r,case_ref:'',stance:''},1), c=f(K.TRACK_2,{...r,case_ref:'114年憲判字第1號',stance:'支持'},1), d=f(K.TRACK_2,{...r,case_ref:'114年憲判字第1號',stance:'質疑'},1); console.log(a===b, a!==c, c!==d)"
```
三個值分別對應第 4 章三句：空白不計入、填入要重新核可、改動要重新核可。design 時已實跑，印 `true true true`。會讓它失敗的程式改動見下一句；總覽側的失敗條件是第 4 章三句與這三個值任一不符。
會讓它失敗的改動：選填欄改成無條件計入，第一個值變 `false`。

**AC-3 — 總覽的連結全部受 M6 保護，且不新增 M6 失敗。**
Verified by：`node scripts/content-audit.mjs check | grep -c 'gatekeeping.md'` 印 `0`；M4、M5、M6 各不超過同一時間 `main` 的值（design 時 `main` 量得 `M4=1 M5=2 M6=18`；`069` 合併後會變少）。
另執行下列指令，印 `0`（連結可見文字都是 `docs/…` 路徑，`AGENTS.md` 除外）。design 時已實跑，印 `0`：
```bash
grep -oE '\[[^]]*\]\([^)]*\)' docs/content-pipeline/gatekeeping.md | grep -vE '^\[`docs/|^\[`AGENTS\.md`\]' | wc -l
```
會讓它失敗的改動：把 `064` 寫成非封存路徑 `docs/constitution-features/064-track2-case-ref-stance-columns.md`，M6 多 1 行指名總覽。

**AC-4 — 總覽仍只有單調句。**
Verified by：`awk '/^```/{c=!c;next} !c' docs/content-pipeline/gatekeeping.md | grep -nE '尚未|仍是|還沒|待補|目前仍'` 輸出 0 行。
會讓它失敗的改動：寫「正式試算表尚未加欄」，命中 1 行。

**AC-5 — `056` 的 G-7 仍通過。**
Verified by：從 `docs/constitution-features/_archive/056-pre-launch-checklist.md` 抽出 `# canonical: G-7` 區塊執行，印 `G-7 PASS [place1=1/1 place2=1 place3=1]`，exit 0。design 時已實跑通過。

**AC-6 — 每道被改的防線仍寫擋什麼與擋不到什麼，「機械或人工」欄只用三值。**
Verified by：`awk -F'|' '/^\| /&&NR>113&&NR<130{print NF}' docs/content-pipeline/gatekeeping.md | sort -u` 只印一個值（每列欄數相同）；逐列檢查第 3、4 欄非空、第 5 欄以 `` `機械` ``、`` `人工` ``、`` `人工（有記錄）` `` 之一開頭。實作時把行號範圍改成實際表格範圍。
會讓它失敗的改動：`:118` 擋不到欄寫成空白或 `—`。

**AC-7 — 不懂程式的讀者只讀總覽，能答對 `064` 的三個問題。**
Verified by：verify 階段派 fresh agent，只給總覽一份檔案，問：
(1) 責任編輯核可後，把某列的立場從「支持」改成「質疑」，網站會怎樣？（答：該列要重新核可，否則下次同步整份中止，JSON 不寫）
(2) 某列填了判決字號、立場空白，同步會怎樣？（答：整份中止）
(3) 同步能不能發現「立場判斷錯了」？（答：不能，只查值在不在清單內；captain 在 PR diff 看值）
三題全對才通過。會讓它失敗的改動：拿掉第 4 章新增三句，第 1 題無法由總覽答出。

**AC-8 — 只改總覽與 INDEX 一格。**
Verified by：`git diff --name-only main...HEAD` 只列 `docs/content-pipeline/gatekeeping.md`、`docs/INDEX.md` 與本票檔。`git diff main...HEAD -- docs/INDEX.md` 只改 `:59` 的日期。

### 六、預期改動檔案與行數

| 檔案 | 改動 | 容許範圍 |
|---|---|---|
| `docs/content-pipeline/gatekeeping.md` | 新增 7–9 行（第 2 章 0–1、第 3 章 2–3、第 4 章 5）；修改 5–6 行（`:4`、`:104`、`:116`、`:118`、`:119`、第 2 章一行） | 總行數 199 → 205–210 |
| `docs/INDEX.md` | `:59` 最後查核日期 | 1 行 |

程式、測試、`src/data/` 皆不改。

### 七、風險

- **把預定行為寫成已上線**：正式表沒有兩欄（C9）。第 3、4 章新句都寫成條件句，並附查法。AC-4 掃描擋進度詞。
- **擋什麼寫過頭**：AC-1 的四個反向改動保證每一項「擋什麼」都有會失敗的測試。
- **`:118` 一格變長**：這一格原本就是總覽最長的格子。它多了約 90 字。拆成新列會讓防線表與第 5 章「三值」規則以外的結構改變，本票不拆。
- **第 3 章條件句沒有行為測試記錄**：`064` 的 AC-11（投稿者改 V2、W2 被擋）排在階段二。本票不寫驗證記錄欄，只寫設定步驟出處。

### 八、文件影響

#### 現在更新

無。design 階段只寫本票。

#### 實作後更新

| 文件 | 更新內容 | 驗證目標 |
|---|---|---|
| `docs/content-pipeline/gatekeeping.md` | 第四節的全部改動 | AC-1 至 AC-7 |
| `docs/INDEX.md` | `:59` 總覽的最後查核日期 | AC-8 |

#### 不更新

| 文件 | 為什麼 |
|---|---|
| `docs/content-pipeline/operations.md` | 〈Track 2 加兩欄〉與錯誤訊息已由 `064` 寫好，與程式相符（`064` review 第二項） |
| `docs/content-pipeline/design.md` | 〈發布欄位範圍〉已由 `064` 寫好。`:582`、`:770`、`:823` 指向未封存的 `064` 路徑，是 M6 既有失敗，屬 `069` 或另票，不在本票 |
| `docs/constitution-features/_archive/054-gatekeeping-overview.md`、`_archive/064-*.md` | 已封存的票，不改寫 |
| `AGENTS.md` | 規則不變 |
| `docs/health-check/TODO.md` | 沒有新增或關閉缺口 |

## Stage Report: design

- DONE: Re-judge `docs/content-pipeline/gatekeeping.md` chapters 4 and 5 against what 064 (PR #47) actually shipped on main: the case_ref/stance allowlist and pair check in sync-content.mjs, and the two optional fields entering the fingerprint (content-fingerprint.mjs, .gs). List every overview sentence that is now wrong or incomplete, with code evidence.
  `## Design` 第二節 C1–C9 附檔案行號與測試名；第三節列 9 處（第 4 章 :99、:100、:102、:104；第 5 章 :116、:118 兩項、:119），另 2 處在第 2、3 章。沒有一句與程式相反，全部是「缺」。指紋三項行為以 node 指令實跑，印 `true true true`。
- DONE: Acceptance criteria each with a falsifiable `Verified by:`; the end value is that the overview's 擋什麼／擋不到什麼 for 064's checks matches the code, content-audit names 0 overview lines, the monotonic-sentence scan prints 0 lines, and G-7 still PASS.
  AC-1–AC-8 各有指令與會讓它失敗的改動。design 時在 main `c6dcc9f` 實跑基準：content-audit 指名總覽 0 行（M4=1 M5=2 M6=18）；單調句掃描 0 行；G-7 印 `G-7 PASS [place1=1/1 place2=1 place3=1]`；兩個測試檔 84/84 pass；連結可見文字掃描 0 行。
- DONE: Split documentation impact into 現在更新／實作後更新／不更新, each listing documents or 無.
  第八節：現在更新＝無；實作後更新＝總覽、`docs/INDEX.md:59`；不更新＝operations.md、design.md、兩張封存票、AGENTS.md、TODO.md，各附理由。

### Summary

總覽沒有與 `064` 相反的句子，但第 4、5 章漏寫三件事：兩欄有值才進指紋、同步的三個新中止條件、captain 在 PR diff 逐值看。改法是逐字草稿，只改總覽與 INDEX 一格，不動程式。第 2、3 章各補一句條件句，因為 `064` 已封存，階段二建欄是 repo 外步驟，沒有票會回頭改總覽。`:118` 同一格順帶補上 `040` 起就漏列的格式檢查；這一項不是 `064` 造成，gate 可以剔除。
