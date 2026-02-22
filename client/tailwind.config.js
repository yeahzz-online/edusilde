/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F4C81',
        'primary-dark': '#0a3660',
        'primary-light': '#1a6ab5',
        accent: '#00B4D8',
        'accent-dark': '#0090ad',
        adminDark: '#1B262C',
        'admin-surface': '#243044',
        'admin-border': '#2d3f52',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0F4C81 0%, #00B4D8 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(15,76,129,0.1) 0%, rgba(0,180,216,0.1) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.14)',
        'primary': '0 4px 20px rgba(15, 76, 129, 0.35)',
        'accent': '0 4px 20px rgba(0, 180, 216, 0.35)',
      },
    },
  },
  plugins: [],
}
