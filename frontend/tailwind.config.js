/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          50: '#FDF8F5',
          100: '#F9ECE4',
          200: '#F3D6C5',
          300: '#EABCA1',
          400: '#DC9872',
          500: '#CD7548',
          600: '#B85C33',
          700: '#944626',
          800: '#753721',
          900: '#5F2D1C',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
