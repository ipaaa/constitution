import type { QuizMeta } from "./controversy";

export const perspectivesQuiz: QuizMeta = {
  id: "perspectives",
  title: "你能分辨正反論點嗎？",
  description: "5 道進階題目，測試你對憲政辯論中不同立場的理解與思辨力。",
  sourceRoute: "/discussions",
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
        "「允許立法多數用程序手段癱瘓違憲審查，等於取消憲法的最高性。」這個觀點最接近哪一方的立場？",
      options: [
        { label: "A", text: "支持憲法法庭自救" },
        { label: "B", text: "支持國會多數決" },
        { label: "C", text: "中立學者" },
        { label: "D", text: "三位拒絕出席的大法官" },
      ],
      correctIndex: 0,
      explanation:
        "這是支持憲法法庭自救一方的核心論點：如果立法多數可以透過修改程序規則來癱瘓違憲審查，那麼憲法對國家權力的約束就形同虛設，憲法的最高性將被架空。",
    },
    {
      id: "q2",
      question:
        "「大法官以判決方式排除立法院所定之開會門檻，等同自己當自己案件的法官。」這個質疑涉及什麼法律原則？",
      options: [
        { label: "A", text: "比例原則" },
        { label: "B", text: "正當法律程序（nemo iudex in causa sua）" },
        { label: "C", text: "法律保留原則" },
        { label: "D", text: "信賴保護原則" },
      ],
      correctIndex: 1,
      explanation:
        "「nemo iudex in causa sua」（任何人不得為自己案件的法官）是正當法律程序的基本原則。批評者認為，大法官審查與自身開庭門檻有關的法律，存在利益衝突的疑慮。",
    },
    {
      id: "q3",
      question:
        "張娟芬在文章中用哪個國家的經驗來類比台灣的憲政危機？",
      options: [
        { label: "A", text: "匈牙利" },
        { label: "B", text: "波蘭" },
        { label: "C", text: "土耳其" },
        { label: "D", text: "美國" },
      ],
      correctIndex: 1,
      explanation:
        "張娟芬以波蘭國會用同樣手段癱瘓憲法法庭的前車之鑑作為對照，警示台灣正在走上類似的道路。波蘭的法治倒退經驗被視為民主退潮的典型案例。",
    },
    {
      id: "q4",
      question: "「反多數決困境」（counter-majoritarian difficulty）指的是什麼？",
      options: [
        { label: "A", text: "少數黨在國會中無法通過法案" },
        { label: "B", text: "少數大法官推翻多數民意通過的法律之正當性疑慮" },
        { label: "C", text: "總統否決國會法案的權力" },
        { label: "D", text: "公投門檻太高導致民意無法展現" },
      ],
      correctIndex: 1,
      explanation:
        "「反多數決困境」是憲法學的經典問題：為什麼少數幾位未經選舉的大法官，可以推翻由多數民意選出的國會所通過的法律？這是違憲審查制度正當性的核心辯論。",
    },
    {
      id: "q5",
      question:
        "蘇彥圖教授對 114 年憲判字第 1 號判決的評價是什麼？",
      options: [
        { label: "A", text: "完全正確、毫無瑕疵" },
        { label: "B", text: "完全違法、不應承認" },
        { label: "C", text: "承認此路不漂亮，但追問除此之外有何替代方案" },
        { label: "D", text: "應交由公投決定" },
      ],
      correctIndex: 2,
      explanation:
        "蘇彥圖教授的立場是務實的：他承認大法官的做法在程序上並不完美（「此路不漂亮」），但反問批評者：如果不這樣做，還有什麼其他方式可以阻止立法多數實質廢除違憲審查？",
    },
  ],
};
