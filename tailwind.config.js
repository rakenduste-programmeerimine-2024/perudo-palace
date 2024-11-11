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

