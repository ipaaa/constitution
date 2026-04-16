// src/data/future.ts
//
// T3 (Future Track) — Constitutional Court pending-case dataset.
//
// Source & methodology
// --------------------
// The cases below are **researched synthetic records**: each topic is modelled
// on a real ongoing category of dispute before Taiwan's Constitutional Court
// (憲法法庭) as reported in public discourse, judicial yuan annual reports, and
// civil-society petitions. Applicant fields use **organizational roles** (e.g.
// "台灣國際勞工協會", "法律扶助基金會") — not fabricated individual plaintiffs.
//
// Filing dates (ISO 8601) are approximations consistent with public reporting
// of each dispute's emergence. `daysPending` is derived from `filingDate`
// against `REFERENCE_DATE` (the snapshot date below) so the pipeline is
// deterministic — not a hand-written literal.
//
// Refresh procedure
// -----------------
// 1. Update `REFERENCE_DATE` below to the new snapshot date.
// 2. Replace / amend the `RAW_CASES` entries. Keep `filingDate` ISO-8601 and
//    let `daysPending` recompute.
// 3. If a new constituency is needed, add it to `IdentityTag`, `AVAILABLE_TAGS`,
//    and `TAG_COLORS` atomically — all three are checked by TypeScript.
// 4. Upstream sources worth consulting on refresh:
//    - 司法院憲法法庭案件公開資訊 (constitutionalcourt.judicial.gov.tw)
//    - g0v 司法開放資料 (g0v.tw / judicial.g0v.ronny.tw)
//    - 民間司法改革基金會 annual reports
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
export const REFERENCE_DATE = '2026-04-16';

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
 * Pre-derivation source rows. Keep these ordered by constituency for diff
 * readability; UI ordering is a pure view concern and lives in the consumer.
 */
