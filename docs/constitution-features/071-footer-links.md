---
id: 071
title: 頁尾連結指向錯誤的 GitHub 與 HackMD
status: verify
source: captain 2026-09-29（聊天中直接要求開票）
started: 2026-09-29T20:11:16Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-071-footer-links
issue:
pr:
mod-block:
gates:
    version: 1
    records:
        - id: gate:071:verify
          stage: verify
          attempts:
            - id: gate-attempt:071-verify-1
              briefing:
                id: briefing:071:verify:attempt-1:revision-1
                digest: sha256:3cfb0186fdc6ad252b63b6500e23420f316f943188bb1e28e908b39eb7e66284
                room-ref: '@review/verify/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:071:verify:1
                briefing: briefing:071:verify:attempt-1:revision-1
                by: person:captain
                at: "2026-09-29T20:31:38.195703Z"
                decision: approve
                reason: 'Captain approved 071 verify in chat 2026-09-29 (「全部照建議」): footer links to ipaaa/constitution verified by HTTP and hydration probe. Captain did not explicitly report the 375px/1280px visual check; approval given per FO recommendation.'
              application:
                target-stage: review
                state: consumed
            - id: gate-attempt:071-verify-2
              briefing:
                id: briefing:071:verify:attempt-2:revision-1
                digest: sha256:bca261b09dc6e4c5910fbddf2d1be6a686e15a7b14a3178f88844d7552045376
                room-ref: '@review/verify/briefing-2'
              resolution:
                type: Resolution
                id: resolution:spacedock:071:verify:2
                briefing: briefing:071:verify:attempt-2:revision-1
                by: person:captain
                at: "2026-09-29T22:06:35.544093Z"
                decision: approve
                reason: Captain approved 071 verify (rework cycle) in chat 2026-09-29, including implement's dated addendum rewording AC-4 selector, AC-5 item count (3) and LOC tolerance (+7/−7). Captain did not explicitly report the 375px email-label visual check.
              application:
                target-stage: review
                state: consumed
        - id: gate:071:review
          stage: review
          attempts:
            - id: gate-attempt:071-review-1
              briefing:
                id: briefing:071:review:attempt-1:revision-1
                digest: sha256:b4262b8b9e622c895ed0c55d070896666df3504535868aa8c479dcc6b29b114b
                room-ref: '@review/review/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:071:review:1
                briefing: briefing:071:review:attempt-1:revision-1
                by: person:captain
                at: "2026-09-29T20:48:18.039626Z"
                decision: approve
                reason: 'Captain approved 071 review in chat 2026-09-29 (「1235照建議」): footer links to ipaaa/constitution, HackMD removed.'
              application:
                target-stage: complete
                state: superseded
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

**AC-7（端值，implement cycle 2 新增）— 頁尾有 Email 回報，地址完全正確，兩個 GitHub 連結不變。**
captain 2026-09-29 要求加入 Email 回報，給沒有 GitHub 帳號的讀者；地址為 `constitution.owl@gmail.com`，captain 已確認拼法。
Verified by: hydration 後，在 AC-2b 的 8 頁上各自檢查：
`footer a[href^="mailto:"]` 恰有 1 個，`href` 恰為 `mailto:constitution.owl@gmail.com`，可見文字與 `aria-label` 都含這個地址；
且 `footer a[href^="http"]` 仍恰為 AC-1 的兩個 GitHub 網址。8 頁全部符合才算通過。
會讓它失敗的改動：地址拼錯（例如 `ow1`），或刪掉 Email `<li>`。兩者都已在 implement cycle 2 實測，8 頁都判定失敗。

> **補述（2026-09-29，implement cycle 2）：Email 回報對 AC-4、AC-5 與容許範圍的影響。**
> 原 AC-4、AC-5 與「Expected surface and tolerance」寫於加入 Email 之前。原文保留，不改寫。新事實如下：
> - AC-4 的選擇器 `footer a:not([href^="http"])` 現在也會選到 `mailto:` 連結，結果會多一項。
>   站內導覽本身沒變。要量站內導覽，改用 `footer a[href^="/"]`，結果仍為 `["/past","/present","/future","/controversy-timeline"]`。
> - AC-5 的「『專案資源』欄只有 2 項」現在應為 3 項：GitHub 原始碼、內容錯誤回報、Email 回報。
> - 容許範圍「淨 −5 行 ±2」只涵蓋 cycle 1。cycle 2 另加 5 行 `<li>`、改 1 行 import。相對 `main`，`Footer.tsx` 為 +7／−7，淨 0 行。
> 以上三點是否正式改寫 AC，由 captain 決定。

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

