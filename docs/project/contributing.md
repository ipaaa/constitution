# 協作指南

**狀態**：evergreen
**最後查核**：2026-09-03

## 開始前

先讀 repo 根目錄的 `AGENTS.md`。
功能施工使用 `docs/constitution-features/` Spacedock workflow。
不要直接在 `main` 開工。

## 網站程式

1. 建立或使用 workflow 指定的 worktree branch。
2. 依 `docs/project/architecture.md` 與 `docs/project/design-system.md` 實作。
3. 執行與變更相符的測試。
4. 開 PR，檢查 diff 與 Vercel 預覽。
5. 取得核可後才合併。

不得移除 `src/app/layout.tsx` 的 `noindex`。

## 內容協作

Google 試算表是內容唯一真相。不要手改 `src/data/*.json`。

投稿者編輯發布欄位後，`status` 會顯示 `Needs review`。
責任編輯也不例外。內容變更後必須重新核可。

責任編輯使用桌面版 Google Sheets 的 `Review` 選單核可或拒絕。
核可會保存內容指紋、核可者與 UTC 時間。
拒絕必須填寫原因。

正式同步由工程人員明確發起。同步通過後仍要開 PR。
編輯台必須檢查 JSON diff 與預覽畫面。

詳細操作見 [`../content-pipeline/operations.md`](../content-pipeline/operations.md)。

各角色能改什麼、有哪些把關與缺口，見 [`docs/content-pipeline/gatekeeping.md`](../content-pipeline/gatekeeping.md)。

## 驗證指令

```bash
node --test tests/approval-content-version-binding.test.mjs
npx tsc --noEmit
npm run build
```

不要在一般開發或驗證時執行 `npm run sync-content`。
它只用於有人明確要求的內容發布流程。
