import { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { useTranslatedQuestion } from '../contexts/LanguageContext';

const OPTION_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Renders a single question with its answer options.
 * User selects an option, then must confirm before submitting.
 * Supports bilingual display with automatic fallback to English.
 */
export default function QuestionView({ question, selected, onSelect, questionNumber, totalQuestions }) {
  const [tempSelected, setTempSelected] = useState(null);
  const { questionText, options } = useTranslatedQuestion(question);
  const optionLetters = OPTION_ORDER.filter((letter) => question.options[letter] !== undefined);
  const hasAnswered = selected !== undefined && selected !== null;

  // Reset tempSelected when question changes or when answer is cleared
  useEffect(() => {
    setTempSelected(null);
  }, [question.question_id, selected]);

  const handleOptionClick = (letter) => {
    if (hasAnswered) return;
    setTempSelected(letter);
  };

  const handleConfirm = () => {
    if (tempSelected) {
      onSelect(tempSelected);
    }
  };

  const handleCancel = () => {
    setTempSelected(null);
  };

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
        {questionText}
      </p>

      <div className="space-y-3">
        {optionLetters.map((letter) => {
          const isTempSelected = tempSelected === letter;
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
          } else if (isTempSelected) {
            stateClasses = 'border-aws-blue bg-blue-100 ring-2 ring-aws-blue ring-offset-2';
          }

          return (
            <button
              key={letter}
              type="button"
              disabled={hasAnswered}
              onClick={() => handleOptionClick(letter)}
              aria-pressed={isTempSelected}
              className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-200 min-h-[44px] ${stateClasses} ${
                hasAnswered ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {showResult && isCorrectAnswer ? (
                  <CheckCircle2 className="text-aws-green" size={20} />
                ) : (
                  <Circle
                    className={isTempSelected ? 'text-aws-blue fill-aws-blue' : isSelected ? 'text-aws-blue' : 'text-gray-400'}
                    size={20}
                  />
                )}
              </span>
              <span className="text-sm md:text-base text-aws-dark">
                <strong className="mr-2">{letter})</strong>
                {options[letter]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Confirm/Cancel buttons */}
      {!hasAnswered && tempSelected && (
        <div className="mt-6 flex gap-3 justify-end border-t pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-aws-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Confirmar respuesta
          </button>
        </div>
      )}

      {/* Helper text */}
      {!hasAnswered && !tempSelected && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          Selecciona una opción y luego confirma tu respuesta
        </p>
      )}
    </div>
  );
}
