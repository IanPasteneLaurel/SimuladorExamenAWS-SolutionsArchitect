const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración
const BATCH_SIZE = 50; // Procesar 50 preguntas por lote
const MAIN_FILE = path.join(__dirname, '..', 'app', 'src', 'data', 'SAA-C03-QuestionBank-923.json');
const SCRIPTS_DIR = __dirname;

console.log('🚀 INICIANDO ENRIQUECIMIENTO AUTOMÁTICO MASIVO\n');

// Función para obtener preguntas sin estructura
function getPendingCount() {
  const data = JSON.parse(fs.readFileSync(MAIN_FILE, 'utf-8'));
  const pending = data.filter(q => {
    const exp = q.explanation || {};
    return !exp.why_correct || !exp.why_wrong || !exp.exam_tips || 
           !exp.memorize || !exp.aws_services || !exp.architectural_concept;
  });
  return { total: data.length, pending: pending.length, enriched: data.length - pending.length };
}

// Función para procesar un lote
function processBatch(batchNumber) {
  console.log(`\n📦 BATCH #${batchNumber}`);
  console.log('━'.repeat(80));
  
  try {
    // 1. Extraer siguiente lote
    console.log(`⏳ Extrayendo ${BATCH_SIZE} preguntas...`);
    execSync(`node extract-next-batch.js ${BATCH_SIZE}`, { cwd: SCRIPTS_DIR, stdio: 'inherit' });
    
    const batchFile = path.join(SCRIPTS_DIR, `batch-next-${BATCH_SIZE}.json`);
    if (!fs.existsSync(batchFile)) {
      console.log('❌ No hay más preguntas pendientes');
      return false;
    }
    
    const batch = JSON.parse(fs.readFileSync(batchFile, 'utf-8'));
    console.log(`✅ ${batch.length} preguntas extraídas`);
    
    if (batch.length === 0) {
      return false;
    }
    
    // 2. Generar archivo de instrucciones para el usuario
    const instructionsFile = path.join(SCRIPTS_DIR, `INSTRUCTIONS-BATCH-${batchNumber}.md`);
    const ids = batch.map(q => q.question_id).join(', ');
    
    fs.writeFileSync(instructionsFile, `# BATCH ${batchNumber} - Instrucciones

## Preguntas a procesar (${batch.length})
IDs: ${ids}

## Archivo de entrada
\`batch-next-${BATCH_SIZE}.json\`

## Archivo de salida esperado
\`enriched-batch-${batchNumber}.json\`

## IMPORTANTE
Este batch debe ser procesado por un subagente o IA.
El archivo batch-next-${BATCH_SIZE}.json está listo para ser enriquecido.

## Siguiente paso
Ejecutar: node apply-enrichment.js enriched-batch-${batchNumber}.json
`);
    
    console.log(`📝 Instrucciones guardadas en: INSTRUCTIONS-BATCH-${batchNumber}.md`);
    console.log(`\n⚠️  ACCIÓN REQUERIDA:`);
    console.log(`   1. Procesar batch-next-${BATCH_SIZE}.json con IA/subagente`);
    console.log(`   2. Guardar resultado como enriched-batch-${batchNumber}.json`);
    console.log(`   3. Presionar ENTER para aplicar el batch...`);
    
    return true; // Indica que hay más trabajo
    
  } catch (error) {
    console.error('❌ Error procesando batch:', error.message);
    return false;
  }
}

// Función para aplicar un batch enriquecido
function applyBatch(batchNumber) {
  const enrichedFile = path.join(SCRIPTS_DIR, `enriched-batch-${batchNumber}.json`);
  
  if (!fs.existsSync(enrichedFile)) {
    console.log(`⏭️  Saltando batch ${batchNumber} (archivo no encontrado)`);
    return false;
  }
  
  try {
    console.log(`\n📥 Aplicando batch ${batchNumber}...`);
    execSync(`node apply-enrichment.js enriched-batch-${batchNumber}.json`, { 
      cwd: SCRIPTS_DIR, 
      stdio: 'inherit' 
    });
    
    // Mover archivos procesados a carpeta de completados
    const completedDir = path.join(SCRIPTS_DIR, 'completed');
    if (!fs.existsSync(completedDir)) {
      fs.mkdirSync(completedDir);
    }
    
    fs.renameSync(enrichedFile, path.join(completedDir, `enriched-batch-${batchNumber}.json`));
    console.log(`✅ Batch ${batchNumber} aplicado y archivado`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error aplicando batch ${batchNumber}:`, error.message);
    return false;
  }
}

// Función principal
async function main() {
  const stats = getPendingCount();
  console.log(`📊 ESTADO INICIAL:`);
  console.log(`   Total: ${stats.total} preguntas`);
  console.log(`   Enriquecidas: ${stats.enriched} (${(stats.enriched/stats.total*100).toFixed(1)}%)`);
  console.log(`   Pendientes: ${stats.pending} (${(stats.pending/stats.total*100).toFixed(1)}%)`);
  console.log(`   Batches estimados: ${Math.ceil(stats.pending / BATCH_SIZE)}`);
  
  let batchNumber = 9; // Empezamos desde batch 9 (ya procesamos 8)
  let continueProcessing = true;
  
  while (continueProcessing) {
    continueProcessing = processBatch(batchNumber);
    
    if (continueProcessing) {
      batchNumber++;
      
      // Mostrar progreso actualizado
      const currentStats = getPendingCount();
      console.log(`\n📈 PROGRESO:`);
      console.log(`   Enriquecidas: ${currentStats.enriched}/${currentStats.total} (${(currentStats.enriched/currentStats.total*100).toFixed(1)}%)`);
      console.log(`   Pendientes: ${currentStats.pending}`);
    }
  }
  
  console.log('\n🎉 PROCESO COMPLETADO');
  const finalStats = getPendingCount();
  console.log(`\n📊 ESTADÍSTICAS FINALES:`);
  console.log(`   Total: ${finalStats.total} preguntas`);
  console.log(`   Enriquecidas: ${finalStats.enriched} (${(finalStats.enriched/finalStats.total*100).toFixed(1)}%)`);
  console.log(`   Pendientes: ${finalStats.pending} (${(finalStats.pending/finalStats.total*100).toFixed(1)}%)`);
}

// Ejecutar
main().catch(console.error);
