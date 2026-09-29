# 內容查核閱讀清單（2026-09-29）

產生於 commit `a96c7c7`。重跑：`node scripts/content-audit.mjs reading-list > <檔名>`。
規格見 `docs/constitution-features/systematic-chinese-content-legal-audit.md`（本票 `067`）。
M 層（機器判）不在本清單。跑 `node scripts/content-audit.mjs check` 看 M 層結果。
修正途徑欄：`PR` 表示改原始碼；`改試算表` 表示該檔是試算表同步的產物，不得手改（`AGENTS.md` 第 2 條）。

## L1 同一事實的所有敘述

同一組內的句子描述同一件事。逐句對照，判斷是否互斥。

### L1-a：立法院對大法官人事案做了什麼（不審查、否決、杯葛）（21 句）

建組依據：controversy-timeline.ts 的 evt-09 寫「不審查」，evt-11 寫「投票否決」。

- [ ] `src/data/controversy-timeline.ts:144`（PR）核心策略是：墊高憲法法庭作成判決的門檻（要求更多大法官出席與同意），搭配凍結大法官人事同意權（不審查總統提名人選），讓憲法法庭因人數不足而無法運作。
- [ ] `src/data/controversy-timeline.ts:156`（PR）這個修法表面上是「提高司法品質」，實際上搭配立法院當時已凍結大法官人事同意權（不審查新提名人），等於讓憲法法庭無法達到開庭門檻。
- [ ] `src/data/controversy-timeline.ts:167`（PR）蔡英文時期提名的七位大法官離任，憲法法庭僅剩八位大法官。
- [ ] `src/data/controversy-timeline.ts:168`（PR）2024年10月31日，蔡英文總統時期提名的七位大法官任期屆滿正式離任，憲法法庭僅剩八位大法官。
- [ ] `src/data/controversy-timeline.ts:178`（PR）大法官提名遭否決
- [ ] `src/data/controversy-timeline.ts:179`（PR）賴清德總統提名的大法官人選遭立法院投票否決，第二次提名亦於2025年7月25日遭否決。
- [ ] `src/data/controversy-timeline.ts:180`（PR）賴清德總統依憲法規定提名新任大法官人選送交立法院行使同意權。
- [ ] `src/data/controversy-timeline.ts:180`（PR）立法院透過否決提名人選，使憲法法庭無法補足大法官人數。
- [ ] `src/data/controversy-timeline.ts:215`（PR）更多大法官任期屆滿，新提名人持續遭杯葛，憲法法庭長期維持最低運作人數。
- [ ] `src/data/future.ts:416`（PR）賴清德總統提名7名大法官人選送立法院行使同意權，立法院於2024年12月24日投票否決全部人選。
- [ ] `src/data/future.ts:422`（PR）總統再度送出大法官提名咨文，立法院於2025年7月25日投票否決全部人選。
- [ ] `src/data/quizzes/controversy.ts:87`（PR）表面上是「提高司法品質」，實際上搭配立法院拒絕行使大法官人事同意權，讓法庭在新法生效後湊不到開庭人數。
- [ ] `src/data/quizzes/controversy.ts:92`（PR）賴清德總統兩次提名大法官人選送立法院行使同意權，結果如何？
- [ ] `src/data/quizzes/pending.ts:71`（PR）但因 2024 年 10 月有 7 位大法官任期屆滿離任，加上立法院兩次否決總統提名，目前僅剩 8 位在任大法官，遠低於法定員額。
- [ ] `src/data/quizzes/pending.ts:75`（PR）賴清德總統兩次提名大法官人選，結果如何？
- [ ] `src/data/discussions.json:68`（改試算表）三分鐘動畫版：立法院把開會門檻抬到 10 人、把總統提名的新任大法官全部卡住，憲法法庭眼看要「關機」。
- [ ] `src/app/future/page.tsx:80`（PR）立法院未行使新任大法官人事同意權，目前僅存 5 名大法官參與評議。
- [ ] `src/app/future/page.tsx:183`（PR）原定 15 名大法官，由於立法院兩度投票否決總統提名人選， 導致 2024 年 11 月起，有 7 席空缺無法補足。
- [ ] `src/app/present/page.tsx:18`（PR）大法官提名遭立院否決
- [ ] `src/app/present/page.tsx:18`（PR）賴清德總統於8月30日提名7名大法官填補缺額，立法院於12月24日投票否決全部人選。
- [ ] `src/app/present/page.tsx:20`（PR）總統於3月21日再度送出提名咨文，立法院於7月25日投票否決全部人選，大法官缺額持續無法補齊。

