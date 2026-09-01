# 憲庭加好友 — 內容產線待辦清單

體檢日期：2026-08-31　　最後更新：2026-08-31

本清單依**危險程度**排序，不是依工作量。每一項都附證據與驗證指令，可自行重跑確認。

**產線設計已定案**，見 [`../content-pipeline/design.md`](../content-pipeline/design.md)。P2、P3 的多數項目已被該設計吸收為施工項目。

---

## ⛔ 動工前必讀

```
在 P1-1 完成之前，不要執行：
  node scripts/sync-content.mjs
  npm run sync-content
  npm run build          ← build 也會跑 sync
```

`src/data/discussions.json` 已被人工編輯，內含試算表裡不存在的內容。現在跑 sync 會用試算表的舊值／佔位值覆蓋掉線上較好的版本，並抹除 `opposing_views`。

備份已存於 `docs/content-rescue/`（commit `94c6356`），但**備份不等於解除風險** —— 只有把內容搬回試算表才算。

**目前的保護狀態**：Vercel 的 `TRACK_1_CSV_URL` / `TRACK_2_CSV_URL` 已改名加 `_disabled`（2026-08-31），sync 會自動跳過。已實測驗證：

```
⚠️ TRACK_1_CSV_URL not set. Skipping Track 1 sync.
退出碼 0（部署不會因此失敗）
檔案指紋執行前後相同（檔案未被更動）
npm run build 完整跑過，16 個頁面全部產生成功
```

代價是**產線目前處於刻意斷開狀態** —— 試算表的任何更新都不會反映到網站。這是安全的停機，但不應長期維持。

`npm run dev` 不含 sync，可安全用於檢視目前會發布的內容（`http://localhost:3000/past`）。

---

## 產線現況

```
寫作者（法學者・編輯）
      ↓ 編輯
  SSOT_收集區 (Drive)      42 列・已被專家改正・欄位標題含註解
      ↓ ✋ 人工複製（無人負責・會貼歪・不回流）
  SSOT_Editor (Drive)      25 列・15 筆錯位・含法律錯誤・含 test 資料
      ↓ node scripts/sync-content.mjs（依欄位標題名稱對應）
  src/data/history.json    ← 最後 commit 2026-05-02
  src/data/discussions.json   ← 已被人工編輯，與上游脫鉤
      ↓
  線上網站
```

**核心問題：**中間那個人工複製動作，同時扮演「編輯台把關」與「資料搬運」兩個角色，而它把搬運做壞了。

---

## 🔔 現在的下一件事

### ~~1. `git push origin main`~~ ✅ 已完成（2026-09-01）

`5cdb0d4..5e6048d`，10 個 commit 已推送並部署。**線上實測驗證通過**（自 605KB bundle 直接比對，非僅看部署狀態）：

| 應該消失 | 結果 | 應該出現 | 結果 |
|---|:---:|---|:---:|
| h15 錯位的整段條文 | ✅ | d7 真實摘要 | ✅ |
| tldr 的 `test test test` | ✅ | d8 真實摘要 | ✅ |
| 佔位摘要 | ✅ | tldr 三重點 | ✅ |
| | | d7 owl 短評 | ✅ |
| | | noindex | ✅ |

驗證指令：
```bash
curl -s https://constitution-nine.vercel.app/past -o p.html
# 內容為 client-render，資料在 JS bundle 而非 HTML，需抓 /_next/static/*.js 比對
```

### 2. 回填 SSOT 的 10 格 　🔴 **唯一剩下的封鎖**

→ [`../content-rescue/ssot-backfill.md`](../content-rescue/ssot-backfill.md)

**只有你能做**（Drive connector 無寫入儲存格能力）。這是解除「不能跑 sync」封鎖的前提。

現在的狀態是 **repo 與線上一致，但 SSOT 仍是壞的**：

```
① SSOT   ❌ ──✂── ② repo ✅ ──✅── ③ 線上 ✅
         ↑
    唯一還斷著的地方
```

不回填則產線接通後將被**第三次**覆蓋。

---

## 受眾與緊急度（2026-08-31 修正）

原清單假設網站對外公開，事後確認**實際受眾為工作夥伴，有連結才看得到**，其中包含法學背景者。

因此 P0 的定義調整為：**上線前必須清乾淨**，而非「正在傷害讀者」。唯一例外是 `h2` 的法律錯誤 —— 理由改變但優先級維持，見 P0-2。

相關的公開範圍事實（詳見體檢報告的修正補述）：

