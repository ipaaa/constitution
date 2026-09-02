# 憲庭加好友 — 內容產線待辦清單

體檢日期：2026-08-31　　最後更新：2026-09-01

本清單依**危險程度**排序，不是依工作量。每一項都附證據與驗證指令，可自行重跑確認。

**產線設計已定案**，見 [`../content-pipeline/design.md`](../content-pipeline/design.md)。P2、P3 的多數項目已被該設計吸收為施工項目。

---

## 📁 這件事的文件放在哪

| 想知道什麼 | 看哪一份 |
|---|---|
| **出了什麼事、為什麼會上線** | [`2026-08-31-content-pipeline.md`](./2026-08-31-content-pipeline.md)　←　**先看這份**。「三個破洞 → 四道防線」的因果總表在文件上方的「第二次補述」 |
| **還有什麼要做、誰做** | 本檔案 |
| **產線的一切**（目標、現況、進度、規格、施工順序） | [`../content-pipeline/design.md`](../content-pipeline/design.md) ← 產線只有這一份 |
| **被搶救出來的內容** | [`../content-rescue/`](../content-rescue/) —— 回填清單、短評網站版備份 |

> ⚠️ 體檢報告的「三、根因」寫於 2026-08-31，**不完整** —— 它解釋了資料為什麼會壞，但沒解釋為什麼會上線。缺的那塊（每次部署都自動重跑同步）在同一份文件的第二次補述裡。

---

## ⛔ 動工前必讀

```
不要執行：
  node scripts/sync-content.mjs
  npm run sync-content
  npm run build          ← build 也會跑 sync
```

**這條禁令尚未解除。** 2026-09-01 更新：搶救內容已回填試算表（原本的解除條件），
但**同步程式還沒改寫**，所以現在跑它仍會出問題：

- 它不認識 `site_tldr` 分頁 → 網站的摘要區塊會消失
- Track 1 的把關仍是壞的 → `status` 空白也放行
- 檢查機制還沒有 → 有問題只印警告，繼續寫入

**真正的解除條件**：完成 [`../content-pipeline/design.md`](../content-pipeline/design.md)
第五節的施工項目 7 與 8。

要驗證改動，用 `npx tsc --noEmit` 與 `npm run dev`（`dev` 不含同步）。

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

產線的目標、現況、進度、施工順序**全部集中在一份文件**：
[`../content-pipeline/design.md`](../content-pipeline/design.md)

本清單只列產線以外、或卡在人的項目。產線本身的施工進度不在這裡重複記錄。

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

### ~~2. 回填 SSOT 的 10 格~~ 🟡 **大部分已完成（2026-09-01 查核）**

→ [`../content-rescue/ssot-backfill.md`](../content-rescue/ssot-backfill.md)

直接讀 `SSOT_收集區` 查核，非依回報：

- ✅ **6 格已完成**：d7/d8/d9 的 abstract 與 owl comment，與清單逐字相符
- ✅ d7 vibe 已更新為 `📣 懶人入門`
- ✅ **d8/d9 vibe 已確認**：三支 Reels **刻意統一**為 `📣 懶人入門`（2026-09-01 captain 裁示）。回填清單原訂的 `💬 正反交鋒` / `🔥 公民必讀` 作廢
- 🔄 tldr 那格**已被結構變更取代** —— 見下方 P1-5

**回填工作到此結束，SSOT 內容面已無待辦。**

### 3. ~~P1-5　`site_tldr` 通不到網站~~ ✅ **已納入設計（2026-09-01）**

你把 tldr 從 `Track 2_discussion` 移出、改放進 `site_tldr` 分頁並改成一列一重點 —— **這個判斷是對的**，它修掉了 design.md 原本的一個矛盾：

- 原設計把 tldr 當 Track 2 的一列（第四節驗證範例即以它為例）
- 但原設計要求 Track 2 的 `year`／`vibe` 必填，而 tldr 兩者皆空
- 加上「驗證失敗即中止、全有全無」→ **照原設計施工完，第一次跑 sync 就會被自己擋下來**

