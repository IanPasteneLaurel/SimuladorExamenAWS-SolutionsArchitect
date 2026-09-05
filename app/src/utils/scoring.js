// Scoring helpers shared by Exam Mode and Flash Study Mode.

/**
 * Converts a raw correct/total ratio into the 0-1000 scaled score used
 * throughout the app (mirrors AWS's own 100-1000 scaled scoring style).
 */
export function calculateScore(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 1000);
}

export function calculatePercentage(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 1000) / 10; // one decimal place
}

/**
 * Groups answered questions by domain and returns a per-domain
 * correct/total breakdown, used for the domain performance heatmap.
 */
export function calculateDomainBreakdown(answeredQuestions) {
  const breakdown = {};
  for (const { question, isCorrect } of answeredQuestions) {
    const domain = question.domain || 'Unknown';
    if (!breakdown[domain]) breakdown[domain] = { correct: 0, total: 0 };
    breakdown[domain].total += 1;
    if (isCorrect) breakdown[domain].correct += 1;
  }
  return breakdown;
}

/**
 * Very simple predictor: maps the average score across ALL recorded exams
 * (0-1000 scale) onto AWS's official passing scale (100-1000, pass = 720).
 * This is intentionally simple (linear passthrough) since the 0-1000 scale
 * already mirrors AWS's scoring range.
 */
export function predictRealExamScore(examsCompleted) {
  if (!examsCompleted.length) return null;
  const avg =
    examsCompleted.reduce((sum, e) => sum + e.score, 0) / examsCompleted.length;
  return Math.round(avg);
}

export const PASSING_SCORE = 720;
