---
id: 037
title: 改寫內容同步程式：嚴格把關、失敗中止、支援 site_tldr
status: verify
source: design.md 第五節施工項目 7-8
started: 2026-09-02T17:05:11Z
completed:
verdict:
score: 1.0
worktree: .worktrees/spacedock-ensign-037-sync-rewrite-strict-validation
issue:
pr:
mod-block:
---

改寫 `scripts/sync-content.mjs`，並把同步從 `npm run build` 中移除。這是內容產線改造的核心工程，對應 `../content-pipeline/design.md` 第五節的施工項目 7 與 8。

## Problem

現行同步程式有四個缺陷，是 2026-08 三次內容事故的直接成因：

1. **部署會自動執行同步** —— `package.json` 的 `build` 是 `node scripts/sync-content.mjs && next build`。任何人推程式碼觸發部署，就會重抓試算表覆蓋資料，無人看過 diff。
2. **歷史軌等於沒有把關** —— 過濾條件為 `!row.status || approved`，`status` 空白也放行。15 筆欄位錯位資料因此上線。
3. **系統從未拒絕過任何資料** —— 遇到問題只印警告後繼續寫入。
4. **不認識 `site_tldr` 分頁** —— 該分頁的內容到不了網站，且 `OfficialTLDR` 的 `if (!item) return null` 會讓區塊無聲消失。

完整診斷見 `../health-check/2026-08-31-content-pipeline.md` 的第二次補述。

## Proposed approach

依 `../content-pipeline/design.md` 改寫，不另行設計。該文件已定案，本票不重複記載規格。

實作範圍：
- 來源改指 `SSOT_收集區`（單一真相），新增 `SITE_TLDR_CSV_URL`
- 欄位標題以最長前綴比對解析（保留中文註解），解析不出來即中止並指名
- 兩軌過濾統一為嚴格模式：只收 `status = Approved`
- 加入第四節的檢查規則，**驗證失敗即中止，不寫入任何檔案**（全有全無）
- 讀取 `site_tldr` 並組回 `id: 'tldr'` 記錄
- 自 `package.json` 的 `build` 移除同步

**拒絕的替代方案**：只修過濾條件、不做整體改寫。理由 —— 缺陷 1、3、4 不會被修好，而它們各自都足以再造成一次事故。

## Risk evidence

最高風險是「改完之後跑第一次同步，把搶救回來的內容再蓋掉一次」。前兩次事故都是這樣發生的。

已於 2026-09-01 用**現行程式裡真正的 `parseCSV`**（非等價重寫）對 `site_tldr` 的發布 CSV 實測：正確讀出 5 欄 4 列；依還原規則組出的記錄，`title`／`link`／`abstract` 與現行 `discussions.json` 逐字相同。標題解析規則對 22 個真實標題與 6 種變形皆正確，對真實錯字正確中止。

剩餘未驗證：Track 1／Track 2 的完整同步結果尚未與現況比對過。此為 AC-6 的內容。

## Expected surface and tolerance

Estimate: +200 淨行，跨 2 個檔案（`scripts/sync-content.mjs`、`package.json`），tolerance ±40%。
Semantics this may change: 同步的觸發時機（部署時自動 → 人工執行）、資料寫入條件（寬鬆 → 嚴格且全有全無）、環境變數新增 `SITE_TLDR_CSV_URL`。

## Acceptance criteria

**AC-1 — 部署不會執行同步。**
Verified by: `grep '"build"' package.json` 的輸出不含 `sync-content`；且執行 `npm run build` 前後，`src/data/history.json` 與 `discussions.json` 的 sha256 相同。
會使其失敗的改動：把 `sync-content.mjs` 加回 `build` 指令。

**AC-2 — 資料有問題時整份中止，不寫入任何檔案。**
Verified by: 以一份刻意植入錯誤的 CSV（`year` 非四位數 + `abstract` 含 `test test`）執行同步，退出碼非 0，錯誤訊息指名是哪幾筆哪一欄，且兩個 json 的 sha256 與執行前相同。
會使其失敗的改動：把中止改回印警告後繼續，或改成跳過壞的列只寫好的列。

