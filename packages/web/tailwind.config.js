/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          50: '#EEEDFB',
          100: '#DDDCF7',
          200: '#BBB8EF',
          300: '#9995E7',
          400: '#7771DF',
          500: '#6C5CE7',
          600: '#5647C5',
          700: '#4136A3',
          800: '#2C2581',
          900: '#18145E',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          50: '#f0f0f0',
          100: '#e0e0e0',
          200: '#c0c0c0',
          300: '#a0a0a0',
          400: '#808080',
          500: '#606060',
          600: '#404040',
          700: '#2a2a2a',
          800: '#1a1a1a',
          900: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}