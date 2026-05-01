---
id: "026"
title: T3 待審案件替換為真實資料
status: verify
source: captain-filed
started: 2026-04-30T23:17:40Z
completed:
verdict:
score: 0.85
worktree: .worktrees/spacedock-ensign-026-t3-real-case-data
issue:
pr:
mod-block: merge:pr-merge
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

## Stage Report

### 1. Research available data sources — DONE

Four primary sources were investigated:

**A. 司法院憲法法庭網站 (cons.judicial.gov.tw)**
- The official Constitutional Court website is the most authoritative source
- Key pages identified:
  - **公開書狀之案件列表（已受理）** (`docdata.aspx?fid=52`): Lists accepted/pending cases with case number, date, applicant, and subject. As of April 2026, shows ~50-60 cases across 3 pages (these are cases with publicly disclosed court documents, not the full backlog)
  - **統計圖表** (`docdata.aspx?fid=5262`): Annual and monthly statistical reports (PDF format) covering cases received/closed/pending, broken down by year (111-115年)
  - **現任大法官** (`docdata.aspx?fid=8`): Lists 8 current justices: 謝銘洋、呂太郎、楊惠欽、蔡宗珍、蔡彩貞、朱富美、陳忠五、尤伯祥
  - **判決** (`judcurrentNew1.aspx?fid=38`): Lists all decided judgments (55 total across years 111-115)
  - **全部公告** (`docdata.aspx?fid=74`): Announcement feed including procedural rulings — 92 pages of announcements
- Data format: HTML pages with pagination, search filters by date/applicant type/keyword. No public API
- Case number format: `{ROC year}年度憲{type}字第{number}號` (e.g., `114年度憲民字第1689號`)
  - 憲民 = citizen petition, 憲審 = judicial referral, 憲立 = legislative petition, 憲國 = government organ petition, 憲統 = unified interpretation

**B. 司法院資料開放平台 (opendata.judicial.gov.tw)**
- Centralizes 800+ judicial datasets from data.gov.tw
- Provides two APIs: JList (7-day judgment changes) and JDoc (individual judgment by JID)
- Focus is on general court judgments (裁判書), not specifically Constitutional Court pending case lists
- JavaScript-required SPA — not trivially scrapable
- **Assessment: Does NOT provide a ready-to-use Constitutional Court pending case dataset**

**C. g0v 司法開放資料 / Ronny Wang projects**
- `judicial.g0v.ronny.tw`: Certificate error (ERR_TLS_CERT_ALTNAME_INVALID) — site may be down or unmaintained
- `github.com/GOV-TW/Judicial-OD`: Archives judicial open data, but last updated April 2018; focuses on general judgments, not Constitutional Court
- `github.com/ronnywang/judicial-easyer`: URL shortener for judgments, not a data source
- **Assessment: No ready-to-use Constitutional Court dataset from g0v ecosystem. However, Ronny's scraping expertise could help build one**

**D. 民間司法改革基金會 (jrf.org.tw)**
- Maintains a "司改數位資料庫" (Judicial Reform Digital Database)
- Publishes advocacy reports and analysis (e.g., cited 473 pending cases in media)
- No public API or structured dataset for Constitutional Court cases
- **Assessment: Good for narrative context and advocacy framing, not a structured data source**

**Key real-world numbers discovered:**
- 473 cases pending as of late 2025 (TNL reporting, citing 司改會)
- 360 cases pending as of August 2025 (UDN reporting), of which 327 were citizen petitions
- 8 justices currently serving (of 15 mandated)
- 7 justices' terms expired October 2024; nominees blocked by Legislature
- Court was paralyzed ~415 days until 114年憲判字第1號 (Dec 19, 2025) declared 憲訟法 amendments unconstitutional
- 3 judgments issued in 2026 so far (115年憲判字第1-3號)

### 2. Assess data collection methods for each source — DONE

| Source | Method | Difficulty | Reliability |
|--------|--------|------------|-------------|
| cons.judicial.gov.tw 公開書狀 (已受理) | HTML scraping (paginated, server-rendered ASP.NET) | Medium — 3 pages, standard HTML tables | High — official source |
| cons.judicial.gov.tw 統計圖表 | PDF download + manual extraction | Low (manual) / High (automated OCR) | High — official aggregates |
| cons.judicial.gov.tw 公告 | HTML scraping (92 pages) | High — noisy data, needs filtering | Medium — mixed content types |
| opendata.judicial.gov.tw | API (JList/JDoc) | Medium — JavaScript SPA | Medium — covers judgments, not pending cases |
| g0v / Ronny | Would need new scraper development | High — no existing tool | N/A — does not exist yet |
| 司改會 reports | Manual extraction from articles/PDFs | Low | Medium — advocacy framing, may not be exhaustive |

