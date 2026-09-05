import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

/**
 * Instructor-style explanation panel shown after a question is answered.
 * Displays whether the user was correct plus the full architectural
 * reasoning extracted from the source question bank.
 */
export default function ExplanationView({ question, selected, onNext, isLastQuestion }) {
  const isCorrect = selected === question.correct_answer;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mt-4 border-t-4 border-aws-blue">
      <div className="flex items-center gap-2 mb-4">
        {isCorrect ? (
          <>
            <CheckCircle2 className="text-aws-green" size={24} />
            <span className="font-semibold text-aws-green">Correcto</span>
          </>
        ) : (
          <>
            <XCircle className="text-aws-red" size={24} />
            <span className="font-semibold text-aws-red">
              Incorrecto - La respuesta correcta es {question.correct_answer}
            </span>
          </>
        )}
      </div>

      <div className="flex items-start gap-2 mb-6">
        <Lightbulb className="text-aws-purple shrink-0 mt-1" size={20} />
        <p className="text-sm md:text-base text-aws-dark leading-relaxed whitespace-pre-line">
          {question.explanation.full_text}
        </p>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full md:w-auto px-6 py-3 bg-aws-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
      >
        {isLastQuestion ? 'Ver resultados' : 'Siguiente pregunta'}
      </button>
    </div>
  );
}
