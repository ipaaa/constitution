---
id: 063
title: requiredForRuling 的法律正確性（114憲判1）
status: review
source: constitution-features/056 第二節 D3
started: 2026-09-21T21:16:25Z
completed:
verdict:
score: 0.75
worktree: .worktrees/spacedock-ensign-063-required-for-ruling-legal-accuracy
issue:
pr:
mod-block:
gates:
    version: 1
    records:
        - id: gate:063:verify
          stage: verify
          attempts:
            - id: gate-attempt:063-verify-1
              briefing:
                id: briefing:063:verify:attempt-1:revision-1
                digest: sha256:bf931d2854e94bd2d770d9657dc1f6e6804af5b740ed055282f8d324407d7b65
                room-ref: '@review/verify/briefing-1'
              resolution:
                type: Resolution
                id: resolution:spacedock:063:verify:1
                briefing: briefing:063:verify:attempt-1:revision-1
                by: person:captain
                at: "2026-09-23T17:47:28.259088Z"
                decision: approve
                reason: captain 2026-09-23 核准。站上每一條法律敘述都對得回一手來源且經三輪逐字查核；最關鍵的攔截是查證陷阱（全國法規資料庫仍原樣顯示已失效的第30條第2至6項，只查該站會得到錯誤結論）。AC1–AC7 三輪無回歸，AC3 在真實 HTML 上直接量測到端值。V11 隨 REFERENCE_DATE 那張票處理，V7 另開票，L1/L2/L3 與 L5 維持未拍板/未達成。
              application:
                target-stage: review
                state: consumed
            - id: gate-attempt:063-verify-2
              briefing:
                id: briefing:063:verify:attempt-2:revision-1
                digest: sha256:bff03c77d6885e7612352902a44db513c3c4ba85a575b12c66c8350808152cfc
                room-ref: '@review/verify/briefing-2'
              withdrawal:
                by: agent:first-officer
                at: "2026-09-23T18:04:36.696038Z"
                reason: FO 誤開：branch->main 的 entity mirror 把 status 由 review 蓋回 verify，致本次 prepare 錯誤地開出 verify attempt-2。captain 已於 2026-09-23 核准並 consume 過 verify gate，本票應在 review。撤回此 attempt，修正 status 後改開 review gate。
---

確認 `requiredForRuling` 這項法律內容的正確性，並讓它有明確的負責人。

## Problem

這一項原本掛在 `021`／`026` 兩張**已封存**的票上。掛在封存票上等於沒人負責——這正是 feature `056` 的 Problem 一節所說的「各自漂走」。`056` 因此判定開專票。

內容涉及 114 年憲判字第 9 號，需要法學判斷才能拍板。

## Proposed approach

design stage 先界定：要確認的具體命題是什麼、以什麼為權威來源（憲判原文而非轉述）、以及錯誤若成立時站上哪些位置會受影響。

**拍板需法學背景者。** 這一項的結論可能是「修正」也可能是「確認原本就對」，design stage 不預設答案。

### Feedback Cycles

- Cycle 1: REJECTED — verify；surface 9 檔／+557 淨行（+605/-48；不含本票流程記錄則 +224）vs estimate 無（本票 design 未產出 `## Expected surface and tolerance` 段，記為缺口，本輪不因此退回）；AC unchanged。V1 fix（Material，本票擁有：`future.tsx:202`「5 名大法官無法達到判決門檻」與本票自己新加的「失效後已作成 6 則判決」在同一 grid 相鄰兩格直接互相否證；第五小節 L4 指示「不可原樣留下」的兩條分支都沒走到；「法庭做不出判決」是經驗事實非法學解釋——七則判決加 115憲判6【30】的援引先例）；V2 fix（Material：card 首句「生效期間／全年」矛盾，且 114 年唯一一則判決就是 114憲判1 本身，而它以【41】【43】明文拒絕適用該下限，原句語意恰好相反）；V3 fix（Material，FO 裁量最小修法：只更新 `LAST_UPDATED`，不動 `REFERENCE_DATE`——既有過期問題被本票新增內容升級為同頁自相矛盾，故責任歸屬改變）；V4／V5／V6 fix（Polish：多餘空格與「判決違憲」改「宣告違憲」、破句補字、`rule` 補回「除本法別有規定外」）；V7 Needs decision 維持不動（Material 但本票 AC3／AC4 範圍明文限於 `/future`，不得擴張範圍；建議另開票）；V8 不處置（屬 `049`／`design-assets`）；V9 併入 L1（115憲判6【30】證據，L1 問法改寫，原句保留）。reviewer 對 cycle 1 的 AC1–AC7 七項全部獨立重跑通過（真頁面 HTML 123,621 bytes、AC2 自 main 獨立重製 tsc 三筆、還原以三種互不相依方法比對）；cycle 2 中 implement 自我修正一次（V1 首版改寫會引入無來源敘述，改為整句刪除），並另抓到兩處同類空格問題。L5（375px 六行量測）維持未達成——環境無可用無頭瀏覽器，八種旗標組合全部 `SEGV_ACCERR`。
- Cycle 2: PASSED-with-finding — verify cycle 2；surface 3 檔／+194 淨行（+197/-3；不含本票流程記錄則 +17/-3）；AC unchanged（AC 全節自 `7f1f44e` 以來逐字相同，2425 bytes 程式比對）。cycle 1 的 V1／V2 經 reviewer 獨立重驗確認真的修好且無副作用——最有力證據是跨輪渲染文字 `diff`：整頁可見文字只有四處變動且全在授權範圍內；V1 確為整句刪除而非換成無來源敘述（`新進案量`／`能結案的量` 實際 HTML 皆 0 筆）。V10 fix（Material，本票擁有：**成因是 FO 在 cycle 1 的 V3 處置**——裁定只更新 `LAST_UPDATED` 不動 `REFERENCE_DATE`，使標頭由低報翻為高報：標頭印 2026-09-21，而案件年齡、席次圖 TODAY 線與倒數仍以 2026-04-29 計算、落後 145 天；低報被本票新增內容當場戳破讀者看得見，高報則讓案件清單默默過期讀者沒有線索）。implement 採 FO 兩選項中的第二種（維持原字樣＋加一行「待審案件統計截至 <REFERENCE_DATE>」），理由是第一種靠省略避免高估、讀者仍不知案件清單的日期，而正下方就印著 473 件；並以直接讀 `REFERENCE_DATE` 常數而非寫死字串實作，避免日後再漂移成第二個 V10。同輪修正 `future.ts` Refresh procedure 第 1 步（原寫兩個日期應一起動，拆開後該行已錯）。V7／V8 依授權零變動並維持 Needs decision；`page.tsx:201`「每年處理量約 30~40 件」為既有無來源量化敘述，reviewer 記為非本輪 finding，FO 併入 V7 新票建議。L5（375px 六行量測）維持未達成——環境八種旗標組合全部 `SEGV_ACCERR`。round record 依 captain 明確授權跳過（原話：「跳過 round record，直接重跑 reviewer」）——room 已轉錄並 commit 在 main，但未記錄。

## Out of scope

不改同步程式或發布欄位。不處理 D1／D2（`h2`／`h28`）——`056` 已明確接受，並加了重新核可前須經法學確認的反向保護。

## Design

**結論先講：`requiredForRuling: 10` 目前是錯的，而且錯兩層。**
第一層，10 從來不是「同意人數」，它是「參與評議人數的下限」。
第二層，訂下這個下限的條文已經失效。憲法法庭在 2025-12-19 判它違憲。

**本票標題的引註也是錯的。** 標題寫「114憲判9」。**沒有這一號判決。**
正確的是 **114 年憲判字第 1 號**。誤引的源頭見本節第六小節。

---

### 一、要確認的命題

design 階段要確認三個可獨立證偽的命題。

| 代號 | 命題 | 結論 |
|---|---|---|
| Q1 | 現行有效的憲法法庭判決門檻條文是哪一條，文字為何 | 憲法訴訟法第 30 條第 1 項。文字見第三小節 |
| Q2 | 數字 10 在該脈絡下指什麼 | 指「參與評議之大法官人數下限」，不是同意人數。同意違憲宣告的下限是 9 |
| Q3 | 訂下 10 的條文現在還有效嗎 | 無效。憲法訴訟法第 30 條第 2 項自 2025-12-19 起失其效力 |

**Q2 的區分是本票的核心。** 「參與評議」是出席並參與討論與表決。
「同意」是投贊成票。兩者人數不同。站上把 10 講成「同意」人數。

---

### 二、權威來源與實跑證明

只用一手來源：條文本身與憲判原文。不用任何轉述或二手整理。

| 來源 | 端點 | 用途 |
|---|---|---|
| 憲法訴訟法全文 | `https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0030159` | Q1、Q2 的條文文字 |
| 憲法訴訟法第 30 條 | `https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=A0030159&flno=30` | 同上，單條 |
| 憲法訴訟法沿革 | `https://law.moj.gov.tw/LawClass/LawHistory.aspx?pcode=A0030159` | 確認最後一次修正為 114-01-23，之後無修正 |
| 修正前條文（112-06-21 版） | `https://law.moj.gov.tw/LawClass/LawOldVer.aspx?pcode=A0030159&lnndate=20230621&lser=001` | 比對修法究竟改了什麼 |
| **114 年憲判字第 1 號** | `https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=355485` | Q3 的失效依據。主文與理由 |
| 判決清單（判決） | `https://cons.judicial.gov.tw/judcurrentNew1.aspx?fid=38` | 確認有無「114憲判9」；確認 115 年判決件數 |

**實跑證明（已執行，可重跑）：**

```bash
# 1. 條文：現行第30條有六項；「法定總額」在全文中出現 0 次
curl -s -L 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0030159' \
  | python3 -c "import sys,re,html; t=html.unescape(re.sub(r'(?s)<[^>]+>',' ',sys.stdin.read())); \
print('法定總額:',t.count('法定總額'),' 現有總額:',t.count('現有總額'))"
# 實跑輸出：法定總額: 0  現有總額: 13
#           載重的是前者：「法定總額」在全文出現 0 次

# 2. 修正前第30條只有一項，文字與現行第1項相同
curl -s -L 'https://law.moj.gov.tw/LawClass/LawOldVer.aspx?pcode=A0030159&lnndate=20230621&lser=001' | grep -c '不得低於十人'
# 實跑輸出：0    ← 修正前沒有 10 人下限
#           注意：grep -c 無命中時 exit 1。放進 set -e 腳本會中斷

# 3. 憲判：114 年只有第 1 號，沒有第 9 號
curl -s -L 'https://cons.judicial.gov.tw/judcurrentNew1.aspx?fid=38' \
  | python3 -c "import sys,re,html; t=html.unescape(re.sub(r'(?s)<[^>]+>',' ',sys.stdin.read())); \
print(sorted(set(re.findall(r'11[45]年憲判字\s*第\d+號',t))))"
# 實跑輸出：['114年憲判字  第1號', '114年憲判字第1號', '115年憲判字  第1號' … '第6號']
#           114 年只有第 1 號。清單中沒有 114 年第 9 號
```

> ⚠️ **陷阱，implement 與 verify 必讀。**
> 全國法規資料庫**不標註**第 30 條第 2 項至第 6 項已被判違憲失效。
> 該站至今仍把失效文字照原樣顯示（已實跑確認：`art30` 頁面搜尋
> `失其效力|失效|憲判|停止適用` 命中 0 筆）。
> **只查全國法規資料庫會得到「10 是對的」這個錯誤結論。**
> 條文是否有效，權威在憲判主文，不在法規資料庫的顯示。
>
> 這與 feature `012` 付過的學費同型：單一資料庫的呈現不等於法律現況。
> `012` 漏的是廢止法規的獨立 pcode；本票漏的會是憲判造成的失效。

技術注意：司法院站憑證缺 Subject Key Identifier。Python `urllib` 連不上。
上列指令一律用 `curl`，僅把 Python 當文字處理器。已實跑通過。

---

### 三、法律事實（一手引文）

**現行憲法訴訟法第 30 條**（民國 114 年 1 月 23 日修正公布，全國法規資料庫顯示文字）：

> 判決，除本法別有規定外，應經大法官現有總額三分之二以上參與評議，大法官現有總額過半數同意。
> 前項參與評議之大法官人數不得低於十人。作成違憲之宣告時，同意違憲宣告之大法官人數不得低於九人。
> 參與人數未達前項規定，無法進行評議時，得經大法官現有總額過半數同意，為不受理之裁定。
> 前二項參與人數與同意人數之規定，於憲法法庭依第四十三條為暫時處分之裁定、依第七十五條宣告彈劾成立、依第八十條宣告政黨解散時，適用之。
> 依本法第十二條迴避之大法官人數超過七人以上時，未迴避之大法官應全體參與評議，經四分之三同意始得作成判決或裁定；第二項之規定不適用之。
> 前項未迴避之大法官人數低於七人時，不得審理案件。

**修正前第 30 條**（112-06-21 版，全條只有一項）：

> 判決，除本法別有規定外，應經大法官現有總額三分之二以上參與評議，大法官現有總額過半數同意。

**兩者比對的結論：114 年修法沒有動第 1 項一個字。** 它是**增訂**第 2 項到第 6 項。

判決自己這樣說（114 年憲判字第 1 號理由【43】原文）：

> 114年1月23日修正公布的憲訴法第30條第1項規定：「判決，除本法別有規定外，應經大法官現有總額三分之二以上參與評議，大法官現有總額過半數同意。」是將修正前即108年1月4日修正、111年1月4日施行的第30條規定，調整為第1項，**並未變動修正前的條文內容**，該規定自108年修正後迄今仍為有效的法律

**114 年憲判字第 1 號【憲法訴訟法修正案】**
判決日期 114 年 12 月 19 日（2025-12-19）。原分案號 114 年度憲立字第 1 號。
聲請人 立法委員柯建銘等 51 人。主文第一項原文節錄：

> 中華民國114年1月23日修正公布之憲法訴訟法第4條第3項規定……第30條第2項規定：「前項參與評議之大法官人數不得低於10人。作成違憲之宣告時，同意違憲宣告之大法官人數不得低於9人。」第3項規定……第4項規定……第5項規定……第6項規定……及第95條規定……立法程序有明顯重大瑕疵，違背憲法正當立法程序，且違反憲法權力分立原則，均牴觸憲法，**應自本判決公告之日起失其效力**。

**所以：10 人下限與 9 人違憲宣告下限，自 2025-12-19 起無效。**
現行有效的門檻只剩第 30 條第 1 項，而第 1 項給的是**比例，不是固定人數**。

**判決後憲法法庭恢復作成判決。** 民國 115 年已有六則判決，日期如下
（實跑自判決清單，逐則開啟確認）：

| 判決 | 日期 | id |
|---|---|---|
| 115 年憲判字第 1 號 | 115-01-02 | 350743 |
| 115 年憲判字第 2 號 | 115-02-06 | 343660 |
| 115 年憲判字第 3 號 | 115-03-27 | 358150 |
| 115 年憲判字第 4 號 | 115-05-08 | 351300 |
| 115 年憲判字第 5 號 | 115-06-05 | 343661 |
| 115 年憲判字第 6 號 | 115-08-14 | 352140 |

民國 114 年整年只有第 1 號一則判決。這與 10 人下限在該年大部分時間有效相符。

---

### 四、站上受影響位置與 materiality

行號已逐一實跑確認，**沒有漂移**：

```
src/data/future.ts:424                          requiredForRuling: 10,
src/app/future/page.tsx:79                      2/3（{CRISIS_STATS.requiredForRuling} 名）
src/app/future/page.tsx:194                     （即至少需 {CRISIS_STATS.requiredForRuling} 名大法官同意）。
src/components/future/BottleneckFunnel.tsx:135  需 {CRISIS_STATS.requiredForRuling} 人始得判決
```

`grep -rn requiredForRuling --include=*.ts --include=*.tsx .` 回傳這四筆，沒有第五筆。

**逐處判定讀者會被誤導成什麼。這決定本票的 materiality。**

| 位置 | 現在的字 | 讀者會得到的錯誤認知 | materiality |
|---|---|---|---|
| `page.tsx:79` | 「憲法法庭法修正將判決門檻提高至法定總額 2/3（10 名），目前僅存 5 名大法官的憲法法庭**實質上無法做出任何判決**」 | 三個錯：(a) 法律名稱錯，是**憲法訴訟法**，沒有「憲法法庭法」這部法；(b) 修法把「現有總額」改成「法定總額」——**條文從頭到尾都寫現有總額**，全文 0 次「法定總額」；(c) 這個門檻**現在還擋著法庭**——已失效九個月 | **最高。** 這是 `/future` 頁開篇導言，是全站最核心的一句話。三個錯擠在同一句 |
| `page.tsx:194` | 「將憲法法庭判決門檻由『現有總額』改為『法定總額』的 2/3（**即至少需 10 名大法官同意**）」 | 讀者會認定「任何判決都要 10 位大法官投贊成票」。這是全站**法律上最錯的一句**：把參與評議講成同意，把增訂講成修改，並把失效條文當現行法 | **最高。** 有法學背景的讀者看到這句，會據此判斷全站可信度 |
| `BottleneckFunnel.tsx:135` | 「需 10 人始得判決」 | 字面上最接近原意（10 確實是參與評議下限），但條文已失效。讀者會認定法庭「還差 5 人才達法定人數」 | **中高。** 散文權重低，但**掃讀權重高**——這是讀者會截圖的數字，貼在容量條旁邊當事實標籤 |
| `future.ts:424` | `requiredForRuling: 10` | 資料層。欄位名 `requiredForRuling`（判決所需人數）本身就把語意定錯了 | **結構性。** 只要欄位還是一個 `number`，三個渲染點就會繼續各自編故事 |

**`REFERENCE_DATE` 與 `LAST_UPDATED` 都是 `2026-04-29`**（`src/data/future.ts:75`、`:81`）。
那是 114 憲判 1 之後四個月。所以資料快照**自己就內部矛盾**：
在它宣稱的快照日，10 人下限已失效，且憲法法庭已作成 115 憲判 1 至 4 共四則判決。

---

### 五、需拍板的法學判斷

**以下四項 design 不下結論。** 需 captain 或法學背景者拍板。

> **2026-09-21 補述（implement，FO 授權）：本表新增 L5，故已不止四項。**
> 上句「以下四項」寫於 design 階段，當時尚無 L5。原句保留。
> L5 的拍板者是 **captain，或任何有可用瀏覽器的環境**；它不必是法學背景者。
> **L5 不阻擋本票進入 verify**，但 gate presentation 必須把它列為未達成的驗證項。