## Stage Report: implement

- DONE: Change only src/components/Footer.tsx per the design: remove the HackMD link, point GitHub 原始碼 to https://github.com/ipaaa/constitution and 內容錯誤回報 to https://github.com/ipaaa/constitution/issues/new, keeping existing classes and accessible labels consistent.
  `35180e4`：只改 `Footer.tsx`，+3／−8（淨 −5，在容許 ±2 內）。刪 HackMD `<li>`、改 2 個 `href`、import 刪 `FileText`。`aria-label`、`target`、`rel`、class 都不變。© 行、「開源」文字、快速導覽都沒動。
- DONE: Prove AC-1..AC-6 with their stated failing changes; the end value is measured on the rendered page after hydration (dev server or jsdom-mounted probe, not SSR HTML alone): every footer external link returns an existing destination by real HTTP request and no g0v/Welcome-to-Add-C0urt or hackmd string remains site-wide.
  量測工具：本機沙箱開不了瀏覽器（`/Applications` 不可讀）。改用 jsdom probe：對 `next start` 載入 8 頁，執行頁面自己的 JS bundle，等 `<footer>` 出現 `__reactFiber$` 鍵（即 React 已 hydrate）才讀 DOM。probe 放在 scratchpad，不進 repo。
  AC-1／AC-2b／AC-4：8 頁（`/`、`/past`、`/present`、`/future`、`/controversy-timeline`、`/opinion-lazybag`、`/about`、`/quiz`）hydration 後，頁尾外部連結都恰為 `[ipaaa/constitution, ipaaa/constitution/issues/new]`，舊連結 0 個，站內導覽恰為 4 個路徑，頁面錯誤 0 個。失敗改動實測：退回改前程式碼重建，同一 probe 8 頁都讀到 3 個外部連結、舊連結 3 個。
  AC-1 HTTP：`ipaaa/constitution` 200；`issues/new` 302 到登入頁、`-L` 最終 200。舊的兩個網址都是 404。站內 4 個路徑 `curl` 都是 200。
  AC-2a：`grep -rniE 'Welcome-to-Add-C0urt|hackmd' src public` 改前 4 行，改後 0 行。
  AC-3：`gh repo view` 回 `hasIssuesEnabled:true`、PUBLIC、未封存。`redirect_url` 含 `return_to=` 與 `ipaaa%2Fconstitution%2Fissues%2Fnew`。
  AC-5 只驗了結構：「專案資源」剩 2 個 `<li>`，空 `<li>` 0 個，外層 class 沒改（見 diff）。jsdom 不算版面，所以 375px／1280px 截圖與 `scrollWidth` 量測**沒有做**，要留給 verify 用真瀏覽器做。
  AC-6：`npx tsc --noEmit` exit 0；eslint `--max-warnings 0` exit 0。失敗改動實測：把 `FileText` 放回 import，eslint 報 `'FileText' is defined but never used` 並失敗。`npm run build` 成功。`src/data/*.json` 的 sha256 前後相同。
- DONE: No regressions: full test suite (report any pre-existing failure separately), npx tsc --noEmit; do not touch the © line, LICENSE wording or quick-nav list (captain decisions pending); never run npm run sync-content.
  `node --test tests/*.test.mjs`：101 個測試，99 通過、1 失敗、1 略過。失敗的是既有問題：`threshold-analysis.test.mjs` AC-7「寫出產線兩檔的程式不只同步程式一支」。拿掉本票改動再跑，同樣失敗（31 通過／1 失敗），與本票無關，`068` 分支已修。沒有執行 `sync-content`。

### Summary

頁尾現在只剩兩個外部連結，都指向 `ipaaa/constitution`，真實 HTTP 請求可以開；HackMD 已移除；全站找不到舊 repo 或 HackMD。這些結果是在 8 頁 hydration 後的 DOM 上量到的。用改前程式碼重建再量，probe 會讀到舊連結，所以這個量測分得出對錯。有一項沒做完：AC-5 的截圖版面檢查。jsdom 沒有版面引擎，這一項要留給 verify 用真瀏覽器做。本機建置時用 symlink 接上主 repo 的 `node_modules`，這個 symlink 在 `.gitignore` 內，不會進 commit。