- `LaunchGate` 只有「全開」與「僅開三頁」兩種狀態，無法做到夥伴看全部、公眾看部分
- 它是 client-side 遮蔽，不是存取控制；頁面內容仍完整送達瀏覽器
- 已加入 `robots: { index: false, follow: false }`（2026-08-31），並驗證產生的 HTML 確實輸出該標籤。**發布前必須移除，見 P3-8**

---

## P0 — 上線前必須清乾淨

### ~~P0-1　Track 1 有 15 筆欄位錯位（25 筆中的 60%）~~ ✅ 已完成

- **狀態**：**已修復**（2026-08-31，commit `8d3f8f9`）
- **驗證結果**：`0/25 筆壞掉: []`
- **資料來源**：採 `SSOT_收集區`（透過 xlsx 匯出取得完整 42 列，非取樣）。選此來源而非從 json 反推，因為貼上後 `收集區` 仍持續被編輯 —— 例如 h24 的「遺屬**前**金」錯字已被改正、h23/h24 敘述已重寫得更精確。反推只能還原貼上當時的版本，會蓋掉這些成果
- **附帶處理**：`textbook.chapter` 設為空字串（`收集區` 無此欄），並修改 `past/page.tsx` 使空值不渲染標題（commit `f4ae418`，`tsc --noEmit` 通過）
- **仍成立的風險**：此修復存在於 repo。若日後 sync 來源仍為 `SSOT_Editor`，會被重新破壞。解除條件為完成 [design.md](../content-pipeline/design.md) 的施工項目 7、8

<details>
<summary>原始問題記錄</summary>

- **影響**：`h15`–`h29` 全部欄位錯位，年份欄顯示整段憲法條文，`ruling_id` 全空
- **規律**：`h14` 以前正常，`h15` 以後全錯 → 一次性批次貼上事故，非零星手誤
- **錯位方式**：

  | 收集區欄位 | 跑到 Editor 的 |
  |---|---|
  | `year` | `chapter` |
  | `ruling_id` | `content` |
  | `ruling` | `handwriting` |
  | `content` | `year` |
  | — | `ruling_id` 變空白 |

- **受影響的列**：

  | id | 主題 | 正確年份・判解 |
  |---|---|---|
  | h15 | 集會自由 | 1998・釋字445 |
  | h16 | 言論自由 | 2022・111憲判2 |
  | h17 | 轉型正義 | 2020・釋字793 |
  | h18 | 隱私權 | 2005・釋字603 |
  | h19 | 權力分立 | 2024・113憲判9 |
  | h20 | 性別平等 | 2021・釋字807 |
  | h21 | 性別平等 | 2024・113憲判6 |
  | h22 | 性別平等 | 2023・112憲判1 |
  | h23 | 社會權(勞保) | 2006・釋字609 |
  | h24 | 社會權(遺屬年金) | 2018・釋字766 |
  | h25 | 政治旋渦中的大法官 | 2007・釋字632 |
  | h26 | 基本權利保障 | 2020・釋字791 |
  | h27 | 原住民族權利 | 2021・釋字803 |
  | h28 | 原住民族權利 | 2022・111憲判4 |
  | h29 | 基本權利保障 | 2001・釋字535 |

- **誰能做**：工程師（修 `history.json`）＋ 需 `收集區` 的正確值
- **驗證**：
  ```bash
  python3 -c "
  import json,re
  h=json.load(open('src/data/history.json'))
  bad=[r['id'] for r in h if not re.fullmatch(r'\d{4}',str(r['reality']['year']).strip())
       or not str(r['reality']['ruling_id']).strip()]
  print(len(bad),'筆壞掉:',bad)"
  ```
  修好後應輸出 `0 筆壞掉: []`

</details>

---

### P0-2　h2 的釋字第272號內容錯誤（法律錯誤）　🔺 全清單最高優先

- **狀態**：**待法學確認** — 不要在確認前修改
- **為何在受眾修正後仍維持最高優先**：看到這筆錯誤的人**包含法學背景的工作夥伴**。專業受眾看到錯誤的釋字解讀，對專案專業性的信任損害，比公開與否更難補救。這是唯一不因「還沒公開」而降級的項目
- **影響**：現行資料將釋字第272號誤植為言論自由案
- **證據**：

  | | 線上（history.json） | 收集區（已被改正） |
  |---|---|---|
  | category | 言論自由 | **訴訟權** |
  | ruling | 廢除刑法100條運動・保障和平表達政治異議的自由 | 限制戒嚴時已確定之軍事審判案件只能透過再審或非常上訴途徑救濟，並不違憲 |
  | content | 憲法第十一條…言論、講學、著作及出版之自由 | 戒嚴期間非現役軍人受軍事審判，屬憲法容許之例外… |

