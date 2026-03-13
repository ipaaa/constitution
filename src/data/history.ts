export type HistoryEvent = {
  id: string;
  year: string;
  title: string;
  description: string;
  type: 'milestone' | 'conflict' | 'resolution';
};

export const HISTORY_DATA: HistoryEvent[] = [
  {
    id: 'h1',
    year: '1947',
    title: '中華民國憲法頒布',
    description: '在中國大陸時期制定，隨後政府遷台。這部憲法在那時的台灣社會，與真實的政治運作產生了巨大的落差。',
    type: 'milestone',
  },
  {
    id: 'h2',
    year: '1948 - 1991',
    title: '動員戡亂與戒嚴時期',
    description: '動員戡亂時期臨時條款凍結了部分憲法條文，台灣進入長達四十年的戒嚴。憲法保障的言論、結社自由被大幅限制。',
    type: 'conflict',
  },
  {
    id: 'h3',
    year: '1990',
    title: '野百合學運',
    description: '學生聚集在中正紀念堂，要求解散國民大會、廢除臨時條款。這是台灣社會對「回歸憲政」最巨大的怒吼。',
    type: 'conflict',
  },
  {
    id: 'h4',
    year: '1991 - 2005',
    title: '七次修憲：臺灣民主化',
    description: '透過七次修憲，廢除臨時條款、國會全面改選、總統直選，逐步將這部憲法修改為符合台灣現狀的民主架構。',
    type: 'resolution',
  },
  {
    id: 'h5',
    year: '2017',
    title: '釋字第748號：婚姻平權',
    description: '大法官宣告民法未保障同性婚姻違憲。憲法不再只是冷冰冰的條文，而是真實保護少數群體權利的盾牌。',
    type: 'milestone',
  },
  {
    id: 'h6',
    year: '2024',
    title: '國會職權修法爭議',
    description: '立法院通過職權行使法修正案，引發「擴權」爭議與青鳥行動。憲法法庭再次成為解決國家最高權力衝突的最終防線。',
    type: 'conflict',
  }
];
