const fs = require('fs');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));

const withoutKeywords = data.filter(q => !q.explanation?.keywords || q.explanation.keywords.length === 0);

console.log('🔍 ANALIZANDO PREGUNTAS SIN KEYWORDS\n');
console.log(`Total: ${withoutKeywords.length} preguntas\n`);
console.log('='.repeat(80));

// Mostrar primeras 10 preguntas para analizar patrones
withoutKeywords.slice(0, 10).forEach((q, idx) => {
  console.log(`\n${idx + 1}. Q${q.question_id} - ${q.domain}`);
  console.log('-'.repeat(80));
  console.log(`${q.question_en.substring(0, 300)}...`);
  console.log('');
});

console.log('='.repeat(80));
