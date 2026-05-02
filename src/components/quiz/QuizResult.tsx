"use client";

import { useState, useCallback } from "react";
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
  for (const level of levels) {
    if (score >= level.minScore) return level;
  }
  return levels[levels.length - 1];
}

const SITE_DOMAIN = "addcourt.tw";
const CANVAS_SIZE = 1080;

function generateResultImage(
  quizId: string,
  quizTitle: string,
  score: number,
  total: number,
  levelTitle: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Border
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, CANVAS_SIZE - 80, CANVAS_SIZE - 80);

  // Inner accent line at top
  ctx.fillStyle = "#6B21A8";
  ctx.fillRect(40, 40, CANVAS_SIZE - 80, 8);

  // Quiz title (top area)
  ctx.fillStyle = "#6B7280";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  wrapText(ctx, quizTitle, CANVAS_SIZE / 2, 200, CANVAS_SIZE - 200, 50);

  // Score
  ctx.fillStyle = "#6B21A8";
  ctx.font = "bold 180px serif";
  ctx.fillText(`${score}/${total}`, CANVAS_SIZE / 2, 440);

  // Result title
  ctx.fillStyle = "#111827";
  ctx.font = "bold 80px serif";
  ctx.fillText(levelTitle, CANVAS_SIZE / 2, 600);

  // Divider line
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(340, 720);
  ctx.lineTo(CANVAS_SIZE - 340, 720);
  ctx.stroke();

  // Site name
  ctx.fillStyle = "#111827";
  ctx.font = "bold 32px sans-serif";
  ctx.fillText("Add C0urt 憲庭加好友", CANVAS_SIZE / 2, 810);

  // URL
  ctx.fillStyle = "#6B7280";
  ctx.font = "28px sans-serif";
  ctx.fillText(`${SITE_DOMAIN}/quiz/${quizId}`, CANVAS_SIZE / 2, 870);

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const chars = [...text];
  let line = "";
  let currentY = y;

  for (const char of chars) {
    const testLine = line + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = char;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });
}

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

  const getImageBlob = useCallback(() => {
    const canvas = generateResultImage(quizId, quizTitle, score, total, level.title);
    return canvasToBlob(canvas);
  }, [quizId, quizTitle, score, total, level.title]);

  const handleShare = async () => {
    setSharing(true);
    setFallbackMsg(false);
    try {
      const blob = await getImageBlob();
      const file = new File([blob], `addcourt-quiz-${quizId}.png`, {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        // Desktop fallback: download the image
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
