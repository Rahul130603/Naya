/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B3B82',
          'navy-dark': '#072658',
          'navy-light': '#1D4ED8',
          'navy-soft': '#EFF6FF',
          green: '#16A34A',
          'green-dark': '#15803D',
          'green-light': '#22C55E',
          'green-soft': '#F0FDF4',
          'green-accent': '#4ADE80',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 25px -5px rgba(22, 163, 74, 0.3)',
        'glow-navy': '0 0 25px -5px rgba(11, 59, 130, 0.3)',
        'card-soft': '0 10px 30px -10px rgba(15, 23, 42, 0.08)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out forwards',
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marqueeReverse 30s linear infinite',
        'shine': 'shine 4s ease-in-out infinite',
        'border-beam': 'borderBeam 6s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        shine: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        borderBeam: {
          '0%, 100%': { offsetDistance: '0%' },
          '50%': { offsetDistance: '100%' },
        }
      }
    },
  },
  plugins: [],
}
