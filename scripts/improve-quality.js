const fs = require('fs');

// Leer todas las preguntas
const allQuestions = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));

// Leer IDs genéricas
const genericIds = JSON.parse(fs.readFileSync('generic-question-ids.json', 'utf8'));

// Procesar batch específico (pasar como argumento)
const batchNum = parseInt(process.argv[2]) || 1;
const batchSize = 50;
const startIdx = (batchNum - 1) * batchSize;
const endIdx = Math.min(startIdx + batchSize, genericIds.length);

const batchIds = genericIds.slice(startIdx, endIdx);
const batchQuestions = allQuestions.filter(q => batchIds.includes(q.question_id));

console.log(`\n📦 Procesando Batch ${batchNum}`);
console.log(`Preguntas: ${startIdx + 1}-${endIdx} de ${genericIds.length}`);
console.log(`Total en batch: ${batchQuestions.length}`);

// Función para analizar pregunta y generar enrichment personalizado
function analyzeQuestion(q) {
  const questionText = q.question_en.toLowerCase();
  const correctAnswers = Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer];
  
  // Detectar servicios AWS mencionados
  const awsServices = [];
  const servicePatterns = {
    'S3': /\bs3\b|amazon s3|simple storage/i,
    'EC2': /\bec2\b|elastic compute|amazon ec2/i,
    'Lambda': /\blambda\b|aws lambda/i,
    'RDS': /\brds\b|relational database|amazon rds/i,
    'DynamoDB': /dynamodb/i,
    'CloudFront': /cloudfront/i,
    'ECS': /\becs\b|elastic container service/i,
    'EKS': /\beks\b|elastic kubernetes/i,
    'VPC': /\bvpc\b|virtual private cloud/i,
    'ALB': /application load balancer|alb/i,
    'NLB': /network load balancer|nlb/i,
    'Auto Scaling': /auto scaling|autoscaling/i,
    'CloudWatch': /cloudwatch/i,
    'SNS': /\bsns\b|simple notification/i,
    'SQS': /\bsqs\b|simple queue/i,
    'Route 53': /route 53|route53/i,
    'IAM': /\biam\b|identity and access/i,
    'KMS': /\bkms\b|key management/i,
    'CloudFormation': /cloudformation/i,
    'Elastic Beanstalk': /elastic beanstalk|beanstalk/i,
    'EBS': /\bebs\b|elastic block store/i,
    'EFS': /\befs\b|elastic file system/i,
    'Kinesis': /kinesis/i,
    'Redshift': /redshift/i,
    'Aurora': /aurora/i,
    'API Gateway': /api gateway/i,
    'Step Functions': /step functions/i,
    'AWS Batch': /aws batch|batch/i,
    'Fargate': /fargate/i,
    'ElastiCache': /elasticache/i,
    'CloudTrail': /cloudtrail/i,
    'Config': /aws config/i,
    'Organizations': /organizations/i,
    'Direct Connect': /direct connect/i,
    'VPN': /\bvpn\b|virtual private network/i,
    'Transit Gateway': /transit gateway/i,
    'WAF': /\bwaf\b|web application firewall/i,
    'Shield': /shield/i,
    'GuardDuty': /guardduty/i,
    'Inspector': /inspector/i,
    'Macie': /macie/i,
    'Secrets Manager': /secrets manager/i,
    'Systems Manager': /systems manager|ssm/i,
    'Cognito': /cognito/i,
    'SES': /\bses\b|simple email/i,
    'Glue': /\bglue\b|aws glue/i,
    'Athena': /athena/i,
    'EMR': /\bemr\b|elastic mapreduce/i
  };
  
  for (const [service, pattern] of Object.entries(servicePatterns)) {
    if (pattern.test(q.question_en) || Object.values(q.options).some(opt => pattern.test(opt))) {
      awsServices.push(service);
    }
  }
  
  // Detectar conceptos clave
  let architecturalConcept = q.domain;
  const concepts = {
    'High Availability': /high availability|ha\b|multi-az|fault.tolerant/i,
    'Scalability': /scalab|elastic|auto.scaling/i,
    'Cost Optimization': /cost.effective|cost.optimiz|lowest.cost|minimize.cost/i,
    'Security': /security|encryption|iam|access.control|least.privilege/i,
    'Performance': /performance|latency|throughput|cache/i,
    'Disaster Recovery': /disaster.recovery|dr\b|backup|rpo|rto/i,
    'Serverless': /serverless|lambda|fargate/i,
    'Container Orchestration': /container|ecs|eks|docker|kubernetes/i,
    'Data Analytics': /analytics|data.lake|redshift|athena|glue/i,
    'Real-time Processing': /real.time|streaming|kinesis/i,
    'Monitoring': /monitor|cloudwatch|logs|metrics/i
  };
  
  for (const [concept, pattern] of Object.entries(concepts)) {
    if (pattern.test(questionText)) {
      architecturalConcept = concept;
      break;
    }
  }
  
  // Generar why_correct contextualizado
  let whyCorrect = 'Solución que cumple los requisitos especificados. ';
  
  if (questionText.includes('cost') || questionText.includes('lowest')) {
    whyCorrect += 'Optimiza costos usando servicios apropiados. ';
  }
  if (questionText.includes('scale') || questionText.includes('elastic')) {
    whyCorrect += 'Proporciona escalabilidad automática. ';
  }
  if (questionText.includes('secure') || questionText.includes('security')) {
    whyCorrect += 'Implementa seguridad según best practices. ';
  }
  if (questionText.includes('high availability') || questionText.includes('fault')) {
    whyCorrect += 'Garantiza alta disponibilidad y tolerancia a fallos. ';
  }
  if (questionText.includes('performance') || questionText.includes('latency')) {
    whyCorrect += 'Mejora rendimiento y reduce latencia. ';
  }
  
  // Generar why_wrong
  const whyWrong = {};
  Object.keys(q.options).forEach(opt => {
    if (!correctAnswers.includes(opt)) {
      const optText = q.options[opt].toLowerCase();
      let reason = '';
      
      if (optText.includes('spot') && questionText.includes('critical')) {
        reason = 'Spot Instances pueden interrumpirse - no apropiado para workloads críticos.';
      } else if (optText.includes('lambda') && (questionText.includes('long') || questionText.includes('days'))) {
        reason = 'Lambda tiene límite de 15 minutos - no apto para procesos largos.';
      } else if (optText.includes('single-az') || (!optText.includes('multi-az') && questionText.includes('high availability'))) {
        reason = 'No proporciona alta disponibilidad requerida.';
      } else if (optText.includes('manual') && questionText.includes('automat')) {
        reason = 'Requiere intervención manual - no cumple requisito de automatización.';
      } else if (awsServices.length > 0 && !awsServices.some(s => optText.includes(s.toLowerCase()))) {
        reason = 'No usa servicio óptimo para el caso de uso.';
      } else {
        reason = 'No cumple todos los requisitos o usa approach subóptimo.';
      }
      
      whyWrong[opt] = reason;
    }
  });
  
  // Generar exam tips
  let examTips = 'Lee cuidadosamente los requisitos clave. ';
  if (q.multi_select) {
    examTips += 'Pregunta multi-select - selecciona TODAS las correctas. ';
  }
  if (questionText.includes('least privilege')) {
    examTips += 'Least privilege = permisos mínimos necesarios. ';
  }
  if (questionText.includes('most cost-effective')) {
    examTips += 'Compara costos entre servicios similares. ';
  }
  examTips += 'Elimina opciones claramente incorrectas primero.';
  
  // Generar memorize
  let memorize = '';
  if (awsServices.length > 0) {
    memorize = `${awsServices.slice(0, 3).join(' + ')} para ${architecturalConcept}`;
  } else {
    memorize = `Pattern para ${q.domain}`;
  }
  
  return {
    question_id: q.question_id,
    explanation: {
      why_correct: whyCorrect.trim(),
      why_wrong: whyWrong,
      exam_tips: examTips,
      memorize: memorize,
      aws_services: awsServices.length > 0 ? awsServices : ['AWS'],
      architectural_concept: architecturalConcept
    }
  };
}

// Procesar todas las preguntas del batch
const enriched = batchQuestions.map(analyzeQuestion);

// Guardar resultado
const outputFile = `improved-batch-${batchNum}.json`;
fs.writeFileSync(outputFile, JSON.stringify(enriched, null, 2));

console.log(`✅ Guardado: ${outputFile}`);
console.log(`📊 Preguntas mejoradas: ${enriched.length}`);
console.log(`\n🔍 Muestra servicios detectados:`);
enriched.slice(0, 3).forEach(e => {
  console.log(`  Q${e.question_id}: ${e.explanation.aws_services.join(', ')}`);
});
