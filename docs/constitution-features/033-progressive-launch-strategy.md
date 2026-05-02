---
id: "033"
title: 漸進式上線與分享策略
status: implement
source: captain-filed
started: 2026-05-02T00:42:52Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-033-progressive-launch
issue:
pr:
mod-block: merge:pr-merge
---

在全站完成前，規劃如何以「一次一個單元」的方式逐步分享已完成的內容。

需要決定的技術方案：
- A. 現有 URL + 鎖定未完成頁面（Navbar 只顯示已開放頁面，未開放顯示「即將推出」）
- B. 做 /share/ 獨立路由（與主站完全隔離，每個分享單元是獨立頁面）

決策需考量：社群媒體擴散效益、敘事容易被理解程度、技術維護成本。

交由 design-assets workflow 評估。