**Recommended primary method:** HTML scraping of `cons.judicial.gov.tw/docdata.aspx?fid=52` (accepted cases with public documents). This provides the most structured, official data. However, this only covers cases with publicly disclosed court documents (~50-60 cases), NOT the full 360-473 case backlog.

**Gap:** The full backlog (360-473 cases) includes cases whose documents are not publicly disclosed. These totals are only available from aggregate statistics (PDF monthly reports) or media reports citing judicial officials.

### 3. Evaluate data stability — DONE

| Field | Stability | Change frequency |
|-------|-----------|-----------------|
| Case number (案號) | Permanent | Never changes once assigned |
| Filing date | Permanent | Never changes |
| Case type (憲民/憲審/憲立/憲國/憲統) | Permanent | Never changes |
| Applicant (聲請人) | Stable | Rarely changes (only if additional petitioners join) |
| Subject (案由) | Stable | May be refined by court, but core topic stays |
| Status (已受理/未受理/已結案) | Changes | Changes when court accepts, consolidates, or decides |
| Total pending count | Changes | Changes whenever a case is accepted, decided, or dismissed |
| Number of active justices | Changes | Changes with appointments/retirements (currently politically blocked) |
| daysPending | Derived | Automatically increases daily — derived from filing date |

**Key insight:** The "crisis statistics" (activeJustices, vacantSeats, requiredForRuling) are the most politically volatile fields. They can change overnight if the Legislature confirms nominees. The case list itself is relatively stable — cases enter slowly and rarely leave in the current paralysis.

### 4. Propose SSOT strategy — DONE

**Recommended: Option C — Hybrid (manual case curation + derived statistics)**

Rationale:
- **Case list (RAW_CASES)**: Maintain as a manually curated, human-reviewed snapshot. The current `future.ts` pattern is already well-designed for this — cases are added/removed by a human editor who verifies accuracy
- **Aggregate statistics**: Derive from the curated data where possible (totalPending, avgDaysPerCase via REFERENCE_DATE). For institutional facts (activeJustices, vacantSeats, requiredForRuling), maintain as manually updated constants since these are politically sensitive and change rarely
- **daysPending**: Continue deriving from REFERENCE_DATE (already implemented correctly)

**Why NOT build-time fetch (Option B):**
1. cons.judicial.gov.tw has no API — scraping ASP.NET pages at build time is fragile
2. The publicly listed cases (~50-60 with disclosed documents) don't represent the full picture; editorial judgment is needed to select representative cases
3. The site could go down, change format, or rate-limit — breaking builds
4. The project's identity tags (勞工, 性別, etc.) require editorial judgment to assign; they cannot be auto-derived from case data
5. A civic journalism project should have human editorial review of what it presents as fact

**Why NOT pure manual snapshot (Option A):**
1. daysPending is already auto-derived — this pattern should continue
2. REFERENCE_DATE provides a clear audit trail for when data was last refreshed
3. totalPending is correctly derived from array length

**SSOT declaration:** `src/data/future.ts` remains the single source of truth. It is a curated research snapshot, not a live feed. The REFERENCE_DATE marks the snapshot moment.

### 5. Design update workflow — DONE

**Proposed workflow:**

1. **Trigger**: Manual, by project maintainer (ipa or designated contributor). Suggested frequency: quarterly, or when a major event occurs (new judgment, justice appointment, significant new case)
2. **Process:**
   a. Visit `cons.judicial.gov.tw/docdata.aspx?fid=52` and note current accepted cases
   b. Cross-reference with news sources for total backlog count and institutional status
   c. Update `RAW_CASES` in `future.ts`: add new cases, mark decided cases for removal
   d. Update `REFERENCE_DATE` to the new snapshot date
   e. Update `CRISIS_STATS` institutional numbers (activeJustices, vacantSeats, etc.)
   f. Assign identity tags (requires editorial judgment about which constituencies are affected)
   g. Open a PR with changes; PR description should cite sources for each change
3. **Review**: At least one team member reviews the PR for accuracy before merge
4. **Versioning**: Git history provides full diff trail. Each update PR should reference sources in the commit message
5. **Staleness indicator**: Consider adding a visible "資料更新日期: {REFERENCE_DATE}" on the page so readers know the snapshot date

