const fs = require('fs');

console.log('📊 Analizando calidad de 923 preguntas...\n');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));

// Función para calcular score de calidad
function calculateQualityScore(q) {
  const exp = q.explanation;
  if (!exp) return 0;
  
  let score = 0;
  
  // 1. Why_correct quality (0-3 puntos)
  const whyCorrect = exp.why_correct || '';
  if (whyCorrect.length > 150) score += 3;
  else if (whyCorrect.length > 80) score += 2;
  else if (whyCorrect.length > 30) score += 1;
  
  // Penalizar texto genérico
  if (whyCorrect.includes('Solución óptima cumpliendo requisitos de escalabilidad, disponibilidad y eficiencia operacional.')) {
    score -= 2;
  }
  if (whyCorrect === 'Solución que cumple los requisitos especificados.') {
    score -= 2;
  }
  
  // 2. AWS Services specificity (0-2 puntos)
  const services = exp.aws_services || [];
  if (services.length > 3 && !services.includes('AWS')) score += 2;
  else if (services.length > 1 && !services.includes('AWS')) score += 1;
  else if (services.includes('AWS') && services.length === 1) score -= 1;
  
  // 3. Why_wrong quality (0-2 puntos)
  const whyWrong = exp.why_wrong || {};
  const wrongKeys = Object.keys(whyWrong);
  if (wrongKeys.length > 0) {
    const avgWrongLength = wrongKeys.reduce((sum, key) => sum + (whyWrong[key] || '').length, 0) / wrongKeys.length;
    if (avgWrongLength > 80) score += 2;
    else if (avgWrongLength > 40) score += 1;
  }
  
  // 4. Exam tips quality (0-1 punto)
  const examTips = exp.exam_tips || '';
  if (examTips.length > 80 && !examTips.includes('Identifica keywords. Compara trade-offs.')) {
    score += 1;
  }
  
  // 5. Memorize quality (0-2 puntos)
  const memorize = exp.memorize || '';
  if (Array.isArray(memorize) && memorize.length > 2) {
    score += 2;
  } else if (typeof memorize === 'string' && memorize.length > 50 && !memorize.includes('Pattern AWS para este escenario')) {
    score += 2;
  } else if (typeof memorize === 'string' && memorize.length > 30) {
    score += 1;
  } else if (memorize.includes('Pattern AWS para este escenario') || memorize.includes('Pattern para')) {
    score -= 1;
  }
  
  // Bonus: Full explanation object present
  if (exp.full_text) score += 1;
  
  return Math.max(0, score); // No negative scores
}

// Analizar todas las preguntas
const analyzed = data.map(q => ({
  question_id: q.question_id,
  domain: q.domain,
  score: calculateQualityScore(q),
  services: q.explanation?.aws_services || [],
  why_correct_length: (q.explanation?.why_correct || '').length,
  memorize: q.explanation?.memorize || ''
}));

// Ordenar por score descendente
analyzed.sort((a, b) => b.score - a.score);

// Categorizar
const excellent = analyzed.filter(q => q.score >= 7); // 7-10 puntos
const good = analyzed.filter(q => q.score >= 4 && q.score < 7); // 4-6 puntos
const fair = analyzed.filter(q => q.score >= 2 && q.score < 4); // 2-3 puntos
const poor = analyzed.filter(q => q.score < 2); // 0-1 puntos

console.log('=' .repeat(70));
console.log('📈 RESULTADOS DEL ANÁLISIS DE CALIDAD');
console.log('='.repeat(70));
console.log('');

console.log('🏆 EXCELENTE (7-10 pts):  ', excellent.length.toString().padStart(3), '/', data.length, `(${(excellent.length/data.length*100).toFixed(1)}%)`);
console.log('✅ BUENA (4-6 pts):       ', good.length.toString().padStart(3), '/', data.length, `(${(good.length/data.length*100).toFixed(1)}%)`);
console.log('⚠️  REGULAR (2-3 pts):     ', fair.length.toString().padStart(3), '/', data.length, `(${(fair.length/data.length*100).toFixed(1)}%)`);
console.log('❌ POBRE (0-1 pts):       ', poor.length.toString().padStart(3), '/', data.length, `(${(poor.length/data.length*100).toFixed(1)}%)`);
console.log('');

// Score promedio
const avgScore = analyzed.reduce((sum, q) => sum + q.score, 0) / analyzed.length;
console.log('📊 Score promedio:         ', avgScore.toFixed(2), '/ 10');
console.log('');

// Top 10 mejores
console.log('='.repeat(70));
console.log('🥇 TOP 10 MEJORES PREGUNTAS:');
console.log('='.repeat(70));
analyzed.slice(0, 10).forEach((q, idx) => {
  console.log(`${(idx + 1).toString().padStart(2)}. Q${q.question_id.toString().padStart(3)} | Score: ${q.score.toString().padStart(2)} | ${q.domain}`);
  console.log(`    Servicios: ${q.services.slice(0, 4).join(', ')}`);
  console.log(`    Memorize: ${typeof q.memorize === 'string' ? q.memorize.substring(0, 60) : 'Array[' + q.memorize.length + ']'}...`);
  console.log('');
});

// Bottom 10 peores
console.log('='.repeat(70));
console.log('⚠️  BOTTOM 10 - NECESITAN MÁS TRABAJO:');
console.log('='.repeat(70));
analyzed.slice(-10).reverse().forEach((q, idx) => {
  console.log(`${(idx + 1).toString().padStart(2)}. Q${q.question_id.toString().padStart(3)} | Score: ${q.score.toString().padStart(2)} | ${q.domain}`);
  console.log(`    Servicios: ${q.services.join(', ')}`);
  console.log(`    Why_correct length: ${q.why_correct_length} chars`);
  console.log('');
});

// Análisis por dominio
console.log('='.repeat(70));
console.log('📊 CALIDAD POR DOMINIO:');
console.log('='.repeat(70));

const domains = {};
analyzed.forEach(q => {
  if (!domains[q.domain]) {
    domains[q.domain] = { total: 0, sum: 0, excellent: 0 };
  }
  domains[q.domain].total++;
  domains[q.domain].sum += q.score;
  if (q.score >= 7) domains[q.domain].excellent++;
});

Object.entries(domains)
  .sort((a, b) => (b[1].sum / b[1].total) - (a[1].sum / a[1].total))
  .forEach(([domain, stats]) => {
    const avg = (stats.sum / stats.total).toFixed(1);
    const excellentPct = ((stats.excellent / stats.total) * 100).toFixed(0);
    console.log(`${domain.substring(0, 40).padEnd(40)} | Avg: ${avg.padStart(4)} | Excelentes: ${stats.excellent.toString().padStart(3)}/${stats.total.toString().padStart(3)} (${excellentPct}%)`);
  });

// Guardar resultados detallados
const report = {
  summary: {
    total: data.length,
    average_score: avgScore,
    excellent: excellent.length,
    good: good.length,
    fair: fair.length,
    poor: poor.length
  },
  top_10: analyzed.slice(0, 10),
  bottom_10: analyzed.slice(-10).reverse(),
  by_domain: domains,
  all_scores: analyzed
};

fs.writeFileSync('quality-report.json', JSON.stringify(report, null, 2));
console.log('\n✅ Reporte completo guardado en: quality-report.json');
