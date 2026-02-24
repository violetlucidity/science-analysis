import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'term-highlight': '#14b8a6', // teal-500
      },
    },
  },
  plugins: [],
} satisfies Config
