---
id: 039
title: 常設渲染檢查工具（機械檢查，非 AI 內容偵測）
status: design
source: captain 2026-09-03 決定；037/038 各自重造一次
started:
completed:
verdict:
score: 0.7
worktree:
issue:
pr:
mod-block:
---

建立一支可重跑的渲染檢查工具，讓「改動後頁面是否仍正常」這件事有機械證據。

## ⚠️ 這支工具不做什麼

**它不是 AI 生成內容的偵測工具。** 這一點必須寫在工具本身的說明裡，否則日後會有人以為裝了它就安全。

它檢查的是**機械正確性**：頁面渲染不出錯、元素數量符合預期、連結沒有被誤刪。

它**抓不到**「內容是編的」。`某學者，某大學法律系` 那筆假出處會正常渲染、元素數量正確、頁面不會壞 —— 機械上完美，事實上虛構。內容有無依據屬 `docs/health-check/TODO.md` 的 P1-8，主要靠人判斷，不在本票範圍。

## Problem

目前沒有任何可重跑的方式確認「改動後頁面仍正常」。後果已經出現三次：

1. **`docs/health-check/TODO.md` 的 P2-11**：7 筆超過 30 字的長標題，版面無人驗證過。成因即缺乏此工具。
2. **037**：檢查渲染的 agent 為了驗收自行造了一套（`react-dom/server` + swc）。未入版控。
3. **038**：implement 造了一套、verify 又另造一套（`jsdom` + `react-dom/client`）。兩套都未入版控，導致該票的 AC-1／AC-2 目前無法重跑。

每次驗收都重造一次，而且**每次都要重新踩同一個坑**：

> `curl` 抓 SSR 的 HTML，對「連結還在」的 main 也回報 0 命中 —— 因為 `src/components/LaunchGate.tsx` 在 hydration 前回傳 `null`。任何只看 SSR HTML 的檢查都會給出假通過。

037 與 038 的三個 agent 各自獨立踩到並繞過這個陷阱。

## Proposed approach

把 038 verify 的做法定型為專案工具。該版本是三次嘗試中最強的：

- **jsdom + `react-dom/client`** 真的掛載並執行 effect，繞過 `LaunchGate` 的 hydration 陷阱
- 渲染例外由 `createRoot` 的 `onUncaughtError`／`onCaughtError`／`onRecoverableError` 三個 callback 收集
- 以 DOM API 計數，非字串比對
- 支援對兩個 ref 各跑一次再比對（`git archive` 開乾淨 baseline）

**拒絕的替代方案**：headless Chrome。037 與 038 各試過一次，本環境兩支二進位檔皆 segfault（signal 11）。若日後換機器可再評估，但不能是唯一路徑。

**明確不做**：不加入 `build`、不設 CI lane、不做內容正確性判斷。這是一支手動執行的檢查指令。

## Risk evidence

no spike needed：038 verify 已在真實專案上跑通 19 條路由，並以「對 main exit 1 列出 54 處殘留、對移除後分支 exit 0」證明其可證偽。腳本現存於 scratchpad，本票是把它定型與入庫。

已知限制：`jsdom` 需安裝為專案相依，且它不是真實瀏覽器 —— **版面（是否擠爆、是否溢出）仍然驗不到**。`docs/health-check/TODO.md` 的 P2-11 不會因本票而解除。

## Expected surface and tolerance

Estimate: +300 淨行，跨 3 個檔案（腳本、`package.json` 的 script 條目、使用說明），tolerance ±40%。
Semantics this may change: 新增一個 npm script 與一項 devDependency（`jsdom`）。不改動任何既有程式或資料。

## Acceptance criteria

**AC-1 — 工具能偵測到真實的破壞，不是空轉。**
Verified by: 在一個刻意破壞的分支上執行（例如刪除 `OfficialTLDR` 的渲染條件），工具回報非零退出碼並指名受影響的路由與元素；在乾淨的 main 上執行則退出碼為 0。
會使其失敗的改動：把斷言改成恆真，或只檢查檔案存在。

**AC-2 — 工具跑得到 hydration 之後的 DOM，不會被 `LaunchGate` 騙過。**
Verified by: 對同一個 ref，比較「只取 SSR HTML」與「本工具」兩種方式的 `.textbook-item` 計數。前者為 0、後者為實際筆數。
會使其失敗的改動：改回只讀 SSR 輸出。

**AC-3 — 兩個 ref 的比對可重現 038 已知的結果。**
Verified by: 以本工具比對 `main` 與 038 的分支，跨軌道計數差為 54 → 0，非跨軌道欄位零差異。數字與 `docs/constitution-features/038-remove-ai-generated-cross-track-links.md` 的 verify 報告相符。
會使其失敗的改動：計數邏輯與該報告不一致。

**AC-4 — 工具的說明明確聲明它不偵測 AI 生成內容。**
Verified by: 使用說明中含該聲明，且指向 `docs/health-check/TODO.md` 的 P1-8。
會使其失敗的改動：移除該聲明，或把工具描述成內容正確性檢查。

## Test plan

以 038 的分支與 main 為兩個已知結果的 ref 做回歸。刻意破壞的分支用於 AC-1，不入版控。

### Feedback Cycles

## Out of scope

- **AI 生成內容的偵測與盤點** —— 見 `docs/health-check/TODO.md` 的 P1-8
- **版面正確性**（長標題是否擠爆）—— 需真實瀏覽器，見同檔 P2-11
- 加入 `build` 或 CI —— 本票只做手動執行的指令
