import { Pause, Play, Clock } from 'lucide-react';

/**
 * Floating countdown timer for Exam Mode. Fixed to the top-right corner
 * per the PRD design spec.
 */
export default function Timer({ formatted, isRunning, onPause, onResume, secondsLeft }) {
  const isLowTime = secondsLeft <= 300; // last 5 minutes

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 bg-white shadow-lg rounded-full px-4 py-2 border-2 ${
        isLowTime ? 'border-aws-red' : 'border-aws-blue'
      }`}
    >
      <Clock className={isLowTime ? 'text-aws-red' : 'text-aws-blue'} size={18} />
      <span
        className={`font-mono text-lg md:text-2xl tabular-nums ${
          isLowTime ? 'text-aws-red' : 'text-aws-dark'
        }`}
      >
        {formatted}
      </span>
      <button
        type="button"
        onClick={isRunning ? onPause : onResume}
        aria-label={isRunning ? 'Pausar cronometro' : 'Reanudar cronometro'}
        className="p-1.5 rounded-full hover:bg-gray-100 min-h-[32px] min-w-[32px] flex items-center justify-center"
      >
        {isRunning ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </div>
  );
}
