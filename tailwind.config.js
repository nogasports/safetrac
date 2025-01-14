/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFEE00',
        secondary: '#223F7F',
      },
      fontFamily: {
        alexandria: ['Alexandria', 'sans-serif'],
      },
      borderRadius: {
        '1deg': '1px',
      }
    },
  },
  plugins: [],
};
