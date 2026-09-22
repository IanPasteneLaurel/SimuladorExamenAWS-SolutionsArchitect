#!/usr/bin/env node

/**
 * Script para corregir las preguntas de selección múltiple
 * 
 * Este script:
 * 1. Lee el archivo SAA-C03-QuestionBank-923.json
 * 2. Hace un backup automático
 * 3. Actualiza las 85 preguntas de selección múltiple
 * 4. Guarda el archivo corregido
 * 5. Genera un reporte de cambios
 */

const fs = require('fs');
const path = require('path');

// Configuración de preguntas múltiples
// Formato: question_id: [array de respuestas correctas]
const MULTIPLE_CHOICE_QUESTIONS = {
  // 2 respuestas (67 preguntas)
  16: ['B', 'C'],
  18: ['B', 'E'],
  26: ['B', 'D'],
  32: ['C', 'E'],
  42: ['A', 'B'],
  60: ['B', 'D'],
  64: ['A', 'E'],
  85: ['A', 'B'],
  91: ['D', 'E'],
  98: ['A', 'D'],
  99: ['A', 'D'],
  101: ['B', 'E'],
  103: ['B', 'C'],
  107: ['A', 'D'],
  114: ['A', 'E'],
  126: ['A', 'D'],
  137: ['A', 'C'],
  139: ['B', 'D'],
  153: ['B', 'E'],
  176: ['A', 'B'],
  188: ['C', 'E'],
  198: ['A', 'D'],
  207: ['D', 'E'],
  208: ['B', 'E'],
  215: ['C', 'D'],
  229: ['A', 'D'],
  273: ['A', 'D'],
  275: ['B', 'D'],
  278: ['A', 'B'],
  293: ['A', 'D'],
  334: ['C', 'D'],
  343: ['B', 'C'],
  385: ['B', 'C'],
  401: ['B', 'D'],
  419: ['B', 'D'],
  441: ['A', 'E'],
  447: ['A', 'C'],
  451: ['A', 'C'],
  463: ['B', 'E'],
  484: ['B', 'E'],
  501: ['B', 'D'],
  505: ['C', 'D'],
  557: ['B', 'C'],
  617: ['B', 'C'],
  621: ['C', 'E'],
  640: ['A', 'E'],
  645: ['B', 'E'],
  664: ['B', 'E'],
  688: ['A', 'D'],
  689: ['A', 'C'],
  699: ['B', 'E'],
  722: ['A', 'B'],
  736: ['A', 'E'],
  751: ['B', 'C'],
  754: ['B', 'D'],
  757: ['B', 'E'],
  770: ['C', 'D'],
  772: ['A', 'D'],
  796: ['C', 'E'],
  805: ['B', 'E'],
  821: ['B', 'E'],
  830: ['A', 'C'],
  840: ['D', 'E'],
  884: ['B', 'E'],
  893: ['A', 'C'],
  905: ['B', 'E'],
  922: ['B', 'C'],

  // 3 respuestas (18 preguntas)
  12: ['A', 'C', 'F'],
  132: ['A', 'C', 'E'],
  274: ['A', 'C', 'E'],
  296: ['A', 'D', 'E'],
  297: ['A', 'B', 'C'],
  352: ['B', 'C', 'D'],
  368: ['A', 'B', 'C'],
  412: ['A', 'B', 'F'],
  445: ['A', 'D', 'F'],
  517: ['A', 'C', 'E'],
  525: ['A', 'B', 'C'],
  676: ['A', 'C', 'D'],
  678: ['A', 'B', 'D'],
  760: ['B', 'D', 'F'],
  766: ['A', 'D', 'F'],
  767: ['A', 'B', 'D'],
  778: ['B', 'C', 'E'],
  885: ['A', 'C', 'E']
};

// Rutas de archivos
const DATA_DIR = path.join(__dirname, '..', 'app', 'src', 'data');
const INPUT_FILE = path.join(DATA_DIR, 'SAA-C03-QuestionBank-923.json');
const BACKUP_FILE = path.join(DATA_DIR, 'SAA-C03-QuestionBank-923.backup.json');
const REPORT_FILE = path.join(__dirname, 'correction-report.txt');

console.log('='.repeat(80));
console.log('SCRIPT DE CORRECCIÓN DE PREGUNTAS MÚLTIPLES');
console.log('='.repeat(80));
console.log();

// Verificar que el archivo existe
if (!fs.existsSync(INPUT_FILE)) {
  console.error(`❌ Error: No se encontró el archivo ${INPUT_FILE}`);
  process.exit(1);
}

