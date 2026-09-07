/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        aws: {
          blue: '#0066CC',
          purple: '#9933FF',
          green: '#28A745',
          red: '#DC3545',
          orange: '#FF9900',
          gray: '#F5F7FA',
          dark: '#1A1A1A',
        },
      },
    },
  },
  plugins: [],
};
