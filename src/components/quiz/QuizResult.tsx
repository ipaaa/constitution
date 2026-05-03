"use client";

import { useState } from "react";
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
  for (const level of levels) {
    if (score >= level.minScore) return level;
  }
  return levels[levels.length - 1];
}

// Map result level titles to pre-designed share images (IG 1080x1080)
const RESULT_IMAGE_MAP: Record<string, string> = {
  "憲法小白": "/quiz/quiz-result-novice-ig.png",
  "憲法見習生": "/quiz/quiz-result-trainee-ig.png",
  "憲法觀察家": "/quiz/quiz-result-observer-ig.png",
  "憲法達人": "/quiz/quiz-result-expert-ig.png",
};

async function fetchImageBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  return response.blob();
}

const APP_LINKS = [
  { label: "LINE", href: "https://line.me/R/nv/chat", color: "text-[#06C755]" },
  { label: "IG", href: "instagram://library", color: "text-[#E4405F]" },
  { label: "Threads", href: "barcelona://create", color: "text-gray-900" },
  { label: "FB", href: "fb://publish", color: "text-[#1877F2]" },
] as const;

export default function QuizResult({
  score,
  total,
  quizId,
  quizTitle,
  resultLevels,
  sourceRoute,
}: QuizResultProps) {
  const [sharing, setSharing] = useState(false);
  const [fallbackMsg, setFallbackMsg] = useState(false);
  const level = getResultLevel(score, resultLevels);

  const imageUrl = RESULT_IMAGE_MAP[level.title] || RESULT_IMAGE_MAP["憲法小白"];

  const handleShare = async () => {
    setSharing(true);
    setFallbackMsg(false);
    try {
      const blob = await fetchImageBlob(imageUrl);
      const file = new File([blob], `addcourt-quiz-${quizId}.png`, {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `addcourt-quiz-${quizId}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setFallbackMsg(true);
        setTimeout(() => setFallbackMsg(false), 4000);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="text-center space-y-6">
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

      {/* Result image preview */}
      <div className="space-y-2">
        <img
          src={imageUrl}
          alt={`測驗結果：${score}/${total} ${level.title}`}
          className="w-full max-w-xs mx-auto rounded-xl shadow-md border border-gray-100"
        />
        <p className="text-xs text-gray-400">
          長按圖片儲存，分享到你的社群媒體
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-2 max-w-xs mx-auto">
        {/* Primary share button */}
        <button
          onClick={handleShare}
          disabled={sharing}
          className="w-full py-3 rounded-xl bg-royal-purple text-white font-bold text-base hover:bg-midnight transition-colors disabled:opacity-60"
        >
          {sharing ? "處理中…" : "分享"}
        </button>

        {fallbackMsg && (
          <p className="text-xs text-gray-500 -mt-1">
            已下載圖片，請手動分享到社群媒體
          </p>
        )}

        {/* App deeplink buttons */}
        <div className="flex justify-center gap-2">
          {APP_LINKS.map(({ label, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold ${color} hover:bg-gray-50 transition-colors text-center`}
            >
              {label}
            </a>
          ))}
        </div>

        <Link
          href={sourceRoute}
          className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-base hover:bg-gray-50 transition-colors block"
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
