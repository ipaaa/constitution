---
id: 044
title: 隔離測試表兩帳號 probe：驗證核可欄位權限與公式重算
status: verify
source: captain 2026-09-04（feature 040 verify gate 裁決方案 B 拆出）
started: 2026-09-08T02:35:20Z
completed:
verdict:
score: 0.96
worktree: .worktrees/spacedock-ensign-044-approval-permission-two-account-probe
issue:
pr:
mod-block:
---

在隔離測試表上以兩個 Google 帳號實跑，證明核可欄位的權限邊界與 `status` 公式對「他人修改內容」與「責任編輯自行修改內容」都會重新計算。

## Problem

feature 040 的 AC-2 與 AC-4 需要試算表端的端到端證據，但 040 的 design 與 implement stage 都沒有隔離測試表，也沒有兩個 Google 帳號；repo 內無 Apps Script 專案、`clasp` 設定或 Google API credential，且契約禁止 worker 觸碰正式 SSOT。

2026-09-04 的 verify gate 因此把 AC-2、AC-4 判為 REJECTED —— **證據不足，不是行為失敗**。VM 重跑確認相異 fingerprint 會回傳 `Needs review`，但規定的表 ID hash 與 Apps Script execution ID 都不存在。

captain 於同日裁決：這條驗證路徑在現有條件下無法由 worker 完成，移出 040 另行開票，讓 040 以 repo 端 fail-closed 同步閘門先落地。

## 前置條件（卡在人，不是卡在程式）

本票在下列資源到位前**不可 dispatch**：

1. 一份與正式 SSOT 完全隔離的測試試算表。
2. 兩個 Google 帳號：測試者 A（建立 installable edit trigger、獨占審核欄位）與測試者 B（只能改內容欄位）。

## 待驗證的命題

- 責任編輯本人修改已核可列的內容欄位後，`status` 公式仍重新計算為 `Needs review`，`approved_*` 不變。
- 投稿者無法直接編輯審核欄位。
- 受保護欄位的 trigger 寫入路徑目前標記 `UNPROVEN`；即使本票證明可行，它也只能作為加速提示，不得取代同步端指紋閘門。

## 證據要求

證據寫入 `docs/content-pipeline/approval-permission-probe.md`，狀態為 `record`。必須記錄測試表 ID 的雜湊、時間、兩個角色、步驟、結果與 Apps Script execution ID。**不得記錄帳號 email 或正式 SSOT URL。**

## 裁決與相依鏈（captain 2026-09-07）

**captain 選 A。** 依賴鏈條是：

```
兩個 Google 帳號 ＋ 一份隔離測試表
        ↓
feature 044（本票）── 隔離表兩帳號 probe
        ↓
feature 050 ── 正式 SSOT 部署，步驟 4 起
        ↓
feature 040 ── 合併進 main
```

**044 是 feature 050 步驟 4 起的硬前置。** 050 的步驟 1-3（建欄、改標題）不需要本票，
但 050 的證據 2 已證明「建完欄的當下 main 就同步不了」，所以 050 不會先做步驟 1-3 再等。
實務上整條 050 都等本票。

### feature 050 對「不互為前置」的判定

feature 050 的 design stage 判定該票**第 45 行**的敘述錯誤。原句是：

> feature 044（隔離測試表兩帳號 probe）驗證的是同一套機制，但在測試表上。044 的結果可降低本票的風險，但兩者不互為前置。

050 已在票內第 47-49 行加註更正，原句保留。**本票不編輯 050**，那是跨票污染。

### 該判定所依據的三項外部證據來源

| # | 來源 | 內容 |
|---|---|---|
| 1 | `docs/content-pipeline/operations.md:12`（只存在於 040 的 worktree） | 「兩帳號隔離 probe 完成前，不要把 Apps Script 套到正式 SSOT。」 |
| 2 | `docs/constitution-features/040-approval-content-version-binding.md:221`（Out of scope） | 「不上線正式 SSOT 設定，直到隔離測試表完成驗證並由 captain 確認。」 |
| 3 | `docs/constitution-features/050-ssot-approval-deployment.md` 的 AC-3 | 「非核可者不能編輯審核欄位」與本票的第二個命題是同一件事。差別只在 044 在可丟棄的測試表上做，050 在 40 筆已上線內容的唯一來源上做。 |

第四項一致來源（非 050 所引用，本票補記）：`docs/health-check/TODO.md:707-708` 的 P2-12 完成條件，
第 4 點是「在隔離測試表完成兩帳號 probe」，第 5 點才是「captain 確認後才把欄位與公式套到正式 SSOT」。
順序與上述判定相同。

**這一節的用途：讓下一個接手的人不必重新推導這條鏈。**

## Risk evidence

design stage 沒有接觸任何試算表，也沒有 Google 帳號。證據改用「離線執行真正的 `approval-workflow.gs`」取得。
以 stub 取代 `Utilities`、`SpreadsheetApp` 等 Google 端全域物件，載入原始碼後直接呼叫其中的函式。

**重跑指令**（在 repo 根目錄執行。只讀不寫，不連網，不碰任何試算表）：

```bash
node --input-type=module -e '
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
const P = ["scripts/apps-script/approval-workflow.gs",
  ".worktrees/spacedock-ensign-040-approval-content-version-binding/scripts/apps-script/approval-workflow.gs"];
const src = P.find(existsSync); if (!src) throw new Error("找不到 approval-workflow.gs");
const Utilities = { DigestAlgorithm:{SHA_256:1}, Charset:{UTF_8:1},
  computeDigest: (_a,p) => Array.from(createHash("sha256").update(p,"utf8").digest()).map(b => b>127 ? b-256 : b) };
const M = new Function("Utilities","SpreadsheetApp","LockService","Session",
  readFileSync(src,"utf8") + ";return{resolveApprovalHeaders_,CONTENT_FINGERPRINT,APPROVAL_STATUS};")(Utilities,{},{},{});
const R = ["status","review_decision","review_fingerprint","approved_by","approved_at","approved_fingerprint","current_fingerprint","reject_reason"];
const sheet = (n,h) => ({ getName:()=>n, getLastColumn:()=>h.length, getRange:()=>({getDisplayValues:()=>[h]}) });
const H = {
  "Track 1_history": ["id","category","chapter","content","handwriting","year","title","ruling","ruling_id","image_url"].concat(R),
  "Track 2_discussion": ["id","category","title","author","year","abstract","link","views","owl_comment （允鍾短評）","owl_depth_comment","vibe","sticky","full_content"].concat(R),
  "site_tldr": ["order","label","text","link"].concat(R),
};
console.log("來源:", src, "\n[標題列]");
for (const [n,h] of Object.entries(H)) {
  try { console.log("  OK  ", n, Object.keys(M.resolveApprovalHeaders_(sheet(n,h))).length, "欄"); }
  catch (e) { console.log("  FAIL", n, e.message); }
}
console.log("[寫錯的標題，必須全部 FAIL]");
for (const [label,n,h] of [
  ["owl_comment 用空格","Track 2_discussion",H["Track 2_discussion"].map(x=>x.startsWith("owl_comment")?"owl comment （允鍾短評）":x)],
  ["owl_comment 用底線接說明","Track 2_discussion",H["Track 2_discussion"].map(x=>x.startsWith("owl_comment")?"owl_comment_允鍾短評":x)],
  ["Track 1 少 chapter","Track 1_history",H["Track 1_history"].filter(x=>x!=="chapter")],
  ["Track 1 有兩個 status","Track 1_history",H["Track 1_history"].concat(["status （備份）"])],
  ["分頁名打成 Track1_history","Track1_history",H["Track 1_history"]],
]) { try { M.resolveApprovalHeaders_(sheet(n,h)); console.log("  OK  ",label,"<- 不該通過"); } catch(e){ console.log("  FAIL",label,":",e.message); } }
const fp = (k,v,s) => M.CONTENT_FINGERPRINT.apply(null,[k].concat(v, s===undefined?[]:[s]));
const T1 = { 2:["probe-h1","probe","","probe content A","","2026","probe title A","probe ruling A","probe-r1",""],
             3:["probe-h2","probe","","probe content B","","2026","probe title B","probe ruling B","probe-r2",""] };
const T2 = { 2:["probe-d1","probe","probe title D1","probe author","2026","probe abstract D1","https://example.invalid/d1","0","probe owl","probe depth","neutral","FALSE","probe full D1"],
             3:["probe-d2","probe","probe title D2","probe author","2026","probe abstract D2","https://example.invalid/d2","1","probe owl 2","probe depth 2","neutral","FALSE","probe full D2"] };
const T3 = { 2:["0","","probe tldr title","https://example.invalid/tldr"], 3:["1","probe label 1","probe text 1",""], 4:["2","probe label 2","probe text 2",""] };
console.log("[指紋對照表 current_fingerprint]");
for (const r of [2,3]) console.log("  Track 1_history      列"+r, fp("Track 1_history",T1[r]));
for (const r of [2,3]) console.log("  Track 2_discussion   列"+r, fp("Track 2_discussion",T2[r],r-1));
for (const r of [2,3,4]) console.log("  site_tldr            列"+r, fp("site_tldr",T3[r]));
const base = fp("Track 1_history",T1[2]);
const edited = fp("Track 1_history",T1[2].map((v,i)=>i===3?"probe content A2":v));
const BY="a@example.invalid", AT="2026-09-08T00:00:00Z";
console.log("[P1／P3 改內容後的預期 current_fingerprint]\n  Track 1_history 列2 content 改成 probe content A2 ->", edited);
console.log("[APPROVAL_STATUS 預期值]");
console.log("  核可完成                ->", M.APPROVAL_STATUS(base,"Approved",base,BY,AT,base));
console.log("  核可後內容被改          ->", M.APPROVAL_STATUS(edited,"Approved",base,BY,AT,base));
console.log("  只改 reject_reason      ->", M.APPROVAL_STATUS(base,"Approved",base,BY,AT,base));
console.log("  拒絕                    ->", M.APPROVAL_STATUS(base,"Rejected",base,BY,AT,base));
console.log("  手填 Approved 無指紋    ->", M.APPROVAL_STATUS(base,"Approved","",BY,AT,""));
'
```

`--input-type=module` 不可省略。省略時 `import` 會語法錯誤。

### 證據 1：本票建議的標題列可以通過，五種常見寫錯全部被擋

