---
id: "017"
title: 介面簡化與用戶體驗優化
status: review
source: meetup-20260416
started: 2026-04-30T20:33:44Z
completed:
verdict:
score: 0.6
worktree: .worktrees/spacedock-ensign-017-ui-simplification
issue:
pr:
---

簡化網站介面，減少專業術語與複雜性，降低非專業用戶理解門檻。

來源：0416 會議討論（10:28, 59:38）。包括：視覺化及簡化語言、透過表格及說明泡泡讓用戶直觀了解不同論證層面、刪除冗餘元素如過多 emoji。

## Stage Report — design (T2 present/熱搜榜 only)

### 1. Audit: Current T2 (present) page UI elements and complexity assessment

**List page (`src/app/present/page.tsx`):**

| UI Element | Complexity for Non-Expert | Notes |
|---|---|---|
| Page title "憲庭熱搜榜" | Medium — "憲庭" is jargon | Subtitle "公民必讀的憲政剪貼簿" also uses "憲政" |
| `[Present]` badge next to title | Low but unnecessary English jargon | English badge mixed into Chinese context |
| Search placeholder "在檔案庫中搜尋關鍵字、法案..." | Medium — "檔案庫" is overly formal | Users may not know what "法案" means |
| CourtTimeline sidebar | High — uses English codes like "SEC-CAT: CONSTITUTIONAL_EVOLUTION", "ARCHIVE RECORD / NO. 77", "ARCH" stamp | Decorative archive aesthetics add visual noise without informational value |
| "Urgent Record" stamp on timeline | Medium — English text on a Chinese page | |
| OfficialTLDR section | Medium — "Official TL;DR" is internet slang unfamiliar to older users | "Citation CORE" footer is opaque |
| ConstitutionalMoodWidget | Low complexity, but "HOW DO YOU FEEL?" English header is unnecessary | Mood labels (如臨深淵, 滿血復活) use literary Chinese |
| Section header "PUBLIC VOICES / 問題怎麼看" | Medium — English/Chinese mix adds cognitive load | |
| Category headers with English subtitles | Medium — "Scholar Perspectives", "NGO Reports", "Reels & Shorts" | English category names assume bilingual users |
| ScholarCard browser-chrome design | High — fake browser window (red/yellow/green dots, URL bar) is decorative clutter | Domain display is confusing ("what am I clicking?") |
| NGOCard browser-chrome design | Same as ScholarCard | |
| ReelCard dark theme | Medium — "Reels" badge, views counter | |
| VibeTag component | High — emoji-driven tags like "🔥 公民覺醒", "⚖️ 法律白話文" are fun but cryptic for non-experts | Rotation animation adds playfulness but reduces readability |
| JudgeOwlComment | Low — owl mascot comments are written in plain language | Good element to keep |
| NarrativeLoopFooter | Medium — English labels "BACK TO THE ORIGIN", "EXPLORE THE FUTURE", decorative stamps | |
| Card action labels | Medium — "開啟詳法與導讀", "查看專題報告與導讀" use "導讀" (guided reading), a literary term | |

**Detail page (`src/app/present/[id]/page.tsx`):**

| UI Element | Complexity for Non-Expert | Notes |
|---|---|---|
| Header category display | Low — shows raw category like "Scholar Articles" in English | |
| "Archive Record" / "REF: d1 / 2026.1.14" metadata | High — archive/reference codes are meaningless to non-experts | |
| "分類：Scholar Articles" | Medium — English category name | |
| "Abstract / 內文摘要" label | Medium — bilingual label with academic term "Abstract" | |
| "Arxiv Review" divider label | High — "Arxiv" is an academic preprint platform name, meaningless to most users | |
| "貓頭鷹法官．深度領航" | Low — playful and clear | Good |
| Bottom nav "Back Archive" | Medium — English-only | |
| "憲庭加好友 Add C0urt / Present Track" | High — mixed language brand text with "C0urt" (zero instead of O) | |

### 2. Specific elements to simplify, remove, or rephrase

**Remove entirely:**
- Browser chrome on ScholarCard and NGOCard (red/yellow/green dots, URL bar) — decorative noise
- Archive footer in CourtTimeline: "SEC-CAT: CONSTITUTIONAL_EVOLUTION / REF: PUBLIC_VOICES_V2" and "ARCH" stamp — meaningless codes
- "ARCHIVE RECORD / NO. 77" header in timeline — fake archive reference
- "Archive Record" and "REF:" metadata in detail page — adds no value for non-experts
- "Citation CORE" in OfficialTLDR footer — opaque
- "Urgent Record" English stamp on timeline danger item — replace with Chinese
- "憲庭加好友 Add C0urt / Present Track" bottom footer text — confusing mixed branding