## Stage Report: verify

- DONE: Verify every destination the branch ships by real HTTP request (github.com/ipaaa/constitution and its issues/new, and each internal footer route), and that no g0v/Welcome-to-Add-C0urt or hackmd string remains site-wide (src and public); run the placeholder scan over the diff.
  驗證對象：`35180e4`（HEAD `532e54c` 只多了報告）。未登入 `curl`：`ipaaa/constitution` 回 200。`issues/new` 回 302，轉到 `github.com/login?return_to=…ipaaa%2Fconstitution%2Fissues%2Fnew`，`-L` 最終 200。舊 repo 與舊 `issues/new` 都是 404。站內 4 個路徑在 `next start` 上都是 200。`grep -rniE 'Welcome-to-Add-C0urt|hackmd' src public` 0 行。全站 `github.com/` 只剩 Footer 的 2 個網址與 `ContributorGrid.tsx:30`（屬 `052`）。佔位字串掃描：diff 的新增行中，`某學者|某大學法律系|test|lorem ipsum|快速了解最新判決的5個重點` 共 0 筆。
- DONE: Independently re-run the hydration measurement on at least three pages (probe or dev server, not SSR HTML alone) and confirm the failing change (the pre-change Footer) is detected; confirm Issues is enabled and note for the captain that unauthenticated readers are sent to GitHub login.
  量測工具：自行寫的 jsdom probe，不沿用 implement 的 probe（只借用 scratchpad 內已安裝的 jsdom）。它向 `next start` 取 8 頁，執行頁面自己的 JS，等 `<footer>` 出現 `__reactFiber$` 鍵才讀 DOM。Chrome 無法使用：puppeteer 快取的 Chrome 147 與 headless-shell 在本機都一啟動就 SEGV，關掉工具沙箱也一樣。8 頁結果相同：hydration 成功，頁尾外部連結恰為 `[ipaaa/constitution, …/issues/new]`，站內導覽恰為 `/past,/present,/future,/controversy-timeline`，舊連結 0，頁面錯誤 0。失敗改動對照：用 `git archive 1234c5e` 在 scratchpad 建出改前版本，另開 port 跑同一 probe。8 頁都讀到 3 個外部連結、3 個舊連結，所以這個量測分得出改前改後。`gh repo view`：`hasIssuesEnabled:true`、PUBLIC、未封存。**請 captain 知悉：沒有登入 GitHub 的讀者，點「內容錯誤回報」會先被帶到 GitHub 登入頁。沒有帳號的人無法回報。**
- DONE: Judge AC-5 layout: if no real browser is available, measure what can be measured (DOM structure, no empty list items, unchanged classes) and state plainly that the 375px/1280px visual check remains for the captain; confirm scope held (only Footer.tsx changed; © line, 開源 wording, quick-nav untouched; tsc, eslint, build pass; sync-content never run).
  可量的部分：hydration 後「專案資源」剩 2 個 `<li>`，頁尾空 `<li>` 0 個。diff 只有 `href`、import 與 HackMD 區塊的增刪，沒有 class 行變動。**375px 與 1280px 的畫面沒有看過。本機沒有能用的瀏覽器，這一項留給 captain 用手機與電腦各看一次頁尾。** 範圍：分支對 `main` 的合併基準只動 `Footer.tsx`（+3／−8）與本 entity。© 行、「開源」文字、快速導覽都沒動。`npx tsc --noEmit` exit 0；`npx eslint --max-warnings 0 src/components/Footer.tsx` exit 0；`npm run build` exit 0。`src/data/*.json` 的 sha256 前後相同。`node --test tests/*.test.mjs`：101 個，99 過、1 失敗、1 略過。失敗的是已知的 `threshold-analysis` AC-7（多列出 `tests/approval-content-version-binding.test.mjs`），`068` 已修，不算本票問題。本階段沒有執行 `sync-content`。

### Summary

**判定：PASSED。** 頁尾兩個外部連結都指向 `ipaaa/constitution`，真實請求可開；HackMD 已移除。全站原始碼與 8 頁 hydration 後的畫面都找不到舊 repo 或 HackMD。同一 probe 對改前版本會量到舊連結，所以結果可信。還剩兩件事要告訴 captain。第一，375px／1280px 的外觀沒有實際看過，請 captain 自己看一眼。第二，沒有 GitHub 帳號的讀者無法回報錯誤。

