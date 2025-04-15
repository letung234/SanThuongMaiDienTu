/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.{js,ts,jsx,tsx,pug}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', 
        secondary: '#1d4ed8', 
      },
      keyframes: {
        transformMenu: {
          '0%': {
            transform: 'translateY(-100%)'
          },
          '100%': {
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        transformMenu: 'transformMenu .5s ease-in-out'
      }
    }
  },
  plugins: []
}
