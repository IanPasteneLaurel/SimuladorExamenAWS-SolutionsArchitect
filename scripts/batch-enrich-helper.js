const fs = require('fs');
const path = require('path');

/**
 * Este script prepara múltiples batches para procesamiento rápido
 * Genera archivos listos para enriquecer de forma paralela
 */

const BATCHES_TO_PREPARE = 5; // Preparar 5 batches a la vez
const BATCH_SIZE = 50;
const MAIN_FILE = path.join(__dirname, '..', 'app', 'src', 'data', 'SAA-C03-QuestionBank-923.json');

console.log('🔧 PREPARANDO BATCHES MÚLTIPLES\n');

// Leer preguntas pendientes
const allQuestions = JSON.parse(fs.readFileSync(MAIN_FILE, 'utf-8'));
const pending = allQuestions.filter(q => {
  const exp = q.explanation || {};
  return !exp.why_correct || !exp.why_wrong || !exp.exam_tips;
});

console.log(`📊 Preguntas pendientes: ${pending.length}`);
console.log(`📦 Preparando ${BATCHES_TO_PREPARE} batches de ${BATCH_SIZE} preguntas cada uno\n`);

// Crear carpeta para batches preparados
const batchesDir = path.join(__dirname, 'batches-ready');
if (!fs.existsSync(batchesDir)) {
  fs.mkdirSync(batchesDir);
}

// Preparar batches
const masterBatch = [];
for (let i = 0; i < BATCHES_TO_PREPARE; i++) {
  const start = i * BATCH_SIZE;
  const end = Math.min(start + BATCH_SIZE, pending.length);
  const batch = pending.slice(start, end);
  
  if (batch.length === 0) break;
  
  const batchFile = path.join(batchesDir, `batch-${i + 9}.json`);
  fs.writeFileSync(batchFile, JSON.stringify(batch, null, 2));
  
  masterBatch.push({
    batchNumber: i + 9,
    file: `batch-${i + 9}.json`,
    questionCount: batch.length,
    questionIds: batch.map(q => q.question_id)
  });
  
  console.log(`✅ Batch ${i + 9}: ${batch.length} preguntas (IDs: ${batch.map(q => q.question_id).slice(0, 5).join(', ')}...)`);
}

// Guardar índice maestro
const masterFile = path.join(batchesDir, 'MASTER-INDEX.json');
fs.writeFileSync(masterFile, JSON.stringify({
  totalBatches: masterBatch.length,
  totalQuestions: masterBatch.reduce((sum, b) => sum + b.questionCount, 0),
  batches: masterBatch,
  generatedAt: new Date().toISOString()
}, null, 2));

console.log(`\n📋 Índice maestro guardado en: ${masterFile}`);
console.log(`\n✨ ${masterBatch.length} batches preparados en: ${batchesDir}`);
console.log(`\n🎯 SIGUIENTE PASO:`);
console.log(`   Procesar cada archivo batch-X.json y generar enriched-batch-X.json`);
