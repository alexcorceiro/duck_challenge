/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        duck: "#006D77",      // bleu canard
        duckDark: "#004e55",  // plus foncé
        duckLight: "#e0f3f4", // clair (accents si besoin)
      },
    },
  },
  plugins: [],
}
