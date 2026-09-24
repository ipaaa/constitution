/**
 * 解釋門檻與案件數量的資料模組。
 *
 * 規格見 docs/constitution-features/012-threshold-case-analysis.md。
 *
 * 本檔是**手寫**資料模組，與 src/data/discussions.json、src/data/history.json 無關。
 * 那兩個 JSON 是試算表同步的產物，不可手改。本檔的來源是
 * cons.judicial.gov.tw（案件計數）與 law.moj.gov.tw（門檻條文），
 * 由 scripts/fetch-interpretation-counts.mjs 人工抓取後人工審閱寫入。
 *
 * 三條不可違反的規則：
 *   1. 門檻時期的起訖日一律用法規公布日，不用會議記錄的口述年份。
 *   2. 不寫因果。本檔只放可查證的計數、可查證的條文，以及明寫不確定性的候選因素。
 *   3. 規則期的門檻數字沒有第一手依據，不得填。見 D1。
 *
 * ⚠️ 2026-09-23 更正：**上面第 3 條的前提已不成立，該條不再適用。**
 * 當時只查了 pcode A0030159，它的歷史條文只回溯到 1958-07-21。
 * 《司法院大法官會議規則》在全國法規資料庫另有獨立的廢止法規紀錄 **pcode A0030300**，
 * 全文 21 條可取得，第 12 條已逐字核對並填入 ERAS，evidence 為 'primary-source'。
 * 原句保留，避免看起來一直都對。
 *
 * 第 3 條由下面這條取代：
 *   3'. 規則期的條文取自 A0030300 的 1952-04-16 修正版，帶三項限制（RULES_ERA_CAVEATS），
 *       **三項都必須顯示在站上**。仍然不得寫出「1/2」—— 實際條文是
 *       「三分之二以上出席＋過半數之同意」，寫 1/2 會是錯的。
 */

/** 一年的案件計數。series 標明是哪個序列，兩個序列不可相加。 */
export interface YearCount {
  year: number;
  count: number;
  series: 'interpretation' | 'judgment';  // 釋字 / 憲判字
  /** 該年資料是否已完整。抓取當年為 false。 */
  complete: boolean;
}

/** 一段門檻時期。start/end 為法規公布日，不是會議口述年份。 */
export interface ThresholdEra {
  id: 'rules' | 'three-quarters' | 'two-thirds' | 'current';
  /** 圖上與對照條顯示的名稱，例：「雙四分之三」 */
  label: string;
  /** 門檻的白話一句話，例：「總額 3/4 出席，出席人 3/4 同意」 */
  ruleSummary: string;
  /** 法規名稱，例：「司法院大法官會議法」 */
  statute: string;
  /** 法規公布日 ISO。色帶起點。 */
  effectiveFrom: string;
  /** 下一期公布日 ISO，最後一期為 null。色帶終點。 */
  effectiveTo: string | null;
  /** 條號，例：「第 13 條第 1 項」。無第一手依據時為 null。 */
  article: string | null;
  /** 條文原文。無第一手依據時為 null，此時 UI 必須顯示未確認標記。 */
  quotedText: string | null;
  /** 第一手來源 URL。無則為 null。 */
  sourceUrl: string | null;
  /** 條文依據的取得狀態。'unverified' 時 UI 必須顯示未確認標記。 */
  evidence: 'primary-source' | 'unverified';
  /**
   * 條文依據的但書。每一項都是已查證的限制，**UI 必須逐項顯示，不得摺疊或省略**。
   *
   * 「拿到條文」不等於「條文涵蓋整段」。規則期就是這種情況：
   * 取得的是修正版，不是該期起點的原始版，因此前兩筆解釋不在這份條文之下。
   * 沒有但書的時期不帶這個欄位。
   */
  caveats?: readonly StatuteCaveat[];
  /** 色帶顏色 token，見設計文件的 `## 視覺` */
  colorToken: string;
}

/** 一條條文但書。needsRuling 非 null 時，UI 必須顯示待確認標記與拍板者。 */
export interface StatuteCaveat {
  id: string;
  /** 已查證的限制本身。只寫事實，不下結論。 */
  text: string;
  /** 誰有權把這項限制解除或作成解讀。null = 本頁資料即可斷言，無須外部拍板。 */
  needsRuling: 'legal-reviewer' | null;
}