## L2 號次與案名

每個號次的全部出現處，與官方案名並排。判斷敘述的主題是否就是該號次的案件。
釋字的官方案名不在 fixture 內，只列出現處。

### 111年憲判字第2號【強制道歉案（二）】（2022-02-25）

- [ ] `src/data/history.json:510` 111年憲判字第2號

### 111年憲判字第17號【西拉雅族原住民身分案】（2022-10-28）

- [ ] `src/data/history.json:494` 111 年 憲判字第 17 號

### 111年憲判字第19號【全民健保停保復保案】（2022-12-23）

- [ ] `src/data/history.json:526` 111年憲判字第19號

### 112年憲判字第1號【祭祀公業派下員資格案（二）】（2023-01-13）

- [ ] `src/data/history.json:558` 112年憲判字第1號

### 112年憲判字第3號【公職年資併社團年資案】（2023-03-17）

- [ ] `src/data/history.json:574` 112年憲判字第3號

### 112年憲判字第7號【成立廠場企業工會案】（2023-05-19）

- [ ] `src/data/history.json:542` 112 年憲判字第 7 號

### 112年憲判字第13號【販賣第一級毒品案】（2023-08-11）

- [ ] `src/data/history.json:590` 112年憲判字第13號

### 113年憲判字第6號【消防警察人員類別考試身高限制案】（2024-05-31）

- [ ] `src/data/quizzes/rights.ts:39` 113 年憲判字第 6 號
- [ ] `src/data/history.json:622` 113年憲判字第6號

### 113年憲判字第9號【立法院職權行使法等案】（2024-10-25）

- [ ] `src/data/controversy-timeline.ts:129` 113年憲判字第9號判決
- [ ] `src/data/controversy-timeline.ts:131` 憲法法庭作成113年憲判字第9號判決，宣告《立法院職權行使法》修正案中關於國會調查權的部分規定、強制傳喚權、藐視國會罪等核心條文違憲。
- [ ] `src/data/opinions.ts:94` 113年憲判字第9號
- [ ] `src/data/opinions.ts:107` 113年憲判字第9號
- [ ] `src/data/opinions.ts:120` 113年憲判字第9號
- [ ] `src/data/opinions.ts:133` 113年憲判字第9號
- [ ] `src/data/opinions.ts:146` 113年憲判字第9號
- [ ] `src/data/opinions.ts:159` 113年憲判字第9號
- [ ] `src/data/opinions.ts:172` 113年憲判字第9號
- [ ] `src/data/opinions.ts:185` 113年憲判字第9號
- [ ] `src/data/opinions.ts:198` 113年憲判字第9號
- [ ] `src/data/opinions.ts:211` 113年憲判字第9號
- [ ] `src/data/opinions.ts:224` 113年憲判字第9號
- [ ] `src/data/opinions.ts:237` 113年憲判字第9號
- [ ] `src/data/quizzes/controversy.ts:73` 憲法法庭隨後在 113 年憲判字第 9 號判決中宣告國會擴權法案多項核心條文違憲——但這個判決也激化了國會多數對法庭本身的反擊。
- [ ] `src/data/history.json:606` 113年憲判字第9號
- [ ] `src/app/opinion-lazybag/page.tsx:29` 113年憲判字第9號——法庭如何逐條論理，而非投票表決。
- [ ] `src/app/opinion-lazybag/page.tsx:6` 以決策流程圖呈現憲法法庭如何審理113年憲判字第9號——理解合議制的論理過程。
- [ ] `src/app/present/page.tsx:19` 113年憲判字第9號
- [ ] `src/components/home/LazybagCtaSection.tsx:23` 113年憲判字第9號——看法庭如何逐條論理。

### 114年憲判字第1號【憲法訴訟法修正案】（2025-12-19）

