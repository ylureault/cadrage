/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        insuffle: {
          dark: '#1a2a4a',
          blue: '#2a4a7a',
          gold: '#f5c518',
          'gold-dark': '#d4a810',
          light: '#fafafa',
          text: '#2d2d2d',
          muted: '#888888',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
};
