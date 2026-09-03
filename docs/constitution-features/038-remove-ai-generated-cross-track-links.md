---
id: 038
title: 移除 AI 生成的跨軌道連結（之後是否重做需討論）
status: review
source: captain 2026-09-02 決定
started: 2026-09-03T17:04:14Z
completed:
verdict:
score: 0.6
worktree: .worktrees/spacedock-ensign-038-remove-ai-generated-cross-track-links
issue:
pr:
mod-block: merge:pr-merge
gates:
    version: 1
    records:
        - id: gate:038:verify
          stage: verify
          attempts:
            - id: gate-attempt:038-verify-1
              briefing:
                id: briefing:038:verify:attempt-1:revision-1
                digest: sha256:20f368d6f1274f45b84e1e63adcad16fb63998edeade77e3a5d2e6763fde9af0
                room-ref: '@review/verify/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:038:verify:1
                briefing: briefing:038:verify:attempt-1:revision-1
                by: person:captain
                at: "2026-09-03T17:39:47.866469Z"
                decision: approve
                reason: verify 自寫 jsdom + react-dom/client 掛載檢查（與 implement 的 swc + react-dom/server 完全不同路徑），19 條路由跨軌道計數 0、渲染無例外；對 main 同一檢查得 54 處殘留 exit 1，證明可證偽。連結逐條差集：移除 20 條全為跨軌道連結、新增 0 條、非跨軌道欄位零差異。src/ 無殘骸無佔位資料，next build 與 tsc 皆通過。captain 知悉並接受 FO 裁示的代價：驗收腳本未入版控，AC-1／AC-2 後續無法重跑；已另開 039 將該工具定型。
              application:
                target-stage: review
                state: consumed
        - id: gate:038:review
          stage: review
          attempts:
            - id: gate-attempt:038-review-1
              briefing:
                id: briefing:038:review:attempt-1:revision-1
                digest: sha256:c34f424a0ad230a7e204673dfe4e719185f8515e61f5d99a367498620f57dedd
                room-ref: '@review/review/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:038:review:1
                briefing: briefing:038:review:attempt-1:revision-1
                by: person:captain
                at: "2026-09-03T18:08:54.17022Z"
                decision: approve
                reason: 三條 AC 由三種互不重疊的方法各自複現：implement 用 react-dom/server + swc、verify 用 jsdom + react-dom/client 真實掛載並跑 effect、review 用 Next 正式建置產物的中文字串集合差集（1098→1092，只少 6 條全為跨軌道文字，新增 0 條，其餘 1092 條逐條相同）。三者皆以「對 main 回報殘留、對本分支回報 0」證明檢查可證偽。cycle 1 因 data-collection-guide.md 仍把兩個已刪檔案列為 evergreen 現況而 REJECTED，修正保留移除痕跡而非刪列。F-2（INDEX.md 日期慢一天）屬 Polish，FO 併入合併後的文件批次處理。
              application:
                target-stage: complete
                state: pending
---

**⚠️ 需要討論** —— 移除的部分已定案，但「之後要不要重做、由誰做」尚未決定。

移除 `src/data/cross-track-links.ts` 內現有的跨軌道對應資料。captain 於 2026-09-02 裁示：不要現有的 AI 生成連結，之後可考慮重做。

## Problem

跨軌道連結於 2026-04-27 由 `006` 加入（PR #11）。檔案自述為「curated editorial links — not auto-generated」（人工策展，非自動生成），但**專案內沒有任何文件記錄這些對應是誰決定的、依據什麼**，而三項證據指向它並非人工策展：

**一、`T3 → T1` 的 15 筆對應指向虛構案件。**
`CASE_TO_HISTORY` 的鍵是 `c02`–`c31`。`/future` 最早以編造的假案件建置，編號即為此格式；commit `46a23e6`（`feat(T3): replace synthetic cases with real Constitutional Court data`）將其換成真實待審案件後，id 變為 `114憲立3` 這類格式，但對應表未同步更新。實測：對全部 39 件待審案件呼叫 `getLinksForCase`，每一件都回傳 0 筆，`/future` 的「歷史脈絡」區塊渲染 0 次。註解中的「代理孕母」「跨性別身分證」等主題即為當初虛構案件的題目。

**二、`T1 → T2` 的 `h2` 對應建立在錯誤資料之上。**
註解寫「廢除刑法100條・言論自由 -> 言論自由相關討論」，但 `h2` 是釋字第 272 號軍事審判案。`SSOT_收集區` 早已改正該筆，但四個月間修正未回流至網站，做對應者看到的是錯的版本。具法學背景者不會將釋字 272 認作言論自由案。

**三、`006` 的 review 判定 MET 的依據是結構存在，不是連結有效。**
原文：「`CASE_TO_HISTORY` maps 15 case IDs to relevant history entries」。它驗證對應表已填入 15 筆，未驗證這些鍵能解析到任何案件。

三者與 `015`（設計文件的 Sample data 被當成真實內容上線四個月）屬同一失效模式：**東西存在即判定通過，無人檢查它是否運作。**

## Proposed approach

