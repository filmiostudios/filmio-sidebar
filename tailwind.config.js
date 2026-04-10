/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './extension/**/*.html'],
  theme: {
    extend: {
      colors: {
        filmio: {
          orange: '#FF633D',
          'orange-dark': '#E5502A',
        },
      },
    },
  },
  plugins: [],
};
