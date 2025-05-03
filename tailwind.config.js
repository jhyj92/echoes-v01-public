/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./data/**/*.{js,ts}" //  added in case you style via data-driven content (recommended for Echoes)
  ],
  theme: {
    extend: {
      colors: {
        gold: "#c8ae7d",
      },
      keyframes: {
        star: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "1000px 1000px" },
        },
      },
      animation: {
        starfield: "star 60s linear infinite",
      },
    },
  },
  plugins: [],
};
