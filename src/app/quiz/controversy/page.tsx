import type { Metadata } from "next";
import { controversyQuiz } from "@/data/quizzes/controversy";
import QuizContainer from "@/components/quiz/QuizContainer";

export const metadata: Metadata = {
  title: "你對憲法法庭爭議了解多少？ | Add C0urt 憲庭加好友",
  description:
    "5 道題目，測試你對 2024-2025 台灣憲政風暴的了解程度。測完還能分享結果！",
  openGraph: {
    title: "你對憲法法庭爭議了解多少？",
    description:
      "5 道題目，測試你對台灣憲政風暴的了解程度。來測測你的憲法素養！",
    type: "website",
    locale: "zh_TW",
    images: [
      { url: "/owl-avatars/owl.png", width: 360, height: 360, alt: "Add C0urt 憲法測驗" },
    ],
  },
};

export default function ControversyQuizPage() {
  return (
    <div className="min-h-screen bg-pearl">
      <div className="max-w-xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-8">
          <span className="inline-block bg-royal-purple text-white text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide">
            憲法測驗
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif leading-relaxed">
            {controversyQuiz.title}
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            {controversyQuiz.description}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <QuizContainer quiz={controversyQuiz} />
        </div>
      </div>
    </div>
  );
}
