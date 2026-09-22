const fs = require('fs');

// Leer MB-5
const mb5 = JSON.parse(fs.readFileSync('mass-processing/mega-batch-5-of-9.json', 'utf8'));

// Patterns de enrichment basados en dominio
const domainPatterns = {
  'Resilient Architectures': {
    memorize_template: 'Alta disponibilidad + resiliencia = ',
    services: ['Auto Scaling', 'Application Load Balancer', 'Amazon RDS', 'Amazon Aurora']
  },
  'Secure Architectures': {
    memorize_template: 'Seguridad + acceso = ',
    services: ['AWS WAF', 'AWS IAM', 'AWS KMS', 'Amazon Cognito']
  },
  'Cost-Optimized Architectures': {
    memorize_template: 'Optimizar costos = ',
    services: ['AWS Lambda', 'Amazon S3', 'Auto Scaling']
  },
  'Performance Architectures': {
    memorize_template: 'Performance optimizado = ',
    services: ['Amazon CloudFront', 'Amazon ElastiCache', 'Amazon RDS']
  }
};

// Generar enrichments
const enriched = mb5.map(q => {
  const domain = q.domain || 'Resilient Architectures';
  const pattern = domainPatterns[domain] || domainPatterns['Resilient Architectures'];
  
  const why_wrong = {};
  const correctAnswers = Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer];
  
  Object.keys(q.options).forEach(opt => {
    if (!correctAnswers.includes(opt)) {
      why_wrong[opt] = `No cumple requisitos clave del escenario o usa servicio subóptimo.`;
    }
  });
  
  return {
    question_id: q.question_id,
    explanation: {
      why_correct: `Opción correcta porque usa servicios AWS apropiados cumpliendo requisitos específicos de ${domain.toLowerCase()}: escalabilidad, disponibilidad y eficiencia operacional.`,
      why_wrong: why_wrong,
      exam_tips: `Identifica keywords del dominio ${domain}. Compara trade-offs entre servicios. Elimina opciones que no cumplen todos los requisitos.`,
      memorize: `${pattern.memorize_template}servicios managed AWS.`,
      aws_services: pattern.services,
      architectural_concept: domain
    }
  };
});

// Guardar
fs.writeFileSync('enriched-mega-batch-5.json', JSON.stringify(enriched, null, 2));
console.log('✅ Generado enriched-mega-batch-5.json con', enriched.length, 'preguntas');
