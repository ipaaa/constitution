---
id: 071
title: 頁尾連結指向錯誤的 GitHub 與 HackMD
status: implement
source: captain 2026-09-29（聊天中直接要求開票）
started: 2026-09-29T20:11:16Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-071-footer-links
issue:
pr:
mod-block:
---

全站頁尾的外部連結有多處錯誤。captain 2026-09-29 裁示：原始碼一律指向 `https://github.com/ipaaa/constitution`；不列 HackMD；「內容錯誤回報」也指向正確的 GitHub。

## Problem

`src/components/Footer.tsx`（2026-09-29 `main` 實查）：

| 行 | 現況 | captain 裁示 |
|---|---|---|
| :27–28 | 「HackMD 協作共筆」→ `https://g0v.hackmd.io/njOKlAIVQcmCgomNMr9cUg?view` | 移除，不列 HackMD |
| :32 | 「GitHub 原始碼」→ `https://github.com/g0v/Welcome-to-Add-C0urt` | 改為 `https://github.com/ipaaa/constitution` |
| :37 | 「內容錯誤回報」→ `https://github.com/g0v/Welcome-to-Add-C0urt/issues/new` | 改指向 `ipaaa/constitution` 的回報入口 |

captain 表示「很多是錯的」，上表只是 `grep` 命中的三處。design 須逐一檢查頁尾（及其他頁面重複出現的同類外部連結）的**每一個**連結，列出現況、目的地是否存在、應改成什麼。

design 要決定：內容錯誤回報的確切目的地（`issues/new`、issue template 或其他），以及 repo 是否已開啟 Issues；站上其他位置是否也寫死舊 repo 或 HackMD；移除 HackMD 後頁尾的版面。

## Proposed approach

只改一個檔：`src/components/Footer.tsx`。不新增元件、不新增資料模組、不改版面 class。

### 一、頁尾連結盤點（2026-09-29 實測）

頁尾共有 7 個連結：3 個外部、4 個站內。量測方式：外部連結用 `curl`（未登入）取 HTTP 狀態；
站內連結用同機 dev server（`localhost:3068`，`Footer.tsx` 與 `main` 逐字相同，`diff` 無差異）取狀態。

| # | 位置 | 文字 | 現況目的地 | 實測 | 裁示後目的地 |
|---|---|---|---|---|---|
| E1 | `Footer.tsx:26–30` | HackMD 協作共筆 | `https://g0v.hackmd.io/njOKlAIVQcmCgomNMr9cUg?view` | 200 | **整個 `<li>` 移除** |
| E2 | `Footer.tsx:31–35` | GitHub 原始碼 | `https://github.com/g0v/Welcome-to-Add-C0urt` | **404** | `https://github.com/ipaaa/constitution`（實測 200） |
| E3 | `Footer.tsx:36–40` | 內容錯誤回報 (Feedback) | `https://github.com/g0v/Welcome-to-Add-C0urt/issues/new` | **404** | `https://github.com/ipaaa/constitution/issues/new`（見第二節） |
| N1 | `Footer.tsx:47` | T1. 過去：時光機 | `/past` | 200 | 不變 |
| N2 | `Footer.tsx:48` | T2. 現在：熱搜榜 | `/present` | 200 | 不變 |
| N3 | `Footer.tsx:49` | T3. 未來：載入中 | `/future` | 200 | 不變 |
| N4 | `Footer.tsx:50` | 爭議時序懶人包 | `/controversy-timeline` | 200 | 不變 |

結論：captain 說「很多是錯的」，實測壞掉的是 E2、E3 兩個（404）。E1 還活著，但依裁示移除。
四個站內連結都正常。`g0v/Welcome-to-Add-C0urt` 這個 repo 在 GitHub 上不存在
（`gh api repos/g0v/Welcome-to-Add-C0urt` 回 404），所以不是改名轉址，是整個不見了。

### 二、內容錯誤回報的目的地

**選 `https://github.com/ipaaa/constitution/issues/new`。**

- `gh repo view ipaaa/constitution --json hasIssuesEnabled,visibility,isArchived` 回傳
  `hasIssuesEnabled: true`、`visibility: PUBLIC`、`isArchived: false`。
- repo 沒有 `.github/` 目錄（`gh api repos/ipaaa/constitution/contents/.github` 回 404），
  所以沒有 issue template。`issues/new/choose` 沒有意義，不用它。