## Stage Report: review

- DONE: Review the Footer.tsx diff against the design: link targets, accessible labels, target/rel attributes, removed import, and layout classes unchanged; small-change fast path applies — scale checks to the diff.
  `git diff 1234c5e HEAD -- src` 只動 `Footer.tsx`（+3／−8，淨 −5，在 ±2 容許內）。HackMD `<li>` 整段刪除；兩個 `href` 改為 `ipaaa/constitution` 與 `…/issues/new`；import 只刪 `FileText`。兩個保留連結的 `aria-label`、`target="_blank"`、`rel="noopener noreferrer"`、`className` 逐字未變。外層 grid／flex class 沒有任何變動行。與設計第五節四項改動逐一相符，沒有多改。
- DONE: Check the ## Documentation impact rows (none expected) and that © line, 開源 wording and quick-nav are untouched.
  分支只動 `Footer.tsx` 與本 entity；`docs/INDEX.md` 0 行變動，沒有新增或刪除文件，所以不需更新索引。「現在更新／實作後更新：無」成立：本票沒有 repo 外步驟。`record` 文件都沒被改寫。`© … G0V CONTRIBUTORS` 行、「這是一個開源的公民科技專案」、快速導覽 4 個 `<li>` 都在未變動的上下文內。
- DONE: Confirm no regressions (tsc, eslint, build, the known pre-existing test failure only) and end with a clear PASSED or REJECTED verdict; note that the 375px/1280px visual check was approved by the captain without explicit confirmation.
  本 reviewer 重跑：`npx tsc --noEmit` exit 0；`npx eslint --max-warnings 0 src/components/Footer.tsx` exit 0；`npm run build` exit 0，產出的 `.next/server/app/index.html` 只含 `ipaaa/constitution` 與 `…/issues/new`，`hackmd` 0 筆；`grep -rniE 'Welcome-to-Add-C0urt|hackmd' src public` 0 行；`src/data` 對合併基準 0 差異。`node --test tests/*.test.mjs`：101 個，99 過、1 失敗、1 略過。唯一失敗是已知的 `threshold-analysis.test.mjs` AC-7（檢查同步程式清單，檔內無 footer 字樣，與本 diff 無關）。HTTP 重測：`ipaaa/constitution` 200；`issues/new` 302 → `github.com/login?return_to=…ipaaa%2Fconstitution%2Fissues%2Fnew`，`-L` 200；舊 repo 404。`gh repo view`：Issues 已開、PUBLIC、未封存。hydration 後 DOM 量測未重做，採信 implement 與 verify 兩份各自獨立的 probe（皆附改前版本對照）。**375px／1280px 外觀至今沒有任何人實際看過；captain 在 verify gate 核准時並未明確確認此項。**
- 觀察（非本票缺陷）：`git merge-tree HEAD main` 在本 entity 檔有衝突，來源是 `main` 上的 FO 記帳（`status`、`gates:`）與分支上的 stage report 同時修改同一檔。`Footer.tsx` 在 `main` 上自合併基準後沒有變動，程式碼合併無衝突。合併時由 FO 處理 entity 檔。

### Summary

**判定：PASSED。** diff 只改 `Footer.tsx`，四項改動與設計完全一致，無障礙屬性、新分頁屬性與版面 class 都保留；tsc、eslint、build 皆通過，測試只有已知的無關失敗，新連結實測可開。請 captain 知悉兩件事：頁尾在手機與電腦上的外觀仍未有人實際看過；沒有 GitHub 帳號的讀者無法使用「內容錯誤回報」。

## Stage Report: implement (cycle 2)

- DONE: Add an email reporting option to the footer next to 內容錯誤回報 for readers without a GitHub account, using exactly mailto:constitution.owl@gmail.com (captain 2026-09-29), with a visible label and aria-label consistent with the existing links; change only src/components/Footer.tsx.
  `b46c031`：「內容錯誤回報」下方新增 1 個 `<li>`，`href="mailto:constitution.owl@gmail.com"`。可見文字「Email 回報：constitution.owl@gmail.com」，`aria-label`「以 Email 回報內容錯誤（constitution.owl@gmail.com）」。沿用 lucide `Mail` 圖示與同一組 class。沒有加 `target="_blank"`：`mailto:` 開新分頁只會多出空白頁。可見文字直接寫出地址，沒有郵件程式的讀者也能抄。先以一般 merge 併入 `main`（`81b80ac`），entity frontmatter 取 `main` 版。
