/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#1e2a3a', light: '#2d3f55' },
        teal:    { DEFAULT: '#0f9b8e', light: '#14b5a5', 50: '#f0fdf9', 100: '#ccfbf1', 400: '#2dd4bf', 600: '#0d9488', 700: '#0f766e' },
        emerald: { DEFAULT: '#10b981', light: '#34d399' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(30,42,58,0.08), 0 4px 12px -2px rgba(30,42,58,0.04)',
        'card-hover': '0 4px 16px -2px rgba(30,42,58,0.14)',
        teal: '0 2px 8px rgba(15,155,142,0.35)',
      },
    },
  },
  plugins: [],
}
