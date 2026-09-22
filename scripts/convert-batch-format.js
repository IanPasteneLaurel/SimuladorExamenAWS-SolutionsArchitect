const fs = require('fs');

// Read the wrongly formatted batch
const batch = JSON.parse(fs.readFileSync('enriched-batch-9.json', 'utf8'));

// Convert to correct format
const converted = batch.map(q => ({
  question_id: q.question_id,
  explanation: {
    why_correct: q.why_correct,
    why_wrong: q.why_wrong,
    exam_tips: q.exam_tips,
    memorize: q.memorize,
    aws_services: q.aws_services,
    architectural_concept: q.architectural_concept
  }
}));

// Save
fs.writeFileSync('enriched-batch-9-fixed.json', JSON.stringify(converted, null, 2));
console.log(`✅ Converted ${converted.length} questions to correct format`);
