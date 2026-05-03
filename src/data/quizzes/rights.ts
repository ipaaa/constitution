import type { QuizMeta } from "./controversy";

export const rightsQuiz: QuizMeta = {
  id: "rights",
  title: "憲法怎麼保護你？",
  description: "5 道題目，看看你對大法官釋憲如何保障人民權利的了解程度。",
  sourceRoute: "/history",
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
        "大法官曾宣告哪一項規定違憲，讓台灣成為亞洲第一個同性婚姻合法化的國家？",
      options: [
        { label: "A", text: "釋字第 603 號" },
        { label: "B", text: "釋字第 748 號" },
        { label: "C", text: "釋字第 791 號" },
        { label: "D", text: "113 年憲判字第 6 號" },
      ],
      correctIndex: 1,
      explanation:
        "釋字第 748 號宣告民法未保障同性婚姻違憲，使台灣成為亞洲第一個同性婚姻合法化的國家。這是大法官以憲法平等權與婚姻自由保障人民權利的里程碑判決。",
    },
    {
      id: "q2",
      question: "釋字第 791 號宣告刑法通姦罪違憲，主要理由是什麼？",
      options: [
        { label: "A", text: "通姦不是犯罪" },
        { label: "B", text: "違反比例原則，且實際適用結果對女性不公平" },
        { label: "C", text: "婚姻制度已經過時" },
        { label: "D", text: "國際人權公約要求" },
      ],
      correctIndex: 1,
      explanation:
        "大法官認為以刑罰手段介入私人感情關係違反比例原則，且實務上通姦罪的告訴多半由配偶對第三者提出，實際適用結果對女性不公平，構成性別歧視。",
    },
    {
      id: "q3",
      question: "釋字第 535 號限制了警察的什麼行為？",
      options: [
        { label: "A", text: "逮捕犯人" },
        { label: "B", text: "隨意臨檢" },
        { label: "C", text: "使用武器" },
        { label: "D", text: "搜索住宅" },
      ],
      correctIndex: 1,
      explanation:
        "釋字第 535 號要求警察臨檢必須有法律依據，不得任意攔查人民，保障了人民的人身自由與行動自由。這項釋憲直接影響了每個人的日常生活。",
    },
    {
      id: "q4",
      question: "大法官宣告「強制按捺指紋」違憲，保障的是人民的什麼權利？",
      options: [
        { label: "A", text: "人身自由" },
        { label: "B", text: "言論自由" },
        { label: "C", text: "隱私權（資訊自主權）" },
        { label: "D", text: "集會自由" },
      ],
      correctIndex: 2,
      explanation:
        "釋字第 603 號宣告戶籍法強制按捺指紋的規定違憲，確立了人民的「資訊隱私權」——每個人有權決定自己的個人資料是否、如何被蒐集與利用。",
    },
    {
      id: "q5",
      question: "以下哪一個釋憲案與「學生權利」直接相關？",
      options: [
        { label: "A", text: "釋字第 261 號" },
        { label: "B", text: "釋字第 382 號" },
        { label: "C", text: "釋字第 490 號" },
        { label: "D", text: "釋字第 558 號" },
      ],
      correctIndex: 1,
      explanation:
        "釋字第 382 號確立了學生在受到退學或類此處分時，有權提起行政爭訟，打破了「特別權力關係」的傳統觀念，保障了學生的訴訟權。",
    },
  ],
};
