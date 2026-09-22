const fs = require('fs');
const qs = JSON.parse(fs.readFileSync('random-20-questions.json', 'utf8'));

console.log('\n' + '='.repeat(70));
console.log('📊 ANÁLISIS DETALLADO - 20 PREGUNTAS MUESTRA');
console.log('='.repeat(70) + '\n');

// Categorizar por calidad
const excellent = [];
const good = [];
const needsImprovement = [];

qs.forEach(q => {
  const exp = q.explanation;
  const isGeneric = exp.why_correct.includes('Solución que cumple los requisitos especificados.') ||
                    exp.why_correct === 'Solución óptima cumpliendo requisitos de escalabilidad, disponibilidad y eficiencia operacional.';
  
  const hasSpecificServices = exp.aws_services.length > 1 && !exp.aws_services.includes('AWS');
  const hasDetailedExplanation = exp.why_correct.length > 100;
  const hasSpecificMemorize = exp.memorize.length > 40;
  
  const score = (!isGeneric ? 2 : 0) + (hasSpecificServices ? 1 : 0) + 
                (hasDetailedExplanation ? 1 : 0) + (hasSpecificMemorize ? 1 : 0);
  
  if (score >= 4) excellent.push(q);
  else if (score >= 2) good.push(q);
  else needsImprovement.push(q);
});

console.log('🏆 EXCELENTE CALIDAD (' + excellent.length + ' preguntas)\n');
excellent.slice(0, 3).forEach(q => {
  console.log(`Q${q.question_id} - ${q.domain}`);
  console.log(`  Servicios: ${q.explanation.aws_services.join(', ')}`);
  console.log(`  Why correct: ${q.explanation.why_correct.substring(0, 100)}...`);
  console.log(`  Memorize: ${q.explanation.memorize.substring(0, 80)}...`);
  console.log('');
});

console.log('\n✅ BUENA CALIDAD (' + good.length + ' preguntas)\n');
good.slice(0, 3).forEach(q => {
  console.log(`Q${q.question_id} - ${q.domain}`);
  console.log(`  Servicios: ${q.explanation.aws_services.join(', ')}`);
  console.log(`  Why correct: ${q.explanation.why_correct.substring(0, 80)}...`);
  console.log('');
});

console.log('\n⚠️  NECESITA MEJORA (' + needsImprovement.length + ' preguntas)\n');
needsImprovement.forEach(q => {
  console.log(`Q${q.question_id} - ${q.domain}`);
  console.log(`  Servicios: ${q.explanation.aws_services.join(', ')}`);
  console.log(`  ❌ Problema: ${q.explanation.why_correct}`);
  console.log(`  ❌ Memorize: ${q.explanation.memorize}`);
  console.log('');
});

console.log('='.repeat(70));
console.log('\n📈 DISTRIBUCIÓN DE CALIDAD:\n');
console.log(`🏆 Excelente:        ${excellent.length}/20 (${(excellent.length/20*100).toFixed(0)}%)`);
console.log(`✅ Buena:            ${good.length}/20 (${(good.length/20*100).toFixed(0)}%)`);
console.log(`⚠️  Necesita mejora:  ${needsImprovement.length}/20 (${(needsImprovement.length/20*100).toFixed(0)}%)`);
console.log('\n' + '='.repeat(70));
