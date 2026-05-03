---
id: "005"
title: 貓頭鷹法官全站視覺融入策略
status: complete
source: captain-filed
started: 2026-05-03T01:50:54Z
completed: 2026-05-03T02:02:56Z
verdict: PASSED
score: 0.8
worktree: 
issue:
pr:
---

使用 `public/codex/` 中的三張貓頭鷹圖片，規劃「貓頭鷹法官」吉祥物在全站的視覺融入策略。

已有圖片素材：

- `public/codex/owl.png`
- `public/codex/owl-past.png`
- `public/codex/owl-future.png`

需要決定每個頁面的貓頭鷹出現方式、角色定位、尺寸與位置：

- 首頁
- T1 時光機
- T2 熱搜榜
- T3 未來
- 意見懶人包
- 爭議時序懶人包
- About

## Acceptance criteria

**AC-1** 產出一份 placement guide，逐頁列出貓頭鷹的出現方式、角色定位、建議圖片素材、尺寸、位置與使用情境。

**AC-2** guide 必須說明三張既有素材如何分工，避免全站重複堆疊或造成視覺疲勞。

**AC-3** guide 必須符合現有網站視覺語言，並指出哪些頁面應低調使用、哪些頁面適合較高辨識度的角色露出。

## Placement Guide: 貓頭鷹法官全站視覺融入策略

### 設計原則

貓頭鷹法官在站內應作為「降低理解門檻的編輯嚮導」，不是每頁都放大的裝飾主角。現有網站視覺語言偏向公共文件、新聞剪報與互動資料工具：灰白底、白色卡片、細邊框、`rounded-sm`、serif 標題、mono 小標、`#D32F2F` 紅色警示、`#FFE082` 黃色重點，以及 T1 的教材紙張感、T3 的深色危機模式。貓頭鷹露出應延續這套克制的文件感，以「角落註解、章節導讀、狀態提示」為主，避免把每頁都變成吉祥物頁。

三張素材分工：

| Asset | 尺寸 | 角色 | 主要使用場景 | 使用頻率 |
|---|---:|---|---|---|
| `public/codex/owl.png` | 640x640 | 主視覺／正式貓頭鷹法官 | 首頁、OG/share、T2 小點評頭像、About 收尾 | 高辨識度，但每個主要流程最多出現一次 |
| `public/codex/owl-past.png` | 200x200 | 歷史導讀員／翻卷宗的法官 | T1 時光機、爭議時序的歷史脈絡段落 | 中低調，以章節或工具提示為主 |
| `public/codex/owl-future.png` | 200x200 | 危機提醒員／敲槌提示行動 | T3 未來、危機 banner、需要行動判斷的 CTA | 中度辨識，搭配深色或紅色警示場景 |

避免視覺疲勞的規則：

- 同一頁最多一個「完整立姿」貓頭鷹，其他只用 40-64px 註解頭像或不使用。
- `owl.png` 只負責品牌識別與中性解說，不拿來反覆填滿每張卡片。
- `owl-past.png` 不跨到未來危機頁；`owl-future.png` 不用在歷史教材區，以維持時間軌道的語意清楚。
- 在列表型頁面中，貓頭鷹只出現在頁首、空狀態、精選提示或段落尾端，不進入每一張資料卡。
- 所有圖片維持透明 PNG，放在既有白卡、紙張底、深色 banner 或角落註解內；不要新增大面積彩色背景或圓形貼紙風格。

### 逐頁配置表

