const fs = require('fs');

// Leer MB-1 y MB-2
const mb1 = JSON.parse(fs.readFileSync('mass-processing/mega-batch-1-of-9.json', 'utf8'));
const mb2 = JSON.parse(fs.readFileSync('mass-processing/mega-batch-2-of-9.json', 'utf8'));
const combined = [...mb1, ...mb2];

console.log('Procesando MB-1:', mb1.length, 'preguntas');
console.log('Procesando MB-2:', mb2.length, 'preguntas');
console.log('Total:', combined.length, 'preguntas');

// Generar enrichments
const enriched = combined.map(q => {
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

fs.writeFileSync('enriched-mb1-mb2-combined.json', JSON.stringify(enriched, null, 2));
console.log('✅ Guardado enriched-mb1-mb2-combined.json');
