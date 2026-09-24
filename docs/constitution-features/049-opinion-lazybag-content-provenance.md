---
id: 049
title: opinion-lazybag 具名大法官內容無出處，且檔頭自述與實際內容相反
status: design
source: captain 2026-09-04（把關機制體檢第三類，最高風險項）
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

12 位真實大法官的姓名與法律立場正顯示在網站上，零出處。而承載這些資料的檔案，檔頭明文聲稱它不存放任何大法官姓名。

## Problem

**以下三項已由 FO 直接 grep 查證屬實，非轉述。**

### 一、檔頭聲明與內容相反

`src/data/opinions.ts:11-12` 寫著：

```
// No justice names, party affiliations, or personal identifiers are stored.
// The data schema physically enforces argument-based classification only.
```

同一個檔案：`:53` 有 `justiceName?: string`，`:97` 起有 **12 個真實姓名**（許宗力、吳陳鐶、黃昭元、詹森林⋯）。渲染於 `src/components/opinion-lazybag/OpinionTooltip.tsx:27` 與 `OpinionScatterPlot.tsx:265`，兩處都印「大法官：{name}」。

來源可追：`docs/constitution-features/_archive/014-opinion-lazybag.md:210` 當時 review 判定「No justice names — MET」，同檔 `:269-271` 後來又記錄「Add optional justiceName field — DONE / Populate justiceName for all 12 seed opinions with real justice names — DONE」。

**這與 feature `006` 是同一個失效模式：review 只驗結構存在，沒驗內容為真。**

### 二、法律立場掛在真實大法官名下，零出處

`src/components/opinion-lazybag/StanceSpectrum.tsx:19-35` 硬編 **14 位具名大法官**對 114年憲判字第1號的立場、論點摘要與數值座標。`DecisionFlowchart.tsx` 硬編 5 條爭議條文的違憲判斷與論理理由。**兩者皆無任何出處或連結。**

### 三、同一判決，兩處人數差 9 位

`src/data/controversy-timeline.ts:224` 寫 114憲判1「僅5位大法官參與」；`StanceSpectrum.tsx` 列出 14 位具名大法官的立場。**兩者都在線上。**

## 為什麼這是最高風險項

`015` 的教訓是虛構一個不存在的學者，公開顯示四個月。**本項是把法律判斷掛在真實的人身上**，而且與 `015` 是同一批作業（feature `014`）。

對一個公民科技專案而言，錯誤歸屬真實公職人員的法律立場，傷害不只是資料錯誤。

## Proposed approach

**待 captain 與 design stage 定案。** 本票不預設處置方向。三個候選，可能混用：

1. **查證並補上出處** —— 逐筆對照判決原文與官方資料，補上引用來源。工作量大，需法學判斷。
2. **移除具名** —— 回到 `014` 檔頭原本聲稱的「argument-based classification only」，不顯示姓名。
3. **下架整組** —— 在查證完成前不顯示。

無論選哪個，**檔頭聲明與實際內容必須一致**，第三項（人數矛盾）必須解決。

## Risk evidence

未執行 spike。本票的三項事實皆可由 grep 直接證明，不需 spike。**但處置方向涉及法律內容判斷，需 captain 決定，且可能需要法學背景者參與**（同 `docs/health-check/TODO.md` 的 P0-2 性質）。

## Acceptance criteria

待方向定案後補齊。現階段記錄驗收必須涵蓋的性質：

- 檔案的自我描述與實際內容一致。需以實際比對證明，不可只讀檔頭。
- 站上顯示的每一筆具名法律立場，都能指回可查證的來源；或不顯示具名。
- 同一判決的參與人數在全站敘述一致。

## Out of scope

不處理其他非 SSOT 內容的來源標記（另票）。不處理 feature 040。不處理 `contributors.ts` 的佔位資料。

---

## 補述（2026-09-23，來自 `065` implement）

**原文保留，不改寫。以下四點更正本票的事實前提。**
一手來源為判決書本文，取得指令見 `docs/constitution-features/065-opinion-lazybag-wrong-ruling-citation.md` 第一節。

**（a）`StanceSpectrum.tsx` 的 14 位講的是 113憲判9，不是 114憲判1。**
本文 `:39` 寫「14 位具名大法官對 114年憲判字第1號的立場」。該句繼承了站上的誤引。
14 筆 `summary` 全在講總統國情報告、藐視國會罪、國會調查權、人事同意權。
這些是 113年憲判字第9號【立法院職權行使法等案】的審查標的。
114年憲判字第1號是【憲法訴訟法修正案】，兩者無關。

**（b）本票第三節的前提已失效，實際問題比原文嚴重。**
第三節寫「同一判決，兩處人數差 9 位」。兩處不是同一判決，差額也不是重點。
比對判決書末的大法官名單後，`StanceSpectrum.tsx` 的名單對**兩個判決都不成立**：

- 4 位不在任一合議庭：黃虹霞、吳陳鐶、蔡明誠、林俊益。
- 漏列 113憲判9 合議庭 5 人：蔡宗珍（本案主筆）、蔡彩貞、朱富美、陳忠五、尤伯祥。
- 意見類型與判決書牴觸。呂太郎、楊惠欽被標「不同意見」，但兩人未提出任何意見書。
- `:26` 林俊益該筆與主文一直接相反。主文一明示法律「尚不因立法程序瑕疵而牴觸憲法」。

即：不是兩處人數不一致，是整份名單無出處且與一手來源衝突。

**（c）`src/data/opinions.ts` 的 12 筆 `rulingRef` 同樣不可信。**
12 筆 `argumentSummary` 與 4 個 `DIMENSIONS` 講的是法庭停擺、人數不足、急迫性，那是 114憲判1 的題目。
`rulingRef` 卻寫 113憲判9。號次與內容主題相反。
12 個 `justiceName` 對兩個合議庭也都不符。
重建資料時不可把現有 `rulingRef` 當基準。

**（d）重建資料的一手來源。**
113憲判9 判決書頁面的「憲法法庭113年憲判字第9號判決主文立場表」PDF。
頁面：`https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=352966`。

**`065` 已做與未做。**
`065` 已把 `/opinion-lazybag` 的意見光譜段移除（captain 2026-09-23 核可），首頁 CTA 不再承諾光譜分佈。
`src/components/opinion-lazybag/StanceSpectrum.tsx` **檔案保留未刪**，留給本票依上述 PDF 重建。
`065` 未動 `src/data/opinions.ts`，處置屬本票。
