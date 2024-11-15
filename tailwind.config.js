/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'back-bg': "url('/image/background.jpg')",
        'smile-bg': "url('/image/smile.jpg')",
        'smile2-bg': "url('/image/smile2.jpg')",
        'smile3-bg': "url('/image/smil3.jpg')",
        'smile4-bg': "url('/image/smil4.jpg')",
        'table-bg': "url('/image/table.jpg')",
        'table2-bg': "url('/image/table_red.png')",
        'cup-bg': "url('/image/cup1.png')",
      },
    },
    backgroundSize: {
      'auto': 'auto',
      'cover': 'cover',
      'contain': 'contain',
      '50%': '50%',
      '16': '4rem',
    },
  },
  plugins: [],
}

