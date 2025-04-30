module.exports = {
  content: ["./pages/**/*.{tsx,ts}", "./components/**/*.{tsx,ts}"],
  theme: {
    extend: {
      colors: { gold: "#C8AE7D" },
      keyframes: {
        star: { "0%": { backgroundPosition: "0 0" }, "100%": { backgroundPosition: "1000px 1000px" } },
      },
      animation: { starfield: "star 60s linear infinite" },
    },
  },
  plugins: [],
};
