---
id: 069
title: 067 後續：查核工具自指舊路徑、綁進上線條件、紀年與閱讀順序入檔
status: review
source: 067 review R2 ＋ captain 2026-09-29 三項決定（聊天中裁示）
started: 2026-09-29T18:59:22Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-069-content-audit-followups
issue:
pr:
mod-block:
gates:
    version: 1
    records:
        - id: gate:069:verify
          stage: verify
          attempts:
            - id: gate-attempt:069-verify-1
              briefing:
                id: briefing:069:verify:attempt-1:revision-1
                digest: sha256:d0b7e41604f060c2d0873549f9050aa386eb6ee84d82cd62cc12f14659e48024
                room-ref: '@review/verify/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:069:verify:1
                briefing: briefing:069:verify:attempt-1:revision-1
                by: person:captain
                at: "2026-09-30T18:50:08.462617Z"
                decision: approve
                reason: 'Captain approved 069 verify in chat 2026-09-30 (「核准」): facts verified against sources incl. Judicial Yuan example; P3-8 two conditions, 056 line unchanged, G-7 PASS; 19 paths correct; M6 only /about:38. V-1 split to a new small ticket per captain.'
              application:
                target-stage: review
                state: consumed
        - id: gate:069:review
          stage: review
          attempts:
            - id: gate-attempt:069-review-1
              briefing:
                id: briefing:069:review:attempt-1:revision-1
                digest: sha256:ebecfe82064586767c360ec497710c165aa6424bdd526706b90405eb69ad02c5
                room-ref: '@review/review/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:069:review:1
                briefing: briefing:069:review:attempt-1:revision-1
                by: person:captain
                at: "2026-09-30T21:46:59.911354Z"
                decision: revise
                reason: 'Captain chose 2026-09-30 (「照建議，文字核准」) at review: R-1 fix with captain-approved AGENTS.md rule-4 text (P3-8 列出的全部解除條件); R-2 fix (example 114年1月23日（2025年1月23日） without spaces); fresh re-review.'
review-round:
    id: round:069:review:1
    stage: review
    cycle: 1
    briefing:
        id: briefing:069:review:round-1
        digest: sha256:c8d7a5394313da2f74a7f6811303b31267db42f431d851d55d962cf339e6a7cd
        room-ref: '@review/review/round-1'
---

`067`（PR #42）已合併並封存。它的 review 與 captain 在 gate 上的決定留下四件要落地的事，本票一次處理。

## Problem

1. **R2（review 的 Deferred risk，觸發條件已發生）**：`067` 封存後，查核工具的封存路徑規則 M6 會回報工具自己的檔。review 在副本上模擬封存，M6 由 1 變 6。指向 `067` 舊路徑的 7 處：`scripts/content-audit.mjs:5`、`:454`（寫在閱讀清單產生器內，之後每份快照都會帶舊路徑）、`scripts/fetch-judgment-dockets.mjs:4`、`docs/health-check/TODO.md:694`、`docs/content-audit/2026-09-29-reading-list.md:4`、`scripts/content-audit/units.mjs:4`、`tests/content-audit.test.mjs:8`。修完後 `check` 的 M6 應回到只剩 `/about:38` 那一處。
2. **綁進上線條件（captain 2026-09-29：「要綁」）**：在 `docs/health-check/TODO.md` 的 P3-8 另加一條解除條件：`node scripts/content-audit.mjs check` 全數通過（離開碼 0）才可移除 noindex。手動執行，不接 CI／build。**不可改動 `056` 引用的那一條**，`056` 的 G-7 必須仍印 `G-7 PASS`。
3. **全站紀年慣例（captain 2026-09-29：「紀年用西元」）**：寫進規格正本（`067` design 第十節的預設：敘述用西元；判決字號保留官方民國寫法；引用官方文字保留民國並括號附西元）。判決字號是否也改西元，captain 尚未明示；design 以預設「保留官方寫法」提出並標為待 captain 確認。L4 清單列出的不符處是後續內容修正的待辦，不在本票修。
4. **H 層閱讀順序（captain 2026-09-29）**：法學背景審閱者先讀三個 `PUBLIC_PAGES` 的來源檔。寫進閱讀清單的說明或產生器。

## Proposed approach

本票四件事都是文字與註解層的改動，外加閱讀清單產生器的一段輸出。不動任何渲染輸出，不動 `src/data/`。

**一、R2：7 處舊路徑改指封存位置。**
把下列 7 處的 `docs/constitution-features/systematic-chinese-content-legal-audit.md` 改為 `docs/constitution-features/_archive/systematic-chinese-content-legal-audit.md`。只改路徑字串。
封存是終點，封存後的路徑不會再移動，所以直接指 `_archive/` 就不會再斷。

| # | 位置 | 做法 | M6 掃得到 |
|---|---|---|---|
| 1 | `scripts/content-audit.mjs:5` | 檔頭註解，改路徑 | 是（INDEX 標 evergreen） |
| 2 | `scripts/content-audit.mjs:454` | 產生器輸出的字串，改路徑。之後每份快照都帶新路徑 | 是 |
| 3 | `scripts/fetch-judgment-dockets.mjs:4` | 檔頭註解，改路徑 | 是 |
| 4 | `scripts/content-audit/units.mjs:4` | 檔頭註解，改路徑 | 否（不在 INDEX） |
| 5 | `tests/content-audit.test.mjs:8` | 檔頭註解，改路徑 | 否（M6 不掃 `tests/`） |
| 6 | `docs/health-check/TODO.md:694` | 整條「優先級」子項改寫，見第二件事。改寫後不再引用舊路徑 | 是 |
| 7 | `docs/content-audit/2026-09-29-reading-list.md:4` | 以改好的產生器重新產生整份快照，見第四件事 | 是 |

**範圍追加（需 FO 認可）：`040` 的 3 處舊路徑。**
本階段在 `main`（`8a3d8d1`）實跑 `check`，M6 是 9，不是 review 說的 6。
多出的 3 處來自 `040` 今天的封存（`55959d6`）：`docs/content-pipeline/design.md:613`、`docs/health-check/TODO.md:892`、`:1072`。
不修這 3 處，AC-1 的端值「M6 只剩 `/about:38`」不可能成立。
改法相同：`../constitution-features/040-approval-content-version-binding.md` → `../constitution-features/_archive/040-approval-content-version-binding.md`。
FO 若不認可，AC-1 的端值改為「M6 恰為 `/about:38` 加上這 3 處」，其餘不變。

**二、P3-8 加第二條解除條件。**
在 `docs/health-check/TODO.md` 的 P3-8，緊接在既有的「**解除條件**（2026-09-21 加入）」那一行之後，插入一行：

