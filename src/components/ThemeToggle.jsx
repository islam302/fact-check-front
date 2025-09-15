import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="inline-flex flex-col gap-1.5 sm:gap-2">
      <div
        className={`inline-flex items-center rounded-full p-1 shadow-sm border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200'
        }`}
        role="group"
        aria-label="Theme selector"
      >
        <motion.button
          onClick={() => !isDark && toggleTheme()}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm transition ${
            isDark
              ? 'bg-indigo-600/90 text-white shadow'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          aria-pressed={isDark}
        >
          <span role="img" aria-hidden>🌙</span>
          <span className="hidden xs:inline sm:inline">Dark</span>
        </motion.button>
        <motion.button
          onClick={() => isDark && toggleTheme()}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm transition ${
            !isDark
              ? 'bg-amber-400 text-white shadow'
              : 'text-white/80 hover:bg-white/10'
          }`}
          aria-pressed={!isDark}
        >
          <span role="img" aria-hidden>☀️</span>
          <span className="hidden xs:inline sm:inline">Light</span>
        </motion.button>
      </div>
    </div>
  );
};