- [ ] `src/data/controversy-timeline.ts:226` 114年憲判字第1號判決
- [ ] `src/data/controversy-timeline.ts:228` 憲法法庭就《憲法訴訟法》修正案本案作成判決（114年憲判字第1號），僅5位大法官參與，3位大法官（蔡宗珍、楊惠欽、朱富美）拒絕參與。
- [ ] `src/data/controversy-timeline.ts:228` 憲法訴訟法第 30 條第 2 項的 10 人參與評議下限，已由 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力。
- [ ] `src/data/quizzes/controversy.ts:87` 該下限已由 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力，本題問的是當時的規定。
- [ ] `src/data/quizzes/controversy.ts:119` 2025 年 12 月，憲法法庭作成 114 年憲判字第 1 號判決，宣告《憲法訴訟法》修正案違憲。
- [ ] `src/data/quizzes/controversy.ts:128` 憲法訴訟法第 30 條第 2 項的 10 人參與評議下限，已由 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力。
- [ ] `src/data/quizzes/pending.ts:97` 該下限已由 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力，現行門檻回到憲法訴訟法第 30 條第 1 項的比例計算。
- [ ] `src/data/quizzes/perspectives.ts:89` 蘇彥圖教授對 114 年憲判字第 1 號判決的評價是什麼？
- [ ] `src/data/ruling-threshold.ts:52` 114 年憲判字第 1 號
- [ ] `src/data/ruling-threshold.ts:66` 憲法訴訟法第 30 條第 2 項的 10 人參與評議下限，已由 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力
- [ ] `src/data/ruling-threshold.ts:71` 憲法訴訟法第 30 條第 2 項（參與評議之大法官不得低於 10 人、作成違憲宣告之同意人數不得低於 9 人），已由 114 年憲判字第 1 號宣告違憲，自公告日 2025-12-…
- [ ] `src/data/ruling-threshold.ts:81` 該下限已由 114 年憲判字第 1 號宣告違憲，自 2025-12-19 起失其效力
- [ ] `src/data/discussions.json:5` 憲法法庭，歡迎回來——兼評114年憲判字第1號判決
- [ ] `src/data/discussions.json:8` 114年憲判字第1號判決是台灣憲政制度的不自殺聲明。
- [ ] `src/data/discussions.json:46` 黃丞儀老師指出，憲法法庭在114年憲判字第1號判決的分裂，反映了台灣社會近年來的政治認識兩極化
- [ ] `src/data/discussions.json:53` 〈114年憲判字第1號判決〉的艱難：一個初步的評論
- [ ] `src/data/discussions.json:58` 蘇彥圖老師帶我們思考114年憲判字第1號判決背後的難題
- [ ] `src/data/history.json:638` 114年憲判字第1號
- [ ] `src/app/controversy-timeline/page.tsx:63` 本頁內容參考張娟芬〈憲法法庭，歡迎回來——兼評114年憲判字第1號判決〉（鏡週刊，2026年1月14日）及公開資料整理而成。
- [ ] `src/components/future/RulingThresholdNote.tsx:56` 114 年 1 月 23 日修法增訂的憲法訴訟法第 30 條第 2 項（參與評議之大法官不得低於 10 人、作成違憲宣告之同意人數不得低於 9 人），已由 114 年憲判字第 1 …
- [ ] `src/components/future/RulingThresholdNote.tsx:56` 該期間內憲法法庭只作成一則判決，就是宣告這一項違憲的 114 年憲判字第 1 號本身；
- [ ] `src/components/future/RulingThresholdNote.tsx:70` 114 年憲判字第 1 號判決全文

### 115年憲判字第1號【辯護人對羈押處分提起準抗告案】（2026-01-02）

- [ ] `src/data/future.ts:478` 115 年憲判字第 1 號

### 115年憲判字第2號【違反全民健康保險法扣費義務之裁罰案】（2026-02-06）

- [ ] `src/data/future.ts:479` 115 年憲判字第 2 號

### 115年憲判字第3號【少年保護事件禁止再行移送案】（2026-03-27）

- [ ] `src/data/future.ts:480` 115 年憲判字第 3 號

### 115年憲判字第4號【刑事訴訟上訴不可分原則適用範圍案】（2026-05-08）

- [ ] `src/data/future.ts:481` 115 年憲判字第 4 號

