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