```
- **解除條件二**（2026-09-29 加入，captain 決定）：手動執行 `node scripts/content-audit.mjs check`，須印出 `PASS` 且離開碼為 0。未通過，不可移除這一行。本條不接 CI 或 build。移除前把執行日期、commit SHA 與輸出末行記在本項
```

限制與理由：

- **新行不得含字串 `056-pre-launch-checklist`。** `056` 的 G-7 place2 數的是 P3-8 內同時含「解除條件」與該字串的行，必須恰為 1。新行只含「解除條件」，所以計數不變。本階段已實測，見 Risk evidence 第 2 點。
- **既有那一行一個字都不改。**
- 同一檔 P1-10 的「優先級」子項（`:693-695`）目前寫「是否綁進上線條件，待 captain 決定……決定前不動 P3-8」。captain 已決定，這三行改寫為：
  `- **優先級**：已綁進上線條件（captain 2026-09-29 決定）。見 P3-8 的解除條件二。M 層任一失敗，不可移除 noindex`
- `AGENTS.md` 第 4 條（noindex）目前只寫 `056` 的 G-1 至 G-8。它讀起來是完整條件，agent 只讀 AGENTS 就會漏掉第二條。在 `:66` 之後加一行：
  `另須通過 \`docs/health-check/TODO.md\` P3-8 的解除條件二（手動執行 \`node scripts/content-audit.mjs check\`，離開碼為 0）。兩項都通過，才可移除。`
  這一行也不含 `056-pre-launch-checklist`，G-7 place3 計數不變。
- `src/app/layout.tsx` 不動。它的註解已經指向 P3-8（`:7`），G-7 place1 要求 `056` 那行緊貼 `robots:`，插行會打破它。

**captain 要知道的後果**：綁定之後，P1-10 的第 1、2、3、6 項修好之前不能上線。這四項是今日 `check` 的全部失敗（M4 一項、M5 兩項、M6 `/about:38` 一項）。P1-10 的第 4 項（L1）與第 5 項（`068` 在修）不在 `check` 內，不擋上線。

**三、全站紀年慣例：正本放在新檔 `docs/project/content-conventions.md`。**
理由：

- 現有文件沒有一份管「站上文字怎麼寫」。`design-system.md` 管視覺，`068` 正在改它的 `:35` 節。`AGENTS.md` 的寫作規範管的是文件，不是站上文字。
- 紀年是第一條站上文字慣例，不會是最後一條。判決字號的寫法就是第二條候選。
- 這是唯一的正本。其他地方只放指向它的連結，不複製規則文字（沿用 `067` 第九節第 2 點）。

檔案內容（implement 照寫，狀態 `evergreen`，負責人 captain）：

1. 標題「站上文字慣例」，一句話說明範圍：站上讀者看得到的所有文字，含試算表同步進來的內容。
2. 「紀年」一節，三條規則，來源寫「captain 2026-09-29 決定」：
   - 敘述用西元。
   - 引用官方文字（判決、法條、公告原文）時保留民國，並在括號內附西元。
   - 判決字號：**暫行保留官方民國寫法**（例：`114年憲判字第1號`）。**captain 尚未確認**，確認後更新本條並刪除「暫行」。
3. 「怎麼查」一節，只引用代號：同一段混用而未換算由 `scripts/content-audit.mjs` 的 M5 抓；全站盤點看閱讀清單的 L4 節。目前不符處見 `docs/health-check/TODO.md` 的 P1-10。

指向正本的地方（只放連結）：

- `TODO.md` P1-10 的「另待 captain 決定：全站紀年慣例」子項（`:705-708`）改寫為：慣例已定，正本見 `docs/project/content-conventions.md`；判決字號待 captain 確認；L4 列出的不符處是待修項目。
- 產生器 L4 節的說明（`content-audit.mjs` 的「全站用哪一套是編輯決定，待 captain 拍板」）改為：「全站慣例見 `docs/project/content-conventions.md`。本表列出現況，不符慣例處是待修項目。」
- `docs/INDEX.md` 專案定位表加一列。

L4 列出的不符處不在本票修（Out of scope）。

**四、H 層閱讀順序：寫進產生器，再重新產生快照。**
產生器目前已把公開頁的檔排在前面，但只是排序，沒有說誰先讀什麼。改成兩個子表：

- H 節開頭加一行：「閱讀順序（captain 2026-09-29 決定）：法學背景審閱者先讀 H-1，再讀 H-2。」
- 再一行說明 H-1 的範圍：「H-1 是公開頁面（`PUBLIC_PAGES`：…）用到的檔，含全站共用的版面檔。」頁面清單照舊從 `src/data/launch-status.ts` 讀，不寫死「三個」。
- `### H-1 先讀：公開頁面的來源檔（N 檔，約 X 字）`，列「公開」為是的檔。
- `### H-2 後讀：其餘檔（N 檔，約 X 字）`，列其餘檔。
- 表格欄位不變。每個子表內仍依字數遞減。
- `isPublic` 的判定不變。`layout.tsx`、`Footer.tsx`、`Navbar.tsx`、`ComingSoon.tsx` 這類全站共用檔會進 H-1，因為公開頁上看得到它們的文字。

本階段在副本上試做：H-1 為 23 檔、約 6,736 字；H-2 為 44 檔、約 15,795 字。依 `067` 第四節的讀速估計，H-1 約需 40 分鐘。

快照處理：以改好的產生器**覆寫** `docs/content-audit/2026-09-29-reading-list.md`，檔名不變。

- 前提：覆寫前 `grep -c '\[x\]'` 必須為 0。今日為 0，沒有人開始勾選。若不為 0，停下回報，不得覆寫。
- 檔名保留，因為 `TODO.md` 與 `INDEX.md` 都指向它。檔名的日期代表這一輪查核的開始日；檔內第 1 行與第 3 行記實際產生日與 commit。
- 覆寫也會帶入 `a96c7c7` 之後站上內容的變動。這是重產快照的正常結果。

**Component hierarchy、Data requirements、響應行為：無。** 本票不動 React 元件、不加型別、不產生畫面。
唯一的程式邏輯改動是 `renderReadingList` 的 H 節輸出（第四件事）與 L4 節的兩行說明文字。

**被否決的方案：**

- 紀年規則寫進 `design-system.md`：與 `068` 的實作後更新撞同一檔，且視覺規範不是文字規範。
- 紀年規則寫進 `AGENTS.md`：AGENTS 是給 agent 的工作規範，編輯與試算表維護者不讀它；而且 `054` 正在改 AGENTS。
- 快照只改第 4 行：審閱者手上那份就看不到閱讀順序，而且內容會與任何一個 commit 的產生器輸出都對不上。
- 另開新檔名的快照並封存舊檔：要多改 `TODO.md` 兩處、`INDEX.md` 兩列與封存檔頭，換來的只是檔名日期正確。

