const fs = require('fs');

console.log('🔍 ANÁLISIS ESTRICTO DE PERSONALIZACIÓN - 923 PREGUNTAS\n');
console.log('Criterios más rigurosos enfocados en DETALLE y PERSONALIZACIÓN\n');

const path = require('path');
const dbPath = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Patrones de texto genérico a detectar
const genericPatterns = {
  why_correct: [
    'Solución óptima cumpliendo requisitos de escalabilidad, disponibilidad y eficiencia operacional.',
    'Solución que cumple los requisitos especificados.',
    'Opción correcta porque usa servicios AWS apropiados',
    /^.{0,80}$/  // Menos de 80 caracteres
  ],
  memorize: [
    'Pattern AWS para este escenario',
    /Pattern para .+/,
    /^.{0,40}$/  // Menos de 40 caracteres
  ],
  exam_tips: [
    'Identifica keywords. Compara trade-offs. Elimina opciones incorrectas',
    'Lee cuidadosamente los requisitos clave.',
    /^.{0,60}$/  // Menos de 60 caracteres
  ],
  why_wrong: [
    'No cumple requisitos clave o usa servicio subóptimo.',
    'No cumple todos los requisitos o usa approach subóptimo.',
    /^.{0,50}$/  // Menos de 50 caracteres
  ]
};

// Función para detectar si texto es genérico
function isGeneric(text, patterns) {
  if (!text) return true;
  return patterns.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(text);
    }
    return text.includes(pattern);
  });
}

// Función de scoring MÁS ESTRICTA enfocada en personalización
function analyzePersonalization(q) {
  const exp = q.explanation;
  if (!exp) return { score: 0, issues: ['No explanation'], category: 'MISSING' };
  
  let score = 0;
  const issues = [];
  
  // 1. WHY_CORRECT Analysis (0-5 puntos)
  const whyCorrect = exp.why_correct || '';
  const isGenericWC = isGeneric(whyCorrect, genericPatterns.why_correct);
  
  if (whyCorrect.length > 200 && !isGenericWC) {
    score += 5; // Muy detallado y personalizado
  } else if (whyCorrect.length > 120 && !isGenericWC) {
    score += 4; // Detallado
  } else if (whyCorrect.length > 80 && !isGenericWC) {
    score += 2; // Básico pero personalizado
  } else if (isGenericWC) {
    score += 0; // Genérico
    issues.push('why_correct genérico');
  } else {
    score += 1; // Muy corto
    issues.push('why_correct muy corto');
  }
  
  // 2. WHY_WRONG Analysis (0-4 puntos)
  const whyWrong = exp.why_wrong || {};
  const wrongKeys = Object.keys(whyWrong);
  
  if (wrongKeys.length === 0) {
    issues.push('No why_wrong');
  } else {
    let genericCount = 0;
    let detailedCount = 0;
    
    wrongKeys.forEach(key => {
      const text = whyWrong[key] || '';
      if (isGeneric(text, genericPatterns.why_wrong)) {
        genericCount++;
      } else if (text.length > 60) {
        detailedCount++;
      }
    });
    
    if (detailedCount === wrongKeys.length) {
      score += 4; // Todas detalladas
    } else if (detailedCount > wrongKeys.length / 2) {
      score += 2; // Mayoría detalladas
    } else if (genericCount === wrongKeys.length) {
      issues.push('All why_wrong genéricos');
    } else {
      score += 1; // Mix
    }
  }
  
  // 3. MEMORIZE Analysis (0-3 puntos)
  const memorize = exp.memorize || '';
  
  if (Array.isArray(memorize)) {
    if (memorize.length >= 5) {
      score += 3; // Array con 5+ items
    } else if (memorize.length >= 3) {
      score += 2;
    } else {
      score += 1;
    }
  } else {
    const isGenericMem = isGeneric(memorize, genericPatterns.memorize);
    if (memorize.length > 80 && !isGenericMem) {
      score += 3; // Detallado
    } else if (memorize.length > 50 && !isGenericMem) {
      score += 2;
    } else if (isGenericMem) {
      issues.push('memorize genérico');
    } else {
      score += 1;
    }
  }
  
  // 4. EXAM_TIPS Analysis (0-2 puntos)
  const examTips = exp.exam_tips || '';
  const isGenericET = isGeneric(examTips, genericPatterns.exam_tips);
  
  if (examTips.length > 100 && !isGenericET) {
    score += 2;
  } else if (examTips.length > 60 && !isGenericET) {
    score += 1;
  } else if (isGenericET) {
    issues.push('exam_tips genérico');
  }
  
  // 5. AWS_SERVICES specificity (0-2 puntos)
  const services = exp.aws_services || [];
  if (services.length === 1 && services[0] === 'AWS') {
    issues.push('Solo servicio genérico [AWS]');
  } else if (services.length > 3) {
    score += 2;
  } else if (services.length > 1) {
    score += 1;
  }
  
  // 6. BONUS: Full explanation text (0-1 punto)
  if (exp.full_text && exp.full_text.length > 200) {
    score += 1;
  }
  
  // Determinar categoría
  let category;
  if (score >= 14) category = 'EXCELLENT';
  else if (score >= 10) category = 'VERY_GOOD';
  else if (score >= 7) category = 'GOOD';
  else if (score >= 4) category = 'FAIR';
  else if (score >= 2) category = 'POOR';
  else category = 'VERY_POOR';
  
  return { score, issues, category };
}