/**
 * 一段法規區間，形狀同 ThresholdEra 但不受四期的 id 限制。
 * 目前只有 INTERIM_SEGMENT 用到。
 */
export type StatuteSegment = Omit<ThresholdEra, 'id'> & { id: string };

/** 土黃色區起伏的一項可能因素。每一項都必須交代依據與拍板者。 */
export interface FactorNote {
  id: string;
  /** 可查證的事實陳述。不得寫成因果。 */
  claim: string;
  /** 依據。'data' = 本票抓取的計數；'statute' = 已引條文；'none' = 尚無依據 */
  basis: 'data' | 'statute' | 'none';
  /** 依據的具體出處。basis 為 'none' 時為 null。 */
  basisRef: string | null;
  /** 這項能不能解釋起伏。必須明寫不確定的是什麼。 */
  uncertainty: string;
  /** 誰有權把它從候選改成結論。null = 本票的資料即可支持，無須外部拍板。 */
  needsRuling: 'captain' | 'legal-reviewer' | 'external-source' | null;
}

const LAW_OLD_VER = (lnndate: string) =>
  `https://law.moj.gov.tw/LawClass/LawOldVer.aspx?pcode=A0030159&lnndate=${lnndate}&lser=001`;

/** 現行憲法訴訟法全文。 */
export const LAW_CURRENT_URL = 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0030159';

/**
 * 逐年案件計數，1949–2026。
 *
 * 釋字 1949–2021 共 813 筆，取自各號明細頁的「發布日期」西元年。
 * 憲判字 2022–2026 取自 judcurrentNew1.aspx?fid=38 錨點的民國年 + 1911。
 *
 * 1950、1951 兩個 0 件年必須保留。刪掉它們會讓 x 軸出現看不見的斷點。
 * 兩個序列不可相加，也不可接成同一條曲線。
 */
