/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "var(--ivory)",
        "ivory-deep": "var(--ivory-deep)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        terracotta: "var(--terracotta)",
        seafoam: "var(--seafoam)",
        gold: "var(--gold)",
        sand: "var(--sand)",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        body: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
