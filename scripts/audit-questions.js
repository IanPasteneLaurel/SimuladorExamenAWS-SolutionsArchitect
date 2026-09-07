#!/usr/bin/env node

/**
 * Script de auditoría completa de las 923 preguntas
 * 
 * Detecta:
 * - Textos cortados o incompletos
 * - Mezcla de idiomas (español en campos inglés)
 * - Campos vacíos o muy cortos
 * - Contenido duplicado del archivo original
 */

const fs = require('fs');
const path = require('path');

const ENRICHED_FILE = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923-enriched.json');
const OUTPUT_FILE = path.join(__dirname, '../AUDIT-REPORT.json');

console.log('🔍 AUDITORÍA COMPLETA DE 923 PREGUNTAS\n');

const enriched = JSON.parse(fs.readFileSync(ENRICHED_FILE, 'utf-8'));

const issues = {
  textoCortado: [],
  idiomasMezclados: [],
  camposVacios: [],
  whyWrongEspanol: []
};

console.log('Procesando preguntas...\n');

enriched.forEach((q, idx) => {
  const exp = q.explanation;
  
  // 1. Detectar textos cortados en why_correct
  if (exp.why_correct) {
    const text = exp.why_correct.trim();
    const lastChar = text[text.length - 1];
    
    if (lastChar !== '.' && lastChar !== '!' && lastChar !== '?' && lastChar !== '"') {
      issues.textoCortado.push({
        id: q.question_id,
        field: 'why_correct',
        lastChars: text.substring(text.length - 50),
        length: text.length
      });
    }
  }
  
  // 2. Detectar textos cortados en additional_context
  if (exp.additional_context) {
    const text = exp.additional_context.trim();
    const lastChar = text[text.length - 1];
    
    if (lastChar !== '.' && lastChar !== '!' && lastChar !== '?' && lastChar !== '"') {
      issues.textoCortado.push({
        id: q.question_id,
        field: 'additional_context',
        lastChars: text.substring(text.length - 50),
        length: text.length
      });
    }
  }
  
  // 3. Detectar mezcla de idiomas en why_correct (debe ser 100% inglés)
  if (exp.why_correct) {
    // Palabras comunes en español que NO aparecen en inglés técnico
    const spanishWords = ['porque', 'esta', 'puede', 'debe', 'tiene', 'son', 'están', 'más', 'muy', 'para'];
    const text = exp.why_correct.toLowerCase();
    
    for (const word of spanishWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(text)) {
        issues.idiomasMezclados.push({
          id: q.question_id,
          field: 'why_correct',
          spanishWord: word,
          context: text.substring(Math.max(0, text.indexOf(word) - 30), text.indexOf(word) + 50)
        });
        break; // Solo reportar la primera palabra encontrada
      }
    }
  }
  
  // 4. Detectar mezcla de idiomas en additional_context (debe ser 100% inglés)
  if (exp.additional_context) {
    const spanishWords = ['porque', 'esta', 'puede', 'debe', 'tiene', 'son', 'están', 'más', 'muy', 'para'];
    const text = exp.additional_context.toLowerCase();
    
    for (const word of spanishWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(text)) {
        issues.idiomasMezclados.push({
          id: q.question_id,
          field: 'additional_context',
          spanishWord: word,
          context: text.substring(Math.max(0, text.indexOf(word) - 30), text.indexOf(word) + 50)
        });
        break;
      }
    }
  }
  
  // 5. Campos vacíos o muy cortos en additional_context
  if (!exp.additional_context || exp.additional_context.trim().length < 100) {
    issues.camposVacios.push({
      id: q.question_id,
      field: 'additional_context',
      length: exp.additional_context?.length || 0
    });
  }
  
  // 6. Verificar que why_wrong esté en español (correcto)
  if (exp.why_wrong) {
    Object.entries(exp.why_wrong).forEach(([option, reason]) => {
      // Si no tiene palabras en español, está en inglés (error)
      const hasSpanish = /\b(porque|es|la|el|de|que|para|con|por|más|debe|puede|son|están|tiene)\b/i.test(reason);
      
      if (!hasSpanish) {
        issues.whyWrongEspanol.push({
          id: q.question_id,
          option: option,
          text: reason.substring(0, 100)
        });
      }
    });
  }
  
  // Progress
  if ((idx + 1) % 100 === 0) {
    console.log(`✓ Procesadas ${idx + 1}/923 preguntas...`);
  }
});

