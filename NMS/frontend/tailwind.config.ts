import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#88c241',
          sidebar: '#233c46',
          teal: '#273238',
        },
        surface: {
          page: '#acb0b1',
          card: '#ffffff',
          border: '#d1d5d6',
        },
        slate: {
          text: '#6f7a7f',
        },
        status: {
          danger: '#f83f37',
          warning: '#f5a623',
          success: '#3ec28f',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        lg: '8px',
        full: '9999px',
      },
    },
  },
} satisfies Config;