| Page | 露出強度 | 貓頭鷹出現方式 | 角色定位 | 建議圖片素材 | 尺寸 | 位置 | 使用情境 |
|---|---|---|---|---|---|---|---|
| 首頁 `/` | 高辨識度 | 保留 hero 右側主視覺卡片，作為全站唯一大型 mascot moment | 入口引導者，建立「貓頭鷹法官」品牌記憶 | `public/codex/owl.png`（若同步到站內路徑，對應 `/owl.png`） | Desktop 320-360px；mobile 200-240px | Hero 右欄白色 bordered card，延續現有 `Mascot` 紅色小標與旋轉影卡 | 首次進站、介紹專案語氣；不再於首頁三軌道卡片各放一隻，避免第一屏後重複 |
| T1 時光機 `/past` | 中低調 | 頁首或 decade header 的小型導讀圖，不進入每個歷史事件 | 歷史卷宗導讀員，提醒讀者「從課本翻到現實」 | `public/codex/owl-past.png` | Header 80-96px；decade header 如需使用則 40-48px | 頁面標題右側或標題下方 border-left 區塊末端；desktop 可靠右，mobile 放在標題下方 | 第一次進入 T1 時建立導讀感；decade 折疊區只在空白較多的 header 使用，不放進 sticky scrollytelling 畫面以免干擾左右對照 |
| T2 熱搜榜 `/present` | 低調到中度 | 沿用 `JudgeOwlComment` 的小頭像註解；列表卡片不新增大型圖 | 編輯小點評／深度領航，幫讀者把專業文章翻成白話 | `public/codex/owl.png` 或同步後 `/owl.png`；未來可用 112px avatar 裁切版 | 56px comment avatar；不要超過 72px | 文章卡或詳情頁的 `owl_comment` 黃色/綠色左框註解右上角 | 只在有 `owl_comment` 或 `owl_depth_comment` 的內容露出；熱搜榜本身以資料與來源卡片為主，避免吉祥物搶走新聞剪報感 |
| T3 未來 `/future` | 中高辨識度 | Crisis banner 或 page header 放一隻小型敲槌貓頭鷹，可與紅色 pulse/深色背景同框 | 危機提醒員，提醒「權利正在排隊」但不製造恐慌 | `public/codex/owl-future.png` | Desktop 96-120px；mobile 72-88px | 深色 crisis banner 右側或頁首標籤旁；需保留文字可讀區，圖片可絕對定位右下並低透明度陰影 | 進入未來頁、看到系統瓶頸與待審案件前，建立緊急但可理解的角色語氣；案件卡片與計算器內不重複放圖 |
| 意見懶人包 `/opinion-lazybag` | 低調 | 只在第一段工具說明或 section separator 旁加小型註解，不放 hero | 判決推理陪讀員，提示「看論理，不貼標籤」 | `public/codex/owl.png` | 48-64px | Header 右側小圖，或 Decision Flowchart 前的淡黃色註解框右上角 | 此頁核心是流程圖與光譜工具；貓頭鷹應作為解題提示，不應成為視覺主角 |
| 爭議時序懶人包 `/controversy-timeline` | 中度 | Intro 白卡右上角或 timeline 完成段落放 `owl-past.png`；OG 可保留 `owl.png` | 時序整理員，幫讀者把事件順序攤開 | `public/codex/owl-past.png` for page body；`public/codex/owl.png` for share/OG if needed | Body 72-96px；OG/share 使用 360px 以上來源 | Intro card 右上角浮動，或標題區右側；避免放在每個 timeline node | 頁面有「3 分鐘看完整故事」語氣，適合中度角色露出；timeline 事件本身要保持資料密度與可掃描性 |
| About `/about` | 中度 | 頁尾或專案緣由段落旁的小型正式 mascot，不放大型 hero | 專案主持／邀請參與的友善代表 | `public/codex/owl.png` | 96-140px desktop；72-96px mobile | 專案緣由區右側、貢獻者區前的窄欄，或頁尾 CTA 左側 | About 是品牌信任頁，適合讓主吉祥物出現一次；不要與 contributor grid 混排成裝飾圖，避免干擾人名與貢獻資訊 |

### 高辨識度 vs 低調頁面

高辨識度頁面：

- 首頁：唯一大型 mascot moment，負責建立品牌記憶。
- T3 未來：危機頁需要角色化的提醒，但尺寸控制在 banner 輔助圖。
- About：品牌信任與參與入口，可用一次正式主貓頭鷹。

中度露出頁面：

- T1 時光機：使用 `owl-past.png` 作為歷史導讀，不干擾 scrollytelling。
- 爭議時序懶人包：使用 `owl-past.png` 作為事件整理員，重點仍是時間軸。

