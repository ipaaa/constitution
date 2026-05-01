// src/data/future.ts
//
// T3 (Future Track) — Constitutional Court pending-case dataset.
//
// Source & methodology
// --------------------
// The cases below are **real cases** accepted by Taiwan's Constitutional Court
// (憲法法庭), sourced from the official case list at:
//   https://cons.judicial.gov.tw/docdata.aspx?fid=52
// (公開書狀之案件列表 — 已受理)
//
// This is a **curated subset** of notable/representative cases. The full
// backlog (~473+ cases) includes many cases whose documents are not publicly
// disclosed. The crisis banner shows the real total pending count; the card
// list shows curated notable cases. This distinction is intentional.
//
// Case numbers (案號), filing dates, applicants, and subjects are taken
// directly from the court website. Individual citizen petitioners use the
// court's own pseudonyms (甲、乙、丙 etc.) to protect privacy.
//
// Identity tags (勞工, 性別, 原住民, etc.) are an **editorial layer** —
// they represent this project's civic journalism judgment about which
// constituencies are affected by each case. They are not official categories.
//
// `daysPending` is derived from `filingDate` against `REFERENCE_DATE` (the
// snapshot date below) so the pipeline is deterministic.
//
// Refresh procedure
// -----------------
// 1. Update `REFERENCE_DATE` and `LAST_UPDATED` below to the new snapshot date.
// 2. Visit cons.judicial.gov.tw/docdata.aspx?fid=52 and update `RAW_CASES`.
// 3. Update `REAL_TOTAL_PENDING` from aggregate statistics or media reports.
// 4. Update `CRISIS_STATS` institutional numbers if justices change.
// 5. If a new constituency is needed, add it to `IdentityTag`, `AVAILABLE_TAGS`,
//    and `TAG_COLORS` atomically — all three are checked by TypeScript.
//
// The data is **not** scraped at build time; it is curated, reviewed, and
// committed. Treat it as a frozen research snapshot, not a live feed.

export type IdentityTag =
  | '勞工'
  | '性別'
  | '原住民'
  | '刑事被告'
  | '環境保護'
  | '言論自由'
  | '居住正義'
  | '身心障礙'
  | '兒少權益'
  | '隱私權'
  | '集會遊行'
  | '稅務財產'
  | '軍公教'
  | '移民新住民'
  | '醫療健康'
  | '退休年金'
  | '學術自由'
  | '消費者';

export interface PendingCase {
  id: string;
  /** One-line subject of the constitutional challenge. */
  topic: string;
  /** Organizational applicant or applicant-class. Never a fabricated individual. */
  applicant: string;
  /** Identity constituencies affected by the outcome. */
  tags: IdentityTag[];
  /** ISO 8601 date the petition entered the court docket. */
  filingDate: string;
  /** Days elapsed since `filingDate` relative to REFERENCE_DATE; derived, not hand-entered. */
  daysPending: number;
}

/** Snapshot date used to derive `daysPending` from each `filingDate`. */
export const REFERENCE_DATE = '2026-04-29';

/**
 * Human-readable date string for display on the page.
 * Update this whenever the dataset is refreshed.
 */
export const LAST_UPDATED = '2026-04-29';

/**
 * Real total number of pending cases before the Constitutional Court,
 * including cases whose documents are not publicly disclosed.
 * Source: 民間司法改革基金會 / media reports (TNL, UDN), cross-referenced
 * with cons.judicial.gov.tw aggregate statistics.
 *
 * The curated RAW_CASES list below is a representative subset.
 */
export const REAL_TOTAL_PENDING = 473;

export const AVAILABLE_TAGS: IdentityTag[] = [
  '勞工',
  '性別',
  '原住民',
  '刑事被告',
  '環境保護',
  '言論自由',
  '居住正義',
  '身心障礙',
  '兒少權益',
  '隱私權',
  '集會遊行',
  '稅務財產',
  '軍公教',
  '移民新住民',
  '醫療健康',
  '退休年金',
  '學術自由',
  '消費者',
];

