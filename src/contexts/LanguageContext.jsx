import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [isArabic, setIsArabic] = useState(() => {
    // Check localStorage first, then default to Arabic
    const saved = localStorage.getItem('language');
    if (saved) {
      return saved === 'arabic';
    }
    return true; // Default to Arabic
  });

  useEffect(() => {
    // Apply language to document
    if (isArabic) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
    }
    
    // Save to localStorage
    localStorage.setItem('language', isArabic ? 'arabic' : 'english');
  }, [isArabic]);

  const toggleLanguage = () => {
    setIsArabic(prev => !prev);
  };

  const value = {
    isArabic,
    toggleLanguage,
    language: isArabic ? 'arabic' : 'english'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
