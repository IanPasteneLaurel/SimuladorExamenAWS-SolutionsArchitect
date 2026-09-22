const fs = require('fs');
const path = require('path');

// Leer argumentos
const enrichedDataPath = process.argv[2];
if (!enrichedDataPath) {
  console.error('❌ Usage: node apply-enrichment.js <enriched-data.json>');
  process.exit(1);
}

// Leer datos enriquecidos
const enrichedQuestions = JSON.parse(fs.readFileSync(enrichedDataPath, 'utf8'));

// Leer archivo original
const originalPath = path.join(__dirname, '..', 'app', 'src', 'data', 'SAA-C03-QuestionBank-923.json');
const allQuestions = JSON.parse(fs.readFileSync(originalPath, 'utf8'));

// Aplicar enriquecimiento
let updatedCount = 0;
enrichedQuestions.forEach(enriched => {
  const index = allQuestions.findIndex(q => q.question_id === enriched.question_id);
  if (index !== -1) {
    allQuestions[index].explanation = enriched.explanation;
    updatedCount++;
  }
});

// Guardar backup
const backupPath = originalPath.replace('.json', `.backup-${Date.now()}.json`);
fs.writeFileSync(backupPath, fs.readFileSync(originalPath, 'utf8'));
console.log(`💾 Backup guardado: ${path.basename(backupPath)}`);

// Guardar actualización
fs.writeFileSync(originalPath, JSON.stringify(allQuestions, null, 2));
console.log(`✅ Actualizadas ${updatedCount} preguntas en el archivo principal`);
console.log(`📊 Total preguntas en archivo: ${allQuestions.length}`);
