#!/usr/bin/env node

/**
 * Question Enrichment Script
 * 
 * Enhances all 923 questions with missing explanation fields:
 * - why_correct: Detailed explanation of the correct answer
 * - why_wrong: Object with explanations for each incorrect option
 * - aws_services: Array of AWS services mentioned
 * - architectural_concept: Key architectural principle
 * - keywords: Important terms for search
 * - pattern: Common architecture pattern
 * - related_topics: Array of related concepts
 * - exam_tips: Specific tips for exam success
 * - memorize: Array of key points to remember
 * - difficulty_rating: 1-5 stars
 * 
 * Usage:
 *   node scripts/enrich-questions.js [--output OUTPUT_FILE] [--mode MODE]
 * 
 * Modes:
 *   - auto: Automatic enrichment from full_text parsing (default)
 *   - template: Creates template file for manual enrichment
 *   - merge: Merges manually enriched data back to original
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const QUESTIONS_FILE = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923.json');
const DEFAULT_OUTPUT = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923-enriched.json');
const TEMPLATE_OUTPUT = path.join(__dirname, '../app/src/data/questions-enrichment-template.json');

// AWS Services dictionary for auto-detection
const AWS_SERVICES = [
  'Lambda', 'S3', 'EC2', 'RDS', 'DynamoDB', 'CloudFront', 'Route 53',
  'EBS', 'EFS', 'FSx', 'VPC', 'IAM', 'CloudWatch', 'SNS', 'SQS',
  'EventBridge', 'Step Functions', 'API Gateway', 'ELB', 'ALB', 'NLB',
  'Auto Scaling', 'CloudFormation', 'Elastic Beanstalk', 'ECS', 'EKS',
  'Fargate', 'Kinesis', 'Athena', 'Glue', 'EMR', 'Redshift', 'Aurora',
  'ElastiCache', 'Neptune', 'DocumentDB', 'QLDB', 'Timestream',
  'GuardDuty', 'Inspector', 'Macie', 'Security Hub', 'WAF', 'Shield',
  'Secrets Manager', 'KMS', 'Certificate Manager', 'CloudTrail', 'Config',
  'Systems Manager', 'OpsWorks', 'CodeDeploy', 'CodePipeline', 'CodeBuild',
  'CodeCommit', 'CodeStar', 'X-Ray', 'AppSync', 'Cognito', 'Directory Service',
  'SSO', 'Organizations', 'Control Tower', 'Service Catalog', 'Trusted Advisor',
  'Personal Health Dashboard', 'Support', 'Snowball', 'DataSync', 'Transfer Family',
  'Storage Gateway', 'Backup', 'Disaster Recovery', 'Elastic Disaster Recovery',
  'CloudEndure', 'Direct Connect', 'VPN', 'Transit Gateway', 'PrivateLink',
  'Global Accelerator', 'App Mesh', 'Cloud Map', 'Resource Access Manager'
];

// Architectural patterns dictionary
const PATTERNS = {
  'multi-tier': 'Multi-Tier Architecture',
  'microservices': 'Microservices',
  'serverless': 'Serverless Architecture',
  'event-driven': 'Event-Driven Architecture',
  'caching': 'Caching Strategy',
  'load-balancing': 'Load Balancing',
  'high-availability': 'High Availability',
  'disaster-recovery': 'Disaster Recovery',
  'auto-scaling': 'Auto Scaling',
  'decoupling': 'Decoupling Pattern',
  'message-queue': 'Message Queue Pattern',
  'pub-sub': 'Publish-Subscribe Pattern',
  'data-pipeline': 'Data Pipeline',
  'etl': 'ETL Pattern',
  'cdn': 'Content Delivery Network',
  'hybrid-cloud': 'Hybrid Cloud',
  'encryption': 'Encryption at Rest/Transit',
  'zero-trust': 'Zero Trust Security'
};

/**
 * Extract AWS services mentioned in text
 */
function extractServices(text) {
  if (!text) return [];
  
  const found = new Set();
  AWS_SERVICES.forEach(service => {
    const regex = new RegExp(`\\b${service}\\b|\\bAWS ${service}\\b|\\bAmazon ${service}\\b`, 'gi');
    if (regex.test(text)) {
      found.add(service);
    }
  });
  
  return Array.from(found);
}

/**
 * Detect architectural pattern from text
 */
function detectPattern(text, services) {
  if (!text) return null;
  
  const textLower = text.toLowerCase();
  
  // Check for explicit pattern mentions
  for (const [key, pattern] of Object.entries(PATTERNS)) {
    if (textLower.includes(key)) return pattern;
  }
  
  // Infer from services
  if (services.includes('Lambda') && services.includes('API Gateway')) {
    return 'Serverless Architecture';
  }
  if (services.includes('ECS') || services.includes('EKS')) {
    return 'Microservices';
  }
  if (services.includes('CloudFront') || services.includes('Route 53')) {
    return 'Content Delivery Network';
  }
  if (services.includes('ALB') || services.includes('NLB')) {
    return 'Load Balancing';
  }
  if (services.includes('Auto Scaling')) {
    return 'Auto Scaling';
  }
  
  return null;
}

