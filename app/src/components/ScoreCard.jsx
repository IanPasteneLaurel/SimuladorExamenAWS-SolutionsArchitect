import { Trophy, Target, TrendingUp } from 'lucide-react';
import { PASSING_SCORE } from '../utils/scoring';

/**
 * End-of-session score summary with domain performance heatmap.
 */
export default function ScoreCard({ score, correctCount, totalQuestions, percentage, domainBreakdown, onRestart, onHome, restartLabel = 'Nuevo intento' }) {
  const passed = score >= PASSING_SCORE;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <Trophy
          className={passed ? 'text-aws-green mx-auto' : 'text-gray-400 mx-auto'}
          size={48}
        />
        <h2 className="text-2xl font-bold text-aws-dark mt-2">
          {passed ? 'Aprobado' : 'No aprobado'}
        </h2>
        <p className="text-4xl font-bold text-aws-blue mt-2">{score}</p>
        <p className="text-sm text-gray-500">de 1000 puntos (mínimo para aprobar: {PASSING_SCORE})</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Target className="text-aws-blue mx-auto mb-1" size={20} />
          <p className="text-2xl font-bold text-aws-dark">
            {correctCount}/{totalQuestions}
          </p>
          <p className="text-xs text-gray-500">Respuestas correctas</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <TrendingUp className="text-aws-purple mx-auto mb-1" size={20} />
          <p className="text-2xl font-bold text-aws-dark">{percentage}%</p>
          <p className="text-xs text-gray-500">Porcentaje de aciertos</p>
        </div>
      </div>

      {Object.keys(domainBreakdown).length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-aws-dark mb-3">Desempeño por dominio</h3>
          <div className="space-y-2">
            {Object.entries(domainBreakdown).map(([domain, { correct, total }]) => {
              const domainPct = total > 0 ? Math.round((correct / total) * 100) : 0;
              const barColor =
                domainPct >= 70 ? 'bg-aws-green' : domainPct >= 50 ? 'bg-yellow-400' : 'bg-aws-red';
              return (
                <div key={domain}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{domain}</span>
                    <span>
                      {correct}/{total} ({domainPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${domainPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 px-4 py-3 bg-aws-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          {restartLabel}
        </button>
        <button
          type="button"
          onClick={onHome}
          className="flex-1 px-4 py-3 bg-white border-2 border-aws-blue text-aws-blue rounded-lg font-medium hover:bg-blue-50 transition-colors min-h-[44px]"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