移除四張對應表與其消費端，不保留註解掉的殘骸 —— 那會讓下一個人以為只要改鍵值就能復活，而實際上內容本身需要重做。

移除範圍：

- `src/data/cross-track-links.ts`：`HISTORY_TO_DISCUSSIONS`（4 筆）、`DISCUSSION_TO_HISTORY`（8 筆）、`DISCUSSION_TO_CASE_TAGS`（3 筆）、`CASE_TO_HISTORY`（15 筆）
- `src/components/CrossTrackLinks.tsx` 及其在 `past/page.tsx`、`present/[id]/page.tsx`、`future/CaseCard.tsx` 的引用

**拒絕的替代方案**：只修 `CASE_TO_HISTORY` 的鍵值。理由 —— 那只處理證據一，證據二（依據錯誤資料）與證據三（未驗證有效性）不會因此消失，且無人能確認剩下的對應是否正確。

## Risk evidence

no spike needed：三處消費端皆為條件渲染（`getLinksForHistory` / `getLinksForDiscussion` / `getLinksForCase` 回傳空陣列時區塊不顯示），移除資料後行為與現況一致 —— `/future` 本來就渲染 0 次。

已知現況：`T1 → T2` 目前只有 3 筆生效（`h1`、`h10`、`h14`；`h2` 因 status 空白不上線）。`T2 → T1` 有 8 筆、`T2 → T3` 有 3 筆，其有效性未經查證。

## Expected surface and tolerance

Estimate: −350 淨行，跨 5 個檔案，tolerance ±30%。
Semantics this may change: `/past`、`/present/[id]`、`/future` 三處的跨軌道連結區塊不再出現。無資料格式或路由變更。

## Acceptance criteria

**AC-1 — 三個頁面不再出現跨軌道連結區塊，且皆無例外。**
Verified by: 以 `react-dom/server` 配真實資料渲染 `/past`、`/present/[id]`、`/future`，查詢結果 DOM 中「Related — 跨軌道連結」與「歷史脈絡」標題數皆為 0，且渲染過程無例外拋出。
會使其失敗的改動：保留任一消費端而未移除其資料來源。

**AC-2 — 移除後網站的其餘內容未受影響。**
Verified by: 移除前後對三頁渲染出的 DOM 取元素計數（`.textbook-item`、`.reality-item`、討論卡片數、`#tldr`），除跨軌道區塊外數量完全相同。
會使其失敗的改動：誤刪共用元件或條件式。

**AC-3 — 不留下註解掉的殘骸。**
Verified by: `grep -rn "CASE_TO_HISTORY\|HISTORY_TO_DISCUSSIONS\|DISCUSSION_TO_CASE_TAGS\|DISCUSSION_TO_HISTORY" src/` 無結果。
會使其失敗的改動：以註解方式保留對應表。

## Test plan

`npx tsc --noEmit`、`npm run dev` 目視、`npm run build`。渲染比對沿用 037 的做法（`react-dom/server` + jsdom），該環境無法產生截圖。

### Feedback Cycles

- Cycle 1: REJECTED — review；surface 5 檔／−352 行 vs estimate −350 ±30%（101%，在容差內）；AC unchanged，AC-1／AC-2／AC-3 三項皆 MET。單一發現 F-1（Material）：evergreen 文件 `docs/content-pipeline/data-collection-guide.md:174` 仍指向兩個已刪檔案，FO 授權 fix。另處理分支落後 main 一個 commit（seed 039）造成的假 diff。

## Out of scope

- **之後是否重做跨軌道連結** —— 需 captain 與內容端討論。若要重做，需先決定：由誰策展、依據什麼、如何驗證連結有效而非僅存在
- `docs/health-check/TODO.md` 的 P1-7 描述較窄（僅記「鍵值對不上」），待本票定案後一併更新

## Stage Report: implement

- DONE: 移除 cross-track-links.ts 內四張對應表與 CrossTrackLinks 元件，以及在 past/page.tsx、present/[id]/page.tsx、future/CaseCard.tsx 的引用，不保留註解掉的殘骸
  commit `29da8ec`，−352 行跨 5 個檔案。兩個檔整份刪除，三處消費端連同 `CrossTrackSection`、`CaseHistoryLinks` 與失效的 `Link` import 一併移除。AC-3 的 grep 無結果；另以 `CrossTrackLinks\|cross-track-links\|getLinksFor` 補搜 `src/`，同樣無結果。
- DONE: 以 react-dom/server 配真實資料渲染三頁，確認跨軌道區塊數為 0 且無例外拋出
  `node scripts/render-check.cjs . out.json --assert-no-cross-track` 對本分支 exit 0（commit `5114eb0`）。渲染 `/past`、`/future`、`/present` 與全部 16 篇 `/present/[id]`，`errors: 0`。
- DONE: 以元素計數比對移除前後，確認除跨軌道區塊外其餘內容數量完全相同
  移除前後各跑一次同一腳本再逐欄比對：跨軌道欄位 21 筆全部歸零，非跨軌道欄位零差異。

### 證據與可證偽性

