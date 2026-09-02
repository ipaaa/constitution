---
id: "034"
title: 貓頭鷹法官全站視覺融入實作
status: implement
source: design-assets/005
started: 2026-05-03T02:06:10Z
completed:
verdict:
score: 0.8
worktree: .worktrees/spacedock-ensign-034-owl-placement
issue:
pr: pr-merge:30 #30
mod-block:
---

根據 design-assets/005 的 placement guide，將集中於 public/owl-avatars/ 的貓頭鷹圖片整合到全站各頁面。使用既有圖片素材：owl.png、owl-past.png、owl-future.png。

---

### 終結說明（2026-09-02，由 FO 補記）

**本票的 `verify` 與 `review` 兩個階段從未執行。**

實際發生的事：PR #30 於 2026-05-03T03:54:30Z 合併，程式碼自此在線上運作。
已驗證該合併 commit 為 `main` 的祖先。但當時的 session 在合併前結束，
沒有人回來推進 workflow 狀態，因此本票停在 `implement` 四個月，
且持續佔用併行名額。

**`verdict: PASSED` 的依據是「PR 已合併且交付物已上線」，不是「通過了本
workflow 的 verify／review 審查」。** 本票內無任何 Stage Report。

補記此節的原因：標成通過而不說明審查未跑，等於製造一筆「看起來對、其實不對」
的紀錄。那正是 2026-08 內容產線事故的共同模式。

## Stage Report: implement

> 本節為 2026-09-02 依已合併的 PR #30 逐檔重建的回顧記錄，非當時即時撰寫。
> 依據為該 PR 的實際 diff。當時未留下任何 Stage Report。

- DONE: 首頁（`src/app/page.tsx`）hero 貓頭鷹圖片來源改為 `/codex/owl.png`
  檔案 `src/app/page.tsx`，commit `2135bb8`。
- DONE: past 頁面（`src/app/past/page.tsx`）加入 `owl-past.png`
  檔案 `src/app/past/page.tsx`，commit `2135bb8`。
- DONE: future 頁面（`src/app/future/page.tsx`）加入 `owl-future.png`
  檔案 `src/app/future/page.tsx`，commit `2135bb8`。
- DONE: opinion-lazybag 頁面（`src/app/opinion-lazybag/page.tsx`）加入 `owl.png`
  檔案 `src/app/opinion-lazybag/page.tsx`，commit `2135bb8`。
- DONE: controversy-timeline 頁面（`src/app/controversy-timeline/page.tsx`）加入 `owl-past.png`
  檔案 `src/app/controversy-timeline/page.tsx`，commit `2135bb8`。
- DONE: about 頁面（`src/app/about/page.tsx`）加入 `owl.png`
  檔案 `src/app/about/page.tsx`，commit `2135bb8`。
- DONE: 修正 controversy-timeline 頁面圖片與文字重疊問題
  檔案 `src/app/controversy-timeline/page.tsx`，commit `e9f53e1`。

### 實際變更

- `src/app/page.tsx`：首頁 hero 貓頭鷹圖片來源從 `/owl.png` 改為 `/codex/owl.png`。
- `src/app/past/page.tsx`：標題區加入 `owl-past.png`，寬 88px，手機隱藏、僅桌面顯示（`hidden md:block`）。
- `src/app/future/page.tsx`：Crisis Banner 右下角加入 `owl-future.png`，寬上限 108px，標記為裝飾用（`aria-hidden="true"`）。
- `src/app/opinion-lazybag/page.tsx`：標題列加入小型 `owl.png`，寬 56px，裝飾用。
- `src/app/controversy-timeline/page.tsx`：intro 區標題旁加入 `owl-past.png`，寬上限 80px。標題區改用 flex 排版，讓標題與圖片並排，避免圖片壓字。
- `src/app/about/page.tsx`：專案緣由區加入 `owl.png`，寬上限 140px，手機隱藏（`hidden md:block`）。文字區改用 flex 排版容納圖片。

六個頁面的圖片均設定 `width`／`height` 與 `className` 控制顯示寬度。除首頁與 about 頁的圖片保留有意義的 `alt` 文字外，其餘標記 `aria-hidden="true"` 或空 `alt=""`。

commit 記錄顯示本 PR 由兩個 commit 組成：`feat: add owl mascot placements across all pages per design guide 005`，以及後續 `fix: prevent owl image from overlapping text on controversy timeline intro`（對應上述 controversy-timeline 頁的 flex 排版修正）。

### 變更規模

+59／−9 行，跨 6 個檔案。

### 未執行的事項

- `verify` 階段未執行
- `review` 階段未執行
- 無驗收標準，故無驗收結果

### 交付證明

PR #30 於 2026-05-03T03:54:30Z 合併。合併 commit `232601ad1267befc716d50021efadccaf45b801a` 為 `main` 的祖先。

### Summary

PR #30 為六個既有頁面加入貓頭鷹法官吉祥物圖片：首頁、過去、未來、意見懶人包、爭議時間軸、關於頁面。合併前的第二個 commit（`e9f53e1`）額外修正了爭議時間軸頁面的圖文重疊問題。變更規模為 +59／−9 行，跨 6 個檔案，全數為既有檔案的局部調整，未新增任何檔案。