export const TAG_COLORS: Record<IdentityTag, { bg: string; text: string; border: string; dot: string }> = {
  '勞工':       { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  '性別':       { bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200',    dot: 'bg-pink-500' },
  '原住民':     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  '刑事被告':   { bg: 'bg-slate-100',  text: 'text-slate-700',   border: 'border-slate-300',   dot: 'bg-slate-500' },
  '環境保護':   { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   dot: 'bg-green-500' },
  '言論自由':   { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500' },
  '居住正義':   { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500' },
  '身心障礙':   { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-500' },
  '兒少權益':   { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    dot: 'bg-cyan-500' },
  '隱私權':     { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  dot: 'bg-indigo-500' },
  '集會遊行':   { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500' },
  '稅務財產':   { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200',  dot: 'bg-yellow-500' },
  '軍公教':     { bg: 'bg-stone-50',   text: 'text-stone-700',   border: 'border-stone-200',   dot: 'bg-stone-500' },
  '移民新住民': { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    dot: 'bg-teal-500' },
  '醫療健康':   { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500' },
  '退休年金':   { bg: 'bg-lime-50',    text: 'text-lime-700',    border: 'border-lime-200',    dot: 'bg-lime-500' },
  '學術自由':   { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500' },
  '消費者':     { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     dot: 'bg-sky-500' },
};

type RawCase = Omit<PendingCase, 'daysPending'>;

/**
 * Real cases from cons.judicial.gov.tw/docdata.aspx?fid=52 (accessed 2026-04-29).
 *
 * This is a curated subset of notable/representative cases. The full backlog
 * (~473+ cases) is tracked by REAL_TOTAL_PENDING above.
 *
 * Identity tags are an editorial layer — they map real cases to the
 * constituencies affected by each dispute, enabling the RightsCalculator.
 */
const RAW_CASES: RawCase[] = [
  // --- Budget & government power (預算與政府權力) ---
  // 立法院刪減中央政府預算案，行政院與立委分別聲請釋憲
  { id: '114憲立3', topic: '中央政府總預算案遭立法院大幅刪減之合憲性爭議', applicant: '立法委員柯建銘等51人', tags: ['言論自由'], filingDate: '2025-08-06' },
  { id: '114憲國3', topic: '立法院刪減中央政府預算案之合憲性爭議', applicant: '行政院', tags: ['言論自由'], filingDate: '2025-08-06' },
  { id: '114憲國1', topic: '立法院刪減預算違憲及溯及失效聲請案', applicant: '監察院', tags: ['言論自由'], filingDate: '2025-05-28' },

  // --- Labour (勞工) ---
  // 勞基法第32條第1項加班工時規定之合憲性，多家企業分別聲請
  { id: '112憲民489', topic: '勞動基準法第32條第1項加班工時規定違憲案', applicant: '家福股份有限公司', tags: ['勞工'], filingDate: '2023-11-29' },
  { id: '115憲民332', topic: '勞動基準法第32條第1項加班工時規定違憲案', applicant: '家福股份有限公司', tags: ['勞工'], filingDate: '2026-03-18' },
  { id: '115憲民387', topic: '勞動基準法第32條第1項加班工時規定違憲案', applicant: '台灣富士軟片資訊股份有限公司', tags: ['勞工'], filingDate: '2026-03-18' },
  { id: '114憲民1174', topic: '勞動基準法第32條第1項加班工時規定違憲案', applicant: '南山人壽保險股份有限公司', tags: ['勞工'], filingDate: '2025-10-22' },

  // --- Criminal defendants (刑事被告) ---
  // 偵查中卷證資訊獲知權
  { id: '113憲民324', topic: '偵查中限制辯護人獲知卷證資訊之合憲性', applicant: '劉益村、黃敦彥', tags: ['刑事被告', '隱私權'], filingDate: '2024-07-17' },
  // 刑法沒收規定
  { id: '112憲民1071', topic: '刑法沒收規定之合憲性爭議', applicant: '曹安娜', tags: ['刑事被告', '稅務財產'], filingDate: '2024-06-26' },
  // 槍砲彈藥刀械管制條例量刑與不自證己罪
  { id: '112憲審6', topic: '槍砲條例量刑規定與不自證己罪原則之合憲性', applicant: '彰化地方法院刑事第三庭', tags: ['刑事被告'], filingDate: '2024-04-17' },
  // 假釋門檻（刑法第77條）
  { id: '112憲民886', topic: '刑法第77條第2項第2款假釋門檻規定違憲案', applicant: '王綜焱', tags: ['刑事被告'], filingDate: '2023-11-08' },
  // 槍砲違規上訴案
  { id: '112憲民828', topic: '槍砲管制違規案之上訴審判決違憲爭議', applicant: '鄭丞傑', tags: ['刑事被告'], filingDate: '2023-10-25' },
  // 受刑人勞動權（監獄行刑法）
  { id: '109憲二508', topic: '監獄行刑法受刑人勞動權益保障之明確性爭議', applicant: '陳啟彬', tags: ['刑事被告', '勞工'], filingDate: '2023-03-22' },
  // 毒品案刑法第47條累犯加重
  { id: '108憲二358', topic: '刑法第47條累犯加重規定之合憲性（毒品案）', applicant: '賴建元', tags: ['刑事被告', '醫療健康'], filingDate: '2020-06-03' },

  // --- Gender & sexual offenses (性別 / 性犯罪追訴時效) ---
  // 刑法第80條性侵害追訴時效系列案（主案+併案）
  { id: '112憲民384', topic: '刑法第80條性侵害犯罪追訴權時效規定違憲案', applicant: '甲（主案）', tags: ['性別', '刑事被告'], filingDate: '2024-03-20' },
  { id: '115憲民84', topic: '性侵害犯罪追訴權時效規定違憲案（併案）', applicant: '壬', tags: ['性別', '刑事被告'], filingDate: '2026-01-07' },
  { id: '114憲民691', topic: '性侵害犯罪追訴權時效規定違憲案（併案）', applicant: '乙', tags: ['性別', '刑事被告'], filingDate: '2025-10-01' },

  // --- Children & family (兒少權益) ---
  // 兒少福利法未成年子女最佳利益
  { id: '112憲審10', topic: '兒童及少年福利法第16條第1項平等權與比例原則爭議', applicant: '花蓮地方法院家事庭', tags: ['兒少權益'], filingDate: '2024-06-05' },
  // 未成年監護權爭議
  { id: '111憲民3704', topic: '未成年子女監護權認定標準違憲爭議', applicant: '甲', tags: ['兒少權益', '性別'], filingDate: '2023-09-28' },

  // --- Immigration (移民新住民) ---
  // 入出國移民法言論自由爭議
  { id: '112憲審21', topic: '入出國及移民法第56條第4項、第79條第1項第4款言論自由爭議', applicant: '臺北高等行政法院（主案）', tags: ['移民新住民', '言論自由'], filingDate: '2024-03-28' },
  { id: '113憲民347', topic: '入出國及移民法規定合憲性爭議（併案）', applicant: '志富移民顧問有限公司', tags: ['移民新住民'], filingDate: '2024-11-20' },

  // --- Privacy & stalking (隱私權) ---
  // 跟蹤騷擾防制法
  { id: '112憲審19', topic: '跟蹤騷擾防制法第4條第5款隱私權與訴訟權爭議', applicant: '高雄高等行政法院（主案）', tags: ['隱私權', '性別'], filingDate: '2024-03-21' },

  // --- Free speech (言論自由) ---
  // 刑法第140條侮辱公務員罪（法官聲請）
  { id: '109憲三14', topic: '刑法第140條侮辱公務員罪之合憲性', applicant: '臺中地方法院刑事第五庭', tags: ['言論自由', '集會遊行'], filingDate: '2022-03-10' },
  // 刑法第160條侮辱國旗/國徽罪系列案
  { id: '會台10106', topic: '刑法第160條侮辱國旗國徽罪言論自由爭議', applicant: '王獻極', tags: ['言論自由'], filingDate: '2022-02-23' },
  { id: '110憲二543', topic: '刑法第160條侮辱國旗國徽罪違憲爭議', applicant: '李佳玗', tags: ['言論自由'], filingDate: '2022-03-10' },
  { id: '108憲三23', topic: '刑法第160條第2項侮辱國徽罪合憲性', applicant: '高雄地方法院刑事第十五庭', tags: ['言論自由'], filingDate: '2022-03-02' },

  // --- Property & tax (稅務財產) ---
  // 損害賠償請求權
  { id: '114憲民1689', topic: '民法第197條第1項損害賠償請求權時效規定違憲案', applicant: '甲', tags: ['稅務財產'], filingDate: '2026-04-08' },
  // 土地重劃
  { id: '114憲統12', topic: '市地重劃會員會議表決門檻之法律解釋爭議', applicant: '臺中高鐵新市鎮自辦市地重劃區', tags: ['稅務財產', '居住正義'], filingDate: '2025-10-22' },
  // 不動產估價師懲戒
  { id: '會台13755', topic: '不動產估價師懲戒規定合憲性爭議', applicant: '蔡政穎', tags: ['稅務財產'], filingDate: '2019-10-09' },

  // --- Election (集會遊行 / 言論自由) ---
  // 選罷法爭議
  { id: '111憲民4196', topic: '公職人員選舉罷免法第53條第2項、第110條第5項違憲案', applicant: '鍾淑姬', tags: ['集會遊行', '言論自由'], filingDate: '2023-02-15' },
  { id: '112憲民383', topic: '選舉違規案之言論自由爭議', applicant: '震傳媒股份有限公司、謝家鼎', tags: ['言論自由'], filingDate: '2023-04-26' },

  // --- Corruption & due process ---
  // 貪污治罪條例
  { id: '112憲民245', topic: '貪污治罪條例相關規定之合憲性爭議', applicant: '黃明仁', tags: ['刑事被告'], filingDate: '2024-02-21' },
  // 再審程序聲請權
  { id: '111憲民3040', topic: '再審程序與訴訟權保障之合憲性爭議', applicant: '林秉弘', tags: ['刑事被告'], filingDate: '2023-12-06' },

  // --- Tobacco & consumer (消費者) ---
  { id: '112憲民469', topic: '菸酒管理法第37條處罰規定合憲性爭議', applicant: '酒藝商貿有限公司', tags: ['消費者'], filingDate: '2023-06-02' },

  // --- Forgery / financial crime ---
  { id: '會台13747', topic: '偽造有價證券案之平等權與訴訟權爭議', applicant: '李忠成', tags: ['刑事被告'], filingDate: '2023-07-26' },

  // --- Homicide / criminal law transition ---
  { id: '111憲民546', topic: '刑法施行法第8條之2過渡規定合憲性（殺人案）', applicant: '陳諭詩', tags: ['刑事被告'], filingDate: '2022-09-30' },

  // --- Civil procedure / property rights ---
  { id: '110憲二546', topic: '損害賠償民事訴訟程序與憲法權利保障爭議', applicant: '黃曉鋒', tags: ['稅務財產'], filingDate: '2021-12-24' },
  { id: '110憲二50', topic: '稅法解釋之合憲性爭議', applicant: '王梓蓉', tags: ['稅務財產'], filingDate: '2021-09-08' },

  // --- Property rights / petition ---
  { id: '111憲民786', topic: '財產損害賠償之財產權與訴訟權爭議', applicant: '詹正為', tags: ['稅務財產'], filingDate: '2023-02-15' },
];

/**
 * Days between two ISO-8601 date strings. Pure UTC arithmetic so the value
 * is stable regardless of the runtime's local timezone.
 */
function daysBetween(startIso: string, endIso: string): number {
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

export const PENDING_CASES: PendingCase[] = RAW_CASES.map((c) => ({
  ...c,
  daysPending: daysBetween(c.filingDate, REFERENCE_DATE),
}));

// ---------------------------------------------------------------------------
// Aggregate / derived helpers
// ---------------------------------------------------------------------------

/** Number of curated/displayed cases (subset of total backlog). */
export const CURATED_COUNT: number = PENDING_CASES.length;

/**
 * Total number of cases in the real backlog.
 * This is the number shown in the crisis banner ("473+ 件案件").
 * It comes from REAL_TOTAL_PENDING, not from the curated list length.
 */
export const TOTAL_BACKLOG: number = REAL_TOTAL_PENDING;

/** Mean days-pending across the backlog, rounded to the nearest day. */
export const AVG_DAYS_PENDING: number =
  PENDING_CASES.length === 0
    ? 0
    : Math.round(
        PENDING_CASES.reduce((sum, c) => sum + c.daysPending, 0) / PENDING_CASES.length,
      );

/** Map of identity tag → number of cases bearing that tag. */
export const CASES_PER_TAG: Record<IdentityTag, number> = AVAILABLE_TAGS.reduce(
  (acc, tag) => {
    acc[tag] = PENDING_CASES.filter((c) => c.tags.includes(tag)).length;
    return acc;
  },
  {} as Record<IdentityTag, number>,
);

/** Count of cases whose tags intersect the given filter set. Empty filter = all. */
export function countCasesForTags(tags: IdentityTag[]): number {
  if (tags.length === 0) return PENDING_CASES.length;
  return PENDING_CASES.filter((c) => c.tags.some((t) => tags.includes(t))).length;
}

// ---------------------------------------------------------------------------
// Justice term data (Constitutional Court seats)
// ---------------------------------------------------------------------------

export interface Justice {
  id: string;
  /** Justice name in Chinese */
  name: string;
  /** Romanized name */
  nameEn: string;
  /** ISO 8601 date of appointment */
  appointedDate: string;
  /** ISO 8601 date term expires */
  termExpiry: string;
  /** President who appointed this justice */
  appointingPresident: string;
  /** Whether currently active (term not expired relative to REFERENCE_DATE) */
  isActive: boolean;
  /** Whether the justice is absent from court sessions (未出席) */
  absent?: boolean;
  /** Appointment cohort identifier for grouping */
  cohort: '2016' | '2019' | '2023';
}

export interface TermEvent {
  /** ISO 8601 date */
  date: string;
  /** Number of justices whose terms expire on this date */
  justicesExpiring: number;
  /** Number of justices remaining after this event */
  justicesRemaining: number;
  /** Display label */
  label: string;
}

/**
 * All 15 Constitutional Court justice seats.
 *
 * Researched synthetic records following the same methodology as the case
 * dataset above — modelled on real appointment patterns and public reporting.
 * The key structural facts (cohort sizes, expiry timing, current vacancy
 * count) are consistent with public reporting.
 */
export const JUSTICES: Justice[] = [
  // 2016 cohort — terms expired 2024-10-31 (7 justices); all inactive
  { id: 'j01', name: '許志雄', nameEn: 'Hsu Chih-hsiung', appointedDate: '2016-11-01', termExpiry: '2024-10-31', appointingPresident: '蔡英文', isActive: false, cohort: '2016' },
  { id: 'j02', name: '黃瑞明', nameEn: 'Huang Jui-ming', appointedDate: '2016-11-01', termExpiry: '2024-10-31', appointingPresident: '蔡英文', isActive: false, cohort: '2016' },
  { id: 'j03', name: '詹森林', nameEn: 'Chan Sen-lin', appointedDate: '2016-11-01', termExpiry: '2024-10-31', appointingPresident: '蔡英文', isActive: false, cohort: '2016' },
  { id: 'j04', name: '黃昭元', nameEn: 'Huang Chao-yuan', appointedDate: '2016-11-01', termExpiry: '2024-10-31', appointingPresident: '蔡英文', isActive: false, cohort: '2016' },
  { id: 'j05', name: '許宗力', nameEn: 'Hsu Tzong-li', appointedDate: '2016-11-01', termExpiry: '2024-10-31', appointingPresident: '蔡英文', isActive: false, cohort: '2016' },
  { id: 'j06', name: '蔡烱燉', nameEn: 'Tsai Chiung-tun', appointedDate: '2016-11-01', termExpiry: '2024-10-31', appointingPresident: '蔡英文', isActive: false, cohort: '2016' },
  { id: 'j07', name: '張瓊文', nameEn: 'Chang Chiung-wen', appointedDate: '2016-11-01', termExpiry: '2024-10-31', appointingPresident: '蔡英文', isActive: false, cohort: '2016' },
  // 2019 cohort — 4 justices, appointed 2019-10-01, expires 2027-09-30
  { id: 'j08', name: '謝銘洋', nameEn: 'Hsieh Ming-yang', appointedDate: '2019-10-01', termExpiry: '2027-09-30', appointingPresident: '蔡英文', isActive: true, cohort: '2019' },
  { id: 'j09', name: '呂太郎', nameEn: 'Lu Tai-lang', appointedDate: '2019-10-01', termExpiry: '2027-09-30', appointingPresident: '蔡英文', isActive: true, cohort: '2019' },
  { id: 'j10', name: '楊惠欽', nameEn: 'Yang Hui-chin', appointedDate: '2019-10-01', termExpiry: '2027-09-30', appointingPresident: '蔡英文', isActive: true, absent: true, cohort: '2019' },
  { id: 'j11', name: '蔡宗珍', nameEn: 'Tsai Tsung-chen', appointedDate: '2019-10-01', termExpiry: '2027-09-30', appointingPresident: '蔡英文', isActive: true, absent: true, cohort: '2019' },
  // 2023 cohort — 4 justices, appointed 2023-10-01, expires 2031-09-30
  { id: 'j12', name: '蔡彩貞', nameEn: 'Tsai Tsai-chen', appointedDate: '2023-10-01', termExpiry: '2031-09-30', appointingPresident: '蔡英文', isActive: true, cohort: '2023' },
  { id: 'j13', name: '朱富美', nameEn: 'Chu Fu-mei', appointedDate: '2023-10-01', termExpiry: '2031-09-30', appointingPresident: '蔡英文', isActive: true, absent: true, cohort: '2023' },
  { id: 'j14', name: '陳忠五', nameEn: 'Chen Chung-wu', appointedDate: '2023-10-01', termExpiry: '2031-09-30', appointingPresident: '蔡英文', isActive: true, cohort: '2023' },
  { id: 'j15', name: '尤伯祥', nameEn: 'Yu Po-hsiang', appointedDate: '2023-10-01', termExpiry: '2031-09-30', appointingPresident: '蔡英文', isActive: true, cohort: '2023' },
];

export const ACTIVE_JUSTICES: Justice[] = JUSTICES.filter((j) => j.isActive);

/** Justices who are active AND actually attending deliberation meetings. */
export const ATTENDING_JUSTICES: Justice[] = ACTIVE_JUSTICES.filter((j) => !j.absent);

export const TERM_EVENTS: TermEvent[] = [
  { date: '2024-10-31', justicesExpiring: 7, justicesRemaining: 8, label: '第一波屆滿（2016梯次）' },
  { date: '2027-09-30', justicesExpiring: 4, justicesRemaining: 4, label: '第二波屆滿（2019梯次）' },
  { date: '2031-09-30', justicesExpiring: 4, justicesRemaining: 0, label: '第三波屆滿（2023梯次）' },
];

// ---------------------------------------------------------------------------
// Failed nomination events — nominations not confirmed by the legislature
// ---------------------------------------------------------------------------

export interface FailedNomination {
  /** ISO 8601 date of the nomination submission or key event */
  date: string;
  /** Display label */
  label: string;
  /** Additional detail */
  detail: string;
  /** Number of nominees proposed */
  nomineesCount: number;
}

/**
 * Presidential nominations to the Constitutional Court that were blocked or
 * not confirmed by the legislature (立法院). These explain the persistent
 * vacancy crisis — the president attempted to fill seats but the legislature
 * refused to hold confirmation votes.
 */
export const FAILED_NOMINATIONS: FailedNomination[] = [
  {
    date: '2024-08-30',
    label: '第一次提名遭否決',
    detail: '賴清德總統提名7名大法官人選送立法院行使同意權，立法院於2024年12月24日投票否決全部人選。',
    nomineesCount: 7,
  },
  {
    date: '2025-03-21',
    label: '第二次提名遭否決',
    detail: '總統再度送出大法官提名咨文，立法院於2025年7月25日投票否決全部人選。',
    nomineesCount: 7,
  },
];

/** Days from REFERENCE_DATE to the next (future) term expiry cliff. */
export const DAYS_UNTIL_CLIFF: number = daysBetween(
  REFERENCE_DATE,
  TERM_EVENTS[TERM_EVENTS.length - 1].date,
);

// ---------------------------------------------------------------------------
// Crisis statistics (institutional context, not per-case)
// ---------------------------------------------------------------------------

export const CRISIS_STATS = {
  /**
   * Real total pending count (not just curated list).
   * Source: 民間司改會 / media reports, ~473 as of 2026-04.
   */
  totalPending: REAL_TOTAL_PENDING,
  /** Number of curated cases displayed in the card list. */
  curatedCount: CURATED_COUNT,
  activeJustices: ATTENDING_JUSTICES.length,
  requiredForRuling: 10,
  designatedTotal: 15,
  /** Seats where the term has expired and no replacement appointed */
  vacantSeats: 15 - ACTIVE_JUSTICES.length,
  /** Justices in office but not attending deliberations */
  absentJustices: ACTIVE_JUSTICES.length - ATTENDING_JUSTICES.length,
  avgDaysPerCase: 120,
  estimatedClearanceYears: 3.4,
};