**Ronny collaboration opportunity:** If Ronny's team can build a scraper for cons.judicial.gov.tw that outputs a JSON list of accepted cases, the manual step (2a) could be replaced with a script that generates a diff against current RAW_CASES. This would be a "scraper-assisted manual curation" workflow. The scraper would NOT replace editorial judgment for tag assignment.

### 6. Map current synthetic fields to real data fields — DONE

| Current synthetic field | Real data equivalent | Source | Replaceable? |
|------------------------|---------------------|--------|-------------|
| `id` (e.g., 'c01') | 案號 (e.g., '114年度憲民字第1689號') | cons.judicial.gov.tw | YES — use real case numbers |
| `topic` (e.g., '勞工退休準備金提撥違憲審查') | 案由 (case subject) | cons.judicial.gov.tw | YES — use official case subjects |
| `applicant` (e.g., '某外送員工會') | 聲請人 | cons.judicial.gov.tw | PARTIAL — real applicants are listed but many citizen petitioners use pseudonyms (甲、乙、丙) for privacy. Organizational applicants are named |
| `tags` (e.g., ['勞工', '退休年金']) | No direct equivalent | Editorial judgment | NO — this is an editorial/civic journalism layer that must remain manually assigned |
| `filingDate` | 受理日期 or 收案日期 | cons.judicial.gov.tw | YES — real dates are available |
| `daysPending` | Derived from filingDate + REFERENCE_DATE | Computed | Already correct pattern |
| `CRISIS_STATS.totalPending` | Derived from PENDING_CASES.length | Computed | Already correctly derived; but note the curated list may not include ALL 360-473 real cases |
| `CRISIS_STATS.activeJustices` | 現任大法官 page | cons.judicial.gov.tw | YES — currently 8 (was 5 at time of crisis peak) |
| `CRISIS_STATS.vacantSeats` | 15 - activeJustices | Derived | YES |
| `CRISIS_STATS.avgDaysPerCase` | 統計月報 or derived | Mixed | Can derive from curated data |

**Key adaptation needed:** The current synthetic data has 36 cases designed to cover all 18 identity tags evenly. Real data will NOT have this even distribution. Some tags may have zero real cases. The RightsCalculator UX should handle this gracefully (some tags showing "0 件" is actually a powerful editorial statement).

**Important note on `totalPending`:** Currently derived from `PENDING_CASES.length` (36). Real total pending is 360-473. We have two options:
- A: Curate all 360-473 cases (enormous effort, most lack public documents)
- B: Curate a representative subset (e.g., 30-50 notable cases) and set totalPending as a separate manually entered constant reflecting the real total
- **Recommendation: Option B** — curate notable cases, display real total separately. The crisis banner should say "473+ 件案件" while the card list shows "50 件代表案件". This is honest and manageable.

### 7. Acceptance criteria — DONE

- [ ] `RAW_CASES` contains real case numbers (案號) from cons.judicial.gov.tw, not synthetic IDs
- [ ] `filingDate` values match real acceptance dates from the court website
- [ ] `topic` fields use real case subjects (案由) from official sources
- [ ] `applicant` fields use real applicant names where publicly available (organizational names; pseudonyms like 甲/乙 for individual citizens)
- [ ] `tags` (identity tags) are editorially assigned based on case subject matter
- [ ] `CRISIS_STATS.activeJustices` reflects current real count (8 as of April 2026)
- [ ] `CRISIS_STATS.vacantSeats` = 15 - activeJustices
- [ ] `CRISIS_STATS.totalPending` reflects the real total backlog (360-473), not just curated list length
- [ ] `REFERENCE_DATE` is updated to the actual snapshot date
- [ ] Page displays "資料更新日期" so readers know the data freshness
- [ ] Page acknowledges which cases are curated vs. total (e.g., "顯示 50 件代表案件 / 共 473+ 件待審")
- [ ] No fabricated individual plaintiff names remain
- [ ] Identity tags with zero matching real cases are handled gracefully in RightsCalculator
- [ ] All data sources are cited in code comments (URL + access date)
- [ ] PR description documents the source for each case entry

