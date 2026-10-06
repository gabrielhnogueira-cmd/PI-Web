module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fundo: "#e7e7e3",
        carvao: "#26292c",
        chamote: "#d3cbbd",
        copper: "#e86e32",
        "copper-deep": "#a8461a",
        ink: "#1b1d1f",
        soft: "#52565a",
        edge: "#7a7e82",
      },
      borderRadius: { bloco: "6px" },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        display: ['"IBM Plex Sans Condensed"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};