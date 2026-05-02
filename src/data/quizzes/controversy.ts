export interface QuizOption {
  label: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctIndex: number;
  explanation: string;
}

export interface ResultLevel {
  minScore: number;
  title: string;
  description: string;
}

export interface QuizMeta {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  resultLevels: ResultLevel[];
  sourceRoute: string;
}

export const controversyQuiz: QuizMeta = {
  id: "controversy",
  title: "你對憲法法庭爭議了解多少？",
  description: "5 道題目，測試你對 2024-2025 台灣憲政風暴的了解程度。",
  sourceRoute: "/controversy-timeline",
  resultLevels: [
    {
      minScore: 5,
      title: "憲法達人",
      description: "恭喜你！你的憲政素養令人印象深刻。",
    },
    {
      minScore: 4,
      title: "憲法觀察家",
      description: "你對憲政問題有相當的理解力！",
    },
    {
      minScore: 2,
      title: "憲法見習生",
      description: "你已經比很多人更關心這件事了。",
    },
    {
      minScore: 0,
      title: "憲法小白",
      description: "沒關係，現在開始關心還來得及！",
    },
  ],
  questions: [
    {
      id: "q1",
      question:
        "2024年5月，國民黨與民眾黨聯手三讀通過「國會改革法案」，引發數萬人包圍立法院。這場群眾運動被稱為什麼？",
      options: [
        { label: "A", text: "太陽花運動" },
        { label: "B", text: "野百合運動" },
        { label: "C", text: "青鳥行動" },
        { label: "D", text: "白色力量運動" },
      ],
      correctIndex: 2,
      explanation:
        "這是 2014 年太陽花運動以來最大規模的國會相關群眾運動。憲法法庭隨後在 113 年憲判字第 9 號判決中宣告國會擴權法案多項核心條文違憲——但這個判決也激化了國會多數對法庭本身的反擊。",
    },
    {
      id: "q2",
      question:
        "國會擴權法案被宣告違憲後，立法院隨即修改《憲法訴訟法》反制。修法後，憲法法庭作成判決需要至少幾位大法官參與評議？",
      options: [
        { label: "A", text: "8 人" },
        { label: "B", text: "9 人" },
        { label: "C", text: "10 人" },
        { label: "D", text: "15 人" },
      ],
      correctIndex: 2,
      explanation:
        "這是「修法加卡人」雙殺策略的核心。表面上是「提高司法品質」，實際上搭配立法院拒絕行使大法官人事同意權，讓法庭永遠湊不到開庭人數。大法官法定員額 15 人，但 2024 年 10 月 31 日一口氣有 7 位大法官任期屆滿離任，僅剩 8 位——根本達不到 10 人門檻。",
    },
    {
      id: "q3",
      question:
        "賴清德總統兩次提名大法官人選送立法院行使同意權，結果如何？",
      options: [
        { label: "A", text: "第一次通過、第二次被否決" },
        { label: "B", text: "立法院尚未進行投票" },
        { label: "C", text: "兩次都通過，但被提名人自行辭退" },
        { label: "D", text: "兩次都被立法院投票否決" },
      ],
      correctIndex: 3,
      explanation:
        "第一次提名（2024 年 12 月 24 日）和第二次提名（2025 年 7 月 25 日）均遭國民黨與民眾黨控制的立法院否決。這使得憲法法庭始終無法補足人數，違憲審查持續停擺。",
    },
    {
      id: "q4",
      question: "憲法法庭停擺期間，有多少件待審案件在排隊等待？",
      options: [
        { label: "A", text: "約 50 件" },
        { label: "B", text: "約 150 件" },
        { label: "C", text: "約 300 件" },
        { label: "D", text: "約 473 件以上" },
      ],
      correctIndex: 3,
      explanation:
        "這些不是抽象數字——涵蓋勞工加班工時、性侵害追訴時效、原住民權利、刑事被告人權等真實案件。每一件背後都有等不到正義的當事人。法庭停擺不只是政治角力，更是人民喪失釋憲救濟管道。",
    },
    {
      id: "q5",
      question:
        "2025 年 12 月，憲法法庭作成 114 年憲判字第 1 號判決，宣告《憲法訴訟法》修正案違憲。當時 8 位在任大法官中，最終有幾位參與作成這份判決？",
      options: [
        { label: "A", text: "3 位" },
        { label: "B", text: "5 位" },
        { label: "C", text: "8 位" },
        { label: "D", text: "10 位" },
      ],
      correctIndex: 1,
      explanation:
        "蔡宗珍、楊惠欽、朱富美三位大法官拒絕參與，最終僅 5 位大法官作成判決。判決確立了「立法權不得以修法方式實質廢除違憲審查」的憲政原則。張娟芬稱之為「台灣憲政制度的不自殺聲明」。",
    },
  ],
};
