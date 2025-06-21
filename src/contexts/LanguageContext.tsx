
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'rw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en'); // Default to English
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load saved language preference or default to English
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'rw')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Load translations based on current language
    const loadTranslations = async () => {
      try {
        const translationModule = await import(`../translations/${language}.ts`);
        setTranslations(translationModule.default);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };

    loadTranslations();
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translations[key] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
