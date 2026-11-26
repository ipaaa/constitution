---
commissioned-by: spacedock@0.29.0-pre0
entity-type: content_article
entity-label: article
entity-label-plural: articles
id-style: slug
state: $inline
stages:
  # Stage names must match ^[a-z0-9][a-z0-9-]*[a-z0-9]$
  defaults:
    worktree: false
    concurrency: 2
  states:
    - name: draft
      initial: true
    - name: review
      feedback-to: draft
    - name: approved
      terminal: true
---

# 憲庭加好友 — 內容審稿流程（pilot）

試算表（SSOT）的每一列是一篇 article。每篇 article 匯出成一份 Markdown 審閱頁，發布到 Spacedock Review。
專家用留言審稿，責任編輯（owner）在 Review 頁面做最後決定。審稿結果記錄在 article 的 frontmatter 與 `## Review record`。

**範圍：** 試算表 SSOT_收集區中所有有內容的列，不論 `status`：`Track 1_history` 的 `h*`（42 列，含尚未核可的 h2、h28），`Track 2_discussion` 的 `d*`（含尚未核可的 d3）與 TL;DR 分頁的 `tldr`。T1 與 T2 各有一頁索引。

> **2026-11-25 補述：** 原本內容取自網站資料檔 `src/data/history.json`、`discussions.json`（2026-09-02 快照）。網站同步只匯出 `status` 為 `Approved` 的列，因此漏掉 h2、h28、d3。船長決定改為直接讀試算表（唯讀，`scripts/content-review/sheet.mjs`，用網站同步的同一組 CSV 網址），全部重新發布為新連結 v1，舊連結作廢。專案規範見 [`../../AGENTS.md`](../../AGENTS.md)。

## 審稿慣例

Spacedock Review 目前只有一位 owner（配對這台電腦的帳號），還不能指派審稿人。所以審稿用以下慣例：

1. **專家簽核：** 所有意見都是 Review 的留言（先登入 → 選取文字 → 輸入 → Add comment／Send；出現 Submit 時按下送出）。沒問題：選取該節標題，留言 `approved`（只有這個字，大小寫不拘）。要修改：選取有問題的字句，留言寫建議改法，一則一處，不寫 `approved`。
2. **只算登入的留言：** 留言者必須在 Review 頁面登入自己的帳號。沒登入的留言（Review 給的匿名代號）一律不算簽核，owner 看到也不採計，只當參考意見。審閱者可能是老師再委派的人（例如博士生），所以不設固定名單：誰的簽核算數，由 owner 把關。
3. **修改後的重審：** 修改一律由責任編輯謄到試算表。只有改過的節要重新簽核：試算表新文字與老師建議**逐字相同**時，first officer 在紀錄標「依老師建議修改」，由 owner 決定是否直接採計，不必重審；文字不同或另改別處時，該節要老師重新 `approved`。
4. **完整簽核：** 每一個 `##` 節都要有至少一則 `approved`，或其上的意見已處理完畢。
5. **最後核可：** owner 在頁面上按 Approve。按 Request changes 退回 `draft` 修改；按 Hold 則停在 `review`。
6. **兩種紀錄要分開讀：** owner 的決定由 `subspace-relay-client decision` 取得；專家的 `approved` 留言**不會**隨決定一起回傳，要另外用 `subspace-relay-client feedback` 讀全部留言才看得到（h1 pilot 實測，2026-11-20）。
7. **Review 不擋未簽核的核可：** owner 在部分節未簽核時仍按得下 Approve。first officer 記錄決定時，必須同時記錄各節簽核狀況，缺簽的節要標出來。

## File Naming

每篇 article 是一個資料夾 `{row-id}/`：

- `{row-id}/index.md` — entity 本體（狀態與審稿紀錄）。
- `{row-id}/{row-id}.md` — 發布到 Review 的審閱頁。檔名只能用 ASCII（Review 拒收中文路徑）。

Slug 等於試算表的 row id（例如 `h1`）。