| 代號 | 待拍板問題 | 為什麼 design 不能自己決定 |
|---|---|---|
| **L1** | **（2026-09-21 改寫）法庭已連續七則判決都採「拒絕參與評議者不計入現有總額」，站上要不要照法庭的算法寫？**<br>原問法（保留原句）：「「現有總額」現在是 8（在職人數）還是 5（扣除持續拒絕參與評議者）？」 | 原理由（保留原句）：114 憲判 1 理由【50】標題為「本件判決拒絕參與評議的大法官，應不計入現有總額」。但該認定是**就本件所為**。它是否及於其他案件，是法律解釋問題<br>**2026-09-21 補述：** 115 憲判 6 理由【30】已實跑自一手來源確認：「本庭現任大法官8人，因其中3人持續拒絕參與評議……應由實際參與評議之大法官5人作成本判決，合先敘明（本庭114年憲判字第1號、115年憲判字第1號至第5號判決參照）。」該括號把 114憲判1 與 115憲判1 至 5 全部列為先例，加上 115憲判6 本身即**七則判決一致採此算法**。這**不代表 L1 已拍板**——法庭怎麼算是法庭的程序自主權，站上要不要照寫仍是編輯決定 |
| **L2** | 依 L1 的答案，門檻的具體人數是多少？「三分之二以上」遇到非整數時如何處理？ | 若現有總額 8：2/3 = 5.33。若現有總額 5：2/3 = 3.33。進位方式本身是法律讀法，不是算術 |
| **L3** | 114 憲判 1 該描述為「全部違憲」還是「部分違憲」？ | 主文把**每一個系爭規定**都判違憲（第 4 條第 3 項、第 30 條第 2 至 6 項、第 95 條）。但第 30 條第 1 項未被聲請、未受審查、仍有效。`056` 的 D3 寫「部分違憲」。用哪一種措辭需拍板 |
| **L4** | 站上還能不能說憲法法庭「實質上無法做出任何判決」？ | 民國 115 年已有六則判決（見第三小節表）。這句話與一手來源直接衝突。但它是編輯判斷，不純是法律判斷 |
| **L5** | 第九小節的響應約束：導言在 375px 寬下是否超過六行？ | 本執行環境沒有任何可用的無頭瀏覽器（`chrome-headless-shell` 147.0.7727.56 與 `Google Chrome for Testing` 皆 `SEGV_ACCERR`；`/Applications/Google Chrome.app` 被 macOS TCC 擋住），規格亦不准新增相依，因此只能算術推估：導言 194 半寬單位 ÷ 34 單位／行 ≈ 6 行，改動前 172 單位 ≈ 6 行。**推算不是量測**，design 與 implement 都無法自行拍板 |

#### 拍板前站上該怎麼呈現

**原則：不顯示任何可能錯的具體人數。改敘述條文給的比例。**

這不是規避。條文本身給的就是比例。顯示一個固定數字才是加工。

| 要做 | 不要做 |
|---|---|
| 把門檻寫成條文的文字：「現有總額三分之二以上參與評議，現有總額過半數同意」 | 不要印任何推算出來的人數（不要印 6、5、4、3） |
| 明寫 10 人下限的身分：它曾存在、它已失效、失效日 2025-12-19、依據 114 年憲判字第 1 號 | 不要在 null 時印替代數字或 `—`。整個數字要消失，句子要重寫 |
| 附上判決連結，讓讀者自己查 | 不要用「約」「大約」「可能需要」包裝一個猜出來的數字 |

**L4 的處理建議：與 L1–L3 一起修，不要拆開。**
`page.tsx:79` 的「實質上無法做出任何判決」與 `requiredForRuling` 在**同一句**。
只拔掉數字、留著那句話，句子會變成「某個沒說是什麼的原因讓法庭無法判決」——
仍與 115 憲判 1 至 6 衝突，而且更難查證。**建議一起改。**
若 captain 決定 L4 另開票，implement 必須在該句加註快照日與待查標記，不可原樣留下。

---

### 六、誤引「114憲判9」的來源與擴散

本票標題的「114憲判9」不存在。追溯如下：

| 檔案與行號 | 寫的是 | 對錯 |
|---|---|---|
| `docs/constitution-features/_archive/021-justice-term-forecast.md:340` | `114年憲判字第9號` | **錯。源頭** |
| `docs/constitution-features/056-pre-launch-checklist.md:65` | `該修法已於 2025-12 被判部分違憲（114憲判9）` | **錯。**日期對，號次沿用了 `021` 的錯 |
| `docs/constitution-features/056-pre-launch-checklist.md:119` | 本票標題 `requiredForRuling 的法律正確性（114憲判9）` | **錯。**傳進本票的 frontmatter `title` |
| `docs/constitution-features/_archive/026-t3-real-case-data.md:264` | `declared unconstitutional by 114年憲判字第1號` | **對。**兩張封存票彼此矛盾，沒人發現 |

**另有一組不同的誤引，不在本票範圍，但必須指出。**
`docs/design-assets/003-comic-lazybag-114.md:28` 把 **114 年憲判字第 1 號**說成
「立法院通過的『國會職權修法』」判決。

實跑一手來源否證這一點：

- `114 年憲判字第 1 號`【憲法訴訟法修正案】，114-12-19，`id=355485`
- `113 年憲判字第 9 號`【立法院職權行使法等案】，113-10-25，`id=352966`

國會職權修法是 **113 憲判 9**，不是 114 憲判 1。
`docs/health-check/TODO.md:186` 的 `h19｜權力分立｜2024・113憲判9` 是對的。
`docs/constitution-features/049-...md:39` 提到 `StanceSpectrum.tsx:19-35` 硬編
14 位大法官對「114年憲判字第1號」的立場——**那份立場表若實際描述的是國會職權修法，
則整個元件的引註對象是錯的。** 這屬 `049` 的範圍，本票不動，但 FO 應轉達。

---

### 七、Data requirements

**核心設計決定：把 `requiredForRuling: number` 換成一個結構，而不是換一個數字。**

理由有二。
第一，條文給的是比例，一個 `number` 裝不下。
第二，型別改變會讓 `npx tsc --noEmit` 在三個渲染點**全部失敗**，
逼 implement 逐處重寫文案。留著 `number` 只會讓人改掉數字、留著錯的句子。

在 `src/data/future.ts` 的 `CRISIS_STATS` **移除** `requiredForRuling`，
並新增一個獨立匯出常數：

```ts
/**
 * 憲法法庭判決門檻。
 *
 * 現行有效的規定是憲法訴訟法第 30 條第 1 項，給的是**比例**，不是固定人數：
 * 「判決，除本法別有規定外，應經大法官現有總額三分之二以上參與評議，
 *   大法官現有總額過半數同意。」
 *
 * 114 年 1 月 23 日修正曾增訂第 30 條第 2 項，訂下固定人數下限
 * （參與評議不得低於 10 人、同意違憲宣告不得低於 9 人）。
 * 該項已由 114 年憲判字第 1 號（114-12-19）宣告違憲，自公告日起失其效力。
 *
 * `headcount` 為 null，代表尚未經法學背景者拍板具體人數。
 * **渲染端在 headcount 為 null 時，必須完全不顯示人數，並改敘述 `rule`。**
 * 不得顯示替代字元或推算值。拍板事項見
 * docs/constitution-features/063-required-for-ruling-legal-accuracy.md 第五小節。
 */
export const RULING_THRESHOLD = {
  /** 條文文字轉成的一句話敘述。渲染端的長版文案來源 */
  rule: '大法官現有總額三分之二以上參與評議，並經現有總額過半數同意',
  /** 短版標籤用。掃讀場景，不超過 12 字 */
  ruleShort: '門檻依現有總額比例計算',
  /** 現行有效條文出處 */
  statute: '憲法訴訟法第 30 條第 1 項',
  /** 已失效的固定人數下限。保留是因為它是報導的主題，不是現行法 */
  voidedFloor: {
    participants: 10,
    unconstitutionalityVotes: 9,
    statute: '憲法訴訟法第 30 條第 2 項',
    voidedOn: '2025-12-19',
    voidedBy: '114 年憲判字第 1 號',
    rulingUrl: 'https://cons.judicial.gov.tw/docdata.aspx?fid=38&id=355485',
  },
  /** 具體人數。待 L1／L2 拍板前一律為 null */
  headcount: null as number | null,
} as const;
```

**`voidedFloor` 為什麼保留而不刪掉。**
10 人下限是這條新聞的主題。它曾經讓憲法法庭整年只作成一則判決。
刪掉它，站上就無法講這件事。保留它，但**標清楚它已失效**。

**不新增 JSON 資料檔。** 這兩個檔是 `sync-content` 的產物
（見 `CLAUDE.md` 絕對不要做的事第 2 條）。`future.ts` 是手維護常數檔，不受同步覆寫。
已確認 `src/data/future.ts` 不在 `sync-content` 的寫入目標內。

---

### 八、Component hierarchy

現有三個渲染點各自手寫文案。這是三處錯的結構原因。
設計上收斂成**一個元件**。

```
src/components/future/RulingThresholdNote.tsx        ← 新增
  props: { variant: 'lede' | 'card' | 'compact'; className?: string }
  責任：把 RULING_THRESHOLD 轉成該場景的文案。唯一的門檻文案來源
  資料取得：直接 import RULING_THRESHOLD
            （沿用專案既有模式——BottleneckFunnel.tsx:4 直接 import CRISIS_STATS）

消費者：
  src/app/future/page.tsx:79                 variant="lede"     開篇導言句
  src/app/future/page.tsx:194                variant="card"     「憲法訴訟法修正」卡片
  src/components/future/BottleneckFunnel.tsx:135  variant="compact"  容量條下方標籤
```

**三個 variant 的文案規格。**

`variant="lede"`（`page.tsx:79`，深色底，`text-gray-400`）——
一句話帶過，不展開。必須含：正確法律名稱、10 人下限已失效、失效依據與日期。
不得含具體人數。

`variant="card"`（`page.tsx:194`，白底卡片，`font-serif text-sm`）——
完整版。四件事依序講：修法增訂了什麼、為何造成停擺、何時被判違憲、現在的門檻是什麼比例。
**卡片標題必須從「憲法法庭法修正」改為「憲法訴訟法修正」。** 現在的標題是錯的法律名稱。
附 `voidedFloor.rulingUrl` 連結。

`variant="compact"`（`BottleneckFunnel.tsx:135`，`text-[10px] text-gray-500`）——
只印 `ruleShort`。加 `title` 屬性帶完整 `rule` 字串供桌機 hover。
`aria-label` 同 `title`，供螢幕閱讀器。

**元件必須在 `headcount === null` 時走 null 分支。**
`headcount` 有值時才可印人數。這個分支現在走不到，但它是拍板後的接線點。

---

### 九、Mobile / desktop 響應行為

| 位置 | 桌機 | 手機 | 約束 |
|---|---|---|---|
| `lede`（`page.tsx:79`） | 併入既有 `<p className="text-gray-400 max-w-2xl leading-relaxed">`，不另起段 | 同一段落自然換行 | 文案會比現在長。導言區已有 `max-w-2xl`，行長受控。不得讓導言超過六行（手機 375px 寬量測） |
| `card`（`page.tsx:194`） | 卡片在 `grid` 內，寬度不變 | 卡片堆疊，全寬 | 文案加長會讓這張卡片高於同列其他卡片。既有 grid 未強制等高，可接受。不得引入 `line-clamp` 截斷法律敘述 |
| `compact`（`BottleneckFunnel.tsx:135`） | 與左側「N 席空缺」同行，`flex justify-between` | 同 | **`ruleShort` 必須不超過 12 字**，否則在 375px 寬會與左側標籤擠壓換行，破壞容量條對齊。這是 `ruleShort` 存在的唯一理由 |

---

### 十、Acceptance criteria

每一項都附可失敗的 `Verified by:`。
**本節不預設答案。** L1 到 L4 的拍板結果不影響 AC1 到 AC6 成立。

**AC1　`CRISIS_STATS` 不再含 `requiredForRuling`，且沒有任何地方印出固定的判決人數。**
Verified by:
`grep -rn 'requiredForRuling' src/` 回傳 0 筆。
且 `grep -rnE '需 *[0-9]+ *(人|名).*(判決|同意)|[0-9]+ *名大法官同意' src/` 回傳 0 筆。
**會失敗的改動：** implement 只把 `10` 改成別的數字、或把欄位改名後照樣印人數。

**AC2　型別改變確實攔住了所有渲染點。**
Verified by:
在移除 `requiredForRuling` 之後、改寫渲染點之前，`npx tsc --noEmit` 必須報錯，
且報錯位置恰為 `page.tsx:79`、`page.tsx:194`、`BottleneckFunnel.tsx:135` 三處。
implement 必須把這次的錯誤輸出貼進 stage report。
**會失敗的改動：** 只出現兩處錯誤（代表第四個渲染點被漏掉或被悄悄改掉），
或零錯誤（代表 implement 為了避開型別錯誤而保留了 `number` 欄位）。
基線：本階段已實跑 `npx tsc --noEmit`，exit 0，改動前是乾淨的。

**AC3　站上三處都正確陳述法律，且陳述可逐字對到一手來源。**
Verified by: 起 `npx next dev -p 3199`，抓 `/future` 的實際 HTML，逐項檢查：
1. 出現「憲法訴訟法」；**不出現「憲法法庭法」**。
   該錯誤名稱現在有兩處：`page.tsx:78`（導言句）與 `page.tsx:190`（卡片標題）
2. **不出現「法定總額」**（條文全文 0 次，站上也不該有）
3. 出現「114 年憲判字第 1 號」；**不出現「114憲判9」或「114 年憲判字第 9 號」**
4. 出現失效日 `2025-12-19`（或「114 年 12 月 19 日」）
5. 不出現「10 名大法官同意」這類把參與評議講成同意的句子

**會失敗的改動：** 任一條不成立。第 3 條特別重要——若 implement 照搬本票標題的
`114憲判9`，AC3 直接失敗。
必須抓 dev server 的實際 HTML，不可只 grep 原始碼。
理由見 `docs/constitution-features/056-pre-launch-checklist.md:276`：
上一次只讀程式碼的查證被判為不可引用。

**AC4　`10` 只以「已失效」的身分出現，或完全不出現。**
Verified by: 在 `/future` 的 HTML 中找出所有 `10`。
每一個代表 10 人下限的 `10`，其同一句內必須同時出現「失效」或「違憲」，
以及「114 年憲判字第 1 號」。
**會失敗的改動：** 把 10 搬到別的句子而不帶失效標記；
或在容量條旁留一個沒有上下文的 `10`。

**AC5　拍板事項在程式碼與站上都留下可追的標記。**
Verified by:
1. `RULING_THRESHOLD.headcount === null`，且 JSDoc 指向本文件第五小節
2. `grep -n '063-required-for-ruling' src/data/future.ts` 回傳至少 1 筆
3. `docs/health-check/TODO.md` 新增一列待法學確認項，格式比照既有 `P0-2`
**會失敗的改動：** implement 自行填入一個推算的 `headcount`（例如 6 或 5 或 4）。
`headcount` 不是 null 而 `docs/health-check/TODO.md` 沒有對應的已拍板記錄，即為失敗。

**AC6　沒有動到禁區。**
Verified by:
1. `src/data/*.json` 的 sha256 在改動前後相同
2. `git log --oneline -- src/data/discussions.json src/data/owls.json` 沒有本票的新 commit
3. `src/app/layout.tsx` 的 `robots: { index: false, follow: false }` 仍在
**會失敗的改動：** 執行 `npm run sync-content`，或手改 `src/data/*.json`。
見 `CLAUDE.md` 絕對不要做的事第 1、2、4 條。

**AC7　本票標題的誤引已更正。**
Verified by: 本文件不再把「114憲判9」當成有效引註。
`grep -n '114憲判9' docs/constitution-features/063-required-for-ruling-legal-accuracy.md`
的每一筆命中，上下文都必須是「這是錯的」。
frontmatter 的 `title` 由 FO 或 captain 處理——**ensign 不得改 frontmatter**
（`ensign-shared-core` 規則）。本票在此正式提報：`title` 應改為
`requiredForRuling 的法律正確性（114憲判1）`。
**會失敗的改動：** 把誤引當成正確引註繼續往下傳。

---

### 十一、文件影響

**現在更新：無。**
理由：本階段只產規格，不施工。L1 到 L4 的拍板結果會決定文件該怎麼寫。
現在寫進 evergreen 文件，就會產生 `CLAUDE.md`「過時的 evergreen 文件是危險的」那種風險。
本節的更正內容全部留在本 entity 內，由 FO 在 gate 轉達 captain。

**實作後更新：**

| 文件 | 要改什麼 | 現況 |
|---|---|---|
| `docs/content-pipeline/data-collection-guide.md:89` | 該行寫「`requiredForRuling`（10）」。欄位移除後這行會指向不存在的欄位 | 已定方向，尚未實作 |
| `docs/health-check/TODO.md` | 新增一列待法學確認項，記 L1 到 L4。格式比照 `P0-2`（該檔第 214 行起） | 已定方向，尚未實作。驗證目標＝AC5 第 3 點 |
| `docs/INDEX.md` | 更新上列兩份文件的「最後查核」日期 | 已定方向，尚未實作 |

**不更新：**

| 文件 | 理由 |
|---|---|
| `docs/constitution-features/056-pre-launch-checklist.md` | 該票**正有其他 agent 在作業**（`056` 的 design／implement／verify 三個 ensign 在同一 session 活動中）。並行改寫會撞 git index。誤引內容見本節第六小節，由 FO 轉達 |
| `docs/constitution-features/_archive/021-...md`、`_archive/026-...md` | 封存文件。`CLAUDE.md` 文件規範：`record` 不改寫。`021:340` 的誤引是歷史事實，保留供追溯 |
| `docs/design-assets/003-comic-lazybag-114.md`、`docs/constitution-features/049-...md` | 114 憲判 1 與 113 憲判 9 的混用屬 `049` 範圍。本票不動，已於第六小節附一手證據供 `049` 使用 |
| `src/data/*.json` | 產物，不是原始資料。見 `CLAUDE.md` 絕對不要做的事第 2 條 |

---

### 十二、Out of scope（順手發現，本票不修）

逐項附證據，供 FO 判斷要不要開票。

