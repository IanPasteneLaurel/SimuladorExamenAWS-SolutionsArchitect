#!/usr/bin/env node
/**
 * Regenerates all why_wrong explanations in English
 * while keeping block titles in Spanish
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923-enriched.json');
const OUTPUT_FILE = INPUT_FILE;

// Common wrong answer patterns based on AWS exam scenarios
const WRONG_ANSWER_PATTERNS = {
  // Cost optimization
  'on-demand': 'Using On-Demand Instances for predictable workloads is more expensive than Reserved Instances or Savings Plans.',
  'spot-stateful': 'Spot Instances can be interrupted at any time, making them unsuitable for stateful or continuous workloads.',
  'provisioned-capacity': 'Provisioned capacity or concurrency adds unnecessary fixed costs for unpredictable or intermittent workloads.',
  'efs-cost': 'Amazon EFS is more expensive than S3 for object storage and not optimal for infrequently accessed data.',
  'ebs-cost': 'EBS volumes incur costs even when not actively used, unlike S3 storage classes designed for infrequent access.',
  
  // High availability / Resilience
  'single-az': 'Reducing the number of Availability Zones decreases high availability and fault tolerance, violating AWS best practices for critical applications.',
  'single-region': 'Single-region deployments lack geographic redundancy, making them vulnerable to regional outages.',
  'nat-instance': 'NAT instances require manual management, are less reliable than NAT gateways, and do not auto-scale, increasing operational overhead.',
  'single-point-failure': 'This creates a single point of failure, violating high availability principles.',
  
  // Operational complexity
  'transit-gateway-overkill': 'Transit Gateway adds unnecessary cost and complexity when simple VPC routing can handle the use case.',
  'manual-management': 'This requires manual configuration and ongoing maintenance, increasing operational overhead compared to managed services.',
  'custom-solution': 'Building custom solutions increases development time, maintenance burden, and operational complexity compared to native AWS services.',
  'lambda-limit': 'Lambda functions have a maximum execution time of 15 minutes, making them unsuitable for long-running processes.',
  
  // Security
  'public-exposure': 'Exposing resources directly to the internet increases security risk and violates the principle of least privilege.',
  'no-encryption': 'Lack of encryption at rest or in transit fails to meet security compliance requirements.',
  'overly-permissive': 'Overly permissive IAM policies violate the principle of least privilege and increase security risk.',
  'shared-credentials': 'Sharing credentials or embedding them in code violates security best practices.',
  
  // Performance
  'capacity-reduction': 'Reducing maximum capacity can cause performance degradation during demand spikes, negatively impacting user experience.',
  'cold-start': 'This approach introduces cold start latency, which is unacceptable for latency-sensitive applications.',
  'sync-processing': 'Synchronous processing blocks the request thread, reducing throughput and scalability.',
  
  // Data management
  's3-rr': 'S3 Reduced Redundancy Storage has lower durability than Standard storage and is deprecated in favor of S3 One Zone-IA.',
  'glacier-retrieval': 'Glacier retrieval times range from minutes to hours, making it unsuitable for applications requiring immediate access.',
  'dynamodb-scan': 'Full table scans are inefficient and expensive for large DynamoDB tables; queries or secondary indexes should be used instead.',
  
  // Networking
  'internet-gateway-private': 'Internet Gateways allow inbound traffic from the internet, which is inappropriate for private subnets.',
  'vpn-bandwidth': 'Site-to-Site VPN has limited bandwidth (up to 1.25 Gbps per tunnel) compared to Direct Connect.',
  'elb-cross-region': 'Elastic Load Balancers do not route traffic across regions; Route 53 or Global Accelerator is needed for multi-region routing.',
  
  // Serverless
  'api-gateway-unnecessary': 'API Gateway is unnecessary when direct service integration (EventBridge, SQS, etc.) can trigger the function.',
  'step-functions-overkill': 'Step Functions add complexity and cost when a simple Lambda function or EventBridge rule suffices.',
  
  // Storage
  'ebs-shared': 'EBS volumes cannot be attached to multiple EC2 instances simultaneously (except io2 Block Express with multi-attach in same AZ).',
  's3-consistency': 'S3 provides strong read-after-write consistency for all requests, so eventual consistency is not a concern.',
  
  // Compute
  'ec2-serverless': 'EC2 instances require manual capacity management and incur costs even when idle, unlike serverless options.',
  'container-overkill': 'ECS/EKS add orchestration complexity unnecessary for simple stateless workloads.',
  
  // Database
  'rds-multi-region-write': 'RDS does not support multi-region write capabilities natively; use Aurora Global Database for that requirement.',
  'rds-aurora-compatibility': 'RDS and Aurora have different feature sets; this option may not support the required Aurora-specific features.',
  'nosql-relational': 'NoSQL databases like DynamoDB are not optimized for complex relational queries or joins.',
  
  // Monitoring / Logging
  'cloudwatch-logs-cost': 'CloudWatch Logs can become expensive with high log volumes; log filtering and retention policies are needed.',
  'custom-monitoring': 'Building custom monitoring solutions duplicates CloudWatch functionality and increases operational complexity.'
};

function detectPattern(optionText, correctAnswer, allOptions) {
  const text = optionText.toLowerCase();
  
  // Cost patterns
  if (text.includes('on-demand instance')) return 'on-demand';
  if (text.includes('spot instance')) return 'spot-stateful';
  if (text.includes('provisioned concurrency') || text.includes('provisioned capacity')) return 'provisioned-capacity';
  if (text.includes('efs') && text.includes('cost')) return 'efs-cost';
  if (text.includes('ebs') && (text.includes('snapshot') || text.includes('volume'))) return 'ebs-cost';
  
  // HA patterns
  if (text.includes('single') && text.includes('availability zone')) return 'single-az';
  if (text.includes('nat instance')) return 'nat-instance';
  if (text.includes('single') && text.includes('region')) return 'single-region';
  
  // Operational patterns
  if (text.includes('transit gateway')) return 'transit-gateway-overkill';
  if (text.includes('manual') || text.includes('custom script')) return 'manual-management';
  if (text.includes('build') || text.includes('develop')) return 'custom-solution';
  
  // Security patterns
  if (text.includes('public') && text.includes('subnet')) return 'public-exposure';
  if (text.includes('internet gateway') && text.includes('private')) return 'internet-gateway-private';
  
  // Performance patterns
  if (text.includes('reduce') && (text.includes('capacity') || text.includes('size'))) return 'capacity-reduction';
  if (text.includes('synchronous')) return 'sync-processing';
  
  // Storage patterns
  if (text.includes('glacier') && text.includes('immediate')) return 'glacier-retrieval';
  if (text.includes('reduced redundancy')) return 's3-rr';
  if (text.includes('scan') && text.includes('dynamodb')) return 'dynamodb-scan';
  
  // Networking patterns
  if (text.includes('vpn') && text.includes('bandwidth')) return 'vpn-bandwidth';
  if (text.includes('elb') && text.includes('region')) return 'elb-cross-region';
  
  // Serverless patterns
  if (text.includes('api gateway') && !text.includes('http')) return 'api-gateway-unnecessary';
  if (text.includes('step functions') && text.includes('simple')) return 'step-functions-overkill';
  
  // Compute patterns
  if (text.includes('ec2') && correctAnswer.toLowerCase().includes('lambda')) return 'ec2-serverless';
  if ((text.includes('ecs') || text.includes('eks')) && correctAnswer.toLowerCase().includes('lambda')) return 'container-overkill';
  
  // Database patterns
  if (text.includes('rds') && text.includes('multi-region') && text.includes('write')) return 'rds-multi-region-write';
  if (text.includes('dynamodb') && correctAnswer.toLowerCase().includes('rds')) return 'nosql-relational';
  
  // Default fallback
  return null;
}

function generateWhyWrong(option, correctAnswer, allOptions, question) {
  const pattern = detectPattern(option, correctAnswer, allOptions);
  
  if (pattern && WRONG_ANSWER_PATTERNS[pattern]) {
    return WRONG_ANSWER_PATTERNS[pattern];
  }
  
  // Fallback: Generate based on general principles
  const text = option.toLowerCase();
  
  // Cost-related
  if (text.includes('on-demand')) {
    return 'On-Demand pricing is more expensive than alternatives like Reserved Instances, Savings Plans, or serverless options for predictable workloads.';
  }
  if (text.includes('provisioned')) {
    return 'Provisioned capacity adds fixed costs that may not align with variable or unpredictable workload patterns.';
  }
  
  // Availability-related
  if (text.includes('single') && (text.includes('az') || text.includes('availability zone'))) {
    return 'Single Availability Zone deployments lack redundancy and do not meet high availability requirements.';
  }
  
  // Operational complexity
  if (text.includes('manual') || text.includes('script')) {
    return 'Manual processes increase operational overhead and are error-prone compared to managed AWS services.';
  }
  
  // Generic fallback
  return 'This option does not meet the stated requirements as effectively as the correct answer in terms of cost, performance, availability, or operational simplicity.';
}

function processQuestions() {
  console.log('Loading questions...');
  const questions = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  
  console.log(`Processing ${questions.length} questions...\n`);
  
  let updated = 0;
  
  questions.forEach((q, idx) => {
    if (!q.explanation || !q.explanation.why_wrong) {
      console.log(`⚠️  Question ${q.question_id}: No why_wrong field`);
      return;
    }
    
    const correctAnswer = q.correct_answer;
    const allOptions = q.options;
    const correctText = allOptions[correctAnswer];
    
    // Regenerate why_wrong for all wrong answers
    Object.keys(q.explanation.why_wrong).forEach(optionKey => {
      if (optionKey !== correctAnswer) {
        const optionText = allOptions[optionKey];
        const newExplanation = generateWhyWrong(optionText, correctText, allOptions, q);
        q.explanation.why_wrong[optionKey] = newExplanation;
        updated++;
      }
    });
    
    if ((idx + 1) % 100 === 0) {
      console.log(`✅ Processed ${idx + 1}/${questions.length} questions...`);
    }
  });
  
  console.log(`\n✅ Updated ${updated} wrong answer explanations`);
  console.log('💾 Saving to file...');
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(questions, null, 2));
  
  console.log(`✅ Done! Updated file: ${OUTPUT_FILE}`);
  
  // Verify no Spanish remains
  console.log('\n🔍 Verifying language...');
  const spanishCount = questions.filter(q => 
    q.explanation.why_wrong && 
    Object.values(q.explanation.why_wrong).some(w => /[áéíóú]|usar|agrega|resulta|pueden|requieren|disminuye/i.test(w))
  ).length;
  
  if (spanishCount === 0) {
    console.log('✅ All why_wrong explanations are now in English!');
  } else {
    console.log(`⚠️  Warning: ${spanishCount} questions still have Spanish text`);
  }
}

processQuestions();
