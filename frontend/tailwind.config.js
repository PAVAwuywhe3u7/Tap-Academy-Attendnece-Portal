/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#030815',
          900: '#07112b',
          800: '#0b1f4d',
          700: '#12316f',
          600: '#1a4596',
          500: '#2a5fcc',
          400: '#4e82f2'
        },
        accent: {
          500: '#38bdf8',
          400: '#67e8f9'
        }
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif']
      },
      boxShadow: {
        glow: '0 10px 40px rgba(56, 189, 248, 0.18)',
        card: '0 12px 30px rgba(3, 8, 21, 0.35)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(140deg, #030815 0%, #0b1f4d 45%, #0f2a64 100%)',
        'button-gradient': 'linear-gradient(120deg, #1d4ed8 0%, #0ea5e9 100%)'
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        floatUp: 'floatUp 0.45s ease-out both'
      }
    }
  },
  plugins: []
};