1. **`BottleneckFunnel.tsx:107` 硬編 `BOTTLENECK: 5 JUSTICES`。**
   同一個元件在 `:127` 用 `CRISIS_STATS.activeJustices`，在 `:107` 卻寫死 `5`。
   `activeJustices` 一變，這兩個數字就會不一致。

2. **`REFERENCE_DATE` 與 `LAST_UPDATED` 皆為 `2026-04-29`**（`future.ts:75`、`:81`），
   已落後今日近五個月，且落後 114 憲判 1 四個月。

3. **`page.tsx:80`「實質上無法做出任何判決」與 `:196`「實質上凍結」與一手來源衝突。**
   民國 115 年已有六則判決，最近一則 115-08-14。屬本節 L4，建議與本票一起修。

4. **`docs/design-assets/003` 與 `049` 的 114 憲判 1／113 憲判 9 混用。** 見第六小節。

## Stage Report: design

- DONE: 界定要確認的具體命題：`future.ts` 的 `requiredForRuling: 10` 在 114 年憲判字第 9 號的脈絡下究竟指什麼，以及以什麼為權威來源（憲判原文與憲法訴訟法條文本身，**不得用任何轉述或二手整理**）。來源必須指名實際可取得的端點或檔案，並附實跑證明可取得。
  第一小節 Q1／Q2／Q3 三個可證偽命題；第二小節六個具名端點加三條已實跑的 `curl` 指令。**但命題的前提被否證：不存在 114 年憲判字第 9 號**，正確號次是 114 年憲判字第 1 號（`cons.judicial.gov.tw/docdata.aspx?fid=38&id=355485`，114-12-19）。誤引源頭與擴散見第六小節。
- DONE: 盤點站上受影響的位置並確認行號是否漂移：已知 `src/data/future.ts:424` 與三個渲染點 `src/app/future/page.tsx:79`、`:194`、`src/components/future/BottleneckFunnel.tsx:135`。逐處判定若該值有誤，讀者會被誤導成什麼——這決定本票的 materiality，不是形式盤點。
  四個行號全部實跑確認未漂移，`grep -rn requiredForRuling` 無第五筆。第四小節逐處寫出讀者會得到的錯誤認知：`:79` 三個錯疊在導言句，`:194` 把「參與評議」講成「同意」是全站法律上最錯的一句，`:135` 掃讀權重高。
- DONE: 每項 acceptance criteria 附可失敗的 `Verified by:`。design **不得預設答案**：結論可能是「需修正」也可能是「確認原本就對」，兩種都要有可失敗的驗證路徑。需法學判讀的部分明確標為需 captain 或法學背景者拍板，並寫明拍板前站上該怎麼呈現。
  第十小節 AC1–AC7，每項附具體會失敗的改動。AC2 要求型別移除後 `npx tsc --noEmit` 必須恰好在三處報錯——少一處代表漏盤，零錯代表 implement 保留了 `number` 欄位。第五小節列 L1–L4 四項待拍板，並給拍板前的呈現原則（不印任何推算人數，改敘述條文比例）。

### Summary

三個命題都有一手來源的答案：`requiredForRuling: 10` 錯兩層。10 是憲法訴訟法第 30 條第 2 項的「參與評議人數下限」，不是同意人數（同意違憲宣告的下限是 9）；而該項已由 114 年憲判字第 1 號於 2025-12-19 宣告違憲失效。比對 112-06-21 版與現行條文證明 114 年修法**沒有動第 1 項一個字**，判決理由【43】亦明言「並未變動修正前的條文內容」，所以站上「由現有總額改為法定總額」的敘述本身就不成立——「法定總額」在憲法訴訟法全文出現 0 次。

最關鍵的實跑發現是一個陷阱：**全國法規資料庫至今仍原樣顯示已失效的第 30 條第 2 至 6 項，不加任何失效標註**。只查該站會得到「10 是對的」這個錯誤結論。權威在憲判主文，不在法規資料庫的顯示。這與 feature `012` 付過的學費同型，已寫進第二小節的警告框給 implement 與 verify。

設計上不換數字，換結構：移除 `CRISIS_STATS.requiredForRuling`，改用 `RULING_THRESHOLD`（`headcount: null` 待拍板），並把三處手寫文案收斂成單一元件 `RulingThresholdNote`。型別改變會讓 `tsc` 在三個渲染點全部報錯，逼 implement 逐處重寫句子而不只是改數字。

三件需 FO 轉達 captain 的事。一、本票 frontmatter 的 `title` 含誤引「114憲判9」，ensign 不得改 frontmatter，建議改為「（114憲判1）」。二、L4：站上「實質上無法做出任何判決」與一手來源衝突——民國 115 年已有六則判決，最近一則 115-08-14；建議與本票一起修。三、`docs/design-assets/003` 與 `049` 把 114 憲判 1（憲法訴訟法修正案）誤當成國會職權修法判決（實為 113 憲判 9），屬 `049` 範圍，已附一手證據。

## Stage Report: implement

- DONE: `CRISIS_STATS.requiredForRuling` 移除，改為第七小節的 `RULING_THRESHOLD`（`headcount: null`），三處手寫文案收斂成 `RulingThresholdNote`；`grep -rn 'requiredForRuling' src/` 回 0 筆，且無任何地方印出推算出來的判決人數（AC1）。
  `grep -rn 'requiredForRuling' src/` = 0 筆；`grep -rnE '需 *[0-9]+ *(人|名).*(判決|同意)|[0-9]+ *名大法官同意' src/` = 0 筆。新元件 `src/components/future/RulingThresholdNote.tsx`（lede／card／compact 三個 variant，`headcount === null` 走不印人數分支）。
- DONE: 型別改變確實攔住所有渲染點：在移除欄位之後、改寫渲染點之前跑 `npx tsc --noEmit`，**必須恰好在 `page.tsx:79`、`page.tsx:194`、`BottleneckFunnel.tsx:135` 三處報錯**，並把該次錯誤輸出原樣貼進 stage report。兩處或零錯都是失敗（AC2）。
  恰好三處，原樣輸出見下方「AC2 實跑輸出」。改動前基線 `npx tsc --noEmit` exit 0；全部改完後亦 exit 0。
- DONE: 起 `npx next dev` 抓 `/future` 的**實際 HTML**（不可只 grep 原始碼）逐條驗 AC3／AC4。
  11 條檢查全 PASS，逐條輸出見下方「AC3／AC4 實跑輸出」。`/future` 的 HTML 中「10」共 3 個：2 個在門檻敘述句內（同句帶「違憲」與「114 年憲判字第 1 號」），1 個是折線圖 Y 軸刻度。
- DONE: AC5 拍板標記。
  `RULING_THRESHOLD.headcount` 為 `null`，JSDoc 指向本文件第五小節；`grep -n '063-required-for-ruling' src/data/future.ts` = 2 筆；`docs/health-check/TODO.md` 新增 P0-7（格式比照同檔 P0-2，含 L1–L4 與查證陷阱），並列入同檔「卡在人，越早問越好」第 5 項。站上顯示「換算成具體人數須經法學確認，本站不列。」
- DONE: AC6 未動禁區。
  `src/data/*.json` sha256 在改動前、`npm run build` 前、build 後三次皆相同（`4071978a…`／`4d1992e3…`）；`git log main..HEAD -- src/data/discussions.json src/data/history.json` = 0 筆；`src/app/layout.tsx:8` 的 `robots: { index: false, follow: false }` 仍在（build 後 `/future` HTML 仍帶 `noindex, nofollow`）。未執行 `sync-content`。
- DONE: 文件影響（第十一小節「實作後更新」三項）。
  `docs/content-pipeline/data-collection-guide.md` 欄位清單更新並追加 2026-09-21 更正框（原句全文引在框內）；`docs/health-check/TODO.md` 新增 P0-7；`docs/INDEX.md` 兩列「最後查核」改 2026-09-21。
- DONE: AC7 誤引已更正。
  `grep -n '114憲判9'` 在本文件的每一筆命中，上下文都是「這是錯的」、AC 條文本身、或本報告的驗證輸出；無一筆把它當成有效引註。frontmatter `title` 已由 FO 改為「（114憲判1）」。站上 HTML 不含「114憲判9」。
- DONE: L4 處置（FO 授權與本票一起修）。
  `page.tsx:79` 的「實質上無法做出任何判決」與 `:196` 的「實質上凍結」整句刪除，改陳述一手事實：民國 114 年全年只作成一則判決；失效後已作成 6 則，最近一則 115 年憲判字第 6 號（115 年 8 月 14 日）。六則判決的號次、日期、`docdata` id 寫進 `src/data/future.ts` 的 `RULINGS_SINCE_FLOOR_VOIDED`，附判決清單端點與取證日。未加入任何推算人數。
- DONE: 第九小節響應約束。
  `compact` 的 `ruleShort`＝「門檻依現有總額比例計算」11 字，未超過 12 字上限。導言未引入 `line-clamp`。
- SKIPPED: 第九小節「導言不得超過六行（手機 375px 寬量測）」——無法在本機實測，已重新指派。
  本機無可用的無頭瀏覽器：`chrome-headless-shell` 147.0.7727.56 與 `Google Chrome for Testing` 皆在啟動時 `SIGSEGV`（`Received signal 11 SEGV_ACCERR`），`/Applications/Google Chrome.app` 被 sandbox 擋住無法 dlopen。改以字元寬度推算：導言顯示寬度 194 半寬單位，375px 下可用寬度 279px（375 − 外層 `px-6` 48 − hero `p-6` 48），`text-base` 16px 即 34 半寬單位／行 → 約 6 行；改動前原句為 172 半寬單位 → 約 6 行。推算結論是行數未增加，但**這是算術，不是量測**，仍需在有瀏覽器的機器上看一眼（性質同 `docs/health-check/TODO.md` 的 P2-11）。

  **2026-09-21 由 FO 授權自 `FAILED` 改判為 `SKIPPED`。** 理由兩點：
  (a) 這是環境缺口，不是實作缺失——本執行環境沒有任何可用的無頭瀏覽器，
  上述失敗證據已記錄且可獨立重現（重跑那兩個 binary 即可再現 `SEGV_ACCERR`）；
  規格亦不准為此新增相依，故任何「需人眼或真實瀏覽器量測」的驗收項在此環境無法由 worker 完成。
  同一缺口在本 session 已撞到三次（feature `012` 的 D5、本票第九小節）。
  (b) 已重新指派給 captain，或任何有可用瀏覽器的環境；追蹤代號為第五小節新增的 **L5**。
  **改判的意思是換人做，不是做完了。** 本報告不宣稱六行限制已驗證或已量測；
  上方那段字元寬度推算是算術推估，不得被讀成量測結果。

### AC2 實跑輸出

移除 `CRISIS_STATS.requiredForRuling` 之後、改寫任何渲染點之前，`npx tsc --noEmit`（exit 2）：

```
src/app/future/page.tsx(79,31): error TS2339: Property 'requiredForRuling' does not exist on type '{ totalPending: number; curatedCount: number; activeJustices: number; designatedTotal: number; vacantSeats: number; absentJustices: number; avgDaysPerCase: number; estimatedClearanceYears: number; }'.
src/app/future/page.tsx(194,35): error TS2339: Property 'requiredForRuling' does not exist on type '{ totalPending: number; curatedCount: number; activeJustices: number; designatedTotal: number; vacantSeats: number; absentJustices: number; avgDaysPerCase: number; estimatedClearanceYears: number; }'.
src/components/future/BottleneckFunnel.tsx(135,71): error TS2339: Property 'requiredForRuling' does not exist on type '{ totalPending: number; curatedCount: number; activeJustices: number; designatedTotal: number; vacantSeats: number; absentJustices: number; avgDaysPerCase: number; estimatedClearanceYears: number; }'.
```

恰為設計預測的三處。

### AC3／AC4 實跑輸出

`npx next dev -p 3199` → `curl http://localhost:3199/future` → 去掉 `<script>`／`<style>` 後取可見文字：

```
PASS AC3-1a 出現「憲法訴訟法」          PASS AC3-3c 不出現「114 年憲判字第 9 號」
PASS AC3-1b 不出現「憲法法庭法」        PASS AC3-4  出現失效日 2025-12-19
PASS AC3-2  不出現「法定總額」          PASS AC3-5  不出現「N 名大法官同意」
PASS AC3-3a 出現「114 年憲判字第 1 號」 PASS AC3-5b 不出現「需 N 人」
PASS AC3-3b 不出現「114憲判9」          PASS AC3-5d 不出現「表決門檻 (10人)」

AC4：'10' 共 3 個，未標註 0 個
  OK [門檻敘述] 憲法訴訟法第 30 條第 2 項的 10 人參與評議下限，已由 114 年憲判字第 1 號 判決違憲，自 2025-12-19 起失其效力
  OK [Y 軸刻度] 10
  OK [門檻敘述] 憲法訴訟法第 30 條第 2 項（參與評議之大法官不得低於 10 人、作成違憲宣告之同意人數不得低於 9 人）已由 114 年憲判字第 1 號 判決違憲，自公告日 2025-12-19 起失其效力
```

**取得實際 HTML 的方法必須揭露。** `src/components/LaunchGate.tsx:30` 是
`if (!ready) return null;`，`ready` 只在 `useEffect` 裡設為 true，因此 `/future` 的頁面主體
在伺服器端渲染時是 `null`——直接 `curl` 只拿到 301 字的外框（此即
`docs/health-check/TODO.md:96` 已記載的「內容為 client-render」）。本機無頭瀏覽器
全部 SIGSEGV（見上方已改判為 `SKIPPED` 的那一項）。故改為：暫時把該行改成
`if (!ready && typeof window !== 'undefined') return null;`，讓 dev server 吐出真正的
頁面 HTML（126,689 bytes），抓完立即還原。**`LaunchGate.tsx` 已還原，
`git diff -- src/components/LaunchGate.tsx` 為空，與 `HEAD` 逐位元相同。**
驗證用的是實際渲染出來的 HTML，不是 grep 原始碼。

### 設計盤點的缺口（第四小節漏掉的第四個渲染點）

**`src/components/future/JusticeTermTimeline.tsx` 另有一條硬編的 10 人門檻，設計未盤到。**

- 證據：`const QUORUM = 10`（原 :82）在席次折線圖上畫一條紅色水平虛線，標籤
  `表決門檻 (10人)`（原 :200）。第一次抓 `/future` 實際 HTML 時 AC4 就在這裡失敗。
- 為什麼設計沒抓到：第四小節盤的是 `requiredForRuling` 這個**欄位**的使用處
  （`grep -rn requiredForRuling` 四筆）。這一處是寫死的字串與常數，不碰該欄位，
  所以 AC2 的三處型別錯誤也攔不到它。
- 處置：虛線與標籤移除，`QUORUM` 常數刪除，原處留六行註解說明失效依據並指向本票。
  理由是第五小節的原則——現行第 30 條第 1 項給的是「現有總額」的比例，不是固定席次，
  在席次折線圖上畫不出對應的水平線；而把已失效的 10 人線橫跨 2024–2032 整張圖，
  等於主張它今天仍適用。
- **替代方案供 captain 選**：也可以保留虛線，但只畫在它真正有效的區間
  （2025-01-23 生效至 2025-12-19 失效），標籤改為帶失效字樣。本 stage 選了移除，
  因為那是最小改動；改成區間版需要動圖表座標計算。

### 順手發現，本票未修（附證據，供 FO 判斷）

1. **`src/app/future/page.tsx:211`**「而在 5 名大法官無法達到判決門檻的情況下」——與 L4 同類，
   但真偽取決於 L1／L2（現有總額 8 則三分之二為 5.33，未達；為 5 則已達）。拍板前無法判定，故不改。
2. **`src/data/controversy-timeline.ts:151`／`:152`／`:164`／`:187`／`:212`** 多處敘述 10 人門檻。
   前四處是 2024–2025 事件的過去式敘述，本身不算錯；`:212` 是持續式敘述。渲染於
   `/controversy-timeline`，不在 AC3／AC4 的 `/future` 範圍。附一個正面證據：同檔 `:224`
   正確把 114 年憲判字第 1 號描述為憲法訴訟法修正案判決，與第六小節一致，與 `design-assets/003` 的誤引相反。
3. **`src/data/quizzes/pending.ts:95`** 與 **`src/data/quizzes/controversy.ts:83`** 以現在式
   把已失效的 10 人門檻當現行法，渲染於 `/quiz/*`，不在本票範圍。
4. **`src/data/history.json:637`** 敘述正確（帶「違憲」），且為 `sync-content` 產物，依
   `CLAUDE.md` 第 2 條不得手改。
5. **`src/components/future/BottleneckFunnel.tsx:23`** 的 eslint `react-hooks/set-state-in-effect`
   **改動前就存在**（`git show HEAD:` 該段與現況相同；本票只改該檔的 import 與 `:135`）。
   全專案 eslint 僅此一個 error。
6. 第十二小節原列四項維持未修。

### Summary

`CRISIS_STATS.requiredForRuling` 已移除，換成 `RULING_THRESHOLD` 結構（`headcount: null`），
三處手寫門檻文案收斂成單一元件 `RulingThresholdNote`。型別改變如設計預測，在
`page.tsx:79`、`:194`、`BottleneckFunnel.tsx:135` 恰好報三個錯，逼每一句重寫而非只改數字。
站上現在說的是條文給的比例，10 人下限只以「已由 114 年憲判字第 1 號判決違憲、自
2025-12-19 起失其效力」的身分出現，沒有任何推算人數。錯誤法律名稱「憲法法庭法」與
不存在的「法定總額」在 `/future` 已歸零。`npm run build` exit 0。

三件需 FO 帶進 gate 的事。一、設計第四小節漏了第四個渲染點：`JusticeTermTimeline.tsx`
硬編 `QUORUM = 10` 並畫成圖表門檻虛線，第一次驗 AC4 就在此失敗；已移除，但也可改成
「只畫在有效區間」的版本，請 captain 裁。二、AC3 要求的「實際 HTML」必須繞過 `LaunchGate`
才拿得到（該元件 SSR 時回 `null`），本機無頭瀏覽器全部 SIGSEGV；作法是暫時改一行、抓完還原，
`LaunchGate.tsx` 現與 `HEAD` 逐位元相同。三、第九小節「導言不得超過六行（375px）」只有
算術推估，沒有真正量測。該項已依 FO 授權自 `FAILED` 改判為 `SKIPPED`，並在第五小節立
**L5** 追蹤，拍板者是 captain 或任何有可用瀏覽器的環境。**L5 不阻擋進入 verify，
但 gate 必須把它列為未達成的驗證項。**

