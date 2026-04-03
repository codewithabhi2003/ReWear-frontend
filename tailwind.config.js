/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        syne:    ['Syne', 'sans-serif'],
        dm:      ['DM Sans', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        // Map Tailwind utilities to our CSS variables
        'bg-primary':   'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card':      'var(--bg-card)',
        'bg-input':     'var(--bg-input)',
        'bg-elevated':  'var(--bg-elevated)',
        'accent':       'var(--accent-primary)',
        'accent-green': 'var(--accent-green)',
        'accent-red':   'var(--accent-red)',
        'accent-yellow':'var(--accent-yellow)',
        'txt-primary':  'var(--text-primary)',
        'txt-secondary':'var(--text-secondary)',
        'txt-muted':    'var(--text-muted)',
        'bdr':          'var(--border)',
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card:       '0 4px 24px var(--shadow)',
        'card-hover':'0 12px 40px var(--shadow)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'slide-right':'slideRight 0.25s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:    { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideRight: { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
