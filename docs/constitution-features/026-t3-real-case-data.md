---
id: "026"
title: T3 待審案件替換為真實資料
status: design
source: captain-filed
started: 2026-04-30T23:17:40Z
completed:
verdict:
score: 0.85
worktree:
issue:
pr:
---

目前 T3 的待審案件資料（src/data/future.ts）是「researched synthetic records」——主題基於真實爭議，但案件數量、立案日期、等待天數都是合成的模擬值。

需要處理：
1. 從司法院憲法法庭案件公開資訊（constitutionalcourt.judicial.gov.tw）取得真實待審案件清單
2. 替換 RAW_CASES 為真實案件資料（案號、立案日期、爭議類型）
3. 更新 totalPending、avgDaysPerCase 為真實數字
4. 確認權益計算機的身分標籤對應到真實案件
5. 如無法取得完整真實資料，至少在頁面上標注「部分資料為模擬」

## 資料收集方法
- 司法院憲法法庭網站是否有公開 API 或結構化資料？
- 如果只有 HTML 頁面，需要爬蟲嗎？（Ronny 團隊可協助？）
- 能否從 g0v 司法開放資料（judicial.g0v.ronny.tw）直接取得？
- 民間司改會的年報資料格式為何？PDF？Excel？
- 是否有其他管道取得案件清單（例如法學資料庫）？

## 資料穩定度評估
- 待審案件數量會隨時間變動（新案進入、舊案結案）
- 大法官人數也會變動（屆滿、提名、確認）
- 需要評估：資料變動頻率為何？每月？每季？每次有新判決？
- 哪些欄位是穩定的（案號、立案日期）vs 不穩定的（等待天數、案件狀態）

## 是否需要成為 SSOT (Single Source of Truth)
- 目前 future.ts 是靜態快照（frozen snapshot），手動更新
- 選項 A：維持手動快照，定期更新（每月或每季）
- 選項 B：改為 build-time fetch，每次部署自動抓最新資料
- 選項 C：混合模式 — 案件清單手動策展，統計數字自動計算
- 需要決定：這份資料的「真實來源」是什麼？由誰負責維護？

## 更新流程規劃
- 誰負責觸發更新？（ipa？自動排程？志工？）
- 更新頻率建議？
- 更新後是否需要人工審核（verify 流程）？
- 是否需要版本紀錄（每次更新留下 diff）？
- 如何處理資料格式變更（上游網站改版）？

參考資料來源：
- 司法院憲法法庭案件公開資訊
- g0v 司法開放資料（judicial.g0v.ronny.tw）
- 民間司法改革基金會年報
