import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      colors: {
        veda: {
          ink: '#0E0E0E',
          paper: '#FFFFFF',
          surface: '#F7F7F7',
          muted: '#F0F0F0',
          border: '#E5E5E5',
          subtle: '#8A8A8A',
          accent: '#FF6A1A', // orange brand
          accent2: '#FF8A3D',
          dark: '#0E0E0E',
          easy: '#10B981',
          moderate: '#F59E0B',
          challenging: '#EF4444',
        },
      },
      boxShadow: {
        card: '0 32px 48px 0 rgba(0,0,0,0.20)',
        soft: '0 4px 16px 0 rgba(0,0,0,0.06)',
        glow: '0 8px 24px 0 rgba(255,106,26,0.35)',
      },
      borderRadius: {
        xl2: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