**已於 [design.md](../content-pipeline/design.md) 補齊**：分頁定義、欄位規則、sync 還原方式、驗證規則、施工項目 4／6b／7。詳見該文件文末修訂紀錄。

仍須留意的兩個靜默失敗點（已寫入設計，施工時對照）：

- `id: 'tldr'` 不可更動 —— `OfficialTLDR` 的 `if (!item) return null`（`src/app/present/page.tsx:75`）會讓取不到時整塊消失，不報錯、不擋 build
- ~~`order 0` 那列的 `status` 空白~~ ✅ **已補為 `Approved`**（2026-09-01，由發布的 CSV 實測確認，非依回報）

**附帶問題已解決**：`site_tldr` 曾有兩個同名 `status` 欄，2026-09-01 已由人工移除，僅留一欄。現行欄位為 `order | label | text | status | link`（已直接讀 SSOT 確認）。該情境已寫成 design.md 的共通驗證規則。

現在的狀態：

```
① SSOT   ✅ ──✂── ② repo ✅ ──✅── ③ 線上 ✅
         ↑
   內容與結構都就緒，剩「把線接回去」的工程施工
```

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

</details>

---

### ~~P0-4　6 筆佔位摘要~~ ✅ 已完成

- **狀態**：**全部修復**
  - `d2` `d4` `d6` —— 自 `SSOT_收集區` 取真實摘要（commit `8890d8d`）。與未來 sync 結果一致，未製造新分歧
  - `d7` `d8` `d9` —— 自 commit `75df766` 還原 2026-04-16 寫好的摘要（commit `fe04178`）
- **驗證**：`test字串: 無　佔位摘要: 無`
- **待回填 SSOT**：`d7/d8/d9` 三則摘要從未進入試算表，見 P1-1

---

### ~~P0-5　`d1` 的反方意見掛著虛構出處~~ ✅ 已刪除（2026-09-01）

- **狀態**：**已移除**。從 `discussions.json` 的 `d1` 刪掉整個 `opposing_views` 欄位（37 行），剛好對應當初加進來的行數
- **為什麼刪資料就夠**：渲染那行是 `{item.opposing_views && item.opposing_views.length > 0 && (...)}`，沒資料就不渲染，「立場觀點」整個區塊自動消失。元件與型別保留未動，因為 `019` 那張票還開著
- **驗證**：假出處出現次數 `0`；資料仍為 16 筆；`npx tsc --noEmit` 通過

<details>
<summary>原始問題記錄（含來歷追查）</summary>

- **線上位置**：`https://constitution-nine.vercel.app/present/d1` 的「**立場觀點**」區塊，兩張卡片的出處行
- **程式位置**：`src/components/opposing-views/OpposingViewCard.tsx` L17–23，把 `author`／`affiliation`／`year` 以「，」串成一行直接顯示
- **資料位置**：`src/data/discussions.json` → `d1` → `opposing_views`（**全站只有這一筆有**）
- **內容**：

  | | 立場 | 掛的出處 |
  |---|---|---|
  | 觀點 1 | 認為法庭應尊重國會多數決 | `某學者，某大學法律系，2025` |
  | 觀點 2 | 認為大法官自行解除門檻缺乏程序正當性 | `某法官，司法院，2026` |

