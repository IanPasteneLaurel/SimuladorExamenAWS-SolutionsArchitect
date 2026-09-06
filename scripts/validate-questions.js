#!/usr/bin/env node

/**
 * Validation script for SAA-C03 question bank
 * Ensures all 923 questions have complete data and proper structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load question bank
const questionBankPath = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923.json');
const examsMetadataPath = path.join(__dirname, '../app/src/data/exams-metadata.json');
const examsFullPath = path.join(__dirname, '../app/src/data/exams-full.json');

const questionBank = JSON.parse(fs.readFileSync(questionBankPath, 'utf-8'));
const examsMetadata = JSON.parse(fs.readFileSync(examsMetadataPath, 'utf-8'));
const examsFull = JSON.parse(fs.readFileSync(examsFullPath, 'utf-8'));

const errors = [];
const warnings = [];
let validQuestions = 0;

console.log('🔍 Validating SAA-C03 Question Bank...\n');

// Validate question bank structure
console.log(`📊 Total questions in bank: ${questionBank.length}`);

questionBank.forEach((question, index) => {
  const qId = question.question_id;
  
  // Required fields validation
  if (!qId) {
    errors.push(`Question at index ${index}: Missing question_id`);
    return;
  }
  
  if (!question.domain) {
    errors.push(`Question ${qId}: Missing domain`);
  }
  
  if (!question.question_en || question.question_en.trim().length < 10) {
    errors.push(`Question ${qId}: Missing or invalid question_en`);
  }
  
  // Validate options
  if (!question.options || typeof question.options !== 'object') {
    errors.push(`Question ${qId}: Missing or invalid options object`);
  } else {
    const optionKeys = Object.keys(question.options);
    if (optionKeys.length < 2) {
      errors.push(`Question ${qId}: Must have at least 2 options`);
    }
    
    optionKeys.forEach(key => {
      if (!question.options[key] || question.options[key].trim().length < 5) {
        errors.push(`Question ${qId}: Option ${key} is missing or too short`);
      }
    });
    
    // Validate correct_answer exists in options
    if (!question.correct_answer) {
      errors.push(`Question ${qId}: Missing correct_answer`);
    } else if (!optionKeys.includes(question.correct_answer)) {
      errors.push(`Question ${qId}: correct_answer '${question.correct_answer}' not in options`);
    }
  }
  
  // Validate explanation
  if (!question.explanation) {
    errors.push(`Question ${qId}: Missing explanation object`);
  } else {
    if (!question.explanation.full_text || question.explanation.full_text.trim().length < 20) {
      warnings.push(`Question ${qId}: Explanation full_text is missing or too short`);
    }
    
    if (!question.explanation.why_correct) {
      warnings.push(`Question ${qId}: Missing explanation.why_correct`);
    }
    
    if (!question.explanation.why_wrong || typeof question.explanation.why_wrong !== 'object') {
      warnings.push(`Question ${qId}: Missing or invalid explanation.why_wrong`);
    }
    
    if (!question.explanation.aws_services || !Array.isArray(question.explanation.aws_services)) {
      warnings.push(`Question ${qId}: Missing or invalid explanation.aws_services array`);
    }
  }
  
  // Validate difficulty
  if (!question.difficulty || question.difficulty < 1 || question.difficulty > 5) {
    warnings.push(`Question ${qId}: Invalid difficulty rating (should be 1-5)`);
  }
  
  if (!errors.some(e => e.includes(`Question ${qId}`))) {
    validQuestions++;
  }
});

// Validate exams metadata
console.log(`\n📋 Validating exams metadata...`);
console.log(`Total exams: ${examsMetadata.total_exams}`);

const allExamQuestionIds = new Set();
const duplicateIds = new Set();

examsMetadata.exams.forEach(exam => {
  exam.question_ids.forEach(qId => {
    if (allExamQuestionIds.has(qId)) {
      duplicateIds.add(qId);
      errors.push(`Question ${qId} appears in multiple exams (should be unique)`);
    }
    allExamQuestionIds.add(qId);
    
    // Check if question exists in bank
    const questionExists = questionBank.some(q => q.question_id === qId);
    if (!questionExists) {
      errors.push(`Exam ${exam.exam_id}: Question ${qId} not found in question bank`);
    }
  });
  
  // Validate exam structure
  if (exam.question_count !== exam.question_ids.length) {
    errors.push(`Exam ${exam.exam_id}: question_count (${exam.question_count}) doesn't match question_ids length (${exam.question_ids.length})`);
  }
});

console.log(`Total unique questions across exams: ${allExamQuestionIds.size}`);
console.log(`Expected: ${examsMetadata.total_questions}`);

if (allExamQuestionIds.size !== examsMetadata.total_questions) {
  errors.push(`Question count mismatch: ${allExamQuestionIds.size} vs ${examsMetadata.total_questions}`);
}

// Validate exams-full.json structure
console.log(`\n📦 Validating exams-full.json...`);
const examIds = Object.keys(examsFull);
console.log(`Exams in exams-full.json: ${examIds.length}`);

examIds.forEach(examId => {
  const exam = examsFull[examId];
  if (!exam.exam_id) {
    errors.push(`Exam ${examId}: Missing exam_id`);
  }
  if (!exam.questions || !Array.isArray(exam.questions)) {
    errors.push(`Exam ${examId}: Missing or invalid questions array`);
  } else {
    exam.questions.forEach((q, idx) => {
      if (!q.question_id) {
        errors.push(`Exam ${examId}, question ${idx}: Missing question_id`);
      }
    });
  }
});

// Print results
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION RESULTS');
console.log('='.repeat(60));

console.log(`\n✅ Valid questions: ${validQuestions}/${questionBank.length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`❌ Errors: ${errors.length}`);

if (duplicateIds.size > 0) {
  console.log(`\n🔴 Duplicate question IDs found: ${duplicateIds.size}`);
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS:\n');
  errors.slice(0, 20).forEach(err => console.log(`  - ${err}`));
  if (errors.length > 20) {
    console.log(`  ... and ${errors.length - 20} more errors`);
  }
}

if (warnings.length > 0 && errors.length === 0) {
  console.log('\n⚠️  WARNINGS (showing first 10):\n');
  warnings.slice(0, 10).forEach(warn => console.log(`  - ${warn}`));
  if (warnings.length > 10) {
    console.log(`  ... and ${warnings.length - 10} more warnings`);
  }
}

console.log('\n' + '='.repeat(60));

if (errors.length === 0) {
  console.log('✅ VALIDATION PASSED - All critical checks passed!');
  console.log('   The question bank is ready for production.');
  if (warnings.length > 0) {
    console.log(`   Note: ${warnings.length} warnings found (non-critical)`);
  }
  process.exit(0);
} else {
  console.log('❌ VALIDATION FAILED - Please fix the errors above.');
  process.exit(1);
}
