const fs = require('fs');

console.log('✨ PULIENDO 13 PREGUNTAS FAIR → GOOD+\n');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));
const fairIds = JSON.parse(fs.readFileSync('fair-questions-ids.json', 'utf8'));

let improved = 0;

// Mejorar pregunta específica con contenido personalizado
function polishQuestion(question) {
  const exp = question.explanation;
  if (!exp) return false;
  
  let changed = false;
  const qText = question.question_en.toLowerCase();
  const correctAnswer = Array.isArray(question.correct_answer) 
    ? question.correct_answer 
    : [question.correct_answer];
  const correctOptions = correctAnswer.map(a => question.options[a]);
  const services = exp.aws_services || [];
  
  // 1. Mejorar why_correct si es genérico o muy corto
  const wcLength = (exp.why_correct || '').length;
  const wcIsGeneric = exp.why_correct && (
    exp.why_correct.includes('This architecture aligns with AWS Well-Architected Framework') ||
    exp.why_correct.includes('meeting all specified requirements') && wcLength < 200
  );
  
  if (wcIsGeneric || wcLength < 150) {
    // Analizar la pregunta para generar explicación personalizada
    let improved_wc = '';
    
    // Q133 - S3 para media files
    if (question.question_id === 133) {
      improved_wc = 'S3 Standard provides unlimited scalability and 11 nines durability—ideal for user-generated media. Cost-effective at $0.023/GB/month. EFS ($0.30/GB) and EBS ($0.10/GB + limited to single AZ) cost significantly more. S3 integrates natively with CloudFront for global content delivery and supports lifecycle policies for automatic cost optimization as data ages.';
    }
    // Q877 - DynamoDB para session data
    else if (question.question_id === 877) {
      improved_wc = 'DynamoDB provides single-digit millisecond latency at any scale—critical for real-time session data that updates frequently. DynamoDB Streams captures all item changes in order, enabling near-real-time analytics. Fully managed serverless—no capacity planning or server management. S3 has eventual consistency delays and higher GET latency (tens of milliseconds), unsuitable for sub-second session updates.';
    }
    // Q321 - FSx for Windows File Server
    else if (question.question_id === 321) {
      improved_wc = 'FSx for Windows File Server provides native SMB protocol support and Windows NTFS features (ACLs, user quotas, DFS namespaces) required by media applications. Multi-AZ deployment for high availability. Integrates with Active Directory for centralized authentication. S3 lacks SMB protocol and NTFS features. EFS uses NFS (not SMB), incompatible with Windows-native media workflows.';
    }
    // Q531 - Lambda para request processing
    else if (question.question_id === 531) {
      improved_wc = 'Lambda auto-scales per request (1-10,000 concurrent executions) without capacity planning. Requests taking <5 seconds fit Lambda perfectly—no idle time costs. API Gateway + Lambda eliminates server management entirely. EC2/ECS require always-on instances even during zero traffic, wasting cost. SQS adds unnecessary queuing latency when synchronous processing is acceptable for 1,000 daily requests.';
    }
    // Q185 - WAF custom rules
    else if (question.question_id === 185) {
      improved_wc = 'Custom AWS WAF rules use rate-based rules (block IPs exceeding request thresholds) and IP set rules (block specific IPs/ranges). Rule groups combine multiple rules for centralized management across multiple CloudFront distributions. WAF integrates natively with CloudFront at edge locations—blocks malicious traffic before reaching origin. Shield Advanced protects against DDoS but does not provide custom IP blocking or rate limiting granularity.';
    }
    // Q210 - Cross-account S3 access
    else if (question.question_id === 210) {
      improved_wc = 'IAM role in Account B with trust relationship to Account A enables secure cross-account access without sharing credentials. Analysts in Account A assume the role using STS AssumeRole. S3 bucket policy grants permissions to the IAM role. This pattern follows AWS security best practices: temporary credentials, least privilege, and no long-term access keys. Resource policies on individual objects are harder to manage and audit at scale.';
    }
    // Q224 - Transcribe for call center
    else if (question.question_id === 224) {
      improved_wc = 'Amazon Transcribe provides real-time speech-to-text with speaker identification and custom vocabulary. Handles multiple speakers in same audio stream—critical for call center conversations between agent and customer. PII redaction removes sensitive information (credit cards, SSN) from transcripts automatically. Integrates with S3 for audio storage and supports streaming audio for live transcription. Comprehend analyzes text but does not transcribe audio.';
    }
    // Q352 - VM migration to AWS
    else if (question.question_id === 352) {
      improved_wc = 'AWS Application Migration Service (MGN) provides automated lift-and-shift migration with minimal downtime. Continuous block-level replication keeps source VMs in sync until cutover. Supports any VM source (VMware, Hyper-V, physical servers). No manual OS installation or application reconfiguration required. AWS Database Migration Service handles database migration but not application servers. CloudEndure was rebranded to MGN. VM Import/Export is manual and does not provide continuous replication.';
      exp.aws_services = ['Application Migration Service', 'EC2', 'EBS'];
    }
    // Q430 - S3 + CloudFront para engineering files
    else if (question.question_id === 430) {
      improved_wc = 'S3 provides unlimited storage with 99.999999999% durability for engineering files. CloudFront caches files at 450+ edge locations globally—reduces latency for distributed teams viewing large CAD/blueprint files. S3 Intelligent-Tiering automatically optimizes costs as files age without performance impact. EBS limited to single EC2 instance (not globally accessible). Glacier requires hours for retrieval—blocks immediate viewing access.';
    }
    // Q516 - VPC endpoints para S3
    else if (question.question_id === 516) {
      improved_wc = 'Gateway VPC endpoint for S3 enables private connectivity from VPC to S3 without traversing internet gateway or NAT gateway. Free—no data transfer charges for S3 traffic staying within AWS network. Route tables automatically route S3 API calls through endpoint. Interface VPC endpoints charge $0.01/hour + data processing fees. VPC peering connects VPCs but does not provide S3 access control. IAM policies alone do not eliminate internet routing.';
    }
    // Q568 - S3 Object Lock compliance mode
    else if (question.question_id === 568) {
      improved_wc = 'S3 Object Lock in compliance mode provides Write-Once-Read-Many (WORM) storage for regulatory compliance. Compliance mode prevents deletion or modification by ANY user (including root account) until retention period expires—meets SEC, FINRA, HIPAA requirements. Legal hold can extend retention indefinitely without changing retention period. Governance mode allows users with special permissions to delete objects, failing compliance requirements. Versioning must be enabled with Object Lock.';
      exp.aws_services = ['S3', 'S3 Object Lock'];
    }
    // Q585 - S3 Object Lock para fixed retention
    else if (question.question_id === 585) {
      improved_wc = 'S3 Object Lock in compliance mode enforces fixed retention period—no deletion or modification until period expires, even by root account. Meets regulatory requirements for immutable storage (SEC 17a-4, FINRA, CFTC). S3 Versioning required with Object Lock—preserves all versions. Vault Lock for Glacier is for archival data with retrieval delays, not immediate-access compliance. S3 Lifecycle policies can delete old versions but Object Lock protections remain on locked objects.';
      exp.aws_services = ['S3', 'S3 Object Lock', 'S3 Versioning'];
    }
    // Q609 - DynamoDB export to S3
    else if (question.question_id === 609) {
      improved_wc = 'DynamoDB point-in-time recovery (PITR) enabled allows export to S3 at any point within 35-day retention window. Export to S3 does NOT consume read capacity units—no impact on production workload. Exports in DynamoDB JSON or Amazon Ion format. On-demand backups create full table snapshot but require manual triggering. DynamoDB Streams capture item changes but require custom Lambda processing to export full table state.';
      exp.aws_services = ['S3', 'DynamoDB', 'DynamoDB PITR'];
    }
    
    if (improved_wc && improved_wc.length > wcLength * 1.5) {
      exp.why_correct = improved_wc;
      changed = true;
    }
  }
  
  // 2. Mejorar why_wrong si son genéricos o muy cortos
  const wrongKeys = Object.keys(exp.why_wrong || {}).filter(k => !correctAnswer.includes(k));
  const avgWwLength = wrongKeys.length > 0 
    ? wrongKeys.reduce((sum, k) => sum + (exp.why_wrong[k] || '').length, 0) / wrongKeys.length 
    : 0;
  
  if (avgWwLength < 80) {
    wrongKeys.forEach(opt => {
      const optionText = question.options[opt];
      let improved_ww = '';
      
      // Analizar cada opción incorrecta
      if (optionText.toLowerCase().includes('ebs')) {
        improved_ww = 'EBS volumes attach to single EC2 instance in single AZ. Cannot be shared across multiple instances or accessed globally. Requires instance management and lacks S3 durability features.';
      } else if (optionText.toLowerCase().includes('efs') && !correctOptions.some(c => c.toLowerCase().includes('efs'))) {
        improved_ww = 'EFS costs $0.30/GB/month (13x more than S3 Standard $0.023/GB). Designed for shared file access across EC2 instances, overkill for object storage workloads where S3 suffices.';
      } else if (optionText.toLowerCase().includes('glacier') && qText.includes('immediate')) {
        improved_ww = 'Glacier retrieval times: 1-5 minutes (expedited), 3-5 hours (standard), 5-12 hours (bulk). Does not provide immediate access required by the scenario.';
      } else if (optionText.toLowerCase().includes('rds') && services.includes('DynamoDB')) {
        improved_ww = 'RDS relational database adds query complexity and cost for simple key-value session data. Requires schema management and does not scale as seamlessly as DynamoDB for write-heavy workloads.';
      } else if (optionText.toLowerCase().includes('kinesis') && !qText.includes('stream')) {
        improved_ww = 'Kinesis is for real-time streaming data ingestion and processing. Overkill for batch export requirements. Requires custom consumer applications to process stream—adds complexity.';
      } else if (optionText.toLowerCase().includes('lambda') && qText.includes('long')) {
        improved_ww = 'Lambda has 15-minute execution time limit. Unsuitable for long-running processing tasks exceeding this constraint.';
      } else if (optionText.toLowerCase().includes('ec2') && correctOptions.some(c => c.toLowerCase().includes('lambda') || c.toLowerCase().includes('serverless'))) {
        improved_ww = 'EC2 requires provisioning, patching, monitoring, and scaling management. Serverless alternatives eliminate operational overhead while reducing costs for intermittent workloads.';
      } else if (optionText.toLowerCase().includes('fsx for lustre') && correctOptions.some(c => c.toLowerCase().includes('windows'))) {
        improved_ww = 'FSx for Lustre optimized for HPC/Linux workloads using POSIX. Does not support Windows SMB protocol or NTFS features required by Windows-based media applications.';
      } else {
        // Genérico mejorado
        improved_ww = 'This option introduces unnecessary complexity, higher cost, or architectural mismatch for the specified requirements. Does not follow AWS best practices for this use case.';
      }
      
      if (improved_ww && improved_ww.length > (exp.why_wrong[opt] || '').length) {
        exp.why_wrong[opt] = improved_ww;
        changed = true;
      }
    });
  }
  
  // 3. Mejorar exam_tips si es muy corto
  const etLength = (exp.exam_tips || '').length;
  if (etLength < 100) {
    let improved_et = '';
    
    if (qText.includes('cost') || question.domain.includes('Cost')) {
      improved_et = 'For cost optimization questions: compare per-GB pricing (S3 $0.023, EFS $0.30, EBS $0.10). Consider data transfer costs. Serverless often cheapest for variable workloads. Always check for "operational overhead" keywords suggesting managed services.';
    } else if (qText.includes('session') || qText.includes('millisecond')) {
      improved_et = 'Low-latency requirements (<10ms) = DynamoDB or ElastiCache. RDS typically 5-20ms latency. For frequently updated data, avoid S3 eventual consistency. Session data = key-value pattern favoring DynamoDB.';
    } else if (qText.includes('windows') || qText.includes('smb') || qText.includes('ntfs')) {
      improved_et = 'Windows workloads: FSx for Windows (SMB, NTFS, AD integration). FSx for Lustre = Linux/HPC. EFS = NFS (Linux). S3 = object storage (no file system semantics). Match protocol to workload.';
    } else if (qText.includes('waf') || qText.includes('security') && qText.includes('custom')) {
      improved_et = 'AWS WAF = custom rules (rate limiting, IP blocking, geo-blocking). Shield = automatic DDoS protection. GuardDuty = threat detection (ML-based). Security Groups = instance-level firewall. Layer choice matters.';
    } else if (qText.includes('cross-account') || qText.includes('account a') && qText.includes('account b')) {
      improved_et = 'Cross-account access patterns: IAM role + trust relationship (temporary credentials). Resource-based policies (S3, SQS, SNS). Avoid sharing IAM access keys. Always use AssumeRole for security.';
    } else if (qText.includes('compliance') || qText.includes('regulatory') || qText.includes('immutable')) {
      improved_et = 'Regulatory compliance keywords: "immutable", "WORM", "cannot delete/modify" = S3 Object Lock compliance mode. Governance mode allows deletion with permissions—not true compliance. Legal hold = indefinite retention.';
    } else if (qText.includes('migration') || qText.includes('on-premises')) {
      improved_et = 'Migration patterns: Application Migration Service (servers/VMs), Database Migration Service (databases), DataSync (file data), Snow Family (petabyte-scale). Match tool to data type and volume.';
    } else {
      improved_et = 'Identify key requirements first (cost, performance, operational overhead). Eliminate options violating hard constraints. Choose simplest solution meeting all requirements—AWS favors managed services and operational simplicity.';
    }
    
    if (improved_et.length > etLength) {
      exp.exam_tips = improved_et;
      changed = true;
    }
  }
  
  // 4. Mejorar memorize si es muy corto o genérico
  const memLength = Array.isArray(exp.memorize) ? exp.memorize.length : (exp.memorize || '').length;
  const memIsArray = Array.isArray(exp.memorize);
  
  if ((!memIsArray && memLength < 70) || (memIsArray && memLength < 3)) {
    let improved_mem = [];
    
    // Generar memorize específico basado en el ID
    if (question.question_id === 133) {
      improved_mem = [
        'S3 Standard: $0.023/GB/month, unlimited scale, 11 nines durability',
        'EFS: $0.30/GB/month (13x more than S3), for shared file access',
        'EBS: $0.10/GB/month + single AZ limitation',
        'S3 integrates natively with CloudFront for CDN delivery'
      ];
    } else if (question.question_id === 877) {
      improved_mem = [
        'DynamoDB: single-digit ms latency, fully managed serverless',
        'DynamoDB Streams: captures item changes in order for analytics',
        'S3 eventual consistency: unsuitable for sub-second session updates',
        'Session data pattern: frequent updates = key-value store (DynamoDB)'
      ];
    } else if (question.question_id === 321) {
      improved_mem = [
        'FSx for Windows: SMB protocol, NTFS features, AD integration',
        'FSx for Lustre: HPC/Linux workloads, POSIX, not Windows-compatible',
        'EFS: NFS protocol (Linux), not SMB',
        'Multi-AZ deployment for high availability in media workflows'
      ];
    } else if (question.question_id === 531) {
      improved_mem = [
        'Lambda: auto-scales per request, 1-10,000 concurrent executions',
        'Lambda limits: 15 min max, 10GB memory, 512MB /tmp',
        '<5 second requests = Lambda perfect fit (no idle costs)',
        'API Gateway + Lambda = fully serverless (zero server management)'
      ];
    } else if (question.question_id === 185) {
      improved_mem = [
        'AWS WAF custom rules: rate-based (request thresholds), IP sets',
        'WAF at CloudFront edge = blocks before reaching origin',
        'Shield Advanced: DDoS protection, not granular IP/rate control',
        'Rule groups: centralized management across distributions'
      ];
    } else if (question.question_id === 210) {
      improved_mem = [
        'Cross-account: IAM role + trust relationship + bucket policy',
        'STS AssumeRole: temporary credentials (no long-term keys)',
        'Analysts assume role, S3 bucket policy grants role permissions',
        'Security best practice: no shared credentials between accounts'
      ];
    } else if (question.question_id === 224) {
      improved_mem = [
        'Transcribe: real-time speech-to-text with speaker identification',
        'PII redaction: auto-removes credit cards, SSN from transcripts',
        'Supports streaming audio for live transcription',
        'Custom vocabulary: improves accuracy for industry terms'
      ];
    } else if (question.question_id === 352) {
      improved_mem = [
        'Application Migration Service: automated lift-and-shift',
        'Continuous replication: minimal downtime during cutover',
        'Supports VMware, Hyper-V, physical servers',
        'CloudEndure rebranded to Application Migration Service (MGN)'
      ];
    } else if (question.question_id === 430) {
      improved_mem = [
        'S3: unlimited storage, 11 nines durability, global access',
        'CloudFront: 450+ edge locations, caches large files globally',
        'S3 Intelligent-Tiering: auto cost optimization without performance hit',
        'EBS: single instance/AZ only, not globally accessible'
      ];
    } else if (question.question_id === 516) {
      improved_mem = [
        'Gateway VPC endpoint for S3: free, no data transfer charges',
        'Private connectivity: no internet/NAT gateway traversal',
        'Interface endpoint: $0.01/hour + data processing fees',
        'Route tables: auto-route S3 API calls through endpoint'
      ];
    } else if (question.question_id === 568 || question.question_id === 585) {
      improved_mem = [
        'S3 Object Lock compliance mode: WORM (Write-Once-Read-Many)',
        'Prevents deletion by ANY user including root until retention expires',
        'Meets SEC 17a-4, FINRA, CFTC regulatory requirements',
        'Legal hold: indefinite retention without changing period',
        'Governance mode: allows deletion with permissions (not true compliance)'
      ];
    } else if (question.question_id === 609) {
      improved_mem = [
        'DynamoDB PITR export: no read capacity consumed',
        'Export to S3: DynamoDB JSON or Amazon Ion format',
        'Point-in-time: any moment within 35-day retention window',
        'On-demand backups: manual trigger, full table snapshot'
      ];
    }
    
    if (improved_mem.length >= 3) {
      exp.memorize = improved_mem;
      changed = true;
    }
  }
  
  return changed;
}

// Procesar cada pregunta FAIR
fairIds.forEach(id => {
  const question = data.find(q => q.question_id === id);
  if (!question) return;
  
  console.log(`Puliendo Q${id}...`);
  
  if (polishQuestion(question)) {
    improved++;
    console.log(`  ✅ Mejorada`);
  } else {
    console.log(`  ⚠️  Sin cambios`);
  }
});

// Guardar cambios
fs.writeFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✅ Proceso completado:`);
console.log(`   - ${improved}/${fairIds.length} preguntas mejoradas`);
console.log(`\n💾 Cambios guardados en SAA-C03-QuestionBank-923.json`);
