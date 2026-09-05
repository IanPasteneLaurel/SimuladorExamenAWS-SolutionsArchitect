import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap, BarChart3, GraduationCap } from 'lucide-react';
import { useQuestions } from '../hooks/useQuestions';
import { useProgress } from '../hooks/useProgress';

export default function Home() {
  const navigate = useNavigate();
  const { totalQuestions, totalExams } = useQuestions();
  const { progress } = useProgress();

  const examsCompleted = progress.examsCompleted.length;
  const avgScore = examsCompleted
    ? Math.round(
        progress.examsCompleted.reduce((sum, e) => sum + e.score, 0) / examsCompleted
      )
    : 0;
  const totalCorrectPct = progress.totalAnswered
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-10">
          <GraduationCap className="text-aws-blue mx-auto mb-3" size={48} />
          <h1 className="text-3xl md:text-4xl font-bold text-aws-dark">
            SAA-C03 Exam Simulator
          </h1>
          <p className="text-gray-600 mt-2">
            {totalQuestions} preguntas reales &middot; {totalExams} examenes completos &middot; sin repeticion
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <StatCard label="Examenes realizados" value={examsCompleted} />
          <StatCard label="Score promedio" value={avgScore || '-'} />
          <StatCard label="% de aciertos" value={progress.totalAnswered ? `${totalCorrectPct}%` : '-'} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ActionCard
            icon={<BookOpen size={28} className="text-aws-blue" />}
            title="Examen Completo"
            description={`Simulacro cronometrado de 66 preguntas (132 min). ${totalExams} examenes disponibles.`}
            onClick={() => navigate('/exam')}
          />
          <ActionCard
            icon={<Zap size={28} className="text-aws-purple" />}
            title="Flash Study"
            description="Sesiones rapidas de 10, 20 o 30 preguntas sin cronometro."
            onClick={() => navigate('/flash')}
          />
          <ActionCard
            icon={<BarChart3 size={28} className="text-aws-green" />}
            title="Mi Progreso"
            description="Estadisticas, graficos de evolucion y desempeno por dominio."
            onClick={() => navigate('/progress')}
            fullWidth
          />
        </div>
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

function ActionCard({ icon, title, description, onClick, fullWidth }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white rounded-xl shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-h-[44px] ${
        fullWidth ? 'md:col-span-2' : ''
      }`}
    >
      <div className="mb-3">{icon}</div>
      <h2 className="text-lg font-semibold text-aws-dark mb-1">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  );
}
