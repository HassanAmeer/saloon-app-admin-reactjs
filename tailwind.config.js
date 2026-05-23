import { themeColors } from "./src/config.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: themeColors.primary,
          glow: themeColors.primaryGlow,
        },
        tea: {
          50: themeColors.accent50,
          100: themeColors.accent100,
          200: themeColors.accent200,
          300: themeColors.accent300,
          400: themeColors.accent400,
          500: themeColors.primary,
          600: themeColors.primaryHover, // Melon hover
          700: themeColors.primary, // Melon primary buttons
          800: themeColors.textMain, // Charcoal titles
          900: themeColors.textMain, // Charcoal text
        },
        brown: {
          50: themeColors.accent50,
          100: themeColors.accent100,
          200: themeColors.accent200,
          300: themeColors.accent300,
          400: themeColors.accent400,
          500: themeColors.primary,
          600: themeColors.primaryHover,
          700: themeColors.primary,
          800: themeColors.textMain,
          900: themeColors.textMain,
        },
      },
    },
  },
  plugins: [],
}

