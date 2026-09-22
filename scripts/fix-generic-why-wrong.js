const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Patterns to detect generic why_wrong
const genericPatterns = [
  /doesn't (meet|address|fulfill|satisfy) (the|all|specific) (requirements?|criteria|needs)/i,
  /not (as )?cost[- ]effective/i,
  /doesn't provide (the same level of|sufficient)/i,
  /introduces (unnecessary )?complexity/i,
  /more expensive (than|without)/i,
  /increases operational overhead/i,
  /doesn't align with (the )?requirements?/i,
  /not (the )?best (approach|solution|option)/i,
  /suboptimal (for|compared)/i,
  /less efficient (than)?/i
];

// Service-specific why_wrong explanations
const serviceSpecificReasons = {
  'EC2': {
    'Lambda': 'EC2 requires provisioning, patching, and capacity planning. You pay for running instances even during idle time.',
    'Fargate': 'EC2 requires managing host instances, security patches, and capacity planning. ECS on Fargate removes this overhead.',
    'RDS': 'EC2 databases require manual backups, patching, replication setup, and failover configuration.',
    'S3': 'EC2 storage lacks native replication, versioning, and lifecycle management that S3 provides natively.',
    'Auto Scaling': 'Without Auto Scaling, EC2 cannot automatically adjust capacity based on demand patterns.'
  },
  'Lambda': {
    'EC2': 'Lambda has 15-minute execution limit. Long-running workloads need EC2.',
    'Step Functions': 'Lambda alone cannot orchestrate multi-step workflows with error handling and retries.',
    'ECS': 'Lambda has package size limits (50MB zipped, 250MB unzipped). Containerized workloads need ECS.',
    'Batch': 'Lambda is not designed for batch jobs requiring GPU, HPC, or jobs longer than 15 minutes.'
  },
  'RDS': {
    'Aurora': 'Standard RDS lacks Aurora\'s fast automated failover (< 30 seconds) and up to 15 read replicas.',
    'DynamoDB': 'RDS requires capacity planning and does not scale automatically like DynamoDB for unpredictable workloads.',
    'Redshift': 'RDS is optimized for OLTP, not OLAP. Complex analytics queries on large datasets need Redshift.',
    'DocumentDB': 'RDS cannot handle MongoDB workloads or document model queries.'
  },
  'Aurora': {
    'DynamoDB': 'Aurora requires provisioned capacity planning. DynamoDB auto-scales to handle unpredictable traffic spikes.',
    'RDS Multi-AZ': 'Aurora Serverless v2 auto-scales capacity. Standard RDS Multi-AZ requires manual instance sizing.',
  },
  'DynamoDB': {
    'RDS': 'DynamoDB cannot handle complex joins, transactions across tables, or SQL analytics queries.',
    'Aurora': 'DynamoDB lacks ACID transactions across multiple tables and complex relational queries.',
    'ElastiCache': 'DynamoDB provides millisecond latency but not sub-millisecond latency that ElastiCache Redis delivers.'
  },
  'S3': {
    'EBS': 'S3 requires application changes to use object API instead of file system operations.',
    'EFS': 'S3 does not support concurrent file locking or POSIX semantics required by traditional applications.',
    'Glacier': 'S3 Standard provides immediate access. Glacier has retrieval delays (minutes to hours).'
  },
  'CloudFront': {
    'ALB': 'CloudFront caches at edge locations globally. ALB does not cache content or reduce origin load.',
    'Route 53': 'CloudFront caches content at edges. Route 53 only provides DNS resolution without caching.',
  },
  'ALB': {
    'CloudFront': 'ALB operates at regional level. CloudFront provides global edge caching and DDoS protection.',
    'NLB': 'ALB operates at Layer 7 (HTTP/HTTPS). NLB needed for TCP/UDP traffic or static IP requirements.',
    'API Gateway': 'ALB lacks built-in request throttling, API key management, and usage plans that API Gateway provides.'
  },
  'NLB': {
    'ALB': 'NLB operates at Layer 4, cannot route based on HTTP headers, paths, or hostnames.',
    'CloudFront': 'NLB is regional and does not cache content. CloudFront provides global edge caching.'
  },
  'ElastiCache': {
    'DynamoDB': 'ElastiCache data is not persistent. Cache failures result in data loss without a backing store.',
    'RDS': 'ElastiCache provides sub-millisecond latency but loses data on node failures without persistence.'
  },
  'SQS': {
    'Kinesis': 'SQS Standard cannot maintain message order. Kinesis preserves order within a shard.',
    'SNS': 'SQS is pull-based. SNS push-based fanout to multiple subscribers is more efficient for broadcasting.',
    'EventBridge': 'SQS lacks event filtering and routing rules that EventBridge provides.'
  },
  'SNS': {
    'SQS': 'SNS does not queue messages. Messages are lost if subscribers are unavailable.',
    'EventBridge': 'SNS lacks advanced filtering, schema registry, and event replay that EventBridge offers.'
  },
  'Kinesis': {
    'SQS': 'Kinesis requires shard capacity planning and management. SQS auto-scales without provisioning.',
    'MSK': 'Kinesis Data Streams has 7-day maximum retention. MSK supports unlimited retention with S3 tiering.'
  },
  'CloudWatch': {
    'X-Ray': 'CloudWatch metrics cannot trace requests across distributed services. X-Ray provides end-to-end tracing.',
    'CloudTrail': 'CloudWatch monitors metrics. CloudTrail logs API calls for compliance and auditing.',
    'ElastiCache': 'CloudWatch does not reduce latency. ElastiCache provides sub-millisecond data access.'
  },
  'CloudTrail': {
    'CloudWatch': 'CloudTrail logs API calls. CloudWatch Logs needed for application logs from EC2, Lambda, containers.',
    'Config': 'CloudTrail tracks who made changes. Config tracks resource configuration state over time.'
  },
  'VPC': {
    'PrivateLink': 'VPC Peering exposes entire VPC CIDR. PrivateLink exposes only specific services via endpoints.',
    'Transit Gateway': 'VPC Peering does not support transitive routing. Transit Gateway acts as regional hub.'
  },
  'Direct Connect': {
    'VPN': 'Direct Connect takes weeks to provision. Site-to-Site VPN can be configured in minutes.',
    'PrivateLink': 'Direct Connect provides private connection to your VPC. PrivateLink needed for AWS services access.'
  },
  'Step Functions': {
    'Lambda': 'Step Functions adds latency and cost per state transition. Simple workflows run faster in single Lambda.',
    'SQS': 'Step Functions charges per state transition. SQS queues are cheaper for simple task distribution.'
  },
  'API Gateway': {
    'ALB': 'API Gateway costs more per request than ALB. ALB is cheaper for high-traffic internal APIs.',
    'AppSync': 'API Gateway REST does not support GraphQL queries, subscriptions, or real-time updates.'
  },
  'Route 53': {
    'CloudFront': 'Route 53 provides DNS resolution. CloudFront needed to cache content and reduce origin load.',
    'Global Accelerator': 'Route 53 DNS-based routing has TTL delays. Global Accelerator provides instant failover with static IPs.'
  },
  'CloudFormation': {
    'CDK': 'CloudFormation templates are verbose JSON/YAML. CDK allows programming languages for better reusability.',
    'Terraform': 'CloudFormation is AWS-only. Multi-cloud environments need Terraform or other IaC tools.'
  },
  'ECS': {
    'Lambda': 'ECS requires managing task definitions, clusters, and scaling policies. Lambda simplifies to just code.',
    'EKS': 'ECS uses AWS-native orchestration. Kubernetes workloads or multi-cloud portability need EKS.',
    'Fargate': 'ECS on EC2 launch type requires managing host instances. Fargate removes this operational overhead.'
  },
  'EKS': {
    'ECS': 'EKS has higher cost and complexity than ECS. Use EKS only when Kubernetes features are required.',
    'Lambda': 'EKS requires Kubernetes expertise, cluster management, and higher costs than Lambda.'
  },
  'Systems Manager': {
    'Lambda': 'Systems Manager Session Manager provides interactive shell access. Lambda cannot provide terminal sessions.',
    'CloudWatch': 'Systems Manager Parameter Store is for configuration. CloudWatch is for metrics and logs.'
  },
  'Secrets Manager': {
    'Parameter Store': 'Secrets Manager costs more than Parameter Store. Use Parameter Store for non-sensitive configuration.',
    'KMS': 'Secrets Manager stores and rotates secrets. KMS only encrypts data, does not store credentials.'
  },
  'CodeDeploy': {
    'CodePipeline': 'CodeDeploy only handles deployment. CodePipeline orchestrates full CI/CD including build and test.',
    'CloudFormation': 'CodeDeploy deploys application code. CloudFormation provisions infrastructure resources.'
  },
  'Elastic Beanstalk': {
    'ECS': 'Elastic Beanstalk provides less control over infrastructure. ECS offers fine-grained container orchestration.',
    'Lambda': 'Elastic Beanstalk manages long-running applications. Lambda is for event-driven, short-lived functions.'
  },
  'Redshift': {
    'RDS': 'Redshift is for OLAP analytics on petabyte-scale data. RDS is optimized for OLTP transactional workloads.',
    'Athena': 'Redshift requires provisioned clusters with ongoing costs. Athena charges only per query scanned.',
    'Aurora': 'Redshift uses columnar storage for analytics. Aurora row-based storage is optimized for transactional queries.'
  },
  'Athena': {
    'Redshift': 'Athena queries S3 directly with per-query cost. Redshift provides faster repeated queries on imported data.',
    'EMR': 'Athena is for SQL queries. EMR needed for Spark, Hadoop, or custom processing frameworks.'
  },
  'Glue': {
    'Lambda': 'Glue has 15-minute minimum runtime. Lambda is cheaper for ETL jobs completing in seconds.',
    'EMR': 'Glue is serverless with per-DPU pricing. EMR provides more control for complex Spark/Hadoop workloads.'
  },
  'EMR': {
    'Glue': 'EMR requires cluster management, sizing, and ongoing costs. Glue is serverless with pay-per-job pricing.',
    'Athena': 'EMR is for complex processing frameworks (Spark, Hadoop). Athena is simpler for SQL-only queries.'
  },
  'FSx': {
    'EFS': 'FSx for Windows provides SMB, NTFS, AD integration. EFS is NFS-only for Linux workloads.',
    'S3': 'FSx provides sub-millisecond file system latency. S3 API has higher latency for small file operations.'
  },
  'EFS': {
    'S3': 'EFS provides POSIX file system semantics. S3 requires application changes to use object API.',
    'FSx': 'EFS uses NFS protocol for Linux. Windows workloads need FSx with SMB protocol.'
  },
  'EBS': {
    'EFS': 'EBS volumes attach to single EC2 instance. EFS required for concurrent access from multiple instances.',
    'S3': 'EBS provides block storage for OS and databases. S3 object storage is for shared files and backups.',
    'Instance Store': 'EBS data persists if instance stops. Instance Store loses all data when instance stops.'
  },
  'Backup': {
    'S3': 'AWS Backup centralizes backup policies across services. S3 lifecycle policies only manage S3 objects.',
    'Snapshots': 'AWS Backup automates cross-region copy and retention. Manual snapshots require scripting.'
  },
  'DataSync': {
    'S3 Transfer Acceleration': 'DataSync is for ongoing scheduled transfers. Transfer Acceleration is for one-time uploads.',
    'DMS': 'DataSync transfers files. DMS migrates and replicates database contents.'
  },
  'Transfer Family': {
    'DataSync': 'Transfer Family provides SFTP/FTPS server endpoint. DataSync is for scheduled file transfers.',
    'S3': 'Transfer Family provides SFTP protocol compatibility. S3 API requires application changes.'
  },
  'Storage Gateway': {
    'DataSync': 'Storage Gateway provides ongoing cached access from on-premises. DataSync is for one-time or scheduled transfers.',
    'Direct Connect': 'Storage Gateway caches data locally. Direct Connect only provides network connection without caching.'
  }
};

