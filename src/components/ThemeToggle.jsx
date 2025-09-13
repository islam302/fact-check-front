import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col gap-2">
      <motion.button
        onClick={toggleTheme}
        className={`relative w-20 h-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${
          isDark 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_4px_15px_rgba(99,102,241,.3)]' 
            : 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_4px_15px_rgba(245,158,11,.3)]'
        }`}
        whileHover={{ 
          scale: 1.05,
          boxShadow: isDark 
            ? '0_6px_20px_rgba(99,102,241,.4)' 
            : '0_6px_20px_rgba(245,158,11,.4)'
        }}
        whileTap={{ scale: 0.95 }}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Background labels with emojis */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <motion.span 
            className={`text-sm transition-colors ${isDark ? 'text-white' : 'text-white/60'}`}
            animate={{ scale: isDark ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            🌙
          </motion.span>
          <motion.span 
            className={`text-sm transition-colors ${!isDark ? 'text-white' : 'text-white/60'}`}
            animate={{ scale: !isDark ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            ☀️
          </motion.span>
        </div>

        {/* Toggle circle with theme icon */}
        <motion.div
          className="absolute top-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
          animate={{
            x: isDark ? 40 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {/* Theme icon */}
          <motion.div
            animate={{
              rotate: isDark ? 0 : 0,
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.3,
              scale: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            }}
          >
            {isDark ? (
              // Moon icon for dark mode
              <motion.svg
                className="w-4 h-4 text-indigo-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                animate={{ 
                  filter: "drop-shadow(0 0 4px rgba(99,102,241,0.5))"
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </motion.svg>
            ) : (
              // Sun icon for light mode
              <motion.svg
                className="w-4 h-4 text-amber-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                animate={{ 
                  filter: "drop-shadow(0 0 4px rgba(245,158,11,0.5))",
                  rotate: [0, 360]
                }}
                transition={{ 
                  filter: { duration: 2, repeat: Infinity, repeatType: "reverse" },
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" }
                }}
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </motion.svg>
            )}
          </motion.div>
        </motion.div>
      </motion.button>
      
      {/* Theme labels with better visibility */}
      <div className="flex justify-between text-xs font-medium">
        <span className={`transition-colors ${isDark ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
          Dark
        </span>
        <span className={`transition-colors ${!isDark ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
          Light
        </span>
      </div>
    </div>
  );
};

