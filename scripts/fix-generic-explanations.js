const fs = require('fs');

console.log('🔧 MEJORANDO EXPLICACIONES GENÉRICAS\n');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));

let whyCorrectFixed = 0;
let whyWrongFixed = 0;
let totalIssues = 0;

// Detectar servicios AWS mencionados en pregunta y opciones
function detectAWSServices(question) {
  const text = (question.question_en + ' ' + Object.values(question.options).join(' ')).toLowerCase();
  
  const services = [];
  const servicePatterns = {
    'Lambda': /\blambda\b/i,
    'S3': /\bs3\b|simple storage service/i,
    'EC2': /\bec2\b|elastic compute/i,
    'RDS': /\brds\b|relational database service/i,
    'DynamoDB': /\bdynamodb\b/i,
    'CloudFront': /\bcloudfront\b/i,
    'EBS': /\bebs\b|elastic block storage/i,
    'EFS': /\befs\b|elastic file system/i,
    'FSx': /\bfsx\b/i,
    'Route 53': /\broute\s*53\b/i,
    'ALB': /\balb\b|application load balancer/i,
    'NLB': /\bnlb\b|network load balancer/i,
    'ELB': /\belb\b|elastic load balanc/i,
    'Auto Scaling': /\bauto[\s-]?scaling\b/i,
    'CloudWatch': /\bcloudwatch\b/i,
    'SNS': /\bsns\b|simple notification/i,
    'SQS': /\bsqs\b|simple queue/i,
    'EventBridge': /\beventbridge\b/i,
    'Step Functions': /\bstep functions\b/i,
    'Kinesis': /\bkinesis\b/i,
    'API Gateway': /\bapi gateway\b/i,
    'VPC': /\bvpc\b|virtual private cloud/i,
    'NAT Gateway': /\bnat gateway\b/i,
    'Internet Gateway': /\binternet gateway\b/i,
    'Transit Gateway': /\btransit gateway\b/i,
    'Direct Connect': /\bdirect connect\b/i,
    'VPN': /\bvpn\b|virtual private network/i,
    'IAM': /\biam\b|identity and access/i,
    'KMS': /\bkms\b|key management/i,
    'Secrets Manager': /\bsecrets manager\b/i,
    'Systems Manager': /\bsystems manager\b|ssm\b/i,
    'CloudFormation': /\bcloudformation\b/i,
    'Elastic Beanstalk': /\belastic beanstalk\b/i,
    'ECS': /\becs\b|elastic container service/i,
    'EKS': /\beks\b|elastic kubernetes/i,
    'Fargate': /\bfargate\b/i,
    'Aurora': /\baurora\b/i,
    'ElastiCache': /\belasticache\b/i,
    'Redshift': /\bredshift\b/i,
    'Athena': /\bathena\b/i,
    'Glue': /\bglue\b/i,
    'EMR': /\bemr\b|elastic mapreduce/i,
    'SageMaker': /\bsagemaker\b/i,
    'CloudTrail': /\bcloudtrail\b/i,
    'Config': /\baws config\b/i,
    'GuardDuty': /\bguardduty\b/i,
    'Inspector': /\binspector\b/i,
    'WAF': /\bwaf\b|web application firewall/i,
    'Shield': /\bshield\b/i,
    'Macie': /\bmacie\b/i,
    'Backup': /\baws backup\b/i,
    'DataSync': /\bdatasync\b/i,
    'Storage Gateway': /\bstorage gateway\b/i,
    'Snow Family': /\bsnowball|snowcone|snowmobile\b/i,
    'Cost Explorer': /\bcost explorer\b/i,
    'Budgets': /\baws budgets\b/i,
    'Organizations': /\baws organizations\b/i,
    'Control Tower': /\bcontrol tower\b/i,
    'Service Catalog': /\bservice catalog\b/i,
  };
  
  for (const [service, pattern] of Object.entries(servicePatterns)) {
    if (pattern.test(text)) {
      services.push(service);
    }
  }
  
  return services;
}

// Detectar requisitos clave de la pregunta
function detectRequirements(question) {
  const text = question.question_en.toLowerCase();
  const requirements = [];
  
  // Requisitos de costo
  if (/most cost[\s-]?effective|minimize cost|lowest cost|optimize cost/i.test(text)) {
    requirements.push('cost-optimization');
  }
  
  // Requisitos operacionales
  if (/least operational overhead|minimal overhead|reduce operational/i.test(text)) {
    requirements.push('minimal-operations');
  }
  
  // Requisitos de disponibilidad
  if (/highly available|high availability|99\.9+%/i.test(text)) {
    requirements.push('high-availability');
  }
  
  // Requisitos de escalabilidad
  if (/scale automatically|auto[\s-]?scaling|handle.*spike|millions? of/i.test(text)) {
    requirements.push('scalability');
  }
  
  // Requisitos de seguridad
  if (/encrypt/i.test(text)) {
    requirements.push('encryption');
  }
  if (/least privilege|iam/i.test(text)) {
    requirements.push('access-control');
  }
  
  // Requisitos de tiempo
  if (/real[\s-]?time|immediately|instant/i.test(text)) {
    requirements.push('low-latency');
  }
  
  // Requisitos de durabilidad
  if (/durable|durability|data loss/i.test(text)) {
    requirements.push('durability');
  }
  
  return requirements;
}