### 115年憲判字第5號【犯最重本刑為死刑之罪的追訴權時效變更案】（2026-06-05）

- [ ] `src/data/future.ts:482` 115 年憲判字第 5 號

### 115年憲判字第6號【被害人為兒少之性犯罪追訴權時效案】（2026-08-14）

- [ ] `src/data/future.ts:483` 115 年憲判字第 6 號
- [ ] `src/components/future/RulingThresholdNote.tsx:56` 失效後憲法法庭已作成 6 則判決， 最近一則為 115 年憲判字第 6 號（115 年 8 月 14 日）。

### 釋字第1號（1949-01-06）

- [ ] `src/data/threshold-analysis.ts:244` 釋字第 1 號與第 2 號（皆 1949-01-06）早於該次修正，落在未取得的原始版之下，不在這份條文的涵蓋範圍內。

### 釋字第2號（1949-01-06）

- [ ] `src/data/threshold-analysis.ts:512` 釋字第 2 號（1949-01-06）與第 3 號（1952-05-21）之間相隔三年餘。

### 釋字第242號（1989-06-23）

- [ ] `src/data/history.json:14` 釋字第242號

### 釋字第261號（1990-06-21）

- [ ] `src/data/quizzes/rights.ts:88` 釋字第 261 號
- [ ] `src/data/history.json:30` 釋字第 261 號

### 釋字第365號（1994-09-23）

- [ ] `src/data/history.json:46` 釋字第 365 號

### 釋字第382號（1995-06-23）

- [ ] `src/data/quizzes/rights.ts:89` 釋字第 382 號
- [ ] `src/data/quizzes/rights.ts:95` 釋字第 382 號確立了學生在受到退學或類此處分時，有權提起行政爭訟，打破了「特別權力關係」的傳統觀念，保障了學生的訴訟權。
- [ ] `src/data/history.json:62` 釋字第 382 號

### 釋字第419號（1996-12-31）

- [ ] `src/data/history.json:78` 釋字第419號

### 釋字第445號（1998-01-23）

- [ ] `src/data/history.json:94` 釋字第445號
- [ ] `src/app/preview/page.tsx:30` 釋字第 445 號・確立集會遊行是受憲法保障的基本權利

### 釋字第490號（1999-10-01）

- [ ] `src/data/quizzes/rights.ts:90` 釋字第 490 號
- [ ] `src/data/history.json:110` 釋字第 490 號

### 釋字第499號（2000-03-24）

- [ ] `src/data/history.json:126` 釋字第499號

### 釋字第509號（2000-07-07）

- [ ] `src/data/history.json:142` 釋字第509號

### 釋字第520號（2001-01-15）

- [ ] `src/data/history.json:174` 釋字第520號

### 釋字第535號（2001-12-14）

- [ ] `src/data/quizzes/rights.ts:60` 釋字第 535 號限制了警察的什麼行為？
- [ ] `src/data/quizzes/rights.ts:69` 釋字第 535 號要求警察臨檢必須有法律依據，不得任意攔查人民，保障了人民的人身自由與行動自由。
- [ ] `src/data/history.json:158` 釋字第535號

### 釋字第558號（2003-04-18）

- [ ] `src/data/quizzes/rights.ts:91` 釋字第 558 號
- [ ] `src/data/history.json:190` 釋字第 558 號

### 釋字第567號（2003-10-24）

- [ ] `src/data/history.json:206` 釋字第567號

### 釋字第582號（2004-07-23）

- [ ] `src/data/history.json:222` 釋字第 582 號

### 釋字第585號（2004-12-15）

- [ ] `src/data/history.json:238` 釋字第585號

### 釋字第603號（2005-09-28）

- [ ] `src/data/quizzes/rights.ts:36` 釋字第 603 號
- [ ] `src/data/quizzes/rights.ts:82` 釋字第 603 號宣告戶籍法強制按捺指紋的規定違憲，確立了人民的「資訊隱私權」——每個人有權決定自己的個人資料是否、如何被蒐集與利用。
- [ ] `src/data/history.json:254` 釋字第603號

### 釋字第609號（2006-01-27）

- [ ] `src/data/history.json:270` 釋字第609號

### 釋字第632號（2007-08-15）

