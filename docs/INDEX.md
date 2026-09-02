# 文件總索引

**狀態**：evergreen
**最後查核**：2026-09-01
**規則**：新增或刪除文件時，同步更新本檔。狀態定義見 [`../AGENTS.md`](../AGENTS.md)。

狀態三種：

- `evergreen` — 描述現況。內容變了就要更新。**過時的 evergreen 是危險的。**
- `plan` — 描述打算做的事。做完就封存。
- `record` — 某時間點的記錄。**不改寫。** 要修正就追加補述。

---

## 資料夾結構

```
AGENTS.md              工作規範（CLAUDE.md 為其 symlink）
docs/
  INDEX.md             本檔
  project/             專案定位、架構、技術、協作
  content-pipeline/    內容產線：目標、規格、操作
  health-check/        2026-08 產線體檢與待辦
  content-rescue/      搶救出來的內容
  meetup-chats/        會議記錄（本機限定，未進版控）
  _archive/            已過時、保留供追溯的文件
  constitution-features/   spacedock workflow（休眠）
  design-assets/           spacedock workflow（休眠）
```

---

## 現行文件

### 專案規範

| 路徑 | 用途 | 狀態 | 負責人 | 最後查核 |
|---|---|---|---|---|
| `AGENTS.md` | agent 與協作者的工作規範。禁止事項、溝通方式、寫作與文件規則 | evergreen | captain | 2026-09-01 |
| `docs/INDEX.md` | 本檔。全部文件的索引 | evergreen | captain | 2026-09-01 |

### 專案定位

| 路徑 | 用途 | 狀態 | 負責人 | 最後查核 |
|---|---|---|---|---|
| `docs/project/about.md` | 專案定位、三圈目標受眾、溝通策略 | evergreen | captain | 2026-09-01 |
| `docs/project/architecture.md` | 過去／現在／未來三軌的資訊架構 | evergreen | captain | 2026-09-01 |
| `docs/project/design-system.md` | 視覺美學、色彩、排版、吉祥物語言 | evergreen | captain | 2026-09-01 |
| `docs/project/tech-stack.md` | ⚠️ 技術選型正確，**資料流章節已過時**，檔頭有警告 | evergreen | captain | 2026-09-01 |
| `docs/project/contributing.md` | ⚠️ 角色分工正確，**任務認領流程已過時** | evergreen | captain | 2026-09-01 |

### 內容產線

| 路徑 | 用途 | 狀態 | 負責人 | 最後查核 |
|---|---|---|---|---|
| `docs/content-pipeline/design.md` | 產線的**唯一**規格文件：目標、現況、進度、規格、施工順序 | plan | captain | 2026-09-01 |
| `docs/content-pipeline/data-collection-guide.md` | ⚠️ T3 章節有效，**T1／T2 章節已過時**，檔頭有警告 | plan | captain | 2026-09-01 |

### 體檢與待辦

| 路徑 | 用途 | 狀態 | 負責人 | 最後查核 |
|---|---|---|---|---|
| `docs/health-check/2026-08-31-content-pipeline.md` | 體檢報告。出了什麼事、為什麼會上線。**含兩則補述，先看上方** | record | — | 2026-09-01 |
| `docs/health-check/TODO.md` | 待辦清單，依危險程度排序 | plan | captain | 2026-09-01 |

### 搶救出來的內容

| 路徑 | 用途 | 狀態 | 負責人 | 最後查核 |
|---|---|---|---|---|
| `docs/content-rescue/ssot-backfill.md` | 回填試算表的清單。已結案 | record | — | 2026-09-01 |
| `docs/content-rescue/owl-comments-website-version.md` | 短評網站版備份 | record | — | 2026-09-01 |
| `docs/content-rescue/track2-rescue.md` | 2026-08-31 搶救出的 Track 2 內容 | record | — | 2026-08-31 |
| `docs/content-rescue/track2-paste-into-sheet.tsv` | 當時可直接貼進試算表的檔 | record | — | 2026-08-31 |

### 會議記錄

| 路徑 | 用途 | 狀態 | 負責人 | 最後查核 |
|---|---|---|---|---|
| `docs/meetup-chats/Meeting notes.md` | 2026-03-19 最早期會議。SSOT 概念的源頭 | record | — | 2026-09-01 |
| `docs/meetup-chats/2026-04-16-agenda.md` | 0416 會議議程 | record | — | 2026-09-01 |
| `docs/meetup-chats/20260416 log.md` | 0416 逐字摘要。**反方意見決策的權威出處（46:12）** | record | — | 2026-09-01 |
| `docs/meetup-chats/2026-05-01-agenda.md` | 0501 會議議程 | record | — | 2026-09-01 |

