# 文件總索引

**狀態**：evergreen
**最後查核**：2026-09-01
**規則**：新增或刪除文件時，同步更新本檔。狀態定義見 [`../AGENTS.md`](../AGENTS.md)。

狀態三種：

- `evergreen` — 描述現況。內容變了就要更新。**過時的 evergreen 是危險的。**
- `plan` — 描述打算做的事。做完就封存。
- `record` — 某時間點的記錄。**不改寫。** 要修正就追加補述。

---

## ⚠️ 整併進行中

2026-09-01 完成全面盤點。**33 份文件中有 13 份過時，其中 4 份現在照做會造成損害。**

危險檔案已加警告標頭。整併計畫見本檔最後一節。

---

## 現行文件

### 專案規範

| 路徑 | 用途 | 狀態 | 負責人 | 最後查核 |
|---|---|---|---|---|
| `AGENTS.md`（根目錄） | agent 與協作者的工作規範。禁止事項、溝通方式、文件規則 | evergreen | captain | 2026-09-01 |
| `docs/INDEX.md` | 本檔。全部文件的索引 | evergreen | captain | 2026-09-01 |

### 內容產線

| 路徑 | 用途 | 狀態 | 負責人 | 最後查核 |
|---|---|---|---|---|
| `docs/content-pipeline/current-vs-target.md` | 產線的目標、現況、差距對照 | evergreen | captain | 2026-09-01 |
| `docs/content-pipeline/design.md` | 新產線的完整規格與施工順序 | plan | captain | 2026-09-01 |
| `docs/health-check/2026-08-31-content-pipeline.md` | 產線體檢報告。出了什麼事、為什麼會上線 | record | — | 2026-09-01 |
| `docs/health-check/TODO.md` | 待辦清單。依危險程度排序 | plan | captain | 2026-09-01 |

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
| `docs/meetup-chats/20260416 log.md` | 0416 會議逐字摘要。**反方意見決策的權威出處（46:12）** | record | — | 2026-09-01 |
| `docs/meetup-chats/2026-05-01-agenda.md` | 0501 會議議程 | record | — | 2026-09-01 |

### 專案定位

| 路徑 | 用途 | 狀態 | 負責人 | 最後查核 |
|---|---|---|---|---|
| `Documents/about.md` | 專案定位、三圈目標受眾、溝通策略 | evergreen | captain | 2026-09-01 |
| `Documents/architecture.md` | 過去／現在／未來三軌的資訊架構 | evergreen | captain | 2026-09-01 |

### Workflow（休眠中）

| 路徑 | 用途 | 狀態 | 負責人 | 最後查核 |
|---|---|---|---|---|
| `docs/constitution-features/` | 網站功能 workflow。30 個封存 entity、7 個開著 | record | — | 2026-09-01 |
| `docs/design-assets/` | 視覺素材 workflow。5 個封存、4 個開著 | record | — | 2026-09-01 |

兩個 workflow 皆 `commissioned-by: spacedock@0.9.5`，現行為 0.28。要恢復需先 refit。
其 `_archive/`、`_debriefs/` 為 record，不改寫。

---

## 待處置文件

### 🔴 危險 — 照做會造成損害

| 路徑 | 問題 | 處置 |
|---|---|---|
| `Documents/ssot_deploy_cheatsheet.md` | 逐步教人執行 `npm run sync-content` 後 `git push`。這是 TODO 明令禁止的動作。也未說明產線目前刻意斷開 | 重寫 |
| `Documents/spreadsheet_template.md` | 教人把 `tldr` 當 Track 2 的一列。這會讓新驗證器擋下整份同步。Track 1 範本無 `status` 欄，照做即重現 15 筆壞資料的漏洞 | 封存 |
| `Documents/tech_stack.md` | 稱 JSON 檔 commit 進 repo 即為 SSOT。牴觸不變式 #2。建立錯誤的架構認知 | 重寫 |
| `docs/data-collection-guide.md` | 教 Ensign「在 `src/data/history.json` 新增條目」。這正是不變式 #2 禁止的手改產物 | 重寫 T1/T2 章節，T3 章節保留 |

### 🟡 過時 — 會誤導但不直接造成損害

