const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// IDs with generic memorize from analysis
const genericMemorizeIds = [139, 170, 483, 624, 881, 407, 499, 566, 581, 714];

function isGenericMemorize(memorize) {
  if (typeof memorize !== 'string') return false;
  
  // Patterns that indicate generic memorize
  const genericPatterns = [
    /^[A-Z0-9]+ \+ [A-Z0-9]+ \+ [A-Z0-9]+ pattern for/i,  // "EC2 + Lambda + ECS pattern for..."
    /^[A-Z0-9]+ pattern for/i,  // "Lambda pattern for..."
    /pattern for [A-Za-z\- ]+$/,  // ends with "pattern for Domain"
    /^Use .+ for .+ architectures$/i,  // "Use X for Y architectures"
    /^Key pattern:/i,  // "Key pattern: migration with security"
    /^AWS (reduces costs|optimizes performance|enhances security) through/i,  // Generic AWS statements
  ];
  
  return genericPatterns.some(pattern => pattern.test(memorize));
}

function extractKeywords(question, correctAnswer, services) {
  const text = `${question} ${correctAnswer}`.toLowerCase();
  
  const keywords = {
    // Cost keywords
    cost: text.includes('cost') || text.includes('expensive') || text.includes('economical') || text.includes('affordable'),
    savings: text.includes('savings') || text.includes('reduce cost') || text.includes('minimize cost'),
    
    // Performance keywords
    latency: text.includes('latency') || text.includes('millisecond') || text.includes('fast') || text.includes('quickly'),
    throughput: text.includes('throughput') || text.includes('high volume') || text.includes('millions'),
    scalability: text.includes('scale') || text.includes('scaling') || text.includes('grows'),
    
    // Security keywords
    encryption: text.includes('encrypt') || text.includes('kms') || text.includes('secure'),
    compliance: text.includes('compliance') || text.includes('audit') || text.includes('regulation'),
    access_control: text.includes('access control') || text.includes('permissions') || text.includes('iam'),
    
    // Operational keywords
    automation: text.includes('automat') || text.includes('schedule') || text.includes('trigger'),
    monitoring: text.includes('monitor') || text.includes('alert') || text.includes('cloudwatch'),
    backup: text.includes('backup') || text.includes('restore') || text.includes('snapshot'),
    
    // Architecture keywords
    multiregion: text.includes('multi-region') || text.includes('multiple regions') || text.includes('global'),
    multiaz: text.includes('multi-az') || text.includes('multiple az') || text.includes('availability'),
    serverless: text.includes('serverless') || text.includes('lambda') || text.includes('fargate'),
    
    // Data keywords
    realtime: text.includes('real-time') || text.includes('real time') || text.includes('streaming'),
    analytics: text.includes('analytics') || text.includes('query') || text.includes('analysis'),
    storage: text.includes('storage') || text.includes('store') || text.includes('persist'),
  };
  
  return Object.entries(keywords).filter(([_, value]) => value).map(([key, _]) => key);
}