// Analizar todas las preguntas
console.log('Analizando 923 preguntas con criterios estrictos...\n');

const analyzed = data.map(q => {
  const analysis = analyzePersonalization(q);
  return {
    question_id: q.question_id,
    domain: q.domain,
    score: analysis.score,
    category: analysis.category,
    issues: analysis.issues,
    services: q.explanation?.aws_services || [],
    why_correct_length: (q.explanation?.why_correct || '').length,
    memorize_type: Array.isArray(q.explanation?.memorize) ? 'array' : 'string',
    memorize_length: Array.isArray(q.explanation?.memorize) ? 
      q.explanation.memorize.length : 
      (q.explanation?.memorize || '').length
  };
});

// Categorizar
const excellent = analyzed.filter(q => q.category === 'EXCELLENT');
const veryGood = analyzed.filter(q => q.category === 'VERY_GOOD');
const good = analyzed.filter(q => q.category === 'GOOD');
const fair = analyzed.filter(q => q.category === 'FAIR');
const poor = analyzed.filter(q => q.category === 'POOR');
const veryPoor = analyzed.filter(q => q.category === 'VERY_POOR');

console.log('='.repeat(70));
console.log('📊 RESULTADOS ANÁLISIS ESTRICTO DE PERSONALIZACIÓN');
console.log('='.repeat(70));
console.log('');

console.log('🏆 EXCELLENT (14+ pts):   ', excellent.length.toString().padStart(3), '/', data.length, `(${(excellent.length/data.length*100).toFixed(1)}%)`);
console.log('⭐ VERY GOOD (10-13 pts): ', veryGood.length.toString().padStart(3), '/', data.length, `(${(veryGood.length/data.length*100).toFixed(1)}%)`);
console.log('✅ GOOD (7-9 pts):        ', good.length.toString().padStart(3), '/', data.length, `(${(good.length/data.length*100).toFixed(1)}%)`);
console.log('⚠️  FAIR (4-6 pts):        ', fair.length.toString().padStart(3), '/', data.length, `(${(fair.length/data.length*100).toFixed(1)}%)`);
console.log('❌ POOR (2-3 pts):        ', poor.length.toString().padStart(3), '/', data.length, `(${(poor.length/data.length*100).toFixed(1)}%)`);
console.log('🚫 VERY POOR (0-1 pts):   ', veryPoor.length.toString().padStart(3), '/', data.length, `(${(veryPoor.length/data.length*100).toFixed(1)}%)`);
console.log('');

const avgScore = analyzed.reduce((sum, q) => sum + q.score, 0) / analyzed.length;
console.log('📊 Score promedio:         ', avgScore.toFixed(2), '/ 17');
console.log('');

