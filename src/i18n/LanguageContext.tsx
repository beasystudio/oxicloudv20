import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { en } from './translations/en';
import { nl } from './translations/nl';

export type Language = 'en' | 'nl';

type Translations = typeof en;

const translations: Record<Language, Translations> = { en, nl };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English
        let fallback: any = translations.en;
        for (const fk of keys) {
          fallback = fallback?.[fk];
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    return typeof result === 'string' ? result : key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
