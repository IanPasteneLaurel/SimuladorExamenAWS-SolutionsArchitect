import { useState, useCallback, useMemo } from 'react';
import { calculateScore, calculatePercentage, calculateDomainBreakdown } from '../utils/scoring';

/**
 * Tracks answers given during an exam/flash session and derives score,
 * percentage, and domain breakdown as questions are answered.
 */
export function useScoring(questions) {
  const [answers, setAnswers] = useState({}); // { [question_id]: selectedLetter }

  const answerQuestion = useCallback((questionId, selectedLetter) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedLetter }));
  }, []);

  const answeredQuestions = useMemo(
    () =>
      questions
        .filter((q) => answers[q.question_id] !== undefined)
        .map((q) => ({
          question: q,
          selected: answers[q.question_id],
          isCorrect: answers[q.question_id] === q.correct_answer,
        })),
    [questions, answers]
  );

  const correctCount = answeredQuestions.filter((a) => a.isCorrect).length;
  const totalAnswered = answeredQuestions.length;
  const totalQuestions = questions.length;

  const score = calculateScore(correctCount, totalQuestions);
  const percentage = calculatePercentage(correctCount, totalQuestions);
  const domainBreakdown = calculateDomainBreakdown(answeredQuestions);

  const isComplete = totalAnswered === totalQuestions && totalQuestions > 0;

  return {
    answers,
    answerQuestion,
    answeredQuestions,
    correctCount,
    totalAnswered,
    totalQuestions,
    score,
    percentage,
    domainBreakdown,
    isComplete,
  };
}
