"use client";

import { useState } from "react";
import type { QuizMeta } from "@/data/quizzes/controversy";
import QuizProgress from "./QuizProgress";
import QuizQuestionComponent from "./QuizQuestion";
import QuizResult from "./QuizResult";

interface QuizContainerProps {
  quiz: QuizMeta;
}

export default function QuizContainer({ quiz }: QuizContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleAnswer = (correct: boolean) => {
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    if (currentIndex + 1 >= quiz.questions.length) {
      setCompleted(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (completed) {
    return (
      <QuizResult
        score={score}
        total={quiz.questions.length}
        quizId={quiz.id}
        quizTitle={quiz.title}
        resultLevels={quiz.resultLevels}
        sourceRoute={quiz.sourceRoute}
      />
    );
  }

  return (
    <div>
      <QuizProgress current={currentIndex} total={quiz.questions.length} />
      <QuizQuestionComponent
        key={quiz.questions[currentIndex].id}
        question={quiz.questions[currentIndex]}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
