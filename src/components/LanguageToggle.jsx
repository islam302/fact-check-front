import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageToggle = () => {
  const { isArabic, toggleLanguage } = useLanguage();

  return (
    <div className="inline-flex flex-col gap-1.5 sm:gap-2">
      <div
        className={`inline-flex items-center rounded-full p-1 shadow-sm border ${
          isArabic ? 'bg-emerald-600/10 border-emerald-400/30' : 'bg-white/80 border-slate-200'
        }`}
        role="group"
        aria-label="Language selector"
      >
        <motion.button
          onClick={() => !isArabic && toggleLanguage()}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm transition ${
            isArabic
              ? 'bg-emerald-500 text-white shadow'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          aria-pressed={isArabic}
        >
          <span className="font-bold">ع</span>
          <span className="hidden xs:inline sm:inline">العربية</span>
        </motion.button>
        <motion.button
          onClick={() => isArabic && toggleLanguage()}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm transition ${
            !isArabic
              ? 'bg-blue-600 text-white shadow'
              : 'text-white/80 hover:bg-white/10'
          }`}
          aria-pressed={!isArabic}
        >
          <span className="font-bold">EN</span>
          <span className="hidden xs:inline sm:inline">English</span>
        </motion.button>
      </div>
    </div>
  );
};
