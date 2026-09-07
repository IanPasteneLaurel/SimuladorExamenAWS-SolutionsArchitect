#!/usr/bin/env node

/**
 * Script para enriquecer keywords con frases clave del enunciado de la pregunta
 * 
 * Extrae frases importantes como:
 * - "MOST cost-effectively"
 * - "with the LEAST operational overhead"
 * - "in the SHORTEST time"
 * - "with minimal downtime"
 * - etc.
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923-enriched.json');
const OUTPUT_FILE = INPUT_FILE;

console.log('🔍 ENRIQUECIENDO KEYWORDS CON FRASES CLAVE\n');

const questions = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

// Patrones de frases clave comunes en el examen SAA-C03
const keyPhrases = [
  // Cost patterns
  { pattern: /\bMOST cost[- ]effective(ly)?\b/gi, keyword: 'most cost-effectively' },
  { pattern: /\bLEAST (expensive|costly)\b/gi, keyword: 'least expensive' },
  { pattern: /\b(minimize|minimizing|reduce|reducing) cost(s)?\b/gi, keyword: 'minimize costs' },
  { pattern: /\boptimize cost(s)?\b/gi, keyword: 'optimize costs' },
  { pattern: /\blowest cost\b/gi, keyword: 'lowest cost' },
  
  // Operational overhead patterns
  { pattern: /\bLEAST (operational|management|administrative) (overhead|effort)\b/gi, keyword: 'least operational overhead' },
  { pattern: /\bMOST operational(ly)? efficient(ly)?\b/gi, keyword: 'most operationally efficient' },
  { pattern: /\bMOST efficient(ly)?\b/gi, keyword: 'most efficient' },
  { pattern: /\bminimal (management|operational|administrative) (overhead|effort)\b/gi, keyword: 'minimal overhead' },
  { pattern: /\breduce operational complexity\b/gi, keyword: 'reduce operational complexity' },
  { pattern: /\b(with|using) (the )?LEAST (amount of )?effort\b/gi, keyword: 'least effort' },
  { pattern: /\bFEWEST (number of )?changes\b/gi, keyword: 'fewest changes' },
  { pattern: /\bSIMPLEST (solution|approach)\b/gi, keyword: 'simplest solution' },
  { pattern: /\bLEAST (amount of )?complexity\b/gi, keyword: 'least complexity' },
  
  // Time patterns
  { pattern: /\b(in the )?SHORTEST( amount of)? time\b/gi, keyword: 'shortest time' },
  { pattern: /\bLEAST amount of time\b/gi, keyword: 'least time' },
  { pattern: /\bimmediate(ly)? (access|available)\b/gi, keyword: 'immediately available' },
  { pattern: /\bminimal downtime\b/gi, keyword: 'minimal downtime' },
  { pattern: /\bzero downtime\b/gi, keyword: 'zero downtime' },
  { pattern: /\bWITHOUT (any )?downtime\b/gi, keyword: 'without downtime' },
  { pattern: /\bWITHOUT (disrupting|affecting|changing)\b/gi, keyword: 'without disruption' },
  
  // Performance patterns
  { pattern: /\bMOST performant\b/gi, keyword: 'most performant' },
  { pattern: /\bBEST performance\b/gi, keyword: 'best performance' },
  { pattern: /\bLOWEST latency\b/gi, keyword: 'lowest latency' },
  { pattern: /\bHIGHEST throughput\b/gi, keyword: 'highest throughput' },
  { pattern: /\bimprove performance\b/gi, keyword: 'improve performance' },
  
  // Availability patterns
  { pattern: /\bHIGHLY available\b/gi, keyword: 'highly available' },
  { pattern: /\bmaximum availability\b/gi, keyword: 'maximum availability' },
  { pattern: /\bhigh availability\b/gi, keyword: 'high availability' },
  { pattern: /\bHIGHEST (level of )?availability\b/gi, keyword: 'highest availability' },
  { pattern: /\bfault[- ]toleran(t|ce)\b/gi, keyword: 'fault tolerant' },
  
  // Security patterns
  { pattern: /\bMOST secure(ly)?\b/gi, keyword: 'most secure' },
  { pattern: /\benhance security\b/gi, keyword: 'enhance security' },
  { pattern: /\bimprove security posture\b/gi, keyword: 'improve security' },
  { pattern: /\bleast privilege\b/gi, keyword: 'least privilege' },
  { pattern: /\bBEST practice(s)?\b/gi, keyword: 'best practices' },
  
  // Scalability patterns
  { pattern: /\bMOST scalable\b/gi, keyword: 'most scalable' },
  { pattern: /\bauto[- ]scal(e|ing)\b/gi, keyword: 'auto-scaling' },
  { pattern: /\belastic(ally)?\b/gi, keyword: 'elastically scale' },
  { pattern: /\bGREATEST flexibility\b/gi, keyword: 'greatest flexibility' },
  
  // Reliability patterns
  { pattern: /\bMOST reliable\b/gi, keyword: 'most reliable' },
  { pattern: /\bMOST resilient\b/gi, keyword: 'most resilient' },
  { pattern: /\bMOST (fault[- ]tolerant|durable)\b/gi, keyword: 'most fault-tolerant' },
  { pattern: /\bMAXIMUM (data )?durability\b/gi, keyword: 'maximum durability' },
  { pattern: /\bdisaster recovery\b/gi, keyword: 'disaster recovery' },
  
  // Compliance patterns
  { pattern: /\bmeets? compliance\b/gi, keyword: 'compliance requirements' },
  { pattern: /\bregulatory requirements?\b/gi, keyword: 'regulatory requirements' },
  { pattern: /\bdata residency\b/gi, keyword: 'data residency' },
  
  // Appropriateness patterns
  { pattern: /\bMOST appropriate\b/gi, keyword: 'most appropriate' },
  { pattern: /\bMOST suitable\b/gi, keyword: 'most suitable' },
  
  // Other important patterns
  { pattern: /\bwithout disruption\b/gi, keyword: 'without disruption' },
  { pattern: /\bwith minimal effort\b/gi, keyword: 'minimal effort' },
  { pattern: /\bautomatically\b/gi, keyword: 'automatically' },
  { pattern: /\breal[- ]time\b/gi, keyword: 'real-time' },
  { pattern: /\bnear[- ]real[- ]time\b/gi, keyword: 'near-real-time' }
];

let enrichedCount = 0;
let totalKeywordsAdded = 0;

questions.forEach((q, idx) => {
  const questionText = q.question_en;
  const currentKeywords = q.explanation.keywords || [];
  const newKeywords = new Set(currentKeywords.map(k => k.toLowerCase()));
  let addedThisQuestion = 0;
  
  // Buscar todas las frases clave en el texto de la pregunta
  keyPhrases.forEach(({ pattern, keyword }) => {
    if (pattern.test(questionText)) {
      const lowerKeyword = keyword.toLowerCase();
      if (!newKeywords.has(lowerKeyword)) {
        newKeywords.add(lowerKeyword);
        addedThisQuestion++;
        totalKeywordsAdded++;
      }
    }
  });
  
  // Actualizar keywords (mantener minúsculas para consistencia)
  if (addedThisQuestion > 0) {
    q.explanation.keywords = Array.from(newKeywords);
    enrichedCount++;
  }
  
  if ((idx + 1) % 100 === 0) {
    console.log(`✓ Procesadas ${idx + 1}/923 preguntas...`);
  }
});

console.log(`✓ Procesadas 923/923 preguntas\n`);

// Guardar
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(questions, null, 2), 'utf-8');

console.log('✅ ENRIQUECIMIENTO COMPLETADO!\n');
console.log(`📊 Resumen:`);
console.log(`   - Preguntas enriquecidas: ${enrichedCount}`);
console.log(`   - Keywords añadidos: ${totalKeywordsAdded}`);
console.log(`   - Promedio por pregunta: ${(totalKeywordsAdded / enrichedCount).toFixed(2)}`);
console.log(`\n💾 Archivo actualizado: ${OUTPUT_FILE}\n`);

// Mostrar ejemplos
console.log('📋 EJEMPLOS DE FRASES CLAVE AÑADIDAS:\n');
const examples = questions.filter(q => {
  const k = q.explanation.keywords || [];
  return k.some(kw => kw.includes('most') || kw.includes('least') || kw.includes('shortest'));
}).slice(0, 10);

examples.forEach(q => {
  const relevantKeywords = q.explanation.keywords.filter(k => 
    k.includes('most') || k.includes('least') || k.includes('shortest') || 
    k.includes('minimal') || k.includes('without')
  );
  if (relevantKeywords.length > 0) {
    console.log(`  ID ${q.question_id}: ${relevantKeywords.join(', ')}`);
  }
});
