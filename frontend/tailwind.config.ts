import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette principale
        'the-green': '#2C5545',        // Vert Signature
        'the-gold': '#D4B254',         // Doré Premium  
        'the-beige': '#F5F1E6',        // Beige Délicat
        'the-dark-green': '#1A3A2E',   // Vert Foncé
        'the-gray': '#3A3A3A',         // Gris Anthracite
        
        // Palette sémantique
        'the-success': '#2ECC71',
        'the-warning': '#F39C12',
        'the-error': '#E74C3C',
        'the-info': '#3498DB',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'lato': ['Lato', 'sans-serif'],
      },
      fontSize: {
        'h1': ['72px', { lineHeight: '1.2', letterSpacing: '0.08em' }],
        'h2': ['48px', { lineHeight: '1.3' }],
        'h3': ['36px', { lineHeight: '1.4' }],
        'h4': ['24px', { lineHeight: '1.4' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'nav': ['14px', { lineHeight: '1.5' }],
        'caption': ['12px', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '8px',
      },
      boxShadow: {
        'button': '0 4px 12px rgba(44, 85, 69, 0.15)',
        'button-hover': '0 6px 16px rgba(44, 85, 69, 0.2)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'gold-glow': '0 0 20px rgba(212, 178, 84, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 1s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'confetti': 'confetti 3s ease-out',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        confetti: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #D4B254 0%, #F4E4BC 100%)',
        'gradient-green': 'linear-gradient(135deg, #2C5545 0%, #3D6B56 100%)',
        'tea-pattern': "url('/images/tea-pattern.svg')",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}