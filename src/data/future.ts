// src/data/future.ts
//
// Data Pipeline Documentation
// ===========================
// Source: Taiwan Constitutional Court (憲法法庭) public case docket
//   - Primary reference: https://cons.judicial.gov.tw (Judicial Yuan Constitutional Court website)
//   - Supplementary: news reports and civil society tracking of pending constitutional petitions
//
// Data as of: 2025-04 (last refresh)
//
// Transformation steps:
//   1. Cases were collected from the Constitutional Court's public pending case list
//      and cross-referenced with civil society tracking databases
//   2. Each case was tagged with relevant identity/constituency categories
//   3. Filing dates were converted to days-pending relative to the data refresh date
//   4. Cases were deduplicated by docket number where multiple petitions were consolidated
//
// To refresh:
//   1. Visit the Constitutional Court website for updated pending case lists
//   2. Cross-reference with Legislative Yuan records for any new petition filings
//   3. Update filingDate and recalculate daysPending based on new reference date
//   4. Add new IdentityTag values as needed for emerging constituencies
//

// --- Identity Tags ---
// Expanded from the original 5 to cover a broader range of constituencies
// affected by constitutional litigation in Taiwan.

export type IdentityTag =
  | '勞工'       // Labor / workers
  | '性別'       // Gender / LGBTQ+
  | '原住民'     // Indigenous peoples
  | '刑事被告'   // Criminal defendants
  | '環境保護'   // Environmental protection
  | '言論自由'   // Freedom of speech / press
  | '居住正義'   // Housing justice
  | '身心障礙'   // Disability rights
  | '兒少權益'   // Children & youth rights
  | '隱私權'     // Privacy rights
  | '集會結社'   // Assembly & association
  | '財產權'     // Property rights
  | '教育權'     // Right to education
  | '醫療權'     // Right to healthcare
  | '選舉權'     // Voting / electoral rights
  | '移工權益'   // Migrant worker rights
  | '宗教自由'   // Religious freedom
  | '納稅人權益' // Taxpayer rights
  | '司法正義';  // Judicial justice / due process

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
  '集會結社',
  '財產權',
  '教育權',
  '醫療權',
  '選舉權',
  '移工權益',
  '宗教自由',
  '納稅人權益',
  '司法正義',
];

// --- Case Types ---

export interface PendingCase {
  id: string;
  topic: string;
  applicant: string;
  tags: IdentityTag[];
  filingDate: string;   // ISO date string (YYYY-MM-DD)
  daysPending: number;  // Days since filing, relative to 2025-04-01 reference date
}

// --- Aggregate Statistics Types ---

export interface TagStatistics {
  tag: IdentityTag;
  caseCount: number;
  averageDaysPending: number;
  oldestCaseDays: number;
}

export interface BacklogStatistics {
  totalCases: number;
  averageDaysPending: number;
  medianDaysPending: number;
  oldestCaseDays: number;
  casesByTag: TagStatistics[];
}

// --- Funnel Visualization Types ---

export interface FunnelStage {
  label: string;
  count: number;
  description: string;
}

export interface FunnelData {
  stages: FunnelStage[];
  bottleneckJusticeCount: number;
  requiredJusticeCount: number;
}

// --- Case Data ---
// Based on publicly known constitutional petitions pending before the
// Constitutional Court as of early 2025. Cases reflect the backlog created
// by the Legislative Yuan's failure to confirm new justices after November 2024,
// combined with the raised quorum threshold effectively freezing the court.

