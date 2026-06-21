/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'radar-bg':     '#0B0F18',
        'radar-panel':  '#111827',
        'radar-panel2': '#1A2235',
        'radar-amber':  '#FFB73E',
        'radar-cyan':   '#5BD6E6',
        'radar-green':  '#3DDC97',
        'radar-red':    '#FF5C5C',
        'radar-muted':  '#8B9BB0',
        'radar-bright': '#EBF2FA',
      },
      fontFamily: {
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        chakra: ['Chakra Petch', 'sans-serif'],
        mono:   ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'radar-sweep': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)',   opacity: '0' },
        },
      },
      animation: {
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'pulse-slow':  'pulse-slow 2s ease-in-out infinite',
        'pulse-ring':  'pulse-ring 1.5s ease-out infinite',
      },
    },
  },
  plugins: [],
}