L1 到 L4 全部未拍板，`headcount` 保持 `null`，已在 `docs/health-check/TODO.md` 立 P0-7 追蹤。
L5 是環境缺口造成的量測缺口，不是法學問題，故不併入 P0-7，只留在本票第五小節。
L4 依 FO 授權與本票一起修：站上不再說「實質上無法做出任何判決」，改陳述一手事實
（114 年全年一則、失效後六則、最近一則 115 年 8 月 14 日）。最終措辭仍由 captain 定。

## Stage Report: verify

- DONE: 回一手來源逐項查核全部法律事實斷言，**不得以全國法規資料庫的顯示為權威**：114 年憲判字第 1 號的號次／案由／公告日 2025-12-19、主文宣告違憲的範圍與「第 30 條第 1 項未被聲請、未受審查、仍有效」、判決理由【43】與【50】的引文逐字、第 30 條第 1 項與第 2 項的條文原文、以及「失效後已作成 6 則判決、最近一則 115 年憲判字第 6 號（115-08-14）」的號次與日期逐筆核對。
  全部斷言成立，逐項證據見下方「一手來源核對」。四項獨立確認值得記錄：(1)【43】引文與司法院原文逐字相符（marker 在段末，故【43】即「系爭規定二既不能作為本案審查的程序規範…」該段，本票引號次正確）；(2) 法規資料庫的「法規整編資料截止日：民國 115 年 09 月 11 日」——該站資料只落後 10 天，卻仍原樣顯示已失效的第 30 條第 2 至 6 項，第 30 條區塊內 `失其效力|失效|憲判|停止適用` 命中 0 筆，陷阱警告完全成立；(3) 沿革最後一次修正為 114-01-23，之後無修正；(4) `法定總額` 全文 0 次、`現有總額` 13 次。
- DONE: 執行本 stage 的具名 placeholder 掃描（具名輸出，不得省略）；並獨立驗證兩件還原。
  `src/` 具名掃描：`某學者` 0、`某大學法律系` 0、`lorem ipsum`／`Lorem ipsum` 0、`快速了解最新判決的5個重點` 0、`test` 2（皆為 `latest`／`fastest` 之類的子字串，非佔位）、`placeholder` 2（皆為 `<input>` 的 `placeholder` 屬性）、`dummy`／`sample`／`FIXME`／`XXX` 0。
  兩件還原**不採信自我宣稱，改以三重獨立比對**：(a) `git diff main..HEAD -- src/data/discussions.json src/data/history.json src/components/LaunchGate.tsx` 為空；(b) 三檔 sha256 與 `git show main:<path>` 逐位元相同（`4071978a…`／`4d1992e3…`／`b1c80d70…`）；(c) `git log --oneline main..HEAD -- <三檔>` 回 0 筆，逐 commit 檔案清單（三個 commit）亦無此三檔——本分支**從未**commit 過那一行暫改。另 `npm run build` exit 0，build 前後兩個 JSON 的 sha256 不變，build 後 `git status --porcelain` 為空。
- FAILED: 獨立重跑 AC1–AC7 的驗證（含起 dev server 抓 `/future` 的實際 HTML，不可只 grep 原始碼），並逐項判定三件 gate 裁量事項。最後給出 PASSED 或 REJECTED 與理由。
  AC1–AC7 **七項全部獨立通過**（逐項證據見下方），但 `/future` 的實際 HTML 另有兩項一手來源可否證的法律敘述未修，其中 V1 違反本票第五小節自己寫下的 L4 處理指示。**裁決：REJECTED。** 理由見下方「裁決」。

### 一手來源核對（全部經 `curl` 實跑，Python 僅作文字處理）

| 斷言 | 一手來源 | 結果 |
|---|---|---|
| 號次／案由／公告日 | `docdata.aspx?fid=38&id=355485` | 114年憲判字第1號【憲法訴訟法修正案】、原分案號 114年度憲立字第1號、聲請人 立法委員柯建銘等51人、判決日期 114年12月19日。判決清單頁同筆列 `2025-12-19` ✅ |
| 主文違憲範圍 | 同上，主文第一項 | 第4條第3項、第30條**第2項至第6項**、第95條，「均牴觸憲法，應自本判決公告之日起失其效力」 ✅ |
| 第 30 條第 1 項未被聲請、仍有效 | 案由列舉＋理由【43】 | 案由只列第4條第3項、第30條第2至6項、第95條，未列第1項；【43】明言第1項「並未變動修正前的條文內容，該規定自108年修正後迄今仍為有效的法律」 ✅ |
| 理由【43】引文逐字 | 同上 | 與本票第三小節引文逐字相符 ✅ |
| 理由【50】標題 | 同上 | 「六、本件判決拒絕參與評議的大法官，應不計入現有總額」 ✅ |
| 第 30 條第 1、2 項條文原文 | `LawAll.aspx?pcode=A0030159` | 六項全文與本票第三小節逐字相符（第2項為「十人」「九人」中文數字，主文引作「10人」「9人」，係司法院行文體例差異，非出入） ✅ |
| 114 年只有第 1 號；115 年六則 | `judcurrentNew1.aspx?fid=38` | 114 年僅第1號；115 年僅第1至6號，無 114 年第 9 號 ✅ |
| 六則的號次與日期逐筆 | 逐一開 `docdata.aspx` | 115-1 `115年01月02日` id=350743／115-2 `02月06日` 343660／115-3 `03月27日` 358150／115-4 `05月08日` 351300／115-5 `06月05日` 343661／115-6 `08月14日` 352140，**六筆全中** ✅ |
| 113憲判9 vs 114憲判1 不同案 | id=352966 ／ id=355485 | 113年憲判字第9號【立法院職權行使法等案】113年10月25日；114年憲判字第1號【憲法訴訟法修正案】114年12月19日 ✅（`design-assets/003:28` 的誤引實跑否證） |

### AC1–AC7 獨立重跑

取得實際 HTML 的方法（**未動候選位元組**）：`git archive HEAD | tar -x -C <scratchpad>/repo`，`cp -Rc` 複製 `node_modules`（APFS clone，6.6 秒），**只在該副本**改 `LaunchGate.tsx` 那一行，於副本起 `next dev -p 3197`，`curl /future` 取得 123,621 bytes。全程候選檔 sha256 未變（`b1c80d70…` 前後相同）。

- **AC1 PASS**　`grep -rn 'requiredForRuling' src/` 0 筆；`grep -rnE '需 *[0-9]+ *(人|名).*(判決|同意)|[0-9]+ *名大法官同意' src/` 0 筆；實際 HTML 亦無 `requiredForRuling`。
- **AC2 PASS（獨立重製，非採信貼上的輸出）**　自 `main` 另開副本，只刪 `requiredForRuling: 10,` 一行，跑 `tsc --noEmit` → exit 2，**恰好三筆**：`page.tsx(79,31)`、`page.tsx(194,35)`、`BottleneckFunnel.tsx(135,71)`，TS2339 訊息與 implement 貼出的逐字相同。候選端 `tsc --noEmit` exit 0。
- **AC3 PASS（五條全中，但標題句要求另見 V1／V2）**　對實際 HTML 可見文字：出現「憲法訴訟法」✅；無「憲法法庭法」✅；無「法定總額」✅；出現「114 年憲判字第 1 號」✅；無「114憲判9」與「114 年憲判字第 9 號」✅；出現 `2025-12-19` ✅；無 `\d+ 名大法官同意`、無 `需 \d+ 人`、無 `表決門檻 (10人)` ✅。（`表決門檻` 在 HTML 命中 1 筆，實為待審案案名「市地重劃會員會議表決門檻之法律解釋爭議」，非圖表標籤，已逐字確認。）
- **AC4 PASS**　實際 HTML 的 `10` 共 14 處：2 處在門檻敘述句內，同句均帶「違憲」「失其效力」與「114 年憲判字第 1 號」；1 處為席次圖 SVG Y 軸刻度（`<text … font-size="11">10</text>`，同組有 0／5／15）；其餘 11 處為日期片段（`2024-10-31`、`2025/10/21` 等）。無任何無上下文的 10 人門檻數字。
- **AC5 PASS**　`headcount: null as number | null`（`future.ts:473`）且 JSDoc 指向本文件第五小節；`grep -n '063-required-for-ruling' src/data/future.ts` 2 筆；`docs/health-check/TODO.md:335` 新增 P0-7，並列入同檔第 915 行的卡人清單第 5 項。站上印「換算成具體人數須經法學確認，本站不列。」——未印任何推算人數、未用「約」包裝、未留破折號，第五小節「拍板前該怎麼呈現」三條原則**全部被正確執行**。
- **AC6 PASS**　見第二個 checklist 項的三重比對；`src/app/layout.tsx:8` 的 `robots: { index: false, follow: false }` 仍在，build 產出的 `.next/server/app/future.html` 帶 `noindex, nofollow`。未執行 `sync-content`。
- **AC7 PASS**　frontmatter `title` 已為「（114憲判1）」；本文件 `114憲判9` 13 筆命中，逐筆確認上下文皆為「這是錯的」、AC 條文本身或驗證輸出；實際 HTML 0 筆。誤引源頭 `_archive/021:340`、擴散 `056:65`／`:119` 逐行確認與第六小節一致。
- **L5 如實記錄，未假通過**　本環境同樣沒有可用的無頭瀏覽器：`chrome-headless-shell` 與 `Google Chrome for Testing`（皆 147.0.7727.56）**八種旗標組合全部 `SEGV_ACCERR` / exit 139**（`--headless=new` × `--no-sandbox`／`--single-process`／`--no-zygote --disable-dev-shm-usage`／`--use-gl=swiftshader`），連 `file://` 的三行 probe 都跑不起來；`--version` 可跑，代表壞在 renderer 而非啟動。**故 375px 六行限制在此環境仍無法量測，L5 維持未達成。** 另獨立複驗 implement 的字元寬度推算：改動前導言 172 半寬單位、改動後 191（implement 記 194，差 3 單位來自 `<strong>` 邊界的空白處理），與其數字同量級；其報告四處明寫「推算不是量測」「不得被讀成量測結果」，**未被寫成量測結果，屬實**。`ruleShort`＝「門檻依現有總額比例計算」11 字，未逾 12 字上限。

### 三件 gate 裁量事項的判定

**(a) `JusticeTermTimeline.tsx` 選「移除」而非「只畫在 2025-01-23 至 2025-12-19 有效區間」——恰當，支持移除。**
三個理由，最強的是第一個：該圖 Y 軸畫的是**在任席次**，而 10 是**參與評議人數**下限。兩者單位不同——頁面自己的標頭就寫「5 出席 / 8 在任 / 15 席」。在「在任」序列上畫一條 y=10 的線，等於主張「在任 10 人即達門檻」，而條文要求的是 10 人**實際參與評議**。所以那條線在它有效的期間內**本來就畫錯了**，失效只是讓它又多錯一層；改成「只畫有效區間」會把這個單位錯誤原封不動保留下來。其次，圖幅橫跨 2024–2032 共九年，有效區間只有 11 個月，區間版會是一小段幾乎看不見的線，但需要一個比它本身更長的標籤解釋。第三，114憲判1【50】與 115憲判6【30】把操作概念定在「現有總額」（扣除拒絕參與者），那是這張圖根本沒有畫的量。**原處留六行註解說明失效依據並指向本票，是正確做法**——刪掉一個視覺元素而不留下為什麼，下一個人會再畫一次。

**(b) 暫改 `LaunchGate.tsx` 一行以取得實際 HTML——明確表態：不該被允許，不應成為本專案的先例。**
先講清楚：implement 這次的**結果是乾淨的**（我三重比對過，分支從未 commit 該檔），而且它**主動揭露了手法**，這兩件都是對的行為。要否決的是「把這個手法記成核可作法」，不是追究這一次。
三個理由。一，它的安全性完全取決於 worker 在「改」與「還原」之間沒有被打斷。本 session 同時有三個以上 ensign 在活動，shared core 自己就警告過共用 git index 會被 `git add -A` 掃進去；一次 context 耗盡、一次崩潰、或一個手滑的 `git add -A`，就會把那行 commit 出去。二，**萬一 commit 出去，壞的是一條 non-negotiable。** `if (!ready && typeof window !== 'undefined') return null;` 會讓尚未發布的站台在**伺服器端就吐出完整內容**；`CLAUDE.md` 絕對不要做的事第 4 條保的是 noindex，而 noindex 擋的是遵守規則的爬蟲——不執行 JS 就抓 HTML 的預覽器、快取與轉貼卡片不看 `robots` meta。這條風險小但真實，而且方向正好與「網站尚未對外發布」相反。三，**有一個證據力完全相同、對候選位元組零風險的替代作法**，成本只有 7 秒：
```bash
git archive HEAD | tar -x -C "$SCRATCH/repo"      # implement 階段改用 git stash create 取未 commit 的工作樹
cp -Rc <repo-root>/node_modules "$SCRATCH/repo/node_modules"   # APFS clone，不佔空間；Turbopack 拒絕指向 project root 外的 symlink
sed -i '' 's|if (!ready) return null;|if (!ready \&\& typeof window !== '"'"'undefined'"'"') return null;|' "$SCRATCH/repo/src/components/LaunchGate.tsx"
cd "$SCRATCH/repo" && ./node_modules/.bin/next dev -p 3197 &   # 副本裡改，候選檔一個位元都不動
```
本 stage 的 AC3／AC4 就是這樣跑出來的，拿到 123,621 bytes 的真頁面 HTML。**建議：把上面四行定為本專案取得 client-render 頁面實際 HTML 的標準作法，並在 `docs/health-check/TODO.md:96`（已記載「內容為 client-render」那條）旁註明。** 需要注意的一點限制我也寫明：`git archive HEAD` 取的是已 commit 狀態，verify 階段正確，implement 階段改邊改邊驗時要用 `git stash create` 或 `rsync --exclude node_modules`。

**(c)「順手發現，本票未修」六項中，第 1 項確實 material 而被低估。第 3 項 material 但本票不能擁有。其餘四項分類正確。**
逐項複核：第 2 項（`controversy-timeline.ts`）前四處確為 2024–2025 事件的過去式敘述，`:224` 更正確寫明「僅5位大法官參與，3位拒絕參與」並點名三人——這一點已由 115憲判6【30】一手佐證，分類正確；但需附帶指出 `/controversy-timeline` 在 `launch-status.ts` 的 `PUBLIC_PAGES` 內，是**預定對外發布**的頁面，其 `:212` 的持續式敘述是 deferred risk，升級條件為該頁新增「現況」條目。第 4 項（`history.json:637`）為 `sync-content` 產物且敘述本身正確，分類正確。第 5 項（eslint）核對結果：`BottleneckFunnel.tsx` 的 `react-hooks/set-state-in-effect` 確為改動前就有（main 在 `:22`，候選在 `:23`，位移來自新增的 import），本票**未引入任何新的 lint error**；但「全專案 eslint 僅此一個 error」不正確——全專案有 **4 個同規則 error**（`LaunchGate.tsx:18`、`Navbar.tsx:25`、`BottleneckFunnel.tsx:23`、`TrackCards.tsx:31`），main 與候選逐筆相同。這是報告精確度問題，不影響本票。第 6 項正確。

### Findings（依 README `## Review-finding disposition`，只做唯讀調查，未動候選位元組，不自行處置）

**V1　`src/app/future/page.tsx:202`「而在 5 名大法官無法達到判決門檻的情況下，案件只進不出」——建議 Material／本票擁有／fix。**
- 發布使用者與正常流程：任何開啟 `/future` 的讀者。該句渲染於「案件持續積壓」卡，與本票改寫的「憲法訴訟法修正」卡**同一個 grid，相鄰兩格**。
- 可觀察損害：同一頁同時說「失效後已作成 6 則判決，最近一則 115 年憲判字第 6 號（115 年 8 月 14 日）」與「5 名大法官無法達到判決門檻」。兩句直接互相否證，而且**前一句是本票自己加上去的**。具法學背景的讀者（`CLAUDE.md` 明列的受眾）看到相鄰兩格互打，會據此判斷全站可信度——這正是第四小節給 `:194` 的同一條 materiality 理由。
- 受影響的 value AC 或不可協商邊界：AC3 標題句「站上三處都正確陳述法律」；更直接的是**第五小節自己寫下的 L4 處理指示**：「若 captain 決定 L4 另開票，implement 必須在該句加註快照日與待查標記，**不可原樣留下**」。L4 並未另開票（FO 授權與本票一起修），三處同類句子改了兩處（`:80`、`:196`），第三處**既沒改、也沒加快照日、也沒加待查標記**——兩條分支都沒走到。
- 觸發證據：115 年憲判字第 6 號理由【30】一手原文——「本庭現任大法官8人，因其中3人持續拒絕參與評議，為使憲法法庭正常、持續、有效運作……**應由實際參與評議之大法官5人作成本判決**，合先敘明（本庭114年憲判字第1號、115年憲判字第1號至第5號判決參照）」。
- 為什麼 implement 的分類（「真偽取決於 L1／L2，拍板前無法判定」）低估了它：L1 只影響**門檻該怎麼算**；「法庭做不出判決」是**經驗事實**，不依賴任何法學解釋——這五位大法官已經連續作成七則判決（114憲判1 加 115憲判1–6），而且法庭在【30】把這個作法寫成援引先例的常規。就算採 L1＝8 的讀法（8×2/3＝5.33，需 6 人參與，5 人不足），該句作為「法庭因此做不出判決」的敘述仍與七則判決的事實衝突。
- 建議處置：fix。與 `:80`、`:196` 同一手法處理——刪掉法律結論，改陳述一手事實（積壓件數與年處理量本來就夠支撐那一段的論點，不需要那句）。最終措辭仍屬 captain。