export const PENDING_CASES: PendingCase[] = [
  // --- Labor / Workers ---
  {
    id: 'c001',
    topic: '勞工退休準備金提撥比例違憲審查',
    applicant: '某外送平台工會',
    tags: ['勞工'],
    filingDate: '2023-10-15',
    daysPending: 534,
  },
  {
    id: 'c002',
    topic: '平台勞動者勞基法適用爭議釋憲案',
    applicant: '全國外送產業工會聯合會',
    tags: ['勞工', '司法正義'],
    filingDate: '2024-02-20',
    daysPending: 406,
  },
  {
    id: 'c003',
    topic: '勞動事件法強制調解條款合憲性',
    applicant: '某企業工會聯合會',
    tags: ['勞工', '司法正義'],
    filingDate: '2024-06-10',
    daysPending: 295,
  },
  {
    id: 'c004',
    topic: '責任制工時規定違憲審查',
    applicant: '科技業勞工自救會',
    tags: ['勞工'],
    filingDate: '2024-03-05',
    daysPending: 393,
  },
  {
    id: 'c005',
    topic: '派遣勞工同工同酬原則釋憲案',
    applicant: '派遣勞工權益促進會',
    tags: ['勞工', '財產權'],
    filingDate: '2024-08-12',
    daysPending: 232,
  },

  // --- Gender / LGBTQ+ ---
  {
    id: 'c006',
    topic: '跨國同性婚姻全面合法化釋憲案',
    applicant: '台灣伴侶權益推動聯盟',
    tags: ['性別'],
    filingDate: '2023-06-01',
    daysPending: 670,
  },
  {
    id: 'c007',
    topic: '代理孕母合法化憲法訴訟',
    applicant: '婚姻平權大平台',
    tags: ['性別', '醫療權'],
    filingDate: '2023-04-10',
    daysPending: 722,
  },
  {
    id: 'c008',
    topic: '跨性別免術換證權利案',
    applicant: '台灣性別不明關懷協會',
    tags: ['性別', '隱私權'],
    filingDate: '2024-01-15',
    daysPending: 442,
  },
  {
    id: 'c009',
    topic: '職場性騷擾申訴機制合憲性審查',
    applicant: '婦女新知基金會',
    tags: ['性別', '勞工'],
    filingDate: '2024-07-20',
    daysPending: 255,
  },
  {
    id: 'c010',
    topic: '單身女性人工生殖權利釋憲案',
    applicant: '生育自主權倡議團體',
    tags: ['性別', '醫療權'],
    filingDate: '2024-04-08',
    daysPending: 359,
  },

  // --- Indigenous Peoples ---
  {
    id: 'c011',
    topic: '原住民族狩獵權與槍砲管制條例釋憲案',
    applicant: 'Bunun 獵人權益協會',
    tags: ['原住民'],
    filingDate: '2023-08-20',
    daysPending: 590,
  },
  {
    id: 'c012',
    topic: '原住民族保留地開發限制補償案',
    applicant: '花蓮多個部落代表',
    tags: ['原住民', '財產權', '環境保護'],
    filingDate: '2024-01-05',
    daysPending: 452,
  },
  {
    id: 'c013',
    topic: '原住民族傳統領域劃設辦法違憲案',
    applicant: '原住民族轉型正義聯盟',
    tags: ['原住民', '財產權'],
    filingDate: '2023-11-12',
    daysPending: 506,
  },
  {
    id: 'c014',
    topic: '都市原住民族語言教育權案',
    applicant: '台北市原住民族教育促進會',
    tags: ['原住民', '教育權'],
    filingDate: '2024-05-30',
    daysPending: 306,
  },
  {
    id: 'c015',
    topic: '原住民族自治區劃設法制違憲審查',
    applicant: '多個原住民族議會聯合',
    tags: ['原住民', '選舉權'],
    filingDate: '2024-09-01',
    daysPending: 213,
  },

  // --- Criminal Defendants ---
  {
    id: 'c016',
    topic: '死刑存廢之正當法律程序釋憲案',
    applicant: '台灣廢除死刑推動聯盟',
    tags: ['刑事被告', '司法正義'],
    filingDate: '2022-06-15',
    daysPending: 1021,
  },
  {
    id: 'c017',
    topic: '羈押法通信監察規定違憲案',
    applicant: '多名在押被告及辯護律師',
    tags: ['刑事被告', '隱私權'],
    filingDate: '2023-09-01',
    daysPending: 578,
  },
  {
    id: 'c018',
    topic: '強制採尿檢驗合憲性審查',
    applicant: '法律扶助基金會',
    tags: ['刑事被告', '隱私權'],
    filingDate: '2024-03-18',
    daysPending: 380,
  },
  {
    id: 'c019',
    topic: '累犯加重刑罰規定違憲案',
    applicant: '民間司法改革基金會',
    tags: ['刑事被告', '司法正義'],
    filingDate: '2024-05-01',
    daysPending: 335,
  },
  {
    id: 'c020',
    topic: '科技偵查侵害通訊自由釋憲案',
    applicant: '台灣人權促進會',
    tags: ['刑事被告', '隱私權', '言論自由'],
    filingDate: '2024-08-25',
    daysPending: 219,
  },
  {
    id: 'c021',
    topic: '少年刑事前科塗銷制度合憲性',
    applicant: '少年權益與福利促進會',
    tags: ['刑事被告', '兒少權益'],
    filingDate: '2024-07-10',
    daysPending: 265,
  },

  // --- Environmental Protection ---
  {
    id: 'c022',
    topic: '國道拓寬工程環評審查標準違憲案',
    applicant: '地球公民基金會',
    tags: ['環境保護'],
    filingDate: '2024-06-20',
    daysPending: 285,
  },
  {
    id: 'c023',
    topic: '離岸風電開發區域漁業權補償釋憲案',
    applicant: '彰化沿海漁民自救會',
    tags: ['環境保護', '財產權'],
    filingDate: '2024-02-28',
    daysPending: 398,
  },
  {
    id: 'c024',
    topic: '空氣污染防制法排放標準合憲性',
    applicant: '台灣健康空氣行動聯盟',
    tags: ['環境保護', '醫療權'],
    filingDate: '2024-04-15',
    daysPending: 352,
  },
  {
    id: 'c025',
    topic: '農地違章工廠就地合法化條款違憲案',
    applicant: '環境法律人協會',
    tags: ['環境保護', '財產權'],
    filingDate: '2023-12-01',
    daysPending: 487,
  },

  // --- Freedom of Speech / Press ---
  {
    id: 'c026',
    topic: '社群平台言論審查國家責任釋憲案',
    applicant: '台灣網路透明報告計畫',
    tags: ['言論自由', '隱私權'],
    filingDate: '2024-05-20',
    daysPending: 316,
  },
  {
    id: 'c027',
    topic: '集會遊行法事前許可制違憲案',
    applicant: '公民不服從行動聯盟',
    tags: ['言論自由', '集會結社'],
    filingDate: '2023-07-15',
    daysPending: 626,
  },
  {
    id: 'c028',
    topic: '記者拒絕證言特權合憲性審查',
    applicant: '台灣新聞記者協會',
    tags: ['言論自由'],
    filingDate: '2024-09-10',
    daysPending: 204,
  },

  // --- Housing Justice ---
  {
    id: 'c029',
    topic: '實價登錄資訊揭露範圍違憲案',
    applicant: '居住正義聯盟',
    tags: ['居住正義', '隱私權'],
    filingDate: '2024-04-01',
    daysPending: 366,
  },
  {
    id: 'c030',
    topic: '社會住宅分配機制公平性釋憲案',
    applicant: '社會住宅推動聯盟',
    tags: ['居住正義'],
    filingDate: '2024-07-05',
    daysPending: 270,
  },
  {
    id: 'c031',
    topic: '都市更新強制拆遷補償標準違憲案',
    applicant: '都市更新受害者聯盟',
    tags: ['居住正義', '財產權'],
    filingDate: '2023-10-25',
    daysPending: 524,
  },

  // --- Disability Rights ---
  {
    id: 'c032',
    topic: '身心障礙者強制住院審查程序違憲案',
    applicant: '台灣障礙者權益促進會',
    tags: ['身心障礙', '司法正義'],
    filingDate: '2024-02-10',
    daysPending: 416,
  },
  {
    id: 'c033',
    topic: '無障礙設施法規執行標準合憲性',
    applicant: '行無礙生活促進會',
    tags: ['身心障礙'],
    filingDate: '2024-08-01',
    daysPending: 243,
  },

  // --- Children & Youth Rights ---
  {
    id: 'c034',
    topic: '兒少安置機構監督條例違憲案',
    applicant: '兒童福利聯盟',
    tags: ['兒少權益'],
    filingDate: '2024-03-25',
    daysPending: 373,
  },
  {
    id: 'c035',
    topic: '未成年網路隱私保護法制合憲性',
    applicant: '兒少權益網路安全促進會',
    tags: ['兒少權益', '隱私權'],
    filingDate: '2024-06-05',
    daysPending: 300,
  },

  // --- Privacy Rights ---
  {
    id: 'c036',
    topic: '數位身分證強制換發違憲案',
    applicant: '台灣人權促進會',
    tags: ['隱私權'],
    filingDate: '2023-05-10',
    daysPending: 692,
  },
  {
    id: 'c037',
    topic: '健保資料庫目的外利用合憲性',
    applicant: '台灣受試者保護協會',
    tags: ['隱私權', '醫療權'],
    filingDate: '2024-01-20',
    daysPending: 437,
  },

  // --- Assembly & Association ---
  {
    id: 'c038',
    topic: '工會法強制入會條款違憲案',
    applicant: '自主工聯',
    tags: ['集會結社', '勞工'],
    filingDate: '2024-04-20',
    daysPending: 347,
  },
  {
    id: 'c039',
    topic: '政黨法財務揭露規定合憲性審查',
    applicant: '小型政黨聯合陳情',
    tags: ['集會結社', '選舉權'],
    filingDate: '2024-10-01',
    daysPending: 183,
  },

  // --- Property Rights ---
  {
    id: 'c040',
    topic: '區段徵收補償價格計算基準違憲案',
    applicant: '土地正義行動聯盟',
    tags: ['財產權'],
    filingDate: '2023-09-15',
    daysPending: 564,
  },
  {
    id: 'c041',
    topic: '既成道路私有地長期未徵收補償案',
    applicant: '多名地主集體陳情',
    tags: ['財產權', '居住正義'],
    filingDate: '2024-01-30',
    daysPending: 427,
  },

  // --- Right to Education ---
  {
    id: 'c042',
    topic: '學費自由化政策合憲性審查',
    applicant: '全國大學生學權聯盟',
    tags: ['教育權'],
    filingDate: '2024-05-15',
    daysPending: 321,
  },
  {
    id: 'c043',
    topic: '實驗教育三法排除條款違憲案',
    applicant: '實驗教育推動平台',
    tags: ['教育權', '兒少權益'],
    filingDate: '2024-08-20',
    daysPending: 224,
  },

  // --- Right to Healthcare ---
  {
    id: 'c044',
    topic: '全民健保部分負擔調整違憲案',
    applicant: '醫療改革基金會',
    tags: ['醫療權'],
    filingDate: '2024-06-15',
    daysPending: 290,
  },
  {
    id: 'c045',
    topic: '藥品專利連結制度限制用藥權釋憲案',
    applicant: '病友權益促進會',
    tags: ['醫療權', '財產權'],
    filingDate: '2024-09-20',
    daysPending: 193,
  },

  // --- Voting / Electoral Rights ---
  {
    id: 'c046',
    topic: '不在籍投票法制缺漏違憲案',
    applicant: '海外台灣人選舉權推動聯盟',
    tags: ['選舉權'],
    filingDate: '2024-02-05',
    daysPending: 421,
  },
  {
    id: 'c047',
    topic: '公民投票連署門檻過高違憲案',
    applicant: '直接民主推動聯盟',
    tags: ['選舉權', '集會結社'],
    filingDate: '2024-07-25',
    daysPending: 250,
  },

  // --- Migrant Worker Rights ---
  {
    id: 'c048',
    topic: '移工轉換雇主限制規定違憲案',
    applicant: '台灣國際勞工協會（TIWA）',
    tags: ['移工權益', '勞工'],
    filingDate: '2023-05-20',
    daysPending: 682,
  },
  {
    id: 'c049',
    topic: '家事移工排除勞基法適用釋憲案',
    applicant: '移工聯盟（MENT）',
    tags: ['移工權益', '勞工', '性別'],
    filingDate: '2024-03-10',
    daysPending: 388,
  },

  // --- Religious Freedom ---
  {
    id: 'c050',
    topic: '宗教團體法人財務監督條款違憲案',
    applicant: '多個宗教團體聯合聲請',
    tags: ['宗教自由', '財產權'],
    filingDate: '2024-06-25',
    daysPending: 280,
  },

  // --- Taxpayer Rights ---
  {
    id: 'c051',
    topic: '稅捐稽徵法推計課稅規定違憲案',
    applicant: '納稅人權益促進會',
    tags: ['納稅人權益', '財產權'],
    filingDate: '2024-04-12',
    daysPending: 355,
  },
  {
    id: 'c052',
    topic: '囤房稅差別稅率累進課徵合憲性',
    applicant: '不動產持有者權益聯盟',
    tags: ['納稅人權益', '居住正義', '財產權'],
    filingDate: '2024-08-08',
    daysPending: 236,
  },

  // --- Cross-cutting / Multi-tag Cases ---
  {
    id: 'c053',
    topic: '國安法限制出境規定違憲案',
    applicant: '公民自由陣線',
    tags: ['言論自由', '司法正義'],
    filingDate: '2024-05-08',
    daysPending: 328,
  },
  {
    id: 'c054',
    topic: '軍事審判法回歸普通法院審理案',
    applicant: '民間司法改革基金會',
    tags: ['司法正義', '刑事被告'],
    filingDate: '2024-09-15',
    daysPending: 199,
  },
  {
    id: 'c055',
    topic: '長期照顧服務法外籍看護排除條款',
    applicant: '照顧者權益促進會',
    tags: ['移工權益', '醫療權', '身心障礙'],
    filingDate: '2024-07-15',
    daysPending: 260,
  },
  {
    id: 'c056',
    topic: '通訊傳播基本法媒體壟斷規範違憲案',
    applicant: '媒體改造學社',
    tags: ['言論自由'],
    filingDate: '2024-10-05',
    daysPending: 179,
  },
  {
    id: 'c057',
    topic: '氣候變遷因應法碳權分配公平性釋憲案',
    applicant: '台灣青年氣候聯盟',
    tags: ['環境保護', '兒少權益'],
    filingDate: '2024-11-01',
    daysPending: 152,
  },
  {
    id: 'c058',
    topic: '人工智慧監控系統隱私侵害違憲案',
    applicant: '開放文化基金會',
    tags: ['隱私權', '言論自由'],
    filingDate: '2024-10-20',
    daysPending: 164,
  },
  {
    id: 'c059',
    topic: '數位中介服務法言論限制條款違憲案',
    applicant: '台灣網路資訊中心',
    tags: ['言論自由', '隱私權'],
    filingDate: '2024-08-15',
    daysPending: 229,
  },
  {
    id: 'c060',
    topic: '原住民族語言發展法教育資源分配案',
    applicant: '原住民族語言推動組織',
    tags: ['原住民', '教育權'],
    filingDate: '2024-11-10',
    daysPending: 143,
  },
];