### 要 captain 決定的事

**建議：判決字號照預設 A。另兩件請 FO 在 gate 上確認。**

1. **判決字號是否也改西元。** 不可逆程度：低，改文件即可，但選 B 要另開票改工具。
   - **A（預設，建議）保留官方寫法**：`114年憲判字第1號`。那是官方名稱，讀者拿去司法院網站查得到。工具不用改。
   - **B 改西元**：`2025年憲判字第1號`。這不是官方名稱，查不到。`check` 的 M1／M2 與清單的 L2 都把字號裡的年當民國解析，會誤報，要另開票改。
   - **C 官方寫法後括號附西元**：`114年憲判字第1號（2025）`。可查，也好讀。工具不用改，但站上現有字號要逐處補。
2. **範圍追加 `040` 的 3 處舊路徑**（Proposed approach 第一件事）。不加，AC-1 的端值不成立。
3. **`AGENTS.md` 加一行。** captain 說的是 P3-8，AGENTS 是順帶。不加，agent 只讀 AGENTS 時會以為 G-1 至 G-8 就夠。

## Risk evidence

以下都在本階段實跑。副本是 `git archive 8a3d8d1` 解開後的目錄，repo 本身未動。

1. **`main` 上 M6 是 9，不是 6。** `node scripts/content-audit.mjs check` 於 `8a3d8d1`：`FAIL M1=0 M2=0 M3=0 M4=1 M5=2 M6=9`，離開碼 1。
   9 處 = `067` 的 5 處（其餘 2 處 M6 不掃）＋ `040` 的 3 處 ＋ `/about:38`。`040` 的 3 處是今天封存 `040`（`55959d6`）造成的，review 當時還沒有。這就是「範圍追加」的依據。
2. **端值在副本上成立。** 在副本上做完第一、二件事（7＋3 處路徑、P3-8 新行、AGENTS 新行）後：
   - `check` 的 M6 只剩 `M6 src/app/about/page.tsx:38`；整體 `FAIL M1=0 M2=0 M3=0 M4=1 M5=2 M6=1`，離開碼 1（M4、M5 是 P1-10 的內容錯誤，預期仍在）。
   - P3-8 內含「解除條件」的行數為 2。
   - `056` 的 G-7 正本（`_archive/056-pre-launch-checklist.md:282-291`）印 `G-7 PASS [place1=1/1 place2=1 place3=1]`，離開碼 0。
   - 舊路徑 grep（排除 workflow 票目錄）零命中。
   - `node --test tests/content-audit.test.mjs` 16 過、0 失敗。
3. **G-7 的防線是可破的，所以這條 AC 有意義。** 在副本上把新行多加「（同 056-pre-launch-checklist）」，G-7 印 `G-7 FAIL: place2 … [count=2]`，離開碼 1。還原後回到 PASS。
4. **H 節拆成兩表不會打破既有 AC-9 測試。** 副本上試做第四件事，`node --test tests/content-audit.test.mjs` 仍 16 過。AC-9 的正規式抓的是 `## H ` 之後所有 `| [ ] |` 開頭的列，兩個子表都在其後。
5. **下一次封存還會再觸發 M6（殘留風險，不在本票修）。** 目前 M6 掃得到的文件裡，有三張進行中的票被引用：`019`、`064`（`docs/content-pipeline/design.md`）與 `049`（`docs/health-check/TODO.md`）。它們封存時，M6 會再各報一次。這是 M6 的本職，不是缺陷。建議 FO 在每次封存後跑一次 `check`，把 M6 當封存步驟的一部分。本票不改 workflow。
6. **與 `068` 的重疊：同檔不同段，無邏輯衝突。** `068` 的實作後更新會改 `TODO.md` P1-10 第 5 列（`:703`）、`INDEX.md` 的 `check-voided-floor.mjs` 列、`design-system.md` `:35` 節。本票改 `TODO.md` 的 `:693-695`、`:705-708`，離 `:703` 只有 2 至 8 行，合併時可能出現文字衝突。建議 `069` 的 implement 在 `068` 合併後從 `main` 開分支；若先開，合併前 rebase。本票不碰 `threshold-analysis` 相關的任何檔。
7. **與 `054` 的重疊：** `054`（design 中）計畫在 `AGENTS.md`「絕對不要做的事」加一條新禁令。本票只在第 4 條內加一行，不同段。`054` 的「把關機制現況總覽」應把 P3-8 解除條件二列為一道把關，由 `054` 自己決定。

## Expected surface and tolerance

Estimate: 約 +95／−25 行，跨 11 個檔（不含重產的快照），tolerance ±40%。

| 檔案 | 估計 | 內容 |
|---|---|---|
| `scripts/content-audit.mjs` | +20／−8 | `:5`、`:454` 路徑；L4 說明兩行；H 節拆 H-1／H-2 |
| `scripts/content-audit/units.mjs` | ±1 | `:4` 路徑 |
| `scripts/fetch-judgment-dockets.mjs` | ±1 | `:4` 路徑 |
| `tests/content-audit.test.mjs` | +15／−1 | `:8` 路徑；新增一條閱讀順序測試（AC-6） |
| `docs/project/content-conventions.md`（新） | +30 | 紀年正本 |
| `docs/health-check/TODO.md` | +4／−6，另 2 行只改路徑 | P3-8 新行；P1-10 兩個子項改寫；`040` 兩處路徑；變更紀錄一列 |
| `AGENTS.md` | +1 | 第 4 條加一行 |
| `docs/content-pipeline/design.md` | ±1 | `:613` 的 `040` 路徑 |
| `docs/INDEX.md` | +1，另改兩個查核日 | 專案定位表加一列；`content-audit.mjs` 列與 `AGENTS.md` 列的最後查核日 |
| `docs/content-audit/2026-09-29-reading-list.md` | 重產，不計入 LOC | 產生器輸出 |

**Semantics this may change:**

- `reading-list` 的輸出格式：H 節由一張表變兩張子表，多兩行說明。L4 節說明改兩行。欄位不變。
- `check` 的行為不變。M 層規則零改動。
- 上線條件多一條（文件層）。沒有任何程式或 CI 會執行它。
- 無執行期行為變更。不動渲染輸出，不動 `src/`，不動 `src/data/*.json`。

## Acceptance criteria