export const YEARS: readonly YearCount[] = [
  { year: 1949, count: 2, series: 'interpretation', complete: true },
  { year: 1950, count: 0, series: 'interpretation', complete: true },
  { year: 1951, count: 0, series: 'interpretation', complete: true },
  { year: 1952, count: 10, series: 'interpretation', complete: true },
  { year: 1953, count: 17, series: 'interpretation', complete: true },
  { year: 1954, count: 14, series: 'interpretation', complete: true },
  { year: 1955, count: 13, series: 'interpretation', complete: true },
  { year: 1956, count: 14, series: 'interpretation', complete: true },
  { year: 1957, count: 9, series: 'interpretation', complete: true },
  { year: 1958, count: 2, series: 'interpretation', complete: true },
  { year: 1959, count: 3, series: 'interpretation', complete: true },
  { year: 1960, count: 4, series: 'interpretation', complete: true },
  { year: 1961, count: 5, series: 'interpretation', complete: true },
  { year: 1962, count: 6, series: 'interpretation', complete: true },
  { year: 1963, count: 4, series: 'interpretation', complete: true },
  { year: 1964, count: 2, series: 'interpretation', complete: true },
  { year: 1965, count: 5, series: 'interpretation', complete: true },
  { year: 1966, count: 8, series: 'interpretation', complete: true },
  { year: 1967, count: 4, series: 'interpretation', complete: true },
  { year: 1968, count: 3, series: 'interpretation', complete: true },
  { year: 1969, count: 2, series: 'interpretation', complete: true },
  { year: 1970, count: 2, series: 'interpretation', complete: true },
  { year: 1971, count: 2, series: 'interpretation', complete: true },
  { year: 1972, count: 3, series: 'interpretation', complete: true },
  { year: 1973, count: 3, series: 'interpretation', complete: true },
  { year: 1974, count: 4, series: 'interpretation', complete: true },
  { year: 1975, count: 3, series: 'interpretation', complete: true },
  { year: 1976, count: 3, series: 'interpretation', complete: true },
  { year: 1977, count: 4, series: 'interpretation', complete: true },
  { year: 1978, count: 4, series: 'interpretation', complete: true },
  { year: 1979, count: 5, series: 'interpretation', complete: true },
  { year: 1980, count: 6, series: 'interpretation', complete: true },
  { year: 1981, count: 6, series: 'interpretation', complete: true },
  { year: 1982, count: 6, series: 'interpretation', complete: true },
  { year: 1983, count: 6, series: 'interpretation', complete: true },
  { year: 1984, count: 8, series: 'interpretation', complete: true },
  { year: 1985, count: 8, series: 'interpretation', complete: true },
  { year: 1986, count: 11, series: 'interpretation', complete: true },
  { year: 1987, count: 9, series: 'interpretation', complete: true },
  { year: 1988, count: 13, series: 'interpretation', complete: true },
  { year: 1989, count: 16, series: 'interpretation', complete: true },
  { year: 1990, count: 22, series: 'interpretation', complete: true },
  { year: 1991, count: 18, series: 'interpretation', complete: true },
  { year: 1992, count: 22, series: 'interpretation', complete: true },
  { year: 1993, count: 21, series: 'interpretation', complete: true },
  { year: 1994, count: 37, series: 'interpretation', complete: true },
  { year: 1995, count: 23, series: 'interpretation', complete: true },
  { year: 1996, count: 27, series: 'interpretation', complete: true },
  { year: 1997, count: 24, series: 'interpretation', complete: true },
  { year: 1998, count: 28, series: 'interpretation', complete: true },
  { year: 1999, count: 27, series: 'interpretation', complete: true },
  { year: 2000, count: 21, series: 'interpretation', complete: true },
  { year: 2001, count: 17, series: 'interpretation', complete: true },
  { year: 2002, count: 18, series: 'interpretation', complete: true },
  { year: 2003, count: 16, series: 'interpretation', complete: true },
  { year: 2004, count: 17, series: 'interpretation', complete: true },
  { year: 2005, count: 20, series: 'interpretation', complete: true },
  { year: 2006, count: 15, series: 'interpretation', complete: true },
  { year: 2007, count: 13, series: 'interpretation', complete: true },
  { year: 2008, count: 18, series: 'interpretation', complete: true },
  { year: 2009, count: 16, series: 'interpretation', complete: true },
  { year: 2010, count: 14, series: 'interpretation', complete: true },
  { year: 2011, count: 12, series: 'interpretation', complete: true },
  { year: 2012, count: 12, series: 'interpretation', complete: true },
  { year: 2013, count: 9, series: 'interpretation', complete: true },
  { year: 2014, count: 10, series: 'interpretation', complete: true },
  { year: 2015, count: 8, series: 'interpretation', complete: true },
  { year: 2016, count: 9, series: 'interpretation', complete: true },
  { year: 2017, count: 16, series: 'interpretation', complete: true },
  { year: 2018, count: 14, series: 'interpretation', complete: true },
  { year: 2019, count: 14, series: 'interpretation', complete: true },
  { year: 2020, count: 12, series: 'interpretation', complete: true },
  { year: 2021, count: 14, series: 'interpretation', complete: true },
  { year: 2022, count: 20, series: 'judgment', complete: true },
  { year: 2023, count: 20, series: 'judgment', complete: true },
  { year: 2024, count: 11, series: 'judgment', complete: true },
  { year: 2025, count: 1, series: 'judgment', complete: true },
  { year: 2026, count: 6, series: 'judgment', complete: false },
];

/** 圖的 x 軸範圍。含 1950、1951 兩個 0 件年，不可略去刻度位。 */
export const CHART_FIRST_YEAR = 1949;
export const CHART_LAST_YEAR = 2026;

/** 釋字序列的第一筆與最末筆發布日。年均的分母以此為邊界。 */
export const INTERPRETATION_BOUNDS = { first: '1949-01-06', last: '2021-12-24' } as const;

/** 憲法訴訟法施行日。解釋制度在此終止，改作成判決。不是門檻調整點。 */
export const SERIES_BREAK_DATE = '2022-01-04';

/**
 * 規則期沒有被已取得條文涵蓋的解釋。
 *
 * 釋字第 1、2 號同日作成（1949-01-06），早於 1952-04-16 的修正。
 * 已取得的第 12 條是修正**後**的版本，因此這兩筆不在該條文之下。
 * 數字由 tests/fixtures/interpretation-dates.json 重算驗證：
 * 規則期 79 筆之中，發布日早於 1952-04-16 的恰為這兩筆，其餘 77 筆自釋字第 3 號
 * （1952-05-21）起算。
 */