低調頁面：

- T2 熱搜榜：以來源卡片、評論文字與 `JudgeOwlComment` 為核心，只用 56px 小頭像。
- 意見懶人包：以流程圖、光譜、判決論理為核心，貓頭鷹只當小提示。

### Implementation Notes

- 目前站內元件多使用 `/owl.png`、`/owl-past.png`、`/owl-future.png` 的 public root 路徑；若最終資產來源維持在 `public/codex/`，請同步或調整 import 路徑，避免設計規格與實作路徑分裂。
- 建議新增共用 `OwlMascot` 小元件集中管理 `src`, `size`, `className`, `alt` 與 `aria-hidden`。純裝飾時用 `aria-hidden` 和空 alt；有角色語意時使用 `alt="貓頭鷹法官"` 或更具體的頁面文案。
- 圖片應使用 `next/image`，`owl.png` hero 可 priority；小型註解圖不需要 priority。
- 頁面實作時優先沿用既有樣式：`border border-gray-200`、`rounded-sm`、`shadow-sm`、`font-serif`、`font-mono`、紅色小標與黃底註解框，不新增高飽和 mascot 專屬色塊。

## Stage Report: draft

- DONE: Placement guide lists every requested page with owl role, recommended source image, size, position, and usage context.
  Evidence: Added a seven-row placement table covering 首頁, T1 時光機, T2 熱搜榜, T3 未來, 意見懶人包, 爭議時序懶人包, and About.
- DONE: Guide explains how `owl.png`, `owl-past.png`, and `owl-future.png` are divided across the site to avoid repetition or visual fatigue.
  Evidence: Added asset division table and repetition rules limiting full-body appearances, list usage, and time-track crossovers.
- DONE: Guide identifies which pages should use subtle owl presence versus high-recognition mascot exposure, grounded in current site visual language.
  Evidence: Added high/mid/low exposure section grounded in inspected `src/app/page.tsx`, `/past`, `/present`, `/future`, `/opinion-lazybag`, `/controversy-timeline`, `/about`, `SharedPresent.tsx`, and `globals.css`.

### Summary

Drafted a production-ready owl placement guide for all requested pages using the three inspected `public/codex/` PNG assets. The strategy keeps the homepage as the primary mascot moment, uses past/future variants only where their time-track semantics fit, and keeps data-heavy/legal-analysis pages subtle so the current editorial document language remains intact.

## Stage Report: review

- DONE: Review verifies every requested page has owl role, source image, size, position, and usage context.
  Evidence: The placement table covers 首頁, T1 時光機, T2 熱搜榜, T3 未來, 意見懶人包, 爭議時序懶人包, and About with explicit role, asset path, pixel size range, placement, and usage context for each.
- DONE: Review checks asset division and subtle/high-recognition guidance against the three acceptance criteria.
  Evidence: Verified `public/codex/owl.png` is 640x640 and the past/future variants are 200x200; guide assigns `owl.png` to brand/comment use, `owl-past.png` to history/timeline contexts, and `owl-future.png` to crisis contexts, with clear high/mid/low exposure rules matching AC-1 through AC-3.
- DONE: Approval or rejection includes specific, actionable feedback suitable for the gate decision.
  Evidence: Verdict recommendation is PASSED; implementation feedback is to keep the path strategy consistent between `public/codex/*` and current root `/owl*.png` references, and to centralize future rendering in a shared `OwlMascot` component as noted by the guide.

### Summary

Verdict recommendation: PASSED. I reviewed the guide against the original brief, asset files, and representative site context in `src/app/page.tsx`, `src/app/past/page.tsx`, `src/app/future/page.tsx`, `src/components/SharedPresent.tsx`, `src/app/opinion-lazybag/page.tsx`, `src/app/controversy-timeline/page.tsx`, `src/app/about/page.tsx`, and `src/app/globals.css`; the guide is complete, visually consistent with the existing restrained document/tool language, and gives actionable implementation constraints.
