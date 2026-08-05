// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary-yellow': '#fdc416',
        'primary-dark': '#1a0d06',
        'custom-gray': '#666666',
        'custom-light': '#f8f8f8',
      },
      fontFamily: {
        serif: ['Inter', 'system-ui', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        '12': '12px',
        '50': '50px',
      },
      animation: {
        'subtleFloat': 'subtleFloat 5s ease-in-out infinite',
      },
      keyframes: {
        subtleFloat: {
          '0%, 100%': { 
            transform: 'rotate(-15deg) scaleX(-1) translateY(0)' 
          },
          '50%': { 
            transform: 'rotate(-12deg) scaleX(-1) translateY(-20px)' 
          },
        }
      }
    },
  },
  plugins: [],
}