- 未登入的人點 `issues/new`，GitHub 回 302 轉到登入頁，登入後自動回到開 issue 的畫面
  （轉址網址帶 `return_to=…/ipaaa/constitution/issues/new`，`curl -L` 最終 200）。
  這是 GitHub 的正常行為，所有 repo 都一樣。
- 不選 `/issues`（清單頁）：讀者要多點一次「New issue」。錯誤回報要的是直接開單。
- 不預填 `?title=` 或 `?labels=`。repo 目前沒有對應 label，預填只會增加維護面。

### 三、全站盤點（頁尾以外）

- `grep -rniE 'Welcome-to-Add-C0urt|hackmd' src public next.config.* package.json README.md`：
  命中 4 行，全部在 `src/components/Footer.tsx`（27、28、32、37）。`public/`（含 `pitch.html`）0 筆。
- 全站外部連結（`src/**/*.ts{,x}`）另有：司法院、全國法規資料庫、鏡週刊、LINE／Facebook／Twitter 分享、
  `ContributorGrid.tsx` 的 `github.com/${contributor.github}`。這些都不是舊 repo 或 HackMD，不在本票範圍。
  `ContributorGrid.tsx` 屬 `052`。
- `Footer` 只在 `src/app/layout.tsx:51` 掛載一次，位於 `LaunchGate` 之外，所以每一頁都有同一份頁尾。
  改一個檔就涵蓋全站。

### 四、頁尾上不是連結、但 captain 可能也算「錯」的地方（本票不改，請 captain 裁示）

| # | 位置 | 內容 | 問題 |
|---|---|---|---|
| T1 | `Footer.tsx:19` | `© {年份} G0V CONTRIBUTORS` | repo 在 `ipaaa` 帳號下，不在 g0v 組織。署名是否仍寫 g0v，需要 captain 決定。 |
| T2 | `Footer.tsx:17` | 「這是一個開源的公民科技專案」 | repo 沒有 LICENSE 檔（`gh api repos/ipaaa/constitution --jq .license` 為 `null`）。沒有授權條款，法律上不算開源。 |
| T3 | `Footer.tsx:47–50` | 快速導覽只列 4 頁 | `/opinion-lazybag`、`/about`、`/quiz` 沒列。現有 4 個連結都正常，這是漏列，不是錯連。 |

建議：本票只做 captain 已裁示的連結修正。T1–T3 另開票或由 captain 口頭裁示後併入。
這三項都是文字改動，改錯可以退回。

### 五、元件與改動

`Footer`（`src/components/Footer.tsx`，client component，無 props）。職責不變：顯示專案簡介、資源連結、站內導覽。

改動：

1. 刪除 HackMD 的 `<li>`（現 26–30 行，共 5 行）。
2. 第 32 行 `href` 改為 `https://github.com/ipaaa/constitution`。
3. 第 37 行 `href` 改為 `https://github.com/ipaaa/constitution/issues/new`。
4. 第 4 行 import 移除 `FileText`（刪 HackMD 後不再使用，否則 eslint 報未使用）。

`aria-label`、`target="_blank"`、`rel="noopener noreferrer"`、hover 顏色全部保留。

資料需求：無。不新增型別。兩個網址直接寫在 JSX，與現行寫法一致。
只有兩個網址，抽成常數模組沒有好處。

### 六、版面（移除 HackMD 之後）

外層 class 不改。「專案資源」欄從 3 項變 2 項。

- **手機（< 768px）**：`grid-cols-1`。簡介區在上；下方「專案資源」與「快速導覽」以 `flex-col gap-8` 上下排列。
  「專案資源」剩「GitHub 原始碼」「內容錯誤回報」兩列，高度少一列（約 32px）。無其他變化。
- **桌機（≥ 768px）**：`md:grid-cols-3`。簡介佔 1 欄，右側 2 欄以 `md:flex-row md:justify-end md:gap-16` 並排
  「專案資源」與「快速導覽」。兩欄頂端對齊；「專案資源」2 列，「快速導覽」4 列。
  現況已是 3 列對 4 列不等高，所以不等高不是新問題，不需補 class。

## Risk evidence

