---
id: "006"
title: Cross-Track Navigation
status: design
source: codebase audit
started:
completed:
verdict:
score: 0.5
worktree:
issue:
pr:
---

三條軌道目前是各自獨立的體驗，缺少內容層面的跨軌道連結。Documents/architecture.md 描述的是一個「過去→現在→未來」的連貫旅程，但實際上只有 T2 的 Narrative Loop Footer 有簡單的 T1/T3 連結。

需要加強的連結：
- **T1 → T2：** 歷史釋憲案（如釋字 748 同婚）可以連到 T2 相關的現代討論文章
- **T2 → T3：** 正在討論的判決如果涉及待審案件，可以連到 T3 的篩選結果
- **T3 → T1：** 待審案件涉及的權利（如原住民狩獵權）可以回溯到 T1 的歷史判例
- **資料層面：** 需要在 JSON 資料中加入跨軌道的 reference ID（例如 discussions.json 的文章加一個 `related_history_ids` 欄位）

這是一個中期目標，會讓三條軌道從「三個獨立頁面」變成「一個連貫的學習路徑」。
