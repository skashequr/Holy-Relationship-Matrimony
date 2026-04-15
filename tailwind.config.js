/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        islamic: {
          green: '#1b6a3b',
          'green-light': '#2e8b57',
          gold: '#c9a84c',
          'gold-light': '#f0c040',
          dark: '#1a2744',
          teal: '#0d7377',
        },
        brand: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f3d0fe',
          300: '#e9a8fd',
          400: '#da74fa',
          500: '#c84af5',
          600: '#af29e8',
          700: '#951dcc',
          800: '#7b1ba8',
          900: '#671a8a',
          DEFAULT: '#1a5276',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Arial', 'sans-serif'],
        bengali: ['var(--font-hind-siliguri)', 'Siyam Rupali', 'serif'],
      },
      backgroundImage: {
        'gradient-islamic': 'linear-gradient(135deg, #1a5276 0%, #1b6a3b 100%)',
        'gradient-gold': 'linear-gradient(135deg, #c9a84c 0%, #f0c040 100%)',
        'hero-pattern': "url('/images/pattern-islamic.svg')",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
