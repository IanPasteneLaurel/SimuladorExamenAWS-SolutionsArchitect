#!/usr/bin/env node
/**
 * Infers correct_answer arrays for multi-select questions by analyzing their explanations
 * Uses keyword matching to identify which options are described as correct
 */

const fs = require('fs');
const path = require('path');

const ENRICHED_FILE = path.join(__dirname, '../app/src/data/SAA-C03-QuestionBank-923-enriched.json');

function inferCorrectAnswers() {
  console.log('📖 Loading enriched file...\n');
  
  const enriched = JSON.parse(fs.readFileSync(ENRICHED_FILE, 'utf8'));
  
  let fixed = 0;
  let multiSelectCount = 0;
  const manualReview = [];
  
  enriched.forEach(q => {
    if (q.multi_select !== true) return;
    
    multiSelectCount++;
    
    // Skip if already an array
    if (Array.isArray(q.correct_answer)) {
      console.log(`✓ Q${q.question_id}: Already has array [${q.correct_answer.join(', ')}]`);
      return;
    }
    
    // Get the explanation text
    const explanationText = q.explanation?.full_text || '';
    const questionText = q.question_en || '';
    
    // Detect how many answers should be selected from question text
    const selectTwoMatch = questionText.match(/\(Select TWO\)/i) || questionText.match(/select two/i);
    const selectThreeMatch = questionText.match(/\(Select THREE\)/i) || questionText.match(/select three/i);
    const expectedCount = selectThreeMatch ? 3 : (selectTwoMatch ? 2 : 2); // Default to 2
    
    // Get available options
    const availableOptions = Object.keys(q.options || {});
    
    // Strategy 1: Look for explicit mentions of "Option X is correct" or "X is correct"
    const correctOptions = [];
    
    availableOptions.forEach(opt => {
      // Patterns that indicate correctness
      const correctPatterns = [
        new RegExp(`Option\\s+${opt}\\s+is\\s+correct`, 'i'),
        new RegExp(`${opt}\\s+is\\s+correct`, 'i'),
        new RegExp(`\\b${opt}\\b.*is\\s+(the\\s+)?correct`, 'i'),
        new RegExp(`correct\\s+answer\\s+is\\s+${opt}`, 'i'),
        new RegExp(`answers\\s+are\\s+${opt}`, 'i'),
      ];
      
      // Patterns that indicate incorrectness
      const incorrectPatterns = [
        new RegExp(`Option\\s+${opt}\\s+is\\s+incorrect`, 'i'),
        new RegExp(`${opt}\\s+is\\s+incorrect`, 'i'),
        new RegExp(`${opt}\\s+is\\s+(not|wrong)`, 'i'),
      ];
      
      const hasCorrectMention = correctPatterns.some(pattern => pattern.test(explanationText));
      const hasIncorrectMention = incorrectPatterns.some(pattern => pattern.test(explanationText));
      
      if (hasCorrectMention && !hasIncorrectMention) {
        correctOptions.push(opt);
      }
    });
    
    // Strategy 2: If explanation starts with discussing certain options positively
    if (correctOptions.length === 0) {
      // Look for explanations that list options at the beginning
      const firstSentences = explanationText.substring(0, 500);
      availableOptions.forEach(opt => {
        const optionText = q.options[opt] || '';
        // Check if the option text or key appears early in explanation with positive keywords
        const positiveKeywords = ['appropriate', 'correct', 'suitable', 'best', 'lowers', 'reduces', 'provides', 'supports', 'meets'];
        const contextAroundOpt = firstSentences.match(new RegExp(`.{0,100}${opt}.{0,100}`, 'i'));
        
        if (contextAroundOpt) {
          const context = contextAroundOpt[0];
          if (positiveKeywords.some(kw => context.toLowerCase().includes(kw))) {
            if (!correctOptions.includes(opt)) {
              correctOptions.push(opt);
            }
          }
        }
      });
    }
    
    // Validate result
    if (correctOptions.length === expectedCount) {
      console.log(`🔧 Q${q.question_id}: Inferred correct_answer [${correctOptions.join(', ')}] from explanation`);
      q.correct_answer = correctOptions.sort();
      fixed++;
    } else if (correctOptions.length > 0) {
      console.log(`⚠️  Q${q.question_id}: Found ${correctOptions.length} options [${correctOptions.join(', ')}] but expected ${expectedCount} - needs manual review`);
      manualReview.push({
        question_id: q.question_id,
        found: correctOptions,
        expected: expectedCount,
        question_snippet: questionText.substring(0, 150)
      });
    } else {
      console.log(`❌ Q${q.question_id}: Could not infer correct answers - needs manual review`);
      manualReview.push({
        question_id: q.question_id,
        found: [],
        expected: expectedCount,
        question_snippet: questionText.substring(0, 150)
      });
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Multi-select questions: ${multiSelectCount}`);
  console.log(`   Fixed: ${fixed}`);
  console.log(`   Needs manual review: ${manualReview.length}`);
  
  if (manualReview.length > 0) {
    console.log(`\n📝 Questions requiring manual review:`);
    manualReview.forEach(item => {
      console.log(`   Q${item.question_id}: Found ${item.found.length}/${item.expected} - ${item.question_snippet}...`);
    });
  }
  
  if (fixed > 0) {
    console.log('\n💾 Saving updated file...');
    fs.writeFileSync(ENRICHED_FILE, JSON.stringify(enriched, null, 2));
    console.log(`✅ Saved: ${ENRICHED_FILE}`);
  } else {
    console.log('\n✅ No automatic fixes applied');
  }
  
  // Final verification
  console.log('\n🔍 Final verification...');
  const stillBroken = enriched.filter(q => 
    q.multi_select === true && !Array.isArray(q.correct_answer)
  );
  
  console.log(`Remaining non-array multi-select questions: ${stillBroken.length}/${multiSelectCount}`);
}

inferCorrectAnswers();
