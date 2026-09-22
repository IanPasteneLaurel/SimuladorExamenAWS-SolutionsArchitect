#!/usr/bin/env node

/**
 * Analiza la calidad de las explicaciones en el banco de preguntas
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'app', 'src', 'data', 'SAA-C03-QuestionBank-923.json');

console.log('='.repeat(80));
console.log('ANÁLISIS DE CALIDAD DE EXPLICACIONES');
console.log('='.repeat(80));
console.log();

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

let stats = {
  total: data.length,
  missingExplanation: 0,
  onlyFullText: 0,
  hasWhyCorrect: 0,
  hasWhyWrong: 0,
  hasExamTips: 0,
  hasMemorize: 0,
  hasAwsServices: 0,
  hasArchitecturalConcept: 0,
  fullStructured: 0
};

const issues = [];

data.forEach(q => {
  const qId = q.question_id;
  const exp = q.explanation;
  
  if (!exp) {
    stats.missingExplanation++;
    issues.push({ id: qId, issue: 'No explanation object' });
    return;
  }
  
  // Verificar estructura
  const hasFullText = !!exp.full_text;
  const hasWhyCorrect = !!exp.why_correct;
  const hasWhyWrong = !!exp.why_wrong;
  const hasExamTips = !!exp.exam_tips;
  const hasMemorize = !!exp.memorize;
  const hasAwsServices = !!exp.aws_services;
  const hasArchitecturalConcept = !!exp.architectural_concept;
  
  if (hasWhyCorrect) stats.hasWhyCorrect++;
  if (hasWhyWrong) stats.hasWhyWrong++;
  if (hasExamTips) stats.hasExamTips++;
  if (hasMemorize) stats.hasMemorize++;
  if (hasAwsServices) stats.hasAwsServices++;
  if (hasArchitecturalConcept) stats.hasArchitecturalConcept++;
  
  // Totalmente estructurada
  if (hasWhyCorrect && hasWhyWrong && hasExamTips && hasMemorize) {
    stats.fullStructured++;
  }
  
  // Solo tiene full_text (el problema)
  if (hasFullText && !hasWhyCorrect && !hasWhyWrong && !hasExamTips) {
    stats.onlyFullText++;
    issues.push({
      id: qId,
      domain: q.domain,
      issue: 'Only has full_text (missing structure)'
    });
  }
});

// Mostrar resultados
console.log('📊 ESTADÍSTICAS GENERALES:');
console.log('-'.repeat(80));
console.log(`Total de preguntas: ${stats.total}`);
console.log(`Sin explicación: ${stats.missingExplanation}`);
console.log(`Solo con full_text (SIN estructura): ${stats.onlyFullText}`);
console.log(`Con estructura completa: ${stats.fullStructured}`);
console.log();

console.log('📋 DESGLOSE DE CAMPOS:');
console.log('-'.repeat(80));
console.log(`Con why_correct: ${stats.hasWhyCorrect} (${((stats.hasWhyCorrect/stats.total)*100).toFixed(1)}%)`);
console.log(`Con why_wrong: ${stats.hasWhyWrong} (${((stats.hasWhyWrong/stats.total)*100).toFixed(1)}%)`);
console.log(`Con exam_tips: ${stats.hasExamTips} (${((stats.hasExamTips/stats.total)*100).toFixed(1)}%)`);
console.log(`Con memorize: ${stats.hasMemorize} (${((stats.hasMemorize/stats.total)*100).toFixed(1)}%)`);
console.log(`Con aws_services: ${stats.hasAwsServices} (${((stats.hasAwsServices/stats.total)*100).toFixed(1)}%)`);
console.log(`Con architectural_concept: ${stats.hasArchitecturalConcept} (${((stats.hasArchitecturalConcept/stats.total)*100).toFixed(1)}%)`);
console.log();

console.log('⚠️  PROBLEMAS ENCONTRADOS:');
console.log('-'.repeat(80));
console.log(`Preguntas solo con full_text: ${stats.onlyFullText}`);
console.log(`Preguntas sin why_correct: ${stats.total - stats.hasWhyCorrect}`);
console.log(`Preguntas sin exam_tips: ${stats.total - stats.hasExamTips}`);
console.log();

if (issues.length > 0) {
  console.log('🔍 PRIMERAS 30 PREGUNTAS CON PROBLEMAS:');
  console.log('-'.repeat(80));
  issues.slice(0, 30).forEach(item => {
    console.log(`Pregunta #${item.id}: ${item.issue}${item.domain ? ' - ' + item.domain : ''}`);
  });
  console.log();
  
  if (issues.length > 30) {
    console.log(`... y ${issues.length - 30} más`);
    console.log();
  }
}

// Guardar reporte
const report = `REPORTE DE CALIDAD DE EXPLICACIONES
${'='.repeat(80)}

Fecha: ${new Date().toISOString()}

ESTADÍSTICAS:
${'-'.repeat(80)}
Total de preguntas: ${stats.total}
Sin explicación: ${stats.missingExplanation}
Solo con full_text: ${stats.onlyFullText}
Con estructura completa: ${stats.fullStructured}

DESGLOSE:
${'-'.repeat(80)}
Con why_correct: ${stats.hasWhyCorrect} (${((stats.hasWhyCorrect/stats.total)*100).toFixed(1)}%)
Con why_wrong: ${stats.hasWhyWrong} (${((stats.hasWhyWrong/stats.total)*100).toFixed(1)}%)
Con exam_tips: ${stats.hasExamTips} (${((stats.hasExamTips/stats.total)*100).toFixed(1)}%)
Con memorize: ${stats.hasMemorize} (${((stats.hasMemorize/stats.total)*100).toFixed(1)}%)

PREGUNTAS CON PROBLEMAS:
${'='.repeat(80)}

${issues.map(i => `Pregunta #${i.id}: ${i.issue}${i.domain ? ' - ' + i.domain : ''}`).join('\n')}
`;

const reportFile = path.join(__dirname, 'explanation-quality-report.txt');
fs.writeFileSync(reportFile, report, 'utf8');

console.log('✅ Reporte guardado en: explanation-quality-report.txt');
console.log();

console.log('='.repeat(80));
console.log('💡 RECOMENDACIÓN:');
console.log('='.repeat(80));
console.log();
console.log(`Se encontraron ${stats.onlyFullText} preguntas que necesitan explicaciones estructuradas.`);
console.log('Estas explicaciones deben incluir:');
console.log('  - why_correct: Por qué la respuesta correcta es correcta');
console.log('  - why_wrong: Por qué cada opción incorrecta es incorrecta');
console.log('  - exam_tips: Tips específicos para el examen');
console.log('  - memorize: Puntos clave para memorizar');
console.log('  - aws_services: Servicios AWS relevantes');
console.log('  - architectural_concept: Concepto arquitectónico clave');
console.log();
