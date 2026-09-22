const fs = require('fs');

console.log('🔍 VALIDACIÓN DE 50 PREGUNTAS ALEATORIAS\n');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));

// Generar 50 IDs aleatorios únicos
const randomIds = [];
while (randomIds.length < 50) {
  const id = Math.floor(Math.random() * 923) + 1;
  if (!randomIds.includes(id)) {
    randomIds.push(id);
  }
}
randomIds.sort((a, b) => a - b);

const sample = randomIds.map(id => data.find(q => q.question_id === id));

console.log(`📋 Preguntas seleccionadas: ${randomIds.join(', ')}\n`);
console.log('='.repeat(80));
console.log('ANÁLISIS DETALLADO DE CADA PREGUNTA\n');

let excellent = 0;
let good = 0;
let poor = 0;
let issues = [];

sample.forEach((q, idx) => {
  const exp = q.explanation;
  const num = idx + 1;
  
  console.log(`\n${num}. Q${q.question_id} - ${q.domain}`);
  console.log('-'.repeat(80));
  
  // Analizar why_correct
  const wcLength = (exp.why_correct || '').length;
  const wcQuality = wcLength > 150 ? 'EXCELENTE' : wcLength > 80 ? 'BUENA' : wcLength > 40 ? 'BÁSICA' : 'POBRE';
  const wcIsGeneric = exp.why_correct && (
    exp.why_correct.includes('Solución óptima cumpliendo requisitos') ||
    exp.why_correct === 'Solución que cumple los requisitos especificados.' ||
    exp.why_correct.includes('usa servicios AWS apropiados cumpliendo requisitos')
  );
  
  console.log(`\n📝 WHY_CORRECT (${wcLength} chars): ${wcQuality}`);
  console.log(`   ${exp.why_correct?.substring(0, 120)}${wcLength > 120 ? '...' : ''}`);
  if (wcIsGeneric) {
    console.log(`   ⚠️  TEXTO GENÉRICO DETECTADO`);
    issues.push(`Q${q.question_id}: why_correct genérico`);
  }
  
  // Analizar why_wrong
  const wrongKeys = Object.keys(exp.why_wrong || {});
  let avgLength = 0;
  if (wrongKeys.length > 0) {
    avgLength = wrongKeys.reduce((sum, k) => sum + (exp.why_wrong[k] || '').length, 0) / wrongKeys.length;
    const wrongQuality = avgLength > 80 ? 'EXCELENTE' : avgLength > 50 ? 'BUENA' : 'BÁSICA';
    console.log(`\n❌ WHY_WRONG (${wrongKeys.length} opciones, avg ${avgLength.toFixed(0)} chars): ${wrongQuality}`);
    
    const allGeneric = wrongKeys.every(k => 
      (exp.why_wrong[k] || '').includes('No cumple') || 
      (exp.why_wrong[k] || '').includes('usa approach subóptimo') ||
      (exp.why_wrong[k] || '').includes('does not fully satisfy')
    );
    
    if (allGeneric) {
      console.log(`   ⚠️  TODAS LAS OPCIONES SON GENÉRICAS`);
      issues.push(`Q${q.question_id}: all why_wrong genéricos`);
    } else {
      // Mostrar ejemplo de una opción
      const sampleKey = wrongKeys[0];
      console.log(`   Ejemplo [${sampleKey}]: ${exp.why_wrong[sampleKey]?.substring(0, 100)}...`);
    }
  } else {
    console.log(`\n❌ WHY_WRONG: FALTA`);
    issues.push(`Q${q.question_id}: sin why_wrong`);
  }
  
  // Analizar exam_tips
  const etLength = (exp.exam_tips || '').length;
  const etQuality = etLength > 100 ? 'EXCELENTE' : etLength > 60 ? 'BUENA' : 'BÁSICA';
  const etIsGeneric = exp.exam_tips && (
    exp.exam_tips.includes('Identifica keywords. Compara trade-offs') ||
    exp.exam_tips.includes('Lee cuidadosamente los requisitos clave')
  );
  
  console.log(`\n💡 EXAM_TIPS (${etLength} chars): ${etQuality}`);
  console.log(`   ${exp.exam_tips?.substring(0, 100)}${etLength > 100 ? '...' : ''}`);
  if (etIsGeneric) {
    console.log(`   ⚠️  TEXTO GENÉRICO`);
    issues.push(`Q${q.question_id}: exam_tips genérico`);
  }
  
  // Analizar memorize
  const memType = Array.isArray(exp.memorize) ? 'ARRAY' : 'STRING';
  const memLength = Array.isArray(exp.memorize) ? exp.memorize.length : (exp.memorize || '').length;
  const memQuality = Array.isArray(exp.memorize) && memLength >= 3 ? 'EXCELENTE' : 
                     !Array.isArray(exp.memorize) && memLength > 50 ? 'BUENA' : 'BÁSICA';
  
  console.log(`\n🧠 MEMORIZE (${memType}[${memLength}]): ${memQuality}`);
  if (Array.isArray(exp.memorize)) {
    exp.memorize.slice(0, 2).forEach((m, i) => console.log(`   ${i+1}. ${m}`));
    if (exp.memorize.length > 2) console.log(`   ... (+${exp.memorize.length - 2} more)`);
  } else {
    console.log(`   ${exp.memorize?.substring(0, 80)}...`);
    if (exp.memorize && (exp.memorize.includes('Pattern AWS para') || exp.memorize.includes('Pattern para'))) {
      console.log(`   ⚠️  GENÉRICO`);
      issues.push(`Q${q.question_id}: memorize genérico`);
    }
  }
  
  // Analizar servicios
  const services = exp.aws_services || [];
  const svcQuality = services.length > 3 ? 'EXCELENTE' : services.length > 1 ? 'BUENA' : 'POBRE';
  console.log(`\n🔧 AWS_SERVICES (${services.length}): ${svcQuality}`);
  console.log(`   ${services.slice(0, 5).join(', ')}${services.length > 5 ? '...' : ''}`);
  if (services.length === 1 && services[0] === 'AWS') {
    console.log(`   ⚠️  SOLO SERVICIO GENÉRICO [AWS]`);
    issues.push(`Q${q.question_id}: servicio genérico`);
  }
  
  // Calificación general
  let score = 0;
  if (!wcIsGeneric && wcLength > 100) score += 3;
  else if (!wcIsGeneric && wcLength > 60) score += 2;
  else if (wcLength > 30) score += 1;
  
  if (wrongKeys.length > 0 && avgLength > 60) score += 2;
  else if (wrongKeys.length > 0) score += 1;
  
  if (!etIsGeneric && etLength > 80) score += 2;
  else if (etLength > 50) score += 1;
  
  if (Array.isArray(exp.memorize) && memLength >= 3) score += 2;
  else if (memLength > 40) score += 1;
  
  if (services.length > 3) score += 1;
  
  const rating = score >= 8 ? 'EXCELENTE' : score >= 5 ? 'BUENA' : 'POBRE';
  console.log(`\n⭐ CALIFICACIÓN GENERAL: ${rating} (${score}/10)`);
  
  if (rating === 'EXCELENTE') excellent++;
  else if (rating === 'BUENA') good++;
  else poor++;
});