export const RULES_ERA_UNCOVERED = {
  /** 落在未取得的 1948 原始版之下的釋字號。 */
  interpretationNumbers: [1, 2] as const,
  /** 這兩筆的發布日，同日。 */
  date: '1949-01-06',
  /** 已取得條文涵蓋的筆數。 */
  coveredCount: 77,
  /** 規則期總筆數。 */
  totalCount: 79,
  /** 修正日。已取得的版本是這一天之後的版本。 */
  amendedOn: '1952-04-16',
} as const;

/**
 * 規則期條文的三項限制。**三項都必須顯示在站上，不得省略。**
 *
 * 「拿到條文」不等於「這段時期都適用這份條文」，也不等於「這份條文的意思已經確定」。
 * 這三項就是這兩件事的具體內容。
 */
export const RULES_ERA_CAVEATS: readonly StatuteCaveat[] = [
  {
    id: 'c1-amended-version',
    text:
      '取得的是 1952-04-16 修正後的版本，不是 1948-09-16 的原始版。第 12 條正是該次修正的三條之一（另兩條為第 8、15 條）。全國法規資料庫的歷史條文只提供民國 90 年 4 月之後的版本，本規則的 LawOldVerList 回「查無資料」，因此原始版取不到。',
    needsRuling: null,
  },
  {
    id: 'c2-coverage-gap',
    text:
      '這份條文涵蓋規則期 79 筆中的 77 筆。釋字第 1 號與第 2 號（皆 1949-01-06）早於該次修正，落在未取得的原始版之下，不在這份條文的涵蓋範圍內。',
    needsRuling: null,
  },
  {
    id: 'c3-scope-wording',
    text:
      '條文寫的是「在中央政府所在地全體大法官」，與後續法規的「總額」「現有總額」不是同一個概念。本頁不解釋這個限定語，也不把它換算成人數。',
    needsRuling: 'legal-reviewer',
  },
];

/**
 * 四條門檻時期。
 *
 * effectiveFrom 一律為法規公布日，取自 law.moj.gov.tw 的沿革頁。**兩個 pcode 各管一段：**
 *   - `LawHistory.aspx?pcode=A0030159` —— 1958-07-21、1993-02-03、2025-01-23 三個公布日。
 *   - `LawHistory.aspx?pcode=A0030300` —— 規則期的 1948-09-16 制定公布日。
 * 查規則期要用 A0030300。**A0030159 對規則期是錯的 pcode**，它的歷史條文不含這一份。
 *
 * （這兩個網址原本各有一個 export。`LAW_HISTORY_URL` 只指 A0030159、沒有任何地方引用，
 * 註解還寫「規則期唯一能查到的一手記載」—— 該敘述已被 A0030300 推翻，pcode 對規則期也是錯的。
 * 留著等於給下一個維護者一個會指向錯法規的現成常數，因此移除，出處改記在這裡。）
 *
 * 規則期的條文一度標為 'unverified'：A0030159（現行憲法訴訟法）的歷史條文只回溯到
 * 1958-07-21，查不到《司法院大法官會議規則》。2026-09-23 於**另一個 pcode**
 * （A0030300，廢止法規）取得全文 21 條，第 12 條可查證，因此改為 'primary-source'。
 * 但取得的是 1952 修正版，限制見 RULES_ERA_CAVEATS —— **三項限制必須顯示在站上。**
 *
 * 設計文件 D1 的「不得在網站上寫出 1/2」**仍然成立，而且已證明是對的**：
 * 實際條文是「三分之二以上出席＋過半數之同意」，寫 1/2 會是錯的。
 */
