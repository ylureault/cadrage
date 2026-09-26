/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design System Premium Insuffle (US-362)
        primary: '#141e37',
        accent: '#f2c245',
        'accent-dark': '#a67c00',
        surface: '#ffffff',
        'surface-alt': '#f8f9fc',
        border: '#e2e5eb',
        'text-primary': '#141e37',
        'text-muted': '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        academie: '#8E2183',
        // Legacy aliases
        insuffle: {
          dark: '#141e37',
          blue: '#1e3a5f',
          gold: '#f2c245',
          'gold-dark': '#a67c00',
          light: '#f8f9fc',
          text: '#141e37',
          muted: '#6b7280',
        }
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // US-361: Typographie 3 niveaux
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h1-mobile': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2-mobile': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.5', fontWeight: '500' }],
        'label': ['11px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      spacing: {
        // US-364: Échelle 4px
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
        '7': '48px',
        '8': '64px',
      },
      borderRadius: {
        // US-365: Coins arrondis uniformes
        'btn': '8px',
        'card': '12px',
        'modal': '16px',
        'input': '8px',
        'tooltip': '6px',
        'tag': '4px',
      },
      boxShadow: {
        // US-366: 3 niveaux d'ombre
        'elevation-1': '0 1px 3px rgba(12,22,41,0.08)',
        'elevation-2': '0 4px 12px rgba(12,22,41,0.12)',
        'elevation-3': '0 8px 24px rgba(12,22,41,0.16)',
      },
      keyframes: {
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(242,194,69,0)' },
          '50%': { boxShadow: '0 0 0 6px rgba(242,194,69,0.1)' },
        },
        'check-draw': {
          from: { strokeDashoffset: '100' },
          to: { strokeDashoffset: '0' },
        },
      },
      animation: {
        'slide-in': 'slide-in 200ms cubic-bezier(0.4,0,0.2,1)',
        'slide-up': 'slide-up 400ms cubic-bezier(0.4,0,0.2,1)',
        'fade-in': 'fade-in 200ms ease-out',
        'scale-in': 'scale-in 250ms cubic-bezier(0.4,0,0.2,1)',
        'shimmer': 'shimmer 1.5s infinite linear',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    }
  },
  plugins: []
};