**AC-1 — 舊路徑清除，M6 端值只剩 `/about:38`（end value，在合併後的 `main` 上量）。**
Verified by:
1. `node scripts/content-audit.mjs check | grep '^M6'` 恰好輸出一行 `M6 src/app/about/page.tsx:38  …`。
2. `grep -rn 'constitution-features/systematic-chinese-content-legal-audit.md' scripts tests docs src AGENTS.md | grep -v '_archive/systematic' | grep -v '^docs/constitution-features/'` 零命中。這一步涵蓋 M6 不掃的 `units.mjs:4` 與 `tests/…:8`。
會失敗的改動：漏改 7 處中任一處（第 1 或第 2 步轉紅）；不做「範圍追加」的 `040` 3 處（第 1 步多出 3 行）。

**AC-2 — 產生器不再輸出舊路徑。**
Verified by: `node scripts/content-audit.mjs reading-list | grep -c 'constitution-features/systematic-chinese'` 為 1，且該行含 `_archive/`。
會失敗的改動：只改快照 `:4`、不改產生器 `:454`。

**AC-3 — P3-8 恰有兩條解除條件，`056` 那條原封不動，G-7 仍 PASS（end value）。**
Verified by:
1. `awk '/^#+ /{sec=$0} sec ~ /^### P3-8/ && /解除條件/{c++} END{print c+0}' docs/health-check/TODO.md` 印 `2`。
2. 新行含 `node scripts/content-audit.mjs check` 與「離開碼為 0」，不含 `056-pre-launch-checklist`。
3. `git diff <base> -- docs/health-check/TODO.md` 中，以「- **解除條件**（2026-09-21 加入）」開頭的行不出現在 `-` 側。
4. 把 `_archive/056-pre-launch-checklist.md:282-291` 的 G-7 正本存成檔並以 `bash` 執行，印 `G-7 PASS [place1=1/1 place2=1 place3=1]`，離開碼 0。
會失敗的改動：新行帶入 `056-pre-launch-checklist`（第 4 步印 `place2 … count=2`，已實測）；改寫 `056` 那一行（第 3 步）；新行放到 P3-8 以外（第 1 步印 `1`）。

**AC-4 — `AGENTS.md` 的 noindex 條款指向第二條件。**
Verified by: `AGENTS.md` 第 4 條（`### 4.` 到下一個 `---` 之間）恰有一行含 `P3-8` 與 `解除條件二`；G-7 的 place3 仍為 1（AC-3 第 4 步同時驗證）。
會失敗的改動：漏加這一行；或加在第 4 條之外。

**AC-5 — 紀年規則只有一個正本，其他地方只指向它。**
Verified by:
1. `docs/project/content-conventions.md` 存在，含三條規則；判決字號那條標「暫行」與「captain 尚未確認」，或已換成 captain 在 gate 上的決定並註明日期。
2. `grep -rln '敘述用西元' AGENTS.md docs scripts src | grep -v '_archive/' | grep -v '^docs/constitution-features/'` 只輸出 `docs/project/content-conventions.md`。
3. `TODO.md` P1-10 與產生器 L4 節都含字串 `docs/project/content-conventions.md`，且 `TODO.md` 不再含「另待 captain 決定：全站紀年慣例」。
4. `docs/INDEX.md` 有該檔一列，狀態 `evergreen`。
會失敗的改動：把規則文字複製進 `TODO.md` 或產生器（第 2 步多一個檔）；漏改 P1-10 的舊子項（第 3 步）。

**AC-6 — H 層閱讀順序寫進產生器與快照。**
Verified by:
1. 新測試（`tests/content-audit.test.mjs`）：以真實 repo 產生清單，斷言 (a) `### H-1` 出現在 `### H-2` 之前；(b) H-1 子表每一列的「公開」欄為「是」，H-2 子表每一列該欄為空；(c) 以 `publicPages: []` 的 ctx 重產時，H-1 為 0 檔；(d) 輸出含「閱讀順序」。既有 AC-9 測試照舊通過。
2. 快照：`node scripts/content-audit.mjs reading-list | diff - docs/content-audit/2026-09-29-reading-list.md` 只在第 1 行（日期）與第 3 行（commit）有差異。快照含 `### H-1 先讀`。
會失敗的改動：不拆表只保留排序（(a) 轉紅）；H-1 用錯判定（(b) 轉紅）；H-1 寫死檔名清單而不讀 `PUBLIC_PAGES`（(c) 轉紅）；快照未重產（第 2 步）。

**AC-7 — 禁區未動，既有行為未回歸。**
Verified by:
1. `node --test 'tests/*.test.mjs'` 零失敗。
2. `rm -rf .next && npx tsc --noEmit` 離開碼 0。
3. `shasum -a 256 src/data/*.json` 與基準相同（`067` 記錄：`4071978a…3162`、`4d1992e3…ea3b`）。
4. `src/app/layout.tsx` 的 `robots: { index: false, follow: false }` 仍在，檔案零改動。
5. `check` 的 M1–M5 計數與改動前相同（`M1=0 M2=0 M3=0 M4=1 M5=2`，除非 `068` 先合併改變了它們）。
會失敗的改動：執行 `npm run sync-content`；動到 M 層規則；動到 `layout.tsx`。

## Test plan

- `node --test tests/content-audit.test.mjs`：既有 16 條加 AC-6 新測試。
- `node --test 'tests/*.test.mjs'`：全套，零失敗。
- `rm -rf .next && npx tsc --noEmit`。
- `node scripts/content-audit.mjs check`：預期離開碼 1，M6 只剩 `/about:38`（AC-1）。M4、M5 是 P1-10 的內容錯誤，本票不修。
- AC-3 第 4 步：G-7 正本。
- AC-1、AC-5 的 grep。
- AC-6 第 2 步的快照 diff。
- **不執行 `npm run sync-content`。** 不需要 dev server。

## Documentation impact

### 現在更新

無。

理由：四件事都是本票 implement 的交付物。現在就在 `main` 寫，會把預定狀態寫成現況：

- `TODO.md` P3-8 的第二條解除條件，要等 AC-3 證明 G-7 仍 PASS 才能落地。
- `TODO.md` P1-10 的兩個子項指向的正本檔還不存在。
- `068` 的實作後更新也會改 `TODO.md` P1-10，現在在 `main` 另改會增加合併衝突（Risk evidence 第 6 點）。

captain 2026-09-29 的三項決定，目前記在本票的 Problem 一節。implement 合併前，那裡是唯一的紀錄。

### 實作後更新