**AC-3 — 只收 `status = Approved`，空白不算通過。**
Verified by: `h2` 在 `SSOT_收集區` 的 `status` 為空白；同步後 `history.json` 不含 `id: "h2"`。
會使其失敗的改動：把過濾條件放寬回 `!row.status || approved`。

**AC-4 — `site_tldr` 分頁的內容到得了網站。**
Verified by: 同步後 `discussions.json` 存在 `id: 'tldr'` 的記錄，其 `title`／`link`／`abstract` 與 commit `bf491df` 當時的值逐字相同。
會使其失敗的改動：不讀該分頁，或改動 `id` 值，或改動換行組裝規則。

**AC-5 — 欄位標題含中文註解仍能正確解析，無法解析時中止並指名。**
Verified by: 以現行含註解的真實標題執行，所有欄位取得非空值（`owl comment` 未被誤判為 `owl`）；再將任一標題改為錯字（如 `ruling_di`）後執行，退出碼非 0 且錯誤訊息指出該標題。
會使其失敗的改動：改回標題字串精確比對。

**AC-6 — 改造後的第一次同步不會使現有內容倒退。**
Verified by: 同步前後對 `history.json` 與 `discussions.json` 做逐筆比對，產出差異清單；清單中每一項差異都能對應到 `SSOT_收集區` 的實際儲存格內容。特別確認未遺失：`d7`／`d8`／`d9` 的摘要與 owl 短評、`tldr` 的三重點、`h15`–`h29` 的正確欄位值。
會使其失敗的改動：任何導致上述內容消失或變回佔位值的實作錯誤。

## Test plan

- **不得執行 `npm run build` 以外的驗證方式**：型別用 `npx tsc --noEmit`，畫面用 `npm run dev`。AC-1 的 `npm run build` 驗證須在該項改完之後才執行。
- AC-2 與 AC-5 需要刻意植入錯誤的 CSV 樣本，置於工作區暫存，不進版控。
- AC-6 的比對在 `verify` 階段執行，以真實試算表為輸入。
- 產線目前刻意斷開（Vercel 環境變數已停用）。**在 AC-6 通過並經 captain 於 PR 上確認 diff 之前，不要恢復那些環境變數。**

### Feedback Cycles

- Cycle 1: REJECTED — verify；surface 2 檔／+549 淨行 vs estimate +200 ±40%（274%，超出上限 269 行）；AC unchanged。F1 route for decision（captain，來源網址指向 SSOT_Editor 而非 SSOT_收集區，AC-6 因此無法查核）；F2 fix（id 跨分頁重複，違反 AC-4 與不變式 #4）；F3 fix（核可 0 筆時靜默清空，違反 AC-6）。F2／F3 已修並經反向驗證；F3 將一條僅寫給 site_tldr 的規則一致化至兩軌，待 captain 於 gate 確認是否寫入 design.md。

## Out of scope

- 施工項目 9（跑完整同步、開 PR 對 diff、合併）—— 那是本票的交付動作，不是另一項工程
- 施工項目 10（封存 `SSOT_Editor`）—— 人工，合併後才做
- 試算表的 `status` 保護範圍設定 —— 需先有協作者，見 `../health-check/TODO.md` 的 P3-1
- `approved_by`／`approved_at`／`reject_reason` 三個欄位尚未在試算表建立，本票不處理

## Stage Report: implement

- DONE: 同步程式在資料違反檢查規則時整份中止，不寫入任何檔案，且錯誤訊息指名到具體欄位
  植入 `year` 非四位數 + `abstract` 含 `test test` 的 CSV：退出碼 1，輸出逐字為 design.md
  第四節的範例格式（`h4 year 應為 4 位數字，實際為「憲法第十四條…」`／`d7 abstract 含有測試
  字串「test test」`），兩個 json 的 sha256 與執行前相同。把中止改回「印警告後繼續」或
  「跳過壞的列」，sha256 比對這一項就會失敗。commit `197436e`。