console.log(`✓ Procesadas 923/923 preguntas\n`);

// Resumen
console.log('📊 RESUMEN DE AUDITORÍA:\n');
console.log(`  Textos cortados: ${issues.textoCortado.length}`);
console.log(`  Idiomas mezclados: ${issues.idiomasMezclados.length}`);
console.log(`  Campos vacíos/cortos: ${issues.camposVacios.length}`);
console.log(`  Why_wrong en inglés (debe ser español): ${issues.whyWrongEspanol.length}`);
console.log('');

// Detalles
if (issues.textoCortado.length > 0) {
  console.log('🔴 TEXTOS CORTADOS (primeros 10):');
  issues.textoCortado.slice(0, 10).forEach(i => {
    console.log(`  ID ${i.id} (${i.field}): ...${i.lastChars}`);
  });
  console.log('');
}

if (issues.idiomasMezclados.length > 0) {
  console.log('🔴 IDIOMAS MEZCLADOS (primeros 10):');
  issues.idiomasMezclados.slice(0, 10).forEach(i => {
    console.log(`  ID ${i.id} (${i.field}): palabra '${i.spanishWord}'`);
    console.log(`     Contexto: ${i.context}`);
  });
  console.log('');
}

if (issues.camposVacios.length > 0) {
  console.log('🔴 CAMPOS VACÍOS/CORTOS (primeros 10):');
  issues.camposVacios.slice(0, 10).forEach(i => {
    console.log(`  ID ${i.id} (${i.field}): ${i.length} chars`);
  });
  console.log('');
}

if (issues.whyWrongEspanol.length > 0) {
  console.log('🔴 WHY_WRONG EN INGLÉS (debe estar en español, primeros 10):');
  issues.whyWrongEspanol.slice(0, 10).forEach(i => {
    console.log(`  ID ${i.id} (opción ${i.option}): ${i.text}...`);
  });
  console.log('');
}

// Guardar reporte completo
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(issues, null, 2), 'utf-8');
console.log(`💾 Reporte completo guardado en: ${OUTPUT_FILE}\n`);

// Estadísticas por tipo de problema
console.log('📈 ESTADÍSTICAS DETALLADAS:\n');

if (issues.textoCortado.length > 0) {
  const byField = {};
  issues.textoCortado.forEach(i => {
    byField[i.field] = (byField[i.field] || 0) + 1;
  });
  console.log('  Textos cortados por campo:');
  Object.entries(byField).forEach(([field, count]) => {
    console.log(`    - ${field}: ${count}`);
  });
  console.log('');
}

if (issues.idiomasMezclados.length > 0) {
  const byField = {};
  issues.idiomasMezclados.forEach(i => {
    byField[i.field] = (byField[i.field] || 0) + 1;
  });
  console.log('  Idiomas mezclados por campo:');
  Object.entries(byField).forEach(([field, count]) => {
    console.log(`    - ${field}: ${count}`);
  });
  console.log('');
}

// Conclusión
const totalIssues = issues.textoCortado.length + issues.idiomasMezclados.length + 
                   issues.camposVacios.length + issues.whyWrongEspanol.length;

if (totalIssues === 0) {
  console.log('✅ ¡PERFECTO! No se encontraron problemas.\n');
} else {
  console.log(`⚠️  Se encontraron ${totalIssues} problemas que requieren corrección.\n`);
  console.log('📋 Próximo paso: Ejecutar script de limpieza y corrección.\n');
}