**V2　`RulingThresholdNote.tsx` card 版「該下限生效期間，憲法法庭在民國 114 年全年只作成一則判決」——建議 Material／本票擁有／fix。**
- 發布使用者與正常流程：同上，`/future` 卡片正文第一段。
- 可觀察損害：兩處與一手來源不符。(1)「生效期間」與「全年」互相矛盾——該下限的生命是 114-01-23 公布施行（第 95 條「自公布日起施行」）到 114-12-19 失效，不是全年。(2) 更實質的是，114 年那唯一一則判決就是 114憲判1 本身，而該判決**明文拒絕適用該下限**作為自己的程序規範（理由【41】「系爭規定二既嚴重妨礙本庭行使憲法職權……自不得作為本件判決的程序規範」；【43】「本庭自得本於程序自主權，決定本案審查的程序規範」，改依第 30 條第 1 項）。現在的句子讀起來像「那一則判決是在 10 人下限底下作成的」，恰好相反。
- 受影響的 value AC：AC3 標題句「陳述可逐字對到一手來源」——這句對不到任何一手來源。
- 觸發證據：實際 HTML 的 card 文字；114憲判1 理由【41】【43】原文；第 95 條「113年12月20日修正之條文，自公布日起施行」＋沿革「114-01-23 修正公布……並自公布日起施行」。
- 附註：design 第三小節原本是謹慎的——寫「這與 10 人下限**在該年大部分時間**有效相符」。implement 落成文案時把「大部分時間」丟掉，換成「生效期間……全年」，是相對 design 的精確度退步。
- 建議處置：fix。可改為「該下限自 114 年 1 月 23 日施行至 114 年 12 月 19 日失效；其施行期間憲法法庭未作成判決，唯一的一則 114 年判決即為宣告該下限違憲的本號判決，且該判決明文不適用該下限」。

**V3　`/future` 標頭「資料更新日期：2026-04-29」與本票新增的 2026-08-14 判決並存——建議 Material／本票擁有／FO 裁量（fix 或 hold）。**
四欄證據：任何 `/future` 讀者；頁面宣稱資料截至 2026-04-29，卻在卡片內引用 115 年憲判字第 6 號（2026-08-14）與取證日 2026-09-21 的六則判決清單，讀者無法判斷哪個日期算數；AC3 標題句；`future.ts:75`／`:81` 的 `REFERENCE_DATE`／`LAST_UPDATED` 皆 `2026-04-29`，實際 HTML 印出該字串一次。`REFERENCE_DATE` 過期是既有問題（第十二小節第 2 項已記），但**本票新增的內容把它從「日期舊了」升級成「同頁自相矛盾」**，所以責任歸屬改變了。最小修法是只更新 `LAST_UPDATED`（`REFERENCE_DATE` 動到席次圖的 TODAY 線與倒數，屬別票）。請 FO 裁。

**V4–V6（建議 Polish，逐項附位置，等授權）**
V4：`RulingThresholdNote.tsx` 的 `VOIDED_FLOOR_SHORT`／`_FULL` 用 `${voidedFloor.voidedBy} 判決違憲` 串接，`voidedBy` 已以「號」結尾，實際 HTML 印成「114 年憲判字第 1 號 判決違憲」，多一個空格，lede 與 card 各一次。同時「判決違憲」宜作「宣告違憲」——主文用語是「牴觸憲法」「違憲宣告」。
V5：card 首句「114 年 1 月 23 日修法增訂憲法訴訟法第 30 條第 2 項（……）已由 114 年憲判字第 1 號判決違憲」缺一個「的」或逗號，讀起來是破句。
V6：`RULING_THRESHOLD.rule` 為「大法官現有總額三分之二以上參與評議，並經現有總額過半數同意」，漏掉第 1 項句首的「除本法別有規定外」。card 把它當成條文內容呈現（「給的是比例而非固定人數：<rule>」），對法學讀者會顯得把但書吃掉了。JSDoc 內的完整引文是對的。

**V7　`/quiz/*` 與 `controversy-timeline` 以現在式把已失效的 10 人門檻當現行法——建議 Material（實質）／但本票不能擁有，歸 Needs decision，維持不動，建議開新票。**
四欄證據：`/quiz` 在 `launch-status.ts` 只在 team mode 開放、不在 `PUBLIC_PAGES`，`/controversy-timeline` 則**在** `PUBLIC_PAGES`；`src/data/quizzes/pending.ts:95`「這遠低於修法後的 10 人門檻，也是法庭運作困難的關鍵原因」與 `quizzes/controversy.ts:83`「根本達不到 10 人門檻」皆為現在式，讀者被教成失效條文仍是現行法——這正是本票存在的理由，只是換了路由；本票 AC3／AC4 的範圍明文限於 `/future`，無對應 value AC；兩檔逐行讀過，`correctIndex` 指向的答案本身（「5 位」「10 人」）作為歷史題是對的，錯的是 explanation 的時態。**本票不得擴張範圍（disposition 第 5 條），故維持不動**，但這是同一個法律錯誤的最大殘餘面，建議列為本票 gate 的附帶提報。

**V8　`docs/design-assets/003-comic-lazybag-114.md:28` 的誤引已由一手來源否證**（第六小節已記，本 stage 複驗成立）：該行把 114憲判1 說成「國會職權修法」判決，實為 113憲判9。屬 `049`／`design-assets` 範圍，本票不動。

**V9　給 P0-7 的一手來源補充（不是 finding，是 L1 的新證據，請 FO 併入 gate 資料）。**
第五小節 L1 寫「【50】的認定是就本件所為。它是否及於其他案件，是法律解釋問題」。**就憲法法庭自己的運作而言，這個問題現在有一手答案了。** 115 年憲判字第 6 號理由【30】把該認定當成常規並援引先例：「本庭現任大法官8人，因其中3人持續拒絕參與評議……應由實際參與評議之大法官5人作成本判決，合先敘明（本庭114年憲判字第1號、115年憲判字第1號至第5號判決參照）」。即：法庭已在七則判決中一致採「拒絕參與評議者不計入現有總額」。這不代表 L1／L2 已拍板（站上要用 8 還是 5、非整數如何進位，仍是編輯與法學判斷），但 L1 的問法應從「是否及於其他案件」改為「法庭已連續七則這樣做，站上要不要照法庭的算法寫」。

### 裁決

**REJECTED。**

先講清楚不是因為什麼：AC1 到 AC7 七項我獨立重跑全部通過，包含用真頁面 HTML（123,621 bytes）而非 grep 原始碼；具名 placeholder 掃描全部 0 筆；兩件還原我用三種互不相依的方法比對，結果都是與 main 逐位元相同，implement 的自我宣稱屬實；第五小節「拍板前該怎麼呈現」三條原則（不印推算人數、不用「約」包裝、整個數字消失而非留破折號）在站上全部被正確執行；L5 也如實記錄為未達成，字元寬度推算沒有被寫成量測結果。查證陷阱的警告完全成立，而且比 design 寫的更強——法規資料庫的資料截止日只落後 10 天，卻仍原樣顯示已失效的第 30 條第 2 至 6 項。

退回的理由是 V1，一句話：**本票修掉了「憲法法庭實質上無法做出任何判決」的兩處，第三處留在同一頁的相鄰卡片裡，而且它現在與本票自己新加的「失效後已作成 6 則判決」直接互相否證。** 第五小節自己寫下的 L4 指示是「不可原樣留下」，這一處既沒改也沒加標記，兩條分支都沒走到。implement 把它歸為「真偽取決於 L1／L2」，但「法庭做不出判決」是經驗事實而非法學解釋——那五位大法官已連續作成七則判決，115憲判6【30】把這件事寫在判決理由裡。一票以「法律正確性」為名的工作，不應該在它修完的頁面上留下一句一手來源可以直接否證的法律敘述。V2 同一批改（一句話，改動面比 V1 還小）。

建議路由：V1、V2 回 `implement` 修；V3 請 FO 裁量；V4–V6 若 FO 授權可併同一輪；V7 建議另開票；V9 併入 gate 給 captain 的資料與 P0-7。L5 維持未達成，本 stage 的環境同樣無法量測，gate 仍須把它列為未達成的驗證項。

## Stage Report: implement (cycle 2)

處理 verify cycle 1 的 REJECTED。FO 授權範圍為 V1–V6 與 V9，加一則 `TODO.md` 註記。
V7／V8 依授權不處置。AC 文字未動。`headcount` 維持 `null`。

- DONE: V1：`src/app/future/page.tsx:202`「而在 5 名大法官無法達到判決門檻的情況下」刪掉法律結論，改陳述一手事實，與 `:80`／`:196` 同一手法；改完後 `/future` 的實際 HTML 不得再有任何一手來源可直接否證的法律敘述（用副本作法取 HTML，不得暫改候選檔）。
  整個子句刪除。實跑 HTML 不再出現「無法達到判決門檻」與「只進不出」。**中途自我修正一次**：第一版改寫成「每年能結案的量遠低於新進案量」，但我沒有任何一手來源可證新進案量，等於用一個無來源的敘述換掉另一個；依 FO「積壓件數與年處理量本來就足以支撐那一段的論點，不需要那句」改為整句刪除。
- DONE: V2：`RulingThresholdNote.tsx` card 版首段改正兩處——「生效期間」與「全年」的矛盾（該下限的生命是 114-01-23 至 114-12-19），以及 114 年那唯一一則判決就是 114憲判1 本身而它明文拒絕適用該下限（理由【41】【43】），現行句子讀起來恰好相反。
  改為：存續期間 114-01-23 至 114-12-19；該期間內唯一一則判決就是 114 年憲判字第 1 號本身；並引理由【41】原文「既嚴重妨礙本庭行使憲法職權⋯⋯自不得作為本件判決的程序規範」，【43】改依第 30 條第 1 項定門檻。兩段引文已實跑一手來源逐字核對（見下方「一手來源複核」）。
- DONE: V3 只更新 `future.ts:81` 的 `LAST_UPDATED`，**不得動 `:75` 的 `REFERENCE_DATE`**。
  `LAST_UPDATED` 改 `2026-09-21`，實跑 HTML 顯示「資料更新日期：2026-09-21」。`REFERENCE_DATE` 仍為 `2026-04-29`（`grep -n "REFERENCE_DATE = "` 實跑確認）。JSDoc 補寫本次更新範圍僅及門檻內容、待審案件清單仍依 `REFERENCE_DATE` 推導。
- DONE: V4（多餘空格＋「判決違憲」改「宣告違憲」）。
  `voidedBy` 以「號」結尾，改為前有空格、後無空格：實跑 HTML 為「已由 114 年憲判字第 1 號宣告違憲」。**驗證時另外抓到同類的兩處**（cycle 1 未發現）：修掉尾空格後首空格也消失，變成「已由114 年」；以及 JSX 裡寫死的「{voidedBy} 本身」印成「號 本身」。兩處一併修，判準是專案既有慣例（中文接西文數字留空格，如「僅存 5 名」）。
- DONE: V5（破句補字）。
  `VOIDED_FLOOR_FULL` 在括號後補逗號，card 首句補「的」：現在讀作「114 年 1 月 23 日修法增訂的憲法訴訟法第 30 條第 2 項（⋯⋯），已由 114 年憲判字第 1 號宣告違憲⋯⋯」。
- DONE: V6（`RULING_THRESHOLD.rule` 補回「除本法別有規定外」）。
  `rule` 改用第 1 項條文原句：「判決，除本法別有規定外，應經大法官現有總額三分之二以上參與評議，大法官現有總額過半數同意」。實跑 HTML 含「除本法別有規定外」。該值同時餵 card 與 compact 的 `title`／`aria-label`。
- DONE: V9：在第五小節 L1 補上 115憲判6【30】的證據與改寫後的問法（保留原問法原句、標明 2026-09-21 補述）。
  L1 問法改為「法庭已連續七則判決都採『拒絕參與評議者不計入現有總額』，站上要不要照法庭的算法寫？」；原問法與原理由逐字保留並標明為原句；補述引 115憲判6【30】全文，並明寫**不代表 L1 已拍板**。
- DONE: 在 `docs/health-check/TODO.md:96` 旁加上取得 client-render 真 HTML 的安全副本作法與其限制。
  補一則註記：說明 `LaunchGate` 為何讓 `curl` 只拿到外框、`git archive HEAD` ＋ `cp -Rc node_modules` 的副本作法、`git archive` 只看已 commit 狀態的限制（implement 階段要改用 `git stash create` 或 `rsync`），以及不得再用「暫改候選檔」手法的理由。
- SKIPPED: V7（`/quiz/*`、`/controversy-timeline` 以現在式把已失效門檻當現行法）。
  依 FO 授權不處置：本票 AC3／AC4 範圍明文限於 `/future`，README disposition 第 5 條不得擴張範圍。證據留在 cycle 1 報告「順手發現」第 2、3 項。
- SKIPPED: V8（`design-assets/003:28` 的誤引）。
  依 FO 授權不處置，屬 `049`／`design-assets` 範圍。
- SKIPPED: 第九小節「導言不得超過六行（手機 375px 寬量測）」。
  維持 cycle 1 的改判與 L5。本輪導言寬度 193 半寬單位（cycle 1 為 194），推算仍約 6 行。**仍是算術，不是量測。**

### 一手來源複核（本輪印上站的法律敘述逐字核對）

V2 與 V9 都要把新的法律敘述印到站上或寫進 L1，故先以 `curl` 取一手判決原文核對，未採用轉述：

```
114憲判1  id=355485  2,056,745 bytes
  「系爭規定二」定義：第30條第2項至第6項（依序下稱系爭規定二至六）      ✓ 系爭規定二＝第 30 條第 2 項
  理由 41：「…系爭規定二既嚴重妨礙本庭行使憲法職權，依前所述，
            自不得作為本件判決的程序規範。」                          ✓ 逐字相符
  理由 43：「系爭規定二既不能作為本案審查的程序規範，則本庭自得本於
            程序自主權，決定本案審查的程序規範。」＋改引第 30 條第 1 項  ✓ 逐字相符
115憲判6  id=352140  2,493,009 bytes
  理由 30：「本庭現任大法官8人，因其中3人持續拒絕參與評議…應由實際參與
            評議之大法官5人作成本判決，合先敘明（本庭114年憲判字第1號、
            115年憲判字第1號至第5號判決參照）。」                      ✓ 逐字相符；七則判決成立
```

**注意該站的段號呈現方式**：`【N】` 標記出現在段號 `N+1` 的文字**之前**。
FO 與 design 引用的【41】【43】【30】指的是**段號**，不是 `【】` 標記。已據此核對，編號無誤。

### 本輪取實際 HTML 的方法（已改用安全副本作法）

不再暫改候選檔。改用 FO 指定的作法：

```bash
git archive HEAD | tar -x -C "$SCRATCH/repo"
cp -Rc "<main repo root>/node_modules" "$SCRATCH/repo/node_modules"
# 只在副本裡改 LaunchGate.tsx 那一行
cd "$SCRATCH/repo" && ./node_modules/.bin/next dev -p 3207
```

`node_modules` 不在 worktree 內，而在主 repo 根目錄（worktree 靠往上層解析）。
`diff -rq` 實跑確認副本與候選的 `src/` **只差 LaunchGate.tsx 一個檔**；
`git status --porcelain` 全程為空，`git diff HEAD -- src/components/LaunchGate.tsx` 為空。
取得 `/future` 實際 HTML 124,222 bytes。

### 實跑驗證輸出（副本作法取得的真 HTML）

```
AC3: PASS（9 條全過）
AC4: PASS（'10' 3 個：2 個在門檻敘述句內同時帶「違憲」與「114 年憲判字第 1 號」，1 個是 Y 軸刻度）
V1–V6: PASS（8 條全過）
V3: 資料更新日期：2026-09-21
導言寬度 193 半寬單位 → 推算約 6 行（L5 仍未量測）
```

回歸護欄：`npx tsc --noEmit` exit 0；`grep -rn 'requiredForRuling' src/` 0 筆；
推算人數 grep 0 筆；`src/data/*.json` sha256 未變動（`4071978a…`／`4d1992e3…`）；
`REFERENCE_DATE` 未動；未執行 `sync-content`；未改 `package.json`。

### Summary

V1–V6 與 V9 全部完成，逐項以副本作法取得的真 HTML 驗證，AC3／AC4 仍全過。
V1 的法律結論整句刪除而非改寫——第一版我改成「每年能結案的量遠低於新進案量」，
但那同樣沒有一手來源，等於用一個無來源敘述換掉另一個，故自我否決並改為刪除。
V2 是本輪最實質的修正：原句讀起來像「114 年唯一那則判決是在 10 人下限底下作成的」，
而一手來源恰好相反——114憲判1 明文拒絕以該項作為自己的程序規範，改依第 30 條第 1 項。
現在站上直接引理由【41】原文。

**驗證時另外抓到 V4 的兩處同類缺陷**（cycle 1 與 reviewer 都未點到）：修掉尾空格後
首空格一併消失（「已由114 年」），以及 JSX 寫死的「號 本身」。兩處一併修，判準是專案既有
的中西文空格慣例。這也說明只看字串來源不夠，仍須看渲染結果。

方法上的改變照 FO 要求落實：不再暫改候選檔，改用 `git archive HEAD` ＋ APFS clone 的副本，
候選檔全程零變動（`git status` 全程為空，`diff -rq` 確認副本只差 LaunchGate 一檔），
並把該作法與其限制寫進 `docs/health-check/TODO.md:96` 旁，讓下一個人不必重新發現。

V7 是同一個法律錯誤的最大殘餘面（`/quiz/*` 與 `/controversy-timeline` 仍以現在式把
已失效的 10 人門檻當現行法），依授權維持不動，建議另開票。
L1／L2／L3／L5 仍未拍板，`headcount` 維持 `null`。

## Stage Report: verify (cycle 2)

- DONE: 獨立重驗 V1 與 V2 兩處是否真的修好：`/future` 的實際 HTML 中，不得再有任何一手來源可直接否證的法律敘述；特別確認 `page.tsx:202` 的子句已整句刪除而非換成另一個無來源敘述，以及 card 首段的存續期間與「114 年唯一一則判決即 114憲判1 本身、且它以【41】【43】拒絕適用該下限」是否逐字對得到一手來源。
  兩處都真的修好，且**沒有副作用**——最有力的證據是渲染後可見文字的跨輪差異：`diff` cycle 1 與 cycle 2 的 `/future` 純文字，**整頁只有四處變動**（`資料更新日期`、lede 的「宣告違憲」、card 首兩段、積壓卡末句刪除），沒有任何一行是意料外的改動。V1 確為整句刪除：`無法達到判決門檻`／`只進不出`／`加劇人民權利的損害`／`新進案量`／`能結案的量` 在實際 HTML 全部 0 筆，該段只剩「每年處理量約 30~40 件。以目前 473 件待審案件計算，即使全員到位也需要數年時間消化。」——**沒有替代敘述**。V2 的每一個子句都對得到一手來源，逐字核對見下方。
