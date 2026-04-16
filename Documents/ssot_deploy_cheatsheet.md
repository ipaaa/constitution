# 📋 SSOT → Vercel / Local 部署備忘

> 更新內容到網站的流程速查卡。給未來的自己 / 新夥伴用。

---

## 🗺️ 系統架構一句話

Google Spreadsheet（SSOT）→ `sync-content.mjs` 抓 CSV → `src/data/*.json` → Next.js build → Vercel 部署 / Local 開發伺服器

---

## ⚡ 一分鐘速查

| 我想做什麼 | 流程 |
|---|---|
| **讓夥伴在網站上看到新資料** | 試算表填 `status=approved` → Vercel Dashboard → Deployments → ⋯ → Redeploy（取消勾 Build Cache）→ 等 1-2 分鐘 |
| **自己 local 預覽** | `cd` 到專案根目錄 → `npm run sync-content` → `npm run dev` → 開 http://localhost:3000 |
| **強制 Vercel rebuild** | 空 commit：`git commit --allow-empty -m "chore: trigger redeploy" && git push` |

---

## 🚪 關鍵閘門：`status` 欄位

Sync 腳本會過濾試算表內容：

| Track | 篩選規則 |
|---|---|
| **Track 1（過去時光機 `/past`）** | `status` 空白 **或** `approved` 都會上線 |
| **Track 2（現在熱搜榜 `/present`）** | **只有** `status === "approved"`（精確字串、小寫）才上線 |

⚠️ **新增資料沒出現的頭號原因就是 `status` 沒填 `approved`**。

---

## 🌐 情境 1：更新 Vercel 站上的資料（給夥伴看）

### 前提
- 已經在 Google Spreadsheet 編輯/新增了 row
- 那個 row 的 `status` 已填 `approved`

### 步驟

1. **到 Vercel Dashboard**：https://vercel.com → 選 `constitution` 專案
2. **觸發 rebuild**（四選一）：

   **方法 A — Dashboard 手動**（推薦）
   - 上方 tab → **Deployments**
   - 最新那筆 deployment → 右邊 **`⋯`** → **Redeploy**
   - 彈出視窗 → **取消勾「Use existing Build Cache」**（關鍵！否則不會重跑 sync-content）
   - 按 **Redeploy** 綠色按鈕

   **方法 B — 空 commit 觸發**
   ```bash
   cd /Users/ipa/git/Constitution
   git commit --allow-empty -m "chore: trigger redeploy to pull latest SSOT"
   git push origin main
   ```

   **方法 C — Deploy Hook**（預留給非工程夥伴）
   - Vercel Settings → Git → Deploy Hooks → Create
   - 得到一個 URL，瀏覽器打開即觸發 build
   - 可接到 Google Sheets App Script 做成按鈕

   **方法 D — 任何 push 到 main**
   - 正常開發流程的 push 本來就會觸發 build，不需要額外動作

3. **等 build 跑完**（約 1-2 分鐘）
   - 點那次新的 deployment 進去 → **Build Logs**
   - 找這段：
     ```
     🚀 Starting Content Sync...
     ✅ Track 1 sync complete. (N items)
     ✅ Track 2 sync complete. (N items)
     🏁 All sync tasks finished.
     ```
   - 確認 N 數字跟你預期的一樣（比上次多了新 row）

4. **無痕視窗打開站點驗證**（避開瀏覽器快取）

5. **傳 URL 給夥伴**

### 如果 build log 顯示這樣就是環境變數掉了

```
⚠️ TRACK_1_CSV_URL not set. Skipping Track 1 sync.
⚠️ TRACK_2_CSV_URL not set. Skipping Track 2 sync.
```

→ Vercel Dashboard → **Settings → Environment Variables** → 檢查 `TRACK_1_CSV_URL` 和 `TRACK_2_CSV_URL` 是否還在。補上後要 Redeploy。

---

## 💻 情境 2：Local 預覽（自己看）

### 一次性設定（已經做過就跳過）

確認 `.env.local` 存在於專案根目錄：
```bash
ls -la /Users/ipa/git/Constitution/.env.local
```