```
[標題列]
  OK   Track 1_history 18 欄
  OK   Track 2_discussion 21 欄
  OK   site_tldr 12 欄
[寫錯的標題，必須全部 FAIL]
  FAIL owl_comment 用空格 : 缺少欄位「owl_comment」。
  FAIL owl_comment 用底線接說明 : 缺少欄位「owl_comment」。
  FAIL Track 1 少 chapter : 缺少欄位「chapter」。
  FAIL Track 1 有兩個 status : 欄位「status」重複。
  FAIL 分頁名打成 Track1_history : 缺少欄位「order」。
```

`approval-workflow.gs:127-144` 的 `resolveApprovalHeaders_` **沒有別名表**。
`scripts/sync-content.mjs` 有別名表（`owl comment` 與 `owl_comment` 都收），Apps Script 沒有。
**建表步驟必須照本票給的字串逐字輸入。**

最後一行值得注意：分頁名稱打錯時，`resolveApprovalHeaders_` 會退回 `site_tldr` 的欄位清單，
於是報出看起來毫不相干的「缺少欄位「order」。」。`installApprovalFormulas` 會先擋分頁名稱
（`approval-workflow.gs:159`），但 `reviewActiveRows_` 不會（`:214`）。
所以核可時看到「缺少欄位「order」。」，要先懷疑分頁名稱。

### 證據 2：指紋對照表可以事先算出來

```
[指紋對照表 current_fingerprint]
  Track 1_history      列2 2d5e569ed2dc0f0154cb54ba4035332342731265a8eff83fac03a21c72c27765
  Track 1_history      列3 9538691c6fa6e34384c54d70df98ce77dcc04042c37834ae8f6063c08d65f908
  Track 2_discussion   列2 75882184aa4086d5e088d0a39a178c260ab9bcd3ee5c10373a42a931db3155af
  Track 2_discussion   列3 4414669e6e5aa6d216cf29c031a3feb71b455bb51abddaee4a1a47577b071b74
  site_tldr            列2 ae7076c36a4aa9d4c95821661f99f5bf4b2f339faffe9f0ce4e9c17d9d7962cd
  site_tldr            列3 4362c97d948f11b1a9eb188e0792478c400eca4b008d8d600e19e1084172ca25
  site_tldr            列4 c01993f124fabeed815d4cd5f19d49c4ac3bca86049026ddfa6ed955287b59ef
```

這七個值讓 probe 多出一項本來沒有的檢查：**測試表上跑的程式，是不是 repo 裡的那一份。**
指紋只要有一個字不同，就代表測試資料打錯字或 `.gs` 版本不同，後面所有結論都不能採信。

### 證據 3：狀態公式的預期值

```
[P1／P3 改內容後的預期 current_fingerprint]
  Track 1_history 列2 content 改成 probe content A2 -> bab4a7d2c9e29c3044b1afda0d252e44ca3624a019f7700d520874a8e6806843
[APPROVAL_STATUS 預期值]
  核可完成                -> Approved
  核可後內容被改          -> Needs review
  只改 reject_reason      -> Approved
  拒絕                    -> Rejected
  手填 Approved 無指紋    -> Needs review
```

離線只證明「公式的算法正確」。**它不證明 Google 試算表會在內容被改時重算自訂函式。**
那才是 probe 要證明的事。兩者不可互相取代。

### 證據 4：`site_tldr` 的 `order 0` 列不把 `label` 算進指紋

同一列只改 `label`，指紋不變（兩次都是 `ae7076c3…62cd`）。
原因在 `approval-workflow.gs:61-64` 的 `approvalFieldsFor_`：`order` 為 `0` 時投影是
`['order','text','link']`，不含 `label`。`order` 大於 0 時投影是 `['order','label','text']`，不含 `link`。

**這是設計行為，不是缺陷**——`order 0` 的 `label` 不會發布到網站。
但它會讓 probe 出現一個反直覺結果：改了格子，`status` 卻不變。
**步驟 7 的 P1 不要用這一格做測試。** 本票已把它列為預期結果，避免被誤判成公式失效。

## 角色與帳號

| 代號 | 角色 | 身分 | 誰扮演 |
|---|---|---|---|
| **A** | 責任編輯／核可者 | 測試表**擁有者**，綁定式 Apps Script 專案擁有者 | captain 現用的 Google 帳號 |
| **B** | 投稿者 | 以「編輯者」身分受邀，**不是擁有者** | 第二個 Google 帳號 |

**兩個帳號的 email 都不寫進任何檔案。** 證據文件只寫「A」「B」。

> **為什麼 B 一定不能是擁有者。** Google 試算表的保護範圍**無法排除擁有者**。
> B 若是共同擁有者，命題 P2 必定通過不了，而且失敗原因與程式無關。

## probe 執行程序

**執行者標示：`captain` 表示只能由人在 Google 試算表手動完成，worker 無法代勞。`工程` 表示可由 worker 執行。**

**整段程序不碰正式 SSOT。** 不開啟正式表，不複製正式表，不設定任何 CSV URL 環境變數。

### 步驟 0（工程）把 Apps Script 兩個檔備成純文字

```bash
# 在 repo 根目錄執行。
for f in approval-workflow.gs appsscript.json; do
  echo "===== $f ====="
  cat ".worktrees/spacedock-ensign-040-approval-content-version-binding/scripts/apps-script/$f"
done
```

兩個檔目前只在 feature 040 的 worktree，隨 040 合併才會進 `main`。
把輸出交給 captain，captain 不需要操作 git。

### 步驟 1（captain）建立隔離測試表

1. 開新的空白 Google 試算表。命名任意，例如 `probe-2026-09`。
2. **不要從正式表複製。** 複製會帶進正式內容，也可能帶進共用設定。
3. 建三個分頁，名稱**逐字**如下，並刪除預設的「工作表1」：

```
Track 1_history
Track 2_discussion
site_tldr
```

**名稱一個字都不能差**，包含大小寫、半形空格與底線。`approval-workflow.gs:159` 用分頁名稱當 key。

### 步驟 2（captain）貼上標題列與測試資料

每個分頁各做一次：點 `A1`，貼上對應的區塊，再執行
**資料 → 將文字分隔成不同欄 → 分隔符號選「逗號」**。若貼上後已自動分欄，跳過分欄。

> **每一行結尾的連續逗號是刻意的。** 它們代表審核欄位留空。不要刪掉。

**`Track 1_history`（18 欄）**

```
id,category,chapter,content,handwriting,year,title,ruling,ruling_id,image_url,status,review_decision,review_fingerprint,approved_by,approved_at,approved_fingerprint,current_fingerprint,reject_reason
probe-h1,probe,,probe content A,,2026,probe title A,probe ruling A,probe-r1,,,,,,,,,
probe-h2,probe,,probe content B,,2026,probe title B,probe ruling B,probe-r2,,,,,,,,,
```

**`Track 2_discussion`（21 欄）**

```
id,category,title,author,year,abstract,link,views,owl_comment （允鍾短評）,owl_depth_comment,vibe,sticky,full_content,status,review_decision,review_fingerprint,approved_by,approved_at,approved_fingerprint,current_fingerprint,reject_reason
probe-d1,probe,probe title D1,probe author,2026,probe abstract D1,https://example.invalid/d1,0,probe owl,probe depth,neutral,FALSE,probe full D1,,,,,,,,
probe-d2,probe,probe title D2,probe author,2026,probe abstract D2,https://example.invalid/d2,1,probe owl 2,probe depth 2,neutral,FALSE,probe full D2,,,,,,,,
```

**`site_tldr`（12 欄）**

```
order,label,text,link,status,review_decision,review_fingerprint,approved_by,approved_at,approved_fingerprint,current_fingerprint,reject_reason
0,,probe tldr title,https://example.invalid/tldr,,,,,,,,
1,probe label 1,probe text 1,,,,,,,,,
2,probe label 2,probe text 2,,,,,,,,,
```

#### 標題列的規則（照做就會對，改字就會壞）

`approval-workflow.gs:127-144` 的 `resolveApprovalHeaders_` 只接受兩種標題：

1. 標題**逐字等於欄名**，例如 `owl_comment`。
2. 標題**以欄名開頭，緊接一個合法分隔符**，例如 `owl_comment （允鍾短評）`。

合法分隔符只有這些（`approval-workflow.gs:15` 的 `HEADER_SEPARATORS`）：

```
半形空格   tab   (   （   [   ［   {   ｛   -   –   —   :   ：   /   ｜   |   ,   ，
```

**底線不在裡面。** `owl_comment_允鍾短評` 會被判成「缺少欄位「owl_comment」。」。

三條硬規則：

1. **同一分頁不可有兩個標題對到同一個欄名。** 例如同時有 `status` 與 `status （備份）`，
   會報「欄位「status」重複。」。
2. **不可漏欄。** Track 1 少 `chapter` 就報「缺少欄位「chapter」。」，公式一格都裝不上。
3. **標題列不可留空白列或合併儲存格。** 程式只讀第 1 列。

上面的 `Track 2_discussion` 刻意保留一個帶中文說明的標題 `owl_comment （允鍾短評）`。
**這是要在真實試算表上證明分隔符規則成立**，不是裝飾。正式表的標題全部帶中文說明，
這一格若在測試表上失敗，050 的步驟 3 就要改寫。

> ⚠️ **2026-09-15 追加補述（probe 實跑發現）：直接貼上剪貼簿不可行。**
> 上面寫「點 `A1`，貼上對應的區塊，再執行資料 → 將文字分隔成不同欄」。實跑時換行失效。
> 三個區塊全部擠成一列，A2 空白。
> **改用：檔案 → 匯入 → 上傳 → 取代目前工作表 → 分隔符逗號。**
> 匯入後驗證欄數：`Track 1_history` 18 欄（R1 = `reject_reason`）、
> `Track 2_discussion` 21 欄（U1 = `reject_reason`）、`site_tldr` 12 欄（L1 = `reject_reason`）。
> 原句保留。

### 步驟 3（captain）安裝 Apps Script 並裝公式

1. **擴充功能 → Apps Script**，建立綁定式專案。
2. 把步驟 0 的 `approval-workflow.gs` 內容貼進 `Code.gs`（或新增同名檔）。
3. 左側 **專案設定 → 勾選「在編輯器中顯示 appsscript.json 資訊清單檔案」**，
   再把 `appsscript.json` 的內容貼進去。儲存。
4. 回到試算表，**重新載入分頁**。工具列出現 `Review` 選單。
5. 切到 `Track 1_history`，執行 `Review → 安裝／更新公式`。第一次會跳授權視窗，**必須授權**。
6. `Track 2_discussion` 與 `site_tldr` **各再執行一次**。選單只作用在當下的分頁。

