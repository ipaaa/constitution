# 憲庭加好友 — 內容產線待辦清單

體檢日期：2026-08-31　　最後更新：2026-08-31

本清單依**危險程度**排序，不是依工作量。每一項都附證據與驗證指令，可自行重跑確認。

---

## ⛔ 動工前必讀

```
在 A-1 完成之前，不要執行：  node scripts/sync-content.mjs
```

`src/data/discussions.json` 已被人工編輯，內含試算表裡不存在的內容。現在跑 sync 會用試算表的舊值／佔位值覆蓋掉線上較好的版本，並抹除 `opposing_views`。

備份已存於 `docs/content-rescue/`（commit `94c6356`），但**備份不等於解除風險** —— 只有把內容搬回試算表才算。

---

## 產線現況

```
寫作者（法學者・編輯・允鍾）
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

## P0 — 線上正在對外出錯

### P0-1　Track 1 有 15 筆欄位錯位（25 筆中的 60%）

- **狀態**：未處理
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

---

### P0-2　h2 的釋字第272號內容錯誤（法律錯誤）

- **狀態**：**待法學確認** — 不要在確認前修改
- **影響**：網站正在散布錯誤的法律內容
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

### P0-3　`tldr` 的測試字串正在線上顯示

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

### P0-4　6 筆佔位摘要對外顯示

- **狀態**：未處理
- **受影響**：`d2` `d4` `d6` `d7` `d8` `d9`
- **內容**：全部是同一句「快速了解最新判決的5個重點，不再被複雜的法律用語卡住！」
- **注意**：`d2` 的真摘要在 `收集區` 就有（"The lead-up to the 2025 Judgment was fraught with intense constitutional conflicts…"），只是沒同步過來
- **誰能做**：編輯台補寫，或從 `收集區` 取值

---

## P1 — 資料有遺失風險

### P1-1　搶救內容尚未搬回試算表

- **狀態**：已備份，**未搬回**
- **檔案**：`docs/content-rescue/track2-paste-into-sheet.tsv`
- **A 類・孤兒 3 筆**（`d7` `d8` `d9`）：試算表對應欄位為空，json 是唯一版本。**純新增，無爭議，可直接貼**
- **誰能做**：只有你（Drive connector 無寫入儲存格能力）
- **這是解除「不能跑 sync」限制的前提**

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

### P3-4　資料夾規劃方案未定案

- **已釐清的前提**：編輯台「只核可，不改內容」→ 兩張表可合併
- **建議方案**：一張表 + `status` 欄用 Google 試算表「保護範圍」鎖住，只有編輯台能改；sync 只收 `Approved`
- **效果**：把關保留且變嚴（Track 1 第一次有閘門），同時消除人工搬運這個錯誤來源
- **待你拍板**

### P3-5　`docs/constitution-features/` workflow 版本過舊

- `commissioned-by: spacedock@0.9.5`，現行為 0.27
- 若要用 workflow 推進上述項目，需先 refit
- **目前決定：暫不進 workflow**

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

1. **P1-1** 把 A 類 3 筆貼回試算表 —— 解除「不能跑 sync」的限制
2. **P0-3 / P0-4** 清掉 test 字串與佔位摘要 —— 對外可見，成本低
3. **P0-2** 找法學協作者確認 h2 —— 卡在別人身上，越早問越好
4. **P0-1** 修 15 筆欄位錯位 —— 量最大，但機械性
5. **P3-4** 拍板資料夾／產線方案 —— 決定之後 P2 系列才有做的意義
6. **P2 系列** 修結構，讓上述問題不會再發生一次
