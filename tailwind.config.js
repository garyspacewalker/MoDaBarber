/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0F0F10",
          blue:  "#3BB1FF",   // matches your logo's light blue
          white: "#FFFFFF",
        },
      },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,0.08)" },
      borderRadius: { "2xl": "1.25rem" },
    },
  },
  plugins: [],
};