| 文件 | 要改什麼 | 完成條件 |
|---|---|---|
| `docs/project/content-conventions.md`（新） | 紀年正本，內容見 Proposed approach 第三件事。判決字號依 gate 結果寫定案或「暫行」 | AC-5 |
| `docs/health-check/TODO.md` | P3-8 加解除條件二；P1-10「優先級」與「紀年」兩個子項改寫；`:892`、`:1072` 的 `040` 路徑；變更紀錄加一列「069：P3-8 加解除條件二；紀年正本移至 `docs/project/content-conventions.md`；已封存票路徑 3 處改指 `_archive/`」 | AC-1、AC-3、AC-5 |
| `AGENTS.md` | 第 4 條加一行，指向 P3-8 解除條件二。更新 INDEX 中它的最後查核日 | AC-4 |
| `docs/INDEX.md` | 專案定位表加 `content-conventions.md` 一列（evergreen，captain）；`AGENTS.md` 與 `scripts/content-audit.mjs` 兩列的最後查核日 | AC-5 |
| `docs/content-pipeline/design.md` | `:613` 的 `040` 路徑。只改路徑，不改敘述 | AC-1 |
| `docs/content-audit/2026-09-29-reading-list.md` | 以新產生器覆寫。前提：零個已勾選項 | AC-6 |

### 不更新

| 文件 | 理由 |
|---|---|
| `docs/constitution-features/_archive/systematic-chinese-content-legal-audit.md` | `record`。第十節是紀年預設的出處，保留原樣。正本移到新檔後，它只是歷史 |
| `docs/constitution-features/_archive/056-pre-launch-checklist.md` | `record`。不追加 gate 項，G-7 只驗證不改 |
| `src/app/layout.tsx` | 註解已指向 P3-8（`:7`）。在 `robots:` 上方插行會打破 G-7 place1 |
| `docs/project/design-system.md` | 視覺規範，不是文字規範；`068` 正在改它 |
| `docs/content-pipeline/data-collection-guide.md`、`operations.md` | 不放第二份規則。需要時由正本反向連結，本票不加 |
| `docs/constitution-features/threshold-page-voided-quorum-current.md` 的 `:187`、`:546` | `068` 的 entity 內有 `067` 舊路徑。workflow 票歸各票自己的 stage 管，M6 也不掃 |
| `.github/`、`package.json` | 不接 CI 或 build（Out of scope） |

### Feedback Cycles
- Cycle 1: REJECTED — review（`5b79651`）判 PASSED，列 R-1（Deferred risk：`AGENTS.md` 第 4 條「兩項都通過」在 `051`／`053` 合併後不完整）與 R-2（Polish：`content-conventions.md` 規則 2 範例加了空格）。captain 2026-09-30 於 review gate 選「照建議，文字核准」（revise）。授權：R-1 fix（以 captain 核准的文字取代第 4 條新行）；R-2 fix（範例改為「114年1月23日（2025年1月23日）」）。

## Out of scope

- P1-10 列出的內容錯誤本身（大事記順序、紀年混用、`/about:38` 文案）。
- 把 `check` 接進 CI 或 build（需另開票並經 captain 明確同意）。
- `067` review 的 R1、R3–R7。

## Stage Report: design

- DONE: Specify the four changes: the 7 R2 old-path references to archived 067, the second P3-8 解除條件 (manual `content-audit.mjs check` exit 0, 056's line untouched), the site calendar convention (西元) in its canonical spec home, and the H-layer reading order (legal reviewer reads the three PUBLIC_PAGES sources first).
  Proposed approach 一至四：7 處逐一列做法；P3-8 新行全文（不含 `056-pre-launch-checklist`）＋ AGENTS 第 4 條一行；正本為新檔 `docs/project/content-conventions.md`；產生器 H 節拆 H-1（公開，23 檔約 6,736 字）／H-2 並重產快照。另提範圍追加：`040` 今天封存造成的 3 處舊路徑，不修則端值不成立。
- DONE: Acceptance criteria each carry a falsifiable Verified by; the end value is measured on main after the change: `check` M6 reports only /about:38, P3-8 holds exactly two 解除條件 lines, and 056's canonical G-7 still prints G-7 PASS.
  AC-1 至 AC-7 各附會失敗的改動。端值已在 `git archive 8a3d8d1` 副本實跑：M6 只剩 `/about:38`、P3-8 計數 2、`G-7 PASS [place1=1/1 place2=1 place3=1]`、16 測試全過；新行帶入 `056` 字串時 G-7 轉 `FAIL count=2`（AC-3 可失敗）。
- DONE: Split documentation impact into 現在更新 / 實作後更新 / 不更新; name the canonical home for the calendar rule (no second spec copy) and mark the 判決字號 question as awaiting captain with the default stated.
  現在更新＝無（附三點理由）；實作後更新 6 列各附 AC；不更新 7 列。正本唯一性由 AC-5 的 grep 驗證。判決字號列為 gate 決定，預設 A（保留官方寫法），另列 B、C 與各自對工具的影響。

### 交 FO 的事

1. `main` 上 M6 今日為 9，不是 review 記錄的 6：`040` 於 `55959d6` 封存後新增 3 處。需 FO 認可範圍追加。
2. 與 `068` 同改 `TODO.md` P1-10（相距 2–8 行），建議 `069` implement 在 `068` 合併後開分支。本票不碰 threshold-analysis 任何檔。`068` entity 的 `:187`、`:546` 也帶 `067` 舊路徑，屬 `068` 自管。
3. `054` 計畫改 `AGENTS.md`，本票只動第 4 條內一行，不同段。
4. 下次封存 `019`／`049`／`064` 時 M6 會再報。建議封存步驟後跑一次 `check`。

### Summary

四件事都規格化到可照做：7＋3 處路徑改指 `_archive/`、P3-8 第二條解除條件與 AGENTS 對應一行、紀年正本新檔、H 層兩段閱讀順序。所有端值已在副本上實跑成立，G-7 的可失敗性也已實測。captain 在 gate 要決定判決字號寫法（建議 A），並須知道綁定後 P1-10 第 1、2、3、6 項修好前不能上線。

## Stage Report: implement

- DONE: Implement the design's four changes on a branch from current main: the 7 R2 + 3 `040` old paths repointed to `_archive/`; P3-8 解除條件二 plus the one-line AGENTS.md rule-4 addition (056's line untouched); new `docs/project/content-conventions.md` with 判決字號 rule A stated as captain-confirmed 2026-09-30 (no 暫行); generator H section split into H-1/H-2 with the reading-order line, snapshot regenerated.
  `3555df3`（路徑 6＋3 處、P3-8、AGENTS、正本、產生器、測試）、`d928b7e`（重產快照，覆寫前 `[x]`=0）、`3081749`（INDEX 列去掉規則文字）。分支底 `7a7c38e` 與 `main` 內容只差 4 個 dispatch 狀態檔。第 7 處是快照，由重產處理。
- DONE: Prove AC-1..AC-7 on the branch: P3-8 prints exactly two 解除條件 lines; 056's G-7 prints PASS; content-audit M6 end value re-baselined against today's main (054 has merged since design) with any divergence reported as a finding, not silently absorbed; tests and tsc pass.
  見下方「AC 證據」與「Finding F-1」。AC-1 第 1 步未達設計端值，已依 FO 指示保留為 finding，未擴大範圍。
