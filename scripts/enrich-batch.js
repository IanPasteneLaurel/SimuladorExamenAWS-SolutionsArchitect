#!/usr/bin/env node

/**
 * Script para enriquecer un lote pequeño de preguntas (útil para testing)
 * Uso: node enrich-batch.js [cantidad] [inicio]
 * Ejemplo: node enrich-batch.js 5 0  (procesar 5 preguntas desde la 0)
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const count = parseInt(process.argv[2]) || 5;
const start = parseInt(process.argv[3]) || 0;

const DATA_FILE = path.join(__dirname, '..', 'app', 'src', 'data', 'SAA-C03-QuestionBank-923.json');
const PROGRESS_FILE = path.join(__dirname, 'enrichment-progress.json');

console.log('='.repeat(80));
console.log('ENRIQUECIMIENTO EN LOTE');
console.log('='.repeat(80));
console.log();
console.log(`📊 Configuración:`);
console.log(`  Cantidad: ${count} preguntas`);
console.log(`  Inicio: pregunta #${start + 1}`);
console.log();

// Actualizar progreso para forzar inicio desde posición específica
if (start > 0) {
  const progress = {
    lastProcessed: start - 1,
    totalProcessed: start
  };
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
  console.log(`✅ Progreso configurado para iniciar desde pregunta #${start + 1}`);
}

// Leer datos y modificar temporalmente para procesar solo el lote
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const batch = data.slice(start, start + count);

console.log(`📖 Preguntas a procesar:`);
batch.forEach((q, i) => {
  console.log(`  ${i + 1}. Pregunta #${q.question_id} - ${q.domain}`);
});
console.log();

console.log('🚀 Ejecutando script de enriquecimiento...');
console.log('='.repeat(80));
console.log();

// Ejecutar el script principal
const enrichScript = spawn('node', [path.join(__dirname, 'enrich-explanations-with-ai.js')], {
  stdio: 'inherit',
  env: { ...process.env }
});

enrichScript.on('close', (code) => {
  console.log();
  if (code === 0) {
    console.log('✅ Lote completado exitosamente');
  } else {
    console.log(`❌ Script terminó con código: ${code}`);
  }
});
