/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // These pull directly from index.css
        main: "rgb(var(--bg-main) / <alpha-value>)",
        nav: "rgb(var(--bg-nav) / <alpha-value>)",
        "text-main": "rgb(var(--text-main) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "btn-bg": "rgb(var(--btn-bg) / <alpha-value>)",
        "btn-text": "rgb(var(--btn-text) / <alpha-value>)",
        "card-bg": "rgb(var(--card-bg) / <alpha-value>)",
      }
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
}