## Schema

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | 留空；id-style 為 slug，row id 即 identity |
| `title` | string | `{row-id}｜{解釋字號}：{現實標題}` |
| `status` | enum | draft, review, approved |
| `source` | string | 內容來源，例如 `SSOT_收集區 Track 1_history 第 3 列（2026-11-25 讀取）` |
| `started` | ISO 8601 | 第一次發布審閱頁的時間 |
| `completed` | ISO 8601 | owner 核可的時間 |
| `verdict` | enum | PASSED（owner 核可）或 REJECTED |
| `score` | number | 優先度 0.0–1.0（選填） |
| `worktree` | string | 不使用，留空 |
| `issue` | string | 選填 |
| `pr` | string | 選填 |
| `sheet` | string | 試算表分頁名稱 |
| `review-url` | — | **不寫在 frontmatter。** 分享連結存在本機 `links.local.json`（不進 git），因為 repo 公開，拿到連結的人就能讀內容、留言 |
| `review-briefing` | string | 目前版本的 briefing id |
| `review-version` | number | 目前版本號 |
| `review-rev` | string | 目前版本審閱頁的 sha256 |
| `review-expiry` | ISO 8601 | 分享連結到期時間 |
| `owner-decision` | enum | approve, revise, hold，或空白（尚未決定） |
| `owner-decided-at` | ISO 8601 | owner 決定的時間 |

## Stages

### `draft`

article 進入流程或被退回修改時在此。

- **Inputs:** 試算表該列（`sheet.mjs` 唯讀讀取）、上一輪 owner 決定所附的留言。
- **Outputs:**
  - `{row-id}/{row-id}.md` 依試算表重新產生，分三區，以分隔線隔開：
    1. **🟦 使用說明**（最大標題，放在引用區塊內，顏色與審閱區不同）：老師 2 分鐘內讀完（約 140 字）。一句要看什麼、一行留言操作、「沒問題／要修改／有疑問」三列對照表、完成條件、上線版連結（`/past` 頁沒有單則連結，附搜尋字詞）、本頁已知問題。不是 `##` 節，不需簽核。
    2. **🟥 審閱內容**（最大標題）：模擬上線卡片（對照 `src/app/past/page.tsx`），依手機版順序分兩個 `##` 節：「左半邊｜憲法原則」與「右半邊｜大法官解釋」。這一區只放網站上的文字。
    3. **給編輯**（引用區塊）：試算表分頁、列號、狀態、讀取日期，與預覽元素對應的試算表欄位。
  - T1 的原則內文、手寫句、大標題、背景圖在試算表標為「現有為AI生成」，審閱頁一律標 `AI 初擬`，並在使用說明提醒查證（預設皆未經真人改寫）。T2 的貓頭鷹短評也標 `AI 初擬`（船長 2026-11-25 決定，對應 `docs/health-check/TODO.md` 的 P1-6）。
  - 尚未填寫的欄位列在「本頁已知問題」；不在網站上的列不顯示「看上線畫面」。
  - 用詞不稱「課本」：內容已超出公民課本範疇。
  - 手寫句用 CriticMarkup `{==…==}`，Review 顯示為藍底，對應網站的藍色手寫字（Review 不支援改文字顏色）。
  - 背景圖連結在產生時自動檢查，打不開就列在「本頁已知問題」，老師不必自己找
  - 退回修改時：修改先落在試算表，再重新匯出；不手改 `src/data/*.json`
- **Good:** 審閱頁逐字等於試算表內容；老師只讀上兩區就能審完，欄位對照留給編輯。
- **Bad:** 只改審閱頁、沒改試算表；把設計範例或佔位文字寫進審閱頁。

### `review`

審閱頁已發布，等專家留言與 owner 決定。這是等待外部回應的 stage。

- **Inputs:** `review-url`、`review-briefing`。
- **Outputs:**
  - owner 決定（`decision` 指令的結果）寫入 `owner-decision`、`owner-decided-at`
  - 各節專家簽核（`feedback` 指令讀到的 `approved` 留言）寫入 `## Review record`
  - Request changes：附帶的留言列入 `## Review record`，status 退回 `draft`