裡面應該有：
```
TRACK_1_CSV_URL=https://docs.google.com/spreadsheets/...
TRACK_2_CSV_URL=https://docs.google.com/spreadsheets/...
```

（這個檔案是 git-ignored，不會 push 到 repo）

### 日常流程

```bash
# 1. 進專案根目錄
cd /Users/ipa/git/Constitution

# 2. 把最新試算表內容拉到本地 JSON
npm run sync-content
# 成功會印：
#   🚀 Starting Content Sync...
#   ✅ Track 1 sync complete. (N items)
#   ✅ Track 2 sync complete. (N items)

# 3. 啟動本地開發伺服器
npm run dev
# 終端會顯示：
#   ▲ Next.js 16.1.6
#   Local:  http://localhost:3000

# 4. 瀏覽器打開 http://localhost:3000
# 5. 結束時：終端按 Ctrl+C
```

### 想順便把 local 更新過的 JSON 同步回 git

```bash
git diff src/data/                  # 先看變動合理嗎
git add src/data/history.json src/data/discussions.json
git commit -m "sync: pull latest from SSOT spreadsheet"
git push origin main
```

⚠️ 但要留意：如果 Vercel 環境變數正常運作（Path A），每次 deploy 都會自己拉 CSV 重生 JSON。git 裡的 JSON 會被 Vercel 當作 cache，**push 到 main 會觸發 build 然後覆蓋成試算表內容**。所以只有當你確定試算表是真正的 source of truth 時才同步。

---

## 🔍 故障排除

### 🐛 Vercel 裡看不到新資料

依序檢查：

1. **試算表那 row 的 `status` 是 `approved` 嗎？** → 最常見原因
2. **Vercel 真的跑了新的 deploy 嗎？** → Deployments tab 看時間戳
3. **Build log 裡 sync 的 item 數有變嗎？** → 如果沒變，表示 sync 拉的試算表還是舊的（或 CSV URL 指向了舊 sheet）
4. **瀏覽器快取？** → 無痕模式試試看
5. **試算表有「發佈到網頁」嗎？** → File → Share → Publish to Web。沒發佈過的 sheet CSV export 拉不到

### 🐛 Local `npm run sync-content` 失敗

- `TRACK_1_CSV_URL not set` → `.env.local` 不存在或沒有設 CSV URL
- Network error → 檢查 CSV URL 在瀏覽器能不能直接打開
- Parse error → 試算表裡可能有奇怪字元（但 parseCSV 已經處理多行和引號了，應該少見）

### 🐛 Local `npm run dev` 看到的還是舊資料

- 是不是忘了先跑 `npm run sync-content`？
- `src/data/*.json` 有更新嗎？`git status` 看看
- Next.js 有時候 hot-reload 抓不到新的 JSON → 停掉 dev server（Ctrl+C）再跑一次

---

## 📁 相關檔案索引

| 檔案 | 角色 |
|---|---|
| `scripts/sync-content.mjs` | 拉 CSV、轉 JSON 的同步腳本 |
| `src/data/history.json` | Track 1 資料（sync 產出） |
| `src/data/discussions.json` | Track 2 資料（sync 產出） |
| `.env.local` | 本地的 CSV URL 環境變數（git-ignored） |
| `package.json` | scripts 定義：`sync-content`, `build`, `dev` |
| `Documents/content_sync_workflow.md` | 當初設計這套 SSOT 流程的 proposal（背景知識） |
| `Documents/editorial_review_workflow.md` | 編輯審核流程（`status` 欄位的管理） |

---

## 📝 備註：手動改 JSON 的風險

如果有人直接改 `src/data/history.json` 或 `discussions.json`（例如透過 PR），而 Vercel 又啟用了自動 sync（Path A），那些手改會在下次 deploy 被試算表內容覆蓋。

**原則**：試算表是唯一真相（SSOT）。要改資料請改試算表，不要直接改 JSON。

例外：結構性重構（例如 003 重寫 `src/data/future.ts` 從 mock 改成結構化 pipeline）、schema 變更、或試算表還沒涵蓋的資料來源，這些走 code PR 是合理的，但要記得把改動反向同步回試算表（如果該資料日後由編輯維護）。
