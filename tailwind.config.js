/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sparring Brand Colors
        primary: {
          DEFAULT: '#E03131', // Fiery Red
          dark: '#C92A2A',
          light: '#FF6B6B',
        },
        secondary: {
          DEFAULT: '#1971C2', // Steel Blue
          dark: '#1864AB',
          light: '#4DABF7',
        },
        // Dark Mode Background Palette
        dark: {
          bg: '#0A0A0A',
          surface: '#141414',
          card: '#1C1C1E',
          border: '#2C2C2E',
          muted: '#3A3A3C',
        },
        // Text
        text: {
          primary: '#FFFFFF',
          secondary: '#AEAEB2',
          muted: '#636366',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