- **跨軌道計數歸零**：`/past` 的「Related — 跨軌道連結」4 → 0、T2 徽章 6 → 0；`/present/[id]` 的 d1、d2、d4、d5、d6、d7、d8、d9 各自 1 → 0。會使其失敗的改動：保留任一消費端而未移除其資料來源。
- **其餘內容未變**：`textbook-item` 25、`reality-item` 25、`vh-trigger` 25、待審案件 39、`id="tldr"` 1、`/present` 文章連結 15、每篇詳頁的 `貓頭鷹深度解析` 與 relatedArticles —— 移除前後完全相同。會使其失敗的改動：誤刪共用元件或條件式。
- **檢查腳本本身可證偽**：同一腳本對 main（連結尚在）exit 1，列出 `./past.crossTrackHeading = 4` 等 21 筆殘留；對本分支 exit 0。若腳本只是空轉，這兩次結果會相同。
- `npx tsc --noEmit` exit 0。`npm run lint` 為 4 errors / 6 warnings，與 main 的 `src/` 逐數字相同 —— 本次移除未新增任何 lint 問題，新腳本亦為 0。

### 需要 FO 裁示：施工面積超出 tolerance

票上估 −350 行、5 個檔、±30%。**移除本身正好落在估計內**：`29da8ec` 是 −352 行、5 個檔。

但我另外提交了 `scripts/render-check.cjs`（`5114eb0`，+256 行，第 6 個檔），使分支淨額變成 −96 行、6 個檔，**超出 tolerance 區間（−245 ～ −455）**。

加它的原因：AC-1 與 AC-2 指定用 `react-dom/server` 驗收，但專案沒有這個工具，037 也沒留下可沿用的腳本（037 分支目前停在 main，無 diff）。我原本試著用 `npm run dev` + curl 取代，實測不可行 —— dev server 回傳的 HTML 只含 layout，頁面內容在 Suspense 邊界後面串流，`textbook-item` 這類本來就該存在的標記也抓不到 0 筆。若不把腳本入庫，verify 階段無法重跑 AC-1／AC-2。

兩個處置擇一，我建議前者：
1. **保留**（建議）—— AC-1／AC-2 從此可重跑。腳本已標明僅供驗證、不參與 build，斷言刻意不檢查內容數量，避免試算表同步後假警報。
2. **回退 `5114eb0`** —— 分支回到 −352／5 檔，正好符合估計，但驗收證據只剩本報告的數字，無法重跑。

### Summary

移除了四張跨軌道對應表、三個查詢函式、`CrossTrackLinks` 元件與三處消費端，整份刪除不留註解殘骸。以 `react-dom/server` 渲染比對證實：跨軌道區塊 21 筆計數全部歸零，其餘元素計數逐項相同，渲染無例外，`tsc` 與 lint 無新增問題。`/future` 移除前即為 0 次渲染，實測印證了票上證據一 —— `CASE_TO_HISTORY` 的鍵 `c02`–`c31` 指向已被真實案件取代的虛構案件。唯一需要裁示的是驗收腳本入庫造成的施工面積超標，見上一節。

### 施工面積裁示結果與檢查腳本去向（FO 2026-09-03）

FO 裁示回退檢查腳本，理由：新增常設檢查是最後手段，需 captain 明確核可，且應獨立成一張票。captain 核准的是移除跨軌道連結，本票沒有新增檢查工具的授權。已執行 `fd57bd8`（revert `5114eb0`）。**分支現為 −352 行 / 5 個檔，落在票上估計的 −350 ±30% 內。**

我原先「不入庫則 verify 無法重跑」的前提不成立。037 的前例是 verify 自寫 parser、review 再另寫一套，兩者都不沿用實作者的腳本，且 review 因此抓到 verify 建議的修法無效。獨立重寫不會繼承同一組盲點，強度高於重跑同一支腳本。verify 應自行寫一份，以下僅供對照。

**腳本位置（未入版控）：**
`/private/tmp/claude-501/-Users-ipa-Documents-ipa-Document-00-Claude-spacedock-folder/dfe33f00-9190-4f9d-8044-b332a2106079/scratchpad/render-check.cjs`（256 行）

**用法：**

```
node render-check.cjs <repo-root> <out.json>                          # 輸出元素計數
node render-check.cjs <repo-root> <out.json> --assert-no-cross-track  # 斷言歸零，不符 exit 1
```

`<repo-root>` 需有 `node_modules`（本 worktree 以 symlink 指向主 checkout；`npm install` 亦可）。腳本用 Next 內建的 swc 轉譯 `src/` 下的 `.ts`／`.tsx`，替換 `next/link`、`next/image`、`lucide-react`，再以 `react-dom/server` 渲染 `/past`、`/future`、`/present` 與全部 16 篇 `/present/[id]`。斷言刻意不檢查內容數量 —— 歷史條目數、待審案件數會隨試算表同步變動，寫死會造成假警報。

**已取得的兩組結果（revert 後於 scratchpad 重跑，結果不變）：**

| 對象 | 結果 |
|---|---|
| 本分支（連結已移除） | `errors: 0`，PASS，exit 0 |
| main（連結尚在） | `errors: 0`，FAIL，exit 1，列出 21 筆殘留 |

