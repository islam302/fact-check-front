import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageToggle = () => {
  const { language, isArabic, setLanguage } = useLanguage();

  return (
    <div className="inline-flex flex-col gap-0">
      <div
        className={`inline-flex w-40 sm:w-48 items-center rounded-full p-1 shadow-sm border ${
          isArabic ? 'bg-emerald-600/10 border-emerald-400/30' : 'bg-white/80 border-slate-200'
        }`}
        role="group"
        aria-label="Language selector"
      >
        <motion.button
          onClick={() => setLanguage('arabic')}
          className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm leading-none transition ${
            language === 'arabic'
              ? 'bg-emerald-500 text-white shadow'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          aria-pressed={language === 'arabic'}
        >
          <span className="font-medium">ع</span>
        </motion.button>
        <motion.button
          onClick={() => setLanguage('english')}
          className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm leading-none transition ${
            language === 'english'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          aria-pressed={language === 'english'}
        >
          <span className="font-medium">EN</span>
        </motion.button>
        <motion.button
          onClick={() => setLanguage('french')}
          className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm leading-none transition ${
            language === 'french'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          aria-pressed={language === 'french'}
        >
          <span className="font-medium">FR</span>
        </motion.button>
      </div>
    </div>
  );
};
