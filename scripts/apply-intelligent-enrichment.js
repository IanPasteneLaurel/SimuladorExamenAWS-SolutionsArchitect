const fs = require('fs');

console.log('🚀 APLICANDO MEJORAS INTELIGENTES\n');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));

// Crear backup
const backupFile = `SAA-C03-QuestionBank-923.backup-intelligent-${Date.now()}.json`;
fs.writeFileSync(`../app/src/data/${backupFile}`, JSON.stringify(data, null, 2));
console.log(`💾 Backup creado: ${backupFile}\n`);

let totalUpdated = 0;

// Aplicar cada batch
for (let i = 1; i <= 11; i++) {
  const filename = `intelligent-enrichment-batch-${i}.json`;
  
  if (!fs.existsSync(filename)) {
    console.log(`⚠️  Batch ${i} no encontrado, saltando...`);
    continue;
  }
  
  const batch = JSON.parse(fs.readFileSync(filename, 'utf8'));
  
  console.log(`📦 Aplicando Batch ${i}: ${batch.length} preguntas...`);
  
  batch.forEach(enrichment => {
    const question = data.find(q => q.question_id === enrichment.question_id);
    
    if (question && question.explanation) {
      // Actualizar explicación
      question.explanation.why_correct = enrichment.explanation.why_correct;
      question.explanation.why_wrong = enrichment.explanation.why_wrong;
      question.explanation.exam_tips = enrichment.explanation.exam_tips;
      question.explanation.memorize = enrichment.explanation.memorize;
      question.explanation.aws_services = enrichment.explanation.aws_services;
      
      totalUpdated++;
    }
  });
  
  console.log(`   ✅ Batch ${i} aplicado`);
}

// Guardar archivo actualizado
fs.writeFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', JSON.stringify(data, null, 2));

console.log('\n' + '='.repeat(70));
console.log('✅ MEJORAS APLICADAS EXITOSAMENTE');
console.log(`📊 Total preguntas actualizadas: ${totalUpdated}`);
console.log('='.repeat(70));
console.log('\n🔍 Ejecuta strict-quality-analysis.js para verificar resultados');