- DONE: Prove on the rendered footer after hydration (probe, several pages) that the email link is present with the exact address and the two GitHub links are unchanged; add an AC for it with a failing change (e.g. misspelled address or missing link must fail the check).
  新增 AC-7（Acceptance criteria 節）。jsdom probe 對全新啟動的 `next start` 量 8 頁：hydration 後都恰有 1 個 `mailto:constitution.owl@gmail.com`，可見文字與 `aria-label` 都含地址，GitHub 連結仍是那兩個，舊連結 0 個，頁面錯誤 0 個，probe exit 0。失敗改動實測：地址改成 `ow1` 重建，8 頁都 FAIL、exit 1；退回 cycle 1 無 Email 版重建，8 頁都 FAIL、exit 1。
- DONE: No regressions: tsc, eslint, build; © line, 開源 wording and quick-nav untouched; record the change as ## Stage Report: implement (cycle 2) with one evidence line per item; never run npm run sync-content.
  `npx tsc --noEmit` exit 0；eslint `--max-warnings 0` exit 0；`npm run build` 成功；`src/data/*.json` 的 sha256 與 `main` 相同。`git diff main` 沒有碰到 `G0V`、「開源」或 `LAUNCHED_PAGES` 這幾行。測試 101 個：99 通過、1 失敗、1 略過。失敗的是既有的 `threshold-analysis.test.mjs` AC-7，併入 `main` 後仍在，與本票無關。沒有執行 `sync-content`。

### Summary

頁尾「專案資源」現在有 3 項：GitHub 原始碼、內容錯誤回報（GitHub）、Email 回報（`constitution.owl@gmail.com`）。8 頁 hydration 後量到的地址完全正確。地址拼錯或缺少 Email 連結時，檢查都會失敗。**請 FO／captain 注意：** 加入 Email 後，原 AC-4 的選擇器會多選到 `mailto:`，原 AC-5 的「2 項」變成 3 項；我沒有改寫原 AC，只在 AC 節末追加補述。AC-5 的截圖版面檢查仍要由 verify 用真瀏覽器做。量測時發現 cycle 1 留下一個 `next start` 孤兒程序占住 port 3071。我已停掉它，改用全新啟動的伺服器重量，結果相同。

## Stage Report: verify (cycle 2)

- DONE: Verify the footer against the captain's ruling: exactly mailto:constitution.owl@gmail.com (character-by-character, captain-confirmed spelling), the two GitHub links unchanged and reachable by real HTTP, no HackMD or old repo site-wide; placeholder scan over the diff.
  驗證對象：`b46c031`（HEAD `da2ef23` 只多了報告）。`Footer.tsx` 內地址以 `od -c` 逐字元比對為 `c o n s t i t u t i o n . o w l @ g m a i l . c o m`，與 captain 確認的拼法相同；`href`、可見文字、`aria-label` 三處都用同一地址。`src` 內另一個 email 是 `PresentDetail.tsx:32` 的 `volunteer@addcourt.tw`，不屬本票。`gmail.com` 有 MX 紀錄；信箱本身是否存在，無法用 HTTP 驗證。
  未登入 `curl`：`ipaaa/constitution` 200；`issues/new` 302 到 `github.com/login?return_to=…ipaaa%2Fconstitution%2Fissues%2Fnew`，`-L` 最終 200；舊 repo 404。`gh repo view`：Issues 已開、PUBLIC、未封存。
  `grep -rniE 'Welcome-to-Add-C0urt|hackmd' src public` 0 行。建置產物 `.next/server/app/index.html` 含新地址，`hackmd`／舊 repo 0 筆。
  佔位字串掃描：`git diff main HEAD -- src` 的新增行中，`某學者|某大學法律系|test|lorem ipsum|快速了解最新判決的5個重點` 0 筆。
