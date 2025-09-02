import { useContext, useState, useEffect } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import type { LanguageContextType } from '../contexts/LanguageContext';

export const useLanguageState = (): LanguageContextType => {
  const [language, setLanguageState] = useState<'vi' | 'en'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'vi' | 'en') || 'vi';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: 'vi' | 'en') => {
    setLanguageState(lang);
  };

  const t = (key: string, fallback = key) => {
    // Simple translation function - can be enhanced later
    return fallback;
  };

  return { language, setLanguage, t };
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
