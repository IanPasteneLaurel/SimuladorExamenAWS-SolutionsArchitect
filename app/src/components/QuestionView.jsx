import { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { useTranslatedQuestion } from '../contexts/LanguageContext';

const OPTION_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Renders a single question with its answer options.
 * User selects an option, then must confirm before submitting.
 * Supports bilingual display with automatic fallback to English.
 * Supports multi-select questions (Select TWO/THREE).
 */
export default function QuestionView({ question, selected, onSelect, questionNumber, totalQuestions }) {
  // For single-select: tempSelected is a string (e.g., "A")
  // For multi-select: tempSelected is an array (e.g., ["A", "C"])
  const [tempSelected, setTempSelected] = useState(question.multi_select ? [] : null);
  const { questionText, options } = useTranslatedQuestion(question);
  const optionLetters = OPTION_ORDER.filter((letter) => question.options[letter] !== undefined);
  const hasAnswered = selected !== undefined && selected !== null;

  // Determine how many options should be selected for multi-select
  // Use required_selections from question data (2 or 3), fallback to 2 for backward compatibility
  const requiredSelections = question.multi_select 
    ? (question.required_selections || 2) 
    : 1;

  // Reset tempSelected when question changes or when answer is cleared
  useEffect(() => {
    setTempSelected(question.multi_select ? [] : null);
  }, [question.question_id, selected, question.multi_select]);

  const handleOptionClick = (letter) => {
    if (hasAnswered) return;

    if (question.multi_select) {
      // Multi-select: toggle option in array
      setTempSelected((prev) => {
        if (prev.includes(letter)) {
          // Deselect
          return prev.filter((l) => l !== letter);
        } else {
          // Select (only if we haven't reached the limit)
          if (prev.length < requiredSelections) {
            return [...prev, letter].sort();
          }
          return prev; // Don't allow more than required
        }
      });
    } else {
      // Single-select: replace selection
      setTempSelected(letter);
    }
  };

  const handleConfirm = () => {
    if (question.multi_select) {
      if (tempSelected.length === requiredSelections) {
        onSelect(tempSelected);
      }
    } else {
      if (tempSelected) {
        onSelect(tempSelected);
      }
    }
  };

  const handleCancel = () => {
    setTempSelected(question.multi_select ? [] : null);
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
        <p className="text-xs font-semibold text-aws-purple mb-2">
          (Select {requiredSelections === 2 ? 'TWO' : requiredSelections === 3 ? 'THREE' : requiredSelections})
        </p>
      )}

      <p className="text-base md:text-lg text-aws-dark leading-relaxed mb-6 whitespace-pre-line">
        {questionText}
      </p>

      <div className="space-y-3">
        {optionLetters.map((letter) => {
          const isTempSelected = question.multi_select
            ? tempSelected.includes(letter)
            : tempSelected === letter;
          const isSelected = question.multi_select
            ? Array.isArray(selected) && selected.includes(letter)
            : selected === letter;

          // Normalize correct_answer to always be an array for comparison
          const correctAnswers = Array.isArray(question.correct_answer)
            ? question.correct_answer
            : [question.correct_answer];
          const isCorrectAnswer = correctAnswers.includes(letter);

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
                ) : question.multi_select ? (
                  // Checkbox for multi-select
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isTempSelected ? 'bg-aws-blue border-aws-blue' : 'border-gray-400'
                    }`}
                  >
                    {isTempSelected && <CheckCircle2 className="text-white" size={14} />}
                  </div>
                ) : (
                  // Radio button for single-select
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
      {!hasAnswered && ((question.multi_select && tempSelected.length > 0) || (!question.multi_select && tempSelected)) && (
        <div className="mt-6 flex flex-col gap-3 border-t pt-4">
          {question.multi_select && (
            <p className="text-sm text-center text-gray-600">
              {tempSelected.length} de {requiredSelections} opciones seleccionadas
              {tempSelected.length < requiredSelections && ` (selecciona ${requiredSelections - tempSelected.length} más)`}
            </p>
          )}
          <div className="flex gap-3 justify-end">
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
              disabled={question.multi_select && tempSelected.length !== requiredSelections}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                question.multi_select && tempSelected.length !== requiredSelections
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-aws-blue text-white hover:bg-blue-700'
              }`}
            >
              Confirmar respuesta{question.multi_select ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* Helper text */}
      {!hasAnswered && ((question.multi_select && tempSelected.length === 0) || (!question.multi_select && !tempSelected)) && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          Selecciona {question.multi_select ? `${requiredSelections} opciones` : 'una opción'} y luego confirma tu respuesta
        </p>
      )}
    </div>
  );
}
