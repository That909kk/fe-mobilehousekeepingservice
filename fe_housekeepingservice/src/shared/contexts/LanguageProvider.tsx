import React from 'react';
import type { ReactNode } from 'react';
import { LanguageContext } from './LanguageContext';
import { useLanguageState } from '../hooks/useLanguageHook';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const languageState = useLanguageState();

  return (
    <LanguageContext.Provider value={languageState}>
      {children}
    </LanguageContext.Provider>
  );
};