- **為何列 P0，而非 P1-3 的附帶問題**：論述本身是**真的** —— `summary`／`fullArgument`／`editorialNote` 都有實質內容，`editorialSources` 還引了張嘉尹與蘇彥圖的真實連結。**只有掛名是虛構的。** 對法學背景的工作夥伴而言，這不會被讀成「還沒填」，而是「把一段論述掛在一個不存在的學者名下」。這與 `h2` 同一類：傷的是專業信任，且更難解釋
- **誰加的**：commit `58c433e`（2026-04-30 09:30），git 作者是 `ipa <ipawei@gmail.com>`、`Co-Authored-By: Claude Opus 4.6` —— **是 agent 在你的 session 裡寫的，掛在你的 git 身分下**
- **內容從哪來**：`015` 的 entity 文件裡有一節標題就叫 **「Sample data shape in `discussions.json`」**，那段示範 JSON 用 `某學者` 當佔位值來說明資料結構。**實作時把那段結構示範直接當成真實內容寫進了 `discussions.json`。**
- **原本規劃的流程沒有執行**：同一份文件的「Data source & workflow」寫明 ①允中(邵允鍾)整理材料 → ②編輯台(蘇慧婕等)審查中立性 → ③才寫入 `discussions.json`。三步都沒發生
- **通過了 gate**：`015` 的 verdict 是 `PASSED`、score 0.7。示範資料被當成內容這件事，當時沒有被指出
- **誰能做**：編輯台決定 → 工程執行
- **選項**：
  1. **拿掉假掛名，改標為「編輯部整理」**（建議）—— 這兩段本來就是編輯部的整理，照實說即可，不必找人掛名
  2. **補上真實出處** —— 觀點 2 就是三位大法官不同意書的立場，可正當引用；觀點 1 的「反多數決困境」是通說，但需指定願意掛的那份文獻
  3. **這一筆先不顯示**，等允中的材料到位再上
- **驗證**：
  ```bash
  grep -c "某學者\|某法官\|某大學法律系" src/data/discussions.json   # 應為 0
  ```
- **關聯**：此項與「反方意見要不要進 SSOT」是兩件事，見 P1-3

</details>

---

## P1 — 資料有遺失風險

### P1-1　搶救內容尚未搬回試算表　🔔 明天的第一項工作

- **狀態**：已備份、已擴充，**未搬回**
- **完整清單**：[`../content-rescue/ssot-backfill.md`](../content-rescue/ssot-backfill.md) —— 共 **10 格**，含儲存格位置與可直接複製的內容
- **範圍已擴大**：原本只有 3 格 owl 短評，2026-08-31 追查後發現 d7/d8/d9 的 abstract 與 tldr 三重點也只存在於 repo（皆自 commit `75df766` 還原），故回填範圍為 10 格
- **誰能做**：只有你（Drive connector 無寫入儲存格能力，只能讀）
- **這是解除「不能跑 sync」限制的前提**
- **不做的後果**：產線接通後這批內容將被**第三次**覆蓋（前兩次沿革見清單檔）

### ~~P1-2　5 筆短評有兩個版本，需編輯台裁決~~ ✅ 已決定（2026-09-01）

- **決定**：**採用試算表版。**
- **受影響**：`d1` `d2` `d4` `d5` `d6`
- **不需要動手** —— 同步程式一接通，就會自動用試算表版覆蓋網站版
- **網站版已完整備份**：[`../content-rescue/owl-comments-website-version.md`](../content-rescue/owl-comments-website-version.md)
- **例**（d1）：
  - 網站版（將被覆蓋）：「憲法法庭沒死，只是被鎖在抽屜裡——這篇說的是誰把鑰匙拿回來了。」
  - 試算表版（採用）：長期關心司法議題的張娟芬老師寫給非法律人的你瞭解！

⚠️ **副作用，之後看 PR 時會遇到**：`d7`／`d8`／`d9` 的引號口語版已於 8/31 回填進試算表，所以覆蓋後全站會變成「`d7`–`d9` 是口語、其餘是說明性」。要不要統一另外再說，備份檔裡有完整說明。

### P1-6　確認網站版短評是不是 AI 生成的　🔍 你要查的

- **狀態**：待你確認
- **要查什麼**：`d1` `d2` `d4` `d5` `d6`（以及同風格的 `d7` `d8` `d9`）那批「」引號版短評，是人寫的還是 AI 生成的
- **為什麼要查**：若是 AI 生成而未經審閱，那就跟 `h2` 的法律錯誤、`d1` 的虛構出處是同一類問題 —— 以專業口吻寫出來、但沒有人背書的內容
- **全文在哪**：[`../content-rescue/owl-comments-website-version.md`](../content-rescue/owl-comments-website-version.md)
- **已查到的線索**：
  - 進入 repo 的時間點是 `75df766`（2026-04-16），commit 訊息寫「replace shared owl_comment/vibe/abstract **placeholders** with unique per-article copy」
  - **該 commit 沒有 `Co-Authored-By` 標記** —— 相對地，已確認為 agent 所寫的 `58c433e`（反方意見）就有明確的 `Co-Authored-By: Claude Opus 4.6`
  - 所以**從 git 紀錄判斷不出來**，需要你回想或另外查
