import type { Config } from 'tailwindcss'

/**
 * Colour contrast analysis for term-highlight:
 * Light mode: teal-700 (#0f766e) on white (#ffffff) = 5.68:1 (passes 4.5:1)
 * Dark mode:  teal-300 (#5eead4) on gray-900 (#111827) = ~8.5:1 (passes 4.5:1)
 */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'term-highlight': '#0f766e', // teal-700 — 5.68:1 contrast on white
        'term-highlight-dark': '#5eead4', // teal-300 — 8.5:1 contrast on gray-900
      },
    },
  },
  plugins: [],
} satisfies Config
