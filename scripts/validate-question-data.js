#!/usr/bin/env node

/**
 * Script de validación de datos de preguntas
 * 
 * Valida que:
 * - Las preguntas múltiples tengan multi_select: true
 * - Las preguntas múltiples tengan correct_answer como array
 * - Las preguntas simples tengan multi_select: false
 * - Las preguntas simples tengan correct_answer como string
 * - El campo required_selections esté presente en preguntas múltiples
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'app', 'src', 'data', 'SAA-C03-QuestionBank-923.json');

console.log('='.repeat(80));
console.log('VALIDACIÓN DE DATOS DE PREGUNTAS');
console.log('='.repeat(80));
console.log();

if (!fs.existsSync(DATA_FILE)) {
  console.error(`❌ Error: No se encontró el archivo ${DATA_FILE}`);
  process.exit(1);
}

console.log(`📂 Archivo: ${DATA_FILE}`);
console.log();

// Leer datos
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
console.log(`📊 Total de preguntas: ${data.length}`);
console.log();

// Contadores
let singleChoiceCount = 0;
let multipleChoiceCount = 0;
let twoAnswersCount = 0;
let threeAnswersCount = 0;
const errors = [];
const warnings = [];

// Validar cada pregunta
data.forEach((question, index) => {
  const qId = question.question_id;
  
  if (question.multi_select) {
    multipleChoiceCount++;
    
    // Validar que correct_answer sea un array
    if (!Array.isArray(question.correct_answer)) {
      errors.push(`Pregunta #${qId}: multi_select es true pero correct_answer no es un array`);
    } else {
      const numAnswers = question.correct_answer.length;
      
      if (numAnswers === 2) {
        twoAnswersCount++;
      } else if (numAnswers === 3) {
        threeAnswersCount++;
      } else {
        warnings.push(`Pregunta #${qId}: tiene ${numAnswers} respuestas (esperado 2 o 3)`);
      }
    }
    
    // Validar que tenga required_selections
    if (!question.required_selections) {
      errors.push(`Pregunta #${qId}: falta el campo required_selections`);
    } else if (question.required_selections !== question.correct_answer.length) {
      errors.push(`Pregunta #${qId}: required_selections (${question.required_selections}) no coincide con número de respuestas (${question.correct_answer.length})`);
    }
    
  } else {
    singleChoiceCount++;
    
    // Validar que correct_answer sea un string
    if (Array.isArray(question.correct_answer)) {
      errors.push(`Pregunta #${qId}: multi_select es false pero correct_answer es un array`);
    } else if (typeof question.correct_answer !== 'string') {
      errors.push(`Pregunta #${qId}: correct_answer no es un string válido`);
    }
    
    // Validar que NO tenga required_selections
    if (question.required_selections) {
      warnings.push(`Pregunta #${qId}: tiene required_selections pero es de selección simple`);
    }
  }
  
  // Validar que tenga options
  if (!question.options || typeof question.options !== 'object') {
    errors.push(`Pregunta #${qId}: falta el campo options o no es válido`);
  }
  
  // Validar que tenga question_en
  if (!question.question_en || typeof question.question_en !== 'string') {
    errors.push(`Pregunta #${qId}: falta el campo question_en o no es válido`);
  }
});

// Mostrar resultados
console.log('='.repeat(80));
console.log('RESULTADOS DE VALIDACIÓN');
console.log('='.repeat(80));
console.log();

console.log('📊 ESTADÍSTICAS:');
console.log('-'.repeat(80));
console.log(`  Preguntas de selección simple: ${singleChoiceCount}`);
console.log(`  Preguntas de selección múltiple: ${multipleChoiceCount}`);
console.log(`    - Con 2 respuestas: ${twoAnswersCount}`);
console.log(`    - Con 3 respuestas: ${threeAnswersCount}`);
console.log(`  Total: ${data.length}`);
console.log();

// Validar totales esperados
const EXPECTED_SINGLE = 838;
const EXPECTED_MULTIPLE = 85;
const EXPECTED_TWO = 67;
const EXPECTED_THREE = 18;

let allValid = true;

console.log('✅ VALIDACIÓN DE TOTALES:');
console.log('-'.repeat(80));

if (singleChoiceCount === EXPECTED_SINGLE) {
  console.log(`  ✅ Selección simple: ${singleChoiceCount} (esperado: ${EXPECTED_SINGLE})`);
} else {
  console.log(`  ❌ Selección simple: ${singleChoiceCount} (esperado: ${EXPECTED_SINGLE})`);
  allValid = false;
}

if (multipleChoiceCount === EXPECTED_MULTIPLE) {
  console.log(`  ✅ Selección múltiple: ${multipleChoiceCount} (esperado: ${EXPECTED_MULTIPLE})`);
} else {
  console.log(`  ❌ Selección múltiple: ${multipleChoiceCount} (esperado: ${EXPECTED_MULTIPLE})`);
  allValid = false;
}

if (twoAnswersCount === EXPECTED_TWO) {
  console.log(`  ✅ Con 2 respuestas: ${twoAnswersCount} (esperado: ${EXPECTED_TWO})`);
} else {
  console.log(`  ❌ Con 2 respuestas: ${twoAnswersCount} (esperado: ${EXPECTED_TWO})`);
  allValid = false;
}

if (threeAnswersCount === EXPECTED_THREE) {
  console.log(`  ✅ Con 3 respuestas: ${threeAnswersCount} (esperado: ${EXPECTED_THREE})`);
} else {
  console.log(`  ❌ Con 3 respuestas: ${threeAnswersCount} (esperado: ${EXPECTED_THREE})`);
  allValid = false;
}

console.log();

// Mostrar errores
if (errors.length > 0) {
  console.log('❌ ERRORES ENCONTRADOS:');
  console.log('-'.repeat(80));
  errors.forEach(err => console.log(`  ${err}`));
  console.log();
  allValid = false;
}

// Mostrar advertencias
if (warnings.length > 0) {
  console.log('⚠️  ADVERTENCIAS:');
  console.log('-'.repeat(80));
  warnings.forEach(warn => console.log(`  ${warn}`));
  console.log();
}

// Resultado final
console.log('='.repeat(80));
if (allValid && errors.length === 0) {
  console.log('✅ VALIDACIÓN EXITOSA - TODOS LOS DATOS SON CORRECTOS');
} else {
  console.log('❌ VALIDACIÓN FALLIDA - SE ENCONTRARON PROBLEMAS');
  process.exit(1);
}
console.log('='.repeat(80));
console.log();
