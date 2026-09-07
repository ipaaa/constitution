---
id: 056
title: 上線前檢查清單：公開之前每一項都必須有結論
status: design
source: captain 2026-09-07（把關機制體檢與任務地圖的綜合結論）
started:
completed:
verdict:
score: 0.85
worktree:
issue:
pr:
mod-block:
---

網站目前是 `noindex` 且無對外網域，「讀者」是有連結的夥伴而非公眾。因此下列破口不是「今天要修」，而是**「公開之前必須為真」**。本票把六個散落的無票缺口收成一道 launch gate。

## Problem

2026-09-04 的把關機制體檢與任務地圖顯示一件事：**所有的票都在產線左半邊（投稿、審核、同步、發布），但已經在影響讀者的破口全在最右邊，而且多數沒有票。**

原因不是疏忽，是**形狀錯了**。這些項目彼此無關、無法排進同一個施工順序，唯一的共通點是「公開之前必須為真」。分別開六張票會讓它們各自漂走；收成一張 launch gate 才管得住。

**現況**（`src/app/layout.tsx:5-8` 的 `robots: { index: false, follow: false }` 仍在）：搜尋引擎收不到，但**任何拿到連結的人都看得到全部頁面**。

## 清單

下列每一項在公開之前必須有明確結論——**修好、明確接受、或移除**。不接受「待確認」。

### A. 交付物到不了使用者（已查證，皆無票）

| # | 項目 | 查證 |
|---|---|---|
| A1 | feature `015` 的反方意見元件**從未渲染過一次** | `discussions.json` 無 `opposing_views` 欄位；`present/[id]/page.tsx` 靠該欄決定是否渲染 |
| A2 | feature `014` 的散點圖等約 800 行**無任何檔案 import**，而首頁 CTA 仍宣傳「16 則意見分析」 | `grep -rn "OpinionLazybag" src/` 只剩它自己；`LazybagCtaSection.tsx:31` |
| A3 | feature `018` 的測驗**全站沒有入口** | 唯一 `href="/quiz"` 在 `QuizResult.tsx:149`，是做完測驗後的回程連結 |
| A4 | 每篇文章詳情頁都顯示「完整轉譯尚未收錄」 | `discussions.json` 無 `full_content` 欄位 |

### B. 上線控制

| # | 項目 | 查證 |
|---|---|---|
| B1 | `LaunchGate` 實際鎖不住任何頁面 | `NEXT_PUBLIC_PUBLIC_MODE` 未設 → `LAUNCHED_PAGES === ALL_PAGES`。「夥伴看全部、公眾看三頁」現行程式碼做不到 |
| B2 | 移除 `noindex` | `src/app/layout.tsx:5-8`；`docs/health-check/TODO.md` 的 P3-8。**目前無人追蹤解除時點** |
| B3 | 確認 Vercel 的 Build Command 與 `NEXT_PUBLIC_PUBLIC_MODE` 實際值 | repo 內查不到，只有 captain 能開 dashboard 確認 |

### C. 佔位與無來源內容

| # | 項目 | 查證 |
|---|---|---|
| C1 | 佔位信箱 `volunteer@addcourt.tw` | `src/components/PresentDetail.tsx:32`。feature `008` 當時已註明是佔位 |
| C2 | `/about` 的佔位貢獻者名單 | 已有 feature `052`，本票只追其結論 |
| C3 | `opinion-lazybag` 的具名大法官立場零出處 | 已有 feature `049`，本票只追其結論 |

### D. 卡在人的事實正確性

| # | 項目 | 查證 |
|---|---|---|
| D1 | 釋字第 272 號的法律內容錯誤 | `docs/health-check/TODO.md` 的 P0-2。需法學背景者拍板 |
| D2 | `h28` 掛了 `h14` 的標題 | 同檔 P0-6。captain 已清空 status 暫時擋住，待補正確標題 |
| D3 | `requiredForRuling: 10` 的法律正確性 | 該修法已於 2025-12 被判部分違憲（114憲判9）；數字仍渲染於 `future/page.tsx:79`、`:194`、`BottleneckFunnel.tsx:135`。features `021`／`026` 兩票都記過此疑慮，兩票都沒解 |

## Proposed approach

**待 design stage 定案。** 本票的形狀是 gate 而非施工票，因此 design stage 的主要工作是：

1. 逐項確認上表在**當下**是否仍成立（清單本身會過時，這是它的固有風險）。
2. 為每一項指定結論類型：修（開票或併入現有票）／明確接受並記錄理由／移除。
3. 決定這道 gate 由誰、在什麼時點執行——**它必須綁在「移除 `noindex`」這個動作上**，否則會被跳過。

**不要在本票內施工。** 每一項該修的，開它自己的票或併入既有票；本票只保證公開之前每一項都有結論。

## Risk evidence

`no spike needed`：上表每一項皆已由 2026-09-04 的體檢查證，且 FO 於同日親自複驗 A1／A2／A3、C1、D3。

**但清單有固有風險**：它是 2026-09-07 的快照。design stage 必須重新逐項確認，不得直接沿用。

## Acceptance criteria

**AC-1 — 公開之前，清單每一項都有明確結論。**
Verified by: 逐項檢查其結論類型與依據。任何一項停在「待確認」「待決定」即為失敗。**「修好」的項目必須指向可查證的證據**（票號＋合併記錄，或實際指令輸出），不接受口頭宣稱。

**AC-2 — A 類每一項都能以實際頁面行為驗證。**
Verified by: 對 A1–A4 各構造一次實際訪問或渲染檢查。例如 A3 必須從站上實際入口點到測驗頁，不接受直接打網址。任一項無法從真實入口達成即為失敗。

**AC-3 — 這道 gate 與移除 `noindex` 綁定。**
Verified by: `docs/health-check/TODO.md` 的 P3-8 與本票互相引用，且 `AGENTS.md` 的 noindex 條目指向本票。未綁定即為失敗——**一道不會被觸發的 gate 等於沒有。**

## Test plan

`npx tsc --noEmit`。A 類各項需在 `npm run dev` 的實際頁面上驗證，不可只讀程式碼。不執行 `npm run sync-content`。

## Documentation impact

### 現在更新

| 文件 | 為什麼現在要改 | 更新內容 |
|---|---|---|
| `docs/health-check/TODO.md` | P3-8 目前無人追蹤解除時點 | 於 P3-8 加註：解除 `noindex` 前必須通過 feature 056 |

### 實作後更新

| 文件 | 完成條件 | 更新內容 |
|---|---|---|
| `AGENTS.md` | 本票的 gate 定案 | 「不要移除 noindex」條目指向本票 |

### 不更新

| 文件 | 理由 |
|---|---|
| 狀態為 `record` 的文件與 `docs/_archive/**` | 歷史記錄，不改寫 |

### Feedback Cycles

## Out of scope

不施工任何一項——每項該修的另循其票。不處理 SSOT 產線把關（features 040／042／043／050）。不建立防止文件過時的機制（feature 054）。
