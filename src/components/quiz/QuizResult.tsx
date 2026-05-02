"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ResultLevel } from "@/data/quizzes/controversy";

interface QuizResultProps {
  score: number;
  total: number;
  quizId: string;
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

const SITE_DOMAIN = "addcourt.tw";

export default function QuizResult({
  score,
  total,
  quizId,
  quizTitle,
  resultLevels,
  sourceRoute,
}: QuizResultProps) {
  const [copied, setCopied] = useState(false);
  const [threadsCopied, setThreadsCopied] = useState(false);
  const level = getResultLevel(score, resultLevels);

  const quizUrl = `https://${SITE_DOMAIN}/quiz/${quizId}`;
  const resultText = `我在「${quizTitle}」測驗中得到 ${score}/${total}「${level.title}」`;
  const shareText = `${resultText}\n你也來試試 → ${quizUrl}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLine = () => {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(quizUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareFB = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(quizUrl)}&quote=${encodeURIComponent(resultText + "\n你也來試試 →")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareThreads = async () => {
    await copyToClipboard(shareText);
    setThreadsCopied(true);
    setTimeout(() => setThreadsCopied(false), 3000);
  };

  const handleShareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(resultText + "\n你也來試試 →")}&url=${encodeURIComponent(quizUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
          onClick={handleCopy}
          className="w-full py-3 rounded-xl bg-royal-purple text-white font-bold text-base hover:bg-midnight transition-colors"
        >
          {copied ? "已複製！" : "複製結果"}
        </button>

        <div className="flex justify-center gap-2 pt-1">
          <button
            onClick={handleShareLine}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#06C755] hover:bg-green-50 transition-colors"
          >
            LINE
          </button>
          <button
            onClick={handleShareFB}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#1877F2] hover:bg-blue-50 transition-colors"
          >
            FB
          </button>
          <button
            onClick={handleShareThreads}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors relative"
          >
            {threadsCopied ? "已複製" : "Threads"}
          </button>
          <button
            onClick={handleShareX}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            X
          </button>
        </div>

        {threadsCopied && (
          <p className="text-xs text-gray-500 -mt-1">
            已複製，前往 Threads 貼上
          </p>
        )}

        <Link
          href={sourceRoute}
          className="w-full py-3 rounded-xl border-2 border-royal-purple text-royal-purple font-bold text-base hover:bg-purple-50 transition-colors block"
        >
          深入了解這場爭議
        </Link>

        <Link
          href="/quiz"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors pt-2"
        >
          更多測驗
        </Link>
      </div>
    </div>
  );
}