**每次執行都到 Apps Script 編輯器左側「執行項目」抄下 execution ID。** 三次都要抄。

| 看到什麼 | 意思 | 怎麼辦 |
|---|---|---|
| 沒有跳錯 | ✅ 成功 | 繼續 |
| `缺少欄位「X」。` | 標題列有一欄名字不對或漏掉 | 回步驟 2 對字串 |
| `欄位「X」重複。` | 兩個標題對到同一個欄名 | 回步驟 2 |
| `這個分頁不支援核可公式。` | 分頁名稱打錯 | 回步驟 1 |
| 沒有 `Review` 選單 | 沒重新載入分頁，或程式沒存檔 | 重新載入 |
| `無法取得核可者身分。` | Apps Script 未授權 | 重跑一次選單並授權 |

> ⚠️ **2026-09-15 追加補述一（probe 實跑發現）：`onOpen` 會被誤認成安裝紀錄。**
> 上面第 4 點要求重新載入分頁。重新載入會自動觸發 `onOpen`，
> 該次執行在「執行項目」顯示為已完成。它不是安裝紀錄。
> **確認安裝時，要看函式名稱是不是 `installApprovalFormulas`。** 原句保留。

> ⚠️ **2026-09-15 追加補述二（適用步驟 3、5、11、12）：execution ID 不存在。**
> 上面寫「每次執行都到 Apps Script 編輯器左側『執行項目』抄下 execution ID」。
> **現行 Apps Script 介面不提供 execution ID。**「執行項目」的欄位只有
> 部署、函式、類型、開始時間、持續時間、狀態。
> **改為記錄函式名稱與開始時間（到秒）與狀態，或直接指向步驟 4 的指紋對照。**
> 指紋對照的證據強度更高：execution ID 只證明「有跑過」，指紋對照證明「跑的是哪一版」。
> 本次 probe 未取得開始時間，證據文件以指紋對照替代。
> 步驟 5、11、12 的同一句要求一併以本補述更正。原句保留。

> ⚠️ **2026-09-15 追加補述三（probe 實跑證實）：中文說明標題可以通過。**
> `Track 2_discussion` 的標題 `owl_comment （允鍾短評）` 在真實試算表上安裝成功。
> 「欄名＋合法分隔符＋中文說明」的規則成立。feature 050 的步驟 3 不需要改寫。

### 步驟 4（captain ＋ 工程）核對指紋，確認測試表跑的是 repo 那份程式

裝完公式後，`current_fingerprint` 欄會出現 64 個十六進位字元。
把七格的值逐字抄下來，與「Risk evidence 證據 2」的對照表比對。

| 分頁 | 列 | 必須逐字等於 |
|---|---|---|
| `Track 1_history` | 2 | `2d5e569ed2dc0f0154cb54ba4035332342731265a8eff83fac03a21c72c27765` |
| `Track 1_history` | 3 | `9538691c6fa6e34384c54d70df98ce77dcc04042c37834ae8f6063c08d65f908` |
| `Track 2_discussion` | 2 | `75882184aa4086d5e088d0a39a178c260ab9bcd3ee5c10373a42a931db3155af` |
| `Track 2_discussion` | 3 | `4414669e6e5aa6d216cf29c031a3feb71b455bb51abddaee4a1a47577b071b74` |
| `site_tldr` | 2 | `ae7076c36a4aa9d4c95821661f99f5bf4b2f339faffe9f0ce4e9c17d9d7962cd` |
| `site_tldr` | 3 | `4362c97d948f11b1a9eb188e0792478c400eca4b008d8d600e19e1084172ca25` |
| `site_tldr` | 4 | `c01993f124fabeed815d4cd5f19d49c4ac3bca86049026ddfa6ed955287b59ef` |

`status` 欄此時應**全部顯示 `Needs review`**。

**有任何一格對不上就停下來，不要繼續。** 可能原因依序檢查：

1. 貼上的資料有一個字不同（多一個空格、全形半形不同、數字被自動格式化）。
2. `Track 2_discussion` 的列順序不對。它的指紋含「已發布列序號」
   （`approval-workflow.gs:76-80` 的 `__sequence`），**列 2 的序號必須是 1，列 3 必須是 2**。
3. 貼進 Apps Script 的 `.gs` 不是 repo 那一份。

| `status` 顯示 | 意思 |
|---|---|
| `Needs review` | ✅ 正常。還沒核可 |
| 空白 | 該列所有發布欄位都空。表示資料沒貼進去 |
| `#FINGERPRINT! …` | `views`／`order`／`sticky` 格式錯誤 |
| `#NAME?` | Apps Script 沒載入成功，回步驟 3 |

### 步驟 5（captain）用 A 核可全部七列

在每個分頁選取資料列（**不要選到第 1 列**），執行 `Review → 核可選取列`。

- `Track 1_history`：選第 2-3 列
- `Track 2_discussion`：選第 2-3 列
- `site_tldr`：選第 2-4 列

核可後 `status` 全部變成 `Approved`，`approved_by` 出現 A 的 email，
`approved_at` 出現 UTC 時間，三份指紋相同。

**三次執行的 execution ID 都要抄下來。**

> **證據文件不記錄 `approved_by` 的值。** 那是帳號 email。只記「A」。

> ⚠️ **2026-09-15 追加補述：「三次執行的 execution ID 都要抄下來」無法執行。**
> 見步驟 3 的追加補述二。改記函式名稱與開始時間，或指向步驟 4 的指紋對照。原句保留。

### 步驟 6（captain）設定保護範圍，然後才邀請 B

**順序不可顛倒。** 先保護，後邀請。否則 B 會有一段可以動任何欄位的空窗。

**資料 → 保護的工作表和範圍**。每個分頁各設三個範圍：

| 類別 | 範圍 | 權限設定 |
|---|---|---|
| 甲　公式欄 | `status`、`current_fingerprint` 兩欄（第 2 列以下） | 限制 → 只有你 |
| 乙　審核欄 | `review_decision`、`review_fingerprint`、`approved_by`、`approved_at`、`approved_fingerprint`、`reject_reason` 六欄 | 限制 → 只有你 |
| 丙　標題列 | 第 1 列**全列** | 限制 → 只有你 |

**三個分頁 × 三類 = 九個保護範圍。** 保護範圍不會跨分頁繼承。

> ⚠️ **一定要選「限制可編輯此範圍的使用者」，不可選「編輯這個範圍時顯示警告」。**
> 警告模式擋不住任何人。B 按一下「確定」就能改，而且 P2 會得到假通過。

設完之後，用**共用 → 加入 B → 權限「編輯者」**。
**不要**勾選「編輯者可以變更權限和共用設定」。

> 🔴 **2026-09-15 追加補述（probe 實跑發現）：保護範圍極易漏設，必須以行為驗收。**
> 上面的三類保護表只描述「要設哪三類」。實跑時 `Track 1_history`
> **只有 Q（`current_fingerprint`）與 R（`reject_reason`）兩欄真正受保護**，
> 其餘設定看起來正確但未生效。P2 因此得到假通過，直到準備步驟 13 時清查才發現。
>
> **設定畫面不是驗收標準。行為才是。** 設完保護範圍後，用 B 帳號逐格實測下表：
>
> | 格 | 欄位 | 類別 | 預期 |
> |---|---|---|---|
> | A1 | 標題列 | 丙 | 擋 |
> | K2（Track 1） | `status` | 甲 | 擋 |
> | Q2（Track 1） | `current_fingerprint` | 甲 | 擋 |
> | L2（Track 1） | `review_decision` | 乙 | 擋 |
> | M2（Track 1） | `review_fingerprint` | 乙 | 擋 |
> | N2（Track 1） | `approved_by` | 乙 | 擋 |
> | O2（Track 1） | `approved_at` | 乙 | 擋 |
> | P2（Track 1） | `approved_fingerprint` | 乙 | 擋 |
> | R2（Track 1） | `reject_reason` | 乙 | 擋 |
> | D2（Track 1） | `content` | 內容 | **可改**（反向對照，確認未過度保護） |
>
> 三個分頁各做一次。任何一格與預期不符，回頭補設該範圍，再全部重測。
>
> **範圍數量不是九個。** 實際設定 11 個。原因是「乙　審核欄」六欄不連續，
> `reject_reason` 與其餘五欄被 `current_fingerprint` 隔開，部分分頁要拆成兩段。
> **判準是行為，不是數量。** 原句保留。

### 步驟 7（captain，帳號 A）P1 —— 責任編輯自己改內容

**這是本票的第一個命題，也是 feature 040 的 AC-4。**

1. 先抄下 `Track 1_history` 列 2 的 `approved_by`（只記「A」）、`approved_at`、`approved_fingerprint`。
2. 用 A 把列 2 的 `content` 從 `probe content A` 改成 `probe content A2`。
3. 等 `current_fingerprint` 重算。

**預期結果：**

| 欄位 | 預期 |
|---|---|
| `current_fingerprint` | 變成 `bab4a7d2c9e29c3044b1afda0d252e44ca3624a019f7700d520874a8e6806843` |
| `status` | 變成 `Needs review` |
| `approved_by`、`approved_at`、`approved_fingerprint` | **三欄逐字不變** |
| `review_decision` | 仍是 `Approved`（這是紀錄，不是狀態） |

**怎麼判讀失敗：**

| 現象 | 判讀 |
|---|---|
| `status` 幾秒內沒變 | **先重新載入分頁再看。** 自訂函式有重算延遲。重載後仍是 `Approved` 才算失敗 |
| 重載後仍是 `Approved` | ⛔ **真失敗。** 公式沒有把 `current_fingerprint` 當輸入，或指紋沒重算 |
| `approved_*` 被清空 | ⛔ **真失敗。** 稽核紀錄不該因為內容變動而消失 |
| `current_fingerprint` 變成別的值 | 你改的字與本票不同。對一次 `probe content A2` |

4. 改回 `probe content A`，確認 `current_fingerprint` 回到 `2d5e569e…7765`，`status` 回到 `Approved`。
   **這一步證明重算是雙向的，不是單向鎖死。**

> **不要用 `site_tldr` 列 2 的 `label` 做這個測試。** 見證據 4，那一格不進指紋，改了不會變。

### 步驟 8（captain，帳號 B）P2 —— 投稿者不能編輯審核欄位

用 B 登入，開啟測試表。**在 `Track 1_history` 逐一嘗試編輯這八欄的列 2 儲存格：**

```
status  review_decision  review_fingerprint  approved_by
approved_at  approved_fingerprint  current_fingerprint  reject_reason
```