- DONE: 確認 V3–V6 與 V9 依授權落地且**未越界**；並確認 V7／V8 一個位元都沒動、AC 文字一個字都沒改、`headcount` 仍為 `null`。
  V3：`LAST_UPDATED` `'2026-09-21'`（`future.ts:87`），`REFERENCE_DATE` 仍 `'2026-04-29'`（`:75`），實際 HTML 印「資料更新日期：2026-09-21」且全頁不再出現 `2026-04-29`。**但這帶出一個新的 finding V10，見下方。**
  V4：實際 HTML 印「已由 114 年憲判字第 1 號宣告違憲」與「114 年憲判字第 1 號本身」；`已由114`／`號 本身`／`第 1 號 宣告` 皆 0 筆。（`判決違憲` 字串在頁面命中 1 筆，實為待審案案名「槍砲管制違規案之上訴審判決違憲爭議」，非本元件文字，已逐字確認。）V5：印「修法增訂的……人），已由」，破句已補。V6：`rule` 已為第 1 項條文原句，實際 HTML 含「除本法別有規定外」。
  V9：以程式逐字比對 `f85556b` 與 HEAD 的 L1 列——原問法與原理由**兩段都逐字保留**且標明為原句，補述明寫「不代表 L1 已拍板」；所引 115憲判6【30】兩個片段皆見於一手原文。
  未越界：`git diff f85556b..HEAD -- src/data/quizzes/ src/data/controversy-timeline.ts docs/design-assets/ docs/constitution-features/049-*.md` 為空（V7／V8 零變動）；第十小節 AC 全節與第十二小節以字串相等比對**逐字未變**；`headcount: null as number | null`（`:479`）。
- DONE: 重跑 AC1–AC7 確認 cycle 2 的改動沒有讓任何一項回歸，並重跑具名 placeholder 掃描與 `src/data/*.json`／`LaunchGate.tsx` 的還原比對。最後給出 PASSED 或 REJECTED 與理由。
  **AC1–AC7 七項全部無回歸**（逐項見下）。具名掃描 `某學者`／`某大學法律系`／`lorem ipsum`／`Lorem ipsum`／`快速了解最新判決的5個重點`／`FIXME`／`XXX`／`PLACEHOLDER`／`dummy`／`sample` 全部 0 筆。還原比對：三檔 `git diff main..HEAD` 為空、sha256 與 main 相同（`4071978a…`／`4d1992e3…`／`b1c80d70…`）。**裁決：PASSED**，理由見下方。

### 一手來源逐字核對（本輪新上站的法律敘述）

重新 `curl` 取原文，未沿用 cycle 1 的快取。**段號判準（本輪確立，與 implement 報告的描述相反，以實跑為準）：段落 N 由開頭的裸數字 `N` 起、以結尾的 `【N】` 收；開頭數字與結尾標記同號。** 以此切段：

| 站上寫的 | 一手來源 | 結果 |
|---|---|---|
| 存續期間為 114-01-23 至 114-12-19 | 沿革「114年1月23日……令修正公布第 4、30、95 條條文；**並自公布日起施行**」；主文「自本判決公告之日起失其效力」＋判決日期 114年12月19日 | ✅ 起訖兩端都有據 |
| 該期間內只作成一則判決，就是 114憲判1 本身 | 判決清單：114 年僅第 1 號一則，日期 2025-12-19 | ✅ |
| 該判決並未適用這一項作為自己的程序規範 | 段落 41 全文（裸數字 `41` 起、`【41】` 收） | ✅ |
| 引文「既嚴重妨礙本庭行使憲法職權⋯⋯自不得作為本件判決的程序規範」 | 段落 41：「系爭規定二**既嚴重妨礙本庭行使憲法職權**，依前所述，**自不得作為本件判決的程序規範**」 | ✅ 逐字；刪節號取代「，依前所述，」 |
| 「這一項」＝第 30 條第 2 項（即引文中的「系爭規定二」） | 段落 3：「第4條第3項（下稱系爭規定一）、**第30條第2項至第6項（依序下稱系爭規定二至六）**」 | ✅ 依序⇒系爭規定二＝第 2 項，指涉正確 |
| 【43】改依第 30 條第 1 項定評議及評決門檻 | 段落 43：「系爭規定二既不能作為本案審查的程序規範，則本庭自得本於程序自主權，決定本案審查的程序規範。就此而言，……第30條第1項規定……」 | ✅ |
| 失效後 6 則、最近一則 115憲判6（115-08-14） | 判決清單＋逐則 `docdata`（cycle 1 已六筆全中，本輪未變） | ✅ |
| L1 補述引 115憲判6【30】 | 段落 30（`30` 起、`【30】` 收）：「本庭現任大法官8人，因其中3人持續拒絕參與評議……應由實際參與評議之大法官5人作成本判決，合先敘明（本庭114年憲判字第1號、115年憲判字第1號至第5號判決參照）。」 | ✅ 逐字 |

取實際 HTML 的方法：`git archive HEAD | tar -x` ＋ `cp -Rc node_modules` 的副本，只在副本改 `LaunchGate.tsx`。**`diff -rq` 實跑確認副本的 `src/` 與候選在 patch 前完全相同、patch 後只差 `LaunchGate.tsx` 一檔**；候選檔 sha256 全程 `b1c80d70…` 未變。取得 124,007 bytes。

### AC1–AC7 無回歸

- **AC1 PASS**　`grep -rn 'requiredForRuling' src/` 0 筆；推算人數 grep 0 筆；實際 HTML 無 `requiredForRuling`。
- **AC2 PASS**　`npx tsc --noEmit` exit 0；`requiredForRuling` 仍不存在於 `CRISIS_STATS`（cycle 2 未觸及該結構）。cycle 1 已自 main 獨立重製過「恰好三處報錯」，本輪無需重跑。
- **AC3 PASS**　實際 HTML 九條全過：有「憲法訴訟法」、無「憲法法庭法」、無「法定總額」、有「114 年憲判字第 1 號」、無「114憲判9」與「114 年憲判字第 9 號」、有 `2025-12-19`、無 `\d+ 名大法官同意`、無 `需 \d+ 人`、無「表決門檻 (10人)」。
- **AC4 PASS**　`10` 共 14 處：2 處在門檻敘述句內（**兩句都同時帶「違憲／失其效力」與「114 年憲判字第 1 號」**）、1 處為席次圖 Y 軸刻度、11 處為日期片段。
- **AC5 PASS**　`headcount: null`；`grep -n '063-required-for-ruling' src/data/future.ts` 3 筆；`TODO.md` 的 P0-7 仍在（2 筆）。站上仍印「換算成具體人數須經法學確認，本站不列。」——未印任何推算人數、未用「約」包裝、未留破折號。
- **AC6 PASS**　三檔與 main 逐位元相同；`npm run build` exit 0 且 build 前後 `src/data/*.json` sha256 不變；build 後 `git status --porcelain` 為空；`layout.tsx:8` 的 `robots: { index: false, follow: false }` 仍在，產出的 `future.html` 帶 `noindex, nofollow`。未執行 `sync-content`。
- **AC7 PASS**　本文件 `114憲判9` 15 筆（cycle 1 為 13，新增 2 筆來自本輪流程記錄），逐行讀過，**無一筆把它當成有效引註**；實際 HTML 0 筆。
- **回歸護欄**　eslint error 仍為 main 既有的同四筆同規則（`LaunchGate:18`／`Navbar:25`／`BottleneckFunnel:23`／`TrackCards:31`），cycle 2 未新增。
- **L5 維持未達成**　依 FO 指示未再嘗試瀏覽器。本輪實測導言的渲染字串寬度為 **190 半寬單位**（cycle 1 為 191——刪掉一個多餘空格後少一單位），÷34 ≈ 5.6 行；**這是算術，不是量測**——它算的是字元寬度總和，不是瀏覽器的實際斷行。gate 仍須把它列為未達成的驗證項。

### Findings

**V10　`LAST_UPDATED` 與 `REFERENCE_DATE` 被拆開，頁面標頭現在高估了待審案件資料的新鮮度——建議 Material（實質）／但本票不能擁有，記為 Needs decision，不因此退回。**
- 發布使用者與正常流程：任何開啟 `/future` 的讀者。
- 可觀察損害：標頭印「資料更新日期：2026-09-21」，但同頁的每一個案件年齡（`daysPending`，`future.ts:260` 由 `filingDate` 對 `REFERENCE_DATE` 推導）、席次圖的 TODAY 垂直線（`JusticeTermTimeline.tsx:186`／`:188`／`:196`）與「1980 天後歸零」倒數（`future.ts:411-413`）全部仍以 `2026-04-29` 計算，落後 145 天。讀者看到「266天 (0.7 年)」會以為那是 2026-09-21 當天的案齡。
- 受影響的 value AC 或不可協商邊界：**無** AC1–AC7 涵蓋這兩個常數（V3 是 FO 裁量的 finding，不是 AC）。但有一條**檔案自己寫下的慣例**被打破：`src/data/future.ts:30` 的 Refresh procedure 第 1 步明寫「Update `REFERENCE_DATE` **and** `LAST_UPDATED` below to the new snapshot date.」——兩者被定義為同一個 snapshot date，本輪把它們拆開，而該行程序註解未同步更新。
- 觸發證據：實際 HTML 的標頭 `2026-09-21` 與案件清單的 `NNN天`；`grep -rn 'REFERENCE_DATE' src/` 的六個使用點。
- 平心而論這不是「改壞了」，是**橫向移動加方向改變**：cycle 1 是標頭 `2026-04-29` 低報、被本票新增的 2026-08-14 判決內容當場戳破（讀者看得見矛盾，會不信任標頭）；cycle 2 是標頭 `2026-09-21` 高報、案件清單默默過期（讀者**沒有任何線索**）。兩種狀態都只有一組內容對得上標頭，差別在低報或高報、以及矛盾是否可見。低報是保守的，高報不是。
- 為什麼我不因此退回：FO 在 cycle 1 已就 V3 明確授權「只更新 `LAST_UPDATED`，不動 `REFERENCE_DATE`」，implement 精確照做並在 JSDoc 揭露殘留；README disposition 第 6 條禁止 re-triage 已處置的 finding，第 5 條把 scope 決定留給 captain。**我擁有觀察，不擁有處置權**，所以記錄、分類、給建議，由 FO／captain 定。
- 建議（三個，成本由低到高，都比更新 `REFERENCE_DATE` 那張票小）：(1) 把標頭字樣從「資料更新日期」改為「門檻資料更新日期」或加一行「待審案件統計截至 2026-04-29」——一處文案，不動任何常數；(2) 把 `LAST_UPDATED` 退回 `2026-04-29`，接受 cycle 1 的低報狀態直到案件清單重收；(3) 維持現狀，但把 `future.ts:30` 的 Refresh procedure 改寫成「兩個日期各自代表什麼、什麼時候可以分開動」，讓下一個人不會以為它們仍然同步。我傾向 (1)。

**既有項目複核（皆無變化，不重複舉證）**：V7（`/quiz/*` 與 `/controversy-timeline` 以現在式把已失效門檻當現行法）依授權零變動，materiality **未改變**，仍是同一個法律錯誤的最大殘餘面，建議另開票；V8（`design-assets/003:28`）零變動，屬 `049`。
**一項順帶記錄，非本輪 finding**：`page.tsx:201` 的「每年處理量約 30~40 件」是 JSX 硬編、無來源註解，且在 V1 刪句之後成為該段唯一的無來源量化敘述。它**早於本票存在**、非法律敘述、cycle 1 亦未提，故不列為 finding，僅供 FO 判斷是否併入 V7 的新票。

### 裁決

**PASSED。**

cycle 1 退回的兩項都真的修好了，而且修的方式是對的。V1 走的是刪除而非改寫——implement 自己記下它第一版寫成「每年能結案的量遠低於新進案量」、發現沒有一手來源可證新進案量之後自我否決，這件事我查證過不是事後粉飾：實際 HTML 裡 `新進案量`、`能結案的量` 都是 0 筆，那一段只剩兩句既有敘述，沒有任何替代說法補進去。V2 則從「一句對不到來源的敘述」變成本頁最紮實的一段——它現在直接引段落 41 的原文，而我把引文、段號判準、「系爭規定二＝第 30 條第 2 項」的指涉、以及起訖日期四件事各自對回一手來源，全部成立。

最有說服力的單一證據是跨輪的渲染文字 `diff`：整頁可見文字只有四處變動，全部是授權範圍內的。這同時證明了沒有越界——V7／V8 零變動、AC 全節逐字未變、`headcount` 仍是 `null`、`REFERENCE_DATE` 未動。七項 AC 無回歸，具名 placeholder 掃描全 0，禁區三檔與 main 逐位元相同。

留一句給 gate：V10 是我這輪唯一的新 finding，它不改變裁決（FO 已就 V3 做過處置，我不 re-triage），但**它是發布前值得 captain 看一眼的東西**——標頭現在說資料更新到 2026-09-21，而案件年齡、TODAY 線與倒數都還停在 2026-04-29，而且 `future.ts:30` 的程序註解仍寫著這兩個日期應該一起動。最便宜的處理是改一處標頭文案。另外 L5（375px 六行）仍未量測，本環境無法量測，gate 必須照實列為未達成。

## Stage Report: implement (cycle 3)

處理 verify cycle 2 的新 finding V10。授權範圍只有兩件事，兩件都不動任何常數。

- DONE: `/future` 標頭不得再讓讀者高估待審案件資料的新鮮度；貼出改完後實際 HTML 的標頭字樣。**不得動 `REFERENCE_DATE` 與 `LAST_UPDATED` 兩個常數本身。**
  採第二種作法（維持原字樣＋加一行）。實際 HTML 標頭現為兩行，見下方「標頭實際字樣」。兩個常數零變動（`git diff 2ebfdae..HEAD -- src/data/future.ts` 不含任何 `REFERENCE_DATE = ` 或 `LAST_UPDATED = ` 的增刪行）。
- DONE: `src/data/future.ts:30` 的 Refresh procedure 第 1 步改寫，並貼出改動前後對照。
  對照見下方「Refresh procedure 前後對照」。
- DONE: 確認本輪未越界。
  `git diff --name-only 2ebfdae..HEAD` 只有本票、`src/app/future/page.tsx`、`src/data/future.ts`（另有兩筆是 verify 與 FO 自己的 commit，非本輪產出）。AC 全節自 `7f1f44e` 以來**逐字相同**（2425 bytes，程式比對）。`headcount` 仍為 `null`。`src/data/discussions.json`、`history.json`、`LaunchGate.tsx`、`quizzes/pending.ts`、`quizzes/controversy.ts`、`controversy-timeline.ts`、`docs/design-assets/` 與 `main` **逐位元相同**。`page.tsx:201` 的「30~40 件」依授權未動。

### V10 的成因

**V10 是 FO 在 cycle 1 的 V3 處置造成的，不是 implement 的執行偏差。**
cycle 1 FO 裁定「只更新 `LAST_UPDATED`，不動 `REFERENCE_DATE`」，implement 精確照做，
並在 `LAST_UPDATED` 的 JSDoc 主動揭露殘留。但拆開兩個日期的後果是標頭從**低報**翻成**高報**：
cycle 1 的低報被本票新增內容當場戳破，讀者看得見矛盾；cycle 2 的高報讓案件清單默默過期，
讀者沒有任何線索。本票製造出這個 delta，故由本票修。

### 為什麼選第二種作法

FO 給兩個選項，判準是「讀者看完標頭後不會高估案件清單的新鮮度」。

選**維持「資料更新日期」原字樣＋加一行「待審案件統計截至 2026-04-29」**。理由：
只把標籤改成「門檻資料更新日期」雖然把宣稱範圍縮小了，但讀者仍然**不知道案件清單是什麼時候的**——
它靠省略來避免高估。頁面正下方就印著「473 件待審案件」，讀者看到一個九月的日期，
仍可能把 473 當成九月的數字。第二種作法把兩個日期並排攤開，讀者不必推論。

實作上「2026-04-29」直接讀 `REFERENCE_DATE` 常數，不寫死字串——
日後有人更新案件快照時，這一行會自動跟上，不會再漂移成第二個 V10。

### 標頭實際字樣（副本作法取得的真 HTML，124,296 bytes）

```
Constitutional Emergency
資料更新日期：2026-09-21
待審案件統計截至 2026-04-29
15 名大法官，僅存 5 名運作（三名不參與評議會）
```

### Refresh procedure 前後對照（`src/data/future.ts`）

改動前（一行）：

```
// 1. Update `REFERENCE_DATE` and `LAST_UPDATED` below to the new snapshot date.
```

改動後：

```
// 1. The two dates below are NOT the same thing and are no longer updated together.
//
//    `REFERENCE_DATE` — the case-list snapshot date. `daysPending` is derived
//    from each `filingDate` against it, and the justice-seat chart's TODAY line
//    and countdown are drawn from it. Update it ONLY together with steps 2-4,
//    because moving it re-ages every case and moves the chart.
//
//    `LAST_UPDATED` — the date shown in the page header. It records when the
//    data on this page was last refreshed, which is not necessarily the
//    case-list snapshot date.
//
//    They may legitimately differ. As of 2026-09-21 they do: the ruling-threshold
//    content (`RULING_THRESHOLD`, `RULINGS_SINCE_FLOOR_VOIDED`) was refreshed on
//    2026-09-21, while the case list is still the 2026-04-29 snapshot. The page
//    header therefore prints both dates — see `src/app/future/page.tsx`. If you
//    refresh the case list, set both to the new snapshot date and the two header
//    lines will agree again.
```

### 實跑驗證（副本作法，候選檔零變動）

```
AC3: PASS      AC4: PASS（'10' 3 個，未標註 0）
V1 無「無法達到判決門檻」: True
標頭兩行皆在：資料更新日期：2026-09-21 ✓　待審案件統計截至 2026-04-29 ✓
```

`git status --porcelain` 全程只有本票一個檔；`diff -rq` 確認副本與候選的 `src/`
只差 `LaunchGate.tsx` 一檔。`npx tsc --noEmit` exit 0。

### 一件與本票無關的環境雜訊（已處理，記錄備查）

`npx tsc --noEmit` 本輪一度回報 `.next/types/routes.d 2.ts(65,8): error TS2300:
Duplicate identifier 'LayoutProps'`。該檔與 `.next/types/validator 2.ts` 是**檔案同步工具
產生的重複檔**（檔名帶「 2」，與正本 `diff` 逐位元相同，時間戳為 2026-09-21 15:53）。
本專案位於 `~/Documents` 下，屬雲端同步路徑。

