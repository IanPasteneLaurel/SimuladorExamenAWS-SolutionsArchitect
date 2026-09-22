const fs = require('fs');

console.log('✨ PULIDO FINAL - 42 PREGUNTAS SCORE 5\n');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));
const report = JSON.parse(fs.readFileSync('strict-personalization-report.json', 'utf8'));

// Obtener preguntas con score 5 (FAIR)
const needsPolish = report.all_questions.filter(q => q.score === 5);

console.log(`📋 Preguntas a pulir: ${needsPolish.length}`);
console.log('IDs:', needsPolish.map(q => q.question_id).join(', '));
console.log('');

// Función para expandir why_correct con más detalle
function expandWhyCorrect(question) {
  const q_text = question.question_en.toLowerCase();
  const correct = Array.isArray(question.correct_answer) ? question.correct_answer : [question.correct_answer];
  const correctOptions = correct.map(a => question.options[a]).join(' ').toLowerCase();
  
  let expansion = question.explanation.why_correct || '';
  
  // Añadir contexto técnico específico basado en servicios
  const services = question.explanation.aws_services || [];
  
  services.forEach(service => {
    const s = service.toLowerCase();
    
    if (s.includes('iam') && expansion.length < 150) {
      expansion += ' IAM provides fine-grained access control with policies, roles, and groups. Supports MFA and temporary credentials via STS.';
    }
    if (s.includes('kms') && expansion.length < 150) {
      expansion += ' KMS manages encryption keys with automatic rotation, audit logging via CloudTrail, and integration with AWS services.';
    }
    if (s.includes('s3') && expansion.length < 150) {
      expansion += ' S3 offers 11 nines durability, multiple storage classes, and lifecycle policies for cost optimization.';
    }
    if (s.includes('ec2') && correctOptions.includes('reserved') && expansion.length < 150) {
      expansion += ' Reserved Instances provide up to 72% savings with 1 or 3-year commitments for predictable workloads.';
    }
    if (s.includes('lambda') && expansion.length < 150) {
      expansion += ' Lambda scales automatically, charges per 100ms execution, and eliminates server management overhead.';
    }
    if (s.includes('vpc') && expansion.length < 150) {
      expansion += ' VPC provides network isolation with subnets, security groups, NACLs, and route tables for traffic control.';
    }
    if (s.includes('cloudfront') && expansion.length < 150) {
      expansion += ' CloudFront caches content at 400+ edge locations globally, reducing latency and origin load.';
    }
    if (s.includes('rds') && correctOptions.includes('multi-az') && expansion.length < 150) {
      expansion += ' Multi-AZ RDS provides synchronous replication to standby instance with automatic failover in ~60 seconds.';
    }
    if (s.includes('dynamodb') && expansion.length < 150) {
      expansion += ' DynamoDB delivers single-digit millisecond latency with automatic scaling and built-in replication.';
    }
    if (s.includes('route 53') && expansion.length < 150) {
      expansion += ' Route 53 offers multiple routing policies (weighted, latency, geolocation) with health checks for failover.';
    }
  });
  
  // Añadir contexto basado en dominio si aún es corto
  if (expansion.length < 100) {
    if (question.domain.includes('Security') || question.domain.includes('Secure')) {
      expansion += ' Security best practices include encryption at rest and in transit, least privilege access, network segmentation, and audit logging.';
    }
    if (question.domain.includes('Cost')) {
      expansion += ' Cost optimization involves right-sizing resources, using reserved capacity for steady workloads, and leveraging serverless for variable demand.';
    }
    if (question.domain.includes('Performance') || question.domain.includes('High-Performing')) {
      expansion += ' Performance optimization uses caching layers, read replicas, content delivery networks, and in-memory databases for low latency.';
    }
    if (question.domain.includes('Resilient')) {
      expansion += ' Resilience requires multi-AZ deployment, automated backups, health checks, and graceful degradation under failure conditions.';
    }
  }
  
  return expansion.trim();
}

// Función para crear memorize array con facts específicos
function createMemorizeArray(question) {
  const services = question.explanation.aws_services || [];
  const facts = [];
  
  services.forEach(service => {
    const s = service.toLowerCase();
    
    if (s.includes('iam')) {
      facts.push('IAM: Free service, supports 5000 users/account default limit');
      facts.push('IAM roles provide temporary credentials via STS');
    }
    if (s.includes('kms')) {
      facts.push('KMS: $1/month per customer managed key');
      facts.push('KMS automatic key rotation: once per year for AWS managed keys');
    }
    if (s.includes('s3')) {
      facts.push('S3 Standard: 99.99% availability, 11 nines durability');
      facts.push('S3 lifecycle transitions: free operation');
    }
    if (s.includes('lambda')) {
      facts.push('Lambda: 15-minute max execution, 10GB max memory');
      facts.push('Lambda pricing: $0.20 per 1M requests + compute time');
    }
    if (s.includes('ec2')) {
      facts.push('EC2 Reserved: 1 or 3 year terms, up to 72% savings');
      facts.push('EC2 Spot: up to 90% savings, 2-minute interruption notice');
    }
    if (s.includes('vpc')) {
      facts.push('VPC: 5 VPCs per region default, can request increase');
      facts.push('Security Groups: stateful, NACLs: stateless');
    }
    if (s.includes('dynamodb')) {
      facts.push('DynamoDB: single-digit ms latency, 400KB item size limit');
      facts.push('DynamoDB auto-scaling: target utilization 70%');
    }
    if (s.includes('rds')) {
      facts.push('RDS Multi-AZ: automatic failover ~60 seconds');
      facts.push('RDS Read Replicas: async replication, up to 5 per primary');
    }
  });
  
  // Si no hay facts suficientes, añadir genéricos del dominio
  if (facts.length < 3) {
    if (question.domain.includes('Security')) {
      facts.push('Encryption at rest + in transit = defense in depth');
      facts.push('Least privilege: grant minimum permissions needed');
    }
    if (question.domain.includes('Cost')) {
      facts.push('Reserved capacity: 1-3 year commitment for savings');
      facts.push('Serverless: pay only for what you use');
    }
    facts.push(`Pattern for ${question.domain}`);
  }
  
  return facts.slice(0, 5); // Max 5 facts
}

// Procesar preguntas
const polished = needsPolish.map(analyzedQ => {
  const question = data.find(q => q.question_id === analyzedQ.question_id);
  if (!question || !question.explanation) return null;
  
  const expandedWhyCorrect = expandWhyCorrect(question);
  const memorizeArray = createMemorizeArray(question);
  
  return {
    question_id: question.question_id,
    explanation: {
      why_correct: expandedWhyCorrect,
      why_wrong: question.explanation.why_wrong, // Keep existing
      exam_tips: question.explanation.exam_tips, // Keep existing
      memorize: memorizeArray,
      aws_services: question.explanation.aws_services, // Keep existing
      architectural_concept: question.explanation.architectural_concept
    }
  };
}).filter(Boolean);

// Guardar
fs.writeFileSync('final-polish-batch.json', JSON.stringify(polished, null, 2));

console.log('✅ Pulido completado');
console.log(`📊 Preguntas procesadas: ${polished.length}`);
console.log('📁 Guardado en: final-polish-batch.json');
console.log('\n💡 Ejecuta apply-final-polish.js para aplicar');