- **可參考的特徵**：這五則句構高度一致（白話重述＋破折號＋一句收尾，整句用「」包起來）。可能是同一人一次寫完，也可能是生成的
- **若確認是 AI 生成**：因為已決定改用試算表版，這批內容本來就會被覆蓋掉，屆時問題自然消失。但仍值得知道 —— 因為要確認**同一批作業裡還有沒有別的東西**是這樣進來的

### P1-3　`opposing_views` 無處可存

- **狀態**：待架構決定
- **範圍**：僅 `d1` 一筆，2 個觀點，1,010 字元
- **問題**：`scripts/sync-content.mjs` 的輸出欄位中**沒有** `opposing_views`，跑 sync 會直接抹除
- **難點**：資料是巢狀結構（`stanceLabel` / `summary` / `fullArgument` / `source{}` / `editorialNote` / `editorialSources[]`），平面試算表放不下
- ~~**附帶問題**：其 `source` 為佔位資料~~ → **已升級為獨立項目 P0-5**（對外可見、傷專業信任，不該埋在架構問題底下）
- **渲染位置**：`src/app/present/[id]/page.tsx`、`src/components/SharedPresent.tsx`
- **備份**：`docs/content-rescue/track2-rescue.md` 內含完整 JSON

**2026-09-01 —— `Track 2_opposing` 這個解法重新打開討論：**

captain 提出：「**我從來不想收集反方意見**」。查證後這不是矛盾，而是兩件事被混在一起了：

| | 誰決定的 | 狀態 |
|---|---|---|
| **呈現**反方意見 | 0416 會議 46:12 的決定，feature `015` 已實作、`019` 為 captain 自行開立的後續 | 已上線 |
| **用試算表收集**反方意見 | **沒有人要求過** —— 是 design.md（2026-08-31）為了解決「`opposing_views` 在試算表無處可放」而提出的機制 | 待決定 |

0416 的原始決定是「**編輯加工**」而非「收集投稿」，紀錄明載由**允中整理材料**。若內容是編輯部策展、而非投稿者填寫，那麼「開一個分頁讓人填」本來就是錯的機制。

**已決定（2026-09-01）：不建 `Track 2_opposing`，不收集反方意見。** 已自 design.md 移除。

**連帶**：施工項目 6 取消，工程的人工前置歸零，可立即開工。

**尚待處理**：`d1` 那筆 `opposing_views` 目前直接躺在產物 `discussions.json` 裡（違反不變式 #2），且掛著虛構出處 —— 見 **P0-5**。不可留給 sync 順手抹掉：那等於用一次靜默覆蓋去修一個靜默錯誤，正是本次體檢要根除的模式。

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

**2026-09-01 更新 —— 半套已完成，但危險反而提高了：**

- ✅ `SSOT_收集區` 的 Track 1 **已有 `status` 欄**，h1–h46 多數標為 `Approved`
- ❌ 但 `sync-content.mjs` 的過濾條件**沒改**，仍是寬鬆模式：

  ```js
  .filter(row => !row.status || row.status.toLowerCase() === 'approved')
  //              ^^^^^^^^^^^ 空白 = 放行
  ```

- 🚨 **h2 的 `status` 目前是空白** —— 就是那筆待法學確認的釋字272（P0-2）

  若空白是刻意用來「先擋著、等確認」，**這個意圖不會生效**：寬鬆過濾會照樣放行。
  有了 `status` 欄卻配寬鬆過濾，比完全沒有欄位更危險 —— 人會以為擋住了。

  （附帶：`收集區` 的 h2 內容**已是改正後的訴訟權版本**，所以真放行反而會修好 h2。但「擋不住」這個機制缺陷與內容對錯無關，仍須修。）

- **修法不變，且更急**：過濾改為 `row.status && row.status.toLowerCase() === 'approved'`，與 Track 2 一致