兩檔皆在 `.next/`，`.gitignore:17` 已忽略，`git ls-files .next` 為空，**與候選產出無關**。
已刪除該兩個重複檔，`tsc` 隨即 exit 0；`npm run build` 會重新產生它們。
`find src docs -name "* 2.*"` 無命中，原始碼目錄乾淨。
記在此是因為它會再發生，而症狀（tsc 報 duplicate identifier）看起來像程式碼問題，其實不是。

### Summary

V10 兩項都完成，兩個日期常數零變動。標頭改為並排兩行，讀者同時看到
「資料更新日期：2026-09-21」與「待審案件統計截至 2026-04-29」，不必推論就知道
案件清單不是九月的數字。選這個作法而不是改標籤，是因為改標籤只縮小宣稱範圍、
不告訴讀者案件清單的日期，靠省略避免高估；而頁面正下方就印著 473 件待審。
案件日期直接讀 `REFERENCE_DATE`，不寫死字串，避免日後再漂移。

`future.ts` 的 Refresh procedure 第 1 步原本寫「把兩個日期一起更新」，在兩者被拆開後
已成錯誤指示。改寫為各自的意義、為何現在不同步、何時可以分開動，並指向標頭那兩行。

V10 的成因是 FO 在 cycle 1 的 V3 處置，不是 implement 的執行偏差，已記在上方專節。
V7／V8 與 `page.tsx:201` 的「30~40 件」依授權維持零變動。
L1／L2／L3／L5 仍未拍板，`headcount` 維持 `null`。

## Stage Report: verify (cycle 3)

- DONE: 獨立重驗 V10 是否真的解決：確認標頭兩行並排後，**讀者不會再高估待審案件資料的新鮮度**——特別注意標頭下方就印著「473 件待審案件」，請判斷現在的兩行是否足以讓讀者把 473 對應到 2026-04-29 而不是 2026-09-21。這是判斷題，不是核對題。
  **判斷：就待審案件而言，足夠，而且 implement 選的方案比我原本排第一的那個好。** 理由見下方「V10 的判斷」。實跑 HTML 的標頭為兩行並排：「資料更新日期：2026-09-21」／「待審案件統計截至 2026-04-29」，第二行與「473 件案件仍在待審」相隔 2 行、149 字元，兩者共用**同一個名詞「待審案件」**，這是最關鍵的一點。
- DONE: 確認 implement 宣稱的「直接讀 `REFERENCE_DATE` 常數而非寫死字串」屬實（自行讀原始碼驗證，不採信報告），並判定這個作法是否真的能避免日後漂移成第二個 V10；同時複核 `future.ts` Refresh procedure 第 1 步改寫後，是否讓「兩個日期各自代表什麼、什麼時候可以分開動」對下一個人真的清楚。
  屬實：`src/app/future/page.tsx:72-73` 為 `<div>資料更新日期：{LAST_UPDATED}</div>` 與 `<div>待審案件統計截至 {REFERENCE_DATE}</div>`，`REFERENCE_DATE` 於 `:5` 新增進 import，**兩行都是常數插值，無任何硬編日期字串**（已對 `page.tsx` 與 `components/future/*.tsx` 全面掃描硬編日期，命中的 9 筆全是折線圖的座標邊界 `2024-01-01`／`2032-01-01`／`2028-06-01`，與快照日無關）。
  **這確實能防止第二個 V10，而且防的方式比我建議的更好。** cycle 2 的失效模式是「兩個常數分岔而頁面沉默」；現在兩行各自綁一個常數，**一旦分岔就會自己顯示在頁面上**，不可能再無聲。它防不住的是「有人只改 `REFERENCE_DATE` 卻沒重收案件清單」，但那正好是改寫後的 Refresh procedure 明文警告的事（「Update it ONLY together with steps 2-4, because moving it re-ages every case and moves the chart」）。
  Refresh procedure 複核：清楚。它做到四件事——分別定義兩個常數、說明各自牽動什麼、明寫「They may legitimately differ」並舉出當下這一次的實例與原因、以及說明怎樣才能讓兩行再度一致。唯一的小瑕疵是它掛在編號「1.」底下卻是定義而非動作，與步驟 2-4 的祈使句體例不一致；不影響理解，不列為 finding。
- DONE: 確認未越界也未回歸；並重跑 AC1–AC7 確認無回歸。最後給出 PASSED 或 REJECTED。
  **未越界**：`REFERENCE_DATE = '2026-04-29'`、`LAST_UPDATED = '2026-09-21'` 兩個常數值與 cycle 2（`55debe7`）**逐字相同**（僅行號因新增註解而位移）；第十小節 AC 全節、第五小節、第十二小節以字串相等比對**三節皆逐字未變**；`headcount: null as number | null`；V7／V8 與 `page.tsx:201` 的「每年處理量約 30~40 件」`git diff` 為空。**最有力的單一證據**：cycle 2 與 cycle 3 的 `/future` 渲染可見文字 `diff`＝**只多出一行**「待審案件統計截至 2026-04-29」，整頁其餘一字未動。
  **未回歸**：AC1–AC7 七項全過（逐項見下）；具名 placeholder 十項全 0；禁區三檔與 main 逐位元相同（`4071978a…`／`4d1992e3…`／`b1c80d70…`）；`npm run build` exit 0 且 build 前後 JSON sha256 不變；`git status` 為空；eslint error 仍為 main 既有的同四筆。
  **裁決：PASSED。**

### AC1–AC7 無回歸

實際 HTML 以副本作法取得（`git archive HEAD` ＋ `cp -Rc node_modules`，只在副本改 `LaunchGate.tsx`）。`diff -rq` 確認副本 `src/` 在 patch 前與候選完全相同、patch 後只差該一檔；候選 `LaunchGate.tsx` sha256 全程 `b1c80d70…`。取得 124,077 bytes。

- **AC1 PASS**　`requiredForRuling` 0 筆、推算人數 grep 0 筆、HTML 無該字串。
- **AC2 PASS**　`npx tsc --noEmit` exit 0（見下方環境註記）。cycle 1 已自 main 獨立重製「恰好三處報錯」，本輪未觸及該結構。
- **AC3 PASS**　實際 HTML 九條全過（有「憲法訴訟法」、無「憲法法庭法」、無「法定總額」、有「114 年憲判字第 1 號」、無「114憲判9」與「114 年憲判字第 9 號」、有 `2025-12-19`、無 `\d+ 名大法官同意`、無 `需 \d+ 人`、無「表決門檻 (10人)」）。
- **AC4 PASS**　`10` 共 14 處，2 處門檻敘述句**皆同時帶「違憲／失其效力」與「114 年憲判字第 1 號」**，1 處為 Y 軸刻度，11 處為日期片段。
- **AC5 PASS**　`headcount: null`（`future.ts:495`）；站上仍印「換算成具體人數須經法學確認，本站不列。」；P0-7 仍在。
- **AC6 PASS**　禁區三檔與 main 逐位元相同；build 前後 JSON 不變；`layout.tsx:8` 的 `robots: { index: false, follow: false }` 仍在。未執行 `sync-content`。
- **AC7 PASS**　實際 HTML 無「114憲判9」。
- **L5 維持未達成**　依指示未再試瀏覽器。本輪導言渲染字串未變（190 半寬單位），新增的標頭第二行為 27 半寬單位、10px 等寬字，離 375px 的換行門檻很遠——**但這同樣是算術，不是量測**。

### V10 的判斷

**implement 拒絕我的第一案是對的，而我原本把它排第一是錯的。** 我給的第一案是把標頭改成「門檻資料更新日期：2026-09-21」。它確實消除高估，但方式是**少說一句話**——讀者不再被誤導，卻也依然不知道 473 是什麼時候的數字。implement 的理由「靠省略避免高估」精準命中這一點。兩個日期並排是嚴格的資訊增量，比我的方案好。

**為什麼我認為兩行對「待審案件」這一塊夠用：**
一、**名詞對得上**。標頭寫「**待審案件**統計截至 2026-04-29」，導言寫「473 件案件**仍在待審**」，用的是同一個詞。讀者要查 473 的年紀，答案就在正上方兩行，不需要推理。
二、**涵蓋面比 473 大**。同一句話同時解釋了下方案件清單裡每一張卡的「NNN天 (N.N 年)」——那些全是同一份 `REFERENCE_DATE` 推導出來的 `daysPending`（`future.ts:260`）。一行話蓋住整個資料集，不是只蓋住一個數字。
三、**分岔從此不會再沉默**。這是我原本沒想到、但實際上最有價值的效果：兩行分別綁兩個常數，將來只要有人動其中一個，頁面自己就會顯示兩個不同的日期。cycle 2 的 V10 之所以成立，正是因為分岔是無聲的。

### Findings

**V11　`REFERENCE_DATE` 還有兩個消費者沒有被任何一行標頭涵蓋——建議 Needs decision，隨 `REFERENCE_DATE` 那張票處理，不因此退回。**
- 發布使用者與正常流程：任何開啟 `/future` 的讀者。
- 可觀察損害：兩處都落在「待審案件」這個名詞之外，所以第二行救不到它們。(1) 倒數「**1980** 天後歸零」——`DAYS_UNTIL_CLIFF = daysBetween(REFERENCE_DATE, 最後一個 TERM_EVENT)`（`future.ts:427-431`），實算 `2026-04-29 + 1980 天 = 2031-09-30` 相符；若以 `LAST_UPDATED` 起算應為 1835 天，**高估 145 天**。(2) 席次圖的 TODAY 垂直線（`JusticeTermTimeline.tsx:186`／`:188`／`:196`）畫在 2026-04-29，卻標著 TODAY。
- 受影響的 value AC 或不可協商邊界：無。AC1–AC7 不涵蓋這兩個常數。
- 觸發證據：實際 HTML 的「Countdown / 1980 / 天後歸零」；上述四個原始碼位置。
- **實際傷害有限，我不誇大**：倒數數字的正下方就印著「2031年09月，最後 5 名大法官任期屆滿」——那是絕對日期、完全正確、而且是讀者真正會記住的結論；1980 對 1835 是 5.4 年跨度上 7% 的誤差。TODAY 線沒有標任何日期，而且在 2024–2032 的軸上 145 天約等於一個年刻度的十六分之一，肉眼看不出來。這是**衍生數字的精度問題，不是錯誤陳述**。
- **為什麼不因此退回**（dispatch 特別要求我確認這一點）：這**不是新缺陷**——cycle 2 的 V10 證據欄位就已經同時點名這三個消費者（案件年齡、TODAY 線、倒數），FO 選的處置是「維持原字樣＋加一行」，implement 精確執行了。再退回等於要求加碼同一個已處置 finding，而且會逼出兩種都不好的結果：動 `REFERENCE_DATE`（越界，屬第十二小節第 2 點那張票）或在 10px 的日期戳區再堆第三行去揭露一個 7% 的倒數誤差（不成比例）。
- **建議（給 gate，不是給本票）**：真正的病根是 `REFERENCE_DATE` 身兼兩職——它既是「案件清單快照日」，又被當成前瞻圖表的「今天」。改寫後的 Refresh procedure 誠實描述了這兩個角色，但仍用同一個名字。根治是把它拆成兩個常數（案件快照日／參照今日），那正是 `REFERENCE_DATE` 那張票該做的事。在那之前，現狀可接受。

**既有項目複核（零變動，不重複舉證）**：V7（`/quiz/*` 與 `/controversy-timeline` 以現在式把已失效門檻當現行法）materiality **未改變**，仍建議另開票；V8（`design-assets/003:28`）屬 `049`；`page.tsx:201` 的「每年處理量約 30~40 件」依授權未動，已併入 V7 新票建議。

**環境註記（非候選缺陷，但下一個人會踩到）**：本輪第一次跑 `npx tsc --noEmit` 時 exit 2，錯誤是 `.next/types/routes.d 2.ts(65,8): error TS2300: Duplicate identifier 'LayoutProps'`。**這不是候選的問題**：`tsconfig.json` 的 `include` 含 `.next/types/**/*.ts` 而 `exclude` 只有 `node_modules`，所以 `.next/` 裡任何一個檔名帶「 2」的重複檔都會讓專案自己的型別檢查指令假性失敗；那個重複檔是我 cycle 2 在同一個 worktree 跑 `npm run build` 時留下的（檔名體例為 macOS／iCloud 的重複檔命名，本專案位於 `~/Documents/` 之下）。`.next/` 已在 `.gitignore:17`，`git ls-files` 中沒有任何檔名帶「 2.」的追蹤檔，`.next` 以外也找不到同類檔。跑一次 `npm run build` 重建 `.next/` 之後**再跑 `npx tsc --noEmit` 即 exit 0**（已實跑確認，不是推論）。遇到這個錯誤時先重建 `.next/`，不要去改原始碼。

### 裁決

**PASSED。**

V10 修好了，而且修法比我建議的好。我給的第一案是把標頭改窄成「門檻資料更新日期」——那是靠少說話來避免說錯，讀者仍然不知道 473 是哪一天的數字；implement 否決它並選了兩行並排，是正確的判斷。就「待審案件」這一塊，兩行足以讓讀者把 473 和清單裡每一張卡的案齡都對應到 2026-04-29：標頭用的是同一個名詞「待審案件」，位置就在正上方兩行。附帶還有一個我原先沒預期的結構性好處——兩行各綁一個常數，將來兩個日期只要分岔就會自己顯示出來，cycle 2 那種無聲分岔不可能再發生。原始碼我自己讀過，兩行確實是常數插值，沒有硬編字串。

沒有越界，也沒有回歸。跨輪的渲染文字 `diff` 只多出一行，整頁其餘一字未動；兩個常數值與 cycle 2 逐字相同；AC 全節、第五小節、第十二小節三節逐字未變；`headcount` 仍是 `null`；V7／V8 與 `page.tsx:201` 零變動；AC1–AC7 全過；禁區三檔與 main 逐位元相同。

留兩件事給 gate。一、**V11**：`REFERENCE_DATE` 還牽動倒數（1980 天，高估 145 天）與席次圖的 TODAY 線，這兩者不在「待審案件」的涵蓋範圍內。它是 cycle 2 V10 的未修殘餘、不是新缺陷，傷害也有限（絕對終點 2031年09月 就印在旁邊且正確），所以我不退回；病根是 `REFERENCE_DATE` 身兼「案件快照日」與「參照今日」兩職，根治屬第十二小節第 2 點那張票。二、**L5**（375px 六行）仍未量測，本環境無法量測，gate 必須照實列為未達成。

## Stage Report: review

**我是新的、獨立的 reviewer。以下每一項都自己重跑，未採信 implement 或 verify 的自我回報。**
所有一手來源於 **2026-09-23 當日重新 `curl`**，未沿用前三輪的快取。

- DONE: 逐項重現第十小節 AC1–AC7 的 `Verified by:` 子句，**不採信 implement 或 verify 的自我回報**；其中 AC3／AC4 必須以真實頁面 HTML 驗證（用 `git archive HEAD` ＋ `cp -Rc node_modules` 的副本作法，**不得暫改候選檔**），並判定站上每一條法律敘述是否仍逐字對得回一手來源。
  **AC1–AC7 七項全過**，逐項證據見下方「AC 獨立重跑」。AC2 不採信貼上的輸出，自 merge-base `112d0af` 另開副本重製：基線 `tsc` exit 0，只刪 `requiredForRuling: 10,` 一行後 exit 2 且**恰為三筆** TS2339。AC3／AC4 取自副本 dev server 的真 HTML 124,318 bytes，候選 `LaunchGate.tsx` sha256 全程 `b1c80d70…` 未變、`git status` 全程為空。**站上每一條法律敘述都逐字對得回一手來源**，逐條核對見下方「一手來源獨立核對」。
- DONE: 依實際交付行為查核 `## 文件影響` 每一筆：必要更新是否已完成、`record` 類文件是否未被改寫、`docs/INDEX.md` 是否符合實際的文件新增或刪除結果；並評估程式品質（型別、慣例、可重用性）與是否有回歸或被弄壞的功能。
  三筆「實作後更新」全部完成且作法合乎 `CLAUDE.md`：`data-collection-guide.md`（`evergreen`）就地更新並附補述框保留原句；`TODO.md` 的 P0-7 欄位結構與 P0-2 逐項對應；`INDEX.md` 恰好只動這兩份的「最後查核」。**未動任何 `record` 文件**（本票改動的三份文件狀態為 `evergreen`／`evergreen`／`plan`）。本票未新增或刪除任何文件，故 `INDEX.md` 無須增減列。**程式品質與回歸見下方「程式品質」。**
- DONE: 判定這份 diff 能不能交付，以及三輪累積的未結項是否都被正確地留在票內而非悄悄消失：L1／L2／L3 未拍板且 `headcount` 為 `null`、L5 未量測、V7／V8／V11 維持 Needs decision。最後給出 PASSED 或 REJECTED 與理由。
  **未結項全部留在票內，無一項悄悄消失**（逐項見下方「未結項盤點」）。**裁決：PASSED**，理由見下方「裁決」。五項新 finding 全為 Polish 或 FO 記錄事項，無一項 Material。

### 一手來源獨立核對（2026-09-23 重新取證）