/**
 * Calculate difficulty based on question characteristics
 */
function calculateDifficulty(question) {
  if (question.difficulty) {
    const diffMap = { 'easy': 1, 'medium': 2, 'hard': 3, 'very-hard': 4 };
    return diffMap[question.difficulty] || 2;
  }
  
  // Heuristics
  let score = 2; // default medium
  
  const questionText = question.question_en || '';
  const text = (questionText + ' ' + Object.values(question.options || {}).join(' ')).toLowerCase();
  
  // Multiple services = harder
  const services = extractServices(text);
  if (services.length >= 4) score += 1;
  
  // Keywords indicating complexity
  if (text.includes('optimize') || text.includes('minimize cost')) score += 0.5;
  if (text.includes('least operational overhead')) score += 0.5;
  if (text.includes('most secure')) score += 0.5;
  if (text.includes('compliance') || text.includes('regulatory')) score += 1;
  
  // Long questions tend to be harder
  if (questionText.length > 500) score += 0.5;
  
  return Math.min(5, Math.max(1, Math.round(score)));
}

/**
 * Generate exam tip based on question content
 */
function generateExamTip(question, services, pattern) {
  const tips = [];
  
  // Service-specific tips
  if (services.includes('S3')) {
    tips.push('Recuerda las diferencias entre S3 Storage Classes y cuándo usar cada una.');
  }
  if (services.includes('Lambda')) {
    tips.push('Lambda es ideal para cargas de trabajo event-driven y de corta duración.');
  }
  if (services.includes('RDS') && services.includes('DynamoDB')) {
    tips.push('RDS para relacional (ACID), DynamoDB para NoSQL de alta escala.');
  }
  if (services.includes('CloudFront')) {
    tips.push('CloudFront reduce latencia mediante edge locations globales.');
  }
  if (services.includes('VPC')) {
    tips.push('En VPC, security groups son stateful, NACLs son stateless.');
  }
  
  // Pattern-specific tips
  if (pattern === 'Serverless Architecture') {
    tips.push('Serverless elimina gestión de servidores pero tiene cold starts.');
  }
  if (pattern === 'High Availability') {
    tips.push('Multi-AZ deployment es clave para alta disponibilidad en AWS.');
  }
  
  // Keyword-based tips
  const text = (question.question_en || '').toLowerCase();
  if (text.includes('cost')) {
    tips.push('En el examen, "cost-effective" usualmente favorece serverless o managed services.');
  }
  if (text.includes('operational overhead')) {
    tips.push('Menos overhead operacional = servicios más gestionados (managed).');
  }
  if (text.includes('security')) {
    tips.push('Siempre elige la opción con cifrado, least privilege, y defensa en profundidad.');
  }
  
  return tips.length > 0 ? tips[0] : null;
}

/**
 * Auto-enrich a single question
 */
function enrichQuestion(question) {
  const fullText = question.explanation?.full_text || '';
  const questionText = question.question_en || '';
  const allText = questionText + ' ' + fullText;
  
  // Extract services
  const services = extractServices(allText);
  
  // Detect pattern
  const pattern = detectPattern(allText, services);
  
  // Calculate difficulty
  const difficulty = calculateDifficulty(question);
  
  // Generate why_correct if missing
  let whyCorrect = question.explanation?.why_correct;
  if (!whyCorrect && fullText) {
    const sentences = fullText.split(/[.!?]+/).filter(s => s.trim());
    whyCorrect = sentences.slice(0, 2).join('. ').trim();
    if (whyCorrect && !whyCorrect.endsWith('.')) whyCorrect += '.';
  }
  
  // Generate why_wrong template if missing
  let whyWrong = question.explanation?.why_wrong || {};
  if (Object.keys(whyWrong).length === 0) {
    const allOptions = ['A', 'B', 'C', 'D', 'E', 'F'];
    const correctAnswer = question.correct_answer;
    
    allOptions.forEach(opt => {
      if (question.options[opt] && opt !== correctAnswer) {
        whyWrong[opt] = `[PENDIENTE: Explicar por qué ${opt} no es correcta]`;
      }
    });
  }
  
  // Generate exam tip
  const examTip = generateExamTip(question, services, pattern);
  
  // Generate keywords
  const keywords = [
    ...services.map(s => s.toLowerCase()),
    pattern ? pattern.toLowerCase() : null,
    question.domain?.toLowerCase()
  ].filter(Boolean);
  
  // Memorize points
  const memorize = [];
  if (services.length > 0) {
    memorize.push(`Servicios clave: ${services.slice(0, 3).join(', ')}`);
  }
  if (pattern) {
    memorize.push(`Patrón: ${pattern}`);
  }
  
  // Build enriched explanation
  const enrichedExplanation = {
    full_text: fullText,
    why_correct: whyCorrect || '[PENDIENTE: Explicar por qué es correcta]',
    why_wrong: whyWrong,
    aws_services: services,
    architectural_concept: question.domain || '[PENDIENTE: Definir concepto]',
    keywords: keywords,
    pattern: pattern,
    related_topics: question.explanation?.related_topics || [],
    exam_tips: examTip || '[PENDIENTE: Agregar tip]',
    memorize: memorize,
    difficulty_rating: difficulty
  };
  
  return {
    ...question,
    explanation: enrichedExplanation
  };
}

