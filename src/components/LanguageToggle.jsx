import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageToggle = () => {
  const { isArabic, toggleLanguage } = useLanguage();

  return (
    <div className="flex flex-col gap-2">
      <motion.button
        onClick={toggleLanguage}
        className={`relative w-20 h-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${
          isArabic 
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isArabic ? 'Switch to English' : 'Switch to Arabic'}
      >
        {/* Background labels */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <span className={`text-xs font-semibold transition-colors ${isArabic ? 'text-white' : 'text-white/60'}`}>
            ع
          </span>
          <span className={`text-xs font-semibold transition-colors ${!isArabic ? 'text-white' : 'text-white/60'}`}>
            EN
          </span>
        </div>

        {/* Toggle circle with globe icon */}
        <motion.div
          className="absolute top-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
          animate={{
            x: isArabic ? 40 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {/* Globe icon */}
          <motion.svg
            className="w-4 h-4 text-gray-700"
            fill="currentColor"
            viewBox="0 0 20 20"
            animate={{
              rotate: isArabic ? 0 : 0,
            }}
            transition={{
              duration: 0.3
            }}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
              clipRule="evenodd"
            />
          </motion.svg>
        </motion.div>
      </motion.button>
      
      {/* Language labels with better visibility */}
      <div className="flex justify-between text-xs font-medium">
        <span className={`transition-colors ${isArabic ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
          العربية
        </span>
        <span className={`transition-colors ${!isArabic ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
          English
        </span>
      </div>
    </div>
  );
};
