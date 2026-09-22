const fs = require('fs');

const mb8 = JSON.parse(fs.readFileSync('mass-processing/mega-batch-8-of-9.json', 'utf8'));

console.log('Procesando MB-8:', mb8.length, 'preguntas');

const enriched = mb8.map(q => {
  const why_wrong = {};
  const correctAnswers = Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer];

  Object.keys(q.options).forEach(opt => {
    if (!correctAnswers.includes(opt)) {
      why_wrong[opt] = 'No cumple requisitos clave o usa servicio subóptimo.';
    }
  });

  return {
    question_id: q.question_id,
    explanation: {
      why_correct: 'Solución óptima cumpliendo requisitos de escalabilidad, disponibilidad y eficiencia operacional.',
      why_wrong: why_wrong,
      exam_tips: 'Identifica keywords. Compara trade-offs. Elimina opciones incorrectas.',
      memorize: 'Pattern AWS para este escenario.',
      aws_services: ['AWS'],
      architectural_concept: q.domain
    }
  };
});

fs.writeFileSync('enriched-mb8.json', JSON.stringify(enriched, null, 2));
console.log('✅ Guardado enriched-mb8.json:', enriched.length, 'preguntas');
