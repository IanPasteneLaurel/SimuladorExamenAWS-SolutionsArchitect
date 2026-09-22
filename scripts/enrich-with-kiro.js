const fs = require('fs');
const path = require('path');

// Leer el archivo de preguntas
const dataPath = path.join(__dirname, '..', 'app', 'src', 'data', 'SAA-C03-QuestionBank-923.json');
const questions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Identificar preguntas que necesitan enriquecimiento
const questionsToEnrich = questions.filter(q => {
  const exp = q.explanation || {};
  return !exp.why_correct || !exp.why_wrong || !exp.exam_tips || !exp.memorize;
});

console.log(`📊 Total preguntas: ${questions.length}`);
console.log(`❌ Preguntas sin enriquecimiento: ${questionsToEnrich.length}`);
console.log(`✅ Preguntas ya enriquecidas: ${questions.length - questionsToEnrich.length}`);
console.log('');

// Guardar las primeras 10 preguntas para procesar
const batch = questionsToEnrich.slice(0, 10);
const outputPath = path.join(__dirname, 'batch-to-process.json');
fs.writeFileSync(outputPath, JSON.stringify(batch, null, 2));

console.log(`📝 Guardadas ${batch.length} preguntas en: batch-to-process.json`);
console.log('');
console.log('IDs de preguntas en este lote:');
batch.forEach(q => console.log(`  - ${q.question_id}: ${q.domain}`));