console.log(`📂 Archivo de entrada: ${INPUT_FILE}`);
console.log(`💾 Archivo de backup: ${BACKUP_FILE}`);
console.log();

// Leer el archivo
console.log('📖 Leyendo archivo de preguntas...');
const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
console.log(`✅ Leídas ${data.length} preguntas`);
console.log();

// Hacer backup
console.log('💾 Creando backup del archivo original...');
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ Backup creado: ${BACKUP_FILE}`);
console.log();

// Estadísticas
let updatedCount = 0;
let notFoundCount = 0;
const changes = [];

console.log('🔧 Aplicando correcciones...');
console.log();

// Procesar cada pregunta
data.forEach((question) => {
  const questionId = question.question_id;
  
  if (MULTIPLE_CHOICE_QUESTIONS[questionId]) {
    const correctAnswers = MULTIPLE_CHOICE_QUESTIONS[questionId];
    const requiredSelections = correctAnswers.length;
    
    // Guardar estado anterior para el reporte
    const before = {
      multi_select: question.multi_select,
      correct_answer: question.correct_answer
    };
    
    // Aplicar correcciones
    question.multi_select = true;
    question.required_selections = requiredSelections;
    question.correct_answer = correctAnswers;
    
    updatedCount++;
    changes.push({
      question_id: questionId,
      before,
      after: {
        multi_select: true,
        required_selections: requiredSelections,
        correct_answer: correctAnswers
      }
    });
    
    console.log(`  ✅ Pregunta #${questionId}: ${requiredSelections} respuestas [${correctAnswers.join(', ')}]`);
  }
});

console.log();
console.log('='.repeat(80));
console.log('RESUMEN DE CAMBIOS');
console.log('='.repeat(80));
console.log(`✅ Preguntas actualizadas: ${updatedCount}`);
console.log(`📊 Total de preguntas: ${data.length}`);
console.log(`📈 Preguntas múltiples esperadas: ${Object.keys(MULTIPLE_CHOICE_QUESTIONS).length}`);

if (updatedCount !== Object.keys(MULTIPLE_CHOICE_QUESTIONS).length) {
  console.log(`⚠️  ADVERTENCIA: Se esperaban ${Object.keys(MULTIPLE_CHOICE_QUESTIONS).length} preguntas pero solo se actualizaron ${updatedCount}`);
}

// Guardar archivo corregido
console.log();
console.log('💾 Guardando archivo corregido...');
fs.writeFileSync(INPUT_FILE, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ Archivo guardado: ${INPUT_FILE}`);

// Generar reporte
console.log();
console.log('📝 Generando reporte de cambios...');

let report = 'REPORTE DE CORRECCIÓN DE PREGUNTAS MÚLTIPLES\n';
report += '='.repeat(80) + '\n\n';
report += `Fecha: ${new Date().toISOString()}\n`;
report += `Archivo procesado: ${INPUT_FILE}\n`;
report += `Backup creado: ${BACKUP_FILE}\n\n`;
report += `ESTADÍSTICAS:\n`;
report += `-`.repeat(80) + '\n';
report += `Total de preguntas en el banco: ${data.length}\n`;
report += `Preguntas actualizadas: ${updatedCount}\n`;
report += `Preguntas con 2 respuestas: ${changes.filter(c => c.after.required_selections === 2).length}\n`;
report += `Preguntas con 3 respuestas: ${changes.filter(c => c.after.required_selections === 3).length}\n\n`;

report += `CAMBIOS DETALLADOS:\n`;
report += `=`.repeat(80) + '\n\n';

changes.forEach(change => {
  report += `Pregunta #${change.question_id}:\n`;
  report += `  ANTES:\n`;
  report += `    multi_select: ${change.before.multi_select}\n`;
  report += `    correct_answer: ${JSON.stringify(change.before.correct_answer)}\n`;
  report += `  DESPUÉS:\n`;
  report += `    multi_select: ${change.after.multi_select}\n`;
  report += `    required_selections: ${change.after.required_selections}\n`;
  report += `    correct_answer: ${JSON.stringify(change.after.correct_answer)}\n`;
  report += '\n';
});

fs.writeFileSync(REPORT_FILE, report, 'utf8');
console.log(`✅ Reporte guardado: ${REPORT_FILE}`);

console.log();
console.log('='.repeat(80));
console.log('✅ CORRECCIÓN COMPLETADA EXITOSAMENTE');
console.log('='.repeat(80));
console.log();
console.log('Próximos pasos:');
console.log('1. Revisar el reporte: correction-report.txt');
console.log('2. Ejecutar el script de validación: node validate-question-data.js');
console.log('3. Probar el simulador manualmente');
console.log();