**Simplify:**
- Browser-chrome cards -> plain cards with subtle category indicator
- VibeTag: remove rotation animation, keep emoji+label but increase font size for readability
- ConstitutionalMoodWidget English header -> Chinese only

### 3. Professional jargon to replace with plain language

| Current (Before) | Proposed (After) | Rationale |
|---|---|---|
| 憲庭熱搜榜 | 大家在討論什麼？ | "憲庭" is abbreviated jargon for "憲法法庭" |
| 公民必讀的憲政剪貼簿 | 看看專家和民間團體怎麼說 | "憲政剪貼簿" is a creative metaphor but unclear |
| 在檔案庫中搜尋關鍵字、法案... | 搜尋文章標題、作者... | "檔案庫" and "法案" are formal terms |
| 憲政大事記 | 重要時間表 | "憲政" can be simplified |
| Chronicle of the Constitutional Court | (remove) | English subtitle unnecessary |
| PUBLIC VOICES / 問題怎麼看 | 大家怎麼看？ | Remove English, simplify Chinese |
| 學者文章 (Scholar Perspectives) | 學者怎麼說 | Remove English parenthetical |
| NGO 倡議 (NGO Reports) | 民間團體怎麼說 | "NGO 倡議" is jargon; "民間團體" is plain |
| 影音轉譯 (Reels & Shorts) | 影片摘要 | "轉譯" is a technical term |
| 開啟詳法與導讀 | 看完整介紹 | "詳法" is unclear, "導讀" is literary |
| 查看專題報告與導讀 | 看完整介紹 | Same simplification |
| 查看由貓頭鷹轉譯的影片說明 | 看貓頭鷹的影片筆記 | "轉譯" -> "筆記" |
| HOW DO YOU FEEL? / 看完後您的心情是？ | 你看完覺得怎樣？ | Remove English, use casual tone |
| 如臨深淵 | 好擔心 | Literary Chinese -> everyday Chinese |
| 滿血復活 | 太好了！ | Gaming slang -> plain expression |
| 靜觀其變 | 再看看 | Literary -> casual |
| 原來如此 | 長知識了 | OK as-is but can be more casual |
| Abstract / 內文摘要 | 重點整理 | Remove "Abstract", simplify label |
| Arxiv Review | 貓頭鷹深度解析 | "Arxiv" is an academic platform name |
| Back Archive | 回到列表 | English -> Chinese |
| 閱讀完整分析 | 看完整內容 | "分析" implies expertise |
| 閱讀原始文件 | 看原始出處 | Minor simplification |

### 4. Concrete text replacements for key labels and descriptions

Detailed before/after for implementation:

**page.tsx (list page):**
- Title: `憲庭熱搜榜` -> `大家在討論什麼？`
- Badge: `Present` -> remove or change to `熱門`
- Subtitle: `公民必讀的憲政剪貼簿：看專家與民間如何解讀判決` -> `看看專家和民間團體怎麼說`
- Search placeholder: `在檔案庫中搜尋關鍵字、法案...` -> `搜尋文章標題、作者...`
- Timeline title: `憲政大事記` -> `重要時間表`
- Timeline English subtitle: remove `Chronicle of the Constitutional Court`
- Section header: `PUBLIC VOICES` -> remove; `問題怎麼看` -> `大家怎麼看？`
- Scholar section: `學者文章 (Scholar Perspectives)` -> `學者怎麼說`; count label `Articles` -> `篇`
- NGO section: `NGO 倡議 (NGO Reports)` -> `民間團體怎麼說`; count label `Articles` -> `篇`
- Reels section: `影音轉譯 (Reels & Shorts)` -> `影片摘要`; count label `Videos` -> `部`
- TL;DR badge: `Official TL;DR` -> `懶人包`
- Mood widget header: `HOW DO YOU FEEL? 看完後您的心情是？` -> `你看完覺得怎樣？`
- Mood labels: `如臨深淵` -> `好擔心`; `滿血復活` -> `太好了！`; `靜觀其變` -> `再看看`; `原來如此` -> `長知識了`
- Footer cards: `BACK TO THE ORIGIN` -> remove; `EXPLORE THE FUTURE` -> remove; `進入：歷史與教科書 (TRACK 01) →` -> `回顧歷史 →`; `進入：憲政復健現狀 (TRACK 03) →` -> `看看未來 →`