### P2-2　兩張 SSOT 落差巨大

| | 收集區 | Editor |
|---|---|---|
| Track 1 | 42 列 | 25 列 |
| Track 2 | 44 列 | 17 列 |
| h2 釋字272 | 已改正 | 仍是錯的 |
| d3（郭銘松 Part II） | 有完整內容 | `status` 空白 → 未上線 |
| d18 | 有 | 無 |

- **`收集區` 才是內容真相，`Editor` 又舊又壞**

### ~~P2-3　`收集區` 的欄位標題含註解，技術上不能當 sync 來源~~ ✅ 已定案（改由程式處理）

- **證據**：標題是 `id (給系統看的編號)`、`content （現有為AI生成）`、`owl comment (允鍾如果有靈感可以寫一句短評)`
- **問題**：sync 用 `row.id`、`row.content` 精確比對標題字串，這些全都會抓不到值
- ~~**修法**：標題清乾淨，註解移到「使用說明」分頁或儲存格註解~~

**2026-09-01 改採相反方向 —— 中文說明保留，由程式解析。**

captain 指出那些中文是寫給學者老師看的，刪掉編輯端就失去欄位指引。而且「大家記得不要在標題加註解」是一條沒人在看的人為約定，本身就違反 design.md 不變式 #6（約定必須可被機器驗證）—— 原修法把成本推給人，還留了一個會靜默失效的缺口。

改為**最長前綴比對**：預期欄位表已知，故不必猜註解從哪開始；解析不出來就中止並指名，不靜默把整欄變空。規則與實測見 [design.md 第二節](../content-pipeline/design.md)。

**已實測**（以現行 `parseCSV` 與真實標題，非等價重寫）：22 個真實標題全數正確；無括號、全形空格、破折號、中括號、大小寫、`owl` 前綴混淆等 6 種變形皆正確；真實錯字 `ruling_di` 正確中止。

**你不用改試算表上的任何標題。**

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

- **狀態**：**現在刻意保持著，不要動**（2026-09-01 確認）—— 目前就是不要讓 Google 搜尋得到。**等真的要對外發布時才移除**
- **原狀態**：已加入（2026-08-31），**發布時必須移除**
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

~~1. **P1-1** 把 A 類 3 筆貼回試算表~~ ✅ 6/10 格完成（2026-09-01 查核）
~~2. **P0-3 / P0-4** 清掉 test 字串與佔位摘要~~ ✅ 完成（`fe04178`、`8890d8d`）

~~3. **d8/d9 vibe 確認**~~ ✅ 完成（刻意統一為 `📣 懶人入門`）
~~4. **P1-5** `site_tldr` 斷點~~ ✅ 已納入 design.md，不再是獨立待辦

剩餘（2026-09-01 再次重排）：

~~1. **P0-5：`d1` 的虛構出處**~~ ✅ 已刪除（2026-09-01）
~~2. **P1-2：短評採哪一套聲音**~~ ✅ 已決定用試算表版（2026-09-01）
2. **改寫 sync**（design.md 項目 7–10）—— 工程。P2-1 的嚴格過濾、P2-3 的標題解析都含在項目 7 內，不另外開票
3. **P0-2** 找法學協作者確認 h2 —— 卡在別人身上，越早問越好，與產線施工無相依，可平行進行

可延後、不擋任何事：`status` 設保護範圍（等有協作者）、`vibe` 改下拉選單。

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
| 2026-08-31 | SSOT 回填清單、session debrief | `5e6048d` |
| 2026-09-01 | push 完成、線上驗證 | `060882d` |
| 2026-09-01 | 查核 SSOT 回填進度（6/10 完成）、發現 P1-5 `site_tldr` 斷點、P2-1 有實際受害者 | `bdd0060` |
| 2026-09-01 | 回填結案（vibe 統一裁示）；`site_tldr` 納入 design.md，修掉原設計中 tldr 必填欄位的矛盾 | `862b081` |
| 2026-09-01 | 推翻「標題不得帶註解」，改由程式最長前綴比對；以真實 CSV 與現行 `parseCSV` 實測通過；施工項目 2 取消 | 本次 |