main 的 21 筆為：`./past.crossTrackHeading = 4`、`./past.crossTrackBadgeT2 = 6`，以及 d1、d2、d4、d5、d6、d7、d8、d9 的 `crossTrackSection`／`crossTrackHistoryHeading`／`crossTrackFutureHeading` 各 1。兩次結果相異，證明檢查不是空轉。

**為什麼不能用 `npm run dev` + curl 取代：** 實測 `next dev` 回傳的 HTML 只含 layout，頁面內容在 Suspense 邊界後面串流，curl 抓不到。連 `textbook-item` 這種本來就該存在的標記都是 0 筆。改用 curl 計數會對空頁面回報「通過」。verify 若要自寫檢查，需避開這個陷阱。

**後續：** FO 將把此腳本當成獨立提案交 captain 決定。`docs/health-check/TODO.md` 的 P2-11（長標題版面無人能驗證）成因即為缺少渲染檢查工具，此腳本是該缺口的候選答案。

## Stage Report: verify

- DONE: 自行建立渲染檢查（不要沿用 implement 的腳本，只可拿它對照結果），確認三頁與全部詳頁的跨軌道區塊計數為 0 且渲染無例外
  自寫 `verify-hydrate-check.cjs`，三處與 implement 不同：用 TypeScript 官方 transpiler（非 swc）、用 `react-dom/client` 真的掛載並跑 effect（非 `react-dom/server`）、用 DOM API 計數（非字串比對）。19 條路由（`/past`、`/present`、`/future` 與全部 16 篇 `/present/[id]`）跨軌道計數 0、`errors: 0`。渲染例外由 `createRoot` 的 `onUncaughtError`／`onCaughtError`／`onRecoverableError` 三個 callback 收集，全數為空。
- DONE: 確認移除未波及其他內容：以元素計數比對移除前後，非跨軌道欄位零差異
  以 `git archive main` 開乾淨 baseline，同一支腳本跑兩邊比對：`textbookItem` 25、`realityItem` 25、`vhTrigger` 25、`tldrAnchor` 1、`caseFilingTime` 39、`headings`、`images`、`owlDepthComment`、`relatedArticlesHeading` 全部零差異。三個資料檔 sha256 兩邊相同，所以差異只可能來自本次移除。
- DONE: 確認 src/ 內無跨軌道殘骸，且無註解掉的對應表
  四張表名、`CrossTrackLinks`／`getLinksFor*`／`CrossTrackLink`／`CrossTrackSection`／`CaseHistoryLinks`、以及「跨軌道」「歷史脈絡」在 `src/` 皆無結果；另專掃註解行（`^\s*(//|/\*|\*)`）亦無。兩個檔案確認已刪除。`git diff --numstat main..HEAD -- src/` 為新增 0 行、刪除 352 行，是純刪除。

### 證據與可證偽性

- **檢查不是空轉**：同一支腳本對 main 回報跨軌道殘留 54 處、`--assert-no-cross-track` exit 1；對本分支 0 處、exit 0。若腳本空轉，兩次結果會相同。
- **與 implement 的腳本對照，結論一致**：`/past` 4 個 heading、6 個 T2 徽章；有跨軌道區塊的詳頁同為 d1、d2、d4、d5、d6、d7、d8、d9；`/future` 兩邊都是 0。兩套獨立方法數字吻合，也再次印證票上證據一（`CASE_TO_HISTORY` 的鍵解析不到任何真實案件）。
- **連結逐條比對，不只比數量**：抓出兩邊所有 `a[href]` 做多重集合差集。移除的 20 條全部是跨軌道連結（`/past` → `/present/dN` 6 條；詳頁 → `/past`／`/future` 14 條）；新增 0 條，標題文字增刪皆 0。會使其失敗的改動：誤刪任一非跨軌道連結或標題。
- **`allElements` 減少 199**，且只出現在 `/past` 與 d1～d9；`/present`、`/future`、`tldr`、d11～d17 為 Δ0。
- `npx next build` 與 `npx tsc --noEmit` 皆 exit 0，路由表與 main 相同。

### 佔位資料掃描（stage 指定項目）

`某學者`、`某大學法律系`、`lorem ipsum`、`快速了解最新判決的5個重點`、獨立值 `"test"` 在 `src/` 全部 0 命中。`placeholder` 3 處為搜尋框的 HTML 屬性與一則註解、`TODO` 1 處為 `layout.tsx` 指向 `docs/health-check/TODO.md` 的註解，四處在 main 上均已存在，非本次引入。本票未改動任何資料檔（`discussions.json`、`history.json`、`future.ts` 的 sha256 與 main 相同），唯一被刪的 `src/data/cross-track-links.ts` 即移除標的。

### 事實查核

本票只刪不增，未產生任何對外顯示的事實敘述，故無人名、日期、事件、數據可查。票上三項證據我獨立重現了證據一（`/future` 跨軌道渲染數在移除前即為 0）。證據二涉及釋字第 272 號的法律內容，屬 `docs/health-check/TODO.md` 的 P0-2，需法學背景者判斷，不在本階段能力範圍。

