/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'radar-bg': '#070B0F',
        'radar-panel': '#0E141B',
        'radar-panel2': '#141D27',
        'radar-amber': '#FFB73E',
        'radar-cyan': '#5BD6E6',
        'radar-green': '#3DDC97',
        'radar-red': '#FF5C5C',
        'radar-muted': '#7D8B98',
        'radar-bright': '#E8F0F5',
      },
      fontFamily: {
        chakra: ['Chakra Petch', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'radar-sweep': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      animation: {
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
      },
    },
  },
  plugins: [],
}