const RAW_CASES: RawCase[] = [
  // Labour
  { id: 'c01', topic: '勞工退休準備金提撥違憲審查', applicant: '某外送員工會', tags: ['勞工', '退休年金'], filingDate: '2025-01-22' },
  { id: 'c06', topic: '移工轉換雇主限制違憲審查', applicant: '台灣國際勞工協會', tags: ['勞工', '移民新住民'], filingDate: '2024-10-04' },
  { id: 'c09', topic: '平台工作者勞動權益保障案', applicant: '外送產業工會', tags: ['勞工', '消費者'], filingDate: '2025-07-10' },
  { id: 'c10', topic: '責任制工時規範違憲爭議', applicant: '科技業勞工團體', tags: ['勞工'], filingDate: '2025-03-23' },
  // Gender
  { id: 'c02', topic: '代理孕母合法化釋憲草案', applicant: '婚姻平權倡議團體', tags: ['性別', '醫療健康'], filingDate: '2024-06-06' },
  { id: 'c11', topic: '跨性別身分證變更免手術案', applicant: '跨性別權益推動聯盟', tags: ['性別', '隱私權'], filingDate: '2024-11-12' },
  { id: 'c12', topic: '職場性騷擾雇主責任範圍案', applicant: '性別平等工作協會', tags: ['性別', '勞工'], filingDate: '2025-06-10' },
  // Indigenous
  { id: 'c03', topic: '原住民狩獵槍枝管制條例違憲案', applicant: 'Bunun 獵人協會', tags: ['原住民'], filingDate: '2025-05-31' },
  { id: 'c07', topic: '原住民保留地開發限制補償案', applicant: '多個原鄉部落代表', tags: ['原住民', '環境保護'], filingDate: '2025-11-17' },
  { id: 'c13', topic: '傳統領域劃設諮商同意權案', applicant: '原住民族青年聯合會', tags: ['原住民', '環境保護'], filingDate: '2024-08-14' },
  // Criminal defendants
  { id: 'c04', topic: '死刑存廢之正當法律程序再審', applicant: '廢死聯盟', tags: ['刑事被告'], filingDate: '2023-11-08' },
  { id: 'c08', topic: '羈押法關於通信限制規定違憲案', applicant: '多名在押被告', tags: ['刑事被告'], filingDate: '2025-03-02' },
  { id: 'c14', topic: '強制採尿程序正當性違憲案', applicant: '法律扶助基金會', tags: ['刑事被告', '隱私權'], filingDate: '2025-05-11' },
  // Environment
  { id: 'c05', topic: '國道開墾環評審查標準違憲案', applicant: '地球公民基金會', tags: ['環境保護'], filingDate: '2025-09-18' },
  { id: 'c15', topic: '農地工廠合法化環境權爭議', applicant: '環境法律人協會', tags: ['環境保護', '居住正義'], filingDate: '2025-01-02' },
  // Free speech
  { id: 'c16', topic: '網路言論審查機制違憲案', applicant: '台灣網路透明報告協會', tags: ['言論自由', '隱私權'], filingDate: '2025-03-31' },
  { id: 'c17', topic: '公務員政治言論限制違憲案', applicant: '基層公務員自救會', tags: ['言論自由', '軍公教'], filingDate: '2024-10-14' },
  // Housing
  { id: 'c18', topic: '都市更新強制拆除程序違憲案', applicant: '反迫遷聯盟', tags: ['居住正義'], filingDate: '2024-04-26' },
  { id: 'c19', topic: '社會住宅分配標準平等權案', applicant: '居住正義改革聯盟', tags: ['居住正義'], filingDate: '2025-07-30' },
  // Disability
  { id: 'c20', topic: '身心障礙者無障礙設施標準案', applicant: '殘障聯盟', tags: ['身心障礙'], filingDate: '2025-02-10' },
  { id: 'c21', topic: '精神障礙者強制住院程序違憲案', applicant: '心理衛生法律人協會', tags: ['身心障礙', '刑事被告', '醫療健康'], filingDate: '2024-09-03' },
  // Children
  { id: 'c22', topic: '少年事件處理法隱私權保障案', applicant: '兒童權利公約聯盟', tags: ['兒少權益', '隱私權'], filingDate: '2025-04-27' },
  { id: 'c23', topic: '體罰禁止與管教權界限違憲案', applicant: '人本教育基金會', tags: ['兒少權益'], filingDate: '2024-12-19' },
  // Privacy
  { id: 'c24', topic: '數位身分證個資蒐集違憲案', applicant: '台灣人權促進會', tags: ['隱私權'], filingDate: '2024-07-15' },
  // Assembly
  { id: 'c25', topic: '集會遊行法事前許可制違憲案', applicant: '民間司法改革基金會', tags: ['集會遊行', '言論自由'], filingDate: '2024-02-27' },
  { id: 'c26', topic: '警察驅離集會群眾武力標準案', applicant: '多名社運參與者', tags: ['集會遊行'], filingDate: '2025-06-30' },
  // Tax / property
  { id: 'c27', topic: '房屋稅差別稅率違反平等權案', applicant: '稅改聯盟', tags: ['稅務財產', '居住正義'], filingDate: '2024-11-22' },
  { id: 'c28', topic: '土地徵收補償標準違憲案', applicant: '苗栗大埔自救會', tags: ['稅務財產', '環境保護'], filingDate: '2023-12-07' },
  // Military / public employees (expanded constituency)
  { id: 'c29', topic: '軍人年金改革信賴保護原則違憲案', applicant: '八百壯士捍衛中華協會', tags: ['軍公教', '退休年金'], filingDate: '2024-05-20' },
  { id: 'c30', topic: '教師法不適任教師停聘程序案', applicant: '全國教師工會總聯合會', tags: ['軍公教', '勞工'], filingDate: '2025-08-08' },
  // Immigrants / new residents
  { id: 'c31', topic: '新住民配偶面談制度違憲案', applicant: '南洋台灣姊妹會', tags: ['移民新住民', '性別'], filingDate: '2025-02-28' },
  { id: 'c32', topic: '難民法遲未立法不作為違憲案', applicant: '台灣人權促進會', tags: ['移民新住民'], filingDate: '2024-06-18' },
  // Health / medical
  { id: 'c33', topic: '全民健保重大傷病資料查調爭議', applicant: '醫療人權促進會', tags: ['醫療健康', '隱私權'], filingDate: '2025-05-02' },
  { id: 'c34', topic: '強制預防接種例外條款違憲案', applicant: '家長權益促進聯盟', tags: ['醫療健康', '兒少權益'], filingDate: '2024-12-01' },
  // Academic freedom
  { id: 'c35', topic: '大學自治與教師評鑑制度違憲案', applicant: '高等教育產業工會', tags: ['學術自由', '勞工'], filingDate: '2025-04-04' },
  // Consumers
  { id: 'c36', topic: '個資外洩消費者求償舉證責任案', applicant: '消費者文教基金會', tags: ['消費者', '隱私權'], filingDate: '2025-09-25' },
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

/** Total number of cases in the backlog snapshot. */
export const TOTAL_BACKLOG: number = PENDING_CASES.length;

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
// Crisis statistics (institutional context, not per-case)
// ---------------------------------------------------------------------------

export const CRISIS_STATS = {
  /** Derived from the dataset so the headline stat matches the visible case list. */
  totalPending: TOTAL_BACKLOG,
  activeJustices: 5,
  requiredForRuling: 10,
  designatedTotal: 15,
  vacantSeats: 10,
  avgDaysPerCase: 120,
  estimatedClearanceYears: 3.4,
};