- **判斷**：釋字第272號為軍事審判案，非言論自由案。`收集區` 版本應為正確版
- **注意**：此列結構正常，機器掃不出來，只有靠人讀才發現
- **誰能做**：法學協作者確認 → 工程師修正
- **卡在**：需要一位法學背景的人拍板

---

### ~~P0-3　`tldr` 的測試字串~~ ✅ 已完成

- **狀態**：**已真修復**（commit `fe04178`）。先於 `d397059` 暫時移除止血，後自 commit `75df766` 還原 2026-04-16 寫好的真實三重點，整筆加回
- **關鍵發現**：該內容並非缺失，而是曾經寫好後被 sync 覆蓋

<details>
<summary>原始問題記錄</summary>

- **狀態**：未處理
- **內容**：

  ```
  **權限界線**：test test test test
  ** 權力分立**：test etst test
  ** 測試測試**：ttsss tttsss tts
  ```

- **為什麼會上線**：該列 `status` 標為 `Approved`，通過了 sync 的過濾
- **誰能做**：編輯台（改試算表）或工程師（改 json）
- **驗證**：
  ```bash
  grep -c "test test test" src/data/discussions.json   # 應為 0
  ```

---

### ~~P0-4　6 筆佔位摘要~~ ✅ 已完成

- **狀態**：**全部修復**
  - `d2` `d4` `d6` —— 自 `SSOT_收集區` 取真實摘要（commit `8890d8d`）。與未來 sync 結果一致，未製造新分歧
  - `d7` `d8` `d9` —— 自 commit `75df766` 還原 2026-04-16 寫好的摘要（commit `fe04178`）
- **驗證**：`test字串: 無　佔位摘要: 無`
- **待回填 SSOT**：`d7/d8/d9` 三則摘要從未進入試算表，見 P1-1

---

## P1 — 資料有遺失風險

### P1-1　搶救內容尚未搬回試算表　🔔 明天的第一項工作

- **狀態**：已備份、已擴充，**未搬回**
- **完整清單**：[`../content-rescue/ssot-backfill.md`](../content-rescue/ssot-backfill.md) —— 共 **10 格**，含儲存格位置與可直接複製的內容
- **範圍已擴大**：原本只有 3 格 owl 短評，2026-08-31 追查後發現 d7/d8/d9 的 abstract 與 tldr 三重點也只存在於 repo（皆自 commit `75df766` 還原），故回填範圍為 10 格
- **誰能做**：只有你（Drive connector 無寫入儲存格能力，只能讀）
- **這是解除「不能跑 sync」限制的前提**
- **不做的後果**：產線接通後這批內容將被**第三次**覆蓋（前兩次沿革見清單檔）

### P1-2　5 筆短評有兩個版本，需編輯台裁決

- **狀態**：待決策
- **受影響**：`d1` `d2` `d4` `d5` `d6`
- **狀況**：兩邊都是真短評，不是佔位。json 版口語有風格，試算表版偏說明性
- **例**（d1）：
  - json：「憲法法庭沒死，只是被鎖在抽屜裡——這篇說的是誰把鑰匙拿回來了。」
  - 收集區：「長期關心司法議題的張娟芬老師寫給非法律人的你瞭解！」
- **要決定的事**：貓頭鷹短評採哪一套聲音（這會定調整個網站的語氣）
- **誰能做**：編輯台
- **對照表**：`docs/content-rescue/track2-rescue.md` B 類

### P1-3　`opposing_views` 無處可存

- **狀態**：待架構決定
- **範圍**：僅 `d1` 一筆，2 個觀點，1,010 字元
- **問題**：`scripts/sync-content.mjs` 的輸出欄位中**沒有** `opposing_views`，跑 sync 會直接抹除
- **難點**：資料是巢狀結構（`stanceLabel` / `summary` / `fullArgument` / `source{}` / `editorialNote` / `editorialSources[]`），平面試算表放不下
- **附帶問題**：其 `source` 為佔位資料（`某學者` / `某大學法律系`），不應以此狀態對外
- **渲染位置**：`src/app/present/[id]/page.tsx`、`src/components/SharedPresent.tsx`
- **備份**：`docs/content-rescue/track2-rescue.md` 內含完整 JSON

