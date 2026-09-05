import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuestions } from '../hooks/useQuestions';
import { useScoring } from '../hooks/useScoring';
import { useProgress } from '../hooks/useProgress';
import QuestionView from '../components/QuestionView';
import ExplanationView from '../components/ExplanationView';
import ProgressBar from '../components/ProgressBar';
import ScoreCard from '../components/ScoreCard';

const SESSION_SIZES = [10, 20, 30];

export default function FlashMode() {
  const { count } = useParams();
  const navigate = useNavigate();

  if (!count) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-aws-blue mb-6 min-h-[44px]"
          >
            <ArrowLeft size={16} /> Volver al inicio
          </button>
          <h1 className="text-2xl font-bold text-aws-dark mb-2">Flash Study</h1>
          <p className="text-gray-600 mb-6">
            Sesiones rapidas sin cronometro, con preguntas aleatorias de todo el banco.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {SESSION_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => navigate(`/flash/${size}`)}
                className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all min-h-[44px]"
              >
                <p className="text-3xl font-bold text-aws-purple">{size}</p>
                <p className="text-xs text-gray-500 mt-1">preguntas</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <FlashRunner count={Number(count)} navigate={navigate} />;
}

function FlashRunner({ count, navigate }) {
  const { getRandomQuestions } = useQuestions();
  const { saveFlashSession } = useProgress();

  // Draw the random set once per mount (stable across re-renders).
  const [questions] = useState(() => getRandomQuestions(count));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  const scoring = useScoring(questions);

  if (finished || scoring.isComplete) {
    if (!resultSaved) {
      saveFlashSession({
        session_id: `flash_${count}_${new Date().toISOString()}`,
        count,
        score: scoring.correctCount,
        total: scoring.totalQuestions,
        percentage: scoring.percentage,
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
          restartLabel="Otra sesion"
          onRestart={() => navigate('/flash')}
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
      <div className="max-w-2xl mx-auto">
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