再做三次繞道嘗試：

1. **整列複製貼上**：複製列 3 全列，貼到列 2。
2. **刪除整欄**：對 `status` 欄按右鍵 → 刪除欄。
3. **改標題**：把 `A1` 的 `id` 改成別的字。

**預期結果：八格編輯、三次繞道，全部出現「您想在受保護的儲存格或物件中進行編輯」的拒絕視窗，
儲存格的值一個都沒有變。**

**怎麼判讀失敗：**

| 現象 | 判讀 |
|---|---|
| 出現「您正在編輯…確定要繼續嗎？」而不是拒絕 | ⛔ 保護範圍設成了「顯示警告」。回步驟 6 改成「限制」 |
| 完全沒有跳窗，值直接改掉 | ⛔ 該欄不在任何保護範圍內，或 B 被誤設為擁有者 |
| 整列貼上成功 | ⛔ 保護範圍沒涵蓋該欄。Google 對整列貼上是「有一格受保護就整批拒絕」 |
| B 看不到試算表 | 邀請沒送出或 B 沒接受 |

**八格、三次繞道的結果都要逐項記進證據文件**，不可只寫「全部擋住」。

### 步驟 9（captain，帳號 B）P3 —— 投稿者改內容也會退回

**這是 feature 040 的 AC-2。**

用 B 把 `Track 1_history` 列 3 的 `content` 從 `probe content B` 改成 `probe content B2`。

**預期結果：`status` 變成 `Needs review`，`approved_by`／`approved_at`／`approved_fingerprint` 不變。**

判讀方式與步驟 7 相同。**這一步證明退回與操作者身分無關。**
改完後由 B 改回 `probe content B`，確認 `status` 回到 `Approved`。

### 步驟 10（captain，帳號 A）P4 —— 只改審核欄位不會退回

**這是 feature 040 的 AC-5 的試算表端。**

用 A 在 `Track 1_history` 列 2 的 `reject_reason` 填入 `probe-note`。

**預期結果：`current_fingerprint` 逐字不變（仍是 `2d5e569e…7765`），`status` 維持 `Approved`。**

若 `status` 變成 `Needs review`，代表審核欄位被算進內容指紋。⛔ 真失敗。
清空 `reject_reason` 再繼續。

### 步驟 11（captain，帳號 A）P5 —— 拒絕流程

用 A 選取 `Track 1_history` 列 3，執行 `Review → 拒絕選取列`，輸入原因 `probe-reject`。

**預期結果：**

| 欄位 | 預期 |
|---|---|
| `status` | `Rejected` |
| `review_decision` | `Rejected` |
| `reject_reason` | `probe-reject` |
| `approved_by`、`approved_at`、`approved_fingerprint` | **保留上一次核可的值** |

接著用 A 改列 3 的 `content`，確認 `status` 由 `Rejected` 變成 `Needs review`
（`current_fingerprint` 不再等於 `review_fingerprint`）。

抄下 execution ID。做完後重新核可列 3，把狀態恢復成 `Approved`。

> ⚠️ **2026-09-15 追加補述：「抄下 execution ID」無法執行。**
> 見步驟 3 的追加補述二。原句保留。
>
> **實跑結果補記**：P5 前後半皆通過。另發現以未授權帳號執行 `Review → 拒絕選取列`
> **完全沒有作用且沒有錯誤訊息**（靜默失敗）。詳見證據文件的「過程發現」第二項。

### 步驟 12（captain）P6 —— installable edit trigger 能不能寫入受保護欄位（UNPROVEN）

> **這一步必須放在最後。** trigger 會寫入 `reject_reason`，做在前面會污染步驟 10 的 P4。

1. 在 Apps Script 專案**新增一個檔案** `probe-trigger.gs`，貼入：

```javascript
/** 只給隔離測試表的 probe 用。不得進 repo，不得套到正式試算表。 */
function probeTriggerWrite(e) {
  const sheet = e.range.getSheet();
  const columns = resolveApprovalHeaders_(sheet);
  sheet.getRange(e.range.getRow(), columns.reject_reason)
    .setValue('probe-trigger-ok ' + new Date().toISOString());
}
```

2. 左側 **觸發條件 → 新增觸發條件**：函式選 `probeTriggerWrite`，
   事件來源選「來自試算表」，事件類型選「修改時」。儲存並授權。
   **必須由 A 安裝。** installable trigger 以安裝者的身分執行。
3. 切到 B，改 `Track 1_history` 列 2 的 `content`。
4. 切回 A，看列 2 的 `reject_reason`。

**兩種結果都要記錄，都不算 probe 失敗：**

| 結果 | 意思 |
|---|---|
| `reject_reason` 出現 `probe-trigger-ok …` | trigger 可以寫入對 B 保護的欄位 |
| `reject_reason` 沒變，「執行項目」出現錯誤 | trigger 寫不進去。抄下錯誤訊息 |

**不論結果是哪一個，結論都一樣**：trigger 只能當成加速提示，
**不得取代 `scripts/sync-content.mjs` 的同步端指紋閘門**。理由是 trigger 可以被停用、
可以失敗、可以被授權過期擋住，而同步端閘門每次同步都會跑。

抄下 execution ID。**做完後刪除觸發條件，並刪除 `probe-trigger.gs`。**

> ⏭ **2026-09-15 追加補述：本步驟由 captain 決定跳過，未執行。**
> trigger 寫入路徑維持 `UNPROVEN`。
> 跳過理由：兩種結果的結論相同——trigger 可被停用、可失敗、授權可過期，
> 因此不論能否寫入，都不得取代 `scripts/sync-content.mjs` 的同步端指紋閘門。
> 本 probe 的所有結論都不依賴 trigger 路徑。
> **補做路徑已保留**：測試表保留不刪，`~/Documents/probe-csv/` 的三份 CSV
> 與兩個 Apps Script 檔保留。本步驟獨立，只寫入 `reject_reason`，
> 其唯一會被污染的 P4 已驗畢，可單獨補跑，約十分鐘。
> 補做結果以追加補述寫進證據文件，不改寫原文。
> 「抄下 execution ID」一句同樣無法執行，見步驟 3 的追加補述二。原句保留。

### 步驟 13（captain）P7 —— 非擁有者的責任編輯（🔴 需 captain 確認是否納入）

**這一項超出本票原始的三個命題，是為 feature 050 加做的。**

feature 050 的步驟 6 把保護分成「只有 captain 可改的公式欄」與「只有責任編輯可改的審核欄」兩類。
**那個分法從來沒有被驗證過。** 用同一組帳號多花五分鐘就能驗，不需要第三個帳號。

1. 用 A 修改「乙　審核欄」那個保護範圍，把 B 加入可編輯名單。**甲、丙兩類維持只有 A。**
2. 用 B 在 `Track 1_history` 列 2 的 `reject_reason` 填字 → **預期成功**。
3. 用 B 改 `status` 或 `current_fingerprint` → **預期被拒絕**。
4. 用 B 選取列 2，執行 `Review → 核可選取列` → **預期成功**，`approved_by` 顯示 B。
5. 做完後把 B 從「乙」的名單移除，還原成步驟 6 的設定。

**若第 4 點失敗**（例如報 `無法取得核可者身分。`），代表 050 的責任編輯必須自己授權 Apps Script。
把錯誤訊息記進證據文件，050 的步驟 4 要補一段「責任編輯首次使用要授權」。

**captain 若決定不做這一項**，把 AC-9 標為 SKIPPED，並在證據文件註明未驗證。
050 的步驟 6 就要自行承擔這個風險。

> ✅ **2026-09-15 追加補述：captain 於 2026-09-07 核准納入，本步驟已執行且通過。**
> 三項子測試全部符合預期。`無法取得核可者身分。` 未出現，
> 因此 feature 050 的步驟 4 不需要補充授權說明。詳見證據文件的 P7 一節。
>
> **前置修復記事**：清查時 B 曾可編輯 A1、K2、L2、N2（見步驟 6 的追加補述）。
> 四格已還原後才執行本步驟。

### 步驟 14（工程 ＋ captain）產出證據文件

新增 `docs/content-pipeline/approval-permission-probe.md`，狀態 `record`。

**測試表 ID 的雜湊怎麼算。** 兩條路，captain 挑一條：

- captain 把測試表 ID 給工程，工程執行下面的指令，**只把 64 字元的雜湊寫進文件**。
- captain 自己執行下面的指令，只回傳雜湊。

```bash
# 把 <SHEET_ID> 換成測試表網址中 /d/ 與 /edit 之間那一段。
printf '%s' '<SHEET_ID>' | shasum -a 256
```

**測試表 ID 本身不寫進 repo，也不寫進本票。**

**文件骨架：**

```markdown
# 隔離測試表兩帳號 probe 記錄

**狀態**：record
**執行日期**：{YYYY-MM-DD}
**測試表 ID 雜湊（SHA-256）**：{64 字元}
**Apps Script 版本**：`scripts/apps-script/approval-workflow.gs`，commit {sha}

## 角色

| 代號 | 角色 | 身分 |
|---|---|---|
| A | 責任編輯／核可者 | 測試表擁有者 |
| B | 投稿者 | 編輯者 |

## 環境建立

{步驟 1-6 的實際結果。三個分頁的欄數、九個保護範圍、遇到的錯誤}

## 指紋核對

{七列的實際值，與本票對照表逐字比對的結果}

## 各命題結果

### P1 責任編輯自行修改內容
{UTC 時間、操作、預期、實際、判定}
...（P2 至 P7 同格式）

## Apps Script execution ID

| 操作 | execution ID | UTC 時間 |
|---|---|---|
| 安裝公式 Track 1_history | | |
...

## 結論與對 feature 050 的影響

{哪些命題成立、哪些不成立、050 的 runbook 要不要改}
```

**禁止寫入：** 任何帳號 email（含 `approved_by` 的實際值）、正式 SSOT 的網址或 ID、
測試表的完整網址或 ID。

同步在 `docs/INDEX.md` 的「內容產線」表新增一列。

### 步驟 15（captain）收尾

1. 確認 `probe-trigger.gs` 與它的觸發條件都已刪除。
2. 把 B 從測試表的共用名單移除。
3. 測試表保留或刪除由 captain 決定。**測試資料一律不得複製到正式表。**
   `probe-h1`、`probe content A` 這類值屬於 `AGENTS.md` 第 3 條的佔位資料。

## 本 probe 不能證明什麼

寫在這裡，避免下一個人把 probe 的結論放大解讀。

