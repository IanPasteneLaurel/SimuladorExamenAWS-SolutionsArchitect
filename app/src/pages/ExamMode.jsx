import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuestions } from '../hooks/useQuestions';
import { useTimer } from '../hooks/useTimer';
import { useScoring } from '../hooks/useScoring';
import { useProgress } from '../hooks/useProgress';
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-aws-blue mb-6 min-h-[44px]"
        >
          <ArrowLeft size={16} /> Volver al inicio
        </button>
        <h1 className="text-2xl font-bold text-aws-dark mb-2">Examen Completo</h1>
        <p className="text-gray-600 mb-6">
          Elige uno de los {metadata.total_exams} examenes disponibles (66 preguntas, 132 minutos, sin
          repeticion entre examenes).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metadata.exams.map((exam) => (
            <button
              key={exam.exam_id}
              type="button"
              onClick={() => onSelect(exam.exam_id)}
              className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all min-h-[44px]"
            >
              <p className="text-lg font-bold text-aws-blue">Examen {exam.exam_id}</p>
              <p className="text-xs text-gray-500">{exam.question_count} preguntas</p>
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