### 需要 FO 知悉：機器相依與限制

1. **原訂的 headless Chrome 方案失敗**。我先做真實 `next build` + `next start` + headless Chrome 取 hydration 後 DOM，兩支 Chrome 二進位檔在本環境都 segfault（signal 11）。改用 jsdom + `react-dom/client`。
2. **`jsdom` 未裝進專案**。裝在 scratchpad 的獨立 prefix，專案 `node_modules` 未被更動。重建方式：`npm install jsdom --prefix <暫存目錄>`，再用 `JSDOM_PATH` 指過去。
3. **腳本未入版控**，位置 `/private/tmp/claude-501/-Users-ipa-Documents-ipa-Document-00-Claude-spacedock-folder/dfe33f00-9190-4f9d-8044-b332a2106079/scratchpad/verify-hydrate-check.cjs`。理由同 FO 對 implement 的裁示：新增常設檢查需 captain 核可並獨立成票。**這代表 AC-1／AC-2 目前無法由後續階段重跑**，與 implement 階段的情況相同。
4. **`相關待審案件` 這個標記不是跨軌道專屬**：`src/app/future/page.tsx:114` 在有篩選標籤時也會顯示同一字串。該檔兩邊 sha256 相同、未被本次改動碰到，且預設狀態下不觸發（兩邊都是 0），故不影響判定。
5. **驗證一個易踩的陷阱**：實測 `curl` 抓 `next start` 的 HTML，`/past` 在 main 與本分支都是 0 命中 —— 因為 `LaunchGate` 在 hydration 前回傳 `null`。任何只看 SSR HTML 的檢查都會對「連結還在」的 main 回報通過。後續若要重做檢查，必須跑 effect。

### 判定

**PASSED。** 三項 checklist 全數通過，兩套獨立方法結論一致，移除範圍與票上 `Proposed approach` 相符，未波及其他內容。

### Summary

以自寫的 jsdom + `react-dom/client` 掛載檢查（與 implement 的 swc + `react-dom/server` 路徑完全不同）驗證 19 條路由：跨軌道區塊計數 0、渲染無例外。對 main 的乾淨 baseline 做同一檢查得 54 處殘留、exit 1，證明檢查可證偽；兩套方法在 `/past` 的 4／6 與八篇詳頁清單上數字吻合。連結逐條差集顯示移除的 20 條全為跨軌道連結，新增 0 條，非跨軌道欄位零差異。`src/` 無殘骸、無註解掉的對應表、無佔位資料，`next build` 與 `tsc` 皆通過。需 FO 知悉的是：檢查腳本依 FO 既有裁示未入版控，AC-1／AC-2 後續仍無法重跑。

## Stage Report: review

- DONE: 獨立複現 AC-1 至 AC-3，不採信前兩階段的自述；至少一項用與前兩者不同的方法
  第三種方法：不自寫渲染器，改用 Next 自己的正式建置產物比對。對 main 乾淨 baseline 與本分支各跑一次 `npx next build`（皆 exit 0），再從兩邊 `.next` 的伺服器 chunk、客戶端 chunk 與預渲染 HTML 抽出所有中文字串literal 做集合差集。與 implement 的 swc + `react-dom/server`、verify 的 jsdom + `react-dom/client` 三條路徑互不重疊。
- DONE: 審查移除是否完整且未過度：比對票上 Proposed approach 列出的移除範圍，指出有無多刪或漏刪
  逐個 hunk 讀過 `git diff main..HEAD -- src/`：刪除範圍與 Proposed approach 逐項對齊，**無多刪、無漏刪**。`git diff --numstat` 為新增 0 行／刪除 352 行，5 個檔，無任何新增或修改行。
- DONE: 判斷此次移除是否留下任何會誤導後人的痕跡，例如殘存的型別、匯出、或指向已刪功能的註解與文件
  `src/` 乾淨（型別 `CrossTrackLink`、四張表、三個 getter、元件名皆 0 命中，含註解行）。**但 `docs/content-pipeline/data-collection-guide.md` 第 174 行仍指向兩個已刪檔案**，見下方〈發現〉。

### 證據與可證偽性

- **字串集合差集（本階段的獨立方法）**：main 產物有 1098 條中文字串literal，本分支 1092 條。**只少 6 條，且 6 條全部是跨軌道 UI 文字**：`跨軌道連結`、`跨軌道探索`、`歷史脈絡`、`未來影響`、`相關釋憲判例`、`件相關待審案件`。**新增 0 條。** 其餘 1092 條逐條相同 —— 這同時證明 AC-1（跨軌道文字在任何程式路徑上都不可能出現）與 AC-2（其他使用者可見文字一字未動）。會使其失敗的改動：誤刪任一非跨軌道字串，或漏刪任一跨軌道字串。
- **檢查不是空轉**：同一支抽取程式對 main 抓到全部 6 條跨軌道字串、對本分支 0 條。若抽取為空轉，兩邊都會是 0 或相同。
- **路由未變**：`app-path-routes-manifest.json` 兩邊逐字元相同，15 條路由不增不減。
- **AC-3 原文指令**：`grep -rn "CASE_TO_HISTORY\|HISTORY_TO_DISCUSSIONS\|DISCUSSION_TO_CASE_TAGS\|DISCUSSION_TO_HISTORY" src/` exit 1（無結果）。另以 `cross-track|crosstrack|getLinksFor|跨軌道|歷史脈絡` 不分大小寫複掃 `src/`，同樣 exit 1。
- **未引入 lint 問題**：對兩邊各跑 `npx eslint src -f json`，error 為同樣 4 筆（`react-hooks/set-state-in-effect`，檔名行號完全相同），warning 皆 6 筆。`npx tsc --noEmit` exit 0。無殘留的未使用 import。