// Mejorar why_correct genérico
function improveWhyCorrect(question) {
  const exp = question.explanation;
  if (!exp || !exp.why_correct) return false;
  
  const wc = exp.why_correct;
  
  // Detectar si es genérico
  const isGeneric = 
    wc.length < 80 ||
    wc.includes('usa servicios AWS apropiados cumpliendo requisitos') ||
    wc.includes('This solution addresses the requirements by using') ||
    wc === 'Solución óptima cumpliendo requisitos.' ||
    wc === 'Solución que cumple los requisitos especificados.' ||
    wc.startsWith('Cost-effective because:') && wc.length < 50 ||
    wc.startsWith('Reduces operational overhead:') && wc.length < 50 ||
    wc.startsWith('This solution implements security best practices:') && wc.length < 110;
  
  if (!isGeneric) return false;
  
  // Obtener datos de contexto
  const services = detectAWSServices(question);
  const requirements = detectRequirements(question);
  const correctAnswer = question.correct_answer;
  const correctOption = Array.isArray(correctAnswer) 
    ? correctAnswer.map(a => question.options[a]).join(' AND ')
    : question.options[correctAnswer];
  
  // Construir explicación mejorada
  let improved = '';
  
  // Parte 1: Por qué la solución es correcta
  if (services.length > 0) {
    const mainService = services[0];
    improved += `${mainService} `;
    
    // Agregar beneficios específicos del servicio según contexto
    if (requirements.includes('cost-optimization')) {
      if (mainService === 'Lambda') improved += 'charges only for execution time (no idle costs). ';
      else if (mainService === 'S3') improved += 'offers lowest storage cost with multiple tiers. ';
      else if (mainService.includes('Spot')) improved += 'provides up to 90% discount vs On-Demand. ';
      else improved += 'optimizes costs through managed service pricing. ';
    }
    
    if (requirements.includes('minimal-operations')) {
      if (mainService === 'Lambda') improved += 'Serverless—no infrastructure to manage. ';
      else if (mainService.includes('RDS') || mainService.includes('Aurora')) improved += 'Fully managed—automatic backups, patching, monitoring. ';
      else improved += 'Managed service eliminates operational overhead. ';
    }
    
    if (requirements.includes('high-availability')) {
      if (mainService.includes('Aurora')) improved += 'Multi-AZ by default with automatic failover. ';
      else if (mainService === 'S3') improved += 'Provides 99.99% availability across AZs. ';
      else improved += 'Built-in high availability across Availability Zones. ';
    }
    
    if (requirements.includes('scalability')) {
      if (mainService === 'Lambda') improved += 'Auto-scales per request (1-1000+ concurrent executions). ';
      else if (mainService === 'DynamoDB') improved += 'Auto-scales capacity based on traffic patterns. ';
      else if (mainService === 'Auto Scaling') improved += 'Automatically adjusts capacity based on demand. ';
      else improved += 'Scales automatically to handle traffic spikes. ';
    }
  }
  
  // Parte 2: Cómo cumple los requisitos específicos
  if (correctOption.length < 300) {
    // Extraer acción clave de la opción correcta
    const actionMatch = correctOption.match(/(Configure|Create|Use|Store|Enable|Set|Deploy|Implement|Launch|Migrate|Establish|Attach)[^.]+/i);
    if (actionMatch) {
      improved += `${actionMatch[0].trim()}—`;
      
      if (requirements.includes('cost-optimization')) {
        improved += 'minimizing unnecessary resources and charges. ';
      } else if (requirements.includes('minimal-operations')) {
        improved += 'reducing manual management tasks. ';
      } else if (requirements.includes('high-availability')) {
        improved += 'ensuring continuous operation across failures. ';
      } else {
        improved += 'meeting all specified requirements. ';
      }
    }
  }
  
  // Asegurar longitud mínima razonable
  if (improved.length < 100) {
    improved += `This architecture aligns with AWS Well-Architected Framework best practices for ${question.domain.toLowerCase()}.`;
  }
  
  // Solo actualizar si la mejora es sustancialmente mejor
  if (improved.length > wc.length * 1.3) {
    exp.why_correct = improved.trim();
    return true;
  }
  
  return false;
}

