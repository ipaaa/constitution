import type { QuizMeta } from "./controversy";

export const pendingQuiz: QuizMeta = {
  id: "pending",
  title: "憲法法庭還在等你：被擋住的正義",
  description: "5 道題目，了解憲法法庭停擺對真實人民的影響。",
  sourceRoute: "/future",
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
      question: "目前憲法法庭有多少件待審案件積壓？",
      options: [
        { label: "A", text: "約 50 件" },
        { label: "B", text: "約 150 件" },
        { label: "C", text: "約 300 件" },
        { label: "D", text: "約 473 件以上" },
      ],
      correctIndex: 3,
      explanation:
        "憲法法庭目前積壓約 473 件以上待審案件。這些案件涵蓋勞工權益、性別平等、原住民權利等各種議題，每一件背後都有等不到正義的當事人。",
    },
    {
      id: "q2",
      question:
        "以下哪一類案件「不是」目前在憲法法庭等待審理的真實案件類型？",
      options: [
        { label: "A", text: "勞工加班工時規定違憲" },
        { label: "B", text: "性侵害追訴時效規定違憲" },
        { label: "C", text: "原住民狩獵權爭議" },
        { label: "D", text: "核能發電廠運轉許可爭議" },
      ],
      correctIndex: 3,
      explanation:
        "勞工加班工時、性侵害追訴時效、原住民狩獵權都是目前真實等待憲法法庭審理的案件類型。核能發電廠運轉許可爭議並非目前待審案件。法庭停擺意味著這些真實的權利爭議無法獲得解決。",
    },
    {
      id: "q3",
      question: "憲法法庭大法官的法定員額是幾人？",
      options: [
        { label: "A", text: "8 人" },
        { label: "B", text: "10 人" },
        { label: "C", text: "12 人" },
        { label: "D", text: "15 人" },
      ],
      correctIndex: 3,
      explanation:
        "憲法法庭大法官法定員額為 15 人。但因 2024 年 10 月有 7 位大法官任期屆滿離任，加上立法院兩次否決總統提名，目前僅剩 8 位在任大法官，遠低於法定員額。",
    },
    {
      id: "q4",
      question: "賴清德總統兩次提名大法官人選，結果如何？",
      options: [
        { label: "A", text: "第一次通過、第二次被否決" },
        { label: "B", text: "兩次都被立法院否決" },
        { label: "C", text: "兩次都通過" },
        { label: "D", text: "尚未進行投票" },
      ],
      correctIndex: 1,
      explanation:
        "兩次提名均遭國民黨與民眾黨控制的立法院否決。第一次為 2024 年 12 月 24 日，第二次為 2025 年 7 月 25 日。這使得憲法法庭始終無法補足人數，違憲審查持續停擺。",
    },
    {
      id: "q5",
      question: "目前實際出席參與憲法法庭評議的大法官有幾位？",
      options: [
        { label: "A", text: "3 位" },
        { label: "B", text: "5 位" },
        { label: "C", text: "8 位" },
        { label: "D", text: "10 位" },
      ],
      correctIndex: 1,
      explanation:
        "雖然目前有 8 位在任大法官，但蔡宗珍、楊惠欽、朱富美三位大法官拒絕出席，實際參與評議的只有 5 位。這遠低於修法後的 10 人門檻，也是法庭運作困難的關鍵原因。",
    },
  ],
};