### P1-4　`vibe` 存在兩套分類系統

- **狀態**：未統一
- **json 使用**：`🔥 公民必讀` `🌍 國際視角` `💬 正反交鋒` `📖 深度解析` `📣 懶人入門`（試算表**完全沒有**這 5 個）
- **試算表使用**：`💡 腦袋升級` `🎯 精準短評` `🔭 他山之石` `🔥 戰火猛烈`
- **分布**：`d1`–`d9` 用新的，`d11`–`d17` 用舊的
- **判讀**：有人設計了更細的分類但只做了一半
- **誰能做**：編輯台決定最終分類表 → 工程師建立選項限制

---

## P2 — 結構性問題（不修就會再發生一次）

### P2-1　Track 1 完全沒有把關

- **證據**：`scripts/sync-content.mjs`

  ```js
  // Track 1 — 沒有把關
  .filter(row => !row.status || row.status.toLowerCase() === 'approved')
  // Track 2 — 有把關
  .filter(row => row.status && row.status.toLowerCase() === 'approved')
  ```

- **問題**：`SSOT_Editor` 的 Track 1 **沒有 `status` 欄位**，所以 `!row.status` 永遠成立 → 每一列無條件放行
- **後果**：這就是 P0-1 那 15 筆壞資料能上線的原因
- **修法**：Track 1 加 `status` 欄，並把過濾條件改為嚴格模式

### P2-2　兩張 SSOT 落差巨大

| | 收集區 | Editor |
|---|---|---|
| Track 1 | 42 列 | 25 列 |
| Track 2 | 44 列 | 17 列 |
| h2 釋字272 | 已改正 | 仍是錯的 |
| d3（郭銘松 Part II） | 有完整內容 | `status` 空白 → 未上線 |
| d18 | 有 | 無 |

- **`收集區` 才是內容真相，`Editor` 又舊又壞**

### P2-3　`收集區` 的欄位標題含註解，技術上不能當 sync 來源

- **證據**：標題是 `id (給系統看的編號)`、`content （現有為AI生成）`、`owl comment (允鍾如果有靈感可以寫一句短評)`
- **問題**：sync 用 `row.id`、`row.content` 精確比對標題字串，這些全都會抓不到值
- **修法**：標題清乾淨，註解移到「使用說明」分頁或儲存格註解

### P2-4　「必填」用底色標記，機器讀不到

- **現況**：`使用說明` 分頁寫「粉紅底色欄位：必填／黃底色欄位：選填」
- **問題**：顏色無法被 sync 驗證，複製時也不一定帶得走 → 這個約定**無法被強制執行**
- **修法**：改用獨立欄位或在 sync 加必填驗證

### P2-5　`.env.local` 只在你本機，其他人跑不了 sync

- **內容**：`TRACK_1_CSV_URL`、`TRACK_2_CSV_URL`（值不記錄於此）
- **後果**：協作者拿到 repo 也無法同步內容，這條產線實質上只有你一個人能操作
- **修法**：`.env.example` 記錄變數名稱與取得方式，或改用可公開的發布網址

### P2-6　sync 已將近 4 個月沒跑

- **證據**：`git log -1 -- src/data/discussions.json` → 2026-05-02
- **後果**：`收集區` 之後的所有編輯都沒有上線，包含專家對 h2 的改正

### P2-7　殭屍分頁與備份檔名

- `SSOT_Editor` 的 `工作表3` 是 `Track 1_history` 的舊複本（只有 h1–h14）
- `20260803中研院討論會/10篇憲法敘事專題篩選池_備份` — 手動備份是沒有版控時的求生反應
- Track 1 的 id 跳號：缺 `h8` `h9` `h12` `h13`

### P2-8　`npm run build` 會執行 sync ⚠️ 這是壞資料能自動上線的真正原因

- **狀態**：已暫時緩解（Vercel 環境變數停用），**尚未從根本解決**
- **證據**：`package.json`

  ```json
  "build": "node scripts/sync-content.mjs && next build"
  ```

- **意義**：Vercel 每次部署都執行 `npm run build`，因此**每次部署都會重新抓一次試算表資料**。不需要有人手動跑 sync，只要有人推 code 觸發部署，壞資料就會自動上線 —— 而且沒有人看過 diff、沒有人核可
- **這解答了體檢時未解的疑問**：壞資料如何在無人操作的情況下抵達線上
- **暫時緩解**：Vercel 的 `TRACK_1_CSV_URL` / `TRACK_2_CSV_URL` 已改名加 `_disabled`（2026-08-31），sync 會 skip 且退出碼為 0，部署不受影響（已實測）
- **根本解法**：[design.md](../content-pipeline/design.md) 不變式 #1 —— 部署不得執行 sync。對應施工項目 8

