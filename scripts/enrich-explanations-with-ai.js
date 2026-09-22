#!/usr/bin/env node

/**
 * Script para enriquecer explicaciones usando Claude AI (Anthropic API)
 * 
 * Este script:
 * 1. Lee el archivo de preguntas
 * 2. Para cada pregunta sin explicación estructurada
 * 3. Usa Claude para generar explicación personalizada
 * 4. Actualiza el JSON con la explicación enriquecida
 * 5. Guarda progreso incremental (cada N preguntas)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuración
const DATA_FILE = path.join(__dirname, '..', 'app', 'src', 'data', 'SAA-C03-QuestionBank-923.json');
const BACKUP_FILE = path.join(__dirname, '..', 'app', 'src', 'data', 'SAA-C03-QuestionBank-923.pre-enrich.backup.json');
const PROGRESS_FILE = path.join(__dirname, 'enrichment-progress.json');
const BATCH_SIZE = 10; // Guardar cada 10 preguntas
const RATE_LIMIT_DELAY = 1000; // 1 segundo entre requests

// API Key desde variable de entorno
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('❌ Error: ANTHROPIC_API_KEY no está configurada');
  console.error('');
  console.error('Para usar este script, necesitas:');
  console.error('1. Obtener una API key de Anthropic: https://console.anthropic.com/');
  console.error('2. Configurar la variable de entorno:');
  console.error('   Windows: set ANTHROPIC_API_KEY=tu-api-key');
  console.error('   Linux/Mac: export ANTHROPIC_API_KEY=tu-api-key');
  console.error('');
  process.exit(1);
}

console.log('='.repeat(80));
console.log('ENRIQUECIMIENTO DE EXPLICACIONES CON CLAUDE AI');
console.log('='.repeat(80));
console.log();

// Función para llamar a Claude API
async function callClaudeAPI(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          
          if (res.statusCode === 200) {
            resolve(parsed.content[0].text);
          } else {
            reject(new Error(`API Error: ${parsed.error?.message || 'Unknown error'}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

// Función para generar explicación enriquecida
async function enrichQuestion(question) {
  const correctAnswer = Array.isArray(question.correct_answer) 
    ? question.correct_answer.join(', ') 
    : question.correct_answer;
  
  const optionsText = Object.entries(question.options)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const prompt = `Eres un experto instructor de AWS Certified Solutions Architect Associate (SAA-C03). Tu trabajo es crear explicaciones educativas detalladas para preguntas de examen.

PREGUNTA:
${question.question_en}

OPCIONES:
${optionsText}

RESPUESTA CORRECTA: ${correctAnswer}

EXPLICACIÓN ORIGINAL:
${question.explanation?.full_text || 'No disponible'}

DOMINIO AWS: ${question.domain}

---

Por favor, genera una explicación estructurada en formato JSON con los siguientes campos:

{
  "why_correct": "Explicación clara y concisa (2-3 oraciones) de por qué la(s) respuesta(s) correcta(s) es la mejor opción. Enfócate en los beneficios específicos y cómo cumple los requisitos.",
  
  "why_wrong": {
    "A": "Por qué esta opción es incorrecta (si no es correcta)",
    "B": "Por qué esta opción es incorrecta (si no es correcta)",
    ...etc para cada opción incorrecta
  },
  
  "aws_services": ["Servicio1", "Servicio2", ...] (lista de servicios AWS mencionados),
  
  "architectural_concept": "Concepto arquitectónico principal (ej: 'Cost Optimization', 'High Availability', 'Scalability')",
  
  "exam_tips": "Tip específico y práctico para el examen (1-2 oraciones). Incluye palabras clave que AWS usa en preguntas similares.",
  
  "memorize": [
    "Punto clave 1 para memorizar",
    "Punto clave 2 para memorizar",
    "Punto clave 3 para memorizar"
  ] (3-5 puntos concisos y memorables)
}

IMPORTANTE:
- Sé específico y técnico pero claro
- Enfócate en el "por qué" no solo en el "qué"
- Los tips deben ayudar a reconocer patrones en el examen
- Los puntos para memorizar deben ser concisos (1 línea cada uno)
- Mantén el tono educativo y motivador

Responde SOLO con el JSON, sin texto adicional.`;

  try {
    const response = await callClaudeAPI(prompt);
    
    // Extraer JSON de la respuesta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }
    
    const enrichedData = JSON.parse(jsonMatch[0]);
    
    // Validar estructura
    if (!enrichedData.why_correct || !enrichedData.exam_tips) {
      throw new Error('Respuesta incompleta de la API');
    }
    
    return enrichedData;
  } catch (error) {
    console.error(`  ❌ Error al procesar pregunta: ${error.message}`);
    return null;
  }
}

// Función para delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función principal
async function main() {
  // Leer datos
  console.log('📖 Leyendo archivo de preguntas...');
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`✅ ${data.length} preguntas cargadas`);
  console.log();

  // Crear backup
  console.log('💾 Creando backup...');
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Backup creado: ${BACKUP_FILE}`);
  console.log();

  // Cargar progreso previo (si existe)
  let progress = { lastProcessed: -1, totalProcessed: 0 };
  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log(`📊 Progreso anterior encontrado: ${progress.totalProcessed} preguntas procesadas`);
    console.log();
  }

  // Identificar preguntas que necesitan enriquecimiento
  const questionsToEnrich = data
    .map((q, idx) => ({ ...q, originalIndex: idx }))
    .filter(q => {
      const exp = q.explanation || {};
      const needsEnrichment = !exp.why_correct || !exp.exam_tips || !exp.why_wrong;
      const notYetProcessed = q.originalIndex > progress.lastProcessed;
      return needsEnrichment && notYetProcessed;
    });

  console.log('🎯 Análisis:');
  console.log(`  Total de preguntas: ${data.length}`);
  console.log(`  Ya procesadas: ${progress.totalProcessed}`);
  console.log(`  Pendientes: ${questionsToEnrich.length}`);
  console.log();

  if (questionsToEnrich.length === 0) {
    console.log('✅ Todas las preguntas ya están enriquecidas!');
    return;
  }

  // Confirmar antes de continuar
  console.log('⚠️  ATENCIÓN:');
  console.log(`  - Se procesarán ${questionsToEnrich.length} preguntas`);
  console.log(`  - Esto usará tokens de API de Anthropic`);
  console.log(`  - Estimado: ~${Math.ceil(questionsToEnrich.length / 60)} minutos`);
  console.log();
  console.log('Presiona Ctrl+C para cancelar, o espera 5 segundos para continuar...');
  await delay(5000);
  console.log();

  console.log('🚀 Iniciando enriquecimiento...');
  console.log('='.repeat(80));
  console.log();

  let enriched = 0;
  let errors = 0;

  for (let i = 0; i < questionsToEnrich.length; i++) {
    const q = questionsToEnrich[i];
    const qNum = q.originalIndex + 1;

    console.log(`[${i + 1}/${questionsToEnrich.length}] Procesando pregunta #${qNum}...`);

    try {
      const enrichedData = await enrichQuestion(q);

      if (enrichedData) {
        // Actualizar pregunta en el array principal
        data[q.originalIndex].explanation = {
          ...data[q.originalIndex].explanation,
          ...enrichedData,
          full_text: data[q.originalIndex].explanation?.full_text || ''
        };

        enriched++;
        console.log(`  ✅ Enriquecida (${enriched}/${questionsToEnrich.length})`);
      } else {
        errors++;
        console.log(`  ⚠️  Error al enriquecer`);
      }

      // Actualizar progreso
      progress.lastProcessed = q.originalIndex;
      progress.totalProcessed++;

      // Guardar progreso cada BATCH_SIZE preguntas
      if ((i + 1) % BATCH_SIZE === 0) {
        console.log();
        console.log('💾 Guardando progreso...');
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
        console.log(`✅ Progreso guardado (${progress.totalProcessed} preguntas)`);
        console.log();
      }

      // Rate limiting
      await delay(RATE_LIMIT_DELAY);

    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      errors++;
    }
  }

  // Guardar final
  console.log();
  console.log('💾 Guardando versión final...');
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
  console.log('✅ Archivo guardado');

  console.log();
  console.log('='.repeat(80));
  console.log('✅ ENRIQUECIMIENTO COMPLETADO');
  console.log('='.repeat(80));
  console.log();
  console.log(`📊 Resultados:`);
  console.log(`  Preguntas enriquecidas: ${enriched}`);
  console.log(`  Errores: ${errors}`);
  console.log(`  Total procesado: ${progress.totalProcessed}`);
  console.log();
  console.log('📁 Archivos:');
  console.log(`  Datos actualizados: ${DATA_FILE}`);
  console.log(`  Backup: ${BACKUP_FILE}`);
  console.log(`  Progreso: ${PROGRESS_FILE}`);
  console.log();
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