- [ ] `src/data/history.json:286` 釋字第632號

### 釋字第644號（2008-06-20）

- [ ] `src/data/history.json:302` 釋字第644號

### 釋字第645號（2008-07-11）

- [ ] `src/data/history.json:318` 釋字第645號

### 釋字第689號（2011-07-29）

- [ ] `src/data/history.json:334` 釋字第689號

### 釋字第708號（2013-02-06）

- [ ] `src/data/history.json:350` 釋字第708號

### 釋字第710號（2013-07-05）

- [ ] `src/data/history.json:366` 釋字第710號

### 釋字第748號（2017-05-24）

- [ ] `src/data/quizzes/rights.ts:37` 釋字第 748 號
- [ ] `src/data/quizzes/rights.ts:43` 釋字第 748 號宣告民法未保障同性婚姻違憲，使台灣成為亞洲第一個同性婚姻合法化的國家。
- [ ] `src/data/history.json:382` 釋字第 748 號

### 釋字第766號（2018-07-13）

- [ ] `src/data/history.json:398` 釋字第766號

### 釋字第781號（2019-08-23）

- [ ] `src/data/history.json:414` 釋字第781~783號

### 釋字第782號（2019-08-23）

- [ ] `src/data/history.json:414` 釋字第781~783號

### 釋字第783號（2019-08-23）

- [ ] `src/data/history.json:414` 釋字第781~783號

### 釋字第791號（2020-05-29）

- [ ] `src/data/quizzes/rights.ts:38` 釋字第 791 號
- [ ] `src/data/quizzes/rights.ts:47` 釋字第 791 號宣告刑法通姦罪違憲，主要理由是什麼？
- [ ] `src/data/history.json:446` 釋字第791號

### 釋字第793號（2020-08-28）

- [ ] `src/data/history.json:430` 釋字第793號

### 釋字第803號（2021-05-07）

- [ ] `src/data/history.json:478` 釋字第803號

### 釋字第807號（2021-08-20）

- [ ] `src/data/history.json:462` 釋字第807號

## L3 現在式的法律狀態（18 句）

句中有「目前／至今／仍」等詞，且講的是法律或法庭的狀態。判斷它在今日是否仍為真。
已排除 `scripts/check-voided-floor.mjs` 的門檻句（`066` 的網子）。

- [ ] `src/data/controversy-timeline.ts:95`（PR）在持續數日的抗議聲中，立法院仍以多數表決三讀通過《立法院職權行使法》修正案與《刑法》增訂藐視國會罪條文。
- [ ] `src/data/controversy-timeline.ts:215`（PR）更多大法官任期屆滿，新提名人持續遭杯葛，憲法法庭長期維持最低運作人數。
- [ ] `src/data/opinions.ts:108`（PR）認為現行法律修正程序合憲，法庭人數不足屬政治問題而非法律問題。
- [ ] `src/data/quizzes/pending.ts:35`（PR）目前憲法法庭有多少件待審案件積壓？
- [ ] `src/data/quizzes/pending.ts:44`（PR）憲法法庭目前積壓約 473 件以上待審案件。
- [ ] `src/data/quizzes/pending.ts:49`（PR）以下哪一類案件「不是」目前在憲法法庭等待審理的真實案件類型？
- [ ] `src/data/quizzes/pending.ts:58`（PR）勞工加班工時、性侵害追訴時效、原住民狩獵權都是目前真實等待憲法法庭審理的案件類型。
- [ ] `src/data/quizzes/pending.ts:58`（PR）核能發電廠運轉許可爭議並非目前待審案件。
- [ ] `src/data/quizzes/pending.ts:71`（PR）但因 2024 年 10 月有 7 位大法官任期屆滿離任，加上立法院兩次否決總統提名，目前僅剩 8 位在任大法官，遠低於法定員額。
- [ ] `src/data/quizzes/pending.ts:88`（PR）目前實際出席參與憲法法庭評議的大法官有幾位？
- [ ] `src/data/quizzes/pending.ts:97`（PR）雖然目前有 8 位在任大法官，但蔡宗珍、楊惠欽、朱富美三位大法官拒絕出席，實際參與評議的只有 5 位。
- [ ] `src/data/discussions.json:178`（改試算表）台灣憲法法庭現在面臨的危機並不是特殊案例，波蘭也發生過很類似的狀況，讓王鼎棫老師為你細說分明！
- [ ] `src/app/future/page.tsx:80`（PR）立法院未行使新任大法官人事同意權，目前僅存 5 名大法官參與評議。
- [ ] `src/app/future/page.tsx:82`（PR）473 件案件仍在待審。
- [ ] `src/app/future/page.tsx:206`（PR）以目前 473 件待審案件計算，即使大法官全員到位， 消化這批積壓也需要時間。
- [ ] `src/app/past/thresholds/page.tsx:60`（PR）現行憲法訴訟法與其歷史條文為 pcode A0030159；
- [ ] `src/app/present/page.tsx:20`（PR）總統於3月21日再度送出提名咨文，立法院於7月25日投票否決全部人選，大法官缺額持續無法補齊。
- [ ] `src/components/opinion-lazybag/StanceSpectrum.tsx:30`（PR）修法整體方向雖有民主正當性考量，但個別條文仍須通過比例原則與明確性審查。