// Análisis de problemas comunes
console.log('='.repeat(70));
console.log('🔍 PROBLEMAS MÁS COMUNES:');
console.log('='.repeat(70));

const allIssues = {};
analyzed.forEach(q => {
  q.issues.forEach(issue => {
    allIssues[issue] = (allIssues[issue] || 0) + 1;
  });
});

Object.entries(allIssues)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([issue, count]) => {
    const pct = ((count / data.length) * 100).toFixed(1);
    console.log(`${count.toString().padStart(3)} preguntas (${pct.padStart(4)}%): ${issue}`);
  });

console.log('');

// Top 10 mejores
console.log('='.repeat(70));
console.log('🥇 TOP 10 MEJORES (Más Personalizadas):');
console.log('='.repeat(70));

analyzed.sort((a, b) => b.score - a.score);
analyzed.slice(0, 10).forEach((q, idx) => {
  console.log(`${(idx + 1).toString().padStart(2)}. Q${q.question_id.toString().padStart(3)} | Score: ${q.score.toString().padStart(2)}/17 | ${q.domain}`);
  console.log(`    Servicios: ${q.services.slice(0, 4).join(', ')}`);
  console.log(`    Why_correct: ${q.why_correct_length} chars | Memorize: ${q.memorize_type}[${q.memorize_length}]`);
  if (q.issues.length > 0) console.log(`    Issues: ${q.issues.join(', ')}`);
  console.log('');
});

// Bottom 20 peores
console.log('='.repeat(70));
console.log('⚠️  BOTTOM 20 - MÁS GENÉRICOS:');
console.log('='.repeat(70));

analyzed.slice(-20).reverse().forEach((q, idx) => {
  console.log(`${(idx + 1).toString().padStart(2)}. Q${q.question_id.toString().padStart(3)} | Score: ${q.score.toString().padStart(2)}/17 | ${q.domain}`);
  console.log(`    Servicios: ${q.services.join(', ')}`);
  console.log(`    ❌ Issues: ${q.issues.join(', ')}`);
  console.log('');
});

// Análisis por dominio
console.log('='.repeat(70));
console.log('📊 PERSONALIZACIÓN POR DOMINIO:');
console.log('='.repeat(70));

const domains = {};
analyzed.forEach(q => {
  if (!domains[q.domain]) {
    domains[q.domain] = { 
      total: 0, 
      sum: 0, 
      excellent: 0,
      generic_issues: 0
    };
  }
  domains[q.domain].total++;
  domains[q.domain].sum += q.score;
  if (q.category === 'EXCELLENT') domains[q.domain].excellent++;
  if (q.issues.some(i => i.includes('genérico'))) domains[q.domain].generic_issues++;
});

Object.entries(domains)
  .sort((a, b) => (b[1].sum / b[1].total) - (a[1].sum / a[1].total))
  .forEach(([domain, stats]) => {
    const avg = (stats.sum / stats.total).toFixed(1);
    const excellentPct = ((stats.excellent / stats.total) * 100).toFixed(0);
    const genericPct = ((stats.generic_issues / stats.total) * 100).toFixed(0);
    console.log(`${domain.substring(0, 35).padEnd(35)} | Avg: ${avg.padStart(4)}/17 | Excellent: ${excellentPct.padStart(2)}% | Genéricos: ${genericPct.padStart(2)}%`);
  });

// Guardar reporte
const report = {
  summary: {
    total: data.length,
    average_score: avgScore,
    max_score: 17,
    excellent: excellent.length,
    very_good: veryGood.length,
    good: good.length,
    fair: fair.length,
    poor: poor.length,
    very_poor: veryPoor.length
  },
  common_issues: allIssues,
  top_20: analyzed.slice(0, 20),
  bottom_20: analyzed.slice(-20),
  by_domain: domains,
  all_questions: analyzed
};

fs.writeFileSync('strict-personalization-report.json', JSON.stringify(report, null, 2));
console.log('\n✅ Reporte detallado guardado en: strict-personalization-report.json');