### 覆核：前兩階段的自述有無誇大

- verify 說「`相關待審案件` 不是跨軌道專屬」—— 屬實。本階段字串差集顯示消失的是 `件相關待審案件`（`${n} 件相關待審案件`），獨立的 `相關待審案件` 兩邊都在，來自 `src/app/future/page.tsx` 的篩選標籤。
- verify 說「只看 SSR HTML 的檢查會誤判通過」—— 屬實且我獨立踩到同一點。正式建置產出的 `past.html` 只有 14070 bytes，`textbook-item` 與 `跨軌道連結` 在 main 上同為 0 命中，成因是 `src/app/layout.tsx` 的 `LaunchGate` 在掛載前回傳 `null`。所以我改用 chunk 產物比對，不用預渲染 HTML 做內容判定。
- implement／verify 回報的計數（`/past` 4 個 heading、6 個 T2 徽章、八篇詳頁）我未逐頁重數，但字串層級的「6 條全刪、0 條誤刪」是更強的宣稱，且與其結論相容。

### 發現 F-1：evergreen 文件仍指向已刪檔案（Material，本票可修）

`docs/content-pipeline/data-collection-guide.md:174`：

    | 跨軌道 | `src/data/cross-track-links.ts` | `src/components/CrossTrackLinks.tsx` |

四項證據：

1. **使用者與正常流程** —— 後續 agent 或協作者查「檔案位置一覽」以了解各軌資料放哪。該文件 `狀態: evergreen`、`最後查核: 2026-09-02`。
2. **可觀察的損害** —— 表列的兩個路徑在本分支皆不存在（`ls` 兩者 No such file）。讀者會以為功能仍在。
3. **受影響的界線** —— 非 AC-1～AC-3 所涵蓋。受影響的是 `CLAUDE.md` 明訂的界線：「過時的 evergreen 文件是危險的」。本階段 checklist 第三項亦明列「指向已刪功能的註解與文件」。
4. **觸發證據** —— `grep -rn "cross-track" docs --exclude-dir=_archive --exclude-dir=constitution-features` 命中該行。

**注意檔頭的過時警告不涵蓋此處。** 該文件檔頭只標注 T1／T2 章節過時；第 174 行位於「檔案位置一覽」，讀者會當成現況。

建議處置：`fix`，改動為一行（刪除該表列或標注已於 038 移除）。複驗成本是同一條 grep。

**不算缺陷的三處，一併說明避免重複追查：**

- `docs/health-check/TODO.md` 的 P1-7／P1-8（第 401、438、450、480 行）—— 票上 `Out of scope` 已明列「待本票定案後一併更新」，且行文皆為歷史敘述並指向 `038`。本票尚未結案，現在不算過時。**但這是交付前的待辦，不要遺失。**
- `docs/constitution-features/_archive/` 的五份舊票 —— `CLAUDE.md` 規定 `record` 類文件不改寫。保留正確。
- `docs/INDEX.md` —— 本分支未新增或刪除任何文件，無須更新。

### 需要 FO 知悉

1. **分支落後 main 一個 commit**：`4f2b705`（seed 039）。`git diff --stat main..HEAD` 因此顯示 `039-render-check-tool.md` 被刪 92 行 —— 那是分支落後造成的假象，不是本票的改動。交付前需 rebase 或 merge。
2. **機器相依**：我把 main 的 baseline 用 `git archive main` 展開到 scratchpad，`node_modules` 以 `pax -rwl` 硬連結（不可用 symlink —— Turbopack 會 panic：`Symlink … points out of the filesystem root`）。抽取程式 `cjk-extract.mjs` 在 scratchpad，未入版控，理由同 FO 對 implement 的裁示。**這代表本階段的字串差集後續無法重跑。**
3. 本票只刪不增，未產生任何對外顯示的事實敘述，無人名、日期、數據可查核。票上證據二（釋字第 272 號）屬 `docs/health-check/TODO.md` 的 P0-2，需法學背景者判斷。

### 判定

**REJECTED —— 單點，只差一行文件。**

AC-1、AC-2、AC-3 三項全部 MET，且以與前兩階段完全不同的方法獨立複現。移除範圍與票上 `Proposed approach` 逐項相符，無多刪無漏刪，未引入型別、lint 或路由變化。唯一擋住交付的是 F-1：一份 evergreen 文件仍宣稱兩個已刪檔案存在。

