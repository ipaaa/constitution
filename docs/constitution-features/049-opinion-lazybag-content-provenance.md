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
