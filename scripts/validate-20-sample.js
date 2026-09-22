const fs = require('fs');

const questions = JSON.parse(fs.readFileSync('validation-20-random.json', 'utf8'));
const report = JSON.parse(fs.readFileSync('quality-report.json', 'utf8'));

console.log('\n' + '='.repeat(70));
console.log('🔍 VALIDACIÓN DETALLADA - 20 PREGUNTAS ALEATORIAS (2da Muestra)');
console.log('='.repeat(70) + '\n');

// Calcular score para cada pregunta
function calculateScore(q) {
  const exp = q.explanation;
  if (!exp) return 0;
  
  let score = 0;
  const whyCorrect = exp.why_correct || '';
  if (whyCorrect.length > 150) score += 3;
  else if (whyCorrect.length > 80) score += 2;
  else if (whyCorrect.length > 30) score += 1;
  
  if (whyCorrect.includes('Solución óptima cumpliendo requisitos de escalabilidad, disponibilidad y eficiencia operacional.')) score -= 2;
  if (whyCorrect === 'Solución que cumple los requisitos especificados.') score -= 2;
  
  const services = exp.aws_services || [];
  if (services.length > 3 && !services.includes('AWS')) score += 2;
  else if (services.length > 1 && !services.includes('AWS')) score += 1;
  else if (services.includes('AWS') && services.length === 1) score -= 1;
  
  const whyWrong = exp.why_wrong || {};
  const wrongKeys = Object.keys(whyWrong);
  if (wrongKeys.length > 0) {
    const avgWrongLength = wrongKeys.reduce((sum, key) => sum + (whyWrong[key] || '').length, 0) / wrongKeys.length;
    if (avgWrongLength > 80) score += 2;
    else if (avgWrongLength > 40) score += 1;
  }
  
  const examTips = exp.exam_tips || '';
  if (examTips.length > 80 && !examTips.includes('Identifica keywords. Compara trade-offs.')) score += 1;
  
  const memorize = exp.memorize || '';
  if (Array.isArray(memorize) && memorize.length > 2) score += 2;
  else if (typeof memorize === 'string' && memorize.length > 50 && !memorize.includes('Pattern AWS para este escenario')) score += 2;
  else if (typeof memorize === 'string' && memorize.length > 30) score += 1;
  else if (memorize.includes('Pattern AWS para este escenario') || memorize.includes('Pattern para')) score -= 1;
  
  if (exp.full_text) score += 1;
  
  return Math.max(0, score);
}

const analyzed = questions.map(q => ({
  ...q,
  calculated_score: calculateScore(q)
}));

// Categorizar
const excellent = analyzed.filter(q => q.calculated_score >= 7);
const good = analyzed.filter(q => q.calculated_score >= 4 && q.calculated_score < 7);
const fair = analyzed.filter(q => q.calculated_score >= 2 && q.calculated_score < 4);
const poor = analyzed.filter(q => q.calculated_score < 2);

console.log('📊 DISTRIBUCIÓN DE CALIDAD:\n');
console.log(`🏆 Excelente (7-10 pts):  ${excellent.length}/20 (${(excellent.length/20*100).toFixed(0)}%)`);
console.log(`✅ Buena (4-6 pts):       ${good.length}/20 (${(good.length/20*100).toFixed(0)}%)`);
console.log(`⚠️  Regular (2-3 pts):     ${fair.length}/20 (${(fair.length/20*100).toFixed(0)}%)`);
console.log(`❌ Pobre (0-1 pts):       ${poor.length}/20 (${(poor.length/20*100).toFixed(0)}%)`);
console.log('');

const avgScore = analyzed.reduce((sum, q) => sum + q.calculated_score, 0) / analyzed.length;
console.log(`📈 Score promedio muestra: ${avgScore.toFixed(2)}/10`);
console.log(`📊 Score promedio global:  6.72/10`);
console.log('');

// Análisis detallado de cada pregunta
console.log('='.repeat(70));
console.log('📋 ANÁLISIS INDIVIDUAL:\n');

analyzed.forEach((q, idx) => {
  const exp = q.explanation;
  const score = q.calculated_score;
  
  let emoji = '❌';
  if (score >= 9) emoji = '🏆';
  else if (score >= 7) emoji = '⭐';
  else if (score >= 5) emoji = '✅';
  else if (score >= 3) emoji = '⚠️';
  
  console.log(`${emoji} Q${q.question_id} - ${q.domain}`);
  console.log(`   Score: ${score}/10`);
  console.log(`   Servicios (${exp.aws_services.length}): ${exp.aws_services.slice(0, 4).join(', ')}${exp.aws_services.length > 4 ? '...' : ''}`);
  console.log(`   Why_correct: ${exp.why_correct.substring(0, 70)}...`);
  
  if (Array.isArray(exp.memorize)) {
    console.log(`   Memorize: Array[${exp.memorize.length}] - ${exp.memorize[0]?.substring(0, 50)}...`);
  } else {
    console.log(`   Memorize: ${exp.memorize.substring(0, 60)}...`);
  }
  
  // Análisis de calidad
  if (score >= 9) {
    console.log(`   ✨ EXCELENTE: Explicación profunda, múltiples servicios específicos`);
  } else if (score >= 7) {
    console.log(`   👍 MUY BUENA: Análisis sólido con servicios identificados`);
  } else if (score >= 5) {
    console.log(`   ✓ BUENA: Correcta pero podría tener más detalle`);
  } else if (score >= 3) {
    console.log(`   ⚠️ REGULAR: Servicios OK pero explicación limitada`);
  } else {
    console.log(`   ❌ POBRE: Texto genérico, necesita enriquecimiento`);
  }
  
  console.log('');
});

// Mejores 3
console.log('='.repeat(70));
console.log('🥇 TOP 3 DE ESTA MUESTRA:\n');
analyzed.sort((a, b) => b.calculated_score - a.calculated_score);
analyzed.slice(0, 3).forEach((q, idx) => {
  const exp = q.explanation;
  console.log(`${idx + 1}. Q${q.question_id} - Score: ${q.calculated_score}/10`);
  console.log(`   Dominio: ${q.domain}`);
  console.log(`   Servicios: ${exp.aws_services.join(', ')}`);
  console.log(`   Why_correct (${exp.why_correct.length} chars): ${exp.why_correct.substring(0, 100)}...`);
  if (Array.isArray(exp.memorize)) {
    console.log(`   Memorize items:`);
    exp.memorize.slice(0, 3).forEach((m, i) => console.log(`     ${i+1}. ${m}`));
  } else {
    console.log(`   Memorize: ${exp.memorize}`);
  }
  console.log('');
});

// Peores 3
console.log('='.repeat(70));
console.log('⚠️  BOTTOM 3 DE ESTA MUESTRA:\n');
analyzed.slice(-3).reverse().forEach((q, idx) => {
  const exp = q.explanation;
  console.log(`${idx + 1}. Q${q.question_id} - Score: ${q.calculated_score}/10`);
  console.log(`   Dominio: ${q.domain}`);
  console.log(`   Servicios: ${exp.aws_services.join(', ')}`);
  console.log(`   ❌ Why_correct: ${exp.why_correct}`);
  console.log(`   ❌ Memorize: ${exp.memorize}`);
  console.log('');
});

console.log('='.repeat(70));
console.log('\n✅ Validación completada\n');