export const ERAS: readonly ThresholdEra[] = [
  {
    id: 'rules',
    label: '規則期',
    // 照抄條文的用語。**不得把「在中央政府所在地全體大法官」換算成人數，也不得改寫成「總額」**
    // —— 那是兩個不同的概念，解讀未經法學背景者拍板。見 caveats 的 c3。
    ruleSummary: '在中央政府所在地全體大法官 2/3 以上出席，過半數同意',
    statute: '司法院大法官會議規則',
    effectiveFrom: '1948-09-16',
    effectiveTo: '1958-07-21',
    article: '第 12 條',
    quotedText:
      '大法官會議開會時，須有在中央政府所在地全體大法官三分之二以上出席。如為決議，須有在中央政府所在地全體大法官過半數之同意。可否同數，取決於主席。',
    // 本規則於民國 107-07-31 廢止，另有獨立的廢止法規 pcode A0030300。
    // A0030159（現行憲法訴訟法）的歷史條文只回溯到 1958-07-21，查不到這一份。
    sourceUrl: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0030300',
    evidence: 'primary-source',
    caveats: RULES_ERA_CAVEATS,
    colorToken: '#7C8B9A',
  },
  {
    id: 'three-quarters',
    label: '雙四分之三',
    ruleSummary: '總額 3/4 出席，出席人 3/4 同意',
    statute: '司法院大法官會議法',
    effectiveFrom: '1958-07-21',
    effectiveTo: '1993-02-03',
    article: '第 13 條第 1 項',
    quotedText:
      '大法官會議解釋憲法，應有大法官總額四分之三之出席，暨出席人四分之三之同意，方得通過。',
    sourceUrl: LAW_OLD_VER('19580721'),
    evidence: 'primary-source',
    colorToken: '#B8913C',
  },
  {
    id: 'two-thirds',
    label: '雙三分之二',
    ruleSummary: '現有總額 2/3 出席，出席人 2/3 同意',
    statute: '司法院大法官審理案件法',
    effectiveFrom: '1993-02-03',
    effectiveTo: '2022-01-04',
    article: '第 14 條第 1 項',
    quotedText:
      '大法官解釋憲法，應有大法官現有總額三分之二之出席，及出席人三分之二同意，方得通過。但宣告命令牴觸憲法時，以出席人過半數同意行之。',
    sourceUrl: LAW_OLD_VER('19930203'),
    evidence: 'primary-source',
    colorToken: '#4E8C6A',
  },
  {
    id: 'current',
    label: '10 人 9 人',
    ruleSummary: '參與評議不得低於 10 人，違憲宣告同意不得低於 9 人',
    statute: '憲法訴訟法',
    effectiveFrom: '2025-01-23',
    effectiveTo: null,
    article: '第 30 條第 2 項',
    quotedText:
      '前項參與評議之大法官人數不得低於十人。作成違憲之宣告時，同意違憲宣告之大法官人數不得低於九人。',
    sourceUrl: LAW_CURRENT_URL,
    evidence: 'primary-source',
    colorToken: '#9CA3AF',
  },
];

/**
 * 2022-01-04 到 2025-01-23 之間適用的門檻（設計文件的 D2）。
 *
 * 憲法訴訟法 2019-01-04 公布全文、自公布後三年施行；2023-06-21 的修正未動第 30 條；
 * 2025-01-23 才改為 10 人 9 人。本段已逐字抓取 2019-01-04 版第 30 條核對，
 * 因此**不標未確認**，但該段沒有釋字資料可計，與 current 期一樣畫斜線網底。
 *
 * 這一段不是 ThresholdEra。四期的 id 是設計文件定死的，加第五期會改動 AC-1 的斷言。
 */
export const INTERIM_SEGMENT: StatuteSegment = {
  id: 'interim-2022',
  label: '憲訴法原始門檻',
  ruleSummary: '現有總額 2/3 參與評議，現有總額過半數同意',
  statute: '憲法訴訟法',
  effectiveFrom: '2022-01-04',
  effectiveTo: '2025-01-23',
  article: '第 30 條',
  quotedText:
    '判決，除本法別有規定外，應經大法官現有總額三分之二以上參與評議，大法官現有總額過半數同意。',
  sourceUrl: LAW_OLD_VER('20190104'),
  evidence: 'primary-source',
  colorToken: '#9CA3AF',
};

/**
 * 跨年換法的兩個邊界年，該年件數按發布日切給兩期。
 *
 * 歸屬規則是逐筆按發布日，不是按年。理由見設計文件的 `### 已定的計算值`：
 * 1993 年 21 件之中只有釋字第 312 號（1993-01-29）在新法公布前，
 * 把整年歸給雙四分之三期會把 20 件算在錯的門檻底下。
 */
export const ERA_YEAR_SPLITS: readonly {
  year: number;
  /** 該年換法的日期。tooltip 要寫明這一天，否則讀者會以為整年適用同一個門檻。 */
  changeoverDate: string;
  parts: readonly { eraId: ThresholdEra['id']; count: number }[];
}[] = [
  {
    year: 1958,
    changeoverDate: '1958-07-21',
    parts: [
      { eraId: 'rules', count: 0 },
      { eraId: 'three-quarters', count: 2 },
    ],
  },
  {
    year: 1993,
    changeoverDate: '1993-02-03',
    parts: [
      { eraId: 'three-quarters', count: 1 },
      { eraId: 'two-thirds', count: 20 },
    ],
  },
];

