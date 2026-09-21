---
id: 063
title: requiredForRuling 的法律正確性（114憲判1）
status: implement
source: constitution-features/056 第二節 D3
started: 2026-09-21T21:16:25Z
completed:
verdict:
score: 0.75
worktree: .worktrees/spacedock-ensign-063-required-for-ruling-legal-accuracy
issue:
pr:
mod-block:
---

確認 `requiredForRuling` 這項法律內容的正確性，並讓它有明確的負責人。

## Problem

這一項原本掛在 `021`／`026` 兩張**已封存**的票上。掛在封存票上等於沒人負責——這正是 feature `056` 的 Problem 一節所說的「各自漂走」。`056` 因此判定開專票。

內容涉及 114 年憲判字第 9 號，需要法學判斷才能拍板。

## Proposed approach

design stage 先界定：要確認的具體命題是什麼、以什麼為權威來源（憲判原文而非轉述）、以及錯誤若成立時站上哪些位置會受影響。

**拍板需法學背景者。** 這一項的結論可能是「修正」也可能是「確認原本就對」，design stage 不預設答案。

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

| 代號 | 待拍板問題 | 為什麼 design 不能自己決定 |
|---|---|---|
| **L1** | 「現有總額」現在是 8（在職人數）還是 5（扣除持續拒絕參與評議者）？ | 114 憲判 1 理由【50】標題為「本件判決拒絕參與評議的大法官，應不計入現有總額」。但該認定是**就本件所為**。它是否及於其他案件，是法律解釋問題 |
| **L2** | 依 L1 的答案，門檻的具體人數是多少？「三分之二以上」遇到非整數時如何處理？ | 若現有總額 8：2/3 = 5.33。若現有總額 5：2/3 = 3.33。進位方式本身是法律讀法，不是算術 |
| **L3** | 114 憲判 1 該描述為「全部違憲」還是「部分違憲」？ | 主文把**每一個系爭規定**都判違憲（第 4 條第 3 項、第 30 條第 2 至 6 項、第 95 條）。但第 30 條第 1 項未被聲請、未受審查、仍有效。`056` 的 D3 寫「部分違憲」。用哪一種措辭需拍板 |
| **L4** | 站上還能不能說憲法法庭「實質上無法做出任何判決」？ | 民國 115 年已有六則判決（見第三小節表）。這句話與一手來源直接衝突。但它是編輯判斷，不純是法律判斷 |

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