- DONE: Never run `npm run sync-content`; no change to `src/` or `src/data/*.json`; no regressions to existing checks.
  未執行 sync。`git diff --stat 7a7c38e -- src` 為空；`src/data/*.json` sha256 仍為 `4071978a…3162`、`4d1992e3…ea3b`。

### AC 證據（皆於 `3081749` 實跑）

- AC-1：舊路徑 grep（067 與 040 兩組，排除 workflow 票目錄）各 0 行。`check` 的 M6 為 10，不是 1，見 F-1。
- AC-2：`reading-list` 含 `systematic-chinese` 的行恰 1 行，含 `_archive/`。設計的 grep 樣式 `constitution-features/systematic-chinese` 比對不到 `_archive/` 新路徑，印 0；以 `systematic-chinese` 取代才驗得到「恰 1 行且含 `_archive/`」。
- AC-3：P3-8 的 awk 印 `2`。`gatekeeping.md` 第七章的 awk 印兩行（解除條件、解除條件二）。056 那行不在 diff 的 `-` 側（計 0）。新行不含 `056-pre-launch-checklist`（計 0）。G-7 正本印 `G-7 PASS [place1=1/1 place2=1 place3=1]`，exit 0。可失敗性：副本上新行加入該字串，印 `G-7 FAIL: place2 … [count=2]`，exit 1。
- AC-4：`AGENTS.md` 第 4 條內含 `P3-8` 與 `解除條件二` 的行恰 1 行；place3=1。
- AC-5：`敘述用西元` 只在 `docs/project/content-conventions.md`。`TODO.md` 與產生器都含正本路徑；舊子項計 0；正本無「暫行」「尚未確認」。INDEX 有 evergreen 一列。
- AC-6：新測試斷言 H-1 在 H-2 前、H-1 列全為「是」、H-2 列全空、`publicPages: []` 時 H-1 為 0 檔、輸出含「閱讀順序」。還原產生器或把 H-1 改判為「有路由即可」，該測試轉紅（兩者皆實測）。快照 diff 只有第 3 行 commit 不同（日期同為 2026-09-30）。H-1 為 23 檔約 6,732 字；H-2 為 45 檔約 16,018 字。
- AC-7：`node --test tests/*.test.mjs` 138 條，137 過、0 失敗、1 skip（既有的線上重抓測試）。`rm -rf .next && npx tsc --noEmit` exit 0。`layout.tsx` 零改動，`robots` 行仍在。M1–M5 為 `0 0 0 1 2`，與改動前相同。

### Finding F-1：M6 端值在今日 `main` 上不成立（待 FO 處置）

- **觀察**：改動前 `check` 於 `7a7c38e` 印 `M6=18`，不是 design 的 9。改動後 `M6=10`：`/about:38` 加 9 處設計後新封存造成的舊路徑。
- **9 處**：`064` 四處（`design.md:582`、`:770`、`:823`，`src/data/verified-case-refs.mjs:9`）；`050` 兩處（`operations.md:39`、`TODO.md:935`）；`070` 兩處（`operations.md:143`、`:171`）；`068` 一處（`TODO.md:704`，在 `068` 自己的補述引文內）。
- **四個證據欄**：使用者與流程＝上線前手動跑 `check`（P3-8 解除條件二）；可見傷害＝`check` 多報 9 處，上線前多 9 項要修，站上讀者看不到；受影響 AC＝AC-1 第 1 步的端值；觸發證據＝上方實跑輸出。
- **提議**：Material 於 AC-1，但超出核可範圍，歸 Needs decision（hold）。其中 `verified-case-refs.mjs` 在 `src/`，受本票禁區管。另開票或由 captain 擴大範圍，本票未動這 9 處。已先以 SendMessage 通知 FO（當時誤算為 8 處，正確為 9 處）。

### Summary

四件事都已落地：9 處舊路徑改指 `_archive/`，P3-8 有兩條解除條件而 G-7 仍 PASS，紀年正本寫定判決字號規則 A，閱讀清單拆成 H-1 先讀與 H-2 後讀並重產快照。實際改動 9 檔 +90／−26（不含快照），在估計範圍內。M6 端值因設計後又封存了 4 張票而不成立，已列為 F-1 待 FO 處置；AC-2 的 grep 樣式在設計上寫錯，改用可驗證的樣式並記錄。

## Stage Report: implement (cycle 2)

- DONE: Implement the design's four changes on a branch from current main: the 7 R2 + 3 `040` old paths repointed to `_archive/`; P3-8 解除條件二 plus the one-line AGENTS.md rule-4 addition (056's line untouched); new `docs/project/content-conventions.md` with 判決字號 rule A stated as captain-confirmed 2026-09-30 (no 暫行); generator H section split into H-1/H-2 with the reading-order line, snapshot regenerated.
  cycle 1 已完成（`3555df3`、`d928b7e`、`3081749`），本輪未改。
- DONE: Prove AC-1..AC-7 on the branch: P3-8 prints exactly two 解除條件 lines; 056's G-7 prints PASS; content-audit M6 end value re-baselined against today's main (054 has merged since design) with any divergence reported as a finding, not silently absorbed; tests and tsc pass.
  F-1 已處置（見下）。`70c5c7e` 上 `check` 印 `FAIL M1=0 M2=0 M3=0 M4=1 M5=2 M6=1`，M6 只剩 `src/app/about/page.tsx:38`，AC-1 端值依原設計成立。
- DONE: Never run `npm run sync-content`; no change to `src/` or `src/data/*.json`; no regressions to existing checks.
  未執行 sync。`src/` 只有 `verified-case-refs.mjs:9` 註解一行（captain 核可的例外）；`src/data/*.json` sha256 不變。

### F-1 處置：captain 決定與範圍變更

- **captain 決定**（2026-09-30，聊天中選「全部納入 069」）：設計後新封存造成的舊路徑全部納入本票。FO 授權 `fix`。AC-1 端值維持原設計：M6 只報 `/about:38`。
- **範圍變更**：新增 9 處路徑改指 `_archive/`（`70c5c7e`）。`design.md:582`、`:770`、`:823`（064）；`operations.md:39`（050）、`:143`、`:171`（070）；`TODO.md:704`（068 補述，只改路徑，文字不動）、`:935`（050）；`src/data/verified-case-refs.mjs:9`（064，只改註解）。行號為本分支上的行號；FO 訊息的 `:706`、`:937` 是改動前的 `main` 行號。連結文字與目標一起改，沿用 `design.md:737` 的寫法。四個 `_archive/` 目標檔皆存在。
- `TODO.md` 變更紀錄那一列同步改寫，列出本檔改了哪 4 處。
- **M6 前後**：`main` 內容（`7a7c38e`）18 → cycle 1 後（`3081749`）10 → 本輪後（`70c5c7e`）1。

