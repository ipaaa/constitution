"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ResultLevel } from "@/data/quizzes/controversy";

interface QuizResultProps {
  score: number;
  total: number;
  quizTitle: string;
  resultLevels: ResultLevel[];
  sourceRoute: string;
}

function getResultLevel(score: number, levels: ResultLevel[]): ResultLevel {
  // levels are sorted descending by minScore
  for (const level of levels) {
    if (score >= level.minScore) return level;
  }
  return levels[levels.length - 1];
}

export default function QuizResult({
  score,
  total,
  quizTitle,
  resultLevels,
  sourceRoute,
}: QuizResultProps) {
  const [copied, setCopied] = useState(false);
  const level = getResultLevel(score, resultLevels);

  const shareText = `我在「${quizTitle}」測驗中答對了 ${score}/${total} 題，獲得「${level.title}」稱號！你也來試試看 ➜ addcourt.tw/quiz/controversy`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select and copy
      const textarea = document.createElement("textarea");
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <Image
          src="/owl.png"
          alt="Add C0urt 貓頭鷹"
          width={120}
          height={120}
          className="drop-shadow-lg"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-500">你的測驗結果</p>
        <p className="text-5xl font-bold text-royal-purple font-serif">
          {score}/{total}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif">
          {level.title}
        </h2>
        <p className="text-gray-600 text-base md:text-lg">{level.description}</p>
      </div>

      <div className="flex flex-col gap-3 pt-4 max-w-xs mx-auto">
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-xl bg-royal-purple text-white font-bold text-base hover:bg-midnight transition-colors"
        >
          {copied ? "已複製！" : "分享結果"}
        </button>

        <Link
          href={sourceRoute}
          className="w-full py-3 rounded-xl border-2 border-royal-purple text-royal-purple font-bold text-base hover:bg-purple-50 transition-colors block"
        >
          深入了解這場爭議
        </Link>

        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors pt-2"
        >
          回到首頁
        </Link>
      </div>
    </div>
  );
}
