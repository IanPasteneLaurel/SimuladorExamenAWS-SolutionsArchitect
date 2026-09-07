import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Language Toggle Component
 * 
 * Displays a toggle switch to change between English and Spanish.
 * Shows current language and allows one-click switching.
 * 
 * Variants:
 * - 'button': Large button with icon and text (default)
 * - 'compact': Small toggle switch
 * - 'dropdown': Dropdown menu style
 */

export default function LanguageToggle({ variant = 'button', className = '' }) {
  const { language, isEnglish, isSpanish, toggleLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`
          flex items-center gap-2 px-3 py-2 
          bg-white hover:bg-gray-50 
          border border-gray-200 rounded-lg 
          transition-all duration-200
          min-h-[44px]
          ${className}
        `}
        aria-label={`Change language to ${isEnglish ? 'Spanish' : 'English'}`}
      >
        <Globe size={18} className="text-aws-blue" />
        <span className="font-semibold text-sm text-gray-700">
          {isEnglish ? 'EN' : 'ES'}
        </span>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={toggleLanguage}
          className="
            flex items-center gap-2 px-4 py-2
            bg-white hover:bg-gray-50
            border border-gray-200 rounded-lg
            transition-all duration-200
            min-h-[44px]
            shadow-sm hover:shadow-md
          "
          aria-label="Change language"
        >
          <Globe size={20} className="text-aws-blue" />
          <span className="font-medium text-gray-700">
            {isEnglish ? 'English' : 'Español'}
          </span>
          <svg 
            className="w-4 h-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    );
  }

  // Default 'button' variant
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`
        group relative
        flex items-center gap-3 px-5 py-3
        bg-gradient-to-r from-blue-50 to-purple-50 
        hover:from-blue-100 hover:to-purple-100
        border-2 border-transparent
        hover:border-aws-blue
        rounded-xl
        transition-all duration-300
        shadow-sm hover:shadow-md
        min-h-[44px]
        ${className}
      `}
      aria-label={`Change language to ${isEnglish ? 'Spanish' : 'English'}`}
    >
      {/* Icon with rotation animation */}
      <div className="relative">
        <Globe 
          size={24} 
          className="text-aws-blue group-hover:rotate-12 transition-transform duration-300" 
        />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-aws-blue rounded-full animate-pulse" />
      </div>

      {/* Language text */}
      <div className="flex flex-col items-start">
        <span className="text-xs text-gray-500 font-medium">
          Language
        </span>
        <div className="flex items-center gap-2">
          <span className={`
            text-sm font-bold transition-all
            ${isEnglish ? 'text-aws-blue scale-110' : 'text-gray-400 scale-90'}
          `}>
            English
          </span>
          <span className="text-gray-300">|</span>
          <span className={`
            text-sm font-bold transition-all
            ${isSpanish ? 'text-aws-blue scale-110' : 'text-gray-400 scale-90'}
          `}>
            Español
          </span>
        </div>
      </div>

      {/* Toggle indicator */}
      <div className="ml-2 flex items-center">
        <div className="relative w-12 h-6 bg-gray-200 rounded-full transition-colors duration-300">
          <div className={`
            absolute top-0.5 w-5 h-5 
            bg-aws-blue rounded-full 
            transition-transform duration-300 ease-in-out
            shadow-md
            ${isSpanish ? 'translate-x-6' : 'translate-x-0.5'}
          `} />
        </div>
      </div>
    </button>
  );
}

/**
 * Compact inline language toggle (icon only with tooltip)
 */
export function LanguageIcon({ className = '' }) {
  const { isEnglish, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`
        relative p-2 
        text-gray-600 hover:text-aws-blue 
        hover:bg-gray-100 
        rounded-lg 
        transition-all duration-200
        min-h-[44px] min-w-[44px]
        group
        ${className}
      `}
      aria-label="Toggle language"
      title={`Switch to ${isEnglish ? 'Spanish' : 'English'}`}
    >
      <Globe size={20} />
      <span className="
        absolute -bottom-8 left-1/2 -translate-x-1/2
        px-2 py-1 
        bg-gray-800 text-white text-xs rounded
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
        pointer-events-none
        whitespace-nowrap
      ">
        {isEnglish ? 'EN' : 'ES'}
      </span>
    </button>
  );
}

/**
 * Simple text toggle button
 */
export function LanguageTextToggle({ className = '' }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`
        px-4 py-2
        font-semibold text-sm
        text-aws-blue hover:text-blue-700
        hover:bg-blue-50
        rounded-lg
        transition-all duration-200
        min-h-[44px]
        ${className}
      `}
    >
      {language === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
    </button>
  );
}
