/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        brand: {
          dark: '#0a1630',      // الخلفية الأساسية
          dark2:'#0e1c3f',      // تدرّج أغمق
          blue: '#00BFFF',      // أزرار أساسية
          green:'#25D366',      // واتساب
          pink: '#ff7ab6',      // تدرّج نص ذكي
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,.25)',
        glow: '0 0 24px rgba(0,191,255,.35)',
      },
      borderRadius: {
        xl2: '1rem',
      }
    },
  },
  plugins: [],
}
