---
id: "008"
title: T2 Detail Page Enhancement
status: implement
source: codebase audit
started: 2026-04-16T22:13:16Z
completed:
verdict:
score: 0.7
worktree: .worktrees/spacedock-ensign-008-t2-detail-pages
issue:
pr:
---

T2 的文章詳情頁（`src/app/present/[id]/page.tsx`）已經實作，但幾乎所有文章都顯示「等待轉譯」狀態，因為 `discussions.json` 中的 `full_content` 欄位都是空的。

這個 feature 處理的是 **程式碼層面** 的改善，不是內容填入（那是 Google Sheets 管線的事）：

### 需要實作
- **空內容的優雅降級：** 目前顯示「Awaiting Transcription」但沒有 CTA — 應該引導使用者去原始連結閱讀全文，或加入「協助轉譯」的志工呼籲
- **Markdown 渲染：** 當 `full_content` 有內容時，支援基本 Markdown 格式（標題、粗體、連結、引用）
- **相關文章推薦：** 根據 category 或 vibe tag 在詳情頁底部顯示 2-3 篇相關文章
- **分享功能：** 加入複製連結 / 社群分享按鈕（設計文件有提到）
- **`owl_depth_comment` 顯示：** 目前有 UI 但資料幾乎都是空的 — 需要確保有內容時能正確顯示深度評論
