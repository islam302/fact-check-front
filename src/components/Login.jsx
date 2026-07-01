import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import unaLogoDark from '../assets/unalogo-dark.png';
import unaLogoLight from '../assets/unalogo-light.png';

const TRANSLATIONS = {
  arabic: {
    title: 'تسجيل الدخول',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    login: 'دخول',
    loggingIn: 'جاري تسجيل الدخول...',
    error: 'خطأ في اسم المستخدم أو كلمة المرور',
    logoAlt: 'شعار الجامعة',
  },
  english: {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    loggingIn: 'Logging in...',
    error: 'Invalid username or password',
    logoAlt: 'University Logo',
  },
  french: {
    title: 'Connexion',
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    login: 'Connexion',
    loggingIn: 'Connexion en cours...',
    error: "Nom d'utilisateur ou mot de passe invalide",
    logoAlt: "Logo de l'université",
  },
};

export function Login() {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const { isArabic, language } = useLanguage();
  const T = TRANSLATIONS[language] || TRANSLATIONS.english;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      console.error('Login error:', err);
      setError(T.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`min-h-screen min-h-[100dvh] relative overflow-hidden transition-colors duration-500 flex items-center justify-center px-3 sm:px-4 md:px-6 py-4 sm:py-6 ${
        isDark
          ? 'bg-[#05070e] text-white'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-800'
      }`}
    >
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0">
        {isDark ? (
          <>
            <div className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(88,101,242,0.18),_transparent_60%)] animate-slow-pulse" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[55vw] h-[55vw] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(24,182,155,0.18),_transparent_60%)] animate-slow-pulse delay-300" />
          </>
        ) : (
          <>
            <div className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.15),_transparent_60%)] animate-slow-pulse" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[55vw] h-[55vw] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.15),_transparent_60%)] animate-slow-pulse delay-300" />
          </>
        )}
      </div>

      {/* Theme and Language Toggles */}
      <div
        className="absolute z-20 flex flex-row sm:flex-col gap-2 sm:gap-3 top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 scale-75 sm:scale-90 md:scale-100 origin-top-left"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.25rem)' }}
      >
        <ThemeToggle />
        <LanguageToggle />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 w-full max-w-[90vw] xs:max-w-sm sm:max-w-md md:max-w-lg p-[3px] sm:p-1 rounded-2xl ${
          isDark
            ? 'bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-teal-500/30'
            : 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20'
        }`}
      >
        <div
          className={`rounded-2xl backdrop-blur-xl p-5 sm:p-6 md:p-8 ${
            isDark
              ? 'bg-[#0a0f1c]/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]'
              : 'bg-white/80 shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)]'
          }`}
        >
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src={isDark ? unaLogoDark : unaLogoLight}
              alt={T.logoAlt}
              className="h-24 sm:h-28 md:h-32 w-auto object-contain"
              draggable="false"
            />
          </div>

          {/* Title */}
          <h1
            className={`text-2xl sm:text-3xl font-bold text-center mb-6 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}
          >
            {T.title}
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-white/70' : 'text-slate-600'
                }`}
              >
                {T.username}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 transition-colors ${
                  isDark
                    ? 'bg-[#0b1327] border border-white/20 focus:ring-indigo-400/60 text-white placeholder-white/40'
                    : 'bg-white border border-slate-300 focus:ring-blue-400/60 text-slate-800 placeholder-slate-400'
                }`}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-white/70' : 'text-slate-600'
                }`}
              >
                {T.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 transition-colors ${
                  isDark
                    ? 'bg-[#0b1327] border border-white/20 focus:ring-indigo-400/60 text-white placeholder-white/40'
                    : 'bg-white border border-slate-300 focus:ring-blue-400/60 text-slate-800 placeholder-slate-400'
                }`}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl px-4 py-3 text-center text-base ${
                  isDark
                    ? 'bg-red-900/50 text-red-200 border border-red-700/50'
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full relative px-5 py-3.5 rounded-xl font-bold text-base overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group focus:outline-none focus:ring-4 focus:ring-indigo-400/50 ${
                isDark
                  ? 'bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-teal-400 shadow-[0_10px_30px_rgba(99,102,241,.4)]'
                  : 'bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 shadow-[0_10px_30px_rgba(59,130,246,.4)]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-fuchsia-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 -top-2 -left-2 w-[calc(100%+16px)] h-[calc(100%+16px)] bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>{T.loggingIn}</span>
                  </>
                ) : (
                  <span>{T.login}</span>
                )}
              </span>
            </motion.button>
          </form>
        </div>
      </motion.div>

      <style>{`
        .animate-slow-pulse { animation: slowPulse 7s ease-in-out infinite; }
        @keyframes slowPulse {
          0%, 100% { transform: scale(1); opacity: .9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
