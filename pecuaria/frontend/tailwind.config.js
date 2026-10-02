/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        verde: {
          50: '#f1f8f0',
          100: '#dcedd9',
          200: '#bbdcb5',
          300: '#90c587',
          400: '#67ab5e',
          500: '#48903f',
          600: '#357330',
          700: '#2c5c2a',
          800: '#274a26',
          900: '#223e22',
          950: '#0f2110'
        },
        terra: {
          50: '#fbf7f0',
          100: '#f3e9d8',
          200: '#e6d0ad',
          300: '#d6b27c',
          400: '#c6924f',
          500: '#b97935',
          600: '#a4622c',
          700: '#874b27',
          800: '#6f3e26',
          900: '#5d3422',
          950: '#331a10'
        },
        leite: {
          50: '#fefefe',
          100: '#fbfaf8',
          200: '#f5f3ee'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