### 本輪重跑（於 `70c5c7e`）

- AC-1：M6 恰一行 `M6 src/app/about/page.tsx:38`；067 與 040 舊路徑 grep 各 0 行。
- AC-3／AC-4：P3-8 awk 印 `2`；G-7 印 `G-7 PASS [place1=1/1 place2=1 place3=1]`，exit 0。
- AC-6：快照 diff 只有第 3 行（commit）不同。
- AC-7：138 條測試，137 過、0 失敗、1 skip（既有線上測試）；`tsc` exit 0；`layout.tsx` 未動；M1–M5 不變。

### Summary

依 captain 決定把設計後新封存的 9 處舊路徑納入本票並修正。`src/` 只動一行註解。AC-1 端值回到原設計：M6 只剩 `/about:38`。其餘 AC 在新 HEAD 上重跑全部成立。

## Stage Report: verify

- DONE: Verify every factual claim 069 ships against its source: the new `docs/project/content-conventions.md` calendar rules (captain 2026-09-29/30 decisions, 判決字號 rule A with a real example checkable on the Judicial Yuan site), the P3-8 解除條件二 text, the H-1/H-2 reading-order statement, and that each of the 19 repointed paths resolves to the right archived file.
  紀年三條與來源日期對得上 FO 轉述的 captain 決定（09-29 西元；09-30 規則 A，排除 C）。`114年憲判字第1號` 於 `cons.judicial.gov.tw/judcurrentNew1.aspx?fid=38` 今日實抓存在，官方寫法無空格，與例一致（fixture 亦為 2025-12-19〈憲法訴訟法修正案〉）；例 2 的 114→2025 換算正確。解除條件二說「須印出 `PASS`」：`content-audit.mjs:594` 成功時確實印 `PASS`。H-1 說明中的 `PUBLIC_PAGES` 與 `src/data/launch-status.ts:3` 相同（`/`、`/controversy-timeline`、`/future`），H-1 23 檔含 `layout.tsx`、`Footer.tsx`、`Navbar.tsx`、`ComingSoon.tsx`。19 處：18 行改路徑（067×5、040×3、064×4、050×2、070×2、068×1、加快照 `:4`）＋ `TODO.md` 原 `:694` 改寫去掉路徑；逐一解析相對路徑皆存在，且各目標檔 frontmatter `id` 與原連結的票相符（067、040、064、050、070、068）。
- DONE: Placeholder scan over the diff and the regenerated reading-list snapshot; confirm 056's line in P3-8 is byte-unchanged and G-7 PASS; content-audit M6 reports only `/about:38`.
  `某學者|某大學|lorem|ipsum|快速了解最新判決|test|TBD|XXX|placeholder` 在 diff 新增行只中 `TODO.md` 檔名與 `test(` 函式名，快照與正本 0 中。`056` 那行與 `7a7c38e` 版 `cmp` 位元組相同。G-7 正本（`_archive/056…:282-291`）印 `G-7 PASS [place1=1/1 place2=1 place3=1]`，exit 0；P3-8 awk 印 `2`；AGENTS 第 4 條相關行 1。`check`：`FAIL M1=0 M2=0 M3=0 M4=1 M5=2 M6=1`，M6 只有 `src/app/about/page.tsx:38`。
- DONE: End with a clear PASSED or REJECTED verdict and rationale; any finding goes through the Review-finding disposition checkpoint without touching the candidate.
  判定 PASSED，理由見 Summary。V-1 記於下方，未動 candidate。

### 其他重跑（於 `86ee71d`）

- `node --test tests/*.test.mjs`：138 條，137 過、0 失敗、1 skip。新測試斷言 H-1 在 H-2 前、H-1 全「是」、H-2 全空、`publicPages: []` 時 H-1 為 0 檔。
- `rm -rf .next && npx tsc --noEmit` exit 0。`src/data/*.json` sha256 為 `4071978a…3162`、`4d1992e3…ea3b`，不變。`layout.tsx` 零 diff，`robots` 行仍在。`src/` 只有 `verified-case-refs.mjs:9` 註解一行。
- 快照：`reading-list | diff` 只差第 3 行 commit。`[x]` 在舊快照與新快照皆為 0。AC-2 行恰 1 行且含 `_archive/`。`敘述用西元` 只在正本。

### Finding V-1（Polish，待 FO 處置）

- **觀察**：同樣是設計後封存的票，M6 不掃的位置還有 5 處舊路徑：`scripts/sync-content.mjs:558`（070）、`scripts/content-fingerprint.mjs:23`（064）、`tests/track2-case-ref-stance.test.mjs:16`（064）、`tests/threshold-analysis.test.mjs:1303`（068）、`docs/health-check/2026-09-03-editor-onboarding.md:481`（050，`record`）。
- **四個證據欄**：使用者與流程＝開發者讀註解；可見傷害＝註解／record 連結斷，站上讀者看不到，`check` 不報；受影響 AC＝無（AC-1 第 2 步只涵蓋 067 路徑，M6 端值已成立）；觸發證據＝上列 grep。
- **提議**：Polish，不擋本票。建議 decline 或另開小票；`editor-onboarding.md` 是 `record`，若修應以補述而非改寫。另：`operations.md:171` 的「〈同步〉那則補述的連結仍指向改名前的檔名」在 `7a7c38e` 已與 `:143` 不符，非本票造成，僅供記錄。

### Summary

逐項查核 069 的事實陳述：紀年正本與 captain 決定一致，判決字號例在司法院網站實查存在；解除條件二的 `PASS` 措辭與工具輸出一致；閱讀順序的公開頁清單與 `launch-status.ts` 相符；19 處路徑全數指到正確的封存檔。056 那行位元組未變、G-7 PASS、M6 只剩 `/about:38`、測試與 tsc 全過、無佔位資料。判定 **PASSED**；V-1 是 M6 範圍外的 5 處註解／record 舊路徑，屬 Polish，交 FO 處置。

## Stage Report: review