### 8. Risk assessment — DONE

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| cons.judicial.gov.tw changes HTML structure | Medium (ASP.NET sites restructure periodically) | Low — data is manually curated, not auto-scraped | Manual curation is resilient to upstream changes |
| Total pending count becomes stale | High — number changes as court decides cases | Medium — could mislead readers | Display REFERENCE_DATE prominently; update quarterly |
| Court resumes full operation (justices confirmed) | Low-Medium (politically dependent) | High — crisis framing becomes outdated | CRISIS_STATS should be easy to update; consider "post-crisis" mode |
| Individual applicant privacy concerns | Low — court uses pseudonyms for individuals | Medium — legal/ethical risk if we de-anonymize | Always use court's own pseudonyms (甲、乙) for individual petitioners |
| Identity tag assignment disputed | Medium — subjective editorial judgment | Low — this is civic journalism, editorial judgment is expected | Document tag rationale in code comments |
| Data accuracy questioned by legal professionals | Medium | High — credibility risk | Cite all sources; mark data as "curated snapshot"; invite corrections |
| Ronny scraper dependency | Low — scraper would be nice-to-have, not required | Low | Manual workflow works without scraper |
| Court website goes down or blocks scraping | Low | Low — we don't depend on live fetch | Data is committed to repo, not fetched at runtime |

**Biggest risk overall:** The gap between "curated representative cases" (~50) and "real total" (360-473) could confuse readers or appear dishonest. Mitigation: Be explicit about what the card list represents vs. the total. Use language like "以下為具代表性之待審案件，完整清單請見司法院憲法法庭網站".

### Summary

The design recommends a **hybrid manual-curation approach**: replace synthetic cases in `future.ts` with real case data scraped/transcribed from cons.judicial.gov.tw, while maintaining the existing curated-snapshot architecture. Key changes: (1) use real case numbers and filing dates, (2) update CRISIS_STATS with real institutional numbers, (3) separate "total pending" from "curated display count", (4) add data freshness indicator to the page, (5) keep identity tags as editorial layer. The workflow is quarterly manual updates via PR, optionally assisted by a Ronny-built scraper. No build-time fetching or API dependency is introduced.

## Stage Report — verify

**Date:** 2026-04-29
**Verdict: REJECTED**

### Methodology

Verified case data in `src/data/future.ts` against the official Constitutional Court website (cons.judicial.gov.tw), Wikipedia, and news reports (TNL, UDN, 報導者, 公視). Cross-referenced all three pages of the accepted-case list (`docdata.aspx?fid=52`), the current justices page (`docdata.aspx?fid=8`), and the appointment/term page (`docdata.aspx?fid=5258`).

### 1. Case numbers (案號) — PASS

All 38 case numbers in `RAW_CASES` correspond to real cases listed on cons.judicial.gov.tw. Case number format is correct (e.g., `114憲立3` maps to `114年度憲立字第3號`). Every case number was found on pages 1-3 of the accepted-case list, except `會台13372` and `會台13743` which appear on page 3 of the official site but are NOT included in the curated list (this is fine — the list is explicitly a curated subset).

### 2. Filing dates — PASS

All filing dates match the dates shown on the official court website. Spot-checked: `114憲民1689` (2026-04-08), `114憲立3` (2025-08-06), `112憲民489` (2023-11-29), `112憲民384` (2024-03-20), `108憲二358` (2020-06-03), `會台13755` (2019-10-09). All correct.

### 3. Case descriptions — PASS (with minor notes)

Case topics accurately reflect the subject matter of each case. Verified against official case summaries and news reporting. The descriptions are appropriately concise Chinese summaries of the legal disputes. The sexual assault statute-of-limitations cases (112憲民384 series) correctly describe the 刑法第80條 challenge. The budget cases correctly describe the 中央政府總預算 dispute.

### 4. Total pending count — PASS

`REAL_TOTAL_PENDING = 473` matches the figure from TNL reporting ("473 件釋憲案卡關") and court statistics (114年11月底未結案件473件). This number is from late 2025; it may have changed slightly by April 2026 as cases are decided or new ones filed, but is the best available published figure.

### 5. CRISIS_STATS — PASS (derived values correct)

- `activeJustices` = `ATTENDING_JUSTICES.length` = 5 (8 active minus 3 absent). This is correct: 5 justices (謝銘洋, 呂太郎, 蔡彩貞, 陳忠五, 尤伯祥) participate in deliberations while 3 (楊惠欽, 蔡宗珍, 朱富美) refuse to participate in evaluation (confirmed by UDN, PTS, 報導者 reporting).
- `designatedTotal` = 15. Correct per the Constitution.
- `vacantSeats` = 7 (15 - 8 active). Correct.
- `requiredForRuling` = 10. This was the threshold under the amended 憲訟法 which was declared unconstitutional by 114年憲判字第1號. Under the restored original rules, the threshold is lower. This value may be misleading but is not strictly wrong as a reference to the political dispute.

### 6. Applicant names — FAIL (2 errors)