### P2-9　編輯台沒有預覽介面，核可的人看不到成品

- **狀態**：已納入設計，待施工
- **問題**：核可者只能看試算表儲存格，無法看見網站呈現。這是 test 字串與佔位摘要能通過核可的根源
- **既有的 `/preview` 路由不是解答**：它是寫死假資料的視覺風格對照頁，與實際內容無關
- **解法**：PR 的 Vercel preview 網址（[design.md](../content-pipeline/design.md) 第五節）。已確認不需獨立 staging

---

## P3 — 協作與資料整理

### P3-1　Google Drive 資料夾沒有分享給任何人

- **證據**：`2026_憲庭加好友`、`SSOT_Editor`、`網站內容收集` 的權限皆為 `ipawei@gmail.com (owner)` 一人
- **矛盾**：表格取名 SSOT（single source of truth），卻沒有任何人拿得到
- **唯一的反向例外**：`網站內容收集/憲法題庫/` 與 `Past and Future of the TCC` 的 owner 是 `huichieh@gmail.com` → 目前協作是**單向**的（別人分享進來，你沒有開出去）
- **卡在**：需要協作者名單與 email

### P3-2　協作者身分待確認

| 線索 | 待確認 |
|---|---|
| `huichieh@gmail.com` | 是否為黃丞儀？（`收集區` d5 作者為黃丞儀，且有 20260803 中研院討論會） |
| 「允鍾」 | `收集區` 的 owl comment 欄標題寫「允鍾如果有靈感可以寫一句短評」 |
| 其他 | 撰稿人選盤點、受訪學者專家名單（在本機 `憲庭加好友文件/網站書籍策劃/`）尚未盤點 |

### P3-3　三處資料重複

| 內容 | 位置 A | 位置 B | 建議 |
|---|---|---|---|
| Constitution magazine 50 張照片 | Drive `其他參考內容/` | 本機 `憲庭加好友文件/` | 擇一（約 200MB） |
| 聊聊紀錄 | Drive `聊聊紀錄/` | repo `docs/meetup-chats/` | 擇一 |
| 黑客松提案 | Drive `黑客松提案文件/` | 本機 `g0v黑客松提案/` | 擇一 |
| 讀物清單 | 本機根目錄 | 本機 `網站書籍策劃/` | 擇一 |

### ~~P3-4　資料夾規劃方案未定案~~ ✅ 已定案

- **狀態**：**已定案**（2026-08-31），完整設計見 [`../content-pipeline/design.md`](../content-pipeline/design.md)
- **三項決定**：
  1. **驗證失敗即中止** —— 採用。這是本次唯一新增的常設檢查，已取得明確核可
  2. **`opposing_views` 攤平成 `Track 2_opposing` 分頁** —— 一列一觀點，以 `discussion_id` 標明歸屬，sync 讀取時分組還原
  3. **預覽用 PR preview，不做獨立 staging** —— 編輯台決策者可直接使用 GitHub
- **SSOT**：`SSOT_收集區` 改名為 `SSOT` 升為唯一真相，`SSOT_Editor` 封存
- **後續**：施工項目見 design.md 第七節，共 10 項，有嚴格相依順序

### P3-5　`docs/constitution-features/` workflow 版本過舊

- `commissioned-by: spacedock@0.9.5`，現行為 0.27
- 若要用 workflow 推進上述項目，需先 refit
- **目前決定：暫不進 workflow**

### P3-6　`收集區` 有 17 筆從未上線

- **狀態**：待確認
- **範圍**：`h30`–`h46`。`收集區` Track 1 實際有 42 筆（h1–h46，中間跳號），線上僅 25 筆
- **待確認**：這 17 筆是尚未核可，還是在人工複製時被遺漏
- **注意**：此為內容範圍問題，不在 P0-1 的修復範圍內

### P3-8　🚨 發布前必須移除 noindex

- **狀態**：已加入（2026-08-31），**發布時必須移除**
- **位置**：`src/app/layout.tsx` 的 `metadata.robots`

  ```ts
  robots: { index: false, follow: false },   // ← 發布前刪除這行
  ```