- DONE: npm run build 不再執行同步；執行前後 src/data/*.json 的 sha256 相同
  `build` 改為 `next build`。實跑 `npm run build`（exit 0，16 頁全數產出），前後
  sha256 皆為 `ae72f302…`／`d6b7c5be…`，`diff` 無輸出。把 `sync-content.mjs` 加回 build
  會使這一項失敗。
- DONE: site_tldr 分頁讀取並還原為 id 'tldr' 的記錄
  以 `bf491df` 的 tldr 反推 CSV 再跑一次同步，產出的記錄與 `bf491df` **整筆** JSON 逐字
  相同（含 `title`／`link`／`abstract`）。改動 `id` 值或換行組裝規則會使它失敗。
  另測 `order 0` 的 `status` 空白時中止並指名 —— design.md 第二節警告的失效路徑。
- DONE: 現有內容（d7/d8/d9 摘要與短評、tldr 三重點、h15-h29 欄位）未倒退
  僅完成可在本階段驗證的部分：`owl comment (允鍾…)` 正確解析為 `owl_comment`（值逐字相同，
  若最長前綴比對壞掉會變成空字串）；`tldr` 三重點如上。**與真實試算表的逐筆比對是 AC-6，
  依本票 Test plan 於 verify 階段執行。本階段沒有 `.env.local`，跑不到真實資料。**

### Summary

改寫 `scripts/sync-content.mjs`（180 → 679 行）並把同步移出 `build`。四個缺陷全部處理：
部署不再自動同步、兩軌統一只收 `Approved`、加入第四節的檢查規則且失敗即整份中止、
支援 `site_tldr`。`parseCSV` 的掃描迴圈維持原樣，只把「組成物件」那段拆出來 —— design.md
第二節的實測是用這個迴圈跑的。驗證程式在
`/private/tmp/claude-501/-Users-ipa-Documents-ipa-Document-00-Claude-spacedock-folder/dfe33f00-9190-4f9d-8044-b332a2106079/scratchpad/sync-harness.mjs`
（依 Test plan 不進版控），50 項檢查全數通過。`npx tsc --noEmit` 通過；`npm run lint` 的
4 error 6 warning 全在 `src/components/`，改動前即存在，`scripts/` 不在 lint 範圍。

**超出宣告範圍，需要裁量。** 估計 +200 淨行、tolerance ±40%（上限 +280），實際 +498
（`596 insertions / 98 deletions`，仍是宣告的 2 個檔案）。組成：欄位定義表 44 行、
註解 134 行、其餘為第四節的 15 條檢查規則與標題解析器。要壓回 280 行，只能砍檢查或砍註解。

**五項判斷，寫在這裡讓 gate 看得到。** 前三項會影響 verify 跑真實試算表的結果：
1. 必填欄位的**值**檢查只對 `status = Approved` 的列執行。試算表是寫作者的工作區，
   對草稿列套必填檢查等於任何人存檔到一半就擋住整份發布。`status` 的**值**檢查則對所有列
   執行（`Approve` 這類錯字會讓一列被靜默丟掉，那正是要擋的東西）。
2. `vibe` 允許清單取自現有 `discussions.json` 的 9 個值。design.md 第七節記載最終清單
   未定。試算表若出現第 10 個值，同步會中止並指名 —— 刻意的，但 verify 可能因此需要改一行常數。
3. `site_tldr` 的 `label` 只對 `order ≥ 1` 要求非空。`order 0` 的 `label` 不會被讀取，
   第四節的檢查清單也未列它。第二節的欄位表標為必填，此處從第四節。
4. 佔位字串檢查從第四節的 `abstract` 擴及 `title`／`author`／`owl_comment`
   （`某學者，某大學法律系` 當初就是掛在作者位置上線的）。不收單獨的 `test`：
   latest、protest 都含有它。
5. 標題空白且**整欄無資料**的欄位忽略不報錯（試算表末端常留空欄，它沒承載內容）；
   標題空白但欄內有資料則中止。

**沒做、且是刻意的**：`AGENTS.md` 的「不要執行 build」禁令未解除。它的解除條件寫的是施工
項目 7 與 8，但真正安全的時點是項目 9（跑完整同步、captain 對過 diff、合併）之後 ——
在那之前 `main` 上的 `build` 仍會跑 sync。建議合併時一併改。

## Stage Report: verify

- FAILED: 以真實試算表執行完整同步，逐筆比對同步前後的 history.json 與 discussions.json，確認 d7/d8/d9 的摘要與 owl 短評、tldr 三重點、h15-h29 欄位值均未遺失或倒退（本票 AC-6）
  依 Test plan 以真實試算表實跑 `npm run sync-content`：exit 1、10 項錯誤、未寫入任何檔案
  （兩個 json 的 sha256 仍為 `ae72f302…`／`d6b7c5be…`，`git status` 乾淨）。中止是對的 ——
  逐欄比對顯示來源會使內容大幅倒退：h15–h29 共 15 筆、每筆 7 個欄位全部錯位（h15 的 `year`
  是一整段條文、`ruling_id` 空白）；d7/d8/d9 的 `abstract` 會變成佔位句、owl 短評會變成同一句
  罐頭、`vibe` 會全變 `💡 腦袋升級`。**但 AC-6 要求的「同步後檔案」不存在，AC-6 無法查核。**
- FAILED: 確認 h2 的 status 在試算表中為空白，且同步後的 history.json 不含 h2（本票 AC-3）
  `TRACK_1_CSV_URL` 指到的分頁沒有 `status` 欄（標題列為 id,category,chapter,content,
  handwriting,year,title,ruling,ruling_id,image_url），同步報「缺少必要欄位「status」」而中止。
  AC-3 的前提不成立。機制另以 fixture 實測通過：`status` 空白的 h2 被排除，history 只剩 h1,h3；
  把過濾放寬回 `!row.status || approved` 會使這一項失敗。
- DONE: 對產出的資料執行佔位資料掃描：不得含有 某學者、某大學法律系、test test、lorem ipsum、快速了解最新判決的5個重點
  同步無產出，改掃兩處。現行 `src/data/*.json`：5 個字串全部 0 命中。來源分頁：7 命中 ——
  d2/d4/d6/d7/d8/d9 的 `abstract` 是「快速了解最新判決的5個重點」，Track 2 的 `tldr` 列含
  「test test」。程式全數擋下，見上述 10 項錯誤。
- DONE: 逐項判讀 implement 階段報告中列出的五項判斷，指出哪些會影響真實試算表的同步結果，以及是否需要 captain 裁示
  判斷 1（必填值只查已核可列）會影響：實跑中 d3（整列空白）未產生任何必填錯誤，判斷正確。
  判斷 2（vibe 允許清單）會影響：實跑中 16 筆已核可列全部通過，**不需改常數**。
  判斷 4（佔位檢查擴及 title/author/owl_comment）會影響，但本次 7 個命中全在 `abstract`，
  結果不變；擴大是保護性的。判斷 3、5 不影響：真實 site_tldr 的 `order 0` label 非空，
  三個分頁 10／12／5 欄全部具名，無空白標題。**五項都不需 captain 裁示。**

### Summary

同步程式的把關與「全有全無」在真實資料上成立：實跑 exit 1、10 項錯誤指名到列與欄、一個檔案都沒寫。
但驗證另外發現三項問題，其中兩項是本票檔案內的缺陷。**判定 REJECTED。**

**F1（需 captain 裁示）—— 來源網址指向錯誤的試算表。** `TRACK_1_CSV_URL`／`TRACK_2_CSV_URL`
的值與 `main` 的 `.env.local` 逐字相同、2026-03-15 後未動過，且與 `SITE_TLDR_CSV_URL` 屬於
**不同的試算表文件**（發布金鑰不同）。抓到的 Track 1 有 25 列、無 `status` 欄、h15–h29 共 15 列
錯位；Track 2 有 17 列 —— 正是 `design.md` 第一節列的 `SSOT_Editor`（25／17／錯位 15 筆），
而非 `SSOT_收集區`（42／44／無錯位）。h2 的 `ruling_id` 仍是 `釋字第 272 號`，也符合該表所記
「Editor 仍是錯的」。施工項目 3、1 標為已完成，但那些人工修正不在這個網址上。這不是程式缺陷，
是 `.env.local` 與分頁發布狀態的問題，本票無法自行決定改指哪一份，需 captain 處理。

**F2（本票可修）—— `discussions.json` 會出現兩筆 `id: 'tldr'`。** Track 2 分頁仍留著 `tldr` 那一列。
編輯台若把它的測試字串改掉（而不是刪掉整列），同步就會通過，並在 Track 2 的 tldr 之後再接上
site_tldr 組出的 tldr。sandbox 實跑：exit 0、`discussions.json` 含 2 筆 `id: 'tldr'`，
`present/page.tsx:392` 的 `find(item => item.id === 'tldr')` 取到 Track 2 那筆舊版，
site_tldr 分頁的內容被靜默忽略。這直接違反 AC-4 與 design.md 不變式 #4。

**F3（本票可修）—— 核可筆數為 0 時靜默清空。** Track 1 補上 `status` 欄但尚未核可任何列時
（施工項目 4 的保護範圍還是 ⏸，這是很可能的中間狀態），sandbox 實跑得到
「✅ 檢查通過，已寫入 src/data/history.json（0 筆）」、exit 0、檔案內容為 `[]`。
兩軌同時空白時 25 筆歷史與 16 筆討論全數消失，而程式回報成功。design.md 第四節替 site_tldr
寫了「order ≥ 1 至少要有一列通過核可」，Track 1／Track 2 沒有對應的防線。

未改動任何候選檔案；`scripts/sync-content.mjs` 與 `package.json` 維持 `197436e` 的內容。
驗證用的 fixture 與比對程式放在 scratchpad，依 Test plan 不進版控。

## Stage Report: implement (cycle 1)

- DONE: F2 修正：同步產出的 discussions.json 不得出現重複 id；Track 2 來源列與 site_tldr 組出的記錄發生 id 衝突時中止並指名兩個來源分頁，不得靜默取其一
  新增 `checkMergedDiscussionIds`，在兩軌都通過、寫檔之前比對合併後的 id。
  Fixture：Track 2 放一列 id 為 `tldr` 且**其餘欄位完全合法**的列（year／vibe 都有值，
  才隔離出 id 衝突本身；真實試算表的舊列 year／vibe 是空的，會先被必填檢查擋下）。
  結果：退出碼 1，訊息為
  `tldr  id 在兩個分頁各出現一次：Track 2_discussion 有一列 id 為「tldr」，site_tldr 也組出同一個 id。…請刪掉 Track 2_discussion 裡 id 為「tldr」的那一列`，
  兩個 json 的 sha256 皆未變。
  改成「後者覆蓋前者」或「先到先贏」會使這項證明失效 —— 退出碼會變回 0。
- DONE: F3 修正：某一軌來源有資料列但核可後為 0 筆時中止並指名該軌，不得寫出空檔案
  新增 `checkNotEmptyAfterApproval`，Track 1 與 Track 2 各呼叫一次。
  Fixture：Track 1 只放一列 `status` 空白的資料（就是 status 欄剛建好、尚未核可的狀態）。
  結果：退出碼 1，訊息為 `Track 1  內容  有 1 列資料，但沒有任何一列的 status 是 Approved。…`，
  `history.json` 的 sha256 未變、內容不是 `[]`，且 stdout 不含「已寫入」。Track 2 同樣測過。
  把這道檢查拿掉會使證明失效 —— 會變回 exit 0 且寫出 `[]`。

### 修正前的反向驗證

把 harness 指向修正前的 commit `197436e` 重跑，上述 14 個測項全數 FAIL，
且重現 verify 的觀察逐字相同：F2 得到 `exit 0`、`discussions.json（3 筆，含 tldr）`；
F3 得到 `exit 0`、`✅ 檢查通過，已寫入 src/data/history.json（0 筆）`。
測項不是套套邏輯 —— 它們在缺陷存在時真的會失敗。

### ⚠️ 需要 captain 在 gate 上裁示：F3 把一條規則一致化了

「來源有資料列但核可後為 0 筆就中止」這條規則，`design.md` 第四節**只寫給 `site_tldr`**
（「`order ≥ 1` 至少要有一列通過核可」），**沒有寫給 Track 1 與 Track 2**。
本次依 FO 指派把同一條防線套到兩軌。這是設計文件目前沒有的規則。
請 captain 確認是否同意把它寫進 `design.md` 第四節。

### Summary

依 FO 授權處置修正 F2 與 F3，兩項皆為 Material。F1 未動（FO 授權 route for decision，
不在本輪範圍）。改動只在 `scripts/sync-content.mjs`，`+51` 行，未動其他檔案。
`npx tsc --noEmit` 通過。Harness 全數 50 + 14 = 64 項測項通過，路徑同前一份報告。
本輪未執行 `npm run build`，未碰真實試算表，未動 `src/data/*.json`。
重驗由 verify 執行，本報告不主張 gate 結果。commit `c3249e0`。

## Stage Report: verify (cycle 2)

- DONE: 複驗 F2：確認 Track 2 來源列與 site_tldr 組出的記錄發生 id 衝突時中止並指名兩個來源分頁，且不寫出任何檔案
  以真實 Track 2（只把佔位字串換成正常文字、保留 `tldr` 那一列）＋真實 site_tldr 實跑：exit 1、
  1 項錯誤，訊息同時指名 `Track 2_discussion` 與 `site_tldr`，並指出該刪哪一列；兩個 json 的
  sha256 未變。把 `checkMergedDiscussionIds` 拿掉會使這一項失敗（cycle 1 前實跑為 exit 0、
  產出 2 筆 `id: 'tldr'`）。
- DONE: 複驗 F3：確認某一軌來源有資料列但核可後為 0 筆時中止並指名該軌，不寫出空檔案
  兩軌各測一次。Track 1 全部 status 空白：exit 1、「Track 1 有 3 列資料，但沒有任何一列的 status
  是 Approved」。Track 2 全部空白：exit 1、「Track 2 有 16 列資料…」。兩次檔案皆未變。
  cycle 1 前同樣輸入是 exit 0、寫出 `[]` 並回報「✅ 已寫入（0 筆）」。
- DONE: 確認 cycle 1 的修正未破壞先前已通過的行為：把關、全有全無、site_tldr 還原、標題解析仍如前一輪報告所述
  正常路徑實跑 exit 0：`history.json` 為 h1,h3（AC-3 —— status 空白的 h2 被排除）；
  `discussions.json` 只有 1 筆 `id: 'tldr'`，且與現行檔案裡的 tldr 整筆 JSON 逐字相同（AC-4）；
  `owl comment (允鍾…)` 仍正確解析為 `owl_comment`（AC-5 正向）；產出 0 個佔位字串命中。
  AC-2 實跑（`year` 非四位數 ＋ `abstract` 含 `test test`）exit 1、指名 h4／d1、檔案未變。
  AC-5 反向實跑（標題打成 `ruling_di`）exit 1、指名第 9 欄。AC-1：`build` 仍為 `next build`。
  真實試算表複跑：exit 1、**與 cycle 1 前完全相同的 10 項錯誤**、檔案未變 —— 新增的兩道檢查
  沒有在真實資料上產生偽陽性。`npx tsc --noEmit` 通過，`git status` 乾淨。
- DONE: 判定本輪 verdict，並說明 F1 未解除的情況下 AC-6 仍無法查核這件事對 gate 的意義
  見下方 Summary。判定 **PASSED（附條件）**，F1 與 AC-6 送交 captain 裁示。

### Summary

cycle 1 的兩項修正都成立，且都以「改前會失敗、改後會通過」的方式實測過，不是只讀程式碼確認。
先前已通過的行為全部保持，真實試算表的錯誤清單一字未變，代表新增的檢查沒有誤傷正常資料。
本票檔案內我找得到的缺陷已經沒有了。

**F1 未解除，AC-6 仍無法查核。** `TRACK_1_CSV_URL`／`TRACK_2_CSV_URL` 仍指向 `SSOT_Editor`
（25 列／17 列／h15–h29 錯位 15 筆），不是 `SSOT_收集區`（42 列／44 列／無錯位）。
同步因此在「缺少必要欄位 status」中止，產不出可比對的檔案，AC-6 的「同步前後逐筆比對」
無從執行。這不是程式缺陷 —— 改 `.env.local` 與發布 `SSOT_收集區` 的三個分頁是人工動作，
本票無法自行決定改指哪一份。

**這對 gate 的意義：再退回 implement 不會有進展。** implement 能做的都做完了，F1 只有 captain
能解。依 review-finding disposition，超出本票範圍的 Material 應維持原狀並列為 Needs decision，
而且只有 captain 能更動驗收標準。因此我建議 gate 以 PASSED 通過程式碼，同時把兩件事寫進
決議：(1) AC-6 尚未查核，狀態是「未驗證」，不是「通過」；(2) AC-6 的查核要等 captain 把來源
改指 `SSOT_收集區` 之後，在施工項目 9（跑完整同步、開 PR、對 diff）當場做 —— 本票的
Out of scope 已經把項目 9 定為交付動作。在那次比對通過前，不要恢復 Vercel 的環境變數。

**一項 Polish，不影響本輪判定。** `checkMergedDiscussionIds` 由 `if (errors.length === 0)`
守著，所以有別的錯誤時 id 衝突不會一起報出來。實測：`year` 錯誤 ＋ id 衝突同時存在時，
只報 year 那一項。編輯要改兩輪才看得到第二個問題，與程式自己寫的「一次蒐集所有錯誤再一起
回報」不一致。改法是改成 `if (discussions !== null && tldr !== null)`。內容不會因此遺失，
衝突仍然擋在寫入之前，故不列為退回理由。

本輪未改動任何候選檔案；`scripts/sync-content.mjs` 維持 `c3249e0` 的內容。

## Stage Report: verify (cycle 3)

- DONE: AC-6：以已改指 SSOT_收集區 的來源執行完整同步，逐筆比對同步前後的 history.json 與 discussions.json，產出完整差異清單；每一項差異都要能對應到試算表的實際儲存格內容
  三個網址已同屬一份試算表（發布金鑰相同）。實跑 exit 0，寫出 history 41 筆、discussions 16 筆。
  `history.json`：25 → 41 筆。新增 h30–h46 共 17 筆；h2 消失（試算表 `status` 為空白）；
  共存 24 筆中 14 筆完全相同、10 筆有變動。`discussions.json`：16 → 16 筆，無新增無消失，
  `id: 'tldr'` 仍是 1 筆。**每一項差異都逐一比對過對應儲存格，41 筆全部對得上，0 項對不上。**
  變動的三類：`chapter` 全部清空（收集區沒有這一欄）、6 筆 `content`／`ruling`／`title` 是上游
  訂正（h7「保義自由」→「宗教自由」、h28 補上原本空白的 title）、10 筆 `vibe`／`owl_comment`
  改用試算表版（commit `bf491df` 已決定短評採試算表版）。
- DONE: AC-6 指名確認未遺失：d7/d8/d9 的 abstract 與 owl 短評、tldr 的三重點、h15-h29 的正確欄位值（year 為四位數、ruling_id 非空）
  d7／d8／d9 的 `abstract` 與 `owl_comment` 六個值全部逐字相同。`tldr` 整筆 JSON 逐字相同，
  三重點仍是三行（權限界線／權力分立／下一步）。h15–h29 十五筆全部正確：`year` 皆為四位數、
  `ruling_id` 皆非空（h15 = 1998／釋字第445號，cycle 0 時的 SSOT_Editor 是一整段條文＋空白）。
  產出的佔位資料掃描：五個字串 0 命中。`npx tsc --noEmit` 對新資料通過。
- DONE: 標題含換行的解析：收集區的欄位標題把中文說明放在儲存格內第二行（例如 id 換行 (給系統看的編號)、status 換行 （權限保護）），確認六個這類欄位全部解析到正確欄位且取得非空值
  **證實可用，不是推測。** 原始 CSV 的儲存格確實含換行（`"id\n(給系統看的編號)"`）。
  Track 1 六個換行標題 —— `id`／`content`／`handwriting`／`title`／`image_url`／`status` ——
  全部解析到正確欄位；Track 2 的 `owl comment\n(允鍾如果有靈感可以寫一句短評)` 也正確解析為
  `owl_comment`，且沒有被誤判成 `owl`。取值證據：`id`／`content`／`title` 皆 41/41 非空，
  `status` 讀到 41/42 為 Approved，`owl_comment` 15/15 非空；`handwriting` 40/41、
  `image_url` 8/41（兩欄選填，儲存格本身就稀疏 —— 若標題沒解析成功會是 0/41）。
  機制是 `sync-content.mjs:282` 的 `.replace(/\s+/g, ' ')` 先把換行併成空白，再由第 39 行的
  分隔符集合接手，`\n` 從來不需要自己是分隔符。
- SKIPPED: 若同步中止，逐項列出錯誤並判斷各屬「來源資料需人工修正」或「程式缺陷」，不要自行修改來源或程式
  同步沒有中止（exit 0），此項的前提未發生。改以同一標準判讀 diff 中的內容問題，見下方。
  未修改試算表、`.env.local`、`scripts/sync-content.mjs`、`package.json`；Vercel 環境變數未動。

### Summary

**AC-6 通過（程式面）。** 41 筆差異全部對得上儲存格，沒有任何一項差異是程式造成的。
cycle 0 最擔心的事沒有發生：h15–h29 不再錯位、d7/d8/d9 與 tldr 逐字保留、0 個佔位字串。
換行標題的風險經實測排除。本票的程式碼我沒有再發現缺陷。

**但 diff 裡有四件事需要 captain 在第 ④ 步（看 diff）決定，全部屬「來源資料」，不是程式缺陷：**

1. **h4 的 `ruling` 會從正確變成錯誤 —— 這一項建議先改試算表再合併。**
   現行值「宣告民法父權優先條款違憲」正確；收集區的值是「宣告民法**侵權**父權優先條款違憲」。
   釋字第 365 號處理的是民法第 1089 條的**親權**行使，與侵權行為無關；同一列的 `content`
   自己寫的也是「規定由父優先行使**親權**」。研判是「親權」誤植為「侵權」。
   這是本次唯一一項「現有內容倒退」，來源在試算表。
2. **17 筆新內容會上線（h30–h46）。** `design.md` 第七節把這 17 筆列為「需確認是尚未核可，
   或是遺漏」，現在試算表裡全部是 Approved。內容看起來都是真實判解（釋字號與年份逐筆核對
   相符，例如 h46 = 114 年憲判字第 1 號／2025）。需要 captain 確認這是有意核可。
   另有兩處錯字：h34／h35 的 `handwriting` 寫成「**驅驅**一個外國人／大陸人前的收容」。
   h33 的 `title` 是一段 45 字的判決要旨，其他 40 筆的 `title` 都是短句，版面會不一致。
3. **h2 會從網站消失。** 試算表的 `status` 是空白。h2 正是 `../health-check/TODO.md` 的 P0-2
   所指、釋字第 272 號有法律錯誤的那一筆。研判是刻意壓著等法學協作者確認，但它現在線上，
   合併後會不見，captain 應知道。
4. **9 筆的 `chapter` 標籤會消失。** 收集區沒有 `chapter` 欄。`design.md` 第七節記載這個設計
   「已被放棄，應正式廢除或補齊」。網站的 `past/page.tsx:192` 是條件渲染，不會壞，標籤直接不顯示。

**工作區已還原到 HEAD**，兩個 json 的 sha256 仍是 `ae72f302…`／`d6b7c5be…`。本輪是驗證，
把內容提交上分支、開 PR 是施工項目 9，應在 captain 看過上述四項之後才做；重跑一次
`npm run sync-content` 即可重現同一份產出（同步產物另存於 scratchpad）。
上一輪的 Polish（`checkMergedDiscussionIds` 的 `if (errors.length === 0)`）依 FO 指示未改。