- DONE: Independently re-run the hydration measurement on at least three pages with your own probe and confirm the failing changes are detected (misspelled address, missing email link, old footer); judge implement's note that original AC-4's selector and AC-5's item count no longer match the 3-item footer — AC wording is the captain's, so report it as Needs decision rather than rewriting.
  量測工具：自寫 jsdom probe（scratchpad `071v3/footprobe.cjs`，不進 repo），不沿用前兩輪的 probe。對 `next start` 取 8 頁，執行頁面自己的 JS，等 `footer a` 出現 `__reactFiber$` 鍵才讀 DOM。檢查項目：`mailto:` 恰 1 個且等於正確地址、可見文字與 `aria-label` 含地址、`http` 連結恰為兩個 GitHub 網址、站內導覽恰 4 個、舊連結 0、「專案資源」3 項、空 `<li>` 0。
  hydration 判定分得出來：probe 初版缺 `TextEncoder`／`ReadableStream`，React 沒跑起來，8 頁都判「未 hydrate」並失敗。補上後才通過。
  候選版本：8/8 通過，頁面錯誤 0，exit 0。四個版本都從 `git archive HEAD` 建在 scratchpad，port 3371–3374。
  失敗改動實測（同一 probe）：地址改 `ow1` → 8/8 失敗（mailto 不符、文字／aria 不符），exit 1。刪 Email `<li>` → 8/8 失敗（mailto 0 個、「專案資源」2 項），exit 1。換回 `main` 的舊頁尾 → 8/8 失敗（外部連結 3 個含 HackMD 與舊 repo、舊連結 3 個），exit 1。
  建置方式註記：scratchpad 副本的 `node_modules` 是 symlink，Turbopack 拒絕（`Symlink node_modules is invalid`），所以四個副本都用 `next build --webpack`。worktree 本身用預設的 `npm run build`（Turbopack）另外建置，exit 0。
  Needs decision（AC 文字屬 captain，我沒有改）：(1) 實測原 AC-4 選擇器 `footer a:not([href^="http"])` 在候選版本回傳 5 項，第一項是 `mailto:`，依原文判定會失敗；站內導覽本身沒變，`footer a[href^="/"]` 恰為 4 個路徑。(2) 原 AC-5「『專案資源』欄只有 2 項」現為 3 項，依原文判定會失敗。(3) 容許範圍「淨 −5 ±2」只涵蓋 cycle 1；實測相對 `main` 為 +7／−7，淨 0。implement 的補述內容正確。建議 captain 核准以補述改寫這三處。
- DONE: Judge AC-5 layout honestly (no working browser: state the 375px/1280px check remains for the captain); confirm scope held (only Footer.tsx code change; © line, 開源 wording, quick-nav untouched; tsc, eslint, build pass; only the known pre-existing test failure); sync-content never run.
  **375px 與 1280px 的畫面沒有人看過。** `/Applications` 內找不到可用瀏覽器，jsdom 不算版面。可量的部分：「專案資源」3 項、空 `<li>` 0、外層 class 沒有變動行。
  Deferred risk（給 captain 看畫面時留意）：新項目的可見文字「Email 回報：constitution.owl@gmail.com」是整段不斷行的長字串，連結用 `flex` 不換行。375px 時內容寬約 327px，我估計剛好放得下，但沒有量過。頁尾有 `overflow-hidden`，放不下時會被截斷，不會出現橫向捲動。768px 左右的平板寬度，兩欄並排也會變擠。升級為 Material 的條件：captain 在手機上看到地址被截斷。
  範圍：`git diff main HEAD --stat` 只有 `Footer.tsx`（+7／−7）與本 entity。改動行是 import 與「專案資源」三個 `<li>`；© 行、「開源」文字、快速導覽都在未變動的上下文內。`npx tsc --noEmit` exit 0；`npx eslint --max-warnings 0 src/components/Footer.tsx` exit 0；`npm run build` exit 0。`src/data/*.json` 的 sha256 建置前後相同，且與 `main` 無差異。`node --test tests/*.test.mjs`：101 個，99 過、1 失敗、1 略過。唯一失敗是已知的 `threshold-analysis.test.mjs` AC-7「build 指令與寫出產線檔的程式都不得夾帶內容同步」，`068` 已修，不算本票問題。本階段沒有執行 `sync-content`。

### Summary

