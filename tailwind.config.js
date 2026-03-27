/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2c3e50',
          foreground: '#ffffff',
          700: '#2c3e50',
          800: '#1e2b38',
          900: '#0f1820',
        },
        accent: {
          DEFAULT: '#8b6d4b',
          foreground: '#ffffff',
          700: '#4f3d28',
        },
        background: '#fafafa',
        foreground: '#3c3c3b',
        muted: {
          DEFAULT: '#f0f0f0',
          foreground: '#696969',
        },
        border: '#e1e1e1',
        input: '#e1e1e1',
        ring: '#2c3e50',
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

