/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tea: {
          50: '#faf8f5',
          100: '#f5f3f0',
          200: '#e8e3dc',
          300: '#d2b48c', // Tan - backgrounds
          400: '#c19a6b',
          500: '#a67c52',
          600: '#8b6f47', // Medium brown
          700: '#8B4513', // Saddle brown - primary buttons
          800: '#6d3710',
          900: '#4a250b',
        },
        brown: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bc9a8b',
          600: '#a67c69',
          700: '#8b6f5c',
          800: '#6d5647',
          900: '#4a3f35',
        },
      },
    },
  },
  plugins: [],
}

