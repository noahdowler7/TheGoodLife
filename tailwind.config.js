/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF7EE',
          100: '#F5ECD5',
          200: '#EBDAAE',
          300: '#E0C787',
          400: '#D4A843',
          500: '#C49A3A',
          600: '#A37F2E',
          700: '#7D6223',
          800: '#574418',
          900: '#32270E',
        },
        spiritual: {
          DEFAULT: '#D4A843',
          light: 'rgba(212, 168, 67, 0.15)',
        },
        relational: {
          DEFAULT: '#E07B6A',
          light: 'rgba(224, 123, 106, 0.15)',
        },
        physical: {
          DEFAULT: '#5BB98B',
          light: 'rgba(91, 185, 139, 0.15)',
        },
        intellectual: {
          DEFAULT: '#6B8DE3',
          light: 'rgba(107, 141, 227, 0.15)',
        },
        financial: {
          DEFAULT: '#B07EE0',
          light: 'rgba(176, 126, 224, 0.15)',
        },
        dark: {
          50: '#F5F5F5',
          100: '#D4D4D4',
          200: '#A3A3A3',
          300: '#737373',
          400: '#525252',
          500: '#2A2A2A',
          600: '#1A1A1A',
          700: '#151515',
          800: '#111111',
          900: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
