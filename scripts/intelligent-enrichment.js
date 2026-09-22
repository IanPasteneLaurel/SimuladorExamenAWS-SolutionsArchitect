const fs = require('fs');

console.log('🤖 SISTEMA DE ENRIQUECIMIENTO INTELIGENTE\n');
console.log('Generando explicaciones personalizadas basadas en análisis de contexto\n');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));
const report = JSON.parse(fs.readFileSync('strict-personalization-report.json', 'utf8'));

// Obtener preguntas que necesitan mejora (score < 7)
const needsImprovement = report.all_questions.filter(q => q.score < 7);

console.log(`📊 Preguntas a mejorar: ${needsImprovement.length}`);
console.log('');

// Función para analizar pregunta y generar contexto
function analyzeQuestionContext(question) {
  const q_text = question.question_en.toLowerCase();
  const options_text = Object.values(question.options).join(' ').toLowerCase();
  const all_text = q_text + ' ' + options_text;
  
  // Detectar keywords del escenario
  const context = {
    requirements: [],
    constraints: [],
    key_services: [],
    scenario_type: null,
    focus_areas: []
  };
  
  // Requisitos detectados
  if (all_text.includes('least') || all_text.includes('minimize')) context.requirements.push('minimize_cost');
  if (all_text.includes('most cost-effective')) context.requirements.push('cost_optimization');
  if (all_text.includes('high availability') || all_text.includes('fault tolerant')) context.requirements.push('high_availability');
  if (all_text.includes('scalab') || all_text.includes('elastic')) context.requirements.push('scalability');
  if (all_text.includes('secure') || all_text.includes('security') || all_text.includes('encrypt')) context.requirements.push('security');
  if (all_text.includes('low latency') || all_text.includes('performance')) context.requirements.push('performance');
  if (all_text.includes('operational') || all_text.includes('least overhead')) context.requirements.push('operational_efficiency');
  if (all_text.includes('disaster recovery') || all_text.includes('backup')) context.requirements.push('disaster_recovery');
  if (all_text.includes('compliance') || all_text.includes('audit')) context.requirements.push('compliance');
  
  // Restricciones
  if (all_text.includes('cannot')) context.constraints.push('hard_constraint');
  if (all_text.includes('must')) context.constraints.push('mandatory_requirement');
  if (all_text.includes('without')) context.constraints.push('exclusion');
  
  // Servicios clave mencionados
  const services = {
    'S3': /\bs3\b|amazon s3/i,
    'EC2': /\bec2\b|elastic compute/i,
    'Lambda': /\blambda\b|aws lambda/i,
    'RDS': /\brds\b|relational database/i,
    'DynamoDB': /dynamodb/i,
    'CloudFront': /cloudfront/i,
    'VPC': /\bvpc\b|virtual private cloud/i,
    'IAM': /\biam\b|identity and access/i,
    'KMS': /\bkms\b|key management/i,
    'ECS': /\becs\b|elastic container service/i,
    'EKS': /\beks\b|elastic kubernetes/i,
    'ALB': /application load balancer|alb/i,
    'NLB': /network load balancer|nlb/i,
    'Auto Scaling': /auto.?scaling/i,
    'CloudWatch': /cloudwatch/i,
    'SNS': /\bsns\b|simple notification/i,
    'SQS': /\bsqs\b|simple queue/i,
    'Route 53': /route.?53/i,
    'API Gateway': /api gateway/i,
    'Secrets Manager': /secrets manager/i,
    'Systems Manager': /systems manager|ssm/i,
    'CloudTrail': /cloudtrail/i,
    'Config': /aws config/i,
    'GuardDuty': /guardduty/i,
    'WAF': /\bwaf\b|web application firewall/i,
    'Shield': /shield/i,
    'EBS': /\bebs\b|elastic block/i,
    'EFS': /\befs\b|elastic file/i,
    'FSx': /\bfsx\b/i,
    'Kinesis': /kinesis/i,
    'Athena': /athena/i,
    'Glue': /glue/i
  };
  
  Object.entries(services).forEach(([name, pattern]) => {
    if (pattern.test(all_text)) {
      context.key_services.push(name);
    }
  });
  
  // Tipo de escenario
  if (q_text.includes('migrat')) context.scenario_type = 'migration';
  else if (q_text.includes('architect')) context.scenario_type = 'architecture_design';
  else if (q_text.includes('troubleshoot') || q_text.includes('issue') || q_text.includes('problem')) context.scenario_type = 'troubleshooting';
  else if (q_text.includes('improve') || q_text.includes('optimize')) context.scenario_type = 'optimization';
  else if (q_text.includes('implement') || q_text.includes('deploy')) context.scenario_type = 'implementation';
  
  // Áreas de enfoque
  if (context.requirements.includes('security')) context.focus_areas.push('encryption', 'access_control', 'compliance');
  if (context.requirements.includes('cost_optimization')) context.focus_areas.push('pricing', 'right_sizing', 'reserved_capacity');
  if (context.requirements.includes('performance')) context.focus_areas.push('latency', 'throughput', 'caching');
  if (context.requirements.includes('high_availability')) context.focus_areas.push('multi_az', 'failover', 'redundancy');
  
  return context;
}