function detectServices(question, correctAnswer, wrongAnswers) {
  const text = `${question} ${correctAnswer} ${wrongAnswers.join(' ')}`.toLowerCase();
  const services = [];
  
  const serviceKeywords = {
    'Lambda': ['lambda', 'serverless function'],
    'EC2': ['ec2', 'elastic compute'],
    'RDS': ['rds', 'relational database service'],
    'Aurora': ['aurora'],
    'DynamoDB': ['dynamodb'],
    'S3': ['s3', 'simple storage'],
    'EBS': ['ebs', 'elastic block store'],
    'EFS': ['efs', 'elastic file system'],
    'FSx': ['fsx'],
    'CloudFront': ['cloudfront'],
    'ALB': ['application load balancer', 'alb'],
    'NLB': ['network load balancer', 'nlb'],
    'ElastiCache': ['elasticache', 'redis', 'memcached'],
    'SQS': ['sqs', 'simple queue'],
    'SNS': ['sns', 'simple notification'],
    'Kinesis': ['kinesis'],
    'Step Functions': ['step functions'],
    'API Gateway': ['api gateway'],
    'Route 53': ['route 53', 'route53'],
    'CloudWatch': ['cloudwatch'],
    'CloudTrail': ['cloudtrail'],
    'VPC': ['vpc', 'virtual private cloud'],
    'Direct Connect': ['direct connect'],
    'PrivateLink': ['privatelink'],
    'ECS': ['ecs', 'elastic container service'],
    'EKS': ['eks', 'elastic kubernetes'],
    'Fargate': ['fargate'],
    'Redshift': ['redshift'],
    'Athena': ['athena'],
    'Glue': ['glue'],
    'EMR': ['emr', 'elastic mapreduce'],
    'Systems Manager': ['systems manager', 'session manager'],
    'Secrets Manager': ['secrets manager'],
    'Parameter Store': ['parameter store'],
    'CodeDeploy': ['codedeploy'],
    'CloudFormation': ['cloudformation'],
    'Elastic Beanstalk': ['elastic beanstalk', 'beanstalk'],
    'Backup': ['aws backup'],
    'DataSync': ['datasync'],
    'Transfer Family': ['transfer family'],
    'Storage Gateway': ['storage gateway']
  };
  
  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      services.push(service);
    }
  }
  
  return services;
}

