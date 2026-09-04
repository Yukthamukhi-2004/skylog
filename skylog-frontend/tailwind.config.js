/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1e90ff",
        accent: "#1e90ff",
        card: "#ffffff",
      },
      fontFamily: {
        sans: ["Rubik_400Regular"],
        medium: ["Rubik_500Medium"],
        bold: ["Rubik_700Bold"],
      },
    },
  },
  plugins: [],
};
