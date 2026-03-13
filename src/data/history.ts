export type HistoryEvent = {
  id: string;
  textbook: {
    chapter: string;
    content: React.ReactNode | string;
    handwriting: string;
  };
  reality: {
    year: string;
    title: string;
    ruling: string;
    bgImage: string;
  };
};

// Using raw HTML string for the content to support the specific highlight span requested
export const HISTORY_DATA: HistoryEvent[] = [
  {
    id: 'h1',
    textbook: {
      chapter: '第六課：民主政治與選舉',
      content: '我國實行民主共和，主權在民。人民有權透過<span class="textbook-highlight">自由、平等的定期選舉</span>，選出中央與地方公職人員，落實責任政治與政黨政治的理念。',
      handwriting: '但曾經，國會議員是不用改選的！'
    },
    reality: {
      year: '1990',
      title: '你能親手選出新國會，終結萬年國代。',
      ruling: '野百合學運・釋字第 261 號・終結中央民意代表無限期延任',
      bgImage: 'https://images.unsplash.com/photo-1596701192534-77db54be22b9?q=80&w=2070&auto=format&fit=crop'
    }
  },
  {
    id: 'h2',
    textbook: {
      chapter: '第十章：基本人權保障 (言論自由)',
      content: '憲法第十一條規定人民有言論、講學、著作及出版之自由。國家應給予最大限度之維護，俾其實現自我、溝通意見、追求真理及監督各種政治或社會活動之功能得以發揮。',
      handwriting: '以前說實話可能會被抓去關？'
    },
    reality: {
      year: '1991',
      title: '你不再因為思想不同而被判定為叛亂罪。',
      ruling: '廢除刑法100條運動・保障和平表達政治異議的自由',
      bgImage: 'https://images.unsplash.com/photo-1552872673-9b7b99711ebb?q=80&w=2070&auto=format&fit=crop'
    }
  },
  {
    id: 'h3',
    textbook: {
      chapter: '第十章：基本人權保障 (集會結社)',
      content: '我國憲法第十四條規定：「人民有集會及結社之自由。」這代表公民基於共同目的，有權<span class="textbook-highlight">和平集會、遊行表達訴求</span>，國家不得任意限制。',
      handwriting: '以前上街頭會先被當罪犯？'
    },
    reality: {
      year: '1998',
      title: '你走上街頭抗議、不必先被當成罪犯。',
      ruling: '釋字第 445 號・確立集會遊行是受憲法保障的基本權利',
      bgImage: 'https://images.unsplash.com/photo-1529144415895-6aaf8be872fb?q=80&w=2034&auto=format&fit=crop'
    }
  },
  {
    id: 'h4',
    textbook: {
      chapter: '第十二章：多元社會與平權',
      content: '憲法第七條明定：「中華民國人民，無分男女、宗教、種族、階級、黨派，在法律上一律平等。」現代社會更應保障<span class="textbook-highlight">不同性傾向者的婚姻自由</span>。',
      handwriting: '🌈 必考：釋字748號！'
    },
    reality: {
      year: '2017',
      title: '你身邊的同志朋友可以合法結婚。',
      ruling: '釋字第 748 號・確認婚姻自由不應因性傾向而被排除',
      bgImage: 'https://images.unsplash.com/photo-1562214691-88df5e8c156f?q=80&w=2070&auto=format&fit=crop'
    }
  },
  {
    id: 'h5',
    textbook: {
      chapter: '第五課：權力分立與制衡',
      content: '國家權力分為行政、立法、司法、考試、監察，五權分治、平等相維。當機關間發生職權爭議時，應由<span class="textbook-highlight">憲法法庭</span>作為最終的仲裁者，以確保憲政機關不越權。',
      handwriting: '但若仲裁者自己面臨癱瘓呢？'
    },
    reality: {
      year: '2024',
      title: '最高權力衝突的最終防線，正臨挑戰。',
      ruling: '國會職權修法爭議・114年憲判字第1號・憲政體制的韌性測試',
      bgImage: 'https://images.unsplash.com/photo-1505664173622-c324c585ef18?q=80&w=2070&auto=format&fit=crop'
    }
  }
];
