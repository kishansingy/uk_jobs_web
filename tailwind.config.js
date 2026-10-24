/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        nhs: {
          blue:       '#005EB8',
          'blue-dark':'#003D78',
          'blue-light':'#41B6E6',
          red:        '#CF101A',
          green:      '#007F3B',
          yellow:     '#FFB81C',
          warm:       '#F0F4F5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Frutiger', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
