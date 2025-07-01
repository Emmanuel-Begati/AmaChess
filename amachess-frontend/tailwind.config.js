/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'newsreader': ['Newsreader', 'serif'],
        'noto': ['Noto Sans', 'sans-serif'],
      },
      colors: {
        'chess-dark': '#111822',
        'chess-border': '#233248',
        'chess-blue': '#115fd4',
        'chess-gray': '#92a8c9',
        'chess-secondary': '#45618c',
      }
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
