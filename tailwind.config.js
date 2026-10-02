module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#11110f",
        panel: "#1b1b18",
        paper: "#f0ede6",
        muted: "#aaa69d",
        copper: "#e86e32",
        line: "#393833",
      },
      fontFamily: {
        display: ["Arial Narrow", "Trebuchet MS", "sans-serif"],
        editorial: ["Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};