// Mejorar why_wrong genérico
function improveWhyWrong(question) {
  const exp = question.explanation;
  if (!exp || !exp.why_wrong) return false;
  
  const wrongOptions = Object.keys(question.options).filter(opt => {
    const correct = Array.isArray(question.correct_answer) 
      ? question.correct_answer 
      : [question.correct_answer];
    return !correct.includes(opt);
  });
  
  let fixed = 0;
  
  wrongOptions.forEach(opt => {
    const reason = exp.why_wrong[opt] || '';
    
    // Detectar si es genérico
    const isGeneric = 
      reason.includes('No cumple') ||
      reason.includes('usa approach subóptimo') ||
      reason.includes('does not fully satisfy') ||
      reason.includes('introduces unnecessary complexity/cost') ||
      reason === 'This approach does not fully satisfy the requirements or introduces unnecessary complexity/cost.';
    
    if (!isGeneric) return;
    
    const optionText = question.options[opt].toLowerCase();
    const services = detectAWSServices({ ...question, question_en: optionText, options: {} });
    const requirements = detectRequirements(question);
    
    let improved = '';
    
    // Identificar el problema específico de esta opción
    if (optionText.includes('on-demand') && requirements.includes('cost-optimization')) {
      improved = 'On-Demand Instances run 24/7 but application only needs compute intermittently. Pay for unused capacity increases costs unnecessarily.';
    } else if (optionText.includes('spot') && !optionText.includes('fault')) {
      improved = 'Spot Instances can be interrupted with 2-minute warning. Without fault-tolerance design, interruptions could break critical operations mid-execution.';
    } else if (optionText.includes('single') && requirements.includes('high-availability')) {
      improved = 'Single AZ deployment creates single point of failure. AZ outage makes entire application unavailable, violating HA requirement.';
    } else if (optionText.includes('manual') && requirements.includes('minimal-operations')) {
      improved = 'Manual process requires ongoing human intervention. Increases operational overhead and introduces potential for human error.';
    } else if (services.length > 1 && optionText.length > 150) {
      improved = 'Overly complex architecture with unnecessary service integration. Additional components increase cost, latency, and operational complexity without proportional benefit.';
    } else if (optionText.includes('provisioned') && requirements.includes('cost-optimization')) {
      improved = 'Provisioned capacity charges hourly regardless of actual usage. For variable workloads, pay for unused capacity during low-traffic periods.';
    } else {
      // Genérico pero más específico que antes
      if (requirements.includes('cost-optimization')) {
        improved = 'This option incurs higher costs through unnecessary resource allocation or sub-optimal service choice.';
      } else if (requirements.includes('minimal-operations')) {
        improved = 'Requires additional operational management, monitoring, or manual intervention compared to simpler alternatives.';
      } else if (requirements.includes('high-availability')) {
        improved = 'Does not provide sufficient redundancy or failover capability to meet availability requirements.';
      } else {
        improved = `Missing key requirement: ${requirements[0] || 'optimal service selection'}.`;
      }
    }
    
    if (improved && improved !== reason) {
      exp.why_wrong[opt] = improved;
      fixed++;
    }
  });
  
  return fixed > 0;
}

// Procesar todas las preguntas
console.log('Procesando 923 preguntas...\n');

data.forEach((question, idx) => {
  if ((idx + 1) % 100 === 0) {
    process.stdout.write(`\rProcesadas: ${idx + 1}/923`);
  }
  
  let hadIssue = false;
  
  if (improveWhyCorrect(question)) {
    whyCorrectFixed++;
    hadIssue = true;
  }
  
  if (improveWhyWrong(question)) {
    whyWrongFixed++;
    hadIssue = true;
  }
  
  if (hadIssue) totalIssues++;
});

console.log('\n\n✅ Proceso completado:\n');
console.log(`   - ${whyCorrectFixed} why_correct mejorados`);
console.log(`   - ${whyWrongFixed} preguntas con why_wrong mejorados`);
console.log(`   - ${totalIssues} preguntas con issues corregidos\n`);

// Guardar cambios
fs.writeFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Cambios guardados en SAA-C03-QuestionBank-923.json\n');

// Mostrar ejemplos de mejoras
console.log('📋 EJEMPLOS DE MEJORAS:\n');
console.log('='.repeat(80));

[1, 15, 21, 100, 121, 148, 314, 396, 511].forEach(id => {
  const q = data.find(question => question.question_id === id);
  if (!q || !q.explanation) return;
  
  console.log(`\nQ${q.question_id} - ${q.domain}`);
  console.log('-'.repeat(80));
  console.log(`WHY_CORRECT (${q.explanation.why_correct?.length || 0} chars):`);
  console.log(`${(q.explanation.why_correct || 'N/A').substring(0, 150)}...`);
  console.log('');
});

console.log('='.repeat(80));