/** 一年的日數。年均的分母換算用。 */
export const DAYS_PER_YEAR = 365.2425;

/**
 * 每期與釋字資料範圍（1949-01-06 至 2021-12-24）交集的日數。
 *
 * **這三個數字是設計決定，UI 不得自行推算。** 自行推算會讓四捨五入漂移。
 * 雙三分之二期止於釋字序列終點 2021-12-24，不是憲法訴訟法施行日
 * —— 之後沒有釋字可計，把空白期算進分母會壓低年均。
 * current 期為 null：該期落在釋字序列結束之後，沒有資料可算。
 */
export const ERA_SPAN_DAYS: Readonly<Record<ThresholdEra['id'], number | null>> = {
  rules: 3483,            // 1949-01-06 → 1958-07-21
  'three-quarters': 12616, // 1958-07-21 → 1993-02-03
  'two-thirds': 10552,     // 1993-02-03 → 2021-12-25
  current: null,
};

/** EraComparisonStrip 的一格。數字全部由 YEARS 推導，不寫死。 */
export interface EraStat {
  era: ThresholdEra;
  /** 該期的年均件數。無資料期為 null。 */
  meanPerYear: number | null;
  /** 該期的釋字件數。無資料期為 0。 */
  totalCount: number;
  /** 該期與釋字資料範圍交集的年數。無資料期為 0。 */
  yearSpan: number;
  /** 相對前一期的倍率。第一期與無資料期為 null。未四捨五入。 */
  ratioToPrevious: number | null;
}

/**
 * 由 YEARS 推導每期的件數與年均。
 *
 * 年份完全落在某期之內的，整年計入該期；ERA_YEAR_SPLITS 列出的邊界年
 * 改用該表的切分。憲判字（series === 'judgment'）一律不計入任何期。
 *
 * 倍率先用未四捨五入的年均相除，再由 UI 進位顯示。
 * 先進位再相除會讓第二個倍率從 2.57 變成 2.58。
 */
export function deriveEraStats(
  years: readonly YearCount[] = YEARS,
  eras: readonly ThresholdEra[] = ERAS,
): EraStat[] {
  const splitYears = new Set(ERA_YEAR_SPLITS.map((s) => s.year));

  const stats = eras.map((era) => {
    const from = Number(era.effectiveFrom.slice(0, 4));
    const to = era.effectiveTo === null ? Infinity : Number(era.effectiveTo.slice(0, 4));

    let totalCount = 0;
    for (const y of years) {
      if (y.series !== 'interpretation') continue;
      if (splitYears.has(y.year)) continue;
      if (y.year >= from && y.year < to) totalCount += y.count;
    }
    for (const split of ERA_YEAR_SPLITS) {
      for (const part of split.parts) {
        if (part.eraId === era.id) totalCount += part.count;
      }
    }

    const days = ERA_SPAN_DAYS[era.id];
    const yearSpan = days === null ? 0 : days / DAYS_PER_YEAR;
    const meanPerYear = days === null ? null : totalCount / yearSpan;

    return { era, meanPerYear, totalCount: days === null ? 0 : totalCount, yearSpan, ratioToPrevious: null as number | null };
  });

  for (let i = 1; i < stats.length; i++) {
    const prev = stats[i - 1].meanPerYear;
    const cur = stats[i].meanPerYear;
    stats[i].ratioToPrevious = prev !== null && cur !== null && prev > 0 ? cur / prev : null;
  }

  return stats;
}

/**
 * 土黃色區起伏的候選因素。
 *
 * **每一項都只是候選。** claim 欄只放可查證的事實，uncertainty 欄寫明不能證的是什麼，
 * needsRuling 寫明誰有權把它從候選改成結論。
 * 這些項目不得出現在圖上：註解釘在某個 x 位置，等於宣告該因素造成該處起伏。
 */