- DONE: Review 069 for what verify did not own: the implementation matches the design and the captain's 2026-09-30 decisions (判決字號 A confirmed, both scope items, 9 post-design paths with src/ limited to one comment line), readability of content-conventions.md for a non-engineer captain, and every Documentation impact row checked against delivered behavior.
  逐行讀 `main...99448b5` 的 diff。設計四件事全部照做；範圍追加 `040` 3 處＋設計後 9 處都在；`src/` 只有 `verified-case-refs.mjs:9` 註解一行。正本第 3 條寫定規則 A（不附西元，排除 C），無「暫行」。正本 27 行，三條規則各附例，「怎麼查」附可照打的指令，非工程師讀得懂。實作後更新 6 列逐列對到交付；`不更新` 各列的 `record`（`_archive/067`、`_archive/056`、`2026-09-03-editor-onboarding.md`）與 `layout.tsx` 皆零 diff。`operations.md` 在「不更新」列內，但只改了 3 處路徑，屬 captain 09-30 範圍擴大，未加第二份規則，不違反該列理由。
- DONE: Regressions and merge interplay: 138 tests, tsc, G-7 PASS, content-audit M6 only `/about:38`; anticipate conflicts with 051 and 053 (both add their own P3-8 lines and touch TODO.md/AGENTS.md) and 072 (INDEX.md date cells).
  於 `99448b5` 實跑：`node --test tests/*.test.mjs` 138 條 137 過 0 失敗 1 skip；`rm -rf .next && npx tsc --noEmit` exit 0；G-7 正本印 `G-7 PASS [place1=1/1 place2=1 place3=1]` exit 0；`check` 印 `FAIL … M6=1`，唯一 M6 行為 `src/app/about/page.tsx:38`；AC-1 第 2 步 grep 0 行；AC-2 恰 1 行含 `_archive/`；P3-8 awk 印 `2`；`056` 那行不在 `-` 側；`敘述用西元` 只在正本；快照 diff 只差第 3 行 commit；`src/data/*.json` sha256 不變。合併模擬見 R-1。
- DONE: End with a clear PASSED or REJECTED verdict; findings go through the Review-finding disposition checkpoint without touching the candidate.
  判定 **PASSED**。R-1、R-2 交 FO 處置，candidate 未動（合併模擬在已移除的臨時 worktree 內進行）。V-1 依 FO 指示不列。

### 合併互動（`git merge-tree` 與臨時 worktree 實測）

- `069`＋`051`：`TODO.md`、`INDEX.md` 文字衝突。`069`＋`053`：`TODO.md` 文字衝突。三者都在 P3-8 的 `056` 那行之後插一行，衝突點相同；保留全部三行即可解。`AGENTS.md` 與 `design.md` 自動合併。
- 三者全合併（衝突以聯集解）後：G-7 仍 `PASS [place1=1/1 place2=1 place3=1]`，因為 `051`、`053` 的新行都不含 `056-pre-launch-checklist`。P3-8 含「解除條件」的行變成 4。
- `069`＋`072`（`gatekeeping-overview-rejudge-064`）：無衝突。`069` 在 INDEX 專案定位表加一列，`072` 票內寫的 `docs/INDEX.md:59` 會移到 `:60`，只影響其行號引用。

### Finding R-1（Deferred risk，待 FO 處置）

- **觀察**：`051`、`053` 合併後，P3-8 有 4 條解除條件，只有 `069` 那條編號「二」，另兩條都叫「解除條件」。`AGENTS.md` 第 4 條（`069` 加的行）寫「兩項都通過，才可移除」，屆時條件不完整；`051`、`053` 都不改第 4 條。`069` AC-3 第 1 步「印 2」在合併後不成立（該 AC 是 `069` 自身端值，不是永久不變式）。
- **四個證據欄**：使用者與流程＝agent 只讀 `AGENTS.md` 就移除 noindex；可見傷害＝漏跑 `content-provenance.mjs check` 與 `053` AC-3–6 即上線；受影響邊界＝AGENTS 第 4 條 noindex 禁令；觸發證據＝上方三方合併模擬。今日 `main` 上不觸發。
- **提議**：Deferred risk，promote 條件＝`051` 或 `053` 任一合併。`069` 內容本身正確，不擋本票。建議由後合併者在解衝突時改 `AGENTS.md` 那行為「P3-8 列出的全部解除條件」並統一編號；歸屬需 FO 決定（`069` 無法擁有另兩票的條件）。

### Finding R-2（Polish，待 FO 處置）

- **觀察**：`content-conventions.md` 第 2 條要求引用官方文字「保留民國」，例子卻寫「114 年 1 月 23 日」，數字與「年」「月」之間有空格；官方原文為 `114年1月23日`。讀者照例子寫會改動原文。
- **四個證據欄**：使用者與流程＝編輯照正本例子寫引文；可見傷害＝引文多出空格，不影響意義；受影響 AC＝無；觸發證據＝`docs/project/content-conventions.md:18`。
- **提議**：Polish，建議 decline 或併入後續內容修正票。

### Summary

069 的實作與設計、captain 09-29／09-30 決定一致，所有 AC 在 `99448b5` 重跑成立，文件影響逐列對得上，`record` 與 `layout.tsx` 未動。判定 **PASSED**。與 `051`、`053` 合併時 P3-8 會有同點文字衝突（聯集可解、G-7 仍 PASS），但 AGENTS 第 4 條的「兩項」屆時不完整，列為 R-1 交 FO。

## Stage Report: implement (cycle 3)

- DONE: R-1: replace the line 069 added to AGENTS.md rule 4 with the captain-approved text byte-for-byte; AC-4 and G-7 place3 must still hold (one line containing both P3-8 and 解除條件二).
  `80671d8`。`grep -Fxc` 以核准全文比對 `AGENTS.md` 得 1。第 4 條內含 `P3-8` 與 `解除條件二` 的行恰 1 行；G-7 place3=1。
- DONE: R-2: change the rule-2 example in docs/project/content-conventions.md to 「114年1月23日（2025年1月23日）」 (no spaces); nothing else in the file changes.
  `80671d8`。該檔 diff 只有規則二那一行的範例。
- DONE: Re-run AC-1..AC-7 proofs touched by the change (G-7 PASS, P3-8 count 2, M6 only /about:38, tests, tsc); no other candidate change.
  於 `80671d8` 重跑：G-7 印 `G-7 PASS [place1=1/1 place2=1 place3=1]`，exit 0；P3-8 awk 印 `2`；M6 只剩 `src/app/about/page.tsx:38`（M1–M5 為 `0 0 0 1 2`，與先前相同）；AC-5 grep 仍只列正本；快照 diff 只有第 3 行 commit 不同。測試 138 條，137 過、0 失敗、1 skip（既有線上測試）。`tsc` exit 0。`src/data/*.json` sha256 不變。`git diff --stat 861dd26 HEAD` 只有這兩檔各一行。

### Summary

依 Cycle 1 修正包完成 R-1 與 R-2，各改一行。`AGENTS.md` 那一行逐字換成 captain 核准的文字，AC-4 與 G-7 仍成立。其餘 AC 證據重跑後都不變。