/**
 * Create template for manual enrichment
 */
function createTemplate(questions) {
  const template = questions.slice(0, 5).map(q => ({
    id: q.question_id,
    question_text: (q.question_en || '').substring(0, 100) + '...',
    correct_answer: q.correct_answer,
    explanation: {
      full_text: q.explanation?.full_text || '',
      why_correct: '[COMPLETE: Por qué es correcta]',
      why_wrong: {
        A: '[COMPLETE: Por qué A no es correcta]',
        B: '[COMPLETE: Por qué B no es correcta]',
        // ... etc
      },
      aws_services: ['Service1', 'Service2'],
      architectural_concept: '[COMPLETE: Concepto principal]',
      keywords: ['keyword1', 'keyword2'],
      pattern: '[COMPLETE: Patrón arquitectónico]',
      related_topics: ['topic1', 'topic2'],
      exam_tips: '[COMPLETE: Tip específico para el examen]',
      memorize: [
        '[COMPLETE: Punto clave 1]',
        '[COMPLETE: Punto clave 2]'
      ],
      difficulty_rating: 2
    }
  }));
  
  return {
    _readme: 'Este es un template de ejemplo. Complete los campos marcados con [COMPLETE] o [PENDIENTE]. Luego use --mode merge para integrar.',
    _total_questions: questions.length,
    _sample_questions: template
  };
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--mode') 
    ? args[args.indexOf('--mode') + 1] 
    : 'auto';
  
  const outputPath = args.includes('--output')
    ? args[args.indexOf('--output') + 1]
    : DEFAULT_OUTPUT;
  
  console.log('🚀 Question Enrichment Script');
  console.log(`📂 Reading: ${QUESTIONS_FILE}`);
  
  // Load questions
  const rawData = fs.readFileSync(QUESTIONS_FILE, 'utf-8');
  const questions = JSON.parse(rawData);
  
  console.log(`✅ Loaded ${questions.length} questions`);
  console.log(`🔧 Mode: ${mode}`);
  
  let result;
  
  switch (mode) {
    case 'template':
      console.log('📝 Creating enrichment template...');
      result = createTemplate(questions);
      fs.writeFileSync(TEMPLATE_OUTPUT, JSON.stringify(result, null, 2));
      console.log(`✅ Template created: ${TEMPLATE_OUTPUT}`);
      console.log('📋 Edit this file manually, then run with --mode merge');
      break;
      
    case 'auto':
      console.log('🤖 Auto-enriching questions...');
      result = questions.map((q, idx) => {
        if ((idx + 1) % 100 === 0) {
          console.log(`   Processed ${idx + 1}/${questions.length}...`);
        }
        return enrichQuestion(q);
      });
      
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
      console.log(`✅ Enriched questions saved: ${outputPath}`);
      
      // Statistics
      const stats = {
        total: result.length,
        with_services: result.filter(q => q.explanation.aws_services.length > 0).length,
        with_pattern: result.filter(q => q.explanation.pattern).length,
        with_tips: result.filter(q => q.explanation.exam_tips && !q.explanation.exam_tips.includes('PENDIENTE')).length,
        avg_services: (result.reduce((sum, q) => sum + q.explanation.aws_services.length, 0) / result.length).toFixed(1)
      };
      
      console.log('\n📊 Enrichment Statistics:');
      console.log(`   Total questions: ${stats.total}`);
      console.log(`   With AWS services: ${stats.with_services} (${(stats.with_services/stats.total*100).toFixed(1)}%)`);
      console.log(`   With pattern detected: ${stats.with_pattern} (${(stats.with_pattern/stats.total*100).toFixed(1)}%)`);
      console.log(`   With exam tips: ${stats.with_tips} (${(stats.with_tips/stats.total*100).toFixed(1)}%)`);
      console.log(`   Avg services per question: ${stats.avg_services}`);
      
      console.log('\n⚠️  Note: Some fields marked as [PENDIENTE] require manual review');
      console.log('   You can edit the generated file and refine explanations');
      break;
      
    case 'merge':
      console.log('🔀 Merge mode not implemented yet');
      console.log('   This would merge manually edited data back to questions.json');
      break;
      
    default:
      console.error(`❌ Unknown mode: ${mode}`);
      console.log('   Valid modes: auto, template, merge');
      process.exit(1);
  }
  
  console.log('\n✨ Done!');
}

main();
