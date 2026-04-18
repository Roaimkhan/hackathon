/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        gold: {
          DEFAULT: '#FACC15',
          dark: '#CA8A04',
          light: '#FEF08A',
        },
        surface: {
          0: '#FFFFFF',
          1: '#F9FAFB',
          2: '#F3F4F6',
          3: '#E5E7EB',
        },
        ink: {
          primary: '#0A0A0A',
          secondary: '#374151',
          muted: '#6B7280',
          ghost: '#9CA3AF',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0.4px' }],
        sm: ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        base: ['16px', { lineHeight: '24px', letterSpacing: '0.5px' }],
        lg: ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
        xl: ['20px', { lineHeight: '28px', letterSpacing: '0px' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.5px' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.5px' }],
        '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-1px' }],
        '5xl': ['48px', { lineHeight: '48px', letterSpacing: '-1.5px' }],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'count-up': 'count-up 0.6s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in-scale': 'fade-in-scale 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}