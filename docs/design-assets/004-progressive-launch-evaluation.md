---
id: "004"
title: 漸進式上線方案評估（社群擴散效益）
status: brief
source: constitution-features/033
started:
completed:
verdict:
score: 0.8
worktree:
issue:
pr:
---

評估兩個漸進式上線方案，從社群媒體擴散效益和敘事理解度的角度分析：

方案 A：現有 URL + 鎖定未完成頁面
- 分享 /controversy-timeline 等現有 URL
- Navbar 只顯示已開放頁面，未開放顯示「即將推出」
- 優點：不用維護兩套頁面，URL 一致
- 疑慮：讀者可能困惑「為什麼有些頁面打不開」

方案 B：/share/ 獨立路由
- 分享 /share/controversy-timeline 等獨立頁面
- 與主站完全隔離，不連到未完成的頁面
- 優點：分享體驗完全可控
- 疑慮：要維護兩套頁面，URL 之後要改

需要評估：
1. 社群分享時，哪種 URL 結構更容易被理解和轉發？
2. 讀者第一次點進來的體驗哪個更好？
3. 「即將推出」的頁面是加分（建立期待感）還是扣分（感覺未完成）？
4. 對 SEO 和 OG meta（社群預覽）的影響
5. 之後正式上線時的轉換成本