**判定：PASSED。** 頁尾現在有三個回報管道：GitHub 原始碼、GitHub 回報、Email `constitution.owl@gmail.com`。地址逐字元正確，兩個 GitHub 連結實測可開，全站沒有 HackMD 或舊 repo。我自寫的 probe 在 8 頁都通過；地址拼錯、少了 Email、換回舊頁尾三種改動都會被抓出來。需要 captain 決定一件事：原 AC-4、AC-5 與容許範圍的文字已不符現況，建議照 implement 的補述改寫。需要 captain 自己看一件事：手機與電腦上的頁尾外觀，特別是長 Email 地址在手機上有沒有被截斷。

## Stage Report: review (cycle 2)

- DONE: Review the rework diff (email reporting item) against the captain's ruling: exact mailto:constitution.owl@gmail.com, visible label and aria-label consistent with the other links, no target=_blank on mailto, classes unchanged; small-change fast path applies.
  `b46c031` 只在「專案資源」加 1 個 `<li>` 與 import `Mail`。`href` 恰為 `mailto:constitution.owl@gmail.com`；可見文字「Email 回報：constitution.owl@gmail.com」、`aria-label`「以 Email 回報內容錯誤（constitution.owl@gmail.com）」，格式與另兩項一致（中文說明＋括號補充）。沒有 `target`／`rel`，正確。`className` 與「內容錯誤回報」逐字相同（`hover:text-red-500 …`），外層 grid／flex class 沒有變動行。
- DONE: Confirm the captain-approved AC addendum (AC-4 selector, AC-5 three items, +7/−7 tolerance) matches the delivered footer, and ## Documentation impact still holds.
  自寫 jsdom probe（scratchpad `071r2/rprobe.cjs`，不進 repo）對 `next start` 量 8 頁，hydration 以 `__reactFiber$` 判定：`footer a[href^="/"]` 恰為 4 個導覽路徑；原 AC-4 選擇器回 5 項（首項 `mailto:`），與補述相符；「專案資源」3 項；`http` 連結恰為兩個 GitHub 網址；舊連結 0；頁面錯誤 0。8/8 通過，exit 0。失敗改動：地址改 `ow1` 重建，8/8 失敗，exit 1。`git diff main --stat`：`Footer.tsx` +7／−7，符合補述容許。
  Documentation impact 仍成立：除 `_archive` 內的 `record` 文件外，`docs/` 沒有描述回報管道或地址的文件；本票未新增或刪除文件，`docs/INDEX.md` 不需更新；本票沒有 repo 外步驟。
- DONE: Confirm no regressions (tsc, eslint, build; full suite should now be 0 fail after merging current main, which contains 068's fix) and end with a clear PASSED or REJECTED verdict; note the 375px email-label visual check was approved without explicit confirmation.
  先把 `main`（`dfa6170`）一般 merge 進分支，無衝突（`9f77791`）；合併後與 `main` 的差異只剩 `Footer.tsx` 與本 entity 的 `status` 欄（frontmatter 屬 FO，未改）。worktree 內 `node --test tests/*.test.mjs`：122 個，121 過、0 失敗、1 略過，exit 0（`threshold-analysis` AC-7 已由 `068` 修好）。`npx tsc --noEmit` exit 0；`npx eslint --max-warnings 0 src/components/Footer.tsx` exit 0；`npm run build`（Turbopack）exit 0，產物只含新地址與兩個 GitHub 網址、`hackmd` 0 筆；`src/data/*.json` sha256 建置前後相同，且與 `main` 無差異。建置在 scratchpad 副本進行，因為 captain 的 3071 預覽伺服器從本 worktree 執行，不能覆寫它的 `.next`。HTTP：兩個 GitHub 網址 `-L` 皆 200，`issues/new` 轉登入頁且帶 `return_to=…ipaaa%2Fconstitution%2Fissues%2Fnew`；Issues 已開、PUBLIC。**375px 手機畫面上長 Email 地址是否被截斷，至今沒有人實際看過；captain 核准時未明確確認此項。**

### Summary

**判定：PASSED。** Email 回報完全照 captain 裁示：地址逐字正確、標示與另兩項一致、`mailto:` 不開新分頁、class 未改。captain 核准的 AC 補述（導覽改用 `a[href^="/"]`、「專案資源」3 項、+7／−7）與實際頁尾相符。合併最新 `main` 後全部測試 0 失敗，型別、lint、建置都通過。唯一未確認的是手機寬度的外觀。3071 未動；本 reviewer 用的 3471 伺服器已停止。