- **Good:** 決定與簽核都引用 briefing id 與版本；`binding: no` 的決定只記錄、不採用。
- **Bad:** 只看決定不看留言；把非 owner 的決定當成核可。

### `approved`

Terminal。owner 已核可目前版本。`verdict: PASSED`，`completed` 設為決定時間。

> 這只代表審稿通過。網站上線仍由試算表的核可機制（`review_decision`／`approved_by`，見 feature 040、050）把關，本流程目前不寫回試算表。

## Workflow-specific rules

- **分享連結不進 git。** 連結只寫在 `links.local.json`；`INDEX.md` 由它產生，也不進 git。換電腦或交接時，另外把 `links.local.json` 交給對方。

- **試算表是正本。** 審閱頁是匯出物；內容修改一律回到試算表。
- **不執行 `npm run sync-content`，不手改 `src/data/*.json`。** 見 `AGENTS.md`。
- **只有 owner 的 binding 決定算數。** `feedback` 顯示 `binding: no` 的決定只記錄。

## Workflow State

```bash
spacedock status --workflow-dir docs/content-review
```

索引頁：`INDEX.md`，由 `node scripts/content-review/build-index.mjs` 依各篇 `index.md` 產生：🟦 使用說明＋🟥 審閱清單，依年代分組（同網站「過去」頁），欄位為列、字號、標題（16 字截斷）、老師簽核（左／右）、編輯決定、審閱頁。
它的連結與 briefing 記在 `links.local.json` 的 `_index`。`INDEX.md` 含全部連結，也不進 git。
任何 article 狀態改變後，重新產生 `INDEX.md`，再以 `subspace-relay-client revise <索引連結> INDEX.md` 更新同一個連結。

審閱頁產生方式：

- T1：`node scripts/content-review/render-t1.mjs <row-id> docs/content-review/<row-id>/<row-id>.md`。版面模擬 `/past` 卡片，分「左半邊｜憲法原則」「右半邊｜大法官解釋」兩節。
- T2：`node scripts/content-review/render-t2.mjs <row-id> docs/content-review/<row-id>/<row-id>.md`。版面模擬 `/present/{id}` 文章頁，分「出處資訊」「重點整理」「貓頭鷹短評」三節（短評空白則不出現，與網站相同）；`tldr` 照列表頁「1 分鐘看懂」，只有一節。原始出處只有明確 404／410 才標為問題（Facebook、YouTube 常擋自動檢查）。網站的「反方觀點」（`Track 2_opposing`）目前無資料，有資料時再加一節。

T2 索引：`node scripts/content-review/build-index-t2.mjs` 產生 `INDEX-T2.md`（不進 git），依網站分類分組（1 分鐘看懂、民間報告、學者文章、影片）；連結記在 `links.local.json` 的 `_index_t2`。

## Article Template

```yaml
---
id:
title: h0｜釋字第 0 號：標題
status: draft
source: SSOT_收集區 Track 1_history 第 0 列（YYYY-MM-DD 讀取）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
sheet: Track 1_history
review-briefing:
review-version:
review-rev:
review-expiry:
owner-decision:
owner-decided-at:
---

一句話說明這篇 article。

## Acceptance criteria

**AC-1 — owner 已核可目前版本的審閱頁。**
Verified by: `subspace-relay-client decision <review-url> --briefing <review-briefing>` 回傳 `decision: approve`，且 `result.artifact.rev` 等於 `review-rev`。審閱頁內容改動即令 rev 不符而失敗。

**AC-2 — 每一節都有專家 `approved`。**
Verified by: `subspace-relay-client feedback <review-url>` 中，每個 `##` 節標題都有至少一則已登入帳號留下的 `approved` 留言。少一節即失敗。

## Review record
```

## Commit Discipline

- 每次發布、修訂或記錄決定後 commit。
