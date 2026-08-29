---
session-date: 2026-08-28
sequence: 1
first-commit: 7edb30f
last-commit: bfc52d5
duration: ~2h (2026-08-28) ＋ 未記錄的 2026-05-01～05-07 尾段
---

# Session Debrief — 2026-08-28 #1

這份 debrief 補的是**四個月的空白**。上一份（2026-05-02 #1）寫在會期中途，其後 5/1–5/7 還有一大批工作從未被記錄，接著專案停擺三個半月。今天（8/28）因為要做 g0v 灣區 meetup 提案簡報而回到這個 repo，順手把它重新啟動。

範圍橫跨兩個 workflow：`docs/constitution-features` 與 `docs/design-assets`（後者從未有過 debrief，其活動一併記在這裡）。

## Shipped

**`docs/constitution-features`**

- **018** `018-quiz-materials` — [#28](https://github.com/ipaaa/constitution/pull/28) + [#29](https://github.com/ipaaa/constitution/pull/29)。互動測驗題組 B/C/D 與結果分享圖，含原生分享面板；最終 4 組共 21 題上線。

**`docs/design-assets`**（全部 approved 並封存）

- **004** `004-progressive-launch-evaluation` — 漸進上線機制評估。
- **005** `005-owl-placement-guide` — 貓頭鷹法官在各頁的擺放準則。
- **006** `006-quiz-result-share-images` — 測驗結果的 FB／IG 分享圖，8 張。
- **007** `007-ux-consultant-content-audit` — UX 顧問視角的全站內容體檢，是目前對網站現況最完整的一份診斷。
- **008** `008-owl-expression-set` — 貓頭鷹 15 種表情與姿勢。

**經 PR 落地但 entity 未收尾**（見 Issues）

- [#30](https://github.com/ipaaa/constitution/pull/30) `034-owl-placement` — 貓頭鷹全站視覺融入實作。
- [#31](https://github.com/ipaaa/constitution/pull/31) `035-ux-audit-must-fix` — UX 審計上線前必修項 A/B/E/K。

## Filed (backlog)

`docs/design-assets` 於 5/2 一口氣開了六張，其中五張同會期即完成並封存：

- **004** `004-progressive-launch-evaluation` — 同會期 shipped。
- **005** `005-owl-placement-guide` — 同會期 shipped。
- **006** `006-quiz-result-share-images` — 同會期 shipped。
- **007** `007-ux-consultant-content-audit` — 同會期 shipped。
- **008** `008-owl-expression-set` — 同會期 shipped。
- **009** `009-organize-public-owl-assets` — 整理 `public/` 內的貓頭鷹圖片資產；**仍停在 `review`**。

## Non-PR commits (workflow-only)

未經 PR、但值得留痕的：

- `7edb30f` 上一份 debrief 本身（2026-05-02 #1）—— 它是本次範圍的起點。
- `c0dd8b0` 新增 T1/T2 資料收集 SOP 與 031 的說明文件 —— 這份 `docs/data-collection-guide.md` 是今天判斷資料現況的主要依據。
- `1643145` / `f24685c` / `00f78a0` LaunchGate 與 `launch-status` 的三連修 —— 見 Issues，今天發現的鎖頁瑕疵源頭在此。
- `485735a` **[reverted]** T2 加「如果你只有 3 分鐘」導讀錨點。
- `27c7326` Revert 上述導讀（035 的 D 項因此至今未完成）。
- `aaf429c` 修正資產重整後 `/codex/` 圖片路徑失效。
- `e14cd14` 首頁 CTA 文案「查看癱瘓實況」→「查看憲法法庭危機現狀」。
- `f051bdb` 宣告 workflow 寫作規範（5/7，**當時未 push，今天才隨著提案簡報一起上遠端**）。
- `e2fe8bf` 新增 g0v 提案簡報至 `public/pitch.html`。
- `bfc52d5` 新增社群分享卡 `public/pitch-og.png` 與 og/twitter meta。

其餘為 `dispatch:` / `advance:` / `state:` 等常態狀態流轉，已被上方 PR 與 Shipped 涵蓋。

## Decisions

- **提案主軸選「網站與資料」而非「書」。** 書的形態尚未拍板（8/6 出版提綱是案例故事集、8/14 書籍大綱是停擺紀事，是兩本不同的書），台上講會被問倒。
- **簡報以靜態檔放 `public/pitch.html`**，不動任何 app 程式碼 —— 因此不受 LaunchGate 影響，也不需要新路由。
- **推 main 前先確認 Vercel 的 `TRACK_1_CSV_URL` / `TRACK_2_CSV_URL`**。確認變數存在後仍決定推，理由：正式站本來就一直是試算表驅動，重跑 sync 不是引入新行為；且 sync 失敗會回退 git 資料，最壞情況安全。
- **漫畫懶人包不放進簡報**（案號印錯，見 Issues），改列為任務板上的十分鐘入門任務。

## Issues — Workflow

1. **🔴 `003-comic-lazybag-114` 的案號印錯，而它仍掛在 `review`。**
   內容是 2024 國會職權修法（＝**113 憲判 9**），但成品圖上印的是「114年憲判字第1號」。`public/comic-lazybag/render-comic-lazybag-114.mjs` 有 **11 處**寫錯，FB／IG 十宮格／LINE 全套都帶著這個錯。
   交叉佐證：`src/data/opinions.ts` 對同一批爭點標的是 `rulingRef: '113年憲判字第9號'` —— **repo 內部自相矛盾**。
   `/opinion-lazybag` 頁面描述也寫「114年憲判字第1號」，但它讀的資料是 113 憲判 9。
   → 這正是本專案先前記錄過的 AI 幻覺類錯誤，且**通過了 review 階段沒被攔下**。

2. **PR 落地但 entity 沒收尾。** #30（034）與 #31（035）都已 merge，但兩張 entity 至今仍停在 `implement`。workflow 狀態與 git 狀態分岔。

3. **`035-ux-audit-must-fix` 的 checklist 全未打勾，但實際完成度不一。** 對照 git：A／B／E／K 已 merge；D 做完後被 revert（`27c7326`）；**C（About placeholder）與 F（「15→5」社群主視覺）從未做**。C 卡在需要 captain 補 `docs/about-content.md`，F 卡在需要設計人力。

4. **LaunchGate 兩種模式都達不到設計意圖。**
   `LaunchGate.tsx` 判斷 `isPublicMode ? LAUNCHED_PAGES : ALL_PAGES`，而 `LAUNCHED_PAGES` 自身又取決於 `NEXT_PUBLIC_PUBLIC_MODE`：env 未設 → 兩個分支都等於 `ALL_PAGES`，`?public=true` 鎖不住任何頁；env 設為 true → `isPublicMode` 被強制 true，團隊自己也看不到內頁。
   源頭可追到本會期的 `1643145 fix: default LAUNCHED_PAGES to all pages (team mode)`。

5. **雙軌真相來源未解。** `npm run build` 會先跑 `sync-content.mjs`，用 Google 試算表覆寫 `history.json` 與 `discussions.json`。0416 會議 agenda 已警告過，至今無解。今天推 main 前重新評估：sync 有 env 防護、失敗會回退 git 資料，風險可接受但問題仍在。

6. **`/about` 對讀者外洩內部路徑。** 線上會顯示「（專案緣由文案撰寫中，請參閱 docs/about-content.md）」。UX 顧問報告標為「目前最大信任缺口」。

7. **今天的工作完全繞過了 workflow。** `pitch.html` 與 og 卡沒有 entity、沒有 stage、沒有 review，直接 commit 進 main。以本次規模（單一靜態檔）這是合理的，但值得記一筆：workflow 的紀錄裡看不到今天發生過什麼。

8. **殘枝未清。** 13 個本地分支、30+ remote 分支全是 `spacedock-ensign/*`；`.worktrees/` 剩兩個 5 月初的空殼（`014-opinion-lazybag`、`015-opposing-views-integration`）。

9. **孤兒元件。** `src/components/opinion-lazybag/` 底下 `OpinionScatterPlot.tsx`（293 行）等六個元件做好了但沒有任何頁面 import —— feature 014 的產物，被 027 redesign 換掉後沒清也沒接。

## Issues — Spacedock

None identified.（今天沒有經由 Spacedock 流程執行工作，因此沒有框架層面的觀察。）

## Observations

- **停擺不是因為做不完，是因為沒人回來。** 網站 10 條路由、8 條完整可用，450 個 commit 集中在三個月。真正的斷點是 5/7 之後沒有下一次 session。今天的兩個 commit 是三個半月來第一次動靜。
- **規劃文件與實作嚴重脫節。** `憲庭加好友文件` 8/6 的待辦清單把「網站」列為 10%、ipa 的任務欄寫「vibe coding 網站」—— 但網站早在 5 月就已上線且大致完成。**團隊在計畫一個已經存在的東西。** 這是本次最重要的發現。
- **兩條線獨立撞上同一個數字 473。** repo 的 `REAL_TOTAL_PENDING = 473`；文件的《讀物清單》寫「473 件卡關案背後有四百多組人，但沒有任何一則報導是從他們的角度寫的」。這個巧合成了提案簡報的骨幹。
- **review 階段擋不住事實錯誤。** 003 的案號錯誤通過了 review。事實查核若不指定「逐項比對案號／日期／人名與一手來源」，review 容易只看形式完整度。
- **目測不可信。** 產 og 卡時我目測以為亮了 6 個席位，用像素取樣查每個圓心才確認是 5 個。提案素材上的數字錯誤代價很高，值得每次都用機械方式驗一次。
- **`docs/design-assets` 從未有過 debrief**，5 月那批工作差點就永遠沒有紀錄。建議下次為它單獨補一份，或明確決定它的紀錄併入此處。

## Agent Testimonial

- Date: 2026-08-28
- Harness/runtime: Claude Code
- Model: Claude Opus 5 (1M context)
- Model version/build: unknown
- Session scale: 0 workflow entities touched（今日工作繞過 workflow）；2 workers dispatched（兩名 Explore 調查員）；0 PRs（2 次直接推 main）

今天幾乎沒有用到 Spacedock 的執行機制 —— 沒有 dispatch entity、沒有走 stage、沒有開 gate。它在本次會期真正發揮作用的是**紀錄面**：`_debriefs/`、entity 的 stage report、`035` 的 checklist、以及 `_archive/` 裡那份 UX 顧問報告，構成了一份可查的專案史。我今天能在十幾分鐘內判斷「網站做到哪、哪些 feature 卡在哪、為什麼卡」，靠的全是這些留存物，而不是讀程式碼。對一個停擺三個半月的專案，這個價值很具體。

摩擦也很真實。第一，**紀錄與現實會分岔**：#30／#31 已 merge 但 entity 還停在 `implement`，`035` 的 checklist 一格未勾但實際上多數已做 —— 我必須拿 git log 去校正每一條 checklist，紀錄反而成了需要驗證的對象。第二，**stage 通過不等於內容正確**：003 帶著錯誤案號通過 review 並封存，流程給了它「已審核」的外觀。第三，**這種零散工作不值得開 entity**：今天做的是一個靜態檔加一張圖，走完整流程的成本高於收益，於是我繞過了 —— 結果就是 workflow 的紀錄裡看不到今天，而這正是紀錄分岔的來源。這不是工具的缺陷，是「什麼該進流程」這條界線本身難劃。

沒有 Spacedock 的話，今天大概會這樣：直接讀程式碼推測狀態，遺漏 LaunchGate 的修補史與 035 的 revert，也不會發現 003 是「通過 review 的錯誤」而只當成一個 bug。結論會更淺，而且我不會知道自己漏了什麼。

## What's Next

**急（提案相關）**

- 開瀏覽器實際點過網站一輪，確認 LaunchGate 的線上鎖頁狀態與 demo 路線（提案第 4 頁全靠實機操作）。
- 修 `003-comic-lazybag-114` 的案號（腳本 11 處 ＋ `/opinion-lazybag` 頁面描述），然後才能讓它離開 `review`。

**Gate／收尾待處理**

- `034` 與 `035`：PR 已 merge，entity 需推進到 done 或明確記錄剩餘項（035 的 C／D／F）。
- `009-organize-public-owl-assets`、`001-owl-mascot-unification`：停在 `review`。

**Dispatchable（constitution-features）**

- `012-threshold-case-analysis`（0.8）— 需要慧婕的歷史資料。
- `019-opposing-views-overview-page`（0.7）— 需要允鍾整理的反方意見內容。
- `031-data-collection-process-doc`（0.7）
- `016-case-keyword-classification`（0.65）— 原本卡在「等 Ronny 的爬蟲團隊」；**提案的頭號任務卡就是這件事**。
- `036-ux-audit-improvements`（0.5）

**Dispatchable（design-assets）**

- `002-social-media-visuals`（0.7，仍在 `brief`）— 即「15→5」社群主視覺，**提案任務板上的三張 ★ 之一**。8 篇貼文文案已備好，整包卡在這張圖。

**技術債**

- LaunchGate 鎖頁邏輯（兩種模式皆失效）。
- 試算表 vs git 的雙軌真相來源。
- 清理 30+ 條 `spacedock-ensign/*` 殘枝與兩個空 worktree。
- 接回或刪除 `opinion-lazybag` 的六個孤兒元件。
- `README.md` 仍是 create-next-app 樣板；`contributors.ts` 六人全是佔位假名。
