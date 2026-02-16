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
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
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
