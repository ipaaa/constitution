---
id: "026"
title: T3 待審案件替換為真實資料
status: design
source: captain-filed
started:
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

參考資料來源：
- 司法院憲法法庭案件公開資訊
- g0v 司法開放資料（judicial.g0v.ronny.tw）
- 民間司法改革基金會年報
