import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuestions } from '../hooks/useQuestions';
import { useTimer } from '../hooks/useTimer';
import { useScoring } from '../hooks/useScoring';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageIcon } from '../components/LanguageToggle';
import QuestionView from '../components/QuestionView';
import ExplanationView from '../components/ExplanationView';
import ProgressBar from '../components/ProgressBar';
import ScoreCard from '../components/ScoreCard';
import Timer from '../components/Timer';

const EXAM_DURATION_SECONDS = 132 * 60; // 132 minutes, per PRD

export default function ExamMode() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { metadata, getExam } = useQuestions();
  const { saveExamResult } = useProgress();

  if (!examId) {
    return <ExamSelector metadata={metadata} onSelect={(id) => navigate(`/exam/${id}`)} onBack={() => navigate('/')} />;
  }

  return <ExamRunner examId={Number(examId)} getExam={getExam} saveExamResult={saveExamResult} navigate={navigate} />;
}

function ExamSelector({ metadata, onSelect, onBack }) {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-aws-blue min-h-[44px]"
          >
            <ArrowLeft size={16} /> {t('Volver al inicio', 'Back to Home')}
          </button>
          <LanguageIcon />
        </div>
        <h1 className="text-2xl font-bold text-aws-dark mb-2">{t('Examen Completo', 'Full Exam')}</h1>
        <p className="text-gray-600 mb-6">
          {t(
            `Elige uno de los ${metadata.total_exams} exámenes disponibles (66 preguntas, 132 minutos, sin repetición entre exámenes).`,
            `Choose one of ${metadata.total_exams} available exams (66 questions, 132 minutes, no repetition between exams).`
          )}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metadata.exams.map((exam) => (
            <button
              key={exam.exam_id}
              type="button"
              onClick={() => onSelect(exam.exam_id)}
              className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all min-h-[44px]"
            >
              <p className="text-lg font-bold text-aws-blue">{t('Examen', 'Exam')} {exam.exam_id}</p>
              <p className="text-xs text-gray-500">{exam.question_count} {t('preguntas', 'questions')}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExamRunner({ examId, getExam, saveExamResult, navigate }) {
  const exam = useMemo(() => getExam(examId), [getExam, examId]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  const questions = exam ? exam.questions : [];
  const scoring = useScoring(questions);

  const handleExpire = useCallback(() => {
    setFinished(true);
  }, []);

  const timer = useTimer(EXAM_DURATION_SECONDS, handleExpire);

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Examen no encontrado.</p>
      </div>
    );
  }

  if (finished || scoring.isComplete) {
    if (!resultSaved) {
      saveExamResult({
        exam_id: examId,
        timestamp: new Date().toISOString(),
        score: scoring.score,
        correct: scoring.correctCount,
        total: scoring.totalQuestions,
        percentage: scoring.percentage,
        by_domain: scoring.domainBreakdown,
      });
      setResultSaved(true);
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-10 px-4">
        <ScoreCard
          score={scoring.score}
          correctCount={scoring.correctCount}
          totalQuestions={scoring.totalQuestions}
          percentage={scoring.percentage}
          domainBreakdown={scoring.domainBreakdown}
          restartLabel="Otro examen"
          onRestart={() => navigate('/exam')}
          onHome={() => navigate('/')}
        />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const selected = scoring.answers[currentQuestion.question_id];

  function handleSelect(letter) {
    scoring.answerQuestion(currentQuestion.question_id, letter);
    setShowExplanation(true);
  }

  function handleNext() {
    if (isLastQuestion) {
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setShowExplanation(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Timer
        formatted={timer.formatted}
        isRunning={timer.isRunning}
        onPause={timer.pause}
        onResume={timer.resume}
        secondsLeft={timer.secondsLeft}
      />
      <div className="max-w-2xl mx-auto pt-14">
        {/* Cancel Exam Button */}
        <div className="mb-4 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres cancelar este examen? Se perderá tu progreso actual.')) {
                navigate('/');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all min-h-[44px]"
          >
            <ArrowLeft size={16} />
            Cancelar examen
          </button>
        </div>
        
        <div className="mb-4">
          <ProgressBar current={currentIndex + (showExplanation ? 1 : 0)} total={questions.length} />
        </div>
        <QuestionView
          question={currentQuestion}
          selected={selected}
          onSelect={handleSelect}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
        />
        {showExplanation && (
          <ExplanationView
            question={currentQuestion}
            selected={selected}
            onNext={handleNext}
            isLastQuestion={isLastQuestion}
          />
        )}
      </div>
    </div>
  );
}
