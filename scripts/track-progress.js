#!/usr/bin/env node

/**
 * Dashboard de progreso del enriquecimiento
 * Muestra estado visual en tiempo real
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'app', 'src', 'data', 'SAA-C03-QuestionBank-923.json');
const PROGRESS_FILE = path.join(__dirname, 'enrichment-progress.json');

// Colores ANSI
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

function drawProgressBar(current, total, width = 50) {
  const percentage = (current / total) * 100;
  const filled = Math.floor((current / total) * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${current}/${total} (${percentage.toFixed(1)}%)`;
}

function formatCost(questions) {
  const costPerQuestion = 0.015;
  return (questions * costPerQuestion).toFixed(2);
}

function formatTime(questions) {
  const secondsPerQuestion = 60; // ~1 min per question with API delay
  const totalMinutes = Math.ceil((questions * secondsPerQuestion) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

console.clear();
console.log(colors.cyan + colors.bold);
console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║            DASHBOARD DE ENRIQUECIMIENTO CON IA - SAA-C03                  ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');
console.log(colors.reset);
console.log();

// Leer datos
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const TOTAL = data.length;

// Analizar estado
let enriched = 0;
let partiallyEnriched = 0;
let notEnriched = 0;

data.forEach(q => {
  const exp = q.explanation || {};
  const hasWhyCorrect = !!exp.why_correct;
  const hasWhyWrong = !!exp.why_wrong && Object.keys(exp.why_wrong).length > 0;
  const hasExamTips = !!exp.exam_tips;
  const hasMemorize = !!exp.memorize && exp.memorize.length > 0;
  
  if (hasWhyCorrect && hasWhyWrong && hasExamTips && hasMemorize) {
    enriched++;
  } else if (hasWhyCorrect || hasWhyWrong || hasExamTips) {
    partiallyEnriched++;
  } else {
    notEnriched++;
  }
});

const pending = TOTAL - enriched;
const percentage = ((enriched / TOTAL) * 100).toFixed(1);

// Leer progreso si existe
let lastSession = 'N/A';
if (fs.existsSync(PROGRESS_FILE)) {
  const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  lastSession = `Pregunta #${progress.lastProcessed + 1}`;
}

// Estado general
console.log(colors.bold + '📊 ESTADO GENERAL' + colors.reset);
console.log('─'.repeat(80));
console.log();

console.log(colors.green + '✅ Completamente enriquecidas: ' + colors.bold + enriched + colors.reset + colors.green + ` (${percentage}%)` + colors.reset);
console.log(colors.yellow + '⚠️  Parcialmente enriquecidas:  ' + colors.reset + partiallyEnriched);
console.log(colors.red + '❌ Sin enriquecer:             ' + colors.reset + notEnriched);
console.log(colors.cyan + '📝 Total de preguntas:         ' + colors.reset + TOTAL);
console.log();

// Barra de progreso
console.log(colors.bold + '📈 PROGRESO' + colors.reset);
console.log('─'.repeat(80));
console.log();
console.log(colors.green + drawProgressBar(enriched, TOTAL, 60) + colors.reset);
console.log();

// Estimaciones
const remainingQuestions = pending;
const estimatedCost = formatCost(remainingQuestions);
const estimatedTime = formatTime(remainingQuestions);

console.log(colors.bold + '💰 COSTOS Y TIEMPO' + colors.reset);
console.log('─'.repeat(80));
console.log();
console.log(`Preguntas completadas:       ${enriched}`);
console.log(`Preguntas pendientes:        ${colors.yellow}${remainingQuestions}${colors.reset}`);
console.log(`Costo gastado hasta ahora:   ${colors.green}$${formatCost(enriched)}${colors.reset}`);
console.log(`Costo estimado restante:     ${colors.yellow}$${estimatedCost}${colors.reset}`);
console.log(`Costo total estimado:        ${colors.cyan}$${formatCost(TOTAL)}${colors.reset}`);
console.log(`Tiempo estimado restante:    ${colors.yellow}${estimatedTime}${colors.reset}`);
console.log();

// Por dominio
console.log(colors.bold + '🎯 PROGRESO POR DOMINIO' + colors.reset);
console.log('─'.repeat(80));
console.log();

const byDomain = {};
data.forEach(q => {
  const domain = q.domain;
  if (!byDomain[domain]) {
    byDomain[domain] = { total: 0, enriched: 0 };
  }
  byDomain[domain].total++;
  
  const exp = q.explanation || {};
  if (exp.why_correct && exp.exam_tips) {
    byDomain[domain].enriched++;
  }
});

Object.entries(byDomain)
  .sort((a, b) => b[1].total - a[1].total)
  .forEach(([domain, stats]) => {
    const domainPercentage = ((stats.enriched / stats.total) * 100).toFixed(1);
    const domainBar = drawProgressBar(stats.enriched, stats.total, 30);
    
    console.log(`${domain}`);
    console.log(`  ${domainBar}`);
    console.log();
  });

// Última sesión
console.log(colors.bold + '📅 INFORMACIÓN DE SESIÓN' + colors.reset);
console.log('─'.repeat(80));
console.log();
console.log(`Última pregunta procesada:   ${lastSession}`);
console.log(`Fecha de este reporte:       ${new Date().toLocaleString('es-ES')}`);
console.log();

// Próximos pasos
console.log(colors.bold + '🚀 PRÓXIMOS PASOS' + colors.reset);
console.log('─'.repeat(80));
console.log();

if (enriched === 0) {
  console.log(colors.yellow + '1. Configurar ANTHROPIC_API_KEY' + colors.reset);
  console.log('2. Ejecutar: node enrich-batch.js 1 0 (test)');
  console.log('3. Validar resultado');
  console.log('4. Ejecutar: node enrich-batch.js 50 0 (piloto)');
} else if (enriched < 50) {
  console.log(colors.yellow + '1. Completar Fase 1 (piloto 50 preguntas)' + colors.reset);
  console.log(`2. Ejecutar: node enrich-batch.js ${50 - enriched} ${enriched}`);
  console.log('3. Validar calidad antes de continuar');
} else if (enriched < TOTAL) {
  const nextBatch = Math.min(100, TOTAL - enriched);
  console.log(colors.green + `1. Continuar con siguiente lote (${nextBatch} preguntas)` + colors.reset);
  console.log(`2. Ejecutar: node enrich-batch.js ${nextBatch} ${enriched}`);
  console.log('3. Revisar progreso después');
  console.log(`4. ${Math.ceil((TOTAL - enriched) / 100)} días restantes (aprox.)`);
} else {
  console.log(colors.green + colors.bold + '🎉 ¡ENRIQUECIMIENTO COMPLETO!' + colors.reset);
  console.log('1. Ejecutar validación de calidad');
  console.log('2. Probar simulador');
  console.log('3. Deploy a producción');
}

console.log();
console.log('─'.repeat(80));
console.log(colors.cyan + 'Ejecuta: node track-progress.js (para actualizar este dashboard)' + colors.reset);
console.log('─'.repeat(80));
console.log();
