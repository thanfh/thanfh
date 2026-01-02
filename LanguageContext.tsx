
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { PROFILE, UI_TEXT } from './constants';

// Re-define simplified interface for compatibility or dead code
interface LanguageContextType {
  language: 'en';
  toggleLanguage: () => void;
  t: (key: string) => string;
  profile: typeof PROFILE;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en'>('en');

  const toggleLanguage = () => {
     console.log("Language toggle disabled");
  };

  const t = (key: string) => {
    // @ts-ignore
    return UI_TEXT[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, profile: PROFILE }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Provide fallback so tests/legacy code doesn't crash immediately
    return {
        language: 'en' as const,
        toggleLanguage: () => {},
        t: (k: string) => k,
        profile: PROFILE
    };
  }
  return context;
};