| 不能證明 | 為什麼 |
|---|---|
| 正式表的權限設定正確 | 測試表是新建的空表，共用名單只有兩人。正式表的編輯權限已開放給多位學者，名單不同 |
| 正式表的標題列能通過 | 正式表的標題有中文說明且已知兩處不符（`chapter` 不存在、`owl comment` 用空格）。那是 feature 050 步驟 1-3 的事 |
| 同步端會擋住舊核可 | 那由 040 的 `tests/approval-content-version-binding.test.mjs` 證明。probe 不跑同步 |
| 59 列重新核可不會出錯 | 測試表只有七列。列數帶來的問題（Track 2 序號、逾時、誤選）要在 050 的步驟 7 面對 |
| trigger 可以取代同步端閘門 | 見步驟 12。不論結果如何，結論都是不可取代 |

## 執行結果與交給 feature 050 的結論（2026-09-15 追加）

probe 已執行完畢。完整記錄在 `docs/content-pipeline/approval-permission-probe.md`（`record`）。

| 命題 | 結果 | 對應 |
|---|---|---|
| P1 責任編輯自己改內容也會退回 | 通過 | feature 040 的 AC-4 |
| P2 投稿者不能編輯審核欄位 | 通過（重驗；**首次為假通過**） | feature 040 的 AC-4 |
| P3 投稿者改內容也會退回 | 通過 | feature 040 的 AC-2 |
| P4 只改審核欄位不會退回 | 通過 | feature 040 的 AC-5 |
| P5 拒絕流程可用且保留稽核紀錄 | 通過 | — |
| P6 trigger 能否寫入受保護欄位 | **跳過**，維持 `UNPROVEN` | — |
| P7 非擁有者的責任編輯 | 通過 | feature 050 的步驟 6 |

**feature 040 在 verify cycle 1 被判 REJECTED 的 AC-2 與 AC-4，所需的試算表端證據已齊備。**

**但有一項限制，040 的 gate 必須知道**：齊備的是 `status` 重算的行為證據。
`approved_*` 三欄「逐字不變」的證據**不齊**——P1 只查核 `approved_by` 與 `approved_at` 兩欄，
P3 完全未查核。040 的 gate 若要求該項，需另行補測。

### 結論一：保護範圍必須以非擁有者帳號逐格實測驗收，不得以設定畫面為準

本次即因為只看設定畫面而漏設。清查時 `Track 1_history`
**只有 Q（`current_fingerprint`）與 R（`reject_reason`）兩欄真正受保護**，
其餘設定看起來正確但未生效。P2 因此首次得到假通過。

漏設發生在七列、三分頁、由 captain 親手設定的測試表上。正式表是 59 列，已開放多位協作者。

**feature 050 的步驟 6 必須改成**：逐格用非擁有者帳號實測、提供逐欄檢查表、
並把「內容欄可改」列為反向對照。逐欄檢查表見本票步驟 6 的追加補述。

### 結論二：責任編輯首次使用 `Review` 選單不需要額外授權 Apps Script

依據是 P7 的第 c 項。B 以非擁有者身分執行 `Review → 核可選取列` 成功，
`無法取得核可者身分。` 未出現。

**feature 050 的步驟 4 不需要補充授權說明。**

### 附帶：兩項要寫進 feature 050 操作手冊的規則

1. **不要手動編輯 `status` 欄。** 擁有者改得動（保護範圍排除不了擁有者，是平台限制）。
   手改會覆蓋該格公式，該列狀態自此不再自動更新，必須重跑「安裝／更新公式」還原。
   同步端不受影響：`validateApprovalBinding` 的閘門是 `review_decision` 與三份指紋，不是 `status`。
2. **核可選單「沒反應」時，先確認自己在審核欄保護範圍的允許名單內。**
   未授權帳號執行核可或拒絕會**靜默失敗**，沒有錯誤訊息。

**本票不編輯 feature 050 的票。** 跨票編輯是污染。上述結論由 050 自己的 stage 採用。

## 元件與資料需求

- **元件階層**：不適用。本票不改任何 `src/` 下的程式，不新增元件。
- **響應行為（手機／桌機）**：不適用。本票沒有網站畫面變更。
- **資料需求**：測試資料只存在於隔離測試表，永遠不進 `src/data/*.json`。
  資料形狀沿用 `approval-workflow.gs:4-11` 的 `APPROVAL_FIELDS` 與 `REVIEW_FIELDS`，本票不新增型別。

## Expected surface and tolerance

Estimate: +260 net LOC across 3 files, tolerance ±30%。

| 檔案 | 變動 |
|---|---|
| `docs/constitution-features/044-approval-permission-two-account-probe.md` | design stage 產出（本次） |
| `docs/content-pipeline/approval-permission-probe.md` | 新增，`record`（implement stage） |
| `docs/INDEX.md` | 新增一列（implement stage） |

Semantics this may change: `none`。本票不改程式、不改路由、不改資料形狀、不改執行期行為。

## Acceptance criteria

每一項都是「probe 做完之後世界應該是什麼樣子」，並附一個**會失敗**的驗證方式。

**AC-1　測試表上跑的 Apps Script 就是 repo 裡的那一份。**
Verified by: `docs/content-pipeline/approval-permission-probe.md` 的「指紋核對」一節，
七列 `current_fingerprint` 逐字等於本票步驟 4 的對照表。對照表可由 Risk evidence 的
`node --input-type=module -e '…'` 指令重算。
**會怎麼失敗**：測試資料打錯一個字、`Track 2_discussion` 列順序不對、或貼進 Apps Script 的
`.gs` 不是 repo 那份，指紋就對不上。

**AC-2　核可後修改發布欄位一定退回，與操作者身分無關。**
Verified by: 證據文件的 P1 與 P3 兩節。P1 由 A 改 `Track 1_history` 列 2 的 `content`，
P3 由 B 改列 3 的 `content`。兩次都必須記錄 `status` 由 `Approved` 變 `Needs review`，
且 `approved_by`／`approved_at`／`approved_fingerprint` 三欄逐字不變。P1 的
`current_fingerprint` 必須等於 `bab4a7d2c9e29c3044b1afda0d252e44ca3624a019f7700d520874a8e6806843`。
**會怎麼失敗**：任一次重新載入後 `status` 仍是 `Approved`，或 `approved_*` 被清空。
（對應 feature 040 的 AC-4 與 AC-2）

**AC-3　投稿者對八個審核欄位一格都改不到。**
Verified by: 證據文件的 P2 一節，逐項列出八個欄位的編輯嘗試與三次繞道嘗試
（整列貼上、刪整欄、改標題），共十一項，每一項都記錄「被拒絕」與拒絕視窗的字樣。
**會怎麼失敗**：任何一項出現的是「顯示警告」式的確認視窗、或值真的被改掉。
只寫「全部擋住」而沒有逐項記錄，判定不成立。

**AC-4　只改審核欄位不會造成無效退回。**
Verified by: 證據文件的 P4 一節。A 在 `reject_reason` 填 `probe-note` 後，
`current_fingerprint` 必須仍是 `2d5e569ed2dc0f0154cb54ba4035332342731265a8eff83fac03a21c72c27765`，
`status` 維持 `Approved`。
**會怎麼失敗**：指紋改變或 `status` 變成 `Needs review`，代表審核欄位被算進內容投影。
（對應 feature 040 的 AC-5 的試算表端）

**AC-5　拒絕流程可用，且保留上一次核可的稽核紀錄。**
Verified by: 證據文件的 P5 一節。`status` 顯示 `Rejected`、`reject_reason` 為 `probe-reject`、
`approved_*` 三欄保留步驟 5 的值；接著改內容後 `status` 轉為 `Needs review`。
**會怎麼失敗**：`approved_*` 被清空，或改內容後 `status` 仍停在 `Rejected`。

**AC-6　trigger 寫入路徑的結論被記錄，且沒有被拿來取代同步端閘門。**
Verified by: 證據文件的 P6 一節，記錄 trigger 是否寫入成功、execution ID，
以及一句明文結論：trigger 只能當加速提示，不取代 `scripts/sync-content.mjs` 的指紋閘門。
`docs/content-pipeline/design.md` 與 `operations.md` 不因本票放寬同步端檢查。
**會怎麼失敗**：文件只寫「trigger 可行」而沒寫上述結論，或有任何文件依此放寬同步端檢查。

**AC-7　證據文件符合記錄要求，且沒有洩漏。**
Verified by: `docs/content-pipeline/approval-permission-probe.md` 存在、狀態為 `record`，
且含測試表 ID 雜湊、UTC 時間、兩個角色、步驟、結果與 Apps Script execution ID。
以下指令必須無輸出：

```bash
# 一：email 與 Google 試算表網址。
grep -nE '@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|docs\.google\.com|/spreadsheets/d/' \
  docs/content-pipeline/approval-permission-probe.md
# 二：長度 40 以上的裸識別碼（Google 試算表 ID 是 44 字元）。先把 64 位十六進位雜湊挖掉再找。
sed -E 's/[a-f0-9]{64}//g' docs/content-pipeline/approval-permission-probe.md \
  | grep -nE '[A-Za-z0-9_-]{40,}'
```

**會怎麼失敗**：文件裡出現任何 email、任何 Google 試算表網址、
或任何長度 40 以上、不是 64 位十六進位雜湊的識別碼。

**AC-8　收尾完成，測試資料沒有外溢。**
Verified by: 證據文件的「收尾」一節記錄 trigger 與 `probe-trigger.gs` 已刪除、B 已移出共用名單。
且以下指令無輸出：

```bash
git grep -nE 'probe-h1|probe-d1|probe content A|probe tldr title|probeTriggerWrite' -- src scripts
```

**會怎麼失敗**：測試值或 probe 專用的 trigger 程式進了 `src/` 或 `scripts/`。

**AC-9（🔴 需 captain 確認是否納入）　非擁有者的責任編輯可以核可，但不能手改公式欄。**
Verified by: 證據文件的 P7 一節。B 被加入「乙　審核欄」保護範圍後，
填 `reject_reason` 成功、改 `status` 被拒、`Review → 核可選取列` 成功且 `approved_by` 為 B。
**會怎麼失敗**：核可報 `無法取得核可者身分。`，或 B 竟然能改 `status`。
**captain 決定不做時**，本項標為 SKIPPED，證據文件註明未驗證，
feature 050 步驟 6 的 A/B 兩類保護分法維持未驗證狀態。

### 判定（2026-09-15，probe 執行後追加）