// Función para generar why_correct personalizado
function generateWhyCorrect(question, correctAnswer, context) {
  const correct = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
  const correctOptions = correct.map(a => question.options[a]);
  
  let explanation = '';
  
  // Analizar la opción correcta
  const correctText = correctOptions.join(' ').toLowerCase();
  
  // Construir explicación basada en contexto
  if (context.requirements.includes('security')) {
    explanation += 'This solution implements security best practices: ';
    
    if (correctText.includes('encrypt')) {
      explanation += 'encryption protects data at rest and in transit. ';
    }
    if (correctText.includes('iam') || correctText.includes('role')) {
      explanation += 'IAM roles/policies enforce least privilege access. ';
    }
    if (correctText.includes('private') || correctText.includes('vpc')) {
      explanation += 'Private network isolation prevents unauthorized access. ';
    }
    if (correctText.includes('kms')) {
      explanation += 'KMS provides centralized key management with audit trails. ';
    }
  }
  
  if (context.requirements.includes('cost_optimization')) {
    explanation += 'Cost-effective because: ';
    
    if (correctText.includes('lambda')) {
      explanation += 'Lambda charges only for actual execution time (pay-per-use). ';
    }
    if (correctText.includes('s3')) {
      explanation += 'S3 storage costs are lower than compute-based alternatives. ';
    }
    if (correctText.includes('spot')) {
      explanation += 'Spot Instances provide up to 90% savings vs On-Demand. ';
    }
    if (correctText.includes('reserved') || correctText.includes('savings plan')) {
      explanation += 'Reserved capacity provides significant discounts for predictable workloads. ';
    }
  }
  
  if (context.requirements.includes('high_availability')) {
    explanation += 'Ensures high availability through: ';
    
    if (correctText.includes('multi') && correctText.includes('az')) {
      explanation += 'Multi-AZ deployment survives entire AZ failures. ';
    }
    if (correctText.includes('load balancer')) {
      explanation += 'Load balancer distributes traffic and performs health checks. ';
    }
    if (correctText.includes('auto scaling')) {
      explanation += 'Auto Scaling maintains capacity during failures or demand spikes. ';
    }
    if (correctText.includes('cloudfront')) {
      explanation += 'CloudFront edge locations provide global redundancy. ';
    }
  }
  
  if (context.requirements.includes('performance')) {
    explanation += 'Optimizes performance by: ';
    
    if (correctText.includes('cache') || correctText.includes('cloudfront')) {
      explanation += 'caching reduces latency for frequently accessed data. ';
    }
    if (correctText.includes('elasticache')) {
      explanation += 'in-memory caching delivers sub-millisecond response times. ';
    }
    if (correctText.includes('dynamodb')) {
      explanation += 'DynamoDB provides single-digit millisecond latency at scale. ';
    }
  }
  
  if (context.requirements.includes('operational_efficiency')) {
    explanation += 'Reduces operational overhead: ';
    
    if (correctText.includes('managed') || correctText.includes('serverless')) {
      explanation += 'fully managed service eliminates infrastructure management. ';
    }
    if (correctText.includes('lambda')) {
      explanation += 'serverless compute requires no server provisioning or patching. ';
    }
    if (correctText.includes('fargate')) {
      explanation += 'Fargate removes need to manage EC2 instances for containers. ';
    }
  }
  
  // Si la explicación está vacía, usar análisis genérico mejorado
  if (!explanation) {
    explanation = `This solution addresses the requirements by using ${context.key_services.slice(0, 2).join(' and ')}. `;
  }
  
  return explanation.trim();
}

// Función para generar why_wrong personalizado
function generateWhyWrong(question, correctAnswer, wrongOption, context) {
  const wrongText = question.options[wrongOption].toLowerCase();
  
  let reason = '';
  
  // Análisis basado en patrones comunes
  if (wrongText.includes('spot') && context.requirements.includes('high_availability')) {
    reason = 'Spot Instances can be interrupted with 2-minute notice—violates high availability requirement. Use On-Demand or Reserved for critical workloads.';
  }
  else if (wrongText.includes('lambda') && (question.question_en.includes('hour') || question.question_en.includes('long-running'))) {
    reason = 'Lambda has 15-minute maximum execution limit. Long-running processes require EC2, ECS, or Fargate instead.';
  }
  else if (wrongText.includes('single') && wrongText.includes('az') && context.requirements.includes('high_availability')) {
    reason = 'Single-AZ deployment has no redundancy—entire application fails if AZ goes down. Multi-AZ required for high availability.';
  }
  else if (wrongText.includes('manual') && context.requirements.includes('operational_efficiency')) {
    reason = 'Manual process increases operational overhead and risk of human error. Automation required for operational efficiency.';
  }
  else if (!context.key_services.some(s => wrongText.includes(s.toLowerCase()))) {
    reason = 'This option uses incorrect or suboptimal service for the use case. Does not align with scenario requirements.';
  }
  else if (wrongText.includes('public') && context.requirements.includes('security')) {
    reason = 'Public exposure increases security risk. Resources should be private with controlled access through security groups/NACLs.';
  }
  else {
    reason = 'This approach does not fully satisfy the requirements or introduces unnecessary complexity/cost.';
  }
  
  return reason;
}

