/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#006400',     /* Dark green */
        secondary: '#228B22',   /* Forest green */
        accent: '#FFD700',     /* Gold/yellow */
        dark: '#1A1A1A',       /* Almost black */
      },
    },
  },
  plugins: [],
}