| 路徑 | 問題 | 處置 |
|---|---|---|
| `Documents/content_sync_workflow.md` | 未定案的舊提案，結尾仍在問「您覺得欄位 OK 嗎」。已被 `design.md` 取代 | 封存 |
| `Documents/editorial_review_workflow.md` | 主張設 Staging 環境。`design.md` 第五節已明確否決 | 封存 |
| `Documents/t1-timeline-options.md` | 仍以「待決策」姿態列五個方案。實際已採 A+E 並上線（PR #18） | 封存 |
| `Documents/index.md` | 自稱 Single Source of Truth，但 11 個檔只列 5 個 | 刪除，由本檔取代 |
| `Documents/contribution_guide.md` | 教人到 GitHub Issues 認領任務。實際流程是 spacedock workflow | 重寫 |
| `Documents/design_system.md` | 吉祥物段落寫「預留：等待社群收斂」，實際已定案 | 更新該段落 |
| `docs/about-content.md` | 全文只有「（待撰寫）」。About 頁面早已完成（028，PR #22） | 封存 |
| `docs/notes/owl-prompts-log.md` | 最早期生圖 prompt。已被角色聖經取代，無過時標記 | 封存 |
| `docs/social media/content-plan.md` | 與 `_archive/025` 內容逐字相同，但 status 停在 `design`，正本是 `complete` | 刪除，指向正本 |
| `docs/constitution-features/README.md` | 指令路徑已不存在。schema 缺 `mod-block`、`archived` 欄位 | 待 refit 時重生 |
| `docs/design-assets/README.md` | 同上 | 待 refit 時重生 |

---

## 整併計畫

分四階段。每階段可獨立完成，不必一次做完。

### 第 0 階段 — 止血（已完成 2026-09-01）

在 4 個危險檔案最上方加警告標頭，指向正確的文件。
不刪除、不改寫內容，只加警告。

### 第 1 階段 — 封存明確過時的

移動下列檔案到 `docs/_archive/`，並在檔頭加一行說明被誰取代：

`content_sync_workflow.md`、`editorial_review_workflow.md`、`spreadsheet_template.md`、
`t1-timeline-options.md`、`about-content.md`、`owl-prompts-log.md`

刪除兩個重複檔：`Documents/index.md`、`docs/social media/content-plan.md`

### 第 2 階段 — 重寫四份

| 檔案 | 重寫成 |
|---|---|
| `tech_stack.md` | 正確的資料流：試算表 → sync → JSON（產物） |
| `ssot_deploy_cheatsheet.md` | 依 `design.md` 第五節的新流程改寫 |
| `data-collection-guide.md` | T1/T2 章節改為 SSOT + status 把關流程 |
| `contribution_guide.md` | 任務認領改為 spacedock workflow 說明 |

⚠️ 第 2 階段應在產線改造（`design.md` 第七節第 7–10 項）**完成後**做。
否則寫的是還沒實現的流程，馬上又會漂移。

### 第 3 階段 — 合併 `Documents/` 進 `docs/`

專案目前有 `docs/` 與 `Documents/` 兩個文件資料夾，只差一個字母。
這本身就是混淆來源。建議合併為一個。

建議結構：

```
docs/
  INDEX.md
  project/          about.md, architecture.md, tech-stack.md,
                    design-system.md, contributing.md
  content-pipeline/ current-vs-target.md, design.md,
                    data-collection-guide.md, operations.md
  health-check/     體檢報告、TODO
  content-rescue/   搶救內容
  meetings/         會議記錄（自 meetup-chats 改名）
  _archive/         封存的過時文件
  constitution-features/   workflow，不動
  design-assets/           workflow，不動
```

完成後刪除 `Documents/`。

### 第 4 階段 — 防漂移機制（待 captain 核准）

目前的規則（「記得更新最後查核日期」）是人為約定，無法被機器驗證。
違反 `design.md` 不變式 #6。本次盤點證明它失效：33 份文件無一標過查核日期，
而其中 13 份已經漂移。

提案：一支小腳本檢查少數可驗證的斷言。詳見待 captain 決定的選項。

**新增常設檢查屬於重大決定，需 captain 明確核准，且應作為獨立工作項目。**
