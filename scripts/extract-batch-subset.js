const fs = require('fs');

// Read mega-batch-1
const megaBatch = JSON.parse(fs.readFileSync('mass-processing/mega-batch-1-of-9.json', 'utf8'));

// Extract questions 46-90 (indices 46-90)
const subset = megaBatch.slice(46, 91);

console.log(`Extracted ${subset.length} questions (IDs: ${subset[0].question_id} to ${subset[subset.length-1].question_id})`);

// Save subset
fs.writeFileSync('batch-subset-46-90.json', JSON.stringify(subset, null, 2));
