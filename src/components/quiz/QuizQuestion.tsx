"use client";

import { useState } from "react";
import type { QuizQuestion as QuizQuestionType } from "@/data/quizzes/controversy";

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (correct: boolean) => void;
}

export default function QuizQuestion({ question, onAnswer }: QuizQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelectedIndex(index);
    setRevealed(true);
  };

  const isCorrect = selectedIndex === question.correctIndex;

  return (
    <div className="space-y-6">
      <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-relaxed">
        {question.question}
      </h2>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          let style =
            "w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium text-sm md:text-base ";

          if (!revealed) {
            style +=
              "border-gray-200 hover:border-royal-purple hover:bg-purple-50 cursor-pointer";
          } else if (index === question.correctIndex) {
            style += "border-sage bg-green-50 text-green-900";
          } else if (index === selectedIndex) {
            style += "border-accent-red bg-red-50 text-red-900";
          } else {
            style += "border-gray-100 text-gray-400";
          }

          return (
            <button
              key={option.label}
              onClick={() => handleSelect(index)}
              disabled={revealed}
              className={style}
            >
              <span className="font-bold mr-2">{option.label}.</span>
              {option.text}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="space-y-4 animate-fade-in">
          <div
            className={`flex items-center gap-2 text-lg font-bold ${
              isCorrect ? "text-sage" : "text-accent-red"
            }`}
          >
            {isCorrect ? "正確！" : "答錯了！"}
            {isCorrect ? " \u2714" : " \u2718"}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm md:text-base text-gray-700 leading-relaxed">
            {question.explanation}
          </div>

          <button
            onClick={() => onAnswer(isCorrect)}
            className="w-full py-3 rounded-xl bg-royal-purple text-white font-bold text-base hover:bg-midnight transition-colors"
          >
            下一題 &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
