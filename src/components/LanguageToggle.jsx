import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageToggle = () => {
  const { isArabic, toggleLanguage } = useLanguage();

  return (
    <div className="inline-flex flex-col gap-0">
      <div
        className={`inline-flex items-center rounded-full p-0.5 shadow-sm border ${
          isArabic ? 'bg-emerald-600/10 border-emerald-400/30' : 'bg-white/80 border-slate-200'
        }`}
        role="group"
        aria-label="Language selector"
      >
        <motion.button
          onClick={() => !isArabic && toggleLanguage()}
          className={`flex items-center gap-0 px-1 py-0.5 rounded-full text-[9px] sm:text-[10px] transition ${
            isArabic
              ? 'bg-emerald-500 text-white shadow'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          aria-pressed={isArabic}
        >
          <span className="font-bold">ع</span>
        </motion.button>
        <motion.button
          onClick={() => isArabic && toggleLanguage()}
          className={`flex items-center gap-0 px-1 py-0.5 rounded-full text-[9px] sm:text-[10px] transition ${
            !isArabic
              ? 'bg-blue-600 text-white shadow'
              : 'text-white/80 hover:bg-white/10'
          }`}
          aria-pressed={!isArabic}
        >
          <span className="font-bold">EN</span>
        </motion.button>
      </div>
    </div>
  );
};
