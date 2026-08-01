/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#7a9bfc',
          500: '#4f6bf8',
          600: '#384cf0',
          700: '#2c39dc',
          800: '#262eb3',
          900: '#242b8e',
          950: '#151855',
        },
        factory: {
          navy: '#0F172A',
          card: '#FFFFFF',
          bg: '#F8FAFC',
          border: '#E2E8F0',
          muted: '#64748B',
          accent: '#2563EB',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        card: '0 2px 10px rgba(0, 0, 0, 0.04), 0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        touch: '0 6px 16px rgba(37, 99, 235, 0.25)',
      },
    },
  },
  plugins: [],
};
