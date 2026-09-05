// LocalStorage persistence layer for exam/flash progress.
// Structure documented in docs/BRIEFING-PARA-KIRO.md.

const STORAGE_KEY = 'saa-c03-progress';

const DEFAULT_PROGRESS = {
  examsCompleted: [],
  flashcardsSessions: [],
  totalCorrect: 0,
  totalAnswered: 0,
  lastUpdated: null,
};

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch (err) {
    console.warn('Failed to load progress from localStorage, using defaults.', err);
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Failed to save progress to localStorage.', err);
  }
}

export function recordExamResult(result) {
  const progress = loadProgress();
  progress.examsCompleted.push(result);
  progress.totalCorrect += result.correct;
  progress.totalAnswered += result.total;
  progress.lastUpdated = new Date().toISOString();
  saveProgress(progress);
  return progress;
}

export function recordFlashSession(session) {
  const progress = loadProgress();
  progress.flashcardsSessions.push(session);
  progress.totalCorrect += session.score;
  progress.totalAnswered += session.total;
  progress.lastUpdated = new Date().toISOString();
  saveProgress(progress);
  return progress;
}

export function resetProgress() {
  saveProgress({ ...DEFAULT_PROGRESS });
  return { ...DEFAULT_PROGRESS };
}
