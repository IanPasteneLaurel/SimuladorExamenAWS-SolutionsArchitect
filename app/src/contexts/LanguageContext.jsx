import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Language Context
 * 
 * Provides language state and toggle functionality across the app.
 * Persists language preference in localStorage.
 * 
 * Supported languages: 'en' (English), 'es' (Español)
 */

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Load from localStorage or default to English
    const saved = localStorage.getItem('simulator-language');
    return saved || 'en';
  });

  // Persist language preference
  useEffect(() => {
    localStorage.setItem('simulator-language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const setToEnglish = () => setLanguage('en');
  const setToSpanish = () => setLanguage('es');

  const value = {
    language,
    isEnglish: language === 'en',
    isSpanish: language === 'es',
    toggleLanguage,
    setToEnglish,
    setToSpanish,
    // Helper for getting translated text with fallback
    t: (enText, esText) => language === 'es' && esText ? esText : enText
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context
 * 
 * @returns {Object} Language context with:
 *   - language: 'en' | 'es'
 *   - isEnglish: boolean
 *   - isSpanish: boolean
 *   - toggleLanguage: () => void
 *   - setToEnglish: () => void
 *   - setToSpanish: () => void
 *   - t: (enText, esText) => string - Helper for translation with fallback
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Helper hook for getting translated question text
 * Handles fallback to English if Spanish translation not available
 */
export function useTranslatedQuestion(question) {
  const { language } = useLanguage();
  
  return {
    questionText: language === 'es' && question.question_es 
      ? question.question_es 
      : question.question_en,
    
    options: language === 'es' && question.options_es 
      ? question.options_es 
      : question.options,
    
    explanation: {
      fullText: language === 'es' && question.explanation?.full_text_es
        ? question.explanation.full_text_es
        : question.explanation?.full_text || '',
      
      whyCorrect: language === 'es' && question.explanation?.why_correct_es
        ? question.explanation.why_correct_es
        : question.explanation?.why_correct || '',
      
      whyWrong: language === 'es' && question.explanation?.why_wrong_es
        ? question.explanation.why_wrong_es
        : question.explanation?.why_wrong || {},
      
      examTips: language === 'es' && question.explanation?.exam_tips_es
        ? question.explanation.exam_tips_es
        : question.explanation?.exam_tips || '',
      
      memorize: language === 'es' && question.explanation?.memorize_es
        ? question.explanation.memorize_es
        : question.explanation?.memorize || []
    }
  };
}
