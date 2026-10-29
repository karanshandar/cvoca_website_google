/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    // DESIGN.md `rounded` scale. Replaces Tailwind's defaults, so an off-scale class
    // (rounded-md, rounded-3xl) no longer compiles. DEFAULT is the small corner on focus rings.
    borderRadius: {
      none: '0px',
      DEFAULT: '0.25rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px',
    },
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'sans-serif'],
      },
      // DESIGN.md `typography` tokens as text-h1 … text-caption. Line heights match the
      // Tailwind sizes they stand for (h1 = text-5xl, h2 = text-4xl, h3 = text-xl, …).
      fontSize: {
        h1: ['3rem', { lineHeight: '1', fontWeight: '800' }],
        h2: ['2.25rem', { lineHeight: '2.5rem', fontWeight: '800' }],
        h3: ['1.25rem', { lineHeight: '1.75rem', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1rem', fontWeight: '700' }],
      },
      colors: {
        primary: {
          DEFAULT: '#2563eb', // Royal Blue
          light: '#60a5fa',
          dark: '#1e40af',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: '#0891b2', // Cyan
          light: '#22d3ee',
          dark: '#0e7490',
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        success: {
          DEFAULT: '#16a34a',
          light: '#bbf7d0',
          dark: '#15803d',
          50: '#f0fdf4',
          100: '#dcfce7',
          700: '#15803d',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#fde68a',
          dark: '#b45309',
          50: '#fffbeb',
          100: '#fef3c7',
          700: '#b45309',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#fecaca',
          dark: '#b91c1c',
          50: '#fef2f2',
          100: '#fee2e2',
          700: '#b91c1c',
        },
        accent: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
          dark: '#6d28d9',
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          700: '#6d28d9',
        },
        background: {
          light: '#f8fafc', // Slate 50
          dark: '#0f172a',  // Slate 900
        },
        text: {
          light: '#334155', // Slate 700
          dark: '#f1f5f9',  // Slate 100
        },
        card: {
          light: '#ffffff',
          dark: '#1e293b', // Slate 800
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: [],
}