| 站上印出的敘述 | 一手來源實跑結果 |
|---|---|
| 「憲法訴訟法第 30 條第 2 項（參與評議之大法官不得低於 10 人、作成違憲宣告之同意人數不得低於 9 人）」 | `LawAll` 第 30 條：「不得低於十人」「不得低於九人」皆命中。主文用阿拉伯數字，係司法院行文體例 ✅ |
| 「114 年 1 月 23 日修法**增訂**」 | `LawOldVer` 112-06-21 版第 30 條**全條只有一項**，`不得低於十人` 命中 **0** → 確為增訂而非修改 ✅ |
| 「已由 114 年憲判字第 1 號宣告違憲，自公告日 2025-12-19 起失其效力」 | 主文：第 4 條第 3 項、**第 30 條第 2 項至第 6 項**、第 95 條「應自本判決公告之日起失其效力」；判決日期 114 年 12 月 19 日 ✅ |
| 「存續期間為 114 年 1 月 23 日至 114 年 12 月 19 日」 | 沿革第 5 條目：「一百十四年一月二十三日……令修正公布第 4、30、95 條條文；**並自公布日起施行**」＋失效日 ✅ 起訖兩端皆有據 |
| 「該期間內憲法法庭只作成一則判決，就是……114 年憲判字第 1 號本身」 | 判決清單**逐年去重**：115 年 6 則、**114 年 1 則**、113 年 11 則、112 年 20 則、111 年 20 則。**本頁橫跨 111–115 年，114 年未被分頁截斷** ✅ |
| 「該判決並未適用這一項……理由【41】『既嚴重妨礙本庭行使憲法職權⋯⋯自不得作為本件判決的程序規範』」 | 原文：「系爭規定二**既嚴重妨礙本庭行使憲法職權**，依前所述，**自不得作為本件判決的程序規範**。」刪節號取代「，依前所述，」✅ 逐字 |
| 「這一項」＝系爭規定二 | 原文「第30條第2項至第6項（**依序下稱系爭規定二至六**）」→ 系爭規定二＝第 2 項 ✅ 指涉正確 |
| 「【43】改依第 30 條第 1 項定評議及評決門檻」 | 段落 43 原文含第 30 條第 1 項全文引述與「本庭自得本於程序自主權，決定本案審查的程序規範」✅ |
| 「失效後憲法法庭已作成 6 則判決，最近一則為 115 年憲判字第 6 號（115 年 8 月 14 日）」 | 六個 `id` **逐一開 `docdata` 頁**核對自身的判決字號與判決日期，**六筆全中**（僅差在頁面用 `01月02日` 補零）；清單最高號為第 6 號，無第 7 號 ✅ |
| 「現行有效的門檻是憲法訴訟法第 30 條第 1 項……判決，除本法別有規定外，應經大法官現有總額三分之二以上參與評議，大法官現有總額過半數同意」 | 與條文**逐字相符**，含句首但書 ✅ |
| 導言「目前僅存 5 名大法官參與評議」 | 115 憲判 6【30】：「本庭現任大法官8人，因其中3人持續拒絕參與評議……應由**實際參與評議之大法官5人**作成本判決」✅ 逐字 |

**查證陷阱本日複驗，成立且比前三輪更強。** 全國法規資料庫「法規整編資料截止日：**民國 115 年 09 月 18 日**」——
只落後今日 **5 天**（前輪為 10 天），卻仍原樣顯示已失效的第 30 條第 2 至 6 項：
該區塊內 `失其效力|失效|憲判|停止適用` 命中 **0** 筆，`不得低於十人`／`不得低於九人` 俱在。
`法定總額` 全文 **0** 次、`現有總額` **13** 次。沿革確認最後一次修正即 114-01-23，其後無修正
（`LawOldVerList` 本次**未**回「查無資料」，六個版本列齊，`012` 的那個陷阱本票未踩到）。
另附一筆：被一併宣告失效的第 4 條第 3 項內容為「總統應於二個月內補足提名」，
**不是**「現有總額」的定義——條文從未定義「現有總額」，這正是 L1 至今無法由條文自證的原因。
站上不印任何人數，因此這個解釋空白對站上不構成錯誤陳述。

### AC 獨立重跑

取 HTML 的方法：`git archive HEAD | tar -x` ＋ `cp -Rc node_modules`，**只在副本改 `LaunchGate.tsx` 一行**。
`diff -rq` 確認副本 `src/` 在 patch 前與候選**完全相同**、patch 後只差該一檔。

- **AC1 PASS**　`grep -rn 'requiredForRuling' src/` **0** 筆；`grep -rnE '需 *[0-9]+ *(人|名).*(判決|同意)|[0-9]+ *名大法官同意' src/` **0** 筆；真 HTML 亦無。
- **AC2 PASS（自 `112d0af` 獨立重製）**　基線 `tsc --noEmit` exit **0**；只刪 `requiredForRuling: 10,` 一行後 exit **2**，**恰好三筆**：`page.tsx(79,31)`、`page.tsx(194,35)`、`BottleneckFunnel.tsx(135,71)`，TS2339 訊息與 implement 所貼逐字相同。非兩筆、非零筆。
- **AC3 PASS（十條全過）**　真 HTML 可見文字：有「憲法訴訟法」、**無**「憲法法庭法」、**無**「法定總額」、有「114 年憲判字第 1 號」、**無**「114憲判9」、**無**「114 年憲判字第 9 號」、有 `2025-12-19`、**無** `\d+ 名大法官同意`、**無** `需 \d+ 人`、**無**「表決門檻 (10人)」。
- **AC4 PASS**　真 HTML 可見文字的 `10` 共 **19** 處，**逐處列印上下文判讀**：2 處為門檻敘述句（導言與卡片），**兩句都同時帶「宣告違憲／失其效力」與「114 年憲判字第 1 號」**；1 處為席次圖 Y 軸刻度（同組有 0／5／15）；其餘 16 處為日期與天數片段（`2024-10-31`×7、`2019/10/08`、`1008`／`1062`／`1099`／`1169`／`1307`／`210`／`189`×2）。**無任何無上下文的 10 人門檻數字。**
- **AC5 PASS**　`headcount: null as number | null`（`future.ts:495`），JSDoc 指向本文件第五小節；`grep -n '063-required-for-ruling' src/data/future.ts` **3** 筆；`TODO.md:364` 的 P0-7 存在，欄位結構（狀態／背景／一手來源表／待拍板表／誰能做／卡在／解除方式／驗證）與 P0-2 對應。站上印「換算成具體人數須經法學確認，本站不列。」——未印推算人數、未用「約」包裝、未留破折號。
- **AC6 PASS**　`discussions.json`／`history.json` sha256 與 `git show main:` **逐位元相同**（`4071978a…`／`4d1992e3…`），且 `npm run build` **前後不變**；`git log 112d0af..HEAD -- <兩檔>` **0** 筆；`layout.tsx:8` 的 `robots: { index: false, follow: false }` 仍在，build 產出的 `.next/server/app/future.html` 帶 `noindex, nofollow`。未執行 `sync-content`。
- **AC7 PASS（就其 `Verified by:` 所寫的 grep 而言）**　`grep -n '114憲判9'` 19 筆逐筆讀過，**無一筆把它當成有效引註**；真 HTML **0** 筆；frontmatter `title` 已為「（114憲判1）」。**但另有一處同義不同寫法未被該 grep 涵蓋——見 finding R1。**
- **L5 未量測，如實記錄**　依 dispatch 指示**未再嘗試任何瀏覽器**。本 stage 不宣稱 375px 六行限制已量測或已通過。它維持未達成，gate 必須照實列出。

### 程式品質

- **型別**：`npx tsc --noEmit` exit **0**；`npm run build` exit **0**。`headcount === null ? … : …` 的 else 分支因 `null as number | null` 而型別為 `number`，拍板後的接線點成立且現在就能編譯。`LATEST_RULING` 以 `[length - 1]` 取值，在 `as const` 唯讀元組上得到六個元素的聯集型別，`.docket`／`.dateLabel` 渲染正常——可讀性上 `.at(-1)` 略優，但不是缺陷。
- **慣例**：`RulingThresholdNote` 直接 `import` 常數，與 `BottleneckFunnel.tsx:4` 既有模式一致；`compact` 的預設 `className` 與被取代的原 `<span>` 逐字相同（`text-[10px] text-gray-500`），真 HTML 確認樣式未變。
- **可重用性**：把三處手寫文案收斂成單一元件，是對的結構修法——三處各自寫出三個不同的錯誤，正是分散手寫造成的。`VOIDED_FLOOR_SHORT`／`_FULL` 共用同一組欄位，使「10」在結構上不可能脫離「違憲」與失效依據單獨出現；這比逐處字串檢查更耐得住下一次改動。
- **無回歸、無死碼**：`JusticeTermTimeline` 移除 `QUORUM` 後，`yForCount` 仍有 **9** 處使用，未成孤兒；原處留註解說明失效依據並指向本票，下一個人不會再畫一次。
- **lint 與 baseline 逐筆相同**：候選與 `112d0af` 皆為 **10 problems（4 errors, 6 warnings）**，唯一差異是 `BottleneckFunnel` 的既有 `react-hooks/set-state-in-effect` 由 `22:5` 位移到 `23:5`（新增 import 所致）。**本票未引入任何新的 lint 問題。**
- **環境雜訊本輪重現**：`npx tsc --noEmit` 首次 exit 2，錯誤為 `.next/types/routes.d 3.ts(65,8): TS2300 Duplicate identifier 'LayoutProps'`（本輪是「 3」變體，非前輪的「 2」）。`rm -rf .next` 後 `tsc` 立即 exit 0。**與候選無關**，`find src docs -name "* 2.*"` 無命中，原始碼目錄乾淨。cycle 3 的環境註記屬實且會再發生。

### 未結項盤點（三輪累積）

| 項目 | 應有狀態 | 實際查核結果 |
|---|---|---|
| L1／L2／L3 | 未拍板，`headcount` 為 `null` | ✅ `headcount: null`（`future.ts:495`）；第五小節三列俱在；P0-7 追蹤中 |
| L5（375px 六行） | 未量測 | ✅ 第五小節、三輪 verify 報告與本報告皆記為未達成，無一處寫成已量測 |
| V7（`/quiz/*`、`/controversy-timeline`） | Needs decision，零變動 | ✅ `git diff 112d0af..HEAD -- src/data/quizzes/ src/data/controversy-timeline.ts` **空** |
| V8（`design-assets/003:28`） | Needs decision，零變動 | ✅ `git diff … -- docs/design-assets/ docs/constitution-features/049-*.md` **空** |
| V11（`REFERENCE_DATE` 的倒數與 TODAY 線） | Needs decision，隨別票 | ✅ 記於 cycle 3 verify，四欄證據齊備，病根與路由都寫明 |
| `page.tsx:201`「30~40 件」 | 依授權未動 | ✅ 該行在 diff 中為 context，未被增刪 |
| 封存票與 `056` | 不改寫 | ✅ `_archive/`、`056`、`src/data/*.json`、`layout.tsx` 全部零變動 |

**無一項悄悄消失。** 本票範圍乾淨：`git diff --name-only 112d0af..HEAD` 恰為 9 檔（4 份文件＋5 份程式）。

### Findings（我擁有觀察，不擁有處置權；等 FO 授權才動候選位元組）

**R1　本文件第 22 行把不存在的「114 年憲判字第 9 號」當成事實陳述，未加任何更正標記——建議 Polish／本票擁有／fix（一行補述）。**
- 發布使用者與正常流程：讀本票的工作夥伴，以及 gate 上的 FO 與 captain。第 22 行位於 `## Problem`，在全文最前段。
- 可觀察損害：原句為「內容涉及 114 年憲判字第 9 號，需要法學判斷才能拍板。」**沒有「這是錯的」標記**。第 45 行才更正，相隔 23 行；本文件其他保留原句之處（第五小節 L1、第六小節）都附了補述框，唯獨此處沒有。這正是第六小節記錄的擴散機制（`021` → `056` → 本票 title）。
- 受影響的 value AC 或不可協商邊界：AC7 的標題句「把誤引當成正確引註繼續往下傳」即為其失敗條件；但 AC7 的 `Verified by:` 只寫了 `grep -n '114憲判9'` 這個**緊寫法**，而第 22 行用的是**空格寫法**「114 年憲判字第 9 號」，故三輪 verify 依該 grep 回報 AC7 PASS **並無錯誤**——是 AC 的 grep 沒涵蓋到這個寫法。
- 觸發證據：`grep -n '114 年憲判字第 9 號' docs/constitution-features/063-…md` → 第 22 行命中，上下文無更正字樣；對照第 476／477 行（design 報告引用同樣錯誤的 checklist 原文，但下一行立即寫「命題的前提被否證」）。
- 為什麼只是 Polish 而非 Material：站上真 HTML **0** 筆、frontmatter `title` 已更正、第六小節用整節追溯源頭與擴散。損害限於本票內部可讀性，不及於任何發布面。
- 建議處置：加一行補述（保留原句，依 `CLAUDE.md`「不要悄悄改寫原文」）。**另建議 FO 把 AC7 的 grep 寫法缺口一併記下**，那是這個漏網的真正成因。

**R2　`TODO.md` 的 P0-7 的 L1 列仍是**被取代前**的問法，缺 V9 補進去的七則判決證據——建議 Polish／本票擁有／fix。**
- 發布使用者與正常流程：P0-7 明寫「誰能做：法學協作者拍板 L1 到 L4」。**P0-7 就是交到法學協作者手上的那份東西。**
- 可觀察損害：P0-7 的 L1 列寫「114 憲判 1 理由【50】的認定是否及於其他案件」，而本票第五小節已於 cycle 2（V9）把問法改為「法庭已連續七則判決都採『拒絕參與評議者不計入現有總額』，站上要不要照法庭的算法寫？」並附 115 憲判 6【30】原文。**拍板者只讀 P0-7 的話，看到的是已被取代的問題，且拿不到最關鍵的那筆證據。**
- 受影響的 value AC 或不可協商邊界：無 AC 涵蓋 P0-7 的內文同步。AC5 只要求「新增一列待法學確認項，格式比照 P0-2」，該要求已滿足。
- 觸發證據：`TODO.md:364` 起的 L1 列 vs 本文件第五小節 L1 列（含 2026-09-21 補述）；P0-7 自己寫著「編號沿用……第五小節」，但內容未隨第五小節更新。
- 建議處置：把 115 憲判 6【30】那段補進 P0-7 的 L1 列，或在該列加一句「最新問法與證據見本票第五小節」。成本一行。

**R3　`TODO.md` P0-7 區段結尾有連續兩條 `---`——建議 Polish／本票擁有／fix 或 decline。** 純版面，`TODO.md:399-401`。

**R4　`compact` variant 在無 `role` 的 `<span>` 上掛 `aria-label`——建議 Polish／非實作偏差，屬設計層。**
多數螢幕閱讀器忽略 role-less 泛型元素上的 `aria-label`；少數會honour 的情況下，它會**取代**可見文字「門檻依現有總額比例計算」而非補充。真 HTML 確認 `title` 與 `aria-label` 字串相同且完整。**這是第八小節規格明文要求的，implement 照做無誤**，故不算執行偏差；若要改屬設計決定（例如改用 `<abbr>` 或把長敘述放進可見的 `title` 提示）。

**R5　`### Feedback Cycles` 沒有 `- Cycle 3:` 那一行——FO 記錄事項，非本 diff 缺陷。**
該節目前只有 Cycle 1 與 Cycle 2 兩列。處理 V10 的那一輪（implement cycle 3 → verify cycle 3）是第三個 correction round，但沒有對應的 `- Cycle {N}:` 列。stage 定義寫「The First Officer appends one `- Cycle {N}: ...` line ... per correction round」且「**Cycle 3 escalates to the captain**」。**V10 的實質內容並未消失**（成因、選項比較、實作與複驗都在 cycle 3 的兩份報告裡），消失的只是那一列 ledger。**這是 FO 擁有的簿記，不是 implement 的交付缺陷**，故不影響裁決，但 gate 應補上或明記為何跳過（Cycle 2 列已記載 captain 曾就**該輪**授權跳過 round record，但那句授權指的是 cycle 2）。

### 裁決

**PASSED。**

先講這份 diff 最值得肯定的地方，因為它決定了我為什麼不在 R1 上退回：**本票把一個「數字錯了」的問題，修成了「結構上不可能再錯」。** 原本三個渲染點各自手寫文案，於是寫出三個不同的錯誤——錯的法律名稱、不存在的「法定總額」、把「參與評議」講成「同意」。現在三處共用 `RulingThresholdNote`，而「10」只能透過 `VOIDED_FLOOR_SHORT`／`_FULL` 出現，那兩個字串在結構上把失效依據綁死在同一句裡。這不是字串修正，是把錯誤的成因移除。`headcount: null` 的設計同理：條文從未定義「現有總額」（我今天讀了第 4 條確認過，連被宣告失效的第 4 條第 3 項都只是提名期限規定），所以任何具體人數都是站方的加工——不印數字不是規避，是唯一對得起一手來源的作法。

七項 AC 我全部自己重跑，沒有一項採信前輪的輸出：AC2 自 merge-base 獨立重製到恰好三筆型別錯誤；AC3／AC4 用副本作法取真 HTML 124,318 bytes，候選檔 sha256 全程未變；AC4 的 19 個「10」我逐處列印上下文判讀，兩處門檻敘述都帶著失效標記，其餘全是刻度與日期。站上每一條法律敘述我都在 **2026-09-23 當天重新取證**逐字對回一手來源，**全部成立**——包含最容易被放過的兩處：「增訂」（靠 112-06-21 舊版全條只有一項證成）與「該期間內只作成一則判決」（靠判決清單逐年去重、並確認 114 年未被分頁截斷證成）。查證陷阱本日更強：法規資料庫只落後 5 天，仍原樣顯示已失效的第 30 條第 2 至 6 項，失效標註 0 筆。

文件影響三筆全部落地且合乎 `CLAUDE.md`——`evergreen` 就地更新並保留原句、`record` 一份未動、`INDEX.md` 恰好只動該動的兩列、無增刪文件故無須增減索引列。程式面 `tsc` 與 `build` 皆 exit 0，lint 與 baseline 逐筆相同，無死碼，無回歸，禁區三項全守。三輪累積的未結項一項都沒消失：`headcount` 仍是 `null`、L5 明記未量測、V7／V8／V11 零變動且維持 Needs decision。

五項 finding 沒有一項 Material。R1 是本票內部的一行未標記誤引，**站上真 HTML 0 筆**、`title` 已改、第六小節整節追溯，損害不及任何發布面；它之所以漏掉，是 AC7 的 `Verified by:` 只寫了緊寫法的 grep，前三輪依該 grep 回報 PASS 並沒有錯——這一點我認為比那一行本身更值得 FO 記下。R2 是 P0-7 的 L1 列停在舊問法，而 P0-7 正是要交給法學協作者的東西，成本一行、值得順手補。R3 版面、R4 屬設計層且 implement 照規格執行無誤、R5 是 FO 的 ledger 簿記。

**這份 diff 可以交付。** 但交付不等於這件事做完了——`headcount` 還是 `null`，L1 到 L4 仍待法學背景者拍板，L5 在本環境無法量測，而 V7 指出的 `/quiz/*` 與 `/controversy-timeline` 仍以現在式把已失效的 10 人門檻當現行法，那是同一個法律錯誤的最大殘餘面，且 `/controversy-timeline` 在 `PUBLIC_PAGES` 內。這些都正確地留在票內等 captain，不是被這張票解決掉了。
