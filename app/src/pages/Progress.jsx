import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { predictRealExamScore, PASSING_SCORE } from '../utils/scoring';

export default function Progress() {
  const navigate = useNavigate();
  const { progress, reset } = useProgress();

  const examsCompleted = progress.examsCompleted;
  const flashSessions = progress.flashcardsSessions;

  const avgScore = examsCompleted.length
    ? Math.round(examsCompleted.reduce((s, e) => s + e.score, 0) / examsCompleted.length)
    : 0;
  const totalCorrectPct = progress.totalAnswered
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
    : 0;
  const predictedScore = predictRealExamScore(examsCompleted);

  const scoreEvolution = examsCompleted.map((e, i) => ({
    name: `Examen ${i + 1}`,
    score: e.score,
  }));

  const domainAgg = {};
  for (const exam of examsCompleted) {
    for (const [domain, { correct, total }] of Object.entries(exam.by_domain || {})) {
      if (!domainAgg[domain]) domainAgg[domain] = { correct: 0, total: 0 };
      domainAgg[domain].correct += correct;
      domainAgg[domain].total += total;
    }
  }
  const domainChartData = Object.entries(domainAgg).map(([domain, { correct, total }]) => ({
    domain: domain.replace(' Architectures', ''),
    porcentaje: total ? Math.round((correct / total) * 100) : 0,
  }));

  const recentHistory = [...examsCompleted]
    .slice(-20)
    .reverse()
    .map((e) => ({ ...e, type: 'Examen' }));

  function handleReset() {
    if (window.confirm('¿Seguro que quieres borrar todo tu progreso? Esta accion no se puede deshacer.')) {
      reset();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-aws-blue min-h-[44px]"
          >
            <ArrowLeft size={16} /> Volver al inicio
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-sm text-aws-red hover:text-red-700 min-h-[44px]"
          >
            <RotateCcw size={16} /> Reiniciar progreso
          </button>
        </div>

        <h1 className="text-2xl font-bold text-aws-dark mb-6">Mi Progreso</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Examenes completados" value={examsCompleted.length} />
          <StatCard label="Sesiones flash" value={flashSessions.length} />
          <StatCard label="Score promedio" value={avgScore || '-'} />
          <StatCard label="% aciertos global" value={progress.totalAnswered ? `${totalCorrectPct}%` : '-'} />
        </div>

        {predictedScore !== null && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-500 mb-1">Prediccion de score real</h2>
            <p className="text-3xl font-bold text-aws-blue">{predictedScore} / 1000</p>
            <p className="text-xs text-gray-500 mt-1">
              Basado en el promedio de tus {examsCompleted.length} examenes completos. Minimo para aprobar: {PASSING_SCORE}.
            </p>
          </div>
        )}

        {scoreEvolution.length > 0 && (
          <ChartCard title="Evolucion del score">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={scoreEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis domain={[0, 1000]} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0066CC" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {domainChartData.length > 0 && (
          <ChartCard title="Desempeño por dominio (% aciertos)">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={domainChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="domain" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Bar dataKey="porcentaje" fill="#9933FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {recentHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
            <h2 className="text-sm font-semibold text-gray-500 mb-4">Historial reciente (ultimos 20)</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Examen</th>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Correctas</th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((e, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-4">Examen {e.exam_id}</td>
                    <td className="py-2 pr-4 text-gray-500">
                      {new Date(e.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4 font-medium">{e.score}</td>
                    <td className="py-2 pr-4">
                      {e.correct}/{e.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {examsCompleted.length === 0 && flashSessions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
            Aun no has completado ningun examen o sesion flash. Empieza a practicar desde el inicio.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
      <p className="text-2xl font-bold text-aws-dark">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h2 className="text-sm font-semibold text-gray-500 mb-4">{title}</h2>
      {children}
    </div>
  );
}
