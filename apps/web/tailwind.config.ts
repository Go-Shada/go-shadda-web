import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6C5CE7',
          dark: '#4C3AE3',
          light: '#A29BFE',
        },
        primary: '#1D4ED8',
        'background-light': '#f5f7f8',
        'background-dark': '#101a22',
        'content-light': '#0d151c',
        'content-dark': '#e7eef4',
      },
      fontFamily: {
        display: ['\"Plus Jakarta Sans\"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
