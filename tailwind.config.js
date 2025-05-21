/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#006400',     /* Dark green */
        secondary: '#228B22',   /* Forest green */
        accent: '#FFC107',     /* NCCG yellow */
        dark: '#1A1A1A',       /* Almost black */
      },
    },
  },
  plugins: [],
}
