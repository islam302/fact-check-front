/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 👈 مهم جدًا لتفعيل الوضع الداكن يدويًا
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        brand: {
          dark: '#0a1630',      // الخلفية الأساسية
          dark2: '#0e1c3f',     // تدرّج أغمق
          blue: '#00BFFF',      // أزرار أساسية
          green: '#25D366',     // واتساب
          pink: '#ff7ab6',      // تدرّج نص ذكي
        },
        // Light mode colors
        light: {
          bg: '#f8fafc',        // Light background
          card: '#ffffff',      // Card background
          text: '#1e293b',      // Primary text
          textSecondary: '#64748b', // Secondary text
          border: '#e2e8f0',    // Borders
          accent: '#3b82f6',    // Accent blue
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,.25)',
        glow: '0 0 24px rgba(0,191,255,.35)',
        'light-glow': '0 0 24px rgba(59,130,246,.35)',
        'light-soft': '0 10px 30px rgba(0,0,0,.1)',
      },
      borderRadius: {
        xl2: '1rem',
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-light-warm': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      }
    },
  },
  plugins: [],
}
