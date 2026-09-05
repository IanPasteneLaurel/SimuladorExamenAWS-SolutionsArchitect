import { CheckCircle2, Circle } from 'lucide-react';

const OPTION_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Renders a single question with its answer options.
 * Once `selected` is set, options are locked and correctness is highlighted.
 */
export default function QuestionView({ question, selected, onSelect, questionNumber, totalQuestions }) {
  const optionLetters = OPTION_ORDER.filter((letter) => question.options[letter] !== undefined);
  const hasAnswered = selected !== undefined && selected !== null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-aws-blue bg-blue-50 px-3 py-1 rounded-full">
          Pregunta {questionNumber} de {totalQuestions}
        </span>
        <span className="text-xs text-gray-500">{question.domain}</span>
      </div>

      {question.multi_select && (
        <p className="text-xs font-semibold text-aws-purple mb-2">(Select TWO)</p>
      )}

      <p className="text-base md:text-lg text-aws-dark leading-relaxed mb-6 whitespace-pre-line">
        {question.question_en}
      </p>

      <div className="space-y-3">
        {optionLetters.map((letter) => {
          const isSelected = selected === letter;
          const isCorrectAnswer = question.correct_answer === letter;
          const showResult = hasAnswered;

          let stateClasses = 'border-gray-200 hover:border-aws-blue hover:bg-blue-50';
          if (showResult) {
            if (isCorrectAnswer) {
              stateClasses = 'border-aws-green bg-green-50';
            } else if (isSelected) {
              stateClasses = 'border-aws-red bg-red-50';
            } else {
              stateClasses = 'border-gray-200 opacity-70';
            }
          } else if (isSelected) {
            stateClasses = 'border-aws-blue bg-blue-50';
          }

          return (
            <button
              key={letter}
              type="button"
              disabled={hasAnswered}
              onClick={() => onSelect(letter)}
              aria-pressed={isSelected}
              className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border-2 transition-colors duration-200 min-h-[44px] ${stateClasses} ${
                hasAnswered ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {showResult && isCorrectAnswer ? (
                  <CheckCircle2 className="text-aws-green" size={20} />
                ) : (
                  <Circle
                    className={isSelected ? 'text-aws-blue' : 'text-gray-400'}
                    size={20}
                  />
                )}
              </span>
              <span className="text-sm md:text-base text-aws-dark">
                <strong className="mr-2">{letter})</strong>
                {question.options[letter]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
