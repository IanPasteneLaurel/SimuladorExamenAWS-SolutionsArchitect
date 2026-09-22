const fs = require('fs');

console.log('🔍 IDENTIFICANDO 30 PREGUNTAS FAIR PARA PULIR\n');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));

// Función de scoring (misma que strict-quality-analysis.js)
function scoreQuestion(q) {
  const exp = q.explanation;
  if (!exp) return 0;
  
  let score = 0;
  
  // 1. why_correct (0-4 pts)
  const wcLength = (exp.why_correct || '').length;
  const wcIsGeneric = exp.why_correct && (
    exp.why_correct.includes('Solución óptima cumpliendo requisitos') ||
    exp.why_correct.includes('usa servicios AWS apropiados cumpliendo requisitos') ||
    exp.why_correct === 'Solución que cumple los requisitos especificados.' ||
    exp.why_correct.startsWith('Opción correcta porque usa servicios AWS apropiados') ||
    exp.why_correct.includes('This architecture aligns with AWS Well-Architected Framework')
  );
  
  if (!wcIsGeneric && wcLength > 200) score += 4;
  else if (!wcIsGeneric && wcLength > 120) score += 3;
  else if (!wcIsGeneric && wcLength > 60) score += 2;
  else if (wcLength > 30) score += 1;
  
  // 2. why_wrong (0-4 pts)
  const wrongKeys = Object.keys(exp.why_wrong || {});
  if (wrongKeys.length > 0) {
    const avgLength = wrongKeys.reduce((sum, k) => sum + (exp.why_wrong[k] || '').length, 0) / wrongKeys.length;
    const allGeneric = wrongKeys.every(k => {
      const text = exp.why_wrong[k] || '';
      return text.includes('No cumple') ||
             text.includes('usa approach subóptimo') ||
             text.includes('does not fully satisfy') ||
             text === 'This approach does not fully satisfy the requirements or introduces unnecessary complexity/cost.' ||
             text.includes('Missing key requirement:') ||
             text.includes('This option uses incorrect or suboptimal service');
    });
    
    if (!allGeneric && avgLength > 120) score += 4;
    else if (!allGeneric && avgLength > 80) score += 3;
    else if (avgLength > 50) score += 2;
    else if (wrongKeys.length > 0) score += 1;
  }
  
  // 3. exam_tips (0-3 pts)
  const etLength = (exp.exam_tips || '').length;
  const etIsGeneric = exp.exam_tips && (
    exp.exam_tips.includes('Identifica keywords. Compara trade-offs') ||
    exp.exam_tips === 'Lee cuidadosamente los requisitos clave del escenario.'
  );
  
  if (!etIsGeneric && etLength > 150) score += 3;
  else if (!etIsGeneric && etLength > 80) score += 2;
  else if (etLength > 40) score += 1;
  
  // 4. memorize (0-3 pts)
  const memLength = Array.isArray(exp.memorize) ? exp.memorize.length : (exp.memorize || '').length;
  const memIsArray = Array.isArray(exp.memorize);
  const memIsGeneric = exp.memorize && !memIsArray && (
    exp.memorize.includes('Pattern AWS para') ||
    exp.memorize.includes('Pattern para') ||
    exp.memorize.includes('servicios managed AWS')
  );
  
  if (memIsArray && memLength >= 4) score += 3;
  else if (memIsArray && memLength >= 2) score += 2;
  else if (!memIsGeneric && memLength > 60) score += 2;
  else if (memLength > 30) score += 1;
  
  // 5. aws_services (0-2 pts)
  const services = exp.aws_services || [];
  if (services.length > 3) score += 2;
  else if (services.length > 1) score += 1;
  else if (services.length === 1 && services[0] !== 'AWS') score += 1;
  
  // 6. architectural_concept (0-1 pts)
  if (exp.architectural_concept && exp.architectural_concept !== q.domain) score += 1;
  
  return score;
}

// Identificar preguntas FAIR (4-6 pts)
const fairQuestions = data
  .map(q => ({ ...q, score: scoreQuestion(q) }))
  .filter(q => q.score >= 4 && q.score <= 6)
  .sort((a, b) => a.score - b.score);

console.log(`Encontradas: ${fairQuestions.length} preguntas FAIR (score 4-6)\n`);
console.log('='.repeat(80));

