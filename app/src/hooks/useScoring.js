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
        .map((q) => {
          const selected = answers[q.question_id];
          const correctAnswer = q.correct_answer;
          
          // Compare answers correctly for both single-select and multi-select
          let isCorrect = false;
          
          if (Array.isArray(selected) && Array.isArray(correctAnswer)) {
            // Multi-select: both must be arrays with same elements (order doesn't matter)
            isCorrect = selected.length === correctAnswer.length &&
                       selected.every(item => correctAnswer.includes(item)) &&
                       correctAnswer.every(item => selected.includes(item));
          } else if (!Array.isArray(selected) && !Array.isArray(correctAnswer)) {
            // Single-select: simple equality
            isCorrect = selected === correctAnswer;
          }
          // If types don't match, isCorrect remains false
          
          return {
            question: q,
            selected: selected,
            isCorrect: isCorrect,
          };
        }),
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
