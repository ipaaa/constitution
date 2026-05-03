import type { Metadata } from "next";
import Link from "next/link";
import { controversyQuiz } from "@/data/quizzes/controversy";
import { rightsQuiz } from "@/data/quizzes/rights";
import { pendingQuiz } from "@/data/quizzes/pending";
import { perspectivesQuiz } from "@/data/quizzes/perspectives";
import type { QuizMeta } from "@/data/quizzes/controversy";

export const metadata: Metadata = {
  title: "憲法測驗 | Add C0urt 憲庭加好友",
  description: "用互動測驗測試你的憲法素養！從入門到進階，4 組題目等你挑戰。",
  openGraph: {
    title: "憲法測驗",
    description: "用互動測驗測試你的憲法素養！從入門到進階，4 組題目等你挑戰。",
    type: "website",
    locale: "zh_TW",
    images: [
      { url: "/owl.png", width: 360, height: 360, alt: "Add C0urt 憲法測驗" },
    ],
  },
};

const quizzes: { quiz: QuizMeta; tag: string; href: string }[] = [
  {
    quiz: controversyQuiz,
    tag: "必做題組",
    href: "/quiz/controversy",
  },
  {
    quiz: rightsQuiz,
    tag: "入門友善",
    href: "/quiz/rights",
  },
  {
    quiz: pendingQuiz,
    tag: "時事關懷",
    href: "/quiz/pending",
  },
  {
    quiz: perspectivesQuiz,
    tag: "進階思辨",
    href: "/quiz/perspectives",
  },
];

export default function QuizIndexPage() {
  return (
    <div className="min-h-screen bg-pearl">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-10">
          <span className="inline-block bg-royal-purple text-white text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide">
            憲法測驗
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif leading-relaxed">
            測測你的憲法素養
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            從入門到進階，4 組題目等你挑戰。每組 5 題，測完還能分享結果！
          </p>
        </div>

        <div className="space-y-4">
          {quizzes.map(({ quiz, tag, href }) => (
            <Link
              key={quiz.id}
              href={href}
              className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full mb-2">
                    {tag}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 font-serif">
                    {quiz.title}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {quiz.description}
                  </p>
                </div>
                <span className="text-gray-400 text-xl mt-1" aria-hidden="true">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
