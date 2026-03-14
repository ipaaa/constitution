// src/data/future.ts

export type IdentityTag = '勞工' | '性別' | '原住民' | '刑事被告' | '環境保護';

export interface PendingCase {
  id: string;
  topic: string;
  applicant: string;
  tags: IdentityTag[];
  daysPending: number; // For visualization, longer equals more "urgent/stuck"
}

// 1. Array of tags for the Filter Bar
export const AVAILABLE_TAGS: IdentityTag[] = ['勞工', '性別', '原住民', '刑事被告', '環境保護'];

// 2. Mock Data for the 124 pending cases (we will just generate a mix for the visualization)
// We provide around 30 concrete cases to show in a detail view, and simulate the rest as dots.

export const MOCK_PENDING_CASES: PendingCase[] = [
  {
    id: 'c01',
    topic: '勞工退休準備金提撥違憲審查',
    applicant: '某外送員工會',
    tags: ['勞工'],
    daysPending: 450,
  },
  {
    id: 'c02',
    topic: '代理孕母合法化釋憲草案',
    applicant: '婚姻平權倡議團體',
    tags: ['性別'],
    daysPending: 680,
  },
  {
    id: 'c03',
    topic: '原住民狩獵槍枝管制條例違憲案',
    applicant: 'Bunun 獵人協會',
    tags: ['原住民'],
    daysPending: 320,
  },
  {
    id: 'c04',
    topic: '死刑存廢之正當法律程序再審',
    applicant: '廢死聯盟',
    tags: ['刑事被告'],
    daysPending: 890,
  },
  {
    id: 'c05',
    topic: '國道開墾環評審查標準違憲案',
    applicant: '地球公民基金會',
    tags: ['環境保護'],
    daysPending: 210,
  },
  {
    id: 'c06',
    topic: '移工轉換雇主限制違憲審查',
    applicant: '台灣國際勞工協會',
    tags: ['勞工', '性別'],
    daysPending: 560,
  },
  {
    id: 'c07',
    topic: '原住民保留地開發限制補償案',
    applicant: '多個原鄉部落代表',
    tags: ['原住民', '環境保護'],
    daysPending: 150,
  },
  {
    id: 'c08',
    topic: '羈押法關於通信限制規定違憲案',
    applicant: '多名在押被告',
    tags: ['刑事被告'],
    daysPending: 410,
  },
];