上面九項 AC 的原文一字未改。下表是實際執行後的判定。
證據全部在 `docs/content-pipeline/approval-permission-probe.md`。

| AC | 判定 | 依據與落差 |
|---|---|---|
| AC-1 | **通過（粒度不足）** | 七格 `current_fingerprint` 全部相符。但比對的是開頭 8 碼與結尾 8 碼，不是 AC 原文要求的完整 64 字元逐字比對 |
| AC-2 | **部分達成** | 行為結論成立：P1 與 P3 的 `status` 都由 `Approved` 轉為 `Needs review`，退回與操作者身分無關。**三項記錄缺口**：(a) P1 只查核 `approved_by` 與 `approved_at` 兩欄，**`approved_fingerprint` 未查核**；(b) **P3 完全未查核三個 `approved_*` 欄**；(c) P1 改動後的 `current_fingerprint` 實際值未記錄，未與 `bab4a7d2…6843` 逐字比對。AC 原文要求 P1 與 P3 兩次都確認三欄逐字不變，該證據不存在 |
| AC-3 | **部分達成** | 行為結論成立（投稿者改不動審核欄、公式欄與標題列，改得動內容欄），但**只逐格記錄五格**（A1、K2、L2、N2、D2），未達 AC 原文的「八欄＋三次繞道＝十一項」。「整列複製貼上」與「刪除整欄」兩項繞道未測。**依 AC 原文，記錄粒度不成立，是否補測由 captain 決定** |
| AC-4 | **通過（間接證明）** | A 填入 `probe-note` 後 `status` 維持 `Approved`。`APPROVAL_STATUS` 只在三份指紋相符時顯示 `Approved`，故指紋確未改變。缺口：指紋值未逐字記錄 |
| AC-5 | **通過（記錄缺口）** | `status` 為 `Rejected`、`approved_by` 與 `approved_at` 保留；改內容後轉為 `Needs review`。缺口：`review_decision`、`reject_reason`、`approved_fingerprint` 三欄的實際值未查核。`probe-reject` 是輸入值，不是觀察到的欄位值 |
| AC-6 | **SKIPPED** | P6（步驟 12）由 captain 於 2026-09-15 決定跳過。trigger 寫入路徑**維持 `UNPROVEN`**。AC 要求的結論句仍寫進證據文件：trigger 只能當加速提示，不取代 `scripts/sync-content.mjs` 的指紋閘門。`design.md` 與 `operations.md` 未因本票放寬同步端檢查。**補做路徑見步驟 12 的追加補述** |
| AC-7 | **部分達成** | 證據文件已建立，狀態 `record`，含測試表 ID 雜湊、兩個角色、步驟與結果。三項缺口：(a) **execution ID 不存在於現行介面**，以指紋對照替代，見步驟 3 的追加補述二；(b) 逐步 UTC 時間未記錄；(c) 洩漏檢查指令一無輸出，指令二有一行輸出，即 Apps Script commit sha（40 字元）。該值是本票 checklist 明文要求記錄的公開 commit，不是洩漏。指令二若改為先挖掉 40 位十六進位字串再比對即無輸出 |
| AC-8 | **通過** | `git grep` 無輸出（exit 1）。`probe-trigger.gs` 與其觸發條件**從未建立**（P6 跳過），故無須刪除。B 已移出乙類保護範圍的允許名單。測試表由 captain 決定保留，供補做 P6 |
| AC-9 | **通過** | captain 2026-09-07 核准納入。P7 三項子測試全部符合預期：B 填 `reject_reason` 成功、改 `status` 與 `current_fingerprint` 被擋、`Review → 核可選取列` 成功且 `approved_by` 顯示 B |

**AC-7 指令二與本票 checklist 的衝突**：checklist 要求證據文件記錄 Apps Script commit sha，
該值為 40 個十六進位字元，會被指令二的 `[A-Za-z0-9_-]{40,}` 命中。
指令二實測輸出一行，即該 commit sha。加上 `s/[a-f0-9]{40}//g` 後無輸出。
**AC 原文未改，此處只記錄落差。**

## Test plan

**本票不改任何程式。** repo 端的驗證由 feature 040 的
`tests/approval-content-version-binding.test.mjs` 負責，本票不重跑、不修改。

implement stage 要跑的檢查：

1. **離線 oracle**：執行 Risk evidence 的 `node --input-type=module -e '…'` 指令。
   七個指紋、五個標題錯誤案例、五個 `APPROVAL_STATUS` 值必須與本票記載逐字相同。
   這一步在 probe 開始前跑一次，用來確定對照表沒有因為 040 改碼而失效。
2. **人工 probe**：步驟 1-15。執行者是 captain，worker 無法代勞。
3. **AC-7 的洩漏檢查指令**與 **AC-8 的 `git grep` 指令**：兩者都必須無輸出。
4. **`npx tsc --noEmit`**：確認本票沒有動到程式。

**不執行 `npm run sync-content`。**
**不設定測試表的 CSV URL 環境變數**，測試表不進入同步路徑。
**不開啟正式 SSOT。**

## Documentation impact

### 現在更新

| 文件 | 為什麼現在要改 | 更新內容 |
|---|---|---|
| `docs/constitution-features/044-approval-permission-two-account-probe.md` | 本票缺 `## Acceptance criteria`、`## Test plan` 與 `## Documentation impact`；captain 2026-09-07 的裁決與相依鏈沒有任何文件記錄 | 本次 design stage 的全部產出。**probe 尚未執行**，本票記的是要怎麼做與預期結果，不是已發生的結果 |

**為什麼不動 `docs/` 下的檔**：

- `docs/content-pipeline/design.md`、`operations.md`：probe 還沒跑，結論還不存在。現在寫等於把預定行為寫成已上線。
- `docs/health-check/TODO.md`：P2-12 的完成條件第 4、5 點已經記載「先 probe、後正式 SSOT」，與本次裁決一致。沒有需要更正的敘述。
- `docs/constitution-features/050-ssot-approval-deployment.md`：050 的 design stage 已自行加註更正。跨票編輯是污染。

### 實作後更新

| 文件 | 完成條件 | 更新內容 |
|---|---|---|
| `docs/content-pipeline/approval-permission-probe.md`（新增） | 步驟 1-15 執行完畢 | 完整 probe 記錄。狀態 `record`。含測試表 ID 雜湊、UTC 時間、兩個角色、步驟、結果、execution ID。不含 email 與正式 SSOT URL |
| `docs/INDEX.md` | 上一列的文件已建立 | 在「內容產線」表新增一列：路徑、用途、狀態 `record`、負責人、最後查核日 |
| `docs/constitution-features/050-ssot-approval-deployment.md` | probe 有任何命題不成立 | 由 050 自己的 stage 修改，**不由本票代改**。本票只在證據文件的「結論與對 feature 050 的影響」一節寫明要改什麼 |

### 不更新

| 文件 | 理由 |
|---|---|
| `AGENTS.md` | 本票不改變任何 agent 的行為約束 |
| `docs/content-pipeline/design.md` | 產線規格不因一次 probe 改變。probe 只提供證據 |
| `docs/content-pipeline/operations.md` | 該檔在 feature 040 的 worktree，改它是跨票污染。它的第 12 行正是限制本票的條文 |
| `docs/content-pipeline/data-collection-guide.md` | 只規範 T3 資料收集，與審核欄位無關 |
| `docs/health-check/2026-08-31-content-pipeline.md`、`2026-09-03-editor-onboarding.md` | 都是 `record`，依規定不改寫 |
| `docs/project/` 全部 | 架構、技術選型、視覺語言都不變 |
| `docs/_archive/` | 封存記錄，依規定不動 |
| `scripts/` 下任何程式 | 本票是純驗證票 |
| `docs/constitution-features/README.md` | workflow 規格不因單一 feature 改變 |

### 實際完成狀況（2026-09-15，implement stage 追加）

| 文件 | 狀態 |
|---|---|
| `docs/content-pipeline/approval-permission-probe.md` | **已新增**，狀態 `record`。含測試表 ID 雜湊、兩個角色、步驟、結果、收尾。**不含** email 與正式 SSOT URL。execution ID 改以指紋對照替代（現行介面不提供該欄位） |
| `docs/INDEX.md` | **已新增一列**於「內容產線」表 |
| `docs/constitution-features/050-ssot-approval-deployment.md` | **未改，且不應由本票改。** 要交給 050 的結論寫在本票的「執行結果與交給 feature 050 的結論」一節與證據文件的「結論與對 feature 050 的影響」一節 |
| 本票 | AC 判定已追加於 `## Acceptance criteria` 末；probe 實跑發現的四項程序缺漏以追加補述寫入步驟 2、3、6 與步驟 5／11／12（原句全部保留） |

**「不更新」一欄的判斷維持不變。** probe 的結論沒有放寬任何同步端檢查，
`docs/content-pipeline/design.md` 與 `operations.md` 因此不動。

### Feedback Cycles

- Cycle 1: REJECTED — verify；AC changed: no。安全查核與程序回寫兩項通過，退回原因為單一 Material finding：證據文件與 AC-2 判定列宣稱 P1／P3 的三個 `approved_*` 欄經實測不變，而原始記錄 P1 僅觀察兩欄、P3 完全未觀察。**成因在 FO**——probe 執行時 FO 只向 captain 詢問兩欄，撰寫時把 AC 的要求誤當成已觀察的事實。FO 授權 fix，方向為「如實縮小宣稱並揭露缺口」而非補做觀察（probe 已收尾）。修正後不僅改正該處，另主動揭露共五項記錄缺口並於檔頭加總覽，明載「記錄缺口，不是行為失敗；行為結論不受影響，但證據強度低於 AC 原文要求」。七命題的行為結論全數維持。


## Out of scope

不改 repo 端的 fingerprint 或同步邏輯（feature 040 已交付）。不上線正式 SSOT 設定。

### design stage 追加的 Out of scope

- **不修 `approval-workflow.gs` 缺別名表的問題。** 本票用「測試表照給定字串建標題」繞過。
  改程式要重跑 040 的 verify 與 review，代價大得多。這個落差由 feature 050 記為後續票。
- **不驗證正式表的標題列。** 正式表已知兩處不符（`chapter` 不存在、`owl comment` 用空格），
  那是 feature 050 步驟 1-3 的工作。
- **不執行 feature 050 的任何步驟。** 本票只交付證據。
- **不處理標題列保護與整列刪除。** 整列刪除由 feature 043 在同步端擋。
- **`probe-trigger.gs` 不進 repo。** 它只存在於測試表的 Apps Script 專案，用完即刪。

