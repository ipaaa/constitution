---
id: "005"
title: Data Quality Cleanup
status: design
source: codebase audit
started:
completed:
verdict:
score: 0.85
worktree:
issue:
pr:
---

目前 codebase 中有多處 placeholder / 測試資料影響品質：

### history.json（T1）
- 移除 h15（"測試"）— 這是一筆完全 placeholder 的測試資料，破壞 T1 敘事流
- 確認 h14 的 bgImage 為空字串，決定是否補上或做 fallback 處理

### discussions.json（T2）
- 所有 `owl_comment` 都是同一句「這篇太長，我看完了：大法官說快來開會啦！」— 需要為每篇文章寫不同的貓頭鷹評語
- 所有 `vibe` 都是「💡 腦袋升級」— 需要根據文章內容分配不同的氛圍標籤（🔥 公民覺醒、🌊 同溫層外、⚖️ 法律白話文、📣 擴散必看、⚠️ 爭議中 等）
- 多數 `abstract` 是同一段 placeholder 文字「快速了解最新判決...」— 需要為每篇寫真正的摘要
- Official TL;DR（id: "tldr"）的 abstract 含有 "test" 字樣

### Footer
- `src/components/Footer.tsx` 中的「內容回報」連結是 `href="#"` — 需要接上真正的回報管道（Google Form 或 GitHub Issues）