// Función para generar exam tips
function generateExamTips(question, context) {
  let tips = '';
  
  if (question.multi_select) {
    tips = `Multi-select question—select ALL correct answers (${question.required_selections} required). `;
  }
  
  // Tips basados en requisitos
  if (context.requirements.includes('cost_optimization')) {
    tips += 'For cost questions: compare pricing models (On-Demand vs Reserved vs Spot vs Serverless). ';
  }
  if (context.requirements.includes('least') || context.requirements.includes('most')) {
    tips += 'Keywords "LEAST" or "MOST" indicate you must evaluate ALL options and choose the optimal one. ';
  }
  if (context.requirements.includes('security')) {
    tips += 'Security questions: think encryption (at rest + transit), least privilege (IAM), network isolation (VPC). ';
  }
  if (context.requirements.includes('high_availability')) {
    tips += 'HA requires: Multi-AZ, load balancing, auto scaling, and stateless design. ';
  }
  
  // Tips basados en servicios
  if (context.key_services.includes('Lambda')) {
    tips += 'Remember Lambda limits: 15 min max, 10GB memory max, 512MB /tmp storage. ';
  }
  if (context.key_services.includes('S3')) {
    tips += 'S3 considerations: storage classes, lifecycle policies, versioning, replication. ';
  }
  
  return tips.trim() || 'Read question carefully. Identify key requirements. Eliminate options that violate constraints.';
}

// Función para generar memorize statement
function generateMemorize(question, context) {
  const services = context.key_services.slice(0, 3);
  const req = context.requirements[0];
  
  if (services.length >= 2) {
    return `${services.join(' + ')} pattern for ${question.domain}`;
  }
  
  return `Key pattern: ${context.scenario_type || 'architecture'} with ${context.requirements.join(', ')}`;
}

// Procesar preguntas en lotes
const BATCH_SIZE = 50;
let processedCount = 0;

console.log(`Procesando en batches de ${BATCH_SIZE} preguntas...\n`);

for (let i = 0; i < needsImprovement.length; i += BATCH_SIZE) {
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const batch = needsImprovement.slice(i, i + BATCH_SIZE);
  
  console.log(`📦 Batch ${batchNum}: Procesando preguntas ${i + 1} a ${Math.min(i + BATCH_SIZE, needsImprovement.length)}...`);
  
  const enriched = batch.map(analyzedQ => {
    const question = data.find(q => q.question_id === analyzedQ.question_id);
    if (!question || !question.explanation) return null;
    
    const context = analyzeQuestionContext(question);
    const correctAnswer = question.correct_answer;
    
    // Generar nuevas explicaciones
    const newWhyCorrect = generateWhyCorrect(question, correctAnswer, context);
    
    const newWhyWrong = {};
    const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
    Object.keys(question.options).forEach(opt => {
      if (!correctAnswers.includes(opt)) {
        newWhyWrong[opt] = generateWhyWrong(question, correctAnswer, opt, context);
      }
    });
    
    const newExamTips = generateExamTips(question, context);
    const newMemorize = generateMemorize(question, context);
    
    return {
      question_id: question.question_id,
      explanation: {
        why_correct: newWhyCorrect,
        why_wrong: newWhyWrong,
        exam_tips: newExamTips,
        memorize: newMemorize,
        aws_services: context.key_services.length > 0 ? context.key_services : question.explanation.aws_services,
        architectural_concept: question.domain
      }
    };
  }).filter(Boolean);
  
  // Guardar batch
  const filename = `intelligent-enrichment-batch-${batchNum}.json`;
  fs.writeFileSync(filename, JSON.stringify(enriched, null, 2));
  
  processedCount += enriched.length;
  console.log(`   ✅ Guardado: ${filename} (${enriched.length} preguntas)`);
}

console.log('\n' + '='.repeat(70));
console.log(`✅ PROCESO COMPLETADO`);
console.log(`📊 Total preguntas mejoradas: ${processedCount}`);
console.log(`📁 Batches generados: ${Math.ceil(needsImprovement.length / BATCH_SIZE)}`);
console.log('='.repeat(70));
console.log('\n💡 Siguiente paso: Ejecutar apply-intelligent-enrichment.js para aplicar mejoras');