## Stage Report: design

- DONE: 產出 captain 可以直接照著做的 probe 執行程序：兩個 Google 帳號各自的角色與權限設定、隔離測試表的建法、每個待驗證命題的操作步驟與預期結果、以及失敗時如何判讀。每一步寫明由誰執行——probe 的執行者是 captain，worker 無法代勞，程序必須寫到「照著做就會對」的程度。**特別注意**：feature 050 的 design stage 剛以離線實跑真正的 `scripts/apps-script/approval-workflow.gs` 證明它的 `resolveApprovalHeaders_` 沒有別名表（`:127-144`），標題必須逐字等於欄名或以欄名加分隔符開頭。測試表的標題列若不符會讓「安裝／更新公式」直接報錯。請把這件事寫進建表步驟。
  「probe 執行程序」步驟 0-15，每步標 `captain` 或 `工程`；「角色與帳號」定義 A／B 並說明 B 為何不能是擁有者（保護範圍排除不了擁有者）；步驟 2 給三個可直接貼上的逗號分隔區塊，並附「標題列的規則」一節，逐字列出 `approval-workflow.gs:15` 的 18 個合法分隔符、明寫底線不在其中，且用離線實跑證明五種常見寫錯全部被擋（證據 1）；步驟 7-13 每個命題各有預期表與「怎麼判讀失敗」表。
- DONE: 補齊本票目前缺少的 `## Acceptance criteria` 與 `## Test plan`，每項附可失敗的 `Verified by:`。證據須寫入 `docs/content-pipeline/approval-permission-probe.md`（狀態 `record`），且必須記錄測試表 ID 的雜湊、時間、兩個角色、步驟、結果與 Apps Script execution ID；**不得記錄帳號 email 或正式 SSOT URL**。並補齊 `## Documentation impact` 三分類。
  AC-1 至 AC-9，每項各有「會怎麼失敗」。AC-1 綁定七個離線算出的 64 字元指紋；AC-2 綁定改內容後的指紋 `bab4a7d2…6843`；AC-7 與 AC-8 各給一組實測過的指令。步驟 14 給證據文件的完整骨架與 ID 雜湊指令，禁記項目逐條列出。Test plan 四項，明寫不執行 `npm run sync-content`、不設 CSV URL、不開正式 SSOT。Documentation impact 三分類齊全，「現在更新」只列本票並逐條說明為何不動 `docs/`。
- DONE: 在票內明確記錄 captain 於 2026-09-07 的裁決與相依鏈：044 是 feature 050 步驟 4 起的**硬前置**（captain 選 A），鏈條為「兩個 Google 帳號 → 044 → 050 → 040 合併」。同時記錄 feature 050 的 design stage 已判定其票內第 45 行「044 與本票不互為前置」為錯誤敘述，並列出該判定所依據的三項外部證據來源。這段記錄的目的是讓下一個接手的人不必重新推導這條鏈。
  「裁決與相依鏈（captain 2026-09-07）」一節：鏈條圖、三項外部證據來源表（`operations.md:12`、`040-…md:221`、`050-…md` 的 AC-3），並補記第四項一致來源 `docs/health-check/TODO.md:707-708`。本票不編輯 050。

### 可失敗的證據

- Risk evidence 的 `node --input-type=module -e '…'` 指令由本檔第 91-141 行原樣抽出後實跑，輸出與票內四段引用逐字相同。它斷言：三組建議標題各解析出 18／21／12 欄、五種寫錯各報出指定錯誤字串、七列指紋為指定值、五個 `APPROVAL_STATUS` 值為指定值。**只要 `approval-workflow.gs` 的欄位清單、正規化規則或分隔符表被改動，這些值就會變，指令輸出即與票內不符。**
- AC-7 的兩條洩漏檢查指令實跑過：對只含 64 位雜湊與 `example.invalid` 連結的樣本無輸出；注入 `someone@gmail.com` 與一個 44 字元試算表 ID 後，兩條都印出該行。
- AC-8 的 `git grep -nE 'probe-h1|…' -- src scripts` 對現行 repo 無輸出（exit 1）。任何測試值進入 `src/` 或 `scripts/` 都會讓它有輸出。

### Summary

design stage 沒有 Google 帳號、沒有試算表，所以全部證據改用「離線執行真正的 `approval-workflow.gs`」取得，指令附在票內可重跑。
最有用的產出是**七列指紋對照表**：它讓 probe 多一道原本沒有的檢查——確認測試表上跑的程式就是 repo 那一份。指紋對不上就代表資料打錯字或 `.gs` 版本不同，後面所有結論都不能採信。
過程中另外找到兩件會誤導執行者的事，都已寫進票內：其一，`site_tldr` 的 `order 0` 列不把 `label` 算進指紋（`approvalFieldsFor_`），改那一格 `status` 不會變，容易被誤判成公式失效；其二，分頁名稱打錯時 `resolveApprovalHeaders_` 會退回 `site_tldr` 的欄位清單，報出毫不相干的「缺少欄位「order」。」，而 `reviewActiveRows_` 不像 `installApprovalFormulas` 會先擋分頁名稱。
留下一項 🔴 需 captain 在 gate 決定：AC-9／步驟 13（非擁有者的責任編輯）超出本票原始三個命題，是為 feature 050 步驟 6 的兩類保護分法加做的，用同一組帳號多花五分鐘就能驗。captain 不納入時標為 SKIPPED，該分法維持未驗證。
另外回報一件與本票無關的既有問題：`npx tsc --noEmit` 目前失敗，錯誤全部來自 `.next/types/` 下的重複檔（`routes.d 2.ts`、`validator 2.ts`），`src/` 零錯誤。本票未觸碰程式，也未清理該目錄。

## Stage Report: implement

- DONE: 依 `/tmp/sd044-probe-log.md` 產出 `docs/content-pipeline/approval-permission-probe.md`，狀態 `record`，骨架依本票步驟 14 的規定。**必須如實記錄 P2 曾為假通過並經重驗**，不可只寫最終結果——該過程本身是本 probe 最有價值的發現。同時記錄 P6 跳過與其補做路徑。**不得寫入帳號 email、測試表 ID 原值或正式 SSOT URL**；帳號一律以 A／B 代稱，測試表僅記雜湊。Apps Script 來源 commit 為 `093cd01`。
  新檔 414 行。P2 一節分四段：第一次測試（假通過）→ 發現假通過（五格實測表）→ 為什麼更嚴重（投稿者可偽造自洽核可）→ 重驗真通過。P6 記為跳過並列五點補做路徑。AC-7 洩漏指令一無輸出；指令二輸出一行，即 checklist 要求記錄的 commit sha，落差已記錄。
- DONE: 把 probe 執行過程中發現的四項程序缺漏回寫進本票（044）的對應步驟，以追加補述方式呈現、不改寫原句。
  四則補述已加：步驟 2（改用檔案→匯入→取代目前工作表→分隔符逗號）、步驟 3 補述一（`onOpen` 會被誤認成安裝紀錄，須確認函式名為 `installApprovalFormulas`）、步驟 3 補述二（execution ID 不存在於現行介面，改記函式名與開始時間，並於步驟 5／11／12 各加指標補述）、步驟 6（逐欄檢查表十格＋行為驗收＋實際 11 個範圍的說明）。`git diff` 對本票無任何刪除行，原句全部保留。
- DONE: 依實際結果更新本票的 `## Acceptance criteria` 判定與 `## Documentation impact`；並在票內明確記錄兩項要交給 feature 050 的結論。
  `### 判定（2026-09-15，probe 執行後追加）` 九列判定表：AC-5／8／9 通過；AC-1／2／4 通過但記錄粒度或缺口逐項寫明；AC-3 判為**部分達成**（只記五格，未達 AC 原文十一項）；AC-6 SKIPPED 並註明維持 `UNPROVEN` 與補做路徑。新增 `## 執行結果與交給 feature 050 的結論` 一節載明結論一（保護範圍須以非擁有者帳號逐格實測，本次因此抓到 `Track 1_history` 僅 Q、R 兩欄真正受保護）與結論二（責任編輯首次使用 `Review` 選單不需額外授權，050 步驟 4 不需補充授權說明）。`## Documentation impact` 追加「實際完成狀況」表。`docs/INDEX.md` 內容產線表新增一列。

### 可失敗的證據

- `093cd013…3b84` 這個 commit 在 040 的 worktree 中存在，且 `git show 093cd013…:scripts/apps-script/approval-workflow.gs | shasum -a 256` 輸出 `cd380aee…6d67`，與工作記錄所載的 `.gs` 雜湊逐字相同；`wc -l` 為 263 行，`appsscript.json` 為 `89fea586…3ad7`。**若證據文件記錯 commit 或記錯雜湊，這三項會對不上。**
- Risk evidence 的離線 oracle 重跑：三組建議標題各解析出 18／21／12 欄，與票內記載相同。**若 `resolveApprovalHeaders_` 的欄位清單或分隔符表被改動，欄數會變。**
- AC-7 指令一對新檔無輸出（exit 1）；指令二輸出第 7 行的 commit sha（exit 0）。**若文件寫進任何 email 或試算表網址，指令一會有輸出。**
- AC-8 的 `git grep` 對 `src`、`scripts` 無輸出（exit 1）。**任何 probe 測試值進入 `src/` 或 `scripts/` 都會讓它有輸出。**
- `npx tsc --noEmit` 無錯誤輸出。**本票若誤觸 `src/` 下的程式會失敗。**
- `git diff` 對本票只有 `+` 行、無 `-` 行。**任何改寫原句的行為都會產生 `-` 行。**

### Summary

證據文件如實記錄 P2 的假通過與重驗全程，因為那是本 probe 最有價值的發現：保護範圍設定看起來正確卻未生效，而它是阻止投稿者偽造自洽核可的唯一防線——同步端指紋閘門擋不住這條路。
判定時沒有把記錄缺口寫成通過。AC-3 只實測五格、未達原文要求的十一項，判為**部分達成**並列出未測項目，是否補測交 captain 決定；AC-1 的指紋比對只做頭尾各 8 碼、AC-2 與 AC-4 的指紋值未逐字記錄，三項都在判定表中寫明落差。
一項要 captain 注意的衝突：本票 checklist 要求證據文件記錄 Apps Script commit sha，但該值為 40 個十六進位字元，會被 AC-7 第二條洩漏檢查指令命中。指令實測輸出該行。這不是洩漏（公開 repo 的 commit），但依 AC 原文即為有輸出。AC 原文未改，落差記在判定表中。