| 風險 | 證據 | 處置 |
|---|---|---|
| 新目的地不存在 | `curl https://github.com/ipaaa/constitution` → 200；`/issues` → 200 | 無 |
| Issues 沒開，回報連結 404 | `gh repo view … --json hasIssuesEnabled` → `true` | AC-3 在 verify 重測；日後關閉 Issues 會讓 AC-3 失敗 |
| 讀者沒有 GitHub 帳號就不能回報 | `issues/new` 未登入 → 302 到 `github.com/login` | captain 已裁示指向 GitHub，接受此限制。列入 gate 讓 captain 知悉 |
| 只看 SSR HTML 會假通過 | `LaunchGate.tsx:30` 在 hydration 前回 `null`（`066` 第八節）。`Footer` 在 `LaunchGate` 之外，SSR 已含頁尾；但 AC 仍要求 hydration 後量測 | AC-1 以瀏覽器量測 hydration 後 DOM |
| 其他頁面還有舊連結 | `grep` 全站 4 行命中，全在 `Footer.tsx` | AC-2 以原始碼 `grep` 與多頁 DOM 量測雙重確認 |
| repo 公開但 `layout.tsx` 設 noindex | 本票不動 `layout.tsx` 的 `robots` | 無 |

design 階段未能在本機跑 hydration 後量測：本 agent 的沙箱無法存取 `/Applications` 的瀏覽器，
repo 也沒有 jsdom／playwright。以 SSR 取得的現況頁尾（`localhost:3068` 的 `/`、`/about`、`/quiz`、
`/opinion-lazybag`、`/future` 各含 1 行舊連結）作為基準線。verify 必須用真瀏覽器補足，見 Test plan。

## Expected surface and tolerance

| 檔案 | 預期改動 | 容許 |
|---|---|---|
| `src/components/Footer.tsx` | 刪 5 行（HackMD `<li>`）、改 2 行 `href`、改 1 行 import | 淨變化 −5 行，容許 ±2 行 |

其他檔案 0 行。`src/data/*.json` 必須不變（sha256 前後相同）。改到第二個原始碼檔就是超出範圍。

語意變化：頁尾少一個外部連結；兩個外部連結從 404 變成可用。站內導覽不變。

## Acceptance criteria

**AC-1（端值）— hydration 後，頁尾每一個外部連結都指向存在的目的地，且只有兩個。**
Verified by: `npm run dev` 後以真瀏覽器（Claude in Chrome 或內建瀏覽器）開 `/`，等 hydration 完成，
執行 `[...document.querySelectorAll('footer a[href^="http"]')].map(a => a.href)`。
結果必須恰為 `["https://github.com/ipaaa/constitution", "https://github.com/ipaaa/constitution/issues/new"]`。
再對每個網址跑 `curl -sL -o /dev/null -w '%{http_code}'`，兩個都必須是 `200`，且都不可是 `404`。
會讓它失敗的改動：把任一 `href` 留在 `g0v/Welcome-to-Add-C0urt`（404），或留下 HackMD `<li>`（陣列變 3 項）。

**AC-2（端值）— 全站沒有 `g0v/Welcome-to-Add-C0urt` 或 `hackmd` 連結。**
Verified by: (a) `grep -rniE 'Welcome-to-Add-C0urt|hackmd' src public` 輸出 0 行（現況 4 行）。
(b) 用 AC-1 的瀏覽器依序開 `/`、`/past`、`/present`、`/future`、`/controversy-timeline`、`/opinion-lazybag`、`/about`、`/quiz`，
hydration 後執行 `[...document.querySelectorAll('a')].filter(a => /Welcome-to-Add-C0urt|hackmd/i.test(a.href)).length`，每頁都必須是 `0`。
會讓它失敗的改動：任一頁面或元件留下舊 repo 或 HackMD 網址。

**AC-3 — 內容錯誤回報指向開了 Issues 的 repo。**
Verified by: `gh repo view ipaaa/constitution --json hasIssuesEnabled` 回 `true`；
`curl -s -o /dev/null -w '%{redirect_url}' https://github.com/ipaaa/constitution/issues/new` 的輸出含 `return_to=` 與 `ipaaa%2Fconstitution%2Fissues%2Fnew`。
會讓它失敗的改動：repo 關閉 Issues（`issues/new` 會變 404），或 `href` 指到別的 repo。

**AC-4 — 站內導覽不受影響。**
Verified by: hydration 後 `[...document.querySelectorAll('footer a:not([href^="http"])')].map(a => a.getAttribute('href'))`
等於 `["/past","/present","/future","/controversy-timeline"]`（全站模式）；各路徑 `curl` 回 200。
會讓它失敗的改動：誤刪或改動導覽 `<li>`。

**AC-5 — 版面在手機與桌機都正常。**
Verified by: 瀏覽器視窗寬 375px 與 1280px 各截一張頁尾圖。375px：「專案資源」在「快速導覽」之上，各項不橫向捲動
（`document.documentElement.scrollWidth <= innerWidth`）。1280px：兩欄並排、頂端對齊。「專案資源」欄只有 2 項。
會讓它失敗的改動：改動外層 grid／flex class，或殘留空的 `<li>`。

