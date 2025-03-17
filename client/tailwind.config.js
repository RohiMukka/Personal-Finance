/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      backgroundColor: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        highlight: 'var(--highlight-bg)',
        card: 'var(--card-bg)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        income: 'var(--income-color)',
        expense: 'var(--expense-color)',
      },
      borderColor: {
        theme: 'var(--border-color)',
      },
      boxShadow: {
        theme: '0 1px 3px 0 var(--shadow-color)',
      },
    },
  },
  plugins: [],
};