function isGeneric(text) {
  if (!text || text.length < 50) return true;
  return genericPatterns.some(pattern => pattern.test(text));
}

function generateSpecificWhyWrong(wrongAnswer, correctAnswer, question, services) {
  // Extract services from wrong answer
  const wrongServices = detectServices(wrongAnswer, '', []);
  const correctServices = detectServices(correctAnswer, '', []);
  
  // Find primary wrong service
  let primaryWrong = wrongServices[0];
  let primaryCorrect = correctServices[0];
  
  // Try to find specific reason in serviceSpecificReasons
  if (primaryWrong && primaryCorrect && serviceSpecificReasons[primaryWrong]?.[primaryCorrect]) {
    return serviceSpecificReasons[primaryWrong][primaryCorrect];
  }
  
  // Fallback to general service limitations
  const serviceLimitations = {
    'EC2': 'Requires manual provisioning, patching, scaling configuration, and you pay for running instances even during idle periods.',
    'Lambda': 'Has 15-minute execution limit, 10GB memory maximum, and cold start latency for infrequent invocations.',
    'RDS': 'Requires capacity planning, does not auto-scale compute, and has limited read replica count (5 for most engines).',
    'Aurora': 'Requires provisioned capacity planning. Aurora Serverless v2 takes time to scale up during sudden traffic spikes.',
    'DynamoDB': 'Cannot perform complex joins, multi-table transactions, or SQL-style analytics queries efficiently.',
    'S3': 'Eventual consistency for overwrite PUTS and DELETES. No file locking or POSIX semantics for concurrent writes.',
    'CloudFront': 'Adds complexity for dynamic content. Cache invalidation takes time to propagate to all edge locations.',
    'ALB': 'Operates at regional level. Does not provide global load balancing or DDoS protection at edge.',
    'ElastiCache': 'In-memory storage loses data on node failures. Requires separate persistent store for durability.',
    'SQS': 'Standard queues do not guarantee message ordering. FIFO queues limited to 3,000 messages per second.',
    'SNS': 'Messages lost if subscriber unavailable. No built-in retry logic or dead-letter queue for failed deliveries.',
    'Kinesis': 'Requires shard management and capacity planning. Resharding causes temporary read/write capacity reduction.',
    'CloudWatch': 'Standard resolution is 1-minute intervals. High-resolution metrics (1-second) cost more.',
    'VPC': 'Peering connections do not support transitive routing. Each VPC peering must be explicitly configured.',
    'Step Functions': 'Adds latency (state transitions) and cost. 25,000 state transitions included in free tier then $0.025 per 1,000.',
    'API Gateway': 'Has 29-second timeout limit. Custom domain setup requires ACM certificate and DNS changes.',
    'Route 53': 'DNS changes depend on TTL values. Low TTL increases query costs but allows faster updates.',
    'ECS': 'Requires defining task definitions, services, and managing cluster capacity with EC2 launch type.',
    'EKS': 'Higher cost ($0.10/hour cluster fee) and complexity. Requires Kubernetes expertise for operation.',
    'Redshift': 'Requires provisioned clusters with ongoing costs. Queries compete for cluster resources during high usage.',
    'Athena': 'Charges per data scanned ($5 per TB). Repeated queries on same data cost more than Redshift cached results.',
    'Glue': 'Has 15-minute minimum billing duration per DPU. Apache Spark jobs may be slower than optimized EMR clusters.',
    'EFS': 'Higher per-GB cost than EBS or S3. Throughput scales with total storage size in Bursting mode.',
    'EBS': 'Attached to single EC2 instance in same AZ. Multi-Attach limited to Provisioned IOPS volumes and specific instance types.',
    'Secrets Manager': 'Costs $0.40 per secret per month plus $0.05 per 10,000 API calls. Parameter Store is free for standard parameters.'
  };
  
  if (primaryWrong && serviceLimitations[primaryWrong]) {
    return serviceLimitations[primaryWrong];
  }
  
  // Generic architectural reasons based on keywords
  if (wrongAnswer.toLowerCase().includes('on-premises') || wrongAnswer.toLowerCase().includes('on-premise')) {
    return 'On-premises solution requires upfront capital expense, physical space, power, cooling, and dedicated staff for maintenance.';
  }
  
  if (wrongAnswer.toLowerCase().includes('manual') || wrongAnswer.toLowerCase().includes('script')) {
    return 'Manual processes are error-prone, not scalable, and require human intervention which increases operational overhead.';
  }
  
  if (wrongAnswer.toLowerCase().includes('single') && wrongAnswer.toLowerCase().includes('az')) {
    return 'Single AZ deployment creates availability risk. AZ failure causes complete service outage until recovery.';
  }
  
  return 'This option does not meet the core requirements effectively compared to the correct solution.';
}