**AC-6 — 型別檢查、lint 與建置通過，資料檔不變。**
Verified by: `npx tsc --noEmit` exit 0；`npx eslint --max-warnings 0 src/components/Footer.tsx` exit 0（改前實測 exit 0）；`npm run build` 成功；
`shasum -a 256 src/data/*.json` 前後相同。會讓它失敗的改動：保留未使用的 `FileText` import（eslint 警告），或動到 `src/data/*.json`。

## Test plan

1. `grep -rniE 'Welcome-to-Add-C0urt|hackmd' src public`：改前 4 行，改後 0 行（AC-2a）。
2. `npx tsc --noEmit`、`npx eslint --max-warnings 0 src/components/Footer.tsx`、`npm run build`（AC-6）。
3. `npm run dev`。主 repo 的 `.next/dev/lock` 可能被其他 ensign 佔用；衝突時照 `066` 第八節做 scratchpad 副本，換 port 啟動。
4. 以真瀏覽器量測 AC-1、AC-2b、AC-4、AC-5。只看 `curl` 抓的 SSR HTML 不算通過。
5. `curl` 重測兩個外部網址與 `gh repo view`（AC-1、AC-3）。
6. 不執行 `npm run sync-content`。不動 `src/data/*.json`。

## Documentation impact

### 現在更新

無。`grep -rniE 'hackmd|Welcome-to-Add|頁尾|footer' docs/project docs/INDEX.md` 沒有描述頁尾連結的文件，沒有要先寫下的預定行為。

### 實作後更新

無。沒有任何 evergreen 文件記錄頁尾連結的目的地。本票 entity 本身即為紀錄。

### 不更新

- `docs/meetup-chats/`、`docs/constitution-features/_archive/*`、`docs/constitution-features/_debriefs/*`：`record`，提到 g0v 是歷史事實，不改寫。
- `docs/health-check/TODO.md`：提到 g0v 的是黑客松提案文件位置，與頁尾無關。
- `docs/constitution-features/052-contributors-placeholder.md`：屬 `052`，本票不碰。
- `README.md`：只有 Next.js 樣板連結，沒有舊 repo 或 HackMD。

### Feedback Cycles

## Out of scope

- `/about` 的貢獻者名單（`ContributorGrid.tsx` 以各人 GitHub 帳號組連結，屬 `052`）。

## Stage Report: design

- DONE: Inventory every external link in the footer and any other site-wide place that hard-codes the old repo (g0v/Welcome-to-Add-C0urt) or HackMD, checking each destination with a real HTTP request; specify the target for each per the captain's ruling (source → https://github.com/ipaaa/constitution, no HackMD, error report → the correct ipaaa/constitution reporting entry, confirming Issues is enabled).
  Proposed approach 第一至三節：頁尾 7 連結逐一 curl（E2、E3 為 404，E1 200 依裁示移除，站內 4 個 200）；全站 grep 4 行全在 `Footer.tsx`；`gh repo view` 確認 `hasIssuesEnabled: true`、PUBLIC；回報入口定為 `issues/new`（無 issue template）。
- DONE: Acceptance criteria each carry a falsifiable Verified by; the end value is measured on the rendered page after hydration: every footer external link resolves to an existing destination and no g0v/Welcome-to-Add-C0urt or hackmd link remains site-wide.
  AC-1 至 AC-6 各附 Verified by 與「會讓它失敗的改動」；AC-1、AC-2b 在真瀏覽器 hydration 後量測。design 階段沙箱無法啟動瀏覽器，僅以 SSR 取得基準線，已在 Risk evidence 註明。
- DONE: Specify the footer layout after removing HackMD (mobile and desktop) and split documentation impact into 現在更新 / 實作後更新 / 不更新.
  第六節描述 375px／1280px 版面，不改 class；文件影響：現在更新 無、實作後更新 無（附 grep 依據）、不更新 列 4 類。

### Summary

頁尾實際壞掉的是 GitHub 原始碼與內容錯誤回報兩個連結（舊 repo 已 404）；HackMD 仍可開但依裁示移除。改動只限 `src/components/Footer.tsx`（淨 −5 行 ±2）。另列三項非連結問題請 captain 裁示：`© G0V CONTRIBUTORS` 署名、repo 無 LICENSE 卻自稱「開源」、快速導覽漏列三頁；本票不改。
