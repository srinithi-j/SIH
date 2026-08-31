/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#eef4fb',
          100: '#d7e6f5',
          600: '#1a4d8f',
          700: '#123863',
          900: '#0b2440',
        },
      },
    },
  },
  plugins: [],
};
