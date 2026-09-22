const fs = require('fs');

console.log('✨ APLICANDO PULIDO FINAL\n');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));
const polish = JSON.parse(fs.readFileSync('final-polish-batch.json', 'utf8'));

// Backup
const backupFile = `SAA-C03-QuestionBank-923.backup-final-polish-${Date.now()}.json`;
fs.writeFileSync(`../app/src/data/${backupFile}`, JSON.stringify(data, null, 2));
console.log(`💾 Backup: ${backupFile}\n`);

let updated = 0;

polish.forEach(enrichment => {
  const question = data.find(q => q.question_id === enrichment.question_id);
  
  if (question && question.explanation) {
    question.explanation.why_correct = enrichment.explanation.why_correct;
    question.explanation.memorize = enrichment.explanation.memorize;
    updated++;
  }
});

// Guardar
fs.writeFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', JSON.stringify(data, null, 2));

console.log('='.repeat(70));
console.log('✅ PULIDO FINAL APLICADO');
console.log(`📊 Preguntas actualizadas: ${updated}`);
console.log('='.repeat(70));