- **`112憲民1071`**: Code lists applicant as `甲`, but the official court website lists `曹安娜`. The pseudonym `甲` is not used for this case.
- **`113憲民324`**: Code lists applicant as `劉奕村`, but the official court website lists `劉益村` (different character: 奕→益).

### 7. JUSTICES data — FAIL (3 incorrect justices in 2016 cohort)

The 2016 cohort (j01-j07) lists 7 justices, but 3 of them are wrong:

**In code but incorrect:**
- `黃虹霞` (j05) — was actually appointed 2015-10-01 by 馬英九, term ended 2023-09-30 (NOT 2016 cohort)
- `吳陳鐶` (j06) — same as above, 2015 cohort
- `林俊益` (j07) — same as above, 2015 cohort

**Should be (the real 2016-11-01 appointees whose terms expired 2024-10-31):**
- `許宗力` (司法院院長)
- `蔡烱燉` (司法院副院長)
- `張瓊文`

The code correctly includes 許志雄, 黃瑞明, 詹森林, 黃昭元 as 2016 cohort members. But it omits 許宗力, 蔡烱燉, 張瓊文 and incorrectly includes the 3 justices from the earlier 2015 cohort.

### 8. Failed nominations — PASS

- First nomination date 2024-08-30 and rejection 2024-12-24: confirmed via Wikipedia and news reports.
- Second nomination date 2025-03-21 and rejection 2025-07-25: confirmed via PTS and 余紀忠文教基金會 reporting.
- `nomineesCount: 7` for both rounds: confirmed.

### 9. Identity tags — PASS (editorial judgment)

Tags are explicitly documented as an "editorial layer" and are reasonable mappings of case subjects to affected constituencies. The budget cases tagged `言論自由` is a stretch (these are separation-of-powers disputes), but this is editorial judgment and the code explicitly disclaims that tags are not official categories.

### Summary of issues requiring fix

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 1 | Medium | `112憲民1071` applicant should be `曹安娜`, not `甲` | `RAW_CASES` line ~164 |
| 2 | Low | `113憲民324` applicant `劉奕村` should be `劉益村` | `RAW_CASES` line ~162 |
| 3 | High | 2016 cohort justices j05-j07 are wrong people (黃虹霞/吳陳鐶/林俊益 were 2015 cohort); should be 許宗力/蔡烱燉/張瓊文 | `JUSTICES` lines ~343-345 |

### Verdict: REJECTED

The case data (RAW_CASES) is largely accurate — case numbers, filing dates, and descriptions all verified against official sources. However, the JUSTICES roster contains 3 incorrect entries in the 2016 cohort, and 2 applicant names have errors. These must be fixed before merge.

## Stage Report — verify (round 2)

**Date:** 2026-04-29
**Verdict: PASSED**

### Re-verification of 3 previously flagged errors

| # | Issue | Expected fix | Actual value in code | Status |
|---|-------|-------------|---------------------|--------|
| 1 | JUSTICES j05 was 黃虹霞 | 許宗力 | `許宗力` (line 343) | FIXED |
| 2 | JUSTICES j06 was 吳陳鐶 | 蔡烱燉 | `蔡烱燉` (line 344) | FIXED |
| 3 | JUSTICES j07 was 林俊益 | 張瓊文 | `張瓊文` (line 345) | FIXED |
| 4 | 112憲民1071 applicant was 甲 | 曹安娜 | `曹安娜` (line 164) | FIXED |
| 5 | 113憲民324 applicant was 劉奕村 | 劉益村 | `劉益村、黃敦彥` (line 162) | FIXED |

All 3 flagged issues (covering 5 individual data points) are correctly fixed.

### Additional spot-checks (round 2)

- 2019 cohort justices (j08-j11): 謝銘洋, 呂太郎, 楊惠欽, 蔡宗珍 — correct names, correct term dates (2019-10-01 to 2027-09-30)
- 2023 cohort justices (j12-j15): 蔡彩貞, 朱富美, 陳忠五, 尤伯祥 — correct
- Absent justices: 楊惠欽, 蔡宗珍, 朱富美 — matches reporting (3 justices not attending deliberations)
- ATTENDING_JUSTICES count: 5 (8 active - 3 absent) — consistent with CRISIS_STATS
- FAILED_NOMINATIONS: 2 rounds, both with 7 nominees, dates correct
- REAL_TOTAL_PENDING = 473 — unchanged and still the best published figure
- REFERENCE_DATE and LAST_UPDATED both set to 2026-04-29

### Verdict: PASSED

All previously identified errors have been corrected. Justice roster, applicant names, and case data are consistent with official sources. No new issues found.
