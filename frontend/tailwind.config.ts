import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#141414',
          surface: '#1f1f1f',
          modal: '#2a2a2a',
          elevated: '#333333',
        },
        accent: {
          DEFAULT: '#e50914',
          hover: '#f6121d',
        },
        muted: '#808080',
      },
      fontFamily: {
        sans: ['Inter', 'Netflix Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '4px',
        btn: '2px',
      },
      boxShadow: {
        glow: '0 0 30px rgba(0,0,0,0.7), 0 0 60px rgba(229,9,20,0.15)',
        card: '0 6px 18px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
