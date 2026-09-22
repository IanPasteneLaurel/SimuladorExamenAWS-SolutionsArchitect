const fs = require('fs');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));

console.log('🔍 VERIFICACIÓN DE KEYWORDS\n');

const withKeywords = data.filter(q => q.explanation?.keywords?.length > 0);
const withoutKeywords = data.filter(q => !q.explanation?.keywords || q.explanation.keywords.length === 0);

console.log(`✅ Con keywords: ${withKeywords.length}/${data.length} (${(withKeywords.length/data.length*100).toFixed(1)}%)`);
console.log(`❌ Sin keywords: ${withoutKeywords.length}/${data.length} (${(withoutKeywords.length/data.length*100).toFixed(1)}%)\n`);

// Estadísticas por tipo de keyword
const keywordTypeCount = {};
withKeywords.forEach(q => {
  q.explanation.keywords.forEach(kw => {
    keywordTypeCount[kw.type] = (keywordTypeCount[kw.type] || 0) + 1;
  });
});

console.log('📊 TIPOS DE KEYWORDS MÁS COMUNES:\n');
Object.entries(keywordTypeCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`   ${type.padEnd(20)} ${count} apariciones`);
  });

// Promedio de keywords por pregunta
const avgKeywords = withKeywords.reduce((sum, q) => sum + q.explanation.keywords.length, 0) / withKeywords.length;
console.log(`\n📈 Promedio de keywords por pregunta: ${avgKeywords.toFixed(2)}`);

// Ejemplos detallados
console.log('\n\n📋 EJEMPLOS DE PREGUNTAS CON KEYWORDS:\n');
console.log('='.repeat(80));

[36, 70, 200, 317, 500].forEach(id => {
  const q = data.find(question => question.question_id === id);
  if (!q) return;
  
  console.log(`\nQ${q.question_id} - ${q.domain}`);
  console.log('-'.repeat(80));
  console.log(`Pregunta: ${q.question_en.substring(0, 150)}...`);
  console.log(`\n🔑 Keywords (${q.explanation.keywords?.length || 0}):`);
  
  if (q.explanation.keywords) {
    q.explanation.keywords.forEach(kw => {
      console.log(`   • [${kw.type}] ${kw.text}`);
    });
  } else {
    console.log('   (ninguna)');
  }
  
  console.log('');
});

console.log('='.repeat(80));