## L4 全站紀年盤點

逐檔列出民國與西元紀年各幾處（已扣除判決字號）。全站用哪一套是編輯決定，待 captain 拍板。
`M5` 只管同一段內的混用；本表管全站的一致性。

| 檔 | 民國 | 西元 | 民國年出現處（行） |
|---|---|---|---|
| `src/data/controversy-timeline.ts` | 0 | 28 |  |
| `src/data/future.ts` | 7 | 2 | 478, 479, 480, 481, 482, 483 |
| `src/data/quizzes/controversy.ts` | 0 | 9 |  |
| `src/data/quizzes/pending.ts` | 0 | 6 |  |
| `src/data/ruling-threshold.ts` | 0 | 3 |  |
| `src/data/threshold-analysis.ts` | 2 | 30 | 238 |
| `src/data/history.json` | 1 | 0 | 125 |
| `src/app/controversy-timeline/page.tsx` | 0 | 5 |  |
| `src/app/future/page.tsx` | 0 | 3 |  |
| `src/app/past/page.tsx` | 0 | 2 |  |
| `src/app/past/thresholds/page.tsx` | 2 | 3 | 58 |
| `src/app/preview/page.tsx` | 0 | 1 |  |
| `src/app/quiz/controversy/page.tsx` | 0 | 2 |  |
| `src/components/future/JusticeTermTimeline.tsx` | 0 | 3 |  |
| `src/components/future/RulingThresholdNote.tsx` | 4 | 1 | 56 |
| `src/components/threshold-analysis/EraComparisonStrip.tsx` | 0 | 8 |  |
| `src/components/threshold-analysis/ThresholdCaseAnalysis.tsx` | 0 | 2 |  |
| `src/components/threshold-analysis/ThresholdChart.tsx` | 0 | 4 |  |
| `src/components/threshold-analysis/ThresholdTooltip.tsx` | 0 | 2 |  |

## H 逐檔閱讀清單（67 檔，約 22,531 字）

因果敘述（H1）、法律效果的精確度（H2）、語氣與立場（H3）沒有表面特徵可定位，只能逐檔讀。
公開頁面（`PUBLIC_PAGES`：/、/controversy-timeline、/future）用到的檔排在前面。
「⟦⟧」欄是抽取時無法代入的插值數。那些位置的文字機器看不到，M 層也看不到，要讀原始碼。

