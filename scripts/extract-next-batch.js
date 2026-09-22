const fs = require('fs');
const path = require('path');

const batchSize = parseInt(process.argv[2]) || 50;
const dataPath = path.join(__dirname, '..', 'app', 'src', 'data', 'SAA-C03-QuestionBank-923.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const needEnrich = data.filter(q => {
  const exp = q.explanation || {};
  return !exp.why_correct;
});

const batch = needEnrich.slice(0, batchSize);
const outputPath = path.join(__dirname, `batch-next-${batchSize}.json`);
fs.writeFileSync(outputPath, JSON.stringify(batch, null, 2));

console.log(`📝 Extraídas ${batch.length} preguntas pendientes`);
console.log(`IDs: ${batch.slice(0, 10).map(q => q.question_id).join(', ')}...`);
console.log(`✅ Guardado en: ${path.basename(outputPath)}`);
