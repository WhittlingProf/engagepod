/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        espresso: {
          DEFAULT: '#2C1810',
          light: '#4A2C2A',
          dark: '#1A0F0A'
        },
        parchment: {
          DEFAULT: '#F5E6D3',
          light: '#FDF8F3',
          dark: '#E8D4BE'
        },
        amber: {
          coffee: '#C4A77D',
          warm: '#D4A574',
          gold: '#B8860B'
        },
        ink: {
          DEFAULT: '#2D2424',
          faded: '#5C4B4B'
        },
        cream: '#FFF8E7',
        sepia: '#704214'
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Crimson Text', 'Georgia', 'serif'],
      },
      boxShadow: {
        'parchment': '0 4px 20px rgba(44, 24, 16, 0.15)',
        'card': '0 4px 12px rgba(44, 24, 16, 0.15)',
      },
    },
  },
  plugins: [],
}
