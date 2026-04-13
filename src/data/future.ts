// src/data/future.ts

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
  | '稅務財產';

export interface PendingCase {
  id: string;
  topic: string;
  applicant: string;
  tags: IdentityTag[];
  daysPending: number;
}

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
];

export const TAG_COLORS: Record<IdentityTag, { bg: string; text: string; border: string; dot: string }> = {
  '勞工':     { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  '性別':     { bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200',    dot: 'bg-pink-500' },
  '原住民':   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  '刑事被告': { bg: 'bg-slate-100',  text: 'text-slate-700',   border: 'border-slate-300',   dot: 'bg-slate-500' },
  '環境保護': { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   dot: 'bg-green-500' },
  '言論自由': { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500' },
  '居住正義': { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500' },
  '身心障礙': { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-500' },
  '兒少權益': { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    dot: 'bg-cyan-500' },
  '隱私權':   { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  dot: 'bg-indigo-500' },
  '集會遊行': { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500' },
  '稅務財產': { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200',  dot: 'bg-yellow-500' },
};

export const PENDING_CASES: PendingCase[] = [
  // Labour
  {
    id: 'c01',
    topic: '勞工退休準備金提撥違憲審查',
    applicant: '某外送員工會',
    tags: ['勞工'],
    daysPending: 450,
  },
  {
    id: 'c06',
    topic: '移工轉換雇主限制違憲審查',
    applicant: '台灣國際勞工協會',
    tags: ['勞工', '性別'],
    daysPending: 560,
  },
  {
    id: 'c09',
    topic: '平台工作者勞動權益保障案',
    applicant: '外送產業工會',
    tags: ['勞工'],
    daysPending: 280,
  },
  {
    id: 'c10',
    topic: '責任制工時規範違憲爭議',
    applicant: '科技業勞工團體',
    tags: ['勞工'],
    daysPending: 390,
  },
  // Gender
  {
    id: 'c02',
    topic: '代理孕母合法化釋憲草案',
    applicant: '婚姻平權倡議團體',
    tags: ['性別'],
    daysPending: 680,
  },
  {
    id: 'c11',
    topic: '跨性別身分證變更免手術案',
    applicant: '跨性別權益推動聯盟',
    tags: ['性別', '隱私權'],
    daysPending: 520,
  },
  {
    id: 'c12',
    topic: '職場性騷擾雇主責任範圍案',
    applicant: '性別平等工作協會',
    tags: ['性別', '勞工'],
    daysPending: 310,
  },
  // Indigenous
  {
    id: 'c03',
    topic: '原住民狩獵槍枝管制條例違憲案',
    applicant: 'Bunun 獵人協會',
    tags: ['原住民'],
    daysPending: 320,
  },
  {
    id: 'c07',
    topic: '原住民保留地開發限制補償案',
    applicant: '多個原鄉部落代表',
    tags: ['原住民', '環境保護'],
    daysPending: 150,
  },
  {
    id: 'c13',
    topic: '傳統領域劃設諮商同意權案',
    applicant: '原住民族青年聯合會',
    tags: ['原住民', '環境保護'],
    daysPending: 610,
  },
  // Criminal defendants
  {
    id: 'c04',
    topic: '死刑存廢之正當法律程序再審',
    applicant: '廢死聯盟',
    tags: ['刑事被告'],
    daysPending: 890,
  },
  {
    id: 'c08',
    topic: '羈押法關於通信限制規定違憲案',
    applicant: '多名在押被告',
    tags: ['刑事被告'],
    daysPending: 410,
  },
  {
    id: 'c14',
    topic: '強制採尿程序正當性違憲案',
    applicant: '法律扶助基金會',
    tags: ['刑事被告', '隱私權'],
    daysPending: 340,
  },
  // Environment
  {
    id: 'c05',
    topic: '國道開墾環評審查標準違憲案',
    applicant: '地球公民基金會',
    tags: ['環境保護'],
    daysPending: 210,
  },
  {
    id: 'c15',
    topic: '農地工廠合法化環境權爭議',
    applicant: '環境法律人協會',
    tags: ['環境保護', '居住正義'],
    daysPending: 470,
  },
  // Free speech
  {
    id: 'c16',
    topic: '網路言論審查機制違憲案',
    applicant: '台灣網路透明報告協會',
    tags: ['言論自由', '隱私權'],
    daysPending: 380,
  },
  {
    id: 'c17',
    topic: '公務員政治言論限制違憲案',
    applicant: '基層公務員自救會',
    tags: ['言論自由'],
    daysPending: 550,
  },
  // Housing
  {
    id: 'c18',
    topic: '都市更新強制拆除程序違憲案',
    applicant: '反迫遷聯盟',
    tags: ['居住正義'],
    daysPending: 720,
  },
  {
    id: 'c19',
    topic: '社會住宅分配標準平等權案',
    applicant: '居住正義改革聯盟',
    tags: ['居住正義'],
    daysPending: 260,
  },
  // Disability
  {
    id: 'c20',
    topic: '身心障礙者無障礙設施標準案',
    applicant: '殘障聯盟',
    tags: ['身心障礙'],
    daysPending: 430,
  },
  {
    id: 'c21',
    topic: '精神障礙者強制住院程序違憲案',
    applicant: '心理衛生法律人協會',
    tags: ['身心障礙', '刑事被告'],
    daysPending: 590,
  },
  // Children
  {
    id: 'c22',
    topic: '少年事件處理法隱私權保障案',
    applicant: '兒童權利公約聯盟',
    tags: ['兒少權益', '隱私權'],
    daysPending: 350,
  },
  {
    id: 'c23',
    topic: '體罰禁止與管教權界限違憲案',
    applicant: '人本教育基金會',
    tags: ['兒少權益'],
    daysPending: 480,
  },
  // Privacy
  {
    id: 'c24',
    topic: '數位身分證個資蒐集違憲案',
    applicant: '台灣人權促進會',
    tags: ['隱私權'],
    daysPending: 640,
  },
  // Assembly
  {
    id: 'c25',
    topic: '集會遊行法事前許可制違憲案',
    applicant: '民間司法改革基金會',
    tags: ['集會遊行', '言論自由'],
    daysPending: 780,
  },
  {
    id: 'c26',
    topic: '警察驅離集會群眾武力標準案',
    applicant: '多名社運參與者',
    tags: ['集會遊行'],
    daysPending: 290,
  },
  // Tax/property
  {
    id: 'c27',
    topic: '房屋稅差別稅率違反平等權案',
    applicant: '稅改聯盟',
    tags: ['稅務財產', '居住正義'],
    daysPending: 510,
  },
  {
    id: 'c28',
    topic: '土地徵收補償標準違憲案',
    applicant: '苗栗大埔自救會',
    tags: ['稅務財產', '環境保護'],
    daysPending: 860,
  },
];

// Crisis statistics
export const CRISIS_STATS = {
  totalPending: 142,
  activeJustices: 5,
  requiredForRuling: 10,
  designatedTotal: 15,
  vacantSeats: 10,
  avgDaysPerCase: 120,
  estimatedClearanceYears: 3.4,
};
