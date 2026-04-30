// src/data/opinions.ts
//
// Opinion Lazybag — Constitutional Court opinion classification dataset.
//
// Source & methodology
// --------------------
// Each entry represents a classified legal argument (NOT a person) from
// Constitutional Court opinions. Arguments are coded along multiple
// ordinal dimensions by volunteer reviewers using a shared spreadsheet.
//
// No justice names, party affiliations, or personal identifiers are stored.
// The data schema physically enforces argument-based classification only.
//
// The data is curated, reviewed, and committed — not a live feed.
// Treat it as a frozen research snapshot.

/** A single stance position on an ordinal scale. */
export type StanceValue = 'support' | 'lean-support' | 'neutral' | 'lean-oppose' | 'oppose';

/** Numeric mapping for plotting: support=2, lean-support=1, neutral=0, lean-oppose=-1, oppose=-2 */
export const STANCE_NUMERIC: Record<StanceValue, number> = {
  'support': 2,
  'lean-support': 1,
  'neutral': 0,
  'lean-oppose': -1,
  'oppose': -2,
};

/** Labels for stance values in Chinese. */
export const STANCE_LABELS: Record<StanceValue, string> = {
  'support': '支持',
  'lean-support': '傾向支持',
  'neutral': '中立',
  'lean-oppose': '傾向反對',
  'oppose': '反對',
};

/** A classification dimension (axis candidate). */
export interface DimensionDef {
  id: string;
  label: string;
  supportLabel: string;
  opposeLabel: string;
}

/** A single opinion entry — one row in the spreadsheet. */
export interface OpinionEntry {
  id: string;
  rulingRef: string;
  argumentSummary: string;
  stances: Record<string, StanceValue>;
  category?: string;
}

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------

export const DIMENSIONS: DimensionDef[] = [
  {
    id: 'court-halt-stance',
    label: '是否支持法庭停止運作',
    supportLabel: '支持繼續運作',
    opposeLabel: '支持停止運作',
  },
  {
    id: 'legal-level',
    label: '法律層次判斷',
    supportLabel: '憲法層次論證',
    opposeLabel: '法律層次論證',
  },
  {
    id: 'urgency',
    label: '急迫性判斷',
    supportLabel: '具有急迫性',
    opposeLabel: '不具急迫性',
  },
  {
    id: 'criminal-law-logic',
    label: '刑事法邏輯立場',
    supportLabel: '嚴格限縮解釋',
    opposeLabel: '擴張適用解釋',
  },
];

// ---------------------------------------------------------------------------
// Seed opinion data
// ---------------------------------------------------------------------------

export const OPINIONS: OpinionEntry[] = [
  {
    id: 'op-01',
    rulingRef: '113年憲判字第9號',
    argumentSummary: '主張憲法法庭應繼續運作以保障人民訴訟權，認為停止運作將造成不可回復之損害。',
    category: '多數意見',
    stances: {
      'court-halt-stance': 'support',
      'legal-level': 'support',
      'urgency': 'support',
      'criminal-law-logic': 'support',
    },
  },
  {
    id: 'op-02',
    rulingRef: '113年憲判字第9號',
    argumentSummary: '認為現行法律修正程序合憲，法庭人數不足屬政治問題而非法律問題。',
    category: '不同意見',
    stances: {
      'court-halt-stance': 'oppose',
      'legal-level': 'oppose',
      'urgency': 'oppose',
      'criminal-law-logic': 'lean-oppose',
    },
  },
  {
    id: 'op-03',
    rulingRef: '113年憲判字第9號',
    argumentSummary: '同意法庭應繼續運作，但認為急迫性論證不夠充分，應以制度面論述為主。',
    category: '協同意見',
    stances: {
      'court-halt-stance': 'support',
      'legal-level': 'support',
      'urgency': 'lean-oppose',
      'criminal-law-logic': 'neutral',
    },
  },
  {
    id: 'op-04',
    rulingRef: '113年憲判字第9號',
    argumentSummary: '從刑事法角度主張應嚴格限縮解釋立法院的修法權限，避免擴張適用影響司法獨立。',
    category: '協同意見',
    stances: {
      'court-halt-stance': 'support',
      'legal-level': 'lean-support',
      'urgency': 'neutral',
      'criminal-law-logic': 'support',
    },
  },
  {
    id: 'op-05',
    rulingRef: '113年憲判字第9號',
    argumentSummary: '認為應從法律層次處理，無須上升至憲法層次，但同意具有一定急迫性。',
    category: '部分不同意見',
    stances: {
      'court-halt-stance': 'lean-oppose',
      'legal-level': 'oppose',
      'urgency': 'lean-support',
      'criminal-law-logic': 'lean-oppose',
    },
  },
  {
    id: 'op-06',
    rulingRef: '113年憲判字第9號',
    argumentSummary: '主張法庭運作問題具有高度急迫性，若不即時處理將動搖憲政體制根基。',
    category: '多數意見',
    stances: {
      'court-halt-stance': 'support',
      'legal-level': 'lean-support',
      'urgency': 'support',
      'criminal-law-logic': 'lean-support',
    },
  },
  {
    id: 'op-07',
    rulingRef: '113年憲判字第9號',
    argumentSummary: '採取中間立場，認為部分條文有違憲疑慮但整體修法方向尚屬合理。',
    category: '部分不同意見',
    stances: {
      'court-halt-stance': 'neutral',
      'legal-level': 'neutral',
      'urgency': 'lean-support',
      'criminal-law-logic': 'neutral',
    },
  },
  {
    id: 'op-08',
    rulingRef: '113年憲判字第9號',
    argumentSummary: '強調刑事法的擴張解釋將危及被告權益，主張應回歸嚴格解釋原則。',
    category: '協同意見',
    stances: {
      'court-halt-stance': 'lean-support',
      'legal-level': 'support',
      'urgency': 'lean-support',
      'criminal-law-logic': 'support',
    },
  },
  {
    id: 'op-09',
    rulingRef: '113年憲判字第9號',
    argumentSummary: '認為法庭停止運作雖不理想，但屬立法裁量範圍，司法不應過度介入。',
    category: '不同意見',
    stances: {
      'court-halt-stance': 'oppose',
      'legal-level': 'lean-oppose',
      'urgency': 'oppose',
      'criminal-law-logic': 'lean-oppose',
    },
  },
  {
    id: 'op-10',
    rulingRef: '113年憲判字第9號',
    argumentSummary: '從比較法觀點論證，認為多數國家憲法法院均設有最低運作人數保障，我國應比照辦理。',
    category: '協同意見',
    stances: {
      'court-halt-stance': 'support',
      'legal-level': 'support',
      'urgency': 'lean-support',
      'criminal-law-logic': 'neutral',
    },
  },
  {
    id: 'op-11',
    rulingRef: '113年憲判字第9號',
    argumentSummary: '認為急迫性問題被過度渲染，實際上現有機制足以處理過渡期案件。',
    category: '不同意見',
    stances: {
      'court-halt-stance': 'lean-oppose',
      'legal-level': 'neutral',
      'urgency': 'oppose',
      'criminal-law-logic': 'neutral',
    },
  },
  {
    id: 'op-12',
    rulingRef: '113年憲判字第9號',
    argumentSummary: '主張應區分不同類型案件的急迫程度，採取分級處理而非一刀切的判斷。',
    category: '部分不同意見',
    stances: {
      'court-halt-stance': 'lean-support',
      'legal-level': 'lean-support',
      'urgency': 'neutral',
      'criminal-law-logic': 'lean-support',
    },
  },
];
