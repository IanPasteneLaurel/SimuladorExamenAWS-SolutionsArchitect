const { execSync } = require('child_process');
const fs = require('fs');

// Calcular total de batches necesarios
const genericIds = JSON.parse(fs.readFileSync('generic-question-ids.json', 'utf8'));
const totalBatches = Math.ceil(genericIds.length / 50);

console.log(`📦 Total batches a procesar: ${totalBatches}`);
console.log(`📊 Total preguntas: ${genericIds.length}`);
console.log('');

const startBatch = parseInt(process.argv[2]) || 2;
const endBatch = parseInt(process.argv[3]) || totalBatches;

console.log(`🚀 Procesando batches ${startBatch} a ${endBatch}...\n`);

for (let i = startBatch; i <= endBatch; i++) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📦 BATCH ${i}/${totalBatches}`);
  console.log('='.repeat(50));
  
  try {
    // Generar mejora
    console.log(`\n⚙️  Generando mejoras...`);
    execSync(`node improve-quality.js ${i}`, { stdio: 'inherit' });
    
    // Aplicar mejoras
    console.log(`\n💾 Aplicando cambios...`);
    execSync(`node apply-enrichment.js improved-batch-${i}.json`, { stdio: 'inherit' });
    
    console.log(`\n✅ Batch ${i} completado exitosamente!`);
    
  } catch (error) {
    console.error(`\n❌ Error en batch ${i}:`, error.message);
    process.exit(1);
  }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`🎉 ¡Proceso completado!`);
console.log(`📊 Batches procesados: ${startBatch} a ${endBatch}`);
console.log('='.repeat(50));

// Verificar progreso
console.log('\n📊 Verificando calidad final...');
const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));
const generic = data.filter(q => 
  q.explanation && 
  q.explanation.why_correct === 'Solución óptima cumpliendo requisitos de escalabilidad, disponibilidad y eficiencia operacional.'
);
const personalized = data.filter(q => 
  q.explanation && 
  q.explanation.why_correct && 
  q.explanation.why_correct !== 'Solución óptima cumpliendo requisitos de escalabilidad, disponibilidad y eficiencia operacional.'
);

console.log('\n✅ Personalizadas:', personalized.length, `(${(personalized.length/923*100).toFixed(1)}%)`);
console.log('❌ Genéricas restantes:', generic.length, `(${(generic.length/923*100).toFixed(1)}%)`);
