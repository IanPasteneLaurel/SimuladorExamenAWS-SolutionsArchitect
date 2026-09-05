import { useMemo } from 'react';
import questionBank from '../data/SAA-C03-QuestionBank-923.json';
import examsFull from '../data/exams-full.json';
import examsMetadata from '../data/exams-metadata.json';

/**
 * Provides access to the static question bank and exam datasets.
 * All data is bundled at build time (no backend, no fetch).
 */
export function useQuestions() {
  const allQuestions = useMemo(() => questionBank, []);

  const exams = useMemo(() => examsFull, []);
  const metadata = useMemo(() => examsMetadata, []);

  function getExam(examId) {
    return exams[String(examId)] || null;
  }

  function getRandomQuestions(count) {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  return {
    allQuestions,
    exams,
    metadata,
    getExam,
    getRandomQuestions,
    totalQuestions: allQuestions.length,
    totalExams: metadata.total_exams,
  };
}
