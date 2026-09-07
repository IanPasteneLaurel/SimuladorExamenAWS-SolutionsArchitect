#!/usr/bin/env node

/**
 * Script para generar explicaciones de "why_wrong" para todas las opciones incorrectas
 * Analiza el contexto de cada pregunta y genera explicaciones coherentes
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923-enriched.json');
const OUTPUT_FILE = INPUT_FILE; // Actualizar el mismo archivo

console.log('📚 Generando explicaciones "why_wrong" para opciones incorrectas\n');

// Cargar preguntas
const questions = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
console.log(`✅ Cargadas ${questions.length} preguntas\n`);

let processedCount = 0;
let skippedCount = 0;

// Función para generar explicación basada en el contexto
function generateWhyWrong(question, option, optionLetter) {
  const fullText = question.explanation?.full_text || '';
  const whyCorrect = question.explanation?.why_correct || '';
  const correctAnswer = question.correct_answer;
  const correctOption = question.options[correctAnswer];
  
  // Analizar por qué esta opción no es correcta
  let reason = '';
  
  // Buscar menciones específicas de esta opción en el full_text
  const optionMention = fullText.toLowerCase();
  const optionText = option.toLowerCase();
  
  // Patrones comunes de por qué una opción está mal
  if (optionText.includes('on-demand') && !correctOption.toLowerCase().includes('on-demand')) {
    reason = 'Usar On-Demand Instances para cargas de trabajo predecibles resulta más costoso que usar Reserved Instances o Savings Plans.';
  }
  else if (optionText.includes('spot') && !correctOption.toLowerCase().includes('spot')) {
    reason = 'Las Spot Instances pueden ser interrumpidas en cualquier momento, lo que no es adecuado para cargas de trabajo que requieren disponibilidad continua o son stateful.';
  }
  else if (optionText.includes('ec2') && correctOption.toLowerCase().includes('lambda')) {
    reason = 'Usar EC2 instances para cargas de trabajo de corta duración y esporádicas es menos rentable que usar Lambda, que cobra solo por el tiempo de ejecución real.';
  }
  else if (optionText.includes('lambda') && correctOption.toLowerCase().includes('ec2')) {
    reason = 'Lambda tiene limitaciones de tiempo de ejecución (15 minutos máximo) y puede no ser adecuado para cargas de trabajo de larga duración o que requieren control total del sistema operativo.';
  }
  else if (optionText.includes('efs') && correctOption.toLowerCase().includes('s3')) {
    reason = 'Amazon EFS es más costoso que S3 para almacenamiento de objetos y no es la opción óptima para datos que no requieren acceso frecuente a nivel de sistema de archivos.';
  }
  else if (optionText.includes('s3') && correctOption.toLowerCase().includes('efs')) {
    reason = 'S3 no proporciona acceso a nivel de sistema de archivos POSIX que puede ser requerido por aplicaciones que necesitan montar un sistema de archivos compartido.';
  }
  else if (optionText.includes('multi-az') && !correctOption.toLowerCase().includes('multi-az') && fullText.toLowerCase().includes('non-production')) {
    reason = 'Multi-AZ deployment aumenta los costos significativamente y puede no ser necesario para entornos de no producción donde la alta disponibilidad no es un requisito.';
  }
  else if (optionText.includes('single-az') && correctOption.toLowerCase().includes('multi-az')) {
    reason = 'Single-AZ deployment no proporciona alta disponibilidad ni tolerancia a fallos, lo cual es necesario para entornos de producción críticos.';
  }
  else if (optionText.includes('provisioned') && !correctOption.toLowerCase().includes('provisioned')) {
    reason = 'Provisioned capacity o concurrency agrega costos fijos innecesarios para cargas de trabajo con patrones de uso impredecibles o intermitentes.';
  }
  else if (optionText.includes('api gateway') && !correctOption.toLowerCase().includes('api gateway') && fullText.toLowerCase().includes('schedule')) {
    reason = 'API Gateway es innecesario para tareas programadas y agrega complejidad y costo adicional sin proporcionar valor para este caso de uso.';
  }
  else if (optionText.includes('rds') && correctOption.toLowerCase().includes('aurora')) {
    reason = 'RDS estándar puede ser más costoso y menos eficiente que Aurora para cargas de trabajo que requieren escalabilidad automática y alta disponibilidad.';
  }
  else if (optionText.includes('aurora') && correctOption.toLowerCase().includes('rds') && !correctOption.toLowerCase().includes('aurora')) {
    reason = 'Aurora puede ser sobre-dimensionado y más costoso para cargas de trabajo simples que no requieren sus características avanzadas de escalabilidad y rendimiento.';
  }
  else if (optionText.includes('cloudfront') && !correctOption.toLowerCase().includes('cloudfront') && fullText.toLowerCase().includes('internal')) {
    reason = 'CloudFront está diseñado para distribución de contenido a usuarios finales globales, no es necesario ni apropiado para tráfico interno o cargas de trabajo sin requisitos de CDN.';
  }
  else if (optionText.includes('reduce') && optionText.includes('availability zone')) {
    reason = 'Reducir el número de Availability Zones disminuye la alta disponibilidad y tolerancia a fallos, lo cual va en contra de las mejores prácticas de AWS para aplicaciones críticas.';
  }
  else if (optionText.includes('nat instance')) {
    reason = 'NAT instances requieren gestión manual, son menos confiables que NAT gateways, y no escalan automáticamente, lo que aumenta la sobrecarga operativa.';
  }
  else if (optionText.includes('transit gateway') && !correctOption.toLowerCase().includes('transit gateway')) {
    reason = 'Transit Gateway agrega costo y complejidad innecesarios cuando se usa solo para routing simple que puede ser manejado con rutas VPC estándar.';
  }
  else if (optionText.includes('decrease') && optionText.includes('maximum') && fullText.toLowerCase().includes('performance')) {
    reason = 'Disminuir la capacidad máxima puede causar degradación del rendimiento durante picos de demanda, afectando negativamente la experiencia del usuario.';
  }
  else if (optionText.includes('datasync') && !correctOption.toLowerCase().includes('datasync')) {
    reason = 'AWS DataSync es una herramienta de migración de datos y no es apropiada como solución permanente de acceso a datos compartidos, además agrega costos de transferencia innecesarios.';
  }
  else if (optionText.includes('lambda layer')) {
    reason = 'Lambda layers están diseñados para código compartido y dependencias, no para almacenar datos dinámicos. Tienen límites estrictos de tamaño (250 MB descomprimido) y son inmutables.';
  }
  else if (fullText.includes('Option ' + optionLetter)) {
    // Buscar mención explícita en el texto
    const sentences = fullText.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (sentence.includes('Option ' + optionLetter) || sentence.includes(optionLetter + ' is incorrect') || sentence.includes(optionLetter + ' is wrong')) {
        reason = sentence.trim() + '.';
        break;
      }
    }
  }
  
  // Si no se encontró una razón específica, generar una genérica
  if (!reason) {
    reason = `Esta opción no cumple con los requisitos de manera óptima. ${whyCorrect ? 'La opción correcta ' + correctAnswer + ' es mejor porque ' + whyCorrect.split('.')[0].toLowerCase() + '.' : ''}`;
  }
  
  return reason;
}

// Procesar cada pregunta
questions.forEach((question, index) => {
  if (!question.explanation || !question.explanation.why_wrong) {
    skippedCount++;
    return;
  }
  
  const needsUpdate = Object.values(question.explanation.why_wrong).some(v => 
    typeof v === 'string' && v.includes('PENDIENTE')
  );
  
  if (!needsUpdate) {
    skippedCount++;
    return;
  }
  
  console.log(`\n📝 Procesando pregunta ${question.question_id} (${index + 1}/${questions.length})`);
  
  // Obtener todas las opciones incorrectas
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'].filter(l => question.options[l]);
  const wrongOptions = optionLetters.filter(l => l !== question.correct_answer);
  
  // Generar explicaciones para cada opción incorrecta
  wrongOptions.forEach(letter => {
    const option = question.options[letter];
    const explanation = generateWhyWrong(question, option, letter);
    
    question.explanation.why_wrong[letter] = explanation;
    console.log(`  ✅ Opción ${letter}: ${explanation.substring(0, 80)}...`);
  });
  
  processedCount++;
});

// Guardar archivo actualizado
console.log(`\n\n💾 Guardando archivo actualizado...`);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(questions, null, 2), 'utf-8');

console.log(`\n✅ Proceso completado!`);
console.log(`  - Preguntas procesadas: ${processedCount}`);
console.log(`  - Preguntas omitidas (ya completas): ${skippedCount}`);
console.log(`  - Total: ${questions.length}`);
console.log(`\n📁 Archivo actualizado: ${OUTPUT_FILE}\n`);