若 FO 認為 F-1 應與 `docs/health-check/TODO.md` 的 P1-7 併入同一批文件更新，那是 FO 的授權範圍；但那樣必須把 `data-collection-guide.md:174` 明確寫進票上的 `Out of scope`，否則它會被漏掉。

### Summary

以 Next 正式建置產物做第三條獨立驗證路徑：對 main 乾淨 baseline 與本分支各建置一次，比對兩邊 `.next` 內所有中文字串literal。結果是只少 6 條、全部為跨軌道 UI 文字、新增 0 條，其餘 1092 條相同 —— 這比逐頁計數更強，證明跨軌道文字在任何程式路徑上都無法出現，且其他內容一字未動。路由清單相同，lint error 逐筆相同，`tsc` 通過。移除範圍逐個 hunk 比對後確認與票上一致。判定 REJECTED 的唯一理由是 `docs/content-pipeline/data-collection-guide.md:174` 這行 evergreen 文件仍指向兩個已刪檔案。

## Stage Report: implement (cycle 1)

- DONE: 修正 docs/content-pipeline/data-collection-guide.md 第 174 行：標明跨軌道已於 2026-09-03 移除、指向 038 這張票，並更新該檔的最後查核日期
  commit `dd65456`。表格列改為 `| ~~跨軌道~~ | 已於 2026-09-03 移除 | 已於 2026-09-03 移除 |`，另加四行補述。檔頭「最後查核」由 2026-09-02 改為 2026-09-03。
- DONE: 分支對齊 main，確認 git diff --name-only main...HEAD 不含 039-render-check-tool.md
  commit `ac6e6ef`（merge `4f2b705`）。`git diff --name-only main...HEAD | grep -c 039-render-check-tool` = 0。`git rev-list --left-right --count main...HEAD` = `0	12`，已無落後。

### 改了什麼

第 174 行原文把兩個檔案列為現況：

```
| 跨軌道 | `src/data/cross-track-links.ts` | `src/components/CrossTrackLinks.tsx` |
```

改為保留該列並標示已移除，下方加一段補述，帶齊三件事 —— 已移除、日期 2026-09-03、指向 `docs/constitution-features/038-remove-ai-generated-cross-track-links.md`，並補一句「之後是否重做尚未決定」。沒有直接刪列，因為刪掉會讓下一個讀者以為跨軌道從來不存在。

補述中仍會出現那兩個路徑字串，但該處明講「已於 2026-09-03 刪除，兩個檔案都不存在了」。那是刻意留下的痕跡，不是過時指向。

第 138 行的「跨軌道共通事項」未動。該節比較 T1／T2 與 T3 的收集方式，與已移除的跨軌道連結功能無關，僅標題用詞相同。

### 確認指令

檢查點是「表格列是否仍把已刪檔案列為現況」，而非「檔內是否出現過該字串」—— 後者會把補述誤判為問題。

```
grep -nE '^\|.*(cross-track-links|CrossTrackLinks)' docs/content-pipeline/data-collection-guide.md
```

exit 1、無輸出。輔以 `ls src/data/cross-track-links.ts src/components/CrossTrackLinks.tsx` → 兩者皆 `No such file or directory`，確認表格所述與磁碟現況一致。

### 分支狀態

採 **merge 而非 rebase**。verify 與 review 已在本分支提交報告（`42979bd`、`829e261`、`7f1b55a` 等），rebase 會改寫他們的 commit。merge 達成同樣的對齊效果且不破壞既有歷史。

分支現為 12 個 commit 領先 main、0 個落後。`git diff --name-only main..HEAD` 已不再出現 `039-render-check-tool.md`。本輪未改動 `src/`（`git diff --name-only dd65456~1 HEAD -- src/` 為空），亦未動試算表、`.env.local`、Vercel 設定，未碰 `docs/health-check/TODO.md`。

### Summary

本輪只處理 review cycle 1 的 F-1：一份 evergreen 文件仍把兩個已刪檔案列為現況。改法是標示移除而非刪列，保留痕跡並指向 038。另把分支併入 main 的 `4f2b705`，消除 `039-render-check-tool.md` 被刪的假象。移除工作本身未動，依指派未自行重驗，重驗由 review 執行。

## Stage Report: review (cycle 2)

- DONE: 複驗 F-1：確認 data-collection-guide.md 不再把跨軌道列為現況，且補述帶齊移除事實、日期與 038 的指向
  第 174 行現為 `| ~~跨軌道~~ | 已於 2026-09-03 移除 | 已於 2026-09-03 移除 |`，兩欄皆不再列路徑。補述四項齊全：已移除、日期 2026-09-03、指向 `docs/constitution-features/038-remove-ai-generated-cross-track-links.md`、「之後是否重做尚未決定」。檔頭最後查核 2026-09-02 → 2026-09-03。
- DONE: 確認本輪修正未波及其他內容，且先前已通過的 AC-1 至 AC-3 在合併 main 後仍然成立
  合併後重跑正式建置，中文字串集合與 cycle 1 的分支產物**逐行相同**（1092 條，`diff` 無輸出），對 main 的差集仍是「少 6 條全為跨軌道文字、新增 0 條」。`src/` 本輪零改動，AC-3 兩組 grep 仍 exit 1。
