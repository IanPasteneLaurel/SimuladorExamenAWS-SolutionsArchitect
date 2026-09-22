const fs = require('fs');
const path = require('path');

/**
 * SCRIPT DE ENRIQUECIMIENTO MASIVO
 * Este script toma TODAS las preguntas pendientes y las divide en archivos
 * de 100 preguntas cada uno para procesamiento eficiente
 */

const MAIN_FILE = path.join(__dirname, '..', 'app', 'src', 'data', 'SAA-C03-QuestionBank-923.json');
const OUTPUT_DIR = path.join(__dirname, 'mass-processing');

// Crear directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Leer todas las preguntas
console.log('📖 Leyendo preguntas del archivo principal...');
const allQuestions = JSON.parse(fs.readFileSync(MAIN_FILE, 'utf-8'));

// Filtrar preguntas pendientes
const pending = allQuestions.filter(q => {
  const exp = q.explanation || {};
  return !exp.why_correct || !exp.why_wrong || !exp.exam_tips;
});

console.log(`\n📊 ANÁLISIS:`);
console.log(`   Total: ${allQuestions.length} preguntas`);
console.log(`   Completadas: ${allQuestions.length - pending.length}`);
console.log(`   Pendientes: ${pending.length}`);

// Dividir en grupos de 100
const BATCH_SIZE = 100;
const batches = [];
for (let i = 0; i < pending.length; i += BATCH_SIZE) {
  batches.push(pending.slice(i, i + BATCH_SIZE));
}

console.log(`\n📦 Creando ${batches.length} archivos de procesamiento...\n`);

// Guardar cada batch
batches.forEach((batch, index) => {
  const filename = `mega-batch-${index + 1}-of-${batches.length}.json`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(batch, null, 2));
  
  const ids = batch.map(q => q.question_id).slice(0, 10).join(', ');
  console.log(`✅ ${filename}`);
  console.log(`   ${batch.length} preguntas (IDs: ${ids}...)`);
});

// Crear índice maestro
const index = {
  totalPending: pending.length,
  totalBatches: batches.length,
  batchSize: BATCH_SIZE,
  batches: batches.map((batch, i) => ({
    file: `mega-batch-${i + 1}-of-${batches.length}.json`,
    count: batch.length,
    firstId: batch[0].question_id,
    lastId: batch[batch.length - 1].question_id
  })),
  createdAt: new Date().toISOString()
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'INDEX.json'),
  JSON.stringify(index, null, 2)
);

console.log(`\n📋 Índice creado: mass-processing/INDEX.json`);
console.log(`\n🚀 LISTO PARA PROCESAMIENTO MASIVO`);
console.log(`\nArchivos en: ${OUTPUT_DIR}`);
