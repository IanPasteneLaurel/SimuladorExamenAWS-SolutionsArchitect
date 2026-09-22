const fs = require('fs');

console.log('🔑 AGREGANDO KEYWORDS A LAS PREGUNTAS\n');

const data = JSON.parse(fs.readFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', 'utf8'));

// Función para extraer keywords de una pregunta
function extractKeywords(question) {
  const text = question.question_en.toLowerCase();
  const options = Object.values(question.options || {}).join(' ').toLowerCase();
  const fullText = text + ' ' + options;
  
  const keywords = [];
  
  // 1. Requisitos de tiempo (críticos para identificar soluciones)
  const timePatterns = [
    { regex: /(\d+[\s-]?(second|minute|hour|day|month|year)s?)/g, type: 'time_constraint' },
    { regex: /(real[\s-]?time|near[\s-]?real[\s-]?time|immediately|instant)/g, type: 'latency' },
    { regex: /(24[\s-]?hour|daily|weekly|monthly)/g, type: 'schedule' },
  ];
  
  timePatterns.forEach(({ regex, type }) => {
    const matches = text.match(regex);
    if (matches) {
      matches.forEach(match => {
        const normalized = match.trim().replace(/\s+/g, ' ');
        if (!keywords.some(k => k.text === normalized)) {
          keywords.push({ text: normalized, type });
        }
      });
    }
  });
  
  // 2. Requisitos de costo
  const costKeywords = [
    { pattern: /most cost[\s-]?effective/g, text: 'most cost-effective', type: 'optimization' },
    { pattern: /minimize cost/g, text: 'minimize cost', type: 'optimization' },
    { pattern: /reduce cost/g, text: 'reduce cost', type: 'optimization' },
    { pattern: /lowest cost/g, text: 'lowest cost', type: 'optimization' },
    { pattern: /least expensive/g, text: 'least expensive', type: 'optimization' },
    { pattern: /optimize cost/g, text: 'optimize costs', type: 'optimization' },
    { pattern: /cost[\s-]?optimi[zs]ed/g, text: 'cost-optimized', type: 'optimization' },
    { pattern: /without additional cost/g, text: 'without additional cost', type: 'optimization' },
  ];
  
  costKeywords.forEach(({ pattern, text: kwText, type }) => {
    if (pattern.test(text)) {
      if (!keywords.some(k => k.text === kwText)) {
        keywords.push({ text: kwText, type });
      }
    }
  });
  
  // 3. Requisitos operacionales
  const operationalKeywords = [
    { pattern: /least operational overhead/g, text: 'least operational overhead', type: 'operational' },
    { pattern: /minimal operational overhead/g, text: 'minimal operational overhead', type: 'operational' },
    { pattern: /reduce operational overhead/g, text: 'reduce operational overhead', type: 'operational' },
    { pattern: /minimize operational effort/g, text: 'minimize operational effort', type: 'operational' },
    { pattern: /without managing/g, text: 'without managing infrastructure', type: 'operational' },
    { pattern: /serverless/g, text: 'serverless', type: 'operational' },
    { pattern: /fully managed/g, text: 'fully managed', type: 'operational' },
  ];
  
  operationalKeywords.forEach(({ pattern, text: kwText, type }) => {
    if (pattern.test(text)) {
      if (!keywords.some(k => k.text === kwText)) {
        keywords.push({ text: kwText, type });
      }
    }
  });
  
  // 4. Requisitos de disponibilidad y resiliencia
  const resilienceKeywords = [
    { pattern: /high(ly)? available/g, text: 'highly available', type: 'resilience' },
    { pattern: /fault[\s-]?tolerant/g, text: 'fault-tolerant', type: 'resilience' },
    { pattern: /disaster recovery/g, text: 'disaster recovery', type: 'resilience' },
    { pattern: /multi[\s-]?az/gi, text: 'multi-AZ', type: 'resilience' },
    { pattern: /multi[\s-]?region/gi, text: 'multi-Region', type: 'resilience' },
    { pattern: /cross[\s-]?region/gi, text: 'cross-Region', type: 'resilience' },
    { pattern: /\b99\.9+%/g, text: text.match(/\b99\.9+%/)?.[0] || '99.9% availability', type: 'resilience' },
  ];
  
  resilienceKeywords.forEach(({ pattern, text: kwText, type }) => {
    const match = text.match(pattern);
    if (match) {
      const finalText = kwText === 'multi-AZ' || kwText === 'multi-Region' || kwText === 'cross-Region' ? kwText : kwText;
      if (!keywords.some(k => k.text === finalText)) {
        keywords.push({ text: finalText, type });
      }
    }
  });
  
  // 5. Requisitos de seguridad
  const securityKeywords = [
    { pattern: /encrypt(ed|ion)/g, text: 'encryption', type: 'security' },
    { pattern: /at rest/g, text: 'encryption at rest', type: 'security' },
    { pattern: /in transit/g, text: 'encryption in transit', type: 'security' },
    { pattern: /least privilege/g, text: 'least privilege', type: 'security' },
    { pattern: /private/g, text: 'private', type: 'security' },
    { pattern: /isolated/g, text: 'isolated', type: 'security' },
    { pattern: /secure/g, text: 'secure', type: 'security' },
    { pattern: /compliance/g, text: 'compliance', type: 'security' },
  ];
  
  securityKeywords.forEach(({ pattern, text: kwText, type }) => {
    if (pattern.test(text)) {
      if (!keywords.some(k => k.text === kwText)) {
        keywords.push({ text: kwText, type });
      }
    }
  });
  
  // 6. Requisitos de performance
  const performanceKeywords = [
    { pattern: /low latency/g, text: 'low latency', type: 'performance' },
    { pattern: /high throughput/g, text: 'high throughput', type: 'performance' },
    { pattern: /scale automatically/g, text: 'scale automatically', type: 'performance' },
    { pattern: /auto[\s-]?scaling/g, text: 'auto-scaling', type: 'performance' },
    { pattern: /millions? of/g, text: 'millions of requests', type: 'performance' },
    { pattern: /thousands? of/g, text: 'thousands of requests', type: 'performance' },
  ];
  
  performanceKeywords.forEach(({ pattern, text: kwText, type }) => {
    if (pattern.test(text)) {
      if (!keywords.some(k => k.text === kwText)) {
        keywords.push({ text: kwText, type });
      }
    }
  });
  
  // 7. Patrones de datos
  const dataKeywords = [
    { pattern: /terabytes?|TB/gi, text: 'terabytes', type: 'data_volume' },
    { pattern: /petabytes?|PB/gi, text: 'petabytes', type: 'data_volume' },
    { pattern: /gigabytes?|GB/gi, text: 'gigabytes', type: 'data_volume' },
    { pattern: /relational database/g, text: 'relational database', type: 'data_type' },
    { pattern: /nosql/gi, text: 'NoSQL', type: 'data_type' },
    { pattern: /key[\s-]?value/g, text: 'key-value', type: 'data_type' },
    { pattern: /document database/g, text: 'document database', type: 'data_type' },
    { pattern: /time[\s-]?series/g, text: 'time-series', type: 'data_type' },
  ];
  
  dataKeywords.forEach(({ pattern, text: kwText, type }) => {
    if (pattern.test(fullText)) {
      if (!keywords.some(k => k.text === kwText)) {
        keywords.push({ text: kwText, type });
      }
    }
  });
  
  // 8. Patrones arquitectónicos específicos
  const architecturalPatterns = [
    { pattern: /event[\s-]?driven/g, text: 'event-driven', type: 'pattern' },
    { pattern: /microservices/g, text: 'microservices', type: 'pattern' },
    { pattern: /\bqueue\b/g, text: 'message queue', type: 'pattern' },
    { pattern: /decouple/g, text: 'decouple', type: 'pattern' },
    { pattern: /asynchronous/g, text: 'asynchronous', type: 'pattern' },
    { pattern: /batch processing/g, text: 'batch processing', type: 'pattern' },
    { pattern: /stream processing/g, text: 'stream processing', type: 'pattern' },
    { pattern: /static content/g, text: 'static content', type: 'pattern' },
    { pattern: /dynamic content/g, text: 'dynamic content', type: 'pattern' },
    { pattern: /caching/g, text: 'caching', type: 'pattern' },
  ];
  
  architecturalPatterns.forEach(({ pattern, text: kwText, type }) => {
    if (pattern.test(fullText)) {
      if (!keywords.some(k => k.text === kwText)) {
        keywords.push({ text: kwText, type });
      }
    }
  });
  
  // 9. Restricciones específicas
  const constraints = [
    { pattern: /cannot modify/g, text: 'cannot modify', type: 'constraint' },
    { pattern: /must not/g, text: 'must not', type: 'constraint' },
    { pattern: /without changing/g, text: 'without changing', type: 'constraint' },
    { pattern: /no additional/g, text: 'no additional infrastructure', type: 'constraint' },
    { pattern: /unpredictable/g, text: 'unpredictable access patterns', type: 'constraint' },
    { pattern: /variable usage/g, text: 'variable usage patterns', type: 'constraint' },
    { pattern: /immediate access/g, text: 'immediate access required', type: 'constraint' },
    { pattern: /tolerate disruptions?/g, text: 'can tolerate disruptions', type: 'constraint' },
  ];
  
  constraints.forEach(({ pattern, text: kwText, type }) => {
    if (pattern.test(text)) {
      if (!keywords.some(k => k.text === kwText)) {
        keywords.push({ text: kwText, type });
      }
    }
  });
  
  // Ordenar por tipo para mejor legibilidad
  const typeOrder = ['optimization', 'operational', 'time_constraint', 'latency', 'schedule', 
                     'resilience', 'security', 'performance', 'data_volume', 'data_type', 
                     'pattern', 'constraint'];
  
  keywords.sort((a, b) => {
    const aIndex = typeOrder.indexOf(a.type);
    const bIndex = typeOrder.indexOf(b.type);
    return aIndex - bIndex;
  });
  
  // Limitar a máximo 8 keywords más relevantes
  return keywords.slice(0, 8);
}

// Función para agregar keywords manualmente basado en el dominio si no hay ninguna
function ensureMinimumKeywords(question, keywords) {
  if (keywords.length > 0) return keywords;
  
  // Agregar al menos el dominio como keyword
  const text = question.question_en.toLowerCase();
  
  // Patrones adicionales basados en dominio
  if (question.domain === 'Cost-Optimized Architectures') {
    // Buscar patrones de "need to" + verbo
    if (/need to (?:reduce|minimize|optimize|lower)/i.test(text)) {
      keywords.push({ text: 'cost optimization required', type: 'optimization' });
    }
  }
  
  if (question.domain === 'Resilient Architectures') {
    if (/availability|available/i.test(text)) {
      keywords.push({ text: 'availability requirement', type: 'resilience' });
    }
  }
  
  if (question.domain === 'Secure Architectures') {
    if (/access|permission|identity/i.test(text)) {
      keywords.push({ text: 'access control', type: 'security' });
    }
  }
  
  return keywords;
}

// Procesar todas las preguntas
let added = 0;
let updated = 0;

data.forEach(question => {
  let keywords = extractKeywords(question);
  keywords = ensureMinimumKeywords(question, keywords);
  
  if (keywords.length > 0) {
    if (!question.explanation) {
      question.explanation = {};
    }
    
    if (!question.explanation.keywords) {
      question.explanation.keywords = keywords;
      added++;
    } else {
      question.explanation.keywords = keywords;
      updated++;
    }
  }
});

// Guardar cambios
fs.writeFileSync('../app/src/data/SAA-C03-QuestionBank-923.json', JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ Proceso completado:`);
console.log(`   - ${added} preguntas con keywords agregadas`);
console.log(`   - ${updated} preguntas con keywords actualizadas`);

// Mostrar ejemplos de keywords extraídas
console.log('\n📋 EJEMPLOS DE KEYWORDS EXTRAÍDAS:\n');

const samples = [1, 36, 43, 70, 100, 200, 300, 500, 700, 900].map(id => 
  data.find(q => q.question_id === id)
).filter(Boolean);

samples.forEach(q => {
  const keywords = q.explanation.keywords || [];
  console.log(`Q${q.question_id} - ${q.domain}`);
  console.log(`Keywords (${keywords.length}):`);
  keywords.forEach(kw => {
    console.log(`  • [${kw.type}] ${kw.text}`);
  });
  console.log('');
});

console.log('='.repeat(80));
