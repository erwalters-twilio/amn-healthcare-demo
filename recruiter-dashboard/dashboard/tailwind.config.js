/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'amn-blue': '#0074A1',
        'amn-navy': '#003B5C',
        'amn-green': '#00A651',
        'dark-950': '#020617',
        'dark-900': '#0f172a',
        'dark-800': '#1e293b',
        'dark-700': '#334155',
        'dark-600': '#475569',
        'dark-500': '#64748b',
        'dark-400': '#94a3b8',
        'dark-300': '#cbd5e1',
      },
      animation: {
        'pulse-border': 'pulse-border 2s ease-in-out',
      },
      keyframes: {
        'pulse-border': {
          '0%, 100%': { borderColor: 'rgb(51 65 85)' },
          '50%': { borderColor: 'rgb(16 185 129)' },
        }
      }
    },
  },
  plugins: [],
}