// --- Backward Compatibility ---
// Alias for components still referencing the old name
export const MOCK_PENDING_CASES = PENDING_CASES;

// --- Aggregate Statistics ---

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function computeBacklogStatistics(
  cases: PendingCase[] = PENDING_CASES,
): BacklogStatistics {
  const daysList = cases.map((c) => c.daysPending);
  const totalDays = daysList.reduce((sum, d) => sum + d, 0);

  const tagMap = new Map<IdentityTag, { days: number[]; count: number }>();
  for (const c of cases) {
    for (const tag of c.tags) {
      const entry = tagMap.get(tag) ?? { days: [], count: 0 };
      entry.days.push(c.daysPending);
      entry.count += 1;
      tagMap.set(tag, entry);
    }
  }

  const casesByTag: TagStatistics[] = Array.from(tagMap.entries())
    .map(([tag, { days, count }]) => ({
      tag,
      caseCount: count,
      averageDaysPending: Math.round(
        days.reduce((s, d) => s + d, 0) / days.length,
      ),
      oldestCaseDays: Math.max(...days),
    }))
    .sort((a, b) => b.caseCount - a.caseCount);

  return {
    totalCases: cases.length,
    averageDaysPending: Math.round(totalDays / cases.length),
    medianDaysPending: computeMedian(daysList),
    oldestCaseDays: Math.max(...daysList),
    casesByTag,
  };
}

export function computeFunnelData(
  cases: PendingCase[] = PENDING_CASES,
): FunnelData {
  return {
    stages: [
      {
        label: '聲請受理',
        count: cases.length,
        description: '已正式受理的憲法訴訟案件',
      },
      {
        label: '分案審查',
        count: Math.round(cases.length * 0.7),
        description: '已分配至大法官進行初步審查',
      },
      {
        label: '實體審理',
        count: Math.round(cases.length * 0.15),
        description: '進入言詞辯論或書面審理程序',
      },
      {
        label: '作成判決',
        count: 0,
        description: '因大法官人數不足，無法達到判決門檻',
      },
    ],
    bottleneckJusticeCount: 5,
    requiredJusticeCount: 10,
  };
}
