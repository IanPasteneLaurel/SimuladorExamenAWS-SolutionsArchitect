import { CheckCircle2, XCircle, Lightbulb, Award, AlertCircle, BookOpen, Star, Brain, TrendingUp } from 'lucide-react';

/**
 * Instructor-style explanation panel shown after a question is answered.
 * Displays structured feedback in English with Spanish titles.
 * All content is shown in English for consistency.
 */
export default function ExplanationView({ question, selected, onNext, isLastQuestion }) {
  // Helper function to check if answer is correct
  // Handles both single-select (string) and multi-select (array) answers
  const isCorrect = (() => {
    const correctAnswer = question.correct_answer;
    
    // Both are arrays (multi-select)
    if (Array.isArray(selected) && Array.isArray(correctAnswer)) {
      return selected.length === correctAnswer.length && 
             selected.every(item => correctAnswer.includes(item));
    }
    
    // Both are strings (single-select)
    if (!Array.isArray(selected) && !Array.isArray(correctAnswer)) {
      return selected === correctAnswer;
    }
    
    // Mismatch (shouldn't happen in normal flow)
    return false;
  })();
  
  const explanation = question.explanation || {};
  
  // Helper function to extract AWS services from text
  const extractServices = (text) => {
    if (explanation.aws_services?.length > 0) return explanation.aws_services;
    
    const commonServices = [
      'Lambda', 'S3', 'EC2', 'RDS', 'DynamoDB', 'CloudFront', 'Route 53',
      'EBS', 'EFS', 'FSx', 'VPC', 'IAM', 'CloudWatch', 'SNS', 'SQS',
      'EventBridge', 'Step Functions', 'API Gateway', 'ELB', 'ALB', 'NLB',
      'Auto Scaling', 'CloudFormation', 'Elastic Beanstalk', 'ECS', 'EKS',
      'Fargate', 'Kinesis', 'Athena', 'Glue', 'EMR', 'Redshift', 'Aurora',
      'ElastiCache', 'Neptune', 'DocumentDB', 'QLDB', 'Timestream',
      'GuardDuty', 'Inspector', 'Macie', 'Security Hub', 'WAF', 'Shield',
      'Secrets Manager', 'KMS', 'Certificate Manager', 'CloudTrail', 'Config',
      'Systems Manager', 'OpsWorks', 'CodeDeploy', 'CodePipeline', 'CodeBuild'
    ];
    
    const found = [];
    commonServices.forEach(service => {
      const regex = new RegExp(`\\b${service}\\b|\\bAWS ${service}\\b|\\bAmazon ${service}\\b`, 'gi');
      if (regex.test(text)) {
        if (!found.includes(service)) found.push(service);
      }
    });
    return found;
  };

  // Helper to parse difficulty from text or use provided
  const getDifficulty = () => {
    if (explanation.difficulty_rating) return explanation.difficulty_rating;
    if (question.difficulty) return question.difficulty;
    return 2; // default medium
  };

  // Parse the explanation - always use English content
  const parseExplanation = () => {
    // Always use English content from the original question data
    const text = explanation.full_text || '';
    const parsed = {
      mainExplanation: text,
      whyCorrect: explanation.why_correct || null,
      whyWrong: explanation.why_wrong || {},
      services: extractServices(text),
      concept: explanation.architectural_concept || question.domain || '',
      tips: explanation.exam_tips || null,
      memorize: explanation.memorize || [],
      additionalContext: explanation.additional_context || null
    };

    // Enhanced parsing when structured data is not available
    if (!parsed.whyCorrect && text) {
      // Try to extract "why correct" section
      const correctMatch = text.match(/(?:correct answer is|option [A-F] is correct because|^The correct answer is[A-F]because)(.*?)(?=(?:Option [A-F]|Why|Other options|References?:|Source:|$))/is);
      
      if (correctMatch) {
        parsed.whyCorrect = correctMatch[1].trim();
      } else {
        // Fallback: use first substantive paragraph
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
        if (sentences.length > 0) {
          // Take first 2-3 sentences that explain the solution
          parsed.whyCorrect = sentences.slice(0, Math.min(3, sentences.length)).join('. ').trim() + '.';
        }
      }
    }

    // Try to extract why wrong answers from text
    if (Object.keys(parsed.whyWrong).length === 0 && text) {
      const options = ['A', 'B', 'C', 'D', 'E', 'F'];
      const correctAnswers = Array.isArray(question.correct_answer) 
        ? question.correct_answer 
        : [question.correct_answer];
      
      options.forEach(opt => {
        if (!correctAnswers.includes(opt)) {
          // Look for patterns like "Option A is incorrect because..." or "A is wrong because..."
          const patterns = [
            new RegExp(`Option ${opt}[:\\s]+(.+?)(?=Option [A-F]|References?:|Source:|$)`, 'is'),
            new RegExp(`${opt}[:\\s]+(.+?)(?=Option [A-F]|[A-F]:|References?:|Source:|$)`, 'is'),
            new RegExp(`\\b${opt}\\b[^.]*?(?:is incorrect|is wrong|incorrect|not suitable|not appropriate)[^.]*\\.`, 'i')
          ];
          
          for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1] && match[1].trim().length > 20) {
              parsed.whyWrong[opt] = match[1].trim().split(/[.!?]/)[0] + '.';
              break;
            }
          }
        }
      });
    }

    // Extract exam tips from common patterns
    if (!parsed.tips && text) {
      const tipsPatterns = [
        /(?:exam tip|tip for exam|remember|key point|important)[\s:]+(.+?)(?=\.|$)/is,
        /(?:AWS .+? when)[\s:]+(.+?)(?=\.|$)/i,
        /(?:always|never|must|should)[\s]+(?:use|choose|select|consider)[\s]+(.+?)(?=\.|$)/i
      ];
      
      for (const pattern of tipsPatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim().length > 15) {
          parsed.tips = match[1].trim() + '.';
          break;
        }
      }
      
      // Fallback: look for sentences with "best practice" or similar
      if (!parsed.tips) {
        const tipSentences = text.match(/[^.!?]*(?:best practice|recommended|guidance|optimization|when choosing)[^.!?]*[.!?]/gi);
        if (tipSentences && tipSentences.length > 0) {
          parsed.tips = tipSentences[0].trim();
        }
      }
    }

    // Extract key points to memorize
    if (parsed.memorize.length === 0 && text) {
      // Look for bullet points or numbered lists
      const bulletMatches = text.match(/[•\-\*]\s*(.+?)(?=\n|$)/g);
      if (bulletMatches && bulletMatches.length > 0) {
        parsed.memorize = bulletMatches
          .map(m => m.replace(/^[•\-\*]\s*/, '').trim())
          .filter(m => m.length > 10)
          .slice(0, 5);
      } else {
        // Extract sentences with key technical terms
        const keyTerms = ['scalable', 'highly available', 'cost-effective', 'secure', 'durable', 
                         'automatically', 'managed', 'serverless', 'real-time', 'encrypted'];
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        
        const keyPoints = sentences.filter(s => 
          keyTerms.some(term => s.toLowerCase().includes(term))
        ).slice(0, 3);
        
        if (keyPoints.length > 0) {
          parsed.memorize = keyPoints.map(s => s.trim());
        }
      }
    }

    return parsed;
  };

  const parsed = parseExplanation();
  const difficulty = getDifficulty();
  
  // Spanish labels for UI (titles stay in Spanish)
  const difficultyLabels = ['Muy Fácil', 'Fácil', 'Medio', 'Difícil', 'Muy Difícil'];
  const difficultyColors = ['text-green-600', 'text-blue-600', 'text-yellow-600', 'text-orange-600', 'text-red-600'];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mt-4 border-t-4 border-aws-blue">
      {/* Result Header with Score */}
      <div className="flex items-center justify-between gap-3 mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <>
              <CheckCircle2 className="text-aws-green shrink-0" size={32} />
              <div>
                <span className="font-bold text-xl text-aws-green block">¡Correcto! 🎉</span>
                <span className="text-sm text-gray-600">
                  Tu respuesta: <span className="font-semibold">
                    {Array.isArray(selected) ? selected.join(', ') : selected}
                  </span>
                </span>
              </div>
            </>
          ) : (
            <>
              <XCircle className="text-aws-red shrink-0" size={32} />
              <div>
                <span className="font-bold text-xl text-aws-red block">Incorrecto</span>
                <span className="text-sm text-gray-600">
                  Tu respuesta: <span className="font-semibold text-aws-red">
                    {Array.isArray(selected) ? selected.join(', ') : selected}
                  </span> | 
                  Correcta: <span className="font-semibold text-aws-green">
                    {' '}{Array.isArray(question.correct_answer) ? question.correct_answer.join(', ') : question.correct_answer}
                  </span>
                </span>
              </div>
            </>
          )}
        </div>
        
        {/* Difficulty Badge */}
        <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shrink-0">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={16} 
              className={i < difficulty ? difficultyColors[difficulty - 1] : 'text-gray-300'}
              fill={i < difficulty ? 'currentColor' : 'none'}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Correct Answer Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-l-4 border-aws-green">
          <div className="flex items-center gap-2 mb-3">
            <Award className="text-aws-green" size={24} />
            <h3 className="font-bold text-lg text-aws-dark">
              ¿Por qué {question.multi_select ? 'las opciones' : 'la opción'}{' '}
              {Array.isArray(question.correct_answer) ? question.correct_answer.join(' y ') : question.correct_answer}{' '}
              {question.multi_select ? 'son correctas' : 'es correcta'}?
            </h3>
          </div>
          <p className="text-base text-gray-800 leading-relaxed">
            {parsed.whyCorrect || parsed.mainExplanation}
          </p>
        </div>

        {/* Why Others are Wrong - Show if we have data OR provide general feedback */}
        {!isCorrect && (
          <div className="bg-red-50 p-5 rounded-xl border-l-4 border-aws-red">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-aws-red" size={24} />
              <h3 className="font-bold text-lg text-aws-dark">
                ¿Por qué las otras opciones NO son correctas?
              </h3>
            </div>
            
            {Object.keys(parsed.whyWrong).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(parsed.whyWrong).map(([letter, reason]) => (
                  <div key={letter} className="bg-white p-4 rounded-lg border-l-2 border-aws-red">
                    <div className="flex items-start gap-2">
                      <XCircle className="text-aws-red shrink-0 mt-0.5" size={18} />
                      <div>
                        <span className="font-bold text-aws-red">Opción {letter}:</span>
                        <p className="text-sm text-gray-700 mt-1">{reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Lee cuidadosamente la explicación completa arriba para entender por qué las otras opciones 
                  no cumplen con todos los requisitos o introducen complejidad innecesaria, mayor costo, 
                  o no se alinean con las mejores prácticas de AWS.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Two Column Layout for Services and Concept */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* AWS Services */}
          {parsed.services.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="text-aws-blue" size={20} />
                <h4 className="font-semibold text-aws-dark">Servicios AWS</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsed.services.map((service, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 bg-aws-blue text-white text-xs font-medium rounded-full shadow-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Architectural Concept */}
          {parsed.concept && (
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="text-aws-purple" size={20} />
                <h4 className="font-semibold text-aws-dark">Concepto</h4>
              </div>
              <p className="text-sm font-medium text-aws-purple">
                {parsed.concept}
              </p>
            </div>
          )}
        </div>

        {/* Exam Tips - Always show with fallback */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl border-l-4 border-yellow-500">
          <div className="flex items-start gap-3">
            <TrendingUp className="text-yellow-600 shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h4 className="font-bold text-aws-dark mb-2">💡 Tip para el examen</h4>
              {parsed.tips ? (
                <p className="text-sm text-gray-700 leading-relaxed">{parsed.tips}</p>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">
                  Enfócate en entender <strong>por qué</strong> esta solución es la más óptima. 
                  En el examen, AWS busca la respuesta que mejor cumple <em>todos</em> los requisitos 
                  con el menor costo operacional y la mayor simplicidad.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Key Points to Memorize - Always show with fallback */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-xl border-l-4 border-teal-500">
          <h4 className="font-bold text-aws-dark mb-3 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Puntos clave para memorizar
          </h4>
          {parsed.memorize.length > 0 ? (
            <ul className="space-y-2">
              {parsed.memorize.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="text-aws-green shrink-0 mt-0.5" size={18} />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2">
              <li className="flex items-start gap-3 text-sm text-gray-700">
                <CheckCircle2 className="text-aws-green shrink-0 mt-0.5" size={18} />
                <span className="leading-relaxed">
                  <strong>{parsed.concept}</strong> - Entender el dominio arquitectónico es clave
                </span>
              </li>
              {parsed.services.slice(0, 3).map((service, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="text-aws-green shrink-0 mt-0.5" size={18} />
                  <span className="leading-relaxed">
                    <strong>{service}</strong> - Revisar casos de uso y limitaciones
                  </span>
                </li>
              ))}
              {parsed.services.length === 0 && (
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="text-aws-green shrink-0 mt-0.5" size={18} />
                  <span className="leading-relaxed">
                    Identifica las palabras clave en la pregunta que señalan hacia la solución óptima
                  </span>
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Additional Context - AWS Manual Style */}
        {parsed.additionalContext && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-xl border-l-4 border-indigo-500">
            <div className="flex items-start gap-3">
              <BookOpen className="text-indigo-600 shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-aws-dark mb-2">📚 Contexto adicional (Manual AWS)</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{parsed.additionalContext}</p>
              </div>
            </div>
          </div>
        )}

        {/* Difficulty Info */}
        <div className="text-center py-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">
            Nivel de dificultad: <span className={`font-bold ${difficultyColors[difficulty - 1]}`}>
              {difficultyLabels[difficulty - 1]}
            </span>
          </span>
        </div>
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={onNext}
        className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-aws-blue to-blue-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all min-h-[44px] shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        {isLastQuestion ? '🎯 Ver resultados finales' : '➡️ Siguiente pregunta'}
      </button>
    </div>
  );
}