> ⚠️ **本資料夾未進版控。** `.gitignore` 第 46 行刻意排除，屬既有決定，未更動。
> 影響：`design.md` 引用 `20260416 log.md` 的 46:12 作為反方意見決策的權威出處，
> 但該檔只存在於 captain 的本機。硬碟損壞或他人 clone 時，該證據不存在。
> 若要保留，需另行決定保存方式（不建議直接取消 ignore，內容含與會者姓名與討論細節）。

### Workflow（休眠中）

| 路徑 | 用途 | 狀態 | 負責人 | 最後查核 |
|---|---|---|---|---|
| `docs/constitution-features/` | 網站功能 workflow。30 個封存 entity、7 個開著 | record | — | 2026-09-01 |
| `docs/design-assets/` | 視覺素材 workflow。5 個封存、4 個開著 | record | — | 2026-09-01 |

兩者皆 `commissioned-by: spacedock@0.9.5`，現行為 0.28。要恢復需先 refit。
其 README 的查詢指令路徑已不存在，schema 缺 `mod-block`、`archived` 欄位。
`_archive/`、`_debriefs/` 為 record，不改寫。

---

## `docs/_archive/` — 已封存

保留供追溯，**不要照做**。每份檔頭已註明被誰取代。

| 路徑 | 為什麼封存 |
|---|---|
| `ssot_deploy_cheatsheet.md` | 教人執行 `npm run sync-content` 後 `git push`。這是明令禁止的動作 |
| `spreadsheet_template.md` | 教人把 `tldr` 放進 Track 2；Track 1 範本無 `status` 欄 |
| `content_sync_workflow.md` | 未定案的舊提案，已被 `design.md` 取代 |
| `editorial_review_workflow.md` | 主張設 Staging 環境，`design.md` 第五節已否決 |
| `t1-timeline-options.md` | 以「待決策」姿態列五方案，實際已採 A+E 並上線（PR #18） |
| `about-content.md` | 全文只有「（待撰寫）」，About 頁面早已完成（028，PR #22） |
| `owl-prompts-log.md` | 最早期生圖 prompt，已被角色聖經取代 |

**已刪除**（非封存，因為是重複）：

- `Documents/index.md` — 自稱 SSOT 但 11 個檔只列 5 個。由本檔取代
- `docs/social media/content-plan.md` — 與 `constitution-features/_archive/025` 逐字相同，正本狀態為 `complete`

---

## 整併計畫

| 階段 | 內容 | 狀態 |
|---|---|---|
| 0 | 危險檔加警告標頭 | ✅ 2026-09-01 |
| 1 | 封存 7 份、刪除 2 份重複 | ✅ 2026-09-01 |
| 3 | `Documents/` 併入 `docs/`，資料夾刪除 | ✅ 2026-09-01 |
| 2 | 重寫 3 份 | ⏸ **待產線改造完成** |
| 4 | 防漂移檢查腳本 | 📋 captain 已核准（選項 B），待實作 |

### 第 2 階段 — 重寫（待產線改造完成）

| 檔案 | 要改成 |
|---|---|
| `docs/project/tech-stack.md` | 資料流章節改為：試算表 → sync → JSON（產物，不得手改） |
| `docs/content-pipeline/data-collection-guide.md` | T1／T2 章節改為 SSOT ＋ `status` 把關流程 |
| `docs/project/contributing.md` | 任務認領改為 spacedock workflow 說明 |
| `docs/content-pipeline/operations.md`（新增） | 取代已封存的 `ssot_deploy_cheatsheet.md`，依 `design.md` 第五節撰寫 |

⚠️ **必須等 `design.md` 第七節第 7–10 項完成後才做。**
現在寫的是還沒實現的流程，寫完馬上又會過時。

### 第 4 階段 — 防漂移檢查（captain 已核准）

現行規則「記得更新最後查核日期」是人為約定，機器無法驗證，違反 `design.md` 不變式 #6。
本次盤點即為證據：33 份文件無一標過查核日期，其中 13 份已漂移，4 份會造成損害。

檢查腳本應驗證少數**可被機器判斷**的斷言：

| 要檢查什麼 | 錯了會怎樣 |
|---|---|
| `package.json` 的 build 指令是否仍含 sync | `AGENTS.md` 的第一條禁令失效而無人知 |
| `src/data/*.json` 是否含佔位字串（`某學者`／`test`／佔位摘要） | 假內容再次上線 |
| `src/app/layout.tsx` 是否仍有 `noindex` | 網站被搜尋引擎收錄 |
| `docs/` 內每份 `.md` 是否都在本索引中 | 新文件無人知、舊文件無人清 |

**設計原則**：檢查失敗時要出聲並指名。例如產線改造完成後，第一項檢查會失敗，
強迫我們回頭更新 `AGENTS.md`。文件被綁在事實上，不能悄悄過時。