// Resumen final
console.log('\n' + '='.repeat(80));
console.log('\n📊 RESUMEN DE VALIDACIÓN\n');
console.log(`Total preguntas analizadas: 50`);
console.log(`\n🏆 EXCELENTE: ${excellent} (${(excellent/50*100).toFixed(1)}%)`);
console.log(`✅ BUENA:     ${good} (${(good/50*100).toFixed(1)}%)`);
console.log(`❌ POBRE:     ${poor} (${(poor/50*100).toFixed(1)}%)`);

if (issues.length > 0) {
  console.log(`\n⚠️  PROBLEMAS DETECTADOS: ${issues.length}`);
  const grouped = {};
  issues.forEach(issue => {
    const type = issue.split(': ')[1];
    grouped[type] = (grouped[type] || 0) + 1;
  });
  Object.entries(grouped).forEach(([type, count]) => {
    console.log(`   - ${count} preguntas con ${type}`);
  });
}

const passRate = ((excellent + good) / 50 * 100).toFixed(1);
console.log(`\n📈 TASA DE APROBACIÓN: ${passRate}%`);

if (passRate >= 90) {
  console.log(`\n✅ CALIDAD ALTA - Dataset listo`);
} else if (passRate >= 70) {
  console.log(`\n⚠️  CALIDAD MEDIA - Necesita mejora`);
} else {
  console.log(`\n❌ CALIDAD BAJA - Requiere trabajo significativo`);
}

console.log('\n' + '='.repeat(80));
