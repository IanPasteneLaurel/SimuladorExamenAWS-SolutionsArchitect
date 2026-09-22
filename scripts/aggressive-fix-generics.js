const fs = require('fs');

console.log('🔥 CORRECCIÓN AGRESIVA DE TODOS LOS GENÉRICOS\n');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));

function detectServices(question) {
  const text = (question.question_en + ' ' + Object.values(question.options).join(' ')).toLowerCase();
  const services = [];
  const patterns = {
    'Lambda': /\blambda\b/i, 'S3': /\bs3\b/i, 'EC2': /\bec2\b/i, 'RDS': /\brds\b/i,
    'DynamoDB': /\bdynamodb\b/i, 'CloudFront': /\bcloudfront\b/i, 'EBS': /\bebs\b/i,
    'EFS': /\befs\b/i, 'FSx': /\bfsx\b/i, 'Route 53': /\broute\s*53\b/i,
    'ALB': /\balb\b|application load balancer/i, 'Auto Scaling': /\bauto[\s-]?scaling\b/i,
    'CloudWatch': /\bcloudwatch\b/i, 'SNS': /\bsns\b/i, 'SQS': /\bsqs\b/i,
    'EventBridge': /\beventbridge\b/i, 'Kinesis': /\bkinesis\b/i,
    'API Gateway': /\bapi gateway\b/i, 'VPC': /\bvpc\b/i, 'IAM': /\biam\b/i,
    'KMS': /\bkms\b/i, 'Aurora': /\baurora\b/i, 'ElastiCache': /\belasticache\b/i,
    'WAF': /\bwaf\b/i, 'CloudTrail': /\bcloudtrail\b/i, 'Config': /\baws config\b/i,
    'ECS': /\becs\b/i, 'EKS': /\beks\b/i, 'Fargate': /\bfargate\b/i,
  };
  for (const [service, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) services.push(service);
  }
  return services;
}

let fixed = 0;