**[id]/page.tsx (detail page):**
- Category badge: translate to Chinese (Scholar Articles -> 學者文章, NGO Reports -> 民間報告, Reels -> 影片)
- Remove "Archive Record" / "REF:" metadata block
- Author category label: `分類：{item.category}` -> use Chinese category names
- Abstract label: `Abstract / 內文摘要` -> `重點整理`
- Owl section divider: `Arxiv Review` -> `貓頭鷹深度解析`
- Bottom nav: `Back Archive` -> `回到列表`
- Remove: `憲庭加好友 Add C0urt / Present Track`
- CTA button: `閱讀原始文件` -> `看原始出處`

### 5. Component changes needed vs text-only changes

**Text-only changes (no structural changes):**
- All label/placeholder/title replacements listed in sections 3-4
- Mood widget label changes
- Category name translations in detail page

**Component changes needed:**
- **ScholarCard / NGOCard**: Remove browser-chrome header (the fake window dots and URL bar). Replace with a simpler card design — just the content area with a subtle top-border color indicator (blue for scholar, red for NGO). This is a moderate template change.
- **CourtTimeline footer**: Remove the archive codes section ("SEC-CAT", "ARCH" stamp). Keep the timeline content itself — it is informative. Remove the decorative "ARCHIVE RECORD / NO. 77" header.
- **CourtTimeline danger stamp**: Change "Urgent Record" to "注意" (plain Chinese).
- **VibeTag**: Remove `transform -rotate-2 hover:rotate-0 hover:scale-105` animation classes for cleaner readability. Keep the color-coded display.
- **Detail page metadata block**: Remove the "Archive Record" / "REF:" div entirely. Keep VibeTag only.
- **NarrativeLoopFooter**: Remove English labels and decorative corner elements. Simplify to two clean link cards with Chinese text only.
- **OfficialTLDR**: Remove "Citation CORE" footer label.

**No changes needed:**
- JudgeOwlComment component — already written in accessible plain language
- Search functionality — works well
- Overall page layout (sidebar + main content grid) — good structure
- Cross-track navigation in detail page — informative

### 6. Acceptance criteria (testable checklist)

- [ ] No English-only UI labels remain visible on the T2 list page (search for uppercase English strings)
- [ ] "憲庭" does not appear in any user-facing heading or subtitle on T2 pages
- [ ] ScholarCard and NGOCard no longer display browser-chrome (red/yellow/green dots, URL bar)
- [ ] CourtTimeline no longer shows "SEC-CAT", "ARCHIVE RECORD", or "ARCH" stamp
- [ ] Search placeholder uses plain language (no "檔案庫" or "法案")
- [ ] Section headers use Chinese-only labels without English parentheticals
- [ ] Mood widget labels use everyday Chinese (not literary idioms)
- [ ] Detail page does not show "Archive Record", "REF:", or "Arxiv Review"
- [ ] Category names in detail page header display in Chinese
- [ ] VibeTag is displayed without rotation animation
- [ ] Bottom footer text "憲庭加好友 Add C0urt" is removed from detail page
- [ ] All card action labels use plain verbs (看/了解) instead of literary terms (詳法/導讀/轉譯)
- [ ] Page remains fully functional: search, navigation, links all work correctly
- [ ] No data model or JSON changes are required — all changes are presentation-layer only

### 7. Mobile/desktop responsive behavior notes

No layout structure changes are proposed. All changes are text replacements and removal of decorative elements, which will naturally improve mobile readability:

- Removing browser-chrome from cards saves ~40px vertical space per card on mobile, where screen real estate is precious
- Shorter Chinese labels (e.g., "學者怎麼說" vs "學者文章 (Scholar Perspectives)") reduce line-wrapping on narrow screens
- Removing the archive footer from CourtTimeline saves ~60px in the sticky sidebar, reducing scroll depth on mobile
- The existing responsive breakpoints (sm/md/lg/xl) remain unchanged and appropriate

**Summary:** This design proposal identifies 30+ specific text/label simplifications and 6 component-level changes to remove decorative clutter (fake browser chrome, archive stamps, English-only labels) and replace professional/literary Chinese with everyday language. All changes are presentation-layer only — no data model changes needed. The goal is to make the T2 page immediately understandable to a non-expert citizen reader without any legal or academic background.