export const FACTORS: readonly FactorNote[] = [
  {
    id: 'f1-1958-drop',
    claim:
      '1957 年 9 件，1958 年 2 件。1958-07-21 公布的司法院大法官會議法第 13 條第 1 項把解釋憲法的門檻定為總額四分之三出席、出席人四分之三同意。',
    basis: 'statute',
    basisRef: '司法院大法官會議法第 13 條第 1 項（1958-07-21 公布）',
    uncertainty:
      '落差發生在換法同年，但本圖無法區分「門檻造成通不過」與「聲請量本身減少」。不受理與聲請件數不在 813 筆內。',
    needsRuling: 'legal-reviewer',
  },
  {
    id: 'f2-ramp-precedes',
    claim:
      '案件量的回升自 1986 年起（1986 年 11 件、1988 年 13 件、1989 年 16 件、1990 年 22 件、1992 年 22 件、1993 年 21 件），全部早於 1993-02-03 的門檻變動。1987 年為 9 件，低於 1986 年。',
    basis: 'data',
    basisRef: '813 筆釋字發布日期的逐年彙總（tests/fixtures/interpretation-dates.json）',
    uncertainty:
      '回升早於門檻變動這件事本圖可證，造成回升的原因本圖不能證。會議記錄說 1987 年那次修法把門檻改低、並因此造成案件暴增；實際的修法公布日是 1993-02-03，且案件量自 1986 年起已在回升，會議的時間順序不成立。須確認會議原意是否指其他事件。',
    needsRuling: 'captain',
  },
  {
    id: 'f3-1994-peak',
    claim: '1994 年 37 件，為全期最高，出現在門檻放寬後第二年。',
    basis: 'data',
    basisRef: '813 筆釋字發布日期的逐年彙總（tests/fixtures/interpretation-dates.json）',
    uncertainty:
      '尖峰是新門檻下積案一次消化、聲請量增加、或大法官組成變動，本圖無法分辨。三者皆未證。',
    needsRuling: 'external-source',
  },
  {
    id: 'f4-1950-51-zero',
    claim:
      '1950、1951 兩年 0 件。釋字第 2 號（1949-01-06）與第 3 號（1952-05-21）之間相隔三年餘。',
    basis: 'data',
    basisRef: '813 筆釋字發布日期的逐年彙總（tests/fixtures/interpretation-dates.json）',
    uncertainty:
      '空白的原因本圖不能證。沿革記載 1952-04-16 修正大法官會議規則第 8、12、15 條，該修正與空白期是否相關未證。',
    needsRuling: 'legal-reviewer',
  },
  {
    id: 'f5-excluded-cases',
    claim:
      '813 筆是已作成的解釋，不含不受理與未受理的聲請。早期不受理案件缺乏公開紀錄。',
    basis: 'data',
    basisRef: 'docs/meetup-chats/20260416 log.md 39:48 段',
    uncertainty:
      '這是資料邊界，不是因果。不受理件數若能取得，土黃色區的低谷可能有完全不同的解讀。',
    needsRuling: null,
  },
];

/** 拍板者的顯示名稱。 */
export const RULING_AUTHORITY_LABEL: Readonly<Record<NonNullable<FactorNote['needsRuling']>, string>> = {
  captain: 'captain',
  'legal-reviewer': '法學背景審閱者',
  'external-source': '外部史料來源',
};

/** 依據的顯示名稱。 */
export const BASIS_LABEL: Readonly<Record<FactorNote['basis'], string>> = {
  data: '本頁資料',
  statute: '法條原文',
  none: '尚無依據',
};

/**
 * R7 的三項資料邊界。這三項是資料定義，可以斷言，不是推測。
 * 必須固定顯示，不可摺疊起來。
 */
export const SERIES_BOUNDARY_NOTES: readonly { id: string; heading: string; body: string }[] = [
  {
    id: 'b1-made-not-filed',
    heading: '這 813 筆是「已作成的解釋」，不是「聲請案件數」',
    body: '不受理的聲請不在其中。早期不受理案件缺乏公開紀錄，且可能屬秘密評議。這張圖看不出有多少人聲請過。',
  },
  {
    id: 'b2-two-series',
    heading: '釋字與憲判字是兩個序列，不可相加',
    body: '2022-01-04 憲法訴訟法施行後不再作成解釋，改作成判決。釋字序列在第 813 號（2021-12-24）終止。圖上兩段長條分色，中間有一條虛線標出換軌點。',
  },
  {
    id: 'b3-current-no-data',
    heading: '現行 10 人 9 人條件落在釋字序列結束之後',
    body: '該條件 2025-01-23 才公布，距釋字序列終止已三年。釋字資料無法用來評估它。圖上該段畫斜線網底，沒有年均數字。',
  },
];
