/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b100e",
          900: "#121916",
          800: "#1b2420",
          700: "#2a3832",
          500: "#5b6b64",
          400: "#7d8c84",
        },
        cream: {
          50: "#fbf7ef",
          100: "#f4efe4",
          200: "#e7dfcc",
          300: "#d4c8ab",
        },
        brass: {
          300: "#e0c57a",
          400: "#c9a44a",
          500: "#b08a32",
        },
        moss: {
          400: "#4f8a72",
          500: "#2f6b55",
          600: "#1f4d3d",
        },
        clay: {
          400: "#d97a4a",
          500: "#c45c26",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Outfit"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(18,25,22,0.04), 0 12px 32px -16px rgba(18,25,22,0.28)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.5)",
      },
      animation: {
        "star-movement-bottom":
          "star-movement-bottom linear infinite alternate",
        "star-movement-top": "star-movement-top linear infinite alternate",
      },
      keyframes: {
        "star-movement-bottom": {
          "0%": { transform: "translate(0%, 0%)", opacity: "1" },
          "100%": { transform: "translate(-100%, 0%)", opacity: "0" },
        },
        "star-movement-top": {
          "0%": { transform: "translate(0%, 0%)", opacity: "1" },
          "100%": { transform: "translate(100%, 0%)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