| 讀完 | 檔 | 字數 | 公開 | 修正途徑 | ⟦⟧ | 用到它的路由 |
|---|---|---|---|---|---|---|
| [ ] | `src/data/controversy-timeline.ts` | 2747 | 是 | PR |  | /controversy-timeline |
| [ ] | `src/data/future.ts` | 1166 | 是 | PR |  | / /future |
| [ ] | `src/data/opinions.ts` | 514 | 是 | PR |  | / |
| [ ] | `src/app/future/page.tsx` | 430 | 是 | PR |  | /future |
| [ ] | `src/components/future/RulingThresholdNote.tsx` | 359 | 是 | PR | 1 | /future |
| [ ] | `src/app/controversy-timeline/page.tsx` | 354 | 是 | PR |  | /controversy-timeline |
| [ ] | `src/data/ruling-threshold.ts` | 191 | 是 | PR |  | / /controversy-timeline /future /quiz /quiz/controversy /quiz/pending |
| [ ] | `src/app/page.tsx` | 149 | 是 | PR |  | / |
| [ ] | `src/components/home/TrackCards.tsx` | 135 | 是 | PR |  | / |
| [ ] | `src/app/layout.tsx` | 127 | 是 | PR |  | / /about /controversy-timeline /future /opinion-lazybag /past /past/thresholds /present /present/[id] /preview /quiz /quiz/controversy /quiz/pending /quiz/perspectives /quiz/rights |
| [ ] | `src/components/Footer.tsx` | 113 | 是 | PR |  | / /about /controversy-timeline /future /opinion-lazybag /past /past/thresholds /present /present/[id] /preview /quiz /quiz/controversy /quiz/pending /quiz/perspectives /quiz/rights |
| [ ] | `src/components/future/JusticeTermTimeline.tsx` | 74 | 是 | PR | 3 | /future |
| [ ] | `src/app/future/layout.tsx` | 55 | 是 | PR |  | /future |
| [ ] | `src/components/future/BottleneckFunnel.tsx` | 53 | 是 | PR | 3 | /future |
| [ ] | `src/components/ComingSoon.tsx` | 49 | 是 | PR |  | / /about /controversy-timeline /future /opinion-lazybag /past /past/thresholds /present /present/[id] /preview /quiz /quiz/controversy /quiz/pending /quiz/perspectives /quiz/rights |
| [ ] | `src/components/future/RightsCalculator.tsx` | 45 | 是 | PR | 1 | /future |
| [ ] | `src/components/home/LazybagCtaSection.tsx` | 44 | 是 | PR |  | / |
| [ ] | `src/components/future/JusticeSeatGrid.tsx` | 29 | 是 | PR | 1 | /future |
| [ ] | `src/components/future/JusticeCountdown.tsx` | 28 | 是 | PR |  | /future |
| [ ] | `src/components/Navbar.tsx` | 26 | 是 | PR |  | / /about /controversy-timeline /future /opinion-lazybag /past /past/thresholds /present /present/[id] /preview /quiz /quiz/controversy /quiz/pending /quiz/perspectives /quiz/rights |
| [ ] | `src/components/controversy-timeline/TimelineNode.tsx` | 24 | 是 | PR |  | /controversy-timeline |
| [ ] | `src/components/future/CaseCard.tsx` | 19 | 是 | PR | 2 | /future |
| [ ] | `src/components/controversy-timeline/JusticeStanceTooltip.tsx` | 5 | 是 | PR | 1 | /controversy-timeline |
| [ ] | `src/data/history.json` | 4419 |  | 改試算表 |  | /past |
| [ ] | `src/data/discussions.json` | 1902 |  | 改試算表 |  | /present /present/[id] |
| [ ] | `src/data/threshold-analysis.ts` | 1214 |  | PR |  | /past/thresholds |
| [ ] | `src/components/opinion-lazybag/DecisionFlowchart.tsx` | 1021 |  | PR | 2 | /opinion-lazybag |
| [ ] | `src/data/quizzes/controversy.ts` | 809 |  | PR |  | /quiz /quiz/controversy |
| [ ] | `src/data/quizzes/perspectives.ts` | 732 |  | PR |  | /quiz /quiz/perspectives |
| [ ] | `src/data/quizzes/pending.ts` | 640 |  | PR |  | /quiz /quiz/pending |
| [ ] | `src/data/quizzes/rights.ts` | 615 |  | PR |  | /quiz /quiz/rights |
| [ ] | `src/components/opinion-lazybag/StanceSpectrum.tsx` | 580 |  | PR |  | （沒有路由 import 它，讀者目前看不到） |
| [ ] | `src/app/past/thresholds/page.tsx` | 532 |  | PR |  | /past/thresholds |
| [ ] | `src/app/past/page.tsx` | 459 |  | PR | 2 | /past |
| [ ] | `src/app/present/page.tsx` | 458 |  | PR | 4 | /present |
| [ ] | `src/app/preview/page.tsx` | 314 |  | PR |  | /preview |
| [ ] | `src/components/threshold-analysis/EraComparisonStrip.tsx` | 222 |  | PR | 2 | /past/thresholds |
| [ ] | `src/components/opinion-lazybag/OpinionLazybag.tsx` | 159 |  | PR | 1 | （沒有路由 import 它，讀者目前看不到） |
| [ ] | `src/app/present/[id]/page.tsx` | 126 |  | PR | 3 | /present/[id] |
| [ ] | `src/app/quiz/perspectives/page.tsx` | 123 |  | PR |  | /quiz/perspectives |
| [ ] | `src/app/quiz/rights/page.tsx` | 119 |  | PR |  | /quiz/rights |
| [ ] | `src/components/PresentDetail.tsx` | 117 |  | PR |  | /present/[id] |
| [ ] | `src/app/quiz/pending/page.tsx` | 115 |  | PR |  | /quiz/pending |
| [ ] | `src/app/quiz/controversy/page.tsx` | 108 |  | PR |  | /quiz/controversy |
| [ ] | `src/data/contributors.ts` | 101 |  | PR |  | /about |
| [ ] | `src/app/opinion-lazybag/page.tsx` | 99 |  | PR |  | /opinion-lazybag |
| [ ] | `src/components/threshold-analysis/ThresholdTooltip.tsx` | 99 |  | PR | 2 | /past/thresholds |
| [ ] | `src/components/threshold-analysis/OchreBandFactors.tsx` | 97 |  | PR |  | /past/thresholds |
| [ ] | `src/components/threshold-analysis/ThresholdChart.tsx` | 92 |  | PR | 5 | /past/thresholds |
| [ ] | `src/app/quiz/page.tsx` | 91 |  | PR |  | /quiz |
| [ ] | `src/components/threshold-analysis/ThresholdCaseAnalysis.tsx` | 82 |  | PR |  | /past/thresholds |
| [ ] | `src/components/quiz/QuizResult.tsx` | 75 |  | PR | 1 | /quiz/controversy /quiz/pending /quiz/perspectives /quiz/rights |
| [ ] | `src/app/about/page.tsx` | 72 |  | PR |  | /about |
| [ ] | `src/components/threshold-analysis/SeriesBoundaryNote.tsx` | 57 |  | PR | 2 | /past/thresholds |
| [ ] | `src/components/opposing-views/OpposingViewsSection.tsx` | 48 |  | PR |  | /present/[id] |
| [ ] | `src/components/opinion-lazybag/OpinionScatterPlot.tsx` | 18 |  | PR | 3 | （沒有路由 import 它，讀者目前看不到） |
| [ ] | `src/components/SharedPresent.tsx` | 17 |  | PR |  | /present /present/[id] |
| [ ] | `src/components/opposing-views/OpposingViewCard.tsx` | 12 |  | PR |  | /present/[id] |
| [ ] | `src/components/about/ContributorGrid.tsx` | 9 |  | PR | 2 | /about |
| [ ] | `src/components/threshold-analysis/ThresholdBand.tsx` | 9 |  | PR | 2 | /past/thresholds |
| [ ] | `src/components/opinion-lazybag/OpinionTable.tsx` | 8 |  | PR |  | （沒有路由 import 它，讀者目前看不到） |
| [ ] | `src/components/quiz/QuizQuestion.tsx` | 8 |  | PR |  | /quiz/controversy /quiz/pending /quiz/perspectives /quiz/rights |
| [ ] | `src/components/opposing-views/EditorialAnnotation.tsx` | 4 |  | PR |  | /present/[id] |
| [ ] | `src/components/quiz/QuizProgress.tsx` | 4 |  | PR | 1 | /quiz/controversy /quiz/pending /quiz/perspectives /quiz/rights |
| [ ] | `src/components/threshold-analysis/ChartAxes.tsx` | 4 |  | PR |  | /past/thresholds |
| [ ] | `src/components/opinion-lazybag/OpinionTooltip.tsx` | 3 |  | PR | 1 | （沒有路由 import 它，讀者目前看不到） |
| [ ] | `src/components/opinion-lazybag/DimensionSelector.tsx` | 2 |  | PR |  | （沒有路由 import 它，讀者目前看不到） |
