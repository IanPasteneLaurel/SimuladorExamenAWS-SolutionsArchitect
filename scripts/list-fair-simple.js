const fs = require('fs');
const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));

function scoreQuestion(q) {
  const exp = q.explanation;
  if (!exp) return 0;
  let score = 0;
  const wcLength = (exp.why_correct || '').length;
  const wcIsGeneric = exp.why_correct && (
    exp.why_correct.includes('Solución óptima cumpliendo requisitos') ||
    exp.why_correct.includes('usa servicios AWS apropiados cumpliendo requisitos') ||
    exp.why_correct.startsWith('Opción correcta porque usa servicios AWS apropiados') ||
    exp.why_correct.includes('This architecture aligns with AWS Well-Architected Framework')
  );
  if (!wcIsGeneric && wcLength > 200) score += 4;
  else if (!wcIsGeneric && wcLength > 120) score += 3;
  else if (!wcIsGeneric && wcLength > 60) score += 2;
  else if (wcLength > 30) score += 1;
  const wrongKeys = Object.keys(exp.why_wrong || {});
  if (wrongKeys.length > 0) {
    const avgLength = wrongKeys.reduce((sum, k) => sum + (exp.why_wrong[k] || '').length, 0) / wrongKeys.length;
    const allGeneric = wrongKeys.every(k => {
      const text = exp.why_wrong[k] || '';
      return text.includes('No cumple') || text.includes('usa approach subóptimo') || 
             text.includes('does not fully satisfy') || text.includes('Missing key requirement:') ||
             text.includes('This option uses incorrect or suboptimal service');
    });
    if (!allGeneric && avgLength > 120) score += 4;
    else if (!allGeneric && avgLength > 80) score += 3;
    else if (avgLength > 50) score += 2;
    else if (wrongKeys.length > 0) score += 1;
  }
  const etLength = (exp.exam_tips || '').length;
  const etIsGeneric = exp.exam_tips && exp.exam_tips.includes('Identifica keywords. Compara trade-offs');
  if (!etIsGeneric && etLength > 150) score += 3;
  else if (!etIsGeneric && etLength > 80) score += 2;
  else if (etLength > 40) score += 1;
  const memLength = Array.isArray(exp.memorize) ? exp.memorize.length : (exp.memorize || '').length;
  const memIsArray = Array.isArray(exp.memorize);
  const memIsGeneric = exp.memorize && !memIsArray && exp.memorize.includes('servicios managed AWS');
  if (memIsArray && memLength >= 4) score += 3;
  else if (memIsArray && memLength >= 2) score += 2;
  else if (!memIsGeneric && memLength > 60) score += 2;
  else if (memLength > 30) score += 1;
  const services = exp.aws_services || [];
  if (services.length > 3) score += 2;
  else if (services.length > 1) score += 1;
  else if (services.length === 1 && services[0] !== 'AWS') score += 1;
  if (exp.architectural_concept && exp.architectural_concept !== q.domain) score += 1;
  return score;
}

const fairQuestions = data
  .map(q => ({ id: q.question_id, domain: q.domain, score: scoreQuestion(q) }))
  .filter(q => q.score >= 4 && q.score <= 6)
  .sort((a, b) => a.score - b.score);

console.log(`Preguntas FAIR (${fairQuestions.length}):\n`);
fairQuestions.forEach((q, idx) => {
  console.log(`${(idx+1).toString().padStart(2)}. Q${q.id.toString().padStart(3)} (${q.score}/17) - ${q.domain}`);
});
