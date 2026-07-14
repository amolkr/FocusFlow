/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#18202e",
        mint: "#2fbf9a",
        coral: "#ff7a59",
        saffron: "#f4b740",
        skyglass: "#e4f5fa"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(20, 33, 61, 0.10)"
      }
    }
  },
  plugins: []
};