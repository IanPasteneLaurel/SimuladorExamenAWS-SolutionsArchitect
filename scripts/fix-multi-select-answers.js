#!/usr/bin/env node
/**
 * Restores correct_answer as array for multi-select questions
 * by referencing the original SAA-C03-QuestionBank-923.json
 */

const fs = require('fs');
const path = require('path');

const ORIGINAL_FILE = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923.json');
const ENRICHED_FILE = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923-enriched.json');

function fixMultiSelectAnswers() {
  console.log('📖 Loading files...\n');
  
  const original = JSON.parse(fs.readFileSync(ORIGINAL_FILE, 'utf8'));
  const enriched = JSON.parse(fs.readFileSync(ENRICHED_FILE, 'utf8'));
  
  // Create a map of original questions by ID
  const originalMap = new Map();
  original.forEach(q => {
    originalMap.set(q.question_id, q);
  });
  
  let fixed = 0;
  let multiSelectCount = 0;
  
  enriched.forEach(q => {
    const orig = originalMap.get(q.question_id);
    
    if (!orig) {
      console.log(`⚠️  Question ${q.question_id}: Not found in original file`);
      return;
    }
    
    // Check if it's a multi-select question
    if (q.multi_select === true) {
      multiSelectCount++;
      
      // If correct_answer is not an array, fix it using original data
      if (!Array.isArray(q.correct_answer)) {
        if (Array.isArray(orig.correct_answer)) {
          console.log(`🔧 Q${q.question_id}: Fixing correct_answer from "${q.correct_answer}" to [${orig.correct_answer.join(', ')}]`);
          q.correct_answer = orig.correct_answer;
          fixed++;
        } else {
          console.log(`⚠️  Q${q.question_id}: Original also has non-array correct_answer: ${orig.correct_answer}`);
        }
      }
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Multi-select questions: ${multiSelectCount}`);
  console.log(`   Fixed: ${fixed}`);
  console.log(`   Already correct: ${multiSelectCount - fixed}`);
  
  if (fixed > 0) {
    console.log('\n💾 Saving updated file...');
    fs.writeFileSync(ENRICHED_FILE, JSON.stringify(enriched, null, 2));
    console.log(`✅ Saved: ${ENRICHED_FILE}`);
  } else {
    console.log('\n✅ No changes needed');
  }
  
  // Verify
  console.log('\n🔍 Verifying...');
  const stillBroken = enriched.filter(q => 
    q.multi_select === true && !Array.isArray(q.correct_answer)
  );
  
  if (stillBroken.length === 0) {
    console.log('✅ All multi-select questions now have correct_answer as array');
  } else {
    console.log(`⚠️  ${stillBroken.length} multi-select questions still have non-array correct_answer:`);
    stillBroken.forEach(q => {
      console.log(`   Q${q.question_id}: ${JSON.stringify(q.correct_answer)}`);
    });
  }
}

fixMultiSelectAnswers();