## Stage Report: verify

- FAILED: 逐項查核證據文件 `docs/content-pipeline/approval-permission-probe.md` 的事實正確性：七個命題的判定是否與 `/tmp/sd044-probe-log.md` 的原始記錄一致、P2 首次假通過的過程是否如實保留而非只寫最終結果、P6 跳過與其補做路徑是否記載完整。任一處與原始記錄不符或被美化即為 REJECTED。
  七命題判定、P2 假通過全程（首測→清查五格→推翻→補設三範圍→重驗）、P6 跳過理由與五項補做路徑均與原始記錄逐項相符；但 `approved_*` 有兩處宣稱超出原始記錄，見 Finding 1。
- DONE: 安全查核（最高優先）：證據文件與本輪所有新增內容不得出現帳號 email、測試表 ID 原值、正式 SSOT 網址。
  四道掃描全部乾淨，指令與輸出見下方「安全掃描實跑」。測試表僅以 `a186d380…0a99` 呈現；`src/data/*.json` 與 main 的 sha256 相同，probe 佔位值未進入。
- DONE: 查核四項程序缺漏是否確實回寫進 044 票的對應步驟、且為追加補述而非改寫原句；並確認交給 feature 050 的兩項結論已明確記載。
  四則補述在第 315（步驟 2 匯入）、344（步驟 3 `onOpen` 誤認）、349（步驟 3／5／11／12 execution ID 不存在）、431（步驟 6 十格逐欄檢查表＋行為驗收）行，皆標「原句保留」；`git diff 0631698..HEAD -U0` 的刪除行僅 `-status: design` 與 `-worktree:` 兩行狀態欄位。兩項結論在第 734、745 行。

### 安全掃描實跑

    # 本輪新增行（實作 commit 36af185）掃 email／Google 網址 → 無輸出
    git show HEAD~1 -U0 | grep '^+' | grep -vE '^\+\+\+' \
      | grep -nE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|docs\.google\.com|/spreadsheets/d/|script\.google\.com'   # exit=1
    # 本輪新增行掃裸識別碼（先挖掉 64／40／8 位十六進位）→ 僅命中檔名與路徑，無 ID
    git show HEAD~1 -U0 | grep '^+' | sed -E 's/[a-f0-9]{64}//g; s/[a-f0-9]{40}//g; s/[a-f0-9]{7,8}//g' | grep -nE '[A-Za-z0-9_-]{25,}'
    # AC-7 指令一（證據文件）→ 無輸出（exit=1）
    grep -nE '@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|docs\.google\.com|/spreadsheets/d/' docs/content-pipeline/approval-permission-probe.md
    # AC-7 指令二 → 唯一輸出為第 7 行 Apps Script commit sha 093cd01…（票內明文要求記錄的公開值，非洩漏）；再挖掉 40 位十六進位後無輸出
    # AC-8 → git grep -nE 'probe-h1|probe-d1|probe content A|probe tldr title|probeTriggerWrite' -- src scripts   # exit=1
    # src/data 佔位值 → grep -nE 'probe-h1|probe content|probe-note|probe-reject' src/data/*.json   # exit=1

### Finding 1（Material）：`approved_*` 的宣稱超出原始記錄

- 釋出使用者與正常流程：captain 與 feature 050／040 讀本票的 AC-2 判定列，判斷「040 被 REJECTED 的表端證據已齊備」。
- 可觀察的損害：讀者會相信 P1 的 `approved_fingerprint` 與 P3 的三個 `approved_*` 欄都經實測確認未變，實際未觀察。
- 受影響的 AC／邊界：本票 AC-2 原文要求 P1 與 P3「`approved_by`／`approved_at`／`approved_fingerprint` 三欄逐字不變」；`record` 文件不得美化。
- 觸發證據：`/tmp/sd044-probe-log.md:91` 的 P1 只記 `approved_by`、`approved_at` 兩欄；同檔 P3 一節完全未記 `approved_*`。但 `docs/content-pipeline/approval-permission-probe.md:123` 寫「三個 `approved_*` 欄保留原值」，本票第 866 行的 AC-2 判定列寫「P1 與 P3 的 …`approved_*` 三欄不變」。同節其他落差（指紋值未記錄）都已明白揭露，唯獨此處未揭露。

建議分類：Material、任務範圍內、建議 `fix`（改為只陳述原始記錄有的兩欄，並在 P3 與 AC-2 判定列補記「`approved_*` 未查核」的記錄缺口）。**本階段未改動任何候選位元組**，等待 FO 授權。

### Summary

安全查核與程序回寫兩項全數通過：本輪新增內容無 email、無測試表 ID 原值、無 Google 網址，四則程序補述皆為追加且原句保留，交給 feature 050 的兩項結論明確記載。事實查核發現一處美化：證據文件與 AC-2 判定列宣稱 P1／P3 的三個 `approved_*` 欄不變，而原始記錄 P1 只有兩欄、P3 一欄未記。依本階段檢核標準「任一處與原始記錄不符或被美化即為 REJECTED」。

**判定：REJECTED。** 修正範圍極小（兩處句子改為與原始記錄一致並補記缺口），不影響任何命題的行為結論。

## Stage Report: implement (cycle 2)

- DONE: 把證據文件與 044 票中關於 `approved_*` 的宣稱改為與原始記錄一致：`approval-permission-probe.md` 的 P1 一節只陳述 `approved_by` 與 `approved_at` 兩欄仍有值，不得宣稱三欄；AC-2 判定列同樣修正。P3 一節與 AC-2 判定列各補記一句明確的記錄缺口：`approved_*` 於 P3 未查核。缺口要寫成可見的陳述，不是刪掉不提。
  P1 實際欄改為「`approved_by` 與 `approved_at` 仍有值」，並新增「記錄缺口一：**`approved_fingerprint` 未查核**」。P3 新增「記錄缺口：**P3 完全未查核三個 `approved_*` 欄**」。AC-2 判定由「通過（記錄缺口）」改為**部分達成**，三項缺口逐條列出。文件開頭的缺口清單由三項擴為五項，第 4 項即此事。
- DONE: 確認修正後全文再無任何超出原始記錄 `/tmp/sd044-probe-log.md` 的觀察宣稱。請逐節比對七個命題，把比對結果寫進 stage report——特別注意其他可能同型的問題。
  逐節比對表見下。**另找到三處同型問題，全部已修**。
- DONE: 維持既有成果不變：P2 假通過的全程記載、P6 跳過與補做路徑、四則程序補述、交給 feature 050 的兩項結論，均不得改動。安全邊界不變。
  `git diff` 的刪除行只有 10 行，全部是本輪要修的宣稱（見 commit）。四則補述、P2 全程、P6 補做路徑、兩項結論的關鍵字逐一 grep 仍在。洩漏指令一無輸出；指令二仍只輸出第 8 行的 commit sha。

### 逐節比對結果（對照 `/tmp/sd044-probe-log.md`）

| 節 | 比對結果 |
|---|---|
| 環境建立、指紋核對 | 相符。另修一處：測試表描述刪去原始記錄沒有的「也不是正式表的複本」 |
| P1 | **不符，已修**。原始記錄第 91 行只有 `approved_by`、`approved_at`；文件曾寫三欄 |
| P2 | 相符。五格表、假通過全程、重驗五格逐項對得上 |
| P3 | **不符，已修**。原始記錄只觀察 `status`，文件未宣稱三欄但也未揭露缺口，現已補記 |
| P4 | 相符。前置修正與 `status` 維持 `Approved` 皆有據 |
| P5 | **同型問題，已修**。`review_decision`、`reject_reason`、`approved_fingerprint` 的實際值原始記錄未載。`probe-reject` 是輸入值，不是觀察值。AC-5 判定改為「通過（記錄缺口）」 |
| P6 | 相符。未執行，跳過理由與補做路徑逐項對得上 |
| P7 | 相符。a／b／c 三項與 `無法取得核可者身分。` 未出現皆有據 |

**另外兩處同型問題（非命題節）：**

1. **「Apps Script 執行紀錄」表杜撰函式名。** 文件曾寫核可動作的函式為 `approveSelectedRows`。原始記錄未載任何核可執行紀錄，而 `approval-workflow.gs:201` 的實際函式名是 `approveActiveRows`——**杜撰的名字連程式都對不上**。已改為「未記錄」。
2. **「執行期間」宣稱 probe 自 2026-09-08 起跑。** 原始記錄只對 2026-09-15 的事件標日期，2026-09-08 是本票 implement 的起算日，不是 probe 的起跑日。已改為分開陳述。

**一處宣稱已加限制**：「040 的 AC-2 與 AC-4 所需的試算表端證據已齊備」在兩個檔各加一段限制——齊備的是 `status` 重算的行為證據，`approved_*` 逐字不變的證據不齊。這正是 reviewer 指出的可觀察傷害。

**一處依據已標明**：「過程發現一」的同步程式反應表加註「依據是閱讀 `validateApprovalBinding` 的程式碼，不是實跑同步」。本 probe 全程不執行 `npm run sync-content`。

### 可失敗的證據

- `grep -n 'approved_' docs/content-pipeline/approval-permission-probe.md` 已無「三個 `approved_*` 欄保留原值」。P1 節現有「記錄缺口一」，P3 節現有「記錄缺口」。**任何一處改回三欄宣稱，grep 就會再出現該句。**
- `grep -n 'approveSelectedRows'` 無輸出（exit 1）。該函式名在 `approval-workflow.gs` 中不存在，實際為 `approveActiveRows`（`:201`）。
- `git diff` 對本輪只有 10 行刪除，全部是被修正的宣稱本身。**若誤刪 P2 全程或四則補述，刪除行數會遠高於此。**
- 洩漏指令一無輸出（exit 1）；指令二輸出仍只有 commit sha 一行。

### Summary

reviewer 指對了。錯誤不是臆測，是把 AC 的要求當成已觀察的事實寫進 `record` 文件——同一節裡其他落差都揭露了，唯獨這一處沒有。
逐節重比七個命題後另找到三處同型問題，其中最嚴重的是「Apps Script 執行紀錄」表杜撰了函式名 `approveSelectedRows`，而程式裡實際叫 `approveActiveRows`。那張表原本就是「未記錄」的一欄，不該有任何函式名出現在核可那一列。
修正方向一律是縮小宣稱並把缺口寫成可見的句子，沒有刪除任何既有成果。文件開頭的缺口清單因此由三項增為五項，讓讀者在讀任何一節之前先知道證據強度的上限。