- **為什麼加**：查證發現專案原本無 `robots.txt`、無 `noindex`，且 metadata 含完整 OpenGraph／Twitter card（為分享而最佳化）。「不會被 Google 查到」當時僅成立於「尚無人公開張貼連結」。只要有人把網址貼上 Facebook 等平台一次即可能被收錄
- **驗證方式**：

  ```bash
  npm run build
  grep -o '<meta name="robots" content="[^"]*"' .next/server/app/index.html
  ```

  加入時應輸出 `noindex, nofollow`；**發布後應查無此標籤**
- **風險**：忘記移除會導致網站永遠不出現在搜尋結果。這是常見的上線事故，故獨立列項追蹤
- **程式碼內已加註解**指向本項目

### P3-7　`chapter` 欄位設計已被放棄

- **狀態**：待決定
- **現況**：僅 `h1`–`h14` 有值（如「第六課：民主政治與選舉」），`SSOT_收集區` 連此欄位都未建立
- **設計意圖**：Track 1「課本 vs 現實」對照結構中的課本章節
- **選項**：正式廢除（移除欄位與渲染），或補齊 42 筆
- **不宜維持現狀**：半數有值半數沒有，是最糟的狀態

---

## 附錄：如何重跑這份體檢

```bash
cd Constitution

# Track 1 結構檢查
python3 -c "
import json,re
h=json.load(open('src/data/history.json'))
bad=[r['id'] for r in h if not re.fullmatch(r'\d{4}',str(r['reality']['year']).strip())
     or not str(r['reality']['ruling_id']).strip()]
print(f'{len(bad)}/{len(h)} 筆結構壞掉:',bad)"

# Track 2 佔位／測試資料檢查
python3 -c "
import json
d=json.load(open('src/data/discussions.json'))
for r in d:
    ab=r.get('abstract') or ''
    f=[]
    if 'test' in ab.lower(): f.append('TEST字串')
    if '快速了解最新判決的5個重點' in ab: f.append('佔位摘要')
    if f: print(r['id'],'->','、'.join(f))"

# sync 腳本沒有處理的欄位
python3 -c "
import json
d=json.load(open('src/data/discussions.json'))
sync={'id','category','title','author','year','abstract','link','views',
      'owl_comment','owl_depth_comment','vibe','sticky','full_content'}
for r in d:
    x=[k for k in r if k not in sync]
    if x: print(r['id'],'->',x)"

# 最後同步時間
git log -1 --format='%ad %s' --date=short -- src/data/discussions.json
```

---

## 建議處理順序

~~4. **P0-1** 修 15 筆欄位錯位~~ ✅ 完成（`8d3f8f9`）
~~5. **P3-4** 拍板產線方案~~ ✅ 完成（[design.md](../content-pipeline/design.md)）

剩餘：

1. **P1-1** 把 A 類 3 筆貼回試算表 —— 解除「不能跑 sync」的限制。**只有人工能做，且是後續所有步驟的前提**
2. **P0-3 / P0-4** 清掉 test 字串與佔位摘要 —— 對外可見，成本低。產線斷開後可直接改 json
3. **P0-2** 找法學協作者確認 h2 —— 卡在別人身上，越早問越好
4. **design.md 施工項目 2–10** —— 依序執行，重建產線

---

## 進度紀錄

| 日期 | 項目 | commit |
|---|---|---|
| 2026-08-31 | 搶救 `discussions.json` 僅存於 repo 的人工內容 | `94c6356` |
| 2026-08-31 | 體檢報告與待辦清單 | `3e1126e` |
| 2026-08-31 | 修復 Track 1 的 15 筆欄位錯位 | `8d3f8f9` |
| 2026-08-31 | `chapter` 為空時不渲染標題 | `f4ae418` |
| 2026-08-31 | Vercel 環境變數停用（人工，非 commit） | — |
| 2026-08-31 | 產線設計定案 | `ead9373` |
| 2026-08-31 | 補上 d2/d4/d6 真實摘要 | `8890d8d` |
| 2026-08-31 | 移除 tldr 止血 | `d397059` |
| 2026-08-31 | 加入 noindex、受眾與緊急度修正 | `3cdb4a0` |
| 2026-08-31 | merge 進 main（fast-forward，8 commits） | — |
| 2026-08-31 | 自 `75df766` 還原被 sync 覆蓋的摘要與 tldr | `fe04178` |
| 2026-08-31 | SSOT 回填清單、session debrief | 本次 |