// Análisis detallado de cada pregunta
fairQuestions.forEach((q, idx) => {
  const exp = q.explanation;
  console.log(`\n${idx + 1}. Q${q.question_id} - ${q.domain} | Score: ${q.score}/17`);
  console.log('-'.repeat(80));
  
  // Identificar problemas específicos
  const issues = [];
  
  // why_correct
  const wcLength = (exp.why_correct || '').length;
  const wcIsGeneric = exp.why_correct && (
    exp.why_correct.includes('usa servicios AWS apropiados') ||
    exp.why_correct.includes('This architecture aligns with AWS Well-Architected Framework') ||
    wcLength < 60
  );
  
  if (wcIsGeneric || wcLength < 100) {
    issues.push(`❌ why_correct: ${wcLength} chars, ${wcIsGeneric ? 'GENÉRICO' : 'muy corto'}`);
  }
  
  // why_wrong
  const wrongKeys = Object.keys(exp.why_wrong || {});
  if (wrongKeys.length > 0) {
    const avgLength = wrongKeys.reduce((sum, k) => sum + (exp.why_wrong[k] || '').length, 0) / wrongKeys.length;
    const allGeneric = wrongKeys.every(k => {
      const text = exp.why_wrong[k] || '';
      return text.includes('Missing key requirement:') || text.length < 60;
    });
    
    if (allGeneric || avgLength < 80) {
      issues.push(`❌ why_wrong: avg ${avgLength.toFixed(0)} chars, ${allGeneric ? 'GENÉRICOS' : 'muy cortos'}`);
    }
  } else {
    issues.push(`❌ why_wrong: FALTA`);
  }
  
  // exam_tips
  const etLength = (exp.exam_tips || '').length;
  if (etLength < 80) {
    issues.push(`⚠️  exam_tips: ${etLength} chars (corto)`);
  }
  
  // memorize
  const memLength = Array.isArray(exp.memorize) ? exp.memorize.length : (exp.memorize || '').length;
  const memIsArray = Array.isArray(exp.memorize);
  const memIsGeneric = !memIsArray && exp.memorize && exp.memorize.includes('servicios managed AWS');
  
  if (memIsGeneric || (!memIsArray && memLength < 60) || (memIsArray && memLength < 3)) {
    issues.push(`⚠️  memorize: ${memIsArray ? `array[${memLength}]` : `${memLength} chars`} ${memIsGeneric ? '(GENÉRICO)' : '(corto)'}`);
  }
  
  // services
  const services = exp.aws_services || [];
  if (services.length <= 1) {
    issues.push(`⚠️  services: solo ${services.length}`);
  }
  
  console.log(`Pregunta: ${q.question_en.substring(0, 120)}...`);
  console.log(`\nProblemas identificados (${issues.length}):`);
  issues.forEach(issue => console.log(`  ${issue}`));
  
  console.log(`\nContenido actual:`);
  console.log(`  why_correct: "${exp.why_correct?.substring(0, 80)}..."`);
  console.log(`  services: [${services.join(', ')}]`);
});

console.log('\n' + '='.repeat(80));
console.log('\n📊 RESUMEN DE PROBLEMAS:\n');

const problemTypes = {
  'why_correct genérico/corto': 0,
  'why_wrong genérico/corto': 0,
  'exam_tips corto': 0,
  'memorize genérico/corto': 0,
  'pocos servicios': 0
};

fairQuestions.forEach(q => {
  const exp = q.explanation;
  const wcLength = (exp.why_correct || '').length;
  const wcIsGeneric = exp.why_correct && (exp.why_correct.includes('usa servicios AWS apropiados') || wcLength < 60);
  
  if (wcIsGeneric || wcLength < 100) problemTypes['why_correct genérico/corto']++;
  
  const wrongKeys = Object.keys(exp.why_wrong || {});
  if (wrongKeys.length > 0) {
    const avgLength = wrongKeys.reduce((sum, k) => sum + (exp.why_wrong[k] || '').length, 0) / wrongKeys.length;
    if (avgLength < 80) problemTypes['why_wrong genérico/corto']++;
  }
  
  if ((exp.exam_tips || '').length < 80) problemTypes['exam_tips corto']++;
  
  const memLength = Array.isArray(exp.memorize) ? exp.memorize.length : (exp.memorize || '').length;
  const memIsGeneric = !Array.isArray(exp.memorize) && exp.memorize && exp.memorize.includes('servicios managed AWS');
  if (memIsGeneric || memLength < 60) problemTypes['memorize genérico/corto']++;
  
  if ((exp.aws_services || []).length <= 1) problemTypes['pocos servicios']++;
});

Object.entries(problemTypes).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}/${fairQuestions.length}`);
});

// Guardar IDs para procesamiento
const ids = fairQuestions.map(q => q.question_id);
fs.writeFileSync('fair-questions-ids.json', JSON.stringify(ids, null, 2), 'utf8');
console.log(`\n💾 IDs guardados en: fair-questions-ids.json`);
console.log('='.repeat(80));