- DONE: 判定本輪 verdict
  **PASSED。** 見下方〈判定〉。

### 證據與可證偽性

- **F-1 的檢查點用 FO 指定的判準**（「表格列是否仍列為現況」，不是「檔內是否出現字串」）：`grep -nE '^\|.*(cross-track-links|CrossTrackLinks)' docs/content-pipeline/data-collection-guide.md` → exit 1。**同一條指令對修正前的 `dd65456~1` 命中第 174 行、exit 0** —— 兩次結果相異，證明檢查不是空轉。補述中出現的兩個路徑字串不落在 `^\|` 上，正確地不被誤判。
- **表格所述與磁碟一致**：`ls src/data/cross-track-links.ts src/components/CrossTrackLinks.tsx` 兩者皆 `No such file or directory`。
- **合併只帶進文件**：`git show --stat 4f2b705` 為單一檔案 `039-render-check-tool.md` +92 行，未觸及 `src/`。因此 AC-1～AC-3 的結論在合併後結構上不受影響。
- **不只靠推論，實測重跑**：合併後 `npx next build` exit 0（15 條路由、16 頁靜態產生）、`npx tsc --noEmit` exit 0。從新產物重抽中文字串literal，**與 cycle 1 的分支結果逐行相同**；對 main 的差集仍恰為 `跨軌道連結`、`跨軌道探索`、`歷史脈絡`、`未來影響`、`相關釋憲判例`、`件相關待審案件` 六條，新增 0 條。會使其失敗的改動：本輪若誤動任一 `src/` 檔案，這 1092 條會出現差異。
- **本輪改動面積**：`git diff --name-only 829e261..HEAD` 只有三個檔 —— 本票實體、`data-collection-guide.md`、以及合併帶進來的 `039-render-check-tool.md`。`git diff --name-only 829e261..HEAD -- src/` 為空。

### 覆核：implement cycle 1 的自述

- 「檢查點是表格列而非字串」的提醒成立，我已依此判準複驗，並補做了反向對照。
- 採 merge 而非 rebase 的選擇正確。`git rev-list --left-right --count main...HEAD` 為 `0 13`，main 已無領先；`git diff --name-only main...HEAD` 不含 `039-render-check-tool.md`，cycle 1 指出的假 diff 已消失。verify 與 review 的報告 commit 保持原樣未被改寫。
- 該報告寫「12 個 commit 領先」，現為 13 —— 差額是它自己的報告 commit `761fd2e`。撰寫當下正確，無須更正。
- 第 138 行「跨軌道共通事項」未動的判斷成立。該節是 T1／T2 與 T3 收集方式的比較表，與已移除的功能無關。

### 發現 F-2：`docs/INDEX.md` 的最後查核日期未跟著改（Polish，不擋交付）

`docs/INDEX.md:57` 仍記 `2026-09-02`，而 `data-collection-guide.md` 檔頭已改為 `2026-09-03`。

- **可觀察的損害**：極小。INDEX 的日期比實際**舊**一天，讀者只會多查一次，不會誤信過時內容 —— 與 F-1（宣稱兩個不存在的檔案是現況）性質不同。
- **不是既有慣例**：全庫只有三份文件帶 `**最後查核**` 檔頭，本檔是唯一不一致的一筆。`CLAUDE.md` 對 INDEX 的硬性要求是「新增或刪除文件時同步更新」，本輪未增刪文件。
- 建議處置：`decline` 或併入票上 `Out of scope` 已排定的 `docs/health-check/TODO.md` P1-7 文件更新批次一起改。不需為此再開一輪。

**另一項與本票無關、僅避免被誤記到這張票上**：`docs/INDEX.md` 有四列指向 `docs/meetup-chats/`，該目錄在 main 與本分支皆不存在。本分支未碰 INDEX，屬既有問題。

### 判定

**PASSED。**

F-1 已修正且修法比原指派更好 —— 保留痕跡而非刪列，下一個讀者能看出跨軌道曾經存在、何時移除、為何移除、以及重做與否尚未決定。合併 main 後 AC-1、AC-2、AC-3 三項仍全部 MET，且以重跑的產物字串集合逐行比對確認本輪零波及。唯一新發現 F-2 是一個日期差，屬 Polish，不擋交付。可以交付。

### Summary

本輪範圍窄，複驗三件事。F-1：表格列已不再把兩個已刪檔案列為現況，補述帶齊移除事實、日期、038 指向與「重做未定」，並以「同一條 grep 對修正前 revision 命中、對現況不命中」證明檢查可證偽。合併 main 只帶進一份文件（039 seed），未觸及 `src/`；合併後重建的產物中文字串集合與 cycle 1 逐行相同，對 main 的差集仍恰為六條跨軌道文字、新增 0 條，`next build` 與 `tsc` 皆 exit 0。新發現只有 F-2（`docs/INDEX.md` 日期慢一天，Polish）。判定 PASSED。