let fixedCount = 0;
let processedQuestions = [];

const questions = Array.isArray(data) ? data : data.questions;

questions.forEach((q, idx) => {
  if (!q.explanation?.why_wrong) return;
  
  let questionFixed = false;
  const whyWrong = q.explanation.why_wrong;
  
  // Handle both object format ({"A": "reason", "B": "reason"}) and array format
  const isObjectFormat = typeof whyWrong === 'object' && !Array.isArray(whyWrong);
  
  if (isObjectFormat) {
    // Object format: {"A": "reason", "B": "reason", "D": "reason"}
    Object.keys(whyWrong).forEach(key => {
      const reason = whyWrong[key];
      if (isGeneric(reason)) {
        const optionsObj = q.options || q.answers || {};
        const services = detectServices(
          q.question,
          optionsObj[q.correct_answer] || '',
          Object.values(optionsObj).filter((_, i) => String.fromCharCode(65 + i) !== q.correct_answer)
        );
        
        const wrongAnswer = optionsObj[key] || '';
        const correctAnswer = optionsObj[q.correct_answer] || '';
        
        const newReason = generateSpecificWhyWrong(wrongAnswer, correctAnswer, q.question, services);
        
        if (newReason !== reason) {
          whyWrong[key] = newReason;
          questionFixed = true;
          fixedCount++;
          
          console.log(`\n[Q${idx + 1}] Fixed why_wrong["${key}"]:`);
          console.log(`OLD: ${reason.substring(0, 100)}...`);
          console.log(`NEW: ${newReason.substring(0, 100)}...`);
        }
      }
    });
  } else if (Array.isArray(whyWrong)) {
    // Array format: ["reason1", "reason2", "reason3"]
    whyWrong.forEach((reason, wIdx) => {
      if (isGeneric(reason)) {
        const optionsObj = q.options || q.answers || {};
        const allOptions = Object.values(optionsObj);
        const services = detectServices(
          q.question,
          optionsObj[q.correct_answer] || '',
          allOptions.filter((_, i) => String.fromCharCode(65 + i) !== q.correct_answer)
        );
        
        const wrongOptions = allOptions.filter((_, i) => String.fromCharCode(65 + i) !== q.correct_answer);
        const wrongAnswer = wrongOptions[wIdx] || '';
        const correctAnswer = optionsObj[q.correct_answer] || '';
        
        const newReason = generateSpecificWhyWrong(wrongAnswer, correctAnswer, q.question, services);
        
        if (newReason !== reason) {
          whyWrong[wIdx] = newReason;
          questionFixed = true;
          fixedCount++;
          
          console.log(`\n[Q${idx + 1}] Fixed why_wrong[${wIdx}]:`);
          console.log(`OLD: ${reason.substring(0, 100)}...`);
          console.log(`NEW: ${newReason.substring(0, 100)}...`);
        }
      }
    });
  }
  
  if (questionFixed) {
    processedQuestions.push(idx + 1);
  }
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Fixed ${fixedCount} generic why_wrong explanations`);
console.log(`📝 Questions updated: ${processedQuestions.length}`);
console.log(`📍 Question IDs: ${processedQuestions.slice(0, 10).join(', ')}${processedQuestions.length > 10 ? '...' : ''}`);
console.log(`${'='.repeat(60)}`);
