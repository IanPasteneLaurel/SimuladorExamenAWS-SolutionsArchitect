#!/usr/bin/env node

/**
 * Analiza qué frases clave del examen están presentes en las preguntas
 * pero faltantes en los keywords
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923-enriched.json');

console.log('🔍 ANALIZANDO FRASES CLAVE FALTANTES...\n');

const questions = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

// Patrones adicionales a verificar
const patterns = [
  { pattern: /\bMOST cost[- ]effective(ly)?\b/gi, keyword: 'most cost-effectively' },
  { pattern: /\bLEAST (operational|administrative) (overhead|effort)\b/gi, keyword: 'least operational overhead' },
  { pattern: /\b(with|using) (the )?LEAST (amount of )?effort\b/gi, keyword: 'least effort' },
  { pattern: /\bSHORTEST (amount of )?time\b/gi, keyword: 'shortest time' },
  { pattern: /\bMINIMAL (operational |administrative )?(overhead|effort|changes?|disruption)\b/gi, keyword: 'minimal overhead' },
  { pattern: /\bWITHOUT (disrupting|affecting|changing|downtime)\b/gi, keyword: 'without disruption' },
  { pattern: /\bMOST (operationally )?efficient(ly)?\b/gi, keyword: 'most efficient' },
  { pattern: /\bMOST secure(ly)?\b/gi, keyword: 'most secure' },
  { pattern: /\bHIGHEST (level of )?availability\b/gi, keyword: 'highest availability' },
  { pattern: /\bLOWEST latency\b/gi, keyword: 'lowest latency' },
  { pattern: /\bBEST performance\b/gi, keyword: 'best performance' },
  { pattern: /\bGREATEST flexibility\b/gi, keyword: 'greatest flexibility' },
  { pattern: /\bMOST (fault[- ]tolerant|resilient)\b/gi, keyword: 'most resilient' },
  { pattern: /\bMOST scalable\b/gi, keyword: 'most scalable' },
  { pattern: /\bFEWEST (number of )?changes\b/gi, keyword: 'fewest changes' },
  { pattern: /\bSIMPLEST (solution|approach)\b/gi, keyword: 'simplest solution' },
  { pattern: /\bLEAST (amount of )?complexity\b/gi, keyword: 'least complexity' },
  { pattern: /\bIMMEDIATE(LY)? (access|available)\b/gi, keyword: 'immediately available' },
  { pattern: /\bZERO downtime\b/gi, keyword: 'zero downtime' },
  { pattern: /\bMAXIMUM (data )?durability\b/gi, keyword: 'maximum durability' },
  { pattern: /\bMOST appropriate\b/gi, keyword: 'most appropriate' },
  { pattern: /\bBEST practice(s)?\b/gi, keyword: 'best practices' },
  { pattern: /\bLEAST privilege\b/gi, keyword: 'least privilege' },
  { pattern: /\bMOST durable\b/gi, keyword: 'most durable' },
  { pattern: /\bLEAST expensive\b/gi, keyword: 'least expensive' },
  { pattern: /\bLOWEST cost\b/gi, keyword: 'lowest cost' }
];

const stats = new Map();

questions.forEach(q => {
  const text = q.question_en;
  const keywords = (q.explanation.keywords || []).map(k => k.toLowerCase());
  
  patterns.forEach(({ pattern, keyword }) => {
    if (pattern.test(text)) {
      if (!stats.has(keyword)) {
        stats.set(keyword, { total: 0, withKeyword: 0, withoutKeyword: 0, examples: [] });
      }
      
      const data = stats.get(keyword);
      data.total++;
      
      const hasIt = keywords.some(k => k.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(k));
      
      if (hasIt) {
        data.withKeyword++;
      } else {
        data.withoutKeyword++;
        if (data.examples.length < 5) {
          data.examples.push(q.question_id);
        }
      }
    }
  });
});

// Ordenar por más frecuentes
const sorted = Array.from(stats.entries())
  .sort((a, b) => b[1].total - a[1].total);

console.log('📊 COBERTURA DE FRASES CLAVE:\n');

let totalMissing = 0;

sorted.forEach(([keyword, data]) => {
  const coverage = ((data.withKeyword / data.total) * 100).toFixed(1);
  const status = data.withoutKeyword === 0 ? '✅' : '⚠️';
  
  console.log(`${status} "${keyword}"`);
  console.log(`   Aparece en: ${data.total} preguntas`);
  console.log(`   Con keyword: ${data.withKeyword} (${coverage}%)`);
  console.log(`   Sin keyword: ${data.withoutKeyword}`);
  
  if (data.withoutKeyword > 0) {
    console.log(`   Ejemplos sin keyword: Q${data.examples.join(', Q')}`);
    totalMissing += data.withoutKeyword;
  }
  console.log('');
});

console.log(`\n📈 RESUMEN:`);
console.log(`   Frases clave detectadas: ${stats.size}`);
console.log(`   Total de ocurrencias faltantes: ${totalMissing}`);
console.log(`   Preguntas analizadas: 923\n`);

if (totalMissing > 0) {
  console.log(`⚠️  Se encontraron ${totalMissing} keywords faltantes`);
  console.log(`📝 Ejecuta el script de enriquecimiento para agregarlos\n`);
} else {
  console.log(`✅ ¡Perfecto! Todas las frases clave están presentes\n`);
}
