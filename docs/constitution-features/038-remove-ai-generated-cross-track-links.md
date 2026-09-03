---
id: 038
title: 移除 AI 生成的跨軌道連結（之後是否重做需討論）
status: verify
source: captain 2026-09-02 決定
started: 2026-09-03T17:04:14Z
completed:
verdict:
score: 0.6
worktree: .worktrees/spacedock-ensign-038-remove-ai-generated-cross-track-links
issue:
pr:
mod-block:
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