data.forEach((q, idx) => {
  if ((idx + 1) % 100 === 0) process.stdout.write(`\rProcesadas: ${idx + 1}/923`);
  
  const exp = q.explanation;
  if (!exp || !exp.why_correct) return;
  
  const wc = exp.why_correct;
  
  // Patrones a eliminar completamente
  const genericPatterns = [
    'Opción correcta porque usa servicios AWS apropiados cumpliendo requisitos específicos de',
    'usa servicios AWS apropiados cumpliendo requisitos específicos',
    'usa servicios AWS apropiados cumpliendo requisitos',
    'This architecture aligns with AWS Well-Architected Framework best practices for',
    'meeting all specified requirements. This architecture aligns with AWS Well-Architected Framework',
    'This solution addresses the requirements by using .',
    'This solution implements security best practices:',
    'Cost-effective because:',
    'Reduces operational overhead:',
    'Optimizes performance by:',
  ];
  
  let needsFix = genericPatterns.some(pattern => wc.includes(pattern));
  
  if (!needsFix) return;
  
  // Reemplazar completamente
  const services = detectServices(q);
  const qText = q.question_en.toLowerCase();
  const domain = q.domain;
  
  let newWC = '';
  
  // Determinar beneficio principal según dominio y servicios
  if (services.length > 0) {
    const mainSvc = services[0];
    
    // Patrones específicos por servicio
    if (mainSvc === 'Lambda') {
      if (qText.includes('cost')) newWC = 'Lambda charges only for actual execution time—no idle costs. ';
      else if (qText.includes('serverless') || qText.includes('operational')) newWC = 'Lambda fully serverless—eliminates server management, patching, and capacity planning. ';
      else newWC = 'Lambda auto-scales per request with sub-second invocation times. ';
    } else if (mainSvc === 'S3') {
      if (qText.includes('cost')) newWC = 'S3 provides lowest-cost object storage at $0.023/GB with unlimited scalability. ';
      else if (qText.includes('dura')) newWC = 'S3 delivers 99.999999999% durability through automatic multi-AZ replication. ';
      else newWC = 'S3 offers unlimited scalable storage with 99.99% availability. ';
    } else if (mainSvc === 'DynamoDB') {
      if (qText.includes('latency') || qText.includes('millisecond')) newWC = 'DynamoDB provides single-digit millisecond latency at any scale. ';
      else if (qText.includes('scale')) newWC = 'DynamoDB auto-scales read/write capacity based on traffic patterns. ';
      else newWC = 'DynamoDB fully managed NoSQL with automatic scaling and replication. ';
    } else if (mainSvc === 'RDS' || mainSvc === 'Aurora') {
      if (qText.includes('aurora')) newWC = 'Aurora provides up to 5x MySQL performance with Multi-AZ automatic failover. ';
      else newWC = 'RDS fully managed—handles backups, patching, monitoring, and failover automatically. ';
    } else if (mainSvc === 'CloudFront') {
      newWC = 'CloudFront caches content at 450+ edge locations globally—reduces latency for worldwide users. ';
    } else if (mainSvc === 'Auto Scaling') {
      newWC = 'Auto Scaling adjusts EC2 capacity automatically based on CloudWatch metrics—no over-provisioning. ';
    } else if (mainSvc === 'WAF') {
      newWC = 'WAF protects against common web exploits (SQL injection, XSS) with customizable rules. ';
    } else if (mainSvc === 'IAM') {
      newWC = 'IAM enforces least privilege access through role-based permissions and policies. ';
    } else if (mainSvc === 'KMS') {
      newWC = 'KMS manages encryption keys with automatic rotation and CloudTrail logging for audit. ';
    } else if (mainSvc === 'VPC') {
      newWC = 'VPC provides network isolation with subnets, security groups, and NACLs for granular control. ';
    } else if (mainSvc === 'ECS' || mainSvc === 'EKS') {
      newWC = `${mainSvc} orchestrates containers with native AWS service integration. `;
    } else if (mainSvc === 'CloudWatch') {
      newWC = 'CloudWatch centralizes metrics, logs, and alarms for unified monitoring. ';
    } else if (mainSvc === 'EventBridge') {
      newWC = 'EventBridge enables event-driven workflows with native AWS service integration. ';
    } else {
      newWC = `${mainSvc} provides managed service capabilities. `;
    }
    
    // Agregar servicios adicionales
    if (services.length > 1) {
      const additional = services.slice(1, 3);
      additional.forEach(svc => {
        if (svc === 'Auto Scaling') newWC += 'Auto Scaling handles capacity dynamically. ';
        else if (svc === 'ALB') newWC += 'ALB distributes traffic with health checks. ';
        else if (svc === 'CloudWatch') newWC += 'CloudWatch monitors and triggers alarms. ';
        else if (svc === 'IAM') newWC += 'IAM secures access with least privilege. ';
        else if (svc === 'KMS') newWC += 'KMS encrypts data at rest. ';
      });
    }
    
    // Contexto del dominio
    if (domain.includes('Cost-Optimized')) {
      newWC += 'Minimizes costs through efficient resource allocation and appropriate pricing models.';
    } else if (domain.includes('Operationally Excellent')) {
      newWC += 'Reduces operational overhead through automation and managed services.';
    } else if (domain.includes('Secure')) {
      newWC += 'Implements defense-in-depth with encryption, access control, and network isolation.';
    } else if (domain.includes('High-Performing')) {
      newWC += 'Optimizes performance through low-latency services and efficient architectures.';
    } else if (domain.includes('Resilient')) {
      newWC += 'Ensures high availability through Multi-AZ deployment and automatic failover.';
    }
  } else {
    // Fallback si no detectamos servicios
    if (domain.includes('Cost-Optimized')) {
      newWC = 'This solution minimizes costs by using appropriate service tiers and eliminating unnecessary resource allocation.';
    } else if (domain.includes('Operationally Excellent')) {
      newWC = 'This architecture reduces operational complexity through managed services and automation.';
    } else if (domain.includes('Secure')) {
      newWC = 'This design implements security best practices including encryption, least privilege, and network isolation.';
    } else if (domain.includes('High-Performing')) {
      newWC = 'This configuration optimizes performance through efficient resource utilization and service integration.';
    } else {
      newWC = 'This solution provides high availability through redundancy and automatic failover mechanisms.';
    }
  }
  
  if (newWC && newWC.length >= 80) {
    exp.why_correct = newWC.trim();
    fixed++;
  }
});

console.log('\n\n✅ Corrección agresiva completada:\n');
console.log(`   - ${fixed} why_correct corregidos\n`);

fs.writeFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Cambios guardados\n');

// Verificar ejemplos específicos
console.log('📋 VERIFICACIÓN DE CASOS ESPECÍFICOS:\n');
[25, 520, 893, 2, 7, 26].forEach(id => {
  const q = data.find(q => q.question_id === id);
  if (q && q.explanation) {
    console.log(`Q${id}: ${q.explanation.why_correct.substring(0, 100)}...`);
  }
});