function generateSpecificMemorize(question, correctAnswer, services, domain) {
  const keywords = extractKeywords(question, correctAnswer, services);
  
  // Build specific memorize based on services and context
  const primaryService = services[0] || 'AWS';
  const secondaryServices = services.slice(1, 3).join(' + ');
  
  let memorize = '';
  
  // Cost-optimized patterns
  if (domain.includes('Cost')) {
    if (services.includes('Lambda') && keywords.includes('cost')) {
      memorize = 'Lambda charges only for execution time (per-ms billing). Ideal for infrequent or short workloads vs always-on EC2.';
    } else if (services.includes('S3 Lifecycle') || services.includes('S3 Intelligent-Tiering')) {
      memorize = 'S3 Lifecycle automates transitions to cheaper storage classes. Intelligent-Tiering adapts based on access patterns.';
    } else if (services.includes('Spot Instances') || services.includes('Spot Fleet')) {
      memorize = 'Spot Instances offer up to 90% discount for fault-tolerant, interruptible workloads vs On-Demand pricing.';
    } else if (services.includes('Savings Plan') || services.includes('Reserved Instances')) {
      memorize = 'Savings Plans provide flexible commitment discounts (1-3 years) across EC2, Lambda, Fargate with automatic optimization.';
    } else if (services.includes('Auto Scaling')) {
      memorize = `Auto Scaling adjusts capacity to match demand. Pay only for what you use vs over-provisioned fixed capacity.`;
    } else {
      memorize = `${primaryService} reduces costs through ${keywords.includes('automation') ? 'automation' : keywords.includes('serverless') ? 'serverless pay-per-use' : 'efficient resource utilization'}.`;
    }
  }
  
  // Security patterns
  else if (domain.includes('Secure')) {
    if (services.includes('KMS') || keywords.includes('encryption')) {
      memorize = 'KMS manages encryption keys with automatic rotation. Encrypt data at-rest (S3, EBS, RDS) and in-transit (TLS).';
    } else if (services.includes('IAM') && keywords.includes('access_control')) {
      memorize = 'IAM roles grant temporary credentials. Use least-privilege policies and avoid long-term access keys.';
    } else if (services.includes('Secrets Manager')) {
      memorize = 'Secrets Manager stores credentials with automatic rotation. Integrates with RDS, Redshift, DocumentDB for password lifecycle.';
    } else if (services.includes('CloudTrail') || keywords.includes('compliance')) {
      memorize = 'CloudTrail logs all API calls for audit trails. Enable for all regions and protect logs with S3 MFA Delete.';
    } else if (services.includes('WAF') || services.includes('Shield')) {
      memorize = 'WAF filters malicious traffic with rules. Shield Standard (free) protects against DDoS. Shield Advanced adds 24/7 support.';
    } else if (services.includes('VPC') && keywords.includes('access_control')) {
      memorize = 'Security Groups are stateful (return traffic allowed). NACLs are stateless (explicit allow/deny for both directions).';
    } else {
      memorize = `${primaryService} enhances security through ${keywords.includes('encryption') ? 'encryption and key management' : keywords.includes('compliance') ? 'audit logging and compliance' : 'access controls and policies'}.`;
    }
  }
  
  // Performance patterns
  else if (domain.includes('Performance') || domain.includes('High-Performing')) {
    if (services.includes('CloudFront') || keywords.includes('latency')) {
      memorize = 'CloudFront caches content at 400+ edge locations globally. Reduces latency by serving from nearest location to users.';
    } else if (services.includes('ElastiCache') || services.includes('DAX')) {
      memorize = 'ElastiCache (Redis/Memcached) provides sub-millisecond latency. DAX is DynamoDB-optimized in-memory cache.';
    } else if (services.includes('Aurora')) {
      memorize = 'Aurora auto-scales storage up to 128TB. Provides up to 15 read replicas with <30 second automated failover.';
    } else if (services.includes('EBS') && keywords.includes('throughput')) {
      memorize = 'EBS io2 Block Express provides up to 256,000 IOPS and 4,000 MB/s throughput. Use for high-performance databases.';
    } else if (services.includes('Global Accelerator')) {
      memorize = 'Global Accelerator routes via AWS backbone using static anycast IPs. Improves performance by up to 60% vs internet routing.';
    } else {
      memorize = `${primaryService} optimizes performance through ${keywords.includes('latency') ? 'caching and edge delivery' : keywords.includes('scalability') ? 'auto-scaling and elasticity' : 'optimized data access patterns'}.`;
    }
  }
  
  // Resilient patterns
  else if (domain.includes('Resilient')) {
    if (services.includes('Route 53') && (keywords.includes('multiregion') || keywords.includes('multiaz'))) {
      memorize = 'Route 53 health checks with failover routing. Automatically routes traffic away from unhealthy endpoints.';
    } else if (services.includes('RDS Multi-AZ') || services.includes('Aurora')) {
      memorize = 'RDS Multi-AZ synchronously replicates to standby in different AZ. Automated failover in 60-120 seconds.';
    } else if (services.includes('S3') && keywords.includes('backup')) {
      memorize = 'S3 provides 99.999999999% (11 nines) durability. Cross-Region Replication for disaster recovery.';
    } else if (services.includes('DynamoDB') && keywords.includes('multiregion')) {
      memorize = 'DynamoDB Global Tables provide multi-region active-active replication. Sub-second replication latency.';
    } else if (services.includes('Auto Scaling')) {
      memorize = 'Auto Scaling distributes instances across multiple AZs. Automatically replaces unhealthy instances.';
    } else {
      memorize = `${primaryService} ensures availability through ${keywords.includes('multiaz') ? 'multi-AZ deployment' : keywords.includes('backup') ? 'automated backups and recovery' : 'fault-tolerant architecture'}.`;
    }
  }
  
  // Operational Excellence patterns
  else {
    if (services.includes('CloudFormation') || services.includes('CDK')) {
      memorize = 'CloudFormation automates infrastructure provisioning with JSON/YAML templates. CDK uses programming languages.';
    } else if (services.includes('Systems Manager')) {
      memorize = 'Systems Manager Session Manager provides shell access without SSH keys or bastion hosts. Logs all sessions.';
    } else if (services.includes('EventBridge') || keywords.includes('automation')) {
      memorize = 'EventBridge routes events to targets with filtering rules. Integrates AWS services, SaaS apps, custom applications.';
    } else if (services.includes('Lambda') && keywords.includes('automation')) {
      memorize = 'Lambda executes code in response to events. No servers to manage. Scales automatically from zero to thousands.';
    } else {
      memorize = `${primaryService} reduces operational overhead through ${keywords.includes('automation') ? 'event-driven automation' : keywords.includes('monitoring') ? 'centralized monitoring and alerting' : 'managed infrastructure'}.`;
    }
  }
  
  // Ensure memorize is not too short
  if (memorize.length < 60) {
    memorize += ` Works with ${secondaryServices || 'other AWS services'} for complete solution.`;
  }
  
  return memorize;
}

let fixedCount = 0;

data.forEach((q, idx) => {
  if (!q.explanation?.memorize) return;
  
  const memorize = q.explanation.memorize;
  
  if (isGenericMemorize(memorize)) {
    const optionsObj = q.options || q.answers || {};
    const correctAnswer = optionsObj[q.correct_answer] || '';
    const services = q.explanation?.services || [];
    const domain = q.domain || '';
    
    const newMemorize = generateSpecificMemorize(q.question, correctAnswer, services, domain);
    
    if (newMemorize !== memorize) {
      q.explanation.memorize = newMemorize;
      fixedCount++;
      
      console.log(`\n[Q${q.question_id}] Fixed memorize:`);
      console.log(`OLD: ${memorize}`);
      console.log(`NEW: ${newMemorize}`);
    }
  }
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Fixed ${fixedCount} generic memorize explanations`);
console.log(`${'='.repeat(60)}`);
